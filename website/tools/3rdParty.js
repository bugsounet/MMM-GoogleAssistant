/** 3rd Party Module
* @bugsounet
**/

// rotate rules

PleaseRotateOptions = {
  startOnPageLoad: false
};

// define all vars
var translation = {};
var versionGW = {};

// Load rules
window.addEventListener("load", async (event) => {
  versionGW = await getGatewayVersion();
  translation = await loadTranslation();

  $("html").prop("lang", versionGW.lang);
  $(document).prop("title", "MagicMirror² 3rd Party Modules");

  //forceMobileRotate()

  doTranslateNavBar();
});

