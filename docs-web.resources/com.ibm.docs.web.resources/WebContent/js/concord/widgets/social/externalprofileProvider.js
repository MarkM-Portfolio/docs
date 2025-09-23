dojo.provide("concord.widgets.social.externalprofileProvider");
dojo.require("dojo.i18n");
dojo.require("concord.util.conditional");
dojo.require("concord.beans.ProfilePool");

dojo.declare("concord.widgets.social.externalprofileProvider", null, {
	profileRoot:null,
	iconList:null,
	constructor: function(initialParams)
	{
		if (initialParams && initialParams.url && initialParams.url != "" && initialParams.url != "https://abc.com/profiles" && !initialParams.useInitialName)
		{
			this.iconList = [];
			this.profileRoot = initialParams.url;
			this.profileRoot.replace(/^https?:/i, window.location.protocol);
		}
		this.nls = dojo.i18n.getLocalization("concord.widgets.sidebar","SideBar"); 
	},
	_generateDefaultIcon: function (item)
	{    	
		if (item.node && item.node.parentNode)
		{
			item.icon.setUsingInitialName();
			var initialNameNode = concord.util.conditional.getInitialNameIcon(item);
			item.node.parentNode.insertBefore(initialNameNode,item.node);
			dojo.style(item.node, "display", 'none');
			item.icon.setImgNode(initialNameNode);
			dojo.attr(initialNameNode,'tabindex',0);
        	dijit.setWaiRole(initialNameNode,'button');
			dojo.publish("com.ibm.docs.editortokenloading_"+item.UID,[true]);
		}
		else
		{
			var imgSrc = concord.util.conditional.getDefaultIcon(item);
			item.node.src = (dojo.isIE == 9)? imgSrc + "?nocache=" + new Date().getTime() : imgSrc;
			dojo.publish("com.ibm.docs.editortokenloading_"+item.UID,[false]);
		}
	},
	_generateRealIcon:function(item)
	{
		var imgURI = null;
		if(!item.userProfile){
			item.userProfile = ProfilePool.getUserProfile(item.UID);	  
		}
		  	
    	if(item.userProfile)
    	{
    		imgURI = item.userProfile.getPhotoUrl();
	    }
    	
		if (imgURI)
		{
			item.node.src = (dojo.isIE == 9)? imgURI + "?nocache=" + new Date().getTime() : imgURI;
			dojo.publish("com.ibm.docs.editortokenloading_"+item.UID,[false]);
			//item.icon.setPhotoLabel(true);
		}
		else
			this._generateDefaultIcon(item);

	},
	replaceIcon: function(item) 
	{
		if (!this.iconList)//No Profile available
		{
			this._generateDefaultIcon(item);
		}
		else
		{
			this._generateRealIcon(item);			
		}
	},
	generateIcon: function (item,container)
	{
		if (!this.iconList)//No Profile available
		{		
			var divNode = document.createElement('div');
			dojo.addClass(divNode,"default_photo_contianer default_photo_base");
			container.appendChild(divNode);
			
			var pic = document.createElement('img');
			pic.title = item.UserName;
			pic.alt = "Photo";
			dojo.addClass(pic,"default_photo_base");
			divNode.appendChild(pic);
			
			item.node = pic;
			this._generateDefaultIcon(item);	
		}
		else
		{
			container.title = item.UserName;
			var pic = document.createElement('img');
			container.appendChild(pic);
			item.node = pic;
			this._generateRealIcon(item);
		}
	},
	
	generateHover: function (item,container) 
	{
		if(!item.userProfile){
			item.userProfile = ProfilePool.getUserProfile(item.UID);	    	
		}
		if(item.userProfile){
			container.title = dojo.string.substitute( this.nls.editorName, {'name': item.userProfile.getName()})+'\n' +dojo.string.substitute( this.nls.editorEmail, {'email': item.userProfile.getEmail()});
			var title=item.userProfile.getJobTitle();
			if(title){
				container.title+='\n'+dojo.string.substitute( this.nls.editorJobTitle, {'job': title});
			}
			var orgname=item.userProfile.getOrgName();
			if(orgname){
				container.title+='\n'+dojo.string.substitute( this.nls.editorOrganization, {'org': orgname});
			}
		}else{
			container.title = item.UserName;
		}
	}
});
