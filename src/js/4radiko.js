/*
 [Radipi]
	radiko局一覧			radikoStationInfo
	ストリーミングURL一覧	streamURLInfo
 	スクリプトパス		scriptPath

*/
// id:radikoID,stationName
// areaid:areaID,areaName
// stream:URL,ID
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

function playfromlist() {
	killplayer(' TERM ');
	var st = document.inputs.station.selectedIndex;
	var station= document.inputs.station.options[st].value;
	document.getElementById("presentID").innerHTML=station;
        doCommand("sleep 1 && /home/radipi/Script/playradiko.sh -p " + station);
}

function playradiko(val) {
	killplayer(' -TERM ');
	document.getElementById("presentID").innerHTML=val;
//	playjingle(val);
        doCommand(Radipi.sleepCommand + Radipi.scriptPath + "2playradiko.sh -p " + val);
}

function selectList() {
	var station= document.getElementById("radikoID").value;
	var hour = document.getElementById("timeHour").value;
	var min = document.getElementById("timeMin").value;
	var sec = document.getElementById("timeSec").value;
	var playlength = document.getElementById("timeLength").value;

	var elements = document.getElementsByName("timefreeDate");
	for (var playdate="", i=elements.length; i--;){
		if(elements[i].checked){
			var playdate = elements[i].value;
			break;
		}
	}

        playtimefree(station,playdate,hour,min,sec,playlength);

	document.getElementById("presentID").innerHTML=station;
}

//playlength : Min
function playtimefree(station,playdate,hour,min,sec,playlength) {
	var starttime = calculateYYYYMMDDHHMMSS(playdate,hour,min,sec,0);
	var endtime = calculateYYYYMMDDHHMMSS(playdate,hour,min,sec,playlength);

	killplayer(' TERM ');
	console.log("/home/radipi/Script/playtimefree.sh " + station + " " + starttime + " " + endtime );
	doCommand("/home/radipi/Script/playtimefree.sh " + station + " " + starttime + " " + endtime );
	document.getElementById("presentID").innerHTML= station + "_" + starttime + "[" + playlength + "]" ;
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

function getStationRandom(resultStringID,dropdownListID){
	var resultString  = document.getElementById(resultStringID);
	var dropdownList  = document.getElementById(dropdownListID);
	var stationLength = Radipi.radikoStationInfo.length;
	var stationIndex = Math.floor( Math.random() * stationLength );
	var selectedStation = Radipi.radikoStationInfo[stationIndex];
	dropdownList.value = selectedStation.radikoID;
	resultString.value = selectedStation.radikoID;
	playradiko(selectedStation.radikoID);
}

// for radiko timefree
function changeDate(){
	for (var i=7;i>=0;i--){
		var labelname = 'dayMinus' + i + 'Label';
		var datestr = generateDateString(-i);
		var value = datestr.split("_");
		var labelvalue = value[0];
		document.getElementById(labelname).textContent= labelvalue;
		var radiobutton = 'dayMinus' + i;
		document.getElementById(radiobutton).value = labelvalue;
 	}
}

//id:timeHour,timeMin,timeSec,timeLength
function changeTimefree(num,timeType,numMax,numMin){
	var elementID = 'time' + timeType;
	var previousHour = document.getElementById(elementID).value;
	var num = parseInt(previousHour) + parseInt(num);
	if (num >= numMax){
		num = numMax;
	}
	if (num <= numMin){
		num = numMin;
	}
	document.getElementById(elementID).value= num;
}

// TODO move fixed string to config.js
function playStreamURL (val) {
	var stationURL = getURLfromStationInfo(val);	
	killplayer(' TERM ');
	document.getElementById("presentID").innerHTML=val;
        doCommand("sleep 1 && mpv --no-video --msg-level=all=info --msg-time " + stationURL );
}

function getURLfromStationInfo(id){
	var matchData = Radipi.stationInfo.filter(function(item){
	if (item.stationID == id) return true;
	});
	return matchData[0].URL;
}

function onAreaSelected(parentListId,childListId){
	var parentList = document.getElementById(parentListId);
	var childList = document.getElementById(childListId);
	var parentIndex = parentList.selectedIndex;
	var parentAreaID = parentList.options[parentIndex].value;
	var stationLength = Radipi.radikoStationInfo.length;

	while (childList.childNodes.length) {
		childList.removeChild(childList.lastChild);
	}
	
	for (var i=0;i< stationLength;i++){
		var option = document.createElement('option');
		var stationItem = Radipi.radikoStationInfo[i];
		if (stationItem.areaID == parentAreaID || parentIndex == 0){
			option.text = stationItem.stationName;
			option.value = stationItem.radikoID;
			childList.appendChild(option);
		}
	}
}