var zmC=require('./cons.js');

var m_req,m_res;

exports.cache=function(req,res){
    m_req=req;
    m_res=res;
}

/**** */
exports.get=function(){
    var Cookies = {};
    if(m_req.headers.cookie==undefined || m_req.headers.cookie==null)
        return;

        m_req.headers.cookie && m_req.headers.cookie.split(';').forEach(function( Cookie ) {
        var parts = Cookie.split('=');
        Cookies[ parts[ 0 ].trim() ] = ( parts[ 1 ] || '' ).trim();
    });
    //console.log(Cookies)

    //only return this specific cookie values is enough:
    return Cookies[zmC.COOKIE_ID];
}

exports.set=function(iv){
    m_res.writeHead(200, {
        'Set-Cookie': zmC.COOKIE_ID+'='+iv+'; Max-Age='+zmC.COOKIE_EXP+'; path=/;HttpOnly ',
        'Content-Type': 'text/html'
    });
}
exports.setNonHttpOnly=function(iv){//DO NOT USE
    m_res.writeHead(200, {
        'Set-Cookie': zmC.COOKIE_ID+'='+iv+'; Max-Age='+zmC.COOKIE_EXP+'; path=/',
        'Content-Type': 'text/html'
    });
}

