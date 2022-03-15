//
// Module : MMM-GoogleAssistant v4
//

const exec = require("child_process").exec
const fs = require("fs")
const path = require("path")
const Assistant = require("./components/assistant.js")
const ScreenParser = require("./components/screenParser.js")
const { getPlatform } = require("./components/platform.js")

logGA = (...args) => { /* do nothing */ }

var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function () {
    this.config = {}
    this.blank = {}
    this.checkConfigMerge()
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
/*
    else {
      console.error("[FATAL] Please use `prod` branch for MMM-GoogleAssistant")
      console.error("[GA] You can't use this branch, it's reserved to developers.")
      process.exit(255)
    }
*/
  },

  initialize: async function (config) {
    this.config = config
    this.config.assistantConfig["modulePath"] = __dirname
    var error = null
    if (this.config.debug) logGA = (...args) => { console.log("[GA]", ...args) }

    let Version = {
      version: require('./package.json').version,
      rev: require('./package.json').rev
    }

    if (!fs.existsSync(this.config.assistantConfig["modulePath"] + "/credentials.json")) {
      error = "[FATAL] Assistant: credentials.json file not found !"
      return this.DisplayError(error, {message: "GAErrorCredentials"})
    }
    else if (!fs.existsSync(this.config.assistantConfig["modulePath"] + "/tokenGA.json")) {
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

    this.loadRecipes(()=> this.sendSocketNotification("INITIALIZED", Version))
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

  DisplayError: function (err, error, details = null) {
    if (details) console.log("[GA][ERROR]" + err, details.message, details)
    else console.log("[GA][ERROR]" + err)
    return this.sendSocketNotification("NOT_INITIALIZED", { message: error.message, values: error.values })
  }
})
