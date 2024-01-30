/**
 ** Module : MMM-GoogleAssistant
 ** @bugsounet
 ** ©2024
 ** support: https://forum.bugsounet.fr
 **/

logGA = (...args) => { /* do nothing */ }

Module.register("MMM-GoogleAssistant", {
  requiresVersion: "2.25.0",
  defaults: {
    debug:false,
    stopCommand: "stop",
    otherStopCommands: [],
    assistantConfig: {
      lang: "en-US",
      latitude: 51.508530,
      longitude: -0.076132,
      deviceRegistred: false
    },
    responseConfig: {
      useFullscreen: false,
      responseOutputCSS: "response_output.css",
      screenOutputTimer: 5000,
      useChime: true,
      confirmationChime: true,
      chimes: {
        beep: "beep.mp3",
        error: "error.mp3",
        continue: "continue.mp3",
        confirmation: "confirmation.mp3",
        open: "Google_beep_open.mp3",
        close: "Google_beep_close.mp3",
        opening: "opening.mp3",
        closing: "closing.mp3",
        warning: "warning.ogg"
      },
      imgStatus: {
        hook: "hook.gif",
        standby: "standby.gif",
        reply: "reply.gif",
        error: "error.gif",
        think: "think.gif",
        continue: "continue.gif",
        listen: "listen.gif",
        confirmation: "confirmation.gif",
        information: "information.gif",
        warning: "warning.gif",
        userError: "userError.gif"
      },
      zoom: {
        transcription: "80%",
        responseOutput: "60%"
      }
    },
    recipes: [],
    website: {
      username: "admin",
      password: "admin",
      CLIENT_ID: null
    }
  },

  getScripts: function() {
    return [
      "/modules/MMM-GoogleAssistant/components/assistantResponse.js",
      "/modules/MMM-GoogleAssistant/components/assistantSearch.js",
      "/modules/MMM-GoogleAssistant/components/EXTs.js",
      "/modules/MMM-GoogleAssistant/components/sysInfoPage.js"
    ]
  },

  getStyles: function () {
    return [
      "/modules/MMM-GoogleAssistant/MMM-GoogleAssistant.css"
    ]
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      de: "translations/de.json",
      el: "translations/el.json",
      es: "translations/es.json",
      fr: "translations/fr.json",
      it: "translations/it.json",
      ko: "translations/ko.json",
      nl: "translations/nl.json",
      pt: "translations/pt.json",
      tr: "translations/tr.json",
      "zh-cn": "translations/zh-cn.json"
    }
  },

  getDom: function() {
    var dom = document.createElement("div")
    dom.style.display = 'none'
    return dom
  },

  notificationReceived: function(noti, payload=null, sender=null) {
    this.doPlugin("onNotificationReceived", {notification:noti, payload:payload})
    if (noti.startsWith("EXT_")) return this.EXTs.ActionsEXTs(noti,payload,sender)
    switch (noti) {
      case "GA_ACTIVATE":
        if (payload && payload.type && payload.key) this.assistantActivate(payload)
        else this.assistantActivate({ type:"MIC" })
        break
      case "GA_FORCE_FULLSCREEN":
        if (this.config.responseConfig.useFullscreen) return logGA("Force Fullscreen: Already activated")
        this.config.responseConfig.useFullscreen= true
        this.assistantResponse = null
        this.assistantResponse = new AssistantResponse(this.helperConfig["responseConfig"], this.callbacks)
        logGA("Force Fullscreen: AssistantResponse Reloaded")
        break
      case "GA_STOP":
        if (this.assistantResponse.response && this.GAStatus.actual == "reply") this.assistantResponse.conversationForceEnd()
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
    if (noti.startsWith("CB_")) return this.EXTs.callbacks(noti,payload)
    switch(noti) {
      case "LOAD_RECIPE":
        this.parseLoadedRecipe(payload)
        break
      case "NOT_INITIALIZED":
        this.assistantResponse.fullscreen(true)
        this.assistantResponse.showError(this.translate(payload.message,{ VALUES: payload.values } ))
        this.assistantResponse.forceStatusImg("userError")
        break
      case "WARNING":
        this.sendNotification("EXT_ALERT", {
          message: this.translate(payload),
          type: "warning",
          timer: 10000
        })
        break
      case "INFORMATION":
        // maybe for later
        break
      case "ERROR":
        this.sendNotification("EXT_ALERT", {
          message: this.translate(payload),
          type: "error"
        })
        break
      case "RECIPE_ERROR":
        this.sendNotification("EXT_ALERT", {
          message: this.translate("GAErrorRecipe", { VALUES: payload }),
          type: "error"
        })
        break
      case "GA-INIT":
        this.EXT_Config()
        break
      case "WEBSITE-INIT":
        this.sendSocketNotification("SMARTHOME-INIT")
        break
      case "INITIALIZED":
        logGA("Initialized.")
        this.assistantResponse.Version(payload)
        this.assistantResponse.status("standby")
        this.doPlugin("onReady")
        this.EXTs.setGA_Ready()
        this.sendNotification("GA_READY")
        break
      case "ASSISTANT_RESULT":
        if (payload.volume !== null) this.sendNotification("EXT_VOLUME-SPEAKER_SET", payload.volume)
        this.assistantResponse.start(payload)
        break
      case "TUNNEL":
        this.assistantResponse.tunnel(payload)
        break
      case "ASSISTANT_ACTIVATE":
        this.assistantActivate(payload)
        break
      case "GOOGLESEARCH-RESULT":
        this.sendGoogleResult(payload)
        break
      case "REMOTE_ACTIVATE_ASSISTANT":
        this.notificationReceived("GA_ACTIVATE", payload)
        break
      case "TB_SYSINFO-RESULT":
        this.show_sysinfo(payload)
        break
      case "SYSINFO-RESULT":
        this.sysInfo.updateSystemData(payload)
        break
      case "SendNoti":
        if (payload.payload && payload.noti) this.sendNotification(payload.noti, payload.payload)
        else this.sendNotification(payload)
        break
      case "SendStop":
        this.EXTs.ActionsEXTs("EXT_STOP")
        break
    }
  },

  start: function () {
    const helperConfig = [
      "debug", "recipes", "assistantConfig", "responseConfig", "website"
    ]

    if (this.config.debug) logGA = (...args) => { console.log("[GA]", ...args) }

    this.helperConfig = {}
    for(var i = 0; i < helperConfig.length; i++) {
      this.helperConfig[helperConfig[i]] = this.config[helperConfig[i]]
    }
    this.helperConfig.micConfig = {
      recorder: "auto",
      device: "default"
    }

    this.forceResponse= false
    this.assistantResponse = null
    this.globalStopCommands = []

    if (Array.isArray(this.config.otherStopCommands)) {
      this.globalStopCommands = this.config.otherStopCommands
    }

    this.GAStatus = {
      actual: "standby",
      old : "standby"
    }

    this.plugins= {
      onReady: [],
      onNotificationReceived: [],
      onActivate: [],
      onStatus: []
    }
    this.commands= {}
    this.transcriptionHooks= {}
    this.responseHooks= {}

    this.callbacks = {
      assistantActivate: (payload)=>{
        this.assistantActivate(payload)
      },
      postProcess: (response, callback_done, callback_none)=> {
        this.postProcess(response, callback_done, callback_none)
      },
      endResponse: ()=>{
        logGA("Conversation Done")
      },
      translate: (text) => {
        return this.translate(text)
      },
      GAStatus: (status) => {
        this.doPlugin("onStatus", {status: status})
        this.GAStatus = status
        this.sendNotification("ASSISTANT_" + this.GAStatus.actual.toUpperCase())
        this.EXTs.ActionsGA(this.GAStatus.actual.toUpperCase())
      },
      Gateway: (response)=> {
        return this.ScanResponse(response)
      },
      "sendSocketNotification": (noti, params) => {
        this.sendSocketNotification(noti, params)
      }
    }

    this.assistantResponse = new AssistantResponse(this.helperConfig["responseConfig"], this.callbacks)
    this.AssistantSearch = new AssistantSearch(this.helperConfig.assistantConfig)

    this.assistantResponse.prepareGA()
    this.assistantResponse.prepareBackground ()
    this.assistantResponse.Loading()

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
    this.parseLoadedRecipe(JSON.stringify(StopCommand))
    logGA("[HOOK] EXT_Stop Command Added")

    // add default command to globalStopCommand (if needed)
    if (this.globalStopCommands.indexOf(this.config.stopCommand) == -1) {
      this.globalStopCommands.push(this.config.stopCommand)
    }

    // create all transcriptionHooks from globalStopCommands array
    if (this.globalStopCommands.length) {
      this.globalStopCommands.forEach((pattern,i) => {
        var Command = {
          transcriptionHooks: {}
        }
        Command.transcriptionHooks["EXT_Stop"+i] = {
          pattern: `^(${pattern})($)`,
          command: "EXT_Stop"
        }
        this.parseLoadedRecipe(JSON.stringify(Command))
        logGA(`[HOOK] Add pattern for EXT_Stop command: ${pattern}`)
      })
    }
    else { // should never happen !
      console.error("[GA] No Stop Commands defined!")
    }

    this.sendSocketNotification("PRE-INIT", this.helperConfig)
  },

  async EXT_Config() {
    const Tools = {
      translate: (...args) => this.translate(...args),
      sendNotification: (...args) => this.sendNotification(...args),
      sendSocketNotification: (...args) => this.sendSocketNotification(...args),
      socketNotificationReceived: (...args) => this.socketNotificationReceived(...args),
      notificationReceived: (...args) => this.notificationReceived(...args),
      lock: () => this.EXTs.forceLockPagesAndScreen(),
      unLock: () => this.EXTs.forceUnLockPagesAndScreen()
    }
    this.EXTs = new EXTs(Tools)
    await this.EXTs.init()
    this.session= {}
    this.sysInfo = new sysInfoPage(Tools)
    this.sysInfo.prepare()

    this.sendSocketNotification("WEBSITE-INIT", {
      DB: this.EXTs.ExtDB,
      Description: this.EXTs.Get_EXT_Description(),
      Translate: this.EXTs.Get_EXT_Translation(),
      Schema: this.EXTs.Get_EXT_TrSchemaValidation(),
      EXTStatus: this.EXTs.Get_EXT_Status()
    })
  },

  /********************************/
  /*** EXT-TelegramBot Commands ***/
  /********************************/
  EXT_TELBOTCommands: function(commander) {
    commander.add({
      command: "query",
      description: this.translate("QUERY_HELP"),
      callback: "tbQuery"
    })
    commander.add({
      command: "stop",
      description: this.translate("STOP_HELP"),
      callback: "tbStopEXT"
    })
    commander.add({
      command: 'sysinfo',
      description: this.translate("TB_SYSINFO_DESCRIPTION"),
      callback: 'cmd_sysinfo'
    })
  },

  tbQuery: function(command, handler) {
    var query = handler.args
    if (!query) handler.reply("TEXT", this.translate("QUERY_HELP"))
    else this.assistantActivate({ type:"TEXT", key: query })
  },

  tbStopEXT: function(command, handler) {
    this.sendNotification("EXT_STOP")
    handler.reply("TEXT", this.translate("STOP_EXT"))
  },

  cmd_sysinfo: function(command,handler) {
    if (handler.args) {
      var args = handler.args.toLowerCase().split(" ")
      var params = handler.args.split(" ")
      if (args[0] == "show") {
        this.sysInfo.show()
        handler.reply("TEXT", "ok.")
        return
      }
      if (args[0] == "hide") {
        this.sysInfo.hide()
        handler.reply("TEXT", "ok.")
        return
      }
    }
    /** try to manage session ... **/
    let chatId = handler.message.chat.id
    let userId = handler.message.from.id
    let messageId = handler.message.message_id
    let sessionId = messageId + ":" + userId + ":" + chatId
    this.session[sessionId] = handler
    this.sendSocketNotification("TB_SYSINFO", sessionId)
  },

  show_sysinfo: function(result) {
    let session = result.sessionId
    let handler = this.session[session]
    if (!handler || !session) return console.error("[Gateway] TB session not found!", handler, session)
    var text = ""
    text += "*" + result['HOSTNAME'] + "*\n\n"
    // version
    text += "*-- " + this.translate("GW_System_Box_Version") + " --*\n"
    text += "*" + "MMM-GoogleAssistant:* `" + result['VERSION']['GA'] + "`\n"
    text += "*" + "MagicMirror²:* `" + result['VERSION']['MagicMirror'] + "`\n"
    text += "*" + "Electron:* `" + result['VERSION']['ELECTRON'] + "`\n"
    text += "*" + "MagicMirror² " + this.translate("GW_System_NodeVersion") + "* `" + result['VERSION']['NODEMM'] + "`\n"
    text += "*" + this.translate("GW_System_NodeVersion") + "* `" + result['VERSION']['NODECORE'] + "`\n"
    text += "*" + this.translate("GW_System_NPMVersion") + "* `" + result['VERSION']['NPM'] + "`\n"
    text += "*" + this.translate("GW_System_OSVersion") + "* `" + result['VERSION']['OS'] + "`\n"
    text += "*" + this.translate("GW_System_KernelVersion") + "* `" + result['VERSION']['KERNEL'] + "`\n"
    // GPU
    text += "*-- GPU --*\n"
    let GPU_INFO = result.GPU ? this.translate("GW_System_GPUAcceleration_Enabled") : ("WARN: " + this.translate("GW_System_GPUAcceleration_Disabled"))
    text += "*" + GPU_INFO + "*\n"
    // CPU
    text += "*-- " + this.translate("GW_System_CPUSystem") + " --*\n"
    text += "*" + this.translate("GW_System_TypeCPU") + "* `" + result['CPU']['type'] + "`\n"
    text += "*" + this.translate("GW_System_SpeedCPU") + "* `" + result['CPU']['speed'] + "`\n"
    text += "*" + this.translate("GW_System_CurrentLoadCPU") + "* `" + result['CPU']['usage'] + "%`\n"
    text += "*" + this.translate("GW_System_GovernorCPU") + "* `" + result['CPU']['governor'] + "`\n"
    text += "*" + this.translate("GW_System_TempCPU") + "* `" + (config.units == "metric" ? result['CPU']['temp']["C"] : result['CPU']['temp']["F"]) + "°`\n"
    // memory
    text += "*-- " + this.translate("GW_System_MemorySystem") + " --*\n"
    text += "*" + this.translate("GW_System_TypeMemory") + "* `" + result['MEMORY']['used'] + " / " + result['MEMORY']['total'] + " (" + result['MEMORY']['percent'] + "%)`\n"
    text += "*" + this.translate("GW_System_SwapMemory") + "* `" + result['MEMORY']['swapUsed'] + " / " + result['MEMORY']['swapTotal'] + " (" + result['MEMORY']['swapPercent'] + "%)`\n"
    // network
    text += "*-- " + this.translate("GW_System_NetworkSystem") + " --*\n"
    text += "*" + this.translate("GW_System_IPNetwork") + "* `" + result['NETWORK']['ip'] + "`\n"
    text += "*" + this.translate("GW_System_InterfaceNetwork") + "* `" + result['NETWORK']['name'] + " (" + (result['NETWORK']['type'] == "wired" ? this.translate("TB_SYSINFO_ETHERNET") : this.translate("TB_SYSINFO_WLAN")) + ")`\n"
    if (result['NETWORK']['type'] == "wired") {
      text += "*" + this.translate("GW_System_SpeedNetwork") + "* `" + result['NETWORK']['speed'] + " Mbit/s`\n"
      text += "*" + this.translate("GW_System_DuplexNetwork") + "* `" + result['NETWORK']['duplex'] + "`\n"
    } else {
      text += "*" + this.translate("GW_System_WirelessInfo") + ":*\n"
      text += "*  " + this.translate("GW_System_SSIDNetwork") + "* `" + result['NETWORK']['ssid'] + "`\n"
      text += "*  " + this.translate("GW_System_FrequencyNetwork") + "* `" + result['NETWORK']['frequency'] + " GHz`\n"
      text += "*  " + this.translate("GW_System_RateNetwork") + "* `" + result['NETWORK']['rate'] + " Mb/s`\n"
      text += "*  " + this.translate("GW_System_QualityNetwork") + "* `" + result['NETWORK']['quality'] + "`\n"
      text += "*  " + this.translate("GW_System_SignalNetwork") + "* `" + result['NETWORK']['signalLevel'] + " dBm (" + result['NETWORK']['barLevel'] + ")`\n"
    }
    // storage
    text += "*-- " + this.translate("GW_System_StorageSystem") + " --*\n"
    result['STORAGE'].forEach(partition => {
      for (let [name, values] of Object.entries(partition)) {
        text += "*" + this.translate("GW_System_MountStorage") + " " + name + ":* `" + values.used + " / " + values.size + " (" + values.use + "%)`\n"
      }
    })
    // uptimes
    text += "*-- " + this.translate("GW_System_UptimeSystem") + " --*\n"
    text += "*" + this.translate("GW_System_CurrentUptime") + ":*\n"
    text += "*  " + this.translate("GW_System_System") + "* `" + result['UPTIME']['currentDHM'] + "`\n"
    text += "*  MagicMirror²:* `" + result['UPTIME']['MMDHM'] + "`\n"
    text += "*" + this.translate("GW_System_RecordUptime") + ":*\n"
    text += "*  " + this.translate("GW_System_System") + "* `" + result['UPTIME']['recordCurrentDHM'] + "`\n"
    text += "*  MagicMirror²:* `" + result['UPTIME']['recordMMDHM'] + "`\n"

    handler.reply("TEXT", text, {parse_mode:'Markdown'})
    delete this.session[session]
  },

  /** Activate Process **/
  assistantActivate: function(payload) {
    if (this.GAStatus.actual != "standby" && !payload.force) return logGA("Assistant is busy.")
    this.assistantResponse.clearAliveTimers()
    if (this.GAStatus.actual== "continue") this.assistantResponse.showTranscription(this.translate("GAContinue"))
    else this.assistantResponse.showTranscription(this.translate("GABegin"))
    this.doPlugin("onActivate")
    this.assistantResponse.fullscreen(true)
    this.lastQuery = null
    var options = {
      type: "TEXT",
      key: null,
      lang: this.config.assistantConfig.lang,
      status: this.GAStatus.old,
      chime: true
    }
    var options = Object.assign({}, options, payload)
    this.assistantResponse.status(options.type, (options.chime) ? true : false)
    this.sendSocketNotification("ACTIVATE_ASSISTANT", options)
  },

  postProcess(response, callback_done=()=>{}, callback_none=()=>{}) {
    if (response.lastQuery.status == "continue") return callback_none()
    var foundHook = this.findAllHooks(response)
    if (foundHook.length > 0) {
      this.assistantResponse.status("hook")
      for (var i = 0; i < foundHook.length; i++) {
        var hook = foundHook[i]
        this.doCommand(hook.command, hook.params, hook.from)
      }
      if (this.forceResponse) {
        this.forceResponse = false
        callback_none()
      } else callback_done()
    } else {
      callback_none()
    }
  },

  /** scan response **/
  ScanResponse: function (response) {
    if (response.screen && (response.screen.links.length > 0 || response.screen.photos.length > 0)) {
      let opt = {
        "photos": response.screen.photos,
        "urls": response.screen.links,
        "youtube": null
      }
      logGA("Send response:", opt)
      this.notificationReceived("EXT_GATEWAY", opt)
    } else if (response.text) {
      if (this.AssistantSearch.GoogleSearch(response.text)) {
        this.sendSocketNotification("GOOGLESEARCH", response.transcription.transcription)
      } else if (this.AssistantSearch.YouTubeSearch(response.text)) {
        logGA("Send response YouTube:", response.transcription.transcription)
        this.notificationReceived("EXT_GATEWAY", {
          "photos": [],
          "urls": [],
          "youtube": response.transcription.transcription
        })
      }
    }
  },

  sendGoogleResult: function (link) {
    if (!link) return console.error("[GA] No link to open!")
    logGA("Send response:", link)
    this.notificationReceived("EXT_GATEWAY", {
      "photos": [],
      "urls": [ link ],
      "youtube": null
    })
  },

  /** hooks **/
  findAllHooks: function(response) {
    var hooks = []
    hooks = hooks.concat(this.findTranscriptionHook(response))
    hooks = hooks.concat(this.findResponseHook(response))
    this.findNativeAction(response)
    return hooks
  },

  findResponseHook (response) {
    var found = []
    if (response.screen) {
      var res = []
      res.links = (response.screen.links) ? response.screen.links : []
      res.text = (response.screen.text) ? [].push(response.screen.text) : []
      res.photos = (response.screen.photos) ? response.screen.photos : []
      for (var k in this.responseHooks) {
        if (!this.responseHooks.hasOwnProperty(k)) continue
        var hook = this.responseHooks[k]
        if (!hook.where || !hook.pattern || !hook.command) continue
        var pattern = new RegExp(hook.pattern, "ig")
        var f = pattern.exec(res[hook.where])
        if (f) {
          found.push({
            "from": k,
            "params":f,
            "command":hook.command
          })
          logGA("ResponseHook matched:", k)
        }
      }
    }
    return found
  },

  findTranscriptionHook (response) {
    var foundHook = []
    var transcription = (response.transcription) ? response.transcription.transcription : ""
    for (var k in this.transcriptionHooks) {
      if (!this.transcriptionHooks.hasOwnProperty(k)) continue
      var hook = this.transcriptionHooks[k]
      if (hook.pattern && hook.command) {
        var pattern = new RegExp(hook.pattern, "ig")
        var found = pattern.exec(transcription)
        if (found) {
          foundHook.push({
            "from":k,
            "params":found,
            "command":hook.command
          })
          logGA("TranscriptionHook matched:", k)
        }
      } else {
        logGA(`TranscriptionHook:${k} has invalid format`)
        continue
      }
    }
    return foundHook
  },

  doCommand (commandId, originalParam, from) {
    if (this.commands.hasOwnProperty(commandId)) {
      var command = this.commands[commandId]
      if (command.displayResponse) this.forceResponse = true
    } else {
      logGA(`Command ${commandId} is not found.`)
      return
    }
    var param = (typeof originalParam == "object") ? Object.assign({}, originalParam) : originalParam

    if (command.hasOwnProperty("notificationExec")) {
      var ne = command.notificationExec
      if (ne.notification) {
        var fnen = (typeof ne.notification == "function") ?  ne.notification(param, from) : ne.notification
        var nep = (ne.payload) ? ((typeof ne.payload == "function") ?  ne.payload(param, from) : ne.payload) : null
        var fnep = (typeof nep == "object") ? Object.assign({}, nep) : nep
        logGA(`Command ${commandId} is executed (notificationExec).`)
        this.sendNotification(fnen, fnep)
      }
    }

    if (command.hasOwnProperty("shellExec")) {
      var se = command.shellExec
      if (se.exec) {
        var fs = (typeof se.exec == "function") ? se.exec(param, from) : se.exec
        var so = (se.options) ? ((typeof se.options == "function") ? se.options(param, from) : se.options) : null
        var fo = (typeof so == "function") ? so(param, key) : so
        if (fs) {
          logGA(`Command ${commandId} is executed (shellExec).`)
          this.sendSocketNotification("SHELLEXEC", {command:fs, options:fo})
        }
      }
    }

    if (command.hasOwnProperty("moduleExec")) {
      var me = command.moduleExec
      var mo = (typeof me.module == 'function') ? me.module(param, from) : me.module
      var m = (Array.isArray(mo)) ? mo : new Array(mo)
      if (typeof me.exec == "function") {
        MM.getModules().enumerate((mdl)=>{
          if (m.length == 0 || (m.indexOf(mdl.name) >=0)) {
            logGA(`Command ${commandId} is executed (moduleExec) for :`, mdl.name)
            me.exec(mdl, param, from)
          }
        })
      }
    }

    if (command.hasOwnProperty("soundExec")) {
      var snde = command.soundExec
      if (snde.chime && typeof snde.chime == 'string') {
        if (snde.chime == "open") this.assistantResponse.playChime("open")
        if (snde.chime == "close") this.assistantResponse.playChime("close")
        if (snde.chime == "opening") this.assistantResponse.playChime("opening")
        if (snde.chime == "closing") this.assistantResponse.playChime("closing")
      }
      if (snde.sound && typeof snde.sound == 'string') {
        this.assistantResponse.playChime(snde.sound, true)
      }
    }
  },

  parseLoadedRecipe(payload) {
    let reviver = (key, value) => {
      if (typeof value === 'string' && value.indexOf('__FUNC__') === 0) {
        value = value.slice(8)
        let functionTemplate = `(${value})`
        return eval(functionTemplate)
      }
      return value
    }
    var p = JSON.parse(payload, reviver)

    if (p.hasOwnProperty("commands")) {
      this.registerCommandsObject(p.commands)
    }
    if (p.hasOwnProperty("transcriptionHooks")) {
      this.registerTranscriptionHooksObject(p.transcriptionHooks)
    }
    if (p.hasOwnProperty("responseHooks")) {
      this.registerResponseHooksObject(p.responseHooks)
    }
    if (p.hasOwnProperty("plugins")) {
      this.registerPluginsObject(p.plugins)
    }
  },

  doPlugin(pluginName, args) { // to verify
    if (this.plugins.hasOwnProperty(pluginName)) {
      var plugins = this.plugins[pluginName]
      if (Array.isArray(plugins) && plugins.length > 0) {
        for (var i = 0; i < plugins.length; i++) {
          var job = plugins[i]
          this.doCommand(job, args, pluginName)
        }
      }
    }
  },

  registerPluginsObject (obj) {
    for (var pop in this.plugins) {
      if (obj.hasOwnProperty(pop)) {
        var candi = []
        if (Array.isArray(obj[pop])) {
          candi = candi.concat(obj[pop])
        } else {
          candi.push(obj[pop].toString())
        }
        for (var i = 0; i < candi.length; i++) {
          this.registerPlugin(pop, candi[i])
        }
      }
    }
  },

  registerPlugin(plugin, command) {
    if (this.plugins.hasOwnProperty(plugin)) {
      if (Array.isArray(command)) {
        this.plugins[plugin].concat(command)
      }
      this.plugins[plugin].push(command)
    }
  },

  registerCommandsObject (obj) {
    this.commands = Object.assign({}, this.commands, obj)
  },

  registerTranscriptionHooksObject (obj) {
    this.transcriptionHooks = Object.assign({}, this.transcriptionHooks, obj)
  },

  registerResponseHooksObject (obj) {
    this.responseHooks = Object.assign({}, this.responseHooks, obj)
  },

  findNativeAction (response) {
    var action = (response.action) ? response.action : null
    if (!action || !action.inputs) return
    action.inputs.forEach(input => {
      if (input.intent == "action.devices.EXECUTE") {
        input.payload.commands.forEach(command => {
          command.execution.forEach(exec => {
            logGA("Native Action: " + exec.command, exec.params)
            if (exec.command == "action.devices.commands.SetVolume") {
              logGA("Volume Control:", exec.params.volumeLevel)
              this.sendNotification("EXT_VOLUME-SPEAKER_SET", exec.params.volumeLevel)
            }
          })
        })
      }
    })
  }
})
