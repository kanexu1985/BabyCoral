/** book */
var zmDbL=require('./dbsqlite.js');
var zmC=require('./cons.js');
var zmUser=require('./user.js');

var ma_OpenBook=new Array();    //default book to open when user logs BK app
                                //userid/bookid mapping data is stored here
var ma_BookList=new Array();    //buffer of current book data in db

exports.returnMem=function(iv){
    if(iv=="ma_OpenBook") return ma_OpenBook;
    if(iv=="ma_BookList") return ma_BookList;
}

exports.main=async function(io){
    var rtv;

    if(io.act=='get'){
        var lv_bookid=io.bookid;
        var lv_pass=await checkPermission(io.bookid,"R");
        var lv_msg="";

        if(lv_pass){

            setOpenBook(lv_bookid); //set the book to open next time user use book app
            ma_BookList =  await getBookList();
            var lo_book=getBookMa(lv_bookid);
            var x = await zmDbL.asyncSql("SELECT * FROM BK_SHEETS where bookid='"+lv_bookid+"' ");

            if(x.rc!=0) lv_msg=lv_msg+"get sheet error";
            
            if(lv_msg=="") lv_msg="here's your book..."
           
            rtv={
                msg:lv_msg,
                pass:lv_pass,
                book:{
                    title:lo_book.title,
                    bookid:lv_bookid,
                    openpage:lo_book.openpage,
                    sheets:x.r
                }
            }

        }else{

            lv_msg="You cannot open this book";
            rtv={
                pass:lv_pass,
                msg:lv_msg
            };

        }
        

    }
    if(io.act=='getdraft'){
        var lv_userid=zmUser.curUserid();
        var lv_bookid=io.bookid;
        var lv_page=io.page;
        var x = await zmDbL.asyncSql("SELECT * FROM BK_DRAFT where userid='"+lv_userid+"' and bookid="+lv_bookid+" and page="+lv_page+" ");
        var lv_msg="";

        //rtn error msg:
        if(x.rc!=0) lv_msg=lv_msg+"get draft error, maybe no draft?";
        if(lv_msg=="") lv_msg="draft loaded, remember to save!"
       
        if(x.r.length==0){
            rtv={
                msg:"no draft on this page"
            }
        }else{
            rtv={
                msg:lv_msg,
                book:{
                    sidea:x.r[0].sidea,
                    sideb:x.r[0].sideb
                }
            }
        
        };
    }
    if(io.act=='getinit'){
        var lv_msg="";

        ma_BookList = await getBookList();
        var lv_userid=zmUser.curUserid();
        var lv_bookid=getOpenBook(lv_userid);
        var lo_book;
        var la_sheets;
        lo_book=getBookMa(lv_bookid);
        if(ma_BookList.length==0 && lo_book==undefined){
            //build an empty book if failed to get
            //todo: use func. to return empty book, instead of code below
            lo_book={
                title:"n/a",
                openpage:1,
                sheets:[{
                    page:1,
                    title:"n/a",
                    sidea:"n/a",
                    sideb:"n/a"
                }]
            };
            lv_msg="You don't have any book yet, please goto Mng page to create one.";
        }else{
            //continue to get sheets:
            var x = await zmDbL.asyncSql("SELECT * FROM BK_SHEETS where bookid='"+lv_bookid+"' ");
            if(x.rc!=0) lv_msg=lv_msg+"get sheet error";
            if(lv_msg=="") lv_msg="here's your book..."
            lo_book.sheets=x.r;
        }
       
        rtv={
            msg:lv_msg,
            book:lo_book,
            booklist:{
                list:ma_BookList
            }
        };

    }
    if(io.act=='mng_move'){
        ma_BookList = await getBookList();
        var lv_msg=await moveBook(io.bookid,io.to);//"moving... "+io.to;
        var la_booklist = await getBookList();
        if(la_booklist.length<1) lv_msg="You don't have book yet...";
        rtv={
            msg:lv_msg,
            booklist:{
                list:la_booklist
            }
        };
    }
    if(io.act=='getbooklist'){
        var la_booklist = await getBookList();
        var lv_msg="Here're your books...";
        if(la_booklist.length<1) lv_msg="You don't have book yet...";
        rtv={
            msg:lv_msg,
            booklist:{
                list:la_booklist
            }
        };
    }
    if(io.act=='mng_getbooklist'){
        // await checkUSet();
        ma_BookList = await getBookList();
        var la_booklist = ma_BookList;//await getBookList();
        var lv_msg="Here're your books...";
        if(la_booklist.length<1) lv_msg="You don't have book yet...";
        rtv={
            msg:lv_msg,
            booklist:{
                list:la_booklist
            }
        };
    }
    if(io.act=='mng_setopen'){
        var lv_msg="opening book...";
        var lv_pass=await checkPermission(io.bookid,"R");
        if(lv_pass)
            setOpenBook(io.bookid);
        else
            lv_msg="You cannot open this book";
        rtv={
            pass:lv_pass,
            msg:lv_msg
        };
        
    }
    if(io.act=='mng_newbook'){
        var lv_msg=await newBook(io.data.title);
        var la_booklist = await getBookList();
        rtv={
            msg:lv_msg,
            booklist:{
                list:la_booklist
            }
        };
    }
    if(io.act=='mng_rename'){
        var lv_msg=await renameBook(io.data.bookid,io.data.title);
        var la_booklist = await getBookList();
        rtv={
            msg:lv_msg,
            booklist:{
                list:la_booklist
            }
        };
    }
    if(io.act=='mng_getsharelist'){
        var lv_msg="";
        var lo_list=await getShareList(io.bookid);

        rtv={
            msg:lv_msg,
            list:lo_list
        };
    }
    if(io.act=='mng_updatesharelist'){
        var lv_msg;
        var lv_permission=await checkPermission(io.bookid,"O");

        if(!lv_permission) 
            lv_msg="You don't have such permission."
        else
            lv_msg= await updateShareList(io.bookid,io.list);
        
        rtv={
            msg:lv_msg
        };
    }
    if(io.act=='save'){
        var lv_pass=await checkPermission(io.data.bookid,"W");
        if(lv_pass){

            var lv_bookid=io.data.bookid;
            var lv_sql=buildSqlSave(io.data);
            //console.log(lv_sql);
    
            if(lv_sql!=""){
                var x = await zmDbL.asyncSqlM(lv_sql);
                var y = await zmDbL.asyncSql("SELECT * FROM BK_MAIN where bookid='"+lv_bookid+"' ");
                var z = await zmDbL.asyncSql("SELECT * FROM BK_USET_BK where bookid='"+lv_bookid+"' and userid='"+zmUser.curUserid()+"' ")
                var lv_title = y.r[0].title;
                var lv_openpage = io.data.openpage;
                //if error, will dump here, so if ok, send new book to ui:
                var lo_ns=await zmDbL.asyncSql("SELECT * FROM BK_SHEETS where bookid='"+lv_bookid+"' ");
                var lv_msg="";
    
                //rtn error msg:
                if(x.rc!=0) lv_msg="save error";//:"+x.e;//JSON.stringify(x.e);
                if(lv_msg=="") lv_msg="saved"
                rtv={
                    msg:lv_msg,
                    book:{
                        title:lv_title,
                        bookid:lv_bookid,
                        openpage:lv_openpage,
                        sheets:lo_ns.r
                    }
                };
            }else{
                rtv={
                    msg:'nothing new to save...'
                };
    
            }
    
            await updateUSetPageStat(lv_bookid,io.data.openpage,true);//todo update openedit
    
        }else{

            lv_msg="You cannot save this book";
            rtv={
                pass:lv_pass,
                msg:lv_msg
            };

        }

    }
    if(io.act=='savedraft'){

        var lv_sql=buildSqlSaveDraft(zmUser.curUserid(),io.data);
        // console.log(lv_sql);

        if(lv_sql!=""){
            var x = await zmDbL.asyncSql(lv_sql);
            var lv_msg="";

            //rtn error msg:
            if(x.rc!=0) lv_msg=lv_msg+"draft save error";
            if(lv_msg=="") lv_msg="draft saved"
           
            rtv={
                msg:lv_msg
                };
            
        }
    }
    if(io.act=='test_hiuser'){
        rtv={
            msg:zmUser.curNicknm()
        }
    }

    return rtv;
}

