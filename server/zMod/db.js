
var zmC=require('./cons.js');

var mo_conn_config={
    host     : zmC.DB_HOST,
    user     : zmC.DB_USER,
    password : zmC.DB_PASS,
    database : zmC.DB_SCHE,
    charset : 'utf8mb4'
};

var mo_conn_configm={
    host     : zmC.DB_HOST,
    user     : zmC.DB_USER,
    password : zmC.DB_PASS,
    database : zmC.DB_SCHE,
    charset : 'utf8mb4',
    multipleStatements: true
};

var mv_sqlErr="";

exports.ErrMsg=function(){return mv_sqlErr;}

// exports.init=function(){}
exports.sql=function(iv_sql,cbf){
    var mysql = require('mysql');
    var connection=mysql.createConnection(mo_conn_config);

    connection.connect();
    mv_sqlErr="";
    connection.query(iv_sql, function (error, results, fields) {
        // if (error) throw error;
        if (error) {
            // console.log("zmDb.sql error:");
            // console.log(error);
            mv_sqlErr=error.sqlMessage;
        }
        //console.log('The solution is: ', results[0].solution);
        // console.log(results);
        // console.log(fields);
        cbf(error,results,fields); 
    });
    connection.end();

}


exports.asyncSql=async function(iv_sql){
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
    return new Promise(function(resolve, reject){
        var lv_sql=iv_sql;//SELECT * FROM BK_SHEETS where bookid=1 ';
        exports.sql(lv_sql,function(e,r,f){
            //onsole.log(f);
            if(e){
                // reject(e);
                // return;
                console.log("===asyncSql error");
                console.log(e);
            }
            var rc=0;
            if(e!=null) rc=4;
            resolve({
                r:r,
                f:f,
                e:e,
                rc:rc
            });
        });
    });

}

exports.asyncSqlM=async function(iv_sql){

    var mysql = require('mysql');
    var connection=mysql.createConnection(mo_conn_configm);

    connection.connect();

    return new Promise(function(resolve,reject){
        //console.log("in sqlm:")
        //console.log(iv_sql);
        connection.query(iv_sql, function (e, r, f) {
            if(e){
                //reject(e);
                //return;
                console.log("===asyncSqlM error");
                console.log(e);
            }
            var rc=0;
            if(e!=null) rc=4;
            resolve({
                r:r,
                f:f,
                e:e,
                rc:rc
            });
        });
        connection.end();
    });
}

exports.utConvQuote=function(iv){
    return iv.replace(new RegExp("'","gm"),"''");
}


exports.buildInsert=function(iv_table,io){
	var lv_col="";
	var lv_val="";

    Object.keys(io).forEach((key) => {
		// console.log(this);
        // console.log(obj[key])
		lv_col=lv_col+key+", ";
		lv_val=lv_val+quoteVal(io[key])+", ";
    })

	lv_col=" ( "+lv_col.substring(0,lv_col.length-2)+" ) ";
	lv_val=" ( "+lv_val.substring(0,lv_val.length-2)+" ) ";

	var lv_sql="INSERT INTO "+iv_table+lv_col+" VALUES "+lv_val+" ;";
	return lv_sql;
}

function quoteVal(iv){
	if(typeof(iv)=='string') return "'"+iv+"'";
	else return iv;
}