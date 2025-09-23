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

dojo.provide("pres.widget.common.OpacityPanel");
dojo.require("dijit.form.HorizontalSlider");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("pres", "pres");

dojo.declare("pres.widget.common.OpacityPanel",[dijit._Widget, dijit._Templated], {	

	templateString: dojo.cache("pres", "templates/OpacityPanel.html"),
	slideWidget: null,
	titleStr: null,
	transparencyDisplay: null,
	publishCMD: true,
	presStrs: null,
	
	constructor: function(titleValue)
	{
		this.titleStr = titleValue;
		this.presStrs = dojo.i18n.getLocalization("pres", "pres");
	},

	getValue: function()
	{
		return this.slideWidget._getValue();
	},

	_setValueAttr: function()
	{
		this.setValue.apply(this, arguments);
	},
	
	_setDisabledAttr : function(d)
	{
		//transparency panel click : use .attr('disabled',false) 
		//check OpacityCommands : use _setDisabledAttr(). 
		if(d != null)
			pe.scene.hub.commandsModel.getModel(pres.constants.CMD_OBJECT_OPACITY).disabled = d;
		var disabled = pe.scene.hub.commandsModel.getModel(pres.constants.CMD_OBJECT_OPACITY).disabled;
		this.slideWidget._setDisabledAttr(disabled);
		if(disabled)
		{
			dojo.addClass(this.domNode,'opacityPanelcover');
		}
		else
		{
			dojo.removeClass(this.domNode,'opacityPanelcover');
		}
	},
	
	setValue: function()
	{
		var value = pe.scene.hub.commandsModel.getModel(pres.constants.CMD_OBJECT_OPACITY).value;
		if(isNaN(parseInt(value)))
			value = pres.constants.DEFAULT_OPACITY;
		value = Math.round(value);
		this.slideWidget._setValueAttr(value);
		this.publishCMD = false ;
		this.valueSpan.innerHTML = dojo.string.substitute(this.presStrs.opacity_percent_value, [value]);
	},
	
	destory: function()
	{
		pe.scene.slideEditor.opcityPanelShow = false;
		this.inherited(arguments);
		this.slideWidget.destroy();
		if(this.domNode)		
			dojo.destroy(this.domNode);
	},

	configOpDialogDiv: function()
	{
		if (BidiUtils.isGuiRtl()) {
			dojo.style(this.opacityDiv,{'float':'right','marginRight':'-5px','width':'81%','marginTop':'5px'});
			dojo.style(this.valueDiv,{'float':'left'});
			dojo.style(this.opacityPanel,"direction", "rtl");
		} else {
			dojo.style(this.opacityDiv,{'float':'left','marginLeft':'-5px','width':'81%','marginTop':'5px'});
			dojo.style(this.valueDiv,{'float':'right'});
		}
		dojo.addClass(this.slideWidget.sliderHandle, "opacityPanelHandleBgPic");
	},
	
	configDivInColorPanel: function()
	{
		dojo.style(this.opacityDiv,{'float':'left','marginTop':'-3px','marginLeft':'-3px','width':'82%'});
		dojo.style(this.opacityDiv.children[0],{'border':'none','width':'auto'});
		dojo.style(this.valueDiv,{'float':'right'});
	},
	
	postCreate: function()
	{
		this.inherited( arguments );
		var tempsliderbar=this.slideWidget= new dijit.form.HorizontalSlider({
			ownerDocument: this.ownerDocument,
			_focusManager: this._focusManager,
			value: this.value,
			minimum: 0,
			maximum: 100,
			discreteValues: 1,
			intermediateChanges: true,
			showButtons: false,
			id: this.id + "_popup",
			onChange: dojo.hitch(this, this.onchange),
			dir: BidiUtils.isGuiRtl() ? 'rtl' : ''
		});
		this.opacityDiv.appendChild(tempsliderbar.domNode);
		//set default value.
		dojo.addClass(this.domNode,'opacityPanelcover');
		this.slideWidget._setDisabledAttr(true);
		this.slideWidget.setValue(pres.constants.DEFAULT_OPACITY);
		this.valueSpan.innerHTML = dojo.string.substitute(this.presStrs.opacity_percent_value, [pres.constants.DEFAULT_OPACITY]);
	},
	
	onchange: function()
	{
		if(this.slideWidget.disabled || !this.publishCMD )
			return;
		var transparencyValue  = this.slideWidget.getValue();
		if(isNaN(parseFloat(transparencyValue)))
			transparencyValue = pres.constants.DEFAULT_OPACITY;
		transparencyValue  = Math.round(transparencyValue);
		var cm = pe.scene.hub.commandsModel;
		cm.setValue(pres.constants.CMD_OBJECT_OPACITY, transparencyValue);
		this.valueSpan.innerHTML = dojo.string.substitute(this.presStrs.opacity_percent_value, [transparencyValue]);
		dojo.publish("/command/exec", [pres.constants.CMD_OBJECT_OPACITY, transparencyValue]);
	}
});