/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.widgets.sidebar.EditorsPane");
dojo.require("dojo.i18n");
dojo.require("concord.beans.EditorStore");
dojo.require("concord.widgets.sidebar.EditorToken");
dojo.require("dijit.layout.ContentPane");
dojo.require("dojox.grid.DataGrid");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("concord.util.events");
dojo.require("concord.util.acf");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.widgets.sidebar","SideBar");

dojo.declare("concord.widgets.sidebar.orderedFormatter", [],{
	activeIds: null,
	inactiveIds:null,
	servingDom:null,
	nActiveCount:0,
	myEditorItem:null,
	registeredUsers:null,
	constructor:function(dom) {
		this.servingDom = dom?dom:null;
		this.activeIds = {};
		this.inactiveIds = {};
		dojo.subscribe("com.ibm.concord.sidebar.colorIndicatorTurning",dojo.hitch(this,"_turnColor"));
	},
	  userJoined: function(editor)
	  {
		  var id = editor.getId();
		  var dom = null;
		  var user = null;
		  if (this.inactiveIds[id])
		  {
			  user = this.inactiveIds[id];
			  delete this.inactiveIds[id];
			  this.servingDom.removeChild(user.dom);
		  }
		  else if (this.activeIds[id])
		  {
			  //There must be something wrong, in-match status: Joined user join again
			  //No, it is not wrong, but updating the join time...
			  user = this.activeIds[id];
			  delete this.activeIds[id];
			  this.servingDom.removeChild(user.dom);
			  this.nActiveCount--;
		  }
		  else
		  {
			//There must be something wrong, in-match status: non-added user join
			var temp_editor = {};
			temp_editor.userId = editor.getId();
			temp_editor.orgId = editor.getOrgId();
			temp_editor.displayName = editor.getName();
			user = this._editorAdded(new concord.beans.EditorItem(temp_editor));
		  }
		  this._userJoin(user);
		  this.nActiveCount++;
	  },
	  
	  _userJoin: function (user)
	  {
		  if (!this.servingDom)
			  return;
			  
		  this.servingDom.insertBefore(user.dom,this.servingDom.firstChild);
		  this.activeIds[user.id] = user;
		  user.token.sessionOnline();
	  },
	  
	  _userLeft: function(user)
	  {
		  if (!this.servingDom)
			  return;
		  this.servingDom.appendChild(user.dom);
		  this.inactiveIds[user.id] = user;
		  user.token.sessionOffline();
	  },
	  getActiveCount: function() 
	  {
		return this.nActiveCount<0?0:this.nActiveCount;
	  },
	  userLeft: function(editor)
	  {
		  var id = editor.getId();
		  var dom = null;
		  var user = null;
		  if (this.activeIds[id])
		  {
			  user = this.activeIds[id];
			  delete this.activeIds[id];
			  this.servingDom.removeChild(user.dom);
		  }
		  else if (this.inactiveIds[id])
		  {
			//There must be something wrong, in-match status: left user left again
			  return;
		  }
		  else
		  {
			//There must be something wrong, in-match status: non-added user left
			var temp_editor = {};
			temp_editor.userId = editor.getId();
			temp_editor.orgId = editor.getOrgId();
			temp_editor.displayName = editor.getName();
			user = this._editorAdded(new concord.beans.EditorItem(temp_editor));
		  }
		  this._userLeft(user);
		  this.nActiveCount--;
	  },
	  _turnColor: function (isDisable)
	  {
	  	for (var p in this.activeIds)
	  		this.activeIds[p].token.turnColor(isDisable);
	  	for (var p in this.inactiveIds)
	  		this.inactiveIds[p].token.turnColor(isDisable);
	  },
	  editorAdded: function (editor)
	  {
		  var id = editor.getEditorId();
		  if (!this.activeIds[id] && !this.inactiveIds[id])
		  {
			var user = this._editorAdded(editor);
			if (!user.token.isSessionOnline)
				this._userLeft(user);
			else
				this._userJoin(user);
		  }
	  },
	  _editorAdded: function (editor)
	  {
	  		var colorOn = true;
	  		var needRegistered = false;
	  		if (pe.authenticatedUser.getId() == editor.getEditorId())//Myself...
	  		{
	  			if (this.myEditorItem != null)
	  			{
	  				console.log("How many times should ME be added???");
	  			}
	  			this.myEditorItem = editor;
	  			if (this.myEditorItem.getIndicator(editor.getEditorId()) != 'show')
	  				colorOn = false;
	  			if (this.registeredUsers != null)
	  			{
	  				for (var i = 0;i<this.registeredUsers.length;i++)
	  					if (this.myEditorItem.getIndicator(this.registeredUsers[i].id) == 'hide')
	  						this.registeredUsers[i].token.switchColor(true);
	  						
	  				//this.registeredUsers.clear();
	  				this.registeredUsers = null;
	  			}
	  		}
	  		else
	  		{
	  			if (this.myEditorItem == null)
	  			{
	  				console.log("So, I am not served at first...");
	  				needRegistered = true;
	  			}
	  			else if (this.myEditorItem.getIndicator(editor.getEditorId()) == 'hide')
	  				colorOn = false;
	  		}
			var editorLI = document.createElement( 'li' );
			//ulitem.appendChild(editorLI);
			var param = {
				userId:editor.getEditorId(),
				userName:editor.getName(),
				userColor: editor.getEditorColor(),
				colorOn:colorOn,
				email:editor.e.email,
				li:editorLI
			};
			var editorToken = new concord.widgets.sidebar.EditorToken(param);
			editorLI.insertBefore(editorToken.domNode,editorLI.firstChild);
			//editorLI.appendChild(editorToken.domNode);
			var user = {
				token: editorToken,
				dom: editorLI,
				id: editor.getEditorId()
			};
					
			if (needRegistered)
			{
				if (this.registeredUsers == null)
					this.registeredUsers = [];
				this.registeredUsers.push(user);
			}
			return user;
	  },
	  editorRemoved: function (editorId)
	  {
		  var dom = null;
		  if (this.activeIds[editorId])
		  {
			  dom = this.activeIds[editorId].dom;
			  delete this.activeIds[editorId];
		  }
		  else if (this.inactiveIds[editorId])
		  {
			  dom = this.inactiveIds[editorId].dom;
			  delete this.inactiveIds[editorId];
		  }
		  if (dom)
			  this.servingDom.removeChild(dom);
	  },
	  grabFocus: function()
	  {
	  	var dom = this.servingDom.firstChild;
	  	var token = null;
	  	for (var id in this.activeIds)
	  	{
	  		if (this.activeIds[id].dom == dom)
	  		{
	  			token = this.activeIds[id].token;
	  			break;
	  		}
	  	}
	  	if (token)
	  		token.grabFocus();
	  }
});


