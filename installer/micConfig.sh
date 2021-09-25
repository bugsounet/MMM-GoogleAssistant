#!/bin/bash
# +-------------------+
# | npm run micConfig |
# +-------------------+

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

# use beep request questions ?
Installer_beep=true

echo

Installer_warning "This script is deprecied !"
Installer_warning "You don't have to create ANY micConfig part!"
Installer_warning "MMM-GoogleAssistant is now able to determinate it automaticaly!"
Installer_warning "This script is reserved to Linux Expert!"

# Audio out/in checking
Installer_info "Checking Speaker and Microphone..."

Installer_checkmicv2
echo

if [ ! -z "$plug_rec" ]; then
  Installer_warning "This is your MMM-GoogleAssistant micConfig working configuration :"
  if [ "$os_name" == "raspbian" ]; then
    Installer_warning "Remember: if you are using RPI, it's better to use arecord program"
  fi
  echo
  Installer_warning "micConfig: {"
  Installer_warning "  device: \"$plug_rec\""
  Installer_warning "},"
fi

echo
