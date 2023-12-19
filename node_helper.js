//
// Module : MMM-GoogleAssistant
//

var parseData = require("./components/parseData.js")
logGA = (...args) => { /* do nothing */ }

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
        this.lib.shellExec.exec(this, payload)
        break
      case "GOOGLESEARCH":
        this.lib.searchOnGoogle.search(this, payload)
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
          if (this.SmartHome.use) {
            if (this.SmartHome.init) {
              this.lib.Device.refreshData(this)
              this.lib.homegraph.updateGraph(this)
            }
          }
        }
        break
      case "TB_SYSINFO":
        console.log("TB_SYSINFO")
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
