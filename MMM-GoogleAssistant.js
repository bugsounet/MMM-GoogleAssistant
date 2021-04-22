//
// Module : MMM-GoogleAssistant

var _log = function() {
  var context = "[GA]";
  return Function.prototype.bind.call(console.log, console, context);
}()

var log = function() {
  //do nothing
}

Module.register("MMM-GoogleAssistant", {
  requiresVersion: "2.15.0",
  defaults: {
    debug:false,
    assistantConfig: {
      lang: "en-US",
      credentialPath: "credentials.json",
      tokenPath: "token.json",
      latitude: 51.508530,
      longitude: -0.076132,
    },
    responseConfig: {
      useScreenOutput: true,
      screenOutputCSS: "screen_output.css",
      screenOutputTimer: 5000,
      screenRotate: false,
      activateDelay: 250,
      useAudioOutput: true,
      useChime: true,
      newChime: false,
      useNative: false,
      playProgram: "mpg321"
    },
    micConfig: {
      recorder: "arecord",
      device: null,
    },
    A2DServer: {
      useA2D: false,
      stopCommand: "stop",
      useYouTube: false,
      youtubeCommand: "youtube",
      displayResponse: true
    },
    recipes: [],
    NPMCheck: {
      useChecker: true,
      delay: 10 * 60 * 1000,
      useAlert: true
    }
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
    return ["/modules/MMM-GoogleAssistant/MMM-GoogleAssistant.css"]
  },

  getTranslations: function() {
    return {
      en: "translations/en.json",
      fr: "translations/fr.json",
      it: "translations/it.json",
      de: "translations/de.json",
      es: "translations/es.json"
    }
  },

  start: function () {
    const helperConfig = [
      "debug", "dev", "recipes", "assistantConfig", "micConfig",
      "responseConfig", "A2DServer", "NPMCheck"
    ]
    this.helperConfig = {}
    if (this.config.debug) log = _log
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
      sendSocketNotification: (noti, payload=null) => {
        this.sendSocketNotification(noti,payload)
      },
      translate: (text) => {
        return this.translate(text)
      },
      myStatus: (status) => {
        this.doPlugin("onStatus", {status: status})
        this.myStatus = status
      },
      A2D: (response)=> {
        if (this.config.A2DServer.useA2D)
         return this.Assistant2Display(response)
      },
      sendAudio: (file) => {
        this.sendSocketNotification("PLAY_AUDIO", file)
      },
      sendChime: (chime) => {
        this.sendSocketNotification("PLAY_CHIME", chime)
      }
    }
    this.assistantResponse = new AssistantResponse(this.helperConfig["responseConfig"], callbacks)
    if (this.config.A2DServer.useA2D && this.config.A2DServer.useYouTube) {
      /** Integred YouTube recipe **/
      var A2DHooks = {
       transcriptionHooks: {
          "SEARCH_YouTube": {
            pattern: this.config.A2DServer.youtubeCommand + " (.*)",
            command: "GA_youtube"
          },
          "A2D_Stop": {
            pattern: this.config.A2DServer.stopCommand,
            command: "A2D_Stop"
          }
        },
        commands: {
          "GA_youtube": {
            moduleExec: {
              module: ["MMM-GoogleAssistant"],
              exec: "__FUNC__(module, params) => { module.sendSocketNotification('YouTube_SEARCH', params[1]) }"
            },
            soundExec: {
              "chime": "open"
            },
            displayResponse: this.config.A2DServer.displayResponse
          },
          "A2D_Stop": {
            notificationExec: {
              notification: "A2D_STOP"
            },
            soundExec: {
              "chime": "close"
            },
            displayResponse: false
          }
        }
      }
      this.parseLoadedRecipe(JSON.stringify(A2DHooks))
    }
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
    this.assistantResponse.modulePosition()
    var dom = document.createElement("div")
    dom.id = "GA_DOM"
    /** Hidden the module on start (reserved for fullscreenAbove mode) **/
    MM.getModules().withClass("MMM-GoogleAssistant").enumerate((module)=> {
      module.hide(0, {lockString: "GA_LOCKED"})
    })
    return dom
  },

  notificationReceived: function(noti, payload=null, sender=null) {
    this.doPlugin("onNotificationReceived", {notification:noti, payload:payload})
    switch (noti) {
      case "DOM_OBJECTS_CREATED":
        if (this.data.configDeepMerge) this.sendSocketNotification("INIT", this.helperConfig)
        else return this.showConfigMergeAlert()
        this.assistantResponse.prepare()
        break
      case "ASSISTANT_WELCOME":
        this.assistantActivate({type: "TEXT", key: payload.key, chime: false}, Date.now())
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
          this.sendNotification("A2D_VOLUME", payload.volume)
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
      case "YouTube_RESULT":
        this.sendYouTubeResult(payload)
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

  assistantActivate: function(payload) {
    if (this.myStatus.actual != "standby" && !payload.force) return log("Assistant is busy.")
    this.doPlugin("onActivate")
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
    this.sendNotification("SNOWBOY_START")
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
      callback_done()
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
          log("ResponseHook matched:", k)
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

  findNativeAction: function (response) {
    var action = (response.action) ? response.action : null
    if (!action || !action.inputs) return
    action.inputs.forEach(input => {
      if (input.intent == "action.devices.EXECUTE") {
        input.payload.commands.forEach(command => {
          command.execution.forEach(exec => {
            log("Native Action: " + exec.command, exec.params)
            if (exec.command == "action.devices.commands.SetVolume") {
              log("Volume Control:", exec.params.volumeLevel)
              this.sendNotification("A2D_VOLUME", exec.params.volumeLevel)
            }
          })
        })
      }
    })
  },

  doCommand: function (commandId, originalParam, from) {
    this.assistantResponse.doCommand(commandId, originalParam, from)
    if (this.commands.hasOwnProperty(commandId)) {
      var command = this.commands[commandId]
      if (command.displayResponse) this.forceResponse = true
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
    var opt = {
      "from": "GA",
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
  },

  sendYouTubeResult: function (result) {
    var opt = {
      "from": "GA",
      "photos": [],
      "urls": ["https://www.youtube.com/watch?v=" + result],
      "transcription": { transcription: "YouTube Video Player", done: "false" }
    }
    log("Send YouTube Response to A2D.")
    this.sendNotification("A2D", opt)
  },

  showConfigMergeAlert: function() {
    this.assistantResponse.prepare()
    this.assistantResponse.fullscreen(true)
    this.assistantResponse.showError("[FATAL] Module configuration: ConfigDeepMerge not actived !")
  }
})
