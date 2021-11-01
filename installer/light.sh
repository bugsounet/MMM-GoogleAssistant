#!/bin/bash
# +-------------------------+
# | switch to Light version |
# +-------------------------+

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

cd ..
echo
Installer_info "Deleting: package-lock.json node_modules" 
rm -rf package.json package-lock.json node_modules
Installer_success "Done."

echo
Installer_info "Downgrading GoogleAssistant to Light version..."
git reset --hard HEAD
git pull
git checkout -f light
git pull
Installer_success "Done."
echo
Installer_info "Installing GoogleAssistant Light version..."
npm install
