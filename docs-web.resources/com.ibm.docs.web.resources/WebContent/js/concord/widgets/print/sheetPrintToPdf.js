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

dojo.provide("concord.widgets.print.sheetPrintToPdf");
dojo.require("concord.widgets.print.printToPdf");
dojo.require("concord.util.BidiUtils");
//dojo.requireLocalization("concord.widgets.print","sheetPrintToPdf");

dojo.declare("concord.widgets.print.sheetPrintToPdf", [concord.widgets.print.printToPdf], {
	IS_LEFT_TO_RIGHT_ORDER: false,
	
	constructor: function() 
	{
	},
	
	setDialogID: function() {
		// Overridden
		this.dialogId="S_d_sheetPrintToPdf";
		this.portraitRadioID="S_d_sheetPrintToPdfPortrait";
		this.landscapeRadioID="S_d_sheetPrintToPdfLandscape";
		this.sizeComboxID="S_d_sheetPrintToPdfSize";
		this.heightFieldID="S_d_sheetPrintToPdfHeight";
		this.widthFieldID="S_d_sheetPrintToPdfWidth";
		this.headerCheckID="S_d_sheetPrintToPdfHeader";
		this.footerCheckID="S_d_sheetPrintToPdfFooter";
		this.gridlineCheckID="S_d_sheetPrintToPdfGridline";
		this.pdfCheckID="C_d_sheetPrintToPdfTaggedPDF";
		this.topFieldID="S_d_sheetPrintToPdfTop";
		this.bottomFieldID="S_d_sheetPrintToPdfBottom";
		this.leftFieldID="S_d_sheetPrintToPdfLeft";
		this.rightFieldID="S_d_sheetPrintToPdfight";
		this.pageM1RadioID="S_d_sheetPrintPageM1";
		this.pageM2RadioID="S_d_sheetPrintPageM2";
		return;
	},
	
	createContent: function (contentDiv)
	{
		this.inherited(arguments);
		
		var layoutTR6TD1 = dojo.create('div', null, this.left);
		var layoutTRLengend = dojo.create('legend', null, this.layoutTR5TD2);
		var layoutTR6TD2 = dojo.create('div', null, this.layoutTR5TD2);
		var layoutTR7TD1 = dojo.create('div', null, this.left);
		var layoutTR7TD2 = dojo.create('div', null, this.layoutTR5TD2);
		var layoutTR7TD3 = dojo.create('div', null, this.left);
		var layoutTR8TD1 = dojo.create('div', null, this.left);
		var layoutTR8TD2 = dojo.create('div', null, this.right);
		var layoutTR9TD1 = dojo.create('div', null, this.left);
		dojo.addClass(layoutTRLengend,"sigleDiv");
		dojo.addClass(layoutTR6TD1,"sigleDiv");
		dojo.addClass(layoutTR6TD2,"sigleDiv");
		dojo.addClass(layoutTR7TD1,"sigleDiv");
		dojo.addClass(layoutTR7TD2,"sigleDiv");
		dojo.addClass(layoutTR7TD3,"sigleDiv");
		dojo.addClass(layoutTR8TD1,"sigleDiv");
		dojo.addClass(layoutTR8TD2,"sigleDiv");
		dojo.addClass(layoutTR9TD1,"sigleDiv");
		
		/*Display option Div*/
		var displayLabel=this.createDivLabel(layoutTR6TD1, this.nls.DISPLAY_OPTION_LABEL, "printSpreadSheetDivLabel");
		var headerchecked = this.getDefaultHeader();
		var headerCheck=this.createInputWithType(layoutTR7TD1, 'header', this.headerCheckID, 'checkbox',null,headerchecked);
		var headerLabel = this.createDivLabel(layoutTR7TD1,this.nls.HEADER ,"headerlabel");
		var checkNode = dojo.byId(this.headerCheckID);
		dijit.setWaiState(checkNode, 'label',this.nls.DISPLAY_OPTION_LABEL +' '+ this.nls.HEADER);
		var footerchecked = this.getDefaultFooter();
		var footerCheck=this.createInputWithType(layoutTR7TD3, 'footer', this.footerCheckID, 'checkbox',null,footerchecked);
		var footerLabel = this.createDivLabel(layoutTR7TD3,this.nls.FOOTER, "footerlabel");
		checkNode = dojo.byId(this.footerCheckID);
		dijit.setWaiState(checkNode, 'label',this.nls.DISPLAY_OPTION_LABEL +' '+ this.nls.FOOTER);	
		var gridlinechecked = this.getDefaultGridline();
		var gridlineCheck=this.createInputWithType(layoutTR8TD1, 'gridlilne', this.gridlineCheckID, 'checkbox',null,gridlinechecked);
		var gridlineLabel = this.createDivLabel(layoutTR8TD1,this.nls.GRIDLINE, "gridlinelabel");
		checkNode = dojo.byId(this.gridlineCheckID);
		dijit.setWaiState(checkNode, 'label',this.nls.DISPLAY_OPTION_LABEL +' '+ this.nls.GRIDLINE);
		var tagchecked = this.getDefaultTaggedPDF();
		var pdfCheck=this.createInputWithType(layoutTR9TD1, 'taggedpdf', this.pdfCheckID, 'checkbox',null,tagchecked);
		var pdfLabel = this.createDivLabel(layoutTR9TD1,this.nls.TAGGED_PDF,"pdflabel");
		checkNode = dojo.byId(this.pdfCheckID);
		dijit.setWaiState(checkNode, 'label',this.nls.DISPLAY_OPTION_LABEL +' '+ this.nls.TAGGED_PDF);			
		/*Page Order Div*/
		this.initPageOrder();
		var pageOrderLabel=this.createDivLabel(layoutTRLengend, this.nls.PAGE_LABEL, "printSpreadSheetDivLabel");
		var radio3=this.createInputWithType(layoutTR6TD2, 'pageOrder', this.pageM1RadioID, 'radio', !this.IS_LEFT_TO_RIGHT_ORDER,!this.IS_LEFT_TO_RIGHT_ORDER);
		var label3 = this.createDivLabel(layoutTR6TD2,this.nls.PAGE_TYPE1,"label3");		
		var radioNode = dojo.byId(this.pageM1RadioID);
		dijit.setWaiState(radioNode, 'label',this.nls.PAGE_LABEL +' '+ this.nls.PAGE_TYPE1);	
		dojo.connect(radio3, 'onclick', dojo.hitch(this, "changePageOrderMode", false)); // switch to LeftToRight the TopToBottom?
		var msg1 = layoutTR6TD2.title = this.nls.TOOLTIP1;
		dojo.connect(radio3.firstChild, 'onfocus', function(){
			this.editor.getCurrentGrid().announce(msg1);
		});
				
		var radio4=this.createInputWithType(layoutTR7TD2, 'pageOrder', this.pageM2RadioID, 'radio', this.IS_LEFT_TO_RIGHT_ORDER,this.IS_LEFT_TO_RIGHT_ORDER);
		var label4 = this.createDivLabel(layoutTR7TD2,this.nls.PAGE_TYPE2,"label4");
		radioNode = dojo.byId(this.pageM2RadioID);
		dijit.setWaiState(radioNode, 'label',this.nls.PAGE_LABEL +' '+ this.nls.PAGE_TYPE2);		
		dojo.connect(radio4, 'onclick', dojo.hitch(this, "changePageOrderMode", true)); // switch to LeftToRight the TopToBottom?
		var msg2 = layoutTR7TD2.title = this.nls.TOOLTIP2;
		dojo.connect(radio4.firstChild, 'onfocus', function(){
			this.editor.getCurrentGrid().announce(msg2);
		});
		
		this.changePageOrderMode(this.IS_LEFT_TO_RIGHT_ORDER);
		this.storeOrigValue();				
	},

	showMessage: function(id)
	{
		var content, radioNode;
		var dir = BidiUtils.isGuiRtl() ? "rtl" : "";
		if(this.pageM2RadioID==id||"label4"==id)
		{
			content=this.nls.TOOLTIP1 ;
			radioNode = dojo.byId(this.pageM2RadioID);
		}
		else if(this.pageM1RadioID==id||"label3"==id)
		{
			content=this.nls.TOOLTIP2;
			radioNode = dojo.byId(this.pageM1RadioID);
		}
		/* replaced dojo.byId(id) by radioNode to fix exception thrown when id == "label3"/"label4" */
		dijit.showTooltip("<div dir='" + dir + "' style=\"width:250px\">"+content+"</div>",radioNode, null, BidiUtils.isGuiRtl());
		this.editor.getCurrentGrid().announce(content);
    },
    
	hideMessage:function(id)
	{
    	dijit.hideTooltip(dojo.byId(id));
    },
	
	/*Methods begins here*/
	changePageOrderMode: function(isFirstLTR)
	{
		this.IS_LEFT_TO_RIGHT_ORDER = isFirstLTR;
		var radioT2B = dijit.byId(this.pageM1RadioID);
		var radioL2R = dijit.byId(this.pageM2RadioID);
		if (isFirstLTR) 
		{
			radioT2B.set('value', false);
			radioL2R.set('value', true);			
		}		
		else
		{
			radioT2B.set('value', true);
			radioL2R.set('value', false);
		}	
	},
	
	onOk: function (editor)
	{
		this.storeCurrentValue();
		//page parameter is for 'PrintDownFirst' - Symphony API 
		var IS_TOP_TO_BOTTOM_ORDER = !this.IS_LEFT_TO_RIGHT_ORDER;
		this.parameters = "&page="+IS_TOP_TO_BOTTOM_ORDER+
						"&header="+this.cur_value[10]+
						"&footer="+this.cur_value[11]+
						"&gridline="+this.cur_value[12]+
						this.getCommonParameters()+
						"&UseTaggedPDF="+this.cur_value[14];
		var url = concord.util.uri.getPrintPDFUri(window.pe.scene.sceneInfo.repository, window.pe.scene.sceneInfo.uri, window.g_draft);
		if(this.isInitialsChanged()) {
			url += this.parameters;
		}
    	window.open( url );
		return true;
	},
	
	storeCurrentValue: function()
	{
		this.inherited(arguments);
		this.cur_value[10]=dojo.byId(this.headerCheckID).checked;
		this.cur_value[11]=dojo.byId(this.footerCheckID).checked;
		this.cur_value[12]=dojo.byId(this.gridlineCheckID).checked;
		this.cur_value[13]=this.IS_LEFT_TO_RIGHT_ORDER;
		this.cur_value[14]=dojo.byId(this.pdfCheckID).checked;
	},
	
	setPreValue: function()
	{
		this.inherited(arguments);
		dojo.byId(this.headerCheckID).checked=this.cur_value[10];
		dojo.byId(this.footerCheckID).checked=this.cur_value[11];
		dojo.byId(this.gridlineCheckID).checked=this.cur_value[12];
		this.IS_LEFT_TO_RIGHT_ORDER=this.cur_value[13];
		dojo.byId(this.pdfCheckID).checked=this.cur_value[14];
	},
	
	initPageOrder: function() {
		if(this.settings && this.settings.pageOrder) {
			if(this.settings.pageOrder != "ttb") {
				this.IS_LEFT_TO_RIGHT_ORDER = true;
			}
			else {
				this.IS_LEFT_TO_RIGHT_ORDER = false;
			}
		}
		else {
			this.IS_LEFT_TO_RIGHT_ORDER = false;
		}		
	},
	
	getDefaultGridline: function() {
		if(this.settings)
		{
			if(this.settings.gridline == 'true')
			{
				return true;
			}
		}		
		return false;
	},
	
	getDefaultHeader: function() {
		if(this.settings)
		{
			if(this.settings.header == 'true')
			{
				return true;
			}
		}		
		return false;
	},
	
	getDefaultFooter: function() {
		if(this.settings)
		{
			if(this.settings.footer == 'true')
			{
				return true;
			}
		}		
		return false;
	},
	
	isDefaultPortrait: function() {
		if(this.settings && this.settings.orientation) {
			if(this.settings.orientation == "portrait") {
				return true;
			}
			else {
				return false;
			}
				
		}		
		return true;
	}
})