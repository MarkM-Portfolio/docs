/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.widgets.social.conditionRenderer");
dojo.require("dojo.i18n");
dojo.require("concord.util.uri");
dojo.require("concord.widgets.social.profileProvider");
dojo.require("concord.widgets.social.externalprofileProvider");
dojo.require("concord.widgets.social.BIZCardProvider");
dojo.require("concord.widgets.social.STProvider");
dojo.require("concord.widgets.sidebar.UnifiedEditorToken");

dojo.declare("concord.widgets.social.conditionRenderer", null, {
	//bInit: false,
	//bProfileAvailable:false,
	//bBIZCardAvailable:false,
	//bSTAvailable:false,
	profileProvider:null,
	BIZCardProvider:null,
	STProvider:null,
	unifiedTokenMap:null,
	constructor: function(initalParam) 
	{
		if (!initalParam)
		{
			initalParam = {
				profile:null,
				BIZCard:null,
				ST:null
			};
			
		}
		else
		{
			if (initalParam.profile=="null")
				initalParam.profile = null;
			else
				initalParam.profile = dojo.fromJson(initalParam.profile);
				
			if (initalParam.BIZCard=="null")
				initalParam.BIZCard = null;
			else
			{
				initalParam.BIZCard =  dojo.fromJson(initalParam.BIZCard);
				{
					var cssURI = window.contextPath+window.staticRootPath+'/styles/css/conflict/package3_prefixed.css';
					var elem = document.createElement('link');
					elem.rel = 'stylesheet';
					elem.type = 'text/css';
					elem.href = cssURI;
					elem.media = "screen";
					document.getElementsByTagName('head')[0].appendChild(elem);
				}
				{
					var cssURI = window.contextPath+window.staticRootPath+'/styles/css/conflict/sprites_prefixed.css';
					var elem = document.createElement('link');
					elem.rel = 'stylesheet';
					elem.type = 'text/css';
					elem.href = cssURI;
					elem.media = "screen";
					document.getElementsByTagName('head')[0].appendChild(elem);
				}
				{
					var cssURI = window.contextPath+window.staticRootPath+'/styles/css/conflict/default_prefixed.css';
					var elem = document.createElement('link');
					elem.rel = 'stylesheet';
					elem.type = 'text/css';
					elem.href = cssURI;
					elem.media = "screen";
					document.getElementsByTagName('head')[0].appendChild(elem);
				}
			}
			if (initalParam.ST=="null" || concord.util.conditional.identifyCIORequest())
				initalParam.ST = null;
			else
			{
				initalParam.ST = dojo.fromJson(initalParam.ST);
				var cssURI = window.contextPath+window.staticRootPath+'/styles/css/conflict/WebClientAll_prefixed.css';
				var elem = document.createElement('link');
				elem.rel = 'stylesheet';
				elem.type = 'text/css';
				elem.href = cssURI;
				elem.media = "screen";
				document.getElementsByTagName('head')[0].appendChild(elem);
			}
		}
		var bSTAvailable = initalParam.ST != null;
		if (gIs_cloud)
		{
			var serverPrefix;
			var bMeetAvailable = true;
			if (initalParam.profile) {
				serverPrefix = window.location.protocol == 'https:' ? initalParam.profile.ssl_root : initalParam.profile.root;
			} else {
				serverPrefix = "";
				bMeetAvailable = false;
			}
			window.gllConnectionsData = {
				srvUrls : {
					meeting: serverPrefix + "/meetings",
					ic_profiles_view:serverPrefix + "/profiles/html/profileView.do?userid={id}&lang={lang}"
				},
				entitlements : {
					imenabled: bSTAvailable  && concord.util.conditional.entitilementVerification('bh_chat'),
					meeting: bMeetAvailable && concord.util.conditional.entitilementVerification('bh_meetings')
				},
				locale: g_locale,
				disableSTWidget: false,
				appName:"docs"
			};
		}
		if (!gIs_cloud && concord.util.uri.isExternal())
		{
			this.profileProvider = new concord.widgets.social.externalprofileProvider(initalParam.externalprofile);
		}
		else		
		{
			this.profileProvider = new concord.widgets.social.profileProvider(initalParam.profile);	
		}		
		this.BIZCardProvider = new concord.widgets.social.BIZCardProvider(initalParam.BIZCard);
		this.STProvider = new concord.widgets.social.STProvider(initalParam.ST);
		this.unifiedTokenMap = {};
	},
	renderUserIcon: function(item)
	{
		if (!(item.UID in this.unifiedTokenMap))
		{
			var data = {
				'unifiedToken': null,
				'dealStack':[],
				'isInBusy':false
			};
			this.unifiedTokenMap[item.UID] = data;
		}
		var container = document.createElement("span");
		this.STProvider.generateSTStatus(item,container);
		return container;
	},
	replaceIcon: function(item)
	{
		this.profileProvider.replaceIcon(item);
	},
	generateHover: function(item,container)
	{
		if (!gIs_cloud && concord.util.uri.isExternal()){
			return this.profileProvider.generateHover(item,container);
		}
		return this.BIZCardProvider.generateHover(item,container);
	},
	renderSTAwareness: function(container)
	{
		this.STProvider.renderSTAWareness(container);
	},
	registerUnifiedToken: function(uid,unifiedToken)
	{
		this.unifiedTokenMap[uid].isInBusy = true;
		this.unifiedTokenMap[uid].unifiedToken = unifiedToken;
		while (this.unifiedTokenMap[uid].dealStack.length)
		{
			unifiedToken.generateClone(this.unifiedTokenMap[uid].dealStack.pop());
		}
		this.unifiedTokenMap[uid].isInBusy = false;
	},
	getUserTokenByUUID: function (UUID,container)
	{
		if (!(UUID in this.unifiedTokenMap))
		{
			var data = {
				'unifiedToken': null,
				'dealStack':[],
				'isInBusy':false
			};
			this.unifiedTokenMap[UUID] = data;
		}
		
		if (!container)
		{
			container = document.createElement('span');
			dojo.addClass(container,'unified_editor');
		}
		
		if (this.unifiedTokenMap[UUID].isInBusy == false)
		{
			if (this.unifiedTokenMap[UUID].unifiedToken)
				this.unifiedTokenMap[UUID].unifiedToken.generateClone(container);
			else
				this.unifiedTokenMap[UUID].dealStack.push(container);
		}
		else
		{
			setTimeout(dojo.hitch(this,"getUserTokenByUUID",UUID,container),this.unifiedTokenMap[UUID].dealStack.length*500+1000);
		}
		
		return container;
	},
	unbindUserTokenBeforeDesctroy: function (domNode)
	{
		if (domNode && domNode.userTokenMessageHandler)
			dojo.unsubscribe(domNode.userTokenMessageHandler);
	},
	grabSTBarFocus: function ()
	{
		this.STProvider.grabFocus(true);
		this.BIZCardProvider.preventFocusRestore();
	},
	isPreventFocusRestore: function()
	{
		return this.BIZCardProvider.isPreventFocusRestore();
	}
});

