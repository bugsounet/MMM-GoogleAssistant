/*****************/
/** EXT Actions **/
/*****************/
class EXT_Actions {
  constructor () {
    console.log("[GA] EXT_Actions Ready")
  }

  Actions(that, status) {
    logGA("[EXT_Actions] Received GA status:", status)
    if (!that.EXT.GA_Ready) return console.log("[GA] [EXT_Actions] MMM-GoogleAssistant is not ready")
    switch(status) {
      case "LISTEN":
      case "THINK":
        if (that.EXT["EXT-Detector"].hello) that.sendNotification("EXT_DETECTOR-STOP")
        if (that.EXT["EXT-Screen"].hello && !that.EXT_OthersRules.hasPluginConnected(that.EXT, "connected", true)) {
          if (!that.EXT["EXT-Screen"].power) that.sendNotification("EXT_SCREEN-WAKEUP")
          that.sendNotification("EXT_SCREEN-LOCK", { show: true } )
          if (that.EXT["EXT-Motion"].hello && that.EXT["EXT-Motion"].started) that.sendNotification("EXT_MOTION-DESTROY")
          if (that.EXT["EXT-Pir"].hello && that.EXT["EXT-Pir"].started) that.sendNotification("EXT_PIR-STOP")
          if (that.EXT["EXT-StreamDeck"].hello) that.sendNotification("EXT_STREAMDECK-ON")
        }
        if (that.EXT["EXT-Pages"].hello && !that.EXT_OthersRules.hasPluginConnected(that.EXT, "connected", true)) that.sendNotification("EXT_PAGES-PAUSE")
        if (that.EXT["EXT-Spotify"].hello && that.EXT["EXT-Spotify"].connected) that.sendNotification("EXT_SPOTIFY-VOLUME_MIN")
        if (that.EXT["EXT-RadioPlayer"].hello && that.EXT["EXT-RadioPlayer"].connected) that.sendNotification("EXT_RADIO-VOLUME_MIN")
        if (that.EXT["EXT-MusicPlayer"].hello && that.EXT["EXT-MusicPlayer"].connected) that.sendNotification("EXT_MUSIC-VOLUME_MIN")
        if (that.EXT["EXT-FreeboxTV"].hello && that.EXT["EXT-FreeboxTV"].connected) that.sendNotification("EXT_FREEBOXTV-VOLUME_MIN")
        if (that.EXT["EXT-YouTube"].hello && that.EXT["EXT-YouTube"].connected) that.sendNotification("EXT_YOUTUBE-VOLUME_MIN")
        break
      case "STANDBY":
        if (that.EXT["EXT-Detector"].hello) that.sendNotification("EXT_DETECTOR-START")
        if (that.EXT["EXT-Screen"].hello && !that.EXT_OthersRules.hasPluginConnected(that.EXT, "connected", true)) {
          that.sendNotification("EXT_SCREEN-UNLOCK", { show: true } )
          if (that.EXT["EXT-Motion"].hello && !that.EXT["EXT-Motion"].started) that.sendNotification("EXT_MOTION-INIT")
          if (that.EXT["EXT-Pir"].hello && !that.EXT["EXT-Pir"].started) that.sendNotification("EXT_PIR-START")
          if (that.EXT["EXT-StreamDeck"].hello) that.sendNotification("EXT_STREAMDECK-OFF")
        }
        if (that.EXT["EXT-Pages"].hello && !that.EXT_OthersRules.hasPluginConnected(that.EXT, "connected", true)) that.sendNotification("EXT_PAGES-RESUME")
        if (that.EXT["EXT-Spotify"].hello && that.EXT["EXT-Spotify"].connected) that.sendNotification("EXT_SPOTIFY-VOLUME_MAX")
        if (that.EXT["EXT-RadioPlayer"].hello && that.EXT["EXT-RadioPlayer"].connected) that.sendNotification("EXT_RADIO-VOLUME_MAX")
        if (that.EXT["EXT-MusicPlayer"].hello && that.EXT["EXT-MusicPlayer"].connected) that.sendNotification("EXT_MUSIC-VOLUME_MAX")
        if (that.EXT["EXT-FreeboxTV"].hello && that.EXT["EXT-FreeboxTV"].connected) that.sendNotification("EXT_FREEBOXTV-VOLUME_MAX")
        if (that.EXT["EXT-YouTube"].hello && that.EXT["EXT-YouTube"].connected) that.sendNotification("EXT_YOUTUBE-VOLUME_MAX")
        break
      case "REPLY":
      case "CONTINUE":
      case "CONFIRMATION":
      case "ERROR":
      case "HOOK":
        break
    }
  }
}

