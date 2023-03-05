class Gateway {
  constructor () {
    console.log("[GA] Tools Ready")
  }

  /** Send needed part of response to Gateway **/
  SendToGateway(that, response) {
    if (response.screen && (response.screen.links.length > 0 || response.screen.photos.length > 0)) {
      let opt = {
        "photos": response.screen.photos,
        "urls": response.screen.links,
        "youtube": null
      }
      logGA("Send response to Gateway:", opt)
      that.sendNotification("EXT_GATEWAY", opt)
    } else if (response.text) {
      if (that.AssistantSearch.GoogleSearch(response.text)) {
        that.sendSocketNotification("GOOGLESEARCH", response.transcription.transcription)
      } else if (that.AssistantSearch.YouTubeSearch(response.text)) {
        logGA("Send response YouTube to Gateway:", response.transcription.transcription)
        that.sendNotification("EXT_GATEWAY", {
          "photos": [],
          "urls": [],
          "youtube": response.transcription.transcription
        })
      }
    }
  }

  sendGoogleResult(that, link) {
    if (!link) return console.error("[GA] No link to open!")
    logGA("Send response to Gateway:", link)
    that.sendNotification("EXT_GATEWAY", {
      "photos": [],
      "urls": [ link ],
      "youtube": null
    })
  }
}
