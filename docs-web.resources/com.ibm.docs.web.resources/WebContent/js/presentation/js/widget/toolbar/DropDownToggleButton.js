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

dojo.provide("pres.widget.toolbar.DropDownToggleButton");

dojo.require("dijit.form.ComboButton");
dojo.require("dijit.form._ToggleButtonMixin");
dojo.require("pres.widget.toolbar.ButtonMixin");
dojo.require("pres.widget.toolbar.DropDownMixin");

dojo.declare("pres.widget.toolbar.DropDownToggleButton", [dijit.form.ComboButton, dijit.form._ToggleButtonMixin, pres.widget.toolbar.DropDownMixin, pres.widget.toolbar.ButtonMixin], {

	baseClass: "dijitDropDownToggleButton",
	
	templateString : dojo.cache("pres" ,"templates/DropDownComboButton.html"),

	postCreate: function()
	{
		this.inherited(arguments);
		this.dropDown = this.createDropDown();
		this.set("label", "");
	},

	onClick: function()
	{
		if (this.disabled)
			return;
		if (this.cmd)
		{
			dojo.publish("/command/exec", [this.cmd, this.attr("checked")]);
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