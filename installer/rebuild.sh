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

# Go back to module root
cd ..

# check version in package.json file
Installer_version="$(grep -Eo '\"version\"[^,]*' ./package.json | grep -Eo '[^:]*$' | awk  -F'\"' '{print $2}')"
Installer_module="$(grep -Eo '\"name\"[^,]*' ./package.json | grep -Eo '[^:]*$' | awk  -F'\"' '{print $2}')"

# Let's start !
Installer_info "Welcome to $Installer_module v$Installer_version rebuild script"
Installer_warning "This script will erase current build and reinstall it"
Installer_yesno "Do you want to continue ?" || exit 0

echo
Installer_info "Deleting: package-lock.json node_modules" 
rm -rf package-lock.json node_modules
Installer_success "Done."

Installer_info "Updating..."
(git reset --hard && git pull) || {
  Installer_error "Update Failed!"
  exit 255
}
Installer_success "Done"

Installer_info "Reinstalling..."
npm install