/***********************/
function getOpenBookIndex(iv_userid){
    // console.log("getOpenBookIndex ma_OpenBook"+ma_OpenBook);
    var rtv=-1;
    for(i=0;i<ma_OpenBook.length;i++){
        if(ma_OpenBook[i].userid==iv_userid)
            rtv=i;
    }
    return rtv;
}
function setOpenBook(iv_bookid){
    var lv_userid=zmUser.curUserid();

    var lv_index=getOpenBookIndex(lv_userid);
    if(lv_index<0)
        ma_OpenBook.push({
            userid:lv_userid,
            bookid:iv_bookid
        });
    else
        ma_OpenBook[lv_index].bookid=iv_bookid;
}
function getOpenBook(iv_userid){
    // console.log("getOpenBook ma_OpenBook"+ma_OpenBook);
    var lv_bookid;
    if(ma_OpenBook.length>0){
        var lv_index=getOpenBookIndex(iv_userid);
        if(lv_index<0) lv_index=0;
        lv_bookid=ma_OpenBook[lv_index].bookid;
    }

    if(!lv_bookid){
        lv_bookid=zmC.BK_TEMP_BOOKDEFAULT;//todo design db to set/get default gook?
        console.log("getOpenBook failed to get OpenBook, opening zmC.BK_TEMP_BOOKDEFAULT: "+lv_bookid);
    }
    return lv_bookid;
}

