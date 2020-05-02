//
// Module : MMM-GoogleAssistant
//

const path = require("path")
const fs = require("fs")
const Assistant = require("./components/assistant.js")
const Snowboy = require("@bugsounet/snowboy").Snowboy
const Sound = require("./components/sound.js")

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
        this.snowboy.stop()
        this.activateAssistant(payload)
        break
      case "ASSISTANT_READY":
        this.snowboy.start()
        break
      case "PLAY_CHIME":
        var filepath = path.resolve(__dirname, payload)
        this.sound.play(filepath,true)
        break
      case "PLAY_SOUND":
        this.sound.play(payload)
        break
    }
  },

  activateAssistant: function(payload) {
    var assistantConfig = Object.assign({}, this.config.assistantConfig)
    assistantConfig.debug = this.config.debug
    assistantConfig.lang = payload.lang
    assistantConfig.micConfig = this.config.micConfig
    this.assistant = new Assistant(assistantConfig)

    var result = null
    this.assistant.activate(payload, (response)=> {
      response.lastQuery = payload
      if (!response.audio) {
        response.error = "NO_RESPONSE"
        if (response.transcription && response.transcription.transcription && !response.transcription.done) {
          response.error = "TRANSCRIPTION_FAILS"
        }
      }
      if (response.error == "TOO_SHORT" && response) response.error = null
      log ("ASSISTANT_RESULT", response)
      this.sendSocketNotification("ASSISTANT_RESULT", response)
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
    if (!this.config.audioConfig.useHTML5) {
      this.sound = new Sound(this.config.audioConfig, (send) => { this.sendSocketNotification(send) } , this.config.debug )
      this.sound.init()
    }
    else log("Use HTML5 for audio response")
    this.snowboy = new Snowboy(this.config.snowboy, this.config.micConfig, (detected) => { this.hotwordDetect(detected) } , this.config.debug )
    this.snowboy.init()
    this.sendSocketNotification("INITIALIZED")
    console.log("[ASSISTANT] Google Assistant is initialized.")
    this.snowboy.start()
  },

  hotwordDetect: function(detected) {
    if (detected) this.sendSocketNotification("ASSISTANT_ACTIVATE", { type:"MIC" })
  },
})
