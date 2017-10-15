#!/bin/bash

lines=$(sleep 2 &&  ps aux | grep mpv | grep -v grep | grep -v -E "*--length=[0-9]{1,} -o*" | awk -F "/" '{print $NF}')

if expr "$lines" : '[0-9]\{2\} .*mp3' > /dev/null; then 
	newlines=$(echo "$lines" | cut -d " " -f 2- )
	newlines2=$(echo "$newlines" | awk '{sub(".mp3.*","");print $0}' )
	echo $newlines2
else
	newlines=$(echo $lines | cut -d "." -f -1 )
	echo $newlines
fi


