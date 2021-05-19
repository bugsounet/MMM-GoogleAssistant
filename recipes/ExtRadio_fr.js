/**  Radio francaise   **/
/** mis à jour le 28/02/21 **/
/**  @bugsounet  and @2hdlockness  **/

var recipe = {
  transcriptionHooks: {
    "cheriefm": {
      pattern: "mets chérie fm",
      command: "cheriefm"
    },
    "rtl": {
      pattern: "mets rtl",
      command: "rtl"
    },
    "rireetchansons": {
      pattern: "mets rire et chansons",
      command: "rireetchansons"
    },
    "rtl2": {
      pattern: "mets rtl2",
      command: "rtl2"
    },
    "funradio": {
      pattern: "mets fun radio",
      command: "funradio"
    },
    "europe1": {
      pattern: "mets europe 1",
      command: "europe1"
    },
    "rfm": {
      pattern: "mets rfm",
      command: "rfm"
    },
    "rmc": {
      pattern: "mets rmc",
      command: "rmc"
    },
    "nrj": {
      pattern: "mets nrj",
      command: "nrj"
    },
    "nostalgie": {
      pattern: "mets nostalgie",
      command: "nostalgie"
    },
    "contact": {
      pattern: "mets contact fm",
      command: "contact"
    },
    "voltage": {
      pattern: "mets voltage",
      command: "voltage"
    },
    "skyrock": {
      pattern: "mets skyrock",
      command: "skyrock"
    },
    "fg": {
      pattern: "mets radio fg",
      command: "fg"
    },
    "info": {
      pattern: "mets les infos",
      command: "info"
    }
  },

  commands: {
    "cheriefm": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/ChérieFM.png'],
            link: "https://scdn.nrjaudio.fm/fr/30201/mp3_128.mp3?origine=A2D&cdn_path=audio_lbs9"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },
   "rtl": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/RTL.png'],
            link: "http://streaming.radio.rtl.fr/rtl-1-44-128"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },
   "rireetchansons": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/Rire&Chansons.png'],
            link: "http://185.52.127.160/fr/30401/aac_64.mp3?origine=MagicMirror_GA_EXT"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },
    "rtl2": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/RTL2.png'],
            link: "http://streaming.radio.rtl2.fr/rtl2-1-44-128"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },
    "funradio": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/FunRadio.png'],
            link: "http://streaming.radio.funradio.fr:80/fun-1-44-128"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },
    "europe1": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/Europe1.png'],
            link: "http://ais-live.cloud-services.paris:8000/europe1.mp3"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },
    "rfm": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/RFM.png'],
            link: "https://ais-live.cloud-services.paris:8443/rfm.mp3"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },
    "rmc": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/RMC.svg'],
            link: "http://chai5she.cdn.dvmr.fr/rmcinfo"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },
    "nrj": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/NRJ.png'],
            link: "http://185.52.127.173/fr/40008/aac_64.mp3?origine=MagicMirror_GA_EXT"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },
    "nostalgie": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/Nostalgie.png'],
            link: "http://185.52.127.155/fr/40045/aac_64.mp3?origine=MagicMirror_GA_EXT"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },
    "contact": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/contact.png'],
            link: "http://radio-contact.ice.infomaniak.ch/radio-contact-high.mp3"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },
    "voltage": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/voltage.png'],
            link: "http://start-voltage.ice.infomaniak.ch/start-voltage-high.mp3"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },
    "skyrock": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/Skyrock.png'],
            link: "http://icecast.skyrock.net/s/natio_mp3_128k"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },
    "fg": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.radioCommand({
            img: ['modules/MMM-GoogleAssistant/resources/LogosRadios/fg.png'],
            link: "http://radiofg.impek.com/fg"
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    },

    /** rien a voir avec la radio ... c'est la chaine TV de france info ;) **/
    "info": {
      moduleExec: {
        module: ["MMM-GoogleAssistant"],
        exec: (module) => {
          module.displayEXTResponse.start({
            "photos": [],
            "urls": [ "https://m.youtube.com/watch?v=wwNZKfBLAsc" ],
            "transcription": { transcription: 'France Info TV', done: true },
          })
        },
        soundExec: {
          chime: "open"
        }
      }
    }
  }
}
exports.recipe = recipe
