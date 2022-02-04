#!/bin/bash
# +---------+
# | Rebuild |
# +---------+

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

Installer_info "Welcome to GA rebuild script"
Installer_warning "This script will erase current build"
Installer_error "Use this script only for the new version of Magic Mirror or developer request"
Installer_error "recipes, credentials.json, token.json will be not erased"
Installer_error "after executing this script, it will restart the installation, you must do it!"
Installer_yesno "Do you want to continue ?" || exit 0

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

echo
# Check platform compatibility
Installer_info "Checking OS..."
Installer_checkOS
Installer_success "OS Detected: $OSTYPE ($os_name $os_version $arch)"

echo
# Check dependencies
# Required packages on Debian based systems
deb_dependencies=(wget unclutter build-essential vlc libmagic-dev libatlas-base-dev cec-utils libudev-dev)
# Required packages on RPM based systems
rpm_dependencies=(blas-devel file-libs vlc wget autoconf automake binutils bison flex gcc gcc-c++ glibc-devel libtool make pkgconf strace byacc ccache cscope ctags elfutils indent ltrace perf valgrind systemd-devel libudev-devel libcec)
# Check dependencies
if [ "${debian}" ]
then
  dependencies=( "${deb_dependencies[@]}" )
else
  if [ "${have_dnf}" ]
  then
    dependencies=( "${rpm_dependencies[@]}" )
  else
    if [ "${have_yum}" ]
    then
      dependencies=( "${rpm_dependencies[@]}" )
    else
      dependencies=( "${deb_dependencies[@]}" )
    fi
  fi
fi

[ "${__NO_DEP_CHECK__}" ] || {
  Installer_info "Update all dependencies..."
  Installer_update_dependencies
  Installer_success "All Dependencies needed are updated !"
}

MMHOME="${HOME}/MagicMirror"
[ -d ${MMHOME}/modules/MMM-GoogleAssistant ] || {
  MMHOME=
  for homedir in /usr/local /home/*
  do
    [ "${homedir}" == "/home/*" ] && continue
    [ -d ${homedir}/MagicMirror/modules/MMM-GoogleAssistant ] && {
      MMHOME="${homedir}/MagicMirror"
      break
    }
  done
}

if [ "${MMHOME}" ]
then
  cd ${MMHOME}/modules/MMM-GoogleAssistant
else
  cd ~/MagicMirror/modules/MMM-GoogleAssistant
fi

echo
Installer_info "Deleting: package-lock.json node_modules" 
rm -rf package.json package-lock.json node_modules
Installer_success "Done."
echo
Installer_info "Upgrading GoogleAssistant..."
git reset --hard HEAD
git checkout package.json
git pull
Installer_success "Done."
echo
Installer_info "Reinstalling GoogleAssistant..."
npm install
