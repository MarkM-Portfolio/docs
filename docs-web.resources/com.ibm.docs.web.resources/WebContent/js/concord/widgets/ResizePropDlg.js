/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("concord.widgets.ResizePropDlg");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.util.unit");
dojo.requireLocalization("concord.widgets","ResizePropDlg");
dojo.require("concord.util.BidiUtils");
dojo.declare("concord.widgets.ResizePropDlg", [concord.widgets.concordDialog], {
	nls:null,	
	type : null,
	unitHelper:null,
	widthInput:null,	
	heightInput:null,
	currentWidth:null,
	currentHeight:null,

	widthValid:true,
	heightValid:true,
	
	TABLE:"TABLE",
	TABLECELL:"TABLECELL",
	TEXTBOX:"TEXTBOX",
	SHAPE:"SHAPE",	
	constructor: function(object, title, oklabel, visible, params, formParams) {		
		this.type = params.type;	
		var title = this.nls.commonTitle;		
		if (this.type == this.TABLE){
			title = this.nls.tableTitle;
		}else if (this.type == this.TABLECELL){
			title = this.nls.cellTitle;
		}		
		this.dialog.attr("title", title);		
	},
	
	createContent: function (contentDiv) {
		this.unitHelper = concord.util.unit;
		this.nls = dojo.i18n.getLocalization("concord.widgets","ResizePropDlg");
		if(!this.unit){
			this.unit = this.unitHelper.isMeticUnit() ? this.nls.cmUnit : this.nls.inUnit;			
		}		
		var headerTable = dojo.create('table', null, contentDiv);
		dijit.setWaiRole(headerTable,'presentation');
		var headerTbody	= dojo.create('tbody', null, headerTable);
		
		this.createTextBoxContent(headerTbody);
	},	

	createTextBoxContent:function(headerTbody) {
		// Width label and input
		var headerTR0 = dojo.create('tr', null, headerTbody);
		var headerTR0TD1 = dojo.create('td', null, headerTR0);
		var headerTR1 = dojo.create('tr', null, headerTbody);
		var headerTR1TD1 = dojo.create('td', null, headerTR1);
		var headerTR1TD2 = dojo.create('td', null, headerTR1);
		dojo.style(headerTR1TD1, 'paddingBottom', '10px');
		dojo.style(headerTR1TD2, 'paddingBottom', '10px');
		
		var labelWidthText = dojo.create('label', null, headerTR0TD1);
		var widthLabel =  this.type == this.TABLECELL ? this.nls.columnWidth :this.nls.width;			
		labelWidthText.appendChild(document.createTextNode(widthLabel ));
		dojo.attr(labelWidthText,'for',this.inputWidthID);
		this.widthInput = new dijit.form.TextBox({value:this.formatLocalizedValue(this.currentWidth), id: this.inputWidthID, intermediateChanges: true});	
		dojo.addClass (this.widthInput.domNode, "inputBox");
		
		this.widthInput.domNode.style.width ='8em';
		headerTR1TD1.appendChild(this.widthInput.domNode);
		dijit.setWaiState(dojo.byId(this.inputWidthID), "required", true);
		
		this.createErrorIcon(headerTR1TD2, this.widthErrorIconId, this.nls.validUnitsWarning);
		
		// Height label and input
		var headerTR2 = dojo.create('tr', null, headerTbody);
		var headerTR2TD1 = dojo.create('td', null, headerTR2);
		var headerTR3 = dojo.create('tr', null, headerTbody);
		var headerTR3TD1 = dojo.create('td', null, headerTR3);
		var headerTR3TD2 = dojo.create('td', null, headerTR3);
		dojo.style(headerTR3TD1, 'paddingBottom', '10px');
		dojo.style(headerTR3TD2, 'paddingBottom', '10px');

		var labelHeightText = dojo.create('label', null, headerTR2TD1);
		var heightLabel =  this.type == this.TABLECELL ? this.nls.rowHeight :this.nls.height;		
		labelHeightText.appendChild( document.createTextNode(heightLabel));
		dojo.attr(labelHeightText,'for',this.inputHeightID);	
		this.heightInput = new dijit.form.TextBox({value:this.formatLocalizedValue(this.currentHeight), id: this.inputHeightID, intermediateChanges: true});	
		dojo.addClass(this.heightInput.domNode, "inputBox");
		
		this.heightInput.domNode.style.width ='8em';
		headerTR3TD1.appendChild(this.heightInput.domNode);	
		dijit.setWaiState(dojo.byId(this.inputHeightID), "required", true);		
		this.createErrorIcon(headerTR3TD2, this.heightErrorIconId, this.nls.validUnitsWarning);
		
		dojo.connect( this.widthInput, "onChange", dojo.hitch(this,this.widthChanged));
		dojo.connect(this.widthInput.domNode, "onkeypress", dojo.hitch(this,this.onKeyPressed));
		dojo.connect( this.heightInput, "onChange", dojo.hitch(this,this.heightChanged));
		dojo.connect( this.heightInput.domNode, "onkeypress", dojo.hitch(this,this.onKeyPressed));
	},
	
	setSizeInfo:function (params){
		this.currentWidth =params.width;
		this.currentHeight = params.height;
		this.oldWidth = this.currentWidth;
		this.oldHeight = this.currentHeight;
		this.focusObj = params.focusObj;
	},


	show:function(){
		this.inherited(arguments);	
				
		this.widthInput.setValue(this.formatLocalizedValue(this.currentWidth));
		this.heightInput.setValue(this.formatLocalizedValue(this.currentHeight));
	},


	reset:function(){
		if (this.widthInput) 
			this.widthInput.setValue(this.formatLocalizedValue(this.currentWidth));
		if (this.heightInput)
			this.heightInput.setValue(this.formatLocalizedValue(this.currentHeight));

	},
	
	setDialogID: function() {
		//can not be the same id;
		var randomCode =  Math.random();
		this.dialogId = "C_d_ContentBoxProp_"+randomCode;
		this.widthRowId = "C_d_WidthRowContent_"+randomCode;
		this.widthLabelId = "C_d_WidthRowLabel_"+randomCode;
		this.heightRowId = "C_d_HeightRowContent_"+randomCode;
		this.heightLabelId = "C_d_HeightRowLabel_"+randomCode;
		this.inputWidthID = "C_d_ContentBoxPropWidth_"+randomCode;
		this.inputHeightID = "C_d_ContentBoxPropHeight_"+randomCode;
		this.widthErrorIconId = "C_d_ContentBoxWidthErrorIcon_"+randomCode;
		this.heightErrorIconId = "C_d_ContentBoxHeightErrorIcon_"+randomCode;	
	},	

	onKeyPressed: function(e){
		if (e.keyCode == dojo.keys.ENTER) {
			if(this.getOkBtn()){
				//move focus out input, or get its value should be old value
				this.getOkBtn().focus();
				if(this.onOk())
					this.hide();
			}			
		}
	},
	onOk: function (){	
		if(!this.heightValid )
			document.getElementById(this.inputHeightID).focus();
		else if(!this.widthValid )
			document.getElementById(this.inputWidthID).focus();
		else{
			this.setContentBoxInfo(this.currentWidth, this.currentHeight);		
			return true;
		}
		return false;
	},
	// method from imagePropDlg, and changed accordingly
	formatLocalizedValue : function(value)
	{
		if(isNaN(value))
			return 'NaN';
		var numberLocale = this.unitHelper.toLocalizedValue(value+'px');

		numberLocale = this.unitHelper.formatNumber(numberLocale);
		if (BidiUtils.isArabicLocale()) 
			numberLocale = BidiUtils.convertArabicToHindi(numberLocale + "");

		return numberLocale + ' ' + this.unit;
	},
	
	widthChanged : function()
	{
		var allowedUnit = { 'cm':this.nls.cmUnit, 'mm':this.nls.mmUnit, 'in':this.nls.inUnit, 'pct':'%' };
		var inputValue = this.widthInput.value;
		if (BidiUtils.isArabicLocale()) {
			inputValue = BidiUtils.convertHindiToArabic(inputValue + "");
			this.widthInput.setValue(BidiUtils.convertArabicToHindi(inputValue + ""));
		}

		var w = this.unitHelper.parseValue(inputValue, allowedUnit, true);
				
		if( isNaN(w) || w <= 0 ){
			this.setWarningMsg(this.nls.inputWarningContentBoxSize);
			this.setWarningIcon(this.widthErrorIconId, true);
			this.widthInput.focus();
			this.widthValid = false;
			return false;
		}else{
			this.currentWidth = w;
			this.widthValid = true;
			this.setWarningIcon(this.widthErrorIconId, false);
			if(this.heightValid)
				this.setWarningMsg('');
			return true;
		}	
	},
	
	heightChanged : function()
	{
		var allowedUnit = { 'cm':this.nls.cmUnit, 'mm':this.nls.mmUnit, 'in':this.nls.inUnit};

		var inputValue = this.heightInput.value;
		if (BidiUtils.isArabicLocale()) {
			inputValue = BidiUtils.convertHindiToArabic(inputValue + "");
			this.heightInput.setValue(BidiUtils.convertArabicToHindi(inputValue + ""));
		}

		var h = this.unitHelper.parseValue(inputValue, allowedUnit, true);
		
		if( isNaN(h) || h <= 0){			
			this.setWarningMsg(this.nls.inputWarningContentBoxSize);
			this.setWarningIcon(this.heightErrorIconId, true);
			this.heightInput.focus();
			this.heightValid = false;
			return false;
		}else{
			this.currentHeight = h;
			this.heightValid = true;
			if(!this.oldHeight){
				this.oldHeight = this.currentHeight;
			}
			this.setWarningIcon(this.heightErrorIconId, false);
			if(this.widthValid)
				this.setWarningMsg('');
			return true;
		}	
	},
	
	setContentBoxInfo : function(width, height)
	{
		if(this.type == this.TABLECELL){
			var cell = this.focusObj;
			var row = cell.parent;		
			
			var table = cell && cell.table;
			if(table){
				dojo.publish(writer.constants.EVENT.RESIZECELL,[table, cell.getColIdx() + cell.getColSpan() - 1, this.currentWidth - this.oldWidth, row.getRowIdx(), this.currentHeight - this.oldHeight]);
			}
			
		}else if(this.type == this.TABLE){			
			var table = this.focusObj;
			if(table){
				dojo.publish(writer.constants.EVENT.RESIZETABLE,[table,  this.currentWidth - this.oldWidth,  this.currentHeight - this.oldHeight]);
			}			
		}else if(this.type == this.TEXTBOX){
			var boxView = this.focusObj;
			if(boxView){
				dojo.publish(writer.constants.EVENT.RESIZETEXTBOX,[boxView, this.currentWidth - this.oldWidth,  this.currentHeight - this.oldHeight]);
			}
		}
//		dojo.publish(writer.constants.EVENT.RESIZECOLUMN,[table,this._attachedCell.getColIdx()+this._attachedCell.getColSpan()-1,delX]);
		console.log("please use the new width, height"+width+":"+ height);
	}
	
});
