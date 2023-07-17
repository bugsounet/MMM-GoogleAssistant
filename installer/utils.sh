#!/bin/bash

#--------------
# Common utils
#  Bugsounet
#--------------

# postinstaller version
Installer_vinstaller="2.1.0 by Bugsounet"

# directory where the script is installed
Installer_dir=

# user's platform (linux, osx)
platform=

# user's architecture (armv7l, x86_64)
arch=

# user's OS name (raspbian, ubuntu, Mac OS X...)
os_name=

#check OS
Installer_checkOS () {
  case "$OSTYPE" in
    linux*)   platform="linux"
              arch="$(uname -m)"
              os_name="$(cat /etc/*release | grep ^ID= | cut -f2 -d=)"
              os_version="$(cat /etc/*release | grep ^VERSION_ID= | cut -f2 -d= | tr -d '"')"
              ;;
    darwin*)  platform="osx"
              arch="$(uname -m)"
              os_name="$(sw_vers -productName)"
              os_version="$(sw_vers -productVersion)"
              ;;
    *)        Installer_error "$OSTYPE is not a supported platform"
              exit 0;;
  esac
}

Installer_update_dependencies () {
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
    Installer_update || exit 255
    Installer_install ${missings[@]} || exit 255
  fi
}

# color codes
_reset="\033[0m"
_red="\033[91m"
_orange="\033[93m"
_green="\033[92m"
_gray="\033[2m"
_blue="\033[94m"
_cyan="\033[96m"
_pink="\033[95m"

# Display a message in color
# $1 - message to display
# $3 - color to use
Installer_message() {
  echo -e "$3$1$_reset"
}

# Displays question in cyan
Installer_question () { Installer_message "$1" "Question" "$_cyan" 1>&2 ;}

# Displays a error in red
Installer_error() { Installer_message "$1" "Error" "$_red" 1>&2 ;}

# Displays a warning in yellow
Installer_warning() { Installer_message "$1" "Warning" "$_orange" ;}

# Displays a success in green
Installer_success() { Installer_message "$1" "Success" "$_green" ;}

# Displays an information in blue
Installer_info() { Installer_message "$1" "Info" "$_blue" ;}

# Asks user to press enter to continue
Installer_press_enter_to_continue () {
  Installer_question "Press [Enter] to continue"
  read
}

# Exit
Installer_exit () {
  echo
  Installer_success "$1"
  Installer_press_enter_to_continue

  # reset font color
  echo -e "$_reset\n"

  exit
}

# YesNo prompt from the command line
Installer_yesno () {
  while true; do
    Installer_question "$1 [Y/n] "
    read -n 1 -p "$(echo -e $_cyan"Your choice: "$_reset)"
    echo # new line
    [[ $REPLY =~ [Yy] ]] && return 0
    [[ $REPLY =~ [Nn] ]] && return 1
  done
}

#  Installer_update
Installer_update () {
  sudo apt-get update -y || exit 255
}

# indicates if a package is installed
#
# $1 - package to verify
Installer_is_installed () {
  #hash "$1" 2>/dev/null || (apt-cache policy "$1" 2>/dev/null | grep -q "Installed")
  hash "$1" 2>/dev/null || (dpkg -s "$1" 2>/dev/null | grep -q "installed")
}

# install packages, used for dependencies
#
# $@ - list of packages to install
Installer_install () {
  sudo apt-get install -y $@ || exit 255
  sudo apt-get clean || exit 255
}

# remove packages, used for uninstalls
#
# $@ - list of packages to remove
Installer_remove () {
  sudo apt-get autoremove --purge $@ || exit 255
}

Installer_chk () {
  CHKUSER=$(stat -c '%U' $1)
  CHKGROUP=$(stat -c '%G' $1)
  if [ $CHKUSER == "root" ] || [ $CHKGROUP == "root" ]; then
     Installer_error "Checking $2: $CHKUSER/$CHKGROUP"
     exit 255
  fi
  Installer_success "Checking $2: $CHKUSER/$CHKGROUP"
}
