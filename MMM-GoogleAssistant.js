/**
 ** Module : MMM-GoogleAssistant
 ** @bugsounet
 ** ©07-2023
 ** support: https://forum.bugsounet.fr
 **/

logGA = (...args) => { /* do nothing */ }

Module.register("MMM-GoogleAssistant", {
  requiresVersion: "2.24.0",
  defaults: {
    debug:false,
    stopCommand: "stop",
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
    recipes: []
  },

  getScripts: function() {
    return [
      "/modules/MMM-GoogleAssistant/components/GAConfig.js",
      "/modules/MMM-GoogleAssistant/components/activateProcess.js",
      "/modules/MMM-GoogleAssistant/components/assistantResponse.js",
      "/modules/MMM-GoogleAssistant/components/assistantSearch.js",
      "/modules/MMM-GoogleAssistant/components/Gateway.js",
      "/modules/MMM-GoogleAssistant/components/Hooks.js"
    ]
  },

  getStyles: function () {
    return [
      "/modules/MMM-GoogleAssistant/MMM-GoogleAssistant.css",
      "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css"
    ]
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      fr: "translations/fr.json",
      it: "translations/it.json",
      de: "translations/de.json",
      es: "translations/es.json",
      nl: "translations/nl.json",
      pt: "translations/pt.json",
      ko: "translations/ko.json",
      el: "translations/el.json",
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
      case "GA_BARD_MODE-OFF":
      case "EXT_STOP":
        this.bardMode = false
        logGA("bardMode:",this.bardMode)
        break
      case "GA_BARD_MODE-ON":
        this.bardMode = true
        logGA("bardMode:",this.bardMode)
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
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
      case "INITIALIZED":
        logGA("Initialized.")
        this.assistantResponse.Version(payload)
        this.assistantResponse.status("standby")
        this.Hooks.doPlugin(this, "onReady")
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
})
