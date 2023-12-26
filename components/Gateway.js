class Gateway {
  constructor () {
    console.log("[GA] Tools Ready (Gateway)")
  }

  /** Send needed part of response to Gateway **/
  SendToGateway(that, response) {
    if (response.screen && (response.screen.links.length > 0 || response.screen.photos.length > 0)) {
      let opt = {
        "photos": response.screen.photos,
        "urls": response.screen.links,
        "youtube": null
      }
      logGA("Send response:", opt)
      that.notificationReceived("EXT_GATEWAY", opt)
    } else if (response.text) {
      if (that.AssistantSearch.GoogleSearch(response.text)) {
        that.sendSocketNotification("GOOGLESEARCH", response.transcription.transcription)
      } else if (that.AssistantSearch.YouTubeSearch(response.text)) {
        logGA("Send response YouTube:", response.transcription.transcription)
        that.notificationReceived("EXT_GATEWAY", {
          "photos": [],
          "urls": [],
          "youtube": response.transcription.transcription
        })
      }
    }
  }

  sendGoogleResult(that, link) {
    if (!link) return console.error("[GA] No link to open!")
    logGA("Send response:", link)
    that.notificationReceived("EXT_GATEWAY", {
      "photos": [],
      "urls": [ link ],
      "youtube": null
    })
  }
}
