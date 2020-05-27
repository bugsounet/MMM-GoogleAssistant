/**   Reboot, Restart, Shutdown, Screen  **/
/**   Vocal commands script              **/
/**   set partern in your language       **/
/**   @bugsounet                         **/

var recipe = {
  transcriptionHooks: {
    "AMK2_REBOOT": {
      pattern: "reboot please",
      command: "AMK2_REBOOT"
    },
    "AMK2_RESTART": {
      pattern: "restart please",
      command: "AMK2_RESTART"
    },
    "AMK2_REBOOT": {
      pattern: "shutdown please",
      command: "AMK2_SHUTDOWN"
    },
  },
  
  commands: {
    "AMK2_REBOOT": {
      soundExec: {
        chime: "close",
      },
      shellExec: {
        exec: "sudo reboot now"
      } 
    },
    "AMK2_RESTART": {
      soundExec: {
        chime: "close",
      },
      shellExec: {
        exec: "pm2 restart 0"
      } 
    },
    "AMK2_SHUTDOWN": {
      soundExec: {
        chime: "close",
      },
      shellExec: {
        exec: "sudo shutdown now"
      }, 
    },
  }
  
}

exports.recipe = recipe // Don't remove this line.
