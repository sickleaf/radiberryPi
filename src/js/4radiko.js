function loadTimeList(){
	var hMax = Radipi.hMax;
	var mMax = Radipi.mMax;
	var hourID = document.inputs.hourID;
	var minID = document.inputs.minID;
	
	for (var i=0;i<hMax;i++){
		var option = document.createElement('option');
		var hvalue = ( '00' + i ).slice( -2 );
		if (i==0){
			option.text = hvalue + "[hour]" ;
		}else{
			option.text = hvalue;
		}
		option.value = hvalue;
		hourID.appendChild(option);
	}
	
	for (var i=0;i<mMax;i++){
		var option = document.createElement('option');
		var mvalue = ( '00' + i ).slice( -2 );
		if (i==0){
			option.text = mvalue + "[min]" ;
		}else{
			option.text = mvalue;
		}
		option.value = mvalue;
		minID.appendChild(option);
	}
}

// not for use
function playnhkworld() {
	killplayer(' -TERM ');
	document.getElementById("presentID").innerHTML="NHKWorld";
        doCommand(Radipi.scriptPath + "playNHKWorld.sh ");
}


function playradiko(val) {
	killplayer(' -TERM ');
	document.getElementById("presentID").innerHTML=val;
//	playjingle(val);
        doCommand(Radipi.sleepCommand + Radipi.scriptPath + "2playradiko.sh -p " + val);
}

function selectList() {
	var st = document.inputs.station.selectedIndex;
	var station= document.inputs.station.options[st].value;

	var da = document.inputs.dfil.selectedIndex;
	var date= document.inputs.dfil.options[da].value;

	var ho = document.inputs.hour.selectedIndex;
	var hour = document.inputs.hour.options[ho].value;

	var mi = document.inputs.min.selectedIndex;
	var min= document.inputs.min.options[mi].value;

	document.getElementById("presentID").innerHTML=st;
        playtimefree(station,date,hour,min);
}

// TASK 引数にsecを追加し、endday.setSeconds(0);を修正する
function playtimefree(station,date,hour,min,sec) {
	var starttime= date + hour + min + sec;
	var endday= new Date();

	endday.setFullYear(date.substring(0,4));
	endday.setMonth(date.substring(4,6)-1);
	endday.setDate(date.substring(6,8));
	endday.setHours(hour);
	endday.setMinutes(min);
	endday.setSeconds(sec);

	endday.setMinutes(endday.getMinutes()+10);

	var eyear = endday.getFullYear();
	var emonth = ("0"+(endday.getMonth()+1) ).slice(-2);
	var eday = ("0"+endday.getDate()).slice(-2);
	var ehour= ("0"+endday.getHours()).slice(-2);
	var emin= ("0"+endday.getMinutes()).slice(-2);
	var eseconds= ("0"+endday.getSeconds()).slice(-2);
	var endtime = eyear + emonth + eday + ehour + emin + eseconds;

	killplayer(' -TERM ');
	console.log(Radipi.scriptPath + "playtimefree.sh " + station + " " + starttime + " " + endtime );
	doCommand(Radipi.scriptPath + "playtimefree.sh " + station + " " + starttime + " " + endtime );
}

function loadStationList(){
	var stationLength = Radipi.radikoStationInfo.length;
	var stationID = document.inputs.stationID;
	
	for (var i=0;i< stationLength;i++){
		var option = document.createElement('option');
		var stationItem = Radipi.radikoStationInfo[i];
		if (i==0){
			option.text = stationItem.stationName + "[radikoID]" ;
		}else{
			option.text = stationItem.stationName;
		}
		option.value = stationItem.radikoID;
		stationID.appendChild(option);
	}
}

function getStationRandom(){
	var stationLength = Radipi.radikoStationInfo.length;
	var stationIndex = Math.floor( Math.random() * stationLength );
	var selectedStation = Radipi.radikoStationInfo[stationIndex];
	document.getElementById('stationID').value = selectedStation.radikoID;
	playradiko(selectedStation.radikoID);
}

function getURLfromStationInfo(id){
	var matchData = Radipi.stationInfo.filter(function(item){
	if (item.stationID == id) return true;
	});
	return matchData[0].URL;
}
