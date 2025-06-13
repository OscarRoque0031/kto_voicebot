#!/bin/bash

cd /root/kto-api || exit 1

git add .

git commit -m "Automatische backup $(date '+%Y-%m-%d %H:%M:%S')"

git push origin master
