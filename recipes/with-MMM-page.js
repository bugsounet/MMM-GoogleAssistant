/**  MMM-pages commands addon           **/
/**         @bugsounet                 **/


var recipe = {
  commands: {
    "PAGES": {
      moduleExec: {
        module: (param) => { 
          if (param.notification == "SPOTIFY_CONNECTED") { 
            this.sendNotification("PAGE_CHANGED", 1)
          }
          if (param.notification == "SPOTIFY_DISCONNECTED") { 
            this.sendNotification("PAGE_CHANGED", 0)
          }

          if (param.notification == "XBOX_ACTIVE") {
            this.sendNotification("PAGE_CHANGED", 2)
          }
          if (param.notification == "XBOX_INACTIVE") {
            this.sendNotification("PAGE_CHANGED", 0)
          }

        },
      }
    }
  },
  plugins: {
    onNotificationReceived: "PAGES"
  },
}

exports.recipe = recipe
