/**  spotify commands for GoogleAssistant v3  **/
/**  multi Lang EN/FR/IT **/
/**  modify pattern to your language if needed  **/
/**  @bugsounet  **/

var recipe = {
  transcriptionHooks: {
    "SEARCH_SPOTIFY": {
      pattern: "(.*) sur spotify",
      command: "SEARCH_SPOTIFY"
    },
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

    "EN_SEARCH_SPOTIFY": {
      pattern: "(.*) on spotify",
      command: "SEARCH_SPOTIFY"
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
    },

    "IT_SEARCH_SPOTIFY": {
      pattern: "(.*) su spotify",
      command: "SEARCH_SPOTIFY"
    },
    "IT_NEXT_SPOTIFY" : {
      pattern: "spotify seguente",
      command: "NEXT_SPOTIFY"
    },
    "IT_PREVIOUS_SPOTIFY": {
      pattern: "spotify precedente",
      command: "PREVIOUS_SPOTIFY"
    },
    "IT_SHUFFLE_SPOTIFY": {
      pattern: "spotify casuale",
      command: "SHUFFLE_SPOTIFY"
    },
    "IT_REPEAT_SPOTIFY": {
      pattern: "spotify ripeti",
      command: "REPEAT_SPOTIFY"
    },
    "IT_TRANSTO_SPOTIFY": {
      pattern: "spotify trasferisci a (.*)",
      command: "TRANSTO_SPOTIFY"
    }

  },

  commands: {
    "SEARCH_SPOTIFY": {
      functionExec: {
        exec: (params) => {
          this.SpotifyCommand('SEARCH', {
            type: "artist,track,album,playlist",
            query: params[1],
            random:false
          })
        }
      },
      soundExec: {
        chime: "open"
      },
      displayResponse: true
    },
    "START_SPOTIFY": {
      functionExec: {
        exec: () => {
          this.SpotifyCommand('PLAY')
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "PAUSE_SPOTIFY": {
      functionExec: {
        exec: () => {
          this.SpotifyCommand('PAUSE')
        }
      },
      soundExec: {
        chime: "close"
      }
    },
    "STOP_SPOTIFY": {
      functionExec: {
        exec: () => {
          this.SpotifyCommand('STOP')
        }
      },
      soundExec: {
        chime: "close"
      }
    },
    "NEXT_SPOTIFY": {
      functionExec: {
        exec: () => {
          this.SpotifyCommand('NEXT')
        }
      },
    },
    "PREVIOUS_SPOTIFY": {
      functionExec: {
        exec: () => {
          this.SpotifyCommand('PREVIOUS')
        }
      },
    },
    "SHUFFLE_SPOTIFY": {
      functionExec: {
        exec: () => {
          this.SpotifyCommand('SHUFFLE')
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "REPEAT_SPOTIFY": {
      functionExec: {
        exec: () => {
          this.SpotifyCommand('REPEAT')
        }
      },
    },
    "TRANSTO_SPOTIFY": {
      functionExec: {
        exec: (params) => {
          this.SpotifyCommand('TRANSFER', params[1])
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "VOLUME_SPOTIFY": {
      functionExec: {
        exec: (params) => {
          this.SpotifyCommand('VOLUME', params[1])
        }
      }
    }
  }
}
exports.recipe = recipe
