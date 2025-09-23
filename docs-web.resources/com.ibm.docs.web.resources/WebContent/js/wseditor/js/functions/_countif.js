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

dojo.provide("websheet.functions._countif");
dojo.declare("websheet.functions._countif", websheet.functions.FormulaBase, {
	_equationReg : null,
	
	constructor: function() 
	{
		this.minNumOfArgs = 0;
		this.privateAcc = true;
	},
	
	_getRange: function(rangeValue) {
		var type = rangeValue.getType();
		if((type == this.tokenType.NAME || type == this.tokenType.RANGEREF_TOKEN) && rangeValue.getError())
			throw rangeValue.getError();
		var range = this.analyzeToken(rangeValue);

		if(dojo.isArray(range)) {
			var res = this.analyzeToken(range[0]);
			if(this.isRangeObj(res))
				if (range.length == 1)
					range = res;
			else
				throw websheet.Constant.ERRORCODE["519"];
		}
		
		//parameter must be a cell/range ref
		if(!this.isRangeObj(range))
			throw websheet.Constant.ERRORCODE["504"];
		
		// 3D ref is invalid 
		if (range.is3DArea()) {
			throw websheet.Constant.ERRORCODE["519"];
		}
		
		return range;
	},
	
	_getCriteria: function(criteriaValue) {
		var valueType = criteriaValue.getType();
		var criteria;
		if (valueType == this.tokenType.NONE_TOKEN) {
			criteria = 0;
		} else if (!criteriaValue.getError()) {
			criteria = this.fetchScalaResult(criteriaValue);
			//TODO: need to set this.STR_TO_NUM mode??
			if(typeof(criteria) == "string"){
			  criteria = this.toBoolean(criteria,true);
			  if(criteria === 1)
			  	criteria = true;
			  else if(criteria === 0)
			  	criteria = false;
			}
			if((typeof criteria) != "boolean")
				criteria = this.getValue(criteria,valueType);
		}else{
			criteria = criteriaValue.getError().message;
		}

		if(typeof(criteria) == "string")
			criteria = this._processStr(criteria);
		
		return criteria;
	},
	
	_operatorSingleValue:function(context,item,index,type,num){
		if(!num)
			return;
		
		if (this.bArrayFormula && item && item.errorCode){
			throw item;
		}
		
		var bObj = this.Object.isCell(item);
		var criteria = bObj ? item.getComputeValue():item;
		
		if(typeof(criteria) == "string"){
			criteria = this.toBoolean(criteria,true);
			if(criteria === 1)
				criteria = true;
			else if(criteria === 0)
				criteria = false;
		}
		if((typeof criteria) != "boolean")
			criteria = this.getValue(criteria);
			
		if(typeof(criteria) == "string")
			criteria = this._processStr(criteria);
		
		context.criteriaArray.push(criteria);
	},
	
	/*Array*/exec: function(context, baseIdx) {
		var values = this.args;
		baseIdx = baseIdx ? baseIdx : 0;
		var range = this._getRange(values[baseIdx]);
		var type = values[baseIdx + 1].getType();
		//if countif is as the array parameter of another formula and the criteria is a range or an array, the countif should return an array instead of a number.
		if(this.isArrayValueFunc(context, baseIdx) && type == this.tokenType.RANGEREF_TOKEN || type == this.tokenType.ARRAYFORMULA_TOKEN) {
			context.criteriaArray = new Array();
			this.iterate(values[baseIdx + 1], context);
			context.result = new Array();
			for(i in context.criteriaArray) {
				context._count = 0;
				this.getSatisfyCriteria(context, range, context.criteriaArray[i]);
				context.result.push(context._count);
			}
		}
		else {
			var parmObj = {bIgnoreErr: true};
			context.criteriaArray = new Array();
			this.iterate(values[baseIdx + 1], context, parmObj);
			return this.getSatisfyCriteria(context, range, context.criteriaArray[0]);
		}
			
	},
	
	/*Array*/getSatisfyCriteria: function(context, range, criteria) 
	{
		var info = range._getRangeInfo();
		var lastRow = info.startRow - 1;
		var lastCol = info.startCol - 1;
		
		var scriteria = criteria + "";
		var equation = this.analyzeEquation(scriteria);	
		var isErrCri = false;
		if(equation && equation.para != null && this.isError((equation.para).toUpperCase()))
			isErrCri = true;
		else if(typeof(criteria) == "string" && this.isError(criteria.toUpperCase()))
			isErrCri = true;
		var countInEmptyCell = (scriteria=="" || (scriteria.indexOf("<>") == 0 && scriteria.length > 2) );
		this._wildcardCriteria = {};

        var satisfyCriteria = new Array();		
		var param = {bIgnoreError: true};
		this.iterateWithFunc(range, dojo.hitch(this, function(cell, row, col) {
			if(countInEmptyCell){
				//count the empty cells before current cell
				var pos;
				if(lastRow < row){
					if(lastRow >= info.startRow){
						pos = {row: lastRow, col: lastCol + 1, rowSize: 1, colSize: info.endCol - lastCol};
						if (pos.colSize) {
							satisfyCriteria.push(pos);
							this.processRes(null, context,pos);
						}
					}
					if(lastRow < (row - 1)){
						pos = {row: lastRow+1, col: info.startCol, rowSize: row - 1 - lastRow, colSize: info.endCol - info.startCol + 1};
						if (pos.colSize && pos.rowSize) {
							satisfyCriteria.push(pos);
							this.processRes(null, context,pos);
						}
					}
					pos = {row: row, col: info.startCol, rowSize: 1, colSize: col - info.startCol};
					if (pos.colSize) { 
						satisfyCriteria.push(pos);
						this.processRes(null, context,pos);
					}
				} else {
					if(lastCol < (col - 1)){
						pos = {row: lastRow, col: lastCol + 1, rowSize: 1, colSize: col - 1 - lastCol};
						if (pos.colSize) {
							satisfyCriteria.push(pos);
							this.processRes(null, context,pos);
						}
					}
				}
			}
			lastRow = row;
			lastCol = col;
			var value = null;
			var isErrVal = false;
			//ignore all the error cell
			var error = cell.getError();
			/**
			 * the error cell is not the same with empty cell
			 * we just ignore the cell error in normal case like =countif(range,"");
			 */
			if(error){
				value = error.message;
				isErrVal = true;
			}else{
				if(!cell.isFormula()){
					var para=cell.getValue(); // use getRawValue to diff #VALUE! '#VALUE!
					if(typeof(para) == "string")
						 isErrVal = this.isError(para.toUpperCase());
				}	
				value = cell.getComputeValue();
				if (cell.isBoolean()) {
					value = (value == 1);
				}
				
				if(typeof(value) == "string")	
					value = this._processStr(value);
				if(value==="" && cell.getValue()==="")
					value = null;
			}
			
			var res = false;
			if(scriteria==="")
			{
				if(value==null || value==="")
					res = true;
			}
			else
			{
				if(equation!=null)
					res = this.compare1(equation,value,isErrCri, isErrVal);
				else
					res = this.compare2(criteria,value,isErrCri, isErrVal);
			}
			if(res)
			{
				var pos = {row:row, col:col};
				satisfyCriteria.push(pos);
				this.processRes(cell, context);
			}
			
			return true;
		}), param);

		if(countInEmptyCell){
			//other empty cells in the later rows
			if(lastRow < info.endRow){
				if(lastRow >= info.startRow){
					pos = {row: lastRow, col: lastCol + 1, rowSize: 1, colSize: info.endCol - lastCol};
					if (pos.colSize) { 
						satisfyCriteria.push(pos);
						this.processRes(null, context,pos);
					}
				}
				pos = {row: lastRow + 1, col: info.startCol, rowSize: info.endRow - lastRow, colSize: info.endCol - info.startCol + 1};
				if (pos.colSize && pos.rowSize) {
					satisfyCriteria.push(pos);
					this.processRes(null, context,pos);
				}
			} else {
				if(lastCol < info.endCol){
					pos = {row: lastRow, col: lastCol + 1, rowSize: 1, colSize: info.endCol - lastCol};
					if (pos.colSize) {
						satisfyCriteria.push(pos);
						this.processRes(null, context,pos);
					}
				}
			}
		}
		return satisfyCriteria;
	},
	
	processRes: function(cell, context)
	{
	},
	
	analyzeEquation:function(criteria)
	{
		if(criteria.length==0)
			return null;
			
		if(this._equationReg==null)
			this._equationReg = /^(<=|>=|<>|[=><])/g;
		
		var res = criteria.match(this._equationReg);
		if(res && res.length>0)
		{
			var operator = res[0];
			var obj2 = null;
			if(operator.length<criteria.length)
			  obj2 = criteria.substring(operator.length);
			
			return {op: operator, para: obj2};
		}
		return null;
	},
	
	compare1:function(equation,compareObj,isErrCri, isErrVal)
	{
		var operator = equation.op;
		var obj2 = equation.para;
		
		// "=" and "<>" support wildcard characters.
		//">", "<", ">=", "<=" don't support wildcard characters
		if(operator=="=")
		{
			if(obj2==null)
				return compareObj == null;
									
			return this.compare2(obj2,compareObj,isErrCri, isErrVal);
		}
		
		if(operator=="<>")
		{
			if(obj2==null)
				return compareObj != null;
								
			return !this.compare2(obj2,compareObj,isErrCri, isErrVal);
		}	
		
		if(obj2==null || compareObj==null)
			return false;
		var compareObjBool = false;
		//treat true/false as 1/0
		if(typeof compareObj =="string"){
			compareObj = this.toBoolean(compareObj,true);
			if(compareObj === 1 || compareObj === 0)
				compareObjBool = true;
		} else if(typeof compareObj == "boolean"){
			compareObjBool = true;
			if(compareObj)
				compareObj = 1;
			else
				compareObj = 0;
		}
		var res = 0;
		
		//obj2 might be locale sensitive
		var parseResult = this.NumberRecognizer.parse(obj2,false, true);
		if(parseResult.isNumber)
		{
			if(typeof compareObj =="string") // countif don't compare char to number.
				return false;
			//if only one of these two is boolean, return false directly 
			if( (parseResult.formatType == websheet.Constant.FormatType["BOOLEAN"] && !compareObjBool)
					|| (parseResult.formatType != websheet.Constant.FormatType["BOOLEAN"] && compareObjBool))
				return false;
			obj2 = parseResult.fValue;
			res = compareObj - obj2;
		}
		else
		{
			if(typeof compareObj == "number")
				return false;
			
			var v1 = compareObj.toLowerCase();
			var v2 = obj2.toLowerCase();
			res = v1.localeCompare(v2);
		}
		
		if(res>0)
			return (operator==">" || operator==">=");
		
		if(res==0)
			return (operator==">=" || operator=="<=");
			
		return (operator=="<" || operator=="<=");
	},
	
	compare2: function(criteria,cmpValue,isErrCri, isErrVal)
	{
		if(cmpValue==null)
			return false;
		
		if((typeof criteria)!=(typeof cmpValue))
		{
			if((typeof criteria) == "boolean")
				return false;
			// A1=1,A2="a", countIf(A1:A2,"?") return 1. A1 will not be matched
			if((criteria+"")!=(cmpValue + ""))
			{
				return false;
			}
		}
		if(isErrVal)
			return (criteria === cmpValue);
		
		if(isErrCri && !isErrVal)//return false if the cmpValue is from formula and likes error(#DIV/0!)
			return false;
		
		var res = false;
		if(typeof criteria == "string" && criteria.length>0)
		{
			var reg = this._wildcardCriteria[criteria];
			if(!reg){
				var s1 = this.wildcardMapping(criteria);
				reg = new RegExp("^"+s1+"$","i");		
				this._wildcardCriteria[criteria] = reg;
			}
			res = reg.test(cmpValue + "");
		}
		else
		{
			res = (criteria+"")==(cmpValue + "");
		}
		
		return res;	
	},
	
	_processStr: function(text) {
		var locale = this.getLocale();
		if (locale.indexOf('de') != -1){
			text=websheet.BrowserHelper._decomposeByLocale(text);
		}else if(locale.indexOf('ja')!=-1){
			text=websheet.BrowserHelper._composeByLocale(text);
		}
		
		return text;
	}
});