/**   Screen Manager                **/
/**   Vocal commands script         **/
/**   set partern in your language  **/
/**   @bugsounet                    **/

var recipe = {
  transcriptionHooks: {
    "SCREEN_TURNOFF": {
      pattern: "éteins l'écran",
      command: "SCREEN_TURNOFF"
    },
    "SCREEN_TURNON": {
      pattern: "allume l'écran",
      command: "SCREEN_TURNON"
    }
  },

  commands: {
    "SCREEN_TURNOFF": {
      soundExec: {
        chime: "close",
      },
      shellExec: {
        exec: "vcgencmd display_power 0"
      }
    },
    "SCREEN_TURNON": {
      soundExec: {
        chime: "open",
      },
      shellExec: {
        exec: "vcgencmd display_power 1"
      }
    }
  }
}

exports.recipe = recipe // Don't remove this line.
