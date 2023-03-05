/* Common GA Class */

class AssistantResponse {
  constructor (responseConfig, callbacks) {
    this.config = responseConfig
    this.callbacks = callbacks
    this.showing = false
    this.response = null
    this.aliveTimer = null
    this.allStatus = [ "hook", "standby", "reply", "error", "think", "continue", "listen", "confirmation" ]
    this.GAStatus = { "actual" : "standby" , "old" : "standby" }
    this.loopCount = 0
    this.chime = this.config.chimes
    this.resourcesDir = "/modules/MMM-GoogleAssistant/resources/"

    this.imgStatus = {
      "hook": this.resourcesDir + this.config.imgStatus.hook,
      "standby": this.resourcesDir + this.config.imgStatus.standby,
      "reply": this.resourcesDir + this.config.imgStatus.reply,
      "error": this.resourcesDir + this.config.imgStatus.error,
      "think": this.resourcesDir + this.config.imgStatus.think,
      "continue": this.resourcesDir + this.config.imgStatus.continue,
      "listen": this.resourcesDir + this.config.imgStatus.listen,
      "confirmation": this.resourcesDir + this.config.imgStatus.confirmation,
      "information": this.resourcesDir + this.config.imgStatus.information,
      "warning": this.resourcesDir + this.config.imgStatus.warning,
      "userError": this.resourcesDir + this.config.imgStatus.userError
    }

    this.audioResponse = new Audio()
    this.audioResponse.autoplay = true
    this.audioResponse.addEventListener("ended", ()=>{
      logGA("audio end")
      this.end()
    })

    this.audioChime = new Audio()
    this.audioChime.autoplay = true
    this.GAfullscreen = this.config.useFullscreen
  }

  tunnel (payload) {
    if (payload.type == "TRANSCRIPTION") {
      var startTranscription = false
      if (payload.payload.done) {
        this.status("confirmation")
        var iframe = document.getElementById("GA-ResultOuput")
        iframe.src = "about:blank"
      }
      if (payload.payload.transcription && !startTranscription) {
        this.showTranscription(payload.payload.transcription)
        startTranscription = true
      }
    }
  }

  playChime (sound, external) {
    if (this.config.useChime) {
      this.audioChime.src = this.resourcesDir + (external ? sound : this.chime[sound])
    }
  }

  status (status, beep) {
    this.GAStatus.actual = status
    var Status = document.getElementById("GA-Status")
    if (beep && this.GAStatus.old != "continue") this.playChime("beep")
    if (status == "error" || status == "continue") this.playChime(status)
    if (status == "confirmation" && this.config.confirmationChime) this.playChime("confirmation")
    if (status == "WAVEFILE" || status == "TEXT") this.GAStatus.actual = "think"
    if (status == "MIC") this.GAStatus.actual = (this.GAStatus.old == "continue") ? "continue" : "listen"
    if (this.GAStatus.actual == this.GAStatus.old) return
    logGA("Status from " + this.GAStatus.old + " to " + this.GAStatus.actual)
    Status.src = (this.GAStatus.old == "hook") ? this.imgStatus["hook"] : this.imgStatus[this.GAStatus.actual]
    this.callbacks.GAStatus(this.GAStatus) // send status external
    this.GAStatus.old = this.GAStatus.actual
  }
  
