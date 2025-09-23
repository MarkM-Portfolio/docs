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
dojo.provide("concord.widgets.presContentBoxPropDlg");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.util.presTools");
dojo.requireLocalization("concord.widgets","presPropertyDlg");
dojo.require("concord.util.BidiUtils");
dojo.declare("concord.widgets.presContentBoxPropDlg", [concord.widgets.concordDialog], {
	nls:null,	
	cb:null,
	origHeight:null,
	widthInput:null,	
	heightInput:null,
	currentWidth:null,
	currentHeight:null,
	currentDirIndx:null,
	currentImage:null,
	altText:null,
	widthValid:true,
	heightValid:true,
			
	constructor: function(cb) {	
		var title = this.concordTitle;
		
		if (cb.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) title = this.nls.notesTitle;
		if (cb.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE) title = this.nls.tableTitle;
		if (cb.contentBoxType == PresConstants.CONTENTBOX_TEXT_TYPE) title = this.nls.textboxTitle;
		
		this.dialog.attr("title", title);	
		this.cb = cb;
		this.origHeight = parseFloat(this.cb.mainNode.style.height);
	},
	
	createContent: function (contentDiv) {
		this.isBidi = BidiUtils.isBidiOn();
		this.nls = dojo.i18n.getLocalization("concord.widgets","presPropertyDlg");
		if(!this.unit){
			this.unit = PresTools.isMetricUnit() ? this.nls.cmUnit : this.nls.inUnit;			
		}
		
		var headerTable = dojo.create('table', null, contentDiv);
		dijit.setWaiRole(headerTable,'presentation');
		var headerTbody	= dojo.create('tbody', null, headerTable);
		
		if (this.editor.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) {
			this.createSpeakerNotesContent(headerTbody);
		} else {
			this.createTextBoxContent(headerTbody);
			if (this.isBidi && (this.editor.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE))		
				this.createBidiContent(headerTbody);
		}
	},	
	createBidiContent:function(headerTbody) {
		this.bidiDirArr =[{label:this.nls.bidiDirLTR, value: 'ltr', indx: 0},
						  {label:this.nls.bidiDirRTL, value: 'rtl', indx: 1}];		

		var tr = dojo.create('tr', null, headerTbody);
		var td = dojo.create('td', null, tr);
		dojo.style(td, 'paddingBottom', '10px');
		var labelDirectionText = dojo.create('label', null, td);
		labelDirectionText.appendChild(document.createTextNode(this.nls.bidiDirTitle));
		dojo.attr(labelDirectionText,'for',this.inputBidiDirID);
		td = dojo.create('td', null, tr);
		dojo.attr(td,{style:'width:40pt;'});
		var selectBidiDirDiv = dojo.create('div', null, td);
		dojo.attr(selectBidiDirDiv,{style:'width:100pt; margin: 5px;'});
		this.createBidiDirSelector(selectBidiDirDiv);
	},
	createBidiDirSelector: function(container){
		var options = new Array();
		for (var i=0; i<this.bidiDirArr.length; i++) {
			options.push({
				label: this.bidiDirArr[i].label,
				value: this.bidiDirArr[i].value,
				indx: i
			});
		}
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		var actBidiDirSelect = new dijit.form.Select({
            name: 'bidi dir selector',
            id: this.inputBidiDirID,
            options: options,
            dir: dirAttr,
            style: {'width': '100pt'}
	    });
	    if(BidiUtils.isGuiRtl())
			BidiUtils.mirrorSelect(actBidiDirSelect);

	    this.actBidiDirSelect = actBidiDirSelect;
	    dojo.connect(actBidiDirSelect.dropDown,"onItemClick",this,"onBidiDirSelected");
        container.appendChild(actBidiDirSelect.domNode);
	},
	
	onBidiDirSelected:function(item, evt){ 
		this.currentDirIndx = item.option.indx; 
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
		labelWidthText.appendChild(document.createTextNode(this.nls.width));
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
		labelHeightText.appendChild( document.createTextNode(this.nls.height));
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
	
	createSpeakerNotesContent:function(headerTbody) {
		
		// Speaker notes width label and dropdown
		var headerTR0 = dojo.create('tr', null, headerTbody);
		var headerTR0TD1 = dojo.create('td', null, headerTR0);
		var headerTR1 = dojo.create('tr', null, headerTbody);
		var headerTR1TD1 = dojo.create('td', null, headerTR1);

		var notesHeightLabel = dojo.create('label', {id: this.heightLabelId}, headerTR0TD1);
		notesHeightLabel.appendChild(document.createTextNode(this.nls.height));
		dojo.attr(notesHeightLabel,'for',this.heightRowId);
		var align = BidiUtils.isGuiRtl() ? 'right' : 'left';	
		this.notesHeightSelect = new dijit.form.Select({
            name: "notesHeight",
            id: ""+this.heightRowId+"",
            options: [
                { label: "<span style='display:inline-block;width:110pt;text-align:" + align + ";margin-left:6px;color:black;'>"+this.nls.notesNoChange+"</span>", value: "none" },
                { label: "<span style='display:inline-block;width:110pt;text-align:" + align + ";margin-left:6px;color:black;'>"+this.nls.notesMinimum+"</span>", value: "min" },
                { label: "<span style='display:inline-block;width:110pt;text-align:" + align + ";margin-left:6px;color:black;'>"+this.nls.notesNormal+"</span>", value: "normal" },
                { label: "<span style='display:inline-block;width:110pt;text-align:" + align + ";margin-left:6px;color:black;'>"+this.nls.notesMaximum+"</span>", value: "max" },
                { label: "<span style='display:inline-block;width:110pt;text-align:" + align + ";margin-left:6px;color:black;'>"+this.nls.notesHide+"</span>", value: "hide" }
            ]
		}).placeAt(headerTR1TD1);
		dijit.setWaiState(this.notesHeightSelect._buttonNode, 'labelledby', this.heightLabelId + " " + this.heightRowId);
		
		dojo.connect( this.notesHeightSelect, "onChange", dojo.hitch(this,this.checkHeightStyle));
		dojo.connect(this.notesHeightSelect.dropDown, "onOpen",dojo.hitch(this,this.modifyDefaultSelector, this.notesHeightSelect.dropDown));
	},
	
	modifyDefaultSelector:function ( selector ){
		if( !selector.domNode )
			return;
		dojo.query('.dijitMenuItem', selector.domNode).forEach(function(node, index, array){
			dojo.style( node, {'backgroundColor': '#FFFFFF'});
			dojo.connect(node, 'onmouseover', function() {
				dojo.style( node, {
					'backgroundColor': '#DFF1FF'
				});
			});
			dojo.connect(node, 'onmouseout', function() {
				dojo.style( node, {
					'backgroundColor' : '#FFFFFF'
				});
			});
			dojo.connect(node, 'onfocus', function() {
				dojo.style( node, {
					'backgroundColor': '#DFF1FF'
				});
			});
			dojo.connect(node, 'onblur', function() {
				dojo.style( node, {
					'backgroundColor' : '#FFFFFF'
				});
			});
		});
	},
		
	checkHeightStyle : function()
	{
		if (this.notesHeightSelect.value == "none") {
			this.notesHeightSelect.attr('value','none');
			this.currentHeight = this.origHeight;
		} else if (this.notesHeightSelect.value == "min") {
				this.notesHeightSelect.attr('value', 'min');
				this.currentHeight = '62';
		} else if (this.notesHeightSelect.value == "max") {
			this.notesHeightSelect.attr('value', 'max');
			this.currentHeight = this.notesPercentToPx(50, 'height');
		} else if (this.notesHeightSelect.value == "normal") {
				this.notesHeightSelect.attr('value', 'normal');
				this.currentHeight = this.notesPercentToPx(20, 'height');
		} else if (this.notesHeightSelect.value == "hide") {
			this.notesHeightSelect.attr('value', 'hide');
			this.currentHeight = this.notesPercentToPx(1, 'height');			
		}
	},
	
	//
	// This function returns the equivalent px given a % number
	//
	notesPercentToPx: function(pct){
		var pctValue = parseFloat(pct);
		value = this.cb.parentContainerNode.parentNode.offsetHeight;
		var result =  (pctValue * value)/100;
		return result;
	},


	show:function(){
		this.inherited(arguments);	
		this.currentWidth = dojo.style(this.cb.mainNode, 'width');
		this.currentHeight = dojo.style(this.cb.mainNode, 'height');
		
		if (this.cb.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) {		
			if (this.currentHeight == 62){
				this.notesHeightSelect.attr( 'value', 'min');
				this.notesHeightSelect.dropDown.value = this.nls.notesMinimum;
			} else if (this.currentHeight.toFixed(1) == this.notesPercentToPx(50, 'height')) {
				this.notesHeightSelect.attr( 'value', 'max');
				this.notesHeightSelect.dropDown.value = this.nls.notesMaximum;				
			} else if (this.currentHeight.toFixed(1) == this.notesPercentToPx(20, 'height')) {
				this.notesHeightSelect.attr( 'value', 'normal');
				this.notesHeightSelect.dropDown.value = this.nls.notesNormal;
			} else {
				this.notesHeightSelect.attr( 'value', 'none');
				this.notesHeightSelect.dropDown.value = this.nls.notesNoChange;				
			}

		} else {
			this.widthInput.setValue(this.formatLocalizedValue(this.currentWidth));
			this.heightInput.setValue(this.formatLocalizedValue(this.currentHeight));
			if (this.isBidi && (this.editor.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE)){
				if (this.cb.boxRep)
					this.currentDir = dojo.style(this.cb.boxRep.contentBoxDataNode, 'direction');
				else
					this.currentDir = dojo.style(this.cb.contentBoxDataNode, 'direction');
				this.currentDirIndx = this.isDefinedBidiDirStyle(this.currentDir);
				this.initBidiDir = this.selectedBidiDir;
				if (this.currentDirIndx != -1)
					this.actBidiDirSelect.set("value", this.bidiDirArr[this.currentDirIndx].value);
			}
		}
//		D30650 [Chrome][Regression] Failed to change properties of table again after change pros and insert column.		
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':'dialogs'}];
		concord.util.events.publish(concord.util.events.presentationFocus, eventData);
	},
	isDefinedBidiDirStyle:function(style){
		for (var i=0; i<this.bidiDirArr.length; i++) {
			if (style == this.bidiDirArr[i].value)
				return this.bidiDirArr[i].indx;
		}
		return -1;
	},

	reset:function(){
		if (this.widthInput) 
			this.widthInput.setValue(this.formatLocalizedValue(this.currentWidth));
		if (this.heightInput)
			this.heightInput.setValue(this.formatLocalizedValue(this.currentHeight));

	},
	
	setDialogID: function() {
		this.dialogId = "P_d_ContentBoxProp";
		this.widthRowId = "P_d_WidthRowContent";
		this.widthLabelId = "P_d_WidthRowLabel";
		this.heightRowId = "P_d_HeightRowContent";
		this.heightLabelId = "P_d_HeightRowLabel";
		this.inputWidthID = "P_d_ContentBoxPropWidth";
		this.inputHeightID = "P_d_ContentBoxPropHeight";
		this.widthErrorIconId = "P_d_ContentBoxWidthErrorIcon";
		this.heightErrorIconId = "P_d_ContentBoxHeightErrorIcon";
		this.inputBidiDirID = "P_d_ContentBoxPropBidiDir";
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
			this.setContentBoxInfo(this.currentWidth, this.currentHeight, this.altText);
			this.onHide();
			return true;
		}
		return false;
	},
	
	onCancel:function(){
		this.onHide();
		return true;
	},
	onHide: function(){
		if(pe.scene.focusMgr){
			pe.scene.focusMgr.publishSlideEditorInFocus();
		}
	},
	
	// method from imagePropDlg, and changed accordingly
	formatLocalizedValue : function(value)
	{
		if(isNaN(value))
			return 'NaN';
		var numberLocale = PresTools.toLocalizedValue(value+'px');
		return PresTools.formatNumber(numberLocale) + ' ' + this.unit;
	},
	
	widthChanged : function()
	{
		var allowedUnit = { 'cm':this.nls.cmUnit, 'mm':this.nls.mmUnit, 'in':this.nls.inUnit, 'pct':'%' };
		var w = PresTools.parseValue(this.widthInput.value, allowedUnit, true);
				
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
		var h = PresTools.parseValue(this.heightInput.value, allowedUnit, true);
		
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
	
	setContentBoxInfo : function(width, height, altText)
	{
		var acts=[];
		var actList=[];
		var contentBox = this.cb;
        
		if (contentBox.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
			//step1
			var actPair = [];
			var divId = contentBox.mainNode.id;
			var msg = SYNCMSG.createPresDelInsertElementAct(divId, "delete");
			if(msg){
				actPair.push(msg);
			}
		}
		
		//step2
		var updatePresRowHeight = Math.abs(this.oldHeight - height) > 1;
		var newWidth = contentBox.PxToPercent(width)+"%";
		var newHeight = contentBox.PxToPercent(height, 'height')+"%";
		var oldStyle = dojo.attr(contentBox.mainNode, 'style');
		if (contentBox.contentBoxType != PresConstants.CONTENTBOX_NOTES_TYPE) {
			dojo.style(contentBox.mainNode, 'width', newWidth);
			if (this.isBidi){
				var queryStr = ".smartTable[id*=\'"+ this.cb.contentBoxDataNode.id + "\']";
				dojo.query(queryStr).forEach(function(node, index, array){
					dojo.style(node, "direction",this.bidiDirArr[this.currentDirIndx].value);
					this.updateBidiClass (node, this.bidiDirArr[this.currentDirIndx].value);
				},this);
				if (contentBox.editor && contentBox.editor.document && contentBox.editor.document.$){
					var id = contentBox.contentBoxDataNode.id;
					if (contentBox.editor.document.$.body.id.indexOf(id) != -1) {
						dojo.style(contentBox.editor.document.$.body, 'direction', this.bidiDirArr[this.currentDirIndx].value);
						if (contentBox.editor.document.$.body.firstChild){
							dojo.style(contentBox.editor.document.$.body.firstChild, 'direction', this.bidiDirArr[this.currentDirIndx].value);
							this.updateBidiClass (contentBox.editor.document.$.body.firstChild, this.bidiDirArr[this.currentDirIndx].value);
						}
					}
				}
			}
		}
		
		//update draw frame height
		dojo.style(contentBox.mainNode, 'height', newHeight);
		
		if (contentBox.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) {
			// If notes value set to 1 percent then hide
			if (this.currentHeight == this.notesPercentToPx(1, 'height')) {
				var eventData = [{eventName: concord.util.events.presMenubarEvents_eventName_showHideSpeakerNotes}];
				concord.util.events.publish(concord.util.events.presMenubarEvents, eventData);	
            	var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_speakerNotesOptionOff}];
            	concord.util.events.publish(concord.util.events.slideEditorEvents, eventData);
			}
			contentBox.TM_move=true;
            contentBox.resizeFromPropertiesDlg(contentBox.PxToPercent(height, 'height'));                                                                   
		} else {
			if (contentBox.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE) {
				contentBox._update(true);
				var tableToUpdate = null;
				if(contentBox.isEditModeOn()){
					var ckBody = contentBox.editor.document.getBody().$;
					tableToUpdate = ckBody.firstChild;
					if(updatePresRowHeight){
						//update presrowheight for each row if table height really changed
						if(tableToUpdate){
							var slideEditorMainNode = pe.scene.slideEditor.mainNode;
							var slideEditorHeightinPX = dojo.isIE ? slideEditorMainNode.offsetHeight: dojo.style(slideEditorMainNode, 'height');
							dojo.query('tr', tableToUpdate).forEach(function(tr){
								var trH = dojo.isIE? tr.offsetHeight : dojo.style(tr, "height");
								dojo.attr(tr, {
									'presrowheight': trH * 1000 / slideEditorHeightinPX
								});
							});
						}
					}
				}else{
					tableToUpdate = contentBox.contentBoxDataNode;
					if(updatePresRowHeight){
						//update presrowheight for each row if table height really changed
						contentBox._updatePresRowHeight(true);
					}
				}
				PresTableUtil.setRowHeightWithPresValue(tableToUpdate);
			} else {
				if((contentBox.getMainNodeHeightBasedOnDataContent()>contentBox.mainNode.offsetHeight)){
					contentBox.updateMainNodeHeightBasedOnDataContent();
				}
				contentBox.updateHandlePositions(false);
			}
		}

		// Fix issue with IE resizing the contentBoxDataNode on adjustContentDataSize events.
		if (dojo.isIE) {
//			D30384 [Regression][IE] Change properties of imported pptx table/textbox, two objects show in edit mode.
//			Raised by D16748 [A11Y][Web2.1b] cannot change object size by keyboard 
//			dojo.attr(contentBox.contentBoxDataNode,"style","POSITION: relative; WIDTH: 100%; HEIGHT: 100%; CURSOR: pointer");
			contentBox.adjustContentDataSize();
		}

		// Do not send a coedit message for NOTES resizing.
		if (contentBox.contentBoxType == PresConstants.CONTENTBOX_NOTES_TYPE) { 
			return; 
		}else if (contentBox.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE){
			//step3, update sorter
			//D40004 Resize table by properties not work now.
			contentBox.publishInsertNodeFrame();
			
			//step4,
			msg = SYNCMSG.createPresDelInsertElementAct(divId, "insert");
			if(msg){
				actPair.push(msg);
			}
			
			actPair = SYNCMSG.createMessage(MSGUTIL.msgType.ReplaceNode, actPair);
			
			//step5, add to undo stack
			SYNCMSG.sendMessage([ actPair ], SYNCMSG.NO_LOCAL_SYNC);
			this.oldHeight = null;
			contentBox.moveCursorToLastEditableElement();
			return;
		}
		
		var newStyle = dojo.attr(contentBox.mainNode, 'style');
		var act1 =SYNCMSG.createAttributeAct(contentBox.mainNode.id,{'style':newStyle}, null, {'style':oldStyle}, null);
		acts.push(act1);
		if (this.isBidi && contentBox.contentBoxType == contentBox.CONTENTBOX_TABLE_TYPE) {
			var newDir = dojo.style(contentBox.contentBoxDataNode, 'direction');
			var tables = this.cb.mainNode.getElementsByTagName('table');
			var table = new CKEDITOR.dom.node(this.cb.contentBoxDataNode);
			SYNCMSG.beginTrackAttributes(table);
			table.setStyle('direction', newDir);
			SYNCMSG.endTrackAttributes(table);
			table = (new CKEDITOR.dom.node(this.cb.mainNode.firstElementChild));
			SYNCMSG.beginTrackAttributes(table);
			table.setStyle('direction', newDir);
			SYNCMSG.endTrackAttributes(table);
			if (this.cb.editor){
				table = (new CKEDITOR.dom.node(this.cb.editor.document.$.body.children[0]));
				SYNCMSG.beginTrackAttributes(table);
				table.setStyle('direction', newDir);
				SYNCMSG.endTrackAttributes(table);
			}
		}
		for(var i=0;i< acts.length;i++){
			actList.push(acts[i]);
		}
		actList= actList.concat(acts);
		var msg =SYNCMSG.createMessage(MSGUTIL.msgType.Attribute,actList);
		SYNCMSG.sendMessage([msg]);

	},
	updateBidiClass : function(node, newDir){
		if ("rtl" == newDir)
			dojo.addClass(node,"bidiRTL");
		else //ltr
			dojo.removeClass(node,"bidiRTL");
	}
	
});
