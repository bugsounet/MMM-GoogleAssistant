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

# module name
Installer_module="MMM-GoogleAssistant"

# check version
Installer_version="$(cat ../package.json | grep '"version":' | cut -c14-30 2>/dev/null)"

# Let's start !
Installer_info "Welcome to $Installer_module $Installer_version"
echo

# delete package-lock.json (force)
rm -f ../package-lock.json

# Check not run as root
if [ "$EUID" -eq 0 ]; then
  Installer_error "npm install must not be used as root"
  exit 1
fi

Installer_chk "$(pwd)/../" "MMM-GoogleAssistant"
Installer_chk "$(pwd)/../../../" "MagicMirror"
cd ..
echo

# Check platform compatibility
Installer_info "Checking OS..."
Installer_checkOS
if  [ "$platform" == "osx" ]; then
  Installer_error "OS Detected: $OSTYPE ($os_name $os_version $arch)"
  Installer_error "Automatic installation is not included"
  echo
  exit 255
else
  if  [ "$os_name" == "raspbian" ] && [ "$os_version" -lt 10 ]; then
    Installer_error "OS Detected: $OSTYPE ($os_name $os_version $arch)"
    Installer_error "Unfortunately, this module is not compatible with your OS"
    Installer_error "Try to update your OS to the lasted version of raspbian"
    echo
    exit 255
  else
    Installer_success "OS Detected: $OSTYPE ($os_name $os_version $arch)"
  fi
fi

echo
# check dependencies
dependencies=(wget unclutter build-essential vlc libmagic-dev libatlas-base-dev cec-utils libudev-dev)
Installer_info "Checking all dependencies..."
Installer_check_dependencies
Installer_success "All Dependencies needed are installed !"

echo
# apply @sdetweil fix
Installer_info "Installing @sdetweil sandbox fix..."
bash -c "$(curl -sL https://raw.githubusercontent.com/sdetweil/MagicMirror_scripts/master/fixsandbox)"

echo
# switch branch
Installer_info "Installing Sources..."
if is_pifour; then
  Installer_info "Raspberry Pi4 Detected."
else
  Installer_error "[WARN] You don't use a Raspberry Pi4, switch to light sources..."
  git checkout -f light 2>/dev/null || Installer_error "Installing Error !"
  git pull 2>/dev/null
  Installer_error "~~~~~~"
  Installer_error "~~~ Retry again npm install for continue installing ~~~"
  Installer_error "~~~~~~"
  exit 255
fi

echo
