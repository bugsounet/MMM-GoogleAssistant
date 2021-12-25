/* EXT Class for displaying */

class Extented {
  constructor (Config, callbacks) {
    this.config = Config
    this.sendSocketNotification = callbacks.sendSocketNotification
    this.Informations = callbacks.Informations
    this.Warning = callbacks.Warning
    this.radioStop = callbacks.radioStop
    this.YTError = callbacks.YTError
    this.timer = null
    this.bar = null
    this.radio = null
    this.createRadio()
    this.EXT = {
      GPhotos: {
        updateTimer: null,
        albums: null,
        scanned: [],
        index: 0,
        needMorePicsFlag: true,
        warning: 0
      },
      radioPlayer: {
        play: false,
        img: null,
        link: null,
      },
      radio: false,
      speak: false,
      locked: false,
      photos: {
        displayed: false,
        position: 0,
        urls: null,
        length: 0
      },
      spotify: {
        connected: false,
        player: false,
        currentVolume: 0,
        targetVolume: this.config.spotify.maxVolume,
        repeat: null,
        shuffle: null,
        forceVolume: false
      },
      radio: {
        play: false,
        img: null,
        link: null
      },
      music: {
        connected: false
      }
    }
    console.log("[GA:EXT] ExtentedClass Loaded")
  }

  start(response) {
    /** Close all active windows and reset it **/
    if (this.EXT.music.connected) {
      this.sendSocketNotification("MUSIC_STOP")
    }
    if (this.EXT.photos.displayed) {
      this.resetPhotos()
      this.hideDisplay()
    }

    /** prepare **/
    let tmp = {}
    logEXT("Response Scan")

    tmp = {
      photos: {
        position: 0,
        urls: response.photos,
        length: response.photos.length,
      }
    }

    /** the show must go on ! **/
    this.EXT = this.objAssign({}, this.EXT, tmp)
    if(this.config.photos.usePhotos && this.EXT.photos.length > 0) {
      this.EXTLock()
      this.EXT.photos.displayed = true
      this.photoDisplay()
      this.showDisplay()
    }
    logEXT("Response Structure:", this.EXT)
  }

/** photos code **/
  photoDisplay() {
    var photo = document.getElementById("EXT_PHOTO")
    logEXT("Loading photo #" + (this.EXT.photos.position+1) + "/" + (this.EXT.photos.length))
    photo.src = this.EXT.photos.urls[this.EXT.photos.position]

    photo.addEventListener("load", () => {
      logEXT("Photo Loaded")
      this.timerPhoto = setTimeout( () => {
        this.photoNext()
      }, this.config.photos.displayDelay)
    }, {once: true})
    photo.addEventListener("error", (event) => {
      if (this.EXT.photos.displayed) {
        logEXT("Photo Loading Error... retry with next")
        clearTimeout(this.timerPhoto)
        this.timerPhoto = null
        this.photoNext()
      }
    }, {once: true})
  }

  photoNext() {
    if (this.EXT.photos.position >= (this.EXT.photos.length-1) ) {
      this.resetPhotos()
      this.hideDisplay()
    } else {
      this.EXT.photos.position++
      this.photoDisplay()
    }
  }

