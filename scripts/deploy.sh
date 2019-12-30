#!/bin/bash
set -eu

>&2 echo "Automated deploy currently disabled while moving to new setup"
exit

if [ ! -f public/build/bundle.js ]; then
  echo "Missing build"
  exit 1
fi

rsync -avz --delete public/ root@foreningenbs.no:/var/www/aliases/smaabruket/public/
