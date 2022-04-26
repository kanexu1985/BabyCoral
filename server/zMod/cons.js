var zmFile=require('./file.js');

module.exports={

    P404:'<html><head><meta charset="utf-8"></head><body><center>oh~no~~404~~~<br> ╮(╯▽╰)╭</center></body></html>',

    LISTEN_ADDRESS:'127.0.0.1',
    LISTEN_PORT:80,
    
    PATH_HOME:__dirname+"/..",
    PATH_GET:'/ui',
    
    PATH_FILE:'/file',

    init2:async function(){
        //add more sys-specific attributes from file/sys_cfg.json:
        
        var d = await zmFile.asyncRead(__dirname+"/../settings/sys_cfg.json");

        console.log("zmC sys_cfg json read ok");
        var lo =JSON.parse(d);

        for(let key in lo){
            module.exports[key]=lo[key];
        }

        //another cfg file not published on github
        try {
            var d2= await zmFile.asyncRead(__dirname+"/../settings/sys_cfg2.json"); 
            console.log("zmC sys_cfg2 json read ok");
            var lo2=JSON.parse(d2);
            for(let key2 in lo2){
                module.exports[key2]=lo2[key2];
            }
        } catch (error) {
            console.log("sys_cfg2 read err");
        }
       
        console.log("zmC values:");
        console.log(module.exports);

        //now freeze obj
        Object.freeze(module.exports);
    },
    
    _end:''
}
