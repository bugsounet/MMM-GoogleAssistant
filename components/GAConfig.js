class GAConfig {
  constructor (that) {
    const helperConfig = [
      "debug", "recipes", "assistantConfig",
      "responseConfig"
    ]

    if (that.config.debug) logGA = (...args) => { console.log("[GA]", ...args) }

    that.helperConfig = {}
    for(var i = 0; i < helperConfig.length; i++) {
      that.helperConfig[helperConfig[i]] = that.config[helperConfig[i]]
    }
    that.helperConfig.micConfig = {
      recorder: "auto",
      device: "default"
    }

    that.forceResponse= false
    that.assistantResponse = null
    that.bardMode = false
    that.globalStopCommands = []

    if (Array.isArray(that.config.otherStopCommands)) {
      that.globalStopCommands = that.config.otherStopCommands
    }

    that.GAStatus = {
      actual: "standby",
      old : "standby"
    }

    this.callbacks = {
      assistantActivate: (payload)=>{
        that.activateProcess.assistantActivate(that, payload)
      },
      postProcess: (response, callback_done, callback_none)=> {
        that.activateProcess.postProcess(that, response, callback_done, callback_none)
      },
      endResponse: ()=>{
        logGA("Conversation Done")
      },
      translate: (text) => {
        return that.translate(text)
      },
      GAStatus: (status) => {
        that.Hooks.doPlugin(that, "onStatus", {status: status})
        that.GAStatus = status
        that.sendNotification("ASSISTANT_" + that.GAStatus.actual.toUpperCase())
      },
      Gateway: (response)=> {
        return that.Gateway.SendToGateway(that, response)
      },
      "sendSocketNotification": (noti, params) => {
        that.sendSocketNotification(noti, params)
      }
    }

    that.Gateway = new Gateway(that)
    that.Hooks = new Hooks()
    that.activateProcess = new activateProcess()
    that.assistantResponse = new AssistantResponse(that.helperConfig["responseConfig"], this.callbacks)
    that.AssistantSearch = new AssistantSearch(that.helperConfig.assistantConfig)

    // create the main command for "stop" (EXT_STOP)
    var StopCommand = {
      commands: {
        "EXT_Stop": {
          notificationExec: {
            notification: "EXT_STOP"
          },
          soundExec: {
            chime: "close"
          },
          displayResponse: false,
          bardMode: false
        }
      }
    }
    that.Hooks.parseLoadedRecipe(JSON.stringify(StopCommand))
    logGA("[HOOK] EXT_Stop Command Added")

    // add default command to globalStopCommand (if needed)
    if (that.globalStopCommands.indexOf(that.config.stopCommand) == -1) {
      that.globalStopCommands.push(that.config.stopCommand)
    }

    // create all transcriptionHooks from globalStopCommands array
    if (that.globalStopCommands.length) {
      that.globalStopCommands.forEach((pattern,i) => {
        var Command = {
          transcriptionHooks: {}
        }
        Command.transcriptionHooks["EXT_Stop"+i] = {
          pattern: `^(${pattern})($)`,
          command: "EXT_Stop"
        }
        that.Hooks.parseLoadedRecipe(JSON.stringify(Command))
        logGA(`[HOOK] Add pattern for EXT_Stop command: ${pattern}`)
      })
    }
    else { // should never happen !
      console.error("[GA] No Stop Commands defined!")
    }

    that.assistantResponse.prepareGA()
    that.assistantResponse.prepareBackground ()
    that.assistantResponse.Loading()
    that.sendSocketNotification("INIT", that.helperConfig)
    console.log("[GA] GAConfig Ready")
  }

  forceFullScreen(that) {
    that.config.responseConfig.useFullscreen= true
    that.assistantResponse = null
    that.assistantResponse = new AssistantResponse(that.helperConfig["responseConfig"], this.callbacks)
  }
}
 
