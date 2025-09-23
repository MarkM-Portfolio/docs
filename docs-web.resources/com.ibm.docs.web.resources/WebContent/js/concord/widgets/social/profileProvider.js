dojo.provide("concord.widgets.social.profileProvider");
dojo.require("dojo.i18n");
dojo.require("concord.util.conditional");

dojo.declare("concord.widgets.social.profileProvider", null, {
	bProfileAvailable:false,
	bConnectAttempting:false,
	bIsBusy:false,
	nConnectAttemptCount:3,
	nConnectAttemptInterval:1000,//In MS
	profileRoot:null,
	iconList:null,
	constructor: function(initialParams)
	{
		if (initialParams && initialParams.root && initialParams.root != "" && !initialParams.useInitialName)
		{
			this.iconList = [];
			this.profileRoot = window.location.protocol == "https:"?initialParams.ssl_root:initialParams.root;
			if (initialParams.nConnectAttemptCount)
				this.nConnectAttemptCount = initialParams.nConnectAttemptCount;
			if (initialParams.nConnectAttemptInterval)
				this.nConnectAttemptInterval = initialParams.nConnectAttemptInterval;
			this.bConnectAttempting = true;
			var tryAddress = this.profileRoot+'/atom/profileService.do';
			if (gIs_cloud)
				tryAddress = this.profileRoot+'/connections/opensocial/rest/people/@me/@self';
			concord.util.conditional.tryConnecting(tryAddress,
			this.nConnectAttemptInterval,this.nConnectAttemptCount,dojo.hitch(this,"_onConnectSuccess"),dojo.hitch(this,"_onConnectFailure"));
		}
	},
	_onConnectSuccess: function()
	{
		this._processIcons();
		this.bConnectAttempting = false;
	},
	_onConnectFailure: function()
	{
		this.bConnectAttempting = false;
		this.bProfileAvailable = false;
	},
	_processIcons: function()
	{
		if (this.bProfileAvailable)
		{
			//something wrong, but not know the details...
			return;
		}
		if (this.bIsBusy == true)
		{
			var func = dojo.hitch(this,"_processIcons");
			setTimeout(func,1000);
		}
		else
		{
			this.bIsBusy = true; 
			var tempIconList = this.iconList;
			this.iconList = [];
			for (var i = 0;i<tempIconList.length;i++)
			{
				var item = tempIconList[i];
				this._generateRealIcon(item);
			}
			
			this.bProfileAvailable = true;
			this.bIsBusy = false; 
		}
	},
	_generateDefaultIcon: function (item,bTemperary)
	{
		if (bTemperary)
		{
			item.node.src = concord.util.conditional.getDefaultIcon(item);
			this.iconList.push(item);
		}
		else
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
		}
		
	},
	_generateRealIcon:function(item)
	{
		var loadedImg = null;
		{
			var imgURI = null;
			var loadedXML = null;
			var loadedJSON = null;
			
			var url = this.profileRoot+'/atom/profile.do';
			var content = {
				userid:item.UID
			};
			var format = "xml";
			var load = function(data) {
				loadedXML = data;
			};
			if (gIs_cloud)
			{
				/*url = this.profileRoot+'/lotuslive-shindig-server/social/rest/people/lotuslive:user:'+item.UID+'/@self';
				
				format = "json";
				content = {
					format:format
				};
				load = function(data) {
					loadedJSON = data;
				};*/
				imgURI = this.profileRoot+'/contacts/profiles/photo/'+item.UID;
			}
			else
			{
				var xhrArgs = {
					url: url,
					handleAs:format,
					sync:true,
					preventCache:false,
					timeout:5000,
					content:content,
					load: load,
					error: function(error) {
						console.error("error in _generateRealIcon:",error);
					}
				};
				dojo.xhrGet(xhrArgs);
			}
			
			if (loadedXML)
			{
				var links = loadedXML.getElementsByTagName('link');
				for (var i = 0;i<links.length;i++)
				{
					var typeNode = links[i].attributes.getNamedItem('type');
					var relNode = links[i].attributes.getNamedItem('rel');
					var hrefNode = links[i].attributes.getNamedItem('href');
					if ( (typeNode && typeNode.value=='image') && (relNode && relNode.value =='http://www.ibm.com/xmlns/prod/sn/image') && hrefNode)
					{
						imgURI =hrefNode.value;
						break;
					}
				}
				//item.profileXML = loadedXML;
			}
			/*if (loadedJSON)
			{
				if (loadedJSON.entry)
				{
					//item.profileJSON = loadedJSON.entry;
					if (loadedJSON.entry.photo)
						imgURI = this.profileRoot+'/contacts/img/photos/'+loadedJSON.entry.photo;
				}
			}*/
			if (imgURI)
			{
				item.node.src = (dojo.isIE == 9)? imgURI + "?nocache=" + new Date().getTime() : imgURI;
				dojo.publish("com.ibm.docs.editortokenloading_"+item.UID,[false]);
				//item.icon.setPhotoLabel(true);
			}
			else
				this._generateDefaultIcon(item,false);
		}
	},
	replaceIcon: function(item) 
	{
		if (!this.iconList)//No LC Profile
		{
			this._generateDefaultIcon(item,false);
			return;
		}
		if (this.bIsBusy == true)
		{
			var func = dojo.hitch(this,"replaceIcon",item);
			setTimeout(func,this.iconList?(this.iconList.length?this.iconList.length*1000:1000):3000);
		}
		else
		{
			this.bIsBusy = true;
			if (!this.bProfileAvailable || this.bConnectAttempting)
			{
				this._generateDefaultIcon(item,true);
			}
			else
			{
				this._generateRealIcon(item);
			}
			this.bIsBusy = false;
		}
	},
	generateIcon: function (item,container)
	{
		if (!this.iconList)//No LC Profile
		{
			this.bIsBusy = true;
			
			var divNode = document.createElement('div');
			dojo.addClass(divNode,"default_photo_contianer default_photo_base");
			container.appendChild(divNode);
			
			var pic = document.createElement('img');
			pic.title = item.UserName;
			pic.alt = "Photo";
			dojo.addClass(pic,"default_photo_base");
			divNode.appendChild(pic);
			
			item.node = pic;
			this._generateDefaultIcon(item,false);
			this.bIsBusy = false;
			return;
		}
		if (this.bIsBusy == true)
		{
			var func = dojo.hitch(this,"generateIcon",item,container);
			setTimeout(func,this.iconList?(this.iconList.length?this.iconList.length*1000:1000):3000);
		}
		else
		{
			this.bIsBusy = true;
			container.title = item.UserName;
			var pic = document.createElement('img');
			container.appendChild(pic);
			item.node = pic;
			if (!this.bProfileAvailable || this.bConnectAttempting)
			{
				this._generateDefaultIcon(item,true);
			}
			else
			{
				this._generateRealIcon(item);
			}
			this.bIsBusy = false;
		}
	}
	
});
