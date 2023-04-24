/** basic framework */

const cons = require('./cons.js');
var zmBs=require('./bs.js');
var zmUser=require('./user.js');
var zmBk=require('./bk.js');
var zmSession=require('./session.js');
var zmDLock=require('./dlock.js');
var zmPfqin=require('./pbfyqin.js');
var zmDbL=require('./dbsqlite.js');

var m_gUserid;

exports.main=async function(io){
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
    //db maint:
    if(io.act=="dbm_chkver"){
        var lo=await chkver();
        var l=JSON.stringify(lo,null,'&nbsp;');
        l=l.replace(/\n/g,"<br>");
        rtv={msg:l};
    }
    if(io.act=="dbm_prep_upg"){
        var lo=prep_upg(io.upkey);
        var l=JSON.stringify(lo,null,'&nbsp;');
        l=l.replace(/\n/g,"<br>");
        rtv={msg:l};
    }
    if(io.act=="dbm_exec_upg"){
        var lo= await exec_upg(io.upkey);
        var l=JSON.stringify(lo,null,'&nbsp;');
        l=l.replace(/\n/g,"<br>");
        rtv={msg:l};
    }

    console.log(rtv);
    return rtv;
}

async function chkver(){

    var lv_sql="select name from sqlite_master where type ='table' and name='SYS_INFO'"

    var x = await zmDbL.asyncSql(lv_sql);
    if(x.r.length==0){
        return {m:'not found, current version is 0'}
    }else{
        lv_sql="select * from SYS_INFO where fld = 'DB_VER' order by rev desc;"
        var y = await zmDbL.asyncSql(lv_sql);
        return y.r;
    }


}

const ma_db_upg_sql = { 
    _0to1:[
        /*
        upgrade note, from 0 to 1
        added SYS_INFO table to store additional sys info like db version
        insert db version 1 record
        add jset (user JSON Settings) for BK module
        */
        //create SYS_INFO table
        "CREATE TABLE SYS_INFO ( FLD VARCHAR (10), VAL VARCHAR (10), REV VARCHAR (10), VAL_FROM VARCHAR (8) );...",
        //insert 1st rec
        "insert into sys_info (fld, val, rev, val_from) values ('DB_VER','1','1','20230409');",

        //add jset column in BK_USET_BK:
        " PRAGMA foreign_keys = 0; ",

        " CREATE TABLE sqlitestudio_temp_table AS SELECT * \
                                                  FROM BK_USET_BK;",
        
        " DROP TABLE BK_USET_BK; ",
        
        " CREATE TABLE BK_USET_BK ( \
            userid   VARCHAR (20) NOT NULL, \
            bookid   INTEGER      NOT NULL, \
            openpage INTEGER, \
            openedit BOOLEAN, \
            pos_col  INTEGER, \
            pos_row  INTEGER, \
            jset     STRING, \
            PRIMARY KEY ( \
                userid, \
                bookid \
            ) \
        );",
        
        " INSERT INTO BK_USET_BK ( \
                                   userid, \
                                   bookid, \
                                   openpage, \
                                   openedit, \
                                   pos_col, \
                                   pos_row \
                               ) \
                               SELECT userid, \
                                      bookid, \
                                      openpage, \
                                      openedit, \
                                      pos_col, \
                                      pos_row \
                                 FROM sqlitestudio_temp_table; ",
        
        " DROP TABLE sqlitestudio_temp_table; ",
        
        " PRAGMA foreign_keys = 1; "
        
    ],
    //and more to come...
    _xtoy:['...','.....']
};

function prep_upg(iv){
    return ma_db_upg_sql[iv]; //'_0to1',....
}

async function exec_upg(iv){
    var la=ma_db_upg_sql[iv];
    var rtv=new Array();

    for(i=0;i<la.length;i++){
        var x=await zmDbL.asyncSql(la[i]);
        // console.log(i);
        // console.log(x);
        rtv.push(i);
        rtv.push(x);
    }

    return rtv;
}