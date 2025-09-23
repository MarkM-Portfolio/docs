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

dojo.provide("websheet.functions.sumif");

dojo.declare("websheet.functions.sumif", [websheet.functions.sum, websheet.functions._countif], {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 3;
		this.privateAcc = false;
		this._summation = 0;
		this._count = 0;
	},
	
	/*int*/calc: function(context) {
		//clear all the update tokens
		context.currentToken.removeAllUpdateRefToken(context.currentCell);
		
		var values = this.args;
		var range = this.analyzeToken(values[0], true);
		range = this._getArrayRes(range);
		if(!this.isRangeObj(range))
			throw websheet.Constant.ERRORCODE["504"];
		
		this.hasThird = false;
		if(values[2])
		{
			this.hasThird = true;
			var range2 = this.analyzeToken(values[2], true);
			range2 = this._getArrayRes(range2);
			if(!this.isRangeObj(range2))
				throw websheet.Constant.ERRORCODE["504"];
		}

		context._summation = 0;
		context._count = 0;
		var satisfyCriteria = this.exec(context);
		
		if(!this.hasThird)
			return context._summation;
		
		var total = 0;
		if(!satisfyCriteria || satisfyCriteria.length === 0) {
			return total;
		}

		var rangeinfo =range._getRangeInfo();	
		var startRow = rangeinfo.startRow;
		var startCol = rangeinfo.startCol;
		var endRow = rangeinfo.endRow;
		var endCol = rangeinfo.endCol;
		
		var rowDelta = endRow - startRow;
		var colDelta = endCol - startCol;
		
		var rangeinfo2 = range2._getRangeInfo();
		var sheetName = rangeinfo2.sheetName;
		var startRow2 = rangeinfo2.startRow;
		var startCol2 = rangeinfo2.startCol;
		var endRow2 = rangeinfo2.endRow;
		var endCol2 = rangeinfo2.endCol;
		var curCell=context.currentCell;
		
		var targetRef;
		if (rowDelta == (endRow2 - startRow2) && colDelta == (endCol2 - startCol2)) {
			targetRef = range2;
		} else {
			var pRef = new websheet.parse.ParsedRef(sheetName, startRow2, startCol2, startRow2 + rowDelta, startCol2 + colDelta);
			var updateToken = this.generateUpdateToken(context.currentToken, pRef, sheetName, curCell);
			targetRef = updateToken.getValue();
		}
		total = this.calcTotal(context, targetRef, range, satisfyCriteria);
		return total;
	},
	
	/*int*/calcTotal: function(context, sumRange, baseRange, satisfyCriteria) 
	{
		context._count = 0;
		var rangeinfo = baseRange._getRangeInfo();	
		var startRow = rangeinfo.startRow;
		var startCol = rangeinfo.startCol;
		
		var rangeinfo2 = sumRange._getRangeInfo();
		var sheetName = rangeinfo2.sheetName;
		var startRow2 = rangeinfo2.startRow;
		var startCol2 = rangeinfo2.startCol;

		var targetRef = sumRange;
		var curCell = context.currentCell;
		
		var total = 0;
		var error;
		// create references for the cells which satisfy criteria and do calculation
		var bOptimized = true;
		if(this.Object.JS)
			bOptimized = false;//because need generate token for cell in target range
		var param = {bIgnoreError: true, bIgnoreUnParse: true, bIgnoreRecursive: true};
		var rows = this.getRows(targetRef, param, !bOptimized);
		for(var i=0;i<satisfyCriteria.length;i++)
		{
			var item = satisfyCriteria[i];
			var rowDelta = item.row - startRow;
			var colDelta = item.col - startCol;
			var rowSize = rowCount = colSize = 1;
			if(item.rowSize != undefined){
				rowSize = rowCount = item.rowSize;
				if(rowSize > rows.length)
					rowSize = rows.length;
			}
			if(item.colSize != undefined)
				colSize = item.colSize;
			for(var m = 0; m < rowSize; m++){
				var cells = rows[rowDelta + m];
				if(cells){
					for(var n = 0; n < colSize; n++){
						var cell = cells[colDelta + n];
						if (cell) {
							if(cell == context.currentCell)
								throw websheet.Constant.ERRORCODE["522"];
							
							if(!cell.isParsed || cell._isUnCalc || cell._isDirty)
								throw websheet.Constant.ERRORCODE["2001"];
							
							var err = cell.getError();
							if (err) {
								error = err;
							}
							
							if (cell.isNumber()) {
								total = websheet.Math.add(total, cell.getComputeValue());
								context._count++;
							}
						}
					}
				}
			}
			if(this.Object.JS){
				//generate token and add them into cell
				//cell might be null, so do not use cell.getCol/getRow
				var c = startCol2 + colDelta;
				var r = startRow2 + rowDelta;
				var parsedRef = new websheet.parse.ParsedRef(sheetName, r, c, r + rowCount-1, c + colSize - 1, websheet.Constant.RANGE_MASK);
				this.generateUpdateToken(context.currentToken, parsedRef, sheetName, curCell);
			}
		}

		if (error)
			throw error;
		return total;
	},
	
	processRes: function(cell, context)
	{
		if(cell!=null && cell.isNumber()){
			context._summation = websheet.Math.add(context._summation, cell.getComputeValue());
			context._count++;
		}
	},
	
	// just accept range as argument, but not constant-array
	_getArrayRes: function(range) {
		if(dojo.isArray(range)) {
			var res = this.analyzeToken(range[0]);
			if((range.length == 1) && this.isRangeObj(res))
				range = res;
			else
				throw websheet.Constant.ERRORCODE["519"];
		}
		return range;
	}
});