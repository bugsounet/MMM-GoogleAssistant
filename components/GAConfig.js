class GAConfig {
  constructor (that) {
    const helperConfig = [
      "debug", "recipes", "assistantConfig", "responseConfig", "website"
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
        that.EXT_Actions.Actions(that, that.GAStatus.actual.toUpperCase())
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

    that.assistantResponse.prepareGA()
    that.assistantResponse.prepareBackground ()
    that.assistantResponse.Loading()

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
          displayResponse: false
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

    that.sendSocketNotification("PRE-INIT", that.helperConfig)
    console.log("[GA] GAConfig Ready")
  }

  async EXT_Config(that) {
    that.EXT_Callbacks = new EXT_Callbacks()
    that.EXT_Actions = new EXT_Actions()
    that.EXT_NotificationsActions = new EXT_NotificationsActions()
    that.EXT_OthersRules = new EXT_OthersRules()
    let DB = new EXT_Database()
    that.ExtDB = DB.ExtDB()
    that.EXT = await DB.createDB(that)
    that.session= {}
    that.sysInfo = new sysInfoPage(that)

    let LoadTranslate = new EXT_Translations()
    let EXTTranslate = await LoadTranslate.Load_EXT_Translation(that)
    let EXTDescription = await LoadTranslate.Load_EXT_Description(that)
    let VALTranslate = await LoadTranslate.Load_EXT_TrSchemaValidation(that)
    that.sysInfo.prepare(EXTTranslate)

    that.sendSocketNotification("INIT", {
      DB: that.ExtDB,
      Description: EXTDescription,
      Translate: EXTTranslate,
      Schema: VALTranslate,
      EXTStatus: that.EXT
    })
    //that.assistantResponse.showTranscription(that.translate("PREPARE_WEBSITE"))
  }

  forceFullScreen(that) {
    that.config.responseConfig.useFullscreen= true
    that.assistantResponse = null
    that.assistantResponse = new AssistantResponse(that.helperConfig["responseConfig"], this.callbacks)
  }
}
