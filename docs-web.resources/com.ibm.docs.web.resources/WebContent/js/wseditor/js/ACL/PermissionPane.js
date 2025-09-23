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
dojo.provide("websheet.ACL.PermissionPane");
dojo.require("websheet.widget.CommonPane");
dojo.require("websheet.ACL.UserMultiSelector");
dojo.require("websheet.ACL.PermissionWidget");
dojo.require("websheet.ACL.UserIconList");
dojo.require("websheet.ACL.PermissionItem");
dojo.require("websheet.widget.MenuTooltip");
dojo.requireLocalization("websheet.ACL","PermissionPane");

dojo.declare("websheet.ACL.PermissionPane", [websheet.widget.CommonPane],{
	
	_aclHandler: null,
	_nls: null,
	_title: "",
	_warningNode: null, 
	
	_sheetLable: null,
	_sheetLableNode: null,
	_newPermissionWidget: null,
	_users: null,
	
	_permisionsArray: null, // the permissions show in this pane
	
	_closeText: " close button",
	
	constructor: function (domNode,controller) 
	{
		this._aclHandler = controller;
		this._nls = dojo.i18n.getLocalization("websheet.ACL","PermissionPane");
		this._title = this._nls.ACCESS_PERMISSION;
		this._sheetLable = this._nls.SHEET_LABEL;
		this._permisionsArray = [];
		this.buildAll();
		dojo.subscribe("selectSheetChanged",dojo.hitch(this,this.switchSheet));
		
	},
	
	grapFocus: function()
	{
		if(this.isCollapsed()) return;
		this._closeBtn.focus();
	},
	
	_createTitle: function()
	{
		var title = dojo.create("span",{innerHTML:this._title}, this._headerNode);
		dojo.addClass(title, "title");
		
		dijit.setWaiState(this._closeBtn,"label",this._title +  this._closeText);
		dijit.setWaiRole(this._closeBtn, 'button');
		
		//create beta 
//		var beta = dojo.create("span",{innerHTML:"BETA",id:"acl_pane_beta"},this._headerNode);
//		dojo.addClass(beta,"aclBetaLabel");
//		var betaLabel = "<div style='width:260px;padding:5px'>"+this._nls.WARNING_MESSAGE + "</div>";
//		var toolTip = new websheet.widget.MenuTooltip({widget:{domNode:beta},position:["below-centered","above-centered"]});
//		toolTip.attr("label",betaLabel);
	},
	
	_createContent: function()
	{
		this._contentNode = dojo.create("div",null, this.domNode);
		dojo.addClass(this._contentNode,"ACLCotent");
		
		this._createWarningNode();
		this._createNewPermission();
		this._createSeperatorBar();
		this._users = this._aclHandler.getUserHandler().getAllUsers();

		this._newPermissionWidget = new websheet.ACL.PermissionWidget({users:this._users,handler: this._aclHandler});
//		this._contentNode.appendChild(this._newPermissionWidget.domNode);
		this._newPermissionWidget.domNode.style.display = "none";
		
		this._createPermissionItems();
	},
	
	_createWarningNode: function()
	{
		this._warningNode = dojo.create("div", null, this._contentNode);
		dojo.addClass(this._warningNode,"permissionWarningDiv");
		
		var photoContainer = dojo.create("div",null,this._warningNode);
		dojo.addClass(photoContainer,"permissionWarningPhotoContainer");
		var photo = dojo.create("div",null,photoContainer);
		dojo.addClass(photo,"warningPhoto");
		var waringMessage = dojo.create("div", null,this._warningNode);
		waringMessage.innerHTML = this._nls.WARNING_MESSAGE;
		dojo.addClass(waringMessage,"permissionWarningMsg");
		
		var closeBtn = dojo.create("div", {tabindex:0}, this._warningNode);
		dojo.addClass(closeBtn, "closeWarningBtn");
		dijit.setWaiState(closeBtn,"label",this._nls.WARNING_MESSAGE + this._closeText);
		dijit.setWaiRole(closeBtn, 'button');
		
		var warningNode = this._warningNode;
		var self = this;
		dojo.connect(closeBtn, dijit.a11yclick,function(){
			warningNode.style.display = "none";
			websheet.Utils.setLocalStorageItem(websheet.Constant.ACLWarningPrefix,false,true,false);
			self._updatePmItemsContainer();
		});
		var showWarning = websheet.Utils.getLocalStorageItem(websheet.Constant.ACLWarningPrefix,false,true);
		if(showWarning && showWarning == "false")
		{
			warningNode.style.display = "none";
		}	
	},
	
	_createNewPermission: function()
	{
		//sheet label
		this._newPermissionContainer = dojo.create("div", null, this._contentNode);
		dojo.addClass(this._newPermissionContainer, "newPermissionContainerDiv");
		var sheetName = websheet.Helper.escapeXml(this._aclHandler._getCurrrentSheetName());
		if (BidiUtils.isBidiOn()) {
			sheetName = BidiUtils.addEmbeddingUCC(sheetName);
			sheetName = (BidiUtils.isGuiRtl() ? BidiUtils.RLM : BidiUtils.LRM) + sheetName;
		}		
		var shLable = this._sheetLable + " " + sheetName; 
		this._sheetLableNode = dojo.create("div", {innerHTML: shLable}, this._newPermissionContainer);
		dojo.addClass(this._sheetLableNode, "sheetLabelDiv");
		dojo.attr(this._sheetLableNode,"title",shLable);
		
		var btnDiv = dojo.create("div",null, this._newPermissionContainer);
		dojo.addClass(btnDiv,"newPermissionDiv");
		this._newPermissionBtn = new dijit.form.Button({
				label:this._nls.NEW_PERMISSION,
				id: "new_permission_btn",
				onClick: dojo.hitch(this, this.openPermissionWidget)
			});
		btnDiv.appendChild(this._newPermissionBtn.domNode);
	},
	
	_createSeperatorBar: function()
	{
		this.seperatorBar = dojo.create("div", null, this._contentNode);
		dojo.addClass(this.seperatorBar, "aclSeperatorBar");
	},
	
	updateSeperatorBar: function()
	{
		if(this._newPermissionWidget.isShow() || this._permisionsArray.length > 0)
			this.seperatorBar.style.display = "none";
		else
			this.seperatorBar.style.display = "";
	},
	
	_createPermissionItems: function()
	{
		this.PermissionItemsDiv = dojo.create("div",null, this._contentNode);
		dojo.addClass(this.PermissionItemsDiv,"permissionItemsContainer");
		this._initPermissionItems();
	},
	
	_updatePmItemsContainer: function()
	{
		this.updateSeperatorBar();
		var headerRect = this._headerNode.getBoundingClientRect();
		var paneHeight = parseInt(this.sidePaneMgr.getHeight());
		var rect = this._newPermissionContainer.getBoundingClientRect();
		var h = rect.bottom - headerRect.top;
		var containerHeight = paneHeight - h - 30;
		
		this.PermissionItemsDiv.style.height = containerHeight + "px";
		
		if(this.PermissionItemsDiv.scrollHeight > this.PermissionItemsDiv.offsetHeight)
		{
			dojo.addClass(this.PermissionItemsDiv,"hasScroll");
		}	
		else
			dojo.removeClass(this.PermissionItemsDiv,"hasScroll");
	},
	
	updatePmItemsAddr: function(ranges)
	{
		var rangeIds = {};
		for(var len = ranges.length, i = len - 1; i >= 0; i--)
		{
			var range = ranges[i];
			if(range.isValid())
			{
				rangeIds[range.getId()] = true;
			}
			else
			{
				this.removePermissionItem(range);
			}	
		}
		
		var len = this._permisionsArray.length;
		for(var i = 0; i < len; i++)
		{
			var pmItem = this._permisionsArray[i];
			var id = pmItem.permission.getId();
			if(rangeIds[id])
				pmItem.updateAddr();
		}	
	},
	
	updatePmItem: function(pm)
	{
		var bExisted = false;
		var pmItem = null;
		for(var i = this._permisionsArray.length -1; i >= 0; i--)
		{
			pmItem = this._permisionsArray[i];
			if(pmItem.permission == pm)
			{
				bExisted = true; break;
			}	
		}
		if(!bExisted)
		{
			this.createPermissionItem(pm);
		}	
		else
		{
			var owners = this._getOwners4Permission(pm);
			pmItem.updateItem(owners);
		}
	},
	
	_resetPmItemsContainer: function()
	{
		var len = this._permisionsArray.length;
		for(var i = 0; i < len; i++)
		{
			var pm = this._permisionsArray[i];
			pm.destroy();
		}	
		this.PermissionItemsDiv.innerHTML = "";
		this._permisionsArray = [];
	},
	
	_initPermissionItems: function()
	{
		this._resetPmItemsContainer();
		
		var permissions = this._aclHandler.getSheetPermissions();
		if(!permissions) return;
		
		var pArray = [];

		if(permissions.range)
		{
			pArray = pArray.concat(permissions.range);
			pArray.sort(function(pm1,pm2){
				return pm1.getAddress() < pm2.getAddress() ? -1 : 1;
			});
		}	
		if(permissions.sheet)
			pArray.unshift(permissions.sheet);

		var len = pArray.length;
		for(var i = 0; i < len; i++)
		{
			var pm = pArray[i];
			if(pm.isValid())
				this.createPermissionItem(pm);
		}	
		this._updatePmItemsContainer();
	},
	
	//Here for ACC, if user tab into some permission Item, need to blur the last focus one
	blurPmItems: function()
	{
		var len = this._permisionsArray.length;
		for(var i = 0; i < len; i++)
		{
			var pm = this._permisionsArray[i];
			if(pm.tabIn)
			{
				pm.highlightRange(false);
				pm.tabIn = false;
				break;
			}	
		}	
	},
	
	_getOwners4Permission: function(pm)
	{
		var owners = pm.getOwners();
		var ownsCnt = owners.length;
		var users = [];
		for(var j = 0; j < ownsCnt; j++)
		{
			var id = owners[j];
			var user = null;
			if(id == "everyone")
			{
				user = {name: "Everyone", id:id, email:"", color:""};
			}
			else if(id == "everyoneExceptMe")
			{
				user = {name: "Everyone except me", id:id, email:"", color:""};
			}	
			else
			{
				var oriUser = this._users[id];
				if(!oriUser)
				{
					this._users = this._aclHandler.getUserHandler().getAllUsers(true);
					oriUser = this._users[id];
				}	
				if(oriUser)
				{
					user = {name: oriUser.displayName, id:id, email: oriUser.email, color: oriUser.color};
				}	
			}
			if(user)
				users.push(user);
		}
		return users;
	},
	
	createPermissionItem: function(pm)
	{
		var users = this._getOwners4Permission(pm);
		var pmItem = new websheet.ACL.PermissionItem({permission:pm, users:users, aclHandler:this._aclHandler});
		var fChild = null;
		if(pm.bSheet)
		{
			fChild = this.PermissionItemsDiv.firstChild;
		}
		if(fChild)
		{
			this.PermissionItemsDiv.insertBefore(pmItem.domNode,fChild);
			this._permisionsArray.unshift(pmItem);
		}	
		else
		{
			this.PermissionItemsDiv.appendChild(pmItem.domNode);
			this._permisionsArray.push(pmItem);
		}
		//here invoke this method to avoid the situation: when first time create permissionItem,
		//then need to updateHeight after it appendded to the dom
		pmItem.userIcons.updateHeight();
		
		this._updatePmItemsContainer();
	},

	removePermissionItem: function(area)
	{
		var len = this._permisionsArray.length;
		var dltId = area.getId();
		for(var i = 0; i < len; i++)
		{
			var pmItem = this._permisionsArray[i];
			if(pmItem.permission.getId() == dltId)
			{
				this.PermissionItemsDiv.removeChild(pmItem.domNode);
				this._permisionsArray.splice(i,1);
				pmItem.destroy();
				break;
			}	
		}	
		this._updatePmItemsContainer();
	},
	
	openPermissionWidget: function(args)
	{
		if(this._newPermissionWidget.isShow())
		{
			this._newPermissionWidget._close(true);
		}	
		if(args && args.bSheet)
		{
			var pmItem = this._permisionsArray[0];
			//if already have sheet permission, just means to update it
			if(pmItem && pmItem.permission.bSheet)
			{
				this.updatePermissionWidget(pmItem);
				return;
			}	
			this._newPermissionWidget.bSheet = true;
		}
		this._newPermissionWidget.domNode.style.display = "";
		if(this._newPermissionWidget.domNode.parentNode == null)
		{
			this._newPermissionContainer.appendChild(this._newPermissionWidget.domNode);
		}
		this._users = this._aclHandler.getUserHandler().getAllUsers();
		
		this._newPermissionWidget.update(this._users, null,args && args.bSheet);

		this._newPermissionWidget.focusRangePikcer(true);
		this._updatePmItemsContainer();
	},
	
	updatePermissionWidget: function(permissionItem)
	{
		if(this._newPermissionWidget.isShow())
		{
			this._newPermissionWidget._close(true);
		}
		var parent = permissionItem.domNode.parentNode;
		parent.insertBefore(this._newPermissionWidget.domNode, permissionItem.domNode);
		this._newPermissionWidget.domNode.style.display = "";
		permissionItem.domNode.style.display = "none";
		
		this._users = this._aclHandler.getUserHandler().getAllUsers();
		this._newPermissionWidget.update(this._users, permissionItem.permission,permissionItem.permission.bSheet);
		this._newPermissionWidget.focusRangePikcer(true);
		this._updatePmItemsContainer();
		this._aclHandler._viewHandler.moveHighlightToCurView(permissionItem.permission);
	},
	
	handleRenameSheet: function(sheetName, sheetPm)
	{
		//3 place may contain the sheetName
		//1: the label of the pane
		this._updateSheetLable();
		// the sheet pm
		if(sheetPm)
			this.updatePmItemsAddr([sheetPm]);
		// the widget currently display the sheetName
		if(this._newPermissionWidget.isShow() && this._newPermissionWidget.bSheet)
		{
			this._newPermissionWidget.updateRangeSelectorValue(sheetName);
		}	
	},
	
	isEditing: function()
	{
		return this._newPermissionWidget.isEditingRangeAddress();
	},
	
	open: function()
	{
		this.inherited(arguments);
		this.update();
		setTimeout(dojo.hitch(this,this.grapFocus),100);
//		dojo.publish("PermissionPaneOpen",[{pane:this}]);
	},
	
	close: function()
	{
		this.inherited(arguments);
		if(this._newPermissionWidget.isShow())
		{
			this._newPermissionWidget._close();
		}	
		dojo.publish("PermissionPaneClose",[{pane:this}]);
	},
	
	switchSheet: function(args)
	{
		if(websheet.model.ModelHelper.isSheetProtected(args.sheetName))
		{
			this.close();
			return;
		}
		this.update();
	},
	
	_updateSheetLable: function()
	{
		var sheetName = websheet.Helper.escapeXml(this._aclHandler._getCurrrentSheetName());
		if (BidiUtils.isBidiOn()) {
			sheetName = BidiUtils.addEmbeddingUCC(sheetName);
			sheetName = (BidiUtils.isGuiRtl() ? BidiUtils.RLM : BidiUtils.LRM) + sheetName;
		}
		this._sheetLableNode.innerHTML = this._sheetLable + " " + sheetName; 
		dojo.attr(this._sheetLableNode,"title",this._sheetLableNode.innerHTML);
	},
	
	_updateNewPMButton: function()
	{
		var isSheetProtected = websheet.model.ModelHelper.isSheetProtected();
		this._newPermissionBtn.set('disabled',isSheetProtected);
	},
	
	resizeSidebar: function()
	{
		this.inherited(arguments);
		
		var width =  this.sidePaneMgr.getWidth();
		var userSelectorMenu = this._newPermissionWidget.userSelector.dropDown;
		if(width == 300)
		{
			dojo.removeClass(this._contentNode, "narrowPane");
			userSelectorMenu && dojo.removeClass(userSelectorMenu.domNode, "narrow");
				
		}	
		else
		{
			dojo.addClass(this._contentNode, "narrowPane");
			userSelectorMenu && dojo.addClass(userSelectorMenu.domNode, "narrow");
		}
			
		this._updatePmItemsContainer();
		var len = this._permisionsArray.length;
		for(var i = 0; i < len; i++)
		{
			var pmItem = this._permisionsArray[i];
			pmItem.userIcons.updateHeight();
		}	
		if(this._newPermissionWidget.isShow())
		{
			this._newPermissionWidget.userIcons.updateHeight();
		}	
	},
	
	update: function()
	{
		if(this.isCollapsed()) return;
		
		this._newPermissionWidget._close();
		//update sheet lable
		this._updateSheetLable();
		this._updateNewPMButton();
		//update items
		this._initPermissionItems();
		this.updateSeperatorBar();
		dojo.publish("PermissionPaneOpen",[{pane:this}]);
	},
	
	_registerEvents: function()
	{
		this.inherited(arguments);
	},
	
	destroy: function()
	{
		this._newPermissionWidget.destroy();
		this._newPermissionBtn.destroy();
		for(var len = this._permisionsArray.length, i = len -1; i >= 0; i--)
		{
			var pmItem = this._permisionsArray[i];
			pmItem.destroy();
		}
//		this.domNode.innerHTML = "";
	}
});