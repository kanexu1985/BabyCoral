var zmC=require('./cons.js');
var zmFile=require('./file.js');
var zmSm=require('./md5_bbcr.js');

//user db, read from json file into memory
//keep in back end only
var m_db={};

//current logged in user, identified from cookie,
//some data will be sent to front end
var m_o=aGuest();
// {
//     user:"",
//     nick:""
// };//o.user, o.nick...from cookie
exports.getUserNick=function(iv_userid){
    var rtv="Unknown";
    for(var i=0;i<m_db.users.length;i++)
        if(m_db.users[i].userid==iv_userid){
            rtv=m_db.users[i].nicknm;
            break;
        }
    
    return rtv;
}
exports.return_m_db=function(){
    return m_db;
}

exports.init=function(){
    exports.readJson();
}
exports.readJson=function(){
    zmFile.read(zmC.PATH_HOME+"/settings/user_users.json",function(e,d){
        if(e){
            console.log("user init file read error:");
            console.log(e);
        }else{
            console.log("zmUser json read ok");
            m_db=JSON.parse(d);
            console.log(m_db);
        }
    });
}

exports.setUser=function(iv_userid,iv_nicknm){
    //only used in dev
    m_o.userid=iv_userid;
    m_o.nicknm=iv_nicknm;
}
exports.curUserid=function(){
    return m_o.userid;
}
exports.curNicknm=function(){
    return m_o.nicknm;
}
exports.curGroup=function(){

    var la=m_db.users;
    var rta;

    for(var i=0;i<la.length;i++){
        if(la[i].userid==m_o.userid){
            rta=la[i].group;
        }
    }

    return rta;
}

exports.logOut=function(){
    m_o=aGuest();
}

exports.setByCookie=function(iv_userid){

    var lo_who={};
    var la=m_db.users;

    for(var i=0;i<la.length;i++){
        if(la[i].userid==iv_userid){
            lo_who.userid=la[i].userid;
            lo_who.nicknm=la[i].nicknm;
        }
    }

    m_o=lo_who;
}

exports.setByPasscode=function(iv_pc){
    //select ....
    var rtv=false;
    var lo_who=aGuest();
    var la=m_db.users;

    for(var i=0;i<la.length;i++){
        if(la[i].pc==iv_pc){
            lo_who.userid=la[i].userid;
            lo_who.nicknm=la[i].nicknm;
            rtv=true;
        }
    }

    m_o=lo_who;
    return rtv;
}

exports.setByUserPwd=function(iv_userid,iv_pwd){
    var rtv=false;
    var lo_who=aGuest();
    var la=m_db.users;

    for(var i=0;i<la.length;i++){
        if(la[i].userid==iv_userid && la[i].pwd==iv_pwd){
            lo_who.userid=la[i].userid;
            lo_who.nicknm=la[i].nicknm;
            rtv=true;
        }
    }

    m_o=lo_who;
    return rtv;

}

exports.genCookie=function(){

    var lv_sig=zmSm.smd5in(JSON.stringify(m_o));
    var lo_ck={
        data:m_o,
        sig:lv_sig
    }

    return(encodeURIComponent(JSON.stringify(lo_ck)));

}

function aGuest(){
    return {
        userid:"GUEST",
        nicknm:"Guest"
    }
}