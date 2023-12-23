/** EXT tools
* @bugsounet
**/

// rotate rules

PleaseRotateOptions = {
  startOnPageLoad: false
}

// define all vars
var translation= {}
var actualSetting = {}
var versionGW = {}

// Load rules
window.addEventListener("load", async event => {
  versionGW = await getGatewayVersion()
  translation = await loadTranslation()

  actualSetting = await getGatewaySetting()
  $('html').prop("lang", versionGW.lang)
  forceMobileRotate()
  GatewaySetting()

  doTranslateNavBar()
})

function GatewaySetting() {
  //translate parts
  $(document).prop('title', translation.Setting)
  $('#setting_title').text(translation.Setting_Title)
  $('#version').text(versionGW.v)
  $('#rev').text(versionGW.rev)
  $('#language').text(versionGW.lang)
  $('#update').text(translation.Save)
  $('#wait').text(translation.Wait)
  $('#restart').text(translation.Tools_Restart)
  $('#credentials').text(translation.Setting_Credentials)
  $('#usernameField').text(translation.Setting_Credentials_username)
  $('#passwordField').text(translation.Setting_Credentials_password)
  $('#confirmpwdField').text(translation.Setting_Credentials_confirmpwd)
  $('#clientIDField').text(translation.Setting_Credentials_clientID)
  $('#username').prop('placeholder', translation.Setting_Credentials_username_placeholder)
  $('#password').prop('placeholder', translation.Setting_Credentials_password_placeholder)
  $('#confirmpwd').prop('placeholder', translation.Setting_Credentials_confirmpwd_placeholder)
  $('#clientID').prop('placeholder', translation.Setting_Credentials_clientID_placeholder)

  $('#options').text(translation.Setting_Options)
  $('#debugHeader').text(translation.Setting_Options_debug)
  $('#byHeader').text(translation.Setting_Info_by)
  $('#SupportHeader').text(translation.Setting_Info_Support)
  $('#DonateHeader').text(translation.Setting_Info_Donate)
  $('#DonateText').text(translation.Setting_Info_Donate_Text)
  $('#VersionHeader').text(translation.Setting_Info_About)

  for (let tr = 1; tr <= 10; tr++) {
    let trans = "Setting_Info_Translator"+tr
    if (tr == 1 && translation[trans]) {
      $('#Translators').text(translation.Setting_Info_Translator)
      $('#translatorsBox').css("display", "flex")
    }
    if (translation[trans]) $('#translator-'+tr).text(translation[trans])
  }

  $('#restart').css("display", "none")
  $('#wait').css("display", "none")
  $('#buttonGrp').removeClass('invisible')

  $('#update').css("display", "block")

  $("#username").val(actualSetting.username)
  $("#password").val(actualSetting.password)

  $("#clientID").val(actualSetting.CLIENT_ID)

  $("#debug").prop("checked", actualSetting.debug)

  $("#GatewaySetting").submit(function(event) {
    var newGatewayConfig= {
      module: "Gateway",
      config: {
        debug: false,
        username: "admin",
        password: "admin",
        CLIENT_ID: null
      }
    }
    event.preventDefault()
    var username = $( "input[type=text][name=username]").val()
    var password = $( "input[type=password][name=password]" ).val()
    var confirm = $( "input[type=password][name=confirmpwd]" ).val()
    var clientID = $( "input[type=text][name=clientID]" ).val()
    if (!username) {
      $('#alert').removeClass('invisible')
      $('#alert').removeClass('alert-success')
      $('#alert').addClass('alert-danger')
      $('#messageText').text(translation.Setting_Credentials_username_placeholder)
      return
    }
    if (!password) {
      $('#alert').removeClass('invisible')
      $('#alert').removeClass('alert-success')
      $('#alert').addClass('alert-danger')
      $('#messageText').text(translation.Setting_Credentials_password_placeholder)
      return
    }
    if (password != confirm) {
      $('#alert').removeClass('invisible')
      $('#alert').removeClass('alert-success')
      $('#alert').addClass('alert-danger')
      $('#messageText').text(translation.Setting_Credentials_confirmpwd_placeholder)
      return
    }
    newGatewayConfig.config.username = username
    newGatewayConfig.config.password = password
    newGatewayConfig.config.CLIENT_ID = clientID

    newGatewayConfig.config.CLIENT_ID = clientID || null

    var debug = $( "input[type=checkbox][name=debug]:checked" ).val()
    newGatewayConfig.config.debug = debug ? true : false

    $('#alert').removeClass('invisible')
    $('#alert').removeClass('alert-danger')
    $('#alert').addClass('alert-success')
    $('#messageText').text("Update in progress...")
    $('#restart').css("display", "none")
    $('#update').css("display", "none")
    $('#wait').css("display", "block")

    $.post( "/saveSetting", { data: JSON.stringify(newGatewayConfig) })
      .done(function( back ) {
        if (back.error) {
          $('#alert').removeClass('invisible')
          $('#alert').removeClass('alert-success')
          $('#alert').addClass('alert-danger')
          $('#messageText').text(back.error)
          $('#restart').css("display", "none")
          $('#wait').css("display", "none")
          $('#update').css("display", "block")
        } else {
          $('#alert').removeClass('invisible')
          $('#alert').removeClass('alert-danger')
          $('#alert').addClass('alert-success')
          $('#messageText').text(translation.Restart)
          $('#wait').css("display", "none")
          $('#update').css("display", "none")
          $('#restart').css("display", "block")
        }
      })
      .fail(function(err) {
        alertify.error("[saveSetting] Server return Error " + err.status + " ("+ err.statusText+")")
      })
  })
}
