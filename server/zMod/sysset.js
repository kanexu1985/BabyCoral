/** basic framework */

const cons = require('./cons.js');
var zmBs=require('./bs.js');
var zmUser=require('./user.js');
var zmBk=require('./bk.js');
var zmSession=require('./session.js');
var zmDLock=require('./dlock.js');
var zmPfqin=require('./pbfyqin.js');

var m_gUserid;

exports.main=function(io){
    var rtv;

    if(io.act=="reloadjson"){
        reloadJson();     
           
        rtv={
            msg:"reloadjson done."
        }
    }
    if(io.act=="getmemstat"){

        rtv={
            zmUser:{
                m_db:zmUser.return_m_db()
            },
            zmSession:{
                ma_list:zmSession.returnMem()
            },
            zmDLock:{
                ma_list:zmDLock.returnMem()
            },
            zmBk:{
                ma_OpenBook:zmBk.returnMem("ma_OpenBook"),
                ma_BookList:zmBk.returnMem("ma_BookList")
            }
        }
    }
    if(io.act=="killsessid"){
        killsessById(io.sessidoruser);
        rtv={
            msg:"kill session by id processed."
        }
    }
    if(io.act=="killsessuser"){
        killsessByUser(io.sessidoruser.trim().toUpperCase());
        rtv={
            msg:"kill session by user processed."
        }
    }

    return rtv;
}

function reloadJson(){
    zmUser.readJson();
    zmBs.accessReadJson();
    zmPfqin.readJson();
}

function killsessById(iv_sessid){
    zmSession.killById(iv_sessid);
}
function killsessByUser(iv_userid){
    zmSession.killByUser(iv_userid);
}