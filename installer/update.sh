#!/bin/bash
# +---------+
# | updater |
# +---------+
# get the installer directory

p0=$0
# if not 'bash', and some parm specified
if [ $0 != 'bash' -a "$1." != "." ]; then
        # then executed locally
        # get the parm
        p0=$1
fi
echo $0 $1 $2
if [ $p0 = without-prompt ]; then
  touch no-prompt
  prompt= false
else
  prompt= true
fi
echo $prompt


Installer_get_current_dir () {
  SOURCE="${BASH_SOURCE[0]}"
  while [ -h "$SOURCE" ]; do
    DIR="$( cd -P "$( dirname "$SOURCE" )" && pwd )"
    SOURCE="$(readlink "$SOURCE")"
    [[ $SOURCE != /* ]] && SOURCE="$DIR/$SOURCE"
  done
  echo "$( cd -P "$( dirname "$SOURCE" )" && pwd )"
}

Installer_dir="$(Installer_get_current_dir)"

# move to installler directory
cd "$Installer_dir"
source utils.sh
Installer_info "Welcome to GA updater !"
echo

cd ~/MagicMirror/modules/MMM-GoogleAssistant
# deleting package.json because npm install add/update package
rm -f package.json package-lock.json
Installer_info "Updating..."
git pull
#fresh package.json
git checkout package.json
cd ~/MagicMirror/modules/MMM-GoogleAssistant/node_modules
Installer_info "Deleting ALL @bugsounet libraries..."
rm -rf @bugsounet
cd ~/MagicMirror/modules/MMM-GoogleAssistant
Installer_info "Ready for Installing..."
# launch installer
npm install
