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
const npmCheck = require("@bugsounet/npmcheck")
const Screen = require("@bugsounet/screen")
const Pir = require("@bugsounet/pir")
const Governor = require("@bugsounet/governor")
const Internet = require("@bugsounet/internet").v2
const CastServer = require("@bugsounet/cast")
const Spotify = require("@bugsounet/spotify")
const pm2 = require('pm2')
const Cvlc = require('@bugsounet/cvlc')

logGA = (...args) => { /* do nothing */ }
logA2D = (...args) => { /* do nothing */ }

var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function () {
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
          if (e) console.log("[GA] ShellExec Error:" + e)
          this.sendSocketNotification("SHELLEXEC_RESULT", {
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

      /** A2DServer **/

      /** Volume module **/
      case "VOLUME_SET":
        this.setVolume(payload)
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
              logA2D("[SPOTIFY] RETRY playing...")
              this.socketNotificationReceived("SPOTIFY_PLAY", payload)
            }
            if ((code !== 204) && (code !== 202)) {
              return console.log("[SPOTIFY:PLAY] RETRY Error", code, error, result)
            }
            else logA2D("[SPOTIFY] RETRY: DONE_PLAY")
          })
        }, 3000)
        break
      case "SPOTIFY_PLAY":
        this.spotify.play(payload, (code, error, result) => {
          clearTimeout(timeout)
          timeout= null
          if ((code == 404) && (result.error.reason == "NO_ACTIVE_DEVICE")) {
            if (this.config.A2DServer.spotify.useLibrespot) {
              console.log("[SPOTIFY] No response from librespot !")
              pm2.restart("librespot", (err, proc) => {
                if (err) console.log("[PM2] librespot error: " + err)
                else console.log("[PM2] Restart librespot")
              })
              timeout= setTimeout(() => {
                this.socketNotificationReceived("SPOTIFY_TRANSFER", this.config.A2DServer.spotify.connectTo)
                this.socketNotificationReceived("SPOTIFY_RETRY_PLAY", payload)
              }, 3000)
            }
          }
          if ((code !== 204) && (code !== 202)) {
            return console.log("[SPOTIFY:PLAY] Error", code, error, result)
          }
          else logA2D("[SPOTIFY] DONE_PLAY")
        })
        break
      case "SPOTIFY_VOLUME":
        this.spotify.volume(payload, (code, error, result) => {
          if (code !== 204) console.log("[SPOTIFY:VOLUME] Error", code, error, result)
          else {
            this.sendSocketNotification("DONE_SPOTIFY_VOLUME", payload)
            logA2D("[SPOTIFY] DONE_VOLUME:", payload)
          }
        })
        break
      case "SPOTIFY_PAUSE":
        this.spotify.pause((code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:PAUSE] Error", code, error, result)
          else logA2D("[SPOTIFY] DONE_PAUSE")
        })
        break
      case "SPOTIFY_TRANSFER":
        this.spotify.transferByName(payload, (code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:TRANSFER] Error", code, error, result)
          else logA2D("[SPOTIFY] DONE_TRANSFER")
        })
        break
      case "SPOTIFY_STOP":
        pm2.restart("librespot", (err, proc) => {
          if (err) console.log("[PM2] librespot error: " + err)
          else logA2D("[PM2] Restart librespot")
        })
        break
      case "SPOTIFY_NEXT":
        this.spotify.next((code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:NEXT] Error", code, error, result)
          else logA2D("[SPOTIFY] DONE_NEXT")
        })
        break
      case "SPOTIFY_PREVIOUS":
        this.spotify.previous((code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:PREVIOUS] Error", code, error, result)
          else logA2D("[SPOTIFY] DONE_PREVIOUS")
        })
        break
      case "SPOTIFY_SHUFFLE":
        this.spotify.shuffle(payload,(code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:SHUFFLE] Error", code, error, result)
          else logA2D("[SPOTIFY] DONE_SHUFFLE")
        })
        break
      case "SPOTIFY_REPEAT":
        this.spotify.repeat(payload, (code, error, result) => {
          if ((code !== 204) && (code !== 202)) console.log("[SPOTIFY:REPEAT] Error", code, error, result)
          else logA2D("[SPOTIFY] DONE_REPEAT")
        })
        break
      case "SEARCH_AND_PLAY":
        logA2D("[SPOTIFY] Search and Play", payload)
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
        if (this.config.responseConfig.useAudioOutput) response.error = "NO_RESPONSE"
        if (response.transcription && response.transcription.transcription && !response.transcription.done) {
          response.error = "TRANSCRIPTION_FAILS"
        }
      }
      if (response.error == "TOO_SHORT" && response) response.error = null
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

  initialize: async function (config) {
    this.config = config
    this.config.assistantConfig["modulePath"] = __dirname
    var error = null
    if (this.config.debug) {
      logGA = (...args) => { console.log("[GA]", ...args) }
      logA2D = (...args) => { console.log("[GA:A2D]", ...args) }
    }
    let Version = {
      version: require('./package.json').version,
      rev: require('./package.json').rev
    }
    if (!fs.existsSync(this.config.assistantConfig["modulePath"] + "/credentials.json")) {
      error = "[FATAL] credentials.json file not found !"
      return this.DisplayError(error)
    }
    else if (!fs.existsSync(this.config.assistantConfig["modulePath"] + "/tokens/tokenGA.json")) {
      error = "[FATAL] Assistant: tokenGA.json file not found !"
      return this.DisplayError(error)
    }
    if (this.config.A2DServer.useA2D) {
      if (this.config.A2DServer.youtube.useYoutube) {
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
          return this.DisplayError(error)
        }
      }
      if (this.config.A2DServer.volume.useVolume) {
        let exists = (data) => {
          return data !== null && data !== undefined
        }
        if (!exists(this.volumeScript[this.config.A2DServer.volume.volumePreset]))
          return this.DisplayError("VolumePreset error")
      }
    }

    logGA("Activate delay is set to " + this.config.responseConfig.activateDelay + " ms")

    this.loadRecipes(()=> this.sendSocketNotification("INITIALIZED", Version))

    if (this.config.NPMCheck.useChecker) {
      var cfg = {
        dirName: __dirname,
        moduleName: this.name,
        timer: this.config.NPMCheck.delay,
        debug: this.config.debug
      }
      this.Checker= new npmCheck(cfg, update => { this.sendSocketNotification("NPM_UPDATE", update)})
    }
    if (this.config.A2DServer.useA2D) {
      console.log("[GA:A2D] Assistant2Display Server Started")
      await this.addons()
      console.log("[GA:A2D] Assistant2Display is initialized.")
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
          console.log(`[GA] RECIPE_ERROR (${recipes[i]}):`, e.message, e)
          error = `[FATAL] RECIPE_ERROR (${recipes[i]})`
          return this.sendSocketNotification("NOT_INITIALIZED", error)
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
      console.log('[GA] Found YouTube Title: %s - videoId: %s', item.snippet.title, item.id.videoId)
      this.sendSocketNotification("YouTube_RESULT", item.id.videoId)
    } catch (e) {
      console.log("[GA] Youtube Search error: ", e.toString())
      this.sendSocketNotification("WARNING", e.toString())
    }
  },

  DisplayError: function (error) {
    console.log("[GA][ERROR]" + error)
    return this.sendSocketNotification("NOT_INITIALIZED", error)
  },

  /***************/
  /** A2DServer **/
  /***************/

  addons: function() {
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
        if (this.governor && param.error) this.sendSocketNotification("ERROR", "[GOVERNOR] " + param.error)
      },
      "pir": (noti,param) => {
        if (this.screen && this.pir && noti == "PIR_DETECTED") this.screen.wakeup()
        if (this.screen && this.pir && noti == "PIR_ERROR") this.sendSocketNotification("ERROR", "[PIR] " + param.toString())
      }
    }

    if (this.config.A2DServer.screen.useScreen) {
      logA2D("Starting Screen module...")
      this.screen = new Screen(this.config.A2DServer.screen, callbacks.sendSocketNotification, this.config.debug, callbacks.sendSocketNotification, callbacks.governor)
      this.screen.activate()
    }
    if (this.config.A2DServer.pir.usePir) {
      logA2D("Starting Pir module...")
      this.pir = new Pir(this.config.A2DServer.pir, callbacks.pir, this.config.debug)
      this.pir.start()
    }
    if (this.config.A2DServer.governor.useGovernor) {
      logA2D("Starting Governor module...")
      this.governor = new Governor(this.config.A2DServer.governor, callbacks.governor, this.config.debug)
      this.governor.start()
    }
    if (this.config.A2DServer.internet.useInternet) {
      logA2D("Starting Internet module...")
      this.internet = new Internet(this.config.A2DServer.internet, callbacks.sendSocketNotification, this.config.debug)
      this.internet.start()
    }
    if (this.config.A2DServer.cast.useCast) {
      logA2D("Starting Cast module...")
      this.cast = new CastServer(this.config.A2DServer.cast, callbacks.sendSocketNotification, this.config.debug)
      this.cast.start()
    }
    if (this.config.A2DServer.spotify.useSpotify) {
      logA2D("Starting Spotify module...")
      this.spotify = new Spotify(this.config.A2DServer.spotify, callbacks.sendSocketNotification, this.config.debug)
      this.spotify.start()
      if (this.config.A2DServer.spotify.useLibrespot) {
        console.log("[SPOTIFY] Launch Librespot...")
        this.librespot()
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
      this.sendSocketNotification("WARNING" , "librespot is not installed !")
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
            "-n", this.config.A2DServer.spotify.connectTo,
            "-u", this.config.A2DServer.spotify.username,
            "-p", this.config.A2DServer.spotify.password,
            "--initial-volume" , this.config.A2DServer.spotify.maxVolume,
            "-c", cacheDir
          ]
        }, (err, proc) => {
          if (err) return console.log("[LIBRESPOT] " + err)
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
          logA2D("[SPOTIFY] Search and Play Result:", foundForPlay)
          this.socketNotificationReceived("SPOTIFY_PLAY", foundForPlay)
        } else {
          logA2D("[SPOTIFY] Search and Play No Result")
          this.sendSocketNotification("WARNING" , "[SPOTIFY] Search and Play No Result")
        }
      } else { //when fail
        console.log("[GA:A2D] [SPOTIFY] Search and Play failed !")
        this.sendSocketNotification("WARNING" , "[SPOTIFY] Search and Play failed !")
      }
    })
  },

  /** Volume control **/
  setVolume: function(level) {
    var volumeScript= this.config.A2DServer.volume.myScript ? this.config.A2DServer.volume.myScript : this.volumeScript[this.config.A2DServer.volume.volumePreset]
    var script = volumeScript.replace("#VOLUME#", level)
    exec (script, (err, stdout, stderr)=> {
      if (err) {
        console.log("[GA:A2D] Set Volume Error:", err.toString())
        this.sendSocketNotification("WARNING" , "Volume: Preset Error!")
      }
      else {
        logA2D("[VOLUME] Set Volume To:", level)
        this.sendSocketNotification("VOLUME_DONE", level)
        this.sendSocketNotification("INFORMATION" , "Volume: " + level + "%")
      }
    })
  },

  /** youtube control with VLC **/
  playWithVlc: function (link) {
    this.YT++
    if (this.YouTube) this.CloseVlc()
    this.YouTube = new Cvlc()
    this.YouTube.play(
      link,
      ()=> {
        logA2D("[YouTube] Found link:", link)
         if (this.YouTube) this.YouTube.cmd("volume "+ this.config.A2DServer.youtube.maxVolume)
      },
      ()=> {
        this.YT--
        if (this.YT < 0) this.YT = 0
        logA2D("[YouTube] Video ended #" + this.YT)
        if (this.YT == 0) {
          logA2D("[YouTube] Finish !")
          this.sendSocketNotification("FINISH_YOUTUBE")
          this.YouTube = null
        }
      }
    )
  },

  CloseVlc: function () {
    if (this.YouTube) {
      logA2D("[YouTube] Force Closing VLC...")
      this.YouTube.destroy()
      this.YouTube = null
      logA2D("[YouTube] Done Closing VLC...")
    }
    else {
      logA2D("[YouTube] Not running!")
    }
  },

  VolumeVLC: function(volume) {
    if (this.YouTube) {
      logA2D("[YouTube] Set VLC Volume to:", volume)
      this.YouTube.cmd("volume " + volume)
    }
  },

  pm2Restart: function(id) {
    var pm2 = "pm2 restart " + id
    exec (pm2, (err, stdout, stderr)=> {
      if (err) console.log("[A2D:PM2] " + err)
      else log("[PM2] Restart", id)
    })
  },

})
