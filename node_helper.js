//
// Module : MMM-GoogleAssistant
//

var parseData = require("./components/parseData.js")
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
        if (this.website) return
        this.alreadyInitialized = true
        this.config = payload
        console.log("[GA] MMM-GoogleAssistant Version:", require('./package.json').version, "rev:", require('./package.json').rev)
        this.config.assistantConfig["modulePath"] = __dirname
        parseData.parse(this)
        break
      case "INIT":
        this.website.init(payload)
        break
      case "ACTIVATE_ASSISTANT":
        this.lib.activateAssistant.activate(this, payload)
        break
      case "SHELLEXEC":
        this.lib.GATools.shellExec(this, payload)
        break
      case "GOOGLESEARCH":
        this.searchOnGoogle.search(this, payload)
        break
      case "HELLO":
        if (!this.website) {
          // library is not loaded ... retry
          setTimeout(() => { this.socketNotificationReceived("HELLO", payload) }, 1000)
          return
        }
        this.website.setActiveVersion(payload)
        break
      case "RESTART":
        this.website.restartMM()
        break
      case "CLOSE":
        this.website.doClose()
        break
      case "EXTStatus":
        this.website.setEXTStatus(payload)
        break
      case "TB_SYSINFO":
        let result = await this.website.website.systemInformation.lib.Get()
        result.sessionId = payload
        this.sendSocketNotification("TB_SYSINFO-RESULT", result)
        break
      case "GET-SYSINFO":
        this.sendSocketNotification("SYSINFO-RESULT", await this.website.website.systemInformation.lib.Get())
        break
    }
  }
})
