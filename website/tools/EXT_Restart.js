/** EXT tools
* @bugsounet
**/

// define all vars
var translation= {}
var versionGW = {}

// Load rules
window.addEventListener("load", async event => {
  versionGW = await getGatewayVersion()
  translation = await loadTranslation()

  $('html').prop("lang", versionGW.lang)
  doRestart()
})

function doRestart() {
  $(document).prop('title', translation.Tools)
  $('#text1').text(translation.Tools_Restart_Text1)
  $('#text2').text(translation.Tools_Restart_Text2)

  function handle200 (response) {
    window.location.href = "/"
  }

  function checkPage(callback) {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", "/", true)
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== XMLHttpRequest.DONE) return
      if (xhr.status === 200) return callback(xhr.status)
    }
    xhr.send()
  }

  setInterval(() => {
    checkPage(handle200)
  }, 5000)
}