async function checkPermission(iv_bookid,iv_act){
    /* iv_act:
    "R" - read, open
    "W" - write, read and write
    "O" - owner of book, can change title, share list, etc.
    */

    /*
select bookid, userid, 'O' as type from bk_main where bookid = 2 // and userid = ...
union
select bookid, shareto as userid, sharetype as type from bk_share where bookid = 2 // and userid = ...
     */

    var lb_o=false;
    var lb_r=false;
    var lb_w=false;

    var lv_userid=zmUser.curUserid();

    var lv_sql=" \
    select bookid, userid, 'O' as type from bk_main where bookid = "+iv_bookid+" \
    union \
    select bookid, shareto as userid, sharetype as type from bk_share where bookid = "+iv_bookid+" \
    ";
    var z = await zmDbL.asyncSql(lv_sql);
    for(var i=0;i<z.r.length;i++)
        if(z.r[i].userid==lv_userid){
            if(z.r[i].type=="O"){
                lb_o=true;
                lb_r=true;
                lb_w=true;
            }
            if(z.r[i].type=="R"){
                lb_r=true;
            }
            if(z.r[i].type=="W"){
                lb_r=true;
                lb_w=true;
            }
        }
    
    if(iv_act=="O") return lb_o;
    if(iv_act=="R") return lb_r;
    if(iv_act=="W") return lb_w;
}

