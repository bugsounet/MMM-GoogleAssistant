var log = (...args) => { /* do nothing */ }

/** init function **/
function initialize(that) {
  if (that.config.debug) log = (...args) => { console.log("[GA]", ...args) }

  log("EXT plugins in database:", that.EXT.EXT.length)
  if (!that.config.website.username && !that.config.website.password) {
    console.error("[GA] Your have not defined user/password in config!")
    console.error("[GA] Using default credentials")
  } else {
    if ((that.config.website.username == that.EXT.user.username) || (that.config.website.password == that.EXT.user.password)) {
      console.warn("[GA] WARN: You are using default username or default password")
      console.warn("[GA] WARN: Don't forget to change it!")
    }
    that.EXT.user.username = that.config.website.username
    that.EXT.user.password = that.config.website.password
  }
  passportConfig(that)

  that.EXT.app = that.lib.express()
  that.EXT.server = that.lib.http.createServer(that.EXT.app)
  that.EXT.EXTConfigured= that.lib.EXTTools.searchConfigured(that.EXT.MMConfig, that.EXT.EXT)
  that.EXT.EXTInstalled= that.lib.EXTTools.searchInstalled(that)
  log("Find", that.EXT.EXTInstalled.length , "installed plugins in MagicMirror")
  log("Find", that.EXT.EXTConfigured.length, "configured plugins in config file")
  log("webviewTag Configured:", that.EXT.webviewTag)
  log("Language set", that.EXT.language)
  createGW(that)
}

