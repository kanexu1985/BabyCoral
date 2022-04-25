var zmUser=require('./user.js');
var zmSm=require('./md5_bbcr.js');
var zmC=require('./cons.js');

var mv_timeout;
var ma_list=new Array();

/* ============================= */
exports.init=function(){
    ma_list=new Array();
    mv_timeout=zmC.TIMEOUT_MIN*60*1000; //convert to millsecond
}

exports.timer=function(){
    //called by main 1sec timer
    timerCheck();
}

exports.main=function(io){
    var rtv;
    var lo_chk;
    // var lv_msg="";

    if(io.act=="pbeg"){
        //called when a app/page loads
        lo_chk = pageBegins(zmUser.curUserid());
    }
    if(io.act=="mact"){
        //called when manual action performed
        lo_chk = manAction(io.session.token);
    }
    if(io.act=="achk"){
        //called by app/page bg check, if timeout or not
        lo_chk = autoCheck(io.session.token);
    }
    if(io.act=="mout"){
        //called to erase all session by same user
        //to do: check logic later
        lo_chk = manLogout(io.session.token);
    }

    rtv={
        session:lo_chk,
        msg:null
    }

    return rtv;
}
exports.pbeg=function(){
    //shortcut of main() "pbeg"
    //called by app back end init block
    return pageBegins(zmUser.curUserid());
}
exports.mact=function(iv_token){
    //shortcut of main() "achk"
    //called by app back end
    return manAction(iv_token);
}

exports.getSessionId=function(iv_token){
    //should only be called in server
    //session id should not pass to UI

    var lo_old=findSession(iv_token);

    if(lo_old) return lo_old.id;
    else return '';
}

exports.checkSessExist=function(iv_sessid){
    var rtv = false;

    for(var i=0;i<ma_list.length;i++){
        if(ma_list[i].id==iv_sessid) rtv=true;
    }

    return rtv;
}

exports.emptyObj=function(){
    return {token:"",remain:0};
}

exports.returnMem=function(){
    return ma_list;
}
exports.killById=function(iv_sessid){
    //should only be called by sys mng tool
    delSessionById(iv_sessid);
}
exports.killByUser=function(iv_userid){
    //should only be called by sys mng tool
    delSessionFromUser(iv_userid);
}

/* ============================= */
function pageBegins(iv_userid){

    var lo_chk={token:"",remain:0};
    lo_chk.token = regNewSession(iv_userid);
    lo_chk.remain = mv_timeout;

    return lo_chk;
}

function manAction(iv_token){

    var lo_chk={token:"",remain:0};
    if(chkSessionExist(iv_token)){
        var lv_token=extToNewSession(iv_token);
        delSession(iv_token);

        // lo_chk.token = lv_token;
        lo_chk.token = lv_token;
        lo_chk.remain = mv_timeout;
    }else{
        lo_chk.token = "";
        lo_chk.remain = 0;
    }

    return lo_chk;
}

function autoCheck(iv_token){

    var lo_chk={token:"",remain:0};
    if(chkSessionExist(iv_token)){
        
        lo_chk.token = iv_token;
        lo_chk.remain = mv_timeout-(Date.now()-findSession(iv_token).regtime);
    }else{
        lo_chk.token = "";
        lo_chk.remain = 0;
    }

    return lo_chk;
}

function manLogout(iv_token){

    if(chkSessionExist(iv_token)){
        var lo=findSession(iv_token);
        delSessionFromUser(lo.userid);

        return "";
    }
}

/* ============================= */

function regNewSession(iv_userid){
    
    var lv_token=genSessionToken(iv_userid);
    var lo={
        // id:lv_token,                        //used by lock module
        id:zmSm.smd5(lv_token+"balabala idd"), //used by lock module
        userid:iv_userid,
        regtime:Date.now(),
        regtimeR:new Date().toISOString(),  // R for reading for developer (used in sysset app)
        remainR:0,                          // will be updated in timer
        token:lv_token
    }

    ma_list.push(lo);

    return lv_token;
}
function extToNewSession(iv_token){

    var lo_old=findSession(iv_token);
    var lv_token=genSessionToken(lo_old.userid);

    var lo={
        id:lo_old.id,                       //used by lock module
        userid:lo_old.userid,
        regtime:Date.now(),
        regtimeR:new Date().toISOString(),  // R for reading for developer (used in sysset app)
        remainR:0,                          // will be updated in timer
        token:lv_token
    }

    ma_list.push(lo);

    return lv_token;
}

function chkSessionExist(iv_token){
    var rtv=false;

    for(var i=0;i<ma_list.length;i++){
        //check and only keep valid one
        if(ma_list[i].token == iv_token){
            rtv=true
        }
    }

    return rtv;
}

function findSession(iv_token){
    for(var i=0;i<ma_list.length;i++){
        //check and only keep valid one
        if(ma_list[i].token == iv_token)
            return ma_list[i];
    }
}

function delSession(iv_token){

    var la=new Array();

    for(var i=0;i<ma_list.length;i++){
        //check and only keep valid one
        if(ma_list[i].token != iv_token){
            la.push(ma_list[i]);
        }
    }

    ma_list=la;
}

function delSessionFromUser(iv_userid){

    var la=new Array();

    for(var i=0;i<ma_list.length;i++){
        //check and only keep valid one
        if(ma_list[i].userid != iv_userid){
            la.push(ma_list[i]);
        }
    }

    ma_list=la;
}
function delSessionById(iv_sessid){

    var la=new Array();

    for(var i=0;i<ma_list.length;i++){
        //check and only keep valid one
        if(ma_list[i].id != iv_sessid){
            la.push(ma_list[i]);
        }
    }

    ma_list=la;
}


function genSessionToken(iv_userid){
    var lv= "totokenka-"+Date.now()+iv_userid;
    return zmSm.smd5(lv);
}

function timerCheck(){

    var la=new Array();

    for(var i=0;i<ma_list.length;i++){
        //check and only keep valid ones
        if(Date.now()-ma_list[i].regtime <= mv_timeout){
            ma_list[i].remainR= (mv_timeout- ( Date.now()-ma_list[i].regtime) )/1000;
            la.push(ma_list[i]);
        }
    }

    ma_list=la;

    // console.log("sess timer:");
    // console.log(ma_list);
    
}