/* response.js */

class AssistantResponse {
  constructor (audioConfig, callbacks) {
    this.config = audioConfig
    this.callbacks = callbacks
    this.response = null
    this.allStatus = [ "standby", "speak", "error", "continue", "listen" ]
    this.myStatus = { "actual" : "standby" , "old" : "ready" }
    this.chime= {
      beep: "beep.mp3",
      error: "error.mp3",
      continue: "continue.mp3",
    },
    this.loopCount = 0
    if (this.config.useHTML5) {
      this.audioChime = new Audio()
      this.audioChime.autoplay = true
      this.audioResponse = new Audio()
      this.audioResponse.autoplay = true
      this.audioResponse.addEventListener("ended", ()=>{
        log("audio end")
        this.end()
      })
    }
  }

  playChime (sound) {
    if (this.config.useHTML5) {
      this.audioChime.src = "modules/MMM-GoogleAssistant/resources/" + this.chime[sound]
    } else {
      this.callbacks.playChime("resources/" + this.chime[sound])
    }
  }

  status (status, beep) {
    if (status == "TEXT") {
      if (beep) this.playChime("beep")
      return
    }
    var Status = document.getElementById("ASSISTANT_STATUS")
    for (let [item,value] of Object.entries(this.allStatus)) {
      if(Status.classList.contains(value)) this.myStatus.old = value
    } // check old status and store it
    this.myStatus.actual = status

    if (beep && this.myStatus.old != "continue") this.playChime("beep")
    if (status == "error" || status == "continue" ) this.playChime(status)
    if (status == "MIC") this.myStatus.actual = (this.myStatus.old == "continue") ? "continue" : "listen"
    log("Status from " + this.myStatus.old + " to " + this.myStatus.actual)
    Status.classList.remove(this.myStatus.old)
    Status.classList.add(this.myStatus.actual)

    this.callbacks.myStatus(this.myStatus) // send status external
    this.callbacks.sendNotification("ASSISTANT_" + this.myStatus.actual.toUpperCase())
    this.myStatus.old = this.myStatus.actual
  }

  getDom () {
    var dom = document.createElement("div")
    dom.id = "ASSISTANT"

    var logo = document.createElement("div")
    logo.id = "ASSISTANT_STATUS"
    dom.appendChild(logo)

    return dom
  }

  end () {
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
          force: true
        }, Date.now())

      } else {
        log("Conversation ends.")
        this.status("standby")
        this.callbacks.endResponse()
      }
    } else {
      this.status("standby")
      this.callbacks.endResponse()
    }
  }

  start (response) {
    this.response = response

    if (response.error) {
      if (response.error == "TRANSCRIPTION_FAILS") {
        log("Transcription Failed. Re-try with text")
        this.callbacks.assistantActivate({
          type: "TEXT",
          profile: response.lastQuery.profile,
          key: response.transcription.transcription,
          lang: response.lastQuery.lang,
          session: response.lastQuery.session,
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
          force: true
        }, Date.now())
        this.loopCount += 1
        log("Loop Continuous Count: "+ this.loopCount + "/3")
        return
      }
      this.status("error")
      this.end()
      return
    }

    var normalResponse = (response) => {
      this.status("speak")
      var ao = this.playAudioOutput(response)
      if (ao) {
        log("Wait audio to finish")
      } else {
        log("No response")
        this.end()
      }
    }
    normalResponse(response)
  }

  playAudioOutput (response) {
    if (response.audio) {
      if (this.config.useHTML5) this.audioResponse.src = "/modules/MMM-GoogleAssistant/" + response.audio.uri
      else this.callbacks.playSound(response.audio.path)
      return true
    }
    return false
  }
}
