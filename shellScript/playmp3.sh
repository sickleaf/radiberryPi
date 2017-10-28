#!/bin/bash
#$1	resourcePath
#$2	number(default 100)
resourcePath="$1"
number=100
exPath=""
if [ ! "$1" = '' ]; then 
	resourcePath="$1"
fi
if [ ! "$2" = '' ]; then 
	number="$2"
fi

if expr "$resourcePath" : '.*\.txt' > /dev/null; then
	echo "<<playmp3.sh>>read_txt"
	echo "[resourcePath]:$resourcePath"
	echo "[number]:$number"
	exPath=`echo $resourcePath | cut -d "/" -f 1-3`
	echo "[exPath]:$exPath"
	cat "$resourcePath" | shuf | head -`expr $number` | while read line; do mpv --no-video --msg-level=all=warn "$exPath/$line"; done
else 
	echo "<<playmp3.sh>>specific_dir"
	echo "[resourcePath]:$resourcePath"
	echo "[number]:$number"
	find "$resourcePath" -name "*.mp3" | shuf | head -`expr $number` | while read line; do mpv --no-video --msg-level=all=warn "$line"; done
fi
