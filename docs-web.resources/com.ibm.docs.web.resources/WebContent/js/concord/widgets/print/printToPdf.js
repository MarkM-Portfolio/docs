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

dojo.provide("concord.widgets.print.printToPdf");
dojo.require("concord.util.unit");
dojo.require("concord.util.BidiUtils");
dojo.require("dijit.form.ComboBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.CheckBox");
dojo.requireLocalization("concord.widgets.print","printToPdf");

dojo.declare("concord.widgets.print.printToPdf", [concord.widgets.concordDialog], {
	sizeNamesArray: null,
	sizeHeightArray: null,
	sizeWidthArray:null,
	widthCMData:null,
	heightCMData:null,
	defaultMargin:null,
	
	PORTRAIT_MODE: true,
	LANDSCAPE_MODE: false,
	CURRENT_MODE: true,
	metric: true,
	unit: null,
	allowedUnit: null,
	
	SIZE_COUNT: 27,
	SIZE_USER: 12,
	sizeList: null,
	nls: null,
	
	tooltip_id:null,
	locale:null,
	cur_value:new Array(),
	orig_value:new Array(),
	settings: null,
	initiated: false,
	isArabic: false,
	
	constructor: function() 
	{
	},
	
	setDialogID: function() {
		// Overridden
		this.dialogId="printToPdf";
		this.portraitRadioID="printToPdfPortrait";
		this.landscapeRadioID="printToPdfLandscape";
		this.sizeComboxID="printToPdfSize";
		this.heightFieldID="printToPdfHeight";
		this.widthFieldID="printToPdfWidth";
		this.topFieldID="printToPdfTop";
		this.bottomFieldID="printToPdfBottom";
		this.leftFieldID="printToPdfLeft";
		this.rightFieldID="printToPdfight";
		return;
	},
	
	calcWidth: function()
	{
		return "46em";
	},
	
	loadLocalArrays: function()
	{
		this.sizeNamesArray = new Array("A3","A4","A5","B4 (ISO)","B5 (ISO)",
										"B6 (ISO)","B4 (JIS)","B5 (JIS)","B6 (JIS)",
										this.nls.LETTER,this.nls.LEGAL,this.nls.TABLOID,this.nls.USER
										,"C4","C5","C6","C6/5","DL",this.nls.SIZE1,this.nls.SIZE2,
										this.nls.SIZE3,this.nls.SIZE4,this.nls.SIZE5,this.nls.SIZE6,
										this.nls.SIZE7,this.nls.SIZE8,this.nls.SIZE9);
												
		this.widthCMData = new Array("29.70","21.00","14.80","25.00","17.60",
										"12.50","25.70","18.20","12.80","21.59",
										"21.59","27.96","User","22.90","16.20",
										"11.40","11.40","11.00","9.21","9.84",
										"9.84","10.48","11.43","12.07","18.40",
										"13.00","14.00");
		this.heightCMData = new Array("42.00","29.70","21.00","35.30",
										"25.00","17.60","36.40","25.70",
										"18.20","27.94","35.57","43.13",
										"User","32.40","22.90","16.20",
										"22.70","22.00","16.51","19.05",
										"22.54","24.13","26.35","27.94",
										"26.00","18.40","20.30");
										
		if(this.metric){
			this.sizeWidthArray = this.widthCMData;
			this.sizeHeightArray = this.heightCMData;
			this.defaultMargin = this.formatNumber("2.00");
		}else{
			this.sizeWidthArray = this._cmToInchArray(this.widthCMData);	
			this.sizeHeightArray = this._cmToInchArray(this.heightCMData);										
			this.defaultMargin = this.formatNumber(concord.util.unit.CmToIn("2.00"));			
		}
		this.setLocale();
		
	},
	
	createContent: function (contentDiv)
	{
		this.settings = pe.scene.getPageSettings();
		if(this.settings && this.settings['hasSet']) {
			this.initiated = true;
		}
		this.nls = dojo.i18n.getLocalization("concord.widgets.print","printToPdf");
		/*Initialize unit and allowedUnit */
		this.metric = concord.util.unit.isMeticUnit();
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
		this.loadLocalArrays();
		/*create layout table*/
		this.layoutTable = dojo.create('table', null, contentDiv);
		dijit.setWaiRole(this.layoutTable,'presentation');
		this.layoutTbody = dojo.create('tbody', null, this.layoutTable);
		this.all=dojo.create('tr', null, this.layoutTbody);
		this.leftTD=dojo.create('td', null, this.all);
		this.rightTD=dojo.create('td', null, this.all);
		this.left = dojo.create('div', null, this.leftTD);
		this.right = dojo.create('div', null, this.rightTD);

		this.layoutTR0TD2 = dojo.create('div', null, this.right);
		this.layoutTR1TD1 = dojo.create('fieldset', null, this.left);
		this.layoutTR1TD2 = dojo.create('div', null, this.right);
		this.layoutTR2TD1 = dojo.create('div', null, this.left);
		this.layoutTR2TD2 = dojo.create('div', null, this.right);
		this.layoutTR3TD1 = dojo.create('div', null, this.left);
		this.layoutTR3TD2 = dojo.create('div', null, this.right);
		this.layoutTR4TD1 = dojo.create('div', null, this.left);
		this.layoutTR4TD2 = dojo.create('div', null, this.right);
		this.layoutTR5TD1 = dojo.create('div', null, this.left);
		this.layoutTR5TD2 = dojo.create('div', null, this.right);

		dojo.addClass(this.layoutTR0TD2,"sigleDiv");
		dojo.addClass(this.layoutTR1TD1,"sigleDiv");
		dojo.addClass(this.layoutTR1TD2,"sigleDiv");
		dojo.addClass(this.layoutTR2TD1,"sigleDiv");
		dojo.addClass(this.layoutTR2TD2,"sigleDiv");
		dojo.addClass(this.layoutTR3TD1,"sigleDiv");
		dojo.addClass(this.layoutTR3TD2,"sigleDiv");
		dojo.addClass(this.layoutTR4TD1,"sigleDiv");
		dojo.addClass(this.layoutTR4TD2,"sigleDiv");
		dojo.addClass(this.layoutTR5TD1,"sigleDiv");
		dojo.addClass(this.layoutTR5TD2,"sigleDiv");

		dojo.addClass(this.layoutTable,"printSpreadsheetTable");
		dojo.addClass(this.leftTD,"leftDiv");
		dojo.addClass(this.rightTD,"rightDiv");
		/* Orientation Div*/
		this.CURRENT_MODE = this.isDefaultPortrait();
		this.layoutTR0TD1 = dojo.create('legend', null, this.layoutTR1TD1);
		dojo.addClass(this.layoutTR0TD1,"sigleDiv");
		var orientationLabel=this.createDivLabel(this.layoutTR0TD1, this.nls.ORIENTATION_LABEL, "printSpreadSheetDivLabel");
		this.layoutTR1TD1Div = dojo.create('div', null, this.layoutTR1TD1);
		dojo.addClass(this.layoutTR1TD1Div,"sigleDiv");
		var radio2=this.createInputWithType(this.layoutTR1TD1Div, 'Orientation', this.portraitRadioID, 'radio', this.PORTRAIT_MODE,this.CURRENT_MODE);
		var label2 = this.createDivLabel(this.layoutTR1TD1Div,this.nls.PORTRAIT, "portraitlabel");		
		var radioNode = dojo.byId(this.portraitRadioID);
		dijit.setWaiState(radioNode,'label',this.nls.ORIENTATION_LABEL +' '+ this.nls.PORTRAIT);

		var radio1=this.createInputWithType(this.layoutTR1TD1Div, 'Orientation', this.landscapeRadioID, 'radio', this.LANDSCAPE_MODE,!this.CURRENT_MODE);
		var label1 = this.createDivLabel(this.layoutTR1TD1Div,this.nls.LANDSCAPE, "landscapebel");		
		radioNode = dojo.byId(this.landscapeRadioID);
		dijit.setWaiState(radioNode,'label',this.nls.ORIENTATION_LABEL +' '+ this.nls.LANDSCAPE);

		dojo.connect(radio1, 'onclick', dojo.hitch(this, "changeOrientationMode", this.LANDSCAPE_MODE));
		dojo.connect(radio2, 'onclick', dojo.hitch(this, "changeOrientationMode", this.PORTRAIT_MODE));
		
		/* Paper format Div*/
		var paperFormatLabel=this.createDivLabel(this.layoutTR2TD1, this.nls.PAPER_FORMAT_LABEL, "printSpreadSheetDivLabel");
		var sizeLabel=this.createDivLabel(this.layoutTR3TD1, this.nls.PAPER_SIZE_LABEL, "printSpreadsheetLabel");
		//dojo.attr(sizeLabel,'for',this.sizeComboxID);
		if (BidiUtils.isGuiRtl()) {
			for(var i = 0; i < this.sizeNamesArray.length; i++) {
				this.sizeNamesArray[i] = BidiUtils.LRE + this.sizeNamesArray[i];
			}
		}
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
         var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
         var sizeCombox= new dijit.form.ComboBox({
             id: this.sizeComboxID,
             name: "fontname",
             value: this.sizeNamesArray[1],
             store: nameStore,
             style:"width:100px;height:20px",
             searchAttr: "name",
             dir: dirAttr
         });
        //cause the class dijitArrowButton would make the combobox not display
        dojo.removeClass(sizeCombox.domNode.firstChild, "dijitArrowButton");
        dojo.connect(sizeCombox, 'onChange', dojo.hitch(this, "changeStatus"));
        this.layoutTR3TD1.appendChild(sizeCombox.domNode);
        var fontNameInput=dojo.byId(this.sizeComboxID);
        dojo.style(fontNameInput, {
			"fontSize":"10pt"
		});
		var outerCombo=dojo.byId("widget_"+ this.sizeComboxID);
		dojo.style(outerCombo,{"border":"1px solid grey"});
		dojo.query('.dijitButtonNode',sizeCombox.domNode).forEach(function(node,index,array){
			dojo.style(node,{
				"padding":"0px"
			});
		});
		dijit.setWaiState(sizeCombox.focusNode, 'label',this.nls.PAPER_FORMAT_LABEL +' '+ this.nls.PAPER_SIZE_LABEL);
		
		/*width & height*/
		var pageWidth = this.getDefaultWidth();
		var pageHeight = this.getDefaultHeight(); // setDefaultPaperSize will switch the w/h if in landscape mode
		var heightLabel=this.createDivLabel(this.layoutTR4TD1, this.nls.HEIGHT, "printSpreadsheetLabel");
		var heightTextField=this.createInputWithType(this.layoutTR4TD1, 'heighttext', this.heightFieldID, 'text', pageHeight,null);
		var node = dojo.byId(this.heightFieldID);
		dijit.setWaiState(node, 'label',this.nls.PAPER_FORMAT_LABEL +' '+ (this.metric ? this.nls.HEIGHT_DESC : this.nls.HEIGHT_DESC2));
		
		//this.createCMLabel(this.layoutTR4TD1, this.heightFieldID);
		var widthLabel=this.createDivLabel(this.layoutTR5TD1, this.nls.WIDTH, "printSpreadsheetLabel");
		var widthTextField=this.createInputWithType(this.layoutTR5TD1, 'widthtext', this.widthFieldID, 'text', pageWidth,null);
		//this.createCMLabel(this.layoutTR5TD1, this.widthFieldID);
		node = dojo.byId(this.widthFieldID);
		dijit.setWaiState(node, 'label',this.nls.PAPER_FORMAT_LABEL +' '+ (this.metric ? this.nls.WIDTH_DESC : this.nls.WIDTH_DESC2));
		dojo.connect(widthTextField, 'onchange', dojo.hitch(this, "checkValue",this.widthFieldID));
		dojo.connect(heightTextField, 'onchange', dojo.hitch(this, "checkValue",this.heightFieldID));
		
		/*Margins Div*/
		var marginsLabel=this.createDivLabel(this.layoutTR0TD2, this.nls.MARGINS_LABEL, "printSpreadSheetDivLabel");
		/*margin top */
		var topLabel=this.createDivLabel(this.layoutTR1TD2, this.nls.TOP, "printSpreadsheetLabel");
		var topTextField=this.createInputWithType(this.layoutTR1TD2, 'toptext', this.topFieldID, 'text', this.getDefaultMarginT(),null);
		//this.createCMLabel(this.layoutTR1TD2, this.topFieldID);
		node = dojo.byId(this.topFieldID);
		dijit.setWaiState(node, 'label', (this.metric ? this.nls.TOP_DESC : this.nls.TOP_DESC2));		
		/*margin bottom*/
		var bottomLabel=this.createDivLabel(this.layoutTR2TD2, this.nls.BOTTOM, "printSpreadsheetLabel");
		var bottomTextField=this.createInputWithType(this.layoutTR2TD2, 'bottomtext', this.bottomFieldID, 'text', this.getDefaultMarginB(),null);
		//this.createCMLabel(this.layoutTR2TD2, this.bottomFieldID);
		node = dojo.byId(this.bottomFieldID);
		dijit.setWaiState(node, 'label',(this.metric ? this.nls.BOTTOM_DESC : this.nls.BOTTOM_DESC2));			
		/*margin left*/
		var leftLabel=this.createDivLabel(this.layoutTR3TD2, this.nls.LEFT, "printSpreadsheetLabel");
		var leftTextField=this.createInputWithType(this.layoutTR3TD2, 'lefttext', this.leftFieldID, 'text', this.getDefaultMarginL(),null);
		//this.createCMLabel(this.layoutTR3TD2, this.leftFieldID);
		node = dojo.byId(this.leftFieldID);
		dijit.setWaiState(node, 'label',(this.metric ? this.nls.LEFT_DESC : this.nls.LEFT_DESC2));			
		/* margin right*/
		var rightLabel=this.createDivLabel(this.layoutTR4TD2, this.nls.RIGHT, "printSpreadsheetLabel");
		var rightTextField=this.createInputWithType(this.layoutTR4TD2, 'righttext', this.rightFieldID, 'text', this.getDefaultMarginR(),null);
		//this.createCMLabel(this.layoutTR4TD2, this.rightFieldID);
		node = dojo.byId(this.rightFieldID);
		dijit.setWaiState(node, 'label',(this.metric ? this.nls.RIGHT_DESC : this.nls.RIGHT_DESC2));			
		dojo.connect(topTextField, 'onchange', dojo.hitch(this, "checkValue",this.topFieldID));
		dojo.connect(bottomTextField,'onchange', dojo.hitch(this, "checkValue",this.bottomFieldID));
		dojo.connect(leftTextField, 'onchange', dojo.hitch(this, "checkValue",this.leftFieldID));
		dojo.connect(rightTextField, 'onchange', dojo.hitch(this, "checkValue",this.rightFieldID));

		this.setDefaultPaperSize(this.locale);
	},
	
//	createCMLabel: function(parentNode,forNodeId)
//	{
//		var temp=dojo.create('span',null,parentNode);
//		temp.appendChild(dojo.doc.createTextNode(this.metric ? this.nls.CM_LABEL : this.nls.INUNIT_LABEL));
//		dojo.addClass(temp,"printSpreadSheetCMLabel");
//	},
	
	createDivLabel: function(parentNode,textValue,cssName)
	{
		var temp=dojo.create('label',null,parentNode);
		temp.appendChild(dojo.doc.createTextNode(textValue));
		dojo.addClass(temp,cssName);
		return temp;
	},
	
	createNestLabel: function(parentNode,textValue,nestId,id)
	{
		var temp = dojo.create('label', null, parentNode);
		dojo.attr(temp, "for", nestId);
		temp.appendChild(dojo.doc.createTextNode(textValue));
		temp.id = id;
		return temp;
	},
	
	createInputWithType: function(parentNode,objname,objid,objtype,objvalue,objchecked)
	 {
		var ret = null;
		var attr ={name : objname, id : objid};
		if( objvalue )
			attr.value = objvalue;
		if( objchecked )
			attr.checked = objchecked;
		switch(objtype)
	 	{
	 	case 'radio':
	 		 ret = dijit.form.RadioButton(attr);	 		
	 		 break;
	 	case 'text':
	 		 ret = new dijit.form.TextBox(attr);	 		
	 		 break;
	 	case 'checkbox':
	 		 ret = new dijit.form.CheckBox(attr);	 		
	 		 break;
	 	defalut:
	 		 return null;
	 	}		
		parentNode.appendChild(ret.domNode);
		switch(objtype)
	 	{
	 	case 'radio':	 		
	 		 dojo.addClass(ret.domNode,"printSpreadsheetRadio");
	 		 break;
	 	case 'text':
	 		 if(dojo.isIE){
	 		 	dojo.addClass(ret.domNode,"printSpreadsheetText_ie");
	 		 }else{
	 		 	dojo.addClass(ret.domNode,"printSpreadsheetText");
	 		 } 		 
	 		 break;
	 	case 'checkbox':	 		 
	 		 dojo.addClass(ret.domNode,"printSpreadsheetSelect");
	 		 break;	 	
	 	}
	 	
	 	return ret.domNode;
	 },
	
	changeOrientationMode: function(mode)
	{
		
		if(this.CURRENT_MODE != mode)
		{
			var objh=dojo.byId(this.heightFieldID);
			var objw=dojo.byId(this.widthFieldID);
			var temp=objh.value;
			objh.value=objw.value;
			objw.value=temp;
			this.checkValue(this.bottomFieldID);
			this.checkValue(this.rightFieldID);			
			this.CURRENT_MODE = mode;
			var portraitRadio = dojo.byId(this.portraitRadioID);
			var landscapeRadio = dojo.byId(this.landscapeRadioID);
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
		var h=concord.util.unit.parseValue((dojo.byId(this.heightFieldID).value), this.allowedUnit);
		var w=concord.util.unit.parseValue((dojo.byId(this.widthFieldID).value), this.allowedUnit);
		var t=concord.util.unit.parseValue((dojo.byId(this.topFieldID).value), this.allowedUnit);
		var b=concord.util.unit.parseValue((dojo.byId(this.bottomFieldID).value), this.allowedUnit);
		var l=concord.util.unit.parseValue((dojo.byId(this.leftFieldID).value), this.allowedUnit);
		var r=concord.util.unit.parseValue((dojo.byId(this.rightFieldID).value), this.allowedUnit);
		var obj=dojo.byId(id);
		var v=concord.util.unit.parseValue(obj.value, this.allowedUnit);
		var temp=v;
		var outScope = false;
		var maxLimit = 300.00;
		var dv1 = 2;
		var dv2 = 0.5;
		if(!this.metric){
			maxLimit = concord.util.unit.CmToIn(maxLimit);
			dv1 = concord.util.unit.CmToIn(dv1);
			dv2 = concord.util.unit.CmToIn(dv2);
		}
		switch(id)
		{
			case this.heightFieldID:
				if(h>maxLimit){
					temp=maxLimit;
					outScope = true;
				} 
				if(temp<t+b+dv1){
					temp=t+b+dv1;
					outScope = true;					
				} 
				break;
			case this.widthFieldID:
				if(w>maxLimit){
					temp=maxLimit;
					outScope = true;
				}
				if(temp<l+r+dv2){
					temp=l+r+dv2;
					outScope = true;
				}				
				break;
			case this.topFieldID://top
			
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
					this.checkScope(this.bottomFieldID);
				}
				break;
			case this.bottomFieldID://bottom
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
					this.checkScope(this.topFieldID);
				}				
				break;
			case this.leftFieldID://left
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
					this.checkScope(this.rightFieldID);
				}				
				break;
			case this.rightFieldID://right
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
					this.checkScope(this.leftFieldID);
				}				
				break;
			default:
				break;
		}
		if(outScope)
			this.setWarningMsg(this.nls.INVALID_MSG);		 
		obj.value=this.formatNumber(temp);
		setTimeout(dojo.hitch(this, function(){
 			this.setWarningMsg('');
		}), 5000);
	},
	setWarningMsg: function(msg) {
		// unique warning message ID in concord system
		var msgId = this.warnMsgID + this.dialogId;
		var msgDiv = dojo.byId(msgId);
		if (msgDiv)
		{
			msgDiv.style.cssText = "width:40em;word-wrap:break-word";
		}
		
		this.inherited( arguments );
	},	
	getPreValue: function(id)
	{
		switch(id)
		{
			case this.heightFieldID:
				return this.cur_value[0];
			case this.widthFieldID:
				return this.cur_value[1];
			case this.topFieldID:
				return this.cur_value[2];
			case this.bottomFieldID:
				return this.cur_value[3];
			case this.leftFieldID:
				return this.cur_value[4];
			case this.rightFieldID:
				return this.cur_value[5];
		}
	},
	
	checkValue: function(id)
	{
		var obj=dojo.byId(id);
		if(!this.checkInput(id))
		{
			this.setWarningMsg(this.nls.INVALID_MSG);
			obj.value=this.formatNumber(this.getPreValue(id));
			setTimeout(dojo.hitch(this, function(){
 				this.setWarningMsg('');
			}), 5000);			
		}
		else
		{
			this.checkScope(id);
		}
		if(id==this.widthFieldID ||id==this.heightFieldID)
		{	
			var h=concord.util.unit.parseValue((dojo.byId(this.heightFieldID).value), this.allowedUnit);			
			var w=concord.util.unit.parseValue((dojo.byId(this.widthFieldID).value), this.allowedUnit);
			var index=-1;
			var combox=dijit.byId(this.sizeComboxID);
			for (i=0;i<this.SIZE_COUNT;i++) 
			{ 
				if(h==this.sizeHeightArray[i]&&w==this.sizeWidthArray[i])
				{
					index=i;
					combox.setValue(this.sizeNamesArray[i]);
					var landscapeRadio = dojo.byId(this.landscapeRadioID);
					landscapeRadio.checked = false;
					var portraitRadio = dojo.byId(this.portraitRadioID);
					portraitRadio.checked = true;
					this.CURRENT_MODE=this.PORTRAIT_MODE;
					break;
				}
				else if(w==this.sizeHeightArray[i]&&h==this.sizeWidthArray[i])
				{
					index=i;
					combox.setValue(this.sizeNamesArray[i]);
					var landscapeRadio = dojo.byId(this.landscapeRadioID);
					landscapeRadio.checked = true;
					var portraitRadio = dojo.byId(this.portraitRadioID);
					portraitRadio.checked = false;
					this.CURRENT_MODE=this.LANDSCAPE_MODE;
					break;
				}
			} 
			if(index==-1)
			{
				combox.setValue(this.sizeNamesArray[this.SIZE_USER]);
			}
		}			
	},
	
	checkInput: function(id) 
	{ 		
		var value = concord.util.unit.parseValue(dojo.byId(id).value, this.allowedUnit);
		if( isNaN(value) || value < 0){
			return false;
		}else{		
			return true;
		}
	} ,
	
	onOk: function (editor)
	{		
	},
	
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
		this.cur_value[0]=concord.util.unit.parseValue(dojo.byId(this.heightFieldID).value, this.allowedUnit);
		this.cur_value[1]=concord.util.unit.parseValue(dojo.byId(this.widthFieldID).value, this.allowedUnit); 
		this.cur_value[2]=concord.util.unit.parseValue(dojo.byId(this.topFieldID).value, this.allowedUnit);
		this.cur_value[3]=concord.util.unit.parseValue(dojo.byId(this.bottomFieldID).value, this.allowedUnit);
		this.cur_value[4]=concord.util.unit.parseValue(dojo.byId(this.leftFieldID).value, this.allowedUnit);
		this.cur_value[5]=concord.util.unit.parseValue(dojo.byId(this.rightFieldID).value, this.allowedUnit);
		this.cur_value[6]=dojo.byId(this.landscapeRadioID).checked;
		this.cur_value[7]=dojo.byId(this.portraitRadioID).checked;
		this.cur_value[8]=this.getIndex(dojo.byId(this.sizeComboxID).value);
		this.cur_value[9]=this.CURRENT_MODE;
	},
	
	setPreValue: function()
	{
		dojo.byId(this.heightFieldID).value=this.formatNumber(this.cur_value[0]);
		dojo.byId(this.widthFieldID).value=this.formatNumber(this.cur_value[1]);;
		dojo.byId(this.topFieldID).value=this.formatNumber(this.cur_value[2]);;
		dojo.byId(this.bottomFieldID).value=this.formatNumber(this.cur_value[3]);;
		dojo.byId(this.leftFieldID).value=this.formatNumber(this.cur_value[4]); ;
		dojo.byId(this.rightFieldID).value=this.formatNumber(this.cur_value[5]);;
		dojo.byId(this.landscapeRadioID).checked=this.cur_value[6];
		dojo.byId(this.portraitRadioID).checked=this.cur_value[7];
		var combBox = dijit.byId(this.sizeComboxID);
		if(combBox)
			combBox.setValue(this.sizeNamesArray[this.cur_value[8]]); 
		this.CURRENT_MODE=this.cur_value[9];
	},
	
	formatNumber: function(num, noUnit)
	{
		var ret=num;
		if(typeof(ret)=="string")
		{
/* dojo.number.format returns UCC ARABIC DECIMAL SEPARATOR instead of comma
when local is Arabic but fails to format number containing this character */
			ret = this.isArabic ? num.replace(/,|\u066B/,".") : num.replace(",",".");
		}	
		ret=dojo.number.format(ret,{ pattern: "#.00",locale: this.locale }) ;
		if(!noUnit)
			ret +=" "+ this.unit;
		return ret;
	},
	
	reset: function()
	{
		var ori_locale=this.locale;
		this.setLocale();
		this.setPreValue();
		if(ori_locale!=this.locale)
		{
			this.setDefaultPaperSize(this.locale);
			dojo.byId(this.topFieldID).value=this.formatNumber(2);
			dojo.byId(this.bottomFieldID).value=this.formatNumber(2); 
			dojo.byId(this.leftFieldID).value=this.formatNumber(2);
			dojo.byId(this.rightFieldID).value=this.formatNumber(2);
		}
	},
	
	onCancel: function (editor)
	{
		this.setPreValue();
		return true;
	},
	
	setLocale: function()
	{
		this.locale=g_locale;
		this.isArabic = g_locale.substr(0,2) == 'ar';
		for(var i=0;i<this.SIZE_COUNT;i++)
		{
			if(i!=this.SIZE_USER)
			{
				this.sizeWidthArray[i]=this.formatNumber(this.sizeWidthArray[i], true);;
				this.sizeHeightArray[i]=this.formatNumber(this.sizeHeightArray[i], true);;
			}
		}	
	},
	
	setDefaultPaperSize: function(locale)
	{
		var i=this.getDefaultSizeIndex(locale);
		
		var comboBox = dijit.byId(this.sizeComboxID);
		if(comboBox)
		{
			comboBox.setValue(this.sizeNamesArray[i]);													
		}
		this.changeStatus();			
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
	
	changeStatus:function()
	{
		var index = this.getIndex(dojo.byId(this.sizeComboxID).value);
		if(index==-1)
		{
			this.setWarningMsg(this.nls.INVALID_MSG);
			this.checkValue(this.widthFieldID);
			setTimeout(dojo.hitch(this, function(){
				this.setWarningMsg('');
			}), 5000);	        	        	
			return;
		}
		var width=dojo.byId(this.widthFieldID);
		var height=dojo.byId(this.heightFieldID);
		if(index >=0 && index < this.SIZE_COUNT)
		{
			if(index!=this.SIZE_USER&&this.CURRENT_MODE==this.PORTRAIT_MODE)
			{
				width.value=this.formatNumber(this.sizeWidthArray[index]);
				height.value=this.formatNumber(this.sizeHeightArray[index]);
			}
			else if(index!=this.SIZE_USER&&this.CURRENT_MODE==this.LANDSCAPE_MODE)
			{		
				height.value=this.formatNumber(this.sizeWidthArray[index]);
				width.value=this.formatNumber(this.sizeHeightArray[index]);
			}
			this.checkValue(this.bottomFieldID);
			this.checkValue(this.rightFieldID);
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
		return true;
	},
	
	getDefaultMarginL: function() {
		if(this.settings) {
			if(this.settings.marginLeft != null) {
				var value = this.metric ? this.settings.marginLeft : concord.util.unit.CmToIn(this.settings.marginLeft);
				return this.formatNumber(value);
			}
		}
		return this.defaultMargin;
	},
	
	getDefaultMarginR: function() {
		if(this.settings) {
			if(this.settings.marginRight != null) {
				var value = this.metric ? this.settings.marginRight : concord.util.unit.CmToIn(this.settings.marginRight);
				return this.formatNumber(value);				
			}
		}
		return this.defaultMargin;
	},
	
	getDefaultMarginT: function() {
		if(this.settings) {
			if(this.settings.marginTop != null) {
				var value = this.metric ? this.settings.marginTop : concord.util.unit.CmToIn(this.settings.marginTop);
				return this.formatNumber(value);
			}
		}
		return this.defaultMargin;
	},
	
	getDefaultMarginB: function() {
		if(this.settings) {
			if(this.settings.marginBottom != null) {
				var value = this.metric ? this.settings.marginBottom : concord.util.unit.CmToIn(this.settings.marginBottom);
				return this.formatNumber(value);
			}
		}
		return this.defaultMargin;
	},
	
	getDefaultHeight: function() {
		if(this.settings && this.settings.pageHeight) {		
			var value = this.metric ? this.settings.pageHeight : concord.util.unit.CmToIn(this.settings.pageHeight);				
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
			var value = this.metric ? this.settings.pageWidth : concord.util.unit.CmToIn(this.settings.pageWidth);			
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
	
	getDefaultTaggedPDF: function()
	{
		if(this.settings) {
			if(this.settings.UseTaggedPDF == 'true')
				return true;
		}
		return false;
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
			var index = this.getIndex(dojo.byId(this.sizeComboxID).value);
			if(index >=0 && index < this.SIZE_COUNT)
			{
				if(index!=this.SIZE_USER&&this.CURRENT_MODE==this.PORTRAIT_MODE)
				{
					var temp = isWidth ? this.widthCMData[index] : this.heightCMData[index]; 
					return temp * 1000;
				}
				else if(index!=this.SIZE_USER&&this.CURRENT_MODE==this.LANDSCAPE_MODE)
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
				"&width="+this.getScalingValue(this.cur_value[1],true);					
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
		ret = dojo.number.format(ret,{ pattern: "#.00",locale : g_locale}) ;
		return ret;
	}
});
