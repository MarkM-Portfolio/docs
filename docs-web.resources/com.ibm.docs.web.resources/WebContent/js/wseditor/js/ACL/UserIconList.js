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

dojo.provide("websheet.ACL.UserIconList");
dojo.require("dijit.form.Button");
dojo.require("websheet.listener.Listener");

dojo.declare("websheet.ACL.UserIconList",[dijit._Widget,websheet.listener.Listener],{
	
	
	fixed: true,
	_users: null,
	_userHandler: null,
	_needListening: false, // if the userIconList contain some user who never join the session, which means it's color is default
						   // then when this kind of user joined, need to be notified, and change its icon
	_subHandler: null,
	
	nodeWidth: 37,    // for each UserIcon, the node size, including the margin
	nodeHight: 34,
	nodeBottomMargin: 4, 
	MaxLineNum: 3,      // if icon list lines more than the MaxLineNum, would show the scroll bar
	
	constructor: function(args)
	{
		if(args && args.fixed == false)
		{
			this._subHandler = dojo.subscribe("UserIconChange", dojo.hitch(this,this.updateUsers));
		}	
		this._userHandler = pe.scene.editor.getACLHandler().getUserHandler();
		this._userHandler.addListener(this);
	},
	
	postCreate: function()
	{
		this.inherited(arguments);
		try{
			var userListDiv = dojo.create("div",null,this.domNode);
			dojo.addClass(userListDiv, "userIconList");
			this.userList = dojo.create("ul",null, userListDiv);
			var buttonDiv = dojo.create("div",null, this.domNode);
			buttonDiv.style.display = "none";
			this.button = new dijit.form.Button({onClick: dojo.hitch(this,this._toggle)});
			buttonDiv.appendChild(this.button.domNode);
		}catch(e)
		{
			console.log(e);
		}
		
	},
	
	destroy: function()
	{
		this.domNode.innerHTML = "";
		this._userHandler.removeListener(this);
		if(this._subHandler)
			dojo.unsubscribe(this._subHandler);
	},
	
	_toggle: function()
	{
		
	},
	
	getLastIconNode: function()
	{
		if(this.userList.lastChild)
			return this.userList.lastChild.firstChild;
		return null;
	},
	
	
	removeAll: function()
	{
		this.userList.innerHTML = "";
	},
	
	updateHeight: function()
	{
		var containerWidth = this.domNode.offsetWidth;
		var numPerLine = Math.floor(containerWidth/this.nodeWidth);
		var lines = Math.ceil(this._users.length/numPerLine);
		var height = lines * this.nodeHight + (lines -1) * this.nodeBottomMargin;
		this.userList.style.height = height + "px";
		
		var maxHeight = this.MaxLineNum * this.nodeHight + (this.MaxLineNum-1) * this.nodeBottomMargin;
		maxHeight = Math.min(height,maxHeight);
		this.domNode.style.height = maxHeight + "px";
		if(lines <= this.MaxLineNum)
			dojo.removeClass(this.domNode,"userIconListContainer");
		else
			dojo.addClass(this.domNode,"userIconListContainer");
	},
	
	updateUsers: function(args)
	{
		this._users = args.users;
		this.removeAll();
		var len = this._users.length;
		for(var i = 0; i < len; i++)
		{
			var user = this._users[i];
			var iconNode = this._userHandler.getUserIconNode(user.id);
			if(this._subHandler)
			{
//				dojo.removeAttr(iconNode,"tabindex");
			}	
			var li = dojo.create("li", null,this.userList);
			li.appendChild(iconNode);
			if(user.color == this._userHandler.defaultColor)
				this._needListening = true;
		}

		if(len == 0)
			this.domNode.parentNode.style.display = "none";
		else
			this.domNode.parentNode.style.display = "";
		this.updateHeight();
	},
	
	notify: function(userHandler, allUsers)
	{
		if(!this._needListening) return;
		var len = this._users.length;
		var needUpdate = false;
		for(var i = 0; i < len; i++)
		{
			var user = this._users[i];
			if(user.color != allUsers[user.id].color)
			{
				needUpdate = true;
				user.color = allUsers[user.id].color;
			}	
		}	
		if(needUpdate)
			this.updateUsers({users: this._users});
	}
});