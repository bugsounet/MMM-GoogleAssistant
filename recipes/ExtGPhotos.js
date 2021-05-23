/**  Google Photos API command for GoogleAssistant v3  **/
/**  modify pattern to your language if needed  **/
/**  @bugsounet  **/

var recipe = {
  transcriptionHooks: {
    "GP_SHOW": {
      pattern: "photo album",
      command: "GP_SHOW"
    }
  },

  commands: {
    "GP_SHOW": {
      functionExec: {
        exec: () => {
          this.showGooglePhotos()
        }
      },
      soundExec: {
        chime: "open"
      },
      displayResponse: true
    }
  }
}
exports.recipe = recipe
