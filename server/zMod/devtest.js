const cons = require('./cons.js');
var zmUt = require('./ut.js');
// var zmLock=require('./lock.js');
var zmSession=require('./session.js');
var zmUser=require('./user.js');
var zmC=require('./cons.js');

exports.main=async function(io){
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
    if(io.act=='call_shell'){
        var lv_msg = await call_shell();
        rtv={
            msg:lv_msg
        }
    }
    return rtv;
}

exports.test_timer=function(){
}

/***********************/
/*---------------------------------------------*/
async function fexec(){
    
    var rtv;
    const spawn = require('await-spawn');
    try {
        const bl = await spawn('ls', ['-al'])
        rtv = bl.toString();
        // console.log(bl.toString())
    } catch (e) {
        // console.log(e.stderr.toString())
        rtv =e.stderr.toString(); 
    }
    return rtv;
}
async function call_shell(){
    var rtv;
    const c_shell=zmC.DEVTEST_SHELL;
    const spawn = require('await-spawn');
    try {
        // const bl = await spawn('ls', ['-al']);
        const bl = await spawn(c_shell );
        rtv = bl.toString();
        // console.log(bl.toString())
    } catch (e) {
        // console.log(e.stderr.toString())
        rtv =e.stderr.toString(); 
    }
    return rtv;
}
