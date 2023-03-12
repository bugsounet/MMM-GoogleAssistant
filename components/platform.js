/** getplatform library **/
/** @bugsounet  **/
/** 2023-02-20  **/

const SYSTEM_LINUX = "linux";
const SYSTEM_MAC = "darwin";
const SYSTEM_WINDOWS = "win32";

const X86_64 = "x64";
const ARM_32 = "arm";
const ARM_64 = "arm64";

const PLATFORM_BEAGLEBONE = "beaglebone";
const PLATFORM_JETSON = "jetson";
const PLATFORM_LINUX = "linux";
const PLATFORM_MAC = "mac";
const PLATFORM_RASPBERRY_PI = "raspberry-pi";
const PLATFORM_WINDOWS = "windows";

function getCpuPart(that) {
  const cpuInfo = that.lib.fs.readFileSync("/proc/cpuinfo", "ascii");
  for (let infoLine of cpuInfo.split("\n")) {
    if (infoLine.includes("CPU part")) {
      const infoLineSplit = infoLine.split(' ');
      return infoLineSplit[infoLineSplit.length - 1].toLowerCase();
    }
  }
  throw `Unsupported CPU.`
}

function getLinuxPlatform(that) {
  const cpuPart = getCpuPart(that);
  switch (cpuPart) {
    case "0xc07":
    case "0xd03":
    case "0xd08": return PLATFORM_RASPBERRY_PI;
    case "0xd07": return PLATFORM_JETSON;
    case "0xc08": return PLATFORM_BEAGLEBONE;
    default:
      throw `Unsupported CPU: '${cpuPart}'`
  }
}

function getPlatform(that) {
  const system = that.lib.os.platform();
  const arch = that.lib.os.arch();
  if (system === SYSTEM_MAC && (arch === X86_64 || arch === ARM_64)) {
      return PLATFORM_MAC;
  }
  if (system === SYSTEM_WINDOWS && arch === X86_64) {
      return PLATFORM_WINDOWS;
  }
  if (system === SYSTEM_LINUX) {
    if (arch === X86_64) {
      return PLATFORM_LINUX;
    }
    else {
      return getLinuxPlatform(that);
    }
  }
  throw `System ${system}/${arch} is not supported by this library.`;
}

exports.getPlatform = getPlatform;
