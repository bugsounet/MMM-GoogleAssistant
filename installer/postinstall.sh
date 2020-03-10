#!/bin/bash
# +--------------------------------+
# | npm postinstall                |
# | Google Assistant  by Bugsounet |
# +--------------------------------+

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
source hotword.sh
# del last log
rm installer.log 2>/dev/null

# module name
Installer_module="MMM-GoogleAssistant"

# use beep request questions ?
Installer_beep=true

# logs in installer.log file
Installer_log

# check version
Installer_version="$(cat ../package.json | grep version | cut -c14-30 2>/dev/null)"

# Let's start !
Installer_info "Welcome to $Installer_module $Installer_version"
Installer_info "postinstall script v$Installer_vinstaller"

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

Installer_yesno "Do you want to execute automatic intallation ?" || exit 0

# check dependencies
dependencies=(git wget libmagic-dev libatlas-base-dev libasound2-dev sox libsox-fmt-all gcc-7 libsox-fmt-mp3 build-essential mpg321 vlc)
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

echo

# all is ok than electron-rebuild
Installer_info "Electron Rebuild"
Installer_yesno "Do you want to execute electron rebuild" && (
  Installer_electronrebuild
  Installer_success "Electron Rebuild Complete!"
)
echo

# install snowboy
echo
Installer_yesno "Installing Snowboy..." && (
  Hotword_CloneSB
  Hotword_InstSB
  Hotword_Electron
  Hotword_CheckSB
)

echo

# pulse audio and mmap issue
if Installer_is_installed "pulseaudio"; then
  if [ "$os_name" == "raspbian" ]; then
    Installer_warning "RPI Pulseaudio check"
    Installer_warning "Pulseaudio is installed"
    Installer_error "You might have some mmap error and no response audio"
    Installer_warning "if you are not using Bluetooth, you can uninstall pulseaudio"
    Installer_warning "Note: You can try whithout uninstalling pulseaudio"
    Installer_warning "by using the play-sound version"
    Installer_warning "useHTML5: false --- playProgram: \"mpg321\" , playProgram: \"mpg123\" or playProgram: \"cvlc\""
    Installer_yesno "Do you want uninstall pulseaudio?" && Installer_remove "pulseaudio"
  fi
fi

echo
# Audio out/in checking
Installer_info "Checking Speaker and Microphone..."
Installer_yesno "Do you want check your audio configuration" && (
  Installer_checkaudio
  echo
  Installer_checkmic
  echo

  if [ ! -z "$plug_rec" ]; then
    Installer_warning "This is your GoogleAssistant micConfig working configuration :"
    if [ "$os_name" == "raspbian" ]; then
      Installer_warning "Remember: if you are using RPI, it's better to use arecord program"
    fi
    echo
    Installer_warning "micConfig: {"
    Installer_warning "  recorder: \"arecord\","
    Installer_warning "  device: \"$plug_rec\""
    Installer_warning "},"
  fi
)

echo

# the end...
Installer_exit "$Installer_module is now installed !"
