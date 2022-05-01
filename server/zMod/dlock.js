var zmUser=require('./user.js');
var zmSession=require('./session.js');

var ma_list=new Array();
/* ============================= */
exports.timer=function(){
    //called by main 1sec timer
    delLockIfSessOut();
}


exports.tryEdit=function(iv_dataid,iv_sessToken){
    var rto=exports.emptyObj();
    rto.lockedby=checkDataLocked(iv_dataid);
    var lv_sessid=zmSession.getSessionId(iv_sessToken);

    if(lv_sessid=="") rto.msg="session invalid";
    else{
        if(rto.lockedby =='') {
            rto.edit=true;
            regNewLock(iv_dataid,lv_sessid,zmSession.checkUserBySessionId(lv_sessid));
        }else{
            rto.edit=false;
            rto.msg="Data locked by "+rto.lockedby;
        }        
    }

    return rto;
}

exports.unlock=function(iv_dataid,iv_sessid){
    //check if data is owned by session first
    var lo=null;
    for(var i=0;i<ma_list.length;i++)
        if(ma_list[i].dataid==iv_dataid)
            lo=ma_list[i];
    if(lo==null){
        console.log("dlock.unlock: data not found, unlock failed( dataid, unlock session): "+iv_dataid+", "+iv_sessid);
        return;
    }
    else if(lo.sessid!=iv_sessid){
        console.log("dlock.unlock: data not owned by session, unlock failed( dataid / data owner session, unlock session): "+iv_dataid+" / "+lo.sessid+", "+iv_sessid);
        return;
    }
    delLockByDataid(iv_dataid);
    console.log("data unlocked( dataid / owner session): "+iv_dataid+" / "+lo.sessid);
}

exports.unlockAll=function(iv_sessToken){
    var lv_sessid=zmSession.getSessionId(iv_sessToken);
    delLockBySessid(lv_sessid);
}

exports.emptyObj=function(){
    return {edit: false,
            lockedby: '',
            //lockedinfo, future todo, lable here (device/browser...)
            msg:''};
}

exports.returnMem=function(){
    return ma_list;
}
/* ============================= */
function checkDataLocked(iv_dataid){
    var rtv='';
    //for now, return userid if data is locked
    //going fwd, will also return device/browser, 
    //when session module supports such new lable

    for(var i=0;i<ma_list.length;i++){
        if(ma_list[i].dataid==iv_dataid)
            rtv=ma_list[i].sessuser;
    }

    return rtv;
}
function regNewLock(iv_dataid,iv_sessid,iv_userid){
    var lo={
        dataid:iv_dataid,
        sessid:iv_sessid,
        sessuser:iv_userid
    };

    ma_list.push(lo);

}
function delLockByDataid(iv_dataid){
    var la=new Array();

    for(var i=0;i<ma_list.length;i++){
        if(ma_list[i].dataid != iv_dataid)
            la.push(ma_list[i]);
    }

    ma_list=la;
}


function delLockBySessid(iv_sessid){
    var la=new Array();

    for(var i=0;i<ma_list.length;i++){
        if(ma_list[i].sessid != iv_sessid)
            la.push(ma_list[i]);
    }

    ma_list=la;
}

function delLockIfSessOut(){
    //scan all locks and remove if session no longer available
    var lv_chk;
    var la=new Array();

    for(var i=0;i<ma_list.length;i++){
        lv_chk=zmSession.checkSessExist(ma_list[i].sessid);
        if(lv_chk)
            la.push(ma_list[i]);
    }

    ma_list=la;
}

