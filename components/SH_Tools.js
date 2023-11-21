var log = (...args) => { /* do nothing */ }

function get_user(that, username, password) {
  if ((username == that.SmartHome.user.user) && (password == that.SmartHome.user.password)) {
    return that.SmartHome.user
  } else {
    return null
  }
}

function get_userOnly(that, username) {
  if (username == that.SmartHome.user.user) {
    return that.SmartHome.user
  } else {
    return null
  }
}

function get_device(device_id, device) {
  if (device_id == "MMM-GoogleAssistant") {
    let data = device
    data["id"] = device_id
    return data
  } else {
    return null
  }
}

/** token rules **/
function check_token(that,headers) {
  let access_token = get_token(headers)
  let tokensDir = that.lib.path.resolve(__dirname + "/../tokens/")
  if (!access_token) {
    console.error("[GATEWAY] [SMARTHOME] [TOOLS] No token found in headers")
    return null
  }
  if (that.lib.fs.existsSync(tokensDir + "/" + access_token)) {
    let user = that.lib.fs.readFileSync(tokensDir + "/" +access_token, 'utf8')
    return user
  } else {
    console.error("[GATEWAY] [SMARTHOME] [TOOLS] Token not found in database", access_token)
    return null
  }
}

function get_token(headers) {
  if (!headers) return null
  const auth = headers.authorization
  let parts = auth.split(" ",2)
  if (auth && parts.length == 2 && parts[0].toLowerCase() == 'bearer') {
    return parts[1]
  } else {
    return null
  }
}

function delete_token(that, access_token) {
  if (that.config.debug) log = (...args) => { console.log("[GATEWAY] [SMARTHOME]", ...args) }
  let tokensDir = that.lib.path.resolve(__dirname + "/../tokens/")
  if (that.lib.fs.existsSync(tokensDir + "/" + access_token)) {
    that.lib.fs.unlinkSync(tokensDir + "/" + access_token)
    log("[TOKEN] Deleted:", access_token)
  } else {
    log("[TOKEN] Delete Failed", access_token)
  }
}

function random_string(length=8) {
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const charactersLength = characters.length
  for ( let i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function serialize(obj) {
  let str = '?' + Object.keys(obj).reduce(function(a, k){
    a.push(k + '=' + encodeURIComponent(obj[k]))
    return a
  }, []).join('&')
  return str
}

function SHLanguage(language) {
  let lang = "en"

  switch (language) {
    case "da":
    case "nl":
    case "en":
    case "fr":
    case "de":
    case "hi":
    case "id":
    case "it":
    case "ja":
    case "ko":
    case "es":
    case "sv":
      lang = language
      break
    case "pt":
    case "pt-br":
      lang = "pt-BR"
      break
    case "zh-tw":
      lang = "zh-TW"
      break
    case "nb":
    case "nn":
      lang = "no"
      break
    //case "th": ?? Thaï (th)
    default:
      lang = "en"
      break
  }
  return lang
}

exports.get_user = get_user
exports.get_userOnly = get_userOnly
exports.get_device = get_device
exports.check_token = check_token
exports.delete_token = delete_token
exports.get_token = get_token
exports.random_string = random_string
exports.serialize = serialize
exports.SHLanguage = SHLanguage
