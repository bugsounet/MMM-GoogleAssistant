class EXT_OthersRules {
  constructor() {
    console.log("[GA] EXT_OthersRules Ready")
  }

  /** Activate automaticaly any plugins **/
  helloEXT(that, module) {
    switch (module) {
      case that.ExtDB.find(name => name === module): //read DB and find module
        that.EXT[module].hello= true
        that.sendSocketNotification("HELLO", module)
        logGA("[EXT_OthersRules] Hello,", module)
        this.onStartPlugin(that, module)
        break
      default:
        console.warn("[GA] [EXT_OthersRules] Hi,", module, "what can i do for you ?")
        break
    }
  }

  /** Rule when a plugin send Hello **/
  onStartPlugin(that, plugin) {
    if (!plugin) return
    if (plugin == "EXT-Background") that.sendNotification("GA_FORCE_FULLSCREEN")
    if (plugin == "EXT-Detector") setTimeout(() => that.sendNotification("EXT_DETECTOR-START") , 300)
    if (plugin == "EXT-Pages") that.sendNotification("EXT_PAGES-Gateway")
    if (plugin == "EXT-Pir") that.sendNotification("EXT_PIR-START")
    if (plugin == "EXT-Bring") that.sendNotification("EXT_BRING-START")
  }

  /** Connect rules **/
  connectEXT(that, extName) {
    if (!that.EXT.GA_Ready) return console.error("[GA] [EXT_OthersRules] Hey " + extName + "!, MMM-GoogleAssistant is not ready")
    if (!that.EXT[extName] || that.EXT[extName].connected) return

    if(that.EXT["EXT-Screen"].hello && !this.hasPluginConnected(that.EXT, "connected", true)) {
      if (!that.EXT["EXT-Screen"].power) that.sendNotification("EXT_SCREEN-WAKEUP")
      that.sendNotification("EXT_SCREEN-LOCK")
      if (that.EXT["EXT-Motion"].hello && that.EXT["EXT-Motion"].started) that.sendNotification("EXT_MOTION-DESTROY")
      if (that.EXT["EXT-Pir"].hello && that.EXT["EXT-Pir"].started) that.sendNotification("EXT_PIR-STOP")
      if (that.EXT["EXT-StreamDeck"].hello) that.sendNotification("EXT_STREAMDECK-ON")
      if (that.EXT["EXT-Bring"].hello) that.sendNotification("EXT_BRING-STOP")
    }

    if (this.browserOrPhotoIsConnected(that)) {
      logGA("[EXT_OthersRules] Connected:", extName, "[browserOrPhoto Mode]")
      that.EXT[extName].connected = true
      this.lockPagesByGW(that,extName)
      that.sendSocketNotification("EXTStatus", that.EXT)
      return
    }

    if (that.EXT["EXT-Spotify"].hello && that.EXT["EXT-Spotify"].connected) that.sendNotification("EXT_SPOTIFY-STOP")
    if (that.EXT["EXT-MusicPlayer"].hello && that.EXT["EXT-MusicPlayer"].connected) that.sendNotification("EXT_MUSIC-STOP")
    if (that.EXT["EXT-RadioPlayer"].hello && that.EXT["EXT-RadioPlayer"].connected) that.sendNotification("EXT_RADIO-STOP")
    if (that.EXT["EXT-YouTube"].hello && that.EXT["EXT-YouTube"].connected) that.sendNotification("EXT_YOUTUBE-STOP")
    if (that.EXT["EXT-YouTubeCast"].hello && that.EXT["EXT-YouTubeCast"].connected) that.sendNotification("EXT_YOUTUBECAST-STOP")
    if (that.EXT["EXT-FreeboxTV"].hello && that.EXT["EXT-FreeboxTV"].connected) that.sendNotification("EXT_FREEBOXTV-STOP")

    logGA("[EXT_OthersRules] Connected:", extName)
    logGA("[EXT_OthersRules] Debug:", that.EXT)
    that.EXT[extName].connected = true
    this.lockPagesByGW(that, extName)
  }

  /** disconnected rules **/
  disconnectEXT(that, extName) {
    if (!that.EXT.GA_Ready) return console.error("[GA] [EXT_OthersRules] MMM-GoogleAssistant is not ready")
    if (!that.EXT[extName] || !that.EXT[extName].connected) return
    that.EXT[extName].connected = false

    // sport time ... verify if there is again an EXT module connected !
    setTimeout(()=> { // wait 1 sec before scan ...
      if (that.EXT["EXT-Screen"].hello && !this.hasPluginConnected(that.EXT, "connected", true)) {
        that.sendNotification("EXT_SCREEN-UNLOCK")
        if (that.EXT["EXT-Motion"].hello && !that.EXT["EXT-Motion"].started) that.sendNotification("EXT_MOTION-INIT")
        if (that.EXT["EXT-Pir"].hello && !that.EXT["EXT-Pir"].started) that.sendNotification("EXT_PIR-START")
        if (that.EXT["EXT-StreamDeck"].hello) that.sendNotification("EXT_STREAMDECK-OFF")
        if (that.EXT["EXT-Bring"].hello) that.sendNotification("EXT_BRING-START")
      }
      if (that.EXT["EXT-Pages"].hello && !this.hasPluginConnected(that.EXT, "connected", true)) that.sendNotification("EXT_PAGES-UNLOCK")
      logGA("[EXT_OthersRules] Disconnected:", extName)
    }, 1000)
  }

  /** need to lock EXT-Pages ? **/
  lockPagesByGW(that, extName) {
    if (that.EXT["EXT-Pages"].hello) {
      if(that.EXT[extName].hello && that.EXT[extName].connected && typeof that.EXT["EXT-Pages"][extName] == "number") {
        that.sendNotification("EXT_PAGES-CHANGED", that.EXT["EXT-Pages"][extName])
        that.sendNotification("EXT_PAGES-LOCK")
      }
      else that.sendNotification("EXT_PAGES-PAUSE")
    }
  }

  /** need to force lock/unlock Pages and Screen ? **/
  forceLockPagesAndScreen(that) {
    if (that.EXT["EXT-Pages"].hello) that.sendNotification("EXT_PAGES-LOCK")
    if (that.EXT["EXT-Screen"].hello) {
      if (!that.EXT["EXT-Screen"].power) that.sendNotification("EXT_SCREEN-WAKEUP")
      that.sendNotification("EXT_SCREEN-LOCK")
    }
  }

  forceUnLockPagesAndScreen(that) {
    if (that.EXT["EXT-Pages"].hello) that.sendNotification("EXT_PAGES-UNLOCK")
    if (that.EXT["EXT-Screen"].hello) that.sendNotification("EXT_SCREEN-UNLOCK")
  }

  browserOrPhotoIsConnected(that) {
    if ((that.EXT["EXT-Browser"].hello && that.EXT["EXT-Browser"].connected) || 
      (that.EXT["EXT-Photos"].hello && that.EXT["EXT-Photos"].connected)) {
        logGA("[EXT_OthersRules] browserOrPhoto", true)
        return true
    }
    return false
  }

  /** hasPluginConnected(obj, key, value)
   * obj: object to check
   * key: key to check in deep
   * value: value to check with associated key
   * @bugsounet 09/01/2022
  **/
  hasPluginConnected(obj, key, value) {
    if (typeof obj === 'object' && obj !== null) {
      if (obj.hasOwnProperty(key)) return true
      for (var p in obj) {
        if (obj.hasOwnProperty(p) && this.hasPluginConnected(obj[p], key, value)) {
          //logGA("check", key+":"+value, "in", p)
          if (obj[p][key] == value) {
            //logGA(p, "is connected")
            return true
          }
        }
      }
    }
    return false
  }

  checkModulesTB() {
    return new Promise(resolve => {
      var nb=0
      MM.getModules().withClass("EXT-Telegrambot MMM-TelegramBot").enumerate((module)=> {
        nb++
        if (nb >= 2) resolve(true)
      })
      resolve(false)
    })
  }

  checkModulePir() {
    return new Promise(resolve => {
      var nb=0
      MM.getModules().withClass("MMM-Pir").enumerate((module)=> {
        nb++
        if (nb >= 2) resolve(true)
      })
      resolve(false)
    })
  }
}
