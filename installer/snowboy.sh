#!/bin/bash

#--------------
# Hotword utils
#  Bugsounet
# v1.0.0
#--------------

Snowboy_CloneSB() {
  cd ..
  rm -rf snowboy
  Installer_info "Cloning Snowboy@bugsounet from Github..."
  git clone https://github.com/bugsounet/snowboy.git
}

Snowboy_InstSB() {
  echo
  Installer_info "Installing Snowboy..."
  cd snowboy
  npm install -y 2>/dev/null
  cd ..
}

Snowboy_CheckSB() {
  Hotword_err="0"
  Hotword_chk_index="$(ls ~/MagicMirror/modules/MMM-GoogleAssistant/snowboy/lib/node/index.js | grep index)"
  Hotword_chk_node="$(ls ~/MagicMirror/modules/MMM-GoogleAssistant/snowboy/lib/node/binding/Release | grep node)"
  Hotword_chk_electron="$(ls ~/MagicMirror/modules/MMM-GoogleAssistant/snowboy/lib/node/binding/Release | grep electron)"
  Installer_info "Checking Installation..."
  echo "$Hotword_chk_index"
  if [ -z "$Hotword_chk_index" ]; then
    Installer_error "Snowboy index.js missing !"
    Hotword_err="1"
  fi
  echo "$Hotword_chk_node"
  if [ -z "$Hotword_chk_node" ]; then
    Installer_error "Snowboy node build Error!"
    Hotword_err="1"
  fi
  echo "$Hotword_chk_electron"
  if [ -z "$Hotword_chk_electron" ]; then
    Installer_error "Snowboy electron build Error!"
    Hotword_err="1"
  fi
  if [ "$Hotword_err" == "1" ]; then
    exit 1
  else
    Installer_success "Snowboy Build Success !"
  fi
}
