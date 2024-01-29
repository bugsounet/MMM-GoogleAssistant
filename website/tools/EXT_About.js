/** EXT About
* @bugsounet
**/

// rotate rules

PleaseRotateOptions = {
  startOnPageLoad: false
}

// define all vars
var translation= {}
var versionGW = {}

// Load rules
window.addEventListener("load", async event => {
  versionGW = await getGatewayVersion()
  translation = await loadTranslation()

  $('html').prop("lang", versionGW.lang)
  forceMobileRotate()
  GatewaySetting()

  doTranslateNavBar()
})

function GatewaySetting() {
  //translate parts
  $(document).prop('title', translation.About)
  $('#about_title').text(translation.About_Title)
  $('#version').text(versionGW.v)
  $('#rev').text(versionGW.rev)
  $('#language').text(versionGW.lang)

  $('#byHeader').text(translation.About_Info_by)
  $('#SupportHeader').text(translation.About_Info_Support)
  $('#DonateHeader').text(translation.About_Info_Donate)
  $('#DonateText').text(translation.About_Info_Donate_Text)
  $('#VersionHeader').text(translation.About_Info_About)

  for (let tr = 1; tr <= 10; tr++) {
    let trans = "About_Info_Translator"+tr
    if (tr == 1 && translation[trans]) {
      $('#Translators').text(translation.About_Info_Translator)
      $('#translatorsBox').css("display", "flex")
    }
    if (translation[trans]) $('#translator-'+tr).text(translation[trans])
  }
}
