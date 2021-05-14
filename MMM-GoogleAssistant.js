/**
 ** Module : MMM-GoogleAssistant v3
 ** @bugsounet
 ** ©2021
 ** support: http://forum.bugsounet.fr
 **/

logGA = (...args) => { /* do nothing */ }
logA2D = (...args) => { /* do nothing */ }

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
      useFullscreen: false, // @todo Code it !
      useResponseOutput: true,
      responseOutputCSS: "response_output.css",
      screenOutputTimer: 5000,
      activateDelay: 250,
      useAudioOutput: true,
      useChime: true,
      confirmationChime: true,
      chimes: {
        beep: "beep.mp3",
        error: "error.mp3",
        continue: "continue.mp3",
        confirmation: "confirmation.mp3",
        open: "Google_beep_open.mp3",
        close: "Google_beep_close.mp3",
      },
      imgStatus: {
        hook: "hook.gif",
        standby: "standby.gif",
        reply: "reply.gif",
        error: "error.gif",
        think: "think.gif",
        continue: "continue.gif",
        listen: "listen.gif",
        confirmation: "confirmation.gif"
      },
      zoom: {
        transcription: "80%",
        responseOutput: "60%"
      }
    },
    micConfig: {
      recorder: "arecord",
      device: "default"
    },
    A2DServer: {
      useA2D: false,
      stopCommand: "stop",
      youtube: {
        useYoutube: false,
        youtubeCommand: "youtube",
        displayResponse: true,
        useVLC: false,
        minVolume: 30,
        maxVolume: 100
      },
      links: {
        useLinks: false,
        displayDelay: 60 * 1000,
        scrollActivate: false,
        scrollStep: 25,
        scrollInterval: 1000,
        scrollStart: 5000
      },
      photos: {
        usePhotos: false,
        displayDelay: 10 * 1000
      },
      volume: {
        useVolume: false,
        volumePreset: "ALSA",
        myScript: null,
        volumeText: "Volume:"
      },
      briefToday: {
        useBriefToday: false,
        welcome: "brief Today"
      },
      screen: {
        useScreen: false,
        delay: 5 * 60 * 1000,
        turnOffDisplay: true,
        mode: 1,
        ecoMode: true,
        delayed: 0,
        displayCounter: true,
        text: "Auto Turn Off Screen:",
        displayBar: true,
        displayStyle: "Text",
        detectorSleeping: false,
        governorSleeping: false,
        displayLastPresence: true,
        LastPresenceText: "Last Presence:"
      },
      touch: {
        useTouch: true,
        mode: 2
      },
      pir: {
        usePir: false,
        gpio: 21,
        reverseValue: false
      },
      governor: {
        useGovernor: false,
        sleeping: "powersave",
        working: "ondemand"
      },
      internet: {
        useInternet: false,
        displayPing: false,
        delay: 2* 60 * 1000,
        scan: "google.fr",
        command: "pm2 restart 0",
        showAlert: true
      },
      cast: {
        useCast: false,
        castName: "MagicMirror_A2D",
        port: 8569
      },
      spotify: {
        useSpotify: false,
        useBottomBar: false,
        useLibrespot: false,
        connectTo: null,
        playDelay: 3000,
        minVolume: 10,
        maxVolume: 90,
        updateInterval: 1000,
        idleInterval: 10000,
        username: "",
        password: "",
        PATH: "../../../tokens/", // Needed Don't modify it !
        TOKEN: "tokenSpotify.json",
        CLIENT_ID: "",
        CLIENT_SECRET: "",
        deviceDisplay: "Listening on",
        usePause: true,
        typeArtist: "artist",
        typePlaylist: "playlist",
        typeAlbum: "album",
        typeTrack: "track"
      },
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
       "/modules/MMM-GoogleAssistant/components/response.js",
       "/modules/MMM-GoogleAssistant/components/display.js",
       "/modules/MMM-GoogleAssistant/components/youtube.js",
       "/modules/MMM-GoogleAssistant/components/progressbar.js",
       "/modules/MMM-GoogleAssistant/components/spotify.js",
       "https://cdn.materialdesignicons.com/5.2.45/css/materialdesignicons.min.css",
       "https://code.iconify.design/1/1.0.6/iconify.min.js",
       "/modules/MMM-GoogleAssistant/components/long-press-event.js"
    ]
  },

  getStyles: function () {
    return [
      "/modules/MMM-GoogleAssistant/MMM-GoogleAssistant.css",
      "font-awesome.css"
    ]
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
    this.warningTimeout = null
    this.userPresence = null
    this.lastPresence = null
    const helperConfig = [
      "debug", "recipes", "assistantConfig", "micConfig",
      "responseConfig", "A2DServer", "NPMCheck"
    ]
    this.helperConfig = {}
    if (this.config.debug) {
      logGA = (...args) => { console.log("[GA]", ...args) }
      logA2D = (...args) => { console.log("[GA:A2D]", ...args) }
    }

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
        this.A2DActionsOnStatus(this.myStatus.actual)
      },
      A2D: (response)=> {
        if (this.config.A2DServer.useA2D)
         return this.Assistant2Display(response)
      },

      "sendSocketNotification": (noti, params) => {
        this.sendSocketNotification(noti, params)
      },
      "sendNotification": (noti, params)=> {
        this.sendNotification(noti, params)
        console.log("!!!! sendNotification Warning:", noti, params) // @to verify is really need ? maybe for detector sleeping ??
      },
      "radioStop": ()=> this.radio.pause(),
      "spotifyStatus": (status) => { // try to use spotify callback to unlock screen ...
        if (status) this.A2D.spotify.connected = true
        else {
          this.A2D.spotify.connected = false
          if (this.A2D.spotify.librespot && this.config.A2DServer.screen.useScreen && !this.displayResponse.working()) {
              this.sendSocketNotification("SCREEN_LOCK", false)
          }
          this.A2D.spotify.librespot = false
        }
      },
      "YTError": (error) => this.Warning(error)
    }
    this.assistantResponse = new AssistantResponse(this.helperConfig["responseConfig"], callbacks)

    /** A2DServer part **/
    if (this.config.A2DServer.useA2D) {
      this.bar= null
      this.checkStyle()
      this.spotifyNewVolume = false
      this.userPresence = null
      this.lastPresence = null
      var A2DStopHooks = {
        transcriptionHooks: {
          "A2D_Stop": {
            pattern: this.config.A2DServer.stopCommand,
            command: "A2D_Stop"
          }
        },
        commands: {
          "A2D_Stop": {
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
      this.parseLoadedRecipe(JSON.stringify(A2DStopHooks))
      if (this.config.A2DServer.youtube.useYoutube) {
        /** Integred YouTube recipe **/
        var A2DYTHooks = {
         transcriptionHooks: {
            "SEARCH_YouTube": {
              pattern: this.config.A2DServer.youtube.youtubeCommand + " (.*)",
              command: "GA_youtube"
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
              displayResponse: this.config.A2DServer.youtube.displayResponse
            },
          }
        }
        this.parseLoadedRecipe(JSON.stringify(A2DYTHooks))
      }
      this.radioPlayer = {
        play: false,
        img: null,
        link: null,
      }
      this.createRadio()
      this.displayA2DResponse = new Display(this.config.A2DServer, callbacks)
      if (this.config.A2DServer.spotify.useSpotify) this.spotify = new Spotify(this.config.A2DServer.spotify, callbacks, this.config.debug)
      this.A2D = this.displayA2DResponse.A2D
      if (this.config.A2DServer.youtube.useYoutube && this.config.A2DServer.youtube.useVLC) this.initializeVolumeVLC()
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
    //var dom = document.createElement("div")
    //dom.id = "GA_DOM"
    /** Hidden the module on start (reserved for fullscreenAbove mode) **/
    //this.hide(0, {lockString: "GA_LOCKED"})
    var dom = document.createElement("div")
    dom.id = "A2D_DISPLAY"

    if (this.config.A2DServer.spotify.useSpotify && !this.config.A2DServer.spotify.useBottomBar) {
      spotify= this.spotify.prepareMini()
      dom.appendChild(spotify)
    }

    /** Screen TimeOut Text **/
    var screen = document.createElement("div")
    screen.id = "A2D_SCREEN"
    if (!this.config.A2DServer.screen.useScreen || (this.config.A2DServer.screen.displayStyle != "Text")) screen.className = "hidden"
    var screenText = document.createElement("div")
    screenText.id = "A2D_SCREEN_TEXT"
    screenText.textContent = this.config.A2DServer.screen.text
    screen.appendChild(screenText)
    var screenCounter = document.createElement("div")
    screenCounter.id = "A2D_SCREEN_COUNTER"
    screenCounter.classList.add("counter")
    screenCounter.textContent = "--:--"
    screen.appendChild(screenCounter)

    /** Screen TimeOut Bar **/
    var bar = document.createElement("div")
    bar.id = "A2D_BAR"
    if (!this.config.A2DServer.screen.useScreen || (this.config.A2DServer.screen.displayStyle == "Text") || !this.config.A2DServer.screen.displayBar) bar.className = "hidden"
    var screenBar = document.createElement(this.config.A2DServer.screen.displayStyle == "Bar" ? "meter" : "div")
    screenBar.id = "A2D_SCREEN_BAR"
    screenBar.classList.add(this.config.A2DServer.screen.displayStyle)
    if (this.config.A2DServer.screen.displayStyle == "Bar") {
      screenBar.value = 0
      screenBar.max= this.config.A2DServer.screen.delay
    }
    bar.appendChild(screenBar)

    /** Last user Presence **/
    var presence = document.createElement("div")
    presence.id = "A2D_PRESENCE"
    presence.className = "hidden"
    var presenceText = document.createElement("div")
    presenceText.id = "A2D_PRESENCE_TEXT"
    presenceText.textContent = this.config.A2DServer.screen.LastPresenceText
    presence.appendChild(presenceText)
    var presenceDate = document.createElement("div")
    presenceDate.id = "A2D_PRESENCE_DATE"
    presenceDate.classList.add("presence")
    presenceDate.textContent = "Loading ..."
    presence.appendChild(presenceDate)

    /** internet Ping **/
    var internet = document.createElement("div")
    internet.id = "A2D_INTERNET"
    if (!this.config.A2DServer.internet.useInternet || !this.config.A2DServer.internet.displayPing) internet.className = "hidden"
    var internetText = document.createElement("div")
    internetText.id = "A2D_INTERNET_TEXT"
    internetText.textContent = "Ping: "
    internet.appendChild(internetText)
    var internetPing = document.createElement("div")
    internetPing.id = "A2D_INTERNET_PING"
    internetPing.classList.add("ping")
    internetPing.textContent = "Loading ..."
    internet.appendChild(internetPing)

    /** Radio **/
    var radio = document.createElement("div")
    radio.id = "A2D_RADIO"
    radio.className = "hidden"
    var radioImg = document.createElement("img")
    radioImg.id = "A2D_RADIO_IMG"
    radio.appendChild(radioImg)

    dom.appendChild(radio)
    dom.appendChild(screen)
    dom.appendChild(bar)
    dom.appendChild(presence)
    dom.appendChild(internet)

    return dom
  },

  notificationReceived: function(noti, payload=null, sender=null) {
    this.doPlugin("onNotificationReceived", {notification:noti, payload:payload})
    switch (noti) {
      case "DOM_OBJECTS_CREATED":
        if (this.data.configDeepMerge) this.sendSocketNotification("INIT", this.helperConfig)
        else return this.showConfigMergeAlert()
        this.assistantResponse.prepare()
        if (this.config.A2DServer.useA2D) {
          this.displayA2DResponse.prepare()
          if (this.config.A2DServer.screen.useScreen && (this.config.A2DServer.screen.displayStyle != "Text")) this.prepareBar()
          if (this.config.A2DServer.spotify.useSpotify && this.config.A2DServer.spotify.useBottomBar) this.spotify.prepare()
          if (this.config.A2DServer.touch.useTouch) this.touchScreen(this.config.A2DServer.touch.mode)
        }
        break
      case "GA_ACTIVATE":
        this.assistantActivate({ type:"MIC" })
        break
      case "WAKEUP": /** for external wakeup **/
        if (this.config.A2DServer.useA2D && this.config.A2DServer.screen.useScreen) this.sendSocketNotification("SCREEN_WAKEUP")
        break
      case "A2D_LOCK": /** screen lock **/
        if (this.config.A2DServer.useA2D && this.config.A2DServer.screen.useScreen) {
          this.sendSocketNotification("SCREEN_LOCK", true)
        }
        break
      case "A2D_UNLOCK": /** screen unlock **/
        if (this.config.A2DServer.useA2D && this.config.A2DServer.screen.useScreen) {
          this.sendSocketNotification("SCREEN_LOCK", false)
        }
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
    if (this.config.A2DServer.useA2D) this.A2D = this.displayA2DResponse.A2D
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
      case "WARNING":
        this.Warning(payload)
        break
      case "INITIALIZED":
        logGA("Initialized.")
        this.Version(payload)
        this.assistantResponse.status("standby")
        this.doPlugin("onReady")
        if (this.config.A2DServer.useA2D) this.sendWelcome()
        break
      case "ASSISTANT_RESULT":
        if (payload.volume !== null) {
          this.sendSocketNotification("VOLUME_SET", payload.volume)
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

      /** screen module **/
      case "SCREEN_TIMER":
        if (this.config.A2DServer.screen.displayStyle == "Text") {
          let counter = document.getElementById("A2D_SCREEN_COUNTER")
          counter.textContent = payload
        }
        break
      case "SCREEN_BAR":
        if (this.config.A2DServer.screen.displayStyle == "Bar") {
          let bar = document.getElementById("A2D_SCREEN_BAR")
          bar.value= this.config.screen.delay - payload
        }
        else if (this.config.A2DServer.screen.displayStyle != "Text") {
          let value = (100 - ((payload * 100) / this.config.A2DServer.screen.delay))/100
          let timeOut = moment(new Date(this.config.A2DServer.screen.delay-payload)).format("mm:ss")
          this.bar.animate(value, {
            step: (state, bar) => {
              bar.path.setAttribute('stroke', state.color)
              bar.setText(this.config.A2DServer.screen.displayCounter ? timeOut : "")
              bar.text.style.color = state.color
            }
          })
        }
        break
      case "SCREEN_PRESENCE":
        if (payload) this.lastPresence = moment().format("LL HH:mm")
        else this.userPresence = this.lastPresence
        if (this.userPresence && this.config.A2DServer.screen.displayLastPresence) {
          let presence= document.getElementById("A2D_PRESENCE")
          presence.classList.remove("hidden")
          let userPresence= document.getElementById("A2D_PRESENCE_DATE")
          userPresence.textContent= this.userPresence
        }
        break
      case "SCREEN_SHOWING":
        this.screenShowing()
        break
      case "SCREEN_HIDING":
        this.screenHiding()
        break

      /** internet module **/
      case "INTERNET_DOWN":
        this.sendNotification("SHOW_ALERT", {
          type: "alert" ,
          message: "Internet is DOWN ! Retry: " + payload,
          title: "Internet Scan",
          timer: 10000
        })
        this.sendSocketNotification("SCREEN_WAKEUP")
        break
      case "INTERNET_RESTART":
        this.sendNotification("SHOW_ALERT", {
          type: "alert" ,
          message: "Internet is now available! Restarting Magic Mirror...",
          title: "Internet Scan",
          timer: 10000
        })
        this.sendSocketNotification("SCREEN_WAKEUP")
        break
      case "INTERNET_PING":
        var ping = document.getElementById("A2D_INTERNET_PING")
        ping.textContent = payload
        break

      /** cast module **/
      case "CAST_START":
        this.sendSocketNotification("SCREEN_WAKEUP")
        this.displayA2DResponse.castStart(payload)
        break
      case "CAST_STOP":
        this.displayA2DResponse.castStop()
        break

      /** Spotify module **/
      case "SPOTIFY_PLAY":
        this.spotify.updateCurrentSpotify(payload)
        if (!this.A2D.spotify.connected) return // don't check if not connected (use spotify callback)
        if (payload && payload.device && payload.device.name) { //prevent crash
          this.A2D.spotify.repeat = payload.repeat_state
          this.A2D.spotify.shuffle = payload.shuffle_state
          if (payload.device.name == this.config.A2DServer.spotify.connectTo) {
            if (this.A2D.radio) this.radio.pause()
            this.A2D.spotify.currentVolume = payload.device.volume_percent
            if (!this.A2D.spotify.librespot) this.A2D.spotify.librespot = true
            if (this.A2D.spotify.connected && this.config.A2DServer.screen.useScreen && !this.displayResponse.working()) {
              this.sendSocketNotification("SCREEN_WAKEUP")
              this.sendSocketNotification("SCREEN_LOCK", true)
            }
          }
          else {
            if (this.A2D.spotify.connected && this.A2D.spotify.librespot && this.config.A2DServer.screen.useScreen && !this.displayResponse.working()) {
              this.sendSocketNotification("SCREEN_LOCK", false)
            }
            if (this.A2D.spotify.librespot) this.A2D.spotify.librespot = false
          }
        }
        break
      case "SPOTIFY_IDLE":
        this.spotify.updatePlayback(false)
        if (this.A2D.spotify.librespot && this.config.A2DServer.screen.useScreen && !this.displayResponse.working()) {
          this.sendSocketNotification("SCREEN_LOCK", false)
        }
        this.A2D.spotify.librespot = false
        break
      case "DONE_SPOTIFY_VOLUME":
        if (this.A2D.spotify.forceVolume && this.config.A2DServer.spotify.useSpotify) {
          if (this.A2D.spotify.librespot) {
            this.A2D.spotify.targetVolume = payload
          }
        }
        break

      /** YouTube module callback **/
      case "FINISH_YOUTUBE":
        this.A2D.youtube.displayed = false
        this.displayA2DResponse.showYT()
        this.displayA2DResponse.A2DUnlock()
        this.displayA2DResponse.resetYT()
        break

      /** Volume module callback **/
      case "VOLUME_DONE":
        this.displayA2DResponse.drawVolume(payload)
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
    clearTimeout(this.warningTimeout)
    if (this.myStatus.actual != "standby" && !payload.force) return logGA("Assistant is busy.")
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
    setTimeout(() => {
      this.assistantResponse.status(options.type, (options.chime) ? true : false)
      this.sendSocketNotification("ACTIVATE_ASSISTANT", options)
    }, this.config.responseConfig.activateDelay)
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
              if (this.config.A2DServer.useA2D && this.config.A2DServer.volume.useVolume) {
                logGA("Volume Control:", exec.params.volumeLevel)
                this.sendSocketNotification("VOLUME_SET", exec.params.volumeLevel)
              }
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
        logGA(`Command ${commandId} is executed (shellExec).`)
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

/** Send needed part of response screen to Assistant2Display Server **/
  Assistant2Display: function(response) {
    var opt = {
      "from": "GA",
      "photos": null,
      "urls": null,
      "transcription": null
    }

    if (response.screen && (response.screen.links.length > 0 || response.screen.photos.length > 0)) {
      opt.photos = response.screen.photos
      opt.urls= response.screen.links
      opt.transcription= response.transcription
      logGA("Send A2D Response.")
      this.displayA2DResponse.start(opt)
    }
  },

  sendYouTubeResult: function (result) {
    var opt = {
      "from": "GA",
      "photos": [],
      "urls": ["https://www.youtube.com/watch?v=" + result],
      "transcription": { transcription: "YouTube Video Player", done: "false" }
    }
    logGA("Send YouTube Response to A2D.")
    this.displayA2DResponse.start(opt)
  },

  showConfigMergeAlert: function() {
    this.assistantResponse.prepare()
    this.assistantResponse.fullscreen(true)
    this.assistantResponse.showError("[FATAL] Module configuration: ConfigDeepMerge not actived !")
  },

  Version: function(version) {
    this.assistantResponse.showTranscription("~MMM-GoogleAssistant v" + version.version + " - rev:"+ version.rev + "~")
    this.assistantResponse.fullscreen(true)
    this.warningTimeout = setTimeout(() => {
      this.assistantResponse.end()
      this.assistantResponse.showTranscription("")
    }, 3000)
  },

  Warning: function(warning) {
    console.log("[GA] Warning:", warning)
    clearTimeout(this.assistantResponse.aliveTimer)
    this.assistantResponse.aliveTimer = null
    this.assistantResponse.showTranscription("~Warning~ " + warning)
    this.assistantResponse.fullscreen(true)
    this.warningTimeout = setTimeout(() => {
      this.assistantResponse.end()
      this.assistantResponse.showTranscription("")
    }, 5000)
  },

  Informations: function(info) {
    console.log(info)
    clearTimeout(this.assistantResponse.aliveTimer)
    this.assistantResponse.aliveTimer = null
    this.assistantResponse.showTranscription("~Info~ " + info)
    this.assistantResponse.fullscreen(true)
    this.warningTimeout = setTimeout(() => {
      this.assistantResponse.end()
      this.assistantResponse.showTranscription("")
    }, 5000)
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
    else this.socketNotificationReceived("ASSISTANT_ACTIVATE", { type: "TEXT", key: query })
  },

  /********************************/
  /** A2DServer Extented **/
  /********************************/

  A2DActionsOnStatus: function(status) {
    this.A2D = this.displayA2DResponse.A2D
    switch(status) {
      case "listen":
      case "think":
        this.A2D.speak = true
        if (this.config.A2DServer.screen.useScreen && !this.A2D.locked) this.sendSocketNotification("SCREEN_STOP")
        if (this.A2D.locked) this.displayA2DResponse.hideDisplay()
        if (this.config.A2DServer.youtube.useYoutube && this.displayA2DResponse.player) {
          if (!this.config.A2DServer.youtube.useVLC) this.displayA2DResponse.player.command("setVolume", 5)
          else this.sendSocketNotification("YT_VOLUME", this.config.A2DServer.youtube.minVolume)
        }
        if (this.config.A2DServer.spotify.useSpotify && this.A2D.spotify.librespot) {
          this.A2D.spotify.targetVolume = this.A2D.spotify.currentVolume
          this.sendSocketNotification("SPOTIFY_VOLUME", this.config.A2DServer.spotify.minVolume)
        }
        if (this.A2D.radio) this.radio.volume = 0.1
        break
      case "standby":
        this.A2D.speak = false
        if (this.config.A2DServer.screen.useScreen && !this.A2D.locked) this.sendSocketNotification("SCREEN_RESET")
        if (this.config.A2DServer.youtube.useYouTube && this.displayA2DResponse.player) {
          if (!this.config.A2DServer.youtube.useVLC) this.displayA2DResponse.player.command("setVolume", 100)
          else this.sendSocketNotification("YT_VOLUME", this.config.A2DServer.youtube.maxVolume)
        }
        if (this.config.A2DServer.spotify.useSpotify && this.A2D.spotify.librespot && !this.A2D.spotify.forceVolume) {
          this.sendSocketNotification("SPOTIFY_VOLUME", this.A2D.spotify.targetVolume)
        }
        this.A2D.spotify.forceVolume= false
        if (this.A2D.radio) this.radio.volume = 0.6
        if (this.displayA2DResponse.working()) this.displayA2DResponse.showDisplay()
        else this.displayA2DResponse.hideDisplay()
        break
      case "reply":
      case "continue":
      case "confirmation":
      case "hook":
      case "error":
        break
    }
  },

  /** Prepare TimeOut Bar **/
  prepareBar: function () {
    if (this.config.A2DServer.screen.displayStyle == "Bar") return
    console.log(this.config.A2DServer.screen.displayStyle)
    this.bar = new ProgressBar[this.config.A2DServer.screen.displayStyle](document.getElementById('A2D_SCREEN_BAR'), {
      strokeWidth: this.config.A2DServer.screen.displayStyle == "Line" ? 2 : 5,
      trailColor: '#1B1B1B',
      trailWidth: 1,
      easing: 'easeInOut',
      duration: 500,
      svgStyle: null,
      from: {color: '#FF0000'},
      to: {color: '#00FF00'},
      text: {
        style: {
          position: 'absolute',
          left: '50%',
          top: this.config.A2DServer.screen.displayStyle == "Line" ? "0" : "50%",
          padding: 0,
          margin: 0,
          transform: {
              prefix: true,
              value: 'translate(-50%, -50%)'
          }
        }
      }
    })
  },

  screenShowing: function() {
    MM.getModules().enumerate((module)=> {
      module.show(1000, {lockString: "A2D_SCREEN"})
    })
  },

  screenHiding: function() {
    MM.getModules().enumerate((module)=> {
      module.hide(1000, {lockString: "A2D_SCREEN"})
    })
  },

  /** Create Radio function and cb **/
  createRadio: function() {
    this.radio = new Audio()

    this.radio.addEventListener("ended", ()=> {
      logA2D("Radio ended")
      this.radioPlayer.play = false
      this.showRadio()
    })
    this.radio.addEventListener("pause", ()=> {
      logA2D("Radio paused")
      this.radioPlayer.play = false
      this.showRadio()
    })
    this.radio.addEventListener("abort", ()=> {
      logA2D("Radio aborted")
      this.radioPlayer.play = false
      this.showRadio()
    })
    this.radio.addEventListener("error", (err)=> {
      logA2D("Radio error: " + err)
      this.radioPlayer.play = false
      this.showRadio()
    })
    this.radio.addEventListener("loadstart", ()=> {
      logA2D("Radio started")
      this.radioPlayer.play = true
      this.radio.volume = 0.6
      this.showRadio()
    })
  },

  showRadio: function() {
    this.A2D = this.displayResponse.A2D
    this.A2D.radio = this.radioPlayer.play
    if (this.radioPlayer.img) {
      var radio = document.getElementById("A2D_RADIO")
      if (this.radioPlayer.play) radio.classList.remove("hidden")
      else radio.classList.add("hidden")
    }
    if (this.A2D.radio) {
      this.sendSocketNotification("SCREEN_WAKEUP")
      this.sendSocketNotification("SCREEN_LOCK", true)
    } else {
      this.sendSocketNotification("SCREEN_LOCK", false)
    }
  },

  /** TouchScreen Feature **/
  touchScreen: function (mode) {
    let clickCount = 0
    let clickTimer = null
    let A2Display = document.getElementById("A2D_DISPLAY")

    switch (mode) {
      case 1:
        /** mode 1 **/
        window.addEventListener('click', () => {
          clickCount++
          if (clickCount === 1) {
            clickTimer = setTimeout(() => {
              clickCount = 0
              this.sendSocketNotification("SCREEN_WAKEUP")
            }, 400)
          } else if (clickCount === 2) {
            clearTimeout(clickTimer)
            clickCount = 0
            this.sendSocketNotification("SCREEN_FORCE_END")
          }
        }, false)
        break
      case 2:
        /** mode 2 **/
        A2Display.addEventListener('click', () => {
          if (clickCount) return clickCount = 0
          if (!this.hidden) this.sendSocketNotification("SCREEN_WAKEUP")
        }, false)

        window.addEventListener('long-press', () => {
          clickCount = 1
          if (this.hidden) this.sendSocketNotification("SCREEN_WAKEUP")
          else this.sendSocketNotification("SCREEN_FORCE_END")
          clickTimer = setTimeout(() => { clickCount = 0 }, 400)
        }, false)
        break
      case 3:
        /** mode 3 **/
        A2Display.addEventListener('click', () => {
          clickCount++
          if (clickCount === 1) {
            clickTimer = setTimeout(() => {
              clickCount = 0
              this.sendSocketNotification("SCREEN_WAKEUP")
            }, 400)
          } else if (clickCount === 2) {
            clearTimeout(clickTimer)
            clickCount = 0
            this.sendSocketNotification("SCREEN_FORCE_END")
          }
        }, false)

        window.addEventListener('click', () => {
          if (!this.hidden) return
          clickCount = 3
          this.sendSocketNotification("SCREEN_WAKEUP")
          clickTimer = setTimeout(() => { clickCount = 0 }, 400)
        }, false)
        break
    }
    if (!mode) logA2D("Touch Screen Function disabled.")
    else logA2D("Touch Screen Function added. [mode " + mode +"]")
  },

  checkStyle: function () {
    /** Crash prevent on Time Out Style Displaying **/
    /** --> Set to "Text" if not found */
    let Style = [ "Text", "Line", "SemiCircle", "Circle", "Bar" ]
    let found = Style.find((style) => {
      return style == this.config.A2DServer.screen.displayStyle
    })
    if (!found) {
      console.log("[GA:A2D] displayStyle Error ! ["+ this.config.A2DServer.screen.displayStyle + "]")
      this.config.A2DServer.screen= Object.assign({}, this.config.A2DServer.screen, {displayStyle : "Text"})
    }
  },

  /** initialise volume control for VLC **/
  initializeVolumeVLC: function() {
    if (!this.config.A2DServer.youtube.useVLC) return
    /** convert volume **/
    try {
      let valueMin = null
      valueMin = parseInt(this.config.A2DServer.youtube.minVolume)
      if (typeof valueMin === "number" && valueMin >= 0 && valueMin <= 100) this.config.A2DServer.youtube.minVolume = ((valueMin * 255) / 100).toFixed(0)
      else {
        console.error("[GA:A2D] config.youtube.minVolume error! Corrected with 30")
        this.config.A2DServer.youtube.minVolume = 70
      }
    } catch (e) {
      console.error("[GA:A2D] config.youtube.minVolume error!", e)
      this.config.A2DServer.youtube.minVolume = 70
    }
    try {
      let valueMax = null
      valueMax = parseInt(this.config.A2DServer.youtube.maxVolume)
      if (typeof valueMax === "number" && valueMax >= 0 && valueMax <= 100) this.config.A2DServer.youtube.maxVolume = ((valueMax * 255) / 100).toFixed(0)
      else {
        console.error("[GA:A2D] config.youtube.maxVolume error! Corrected with 100")
        this.config.A2DServer.youtube.maxVolume = 255
      }
    } catch (e) {
      console.error("[GA:A2D] config.youtube.maxVolume error!", e)
      this.config.A2DServer.youtube.maxVolume = 255
    }
    console.log("[GA:A2D] VLC Volume Control initialized!")
  },

  /** Spotify commands (for recipe) **/
  SpotifyCommand: function(command, payload) {
    if (!this.config.A2DServer.useA2D) return
    if (this.config.A2DServer.spotify.useSpotify) {
      this.A2D = this.displayA2DResponse.A2D
      switch (command) {
        case "PLAY":
          if (this.A2D.youtube.displayed && this.A2D.spotify.librespot) {
            if (this.A2D.radio) this.radio.pause()
            if (this.config.A2DServer.youtube.useVLC) {
              this.sendSocketNotification("YT_STOP")
              this.A2D.youtube.displayed = false
              this.displayA2DResponse.showYT()
              this.displayA2DResponse.A2DUnlock()
              this.displayA2DResponse.resetYT()
            }
            else this.displayA2DResponse.player.command("stopVideo")
          }
          this.sendSocketNotification("SPOTIFY_PLAY")
          break
        case "PAUSE":
          this.sendSocketNotification("SPOTIFY_PAUSE")
          break
        case "STOP":
          if (this.A2D.spotify.librespot) this.sendSocketNotification("SPOTIFY_STOP")
          else this.sendSocketNotification("SPOTIFY_PAUSE")
          break
        case "NEXT":
          this.sendSocketNotification("SPOTIFY_NEXT")
          break
        case "PREVIOUS":
          this.sendSocketNotification("SPOTIFY_PREVIOUS")
          break
        case "SHUFFLE":
          this.sendSocketNotification("SPOTIFY_SHUFFLE", !this.A2D.spotify.shuffle)
          break
        case "REPEAT":
          this.sendSocketNotification("SPOTIFY_REPEAT", (this.A2D.spotify.repeat == "off" ? "track" : "off"))
          break
        case "TRANSFER":
          this.sendSocketNotification("SPOTIFY_TRANSFER", payload)
          break
        case "VOLUME":
          this.A2D.spotify.forceVolume = true
          this.sendSocketNotification("SPOTIFY_VOLUME", payload)
          break
        case "SEARCH":
          /** enforce type **/
          var type = payload.query.split(" ")
          if (type[0] == this.config.A2DServer.spotify.typePlaylist) type = "playlist"
          else if (type[0] == this.config.A2DServer.spotify.typeAlbum) type= "album"
          else if (type[0] == this.config.A2DServer.spotify.typeTrack) type= "track"
          else if (type[0] == this.config.A2DServer.spotify.typeArtist) type= "artist"
          else type = null
          if (type) {
            payload.query = payload.query.replace(type + " ","")
            payload.type = type
          }
          var pl = {
            query: {
              q: payload.query,
              type: payload.type,
            },
            condition: {
              random: payload.random,
              autoplay: true,
            }
          }
          this.sendSocketNotification("SEARCH_AND_PLAY", pl)
          if (this.A2D.youtube.displayed && this.A2D.spotify.librespot) {
            if (this.config.A2DServer.youtube.useVLC) {
              this.sendSocketNotification("YT_STOP")
              this.A2D.youtube.displayed = false
              this.displayA2DResponse.showYT()
              this.displayA2DResponse.A2DUnlock()
              this.displayA2DResponse.resetYT()
            }
            else this.displayA2DResponse.player.command("stopVideo")
          }
          break
      }
    }
  },

  resume: function() {
    if (this.A2D.spotify.connected && this.config.A2DServer.spotify.useBottomBar) {
      this.displayA2DResponse.showSpotify()
      logA2D("Spotify is resumed.")
    }
  },

  suspend: function() {
    if (this.A2D.spotify.connected && this.config.A2DServer.spotify.useBottomBar) {
      this.displayA2DResponse.hideSpotify()
      logA2D("Spotify is suspended.")
    }
  },

  /** stopCommand (for recipe) **/
  stopCommand: function() {
    if (!this.config.A2DServer.useA2D) return
    this.A2D = this.displayA2DResponse.A2D
    if (this.A2D.locked) {
      if (this.A2D.youtube.displayed) {
        if (this.config.A2DServer.youtube.useVLC) {
          this.sendSocketNotification("YT_STOP")
          this.A2D.youtube.displayed = false
          this.displayA2DResponse.showYT()
          this.displayA2DResponse.A2DUnlock()
          this.displayA2DResponse.resetYT()
        }
        else this.displayA2DResponse.player.command("stopVideo")
      }
      if (this.A2D.photos.displayed) {
        this.displayA2DResponse.resetPhotos()
        this.displayA2DResponse.hideDisplay()
      }
      if (this.A2D.links.displayed) {
        this.displayA2DResponse.resetLinks()
        this.displayA2DResponse.hideDisplay()
      }
    }
    if (this.A2D.spotify.librespot) {
      if (this.config.A2DServer.spotify.usePause) this.sendSocketNotification("SPOTIFY_PAUSE")
      else this.sendSocketNotification("SPOTIFY_STOP")
    }
    if (this.A2D.radio) this.radio.pause()
    this.sendNotification("TV-STOP") // Stop MMM-FreeboxTV
  },

  /** Radio command (for recipe) **/
  radioCommand: function(payload) {
    if (!this.config.A2DServer.useA2D) return
    this.A2D = this.displayA2DResponse.A2D
    if (this.A2D.spotify.librespot) this.sendSocketNotification("SPOTIFY_STOP")
    if (this.A2D.youtube.displayed) {
      if (this.config.A2DServer.youtube.useVLC) {
        this.sendSocketNotification("YT_STOP")
        this.A2D.youtube.displayed = false
        this.displayA2DResponse.showYT()
        this.displayA2DResponse.A2DUnlock()
        this.displayA2DResponse.resetYT()
      }
      else this.displayA2DResponse.player.command("stopVideo")
    }
    if (payload.link) {
      if (payload.img) {
        var radioImg = document.getElementById("A2D_RADIO_IMG")
        this.radioPlayer.img = payload.img
        radioImg.src = this.radioPlayer.img
      }
      this.radioPlayer.link = payload.link
      this.radio.src = this.radioPlayer.link
      this.radio.autoplay = true
    }
  },

  /** Send Welcome **/
  sendWelcome: function() {
    if (this.config.A2DServer.useA2D && this.config.A2DServer.briefToday.useBriefToday && this.config.A2DServer.briefToday.welcome) {
      this.assistantActivate({type: "TEXT", key: this.config.A2DServer.briefToday.welcome, chime: false}, Date.now())
    }
  }
})
