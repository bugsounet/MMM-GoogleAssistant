"use strict"
var logGA = (...args) => { /* do nothing */ }
const AssistantSDK = require("./AssistantSDK.js")
const BufferToMP3 = require("./BufferToMP3")
const Recorder = require("./lpcm16")
const path = require("path")
const fs = require("fs")
const HTMLParser = require("node-html-parser")
const Entities = require('html-entities')
const cheerio = require( "cheerio")

class ASSISTANT {
  constructor(config, tunnel = ()=>{}) {
    var debug = (config.debug) ? config.debug : false
    if (debug == true) logGA = (...args) => { console.log("[GA] [ASSISTANT]", ...args) }
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
    this.assistant = new AssistantSDK(this.assistantConfig.auth)
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

    var b2m = new BufferToMP3 ({debug:this.debug, file:filePath})
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

      this.mic = new Recorder(Object.assign({}, defaultOption, this.micConfig),conversation, (err)=>{ this.afterListening(err) })
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
    logGA("MIC:RECORDING_END")
    this.mic.stop()
    this.mic = null
  }

  afterListening (err) {
    if (err) console.log("[GA] [ASSISTANT] ERROR] " + err)
    this.stopListening()
  }
}

class SCREENPARSER {
  constructor(config, debug) {
    this.config = config
    if (debug == true) logGA = (...args) => { console.log("[GA] [SCREEN_PARSER]", ...args) }
  }

  parse(response, endCallback=()=>{}) {
    if (response.screen) {
      var uri = this.config.responseOutputURI
      var filePath = path.resolve(__dirname, "..", uri)
      if (!response.screen.originalContent) return
      var str = response.screen.originalContent.toString("utf8")
      var disableTimeoutFromScreenOutput = (str) => {
        return str.replace(/document\.body,"display","none"/gim,(x)=>{
          return `document.body,"display","block"`
        })
      }
      str = disableTimeoutFromScreenOutput(str)
      str = str.replace("html", 'html style="zoom:' + this.config.responseOutputZoom + '"')

      var url = "/modules/MMM-GoogleAssistant/" + this.config.responseOutputCSS + "?seed=" + Date.now()
      str = str.replace(/<style>html,body[^<]+<\/style>/gmi, `<link rel="stylesheet" href="${url}">`)

      var ret = HTMLParser.parse(response.screen.originalContent)
      var dom = ret.querySelector(".popout-content")
      response.screen.text = dom ? dom.structuredText : null
      response.text= dom && dom.querySelector(".show_text_content") ? dom.querySelector(".show_text_content").structuredText : null
      response.screen = this.parseScreenLink(response.screen)
      response.screen.photos = []
      var photos = ret.querySelectorAll(".photo_tv_image")
      if (photos) {
        for (var i=0; i < photos.length; i++) {
          response.screen.photos.push(photos[i].attributes["data-image-url"])
        }
      }

      var contents = fs.writeFile(filePath, str, (error) => {
        if (error) {
          console.error("[GA] [SCREEN_PARSER] SCREENOUTPUT_CREATION_ERROR", error)
          endCallback(error)
        } else {
          response.screen.path = filePath
          response.screen.uri = uri
          logGA("SCREEN_OUTPUT_CREATED")
          endCallback(response)
        }
      })
    }
  }

  parseScreenLink(screen) {
    var decode = Entities.decode
    var html = screen.originalContent
    screen.links = []
    var links = [
      /data-url=\"([^\"]+)\"/gmi,
      / (http[s]?\:\/\/[^ \)]+)[ ]?\)/gmi,
      /\: (http[s]?\:\/\/[^ <]+)/gmi,
    ]
    var r = null
    var res = []
    for (var i = 0; i < links.length; i++) {
      var link = links[i]
      while ((r = link.exec(html)) !== null) {
        res.push(decode(r[1]))
      }
    }
    screen.links = res
    logGA("[LINKS] Found:", screen.links.length)
    return screen
  }
}

class GoogleSearch {
  constructor() {
    this.defaultUserAgent = "Mozilla/5.0 (Linux x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 MMM-GoogleAssistant/"+require('../package.json').version;

    this.defaultLimit = 5
    this.defaultStart = 0
    this.linkSelector = 'div.fP1Qef > div:nth-child(1) > a'

    this.parseGoogleSearchResultUrl = (url) => {
      if (!url) return undefined
      if (url.charAt(0) === '/') {
        const searchURL= new URLSearchParams(url);
        return searchURL.get("url")
      }
      return url
    }
  }

  getResults({ data }) {
    const $ = cheerio.load(data)
    let results = []

    $(this.linkSelector).map((index, elem) => {
      const link = this.parseGoogleSearchResultUrl(elem.attribs.href)
      if (link.startsWith('http://www.google.com') || link.startsWith('https://www.google.com')) return
      results.push({ link: link })
    })

    return { results }
  }

  getResponse({ query }) {
    return new Promise((resolve, reject) => {
      const params = new URLSearchParams({ q: query, num: this.defaultLimit, start: this.defaultStart })
      fetch(`https://www.google.com/search?${params}`,
        {
          "headers": {
            'User-Agent': this.defaultUserAgent,
          }
        })
        .then(async response => {
          const body = await response.text()
          const status = response.status
          return resolve({ body, status })
        })
        .catch((error) => reject(new Error(`[GA] [GoogleSearch] Error making web request:`, error)))
    })
  }

  googleIt(config) {
    return new Promise((resolve, reject) => {
      this.getResponse(config).then(({ body, status }) => {
        const { results } = this.getResults({ data: body })
        if (results.length === 0 && status !== 200) reject(new Error(`[GA] [GoogleSearch] Error in response: status ${status}.`))
        return resolve(results)
      }).catch(reject)
    })
  }

  search (that, text) {
    if (!text) return
    if (that.config.debug) logGA = (...args) => { console.log("[GA] [GoogleSearch]", ...args) }
    var finalResult = []
    this.googleIt({ query: text })
      .then(results => {
        if (results && results.length) {
          results.forEach(link => {
            logGA("Link:", link.link)
            finalResult.push(link.link)
          })

          if (finalResult.length) {
            logGA("Results:",finalResult)
            that.sendSocketNotification("GOOGLESEARCH-RESULT", finalResult[0])
          } else {
            logGA("No Results found!")
            that.sendSocketNotification("ERROR", "[GoogleSearch] No Results found!")
          }
        } else {
          logGA("No Results found!")
          that.sendSocketNotification("ERROR", "[GoogleSearch] No Results found!")
        }
      })
      .catch(e => {
        console.error("[GA] [GOOGLE_SEARCH] [ERROR] " + e)
        that.sendSocketNotification("ERROR", "[GoogleSearch] Sorry, an error occurred!")
      })
  }
};

module.exports = {
  ASSISTANT: ASSISTANT,
  SCREENPARSER: SCREENPARSER,
  GOOGLESEARCH: GoogleSearch
}
