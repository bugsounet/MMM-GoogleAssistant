/**  Radio francaise   **/
/** mis à jour le 14/04/20 **/
/**  @bugsounet  **/

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
    "franceinfo": {
      pattern: "mets france info",
      command: "franceinfo"
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
      pattern: "mets contact",
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
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://www.hbca07.fr/media/uploaded/sites/5499/partenaire/583038d328d24_slidercheriefm.jpg",
            link: "https://scdn.nrjaudio.fm/fr/30201/mp3_128.mp3?origine=A2D&cdn_path=audio_lbs9"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
   "rtl": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "http://static.rtl.fr/www/img/live/logo.gif",
            link: "http://streaming.radio.rtl.fr/rtl-1-44-128"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
   "rireetchansons": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://www.rireetchansons.fr/build/img/logo-rireetchansons-flat.svg",
            link: "https://scdn.nrjaudio.fm/audio1/fr/30401/mp3_128.mp3?origine=A2D"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "franceinfo": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://www.francetvinfo.fr/image/759r6589q-db33/1500/843/10579443.png",
            link: "http://direct.franceinfo.fr/live/franceinfo-midfi.mp3"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "rtl2": {// a voir
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://static.rtl2.fr/versions/www/6.0.717/img/rtl2_fb.jpg",
            link: "http://streaming.radio.rtl2.fr/rtl2-1-44-128"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "funradio": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://upload.wikimedia.org/wikipedia/fr/thumb/e/eb/Fun_Radio.png/1200px-Fun_Radio.png",
            link: "http://streaming.radio.funradio.fr:80/fun-1-44-128"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "europe1": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Europe_1_logo_%282010%29.svg/1200px-Europe_1_logo_%282010%29.svg.png",
            link: "http://ais-live.cloud-services.paris:8000/europe1.mp3"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "rfm": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://cdn-rfm.lanmedia.fr/bundles/rfmintegration/images/logoRFM.png",
            link: "https://ais-live.cloud-services.paris:8443/rfm.mp3"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "rmc": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Logo_RMC_2002.svg/1200px-Logo_RMC_2002.svg.png",
            link: "http://chai5she.cdn.dvmr.fr/rmcinfo"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "nrj": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://www.nrj.fr/uploads/assets/nrj/logo-nrj.png",
            link: "https://scdn.nrjaudio.fm/audio1/fr/30001/mp3_128.mp3?origine=A2D"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "nostalgie": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://upload.wikimedia.org/wikipedia/fr/0/0b/Nostalgie_logo_2015.png",
            link: "https://scdn.nrjaudio.fm/audio1/fr/30601/mp3_128.mp3?origine=A2D"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "contact": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://ecouter.lesindesradios.fr/logos/orange14.png",
            link: "http://radio-contact.ice.infomaniak.ch/radio-contact-high.mp3"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "voltage": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://www.voltage.fr/upload/design/5b834d25df7a01.53797175.png",
            link: "http://broadcast.infomaniak.net/start-voltage-high.mp3"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "skyrock": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://skyrock.fm/layouts/frontoffice/images/skyrock.png",
            link: "http://icecast.skyrock.net/s/natio_mp3_128k"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },
    "fg": {
      notificationExec: {
        notification: "A2D_RADIO",
        payload: (params) => {
          return {
            img: "https://www.radiofg.com/upload/design/5c2f84d962eaa4.45175913.png",
            link: "http://radiofg.impek.com/fg"
          }
        }
      },
      soundExec: {
        chime: "open"
      }
    },

    /** rien a voir avec la radio ... c'est la chaine TV de france info ;) **/
    "info": {
      notificationExec: {
        notification: "A2D",
        payload: (params) => {
          /** emule une réponse du serveur pour A2D **/
          return {
            "photos": [],
            "urls": [ "https://m.youtube.com/watch?v=wwNZKfBLAsc" ],
            "transcription": { transcription: 'France Info TV', done: true },
            "trysay": null,
            "help": null
          }
        }
      },
      soundExec: {
        //say: "Je mets la chaine de France info",
        chime: "open"
      },
    }
  }
}
exports.recipe = recipe
