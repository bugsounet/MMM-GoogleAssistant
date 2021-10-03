/** getplatform library **/
/** @bugsounet  **/
/** 2021-06-11  **/

const fs = require("fs")
const os = require("os")
const SYSTEM_LINUX = "linux"
const SYSTEM_MAC = "darwin"

const X86_64 = "x64"
const ARM_32 = "arm"
const ARM_64 = "arm64"

const PLATFORM_MAC = "mac"
const PLATFORM_LINUX = "linux"
const PLATFORM_RASPBERRY_PI = "raspberry-pi"

const ARM_CPU_CORTEX_A7 = "cortex-a7"
const ARM_CPU_CORTEX_A53 = "cortex-a53"
const ARM_CPU_CORTEX_A72 = "cortex-a72"

function getPlatform() {
  const system = os.platform()
  const arch = os.arch()

  if (system === SYSTEM_MAC && arch === X86_64) {
    return PLATFORM_MAC
  }

  if (system === SYSTEM_LINUX) {
    if (arch === X86_64) {
      return PLATFORM_LINUX
    } else {
      let armCpu = armLinuxCpuString()

      if (armCpu !== null) {
        return PLATFORM_RASPBERRY_PI
      }
    }
  }

  throw `System ${system}/${arch} is not supported by this library.`
}

function armLinuxCpuString() {
  const cpuModel = os.cpus()[0].model
  const cpuInfo = fs.readFileSync("/proc/cpuinfo", "ascii")

  for (let infoLine of cpuInfo.split("\n")) {
    if (infoLine.includes(":")) {
      let infoKeyValue = infoLine.split(":")
      let infoKey = infoKeyValue[0].trim()
      let infoValue = infoKeyValue[1].trim()

      if (infoKey === "Hardware" && infoValue.includes("BCM")) {
        if (cpuModel.includes("rev 5")) {
          return ARM_CPU_CORTEX_A7
        } else if (cpuModel.includes("rev 4")) {
          return ARM_CPU_CORTEX_A53
        } else if (cpuModel.includes("rev 3")) {
          return ARM_CPU_CORTEX_A72
        }
      }
    }
  }
  return null
}

exports.getPlatform = getPlatform
