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

dojo.provide("websheet.functions._math");
dojo.require("websheet.Helper");

dojo.declare("websheet.functions._math", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.privateAcc = true;
		this.minNumOfArgs = 1;
		this.maxNumOfArgs = 2;
		this.inherited(arguments);
	},
	
	calc: function(context) {
		//formula SUM(A1:B3+C1:D2) should check parameter
		var currentToken = context.currentToken;
		var type = currentToken.getName();
		var left = this.args[0];
		var right = this.args[1];
		var leftToken = left;
		var rightToken = right;
		this.bIgnoreError = false;
		var funcStack = context.funcStack;
		var size = funcStack.length;
		if(size > 0){
			var func = funcStack[size - 1];
			if(func){
				this.bIgnoreError = ((websheet.functions.Util.getErrPropByName(func.getName()) & websheet.Constant.CellErrProp.IGNORE_ERR) > 0);
			}
		} 
		var tokenList;		
		this._validateParameters(this.args);
		
		if(right == null){
			// for prefix operator, such as "+","-"
			if(type == "+")
				return left;
			if(type == "-"){
				rightToken = right = left;
				leftToken = left = null;
			}
		}
		if(type == ":"){
			//clear all the update tokens of join function token list
			context.currentToken.removeAllUpdateRefToken(context.currentCell);
			// check the left and right whether is cell token,bracket tokenlist and colon tokenlist
			var leftList = left.getReferenceToken();
			if (!leftList || leftList.length == 0) {
				var exception = left.getError() || websheet.Constant.ERRORCODE["519"]; //#VALUE
				throw exception;
			}
			var rightList = right.getReferenceToken();
			if (!rightList || rightList.length == 0) {
				var exception = right.getError() || websheet.Constant.ERRORCODE["510"]; //#VALUE
				throw exception;
			}
			
			var tokenList = leftList.concat(rightList);
			
			// conbine the left address and right address to a new correspond range
			return this._generateOneRefFromRefs(tokenList,context);
		} else if(type != "!" && type != "~" ) {
			var rangeExprArg = false;
			
			left = this._getTokenResult(left);
			right = this._getTokenResult(right);
			// range/array/range expression result
			if ((this.isRangeObj(left) && !left.isSingleCell()) || (this.isRangeObj(right) && !right.isSingleCell()))
				return this._calcRangeExpr(type, left, right, leftToken, rightToken, context);
			else if (dojo.isArray(left) || dojo.isArray(right))
				return this._calcRangesExpr(type, left, right, leftToken, rightToken, context);
				
			// 2 numbers or other cases, throw when result of union or intersection is multi-range 
			if (left && left.errorCode)
				throw left;
			else if(right && right.errorCode)
				throw right;
			var bUnParseErr = false;
			var unparseErr = websheet.Constant.ERRORCODE["2001"];
			try {
				left = this._checkMathParam(leftToken);
			} catch (e) {
				//catch the unparse error and do not throw immediately
				//because right might still unparsed and need put to partial calculate manager when do partial parse
				//rather than put to pcm when do partial calc which might slow down the calc process
				if(e == unparseErr)
					bUnParseErr = true;
				else
					throw e;
			}
			right = this._checkMathParam(rightToken);
			if(bUnParseErr)
				throw unparseErr;
		}
		
		return this.calcValue(type, left, right, context);
	},
	
	// analyzeToken, if it's a array of union/intersection, get its result
	_getTokenResult : function (result) {
		result = this.analyzeToken(result, true);
		if (dojo.isArray(result) && this.isRangeObj(result[0])) {
			if (result.length == 1)
				result = result[0].getValue();//reference token array, result[0] must be a refToken
			else
				result = websheet.Constant.ERRORCODE["519"];
		}
		return result;
	},
	
	calcValue: function(type, left, right, context) {
		// left is an error object, just return
		if (left.value && left.value.errorCode != undefined)
			throw left.value;
		else if(right.value && right.value.errorCode != undefined)
			throw right.value;
		
		if(type == '+' || type == '-' || type == '*' || type == '/' || type == '^')
		{
			// empty cell should be recognized as 0
			if (left.calcType == 8)
				left = 0;
			else
				left = this.parseNumber(left.value, this.LOCALE_NUM);
			
			if (right.calcType == 8)
				right = 0;
			else
				right = this.parseNumber(right.value, this.LOCALE_NUM);
			
			// inline websheet.Helper.isInt with num % 1 == 0
			var bInt = (left % 1 == 0) && (right % 1 == 0);
			switch (type) {
			case '+':
				if(bInt)
			      return (left + right);
				return websheet.Math.add(left, right, true); 
			case '-':
				if(bInt)
			      return (left - right);
				return websheet.Math.sub(left, right, true);
			case '*':
			    if(bInt && !websheet.Helper.isSciNum(left) && !websheet.Helper.isSciNum(left))
			      return (left * right);
				return websheet.Math.mul(left, right, !bInt);
			case '/':
				if(right !== 0.0){
					if(bInt && !websheet.Helper.isSciNum(left) && !websheet.Helper.isSciNum(left)){
						var r = left / right;
						if(!(r % 1 == 0))
					    	//precision of excel calculation is 15	
						     r = parseFloat(r.toPrecision(15));
			     		return r;
					}
					return websheet.Math.div(left, right, !bInt);
				}else{
					throw websheet.Constant.ERRORCODE["532"];
				}
			case '^':
			    if(left< 0 && !(right % 1 == 0))
					throw websheet.Constant.ERRORCODE["504"];
			    if(bInt)
			      return Math.pow(left, right);
				return websheet.Math.pow(left, right, true);
			}
		}else if(type == '=' || type == '>' || type == '>=' || type == '<' || type == '<=' || type == '<>')
		{
			// the type(number:1/string:2/boolean:4/empty cell:8) sequence: number < string < boolean
			// empty cell should be converted to number/string/boolean when compare
			// if the type is the same, compare the value, else compare the type
			if (left.calcType == right.calcType) {
				left = left.value;
				right = right.value;
			} else if (right.calcType == 8) {
				switch(left.calcType) {
				case 1:
					right = 0;
					break;
				case 2:
					right = "";
					break;
				case 4:
					right = false;
					break;
				}
				left = left.value;
			} else if (left.calcType == 8) {
				switch(right.calcType) {
				case 1:
					left = 0;
					break;
				case 2:
					left = "";
					break;
				case 4:
					left = false;
					break;
				}
				right = right.value;
			} else {
				left = left.calcType;
				right = right.calcType;
			}
			if(typeof left == "number" && typeof right == "number"){
				left = parseFloat(left.toPrecision(15));
				right = parseFloat(right.toPrecision(15));
			} else if (typeof left == "string" && typeof right == "string") {
				left = left.toLowerCase();
				right = right.toLowerCase();
			}
			switch (type) {
				case '=':
					return left === right;
				case '>':
					return left > right;
				case '>=':
					return left >= right;
				case '<':
					return left < right;
				case '<=':
					return left <= right;
				case '<>':
					return left != right;
			}
		}else if(type == "~"){ //Concatenation operation, return reference list
			
			if(left._error)
				throw left._error;
			else if(right._error)
				throw right._error;
			
			var sheetNameL;
			var sheetNameR;
			var docObj = this.Object.getDocument();
			var leftList = left.getReferenceToken();
			var length = leftList.length;
			if(!leftList || length == 0)
				throw websheet.Constant.ERRORCODE["502"]; //Invalid argument
			else{
				sheetNameL = leftList[0].getValue().getSheetName();
				if(leftList[0].getValue().is3DArea())
					throw websheet.Constant.ERRORCODE["519"]; //#VALUE!
			}
				
			var rightList = right.getReferenceToken();
			if(!rightList || rightList.length == 0)
				throw websheet.Constant.ERRORCODE["502"]; //Invalid argument
			else{
				sheetNameR = rightList[0].getValue().getSheetName();
				if(rightList[0].getValue().is3DArea())
					throw websheet.Constant.ERRORCODE["519"]; //#VALUE!
			}
			
			if(sheetNameL != sheetNameR)
				throw websheet.Constant.ERRORCODE["524"]; //websheet.Constant.INVALID_REF; 
			
			return leftList.concat(rightList);
		}else if(type == "!"){//Intersect operation, return reference list
			var retTokenList = [];
			//clear all the update tokens of intersection function token list
			context.currentToken.removeAllUpdateRefToken(context.currentCell);
			if(left._error)
				throw left._error;
			else if(right._error)
				throw right._error;
			
			var leftList = left.getReferenceToken();
			if(!leftList)
				throw websheet.Constant.ERRORCODE["519"];//#VALUE!
			
			var rightList = right.getReferenceToken();
			if(!rightList)
				throw websheet.Constant.ERRORCODE["519"];//#VALUE!
			
			for(var eachL in leftList){
				var lt = leftList[eachL];
				for(var eachR in rightList){
					var rt = rightList[eachR];
					var tmp = this._getIntersectToken(lt, rt, context);
					if(tmp)
						retTokenList.push(tmp);
				}
			}
			if(retTokenList.length == 0)
				throw websheet.Constant.ERRORCODE["533"];//#NULL!; 
			
			return retTokenList;
		} else {
			switch (type) {
				case '&':
					// 1/0 -> boolean string
					if(left.calcType == 4 )
						left = this.NumberRecognizer.transBoolNum2Locale(left.value);
					else
						left = this.getValue(left.value);
					// 1/0 -> boolean string						
					if(right.calcType == 4)
						right = this.NumberRecognizer.transBoolNum2Locale(right.value);
					else
						right = this.getValue(right.value);
					return left + right;//string concatenate
				case '%':
				case '+=':
				case '-=':
				case '*=':
				case '/=':
				case '%=':
				case '!=':
				case '&&':
				case '||':
					throw websheet.Constant.ERRORCODE["502"];
				default:
					return NaN;
			}
		}
	},
	
	// using ranges to combine one range.
	_generateOneRefFromRefs:function(tokenList, context){
		var ignoreSetProp = websheet.Constant.RefType.IGNORESET;
		var RangeType = websheet.Constant.RangeType;
		var ref = tokenList[0].getValue();
		if(ref.is3DArea())
			throw websheet.Constant.ERRORCODE["519"];
		tokenList[0].setProp(ignoreSetProp);
		var rangeInfo = ref._getRangeInfo();
		var startCol = rangeInfo.startCol;
		var startRow = rangeInfo.startRow;
		var endCol = rangeInfo.endCol;
		var endRow =  rangeInfo.endRow;
		var sheetName = rangeInfo.sheetName;
		var type = ref.getType();
		var refMask = websheet.Constant.RANGE_MASK;
		if(type == RangeType.ROW)
			refMask = websheet.Constant.ROWS_MASK;
		else if (type == RangeType.COLUMN)
			refMask = websheet.Constant.COLS_MASK;
		for(var i=1;i<tokenList.length;i++){
			var t = tokenList[i];
			ref = t.getValue();
			if(ref.is3DArea())
				throw websheet.Constant.ERRORCODE["519"];
			t.setProp(ignoreSetProp);
			rangeInfo = ref._getRangeInfo();
			startCol = Math.min(startCol,rangeInfo.startCol);
			startRow = Math.min(startRow,rangeInfo.startRow);
			endCol = Math.max(endCol,rangeInfo.endCol);
			endRow =  Math.max(endRow,rangeInfo.endRow);
			if(sheetName != rangeInfo.sheetName){
				throw websheet.Constant.ERRORCODE["519"];
			}
			var type = ref.getType();
			if(type == RangeType.ROW)
				refMask = websheet.Constant.ROWS_MASK;
			else if (type == RangeType.COLUMN)
				refMask = websheet.Constant.COLS_MASK;
		}
		var updateParsedRef = new websheet.parse.ParsedRef(sheetName,startRow, startCol ,endRow, endCol, refMask);
		var refToken = this.generateUpdateToken(context.currentToken, updateParsedRef,sheetName,context.currentCell);
		refToken.setRecalcType(websheet.Constant.RecalcType.ANCESTOR);
		return refToken;
	},
	
	// get the intersection reference
	_getIntersectToken: function(leftToken, rightToken, context){
		
		var ignoreSetProp = websheet.Constant.RefType.IGNORESET;
		
		var currentCell = context.currentCell;
		var sheetName = currentCell.getSheetName();
		
		 //left is the calculate value of indirect/offset, which is also a token, but here we need a reference.
		var left = leftToken.getValue();
		var lt = left._getRangeInfo();
		if(left.is3DArea())
			throw websheet.Constant.ERRORCODE["519"]; //#VALUE!
		var nameTmp = lt.sheetName;
		var sheetNameL = nameTmp ? nameTmp : sheetName;
		var srL = lt.startRow;
		var tmp = lt.startCol;
		var	scL = (tmp > 0) ? tmp : 0;
		var erL = lt.endRow;
		tmp =  lt.endCol;
		var	ecL = (tmp > 0) ? tmp : scL; 
		
		var right = rightToken.getValue();
		var rt = right._getRangeInfo();
		if(right.is3DArea())
			throw websheet.Constant.ERRORCODE["519"]; //#VALUE!
		nameTmp = rt.sheetName;
		var sheetNameR = nameTmp ? nameTmp : sheetName;
		var srR = rt.startRow;
		var tmp = rt.startCol;
		var	scR = (tmp > 0) ? tmp : 0;
		var erR = rt.endRow;
		tmp =  rt.endCol;
		var	ecR = (tmp > 0) ? tmp : scR;
		
		if(sheetNameL != sheetNameR)
			throw websheet.Constant.ERRORCODE["519"]; //#VALUE!
		
		if(erR < srL || scR > ecL || srR > erL || ecR < scL){  //two ranges of no intersect 
			return null;
			//throw websheet.Constant.INVALID_REF; 
		}
		
		var retSR, retSC, retER, retEC;
		retSR = this._getResultIndex(srR, srL, true);
		retSC = this._getResultIndex(scR, scL, true);
		retER = this._getResultIndex(erR, erL, false);
		retEC = this._getResultIndex(ecR, ecL, false);
		var returnToken;
		if( (retSR != srL) || (retSC != scL) || (retER != erL) || (retEC != ecL)){
			leftToken.setProp(ignoreSetProp);
		} else 
			returnToken = leftToken;
		if( (retSR != srR) || (retSC != scR) || (retER != erR) || (retEC != ecR)){
			rightToken.setProp(ignoreSetProp);
		} else 
			returnToken = rightToken;
		if(!returnToken){
			//create update token as the intersection token
			var updateParsedRef = new websheet.parse.ParsedRef(sheetNameL,retSR, retSC, retER, retEC, websheet.Constant.RANGE_MASK);
			returnToken = this.generateUpdateToken(context.currentToken, updateParsedRef, sheetNameL, currentCell);
			returnToken.setRecalcType(websheet.Constant.RecalcType.ANCESTOR);
		}
		return returnToken;
	},
	
	// flag		true return the max value of parm1 and parm2.
	//			false return the min value of parm1 and parm2.
	_getResultIndex: function(parm1, parm2, flag){
		if(flag)
			return (parm1 > parm2) ? parm1 : parm2;
			
		return (parm1 > parm2) ? parm2 : parm1;
	},
	
	//check the parameter in MATH operation
	// it can be a one cell/single value(string/number/boolean)
	// type is string/boolean/number
	_checkMathParam:function(value)
	{
		// value is not a token
		var result;
		if (!this.Object.isToken(value)) {
			result = value;
		} else {
			if(value && value.getError())
				this._throwError(value.getError(), value);
			result = this.analyzeToken(value);
		}
		
		var v = result;
		var calcType = -1;
		/**
		 * for formula array or concatenation 
		 */
		// if value is range/array or error object, just return
		if (dojo.isArray(result) && result.length > 0) {
			if (!this.isRangeObj(result[0]))
				return result;
			else {
				result = this.analyzeToken(result[0]);       // only for intersection is one cell, range/union is handled before
				if(result.isSingleCell())
					result = result.getCell(0, 0, true, this.bIgnoreError);
				else
					throw websheet.Constant.ERRORCODE["519"];  
			}
		} else if (this.isRangeObj(result)) {
			if (result.isSingleCell())
				result = this.getScalaCell(result, false, value);
			else
				return result;
		}
		// number(type:1) < string(2, formula result "") < boolean(4),empty cell:(type:8)
		// and empty cell can be matched with 0/""/false
		if (this.Object.isCell(result)){			
			// check if whether the cell is dirty
			v = result.getComputeValue(); // force formula re-calculation if this cell is Dirty
			var et = result.getError();
			if(et) {
				if(et.errorType == websheet.Constant.ErrorType.UNSUPPORTFORMULA)
					throw websheet.Constant.ERRORCODE["1003"]; 
				else
					throw et;
			} else if (result.isNumber()) {
				calcType = 1;
			} else if (result.isBoolean()) {
				calcType = 4;
				if (result._calculatedValue == 1 || result._calculatedValue == "1")
					v = true;
				else
					v = false;
			} else if (result.isString()) {
				if(!result.isFormula() && ( v == null || v === "")) {
					calcType = 8;
					v = "";
				} else	
					calcType = 2;
			} 
//			else if(v === "" && !result.isFormula()){
//				// if((v === "") && (result._rawValue === ""))//is empty cell, rather than the formula cell with "" as calculate value
//				// 7683: A1 is an empty string(=""), B1 is empty, the result of =A1=B1 should be TRUE.
//				// 20573: A1 is an empty string(=""), B1 is 3, the result of =A1>B1 should be TRUE which means can not treat A1 as number of 0
//				bNumber = true;
//			}
		} else if(typeof result == "number"){
			calcType = 1;
		} else if (typeof result == "boolean") {
			calcType = 4;
		} else if (typeof result == "string") {
			calcType = 2;
		} else if (result == null) {
			calcType = 8;
			v = "";
		} 

		var ret = {};
		ret.value = v;
		ret.calcType = calcType;
		return ret;
	},
	
	// calculated by row, the parameter may be cell/unit value/rows/const-array
	_calcRangeRowsExpr: function(opeType, leftRow, rightRow, leftColSize, rightColSize, leftDefaultValue, rightDefaultValue, context) {
		//if colSize == 1, should repeate add it
		var realLeftColSize = 1;
		var realRightColSize = 1;
		if(dojo.isArray(leftRow)){
			realLeftColSize = leftRow.length;
			if(leftColSize == 1)
				leftRow = leftRow[0];
		}
		if(dojo.isArray(rightRow)){
			realRightColSize = rightRow.length;
			if(rightColSize == 1)
				rightRow = rightRow[0];
		}
		var smallColSize = leftColSize;
		var largeColSize = rightColSize;
		if(leftColSize > rightColSize){
			largeColSize = leftColSize;
			smallColSize = rightColSize;
		}
		var isLeftArray = true;
		var isRightArray = true;
		var leftValue, rightValue;
		var rowArrayRes = [];
		// the item whose index is larger than colSize should be #N/A. 
		// {1,2,3}+{1,2}, should be {2,4,#n/a};  {1,2,3}+{1} is {2,3,4}
		var colSize = (smallColSize == 1) ? largeColSize : smallColSize;
		for(var j=0; j<colSize; j++) {
			try{
				if (dojo.isArray(leftRow)) {
					var value = leftRow[j];
					if(j >= realLeftColSize){
						// we just need default in 2 cases: 
						// 1 when one argument is a value, the colSize is the smallColSize, needn't defaultValue
						// 2 for 2 rows, for example size is 16384(real size 500) and other is 1000, colSize is 1000  
						value = leftDefaultValue;
						if (dojo.isArray(value)) {
							if (value.length == 1)
								value = value[0];
							else
								value = value[j];
						}
						isLeftArray = false;
					}
					leftValue = this._checkMathParam(value);
				} else if (isLeftArray) {
					// for an empty range, just init it once. 
					// Ex. A1:A50 has no value, leftRow is null
					if (leftRow && (leftRow.calcType != undefined))
						leftValue = leftRow;
					else
						leftValue = this._checkMathParam(leftRow);
					isLeftArray = false;
				}
				
				if (dojo.isArray(rightRow)) {
					var value = rightRow[j];
					if(j >= realRightColSize){
						value = rightDefaultValue;
						if (dojo.isArray(value)) {
							if (value.length == 1)
								value = value[0];
							else
								value = value[j];
						}
						isRightArray = false;
					}
					rightValue = this._checkMathParam(value);
				} else if (isRightArray) {
					if (rightRow && (rightRow.calcType != undefined))
						rightValue = rightRow;
					else
						rightValue = this._checkMathParam(rightRow);
					isRightArray = false;
				}
				var result = this.calcValue(opeType, leftValue, rightValue, context);
			}catch(err){
				result = err;
			}
			// if left and right both are empty cells, just calcValue once and then fill it
			if ((isRightArray == false) && (isLeftArray == false)) {
				for(; j<colSize; j++)
					rowArrayRes.push(result);
				break;
			}
			rowArrayRes.push(result);
		}
		for(var j = colSize; j < largeColSize; j++){
			rowArrayRes.push(websheet.Constant.ERRORCODE["7"]);
		}
		return rowArrayRes;
	},

	/* calculated by row, left and right range(rangeType) has 5 cases: 
	 * 0. has same area.  											Ex. A1:B3, E4:F6 or {1,1;1,2;2,2}
	 * 1. one row length is 1(columns size may be different).       Ex. A1:B3, E4:F4 or {1,1}
	 * 2. has same row offset, one column length is 1.  			Ex. A1:B3, E4:E6 or {1;1;1}
	 * 3. one cell.  												Ex. A1:B3, E1 or {1} or 1
	 * 4. different column/row size(>1, 1 is included in case 1)    Ex. A1:A3, A1:B1 or {1;2;3}, {1,2}
	 * repeat rule (array size is maxCol*maxRow, data area size is minCol*minRow
	 * (minCol>1, minRow>1), the other value is #N/A.
	 * . Ex. 2*4(2 rows and 4 columns), 3*3, data area is 2*3, and array size is 3*4
	 * */
	_calcRangesExpr: function(opeType, left, right, leftToken, rightToken, context) {
		var leftInfo = this.getArrayInfo(left);
		var rightInfo = this.getArrayInfo(right);
		var leftRowSize = leftInfo.rowSize;
		var rightRowSize = rightInfo.rowSize;
		var leftColSize = leftInfo.colSize;
		var rightColSize = rightInfo.colSize;
		var leftRows = leftInfo.array;
		var rightRows = rightInfo.array;
		var realLeftRowSize = leftRows.length;
		var realRightRowSize = rightRows.length;
		//default value should calc from defaultLeft and defaultRight
		//defaultleft and defaultRight should be single value or two-dimension array
		var defaultLeft = leftRows.defaultValue;
		var defaultRight = rightRows.defaultValue;
		// convert default value to 1D, because all source array is 2D
		if (dojo.isArray(defaultLeft))
			defaultLeft = defaultLeft[0];
		if (dojo.isArray(defaultRight))
			defaultRight = defaultRight[0];
		// get max/min column/row size
		var maxColSize = rightColSize;
		var minColSize = leftColSize;
		var maxRowSize = rightRowSize;
		var minRowSize = leftRowSize;
		if (leftColSize > rightColSize) {
			maxColSize = leftColSize;
			minColSize = rightColSize;
		}
		if (leftRowSize > rightRowSize) {
			maxRowSize = leftRowSize;
			minRowSize = rightRowSize;
		}
		// single column/row should be repeated {1,2;3,4}+{1} to be {2,3;4,5}
		// A:B+C1:D1 result is An:Bn+C1:D1(becasue C1:D1 row is 1)
		// but A:B+C2:D2 result is A1:B2+C2:D2, and An:Bn(n>2)+#n/a:#n/a
		if (minColSize == 1)
			minColSize = maxColSize;
		if (minRowSize == 1)
			minRowSize = maxRowSize;
		var realRowSize = (realRightRowSize > realLeftRowSize) ? realRightRowSize : realLeftRowSize;
		// for const-array, the max real size is the same with max size, to get the min row size
		if (realRowSize == maxRowSize)
			realRowSize = minRowSize;
		
		// if the left/right row size is 1, set it default value
		if (rightRowSize == 1) {
			// serial const-array token by its claculate value, so shouldn't change it
			if (minColSize == maxColSize)
				defaultRight = rightRows[0];
			else {
				defaultRight = [];
				for (var i = 0; i < maxColSize; i++)
					// the position between minCol and maxCol should be filled #n/a
					// A:C+{1,2} or A:B+{1,2,3}, the default value should be {1,2,#n/a}
					if (i < minColSize)
						defaultRight[i] = rightRows[0][i];
					else
						defaultRight[i] = websheet.Constant.ERRORCODE["7"];
			}
		} else if (leftRowSize == 1) {
			// serial const-array token by its claculate value, so shouldn't change it
			if (minColSize == maxColSize)
				defaultLeft = leftRows[0];
			else {
				defaultLeft = [];
				for (var i = 0; i < maxColSize; i++)
					// the position between minCol and maxCol should be filled #n/a
					// A:C+{1,2} or A:B+{1,2,3}, the default value should be {1,2,#n/a}
					if (i < minColSize)
						defaultLeft[i] = leftRows[0][i];
					else
						defaultLeft[i] = websheet.Constant.ERRORCODE["7"];
			}
		} else if (leftRowSize > rightRowSize) {
			// set default value to #n/a. {10,10;20,20}+{1,1,1;2,2,2;3,3,3}={11,11,#n/a;22,22,#n/a;#n/a,#n/a,#n/a}
			// A:B + A1:B1000
			defaultRight = websheet.Constant.ERRORCODE["7"];
		} else if (leftRowSize < rightRowSize) {
			defaultLeft = websheet.Constant.ERRORCODE["7"];
		}
		// there is a problem. A:B+C1:D100, real columns size are 20 and 30, we can get valid data of 30 rows
		// and fill the other with #N/A, but actually, the rows between 30 and 100 should fill with 0
		// this case can't be found when test(in array formula, we set the range as const-array)
		
		// get the data area: 
		// const-array: maxCol*minRow(minRow is 1, get maxRow)
		// range: the maxRealRow*maxCol
		var ArrayRes = [];
		for (var index = 0; index < realRowSize; index++) {
			var rightValue = rightRows[index];
			if (index >= realRightRowSize)
				rightValue = defaultRight;
			var leftValue = leftRows[index];
			if (index >= realLeftRowSize)
				leftValue = defaultLeft;
			ArrayRes[index] = this._calcRangeRowsExpr(opeType, leftValue, rightValue, leftColSize, rightColSize, defaultLeft, defaultRight, context);
		}
		
		// return 1-dimensiona  or single value
		var dimension = (leftInfo.dimension > rightInfo.dimension) ? leftInfo.dimension : rightInfo.dimension;
		if(dimension == 0) {
			ArrayRes = ArrayRes[0][0];
		} else {
			//=sum({1,2}&1), result is 0, because {1,2}&1 = {"11","21"}, the string in array should not parse to number
			//so we need set it as array value			
			if (dimension == 1)
				ArrayRes = ArrayRes[0];
			// fill default value
			var defaultValue = this._calcRangeRowsExpr(opeType, defaultLeft, defaultRight, leftColSize, rightColSize, defaultLeft, defaultRight, context);
			defaultValue = [defaultValue];
			ArrayRes.defaultValue = defaultValue;
			ArrayRes.colSize = maxColSize;
			ArrayRes.rowSize = maxRowSize;
		}
		return ArrayRes;
	},
	
	// entrance function of range expression
	_calcRangeExpr: function(type, left, right, leftToken, rightToken, context) {
		switch (type) {
		case '%':
		case '+=':
		case '-=':
		case '*=':
		case '/=':
		case '%=':
		case '!=':
		case '&&':
		case '||':
			throw websheet.Constant.ERRORCODE["502"];
		}
		
		// temp value when calculate range express which has array
		var ret;
		var unparseErr = websheet.Constant.ERRORCODE["2001"];
		if(!this.isArrayValueFunc(context)){
			var bUnparse = false;
			try{
				if (this.isRangeObj(left)) {
					left = this.getScalaCell(left, false, leftToken);
				}
			}catch(err){
				//=counta(A:B+{1,2}) even the scala cell for A:B will throw #VALUE!, but the result should be {#Value!, #VALUE!}, and return 2
				if(err == unparseErr)
					bUnparse = true;
				else if(this.bIgnoreError)
					left = err;
				else
					throw err;
			}
			try{
				if (this.isRangeObj(right)) {
					right = this.getScalaCell(right, false, rightToken);
				} 
			}catch(err){
				if(err == unparseErr)
					bUnparse = true;
				else if(this.bIgnoreError)
					right = err;
				else
					throw err;
			}
			if(bUnparse)
				throw unparseErr;
			
			ret = this._calcRangesExpr(type, left, right, leftToken, rightToken, context);
			// need throw if scala value is error
			if (ret.errorCode)
				throw ret;
		}else{
			
			if(context.currentToken.getType() == websheet.parse.tokenType.POSITIVE_TOKEN)
				//sumproduct(+A1:A3), if A1:A3 contains string, it will ignore it
				ret = right;//make sure right is got from rightToken value
			else
				ret = this._calcRangesExpr(type, left, right, leftToken, rightToken, context);
		}

		return ret;
	}
});