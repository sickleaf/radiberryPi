#!/bin/bash

#$1	volume number or +,-
#$2	increase/decrease value

if [ "$1" = '+' ]; then 
	amixer set PCM `expr $2`dB+
fi

if [ "$1" = '-' ]; then 
	amixer set PCM `expr $2`dB-
fi

expr "$1" + 1 > /dev/null 2>&1
if [ $? -lt 2 ]
then
	amixer set PCM `expr $1`%
fi
