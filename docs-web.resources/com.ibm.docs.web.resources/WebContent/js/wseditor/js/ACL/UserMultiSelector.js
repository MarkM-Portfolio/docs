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

dojo.provide("websheet.ACL.UserMultiSelector");
dojo.require("dijit.form.ComboBox");
dojo.require("dojo.store.Memory");
dojo.require("dijit.form.CheckBox");
dojo.requireLocalization("websheet.ACL","UserMultiSelector");

dojo.declare("websheet.ACL.UserMultiSelector",[dijit.form.ComboBox],{
	
	dropDownClass: "websheet.ACL.UserComboBoxMenu", // need to override _ComboBoxMenu,
	_nls: null,
	_items: null,
	_selectedItems: null,
	_type: null,
	_bEveryone: false, // if user click everyone, this flag would be set as true
	_bEveryoneExceptMe: false, // if user click everyoneExceptMe, this flag would be set as true
	_disabledItem: null, // if is editType and everyone is selected, then the current user menu item would be disabled
	
	
	constructor: function(args)
	{
		this._nls = dojo.i18n.getLocalization("websheet.ACL","UserMultiSelector");
		this._defaultValue = this._nls.DEFAULT_EDIT_HINT;
		if(args.users)
			this.updateStore(args.users);
		this.forceWidth = true;
		this.autoComplete = false;
		this.queryExpr = "*${0}*";
		this.pageSize = 13;
	},
	
	postCreate: function()
	{
		this.inherited(arguments);
//		this._setValueAttr(this._defaultValue);
		dojo.connect(this.textbox,"onmousedown", dojo.hitch(this,this.clearDefaultValue));
		dojo.connect(this.textbox,"onkeydown", dojo.hitch(this,this.clearDefaultValue));
	},
	
	
	_resetState: function()
	{
		this._bEveryone = false;
		this._bEveryoneExceptMe = false;
		this._disabledItem = null;
	},
	/**
	 * @param args.users : the normal users (uuid) are stored here
	 * @param args.type  : edit or readonly, everyone and everyoneExceptMe stored here
	 */
	updateStore: function(args)
	{
		var users = args.users, others = ["everyone"];
		this._type = args.type;
		if(args.type == "readOnly")
		{
			others.push("everyoneExceptMe");
			this._defaultValue = this._nls.DEFAULT_READ_HINT;
		}
		else
		{
			this._defaultValue = this._nls.DEFAULT_EDIT_HINT;
		}	
		if(dojo.isIE)
		{
			this._setValueAttr(this._defaultValue);
		}
		else
			this.textbox.placeholder = this._defaultValue;
		
		this.textbox.title = this._defaultValue;
		
		var items =  [];
		this._items = items;
		for(var userId in users)
		{
			var user = users[userId];
			var item = {name: user.displayName, id:userId, email: user.email, color: user.color, isMe: user.isMe};
			if(user.isMe && this._type == "editable")
				item.checked = true;
			items.push(item);
		}
		items.sort(function(a,b){return a.name > b.name ? 1 : -1});
		for(var len = others.length , i = len -1; i >=0; i--)
		{
			var item = {id: others[i], email:""};
			if(i == len -1)
				item.seperator = true;
			item.name = others[i] == "everyone" ? this._nls.EVERYONE : this._nls.EVERYONE_EXCEPT_ME;
			items.unshift(item);
		}	
		this.store = new dojo.store.Memory({data: items});
		this._resetState();
	},
	
	selectUsers: function(userIds)
	{
		if(!userIds) return;
		var idsMap = {};
		for(var len = userIds.length -1, i = len; i >= 0; i--)
		{
			idsMap[userIds[i]] = true;
		}
		if(idsMap["everyone"])
			this._bEveryone = true;
		if(idsMap["everyoneExceptMe"])
			this._bEveryoneExceptMe = true;
		
		for(var len = this._items.length -1, i = len; i >= 0; i--)
		{
			var id = this._items[i].id;
			if(idsMap[id])
			{
				this._items[i].checked = true;
			}
			else
			{
				if((this._bEveryone && id != "everyoneExceptMe") || (this._bEveryoneExceptMe && !this._items[i].isMe && id != "everyone"))
					this._items[i].checked = true;
//				if(this._bEveryone && this._type == websheet.Constant.PermissionType.EDITABLE && this._items[i].isMe)
//					this._items[i].disable = true;
			}	
		}
	},
	
	_onFocus: function()
	{
		this.inherited(arguments);
		if(dojo.isIE && this.textbox.value == this._defaultValue)
		{
			this._setValueAttr("");
		}
		if(!this._opened)
			this.toggleDropDown();
	},
	
	_onBlur: function(){
		//Override default behavior !!!!!!!!!!
//		this.closeDropDown(false);

		this.inherited(arguments);
		if(dojo.isIE)
			this._setValueAttr(this._defaultValue);
		else
			this._setValueAttr("");
	},
	
	_onDropDownMouseDown: function(/*Event*/ e)
	{
		this.expandClick = !this.expandClick;
		this.inherited(arguments);
	},
	
	openDropDown: function()
	{
		this.inherited(arguments);
		if(this.dropDown && this.dropDown.onPage)
		{
			var self = this;
			dojo.aspect.before(this.dropDown, "onPage", function(){
				self.clickedPage = true;
			});
		}	
		dojo.addClass(this._buttonNode.firstChild,"upper");
	},
	
	clearDefaultValue: function()
	{	
		if(dojo.isIE && this.textbox.value == this._defaultValue)
		{
			this._setValueAttr("");
		}	
	},
	
	hasSelected: function()
	{
		return this._selectedItems && this._selectedItems.length > 0 ? true : false;
	},
	
	getSelectedUserIds: function()
	{
		var ids = [];
		if(!this._selectedItems) return ids;
		for(var len = this._selectedItems.length, i = len -1; i >= 0; i-- )
		{
			ids.push(this._selectedItems[i].id);
		}	
		return ids;
	},
	
	closeDropDown: function(/*Boolean*/ focus)
	{
//		console.log("closeDropDown, focus is " + focus + " before : open is " + this._opened);
		var statusBefore = this._opened;
		this.inherited(arguments);
		
		if( statusBefore == true && dojo.isIE && this.textbox.value == "")
		{
			this._setValueAttr(this._defaultValue);
//			this._setCaretPos(this.focusNode,0);
		}	
		//here maybe need to annouce the change
		this._selectedItems = [];
		if(this._bEveryone)
		{
			this._selectedItems.push(this._items[0]);
		}
		else if(this._bEveryoneExceptMe)
		{
			this._selectedItems.push(this._items[1]);
		}
		else
		{
			for(var len = this._items.length, i = 0; i < len; i++)
			{
				var item = this._items[i];
				if(this._items[i].checked)
					this._selectedItems.push(item);
			}
		}
		if(!this.clickedPage)
		{
			dojo.publish("UserIconChange",[{users:this._selectedItems}]);
		}
		this.clickedPage = false;
		dojo.removeClass(this._buttonNode.firstChild,"upper");
	},
	
	_disableItem: function(item, disable)
	{
		var checkBox = dijit.byId(item.widgetId);
		checkBox.set("disabled",disable);
		var mItem = checkBox.domNode.parentNode;
		if(disable)
		{
			item.disable = true;
			dojo.addClass(mItem,"disable");
			this._disabledItem = item;
		}	
		else
		{
			item.disable = false;
			dojo.removeClass(mItem,"disable");
			this._disabledItem = null;
		}	
	},
	
	_selectChange: function(target)
	{
		var label = target.lastChild,
			labelText = label.innerText || label.textContent;
		var bEveryone = labelText == this._nls.EVERYONE,
			bEveryoneExceptMe = labelText == this._nls.EVERYONE_EXCEPT_ME;
		if(bEveryone || bEveryoneExceptMe)
		{
			var checked = bEveryone ? this._items[0].checked : this._items[1].checked;
			
			//here for readOnly type
			if(checked && this._type == websheet.Constant.PermissionType.READONLY)
			{
				if(bEveryone && this._items[1].checked)
				{
					this._items[1].checked = false;
					var checkBox = dijit.byId(this._items[1].widgetId);
					checkBox && checkBox.set("checked",false);
				}
				if(bEveryoneExceptMe && this._items[0].checked)
				{
					this._items[0].checked = false;
					var checkBox = dijit.byId(this._items[0].widgetId);
					checkBox && checkBox.set("checked",false);
				}
			}
			
			for(var len = this._items.length, i = len -1; i >= 0; i--)
			{
				var item = this._items[i];
				if(item.id == "everyone" || item.id == "everyoneExceptMe") continue;
				var checkBox = dijit.byId(item.widgetId);

				if(item.isMe && bEveryoneExceptMe)
				{
//					if(bEveryone)
//					{
//						item.checked = checked;
//						checkBox && checkBox.set("checked",item.checked);
//						if(this._type == websheet.Constant.PermissionType.EDITABLE)
//						{
//							this._disableItem(item,checked);
//						}
//					}
//					if(bEveryoneExceptMe)
					{
						item.checked = false;
						checkBox && checkBox.set("checked",item.checked);
					}
				}
				else
				{
					item.checked = checked;
					checkBox && checkBox.set("checked",item.checked);
				}
			}
			this._bEveryone = this._items[0].checked;
			this._bEveryoneExceptMe = this._type == websheet.Constant.PermissionType.READONLY ? this._items[1].checked : false;
		}
		//if click other user icon, unselect the everyone or everyoneExceptMe 
		else
		{
			if(this._bEveryone)
			{
				this._bEveryone = false;
				this._items[0].checked = false;
				var checkBox = dijit.byId(this._items[0].widgetId);
				checkBox && checkBox.set("checked",false);
				if(this._disabledItem)
				{
					this._disableItem(this._disabledItem,false);
				}	
			}
			
			if(this._bEveryoneExceptMe)
			{
				this._bEveryoneExceptMe = false;
				this._items[1].checked = false;
				var checkBox = dijit.byId(this._items[1].widgetId);
				checkBox && checkBox.set("checked",false);
			}	
		}	
	},
	
	_selectOption: function(/*DomNode*/ target){
		// summary:
		//		Menu callback function, called when an item in the menu is selected.
		
		//Here to override the default behavior !!!!!!!!!!!
//		this.closeDropDown();
		//Here to make the value of input box do not change, may cause a11y problem
		if(target){
			this.announceItem(target);
		}
		this._setCaretPos(this.focusNode, this.focusNode.value.length);
		this._handleOnChange(this.value, true);
		// Remove aria-activedescendant since the drop down is no loner visible
		// after closeDropDown() but _announceOption() adds it back in
		this.focusNode.removeAttribute("aria-activedescendant");
		this._selectChange(target);
	},
	
	announceItem: function(/*DomNode*/target)
	{
		var msg = target.innerText || target.textContent;
		var checkbox = dijit.byNode(target.firstChild);
		var status = checkbox && checkbox.checked ? " checked" : " unchecked";
		var grid = pe.scene.editor.getCurrentGrid();
		grid.announce(msg + status);
	},
	
	// get the data item by the domNode according to the id
	_findItem: function(/*DomNode*/target)
	{
		var checkbox = dijit.byNode(target.firstChild);
		var cbId = checkbox.id;
		var item = null;
		for(var len = this._items.length, i = len -1; i >= 0; i--)
		{
			var tmp = this._items[i];
			if(tmp.widgetId == cbId)
			{
				item = tmp; break;
			}	
		}
		return item;
	},
	
	_selectChangeOnItem: function(/*DomNode*/target, /*data*/item)
	{
		item.checked = !item.checked; 
		var checkbox = dijit.byNode(target.firstChild);
		checkbox.set("checked",!!item.checked);
		this._selectOption(target);
	},
	
	//overide _AutoCompleterMixin.js method
	_onKey: function(/*Event*/ evt){
		// summary:
		//		Handles keyboard events

		if(evt.charCode >= 32){
			return;
		} // alphanumeric reserved for searching

		var key = evt.charCode || evt.keyCode;
		var keys = dojo.keys;
		// except for cutting/pasting case - ctrl + x/v
		if(key == keys.ALT || key == keys.CTRL || key == keys.META || key == keys.SHIFT){
			return; // throw out spurious events
		}

		var pw = this.dropDown;
		var highlighted = null;
		this._abortQuery();

		// _HasDropDown will do some of the work:
		//
		//	1. when drop down is not yet shown:
		//		- if user presses the down arrow key, call loadDropDown()
		//	2. when drop down is already displayed:
		//		- on ESC key, call closeDropDown()
		//		- otherwise, call dropDown.handleKey() to process the keystroke
		if(this.disabled || this.readOnly){
			return;
		}
		if(pw && this._opened && pw.handleKey){
			if(pw.handleKey(evt) === false){
				/* false return code means that the drop down handled the key */
				evt.stopPropagation();
				evt.preventDefault();
			}
		}
		if(pw && this._opened && evt.keyCode == keys.ESCAPE){
			this.closeDropDown();
			evt.stopPropagation();
			evt.preventDefault();
		}
//		this.inherited(arguments);

		if(evt.altKey || evt.ctrlKey || evt.metaKey){
			return;
		} // don't process keys with modifiers  - but we want shift+TAB

		if(this._opened){
			highlighted = pw.getHighlightedOption();
		}
		switch(key){
			case keys.PAGE_DOWN:
			case keys.DOWN_ARROW:
			case keys.PAGE_UP:
			case keys.UP_ARROW:
				// Keystroke caused ComboBox_menu to move to a different item.
				// Copy new item to <input> box.
				if(this._opened && highlighted){
					this.announceItem(highlighted);
				}
				evt.stopPropagation();
				evt.preventDefault();
				break;
			//left_arrow key used to deselect item, right_arrow key used to select item
			case keys.ENTER:
			case keys.LEFT_ARROW:
			case keys.RIGHT_ARROW:
				// prevent submitting form if user presses enter. Also
				// prevent accepting the value if either Next or Previous
				// are selected
				if(highlighted){
	
					// only stop event on prev/next
					if(highlighted == pw.nextButton){
						//here to set the dropdown menu's selected as null, to make it would not invoke _annouceItem methond
						pw.selected = null;
						this._nextSearch(1);
						highlighted = pw.getHighlightedOption();
						highlighted && this.announceItem(highlighted);
						// prevent submit
						evt.stopPropagation();
						evt.preventDefault();
						break;
					}else if(highlighted == pw.previousButton){
						pw.selected = null;
						this._nextSearch(-1);
						highlighted = pw.getHighlightedOption();
						highlighted && this.announceItem(highlighted);
						// prevent submit
						evt.stopPropagation();
						evt.preventDefault();
						break;
					}
					else
					{
						var item = this._findItem(highlighted);
						if(item)
						{
							if(key == keys.LEFT_ARROW)
							{
								if(item.checked)
									this._selectChangeOnItem(highlighted,item);
								break;
							}
							if(!item.checked)
								this._selectChangeOnItem(highlighted,item);
							if(key == keys.RIGHT_ARROW)
								break;
						}	
					}
					// prevent submit if ENTER was to choose an item
					evt.stopPropagation();
					evt.preventDefault();
				}
				else
				{
					if(key == keys.LEFT_ARROW || key == keys.RIGHT_ARROW)
						break;
				}	
				if(key == keys.ENTER)
					this._setValueAttr("");
			case keys.TAB:
				if(key == keys.TAB && !evt.shiftKey)
				{
					setTimeout(function(){
						var pWidget = pe.scene.editor.getACLHandler()._pane._newPermissionWidget;
						if(pWidget.userIcons.userList.childElementCount > 0)
						{
							pWidget.userIcons.userList.firstChild.firstChild.focus();
						}
					},100);
				}	
			case keys.ESCAPE:
				if(this._opened){
					this._lastQuery = null; // in case results come back later
					this.closeDropDown();
				}
				break;
		}
	},
	
	labelFunc: function(item, store)
	{
		if(!item.email)
			return item.name;
		return item.name + " " + "<" + item.email + ">";
	}
});

