/* Spotify library rev: 210526 */

class Music {
  constructor (Config, callbacks, debug) {
    this.config = Config
    this.debug = debug
    this.MusicStatus = callbacks.MusicStatus
    this.currentPlayback = null
    this.connected = false
    this.timer = null
    console.log("[GA:EXT] Music Player Loaded")
  }

  /** Create a default display **/
  prepare() {
    var viewDom = document.createElement("div")
    viewDom.id = "EXT_MUSIC"
    viewDom.className= "inactive animate__animated"
    viewDom.style.setProperty('--animate-duration', '1s')

    viewDom.appendChild(this.getHTMLElementWithID('div', "EXT_MUSIC_BACKGROUND"))

    const cover_img = this.getHTMLElementWithID('img', "EXT_MUSIC_COVER_IMAGE")
    cover_img.className = 'fade-in'

    const cover = this.getHTMLElementWithID('div', "EXT_MUSIC_COVER")
    cover.appendChild(cover_img)

    const misc = this.getHTMLElementWithID('div', "EXT_MUSIC_MISC")
    misc.appendChild(this.getInfoContainer())
    misc.appendChild(this.getVolumeContainer())
    misc.appendChild(this.getProgressContainer())
    misc.appendChild(this.getMusicLogoContainer())

    const fore = this.getHTMLElementWithID('div', "EXT_MUSIC_FOREGROUND")
    fore.appendChild(cover)
    fore.appendChild(misc)

    viewDom.appendChild(fore)
    return viewDom
  }

  getHTMLElementWithID(type, id) {
    const divElement = document.createElement(type)
    divElement.id = id
    return divElement
  }

  getInfoContainer() {
    const info = this.getHTMLElementWithID('div', "EXT_MUSIC_INFO")
    const infoElementsWithIcon = {
      "EXT_MUSIC_TITLE": 'Title',
      "EXT_MUSIC_ARTIST": 'Artist',
      "EXT_MUSIC_ALBUM": 'OUT'
    }

    for (const [key, iconType] of Object.entries(infoElementsWithIcon)) {
      const element = this.getHTMLElementWithID('div', key)
      element.appendChild(this.getIconContainer(this.getFAIconClass(iconType)))
      element.appendChild(this.getEmptyTextHTMLElement())
      info.appendChild(element)
    }

    info.appendChild(this.getDeviceContainer())
    return info
  }

  getIconContainer(className, id, icon) {
    const iconContainer = document.createElement("i")
    iconContainer.className = className
    iconContainer.dataset.inline = "false"
    iconContainer.id = id
    iconContainer.dataset.icon = icon

    return iconContainer
  }

  getFAIcon(iconType) {
    switch (iconType) {
      case 'MUSICPLAYER':
        return 'fas fa-file-audio'
      case 'USB':
        return 'fa fa-usb'
      case 'OUT':
        return 'fas fa-sign-out-alt'
      case 'Spotify':
        return 'fab fa-spotify fa-sm'
      case 'Title':
        return 'fa fa-music fa-sm'
      case 'Artist':
        return 'fa fa-user fa-sm'
      case 'Album':
        return 'fa fa-folder fa-sm'
      // Volume Icons
      case 'VOL_HIGH':
        return 'mdi mdi-volume-high'
      case 'VOL_MID':
        return 'mdi mdi-volume-medium'
      case 'VOL_LOW':
        return 'mdi mdi-volume-low'
      case 'VOL_OFF':
        return 'mdi mdi-volume-off'
      // Device Icons
      case 'Tablet':
        return 'fas fa-tablet fa-sm'
      case 'GameConsole':
        return 'fas fa-gamepad fa-sm'
      case 'AVR':
      case 'STB':
        return 'mdi mdi-audio-video'
      case 'AudioDongle':
      case 'CastVideo':
        return 'mdi mdi-cast-connected'
      case 'CastAudio':
      case 'Speaker':
        return 'mdi mdi-cast-audio'
      case 'Automobile':
        return 'fas fa-car fa-sm'
      case 'Smartphone':
        return 'fas fa-mobile fa-sm'
      case 'TV':
        return 'fas fa-tv fa-sm'
      case 'Unknown':
      case 'Computer':
        return 'fa fa-desktop fa-sm'
      default:
        return 'fa fa-headphones fa-sm'
    }
  }

  getFAIconClass(iconType) {
    return 'infoicon ' + this.getFAIcon(iconType)
  }

  getEmptyTextHTMLElement() {
    const text = document.createElement("span")
    text.className = "text"
    text.textContent = ""

    return text
  }

  getDeviceContainer() {
    const device = this.getHTMLElementWithID('div', "EXT_MUSIC_DEVICE")
    device.appendChild(
      this.getIconContainer(this.getFAIconClass('USB'), "EXT_MUSIC_DEVICE_ICON"),
    )
    device.appendChild(this.getEmptyTextHTMLElement())

    return device
  }

