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
dojo.provide("websheet.datasource.ImportHelper");
dojo.require("websheet.Utils");
dojo.require("websheet.Constant");
dojo.declare("websheet.datasource.ImportHelper", null,{
	editor: null,
	
	constructor: function(editor)
	{
		// out of capacity flag
		this._bOOC = null;
		this.editor = editor;
	},
	
   	importData: function(inFromEdit,data)
   	{
   		var array = data.csvContent;
   		var len = array.length;
   		
   		var grid = this.editor.getCurrentGrid();
   		var sheetName = grid.getSheetName();
   		if(websheet.model.ModelHelper.isSheetProtected(sheetName)){
   			this.editor.scene.hideErrorMessage();
   			this.editor.protectedWarningDlg();
   			return false;
   		}
   		
   		var sRange = grid.selection.getFocusedCell();
   		var srIdx = sRange.focusRow + 1;
   		var scIdx = sRange.focusCol;
   		if (len == 0)
   		{
   			return false;
   		}
   		
   		// cut data into pieces, 80R as step, report ooc = true if rows or columns out of capacity
   		// create "formatRawValueInJson" task for each row pieces 
   		var rIdx = 0;
   		var tm = this.editor.getTaskMan();
   		var rangeJson = {};
   		var step = 80;
   		// row out of capacity, or column out of capacity
   		var rooc = cooc = false;
   		// end position in array of each piece
   		var pEnd;
   		var maxSheetRows = this.editor.getMaxRow();
   		var maxSheetColumns = websheet.Constant.MaxColumnIndex;
   		var maxColumnCount = 0;
   		while (!rooc && rIdx < len) {
   			if (sRange.focusRow + 1 + rIdx > maxSheetRows) {
   				// current start row segment ooc,
   				rooc = true;
   				// already ooc, start from this row, all other rows should be abandon
   				continue;
   			}
   			// else, create task for rows from [rIdx, rIdx + 80]
   			// pointer for current row piece end
   			pEnd = Math.min(len - 1, rIdx + step);
   			if (sRange.focusRow + 1 + pEnd > maxSheetRows) {
   				// piece end ooc
   				rooc = true;
   				// fix to end at maxSheetRows
   				pEnd = maxSheetRows - sRange.focusRow - 1;
   			}
   			if (!cooc) {
   				// get max column index, also, check if any column ooc
   				for (var i = rIdx; i <= pEnd; i++) {
   					if (array[i].length > maxColumnCount) {
   						maxColumnCount = array[i].length;
   					}
   				}
   				if (maxColumnCount + scIdx> maxSheetColumns) {
   					maxColumnCount = maxSheetColumns - scIdx;
   					cooc = true;
   				}
   			}
   			// format from rIdx ~ pEnd
   			tm.addTask(websheet.Utils, "formatRawValueInJson", [array, rangeJson, srIdx, scIdx, rIdx, pEnd], tm.Priority.UserOperation);
   			// next round start from pEnd + 1
   			rIdx = pEnd + 1;
   		}
   		
   		var addr = websheet.Helper.getAddressByIndex(sheetName,srIdx,scIdx,null,(srIdx + pEnd),(scIdx + maxColumnCount),{refMask:websheet.Constant.RANGE_MASK});
    	if(this.editor.isACLForbiddenArea(addr))
    	{
    		this.editor.scene.hideErrorMessage();
    		return false;
    	}

    	tm.addTask(this, "setRange",[sheetName, rangeJson, srIdx, srIdx + pEnd, scIdx, scIdx + maxColumnCount, inFromEdit], tm.Priority.UserOperation);
    	tm.start();
    	
    	this._bOOC = rooc || cooc;
    	return this._bOOC;
   	},
   	
   	setRange: function(sheetName,rangeJson,srIdx,mrIdx,scIdx,mcIdx,inFromEdit)
   	{
   		var controller = this.editor.getController();
   		var mlength = mrIdx - srIdx + 1;
   		var columns = mcIdx - scIdx + 1;
   		var rows = {rows: rangeJson, bR: true };
   		var origRowsJSON = websheet.model.ModelHelper.toRangeJSON(sheetName, srIdx, scIdx, mrIdx, mcIdx);
   		var _bLargeRange = (mlength * columns > websheet.Constant.THRESHOLD_ASYNC_SET_RANGE);
   		if(_bLargeRange)
   		{
   			controller.asyncSetRange(sheetName, srIdx, mrIdx, scIdx, mcIdx, rows, {
   				callback: dojo.hitch(this, function() {
   					if (!this._bOOC) {
   						// if is out of capacity, previously there is a warning message shown instead of working, don't hide it
   						this.editor.scene.hideErrorMessage();
   					}
   					this._postSetRange(sheetName, srIdx, scIdx, mrIdx, mcIdx, rows, origRowsJSON, inFromEdit);
   				})
   			});
   		}
   		else
   		{
   			controller.setRange(sheetName, srIdx, mrIdx, scIdx, mcIdx, rows);
			if (!this._bOOC) {
				// if is out of capacity, previously there is a warning message shown instead of working, don't hide it
				this.editor.scene.hideErrorMessage();
			}
			this._postSetRange(sheetName, srIdx, scIdx, mrIdx, mcIdx, rows, origRowsJSON, inFromEdit);
   		}
   	},
   	
   	_postSetRange: function(sheetName, srIdx, scIdx, mrIdx, mcIdx, rows, origRowsJSON, inFromEdit) {
   		var params = {refMask: websheet.Constant.RANGE_MASK};
   		var refValue = websheet.Helper.getAddressByIndex(sheetName,srIdx , scIdx,null,mrIdx,mcIdx,params);
   		var event = new websheet.event.SetUnnameRange(refValue, rows);
   		var reverse = null;
   		if(!inFromEdit)
		    reverse = new websheet.event.Reverse(event, refValue, {rows:origRowsJSON, bR:true});
   		var params = {"csvedit":true};
   		this.editor.sendMessage(event,reverse,inFromEdit?params:null);
		this.editor.execCommand(commandOperate.SAVEDRAFT);
   	}
});