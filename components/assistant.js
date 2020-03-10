const GoogleAssistant = require("google-assistant")
const B2M = require("./bufferToMP3.js")
const Record = require("./lpcm16.js")

const path = require("path")
const fs = require("fs")

var _log = function() {
    var context = "[ASSISTANT:AS]"
    return Function.prototype.bind.call(console.log, console, context)
}()

var log = function() {
  //do nothing
}

class ASSISTANT {
  constructor(config) {
    var debug = (config.debug) ? config.debug : false
    this.modulePath = config.modulePath
    this.micConfig = config.micConfig

    this.assistantConfig = {
      auth:{
        keyFilePath : path.resolve(config.modulePath, "credentials.json"),
        savedTokensPath : path.resolve(config.modulePath, "token.json")
      },
      conversationConfig : {
        audio : {
          encodingIn: "LINEAR16",
          sampleRateIn: 16000,
          encodingOut: "MP3",
          sampleRateOut: 24000,
        },
        deviceLocation : {
          coordinates: {
            latitude: config.latitude,
            longitude: config.longitude
          }
        },
        lang: config.lang
      },
    }
    if (debug == true) log = _log
    this.debug = debug
    this.micMode = false
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
      error: null,
      audio: null,
      transcription: null,
      continue: false,
    }

    var responseFile = "tmp/response.mp3"
    var filePath = path.resolve(this.modulePath, responseFile)

    var b2m = new B2M ({debug:this.debug, file:filePath})
    this.mic = null
    if (this.micMode) {
      var defaultOption = {
        device: null,
        recorder: "sox",
        threshold: 0.5,
        sampleRate: 16000,
        verbose: false,
        debug: this.debug
      }

      this.mic = new Record(Object.assign({}, defaultOption, this.micConfig),conversation, (err)=>{ this.afterListening(err) })
      log("MIC:RECORDING START.")
      this.mic.start()
    }

    conversation
    .on('end-of-utterance', () => {
      log("CONVERSATION:END_OF_UTTERANCE")
      if (this.micMode && this.mic) {
        this.stopListening()
      }
    })
    .on('transcription', (data) => {
      log("CONVERSATION:TRANSCRIPTION", data)
      this.response.transcription = data
    })
    .on('audio-data', (data) => {
      log("CONVERSATION:AUDIO", data.length)
      if(data.length) b2m.add(data)
    })
    .on('ended', (error, continueConversation) => {
      log("CONVERSATION_ALL_RESPONSES_RECEIVED")
      if (error) {
        log('CONVERSATION_END:ERROR', error)
        this.response.error = error
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
        this.response.error = "TOO_SHORT"
      }
      b2m.close()
      endCallback(this.response)
    })
    .on('error', (error) => {
      b2m.close()
      log("CONVERSATION_ERROR: " + error)
      this.response.error = "CONVERSATION_ERROR"
      if (error.code == "14") {
        log (">> This error might happen when improper configuration or invalid Mic setup.")
      }
      this.stopListening()
      conversation.end()
      endCallback(this.response)
    })
  }
  stopListening () {
    if (!this.mic) return
    log("MIC:RECORDING_END")
    this.mic.stop()
    this.mic = null
  }

  afterListening (err) {
	  if (err) {
     log("[ERROR] " + err)
     this.stopListening()
     return
    }
    this.stopListening()
  }
}

module.exports = ASSISTANT
