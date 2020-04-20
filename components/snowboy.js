/** Snowboy library **/
/** bugsounet       **/
/** 2020-04-19      **/

const path = require("path")
const Detector = require("../snowboy/lib/node/index.js").Detector
const Models = require("../snowboy/lib/node/index.js").Models
const Recorder = require("../components/lpcm16.js")

var snowboyDict = {
  "smart_mirror": {
    hotwords: "smart_mirror",
    file: "smart_mirror.umdl",
    sensitivity: "0.5",
  },
  "computer": {
    hotwords: "computer",
    file: "computer.umdl",
    sensitivity: "0.6",
  },
  "snowboy": {
    hotwords: "snowboy",
    file: "snowboy.umdl",
    sensitivity: "0.5",
  },
  "jarvis": {
    hotwords: ["jarvis", "jarvis"],
    file: "jarvis.umdl",
    sensitivity: "0.7,0.7",
  },
  "subex": {
    hotwords: "subex",
    file: "subex.umdl",
    sensitivity: "0.6",
  },
  "neo_ya": {
    hotwords: ["neo_ya", "neo_ya"],
    file: "neoya.umdl",
    sensitivity: "0.7,0.7",
  },
  "hey_extreme": {
    hotwords: "hey_extreme",
    file: "hey_extreme.umdl",
    sensitivity: "0.6",
  },
  "view_glass": {
    hotwords: "view_glass",
    file: "view_glass.umdl",
    sensitivity: "0.7",
  },
  "alexa": {
    hotwords: "alexa",
    file: "alexa.umdl",
    sensitivity: "0.6"
  }
}

var _log = function() {
    var context = "[ASSISTANT:SNOWBOY]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class SNOWBOY {
  constructor(config, mic, callback = ()=>{}, debug) {
    this.micConfig = mic
    this.config = config
    this.callback = callback
    this.model = []
    this.models = []
    this.mic = null
    this.detector = null
    if (debug == true) log = _log
    this.debug = debug

    this.defaultConfig = {
      audioGain: 2.0,
      Frontend: true,
      Model: "jarvis",
      Sensitivity: null
    }
    this.config = Object.assign(this.defaultConfig, this.config)

    this.defaultMicOption = {
      recorder: "arecord",
      device: "plughw:1",
      sampleRate: 16000,
      channels: 1,
      threshold: 0.5,
      thresholdStart: null,
      thresholdEnd: null,
      silence: '1.0',
      verbose: this.debug
    }
    this.recorderOptions = Object.assign({}, this.defaultMicOption, this.micConfig)
  }

  init () {
    var modelPath = path.resolve(__dirname, "../snowboy/resources/models")
    this.models = new Models();
    log("Checking models")

    if (this.config.Model) {
      for (let [item, value] of Object.entries(snowboyDict)) {
        if (this.config.Model == item) {
          log("Model selected:", item)
          if (this.config.Sensitivity) {
             if ((isNaN(this.config.Sensitivity)) || (Math.ceil(this.config.Sensitivity) > 1)) {
               log("Wrong Sensitivity value.")
             } else {
              if (item == ("jarvis" || "neo_ya")) {
                value.sensitivity = this.config.Sensitivity + "," + this.config.Sensitivity
              }
              else value.sensitivity = this.config.Sensitivity
            }
          }
          log("Sensitivity set:", value.sensitivity)
          this.model.push(value)
        }
      }
    }

    if (this.model.length == 0) return console.log("[SNOWBOY][ERROR] model not found:", this.config.Model)
    this.model.forEach((model)=>{
      this.model[0].file = path.resolve(modelPath, this.config.Model + ".umdl")
      this.models.add(this.model[0])
    })
    log("snowboy v" + require('../snowboy/package.json').version + " Initialized...")
  }

  start () {
    this.detector = new Detector({
      resource: path.resolve(__dirname, "../snowboy/resources/common.res"),
      models: this.models,
      audioGain: this.config.audioGain,
      applyFrontend: this.config.Frontend
    })

    this.detector
      .on("error", (err)=>{
        this.error(err)
        return
      })
      .on("hotword", (index, hotword, buffer)=>{
        log("Detected:", hotword)
        this.stopListening()
        this.callback(hotword)
        return
      })

    this.startListening()
  }

  stop () {
    this.stopListening()
  }

/** secondary code **/

  error (err,code) {
    if (err || (code == "1")) {
     if (err) console.log("[ASSISTANT:SNOWBOY][ERROR] " + err)
     this.stop()
     console.log("[ASSISTANT:SNOWBOY] Retry restarting...")
     setTimeout(() => { this.start() },2000)
     return
    }
  }

  startListening () {
    if (this.mic) return
    this.mic = null
    this.mic = new Recorder(this.recorderOptions, this.detector, (err,code)=>{this.error(err,code)})
    log("Starts listening.")
    this.mic.start()
  }

  stopListening () {
    if (!this.mic) return
    this.mic.stop()
    this.mic = null
    log("Stops listening.")
  }
}

module.exports = SNOWBOY
