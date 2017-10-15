#!/bin/bash
#$1	resourcePath
#$2	number(default 100)
number=100
mp3path="$1"
if [ ! "$2" = '' ]; then 
	number="$2"
fi
if expr "$mp3path" : '.*\.txt' > /dev/null; then
	cat "$1" | shuf | head -`expr $2` | while read line; do mpv --no-video "/mnt/tpd1/$line"; done
else 
	find "$1" -name "*.mp3" | shuf | head -`expr $2` | while read line; do mpv --no-video --msg-level=all=info "$line"; done
fi
