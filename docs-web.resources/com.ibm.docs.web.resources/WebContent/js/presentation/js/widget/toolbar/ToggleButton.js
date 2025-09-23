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

dojo.provide("pres.widget.toolbar.ToggleButton");

dojo.require("dijit.form.ToggleButton");
dojo.require("dijit.Menu");
dojo.require("dijit.CheckedMenuItem");
dojo.require("pres.widget.toolbar.ButtonMixin");
dojo.declare("pres.widget.toolbar.ToggleButton", [dijit.form.ToggleButton, pres.widget.toolbar.ButtonMixin], {

	getValue : function()
	{
		return this.checked;
	},

	setValue : function(checked)
	{
		this.set("checked", checked);
	}

});