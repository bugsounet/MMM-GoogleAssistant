"use strict"

const fs = require("fs")
const util = require("util")
const { exec, spawn } = require("child_process")
const pty = require("node-pty")
const si = require("systeminformation")
const readline = require("readline")
const Stream = require("stream")
const pm2 = require("pm2")
const semver = require("semver")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const express = require("express")
const session = require("express-session")
const http = require("http")
const bodyParser = require("body-parser")
const cors = require("cors")
const Socket = require("socket.io")

var logGA = (...args) => { /* do nothing */ }

const mainBranch = {
  "MMM-GoogleAssistant" : "prod",
  "EXT-Alert" : "master",
  "EXT-Background" : "master",
  "EXT-Bring" : "main",
  "EXT-Browser" : "master",
  "EXT-Detector" : "main",
  "EXT-FreeboxTV" : "main",
  "EXT-GooglePhotos" : "master",
  "EXT-Governor" : "master",
  "EXT-Internet" : "master",
  "EXT-Keyboard" : "main",
  "EXT-Librespot" : "master",
  "EXT-MusicPlayer" : "master",
  "EXT-Motion" : "main",
  "EXT-Pages" : "master",
  "EXT-Photos" : "master",
  "EXT-Pir" : "master",
  "EXT-RadioPlayer" : "master",
  "EXT-Screen" : "master",
  "EXT-Selfies" : "master",
  "EXT-SelfiesFlash" : "main",
  "EXT-SelfiesSender" : "main",
  "EXT-SelfiesViewer" : "main",
  "EXT-Spotify" : "master",
  "EXT-SpotifyCanvasLyrics" : "main",
  "EXT-StreamDeck" : "main",
  "EXT-TelegramBot" : "master",
  "EXT-Updates" : "master",
  "EXT-Volume" : "master",
  "EXT-Welcome" : "master",
  "EXT-YouTube" : "master",
  "EXT-YouTubeCast" : "master"
}

class website {
  constructor(config, cb = ()=> {}) {
    this.lib = config.lib
    this.config = config.config
    this.assistantLang = config.assistantLang
    this.sendSocketNotification = (...args) => cb(...args)

    if (config.debug) logGA = (...args) => { console.log("[GA] [WEBSITE]", ...args) }

    this.website = {
      MMConfig: null, // real config file (config.js)
      EXT: null, // EXT plugins list
      EXTDescription: {}, // description of EXT
      EXTConfigured: [], // configured EXT in config
      EXTInstalled: [], // installed EXT in MM
      EXTStatus: {}, // status of EXT
      user: { _id: 1, username: 'admin', password: 'admin' },
      initialized: false,
      app: null,
      server: null,
      translation: null,
      schemaTranslatation: null,
      language: null,
      webviewTag: false,
      GAConfig: {}, // see to be deleted !?
      HyperWatch: null,
      radio: null,
      freeteuse: {},
      systemInformation: {
        lib: null,
        result: {}
      },
      activeVersion: {},
      usePM2: false,
      PM2Process: 0,
      homeText: null,
      errorInit: false
    }
    this.MMVersion = global.version
    this.root_path = global.root_path
    this.GAPath = `${this.root_path}/modules/MMM-GoogleAssistant`
    this.WebsitePath = `${this.GAPath}/website`
  }

  async init(data) {
    console.log("[GA] Loading Website...")
    this.website.MMConfig = await this.readConfig()
    let Version = {
      version: require('../package.json').version,
      rev: require('../package.json').rev,
      lang: this.assistantLang
    }
    if (!this.website.MMConfig) { // should not happen ! ;)
      this.website.errorInit = true
      console.error("[GA] [WEBSITE] Error: MagicMirror config.js file not found!")
      this.sendSocketNotification("ERROR", "MagicMirror config.js file not found!")
      return
    }
    await this.MMConfigAddress()
    if (this.lib.error || this.website.errorInit) return

    this.website.language = this.website.MMConfig.language
    this.website.webviewTag = this.checkElectronOptions()
    this.website.EXT = data.DB.sort()
    this.website.EXTDescription = data.Description
    this.website.translation = data.Translate
    this.website.schemaTranslatation = data.Schema
    this.website.EXTStatus = data.EXTStatus
    this.website.GAConfig = this.getGAConfig()
    this.website.homeText = await this.getHomeText()
    this.website.freeteuse = await this.readFreeteuseTV()
    this.website.radio= await this.readRadioRecipe()
    this.website.usePM2 = await this.check_PM2_Process()

    this.website.systemInformation.lib = new this.lib.SystemInformation(this.website.translation)
    this.website.systemInformation.result = await this.website.systemInformation.lib.initData()
    /*
    if (that.config.website.CLIENT_ID) {
      that.SmartHome.lang = that.lib.SHTools.SHLanguage(this.website.language)
      that.SmartHome.use = true
      that.SmartHome.user.user = that.config.website.username
      that.SmartHome.user.password = that.config.website.password
      that.lib.homegraph.init(that)
      that.lib.Device.create(that)
    } else {
      console.log("[GA] no CLIENT_ID found in your config!")
      console.warn("[GA] SmartHome functionality is disabled")
    }
    */

    if (!this.config.username && !this.config.password) {
      console.error("[GA] Your have not defined user/password in config!")
      console.error("[GA] Using default credentials")
    } else {
      if ((this.config.username == this.website.user.username) || (this.config.password == this.website.user.password)) {
        console.warn("[GA] WARN: You are using default username or default password")
        console.warn("[GA] WARN: Don't forget to change it!")
      }
      this.website.user.username = this.config.username
      this.website.user.password = this.config.password
    }

    this.website.EXTConfigured= this.searchConfigured()
    this.website.EXTInstalled= this.searchInstalled()

    logGA("EXT plugins in database:", this.website.EXT.length)
    logGA("Find", this.website.EXTInstalled.length , "installed plugins in MagicMirror")
    logGA("Find", this.website.EXTConfigured.length, "configured plugins in config file")
    logGA("webviewTag Configured:", this.website.webviewTag)
    logGA("Language set", this.website.language)

    await this.createWebsite()
    console.log("[GA] Website Ready!")
    this.sendSocketNotification("WEBSITE-INIT")
/*
    if (this.config.CLIENT_ID) this.lib.SmartHome.initialize(that)
    else this.lib.SmartHome.disable(that)
*/
  }

  server() {
    console.log("[GA] Loading Server...")
    this.startServer(cb => {
      if (cb) {
        console.log("[GA] Server Ready!")
      }
    })
  }

  /** passport local strategy with username/password defined on config **/
  passportConfig() {
    passport.use('login', new LocalStrategy.Strategy(
      (username, password, done) => {
        if (username === this.website.user.username && password === this.website.user.password) {
          return done(null, this.website.user)
        }
        else done(null, false, { message: this.website.translation["Login_Error"] })
      }
    ))

    passport.serializeUser((user, done) => {
      done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
      done(null, this.website.user)
    })
  }

