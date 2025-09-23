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

dojo.provide("concord.widgets.print.textPrintToPdf");
dojo.require("concord.widgets.print.printToPdf");

dojo.declare("concord.widgets.print.textPrintToPdf", [concord.widgets.print.printToPdf], {
	
    constructor: function() 
	{
	},
	
	setDialogID: function() {
		// Overridden
		this.dialogId="C_d_textPrintToPdf";
		this.portraitRadioID="C_d_textPrintToPdfPortrait";
		this.landscapeRadioID="C_d_textsheetPrintToPdfLandscape";
		this.sizeComboxID="C_d_textPrintToPdfSize";
		this.heightFieldID="C_d_textPrintToPdfHeight";
		this.widthFieldID="C_d_textPrintToPdfWidth";
		this.headerCheckID="C_d_textPrintToPdfHeader";
		this.headerLabelID="C_d__textPrintToPdfHeaderLabel";
		this.footerCheckID="C_d_textPrintToPdfFooter";
		this.pdfCheckID="C_d_textPrintToPdfTaggedPDF";
		this.footerLabelID="C_d__textPrintToPdfFooterLabel";
		this.topFieldID="C_d_textPrintToPdfTop";
		this.bottomFieldID="C_d_textPrintToPdfBottom";
		this.leftFieldID="C_d_textPrintToPdfLeft";
		this.rightFieldID="C_d_textPrintToPdfight";
		return;
	},
	
	createContent: function (contentDiv)
	{
		this.inherited(arguments);
		
		var layoutTR6TD1 = dojo.create('div', null, this.left);
		var layoutTR7TD1 = dojo.create('div', null, this.left);
		var layoutTR8TD1 = dojo.create('div', null, this.left);
		var layoutTR9TD1 = dojo.create('div', null, this.left);
		dojo.addClass(layoutTR6TD1,"sigleDiv");
		dojo.addClass(layoutTR7TD1,"sigleDiv");
		dojo.addClass(layoutTR8TD1,"sigleDiv");
		dojo.addClass(layoutTR9TD1,"sigleDiv");
		
		/*Display option Div*/
		var displayLabel=this.createDivLabel(layoutTR6TD1, this.nls.DISPLAY_OPTION_LABEL, "printSpreadSheetDivLabel");
		this.headerCheck=this.createInputWithType(layoutTR7TD1, 'header', this.headerCheckID, 'checkbox',null,true);
		this.headerLabel = this.createDivLabel(layoutTR7TD1,this.nls.HEADER,"headerlabel");
		var checkNode = dojo.byId(this.headerCheckID);
		dijit.setWaiState(checkNode, 'label',this.nls.DISPLAY_OPTION_LABEL +' '+ this.nls.HEADER);		
		this.footerCheck=this.createInputWithType(layoutTR8TD1, 'footer', this.footerCheckID, 'checkbox',null,true);
		this.footerLabel = this.createDivLabel(layoutTR8TD1,this.nls.FOOTER,"footerlabel");
		checkNode = dojo.byId(this.footerCheckID);
		dijit.setWaiState(checkNode, 'label',this.nls.DISPLAY_OPTION_LABEL +' '+ this.nls.FOOTER);		
		this.pdfCheck=this.createInputWithType(layoutTR9TD1, 'taggedpdf', this.pdfCheckID, 'checkbox',null,false);
		this.pdfLabel = this.createDivLabel(layoutTR9TD1,this.nls.TAGGED_PDF,"pdflabel");
		checkNode = dojo.byId(this.pdfCheckID);
		dijit.setWaiState(checkNode, 'label',this.nls.DISPLAY_OPTION_LABEL +' '+ this.nls.TAGGED_PDF);		

		
		this.storeOrigValue();
		//this.checkHeaderFooter();
	},
	
	countDivHeight:function(pagewidth,left,right,id)
	{
		var ret=0;
		var width=pagewidth-left-right;
		var doc=pe.scene.CKEditor.document.$;
		var div=doc.getElementById(id);
		if(div)
		{
			div.style.display="";
			div.style.fontSize="10pt";
			div.style.width=width/1000+"cm";
			ret=div.clientHeight;
			div.style.display="none";
			div.style.width="";
		}
		return Math.floor(ret*0.75/72*2.54*1000);
	},
	
	onOk: function (editor)
	{
		editor.currentScene.session.save(true);
		this.storeCurrentValue();
		var headerHeight=this.countDivHeight(this.getScalingValue(this.cur_value[1],true),this.getScalingMarginValue(this.cur_value[4]),this.getScalingMarginValue(this.cur_value[5]),"header_div");
		var footerHeight=this.countDivHeight(this.getScalingValue(this.cur_value[1],true),this.getScalingMarginValue(this.cur_value[4]),this.getScalingMarginValue(this.cur_value[5]),"footer_div");
		var parameters;
		if(this.headerCheck.disabled)
			parameters="&header=\"false\"" ;
		else
			parameters="&header="+this.cur_value[10];
		if(this.footerCheck.disabled)
			parameters+="&footer=\"false\"" ;
		else
			parameters+="&footer="+this.cur_value[11];
		var pageHeight=this.getScalingValue(this.cur_value[0]);
		if(headerHeight+footerHeight>pageHeight-1000)
		{
			window.pe.scene.showWarningMessage("",5000);
			return true;
		}	
		parameters+=this.getCommonParameters()+
						"&HH="+headerHeight+
						"&FH="+footerHeight+
						"&UseTaggedPDF="+this.cur_value[12];		
		var url = concord.util.uri.getPrintPDFUri(window.pe.scene.sceneInfo.repository, window.pe.scene.sceneInfo.uri, window.g_draft);
		if(this.isInitialsChanged()) {
			url += parameters;
		}
    	window.open( url );
		return true;
	},
	
	storeCurrentValue: function()
	{
		this.inherited(arguments);
		this.cur_value[10]=dojo.byId(this.headerCheckID).checked;
		this.cur_value[11]=dojo.byId(this.footerCheckID).checked;
		this.cur_value[12]=dojo.byId(this.pdfCheckID).checked;
	},
	
	setPreValue: function()
	{
		this.inherited(arguments);
		dojo.byId(this.headerCheckID).checked=this.cur_value[10];
		dojo.byId(this.footerCheckID).checked=this.cur_value[11];
		dojo.byId(this.pdfCheckID).checked=this.cur_value[12];
	},
	
	// this function is obsolete
	checkHeaderFooter:function()
	{
		var doc=pe.scene.CKEditor.document.$;
		var header=doc.getElementById("header_div");
		var footer=doc.getElementById("footer_div");
		if(header!=null)
		{
			this.headerCheck.disabled=false;
			this.headerLabel.style.color="";
		}
		else
		{
			this.headerCheck.disabled=true;
			this.headerLabel.style.color="grey";
		}
		if(footer!=null)
		{
			this.footerCheck.disabled=false;
			this.footerLabel.style.color="";
		}
		else
		{
			this.footerCheck.disabled=true;
			this.footerLabel.style.color="grey";
		}
	}
})