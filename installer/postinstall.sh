#!/bin/bash
# +-----------------+
# | npm postinstall |
# +-----------------+

rebuild=0
minify=0
bugsounet=0

while getopts ":rmb" option; do
  case $option in
    r) # -r option for magicmirror rebuild
       rebuild=1;;
    m) # -m option for minify all sources
       minify=1;;
    b) # -b option display bugsounet credit
       bugsounet=1;;
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
  Installer_info "Rebuild MagicMirror..."
  MagicMirror-rebuild 2>/dev/null || {
    Installer_error "Rebuild Failed"
    exit 255
  }
  Installer_success "Done"
  echo
fi

# module name
Installer_module="$(grep -Eo '\"name\"[^,]*' ./package.json | grep -Eo '[^:]*$' | awk  -F'\"' '{print $2}')"

# the end...
if [[ $bugsounet == 1 ]]; then
  Installer_warning "Support is now moved in a dedicated Server: https://forum.bugsounet.fr"
  Installer_warning "@bugsounet"
  echo
fi
Installer_success "$Installer_module is now installed !"