dojo.declare("concord.widgets.sidebar.EditorsPane", [dijit.layout.ContentPane, concord.beans.EditorStoreListener], {
	store: null,
	id_dojo_gridcss: 'id_dojoGridcss',
	id_new_editors: 'll_new_sidebar_editors',
	nls: null,
	editorGrid: null,
	curId: null,
	formatter:null,
	connectArray : [], //jmt - D38660
	tryCounter: 0,
  	rootEditor:null,
  	newEditor:null,

	postCreate: function(){
		this.inherited(arguments);
		this.nls = dojo.i18n.getLocalization("concord.widgets.sidebar","SideBar"); 
		this. _buildStore();
		this._buildPane();
		dojo.addClass(this.domNode,"editor_pane");
		//this._regEvent();
		//current user is added to the active editor list.
		//var curId = pe.authenticatedUser.getId();
		//if(!this._active(curId))
		//	this.activeIds.push(curId);
	},
	
	_setSidebarPadding: function(pxValue,pxWidth)
	{
		dojo.style(this.rootEditor, 'marginLeft', pxValue);
		dojo.style(this.newEditor,"maxWidth", pxWidth);
		//dojo.style(this.domNode, 'paddingRight', pxValue);
		//dojo.style(this.domNode, 'width', 300-2*pxValue/300);
	},

  _buildPane: function()
  {
  	 this._createEditorWidget();
  },
  
  _buildStore: function(){
      try {
          this.store = pe.scene.getEditorStore();
          this.store.registerListener(this);
      } 
      catch (e) {
         if (dojo.isIE){
         		console(e);
        }
      }
  },
    
  // called by container as to add widgets on container button
  buildContextMenu: function()
  {
  
  },
  _adjustHeight: function()
  {
  	var realHeight = this.rootEditor.clientHeight;
  	var minHeight = parseInt(dojo.getComputedStyle(this.rootEditor).minHeight);
  	var maxHeight = parseInt(dojo.getComputedStyle(this.rootEditor).maxHeight);
  	if ((realHeight > minHeight && realHeight < maxHeight) || realHeight > maxHeight )
	  	this.rootEditor.style.height = maxHeight;
	else if (realHeight < minHeight)
		this.rootEditor.style.height = minHeight;
  },
  _createEditorWidget: function()
  {
	  	this.rootEditor = document.createElement( 'div' );
		this.rootEditor.id = this.id_dojo_gridcss;	
		this.rootEditor.className = 'editorslist';
		
		this.domNode.appendChild(this.rootEditor);
	  	this.newEditor = document.createElement( 'div' );
		this.newEditor.id = this.id_new_editors;
		this.rootEditor.appendChild(this.newEditor);
	    
        var ulitem = document.createElement( 'ul' );
        this.newEditor.appendChild(ulitem);
        this.formatter = new concord.widgets.sidebar.orderedFormatter(ulitem);
		var editors = this.store.getContainer();
		var containerInOrder = {};
		if(editors){			
			for (var i = 0; i < editors.getEditorCount();i++)
			{
				var editor = editors.getEditor(i);
				if (editor)
				{
					this.formatter.editorAdded(editor);
				}
			}
		}
		
		this._adjustHeight();
  },

  usersJoined: function()
  {
  	var pList = pe.scene.getSession().getParticipantList();
  	/*var containerInOrder = {};
	for (var i = 0; i <pList.length;i++)
	{
		var editor = pList[i];
		if (editor)
		{
			containerInOrder[editor.getJoinTime()] = editor.getUserBean();
		}
	}*/
	for (var i=0;i<pList.length;i++)
		this.formatter.userJoined(pList[i].getUserBean());
  },
      
  userJoined: function(user)
  {
	this.formatter.userJoined(user);
  },
  
  userLeft: function(user)
  {
  	var id = user.getId();
  	console.info(id+' :left'); 
  	
	this.formatter.userLeft(user);	
  },
  
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  //  implement of  concord.beans.EditorStoreListener   /////////////////////////////////////////////
  editorAdded: function (editor)
  {
	this.formatter.editorAdded(editor);
		this._adjustHeight();
  },
  editorRemoved: function (editorId)
  {
	this.formatter.editorRemoved(editorId);
		this._adjustHeight();
  },
  editorsUpdated: function()
  {
  	//this._buildStore();
  	var editors = this.store.getContainer();
	if(editors){			
		for (var i = 0; i < editors.getEditorCount();i++)
		{
			var editor = editors.getEditor(i);
			if (editor)
			{
				this.formatter.editorAdded(editor);
			}
		}
	}
	
		this._adjustHeight();
  },
  grabFocus: function()
  {
  	this.formatter.grabFocus();
  }
  
});


