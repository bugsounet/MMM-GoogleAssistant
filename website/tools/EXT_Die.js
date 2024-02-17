/* global window, getGatewayVersion, $, loadTranslation */
/** EXT tools
* @bugsounet
**/

// define all vars
var translation = {};
var versionGW = {};

// Load rules
window.addEventListener("load", async (event) => {
  versionGW = await getGatewayVersion();
  translation = await loadTranslation();

  $("html").prop("lang", versionGW.lang);
  doDie();
});

function doDie () {
  $(document).prop("title", translation.Tools);
  $("#text1").text(translation.Tools_Die_Text1);
  $("#text2").text(translation.Tools_Die_Text2);
  $("#text3").text(translation.Tools_Die_Text3);
}
