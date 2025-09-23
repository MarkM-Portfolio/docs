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

dojo.provide("pres.widget.toolbar.ColorPicker");

dojo.require("pres.widget.toolbar.DropDownComboButton");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("pres.widget.common.ColorPalette");

dojo.declare("pres.widget.toolbar.ColorPicker", [pres.widget.toolbar.DropDownComboButton], {

	// palette button
	showButton: true,
	
	buttonValue: "#000000",
	
	postCreate: function()
	{
		this.inherited(arguments);
		this.colorIndicator = dojo.create("div", {
			"className": "colorDiv",
			"tabIndex": -1
		}, this.iconNode);
	},

	_setButtonValueAttr: function(value)
	{
		this.buttonValue = value;
		var bgColor = value == "transparent" ? "#F1F1F1" : value;
		if (this.colorIndicator)
			this.colorIndicator.style.backgroundColor = bgColor;
	},

	_getValueAttr: function()
	{
		return this.dropDown.getValue();
	},

	_setValueAttr: function(value)
	{
		//rollback Task 50628 remove code related with setOpacity.
		if (value)
		{
			if (value === "transparent")
				this.dropDown.setValue(value);
			else
			{
				var colorValue = dojo.Color.fromString(dojo.trim(value));
				if (colorValue)
					this.dropDown.setValue(colorValue.toHex());
				else
					this.dropDown.setValue("");
			}
		}
		else
			this.dropDown.setValue("");
	},
	
	_setForNoFillAttr: function(value)
	{
		this.forNoFill = value;
		this.palette && this.palette.set("forNoFill", value);
	},

	createDropDown: function()
	{
		this.palette = new pres.widget.common.ColorPalette({
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager,
			cmd: this.cmd,
			id: this.id + "_popup",
			onChange: dojo.hitch(this, this.onChange),
			showButton: this.showButton,
			forNoFill: this.forNoFill,
			forBorder: this.forBorder
		});
		this.palette.delegator = this;
		return this.palette;
	},

	_onBlur:function()
	{
		if(this.dropDown.lineTypePanel)
		{
			if( pe.scene.slideEditor.borderStylePanelShow )
			{
				if(this.dropDown.lineTypePanel.lineWidthButton.dropDown.activated)
				{
					this.dropDown.lineTypePanel.lineWidthButton.closeDropDown();
					this.dropDown.focus();
				}
				else if(this.dropDown.lineTypePanel.endpointsButton.dropDown.activated )
				{
					this.dropDown.lineTypePanel.endpointsButton.closeDropDown();
					this.dropDown.focus();
				}
				else if(this.dropDown.lineTypePanel.dashTypeButton.dropDown.activated )
				{
					this.dropDown.lineTypePanel.dashTypeButton.closeDropDown();
					this.dropDown.focus();	
				}
			}	
			else
			{
				//when click scroll bar , table dom is focused
				if(!dojo.isIE || (dojo.isIE &&!((table = dojo.query("table",document.activeElement)[0])&& /pres_widget_toolbar_LineType/.test(table.id))))
					this.closeDropDown(true);
			}		

		}
		else
		{
			this.closeDropDown(false);
			this.inherited(arguments);
		}
	}
});