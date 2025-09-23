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

dojo.provide("pres.print.PDFDialog");
dojo.require("concord.widgets.print.printToPdf");

// Ported from concord.widgets.print.presPrintToPdf

dojo.declare("pres.print.PDFDialog", [concord.widgets.print.printToPdf], {
	constructor: function()
	{
		this.editor = pe.scene.editor;
		this.nls = pe.scene.nls;
	},

	setDialogID: function()
	{
		// Overridden
		this.dialogId = "P_d_presPrintToPdf";
		this.portraitRadioID = "P_d_presPrintToPdfPortrait";
		this.landscapeRadioID = "P_d_presPrintToPdfLandscape";
		this.sizeComboxID = "P_d_presPrintToPdfSize";
		this.heightFieldID = "P_d_presPrintToPdfHeight";
		this.widthFieldID = "P_d_presPrintToPdfWidth";
		this.pdfCheckID = "C_d_presPrintToPdfTaggedPDF";
		this.topFieldID = "P_d_presPrintToPdfTop";
		this.bottomFieldID = "P_d_presPrintToPdfBottom";
		this.leftFieldID = "P_d_presPrintToPdfLeft";
		this.rightFieldID = "P_d_presPrintToPdfight";
		return;
	},

	createContent: function(contentDiv)
	{
		this.inherited(arguments);
		var layoutTR6TD1 = dojo.create('div', null, this.left);
		var layoutTR7TD1 = dojo.create('div', null, this.left);
		dojo.addClass(layoutTR6TD1, "sigleDiv");
		dojo.addClass(layoutTR7TD1, "sigleDiv");

		/* Display option Div */
		var displayLabel = this.createDivLabel(layoutTR6TD1, this.nls.DISPLAY_OPTION_LABEL, "printSpreadSheetDivLabel");
		var tagchecked = this.getDefaultTaggedPDF();
		this.pdfCheck = this.createInputWithType(layoutTR7TD1, 'taggedpdf', this.pdfCheckID, 'checkbox', null, tagchecked);
		this.pdfLabel = this.createDivLabel(layoutTR7TD1, this.nls.TAGGED_PDF, "pdflabel");
		var checkNode = dojo.byId(this.pdfCheckID);
		dijit.setWaiState(checkNode, 'label', this.nls.DISPLAY_OPTION_LABEL + ' ' + this.nls.TAGGED_PDF);

		this.storeOrigValue();
	},

	onOk: function()
	{
		pe.scene.session.save(true);
		this.storeCurrentValue();
		var parameters = this.getCommonParameters() + "&UseTaggedPDF=" + this.cur_value[10];
		var url = concord.util.uri.getPrintPDFUri(window.pe.scene.sceneInfo.repository, window.pe.scene.sceneInfo.uri, window.g_draft);
		if (this.isInitialsChanged())
		{
			url += parameters;
		}
		window.open(url);
		return true;
	},

	storeCurrentValue: function()
	{
		this.inherited(arguments);
		this.cur_value[10] = dojo.byId(this.pdfCheckID).checked;
	},

	setPreValue: function()
	{
		this.inherited(arguments);
		dojo.byId(this.pdfCheckID).checked = this.cur_value[10];
	},

	isDefaultPortrait: function()
	{
		if (this.settings && this.settings.orientation)
		{
			if (this.settings.orientation == "portrait")
			{
				return true;
			}
			else
			{
				return false;
			}

		}
		return false;
	}
});