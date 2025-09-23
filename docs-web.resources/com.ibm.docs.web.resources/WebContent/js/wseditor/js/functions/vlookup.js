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

dojo.provide("websheet.functions.vlookup");
dojo.declare("websheet.functions.vlookup", websheet.functions.FormulaBase, {
	
	bHLOOKUP: false,

	constructor: function() {
		this.minNumOfArgs = 3;
		this.maxNumOfArgs = 4;
	},
	
	calc: function(context) {
		//clear all the update tokens
		context.currentToken.removeAllUpdateRefToken(context.currentCell);
		
		var values = this.args;
		var firArg = values[0];

		var table_array = this._parseTableArray(values[1], context);
		var info = context.isArray ? this.getArrayInfo(table_array) : this.getArrayRowColSize(table_array);
		// set array information for array
		if (context.isArray) {
			context.info = {startRow:1,startCol:1,endRow:info.rowSize,endCol:info.colSize};
			table_array = info.array;
		} else {
			context.info = table_array._getRangeInfo();;
		}
		
		var para2 = this.fetchScalaResult(values[2],true);
		var pos = this.parseNumber(para2,this.LOCALE_NUM);
		pos = parseInt(pos);
		
		var range_lookup = 1;
		if(values.length == 4)
		{
			var para3 = this.fetchScalaResult(values[3],true);
			if(typeof para3 == "string"){
				range_lookup = this.toBoolean(para3);
			}
			else
				range_lookup = this.parseNumber(para3,this.LOCALE_NUM);
		}
		var firValue = this.analyzeToken(firArg);
		if (dojo.isArray(firValue) && !this.isRangeObj(firValue[0])) {
			return this._calcArrayValue(firValue, table_array, pos, range_lookup, context);
		} else {
			var criterion = this._parseCriterion(firArg);
			return this._calcSingleValue(criterion,table_array, pos, range_lookup, context);
		}
	},
	
	_calcSingleValue : function(criterion,table_array, pos, range_lookup, context) {
		var find_pos = this._lookup(criterion,table_array,pos, range_lookup, context);
		return this._getInArrayResult(table_array, find_pos, pos, context);
	},
	
	// if the first parameter is a const array
	_calcArrayValue : function(value, table_array, pos, range_lookup, context) {
		if (dojo.isArray(value)) {
			var array = [];
			if (!dojo.isArray(value[0]))
				value = [value];
			rowLen = value.length;
			colLen = value[0].length;
			for (var i = 0; i < rowLen; i++) {
				var row = [];
				for (var j = 0; j < colLen; j++) {
					try {
						row[j] = this._calcSingleValue(value[i][j], table_array, pos, range_lookup, context);
					} catch (err) {
						row[j] = err;
					}
				}
				array[i] = row;
			}
			// default value;
			if (value.defaultValue != undefined) {
				var defValue = value.defaultValue;
				var defRowLen = defValue.length;
				var defColLen = defValue[0].length;
				var defRes = [];
				for (var i = 0; i < defRowLen; i++) {
					var defRow = [];
					for (var j = 0; j < defColLen; j++) {
						try {
							defRow[j] = this._calcSingleValue(defValue[i][j], table_array, pos, range_lookup, context);
						} catch (err) {
							defRow[j] = err;
						}
					}
					defRes[i] = defRow;
				}
				array.defaultValue = defRes;
			}
			// row and column size of input
			if (value.rowSize && value.colSize) {
				array.rowSize = value.rowSize;
				array.colSize = value.colSize;
			}
			return array;
		}
	},
	
	_lookup: function(criterion,table_array,pos,range_lookup, context)
	{
		var info = context.info;
		var items = null;
		// get the data
		if(context.isArray){
			if(context.bHLOOKUP)
			{
				items = table_array[0];	
			}else{
				items = [];
				var rowSize = info.endRow - info.startRow + 1;
				var realRowSize = table_array.length;
				var defValue;
				if(table_array.defaultValue)
					defValue = table_array.defaultValue[0];
				for (var i = 0; i < rowSize; i++) {
					if (i < realRowSize)
						items.push(table_array[i][0]);
					else if (defValue) {
						// push the first default value into items, and set rowsize
						items.push(defValue[0]);
						items.rowSize = table_array.rowSize;
						break;
					}
				}
			}
		}else{
			var param = {bIgnoreError: true};
			if(context.bHLOOKUP) {
				var rows = this.getRows(table_array, param);
				items = rows[0];
			} else {
				var cols = this.getCols(table_array, param);
				items = cols[0];
			}
		}
		
		// match the data by criterion 
		var lookup_value = criterion;
		var find_pos = -1;
		if(range_lookup==0) // exact match
		{
			if(typeof lookup_value != "string")
			{
				for(var i=0;i<items.length;i++)
				{
					var value = this._getItemOrCellValue(items[i], context);
					if(value!=null && value===lookup_value)
					{
						find_pos = i;
						break;
					}
				}
			}
			else
			{
				var reg = null;
				if(lookup_value.length>0)
				{
					lookup_value = this.wildcardMapping(lookup_value);		
					reg = new RegExp("^" + lookup_value + "$","ig");
				}
				
				for(var i=0;i<items.length;i++)
				{
					var value = this._getItemOrCellValue(items[i], context);
					if(value==null)
						continue;
					
					if(typeof value != "string") // only match string
						continue;
					
					if(reg==null)
					{
						if(value.length==0)
						{
							find_pos = i;
							break;
						}
						else
							continue;
					}	
					
					if(reg.test(value))
					{
						find_pos = i;
						break;
					}
				}
			}
			// use default value, should set the max row size
			if (items.rowSize && (find_pos == items.length - 1))
				find_pos = items.rowSize - 1;
		} else {
			// approximite match
			// it assumes that the cells in the range is sorted.
			// find the first one (target) cell which value is bigger or equal than the value to be matched,
			// return this cell if its value is equal to the value,
			// otherwise return the previous cell which value is smaller than the value,
			// if target cell happens to be the first cell in the range, contine to find the second cell
			var value_type = typeof lookup_value;
			for(var i=0;i<items.length;i++)
			{
				var value = this._getItemOrCellValue(items[i], context);
				if(value==null)
					continue;
							
				if(typeof value != value_type)
					continue;
				
				var cmp_res = 0;
				if(value_type=="string")
				{
					var v1 = value.toLowerCase();
					var v2 = lookup_value.toLowerCase();
					cmp_res = v1.localeCompare(v2);
				}
				else
					cmp_res = value - lookup_value;
				
				if(cmp_res<=0)
				{
					find_pos = i; // continue to find the target cell
				} else if(i>0) {					
					break; // the target cell happens to the first cell, continue to find the second cell
				}
			}
			// use default value, should set the max row size
			if (items.rowSize && (find_pos == items.length - 1))
				find_pos = items.rowSize - 1;
		}
		
		if(!context.isArray){
			// add token for the first row/column of the range
			var x1,x2,y1,y2;
			if(context.bHLOOKUP)
			{
				x1 = info.startRow;
				y1 = info.startCol;
				x2 = x1;
				y2 = info.endCol;
			}
			else
			{
				x1 = info.startRow;
				y1 = info.startCol;
				x2 = info.endRow;
				y2 = y1;
			}
			var pRef = new websheet.parse.ParsedRef(info.sheetName, x1, y1, x2, y2, websheet.Constant.RANGE_MASK);
			this.generateUpdateToken(context.currentToken, pRef, info.sheetName, context.currentCell);
		}
		
		if(find_pos<0)
			throw websheet.Constant.ERRORCODE["7"];
		return find_pos;
	},
	_getInArrayResult: function(table_array, find_pos, pos, context){
		
		// check the postion
		if(pos < 1)
			throw websheet.Constant.ERRORCODE["519"]; //#VALUE
		var info = context.info;
		if(context.bHLOOKUP){
			var rowCnt = info.endRow - info.startRow + 1;
			if (pos > rowCnt)
				throw websheet.Constant.ERRORCODE["524"];				
		}else{
			var colCnt = info.endCol - info.startCol + 1;
			if(pos > colCnt)
				throw websheet.Constant.ERRORCODE["524"];
		}
		
		var col = null;
		var row = null;
		if(context.bHLOOKUP)
		{
			col = find_pos + context.info.startCol;
			row = pos + context.info.startRow - 1;
		}
		else
		{
			col = pos + context.info.startCol - 1;
			row = find_pos + context.info.startRow;
		}
		
		if(context.isArray){
			// unit/intersection/constArray
			var res;
			if (row <= table_array.length)
				res = table_array[row-1][col-1];
			else if (table_array.defaultValue)
				res = table_array.defaultValue[0][col-1];
			if (this.Object.isToken(res))
				res = res.getValue();
			return res;
		}else{
			var pRef = new websheet.parse.ParsedRef(info.sheetName, row, col, row, col, websheet.Constant.RANGE_MASK);
			return this.generateUpdateToken(context.currentToken, pRef, info.sheetName, context.currentCell);
			//because we should return the cell value rather than this updateToken, so here we can not set recalcType to ANCESTOR
			// because if this cell value is changed, we have to recalc vlookup to get the cell value
//			
//			var cell = table_array.getCell(row-context.info.startRow,col-context.info.startCol,true);
//			if(cell)
//			{
//				var cv = cell.getComputeValue();
//				if(cv==="" || cv==undefined)
//				{
//					var v = cell.getValue();
//					if(v==="" || cv==undefined)
//						cv = 0;
//				} else if(cell.isBoolean())
//					cv = Boolean(cv);
//				return cv;
//			}
//			
//			return 0;				
		}
	},
	_getItemOrCellValue: function(item, context)
	{
		var value = null;
		if (context.isArray) {
			value = item;
		} else if(item){
			var cell = item;
			value = cell.getComputeValue();
			if(cell.isBoolean())
				value = Boolean(value);
			else if(value==="" && cell.getValue()==="")
				value = null;
		}
		
		return value;
	},
	
	_parseCriterion: function(value){
		//UPDATE HERE: fetchScalaResult has the ability to throw errors even when it is not range, 
		//so remove code for explicitly throw error 
		/*
		//note, for fetchScalaResult, if values[0] is not range
		//it will not check token._error which is not correct
		//because token might be the tokenList for operation , such as Sheet1!A1 > Sheet1!B1
		//Sheet1!A1 might contain error which will make the tokenList for ">" operator has error
		*/
		var err=value.getError();
		if(err){
			this._throwError(err, value);
		}
		var criterion = this.fetchScalaResult(value, true);	
		if (criterion === null)
			return 0;
		if (criterion === "")
			return criterion;
		var criterionType = typeof criterion;
		if(criterionType != "number" && criterionType != "string" && criterionType != "boolean")
			throw  websheet.Constant.ERRORCODE["7"];//#N/A
		return criterion;
	},
	
	_parseTableArray: function(value, context){
		this._throwError(value.getError(), value);
		value.setProp(websheet.Constant.RefType.IGNORESET);
	
		context.isArray = false; // true means array formula, false means range.
		var result = this.analyzeToken(value);
		if (dojo.isArray(result)) {
			if (!this.isRangeObj(result[0])) {
				result = value.getValue();
				context.isArray = true;
			} else if (result.length == 1) {
				result = this.analyzeToken(result[0]);
			} else {
				throw websheet.Constant.ERRORCODE["519"]; //#VALUE
			}
		} else if(!this.isRangeObj(result)){
			result = [result];
			context.isArray = true;
		}
		
		return result;
	}
	
});