  getVolumeContainer() {
    const volume = this.getHTMLElementWithID('div', "EXT_MUSIC_VOLUME")
    volume.appendChild(
      this.getIconContainer(this.getFAIconClass('VOL_OFF'), "EXT_MUSIC_VOLUME_ICON"),
    )
    volume.appendChild(this.getEmptyTextHTMLElement())

    return volume
  }

  getProgressContainer() {
    const progress = this.getHTMLElementWithID('div', "EXT_MUSIC_PROGRESS")

    const bar = this.getHTMLElementWithID('progress', "EXT_MUSIC_PROGRESS_BAR")
    bar.value = 0
    bar.max = 100

    progress.appendChild(bar)
    return progress
  }

  getMusicLogoContainer() {
    const logo = this.getHTMLElementWithID('div', "EXT_MUSIC_LOGO")
    logo.appendChild(
      this.getIconContainer(this.getFAIconClass('MUSICPLAYER'), "EXT_MUSIC_LOGO_ICON"),
    )
    const text = document.createElement("span")
    text.className = "text"
    text.textContent = " Music Player" //this.config.SpotifyForGA
    logo.appendChild(text)

    return logo
  }

  updateSongInfo(playbackItem) {
    /*
     this.MusicPlayerStatus = {
      connected: false,
      current: 0,
      duration: 0,
      file: null,
      title: "",
      artist: "",
      volume: 0,
      seed: 0,
      cover: null
    }
    */
    if (!playbackItem) return

    const sDom = document.getElementById("EXT_MUSIC")
    if (playbackItem.connected) sDom.classList.remove("inactive")
    else return sDom.classList.add("inactive")

    const cover_img = document.getElementById("EXT_MUSIC_COVER_IMAGE")
    var img_url = "/modules/MMM-GoogleAssistant/tmp/Music/" + playbackItem.cover +"?seed="+ playbackItem.seed

    if (cover_img.src.indexOf(img_url) == -1) {
      const back = document.getElementById("EXT_MUSIC_BACKGROUND")
      back.classList.remove('fade-in')
      let backOffSet = cover_img.offsetWidth
      back.classList.add('fade-in')
      back.style.backgroundImage = `url(${img_url})`

      cover_img.classList.remove('fade-in')
      let offset = cover_img.offsetWidth
      cover_img.classList.add('fade-in')
      cover_img.src = img_url
    }

    const title = document.querySelector("#EXT_MUSIC_TITLE .text")
    title.textContent = playbackItem.title

    
    const album = document.querySelector("#EXT_MUSIC_ALBUM .text")
    album.textContent = playbackItem.date
    

    const artist = document.querySelector("#EXT_MUSIC_ARTIST .text")
    //const artists = playbackItem.artists
    let artistName = playbackItem.artist
    //if (playbackItem.album){
    //  for (let x = 0; x < artists.length; x++) {
    //    if (!artistName) {
    //      artistName = artists[x].name
    //    } else {
    //      artistName += ", " + artists[x].name
    //    }
    //  }
    //} else{
      //artistName = playbackItem.show.publisher
    //}
    artist.textContent = artistName
    const USB = document.querySelector("#EXT_MUSIC_DEVICE .text")
    USB.textContent = "Test From Local File" //"My USB Key Name"
    this.updateVolume(playbackItem.volume)
    this.updateProgress(playbackItem.current,playbackItem.duration)
  }

  updateVolume(volume_percent) {
    const volumeContainer = document.querySelector("#EXT_MUSIC_VOLUME .text")
    const volumeIcon = document.getElementById("EXT_MUSIC_VOLUME_ICON")

    volumeContainer.textContent = volume_percent + "%"
    volumeIcon.className = this.getVolumeIconClass(volume_percent)
  }

  getVolumeIconClass(volume_percent) {
    let iconClass = 'VOL_OFF'
    if (volume_percent === 0) {
      return this.getFAIconClass(iconClass)
    }

    if (volume_percent < 40) iconClass = 'VOL_LOW'
    else iconClass = volume_percent > 70 ? 'VOL_HIGH' : 'VOL_MID'
    return this.getFAIconClass(iconClass)
  }

