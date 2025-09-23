/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.ACL.UserHandler");

dojo.require("concord.beans.EditorStore");
dojo.require("concord.beans.EditorStoreListener");
dojo.require("websheet.listener.BroadCaster");
dojo.require("concord.widgets.social.conditionRenderer");
dojo.require("concord.widgets.sidebar.EditorToken");
dojo.requireLocalization("websheet.ACL","UserHandler");

dojo.declare("websheet.ACL.UserHandler", [concord.beans.EditorStoreListener, websheet.listener.BroadCaster], {
	
	//it's a listener and also a BroadCaster
	// 1) As a listener: it would listen to the editor add message, if this user never joined, which means
	//    he/she never been assigned the highlight color, then after user joined, need to update the userIcon
	// 2) As a broadcaster: when a never joined user added, notify all the userIconList to update.
	
	_users: null, 		  // all the editable users of the current doc, including all the shared users

	_url	 : null,      // the url to get the userList from server side
	
	_cfUrl	 : null,      // if the file is community file, get the member from other community api
	
	_maxCMNum: 1000,      // the max community member's number we get
	
	defaultColor: "#d3d3d3", // used for the user never joined
	
	constructor: function(aclHandler)
	{
		this.aclHandler = aclHandler;
		this._users = {};
		this.initUsers();
		this._url = concord.util.uri.getDocUri() + '?method=getUserList&permission=edit';
    	if (window.g_isCommentExternal) {
    		var url = concord.util.uri.getAtUsersUri();
    		if (url != ""){
    			this._url = url + "?name=&maxlimit=" + this._maxCMNum;
    		}
    	}
		
		if(pe.scene.bean.getIsCommunityFile())
			this._cfUrl = "/communities/service/atom/community/members?ps=1000&communityUuid=" + pe.scene.bean.e.community_id;
		
		if(!window.conditionRenderer)
		{
			var initStaticRender = function () {
				if(!window.conditionRenderer)
					window.conditionRenderer = new concord.widgets.social.conditionRenderer(window.renderParams);
			};
			concord.util.conditional.processUntilAvailable(initStaticRender, null,"window.renderParams!='undefined'",	null, false);
		}	
	    this.store = pe.scene.getEditorStore();
	    this.store.registerListener(this);
	    this.nls = dojo.i18n.getLocalization("websheet.ACL","UserHandler");
	    
		var self = this;
		setTimeout(function(){
			self.getAllUsers(false);
		},100);
	},
	
	initUsers: function()
	{
		var editors = pe.scene.editors.getAllEditors();
		var cnt = editors.items.length;
		for(var i = 0; i < cnt; i++)
		{
			var user = editors.items[i];
			this._users[user.userId] = user;
		}
	},
	
	getAllUsers: function(sync)
	{
		if(pe.scene.bean.getIsCommunityFile())
			this.getCommunityMembers(sync);
		else
			this.getDocEditors(sync);
		//here set flag isMe as true, just for userMultiSelector
		var curUserId = this.getCurrentUserId();
		var curUser = this._users[curUserId];
		if(curUser)
			curUser.isMe = true;
		return this._users;
	},
	
	
	//for personal files, get all the editors from docs server
	getDocEditors: function(sync)
	{
		if(!sync) sync = false;
		
		var self = this;
		var callback = function(r, io) {
			var response = r, ioArgs = io;
			if (response instanceof Error) {
				console.log('UserHandler.js: Cannnot get editors from server');
			}

			if(response && response.items)
			{
				var items = response.items;
				var hasNew = false;
				for(var i = items.length -1; i >= 0; i-- )
				{
					var item = items[i];
					// this is a user never joined
					if(!self._users[item.userid])
					{
						var user = {
								userId     : item.userid,
								displayName: item.name,
								email	   : item.member,
								color	   : self.defaultColor
						};
						self._users[item.userid] = user;
						hasNew = true;
					}
				}
				var pane = self.aclHandler.getPermissionPane();
				if(pane && hasNew)
				{
					pane._users = self._users;
					var pmWidget = pane._newPermissionWidget;
					pmWidget.postLoadUsers(self._users);
				}
			}
		};
		var _timeout = window.g_isCommentExternal ? 10000: 5000;
		dojo.xhrGet({
			 url: this._url,
			 timeout: _timeout,
			 handleAs: "json",
			 handle: callback,
			 sync: sync,
			 preventCache: true,
			 noStatus: true
		});
	},
	/**
	 * from the xml to get the community members info 
	 * 1) total count
	 * 2) all the members info
	 */
	_parseXml: function(/*xml dom tree*/xml)
	{
		if(!xml || !xml.firstChild) return;
		
		// 1 total count
		var total = dojo.query("totalResults",xml);
		if(total.length > 0)
			this.CMCount = parseInt(total[0].innerHTML || total[0].textContent);
		var entrys = dojo.query("entry", xml);
		var cnt = entrys.length;
		for(var i = 0; i < cnt; i++)
		{
			var entry = entrys[i];
			var contributor = dojo.query("contributor",entry)[0];
			//should not happen
			if(!contributor) continue;
			//Here to ignore the group member, only keep
			var categorys = dojo.query("category[term='person']",entry);
			if(categorys.length == 0) continue;
			
			var user = {color:this.defaultColor};
			var userId = dojo.query("userid", contributor);
			if(userId.length > 0)
				user.userId = userId[0].innerHTML || userId[0].textContent;
			
			if(this._users[user.userId]) continue;
			
			var name = dojo.query("name", contributor);
			if(name.length > 0)
				user.displayName = name[0].innerHTML || name[0].textContent;
			var email = dojo.query("email", contributor);
			if(email.length > 0)
				user.email = email[0].innerHTML || email[0].textContent;
			
			this._users[user.userId] = user;
		}	
	},
	
	
	getCommunityMembers: function(sync)
	{
		if(!this._cfUrl || this._loadedCM) return;
		
		if(!sync) sync = false;
		
		var response, ioArgs;
		var t1 = (new Date()).getTime();
		var self = this;
		var callback = function(r, io) {
			console.log("enter  getCommunityMembers call back, _loadedCM is " + self._loadedCM);
			if(self._loadedCM) return;
			response = r; ioArgs = io;
			self._parseXml(r);
			var t2 = (new Date()).getTime();
			console.log("getCommunityMembers cost time " + (t2-t1));
			self._loadedCM = true;
			var pane = self.aclHandler.getPermissionPane();
			if(pane)
			{
				pane._users = self._users;
				var pmWidget = pane._newPermissionWidget;
				pmWidget.postLoadUsers(self._users);
			}
		};			
		dojo.xhrGet({
			 url: this._cfUrl,
			 timeout: 5000,
			 handleAs: "xml",
			 handle: callback,
			 sync: sync,
			 noStatus: true
		});	
	},
	
	getDocOwnerId: function()
	{
		return pe.scene.bean.getOwner();
	},
	
	getCurrentUserId: function()
	{
		return  pe.authenticatedUser.getId();
	},
	
	isCurrentUserDocOwner: function()
	{
//		return pe.authenticatedUser.isOwner();
		return this.getCurrentUserId() == pe.scene.getDocBean().getOwner();
	},
	
	getUserNameById: function(userId)
	{
		if(!this._users) return "";
		var user = this._users[userId];
		if(!user) return "";
		return user.displayName;
	},
	
	getEveryOneIconNode: function(userId)
	{
		if(!this._everyIconNode)
		{
			this._everyIconNode = dojo.create("span");
			dojo.addClass(this._everyIconNode, "unified_editor");
			
			var div = dojo.create("div", null, this._everyIconNode);
			dojo.addClass(div,"default_photo_contianer default_photo_base everyOneIcon");
			this._everyIconNode.title = this.nls.EVERYONE;
			dojo.attr(this._everyIconNode,"tabindex","0");
			dijit.setWaiRole(this._everyIconNode,"img");
		}

		return dojo.clone(this._everyIconNode);
	},
	
	getEveryoneExceptMeIconNode: function()
	{
		if(!this._everyExceptMeIconNode)
		{
			this._everyExceptMeIconNode = dojo.create("span");
			dojo.addClass(this._everyExceptMeIconNode, "unified_editor");
			
			var div = dojo.create("div", null, this._everyExceptMeIconNode);
			dojo.addClass(div,"default_photo_contianer default_photo_base everyOneExcepteMeIcon");
			this._everyExceptMeIconNode.title = this.nls.EVERYONE_EXCEPT_ME;
			dojo.attr(this._everyExceptMeIconNode,"tabindex","0");
			dijit.setWaiRole(this._everyExceptMeIconNode,"img");
		}
		return dojo.clone(this._everyExceptMeIconNode);
	},
	
	getUserIconNode: function(userId)
	{
		if(userId.toLowerCase() == "everyone")
			return this.getEveryOneIconNode();
		else if(userId == "everyoneExceptMe")
			return this.getEveryoneExceptMeIconNode();
		
		var node = window.conditionRenderer.getUserTokenByUUID(userId);
		if(node.childElementCount == 0)
		{
			var user = this._users[userId];
			var editorLI = document.createElement('li');
			var param = {
					userId   : user.userId,
					userName : user.displayName  ,
					userColor: user.color,
					colorOn  : false,
					li		 : editorLI,
					email    : user.email
			};
			var editorToken = new concord.widgets.sidebar.EditorToken(param);
			if(editorToken.domNode)
				editorLI.insertBefore(editorToken.domNode,editorLI.firstChild);
			node = window.conditionRenderer.getUserTokenByUUID(userId);
		}
		if(node)
		{
			node.title = this.getUserNameById(userId);
			dojo.attr(node,"tabindex","0");
			dijit.setWaiRole(node,"img");
		}	
		return node;
	},
	
	
	editorsUpdated: function()
	{
		var needUpdate = false;
		for(var id in this._users)
		{
			var user = this._users[id];
			if(user.color == this.defaultColor)
			{
				var editor = this.store.getEditorById(id);
				this._users[id] = editor.toJSObj();
				user = this._users[id];
				var editorLI = document.createElement('li');
				var param = {
						userId   : user.userId,
						userName : user.displayName  ,
						userColor: user.color,
						colorOn  : false,
						li		 : editorLI,
						email    : user.email
				};
				var editorToken = new concord.widgets.sidebar.EditorToken(param);
				if(editorToken.domNode)
					editorLI.insertBefore(editorToken.domNode,editorLI.firstChild);
				needUpdate = true;
			}	
		}	
		if(needUpdate)
		{
			var self = this;
			//here use setTimeout to make sure the new editorToken had been added to the conditionRenderMap
			setTimeout( function(){self.broadcast(self._users)}, 1000);
		}	
	},
	
	//currently no use, the editor Store do not broadcast when editor added
	editorAdded: function (editor)
	{
		var id = editor.getEditorId();
		var user = this._users[id];
		if(!user)
		{
			this._users[id] = editor.toJSObj();
			return;
		}
		//this user never joined but maybe been assigned permission
		if(user.color == this.defaultColor)
		{
			this._users[id] = editor.toJSObj();
			this.broadcast(editor);
		}	
	},
	
	editorRemoved: function (editorId)
	{
	}
});