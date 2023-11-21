class EXT_Callbacks {
  constructor () {
    console.log("[GA] EXT_Callbacks Ready")
  }

  cb(that,noti,payload) {
    switch(noti) {
      case "CB_SCREEN":
        if (payload == "ON") that.sendNotification("EXT_SCREEN-FORCE_WAKEUP")
        else if (payload == "OFF") {
          that.sendNotification("EXT_STOP")
          that.sendNotification("EXT_SCREEN-FORCE_END")
        }
        break
      case "CB_VOLUME":
        that.sendNotification("EXT_VOLUME-SPEAKER_SET", payload)
        break
      case "CB_VOLUME-MUTE":
        that.sendNotification("EXT_VOLUME-SPEAKER_MUTE", payload)
        break
      case "CB_VOLUME-UP":
        that.sendNotification("EXT_VOLUME-SPEAKER_UP", payload)
        break
      case "CB_VOLUME-DOWN":
        that.sendNotification("EXT_VOLUME-SPEAKER_DOWN", payload)
        break
      case "CB_SET-PAGE":
        that.sendNotification("EXT_PAGES-CHANGED", payload)
        break
      case "CB_SET-NEXT-PAGE":
        that.sendNotification("EXT_PAGES-INCREMENT")
        break
      case "CB_SET-PREVIOUS-PAGE":
        that.sendNotification("EXT_PAGES-DECREMENT")
        break
      case "CB_ALERT":
        that.sendNotification("EXT_ALERT", {
          message: payload,
          type: "warning",
          timer: 10000
        })
        break
      case "CB_DONE":
        that.sendNotification("EXT_ALERT", {
          message: payload,
          type: "information",
          timer: 5000
        })
        break
      case "CB_LOCATE":
        that.sendNotification("EXT_ALERT", {
          message: "Hey, I'm here !",
          type: "information",
          sound: "modules/Gateway/tools/locator.mp3",
          timer: 19000
        })
        break
      case "CB_SPOTIFY-PLAY":
        that.sendNotification("EXT_SPOTIFY-PLAY")
        break
      case "CB_SPOTIFY-PAUSE":
        that.sendNotification("EXT_SPOTIFY-PAUSE")
        break
      case "CB_SPOTIFY-PREVIOUS":
        that.sendNotification("EXT_SPOTIFY-PREVIOUS")
        break
      case "CB_SPOTIFY-NEXT":
        that.sendNotification("EXT_SPOTIFY-NEXT")
        break
      case "CB_STOP":
        that.notificationReceived("EXT_STOP")
        that.sendNotification("EXT_STOP")
        break
      case "CB_TV-PLAY":
        that.sendNotification("EXT_FREEBOXTV-PLAY")
        break
      case "CB_TV-NEXT":
        that.sendNotification("EXT_FREEBOXTV-NEXT")
        break
      case "CB_TV-PREVIOUS":
        that.sendNotification("EXT_FREEBOXTV-PREVIOUS")
        break
      case "CB_SPOTIFY-LYRICS-ON":
        that.sendNotification("EXT_SPOTIFY-SCL", true)
        break
      case "CB_SPOTIFY-LYRICS-OFF":
        that.sendNotification("EXT_SPOTIFY-SCL", false)
        break
    }
  }
}
