//
// Module : MMM-GoogleAssistant v3
//

const exec = require("child_process").exec
const fs = require("fs")
const path = require("path")
const Assistant = require("./components/assistant.js")
const ScreenParser = require("./components/screenParser.js")
const { getPlatform } = require("./components/platform.js")
const isPi = require("detect-rpi")

logGA = (...args) => { /* do nothing */ }
logEXT = (...args) => { /* do nothing */ }

var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function () {
    this.EXT = {}
    this.config = {}
    this.PiVersion = false
    this.blank = {}
    this.timeout = null
    this.retry = null
    this.YouTube = null
    this.YT = 0
    this.checkConfigMerge()
    this.retryPlayerCount = 0
    this.PLATFORM_RECORDER = new Map()
    this.PLATFORM_RECORDER.set("linux", "arecord")
    this.PLATFORM_RECORDER.set("mac", "sox")
    this.PLATFORM_RECORDER.set("raspberry-pi", "arecord")
    this.PLATFORM_RECORDER.set("windows", "sox")
  },

  socketNotificationReceived: function (noti, payload) {
    switch (noti) {
      case "INIT":
        console.log("[GA] MMM-GoogleAssistant Version:", require('./package.json').version, "rev:", require('./package.json').rev)
        this.initialize(payload)
        break
      case "ACTIVATE_ASSISTANT":
        this.activateAssistant(payload)
        break
      case "SHELLEXEC":
        var command = payload.command
        if (!command) return console.log("[GA] ShellExec: no command to execute!")
        command += (payload.options) ? (" " + payload.options) : ""
        exec (command, (e,so,se)=> {
          logGA("ShellExec command:", command)
          if (e) {
            console.log("[GA] ShellExec Error:" + e)
            this.sendSocketNotification("WARNING", { message: "ShellExecError"} )
          }

          logGA("SHELLEXEC_RESULT", {
            executed: payload,
            result: {
              error: e,
              stdOut: so,
              stdErr: se,
            }
          })
        })
        break
      case "YouTube_SEARCH":
        if (payload) this.YoutubeSearch(payload)
        break

      /** Extented **/

      /** Screen module **/
      case "SCREEN_LOCK":
        if (this.screen) {
          if (payload) this.screen.lock()
          else this.screen.unlock()
        }
        break
      case "SCREEN_STOP":
        if (this.screen) this.screen.stop()
        break
      case "SCREEN_RESET":
        if (this.screen) this.screen.reset()
        break
      case "SCREEN_WAKEUP":
        if (this.screen) this.screen.wakeup()
        break
      case "SCREEN_FORCE_END":
        if (this.screen) this.screen.forceEnd()
        break

      /** Spotify module **/
      case "SPOTIFY_RETRY_PLAY":
        clearTimeout(this.timeout)
        this.timeout= null
        clearTimeout(this.retry)
        this.retry = null
        this.retry = setTimeout(() => {
          this.spotify.play(payload, (code, error, result) => {
            if ((code == 404) && (result.error.reason == "NO_ACTIVE_DEVICE")) {
              logEXT("[SPOTIFY] RETRY playing...")
              this.socketNotificationReceived("SPOTIFY_PLAY", payload)
            }
            if ((code !== 204) && (code !== 202)) {
              if (this.config.Extented.spotify.player.type == "Librespot") this.sendSocketNotification("WARNING", { message: "LibrespotNoResponse", values: this.config.Extented.deviceName })
              if (this.config.Extented.spotify.player.type == "Raspotify") this.sendSocketNotification("WARNING", { message: "RaspotifyNoResponse", values: this.config.Extented.deviceName })
              return console.log("[SPOTIFY:PLAY] RETRY Error", code, error, result)
            }
            else {
              logEXT("[SPOTIFY] RETRY: DONE_PLAY")
              this.retryPlayerCount = 0
              if (this.config.Extented.spotify.player.type == "Librespot") this.sendSocketNotification("INFORMATION", { message: "LibrespotConnected", values: this.config.Extented.deviceName })
              if (this.config.Extented.spotify.player.type == "Raspotify") this.sendSocketNotification("INFORMATION", { message: "RaspotifyConnected", values: this.config.Extented.deviceName })
            }
          })
        }, 3000)
        break
      case "SPOTIFY_PLAY":
        this.spotify.play(payload, (code, error, result) => {
          clearTimeout(this.timeout)
          this.timeout= null
          if ((code == 404) && (result.error.reason == "NO_ACTIVE_DEVICE")) {
            this.retryPlayerCount++
            if (this.retryPlayerCount >= 4) return this.retryPlayerCount = 0
            if (this.config.Extented.spotify.player.type == "Librespot") {
              console.log("[SPOTIFY] No response from librespot !")
              this.sendSocketNotification("INFORMATION", { message: "LibrespotConnecting" })
              this.Librespot(true)
              this.timeout= setTimeout(() => {
                this.socketNotificationReceived("SPOTIFY_TRANSFER", this.config.Extented.deviceName)
                this.socketNotificationReceived("SPOTIFY_RETRY_PLAY", payload)
              }, 3000)
            }
            if (this.config.Extented.spotify.player.type == "Raspotify") {
              console.log("[SPOTIFY] No response from raspotify !")
              this.sendSocketNotification("INFORMATION", { message: "RaspotifyConnecting" })
              this.Raspotify(true)
              this.timeout= setTimeout(() => {
                this.socketNotificationReceived("SPOTIFY_TRANSFER", this.config.Extented.deviceName)
                this.socketNotificationReceived("SPOTIFY_RETRY_PLAY", payload)
              }, 3000)
            }
          }
          if ((code !== 204) && (code !== 202)) {
            return console.log("[SPOTIFY:PLAY] Error", code, result)
          }
          else {
            logEXT("[SPOTIFY] DONE_PLAY")
            this.retryPlayerCount = 0
          }
        })
        break
      case "SPOTIFY_VOLUME":
        this.spotify.volume(payload, (code, error, result) => {
          if (code !== 204) console.log("[SPOTIFY:VOLUME] Error", code, result)
          else {
            this.sendSocketNotification("DONE_SPOTIFY_VOLUME", payload)
            logEXT("[SPOTIFY] DONE_VOLUME:", payload)
          }
        })
        break
      case "SPOTIFY_PAUSE":
        this.spotify.pause((code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:PAUSE] Error", code, result)
          else logEXT("[SPOTIFY] DONE_PAUSE")
        })
        break
      case "SPOTIFY_TRANSFER":
        this.spotify.transferByName(payload, (code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:TRANSFER] Error", code, result)
          else logEXT("[SPOTIFY] DONE_TRANSFER")
        })
        break
      case "SPOTIFY_STOP":
        if (this.config.Extented.spotify.player.type == "Librespot") this.LibrespotRestart()
        if (this.config.Extented.spotify.player.type == "Raspotify") this.Raspotify(true)
        break
      case "SPOTIFY_NEXT":
        this.spotify.next((code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:NEXT] Error", code, result)
          else logEXT("[SPOTIFY] DONE_NEXT")
        })
        break
      case "SPOTIFY_PREVIOUS":
        this.spotify.previous((code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:PREVIOUS] Error", code, result)
          else logEXT("[SPOTIFY] DONE_PREVIOUS")
        })
        break
      case "SPOTIFY_SHUFFLE":
        this.spotify.shuffle(payload,(code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:SHUFFLE] Error", code, result)
          else logEXT("[SPOTIFY] DONE_SHUFFLE")
        })
        break
      case "SPOTIFY_REPEAT":
        this.spotify.repeat(payload, (code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:REPEAT] Error", code, result)
          else logEXT("[SPOTIFY] DONE_REPEAT")
        })
        break
      case "SEARCH_AND_PLAY":
        logEXT("[SPOTIFY] Search and Play", payload)
        this.searchAndPlay(payload.query, payload.condition)
        break

      /** YouTube module **/
      case "VLC_YOUTUBE":
        this.playWithVlc(payload)
        break
      case "YT_STOP":
        this.CloseVlc()
        break
      case "YT_VOLUME":
        this.VolumeVLC(payload)
        break
      /** Music module **/
      case "MUSIC_PLAY":
        this.PlayMusic()
        break
      case "MUSIC_STOP":
        this.StopMusic()
        break
      case "MUSIC_PAUSE":
        this.PauseMusic()
        break
      case "MUSIC_NEXT":
        this.NextMusic()
        break
      case "MUSIC_PREVIOUS":
        this.PreviousMusic()
        break
      case "MUSIC_VOLUME_TARGET":
        this.config.Extented.music.maxVolume = payload // informe helper
        this.VolumeNewMax(payload)
      case "MUSIC_VOLUME":
        this.VolumeMusic(payload)
        break
      case 'MUSIC_REBUILD':
        this.RebuildMusic()
        break
      case 'MUSIC_SWITCH':
        this.SwitchMusic()
        break
      /** Restart with pm2 **/
      case "RESTART":
        this.pm2Restart(payload)
        break
      /** GPhotos callbacks **/
      case "GP_MORE_PICTS":
      case "GP_LOAD_FAIL":
        if (this.photos) this.photos.prepAndSendChunk(Math.ceil(20*60*1000/this.config.Extented.photos.displayDelay))
        break
    }
  },

  tunnel: function(payload) {
    this.sendSocketNotification("TUNNEL", payload)
  },

  activateAssistant: function(payload) {
    logGA("ASSISTANT_QUERY:", payload)
    var assistantConfig = Object.assign({}, this.config.assistantConfig)
    assistantConfig.debug = this.config.debug
    assistantConfig.lang = payload.lang
    assistantConfig.useScreenOutput = payload.useResponseOutput
    assistantConfig.useAudioOutput = payload.useAudioOutput
    assistantConfig.micConfig = this.config.micConfig
    this.assistant = new Assistant(assistantConfig, (obj)=>{this.tunnel(obj)})

    var parserConfig = {
      responseOutputCSS: this.config.responseConfig.responseOutputCSS,
      responseOutputURI: "tmp/responseOutput.html",
      responseOutputZoom: this.config.responseConfig.zoom.responseOutput
    }
    var parser = new ScreenParser(parserConfig, this.config.debug)
    var result = null
    this.assistant.activate(payload, (response)=> {
      response.lastQuery = payload

      if (!(response.screen || response.audio)) {
        if (!response.audio && !response.screen && !response.text) response.error.error = "NO_RESPONSE"
        if (response.transcription && response.transcription.transcription && !response.transcription.done) {
          response.error.error = "TRANSCRIPTION_FAILS"
        }
      }
      if (response && response.error.audio && !response.error.message) response.error.error = "TOO_SHORT"
      if (response.screen) {
        parser.parse(response, (result)=>{
          delete result.screen.originalContent
          logGA("ASSISTANT_RESULT", result)
          this.sendSocketNotification("ASSISTANT_RESULT", result)
        })
      } else {
        logGA("ASSISTANT_RESULT", response)
        this.sendSocketNotification("ASSISTANT_RESULT", response)
      }
    })
  },

  checkConfigMerge: function () {
    console.log("[GA] Read config.js and check ConfigDeepMerge...")
    let file = path.resolve(__dirname, "../../config/config.js")
    if (fs.existsSync(file)) MMConfig = require(file)
    let configModule = MMConfig.modules.find(m => m.module == "MMM-GoogleAssistant")
    if (!configModule.configDeepMerge) {
      console.error("[FATAL] MMM-GoogleAssistant Module Configuration Error: ConfigDeepMerge is not actived !")
      console.error("[GA] Please review your MagicMirror config.js file!")
      process.exit(1)
    }
    console.log("[GA] Perfect ConfigDeepMerge activated!")
    if (configModule.dev) {
      this.blank.dev= true
      console.log("[GA] Hi, developer!")
    }
    //else {
    //  console.error("[FATAL] Please use `prod` branch for MMM-GoogleAssistant")
    //  console.error("[GA] You can't use this branch, it's reserved to developers.")
    //  process.exit(255)
    //}
  },

  initialize: async function (config) {
    this.config = config
    this.config.assistantConfig["modulePath"] = __dirname
    var error = null
    if (this.config.debug) {
      logGA = (...args) => { console.log("[GA]", ...args) }
      logEXT = (...args) => { console.log("[GA:EXT]", ...args) }
    }
    let Version = {
      version: require('./package.json').version,
      rev: require('./package.json').rev
    }

    if (!fs.existsSync(this.config.assistantConfig["modulePath"] + "/credentials.json")) {
      error = "[FATAL] Assistant: credentials.json file not found !"
      return this.DisplayError(error, {message: "GAErrorCredentials"})
    }
    else if (!fs.existsSync(this.config.assistantConfig["modulePath"] + "/tokens/tokenGA.json")) {
      error = "[FATAL] Assistant: tokenGA.json file not found !"
      return this.DisplayError(error, {message: "GAErrorTokenGA"})
    }

    let platform
    try {
      platform = getPlatform()
    } catch (error) {
      console.error("[GA] Google Assistant does not support this platform. Supported platforms include macOS (x86_64), Windows (x86_64), Linux (x86_64), and Raspberry Pi")
      process.exit(1)
      return
    }
    let recorderType = this.PLATFORM_RECORDER.get(platform)
    console.log(`[GA] Platform: '${platform}'; attempting to use '${recorderType}' to access microphone ...`)
    this.config.micConfig.recorder= recorderType

    let piNumber = await this.getVersion()
    let _Force= piNumber < 4 ? "[Force]" : ""
    let bugsounet = await this.loadBugsounetLibrary()
    if (bugsounet) {
      console.error("[GA] Warning:", bugsounet, "@bugsounet library not loaded !")
      console.error("[GA] Try to solve it with `npm run rebuild` in GA directory")
    }
    else {
      console.log("[GA] All needed @bugsounet library loaded !")
    }

    if (this.PiVersion) {
      console.log("[GA:EXT]" + _Force + " Extented Display Server Starts...")
      await this.Extented()
      console.log("[GA:EXT]" + _Force + " Extented Display is initialized.")
    } else {
      setTimeout(() => {
        console.error("[GA][FATAL] This version of MMM-GoogleAssistant is not compatible for your system!")
        console.error("[GA][FATAL] Use `npm run light` inside MMM-GoogleAssistant directory")
        process.exit(1)
      }, 10000)
      return this.sendSocketNotification("NOT_INITIALIZED", { message: "[FATAL] This version is not compatible for your system!", values: 255 })
    }

    if (this.config.Extented.youtube.useYoutube) {
      try {
        const CREDENTIALS = this.EXT.readJson(this.config.assistantConfig["modulePath"] + "/credentials.json")
        const TOKEN = this.EXT.readJson(this.config.assistantConfig["modulePath"] + "/tokens/tokenYT.json")
        let oauth = this.EXT.YouTubeAPI.authenticate({
          type: "oauth",
          client_id: CREDENTIALS.installed.client_id,
          client_secret: CREDENTIALS.installed.client_secret,
          redirect_url: CREDENTIALS.installed.redirect_uris,
          access_token: TOKEN.access_token,
          refresh_token: TOKEN.refresh_token,
        })
        console.log("[GA] YouTube Search Function initilized.")
      } catch (e) {
        console.log("[GA] " + e)
        error = "[FATAL] Youtube: tokenYT.json file not found !"
        return this.DisplayError(error, {message: "GAErrorTokenYoutube", values: "tokenYT.json"})
      }
    }

    this.loadRecipes(()=> this.sendSocketNotification("INITIALIZED", Version))
    if (this.config.NPMCheck.useChecker && this.EXT.npmCheck) {
      var cfg = {
        dirName: __dirname,
        moduleName: this.name,
        timer: this.config.NPMCheck.delay,
        debug: this.config.debug
      }
      this.Checker= new this.EXT.npmCheck(cfg, update => this.sendSocketNotification("NPM_UPDATE", update))
    }
    console.log("[GA] Google Assistant is initialized.")
  },

  loadRecipes: function(callback=()=>{}) {
    if (this.config.recipes) {
      let replacer = (key, value) => {
        if (typeof value == "function") {
          return "__FUNC__" + value.toString()
        }
        return value
      }
      var recipes = this.config.recipes
      var error = null
      for (var i = 0; i < recipes.length; i++) {
        try {
          var p = require("./recipes/" + recipes[i]).recipe
          this.sendSocketNotification("LOAD_RECIPE", JSON.stringify(p, replacer, 2))
          console.log("[GA] RECIPE_LOADED:", recipes[i])
        } catch (e) {
          error = `[FATAL] RECIPE_ERROR (${recipes[i]})`
          return this.DisplayError(error, {message: "GAErrorRecipe", values: recipes[i]}, e)
        }
      }
      callback()
    } else {
      logGA("NO_RECIPE_TO_LOAD")
      callback()
    }
  },

 /** YouTube Search **/
  YoutubeSearch: async function (query) {
    try {
      var results = await this.EXT.YouTubeAPI.search.list({q: query, part: 'snippet', maxResults: 1, type: "video"})
      var item = results.data.items[0]
      var title = this.EXT.he.decode(item.snippet.title)
      console.log('[GA] Found YouTube Title: %s - videoId: %s', title, item.id.videoId)
      this.sendSocketNotification("YouTube_RESULT", item.id.videoId)
      this.sendSocketNotification("INFORMATION", { message: "YouTubePlaying", values: title })
    } catch (e) {
      console.log("[GA] YouTube Search error: ", e.toString())
      this.sendSocketNotification("WARNING", { message: "YouTubeError", values: e.toString() })
    }
  },

  DisplayError: function (err, error, details = null) {
    if (details) console.log("[GA][ERROR]" + err, details.message, details)
    else console.log("[GA][ERROR]" + err)
    return this.sendSocketNotification("NOT_INITIALIZED", { message: error.message, values: error.values })
  },

  getVersion: function() {
    return new Promise((resolve) => {
      var model = null
      if (isPi()) {
        exec ("cat /sys/firmware/devicetree/base/model", (err, stdout, stderr)=> {
          if (err == null) {
            var type = stdout.trim()
            var str = type.split(' ')
            str.splice(3,10) // delete rev num // rev display // model
            let PiModel = str.join(" ")
            console.log("[GA] Detected:", PiModel)
            str= str.slice(2, 3) // keep only pi number
            var type = str.join()
            model= parseInt(type) ? parseInt(type): 0
            this.PiVersion = (model >=4 || this.blank.dev) ? true : false
            resolve(this.blank.dev ? 999 : model)
          } else {
            console.log("[GA] Error Can't determinate RPI version!")
            this.PiVersion = this.blank.dev ? true : false
            resolve(1)
          }
        })
      } else {
        console.log("[GA] You are not using a pi :)")
        this.PiVersion = true
        resolve(999)
      }
    })
  },

  /*****************/
  /** Extented *****/
  /*****************/

  Extented: function() {
    var callbacks= {
      "sendSocketNotification": (noti, params) => {
        this.sendSocketNotification(noti, params)
      },
      "screen": (param) => {
        if (this.screen && param == "WAKEUP") this.screen.wakeup()
      },
      "governor": (param) => {
        if (this.governor && param == "GOVERNOR_SLEEPING") this.governor.sleeping()
        if (this.governor && param == "GOVERNOR_WORKING") this.governor.working()
        if (this.governor && param.error) this.sendSocketNotification("WARNING", { message: "GovernorError", values: param.error})
      },
      "pir": (noti,param) => {
        if (this.screen && this.pir && noti == "PIR_DETECTED") this.screen.wakeup()
        if (this.screen && this.pir && noti == "PIR_ERROR") {
          this.sendSocketNotification("WARNING", { message: "PirError", values: param.code })
        }
      }
    }

    if (this.config.Extented.screen.useScreen && this.EXT.Screen) {
      logEXT("Starting Screen module...")
      this.screen = new this.EXT.Screen(this.config.Extented.screen, callbacks.sendSocketNotification, this.config.debug, callbacks.sendSocketNotification, callbacks.governor)
      this.screen.activate()
    }
    if (this.config.Extented.pir.usePir && this.EXT.Pir) {
      logEXT("Starting Pir module...")
      this.pir = new this.EXT.Pir(this.config.Extented.pir, callbacks.pir, this.config.debug)
      this.pir.start()
    }
    if (this.config.Extented.governor.useGovernor && this.EXT.Governor) {
      logEXT("Starting Governor module...")
      this.governor = new this.EXT.Governor(this.config.Extented.governor, callbacks.governor, this.config.debug)
      this.governor.start()
    }
    if (this.config.Extented.internet.useInternet && this.EXT.Internet) {
      logEXT("Starting Internet module...")
      this.internet = new this.EXT.Internet(this.config.Extented.internet, callbacks.sendSocketNotification, this.config.debug)
      this.internet.start()
    }
    if (this.config.Extented.cast.useCast && this.EXT.CastServer) {
      logEXT("Starting Cast module...")
      if (this.config.Extented.deviceName) {
        this.config.Extented.cast.castName = this.config.Extented.deviceName
        this.cast = new this.EXT.CastServer(this.config.Extented.cast, callbacks.sendSocketNotification, this.config.debug)
        this.cast.start()
      } else {
        this.sendSocketNotification("WARNING" , {  message: "Cast: deviceName error" } )
      }
    }
    if (this.config.Extented.spotify.useSpotify && this.EXT.Spotify) {
      logEXT("Starting Spotify module...")
      try {
        this.spotify = new this.EXT.Spotify(this.config.Extented.spotify.visual, callbacks.sendSocketNotification, this.config.debug)
        this.spotify.start()
      } catch (e) {
        console.log("[EXT] Spotify " + e)
        error = "Spotify: tokenSpotify.json file not found !"
        this.sendSocketNotification("WARNING" , {  message: error } )
      }
      if (this.config.Extented.spotify.player.type == "Librespot") {
        console.log("[SPOTIFY] Launch Librespot...")
        this.Librespot(true)
      } else if (this.config.Extented.spotify.player.type == "Raspotify") {
        this.raspotify = new this.EXT.Systemd("raspotify")
        console.log("[SPOTIFY] Launch Raspotify...")
        this.Raspotify(true)
      }
      else { console.log("[SPOTIFY] No player activated.") }
    }
    if (this.config.Extented.photos.usePhotos && this.config.Extented.photos.useGooglePhotosAPI && this.EXT.GPhotos) {
      logEXT("Starting GooglePhotosAPI module...")
      try {
        this.config.Extented.photos.CREDENTIALS = this.config.assistantConfig["modulePath"] + "/credentials.json"
        this.config.Extented.photos.TOKEN = this.config.assistantConfig["modulePath"] + "/tokens/tokenGP.json"
        this.config.Extented.photos.CACHE = this.config.assistantConfig["modulePath"] + "/tmp"
        this.photos = new this.EXT.GPhotos(this.config.Extented.photos, this.config.debug, callbacks.sendSocketNotification)
        this.photos.start()
      } catch (e) {
        console.log("[EXT] Google Photos " + e)
        error = "Google Photos: tokenGP.json file not found !"
        this.sendSocketNotification("WARNING" , {  message: error } )
      }
    }
    if (this.config.Extented.music.useMusic) {
      logEXT("Starting Music module...")
      try {
        this.config.Extented.music.modulePath = this.config.assistantConfig["modulePath"]
        this.music = new this.EXT.MusicPlayer(this.config.Extented.music, this.config.debug, callbacks)
        this.music.start()
      } catch (e) { console.log("[EXT] Music " + e) } // testing
    }
  },

  /** launch librespot with pm2 **/
  Librespot: function(restart= false) {
    var file = "librespot"
    var filePath = path.resolve(__dirname, "components/librespot/target/release", file)
    var cacheDir = __dirname + "/components/librespot/cache"
    if (!fs.existsSync(filePath)) {
      console.log("[LIBRESPOT] librespot is not installed !")
      this.sendSocketNotification("WARNING" , { message: "LibrespotNoInstalled" })
      return
    }
    this.EXT.pm2.connect((err) => {
      if (err) return console.log(err)
      console.log("[PM2] Connected!")
      this.EXT.pm2.list((err,list) => {
        if (err) return console.log(err)
        if (list && Object.keys(list).length > 0) {
          for (let [item, info] of Object.entries(list)) {
            if (info.name == "librespot" && info.pid) {
              let deleted = false
              if (restart) {
                this.EXT.pm2.delete("librespot" , (err) => {
                  if (err) console.log("[PM2] Librespot Process not found")
                  else {
                    console.log("[PM2] Librespot Process deleted! (refreshing ident)")
                    deleted= true
                    this.Librespot() // recreate process with new ident !
                  }
                })
              }
              if (deleted) return
              else return console.log("[PM2] librespot already launched")
            }
          }
        }
        this.EXT.pm2.start({
          script: filePath,
          name: "librespot",
          out_file: "/dev/null",
          args: [
            "-n", this.config.Extented.deviceName,
            "-u", this.config.Extented.spotify.player.email,
            "-p", this.config.Extented.spotify.player.password,
            "--initial-volume" , this.config.Extented.spotify.player.maxVolume,
            "-c", cacheDir
          ]
        }, (err, proc) => {
          if (err) {
            this.sendSocketNotification("WARNING" , { message: "LibrespotError", values: err.toString() })
            console.log("[LIBRESPOT] " + err)
            return
          }
          console.log("[PM2] Librespot started !")
        })
      })
    })
    process.on('exit', (code) => {
      // try to kill librespot on exit ... or not ...
      this.EXT.pm2.stop("librespot", (e,p) => {
        console.log("[LIBRESPOT] Killed")
      })
    })
  },

  LibrespotRestart() {
    this.EXT.pm2.restart("librespot", (err, proc) => {
      if (err) console.log("[PM2] librespot error: " + err)
      else logEXT("[PM2] Restart librespot")
    })
  },

  Raspotify: async function (force = false) {
    if (!this.raspotify) {
      this.sendSocketNotification("WARNING" , { message: "RaspotifyError", values: "systemd library error" })
      return console.log("[RASPOTIFY] systemd library error!")
    }
    const RaspotifyStatus = await this.raspotify.status()
    if (RaspotifyStatus.error) {
      this.sendSocketNotification("WARNING" , { message: "RaspotifyNoInstalled" })
      return console.error("[RASPOTIFY] Error: Raspotify is not installed!")
    }
    if (RaspotifyStatus.state == "running" && !force) return console.log("[RASPOTIFY] Raspotify already running")
    // restart respotify service
    console.log("[RASPOTIFY] Raspotify Force Restart")

    const RaspotifyRestart = await this.raspotify.restart()
    if (RaspotifyRestart.error) {
      this.sendSocketNotification("WARNING" , { message: "RaspotifyError", values: "restart failed!" })
      console.log("[RASPOTIFY] Error when restart Raspotify!")
    }
  },

  /** Spotify Search sub-function **/
  searchAndPlay: function (param, condition) {
    if (!param.type) {
      param.type = "artist,track,album,playlist"
    } else {
      param.type = param.type.replace(/\s/g, '')
    }
    if (!param.q) {
      param.q = "something cool"
    }
    var pickup = (items, random, retType) => {
      var ret = {}
      var r = (random)
        ? items[Math.floor(Math.random() * items.length)]
        : items[0]
        if (r.uri) {
          ret[retType] = (retType == "uris") ? [r.uri] : r.uri
          return ret
        } else {
          console.log("[SPOTIFY] Unplayable item: ", r)
          return false
      }
    }
    this.spotify.search(param, (code, error, result) => {
      var foundForPlay = null
      if (code == 200) { //When success
        const map = {
          "tracks": "uris",
          "artists": "context_uri",
          "albums": "context_uri",
          "playlists": "context_uri"
        }
        for (var section in map) {
          if (map.hasOwnProperty(section) && !foundForPlay) {
            var retType = map[section]
            if (result[section] && result[section].items.length > 1) {
              foundForPlay = pickup(result[section].items, condition.random, retType)
            }
          }
        }
        if (foundForPlay && condition.autoplay) {
          logEXT("[SPOTIFY] Search and Play Result:", foundForPlay)
          this.socketNotificationReceived("SPOTIFY_PLAY", foundForPlay)
        } else {
          logEXT("[SPOTIFY] Search and Play No Result")
          this.sendSocketNotification("WARNING" , { message: "SpotifyNoResult" })
        }
      } else { //when fail
        console.log("[GA:EXT] [SPOTIFY] Search and Play failed !")
        this.sendSocketNotification("WARNING" , { message: "SpotifySearchFailed" })
      }
    })
  },

  /** youtube control with VLC **/
  playWithVlc: function (link) {
    this.YT++
    if (this.YouTube) this.CloseVlc()
    this.YouTube = new this.EXT.cvlc()
    this.YouTube.play(
      link,
      ()=> {
        logEXT("[YouTube] Found link:", link)
         if (this.YouTube) this.YouTube.cmd("volume "+ this.config.Extented.youtube.maxVolume)
      },
      ()=> {
        this.YT--
        if (this.YT < 0) this.YT = 0
        logEXT("[YouTube] Video ended #" + this.YT)
        if (this.YT == 0) {
          logEXT("[YouTube] Finish !")
          this.sendSocketNotification("FINISH_YOUTUBE")
          this.YouTube = null
        }
      }
    )
  },

  CloseVlc: function () {
    if (this.YouTube) {
      logEXT("[YouTube] Force Closing VLC...")
      this.YouTube.destroy()
      this.YouTube = null
      logEXT("[YouTube] Done Closing VLC...")
    }
    else {
      logEXT("[YouTube] Not running!")
    }
  },

  VolumeVLC: function(volume) {
    if (this.YouTube) {
      logEXT("[YouTube] Set VLC Volume to:", volume)
      this.YouTube.cmd("volume " + volume)
    }
  },

  StopMusic: function() {
    if (this.music) {
      this.music.setStop()
    }
  },

  PlayMusic: function () {
    this.music.setPlay()
  },

  PauseMusic: function() {
    if (this.music) {
      this.music.setPause()
    }
  },

  PreviousMusic: function() {
    if (this.music) {
      this.music.setPrevious()
    }
  },

  NextMusic: function() {
    if (this.music) {
      this.music.setNext()
    }
  },

  VolumeNewMax: function (max) {
    this.music.setNewMax(this.config.Extented.music.maxVolume)
  },

  VolumeMusic: function(volume) {
    if (this.music) {
      this.music.setVolume(volume)
    }
  },

  RebuildMusic: function() {
    this.music.rebuild()
  },

  SwitchMusic: function() {
    this.music.setSwitch()
  },


  pm2Restart: function(id) {
    var pm2 = "pm2 restart " + id
    exec (pm2, (err, stdout, stderr)=> {
      if (err) console.log("[GA:EXT:PM2] " + err)
      else logEXT("[PM2] Restart", id)
    })
  },

  /** Load require @busgounet library **/
  /** It will not crash MM (black screen) **/
  loadBugsounetLibrary: function() {
    let libraries= [
      // { "library to load" : [ "store library name", "path to check", needed without EXT ?] }
      { "@bugsounet/npmcheck": [ "npmCheck", "NPMCheck.useChecker", true ] },
      { "@bugsounet/screen": [ "Screen", "Extented.screen.useScreen", false ] },
      { "@bugsounet/pir": [ "Pir", "Extented.pir.usePir", false ] },
      { "@bugsounet/governor": [ "Governor", "Extented.governor.useGovernor", false ] },
      { "@bugsounet/internet": [ "Internet", "Extented.internet.useInternet", false ] },
      { "@bugsounet/cast": [ "CastServer", "Extented.cast.useCast", false ] },
      { "@bugsounet/cvlc": [ "cvlc", "Extented.youtube.useVLC", false ] },
      { "@bugsounet/google-photos" : [ "GPhotos", "Extented.photos.useGooglePhotosAPI", false ] },
      { "@bugsounet/spotify": [ "Spotify", "Extented.spotify.useSpotify", false ] },
      { "@bugsounet/systemd": [ "Systemd", "Extented.spotify.useSpotify", false ] },
      { "@bugsounet/cvlcmusicplayer": ["MusicPlayer", "Extented.music.useMusic", false ] },
      { "pm2": [ "pm2", "Extented.spotify.useSpotify", false ] },
      { "youtube-api": [ "YouTubeAPI", "Extented.youtube.useYoutube", false ] },
      { "he": [ "he", "Extented.youtube.useYoutube", false ] },
      { "r-json": [ "readJson","Extented.youtube.useYoutube", false ] }
    ]

    let errors = 0
    return new Promise(resolve => {
      libraries.forEach(library => {
        for (const [name, configValues] of Object.entries(library)) {
          let libraryToLoad = name,
              libraryName = configValues[0],
              libraryPath = configValues[1],
              libraryNeeded = configValues[2], // needed without EXT ?
              index = (obj,i) => { return obj[i] }

          // reverse condition if EXT
          if (!libraryNeeded && this.PiVersion) libraryNeeded = true

          // libraryActivate: verify if the needed path of config is activated (result of reading config value: true/false) **/
          let libraryActivate = libraryNeeded && libraryPath.split(".").reduce(index,this.config) 
          if (libraryActivate) {
            try {
              if (!this.EXT[libraryName]) {
                this.EXT[libraryName] = require(libraryToLoad)
                logGA("Loaded " + libraryToLoad)
              }
            } catch (e) {
              console.error("[GA]", libraryToLoad, "Loading error!" , e)
              this.sendSocketNotification("WARNING" , {message: "LibraryError", values: libraryToLoad })
              errors++
            }
          }
        }
      })
      resolve(errors)
    })
  }
})
