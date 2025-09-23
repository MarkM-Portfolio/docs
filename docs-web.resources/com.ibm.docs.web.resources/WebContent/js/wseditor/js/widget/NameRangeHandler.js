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

dojo.provide("websheet.widget.NameRangeHandler");

//dojo.require("websheet.dialog.nameRange");
dojo.require("dojo.i18n");
dojo.requireLocalization("websheet.widget","NameRangeHandler");

dojo.declare('websheet.widget.NameRangeHandler', websheet.listener.Listener,{
	
	editor: null,
	
	_nrDlg:null,
	_newDlg:null,
	
	isDlgShow:false,
	isNewShow:false,
	
	dlgTitle: "",
	newTitle:"",
	okLabel:"",
	addLabel:"",
	
	currRange:null,
	currAddress:null,	
	currRefValue:null,
	
	refChanged: false,	
	manualInput:false,
	
	dirtyRanges:null, // the ranges which need to update in name range dialog
	
	constructor: function (editor)
	{
		this.editor = editor;
		var nls = dojo.i18n.getLocalization("websheet.widget","NameRangeHandler");
		this.dlgTitle = nls.nameRange;
		this.newTitle = nls.NEWNAME_TITLE;
		this.okLabel = nls.okLabel;
		this.addLabel = nls.addLabel;
		this._highlightProvider = this.editor.getController().getHighlightProvider();
		this.editor.getCurrentGrid().selection.picker().subscribe(this);
		this.dirtyRanges = [];
	},
	
	enableUI: function(enabled) {
		var taskHdl = this.editor.getTaskHdl();
		var taskFrame;
		if (taskHdl) taskFrame = taskHdl.getTaskFrame(taskHdl.focusTask);
		if (taskFrame) 
			taskFrame.toggleTaskInfo(!enabled);
		var formulaBar = this.editor.getFormulaBar();
		if (formulaBar) formulaBar.disable(enabled);
		var toolbar = this.editor.getToolbar();
		if (toolbar) toolbar.disable(enabled);
		var grid = this.editor.getCurrentGrid();
		var selector = grid.selection.selector();
		if(enabled){			
			selector.hide();
		}
		else{		
			selector.render();	
		}
	},
	
	showNewNrDlg:function(){
		if(this.isDlgShow){
			this.editor.setFocusFlag(false);
			this._nrDlg.hide();
			this._highlightProvider.removeHighlight(this._currentHighlightAddr);
			this._currentHighlightAddr = null;
			//dojo["require"]("websheet.dialog.newName");
			dojo["require"]("concord.concord_sheet_widgets");
			this._newDlg = new websheet.dialog.newName(this.editor, this.newTitle ,this.addLabel,null,"");
		}
		else{			
			this.editor.enableUI(true);
			this.currAddress = this.editor.getCurrentGrid().selection.selector().getSelectedRangeAddress(false, true);
			this.isNewShow = true;
			//dojo["require"]("websheet.dialog.newName");
			dojo["require"]("concord.concord_sheet_widgets");
			this._newDlg = new websheet.dialog.newName(this.editor, this.newTitle ,this.addLabel,null,this.currAddress);
			this.highLightAddr(this.currAddress);
		}
		this._newDlg.show();	    
	},
	showNrDlg:function(){
		var docObj = this.editor.getDocumentObj();
		var list = docObj.getAreaManager().getRangesByUsage(websheet.Constant.RangeUsage.NAME);
        dojo["require"]("concord.concord_sheet_widgets");
		this._nrDlg = new websheet.dialog.nameRange(this.editor, this.dlgTitle, this.okLabel, false, list);
		this._nrDlg.show();		
		this.isDlgShow = true;
		this.editor.enableUI(true);
	},
	
	isEditingNamedRange:function(){
		return this.isDlgShow||this.isNewShow;
	},
	
	closeNewDlg: function(newRange){
		if(this.isDlgShow){
			this._nrDlg.show();
			if(newRange){
				var docObj = this.editor.getDocumentObj();
				var l = docObj.getAreaManager().getRangesByUsage(websheet.Constant.RangeUsage.NAME).length;
				this._nrDlg.tableDiv.scrollTop = (l-6)*24;
				this._nrDlg.onSelected(newRange);
			}else{
				if(this.currRange && this._nrDlg.inputText == this.currRange.getParsedRef().getAddress())
					this.highLightRange();
				else{
					this._highlightProvider.removeHighlight(this._currentHighlightAddr);
				 	if(this._nrDlg.warnMsg){
				 		this._nrDlg.setWarningMsg(this._nrDlg.warnMsg);
				 	}
				}
			}
		}else{
			this._highlightProvider.removeHighlight(this._currentHighlightAddr);
			this._currentHighlightAddr = null;
			this.isNewShow = false;
			this.editor.enableUI(false);
		}
	},
	
	closeManageDlg: function()
	{
		if(this._currentHighlightAddr)
			this._highlightProvider.removeHighlight(this._currentHighlightAddr);
		this._currentHighlightAddr = null;
		this.currRange = null;
	},
	
	//used when grid udpate
	updateUI: function(){		
        if(this.currRange && !this.refChanged){
        	var addr = this.currRange.getParsedRef().getAddress();
			this._nrDlg.updateAddress(addr);
			if(this.isEditingNamedRange())
				this.highLightAddr(addr);
        }
        var length = this.dirtyRanges.length;
        for(var i = 0; i < length; i++){
        	var dirtyRange = this.dirtyRanges[i];
        	this._nrDlg.updateRange(dirtyRange);
        }
        this.dirtyRanges = [];
	},
	
	//Remove/release the last highlight, and create new highlight.
	highLightAddr: function(addr){
		if(this._currentHighlightAddr)
			this._highlightProvider.removeHighlight(this._currentHighlightAddr);
		if(addr)
			this._currentHighlightAddr = this._highlightProvider.highlightRangeInString(addr);
		else
			this._currentHighlightAddr = null;
			
	},	
	
	updateNameRange: function(range){
		if(this.currRange && !this.refChanged){
			this._nrDlg.updateAddress(this.currRange.getParsedRef().getAddress());
			this.highLightRange();
		}
		this._nrDlg.updateRange(range);
	},
	
	updateNamesList: function(range, isDelete){		
		if(isDelete){
			this._nrDlg.updateList(range,true);
			if(this.currRange == range){
				this.currRange = null;
				this._nrDlg.updateAddress("");
				if(this._currentHighlightAddr)
					this._highlightProvider.removeHighlight(this._currentHighlightAddr);
				this._nrDlg.modifyBtn.setDisabled(true);
			}
		}else{
			this._nrDlg.updateList(range);
		}			
	},
	
	isRangeExist: function(rangeId){
		var docObj = this.editor.getDocumentObj();
		var range = docObj.getAreaManager().getRangeByUsage(rangeId,websheet.Constant.RangeUsage.NAME);
		if(range)
			return true;
        return false;
	},
	
	onRefChange: function(address){
	    if(address == this.currAddress)
	    	return;	   
		this.currAddress = address;
		this.refChanged = true;
		if(this.currRange && address == this.currRange.getParsedRef().getAddress())
			this.refChanged = false;		   
		this.manualInput = true;
		if(this.refChanged)
		{
			this.highLightAddr(address);
		}
	},
	
	highLightRange: function(range)
	{
		if(range)
			this.currRange = range;
		if(!this.currRange)
			return;
		this._highlightProvider.removeHighlight(this._currentHighlightAddr);
		this._currentHighlightAddr = this._highlightProvider.highlightRange(this.currRange);
	},
	
	//Called by syncCellInputWithRangePicker of rangepicker.
	updateCurrAddress: function(address){
		this._highlightProvider.removeHighlight(this._currentHighlightAddr);
		if(this._newDlg && this._newDlg.dialog && this._newDlg.dialog._isShown()){			
			this._newDlg._reset();
			this._newDlg.updateAddress(address);
			this.highLightAddr(address);
		}
		else if(this._nrDlg.dialog._isShown() && this._nrDlg.inputBox.disabled)
		 	return;
		else{
			this._nrDlg._reset();
			this._nrDlg.updateAddress(address);
			this.highLightAddr(address);
		}
		if(this.currAddress != address)
			this.refChanged = true;
		this.currAddress = address;	
	},
	
	rangePicking: function(rp)
	{
		if(this.isEditingNamedRange())
		{
			var address = rp.getSelectedRangeAddress(false, true, false, false, !rp.selectingCell());
			this.updateCurrAddress(address);
		}
	},
	
	rangePicked: function (rp) {
		// range picking complete, what should we do know;
	},
	
	//called by _event.js
	applyAddressOnMouseUp: function(e){
		if(this._nrDlg && this._nrDlg.dialog._isShown() && this._nrDlg.inputBox.disabled)
		 	return;		 
		this._addressSerialize();			 	
		this.highLightAddr(this.currAddress);
        this.refChanged = true;
        //clicking on name box SHOULD NOT focus to input box in all cases, it doesn't make sense
        if(this._newDlg && this._newDlg.dialog && this._newDlg.dialog._isShown() && e.target != this._newDlg.nameBox.focusNode){
        	this._newDlg.inputBox.focus();
        }
        else if(this._nrDlg && this._nrDlg.dialog._isShown()){ //
        	this._nrDlg.inputBox.focus();
        	this._nrDlg.modifyBtn.setDisabled(false);		
        }
		this.manualInput = false;
	},
	
	setSelectedRange:function(){
       this.editor._calcManager.pauseTasks();

	   var attrs = {usage: websheet.Constant.RangeUsage.NAME, rangeid: this.currRange.getId()};
	   var reverseAddr = this.currRange.getParsedRef().getAddress();
	   this.editor.execCommand(commandOperate.SETRANGEINFO, [this.currRefValue, attrs, reverseAddr, attrs, true]);
	},
	
	_addressSerialize: function(){
		var parsedRef = websheet.Helper.parseRef(this.currAddress);
		if(parsedRef && parsedRef.isValid()){
			var sheetName = "";
			if(parsedRef.sheetName){
				sheetName = parsedRef.sheetName;
				if(websheet.Helper.needSingleQuotePattern.test(sheetName)){
					if(this.currAddress.indexOf("'") !== 0)
						return false;
				}						
				if(!this.editor.getDocumentObj().isSheetExist(sheetName))
					return false;
				if(parsedRef.is3D()) {
					if(!this.editor.getDocumentObj().isSheetExist(parsedRef.endSheetName))
						return false;
				}
			}
			else
				sheetName = this.editor.getCurrentGrid().getSheetName();
			var RefAddressType = websheet.Constant.RefAddressType;
			var params = {refMask: parsedRef.refMask 
					| RefAddressType.SHEET | RefAddressType.ABS_COLUMN | RefAddressType.ABS_ROW | RefAddressType.ABS_END_COLUMN | RefAddressType.ABS_END_ROW};
			this.currRefValue = websheet.Helper.getAddressByIndex(sheetName, parsedRef.startRow, parsedRef.startCol, parsedRef.endSheetName, 
				parsedRef.endRow, parsedRef.endCol, params);
			
		    return true;
		}
		return false;
	},
	

	insertNameRange: function(nameText){
       this.editor._calcManager.pauseTasks();
       
	   var attrs = {usage: websheet.Constant.RangeUsage.NAME, rangeid: nameText};
	   this.editor.execCommand(commandOperate.INSERTRANGE, [nameText, this.currRefValue, attrs, attrs, null, true]);

	   var docObj = this.editor.getDocumentObj();
	   var newRange = docObj.getAreaManager().getRangeByUsage(nameText, websheet.Constant.RangeUsage.NAME);
	   return newRange;
	},
	
	deleteNameRange:function(range){
		this.editor._calcManager.pauseTasks();
	
		var rangeId = range.getId();
		var address = range.getParsedRef().getAddress();
		var attrs = {usage: websheet.Constant.RangeUsage.NAME, rangeid: rangeId};
		this.editor.execCommand(commandOperate.DELETERANGE, [rangeId, address, attrs, attrs, null, true]);
	},
	
	/*************************Listener***************************/
	notify: function(area, e)
	{
		if(!this.isDlgShow)
			return;
		if(e )
		{
			//set Area, this.updateNameRange
			if(e._type == websheet.Constant.EventType.DataChange)
			{
				var s = e._source;
				if (s.refType == websheet.Constant.OPType.AREA) {
					switch(s.action) {
						case websheet.Constant.DataChange.DELETE: {
							this.updateNamesList(area, true);
							break;
						}
						case websheet.Constant.DataChange.INSERT:{
							var newArea = s.refValue;
							this.updateNamesList(newArea);
							break;
						}
						case websheet.Constant.DataChange.SET:{
							this.updateNameRange(area);//area is the updated area
							area.setMask(area.getParsedRef().refMask); 
							area.setContentDirty(true);
							area.setNeedPartial(true);
							break;
						}
					}
				} else if(((s.action == websheet.Constant.DataChange.SET || s.action == websheet.Constant.DataChange.INSERT || s.action == websheet.Constant.DataChange.PREDELETE ) 
								&& s.refType == websheet.Constant.OPType.SHEET)
						||((s.action == websheet.Constant.DataChange.PREINSERT || s.action == websheet.Constant.DataChange.PREDELETE) 
								&&( s.refType == websheet.Constant.OPType.ROW ||s.refType == websheet.Constant.OPType.COLUMN )) 
						|| s.action == websheet.Constant.DataChange.CUT){
					this.dirtyRanges.push(area);
				}
			}
		}
	}
});	
