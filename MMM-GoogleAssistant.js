/**
 ** Module : MMM-GoogleAssistant v3
 ** @bugsounet
 ** ©06-2021
 ** support: http://forum.bugsounet.fr
 **/

logGA = (...args) => { /* do nothing */ }
logEXT = (...args) => { /* do nothing */ }

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
      activateDelay: 250,
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
    micConfig: {
      recorder: "arecord",
      device: "default"
    },
    Extented: {
      useEXT: false,
      stopCommand: "stop",
      deviceName: "MagicMirror",
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
        useGooglePhotosAPI: false,
        displayType: "none",
        displayDelay: 10 * 1000,
        albums: [],
        sort: "new", // "old", "random"
        hiResolution: true,
        timeFormat: "DD/MM/YYYY HH:mm",
        moduleHeight: 300,
        moduleWidth: 300,
      },
      volume: {
        useVolume: false,
        volumePreset: "PULSE",
        myScript: null
      },
      welcome: {
        useWelcome: false,
        welcome: "brief Today"
      },
      screen: {
        useScreen: false,
        animateBody: true,
        delay: 5 * 60 * 1000,
        turnOffDisplay: true,
        mode: 1,
        ecoMode: true,
        delayed: 0,
        displayCounter: true,
        displayBar: true,
        displayStyle: "Text",
        detectorSleeping: false,
        governorSleeping: false,
        displayLastPresence: true
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
        useCallback: true,
        sleeping: "powersave",
        working: "ondemand"
      },
      internet: {
        useInternet: false,
        displayPing: false,
        delay: 2* 60 * 1000,
        scan: "google.fr",
        command: "pm2 restart 0",
        showAlert: true,
        needRestart: false,
        language: config.language
      },
      cast: {
        useCast: false,
        port: 8569
      },
      spotify: {
        useSpotify: false,
        visual: {
          updateInterval: 1000,
          idleInterval: 10000,
          useBottomBar: false,
          PATH: "../../../tokens/", // Needed Don't modify it !
          TOKEN: "tokenSpotify.json",
          CLIENT_ID: "",
          CLIENT_SECRET: "",
        },
        player: {
          type: "Raspotify",
          email: "",
          password: "",
          minVolume: 10,
          maxVolume: 90,
          usePause: true
        }
      }
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
       "/modules/MMM-GoogleAssistant/components/extented.js",
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
      es: "translations/es.json"
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
      "debug", "recipes", "assistantConfig", "micConfig",
      "responseConfig", "Extented", "NPMCheck"
    ]
    this.helperConfig = {}
    if (this.config.debug) {
      logGA = (...args) => { console.log("[GA]", ...args) }
      logEXT = (...args) => { console.log("[GA:EXT]", ...args) }
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
        if (this.config.Extented.useEXT) this.EXTActionsOnStatus(this.myStatus.actual)
      },
      EXT: (response)=> {
        if (this.config.Extented.useEXT)
         return this.ExtentedDisplay(response)
      },

      "sendSocketNotification": (noti, params) => {
        this.sendSocketNotification(noti, params)
      },
      "radioStop": ()=> this.displayEXTResponse.radio.pause(),
      "spotifyStatus": (status) => { // try to use spotify callback to unlock screen ...
        if (status) {
          /** Spotify active **/
          this.EXT.spotify.connected = true
        } else {
          /** Spotify inactive **/
          this.EXT.spotify.connected = false
          if (this.EXT.spotify.player && this.config.Extented.screen.useScreen && !this.displayEXTResponse.working()) {
            if (this.EXT.radioPlayer.play) return
            this.sendSocketNotification("SCREEN_LOCK", false)
            this.displayEXTResponse.showDivWithAnimatedFlip("EXT_SCREEN_CONTENER")
          }
          this.EXT.spotify.player = false
        }
      },
      "YTError": (error) => this.Informations("warning", { message: error }),
      "Informations": (info) => this.Informations("information", info),
      "Warning": (info) => this.Informations("warning", info)
    }

    this.assistantResponse = new AssistantResponse(this.helperConfig["responseConfig"], callbacks)

    /** Extented part **/
    if (this.config.Extented.useEXT) {
      this.checkStyle()
      this.spotifyNewVolume = false
      this.userPresence = null
      this.lastPresence = null
      this.DateTranslate = {
        day: " " + this.translate("DAY") + " ",
        days: " " + this.translate("DAYS") + " ",
        hour: " " + this.translate("HOUR") + " ",
        hours: " " + this.translate("HOURS") + " ",
        minute: " " + this.translate("MINUTE") + " ",
        minutes: " " + this.translate("MINUTES") + " ",
        second: " " + this.translate("SECOND"),
        seconds: " " + this.translate("SECONDS")
      }
      var EXTStopHooks = {
        transcriptionHooks: {
          "EXT_Stop": {
            pattern: this.config.Extented.stopCommand,
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
      this.parseLoadedRecipe(JSON.stringify(EXTStopHooks))
      if (this.config.Extented.youtube.useYoutube) {
        /** Integred YouTube recipe **/
        var EXTYTHooks = {
         transcriptionHooks: {
            "SEARCH_YouTube": {
              pattern: this.config.Extented.youtube.youtubeCommand + " (.*)",
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
              displayResponse: this.config.Extented.youtube.displayResponse
            },
          }
        }
        this.parseLoadedRecipe(JSON.stringify(EXTYTHooks))
      }

      // translate needed translate part in all languages
      this.config.Extented.volume.volumeText = this.translate("VolumeText")
      this.config.Extented.spotify.visual.deviceDisplay = this.translate("SpotifyListenText")
      this.config.Extented.spotify.visual.SpotifyForGA = this.translate("SpotifyForGA")
      this.config.Extented.photos.LoadingText= this.translate("LOADING")
      this.config.Extented.photos.GPAlbumName= this.translate("GPAlbumName")

      this.displayEXTResponse = new Extented(this.config.Extented, callbacks)
      if (this.config.Extented.spotify.useSpotify) this.spotify = new Spotify(this.config.Extented.spotify.visual, callbacks, this.config.debug)
      this.EXT = this.displayEXTResponse.EXT
      if (this.config.Extented.youtube.useYoutube && this.config.Extented.youtube.useVLC) this.initializeVolumeVLC()
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
    var dom = document.createElement("div")
    if (this.config.Extented.useEXT) {
      dom.id = "EXT_DISPLAY"

      if (this.config.Extented.spotify.useSpotify && !this.config.Extented.spotify.visual.useBottomBar) {
        spotify= this.spotify.prepareMini()
        dom.appendChild(spotify)
      }

      /** GPhotos Module mode**/
      if (this.config.Extented.photos.usePhotos && this.config.Extented.photos.useGooglePhotosAPI && this.config.Extented.photos.displayType == "Module") {
        var GPhotosAPI = document.createElement("div")
        GPhotosAPI.id = "EXT_GPHOTO"
        GPhotosAPI.style.height= this.config.Extented.photos.moduleHeight + "px"
        GPhotosAPI.style.width= this.config.Extented.photos.moduleWidth + "px"
        var GPhotosAPIBack = document.createElement("div")
        GPhotosAPIBack.id = "EXT_GPHOTO_BACK"
        var GPhotosAPICurrent = document.createElement("div")
        GPhotosAPICurrent.id = "EXT_GPHOTO_CURRENT"
        GPhotosAPICurrent.addEventListener('animationend', ()=>{
          GPhotosAPICurrent.classList.remove("animated")
        })
        var GPhotosAPIInfo = document.createElement("div")
        GPhotosAPIInfo.id = "EXT_GPHOTO_INFO"
        GPhotosAPIInfo.className= "Module"
        GPhotosAPIInfo.innerHTML = "Extented GPhotos Loading..."

        GPhotosAPI.appendChild(GPhotosAPIBack)
        GPhotosAPI.appendChild(GPhotosAPICurrent)
        GPhotosAPI.appendChild(GPhotosAPIInfo)
        dom.appendChild(GPhotosAPI)
      }

      /** Screen Contener (text, bar, last presence) **/
      var screenContener = document.createElement("div")
      screenContener.id = "EXT_SCREEN_CONTENER"
      screenContener.className= "animate__animated"
      screenContener.style.setProperty('--animate-duration', '1s')
      /***** Screen TimeOut Text *****/
      var screen = document.createElement("div")
      screen.id = "EXT_SCREEN"
      if (!this.config.Extented.screen.useScreen || (this.config.Extented.screen.displayStyle != "Text")) screen.className = "hidden"
      var screenText = document.createElement("div")
      screenText.id = "EXT_SCREEN_TEXT"
      screenText.textContent = this.translate("ScreenTurnOff")
      screen.appendChild(screenText)
      var screenCounter = document.createElement("div")
      screenCounter.id = "EXT_SCREEN_COUNTER"
      screenCounter.classList.add("counter")
      screenCounter.textContent = "--:--"
      screen.appendChild(screenCounter)
      screenContener.appendChild(screen)

      /***** Screen TimeOut Bar *****/
      var bar = document.createElement("div")
      bar.id = "EXT_BAR"
      if (!this.config.Extented.screen.useScreen || (this.config.Extented.screen.displayStyle == "Text") || !this.config.Extented.screen.displayBar) bar.className = "hidden"
      var screenBar = document.createElement("div")
      screenBar.id = "EXT_SCREEN_BAR"
      screenBar.classList.add(this.config.Extented.screen.displayStyle)
      bar.appendChild(screenBar)
      screenContener.appendChild(bar)

      /***** Last user Presence *****/
      var presence = document.createElement("div")
      presence.id = "EXT_PRESENCE"
      presence.className = "hidden"
      var presenceText = document.createElement("div")
      presenceText.id = "EXT_PRESENCE_TEXT"
      presenceText.textContent = this.translate("ScreenLastPresence")
      presence.appendChild(presenceText)
      var presenceDate = document.createElement("div")
      presenceDate.id = "EXT_PRESENCE_DATE"
      presenceDate.classList.add("presence")
      presenceDate.textContent = "Loading ..."
      presence.appendChild(presenceDate)
      screenContener.appendChild(presence)

      /** internet Ping **/
      var internet = document.createElement("div")
      internet.id = "EXT_INTERNET"
      if (!this.config.Extented.internet.useInternet || !this.config.Extented.internet.displayPing) internet.className = "hidden"
      var internetText = document.createElement("div")
      internetText.id = "EXT_INTERNET_TEXT"
      internetText.textContent = "Ping: "
      internet.appendChild(internetText)
      var internetPing = document.createElement("div")
      internetPing.id = "EXT_INTERNET_PING"
      internetPing.classList.add("ping")
      internetPing.textContent = "Loading ..."
      internet.appendChild(internetPing)

      /** Radio **/
      var radio = document.createElement("div")
      radio.id = "EXT_RADIO"
      radio.className = "hidden animate__animated"
      radio.style.setProperty('--animate-duration', '1s')
      var radioBackground = document.createElement("div")
      radioBackground.id = "EXT_RADIO_BACKGROUND"
      radio.appendChild(radioBackground)
      var radioForeground = document.createElement("div")
      radioForeground.id = "EXT_RADIO_FOREGROUND"
      radio.appendChild(radioForeground)
      var radioImg = document.createElement("img")
      radioImg.id = "EXT_RADIO_IMG"
      radioForeground.appendChild(radioImg)

      dom.appendChild(radio)
      dom.appendChild(screenContener)
      dom.appendChild(internet)
    }
    this.assistantResponse.preparePopup()
    this.assistantResponse.prepareBackground ()
    return dom
  },

  notificationReceived: function(noti, payload=null, sender=null) {
    this.doPlugin("onNotificationReceived", {notification:noti, payload:payload})
    switch (noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.helperConfig)
        if (this.config.Extented.useEXT) {
          this.displayEXTResponse.prepare()
          if (this.config.Extented.screen.useScreen) {
            if (this.config.Extented.screen.displayStyle != "Text") this.displayEXTResponse.prepareBar()
            if (this.config.Extented.screen.animateBody) this.displayEXTResponse.prepareBody()
          }
          if (this.config.Extented.spotify.useSpotify && this.config.Extented.spotify.visual.useBottomBar) this.spotify.prepare()
          if (this.config.Extented.touch.useTouch) this.touchScreen(this.config.Extented.touch.mode)
        }
        this.assistantResponse.prepareGA()
        this.Loading()
        if (this.config.Extented.useEXT &&
          this.config.Extented.photos.usePhotos &&
          (this.config.Extented.photos.displayType == "Background" || this.config.Extented.photos.displayType == "Module")
        ) {
          setTimeout(() => {
            if (this.config.Extented.photos.useGooglePhotosAPI) this.displayEXTResponse.showBackgroundGooglePhotoAPI()
            else this.Informations("warning", {message: "GPhotosNotActivated"})
          }, 10000)
        }
        break
      case "GA_ACTIVATE":
        this.assistantActivate({ type:"MIC" })
        break
      case "WAKEUP": /** for external wakeup **/
        if (this.config.Extented.useEXT && this.config.Extented.screen.useScreen) {
          this.sendSocketNotification("SCREEN_WAKEUP")
          this.Informations("information", { message: "ScreenWakeUp", values: sender.name })
        }
        break
      case "EXT_LOCK": /** screen lock **/
        if (this.config.Extented.useEXT && this.config.Extented.screen.useScreen) {
          this.sendSocketNotification("SCREEN_LOCK", true)
          this.displayEXTResponse.hideDivWithAnimatedFlip("EXT_SCREEN_CONTENER")
          this.Informations("information", { message: "ScreenLock", values: sender.name })
        }
        break
      case "EXT_UNLOCK": /** screen unlock **/
        if (this.config.Extented.useEXT && this.config.Extented.screen.useScreen) {
          this.sendSocketNotification("SCREEN_LOCK", false)
          this.displayEXTResponse.showDivWithAnimatedFlip("EXT_SCREEN_CONTENER")
          this.Informations("information", { message: "ScreenUnLock", values: sender.name })
        }
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
    if (this.config.Extented.useEXT) this.EXT = this.displayEXTResponse.EXT
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
        if (this.config.Extented.useEXT) this.sendWelcome()
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
        if (this.config.Extented.screen.displayStyle == "Text") {
          let counter = document.getElementById("EXT_SCREEN_COUNTER")
          counter.textContent = payload
        }
        break
      case "SCREEN_BAR":
        if (this.config.Extented.screen.displayStyle != "Text") {
          let value = (100 - ((payload * 100) / this.config.Extented.screen.delay))/100
          let timeOut = moment(new Date(this.config.Extented.screen.delay-payload)).format("mm:ss")
          this.displayEXTResponse.bar.animate(value, {
            step: (state, bar) => {
              bar.path.setAttribute('stroke', state.color)
              bar.setText(this.config.Extented.screen.displayCounter ? timeOut : "")
              bar.text.style.color = state.color
            }
          })
        }
        break
      case "SCREEN_PRESENCE":
        if (payload) this.lastPresence = moment().format("LL HH:mm")
        else this.userPresence = this.lastPresence
        if (this.userPresence && this.config.Extented.screen.displayLastPresence) {
          let presence= document.getElementById("EXT_PRESENCE")
          presence.classList.remove("hidden")
          let userPresence= document.getElementById("EXT_PRESENCE_DATE")
          userPresence.textContent= this.userPresence
        }
        break
      case "SCREEN_SHOWING":
        this.displayEXTResponse.screenShowing()
        break
      case "SCREEN_HIDING":
        this.displayEXTResponse.screenHiding()
        break
      case "SCREEN_POWER":
        this.sendNotification("SCREEN_POWER", payload)
        if (payload) this.Informations("information", { message: "ScreenPowerOn" })
        else this.Informations("information", { message: "ScreenPowerOff" })
        break
      /** new internet module (v2) **/
      case "INTERNET_DOWN":
        if (payload.ticks == 1) this.sendSocketNotification("SCREEN_WAKEUP")
        let FormatedSince = moment(payload.date).fromNow()
        this.Informations("warning", { message: "InternetDown", values: FormatedSince})
        break
      case "INTERNET_RESTART":
        this.sendSocketNotification("SCREEN_WAKEUP")
        this.Informations("information", { message: "InternetRestart" })
        break
      case "INTERNET_AVAILABLE":
        let DateDiff = payload
        this.sendSocketNotification("SCREEN_WAKEUP")
        // sport time ! translate the time elapsed since no internet into all languages !!!
        let FormatedMessage = (DateDiff.day ? (DateDiff.day + (DateDiff.day > 1 ? this.DateTranslate.days : this.DateTranslate.day)) : "")
          + (DateDiff.hour ? (DateDiff.hour + (DateDiff.hour > 1 ? this.DateTranslate.hours : this.DateTranslate.hour)): "")
          + (DateDiff.min ? (DateDiff.min + (DateDiff.min > 1 ? this.DateTranslate.minutes : this.DateTranslate.minute)): "")
          + DateDiff.sec + (DateDiff.sec > 1 ? this.DateTranslate.seconds : this.DateTranslate.second)
        this.Informations("information", { message: "InternetAvailable", values: FormatedMessage })
        break
      case "INTERNET_PING":
        var ping = document.getElementById("EXT_INTERNET_PING")
        ping.textContent = payload
        break

      /** cast module **/
      case "CAST_START":
        this.sendSocketNotification("SCREEN_WAKEUP")
        this.Informations("information", { message: "CastStart" })
        this.displayEXTResponse.castStart(payload)
        break
      case "CAST_STOP":
        this.Informations("information", { message: "CastStop" })
        this.displayEXTResponse.castStop()
        break

      /** Spotify module **/
      case "SPOTIFY_PLAY":
        this.spotify.updateCurrentSpotify(payload)
        if (!this.EXT.spotify.connected) return // don't check if not connected (use spotify callback)
        if (payload && payload.device && payload.device.name) { //prevent crash
          this.EXT.spotify.repeat = payload.repeat_state
          this.EXT.spotify.shuffle = payload.shuffle_state

          if (payload.device.name == this.config.Extented.deviceName) {
            if (this.EXT.radioPlayer.play) this.displayEXTResponse.radio.pause()
            this.EXT.spotify.currentVolume = payload.device.volume_percent
            if (!this.EXT.spotify.player) this.EXT.spotify.player = true
            if (this.EXT.spotify.connected && this.config.Extented.screen.useScreen && !this.displayEXTResponse.working()) {
              this.sendSocketNotification("SCREEN_WAKEUP")
              this.sendSocketNotification("SCREEN_LOCK", true)
              this.displayEXTResponse.hideDivWithAnimatedFlip("EXT_SCREEN_CONTENER")
            }
          }
          else {
            if (this.EXT.spotify.connected && this.EXT.spotify.player && this.config.Extented.screen.useScreen && !this.displayEXTResponse.working()) {
              this.sendSocketNotification("SCREEN_LOCK", false)
              this.displayEXTResponse.showDivWithAnimatedFlip("EXT_SCREEN_CONTENER")
            }
            if (this.EXT.spotify.player) this.EXT.spotify.player = false
          }
        }
        break
      case "SPOTIFY_IDLE":
        this.spotify.updatePlayback(false)
        if (this.EXT.spotify.player && this.config.Extented.screen.useScreen && !this.displayEXTResponse.working()) {
          this.sendSocketNotification("SCREEN_LOCK", false)
        }
        this.EXT.spotify.player = false
        break
      case "DONE_SPOTIFY_VOLUME":
        if (this.EXT.spotify.forceVolume && this.config.Extented.spotify.useSpotify) {
          if (this.EXT.spotify.player) {
            this.EXT.spotify.targetVolume = payload
          }
        }
        break

      /** YouTube module callback **/
      case "FINISH_YOUTUBE":
        this.EXT.youtube.displayed = false
        this.displayEXTResponse.showYT()
        this.displayEXTResponse.EXTUnlock()
        this.displayEXTResponse.resetYT()
        break

      /** Volume module callback **/
      case "VOLUME_DONE":
        this.displayEXTResponse.drawVolume(payload)
        break

      /** detector ON/OFF **/
      case "DETECTOR_START":
      case "SNOWBOY_START": // deprecied soon
        this.sendNotification("DETECTOR_START")
        break
      case "DETECTOR_STOP":
      case "SNOWBOY_STOP": // deprecied soon
        this.sendNotification("DETECTOR_STOP")
        break
      /** GPhotos **/
      case "GPhotos_PICT":
        if (payload && Array.isArray(payload) && payload.length > 0) {
          this.EXT.GPhotos.needMorePicsFlag = false
          this.EXT.GPhotos.scanned = payload
          this.EXT.GPhotos.index = 0
          this.EXT.GPhotos.scanned = payload
          this.Informations("information", {message: "GPReceive", values: payload.length })
        }
        break
      case "GPhotos_INIT":
        this.EXT.GPhotos.albums = payload
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
              if (this.config.Extented.useEXT && this.config.Extented.volume.useVolume) {
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

/** Send needed part of response screen to ExtentedDisplay Server **/
  ExtentedDisplay: function(response) {
    var opt = {
      "photos": null,
      "urls": null,
    }

    if (response.screen && (response.screen.links.length > 0 || response.screen.photos.length > 0)) {
      opt.photos = response.screen.photos
      opt.urls= response.screen.links
      logGA("Send Extented Display Response.")
      this.displayEXTResponse.start(opt)
    }
  },

  sendYouTubeResult: function (result) {
    var opt = {
      "photos": [],
      "urls": ["https://www.youtube.com/watch?v=" + result],
    }
    logGA("Send YouTube Response to Extented Display.")
    this.displayEXTResponse.start(opt)
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
    if (this.config.Extented.useEXT) {
      commander.add({
        command: "restart",
        description: this.translate("RESTART_HELP"),
        callback: "tbRestart"
      })
      if (this.config.Extented.screen.useScreen) {
        commander.add({
          command: "wakeup",
          description: this.translate("WAKEUP_HELP"),
          callback: "tbWakeup"
        })
      }
      commander.add({
        command: "hide",
        description: this.translate("HIDE_HELP"),
        callback: "tbHide"
      })
      commander.add({
        command: "show",
        description: this.translate("SHOW_HELP"),
        callback: "tbShow"
      })
      commander.add({
        command: "stop",
        description: this.translate("STOP_HELP"),
        callback: "tbStopEXT"
      })
      commander.add({
        command: "EXT",
        description: this.translate("EXT_HELP"),
        callback: "tbEXT"
      })
      if (this.config.Extented.volume.useVolume) {
        commander.add({
          command: "volume",
          description: this.translate("VOLUME_HELP"),
          callback: "tbVolume"
        })
      }
      if (this.config.Extented.spotify.useSpotify) {
        commander.add({
          command: "spotify",
          description: "Spotify commands",
          callback: "tbSpotify"
        })
      }
    }
  },

  tbQuery: function(command, handler) {
    var query = handler.args
    if (!query) handler.reply("TEXT", this.translate("QUERY_HELP"))
    else this.assistantActivate({ type:"TEXT", key: query })
  },

  tbRestart: function(command, handler) {
    if (handler.args) {
      this.sendSocketNotification("RESTART", handler.args)
      handler.reply("TEXT", this.translate("RESTART_DONE"))
    } else handler.reply("TEXT", this.translate("RESTART_ERROR"))
  },

  tbWakeup: function(command, handler) {
    this.sendSocketNotification("SCREEN_WAKEUP")
    handler.reply("TEXT", this.translate("WAKEUP_REPLY"))
  },

  tbHide: function(command, handler) {
    var found = false
    var unlock = false
    if (handler.args) {
      if (handler.args == "MMM-GoogleAssistant") {
        return handler.reply("TEXT", this.translate("DADDY"))
      }
      MM.getModules().enumerate((m)=> {
        if (m.name == handler.args) {
          found = true
          if (m.hidden) return handler.reply("TEXT", handler.args + this.translate("HIDE_ALREADY"))
          if (m.lockStrings.length > 0) {
            m.lockStrings.forEach( lock => {
              if (lock == "TB_EXT") {
                m.hide(500, {lockString: "TB_EXT"})
                if (m.lockStrings.length == 0) {
                  unlock = true
                  handler.reply("TEXT", handler.args + this.translate("HIDE_DONE"))
                }
              }
            })
            if (!unlock) return handler.reply("TEXT", handler.args + this.translate("HIDE_LOCKED"))
          }
          else {
            m.hide(500, {lockString: "TB_EXT"})
            handler.reply("TEXT", handler.args + this.translate("HIDE_DONE"))
          }
        }
      })
      if (!found) handler.reply("TEXT", this.translate("MODULE_NOTFOUND") + handler.args)
    } else return handler.reply("TEXT", this.translate("MODULE_NAME"))
  },

  tbShow: function(command, handler) {
    var found = false
    var unlock = false
    if (handler.args) {
      MM.getModules().enumerate((m)=> {
        if (m.name == handler.args) {
          found = true
          if (!m.hidden) return handler.reply("TEXT", handler.args + this.translate("SHOW_ALREADY"))
          if (m.lockStrings.length > 0) {
            m.lockStrings.forEach( lock => {
              if (lock == "TB_EXT") {
                m.show(500, {lockString: "TB_EXT"})
                if (m.lockStrings.length == 0) {
                  unlock = true
                  handler.reply("TEXT", handler.args + this.translate("SHOW_DONE"))
                }
              }
            })
            if (!unlock) return handler.reply("TEXT", handler.args + this.translate("SHOW_LOCKED"))
          }
          else {
            m.show(500, {lockString: "TB_EXT"})
            handler.reply("TEXT", handler.args + this.translate("SHOW_DONE"))
          }
        }
      })
      if (!found) handler.reply("TEXT", this.translate("MODULE_NOTFOUND") + handler.args)
    } else return handler.reply("TEXT", this.translate("MODULE_NAME"))
  },

  tbStopEXT: function(command, handler) {
    this.stopCommand()
    handler.reply("TEXT", this.translate("STOP_EXT"))
  },

  tbEXT: function (command, handler) {
    if (handler.args) {
      var responseEmulate = {
        "photos": [],
        "urls": []
      }
      var regexp = /^((http(s)?):\/\/)(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
      var isLink = regexp.test(handler.args)
      var retryWithHttp = regexp.test("http://" + handler.args)
      if (isLink || retryWithHttp) {
        handler.reply("TEXT", this.translate("EXT_OPEN") + handler.args)
        responseEmulate.urls[0] = isLink ? handler.args : ("http://" + handler.args)
        if (this.config.Extented.screen.useScreen) this.sendSocketNotification("SCREEN_WAKEUP")
        this.displayEXTResponse.start(responseEmulate)
      }
      else handler.reply("TEXT", this.translate("EXT_INVALID"))
    }
    else handler.reply("TEXT", "/EXT <link>")
  },

  tbVolume: function(command, handler) {
    if (handler.args) {
      var value = Number(handler.args)
      if ((!value && value != 0) || ((value < 0) || (value > 100))) return handler.reply("TEXT", "/volume [0-100]")
      this.sendSocketNotification("VOLUME_SET", value)
      handler.reply("TEXT", "Volume " + value+"%")
    }
    else handler.reply("TEXT", "/volume [0-100]")
  },

  tbSpotify: function(command, handler) {
    if (handler.args) {
      var args = handler.args.toLowerCase().split(" ")
      var params = handler.args.split(" ")
      if (args[0] == "play") {
        handler.reply("TEXT", "Spotify PLAY")
        this.SpotifyCommand("PLAY")
      }
      if (args[0] == "pause") {
        handler.reply("TEXT", "Spotify PAUSE")
        this.SpotifyCommand("PAUSE")
      }
      if (args[0] == "stop") {
        handler.reply("TEXT", "Spotify STOP")
        this.SpotifyCommand("STOP")
      }
      if (args[0] == "next") {
        handler.reply("TEXT", "Spotify NEXT")
        this.SpotifyCommand("NEXT")
      }
      if (args[0] == "previous") {
        handler.reply("TEXT", "Spotify PREVIOUS")
        this.SpotifyCommand("PREVIOUS")
      }
      if (args[0] == "volume") {
        if (args[1]) {
          if (isNaN(args[1])) return handler.reply("TEXT", "Must be a number ! [0-100]")
          if (args[1] > 100) args[1] = 100
          if (args[1] < 0) args[1] = 0
          handler.reply("TEXT", "Spotify VOLUME: " + args[1])
          this.SpotifyCommand("VOLUME", args[1])
        } else handler.reply("TEXT", "Define volume [0-100]")
      }
      if (args[0] == "to") {
        if (args[1]) {
          handler.reply("TEXT", "Spotify TRANSFER to: " + params[1] + " (if exist !)")
          this.SpotifyCommand("TRANSFER", params[1])
        }
        else handler.reply("TEXT", "Define the device name (case sensitive)")
      }
    } else {
      handler.reply("TEXT", 'Need Help for /spotify commands ?\n\n\
  *play*: Launch music (last title)\n\
  *pause*: Pause music\n\
  *stop*: Stop music\n\
  *next*: Next track\n\
  *previous*: Previous track\n\
  *volume*: Volume control, it need a value 0-100\n\
  *to*: Transfert music to another device (case sensitive)\
  ',{parse_mode:'Markdown'})
    }
  },

  /********************************/
  /** Extented Display**/
  /********************************/

  EXTActionsOnStatus: function(status) {
    this.EXT = this.displayEXTResponse.EXT
    switch(status) {
      case "listen":
      case "think":
        //this.EXT.speak = true
        if (this.config.Extented.screen.useScreen && !this.EXT.locked) this.sendSocketNotification("SCREEN_STOP")
        if (this.EXT.locked) this.displayEXTResponse.hideDisplay()
        if (this.config.Extented.youtube.useYoutube) {
          if (this.config.Extented.youtube.useVLC) this.sendSocketNotification("YT_VOLUME", this.config.Extented.youtube.minVolume)
          else if (this.displayEXTResponse.player) this.displayEXTResponse.player.command("setVolume", this.config.Extented.youtube.minVolume)
        }
        if (this.config.Extented.spotify.useSpotify && this.EXT.spotify.player) {
          this.EXT.spotify.targetVolume = this.EXT.spotify.currentVolume
          this.sendSocketNotification("SPOTIFY_VOLUME", this.config.Extented.spotify.player.minVolume)
        }
        if (this.EXT.radioPlayer.play) this.displayEXTResponse.radio.volume = 0.1
        break
      case "hook": // to see with hook !?
      case "standby":
        //this.EXT.speak = false
        if (this.config.Extented.screen.useScreen && !this.EXT.locked) this.sendSocketNotification("SCREEN_RESET")
        if (this.config.Extented.youtube.useYoutube) {
          if (this.config.Extented.youtube.useVLC) this.sendSocketNotification("YT_VOLUME", this.config.Extented.youtube.maxVolume)
          else if (this.displayEXTResponse.player) this.displayEXTResponse.player.command("setVolume", this.config.Extented.youtube.maxVolume)
        }
        if (this.config.Extented.spotify.useSpotify && this.EXT.spotify.player && !this.EXT.spotify.forceVolume) {
          this.sendSocketNotification("SPOTIFY_VOLUME", this.EXT.spotify.targetVolume)
        }
        this.EXT.spotify.forceVolume= false
        if (this.EXT.radioPlayer.play) this.displayEXTResponse.radio.volume = 0.6
        break
      case "reply":
        if (this.displayEXTResponse.working()) this.displayEXTResponse.showDisplay()
        else this.displayEXTResponse.hideDisplay()
        break
      case "continue":
      case "confirmation":
      case "error":
        break
    }
  },

  /** TouchScreen Feature **/
  touchScreen: function (mode) {
    let clickCount = 0
    let clickTimer = null
    let EXTisplay = document.getElementById("EXT_DISPLAY")

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
        EXTisplay.addEventListener('click', () => {
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
        EXTisplay.addEventListener('click', () => {
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
    if (!mode) logEXT("Touch Screen Function disabled.")
    else logEXT("Touch Screen Function added. [mode " + mode +"]")
  },

  /** Send Welcome **/
  sendWelcome () {
    if (this.config.Extented.welcome.useWelcome && this.config.Extented.welcome.welcome) {
      this.assistantActivate({type: "TEXT", key: this.config.Extented.welcome.welcome, chime: false}, Date.now())
    }
  },

  checkStyle: function () {
    /** Crash prevent on Time Out Style Displaying **/
    /** --> Set to "Text" if not found */
    let Style = [ "Text", "Line", "SemiCircle", "Circle" ]
    let found = Style.find((style) => {
      return style == this.config.Extented.screen.displayStyle
    })
    if (!found) {
      console.log("[GA:EXT] displayStyle Error ! ["+ this.config.Extented.screen.displayStyle + "]")
      this.config.Extented.screen= Object.assign({}, this.config.Extented.screen, {displayStyle : "Text"})
    }
  },

  /** initialise volume control for VLC **/
  initializeVolumeVLC: function() {
    /** convert volume **/
    try {
      let valueMin = null
      valueMin = parseInt(this.config.Extented.youtube.minVolume)
      if (typeof valueMin === "number" && valueMin >= 0 && valueMin <= 100) this.config.Extented.youtube.minVolume = ((valueMin * 255) / 100).toFixed(0)
      else {
        console.error("[GA:EXT] config.youtube.minVolume error! Corrected with 30")
        this.config.Extented.youtube.minVolume = 70
      }
    } catch (e) {
      console.error("[GA:EXT] config.youtube.minVolume error!", e)
      this.config.Extented.youtube.minVolume = 70
    }
    try {
      let valueMax = null
      valueMax = parseInt(this.config.Extented.youtube.maxVolume)
      if (typeof valueMax === "number" && valueMax >= 0 && valueMax <= 100) this.config.Extented.youtube.maxVolume = ((valueMax * 255) / 100).toFixed(0)
      else {
        console.error("[GA:EXT] config.youtube.maxVolume error! Corrected with 100")
        this.config.Extented.youtube.maxVolume = 255
      }
    } catch (e) {
      console.error("[GA:EXT] config.youtube.maxVolume error!", e)
      this.config.Extented.youtube.maxVolume = 255
    }
    console.log("[GA:EXT] VLC Volume Control initialized!")
  },

/**************************
 **** Recipes commands ****
 *************************/

  /** Spotify commands (for recipe) **/
  SpotifyCommand: function(command, payload) {
    if (!this.config.Extented.useEXT) return
    if (this.config.Extented.spotify.useSpotify) {
      this.EXT = this.displayEXTResponse.EXT
      switch (command) {
        case "PLAY":
          if (this.EXT.youtube.displayed && this.EXT.spotify.player) {
            if (this.EXT.radioPlayer.play) this.displayEXTResponse.radio.pause()
            if (this.config.Extented.youtube.useVLC) {
              this.sendSocketNotification("YT_STOP")
              this.EXT.youtube.displayed = false
              this.displayEXTResponse.showYT()
              this.displayEXTResponse.EXTUnlock()
              this.displayEXTResponse.resetYT()
            }
            else this.displayEXTResponse.player.command("stopVideo")
          }
          this.sendSocketNotification("SPOTIFY_PLAY")
          break
        case "PAUSE":
          this.sendSocketNotification("SPOTIFY_PAUSE")
          break
        case "STOP":
          if (this.EXT.spotify.player) this.sendSocketNotification("SPOTIFY_STOP")
          else this.sendSocketNotification("SPOTIFY_PAUSE")
          break
        case "NEXT":
          this.sendSocketNotification("SPOTIFY_NEXT")
          break
        case "PREVIOUS":
          this.sendSocketNotification("SPOTIFY_PREVIOUS")
          break
        case "SHUFFLE":
          this.sendSocketNotification("SPOTIFY_SHUFFLE", !this.EXT.spotify.shuffle)
          break
        case "REPEAT":
          this.sendSocketNotification("SPOTIFY_REPEAT", (this.EXT.spotify.repeat == "off" ? "track" : "off"))
          break
        case "TRANSFER":
          this.sendSocketNotification("SPOTIFY_TRANSFER", payload)
          break
        case "VOLUME":
          this.EXT.spotify.forceVolume = true
          this.sendSocketNotification("SPOTIFY_VOLUME", payload)
          break
        case "SEARCH":
          /** enforce type **/
          var searchType = payload.query.split(" ")
          var type = null
          if (searchType[0] == this.translate("SpotifySearchTypePlaylist")) type = "playlist"
          else if (searchType[0] == this.translate("SpotifySearchTypeAlbum")) type= "album"
          else if (searchType[0] == this.translate("SpotifySearchTypeTrack")) type= "track"
          else if (searchType[0] == this.translate("SpotifySearchTypeArtist")) type= "artist"
          if (type) {
            payload.query = payload.query.replace(searchType[0] + " ","")
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
          if (this.EXT.youtube.displayed && this.EXT.spotify.player) {
            if (this.config.Extented.youtube.useVLC) {
              this.sendSocketNotification("YT_STOP")
              this.EXT.youtube.displayed = false
              this.displayEXTResponse.showYT()
              this.displayEXTResponse.EXTUnlock()
              this.displayEXTResponse.resetYT()
            }
            else this.displayEXTResponse.player.command("stopVideo")
          }
          break
      }
    }
  },

  /** stopCommand (for recipe) **/
  stopCommand: function() {
    if (!this.config.Extented.useEXT) return
    this.EXT = this.displayEXTResponse.EXT
    if (this.EXT.locked) {
      if (this.EXT.youtube.displayed) {
        if (this.config.Extented.youtube.useVLC) {
          this.sendSocketNotification("YT_STOP")
          this.EXT.youtube.displayed = false
          this.displayEXTResponse.showYT()
          this.displayEXTResponse.EXTUnlock()
          this.displayEXTResponse.resetYT()
        }
        else this.displayEXTResponse.player.command("stopVideo")
      }
      if (this.EXT.photos.displayed) {
        this.displayEXTResponse.resetPhotos()
        this.displayEXTResponse.hideDisplay()
      }
      if (this.EXT.links.displayed) {
        this.displayEXTResponse.resetLinks()
        this.displayEXTResponse.hideDisplay()
      }
    }
    if (this.EXT.spotify.player) {
      if (this.config.Extented.spotify.player.usePause) this.sendSocketNotification("SPOTIFY_PAUSE")
      else this.sendSocketNotification("SPOTIFY_STOP")
    }
    if (this.EXT.radioPlayer.play) this.displayEXTResponse.radio.pause()
    this.sendNotification("TV-STOP") // Stop MMM-FreeboxTV
    this.Informations("information", { message: "EXTStop" })
  },

  /** Radio command (for recipe) **/
  radioCommand: function(payload) {
    if (!this.config.Extented.useEXT) return
    this.EXT = this.displayEXTResponse.EXT
    if (this.EXT.spotify.player) this.sendSocketNotification("SPOTIFY_STOP")
    if (this.EXT.youtube.displayed) {
      if (this.config.Extented.youtube.useVLC) {
        this.sendSocketNotification("YT_STOP")
        this.EXT.youtube.displayed = false
        this.displayEXTResponse.showYT()
        this.displayEXTResponse.EXTUnlock()
        this.displayEXTResponse.resetYT()
      }
      else this.displayEXTResponse.player.command("stopVideo")
    }
    if (payload.link) {
      if (payload.img) {
        var radioImg = document.getElementById("EXT_RADIO_IMG")
        var backGround = document.getElementById("EXT_RADIO_BACKGROUND")
        this.EXT.radioPlayer.img = payload.img
        radioImg.src = this.EXT.radioPlayer.img
        backGround.style.backgroundImage = `url(${payload.img})`
      }
      this.displayEXTResponse.radio.src = payload.link
      this.displayEXTResponse.radio.autoplay = true
    }
  },

  /** GooglePhotos API recipe **/
  showGooglePhotos() {
    if (!this.config.Extented.useEXT) return this.Informations("warning", { message: "EXTNotActivated" })
    if (!this.config.Extented.photos.usePhotos) return this.Informations("warning", { message: "PhotosNotActivated" })
    if (!this.config.Extented.photos.useGooglePhotosAPI) return this.Informations("warning", { message: "GPhotosNotActivated" })
    if (this.config.Extented.photos.displayType == "Background") return this.Informations("warning", { message: "GPhotosBckGrndActivated" })
    if (this.config.Extented.photos.displayType == "Module") return this.Informations("warning", { message: "GPhotosModuleActivated" })
    if (this.config.Extented.photos.displayType != "Recipe") return this.Informations("warning", { message: "GPhotosRecipeNotActivated" })
    this.displayEXTResponse.showGooglePhotoAPI()
  },
/***********************

  /** internet utils **/
  dateDiff: function (date1, date2) {
    var diff = {}
    var tmp = date2 - date1
    tmp = Math.floor(tmp/1000)
    diff.sec = tmp % 60
    tmp = Math.floor((tmp-diff.sec)/60)
    diff.min = tmp % 60
    tmp = Math.floor((tmp-diff.min)/60)
    diff.hour = tmp % 24
    tmp = Math.floor((tmp-diff.hour)/24)
    diff.day = tmp
    return diff
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

  resume: function() {
    if (this.config.Extented.useEXT) {
      if (this.config.Extented.spotify.useSpotify) {
        this.EXT = this.displayEXTResponse.EXT
        if (this.EXT.spotify.connected && this.config.Extented.spotify.visual.useBottomBar) {
          this.displayEXTResponse.showSpotify()
          logEXT("Spotify is resumed.")
        }
      }
      if (this.config.Extented.photos.usePhotos &&
        this.config.Extented.photos.displayType == "Background" &&
        this.config.Extented.photos.useGooglePhotosAPI
      ) {
        var GPhotos = document.getElementById("EXT_GPHOTO")
        GPhotos.classList.remove("hidden")
        logEXT("GPhotos is resumed.")
      }
    }
  },

  suspend: function() {
    if (this.config.Extented.useEXT) {
      if (this.config.Extented.spotify.useSpotify) {
        this.EXT = this.displayEXTResponse.EXT
        if (this.EXT.spotify.connected && this.config.Extented.spotify.visual.useBottomBar) {
          this.displayEXTResponse.hideSpotify()
          logEXT("Spotify is suspended.")
        }
      }
      if (this.config.Extented.photos.usePhotos &&
        this.config.Extented.photos.displayType == "Background" &&
        this.config.Extented.photos.useGooglePhotosAPI
      ) {
        var GPhotos = document.getElementById("EXT_GPHOTO")
        GPhotos.classList.add("hidden")
        logEXT("GPhotos is suspended.")
      }
    }
  }
})
