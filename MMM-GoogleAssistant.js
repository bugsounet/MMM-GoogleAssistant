/**
 ** Module : MMM-GoogleAssistant v3
 ** @bugsounet
 ** ©11-2021
 ** support: http://forum.bugsounet.fr
 **/

logGA = (...args) => { /* do nothing */ }

Module.register("MMM-GoogleAssistant", {
  requiresVersion: "2.15.0",
  defaults: {
    debug:false,
    assistantConfig: {
      lang: "en-US",
      latitude: 51.508530,
      longitude: -0.076132
    },
    responseConfig: {
      useFullscreen: false,
      useResponseOutput: true,
      responseOutputCSS: "response_output.css",
      screenOutputTimer: 5000,
      useAudioOutput: true,
      useChime: true,
      confirmationChime: true,
      useInformations: true,
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
    recipes: [],
    NPMCheck: {
      useChecker: true,
      delay: 10 * 60 * 1000,
      useAlert: true
    }
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
       "/modules/MMM-GoogleAssistant/components/response.js",
       "https://cdn.materialdesignicons.com/5.2.45/css/materialdesignicons.min.css",
       "https://code.iconify.design/1/1.0.6/iconify.min.js",
    ]
  },

  getStyles: function () {
    return [
      "/modules/MMM-GoogleAssistant/MMM-GoogleAssistant.css",
      "font-awesome.css",
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
      ko: "translatiios/ko.json"
    }
  },

  start: function () {
    this.init= false
    this.aliveTimer = null
    this.userPresence = null
    this.lastPresence = null
    this.Infos= {
      displayed: false,
      buffer: []
    }
    const helperConfig = [
      "debug", "recipes", "assistantConfig",
      "responseConfig", "NPMCheck"
    ]
    this.helperConfig = {}
    this.helperConfig.micConfig = this.micConfig
    if (this.config.debug) logGA = (...args) => { console.log("[GA]", ...args) }

    for(var i = 0; i < helperConfig.length; i++) {
      this.helperConfig[helperConfig[i]] = this.config[helperConfig[i]]
    }
    this.myStatus = {
      actual: "standby",
      old : "standby"
    }
    var callbacks = {
      assistantActivate: (payload)=>{
        this.assistantActivate(payload)
      },
      postProcess: (response, callback_done, callback_none)=>{
        this.postProcess(response, callback_done, callback_none)
      },
      endResponse: ()=>{
        this.endResponse()
      },
      translate: (text) => {
        return this.translate(text)
      },
      myStatus: (status) => {
        this.doPlugin("onStatus", {status: status})
        this.myStatus = status
        this.sendNotification("ASSISTANT_" + this.myStatus.actual.toUpperCase())
      },

      "sendSocketNotification": (noti, params) => {
        this.sendSocketNotification(noti, params)
      },
      "Informations": (info) => this.Informations("information", info),
      "Warning": (info) => this.Informations("warning", info)
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
    var dom = document.createElement("div")
    this.assistantResponse.preparePopup()
    this.assistantResponse.prepareBackground ()
    return dom
  },

  notificationReceived: function(noti, payload=null, sender=null) {
    this.doPlugin("onNotificationReceived", {notification:noti, payload:payload})
    switch (noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.helperConfig)
        this.assistantResponse.prepareGA()
        this.Loading()
        break
      case "GA_ACTIVATE":
        this.assistantActivate({ type:"MIC" })
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
    switch(noti) {
      case "NPM_UPDATE":
        if (payload && payload.length > 0) {
          if (this.config.NPMCheck.useAlert) {
            payload.forEach(npm => {
              this.sendNotification("SHOW_ALERT", {
                type: "notification" ,
                message: "[NPM] " + npm.library + " v" + npm.installed +" -> v" + npm.latest,
                title: this.translate("UPDATE_NOTIFICATION_MODULE", { MODULE_NAME: npm.module }),
                timer: this.config.NPMCheck.delay - 2000
              })
            })
          }
          this.sendNotification("NPM_UPDATE", payload)
        }
        break
      case "LOAD_RECIPE":
        this.parseLoadedRecipe(payload)
        break
      case "NOT_INITIALIZED":
        this.assistantResponse.fullscreen(true)
        this.assistantResponse.showError(this.translate(payload.message,{ VALUES: payload.values } ))
        this.assistantResponse.forceStatusImg("userError")
        break
      case "ERROR":
        this.Informations("warning", { message: payload })
        break
      case "WARNING":
        this.Informations("warning", payload)
        break
      case "INFORMATION":
        this.Informations("information", payload)
        break
      case "INITIALIZED":
        logGA("Initialized.")
        this.Version(payload)
        this.assistantResponse.status("standby")
        this.doPlugin("onReady")
        break
      case "ASSISTANT_RESULT":
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
        this.sendNotification("DETECTOR_START")
        break
      case "DETECTOR_STOP":
        this.sendNotification("DETECTOR_STOP")
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
    if (this.myStatus.actual != "standby" && !payload.force) return logGA("Assistant is busy.")
    this.clearAliveTimers()
    if (this.myStatus.actual== "continue") this.assistantResponse.showTranscription(this.translate("GAContinue"))
    else this.assistantResponse.showTranscription(this.translate("GABegin"))
    this.sendNotification("DETECTOR_STOP")
    this.doPlugin("onActivate")
    this.assistantResponse.fullscreen(true)
    this.lastQuery = null
    var options = {
      type: "TEXT",
      key: null,
      lang: this.config.assistantConfig.lang,
      useResponseOutput: this.config.responseConfig.useResponseOutput,
      useAudioOutput: this.config.responseConfig.useAudioOutput,
      status: this.myStatus.old,
      chime: true
    }
    var options = Object.assign({}, options, payload)
    this.assistantResponse.status(options.type, (options.chime) ? true : false)
    this.sendSocketNotification("ACTIVATE_ASSISTANT", options)
  },

  endResponse: function() {
    this.sendNotification("DETECTOR_START")
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
  },

  tbQuery: function(command, handler) {
    var query = handler.args
    if (!query) handler.reply("TEXT", this.translate("QUERY_HELP"))
    else this.assistantActivate({ type:"TEXT", key: query })
  },

  /** Information buffer to array **/
  Informations(type,info) {
    let informationsType = [ "warning", "information" ]
    if (informationsType.indexOf(type) == -1) {
      logGA("debug information:", type, info)
      return this.Informations("warning", { message: "Core Information: Display Type Error!" })
    }
    if (!info.message) { // should not happen
      logGA("debug information:", info)
      return this.Informations("warning", { message: "Core Information: no message!" })
    }

    let infoObject = {
      type: type,
      info: info
    }
    this.Infos.buffer.push(infoObject)
    logGA("Informations Buffer Add:", this.Infos)
    this.InformationsBuffer(this.Infos.buffer[0].type, this.Infos.buffer[0].info)
  },

  /** Informations Display with translate from buffer **/
  InformationsBuffer: function(type, info) {
    if (this.Infos.displayed || !this.Infos.buffer.length) return
    logGA(type + ":", info)
    if (type == "warning" && this.config.responseConfig.useChime) this.assistantResponse.infoWarning.src = this.assistantResponse.resourcesDir + this.assistantResponse.chime["warning"]
    if (type == "information" && !this.config.responseConfig.useInformations) return
    this.logoInformations(type)
    this.showInformations(info)
    this.InformationShow()

    this.warningTimeout = setTimeout(() => {
      this.InformationHidden()
    }, this.config.responseConfig.screenOutputTimer)
  },

  showInformations: function (info) {
    var tr = document.getElementById("Infos-Transcription")
    tr.textContent = this.translate(info.message, { VALUES: info.values })
  },

  logoInformations: function (logo) {
    var InfoLogo = document.getElementById("Infos-Icon")
    InfoLogo.src = this.assistantResponse.imgStatus[logo]
  },

  InformationHidden: function () {
    this.assistantResponse.infosDiv.classList.remove('animate__bounceInDown')
    this.assistantResponse.infosDiv.classList.add("animate__bounceOutUp")
    this.assistantResponse.infosDiv.addEventListener('animationend', (e) => {
    if (e.animationName == "bounceOutUp" && e.path[0].id == "Infos")
      Infos.classList.add("hidden")
      this.showInformations("")
      this.Infos.buffer.shift()
      this.Infos.displayed=false
      logGA("Informations Buffer deleted", this.Infos)
      if(this.Infos.buffer.length) this.InformationsBuffer(this.Infos.buffer[0].type, this.Infos.buffer[0].info)
    }, {once: true})
  },

  InformationShow: function () {
    this.Infos.displayed=true
    this.assistantResponse.infosDiv.classList.remove("hidden", "animate__bounceOutUp")
    this.assistantResponse.infosDiv.classList.add('animate__bounceInDown')
  },

  Loading: function () {
    this.assistantResponse.forceStatusImg("standby")
    this.assistantResponse.showTranscription(this.translate("GALoading") + " MMM-GoogleAssistant")
    this.assistantResponse.fullscreen(true,null,false)
  },

  Version (version) {
    this.assistantResponse.showTranscription("MMM-GoogleAssistant v" + version.version + " (" + version.rev + ") ©bugsounet " + this.translate("GAReady"))
    this.assistantResponse.fullscreen(true,null,false)
    this.aliveTimer = setTimeout(() => {
      this.assistantResponse.end(false)
      this.assistantResponse.showTranscription("")
    }, this.config.responseConfig.screenOutputTimer)
  },
})
