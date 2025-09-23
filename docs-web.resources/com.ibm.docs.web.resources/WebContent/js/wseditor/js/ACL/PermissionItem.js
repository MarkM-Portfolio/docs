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

dojo.provide("websheet.ACL.PermissionItem");
dojo.require("websheet.widget.MenuTooltip");
dojo.requireLocalization("websheet.ACL","PermissionItem");

dojo.declare("websheet.ACL.PermissionItem", [dijit._Widget, dijit._Templated],{
	
	nls: null,
	_aclHandler: null,
	widgetsInTemplate: true,
	templateString: dojo.cache("websheet", "templates/PermissionItem.html"),
	
	constructor: function(args)
	{
		this.permission = args.permission;
		this._aclHandler = args.aclHandler;
		this._setOwners(args.users);
		this.nls = dojo.i18n.getLocalization("websheet.ACL","PermissionItem");
	},
	
	//here sort the owners by the display name
	_setOwners: function(owners)
	{
		//here to increase the fault tolerance
		//most of the time, if owners contains "everyone" or "everyoneExceptMe", it should not contain other userid
		//however, if this happened, this would means this should be sheet permission, and the id "everyone" would be add by new a range permission
		var newOwners = [];
		owners.forEach(function(owner){
			if(owner.id == "everyone" || owner.id == "everyoneExceptMe")
				newOwners.push(owner);
		});
		if(newOwners.length == 0)
			newOwners = owners;
		
		this.owners = newOwners;
		this.owners.sort(function(owner1,owner2){
			return owner1.name > owner2.name ? 1 : -1;
		});
	},
	getTooltip: function()
	{
		if(!this.tooltip)
		{
			this.tooltip = new websheet.widget.MenuTooltip({widget:{domNode:this.permissionType},position:["below-centered","above-centered"]});
			if (BidiUtils.isGuiRtl()) {
				this.tooltip.dir = "rtl";
			}
		}
		return this.tooltip;
	},
	
	updateTooltip: function(bEdit)
	{
		var bSheet = this.permission.bSheet;
		var title = bEdit ? (bSheet ? this.nls.EDIT_SHEET_TITLE : this.nls.EDIT_LABLE_TITLE) : 
							(bSheet ? this.nls.READ_SHEET_TITLE :this.nls.READ_LABLE_TITLE),
							
			content = bEdit ?(bSheet ? this.nls.EDIT_SHEET_CONTENT : this.nls.EDIT_LABLE_CONTENT): 
							 (bSheet ? this.nls.READ_SHEET_CONTNET : this.nls.READ_LABLE_CONTENT);

		if (BidiUtils.isGuiRtl()) {
			title = BidiUtils.addEmbeddingUCCwithDir(title, "rtl");
			content = BidiUtils.addEmbeddingUCCwithDir(content, "rtl");
		}

		var label = "<div style='width:200px;padding:5px'><div style='font-weight:bold;'>" + title
					+ "</div><div>" +content + "</div></div>";
		var tooltip = this.getTooltip();
		tooltip.attr("label",label);
		
		dijit.setWaiState(this.permissionType,"label", title+content);
	},
	
	updateAddr: function()
	{
		var addr = websheet.Helper.escapeXml(this.permission.getAddress());
		this.permissionAddr.innerHTML = addr;
		dijit.setWaiState(this.permissionAddr,"label",addr);
	},
	
	//if the permission is sheet level, it maybe modifid by the other user, update it here
	updateCreator: function()
	{
		if(this.permission.bSheet)
		{
			var creatorId = this.permission.getCreator();
			var name = this._aclHandler._userHandler.getUserNameById(creatorId);
			this.creator.innerHTML = dojo.string.substitute(this.nls.LAST_MODIFIED, [websheet.Helper.escapeXml(name)]);
			dijit.setWaiState(this.creator,"label",this.creator.innerHTML);
		}
	},
	
	updateType: function()
	{
		var type = this.permission.getType();
		var  pType = websheet.Constant.PermissionType;
		if(type == pType.EDITABLE )
		{
			dojo.removeClass(this.permissionType,"readOnly");
			dojo.addClass(this.permissionType, "editable");
			this.updateTooltip(true);
		}	
		else
		{
			dojo.removeClass(this.permissionType,"editable");
			dojo.addClass(this.permissionType, "readOnly");
			this.updateTooltip();
		}	
	},
	
	postCreate: function()
	{
		this.updateType();
		this.updateAddr();
		
		if(this.permission.bSheet)
		{
			this.updateCreator();
		}
		else
		{
			var creatorId = this.permission.getCreator();
			var name = this._aclHandler._userHandler.getUserNameById(creatorId);
			this.creator.innerHTML = dojo.string.substitute(this.nls.CREATED, [websheet.Helper.escapeXml(name)]);
			dijit.setWaiState(this.creator,"label",this.creator.innerHTML);
		}	
		
		this.userIcons.updateUsers({users:this.owners});
		
		this.connectEvents();
	},
	
	connectEvents: function()
	{
		dojo.connect(this.domNode,"onkeyup",dojo.hitch(this,this.onKeyUp));
		dojo.connect(this.domNode, "onmouseover",dojo.hitch(this,this.highlightRange,true));
		dojo.connect(this.domNode,"onmouseout", dojo.hitch(this,this.highlightRange,false));
		dojo.connect(this.domNode,"onclick", dojo.hitch(this,this.moveToCurView));
		dojo.connect(this.editPermission, dijit.a11yclick, dojo.hitch(this,this.updatePermission));
		dojo.connect(this.removePermission, dijit.a11yclick, dojo.hitch(this,this.deletePermission));
	},
	
	onKeyUp: function(e)
	{
		var dk = dojo.keys;
		if(e.keyCode == dk.TAB)
		{
			if(e.target == this.permissionType || e.target == this.userIcons.getLastIconNode())
			{
				this._aclHandler._pane.blurPmItems();
				this.highlightRange(true);
				this.tabIn = true;
			}	
		}	
	},
	
	isPermissionValidForShow: function(pm)
	{
		var creatorId = pm.getCreator();
		var name = this._aclHandler._userHandler.getUserNameById(creatorId);
		//the creator had been removed
		if(!name) return false;
		
		var	users = this._aclHandler.getPermissionPane()._getOwners4Permission(pm);
		if(users.length == 0) return false;
		return true;
	},
	
	highlightRange: function(bHighlight)
	{
		var rangeId = this.permission.getId();
		var curSheetName = this._aclHandler._getCurrrentSheetName();
		var sheetId = this._aclHandler._doc.getSheetId(curSheetName);
		this._aclHandler._viewHandler.highlightRange(sheetId,rangeId,bHighlight);
		if(bHighlight)
		{
			dojo.addClass(this.actionIcons,"hover");
			dojo.addClass(this.editPermission,"hover");
			dojo.addClass(this.removePermission,"hover"); 
			var bhChecker = this._aclHandler._behaviorCheckHandler;
			var enableEditBtn = bhChecker.canUpdatePermission(this.permission) && this.isPermissionValidForShow(this.permission);
			if(enableEditBtn)
			{
				dojo.removeClass(this.editPermission,"disable");
				dojo.attr(this.editPermission,"tabindex","0");
			}	
			else
			{
				dojo.addClass(this.editPermission, "disable");
				dojo.attr(this.editPermission,"tabindex","-1");
			}	
			var enableDltBtn = bhChecker.canDeletePermission(this.permission);
			if(enableDltBtn)
			{
				dojo.removeClass(this.removePermission,"disable");
				dojo.attr(this.removePermission,"tabindex","0");
			}	
			else
			{
				dojo.addClass(this.removePermission,"disable");
				dojo.attr(this.removePermission,"tabindex","-1");
			}	
		}
		else
		{
			dojo.removeClass(this.actionIcons,"hover");
			dojo.removeClass(this.editPermission,"hover");
			dojo.removeClass(this.removePermission,"hover");
		}
	},
	
	moveToCurView: function()
	{
		this._aclHandler._viewHandler.moveHighlightToCurView(this.permission);
	},
	
	updateItem: function(owners)
	{
		this.updateAddr();
		this.updateType();
		this.updateCreator();
		this._setOwners(owners);
		this.userIcons.updateUsers({users:this.owners});
	},
	
	updatePermission: function()
	{
		if(dojo.hasClass(this.editPermission,"disable")) return;
		//1 update UI staff, hide current item, show permission widget
		//2 user aclHandler to update
		var pane = this._aclHandler.getPermissionPane();
		pane.updatePermissionWidget(this);
	},
	
	_deletePermission: function(self, bOK)
	{
		if(!bOK) return;
		var rangeId = this.permission.getId();
		this._aclHandler.deletePermission(rangeId);
	},
	
	deletePermission: function()
	{
		if(dojo.hasClass(this.removePermission,"disable")) return;
		var confirmMsg = this.nls.DELETE_CONFIRM_MSG;
		var params = {
			message: confirmMsg,
			callback: dojo.hitch(this, this._deletePermission)
		};
		
		var dlg = new concord.widgets.ConfirmBox(this, this.nls.DELETE_PERMISSION, null, true, params);
		dlg.show();
	}
});