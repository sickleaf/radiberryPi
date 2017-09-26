/*
 [Radipi]
 	スクリプトパス	scriptPath
	曜日の配列		weekdays
	phpファイル名	phpFileName
	音量スクリプト	volumeScript
	停止スクリプト	killScript
*/


function getFile(filePath){
        var request = new XMLHttpRequest();
        request.open("GET", filePath, false);
        request.send(null);
      	var contentText = request.responseText;
	var splitInfo = contentText.split('\n');	// separate each line
	var jsonInfo = csv2json(splitInfo); 	// convert to JSON format
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
        var request = new XMLHttpRequest();
        request.open("POST",Radipi.phpFileName, true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send("cmd=" + encodeURIComponent(command));
}

// TODO 5を引数に
function setVolume(sign) {
        doCommand(Radipi.scriptPath + Radipi.volumeScript + sign + " 5 ");
}


function killplayer(sig) {
        doCommand(Radipi.scriptPath + Radipi.killScript + sig );
	document.getElementById("presentID").innerHTML="none";
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
