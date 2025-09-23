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

dojo.provide("websheet.RangeDataHelper");
dojo.require("websheet.Helper");
dojo.require("websheet.Constant");
dojo.require("websheet.Cache");

websheet.RangeDataHelper = {

	isWorking: false,
		
	transformData: function (data, extras, transformFormula, callback, callbackData)
    {
    	var extras = extras || data.extras;
    	if (!extras)
    		return;
    	
    	var columns = data.columns;
    	var rows = data.rows;
    	
    	var colRepeat = extras.colRepeat || 1;
    	var colCount = extras.colCount || 0;
    	var colDelta = extras.colDelta || 0;
    	
    	var rowRepeat = extras.rowRepeat || 1;
    	var rowCount = extras.rowCount || 0;
    	var rowDelta = extras.rowDelta || 0;
    	
    	var newColumns = null;
    	var newRows = null;
    	var editor = websheet.model.ModelHelper.getEditor();
    	
    	if (rowCount * rowRepeat * colCount * colRepeat > websheet.Constant.THRESHOLD_ASYNC_SET_RANGE)
    	{
            this.isWorking = true;
            editor.scene.showWarningMessage(editor.scene.nls.browserWorkingMsg, 0);
    	}
    	
    	if (columns)
    	{
    		newColumns = {};
    		if (colDelta)
    		{
    			newColumns = {};
    		}
    		for (var colName in columns)
    		{
    			var column = columns[colName];
    			var colIndex = websheet.Helper.getColNum(colName);
    			var newColIndex = colIndex + colDelta;
    			var columnStr = JSON.stringify(column);
    			newColumns[websheet.Helper.getColChar(newColIndex)] = JSON.parse(columnStr);
    			for (var i = 1; i < colRepeat; i++)
    			{
    				var repeatedColIndex = newColIndex + colCount * i;
    				newColumns[websheet.Helper.getColChar(repeatedColIndex)] = JSON.parse(columnStr);
    			}
    		}
    	}
    	if (rows)
    	{
    		newRows = {};
    		for (var rowIndex in rows)
    		{
    			var row = rows[rowIndex];
    			var newRow = websheet.Helper.cloneJSON(row);
    			if(transformFormula)
    				newRow.off = rowDelta; // offset
    			newRowIndex = parseInt(rowIndex) + rowDelta;
    			newRows[newRowIndex + ""] = newRow;
    			if (row.cells)
    			{
    				var cells = row.cells;
    				var newCells = {};
    				newRow.cells = newCells;
    				for (var colName in cells)
    				{
    					var oldCell = cells[colName];
    					var oldCellStr = JSON.stringify(oldCell);
    					var newCell = JSON.parse(oldCellStr);
    					var colIndex = websheet.Helper.getColNum(colName);
    					var newColIndex = colIndex + colDelta;
    					if(transformFormula)
    						newCell.off = colDelta; // offset
    					newCells[websheet.Helper.getColChar(newColIndex)] = newCell;
    					for (var i = 1; i < colRepeat; i++)
    					{
    						var repeatedColIndex = newColIndex + colCount * i;
    						var newColName = websheet.Helper.getColChar(repeatedColIndex);
    						var newCell = JSON.parse(oldCellStr);
    						if(transformFormula)
    							newCell.off = colDelta + colCount * i; // offset
    						newCells[newColName] = newCell;
    					}
    				}
    			}
    			if(rowRepeat > 1)
    			{
    				var newRowStr = JSON.stringify(newRow);
    				for (var i = 1; i < rowRepeat; i++)
        			{
        				var repeatRowIndex = rowDelta + parseInt(rowIndex) + rowCount * i;
        				var repeatRow = JSON.parse(newRowStr);
        				if(transformFormula)
        					repeatRow.off = rowDelta + rowCount * i; // offset
        				newRows[repeatRowIndex] = repeatRow;
        			}
        		}
    		}
    	}
    	
    	var dvs = data.dvs;
    	var newDvs = null;
    	if(dvs){
    		newDvs = [];
    		var usage = websheet.Constant.RangeUsage.DATA_VALIDATION;
    		for(var i = 0; i < dvs.length; i ++){
    			var dv = dvs[i];
    			var ref= dv.refValue;
    			var dvJson = dv.data;
    			var parsedRef = websheet.Helper.parseRef(ref);
    			var oldDvStr = JSON.stringify(dvJson);
    			
    			//combine the data validation ranges.
    			var rRepeat = rowRepeat;
    			var cRepeat = colRepeat;
    			if(parsedRef.endRow - parsedRef.startRow + 1 == rowCount){
    				parsedRef.endRow = parsedRef.endRow + rowCount * (rowRepeat - 1);
    				rRepeat = 1;
    			}
    			if(parsedRef.endCol - parsedRef.startCol + 1 == colCount){
    				parsedRef.endCol = parsedRef.endCol + colCount * (colRepeat - 1);
    				cRepeat = 1;
    			}
    			
    			//one template dv as parent of others.
    			var sr = parsedRef.startRow + rowDelta;
				var sc = parsedRef.startCol + colDelta;
				var er = parsedRef.endRow + rowDelta;
				var ec = parsedRef.endCol + colDelta;
				var newRef = websheet.Helper.getAddressByIndex(extras.sheetName, sr, sc, null, er, ec, {refMask : websheet.Constant.RANGE_MASK });
				var newDv = JSON.parse(oldDvStr);
				var newData = {};
    			if(transformFormula){
    				newData.rowOff = rowDelta;
    				newData.colOff = colDelta;
    			}
    			newData.data = newDv;
    			var parentId = newData.rangeid = "DV" + dojox.uuid.generateRandomUuid();
    			newData.usage = usage;
    			newDvs.push({refValue: newRef, data: newData});

    			for(var j = 0; j < rRepeat; j ++){
    				var k = j == 0 ? 1 : 0;
    				while(k < cRepeat){
    					var sr = parsedRef.startRow + rowDelta + rowCount * j;
    					var sc = parsedRef.startCol + colDelta + colCount * k;
    					var er = parsedRef.endRow + rowDelta + rowCount * j;
    					var ec = parsedRef.endCol + colDelta + colCount * k;
    					var newRef = websheet.Helper.getAddressByIndex(extras.sheetName, sr, sc, null, er, ec, {refMask : websheet.Constant.RANGE_MASK });
    					var newDv = {parentId : parentId};
    					var newData = {};
    	    			newData.data = newDv;
    	    			newData.rangeid = "DV" + dojox.uuid.generateRandomUuid();
    	    			newData.usage = usage;
    	    			newDvs.push({refValue: newRef, data: newData});
    					k++;
    				}
    			}
    		}
    	}
    	
    	var cmts = data.cmts;
    	var newCmts = null;
    	if(cmts){
    		newCmts = [];
    		var usage = websheet.Constant.RangeUsage.COMMENTS;
    		for(var i = 0; i < cmts.length; i ++){
    			var cmt = cmts[i];
    			var ref= cmt.refValue;
    			var parsedRef = websheet.Helper.parseRef(ref);
    			var sr = parsedRef.startRow + rowDelta;
				var sc = parsedRef.startCol + colDelta;
				var er = parsedRef.endRow + rowDelta;
				var ec = parsedRef.endCol + colDelta;
				var newRef = websheet.Helper.getAddressByIndex(extras.sheetName, sr, sc, null, er, ec, {refMask : websheet.Constant.RANGE_MASK });
				newData = {rangeid: cmt.rangeid, usage: usage, data: cmt.data};
				newCmts.push({refValue: newRef, data: newData});
    		}
    	}
    	
    	if(transformFormula && newDvs)
    		this._transDataValidation(newDvs);

    	if(callbackData)
    	{
    		// create the message
    		callbackData.result = {};
    		if(newRows)
    			callbackData.result.rows = newRows;
    		if(newColumns)
    			callbackData.result.columns = newColumns;
    		if(newDvs)
    			callbackData.result.dvs = newDvs;
    		if(newCmts)
    			callbackData.result.cmts = newCmts;    		
    	}
    	else
    	{
    		// received message.
    		if(newRows)
    			data.rows = newRows;
    		if(newColumns)
    			data.columns = newColumns;
    		if(newDvs)
    			data.dvs = newDvs;
    		if(newCmts)
    			data.cmts = newCmts;
    	}
    	
    	var fCells = [];
    	if(transformFormula)
    	{
	    	if (newRows)
	    	{
	    		for (var rowIndex in newRows)
	    		{
	    			var row = newRows[rowIndex];
	    			var cells = newRows[rowIndex].cells;
	    			if (cells)
	    			{
	    				for (var colName in cells)
	    				{
	    					var cell = cells[colName];
	    					if (cell.v && (cell.off || row.off) && websheet.parse.FormulaParseHelper.isFormula(cell.v))
	    					{
	    						var item = {cell: cell, colDelta: cell.off || 0, rowDelta: row.off || 0};
	    						fCells.push(item);
	    					}
	    					delete cell.off;
	    				}
	    			}
	    			delete row.off;
	    		}
	    	}
    	}
    	
    	if(fCells.length > 0)
    	{
    		var tm = editor.getTaskMan();
    		tm.addTask(this, "_partialTransFormula", [fCells, callback, callbackData], tm.Priority.UserOperation);
    		tm.start();
    	}
    	else 
    	{	
        	if(this.isWorking)
        	{
        		if(!callbackData)
        			editor.scene.hideErrorMessage();
        		this.isWorking = false;
        	}
	    	if(callback)
	    	{
	    		callback(callbackData);
	    	}
    	}
    },

    _transDataValidation: function(datavalidations)
    {
    	var mhelper = websheet.model.ModelHelper;
    	var len = datavalidations.length;
    	var helper = websheet.Helper;
    	var valueType = websheet.Constant.valueType;
    	for(var i = 0; i < len; i ++){
    		var dv = datavalidations[i];
    		var item = dv.data;
    		var dvJson = item.data;
    		if(!dvJson.criteria)
    			continue;
    		if(helper.parseValue(dvJson.criteria.value1) == valueType.FORMULA){
    			var value1 = mhelper.transformFormulaString(dvJson.criteria.value1, item.rowOff, item.colOff);
    			dvJson.criteria.value1 = value1;
    		}
    		if(dvJson.criteria.value2 != undefined && helper.parseValue(dvJson.criteria.value2) == valueType.FORMULA){
    			var value2 = mhelper.transformFormulaString(dvJson.criteria.value2, item.rowOff, item.colOff);
    			dvJson.criteria.value2 = value2;
    		}
    		delete item.rowOff;
    		delete item.colOff;
    	}
    },
    
    _partialTransFormula: function (cells, callback, params, startIndex, parseCellCount)
    {
    	var mhelper = websheet.model.ModelHelper;
        var multiple = 1;
        var size = cells.length;
        var editor = mhelper.getEditor();
        var tm = editor.getTaskMan();

        if (!startIndex)
            startIndex = 0;

        var endIndex = startIndex + (parseCellCount || websheet.Constant.PartialParseCellCnt);
        if ((endIndex < startIndex) || (endIndex > size))
            endIndex = size;

        // console.info(startIndex + " : " + endIndex + " / " + size);
        try
        {
            var t = new Date();
            
            if (startIndex == 0 && endIndex < size)
            {
            	// we have another patch, please show working now.
                this.isWorking = true;
                editor.scene.showWarningMessage(editor.scene.nls.browserWorkingMsg, 0);
            }
            
            for (var i = startIndex; i < endIndex; i++)
            {
                var item = cells[i];
                mhelper.transformFormulaValue(item.cell, null, item.rowDelta, item.colDelta);
            }
            
            var time = new Date() - t;
            var count = endIndex - startIndex + 1;
            
            // 60000 cells at most in batch
            // 5 seconds at most in batch
            // 3 seconds at least in batch.
            var min_time = 3 * 1000;
            var max_time = 5 * 1000;
            var max_count = websheet.Constant.MaxTransformCells;

            if (endIndex < size)
            {
                if (time > max_time)
                    parseCellCount = parseInt((max_limit / time) * count);
                else if (time < min_time)
                    parseCellCount = parseInt((min_time / time) * count);
                
                parseCellCount = Math.min(parseCellCount, max_count);
                
                // console.info("used " + time + " and adjust to " + parseCellCount);

                tm.addTask(this, "_partialTransFormula", [cells, callback, params, endIndex, parseCellCount], tm.Priority.UserOperation);
                tm.start();
            }
            else
            {
            	if(this.isWorking)
            	{
            		if(!params)
            			editor.scene.hideErrorMessage();
            		this.isWorking = false;
            	}
                if (callback)
                    callback(params);
            }
        }
        catch (e)
        {
        	if(this.isWorking)
        	{
        		editor.scene.hideErrorMessage();
        		this.isWorking = false;
        	}
            console.log("client side partial transform formula error " + e ? e.message : "");
        }
    }
};
