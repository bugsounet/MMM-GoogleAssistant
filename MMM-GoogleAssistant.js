/**
 ** Module : MMM-GoogleAssistant v4
 ** @bugsounet
 ** ©01-2022
 ** support: https://forum.bugsounet.fr
 **/

logGA = (...args) => { /* do nothing */ }

Module.register("MMM-GoogleAssistant", {
  requiresVersion: "2.18.0",
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
  micConfig: {
    recorder: "auto",
    device: "default"
  },
  plugins: {
    onReady: [],
    onNotificationReceived: [],
    onActivate: [],
    onStatus: []
  },
  commands: {},
  transcriptionHooks: {},
  responseHooks: {},
  forceResponse: false,

  getScripts: function() {
    return [
       "/modules/MMM-GoogleAssistant/components/response.js"
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
      ko: "translations/ko.json"
    }
  },

  start: function () {
    this.aliveTimer = null
    const helperConfig = [
      "debug", "recipes", "assistantConfig",
      "responseConfig"
    ]
    this.helperConfig = {}
    this.helperConfig.micConfig = this.micConfig
    if (this.config.debug) logGA = (...args) => { console.log("[GA]", ...args) }

    for(var i = 0; i < helperConfig.length; i++) {
      this.helperConfig[helperConfig[i]] = this.config[helperConfig[i]]
    }
    this.GAStatus = {
      actual: "standby",
      old : "standby"
    }
    this.assistantResponse = null
    this.loadAssistantResponse()
    var StopHooks = {
      transcriptionHooks: {
        "EXT_Stop": {
          pattern: this.config.stopCommand,
          command: "EXT_Stop"
        }
      },
      commands: {
        "EXT_Stop": {
          moduleExec: {
            module: ["MMM-GoogleAssistant"],
            exec: "__FUNC__(module) => { module.stopCommand() }"
          },
          soundExec: {
            "chime": "close"
          },
          displayResponse: false
        }
      }
    }
    this.parseLoadedRecipe(JSON.stringify(StopHooks))
  },

  loadAssistantResponse: function () {
    var callbacks = {
      assistantActivate: (payload)=>{
        this.assistantActivate(payload)
      },
      postProcess: (response, callback_done, callback_none)=> {
        this.postProcess(response, callback_done, callback_none)
      },
      endResponse: ()=>{
        this.endResponse()
      },
      translate: (text) => {
        return this.translate(text)
      },
      GAStatus: (status) => {
        this.doPlugin("onStatus", {status: status})
        this.GAStatus = status
        this.sendNotification("ASSISTANT_" + this.GAStatus.actual.toUpperCase())
      },
      Gateway: (response)=> {
        return this.SendToGateway(response)
      },
      "sendSocketNotification": (noti, params) => {
        this.sendSocketNotification(noti, params)
      }
    }

    this.assistantResponse = new AssistantResponse(this.helperConfig["responseConfig"], callbacks)
  },

  doPlugin: function(pluginName, args) {
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

  registerPluginsObject: function (obj) {
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

  registerPlugin: function (plugin, command) {
    if (this.plugins.hasOwnProperty(plugin)) {
      if (Array.isArray(command)) {
        this.plugins[plugin].concat(command)
      }
      this.plugins[plugin].push(command)
    }
  },

  registerCommandsObject: function (obj) {
    this.commands = Object.assign({}, this.commands, obj)
  },

  registerTranscriptionHooksObject: function (obj) {
    this.transcriptionHooks = Object.assign({}, this.transcriptionHooks, obj)
  },

  registerResponseHooksObject: function (obj) {
    this.responseHooks = Object.assign({}, this.responseHooks, obj)
  },

  getDom: function() {
    /** position not used in v4 **/
    var dom = document.createElement("div")
    dom.style.display = 'none'
    return dom
  },

  notificationReceived: function(noti, payload=null, sender=null) {
    this.doPlugin("onNotificationReceived", {notification:noti, payload:payload})
    switch (noti) {
      case "DOM_OBJECTS_CREATED":
        this.assistantResponse.prepareGA()
        this.assistantResponse.prepareBackground ()
        this.sendSocketNotification("INIT", this.helperConfig)
        this.Loading()
        break
      case "GAv4_ACTIVATE":
        if (payload && payload.type && payload.key) this.assistantActivate(payload)
        else this.assistantActivate({ type:"MIC" })
        break
      case "GAv4_FORCE_FULLSCREEN":
        if (this.config.responseConfig.useFullscreen) return logGA("Force Fullscreen: Already activated")
        // change configuration and reload AssistantResponse
        this.config.responseConfig.useFullscreen= true
        this.assistantResponse = null
        this.loadAssistantResponse()
        logGA("Force Fullscreen: AssistantResponse Reloaded")
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
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
      case "ERROR":
        // maybe for futur
        break
      case "INITIALIZED":
        logGA("Initialized.")
        this.Version(payload)
        this.assistantResponse.status("standby")
        this.doPlugin("onReady")
        this.sendNotification("GAv4_READY")
        break
      case "ASSISTANT_RESULT":
        if (payload.volume !== null) {
          this.sendNotification("EXT_VOLUME-SET", payload.volume)
        }
        this.assistantResponse.start(payload)
        break
      case "TUNNEL":
        this.assistantResponse.tunnel(payload)
        break
      case "ASSISTANT_ACTIVATE":
        this.assistantActivate(payload)
        break
      case "AUDIO_END":
        this.assistantResponse.end()
        break

      /** detector ON/OFF **/
      case "DETECTOR_START":
        this.sendNotification("EXT_DETECTOR-START")
        break
      case "DETECTOR_STOP":
        this.sendNotification("EXT_DETECTOR-STOP")
        break
    }
  },

  parseLoadedRecipe: function(payload) {
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

  clearAliveTimers() {
    clearTimeout(this.assistantResponse.aliveTimer)
    this.assistantResponse.aliveTimer = null
    clearTimeout(this.aliveTimer)
    this.aliveTimer = null
  },

  assistantActivate: function(payload) {
    if (this.GAStatus.actual != "standby" && !payload.force) return logGA("Assistant is busy.")
    this.clearAliveTimers()
    if (this.GAStatus.actual== "continue") this.assistantResponse.showTranscription(this.translate("GAContinue"))
    else this.assistantResponse.showTranscription(this.translate("GABegin"))
    this.sendNotification("EXT_DETECTOR-STOP")
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

  endResponse: function() {
    this.sendNotification("EXT_DETECTOR-START")
  },

  postProcess: function (response, callback_done=()=>{}, callback_none=()=>{}) {
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

  findAllHooks: function (response) {
    var hooks = []
    hooks = hooks.concat(this.findTranscriptionHook(response))
    hooks = hooks.concat(this.findResponseHook(response))
    this.findNativeAction(response)
    return hooks
  },

  findResponseHook: function (response) {
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

  findTranscriptionHook: function (response) {
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

  findNativeAction: function (response) {
    var action = (response.action) ? response.action : null
    if (!action || !action.inputs) return
    action.inputs.forEach(input => {
      if (input.intent == "action.devices.EXECUTE") {
        input.payload.commands.forEach(command => {
          command.execution.forEach(exec => {
            logGA("Native Action: " + exec.command, exec.params)
            if (exec.command == "action.devices.commands.SetVolume") {
              logGA("Volume Control:", exec.params.volumeLevel)
              this.sendNotification("EXT_VOLUME-SET", exec.params.volumeLevel)
            }
          })
        })
      }
    })
  },

  doCommand: function (commandId, originalParam, from) {
    if (this.commands.hasOwnProperty(commandId)) {
      var command = this.commands[commandId]
      if (command.displayResponse) this.forceResponse = true
    } else {
      logGA(`Command ${commandId} is not found.`)
      return
    }
    var param = (typeof originalParam == "object")
      ? Object.assign({}, originalParam) : originalParam

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

    if (command.hasOwnProperty("functionExec")) {
      var fe = command.functionExec
      if (typeof fe.exec == "function") {
        logGA(`Command ${commandId} is executed (functionExec)`)
        fe.exec(param, from)
      }
    }

    if (command.hasOwnProperty("soundExec")) {
      var snde = command.soundExec
      if (snde.chime && typeof snde.chime == 'string') {
        if (snde.chime == "open") this.assistantResponse.playChime("open")
        if (snde.chime == "close") this.assistantResponse.playChime("close")
      }
      if (snde.sound && typeof snde.sound == 'string') {
        this.assistantResponse.playChime(snde.sound, true)
      }
    }
  },

  /****************************/
  /*** TelegramBot Commands ***/
  /****************************/
  getCommands: function(commander) {
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
    else this.assistantActivate({ type:"TEXT", key: query })
  },

  tbStopEXT: function(command, handler) {
    this.stopCommand()
    handler.reply("TEXT", this.translate("STOP_EXT"))
  },

  Loading: function () {
    this.assistantResponse.forceStatusImg("standby")
    this.assistantResponse.showTranscription(this.translate("GALoading") + " MMM-GoogleAssistant")
    this.assistantResponse.fullscreen(true,null,false)
  },

  Version: function (version) {
    this.assistantResponse.showTranscription("MMM-GoogleAssistant v" + version.version + " (" + version.rev + ") ©bugsounet " + this.translate("GAReady"))
    this.assistantResponse.fullscreen(true,null,false)
    this.aliveTimer = setTimeout(() => {
      this.assistantResponse.end(false)
      this.assistantResponse.showTranscription("")
    }, this.config.responseConfig.screenOutputTimer)
  },

  stopCommand: function() {
    this.sendNotification("EXT_ALERT", {
      type: "information",
      message: this.translate("EXTStop")
    })
    this.sendNotification("EXT_STOP")
  },

  /** Send needed part of response to Gateway **/
  SendToGateway: function(response) {
    if (response.screen && (response.screen.links.length > 0 || response.screen.photos.length > 0)) {
      let opt = {
        "photos": response.screen.photos,
        "urls": response.screen.links,
      }
      logGA("Send response to Gateway:", opt)
      this.sendNotification("EXT_GATEWAY", opt)
    }
  }
})