  resetPhotos() {
    clearTimeout(this.timerPhoto)
    this.timerPhoto = null
    let tmp = {
      photos: {
        displayed: false,
        position: 0,
        urls: null,
        length: 0
      }
    }
    this.EXT = this.objAssign({}, this.EXT, tmp)
    var photo = document.getElementById("EXT_PHOTO")
    photo.removeAttribute('src')
    if (this.config.photos.useGooglePhotosAPI) {
      this.stopGooglePhotoAPI()
    }
    logEXT("Reset Photos", this.EXT)

  }

/** Other Cmds **/
  prepare() {
    var newGA = document.getElementById("GAv3")
    var dom = document.createElement("div")
    dom.id = "EXT"
    dom.classList.add("hidden")

    var scoutpan = document.createElement("div")
    scoutpan.id = "EXT_WINDOW"
    var scoutphoto = document.createElement("img")
    scoutphoto.id = "EXT_PHOTO"
    scoutphoto.classList.add("hidden")
    scoutpan.appendChild(scoutphoto)

    if (this.config.photos.displayType == "Background") this.prepareGPhotosBackground()
    if (this.config.photos.displayType == "Recipe") {
      var scoutGPhotosAPI = document.createElement("div")
      scoutGPhotosAPI.id = "EXT_GPHOTO"
      scoutGPhotosAPI.classList.add("hidden")
      var scoutGPhotosAPIBack = document.createElement("div")
      scoutGPhotosAPIBack.id = "EXT_GPHOTO_BACK"
      var scoutGPhotosAPICurrent = document.createElement("div")
      scoutGPhotosAPICurrent.id = "EXT_GPHOTO_CURRENT"
      scoutGPhotosAPICurrent.addEventListener('animationend', ()=>{
        scoutGPhotosAPICurrent.classList.remove("animated")
      })
      var scoutGPhotosAPIInfo = document.createElement("div")
      scoutGPhotosAPIInfo.id = "EXT_GPHOTO_INFO"
      scoutGPhotosAPIInfo.innerHTML = "Extented GPhotos Loading..."

      scoutGPhotosAPI.appendChild(scoutGPhotosAPIBack)
      scoutGPhotosAPI.appendChild(scoutGPhotosAPICurrent)
      scoutGPhotosAPI.appendChild(scoutGPhotosAPIInfo)
      scoutpan.appendChild(scoutGPhotosAPI)
    }

    dom.appendChild(scoutpan)

    newGA.appendChild(dom)
    return dom
  }

  // make a fake module for GPhotos fullscreen below background
  prepareGPhotosBackground () {
    if (!this.config.photos.useGooglePhotosAPI) return
    var nodes = document.getElementsByClassName("region fullscreen below")
    var pos = nodes[0].querySelector(".container")
    var children = pos.children
    var module = document.createElement("div")
    module.id = "module_Fake_EXT_GPHOTO"
    module.classList.add("module", "EXT_GPHOTO", "hidden")
    var header = document.createElement("header")
    header.classList.add("module-header")
    header.style.display = "none"
    module.appendChild(header)
    var content = document.createElement("div")
    content.classList.add("module-content")
    var viewDom = document.createElement("div")
    viewDom.id = "EXT_GPHOTO"
    var back = document.createElement("div")
    back.id = "EXT_GPHOTO_BACK"
    var current = document.createElement("div")
    current.id = "EXT_GPHOTO_CURRENT"
    current.addEventListener('animationend', ()=>{
      current.classList.remove("animated")
    })
    var info = document.createElement("div")
    info.id = "EXT_GPHOTO_INFO"
    info.innerHTML = this.config.photos.LoadingText
    viewDom.appendChild(back)
    viewDom.appendChild(current)
    viewDom.appendChild(info)

    content.appendChild(viewDom)
    module.appendChild(content)
    pos.insertBefore(module, children[children.length])
  }

  showDisplay() {
    logEXT("Show Iframe")
    var photo = document.getElementById("EXT_PHOTO")
    var photoAPI = document.getElementById("EXT_GPHOTO")
    var winEXT = document.getElementById("EXT")
    winEXT.classList.remove("hidden")

    if (this.EXT.photos.displayed) {
      if (this.EXT.photos.length > 0) photo.classList.remove("hidden")
      photoAPI.classList.remove("hidden")
    }
    if (this.EXT.photos.forceClose) photo.classList.add("hidden")
  }

  hideDisplay() {
    logEXT("Hide Iframe")
    var winEXT = document.getElementById("EXT")
    var photo = document.getElementById("EXT_PHOTO")
    var photoAPI = document.getElementById("EXT_GPHOTO")

    if (!this.EXT.photos.displayed) {
      photo.classList.add("hidden")
      if (this.config.photos.displayType == "Recipe") photoAPI.classList.add("hidden")
    }
    if (!this.working()) {
      winEXT.classList.add("hidden")
      this.EXTUnlock()
    }
  }

  hideSpotify() {
    var spotifyModule = document.getElementById("module_EXT_Spotify")
    var dom = document.getElementById("EXT_SPOTIFY")
    this.timer = null
    clearTimeout(this.timer)
    dom.classList.remove("bottomIn")
    dom.classList.add("bottomOut")
    this.timer = setTimeout(() => {
      dom.classList.add("inactive")
      spotifyModule.style.display = "none"
    }, 500)
  }

