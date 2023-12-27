#!/bin/bash

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
Installer_beep=false
domain=$(<DomainName)

if [ -z $domain ]; then
  Installer_error "[SMARTHOME] Domain not found!"
  exit 255
fi

rm -f DomainName

Installer_yesno "[SMARTHOME] Router is ready ?" || {
  Installer_info "Don't forget to forward ports 80 and 443 to your Pi's IP address!"
  exit 255
}

Installer_info "[SMARTHOME] Installing https certificate for $domain\n"
certbot -d $domain --nginx || {
  echo
  Installer_error "[SMARTHOME] Failed to create certificate\n"
  exit 255
}

Installer_success "[SMARTHOME] Certificate installed !\n"
Installer_success "[GA] MMM-GoogleAssistant is now available at https://$domain"
Installer_success "[SMARTHOME] SmartHome is now available at https://$domain/smarthome/"
