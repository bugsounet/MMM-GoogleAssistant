#!/bin/bash
# +---------+
# | updater |
# +---------+

# with or without prompt ?
p0=$0
prompt=true
# if not 'bash', and some parm specified
if [ $0 != 'bash' -a "$1." != "." ]; then
        # then executed locally
        # get the parm
        p0=$1
fi

if [ $p0 = without-prompt ]; then
  touch no-prompt
  prompt=false
fi

# get the installer directory
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
if $prompt; then
  Installer_info "Welcome to GA updater !"
  echo
fi

cd ~/MagicMirror/modules/MMM-GoogleAssistant
# deleting package.json because npm install add/update package
rm -f package.json package-lock.json

if $prompt; then
  Installer_info "Updating..."
fi

git pull
#fresh package.json
git checkout package.json
cd ~/MagicMirror/modules/MMM-GoogleAssistant/node_modules

if $prompt; then
  Installer_info "Deleting ALL @bugsounet libraries..."
fi

rm -rf @bugsounet
cd ~/MagicMirror/modules/MMM-GoogleAssistant

if $prompt; then
  Installer_info "Ready for Installing..."
fi

# launch installer
npm install