/** GA Middleware **/
function createGW(that) {
  if (that.config.debug) log = (...args) => { console.log("[GA]", ...args) }

  var Path = that.path
  var urlencodedParser = that.lib.bodyParser.urlencoded({ extended: true })
  log("Create website needed routes...")
  that.EXT.app.use(that.lib.session({
    secret: 'some-secret',
    saveUninitialized: false,
    resave: true
  }))

  // For parsing post request's data/body
  that.EXT.app.use(that.lib.bodyParser.json())
  that.EXT.app.use(that.lib.bodyParser.urlencoded({ extended: true }))

  // Tells app to use password session
  that.EXT.app.use(that.lib.passport.initialize())
  that.EXT.app.use(that.lib.passport.session())

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

  var healthDownloader = function(req, res) {
    res.redirect('/')
  }

  var io = new that.lib.Socket.Server(that.EXT.server)

  that.EXT.app
    .use(logRequest)
    .use(that.lib.cors({ origin: '*' }))
    .use('/EXT_Login.js', that.lib.express.static(Path + '/website/tools/EXT_Login.js'))
    .use('/EXT_Home.js', that.lib.express.static(Path + '/website/tools/EXT_Home.js'))
    .use('/EXT_Plugins.js', that.lib.express.static(Path + '/website/tools/EXT_Plugins.js'))
    .use('/EXT_Terminal.js', that.lib.express.static(Path + '/website/tools/EXT_Terminal.js'))
    .use('/EXT_MMConfig.js', that.lib.express.static(Path + '/website/tools/EXT_MMConfig.js'))
    .use('/EXT_Tools.js', that.lib.express.static(Path + '/website/tools/EXT_Tools.js'))
    .use('/EXT_System.js', that.lib.express.static(Path + '/website/tools/EXT_System.js'))
    .use('/EXT_About.js', that.lib.express.static(Path + '/website/tools/EXT_About.js'))
    .use('/EXT_Restart.js', that.lib.express.static(Path + '/website/tools/EXT_Restart.js'))
    .use('/EXT_Die.js', that.lib.express.static(Path + '/website/tools/EXT_Die.js'))
    .use('/EXT_Fetch.js', that.lib.express.static(Path + '/website/tools/EXT_Fetch.js'))
    .use('/assets', that.lib.express.static(Path + '/website/assets', options))
    .use("/jsoneditor" , that.lib.express.static(Path + '/node_modules/jsoneditor'))
    .use("/xterm" , that.lib.express.static(Path + '/node_modules/xterm'))
    .use("/xterm-addon-fit" , that.lib.express.static(Path + '/node_modules/xterm-addon-fit'))

    .get('/', (req, res) => {
      if(req.user) res.sendFile(Path+ "/website/Gateway/index.html")
      else res.redirect('/login')
    })

    .get("/version" , (req,res) => {
        let remoteFile = "https://raw.githubusercontent.com/bugsounet/MMM-GoogleAssistant/prod/package.json"
        var result = {
          v: require('../package.json').version,
          rev: require('../package.json').rev,
          lang: that.EXT.language,
          last: 0,
          imperial: (that.EXT.MMConfig.units == "imperial") ? true : false,
          needUpdate: false
        }
        fetch(remoteFile)
          .then(response => response.json())
          .then(data => {
            result.last = data.version
            if (that.lib.semver.gt(result.last, result.v)) result.needUpdate = true
            res.send(result)
          })
          .catch(e => {
            console.error("[GA] Error on fetch last version number")
            res.send(result)
          })
    })

    .get("/systemInformation" , async (req, res) => {
      if (req.user) {
        that.EXT.systemInformation.result = await that.EXT.systemInformation.lib.Get()
        res.send(that.EXT.systemInformation.result)
      } else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/translation" , (req,res) => {
      res.send(that.EXT.translation)
    })

    .get("/homeText", (req,res) => {
      res.send({text: that.EXT.homeText})
    })

    .get('/EXT', (req, res) => {
      if(req.user) res.sendFile(Path+ "/website/Gateway/EXT.html")
      else res.redirect('/login')
    })

    .get('/login', (req, res) => {
      if (req.user) res.redirect('/')
      res.sendFile(Path+ "/website/Gateway/login.html")
    })

    .post('/auth', (req, res, next) => {
      var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      that.lib.passport.authenticate('login', (err, user, info) => {
        if (err) {
          console.log("[GA] [" + ip + "] Error", err)
          return next(err)
        }
        if (!user) {
          console.log("[GA] [" + ip + "] Bad Login", info)
          return res.send({ err: info })
        }
        req.logIn(user, err => {
          if (err) {
            console.log("[GA] [" + ip + "] Login error:", err)
            return res.send({ err: err })
          }
          console.log("[GA] [" + ip + "] Welcome " + user.username + ", happy to serve you!")
          return res.send({ login: true })
        })
      })(req, res, next)
    })

    .get('/logout', (req, res) => {
      req.logout(err => {
        if (err) { return console.error("[GA] Logout:", err) }
        res.redirect('/')
      })
    })

    .get('/AllEXT', (req, res) => {
      if (req.user) res.send(that.EXT.EXT)
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get('/DescriptionEXT', (req, res) => {
      if (req.user) res.send(that.EXT.EXTDescription)
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get('/InstalledEXT', (req, res) => {
      if (req.user) res.send(that.EXT.EXTInstalled)
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get('/ConfiguredEXT', (req, res) => {
      if (req.user) res.send(that.EXT.EXTConfigured)
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get('/GetMMConfig', (req, res) => {
      if (req.user) res.send(that.EXT.MMConfig)
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/Terminal" , (req,res) => {
      if (req.user) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        res.sendFile( Path+ "/website/Gateway/terminal.html")

        io.once('connection', async (socket) => {
          log('[' + ip + '] Connected to Terminal Logs:', req.user.username)
          socket.on('disconnect', (err) => {
            log('[' + ip + '] Disconnected from Terminal Logs:', req.user.username, "[" + err + "]")
          })
          var pastLogs = await that.lib.EXTTools.readAllMMLogs(that.EXT.HyperWatch.logs())
          io.emit("terminal.logs", pastLogs)
          that.EXT.HyperWatch.stream().on('stdData', (data) => {
            if (typeof data == "string") io.to(socket.id).emit("terminal.logs", data.replace(/\r?\n/g, "\r\n"))
          })
        })
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/ptyProcess" , (req,res) => {
      if (req.user) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        res.sendFile( Path+ "/website/Gateway/pty.html")
        io.once('connection', (client) => {
          log('[' + ip + '] Connected to Terminal:', req.user.username)
          client.on('disconnect', (err) => {
            log('[' + ip + '] Disconnected from Terminal:', req.user.username, "[" + err + "]")
          })
          var cols = 80
          var rows = 24
          var ptyProcess = that.lib.pty.spawn("bash", [], {
            name: "xterm-color",
            cols: cols,
            rows: rows,
            cmd: process.env.HOME,
            env: process.env
          })
          ptyProcess.on("data", (data) => {
            io.to(client.id).emit("terminal.incData", data)
          })
          client.on('terminal.toTerm', (data) => {
            ptyProcess.write(data)
          })
          client.on('terminal.size', (size) => {
            ptyProcess.resize(size.cols, size.rows)
          })
        })
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/install" , (req,res) => {
      if (req.user) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        if (req.query.ext && that.EXT.EXTInstalled.indexOf(req.query.ext) == -1 && that.EXT.EXT.indexOf(req.query.ext) > -1) {
          res.sendFile( Path+ "/website/Gateway/install.html")
          io.once('connection', async (socket) => {
            log('[' + ip + '] Connected to installer Terminal Logs:', req.user.username)
            socket.on('disconnect', (err) => {
              log('[' + ip + '] Disconnected from installer Terminal Logs:', req.user.username, "[" + err + "]")
            })
            that.EXT.HyperWatch.stream().on('stdData', (data) => {
              if (typeof data == "string") io.to(socket.id).emit("terminal.installer", data.replace(/\r?\n/g, "\r\n"))
            })
          })
        }
        else res.status(404).sendFile(Path+ "/website/Gateway/404.html")
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/EXTInstall" , (req,res) => {
      if (req.user) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        if (req.query.EXT && that.EXT.EXTInstalled.indexOf(req.query.EXT) == -1 && that.EXT.EXT.indexOf(req.query.EXT) > -1) {
          console.log("[GA]["+ip+"] Request installation:", req.query.EXT)
          var result = {
            error: false
          }
          var modulePath = that.lib.path.normalize(Path + "/../")
          var Command= 'cd ' + modulePath + ' && git clone https://github.com/bugsounet/' + req.query.EXT + ' && cd ' + req.query.EXT + ' && npm install'

          var child = that.lib.childProcess.exec(Command, {cwd : modulePath } , (error, stdout, stderr) => {
            if (error) {
              result.error = true
              console.error(`[GA][FATAL] exec error: ${error}`)
            } else {
              that.EXT.EXTInstalled= that.lib.EXTTools.searchInstalled(that)
              console.log("[GA][DONE]", req.query.EXT)
            }
            res.json(result)
          })
          child.stdout.pipe(process.stdout)
          child.stderr.pipe(process.stdout)
        }
        else res.status(404).sendFile(Path+ "/website/Gateway/404.html")
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/delete" , (req,res) => {
      if (req.user) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        if (req.query.ext && that.EXT.EXTInstalled.indexOf(req.query.ext) > -1 && that.EXT.EXT.indexOf(req.query.ext) > -1) {
          res.sendFile( Path+ "/website/Gateway/delete.html")
          io.once('connection', async (socket) => {
            log('[' + ip + '] Connected to uninstaller Terminal Logs:', req.user.username)
            socket.on('disconnect', (err) => {
              log('[' + ip + '] Disconnected from uninstaller Terminal Logs:', req.user.username, "[" + err + "]")
            })
            that.EXT.HyperWatch.stream().on('stdData', (data) => {
              if (typeof data == "string") io.to(socket.id).emit("terminal.delete", data.replace(/\r?\n/g, "\r\n"))
            })
          })
        }
        else res.status(404).sendFile(Path+ "/website/Gateway/404.html")
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/EXTDelete" , (req,res) => {
      if (req.user) {
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
        if (req.query.EXT && that.EXT.EXTInstalled.indexOf(req.query.EXT) > -1 && that.EXT.EXT.indexOf(req.query.EXT) > -1) {
          console.log("[GA]["+ip+"] Request delete:", req.query.EXT)
          var result = {
            error: false
          }
          var modulePath = that.lib.path.normalize(Path + "/../")
          var Command= 'cd ' + modulePath + ' && rm -rfv ' + req.query.EXT
          var child = that.lib.childProcess.exec(Command, {cwd : modulePath } , (error, stdout, stderr) => {
            if (error) {
              result.error = true
              console.error(`[GA][FATAL] exec error: ${error}`)
            } else {
              that.EXT.EXTInstalled= that.lib.EXTTools.searchInstalled(that)
              console.log("[GA][DONE]", req.query.EXT)
            }
            res.json(result)
          })
          child.stdout.pipe(process.stdout)
          child.stderr.pipe(process.stdout)
        }
        else res.status(404).sendFile(Path+ "/website/Gateway/404.html")
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/MMConfig" , (req,res) => {
      if (req.user) res.sendFile( Path+ "/website/Gateway/mmconfig.html")
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/EXTCreateConfig" , (req,res) => {
      if (req.user) {
        if (req.query.ext &&
          that.EXT.EXTInstalled.indexOf(req.query.ext) > -1 && // is installed
          that.EXT.EXT.indexOf(req.query.ext) > -1 &&  // is an EXT
          that.EXT.EXTConfigured.indexOf(req.query.ext) == -1 // is not configured
        ) {
          res.sendFile( Path+ "/website/Gateway/EXTCreateConfig.html")
        }
        else res.status(404).sendFile(Path+ "/website/Gateway/404.html")
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/EXTModifyConfig" , (req,res) => {
      if (req.user) {
        if (req.query.ext &&
          that.EXT.EXTInstalled.indexOf(req.query.ext) > -1 && // is installed
          that.EXT.EXT.indexOf(req.query.ext) > -1 &&  // is an EXT
          that.EXT.EXTConfigured.indexOf(req.query.ext) > -1 // is configured
        ) {
          res.sendFile( Path+ "/website/Gateway/EXTModifyConfig.html")
        }
        else res.status(404).sendFile(Path+ "/website/Gateway/404.html")
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/EXTDeleteConfig" , (req,res) => {
      if (req.user) {
        if (req.query.ext &&
          that.EXT.EXTInstalled.indexOf(req.query.ext) == -1 && // is not installed
          that.EXT.EXT.indexOf(req.query.ext) > -1 &&  // is an EXT
          that.EXT.EXTConfigured.indexOf(req.query.ext) > -1 // is configured
        ) {
          res.sendFile( Path+ "/website/Gateway/EXTDeleteConfig.html")
        }
        else res.status(404).sendFile(Path+ "/website/Gateway/404.html")
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/EXTGetCurrentConfig" , (req,res) => {
      if (req.user) {
        if(!req.query.ext) return res.status(404).sendFile(Path+ "/website/Gateway/404.html")
        var index = that.EXT.MMConfig.modules.map(e => { return e.module }).indexOf(req.query.ext)
        if (index > -1) {
          let data = that.EXT.MMConfig.modules[index]
          return res.send(data)
        }
        res.status(404).sendFile(Path+ "/website/Gateway/404.html")
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/EXTGetDefaultConfig" , (req,res) => {
      if (req.user) {
        if(!req.query.ext) return res.status(404).sendFile(Path+ "/website/Gateway/404.html")
        let data = require("../website/config/"+req.query.ext+"/config.js")
        res.send(data.default)
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/EXTGetDefaultTemplate" , (req,res) => {
      if (req.user) {
        if(!req.query.ext) return res.status(404).sendFile(Path+ "/website/Gateway/404.html")
        let data = require("../website/config/"+req.query.ext+"/config.js")
        data.schema = that.lib.EXTTools.makeSchemaTranslate(data.schema, that.EXT.schemaTranslatation)
        res.send(data.schema)
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/EXTSaveConfig" , (req,res) => {
      if (req.user) {
        if(!req.query.config) return res.status(404).sendFile(Path+ "/website/Gateway/404.html")
        let data = req.query.config
        res.send(data)
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .post("/writeEXT", async (req,res) => {
      if (req.user) {
        console.log("[GA] Receiving EXT data ...")
        let data = JSON.parse(req.body.data)
        var NewConfig = await that.lib.EXTTools.configAddOrModify(data, that.EXT.MMConfig)
        var resultSaveConfig = await that.lib.EXTTools.saveConfig(that,NewConfig)
        console.log("[GA] Write config result:", resultSaveConfig)
        res.send(resultSaveConfig)
        if (resultSaveConfig.done) {
          that.EXT.MMConfig = await that.lib.EXTTools.readConfig(that)
          that.EXT.EXTConfigured= that.lib.EXTTools.searchConfigured(that.EXT.MMConfig, that.EXT.EXT)
          console.log("[GA] Reload config")
        }
      } else res.status(403).sendFile(Path+ "/website/Gateway/403.html") 
    })

    .post("/deleteEXT", async (req,res) => {
      if (req.user) {
        console.log("[GA] Receiving EXT data ...", req.body)
        console.log("user", req.user)
        let EXTName = req.body.data
        var NewConfig = await that.lib.EXTTools.configDelete(EXTName, that.EXT.MMConfig)
        var resultSaveConfig = await that.lib.EXTTools.saveConfig(that,NewConfig)
        console.log("[GA] Write config result:", resultSaveConfig)
        res.send(resultSaveConfig)
        if (resultSaveConfig.done) {
          that.EXT.MMConfig = await that.lib.EXTTools.readConfig(that)
          that.EXT.EXTConfigured= that.lib.EXTTools.searchConfigured(that.EXT.MMConfig, that.EXT.EXT)
          console.log("[GA] Reload config")
        }
      } else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/Tools" , (req,res) => {
      if (req.user) res.sendFile(Path+ "/website/Gateway/tools.html")
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/System" , (req,res) => {
      if (req.user) {
        res.sendFile(Path+ "/website/Gateway/system.html")
      } else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/About" , (req,res) => {
      if (req.user) res.sendFile(Path+ "/website/Gateway/about.html")
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/getSetting", (req,res) => {
      if (req.user) res.send(that.config)
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/Restart" , (req,res) => {
      if (req.user) {
        res.sendFile(Path+ "/website/Gateway/restarting.html")
        setTimeout(() => that.lib.EXTTools.restartMM(that) , 1000)
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/Die" , (req,res) => {
      if (req.user) {
        res.sendFile(Path+ "/website/Gateway/die.html")
        setTimeout(() => that.lib.EXTTools.doClose(that), 3000)
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/SystemRestart" , (req,res) => {
      if (req.user) {
        res.sendFile(Path+ "/website/Gateway/restarting.html")
        setTimeout(() => that.lib.EXTTools.SystemRestart(that) , 1000)
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/SystemDie" , (req,res) => {
      if (req.user) {
        res.sendFile(Path+ "/website/Gateway/die.html")
        setTimeout(() => that.lib.EXTTools.SystemDie(that), 3000)
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/EditMMConfig" , (req,res) => {
      if (req.user) res.sendFile(Path+ "/website/Gateway/EditMMConfig.html")
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/GetBackupName" , async (req,res) => {
      if (req.user) {
        var names = await that.lib.EXTTools.loadBackupNames(that)
        res.send(names)
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/GetBackupFile" , async (req,res) => {
      if (req.user) {
        let data = req.query.config
        var file = await that.lib.EXTTools.loadBackupFile(that,data)
        res.send(file)
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/GetRadioStations", (req,res) => {
      if (req.user) {
        if (!that.EXT.radio) return res.status(404).sendFile(Path+ "/website/Gateway/404.html")
        var allRadio = Object.keys(that.EXT.radio)
        res.send(allRadio)
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .post("/loadBackup", async (req,res) => {
      if (req.user) {
        console.log("[GA] Receiving backup data ...")
        let file = req.body.data
        var loadFile = await that.lib.EXTTools.loadBackupFile(that,file)
        var resultSaveConfig = await that.lib.EXTTools.saveConfig(that,loadFile)
        console.log("[GA] Write config result:", resultSaveConfig)
        res.send(resultSaveConfig)
        if (resultSaveConfig.done) {
          that.EXT.MMConfig = await that.lib.EXTTools.readConfig(that)
          console.log("[GA] Reload config")
        }
      } else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .post("/writeConfig", async (req,res) => {
      if (req.user) {
        console.log("[GA] Receiving config data ...")
        let data = JSON.parse(req.body.data)
        var resultSaveConfig = await that.lib.EXTTools.saveConfig(that,data)
        console.log("[GA] Write config result:", resultSaveConfig)
        res.send(resultSaveConfig)
        if (resultSaveConfig.done) {
          that.EXT.MMConfig = await that.lib.EXTTools.readConfig(that)
          console.log("[GA] Reload config")
        }
      } else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/getWebviewTag", (req,res) => {
      if(req.user) res.send(that.EXT.webviewTag)
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .post("/setWebviewTag", async (req,res) => {
      if(!that.EXT.webviewTag && req.user) {
        console.log("[GA] Receiving setWebviewTag demand...")
        let NewConfig = await that.lib.EXTTools.setWebviewTag(that.EXT.MMConfig)
        var resultSaveConfig = await that.lib.EXTTools.saveConfig(that,NewConfig)
        console.log("[GA] Write GA webview config result:", resultSaveConfig)
        res.send(resultSaveConfig)
        if (resultSaveConfig.done) {
          that.EXT.webviewTag = true
          that.EXT.MMConfig = await that.lib.EXTTools.readConfig(that)
          console.log("[GA] Reload config")
        }
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/getGAVersion", (req,res) => {
      if (req.user) {
        if (that.EXT.EXTStatus.GA_Ready) that.EXT.GACheck.ready = true
        res.send(that.EXT.GACheck)
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/getEXTStatus", (req,res) => {
      if (req.user) res.send(that.EXT.EXTStatus)
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .post("/EXT-Screen", (req, res) => {
      if(req.user) {
        let data = req.body.data
        if (data == "OFF") {
          that.sendSocketNotification("SendNoti", "EXT_SCREEN-FORCE_END")
          return res.send("ok")
        }
        if (data == "ON") {
          that.sendSocketNotification("SendNoti", "EXT_SCREEN-FORCE_WAKEUP")
          return res.send("ok")
        }
        res.send("error")
      }
      else res.send("error")
    })

    .post("/EXT-GAQuery", (req, res) => {
      if(req.user) {
        let data = req.body.data
        if (!data) return res.send("error")
        that.sendSocketNotification("REMOTE_ACTIVATE_ASSISTANT", { type: "TEXT", key: data })
        res.send("ok")
      }
      else res.send("error")
    })

    .post("/EXT-AlertQuery", (req, res) => {
      if(req.user) {
        let data = req.body.data
        if (!data) return res.send("error")
        that.sendSocketNotification("SendNoti", {
          noti: "EXT_ALERT",
          payload: {
            type: "information",
            message: data,
            sender: req.user ? req.user.username : 'MMM-GoogleAssistant',
            timer: 30 * 1000,
            sound: "modules/MMM-GoogleAssistant/website/tools/message.mp3",
            icon: "modules/MMM-GoogleAssistant/website/assets/img/GA_Small.png"
          }
        })
        res.send("ok")
      }
      else res.send("error")
    })

    .post("/EXT-VolumeSendSpeaker", (req, res) => {
      if(req.user) {
        let data = req.body.data
        if (!data) return res.send("error")
        that.sendSocketNotification("SendNoti", {
          noti: "EXT_VOLUME-SPEAKER_SET",
          payload: data
        })
        res.send("ok")
      }
      else res.send("error")
    })

    .post("/EXT-VolumeSendRecorder", (req, res) => {
      if(req.user) {
        let data = req.body.data
        if (!data) return res.send("error")
        that.sendSocketNotification("SendNoti", {
          noti: "EXT_VOLUME-RECORDER_SET",
          payload: data
        })
        res.send("ok")
      }
      else res.send("error")
    })

    .post("/EXT-SpotifyQuery", (req, res) => {
      if(req.user) {
        let result = req.body.data
        if (!result) return res.send("error")
        let query = req.body.data.query
        let type = req.body.data.type
        if (!query || !type ) return res.send("error")
        var pl = {
          type: type,
          query: query,
          random: false
        }
        that.sendSocketNotification("SendNoti", {
          noti: "EXT_SPOTIFY-SEARCH",
          payload: pl
        })
        res.send("ok")
      }
      else res.send("error")
    })

    .post("/EXT-SpotifyPlay", (req, res) => {
      if(req.user) {
        that.sendSocketNotification("SendNoti", "EXT_SPOTIFY-PLAY")
        res.send("ok")
      }
      else res.send("error")
    })

    .post("/EXT-SpotifyStop", (req, res) => {
      if(req.user) {
        that.sendSocketNotification("SendNoti", "EXT_SPOTIFY-STOP")
        res.send("ok")
      }
      else res.send("error")
    })

    .post("/EXT-SpotifyNext", (req, res) => {
      if(req.user) {
        that.sendSocketNotification("SendNoti", "EXT_SPOTIFY-NEXT")
        res.send("ok")
      }
      else res.send("error")
    })

    .post("/EXT-SpotifyPrevious", (req, res) => {
      if(req.user) {
        that.sendSocketNotification("SendNoti", "EXT_SPOTIFY-PREVIOUS")
        res.send("ok")
      }
      else res.send("error")
    })

    .post("/EXT-Updates", (req, res) => {
      if(req.user) {
        that.sendSocketNotification("SendNoti", "EXT_UPDATES-UPDATE")
        res.send("ok")
      }
      else res.send("error")
    })

    .post("/EXT-YouTubeQuery", (req, res) => {
      if(req.user) {
        let data = req.body.data
        if (!data) return res.send("error")
        if (that.EXT.EXTStatus["EXT-YouTube"].hello) {
          that.sendSocketNotification("SendNoti", {
            noti: "EXT_YOUTUBE-SEARCH",
            payload: data
          })
          res.send("ok")
        } else {
          res.send("error")
        }
      }
      else res.send("error")
    })

    .post("/EXT-FreeboxTVQuery", (req, res) => {
      if(that.EXT.freeteuse && req.user) {
        let data = req.body.data
        if (!data) return res.send("error")
        that.sendSocketNotification("SendNoti", {
          noti: "EXT_FREEBOXTV-PLAY",
          payload: data
        })
        res.send("ok")
      }
      else res.send("error")
    })

    .post("/EXT-RadioQuery", (req, res) => {
      if(req.user) {
        let data = req.body.data
        if (!data) return res.send("error")
        try {
          var toListen= that.EXT.radio[data].notificationExec.payload()
          that.sendSocketNotification("SendNoti", {
            noti: "EXT_RADIO-START",
            payload: toListen
          })
        } catch (e) {
          res.send("error")
        }
        res.send("ok")
      }
      else res.send("error")
    })

    .post("/EXT-StopQuery", (req, res) => {
      if(req.user) {
        that.sendSocketNotification("SendStop")
        that.sendSocketNotification("SendNoti", "EXT_STOP")
        res.send("ok")
      }
      else res.send("error")
    })

    .post("/deleteBackup", async (req,res) => {
      if(req.user) {
        console.log("[GA] Receiving delete backup demand...")
        var deleteBackup = await that.lib.EXTTools.deleteBackup(that)
        console.log("[GA] Delete backup result:", deleteBackup)
        res.send(deleteBackup)
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .post("/readExternalBackup", async (req,res) => {
      if(req.user) {
        let data = req.body.data
        if (!data) return res.send({error: "error"})
        console.log("[GA] Receiving External backup...")
        var transformExternalBackup = await that.lib.EXTTools.transformExternalBackup(that,data)
        res.send({ data: transformExternalBackup })
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .post("/saveExternalBackup", async (req,res) => {
      if(req.user) {
        let data = req.body.data
        if (!data) return res.send({error: "error"})
        console.log("[GA] Receiving External backup...")
        var linkExternalBackup = await that.lib.EXTTools.saveExternalConfig(that,data)
        if (linkExternalBackup.data) {
          console.log("[GA] Generate link number:", linkExternalBackup.data)
          healthDownloader = (req_, res_) => {
            if (req_.params[0] == linkExternalBackup.data) {
              res_.sendFile(Path + '/download/'+ linkExternalBackup.data + '.js')
              healthDownloader = function(req_, res_) {
                res_.redirect('/')
              }
              setTimeout(() => {
                that.lib.EXTTools.deleteDownload(that,linkExternalBackup.data)
              }, 1000 * 10)
            } else {
              res_.redirect('/')
            }
          }
        }
        res.send(linkExternalBackup)
      }
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/activeVersion", (req,res) => {
      if (req.user) res.send(that.EXT.activeVersion)
      else res.status(403).sendFile(Path+ "/website/Gateway/403.html")
    })

    .get("/download/*", (req,res) => {
      healthDownloader(req, res)
    })

    .get("/robots.txt", (req,res) => {
      res.sendFile(Path+ "/website/Gateway/robots.txt")
    })
}

/** Start Server **/
async function startServer(that,callback = () => {}) {
  /** Error 404 **/
  that.EXT.app
    .get("/smarthome/*", (req, res) => {
      console.warn("[GA] [SMARTHOME] Don't find:", req.url)
      res.status(404).sendFile(that.path+ "/website/SmartHome/404.html")
    })
  that.EXT.app
    .get("/*", (req, res) => {
      console.warn("[GA] Don't find:", req.url)
      res.status(404).sendFile(that.path+ "/website/Gateway/404.html")
    })

  /** Create Server **/
  that.config.listening = await that.lib.EXTTools.purposeIP(that)
  that.EXT.HyperWatch = that.lib.hyperwatch(
    that.EXT.server
      .listen(8081, "0.0.0.0", () => {
        console.log("[GA] Start listening on port 8081")
        console.log("[GA] Available locally at http://"+ that.config.listening + ":8081")
        that.EXT.initialized= true
        callback(true)
      })
      .on("error", err => {
        console.error("[GA] Can't start web server!")
        console.error("[GA] Error:",err.message)
        that.sendSocketNotification("SendNoti", {
          noti: "EXT_ALERT",
          payload: {
            type: "error",
            message: "Can't start web server!",
            timer: 10000
          }
        })
        that.EXT.initialized= false
        callback(false)
      })
  )
}

/** passport local strategy with username/password defined on config **/
function passportConfig(that) {
  that.lib.passport.use('login', new that.lib.LocalStrategy.Strategy(
    (username, password, done) => {
      if (username === that.EXT.user.username && password === that.EXT.user.password) {
        return done(null, that.EXT.user)
      }
      else done(null, false, { message: that.EXT.translation["Login_Error"] })
    }
  ))

  that.lib.passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  that.lib.passport.deserializeUser((id, done) => {
    done(null, that.EXT.user)
  })
}

function logRequest(req, res, next) {
  var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  log("[" + ip + "][" + req.method + "] " + req.url)
  next()
}

exports.initialize = initialize
exports.startServer = startServer
