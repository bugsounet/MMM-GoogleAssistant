/** EXT tools
* @bugsounet
**/

// rotate rules

PleaseRotateOptions = {
  startOnPageLoad: false
};

// define all vars
var translation = {};
var versionGW = {};
var homeText = {};

// Load rules
window.addEventListener("load", async (event) => {
  versionGW = await getGatewayVersion();
  translation = await loadTranslation();
  homeText = await getHomeText();

  $("html").prop("lang", versionGW.lang);
  forceMobileRotate();
  doIndex();
  doTranslateNavBar();
  // @todo Add ID in src
  $("#HomeText").html(homeText.text);
});

function doIndex () {
  $(document).prop("title", translation.Home);
  $("#welcome").text(translation.Home_Welcome);
  if (versionGW.needUpdate) {
    $("#alert").removeClass("invisible");
    $("#alert").removeClass("alert-success");
    $("#alert").addClass("alert-warning");
    $("#messageText").text(`${translation.Update} v${versionGW.last}`);
  }
}

