/**  spotify commands addon  **/
/**  multi Lang EN/FR  **/
/**  modify pattern to your language if needed  **/
/**  @bugsounet  **/

var recipe = {
  transcriptionHooks: {
    "START_SPOTIFY" : {
      pattern : "spotify play",
      command: "START_SPOTIFY"
    },
    "STOP_SPOTIFY" : {
      pattern : "spotify stop",
      command: "STOP_SPOTIFY"
    },
    "PAUSE_SPOTIFY" : {
      pattern: "spotify pause",
      command: "PAUSE_SPOTIFY"
    },
    "NEXT_SPOTIFY" : {
      pattern: "spotify suivante",
      command: "NEXT_SPOTIFY"
    },
    "PREVIOUS_SPOTIFY": {
      pattern: "spotify précédente",
      command: "PREVIOUS_SPOTIFY"
    },
    "SHUFFLE_SPOTIFY": {
      pattern: "spotify aléatoire",
      command: "SHUFFLE_SPOTIFY"
    },
    "REPEAT_SPOTIFY": {
      pattern: "spotify répète",
      command: "REPEAT_SPOTIFY"
    },
    "TRANSTO_SPOTIFY": {
      pattern: "spotify transfert vers (.*)",
      command: "TRANSTO_SPOTIFY"
    },
    "VOLUME_SPOTIFY": {
      pattern: "spotify volume (.*)",
      command: "VOLUME_SPOTIFY"
    },

    "EN_NEXT_SPOTIFY" : {
      pattern: "spotify next",
      command: "NEXT_SPOTIFY"
    },
    "EN_PREVIOUS_SPOTIFY": {
      pattern: "spotify previous",
      command: "PREVIOUS_SPOTIFY"
    },
    "EN_SHUFFLE_SPOTIFY": {
      pattern: "spotify shuffle",
      command: "SHUFFLE_SPOTIFY"
    },
    "EN_REPEAT_SPOTIFY": {
      pattern: "spotify repeat",
      command: "REPEAT_SPOTIFY"
    },
    "EN_TRANSTO_SPOTIFY": {
      pattern: "spotify transfer to (.*)",
      command: "TRANSTO_SPOTIFY"
    }
  },

  commands: {
    "START_SPOTIFY": {
      notificationExec: {
        notification: "A2D_SPOTIFY_PLAY"
      },
      soundExec: {
        chime: "open",
      }
    },
    "PAUSE_SPOTIFY": {
      notificationExec: {
        notification: "A2D_SPOTIFY_PAUSE"
      },
      soundExec: {
        chime: "close"
      }
    },
    "STOP_SPOTIFY": {
      notificationExec: {
        notification: "A2D_SPOTIFY_STOP"
      },
      soundExec: {
        chime: "close"
      }
    },
    "NEXT_SPOTIFY": {
      notificationExec: {
        notification: "A2D_SPOTIFY_NEXT"
      }
    },
    "PREVIOUS_SPOTIFY": {
      notificationExec: {
        notification: "A2D_SPOTIFY_PREVIOUS"
      }
    },
    "SHUFFLE_SPOTIFY": {
      notificationExec: {
        notification: "A2D_SPOTIFY_SHUFFLE"
      },
      soundExec: {
        chime: "open"
      }
    },
    "REPEAT_SPOTIFY": {
      notificationExec: {
        notification: "A2D_SPOTIFY_REPEAT"
      },
      soundExec: {
        chime: "open"
      }
    },
    "TRANSTO_SPOTIFY": {
      notificationExec: {
        notification: "A2D_SPOTIFY_TRANSFER",
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
        notification: "A2D_SPOTIFY_VOLUME",
        payload: (params) => {
          return params[1]
        }
      }
    }
  }
}
exports.recipe = recipe
