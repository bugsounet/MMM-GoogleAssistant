/* global window, getGatewayVersion, loadTranslation, $ */

/** EXT tools
* @bugsounet
**/

// define all vars
var translation = {};
var versionGW = {};
var locationGW = window.location.origin;

// Load rules
window.addEventListener("load", async (event) => {
  versionGW = await getGatewayVersion();
  translation = await loadTranslation();

  $("html").prop("lang", versionGW.lang);
  doRestart();
});

function doRestart () {
  $(document).prop("title", translation.Tools);
  $("#text1").text(translation.Tools_Restart_Text1);
  $("#text2").text(translation.Tools_Restart_Text2);

  function handle200 () {
    window.location.href = "/";
  }

  function checkPage (callback) {
    fetch(locationGW)
      .then((response) => {
        if (response.status === 200) return callback();
      })
      .catch((err) => {});
  }

  setInterval(() => {
    checkPage(handle200);
  }, 5000);
}