async function getBookList(){
    var lv_userid=zmUser.curUserid();

    lv_sql="\
select s.bookid, s.title, \
BK_USET_BK.openpage, BK_USET_BK.openedit, BK_USET_BK.pos_col, BK_USET_BK.pos_row, \
s.author, s.sharetype \
from \
( select \
BK_SHARE.bookid, BK_SHARE.sharetype, BK_MAIN.title, BK_MAIN.userid as author \
from  BK_SHARE left join BK_MAIN on BK_SHARE.bookid = BK_MAIN.bookid \
where BK_SHARE.shareto = '"+lv_userid+"' ) as s \
left join BK_USET_BK \
on ( s.bookid = BK_USET_BK.bookid and BK_USET_BK.userid = '"+lv_userid+"' ) \
 \
union \
 \
select \
BK_MAIN.bookid, BK_MAIN.title, BK_USET_BK.openpage, BK_USET_BK.openedit, BK_USET_BK.pos_col, BK_USET_BK.pos_row, \
null as author, null as sharetype \
from BK_MAIN  \
left join BK_USET_BK  on ( BK_MAIN.bookid = BK_USET_BK.bookid and BK_USET_BK.userid = '"+lv_userid+"' ) \
where BK_MAIN.userid = '"+lv_userid+"'  \
 \
order by BK_USET_BK.pos_row, BK_USET_BK.pos_col; \
    ";
    var x = await zmDbL.asyncSql(lv_sql);
    var la_list=x.r;
    // console.log(la_list);


    //fix null to default values
    for(var i=0;i<la_list.length;i++){
        if(la_list[i].openedit==null) la_list[i].openedit=true;
        if(la_list[i].openpage==null) la_list[i].openpage=1;
        if(la_list[i].pos_col==null) la_list[i].pos_col=-1;
        if(la_list[i].pos_row==null) la_list[i].pos_row=-1;
        //fix userid to nickname:
        if(la_list[i].author)
            la_list[i].author=zmUser.getUserNick(la_list[i].author);
        //add ReadOnly mark
        if(la_list[i].sharetype=="R")
            la_list[i].title="(R)"+la_list[i].title;
    }

    return la_list;
}
async function newBook(iv_title){
    var rtv;

    var lv_sql=buildSqlNewBook(iv_title);
    var x = await zmDbL.asyncSqlM(lv_sql);
    if(x.rc!=0) rtv="new book save error";
    else{
        var lv_new_bookid = await getLatestedBook();
        if(lv_new_bookid>=0){
            lv_sql=buildSqlNewBookEmptySheet(lv_new_bookid);
            var y = await zmDbL.asyncSqlM(lv_sql);
            if(y.rc!=0) rtv="new sheet save error";
            else rtv="Book created.";
        }else{
            rtv="get newly created book error";
        }

    } 
    
    return rtv;
}
async function getLatestedBook(){
    var lv_sql="select * from BK_MAIN order by bookid desc limit 1;"
    var x = await zmDbL.asyncSql(lv_sql);
    if(x.r[0].bookid>=0) return x.r[0].bookid;
    else return -1;
}
async function renameBook(iv_bookid,iv_title){
    var lv_pass=await checkPermission(iv_bookid,"O");
    if(!lv_pass) return 'You cannot edit this book.';

    var lv_sql=buildSqlUpdateTitle(iv_bookid,iv_title);
    var x = await zmDbL.asyncSqlM(lv_sql);
    if(x.rc!=0) rtv="renameBook save error";
    else return "Book renamed.";
}
async function moveBook(iv_bookid,iv_to){
    var rtv="";
    var lo_book=getBookMa(iv_bookid);

    if(lo_book.pos_row<0)
        if(iv_to=='d')
            rtv=await moveBookToRow(iv_bookid,0)
        else
            rtv="Move down into the bookshelf please.";
    else{
        if(iv_to=='u')
            rtv=await moveBookUp(iv_bookid,lo_book.pos_row);
        if(iv_to=='d')
            rtv=await moveBookDown(iv_bookid,lo_book.pos_row);
        
        if(iv_to=='l')
            rtv=await moveBookLeft(iv_bookid,lo_book.pos_col,lo_book.pos_row);
        if(iv_to=='r')
            rtv=await moveBookRight(iv_bookid,lo_book.pos_col,lo_book.pos_row);
    }

    return rtv;
}
function moveBookCheckAtLastCol(iv_bookid){
    var rtv;

    var lo_book=getBookMa(iv_bookid);
    var lv_last_col=0;

    for(var i=0;i<ma_BookList.length;i++)
        if(ma_BookList[i].pos_row==lo_book.pos_row)
            if(ma_BookList[i].pos_col>lv_last_col)
                lv_last_col=ma_BookList[i].pos_col;

    if(lv_last_col==lo_book.pos_col) rtv=true;
    else rtv=false;

    return rtv;
}
async function moveBookToRow(iv_bookid,iv_row){
    var lv_col=0;

    // last col number in that row
    for(var i=0;i<ma_BookList.length;i++)
        if(ma_BookList[i].pos_row==iv_row)
            if(ma_BookList[i].pos_col>=lv_col)
                lv_col=ma_BookList[i].pos_col+1;

        
    var err=await updateUSetBkpos(iv_bookid,lv_col,iv_row);

    if(err) return err;
    else return "Book moved to row: "+iv_row;

}
async function moveBookToCol(iv_bookid,iv_col,iv_row){
     
    var err=await updateUSetBkpos(iv_bookid,iv_col,iv_row);

    if(err) return err;
    else return "Book moved.";

}

