/* ***************************************************************** */
/*                                                                   */
/* HCL Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright HCL Technologies Limited 2010, 2022                     */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.ACL.PermissionWidget");
dojo.require("websheet.ACL.UserIconList");
dojo.requireLocalization("websheet.ACL","PermissionWidget");

dojo.declare("websheet.ACL.PermissionWidget",[dijit._Widget, dijit._Templated,websheet.listener.Listener],{
	
	widgetsInTemplate: true,
	templateString: dojo.cache("websheet", "templates/PermissionWidget.html"),
	nls: null,
	_users: null,
	_aclHandler: null,
	_rangeAddr: null,
	_rangeType: null,
	_curHighLight: null,
	_backupHighlight:null,
	
	_permission: null, // if _permission is null, means this widget used to new permission, otherwise means to update permission
	
	bSheet: false,  // used to identify whether create sheet permission
	
	_backupColor: null,
	protected_limit: 60,
	
	constructor: function(args)
	{
		this._users = args.users;
		this._aclHandler = args.handler;
		this.nls = dojo.i18n.getLocalization("websheet.ACL","PermissionWidget");
		this._highlightProvider = pe.scene.editor.getController().getHighlightProvider();
		//this would be the listener of rangepiker
		pe.scene.editor.getCurrentGrid().selection.picker().subscribe(this);
	},
	
	postCreate: function()
	{
		this.inherited(arguments);
		var dirAttr = '';
		if (BidiUtils.isGuiRtl()) {
			dirAttr = 'rtl';
			this.userSelector.dir = dirAttr;
		}
		
		this.typeSelector.dropDown = new dijit.Menu({dir: dirAttr});
		dojo.addClass(this.typeSelector.dropDown.domNode,"ACLTypeSelectorMenu");
		
		var editMItem = new dijit.MenuItem({
			label: this.nls.STR_EDITABLE,
			iconClass: "rangeTypeEditableIcon",
			dir: dirAttr,
			onClick: dojo.hitch(this,this.changeType,websheet.Constant.PermissionType.EDITABLE)
		});
		editMItem.domNode.lastElementChild.style.display = "none";
		this.typeSelector.dropDown.addChild(editMItem);
		var readMItem = new dijit.MenuItem({
			label: this.nls.STR_READONLY,
			iconClass: "rangeTypeReadOnlyIcon",
			dir: dirAttr,
			onClick: dojo.hitch(this,this.changeType,websheet.Constant.PermissionType.READONLY)
		});
		readMItem.domNode.lastElementChild.style.display = "none";
		this.typeSelector.dropDown.addChild(readMItem);
		//make the default type is edit
		this.changeType(websheet.Constant.PermissionType.EDITABLE);
		if(dojo.isSafari)
		{
			dojo.addClass(this.typeSelector.domNode.parentNode,"safari_only");
		}	
		this.userSelector.updateStore({users:this._users,type:this._rangeType});
		
		this.connectEvents();
	},
	
	connectEvents: function()
	{
		dojo.aspect.after(this.userSelector, "closeDropDown", dojo.hitch(this,this.enableOKBtn));
		dojo.connect(this.rangeSelector,"onChange", dojo.hitch(this,this.onRangeAddrChange));
		dojo.connect(this.rangeSelector,"onKeyUp", dojo.hitch(this,this.onRangeAddrChange));
		dojo.connect(this.rangeSelector,"onKeyPress", dojo.hitch(this,this.onKeyPress));
		dojo.connect(this.rangeSelector,"onFocus", dojo.hitch(this,this.focusRangePikcer,true));
		dojo.connect(this.rangeSelector,"onBlur", dojo.hitch(this,this.focusRangePikcer,false));
		
		dojo.connect(this.okBtn, "onClick", dojo.hitch(this,this.onOk));
		dojo.connect(this.cancelBtn, "onClick",dojo.hitch(this, this.onCancel));
	},
	
	
	isShow: function()
	{
		return this.domNode.style.display != "none";
	},
	
	changeType: function(type)
	{
		this._rangeType = type;
		var pmType = websheet.Constant.PermissionType;
		if(type == pmType.EDITABLE)
		{
			this.typeSelector.setLabel(this.nls.STR_EDITABLE);
			dojo.removeClass(this.typeSelector.iconNode, "dijitNoIcon");
			dojo.removeClass(this.typeSelector.iconNode, "rangeTypeReadOnlyIcon");
			dojo.addClass(this.typeSelector.iconNode, "rangeTypeEditableIcon");
			this.typeSelector.iconClass = "rangeTypeEditableIcon";
			dojo.attr(this.typeSelector._popupStateNode,"title",this.nls.STR_EDITABLE);
		}
		else
		{
			this.typeSelector.setLabel(this.nls.STR_READONLY);
			dojo.removeClass(this.typeSelector.iconNode, "dijitNoIcon");
			dojo.removeClass(this.typeSelector.iconNode, "rangeTypeEditableIcon");
			dojo.addClass(this.typeSelector.iconNode, "rangeTypeReadOnlyIcon");
			this.typeSelector.iconClass = "rangeTypeReadOnlyIcon";
			dojo.attr(this.typeSelector._popupStateNode,"title",this.nls.STR_READONLY);
		}
		
		this.enableOKBtn();
		this.userSelector.updateStore({users:this._users,type:this._rangeType});
		this.userSelector.closeDropDown(false);
		if(this._rangeAddr && this._curHighLight)
		{
			var addr = this.bSheet ? ("1:" + this._aclHandler.editor.getMaxRow()) : this._rangeAddr;
			this.updateHighLight(addr);
		}
	},

	updateRangeSelectorValue: function(value)
	{
		this.rangeSelector.set('displayedValue', value);
		this.rangeSelector.textbox.title = value;
		//for JAWS to read the range address
		var grid = this._aclHandler.editor.getCurrentGrid();
		grid.announce(value);
	},
	
	//this could be only invoked when community members loaded
	postLoadUsers: function(users)
	{
		if(this.isShow())
		{
			this._users = users;
			this.userSelector.updateStore({users:users,type:this._rangeType});

			if(this._permission)
			{
				var ownerIds = this._permission.getOwners();
				this.userSelector.selectUsers(ownerIds);
			}	
			if(this.userSelector._opened)
			{
				this.userSelector.closeDropDown(false);
				this.userSelector.toggleDropDown();
			}
		}	
	},
	
	//every time before show this widget, need to update according to the context 
	update: function(users, permission, bSheet)
	{
		this.bSheet = bSheet ? true : false;
		this.rangeSelector.set('disabled',this.bSheet);
		if(this.bSheet)
		{
			this.typeSelector.focus();
		}	
		
		this._permission = permission ? permission : null;
		
		// address
		var addr = permission ? permission.getAddress() : 
				(bSheet ? this._aclHandler._getCurrrentSheetName():this._aclHandler.editor.getCurrentGrid().selection.selector().getSelectedRangeAddress(true, true));
		this.updateRangeSelectorValue(addr);
		this._rangeAddr = addr;
		
		//users
		if(users)
			this._users = users;
		
		//type
		var type = permission ? permission.getType() : websheet.Constant.PermissionType.EDITABLE;
		this.changeType(type);

		this.userSelector.updateStore({users:this._users,type:this._rangeType});

		if(permission)
		{
			var ownerIds = permission.getOwners();
			this.userSelector.selectUsers(ownerIds);
		}	
		this.userSelector.closeDropDown(false);
		
		var self = this;
		//for the update permission, don't enable the okey button
		if(!permission)
			setTimeout(function(){self.enableOKBtn()}, 100);
		else
			setTimeout(function(){self.disableOKBtn()}, 100);
	},
	

	
	focusRangePikcer: function(bFocus, bCancel)
	{
		var grid = pe.scene.editor.getCurrentGrid();
		var selector = grid.selection.selector();
		if(bFocus)
		{
//			console.log("in focusRangePikcer, bFocus is " + bFocus);
			if(!this.rangeSelector.get('disabled'))
			{
				this.rangeSelector.focus();
				this.editing = true;
				dojo.publish("RangePickingStart", [{grid : grid}]);
				selector.hide();
				//editingSignal: when grid scroll, it would not focus to grid(generate blur event)
				if(!this.editingSignal)
				{
					this.editingSignal = dojo.aspect.after(grid,"isEditing", function(bEdit){return true;});
				}
			}
			//if update permission, need to first hide the corresponding highlight
			if(this._permission)
			{
				var curSheetId = this._aclHandler._getCurrentSheetId();
				var rangeId = this._permission.getId();
				//here the _backupHighlight is the orginal highlight, first hide it
				this._backupHighlight = this._aclHandler._viewHandler.getHighlightRange(curSheetId,rangeId);
				if(this._backupHighlight)
				{
					var highlight = this._backupHighlight[0];
					//here use timeout to delay the hide action, cause in current time slot, viewHandler would 
					//highlightRange this range again
					setTimeout(function(){ 
						highlight.hide();
						highlight.hibernate();
					},10);
				}	
			}	
		}
		else
		{
			this.editing = false;
//			console.log("in focusRangePikcer, bFocus is " + bFocus);
			dojo.publish("RangePickingComplete", [{grid : grid}]);
//			selector.render();
			selector.hide(); //here cause when publish RangePickingComplete event, would show the selector again
			if(bCancel != undefined)
			{
				if(this._backupHighlight)
				{
					if(bCancel)
						this._backupHighlight[0].render();
					this._backupHighlight[0].wakeup();
					this._backupHighlight = null;
				}	
			}
			if(this.editingSignal)
			{
				this.editingSignal.remove();
				this.editingSignal = null;
			}	
		}	
	},
	
	_updateRangeAddr: function(addr)
	{
		this._rangeAddr = addr;
		if(!addr)
			this.disableOKBtn();
		else
			this.enableOKBtn();
	},
	
	_updateWarning: function(bShow)
	{
		if(bShow)
		{
			if(!this.isShow()) return;
			this.rangeWarning.innerHTML = this.nls.STR_RNAGE_WARNING_MSG;
			dojo.addClass(this.rangeWarning,"max");
		}
		else
		{
			this.rangeWarning.innerHTML = "";
			dojo.removeClass(this.rangeWarning,"max");
		}	
	},
	
	_hasWarning: function()
	{
		return this.rangeWarning.innerHTML != "";
	},
	
	onRangeAddrChange: function(e)
	{
		var addr = this.rangeSelector.get('displayedValue');
//		console.log("in onRangeAddrChange: " + addr);
		var bValid = false;
		var curSheetName = pe.scene.editor.getCurrentGrid().getSheetName();
		if(addr == curSheetName)
		{
			this._updateRangeAddr(addr);
			this.bSheet = true;
			var rangeAddr = "1:" + this._aclHandler.editor.getMaxRow();
			this.updateHighLight(rangeAddr);
			this._updateWarning();
			return;
		}
		this.bSheet = false;
		if(addr)
		{
			var parsedRef = websheet.Helper.parseRef(addr);
			if(parsedRef && parsedRef.isValid())
			{
				if(!parsedRef.sheetName || parsedRef.sheetName == curSheetName)
					bValid = true;
				if(parsedRef.sheetName == curSheetName)
				{
					var refMask = parsedRef.refMask &(~websheet.Constant.RefAddressType.SHEET);
					addr = parsedRef.getAddress({refMask:refMask});
				}	
			}	
		}	
		if(bValid)
		{
			this.updateHighLight(addr);
			this._updateWarning();
		}	
		else
		{
			this.updateHighLight(null);
			this._updateWarning(true);
			
		}	
		this._updateRangeAddr(addr);
	},
	
	onKeyPress: function(e) 
	{
		var dk = dojo.keys;
		if (document.activeElement == this.rangeSelector.focusNode)
		{
			var key = e.keyCode;
			if (key == 0 && e.charOrCode == " " && (e.shiftKey || e.ctrlKey || e.metaKey))
			{
				key = dk.SPACE;
			}
			switch(key)
			{
				case dk.LEFT_ARROW:
				case dk.RIGHT_ARROW:
				case dk.UP_ARROW:
				case dk.DOWN_ARROW:
				case dk.PAGE_UP:
				case dk.SPACE:
				case dk.PAGE_DOWN:
					if(e.keyChar == "" || (e.charOrCode == " " && e.shiftKey || e.ctrlKey || e.metaKey))
					{
						var grid = this._aclHandler.editor.getCurrentGrid();
						grid.selection.moveRangePicker(e);
						dojo.stopEvent(e);
						return;
					}
				default:
					break;
			}
		}
	},
	
	isEditingRangeAddress: function()
	{
//		var input = dojo.query("input", this.rangeSelector.domNode)[0];
//		return input == document.activeElement;
		return this.editing;

	},
	
	updateHighLight: function(addr)
	{
//		console.log("in updateHighLight, _curHighLight is " + this._curHighLight + " addr is " + addr);
		if(this._curHighLight)
		{
			this._curHighLight[0].setBorderStyle('solid');
			if(this._backupColor)
				this._curHighLight[0].setBorderColor(this._backupColor);
			this._highlightProvider.removeHighlight(this._curHighLight);
			this._backupColor = null;
		}
		/*Fix Bug - DOCS-162-Protected Areas issues after DOCS-43,
		when user try to cross protected area limit, in that case to make normal functioning of dashed green border around protected area for protected area addition followed by any no of deletions*/
		
		try {
			if(addr)
			{
				this._curHighLight = this._highlightProvider.highlightRangeInString(addr);
				this._curHighLight[0].setBorderStyle('dashed');
				this._backupColor = this._curHighLight[0]._borderColor;
				var color = this._rangeType == websheet.Constant.PermissionType.EDITABLE ? this._aclHandler._viewHandler._editColor 
						: this._aclHandler._viewHandler._readColor;
				this._curHighLight[0].setBorderColor(color);
			}
			else
			{
				this._curHighLight = null;
			}
		} catch(e){
			this._curHighLight = null;
		}
	},
	
	rangePicking: function(rangePicker)
	{
		if(this.isEditingRangeAddress())
		{
			var addr = rangePicker.getSelectedRangeAddress(true, true, false, false, true);
			if(rangePicker.selectingSheet())
			{
				this.bSheet = true;
//				console.log("in rangePicking: set sheetName");
				this.updateRangeSelectorValue(rangePicker.grid.sheetName);
			}
			else
			{
				this.bSheet = false;
				this.updateRangeSelectorValue(addr);
			}
			this._updateRangeAddr(addr);
//			console.log("in rangePicking updateHighLight " + addr);
			this.updateHighLight(addr);
		}	
	},
	
	rangePicked: function()
	{
		
	},
	
	_close: function(bCancel)
	{
		this.updateHighLight(null);
		this.focusRangePikcer(false,!!bCancel);
		this.domNode.style.display = "none";
		this.updateRangeSelectorValue("");
		this.userSelector._setValueAttr("");
		dojo.publish("UserIconChange",[{users:[]}]);
		//here restore the permissionItem
		if(this.domNode.nextSibling)
			this.domNode.nextSibling.style.display = "";
		var parent = this.domNode.parentNode;
		if(parent)
			parent.removeChild(this.domNode);
		
		var pane = this._aclHandler.getPermissionPane();
		pane._updatePmItemsContainer();
		pane.grapFocus();
		if(bCancel)
		{
			pe.scene.editor.getCurrentGrid().selection.selector().render();
		}
	},
	
	enableOKBtn: function()
	{
		if(this._rangeAddr && this.userSelector.hasSelected() && !this._hasWarning())
			this.okBtn.set("disabled",false);
		else
			this.okBtn.set("disabled",true);
	},
	
	disableOKBtn: function()
	{
		this.okBtn.set("disabled",true);
	},
	
	onOk: function()
	{
		//first check whether user has the edit permission in this range or sheet
		
		var sheetName = pe.scene.editor.getCurrentGrid().getSheetName();
		var parsedRef = null;
		var rangeAddr = "";
		this.bSheet = this.bSheet || ( this._permission && this._permission.bSheet);
		var owners = this.userSelector.getSelectedUserIds();
		var curUserId = this._aclHandler._userHandler.getCurrentUserId();
		if(this.bSheet)
		{
			parsedRef = sheetName;
			rangeAddr = websheet.Helper.getAddressByIndex(sheetName, 1, null, null, websheet.Constant.MaxRowNum, null, {refMask:websheet.Constant.ROWS_MASK});
			//here if set sheet level(edit) pm, need to add him/herself
			//when disable the automatic addition of sheet level permission
//			if(this._rangeType == this._aclHandler._editType && owners[0] != "everyone")
//			{
//				owners.push(curUserId);
//			}	
		}
		else
		{
			//here to expand the range to avoid selecting part of the merged cell situation(select range by input)
			parsedRef = websheet.Helper.parseRef(this._rangeAddr);
			parsedRef.sheetName = sheetName;
			var nr = websheet.Utils.getExpandRangeInfo(parsedRef);
			parsedRef.startRow = nr.startRow;
			parsedRef.endRow = nr.endRow;
			parsedRef.startCol = nr.startCol;
			parsedRef.endCol = nr.endCol;
			rangeAddr = parsedRef.getAddress({hasSheetName:true});
		}	
		 
		var bckHandler = this._aclHandler._behaviorCheckHandler;
		var data = {type: this._rangeType, owners:owners};
		var attrs = {usage:websheet.Constant.RangeUsage.ACCESS_PERMISSION, data:data};
		
		var preCheckCode = null;
		if(this._permission)
		{
			preCheckCode = bckHandler.canChangePermission(this._permission,parsedRef,this._rangeType, owners,Object.keys(this._users));
		}	
		//new permission
		else
		{
			preCheckCode = bckHandler.canCreatePermission(parsedRef,this.bSheet,this._rangeType,owners, Object.keys(this._users));
		}
		
		if(preCheckCode == bckHandler.PRE_CREATE_PERM_CHECK.CAN_NOT_EDIT)
		{
			var ownerId = pe.scene.bean.getOwner();
			var userName = this._aclHandler._userHandler.getUserNameById(ownerId);
			if(!userName)
			{
				var fileOwner = ProfilePool.getUserProfile(ownerId);
				userName = fileOwner.getName();
			}
			var msg = dojo.string.substitute(bckHandler.nls.FORBIDDEN_EDIT_MSG, [userName]);
			var dlg = new concord.widgets.MessageBox(this, bckHandler.nls.PERMISSION_ERROR, null, false, 
					{message: msg});
			dlg.show();
			return;
		}
		else if(preCheckCode == bckHandler.PRE_CREATE_PERM_CHECK.HAVE_SHEET_PERM)
		{
			var dlg = new concord.widgets.MessageBox(this, this.nls.HAS_SHEET_PERMISSION_TITLE,null,false,
					{message: this.nls.HAS_SHEET_PERMISSION_CONFIRM_MSG});
			dlg.show();
			return;
		}
		else if(preCheckCode == bckHandler.PRE_CREATE_PERM_CHECK.HAVE_CONFLICT)
		{
			var dlg = new concord.widgets.MessageBox(this, this.nls.HAS_CONFLICT_TITLE, null, false, 
					{message: this.nls.HAS_CONFLICT_CONFIRM_MSG});
			dlg.show();
			return;
		}	
		this._close();
		
		// update the permission
		
		if(this.bSheet)
		{
			data.bSheet = true;
			data.creator = curUserId;
		}	
		
		if(owners[0] == "everyoneExceptMe")
		{
			data.except = [curUserId];
		}	
		if(this._permission)
		{
			if(!this.bSheet)
				data.creator = this._permission.getCreator();
			attrs.rangeid = this._permission.getId();
			this._aclHandler.setPermission(rangeAddr,attrs);
		}	
		//new permission
		else
		{
			 /* Fix DOCS-43-Can't add more than 59 Protected Areas in Docs spreadsheet,
			 added below condition to limit the addition of protected areas till defined protected_limit, if crosses limit then repective pop-up message will be shown to show 'The maximum number of allowable protected areas has been reached.'*/
			if(this._aclHandler._pane._permisionsArray.length < this.protected_limit)
			{
				data.creator = curUserId;
				var rangeid = this._aclHandler.generatePermissionId(); 
				attrs.rangeid = rangeid;
				
	//			var extra = this.bSheet ? null : this._aclHandler.getExtraSheetPmData(this._rangeType,owners);
				extra = null;
				if(extra)
				{
					var shAddr = websheet.Helper.getAddressByIndex(sheetName, 1, null, null, websheet.Constant.MaxRowNum, null, {refMask:websheet.Constant.ROWS_MASK});
					var shAttrs = {usage:websheet.Constant.RangeUsage.ACCESS_PERMISSION, data:{"add":extra.owners,creator:pe.authenticatedUser.getId()}};
					shAttrs.rangeid = extra.id;
					
					this._aclHandler.setPermission(shAddr,shAttrs,{rangeAddr:rangeAddr,attrs:attrs});
				}
				else
					this._aclHandler.insertPermission(rangeid,rangeAddr,attrs);
			}
			else
			{
				var dlg = new concord.widgets.MessageBox(this,this.nls.PROTECTED_LIMIT,null,false,{message: this.nls.PROTECTED_LIMIT_REACHED_MESSAGE});
				dlg.show();
				return;
			}
		}
	},
	
	onCancel: function()
	{
		this._close(true);
	}
});
