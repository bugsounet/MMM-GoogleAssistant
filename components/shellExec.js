"use strict"

var logGA = (...args) => { /* do nothing */ }

function exec (that, payload) {
  if (that.config.debug) logGA = (...args) => { console.log("[GA] [SHELL_EXEC]", ...args) }
  var command = payload.command
  if (!command) return console.error("[GA] [SHELLEXEC] no command to execute!")
  command += (payload.options) ? (" " + payload.options) : ""
  that.lib.childProcess.exec (command, (e,so,se)=> {
    logGA("command:", command)
    if (e) {
      console.log("[GA] [SHELL_EXEC] Error:" + e)
      that.sendSocketNotification("WARNING", { message: "ShellExecError"} )
    }

    logGA("RESULT", {
      executed: payload,
      result: {
        error: e,
        stdOut: so,
        stdErr: se,
      }
    })
  })
}

exports.exec = exec
