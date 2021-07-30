#!/bin/bash
# +-----------------+
# | npm postinstall |
# +-----------------+

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

# module name
Installer_module="MMM-GoogleAssistant"

Installer_info "Install Last RadioLogoFR Package"
tar -xzvf ../installer/LogosRadiosFR.tar.gz -C ../resources && Installer_success "Done"

echo

Installer_info "Prepare PIR sensor using"
# for pir sensor
sudo usermod -a -G gpio pi || echo "Error command: sudo usermod -a -G gpio pi"
Installer_success "Done"
echo

# Disable Screensaver
### Part of script of @sdetweil magicmirror_script ###
### All credit is to Sam ###

# find out if some screen saver running

# get just the running processes and args
# just want the program name (1st token)
# find the 1st with 'saver' in it (should only be one)
# parse with path char, get the last field ( the actual pgm name)

screen_saver_running=$(ps -A -o args | awk '{print $1}' | grep -m1 [s]aver | awk -F\/ '{print $NF}');

Installer_info "Try to Disable screen saver..."

# if we found something
if [ "$screen_saver_running." != "." ]; then
  # some screensaver running
  case "$screen_saver_running" in
   mate-screensaver) echo 'Found: mate screen saver'
        gsettings set org.mate.screensaver lock-enabled false	 2>/dev/null
        gsettings set org.mate.screensaver idle-activation-enabled false	 2>/dev/null
        gsettings set org.mate.screensaver lock_delay 0	 2>/dev/null
     echo " $screen_saver_running disabled"
     DISPLAY=:0  mate-screensaver  >/dev/null 2>&1 &
     ;;
   gnome-screensaver) echo 'Found: gnome screen saver'
     gnome_screensaver-command -d >/dev/null 2>&1
     echo " $screen_saver_running disabled"
     ;;
   xscreensaver) echo 'Found: xscreensaver running'
     xsetting=$(grep -m1 'mode:' ~/.xscreensaver )
     if [ $(echo $xsetting | awk '{print $2}') != 'off' ]; then
       sed -i "s/$xsetting/mode: off/" "$HOME/.xscreensaver"
       echo " xscreensaver set to off"
     else
       echo " xscreensaver already disabled"
     fi
     ;;
   gsd-screensaver | gsd-screensaver-proxy) echo "Found: gsd-screensaver"
      setting=$(gsettings get org.gnome.desktop.screensaver lock-enabled 2>/dev/null)
      setting1=$(gsettings get org.gnome.desktop.session idle-delay 2>/dev/null)
      if [ "$setting. $setting1." != '. .' ]; then
        if [ "$setting $setting1" != 'false uint32 0' ]; then
          echo "disable screensaver via gsettings was $setting and $setting1"
          gsettings set org.gnome.desktop.screensaver lock-enabled false
          gsettings set org.gnome.desktop.screensaver idle-activation-enabled false
          gsettings set org.gnome.desktop.session idle-delay 0
        else
          echo "gsettings screen saver already disabled"
        fi
      fi
      ;;
   *) echo "some other screensaver $screen_saver_running" found
      echo "please configure it manually"
     ;;
  esac
fi
if [ $(which gsettings | wc -l) == 1 ]; then
  setting=$(gsettings get org.gnome.desktop.screensaver lock-enabled 2>/dev/null)
  setting1=$(gsettings get org.gnome.desktop.session idle-delay 2>/dev/null)
  echo "Found: screen saver in gsettings"
  if [ "$setting. $setting1." != '. .' ]; then
    if [ "$setting $setting1" != 'false uint32 0' ]; then
      echo "disable screensaver via gsettings was $setting and $setting1"
      gsettings set org.gnome.desktop.screensaver lock-enabled false
      gsettings set org.gnome.desktop.screensaver idle-activation-enabled false
      gsettings set org.gnome.desktop.session idle-delay 0
    else
      echo "gsettings screen saver already disabled"
    fi
  fi
fi
if [ -e "/etc/lightdm/lightdm.conf" ]; then
  # if screen saver NOT already disabled?
  echo "Found: screen saver in lightdm"
  if [ $(grep 'xserver-command=X -s 0 -dpms' /etc/lightdm/lightdm.conf | wc -l) == 0 ]; then
    echo "disable screensaver via lightdm.conf"
    sudo sed -i '/^\[Seat:/a xserver-command=X -s 0 -dpms' /etc/lightdm/lightdm.conf
  else
    echo "screensaver via lightdm already disabled"
  fi
fi
if [ -d "/etc/xdg/lxsession/LXDE-pi" ]; then
  currently_set=$(grep -m1 '\-dpms' /etc/xdg/lxsession/LXDE-pi/autostart)
  echo "Found: screen saver in lxsession"
  if [ "$currently_set." == "." ]; then
    echo "disable screensaver via lxsession"
    # turn it off for the future
    sudo su -c "echo -e '@xset s noblank\n@xset s off\n@xset -dpms' >> /etc/xdg/lxsession/LXDE-pi/autostart"
    # turn it off now
    export DISPLAY=:0; xset s noblank;xset s off;xset -dpms
  else
    echo "lxsession screen saver already disabled"
  fi
fi
Installer_success "Done"
echo

Installer_info "Minify Main code"
node minify.js
Installer_success "Done"
echo

# the end...
Installer_warning "Support is now moved in a dedicated Server: http://forum.bugsounet.fr"
Installer_warning "@bugsounet"
echo
Installer_success "$Installer_module is now installed !"
