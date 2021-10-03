#!/bin/bash
# +----------------+
# | npm preinstall |
# +----------------+

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
CurrentNpmVer="$(npm -v)"
MinRequireNpmVer="6.14.15"
MaxRequireNpmVer="7.0.0"
CurrentNodeVer="$(node -v)"
RequireNodeVer="v12.0.0"

# module name
Installer_module="MMM-GoogleAssistant"

echo

# Let's start !
Installer_info "Welcome to $Installer_module"

echo

# Check not run as root
Installer_info "No root checking..."
if [ "$EUID" -eq 0 ]; then
  Installer_error "npm install must not be used as root"
  exit 255
fi
Installer_chk "$(pwd)/../" "MMM-GoogleAssistant"
Installer_chk "$(pwd)/../../../" "MagicMirror"
echo

# Check platform compatibility
Installer_info "Checking OS..."
Installer_checkOS
if  [ "$platform" == "osx" ]; then
  Installer_error "OS Detected: $OSTYPE ($os_name $os_version $arch)"
  Installer_error "Automatic installation is not included"
  echo
  exit 255
else
  if  [ "$os_name" == "raspbian" ] && [ "$os_version" -lt 10 ]; then
    Installer_error "OS Detected: $OSTYPE ($os_name $os_version $arch)"
    Installer_error "Unfortunately, this module is not compatible with your OS"
    Installer_error "Try to update your OS to the lasted version of raspbian"
    echo
    exit 255
  else
    Installer_success "OS Detected: $OSTYPE ($os_name $os_version $arch)"
  fi
fi

echo
Installer_info "NPM Version testing:"
 if [ "$(printf '%s\n' "$MinRequireNpmVer" "$CurrentNpmVer" | sort -V | head -n1)" = "$MinRequireNpmVer" ]; then 
        Installer_warning "Require: >= ${MinRequireNpmVer} < ${MaxRequireNpmVer}"
        if [[ "$(printf '%s\n' "$MaxRequireNpmVer" "$CurrentNpmVer" | sort -V | head -n1)" < "$MaxRequireNpmVer" ]]; then
          Installer_success "Current: ${CurrentNpmVer} ✓"
        else
          Installer_error "Current: ${CurrentNpmVer} 𐄂"
          Installer_error "Failed: incorrect version!"
          echo
          exit 255
        fi
 else
        Installer_warning "Require: ${RequireNpmVer}"
        Installer_error "Current: ${CurrentNpmVer} 𐄂"
        Installer_error "Failed: incorrect version!"
        exit 255
 fi
echo
Installer_info "NODE Version testing:"
 if [ "$(printf '%s\n' "$RequireNodeVer" "$CurrentNodeVer" | sort -V | head -n1)" = "$RequireNodeVer" ]; then 
        Installer_warning "Require: >= ${RequireNodeVer}"
        Installer_success "Current: ${CurrentNodeVer} ✓"
 else
        Installer_warning "Require: >= ${RequireNodeVer}"
        Installer_error "Current: ${CurrentNodeVer} 𐄂"
        Installer_error "Failed: incorrect version!"
        exit 255
 fi
echo
Installer_success "Passed: perfect!"

echo
# check dependencies
dependencies=(git curl unclutter libasound2-dev sox libsox-fmt-all gcc-7 libsox-fmt-mp3 build-essential mpg321 vlc libmagic-dev libatlas-base-dev cec-utils libudev-dev)
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
# apply @sdetweil fix
Installer_info "Installing @sdetweil sandbox fix..."
bash -c "$(curl -sL https://raw.githubusercontent.com/sdetweil/MagicMirror_scripts/master/fixsandbox)"

echo
# switch branch
Installer_info "Installing Sources..."
git checkout -f prod 2>/dev/null || Installer_error "Installing Error !"
git pull 2>/dev/null

echo
Installer_info "Installing all npm libraries..."
cd ..
