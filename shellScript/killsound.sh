#!/bin/bash

sig=$1

killall --signal ${sig} -q  mplayer mpg321 mpv vlc playmp3.sh playradiko.sh exmp3.sh
