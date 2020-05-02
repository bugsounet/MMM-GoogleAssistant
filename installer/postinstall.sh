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
# del last log
rm installer.log 2>/dev/null

# module name
Installer_module="MMM-GoogleAssistant"

# use beep request questions ?
Installer_beep=true

echo
# all is ok than electron-rebuild
Installer_info "Electron Rebuild for grpc library"
Installer_yesno "Do you want to execute electron rebuild" && (
  Installer_electronrebuild
  Installer_success "Electron Rebuild Complete!"
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
