function genButs(ia_menu){
	var rtv="";
	if(ia_menu){
		for(var i=0;i<ia_menu.length;i++){
			rtv=rtv+genBut(ia_menu[i].app,ia_menu[i].descp)+"\n";
		}
	}

	return rtv;
}

function genBut(iv_app,iv_descp){
/*
<a class="btn btn-outline-primary btn-lg" href="../bk"  role="button">
	BK
</a>
*/	
	return "<a class=\"btn btn-outline-secondary btn-lg \" href=\"../"+iv_app+"\"  role=\"button\">"+iv_descp+"</a>";
}

function zPtMsg(iv_divId, io_msg){


	const LC_I0 = '<span class="btn btn-info btn-sm" style="position:absolute;left:-3.2px;top:-2.5px;">i</span>';
	const LC_I1 = '<span class="badge badge-info">i</span>';
	const LC_T0 = '<span class="btn btn-light btn-sm" style="position:absolute;left:-3.2px;top:-2.5px;">...</span>';
	const LC_T1 = '<span class="badge badge-light">...</span>';
	const LC_S0 = '<span class="btn btn-success btn-sm" style="position:absolute;left:-3.2px;top:-2.5px;">✓</span>';
	const LC_S1 = '<span class="badge badge-success">✓</span>';
	const LC_W0 = '<span class="btn btn-warning btn-sm" style="position:absolute;left:-3.2px;top:-2.5px;">!</span>';
	const LC_W1 = '<span class="badge badge-warning">!</span>';
	const LC_E0 = '<span class="btn btn-danger btn-sm" style="position:absolute;left:-3.2px;top:-2.5px;">X</span>';
	const LC_E1 = '<span class="badge badge-danger">X</span>';

	if(typeof(io_msg)=='string'){
		if(io_msg.trim()=="")
			document.getElementById(iv_divId).innerHTML="";
		else if(io_msg.trim()=="...")
			document.getElementById(iv_divId).innerHTML=LC_T1;
		else
			document.getElementById(iv_divId).innerHTML=LC_I1+" "+io_msg;
		return;
	}

	if(io_msg==undefined || io_msg==null) {
		document.getElementById(iv_divId).innerHTML="";
		return;
	}
	if(io_msg.message==undefined || io_msg.message==null || io_msg.message==""){
		document.getElementById(iv_divId).innerHTML="";
		return;
	}

	var lv_icon0,lv_icon1;
	var lv_msg=io_msg.message;

	if(io_msg.type=='S'){ lv_icon0=LC_S0; lv_icon1=LC_S1}
	else if(io_msg.type == 'T'){ lv_icon0=LC_T0; lv_icon1=LC_T1}
	else if(io_msg.type == 'W'){ lv_icon0=LC_W0; lv_icon1=LC_W1}
	else if(io_msg.type == 'E'){ lv_icon0=LC_E0; lv_icon1=LC_E1}
	else { lv_icon0=LC_I0; lv_icon1=LC_I1}




	document.getElementById(iv_divId).innerHTML='<div style="position:relative;">'+lv_icon0+" "+lv_icon1+" "+lv_msg+'</div>';

	setTimeout(function(){

		document.getElementById(iv_divId).innerHTML='<div style="position:relative;">'+lv_icon1+" "+lv_msg+'</div>';

	},500);


}