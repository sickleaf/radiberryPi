
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

function playRecordList(recordID) {
	var recordList = document.getElementById(recordID);
	var recordIndex = recordList.selectedIndex;
	var recordText = recordList.options[recordIndex].text;

	var recordPath = getRecordListInfo(recordText);	
	playRecord(recordPath,recordText);
}

function playRecord (recordPath,recordText) {
	killplayer('TERM');
	document.getElementById(Radipi.nowplayingDirID).innerHTML=recordText;
        doCommand(Radipi.sleepCommand + " && " + Radipi.scriptPath + Radipi.playMp3Script + " \"" + recordPath+ "\"" );
}

function getRecordListInfo(id){
	var matchData = Radipi.dirListInfo.filter(function(item){
	if (item[Radipi.dirText] == id) return true;
	});
	var hitItem = matchData[0];
	var returnValue = hitItem[Radipi.dirValue];
	return returnValue;
}
