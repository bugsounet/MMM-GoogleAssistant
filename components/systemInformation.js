const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")
const si = require("systeminformation")
const wirelessTools = require("./wirelessTools")

// see to add fetch from website ?

class systemInfo {
  constructor(translate) {
    this.translate = translate
    this.System = {
      VERSION: {
        GA: require('../package.json').version + " (" + require('../package.json').rev + ")",
        MagicMirror: require('../../../package.json').version,
        ELECTRON: "unknow",
        NODEMM: "unknow",
        NODECORE: "unknow",
        NPM: "unknow",
        KERNEL: "unknow",
        OS: "Loading...",
      },
      HOSTNAME: "unknow",
      NETWORK: {
        type: "unknow",
        ip: "unknow",
        name: "unknow",
        speed: null,
        duplex: '',
        ssid: "unknow",
        frequency: undefined,
        signalLevel: -99,
        barLevel: 0,
        interface: "unknow",
        rate: undefined,
        quality: undefined
      },
      MEMORY: {
        total: 0,
        used: 0,
        percent: 0,
        swapTotal: 0,
        swapUsed: 0,
        swapPercent: 0
      },
      STORAGE: [],
      CPU: {
        usage: 0,
        type: "unknow",
        temp: {
          C: 0,
          F: 0
        },
        speed: "unknow",
        governor: "unknow"
      },
      GPU: process.env.ELECTRON_ENABLE_GPU !== "1" ? false : true,
      UPTIME: {
        current: 0,
        currentDHM: "unknow",
        recordCurrent: 0,
        recordCurrentDHM: "unknow",
        MM: 0,
        MMDHM: "unknow",
        recordMM: 0,
        recordMMDHM: "unknow"
      },
      PROCESS: {
        nginx: {
          pid: 0,
          cpu: 0,
          mem: 0
        },
        electron: {
          pid: 0,
          cpu: 0,
          mem: 0
        },
        librespot: {
          pid: 0,
          cpu: 0,
          mem: 0
        },
        pm2: {
          pid: 0,
          cpu: 0,
          mem: 0
        }
      }
    }
  }

  async initData() {
    this.System["VERSION"].NODECORE = await new Promise(res => {
      exec ("node -v", (err, stdout, stderr)=>{
        if (err) res("unknow")
        else {
          let version = stdout.trim()
          version = version.replace('v', '')
          res(version)
        }
      })
    })
    await this.getStaticData()
    await this.getUptimeRecord()
    setInterval(async () => { await this.uptimed() }, 5000)
    console.log("[GA] [SYSTEMINFO] Initialized")
  }

  async Get() {
    await this.getData()
    //console.log("[GA] [SYSTEMINFO]", this.System)
    return this.System
  }

  getStaticData() {
    var valueObject = {
      cpu: 'manufacturer,brand',
      osInfo: 'distro, release,codename,arch,hostname',
      system: 'raspberry',
      versions: "kernel, node, npm",
    }

    return new Promise(resolve => {
      si.get(valueObject)
        .then(data => {
          if (data.osInfo) {
            this.System["VERSION"].OS = data.osInfo.distro.split(' ')[0] + " " + data.osInfo.release + " (" + data.osInfo.codename + " " + data.osInfo.arch + ")"
            this.System["HOSTNAME"] = data.osInfo.hostname
          }

          if (data.system.raspberry) this.System['CPU'].type = "Raspberry Pi " + data.system.raspberry.type + " (rev " + data.system.raspberry.revision + ")"
          else this.System['CPU'].type = data.cpu.manufacturer + " " + data.cpu.brand

          if (data.versions) {
            this.System["VERSION"].ELECTRON = process.versions.electron
            this.System["VERSION"].KERNEL = data.versions.kernel
            this.System["VERSION"].NPM = data.versions.npm
            this.System["VERSION"].NODEMM = data.versions.node
          }
          resolve()
        })
        .catch (e => {
          console.log("Error", e)
          resolve()
        })
    })
  }

