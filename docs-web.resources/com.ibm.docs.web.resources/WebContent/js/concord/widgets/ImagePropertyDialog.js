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
dojo.provide("concord.widgets.ImagePropertyDialog");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.util.unit");
dojo.requireLocalization("concord.widgets","ImagePropDlg");
dojo.require("concord.util.BidiUtils");
dojo.require("dijit.form.CheckBox");
dojo.declare("concord.widgets.ImagePropertyDialog", [concord.widgets.concordDialog], {
	nls:null,	
	widthInput:null,	
	heightInput:null,
	checkRatio:null,
	borderInput:null,
	altInput:null,		
	widthValid:true,
	heightValid:true,
	borderValid:null,
			
	constructor: function() {	
		this.dialog.attr("title", this.concordTitle);	
	},		
	
	createContent: function (contentDiv) {		
		this.nls = dojo.i18n.getLocalization("concord.widgets","ImagePropDlg");
		if(!this.unit){
			this.unit = concord.util.unit.isMeticUnit() ? this.nls.cmUnit : '"';			
		}
		var headerTable = dojo.create('table', null, contentDiv);
		dijit.setWaiRole(headerTable,'presentation');
		var headerTbody	= dojo.create('tbody', null, headerTable);
		var headerTR1 = dojo.create('tr', null, headerTbody);
		var headerTR1TD1 = dojo.create('td', null, headerTR1);
		var headerTR1TD2 = dojo.create('td', null, headerTR1);
		var headerTR1TD3 = dojo.create('td', null, headerTR1);
		var headerTR1TD4 = dojo.create('td', null, headerTR1);
		var headerTR1TD5 = dojo.create('td', null, headerTR1);	
		
		// get image information, and create UX
		this.imageInfo = this.editor.getImageInfo();
		
		var labelWidthText = dojo.create('label', null, headerTR1TD1);
		labelWidthText.appendChild(document.createTextNode(this.nls.width));
		dojo.attr(labelWidthText,'for',this.inputWidthID);
		
		this.widthInput = new dijit.form.TextBox({value:this.formatLocalizedValue(this.imageInfo.width), id: this.inputWidthID,intermediateChanges: true});	
		dojo.addClass (this.widthInput.domNode, "inputBox");	
		this.widthInput.domNode.style.width ='8em';
		headerTR1TD2.appendChild(this.widthInput.domNode);
		dijit.setWaiState(dojo.byId(this.inputWidthID), "required", true);
		
		dojo.style(headerTR1TD3, 'width', '10px');
		
		var labelHeightText = dojo.create('label', null, headerTR1TD4);
		labelHeightText.appendChild( document.createTextNode(this.nls.height));
		dojo.attr(labelHeightText,'for',this.inputHeightID);	
		this.heightInput = new dijit.form.TextBox({value:this.formatLocalizedValue(this.imageInfo.height), id: this.inputHeightID,intermediateChanges: true});	
		dojo.addClass (this.heightInput.domNode, "inputBox");	
		this.heightInput.domNode.style.width ='8em';
		headerTR1TD5.appendChild(this.heightInput.domNode);	
		dijit.setWaiState(dojo.byId(this.inputHeightID), "required", true);		
		dojo.connect(this.widthInput.domNode, "onkeypress", dojo.hitch(this,this.onKeyPressed));	
		dojo.connect( this.heightInput.domNode, "onkeypress", dojo.hitch(this,this.onKeyPressed));
		if (BidiUtils.isArabicLocale()) {
			this.widthInput.connect(this.widthInput.domNode, "onkeyup", dojo.hitch(this.widthInput, this.keyUpHandler));
			this.heightInput.connect(this.heightInput.domNode, "onkeyup", dojo.hitch(this.heightInput, this.keyUpHandler));				
		}
		
		if(this.imageInfo.isSupportRatio){
			var headerTRRatio = dojo.create('tr', null, headerTbody);
			var headerTRRatioTD1 = dojo.create('td', null, headerTRRatio);
			dojo.attr(headerTRRatioTD1, 'colspan', '5');			
			this.checkRatio = new dijit.form.CheckBox({checked:true, id: this.checkRatioID});
			headerTRRatioTD1.appendChild(this.checkRatio.domNode);	
			var labelRatioText = dojo.create('label', null, headerTRRatioTD1);
			labelRatioText.appendChild(document.createTextNode(this.nls.lockRatio));
			dojo.attr(labelRatioText,'for',this.checkRatioID);
			dojo.connect( this.checkRatio.domNode, "onkeypress", dojo.hitch(this,this.onKeyPressed));
			// need update height/width value immediately if lockRatio is checked
			this.connectSizeEvents();	
			dojo.connect(this.checkRatio, 'onClick', dojo.hitch(this,this.toggleLockRatio));
			// init lock Ratio information
			this.toggleLockRatio();
		}
		
		if(this.imageInfo.isSupportBorder){
			var headerTRBorder = dojo.create('tr', null, headerTbody);
			var headerTRBorderTD1 = dojo.create('td', null, headerTRBorder);
			var headerTRBorderTD2 = dojo.create('td', null, headerTRBorder);
			dojo.attr(headerTRBorderTD2, 'colspan', '4');
			
			var labelborderText = dojo.create('label', null, headerTRBorderTD1);
			labelborderText.appendChild(document.createTextNode(this.nls.border));
			dojo.attr(labelborderText,'for',this.inputBorderID);
			this.borderInput = new dijit.form.TextBox({value: concord.util.unit.formatNumber(this.imageInfo.border) + ' ' + this.nls.ptUnit, id: this.inputBorderID});
			dojo.style(this.borderInput.domNode, 'width', '8em');
			headerTRBorderTD2.appendChild(this.borderInput.domNode);	
			dojo.connect( this.borderInput.domNode, "onkeypress", dojo.hitch(this,this.onKeyPressed));		
			
		}
		this.borderValid = true;
		if(this.imageInfo.isSupportAlt){
			var headerTRAlt = dojo.create('tr', null, headerTbody);
			var headerTRAltTD1 = dojo.create('td', null, headerTRAlt);
			var headerTRAltTD2 = dojo.create('td', null, headerTRAlt);
			dojo.attr(headerTRAltTD2, 'colspan', '4');
			var labelAltText = dojo.create('label', null, headerTRAltTD1);
			labelAltText.appendChild(document.createTextNode(this.nls.alt));
			dojo.attr(labelAltText,'for',this.inputAltID);
			this.altInput = new dijit.form.TextBox({value:this.imageInfo.Alt?this.imageInfo.Alt:"", id:this.inputAltID});
			dojo.style(this.altInput.domNode, 'width', '100%');
			headerTRAltTD2.appendChild(this.altInput.domNode);	
			dojo.connect( this.altInput.domNode, "onkeypress", dojo.hitch(this,this.onKeyPressed));
			if (BidiUtils.isBidiOn()){
				dojo.attr(this.altInput.focusNode, "dir",BidiUtils.getTextDir());
		    		if (dojo.attr(this.altInput.focusNode, "dir") == "contextual")
		    			dojo.connect(this.altInput.focusNode, 'onkeyup', dojo.hitch(this, function(){
		    				this.altInput.focusNode.dir = BidiUtils.calculateDirForContextual(this.altInput.focusNode.value);
		    		}));
			}
		}
	},	
	
	
	reset:function(){
		this.imageInfo = this.editor.getImageInfo();
		this.widthInput.setValue(this.formatLocalizedValue(this.imageInfo.width));
		this.heightInput.setValue(this.formatLocalizedValue(this.imageInfo.height));
		if(this.imageInfo.isSupportRatio){
			// init lock Ratio information
			this.toggleLockRatio();
		}
		
		if(this.imageInfo.isSupportBorder){
			this.borderInput.setValue(concord.util.unit.formatNumber(this.imageInfo.border) + ' ' + this.nls.ptUnit);			
		}
		this.borderValid = true;
		if(this.imageInfo.isSupportAlt){
			this.altInput.setValue(this.imageInfo.Alt);
		}
	},
	
	show: function()
	{
		this.inherited(arguments);
		this.widthInput.focus();
		this.widthInput.focusNode.select();	
	},
	
	setDialogID: function() {
		this.dialogId = "S_d_ImageProp";
		this.inputWidthID = "S_d_ImagePropWidth";
		this.inputHeightID = "S_d_ImagePropHeight";
		this.checkRatioID = "S_d_ImagePropLockRatio";
		this.inputBorderID = "S_d_ImagePropBorder";
		this.inputAltID = "S_d_ImagePropAlt";		
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
		// need valid both of them to update aria-invalid property	
		this.onHide();
		var heightValid = this.heightChanged(false, true);
		var widthValid = this.widthChanged(false, true);		
		var borderValid = this.imageInfo.isSupportBorder? this.borderChanged() : true;		
		if(heightValid && widthValid && borderValid){
			this.altChanged();
			this.editor.setImageInfo(this.imageInfo.width, this.imageInfo.height, this.imageInfo.border, this.imageInfo.Alt);		
			return true;
		}else			
			return false;
	},
	
	// method from imagePropDlg, and changed accordingly
	formatLocalizedValue : function(value)
	{
		if(isNaN(value))
			return 'NaN';
		
		var numberLocale = concord.util.unit.toLocalizedValue(value+'px');

		numberLocale = concord.util.unit.formatNumber(numberLocale);
		if (BidiUtils.isArabicLocale()) 
			numberLocale = BidiUtils.convertArabicToHindi(numberLocale + "");

		return numberLocale + ' ' + this.unit;
	},
	
	connectSizeEvents : function()
	{
		var dlg = this;
		setTimeout(function(){
			dlg.widthHandler = dojo.connect(dlg.widthInput, "onChange", dojo.hitch(dlg, dlg.widthChanged, true, false));
			dlg.heightHandler = dojo.connect(dlg.heightInput, "onChange", dojo.hitch(dlg, dlg.heightChanged, true, false));				
		}, 0);
	},
	disconnectSizeEvents: function(){
		dojo.disconnect(this.widthHandler);
		dojo.disconnect(this.heightHandler);	
	},

	keyUpHandler: function(event) {
		if(event.keyCode < dojo.keys.PAGE_UP || event.keyCode > dojo.keys.INSERT) {
			 this.setValue(BidiUtils.convertArabicToHindi(this.value + ""));
		}
	},
	
	widthChanged : function(ignoreError, ignoreRatio)
	{		
		var allowedUnit = { 'cm':this.nls.cmUnit, 'mm':this.nls.mmUnit, 'in':'"' };
		var inputValue = this.widthInput.value;
		if (BidiUtils.isArabicLocale()) {
			inputValue = BidiUtils.convertHindiToArabic(inputValue + "");
		}

		var w = concord.util.unit.parseValue(inputValue, allowedUnit, true);
		
		if( isNaN(w) || w <= 0 ){
			if(!ignoreError){
				this.setWarningMsg(this.nls.inputWarning);
				this.widthInput.focus();
				this.widthValid = false;
				dijit.setWaiState(dojo.byId(this.inputWidthID), "invalid", "true");
			}
			return false;
		}else{
			// if has width limitation
			if(this.imageInfo.MaxWidth)
				w = w > this.imageInfo.MaxWidth ? this.imageInfo.MaxWidth : w;
	
			var tempWidth = this.imageInfo.width;
			this.imageInfo.width = w;
			if(this.lockRatio && !ignoreRatio){
				if (!this.imageInfo.ratio) {
					this.imageInfo.ratio = tempWidth / this.imageInfo.height;
				}
				var h = Math.round( w * 10000.0 / this.imageInfo.ratio )/10000.0;		
				this.disconnectSizeEvents();
				this.heightInput.setValue( this.formatLocalizedValue(h) );
				this.heightValid = true;
				this.connectSizeEvents();
				this.imageInfo.height = h;
			}
			
			this.widthValid = true;
			dijit.setWaiState(dojo.byId(this.inputWidthID), "invalid", "false");
			if(this.heightValid && this.borderValid)
				this.setWarningMsg('');
			return true;
		}	
	},
	
	heightChanged : function(ignoreError, ignoreRatio)
	{		
		var allowedUnit = { 'cm':this.nls.cmUnit, 'mm':this.nls.mmUnit, 'in':'"' };
		var inputValue = this.heightInput.value;
		if (BidiUtils.isArabicLocale()) {
			inputValue = BidiUtils.convertHindiToArabic(inputValue + "");
		}

		var h = concord.util.unit.parseValue(inputValue, allowedUnit, true);
		if( isNaN(h) || h <= 0){
			if(!ignoreError){
				this.setWarningMsg(this.nls.inputWarning);
				this.heightInput.focus();
				this.heightValid = false;
				dijit.setWaiState(dojo.byId(this.inputHeightID), "invalid", "true");
			}
			return false;
		}else{
			// if has height limitation
			if(this.imageInfo.MaxHeight)
			h = h > this.imageInfo.MaxHeight ? this.imageInfo.MaxHeight : h;
		
			var tempHeight = this.imageInfo.height;
			this.imageInfo.height = h;
			
			if(this.lockRatio && !ignoreRatio){
				if (!this.imageInfo.ratio) {
					this.imageInfo.ratio = this.imageInfo.width / tempHeight;
				}
				var w = Math.round( h * this.imageInfo.ratio * 10000.0 )/10000.0;	
				this.disconnectSizeEvents();				
				this.widthInput.setValue( this.formatLocalizedValue(w) );
				this.widthValid = true;
				this.connectSizeEvents();
				this.imageInfo.width = w;
			}			
			
			this.heightValid = true;
			dijit.setWaiState(dojo.byId(this.inputHeightID), "invalid", "false");
			if(this.widthValid && this.borderValid)
				this.setWarningMsg('');
			return true;
		}	
	},
	
	toggleLockRatio : function()
	{	
		this.lockRatio = dojo.byId(this.checkRatioID).checked;		
		if(this.lockRatio)
		{
			this.imageInfo.ratio = this.imageInfo.width / this.imageInfo.height;			
		}													
	},
	onCancel:function(){
		if(this.editor.doCancel)
			this.editor.doCancel();	
		this.onHide();
	},
	//#34970
	onHide: function(){
		if( this.editor.onhide_hdl )
			this.editor.onhide_hdl();
		if(pe.scene.focusMgr){
			pe.scene.focusMgr.publishSlideEditorInFocus();
		} 
	},
	borderChanged : function( )
	{
		if(!this.imageInfo.isSupportBorder) true;
		var allowedUnit = { 'pt':this.nls.ptUnit };
		var border = concord.util.unit.parseValue(this.borderInput.value, allowedUnit);
	
		if( isNaN(border) || border < 0 ){
			this.setWarningMsg(this.nls.inputWarning);
			this.borderInput.focus();
			dijit.setWaiState(dojo.byId(this.inputBorderID), "invalid", "true");
			this.borderValid = false;
			return false;
		}else{			
			this.imageInfo.border = border;
			this.borderValid = true;
			dijit.setWaiState(dojo.byId(this.inputBorderID), "invalid", "false");
			if(this.widthValid && this.heightValid)
				this.setWarningMsg('');
			return true;
		}		
	},
	
	altChanged: function(){
		if(!this.imageInfo.isSupportAlt) 
			return true;
			
		this.imageInfo.Alt = this.altInput.value;
	} 
});