async function moveBookUp(iv_bookid,iv_row){
    if(iv_row<0)
        return "The book is already out of the bookshelf."

    if(!moveBookCheckAtLastCol(iv_bookid))
        return "Only last book in the row can move to other row."
    
    return await moveBookToRow(iv_bookid,iv_row-1);
}
async function moveBookDown(iv_bookid,iv_row){
    if(iv_row==3)
        return "The book is already on the bottom row."

    if(!moveBookCheckAtLastCol(iv_bookid))
        return "Only last book in the row can move to other row."

    return await moveBookToRow(iv_bookid,iv_row+1);
}
async function moveBookLeft(iv_bookid,iv_col,iv_row){
    if(iv_col==0)
        return "The book is already at first."

    //get ori left hand book
    var lo_bookLeft;
    for(var i=0;i<ma_BookList.length;i++)
        if(ma_BookList[i].pos_row==iv_row && ma_BookList[i].pos_col==iv_col-1)
            lo_bookLeft=ma_BookList[i];
    
    await moveBookToCol(lo_bookLeft.bookid,iv_col,iv_row);
    return await moveBookToCol(iv_bookid,iv_col-1,iv_row);
}
async function moveBookRight(iv_bookid,iv_col,iv_row){
    if(moveBookCheckAtLastCol(iv_bookid))
        return "The book is already at last."

    //get ori right hand book
    var lo_bookRight;
    for(var i=0;i<ma_BookList.length;i++)
        if(ma_BookList[i].pos_row==iv_row && ma_BookList[i].pos_col==iv_col+1)
            lo_bookRight=ma_BookList[i];
    
    await moveBookToCol(lo_bookRight.bookid,iv_col,iv_row);
    return await moveBookToCol(iv_bookid,iv_col+1,iv_row);
}

async function getShareList(iv_bookid){

    var lv_sql="";
    lv_sql=lv_sql+" select * from BK_SHARE  ";
    lv_sql=lv_sql+" where bookid=";
    lv_sql=lv_sql+" "+iv_bookid+" ";
    lv_sql=lv_sql+" order by sharetype, shareto ; ";

    var x = await zmDbL.asyncSql(lv_sql);
    // console.log(x);
    var la_ro=new Array();
    var la_rw=new Array();

    for(var i=0;i<x.r.length;i++){
        if(x.r[i].sharetype=="R")
            la_ro.push(x.r[i].shareto);
        if(x.r[i].sharetype=="W")
            la_rw.push(x.r[i].shareto);
    }

    return {
        ro:la_ro,
        rw:la_rw
    }

}

