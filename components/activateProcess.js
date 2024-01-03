class activateProcess {
  constructor () {
    console.log("[GA] activateProcess Ready")
  }

  assistantActivate(that, payload) {
    if (payload.test) {
      var testing = {
        type: "TEXT",
        key: "What time is it?",
        lang: that.config.assistantConfig.lang,
        status: "testing",
        chime: false
      }
      that.sendSocketNotification("ACTIVATE_ASSISTANT", testing)
      return
    }
    if (that.GAStatus.actual != "standby" && !payload.force) return logGA("Assistant is busy.")
    that.assistantResponse.clearAliveTimers()
    if (that.GAStatus.actual== "continue") that.assistantResponse.showTranscription(that.translate("GAContinue"))
    else that.assistantResponse.showTranscription(that.translate("GABegin"))
    that.Hooks.doPlugin(that, "onActivate")
    that.assistantResponse.fullscreen(true)
    that.lastQuery = null
    var options = {
      type: "TEXT",
      key: null,
      lang: that.config.assistantConfig.lang,
      status: that.GAStatus.old,
      chime: true
    }
    var options = Object.assign({}, options, payload)
    that.assistantResponse.status(options.type, (options.chime) ? true : false)
    that.sendSocketNotification("ACTIVATE_ASSISTANT", options)
  }
  
  postProcess(that, response, callback_done=()=>{}, callback_none=()=>{}) {
    if (response.lastQuery.status == "continue") return callback_none()
    var foundHook = that.Hooks.findAllHooks(that, response)
    if (foundHook.length > 0) {
      that.assistantResponse.status("hook")
      for (var i = 0; i < foundHook.length; i++) {
        var hook = foundHook[i]
        that.Hooks.doCommand(that, hook.command, hook.params, hook.from)
      }
      if (that.forceResponse) {
        that.forceResponse = false
        callback_none()
      } else callback_done()
    } else {
      callback_none()
    }
  }
}