dojo.require("dijit.form._ComboBoxMenu");

dojo.declare("websheet.ACL.UserComboBoxMenu",dijit.form._ComboBoxMenu,{
	
	_checkBoxs: null,
	
	//used to make when select one menuItem, the popup would not call onExecute()
	onExecute: function()
	{
		
	},
	
	_escapeHtml: function(/*String*/ str){
		// TODO Should become dojo.html.entities(), when exists use instead
		// summary:
		//		Adds escape sequences for special characters in XML: `&<>"'`
		str = String(str).replace(/&/gm, "&amp;").replace(/</gm, "&lt;")
			.replace(/>/gm, "&gt;").replace(/"/gm, "&quot;"); //balance"
		return str; // string
	},
	
	postCreate: function(){
		this.inherited(arguments);
		dojo.addClass(this.containerNode,"userSelectorMenu");
	},
	
	clearResultList: function(){
		// summary:
		//		Clears the entries in the drop down list, but of course keeps the previous and next buttons.
		this.inherited(arguments);
		if(this._checkBoxs)
		{
			this._checkBoxs.forEach(function(cb){
				cb.destroy();
			});
		}
		this._checkBoxs = [];
	},

	_onCheckBoxClick: function(item){
		item.checked = !item.checked; 
		checkBox.set("checked",item.checked);
	},
	
	_addCheckBox: function(cb) {
		if(!this._checkBoxs)
			this._checkBoxs = [];
		this._checkBoxs.push(cb);
	},
	_createMenuItem: function(item){
		
		// note: not using domConstruct.create() because need to specify document
		var mItem = this.ownerDocument.createElement("div");
		mItem.className = "dijitReset dijitMenuItem" +(this.isLeftToRight() ? "" : " dijitMenuItemRtl");
		mItem.setAttribute("role", "option");
		var checkBox =  new dijit.form.CheckBox({});
		this._addCheckBox(checkBox);
		dojo.connect(mItem,"onclick", function(){
			if(dojo.hasClass(mItem,"disable")) return;
			item.checked = !item.checked; 
			checkBox.set("checked",item.checked);
		});
		item.widgetId = checkBox.id;
		checkBox.set("checked",!!item.checked);
		mItem.appendChild(checkBox.domNode);
		var lable = dojo.create("div",null,mItem);
		dojo.addClass(lable,"userLable");
		if(item.id == "everyone" || item.id =="everyoneExceptMe")
			dojo.style(lable,{"font-weight":"bold"});
		if(item.seperator)
			dojo.style(mItem,{"border-bottom":"1px solid #c0c0c0"});
		if(item.disable)
		{
			dojo.addClass(mItem,"disable");
			checkBox.set("disabled",true);
		}	
		return mItem;
	},
	
	
	_createOption: function(/*Object*/ item, labelFunc){
		// summary:
		//		Creates an option to appear on the popup menu subclassed by
		//		`dijit/form/FilteringSelect`.

		var menuitem = this._createMenuItem(item);
		var labelDiv = dojo.query(".userLable",menuitem)[0];
		var labelObject = labelFunc(item);
//		labelDiv.innerHTML = labelObject.label;
		if(labelObject.html){
			labelDiv.innerHTML = labelObject.label;
		}else{
			labelDiv.innerHTML = this._escapeHtml(labelObject.label);
		}
		// #3250: in blank options, assign a normal height
		if(menuitem.innerHTML == ""){
			menuitem.innerHTML = "&#160;";	// &nbsp;
		}
		return menuitem;
	},
	
	onUnhover: function(/*DomNode*/ node){
		// summary:
		//		Remove hover CSS
		dojo.removeClass(node, "dijitMenuItemHover");
		if(dojo.hasClass(node,"dijitMenuItemSelected"))
		{
			dojo.removeClass(node, "dijitMenuItemSelected");
		}
	},
	
	_onMouseDown: function(/*Event*/ evt, /*DomNode*/ target){
		//overide the default behavior
//		if(this._hoveredNode){
//			this.onUnhover(this._hoveredNode);
//			this._hoveredNode = null;
//		}
		this._isDragging = true;
		this._setSelectedAttr(target, false);
	}
});