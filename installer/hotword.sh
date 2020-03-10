#!/bin/bash

#--------------
# Hotword utils
#  Bugsounet
# v1.0.0
#--------------

Hotword_CloneSB() {
  cd ..
  Installer_info "Cloning Snowboy from Github..."
  git clone https://github.com/Kitt-AI/snowboy.git
  cd snowboy
  rm -rf .git
  Installer_info "Copying Snowboy models..."
  cp -r resources/models ..
  echo
}

Hotword_InstSB() {
  Installer_info "Installing nan / node-pre-gyp dependencies..."
  npm install -y nan node-pre-gyp 2>/dev/null
  echo
  Installer_info "Configure node-pre-gyp module..."
  ./node_modules/node-pre-gyp/bin/node-pre-gyp clean configure build >/dev/null
  echo
  Installer_info "Installing Snowboy..."
  npm install -y 2>/dev/null
}

Hotword_Electron() {
  Installer_info "Installing electron-rebuild..."
  npm install -y electron-rebuild
  Installer_info "Execute electron-rebuild..."
  ./node_modules/.bin/electron-rebuild || exit 1
  echo
}

Hotword_CheckSB() {
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
