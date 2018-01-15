#!/bin/bash
#$1	resourcePath
#$3	mpv socket path
#$2	number(default 100)

resourcePath="$1"
mpvSocket="$2"
number=100
exPath=""
if [ ! "$3" = '' ]; then 
	number="$3"
fi

if expr "$resourcePath" : '.*\.txt' > /dev/null; then
	echo "<<playmp3.sh>>read_txt"
	echo "[resourcePath]:$resourcePath"
	echo "[mpvSocket]:$mpvSocket"
	echo "[number]:$number"
	exPath=`echo $resourcePath | cut -d "/" -f 1-3`
	echo "[exPath]:$exPath"
	cat "$resourcePath" | shuf | head -`expr $number` | while read line; do mpv --no-video --msg-level=all=warn --input-ipc-server=$mpvSocket  "$exPath/$line"; done
else 
	echo "<<playmp3.sh>>specific_dir"
	echo "[resourcePath]:$resourcePath"
	echo "[mpvSocket]:$mpvSocket"
	echo "[number]:$number"
	find "$resourcePath" -name "*.mp3" | shuf | head -`expr $number` | while read line; do mpv --no-video --msg-level=all=warn  --idle=no --input-ipc-server=$mpvSocket "$line"; done
fi
