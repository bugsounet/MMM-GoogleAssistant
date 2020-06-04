/* Common GA Class */

class AssistantResponse {
  constructor (responseConfig, callbacks) {
    this.config = responseConfig
    this.callbacks = callbacks
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
      open: "Google_beep_open.mp3",
      close: "Google_beep_close.mp3",
    },

    this.audioResponse = new Audio()
    this.audioResponse.autoplay = true
    this.audioResponse.addEventListener("ended", ()=>{
      log("audio end")
      this.end()
    })

    this.audioChime = new Audio()
    this.audioChime.autoplay = true

    this.fullscreenAbove = false
  }

  tunnel (payload) {
    if (payload.type == "TRANSCRIPTION") {
      var startTranscription = false
      if (payload.payload.done) this.status("confirmation")
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
      this.audioChime.src = "modules/MMM-GoogleAssistant/resources/" + (external ? sound : this.chime[sound])
    }
  }

  status (status, beep) {
    this.myStatus.actual = status
    var Status = document.getElementById("GA_STATUS")
    if (beep && this.myStatus.old != "continue") this.playChime("beep")
    if (status == "error" || status == "continue" ) this.playChime(status)
    if (status == "WAVEFILE" || status == "TEXT") this.myStatus.actual = "think"
    if (status == "MIC") this.myStatus.actual = (this.myStatus.old == "continue") ? "continue" : "listen"
    if (this.myStatus.actual == this.myStatus.old) return
    log("Status from " + this.myStatus.old + " to " + this.myStatus.actual)
    Status.className = this.myStatus.actual
    this.callbacks.myStatus(this.myStatus) // send status external
    this.callbacks.sendNotification("ASSISTANT_" + this.myStatus.actual.toUpperCase())
    this.myStatus.old = this.myStatus.actual
  }

  prepare () {
    /** Transcription popup **/
    var GA = document.createElement("div")
    GA.id = "GA"
    GA.className= "out"

    var contener = document.createElement("div")
    contener.id = "GA_CONTENER"

    var status = document.createElement("div")
    status.id = "GA_STATUS"
    contener.appendChild(status)

    var transcription = document.createElement("div")
    transcription.id = "GA_TRANSCRIPTION"
    contener.appendChild(transcription)

    var logo = document.createElement("div")
    logo.id = "GA_LOGO"
    contener.appendChild(logo)
    GA.appendChild(contener)
    document.body.appendChild(GA)

    /** Response popup **/
    var dom = document.createElement("div")
    dom.id = "GA_HELPER"
    dom.classList.add("hidden")
    if(this.fullscreenAbove) dom.classList.add("fullscreen_above")

    var scoutpan = document.createElement("div")
    scoutpan.id = "GA_RESULT_WINDOW"
    var scout = document.createElement("iframe")
    scout.id = "GA_SCREENOUTPUT"
    scoutpan.appendChild(scout)
    dom.appendChild(scoutpan)
    document.body.appendChild(dom)
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
    tr.innerHTML = ""
    var t = document.createElement("p")
    t.className = className
    t.innerHTML = text
    tr.appendChild(t)
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
    this.audioResponse.src = ""

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
      this.audioResponse.src = this.makeUrl(response.audio.uri)
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
      GA.className= "in" + (this.fullscreenAbove ? " fullscreen_above": "")
      MM.getModules().exceptWithClass("MMM-GoogleAssistant").enumerate((module)=> {
        module.hide(500, {lockString: "GA_LOCKED"})
      })
    } else {
      if (status && status.actual == "standby") { // only on standby mode
        GA.className= "out" + (this.fullscreenAbove ? " fullscreen_above": "")
        MM.getModules().exceptWithClass("MMM-GoogleAssistant").enumerate((module)=> {
          module.show(500, {lockString: "GA_LOCKED"})
        })
      }
    }
  }
}
