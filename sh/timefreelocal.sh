#!/bin/bash
# 20161017 modified by mapi
# 20161120 modified by mapi
# 20170514 modified by sickleaf
# 20170918 modified by sickleaf
# 20170925 (mail-pass deleted)
wkdir="/var/tmp/Radio"

# cd ${wkdir}

if [ $# -eq 3 ]; then
	channel=$1
	fromtime=$2
	totime=$3
else
  echo "usage : $0 channel_name fromtime totime"
  exit 1
fi

mail=
pass=

echo "--- Play Information"
echo ""
echo "Channel   : $channel"
echo "FromTime  : $fromtime"
echo "ToTime    : $totime"
echo "Mail      : $mail"
echo "Pass      : $pass"
echo ""

auth1_fms="${wkdir}/free_${channel}.auth1_fms"
auth2_fms="${wkdir}/free_${channel}.auth2_fms"
#------------------------------------------------------------
playerurl=http://radiko.jp/apps/js/flash/myplayer-release.swf
cookiefile=${wkdir}/cookie.txt
playerfile=${wkdir}/player.swf
keyfile=${wkdir}/authkey.png
loginfile="${wkdir}/login"
templist="${wkdir}/templist.m3u8"
output="${wkdir}/${channel}_${fromtime}.m3u8"


###
# radiko premium
###
if [ $mail ]; then
  wget -q --save-cookie=$cookiefile \
       --keep-session-cookies \
       --post-data="mail=$mail&pass=$pass" \
       -O $loginfile \
       https://radiko.jp/ap/member/login/login

  if [ ! -f $cookiefile ]; then
    echo "failed login"
    exit 1
  fi
fi


#
# get player
#
if [ ! -f $playerfile ]; then
  wget -q -O $playerfile $playerurl

  if [ $? -ne 0 ]; then
    echo "failed get player"
    exit 1
  fi
fi

#
# get keydata (need swftool)
#
if [ ! -f $keyfile ]; then
  swfextract -b 12 $playerfile -o $keyfile

  if [ ! -f $keyfile ]; then
    echo "failed get keydata"
    exit 1
  fi
fi

if [ -f $auth1_fms ]; then
  rm -f $auth1_fms
fi

#
# access auth1_fms
#
wget  -q \
     --header="pragma: no-cache" \
     --header="X-Radiko-App: pc_ts" \
     --header="X-Radiko-App-Version: 4.0.0" \
     --header="X-Radiko-User: test-stream" \
     --header="X-Radiko-Device: pc" \
     --post-data='\r\n' \
     --no-check-certificate \
     --load-cookies $cookiefile \
     --save-headers \
     -O ${auth1_fms} \
     https://radiko.jp/v2/api/auth1_fms

if [ $? -ne 0 ]; then
  echo "failed auth1 process"
  exit 1
fi

#
# get partial key
#
authtoken=`perl -ne 'print $1 if(/x-radiko-authtoken: ([\w-]+)/i)' ${auth1_fms}`
offset=`perl -ne 'print $1 if(/x-radiko-keyoffset: (\d+)/i)' ${auth1_fms}`
length=`perl -ne 'print $1 if(/x-radiko-keylength: (\d+)/i)' ${auth1_fms}`

partialkey=`dd if=$keyfile bs=1 skip=${offset} count=${length} 2> /dev/null | base64`

echo "authtoken: ${authtoken} \noffset: ${offset} length: ${length} \npartialkey: $partialkey"

rm -f $auth1_fms

if [ -f $auth2_fms ]; then
  rm -f $auth2_fms
fi

#
# access auth2_fms
#
wget  -q \
     --header="pragma: no-cache" \
     --header="X-Radiko-App: pc_ts" \
     --header="X-Radiko-App-Version: 4.0.0" \
     --header="X-Radiko-User: test-stream" \
     --header="X-Radiko-Device: pc" \
     --header="X-Radiko-AuthToken: ${authtoken}" \
     --header="X-Radiko-PartialKey: ${partialkey}" \
     --post-data='\r\n' \
     --load-cookies $cookiefile \
     --no-check-certificate \
     -O ${auth2_fms} \
     https://radiko.jp/v2/api/auth2_fms

if [ $? -ne 0 -o ! -f $auth2_fms ]; then
  echo "failed auth2 process"
  exit 1
fi

echo "authentication success"

areaid=`perl -ne 'print $1 if(/^([^,]+),/i)' ${auth2_fms}`
echo "[AreaID]: $areaid"

rm -f $auth2_fms

#
# get stream-url
#

wget -q \
	--header="pragma: no-cache" \
	--header="Content-Type: application/x-www-form-urlencoded" \
	--header="X-Radiko-AuthToken: ${authtoken}" \
	--header="Referer: ${playerurl}"\
	--post-data='flash=1' \
     	--load-cookies $cookiefile \
	--no-check-certificate \
	-O ${templist} \
	"https://radiko.jp/v2/api/ts/playlist.m3u8?l=15&station_id=$channel&ft=$fromtime&to=$totime"

stream_url=`grep radiko ${templist}`
echo "[StreamURL] $stream_url"

sudo rm ${wkdir}/aac/*
sudo rm ${wkdir}/boxaac/*
wget  $stream_url  -O ${output}
sudo sh -c "grep radiko ${output} > ${wkdir}/aac.list"
 
#if [ $? = 0 ]; then
#	sudo rm ${wkdir}/*.m3u8
#	sudo rm ${wkdir}/0830list.txt
#fi

	#first1min=`echo $2 | cut -c 9-12`

	#directory sid_yyyymmdd_hhmm
	#cat ${wklov}/aac.list | grep "${date}_${hhmm}" | while read line; sudo wget -nc -P ${wklov}/aac "$line"; done


	cat ${wkdir}/aac.list | head -n 12 | while read line; do wget --no-verbose -nc -P ${wkdir}/aac "$line"; done
	sh /home/radipi/Script/childlocal.sh ${wkdir} &
	fixed_string=""
	ls ${wkdir}/aac/* | head -n 12 > ${wkdir}/0830list.txt
	while read line;
		do 
			fixed_string="${fixed_string}"" -cat ""$line"
	done < ${wkdir}/0830list.txt

	sudo MP4Box -sbr ${fixed_string} -new ${wkdir}/boxaac/0830.aac


	if [ $? = 0 ]; then
		echo "get cont"
		mpv ${wkdir}/boxaac/0830.aac  && mpv ${wkdir}/boxaac/cont.aac && mpv ${wkdir}/boxaac/rest.aac 

	else
		echo "0830 only"
		mpv ${wkdir}/boxaac/0830.aac 
	fi


	
# child.sh
#cat /var/tmp/aac.list | while read line; do wget --no-verbose -nc -P /var/tmp/aac "$line"; done
#
#	first1min=$1
#	fixed_rest_string=""
#
#	ls -dln /var/tmp/aac/* | grep -v $first1min | cut -d " " -f 10 > /var/tmp/restlist.txt
#	while read line;
#		do 
#			fixed_rest_string="${fixed_rest_string}"" -cat ""$line"
#	done < /var/tmp/restlist.txt
#	rm /var/tmp/restlist.txt
#	echo $fixed_rest_string
#	MP4Box -sbr ${fixed_rest_string} -new rest.aac 
#
#
#echo "all_fin"
