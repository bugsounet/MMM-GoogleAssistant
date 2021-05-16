/* Spotify library */

class Spotify {
  constructor (Config, callbacks, debug) {
    this.config = Config
    this.debug = debug
    this.spotifyStatus = callbacks.spotifyStatus
    this.currentPlayback = null
    this.connected = false
    this.timer = null
    this.ads = false
    console.log("[GA:A2D] Spotify Loaded")
  }

  /** Create a fake module in bottom_bar **/
  prepare() {
    var nodes = document.getElementsByClassName("region bottom bar")
    var pos = nodes[0].querySelector(".container")
    var children = pos.children
    var module = document.createElement("div")
    module.id = "module_A2D_Spotify"
    module.style.display= "none"
    module.classList.add("module", "A2D_Spotify")
    var header = document.createElement("header")
    header.classList.add("module-header")
    header.style.display = "none"
    module.appendChild(header)
    var content = document.createElement("div")
    content.classList.add("module-content")
    var viewDom = document.createElement("div")
    viewDom.id = "A2D_SPOTIFY"
    viewDom.classList.add("inactive")

    content.appendChild(viewDom)
    module.appendChild(content)
    pos.insertBefore(module, children[children.length])
    this.getMinimalistBarDom(viewDom)
  }

  /** Create a default display **/
  prepareMini() {
    var viewDom = document.createElement("div")
    viewDom.id = "A2D_SPOTIFY"
    viewDom.classList.add("inactive")
    viewDom.classList.add("mini")

    viewDom.appendChild(this.getHTMLElementWithID('div', "A2D_SPOTIFY_BACKGROUND"))

    const cover_img = this.getHTMLElementWithID('img', "A2D_SPOTIFY_COVER_IMAGE")
    cover_img.className = 'fade-in'

    const cover = this.getHTMLElementWithID('div', "A2D_SPOTIFY_COVER")
    cover.appendChild(cover_img)

    const misc = this.getHTMLElementWithID('div', "A2D_SPOTIFY_MISC")
    misc.appendChild(this.getInfoContainer())
    misc.appendChild(this.getVolumeContainer())
    misc.appendChild(this.getProgressContainer())
    misc.appendChild(this.getSpotifyLogoContainer())

    const fore = this.getHTMLElementWithID('div', "A2D_SPOTIFY_FOREGROUND")
    fore.appendChild(cover)
    fore.appendChild(misc)

    viewDom.appendChild(fore)
    return viewDom
  }

