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

dojo.provide("websheet.Clipboard");
dojo.require("websheet.Constant");
dojo.require("websheet.RangeDataHelper");
dojo.require("websheet.clipboard.Storage");
dojo.require("websheet.clipboard.CSVHelper");
dojo.require("websheet.clipboard.CopyMixin");
dojo.require("websheet.clipboard.PasteMixin");
dojo.require("websheet.clipboard.CutMixin");
dojo.require("websheet.clipboard.SelectionRectMixin");
dojo.require("websheet.widget._Rectangle");

dojo.requireLocalization("websheet", "base");
dojo.requireLocalization("websheet", "Clipboard");

dojo.declare('websheet.Clipboard', [websheet.clipboard.CopyMixin, websheet.clipboard.PasteMixin, websheet.clipboard.CutMixin, websheet.clipboard.SelectionRectMixin], {
	editor: null,
	controller: null,
	_baseNLS: null,
	_nls:null,
	_clearCopyDomTimer: null, // the setTimeout handler used to clear the dom  for store the copy data
	_customClipType: "text/x-docs-ss-sn",
	
    constructor: function(editor){
        this.editor = editor; 
        this.controller = editor.getController();
        this._nls = dojo.i18n.getLocalization("websheet", "Clipboard");
        this._baseNLS = dojo.i18n.getLocalization("websheet", "base");
        this._storage = new websheet.clipboard.Storage();
        this._id = new Date().valueOf();
    },
    
    onGridReset: function()
    {
    	this.exitSelect(true);
    },
    
    getCutRect: function(){
    	var c_grid = this.editor.getCurrentGrid();
    	if(!this._cutRect || this._cutRect._destroyed)
    	{
    		this._cutRect = new websheet.widget._Rectangle({grid : c_grid, isMoveable: false});
    		this._cutRect.setBorderStyle('dashed');
    	}
    	this._cutRect.wakeup().selectGrid(c_grid).placeAt(c_grid.selection.selector().containerNode, 'before');
    	return this._cutRect.select(c_grid.selection.selector(), true);
    },
    
    _reviseSelectRect: function(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, type)
    {
		var sr = this.controller.getGrid(sheetName).selection.selector();
		var maxRow = this.editor.getMaxRow();
		if(endRowIndex == null)
			endRowIndex = maxRow;
		if(sr.selectingRows())
		{
			if(type == websheet.Constant.Range && endColIndex < websheet.Constant.MaxColumnIndex)
			{
				// you do not fill me full.
				sr.selectRange(null, null, endRowIndex - 1, endColIndex);
			}
			else
			{
				sr.selectRow(startRowIndex - 1, endRowIndex - 1);
			}
		}
		else if(sr.selectingColumns())
		{
			if(type == websheet.Constant.Range && endRowIndex < maxRow)
			{
				// you do not fill me full.
				sr.selectRange(null, null, endRowIndex - 1, endColIndex);
			}
			else
			{
				sr.selectColumn(startColIndex, endColIndex);
			}
		}
		else if(type == websheet.Constant.Range)
		{
			sr.selectRange(null, null, endRowIndex - 1, endColIndex);
		}
    },

    copy: function(event, forCut) {
    	this.setSelect(true);
    	var drawFrameHdl = this.editor.getDrawFrameHdl();
    	var drawFrameRanges = drawFrameHdl.getSelectedDrawFramesInCurrSheet();
    	if (drawFrameRanges.length != 0) {
    		var drawFrameRange = drawFrameRanges[0];
    		if (drawFrameRange.usage == websheet.Constant.RangeUsage.CHART){
    			this._copyChart(event, drawFrameRange);
    		} else {
    			this._copyImage(event, drawFrameRange);
    		}
    	} else {
    		this._showSelection();
	    	var grid = this.editor.getCurrentGrid();
			var sheetName = grid.sheetName;
			var selector = grid.selection.selector();
			var range = selector.getRangeInfo();
			var startRowIndex = range.startRow;
	        var endRowIndex = range.endRow;
	        var startColIndex = range.startCol;
	        var endColIndex = range.endCol;
				
			var selectType = selector.getSelectType();
				
			if(selectType == websheet.Constant.Cell){
				rangeInfo = websheet.Utils.getExpandRangeInfo(selector.getRangeInfo());
				if(rangeInfo.startCol != rangeInfo.endCol
						|| rangeInfo.startRow != rangeInfo.endRow){
					selectType = websheet.Constant.Range;
					startColIndex = rangeInfo.startCol;
					endColIndex = rangeInfo.endCol;
					startRowIndex = rangeInfo.startRow;
					endRowIndex = rangeInfo.endRow;
				}
			}
				
			switch (selectType) {
		    case websheet.Constant.RowRange:
		    case websheet.Constant.Row:
		    	this._copyRowRange(event, sheetName, startRowIndex, endRowIndex);
		        break;
		    case websheet.Constant.Column:
		    case websheet.Constant.ColumnRange:
		        this._copyColumn(event, sheetName, startColIndex,endColIndex);
		        break;
		    case websheet.Constant.Cell:
		        this._copyCell(event, sheetName, startRowIndex, startColIndex);
		        break;
		    case websheet.Constant.Range:
		        this._copyRange(event, sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex);
		        break;
		    default:
		        break;
			}
    	}
    },
    
    /**
     * paste, returning event and reverse event, { event: <event>, reverse: <reverse>, refValue: <refValue> }
     */
    paste: function(event) {
    	if(event)
    	{
    		// from CTRL+V
    		this._preparePasteDom();
    	}
    	else
    	{
    		// from menu item
	    	if(dojo.isIE)
	    	{
	    		this._preparePasteDom();
	    		document.execCommand("Paste", false, null);
	    	}
	    	else
	    	{
	    		var data = this._storage.getData();
	    		if(data && !data._invalid)
	    			this._pasteFromInternalClipBoard(data);
	    	}
    	}
    },
    
    getCutRangeInfo: function()
    {
    	if(this._cutRect)
    		return this._cutRect.getRangeInfo();
    	return null;
    },
    
    _showCopyMsg: function(copyResult)
    {
    	var msg = null;
    	
    	if(!copyResult)
    	{
    		msg = this._nls.COPY_FORMULA_UNCALC_ERROR;
    	}
    	else if(copyResult.limited)
    	{
    		var number = websheet.Constant.MaxCopyCells;
    		dojo["requireLocalization"]("dojo.cldr",'number', g_locale);
    		var options = {};
    		options.type = "decimal";
    		options.locale = g_locale;
    		var numberString = dojo.number.format( number, options );
    		
    		msg = dojo.string.substitute(this._nls.COPY_OUT_LIMITED_MSG, [numberString]);
    	}
    	
    	if(msg)
    	{
    		var self = this;
	    	setTimeout(function(){
	    		self.editor.scene.showWarningMessage(msg, 4000);
	    	}, 0);
    	}
    },
    
    _onCopy: function(data, event, callback)
    {   	
    	if(!data || !data.data)
    		return;
    	var beforeFocus = document.activeElement;
    	var dom = this._getCopyCutContainer(this._cutting);
    	dom.innerHTML = "";
    	if(this._clearCopyDomTimer)
    	{
    		clearTimeout(this._clearCopyDomTimer);
    		this._clearCopyDomTimer = null;
    	}	
    	if(!event)
    	{
    		// from menu item
    		if(dojo.isIE)
    		{
    			var result = this._prepareCopyDom(dom, data);
        		if(result && result.obj)
        		{
        			data.sysclip = result.obj;
        			data.contentLimited = result.contentLimited;
        		}
    			this._onCopyFromIEMenu(dom, data, result, callback);
    		}
    		else
    		{
    			// other browser only impact internal memory storage.
    			if(callback)
    				callback(data);
    			else
    				this._storage.setData(data);
    		}
    	}
    	else
    	{
    		// from CTRL+C
    		var result = this._prepareCopyDom(dom, data);
    		this._showCopyMsg(result);
    		var useClipboardData = false;
    		if(result && result.obj)
    		{
    			data.sysclip = result.obj;
    			data.contentLimited = result.contentLimited;
    			
    			if(dojo.isWebKit)
        		{
        			var text = "";
        	    	for (var i = 0; i < data.sysclip.length; i++)
        	    	{
        	    		var row = data.sysclip[i];
        	    		for (var j = 0; j < row.length; j++)
        	    		{
        	    			var value = row[j];
        	    			if(value.indexOf("\n") >= 0)
        	    				text += "\"" + value + "\"";
        	    			else
        	    				text += value;
        	    			if(j != row.length -1)
        	    				text += "\t";
        	    		}	
        	    		if(i != data.sysclip.length - 1)
        	    			text += "\n";
        	    	}
        	    	
        	    	useClipboardData = event.clipboardData.setData("text/plain", text);
        	    	// useClipboardData will return false, only for Windows Safari from test/
        	    	if(useClipboardData)
        	    	{
        	    		event.clipboardData.setData("text/html", dom.innerHTML);
        	    		event.clipboardData.setData(this._customClipType, data.sn);
        	    		event.preventDefault();
        	    	}
        		}
    		}
    		
    		if(!useClipboardData)
    			this._selectRange(dom);
    		
    		if(callback)
    			callback(data);
    		else
    		{
    			this._storage.setData(data);
    		}
    		
    		if(dojo.isSafari && !useClipboardData)
    		{
    			var isForImg = data.data && data.data.img;
    			setTimeout(dojo.hitch(this, function(){
    				beforeFocus && beforeFocus.blur();
        			this.editor.focus2Grid();
        		}), isForImg ? 10 : 600);
    		}
    		else
    		{
    			setTimeout(dojo.hitch(this, function(){
    				this.editor.focus2Grid();
    			}), 0);
    		}
    	}
    	this._clearCopyDomTimer = setTimeout(function(){dom.innerHTML = "";},2000);
    },
  	
    _copyImage: function(event,imageRange) {
     	var img = {};
		for (var attr in imageRange.data)
			img[attr] = imageRange.data[attr];
		if(!this._cutting)
			delete img.z;

      	var src = dojo.byId(imageRange.getId()).src;
      	src && (img.absHref = src);
      	
     	var data = {img:img};
     	var content = {data:data, refValue: imageRange.getParsedRef().getAddress(), refType: websheet.Constant.Range, srcRangeId: imageRange.getId()};     
     	this._onCopy(content, event);
     	
     	if(this._cutting){
     		this.editor.getDrawFrameHdlByUsage(imageRange.usage).deleteDrawFrame(imageRange.getId());
     	}
     },
     
     _copyChart: function(event, chartRange){
    	 var rangeId = chartRange.getId();
    	 var d = this.editor.getDocumentObj();
    	 var chartDoc = d.getChart(rangeId);
    	 if(!chartDoc.hasView()){
    		 this.editor.scene.showWarningMessage(this._nls.COPY_CHART_WARNING, 4000);
    		 return;
    	 }
    	 var chart = {};
    	 for(var attr in chartRange.data)
    		 chart[attr] = chartRange.data[attr];
    	 delete chart.z;
    	 
    	 var chartJson = chartDoc.toJson();
    	 chart.chart = chartJson;
    	 var uri = this.editor.scene.getDocBean().getUri();
    	 chart.uri = uri;
    	 var data = {chart:chart};
    	 var content = {data:data, refValue: chartRange.getParsedRef().getAddress(), refType: websheet.Constant.Range, srcRangeId: rangeId}; 
    	 this._onCopy(content, event);
    	 
    	 if(this._cutting){
 			var chartHdl = this.editor.getChartHdl();
    		chartHdl.deleteDrawFrame(rangeId);
    	 }
     },
     
     _getAllColJson: function(sheetName)
     {
    	var mHelper = websheet.model.ModelHelper;
     	var docObj = this.editor.getDocumentObj();
     	var sheet = docObj.getSheet(sheetName);
    	var colModels = sheet._columns;
    	var len = colModels.length;
    	var lastColIndex = 1;
    	if(len > 0)
    	{
			var lastCol = colModels[len -1];
			lastColIndex = lastCol._repeatedNum ? (lastCol.getIndex() + lastCol._repeatedNum):lastCol.getIndex();
    	}	
    	var cols = {};
    	cols.columns = mHelper.toColsJSON(sheetName,1,lastColIndex,{bSet:true});
    	return cols;
     },
     
    _copyRowRange: function(event, sheetName, startRowIndex, endRowIndex) {
    	if(this._cutting && websheet.Utils._checkMergedInRow(sheetName, startRowIndex,endRowIndex )){
    		if(this._cutDlg && this._cutDlg.dialog && this._cutDlg.dialog.open)
    		{
    			this.exitSelect();
    			return;
    		}
    		this._cutDlg = new concord.widgets.MessageBox(this, this._baseNLS.CUT_ROW, null, false, 
    				{message: this._baseNLS.CUT_ROW_WITH_MERGED_CELL});
    		this._cutDlg.show();
    		this.exitSelect();
    		return;	
    	}
    	var helper = websheet.model.ModelHelper;
    	var isFilter = this._cutting ? false : true;
    	var maxCellsNumber = websheet.Constant.MaxCopyCells;
        var maxColumn = websheet.Constant.MaxColumnIndex;
    	var maxRow = parseInt(maxCellsNumber / maxColumn);
    	var _endRowIndex = endRowIndex;
    	var _useTwoSteps = false;
    	if(endRowIndex - startRowIndex > maxRow * 2)
    	{
    		// we are coping less than 1/2 of the whole rows out.
    		// copy what we need out first.
    		_endRowIndex = startRowIndex + maxRow - 1;
    		_useTwoSteps = true;
    	}
    
    	var isCopyAll = endRowIndex == this.editor.getMaxRow() && startRowIndex == 1;
    	
    	var rangeJson = helper.toRangeJSON(sheetName, startRowIndex, 1,
    			_endRowIndex, websheet.Constant.MaxColumnIndex, { forRow: true ,checkFilter:isFilter, forCopy:true, forCut: this._cutting});
    	
    	var filteredRowNum = rangeJson.filterRowNum || 0;
    	var refValue = websheet.Helper.getAddressByIndex(sheetName,startRowIndex,null,null,(_endRowIndex-filteredRowNum),null);
    	delete rangeJson.filterRowNum;
    	
    	var dvs = websheet.model.ModelHelper.getJSONByUsage(sheetName, startRowIndex, 1,
        		_endRowIndex, websheet.Constant.MaxColumnIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);

    	var data = {rows: rangeJson, dvs: dvs};
    	if(this._cutting){
    		data.cmts = websheet.model.ModelHelper.getJSONByUsage(sheetName, startRowIndex, 1,
            		_endRowIndex, websheet.Constant.MaxColumnIndex, websheet.Constant.RangeUsage.COMMENTS, true);
    	}
    	if(isCopyAll)
    	{
    		var colsJson = this._getAllColJson(sheetName);
			dojo.mixin(data, colsJson);
		}
    	var maxShowColIndex = helper.getMaxColIndex4Show(sheetName,startRowIndex,_endRowIndex);
    	var content = {data: data, filteredRowNum: filteredRowNum, refValue: refValue, refType: websheet.Constant.RowRange, maxShowColIndex : maxShowColIndex, _limited:_useTwoSteps};
    	
    	if(_useTwoSteps)
    	{
	    	var callback = dojo.hitch(this, function(data){
	    		// calculate all..
	    		setTimeout(dojo.hitch(this, function(){
	    			var rows = data.data.rows;
	    			var maxRowIndex = 1;
	    			if(rows)
	    			{
	    				for(var x in rows)
	    				{
	    					if(x !== "filterRowNum")
	    						maxRowIndex = Math.max(maxRowIndex, parseInt(x));
	    				}
	    			}
	    			
	    			maxRowIndex += data.filteredRowNum;
	    			
		    		var rangeJson = helper.toRangeJSON(sheetName, isCopyAll ? 1 : maxRowIndex, 1,
		        			endRowIndex, websheet.Constant.MaxColumnIndex, { forRow: true, checkFilter:isFilter, includeColumnStyle:!isCopyAll});
		    		
		    		var filterRowNum = isFilter ?  websheet.Utils.getFilterRowNum(sheetName, startRowIndex, endRowIndex) : 0;
		    		var refValue = websheet.Helper.getAddressByIndex(sheetName,startRowIndex,null,null,(endRowIndex-filterRowNum),null);
		    		
		    		if(!rows || isCopyAll)
		    			rows = rangeJson;
		    		else
		    		{
			    		for(var y in rangeJson)
			    		{
			    			// merge two step's results together.
			    			rows[y] = rangeJson[y];
			    		}
		    		}
		    		
		        	delete rows.filterRowNum;
		        	
		        	var rangeJSON = {rows: rows, dvs: data.data.dvs};
		        	if(isCopyAll)
		        	{
		        		var colsJson = this._getAllColJson(sheetName);
		    			dojo.mixin(rangeJSON, colsJson);
		    		}
		        	var maxShowColIndex = helper.getMaxColIndex4Show(sheetName,startRowIndex,endRowIndex);
		        	var content = {data: rangeJSON, refValue: refValue, refType: websheet.Constant.RowRange, maxShowColIndex : maxShowColIndex};
		        	content.sysclip = data.sysclip;
		        	content.sn = data.sn;
		        	setTimeout(dojo.hitch(this, function(){
		        		this._storage.setData(content);
		        	},0));
	    		}), 800);
	    	});
	    	
	    	this._onCopy(content, event, callback);
    	}
    	else
    	{
    		// copy all would not go here. it will use two - steps.
    		this._onCopy(content, event);
    	}
    },
    
    _getColumnRangeJson: function(sheetName, scIndex, ecIndex, bCheckFilter, bCheckMerge, forCopy)
    {
    	var mHelper = websheet.model.ModelHelper;
    	var maxRowIndex = websheet.Constant.MaxRowNum; //mHelper.getMaxRowIndex(sheet,scIndex,ecIndex);
    	var rowsJson = mHelper.toRangeJSON(sheetName,1,scIndex,maxRowIndex,ecIndex,{checkMerge:bCheckMerge,checkFilter:bCheckFilter,forCopy:forCopy, forCut: this._cutting /*,includeColumnStyle:true,forColumn:true*/});
    	delete rowsJson.filterRowNum;
    	var rangeJson = {};
    	if(rowsJson) rangeJson.rows = rowsJson;
    	var colsJson = mHelper.toColsJSON(sheetName,scIndex, ecIndex, {/*Only get columns json, exclude rows/meta*/bSet : true});
    	rangeJson.columns = colsJson;
    	var dvs = websheet.model.ModelHelper.getJSONByUsage(sheetName, 1, scIndex,
    			maxRowIndex, ecIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
    	rangeJson.dvs = dvs;
    	if(this._cutting){
    		var cmts = websheet.model.ModelHelper.getJSONByUsage(sheetName, 1, scIndex,
        			maxRowIndex, ecIndex, websheet.Constant.RangeUsage.COMMENTS, true);
    		rangeJson.cmts = cmts;
    	}
    	return rangeJson;
    },
    
    _copyColumn: function(event, sheetName, scIndex, ecIndex) {
    	if(this._cutting && websheet.Utils._checkMergedOrFilteredInColumn(sheetName, scIndex,ecIndex )){
    		if(this._cutDlg && this._cutDlg.dialog && this._cutDlg.dialog.open)
    		{
    			this.exitSelect();
    			return;
    		}
    		this._cutDlg = new concord.widgets.MessageBox(this, this._baseNLS.CUT_COLUMN, null, false, 
    				{message: this._baseNLS.CUT_COLUMN_WITH_MERGED_FILTERED_CELL});
    		this._cutDlg.show();
    		this.exitSelect();
    		return;	
    	}
    	if(scIndex == ecIndex &&  websheet.Utils.isLastHiddenCol(sheetName,scIndex))
    		return;
    	
    	var strSCIndex = websheet.Helper.getColChar(scIndex);
    	var strECIndex = websheet.Helper.getColChar(ecIndex);
    	var params = {refMask: websheet.Constant.COLS_MASK};
    	var refValue = websheet.Helper.getAddressByIndex(sheetName,null,strSCIndex,null,null,strECIndex,params);
    	var isFilter = this._cutting ? false : true;
    	var data = this._getColumnRangeJson(sheetName, scIndex,ecIndex, isFilter, true, true);
    	var content = {data: data, refValue: refValue, refType: websheet.Constant.Column};
    	this._onCopy(content, event);
    },
    
    _copyCell: function(event, sheetName, rowIndex, colIndex) {
    	var colName = websheet.Helper.getColChar(colIndex);
    	var refValue = websheet.Helper.getCellAddr(sheetName,rowIndex,colName);
    	var cellJson = this._getCellJson(sheetName, rowIndex, colIndex, true);
    	delete cellJson.rn;
    	var dvs = websheet.model.ModelHelper.getJSONByUsage(sheetName, rowIndex, colIndex,
        		rowIndex, colIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
    	var data = {cell: cellJson, dvs : dvs};
    	if(this._cutting){
    		data.cmts = websheet.model.ModelHelper.getJSONByUsage(sheetName, rowIndex, colIndex,
    				rowIndex, colIndex, websheet.Constant.RangeUsage.COMMENTS, true);
    	}
    	var content = {data: data, refValue: refValue, refType: websheet.Constant.Cell};
    	this._onCopy(content, event);
    },
    
    _copyRange: function(event, sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex) {
    	var isFilter = this._cutting ? false: true;
    	var startColName = websheet.Helper.getColChar(startColIndex);
    	var endColName = websheet.Helper.getColChar(endColIndex);
    	var rangeJson = websheet.model.ModelHelper.toRangeJSON(sheetName, startRowIndex, startColIndex,
    		endRowIndex, endColIndex,{checkFilter:isFilter,forCopy:true, forCut: this._cutting});
    	var filteredRowNum = rangeJson.filterRowNum || 0;
    	var refValue = websheet.Helper.getAddressByIndex(sheetName,startRowIndex,startColName,null,(endRowIndex-filteredRowNum),endColName);
    	delete rangeJson.filterRowNum;
    	
    	var dvs = websheet.model.ModelHelper.getJSONByUsage(sheetName, startRowIndex, startColIndex,
        		endRowIndex, endColIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
    	
    	var data = {rows: rangeJson, dvs : dvs};
    	if(this._cutting){
    		data.cmts = websheet.model.ModelHelper.getJSONByUsage(sheetName, startRowIndex, startColIndex,
            		endRowIndex, endColIndex, websheet.Constant.RangeUsage.COMMENTS, true);
    	}
    	var content = {data: data, refValue: refValue, refType: websheet.Constant.Range};
    	var callback = dojo.hitch(this, function(data){
    		this._storage.setData(data);
    	});
    	this._onCopy(content, event, callback);
    },
    
    _pasteFromInternalClipBoard: function(content)
    {
    	if(!content)
    	{
    		this.editor.scene.hideErrorMessage();
    		return;
    	}
    	var refType = content.refType;
    	var refValue = content.refValue;
    	var data = content.data;
    	if (refType == undefined || refValue == undefined || !data) {
    		this.editor.scene.hideErrorMessage();
    		return;
    	}
    	var grid = this.editor.getCurrentGrid();
    	var sheetName = grid.getSheetName();
		var selector = grid.selection.selector();
		var range = selector.getRangeInfo();
		var maxRow = this.editor.getMaxRow();
		// calculate rowIndex & colIndex
		
		websheet.parse.FormulaParseHelper.enableCache();

        var rowIndex = grid.selection.getFocusedRow() + 1;
        var colIndex = grid.selection.getFocusedCol();        
		var cbRef = websheet.Helper.parseRef(refValue);		
		var srcSheetName = cbRef.sheetName;
		
		var mHelper = websheet.model.ModelHelper;
        switch (refType) {
        case websheet.Constant.RowRange:
        case websheet.Constant.Row:
        	if (!data.rows) {
        		this.editor.scene.hideErrorMessage();
        		return;
        	}
        	
        	if (selector.selectingColumns())
        	{
        		var dlg = new concord.widgets.MessageBox(this, this._baseNLS.PASTE, null, false, 
						{message: this._baseNLS.not_match_space_in_sheet});
        		dlg.show();
        		this.editor.scene.hideErrorMessage();
        		return;
        	}
        	
        	if (selector.selectingRows()) {
        		// when clipboard is row, current selector is row, normalize focus to row start
        		rowIndex = range.startRow;
        		colIndex = 1;
        	}
        	
        	if (colIndex > 1) {
        		// paste row but not start with first column, error
				var dlg = new concord.widgets.MessageBox(this, this._baseNLS.PASTE, null, false, 
											{message: this._baseNLS.not_match_space_in_sheet});
				dlg.show();
				this.editor.scene.hideErrorMessage();
				return;
        	}
        	var endRowIndex = rowIndex + cbRef.endRow - cbRef.startRow;
        	
        	var selectEndRowIndex = range.endRow;
        	var rowsCount = cbRef.endRow - cbRef.startRow + 1;
        	
        	var remainRows = selectEndRowIndex - endRowIndex;
        	var times = Math.floor(remainRows / rowsCount);
        	if(times >= 0)
        	{
        		//if(times * rowsCount == remainRows)
        		endRowIndex = endRowIndex + times * rowsCount;
        	}
        	
          	if (endRowIndex > maxRow ) {
				var dlg = new concord.widgets.MessageBox(this, this._baseNLS.PASTE, null, false, 
											{message: this._baseNLS.not_enough_space_in_sheet});
				dlg.show();
				this.editor.scene.hideErrorMessage();
				return;
        	}
        	
          	if(mHelper.isRowProtected(sheetName, rowIndex, endRowIndex)){
        		this.editor.protectedWarningDlg();
        		this.editor.scene.hideErrorMessage();
        		return;
          	}
          	var addr = websheet.Helper.getAddressByIndex(sheetName,rowIndex,null,null,endRowIndex,null,{refMask:websheet.Constant.ROWS_MASK});
        	if(this.editor.isACLForbiddenArea(addr))
        		return;
        	
        	this._pasteRowRange(data, sheetName, rowIndex, endRowIndex, cbRef.startRow, cbRef.endRow, content.maxShowColIndex, srcSheetName);
        	break;
		case websheet.Constant.Column:
		case websheet.Constant.ColumnRange:	
        	if (!data.rows) {
        		this.editor.scene.hideErrorMessage();
        		return;	
        	}
        	if (selector.selectingRows())
        	{
        		if(!(range.startRow == 1 && range.endRow == maxRow))
        		{
        			var dlg = new concord.widgets.MessageBox(this, this._baseNLS.PASTE, null, false, 
							{message: this._baseNLS.not_match_space_in_sheet});
        			dlg.show();
        			this.editor.scene.hideErrorMessage();
        			return;
        		}
        		else
        		{
        			// select all
        			rowIndex = 1;
            		colIndex = 1;
        		}
        	}
        	var endColIndex = range.endCol;
        	if (selector.selectingColumns())
        	{
        		// when clipboard is column, current selector is column, normalize focus to column start
        		rowIndex = 1;
        		colIndex = range.startCol;
        	}
        	if (rowIndex > 1) {
        		// paste column but not start with first row, error
				var dlg = new concord.widgets.MessageBox(this, this._baseNLS.PASTE, null, false, 
											{message: this._baseNLS.not_match_space_in_sheet});
				dlg.show();
				this.editor.scene.hideErrorMessage();
				return;
        	}
        	
			var cbColIndex = cbRef.startCol;
			var cbEColIndex = cbRef.endCol;
			var colsCount = cbEColIndex - cbColIndex + 1;
			var endCol = colIndex + colsCount - 1;

			var remainCols = endColIndex - endCol;
			var times = Math.floor(remainCols / colsCount);
			if(times >= 0)
			{
				endCol = endCol + times * colsCount;
			}
    		
	      	if (endCol > websheet.Constant.MaxColumnIndex) {
				var dlg = new concord.widgets.MessageBox(this, this._baseNLS.PASTE, null, false, 
											{message: this._baseNLS.not_enough_space_in_sheet});
				dlg.show();
				this.editor.scene.hideErrorMessage();
				return;
        	}
	    	if(mHelper.isColumnProtected(sheetName,colIndex, endCol)){
        		this.editor.protectedWarningDlg();
        		this.editor.scene.hideErrorMessage();
        		return;
	    	}
	    	var addr = websheet.Helper.getAddressByIndex(sheetName,null,colIndex,null,null,endColIndex,{refMask:websheet.Constant.COLS_MASK});
	    	if(this.editor.isACLForbiddenArea(addr))
	    		return;

	    	this._pasteColumn(data, sheetName, colIndex, endCol, cbColIndex, cbEColIndex, srcSheetName);
			break;
        case websheet.Constant.Cell:   
        	if (!data.cell) {
        		this.editor.scene.hideErrorMessage();
        		return;
        	}
        	data = websheet.Helper.cloneJSON(data);
        	// TODO, rowSpan
        	cbRef.endRow = cbRef.startRow;
        	var cell = data.cell;
        	var colName = websheet.Helper.getColChar(cbRef.startCol);
        	data.rows = {};
        	data.rows[cbRef.startRow + ""] = {cells:{}};
        	data.rows[cbRef.startRow + ""].cells[colName] = cell;
        	var cbColIndex = cbRef.startCol;
        	var cbEndColIndex = cbColIndex;
        	var colspan = data.cell.cs;
        	if(colspan && colspan >1)
        	{
        		cbEndColIndex = cbColIndex + colspan - 1;
        	}
        	cbRef.endCol = cbEndColIndex;
        	delete data.cell;
        	// use Range for cell, no break here/
        case websheet.Constant.Range:
            //paste image
            if(data.img){
            	if(mHelper.isSheetProtected()){
            		this.editor.protectedWarningDlg();
            		this.editor.scene.hideErrorMessage();
            		return;
            	}
            	var src = data.img.href;
            	var absSrc = data.img.absHref;
            	if(src && absSrc)
            	{
            		var imageHdl = this.editor.getImageHdl();
	            	var index = absSrc.indexOf(src);
	            	if(index > 0)
	            	{
		            	var prefix = absSrc.substring(0, index);
		            	var location = window.location.href;
		            	// TODO, https? 
		            	if(location.indexOf(prefix) != 0)
		            	{
		            		//  comes from another spreadsheet file
		            		var serverUrl = this.editor.urlUploaderUrl;
		            	    src = this.uploadURLReqSync(serverUrl, absSrc);
		            	}
		            	if(src)
		            		imageHdl.insertImage(src, data.img, {srcRefValue: refValue, srcRangeId: content.srcRangeId});
	            	}
            	}
// Disable shape pasting
//            	var svg = data.img.svg;
//            	if (svg) {
//            		var shapeHdl = this.editor.getShapeHdl();
//            		shapeHdl.insertShape(data.img, {srcRefValue: refValue, srcRangeId: content.srcRangeId});
//            	}
            	return;
            }
            //paste chart
            if(data.chart){
            	if(mHelper.isSheetProtected()){
            		this.editor.protectedWarningDlg();
            		this.editor.scene.hideErrorMessage();
            		return;
            	}
            	var json = data.chart;
            	var uri = this.editor.scene.getDocBean().getUri();
            	var chartHdl = this.editor.getChartHdl();
            	//if(json.uri && json.uri != uri){
            		//comes from another spreadsheet file, remove ref
            		var chartJson = this._generateChartJsonForCopyPaste(json, uri);
            		json.chart = chartJson;
            	//}
            	chartHdl.insertChart(json);
				return;
            }
        	if (!data.rows) {
        		this.editor.scene.hideErrorMessage();
        		return;
        	}
        	
        	if (selector.selectingRows()) {
        		rowIndex = range.startRow;
        		colIndex = 1;
        	}
        	
        	else if (selector.selectingColumns())
        	{
        		colIndex = range.startCol;
        		rowIndex = 1;
        	}
        	else
        	{
        		rowIndex = range.startRow;
        		colIndex = range.startCol;
        	}
        	
        	var cbStartColIndex = cbRef.startCol;
        	var cbEndColIndex = cbRef.endCol;
        	var cbStartRowIndex = cbRef.startRow;
        	var cbEndRowIndex = cbRef.endRow;
        	var endRowIndex = rowIndex + cbEndRowIndex - cbStartRowIndex;
        	var endColIndex = colIndex + cbEndColIndex - cbStartColIndex;
        	
        	if (endRowIndex > maxRow || endColIndex > websheet.Constant.MaxColumnIndex) {
				var dlg = new concord.widgets.MessageBox(this, this._baseNLS.PASTE, null, false, 
											{message: this._baseNLS.not_enough_space_in_sheet});
				dlg.show();
				this.editor.scene.hideErrorMessage();
				return;
        	}
        	
        	var selectStartRowIndex = rowIndex;
        	var selectStartColIndex = colIndex;
        	
        	var selectEndRowIndex = range.endRow;
        	var selectEndColIndex = range.endCol;
        	
        	var rowsCount = cbEndRowIndex - cbStartRowIndex + 1;
        	var colsCount = cbEndColIndex - cbStartColIndex + 1;
        	
        	if(selectEndRowIndex < endRowIndex)
        	{
        		selectEndRowIndex = endRowIndex;
        	}
        	else
        	{
        		var remainRows = selectEndRowIndex - endRowIndex;
        		var times = Math.floor(remainRows / rowsCount);
        		if(times >= 0)
        		{
        			//if(times * rowsCount == remainRows)
        			selectEndRowIndex = endRowIndex + times * rowsCount;
        		}
        	}
        	if(selectEndColIndex < endColIndex)
        	{
        		selectEndColIndex = endColIndex;
        	}
        	else
        	{
        		var remainCols = selectEndColIndex - endColIndex;
        		var times = Math.floor(remainCols / colsCount);
        		if(times >= 0)
        		{
        			selectEndColIndex = endColIndex + times * colsCount;
        		}
        	}
        	if(mHelper.isRangeProtected(sheetName, rowIndex, endRowIndex, colIndex, endColIndex)){
        		this.editor.protectedWarningDlg();
        		this.editor.scene.hideErrorMessage();
        		return;
        	}
        	var addr = websheet.Helper.getAddressByIndex(sheetName,rowIndex,colIndex,null,selectEndRowIndex,selectEndColIndex,{refMask:websheet.Constant.RANGE_MASK});
        	if(this.editor.isACLForbiddenArea(addr))
        		return;
        	
        	this._pasteRange(data, sheetName, rowIndex, selectEndRowIndex, colIndex, selectEndColIndex, cbStartRowIndex, cbStartColIndex, cbEndRowIndex, cbEndColIndex, srcSheetName);
        	break;
        default:
        	this.editor.scene.hideErrorMessage();
        	break;
        }  
//        this.controller._checkFreezeConflict();
    },
    
    uploadURLReqSync: function(serverUrl, srcImgUrl){
    	if(serverUrl != null && srcImgUrl !=null){
  			var servletUrl = serverUrl;
		    var newURi;
  			var obj = {};
  			obj.uri = srcImgUrl;
  			var sData = dojo.toJson(obj);
  			dojo.xhrPost({
  				url: servletUrl,
  				handleAs: "json",
  				load: function(r, io) {
  					newURi  = r.uri;  					
  				},
  				error: function(error,io) {
  					console.log('An error occurred:' + error);
  				},
  				sync: true,
  				contentType: "text/plain",
  				postData: sData
  			});
  			return newURi;
    	}
    },
    
    _pasteCallback: function (result, srcSheetName) {
    	this.editor.resumeGridUpdate();
    	var clearClipboard = true;
    	if(!this._cutting){
    		var grid = this.editor.getCurrentGrid();
    		var sheetName = grid.sheetname;
    		if(srcSheetName != sheetName)
    			clearClipboard = false;
    		else if(this._selecting && this._cutRect){
    			var cutRectRange = this._cutRect.getRangeInfo();
    			var srIndexCut = cutRectRange.startRow;
    			var erIndexCut = cutRectRange.endRow;
    			var scIndexCut = cutRectRange.startCol;
    			var ecIndexCut = cutRectRange.endCol;

    			var cutRowCount = erIndexCut - srIndexCut + 1;
    			var cutColCount = ecIndexCut - scIndexCut + 1;
    			
    			var range = grid.selection.select().getRangeInfo();

    			var srIndexSelect = range.startRow;
    			var erIndexSelect = range.startRow + cutRowCount - 1;
    			var scIndexSelect = range.startCol;
    			var ecIndexSelect = range.startCol + cutColCount - 1;

    			//copy region and paste region with no intersection
    			if(erIndexSelect < srIndexCut || srIndexSelect > erIndexCut || ecIndexSelect < scIndexCut || scIndexSelect > ecIndexCut)
    				clearClipboard = false;
    		}
    	}

    	if (result)
    		this.editor.sendMessage(result.event, result.reverse,  this._cutting ? {"atomic": true} : null);
    	    	
    	//copy region and paste region has intersection
    	if(this._cutting || clearClipboard){
    		this.exitSelect(true);
    	}
    	websheet.parse.FormulaParseHelper.disableCache();
    	
    	this.editor.scene.hideErrorMessage();
    	
    	// check focus just after paste done.
    	this.editor.getTaskMan().addTask(this, "_checkFocus", [], null, false, 0, function (newTask, taskInQueue) {
			if (newTask.task == taskInQueue.task) {
				return -1; // remove the old task in queue, keep the new task;
			}
		});
    },
    
    _checkFocus: function()
    {
    	var sheetName = this.editor.getCurrentGrid().getSheetName();
    	var grid = this.editor.getController().getGrid(sheetName);
    	if(!grid._focusWithInGrid())
    		this.editor.focus2Grid();
    },
   
    _pasteColumn: function(data, sheetName, colIndex, endCol, cbColIndex, cbEColIndex, srcSheetName) {
    	if(colIndex == endCol && websheet.Utils.isLastHiddenCol(sheetName,colIndex))
    		return;
    	var params = {data: data, sheetName: sheetName, 
			     startColIndex:colIndex, endColIndex: endCol, 
			     cbStartColIndex: cbColIndex,  cbEndColIndex: cbEColIndex, srcSheetName: srcSheetName};
    	this._transformRange(dojo.hitch(this, this._pasteColumnCallback), params, 1, null, colIndex, endCol, 1, null, cbColIndex, cbEColIndex, websheet.Constant.Column);
    },
    
    _pasteColumnCallbackSetEvent: function(params, origRangeJson)
    {
        var data = params.data;
    	var sheetName = params.sheetName;
    	var srcSheetName = params.srcSheetName;
    	var colIndex = params.startColIndex;
    	var endCol = params.endColIndex;
    	var pasteData = params.result;  
    	
    	var maxOrigRowIndex = this._getMaxIndex(origRangeJson.rows);
    	var maxCbRowIndex = this._getMaxIndex(data.rows);
    	var maxRowIndex = Math.max(maxOrigRowIndex, maxCbRowIndex);
    	params.maxRowIndex = maxRowIndex; 	
    	
    	var bRCmts = !!this._cutting ? true : false;
    	
    	var strSCol = websheet.Helper.getColChar(colIndex);
    	var strECol = websheet.Helper.getColChar(endCol);
    	var refValue=websheet.Helper.getAddressByIndex(sheetName,1 , strSCol,null,maxRowIndex,strECol);
    	var attrs = { rows: pasteData.rows, dvs: pasteData.dvs, cmts:pasteData.cmts, bR: true, bRCmts: bRCmts, bCol: true };
    	if(pasteData.columns)
    		attrs.columns = pasteData.columns;
    	if(data.extras)
	  		attrs.compactData = data;
    	var event = new websheet.event.SetUnnameRange(refValue, attrs);
    	
    	attrs = { rows: origRangeJson.rows, dvs: origRangeJson.dvs, cmts: origRangeJson.cmts, bR: true, bRCmts: bRCmts, bCol: true };
    	if(origRangeJson.columns)
    		attrs.columns = origRangeJson.columns;
    	var reverseContent = {};
    	if(origRangeJson.mergeCells)
    		reverseContent.mergeCells = origRangeJson.mergeCells;
    	var reverse = new websheet.event.Reverse(event, refValue, attrs,reverseContent);
    	var result = { event: event, reverse: reverse };
    	var tm = this.editor.getTaskMan();
    	if(this._cutting){
    		tm.addTask(this, "_pasteColumnCallbackSetEventCut", [params, result], tm.Priority.UserOperation);
    		tm.addTask(this, "_pasteColumnCallbackSetRange", [params, result], tm.Priority.UserOperation);
    	}
    	else
    	{
    		tm.addTask(this, "_pasteColumnCallbackSetRange", [params, result], tm.Priority.UserOperation);
    	}
    	tm.start();
    },
    
    _pasteColumnCallbackSetEventCut: function(params, result)
    {
    	var data = params.data;
    	var sheetName = params.sheetName;
    	var srcSheetName = params.srcSheetName;
    	var colIndex = params.startColIndex;
    	var cbColIndex = params.cbStartColIndex;
    	var cbEColIndex = params.cbEndColIndex;
    	var pasteData = params.result;  
    	var maxRowIndex = params.maxRowIndex; 	
    	
    	var cbColName = websheet.Helper.getColChar(cbColIndex);
		var refValueSrc = websheet.Helper.getAddressByIndex(srcSheetName, 1, cbColName, null, maxRowIndex, cbEColIndex);
		attrs = { rows: {}, bR: true, bCol:true, bCut: true, bRCmts: true};
		var eventClear = new websheet.event.SetUnnameRange(refValueSrc, attrs);
		var eventPaste = result.event.getMessage().updates[0];
		eventPaste.data.bCutPaste = true;
		result.event.getMessage().updates.forEach(function(v){eventClear.getMessage().updates.push(v);});
		result.event = eventClear;
		
		var cutColsJson = this._getColumnRangeJson(srcSheetName, cbColIndex, cbEColIndex);//websheet.model.ModelHelper.toRangeJSON(srcSheetName, 1, cbColIndex, maxRowIndex, cbEColIndex);
		cutColsJson.bR = true;
		cutColsJson.bCol = true;
		cutColsJson.bRCmts = true;
		this._toJSON4Msg(cutColsJson.dvs, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
		this._toJSON4Msg(cutColsJson.cmts, websheet.Constant.RangeUsage.COMMENTS, "", true);
		var eventReverse = new websheet.event.SetUnnameRange(refValueSrc, cutColsJson);
		eventReverse.getMessage().updates.forEach(function(v){result.reverse.getMessage().updates.push(v);});
		
		var colDelta = colIndex - cbColIndex;
		var sheetDelta = sheetName != srcSheetName ? sheetName : null;
		var doc = this.editor.getDocumentObj();
		doc.clearCutUpdateCell();
		this.controller.cutCols(srcSheetName, maxRowIndex, cbColIndex, cbEColIndex,{rowDelta:0, colDelta:colDelta, sheetDelta:sheetDelta});
		this._updatePasteData(pasteData, doc);
		this._collectCutUpdates(result);
		this.editor.suspendGridUpdate();
    },
    
    _pasteColumnCallbackSetRange: function(params, result)
    {
    	var sheetName = params.sheetName;
    	var colIndex = params.startColIndex;
    	var endCol = params.endColIndex;
    	var pasteData = params.result;  
    	var maxRowIndex = params.maxRowIndex;
    	var srcSheetName = params.srcSheetName;

    	var nextCallback = dojo.hitch(this, this._pasteCallback, result, srcSheetName);
    	var rangesJson = pasteData.dvs;
    	if(!!pasteData.cmts)
    			rangesJson = !!rangesJson ? rangesJson.concat(pasteData.cmts) : pasteData.cmts;
       	var callback = dojo.hitch(this.editor, this.editor.addRangesByJSON, rangesJson, nextCallback);
    	this.controller.asyncSetRange(sheetName, 1, maxRowIndex, colIndex, endCol, pasteData, {forColumn:true, bRCmts:!!this._cutting, callback: callback });
//    	this._pasteCallback(result, srcSheetName);
    },
    
    _pasteColumnCallback: function(params) {
    	var data = params.data;
    	var sheetName = params.sheetName;
    	var scIndex = params.startColIndex;
    	var ecIndex = params.endColIndex;
    	
    	var origRangeJson = this._getColumnRangeJson(sheetName, scIndex, ecIndex,false, false, false);
    	this._toJSON4Msg(origRangeJson.dvs, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
    	this._toJSON4Msg(origRangeJson.cmts, websheet.Constant.RangeUsage.COMMENTS, "", true);
        var range = {};
		range.sheetName = sheetName;
		range.startRow = 1;
		range.startCol = scIndex;
		range.endRow = this.editor.getMaxRow();
		range.endCol = ecIndex;
		var expandRange = websheet.Utils.getExpandRangeInfo(range);
		if(expandRange.startCol != scIndex || expandRange.endCol != ecIndex)
		{
			var mergeCellInfo = websheet.Utils.getMergeCellInfo(sheetName,1,range.endRow,expandRange.startCol, expandRange.endCol);
			origRangeJson.mergeCells = mergeCellInfo;
		}	
    	var tm = this.editor.getTaskMan();
    	tm.addTask(this.editor.scene, "showWarningMessage", [this.editor.scene.nls.browserWorkingMsg], tm.Priority.UserOperation);
    	tm.addTask(this, "_pasteColumnCallbackSetEvent", [params, origRangeJson], tm.Priority.UserOperation);
    	tm.start();
    },
    
    _pasteRowRange: function(data, sheetName, startRowIndex, endRowIndex, cbStartRowIndex, cbEndRowIndex, maxShowColIndex, srcSheetName) {
    	var params = {data: data, sheetName: sheetName, startRowIndex: startRowIndex, endRowIndex: endRowIndex, cbEndRowIndex: cbEndRowIndex,
    				 cbStartRowIndex: cbStartRowIndex, maxShowColIndex: maxShowColIndex, srcSheetName: srcSheetName};
    	this._transformRange(dojo.hitch(this, this._pasteRowRangeCallback), params, startRowIndex, endRowIndex, 1, null, cbStartRowIndex, cbEndRowIndex, 1, null, websheet.Constant.Row);
    },
    
    _pasteRowRangeCallback: function(params) {
    	if (params.cbEndRowIndex - params.cbStartRowIndex > websheet.Constant.THRESHOLD_ASYNC_SET_RANGE / params.maxShowColIndex) {
    		// only show working message if pasted range is larger than threshold
    		this.editor.scene.showWarningMessage(this.editor.scene.nls.browserWorkingMsg, 0);
    	}
    	
    	var data = params.data;
    	var sheetName = params.sheetName;
    	var startRowIndex = params.startRowIndex;
    	var endRowIndex = params.endRowIndex;
    	var pasteData = params.result;
    	var srcSheetName = params.srcSheetName;
    	var maxRow = this.editor.getMaxRow();

    	var maxColIndex = websheet.Constant.MaxColumnIndex;
    	
    	// has column attributes, then, it is paste all.
    	var isPasteAll = data.columns ? true: false;
    	
    	if(this._cutting && (srcSheetName != sheetName)){
			for(var rowIndex in pasteData.rows){
				var row = pasteData.rows[rowIndex];
				if(row.visibility == "filter")
					delete row.visibility;
			}
    	}
    	
    	var maxColName = websheet.Helper.getColChar(maxColIndex);
    	var refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, "A", null, endRowIndex, maxColName);
    	var bRCmts = !!this._cutting ? true : false;
    	var attrs = { rows: pasteData.rows, dvs: pasteData.dvs, cmts:pasteData.cmts, bR: true , bRCmts: bRCmts, bRow: true};
    	if(pasteData.columns)
    		attrs.columns = pasteData.columns;
    	if(data.extras)
	  		attrs.compactData = data;
       	
       	if(isPasteAll)
       		attrs.bCol = true;
       	
       	var refValue_reverse = refValue;
    	var event = new websheet.event.SetUnnameRange(refValue, attrs);
    	var origRowsJSON;
    	var oriDvs;
    	var reverseContent = {};
    	if(isPasteAll){
    		origRowsJSON = websheet.model.ModelHelper.toRangeJSON(sheetName, 1, 1, maxRow, maxColIndex, { forRow: true, includeColumnStyle:false} );
    		oriDvs = websheet.model.ModelHelper.getJSONByUsage(sheetName,  1, 1, maxRow, maxColIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
    	}
    	else {
    		origRowsJSON = websheet.model.ModelHelper.toRangeJSON(sheetName, startRowIndex, 1, endRowIndex, maxColIndex, { forRow: true, includeColumnStyle:true} );
    		var expandRange = websheet.Utils.getExpandRangeInfo({sheetName:sheetName, startRow:startRowIndex, startCol:1, endRow:endRowIndex, endCol:maxColIndex});
    		if(expandRange.startRow != startRowIndex || expandRange.endRow != endRowIndex)
    		{
    			var mergeCellInfo = websheet.Utils.getMergeCellInfo(sheetName,expandRange.startRow,expandRange.endRow,1, maxColIndex);
    			reverseContent.mergeCells = mergeCellInfo;
    		}
    		oriDvs = websheet.model.ModelHelper.getJSONByUsage(sheetName, startRowIndex, 1 , endRowIndex, maxColIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
    	}
    	this._toJSON4Msg(oriDvs, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
    	attrs = { rows: origRowsJSON, bR: true ,  bRCmts: bRCmts, bRow: true, dvs: oriDvs};
    	if(this._cutting){
    		var oriCmts;
    		if(isPasteAll)
    			oriCmts = websheet.model.ModelHelper.getJSONByUsage(sheetName,  1, 1, maxRow, maxColIndex, websheet.Constant.RangeUsage.COMMENTS, true);
    		else
    			oriCmts = websheet.model.ModelHelper.getJSONByUsage(sheetName,  startRowIndex, 1 , endRowIndex, maxColIndex, websheet.Constant.RangeUsage.COMMENTS, true);
    		this._toJSON4Msg(oriCmts, websheet.Constant.RangeUsage.COMMENTS, "", true);
    		attrs.cmts = oriCmts;
    	}
    	if(isPasteAll)
    	{
    		attrs.columns = this._getAllColJson(sheetName).columns;
           	attrs.bCol = true;
    	}
    	
    	if(isPasteAll)    	
    		refValue_reverse = websheet.Helper.getAddressByIndex(sheetName, 1, "A", null, maxRow, maxColName);
    	//TODO: mergeCells in undo event?
    	var reverse = new websheet.event.Reverse(event, refValue_reverse, attrs, reverseContent); 
    	var result = { event: event, reverse: reverse };
    	
        if(this._cutting){  
        	var cbStartRowIndex = params.cbStartRowIndex;
        	var cbEndRowIndex = cbStartRowIndex + (endRowIndex - startRowIndex);
    		//add a new clearrange main event when cut
        	
        	var params = {refMask: websheet.Constant.ROWS_MASK};
    		var refValueSrc = websheet.Helper.getAddressByIndex(srcSheetName, cbStartRowIndex, null, null, cbEndRowIndex, null, params);
    		attrs = {bCut: true};
    		if(cbStartRowIndex == 1 && cbEndRowIndex == maxRow)
    			attrs.bSheet = true;
    		var eventSrc = new websheet.event.ClearRow(refValueSrc, attrs); //delete row model but keep idmgr
    		var eventPaste = event.getMessage().updates[0];
    		eventPaste.data.bCutPaste = true;
    		event.getMessage().updates.forEach(function(v){eventSrc.getMessage().updates.push(v);});//must in this order, clean src and paste target(co-editing & redo)
    		result.event = eventSrc;
    		
    		//add a new setrange event to restore src row
    		refValueSrc = websheet.Helper.getAddressByIndex(srcSheetName, cbStartRowIndex,  "A", null, cbEndRowIndex, maxColName);//comment to make sure co-editing is right
    		//TODO: need enlarge range json
    		var bCutRowsJson = websheet.model.ModelHelper.toRangeJSON(srcSheetName, cbStartRowIndex, 1, cbEndRowIndex, maxColIndex, { forRow: true } );
    		var bCutDvs = websheet.model.ModelHelper.getJSONByUsage(srcSheetName, cbStartRowIndex, 1, cbEndRowIndex, maxColIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
    		this._toJSON4Msg(bCutDvs, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
    		var bCutCmts = websheet.model.ModelHelper.getJSONByUsage(srcSheetName, cbStartRowIndex, 1, cbEndRowIndex, maxColIndex, websheet.Constant.RangeUsage.COMMENTS, true);
    		this._toJSON4Msg(bCutCmts, websheet.Constant.RangeUsage.COMMENTS, "", true);
    		attrs = {rows: bCutRowsJson, dvs: bCutDvs, cmts: bCutCmts, bRCmts: true, bR: true, bRow: true};
    		if(isPasteAll)
        	{
    			attrs.columns = this._getAllColJson(srcSheetName).columns;
               	attrs.bCol = true;
        	}
    		var eventReverse = new websheet.event.SetUnnameRange(refValueSrc, attrs);
    		eventReverse.getMessage().updates.forEach(function(v){reverse.getMessage().updates.push(v);});
    		
    		var rowDelta = startRowIndex - cbStartRowIndex;
    		var sheetDelta = sheetName != srcSheetName ? sheetName : null;
    		var doc = this.editor.getDocumentObj();
    		doc.clearCutUpdateCell();
    		this.controller.clearRows(srcSheetName, cbStartRowIndex, cbEndRowIndex, true, {rowDelta:rowDelta, colDelta:0, sheetDelta:sheetDelta});
    		this._updatePasteData(pasteData, doc);
    		this._collectCutUpdates(result);
    	}	
    	
    	var nextCallback = dojo.hitch(this, this._pasteRowCallbackDone, result, sheetName, srcSheetName, startRowIndex, endRowIndex, maxColIndex, origRowsJSON, pasteData, params);
    	var rangesJson = pasteData.dvs;
    	if(!!pasteData.cmts)
    			rangesJson = !!rangesJson ? rangesJson.concat(pasteData.cmts) : pasteData.cmts;
    	var callback = dojo.hitch(this.editor, this.editor.addRangesByJSON, rangesJson, nextCallback);
    	this.controller.asyncSetRange(sheetName, startRowIndex, endRowIndex, 1, maxColIndex, pasteData, {forRow:true, bRCmts:bRCmts, forColumn:isPasteAll, callback: callback});
    },
    
    _pasteRowCallbackDone: function(result, sheetName, srcSheetName, startRowIndex, endRowIndex, maxColIndex, origRowsJSON, pasteData, params)
    {
    	this._pasteCallback(result, srcSheetName);
    },
    
	_pasteRange: function(data, sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, cbStartRowIndex, cbStartColIndex, cbEndRowIndex, cbEndColIndex, srcSheetName) {
		var params = {data: data, sheetName: sheetName, startRowIndex: startRowIndex, endRowIndex: endRowIndex, 
				     startColIndex:startColIndex, endColIndex: endColIndex, 
				     cbStartRowIndex: cbStartRowIndex, cbStartColIndex: cbStartColIndex, cbEndRowIndex: cbEndRowIndex, cbEndColIndex: cbEndColIndex, srcSheetName: srcSheetName};
		this._transformRange(dojo.hitch(this, this._pasteRangeCallback), params, startRowIndex, endRowIndex, startColIndex, endColIndex, cbStartRowIndex, cbEndRowIndex, cbStartColIndex, cbEndColIndex, websheet.Constant.Range);
	},
	
	_transformRange: function(callback, params, startRowIndex, endRowIndex, startColIndex, endColIndex, cbStartRowIndex, cbEndRowIndex, cbStartColIndex, cbEndColIndex, type)
	{
		var sheetName = params.sheetName;
		var data = params.data;
		var extras = {};
		extras.rowCount = cbEndRowIndex - cbStartRowIndex + 1;
		extras.colCount = cbEndColIndex - cbStartColIndex + 1;
		extras.rowDelta = startRowIndex - cbStartRowIndex;
		extras.colDelta = startColIndex - cbStartColIndex;
		extras.colRepeat = 1;
		extras.rowRepeat = 1;
		extras.sheetName = sheetName;
		
		var sr = this.controller.getGrid(sheetName).selection.selector();
		
		var rows = data.rows;
		var columns = data.columns;
		
		if(!this._cutting){//don't expand range when cut/paste
			if(type != websheet.Constant.Row)
			{
				var colTimes = (endColIndex - startColIndex + 1)/(cbEndColIndex - cbStartColIndex + 1);
				if(colTimes > 1)
				{
					extras.colRepeat = colTimes;
				}
			}
			
			if(type != websheet.Constant.Column)
			{
				var rowTimes = (endRowIndex - startRowIndex + 1)/(cbEndRowIndex - cbStartRowIndex + 1);
				if(rowTimes > 1)
				{
					extras.rowRepeat = rowTimes;
				}
			}
		}
		
		var cellsCount = 0;
		var fCellsCount = 0;
		if(data.rows)
		{
			for(var rowIndex in data.rows)
			{
				var row = data.rows[rowIndex];
				if(row.cells)
				{
					for(var colName in row.cells)
					{
						cellsCount ++;
						var cell = row.cells[colName];
						if (cell.v && websheet.parse.FormulaParseHelper.isFormula(cell.v)) 
							fCellsCount++;
					}
				}
			}
		}
		
		var isTooBig = extras.colRepeat * extras.rowRepeat > 1 && (cellsCount * extras.colRepeat * extras.rowRepeat > websheet.Constant.MaxCellsInPaste ||
				fCellsCount * extras.colRepeat * extras.rowRepeat > websheet.Constant.MaxFormulaCellsInPaste);
		if(isTooBig)
		{
			var dlg = new concord.widgets.MessageBox(this, this._baseNLS.PASTE, null, false, 
					{message: this._baseNLS.too_large_paste_data});
			dlg.show();
			this.editor.scene.hideErrorMessage();
			return;
		}
		
		delete data.extras;
		
		if(extras.colRepeat > 1 || extras.rowRepeat > 1)
		{
			data.extras = extras;
		}
		
		websheet.RangeDataHelper.transformData(data, extras, !this._cutting, callback, params);
		
		this._reviseSelectRect(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, type);
	},
		
	//Update the json to paste when cutpaste and the reference for formula is subset of cut.
	_updatePasteData: function(pasteData, doc){
		var rows = pasteData.rows;
		var updateCells = doc.getCutUpdateCell();
		for (var rowIndex in rows)
		{
			var row = rows[rowIndex];
			if (row.cells)
			{
				var cells = row.cells;
				for (var colName in cells)
				{
					var cell = cells[colName];
					if(cell.uId){
						if(updateCells[cell.uId]){
							var newAttr = updateCells[cell.uId];
							cell.v = newAttr.v;
							cell.tarr = newAttr.tarr;
						}
						delete cell.uId;
					}
				}
			}
		}
	},
	
	_collectCutUpdates: function(result){
		var event = result.event;
		var reverse = result.reverse;
		
		var eventUpdates = event.getMessage().updates;
		var reverseUpdates = reverse.getMessage().updates;
		
		var doc = this.editor.getDocumentObj();
		var areaMgr = doc.getAreaManager();
		
		var content = {};
		var undoCells = areaMgr.getCells4DeleteUndo();
		var parsedRef = websheet.Helper.parseRef(event.refValue);
		content.cells = websheet.Utils.getImpactCellsValue(parsedRef.sheetName,undoCells,websheet.Constant.Range, true);//also collect update formula value
		content.areas = areaMgr.getRanges4DeleteUndo();
		content.cRanges = areaMgr.getChartSequenceRefs4DeleteUndo();
		content.shareRanges = areaMgr.getSharedRefs4DeleteUndo();
		
		var areas = content.areas;
		if(areas){
			var nameAreas = areas[websheet.Constant.RangeUsage.NAME];
			if(nameAreas){
				for(var rId in nameAreas){
					var attrs = nameAreas[rId];
					var ref = attrs.parsedref.getAddress();
					var eventAttr = {rangeid:rId, usage:websheet.Constant.RangeUsage.NAME};
					var event = new websheet.event.SetRange(ref, eventAttr);
					var m = event.getMessage().updates[0];
					reverseUpdates.push(m);
					
					var newRef = attrs.range.getParsedRef().getAddress();
					var newEvent = new websheet.event.SetRange(newRef, eventAttr);
					var newM = newEvent.getMessage().updates[0];
					eventUpdates.push(newM);
				}
			}
		}

		var shareRanges = content.shareRanges;
		for(var id in shareRanges)
		{
			var attrs = shareRanges[id];
			var addr = attrs.refValue;
			var sharedRange = attrs.sharedRange;
			delete attrs.refValue;
			delete attrs.sharedRange;
			var event = new websheet.event.InsertUnnameRange(addr, attrs);
			var m = event.getMessage().updates[0];
			reverseUpdates.push(m);
			
			var newAttrs = sharedRange.getUndoInfo();
			delete newAttrs.refValue;
			delete newAttrs.sharedRange;
			var newEvent = new websheet.event.InsertUnnameRange(addr, newAttrs);
			var newM = newEvent.getMessage().updates[0];
			eventUpdates.push(newM);
		}
		
		var cells = content.cells;
		for(var addr in cells)
		{
			var attrs = cells[addr];
			var newv = attrs.newv;
			delete attrs.newv;
			var newtarr = attrs.newtarr;
			delete attrs.newtarr;
			var event = new websheet.event.SetCell(addr, attrs);
			var m = event.getMessage().updates[0];
			reverseUpdates.push(m);
			
			var newEvent = new websheet.event.SetCell(addr, {v:newv, tarr:newtarr});
			var newM = newEvent.getMessage().updates[0];
			eventUpdates.push(newM);
		}
		
		var cRanges = content.cRanges;
		var charts = {};
		for(var rId in cRanges){
			var attrs = cRanges[rId];
			var undoRef = attrs.parsedref.getAddress({hasSheetName: true});
			var eventRef = attrs.range.getParsedRef().getAddress({hasSheetName: true});
			var chartDataSeqList = attrs._chartDataSeqList;
			if(chartDataSeqList){
				var length = chartDataSeqList.length;
				for(var i = 0; i < length; i++){
					var chartDataSeq = chartDataSeqList[i];
					var role = chartDataSeq.getProperty("role");
					var chartId = chartDataSeq.getChartId();
					var chart = charts[chartId];
					if(chart==null)
						chart = charts[chartId] = {};
					
					var undoAddrlist = null;
					var eventAddrList = null;
					if(role=="cat")
					{
						var axis = chart["axis"];
						if(axis==null)
							axis = chart["axis"] = {};
						var axId = chartDataSeq._parent.id;
						if(axis[axId]==null)
							axis[axId] = {};
						if(axis[axId]["cat"]==null){
							axis[axId]["cat"] = {};
							undoAddrlist = axis[axId]["cat"].undo = chartDataSeq.getAddrsList();
							eventAddrList = axis[axId]["cat"].event = chartDataSeq.getAddrsList();
						}else{
							undoAddrlist = axis[axId]["cat"].undo;
							eventAddrList = axis[axId]["cat"].event;
						}
					}
					else
					{
						var series = chart["series"];
						if(series==null)
							series = chart["series"] = {};
						var serId = chartDataSeq._parent.seriesId;
						if(series[serId]==null)
							series[serId] = {};
						if(series[serId][role]==null){
							series[serId][role] = {};
							undoAddrlist = series[serId][role].undo = chartDataSeq.getAddrsList();
							eventAddrList = series[serId][role].event = chartDataSeq.getAddrsList();
						}else{
							undoAddrlist = series[serId][role].undo;
							eventAddrList = series[serId][role].event;
						}
					}
					var rList = chartDataSeq._refList;
					for(var j = 0; j< rList.length; j++)
					{
						if(rList[j] && rList[j].getId() == rId)
						{
							undoAddrlist[j] = undoRef;
							eventAddrList[j] = eventRef;
						}
					}
				}
			}
		}
		for(var chartId in charts)
		{
    		var chart = charts[chartId];
    		var undoSettings = {};
    		var eventSettings = {};
    		var axisMap = chart["axis"];
    		if(axisMap!=null){
    			undoSettings.axis = {};
    			eventSettings.axis = {};
    		}
    		for(var id in axisMap)
    		{
    			undoSettings.axis[id] = {};
    			eventSettings.axis[id] = {};
    			var axis = axisMap[id];
    			
    			var undoCatAddrs = axis["cat"].undo;
    			var ref = undoCatAddrs.join(",");
			    if(undoCatAddrs.length>1)
			         ref = "(" + ref + ")";
			    undoSettings.axis[id]["cat"] = {ref: ref};
			    
			    var eventCatAddrs = axis["cat"].event;
    			var ref = eventCatAddrs.join(",");
			    if(eventCatAddrs.length>1)
			         ref = "(" + ref + ")";
			    eventSettings.axis[id]["cat"] = {ref: ref};
    		}
    		var seriesMap = chart["series"];
    		var data = null;
    		if(seriesMap!=null){
    			undoSettings.series = {};
    			eventSettings.series = {};
    		}
    		for(var id in seriesMap)
    		{
    			undoSettings.series[id] = {}; 
    			eventSettings.series[id] = {};
    			var undoData = undoSettings.series[id].data = {};
    			var eventData = eventSettings.series[id].data = {};
    			var series = seriesMap[id];
    			for(var role in series)
    			{    
			     var undoRoleRefs = series[role].undo;
    			 var ref = undoRoleRefs.join(",");
			     if(undoRoleRefs.length>1)
			         ref = "(" + ref + ")";
			     undoData[role] = {ref: ref};
			     
			     var eventRoleRefs = series[role].event;
    			 var ref = eventRoleRefs.join(",");
			     if(eventRoleRefs.length>1)
			         ref = "(" + ref + ")";
			     eventData[role] = {ref: ref};
    			}
    		}
    		var attrs = {"chartId" : chartId , "settings" : settings};
    		var refValue = websheet.Utils.getRefValue4Chart(chartId);
    		var event = new websheet.event.SetChart(refValue, {"chartId" : chartId , "settings" : undoSettings});
			var m = event.getMessage().updates[0];
			reverseUpdates.push(m);
			
			var newEvent = new websheet.event.SetChart(refValue, {"chartId" : chartId , "settings" : eventSettings});
			var newM = newEvent.getMessage().updates[0];
			eventUpdates.push(newM);
		}
	},
	
	_pasteRangeCallback: function(params) {
		var data = params.data;
		var sheetName = params.sheetName;
		var startRowIndex = params.startRowIndex;
		var endRowIndex = params.endRowIndex;
		var startColIndex = params.startColIndex;
		var endColIndex = params.endColIndex;
		
		var startColName = websheet.Helper.getColChar(startColIndex);
		var endColName = websheet.Helper.getColChar(endColIndex);
		
		var pasteData = params.result;
        var ignoreFilteredRow = (params.cbStartRowIndex == params.cbEndRowIndex);
        
        var range = {};
		range.sheetName = sheetName;
		range.startRow = startRowIndex;
		range.startCol = startColIndex;
		range.endRow = endRowIndex;
		range.endCol = endColIndex;
		var expandRange = websheet.Utils.getExpandRangeInfo(range);
		var startColName1 = websheet.Helper.getColChar(expandRange.startCol);
		var endColName1 = websheet.Helper.getColChar(expandRange.endCol);
		
		var bRCmts = !!this._cutting ? true : false;
		
	  	var refValue = websheet.Helper.getAddressByIndex(sheetName, startRowIndex, startColName,null,endRowIndex,endColName);
	  	var attrs = { rows: pasteData.rows, dvs: pasteData.dvs, cmts: pasteData.cmts, bR: true, bRCmts: bRCmts, ignoreFilteredRow: ignoreFilteredRow};
	  	if(data.extras)
	  		attrs.compactData = data;
    	var event = new websheet.event.SetUnnameRange(refValue, attrs);
    	
  
		var forIncomingData = params && params.forIncomingData;
    	var origRowsJSON = params.toReload ? {} : websheet.model.ModelHelper.toRangeJSON(sheetName, expandRange.startRow, expandRange.startCol, expandRange.endRow, expandRange.endCol);
    	var oriDvs = websheet.model.ModelHelper.getJSONByUsage(sheetName, expandRange.startRow, expandRange.startCol, expandRange.endRow, expandRange.endCol, websheet.Constant.RangeUsage.DATA_VALIDATION);
    	this._toJSON4Msg(oriDvs, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
    	var oriCmts = null;
    	if(this._cutting){
    		oriCmts = websheet.model.ModelHelper.getJSONByUsage(sheetName, expandRange.startRow, expandRange.startCol, expandRange.endRow, expandRange.endCol, websheet.Constant.RangeUsage.COMMENTS, true);
    		this._toJSON4Msg(oriCmts, websheet.Constant.RangeUsage.COMMENTS, "", true);
    	}
    	var reverseContent = {};
    	if(expandRange.startCol != range.startCol || expandRange.endCol != range.endCol 
    			|| expandRange.startRow != range.startRow || expandRange.endRow != range.endRow)
		{
			var mergeCellInfo = websheet.Utils.getMergeCellInfo(sheetName,expandRange.startRow,expandRange.endRow,expandRange.startCol, expandRange.endCol);
			reverseContent.mergeCells = mergeCellInfo;
		}
    	var refValue1=websheet.Helper.getAddressByIndex(sheetName, startRowIndex, startColName1,null,endRowIndex,endColName1);
    	var reverse = new websheet.event.Reverse(event, refValue1, { rows: origRowsJSON, bR: true, bRCmts: bRCmts, dvs: oriDvs, cmts:oriCmts}, reverseContent);
    	
    	var result = { event: event, reverse: reverse };
    	
    	if(this._cutting){
    		
    		// put cut message ahead.
    		var cbSheetName = params.srcSheetName;
    		var cbStartRowIndex = params.cbStartRowIndex;
    		var cbEndRowIndex = params.cbEndRowIndex;
    		var cbStartColIndex = params.cbStartColIndex;
    		var cbEndColIndex = params.cbEndColIndex;
    		var cbStartColName = websheet.Helper.getColChar(cbStartColIndex);
    		var cbEndColName = websheet.Helper.getColChar(cbEndColIndex);
    		
    		var srcRefValue = websheet.Helper.getAddressByIndex(cbSheetName, cbStartRowIndex, cbStartColName, null, cbEndRowIndex, cbEndColName);
    		var parsedRef = websheet.Helper.parseRef(srcRefValue);
    		if(!!parsedRef){
    			var eventClear = new websheet.event.SetUnnameRange(srcRefValue, {rows: {}, bR: true, bCut: true, bRCmts: true});
    			event.getMessage().updates.forEach(function(v){eventClear.getMessage().updates.push(v);});
        		result.event = eventClear;
    		}
    		var eventPaste = event.getMessage().updates[0];
    		eventPaste.data.bCutPaste = true;
    		var doc = this.editor.getDocumentObj();
    		doc.clearCutUpdateCell();
    		
    		if(!!parsedRef){
	    		var bCutRangeJson = websheet.model.ModelHelper.toRangeJSON(cbSheetName, cbStartRowIndex, cbStartColIndex, cbEndRowIndex, cbEndColIndex);
	    		var bCutDvs = websheet.model.ModelHelper.getJSONByUsage(cbSheetName, cbStartRowIndex, cbStartColIndex, cbEndRowIndex, cbEndColIndex, websheet.Constant.RangeUsage.DATA_VALIDATION);
	    		this._toJSON4Msg(bCutDvs, websheet.Constant.RangeUsage.DATA_VALIDATION, "DV");
	    		var bCutCmts = websheet.model.ModelHelper.getJSONByUsage(cbSheetName, cbStartRowIndex, cbStartColIndex, cbEndRowIndex, cbEndColIndex, websheet.Constant.RangeUsage.COMMENTS, true);
	    		this._toJSON4Msg(bCutCmts, websheet.Constant.RangeUsage.COMMENTS, "", true);
	    		
	    		var eventReverse = new websheet.event.SetUnnameRange(srcRefValue, {rows: bCutRangeJson, dvs: bCutDvs, bRCmts: true, cmts: bCutCmts, bR: true});
	    		eventReverse.getMessage().updates.forEach(function(v){reverse.getMessage().updates.push(v);});
	    		var rowDelta = startRowIndex - cbStartRowIndex;
	    		var colDelta = startColIndex - cbStartColIndex;
	    		var sheetDelta = sheetName != cbSheetName ? sheetName : null;
	    		this.controller.cutRange(cbSheetName, cbStartRowIndex, cbStartColIndex, cbEndRowIndex, cbEndColIndex, {rowDelta:rowDelta, colDelta:colDelta, sheetDelta:sheetDelta});
    		}
    		this._updatePasteData(pasteData, doc);
    		this._collectCutUpdates(result);
    	}
    	var _bFillLargeRange = ((endRowIndex - startRowIndex + 1) * (endColIndex - startColIndex + 1) > websheet.Constant.THRESHOLD_ASYNC_SET_RANGE);
    	
    	var nextCallback = dojo.hitch(this, this._pasteRangeCallbackDone, result, this._cutting, sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, expandRange, origRowsJSON, pasteData, params);
    	var rangesJson = pasteData.dvs;
    	if(!!pasteData.cmts)
    			rangesJson = !!rangesJson ? rangesJson.concat(pasteData.cmts) : pasteData.cmts;
    	var callback = dojo.hitch(this.editor, this.editor.addRangesByJSON, rangesJson, nextCallback);
    	if(_bFillLargeRange)
    	{
    		if(params.toReload)
    		{
    			// not used by now.
	    		this.editor.sendMessage(result.event, result.reverse, this._cutting ? {"atomic": true} : null, false, true);
	    		
	    		this.editor.scene.session.forceSync();
	    		
	    		concord.net.Beater.beat(true);
	    		
	    		this.editor.scene.hideErrorMessage();
    			this.editor.scene.session.reload();	    	
	    		return;
    		}
    		var tm = this.editor.getTaskMan();
    		if(!forIncomingData)
    		{
    			tm.addTask(this.editor.scene, "showWarningMessage", [this.editor.scene.nls.browserWorkingMsg], tm.Priority.UserOperation);
    		}
    		tm.addTask(this.controller, "asyncSetRange", [sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex,  pasteData, {forReplace: !forIncomingData, bRCmts: bRCmts, callback: callback, ignoreFilteredRow: ignoreFilteredRow}], tm.Priority.UserOperation);
    		tm.start();
    	}
    	else
    	{
    		this.controller.setRange(sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex,  pasteData, {forReplace: !forIncomingData, bRCmts: bRCmts, ignoreFilteredRow: ignoreFilteredRow});
    		callback.apply(this);
    	}
    },
    
    _toJSON4Msg: function(oriJSON, usage, preId, hasRangeid)
    {
    	if(oriJSON){
    		for(var i = 0; i < oriJSON.length; i ++){
    			var json = oriJSON[i];
    			json.data = {data: json.data,
    					rangeid: hasRangeid ? json.rangeid : preId + dojox.uuid.generateRandomUuid(),
    					usage: usage};
    		}
    	}
    	return oriJSON;
    },
	
	_pasteRangeCallbackDone: function(result, cut, sheetName, startRowIndex, endRowIndex, startColIndex, endColIndex, expandRange, origRowsJSON, pasteData, params)
	{
		var forIncomingData = params && params.forIncomingData;
		if (forIncomingData)
		{
			var rows = websheet.model.ModelHelper.toRangeJSON(sheetName, startRowIndex, expandRange.startCol, endRowIndex, expandRange.endCol);
			var update = result.event.getMessage().updates[cut ? 1 : 0];
			// acutally, cut should be always false there.
			update.data.rows = rows;
			
			// recollect event for paste data, but here the event might be enlarged
			// so refValue also need update
			if((expandRange.startCol != startColIndex) || (expandRange.endCol != endColIndex) )
			{
				update.reference.refValue = websheet.Helper.getAddressByIndex(sheetName,startRowIndex,expandRange.startCol,null,endRowIndex,expandRange.endCol);
			}
		}
		var cbSheetName = params.srcSheetName;
    	this._pasteCallback(result, cbSheetName);
	},
	
	/*
	 * Parameter json should not be changed.
	 */
    _transformColName: function(json, columnIndexDelta) {
    	var o = {};
    	
		for (var colName in json) {
			var colIndex = websheet.Helper.getColNum(colName);
			var newColIndex = colIndex + columnIndexDelta;
			var newColName = websheet.Helper.getColChar(newColIndex);
			o[newColName] = json[colName];
		}
    	return o;
    },

    _getCellJson: function(sheetName, rowIndex, colIndex, forCopy) {
    	var cellJson = {};
    	var d = this.editor.getDocumentObj();
    	var cell = d.getCell(sheetName, rowIndex, colIndex, websheet.Constant.CellType.MIXED, /* follow style */ true);//_isCovered is not useful when copy/paste cell
    	if (cell) {
    		var params = {bStyle: true, bValue: true, bHasColStyle: true, forCopy: forCopy, forCut: this._cutting};
    		cellJson = websheet.model.ModelHelper.toCellJSON(cell, params); // return null for empty cell
       		if (!cellJson) cellJson = {};
    		else if(forCopy)
    		{
    			var styleId = null;
    		    var column = d.getColumn(sheetName, colIndex, true);
    		    if (column)
    		    	styleId = column._styleId;
    		    cellJson.model = cell;
    		    cellJson.showValue = cell.getShowValue(cell._styleId || styleId);
    		    if(cell.isFormula())
    		    	cellJson.cv = cell._calculatedValue;
    		}
    	} else {
    		var column = d.getColumn(sheetName, colIndex, true);
    		if (column) {
    			var colStyleCode = column.getStyle();
    			if (colStyleCode) {
    				cellJson.style = colStyleCode.toJSON();
    			}
    		}
    	}
    	return cellJson;
    },    
    
	_getMaxIndex: function(json) {
    	var max = 1;
    	for (var i in json) {
    		i = parseInt(i);
    		if (i > max) {
    			max = i;
    		}
    	}
    	max = (json[max] && json[max].rn) ? json[max].rn + max : max;
    	return max;
    }
});