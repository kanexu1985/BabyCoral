// var zmC = require('./cons.js');
var zmDLock=require('./dlock.js');
var zmSession=require('./session.js');

var mv_demodata=""; //just string

exports.main=function(io){
    // var lo_sesschk={token:"",remain:0};
    var lo_sesschk=zmSession.emptyObj();
    var lo_dlockchk=zmDLock.emptyObj();
    var lv_data=null; //demo data saved in mem, will send back to ui
    var lv_msg='act received: '+io.act;
    var rtv;

    //check session timeout
    lo_sesschk=checkSession(io);
    if(lo_sesschk.remain==0) lv_msg="error, session timeout";

    // if(io.act=='test'){

    //     lv_msg='data lock hello test';
    // }
    if(io.act=='init'){
        //init session
        lo_sesschk=zmSession.pbeg();

        //continue to send data to ui by processing the next if block
        io.act='get';
    }
    if(io.act=='get'){
        lv_data=mv_demodata;// just like get data from db
        lv_msg='data loaded';
    }
    if(io.act=='edit'){
        // lo_dlockchk=zmDLock.tryEdit(io.dataid,io.session.token);
        lo_dlockchk=zmDLock.tryEdit(io.dataid,lo_sesschk.token);
        lv_msg = lo_dlockchk.msg;
        lv_data=mv_demodata;// just like get data from db
    }
    if(io.act=='disp'){
        zmDLock.unlock(io.dataid);
        lv_data=mv_demodata;// just like get data from db
    }
    if(io.act=='save'){

        if(lo_sesschk.remain>0){
            mv_demodata=io.data;
            lv_msg='data saved';
            lv_data=mv_demodata;// just like get data from db
    }

    }

    rtv={
        session:lo_sesschk,
        dlock:lo_dlockchk,
        data:lv_data,
        msg:lv_msg
    };

    return rtv;
}

function checkSession(io){
    var lo_sesschk=zmSession.emptyObj();
    
    //may possible have no .session, or no .session.token
    if(io.session)
        if(io.session.token) 
            lo_sesschk=zmSession.mact(io.session.token);
            
    return lo_sesschk;
}

/*---------------------------------------------*/