  getData() {
    var valueObject = {
      cpu: 'speed,governor',
      networkInterfaces: "type,ip4,default,iface,speed,duplex",
      mem: "total,active,swaptotal,swapused",
      fsSize: "mount,size,used,use",
      currentLoad: "currentLoad",
      cpuTemperature: "main",
      processLoad: "(nginx, electron, librespot, pm2) proc,pid,cpu,mem"
    }
    return new Promise((resolve) => {
      si.get(valueObject)
        .then(async data => {
          this.System['CPU'].usage= data.currentLoad.currentLoad.toFixed(0)
          this.System['CPU'].speed= data.cpu.speed + " Ghz"
          this.System['CPU'].governor= data.cpu.governor

          if (data.networkInterfaces) {
            this.System["NETWORK"].type = "unknow"
            this.System["NETWORK"].ip = "unknow"
            this.System["NETWORK"].name = "unknow"
            this.System["NETWORK"].speed = null
            this.System["NETWORK"].duplex = ""
            this.System["NETWORK"].ssid = "unknow"
            this.System["NETWORK"].frequency = undefined
            this.System["NETWORK"].signalLevel = -99
            this.System["NETWORK"].barLevel = 0
            this.System["NETWORK"].rate= undefined
            this.System["NETWORK"].quality= undefined

            data.networkInterfaces.forEach(Interface => {
              if (Interface.default) {
                this.System["NETWORK"].type = Interface.type
                this.System["NETWORK"].ip = Interface.ip4
                this.System["NETWORK"].name = Interface.iface
                this.System["NETWORK"].speed = Interface.speed
                this.System["NETWORK"].duplex = Interface.duplex
              }
            })
          }

          if (data.mem) {
            this.System['MEMORY'].total = this.convert(data.mem.total,0)
            this.System['MEMORY'].used = this.convert(data.mem.active,2)
            this.System['MEMORY'].percent = (data.mem.active/data.mem.total*100).toFixed(2)
            this.System['MEMORY'].swapTotal = this.convert(data.mem.swaptotal,0)
            this.System['MEMORY'].swapUsed = this.convert(data.mem.swapused,2)
            this.System['MEMORY'].swapPercent = (data.mem.swapused/data.mem.swaptotal*100).toFixed(2)
          }

          if (data.fsSize) {
            this.System['STORAGE'] = []
            data.fsSize.forEach(partition => {
              var info = {}
              var part = partition.mount
              info[part] = {
                "size": this.convert(partition.size,0),
                "used": this.convert(partition.used,2),
                "use": partition.use
              }
              if (info[part].use) this.System['STORAGE'].push(info)
            })
          }

          if (data.cpuTemperature) {
            let tempC = data.cpuTemperature.main
            let tempF = (tempC * (9 / 5)) + 32
            this.System['CPU'].temp.F = tempF.toFixed(1)
            this.System['CPU'].temp.C = tempC.toFixed(1)
          }

          if (data.processLoad) {
            data.processLoad.forEach(process => {
              this.System["PROCESS"][process.proc] = {
                pid: process.pid,
                cpu: +process.cpu.toFixed(2),
                mem: +process.mem.toFixed(2)
              }
            })
          }

          if (this.System["NETWORK"].type == "wireless") {
            await wirelessTools.status(this.System["NETWORK"].name, (err, status) => {
              if (err) {
                console.error("[GA] [SYSTEMINFO] WirelessTools Error", err.message)
                resolve()
                return
              }
              this.System["NETWORK"] = Object.assign({}, this.System["NETWORK"], status)
              resolve()
            })
          } else {
            resolve()
          }
        })
        .catch (e => {
          console.error("[GA] [SYSTEMINFO] Error", e)
          resolve()
        })
    })
  }

  convert(octet,FixTo) {
    octet = Math.abs(parseInt(octet, 10))
    if (!octet) return "0b"
    var def = [[1, 'b'], [1024, 'Kb'], [1024*1024, 'Mb'], [1024*1024*1024, 'Gb'], [1024*1024*1024*1024, 'Tb']]
    for(var i=0; i<def.length; i++){
      if(octet<def[i][0]) return (octet/def[i-1][0]).toFixed(FixTo)+def[i-1][1]
    }
  }

