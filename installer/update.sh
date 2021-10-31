#!/bin/bash
# +---------+
# | updater |
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

Installer_info "Welcome to GA updater !"
echo

Installer_update_dependencies () {
  Installer_debug "Test Wanted dependencies: ${dependencies[*]}"
  local missings=()
  for package in "${dependencies[@]}"; do
      Installer_is_installed "$package" || missings+=($package)
  done
  if [ ${#missings[@]} -gt 0 ]; then
    Installer_warning "Updating package..."
    for missing in "${missings[@]}"; do
      Installer_error "Missing package: $missing"
    done
    Installer_info "Installing missing package..."
    Installer_update || exit 1
    Installer_install ${missings[@]} || exit 1
  fi
}

echo
# check dependencies
dependencies=(wget unclutter build-essential vlc libmagic-dev libatlas-base-dev cec-utils libudev-dev)
Installer_info "Update all dependencies..."
Installer_update_dependencies
Installer_success "All Dependencies needed are updated !"

cd ~/MagicMirror/modules/MMM-GoogleAssistant
# deleting package.json because npm install add/update package
rm -f package.json package-lock.json

Installer_info "Updating Main core..."

git reset --hard HEAD
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
