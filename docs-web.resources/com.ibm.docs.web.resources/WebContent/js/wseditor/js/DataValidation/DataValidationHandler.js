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

dojo.provide("websheet.DataValidation.DataValidationHandler");
dojo.require("websheet.widget.PopupIndicate");
dojo.requireLocalization("websheet.DataValidation","DataValidationHandler");

dojo.declare("websheet.DataValidation.DataValidationHandler", websheet.listener.Listener, {
	_nls: null,
	_validationPane: null,
	usage: websheet.Constant.RangeUsage.DATA_VALIDATION,
	
	constructor: function(editor)
	{
		this.editor = editor;
		this._nls = dojo.i18n.getLocalization("websheet.DataValidation","DataValidationHandler");
		this._highlightProvider = editor.getController().getHighlightProvider();
	},
	
	setLocalDirty: function(){
		if(this._validationPane)
			this._validationPane.setLocalDirty();
	},
	
	setValidation: function(){
		if(!this._validationPane){
			var mainNode = dojo.byId("mainNode");
			var vNode = dojo.create("div",{id: "validation_sidebar_div"}, mainNode);
			this._validationPane = new websheet.DataValidation.ValidationPane(vNode,this);
			
			var okCallback = dojo.hitch(this, "_setValidation");
			var removeCallback = dojo.hitch(this, "_removeValidation");
			this._validationPane.init(this, okCallback, removeCallback);
			this.editor.getCurrentGrid().selection.picker().subscribe(this);
		}
		var grid = this.editor.getCurrentGrid();
		var selector = grid.selection.selector();
		var refValue = selector.getSelectedRangeAddress(false, true);
		var info = selector.getRangeInfo();
		var oriInfo = websheet.model.ModelHelper.getJSONByUsage4Editing(info, websheet.Constant.RangeUsage.DATA_VALIDATION);
		this._validationPane.open(refValue, oriInfo);
		
		var areaMgr = this.editor.getDocumentObj().getAreaManager();
		this.refArea = areaMgr.startListeningArea(websheet.Helper.parseRef(refValue), this);
		this._refDirty = false;
	},
	
	validationPaneClosed: function()
	{
		if(this.refArea){
			var areaMgr = this.editor.getDocumentObj().getAreaManager();
			areaMgr.endListeningArea(this.refArea, this);
		}
	},
	
	isEditing: function()
	{
		return this._validationPane && this._validationPane.isEditingRef();
	},
	
	isPandShowing: function()
	{
		return this._validationPane && !this._validationPane.isCollapsed();
	},
	
	updateDVInfo: function()
	{
		var grid = this.editor.getCurrentGrid();
		setTimeout(dojo.hitch(grid, "updateDVInfo"),200);
	},
	
	rangePicking: function(rangepicker)
	{
		if(!this.isPandShowing())return;
		var address = rangepicker.getSelectedRangeAddress(false, true, false, false, !rangepicker.selectingCell());
		this.currAddress = address;
		if(!address)
			return;
		this.highLightAddress(address);		
		this._validationPane.rangePicking(address);
	},
	
	rangePicked: function () {
		if(!this.isPandShowing())return;
		
		if(this.currAddress)
			this._validationPane.rangePicked();
	},
	
	refNodeFocused: function(focusNode, ref)
	{
		var grid = this.editor.getCurrentGrid();
		var inlineEditor = grid.getInlineEditor();
		if(inlineEditor.isEditing()){
			inlineEditor.apply();
			setTimeout(dojo.hitch(focusNode, "focus"),200);
			if(ref)
				setTimeout(dojo.hitch(this, "highLightAddress", ref),500);
		}
	},
	
	//called by dialog to high light currently editing data source
	highLightAddress: function(address)
	{
		var grid = this.editor.getCurrentGrid();
		var selector = grid.selection.selector();
		selector.hide();
		this._highlightProvider.removeHighlight(this._currentHighlight);
		if(address)
		{
			this._currentHighlight = this._highlightProvider.highlightChartRange(address);
		}
	},
	
	hideRangeViewer: function()
	{
		if(this._currentHighlight)
		{
			this._highlightProvider.removeHighlight(this._currentHighlight);
			this._currentHighlight = null;
		}
		var grid = this.editor.getCurrentGrid();
		var selector = grid.selection.selector();
		selector.render();
	},
	
	_setValidation: function(refValue, validation)
	{
		var parsedRef = websheet.Helper.parseRef(refValue);
		if(!parsedRef || !parsedRef.isValid())
			return;
		var oriDvs = websheet.model.ModelHelper.getJSONByUsage(parsedRef.sheetName,  parsedRef.startRow, parsedRef.startCol, parsedRef.endRow, parsedRef.endCol, this.usage);
		this.editor._toDVJSON4Msg(oriDvs, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
		
		var rangeId = "DV" + dojox.uuid.generateRandomUuid();
		var attrs = {
				data: {criteria : validation},
				rangeid: rangeId,
				usage : this.usage
			};
		var revContent = {dvs: oriDvs};
		var revAttrs = {rangeid: rangeId, usage: this.usage};
		this.editor.execCommand(commandOperate.INSERTRANGE, [rangeId, refValue, attrs, revAttrs, revContent]);
		
		this.updateDVInfo();
	},
	
	_removeValidation: function(refValue)
	{
		var parsedRef = websheet.Helper.parseRef(refValue);
		var oriDvs = websheet.model.ModelHelper.getJSONByUsage(parsedRef.sheetName,  parsedRef.startRow, parsedRef.startCol, parsedRef.endRow, parsedRef.endCol, this.usage);
		if(!oriDvs || Object.keys(oriDvs).length == 0)
			return;
		
		this.editor._toDVJSON4Msg(oriDvs, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
		var attrs = {usage: this.usage};
		
		var revContent = {dvs: oriDvs};
		var address, revAttrs;
		if (revContent.dvs && revContent.dvs.length > 0){
			var dv = revContent.dvs[0];
			revAttrs = dv.data;
			address = dv.refValue;
			revContent.dvs.splice(0,1);
		}

		this.editor.execCommand(commandOperate.DELETERANGESBYRANGE, [refValue, attrs, address, revAttrs, revContent]);

		this.updateDVInfo();
	},
	
	_scrollIntoView:function(rowIndex, colIndex)
	{
		var grid = this.editor.getCurrentGrid();
		if (rowIndex >= grid.freezeRow && (rowIndex < grid.scroller.firstVisibleRow || rowIndex > grid.scroller.lastVisibleRow)) {
			grid.scroller.scrollToRow(rowIndex);
		}
		if (colIndex > grid.freezeCol && (colIndex < grid.scroller.firstVisibleCol || colIndex > grid.scroller.lastVisibleCol)) {
			grid.scroller.scrollToColumn(colIndex);
		}
	},
	
	//used when grid udpate
	updateUI: function()
	{
		if(this.isPandShowing() && this._refDirty){
			this._validationPane.updateRef(this.refArea._parsedRef.getAddress());
			this._refDirty  = false;
		}
		//indicateReLocation
		if(this._popupWarning && this._popupWarning.isShow()){
			var pos = this._getPosition(this._warningPos.r, this._warningPos.c);
			this._popupWarning.reLocate(pos);
		}
	},
	
	_getPosition: function(rowIndex, colIndex)
	{
		var posCol = colIndex;
		var posRow = rowIndex - 1;
		var grid = this.editor.getCurrentGrid();
		var merge = grid.cellMergeInfo(posRow, posCol);
		if (posCol < grid.scroller.firstVisibleCol && merge && merge.colSpan + posCol > grid.scroller.firstVisibleCol) {
			posCol = grid.scroller.firstVisibleCol;
		}
		if(merge && merge.rowSpan)
			posRow += merge.rowSpan - 1;
		if (grid.scroller.isRowInVisibleArea(posRow) && grid.scroller.isColumnInVisibleArea(posCol)) {//&& grid.isColumnInVisibleArea(posCol)//merge cell
			var position = grid.geometry.getCellPosition(posRow, posCol, true);
			if (position.w > 0 && position.h > 0) {
				position.y = position.t + grid.gridRect.top;
				if (!grid.isMirrored) {
					position.x = position.l;
				} else {
					position.x = grid.geometry.getGridWidth() - position.l - position.w;
				}
				if (BidiUtils.isGuiRtl() && pe.scene.sidebar && !pe.scene.sidebar.isCollapsed()) {
					position.x += pe.scene.sidebar.getMaxWidth();
				}
				return position;
			}
		}
		return null;
	},
	
	closeWarning: function()
	{
		if(this._popupWarning)
			this._popupWarning.close();
	},
	
	showWarning: function(rowIndex, colIndex){
		if(this._infoPos && this._infoPos.r == rowIndex && this._infoPos.c == colIndex)
			this.closeInfo();
		this._scrollIntoView(rowIndex - 1, colIndex);
		var pos = this._getPosition(rowIndex, colIndex);
		if(pos){
			this._warningPos = {r: rowIndex, c: colIndex};
			if(!this._popupWarning){
				dojo["require"]("concord.concord_sheet_widgets");
				var mainNode = dojo.byId("mainNode");
				var tmpNode = dojo.create("div", null, mainNode);
				this._popupWarning = new websheet.widget.PopupIndicate({editor: this.editor, className : "redIndicate", value: this._nls.ERROR}, tmpNode);
			}
			this._popupWarning.show(pos);
			var grid = this.editor.getCurrentGrid();
			grid.announce(this._nls.ERROR);
			setTimeout(dojo.hitch(this, "closeWarning"),3000);
		}
	},
	
	showInfo: function(rowIndex, colIndex, prompt)
	{
		if(this._warningPos && this._warningPos.r == rowIndex && this._warningPos.c == colIndex && this._popupWarning && this._popupWarning.isShow())
			return;
		this._scrollIntoView(rowIndex - 1, colIndex);
		var pos = this._getPosition(rowIndex, colIndex);
		if(pos){
			this._infoPos = {r: rowIndex, c: colIndex};
			if(!this._popupInfo){
				dojo["require"]("concord.concord_sheet_widgets");
				var mainNode = dojo.byId("mainNode");
				var tmpNode = dojo.create("div", null, mainNode);
				this._popupInfo = new websheet.widget.PopupIndicate({editor: this.editor, className : "greyIndicate", value: null}, tmpNode);
			}
			this._popupInfo.show(pos, prompt);
			var grid = this.editor.getCurrentGrid();
			grid.announce(prompt);
		}
	},
	
	closeInfo: function()
	{
		if(this._popupInfo)
			this._popupInfo.close();
	},
	
	/*************************Listener***************************/
	notify: function(area, e)
	{
		if(!this.isPandShowing())
			return;
		if(e)
		{
			if(e._type == websheet.Constant.EventType.DataChange)
			{
				constant = websheet.Constant;
				var s = e._source;
				var action = s.action;
				if (s.refType == constant.OPType.ROW || s.refType == constant.OPType.COLUMN){
					if(action == constant.DataChange.PREINSERT || action == constant.DataChange.PREDELETE)
						this._refDirty = true;
				}
				else if (s.refType == constant.OPType.SHEET){
					if(action == constant.DataChange.PREDELETE || action == constant.DataChange.SET || action == constant.DataChange.INSERT) 
						this._refDirty = true;
				}
			}
		}
	}
});