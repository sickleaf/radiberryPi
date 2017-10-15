
if(typeof Radipi === "undefined"){
var Radipi = {};
}

Radipi.Const = function(){};

Radipi.hMax = 24; 	// hour:00-23
Radipi.mMax = 60;	// min :00-59

Radipi.scriptPath = "/home/radipi/script/";

Radipi.phpFileName = "command.php";

Radipi.volumeScript = "setPCMVolume.sh";
Radipi.killScript = "killsound.sh";
Radipi.radikoScript = "playradiko.sh";
Radipi.timefreeScript = "playtimefree.sh";

Radipi.nowplayingID = "presentID";

Radipi.areaText = "areaName";
Radipi.areaValue = "areaID";
Radipi.radikoText = "radikoName";
Radipi.radikoValue = "radikoID";
Radipi.streamingText = "streamingText";
Radipi.streamingValue = "streamingValue";

Radipi.timefreePrefix = "time";

Radipi.sleepCommand = "sleep 1 ";
Radipi.mpvCommand = "mpv --no-video --msg-level=all=info --msg-time  ";
Radipi.weekdays =  new Array('Sun','Mon','Tue','Wed','Thr','Fri','Sat');

function readConfig(){
	Radipi.radikoListInfo = getFile("config/radikoList.csv");
	Radipi.areaListInfo = getFile("config/areaList.csv");
	Radipi.streamingListInfo = getFile("config/streamingList.csv");
}
