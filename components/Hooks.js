class Hooks {
  constructor () {
    this.plugins= {
      onReady: [],
      onNotificationReceived: [],
      onActivate: [],
      onStatus: []
    }
    this.commands= {}
    this.transcriptionHooks= {}
    this.responseHooks= {}
    console.log("[GA] Hooks Ready")
  }

  findAllHooks(that, response) {
    var hooks = []
    hooks = hooks.concat(this.findTranscriptionHook(response))
    hooks = hooks.concat(this.findResponseHook(response))
    this.findNativeAction(that, response)
    return hooks
  }

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
  }

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
  }

  doCommand (that, commandId, originalParam, from) {
    if (this.commands.hasOwnProperty(commandId)) {
      var command = this.commands[commandId]
      if (command.displayResponse) that.forceResponse = true
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
        that.sendNotification(fnen, fnep)
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
          that.sendSocketNotification("SHELLEXEC", {command:fs, options:fo})
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

/*
    if (command.hasOwnProperty("functionExec")) {
      var fe = command.functionExec
      if (typeof fe.exec == "function") {
        logGA(`Command ${commandId} is executed (functionExec)`)
        try {
         fe.exec(param, from)
        } catch (e) { // prevent crash if function no longer exist ...
          that.sendNotification("EXT_ALERT", {
            message: "Function not Found!",
            type: "warning"
          })
        }
      }
    }
*/

    if (command.hasOwnProperty("soundExec")) {
      var snde = command.soundExec
      if (snde.chime && typeof snde.chime == 'string') {
        if (snde.chime == "open") that.assistantResponse.playChime("open")
        if (snde.chime == "close") that.assistantResponse.playChime("close")
        if (snde.chime == "opening") that.assistantResponse.playChime("opening")
        if (snde.chime == "closing") that.assistantResponse.playChime("closing")
      }
      if (snde.sound && typeof snde.sound == 'string') {
        that.assistantResponse.playChime(snde.sound, true)
      }
    }
  }

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
  }

  doPlugin(that, pluginName, args) { // to verify
    if (this.plugins.hasOwnProperty(pluginName)) {
      var plugins = this.plugins[pluginName]
      if (Array.isArray(plugins) && plugins.length > 0) {
        for (var i = 0; i < plugins.length; i++) {
          var job = plugins[i]
          this.doCommand(that, job, args, pluginName)
        }
      }
    }
  }

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
  }

  registerPlugin(plugin, command) {
    if (this.plugins.hasOwnProperty(plugin)) {
      if (Array.isArray(command)) {
        this.plugins[plugin].concat(command)
      }
      this.plugins[plugin].push(command)
    }
  }

  registerCommandsObject (obj) {
    this.commands = Object.assign({}, this.commands, obj)
  }

  registerTranscriptionHooksObject (obj) {
    this.transcriptionHooks = Object.assign({}, this.transcriptionHooks, obj)
  }

  registerResponseHooksObject (obj) {
    this.responseHooks = Object.assign({}, this.responseHooks, obj)
  }

  findNativeAction (that, response) {
    var action = (response.action) ? response.action : null
    if (!action || !action.inputs) return
    action.inputs.forEach(input => {
      if (input.intent == "action.devices.EXECUTE") {
        input.payload.commands.forEach(command => {
          command.execution.forEach(exec => {
            logGA("Native Action: " + exec.command, exec.params)
            if (exec.command == "action.devices.commands.SetVolume") {
              logGA("Volume Control:", exec.params.volumeLevel)
              that.sendNotification("EXT_VOLUME-SPEAKER_SET", exec.params.volumeLevel)
            }
          })
        })
      }
    })
  }
}
