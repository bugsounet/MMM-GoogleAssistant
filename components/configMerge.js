"use strict"

function check (that) {
  console.log("[GA] [CONFIG_MERGE] Read config.js and check ConfigDeepMerge...")
  let file = that.lib.path.resolve(__dirname, "../../../config/config.js")
  let MMConfig
  if (that.lib.fs.existsSync(file)) MMConfig = require(file)
  let configModule = MMConfig.modules.find(m => m.module == "MMM-GoogleAssistant")
  if (!configModule.configDeepMerge) {
    console.error("[FATAL] MMM-GoogleAssistant Module Configuration Error: ConfigDeepMerge is not actived !")
    console.error("[GA] [CONFIG_MERGE] Please review your MagicMirror config.js file!")
    process.exit(1)
  }
  console.log("[GA] [CONFIG_MERGE] Perfect ConfigDeepMerge activated!")
  if (configModule.dev) {
    that.blank.dev= true
    console.log("[GA] [CONFIG_MERGE] Hi, developer!")
  }
/*
  else {
    console.error("[FATAL] Please use `prod` branch for MMM-GoogleAssistant")
    console.error("[GA] [CONFIG_MERGE] You can't use this branch, it's reserved to developers.")
    process.exit(255)
  }
*/
}

exports.check = check
