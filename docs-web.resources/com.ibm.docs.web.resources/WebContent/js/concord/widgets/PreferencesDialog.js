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

dojo.provide("concord.widgets.PreferencesDialog");
dojo.require("concord.widgets.concordDialog");
dojo.require("dojo.i18n");
dojo.require("concord.util.BidiUtils");
dojo.require("dijit.form.RadioButton");
dojo.requireLocalization("concord.widgets","PreferencesDialog");

dojo.declare("concord.widgets.PreferencesDialog", [concord.widgets.concordDialog], {

	preferencesDialogTitle: null,	
	preferencesDialogMsg: null,
	preferencesDialogFormatMap: null,
	formatRadioName: "C_d_PreferencesDialogFormatRadio",
	formatMsg: "C_d_PreferencesDialogFormatLabel",
	currentFileFormat: null,
	nls: null,

	constructor: function() {
	    // dialog has been created
	},

	setDialogID: function() {
		this.dialogId = "C_d_PreferencesDialog";
	},	
	
	createContent: function (contentDiv) {
		this.describedInfoId = this.formatMsg;
		this.nls = dojo.i18n.getLocalization("concord.widgets","PreferencesDialog");
		this.preferencesDialogTitle = this.nls.preferencesDialogTitle;
		this.preferencesDialogMsg = this.nls.preferencesDialogMsg;
		this.preferencesDialogFormatMap =this.nls.preferencesDialogFormatMap;
		
		var doc = dojo.doc;

		this.currentFileFormat = pe.settings.getFileFormat();
		var  fieldset =  dojo.create('fieldset', null, contentDiv);
		
		var formatMsgDiv = dojo.create('LEGEND', {id: this.formatMsg}, fieldset);
		dojo.style(formatMsgDiv, "width", "380px" );
		var msg = dojo.string.substitute(this.preferencesDialogMsg, {'prodName': concord.util.strings.getProdName()});
		var textNode = doc.createTextNode(msg);
		formatMsgDiv.appendChild(textNode);
		dojo.addClass(formatMsgDiv, "sigleDiv");
		
		// add ms format
		var itemDiv = dojo.create('div', null, fieldset);
		
		dojo.addClass(itemDiv, "sigleDiv");
		var attr ={name : this.formatRadioName, id : this.formatRadioName+"_ms", value : "ms"};
		if(this.currentFileFormat == "ms"){
			attr.checked = true;
		}
		var itemRadio = dijit.form.RadioButton(attr);
		itemDiv.appendChild(itemRadio.domNode);
		dojo.addClass(itemRadio.domNode,"printSpreadsheetRadio");
		var itemLabel = dojo.create('label', null, itemDiv);
		dojo.attr(itemLabel, "for", this.formatRadioName+"_ms");
		var nodeValue = this.preferencesDialogFormatMap["ms"];
		if(BidiUtils.isGuiRtl())
			nodeValue = nodeValue.replace("(", BidiUtils.RLM + "(" + BidiUtils.LRM);

		itemLabel.appendChild(doc.createTextNode(nodeValue));	
		dojo.connect(itemRadio.domNode, 'onclick', dojo.hitch(this, "changeFormatSetting", "ms"));
		//add odf format
		itemDiv = dojo.create('div', null, fieldset);
		dojo.addClass(itemDiv, "sigleDiv");
		attr ={name : this.formatRadioName, id : this.formatRadioName+"_odf", value : "odf"};
		if(this.currentFileFormat == "odf"){
			attr.checked = true;
		}
		itemRadio = dijit.form.RadioButton(attr);
		itemDiv.appendChild(itemRadio.domNode);
		dojo.addClass(itemRadio.domNode,"printSpreadsheetRadio");
		itemLabel = dojo.create('label', null, itemDiv);
		dojo.attr(itemLabel, "for", this.formatRadioName+"_odf");
		nodeValue = this.preferencesDialogFormatMap["odf"];
		if(BidiUtils.isGuiRtl())
			nodeValue = nodeValue.replace("(", BidiUtils.RLM + "(" + BidiUtils.LRM);

		itemLabel.appendChild(doc.createTextNode(nodeValue));	
		dojo.connect(itemRadio.domNode, 'onclick', dojo.hitch(this, "changeFormatSetting", "odf")); 
	},
	
	reset: function()
	{
		var format = pe.settings.getFileFormat();
		this.changeFormatSetting(format);
		this.currentFileFormat = format;
	},
	
	changeFormatSetting: function(format)
	{
		if(format && (this.currentFileFormat != format))
		{
			var oldFormat = dijit.byId(this.formatRadioName+"_" + this.currentFileFormat);
			oldFormat.attr("checked", false);
			var newFormat = dijit.byId(this.formatRadioName+"_" + format);
			newFormat.attr("checked", true);
			this.currentFileFormat = format;
		}		
	},
	
	onOk: function (editor) {
		pe.settings.setFileFormat(this.currentFileFormat);
		return true;
	}
});
