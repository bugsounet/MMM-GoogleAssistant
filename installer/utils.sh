#!/bin/bash

#--------------
# Common utils
#  Bugsounet
#--------------

# postinstaller version
Installer_vinstaller="1.0.9 by Bugsounet"

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

# check the version of GCC and downgrade it if it's not 7
Installer_check_gcc7 () {
	Installer_debug "gcc: $Installer_gcc"
	Installer_debug "gcc revision: $Installer_gcc_rev"
	Installer_debug "gcc version: $Installer_gcc_version"
	if [[ "$Installer_gcc_version" != "7" ]]; then
		Installer_debug "Forced script to reconize as GCC 8"
		Installer_warning "You are using GCC $Installer_gcc_version, this is not compatible with this program."
		Installer_warning "You have to downgrade to GCC 7."
		Installer_yesno "Do you want to make changes ?" || exit 1
		Installer_info "Installing GCC 7..."
		sudo apt-get install gcc-7 || exit 1
		Installer_success "GCC 7 installed"
		Installer_info "Making GCC 7 by default..."
		sudo update-alternatives --install /usr/bin/gcc gcc /usr/bin/gcc-7 10 || exit 1
		sudo update-alternatives --config gcc || exit 1
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

# display gcc version
Installer_gcc="$(gcc --version | grep gcc)"
Installer_gcc_rev="$(echo "${Installer_gcc#g*) }")"
Installer_gcc_version="$(echo $Installer_gcc_rev | cut -c1)"

#  Installer_update
Installer_update () {
  sudo apt-get update -y
}

# indicates if a package is installed
#
# $1 - package to verify
Installer_is_installed () {
  hash "$1" 2>/dev/null || (dpkg -s "$1" 2>/dev/null | grep -q "installed")
}

# install packages, used for dependencies
#
# $@ - list of packages to install
Installer_install () {
  sudo apt-get install -y $@
  sudo apt-get clean
}

# remove packages, used for uninstalls
#
# $@ - list of packages to remove
Installer_remove () {
  echo
  Installer_info "Removing $@"
  sudo apt-get autoremove --purge $@
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

Installer_checkmicv2 () {
  audiofile="testmic.wav"
  plug_rec="${plug_rec:-plughw:1}"
  while true; do
    if Installer_info "Checking audio input..."
      Installer_yesno "Make sure your microphone is on, press [Yes] and say something.\nPress [No] if you don't want to check." true >/dev/null; then
      echo
      Installer_debug "Actual test input config: $plug_rec"
      rm -f $audiofile
      arecord -D $plug_rec -r 16000 -c 1 -d 3 -t wav -f S16_LE $audiofile 2>/dev/null || Installer_error "Current configuration not Working !"
      if [ -f $audiofile ]; then
        Installer_info "Using default output speaker for playing"
        play $audiofile || Installer_error "Output device error ! (default speaker not set)"
        Installer_yesno "Did you hear yourself?" true >/dev/null && break
      fi
      echo
      Installer_warning "Selection of the microphone device"
      devices="$(arecord -l)"
      Installer_info "$devices"
      read -p "Indicate the card # to use [0-9]: " card
      plug_rec="plughw:$card"
      Installer_info "you have selected: $plug_rec"
    else
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

Installer_debug "[LOADED] utils.sh"
