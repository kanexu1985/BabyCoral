const cons = require('./cons.js');
var zmC = require('./cons.js');
var zmUser=require('./user.js');

exports.main=async function(io){
    var lv_msg;
    var rtv;

    var lv_userid=zmUser.curUserid();

    // //restric user
    // if(lv_userid != "XXX" && lv_userid != "YYY"){
    //     rtv={
    //         msg:"invalid user"
    //     };
    //     return rtv;
    // }
    
    // console.log(io);

    if(io.act=='ls'){
        lv_msg=await shell_ls();
        rtv={
            msg:lv_msg
        };
    }
    if(io.act=='new'){
        lv_msg=await shell_new(io.data.new);
        rtv={
            msg:lv_msg
        };
    }
    if(io.act=='chg'){
        lv_msg=await shell_chg(io.data.old,io.data.new);
        rtv={
            msg:lv_msg
        };
    }
    if(io.act=='del'){
        lv_msg=await shell_del(io.data.old);
        rtv={
            msg:lv_msg
        };
    }

    return rtv;
}

/***********************/
async function call_shell(iv,ia){
    var rtv;
    const c_shell=iv;
    const spawn = require('await-spawn');
    try {
        // const bl = await spawn('ls', ['-al']);
        const bl = await spawn(c_shell,ia );
        rtv = bl.toString();
        // console.log(bl.toString())
    } catch (e) {
        console.log(e);
        // console.log(e.stderr.toString())
        rtv =e.stderr.toString(); 
    }
    return rtv;
}
async function shell_new(iv){
    return await call_shell(zmC.TVSWN_SHELL_NEW,[zmC.PATH_HOME+zmC.PATH_TVSWN,iv]);
}
async function shell_chg(iv_old,iv_new){
    return await call_shell(zmC.TVSWN_SHELL_CHG,[zmC.PATH_HOME+zmC.PATH_TVSWN,iv_old,iv_new]);
}
async function shell_del(iv_old){
    return await call_shell(zmC.TVSWN_SHELL_DEL,[zmC.PATH_HOME+zmC.PATH_TVSWN,iv_old]);
}
async function shell_ls(){
    return await call_shell(zmC.TVSWN_SHELL_LS,[zmC.PATH_HOME+zmC.PATH_TVSWN]);
}
