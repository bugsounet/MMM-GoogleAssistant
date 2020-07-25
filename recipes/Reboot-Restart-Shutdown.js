/**   Reboot, Restart, Shutdown, Screen  **/
/**   Vocal commands script              **/
/**   set partern in your language       **/
/**   @bugsounet                         **/

var recipe = {
  transcriptionHooks: {
    "GA_REBOOT": {
      pattern: "reboot please",
      command: "GA_REBOOT"
    },
    "GA_RESTART": {
      pattern: "restart please",
      command: "GA_RESTART"
    },
    "GA_REBOOT": {
      pattern: "shutdown please",
      command: "GA_SHUTDOWN"
    }
  },
  
  commands: {
    "GA_REBOOT": {
      soundExec: {
        chime: "close",
      },
      shellExec: {
        exec: "sudo reboot now"
      }
    },
    "GA_RESTART": {
      soundExec: {
        chime: "close",
      },
      shellExec: {
        exec: "pm2 restart 0"
      }
    },
    "GA_SHUTDOWN": {
      soundExec: {
        chime: "close",
      },
      shellExec: {
        exec: "sudo shutdown now"
      }
    }
  }
}

exports.recipe = recipe // Don't remove this line.
