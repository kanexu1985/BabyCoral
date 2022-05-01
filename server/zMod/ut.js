var zmSmd5=require('./md5_bbcr.js');

exports.smd5=function(iv){
    return zmSmd5.smd5(iv);
}

exports.ts_now=function(){
    var rtv;

	var t=new Date();

    rtv = convertDateToTs(t);
    return rtv;
}

exports.ts_shift=function(iv_ts,iv_shift,iv_unit){
    //only support ts mode: YYYYMMDDHHNNSS
    // iv_unit:
    // [Y]ear, [M]onth, [D]ay
    // [H],[N],[S]

    var t=new Date();

    // console.log(iv_ts.substring(0,4));
    // console.log(Number(iv_ts.substring(4,6))-1);
    // console.log(iv_ts.substring(6,8));
    // console.log(iv_ts.substring(8,10));
    // console.log(iv_ts.substring(10,12));
    // console.log(iv_ts.substring(12,14));

    t.setFullYear(iv_ts.substring(0,4));
    t.setMonth(Number(iv_ts.substring(4,6))-1);
    t.setDate(iv_ts.substring(6,8));
    t.setHours(iv_ts.substring(8,10));
    t.setMinutes(iv_ts.substring(10,12));
    t.setSeconds(iv_ts.substring(12,14));

    // console.log(iv_ts);
    // console.log(t);
    if(iv_unit=="Y") t.setFullYear(t.getFullYear()+iv_shift);
    if(iv_unit=="M") t.setMonth(t.getMonth()+iv_shift);
    if(iv_unit=="D") t.setDate(t.getDate()+iv_shift);

    if(iv_unit=="H") t.setHours(t.getHours()+iv_shift);
    if(iv_unit=="N") t.setMinutes(t.getMinutes()+iv_shift);
    if(iv_unit=="S") t.setSeconds(t.getSeconds()+iv_shift);

    
    // console.log(t);
    return convertDateToTs(t);
}

function convertDateToTs(io_date){
    var t = io_date;

    var lv_y=t.getFullYear();
	var lv_m=twoDigits(t.getMonth()+1);
	var lv_d=twoDigits(t.getDate());

	var lv_h=twoDigits(t.getHours());
    var lv_mt=twoDigits(t.getMinutes());
    var lv_s=twoDigits(t.getSeconds());

    var rtv=''+lv_y+lv_m+lv_d+lv_h+lv_mt+lv_s; //default
    // if(iv_mode=="YYYYMMDDHHNN") rtv=""+lv_y+lv_m+lv_d+lv_h+lv_mt;
    // if(iv_mode=="YYYYMMDDHHNNSS") rtv=""+lv_y+lv_m+lv_d+lv_h+lv_mt+lv_s;
    // if(iv_mode=="YYYYMMDD") rtv=""+lv_y+lv_m+lv_d;
    // if(iv_mode=="HHNN") rtv=""+llv_h+lv_mt;
    // if(iv_mode=="HHNNSS") rtv=""+llv_h+lv_mt+lv_s;
    return rtv;
}


exports.ran=function(min, max) {
    return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function twoDigits(iv){
    if(iv<10) return "0"+iv;
    else return ""+iv;
}



var sharedArrayBuffer_for_sleep = new SharedArrayBuffer( 4 ) ;
var sharedArray_for_sleep = new Int32Array( sharedArrayBuffer_for_sleep ) ;
var sleepp = function( n ) {
    Atomics.wait( sharedArray_for_sleep , 0 , 0 , n ) ;
}

exports.sleep=function(iv){
    sleepp(iv);
}