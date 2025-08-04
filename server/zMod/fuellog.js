const cons = require('./cons.js');
var zmC = require('./cons.js');
var zmUser=require('./user.js');
var zmFile=require('./file.js');

exports.main=async function(io){
    var lv_msg;
    var rtv;

    var lv_userid=zmUser.curUserid();

    
    // console.log(io);

    if(io.act=='init'){
        lv_msg="";
        rtv={
            msg:lv_msg,
            data:await loadInitCfg()
        }
    }
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
    if(io.act=='del'){
        lv_msg=await shell_del(io.data.del);
        rtv={
            msg:lv_msg
        };
    }
    return rtv;
}

/***********************/
async function loadInitCfg() {
    var d = await zmFile.asyncRead(zmC.PATH_HOME+zmC.PATH_FUELLOG+"/default.json");

    console.log("zmFuellog default json read ok");
    var lo =JSON.parse(d);

    return lo;
}
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
    return await call_shell(zmC.FUELLOG_SHELL_NEW,[zmC.PATH_HOME+zmC.PATH_FUELLOG,iv]);
}
async function shell_ls(){
    return await call_shell(zmC.FUELLOG_SHELL_LS,[zmC.PATH_HOME+zmC.PATH_FUELLOG]);
}
async function shell_del(iv_del){
    return await call_shell(zmC.FUELLOG_SHELL_DEL,[zmC.PATH_HOME+zmC.PATH_FUELLOG,iv_del]);
}