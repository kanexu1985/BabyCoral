const cons = require('./cons.js');
var zmUt = require('./ut.js');
// var zmLock=require('./lock.js');
var zmSession=require('./session.js');
var zmUser=require('./user.js');

exports.main=function(io){
    var lo_sesschk;
    var rtv;

    if(io.act=='save' || io.act=='get'){
        var lv_msg='act received: '+io.act;
        
        //... save something ...
        
        console.log(io);

        //check session timeout
        if(io.session.token) lo_sesschk=zmSession.mact(io.session.token);

        // if(lo_sesschk.timeout) lv_msg="error, session timeout";
        if(lo_sesschk.sessrem==0) lv_msg="error, session timeout";

        rtv={
            // sesstok:lo_sesschk.sesstok,
            // // timeout:lo_sesschk.timeout,
            // sessrem:lo_sesschk.sessrem,
            session:lo_sesschk,
            msg:lv_msg
        };

    }
    if(io.act=='test'){
        console.log("devtest test:");
        // if(zmSession.curUserid(lo_sesschk.token)!=zmUser.curUserid()){
            // console.log("you got me!!!");
            // console.log(zmSession.curUserid(lo_sesschk.token));
            console.log(zmUser.curUserid());
        // }
    }
    return rtv;
}

exports.test_timer=function(){
}

/***********************/
/*---------------------------------------------*/