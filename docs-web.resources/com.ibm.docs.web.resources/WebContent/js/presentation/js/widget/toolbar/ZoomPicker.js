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

dojo.provide("pres.widget.toolbar.ZoomPicker");

dojo.require("pres.widget.toolbar.DropDownButton");
dojo.require("dijit.form.HorizontalSlider");
dojo.require("concord.util.BidiUtils");

dojo.declare("pres.widget.toolbar.ZoomPicker", [pres.widget.toolbar.DropDownButton], {

	getValue: function()
	{
		return this.dropDown.getValue();
	},

	_getValueAttr: function()
	{
		return this.dropDown.getValue();
	},

	_setValueAttr: function()
	{
		this.setValue.apply(this, arguments);
	},

	setValue: function(value)
	{
		this.dropDown.setValue(value);
		this.attr("label", Math.round(this.dropDown.getValue()) + "%");
		this.value = value;
	},
	
	openDropDown: function()
	{
		// hack dijit's default behaviour, 
		// not to hide dropdown after value changed.
		var ret = this.inherited(arguments);
		var stack = dijit.popup._stack;
		var pp = stack[stack.length - 1];
		if (BidiUtils.isGuiRtl()) { //fix mispaced slider position for RTL GUI
			pp.wrapper.style.left = pp.parent.domNode.offsetLeft + pp.parent.domNode.offsetWidth -
				 pp.wrapper.offsetWidth + 'px';
		}
		delete pp.onExecute;
		return ret;
	},

	createDropDown: function()
	{
		var palette = this.palette = new dijit.form.HorizontalSlider({
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager,
			cmd: this.cmd,
			value: 100,
			minimum: 20,
			maximum: 200,
			discreteValues: 19,
			intermediateChanges: false,
			showButtons: false,
			id: this.id + "_popup",
			onChange: dojo.hitch(this, this.onChange),
			dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
		});
		this.connect(this.palette, "_onKeyUp", dojo.hitch(this, function(e){
			if(this.dropDown && this._opened && e.keyCode == dojo.keys.ENTER)
			{
				this.closeDropDown();
				dojo.stopEvent(e);
				// ugly but a quick path..
				pe.scene.slideEditor && pe.scene.slideEditor.domNode.focus();
			}
		}));
		palette.delegator = this;
		return palette;
	},

	onChange: function()
	{
		var value  = this.dropDown.getValue();
		var cm = pe.scene.hub.commandsModel;
		cm.setValue(pres.constants.CMD_ZOOM, value);
		var valueLabel = Math.round(value) + "%";
		if (BidiUtils.isArabicLocale())
			valueLabel = BidiUtils.convertArabicToHindi(valueLabel);
		this.attr("label", valueLabel);
		dojo.publish("/command/exec", [this.cmd, value]);
	}
});