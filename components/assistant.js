const GoogleAssistant = require("@bugsounet/google-assistant")
const B2M = require("@bugsounet/node-buffertomp3")
const Record = require("@bugsounet/node-lpcm16")

const path = require("path")
const fs = require("fs")

var _log = function() {
    var context = "[GA:AS]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class ASSISTANT {
  constructor(config, tunnel = ()=>{}) {
    var debug = (config.debug) ? config.debug : false
    if (debug == true) log = _log
    this.modulePath = config.modulePath
    this.micConfig = config.micConfig
    this.assistantConfig = {
      auth:{
        keyFilePath : path.resolve(config.modulePath, "credentials.json"),
        savedTokensPath : path.resolve(config.modulePath, "tokenGA.json")
      },
      conversationConfig : {
        audio : {
          encodingIn: "LINEAR16",
          sampleRateIn: 16000,
          encodingOut: "MP3",
          sampleRateOut: 24000
        },
        deviceLocation : {
          coordinates: {
            latitude: config.latitude,
            longitude: config.longitude
          }
        },
        screen : {
          isOn: true
        },
        lang: config.lang
      },
    }
    if (config.deviceRegistred) {
      try {
        this.projectId = require("../credentials.json").installed.project_id
      } catch (e) {
        console.error("[GA:AS] project_id not found on credentials.json")
      }

      if (this.projectId) {
        this.assistantConfig.conversationConfig.deviceModelId = this.projectId+"-bugsounet_GA"
        this.assistantConfig.conversationConfig.deviceId = "MMM-GoogleAssistant"
        log("Used project_id:", this.projectId)
        log("deviceModelId is:", this.assistantConfig.conversationConfig.deviceModelId)
        log("deviceId is", this.assistantConfig.conversationConfig.deviceId)
      }
    }
    this.debug = debug
    this.micMode = false
    this.tunnel = tunnel
    this.mic = null
  }

  activate (payload, callback=()=>{}) {
    var converse = null
    var type = payload.type

    if (type == "TEXT") {
      this.assistantConfig.conversationConfig.textQuery = payload.key
    }
    if (type == "MIC") this.micMode = true
    converse = (conversation) => {
      this.initConversation(payload, conversation, callback)
    }
    this.start(converse)
  }

  start (conversation) {
    this.assistant = new GoogleAssistant(this.assistantConfig.auth)
    this.assistant
    .on('ready', () => {
      this.assistant.start(this.assistantConfig.conversationConfig)
    })
    .on('started', conversation)
    .on('error', (error) => {
      conversation.end()
    })
  }

  initConversation (originalPayload, conversation, endCallback=(response)=>{}) {
    this.response = {
      error: {
        error: null,
        message: null,
        audio: false
      },
      action: null,
      text: null, // text response
      screen: null, // html response
      audio: null, // audio response
      transcription: null, // {transcription:String, done:Boolean} or null
      continue: false,
      volume: null
    }

    var responseFile = "tmp/lastResponse.mp3"
    var filePath = path.resolve(this.modulePath, responseFile)

    var b2m = new B2M ({debug:this.debug, file:filePath})
    this.mic = null
    if (this.micMode) {
      var defaultOption = {
        device: null,
        recorder: "sox",
        threshold: 0,
        sampleRate: 16000,
        verbose: false,
        debug: this.debug
      }

      this.mic = new Record(Object.assign({}, defaultOption, this.micConfig),conversation, (err)=>{ this.afterListening(err) })
      log("MIC:RECORDING START.")
      this.mic.start()
    }

    conversation
    .on('volume-percent', (percent) => {
      log("CONVERSATION:VOLUME", percent)
      this.response.volume = percent
    })
    .on('end-of-utterance', () => {
      log("CONVERSATION:END_OF_UTTERANCE")
      if (this.micMode && this.mic) {
        this.stopListening()
      }
    })
    .on('transcription', (data) => {
      log("CONVERSATION:TRANSCRIPTION", data)
      this.tunnel({type: "TRANSCRIPTION", payload:data})
      this.response.transcription = data
    })
    .on('device-action', (action) => {
      log("CONVERSATION:ACTION", action)
      this.response.action = Object.assign({}, this.response.action, action)
    })
    .on('response', (text) => {
      log("CONVERSATION:RESPONSE", text)
      if (text) this.response.text = text
    })
    .on('screen-data', (screen) => {
      log("CONVERSATION:SCREEN", typeof screen)
      this.response.screen = {
        originalContent: screen.data.toString("utf8")
      }
    })
    .on('audio-data', (data) => {
      log("CONVERSATION:AUDIO", data.length)
      if(data.length) b2m.add(data)
    })
    .on('ended', (error, continueConversation) => {
      log("CONVERSATION_ALL_RESPONSES_RECEIVED")
      if (error) {
        log('CONVERSATION_END:ERROR', error)
        this.response.error.error = error
      } else if (continueConversation) {
        log("CONVERSATION_END:CONTINUED")
        this.response.continue = true
      } else {
        log('CONVERSATION_END:COMPLETED')
        this.response.continue = false
      }
      if (originalPayload.type == "TEXT" && !this.response.transcription) {
        this.response.transcription = {transcription: originalPayload.key, done: true}
      }

      if (b2m.getAudioLength() > 50) {
        log("CONVERSATION_PP:RESPONSE_AUDIO_PROCESSED")
        this.response.audio = {
          path: filePath,
          uri : responseFile,
        }
      } else {
        log("CONVERSATION_PP:RESPONSE_AUDIO_TOO_SHORT_OR_EMPTY - ", b2m.getAudioLength())
        this.response.error.audio = true
      }
      b2m.close()

      endCallback(this.response)
    })
    .on('error', (error) => {
      b2m.close()
      console.log("[GA:AS] CONVERSATION_ERROR: " + error)
      this.response.error.error = "CONVERSATION_ERROR"
      this.response.error.message = error.toString()
      if (error.code == "14") {
        console.log("[GA:AS] >> This error might happen when improper configuration or invalid Mic setup.")
      }
      this.stopListening()
      conversation.end()
    })
    if (originalPayload.key && originalPayload.type == "WAVEFILE") {
      var s = fs.createReadStream(originalPayload.key, {highWaterMark:4096}).pipe(conversation)
    }
    if (originalPayload.type == "TEXT") {
      this.tunnel({type: "TRANSCRIPTION", payload:{transcription:originalPayload.key, done:true}})
    }
  }
  stopListening () {
    if (!this.mic) return
    log("MIC:RECORDING_END")
    this.mic.stop()
    this.mic = null
  }

  afterListening (err) {
    if (err) {
     console.log("[GA:AS][ERROR] " + err)
     this.stopListening()
     return
    }
    this.stopListening()
  }
}

module.exports = ASSISTANT
