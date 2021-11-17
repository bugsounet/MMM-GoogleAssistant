/** getplatform library **/
/** @bugsounet  **/
/** 2021-17-11  **/

const fs = require("fs");
const os = require("os");
const path = require("path");

const SYSTEM_LINUX = "linux";
const SYSTEM_MAC = "darwin";
const SYSTEM_WINDOWS = "win32";

const X86_64 = "x64";
const ARM_32 = "arm";
const ARM_64 = "arm64";

const PLATFORM_LINUX = "linux";
const PLATFORM_MAC = "mac";
const PLATFORM_RASPBERRY_PI = "raspberry-pi";
const PLATFORM_WINDOWS = "windows";

const ARM_CPU_64 = "-aarch64";
const ARM_CPU_CORTEX_A7 = "cortex-a7";
const ARM_CPU_CORTEX_A53 = "cortex-a53";
const ARM_CPU_CORTEX_A57 = "cortex-a57";
const ARM_CPU_CORTEX_A72 = "cortex-a72";

const SUPPORTED_NODEJS_SYSTEMS = new Set([
  SYSTEM_LINUX,
  SYSTEM_MAC,
  SYSTEM_WINDOWS
]);

function getCpuPart() {
    const cpuInfo = fs.readFileSync("/proc/cpuinfo", "ascii");
    for (let infoLine of cpuInfo.split("\n")) {
      if (infoLine.includes("CPU part")) {
        let infoLineSplit = infoLine.split(' ')
        return infoLineSplit[infoLineSplit.length - 1].toLowerCase();
      }
    }
    throw `Unsupported CPU.`
}

function getLinuxPlatform() {
    var cpuPart = getCpuPart(); 
    switch(cpuPart) {
        case "0xc07": 
        case "0xd03": 
        case "0xd08": return PLATFORM_RASPBERRY_PI;
        default: 
            throw `Unsupported CPU: '${cpuPart}'`
    }
}

function getLinuxMachine(arch) {
    let archInfo = ""
    if(arch == ARM_64) {
      archInfo = ARM_CPU_64;
    } 

    var cpuPart = getCpuPart(); 
    switch(cpuPart) {
        case "0xc07": return ARM_CPU_CORTEX_A7 + archInfo;
        case "0xd03": return ARM_CPU_CORTEX_A53 + archInfo;
        case "0xd07": return ARM_CPU_CORTEX_A57 + archInfo;
        case "0xd08": return ARM_CPU_CORTEX_A72 + archInfo;
        default: 
            throw `Unsupported CPU: '${cpuPart}'`
    }
}

function getPlatform() {
  const system = os.platform();
  const arch = os.arch();

  if (system === SYSTEM_MAC && (arch === X86_64 || arch === ARM_64)) {
    return PLATFORM_MAC;
  }

  if (system === SYSTEM_WINDOWS && arch === X86_64) {
    return PLATFORM_WINDOWS;
  }

  if (system === SYSTEM_LINUX) {
    if (arch === X86_64) {
      return PLATFORM_LINUX;
    } else {
      return getLinuxPlatform();
    }
  }

  throw `System ${system}/${arch} is not supported by this library.`;
}

exports.getPlatform = getPlatform;
