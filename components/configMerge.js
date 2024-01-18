"use strict"

function check (that) {
  console.log("[GA] [CONFIG_MERGE] Read config.js and check ConfigDeepMerge...")
  let file = that.lib.path.resolve(__dirname, "../../../config/config.js")
  let GAPath = that.lib.path.resolve(__dirname, "../")
  let MMConfig
  return new Promise(resolve => {
    if (that.lib.fs.existsSync(file)) MMConfig = require(file)
    else {
      console.error("[GA] [FATAL] MagicMirror config not found!")
      process.exit(1)
    }
    let configModule = MMConfig.modules.find(m => m.module == "MMM-GoogleAssistant")
    if (!configModule.configDeepMerge) {
      console.error("[FATAL] MMM-GoogleAssistant Module Configuration Error: ConfigDeepMerge is not actived !")
      console.error("[GA] [CONFIG_MERGE] Please review your MagicMirror config.js file!")
      process.exit(1)
    }
    console.log("[GA] [CONFIG_MERGE] Perfect ConfigDeepMerge activated!")
    console.log("[GA] [SECURE] Check digital footprint...")
    that.lib.childProcess.exec ("cd " + GAPath + " && git config --get remote.origin.url", (e,so,se)=> {
      if (e) {
        console.log("[GA] [SECURE] Unknow error!")
        process.exit(1)
      }
      let output = new RegExp("bugs")
      if (!output.test(so)) {
        that.lib.fs.rm(GAPath, { recursive: true, force: true }, () => {
          console.warn("[GA] [SECURE] Open your fridge, take a beer and try again...")
          process.exit(1)
        })
      } else {
        console.log("[GA] [SECURE] Happy use !")
        resolve()
      }
    })
  })
}

exports.check = check
