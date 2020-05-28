//
// Module : MMM-GoogleAssistant
//


const exec = require("child_process").exec
const fs = require("fs")
const Assistant = require("./components/assistant.js")
const ScreenParser = require("./components/screenParser.js")
const ActionManager = require("./components/actionManager.js")
const Snowboy = require("@bugsounet/snowboy").Snowboy

var _log = function() {
  var context = "[ASSISTANT]"
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
        this.initialize(payload)
        break
      case "ACTIVATE_ASSISTANT":
        this.activateAssistant(payload)
        break
      case "ASSISTANT_BUSY":
        this.snowboy.stop()
        break
      case "ASSISTANT_READY":
        this.snowboy.start()
        break
      case "SHELLEXEC":
        var command = payload.command
        command += (payload.options) ? (" " + payload.options) : ""
        exec (command, (e,so,se)=> {
          log("ShellExec command:", command)
          if (e) console.log("[ASSISTANT] ShellExec Error:" + e)
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
    }
  },

  tunnel: function(payload) {
    this.sendSocketNotification("TUNNEL", payload)
  },

  activateAssistant: function(payload) {
    log("QUERY:", payload)
    var assistantConfig = Object.assign({}, this.config.assistantConfig)
    assistantConfig.debug = this.config.debug
    assistantConfig.session = payload.session
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
    if (this.config.debug) log = _log
    console.log("[ASSISTANT] MMM-GoogleAssistant Version:", require('./package.json').version)
    if (!fs.existsSync(this.config.assistantConfig["modulePath"] + "/credentials.json")) {
      console.log("[ASSISTANT][ERROR] credentials.json file not found !")
    }
    log("Response delay is set to " + this.config.responseConfig.delay + " ms")

    this.snowboy = new Snowboy(this.config.snowboy, this.config.micConfig, (detected) => { this.hotwordDetect(detected) } , this.config.debug )
    this.snowboy.init()

    this.loadRecipes(()=> this.sendSocketNotification("INITIALIZED"))
    if (this.config.useA2D) console.log ("[ASSISTANT] Assistant2Display Server Started")
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
      var actions = []
      for (var i = 0; i < recipes.length; i++) {
        try {
          var p = require("./recipes/" + recipes[i]).recipe
          this.sendSocketNotification("LOAD_RECIPE", JSON.stringify(p, replacer, 2))
          if (p.actions) actions = Object.assign({}, actions, p.actions)
          console.log("[ASSISTANT] RECIPE_LOADED:", recipes[i])
        } catch (e) {
          console.log(`[ASSISTANT] RECIPE_ERROR (${recipes[i]}):`, e.message)
        }
      }
      if (actions && Object.keys(actions).length > 0) {
        var actionConfig = Object.assign({}, this.config.customActionConfig)
        actionConfig.actions = Object.assign({}, actions)
        actionConfig.projectId = this.config.assistantConfig.projectId
        var Manager = new ActionManager(actionConfig, this.config.debug)
        Manager.makeAction(callback)
      } else {
        log("NO_ACTION_TO_MANAGE")
        callback()
      }
    } else {
      log("NO_RECIPE_TO_LOAD")
      callback()
    }
  },

  /** Snowboy Callback **/
  hotwordDetect: function(detected) {
    if (detected) this.sendSocketNotification("ASSISTANT_ACTIVATE", { type:"MIC" })
  },
})

