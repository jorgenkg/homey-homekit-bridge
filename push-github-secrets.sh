#!/bin/bash

set -ex
set -o pipefail

if ! which gh &>/dev/null
then
  echo "[gh] required. Install https://github.com/cli/cli#installation" 
  exit 1;
fi

if ! gh auth status &>/dev/null
then
  echo "Requires gh to be authenticated: gh auth login"
  exit 1;
fi

gh secret set HOMEY_SETTINGS -e Publish --repo jorgenkg/homey-homekit-bridge < ~/.athom-cli/settings.json
