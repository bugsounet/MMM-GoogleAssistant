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
        logGA("Conversation End")
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
    var StopHooks = {
      transcriptionHooks: {
        "EXT_Stop": {
          pattern: that.config.stopCommand,
          command: "EXT_Stop"
        }
      },
      commands: {
        "EXT_Stop": {
          notificationExec: {
            notification: "EXT_STOP"
          },
          soundExec: {
            chime: "close"
          },
          displayResponse: false
        }
      }
    }
    that.Hooks.parseLoadedRecipe(JSON.stringify(StopHooks))
    console.log("[GA] GAConfig Ready")
  }
}
 
