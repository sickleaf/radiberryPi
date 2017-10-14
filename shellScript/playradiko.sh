#!/bin/bash
pid=$$
wkdir='/var/tmp'
playerurl=http://radiko.jp/apps/js/flash/myplayer-release.swf
playerfile="${wkdir}/player.swf"
keyfile="${wkdir}/authkey.png"
auth1_fms="${wkdir}/auth1_fms"
auth2_fms="${wkdir}/auth2_fms"
date=`date +%Y%m%d_%H%M`
stream_url=""
url_parts=""
nhkurl="http://www3.nhk.or.jp/netradio"
nhkplayerurl="$nhkurl/files/swf/rtmpe.swf"
rtmpepath="/home/radipi/Radio"

mail=
pass=
cookiefile="${wkdir}/cookie.txt"
loginfile="${wkdir}/login"


# Usage
show_usage() {
    echo 'Usage:'
    echo ' RECORD MODE' 1>&2
    echo "   `basename $0` [-d out_dir] [-f file_name]" 1>&2
    echo '          [-t rec_minute] [-s Starting_position] channel' 1>&2
    echo '           -d  Default out_dir = $HOME' 1>&2
    echo '                  a/b/c = $HOME/a/b/c' 1>&2
    echo '                 /a/b/c = /a/b/c' 1>&2
    echo '                ./a/b/c = $PWD/a/b/c' 1>&2
    echo '           -f  Default file_name = channel_YYYYMMDD_HHMM_PID' 1>&2
    echo '           -t  Default rec_minute = 1' 1>&2
    echo '               60 = 1 hour, 0 = go on recording until stopped(control-C)' 1>&2
    echo '           -s  Default starting_position = 00:00:00' 1>&2
    echo ' PLAY MODE' 1>&2
    echo "   `basename $0` -p [-t play_minute] [-n ] channel" 1>&2
    echo '           -p  Play mode. No recording.' 1>&2
    echo '           -t  Default play_minute = 0' 1>&2
    echo '               60 = 1 hour, 0 = go on recording until stopped(control-C)' 1>&2
    echo '           -n  NHK flag.' 1>&2
    echo '               [HK | CK | BK] R1 | R2 | FM ' 1>&2
    echo '               (HK:sendai,CK:nagoya,BK:osaka)' 1>&2
}

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

#wget -q \
#    --header="pragma: no-cache" \
#    --header="Cache-Control: no-cache" \
#    --header="Expires: Thu, 01 Jan 1970 00:00:00 GMT" \
#    --header="Accept-Language: ja-jp" \
#    --header="Accept-Encoding: gzip, deflate" \
#    --header="Accept: application/json, text/javascript, */*; q=0.01" \
#    --header="X-Requested-With: XMLHttpRequest" \
#    --no-check-certificate \
#    --load-cookies $cookiefile \
#    --save-headers \
#    -O $checkfile \
#    https://radiko.jp/ap/member/webapi/member/login/check

