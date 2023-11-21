/** SmartHome Middleware **/
var log = (...args) => { /* do nothing */ }

function initialize(that) {
  if (that.config.debug) log = (...args) => { console.log("[GA] [SMARTHOME]", ...args) }
  let SHWebsiteDir =  that.lib.path.resolve(__dirname + "/../website/SmartHome")
  let tokensDir = that.lib.path.resolve(__dirname + "/../tokens/")
  that.SmartHome.actions = that.lib.actions.smarthome()

  var Path = that.path
  var options = {
    dotfiles: 'ignore',
    etag: false,
    extensions: ["css", "js"],
    index: false,
    maxAge: '1d',
    redirect: false,
    setHeaders: function (res, path, stat) {
      res.set('x-timestamp', Date.now())
    }
  }

  log("Create SmartHome needed routes...")

  that.lib.ActionsOnGoogle.actions(that)
  that.EXT.app
    /** OAuth2 Server **/
    .use('/smarthome/assets', that.lib.express.static(that.path + '/website/assets', options))
    .get("/smarthome/login/", (req,res) => {
      if (that.SmartHome.init) res.sendFile(SHWebsiteDir+ "/login.html")
      else res.sendFile(SHWebsiteDir+ "/disabled.html")
    })

    .post("/smarthome/login/", (req,res) => {
      let form = req.body
      let args = req.query
      if (form["username"] && form["password"] && args["state"] && args["response_type"] && args["response_type"] == "code" && args["client_id"] == that.config.CLIENT_ID){
        let user = that.lib.SHTools.get_user(that,form["username"], form["password"])
        if (!user) return res.sendFile(SHWebsiteDir+ "/login.html")
        that.SmartHome.last_code = that.lib.SHTools.random_string(8)
        that.SmartHome.last_code_user = form["username"]
        that.SmartHome.last_code_time = (new Date()).getTime() / 1000
        let params = {
          'state': args["state"],
          'code': that.SmartHome.last_code,
          'client_id': that.config.CLIENT_ID
        }
        log("[AUTH] Generate Code:", that.SmartHome.last_code)
        res.status(301).redirect(args["redirect_uri"] + that.lib.SHTools.serialize(params))
      } else {
        res.status(400).sendFile(SHWebsiteDir+ "/400.html")
      }
    })

    .post("/smarthome/token/", (req,res) => {
      let form = req.body
      if (form["grant_type"] && form["grant_type"] == "authorization_code" && form["code"] && form["code"] == that.SmartHome.last_code) {
        let time = (new Date()).getTime() / 1000
        if (time - that.SmartHome.last_code_time > 10) {
          log("[TOKEN] Invalid code (timeout)")
          res.status(403).sendFile(SHWebsiteDir+ "/403.html")
        } else {
          let access_token = that.lib.SHTools.random_string(32)
          that.lib.fs.writeFileSync(tokensDir + "/" + access_token, that.SmartHome.last_code_user, { encoding: "utf8"} )
          log("|TOKEN] Send Token:", access_token)
          res.json({"access_token": access_token})
        }
      } else {
        log("[TOKEN] Invalid code")
        res.status(403).sendFile(SHWebsiteDir+ "/403.html")
      }
    })

    /** fulfillment Server **/
    .get("/smarthome/", (req,res) => {
      res.sendFile(SHWebsiteDir+ "/works.html")
    })

    .post("/smarthome/", that.SmartHome.actions)

    /** Display current google graph in console **/
    .get("/smarthome/graph",(req,res) => {
      if (that.SmartHome.homegraph) that.lib.homegraph.queryGraph(that)
      res.status(404).sendFile(SHWebsiteDir+ "/404.html")
    })
}

function disable(that) {
  if (that.config.debug) log = (...args) => { console.log("[GA] [SMARTHOME]", ...args) }
  let SHWebsiteDir =  that.lib.path.resolve(__dirname + "/../website/SmartHome")

  that.EXT.app
    .get("/smarthome/login/", (req,res) => {
      res.sendFile(SHWebsiteDir+ "/disabled.html")
    })
    .get("/smarthome/", (req,res) => {
      res.sendFile(SHWebsiteDir+ "/disabled.html")
    })
    .get("/robots.txt", (req,res) => {
      res.sendFile(SHWebsiteDir+ "/robots.txt")
    })
}

exports.initialize = initialize
exports.disable = disable
