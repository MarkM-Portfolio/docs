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

dojo.provide("pres.widget.toolbar.DropDownComboButton");

dojo.require("dijit.form.ComboButton");
dojo.require("dijit.form._ToggleButtonMixin");
dojo.require("pres.widget.toolbar.ButtonMixin");
dojo.require("pres.widget.toolbar.DropDownMixin");

dojo.declare("pres.widget.toolbar.DropDownComboButton", [dijit.form.ComboButton, pres.widget.toolbar.DropDownMixin,
		pres.widget.toolbar.ButtonMixin], {

	templateString : dojo.cache("pres" ,"templates/DropDownComboButton.html"),
	
	postCreate: function()
	{
		this.inherited(arguments);
		this.dropDown = this.createDropDown();
		this.set("label", "");
	},

	onClick: function()
	{
		if (this.cmd)
		{
			dojo.publish("/command/exec", [this.cmd, this.buttonValue]);
		}
	},

	onChange: function()
	{
		var value = this.dropDown.getValue();
		this.attr("buttonValue", value);
		if (this.cmd)
		{
			dojo.publish("/command/exec", [this.cmd, value]);
		}
	},

	getValue: function()
	{
		return this.label;
	},

	setValue: function(value)
	{
		this.set("label", value);
		if (this.dropDown)
		{
			this.dropDown.forEach(function(item)
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
			});
		}
	}

});