
var zmC=require('./cons.js');


var fs = require('fs');

exports.test=function(){
    zTestSaveFile();
}

exports.read=function(iv_path,cbf){
    fs.readFile(iv_path,cbf);
}

exports.asyncRead=async function(iv_patch){
    var d = await zReadFile(iv_patch);
    // console.log("zmFile asyncRead");
    // console.log(d);
    return d;
}
/***********************/
async function zReadFile(iv_patch){

    return new Promise(function(resolve,reject){
        fs.readFile(iv_patch,function(err,data){
            if(err) reject(err);
            resolve(data);
        });
    });

}
/***********************/

function zTestSaveFile(){
    const fs = require('fs');

    // create a JSON object
    const user = {
        "id": 1,
        "name": "John Doe",
        "age": 22
    };
    var lo=user;

    // convert JSON object to string
    const data = JSON.stringify(lo,null,"\t");

    // write JSON string to a file
    fs.writeFile(zmC.PATH_HOME+zmC.PATH_FILE+'/user.json', data, (err) => {
        if (err) {
            throw err;
        }
        console.log("JSON data is saved.");
    });
}

