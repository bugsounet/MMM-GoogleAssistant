//
// Module : MMM-GoogleAssistant

var _log = function() {
  var context = "[ASSISTANT]";
  return Function.prototype.bind.call(console.log, console, context);
}()

var log = function() {
  //do nothing
}

Module.register("MMM-GoogleAssistant", {
  defaults: {
    debug:false,
    assistantConfig: {
      lang: "en-US",
      credentialPath: "credentials.json",
      tokenPath: "token.json",
      projectId: "",
      modelId: "",
      instanceId: "",
      latitude: 51.508530,
      longitude: -0.076132,
    },
    responseConfig: {
      useScreenOutput: true,
      screenOutputCSS: "screen_output.css",
      screenOutputTimer: 5000,
      activateDelay: 250,
      useAudioOutput: true,
      useChime: true,
      newChime: false
    },
    micConfig: {
      recorder: "arecord",
      device: null,
    },
    customActionConfig: {
      autoMakeAction: false,
      autoUpdateAction: false,
      // actionLocale: "en-US", // multi language action is not supported yet
    },
    snowboy: {
      audioGain: 2.0,
      Frontend: true,
      Model: "jarvis",
      Sensitivity: null
    },
    A2DServer: {
      useA2D: false,
      stopCommand: "stop"
    },
    recipes: [],
  },
  plugins: {
    onReady: [],
    onNotificationReceived: [],
  },
  commands: {},
  actions: {},
  transcriptionHooks: {},
  responseHooks: {},

  getScripts: function() {
    return [
       "/modules/MMM-GoogleAssistant/components/response.js"
    ]
  },

  getStyles: function () {
    return ["/modules/MMM-GoogleAssistant/MMM-GoogleAssistant.css"]
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      fr: "translations/fr.json"
    }
  },

  start: function () {
    const helperConfig = [
      "debug", "recipes", "customActionConfig", "assistantConfig", "micConfig",
      "responseConfig", "A2DServer", "snowboy"
    ]
    this.helperConfig = {}
    if (this.config.debug) log = _log
    this.config = this.configAssignment({}, this.defaults, this.config)
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
      sendNotification: (noti, payload=null) => {
        this.sendNotification(noti, payload)
      },
      translate: (text) => {
        return this.translate(text)
      },
      myStatus: (status) => {
        this.myStatus = status
      },
      A2D: (response)=> {
        if (this.config.A2DServer.useA2D)
         return this.Assistant2Display(response)
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

  registerActionsObject: function (obj) {
    this.actions = Object.assign({}, this.actions, obj)
  },

  registerResponseHooksObject: function (obj) {
    this.responseHooks = Object.assign({}, this.responseHooks, obj)
  },

  configAssignment : function (result) {
    var stack = Array.prototype.slice.call(arguments, 1)
    var item
    var key
    while (stack.length) {
      item = stack.shift()
      for (key in item) {
        if (item.hasOwnProperty(key)) {
          if (
            typeof result[key] === "object" && result[key]
            && Object.prototype.toString.call(result[key]) !== "[object Array]"
          ) {
            if (typeof item[key] === "object" && item[key] !== null) {
              result[key] = this.configAssignment({}, result[key], item[key])
            } else {
              result[key] = item[key]
            }
          } else {
            result[key] = item[key]
          }
        }
      }
    }
    return result
  },

  getDom: function() {
    this.assistantResponse.modulePosition()
    var dom = document.createElement("div")
    dom.id = "GA_DOM"
    return dom
  },

  notificationReceived: function(noti, payload=null, sender=null) {
    this.doPlugin("onNotificationReceived", {notification:noti, payload:payload})
    switch (noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.helperConfig)
        this.assistantResponse.prepare()
        break
      case "ASSISTANT_WELCOME":
        this.assistantActivate({type: "TEXT", key: payload.key, chime: false}, Date.now())
        break
      case "ASSISTANT_START":
        this.sendSocketNotification("ASSISTANT_READY")
        break
      case "ASSISTANT_STOP":
        this.sendSocketNotification("ASSISTANT_BUSY")
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
        this.assistantResponse.showError(payload)
        break
      case "INITIALIZED":
        log("Initialized.")
        this.assistantResponse.status("standby")
        this.sendSocketNotification("ASSISTANT_READY")
        this.doPlugin("onReady")
        if (this.config.A2DServer.useA2D) this.sendNotification("ASSISTANT_READY")
        break
      case "ASSISTANT_RESULT":
        if (payload.volume !== null) {
          // Notification to MMM-Volume without recipes
          this.sendNotification("VOLUME_SET", payload.volume)
        }
        this.assistantResponse.start(payload)
        break
      case "TUNNEL":
        this.assistantResponse.tunnel(payload)
        break
      case "ASSISTANT_ACTIVATE":
        this.assistantActivate(payload)
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
    if (p.hasOwnProperty("actions")) {
      this.registerActionsObject(p.actions)
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

  assistantActivate: function(payload) {
    if (this.myStatus.actual != "standby" && !payload.force) return log("Assistant is busy.")

    this.assistantResponse.fullscreen(true)
    if (this.config.A2DServer.useA2D) this.sendNotification("A2D_ASSISTANT_BUSY")
    this.sendSocketNotification("ASSISTANT_BUSY")
    this.lastQuery = null
    var options = {
      type: "TEXT",
      key: null,
      lang: this.config.assistantConfig.lang,
      useScreenOutput: this.config.responseConfig.useScreenOutput,
      useAudioOutput: this.config.responseConfig.useAudioOutput,
      status: this.myStatus.old,
      chime: true
    }
    var options = Object.assign({}, options, payload)
    setTimeout(() => {
      this.assistantResponse.status(options.type, (options.chime) ? true : false)
      this.sendSocketNotification("ACTIVATE_ASSISTANT", options)
    }, this.config.responseConfig.activateDelay)
  },

  endResponse: function() {
    if (this.config.A2DServer.useA2D) this.sendNotification("A2D_ASSISTANT_READY")
    this.sendSocketNotification("ASSISTANT_READY")
  },

  postProcess: function (response, callback_done=()=>{}, callback_none=()=>{}) {
    if (response.lastQuery.status == "continue") return callback_none()
    var foundHook = this.findAllHooks(response)
    var forceResponse = false
    if (foundHook.length > 0) {
      this.assistantResponse.status("hook")
      for (var i = 0; i < foundHook.length; i++) {
        var hook = foundHook[i]
        this.doCommand(hook.command, hook.params, hook.from)
        if (hook.from == "CUSTOM_DEVICE_ACTION") forceResponse = true
      }
      if (forceResponse) {
        callback_none()
      } else {
        callback_done()
      }
    } else {
      callback_none()
    }
  },

  findAllHooks: function (response) {
    var hooks = []
    hooks = hooks.concat(this.findTranscriptionHook(response))
    hooks = hooks.concat(this.findAction(response))
    hooks = hooks.concat(this.findResponseHook(response))
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
          log("ResponseHook matched:", k)
        }
      }
    }
    return found
  },

  findAction: function (response) {
    var found = []
    var action = (response.action) ? response.action : null
    if (!action || !action.inputs) return []
    for (var i = 0; i < action.inputs.length; i++) {
      var input = action.inputs[i]
      if (input.intent == "action.devices.EXECUTE") {
        var commands = input.payload.commands
        for (var j = 0; j < commands.length; j++) {
          var execution = commands[j].execution
          for (var k = 0; k < execution.length; k++) {
            var exec = execution[k]
            found.push({
              "from":"CUSTOM_DEVICE_ACTION",
              "params":exec.params,
              "command":exec.command
            })
          }
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
          log("TranscriptionHook matched:", k)
        }
      } else {
        log(`TranscriptionHook:${k} has invalid format`)
        continue
      }
    }
    return foundHook
  },

  doCommand: function (commandId, originalParam, from) {
    this.assistantResponse.doCommand(commandId, originalParam, from)
    if (commandId == "action.devices.commands.SetVolume") {
      log("Volume Control:", originalParam)
      return this.sendNotification("VOLUME_SET", originalParam.volumeLevel)
    }
    if (this.commands.hasOwnProperty(commandId)) {
      var command = this.commands[commandId]
    } else {
      log(`Command ${commandId} is not found.`)
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
        log (`Command ${commandId} is executed (notificationExec).`)
        this.sendNotification(fnen, fnep)
      }
    }

    if (command.hasOwnProperty("shellExec")) {
      var se = command.shellExec
      if (se.exec) {
        var fs = (typeof se.exec == "function") ? se.exec(param, from) : se.exec
        var so = (se.options) ? ((typeof se.options == "function") ? se.options(param, from) : se.options) : null
        var fo = (typeof so == "function") ? so(param, key) : so
        log (`Command ${commandId} is executed (shellExec).`)
        this.sendSocketNotification("SHELLEXEC", {command:fs, options:fo})
      }
    }

    if (command.hasOwnProperty("moduleExec")) {
      var me = command.moduleExec
      var mo = (typeof me.module == 'function') ? me.module(param, from) : me.module
      var m = (Array.isArray(mo)) ? mo : new Array(mo)
      if (typeof me.exec == "function") {
        MM.getModules().enumerate((mdl)=>{
          if (m.length == 0 || (m.indexOf(mdl.name) >=0)) {
            log (`Command ${commandId} is executed (moduleExec) for :`, mdl.name)
            me.exec(mdl, param, from)
          }
        })
      }
    }

    if (command.hasOwnProperty("functionExec")) {
      var fe = command.functionExec
      if (typeof fe.exec == "function") {
        log (`Command ${commandId} is executed (functionExec)`)
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

/** Send needed part of response screen to MMM-Assistant2Display **/
  Assistant2Display: function(response) {
    if (response.transcription && (response.transcription.transcription == this.config.A2DServer.stopCommand))
      return this.sendNotification("A2D_STOP")

    var opt = {
      "photos": null,
      "urls": null,
      "transcription":null
    }

    if (response.screen && (response.screen.links.length > 0 || response.screen.photos.length > 0)) {
      opt.photos = response.screen.photos
      opt.urls= response.screen.links
      opt.transcription= response.transcription
      log("Send A2D Response.")
      this.sendNotification("A2D", opt)
    }
  }
})
