#!/bin/bash
# +----------------+
# | npm preinstall |
# +----------------+

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
# del last log
rm installer.log 2>/dev/null

# module name
Installer_module="MMM-GoogleAssistant"

echo

# Let's start !
Installer_info "Welcome to $Installer_module"

echo

# Check not run as root
if [ "$EUID" -eq 0 ]; then
  Installer_error "npm install must not be used as root"
  exit 1
fi

# Check platform compatibility
Installer_info "Checking OS..."
Installer_checkOS
if  [ "$platform" == "osx" ]; then
  Installer_error "OS Detected: $OSTYPE ($os_name $os_version $arch)"
  Installer_error "You need to read documents/1_install.md for Manual Install"
  exit 0
else
  Installer_success "OS Detected: $OSTYPE ($os_name $os_version $arch)"
fi

echo

# check dependencies
dependencies=(git wget libasound2-dev sox libsox-fmt-all gcc-7 libsox-fmt-mp3 build-essential mpg321 vlc libmagic-dev libatlas-base-dev)
Installer_info "Checking all dependencies..."
Installer_check_dependencies
Installer_success "All Dependencies needed are installed !"

echo

# force gcc v7
Installer_info "Checking GCC Version..."
Installer_yesno "Do you want to check compatible GCC version" && (
  Installer_check_gcc7
  Installer_success "GCC 7 is set by default"
)

# switch branch
Installer_info "Installing Sources..."
git checkout -f USEIT 2>/dev/null || Installer_error "Installing Error ! (YOU DON'T USE IT !!!)"
git pull 2>/dev/null

echo
Installer_info "Installing all npm libraries..."
