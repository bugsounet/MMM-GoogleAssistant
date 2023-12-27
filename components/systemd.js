
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const detailsRegex = /Id=(.+)\nActiveState=(.+)\nSubState=(.+)\nUnitFileState=(.+)\nStateChangeTimestamp=(.+)?/m

class Systemd {
  constructor(service) {
    this.service = service
    this.init= false
    this.checkService()
  }

  async status() {
    if (!this.init) return { error: "not initialized" }
    const command = [
      `systemctl show ${this.service}`,
      'Id',
      'ActiveState',
      'SubState',
      'UnitFileState',
      'StateChangeTimestamp'
    ].join(' -p ')

    const { stdout, stderr } = await exec(command)
    return GetStdOutResponse(stdout,this.service)
  }
  
  async restart() {
    if (!this.init) return { error: "not initialized" }
    const command = `sudo systemctl restart ${this.service}`

    try {
      const { stdout, stderr } = await exec(command)
    } catch (e) {
      let error = sliceLast(e.message, "\n")
      return {
        name: this.service,
        error: error
      }
    }
    return {
      name: this.service,
      restart: "ok"
    }
  }

  async stop() {
    if (!this.init) return { error: "not initialized" }
    const command = `sudo systemctl stop ${this.service}`

    try {
      const { stdout, stderr } = await exec(command)
    } catch (e) {
      let error = sliceLast(e.message, "\n")
      return {
        name: this.service,
        error: error
      }
    }
    return {
      name: this.service,
      stop: "ok"
    }
  }

  checkService() {
    if (typeof this.service === 'string') this.init = true
    else throw new Error ("service name missing")
  }
}

function sliceLast(str, sep = ' ') {
  const splitedStr = str.split(sep)
  return splitedStr.length > 1
    ? splitedStr.slice(0, -1).join(sep)
    : str
}

function GetStdOutResponse(std,service) {
  return new Promise(resolve => {
    var values
    std.trim()
      .split('\n\n')
      .map((serviceData) => {
        const properties = serviceData.match(detailsRegex)
        if (!properties) {
          values = {
            name: service,
            error: "Unknown service"
          }
        } else {
          let [, name, activeState, state, unitFileState] = properties
          name = sliceLast(name, '.')
          values = {
            name,
            state,
            isActive: activeState === 'active',
            isDisabled: unitFileState === 'disabled'
          }
        }
      })
    resolve (values)
  })
}

module.exports = Systemd
