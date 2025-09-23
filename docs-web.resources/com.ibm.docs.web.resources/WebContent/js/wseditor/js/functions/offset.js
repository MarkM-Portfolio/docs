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

dojo.provide("websheet.functions.offset");

dojo.declare("websheet.functions.offset", websheet.functions.FormulaBase, {

	constructor: function(){
		this.minNumOfArgs = 3;
		this.maxNumOfArgs = 5;
		this.inherited(arguments);
	},
	
	calc: function(context){
		//clear all the update tokens
		context.currentToken.removeAllUpdateRefToken(context.currentCell);
		var cValue;
		var values = this.args;
		var length = values.length;
		var v0 = values[0];
		
		if(v0.getError())
			throw v0.getError();
				
		var v1 = this.analyzeToken(v0);
		if (dojo.isArray(v1)) {
			// first argument can't be constant-array
			var res = this.analyzeToken(v1[0]);
			if((v1.length == 1) && this.isRangeObj(res))
				v1 = res;
			else
				throw this.Constant.ERRORCODE["519"];
		}
		
		if(!this.isRangeObj(v1) || v1.is3DArea()){
			throw this.Constant.ERRORCODE["519"];
		}
		
		var rangeInfo = v1._getRangeInfo();
		var rowOffset = this._posCalc(rangeInfo.startRow, values[1], true);
		var colOffset = this._posCalc(rangeInfo.startCol, values[2], false);
		var startRow = rangeInfo.startRow + rowOffset;
		var heightOffset = this._posCalc(startRow, values[3], true, rangeInfo);
		var startCol = rangeInfo.startCol + colOffset;
		var widthOffset = this._posCalc(startCol, values[4], false, rangeInfo);
		cValue = this._getEndResult(context, rangeInfo, startRow, heightOffset, startCol, widthOffset);
		
		return cValue;
	},
	
	_getPreviousCalcValue:function(tokenList){
		var result = tokenList;
		var previous = result;
		while(this.Object.isToken(result)) {
			previous = result;
			result = result.getValue();
		}
		return previous;
	},
	
	/*
	 * For values[3] and values[4], refRangeInfo is required
	 */
	_posCalc: function(start, arg, bRow, refRangeInfo){
		var offset = 0;
		if(refRangeInfo){
			if(bRow)
				offset = refRangeInfo.endRow - refRangeInfo.startRow + 1;
			else
				offset = refRangeInfo.endCol - refRangeInfo.startCol + 1;
		}
		if(!arg){
			return offset;
		}
		var min, max;
		var type = arg.getType(); 
		var offset = this.fetchScalaResult(arg,true);
		if(type == this.tokenType.NONE_TOKEN)
			return offset;
		
		if(type == this.tokenType.NAME && arg._error ||type == this.tokenType.SINGLEQUOT_STRING)
			throw this.Constant.ERRORCODE["525"]; 
		else if(type == this.tokenType.DOUBLEQUOT_STRING){
			var parseResult = this.NumberRecognizer.parse(offset);
			if(parseResult.isNumber){
				offset = parseResult.fValue;
			}
			else if(!dojo.trim(offset)){
				throw this.Constant.ERRORCODE["519"];
			}
		}else
			offset = this.getValue(offset, type, this.LOCALE_NUM);
		
		if(refRangeInfo){
			if(offset > 0 && offset < 1)
				offset = -2;
		}
		
		offset = parseInt(offset);//Math.floor(offset);
		if(isNaN(offset))
			throw this.Constant.ERRORCODE["519"];
		min = 1;
		if(bRow)
			max = this.Constant.MaxRowNum;
		else
			max = this.Constant.MaxColumnIndex;
		
		if(offset == 0 && refRangeInfo){
			throw this.Constant.ERRORCODE["524"];
		}else if(offset > 0){
			var delt = offset;
			if(refRangeInfo)
				delt--;
			if(start + delt > max)
				throw this.Constant.ERRORCODE["524"];
		}else if(offset < 0){
			var delt = offset;
			if(refRangeInfo)
				delt++;
			if(start + delt < min)
				throw this.Constant.ERRORCODE["524"];
		}
		
		return offset;
	},
	
	_getEndResult: function(context, rangeInfo, startR, offsetR, startC, offsetC){
		var cValue;
		
		if(offsetR == 0 || offsetC == 0)
			return cValue;
		
		offsetR > 0 ? offsetR-- : offsetR++;
		offsetC > 0 ? offsetC-- : offsetC++;
		
		var startRow = offsetR >= 0 ? startR : startR + offsetR;
		var endRow = offsetR >= 0 ? startR + offsetR : startR;
		var startCol = offsetC >= 0 ? startC : startC + offsetC;
		var endCol = offsetC >= 0 ? startC + offsetC : startC;
		
		var bOutofRange = false;
		if(startRow < rangeInfo.startRow || endRow > rangeInfo.endRow 
				|| startCol < rangeInfo.startCol || endCol > rangeInfo.endCol)
			bOutofRange = true;
		
		var stName = rangeInfo.sheetName;
		var parsedRef = new websheet.parse.ParsedRef(stName, startRow, startCol, endRow, endCol, websheet.Constant.RANGE_MASK);
		var currentCell = context.currentCell;
		cValue = this.generateUpdateToken(context.currentToken, parsedRef, stName, currentCell);
		cValue.setProp(websheet.Constant.RefType.CAREPOSITION);
		if(bOutofRange && this.Object.JS)
		{
			var doc = currentCell._getDocument();
			var controller = doc.controller;
			if (controller) {
				var bPartial = controller.getPartial(stName);
				if (bPartial) {
					var row = currentCell.getRow();
					var col = currentCell.getCol();
					var parsedRef = new websheet.parse.ParsedRef(currentCell.getSheetName(),row, col, row, col, websheet.Constant.RANGE_MASK);
//					var range = new websheet.parse.Reference(parsedRef, "dummyId");
					controller._addNotify(parsedRef);
					throw websheet.Constant.ERRORCODE["2001"];
				}
			}
		}
		return cValue;
	}
});