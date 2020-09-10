/**  MMM-MplayerRadio **/
/** vocal control **/
/**  @bugsounet  **/
/** 08/09/2020 **/

var recipe = {
  transcriptionHooks: {
    "RADIO_PLAY": {
      pattern: "RADIO PLAY",
      command: "RADIO_PLAY"
    },
    "RADIO_STOP": {
      pattern: "RADIO STOP",
      command: "RADIO_STOP"
    },
    "RADIO_NEXT": {
      pattern: "RADIO NEXT",
      command: "RADIO_NEXT"
    },
    "RADIO_PREVIOUS": {
      pattern: "RADIO PREVIOUS",
      command: "RADIO_PREVIOUS"
    }
  },

  commands: {
    "RADIO_PLAY": {
      notificationExec: {
        notification: "RADIO_PLAY"
      },
      soundExec: {
        chime: "open"
      }
    },
   "RADIO_STOP": {
      notificationExec: {
        notification: "RADIO_STOP"
      },
      soundExec: {
        chime: "close"
      }
    },
   "RADIO_NEXT": {
      notificationExec: {
        notification: "RADIO_NEXT"
      },
      soundExec: {
        chime: "open"
      }
    },
    "RADIO_PREVIOUS": {
      notificationExec: {
        notification: "RADIO_PREVIOUS"
      },
      soundExec: {
        chime: "open"
      }
    }
  }
}
exports.recipe = recipe
