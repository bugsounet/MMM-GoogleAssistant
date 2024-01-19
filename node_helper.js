//
// Module : MMM-GoogleAssistant
//

var parseData = require("./components/parseData.js")
var logGA = (...args) => { /* do nothing */ }
const { exec } = require("child_process")

var NodeHelper = require("node_helper")

module.exports = NodeHelper.create({
  start: function () {
    parseData.init(this)
  },

  socketNotificationReceived: async function (noti, payload) {
    switch (noti) {
      case "PRE-INIT":
        if (this.alreadyInitialized) {
          console.error("[GA] You can't use MMM-GoogleAssistant in server mode")
          this.sendSocketNotification("ERROR", "You can't use MMM-GoogleAssistant in server mode")
          setTimeout(() => process.exit(), 5000)
          return
        }
        if (this.EXT.server) return
        this.alreadyInitialized= true
        this.config = payload
        console.log("[GA] MMM-GoogleAssistant Version:", require('./package.json').version, "rev:", require('./package.json').rev)
        this.config.assistantConfig["modulePath"] = __dirname
        parseData.parse(this)
        break
      case "INIT":
        parseData.parseMiddleware(this, payload)
        break
      case "ACTIVATE_ASSISTANT":
        this.lib.activateAssistant.activate(this, payload)
        break
      case "SHELLEXEC":
        if (this.config.debug) logGA = (...args) => { console.log("[GA] [SHELL_EXEC]", ...args) }
        var command = payload.command
        if (!command) return console.error("[GA] [SHELLEXEC] no command to execute!")
        command += (payload.options) ? (" " + payload.options) : ""
        exec (command, (e,so,se)=> {
          logGA("command:", command)
          if (e) {
            console.log("[GA] [SHELL_EXEC] Error:" + e)
            this.sendSocketNotification("WARNING", { message: "ShellExecError"} )
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
        break
      case "GOOGLESEARCH":
        this.searchOnGoogle.search(this, payload)
        break
      case "HELLO":
        if (!this.lib.EXTTools) {
          // library is not loaded ... retry
          setTimeout(() => { this.socketNotificationReceived("HELLO", payload) }, 1000)
          return
        }
        this.lib.EXTTools.setActiveVersion(payload, this)
        break
      case "RESTART":
        this.lib.EXTTools.restartMM(this)
        break
      case "CLOSE":
        this.lib.EXTTools.doClose(this)
        break
      case "EXTStatus":
        if (this.EXT.initialized && payload) {
          this.EXT.EXTStatus = payload
          if (this.SmartHome.use && this.SmartHome.init) {
              this.lib.Device.refreshData(this)
              this.lib.homegraph.updateGraph(this)
          }
        }
        break
      case "TB_SYSINFO":
        let result = await this.EXT.systemInformation.lib.Get()
        result.sessionId = payload
        this.sendSocketNotification("TB_SYSINFO-RESULT", result)
        break
      case "GET-SYSINFO":
        this.sendSocketNotification("SYSINFO-RESULT", await this.EXT.systemInformation.lib.Get())
        break
    }
  }
})
