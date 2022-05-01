var zmC=require('./zMod/cons.js');
// var zmDb=require('./zMod/db.js');
var zmCookie=require('./zMod/cookie.js');
var zmFile=require('./zMod/file.js');
var zmUser=require('./zMod/user.js');
var zmBs=require('./zMod/bs.js');
var zmBk=require('./zMod/bk.js');
var zmSs=require('./zMod/sysset.js');
var zmPfqin=require('./zMod/pbfyqin.js');
var zmSession=require('./zMod/session.js');
var zmDevtest=require('./zMod/devtest.js');
var zmDemosession=require('./zMod/demosession.js');
var zmDemoDataLock=require('./zMod/demodatalock.js');
var zmDLock=require('./zMod/dlock.js');

var mHttp = require('http');
init();

mHttp.createServer(function (req, res){
    /*
    console.log(req.url);
    */

    zmCookie.cache(req,res);

    //verify cookie
    zmBs.verifyCookie();

if(req.method=='GET'){
    // console.log("===GET===")

    if(!zmBs.accessCheckGet(req.url)){
        var lv_noaccessPage=zmBs.genNoAccessPage(req.url);
        res.write(lv_noaccessPage);
        return res.end();
    }

    var lv_jumpPage=zProcessGetUrl(req.url);
    if(lv_jumpPage){
        res.write(lv_jumpPage);
        return res.end();
    }


    var lv_getpath = zmC.PATH_HOME+zmC.PATH_GET+req.url;
    var lv_ext = zExt(req.url);
    var lv_contentType=zContentType(lv_ext.toLocaleLowerCase());

    zmFile.read(lv_getpath,function(err,data){
        res.writeHead(200, {'Content-Type': lv_contentType});

        if(data==null || data==undefined) data=zmC.P404;
        if(err) {
            data=zmC.P404;
            //console.log(err);
        }

        res.write(data);
        return res.end();
    }); 

}else if(req.method=='POST'){    
    var post = '';  

    req.on('data', function(chunk){    
        post += chunk;
    });
    req.on('end', async function(){   
        var p=await zProcessPost(post)
        res.end(p);
    });
}

}).listen(zmC.LISTEN_PORT);

console.log('ready...on port:');
console.log(zmC.LISTEN_PORT);

/***********************/
function zProcessGetUrl(iv_url){
    var rtv;

    //check if this is an app url (e.g.: /bk )
    var lv_app=zCheckAppUrl(iv_url);

    if(lv_app){
        rtv=zGenJumpPage(lv_app);
    }else{
        rtv=""; //no path change
    }

    if(iv_url=="/")
        rtv=zGenJumpPage("home");

    return rtv;
}
function zCheckAppUrl(iv_url){
    var rtv="";

    try {
        var la=iv_url.split("/");
        if(la.length==2 && la[1]!=""){
            rtv=la[1];
        }
    } catch (error) {
        console.log("zProcessGetUrl err:");
        console.log(e);
    }

    return rtv;
}
function zGenJumpPage(iv_app){
    var lv_url="/"+iv_app+"/"+iv_app+".html";
    //... return a html page:
    var rtv="<script>window.location.replace(\""+lv_url+"\")</script>";
    return rtv;
}
function zContentType(iv_ext){
    var rtv="";
    if(iv_ext==".html") rtv= "text/html";
    if(iv_ext==".htm") rtv= "text/html";
    if(iv_ext==".js") rtv= "application/x-javascript";
    if(iv_ext==".map") rtv= "application/x-javascript"; //bootstrap
    if(iv_ext==".css") rtv= "text/css";
    if(iv_ext==".txt") rtv= "text/plain";
    if(iv_ext==".gif") rtv= "image/gif";
    if(iv_ext==".jpg") rtv= "image/jpeg";

    return rtv;
}
function zExt(iv_url){
    var path=require('path');
    return path.extname(iv_url);
}
/***********************/
async function init(){
    await zmC.init2();
    zmUser.init();
    zmSession.init();
    zmBs.accessInit();
}

async function zProcessPost(iv){
    var io=JSON.parse(decodeURIComponent(iv));
    //console.log(io);
    var rtv;

    if(zmBs.accessCheckPost(io.app)){

        /*======test=======*/
        if(io.app=='test'){
            console.log("test POST incoming:")
            console.log(io)
            rtv={
                data:io,
                msg:"received! "+JSON.stringify(io)
            }
        }
        /*======app=======*/
        if(io.app=='bk'){
            rtv=await zmBk.main(io);
        }
        if(io.app=='home'){
            rtv=await zmBs.main(io);
        }
        if(io.app=='sysset'){
            rtv=zmSs.main(io);
        }
        if(io.app=='pbfyqin'){
            rtv=await zmPfqin.main(io);
        }
        if(io.app=='session'){
            rtv=zmSession.main(io);
        }
        if(io.app=='demosession'){
            rtv=zmDemosession.main(io);
        }
        if(io.app=='demodatalock'){
            rtv=zmDemoDataLock.main(io);
        }
        if(io.app=='devtest'){
            rtv=zmDevtest.main(io);
        }
        /*----------------*/

    }else{
        rtv={
            msg:zmBs.genNoAccessMsg(io.app)
        }  
    }
    return JSON.stringify(rtv);
}

function mainTimer(){
    zmSession.timer();
    zmDLock.timer();

    setTimeout(mainTimer, 1000);
}

setTimeout(mainTimer, 1000);

