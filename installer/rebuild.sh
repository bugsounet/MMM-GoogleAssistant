#!/bin/bash
# +---------+
# | Rebuild |
# +---------+

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

Installer_info "Welcome to GA rebuild script"
Installer_warning "This script will erase current build"
Installer_error "Use this script only for the new version of Magic Mirror or developer request"
Installer_error "recipes, credentials.json, token.json will be not erased"
Installer_error "after executing this script, it will restart the installation, you must do it!"
Installer_error "in this case, Audio check is not necessary" 
Installer_yesno "Do you want to continue ?" || exit 0

cd ~/MagicMirror/modules/MMM-GoogleAssistant
echo
Installer_info "Deleting: package-lock.json node_modules" 
rm -rf package.json package-lock.json node_modules
Installer_success "Done."
echo
Installer_info "Upgrading GoogleAssistant..."
git checkout package.json
git pull
Installer_success "Done."
echo
Installer_info "Reinstalling GoogleAssistant..."
npm install
