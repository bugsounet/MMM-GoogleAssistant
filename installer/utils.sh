#!/bin/bash

#--------------
# Common utils
#  Bugsounet
#--------------

# postinstaller version
Installer_vinstaller="1.1.0 by Bugsounet"

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

# check if all dependencies are installed
Installer_check_dependencies () {
  Installer_debug "Test Wanted dependencies: ${dependencies[*]}"
  local missings=()
  for package in "${dependencies[@]}"; do
      Installer_is_installed "$package" || missings+=($package)
  done
  if [ ${#missings[@]} -gt 0 ]; then
    Installer_warning "You must install missing dependencies before going further"
    for missing in "${missings[@]}"; do
      Installer_error "Missing package: $missing"
    done
    Installer_yesno "Attempt to automatically install the above packages?" || exit 0
    Installer_info "Installing missing package..."
    Installer_update || exit 1
    Installer_install ${missings[@]} || exit 1
  fi

  if ! groups "$(whoami)" | grep -qw audio; then
    Installer_warning "Your user should be part of audio group to list audio devices"
    Installer_yesno "Would you like to add audio group to user $USER?" || exit 1
    sudo usermod -a -G audio $USER # add audio group to user
    Installer_warning "Please logout and login for new group permissions to take effect, then restart npm install"
    exit
  fi
}

# Do electron rebuild
Installer_electronrebuild () {
	cd ..
	Installer_pwd="$(pwd)"
	Installer_debug "Current diectory: $Installer_pwd"
	Installer_info "Execute electron-rebuild..."
	Installer_warning "It could takes 10~30 minutes."
	Installer_debug "./node_modules/.bin/electron-rebuild"
	./node_modules/.bin/electron-rebuild || exit 1
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
      hash "$1" 2>/dev/null || (dnf lists installed "$1" > /dev/null 2>&1)
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
  echo
  Installer_info "Removing $@"
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
  echo
}

## Check Audio outpout
Installer_checkaudio () {
  play_hw="${play_hw:-hw:0,0}"
  plug_play="${plug_play:-plughw:0}"
  while true; do
    if Installer_info "Checking audio output..."
      Installer_yesno "Make sure your speakers are on press [Yes].\nPress [No] if you don't want to check." true >/dev/null; then
      echo
      Installer_debug "Actual test input config: $play_hw ($plug_play)"
      aplay -D $plug_play "beep_check.wav" 2>/dev/null || Installer_error "Current configuration not working !"
      Installer_yesno "Did you hear Google beep?" true >/dev/null && break
      echo
      Installer_warning "Selection of the speaker device"
      #aplay -l
      devices="$(aplay -l | grep ^car)"
      Installer_info "$devices"
      read -p "Indicate the card # to use [0-9]: " card
      read -p "Indicate the device # to use [0-9]: " device
      play_hw="hw:$card,$device"
      plug_play="plughw:$card"
      Installer_info "you have selected: $play_hw ($plug_play)"
      #Installer_debug "Set Alsa conf"
      #update_alsa $play_hw $rec_hw
    else
      play_hw=""
      plug_play=""
      break
    fi
  done
}

# Check Microphone
Installer_checkmic () {
  audiofile="testmic.wav"
  rec_hw="${rec_hw:-hw:0,0}"
  plug_rec="${plug_rec:-plughw:0}"
  while true; do
    if Installer_info "Checking audio input..."
      Installer_yesno "Make sure your microphone is on, press [Yes] and say something.\nPress [No] if you don't want to check." true >/dev/null; then
      echo
      Installer_debug "Actual test input config: $rec_hw ($plug_rec)"
      rm -f $audiofile
      arecord -D $plug_rec -r 16000 -c 1 -d 3 -t wav -f S16_LE $audiofile 2>/dev/null || Installer_error "Current configuration not Working !"
      if [ -f $audiofile ]; then
        play $audiofile
        Installer_yesno "Did you hear yourself?" true >/dev/null && break
      fi
      echo
      Installer_warning "Selection of the microphone device"
      #arecord -l
      devices="$(arecord -l | grep ^car)"
      Installer_info "$devices"
      read -p "Indicate the card # to use [0-9]: " card
      read -p "Indicate the device # to use [0-9]: " device
      rec_hw="hw:$card,$device"
      plug_rec="plughw:$card"
      Installer_info "you have selected: $rec_hw ($plug_rec)"
      #update_alsa $play_hw $rec_hw
    else
      rec_hw=""
      plug_rec=""
      break
    fi
  done
  rm -f $audiofile
 }

# Updates alsa user config at ~/.asoundrc
# $1 - play_hw
# $2 - rec_hw
update_alsa () { # usage: update_alsa $play_hw $rec_hw
    Installer_warning "Updating ~/.asoundrc..."
    cat<<EOM > ~/.asoundrc
pcm.!default {
  type asym
   playback.pcm {
     type plug
     slave.pcm "$1"
   }
   capture.pcm {
     type plug
     slave.pcm "$2"
   }
}
EOM
    Installer_warning "Reloading Alsa..."
    sudo /etc/init.d/alsa-utils restart
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

is_pifour() {
   grep -q "^Revision\s*:\s*[ 123][0-9a-fA-F][0-9a-fA-F]3[0-9a-fA-F][0-9a-fA-F][0-9a-fA-F]$" /proc/cpuinfo
   return $?
}

update_node_v14 () {
  Installer_warning "Updating to node v14..."
  NODE_STABLE_BRANCH="14.x"
  # sudo apt-get install --only-upgrade libstdc++6
  node_info=$(curl -sL https://deb.nodesource.com/setup_$NODE_STABLE_BRANCH | sudo -E bash - )
  if [ "$(echo $node_info | grep "not currently supported")." == "." ]; then
    Installer_info "Install/upgrade nodejs..."
    if [ "${debian}" ]
    then
      if [ "${have_apt}" ]
      then
        sudo apt-get install -y nodejs
      else
        if [ "${have_dpkg}" ]
        then
          sudo dpkg -i nodejs
        else
          sudo apt install nodejs
        fi
      fi
    else
      if [ "${have_dnf}" ]
      then
        sudo dnf -y install nodejs
      else
        if [ "${have_yum}" ]
        then
          sudo yum -y install nodejs
        else
          sudo apt install nodejs
        fi
      fi
    fi
  else
    Installer_error "node {$NODE_STABLE_BRANCH} version installer not available, you have to install it manually"
    exit 255
  fi
  Installer_success "Node.js installation Done!"
}

update_npm_v6 () {
  Installer_warning "Updating to npm v6..."
  # Check if a node process is currently running.
  # If so abort installation.
  if pgrep "npm" > /dev/null; then
    Installer_error "npm process is currently running. Can't upgrade."
    Installer_error "Please quit all npm processes and restart the installer."
    exit
  fi
	# update to v6.14.15
	sudo npm i -g npm@6.14.15
	Installer_success "npm installation Done!"
}


Installer_debug "[LOADED] utils.sh"
