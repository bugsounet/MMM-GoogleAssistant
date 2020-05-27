#!/bin/bash
# +--------------------------------+
# | Clean sources                  |
# | Rev 1.0.0                      |
# +--------------------------------+

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

Installer_info "Welcome to AMk2 clean sources script"
Installer_warning "This script will erase all AMK2 core to sync with master branch"
Installer_error "If you have personal recipes, SAVE it before launch this script."
Installer_error "credentials.json, token.json and profiles will be not erased"
Installer_yesno "Do you want to continue ?" || exit 0

cd ~/MagicMirror/modules/MMM-AssistantMk2
echo
Installer_info "Deleting: README.md *.js update recipes resources translations components library ui package.json package-lock.json node_modules" 
rm -rf README.md *.js update recipes resources translations components library ui package.json package-lock.json node_modules
Installer_success "Done."
echo
Installer_info "Upgrading AMk2..."

git checkout -f master
git pull origin master
Installer_success "Done."
echo
npm install