  prepareGA () {
    /** Main GA popups **/
    var newGA = document.createElement("div")
    newGA.id = "GoogleAssistant"
    newGA.style.zoom = this.config.zoom.transcription
    newGA.className= "hidden out"

    /** hidden the popup on animation end **/
    newGA.addEventListener('transitionend', (a) => {
      if (a.path[0].className =="out") newGA.classList.add("hidden")
    })

    /** Response popup **/
    var scoutpan = document.createElement("div")
    scoutpan.id = "GA-Result"
    scoutpan.classList.add("hidden")
    var scout = document.createElement("iframe")
    scout.id = "GA-ResultOuput"
    scoutpan.appendChild(scout)
    newGA.appendChild(scoutpan)

    /** Transcription popup **/
    var GAResponse = document.createElement("div")
    GAResponse.id = "GA-Response"
    newGA.appendChild(GAResponse)

    var GAPopout = document.createElement("div")
    GAPopout.id = "GA-popout"
    GAResponse.appendChild(GAPopout)

    var GAAssistantBar = document.createElement("div")
    GAAssistantBar.id = "GA-assistant-bar"
    GAAssistantBar.className= "GA-popout-asbar"
    GAAssistantBar.tabindex = -1
    GAPopout.appendChild(GAAssistantBar)

    //image status
    var GAAssistantIcon = document.createElement("img")
    GAAssistantIcon.id= "GA-Status"
    GAAssistantIcon.className="GA-assistant_icon"
    GAAssistantIcon.src = this.resourcesDir + "standby.gif"
    GAAssistantIcon.onclick = (event)=> {
      event.stopPropagation()
      if (this.GAStatus.actual == "reply") {
        logGA("Touch Force end")
        this.response = null
        this.audioResponse.src = ""
        this.playChime("closing")
        this.end()
      }
    }
    GAAssistantBar.appendChild(GAAssistantIcon)

    //transcription response text
    var GAAssistantResponse = document.createElement("span")
    GAAssistantResponse.id= "GA-Transcription"
    GAAssistantResponse.className="GA-assistant_response"
    GAAssistantResponse.textContent= "~MMM-GoogleAssistant~"
    GAAssistantBar.appendChild(GAAssistantResponse)

    var GAAssistantWordIcon = document.createElement("div")
    GAAssistantWordIcon.className="GA-assistant-word-icon"
    GAAssistantBar.appendChild(GAAssistantWordIcon)

    var GABarIcon = document.createElement("img")
    GABarIcon.className="GA-bar_icon"
    GABarIcon.src = this.resourcesDir + "assistant_tv_logo.svg"
    GAAssistantWordIcon.appendChild(GABarIcon)

    document.body.appendChild(newGA)

  }

  // make a popup for display fullscreen background
  prepareBackground () {
    var module = document.createElement("div")
    module.id = "GA_DOM-FS"
    module.classList.add("hidden")
    var viewDom = document.createElement("div")
    viewDom.id = "GA_DOM"

    module.appendChild(viewDom)
    document.body.appendChild(module)
  }

  showError (text) {
    this.showTranscription(text, "error")
    this.status("error")
    return true
  }

  showTranscription (text) {
    var tr = document.getElementById("GA-Transcription")
    tr.textContent = text
  }

  end (cb = true) {
    this.showing = false
    if (this.response) {
      var response = this.response
      this.response = null
      if (response && response.continue) {
        this.loopCount = 0
        this.status("continue")
        logGA("Continuous Conversation")
        this.showTranscription("")
        this.callbacks.assistantActivate({
          type: "MIC",
          profile: response.lastQuery.profile,
          key: null,
          lang: response.lastQuery.lang,
          isNew: false,
          force: true
        }, Date.now())
      } else {
        logGA("Conversation ends.")
        this.status("standby")
        this.callbacks.endResponse()
        clearTimeout(this.aliveTimer)
        this.aliveTimer = null
        this.aliveTimer = setTimeout(()=>{
          this.stopResponse(()=>{
            this.fullscreen(false, this.GAStatus)
          })
        }, this.config.screenOutputTimer)
      }
    } else {
      this.status("standby")
      this.fullscreen(false, this.GAStatus)
      if (cb) this.callbacks.endResponse()
    }
  }

