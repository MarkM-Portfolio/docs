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
dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.DropDownMenu");
dojo.require("dijit.MenuItem");
dojo.requireLocalization("websheet.DataValidation","DataSelectionHelper");

dojo.provide("websheet.DataValidation.DataSelectionHelper");

dojo.declare("websheet.DataValidation.DataSelectionHelper", null, {
	_editor: null,
	dropDownButton: null,
	dropDownMenu: null,
	_sheetName: null,
	_rowIndex: null,
	_colIndex: null,
	
	constructor: function (editor) {
		this._editor = editor;
		this.dropDownMenu = new dijit.DropDownMenu({style:"display: none"});
		this.dropDownButton = new dijit.form.DropDownButton({
			dropDown : this.dropDownMenu,
			iconClass:"dataSelectionIcon"
		});
		dojo.addClass(this.dropDownButton.domNode,"dataSelectionList");
		
		dojo.connect(this.dropDownButton,"onMouseDown", dojo.hitch(this,"onMouseDown"));
		dojo.connect(this.dropDownMenu,"onItemClick", dojo.hitch(this,"onItemClick"));
		dojo.connect(this.dropDownMenu,"onOpen", dojo.hitch(this,"onOpen"));
	},
	
	showButton: function(dvRange, sheetName, rowIndex, colIndex, grid){
		this._sheetName = sheetName;
		this._rowIndex = rowIndex;
		this._colIndex = colIndex;
		this.grid = grid;
		
		var dataValidation = dvRange.data;
		var callBack = dojo.hitch(this, "_showButton");
		dataValidation.getList(dvRange, rowIndex, colIndex, callBack);
	},
	
	_showButton: function(list, dataList){
		this._dataList = dataList;
		var menuItems = this.dropDownMenu.getChildren();
		var i = 0;
		for( ; i < list.length && i < menuItems.length; i++){
			var menuItem = menuItems[i];
			var v = this._escapeStr(list[i]);
			menuItem.setLabel(v !== "" ? v : "&nbsp" );
		}
		
		for(var j = menuItems.length - 1; j >= i; j--)
			this.dropDownMenu.removeChild(j);
		
		for(; i < list.length; i++){
			var v = this._escapeStr(list[i]);	
			var menuItem = new dijit.MenuItem({label: v !== "" ? v : "&nbsp"});
			this.dropDownMenu.addChild(menuItem);
			dojo.style(menuItem.iconNode.parentElement, "display", "none");
			dojo.style(menuItem.arrowWrapper.parentElement, "display", "none");
			dojo.removeClass(menuItem.containerNode, "dijitMenuItemLabel");
		}
		
		this._position();
		
		var view = this.grid.contentViews;
		this.dropDownButton.placeAt(view);
		
		var selector = this.grid.selection.activeSelector();
		var attNode = selector.selectingCell() ? selector.domNode : selector.hotCell;
		this.dropDownButton.attr("_aroundNode", attNode);
		this.subScribe = dojo.subscribe("SelectionChanged", this, 'reSetAroundNode');
	},
	
	_escapeStr: function(str){
		str =  websheet.Helper.escapeXml(str);
		str = str.replace(/<br\/>/gm, "&nbsp");
		return str;
	},
	
	_position: function(){
		var selector = this.grid.selection.activeSelector();
		var attNode = selector.selectingCell() ? selector.domNode : selector.hotCell;
		if (attNode.offsetWidth == 0 || attNode.offsetHeight == 0 || !this.grid.scroller.isRowInVisibleArea(this._rowIndex - 1) || !this.grid.scroller.isColumnInVisibleArea(this._colIndex)) {
			this.dropDownButton.domNode.style.display = "none";
			return;
		}
		else
			this.dropDownButton.domNode.style.display = "";
		var left = attNode.offsetLeft + attNode.offsetWidth;
		var top = attNode.offsetTop + attNode.offsetHeight - 18;
		this.dropDownButton.domNode.style.left = left + "px";
		this.dropDownButton.domNode.style.top = top + "px";
	},
	
	hideButton: function(){
		this.dropDownButton.closeDropDown();
		var parent = this.dropDownButton.domNode.parentElement;
		if(parent)
			parent.removeChild(this.dropDownButton.domNode);
		dojo.unsubscribe(this.subScribe);
	},
	
	showMenu: function(){
		this.dropDownButton.openDropDown();
	},
	
	onArrowKey: function(){
		if(this.dropDownButton._opened){
			this.dropDownMenu.focusChild(this.dropDownMenu.getChildren()[0]);
			return true;
		}
		return false;
	},	
	
	update:function(){
		var parent = this.dropDownButton.domNode.parentElement;
		if(parent)
			this._position();
	},
	
	close:function(){
		this.dropDownButton.closeDropDown();
	},
	
	reSetAroundNode: function()
	{
		if(!this.grid || !this.grid.selection)
			return;
		var selector = this.grid.selection.activeSelector();
		var attNode = selector.selectingCell() ? selector.domNode : selector.hotCell;
		this.dropDownButton.attr("_aroundNode", attNode);
	},
	
	onOpen: function(){
		dojo.setMarginBox(this.dropDownMenu.domNode, {w:0});
		var popup = this.dropDownMenu._popupWrapper;
		dojo.style(popup, "overflow", "auto");
		dojo.style(popup, "max-height", "500px");
		dojo.style(popup, "max-width", this.dropDownButton._aroundNode.offsetWidth + 18 + "px");
		var doc = this._editor.getDocumentObj();
		var cell = doc.getCell(this._sheetName, this._rowIndex, this._colIndex);
		var v = cell ? cell.getCalculatedValue() : "";
		var idx = this._dataList.indexOf(v);
		if(idx >=0 )
			this.dropDownMenu.focusChild(this.dropDownMenu.getChildren()[idx]);
		else{
			var nls = dojo.i18n.getLocalization("websheet.DataValidation","DataSelectionHelper");
			var msg = nls.NOSELECTED;
			this.grid.announce(msg);
		}
		this.dropDownMenu._popupWrapper.style.zIndex = 10000;
		setTimeout(function () {
			popup.scrollLeft = '0';
		}, 10);
	},
	
	onItemClick: function(e){
		var menuItem = arguments[0];
		if(!menuItem)
			return;
		var idx = this.dropDownMenu.getIndexOfChild(menuItem);
		var value = this._dataList[idx];
		var self = this;
		this._editor.execCommand(commandOperate.CELLEDIT, [this._sheetName, value, this._rowIndex - 1, this._colIndex]).then(function () {
			self._editor.getController().getGrid(self._sheetName).updateRow(self._rowIndex - 1);
		});
	},
	 
	 onMouseDown: function(e){
		 dojo.stopEvent(e);
	 }
});
