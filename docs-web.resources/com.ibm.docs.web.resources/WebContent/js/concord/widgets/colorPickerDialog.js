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

dojo.provide("concord.widgets.colorPickerDialog");
dojo.require("dojox.widget.ColorPicker");
dojo.require("concord.widgets.concordDialog")
dojo.declare("concord.widgets.colorPickerDialog", [concord.widgets.concordDialog], {
	_colorPicker : null,
	_pickerId : 'id_colorPicker',
	
	/* The dialog parameters include two object:
	 * defaultColor: The default color in color picker.
	 * callback: Set color call back function. 
	 */
	createContent: function(contentDiv) {
		var picker = dojo.create( "div", null, contentDiv  );
		dojo.attr(picker, {'id':this._pickerId});
		this._colorPicker = new dojox.widget.ColorPicker({}, this._pickerId);
		var defaultColor = this.params && this.params.defaultColor;
		if(defaultColor)
			this._colorPicker.setColor(defaultColor);
	},

	setDialogID: function() {
		this.dialogId = "C_D_colorPicker";
	},

	onOk: function(editor){
		var color = this._colorPicker.value;
		if(this.params && this.params.callback)
			this.params.callback(color);
		
		return true;
	}
	
});