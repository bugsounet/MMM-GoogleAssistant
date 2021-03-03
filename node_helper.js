//
// Module : MMM-GoogleAssistant
//


const exec = require("child_process").exec
const fs = require("fs")
const path = require("path")
const Assistant = require("./components/assistant.js")
const ScreenParser = require("./components/screenParser.js")
const Snowboy = require("@bugsounet/snowboy").Snowboy
const Player = require("@bugsounet/native-sound")
const npmCheck = require("@bugsounet/npmcheck")
const readJson = require("r-json")
const Youtube = require("youtube-api")

var _log = function() {
  var context = "[GA]"
  return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function () {
    this.config = {}
  },

  socketNotificationReceived: function (noti, payload) {
    switch (noti) {
      case "INIT":
        console.log("[GA] MMM-GoogleAssistant Version:", require('./package.json').version)
        this.initialize(payload)
        break
      case "ACTIVATE_ASSISTANT":
        this.activateAssistant(payload)
        break
      case "ASSISTANT_BUSY":
        if (this.config.snowboy.useSnowboy) this.snowboy.stop()
        break
      case "ASSISTANT_READY":
        if (this.config.snowboy.useSnowboy) this.snowboy.start()
        break
      case "SHELLEXEC":
        var command = payload.command
        command += (payload.options) ? (" " + payload.options) : ""
        exec (command, (e,so,se)=> {
          log("ShellExec command:", command)
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
      case "PLAY_AUDIO":
        this.player.play(payload)
        break
      case "PLAY_CHIME":
        let filePath = path.resolve(__dirname, payload)
        this.player.play(filePath, false)
        break
      case "YouTube_SEARCH":
        if (payload) this.YoutubeSearch(payload)
        break
    }
  },

  tunnel: function(payload) {
    this.sendSocketNotification("TUNNEL", payload)
  },

  activateAssistant: function(payload) {
    log("QUERY:", payload)
    var assistantConfig = Object.assign({}, this.config.assistantConfig)
    assistantConfig.debug = this.config.debug
    assistantConfig.lang = payload.lang
    assistantConfig.useScreenOutput = payload.useScreenOutput
    assistantConfig.useAudioOutput = payload.useAudioOutput
    assistantConfig.micConfig = this.config.micConfig
    this.assistant = new Assistant(assistantConfig, (obj)=>{this.tunnel(obj)})

    var parserConfig = {
      screenOutputCSS: this.config.responseConfig.screenOutputCSS,
      screenOutputURI: "tmp/lastScreenOutput.html"
    }
    var parser = new ScreenParser(parserConfig, this.config.debug)
    var result = null
    this.assistant.activate(payload, (response)=> {
      response.lastQuery = payload

      if (!(response.screen || response.audio)) {
        response.error = "NO_RESPONSE"
        if (response.transcription && response.transcription.transcription && !response.transcription.done) {
          response.error = "TRANSCRIPTION_FAILS"
        }
      }
      if (response.error == "TOO_SHORT" && response) response.error = null
      if (response.screen) {
        parser.parse(response, (result)=>{
          delete result.screen.originalContent
          log("ASSISTANT_RESULT", result)
          this.sendSocketNotification("ASSISTANT_RESULT", result)
        })
      } else {
        log ("ASSISTANT_RESULT", response)
        this.sendSocketNotification("ASSISTANT_RESULT", response)
      }
    })
  },

  initialize: function (config) {
    this.config = config
    this.config.assistantConfig["modulePath"] = __dirname
    var error = null
    if (this.config.debug) log = _log
    if (!fs.existsSync(this.config.assistantConfig["modulePath"] + "/" + this.config.assistantConfig.credentialPath)) {
      error = "[ERROR] credentials.json file not found !"
    }
    else if (!fs.existsSync(this.config.assistantConfig["modulePath"] + "/" + this.config.assistantConfig.tokenPath)) {
      error = "[ERROR] token.json file not found !"
    }
    if (this.config.A2DServer.useA2D && this.config.A2DServer.useYouTube) {
      try {
        const CREDENTIALS = readJson(this.config.assistantConfig["modulePath"] + "/" + this.config.assistantConfig.credentialPath)
        const TOKEN = readJson(this.config.assistantConfig["modulePath"] + "/tokenYT.json")
        let oauth = Youtube.authenticate({
          type: "oauth",
          client_id: CREDENTIALS.installed.client_id,
          client_secret: CREDENTIALS.installed.client_secret,
          redirect_url: CREDENTIALS.installed.redirect_uris,
          access_token: TOKEN.access_token,
          refresh_token: TOKEN.refresh_token,
        })
        console.log ("[GA] YouTube Search Function initilized.")
      } catch (e) {
        console.log("[GA] "+ e)
        error = "[ERROR] YouTube Search not Set !"
      }
    }

    if (error) {
      console.log("[GA]" + error)
      return this.sendSocketNotification("NOT_INITIALIZED", error)
    }
    log("Activate delay is set to " + this.config.responseConfig.activateDelay + " ms")

    if (this.config.snowboy.useSnowboy) {
      this.snowboy = new Snowboy(this.config.snowboy, this.config.micConfig, (detected) => { this.hotwordDetect(detected) } , this.config.debug )
      this.snowboy.init()
    }
    this.loadRecipes(()=> this.sendSocketNotification("INITIALIZED"))
    if (this.config.A2DServer.useA2D) console.log ("[GA] Assistant2Display Server Started")
    if (this.config.responseConfig.useNative) {
      this.player = new Player(this.config.responseConfig, (ended) => { this.sendSocketNotification(ended) } , this.config.debug )
      console.log("[GA] Use native program (" + this.config.responseConfig.playProgram + ") for audio response")
      this.player.init()
    }
    if (this.config.NPMCheck.useChecker) {
      var cfg = {
        dirName: __dirname,
        moduleName: this.name,
        timer: this.config.NPMCheck.delay,
        debug: this.config.debug
      }
      this.Checker= new npmCheck(cfg, update => { this.sendSocketNotification("NPM_UPDATE", update)} )
    }
    console.log ("[GA] Google Assistant is initialized.")
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
          error = `[GA] RECIPE_ERROR (${recipes[i]})`
          return this.sendSocketNotification("NOT_INITIALIZED", error)
        }
      }
      callback()
    } else {
      log("NO_RECIPE_TO_LOAD")
      callback()
    }
  },

  /** Snowboy Callback **/
  hotwordDetect: function(detected) {
    if (detected) this.sendSocketNotification("ASSISTANT_ACTIVATE", { type:"MIC" })
  },

 /** YouTube Search **/
  YoutubeSearch: async function (query) {
    var results = await Youtube.search.list({q: query, part: 'snippet', maxResults: 1, type: "video"})
    for(var i in results.data.items) {
      var item = results.data.items[i]
      console.log('[GA] Found YouTube Title: %s - videoId: %s', item.snippet.title, item.id.videoId)
      this.sendSocketNotification("YouTube_RESULT", item.id.videoId)
    }
  }
})
