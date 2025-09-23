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

dojo.provide("concord.pageSetup");
dojo.require("dojo.data.ItemFileReadStore");
dojo.require("dijit.form.ComboBox");
dojo.require("concord.unit");
dojo.require("lconn.share.widget.MessageContainer");

dojo.declare("concord.pageSetup", [ lconn.files.action.impl.PromptAction ], {
	sizeNamesArray: null,
	sizeHeightArray: null,
	sizeWidthArray:null,
	widthCMData:null,
	heightCMData:null,	
	defaultMargin:null,
	
	PORTRAIT_MODE: true,
	LANDSCAPE_MODE: false,
	CURRENT_MODE: true,
	IS_LEFT_TO_RIGHT_ORDER: false,
	
	SIZE_COUNT: 27,
	SIZE_USER: 12,
	sizeList: null,	
	locale:null,
	metric: true,
	unit: null,
	allowedUnit: null,
	
	cur_value:new Array(),
	orig_value:new Array(),
	settings: null,
	initiated: false,	
	sizeCombox : null,
	comboBoxId: "C_d_ExportPDFDialogsizeCombox",
	tableId: "C_d_ExportPDFDialogTable",
	radioLandscapeId: "C_d_ExportPDFDialogType1",
	radioPortaitId: "C_d_ExportPDFDialogType2",
	radioTopToBottomId: "C_D_ExpoortPDFDialogT2B",
	radioLeftToRightId: "C_D_ExpoortPDFDialogL2R",
	heightId: "C_d_ExportPDFDialogHeight",
	widthId: "C_d_ExportPDFDialogWidth",
	headerCheckId: "S_d_printOptionsHeader",
	footerCheckId: "S_d_printOptionsFooter",
	headerHeightId: "C_d_ExportPDFDialogHeaderHeight",
	footerHeightId: "C_d_ExportPDFDialogFooterHeight",
	gridlineCheckId: "S_d_printOptionsGridline",
	taggedpdfCheckId: "C_d_taggedpdfGridline",
	topMarginId: "C_d_ExportPDFDialogid1",
	bottomMarginId: "C_d_ExportPDFDialogid2",
	leftMarginId: "C_d_ExportPDFDialogid3",
	rightMarginId: "C_d_ExportPDFDialogid4",
	connectArray : [],
	docTypePres: "PRES",
	docTypeText: "TEXT",
	docTypeSheet: "SHEET",
	docTypeCur: "TEXT",
	
	_initDocType: function() 
	{
		var extension = this.file.getExtension();
		var text_format = {
			"txt" : 1,
			"docx" : 1,
			"doc" : 1,
			"odt" : 1
		};
		var pres_format = {
			"ppt" : 1,
			"odp" : 1,
			"pptx" : 1
		};
		var sheet_format = {
			"ods" : 1,
			"xls" : 1,
			"xlsx" : 1,
			"xlsm" : 1
		};
		
		if( extension ) 
		{
			if( text_format[extension.toLowerCase()] ) 
			{
				this.docTypeCur = this.docTypeText;
			}
			if( pres_format[extension.toLowerCase()] )
			{
				this.docTypeCur = this.docTypePres;
			}
			if( sheet_format[extension.toLowerCase()] )
			{
				this.docTypeCur = this.docTypeSheet;
			}
		}		
	},
	
	_setLocale: function()
	{		
		this.locale = dojo.locale; 
		// work around for "pt" in fireFox, as "pt-PT" is not supported. 
		if(this.locale == "pt"){
			this.locale = "pt-pt";
		}
	},
	
	formatNumber: function(num, noUnit)
	{
		var ret=num;
		if(typeof(ret)=="string")
		{
			ret=num.replace(",",".");
		}	
		ret=dojo.number.format(ret,{ pattern: "#.00",locale: this.locale }) ;
		if(!noUnit)
			ret +=" "+ this.unit;
		return ret;
	},
	
	_loadLocalArrays: function()
	{
		this.sizeNamesArray = new Array("A3","A4","A5","B4 (ISO)","B5 (ISO)",
										"B6 (ISO)","B4 (JIS)","B5 (JIS)","B6 (JIS)",
										this.LETTER,this.LEGAL,this.TABLOID,this.USER
										,"C4","C5","C6","C6/5","DL",this.SIZE1,this.SIZE2,
										this.SIZE3,this.SIZE4,this.SIZE5,this.SIZE6,
										this.SIZE7,this.SIZE8,this.SIZE9);
		this.widthCMData = new Array("29.70","21.00","14.80","25.00","17.60",
										"12.50","25.70","18.20","12.80",
										"21.59","21.59","27.96","User",
										"22.90","16.20","11.40","11.40","11.00","9.21","9.84",
										"9.84","10.48","11.43","12.07",
										"18.40","13.00","14.00");
		this.heightCMData = new Array("42.00","29.70","21.00","35.30","25.00",
										 "17.60","36.40","25.70","18.20",
										 "27.94","35.57","43.13","User",
										 "32.40","22.90","16.20","22.70","22.00","16.51","19.05",
										"22.54","24.13","26.35","27.94",
										"26.00","18.40","20.30");	
		if(this.metric){
			this.sizeWidthArray = this.widthCMData;
			this.sizeHeightArray = this.heightCMData;
			this.defaultMargin = this.formatNumber("2.00");
		}else{
			this.sizeWidthArray = this._cmToInchArray(this.widthCMData);	
			this.sizeHeightArray = this._cmToInchArray(this.heightCMData);										
			this.defaultMargin = this.formatNumber(concord.unit.CmToIn("2.00"));			
		}											
		this._setLocale();
	},
	
//	createCMLabel: function(parentNode)
//	{
//		var temp=dojo.create('label',null,parentNode);
//		temp.appendChild(dojo.doc.createTextNode(this.nls.CM_LABEL));
//		temp.style.cssText = "font-weight: normal;";
//	},
	createDivLabel: function(parentNode,textValue)
	{
		var temp=dojo.create('label',null,parentNode);
		temp.appendChild(dojo.doc.createTextNode(textValue));
		return temp;
	},
	
	createNestLabel: function(parentNode,textValue,nestId)
	{
		var temp = dojo.create('label', null, parentNode);
		dojo.attr(temp, "for", nestId);
		temp.appendChild(dojo.doc.createTextNode(textValue));
		return temp;
	},
	createInputWithType: function(parentNode,objname,objid,objtype,objvalue,objchecked)
	 {
		var ret = null;
		ret = document.createElement("input");
		ret.name = objname;
		ret.type = objtype;
		ret.id = objid;
		parentNode.appendChild(ret);
		if( objvalue )
		 	ret.value = objvalue;
		if( objchecked )
		 	ret.checked = objchecked;

	 	return ret;
	 },
	 
	setDefaultPaperSize: function(locale)
	{
		this.storeCurrentValue();
		var i=this.getDefaultSizeIndex(locale);
		
		var comboBox = dijit.byId(this.comboBoxId);
		if(comboBox)
		{
			comboBox.setValue(this.sizeNamesArray[i]);													
		}
		this.changeStatus();						
	},	 
	
	changeOrientationMode: function(mode)
	{		
		if(this.CURRENT_MODE != mode)
		{
			var objh=dojo.byId(this.heightId);
			var objw=dojo.byId(this.widthId);
			var temp=objh.value;
			objh.value=objw.value;
			objw.value=temp;
			this.checkValue(this.bottomMarginId);
			this.checkValue(this.rightMarginId);			
			this.CURRENT_MODE = mode;
			var portraitRadio = dojo.byId(this.radioPortaitId);
			var landscapeRadio = dojo.byId(this.radioLandscapeId);
			if (mode == this.LANDSCAPE_MODE) 
			{
				landscapeRadio.checked = true;
				portraitRadio.checked = false;
			} 
			else if (mode == this.PORTRAIT_MODE) 
			{
				portraitRadio.checked = true;
				landscapeRadio.checked = false;
			}
		}
		
	},
	
	checkScope:function(id)
	{
		var h=concord.unit.parseValue((dojo.byId(this.heightId).value), this.allowedUnit);
		var w=concord.unit.parseValue((dojo.byId(this.widthId).value), this.allowedUnit);
		var t=concord.unit.parseValue((dojo.byId(this.topMarginId).value), this.allowedUnit);
		var b=concord.unit.parseValue((dojo.byId(this.bottomMarginId).value), this.allowedUnit);
		var l=concord.unit.parseValue((dojo.byId(this.leftMarginId).value), this.allowedUnit);
		var r=concord.unit.parseValue((dojo.byId(this.rightMarginId).value), this.allowedUnit);
		var hh=0.50,fh=0.50;//by default unit is cm
		if(!this.metric){
			hh = concord.unit.CmToIn(hh);
			fh = concord.unit.CmToIn(fh);
		}			
		if(this.docTypeCur === this.docTypeText)
		{
			hh=concord.unit.parseValue((dojo.byId(this.headerHeightId).value), this.allowedUnit);
			fh=concord.unit.parseValue((dojo.byId(this.footerHeightId).value), this.allowedUnit);
		}		
		var obj=dojo.byId(id);
		var v=concord.unit.parseValue(obj.value, this.allowedUnit);
		var temp=v;
		var outScope = false;
		var maxLimit = 300.00;
		var dv1 = 2;
		var dv2 = 0.5;
		if(!this.metric){
			maxLimit = concord.unit.CmToIn(maxLimit);
			dv1 = concord.unit.CmToIn(dv1);
			dv2 = concord.unit.CmToIn(dv2);
		}		
		switch(id)
		{
			case this.heightId:
				if(h>maxLimit){
					temp=maxLimit;
					outScope = true;
				}					
				if(temp<t+b+dv1){
					temp=t+b+dv1;
					outScope = true;
				}					
				break;
			case this.widthId:
				if(w>maxLimit){
					temp=maxLimit;
					outScope = true;
				}					
				if(temp<l+r+dv2){
					temp=l+r+dv2;
					outScope = true;
				}					
				break;
			case this.topMarginId://top
				if(t<0){
					temp=0.00;
					outScope = true;
				}					
				if(temp>h-b-dv1){
					temp=h-b-dv1;
					outScope = true;
				}					
				if(temp<0)
				{
					temp=0.00;
					outScope = true;
					this.checkScope(this.bottomMarginId);
				}
				break;
			case this.bottomMarginId://bottom
				if(b<0){
					temp=0.00;
					outScope = true;
				}
				if(temp>h-t-dv1){
					temp=h-t-dv1;
					outScope = true;
				}
				if(temp<0)
				{
					temp=0.00;
					outScope = true;
					this.checkScope(this.topMarginId);
				}
				break;
			case this.leftMarginId://left
				if(l<0){
					temp=0.00;
					outScope = true;
				}
				if(temp>w-r-dv2){
					temp=w-r-dv2;
					outScope = true;
				}
				if(temp<0)
				{
					temp=0.00;
					outScope = true;
					this.checkScope(this.rightMarginId);
				}
				break;
			case this.rightMarginId://right
				if(r<0){
					temp=0.00;
					outScope = true;
				}
				if(temp>w-l-dv2){
					temp=w-l-dv2;
					outScope = true;
				}
				if(temp<0)
				{
					temp=0.00;
					outScope = true;
					this.checkScope(this.leftMarginId);
				}
				break;
			case this.headerHeightId: // header height
				if(this.docTypeCur === this.docTypeText)
				{
					var mhh= (h>maxLimit)?maxLimit:h;
					if(hh>mhh){
						temp=mhh;
						outScope = true;
					}						
					if(temp<0){
						temp=0.0;
						outScope = true;
					}						
				}
				break;
			case this.footerHeightId: // footer height
				if(this.docTypeCur === this.docTypeText)
				{
					var mhh= (h>maxLimit)?maxLimit:h;
					if(fh>mhh){
						temp=mhh;
						outScope = true;
					}						
					if(temp<0){
						temp=0.0;
						outScope = true;
					}
				}
				break;
			default:
				break;
		}
		if(outScope){
			this.showWarningMsg(this.dialog);
		}		
		obj.value=this.formatNumber(temp);
	},
	getPreValue: function(id)
	{
		switch(id)
		{
			case this.heightId:
				return this.cur_value[0];
			case this.widthId:
				return this.cur_value[1];
			case this.topMarginId:
				return this.cur_value[2];
			case this.bottomMarginId:
				return this.cur_value[3];
			case this.leftMarginId:
				return this.cur_value[4];
			case this.rightMarginId:
				return this.cur_value[5];
			// [7]  -- landscape radio 
			// [8]  -- portait radio
			// [9]  -- header checkbox
			// [10] -- footer checkbox
			// [11] -- gridline checkbox	
			case this.headerHeightId:
				return this.cur_value[11];
			case this.footerHeightId:
				return this.cur_value[12];	
			// [13] -- combox 
			// [14] -- current page mode	
		}
	},
	checkValue: function(id)
	{
		var obj=dojo.byId(id);
		if(!this.checkInput(id))
		{
			this.showWarningMsg(this.dialog);
			obj.value=this.formatNumber(this.getPreValue(id));
		}
		else
		{
			this.checkScope(id);
		}
		if(id==this.widthId || id==this.heightId)
		{
			var h=concord.unit.parseValue((dojo.byId(this.heightId).value), this.allowedUnit);			
			var w=concord.unit.parseValue((dojo.byId(this.widthId).value), this.allowedUnit);
			var index=-1;
			var combox=dijit.byId(this.comboBoxId);
			for (i=0;i<this.SIZE_COUNT;i++) 
			{ 
				if(h==this.sizeHeightArray[i]&&w==this.sizeWidthArray[i])
				{
					index=i;				
					combox.setValue(this.sizeNamesArray[i]);
					var landscapeRadio = dojo.byId(this.radioLandscapeId);
					landscapeRadio.checked = false;
					var portraitRadio = dojo.byId(this.radioPortaitId);
					portraitRadio.checked = true;
					this.CURRENT_MODE=this.PORTRAIT_MODE;
					break;
				}
				else if(w==this.sizeHeightArray[i]&&h==this.sizeWidthArray[i])
				{
					index=i;		
					combox.setValue(this.sizeNamesArray[i]);
					var landscapeRadio = dojo.byId(this.radioLandscapeId);
					landscapeRadio.checked = true;
					var portraitRadio = dojo.byId(this.radioPortaitId);
					portraitRadio.checked = false;
					this.CURRENT_MODE=this.LANDSCAPE_MODE;
					break;
				}
			} 
			if(index==-1)
			{
				combox.setValue(this.sizeNamesArray[12]);
			}
		}
			
	},
	checkInput: function(id) 
	{ 
		var value = concord.unit.parseValue(dojo.byId(id).value, this.allowedUnit);
		if( isNaN(value) || value < 0){
			return false;
		}else{		
			return true;
		}
	} ,
	isInitialsChanged: function() {
		var changed = false;
		if(this.initiated) {
			// if initialed values and changed
			for(var i=0; i<this.cur_value.length; i++) {
				if(this.cur_value[i] != this.orig_value[i]) {
					changed = true;
					break;
				}
			}			
		}
		else {
			// take hard coded value as changed value.
			changed = true;
		}
		
		return changed;
	},	
	storeOrigValue: function() {
		this.storeCurrentValue();		
		for(i=0; i<this.cur_value.length; i++) {
			this.orig_value[i] = this.cur_value[i];
		}
	},		
	storeCurrentValue: function()
	{		
		this.cur_value[0]=concord.unit.parseValue(dojo.byId(this.heightId).value, this.allowedUnit);
		this.cur_value[1]=concord.unit.parseValue(dojo.byId(this.widthId).value, this.allowedUnit);
		this.cur_value[2]=concord.unit.parseValue(dojo.byId(this.topMarginId).value, this.allowedUnit);
		this.cur_value[3]=concord.unit.parseValue(dojo.byId(this.bottomMarginId).value, this.allowedUnit);
		this.cur_value[4]=concord.unit.parseValue(dojo.byId(this.leftMarginId).value, this.allowedUnit);
		this.cur_value[5]=concord.unit.parseValue(dojo.byId(this.rightMarginId).value, this.allowedUnit);
		this.cur_value[6]=dojo.byId(this.radioLandscapeId).checked;
		this.cur_value[7]=dojo.byId(this.radioPortaitId).checked;
		
		if(this.docTypeCur === this.docTypeText || this.docTypeCur === this.docTypeSheet)
		{// not presentation
			this.cur_value[8]=dojo.byId(this.headerCheckId).checked;		
			this.cur_value[9]=dojo.byId(this.footerCheckId).checked;
			if(this.docTypeCur === this.docTypeSheet)
			{// sheet
				this.cur_value[10]=dojo.byId(this.gridlineCheckId).checked;				
			}
			else
			{// text			
				this.cur_value[11]=concord.unit.parseValue(dojo.byId(this.headerHeightId).value, this.allowedUnit);
				this.cur_value[12]=concord.unit.parseValue(dojo.byId(this.footerHeightId).value, this.allowedUnit);
			}
		}
		this.cur_value[13]=dojo.byId(this.taggedpdfCheckId).checked;
	},	
	changeStatus:function()
	{
        var index = this.getIndex(dojo.byId(this.comboBoxId).value);
        if(index==-1)
        {
        	this.showWarningMsg(this.dialog);
        	this.checkValue(this.widthId);
        	return;
        }
		var width=dojo.byId(this.widthId);
		var height=dojo.byId(this.heightId);
		if(index >=0 && index < this.SIZE_COUNT)
		{
			if(index!=12&&this.CURRENT_MODE==this.PORTRAIT_MODE)
			{
				width.value=this.formatNumber(this.sizeWidthArray[index]);
				height.value=this.formatNumber(this.sizeHeightArray[index]);
			}
			else if(index!=12&&this.CURRENT_MODE==this.LANDSCAPE_MODE)
			{		
				height.value=this.formatNumber(this.sizeWidthArray[index]);
				width.value=this.formatNumber(this.sizeHeightArray[index]);
			}
			this.checkValue(this.bottomMarginId);
			this.checkValue(this.rightMarginId);
		}
	},
	
	getIndex:function(val)
	{
		for(var i=0;i<this.sizeNamesArray.length;i++)
		{
			if(val==this.sizeNamesArray[i])
				{
					return i;
					break;
				}
		}
		return -1;
	},
	
	changePageOrderMode: function(isLTR)
	{
		
		this.IS_LEFT_TO_RIGHT_ORDER = isLTR;
		var radioT2B = dojo.byId(this.radioTopToBottomId);
		var radioL2R = dojo.byId(this.radioLeftToRightId);
		if (isLTR) 
		{
			dojo.attr(radioT2B,'value',false);
			dojo.attr(radioL2R,'value',true);			
		}		
		else
		{
			dojo.attr(radioT2B,'value',true);
			dojo.attr(radioL2R,'value',false);
		}			
	},
	
	showWarningMsg: function(dialog){
		if (this.internalWarningMsg) {
			dialog.msgContainer.remove(this.internalWarningMsg);
			this.internalWarningMsg = null;
		}
		var msg = this.internalWarningMsg = {};
		msg.warning = true;
		msg.message = this.nls.PAGE_SETUP_INVALID_MSG;
		dialog.msgContainer.add(msg);
		setTimeout(dojo.hitch(this, function(){
			if (this.internalWarningMsg) {
				this.dialog.msgContainer.remove(this.internalWarningMsg);
				this.internalWarningMsg = null;
			}
		}), 5000);
	},
	
	getPageSettings: function() {
		var ret = {};
		ret['hasSet'] = false;
		
		var url = concord.global.getDocSettingsUri(this.file.getId())+"/page";
		var userID = this.app.getAuthenticatedUserId();
        var response, ioArgs;
        var resp = concord.global.xhrGet({
            url: url,
            filesUserId : userID,
            handleAs: "json",
			load: function(response, ioArgs) {
			},
			error: function(response, ioArgs) {			
			},
			sync: true,
			preventCache: false
        });
		if (resp.ioArgs.xhr.status == 200) {
			var json = resp.results[0];				
			for(var key in json) {
				ret['hasSet'] = true;
				var value = json[key];
				switch (key) {
					case 'pageWidth':
					case 'pageHeight':
					case 'marginLeft':
					case 'marginRight':
					case 'marginTop':
					case 'marginBottom':
						try {
							ret[key] = parseFloat(value.substring(0,value.length-2));
						}
						catch(exception)
						{
							ret[key] = null;
						}													
						break;	
					case 'orientation':
					case 'pageOrder':	
						ret[key] = value;
						break;
					default:
						break;
				}						
			}				
		} else {
			return null;			
		}		  				
			
		return ret; 
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
	isDefaultPortrait: function() {
		if(this.settings && this.settings.orientation) {
			if(this.settings.orientation == "portrait") {
				return true;
			}
			else {
				return false;
			}
				
		}		
		if(this.docTypeCur === this.docTypePres)
			return false;
		else
			return true;
	},		
	getDefaultMarginL: function() {
		if(this.settings) {
			if(this.settings.marginLeft != null) {
				var value = this.metric ? this.settings.marginLeft : concord.unit.CmToIn(this.settings.marginLeft);
				return this.formatNumber(value);
			}
		}
		return this.defaultMargin;
	},
	
	getDefaultMarginR: function() {
		if(this.settings) {
			if(this.settings.marginRight != null) {
				var value = this.metric ? this.settings.marginRight : concord.unit.CmToIn(this.settings.marginRight);
				return this.formatNumber(value);				
			}
		}
		return this.defaultMargin;
	},
	
	getDefaultMarginT: function() {
		if(this.settings) {
			if(this.settings.marginTop != null) {
				var value = this.metric ? this.settings.marginTop : concord.unit.CmToIn(this.settings.marginTop);
				return this.formatNumber(value);
			}
		}
		return this.defaultMargin;
	},
	
	getDefaultMarginB: function() {
		if(this.settings) {
			if(this.settings.marginBottom != null) {
				var value = this.metric ? this.settings.marginBottom : concord.unit.CmToIn(this.settings.marginBottom);
				return this.formatNumber(value);
			}
		}
		return this.defaultMargin;
	},
	
	getDefaultHeight: function() {
		if(this.settings && this.settings.pageHeight) {		
			var value = this.metric ? this.settings.pageHeight : concord.unit.CmToIn(this.settings.pageHeight);				
			return this.formatNumber(value);		
		}
		var i = this.getDefaultSizeIndex(this.locale);
		if(i == this.SIZE_USER) { //reset again if it's SIZE_USER 
			i = this.getDefaultSizeIndexByLocale(this.locale);
		}		
		return this.formatNumber(this.sizeHeightArray[i]);
	},
	
	getDefaultWidth: function() {
		if(this.settings && this.settings.pageWidth) {
			var value = this.metric ? this.settings.pageWidth : concord.unit.CmToIn(this.settings.pageWidth);			
			return this.formatNumber(value);			
		}
		var i = this.getDefaultSizeIndex(this.locale);
		if(i == this.SIZE_USER) { //reset again if it's SIZE_USER 
			i = this.getDefaultSizeIndexByLocale(this.locale);
		}		
		return this.formatNumber(this.sizeWidthArray[i]);	
	},
	
	getDefaultSizeIndex: function(locale) {
		if(this.settings) { //by default, the unit is cm
			if(this.settings.pageWidth && this.settings.pageHeight) {
				var h = this.formatNumber(this.settings.pageHeight, true);
				var w = this.formatNumber(this.settings.pageWidth, true);
				for(var index=0; index<this.sizeNamesArray.length; index++) {
					if((w == this.widthCMData[index] && h == this.heightCMData[index]) || (h == this.widthCMData[index] && w == this.heightCMData[index])) {
						return index;
					}
				}
				// if no match width/height, return SIZE_USER
				return this.SIZE_USER;
			}
		}
		
		return this.getDefaultSizeIndexByLocale(locale);
	},	
	
	getDefaultSizeIndexByLocale: function(locale) {
		var i=1;
		if(locale=="en-us"||locale=="en-ca"||locale=="en-ph"||locale=="es-cl"||locale=="es-mx"||locale=="es-co"||locale=="es-ve"||locale=="es-pr")
			i=9;		
		return i;	
	},	
	
	_createContent: function(contentDiv)
	{
		this._initDocType();	
		/*Initialize unit and allowedUnit */
		this.metric = concord.unit.isMeticUnit();
		if(!this.unit){
			this.unit = this.metric ? this.nls.CM_LABEL : '"';			
		}
		if(!this.allowedUnit){
			if(this.metric){
				this.allowedUnit = { 'cm':this.nls.CM_LABEL }; 				
			}else{
				this.allowedUnit = { 'in':'"' };
			}			
		}		
		this._loadLocalArrays();
		this.settings = this.getPageSettings();
		if(this.settings && this.settings['hasSet']) {
			this.initiated = true;
		}			
		var layoutTable = dojo.create('table', null, contentDiv);
		layoutTable.style.cssText = "width: 100%;";
		dijit.setWaiRole(layoutTable, "presentation");
		layoutTable.id = this.tableId;
		var layoutTbody = dojo.create('tbody', null, layoutTable);
		var msgTR = dojo.create('tr', null, layoutTbody);
		var msgTRTD = dojo.create('td', null, msgTR);
		dojo.attr(msgTRTD, "colSpan", "2"); // msg
		var msgDiv = dojo.create('div', null, msgTRTD);
		dijit.setWaiRole(msgDiv, "alert");
		this.dialog.msgContainer = new lconn.share.widget.MessageContainer({
			nls : this.app.nls
		}, msgDiv);
		
		var layoutTR = dojo.create('tr', null, layoutTbody);
		var layoutTRTD1 = dojo.create('td', null, layoutTR);
		var layoutTRTD2 = dojo.create('td', null, layoutTR);
		
		var layoutTable1 = dojo.create('table', null, layoutTRTD1);
		dijit.setWaiRole(layoutTable1, "presentation");
		var layoutTbody1 = dojo.create('tbody', null, layoutTable1);
		
		var layoutTable2 = dojo.create('table', null, layoutTRTD2);
		dijit.setWaiRole(layoutTable2, "presentation");
		var layoutTbody2 = dojo.create('tbody', null, layoutTable2);
		
		var layoutT1TR1 = dojo.create('tr', null, layoutTbody1);
		//var layoutT1TR2 = dojo.create('tr', null, layoutTbody1);
		var layoutT1TR3 = dojo.create('tr', null, layoutTbody1);
		var layoutT1TR4 = dojo.create('tr', null, layoutTbody1);
		var layoutT1TR5 = dojo.create('tr', null, layoutTbody1);
		var layoutT1TR6 = dojo.create('tr', null, layoutTbody1);
		var layoutT1TR7 = dojo.create('tr', null, layoutTbody1);
		var layoutT1TR8 = dojo.create('tr', null, layoutTbody1);
		var layoutT1TR9 = dojo.create('tr', null, layoutTbody1);
		var layoutT1TR10 = dojo.create('tr', null, layoutTbody1);
		
		var layoutT2TR1 = dojo.create('tr', null, layoutTbody2);
		var layoutT2TR2 = dojo.create('tr', null, layoutTbody2);
		var layoutT2TR3 = dojo.create('tr', null, layoutTbody2);
		var layoutT2TR4 = dojo.create('tr', null, layoutTbody2);
		var layoutT2TR5 = dojo.create('tr', null, layoutTbody2);
		var layoutT2TR6 = dojo.create('tr', null, layoutTbody2);
		//var layoutT2TR7 = dojo.create('tr', null, layoutTbody2);
		//var layoutT2TR8 = dojo.create('tr', null, layoutTbody2);
		var layoutT2TR9 = dojo.create('tr', null, layoutTbody2);
		var layoutT2TR10 = dojo.create('tr', null, layoutTbody2);
		
		var layoutTR1TD1 = dojo.create('td', null, layoutT1TR1);
		//margin label
		var layoutTR1TD3 = dojo.create('td', null, layoutT2TR1);
		var layoutTR1TD4 = dojo.create('td', null, layoutT2TR1);
		//var layoutTR2TD1 = dojo.create('td', null, layoutT1TR2);
		//var layoutTR2TD2 = dojo.create('td', null, layoutT1TR2);
		var layoutTR2TD3 = dojo.create('td', null, layoutT2TR2);
		var layoutTR2TD4 = dojo.create('td', null, layoutT2TR2);
		var layoutTR3TD1 = dojo.create('td', null, layoutT1TR3);
		var layoutTR3TD3 = dojo.create('td', null, layoutT2TR3);
		var layoutTR3TD4 = dojo.create('td', null, layoutT2TR3);
		var layoutTR4TD1 = dojo.create('td', null, layoutT1TR4);
		var layoutTR4TD2 = dojo.create('td', null, layoutT1TR4);
		var layoutTR4TD3 = dojo.create('td', null, layoutT2TR4);
		var layoutTR4TD4 = dojo.create('td', null, layoutT2TR4);
		var layoutTR5TD1 = dojo.create('td', null, layoutT1TR5);
		var layoutTR5TD2 = dojo.create('td', null, layoutT1TR5);
		var layoutTR5TD3 = dojo.create('td', null, layoutT2TR5);
		var layoutTR5TD4 = dojo.create('td', null, layoutT2TR5);
		var layoutTR6TD1 = dojo.create('td', null, layoutT1TR6);
		var layoutTR6TD2 = dojo.create('td', null, layoutT1TR6);
		var layoutTR6TD3 = dojo.create('td', null, layoutT2TR6);
		var layoutTR6TD4 = dojo.create('td', null, layoutT2TR6);
		var layoutTR7TD1 = dojo.create('td', null, layoutT1TR7);			
		var layoutTR7TD2 = dojo.create('td', null, layoutT1TR7);
		//var layoutTR7TD3 = dojo.create('td', null, layoutT2TR7);
		//var layoutTR7TD4 = dojo.create('td', null, layoutT2TR7);
		var layoutTR8TD1 = dojo.create('td', null, layoutT1TR8);
		var layoutTR8TD2 = dojo.create('td', null, layoutT1TR8);
		//var layoutTR8TD3 = dojo.create('td', null, layoutT2TR8);
		//var layoutTR8TD4 = dojo.create('td', null, layoutT2TR8);
		var layoutTR9TD1 = dojo.create('td', null, layoutT1TR9);
		var layoutTR9TD2 = dojo.create('td', null, layoutT1TR9);		
		var layoutTR9TD3 = dojo.create('td', null, layoutT2TR9);		
		var layoutTR9TD4 = dojo.create('td', null, layoutT2TR9);	
		var layoutTR10TD1 = dojo.create('td', null, layoutT1TR10);
		var layoutTR10TD2 = dojo.create('td', null, layoutT1TR10);		
		var layoutTR10TD3 = dojo.create('td', null, layoutT2TR10);		
		var layoutTR10TD4 = dojo.create('td', null, layoutT2TR10);	
		
		dojo.attr(layoutTR1TD1,"colSpan","2"); // Orientation
		dojo.attr(layoutTR3TD1,"colSpan","2"); // Orientation
		dojo.attr(layoutTR7TD1,"colSpan","2"); // display options		
		dojo.attr(layoutTR6TD3,"colSpan","2"); // top to bottom & left to right			
		dojo.attr(layoutTR9TD3,"colSpan","2"); // grid lines
		
		var plainLabelValue = "font-weight: normal;";
		var inputWidthValue = "width: 80px;";
		var pageOrderCssValue = "padding-top: 5px";
		
		this.CURRENT_MODE = this.isDefaultPortrait();
		var fsNode = dojo.create('fieldset', null, layoutTR1TD1)
		var legendNode = dojo.create('legend', null, fsNode);
		var orientationLabel=this.createDivLabel(legendNode, this.nls.ORIENTATION_LABEL);
		this.PORTRAIT_MODE = true;
		this.LANDSCAPE_MODE = false;

		// orientation
		var radio2=this.createInputWithType(fsNode, 'taskType', this.radioPortaitId, 'radio', this.PORTRAIT_MODE,this.CURRENT_MODE);
		var label2 = this.createNestLabel(fsNode,this.nls.PORTRAIT,this.radioPortaitId);
		label2.style.cssText = plainLabelValue;
		var radio1=this.createInputWithType(fsNode, 'taskType', this.radioLandscapeId, 'radio', this.LANDSCAPE_MODE,!this.CURRENT_MODE);
		var label1 = this.createNestLabel(fsNode,this.nls.LANDSCAPE,this.radioLandscapeId);
		label1.style.cssText = plainLabelValue;
		this.connectArray.push( dojo.connect(radio1, 'onclick', dojo.hitch(this, "changeOrientationMode", this.LANDSCAPE_MODE)) );
		this.connectArray.push( dojo.connect(radio2, 'onclick', dojo.hitch(this, "changeOrientationMode", this.PORTRAIT_MODE)) );
		
		// Paper Format
		var paperFormatLabel=this.createDivLabel(layoutTR3TD1, this.nls.PAPER_FORMAT_LABEL);
		var sizeLabel=this.createDivLabel(layoutTR4TD1, this.nls.PAPER_SIZE_LABEL);	
		sizeLabel.style.cssText = plainLabelValue;
		var storeData = {
	                identifier: 'id',
	                label: 'name',
	                items: [{id:0,name:this.sizeNamesArray[0]},
	                		{id:1,name:this.sizeNamesArray[1]},
	                		{id:2,name:this.sizeNamesArray[2]},
	                		{id:3,name:this.sizeNamesArray[3]},
	                		{id:4,name:this.sizeNamesArray[4]},
	                		{id:5,name:this.sizeNamesArray[5]},
	                		{id:6,name:this.sizeNamesArray[6]},
	                		{id:7,name:this.sizeNamesArray[7]},
	                		{id:8,name:this.sizeNamesArray[8]},
	                		{id:9,name:this.sizeNamesArray[9]},
	                		{id:10,name:this.sizeNamesArray[10]},
	                		{id:11,name:this.sizeNamesArray[11]},
	                		{id:12,name:this.sizeNamesArray[12]},
	                		{id:13,name:this.sizeNamesArray[13]},
	                		{id:14,name:this.sizeNamesArray[14]},
	                		{id:15,name:this.sizeNamesArray[15]},
	                		{id:16,name:this.sizeNamesArray[16]},
	                		{id:17,name:this.sizeNamesArray[17]},
	                		{id:18,name:this.sizeNamesArray[18]},
	                		{id:19,name:this.sizeNamesArray[19]},
	                		{id:20,name:this.sizeNamesArray[20]},
	                		{id:21,name:this.sizeNamesArray[21]},
	                		{id:22,name:this.sizeNamesArray[22]},
	                		{id:23,name:this.sizeNamesArray[23]},
	                		{id:24,name:this.sizeNamesArray[24]},
	                		{id:25,name:this.sizeNamesArray[25]},
	                		{id:26,name:this.sizeNamesArray[26]}
	                ]
		};
		 
		var nameStore = new dojo.data.ItemFileReadStore({
			data: storeData
		});
		var sizeCombox = this.sizeCombox = new dijit.form.ComboBox({
			id: this.comboBoxId,
			name: "fontname",
			value: this.sizeNamesArray[1],
			store: nameStore,
			style:"width:100px;height:20px",
			searchAttr: "name"
		});
		this.connectArray.push( dojo.connect(sizeCombox, 'onChange', dojo.hitch(this, "changeStatus")) );
		dojo.attr(sizeLabel, "for", this.comboBoxId);
		layoutTR4TD2.appendChild(sizeCombox.domNode);
		if(sizeCombox.textbox){
			dojo.style(sizeCombox.textbox, {"height":"18px", "fontSize":"10pt", "padding":"1px"});						
		}
		dojo.query('.dijitButtonNode',sizeCombox.domNode).forEach(function(node,index,array){
			dojo.style(node,{"height":"16px", "border":"0px"}); 			
		});		
		
		// Width and Height
		var heightLabel=this.createDivLabel(layoutTR5TD1, this.nls.HEIGHT);
		heightLabel.style.cssText = plainLabelValue;		
		var heightTextField=this.createInputWithType(layoutTR5TD2, 'heighttext', this.heightId, 'text', this.getDefaultHeight(),null);
		heightTextField.style.cssText = inputWidthValue;
		dijit.setWaiState(heightTextField, 'label',(this.metric ? this.nls.HEIGHT_DESC : this.nls.HEIGHT_DESC2));
		//this.createCMLabel(layoutTR5TD2);
		var widthLabel=this.createDivLabel(layoutTR6TD1, this.nls.WIDTH, "printSpreadsheetLabel");
		widthLabel.style.cssText = plainLabelValue;
		var widthTextField=this.createInputWithType(layoutTR6TD2, 'widthtext', this.widthId, 'text', this.getDefaultWidth(),null);
		widthTextField.style.cssText = inputWidthValue;
		dijit.setWaiState(widthTextField, 'label',(this.metric ? this.nls.WIDTH_DESC : this.nls.WIDTH_DESC2));
		//this.createCMLabel(layoutTR6TD2);	
		this.connectArray.push( dojo.connect(heightTextField, 'onchange', dojo.hitch(this, "checkValue",this.heightId)) );
		this.connectArray.push( dojo.connect(widthTextField, 'onchange', dojo.hitch(this, "checkValue",this.widthId)) );
				
		// Margins
		var marginsLabel=this.createDivLabel(layoutTR1TD3, this.nls.MARGINS_LABEL);
		/*margin top*/
		var topLabel=this.createDivLabel(layoutTR2TD3, this.nls.TOP);
		topLabel.style.cssText = plainLabelValue;
		var topTextField=this.createInputWithType(layoutTR2TD4, 'toptext', this.topMarginId, 'text', this.getDefaultMarginT(),null);
		topTextField.style.cssText = inputWidthValue;
		dijit.setWaiState(topTextField, 'label',(this.metric ? this.nls.TOP_DESC : this.nls.TOP_DESC2));
		//this.createCMLabel(layoutTR2TD4);
		/*margin bottom*/
		var bottomLabel=this.createDivLabel(layoutTR3TD3, this.nls.BOTTOM);
		bottomLabel.style.cssText = plainLabelValue;
		var bottomTextField=this.createInputWithType(layoutTR3TD4, 'bottomtext', this.bottomMarginId, 'text', this.getDefaultMarginB(),null);		
		bottomTextField.style.cssText = inputWidthValue;
		dijit.setWaiState(bottomTextField, 'label',(this.metric ? this.nls.BOTTOM_DESC : this.nls.BOTTOM_DESC2));
		//this.createCMLabel(layoutTR3TD4);
		/*margin left*/
		var leftLabel=this.createDivLabel(layoutTR4TD3, this.nls.LEFT);
		leftLabel.style.cssText = plainLabelValue;
		var leftTextField=this.createInputWithType(layoutTR4TD4, 'lefttext', this.leftMarginId, 'text', this.getDefaultMarginL(),null);
		leftTextField.style.cssText = inputWidthValue;
		dijit.setWaiState(leftTextField, 'label',(this.metric ? this.nls.LEFT_DESC : this.nls.LEFT_DESC2));
		//this.createCMLabel(layoutTR4TD4);
		/* margin right*/
		var rightLabel=this.createDivLabel(layoutTR5TD3, this.nls.RIGHT);
		rightLabel.style.cssText = plainLabelValue;
		var rightTextField=this.createInputWithType(layoutTR5TD4, 'righttext', this.rightMarginId, 'text', this.getDefaultMarginR(),null);
		rightTextField.style.cssText = inputWidthValue;
		dijit.setWaiState(rightTextField, 'label',(this.metric ? this.nls.RIGHT_DESC : this.nls.RIGHT_DESC2));
		//this.createCMLabel(layoutTR5TD4);
		this.connectArray.push( dojo.connect(topTextField, 'onchange', dojo.hitch(this, "checkValue",this.topMarginId)) );
		this.connectArray.push( dojo.connect(bottomTextField,'onchange', dojo.hitch(this, "checkValue",this.bottomMarginId)) );
		this.connectArray.push( dojo.connect(leftTextField, 'onchange', dojo.hitch(this, "checkValue",this.leftMarginId)) );
		this.connectArray.push( dojo.connect(rightTextField, 'onchange', dojo.hitch(this, "checkValue",this.rightMarginId)) );		
		
		/*Display option Div, these are options and different for applications*/
		var displayLabel=this.createDivLabel(layoutTR7TD1, this.nls.DISPLAY_OPTION_LABEL);
		if(this.docTypeCur === this.docTypeText || this.docTypeCur === this.docTypeSheet)
		{			
			var headerCheck=this.createInputWithType(layoutTR8TD1, 'header', this.headerCheckId, 'checkbox',null,true);
			var headerLabel = this.createNestLabel(layoutTR8TD1,this.nls.HEADER,this.headerCheckId);
			headerLabel.style.cssText = plainLabelValue;
			var footerCheck=this.createInputWithType(layoutTR9TD1, 'footer', this.footerCheckId, 'checkbox',null,true);
			var footerLabel = this.createNestLabel(layoutTR9TD1,this.nls.FOOTER,this.footerCheckId);
			footerLabel.style.cssText = plainLabelValue;			
			if(this.docTypeCur === this.docTypeText)
			{
				// header & footer
				var hfValue = "0.50";
				hfValue = this.metric ? hfValue: concord.unit.CmToIn(hfValue);
				
				var headerHeightField=this.createInputWithType(layoutTR8TD2, 'heighttext', this.headerHeightId, 'text', this.formatNumber(hfValue),null);
				headerHeightField.style.cssText = inputWidthValue;
				//this.createCMLabel(layoutTR8TD2);	
				dijit.setWaiState(headerHeightField, 'label',this.nls.HEADER_DESC);
				var footerHeightField=this.createInputWithType(layoutTR9TD2, 'heighttext', this.footerHeightId, 'text', this.formatNumber(hfValue),null);
				footerHeightField.style.cssText = inputWidthValue;				
				//this.createCMLabel(layoutTR9TD2);
				dijit.setWaiState(footerHeightField, 'label',this.nls.FOOTER_DESC);
				this.connectArray.push( dojo.connect(headerHeightField, 'onchange', dojo.hitch(this, "checkValue",this.headerHeightId)) );
				this.connectArray.push( dojo.connect(footerHeightField, 'onchange', dojo.hitch(this, "checkValue",this.footerHeightId)) );
				// tagged pdf
				var taggedpdfCheck=this.createInputWithType(layoutTR10TD1, 'taggedpdf', this.taggedpdfCheckId, 'checkbox',null,false);
				var taggedpdfLabel = this.createNestLabel(layoutTR10TD1,this.nls.TAGGED_PDF,this.taggedpdfCheckId);
				taggedpdfLabel.style.cssText = plainLabelValue;							
			}
			else
			{							
				// tagged pdf
				var taggedpdfCheck=this.createInputWithType(layoutTR8TD2, 'taggedpdf', this.taggedpdfCheckId, 'checkbox',null,false);
				var taggedpdfLabel = this.createNestLabel(layoutTR8TD2,this.nls.TAGGED_PDF,this.taggedpdfCheckId);
				taggedpdfLabel.style.cssText = plainLabelValue;				
				// grid lines
				var gridlineCheck=this.createInputWithType(layoutTR9TD2, 'gridlilne', this.gridlineCheckId, 'checkbox',null,false);
				var gridlineLabel = this.createNestLabel(layoutTR9TD2,this.nls.GRIDLINE,this.gridlineCheckId);
				gridlineLabel.style.cssText = plainLabelValue;
				// page order
				this.initPageOrder();
				var pageOrderNode = dojo.create('fieldset', null, layoutTR6TD3)
				var legendNode = dojo.create('legend', null, pageOrderNode);
				var pageOrderLabel=this.createDivLabel(legendNode, this.nls.PAGE_LABEL);
				
				var t2bNode = dojo.create('div', null, pageOrderNode);
				var l2rNode = dojo.create('div', null, pageOrderNode);
				t2bNode.style.cssText = pageOrderCssValue;
				l2rNode.style.cssText = pageOrderCssValue;
				var radioT2B=this.createInputWithType(t2bNode, 'pageOrder', this.radioTopToBottomId, 'radio', !this.IS_LEFT_TO_RIGHT_ORDER,!this.IS_LEFT_TO_RIGHT_ORDER);
				var labelT2B = this.createNestLabel(t2bNode,this.nls.PAGE_TYPE1,this.radioTopToBottomId);
				labelT2B.style.cssText = plainLabelValue;			
				var radioL2R=this.createInputWithType(l2rNode, 'pageOrder', this.radioLeftToRightId, 'radio', this.IS_LEFT_TO_RIGHT_ORDER,this.IS_LEFT_TO_RIGHT_ORDER);
				var labelL2R = this.createNestLabel(l2rNode,this.nls.PAGE_TYPE2,this.radioLeftToRightId);
				labelL2R.style.cssText = plainLabelValue;				
				this.connectArray.push( dojo.connect(radioT2B, 'onclick', dojo.hitch(this, "changePageOrderMode", false)) );
				this.connectArray.push( dojo.connect(radioL2R, 'onclick', dojo.hitch(this, "changePageOrderMode", true)) );
			}
		}		
		else
		{// presentation
			// tagged pdf
			var taggedpdfCheck=this.createInputWithType(layoutTR8TD1, 'taggedpdf', this.taggedpdfCheckId, 'checkbox',null,false);
			var taggedpdfLabel = this.createNestLabel(layoutTR8TD1,this.nls.TAGGED_PDF,this.taggedpdfCheckId);
			taggedpdfLabel.style.cssText = plainLabelValue;							
		}
		setTimeout(dojo.hitch(this, function(){				
			this.setDefaultPaperSize(this.locale);
			this.storeOrigValue();  
		}), 30);
	},	
	
	//opt for NLS strings.
	constructor : function(app, scene, opt) {
		this.inherited(arguments);
		this.app = app;
		this.wDialog = "600px";		
		//getNls call before in 'inherited', then mixin more here.
		this.nls = dojo.mixin(this.nls, {
			OK : opt.OK,
			OkTitle : opt.OkTitle,
			pageSetupDialogTitle : opt.pageSetupDialogTitle,			
			ORIENTATION_LABEL: opt.ORIENTATION_LABEL,
			PORTRAIT: opt.PORTRAIT,
			LANDSCAPE: opt.LANDSCAPE,	
			MARGINS_LABEL: opt.MARGINS_LABEL,
			TOP: opt.TOP,
			BOTTOM: opt.BOTTOM,
			LEFT: opt.LEFT,
			RIGHT: opt.RIGHT,
			TOP_DESC: opt.TOP_DESC,
			TOP_DESC2: opt.TOP_DESC2,
			BOTTOM_DESC: opt.BOTTOM_DESC,
			BOTTOM_DESC2: opt.BOTTOM_DESC2,
			LEFT_DESC: opt.LEFT_DESC,
			LEFT_DESC2: opt.LEFT_DESC2,
			RIGHT_DESC: opt.RIGHT_DESC,
			RIGHT_DESC2: opt.RIGHT_DESC2,
			PAPER_FORMAT_LABEL: opt.PAPER_FORMAT_LABEL,
			PAPER_SIZE_LABEL: opt.PAPER_SIZE_LABEL,
			HEIGHT: opt.HEIGHT,
			HEIGHT_DESC: opt.HEIGHT_DESC,
			HEIGHT_DESC2: opt.HEIGHT_DESC2,
			WIDTH: opt.WIDTH,
			WIDTH_DESC: opt.WIDTH_DESC,
			WIDTH_DESC2: opt.WIDTH_DESC2,	
			CM_LABEL: opt.CM_LABEL,
			LETTER: opt.LETTER,
			LEGAL: opt.LEGAL,
			TABLOID: opt.TABLOID,
			USER: opt.USER,
			SIZE1: opt.SIZE1,
			SIZE2: opt.SIZE2,
			SIZE3: opt.SIZE3,
			SIZE4: opt.SIZE4,
			SIZE5: opt.SIZE5,
			SIZE6: opt.SIZE6,
			SIZE7: opt.SIZE7,
			SIZE8: opt.SIZE8,
			SIZE9: opt.SIZE9,
			DISPLAY_OPTION_LABEL: opt.DISPLAY_OPTION_LABEL,
			HEADER: opt.HEADER,
			HEADER_DESC: opt.HEADER_DESC,
			FOOTER: opt.FOOTER,
			FOOTER_DESC: opt.FOOTER_DESC,
			GRIDLINE: opt.GRIDLINE,
			TAGGED_PDF: opt.TAGGED_PDF,
			PAGE_LABEL: opt.PAGE_LABEL,
			PAGE_TYPE1: opt.PAGE_TYPE1,
			PAGE_TYPE2: opt.PAGE_TYPE2,
			PAGE_SETUP_INVALID_MSG: opt.PAGE_SETUP_INVALID_MSG
		});
	},

	getNls : function(app) {
		return concord.global.nls;
	},	
	
	//opt for other options.
	createDialog : function(item, opt, dialog) {
		opt = dojo.mixin(opt, {
			title : this.nls.pageSetupDialogTitle
		});
		this.dialog = dialog;
		if (typeof (item) != "undefined" && item != null) {
			this.file = item;
		}
		this.inherited(arguments);
	},

	renderQuestion : function(d, el, item, opt) {
		// community limitation
		this.dialog.dialogContent.style.cssText = "max-height: 380px;";	
		var div = d.createElement("div");
		//dojo.attr(div, "class", "lotusFormField");
		el.appendChild(div);		
		this._createContent(div);
	},

	onSuccess : function() {
		//window.open(concord.global.getDocViewURL(this.file.getId(), "pdf"), "_blank", "");		
		this.storeCurrentValue();
		var parameters="";
		if(this.docTypeCur === this.docTypeSheet)
		{
			//page parameter is for 'PrintDownFirst' - Symphony API 
			var IS_TOP_TO_BOTTOM_ORDER = !this.IS_LEFT_TO_RIGHT_ORDER;
			parameters= "&page="+IS_TOP_TO_BOTTOM_ORDER+
				        "&header="+this.cur_value[8]+
						"&footer="+this.cur_value[9]+
						"&gridline="+this.cur_value[10]+
						this.getCommonParameters()+
						"&UseTaggedPDF="+this.cur_value[13];
		}
		else if(this.docTypeCur === this.docTypeText)
		{
			parameters= "&header="+this.cur_value[8]+
						"&footer="+this.cur_value[9]+
						this.getCommonParameters()+ 
						"&HH="+this.getScalingMarginValue(this.cur_value[11])+
						"&FH="+this.getScalingMarginValue(this.cur_value[12])+
						"&UseTaggedPDF="+this.cur_value[13];
		}
		else
		{
			parameters= this.getCommonParameters()+"&UseTaggedPDF="+this.cur_value[13];			
		}	
						
		var url = concord.global.getDocViewURL(this.file.getId(),"pdf");
		if(this.isInitialsChanged()) {
			url += parameters;
		}
		window.open(url, "_blank", "");
		//console.log("pdf parameters is: " + parameters);
	},
	getScalingMarginValue: function(value){
		var factor = this.metric ? 1000 : 2540; 
		if(!this.metric){
			//for 0.79" ,return 2.00 * 1000 instead of 0.79*2.45 *1000	
			if(value == 0.79){
				return 2000;
			}
		}
		return Math.floor(value * factor);
	},
	
	getScalingValue: function(value,isWidth){
		if(this.metric){
			return value * 1000;
		}else{	
			var index = this.getIndex(dojo.byId(this.comboBoxId).value);
			if(index >=0 && index < this.SIZE_COUNT)
			{
				if(index!= 12 &&this.CURRENT_MODE==this.PORTRAIT_MODE)
				{
					var temp = isWidth ? this.widthCMData[index] : this.heightCMData[index]; 
					return temp * 1000;
				}
				else if(index!= 12 &&this.CURRENT_MODE==this.LANDSCAPE_MODE)
				{	
					var temp = isWidth ? this.heightCMData[index] : this.widthCMData[index]; 
					return temp * 1000;	
				}					
			}
			return Math.floor(value * 2540);			
		}	
	},
		
	getCommonParameters: function(){
		return "&top="+this.getScalingMarginValue(this.cur_value[2])+
				"&bottom="+this.getScalingMarginValue(this.cur_value[3])+
				"&left="+this.getScalingMarginValue(this.cur_value[4])+
				"&right="+this.getScalingMarginValue(this.cur_value[5])+
				"&height="+this.getScalingValue(this.cur_value[0])+
				"&width="+this.getScalingValue(this.cur_value[1],true)					
	},

 	//Below funtion is to convert cm array to inch array
	_cmToInchArray: function (cmArray){
		var inArray = new Array();
		for(var index =0; index <cmArray.length; index++){
			inArray.push(this._cmToFormatInch(cmArray[index]));	
		}
		return inArray;	 
	},
	
	_cmToFormatInch:  function(num)
	{
		var ret = num;
		if(ret == "User")
		{
			return ret;
		}else{
			ret = num/2.54;
		}	
		ret = dojo.number.format(ret,{ pattern: "#.00",locale : dojo.locale}) ;
		return ret;
	},
		
	destroyRecursive : function()
	{
		try{
			for(var i=0; i<this.connectArray.length; i++){
				dojo.disconnect(this.connectArray[i]);			
			}	
			if(this.sizeCombox){
				this.sizeCombox.destroyRecursive();
			}
			dojo.destroy(this.tableId);	
		}catch (e) {
		}		
	}
});
