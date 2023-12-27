/** setup nginx server with a domain name with https **/

var prompt = require("prompt");
var colors = require("@colors/colors/safe");
const isValidDomain = require('is-valid-domain');
const fs = require("fs");
const systemd= require("../components/systemd.js");
const Systemd = new systemd("nginx")

var server = `server {
  listen 80;

  server_name %domain%;

  location / {
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;
      proxy_set_header Host $http_host;
      proxy_set_header X-NginX-Proxy true;

      proxy_pass http://127.0.0.1:8081;
      proxy_redirect off;

      # Socket.IO Support
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection "upgrade";
  }
}`

async function main() {
  this.domain = await promptDomain()
  await saveDomain()
  await nginx()
}


function promptDomain() {
  return new Promise((resolve, reject) => {
    prompt.message = "[SMARTHOME]"
    prompt.delimiter = colors.green("~")
    prompt.start();
  
    prompt.get({
      properties: {
        domain: {
          description: colors.yellow("What is your domain name?")
        }
      }
    }, function (err, result) {
      if (err) {
        console.log("\n[SMARTHOME] " + err)
        process.exit(255)
      }
      if (!result.domain || !isValidDomain(result.domain)) {
        console.error("[SMARTHOME] " + colors.red("Error: domain name must be a valid!"))
        return promptDomain()
      }
      resolve(result.domain)
    })
  })
}

function saveDomain() {
  return new Promise(resolve => {
    console.log("[SMARTHOME] " + colors.cyan("Writing your domain name: ") + colors.blue(this.domain))
    fs.writeFile(__dirname+"/DomainName", this.domain, (err, data) => {
      if (err) {
        console.error("[SMARTHOME] " + colors.red("Error:" + err.message))
        return process.exit(255)
      }
      console.log("[SMARTHOME] " + colors.green("OK\n"))
      resolve()
    })
  })
}

function nginx () {
  return new Promise(resolve => {
    server = server.replace("%domain%", this.domain)
    console.log("[SMARTHOME] " + colors.cyan("Your nginx server configuration will be:"))
    console.log(colors.blue(server),"\n")
    console.log("[SMARTHOME] " + colors.cyan("Writing Gateway configuration file..."))
    fs.writeFile("/etc/nginx/sites-available/Gateway", server, async (err, data) => {
      if (err) {
        console.error("[SMARTHOME] " + colors.red("Error:" + err.message))
        return process.exit(1)
      }
      console.log("[SMARTHOME] " + colors.green("OK\n"))
      await deleteDefault()
      await createSymLink()
      resolve(restartNginx())
    })
  })
}

function createSymLink() {
  console.log("[SMARTHOME] " + colors.cyan("Create Gateway Symlink..."))
  return new Promise (resolve => {
    fs.access("/etc/nginx/sites-enabled/Gateway", fs.constants.F_OK, (err) => {
      if (!err)  {
        console.log("[SMARTHOME] " + colors.green("OK (Already created)\n"))
        resolve()
      } else {
        fs.symlink("/etc/nginx/sites-available/Gateway", "/etc/nginx/sites-enabled/Gateway", 'file', (err) => {
          if (err) {
            console.error("[SMARTHOME] " + colors.red("Error:" + err.message))
            return process.exit(1)
          }
          console.log("[SMARTHOME] " + colors.green("OK\n"))
          resolve()
        })
      }
    })
  })
}

function deleteDefault() {
  console.log("[SMARTHOME] " + colors.cyan("Delete default Symlink..."))
  return new Promise (resolve => {
    fs.access("/etc/nginx/sites-enabled/default", fs.constants.F_OK, (err) => {
      if (!err) {
        fs.rm("/etc/nginx/sites-enabled/default", (err) => {
          if (err) {
            console.error("[SMARTHOME] " + colors.red("Error:" + err.message))
            return process.exit(1)
          }
          console.log("[SMARTHOME] " + colors.green("OK\n"))
          resolve()
        }) 
      } else {
        console.log("[SMARTHOME] " + colors.green("OK (Not found)\n"))
        resolve()
      }
    })
  })
}

async function restartNginx() {
  console.log("[SMARTHOME] " + colors.cyan("Restart nginx with new configuration..."))
  const nginxRestart = await Systemd.restart()
  if (nginxRestart.error) {
    console.error("[SMARTHOME] " + colors.red("Error when restart nginx!"))
    return process.exit(1)
  }
  console.log("[SMARTHOME] " + colors.green("OK\n"))
  console.log("[SMARTHOME] " + colors.brightYellow("Before you continue: Don't forget to forward ports 80 and 443 to your Pi's IP address!"))
}

main()
