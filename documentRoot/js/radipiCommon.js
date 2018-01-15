/*
 [Radipi]
	phpファイル名		phpFileName
 	スクリプトパス		scriptPath
	音量スクリプト		volumeScript
	停止スクリプト		killScript
	再生中テキストID	nowplayingID
	曜日の配列		weekdays
*/


function getFile(filePath){
        var request = new XMLHttpRequest();
        request.open("GET", filePath, false);
        request.send(null);
      	var contentText = request.responseText;
	var splitInfo = contentText.split('\n');	// separate each line
	var jsonInfo = csv2json(splitInfo); 		// convert to JSON format
	return jsonInfo;
}

function csv2json(csvArray){
	var jsonArray = [];
	var items = csvArray[0].split(',');
	
	for (var i = 1; i < csvArray.length - 1; i++) {
		var a_line = new Object();
		var csvArrayD = csvArray[i].split(',');
		for (var j = 0; j < items.length; j++) {
			a_line[items[j]] = csvArrayD[j];
		}
		jsonArray.push(a_line);
	}
	return jsonArray;
}

function doCommand(command){
	console.log(command);
        var request = new XMLHttpRequest();
        request.open("POST",Radipi.phpFileName, true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send("cmd=" + encodeURIComponent(command));
}

function setVolume(sign,value) {
        doCommand(Radipi.scriptPath + Radipi.volumeScript + " " + sign + " " + value);
}


function killplayer(sig) {
	var killcommand = Radipi.scriptPath + Radipi.killScript + " " + sig; 
        doCommand(killcommand);
	document.getElementById(Radipi.nowplayingID).innerHTML="none";
}

function generateDateString(offset){
	var date = new Date();

	date.setDate(date.getDate()+offset);
	var year = date.getFullYear();
	var month = ("0"+(date.getMonth()+1) ).slice(-2);
	var day = ("0"+date.getDate()).slice(-2);
	var wdindex = date.getDay();
	var wday = Radipi.weekdays[wdindex];
	var str = year + month  + day + '_' + wday;
	return str;
}

function mpvSeek(seekSec){
	doCommand(Radipi.scriptPath + Radipi.mpvSeekScript + " " + seekSec + " " + Radipi.mpvSocketPath);
}

function origmpvSeek(seekSec){
	var echoCmd = "echo '{ \"command\": [\"seek\", \"" + seekSec + "\"] }'";
	var socatCmd = " | socat - ";
	var execCommand = echoCmd + socatCmd + Radipi.mpvSocketPath;
	doCommand(execCommand);
}
