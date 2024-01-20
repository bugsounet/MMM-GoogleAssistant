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
      "/modules/MMM-GoogleAssistant/components/GAConfig.js",
      "/modules/MMM-GoogleAssistant/components/activateProcess.js",
      "/modules/MMM-GoogleAssistant/components/assistantResponse.js",
      "/modules/MMM-GoogleAssistant/components/assistantSearch.js",
      "/modules/MMM-GoogleAssistant/components/Gateway.js",
      "/modules/MMM-GoogleAssistant/components/Hooks.js",
      "/modules/MMM-GoogleAssistant/components/EXT_Actions.js",
      "/modules/MMM-GoogleAssistant/components/EXT_Callbacks.js",
      "/modules/MMM-GoogleAssistant/components/EXT_NotificationsActions.js",
      "/modules/MMM-GoogleAssistant/components/EXT_OthersRules.js",
      "/modules/MMM-GoogleAssistant/components/EXT_Database.js",
      "/modules/MMM-GoogleAssistant/components/EXT_Translations.js",
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

  start: function () {
    this.GAConfig = new GAConfig(this)
  },

  getDom: function() {
    var dom = document.createElement("div")
    dom.style.display = 'none'
    return dom
  },

  notificationReceived: function(noti, payload=null, sender=null) {
    this.Hooks.doPlugin(this, "onNotificationReceived", {notification:noti, payload:payload})
    if (noti.startsWith("EXT_")) return this.EXT_NotificationsActions.Actions(this,noti,payload,sender)
    switch (noti) {
      case "GA_ACTIVATE":
        if (payload && payload.type && payload.key) this.activateProcess.assistantActivate(this, payload)
        else this.activateProcess.assistantActivate(this, { type:"MIC" })
        break
      case "GA_FORCE_FULLSCREEN":
        if (this.config.responseConfig.useFullscreen) return logGA("Force Fullscreen: Already activated")
        this.GAConfig.forceFullScreen(this)
        logGA("Force Fullscreen: AssistantResponse Reloaded")
        break
      case "GA_STOP":
        if (this.assistantResponse.response && this.GAStatus.actual == "reply") this.assistantResponse.conversationForceEnd()
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
    if (noti.startsWith("CB_")) return this.EXT_Callbacks.cb(this,noti,payload)
    switch(noti) {
      case "LOAD_RECIPE":
        this.Hooks.parseLoadedRecipe(payload)
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
      case "PRE-INIT":
        this.GAConfig.EXT_Config(this)
        break
      case "INITIALIZED":
        logGA("Initialized.")
        this.assistantResponse.Version(payload)
        this.assistantResponse.status("standby")
        this.Hooks.doPlugin(this, "onReady")
        this.EXT.GA_Ready = true
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
        this.activateProcess.assistantActivate(this, payload)
        break
      case "GOOGLESEARCH-RESULT":
        this.Gateway.sendGoogleResult(this, payload)
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
        this.EXT_NotificationsActions.Actions(this, "EXT_STOP")
        break
    }
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
    else this.activateProcess.assistantActivate(this, { type:"TEXT", key: query })
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
  }
})
