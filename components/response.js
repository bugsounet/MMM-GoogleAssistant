/* Common GA Class */

class AssistantResponse {
  constructor (responseConfig, callbacks) {
    this.config = responseConfig
    this.callbacks = callbacks
    this.newChime = responseConfig.newChime
    this.showing = false
    this.response = null
    this.aliveTimer = null
    this.allStatus = [ "hook", "standby", "reply", "error", "think", "continue", "listen", "confirmation" ]
    this.myStatus = { "actual" : "standby" , "old" : "standby" }
    this.loopCount = 0
    this.chime = {
      beep: "beep.mp3",
      error: "error.mp3",
      continue: "continue.mp3",
      success: "success.mp3",
      open: "Google_beep_open.mp3",
      close: "Google_beep_close.mp3",
    }
    
    this.imgStatus = {
      "hook": "/modules/MMM-GoogleAssistant/resources/hook.gif",
      "standby": "/modules/MMM-GoogleAssistant/resources/standby.gif",
      "reply": "/modules/MMM-GoogleAssistant/resources/reply.gif",
      "error": "/modules/MMM-GoogleAssistant/resources/error.gif",
      "think": "/modules/MMM-GoogleAssistant/resources/think.gif",
      "continue": "/modules/MMM-GoogleAssistant/resources/continue.gif",
      "listen": "/modules/MMM-GoogleAssistant/resources/listen.gif",
      "confirmation": "/modules/MMM-GoogleAssistant/resources/confirmation.gif"
    }

    if (!this.config.useNative) {
      this.audioResponse = new Audio()
      this.audioResponse.autoplay = true
      this.audioResponse.addEventListener("ended", ()=>{
        log("audio end")
        this.end()
      })

      this.audioChime = new Audio()
      this.audioChime.autoplay = true
    }
    this.fullscreenAbove = false
  }

  tunnel (payload) {
    if (payload.type == "TRANSCRIPTION") {
      var startTranscription = false
      if (payload.payload.done) {
        this.status("confirmation")
        var iframe = document.getElementById("GA_SCREENOUTPUT")
        iframe.src = "about:blank"
      }
      if (payload.payload.transcription && !startTranscription) {
        this.showTranscription(payload.payload.transcription)
        startTranscription = true
      }
    }
  }

  doCommand (commandName, param, from) {
    // do nothing currently.
  }

  playChime (sound, external) {
    if (this.config.useChime) {
      if (this.config.useNative) this.callbacks.sendSocketNotification("PLAY_CHIME", "resources/" + (external ? sound : this.chime[sound]))
      else this.audioChime.src = "modules/MMM-GoogleAssistant/resources/" + (external ? sound : this.chime[sound])
    }
  }

  status (status, beep) {
    
    this.myStatus.actual = status
    var Status = document.getElementById("GA_STATUS")
    if (beep && this.myStatus.old != "continue") this.playChime("beep")
    if (status == "error" || status == "continue") this.playChime(status)
    if (status == "confirmation") this.playChime("success")
    if (status == "WAVEFILE" || status == "TEXT") this.myStatus.actual = "think"
    if (status == "MIC") this.myStatus.actual = (this.myStatus.old == "continue") ? "continue" : "listen"
    if (this.myStatus.actual == this.myStatus.old) return
    this.callbacks.myStatus(this.myStatus) // send status external
    this.callbacks.sendNotification("ASSISTANT_" + this.myStatus.actual.toUpperCase())
    log("Status from " + this.myStatus.old + " to " + this.myStatus.actual)
    Status.src = (this.myStatus.old == "hook") ? this.imgStatus["hook"] : this.imgStatus[this.myStatus.actual]
    //if(this.fullscreenAbove) Status.classList.add("fullscreen_above")
    this.myStatus.old = this.myStatus.actual
    
  }

