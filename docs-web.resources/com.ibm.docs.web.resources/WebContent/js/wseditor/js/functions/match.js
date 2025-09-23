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

dojo.provide("websheet.functions.match");
dojo.require("concord.editor.CharEquivalence");

dojo.declare("websheet.functions.match", websheet.functions.FormulaBase, {
		
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 3;
	},
	/*int*/calc: function() {
		/*
		 * lookup_value: number, text or TRUE/FALSE
		 * lookup_array: A1:B1, or B1:B100, or {"a", "b", "c"}
		 * match_type: >=1, 0 , <=-1
		 * not case sensitive
		 */
		var values = this.args;
		var criterion = this._parseCriterion(values[0]);
		var match_type = 1;
		if (values.length == 3){
			var type2 = values[2].getType();
			var scalaResult = this.fetchScalaResult(values[2], false, false);
			if(dojo.isArray(scalaResult))
				throw websheet.Constant.ERRORCODE["524"];//#REF
			
			var value = this.getValue(scalaResult, type2, this.LOCALE_NUM);
			if(typeof value != "number")
				throw websheet.Constant.ERRORCODE["519"];//if "aaa", return #VALUE
			match_type = value;
		}
		var cellsResult = this._parseCells(values[1]);
		var isArray = cellsResult[0];
		var cells = cellsResult[1];
		return this._lookup(criterion,cells, match_type, isArray);
	},
	_parseCriterion: function(value){
		var criterion = this.fetchScalaResult(value);
		if (criterion === null)
			return 0;
		if (criterion === "")
			return criterion;
		var criterionType = typeof criterion;
		if(criterionType != "number" && criterionType != "string" && criterionType != "boolean")
			throw  websheet.Constant.ERRORCODE["519"];//#N/A
		return criterion;
	},
	_parseCells: function(value){
		var type1 = value.getType();
		var isArray = false; // 0 means range ,1 means array
	
		if(type1 == this.tokenType.ARRAYFORMULA_TOKEN){
			value = value.getValue();
			isArray = true;
		} else if (type1 == this.tokenType.FUNCTION_TOKEN) {
			value = value.getValue();
			// INDIRECT, OFFSET, CHOOSE return token
			if (this.Object.isToken(value)) {
				value = this.analyzeToken(value);
				if (this.Object.isReference(value))
					return this._parseCells(value);
			}

			if (dojo.isArray(value))
			    isArray = true;
			else
			    throw  websheet.Constant.ERRORCODE["7"];//#N/A
		} else {
			value = this.analyzeToken(value);
			if(dojo.isArray(value)) {
				var res = this.analyzeToken(value[0]);
				if (this.isRangeObj(res) && (value.length == 1))
						value = res;		
				else
					throw  websheet.Constant.ERRORCODE["7"];//#N/A
			}
		}
		var cells = null;
		// get the position 
		if(isArray){
			cells = [];
			if(value.length == 1){
				cells = value[0];
			} else if(value[0].length == 1){
				for(var i = 0; i < value.length; i++){
					cells[i] = value[i][0];
				}
			} else{
				throw  websheet.Constant.ERRORCODE["7"];//#N/A
			}
		}else{
			if(!this.Object.isReference(value))
				throw  websheet.Constant.ERRORCODE["7"];//#N/A
			var info = value._getRangeInfo();
			if (info.endRow == info.startRow){
				var rows = this.getRows(value, {bIgnoreError: true});
				cells = rows[0];
			}else if (info.endCol == info.startCol){
				var cols = this.getCols(value, {bIgnoreError: true});
				cells = cols[0];
			}else{
				throw  websheet.Constant.ERRORCODE["7"];//#N/A
			}
		}
		return [isArray, cells];
	},
	_lookup: function(criterion, cells, match_type, isArray)
	{
		
		var cellsLen = cells.length;
		if(cellsLen == 0){
			throw  websheet.Constant.ERRORCODE["7"];//#N/A
		}
		
		var find_pos = -1;	
		var criterionType = typeof criterion;
		if(criterionType == "string"){
			criterion = criterion.toLowerCase();
			if(match_type == 0){
				// handle wildcard
				criterion = this.wildcardMapping(criterion);
				criterion = new RegExp("^" + criterion + "$","ig");
			}
		}
		for(var i=0;i<cellsLen;i++)
		{
			var value = this._getCellValue(cells[i],isArray);
			if(typeof value == criterionType){
				var cmp_res = 0;
				if(criterionType=="string")
				{
					if(match_type == 0){
						// handle wildcard
						cmp_res = criterion.test(value)? 0:1;
					} else {
						cmp_res = value.toLowerCase().localeCompare(criterion);
					}
				} else {
					cmp_res = value - criterion;
				}
				
				if(cmp_res == 0 && match_type <= 0){
					find_pos = i;
				    break;
				}
				if((cmp_res > 0 && match_type > 0)
					|| (cmp_res < 0 && match_type < 0))
					break;
				if(match_type == 0){
					if(cmp_res == 0)
						find_pos = i;
				} else {
					find_pos = i;						
				}
			}				
		}			
		
		if (find_pos<0){
			throw  websheet.Constant.ERRORCODE["7"];//#N/A
		}
		
		return find_pos+1;
	},	
	_getCellValue: function(cell, isArray)
	{
		var value = null;
		if (isArray) {
			value = cell;
		} else if(cell)	{
			value = cell.getComputeValue();
				if(cell.isBoolean())
					value = Boolean(value);
		}
		return value;
	}
});