  updatePlayback(status) {
    var dom = document.getElementById("A2D_SPOTIFY")
    var module = document.getElementById("module_A2D_Spotify")
    this.timer = null
    clearTimeout(this.timer)
    if (status) {
      if (this.config.useBottomBar) {
        module.style.display = "block"
        dom.classList.remove("bottomOut")
        dom.classList.add("bottomIn")
      }
      dom.classList.remove("inactive")
    }
    else {
      if (this.config.useBottomBar) {
        dom.classList.remove("bottomIn")
        dom.classList.add("bottomOut")
        this.timer = setTimeout(() => {
          dom.classList.add("inactive")
          module.style.display = "none"
        }, 500)
      } else {
        dom.classList.add("inactive")
      }
    }

    if (this.connected && !status) {
      this.connected = false
      this.spotifyStatus(false)
      if (this.debug) console.log("[SPOTIFY] Disconnected")
    }
    if (!this.connected && status) {
      this.connected = true
      this.spotifyStatus(true)
      if (this.debug) console.log("[SPOTIFY] Connected")
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
      /** for Ads **/
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
      /** prevent all error -> reset currentPlayback **/
      if (!current.item || !current.device || !current.progress_ms || !current.item.duration_ms) return this.currentPlayback = null

      /** All is good so ... live update **/
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

  updateProgress(progressMS, durationMS) {
    const bar = document.getElementById("A2D_SPOTIFY_PROGRESS_BAR")
    bar.value = progressMS

    if (bar.max != durationMS) bar.max = durationMS

    if (this.config.useBottomBar) {
      const current = document.getElementById("A2D_SPOTIFY_PROGRESS_COMBINED")
      current.innerText = this.msToTime(progressMS) + ' / ' + this.msToTime(durationMS)
    }
  }

  updateDevice(device) {
    const deviceContainer = document.querySelector("#A2D_SPOTIFY_DEVICE .text")
    const deviceIcon = document.getElementById("A2D_SPOTIFY_DEVICE_ICON")

    deviceContainer.textContent = this.config.deviceDisplay + ' ' + device.name
    deviceIcon.className = this.getFAIconClass(device.type)
  }

  updateVolume(volume_percent) {
    const volumeContainer = document.querySelector("#A2D_SPOTIFY_VOLUME .text")
    const volumeIcon = document.getElementById("A2D_SPOTIFY_VOLUME_ICON")

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


  updatePlaying(isPlaying) {
    const s = document.getElementById("A2D_SPOTIFY")

    if (isPlaying) {
      s.classList.add("playing")
      s.classList.remove("pausing")
    } else {
      s.classList.add("pausing")
      s.classList.remove("playing")
    }

    if (this.config.control !== "hidden" && this.config.useBottomBar) {
      const p = document.getElementById("A2D_SPOTIFY_CONTROL_PLAY")
      p.className = isPlaying ? "playing" : "pausing"
      const icon = isPlaying ? "mdi:play-circle-outline" : "mdi:pause-circle-outline"
      p.innerHTML = ""
      p.appendChild(this.getIconContainer('iconify', "A2D_SPOTIFY_CONTROL_PLAY_ICON", icon)
      )
    }
  }

  updateSongInfo(playbackItem) {
    if (!playbackItem) return

    const sDom = document.getElementById("A2D_SPOTIFY")

    const cover_img = document.getElementById("A2D_SPOTIFY_COVER_IMAGE")
    let img_index = this.config.useBottomBar ? 2 : 1  

    var img_url
    var display_name
    if (playbackItem.album){
      img_url = playbackItem.album.images[img_index].url
      display_name = playbackItem.album.name
    }
    else{
      img_url = playbackItem.images[img_index].url
      display_name = playbackItem.show.name
    }

    if (img_url !== cover_img.src) {
      if (!this.config.useBottomBar) {
        const back = document.getElementById("A2D_SPOTIFY_BACKGROUND")
        back.classList.remove('fade-in')
        let backOffSet = cover_img.offsetWidth
        back.classList.add('fade-in')
        back.style.backgroundImage = `url(${img_url})`
      }
      cover_img.classList.remove('fade-in')
      let offset = cover_img.offsetWidth
      cover_img.classList.add('fade-in')
      cover_img.src = img_url
    }

    const title = document.querySelector("#A2D_SPOTIFY_TITLE .text")
    title.textContent = playbackItem.name

    if (!this.config.useBottomBar) {
      const album = document.querySelector("#A2D_SPOTIFY_ALBUM .text")
      album.textContent = display_name
    }

    const artist = document.querySelector("#A2D_SPOTIFY_ARTIST .text")
    const artists = playbackItem.artists
    let artistName = ""
    if (playbackItem.album){
      for (let x = 0; x < artists.length; x++) {
        if (!artistName) {
          artistName = artists[x].name
        } else {
          artistName += ", " + artists[x].name
        }
      }
    } else{
      artistName = playbackItem.show.publisher
    }
    artist.textContent = artistName
  }

  getFAIcon(iconType) {
    switch (iconType) {
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

  getIconContainer(className, id, icon) {
    const iconContainer = document.createElement("i")
    iconContainer.className = className
    iconContainer.dataset.inline = "false"
    iconContainer.id = id
    iconContainer.dataset.icon = icon

    return iconContainer
  }

  getHTMLElementWithID(type, id) {
    const divElement = document.createElement(type)
    divElement.id = id
    return divElement
  }

  getEmptyTextHTMLElement() {
    const text = document.createElement("span")
    text.className = "text"
    text.textContent = ""

    return text
  }

  getDeviceContainer() {
    const device = this.getHTMLElementWithID('div', "A2D_SPOTIFY_DEVICE")
    device.appendChild(
      this.getIconContainer(this.getFAIconClass('default'), "A2D_SPOTIFY_DEVICE_ICON"),
    )
    device.appendChild(this.getEmptyTextHTMLElement())

    return device
  }

  getVolumeContainer() {
    const volume = this.getHTMLElementWithID('div', "A2D_SPOTIFY_VOLUME")
    volume.appendChild(
      this.getIconContainer(this.getFAIconClass('VOL_OFF'), "A2D_SPOTIFY_VOLUME_ICON"),
    )
    volume.appendChild(this.getEmptyTextHTMLElement())

    return volume
  }

  getSpotifyLogoContainer() {
    const logo = this.getHTMLElementWithID('div', "A2D_SPOTIFY_LOGO")
    logo.appendChild(
      this.getIconContainer(this.getFAIconClass('Spotify'), "A2D_SPOTIFY_LOGO_ICON"),
    )
    const text = document.createElement("span")
    text.className = "text"
    text.textContent = "Spotify for Google Assistant"
    logo.appendChild(text)

    return logo
  }

  getControlButton(id, icon) {
    const button = this.getHTMLElementWithID('div', id)
    button.className = "off"
    button.appendChild(this.getIconContainer('iconify', id + "_ICON", icon))

    return button
  }

  getInfoContainer() {
    const info = this.getHTMLElementWithID('div', "A2D_SPOTIFY_INFO")
    const infoElementsWithIcon = {
      "A2D_SPOTIFY_TITLE": 'Title',
      "A2D_SPOTIFY_ALBUM": 'Album',
      "A2D_SPOTIFY_ARTIST": 'Artist'
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

  getProgressContainer() {
    const progress = this.getHTMLElementWithID('div', "A2D_SPOTIFY_PROGRESS")

    const bar = this.getHTMLElementWithID('progress', "A2D_SPOTIFY_PROGRESS_BAR")
    bar.value = 0
    bar.max = 100

    progress.appendChild(bar)
    return progress
  }

  getCoverContainer() {
    const cover_img = this.getHTMLElementWithID('img', "A2D_SPOTIFY_COVER_IMAGE")
    cover_img.className = 'fade-in'

    const cover = this.getHTMLElementWithID('div', "A2D_SPOTIFY_COVER")
    cover.appendChild(cover_img)
    return cover
  }

  getMinimalistBarDom(container) {
    container.appendChild(this.getProgressContainer())

    const misc = this.getHTMLElementWithID('div', "A2D_SPOTIFY_MISC")
    misc.appendChild(this.getDeviceContainer())

    const info = this.getHTMLElementWithID('div', "A2D_SPOTIFY_INFO")

    const infoElements = [
      "A2D_SPOTIFY_TITLE",
      "A2D_SPOTIFY_ARTIST"
    ]

    infoElements.forEach((key, index) => {
      if (index > 0) {
        const bulletElement = this.getHTMLElementWithID("span", "TEXT_BULLET")
        bulletElement.innerHTML = "&#8226;"
        info.appendChild(bulletElement)
      }
      const element = this.getHTMLElementWithID('div', key)
      element.appendChild(this.getEmptyTextHTMLElement())
      info.appendChild(element)
    })

    misc.appendChild(info)

    const infoFooter = this.getHTMLElementWithID('div', "A2D_SPOTIFY_INFO_FOOTER")
    infoFooter.appendChild(this.getVolumeContainer())

    infoFooter.appendChild(this.getSpotifyLogoContainer())

    const totalTime = this.getHTMLElementWithID('div', "A2D_SPOTIFY_PROGRESS_COMBINED")
    totalTime.className = 'text'
    totalTime.innerText = "--:-- / --:--"

    infoFooter.appendChild(totalTime)

    misc.appendChild(infoFooter)

    const foreground = this.getHTMLElementWithID('div', "A2D_SPOTIFY_FOREGROUND")
    foreground.appendChild(this.getCoverContainer())
    foreground.appendChild(misc)

    foreground.appendChild(
      this.getControlButton(
        "A2D_SPOTIFY_CONTROL_PLAY",
        'mdi:play-circle-outline'
      ),
    )
    container.appendChild(foreground)
    return container
  }

  getConnected() {
    return this.connected
  }
}