  start (response) {
    this.response = response
    clearTimeout(this.aliveTimer)
    this.aliveTimer = null
    if (this.showing) this.end()

    if (response.error.error) {
      if (response.error.error == "TRANSCRIPTION_FAILS") {
        logGA("Transcription Failed. Re-try with text")
        this.callbacks.assistantActivate({
          type: "TEXT",
          profile: response.lastQuery.profile,
          key: response.transcription.transcription,
          lang: response.lastQuery.lang,
          force: true,
          chime: false,
          isNew: false
        }, null)
        return
      }
      if (response.error.error == "TOO_SHORT" && response.lastQuery.status == "continue" && this.loopCount < 1) { // @todo to debug
        this.status("continue")
        this.callbacks.assistantActivate({
          type: "MIC",
          profile: response.lastQuery.profile,
          key: null,
          lang: response.lastQuery.lang,
          isNew: false,
          force: true
        }, Date.now())
        this.loopCount += 1
        logGA("Loop Continuous Count: "+ this.loopCount + "/1")
        return
      }
      this.showError(response.error.message ? response.error.message : this.callbacks.translate(response.error.error))
      this.end()
      return
    }

    var normalResponse = (response) => {
      this.showing = true
      this.callbacks.Gateway(response)
      this.status("reply")
      var so = this.showScreenOutput(response)
      var ao = this.playAudioOutput(response)
      if (ao) {
        logGA("Wait audio to finish")
      } else {
        logGA("No response")
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
    var winh = document.getElementById("GA-Result")
    winh.classList.add("hidden")
    this.audioResponse.src = ""
    var tr = document.getElementById("GA-Transcription")
    tr.textContent=""

    callback()
  }

  postProcess (response, callback_done=()=>{}, callback_none=()=>{}) {
    this.callbacks.postProcess(response, callback_done, callback_none)
  }

  playAudioOutput (response) {
    if (response.audio) {
      this.showing = true
      this.audioResponse.src = this.makeUrl(response.audio.uri)
      return true
    }
    return false
  }

  showScreenOutput (response) {
    if (!this.sercretMode && response.screen) {
      if (!response.audio) {
        this.showTranscription(this.callbacks.translate("NO_AUDIO_RESPONSE"))
      }
      this.showing = true
      var iframe = document.getElementById("GA-ResultOuput")
      iframe.src = this.makeUrl(response.screen.uri)
      var winh = document.getElementById("GA-Result")
      winh.classList.remove("hidden")
      return true
    }
    else {
      if (response.text && !this.config.useResponseOutput) {
        this.showTranscription(response.text)
        return true
      }
    }
    return false
  }

  makeUrl (uri) {
    return "/modules/MMM-GoogleAssistant/" + uri + "?seed=" + Date.now()
  }

  fullscreen (active, status, fs = true) {
    var GA = document.getElementById("GoogleAssistant")
    var GAFS = document.getElementById("GA_DOM-FS")

    if (active) {
      GA.className= "in"
      if (this.GAfullscreen && fs) {
        GAFS.classList.remove("hidden")
      }
    } else {
      if (status && status.actual == "standby") { // only on standby mode
        GA.className= "out"
        if (this.GAfullscreen) {
          GAFS.classList.add("hidden")
        }
      }
    }
  }

  forceStatusImg (status) {
    var Status = document.getElementById("GA-Status")
    Status.src = this.imgStatus[status]
  }

  Loading () {
    this.forceStatusImg("standby")
    this.showTranscription(this.callbacks.translate("GALoading") + " MMM-GoogleAssistant")
    this.fullscreen(true,null,false)
  }

  Version (version) {
    this.showTranscription("MMM-GoogleAssistant v" + version.version + " (" + version.rev + ") [" + version.lang + "] ©bugsounet " + this.callbacks.translate("GAReady"))
    this.fullscreen(true,null,false)
    this.aliveTimer = setTimeout(() => {
      this.end(false)
      this.showTranscription("")
    }, this.config.screenOutputTimer)
  }

  clearAliveTimers() {
    clearTimeout(this.aliveTimer)
    this.aliveTimer = null
  }
}
