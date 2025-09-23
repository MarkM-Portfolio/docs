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

dojo.provide("writer.ui.widget.CellBorder");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("concord.util.BidiUtils");
dojo.require("writer.ui.widget.CellBorderWidth");
dojo.require("writer.ui.widget.CellBorderRange");
dojo.require("writer.ui.widget.CellBorderColor");
dojo.require("writer.ui.widget.CellBorderType");
dojo.requireLocalization("writer.ui.widget","CellBorder");

dojo.declare('writer.ui.widget.CellBorder', [dijit._Widget, dijit._Templated], {
	
	widgetsInTemplate: true,
	templateString: dojo.cache("writer.ui.widget", "templates/CellBorder.html"),
	_currentFocus:null,
	
	postMixInProperties: function()
	{
		this.inherited(arguments);
		this.nls = dojo.i18n.getLocalization("writer.ui.widget","CellBorder");
	},
	onOpen: function()
	{
		pe.cellBorderSet = false;
		this.rangePanel.onOpen();
		this._currentFocus = this.rangePanel;
	},
	postCreate: function()
	{
		this.inherited(arguments);
		this.connect(this.rangePanel,"onChange",this.changeBorder);
		this.connect(this.widthPicker,"onChange",this.changeBorder);
		this.connect(this.typePicker,"onChange",this.changeBorder);
		this.connect(this.colorBtn,"onChange",this.changeBorder);
		this.connect(this,"onKeyDown",this._onKeyDown);
		this.domNode.tabIndex = "-1";
	},

	focus:function()
	{
		if(!this._currentFocus)
			this._currentFocus = this.rangePanel;
		this._currentFocus.focus();
	},
	
	onClose: function()
	{
		pe.cellBorderPanelOpen = false;
		if (pe.cellBorderSet)
		{
			// focus to editor.
			setTimeout(function(){
				pe.lotusEditor.focus();
			}, 100);
		}
		pe.cellBorderSet = false;
	},

	changeBorder:function()
	{
		var rangeType = this.rangePanel.get("value");
		var style = this.typePicker.get("value");
		this.widthPicker.setLimited(style == "double");
		if(!this.rangePanel.isSelected())
			return;
		var width = this.widthPicker.get("value");
		var color = this.colorBtn.get("value");
		var border = {
			width:width + "pt",
			style:style,
			color:color
		};
		setTimeout(function(){
			pe.cellBorderPanelOpen = true;
			pe.cellBorderSet = true;
			pe.lotusEditor.execCommand("setCellBorder", [border,rangeType]);
		},0);
	},

	_onKeyDown: function(evt)
	{
		var keys = dojo.keys;			
		if(evt.charCode == keys.TAB || evt.keyCode == keys.TAB){
			evt.shiftKey ? this._movePre() : this._moveNext();
			dojo.stopEvent(evt);
		}
		if(evt.chatCode == keys.ENTER || evt.keyCode == keys.ENTER)
		{
			dojo.stopEvent(evt);
		}
	},

	_movePre: function()
	{
		if(this._currentFocus == this.rangePanel){
			this._currentFocus = this.colorBtn;
		}
		else if(this._currentFocus == this.widthPicker){
			this._currentFocus = this.rangePanel;
		}
		else if(this._currentFocus == this.typePicker){
			this._currentFocus = this.widthPicker;
		}
		else if(this._currentFocus == this.colorBtn){
			this._currentFocus = this.typePicker;
		}
		this.focus();
	},

	_moveNext: function()
	{
		if(this._currentFocus == this.rangePanel){
			this._currentFocus = this.widthPicker;
		}
		else if(this._currentFocus == this.widthPicker){
			this._currentFocus = this.typePicker;
		}
		else if(this._currentFocus == this.typePicker){
			this._currentFocus = this.colorBtn;
		}
		else if(this._currentFocus == this.colorBtn){
			this._currentFocus = this.rangePanel;
		}
		this.focus();
	}
});
