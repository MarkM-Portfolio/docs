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

dojo.provide("pres.widget.toolbar.DropDownButton");

dojo.require("dijit.form.DropDownButton");
dojo.require("pres.widget.toolbar.ButtonMixin");
dojo.require("pres.widget.toolbar.DropDownMixin");

dojo.declare("pres.widget.toolbar.DropDownButton", [dijit.form.DropDownButton, pres.widget.toolbar.DropDownMixin, pres.widget.toolbar.ButtonMixin], {

	postCreate: function()
	{
		this.inherited(arguments);
		this.dropDown = this.createDropDown();
	},

	startup: function()
	{
		if (this._started)
			return;
		this.inherited(arguments);
		this.set("label", "");
	},

	_getValueAttr: function()
	{
		return this.label;
	},

	_setValueAttr: function(value)
	{
		this.set("label", value);
		if (this.dropDown)
		{
			dojo.forEach(this.dropDown.getChildren(), (function(item)
			{
				if (item.label == value)
				{
					item.set("checked", true);
					item.set("selected", true);
				}
				else
				{
					item.set("checked", false);
					item.set("selected", false);
				}
			}));
		}
	}

});