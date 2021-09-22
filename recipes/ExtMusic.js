/**  music commands for GoogleAssistant v3  **/
/**  multi Lang EN/FR/ (And Others) **/
/**  modify pattern to your language if needed  **/
/**  @bugsounet  **/

var recipe = {
  transcriptionHooks: {
    /* EN Language */
    "EN_START_MUSIC" : {
      pattern : "music play",
      command: "START_MUSIC"
    },
    "EN_STOP_MUSIC" : {
      pattern : "music stop",
      command: "STOP_MUSIC"
    },
    "EN_PAUSE_MUSIC" : {
      pattern: "music pause",
      command: "PAUSE_MUSIC"
    },
    "EN_NEXT_MUSIC" : {
      pattern: "music next",
      command: "NEXT_MUSIC"
    },
    "EN_PREVIOUS_MUSIC": {
      pattern: "music previous",
      command: "PREVIOUS_MUSIC"
    },
    "EN_VOLUME_MUSIC": {
      pattern: "music volume (.*)",
      command: "VOLUME_MUSIC"
    },
    "EN_REBUILD_MUSIC": {
      pattern: "music rebuild",
      command: "REBUILD_MUSIC"
    },
    "EN_SWITCH_MUSIC": {
      pattern: "music switch",
      command: "SWITCH_MUSIC"
    },

    /* FR Language */
    "FR_START_MUSIC" : {
      pattern : "musique play",
      command: "START_MUSIC"
    },
    "FR_STOP_MUSIC" : {
      pattern : "musique stop",
      command: "STOP_MUSIC"
    },
    "FR_PAUSE_MUSIC" : {
      pattern: "musique pause",
      command: "PAUSE_MUSIC"
    },
    "FR_NEXT_MUSIC" : {
      pattern: "musique suivante",
      command: "NEXT_MUSIC"
    },
    "FR_PREVIOUS_MUSIC": {
      pattern: "musique précédente",
      command: "PREVIOUS_MUSIC"
    },
    "FR_VOLUME_MUSIC": {
      pattern: "musique volume (.*)",
      command: "VOLUME_MUSIC"
    },
    "FR_REBUILD_MUSIC": {
      pattern: "musique base de données",
      command: "REBUILD_MUSIC"
    },
    "FR_SWITCH_MUSIC": {
      pattern: "musique change source",
      command: "SWITCH_MUSIC"
    },

    /* Other Language ? */
  },

  commands: {
    "START_MUSIC": {
      functionExec: {
        exec: () => {
          this.MusicCommand('PLAY')
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "PAUSE_MUSIC": {
      functionExec: {
        exec: () => {
          this.MusicCommand('PAUSE')
        }
      },
      soundExec: {
        chime: "close"
      }
    },
    "STOP_MUSIC": {
      functionExec: {
        exec: () => {
          this.MusicCommand('STOP')
        }
      },
      soundExec: {
        chime: "close"
      }
    },
    "NEXT_MUSIC": {
      functionExec: {
        exec: () => {
          this.MusicCommand('NEXT')
        }
      },
    },
    "PREVIOUS_MUSIC": {
      functionExec: {
        exec: () => {
          this.MusicCommand('PREVIOUS')
        }
      },
    },
    "VOLUME_MUSIC": {
      functionExec: {
        exec: (params) => {
          this.MusicCommand('VOLUME', params[1])
        }
      }
    },
    "REBUILD_MUSIC": {
      functionExec: {
        exec: () => {
          this.MusicCommand('REBUILD')
        }
      },
    },
    "SWITCH_MUSIC": {
      functionExec: {
        exec: () => {
          this.MusicCommand('SWITCH')
        }
      },
    },
  }
}
exports.recipe = recipe