async function updateShareList(iv_bookid,io){
    var rtv;
    //remove all share list
    var lv_sql="delete from BK_SHARE where bookid="+iv_bookid+";";

    var x = await zmDbL.asyncSql(lv_sql);
    if(x.r.length>0) return "updateShareList del db error";

    //now build insert SQLs:
    lv_sql="";
    for(var i=0;i<io.ro.length;i++){
        if(iv_bookid,io.ro[i].trim())
            lv_sql=lv_sql+buildSqlInsertShare(iv_bookid,io.ro[i],"R");
    }
    for(var i=0;i<io.rw.length;i++){
        if(iv_bookid,io.rw[i].trim())
            lv_sql=lv_sql+buildSqlInsertShare(iv_bookid,io.rw[i],"W");
    }
    // console.log(lv_sql);
    var y = await zmDbL.asyncSqlM(lv_sql);
    if(y.r) return "updateShareList insert db error";

    rtv="Share list updated";

    return rtv;
}

function buildSqlInsertShare(iv_bookid,iv_userid,iv_flag){
// INSERT INTO Persons (LastName, Address) VALUES ('Wilson', 'Champs-Elysees')

    var lv_sql="";
    lv_sql=lv_sql+" insert into BK_SHARE  ";
    lv_sql=lv_sql+" ( bookid, shareto, sharetype ) values (  ";
    lv_sql=lv_sql+" "+iv_bookid+", ";
    lv_sql=lv_sql+" '"+iv_userid+"', ";
    lv_sql=lv_sql+" '"+iv_flag+"' ";
    lv_sql=lv_sql+" ) ";
    lv_sql=lv_sql+" ; ";

    return lv_sql;
}

function getBookMa(iv_bookid){
    for(var i=0;i<ma_BookList.length;i++)
        if(ma_BookList[i].bookid==iv_bookid)
            return ma_BookList[i];
}

// async function checkUSet(){
//     var lv_userid=zmUser.curUserid();
//     //first, check each (shared)book have uset record
//     //if not, init the uset record

//     //get list of shared books:
//     //(own books should always have uset record)
//     var lv_sql_share = "select distinct shareto, bookid from BK_SHARE where shareto='"+lv_userid+"'";
//     var x = await zmDbL.asyncSql(lv_sql_share);
//     var la_share=x.r;
//     //and current uset rec:
//     var lv_sql_uset = "select userid, bookid from BK_USET_BK where userid='"+lv_userid+"'";
//     var y = await zmDbL.asyncSql(lv_sql_uset);
//     var la_uset=y.r;

//     var la_missing_bookid = new Array();
//     var lv_missing_bookid;
//     //now check missing ones:
//     for(var i=0;i<la_share.length;i++){
//         lv_missing_bookid=la_share[i].bookid;
//         for(var j=0;j<la_uset.length;j++){
//             if( la_uset[j].bookid == la_share[i].bookid ){
//                 //rec find,mark not to save
//                 lv_missing_bookid=-1;
//             }
//         }

//         if (lv_missing_bookid != -1) {
//             console.log("pushing..."+lv_missing_bookid);
//             la_missing_bookid.push(lv_missing_bookid);
//         }

        
//     }

//     console.log(la_share);
//     console.log(la_uset);
//     console.log(la_missing_bookid);

//     //now patch the missings:
//     var lv_sql_patch="";
//     for(var k=0;k<la_missing_bookid.length;k++){
//         lv_sql_patch=lv_sql_patch+"\
// INSERT INTO BK_USET_BK ( userid, bookid, openpage, openedit, pos_col, pos_row ) \
// VALUES ( '"+lv_userid+"', "+la_missing_bookid[k]+", 1, 0, 0, -1 ) ;"// ON CONFLICT ( userid, bookid ) DO UPDATE ;";
//     }

//     console.log(lv_sql_patch);
//     var z = await zmDbL.asyncSqlM(lv_sql_patch);
//     if(z.rc!=0) console.log("checkUSet insert error");

// }

