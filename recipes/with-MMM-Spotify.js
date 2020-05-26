/**  MMM-Spotify commands addon  **/
/**  modify pattern to your language  **/
/**  @bugsounet  **/

var recipe = {
  transcriptionHooks: {
    "SEARCH_SPOTIFY": {
      pattern: "(.*) on spotify",
      command: "SEARCH_SPOTIFY"
    },
    "START_SPOTIFY" : {
      pattern : "music play",
      command: "START_SPOTIFY"
    },
    "STOP_SPOTIFY" : {
      pattern : "music stop",
      command: "STOP_SPOTIFY"
    },
    "PAUSE_SPOTIFY" : {
      pattern: "music pause",
      command: "STOP_SPOTIFY"
    },
    "NEXT_SPOTIFY" : {
      pattern: "music next",
      command: "NEXT_SPOTIFY"
    },
    "PREVIOUS_SPOTIFY": {
      pattern: "music previous",
      command: "PREVIOUS_SPOTIFY"
    },
    "SHUFFLE_SPOTIFY": {
      pattern: "music shuffle",
      command: "SHUFFLE_SPOTIFY"
    },
    "REPEAT_SPOTIFY": {
      pattern: "music repeat",
      command: "REPEAT_SPOTIFY"
    },
    "TRANSTO_SPOTIFY": {
      pattern: "music transfer to (.*)",
      command: "TRANSTO_SPOTIFY"
    },
    "VOLUME_SPOTIFY": {
      pattern: "spotify volume (.*)",
      command: "VOLUME_SPOTIFY"
    },
    "ACCOUNT_SPOTIFY": {
      pattern: "spotify account (.*)",
      command: "ACCOUNT_SPOTIFY"
    }
  },

  commands: {
    "SEARCH_SPOTIFY": {
      notificationExec: {
        notification: "SPOTIFY_SEARCH",
        payload: (params) => {
          return {
            type: "artist,track,album,playlist",
            query: params[1], 
            random:false,
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "START_SPOTIFY": {
      notificationExec: {
        notification: "SPOTIFY_PLAY"
      },
      soundExec: {
        chime: "open",
      }
    },
    "STOP_SPOTIFY": {
      notificationExec: {
        notification: "SPOTIFY_PAUSE"
      },
      soundExec: {
        chime: "open"
      }
    },
    "NEXT_SPOTIFY": {
      notificationExec: {
        notification: "SPOTIFY_NEXT"
      },
      soundExec: {
        chime: "open"
      }
    },
    "PREVIOUS_SPOTIFY": {
      notificationExec: {
        notification: "SPOTIFY_PREVIOUS"
      },
      soundExec: {
        chime: "open"
      }
    },
    "SHUFFLE_SPOTIFY": {
      notificationExec: {
        notification: "SPOTIFY_SHUFFLE"
      },
      soundExec: {
        chime: "open"
      }
    },
    "REPEAT_SPOTIFY": {
      notificationExec: {
        notification: "SPOTIFY_REPEAT"
      },
      soundExec: {
        chime: "open"
      }
    },   
    "TRANSTO_SPOTIFY": {
      notificationExec: {
        notification: "SPOTIFY_TRANSFER",
        payload: (params) => {
          return params[1]
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "VOLUME_SPOTIFY": {
      notificationExec: {
        notification: "SPOTIFY_VOLUME",
        payload: (params) => {
          return params[1]
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "ACCOUNT_SPOTIFY": {
      notificationExec: {
        notification: "SPOTIFY_ACCOUNT",
        payload: (params) => {
          return params[1]
        }
      },
      soundExec: {
        chime: "open"
      }
    },
  },
}
exports.recipe = recipe
