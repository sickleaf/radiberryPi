/*
 [Radipi]
	radiko局一覧			radikoIDInfo
	ストリーミングURL一覧	streamingListInfo
 	スクリプトパス		scriptPath

*/

// radikoStationID->radikoListInfo:	radikoID,radikoName
// areaID->areaIDInfo:			areaID,areaName
// streamingID->streamingListInfo:	streamingText,streamingValue
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

function playradiko(stationID) {
	killplayer(' TERM ');
	document.getElementById(Radipi.nowplayingID).innerHTML=stationID;
//	playjingle(val);
        doCommand(Radipi.sleepCommand + " && " + Radipi.scriptPath + Radipi.radikoScript + " -p " + stationID);
}

function playStreamURL (val) {
	var stationURL = getURLfromStationInfo(val);	
	killplayer(' TERM ');
	document.getElementById(Radipi.nowplayingID).innerHTML=val;
        doCommand(Radipi.sleepCommand + " && " + Radipi.mpvCommand + stationURL );
}

function getURLfromStationInfo(id){
	var matchData = Radipi.streamingListInfo.filter(function(item){
	if (item[Radipi.streamingText] == id) return true;
	});
	var hitItem = matchData[0];
	var returnValue = hitItem[Radipi.streamingValue];
	return returnValue;
}

function getStationRandom(dropdownListID){
	var dropdownList  = document.getElementById(dropdownListID);

	var listLength = dropdownList.length;
	var listIndex = Math.floor( Math.random() * listLength );
	var selectedStationID = dropdownList.options[listIndex].value;

	dropdownList.value = selectedStationID;
	playradiko(selectedStationID);

}

function playfromlist(stationID) {
	var stationList = document.getElementById(stationID);
	var stationIndex = stationList.selectedIndex;
	var stationValue = stationList.options[stationIndex].value;

	playradiko(stationValue);
}

function onAreaSelected(parentListId,childListId){
	var parentList = document.getElementById(parentListId);
	var childList = document.getElementById(childListId);

	
	var stationLength = Radipi.radikoListInfo.length;
	var parentIndex = parentList.selectedIndex;
	var parentAreaID = parentList.options[parentIndex].value;
	
	
	if ( parentIndex == 0 ){
		for (var i=0;i< stationLength;i++){
			var option = document.createElement('option');
			var stationItem = Radipi.radikoListInfo[i];
			option.text = stationItem[Radipi.radikoText];
			option.value = stationItem[Radipi.radikoValue];
			childList.appendChild(option);
		}
	}else{
		while (childList.childNodes.length) {
			childList.removeChild(childList.lastChild);
		}

		for (var i=0;i< stationLength;i++){
			var option = document.createElement('option');
			var stationItem = Radipi.radikoListInfo[i];
			if (stationItem[Radipi.areaValue] == parentAreaID ){
				option.text = stationItem[Radipi.radikoText];
				option.value = stationItem[Radipi.radikoValue];
				childList.appendChild(option);
			}
		}


	}
}

function changeTimefree(num,timeType,numMax,numMin){
	var elementID = Radipi.timefreePrefix + timeType;
	var previousValue = document.getElementById(elementID).value;
	var num = parseInt(previousValue) + parseInt(num);
	if (num >= numMax){
		num = numMax;
	}
	if (num <= numMin){
		num = numMin;
	}
	document.getElementById(elementID).value= num;
}

function selectList(radikoID,hour,min,sec,playlength,playdate,dirtype) {
	var Tstation= document.getElementById(radikoID).value;
	var Thour = document.getElementById(hour).value;
	var Tmin = document.getElementById(min).value;
	var Tsec = document.getElementById(sec).value;
	var Tplaylength = document.getElementById(playlength).value;

	var elements = document.getElementsByName(playdate);
	for (var playdate="", i=elements.length; i--;){
		if(elements[i].checked){
			var Tplaydate = elements[i].value;
			break;
		}
	}

        playtimefree(Tstation,Tplaydate,Thour,Tmin,Tsec,Tplaylength,dirtype);
}


//playlength : Min
function playtimefree(station,playdate,hour,min,sec,playlength,dirtype) {
	var starttime = calculateYYYYMMDDHHMMSS(playdate,hour,min,sec,0);
	var endtime = calculateYYYYMMDDHHMMSS(playdate,hour,min,sec,playlength);
	var outputLog = station + "_" + starttime + "[" + playlength + "]";

	killplayer(' TERM ');
	console.log(Radipi.scriptPath + Radipi.timefreeScript + " " + station + " " + starttime + " " + endtime);
	doCommand(Radipi.scriptPath + Radipi.timefreeScript + " " + station + " " + starttime + " " + endtime + " " + dirtype);
	document.getElementById(Radipi.nowplayingID).innerHTML= outputLog;
}

function calculateYYYYMMDDHHMMSS(playdate,hour,min,sec,playlength){
	var day= new Date();
	day.setFullYear(playdate.substring(0,4));
	day.setMonth(playdate.substring(4,6)-1);
	day.setDate(playdate.substring(6,8));
	day.setHours(hour);
	day.setMinutes(min);
	day.setSeconds(sec);
	
	day.setMinutes(day.getMinutes() + parseInt(playlength) );

	var Ryear = day.getFullYear();
	var Rmonth = ("0"+(day.getMonth()+1) ).slice(-2);
	var Rday = ("0"+day.getDate()).slice(-2);
	var Rhour= ("0"+day.getHours()).slice(-2);
	var Rmin= ("0"+day.getMinutes()).slice(-2);
	var Rseconds= ("0"+day.getSeconds()).slice(-2);

	var Rtime = Ryear + Rmonth + Rday + Rhour + Rmin + Rseconds;

	return Rtime;
}

function changeDate(){
	for (var i=7;i>=0;i--){
		var labelname = 'dayMinus' + i + 'Label';
		var datestr = generateDateString(-i);
		var value = datestr.split("_");
		var labelvalue = value[0];
		document.getElementById(labelname).textContent= datestr;
		var radiobutton = 'dayMinus' + i;
		document.getElementById(radiobutton).value = labelvalue;
 	}
}

function playfromStreamList(streamID){
	var streamList = document.getElementById(streamID);
	var streamIndex = streamList.selectedIndex;
	var streamText = streamList.options[streamIndex].text;

	playStreamURL(streamText);
}

function getStreamingRandom(dropdownListID){
	var listName = document.getElementById(dropdownListID);

	var listLength = listName.length;
	var listIndex = Math.floor( Math.random() * listLength );
	var selectedText = listName.options[listIndex].text;

	listName.value= listName.options[listIndex].value;
	playStreamURL(selectedText);
}
