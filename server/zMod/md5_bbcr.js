var zmC=require('./cons.js');
var zmMd5=require('./md5.js');

exports.smd5=function(iv){return bbcrmd5(iv);}
exports.smd5in=function(iv){return bbcrmd5internal(iv);}

function bbcrmd5(iv){
	var lv;
	var lv_noise_head=zmC.MD5_NOISE_HEAD;
	var lv_noise_tail=zmC.MD5_NOISE_TAIL;

	lv=lv_noise_head+iv+lv_noise_tail;
	lv=zmMd5.hexmd5(lv);
	lv=lv.toUpperCase();
	return lv;	
}


function bbcrmd5internal(iv){
	//only used in server
	var lv;
	var lv_noise_head=zmC.MD5_NOISE_HEAD;
	var lv_noise_tail=zmC.MD5_NOISE_TAIL;

	lv="^_^"+lv_noise_head+iv+lv_noise_tail+"internal use only"+":-)";
	lv=zmMd5.hexmd5(lv);
	lv=lv.toUpperCase();
	return lv;	
}