  showSpotify() {
    var spotifyModule = document.getElementById("module_EXT_Spotify")
    var dom = document.getElementById("EXT_SPOTIFY")
    spotifyModule.style.display = "block"
    dom.classList.remove("bottomOut")
    dom.classList.add("bottomIn")
    dom.classList.remove("inactive")
  }

  EXTLock() {
    if (this.EXT.locked) return
    logEXT("Lock Screen")
    MM.getModules().enumerate((module)=> {
      module.hide(15, {lockString: "EXT_LOCKED"})
    })
    if (this.EXT.spotify.connected && this.config.spotify.useBottomBar) this.hideSpotify()
    if (this.config.screen.useScreen) this.sendSocketNotification("SCREEN_LOCK", true)
    this.EXT.locked = true
  }

  EXTUnlock () {
    if (!this.EXT.locked || this.working()) return
    logEXT("Unlock Screen")
    MM.getModules().enumerate((module)=> {
      module.show(15, {lockString: "EXT_LOCKED"})
    })
    if (this.EXT.spotify.connected && this.config.spotify.useBottomBar) this.showSpotify()
    if (this.config.screen.useScreen && !this.EXT.spotify.connected) this.sendSocketNotification("SCREEN_LOCK", false)
    this.EXT.locked = false
  }