async function updateUSetBkpos(iv_bookid,iv_col,iv_row){
    var rtv="";
    var lv_sql=buildSqlUpdateUSet(iv_bookid,"pos_col",iv_col);
    lv_sql=lv_sql+buildSqlUpdateUSet(iv_bookid,"pos_row",iv_row);
    // console.log(lv_sql);
    var x = await zmDbL.asyncSqlM(lv_sql);
    if(x.rc!=0) rtv="updateUSetBkpos save error";

    return rtv;    
}
async function updateUSetPageStat(iv_bookid,iv_openpage,iv_openedit){
    var lv_sql=buildSqlUpdateUSet(iv_bookid,"openpage",iv_openpage);
    lv_sql=lv_sql+buildSqlUpdateUSet(iv_bookid,"openedit",iv_openedit);
    // console.log(lv_sql);
    var x = await zmDbL.asyncSqlM(lv_sql);
    if(x.rc!=0) console.log("updateUSetPageStat save error");

}

// async function updateUSet(iv_bookid,iv_key_name,iv_key_val){
//     var lv_sql=buildSqlUpdateUSet(iv_bookid,iv_key_name,iv_key_val);
//     console.log(lv_sql);
//     var x = await zmDbL.asyncSql(lv_sql);
//     if(x.rc!=0) console.log("updateUSet save error");

// }

function buildSqlUpdateUSet(iv_bookid,iv_key_name,iv_key_val){
    var lv_userid=zmUser.curUserid();
    var lv_bookid=iv_bookid;
    var lv_key=iv_key_name;
    var lv_kval;
    var lv_cols;
    var lv_vals;
    var lv_ccol;
    var lv_dus;
    var lv_sql;

    if(typeof(iv_key_val)=='string')
        lv_kval="'"+zmDbL.utConvQuote(iv_key_val)+"'";
    else
        lv_kval=iv_key_val;

    lv_cols=" ( userid, bookid, "+lv_key+" ) ";
    lv_vals=" ( '"+lv_userid+"', "+lv_bookid+", "+lv_kval+" ) "
    lv_ccol=" ( userid, bookid ) ";
    lv_dus=lv_key+"="+lv_kval;    
    //INSERT INTO BK_USET_BK 
    //( userid, bookid, key_name ) VALUES ( xxx, yyy, key_val )
    //ON CONFLICT ( userid, bookid )
    //DO UPDATE SET key_name=key_val
    lv_sql="INSERT INTO BK_USET_BK "+lv_cols+" VALUES "+lv_vals+" ON CONFLICT"+lv_ccol+" DO UPDATE SET "+lv_dus+" ;";
    
    return lv_sql;

}

function buildSqlNewBook(iv_title){
// INSERT INTO Persons (LastName, Address) VALUES ('Wilson', 'Champs-Elysees')

    var lv_sql="";
    lv_sql=lv_sql+" insert into BK_MAIN  ";
    lv_sql=lv_sql+" ( userid, title ) values (  ";
    lv_sql=lv_sql+" '"+zmUser.curUserid()+"', ";
    lv_sql=lv_sql+" '"+zmDbL.utConvQuote(iv_title)+"' ";
    lv_sql=lv_sql+"  ";
    lv_sql=lv_sql+" ) ";
    lv_sql=lv_sql+" ; ";
    
    return lv_sql;
}
function buildSqlNewBookEmptySheet(iv_bookid){

    var lv_sql="";
    lv_sql=lv_sql+" insert into BK_SHEETS  ";
    lv_sql=lv_sql+" ( bookid, title, page, sidea, sideb ) values (  ";
    lv_sql=lv_sql+" "+iv_bookid+", '', 1, '', '' ";
    lv_sql=lv_sql+" ) ";
    lv_sql=lv_sql+" ; ";
    return lv_sql;
}

function buildSqlUpdateTitle(iv_bookid,iv_title){
    // UPDATE Person SET FirstName = 'Fred' WHERE LastName = 'Wilson' 
    var lv_sql="";
    lv_sql=lv_sql+" update BK_MAIN  ";
    lv_sql=lv_sql+" set title='"+zmDbL.utConvQuote(iv_title)+"' ";
    lv_sql=lv_sql+" where bookid="+iv_bookid;
    lv_sql=lv_sql+" ; ";

    return lv_sql;
}

