
if(typeof Radipi === "undefined"){
var Radipi = {};
}

Radipi.Const = function(){};

Radipi.hMax = 24; 	// hour:00-23
Radipi.mMax = 60;	// min :00-59

Radipi.scriptPath = "/home/wklov/Script/";

Radipi.phpFileName = "command.php";
Radipi.volumeScript = "setPCMVolume.sh";
Radipi.killScript = "killsound.sh";

Radipi.sleepCommand = "sleep 1 ";
Radipi.weekdays =  new Array('Sun','Mon','Tue','Wed','Thr','Fri','Sat');

function readConfig(){
	Radipi.radikoStationInfo = getFile("config/id.txt");
	Radipi.areaIDInfo = getFile("config/areaid.txt");
	Radipi.streamURLInfo = getFile("config/radipiConfig.csv");
}