  updateProgress(progressMS, durationMS) {
    const bar = document.getElementById("EXT_MUSIC_PROGRESS_BAR")
    bar.value = progressMS

    if (bar.max != durationMS) bar.max = durationMS
  }
/*
  updatePlayback(status) { // hide show rules with animation !
    var dom = document.getElementById("EXT_MUSIC")
    clearTimeout(this.timer)
    this.timer = null
    if (this.connected && !status) {
      if (this.debug) console.log("[MUSIC] Disconnected")
      this.connected = false
      this.spotifyStatus(false)

      if (this.config.useBottomBar) {
        dom.classList.remove("bottomIn")
        dom.classList.add("bottomOut")
        this.timer = setTimeout(() => {
          dom.classList.add("inactive")
          module.style.display = "none"
        }, 500)
      } else {
        dom.classList.remove("animate__flipInX")
        dom.classList.add("animate__flipOutX")
        dom.addEventListener('animationend', (e) => {
          if (e.animationName == "flipOutX" && e.path[0].id == "EXT_SPOTIFY") {
            dom.classList.add("inactive")
          }
          e.stopPropagation()
        }, {once: true})
      }
    }
    if (!this.connected && status) {
      if (this.debug) console.log("[MUSIC] Connected")
      this.connected = true
      this.spotifyStatus(true)

      dom.classList.remove("inactive")
      if (this.config.useBottomBar) {
        module.style.display = "block"
        dom.classList.remove("bottomOut")
        dom.classList.add("bottomIn")
      } else {
        dom.classList.remove("animate__flipOutX")
        dom.classList.add("animate__flipInX")
      }
    }
  }

  updateCurrentSpotify(current) {
    if (!current) return
    if (!this.currentPlayback) {
      this.updateSongInfo(current.item)
      this.updatePlaying(current.is_playing)
      this.updateDevice(current.device)
      this.updatePlayback(current.is_playing)
      if (current.device) this.updateVolume(current.device.volume_percent)
      if (current.is_playing && current.item) this.updateProgress(current.progress_ms, current.item.duration_ms)
    } else {
      if (!this.connected && current.is_playing) {
        this.updatePlayback(true)
      }

      if (current.currently_playing_type == "ad") {
        this.ads = true
        current.is_playing = false
      }
      if (this.currentPlayback.is_playing !== current.is_playing) {
        this.updatePlaying(current.is_playing)
      }
      if (current.currently_playing_type == "ad") {
        this.currentPlayback.is_playing = false
        return
      }
      if (this.ads) {
        this.currentPlayback = null
        this.ads = false
        return
      }

      if (!current.item || !current.device || !current.progress_ms || !current.item.duration_ms) return this.currentPlayback = null

      if (this.currentPlayback.item.id !== current.item.id) {
          this.updateSongInfo(current.item)
      }
      if (this.currentPlayback.device.id !== current.device.id) {
          this.updateDevice(current.device)
      }
      if (this.currentPlayback.device.volume_percent !== current.device.volume_percent) {
          this.updateVolume(current.device.volume_percent)
      }
      if (this.currentPlayback.progress_ms !== current.progress_ms) {
          this.updateProgress(current.progress_ms, current.item.duration_ms)
      }
    }
    this.currentPlayback = current
  }

  msToTime(duration) {
    let ret = ""
    let seconds = parseInt((duration / 1000) % 60)
      , minutes = parseInt((duration / (1000 * 60)) % 60)
      , hours = parseInt((duration / (1000 * 60 * 60)) % 24)
    if (hours > 0) {
      hours = (hours < 10) ? "0" + hours : hours
      ret = ret + hours + ":"
    }
    minutes = (minutes < 10) ? "0" + minutes : minutes
    seconds = (seconds < 10) ? "0" + seconds : seconds
    return ret + minutes + ":" + seconds
  }

  updateDevice(device) {
    const deviceContainer = document.querySelector("#EXT_MUSIC_DEVICE .text")
    const deviceIcon = document.getElementById("EXT_MUSIC_DEVICE_ICON")

    deviceContainer.textContent = this.config.deviceDisplay + ' ' + device.name
    deviceIcon.className = this.getFAIconClass(device.type)
  }

  updatePlaying(isPlaying) {
    const s = document.getElementById("EXT_MUSIC")

    if (isPlaying) {
      s.classList.add("playing")
      s.classList.remove("pausing")
    } else {
      s.classList.add("pausing")
      s.classList.remove("playing")
    }

    if (this.config.control !== "hidden" && this.config.useBottomBar) {
      const p = document.getElementById("EXT_MUSIC_CONTROL_PLAY")
      p.className = isPlaying ? "playing" : "pausing"
      const icon = isPlaying ? "mdi:play-circle-outline" : "mdi:pause-circle-outline"
      p.innerHTML = ""
      p.appendChild(this.getIconContainer('iconify', "EXT_MUSIC_CONTROL_PLAY_ICON", icon)
      )
    }
  }

  getCoverContainer() {
    const cover_img = this.getHTMLElementWithID('img', "EXT_MUSIC_COVER_IMAGE")
    cover_img.className = 'fade-in'

    const cover = this.getHTMLElementWithID('div', "EXT_MUSIC_COVER")
    cover.appendChild(cover_img)
    return cover
  }

  getConnected() {
    return this.connected
  }
  */
}

