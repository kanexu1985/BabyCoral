var zmSession=require('./session.js');

exports.main=function(io){
    var lo_sesschk={token:"",remain:0};
    var rtv;

    if(io.act=='save' || io.act=='get'){
        var lv_msg='act received: '+io.act;
        
        //... save something ...
        
        console.log(io);

        //check session timeout
        if(io.session.token) lo_sesschk=zmSession.mact(io.session.token);

        if(lo_sesschk.remain==0) lv_msg="error, session timeout";

        rtv={
            session:lo_sesschk,
            msg:lv_msg
        };

    }
    return rtv;
}

exports.test_timer=function(){
}

/*---------------------------------------------*/