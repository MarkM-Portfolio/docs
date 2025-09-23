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

dojo.provide("pres.widget.toolbar.ListStyleBulletPicker");

dojo.require("pres.widget.toolbar.DropDownToggleButton");
dojo.require("pres.widget.common.ListStyleBullet");

dojo.declare("pres.widget.toolbar.ListStyleBulletPicker", [pres.widget.toolbar.DropDownToggleButton], {

	_getValueAttr: function()
	{
		return this.dropDown.getValue();
	},

	_setValueAttr: function(value)
	{
		if(!value || value.length == 0 || (value.length == 1 && value[0] == "none"))
			this.set("checked", false);
		else
			this.set("checked", true);
		this.dropDown.setValue(value);
	},

	createDropDown: function()
	{
		var palette = new pres.widget.common.ListStyleBullet({
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager,
			id: this.id + "_popup"
		});
		palette.delegator = this;
		return palette;
	}

});