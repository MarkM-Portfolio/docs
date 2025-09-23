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

dojo.provide("pres.widget.toolbar.TablePicker");

dojo.require("pres.widget.toolbar.DropDownButton");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("pres.widget.common.TablePalette");

dojo.declare("pres.widget.toolbar.TablePicker", [pres.widget.toolbar.DropDownButton], {

	getValue: function()
	{
		return this.dropDown.value;
	},

	setValue: function(value)
	{
		this.dropDown.setValue(value);
	},

	createDropDown: function()
	{
		var palette = this.palette = new pres.widget.common.TablePalette({
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager,
			cmd: this.cmd,
			id: this.id + "_popup",
			onChange: dojo.hitch(this, this.onChange)
		});
		palette.delegator = this;
		return palette;
	},

	onChange: function(row, col)
	{
		dojo.publish("/command/exec", [this.cmd, this.palette.getValue()]);
	}

});