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
    if(io.act=="listsession"){
        //other purpose, return without lo_chk
        var la=listSessionByUser(zmUser.curUserid());
        rtv={
            list:la,
            msg:"You have "+la.length+" session(s)"
        }

        return rtv;
    }
    if(io.act=="delownsess"){
        //verify user first
        var lv_userid=zmUser.curUserid();
        if(lv_userid!=io.userid){
            rtv={
                msg:"User ID error. You can only delete your own session."
            }
            return rtv;
        }

        //now del sessions:
        exports.killByUser(lv_userid);
        var la=listSessionByUser(zmUser.curUserid());
        rtv={
            list:la,
            msg:"Your session(s) are deleted."
        }

        return rtv;
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

exports.checkSession=function(io){
    //called at the beginning of module..main
    var lo_sesschk=exports.emptyObj();
    
    //may possible have no .session, or no .session.token
    if(io.session)
        if(io.session.token) 
            lo_sesschk=exports.mact(io.session.token);
            
    return lo_sesschk;
}
exports.getSessionId=function(iv_token){
    //should only be called in server
    //session id should not pass to UI

    var lo_old=findSession(iv_token);

    if(lo_old) return lo_old.id;
    else return '';
}
exports.curUserid=function(iv_token){
    //for unknown cause, using zmUser.curUserid 
    //may lead to wrong result, while 2 or more user is 
    //viewing Notebook, and frontend session is sending
    //nop POST call for checking timeout
    //thus, using frontend session info (token) to determine
    //correct userid
    var la=findSession(iv_token);
    if(la!=null)
        return la.userid;
    else
        return "";
}

exports.checkSessExist=function(iv_sessid){
    var rtv = false;

    for(var i=0;i<ma_list.length;i++){
        if(ma_list[i].id==iv_sessid) rtv=true;
    }

    return rtv;
}

exports.checkUserBySessionId=function(iv_sessid){
    var rtv="";

    for(var i=0;i<ma_list.length;i++)
        if(ma_list[i].id==iv_sessid) rtv=ma_list[i].userid;
    
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

function listSessionByUser(iv_userid){
    var la=new Array();

    for(var i=0;i<ma_list.length;i++)
        if(ma_list[i].userid==iv_userid)
            la.push({
                user:ma_list[i].userid,
                reg_time:ma_list[i].regtimeR,
                remain:ma_list[i].remainR
            });
    
    return la;
    // console.log(la);
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