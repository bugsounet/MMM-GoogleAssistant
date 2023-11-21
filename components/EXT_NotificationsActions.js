/******************************/
/** EXT_NotificationsActions **/
/******************************/

class EXT_NotificationsActions {
  constructor () {
    console.log("[GA] EXT_NotificationsActions Ready")
  }

  Actions(that,noti,payload,sender) {
    if (!that.EXT.GA_Ready) return console.log("[GA] [EXT_NotificationsActions] MMM-GoogleAssistant is not ready")
    switch(noti) {
      case "EXT_HELLO":
        that.EXT_OthersRules.helloEXT(that, payload)
        break
      case "EXT_PAGES-Gateway":
        if (sender.name == "EXT-Pages") Object.assign(that.EXT["EXT-Pages"], payload)
        break
      case "EXT_GATEWAY":
        this.gatewayEXT(that, payload)
        break
      case "EXT_GATEWAY-Restart":
        that.sendSocketNotification("RESTART")
        break
      case "EXT_GATEWAY-Close":
        that.sendSocketNotification("CLOSE")
        break
      case "EXT_SCREEN-POWER":
        if (!that.EXT["EXT-Screen"].hello) return console.log("[GA] [EXT_NotificationsActions] Warn Screen don't say to me HELLO!")
        that.EXT["EXT-Screen"].power = payload
        if (that.EXT["EXT-Pages"].hello) {
          if (that.EXT["EXT-Screen"].power) that.sendNotification("EXT_PAGES-RESUME")
          else that.sendNotification("EXT_PAGES-PAUSE")
        }
        break
      case "EXT_STOP":
        if (that.EXT["EXT-Alert"].hello && that.EXT_OthersRules.hasPluginConnected(that.EXT, "connected", true)) {
          that.sendNotification("EXT_ALERT", {
            type: "information",
            message: that.translate("EXTStop")
          })
        }
        break
      case "EXT_MUSIC-CONNECTED":
        if (!that.EXT["EXT-MusicPlayer"].hello) return console.log("[GA] [EXT_NotificationsActions] Warn MusicPlayer don't say to me HELLO!")
        that.EXT_OthersRules.connectEXT(that,"EXT-MusicPlayer")
        break
      case "EXT_MUSIC-DISCONNECTED":
        if (!that.EXT["EXT-MusicPlayer"].hello) return console.log("[GA] [EXT_NotificationsActions] Warn MusicPlayer don't say to me HELLO!")
        that.EXT_OthersRules.disconnectEXT(that,"EXT-MusicPlayer")
        break
      case "EXT_RADIO-CONNECTED":
        if (!that.EXT["EXT-RadioPlayer"].hello) return console.log("[GA] [EXT_NotificationsActions] Warn RadioPlayer don't say to me HELLO!")
        that.EXT_OthersRules.connectEXT(that,"EXT-RadioPlayer")
        break
      case "EXT_RADIO-DISCONNECTED":
        if (!that.EXT["EXT-RadioPlayer"].hello) return console.log("[GA] [EXT_NotificationsActions] Warn RadioPlayer don't say to me HELLO!")
        that.EXT_OthersRules.disconnectEXT(that,"EXT-RadioPlayer")
        break
      case "EXT_SPOTIFY-CONNECTED":
        if (!that.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Spotify don't say to me HELLO!")
        that.EXT["EXT-Spotify"].remote = true
        if (that.EXT["EXT-SpotifyCanvasLyrics"].hello && that.EXT["EXT-SpotifyCanvasLyrics"].forced) that.EXT_OthersRules.connectEXT(that,"EXT-SpotifyCanvasLyrics")
        break
      case "EXT_SPOTIFY-DISCONNECTED":
        if (!that.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Spotify don't say to me HELLO!")
        that.EXT["EXT-Spotify"].remote = false
        if (that.EXT["EXT-SpotifyCanvasLyrics"].hello && that.EXT["EXT-SpotifyCanvasLyrics"].forced) that.EXT_OthersRules.disconnectEXT(that,"EXT-SpotifyCanvasLyrics")
        break
      case "EXT_SPOTIFY-PLAYING":
        if (!that.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Spotify don't say to me HELLO!")
        that.EXT["EXT-Spotify"].play = payload
        break
      case "EXT_SPOTIFY-PLAYER_CONNECTED":
        if (!that.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Spotify don't say to me HELLO!")
        that.EXT_OthersRules.connectEXT(that,"EXT-Spotify")
        break
      case "EXT_SPOTIFY-PLAYER_DISCONNECTED":
        if (!that.EXT["EXT-Spotify"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Spotify don't say to me HELLO!")
        that.EXT_OthersRules.disconnectEXT(that,"EXT-Spotify")
        break
      case "EXT_YOUTUBE-CONNECTED":
        if (!that.EXT["EXT-YouTube"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn YouTube don't say to me HELLO!")
        that.EXT_OthersRules.connectEXT(that,"EXT-YouTube")
        break
      case "EXT_YOUTUBE-DISCONNECTED":
        if (!that.EXT["EXT-YouTube"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn YouTube don't say to me HELLO!")
        that.EXT_OthersRules.disconnectEXT(that,"EXT-YouTube")
        break
      case "EXT_YOUTUBECAST-CONNECTED":
        if (!that.EXT["EXT-YouTubeCast"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn YouTubeCast don't say to me HELLO!")
        that.EXT_OthersRules.connectEXT(that,"EXT-YouTubeCast")
        break
      case "EXT_YOUTUBECAST-DISCONNECTED":
        if (!that.EXT["EXT-YouTubeCast"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn YouTubeCast don't say to me HELLO!")
        that.EXT_OthersRules.disconnectEXT(that,"EXT-YouTubeCast")
        break
      case "EXT_BROWSER-CONNECTED":
        if (!that.EXT["EXT-Browser"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Browser don't say to me HELLO!")
        that.EXT_OthersRules.connectEXT(that,"EXT-Browser")
        break
      case "EXT_BROWSER-DISCONNECTED":
        if (!that.EXT["EXT-Browser"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Browser don't say to me HELLO!")
        that.EXT_OthersRules.disconnectEXT(that,"EXT-Browser")
        break
      case "EXT_FREEBOXTV-CONNECTED":
        if (!that.EXT["EXT-FreeboxTV"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn FreeboxTV don't say to me HELLO!")
        that.EXT_OthersRules.connectEXT(that,"EXT-FreeboxTV")
        break
      case "EXT_FREEBOXTV-DISCONNECTED":
        if (!that.EXT["EXT-FreeboxTV"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn FreeboxTV don't say to me HELLO!")
        that.EXT_OthersRules.disconnectEXT(that,"EXT-FreeboxTV")
        break
      case "EXT_PHOTOS-CONNECTED":
        if (!that.EXT["EXT-Photos"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Photos don't say to me HELLO!")
        that.EXT_OthersRules.connectEXT(that,"EXT-Photos")
        break
      case "EXT_PHOTOS-DISCONNECTED":
        if (!that.EXT["EXT-Photos"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Photos don't say to me HELLO!")
        that.EXT_OthersRules.disconnectEXT(that,"EXT-Photos")
        break
      case "EXT_BARD-CONNECTED":
        if (!that.EXT["EXT-Bard"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Bards don't say to me HELLO!")
        that.EXT_OthersRules.connectEXT(that,"EXT-Bard")
        break
      case "EXT_BARD-DISCONNECTED":
        if (!that.EXT["EXT-Bard"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Bards don't say to me HELLO!")
        that.EXT_OthersRules.disconnectEXT(that,"EXT-Bard")
        break
      case "EXT_INTERNET-DOWN":
        if (!that.EXT["EXT-Internet"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Internet don't say to me HELLO!")
        if (that.EXT["EXT-Detector"].hello) that.sendNotification("EXT_DETECTOR-STOP")
        if (that.EXT["EXT-Spotify"].hello) that.sendNotification("EXT_SPOTIFY-MAIN_STOP")
        if (that.EXT["EXT-GooglePhotos"].hello) that.sendNotification("EXT_GOOGLEPHOTOS-STOP")
        break
      case "EXT_INTERNET-UP":
        if (!that.EXT["EXT-Internet"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Internet don't say to me HELLO!")
        if (that.EXT["EXT-Detector"].hello) that.sendNotification("EXT_DETECTOR-START")
        if (that.EXT["EXT-Spotify"].hello) that.sendNotification("EXT_SPOTIFY-MAIN_START")
        if (that.EXT["EXT-GooglePhotos"].hello) that.sendNotification("EXT_GOOGLEPHOTOS-START")
        break
      case "EXT_UPDATES-MODULE_UPDATE":
        if (!that.EXT || !that.EXT["EXT-Updates"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn UN don't say to me HELLO!")
        that.EXT["EXT-Updates"].module = payload
        break
      case "EXT_VOLUME_GET":
        if (!that.EXT["EXT-Volume"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Volume don't say to me HELLO!")
        that.EXT["EXT-Volume"].speaker = payload.Speaker
        that.EXT["EXT-Volume"].isMuted = payload.SpeakerIsMuted
        that.EXT["EXT-Volume"].recorder = payload.Recorder
        break
      case "EXT_SPOTIFY-SCL_FORCED":
        if (!that.EXT["EXT-SpotifyCanvasLyrics"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Spotify don't say to me HELLO!")
        that.EXT["EXT-SpotifyCanvasLyrics"].forced = payload
        if (that.EXT["EXT-SpotifyCanvasLyrics"].forced && that.EXT["EXT-Spotify"].remote && that.EXT["EXT-Spotify"].play) that.EXT_OthersRules.connectEXT(that,"EXT-SpotifyCanvasLyrics")
        if (!that.EXT["EXT-SpotifyCanvasLyrics"].forced && that.EXT["EXT-SpotifyCanvasLyrics"].connected) that.EXT_OthersRules.disconnectEXT(that,"EXT-SpotifyCanvasLyrics")
        break
      case "EXT_MOTION-STARTED":
        if (!that.EXT["EXT-Motion"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Motion don't say to me HELLO!")
        that.EXT["EXT-Motion"].started = true
        break
      case "EXT_MOTION-STOPPED":
        if (!that.EXT["EXT-Motion"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Motion don't say to me HELLO!")
        that.EXT["EXT-Motion"].started = false
        break
      case "EXT_PIR-STARTED":
        if (!that.EXT["EXT-Pir"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Pir don't say to me HELLO!")
        that.EXT["EXT-Pir"].started = true
        break
      case "EXT_PIR-STOPPED":
        if (!that.EXT["EXT-Pir"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Pir don't say to me HELLO!")
        that.EXT["EXT-Pir"].started = false
        break
      case "EXT_SELFIES-START":
        if (!that.EXT["EXT-Selfies"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Selfies don't say to me HELLO!")
        that.EXT_OthersRules.connectEXT(that,"EXT-Selfies")
        if (that.EXT["EXT-Motion"].hello && that.EXT["EXT-Motion"].started) that.sendNotification("EXT_MOTION-DESTROY")
        break
      case "EXT_SELFIES-END":
        if (!that.EXT["EXT-Selfies"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Selfies don't say to me HELLO!")
        that.EXT_OthersRules.disconnectEXT(that,"EXT-Selfies")
        if (that.EXT["EXT-Motion"].hello && !that.EXT["EXT-Motion"].started) that.sendNotification("EXT_MOTION-INIT")
        break
      case "EXT_PAGES-NUMBER_IS":
        if (!that.EXT["EXT-Pages"].hello) return console.error("[GA] [EXT_NotificationsActions] Warn Pages don't say to me HELLO!")
        that.EXT["EXT-Pages"].actual = payload.Actual
        that.EXT["EXT-Pages"].total = payload.Total
        break
      /** Warn if not in db **/
      default:
        logGA("[EXT_NotificationsActions] Sorry, i don't understand what is", noti, payload || "")
        break
    }
    that.sendSocketNotification("EXTStatus", that.EXT)
    logGA("[EXT_NotificationsActions] EXTs Status", that.EXT)
  }

  /**********************/
  /** Scan GA Response **/
  /**********************/
  gatewayEXT(that, response) {
    if (!response) return // @todo scan if type array ??
    logGA("[EXT_NotificationsActions] Response Scan")
    let tmp = {
      photos: {
        urls: response.photos && response.photos.length ? response.photos : [],
        length: response.photos && response.photos.length ? response.photos.length : 0
      },
      links: {
        urls: response.urls && response.urls.length ?  response.urls : [],
        length: response.urls && response.urls.length ? response.urls.length : 0
      },
      youtube: response.youtube
    }

    // the show must go on !
    var urls = configMerge({}, urls, tmp)
    if(urls.photos.length > 0 && that.EXT["EXT-Photos"].hello) {
      that.EXT["EXT-Photos"].connected = true
      that.sendNotification("EXT_PHOTOS-OPEN", urls.photos.urls)
      logGA("[EXT_NotificationsActions] Forced connected: EXT-Photos")
    }
    else if (urls.links.length > 0) {
      this.urlsScan(that, urls)
    } else if (urls.youtube && that.EXT["EXT-YouTube"].hello) {
      that.sendNotification("EXT_YOUTUBE-SEARCH", urls.youtube)
      logGA("[EXT_NotificationsActions] Sended to YT", urls.youtube)
    }
    logGA("[EXT_NotificationsActions] Response Structure:", urls)
  }

  /** urls scan : dispatch url, youtube, spotify **/
  /** use the FIRST discover link only **/
  urlsScan(that, urls) {
    var firstURL = urls.links.urls[0]

    /** YouTube RegExp **/
    var YouTubeLink = new RegExp("youtube\.com\/([a-z]+)\\?([a-z]+)\=([0-9a-zA-Z\-\_]+)", "ig")
    /** Scan Youtube Link **/
    var YouTube = YouTubeLink.exec(firstURL)

    if (YouTube) {
      let Type
      if (YouTube[1] == "watch") Type = "id"
      if (YouTube[1] == "playlist") Type = "playlist"
      if (!Type) return console.log("[EXT_NotificationsActions] [GA:EXT:YouTube] Unknow Type !" , YouTube)
      if (that.EXT["EXT-YouTube"].hello) {
        if (Type == "playlist") {
          that.sendNotification("EXT_ALERT",{
            message: "EXT_YOUTUBE don't support playlist",
            timer: 5000,
            type: "warning"
          })
          return
        }
        that.sendNotification("EXT_YOUTUBE-PLAY", YouTube[3])
      }
      return
    }

    /** scan spotify links **/
    /** Spotify RegExp **/
    var SpotifyLink = new RegExp("open\.spotify\.com\/([a-z]+)\/([0-9a-zA-Z\-\_]+)", "ig")
    var Spotify = SpotifyLink.exec(firstURL)
    if (Spotify) {
      let type = Spotify[1]
      let id = Spotify[2]
      if (that.EXT["EXT-Spotify"].hello) {
        if (type == "track") {
          // don't know why tracks works only with uris !?
          that.sendNotification("EXT_SPOTIFY-PLAY", {"uris": ["spotify:track:" + id ]})
        }
        else {
          that.sendNotification("EXT_SPOTIFY-PLAY", {"context_uri": "spotify:"+ type + ":" + id})
        }
      }
      return
    }
    // send to Browser
    if (that.EXT["EXT-Browser"].hello) {
      // force connexion for rules (don't turn off other EXT)
      that.EXT["EXT-Browser"].connected = true
      that.sendNotification("EXT_BROWSER-OPEN", firstURL)
      logGA("[EXT_NotificationsActions] Forced connected: EXT-Browser")
    }
  }
}
