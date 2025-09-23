dojo.provide("concord.widgets.social.STProvider");

dojo.require("dijit.Editor");
dojo.require("dojo.i18n");
dojo.require("concord.util.conditional");

dojo.declare("concord.widgets.social.STProvider", null, {
	bInit:false,
	bSTAvailable:false,
	bAwarenessAvailable:false,
	bBIZCardAvailable:false,//Yes, as if the BIZCard is available, some ST libraries are supplied by it. So we have to know the status of BIZCard.
	iconPaths:null,
	aSTStatusBar:null,
	keyListener1:null,
	keyListener2:null,
	focusElements:null,
	constructor: function(initalParam) 
	{
		if (this.bInit)
			return;		
		
		if (!initalParam || !concord.util.conditional.entitilementVerification('bh_chat'))//Which means, no ST service supplied/entitled.
		{
			this.bInit = true;
			return;
		}	
		if (initalParam.bBIZCardAvailable)//Which means, we need not care about the ST loading/initial/loggining, but only statusbar and livenames
		{
			window.sametimeAwarenessEnabled = true;
			if ( window.location.protocol == "https:")
				initalParam.stproxyConfig.server = initalParam.stproxyConfig.ssl_server;
			window.stproxyConfig = initalParam.stproxyConfig;
			window.djConfig = window.djConfig?window.djConfig:{};
			//this.bSTAvailable = initalParam.bSTAvailable;
			this.bBIZCardAvailable = true;
			{
				var lang_locate = g_locale.split('-');
				var lang_para = '&lang='+lang_locate[0];
				var dock_para = '&auto=false';
				var hub_para = '&noHub=false';
				var weidgetURI = initalParam.stproxyConfig.server+'/stwebclient/latest/include.js?widget=widgetsLight'+lang_para+dock_para+hub_para;
				var elem = document.createElement('script');
				elem.type = 'text/javascript';
				elem.src = weidgetURI;
				document.getElementsByTagName('head')[0].appendChild(elem);
			}
			concord.util.conditional.processUntilAvailable(dojo.hitch(this,"_prepareEnv"),dojo.hitch(this,"_dealError"),"window.stproxyConfig",null,false,500,40);
		}
		else//Which means, we need care about all the ST stuff: loading/initial/loggining/statusbar/livenames...
		{
			if (!initalParam.stproxyConfig)
				return;
			initalParam.stproxyConfig.tunnelURI = window.location.hostname + window.contextPath+window.staticRootPath+'/js/concord/templates/tunnel.html';
			window.sametimeAwarenessEnabled = true;
			if ( window.location.protocol == "https:")
				initalParam.stproxyConfig.server = initalParam.stproxyConfig.ssl_server;
			window.stproxyConfig = initalParam.stproxyConfig;
			window.djConfig = window.djConfig?window.djConfig:{};
			/*{
				var cssURI = initalParam.stproxyConfig.server+'/stwebclient/dojo.blue/sametime/themes/WebClientAll.css';
				var elem = document.createElement('link');
				elem.rel = 'stylesheet';
				elem.type = 'text/css';
				elem.href = cssURI;
				elem.media = "screen";
				document.getElementsByTagName('head')[0].appendChild(elem);
			}*/
			/*{
				var baseCampURI = initalParam.stproxyConfig.server+'/stbaseapi/baseComps.js';
				var elem = document.createElement('script');
				elem.type = 'text/javascript';
				elem.src = baseCampURI;
				document.getElementsByTagName('head')[0].appendChild(elem);
			}*/
			{
				var lang_locate = g_locale.split('-');
				var lang_para = '&lang='+lang_locate[0];
				var weidgetURI = initalParam.stproxyConfig.server+'/stwebclient/latest/include.js?widget=widgetsLight'+lang_para;
				var elem = document.createElement('script');
				elem.type = 'text/javascript';
				elem.src = weidgetURI;
				document.getElementsByTagName('head')[0].appendChild(elem);
			}
			/*{
				var connURI = initalParam.stproxyConfig.server	+ '/stwebclient/apps/connections.js';
				var elem = document.createElement('script');
				elem.type = 'text/javascript';
				elem.src = connURI;
				document.getElementsByTagName('head')[0].appendChild(elem);
			}*/
			concord.util.conditional.processUntilAvailable(dojo.hitch(this,"_dealCSSTags"),dojo.hitch(this,"_dealError"),"window.sametime && window.sametime.LiveNamePhoto",null,false);
			this.createAwareness();
		}
	},
	
	_dealError: function ()
	{
		this.bSTAvailable = false;
		this.bInit = true;
	},
	
	_dealCSSTags: function ()
	{
		this.bSTAvailable = true;
		this.bInit = true;
		var headers = document.getElementsByTagName('head');
		if (headers[0])
		{
			var links = headers[0].getElementsByTagName('link');
			for (var i=0;i<links.length;i++)
			{
				var link = links[i];
				if (link.rel == "stylesheet" && link.type == "text/css")
				{
					var href = link.href.toLowerCase();
					if ( href.indexOf("webclientall.css") != -1)
					{
						headers[0].removeChild(link);
						break;
					}
				}
			}
		}
		
	},
	
	createAwareness: function ()
	{
		if (!this.bInit)
		{
			setTimeout(dojo.hitch(this,"createAwareness"),1000);
			return;
		}
		if (!this.bSTAvailable)
			return;
			
		if (window.bAwarenessAvailable)
			return;
			
		//if (this.bBIZCardAvailable)
			
		//else
		//if (this.bBIZCardAvailable)
		//	this._prepareEnv();
		//else
		{
			if (!gIs_cloud)
				stproxy.login.loginByToken(null, null,null, null, null);
			window.bAwarenessAvailable = true;
		}
	},
	_prepareEnv: function ()
	{
		window.bAwarenessAvailable = true;
		{
			var connURI = window.contextPath+window.staticRootPath+'/js/concord/widgets/social/SametimeStatusBar.js';
			var elem = document.createElement('script');
			elem.type = 'text/javascript';
			elem.src = connURI;
			document.getElementsByTagName('head')[0].appendChild(elem);
		}
		{
			var cssURI = window.contextPath+window.staticRootPath+'/styles/css/concord/SametimeAwareness.css';
			var elem = document.createElement('link');
			elem.rel = 'stylesheet';
			elem.type = 'text/css';
			elem.href = cssURI;
			document.getElementsByTagName('head')[0].appendChild(elem);
		}
		concord.util.conditional.processUntilAvailable(dojo.hitch(this,"_createAwareness"),null,"window.stproxy != null && stproxy.awareness != null && concord.widgets.social.SametimeStatusBar",null,false,500,1000);
	},
	_createAwareness: function () 
	{
		//Start--Prototype for embed Buddy List and Chat window
		{
			var weidgetURI = window.stproxyConfig.server+'/stwebclient/widgetsLight.js';
			var elem = document.createElement('script');
			elem.type = 'text/javascript';
			elem.src = weidgetURI;
			document.getElementsByTagName('head')[0].appendChild(elem);
		}
		concord.util.conditional.processUntilAvailable(dojo.hitch(this,"_dealCSSTags"),dojo.hitch(this,"_dealError"),"window.sametime && window.sametime.LiveNamePhoto",null,false);
		//End--Prototype for embed Buddy List and Chat window
		//dojo.require("concord.widgets.social.SametimeStatusBar");
		this.aSTStatusBar = new concord.widgets.social.SametimeStatusBar(this.bBIZCardAvailable);
		//window.bAwarenessAvailable = true;
	},
	_createSTStatus: function(item,subContainer)
	{
		stproxy.addOnLoad(function() {
		    stproxy.uiControl.addOnLoad(function() {
	        	var liveNamePhoto = new sametime.LiveNamePhoto({"userId":gIs_cloud?item.email:item.UserName,"showStatusIcon":true});
	    		//liveNamePhoto.setLiveNameModel(item.UserName);
	    		subContainer.appendChild(liveNamePhoto.domNode);
	    		if (liveNamePhoto.stLiveNamePhoto)
	    		{
	    			item.node = liveNamePhoto.stLiveNamePhoto;
	    			liveNamePhoto.initFunc = function(){
	    				//var nameTtile=(stproxy.displayNames[this.userId]||this.Name);
	    				var nameTtile=item.UserName;
	    				dojo.attr(this.stLiveNamePhoto,"title",nameTtile);
	    			}
	    			item.icon.setImgNode(liveNamePhoto.stLiveNamePhoto);
	    			window.conditionRenderer.replaceIcon(item);
	    			
	    			dojo.connect(liveNamePhoto,"onModelUpdate",item.icon,"STStatusUpdate");
	                //var imgBtn = document.createElement('div');
	                var btnId = 'user_token_icon_'+item.UID;
	                item.icon.getImgNode().id = btnId;
	                //imgBtn.title = this.nls.tipsCommentsMenu;
	                dojo.attr(item.icon.getImgNode(),'tabindex',0);
	                dijit.setWaiRole(item.icon.getImgNode(),'button');
	                
	                window.conditionRenderer.generateHover(item,gIs_cloud?item.li:item.icon.getImgNode());
	                
	    			//if (!window.conditionRenderer.generateHover(item,liveNamePhoto.stLiveNamePhoto))
	    			{
	    				liveNamePhoto.domNode.title = item.UserName;
	    			}
	    			item.icon.loadingFinished();
	    		}
		    });
		});
		
	},
	_createDefaultSTStatus: function (item,subContainer)
	{
		this.bSTAvailable = false;
		{
			var divNode = document.createElement('div');
			dojo.addClass(divNode,"default_photo_contianer default_photo_base");
			subContainer.appendChild(divNode);
			
			var pic = document.createElement('img');
			pic.alt = "Default Photo";
			dojo.addClass(pic,"default_photo_base");
			divNode.appendChild(pic);
			
			item.node = pic;
			item.icon.setImgNode(pic);
			window.conditionRenderer.replaceIcon(item);
			
			var btnId = 'user_token_icon_'+item.UID;
            item.icon.getImgNode().id = btnId;
            //imgBtn.title = this.nls.tipsCommentsMenu;
            dojo.attr(item.icon.getImgNode(),'tabindex',0);
            dijit.setWaiRole(item.icon.getImgNode(),'button');
            
            window.conditionRenderer.generateHover(item,gIs_cloud?item.li:item.icon.getImgNode());
			
			//if (!window.conditionRenderer.generateHover(item,pic))
			{
				divNode.title = item.UserName;
			}
			
			item.icon.loadingFinished();
		}
	},
	generateSTStatus: function(item,subContainer) 
	{

		if (!this.bInit)
		{
			setTimeout(dojo.hitch(this,"generateSTStatus",item,subContainer),1000);
			return true;
		}
		if (!this.bSTAvailable)
		{
			this._createDefaultSTStatus(item,subContainer);
			return false;
		}
		else 
		{
			this._createSTStatus(item,subContainer);
			return true;
		}
	},
	renderSTAWareness: function(container)
	{
		if (!this.bInit)
		{
			setTimeout(dojo.hitch(this,"renderSTAWareness",container),1000);
			return;
		}
		if (!this.bSTAvailable)
			return;
			
		if (container && container.appendChild && this.aSTStatusBar)
			container.appendChild(this.aSTStatusBar.getBar());
	},
	_getStatusBar: function ()
	{
		if (!this.focusElements)
		{
			if (this.bBIZCardAvailable && this.aSTStatusBar && document.getElementById("DocsStStatusArea") && document.getElementById("launchPopupButton"))
			{
				this.focusElements = [];
				this.focusElements.push(document.getElementById("DocsStStatusArea"));
				this.focusElements.push(document.getElementById("launchPopupButton"));
				return this.focusElements;
			}
			if (window.stproxy && window.stproxy.dock && window.stproxy.dock._widget && window.stproxy.dock._widget.launchPopupButton && window.stproxy.dock._widget.stproxy_dock_availability)
			{	
				this.focusElements = [];
				this.focusElements.push(window.stproxy.dock._widget.launchPopupButton);
				this.focusElements.push(window.stproxy.dock._widget.stproxy_dock_availability);
				return this.focusElements;
			}
		}
		
		return this.focusElements;
	},
	
	_onKeyPress: function (event)
	{
		event = event || window.event;
		var key = (event.keyCode ? event.keyCode : event.which);
		if(key == dojo.keys.F2 && event.shiftKey){
			if(window.pe.scene.docType == "sheet"){
				var editor = pe.scene.editor;
				var controller = editor.getController();
				var inlineEditor = controller.getInlineEditor();
				if(inlineEditor.isEditing()){
					inlineEditor.focus();
					inlineEditor.collapseToEnd();
					return;
				}
				editor._needFocus = true;
				editor.focus2Grid();
				dojo.stopEvent(event);
			}else if(window.pe.scene.docType == "pres"){
				//shift+f2 handled by pres.
			}	
			else
				pe.scene.getEditor().focus();
			dojo.stopEvent(event);
		}
	},
	_grabFocus: function ()
	{
		if (!this.keyListener1)
			this.keyListener1 = dojo.connect(this._getStatusBar()[0] , "onkeydown", dojo.hitch(this, this._onKeyPress));
		
		if (!this.keyListener2)
			this.keyListener2 = dojo.connect(this._getStatusBar()[1] , "onkeydown", dojo.hitch(this, this._onKeyPress));
		this._getStatusBar()[0].focus();
	},
	grabFocus: function (shiftf2)
	{
		if (!this.bInit || !this.bSTAvailable || !this._getStatusBar())
		{
			if(window.pe.scene.docType == "sheet"){
				var editor = pe.scene.editor;
				var controller = editor.getController();
				var inlineEditor = controller.getInlineEditor();
				if(inlineEditor.isEditing()){
					inlineEditor.focus();
					inlineEditor.collapseToEnd();
					return;
				}
				editor._needFocus = true;
				editor.focus2Grid();
			}else if(window.pe.scene.docType == "pres"){
				//shift+f2 handled by pres.
				if (shiftf2)
					return;
				else
					pe.scene.getEditor().focus();
			}	
			else
				pe.scene.getEditor().focus();
		}
		else
			this._grabFocus();
	}
});
