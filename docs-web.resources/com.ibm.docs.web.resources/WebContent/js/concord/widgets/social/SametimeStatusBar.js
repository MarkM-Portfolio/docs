openAround = function (menu, openedBy, opt, evt){	
	// summary: open a dijit pointed by menuId (typically a dijit.Menu) in a popup placed around the node in evt.target
	//	typically called on a onclick event in the page (onclick="menuUtility.openMenu(event, 'id of your menu')"
	//	you can also use dojo.connect to bind it programmatically in a dom node
	//var menu = dijit.byId(menuId);		
	
	// standardize the event (fix cross-browser differences)
	if(evt) dojo.stopEvent(evt);
	
	// If the menu was showing just prior to this function call, don't re-show the menu. Just clear the flag and return.
	if (menu && menu.preventReopen) {
		menu.preventReopen = menu.wasShowing = false;
		return;
	}
	
	// store the DOM of the action link that opened the menu
	if (evt && !openedBy)
	   openedBy = evt.target;

      	// NEW: closes and restores focus when popup is executed or cancelled
      // removes need to have onClose do the focus
      function closeAndRestoreFocus(){
         // user has clicked on a menu or popup
         
        try{
        	dijit.focus(openedBy);
        }
        catch(e)
        {
        	//Do nothing if this fails
        }	         
         dijit.popup.close(menu);
      };

	// open the menu, place it relative to the target position of the node
	dijit.popup.open({
		popup: menu,
		around: openedBy,
		orient: (opt ? opt.orient : null) || (dojo._isBodyLtr() ? {'BL':'TL', 'BR':'TR', 'TL':'BL', 'TR':'BR'} : {'BR':'TR', 'BL':'TL', 'TR':'BR','TL':'BL'}),
		onExecute: closeAndRestoreFocus,
		onCancel: closeAndRestoreFocus
      }); 

	menu.focus();

	// close the menu when the user click outside the menu 
	if (!menu._blurCloseHandler)
		menu._blurCloseHandler = menu.connect(menu, "_onBlur", function(){
			// Remember the menu was showing long enough for the mousedown handler to prevent closing and reopening with a single click
			menu.wasShowing = menu.isShowingNow;
			setTimeout(function(){menu.wasShowing = false;},1);
			dijit.popup.close(menu)
		});
};
window.testloadflag = true;
window.buddylistIsntance = null;
console.log("fisrt point in SametimeStatusBar.js");
dojo.requireLocalization("concord.widgets","shareDoc");
dojo.require("concord.widgets.CommonDialog");
dojo.declare("concord.widgets.social.BuddyList", [concord.widgets.CommonDialog], {
	contentDiv : null,
	constructor: function(params) {
		params.isSTBuddyList = true;
		var args = [null,params.concordTitle,null,false,params];
		args.callee = arguments.callee;
		this.inherited( args );
		this._toMode();
	},
	createContent: function (contentDiv) {
		if (contentDiv)
		{
			this.contentDiv = contentDiv;
			contentDiv.style.height = "450px";
			contentDiv.style.width = "330px";
			contentDiv.style.display= "block";
			contentDiv.style.background= "#FFFFFF";
			
			if (window.buddylistIsntance == null)
				window.buddylistIsntance = new sametime.WebClient ({}); 
			contentDiv.appendChild(window.buddylistIsntance.domNode);
		}
	},
	onCancel: function (editor) {
		// Overridden 
		this.contentDiv.removeChild(window.buddylistIsntance.domNode);
		dojo.publish("ibm.docs.buddyListClosed");
		return true;
	},
	postCreate: function()
	{
		return;
	},
	reset: function () {
		//this.contentDiv.parentNode.style.padding = '0';
	},
	_toMode: function()
	{
		if(dijit._underlay)
			dijit._underlay.domNode.style.display = 'none';
		this.handle1 = dojo.connect(this.dialog, "layout", function() {
			if(dijit._underlay)
				dijit._underlay.domNode.style.display = 'none';
		});
		this.handle2 = dojo.connect(this.dialog, "show", function() {
			if(dijit._underlay)
				dijit._underlay.domNode.style.display = 'none';
		});
	}
});
dojo.declare("concord.widgets.social.QSDialog", [concord.widgets.CommonDialog], {
	userProfile:null,
	userLiveNameModel:null,
	shareDoc:null,
	successMessage:"document shared to you...",
	constructor: function(obj,concordTitle,oKLabel,vis,params) {
		this.shareDoc = dojo.i18n.getLocalization("concord.widgets","shareDoc");
		this.userProfile = params.userProfile;
		this.userLiveName = params.userLiveName;
		if (params.successMessage && params.successMessage != '')
			this.successMessage = params.successMessage;
		this.inherited( arguments );
	},
	createContent: function (contentDiv) {
		if (contentDiv)
		{
			var content = dojo.create('span', null, contentDiv);
			content.innerHTML = this.params.message;
		}
	},
	reset: function () {
	
	},
	onOk: function (editor) {
		var shareto = new Array();
		var temp = {
			"id": this.userProfile.getId(),
			"role": "CONTRIBUTOR"
		};
        shareto.push(temp);
		var data = {
			"shareTo": shareto
		};
		var url = concord.util.uri.getDocUri() + '?method=share';
		var sData = dojo.toJson(data);
		var response, ioArgs;
		dojo.xhrPost({
			url: url,
			handleAs: "json",
			handle: function(r, io){
				response = r;
				ioArgs = io;
			},
			sync: true,
			contentType: "text/plain",
			postData: sData
		});
		if (ioArgs == undefined || ioArgs.xhr.status != 200) 
		{
			var owner = pe.scene.bean.getOwner();
			var user = pe.authenticatedUser.getId();
			if ((owner != user) && (!pe.scene.bean.getIsCommunityFile())) 
			{
				this.setWarningMsg(this.shareDoc.notTheAuthor);
				return false;
			}      	
			this.setWarningMsg(this.shareDoc.errorShareMsg);
			return false;
		}
		else
		{
			if(response)
			{
				var error_code = response.error_code;
				if (error_code && error_code == 1008) 
				{
					this.setWarningMsg(this.shareDoc.errorCommunityShareMsg);
					return false;                       
				}
				else if(error_code && error_code == 1009)
				{
					this.setWarningMsg(this.errorAcrossOrgMsg);
					return false;  
				}
			}				
			pe.scene.showTextMessage(this.shareDoc.successShareMsg,15000);
			var newUserInfo = ioArgs.query;
			this.publishShareSuccess(newUserInfo);
			if (this.userLiveName.model.status != stproxy.awareness.DND &&
				this.userLiveName.model.status != stproxy.awareness.DND_MOBILE &&
				this.userLiveName.model.status != stproxy.awareness.OFFLINE &&
				this.userLiveName.model.status != stproxy.awareness.NOT_USING)
			{
				this.userLiveName.startChat();
				stproxy.getChatModel(this.userLiveName.model.id, {"isIncoming":false}).sendMessage(this.successMessage);
			}
		}
		return true;
	},
	onNo: function (editor) {
		// Overridden
		return true;
	},
	publishShareSuccess: function(userInfo){
		var eventData = [{eventName:concord.util.events.presDocSceneEvents_eventName_docShare,newUserInfo:userInfo}];
		concord.util.events.publish(concord.util.events.presSceneEvents, eventData);
	}
});
dojo.provide("concord.widgets.social.SametimeStatusBar");
dojo.require("dojo.i18n");
dojo.require("concord.util.conditional");
dojo.require("concord.beans.ProfilePool");
dojo.requireLocalization("concord.widgets.social", "SametimeStatusBar");
dojo.declare("concord.widgets.social.SametimeStatusBar", null, {
	aSuccessRoot:null,
	aFailRoot:null,
	bLogging:false,
	ICONS:null,
	STATUS:null,
	STATES:null,
	scanCompleted:false,
	repl_string: null,
	blankGif:dijit._Widget.prototype._blankGif,
	COOKIE_NAME_STATUS:"docs.sametime.currentStatus",
	COOKIE_NAME_LOGOUT:"docs.sametime.userloggedOut",
	buddyListOpened:false,
	buddyListInited:false,
	constructor:function (isFromConn) 
	{
		if (isFromConn)
		{
			this.COOKIE_NAME_STATUS="lconn.profiles.sametime.currentStatus";
			this.COOKIE_NAME_LOGOUT = "lconn.profiles.sametime.userloggedOut";
		}
		this.repl_string = dojo.i18n.getLocalization("concord.widgets.social","SametimeStatusBar");
		this.aSuccessRoot = document.createElement('span');
		this.aFailRoot = document.createElement('span');
		dojo.addClass(this.aSuccessRoot,"docs_st_biz");
		dojo.addClass(this.aFailRoot,"docs_st_biz");
		this.ICONS = stproxy.uiControl.iconPaths;
		this.STATUS = stproxy.awareness;
		this.STATUS.DISCONNECT = '-1';
		this.STATES = {};
		this.STATES[this.STATUS.AVAILABLE] = [ this.ICONS.iconAvailable,this.repl_string.stStatusAvailable ];
		this.STATES[this.STATUS.AWAY] = [ this.ICONS.iconAway, this.repl_string.stStatusAway ];
		this.STATES[this.STATUS.DND] = [ this.ICONS.iconDnd, this.repl_string.stStatusdnt ];
		this.STATES[this.STATUS.IN_MEETING] = [ this.ICONS.iconInMeeting,this.repl_string.stStatusMeeting ];
		this.STATES[this.STATUS.OFFLINE] = [ this.blankGif, this.repl_string.stUserOffline ];
		this.STATES[this.STATUS.DISCONNECT] = [ this.blankGif, this.repl_string.stUserOffline ];
		var currentStatus = this.getStatus();
		this.renderTaskBar(this.STATUS.OFFLINE);
		
		window.DocsSametimeStatusBar = this;
		
		if (currentStatus == this.STATUS.DISCONNECT) 
		{
			if (dojo.config.isDebug)
				console.log('docs.st.onScriptload Existing page refresh with disconnect');
			return;
		} 
		else 
		{
			if (dojo.config.isDebug)
				console.log('docs.st.onScriptload Full Login');
			this.login();
		}
	},
	buddyListClosed: function() {
		this.buddyListOpened = false;
	},
	saveStatusCookie:function (stStatus) {
		dojo.cookie(this.COOKIE_NAME_STATUS, stStatus, {
			expires : 2,
			domain : stproxyConfig.domain,
			path : "/"
		});
		if (dojo.config.isDebug)
			console.log("docs.st.saveStatusCookie saved: " + stStatus + " in currentStatus cookie");
	},
	removeStatusCookie:function () {
		dojo.cookie(this.COOKIE_NAME_STATUS, null, {
			expires : -1,
			domain : stproxyConfig.domain,
			path : "/"
		});
		if (dojo.config.isDebug)
			console.log("docs.st.removeStatusCookie removed current status cookie");
	},
	openMenu: function (evt) 
	{
		if (dojo.config.isDebug)
			console.log("docs.st.openMenu called");
		try 
		{
			var actionsMenu = this.buildActionsMenu();
			openAround(actionsMenu,undefined,undefined,evt);
			dojo.stopEvent(evt);
		} 
		catch (e) 
		{
			console.log(e);
		}
	},
	trim: function(s)
	{
		var last=s.length-1;
		if(s.charAt(last)=="/"){
			return s;
		}
		return s+"/";
	},
	
	viewbuddylist: function()
	{
		var buddyWin =window.open(this.trim(stproxyConfig.server)+"stwebclient/popup.jsp#{%27disableXDomain%27:true}","stChatWindow","status=0,toolbar=0,location=0, menubar=0,width=350,height=550");
		buddyWin.focus();
		return false; 
	},
	buildActionsMenuItem:function (label, action, iconClass) 
	{
		var tempId = "ST_" + action;
		var temp2 = 
		{
			label : label,
			id : tempId
		};
		if (iconClass != null)
			temp2.iconClass = iconClass;
		var item = new dijit.MenuItem(temp2);
		item.action = action;
		dojo.addClass(item.domNode, "docsStMenuItem");
		return item;
	},
	buildActionsMenu:function () 
	{
		if (dojo.config.isDebug)
			console.log("docs.st.buildActionsMenu called");
		try 
		{
			var tempMenu = dijit.byId("STLoggedUserMenu");
			if (tempMenu != null)
				tempMenu.destroyRecursive();
		} 
		catch (exception1) 
		{
			console.log(exception1);
		}
		var actionsMenu = new dijit.Menu({id : "STLoggedUserMenu"});
		if (stproxy.isLoggedIn)
			actionsMenu.addChild(this.buildActionsMenuItem(this.repl_string.stDisconnect, "LOGOUT"));
		else
			actionsMenu.addChild(this.buildActionsMenuItem(this.repl_string.stConnect, "LOGIN"));
		actionsMenu.addChild(new dijit.MenuSeparator());
		actionsMenu.addChild(this.buildActionsMenuItem(this.repl_string.stStatusAvailable,
		"stStatusAvailable", "stproxy_statusIconAvailable"));
		actionsMenu.addChild(this.buildActionsMenuItem(this.repl_string.stStatusAway,
		"stStatusAway", "stproxy_statusIconAway"));
		actionsMenu.addChild(this.buildActionsMenuItem(this.repl_string.stStatusMeeting,
		"stStatusMeeting", "stproxy_statusIconMeeting"));
		actionsMenu.addChild(this.buildActionsMenuItem(this.repl_string.stStatusdnt,
		"stStatusdnt", "stproxy_statusIconDisturb"));
		if (dojo.config.isDebug)
			console.log("docs.st.buildActionsMenu menu options added");
		var temp = function(item) 
		{
			if (item != null) 
			{
				if (dojo.config.isDebug)
					console.log("docs.st.buildActionsMenu menu action invoke: "+ item.action);
				concord.util.conditional.hideDom('STLoggedUserMenu', false, true);
				if (item.action == "LOGOUT") 
				{
					this.saveStatusCookie(this.STATUS.DISCONNECT);
					//handling disconnect vs. handling connection logout
					return this.disconnect();
				} 
				else if (item.action == "LOGIN") 
				{
					this.saveStatusCookie(this.STATUS.AVAILABLE);
					return this.login();
				} 
				else if (item.action == "stStatusAvailable") 
				{
					this.saveStatusCookie(this.STATUS.AVAILABLE);
					if (stproxy.isLoggedIn)
						stproxy.status.set(this.STATUS.AVAILABLE,this.repl_string.stStatusAvailable);
					else
						this.login();
				} 
				else if (item.action == "stStatusAway") 
				{
					this.saveStatusCookie(this.STATUS.AWAY);
					if (stproxy.isLoggedIn)
						stproxy.status.set(this.STATUS.AWAY, this.repl_string.stStatusAway);
					else
						this.login();
				} 
				else if (item.action == "stStatusMeeting") 
				{
					this.saveStatusCookie(this.STATUS.IN_MEETING);
					if (stproxy.isLoggedIn)
						stproxy.status.set(this.STATUS.IN_MEETING,this.repl_string.stStatusMeeting);
					else
						this.login();
				} 
				else if (item.action == "stStatusdnt") 
				{
					this.saveStatusCookie(this.STATUS.DND);
					if (stproxy.isLoggedIn)
						stproxy.status.set(this.STATUS.DND, this.repl_string.stStatusdnt);
					else
						this.login();
						
				}
				dojo.byId("DocsStStatusArea").focus();
			}
			return;
		}
		dojo.connect(actionsMenu, "onItemClick",this ,temp);
		dojo.attr(actionsMenu, {
			href : 'javascript:;'
		});
		return actionsMenu;
	},
	getStatus:function () 
	{
		var currentStatus = parseInt(dojo.cookie(this.COOKIE_NAME_STATUS));
		if (!(currentStatus in this.STATES))
			currentStatus = this.STATUS.AVAILABLE;
		return currentStatus;
	},
	renderTaskBar:function (currentStatus) 
	{
		if (window.docsAwaressHideActionBar) 
			return;
		//var docBody = document.body;
		var htmlContent3 = '';
		//var newParentNode = document.createElement("span");
		var textContent = this.STATES[currentStatus][1];
		var iconURL = this.STATES[currentStatus][0];
		htmlContent3 = '<div id="docsSTActionBarContainer" class="docsSTActionBarContainer" style="z-index: 1000">'
		+ '<div class="docsSTActionBar" role="region" aria-label="' + this.repl_string.stActionBar + '">'
		+ '<button id="stStatusArea" style="display: none">fake one</button>'
		+ '<button id="DocsStStatusArea" class="docsSTBtn" onclick="window.DocsSametimeStatusBar.openMenu(event);" tabindex="0" role="button" aria-label="'
		+ textContent
		+ '" aria-describedby="STDescriptionID">'
		+ '<img alt="" src="'
		+ iconURL
		+ '" class="lotusStatus"/>&nbsp;'
		+ textContent
		+ '&nbsp;<img alt="" src="'
		+ this.blankGif
		+ '" class="lotusArrow lotusDropDownSprite" />'
		+ '<span class="lotusAltText">&#9660;</span>'
		+ '<span class="lotusAccess" id="STDescriptionID">'
		+ this.repl_string.stViewSTActions
		+ '</span>'
		+ '</button>'
		+ '<button id="launchPopupButton" class="docsSTBtn" onclick="window.DocsSametimeStatusBar.viewbuddylist();"  tabindex="0" role="button" aria-label="'
		+ this.repl_string.stViewClient
		+ '" aria-describedby="STchatDescriptionID">'
		+ '<img aria-label="'
		+ this.repl_string.stViewClient
		+ '" alt="" src="'
		+ window.contextPath
		+ window.staticRootPath
		+ "/images/footerChat.gif"
		+ '" />'
		+ '<span class="lotusAltText">'
		+ this.repl_string.stViewClient
		+ '</span>'
		+ '<span class="lotusAccess" id="STchatDescriptionID">'
		+ this.repl_string.stChatList
		+ '</span>'
		+ '</button>' + '</div>' + '</div>';
		this.aSuccessRoot.innerHTML = htmlContent3;
		document.body.appendChild(this.aSuccessRoot.firstChild);
		/*docBody.appendChild(newParentNode.firstChild);
		setTimeout(function() 
			{
				var footerNode = dojo.byId("lotusFooter");
				if (footerNode != null) {
					footerNode.appendChild(document.createElement("br"));
					footerNode.appendChild(document.createElement("br"));
				}
			}, dojo.byId("lotusFooter") ? 1000 : 1);
		if (dojo.config.isDebug)
			console.debug("docs.st.sametimeProxyInit logged in user menu link added");*/
		var statusArea = document.getElementById("DocsStStatusArea");
		var launchArea = document.getElementById("launchPopupButton");
		dojo.connect(statusArea,"onfocus",this,"focusWidget");
		dojo.connect(statusArea,"onblur",this,"blurWidget");
		dojo.connect(launchArea,"onfocus",this,"focusWidget");
		dojo.connect(launchArea,"onblur",this,"blurWidget");
	},
	focusWidget: function (event)
	{
		dojo.addClass(event.currentTarget,"key_navigating_light");
	},
	blurWidget: function (event)
	{
		dojo.removeClass(event.currentTarget,"key_navigating_light");
	},
	renderErrorBar:function ()
	{
		var htmlContent3 = '';
		//var newParentNode = document.createElement("span");
		htmlContent3 = '<div id="docsSTActionBarContainer" class="docsSTActionBarContainer" style="z-index: 1000">'
		+ '<div class="docsSTActionBar" role="region" aria-label="'+ this.repl_string.stActionBar + '">'
		+ '<span class="docsSTErrorBtn">'
		+ '<img src="<lc-ui:blankGif />" alt="" class="lotusIcon lotusIconMsgWarning docsSTErrorIcon">&nbsp;&nbsp;'
		+ this.repl_string.stErrorSTServer
		+ '</span>' + '</div>' + '</div>';
		this.aFailRoot.innerHTML = htmlContent3;
		/*docBody.appendChild(newParentNode.firstChild);
		setTimeout(function() 
			{
				var footerNode = dojo.byId("lotusFooter");
				if (footerNode != null) {
				footerNode.appendChild(document.createElement("br"));
				footerNode.appendChild(document.createElement("br"));
				}
			}, dojo.byId("lotusFooter") ? 1000 : 1);
		if (dojo.config.isDebug)
			console.debug("renderErrorBar: Error bar rendered (unable to reach ST server");*/
		return;
	},
	isLoggedOut:function () {
		var userLoggedOut = dojo.cookie(this.COOKIE_NAME_LOGOUT) == "true";
		if (dojo.config.isDebug)
			console.log("docs.st.isLoggedOut set to " + userLoggedOut);
		return userLoggedOut;
	},
	saveLogoutCookie:function () {
		dojo.cookie(this.COOKIE_NAME_LOGOUT, "true", {
		expires : 2,
		domain : stproxyConfig.domain,
		path : "/"
		});
		if (dojo.config.isDebug)
			console.log("docs.st.saveLogoutCookie saved logout cookie");
	},
	removeLogoutCookie: function () {
		dojo.cookie(this.COOKIE_NAME_LOGOUT, null, {
		expires : -1,
		domain : stproxyConfig.domain,
		path : "/"
		});
		if (dojo.config.isDebug)
			console.log("docs.st.removeLogoutCookie removed user.logggedOut cookie");
	},
	login:function () 
	{
		if (dojo.config.isDebug)
			console.log("docs.st.login called");
		if (!stproxy.login) { //wait one second
			console.error("login called before login method available");
			setTimeout(login, 1000);
			return;
		}
		this.removeLogoutCookie();
		//get the login id of the user from the page
		if (!stproxy.isLoggedIn) 
		{
			var currentStatus = this.getStatus();
			if (dojo.config.isDebug)
				console.log("docs.st.loginSametimeUser logging in lc user to st with st status: " + currentStatus);
			if (currentStatus == this.STATUS.OFFLINE || currentStatus == this.STATUS.DISCONNECT)
				return;
			stproxy.login.loginByToken(null, currentStatus,this.STATES[currentStatus][1], dojo.hitch(this,"onUserLogin"), dojo.hitch(this,"onUserLoginError"));
		}
	},
	onUserLoginError:function (errorMsg) 
	{
		if (dojo.config.isDebug)
			console.log("docs.st.loginUserError: An error has occured. Sametime error code: " + errorMsg);
	},
	onUserLogin: function(loggedInUserInfo) 
	{
		if (dojo.config.isDebug)
			console.log("docs.st.loginUserSuccess docs user logged into st");
		var loggedInUserDN = loggedInUserInfo.id;
		var model = stproxy.getLiveNameModel(loggedInUserDN);
		dojo.connect(model, "onUpdate", this,this.updateActiveUser);
		var menuItem = dijit.byId("ST_LOGIN");
		if (!menuItem)
			menuItem = dijit.byId("ST_LOGOUT");
		if (menuItem)
			dojo.attr(menuItem, "label", this.repl_string.stDisconnect);
		if (!this.scanCompleted)
		{
			//core.utilities.show('awarenessArea');
			this.scanPage();
		}
	},
	scanPage: function () 
	{
		var nodes = dojo.query(".IMAwarenessDisplayedUser");
		for ( var i = 0; i < nodes.length; i++) 
		{
			if (dojo.config.isDebug)
				console.log("docs.st.sametimeProxyAddLiveName looking for IMAwarenessDisplayedUser");
			var node = nodes[i];
			if (!dojo.hasClass(node, "hasSTStatus")) 
			{
				if (dojo.config.isDebug)
					console.log("docs.st.sametimeProxyAddLiveName found an IMAwarenessDisplayedUser without st awareness set");
				if (!stproxy.isLoggedIn) 
				{
					if (dojo.config.isDebug)
						console.log("docs.st.sametimeProxyAddLiveName lc/st user not logged in. removing any loading msg");
					var renderType = dojo.query(".renderType", node)[0].innerHTML;
					if (renderType == "Icon") 
					{
						var IMContentNode = dojo.query(".IMContent", node)[0];
						IMContentNode.innerHTML = "";
					}
				} 
				else 
				{
					var dnValue = dojo.query(".dn", node)[0].innerHTML;
					var renderType = dojo.query(".renderType", node)[0].innerHTML;
					var IMContentNode = dojo.query(".IMContent", node)[0];
					var livename = null;
					if (dojo.config.isDebug)
					{
						console.log("docs.st.sametimeProxyAddLiveName dn: " + dnValue);
						console.log("docs.st.sametimeProxyAddLiveName renderType: " + renderType);
					}
					if (renderType == "StatusMsg") 
					{
						livename = new sametime.LiveName({
							"userId" : dnValue
						});
						livename.disableHoverBizCard = true;
					} 
					else if (renderType == "Icon") 
					{
						var userId = dojo.query(".uid", node)[0].innerHTML;
						livename = new sametime.LiveName({
							"userId" : dnValue,
							"uid" : userId
						});
						livename.disableHoverBizCard = true;
					} 
					else if (renderType == "Name") 
					{
						var displayName = dojo.query(".fn", node)[0].innerHTML;
						var userId = dojo.query(".uid", node)[0].innerHTML;
						livename = new sametime.LiveName({
							"userId" : dnValue,
							"displayName" : displayName,
							"uid" : userId
						});
						livename.disableClicks = true;
						livename.disableHoverBizCard = true;
					}
					dojo.connect(livename.model,"onUpdate", this, function() {
						if (dojo.config.isDebug)
							console.log("lc.st.sametimeProxyAddLiveName st onUpdate called for: " + dnValue);
						//var foo = stproxy.getLiveNameModel(userId, false, true);
						//var statusmessage = foo.statusMessage
						if (renderType == "StatusMsg")
							this.createSTStatusMsgLinkAction(livename, dnValue,IMContentNode);
						if (renderType == "Icon")
							this.createSTIconLinkAction(livename,dnValue, IMContentNode);
						else if (renderType == "Name") 
						{
							if (livename.domNode|| livename.domNode != "") 
							{
								IMContentNode.innerHTML = "";
								IMContentNode.appendChild(livename.domNode);
							}
						}
					});
					if (livename.model != null) 
					{
						if (dojo.config.isDebug)
						console.log("lc.st.sametimeProxyAddLiveName setting initial st awanareness for: " + dnValue);
						if (renderType == "StatusMsg")
							this.createSTStatusMsgLinkAction(livename, dnValue,IMContentNode);
						else if (renderType == "Icon")
							this.createSTIconLinkAction(livename, dnValue,IMContentNode);
						//this.bizcardSpecial(livename, node, dnValue);
					}
					dojo.addClass(node, "hasSTStatus");
					this.scanCompleted = true;
				}
			}
		}
		if (dojo.config.isDebug)
		console.log("lc.st.sametimeProxyAddLiveName ended");
	},
	updateActiveUser:function (model) 
	{
		if (dojo.config.isDebug)
			console.log("docs.st.updateLoggedUserArea called");
		//var headerUserName = dojo.byId("headerUserName");
		//Inside IBM Docs, maybe we could assume that the user is permitted, if the code been excuted into here?
		//var hasUsername = core.auth.isAuthenticated();
		var hasUsername = true;
		if (hasUsername && model != null && model.status != null) 
		{
			if (model.status != this.STATUS.OFFLINE)
				this.saveStatusCookie(model.status);
			if (dojo.config.isDebug)
				console.log("docs.st.updateLoggedUserArea setting up the logged in user header");
			try {
				var DocsStStatusArea = dojo.byId("DocsStStatusArea");
				var htmlContent3 = '';
				var textContent = "";
				var loadUrl = stproxyConfig.server;
				var iconURL = this.ICONS.iconAvailable;
				var currentStatus = model.status;
				if (dojo.config.isDebug)
					console.log("docs.st.updateLoggedUserArea current status : " + currentStatus);
				if (currentStatus == this.STATUS.AVAILABLE)
					textContent = this.repl_string.stStatusAvailable;
				else if (currentStatus == this.STATUS.AWAY) 
				{
					textContent = this.repl_string.stStatusAway;
					iconURL = this.ICONS.iconAway;
				} 
				else if (currentStatus == this.STATUS.IN_MEETING) 
				{
					textContent = this.repl_string.stStatusMeeting;
					iconURL = this.ICONS.iconInMeeting;
				} 
				else if (currentStatus == this.STATUS.DND) 
				{
					textContent = this.repl_string.stStatusdnt;
					iconURL = this.ICONS.iconDnd;
				} 
				else if (currentStatus == this.STATUS.OFFLINE) 
				{
					iconURL = this.blankGif;
					textContent = this.repl_string.stUserOffline;
				}
				htmlContent3 = '<img aria-label="'
				+ textContent
				+ '" alt="" src="'
				+ iconURL
				+ '" '
				+ (dojo.isChrome ? 'style="padding-bottom:3px"' : '')
				+ '/> '
				+ textContent
				+ '&nbsp;<img aria-label="'
				+ this.repl_string.stViewSTActions
				+ '" alt="" src="'
				+ this.blankGif
				+ '" class="lotusArrow lotusDropDownSprite" /><span class="lotusAltText">&#9660;</span>'
				+ '<span class="lotusAccess" id="STDescriptionID">'
				+ this.repl_string.stViewSTActions + '</span>';
				DocsStStatusArea.innerHTML = htmlContent3;
				DocsStStatusArea.setAttribute("aria-label", textContent);
			} 
			catch (exception1) 
			{
				console.error("docs.st.updateLoggedUserArea error: " + exception1);
			}
			if (dojo.config.isDebug)
				console.log("docs.st.updateLoggedUserArea setting up the logged in user header complete");
		}
	},
	ensureTrailingSlash:function (s) {
		var lastIndex = s.length - 1;
		if (s.charAt(lastIndex) == "/")
			return s;
		return s + "/";
	},
	disconnect:function () {
		if (dojo.config.isDebug)
			console.log("docs.st.disconnect called");
		stproxy.login.logout(true, dojo.hitch(this,"disconnectCallBack"), dojo.hitch(this,"disconnectErrorHandler"));
	},
	disconnectErrorHandler:function (errorMsg) 
	{
		console.log("docs.st.disconnectErrorHandler: An Error has occured. Sametime error code: " + errorMsg);
	},
	disconnectCallBack:function () 
	{
		if (dojo.config.isDebug)
			console.log("docs.st.disconnectCallBack called");
		var menuItem = dijit.byId("ST_LOGOUT");
		if (menuItem == null)
			menuItem = dijit.byId("ST_LOGIN");
		if (menuItem != null)
			dojo.attr(menuItem, "label", this.repl_string.stConnect);
	},
	onLogout:function()
	{
		var dfd = new dojo.Deferred();
		if(window.stproxy && window.stproxy.isLoggedIn)
			this.logout(true);
		// Allow for the st proxy logout to finish
		setTimeout(function(){dfd.callback();},1000);
		return dfd;
	},
	onLogin:function()
	{
		// clean cookies on login
		this.removeStatusCookie();
		this.saveLogoutCookie();
	},
	logout:function(isRealLogout) 
	{
		if (dojo.config.isDebug)
			console.log("docs.st.logout called");
		stproxy.login.logout(isRealLogout,dojo.hitch(this,"logoutCallBack"),dojo.hitch(this,"logoutErrorHandler"));
	},
	logoutErrorHandler: function(errorMsg) 
	{
		console.log("docs.st.logoutErrorHandler: An Error has occured. Sametime error code: " + errorMsg);
	},
	logoutCallBack: function() 
	{
		if (dojo.config.isDebug)
			console.log("docs.st.logoutCallBack called");
		this.removeStatusCookie();
		this.saveLogoutCookie();
		var menuItem = dijit.byId("ST_LOGOUT");
		if (menuItem == null)
			menuItem = dijit.byId("ST_LOGIN");
		if (menuItem != null)
			dojo.attr(menuItem, "label", this.repl_string.stConnect);
	},
	createSTStatusMsgLinkAction: function (livename, dnValue, IMContentNode) 
	{
		if (dojo.config.isDebug)
			console.log("docs.st.createSTStatusMsgLinkAction called");
		var className = stproxy.uiControl.status[livename.model.status].iconClass;
		if (livename.model.status == STATUS.OFFLINE) 
		{
			if (dojo.config.isDebug)
				console.log("docs.st.createSTStatusMsgLinkAction displayed user not logged in. removing the loading msg");
			var span = document.createElement('span');
			span.innerHTML = "&nbsp;" + strings.stNoStatuAvailable;
			dojo.addClass(span, className);
			IMContentNode.innerHTML = "";
			IMContentNode.appendChild(span);
		} 
		else 
		{
			if (dojo.config.isDebug)
				console.log("docs.st.createSTStatusMsgLinkAction setting up the status link for" + dnValue);
			var a = document.createElement('a');
			//might have to use #. IE has issue with using javascript in href
			dojo.attr(a, {
				href : 'javascript:;',//stproxy.openChat(\'' + livename.model.id + '\'); return false;','class':'awareness',
				title : livename.model.statusMessage,
				'aria-label' : livename.model.statusMessage,
				'aria-describedby' : "STIConDescriptionID",
				innerHTML : getHTMLContent(livename, true)
			});
			var temp = function(evt) {
				if (dojo.config.isDebug)
					console.log("docs.st.createSTStatusMsgLinkAction openChat called for" + livename.model.id);
				stproxy.openChat(livename.model.id);
				dojo.stopEvent(evt);
				return false;
			};
			dojo.connect(a, "onclick", temp);
			IMContentNode.innerHTML = "";
			IMContentNode.appendChild(a);
		}
	},
	createSTIconLinkAction: function (livename, dnValue, IMContentNode) {
		if (livename.model.status == this.STATUS.OFFLINE) 
		{
			if (dojo.config.isDebug)
				console.log("docs.st.createSTIconLinkAction displayed user not logged in. removing the loading msg");
			IMContentNode.innerHTML = "";
		} 
		else 
		{
			if (dojo.config.isDebug)
				console.log("docs.st.createSTIconLinkAction setting up the status link for" + dnValue);
			var a = document.createElement('a');
			//var className =stproxy.uiControl.status[livename.model.status].iconClass;
			//might have to use #. st proxy has issue with using javascript in href
			dojo.attr(a, {
				href : 'javascript:;',//javascript:stproxy.openChat(\'' + dnValue + '\'); return false;', 'class':'awareness',
				title : livename.model.statusMessage,
				'aria-label' : livename.model.statusMessage,
				style : "text-decoration: none !important; float: left",
				'aria-describedby' : "STIConDescriptionID",
				innerHTML : getHTMLContent(livename, false)
			});
			var temp = function(evt) {
				if (dojo.config.isDebug)
				console.log("docs.st.createSTIconLinkAction openChat called for" + dnValue);
				stproxy.openChat(dnValue);
				dojo.stopEvent(evt);
				return false;
			};
			dojo.connect(a, "onclick", temp);
			IMContentNode.innerHTML = "";
			IMContentNode.appendChild(a);
		}
	}
});
