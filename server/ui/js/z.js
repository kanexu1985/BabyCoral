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