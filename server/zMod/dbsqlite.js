
var zmC=require('./cons.js');


// exports.test0=function(){
//     var sqlite3 = require('sqlite3').verbose();
//     var db = new sqlite3.Database(':memory:');
    
//     console.log("sq3 start");

//     db.serialize(function() {
//       db.run("CREATE TABLE lorem (info TEXT)");
    
//       var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
//       for (var i = 0; i < 10; i++) {
//           stmt.run("Ipsum " + i);
//       }
//       stmt.finalize();
    
//       db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
//           console.log(row.id + ": " + row.info);
//       });
//     });
    
//     db.close();

//     console.log("sq3 done");

// }

exports.asyncSql=async function(iv_sql){

    var rto;

    var sqlite3 = require('sqlite3').verbose();
    // var db = new sqlite3.Database(zmC.PATH_HOME+zmC.PATH_SQLITEDB);
    var db = new sqlite3.Database(zmC.PATH_HOME+zmC.PATH_SQLITEDB);
    
    var lv_sql=iv_sql;//'select * from bk_main';

    return new Promise(function(resolve,reject){

        db.serialize(function(){
            db.all(lv_sql,function (err,rows) {
                if (err) {
                    return console.log('db.serialize error: ', err.message)
                }
                var rc=0;
                if(err!=null) rc=4;
                resolve({
                    r:rows,
                    // f:f,
                    e:err,
                    rc:rc
                });
            })
        });
    });//end of promise func

    db.close();
    console.log("ret");
    return rto;

}

exports.asyncSqlM=async function(iv_sql){

    var rto;

    var sqlite3 = require('sqlite3').verbose();
    // var db = new sqlite3.Database(zmC.PATH_HOME+zmC.PATH_SQLITEDB);
    var db = new sqlite3.Database(zmC.PATH_HOME+zmC.PATH_SQLITEDB);
    
    var lv_sql=iv_sql;//'select * from bk_main';

    return new Promise(function(resolve,reject){

        db.serialize(function(){
            db.exec(lv_sql,function (err,rows) {
                if (err) {
                    return console.log('db.serialize error: ', err.message)
                }
                var rc=0;
                if(err!=null) rc=4;
                resolve({
                    r:rows,
                    // f:f,
                    e:err,
                    rc:rc
                });
            })
        });
    });//end of promise func

    db.close();
    console.log("ret");
    return rto;

}

// exports.ErrMsg=function(){return mv_sqlErr;}


// exports.asyncSql=async function(iv_sql){
    /** how to use:

async function zTestB(){
    var x = await zmDb.asyncSelect("SELECT * FROM BK_SHEETS where bookid=1");
    console.log(x.r);
    console.log(x.f);

    if reject(e); is used, then:
    var x = await zmDb.asyncSelect("SELECT * FROM BK_SHEETS where bookid=1")
    .catch(function(e){
        console.log(e);
    });

}

     */

exports.utConvQuote=function(iv){
    return iv.replace(new RegExp("'","gm"),"''");
}


// exports.buildInsert=function(iv_table,io){
// 	var lv_col="";
// 	var lv_val="";

//     Object.keys(io).forEach((key) => {
// 		// console.log(this);
//         // console.log(obj[key])
// 		lv_col=lv_col+key+", ";
// 		lv_val=lv_val+quoteVal(io[key])+", ";
//     })

// 	lv_col=" ( "+lv_col.substring(0,lv_col.length-2)+" ) ";
// 	lv_val=" ( "+lv_val.substring(0,lv_val.length-2)+" ) ";

// 	var lv_sql="INSERT INTO "+iv_table+lv_col+" VALUES "+lv_val+" ;";
// 	return lv_sql;
// }

