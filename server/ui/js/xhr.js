
/* xh listener  */
var xmlhttp = new XMLHttpRequest();
var url = ""; //(url info not used in the POST func. on server side)
xmlhttp.open("POST", url, true);
//xmlhttp.setRequestHeader("Accept","application/json, text/javascript, */*; q=0.01");
//xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
// xmlhttp.oontimeout = function (e) {
// 	console.log("server timeout");
// 	console.log(e);
//   };
xmlhttp.onreadystatechange = function() {
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
	//rtn in JSON:
	// console.log(xmlhttp.responseText);
    var oData=JSON.parse(xmlhttp.responseText);	
	hXhrCallBack(oData);
  }else{
	if (xmlhttp.readyState == 4) 
		hErr();
  }
};


function xhrSend(oData,cbf){
	
	hXhrCallBack=cbf; /* override */
	
	var data = JSON.stringify(oData);


	xmlhttp.open("POST", url, true);
	//xmlhttp.setRequestHeader("Accept","application/json, text/javascript, */*; q=0.01");
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	//xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
	//xmlhttp.send(oData);
	//xmlhttp.send("view=none&act=test");
/*	
	//xmlhttp.send("view=none&act=test");
	var data_txt = JSON.stringify(oData).replace(/\"/g,"")
	data_txt = data_txt.replace(/{/g,"");
	data_txt = data_txt.replace(/}/g,"");
	data_txt = data_txt.replace(/:/g,"=");
	data_txt = data_txt.replace(/,/g,"&");
	//console.log(data_txt);
	//xmlhttp.send(data_txt);
*/
	xmlhttp.send(data);
	
}

function xhrSend2(iv,cbf,cbferr){
	
	hXhrCallBack=cbf; 
	hErr=cbferr;

	xmlhttp.open("POST", url, true);
	
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
/*	
	var data_txt = JSON.stringify(iv).replace(/\"/g,"")
	data_txt = data_txt.replace(/{/g,"");
	data_txt = data_txt.replace(/}/g,"");
	data_txt = data_txt.replace(/:/g,"=");
	data_txt = data_txt.replace(/,/g,"&");
*/	

	xmlhttp.send(iv);
	
}

function xhrSend3(iv,cbf,cbferr){

	var lo_xmlhttp = new XMLHttpRequest();
	var lv_url = ""; //(url info not used in the POST func. on server side)
	
	lo_xmlhttp.onreadystatechange = function() {
	  if (lo_xmlhttp.readyState == 4 && lo_xmlhttp.status == 200) {
		//rtn in JSON:
		var lo_oData=JSON.parse(lo_xmlhttp.responseText);	
		cbf(lo_oData);
	  }else{
		if (lo_xmlhttp.readyState == 4) 
			cbferr();
	  }
	};

	lo_xmlhttp.addEventListener('error',cbferr)

	lo_xmlhttp.open("POST", lv_url, true);
	lo_xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
	lo_xmlhttp.send(iv);
		
}


/************************************/
/* http post call back function  */
/* to be override                */
	function hXhrCallBack(oData){
		//console.log(oData);
		console.log("hXhrCallBack is original");
	}

	// function hErr(io_xmlhttp){
	function hErr(){
		console.log("xhr err")
		// console.log(io_xmlhttp)
	}