#!/bin/bash
# +---------+
# | Tokens  |
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

# Go back to module root
cd ..

# check version in package.json file
Installer_module="$(grep -Eo '\"name\"[^,]*' ./package.json | grep -Eo '[^:]*$' | awk  -F'\"' '{print $2}')"

Installer_info "Welcome to $Installer_module Token generator!"
echo

Installer_warning "Note: The choice expects [Y or N] and does not need [Enter] to confirm" &&
Installer_yesno "Do you want to install/reinstall $Installer_module token?" && (
  rm -f tokenGA.json
  node installer/auth_GoogleAssistant
)
