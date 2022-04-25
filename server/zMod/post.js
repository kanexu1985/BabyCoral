
exports.post=async function(iv_url,iv_data){
    /** how to use:

    var x = await zmPost.post();
    console.log(x.d);

     */
    return new Promise(function(resolve, reject){
        httpCall(iv_url,iv_data,function(d,r,e){
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
                d:d,
                r:r,
                e:e,
                rc:rc
            });
        });
    });
}


function httpCall(iv_url,iv_data,cbf){
    const axios = require('axios')

    axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    axios
      .post(iv_url,iv_data)
      .then(res => {
        // console.log(res.statusCode);
        // console.log(res);
        cbf(res.data,res,null);
      })
      .catch(error => {
        cbf(null,null,error);
      })
}