  prepare () {

    var GA = document.createElement("div")
    GA.id = "GA"
    GA.className= "hidden out"

    /** Response popup **/
    var GAHelper = document.createElement("div")
    GAHelper.id = "GA_HELPER"
    GAHelper.classList.add("hidden")

    var scoutpan = document.createElement("div")
    scoutpan.id = "GA_RESULT_WINDOW"
    var scout = document.createElement("iframe")
    scout.id = "GA_SCREENOUTPUT"
    scoutpan.appendChild(scout)
    GAHelper.appendChild(scoutpan)
    GA.appendChild(GAHelper)

    /** Transcription popup **/
    var GAResponse = document.createElement("div")
    GAResponse.id = "GA-Response"
    GA.appendChild(GAResponse)

    var GAInitialFocus= document.createElement("div")
    GAInitialFocus.id = "GA-initial-focus"
    GAInitialFocus.tabindex = -1
    GAResponse.appendChild(GAInitialFocus)

    var GAPopout = document.createElement("div")
    GAPopout.id = "GA-popout"
    GAResponse.appendChild(GAPopout)

    var GAAssistantMainCards = document.createElement("div")
    GAAssistantMainCards.id = "GA-assistant-main-cards"
    GAPopout.appendChild(GAAssistantMainCards)
    
    var GAAssistantBar = document.createElement("div")
    GAAssistantBar.id = "GA-assistant-bar"
    GAAssistantBar.className= "GA-popout-asbar"
    GAAssistantBar.tabindex = -1
    GAAssistantMainCards.appendChild(GAAssistantBar)

    var GAAssistantBarContainer = document.createElement("div")
    GAAssistantBarContainer.className = "GA-assistant-bar-container"
    GAAssistantBar.appendChild(GAAssistantBarContainer)

    var GAAssistantBarContent = document.createElement("div")
    GAAssistantBarContent.className = "GA-assistant-bar-content"
    GAAssistantBarContainer.appendChild(GAAssistantBarContent)

    //image status
    var GAAssistantIcon = document.createElement("img")
    GAAssistantIcon.id= "GA_STATUS"
    GAAssistantIcon.className="GA-assistant_icon"
    GAAssistantIcon.src = "/modules/MMM-GoogleAssistant/resources/standby.gif"
    GAAssistantBarContent.appendChild(GAAssistantIcon)

    //transcription response text
    var GAAssistantResponse = document.createElement("span")
    GAAssistantResponse.id= "GA_TRANSCRIPTION"
    GAAssistantResponse.className="GA-assistant_response"
    GAAssistantResponse.textContent= "What do you think about the design of MMM-GoogleAssistant v3?"
    GAAssistantBarContent.appendChild(GAAssistantResponse)

    var GAAssistantWordIcon = document.createElement("div")
    GAAssistantWordIcon.className="GA-assistant-word-icon"
    GAAssistantBarContent.appendChild(GAAssistantWordIcon)

    var GABarIcon = document.createElement("img")
    GABarIcon.className="GA-bar_icon"
    GABarIcon.src = "/modules/MMM-GoogleAssistant/resources/assistant_tv_logo.svg"
    GAAssistantWordIcon.appendChild(GABarIcon)

    document.body.appendChild(GA)
  }

  modulePosition () {
    MM.getModules().withClass("MMM-GoogleAssistant").enumerate((module)=> {
      if (module.data.position === "fullscreen_above") this.fullscreenAbove = true
    })
  }

  showError (text) {
    this.showTranscription(text, "error")
    this.status("error")
    return true
  }

  showTranscription (text, className = "transcription") {
    var tr = document.getElementById("GA_TRANSCRIPTION")
    tr.textContent = text
  }

  end () {
    this.showing = false
    if (this.response) {
      var response = this.response
      this.response = null
      if (response && response.continue) {
        this.loopCount = 0
        this.status("continue")
        log("Continuous Conversation")
        this.callbacks.assistantActivate({
          type: "MIC",
          profile: response.lastQuery.profile,
          key: null,
          lang: response.lastQuery.lang,
          useScreenOutput: response.lastQuery.useScreenOutput,
          force: true
        }, Date.now())

      } else {
        log("Conversation ends.")
        this.status("standby")
        this.callbacks.endResponse()
        clearTimeout(this.aliveTimer)
        this.aliveTimer = null
        this.aliveTimer = setTimeout(()=>{
          this.stopResponse(()=>{
            this.fullscreen(false, this.myStatus)
          })
        }, this.config.screenOutputTimer)
      }
    } else {
      this.status("standby")
      this.fullscreen(false, this.myStatus)
      this.callbacks.endResponse()
    }
  }

