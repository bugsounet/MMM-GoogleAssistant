/** EXT Tools **/

const mainBranch = {
  "MMM-GoogleAssistant" : "prod",
  "Gateway" : "master",
  "EXT-Alert" : "master",
  "EXT-Background" : "master",
  "EXT-Bard" : "main",
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

function readConfig(that) {
  return new Promise(resolve => {
    var MMConfig = undefined
    let file = that.lib.path.resolve(__dirname, "../../../config/config.js")
    if (that.lib.fs.existsSync(file)) {
      MMConfig = require(file)
      MMConfig = configStartMerge(MMConfig)
    }
    resolve(MMConfig)
  })
}

function readTMPBackupConfig(that,file) {
  return new Promise(resolve => {
    var TMPConfig = undefined
    if (that.lib.fs.existsSync(file)) {
      TMPConfig = require(file)
      TMPConfig = configStartMerge(TMPConfig)
      that.lib.fs.unlink(file, (err) => {
        if (err) {
          //resolve({error: "Error when deleting file" })
          return console.error("[GA] error", err)
        }
      })
      resolve(TMPConfig)
    }
  })
}

/** read streamsConfig.json of EXT-FreeboxTV**/
function readFreeteuseTV(that) {
  return new Promise(resolve => {
    var streamsConfig = undefined
    let file = that.lib.path.resolve(__dirname, "../../EXT-FreeboxTV/streamsConfig.json")
    if (that.lib.fs.existsSync(file)) streamsConfig = require(file)
    resolve(streamsConfig)
  })
}

function readRadioRecipe(that) {
  return new Promise(resolve => {
    var RadioResult = undefined
    var lang = that.EXT.language
    let file = that.lib.path.resolve(__dirname, "../../EXT-RadioPlayer/recipe/EXT-RadioPlayer."+lang+".js")
    try {
      if (that.lib.fs.existsSync(file)) RadioResult = require(file).recipe.commands
    } catch (e) {
      resolve(RadioResult)
      console.error("[GA] [Radio] error when loading file", file)
    }
    resolve(RadioResult)
  })
}

/** search installed EXT from DB**/
function searchConfigured (config,ext) {
  try {
    var Configured = []
    config.modules.find(m => {
      if (ext.includes(m.module)) Configured.push(m.module)
    })
    return Configured.sort()
  } catch (e) {
    console.log("[GA] Error! " + e)
    return Configured.sort()
  }
}

/** search installed EXT **/
function searchInstalled (that) {
  var Installed = []
  var ext= that.EXT.EXT
  ext.find(m => {
    if (that.lib.fs.existsSync(that.lib.path.resolve(__dirname + "/../../" + m + "/package.json"))) {
      let name = require((that.lib.path.resolve(__dirname + "/../../" + m + "/package.json"))).name
      if (name == m) Installed.push(m)
      else console.warn("[GA] Found:", m, "but in package.json name is not the same:", name)
    }
  })
  return Installed.sort()
}

/** search if GA installed **/
function searchGA (that) {
  var version = 0
  if (that.lib.fs.existsSync(that.lib.path.resolve(__dirname + "/../../MMM-GoogleAssistant/package.json"))) {
    let name = require((that.lib.path.resolve(__dirname + "/../../MMM-GoogleAssistant/package.json"))).name
    if (name == "MMM-GoogleAssistant") {
      version = require((that.lib.path.resolve(__dirname + "/../../MMM-GoogleAssistant/package.json"))).version
    }
    else console.warn("[GA] Found: MMM-GoogleAssistant but in package.json name is not the same:", name)
  }
  return version
}

/** timeStamp for backup **/
function timeStamp() {
  var now = new Date()
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
function saveConfig(that,MMConfig) {
  return new Promise(resolve => {
    var configPath = that.lib.path.resolve(__dirname, "../../../config/config.js")
    var configPathTMP = that.lib.path.resolve(__dirname, "../../../config/configTMP.js")
    let backupPath = that.lib.path.resolve(__dirname, "../backup/config.js.GW." + timeStamp())
    var source = that.lib.fs.createReadStream(configPath)
    var destination = that.lib.fs.createWriteStream(backupPath)

    source.pipe(destination, { end: false })
    source.on("end", () => {
      var header = "/*** GENERATED BY @bugsounet Gateway v" + require("../package.json").version + " ***/\n/*** https://forum.bugsounet.fr **/\n\nvar config = "
      var footer = "\n\n/*************** DO NOT EDIT THE LINE BELOW ***************/\nif (typeof module !== 'undefined') {module.exports = config;}\n"

      that.lib.fs.writeFile(configPathTMP, header + that.lib.util.inspect(MMConfig, {
          showHidden: false,
          depth: null,
          maxArrayLength: null,
          compact: false
        }) + footer,
        (error) => {
          if (error) {
            resolve({error: "Error when writing file" })
            return console.error("[GA] error", error)
          }
          console.log("[GA] Gateway saved TMP configuration!")
          console.log("[GA] Backup saved in", backupPath)
          console.log("[GA] Gateway check Function in config and revive it...")
          var FunctionSearch = new RegExp(/(.*)(`|')\[FUNCTION\](.*)(`|')/, "g")
          function readFileLineByLine(inputFile, outputFile) {
            that.lib.fs.unlink(outputFile, (err) => {
              if (err) {
                resolve({error: "Error when deleting file" })
                return console.error("[GA] error", err)
              }
            })
            var instream = that.lib.fs.createReadStream(inputFile)
            var outstream = new that.lib.Stream()
            outstream.readable = true
            outstream.writable = true

            var rl = that.lib.readline.createInterface({
              input: instream,
              output: outstream,
              terminal: false
            })

            rl.on('line', (line) => {
              var Search = FunctionSearch.exec(line)
              if (Search) {
                var reviverFunction = reviver(Search)
                line = reviverFunction
                return that.lib.fs.appendFileSync(outputFile, line + '\n')
              }
              that.lib.fs.appendFileSync(outputFile, line + '\n')
            })
            instream.on("end", () => {
              that.lib.fs.unlink(inputFile, (err) => {
                if (err) {
                  resolve({error: "Error when deleting file" })
                  return console.error("[GA] error", err)
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
      console.log("[GA]", error)
    })
  })
}

function saveExternalConfig(that,Config) {
  return new Promise(resolve => {
    var time = Date.now()
    var configPathTMP = that.lib.path.resolve(__dirname, "../tmp/configTMP.js")
    var configPathOut = that.lib.path.resolve(__dirname, "../download/" + time + ".js")

    var header = "/*** GENERATED BY @bugsounet Gateway v" + require("../package.json").version + " ***/\n/*** https://forum.bugsounet.fr **/\n\nvar config = "
    var footer = "\n\n/*************** DO NOT EDIT THE LINE BELOW ***************/\nif (typeof module !== 'undefined') {module.exports = config;}\n"

    that.lib.fs.writeFile(configPathTMP, header + that.lib.util.inspect(Config, {
        showHidden: false,
        depth: null,
        maxArrayLength: null,
        compact: false
      }) + footer,
      (error) => {
        if (error) {
          resolve({error: "Error when writing file" })
          return console.error("[GA] error", error)
        }

        var FunctionSearch = new RegExp(/(.*)(`|')\[FUNCTION\](.*)(`|')/, "g")
        function readFileLineByLine(inputFile, outputFile) {
          var instream = that.lib.fs.createReadStream(inputFile)
          var outstream = new that.lib.Stream()
          outstream.readable = true
          outstream.writable = true

          var rl = that.lib.readline.createInterface({
            input: instream,
            output: outstream,
            terminal: false
          })

          rl.on('line', (line) => {
            var Search = FunctionSearch.exec(line)
            if (Search) {
              var reviverFunction = reviver(Search)
              line = reviverFunction
              return that.lib.fs.appendFileSync(outputFile, line + '\n')
            }
            that.lib.fs.appendFileSync(outputFile, line + '\n')
          })
          instream.on("end", () => {
            console.log("[GA] Gateway saved new backup configuration for downloading !")
            that.lib.fs.unlink(inputFile, (err) => {
              if (err) {
                resolve({error: "Error when deleting file" })
                return console.error("[GA] error", err)
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

function deleteDownload(that,file) {
  var inputFile = that.lib.path.resolve(__dirname, "../download/" + file + ".js")
  that.lib.fs.unlink(inputFile, (err) => {
    if (err) {
      return console.error("[GA] error", err)
    }
    console.log('[GA] Successfully deleted:', inputFile)
  })
}

function transformExternalBackup(that,backup) {
  return new Promise(resolve => {
    var tmpFile = that.lib.path.resolve(__dirname, "../tmp/config.tmp" + timeStamp())
    that.lib.fs.writeFile(tmpFile, backup, async (err) => {
      if (err) {
        console.log("[GA][externalBackup]", err)
        resolve({error: "Error when writing external tmp backup file" })
      } else {
        result = await readTMPBackupConfig(that,tmpFile)
        resolve(result)
      }
    })
  })
}

/** insert or modify plugins config to MagicMirror config **/
function configAddOrModify(EXTConfig, MMConfig) {
  return new Promise(resolve => {
    modules = MMConfig.modules
    index = modules.map(e => { return e.module }).indexOf(EXTConfig.module)
    if (index > -1) modules[index] = EXTConfig
    else modules.push(EXTConfig)
    resolve(MMConfig)
  })
}

/** delete plugins config **/
function configDelete(EXT, MMConfig) {
  return new Promise(resolve => {
    modules = MMConfig.modules
    index = modules.map(e => { return e.module }).indexOf(EXT)
    modules.splice(index, 1) // delete modules
    resolve(MMConfig)
  })
}

/** list of all backups **/
function loadBackupNames(that) {
  return new Promise(resolve => {
    const regex = "config.js.GW"
    var List = []
    var FileList = that.lib.fs.readdirSync(that.lib.path.resolve(__dirname, "../backup/"))
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
function deleteBackup(that) {
  return new Promise(resolve => {
    const regex = "config.js.GW"
    var FileList = that.lib.fs.readdirSync(that.lib.path.resolve(__dirname, "../backup/"))
    FileList.forEach((file) => {
      const testFile = file.match(regex)
      if (testFile) {
        pathFile= that.lib.path.resolve(__dirname, "../backup/"+file)
        try {
          that.lib.fs.unlinkSync(pathFile)
          //console.log("[GA] Removed:", file)
        } catch (e) {
          console.error("[GA] Error occurred while trying to remove this file:", file)
        }
      }
    })
    resolve({done: "ok"})
  })
}

/** read and send bakcup **/
function loadBackupFile(that,file) {
  return new Promise(resolve => {
    var BackupConfig = {}
    let filePath = that.lib.path.resolve(__dirname, "../backup/" + file)
    if (that.lib.fs.existsSync(filePath)) {
      BackupConfig = require(filePath)
      BackupConfig = configStartMerge(BackupConfig)
    }
    resolve(BackupConfig)
  })
}

/** get default ip address **/
function getIP (that) {
  return new Promise((resolve) => {
    that.lib.si.networkInterfaceDefault()
      .then(defaultInt=> {
        that.lib.si.networkInterfaces().then(data => {
          var Interfaces= []
          var int =0
          data.forEach(interface => {
            var info = {}
            if (interface.type == "wireless") {
              info = {
                ip: interface.ip4 ? interface.ip4 : "unknow",
                default: (interface.iface == defaultInt) ? true: false
              }
            }
            if (interface.type == "wired") {
              info = {
                ip: interface.ip4 ? interface.ip4 : "unknow",
                default: (interface.iface == defaultInt) ? true: false
              }
            }
            if (interface.iface != "lo") Interfaces.push(info)
            if (int == data.length-1) resolve(Interfaces)
            else int +=1
          })
        })
      })
      .catch(error => {
        console.log(error)
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
async function purposeIP(that) {
  var IP = await getIP(that)
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
function configStartMerge(result) {
  var stack = Array.prototype.slice.call(arguments, 0)
  var item
  var key
  while (stack.length) {
    item = stack.shift()
    for (key in item) {
      if (item.hasOwnProperty(key)) {
        if (typeof result[key] === "object" && result[key] && Object.prototype.toString.call(result[key]) !== "[object Array]") {
          if (typeof item[key] === "object" && item[key] !== null) {
            result[key] = configStartMerge({}, result[key], item[key])
          } else {
            result[key] = item[key]
          }
        } else {

          if (Object.prototype.toString.call(result[key]) == "[object Array]") {
            result[key] = configStartMerge([], result[key], item[key])
          } else if (Object.prototype.toString.call(result[key]) == "[object Object]") {
            result[key] = configStartMerge({}, result[key], item[key])
          } else if (Object.prototype.toString.call(result[key]) == "[object Function]") {
             let tmp = JSON.stringify(item[key], replacer, 2)
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

function configMerge(result) {
  var stack = Array.prototype.slice.call(arguments, 1)
  var item
  var key
  while (stack.length) {
    item = stack.shift()
    for (key in item) {
      if (item.hasOwnProperty(key)) {
        if (typeof result[key] === "object" && result[key] && Object.prototype.toString.call(result[key]) !== "[object Array]") {
          if (typeof item[key] === "object" && item[key] !== null) {
            result[key] = configMerge({}, result[key], item[key])
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
function checkElectronOptions(config) {
  if (typeof config.electronOptions === "object" &&
    typeof config.electronOptions.webPreferences === "object" &&
    config.electronOptions.webPreferences.webviewTag
  ) return true
  else return false
}

/** enable webview tag **/
function setWebviewTag(MMConfig) {
  return new Promise(resolve => {
    let options = {
      electronOptions: {
        webPreferences: {
          webviewTag: true
        }
      }
    }
    MMConfig = configMerge({}, MMConfig, options)
    resolve(MMConfig)
  })
}

/** Restart or Die the Pi **/
function SystemRestart (that) {
  console.log("[GA] Restarting OS...")
  that.lib.childProcess.exec("sudo reboot now", (err,stdout,stderr) => {
    if (err) console.error("[GA] Error when restarting OS!", err)
  })
}

function SystemDie (that) {
  console.log("[GA] Shutdown OS...")
  that.lib.childProcess.exec("sudo shutdown now", (err,stdout,stderr) => {
    if (err) console.error("[GA] Error when Shutdown OS!", err)
  })
}

/** read and search GA config **/
function getGAConfig (config) {
  var index = config.modules.map(e => { return e.module }).indexOf("MMM-GoogleAssistant")
  if (index > -1) return config.modules[index]
  else return {}
}

/** create schema Validation with template and translation **/
function makeSchemaTranslate(schema, translation) {
  /* replace {template} by translation */
  function translate(template) {
    return template.replace(new RegExp("{([^}]+)}", "g"), function (_unused, varName) {
      if (varName in translation === false) console.warn("[GA][Translator] Missing:", template)
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

/** create logs file fom array **/
function readAllMMLogs(logs) {
  return new Promise(resolve => {
    var result = ""
    logs.forEach(log => {
      result += log.replace(/\r?\n/g, "\r\n")
    })
    resolve(result)
  })
}

/** set plugin as used and search version/rev **/
async function setActiveVersion(module,that) {
  if (that.EXT.activeVersion[module] != undefined) {
    that.sendSocketNotification("ERROR", "Already Activated: " + module)
    console.error("Already Activated: " + module)
    return
  }
  else console.log("[GA] Detected:", module)
  that.EXT.activeVersion[module] = {
    version: (module == "Gateway") ? require("../package.json").version : require("../../" + module + "/package.json").version,
    rev: (module == "Gateway") ? require("../package.json").rev : require("../../" + module + "/package.json").rev
  }

  let scanUpdate = await checkUpdate(module, that.EXT.activeVersion[module].version, that)
  that.EXT.activeVersion[module].last = scanUpdate.last
  that.EXT.activeVersion[module].update = scanUpdate.update
  that.EXT.activeVersion[module].beta = scanUpdate.beta

  // scan every 60secs or every 15secs with gateway app
  // I'm afraid about lag time...
  // maybe 60 secs is better
  setInterval(() => {
    checkUpdateInterval(module, that.EXT.activeVersion[module].version, that)
  }, 1000 * 60)
}

async function checkUpdateInterval(module,version, that) {
  let scanUpdate = await checkUpdate(module,version, that)
  that.EXT.activeVersion[module].last = scanUpdate.last
  that.EXT.activeVersion[module].update = scanUpdate.update
  that.EXT.activeVersion[module].beta = scanUpdate.beta
}

function checkUpdate(module, version, that) {
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
        if (that.lib.semver.gt(result.last, version)) result.update = true
        else if (that.lib.semver.gt(version, result.last)) result.beta = true
        resolve(result)
      })
      .catch(async e => {
        console.error(`[GA] Error on fetch last version of ${module} in ${branch} branch:`, e.message)
        resolve(result)
      })
  })
}

// Function() in config ?
function replacer(key, value) {
  if (typeof value == "function") {
    return "[FUNCTION]" + value.toString()
  }
  return value
}

function reviver(value) {
  // value[1] = feature
  // value[3] = function()
  //console.log("[GA][FUNCTION] Function found!")
  var charsReplacer = value[3].replace(/\\n/g,'\n')
  charsReplacer = charsReplacer.replace(/\\/g, '')
  var result = value[1] + charsReplacer
  //console.log("[GA][FUNCTION] Reviver line:\n", result)
  return result
}

function getHomeText (lib,lang) {
  return new Promise (async resolve => {
    var Home = null
    let langHome = lib.path.resolve(__dirname, "../website/home/"+ lang + ".home")
    let defaultHome = lib.path.resolve(__dirname, "../website/home/default.home")
    if (lib.fs.existsSync(langHome)) {
      console.log("[GA] [TRANSLATION] [HOME] Use:", lang + ".home")
      Home = await readThisFile(lib, langHome)
    } else  {
      console.log("[GA] [TRANSLATION] [HOME] Use: default.home")
      Home = await readThisFile(lib, defaultHome)
    }
    resolve(Home)
  })
}

function readThisFile (lib, file) {
  return new Promise (resolve => {
    lib.fs.readFile(file, (err, input) => {
      if (err) {
        console.log("[GA] [TRANSLATION] [HOME] Error", err)
        resolve()
      }
      resolve(input.toString())
    })
  })
}

function MMConfigAddress (that) {
  return new Promise (resolve => {
    if (that.EXT.MMConfig.address == "0.0.0.0") {
      that.EXT.errorInit = true
      console.error("[GA] Error: You can't use '0.0.0.0' in MagicMirror address config")
      that.sendSocketNotification("ERROR", "You can't use '0.0.0.0' in MagicMirror address config")
      setTimeout(() => process.exit(), 5000)
      resolve(true)
    } else {
      console.log("[GA] MagicMirror address:", that.EXT.MMConfig.address)
      resolve(false)
    }
  })
}

/** Check using pm2 **/
function check_PM2_Process(that) {
  console.log("[GA] [PM2] checking PM2 using...")
  return new Promise(resolve => {
    that.lib.commandExists('pm2')
      .then (async () => {
        var PM2_List = await PM2_GetList(that)
        if (!PM2_List) {
          console.error("[GA] [PM2] Can't get process List!")
          resolve(false)
          return
        }
        PM2_List.forEach(pm => {
          if ((pm.pm2_env.version === that.MMVersion) && (pm.pm2_env.status === "online") && (pm.pm2_env.PWD.includes(that.root_path))) {
            that.EXT.PM2Process = pm.name
            console.log("[GA] [PM2] You are using PM2 with", that.EXT.PM2Process)
            resolve(true)
          }
        })
        if (!that.EXT.PM2Process) {
          console.log("[GA] [PM2] You don't use PM2")
          resolve(false)
        }
      })
      .catch (() => {
        console.log("[GA] [PM2] You don't use PM2")
        resolve(false)
      })
  })
}

/** Get the list of pm2 process **/
function PM2_GetList(that) {
  return new Promise(resolve => {
    that.lib.childProcess.exec("pm2 jlist", (err,std,sde) => {
      if (err) {
        resolve(null)
        return
      }
      try {
        let result = JSON.parse(std)
        resolve(result)
      } catch (e) {
        console.error("[GA] [PM2] Process list is not an JSON Format!")
        console.error("[GA] [PM2] Received:", std)
        resolve(null)
      }
    })
  })
}

/** MagicMirror restart and stop **/
function restartMM (that) {
  if (that.EXT.usePM2) {
    console.log("[GA] PM2 will restarting MagicMirror...")
    that.lib.childProcess.exec("pm2 restart " + that.EXT.PM2Process, (err,std,sde) => {
      if (err) {
        console.error("[GA] [PM2] Restart:" + err)
      }
    })
  }
  else doRestart(that)
}

function doRestart (that) {
  console.log("[GA] Restarting MagicMirror...")
  const out = process.stdout
  const err = process.stderr
  const subprocess = that.lib.childProcess.spawn("npm start", {cwd: that.root_path, shell: true, detached: true , stdio: [ 'ignore', out, err ]})
  subprocess.unref()
  process.exit()
}

function doClose (that) {
  console.log("[GA] Closing MagicMirror...")
  if (that.EXT.usePM2) {
    that.lib.childProcess.exec("pm2 stop " + that.EXT.PM2Process, (err,std,sde) => {
      if (err) {
        console.error("[GA] [PM2] stop: " + err)
      }
    })
  }
  else process.exit()
}

/** exports functions for pretty using **/
exports.purposeIP = purposeIP
exports.readConfig = readConfig
exports.saveConfig = saveConfig
exports.configAddOrModify = configAddOrModify
exports.configDelete = configDelete
exports.searchConfigured = searchConfigured
exports.searchInstalled = searchInstalled
exports.loadBackupNames = loadBackupNames
exports.loadBackupFile = loadBackupFile
exports.configMerge = configMerge
exports.checkElectronOptions = checkElectronOptions
exports.doClose = doClose
exports.restartMM = restartMM
exports.searchGA = searchGA
exports.getGAConfig = getGAConfig
exports.setWebviewTag = setWebviewTag
exports.deleteBackup = deleteBackup
exports.makeSchemaTranslate = makeSchemaTranslate
exports.readAllMMLogs = readAllMMLogs
exports.readFreeteuseTV = readFreeteuseTV
exports.readRadioRecipe = readRadioRecipe
exports.transformExternalBackup = transformExternalBackup
exports.saveExternalConfig = saveExternalConfig
exports.deleteDownload = deleteDownload
exports.SystemRestart = SystemRestart
exports.SystemDie = SystemDie
exports.setActiveVersion = setActiveVersion
exports.getHomeText = getHomeText
exports.MMConfigAddress = MMConfigAddress
exports.check_PM2_Process = check_PM2_Process
