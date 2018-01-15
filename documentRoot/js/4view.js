
function loadConfig(elementID,configBase,valueType,textType){
	var configInfo = Radipi[configBase];
	var configLength =configInfo.length;
	var element = document.getElementById(elementID);
	
	for (var i=0;i< configLength;i++){
		var option = document.createElement('option');
		var configItem = configInfo[i];
		option.value = configItem[valueType];
		option.text = configItem[textType];
		element.appendChild(option);
	}
}

function playRecordList(recordID,number) {
	var recordList = document.getElementById(recordID);
	var recordIndex = recordList.selectedIndex;
	var recordText = recordList.options[recordIndex].text;

	var recordPath = getRecordListInfo(recordText);	
	playRecord(recordPath,recordText,number);
}

function playRecord(recordPath,recordText,number) {
	killplayer('TERM');
	document.getElementById(Radipi.nowplayingDirID).innerHTML=recordText;
	doCommand(Radipi.sleepCommand + " && " + Radipi.scriptPath + Radipi.playMp3Script + " \"" + recordPath + "\" " + Radipi.mpvSocketPath  + " " + number);
}

function getRecordListInfo(id){
	var matchData = Radipi.dirListInfo.filter(function(item){
	if (item[Radipi.dirText] == id) return true;
	});
	var hitItem = matchData[0];
	var returnValue = hitItem[Radipi.dirValue];
	return returnValue;
}
