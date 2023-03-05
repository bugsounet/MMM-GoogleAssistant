"use strict"

/** parse data from MagicMirror **/
var _load = require("../components/loadLibraries.js")

async function init(that) {
  that.lib = { error: 0 }
  that.config = {}
  that.blank = {}
  that.PLATFORM_RECORDER = new Map()
  that.PLATFORM_RECORDER.set("linux", "arecord")
  that.PLATFORM_RECORDER.set("mac", "sox")
  that.PLATFORM_RECORDER.set("raspberry-pi", "arecord")
  that.PLATFORM_RECORDER.set("windows", "sox")
}

async function parse(that) {
  let bugsounet = await _load.libraries(that)
  if (bugsounet) {
    console.error("[GA] [DATA] Warning:", bugsounet, "needed library not loaded !")
    return
  }
  that.lib.configMerge.check(that)
  var error = null

  let Version = {
    version: require('../package.json').version,
    rev: require('../package.json').rev,
    lang: that.config.assistantConfig.lang
  }

  if (!that.lib.fs.existsSync(that.config.assistantConfig["modulePath"] + "/credentials.json")) {
    error = "[FATAL] Assistant: credentials.json file not found !"
    return this.error(that, error, {message: "GAErrorCredentials"})
  }
  else if (!that.lib.fs.existsSync(that.config.assistantConfig["modulePath"] + "/tokenGA.json")) {
    error = "[FATAL] Assistant: tokenGA.json file not found !"
    return this.error(that, error, {message: "GAErrorTokenGA"})
  }

  let platform
  try {
    platform = that.lib.platform.getPlatform()
  } catch (error) {
    console.error("[GA] [DATA] Google Assistant does not support this platform. Supported platforms include macOS (x86_64), Windows (x86_64), Linux (x86_64), and Raspberry Pi")
    process.exit(1)
    return
  }
  let recorderType = that.PLATFORM_RECORDER.get(platform)
  console.log(`[GA] [DATA] Platform: '${platform}'; attempting to use '${recorderType}' to access microphone ...`)
  that.config.micConfig.recorder= recorderType

  that.lib.recipes.load(that, ()=> that.sendSocketNotification("INITIALIZED", Version))
  console.log("[GA] [DATA] Google Assistant is initialized.")
}

function error(that, err, error, details = null) {
  if (details) console.log("[GA] [DATA] [ERROR]" + err, details.message, details)
  else console.log("[GA] [DATA] [ERROR]" + err)
  return that.sendSocketNotification("NOT_INITIALIZED", { message: error.message, values: error.values })
}

exports.init = init
exports.parse = parse
exports.error = error
