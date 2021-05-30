/* EXT Class for displaying */



class Extented {
  constructor (Config, callbacks) {
    this.config = Config
    this.sendSocketNotification = callbacks.sendSocketNotification
    this.Informations = callbacks.Informations
    this.radioStop = callbacks.radioStop
    this.YTError = callbacks.YTError
    this.timer = null
    this.player = null
    this.bar = null
    this.radio = null
    this.createRadio()
    this.EXT = {
      GPhotos: {
        updateTimer: null,
        albums: null,
        scanned: [],
        index: 0,
        needMorePicsFlag: true
      },
      radioPlayer: {
        play: false,
        img: null,
        link: null,
      },
      radio: false,
      speak: false,
      locked: false,
      youtube: {
        displayed: false,
        id: null,
        type: null,
        title: null
      },
      photos: {
        displayed: false,
        position: 0,
        urls: null,
        length: 0
      },
      links: {
        displayed: false,
        urls: null,
        length: 0,
        running: false
      },
      spotify: {
        connected: false,
        player: false,
        currentVolume: 0,
        targetVolume: this.config.spotify.maxVolume,
        repeat: null,
        shuffle: null,
        forceVolume: false
      }
    }
    console.log("[GA:EXT] ExtentedClass Loaded")
  }

  start(response) {
    /** Close all active windows and reset it **/
    if (this.EXT.youtube.displayed) {
      if (this.config.youtube.useVLC) {
        this.sendSocketNotification("YT_STOP")
        this.EXT.youtube.displayed = false
        this.showYT()
        this.EXTUnlock()
        this.resetYT()
      }
      else this.player.command("stopVideo")
    }
    if (this.EXT.photos.displayed) {
      this.resetPhotos()
      this.hideDisplay()
    }
    if (this.EXT.links.displayed) {
      this.resetLinks()
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
      },
      links: {
        urls: response.urls,
        length: response.urls.length
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
    else if (this.EXT.links.length > 0) {
      this.urlsScan()
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

/** urls scan : dispatch links, youtube, spotify **/
  urlsScan() {
    let tmp = {}
    if (this.config.youtube.useYoutube) {
      var YouTubeRealLink= this.EXT.links.urls[0]
      /** YouTube RegExp **/
      var YouTubeLink = new RegExp("youtube\.com\/([a-z]+)\\?([a-z]+)\=([0-9a-zA-Z\-\_]+)", "ig")
      /** Scan Youtube Link **/
      var YouTube = YouTubeLink.exec(YouTubeRealLink)

      if (YouTube) {
        let Type
        let YouTubeResponse = {}
        if (this.EXT.radioPlayer.play) this.radioStop()
        if (this.EXT.spotify.player && this.config.spotify.useSpotify) {
          this.sendSocketNotification("SPOTIFY_PAUSE")
        }
        if (YouTube[1] == "watch") Type = "id"
        if (YouTube[1] == "playlist") Type = "playlist"
        if (!Type) return console.log("[GA:EXT:YouTube] Unknow Type !" , YouTube)
        YouTubeResponse = {
          "id": YouTube[3],
          "type": Type
        }
        this.EXT.youtube = this.objAssign({}, this.EXT.youtube, YouTubeResponse)
        this.EXTLock()
        if (!this.config.youtube.useVLC) this.player.load({id: this.EXT.youtube.id, type : this.EXT.youtube.type})
        else {
          this.EXT.youtube.displayed = true
          this.showYT()
          this.sendSocketNotification("VLC_YOUTUBE", YouTubeRealLink)
        }
        return
      }
    }
    if (this.config.spotify.useSpotify) {
      /** Spotify RegExp **/
      var SpotifyLink = new RegExp("open\.spotify\.com\/([a-z]+)\/([0-9a-zA-Z\-\_]+)", "ig")
      /** Scan Spotify Link **/
      var Spotify = SpotifyLink.exec(this.EXT.links.urls[0])

      if (Spotify) {
        if (this.EXT.radioPlayer.play) this.radioStop()
        if (!this.EXT.spotify.connected && this.config.spotify.deviceName) {
          this.sendSocketNotification("SPOTIFY_TRANSFER", this.config.spotify.deviceName)
        }

        setTimeout(() => {
          let type = Spotify[1]
          let id = Spotify[2]
          if (type == "track") {
            // don't know why tracks works only with uris !?
            this.sendSocketNotification("SPOTIFY_PLAY", {"uris": ["spotify:track:" + id ]})
          }
          else {
            this.sendSocketNotification("SPOTIFY_PLAY", {"context_uri": "spotify:"+ type + ":" + id})
          }
        }, this.config.spotify.playDelay)
        return
      }
    }
    if (this.config.links.useLinks) {
      this.EXTLock()
      this.EXT.links.displayed = true
      this.linksDisplay()
    }
  }

/** link display **/
  linksDisplay() {
    this.EXT.links.running = false
    var webView = document.getElementById("EXT_OUTPUT")
    this.Informations({message: "LinksOpen" })
    logEXT("Loading", this.EXT.links.urls[0])
    this.showDisplay()
    webView.src= this.EXT.links.urls[0]

    webView.addEventListener("did-fail-load", () => {
      console.log("[GA:EXT:LINKS] Loading error")
    })
    webView.addEventListener("crashed", (event) => {
      console.log("[GA:EXT:LINKS] J'ai tout pété mon général !!!")
      console.log("[GA:EXT:LINKS]", event)
    })
    webView.addEventListener("console-message", (event) => {
      if (event.level == 1 && this.config.debug) console.log("[GA:EXT:LINKS]", event.message)
    })
    webView.addEventListener("did-stop-loading", () => {
      if (this.EXT.links.running || (webView.getURL() == "about:blank")) return
      this.EXT.links.running = true
      logEXT("URL Loaded", webView.getURL())
      webView.executeJavaScript(`
      var timer = null
      function scrollDown(posY){
        clearTimeout(timer)
        timer = null
        var scrollHeight = document.body.scrollHeight
        if (posY == 0) console.log("Begin Scrolling")
        if (posY > scrollHeight) posY = scrollHeight
        document.documentElement.scrollTop = document.body.scrollTop = posY;
        if (posY == scrollHeight) return console.log("End Scrolling")
        timer = setTimeout(function(){
          if (posY < scrollHeight) {
            posY = posY + ${this.config.links.scrollStep}
            scrollDown(posY);
          }
        }, ${this.config.links.scrollInterval});
      };
      if (${this.config.links.scrollActivate}) {
        setTimeout(scrollDown(0), ${this.config.links.scrollStart});
      };`)
    })
    this.timerLinks = setTimeout(() => {
      this.Informations({message: "LinksClose" })
      this.resetLinks()
      this.hideDisplay()
    }, this.config.links.displayDelay)
  }

  resetLinks() {
    clearTimeout(this.timerLinks)
    this.timerLinks = null
    let tmp = {
      links: {
        displayed: false,
        urls: null,
        length: 0,
        running: false
      }
    }
    this.EXT = this.objAssign({}, this.EXT, tmp)
    var iframe = document.getElementById("EXT_OUTPUT")
    iframe.src= "about:blank"
    logEXT("Reset Links", this.EXT)
  }

/** youtube rules **/
  showYT() {
    var YT = document.getElementById("EXT_YOUTUBE")
    var winh = document.getElementById("EXT")
    if (this.EXT.youtube.displayed) {
      this.EXTLock() // for YT playlist
      winh.classList.remove("hidden")
      YT.classList.remove("hidden")
    } else {
      if (this.EXT.photos.displayed || this.EXT.links.displayed) {
        winh.classList.remove("hidden")
        YT.classList.add("hidden")
      } else {
        this.hideDisplay()
      }
    }
  }

  resetYT() {
    let tmp = {
      youtube: {
        displayed: false,
        id: null,
        type: null,
        title: null
      }
    }
    this.EXT = this.objAssign({}, this.EXT, tmp)
    logEXT("Reset YouTube", this.EXT)
  }

/** Cast **/
  castStart(url) {
    /** stop all process before starting cast **/
    if (this.EXT.youtube.displayed) {
      if (this.config.youtube.useVLC) {
        this.sendSocketNotification("YT_STOP")
        this.EXT.youtube.displayed = false
        this.showYT()
        this.resetYT()
      }
      else this.player.command("stopVideo")
    }
    if (this.EXT.spotify.connected && this.EXT.spotify.player) {
      this.sendSocketNotification("SPOTIFY_PAUSE")
    }
    if (this.EXT.photos.displayed) {
      this.resetPhotos()
      this.hideDisplay()
    }
    if (this.EXT.links.displayed) {
      this.resetLinks()
      this.hideDisplay()
    }
    if (this.EXT.radioPlayer.play) this.radioStop()

    /** emulation of displaying links **/
    this.EXT.links.running = false
    var webView = document.getElementById("EXT_OUTPUT")
    logEXT("Cast Loading", url)
    this.EXT.links.displayed = true
    this.EXT.links.running = true
    this.showDisplay()
    this.EXTLock()
    webView.src= url
  }

  castStop() {
    var webView = document.getElementById("EXT_OUTPUT")
    this.resetLinks()
    this.hideDisplay()
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

    if (this.config.photos.useBackground) this.prepareGPhotosBackground()
    else {
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

    var scout = document.createElement("webview")
    scout.useragent= "Mozilla/5.0 (SMART-TV; Linux; Tizen 2.4.0) AppleWebkit/538.1 (KHTML, like Gecko) SamsungBrowser/1.1 TV Safari/538.1"
    scout.id = "EXT_OUTPUT"
    scout.scrolling="no"
    scout.classList.add("hidden")

    var scoutyt = document.createElement("div")
    scoutyt.id = "EXT_YOUTUBE"
    scoutyt.classList.add("hidden")
    if (this.config.youtube.useYoutube && !this.config.youtube.useVLC)  {
      var api = document.createElement("script")
      api.src = "https://www.youtube.com/iframe_api"
      var writeScript = document.getElementsByTagName("script")[0]
      writeScript.parentNode.insertBefore(api, writeScript)
      window.onYouTubeIframeAPIReady = () => {
        this.player = new YOUTUBE(
          "EXT_YOUTUBE",
          (status) => {
            this.EXT.youtube.displayed = status
            this.showYT()
          },
          (title) => {
            this.EXT.youtube.title = title
          },
          (ended) => {
            this.EXTUnlock()
            this.resetYT()
          },
          (error) => {
            this.YTError(error)
          }
        )
        this.player.init()
      }
    }
    scoutpan.appendChild(scoutyt)
    scoutpan.appendChild(scout)
    dom.appendChild(scoutpan)

    newGA.appendChild(dom)
    this.prepareVolume(newGA)
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
    var YT = document.getElementById("EXT_YOUTUBE")
    var iframe = document.getElementById("EXT_OUTPUT")
    var photo = document.getElementById("EXT_PHOTO")
    var photoAPI = document.getElementById("EXT_GPHOTO")
    var winEXT = document.getElementById("EXT")
    winEXT.classList.remove("hidden")

    if (this.EXT.links.displayed) iframe.classList.remove("hidden")
    if (this.EXT.photos.displayed) {
      if (this.EXT.photos.length > 0) photo.classList.remove("hidden")
      photoAPI.classList.remove("hidden")
    }
    if (this.EXT.photos.forceClose) photo.classList.add("hidden")
    if (this.EXT.youtube.displayed) YT.classList.remove("hidden")
  }

  hideDisplay() {
    logEXT("Hide Iframe")
    var winEXT = document.getElementById("EXT")
    var iframe = document.getElementById("EXT_OUTPUT")
    var photo = document.getElementById("EXT_PHOTO")
    var photoAPI = document.getElementById("EXT_GPHOTO")
    var YT = document.getElementById("EXT_YOUTUBE")

    if (!this.EXT.youtube.displayed) YT.classList.add("hidden")
    if (!this.EXT.links.displayed) iframe.classList.add("hidden")
    if (!this.EXT.photos.displayed) {
      photo.classList.add("hidden")
      if (!this.config.photos.useBackground) photoAPI.classList.add("hidden")
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
    return (this.EXT.youtube.displayed || this.EXT.photos.displayed || this.EXT.links.displayed)
  }

  /** hacking body for animated **/
  prepareBody() {
    document.body.id = "EXT_SCREEN_ANIMATE"
    document.body.className= "animate__animated"
    document.body.style.setProperty('--animate-duration', '0.5s')
  }

  /** Volume display **/
  prepareVolume (newGA) {
    var volume = document.createElement("div")
    volume.id = "EXT_VOLUME"
    volume.classList.add("hidden")
    volume.className= "hidden animate__animated"
    volume.style.setProperty('--animate-duration', '1s')
    var volumeText = document.createElement("div")
    volumeText.id = "EXT_VOLUME_TEXT"
    volume.appendChild(volumeText)
    var volumeBar = document.createElement("div")
    volumeBar.id = "EXT_VOLUME_BAR"
    volume.appendChild(volumeBar)
    newGA.appendChild(volume)
    return volume
  }

  drawVolume (current) {
    var volume = document.getElementById("EXT_VOLUME")
    volume.classList.remove("hidden", "animate__zoomOut")
    volume.classList.add("animate__zoomIn")
    var volumeText = document.getElementById("EXT_VOLUME_TEXT")
    volumeText.innerHTML = this.config.volume.volumeText + " " + current + "%"
    var volumeBar = document.getElementById("EXT_VOLUME_BAR")
    volumeBar.style.width = current + "%"
    setTimeout(()=>{
      volume.classList.remove("animate__zoomIn")
      volume.classList.add("animate__zoomOut")
      volume.addEventListener('animationend', (e) => {
        if (e.animationName == "flipOutX" && e.path[0].id == "EXT_VOLUME") {
          volume.classList.add("hidden")
        }
        e.stopPropagation()
      }, {once: true})
    }, 3000)
  }

  /** GPhotos API **/
  updatePhotos () {
    if (this.EXT.GPhotos.scanned.length == 0) {
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
      if (!this.config.photos.useBackground) this.hideGooglePhotoAPI()
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
      albumCover.style.backgroundImage = `url(modules/MMM-GoogleAssistant/tmp/cache/${album.id})`
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
      logEXT("GPHOTOS: Image loaded:", url)
      this.sendSocketNotification("GP_LOADED", url)
    }
    hidden.src = url
  }

  showGooglePhotoAPI () {
    this.Informations({message: "GPOpen" })
    this.EXTLock()
    this.EXT.photos.displayed = true
    this.showDisplay()
    this.updatePhotos()

    this.EXT.GPhotos.updateTimer = setInterval(()=>{
      this.updatePhotos()
    }, this.config.photos.displayDelay)
  }

  hideGooglePhotoAPI () {
    this.stopGooglePhotoAPI()
    this.EXTUnlock()
    this.EXT.photos.displayed = false
    this.hideDisplay()
  }

  showBackgroundGooglePhotoAPI () {
    if (this.EXT.GPhotos.albums) this.Informations({message: "GPOpen" })
    this.updatePhotos()

    this.EXT.GPhotos.updateTimer = setInterval(()=>{
      this.updatePhotos()
    }, this.config.photos.displayDelay)
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
}
