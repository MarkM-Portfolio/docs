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

dojo.provide("writer.ui.widget.CellBorderRange");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("writer.ui.toolbar.Toolbar");
dojo.require("writer.util.CellBorderTools");
dojo.require("dijit.form.ToggleButton");
dojo.requireLocalization("writer.ui.widget","CellBorder");

dojo.declare('writer.ui.widget.CellBorderRange', [dijit._Widget,dijit._Templated], {
	
	templateString: "<div class='cellBorderRange docPalette' role='grid'><div dojoAttachPoint='line1' role='row'></div><div dojoAttachPoint='line2' role='row'></div></div>",
	_curIndex: 0,
	_curSelect: -1,
	constructor: function()
	{
		this.inherited(arguments);
		var constant = writer.util.CellBorderTools.Constant.RANGE;
		this.types = [constant.CLEAR,constant.ALL,constant.INNER,constant.HORIZONTAL,constant.VERTICAL,
		constant.OUTER,constant.LEFT,constant.TOP,constant.RIGHT,constant.BOTTOM];
	},

	onOpen: function()
	{
		this._curIndex = 0;
		if(this._curSelect > -1){
			var curContainer = this._curSelect < 5 ? this.line1 : this.line2;
			dojo.removeClass(curContainer.childNodes[this._curSelect % 5],"selected");
		}
		this._curSelect = -1;
	},

	isSelected: function()
	{
		return this._curSelect > -1;
	},

	postCreate: function()
	{
		this.inherited(arguments);
		var titles =  this.getTitles();
		for(var i = 0; i < 10; i++)
		{
			var container = i < 5 ? this.line1 : this.line2;
			var a = dojo.create("a", {
				className: "dijitPaletteCell borderRangerCell",
				tabIndex: "-1",
				title:titles[i],
				role: "gridCell"
			}, container);
			dojo.create("span", {
				className: "dijitPaletteSpan " + this.types[i] + "Border",
				tabIndex: "-1"
			}, a);
			this.connect(a,"onclick",dojo.hitch(this,this._onClick,i));
		}
		var container = this._curIndex < 5 ? this.line1 : this.line2;
		var curNode = container.childNodes[this._curIndex % 5];
		curNode.childNodes[0].focus();
		this.connect(this,"onKeyDown",this._onKeyDown);
	},
	
	_onClick: function(index,evt)
	{
		dojo.stopEvent(evt);
		this.selectNode(index);
	},

	_getValueAttr: function()
	{
		return this.types[this._curIndex];
	},

	_onKeyDown: function(evt)
	{
		var keys = dojo.keys;	
		if(evt.charCode == keys.LEFT_ARROW || evt.keyCode == keys.LEFT_ARROW){
			evt.shiftKey ? this._moveNextNode() : this._movePreNode();
			return dojo.stopEvent(evt);
		}
		if(evt.charCode == keys.RIGHT_ARROW || evt.keyCode == keys.RIGHT_ARROW){
			evt.shiftKey ? this._movePreNode() : this._moveNextNode();
			return dojo.stopEvent(evt);
		}
		if(evt.charCode == keys.UP_ARROW || evt.keyCode == keys.UP_ARROW){
			evt.shiftKey ? this._moveDownNode() : this._moveUpNode();
			return dojo.stopEvent(evt);
		}
		if(evt.charCode == keys.DOWN_ARROW || evt.keyCode == keys.DOWN_ARROW){
			evt.shiftKey ? this._moveUpNode() : this._moveDownNode();
			return dojo.stopEvent(evt);
		}
		if(evt.charCode == keys.ENTER|| evt.keyCode == keys.ENTER ||
			evt.charCode == keys.SPACE || evt.keyCode == dojo.keys.SPACE) {
			this.selectNode(this._curIndex);
			return dojo.stopEvent(evt);
		}
	},

	_moveNextNode: function()
	{
		this._moveFocus((this._curIndex + 1) % 10);
	},

	_movePreNode: function()
	{
		this._moveFocus((this._curIndex + 9) % 10);
	},

	_moveUpNode: function()
	{
		this._moveFocus((this._curIndex + 5) % 10);
	},

	_moveDownNode: function()
	{
		this._moveFocus((this._curIndex + 5) % 10);
	},

	_moveFocus: function(index)
	{
		var container = index < 5 ? this.line1 : this.line2;
		var newNode = container.childNodes[index % 5];
		newNode.childNodes[0].focus();
		this._curIndex = index;
	},

	selectNode: function(index)
	{
		if(this._curSelect > -1){
			var curContainer = this._curSelect < 5 ? this.line1 : this.line2;
			dojo.removeClass(curContainer.childNodes[this._curSelect % 5],"selected");
		}
		var container = index < 5 ? this.line1 : this.line2;
		var newNode = container.childNodes[index % 5];
		dojo.addClass(newNode,"selected");
		this._curSelect = index;
		newNode.childNodes[0].focus();
		this._curIndex = index;
		this.onChange && this.onChange(this.types[this._curIndex]);
	},

	focus: function()
	{
		var container = this._curIndex < 5 ? this.line1 : this.line2;
		container.childNodes[this._curIndex % 5].childNodes[0].focus();
	},

	getTitles: function(){
		var nls = dojo.i18n.getLocalization("writer.ui.widget","CellBorder");
		return [
			nls.clearBorders,
			nls.allBorders,
			nls.innerBorders,
			nls.horizontalBorders,
			nls.verticalBorders,
			nls.outerBorders,
			nls.leftBorder,
			nls.topBorder,
			nls.rightBorder,
			nls.bottomBorder
		];
	}
});