  start (response) {
    this.response = response
    clearTimeout(this.aliveTimer)
    this.aliveTimer = null
    if (this.showing) {
      this.end()
    }

    if (response.error) {
      if (response.error == "TRANSCRIPTION_FAILS") {
        log("Transcription Failed. Re-try with text")
        this.callbacks.assistantActivate({
          type: "TEXT",
          profile: response.lastQuery.profile,
          key: response.transcription.transcription,
          lang: response.lastQuery.lang,
          useScreenOutput: response.lastQuery.useScreenOutput,
          force: true,
          chime: false
        }, null)
        return
      }
      if (response.error == "NO_RESPONSE" && response.lastQuery.status == "continue" && this.loopCount < 3) {
        this.status("continue")
        this.callbacks.assistantActivate({
          type: "MIC",
          profile: response.lastQuery.profile,
          key: null,
          lang: response.lastQuery.lang,
          useScreenOutput: response.lastQuery.useScreenOutput,
          force: true
        }, Date.now())
        this.loopCount += 1
        log("Loop Continuous Count: "+ this.loopCount + "/3")
        return
      }
      this.showError(this.callbacks.translate(response.error))
      this.end()
      return
    }

    var normalResponse = (response) => {
      this.showing = true
      this.callbacks.A2D(response)
      this.status("reply")
      var so = this.showScreenOutput(response)
      var ao = this.playAudioOutput(response)
      if (ao) {
        log("Wait audio to finish")
      } else {
        log("No response")
        this.end()
      }
    }
    this.postProcess(
      response,
      ()=>{
        response.continue = false // Issue: force to be false
        this.end()
      }, // postProcess done
      ()=>{ normalResponse(response) } // postProcess none
    )
  }

  stopResponse (callback = ()=>{}) {
    this.showing = false
    var winh = document.getElementById("GA_HELPER")
    winh.classList.add("hidden")
    if (!this.config.useNative) this.audioResponse.src = ""
    var tr = document.getElementById("GA_TRANSCRIPTION")
    tr.innerHTML = ""

    callback()
  }

  postProcess (response, callback_done=()=>{}, callback_none=()=>{}) {
    this.callbacks.postProcess(response, callback_done, callback_none)
  }

  playAudioOutput (response) {
    if (response.audio && this.config.useAudioOutput) {
      this.showing = true
      if (this.config.useNative) this.callbacks.sendAudio(response.audio.path)
      else this.audioResponse.src = this.makeUrl(response.audio.uri)
      return true
    }
    return false
  }

  showScreenOutput (response) {
    if (!this.sercretMode && response.screen && this.config.useScreenOutput) {
      if (!response.audio) {
        this.showTranscription(this.callbacks.translate("NO_AUDIO_RESPONSE"))
      }
      this.showing = true
      var iframe = document.getElementById("GA_SCREENOUTPUT")
      iframe.src = this.makeUrl(response.screen.uri)
      var winh = document.getElementById("GA_HELPER")
      winh.classList.remove("hidden")
      return true
    }
    return false
  }

  makeUrl (uri) {
    return "/modules/MMM-GoogleAssistant/" + uri + "?seed=" + Date.now()
  }

  fullscreen (active, status) {
    var GA = document.getElementById("GA")

    if (active) {
      GA.className= "in"
      if (this.fullscreenAbove) {
        GA.classList.add("fullscreen_above")
        MM.getModules().exceptWithClass("MMM-GoogleAssistant").enumerate((module)=> {
          module.hide(500, {lockString: "GA_LOCKED"})
        })
        MM.getModules().withClass("MMM-GoogleAssistant").enumerate((module)=> {
          module.show(500, {lockString: "GA_LOCKED"})
        })
      }
    } else {
      if (status && status.actual == "standby") { // only on standby mode
        GA.className= "out"
        if (this.fullscreenAbove) { 
          GA.classList.add("fullscreen_above")
          MM.getModules().exceptWithClass("MMM-GoogleAssistant").enumerate((module)=> {
            module.show(500, {lockString: "GA_LOCKED"})
          })
          MM.getModules().withClass("MMM-GoogleAssistant").enumerate((module)=> {
            module.hide(500, {lockString: "GA_LOCKED"})
          })
        }
      }
    }
  }
}
