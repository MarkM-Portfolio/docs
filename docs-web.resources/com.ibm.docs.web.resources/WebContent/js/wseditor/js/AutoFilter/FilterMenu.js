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

dojo.provide("websheet.AutoFilter.FilterMenu");

dojo.require("dijit.Menu");
dojo.require("dijit.MenuItem");
dojo.require("dijit.CheckedMenuItem");
dojo.require("concord.util.BidiUtils");
dojo.require("dijit.form.Button");
dojo.require("concord.widgets.LotusTextButton");
dojo.require("websheet.AutoFilter.CustomFilter");
dojo.require("dijit._Templated");

dojo.requireLocalization("websheet.AutoFilter","FilterMenu");

dojo.declare('websheet.AutoFilter._Menu', dijit.Menu,{
	
	onItemHover: function(/*MenuItem*/ item){
		this.inherited(arguments);
		this.focusChild(item);
	},
	
	focusNext: function(){
		this.onNext();
	},
	
	onNext: function()
	{
		
	},

	focusPrev: function(){
		this.onPrev();
	},
	
	onPrev: function()
	{
		
	}
});

dojo.declare('websheet.AutoFilter.FilterMenu', [dijit._Widget, dijit._Templated, dijit._KeyNavContainer],{
	widgetsInTemplate: true,
	templateString: dojo.cache("websheet", "templates/FilterMenu.html"),
	
	change: null,
	impactAll: false,   //when user click clear or select all button, means all the keywords been impacted, then this flag set to true, the change has no use in this way
	index: 0,
	type: "key",
	keys: null,
	status: null,
	helper:websheet.Helper,
	editor: null, // editor
	
	maxItems: 1000,	// currently support up to 1000 checked menu items in the filter context menu to have good performance of initial open dialog
					// TODO need better way to support 10000 checked menu items later w/o performance regress on the initial open 
	
	constructor: function()
	{
		this.nls = dojo.i18n.getLocalization("websheet.AutoFilter","FilterMenu");
		this.dir = BidiUtils.isGuiRtl() ? 'rtl' : '';
		this.editor = websheet.model.ModelHelper.getEditor();
	},
	
	destroy: function()
	{
		if(this._appending)
		{
			this._appending.remove();
		}
		this.inherited(arguments);
	},
	
	postCreate: function()
	{
		this.inherited(arguments);
		
		var k = dojo.keys, l = this.isLeftToRight();
		this.connect(this.domNode,"onkeydown","onKeyDown");
		
		this.connectKeyNavHandlers([k.UP_ARROW], [k.DOWN_ARROW]);
		
		
		this.connect(this.common,"onNext","_onNextCommon");
		this.connect(this.common,"onPrev","_onPrevCommon");
		
		this.connect(this.keywordlist,"onNext","_onNextKeyword");
		this.connect(this.keywordlist,"onPrev","_onPrevKeyword");
		
		websheet.Utils.setSelectable(this.domNode, false);
		
		this.clearBtn.setDisabled(false);
		this.selectAllBtn.setDisabled(true);
		
		if(this.editor.scene.isViewMode(true)){
			dojo.style(this.sortAZ.domNode, "display", "none");
			dojo.style(this.sortZA.domNode, "display", "none");
			dojo.style(this.sortZA.getNextSibling().domNode, "display", "none");			
		}
		this.connect(this.sortAZ,"onClick","_sortAZ");
		dijit.setWaiState(this.sortAZ.domNode,"label",this.nls.STR_SortAscending);
		
		this.connect(this.sortZA, "onClick", "_sortZA");
		dijit.setWaiState(this.sortZA.domNode,"label",this.nls.STR_SortDescending);
		
		this.connect(this.customFilter, "onClick", "custom");
		dijit.setWaiState(this.customFilter.domNode,"label",this.nls.CustomFilter);
		
		this.connect(this.clearFilterItem, "onClick", "clearFilter");
		dijit.setWaiState(this.clearFilterItem.domNode,"label",this.nls.ClearFilter);
		
		this.connect(this.clearBtn,"onClick","clear");
		dijit.setWaiState(this.clearBtn.focusNode,"label",this.nls.STR_DESELECT_ALL);
		
		this.connect(this.selectAllBtn, "onClick", "selectAll");
		dijit.setWaiState(this.selectAllBtn.focusNode,"label",this.nls.STR_SELECT_ALL);
		
		this.connect(this.okBtn, "onClick", "submit");
		dijit.setWaiState(this.okBtn.focusNode,"label",this.nls.STR_OK_LABEL);
		
		this.connect(this.cancelBtn, "onClick", "cancel");
		dijit.setWaiState(this.cancelBtn.focusNode,"label",this.nls.STR_CANCEL_LABEL);
	},
	
	onKeyDown: function(event)
	{
		if(event.keyCode == dojo.keys.TAB)
		{
			event.preventDefault();
			event.stopPropagation();
			if(event.shiftKey)
			{
				if(this.focusedChild.dojoAttachPoint == "common")
					this._onPrevCommon();
				else if(this.focusedChild.dojoAttachPoint == "keywordlist")
					this._onPrevKeyword();
				else
					this.focusPrev();
			}	
			else
			{
				if(this.focusedChild.dojoAttachPoint == "common")
					this._onNextCommon();
				else if(this.focusedChild.dojoAttachPoint == "keywordlist")
					this._onNextKeyword();
				else
					this.focusNext();
			}	

		}	
	},
	
	focusNext: function()
	{
		if(this.focusedChild==this.clearBtn)
		{
			if(this.selectAllBtn.isFocusable())
				this.focusChild(this.selectAllBtn);
			else
				this.keywordlist.focusFirstChild();
		}
		else if(this.focusedChild==this.selectAllBtn)
			this.keywordlist.focusFirstChild();
		else if(this.focusedChild==this.okBtn)
			this.focusChild(this.cancelBtn);
		else if(this.focusedChild==this.cancelBtn)
			this.common.focusFirstChild();
	},
	
	focusPrev: function()
	{
		if(this.focusedChild==this.cancelBtn)
		{
			if(this.okBtn.isFocusable())
				this.focusChild(this.okBtn);
			else
				this.keywordlist.focusLastChild();
		}
		else if(this.focusedChild==this.okBtn)
			this.keywordlist.focusLastChild();
		else if(this.focusedChild==this.selectAllBtn)
		{
			if(this.clearBtn.isFocusable())
				this.focusChild(this.clearBtn);
			else
				this.common.focusLastChild();
		}
		else if(this.focusedChild==this.clearBtn)
			this.common.focusLastChild();
	},
	
	_onNextCommon: function()
	{
		var child = this.common.focusedChild;
		if(child)
		{
			child = this.common._getSiblingOfChild(child, 1);
			if(child && !child.isFocusable())
				child = this.common._getSiblingOfChild(child, 1);
		}
		
		if(child)
			this.common.focusChild(child);
		else
		{
			if(this.clearBtn.isFocusable())
				this.focusChild(this.clearBtn);
			else
				this.focusChild(this.selectAllBtn);
		}
	},
	
	_onNextKeyword: function()
	{
		var child = this.keywordlist.focusedChild;
		if(child)
			child = this.keywordlist._getSiblingOfChild(child, 1);
		
		if(child && child.isFocusable())
			this.keywordlist.focusChild(child);
		else
		{
			if(this.okBtn.isFocusable())
				this.focusChild(this.okBtn);
			else
				this.focusChild(this.cancelBtn);
		}
	},
	
	_onPrevCommon: function()
	{
		var child = this.common.focusedChild;
		if(child)
		{
			child = this.common._getSiblingOfChild(child, -1);
			if(child && !child.isFocusable())
				child = this.common._getSiblingOfChild(child, -1);
		}
		
		if(child)
			this.common.focusChild(child);
		else
			this.focusChild(this.cancelBtn);
	},
	
	_onPrevKeyword: function()
	{
		var child = this.keywordlist.focusedChild;
		if(child)
			child = this.keywordlist._getSiblingOfChild(child, -1);
		
		if(child && child.isFocusable())
			this.keywordlist.focusChild(child);
		else
		{
			if(this.selectAllBtn.isFocusable())
				this.focusChild(this.selectAllBtn);
			else
				this.focusChild(this.clearBtn);
		}
	},
	
	_sortAZ: function()
	{
		this.sort(true);
	},
	
	_sortZA: function()
	{
		this.sort(false);
	},
	
	clearFilter: function()
	{
		var data = {type:this.type, clear: 1};
		this.editor.execCommand(window.commandOperate.FILTERROWS,[this.index, data]);
	},
	
	custom: function()
	{
		if(!this.customFilterDlg)
			this.customFilterDlg = new websheet.AutoFilter.CustomFilter(this.editor,this.nls.CustomFilter);
		this.hideMenu();
		this.customFilterDlg.sheetName = this.sheetName;
		this.customFilterDlg.col = this.index;
        var docObj = this.editor.getDocumentObj();
        var sheet = docObj.getSheet(this.sheetName);
		this.customFilterDlg.colId = sheet.getColId(this.index-1);
		this.customFilterDlg.sheetId = sheet.getId();
		
		this.customFilterDlg.show();
	},
	
	sort: function(acending)
	{
		this.hideMenu();
		var filter = this.editor.getAutoFilterHdl().getFilter(this.sheetName);
		if(filter)
		{
			filter.sort(acending);
		}	
	},
	
	selectAll: function()
	{
		this.clearBtn.setDisabled(false);
		this.selectAllBtn.setDisabled(true);
		this.okBtn.setDisabled(false);
		this.selectedItemNum = this.status.show.length;
		
		this.impactAll = true;
		
		var children = this.keywordlist.getChildren();
		for(var i=0;i<children.length;i++)
		{
			var menuItem = children[i];
			menuItem._setCheckedAttr(true);
		}
	},
	
	clear: function()
	{
		this.clearBtn.setDisabled(true);
		this.selectAllBtn.setDisabled(false);
		this.okBtn.setDisabled(true);
		
		this.selectedItemNum = 0;
		this.impactAll = true;
		
		var children = this.keywordlist.getChildren();
		for(var i=0;i<children.length;i++)
		{
			var menuItem = children[i];
			menuItem._setCheckedAttr(false);
		}
	},
	
	submit: function()
	{
		this.hideMenu();
		
		var filter = this.editor.getAutoFilterHdl().getFilter(this.sheetName);
		var ref = filter._range._parsedRef;
		var sr = ref.startRow, 
			er = ref.endRow < filter._expandRow ? filter._expandRow : ref.endRow,
			sc = ref.startCol,
			ec = ref.endCol;
		var addr = websheet.Helper.getAddressByIndex(this.sheetName,sr,sc,null,er,ec,{refMask:websheet.Constant.RANGE_MASK});
//		if(this.editor.hasACLHandler())
//		{
//			var bhChecker = this.editor.getACLHandler()._behaviorCheckHandler;
//			if(!bhChecker.canCurUserEditRange(addr))
//			{
//				bhChecker.cannotEditWarningDlg();
//				return;
//			}
//		}	
		var data = null;
		//if select all the show items, means the rule of this column would be deleted
		var hasChange = this.impactAll;
		if(!hasChange && this.change)
		{
			for(var sv in this.change.items)
			{
				hasChange = true;
				break;
			}
		}	
		if (hasChange && this.selectedItemNum==this.status.show.length) {
			data = {type:this.type, clear: 1};
		} else if (this.status != null) {
			var displayItems = this.status.show;   //The keywords display in the menu
			var hiddenItems = this.status.hidden;
					
			if(hasChange)
				data = {type: this.type};
			
			var filter = this.editor.getAutoFilterHdl().getFilter(this.sheetName);
			if(hasChange && filter)
			{
				var oriRule = filter.getRule(this.index);
				if(!oriRule || !oriRule.keys || this.impactAll)  //new created keywords
				{
					data.set = {keys:[]};
					var children = this.keywordlist.getChildren();
					for(var i=0;i<children.length;i++)
					{
						var menuItem = children[i];
						if(menuItem.checked)
						{
							var item = displayItems[i];
							data.set.keys.push((item.sv || "").toLowerCase());
						}
					}
				}
				else  //modify keyword
				{
					data.del = [];
					data.add = [];
					for(var sv in this.change.items)
					{
						var item = this.change.items[sv];
						//change from checked to unchecked
						if(item.checked)
							data.del.push(sv);
						else
							data.add.push(sv);
					}
					
					//The keys hidden by other filter rules
					for(var i=0;i<hiddenItems.length;i++)
					{
						var sv = hiddenItems[i].sv;
						if(sv in oriRule.keys)
							data.del.push(sv);
					}
				}
			}
		}
		if(data)
			this.editor.execCommand(window.commandOperate.FILTERROWS,[this.index, data]);
	},
	
	hideMenu: function()
	{
		try {
			this.editor.getController().getInlineEditor().show();
		} catch (e) {}
		var filter = this.editor.getAutoFilterHdl().getFilter(this.sheetName || this.editor.getCurrentGrid().getSheetName());
		if(filter)
		{
			filter.hideMenu();
		}
	},
	
	cancel: function()
	{
		this.hideMenu();
	},
	
	onOpen: function(/*Event*/ e)
	{
		this.focus();
		try {
			this.editor.getController().getInlineEditor().hide();
		} catch (e) {};
	},
	
	//index is the column index
	setStatus: function(sheetName,index, status, hasCustomFilter, hasRule)
	{
		this.change = null;
		this.impactAll = false;
		this.index = index;
		this.sheetName = sheetName;
		this.status = status;
//		this.keywordlist.destroyDescendants();
		this.okBtn.setDisabled(false);
		
		this.selectedItemNum = 0;
		
//		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
//		this.workingLabel.style.display = "none";
		for(var i=0;i<status.show.length;i++)
		{
			var keyInfo = status.show[i];
			var onelinesv = keyInfo.sv.replace(/\n/gm, "");
			keyInfo.esv = this.helper.escapeXml(onelinesv);
			if(keyInfo.dir && keyInfo.esv.length != 0)
				keyInfo.esv = BidiUtils.addEmbeddingUCCwithDir(keyInfo.esv, keyInfo.dir);

//			var item = new dijit.CheckedMenuItem({label:showValue || this.nls.STR_EMPTY_STRING, checked:keyInfo.checked,dir: dirAttr});
//			dijit.setWaiState(item.domNode,"label",keyInfo.sv);
			
			if(keyInfo.checked)
				this.selectedItemNum++;
//			this.keywordlist.addChild(item);
//			this.connect(item,"onClick",dojo.hitch(this,"_clickItem",item, keyInfo));
		}
		this.keywordlistWrapper.style.display = 'none';
		if (!this._appending) {
			this._appendItems();
		} else {
			this._suspendMenuPopup = true;
		}
		this.selectAllBtn.setDisabled(this.selectedItemNum==this.status.show.length);
//		this.okBtn.setDisabled(false);
		this.clearBtn.setDisabled(false);
		
		this.customFilter.set("checked",hasCustomFilter);
		this.okBtn.setDisabled(hasCustomFilter);
		this.clearFilterItem.set('disabled', !hasRule);
	},
	
	_cachingItems: function() {
		var menu = this.keywordlist;
		var more = true;
		
		if (menu._cached == null) {
			menu._cached = [];
		}
		var cached = menu._cached;
		
		if (cached.length >= this.maxItems) {
			if (this._suspendMenuPopup) {
				this._appendItems();
			}
			delete this._appending;
			return;
		}
		var from = cached.length;
		var to = from + 500;
		
		if(to > this.maxItems){
			to = this.maxItems;
			more = false;
		}
		
		for (var i = from, item; i < to; i ++) {
			item = new dijit.CheckedMenuItem({
				label 	: '', 
				checked : false,
				dir 	: this.dir,
				_used 	: false
			});
			this.connect(item, "onClick", dojo.hitch(this, "_clickItem", item));
			cached.push(item);
		}
		if (more) {
			var tm = this.editor.getTaskMan();
			this._appending = tm.addTask(this, '_cachingItems', [], tm.Priority.Normal, false, 
					dojo.isFF ? 200 : (this._suspendMenuPopup ? 0 : 100));
		} else {
			if (this._suspendMenuPopup) {
				this._appendItems();
			}
			delete this._appending;
		}
	},
	
	_appendItems: function()
	{
		delete this._suspendMenuPopup;
		var menu = this.keywordlist,
			keys = this.status.show,
			length = keys.length,
			cached = menu._cached,
			item,
			key;
		for (var i = 0; i < length; i++) {
			key = keys[i];
			if (item = cached[i]) {
				dijit.setWaiState(item.domNode, "label", key.sv);
				item.set('label', key.esv || this.nls.STR_EMPTY_STRING);
				item.set('checked', key.checked);
				item._info = key;
				if (item._used == false) {
					menu.addChild(item);
					item._used = true;
				}
			}
		}
		
		for ( var i = length, max = this.maxItems; i < max; i++) {
			if (item = cached[i]) {
				menu.removeChild(item);
				item._used = false;
			}
		}
		
		if (this.status.show.length > 500) {
			var self = this;
			setTimeout(function() {
				self.workingLabel.style.display = "none";
				self.keywordlistWrapper.style.display = '';
			}, 200);
		} else {
			this.workingLabel.style.display = "none";
			this.keywordlistWrapper.style.display = '';
		}
	},
	
	_clickItem: function(item)
	{
		var info = item._info;
		if(this.change==null)
			this.change = {type:"key", items:{}};

		if(item.checked)
			this.selectedItemNum++;
		else
			this.selectedItemNum--;
		
		this.selectAllBtn.setDisabled(this.selectedItemNum==this.status.show.length);
		this.clearBtn.setDisabled(this.selectedItemNum==0);
		this.okBtn.setDisabled(this.selectedItemNum==0);
			
		//Maybe user click one item several times, we only record the changed items
		//Not changed
		if(item.checked==info.checked)
			delete this.change.items[info.sv];
		else
			this.change.items[info.sv] = info;
	}
});