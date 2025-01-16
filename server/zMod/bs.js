/** basic framework */
const cons = require('./cons.js');
var zmC=require('./cons.js');
var zmCookie=require('./cookie.js');
var zmFile=require('./file.js');
var zmSm=require('./md5_bbcr.js');
var zmUser=require('./user.js');

exports.main=async function(io){
    var rtv;

    if(io.act=="cktest"){      
        zmCookie.setNonHttpOnly(io.data);        
        rtv={
            msg:"cookie set"
        }
    }
    if(io.act=="login_lout"){   
        
        zmCookie.set("");
        zmUser.logOut();

        rtv={
            msg:"Bye!"
        }
    }
    if(io.act=="login_showcur"){     
        rtv={
            userid:zmUser.curUserid(),
            nicknm:zmUser.curNicknm(),
            msg:"Hi "+zmUser.curNicknm()+", your ID is: "+zmUser.curUserid()
        }
    }
    if(io.act=="asksmd5"){
        rtv={
            msg:zmSm.smd5(io.data.value)
        }
    }
    if(io.act=="login_linpc"){
        var lv_msg="Invalid passcode.";//default fail msg
        if(zmUser.setByPasscode(io.data.pc)){
            lv_msg="Welcome back, "+zmUser.curNicknm()+"!";
        }
        
        //register cookie, will save guest if login fail
        zmCookie.set(zmUser.genCookie());

        rtv={
            msg:lv_msg
        }

    }
    if(io.act=="login_userpwd"){

        var lv_msg="Invalid user/password.";//default fail msg
        if(zmUser.setByUserPwd(io.data.userid.trim().toUpperCase(),io.data.pwd)){
            lv_msg="Welcome back, "+zmUser.curNicknm()+"!";
        }
        
        //register cookie, will save guest if login fail
        zmCookie.set(zmUser.genCookie());

        rtv={
            msg:lv_msg
        }

    }
    if(io.act=="getmenu"){
        rtv={
            msg:"menu generated",
            data:genMenu()// genMenu() is access module
        }
    }

    return rtv;
}

exports.verifyCookie=function(){
    var rtv=false;
    var lo;

    var lv_raw=zmCookie.get();
    var lv=decodeURIComponent(lv_raw);

    if(lv=="" || lv_raw==undefined){
        console.log("verifyCookie cookie is empty, user as guest:");
        zmUser.logOut();
        return rtv;
    }

    try {
        
        lo=JSON.parse(lv);

        var lv_check=zmSm.smd5in(JSON.stringify(lo.data));

        if(lv_check==lo.sig) rtv=true;

    } catch (error) {
        console.log("verifyCookie err:");
        console.log(error);
    }
    //set to user module:
    if(rtv)
        //verify before set
        if(zmUser.verifyUser(lo.data.userid)){
            zmUser.setByCookie(lo.data.userid);
        }else{
            console.log("verifyCookie user not valid, logging out");
            console.log(lo.data.userid);
            zmUser.logOut();
        }
    else
        zmUser.logOut();

    return rtv;
}

/*... access check module (maybe another .js file?)....*/
var m_db_app={};
exports.accessInit=function(){
    exports.accessReadJson();
}
exports.accessReadJson=function(){
    zmFile.read(zmC.PATH_HOME+"/settings/bs_app.json",function(e,d){
        if(e){
            console.log("app init file read error:");
            console.log(e);
        }else{
            console.log("app json read ok");
            m_db_app=JSON.parse(d);
            console.log(m_db_app);
        }
    });
}

exports.accessCheckGet=function(iv_url){

    if(iv_url=="/favicon.ico") return true; //icon path, always provide access,
    if(iv_url=="/") return true;            //home path, always provide access,
    if(iv_url=="/test") return true;        //test app, always provide access,
    //will convert to /home in later code( zProcessGetUrl() )

    //get app in url:
    var lv_app="";
    try {
        var la=iv_url.split("/");
        //console.log(la);
        if(la.length>=2 && la[1]!="")
            lv_app=la[1];
    } catch (error) {
        console.log("accessCheckGet err:");
        console.log(e);
    }

    if(lv_app==""){
        console.log("accessCheckGet err, failed to get app from url");
        return false;
    }

    //get app access array:
    var la_access;
    try {
        la_access=m_db_app.apps.find(o => o.app==lv_app).access;
    } catch (error) {
        console.log("accessCheckGet err, app not find in json");
        console.log("--iv_url");
        console.log(iv_url);

        return false;
    }

    //get current user group:
    var la_group=zmUser.curGroup();

    //check access vs. group:
    var rtv=false;
    for(var i=0;i<la_access.length;i++)
        for(var j=0;j<la_group.length;j++)
            if(la_access[i]==la_group[j])
                rtv=true;

    return rtv;
}

exports.genNoAccessPage=function(iv_url){
    var lv_userid=zmUser.curNicknm();
    var rtv="<html><body>"
    rtv=rtv+"Hey "+lv_userid+", you can't visit here("+iv_url+")."
    rtv=rtv+'<br> <a href="../">go back</a>';
    rtv=rtv+"</body></html>";
    return rtv;
}

exports.accessCheckPost=function(iv_app,iv_act){
    //to do...
    //logic to be write in future
    //now, just use accessCheckGet() instead...

    return exports.accessCheckGet("/"+iv_app);
}

exports.genNoAccessMsg=function(iv_app){
    var lv_userid=zmUser.curNicknm();
    return "Hey "+lv_userid+", you can't do this.";
}

function genMenu(){
    var rta=new Array();
    
    //get app list:
    var la_app=m_db_app.apps;

    for(var i=0;i<la_app.length;i++)
        // if(la_app[i].descp)//only loop at descp exists
        if(la_app[i].descp || la_app[i].link)//only loop at descp/link exists
        if(exports.accessCheckGet("/"+la_app[i].app))//use func. to check accessible app
            
            rta.push({
                app:la_app[i].app,
                link:la_app[i].link,
                descp:la_app[i].descp
            });

    
    return rta;

}