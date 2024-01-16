var log = (...args) => { /* do nothing */ }

function send(that, name, values) {
  if (that.config.debug) log = (...args) => { console.log("[GA] [SMARTHOME] [CALLBACK]", ...args) }
  switch (name) {
    case "screen":
      log("Send screen:", values)
      that.sendSocketNotification("CB_SCREEN", values)
      break
    case "volume":
      log("Send volume:", values)
      that.sendSocketNotification("CB_VOLUME", values)
      break
    case "volumeMute":
      log("Send volume Mute:", values)
      that.sendSocketNotification("CB_VOLUME-MUTE", values)
      break
    case "volumeUp":
      log("Send volume Up")
      that.sendSocketNotification("CB_VOLUME-UP")
      break
    case "volumeDown":
      log("Send volume Down")
      that.sendSocketNotification("CB_VOLUME-DOWN")
      break
    case "setPage":
      log("Send setInput:", values)
      that.sendSocketNotification("CB_SET-PAGE", values)
      break
    case "setNextPage":
      log("Send setNextPage")
      that.sendSocketNotification("CB_SET-NEXT-PAGE")
      break
    case "setPreviousPage":
      log("Send setPreviousPage")
      that.sendSocketNotification("CB_SET-PREVIOUS-PAGE")
      break
    case "Alert":
      log("Send Alert:", values)
      that.sendSocketNotification("CB_ALERT", values)
      break
    case "Done":
      log("Send Alert Done:", values)
      that.sendSocketNotification("CB_DONE", values)
      break
    case "Reboot":
      log("Send Reboot")
      setTimeout(() => that.lib.EXTTools.restartMM(that) , 8000)
      break
    case "Locate":
      log("Send Locate")
      that.sendSocketNotification("CB_LOCATE")
      break
    case "SpotifyPlay":
      log("Send SpotifyPlay")
      that.sendSocketNotification("CB_SPOTIFY-PLAY")
      break
    case "SpotifyPause":
      log("Send SpotifyPause")
      that.sendSocketNotification("CB_SPOTIFY-PAUSE")
      break
    case "SpotifyPrevious":
      log("Send SpotifyPrevious")
      that.sendSocketNotification("CB_SPOTIFY-PREVIOUS")
      break
    case "SpotifyNext":
      log("Send SpotifyNext")
      that.sendSocketNotification("CB_SPOTIFY-NEXT")
      break
    case "Stop":
      log("Send Stop")
      that.sendSocketNotification("CB_STOP")
      break
    case "TVPlay":
      log("Send TVPlay")
      that.sendSocketNotification("CB_TV-PLAY")
      break
    case "TVNext":
      log("Send TVNext")
      that.sendSocketNotification("CB_TV-NEXT")
      break
    case "TVPrevious":
      log("Send TVPrevious")
      that.sendSocketNotification("CB_TV-PREVIOUS")
      break
    case "SpotifyLyricsOn":
      log("Send Lyrics on")
      that.sendSocketNotification("CB_SPOTIFY-LYRICS-ON")
      break
    case "SpotifyLyricsOff":
      log("Send Lyrics off")
      that.sendSocketNotification("CB_SPOTIFY-LYRICS-OFF")
      break
    default:
      log("Unknow callback:", name)
      break
  }
}

exports.send = send
