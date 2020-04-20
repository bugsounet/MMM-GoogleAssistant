//
// Module : MMM-GoogleAssistant
// by Bugsounet


var _log = function() {
  var context = "[ASSISTANT]";
  return Function.prototype.bind.call(console.log, console, context);
}()

var log = function() {
  //do nothing
}

Module.register("MMM-GoogleAssistant", {
  defaults: {
    debug:false,
    assistantConfig: {
      lang: "en_US",
      latitude: 51.508530,
      longitude: -0.076132,
    },
    audioConfig: {
      useHTML5: true,
      playProgram: "mpg321"
    },
    micConfig: {
      recorder: "arecord",
      device: null,
    },
    snowboy: {
      audioGain: 2.0,
      Frontend: false,
      Model: "smart_mirror",
      Sensitivity: null
    }
  },

  getScripts: function() {
    return [
      "/modules/MMM-GoogleAssistant/components/response.js"
    ]
  },

  getStyles: function () {
    return ["/modules/MMM-GoogleAssistant/MMM-GoogleAssistant.css"]
  },

  start: function () {
    const helperConfig = [
      "debug", "assistantConfig", "micConfig", "audioConfig", "snowboy"
    ]
    this.helperConfig = {}
    if (this.config.debug) log = _log
    this.config = this.configAssignment({}, this.defaults, this.config)
    for(var i = 0; i < helperConfig.length; i++) {
      this.helperConfig[helperConfig[i]] = this.config[helperConfig[i]]
    }
    this.myStatus = { "actual" : "ready" , "old" : "standby" }
    var callbacks = {
      assistantActivate: (payload)=>{
        this.assistantActivate(payload)
      },
      endResponse: ()=>{
        this.sendSocketNotification("ASSISTANT_READY")
      },
      sendNotification: (noti, payload=null) => {
        this.sendNotification(noti, payload)
      },
      myStatus: (status) => {
        this.myStatus=status
      },
      playSound: (sound) => {
        this.sendSocketNotification("PLAY_SOUND", sound)
      },
      playChime: (chime) => {
        this.sendSocketNotification("PLAY_CHIME", chime)
      }
    }
    this.assistantResponse = new AssistantResponse(this.helperConfig["audioConfig"], callbacks)
  },

  configAssignment : function (result) {
    var stack = Array.prototype.slice.call(arguments, 1)
    var item
    var key
    while (stack.length) {
      item = stack.shift()
      for (key in item) {
        if (item.hasOwnProperty(key)) {
          if (
            typeof result[key] === "object" && result[key]
            && Object.prototype.toString.call(result[key]) !== "[object Array]"
          ) {
            if (typeof item[key] === "object" && item[key] !== null) {
              result[key] = this.configAssignment({}, result[key], item[key])
            } else {
              result[key] = item[key]
            }
          } else {
            result[key] = item[key]
          }
        }
      }
    }
    return result
  },

  getDom: function() {
    return this.assistantResponse.getDom()
  },

  notificationReceived: function(noti, payload=null, sender=null) {
    switch (noti) {
      case "DOM_OBJECTS_CREATED":
        this.sendSocketNotification("INIT", this.helperConfig)
        break
    }
  },

  socketNotificationReceived: function(noti, payload) {
    switch(noti) {
      case "INITIALIZED":
        log("Initialized.")
        this.assistantResponse.status("standby")
        if (this.config.developer) this.assistantActivate({ type: "TEXT", key: "speak like YODA"})
        break
      case "ASSISTANT_RESULT":
        this.assistantResponse.start(payload)
        break
      case "ASSISTANT_ACTIVATE":
        this.assistantActivate(payload)
        break
      case "ASSISTANT_AUDIO_RESULT_ENDED":
        this.assistantResponse.end()
        break
    }
  },

  suspend: function() {
    log("This module cannot be suspended.")
  },

  resume: function() {
    log("This module cannot be resumed.")
  },

  assistantActivate: function(payload) {
    if (this.myStatus.actual != "standby" && !payload.force) return log("Assistant is busy.")
    this.lastQuery = null
    var options = {
      type: "MIC",
      lang: this.config.assistantConfig.lang,
      status: this.myStatus.old,
      chime: true
    }
    var options = Object.assign({}, options, payload)
    this.assistantResponse.status(options.type, (options.chime) ? true : false)
    this.sendSocketNotification("ACTIVATE_ASSISTANT", options)
  },
})
