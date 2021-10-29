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
dependencies=(unclutter libasound2-dev sox libsox-fmt-all libsox-fmt-mp3 build-essential vlc libmagic-dev libatlas-base-dev cec-utils libudev-dev)
Installer_info "Update all dependencies..."
Installer_update_dependencies
Installer_success "All Dependencies needed are updated !"

cd ~/MagicMirror/modules/MMM-GoogleAssistant
# deleting package.json because npm install add/update package
rm -f package.json package-lock.json

if $prompt; then
  Installer_info "Updating Main core..."
fi

git reset --hard HEAD
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
