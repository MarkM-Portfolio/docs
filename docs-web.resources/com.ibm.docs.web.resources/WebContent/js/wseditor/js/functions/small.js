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

dojo.provide("websheet.functions.small");
dojo.require("websheet.functions.FormulaBase");
dojo.require("websheet.functions.median");

dojo.declare("websheet.functions.small", websheet.functions.median, {
	
	bSMALLEST: true,

	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
		this.privateAcc = false;
	},
	
	/*int*/calc: function(context) {
		var array = this.args[0];
		var indexParams = this.args[1];
		//cache the pos index number, because indexParams might be an array which might have the same index
		this.cachePos = {};
		//iterate array and return result with value and num(how many times the value occurs)
		//inherit from median to get number arrays
		var parmArray = new Array();
		parmArray.count = 0;
		context.parmArray = parmArray;
		
		this.iterate(array, context);
		
		if(parmArray.count == 0 || indexParams.getType() == this.tokenType.NONE_TOKEN)
			throw websheet.Constant.ERRORCODE["504"];//#NUM!
		
		//sort parmArrays
		if (this.bSMALLEST)
			parmArray.sort(function(key1,key2){return key1.v-key2.v;});
		else
			parmArray.sort(function(key1,key2){return key2.v-key1.v;});
		
		var values = this._getIndexValues(parmArray, indexParams, context);
		return values;
	},
	
	_getIndexValues: function(parmArray, indexParams, context) {
		var result = indexParams;
		var values;
		if(this.isArrayValueFunc(context)){
			if (this.Object.isToken(indexParams)) {
				result = this.analyzeToken(indexParams);
			} 
			values = result;
			var x, y;
			if(dojo.isArray(result)){
				//for intersection
				if(result.length == 1 && this.isRangeObj(result[0])){
					result = result[0];
				}
			}
			if (this.isRangeObj(result)){
				var rangeInfo = result._getRangeInfo();
				x = rangeInfo.endCol - rangeInfo.startCol + 1;
				y = rangeInfo.endRow - rangeInfo.startRow + 1;
				var param = {bIgnoreError: true};
				values = this.getRows(result, param);
			}
		}else{
			values = this.fetchScalaResult(indexParams);
		}
		if(dojo.isArray(values)){
			//it is union operator which should throw #VALUE!
			if(this.isRangeObj(values[0]))
				throw websheet.Constant.ERRORCODE["519"];
			// check each item in indexParams is number, if not should return error!
			var retValues = [];
			var len = values.length;
			for(var i = 0; i < len; i++){
				var rowValue = values[i];
				if(dojo.isArray(rowValue)){
					var retValue = [];
					var len2 = rowValue.length;
					for(var j = 0; j < len2; j++){
						var value = rowValue[j];
						value = this._iterateSingleIndexValue(value, parmArray);
						retValue.push(value);
					}
					retValues.push(retValue);
				}else{
					value = this._iterateSingleIndexValue(rowValue, parmArray);
					retValues.push(value);
				}
			}
			if(x != null && y != null){
				//for range object, if the cell is empty, the value should be #NUM!
				retValues.rowSize = y;
				retValues.colSize = x;
				retValues.defaultValue = websheet.Constant.ERRORCODE["504"];
			}
			return retValues;
		}else{
			var value = this._iterateSingleIndexValue(values, parmArray);
			return value;
		}
	},
	
	//get index value in parmArray
	_iterateSingleIndexValue:function(item, parmArray){
		if(this.Object.isCell(item)){
			if(item.isError()){
				item = item.getError();
			}else{
				item = item.getComputeValue();
			}
		}
		
		if(typeof item == "string"){
			try{
				item = this.parseNumber(item, this.LOCALE_NUM);
			}catch(err){
				item = websheet.Constant.ERRORCODE["519"];
			}
		}
		else if(typeof item == "boolean"){
			if(item)
				item = 1;
			else
				item = 0;
		}
		if(item && item.errorCode)
			return item;
		if(typeof item == "number"){
			if(item < 1 || item > parmArray.count)
				return websheet.Constant.ERRORCODE["504"];
			return this._calcSingleValue(parmArray, item);
		}
		
		return websheet.Constant.ERRORCODE["519"];
	},
	
	// pos should be a number
	_calcSingleValue: function(array, pos) {
		var value = this.cachePos[pos];
		if(value != null){
			return value;
		}
		if (!websheet.Helper.isInt(pos)) {
			// rounddown to get the nth_position for the small formula
			// roundup to get the nth_position for the large formula
			var roundFormula;
			if (this.bSMALLEST)
				roundFormula = websheet.functions.FormulaList.rounddown;
			else
				roundFormula = websheet.functions.FormulaList.roundup;
			
			var roundFunc = dojo.hitch(roundFormula, roundFormula._calc);
			var paramList = [];
			paramList[0] = this.args[1];
			pos = roundFunc(paramList);
		}
		var len = array.length;
		var index = 1;
		for(var i = 0; i < len; i++){
			var item = array[i];
			var num = item.num;
			if(num == undefined){
				num = 1;
			}
			if(index >= pos){
				this.cachePos[pos] = item.v;
				return item.v;
			}
			index += num;
		}
	}
});