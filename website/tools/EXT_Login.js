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
  doLogin()
})

function doLogin() {
  $("#Login-submit").addClass('disabled')
  $(document).prop('title', translation.Login_Welcome)
  $('#Welcome').text(translation.Login_Welcome)
  $('#username').attr("placeholder", translation.Login_Username)
  $('#password').attr("placeholder", translation.Login_Password)
  $('#Login-submit').text(translation.Login_Login)

  $('#login').on('input change', function() {
    if ($('#username').val() !='' && $('#password').val() !='') $("#Login-submit").removeClass('disabled')
    else $("#Login-submit").addClass('disabled')
  })

  $("#login").submit(function(event) {
    event.preventDefault()
    alertify.set('notifier','position', 'top-center')
    $.post( "/auth", $(this).serialize())
      .done(back => {
        if (back.err) {
          alertify.error("[Login] " + back.err.message)
          $("#username").val('')
          $("#password").val('')
          $("#Login-submit").addClass('disabled')
        }
        else {
          alertify.success(translation.Login_Welcome)
          setTimeout( () => { $(location).attr('href',"/") } , 2000 )
        }
      })
      .fail(function(err) {
        alertify.error("[Login] Gateway Server return Error " + err.status + " ("+ err.statusText+")")
        console.log(err)
      })
    })
}
