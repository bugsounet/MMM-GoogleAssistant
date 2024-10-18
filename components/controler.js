const { exec, spawn } = require("node:child_process");
const pm2 = require("pm2");

class Controler {
  constructor () {
    this.usePM2 = false;
    this.PM2Process = null;
  }

  /** Check using pm2 **/
  check_PM2_Process () {
    console.log("[GA] checking PM2 using...");
    return new Promise((resolve) => {
      pm2.connect((err) => {
        if (err) {
          console.error("[GA]", err);
          resolve(false);
          return;
        }
        pm2.list((err, list) => {
          if (err) {
            console.error("GA] Can't get pm2 process List!", err);
            resolve(false);
            return;
          }
          list.forEach((pm) => {
            if (pm.pm2_env.version === global.version && pm.pm2_env.status === "online" && pm.pm2_env.pm_cwd.includes(`${global.root_path}`)) {
              this.usePM2 = true;
              this.PM2Process = pm.name;
              console.log("[GA] You are using PM2 with", this.PM2Process);
              resolve(true);
            }
          });
          pm2.disconnect();
          if (!this.PM2Process) {
            console.log("[GA] You don't use PM2");
            resolve(false);
          }
        });
      });
    });
  }

  /** MagicMirror restart and stop **/
  restartMM () {
    if (this.usePM2) {
      console.log("[GA] PM2 will restarting MagicMirror...");
      pm2.restart(this.PM2Process, (err, proc) => {
        if (err) {
          console.error(`[GA] Restart:${err}`);
        }
      });
    }
    else this.doRestart();
  }

  doRestart () {
    console.log("[GA] Restarting MagicMirror...");
    const out = process.stdout;
    const err = process.stderr;
    const subprocess = spawn("npm start", { cwd: this.root_path, shell: true, detached: true, stdio: ["ignore", out, err] });
    subprocess.unref();
    process.exit();
  }

  doClose () {
    console.log("[GA] Closing MagicMirror...");
    if (this.usePM2) {
      pm2.stop(this.PM2Process, (err, proc) => {
        if (err) {
          console.error(`[GA] stop: ${err}`);
        }
      });
    }
    else process.exit();
  }

  /** Reboot or shutdown the Pi **/
  SystemReboot () {
    console.log("[GA] Restarting OS...");
    exec("sudo reboot now", (err, stdout, stderr) => {
      if (err) console.error("[GA] Error when restarting OS!", err);
    });
  }

  SystemShutdown () {
    console.log("[GA] Shutdown OS...");
    exec("sudo shutdown now", (err, stdout, stderr) => {
      if (err) console.error("[GA] Error when Shutdown OS!", err);
    });
  }
}

module.exports = Controler;
