"use strict"

var logGA = (...args) => { /* do nothing */ }
const Assistant = require("./assistantConverse")
const ScreenParser = require("./screenParser")

function activate (that, payload) {
  if (that.config.debug) logGA = (...args) => { console.log("[GA] [ACTIVATE_ASSISTANT]", ...args) }
  logGA("QUERY:", payload)
  var assistantConfig = Object.assign({}, that.config.assistantConfig)
  assistantConfig.debug = that.config.debug
  assistantConfig.lang = payload.lang
  assistantConfig.micConfig = that.config.micConfig
  that.assistant = new Assistant(assistantConfig, (obj)=>{ that.sendSocketNotification("TUNNEL", obj) })

  var parserConfig = {
    responseOutputCSS: that.config.responseConfig.responseOutputCSS,
    responseOutputURI: "tmp/responseOutput.html",
    responseOutputZoom: that.config.responseConfig.zoom.responseOutput
  }
  var parser = new ScreenParser(parserConfig, that.config.debug)
  var result = null
  that.assistant.activate(payload, (response)=> {
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
        logGA("RESULT", result)
        that.sendSocketNotification("ASSISTANT_RESULT", result)
      })
    } else {
      logGA("RESULT", response)
      that.sendSocketNotification("ASSISTANT_RESULT", response)
    }
  })
}

exports.activate = activate
