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

dojo.require("dijit.form.DropDownButton");
dojo.require("concord.widgets.TextColorPalette");
dojo.requireLocalization("concord.widgets","presPropertyDlg");
dojo.provide("concord.widgets.presCellPropertiesDlg");
dojo.declare("concord.widgets.presCellPropertiesDlg", [concord.widgets.concordDialog], {
	nls:null,
	columnWidthTitle:null,
	rowHeightTitle:null,
	widthHeightTitle:null,
	currentTable:null,
	tableContentBox:null,
	tableEditor:null,
	columnWidthId:'concord_tableCellColumnWidth',
	rowHeightId:'concord_tableCellRowHeight',
	heightErrorIconId:'id_cellHeight_error',
	widthErrorIconId:'id_cellWidth_error',
	widthLeft:60,
	widthRight:60,
	
	constructor: function(object, title, oklabel, visible, params) {
		this.contentBox = object;
	},

	init:function(){
		this.selectedStyle=-1;
		this.selectedWidth=-1;
		this.initSelectedStyle = this.selectedStyle;
		this.initSelectedWidth = this.selectedWidth;
		this.initSelectedColor = this.selectedColor;
		this._initWH();
	},
	
	_initWH:function(){
		this.oldColumnWidth = 0;
		this.newColumnWidth=null;
		this.columnWidthInput.value = this.oldColumnWidth+"px";
		this.targetCol = null;
		this.targetTable = null;
		this.oldRowHeight = 0;
		this.newRowHeight=null;
		this.rowHeightInput.value = this.oldRowHeight+"px";
		this.targetRow = null;
		
		if(!this.unit){
			this.unit = PresTools.isMetricUnit() ? this.nls.cmUnit : this.nls.inUnit;			
		}
	},
	
	_setNLSStr: function(){
        this.nls = dojo.i18n.getLocalization("concord.widgets", "presPropertyDlg");
        if (this.nls) {
        	this.columnWidthTitle = this.nls.columnWidth;
        	this.rowHeightTitle = this.nls.rowHeight;
        	this.widthHeightTitle = this.nls.widthHeight;
        }
    },
    
    _setTDWidth: function(){
    	var localeWidth = [{locale:'el',widthLeft:'100',widthRight:'70'},
    	                    {locale:'ja',widthLeft:'70',widthRight:'50'},
    	                    {locale:'pt',widthLeft:'90',widthRight:'80'},
    	                    {locale:'it',widthLeft:'80',widthRight:'80'},
    	                    {locale:'pl',widthLeft:'80',widthRight:'90'},
    	                    {locale:'pt-br',widthLeft:'80',widthRight:'80'},
    	                    {locale:'th',widthLeft:'90',widthRight:'80'},
    	                    {locale:'fr',widthLeft:'90',widthRight:'90'}];
		for (var i = 0; i < localeWidth.length; i++)
		{
			if(localeWidth[i].locale == window.g_locale)
			{
				this.widthLeft = localeWidth[i].widthLeft;
				this.widthRight = localeWidth[i].widthRight;
				break;
			}
		}
    },

	setDialogID: function() {
		this.dialogId = "P_d_CellProperties";
		
	},
	createContent: function (contentDiv) {
		this._setNLSStr();
		this._setTDWidth();
		
		this.createSetWHArea(contentDiv);
	},

	createSetWHArea:function(container){
		var headerTable = dojo.create('table', null, container);
		dijit.setWaiRole(headerTable,'presentation');
		var headerTbody	= dojo.create('tbody', null, headerTable);
		
		// Width label and input
		var headerTR0 = dojo.create('tr', null, headerTbody);
		var headerTR0TD1 = dojo.create('td', null, headerTR0);
		var headerTR1 = dojo.create('tr', null, headerTbody);
		var headerTR1TD1 = dojo.create('td', null, headerTR1);
		var headerTR1TD2 = dojo.create('td', null, headerTR1);
		dojo.style(headerTR1TD1, 'paddingBottom', '10px');
		dojo.style(headerTR1TD2, 'paddingBottom', '10px');
		dojo.style(headerTR1TD2, 'marginLeft', '5px');
		
		var labelWidthText = dojo.create('label', null, headerTR0TD1);
		labelWidthText.appendChild(document.createTextNode(this.columnWidthTitle));
		dojo.attr(labelWidthText,{'for':this.columnWidthId});
		this.columnWidthInput = new dijit.form.TextBox({value:0, name:'colWidth', id: this.columnWidthId, intermediateChanges: true});	
		dojo.addClass (this.columnWidthInput.domNode, "inputBox");
		
		this.columnWidthInput.domNode.style.width ='8em';
		headerTR1TD1.appendChild(this.columnWidthInput.domNode);
		dijit.setWaiState(dojo.byId(this.columnWidthId), "required", true);
		
		this.createErrorIcon(headerTR1TD2, this.widthErrorIconId, this.nls.validUnitsWarning);

		// Height label and input
		var headerTR2 = dojo.create('tr', null, headerTbody);
		var headerTR2TD1 = dojo.create('td', null, headerTR2);
		var headerTR3 = dojo.create('tr', null, headerTbody);
		var headerTR3TD1 = dojo.create('td', null, headerTR3);
		var headerTR3TD2 = dojo.create('td', null, headerTR3);
		dojo.style(headerTR3TD1, 'paddingBottom', '10px');
		dojo.style(headerTR3TD2, 'paddingBottom', '10px');
		dojo.style(headerTR3TD2, 'marginLeft', '5px');

		var labelHeightText = dojo.create('label', null, headerTR2TD1);
		labelHeightText.appendChild( document.createTextNode(this.rowHeightTitle));
		dojo.attr(labelHeightText,{'for':this.rowHeightId});
		this.rowHeightInput = new dijit.form.TextBox({value:0, name:'rowHeight', id: this.rowHeightId, intermediateChanges: true});	
		dojo.addClass(this.rowHeightInput.domNode, "inputBox");
		
		this.rowHeightInput.domNode.style.width ='8em';
		headerTR3TD1.appendChild(this.rowHeightInput.domNode);	
		dijit.setWaiState(dojo.byId(this.rowHeightId), "required", true);
		
		this.createErrorIcon(headerTR3TD2, this.heightErrorIconId, this.nls.validUnitsWarning);
		
		dojo.connect( this.columnWidthInput, "onChange", dojo.hitch(this,this.columnWidthChange));
		dojo.connect( this.rowHeightInput, "onChange", dojo.hitch(this,this.rowHeightChange));
		
		// refer to inputbox::createContent::select()
		// then text within columnWidthInput is selected once dlg is showed up
		var inputBox = this.columnWidthInput;
		var select = function() {
		    inputBox.focusNode.select();
		};
		inputBox.attr("onFocus", select);
	},
	
	columnWidthChange:function(input){
		var allowedUnit = { 'cm':this.nls.cmUnit, 'mm':this.nls.mmUnit, 'in':this.nls.inUnit };
		var w = PresTools.parseValue(this.columnWidthInput.value, allowedUnit, true);

		
		if( isNaN(w) || w < 0)
		{
			this.setWarningMsg(this.nls.inputWarning);
			this.setWarningIcon(this.widthErrorIconId, true);
			this.columnWidthInput.focus();
			this.widthValid = false;
			return false;
		}else{
			this.newColumnWidth =w;
			this.widthValid = true;
			this.setWarningIcon(this.widthErrorIconId, false);
			if(this.heightValid)
				this.setWarningMsg('');
			return true;
		}
	},
	rowHeightChange:function(input){
		var allowedUnit = { 'cm':this.nls.cmUnit, 'mm':this.nls.mmUnit, 'in':this.nls.inUnit };
		var w = PresTools.parseValue(this.rowHeightInput.value, allowedUnit, true);

		if( isNaN(w) || w < 0){
			this.setWarningMsg(this.nls.inputWarning);
			this.setWarningIcon(this.heightErrorIconId, true);
			this.rowHeightInput.focus();
			this.heightValid = false;
			return false;
		}else{
			this.newRowHeight =w;
			this.heightValid = true;
			this.setWarningIcon(this.heightErrorIconId, false);
			if(this.widthValid)
				this.setWarningMsg('');
			return true;
		}
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

	onOk: function (contentBox){
		if(!this.heightValid )
			document.getElementById(this.rowHeightId).focus();
		else if(!this.widthValid )
			document.getElementById(this.columnWidthId).focus();
		else{
			this.setWidthHeight(contentBox);
			return true;
		}
		return false;
	},
	
	setWidthHeight:function(contentBox){
		
		if(!this.targetCol || !this.targetRow)
			return;
		
		var mainNode = this.contentBox.mainNode;
		var currColIndex = this.targetCol.$.cellIndex;
		var currRowIndex = this.targetRow.$.rowIndex;
		
		//step1
		var actPair = [];
		var divId = mainNode.id;
		var msg = SYNCMSG.createPresDelInsertElementAct(divId, "delete");
		if(msg){
			actPair.push(msg);
		}
		
		//step2, change the width of the table by the same percent as the column being changed.  Similar behavior as document.
		if(this.newColumnWidth && this.newColumnWidth != this.oldColumnWidth){
			// First update the column information
			var newWidthValue = this.newColumnWidth;
			var oldWidthValue = this.oldColumnWidth;
			var changedWidth = newWidthValue - oldWidthValue;
			
			var table = this.targetCol.getAscendant('table').$;
			PresTableUtil.convertTableColumnWidthsToPx(table);
			var colgrp = dojo.query('colgroup', table);
			if(colgrp.length > 0){
				colgrp = colgrp[0];
			}else{
				return;
			}
			   
			// Update the table width
			var tableWidth = dojo.style(mainNode, 'width');
			var oldTableWidth = contentBox.PxToPercent(tableWidth)+"%";
			var newTableWidthInPx = tableWidth+changedWidth;
			var newTableWidth = contentBox.PxToPercent(newTableWidthInPx)+"%";
			dojo.style(mainNode, 'width', newTableWidth);
			
			//update colgroup
			var subGrp = colgrp.childNodes;
			if(currColIndex >= 0  && currColIndex < subGrp.length){
				var col = subGrp[currColIndex];
				var _width = parseFloat(dojo.attr(col, "_width"));
				dojo.attr(col, "_width", _width + changedWidth);
			}
			PresTableUtil.convertTableColumnWidthsToPc(table, newTableWidthInPx);
			
		}
		
		var goOnNext = true;
		if(this.newRowHeight && this.newRowHeight != this.oldRowHeight){
			var newHeight = this.newRowHeight;
			var oldHeight = this.oldRowHeight;
			var changedHeight = newHeight - oldHeight;
			
			// Need to update each row.  Save all the original height values of into an array 
			// as we need to update each once the height of one row changes
			var rows = this.targetCol.getAscendant('tbody').getElementsByTag('tr');
			var rowHeightSizeArray = [];
			for(var i=0; i < rows.count(); i++) {
				var row = rows.getItem(i);
	        	var obj = {};
	        	obj.row = row;
	        	obj.height = dojo.style(row.$, 'height');
	        	obj.oldHeight = row.$.style.height;
	        	rowHeightSizeArray.push(obj);
	        }
	        
	        rowHeightSizeArray[currRowIndex].height = rowHeightSizeArray[currRowIndex].height + changedHeight;		

			// Update the table height
			var tableHeight = dojo.style(mainNode, 'height');
			var oldTableHeight = contentBox.PxToPercent(tableHeight, 'height')+"%";
			var newTableHeightInPx = tableHeight+changedHeight;
			var newTableHeight = contentBox.PxToPercent(newTableHeightInPx, 'height')+"%";
			dojo.style(mainNode, 'height', newTableHeight);

			// Update each of the rows with the updated sizes converted to percent
	        for (var i=0; i< rowHeightSizeArray.length; i++){
	        	var obj = rowHeightSizeArray[i];
	        	var value = this.PxToPercent(obj.height, 'height')+"%"; 
	        	var currentObj = obj.row;
	        	currentObj.setStyle("height", value);
	        	
	        }	
	        
	        // Update the table size
	        contentBox._update(true);//don't update presrowheight
	        var slideEditorMainNode = pe.scene.slideEditor.mainNode;
			var slideEditorHeightinPX = dojo.isIE ? slideEditorMainNode.offsetHeight: dojo.style(slideEditorMainNode, 'height');
	        //we need a update ckbody to get the correct row height, so update presrowheight here:
	        for(var i = 0, len = rows.count(); i < len; i++){
	        	var row = rows.getItem(i);
	        	var trH = dojo.isIE? row.$.offsetHeight : dojo.style(row.$, "height");
	        	row.setAttribute('presrowheight', trH * 1000 /slideEditorHeightinPX);
	        }
	        
	        goOnNext = false;
		}
		
		if(goOnNext){
			contentBox._update(true);//don't update presrowheight
		}
		
		//step3, update sorter
		var node = contentBox.editor.document.$.body.firstChild;
		contentBox.publishInsertNodeFrame(node, true);
	
		//step4,
		msg = SYNCMSG.createPresDelInsertElementAct(divId, "insert");
  	  	if(msg){
  	  		actPair.push(msg);
  	  	}
		
  	  	actPair = SYNCMSG.createMessage(MSGUTIL.msgType.ReplaceNode, actPair);
			
  	  	//step5, add to undo stack
  	  	SYNCMSG.sendMessage([ actPair ], SYNCMSG.NO_LOCAL_SYNC);
	},
	
	onCancel: function(contentBox){
	
	},
	
	_onShowWH:function(startContainer){
		var column = startContainer.getAscendant('th',true) || startContainer.getAscendant('td',true);
 		var table = startContainer.getAscendant('table',true);

		if(column){
			var columnWidth = PresTableUtil.getColumnAbsWidthByPercent(column);
			columnWidth = this.formatLocalizedValue(columnWidth+"px");
			var allowedUnit = { 'cm':this.nls.cmUnit, 'mm':this.nls.mmUnit, 'in':this.nls.inUnit };
			this.oldColumnWidth = PresTools.parseValue(columnWidth, allowedUnit, true);
			this.columnWidthInput.setValue(columnWidth);
			this.targetCol = column;
			this.targetTable = table;
		}
		var row = startContainer.getAscendant('tr',true);
		if(row){
			var rowHeight = row.$.offsetHeight;
			rowHeight =  this.formatLocalizedValue(rowHeight+"px");
			var allowedUnit = { 'cm':this.nls.cmUnit, 'mm':this.nls.mmUnit, 'in':this.nls.inUnit };
			this.oldRowHeight = PresTools.parseValue(rowHeight, allowedUnit, true);
			this.rowHeightInput.setValue(rowHeight);
			this.targetRow = row;
		}
	},
	
	onShow:function(){
		
		this.init();
		
		this.tableEditor = this.contentBox.getEditor();
		this.tableContentBox = this.tableEditor.contentBox;
		var selectedCells = this.tableEditor.getSelectedTableCells(this.tableEditor);
		var startContainer = selectedCells[0];
		this._onShowWH(startContainer);
		var table = startContainer.getAscendant('table',true);
		if(table==null){
			return ;
		}

		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':'dialogs'}];
		concord.util.events.publish(concord.util.events.presentationFocus, eventData);
		
	},
	
	hasClass:function(element, classList)
	{
		if( element && element.hasClass )
		{
			for (var i = 0; i < classList.length; i++){
				if( element.hasClass(classList[i]) )
					return true;
			}
		}
		return false;
	},
	
	//
	// This function returns the equivalent % given a px number
	//
	PxToPercent: function(px,heightOrWidth){
		var pxValue = parseFloat(px);
		var value = (heightOrWidth=='height')? this.contentBox.mainNode.offsetHeight : this.contentBox.mainNode.offsetWidth;

		var result =  (pxValue * 100)/value;
		return result;
	},

	formatLocalizedValue : function(value)
	{
		var numberLocale = PresTools.toLocalizedValue(value);
		return PresTools.formatNumber(numberLocale) + ' ' + this.unit;
	}

});