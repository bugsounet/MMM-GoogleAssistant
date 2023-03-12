"use strict"

var logGA = (...args) => { /* do nothing */ }

class ASSISTANT {
  constructor(lib, config, tunnel = ()=>{}) {
    this.lib = lib
    var debug = (config.debug) ? config.debug : false
    if (debug == true) logGA = (...args) => { console.log("[GA] [ASSISTANT]", ...args) }
    this.modulePath = config.modulePath
    this.micConfig = config.micConfig
    this.assistantConfig = {
      auth:{
        keyFilePath : this.lib.path.resolve(config.modulePath, "credentials.json"),
        savedTokensPath : this.lib.path.resolve(config.modulePath, "tokenGA.json")
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
        lang: config.lang,
        isNew: true
      }
    }
    if (config.deviceRegistred) {
      try {
        let credentials = require("../credentials.json")
        let key = credentials.installed || credentials.web
        this.projectId = key.project_id
      } catch (e) {
        console.error("[GA] [ASSISTANT] project_id not found on credentials.json")
      }

      if (this.projectId) {
        this.assistantConfig.conversationConfig.deviceModelId = this.projectId+"-bugsounet_GA"
        this.assistantConfig.conversationConfig.deviceId = "MMM-GoogleAssistant"
        logGA("Used project_id:", this.projectId)
        logGA("deviceModelId is:", this.assistantConfig.conversationConfig.deviceModelId)
        logGA("deviceId is", this.assistantConfig.conversationConfig.deviceId)
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
    if (payload.isNew == false) this.assistantConfig.conversationConfig.isNew = false

    converse = (conversation) => {
      this.initConversation(payload, conversation, callback)
    }
    this.start(converse)
  }

  start (conversation) {
    this.assistant = new this.lib.GoogleAssistant(this.assistantConfig.auth)
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
    var filePath = this.lib.path.resolve(this.modulePath, responseFile)

    var b2m = new this.lib.BufferToMP3 ({debug:this.debug, file:filePath})
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

      this.mic = new this.lib.Recorder(Object.assign({}, defaultOption, this.micConfig),conversation, (err)=>{ this.afterListening(err) })
      logGA("MIC:RECORDING START.")
      this.mic.start()
    }

    conversation
    .on('volume-percent', (percent) => {
      logGA("CONVERSATION:VOLUME", percent)
      this.response.volume = percent
    })
    .on('end-of-utterance', () => {
      logGA("CONVERSATION:END_OF_UTTERANCE")
      if (this.micMode && this.mic) {
        this.stopListening()
      }
    })
    .on('transcription', (data) => {
      logGA("CONVERSATION:TRANSCRIPTION", data)
      this.tunnel({type: "TRANSCRIPTION", payload:data})
      this.response.transcription = data
    })
    .on('device-action', (action) => {
      logGA("CONVERSATION:ACTION", action)
      this.response.action = Object.assign({}, this.response.action, action)
    })
    .on('response', (text) => {
      logGA("CONVERSATION:RESPONSE", text)
      if (text) this.response.text = text
    })
    .on('screen-data', (screen) => {
      logGA("CONVERSATION:SCREEN", typeof screen)
      this.response.screen = {
        originalContent: screen.data.toString("utf8")
      }
    })
    .on('audio-data', (data) => {
      logGA("CONVERSATION:AUDIO", data.length)
      if(data.length) b2m.add(data)
    })
    .on('ended', (error, continueConversation) => {
      logGA("CONVERSATION_ALL_RESPONSES_RECEIVED")
      if (error) {
        logGA('CONVERSATION_END:ERROR', error)
        this.response.error.error = error
      } else if (continueConversation) {
        logGA("CONVERSATION_END:CONTINUED")
        this.response.continue = true
      } else {
        logGA('CONVERSATION_END:COMPLETED')
        this.response.continue = false
      }
      if (originalPayload.type == "TEXT" && !this.response.transcription) {
        this.response.transcription = {transcription: originalPayload.key, done: true}
      }

      if (b2m.getAudioLength() > 50) {
        logGA("CONVERSATION_PP:RESPONSE_AUDIO_PROCESSED")
        this.response.audio = {
          path: filePath,
          uri : responseFile,
        }
      } else {
        logGA("CONVERSATION_PP:RESPONSE_AUDIO_TOO_SHORT_OR_EMPTY - ", b2m.getAudioLength())
        this.response.error.audio = true
      }
      b2m.close()

      endCallback(this.response)
    })
    .on('error', (error) => {
      b2m.close()
      console.log("[GA] [ASSISTANT] CONVERSATION_ERROR: " + error)
      this.response.error.error = "CONVERSATION_ERROR"
      this.response.error.message = error.toString()
      if (error.code == "14") {
        console.log("[GA] [ASSISTANT] >> This error might happen when improper configuration or invalid Mic setup.")
      }
      this.stopListening()
      conversation.end()
    })
    if (originalPayload.key && originalPayload.type == "WAVEFILE") {
      var s = this.lib.fs.createReadStream(originalPayload.key, {highWaterMark:4096}).pipe(conversation)
    }
    if (originalPayload.type == "TEXT") {
      this.tunnel({type: "TRANSCRIPTION", payload:{transcription:originalPayload.key, done:true}})
    }
  }
  stopListening () {
    if (!this.mic) return
    logGA("MIC:RECORDING_END")
    this.mic.stop()
    this.mic = null
  }

  afterListening (err) {
    if (err) {
     console.log("[GA] [ASSISTANT] ERROR] " + err)
     this.stopListening()
     return
    }
    this.stopListening()
  }
}

module.exports = ASSISTANT