  getDHM(seconds) {
    if (seconds == 0) return "Loading..."
    var days = Math.floor(seconds / 86400)
    seconds = seconds - (days*86400);
    var hours = Math.floor(seconds / 3600)
    seconds = seconds - (hours*3600);
    var minutes = Math.floor(seconds / 60)

    if (days > 0) {
     if (days >1) days = days + " " + this.translate.System_DAYS + " "
      else days = days + " " + this.translate.System_DAY + " "
    }
    else days = ""
    if (hours > 0) {
     if (hours > 1) hours = hours + " " + this.translate.System_HOURS + " "
      else hours = hours + " " + this.translate.System_HOUR + " "
    }
    else hours = ""
    if (minutes > 1) minutes = minutes + " " + this.translate.System_MINUTES
    else minutes = minutes + " " + this.translate.System_MINUTE
    return days + hours + minutes
  }

  uptimed() {
    return new Promise(resolve => {
      si.get( { time: "uptime" } )
        .then(async data => {
          if (data.time) {
            this.System["UPTIME"].current = data.time.uptime
            this.System["UPTIME"].currentDHM = this.getDHM(data.time.uptime)
          }
          this.System["UPTIME"].MM = process.uptime()
          this.System["UPTIME"].MMDHM = this.getDHM(process.uptime())
          if ((this.System["UPTIME"].current > this.System["UPTIME"].recordCurrent) || (this.System["UPTIME"].MM > this.System["UPTIME"].recordMM)) {
            await this.writeUptimeRecord()
          }
          resolve()
        })
    })
  }

  getUptimeRecord() {
    return new Promise((resolve) => {
      var uptimeFilePath = path.resolve(__dirname, "../website/tools/.uptimed")
        if (fs.existsSync(uptimeFilePath)) {
          var readFile = fs.readFile(uptimeFilePath, 'utf8',  (error, data) => {
            if (error) {
              console.error("[GA] [SYSTEMINFO] readFile uptimed error!", error)
              return resolve()
            }
            try {
              var data = JSON.parse(data)
            } catch (e) {
              console.error("[GA] [SYSTEMINFO] readFile data error!", e.toString())
              return resolve()
            }
            console.log("[GA] [SYSTEMINFO] Read Uptimed")
            this.System["UPTIME"].recordCurrent = data.system
            this.System["UPTIME"].recordMM = data.MM
            this.System["UPTIME"].recordCurrentDHM = this.getDHM(data.system)
            this.System["UPTIME"].recordMMDHM = this.getDHM(data.MM)
            resolve()
          })
        } else {
          let uptime = {
            system: 1,
            MM: 1
          }
          var recordFile = fs.writeFile(uptimeFilePath, JSON.stringify(uptime), error => {
            if (error) console.error("[GA] [SYSTEMINFO] recordFile creation error!", error)
            else console.log("[GA] [SYSTEMINFO] Create Uptimed")
            resolve()
          })
        }
    })
  }

  writeUptimeRecord() {
    return new Promise(resolve => {
      var uptimeFilePath = path.resolve(__dirname, "../website/tools/.uptimed")
      if (this.System["UPTIME"].current > this.System["UPTIME"].recordCurrent) {
        this.System["UPTIME"].recordCurrent = this.System["UPTIME"].current
        this.System["UPTIME"].recordCurrentDHM = this.getDHM(this.System["UPTIME"].recordCurrent)
      }

      if (this.System["UPTIME"].MM > this.System["UPTIME"].recordMM) {
        this.System["UPTIME"].recordMM = this.System["UPTIME"].MM
        this.System["UPTIME"].recordMMDHM = this.getDHM(this.System["UPTIME"].recordMM)
      }

      let uptime = {
        system: this.System["UPTIME"].recordCurrent,
        MM: this.System["UPTIME"].recordMM
      }
      fs.writeFile(uptimeFilePath, JSON.stringify(uptime), error => {
        if (error) console.error("[GA] [SYSTEMINFO] recordFile writing error!", error)
        resolve()
      })
    })
  }
}

module.exports = systemInfo
