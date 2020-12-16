/**  MMM-Selfieshot commands addon  **/
/**  modify pattern to your language  **/
/**  @bugsounet  **/

var recipe = {
  transcriptionHooks: {
    "SELFIE_SHOOT": {
      pattern: "selfie",
      command: "SELFIE_SHOOT"
    }
  },

  commands: {
    "SELFIE_SHOOT": {
      notificationExec: {
        notification: "SELFIE_SHOOT",
        payload: (params) => {
          return {
            shootCountdown: 5,
            displayResult: true,
            playShutter: true,
            displayCountdown: true,
          }
        }
      },
    },
  },
}
exports.recipe = recipe