# authorize
authorize() {
    #
    # get player
    #
    if [ ! -f ${playerfile} ]; then
        wget -O ${playerfile} ${playerurl}
        if [ ! -f ${playerfile} ]; then
            echo "[stop] failed get player (${playerfile})" 1>&2 ; exit 1
        fi
    fi
    #
    # get keydata (need swftool)
    #
    if [ ! -f ${keyfile} ]; then
        swfextract -b 12 ${playerfile} -o ${keyfile}
        if [ ! -f ${keyfile} ]; then
            echo "[stop] failed get keydata (${keyfile})" 1>&2 ; exit 1
        fi
    fi
    #
    # access auth1_fms
    #
    wget -q \
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
        echo "[stop] failed auth1 process (${auth1_fms})" 1>&2 ; exit 1
    fi
    #
    # get partial key
    #
    authtoken=`perl -ne 'print $1 if(/x-radiko-authtoken: ([\w-]+)/i)' ${auth1_fms}`
    offset=`perl -ne 'print $1 if(/x-radiko-keyoffset: (\d+)/i)' ${auth1_fms}`
    length=`perl -ne 'print $1 if(/x-radiko-keylength: (\d+)/i)' ${auth1_fms}`
    partialkey=`dd if=${keyfile} bs=1 skip=${offset} count=${length} 2> /dev/null | base64`
    #echo "authtoken: ${authtoken} 1>&2
    #echo "offset: ${offset} 1>&2
    #echo "length: ${length} 1>&2
    #echo "partialkey: ${partialkey}" 1>&2
    rm -f ${auth1_fms}
    #
    # access auth2_fms
    #
    wget -q \
        --header="pragma: no-cache" \
        --header="X-Radiko-App: pc_ts" \
        --header="X-Radiko-App-Version: 4.0.0" \
        --header="X-Radiko-User: test-stream" \
        --header="X-Radiko-Device: pc" \
        --header="X-Radiko-Authtoken: ${authtoken}" \
        --header="X-Radiko-Partialkey: ${partialkey}" \
        --post-data='\r\n' \
        --no-check-certificate \
        --load-cookies $cookiefile \
        -O ${auth2_fms} \
        https://radiko.jp/v2/api/auth2_fms
    if [ $? -ne 0 -o ! -f ${auth2_fms} ]; then
        echo "[stop] failed auth2 process (${auth2_fms})" 1>&2 ; exit 1
    fi
    #echo "authentication success" 1>&2
    areaid=`perl -ne 'print $1 if(/^([^,]+),/i)' ${auth2_fms}`
    #echo "areaid: ${areaid}" 1>&2
    rm -f ${auth2_fms}
    #
    # get stream-url
    #
    wget -q \
	--load-cookies $cookiefile \
	--no-check-certificate \
	-O ${ch_xml} \
        "https://radiko.jp/v2/station/stream/${channel}.xml"
    if [ $? -ne 0 -o ! -f ${ch_xml} ]; then
        echo "[stop] failed stream-url process (channel=${channel})"
        rm -f ${ch_xml} ; show_usage ; exit 1
    fi
    stream_url=`echo "cat /url/item[1]/text()" | \
            xmllint --shell ${ch_xml} | tail -2 | head -1`
    url_parts=(`echo ${stream_url} | \
            perl -pe 's!^(.*)://(.*?)/(.*)/(.*?)$/!$1://$2 $3 $4!'`)
    rm -f ${ch_xml}

	echo "[url_parts0] ${url_parts[0]}"
	echo "[url_parts1] ${url_parts[1]}"
	echo "[url_parts2] ${url_parts[2]}"
}
authorizeANDplayNHK (){
	#
	# set station(HK:sendai,CK:nagoya,BK:osaka)
	#
	lch=`echo $channel | tr "A-Z" "a-z"`
	uch=`echo $channel | tr "a-z" "A-Z"`
	case $uch in
	    "R1")
	    play="63346"
	    ;;
	    "R2")
	    play="63342"
	    ;;
	    "FM")
	    play="63343"
	    ;;
	    "HKR1")
	    play="108442"
	    ;;
	    "HKFM")
	    play="108237"
	    ;;
	    "CKR1")
	    play="108234"
	    ;;
	    "CKFM")
	    play="108235"
	    ;;
	    "BKR1")
	    play="108232"
	    ;;
	    "BKFM")
	    play="108233"
	    ;;
	    *)
	    echo "failed station"
	    exit 1
	    ;;
	esac
	rtmp="rtmpe://netradio-$lch-flash.nhk.jp"
	playpath="NetRadio_${uch}_flash@$play"
	hashvalue=`openssl sha256 -hmac "Genuine Adobe Flash Player 001" ${rtmpepath}/rtmpe.swf | cut -d ' ' -f 2`
	hashsize=`wc -c ${rtmpepath}/rtmpe.swf`
	echo $hashvalue
	echo $hashsize
    # rtmpdump
    rtmpdump -r ${rtmp} \
        --app "live" \
        --playpath ${playpath} \
	--swfhash  ${hashvalue}\
	--swfsize  ${hashsize}\
        --live \
        --stop ${duration} | \
        mpv - 
}
# Record
# Play
play() {
    # rtmpdump
    rtmpdump -r ${url_parts[0]} \
        --app ${url_parts[1]} \
        --playpath ${url_parts[2]} \
        -W $playerurl \
        -C S:"" -C S:"" -C S:"" -C S:$authtoken \
        --live \
        --stop ${duration} | \
        mpv - --quiet
}
# debug
debug() {
    echo "-p : ${OPTION_p}"
    echo "-d : ${OPTION_d}    value: \"${VALUE_d}\""
    echo "-f : ${OPTION_f}    value: \"${VALUE_f}\""
    echo "-t : ${OPTION_t}    value: \"${VALUE_t}\""
    echo "-s : ${OPTION_s}    value: \"${VALUE_s}\""
    echo "-n : ${OPTION_n}    value: \"${VALUE_n}\""
    echo ''
    echo "channel : \"${channel}\""
    echo "outdir  : \"${outdir}\""
    echo "filename: \"${filename}\""
    echo "duration: \"${duration}\""
    echo "starting: \"${starting}\""
    echo ''
}
# Get Option
while getopts pd:f:t:s:n OPTION
do
    case $OPTION in
        p ) OPTION_p=true
            ;;
        d ) OPTION_d=true
            VALUE_d="$OPTARG"
            ;;
        f ) OPTION_f=ture
            VALUE_f="$OPTARG"
            ;;
        t ) OPTION_t=true
            VALUE_t="$OPTARG"
            if ! expr "${VALUE_t}" : '[0-9]*' > /dev/null ; then
                show_usage ; exit 1
            fi
            ;;
        s ) OPTION_s=ture
            VALUE_s="$OPTARG"
            ;;
        n ) OPTION_n=true
            ;;
        * ) show_usage ; exit 1 ;;
    esac
done
# Get Channel
shift $(($OPTIND - 1))
if [ $# -ne 1 ]; then
    show_usage ; exit 1
fi
channel=$1
#
# RECORD Mode
#
if [ ! "${OPTION_p}" ]; then
#    debug
    authorize && record
#
# PLAY Mode
#
else
    # Get Minute
    duration=`expr ${VALUE_t:=0} \* 60`
	echo $channel
    if [ ! "${OPTION_n}"  ]; then
    # debug
	ch_xml="${wkdir}/${channel}${pid}.xml"
    	authorize && play
    else
    # debug
    	authorizeANDplayNHK
    fi
fi
