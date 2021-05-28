//
// Module : MMM-GoogleAssistant v3
//

const exec = require("child_process").exec
const fs = require("fs")
const path = require("path")
const Assistant = require("./components/assistant.js")
const ScreenParser = require("./components/screenParser.js")
const readJson = require("r-json")
const Youtube = require("youtube-api")
const pm2 = require('pm2')
var he = require('he')

logGA = (...args) => { /* do nothing */ }
logEXT = (...args) => { /* do nothing */ }

var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function () {
    this.EXT = {}
    this.config = {}
    this.volumeScript= {
      "OSX": "osascript -e 'set volume output volume #VOLUME#'",
      "ALSA": "amixer sset -M 'PCM' #VOLUME#%",
      "ALSA_HEADPHONE": "amixer sset -M 'Headphone' #VOLUME#%",
      "ALSA_HDMI": "amixer sset -M 'HDMI' #VOLUME#%",
      "HIFIBERRY-DAC": "amixer sset -M 'Digital' #VOLUME#%",
      "PULSE": "amixer set Master #VOLUME#% -q",
      "RESPEAKER_SPEAKER": "amixer -M sset Speaker #VOLUME#%",
      "RESPEAKER_PLAYBACK": "amixer -M sset Playback #VOLUME#%"
    }
    timeout = null
    retry = null
    this.YouTube = null
    this.YT = 0
    this.checkConfigMerge()
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
        command += (payload.options) ? (" " + payload.options) : ""
        exec (command, (e,so,se)=> {
          logGA("ShellExec command:", command)
          if (e) {
            console.log("[GA] ShellExec Error:" + e)
            this.sendSocketNotification("WARNING", { message: "ShellExecError"} )
          }
          this.sendSocketNotification("INFORMATION", { message: "ShellExecDone" } )
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

      /** Volume module **/
      case "VOLUME_SET":
        if (this.config.Extented.volume.useVolume) this.setVolume(payload)
        else this.sendSocketNotification("WARNING", { message: "VolumeDisabled" })
        break

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
        clearTimeout(timeout)
        timeout= null
        clearTimeout(retry)
        retry = null
        retry = setTimeout(() => {
          this.spotify.play(payload, (code, error, result) => {
            if ((code == 404) && (result.error.reason == "NO_ACTIVE_DEVICE")) {
              logEXT("[SPOTIFY] RETRY playing...")
              this.socketNotificationReceived("SPOTIFY_PLAY", payload)
            }
            if ((code !== 204) && (code !== 202)) {
              this.sendSocketNotification("WARNING", { message: "LibrespotNoResponse" })
              return console.log("[SPOTIFY:PLAY] RETRY Error", code, error, result)
            }
            else {
              logEXT("[SPOTIFY] RETRY: DONE_PLAY")
              this.sendSocketNotification("INFORMATION", { message: "LibrespotConnected" })
            }
          })
        }, 3000)
        break
      case "SPOTIFY_PLAY":
        this.spotify.play(payload, (code, error, result) => {
          clearTimeout(timeout)
          timeout= null
          if ((code == 404) && (result.error.reason == "NO_ACTIVE_DEVICE")) {
            if (this.config.Extented.spotify.useLibrespot) {
              console.log("[SPOTIFY] No response from librespot !")
              this.sendSocketNotification("INFORMATION", { message: "LibrespotConnecting" })
              this.librespot()
              timeout= setTimeout(() => {
                this.socketNotificationReceived("SPOTIFY_TRANSFER", this.config.Extented.spotify.deviceName)
                this.socketNotificationReceived("SPOTIFY_RETRY_PLAY", payload)
              }, 3000)
            }
          }
          if ((code !== 204) && (code !== 202)) {
            return console.log("[SPOTIFY:PLAY] Error", code, error, result)
          }
          else logEXT("[SPOTIFY] DONE_PLAY")
        })
        break
      case "SPOTIFY_VOLUME":
        this.spotify.volume(payload, (code, error, result) => {
          if (code !== 204) console.log("[SPOTIFY:VOLUME] Error", code, error, result)
          else {
            this.sendSocketNotification("DONE_SPOTIFY_VOLUME", payload)
            logEXT("[SPOTIFY] DONE_VOLUME:", payload)
          }
        })
        break
      case "SPOTIFY_PAUSE":
        this.spotify.pause((code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:PAUSE] Error", code, error, result)
          else logEXT("[SPOTIFY] DONE_PAUSE")
        })
        break
      case "SPOTIFY_TRANSFER":
        this.spotify.transferByName(payload, (code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:TRANSFER] Error", code, error, result)
          else logEXT("[SPOTIFY] DONE_TRANSFER")
        })
        break
      case "SPOTIFY_STOP":
        pm2.restart("librespot", (err, proc) => {
          if (err) console.log("[PM2] librespot error: " + err)
          else logEXT("[PM2] Restart librespot")
        })
        break
      case "SPOTIFY_NEXT":
        this.spotify.next((code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:NEXT] Error", code, error, result)
          else logEXT("[SPOTIFY] DONE_NEXT")
        })
        break
      case "SPOTIFY_PREVIOUS":
        this.spotify.previous((code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:PREVIOUS] Error", code, error, result)
          else logEXT("[SPOTIFY] DONE_PREVIOUS")
        })
        break
      case "SPOTIFY_SHUFFLE":
        this.spotify.shuffle(payload,(code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:SHUFFLE] Error", code, error, result)
          else logEXT("[SPOTIFY] DONE_SHUFFLE")
        })
        break
      case "SPOTIFY_REPEAT":
        this.spotify.repeat(payload, (code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:REPEAT] Error", code, error, result)
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
      process.exit(1)
    }
    console.log("[GA] Perfect ConfigDeepMerge activated!")
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
    if (this.config.Extented.useEXT) {
      if (this.config.Extented.youtube.useYoutube) {
        try {
          const CREDENTIALS = readJson(this.config.assistantConfig["modulePath"] + "/credentials.json")
          const TOKEN = readJson(this.config.assistantConfig["modulePath"] + "/tokens/tokenYT.json")
          let oauth = Youtube.authenticate({
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
      if (this.config.Extented.volume.useVolume) {
        let exists = (data) => {
          return data !== null && data !== undefined
        }
        if (!exists(this.volumeScript[this.config.Extented.volume.volumePreset]))
          return this.DisplayError("VolumePreset error", {message: "VolumePresetError"})
      }
    }

    logGA("Activate delay is set to " + this.config.responseConfig.activateDelay + " ms")

    this.loadRecipes(()=> this.sendSocketNotification("INITIALIZED", Version))

    this.sendSocketNotification("INFORMATION" , {message: "LibraryLoading" })
    let bugsounet = await this.loadBugsounetLibrary()
    if (bugsounet) {
      console.error("[GA] Warning:", bugsounet, "@bugsounet library not loaded !")
      console.error("[GA] Try to solve it with `npm run rebuild` in GA directory")
    }
    else {
      console.log("[GA] All needed @bugsounet library loaded !")
      this.sendSocketNotification("INFORMATION" , {message: "LibraryLoaded" })
    }

    if (this.config.Extented.useEXT) {
      console.log("[GA:EXT] Extented Display Server Started")
      await this.Extented()
      console.log("[GA:EXT] Extented Display is initialized.")
    }
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
      var results = await Youtube.search.list({q: query, part: 'snippet', maxResults: 1, type: "video"})
      var item = results.data.items[0]
      var title = he.decode(item.snippet.title)
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
      this.cast = new this.EXT.CastServer(this.config.Extented.cast, callbacks.sendSocketNotification, this.config.debug)
      this.cast.start()
    }
    if (this.config.Extented.spotify.useSpotify && this.EXT.Spotify) {
      logEXT("Starting Spotify module...")
      try {
        const TOKEN = readJson(this.config.assistantConfig["modulePath"] + "/tokens/tokenSpotify.json")
        this.spotify = new this.EXT.Spotify(this.config.Extented.spotify, callbacks.sendSocketNotification, this.config.debug)
        this.spotify.start()
      } catch (e) {
        console.log("[EXT] Spotify " + e)
        error = "Spotify: tokenSpotify.json file not found !"
        this.sendSocketNotification("WARNING" , {  message: error } )
      }
      if (this.config.Extented.spotify.useLibrespot) {
        console.log("[SPOTIFY] Launch Librespot...")
        this.librespot()
      }
    }
    if (this.config.Extented.photos.usePhotos && this.config.Extented.photos.useGooglePhotosAPI && this.EXT.GPhotos) {
      logEXT("Starting GooglePhotosAPI module...")
      try {
        const TOKEN = readJson(this.config.assistantConfig["modulePath"] + "/tokens/tokenGP.json")
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
  },

  /** launch librespot with pm2 **/
  librespot: function() {
    var file = "librespot"
    var filePath = path.resolve(__dirname, "components/librespot/target/release", file)
    var cacheDir = __dirname + "/components/librespot/cache"
    if (!fs.existsSync(filePath)) {
      console.log("[LIBRESPOT] librespot is not installed !")
      this.sendSocketNotification("WARNING" , { message: "LibrespotNoInstalled" })
      return
    }
    pm2.connect((err) => {
      if (err) return console.log(err)
      console.log("[PM2] Connected!")
      pm2.list((err,list) => {
        if (err) return console.log(err)
        if (list && Object.keys(list).length > 0) {
          for (let [item, info] of Object.entries(list)) {
            if (info.name == "librespot" && info.pid) {
              return console.log("[PM2] Librespot already launched")
            }
          }
        }
        pm2.start({
          script: filePath,
          name: "librespot",
          out_file: "/dev/null",
          args: [
            "-n", this.config.Extented.spotify.deviceName,
            "--initial-volume" , this.config.Extented.spotify.maxVolume,
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
      pm2.stop("librespot", (e,p) => {
        console.log("[LIBRESPOT] Killed")
      })
    })
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

  /** Volume control **/
  setVolume: function(level) {
    var volumeScript= this.config.Extented.volume.myScript ? this.config.Extented.volume.myScript : this.volumeScript[this.config.Extented.volume.volumePreset]
    var script = volumeScript.replace("#VOLUME#", level)
    exec (script, (err, stdout, stderr)=> {
      if (err) {
        console.log("[GA:EXT] Set Volume Error:", err.toString())
        this.sendSocketNotification("WARNING" , { message: "VolumePresetError" })
      }
      else {
        logEXT("[VOLUME] Set Volume To:", level)
        this.sendSocketNotification("VOLUME_DONE", level)
        this.sendSocketNotification("INFORMATION" , { message: "Volume", values: level + "%" })
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
      // { "library to load" : [ "store library name", "path to check"] }
      { "@bugsounet/npmcheck": [ "npmCheck", "NPMCheck.useChecker" ] },
      { "@bugsounet/screen": [ "Screen", "Extented.screen.useScreen" ] },
      { "@bugsounet/pir": [ "Pir", "Extented.pir.usePir" ] },
      { "@bugsounet/governor": [ "Governor", "Extented.governor.useGovernor" ] },
      { "@bugsounet/internet": [ "Internet", "Extented.internet.useInternet" ] },
      { "@bugsounet/cast": [ "CastServer", "Extented.cast.useCast" ] },
      { "@bugsounet/spotify": [ "Spotify", "Extented.spotify.useSpotify" ] },
      { "@bugsounet/cvlc": [ "cvlc", "Extented.youtube.useVLC" ] },
      { "@bugsounet/google-photos" : [ "GPhotos", "Extented.photos.useGooglePhotosAPI" ] }
    ]
    let errors = 0
    return new Promise(resolve => {
      libraries.forEach(library => {
        for (const [name, configValues] of Object.entries(library)) {
          let libraryToLoad = name,
              libraryName = configValues[0],
              libraryPath = configValues[1],
              index = (obj,i) => { return obj[i] },
              libraryActivate = libraryPath.split(".").reduce(index,this.config)

          // libraryActivate: verify if the needed path of config is activated (result of reading config value: true/false) **/
          if (libraryActivate) {
            try {
              this.EXT[libraryName] = require(libraryToLoad)
              logGA("Loaded " + libraryToLoad)
            } catch (e) {
              console.error("[GA]", libraryToLoad, "Loading error!")
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
