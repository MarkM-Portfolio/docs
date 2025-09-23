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

dojo.provide("websheet.datasource.Exporter");

dojo.declare("websheet.datasource.Exporter",null,{
	editor: null,
	callback:null,
	csvContent:null,
	constructor: function(editor){
		this.csvContent = "";
		this.editor = editor;
	},
	
	exportSheet: function(sheetName, type, args, callback){
		// summary:
		//		Export required rows(fetchArgs) to a kind of format(type)
		//		using the corresponding writer with given arguments(writerArgs),
		//		then pass the exported text to a given function(onExported).
		// tags:
		//		public
		// type: string
		//		A registered export format name
		// args: object?
		//		includes:
		//		{
		//			fetchArgs: object?
		//				Any arguments for store.fetch
		//			writerArgs: object?
		//				Arguments for the given format writer
		//		}
		// callback: function(string)
		//		Call back function when export result is ready
		var separator = ",";
		if(dojo.isFunction(args)){
			callback = args;
			args = {};
		}
		else
		{
			separator = args.writerArgs.separator;
		}
		if(!dojo.isString(type) || !dojo.isFunction(callback)){
			return;
		}
		this.callback = callback;
		this._iterateSheetData(sheetName,separator);
	},
	
	checkCalcStatus: function(sheetName,rangeInfo,separator){
		var sceneNls = this.editor.scene.nls;
		var postCalc = dojo.hitch(this, "startExport", sheetName,rangeInfo,separator);
		
		var partialCalcMgr = this.editor.getPartialCalcManager();
		if(partialCalcMgr._isPartialCalcDone)
			this.editor.scene.showWarningMessage(sceneNls.browserWorkingMsg);
		var tm = this.editor.getTaskMan();
		tm.addTask(this.editor.getInstanseOfPCM(), "start", [rangeInfo,postCalc], tm.Priority.UserOperation);
		tm.start();
	},
	
	_iterateSheetData: function(sheetName,separator){
		var rangeInfo = {
    			startRow: 1,
    			startCol: 1,
    			endRow: this.editor.getMaxRow(),
    			endCol: websheet.Constant.MaxColumnIndex,
    			"sheetName": sheetName
    		};
		this.checkCalcStatus(sheetName,rangeInfo,separator);
	},
	
	startExport: function(sheetName,rangeInfo,separator){
		var tMgr = this.editor.getTaskMan();
		var maxCellNum = 10000;
		var taskLen = 0;
		var colsArray = websheet.model.ModelHelper.getCols(rangeInfo, true, true).data;
		var doc = this.editor.getDocumentObj();
		var sheet = doc.getSheet(sheetName);
		var rows = sheet.getRows();
		var startRow = -1;
		var endRow = -1;

		// get the index of last non-empty row
		// it can guarantee that isLastStep finally will become TRUE in the following iteration,
		// and _formatCSV will be executed.
		for (var index = rows.length - 1; index >= 0; --index) {
			var rowModel = rows[index];
			if (!rowModel) continue;
			
			var cells = rowModel._valueCells;
			if (cells.length > 0) {
				var bEmptyRow = true;
				for (var i = 0; i < cells.length; i++) {
					if (cells[i]) {
						bEmptyRow = false;
						break;
					}
				}
				
				if (!bEmptyRow) {
					endRow = rowModel.getIndex();
					break;
				}
			}
		}
		
		var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.OPTIMIZEVALUE);
		iter.iterate(dojo.hitch(this, function(cell, row, col) {
			if (startRow == -1) 
				startRow = row;
			var isLastStep = row == endRow;
			
			taskLen ++;
			if(taskLen > maxCellNum || isLastStep)
			{
				var info = {sheetName: sheetName, startRow: startRow, endRow: row, startCol: rangeInfo.startCol, endCol: rangeInfo.endCol};
				tMgr.addTask(this, "_formatCSV", [info,colsArray,isLastStep,separator], tMgr.Priority.UserOperation);
				tMgr.start();
				taskLen = 0;
				startRow = row + 1;
			}
			
			if (isLastStep)
				return false;
			
			return true;
		}));
		
		if (startRow == -1) {
			this.editor.scene.showWarningMessage(this.editor.scene.nls.csvEmpty, 5000);
			return null;
		}
		
		var sheetRowContent = {};
		sheetRowContent.sheetname = sheetName;
		sheetRowContent.content = this.csvContent;
		
		return sheetRowContent;
	},
	
	_formatCSV:function(rangeInfo,colsArray,isLastStep,separator)
	{
		var current = -1;
		var rowdata = "";
		var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.NORMAL);
		iter.iterate(dojo.hitch(this, function(obj, row, col) {
			var cell = obj && obj.cell, isCovered = obj && obj.isCovered;
			var styleCell = obj && obj.styleCell;
			if (current == -1)
				current = row;
			else if (current != row) {
				// iterate into new row
				current = row;
				var idx = rowdata.length - 1;
				for (; idx >= 0; idx--) {
					if(rowdata.charAt(idx) != separator)
						break;
				}
				rowdata = rowdata.substring(0, idx+2);				
				this.csvContent += rowdata + "\n";
				rowdata = "";
			}
			
			if ((!cell || cell.isNull()) || isCovered)
				rowdata += separator;
			else
			{
				var colModel = colsArray[col - rangeInfo.startCol];
				var styleId = styleCell ? styleCell._styleId : (colModel && colModel._styleId);
				var cv = cell.getShowValue(styleId);
				// escapeContent
				cv = cv + "";
				rowdata = this.escCnt(rowdata,cv,separator);
			}
			return true;
		}));

		var idx = rowdata.length - 1;
		for (; idx >= 0; idx--) {
			if(rowdata.charAt(idx) != separator)
				break;
		}
		rowdata = rowdata.substring(0, idx+2);
		this.csvContent += rowdata + "\n";

		if (isLastStep) {
			this.callback(this.csvContent);
		}
	},
	
	escCnt: function(rowdata,cv,separator)
	{
		// escapeContent
		if(cv.indexOf("\"")>=0){
		    cv = cv.replace(/"/g, "\"\"");
		}					

		if(cv.indexOf(separator) >=0 || cv.indexOf("\"") >=0  || cv.indexOf("\n") >=0)
			rowdata += '"' + cv + '"' + separator;
		else if(cv == "")
			rowdata +=  separator;
		else
			rowdata +=  cv  +  separator;
		return rowdata;
	}

});