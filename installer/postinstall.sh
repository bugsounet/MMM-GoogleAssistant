#!/bin/bash
# +-----------------+
# | npm postinstall |
# +-----------------+

rebuild=0
minify=0
bugsounet=0
change=0

while getopts ":rmb" option; do
  case $option in
    r) # -r option for magicmirror rebuild
       rebuild=1;;
    m) # -m option for minify all sources
       minify=1;;
  esac
done

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
Installer_checkOS
echo

if [[ $minify == 1 ]]; then
  Installer_info "Minify Main code..."
  node minify.js || {
    Installer_error "Minify Failed!"
    exit 255
  }
  Installer_success "Done"
  echo
fi

# Go back to module root
cd ..

if [[ $rebuild == 1 ]]; then
  Installer_info "Rebuild electron..."
  electron-rebuild 1>/dev/null || {
    Installer_error "Rebuild Failed"
    exit 255
  }
  Installer_success "Done"
  echo
fi

# Check bookworm and enable pulseaudio (debian is for x64 raspbian)
if  [[ "$os_name" == "raspbian" || "$os_name" == "debian" ]] && [ "$os_version" -eq 12 ]; then
  check_pipewire="$(pgrep wireplumber)"
  if [[ "$check_pipewire" -gt 0 ]]; then
    Installer_info "Install pulseaudio by default..."
    sudo raspi-config nonint do_audioconf 1 || exit 255
    Installer_success "pulseaudio activated!"
    echo
    ((change++))
  fi
fi

# check kernel x64 with 32bits userspace
if  [ "$os_name" == "raspbian" ] && [ "$arch" == "aarch64" ]; then
  userspace="$(getconf LONG_BIT)"
  if [ "$userspace" == "32" ]; then
    if [ "$os_version" -eq 12 ]; then
      configFile="/boot/firmware/config.txt"
      if [ ! -f $configFile ]; then
        configFile="/boot/config.txt"
      fi
    else
      configFile="/boot/config.txt"
    fi
    arm64_search="$(grep -m1 '\arm_64bit' $configFile)"
    arm64_value=$(get_config_var $configFile arm_64bit)
    Installer_info "$os_name $os_version: You have an x64 kernel with an 32bits userspace"
    Installer_info "For better performance with MMM-GoogleAssistant, let's turn on 32bits kernel"
    if [ "$arm64_search." == "." ]; then
      Installer_info "... set arm64bit=0 into $configFile"
      set_config_var $configFile arm_64bit 0
      echo
      ((change++))
    else
      if [ $arm64_value -eq 1 ]; then
        Installer_info "... unset arm64bit=1 and set arm64bit=0 into $configFile"
        set_config_var $configFile arm_64bit 0
        echo
        ((change++))
      else
        Installer_info "... arm64bit value is already set to 0 in $configFile"
        echo
        ((change++))
      fi
    fi
  fi
fi

# module name
Installer_module="$(grep -Eo '\"name\"[^,]*' ./package.json | grep -Eo '[^:]*$' | awk  -F'\"' '{print $2}')"

Installer_success "$Installer_module is now installed !"

if [[ "$change" -gt 0 ]]; then
  echo
  Installer_warning "[WARN] Please, don't forget to reboot your OS for apply the new configuration!"
fi