  /** GA Middleware **/
  createWebsite() {
    return new Promise(resolve => {
      this.passportConfig()
      this.website.app = express()
      this.website.server = http.createServer(this.website.app)
  
      var urlencodedParser = bodyParser.urlencoded({ extended: true })
      logGA("Create website needed routes...")
      this.website.app.use(session({
        secret: 'some-secret',
        saveUninitialized: false,
        resave: true
      }))
  
      // For parsing post request's data/body
      this.website.app.use(bodyParser.json())
      this.website.app.use(bodyParser.urlencoded({ extended: true }))
  
      // Tells app to use password session
      this.website.app.use(passport.initialize())
      this.website.app.use(passport.session())
  
      var options = {
        dotfiles: 'ignore',
        etag: false,
        extensions: ["css", "js"],
        index: false,
        maxAge: '1d',
        redirect: false,
        setHeaders: function (res) {
          res.set('x-timestamp', Date.now())
        }
      }
  
      var healthDownloader = function(req, res) {
        res.redirect('/')
      }
  
      var io = new Socket.Server(this.website.server)
  
      this.website.app
        .use(this.logRequest)
        .use(cors({ origin: '*' }))
        .use('/EXT_Login.js', express.static(`${this.WebsitePath}/tools/EXT_Login.js`))
        .use('/EXT_Home.js', express.static(`${this.WebsitePath}/tools/EXT_Home.js`))
        .use('/EXT_Plugins.js', express.static(`${this.WebsitePath}/tools/EXT_Plugins.js`))
        .use('/EXT_Terminal.js', express.static(`${this.WebsitePath}/tools/EXT_Terminal.js`))
        .use('/EXT_MMConfig.js', express.static(`${this.WebsitePath}/tools/EXT_MMConfig.js`))
        .use('/EXT_Tools.js', express.static(`${this.WebsitePath}/tools/EXT_Tools.js`))
        .use('/EXT_System.js', express.static(`${this.WebsitePath}/tools/EXT_System.js`))
        .use('/EXT_About.js', express.static(`${this.WebsitePath}/tools/EXT_About.js`))
        .use('/EXT_Restart.js', express.static(`${this.WebsitePath}/tools/EXT_Restart.js`))
        .use('/EXT_Die.js', express.static(`${this.WebsitePath}/tools/EXT_Die.js`))
        .use('/EXT_Fetch.js', express.static(`${this.WebsitePath}/tools/EXT_Fetch.js`))
        .use('/3rdParty.js', express.static(`${this.WebsitePath}/tools/3rdParty.js`))
        .use('/assets', express.static(`${this.WebsitePath}/assets`, options))
        .use("/jsoneditor" , express.static(`${this.GAPath}/node_modules/jsoneditor`))
        .use("/xterm" , express.static(`${this.GAPath}/node_modules/xterm`))
        .use("/xterm-addon-fit" , express.static(`${this.GAPath}/node_modules/xterm-addon-fit`))
  
        .get('/', (req, res) => {
          if(req.user) res.sendFile(`${this.WebsitePath}/Gateway/index.html`)
          else res.redirect('/login')
        })
  
        .get("/version" , (req,res) => {
            let remoteFile = "https://raw.githubusercontent.com/bugsounet/MMM-GoogleAssistant/prod/package.json"
            var result = {
              v: require('../package.json').version,
              rev: require('../package.json').rev,
              lang: this.website.language,
              last: 0,
              imperial: (this.website.MMConfig.units == "imperial") ? true : false,
              needUpdate: false
            }
            fetch(remoteFile)
              .then(response => response.json())
              .then(data => {
                result.last = data.version
                if (semver.gt(result.last, result.v)) result.needUpdate = true
                res.send(result)
              })
              .catch(e => {
                console.error("[GA] [WEBSITE] Error on fetch last version number")
                res.send(result)
              })
        })
  
        .get("/systemInformation" , async (req, res) => {
          if (req.user) {
            this.website.systemInformation.result = await this.website.systemInformation.lib.Get()
            res.send(this.website.systemInformation.result)
          } else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/translation" , (req,res) => {
          res.send(this.website.translation)
        })
  
        .get("/homeText", (req,res) => {
          res.send({text: this.website.homeText})
        })
  
        .get('/EXT', (req, res) => {
          if(req.user) res.sendFile(`${this.WebsitePath}/Gateway/EXT.html`)
          else res.redirect('/login')
        })
  
        .get('/login', (req, res) => {
          if (req.user) res.redirect('/')
          res.sendFile(`${this.WebsitePath}/Gateway/login.html`)
        })
  
        .post('/auth', (req, res, next) => {
          var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
          passport.authenticate('login', (err, user, info) => {
            if (err) {
              console.log(`[GA] [WEBSITE] [${ip}] Error`, err)
              return next(err)
            }
            if (!user) {
              console.log(`[GA] [WEBSITE] [${ip}] Bad Login`, info)
              return res.send({ err: info })
            }
            req.logIn(user, err => {
              if (err) {
                console.log(`[GA] [WEBSITE] [${ip}] Login error:`, err)
                return res.send({ err: err })
              }
              console.log(`[GA] [WEBSITE] [${ip}] Welcome ${user.username}, happy to serve you!`)
              return res.send({ login: true })
            })
          })(req, res, next)
        })
  
        .get('/logout', (req, res) => {
          req.logout(err => {
            if (err) { return console.error("[GA] [WEBSITE] Logout:", err) }
            res.redirect('/')
          })
        })
  
        .get('/AllEXT', (req, res) => {
          if (req.user) res.send(this.website.EXT)
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get('/DescriptionEXT', (req, res) => {
          if (req.user) res.send(this.website.EXTDescription)
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get('/InstalledEXT', (req, res) => {
          if (req.user) res.send(this.website.EXTInstalled)
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get('/ConfiguredEXT', (req, res) => {
          if (req.user) res.send(this.website.EXTConfigured)
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get('/GetMMConfig', (req, res) => {
          if (req.user) res.send(this.website.MMConfig)
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/Terminal" , (req,res) => {
          if (req.user) {
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
            res.sendFile(`${this.WebsitePath}/Gateway/terminal.html`)
  
            io.once('connection', async (socket) => {
              logGA('[' + ip + '] Connected to Terminal Logs:', req.user.username)
              socket.on('disconnect', (err) => {
                logGA('[' + ip + '] Disconnected from Terminal Logs:', req.user.username, "[" + err + "]")
              })
              var pastLogs = await this.readAllMMLogs(this.lib.HyperWatch.logs())
              io.emit("terminal.logs", pastLogs)
              this.lib.HyperWatch.stream().on('stdData', (data) => {
                if (typeof data == "string") io.to(socket.id).emit("terminal.logs", data.replace(/\r?\n/g, "\r\n"))
              })
            })
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/ptyProcess" , (req,res) => {
          if (req.user) {
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
            res.sendFile(`${this.WebsitePath}/Gateway/pty.html`)
            io.once('connection', (client) => {
              logGA('[' + ip + '] Connected to Terminal:', req.user.username)
              client.on('disconnect', (err) => {
                logGA('[' + ip + '] Disconnected from Terminal:', req.user.username, "[" + err + "]")
              })
              var cols = 80
              var rows = 24
              var ptyProcess = pty.spawn("bash", [], {
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
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/install" , (req,res) => {
          if (req.user) {
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
            if (req.query.ext && this.website.EXTInstalled.indexOf(req.query.ext) == -1 && this.website.EXT.indexOf(req.query.ext) > -1) {
              res.sendFile(`${this.WebsitePath}/Gateway/install.html`)
              io.once('connection', async (socket) => {
                logGA(`[${ip}] Connected to installer Terminal Logs:`, req.user.username)
                socket.on('disconnect', (err) => {
                  logGA(`[${ip}] Disconnected from installer Terminal Logs:`, req.user.username, `[${err}]`)
                })
                this.lib.HyperWatch.stream().on('stdData', (data) => {
                  if (typeof data == "string") io.to(socket.id).emit("terminal.installer", data.replace(/\r?\n/g, "\r\n"))
                })
              })
            }
            else res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/EXTInstall" , (req,res) => {
          if (req.user) {
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
            if (req.query.EXT && this.website.EXTInstalled.indexOf(req.query.EXT) == -1 && this.website.EXT.indexOf(req.query.EXT) > -1) {
              console.log(`[GA] [WEBSITE] [${ip}] Request installation:`, req.query.EXT)
              var result = {
                error: false
              }
              var modulePath = `${this.root_path}/modules/`
              var Command= 'cd ' + modulePath + ' && git clone https://github.com/bugsounet/' + req.query.EXT + ' && cd ' + req.query.EXT + ' && npm install'
  
              var child = exec(Command, {cwd : modulePath } , (error, stdout, stderr) => {
                if (error) {
                  result.error = true
                  console.error("[GA] [WEBSITE] [INSTALL] [FATAL] exec error:", error)
                } else {
                  this.website.EXTInstalled = this.searchInstalled()
                  console.log("[GA] [WEBSITE] [INSTALL] [DONE]", req.query.EXT)
                }
                res.json(result)
              })
              child.stdout.pipe(process.stdout)
              child.stderr.pipe(process.stdout)
            }
            else res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/delete" , (req,res) => {
          if (req.user) {
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
            if (req.query.ext && this.website.EXTInstalled.indexOf(req.query.ext) > -1 && this.website.EXT.indexOf(req.query.ext) > -1) {
              res.sendFile(`${this.WebsitePath}/Gateway/delete.html`)
              io.once('connection', async (socket) => {
                logGA(`[${ip}] Connected to uninstaller Terminal Logs:`, req.user.username)
                socket.on('disconnect', (err) => {
                  logGA(`[${ip}] Disconnected from uninstaller Terminal Logs:`, req.user.username, `[${err}]`)
                })
                this.lib.HyperWatch.stream().on('stdData', (data) => {
                  if (typeof data == "string") io.to(socket.id).emit("terminal.delete", data.replace(/\r?\n/g, "\r\n"))
                })
              })
            }
            else res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/EXTDelete" , (req,res) => {
          if (req.user) {
            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
            if (req.query.EXT && this.website.EXTInstalled.indexOf(req.query.EXT) > -1 && this.website.EXT.indexOf(req.query.EXT) > -1) {
              console.log(`[GA] [WEBSITE] [${ip}] Request delete:`, req.query.EXT)
              var result = {
                error: false
              }
              var modulePath = `${this.root_path}/modules/`
              var Command= 'cd ' + modulePath + ' && rm -rfv ' + req.query.EXT
              var child = exec(Command, {cwd : modulePath } , (error, stdout, stderr) => {
                if (error) {
                  result.error = true
                  console.error("[GA] [WEBSITE] [DELETE] [FATAL] exec error:", error)
                } else {
                  this.website.EXTInstalled = this.searchInstalled()
                  console.log("[GA] [WEBSITE] [DELETE] [DONE]", req.query.EXT)
                }
                res.json(result)
              })
              child.stdout.pipe(process.stdout)
              child.stderr.pipe(process.stdout)
            }
            else res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/MMConfig" , (req,res) => {
          if (req.user) res.sendFile(`${this.WebsitePath}/Gateway/mmconfig.html`)
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/EXTCreateConfig" , (req,res) => {
          if (req.user) {
            if (req.query.ext &&
              this.website.EXTInstalled.indexOf(req.query.ext) > -1 && // is installed
              this.website.EXT.indexOf(req.query.ext) > -1 &&  // is an EXT
              this.website.EXTConfigured.indexOf(req.query.ext) == -1 // is not configured
            ) {
              res.sendFile(`${this.WebsitePath}/Gateway/EXTCreateConfig.html`)
            }
            else res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/EXTModifyConfig" , (req,res) => {
          if (req.user) {
            if (req.query.ext &&
              this.website.EXTInstalled.indexOf(req.query.ext) > -1 && // is installed
              this.website.EXT.indexOf(req.query.ext) > -1 &&  // is an EXT
              this.website.EXTConfigured.indexOf(req.query.ext) > -1 // is configured
            ) {
              res.sendFile(`${this.WebsitePath}/Gateway/EXTModifyConfig.html`)
            }
            else res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/EXTDeleteConfig" , (req,res) => {
          if (req.user) {
            if (req.query.ext &&
              this.website.EXTInstalled.indexOf(req.query.ext) == -1 && // is not installed
              this.website.EXT.indexOf(req.query.ext) > -1 &&  // is an EXT
              this.website.EXTConfigured.indexOf(req.query.ext) > -1 // is configured
            ) {
              res.sendFile(`${this.WebsitePath}/Gateway/EXTDeleteConfig.html`)
            }
            else res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/EXTGetCurrentConfig" , (req,res) => {
          if (req.user) {
            if(!req.query.ext) return res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
            var index = this.website.MMConfig.modules.map(e => { return e.module }).indexOf(req.query.ext)
            if (index > -1) {
              let data = this.website.MMConfig.modules[index]
              return res.send(data)
            }
            res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/EXTGetDefaultConfig" , (req,res) => {
          if (req.user) {
            if(!req.query.ext) return res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
            let data = require(`../website/config/${req.query.ext}/config.js`)
            res.send(data.default)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/EXTGetDefaultTemplate" , (req,res) => {
          if (req.user) {
            if(!req.query.ext) return res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
            let data = require(`../website/config/${req.query.ext}/config.js`)
            data.schema = this.makeSchemaTranslate(data.schema, this.website.schemaTranslatation)
            res.send(data.schema)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/EXTSaveConfig" , (req,res) => {
          if (req.user) {
            if(!req.query.config) return res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
            let data = req.query.config
            res.send(data)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .post("/writeEXT", async (req,res) => {
          if (req.user) {
            console.log("[GA] [WEBSITE] Receiving EXT data ...")
            let data = JSON.parse(req.body.data)
            var NewConfig = await this.configAddOrModify(data)
            var resultSaveConfig = await this.saveConfig(NewConfig)
            console.log("[GA] [WEBSITE] Write config result:", resultSaveConfig)
            res.send(resultSaveConfig)
            if (resultSaveConfig.done) {
              this.website.MMConfig = await this.readConfig()
              this.website.EXTConfigured= this.searchConfigured()
              console.log("[GA] [WEBSITE] Reload config")
            }
          } else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .post("/deleteEXT", async (req,res) => {
          if (req.user) {
            console.log("[GA] [WEBSITE] Receiving EXT data ...", req.body)
            let EXTName = req.body.data
            var NewConfig = await this.configDelete(EXTName)
            var resultSaveConfig = await this.saveConfig(NewConfig)
            console.log("[GA] [WEBSITE] Write config result:", resultSaveConfig)
            res.send(resultSaveConfig)
            if (resultSaveConfig.done) {
              this.website.MMConfig = await this.readConfig()
              this.website.EXTConfigured = this.searchConfigured()
              console.log("[GA] [WEBSITE] Reload config")
            }
          } else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/Tools" , (req,res) => {
          if (req.user) res.sendFile(`${this.WebsitePath}/Gateway/tools.html`)
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/System" , (req,res) => {
          if (req.user) {
            res.sendFile(`${this.WebsitePath}/Gateway/system.html`)
          } else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/About" , (req,res) => {
          if (req.user) res.sendFile(`${this.WebsitePath}/Gateway/about.html`)
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/3rdpartymodules", (req,res) => {
          if (req.user) res.sendFile(`${this.WebsitePath}/Gateway/3rdpartymodules.html`)
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/Restart" , (req,res) => {
          if (req.user) {
            res.sendFile(`${this.WebsitePath}/Gateway/restarting.html`)
            setTimeout(() => this.restartMM() , 1000)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/Die" , (req,res) => {
          if (req.user) {
            res.sendFile(`${this.WebsitePath}/Gateway/die.html`)
            setTimeout(() => this.doClose(), 3000)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/SystemRestart" , (req,res) => {
          if (req.user) {
            res.sendFile(`${this.WebsitePath}/Gateway/restarting.html`)
            setTimeout(() => this.SystemRestart() , 1000)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/SystemDie" , (req,res) => {
          if (req.user) {
            res.sendFile(`${this.WebsitePath}/Gateway/die.html`)
            setTimeout(() => this.SystemDie(), 3000)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/EditMMConfig" , (req,res) => {
          if (req.user) res.sendFile(`${this.WebsitePath}/Gateway/EditMMConfig.html`)
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/GetBackupName" , async (req,res) => {
          if (req.user) {
            var names = await this.loadBackupNames()
            res.send(names)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/GetBackupFile" , async (req,res) => {
          if (req.user) {
            let data = req.query.config
            var file = await this.loadBackupFile(data)
            res.send(file)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/GetRadioStations", (req,res) => {
          if (req.user) {
            if (!this.website.radio) return res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
            var allRadio = Object.keys(this.website.radio)
            res.send(allRadio)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .post("/loadBackup", async (req,res) => {
          if (req.user) {
            console.log("[GA] [WEBSITE] Receiving backup data ...")
            let file = req.body.data
            var loadFile = await this.loadBackupFile(file)
            var resultSaveConfig = await this.saveConfig(loadFile)
            console.log("[GA] [WEBSITE] Write config result:", resultSaveConfig)
            res.send(resultSaveConfig)
            if (resultSaveConfig.done) {
              this.website.MMConfig = await this.readConfig()
              console.log("[GA] [WEBSITE] Reload config")
            }
          } else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .post("/writeConfig", async (req,res) => {
          if (req.user) {
            console.log("[GA] [WEBSITE] Receiving config data ...")
            let data = JSON.parse(req.body.data)
            var resultSaveConfig = await this.saveConfig(data)
            console.log("[GA] [WEBSITE] Write config result:", resultSaveConfig)
            res.send(resultSaveConfig)
            if (resultSaveConfig.done) {
              this.website.MMConfig = await this.readConfig()
              console.log("[GA] [WEBSITE] Reload config")
            }
          } else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/getWebviewTag", (req,res) => {
          if(req.user) res.send(this.website.webviewTag)
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .post("/setWebviewTag", async (req,res) => {
          if(!this.website.webviewTag && req.user) {
            console.log("[GA] [WEBSITE] Receiving setWebviewTag demand...")
            let NewConfig = await this.setWebviewTag()
            var resultSaveConfig = await this.saveConfig(NewConfig)
            console.log("[GA] [WEBSITE] Write GA webview config result:", resultSaveConfig)
            res.send(resultSaveConfig)
            if (resultSaveConfig.done) {
              this.website.webviewTag = true
              this.website.MMConfig = await this.readConfig()
              console.log("[GA] [WEBSITE] Reload config")
            }
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/getGAVersion", (req,res) => {
          if (req.user) {
            if (this.website.EXTStatus.GA_Ready) this.website.GACheck.ready = true
            res.send(this.website.GACheck)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/getEXTStatus", (req,res) => {
          if (req.user) res.send(this.website.EXTStatus)
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .post("/EXT-Screen", (req, res) => {
          if(req.user) {
            let data = req.body.data
            if (data == "OFF") {
              this.sendSocketNotification("SendNoti", "EXT_SCREEN-FORCE_END")
              return res.send("ok")
            }
            if (data == "ON") {
              this.sendSocketNotification("SendNoti", "EXT_SCREEN-FORCE_WAKEUP")
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
            this.sendSocketNotification("REMOTE_ACTIVATE_ASSISTANT", { type: "TEXT", key: data })
            res.send("ok")
          }
          else res.send("error")
        })
  
        .post("/EXT-AlertQuery", (req, res) => {
          if(req.user) {
            let data = req.body.data
            if (!data) return res.send("error")
            this.sendSocketNotification("SendNoti", {
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
            this.sendSocketNotification("SendNoti", {
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
            this.sendSocketNotification("SendNoti", {
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
            this.sendSocketNotification("SendNoti", {
              noti: "EXT_SPOTIFY-SEARCH",
              payload: pl
            })
            res.send("ok")
          }
          else res.send("error")
        })
  
        .post("/EXT-SpotifyPlay", (req, res) => {
          if(req.user) {
            this.sendSocketNotification("SendNoti", "EXT_SPOTIFY-PLAY")
            res.send("ok")
          }
          else res.send("error")
        })
  
        .post("/EXT-SpotifyStop", (req, res) => {
          if(req.user) {
            this.sendSocketNotification("SendNoti", "EXT_SPOTIFY-STOP")
            res.send("ok")
          }
          else res.send("error")
        })
  
        .post("/EXT-SpotifyNext", (req, res) => {
          if(req.user) {
            this.sendSocketNotification("SendNoti", "EXT_SPOTIFY-NEXT")
            res.send("ok")
          }
          else res.send("error")
        })
  
        .post("/EXT-SpotifyPrevious", (req, res) => {
          if(req.user) {
            this.sendSocketNotification("SendNoti", "EXT_SPOTIFY-PREVIOUS")
            res.send("ok")
          }
          else res.send("error")
        })
  
        .post("/EXT-Updates", (req, res) => {
          if(req.user) {
            this.sendSocketNotification("SendNoti", "EXT_UPDATES-UPDATE")
            res.send("ok")
          }
          else res.send("error")
        })
  
        .post("/EXT-YouTubeQuery", (req, res) => {
          if(req.user) {
            let data = req.body.data
            if (!data) return res.send("error")
            if (this.website.EXTStatus["EXT-YouTube"].hello) {
              this.sendSocketNotification("SendNoti", {
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
          if(this.website.freeteuse && req.user) {
            let data = req.body.data
            if (!data) return res.send("error")
            this.sendSocketNotification("SendNoti", {
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
              var toListen= this.website.radio[data].notificationExec.payload()
              this.sendSocketNotification("SendNoti", {
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
            this.sendSocketNotification("SendStop")
            this.sendSocketNotification("SendNoti", "EXT_STOP")
            res.send("ok")
          }
          else res.send("error")
        })
  
        .post("/deleteBackup", async (req,res) => {
          if(req.user) {
            console.log("[GA] [WEBSITE] Receiving delete backup demand...")
            var deleteBackup = await this.deleteBackup()
            console.log("[GA] [WEBSITE] Delete backup result:", deleteBackup)
            res.send(deleteBackup)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .post("/readExternalBackup", async (req,res) => {
          if(req.user) {
            let data = req.body.data
            if (!data) return res.send({error: "error"})
            console.log("[GA] [WEBSITE] Receiving External backup...")
            var transformExternalBackup = await this.transformExternalBackup(data)
            res.send({ data: transformExternalBackup })
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .post("/saveExternalBackup", async (req,res) => {
          if(req.user) {
            let data = req.body.data
            if (!data) return res.send({error: "error"})
            console.log("[GA] [WEBSITE] Receiving External backup...")
            var linkExternalBackup = await this.saveExternalConfig(data)
            if (linkExternalBackup.data) {
              console.log("[GA] [WEBSITE] Generate link number:", linkExternalBackup.data)
              healthDownloader = (req_, res_) => {
                if (req_.params[0] == linkExternalBackup.data) {
                  res_.sendFile(`${this.GAPath}/download/${linkExternalBackup.data}.js`)
                  healthDownloader = function(req_, res_) {
                    res_.redirect('/')
                  }
                  setTimeout(() => {
                    this.deleteDownload(linkExternalBackup.data)
                  }, 1000 * 60)
                } else {
                  res_.redirect('/')
                }
              }
            }
            res.send(linkExternalBackup)
          }
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/activeVersion", (req,res) => {
          if (req.user) res.send(this.website.activeVersion)
          else res.status(403).sendFile(`${this.WebsitePath}/Gateway/403.html`)
        })
  
        .get("/download/*", (req,res) => {
          healthDownloader(req, res)
        })
  
        .get("/robots.txt", (req,res) => {
          res.sendFile(`${this.WebsitePath}/Gateway/robots.txt`)
        })

      if(!this.config.CLIENT_ID) {
        this.website.app
          .use('/smarthome/assets', express.static(`${this.WebsitePath}/assets`, options))
          .get("/smarthome/login/", (req,res) => {
            res.sendFile(`${this.WebsitePath}/SmartHome/disabled.html`)
          })
          .get("/smarthome/", (req,res) => {
            res.sendFile(`${this.WebsitePath}/SmartHome/disabled.html`)
          })
      }
      resolve()
    })
  }

  /** log any traffic **/
  logRequest(req, res, next) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    logGA(`[${ip}] [${req.method}] ${req.url}`)
    next()
  }

  /******************/
  /** Start Server **/
  /******************/
  async startServer(callback = () => {}) {
    /** Error 404 **/
    this.website.app
      .get("/smarthome/*", (req, res) => {
        console.warn("[GA] [SMARTHOME] Don't find:", req.url)
        res.status(404).sendFile(`${this.WebsitePath}/SmartHome/404.html`)
      })
    this.website.app
      .get("/*", (req, res) => {
        console.warn("[GA] [WEBSITE] Don't find:", req.url)
        res.status(404).sendFile(`${this.WebsitePath}/Gateway/404.html`)
      })

    /** Create Server **/
    this.config.listening = await this.purposeIP()
    this.website.server
      .listen(8081, "0.0.0.0", () => {
        console.log("[GA] [WEBSITE] [SERVER] Start listening on port 8081")
        console.log(`[GA] [WEBSITE] [SERVER] Available locally at http://${this.config.listening}:8081`)
        this.website.initialized= true
        callback(true)
      })
      .on("error", err => {
        console.error("[GA] [WEBSITE] [SERVER] Can't start web server!")
        console.error("[GA] [WEBSITE] [SERVER] Error:",err.message)
        this.sendSocketNotification("SendNoti", {
          noti: "EXT_ALERT",
          payload: {
            type: "error",
            message: "Can't start web server!",
            timer: 10000
          }
        })
        this.website.initialized= false
        callback(false)
      })
  }

  /*************/
  /*** Tools ***/
  /*************/
  readConfig() {
    return new Promise(resolve => {
      var MMConfig = undefined
      let file = `${this.root_path}/config/config.js`
      if (fs.existsSync(file)) {
        MMConfig = require(file)
        MMConfig = this.configStartMerge(MMConfig)
      }
      resolve(MMConfig)
    })
  }

  readTMPBackupConfig(file) {
    return new Promise(resolve => {
      var TMPConfig = undefined
      if (fs.existsSync(file)) {
        TMPConfig = require(file)
        TMPConfig = this.configStartMerge(TMPConfig)
        fs.unlink(file, (err) => {
          if (err) {
            resolve({error: "Error when deleting file" })
            return console.error("[GA] [WEBSITE] [DELETE] error", err)
          }
        })
        resolve(TMPConfig)
      }
    })
  }

  /** read streamsConfig.json of EXT-FreeboxTV**/
  readFreeteuseTV() {
    return new Promise(resolve => {
      var streamsConfig = undefined
      let file = `${this.root_path}/modules/EXT-FreeboxTV/streamsConfig.json`
      if (fs.existsSync(file)) streamsConfig = require(file)
      resolve(streamsConfig)
    })
  }

  readRadioRecipe() {
    return new Promise(resolve => {
      var RadioResult = undefined
      var lang = this.website.language
      let file = `${this.root_path}/modules/EXT-RadioPlayer/recipe/EXT-RadioPlayer.${lang}.js`
      try {
        if (fs.existsSync(file)) RadioResult = require(file).recipe.commands
      } catch (e) {
        resolve(RadioResult)
        console.error("[GA] [WEBSITE] [Radio] error when loading file", file)
      }
      resolve(RadioResult)
    })
  }

  /** search installed EXT from DB**/
  searchConfigured () {
    try {
      var Configured = []
      this.website.MMConfig.modules.find(m => {
        if (this.website.EXT.includes(m.module)) Configured.push(m.module)
      })
      return Configured.sort()
    } catch (e) {
      console.log("[GA] [WEBSITE] Error! " + e)
      return Configured.sort()
    }
  }

  /** search installed EXT **/
  searchInstalled () {
    var Installed = []
    var ext= this.website.EXT
    ext.find(m => {
      if (fs.existsSync(`${this.root_path}/modules/${m}/package.json`)) {
        let name = require(`${this.root_path}/modules/${m}/package.json`).name
        if (name == m) Installed.push(m)
        else console.warn(`[GA] [WEBSITE] Found: ${m} but in package.json name is not the same: ${name}`)
      }
    })
    return Installed.sort()
  }

  /** timeStamp for backup **/
  timeStamp() {
    var now = new Date(Date.now())
    var date = [ now.getFullYear(), now.getMonth() + 1, now.getDate() ]
    var time = [ now.getHours(), now.getMinutes(), now.getSeconds() ]
    for (var i = 0; i < 3; i++ ) {
      if (time[i] < 10) {
        time[i] = "0" + time[i]
      }
      if (date[i] < 10) {
        date[i] = "0" + date[i]
      }
    }
    return date.join("") + "-" +time.join(":")
  }

  /** Save MagicMirror config with backup **/
  saveConfig(MMConfig) {
    return new Promise(resolve => {
      var configPath = `${this.root_path}/config/config.js`
      var configPathTMP = `${this.root_path}/config/configTMP.js`
      let backupPath = `${this.GAPath}/backup/config.js.GA.${this.timeStamp()}`
      var source = fs.createReadStream(configPath)
      var destination = fs.createWriteStream(backupPath)

      source.pipe(destination, { end: false })
      source.on("end", () => {
        var header = "/*** GENERATED BY @bugsounet MMM-GoogleAssistant v" + require("../package.json").version + " ***/\n/*** https://forum.bugsounet.fr **/\n\nvar config = "
        var footer = "\n\n/*************** DO NOT EDIT THE LINE BELOW ***************/\nif (typeof module !== 'undefined') {module.exports = config;}\n"

        fs.writeFile(configPathTMP, header + util.inspect(MMConfig, {
            showHidden: false,
            depth: null,
            maxArrayLength: null,
            compact: false
          }) + footer,
          (error) => {
            if (error) {
              resolve({error: "Error when writing file" })
              return console.error("[GA] [WEBSITE] [WRITE] error", error)
            }
            console.log("[GA] Saved TMP configuration!")
            console.log("[GA] Backup saved in", backupPath)
            console.log("[GA] Check Function in config and revive it...")
            var FunctionSearch = new RegExp(/(.*)(`|')\[FUNCTION\](.*)(`|')/, "g")
            function readFileLineByLine(inputFile, outputFile) {
              fs.unlink(outputFile, (err) => {
                if (err) {
                  resolve({error: "Error when deleting file" })
                  return console.error("[GA] [WEBSITE] [DELETE] error", err)
                }
              })
              var instream = fs.createReadStream(inputFile)
              var outstream = new Stream()
              outstream.readable = true
              outstream.writable = true

              var rl = readline.createInterface({
                input: instream,
                output: outstream,
                terminal: false
              })

              rl.on('line', (line) => {
                var Search = FunctionSearch.exec(line)
                if (Search) {
                  var reviverFunction = this.reviver(Search)
                  line = reviverFunction
                  return fs.appendFileSync(outputFile, line + '\n')
                }
                fs.appendFileSync(outputFile, line + '\n')
              })
              instream.on("end", () => {
                fs.unlink(inputFile, (err) => {
                  if (err) {
                    resolve({error: "Error when deleting file" })
                    return console.error("[GA] [WEBSITE] [DELETE] error", err)
                  }
                  resolve({done: "ok" }) // !! ALL is ok !!
                })
              })
            }
            readFileLineByLine(configPathTMP, configPath)
          }
        )
      })
      destination.on("error", (error) => {
        resolve({error: "Error when writing file" })
        console.log("[GA] [WEBSITE] [WRITE]", error)
      })
    })
  }

  saveExternalConfig(Config) {
    return new Promise(resolve => {
      var time = Date.now()
      var configPathTMP = `${this.GAPath}/tmp/configTMP.js`
      var configPathOut = `${this.GAPath}/download/${time}.js`

      var header = "/*** GENERATED BY @bugsounet MMM-GoogleAssistant v" + require("../package.json").version + " ***/\n/*** https://forum.bugsounet.fr **/\n\nvar config = "
      var footer = "\n\n/*************** DO NOT EDIT THE LINE BELOW ***************/\nif (typeof module !== 'undefined') {module.exports = config;}\n"

      fs.writeFile(configPathTMP, header + util.inspect(Config, {
          showHidden: false,
          depth: null,
          maxArrayLength: null,
          compact: false
        }) + footer,
        (error) => {
          if (error) {
            resolve({error: "Error when writing file" })
            return console.error("[GA] [WEBSITE] [WRITE] error", error)
          }

          var FunctionSearch = new RegExp(/(.*)(`|')\[FUNCTION\](.*)(`|')/, "g")
          function readFileLineByLine(inputFile, outputFile) {
            var instream = fs.createReadStream(inputFile)
            var outstream = new Stream()
            outstream.readable = true
            outstream.writable = true

            var rl = readline.createInterface({
              input: instream,
              output: outstream,
              terminal: false
            })

            rl.on('line', (line) => {
              var Search = FunctionSearch.exec(line)
              if (Search) {
                var reviverFunction = this.reviver(Search)
                line = reviverFunction
                return fs.appendFileSync(outputFile, line + '\n')
              }
              fs.appendFileSync(outputFile, line + '\n')
            })
            instream.on("end", () => {
              console.log("[GA] [WEBSITE] Saved new backup configuration for downloading !")
              fs.unlink(inputFile, (err) => {
                if (err) {
                  resolve({error: "Error when deleting file" })
                  return console.error("[GA] [WEBSITE] [DELETE] error", err)
                }
                resolve({ data: time })
              })
            })
          }
          readFileLineByLine(configPathTMP, configPathOut)
        }
      )
    })
  }

  deleteDownload(file) {
    var inputFile = `${this.GAPath}/download/${file}.js`
    fs.unlink(inputFile, (err) => {
      if (err) {
        return console.error("[GA] error", err)
      }
      console.log('[GA] [WEBSITE] Successfully deleted:', inputFile)
    })
  }

  transformExternalBackup(backup) {
    return new Promise(resolve => {
      var tmpFile = `${this.GAPath}/tmp/config.tmp${this.timeStamp()}`
      fs.writeFile(tmpFile, backup, async (err) => {
        if (err) {
          console.log("[GA] [WEBSITE] [externalBackup]", err)
          resolve({error: "Error when writing external tmp backup file" })
        } else {
          result = await this.readTMPBackupConfig(tmpFile)
          resolve(result)
        }
      })
    })
  }

  /** insert or modify plugins config to MagicMirror config **/
  configAddOrModify(EXTConfig) {
    return new Promise(resolve => {
      let index = this.website.MMConfig.modules.map(e => { return e.module }).indexOf(EXTConfig.module)
      if (index > -1) this.website.MMConfig.modules[index] = EXTConfig
      else this.website.MMConfig.modules.push(EXTConfig)
      resolve(this.website.MMConfig)
    })
  }

  /** delete plugins config **/
  configDelete(EXT) {
    return new Promise(resolve => {
      let index = this.website.MMConfig.modules.map(e => { return e.module }).indexOf(EXT)
      this.website.MMConfig.modules.splice(index, 1) // delete modules
      resolve(this.website.MMConfig)
    })
  }

  /** list of all backups **/
  loadBackupNames() {
    return new Promise(resolve => {
      const regex = "config.js.GA"
      var List = []
      var FileList = fs.readdirSync(`${this.GAPath}/backup/`)
      FileList.forEach((file) => {
        const testFile = file.match(regex)
        if (testFile) List.push(file)
      })
      List.sort()
      List.reverse()
      resolve(List)
    })
  }

  /** delete all backups **/
  deleteBackup() {
    return new Promise(resolve => {
      const regex = "config.js.GA"
      var FileList = fs.readdirSync(`${this.GAPath}/backup/`)
      FileList.forEach((file) => {
        const testFile = file.match(regex)
        if (testFile) {
          let pathFile= `${this.GAPath}/backup/${file}`
          try {
            fs.unlinkSync(pathFile)
            logGA("Removed:", file)
          } catch (e) {
            console.error("[GA] [WEBSITE] Error occurred while trying to remove this file:", file)
          }
        }
      })
      resolve({done: "ok"})
    })
  }

  /** read and send bakcup **/
  loadBackupFile(file) {
    return new Promise(resolve => {
      var BackupConfig = {}
      let filePath = `${this.GAPath}/backup/${file}`
      if (fs.existsSync(filePath)) {
        BackupConfig = require(filePath)
        BackupConfig = this.configStartMerge(BackupConfig)
      }
      resolve(BackupConfig)
    })
  }

  /** get default ip address **/
  getIP () {
    return new Promise((resolve) => {
      si.networkInterfaceDefault()
        .then(defaultInt=> {
          si.networkInterfaces().then(data => {
            var Interfaces= []
            var int =0
            data.forEach(Interface => {
              var info = {}
              if (Interface.type == "wireless") {
                info = {
                  ip: Interface.ip4 ? Interface.ip4 : "unknow",
                  default: (Interface.iface == defaultInt) ? true: false
                }
              }
              if (Interface.type == "wired") {
                info = {
                  ip: Interface.ip4 ? Interface.ip4 : "unknow",
                  default: (Interface.iface == defaultInt) ? true: false
                }
              }
              if (Interface.iface != "lo") Interfaces.push(info)
              if (int == data.length-1) resolve(Interfaces)
              else int +=1
            })
          })
        })
        .catch(error => {
          var info = {}
          info = {
            ip: "127.0.0.1",
            default: true
          }
          Interfaces.push(info)
          resolve(Interfaces)
        })
    })
  }

  /** search and purpose and ip address **/
  async purposeIP() {
    var IP = await this.getIP()
    var found = 0
    return new Promise(resolve => {
      IP.forEach(network => {
        if (network.default) {
          resolve(network.ip)
          found = 1
          return
        }
      })
      if (!found) resolve("127.0.0.1")
    })
  }

  /** config merge **/
  configStartMerge(result) {
    var stack = Array.prototype.slice.call(arguments, 0)
    var item
    var key
    while (stack.length) {
      item = stack.shift()
      for (key in item) {
        if (item.hasOwnProperty(key)) {
          if (typeof result[key] === "object" && result[key] && Object.prototype.toString.call(result[key]) !== "[object Array]") {
            if (typeof item[key] === "object" && item[key] !== null) {
              result[key] = this.configStartMerge({}, result[key], item[key])
            } else {
              result[key] = item[key]
            }
          } else {

            if (Object.prototype.toString.call(result[key]) == "[object Array]") {
              result[key] = this.configStartMerge([], result[key], item[key])
            } else if (Object.prototype.toString.call(result[key]) == "[object Object]") {
              result[key] = this.configStartMerge({}, result[key], item[key])
            } else if (Object.prototype.toString.call(result[key]) == "[object Function]") {
               let tmp = JSON.stringify(item[key], this.replacer, 2)
               tmp = tmp.slice(0, -1)
               tmp = tmp.slice(1)
               result[key] = tmp
            } else {
               result[key] = item[key]
            }
          }
        }
      }
    }
    return result
  }

  configMerge(result) {
    var stack = Array.prototype.slice.call(arguments, 1)
    var item
    var key
    while (stack.length) {
      item = stack.shift()
      for (key in item) {
        if (item.hasOwnProperty(key)) {
          if (typeof result[key] === "object" && result[key] && Object.prototype.toString.call(result[key]) !== "[object Array]") {
            if (typeof item[key] === "object" && item[key] !== null) {
              result[key] = this.configMerge({}, result[key], item[key])
            } else {
              result[key] = item[key]
            }
          } else result[key] = item[key]
        }
      }
    }
    return result
  }

  /** check electron Options for find webviewTag **/
  checkElectronOptions() {
    let config = this.website.MMConfig
    if (typeof config.electronOptions === "object" &&
      typeof config.electronOptions.webPreferences === "object" &&
      config.electronOptions.webPreferences.webviewTag
    ) return true
    else return false
  }

  /** enable webview tag **/
  setWebviewTag() {
    return new Promise(resolve => {
      let options = {
        electronOptions: {
          webPreferences: {
            webviewTag: true
          }
        }
      }
      let MMConfig = this.configMerge({}, this.website.MMConfig, options)
      resolve(MMConfig)
    })
  }

  /** Restart or Die the Pi **/
  SystemRestart () {
    console.log("[GA] Restarting OS...")
    exec("sudo reboot now", (err,stdout,stderr) => {
      if (err) console.error("[GA] Error when restarting OS!", err)
    })
  }

  SystemDie () {
    console.log("[GA] Shutdown OS...")
    exec("sudo shutdown now", (err,stdout,stderr) => {
      if (err) console.error("[GA] Error when Shutdown OS!", err)
    })
  }

  /** read and search GA config **/
  getGAConfig (config) {
    var index = this.website.MMConfig.modules.map(e => { return e.module }).indexOf("MMM-GoogleAssistant")
    if (index > -1) return this.website.MMConfig.modules[index]
    else return {}
  }

  /** create schema Validation with template and translation **/
  makeSchemaTranslate(schema, translation) {
    /* replace {template} by translation */
    function translate(template) {
      return template.replace(new RegExp("{([^}]+)}", "g"), function (_unused, varName) {
        if (varName in translation === false) console.warn("[GA] [WEBSITE] [Translator] Missing:", template)
        return varName in translation ? translation[varName] : "{" + varName + "}"
      })
    }

    /* read object in deep an search what translate */
    function makeTranslate(result) {
      var stack = Array.prototype.slice.call(arguments, 0)
      var item
      var key
      while (stack.length) {
        item = stack.shift()
        for (key in item) {
          if (item.hasOwnProperty(key)) {
            if (typeof result[key] === "object" && result[key] && Object.prototype.toString.call(result[key]) !== "[object Array]") {
              if (typeof item[key] === "object" && item[key] !== null) {
                result[key] = makeTranslate({}, result[key], item[key])
              } else {
                result[key] = item[key]
              }
            } else {
              if ((key == "title" || key == "description") && result[key]) {
                result[key] = translate(item[key])
              }
              else result[key] = item[key]
            }
          }
        }
      }
      return result
    }
    return makeTranslate(schema)
  }

  /** create logs file from array **/
  readAllMMLogs(logs) {
    return new Promise(resolve => {
      var result = ""
      logs.forEach(log => {
        result += log.replace(/\r?\n/g, "\r\n")
      })
      resolve(result)
    })
  }

  /** set plugin as used and search version/rev **/
  async setActiveVersion(module) {
    if (this.website.activeVersion[module] != undefined) {
      this.sendSocketNotification("ERROR", "Already Activated: " + module)
      console.error("Already Activated: " + module)
      return
    }
    else console.log("[GA] [WEBSITE] Detected:", module)
    this.website.activeVersion[module] = {
      version: require("../../" + module + "/package.json").version,
      rev: require("../../" + module + "/package.json").rev
    }

    let scanUpdate = await this.checkUpdate(module, this.website.activeVersion[module].version)
    this.website.activeVersion[module].last = scanUpdate.last
    this.website.activeVersion[module].update = scanUpdate.update
    this.website.activeVersion[module].beta = scanUpdate.beta

    // scan every 60secs or every 15secs with GA app
    // I'm afraid about lag time...
    // maybe 60 secs is better
    setInterval(() => {
      this.checkUpdateInterval(module, this.website.activeVersion[module].version)
    }, 1000 * 60)
  }

  async checkUpdateInterval(module,version) {
    let scanUpdate = await this.checkUpdate(module,version)
    this.website.activeVersion[module].last = scanUpdate.last
    this.website.activeVersion[module].update = scanUpdate.update
    this.website.activeVersion[module].beta = scanUpdate.beta
  }

  checkUpdate(module, version) {
    let branch = mainBranch[module] || "main"
    let remoteFile = "https://raw.githubusercontent.com/bugsounet/"+ module + "/"+ branch + "/package.json"
    let result = {
      last: version,
      update: false,
      beta: false
    }
    return new Promise (resolve => {
      fetch(remoteFile)
        .then(response => response.json())
        .then(data => {
          result.last = data.version
          if (semver.gt(result.last, version)) result.update = true
          else if (semver.gt(version, result.last)) result.beta = true
          resolve(result)
        })
        .catch(async e => {
          console.error(`[GA] Error on fetch last version of ${module} in ${branch} branch:`, e.message)
          resolve(result)
        })
    })
  }

  // Function() in config ?
  replacer(key, value) {
    if (typeof value == "function") {
      return "[FUNCTION]" + value.toString()
    }
    return value
  }

  reviver(value) {
    // value[1] = feature
    // value[3] = function()
    //console.log("[GA][FUNCTION] Function found!")
    var charsReplacer = value[3].replace(/\\n/g,'\n')
    charsReplacer = charsReplacer.replace(/\\/g, '')
    var result = value[1] + charsReplacer
    //console.log("[GA][FUNCTION] Reviver line:\n", result)
    return result
  }

  getHomeText () {
    return new Promise (async resolve => {
      var Home = null
      let lang = this.website.language 
      let langHome = `${this.WebsitePath}/home/${lang}.home`
      let defaultHome = `${this.WebsitePath}/home/default.home`
      if (fs.existsSync(langHome)) {
        console.log(`[GA] [WEBSITE] [TRANSLATION] [HOME] Use: ${lang}.home`)
        Home = await this.readThisFile(langHome)
      } else  {
        console.log("[GA] [WEBSITE] [TRANSLATION] [HOME] Use: default.home")
        Home = await this.readThisFile(defaultHome)
      }
      resolve(Home)
    })
  }

  readThisFile (file) {
    return new Promise (resolve => {
      fs.readFile(file, (err, input) => {
        if (err) {
          console.log("[GA] [WEBSITE] [TRANSLATION] [HOME] Error", err)
          resolve()
        }
        resolve(input.toString())
      })
    })
  }

  MMConfigAddress () {
    return new Promise (resolve => {
      if (this.website.MMConfig.address == "0.0.0.0") {
        this.website.errorInit = true
        console.error("[GA] Error: You can't use '0.0.0.0' in MagicMirror address config")
        this.sendSocketNotification("ERROR", "You can't use '0.0.0.0' in MagicMirror address config")
        setTimeout(() => process.exit(), 5000)
        resolve(true)
      } else resolve(false)
    })
  }

  /** Check using pm2 **/
  check_PM2_Process() {
    console.log("[GA] [WEBSITE] [PM2] checking PM2 using...")
    return new Promise(resolve => {
      pm2.connect(err => {
        if (err) {
          console.error("[GA] [WEBSITE] [PM2]", err)
          resolve(false)
          return
        }
        pm2.list((err, list) => {
          if (err) {
            console.error("[GA] [WEBSITE] [PM2] Can't get process List!", err)
            resolve(false)
            return
          }
          list.forEach(pm => {
            if (pm.pm2_env.version === this.MMVersion && pm.pm2_env.status === "online" && pm.pm2_env.pm_cwd.includes(`${this.root_path}/`)) {
              this.website.PM2Process = pm.name
              console.log("[GA] [WEBSITE] [PM2] You are using PM2 with", this.website.PM2Process)
              resolve(true)
            }
          })
          pm2.disconnect()
          if (!this.website.PM2Process) {
            console.log("[GA] [WEBSITE] [PM2] You don't use PM2")
            resolve(false)
          }
        })
      })
    })
  }

  /** MagicMirror restart and stop **/
  restartMM () {
    if (this.website.usePM2) {
      console.log("[GA] [WEBSITE] PM2 will restarting MagicMirror...")
      pm2.restart(this.website.PM2Process, (err, proc) => {
        if (err) {
          console.error("[GA] [WEBSITE] [PM2] Restart:" + err)
        }
      })
    }
    else this.doRestart()
  }

  doRestart () {
    console.log("[GA] [WEBSITE] Restarting MagicMirror...")
    const out = process.stdout
    const err = process.stderr
    const subprocess = spawn("npm start", {cwd: this.root_path, shell: true, detached: true , stdio: [ 'ignore', out, err ]})
    subprocess.unref()
    process.exit()
  }

  doClose () {
    console.log("[GA] [WEBSITE] Closing MagicMirror...")
    if (this.website.usePM2) {
      pm2.stop(this.website.PM2Process, (err, proc) => {
        if (err) {
          console.error("[GA] [WEBSITE] [PM2] stop: " + err)
        }
      })
    }
    else process.exit()
  }

  setEXTStatus(EXTs) {
    this.website.EXTStatus = EXTs
  }

  getEXTStatus() {
    return this.website.EXTStatus
  }
}

module.exports=website
