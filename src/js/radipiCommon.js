	if(typeof Radipi === "undefined"){
	var Radipi = {};
	}

	Radipi.Const = function(){};
		
	Radipi.hMax = 24; 	// hour:00-23
	Radipi.mMax = 60;		// min:00-59
	Radipi.scriptPath = "/home/wklov/Script/";
	Radipi.sleepCommand = "sleep 1 ";
	Radipi.weekdays =  new Array('Sun','Mon','Tue','Wed','Thr','Fri','Sat');

	function readConfig(){
		Radipi.streamURLInfo = getFile("radipiConfig.csv");
		Radipi.radikoStationInfo = getFile("id.txt");
		Radipi.areaIDInfo = getFile("areaid.txt");
	}


// execute sh command
// [filename]command.php
function doCommand(command){
	var scriptName = "command.php";
        var request = new XMLHttpRequest();
        request.open("POST", "command.php", true);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send("cmd=" + encodeURIComponent(command));
}

function setVolume(sign) {
        doCommand(Radipi.scriptPath + "setPCMVolume.sh " + sign + " 5 ");
}


// don't attach "-" for 'sig'
function killplayer(sig) {
        doCommand(Radipi.scriptPath + "killsound.sh ");
	document.getElementById("presentID").innerHTML="none";
}


// https://elearn.jp/jmemo/javascript/memo-321.html
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


// https://detail.chiebukuro.yahoo.co.jp/qa/question_detail/q1413846629
function loadDateList(){
	var dateFilter = document.inputs.datefilter;
	for (var i=-7;i<1;i++){
		var option = document.createElement('option');
		var datestr = generateDateString(i);
		option.innerHTML= datestr;
		var value = datestr.split("_");
		option.value = value[0];
		dateFilter.appendChild(option);
	}

}

function getFile(filePath){
        var request = new XMLHttpRequest();
        request.open("GET", filePath, false);
        request.send(null);
      	var contentText = request.responseText;
	var splitInfo = contentText.split('\n'); // 1行ごとに分割する
	var jsonInfo = csv2json(splitInfo); // JSON形式に変換
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