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

  socketNotificationReceived: function (noti, payload) {
    switch (noti) {
      case "INIT":
        this.config = payload
        console.log("[GA] MMM-GoogleAssistant Version:", require('./package.json').version, "rev:", require('./package.json').rev)
        this.config.assistantConfig["modulePath"] = __dirname
        parseData.parse(this)
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
    }
  }
})
