
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