function buildSqlSave(io){
    var la=io.sheets;
    var lv_n="";
    var lv_c="";

    for(var i=0;i<la.length;i++){
        convQuotes(la[i]);
        if(la[i].dbflag=="N")
            lv_n=lv_n+buildSqlInert(la[i])+"; ";
        if(la[i].dbflag=="C")
            lv_c=lv_c+buildSqlUpdate(la[i])+"; ";
    }

    return lv_n+lv_c;
}

function buildSqlSaveDraft(iv_userid, io){
    //todo user id....
    // var lv_col="(userid, bookid, page)";
    // var lv_val="('"+iv_userid+"', "+io.bookid+", "+io.page+" )";
    // var lv_odku=" sidea='"+zmDbL.utConvQuote(io.sidea)+"', sideb='"+zmDbL.utConvQuote(io.sideb)+"' ";
    // return "INSERT INTO BK_DRAFT "+lv_col+" VALUES "+lv_val+" ON DUPLICATE KEY UPDATE "+lv_odku;
    
    
    //var lv_col="(userid, bookid, page, sidea, sideb)";
    //var lv_val="('"+iv_userid+"', "+io.bookid+", "+io.page+", '"+io.sidea+"', '"+io.sideb+"')";
    //return "REPLACE INTO BK_DRAFT "+lv_col+" VALUES "+lv_val;
    
    /*--- above is for MySql ---*/
    /*--------------------------*/
    /*--- below is for Sqlite --*/

    // INSERT INTO BK_DRAFT (userid, bookid, page) VALUES ('XX', 2, 3 ) 
    // ON CONFLICT(userid, bookid, page) DO UPDATE SET sidea='qlq', sideb='[DevBook2]'

    var lv_col="(userid, bookid, page)";
    var lv_val="('"+iv_userid+"', "+io.bookid+", "+io.page+" )";
    var lv_odku=" sidea='"+zmDbL.utConvQuote(io.sidea)+"', sideb='"+zmDbL.utConvQuote(io.sideb)+"' ";
    return "INSERT INTO BK_DRAFT "+lv_col+" VALUES "+lv_val+" ON CONFLICT"+lv_col+" DO UPDATE SET "+lv_odku;
}


function buildSqlInert(io){
// INSERT INTO Persons (LastName, Address) VALUES ('Wilson', 'Champs-Elysees')
    var lv_col="(page, bookid, title, sidea, sideb)";
    var lv_val="("+io.page+", '"+io.bookid+"', '"+io.title+"', '"+io.sidea+"', '"+io.sideb+"')";
    return "INSERT INTO BK_SHEETS "+lv_col+" VALUES "+lv_val;
}

function buildSqlUpdate(io){
    // UPDATE Person SET FirstName = 'Fred' WHERE LastName = 'Wilson' 
    var lv_set="page = "+io.page+", bookid = '"+io.bookid+"', title = '"+io.title+"', sidea = '"+io.sidea+"', sideb = '"+io.sideb+"' ";
    var lv_where=" sheetid = "+io.sheetid+" ";
    return "UPDATE BK_SHEETS SET "+lv_set+" WHERE "+lv_where;
}

// function buildSqlUpdateOpenPage(iv_bookid,iv_openpage){
//     return "UPDATE BK_MAIN SET openpage="+iv_openpage+" WHERE bookid="+iv_bookid+";";
//     //if there's other fields to update, modify in future
// }

function convQuotes(io){
    //io.bookid=zmDb.utConvQuote(io.bookid);
    io.title=zmDbL.utConvQuote(io.title);
    io.sidea=zmDbL.utConvQuote(io.sidea);
    io.sideb=zmDbL.utConvQuote(io.sideb);
}