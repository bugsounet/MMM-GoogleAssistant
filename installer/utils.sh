#!/bin/bash

#--------------
# Common utils
#  Bugsounet
#--------------

# postinstaller version
Installer_vinstaller="2.0.0 by Bugsounet"

# debug mode
Installer_debug=false

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

  # Check if this is a Debian or RPM based system
  debian=
  have_apt=`type -p apt-get`
  have_dpkg=`type -p dpkg`
  have_dnf=`type -p dnf`
  have_yum=`type -p yum`
  [ -f /etc/os-release ] && {
    id_like="$(cat /etc/os-release | grep ^ID_LIKE= | cut -f2 -d=)"
  }
  [ "${id_like}" == "debian" ] && debian=1
  [ "${debian}" ] || [ -f /etc/debian_version ] && debian=1
}

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

# add timestamps and delete colors code for log file
Installer_add_timestamps () {
  while IFS= read -r line; do
    echo "$(date "+%D %H:%M") $line" | sed -E "s/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[mGK]//g"
  done
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
# $2 - message type (error/warning/success/debug/question)
# $3 - color to use
Installer_message() {
  if $Installer_debug; then
    echo -e "$3[$2] $1$_reset"
  else
    echo -e "$3$1$_reset"
  fi
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

# Displays debug log in gray (if debug actived)
Installer_debug() {
  if $Installer_debug; then
    Installer_message "$1" "Debug" "$_gray" ;
  fi
}

# Asks user to press enter to continue
Installer_press_enter_to_continue () {
  Installer_question "Press [Enter] to continue"
  Installer_play_beep
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

Installer_play_beep () {
  if $Installer_beep; then
    play beep_check.wav 2>/dev/null
  fi
}

# YesNo prompt from the command line
Installer_yesno () {
  while true; do
    Installer_question "$1 [Y/n] "
    Installer_play_beep
    read -n 1 -p "$(echo -e $_cyan"Your choice: "$_reset)"
    echo # new line
    [[ $REPLY =~ [Yy] ]] && return 0
    [[ $REPLY =~ [Nn] ]] && return 1
  done
}

# Log to installer.log
Installer_log () {
  exec > >(tee >(Installer_add_timestamps >> installer.log)) 2>&1
}

#  Installer_update
Installer_update () {
  if [ "${debian}" ]
  then
    sudo apt-get update -y
  else
    if [ "${have_dnf}" ]
    then
      sudo dnf makecache --refresh
    else
      if [ "${have_yum}" ]
      then
        sudo yum makecache --refresh
      else
        sudo apt-get update -y
      fi
    fi
  fi
}

# indicates if a package is installed
#
# $1 - package to verify
Installer_is_installed () {
  if [ "${debian}" ]
  then
    if [ "${have_dpkg}" ]
    then
      hash "$1" 2>/dev/null || (dpkg -s "$1" 2>/dev/null | grep -q "installed")
    else
      if [ "${have_apt}" ]
      then
        hash "$1" 2>/dev/null || (apt-cache policy "$1" 2>/dev/null | grep -q "Installed")
      else
        hash "$1" 2>/dev/null || (dpkg -s "$1" 2>/dev/null | grep -q "installed")
      fi
    fi
  else
    if [ "${have_dnf}" ]
    then
      hash "$1" 2>/dev/null || (dnf list installed "$1" > /dev/null 2>&1)
    else
      if [ "${have_yum}" ]
      then
        hash "$1" 2>/dev/null || (yum list installed "$1" > /dev/null 2>&1)
      else
        hash "$1" 2>/dev/null || (dpkg -s "$1" 2>/dev/null | grep -q "installed")
      fi
    fi
  fi
}

# install packages, used for dependencies
#
# $@ - list of packages to install
Installer_install () {
  if [ "${debian}" ]
  then
    if [ "${have_apt}" ]
    then
        sudo apt-get install -y $@
        sudo apt-get clean
    else
      if [ "${have_dpkg}" ]
      then
        sudo dpkg -i $@
      else
        sudo apt install $@
        sudo apt clean
      fi
    fi
  else
    if [ "${have_dnf}" ]
    then
      sudo dnf -y install $@
    else
      if [ "${have_yum}" ]
      then
        sudo yum -y install $@
      else
        sudo apt install $@
        sudo apt clean
      fi
    fi
  fi
}

# remove packages, used for uninstalls
#
# $@ - list of packages to remove
Installer_remove () {
  if [ "${debian}" ]
  then
    if [ "${have_apt}" ]
    then
      sudo apt-get autoremove --purge $@
    else
      if [ "${have_dpkg}" ]
      then
        sudo dpkg -P $@
      else
        sudo apt-get autoremove --purge $@
      fi
    fi
  else
    if [ "${have_dnf}" ]
    then
      sudo dnf autoremove $@
    else
      if [ "${have_yum}" ]
      then
        sudo yum autoremove $@
      else
        sudo apt-get autoremove --purge $@
      fi
    fi
  fi
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

Installer_debug "[LOADED] utils.sh"