  objAssign (result) {
    var stack = Array.prototype.slice.call(arguments, 1)
    var item
    var key
    while (stack.length) {
      item = stack.shift()
      for (key in item) {
        if (item.hasOwnProperty(key)) {
          if (typeof result[key] === "object" && result[key] && Object.prototype.toString.call(result[key]) !== "[object Array]") {
            if (typeof item[key] === "object" && item[key] !== null) {
              result[key] = this.objAssign({}, result[key], item[key])
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
  }

  working () {
    return (this.EXT.photos.displayed)
  }

  /** hacking body for animated **/
  prepareBody() {
    document.body.id = "EXT_SCREEN_ANIMATE"
    document.body.className= "animate__animated"
    document.body.style.setProperty('--animate-duration', '1s')
  }

  /** GPhotos API **/
  updatePhotos () {
    if (this.EXT.GPhotos.scanned.length == 0) { // To see there bug
      console.log("!!! GPhotos debug: " + this.EXT.GPhotos.scanned.length)
      this.sendSocketNotification("GP_MORE_PICTS")
      return
    }
    if (this.EXT.GPhotos.index < 0) this.EXT.GPhotos.index = 0
    if (this.EXT.GPhotos.index >= this.EXT.GPhotos.scanned.length) this.EXT.GPhotos.index = 0
    var target = this.EXT.GPhotos.scanned[this.EXT.GPhotos.index]
    if (this.config.photos.hiResolution) {
      var url = target.baseUrl + "=w1080-h1920"
    }
    else var url = target.baseUrl
    this.ready(url, target)
    this.EXT.GPhotos.index++
    if (this.EXT.GPhotos.index >= this.EXT.GPhotos.scanned.length) {
      this.EXT.GPhotos.index = 0
      this.EXT.GPhotos.needMorePicsFlag = true
      if (this.config.photos.displayType == "Recipe") this.hideGooglePhotoAPI()
    }
    if (this.EXT.GPhotos.needMorePicsFlag) {
      this.sendSocketNotification("GP_MORE_PICTS")
    }
  }

  ready (url, target) {
    var hidden = document.createElement("img")
    hidden.onerror = () => {
      console.log("[GA:EXT:GPHOTOS] Image load fails.")
      this.Informations({message: "GPFailedOpenURL" })
      this.sendSocketNotification("GP_LOAD_FAIL", url)
    }
    hidden.onload = () => {
      var back = document.getElementById("EXT_GPHOTO_BACK")
      var current = document.getElementById("EXT_GPHOTO_CURRENT")
      var dom = document.getElementById("EXT_GPHOTO")
      back.style.backgroundImage = `url(${url})`
      current.style.backgroundImage = `url(${url})`
      current.classList.add("animated")
      var info = document.getElementById("EXT_GPHOTO_INFO")
      var album = this.EXT.GPhotos.albums.find((a)=>{
        if (a.id == target._albumId) return true
        return false
      })
      info.innerHTML = ""
      var albumCover = document.createElement("div")
      albumCover.classList.add("albumCover")
      if (typeof album != 'undefined') { // @doctorfree patch
        albumCover.style.backgroundImage = `url(modules/MMM-GoogleAssistant/tmp/cache/${album.id})`
      }
      var albumTitle = document.createElement("div")
      albumTitle.classList.add("albumTitle")
      albumTitle.innerHTML = this.config.photos.GPAlbumName+ " " + album.title
      var photoTime = document.createElement("div")
      photoTime.classList.add("photoTime")
      photoTime.innerHTML = (this.config.photos.timeFormat == "relative")
        ? moment(target.mediaMetadata.creationTime).fromNow()
        : moment(target.mediaMetadata.creationTime).format(this.config.photos.timeFormat)
      var infoText = document.createElement("div")
      infoText.classList.add("infoText")

      info.appendChild(albumCover)
      infoText.appendChild(albumTitle)
      infoText.appendChild(photoTime)
      info.appendChild(infoText)
      logEXT("GPHOTOS: Image loaded ["+ this.EXT.GPhotos.index + "/" + this.EXT.GPhotos.scanned.length + "]:", url)
      this.sendSocketNotification("GP_LOADED", url)
    }
    hidden.src = url
  }

  showGooglePhotoAPI () {
    if (this.EXT.GPhotos.scanned.length == 0) {
      clearTimeout(this.EXT.GPhotos.updateTimer)
      this.EXT.GPhotos.updateTimer = null
      this.Informations({message: "GPNoPhotoFound" })
      this.sendSocketNotification("GP_MORE_PICTS")
      this.EXT.GPhotos.warning++
      if (this.EXT.GPhotos.warning >= 5) {
        this.Warning({message: "GPError" })
        this.EXT.GPhotos.warning = 0
        return
      }
      this.EXT.GPhotos.updateTimer = setInterval(()=>{
        this.showBackgroundGooglePhotoAPI()
      }, 15000)
    } else {
      this.Informations({message: "GPOpen" })
      clearTimeout(this.EXT.GPhotos.updateTimer)
      this.EXT.GPhotos.updateTimer = null
      this.EXTLock()
      this.EXT.photos.displayed = true
      this.showDisplay()
      this.updatePhotos()

      this.EXT.GPhotos.updateTimer = setInterval(()=>{
        this.updatePhotos()
      }, this.config.photos.displayDelay)
    }
  }

  hideGooglePhotoAPI () {
    this.stopGooglePhotoAPI()
    this.EXTUnlock()
    this.EXT.photos.displayed = false
    this.hideDisplay()
  }

  showBackgroundGooglePhotoAPI () {
    if (this.EXT.GPhotos.scanned.length == 0) {
      clearTimeout(this.EXT.GPhotos.updateTimer)
      this.EXT.GPhotos.updateTimer = null
      this.Informations({message: "GPNoPhotoFound" })
      this.sendSocketNotification("GP_MORE_PICTS")
      this.EXT.GPhotos.warning++
      if (this.EXT.GPhotos.warning >= 5) {
        this.Warning({message: "GPError" })
        this.EXT.GPhotos.warning = 0
        return
      }
      this.EXT.GPhotos.updateTimer = setInterval(()=>{
        this.showBackgroundGooglePhotoAPI()
      }, 15000)
    } else {
      if (this.EXT.GPhotos.albums) this.Informations({message: "GPOpen" })
      clearTimeout(this.EXT.GPhotos.updateTimer)
      this.EXT.GPhotos.updateTimer = null
      this.updatePhotos()

      this.EXT.GPhotos.updateTimer = setInterval(()=>{
        this.updatePhotos()
      }, this.config.photos.displayDelay)
    }
  }

  stopGooglePhotoAPI () {
    this.Informations({message: "GPClose" })
    clearInterval(this.EXT.GPhotos.updateTimer)
    this.EXT.GPhotos.updateTimer = null
  }

  /** Prepare TimeOut Bar **/
  prepareBar () {
    if (this.config.screen.displayStyle == "Bar") return
    this.bar = new ProgressBar[this.config.screen.displayStyle](document.getElementById('EXT_SCREEN_BAR'), {
      strokeWidth: this.config.screen.displayStyle == "Line" ? 2 : 5,
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
          top: this.config.screen.displayStyle == "Line" ? "0" : "50%",
          padding: 0,
          margin: 0,
          transform: {
              prefix: true,
              value: 'translate(-50%, -50%)'
          }
        }
      }
    })
  }



  /** MagicMirror Show / hide rules (with body anmiation) **/
  screenShowing () {
    if (this.config.screen.animateBody && this.init) {
      clearTimeout(this.awaitBeforeTurnOnTimer)
      this.awaitBeforeTurnOnTimer= null
      // don't execute rules ... to much time for wakeup screen ...
      //await this.awaitBeforeWakeUp(this.config.screen.animateTime)
    }
    MM.getModules().enumerate((module)=> {
      module.show(500, {lockString: "EXT_SCREEN"})
    })
    if (!this.init) return this.init = true
    if (this.config.screen.animateBody) {
      document.body.classList.remove("animate__zoomOut")
      document.body.classList.add("animate__zoomIn")
    }
  }

  screenHiding () {
    if (this.config.screen.animateBody) {
      clearTimeout(this.awaitBeforeTurnOnTimer)
      this.awaitBeforeTurnOnTimer= null
      document.body.classList.remove("animate__zoomIn")
      document.body.classList.add("animate__zoomOut")
      document.body.addEventListener('animationend', (e) => {
        if (e.animationName == "zoomOut" && e.path[0].id == "EXT_SCREEN_ANIMATE") {
          MM.getModules().enumerate((module)=> {
            module.hide(1000, {lockString: "EXT_SCREEN"})
          })
        }
      }, {once: false})
    } else {
      MM.getModules().enumerate((module)=> {
        module.hide(1000, {lockString: "EXT_SCREEN"})
      })
    }
  }

  /** Create Radio function and cb **/
  createRadio () {
    this.radio = new Audio()

    this.radio.addEventListener("ended", ()=> {
      logEXT("Radio ended")
      this.EXT.radioPlayer.play = false
      this.showRadio()
    })
    this.radio.addEventListener("pause", ()=> {
      logEXT("Radio paused")
      this.EXT.radioPlayer.play = false
      this.showRadio()
    })
    this.radio.addEventListener("abort", ()=> {
      logEXT("Radio aborted")
      this.EXT.radioPlayer.play = false
      this.showRadio()
    })
    this.radio.addEventListener("error", (err)=> {
      logEXT("Radio error: " + err)
      this.EXT.radioPlayer.play = false
      this.showRadio()
    })
    this.radio.addEventListener("loadstart", ()=> {
      logEXT("Radio started")
      this.EXT.radioPlayer.play = true
      this.radio.volume = 0.6
      this.showRadio()
    })
  }

  showRadio() {
    if (this.EXT.radioPlayer.img) {
      if (this.EXT.radioPlayer.play) {
        this.showDivWithAnimatedFlip("EXT_RADIO")
      } else {
        this.hideDivWithAnimatedFlip("EXT_RADIO")
      }
    }
    if (this.EXT.radioPlayer.play) {
      this.sendSocketNotification("SCREEN_WAKEUP")
      this.hideDivWithAnimatedFlip("EXT_SCREEN_CONTENER")
      this.sendSocketNotification("SCREEN_LOCK", true)
    } else {
      this.sendSocketNotification("SCREEN_LOCK", false)
      this.showDivWithAnimatedFlip("EXT_SCREEN_CONTENER")
    }
  }


  /** Hide EXT with Flip animation **/
  hideDivWithAnimatedFlip (div) {
    var module = document.getElementById(div)
    module.classList.remove("animate__flipInX")
    module.classList.add("animate__flipOutX")
    module.addEventListener('animationend', (e) => {
      if (e.animationName == "flipOutX" && e.path[0].id == div) {
        module.classList.add("hidden")
      }
      e.stopPropagation()
    }, {once: true})
  }

  showDivWithAnimatedFlip (div) {
    var module = document.getElementById(div)
    module.classList.remove("hidden")
    module.classList.remove("animate__flipOutX")
    module.classList.add("animate__flipInX")
  }

  /** need to sleep ? **/
  awaitBeforeWakeUp(ms=3000) {
    return new Promise((resolve) => {
      this.awaitBeforeTurnOnTimer = setTimeout(resolve, ms)
    })
  }
}
