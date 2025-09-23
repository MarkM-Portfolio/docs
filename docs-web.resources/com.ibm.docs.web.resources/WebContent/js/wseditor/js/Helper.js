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

dojo.provide("websheet.Helper");
dojo.require("websheet.Constant");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.util.acf");
dojo.require("websheet.parse.ParsedRef");
websheet.Helper = {
	Event: websheet.Constant.Event,
//	charEQ: new concord.editor.CharEquivalence,
//	charCJKWidthMap:new concord.editor.CJKWidthCharMap,

	/**
	 * Regular expressions for matching textual reference strings
	 */
	rgx: {
		fileSheetlink: "'file:.+'#.+",
		simpleSheet: "([\\w]+)",
		//support multi-linguished sheet name
		sheet: "([^\\\\/\*\?]+)",// allow the import file with sheetname which contain '[' ']' to globalzation test.
								// allow sheet contains ":" to support 3D reference
								 
		sheet4Input:"([^\\\\/\:\*\?\\]\[]+)", // this for user input validation, add '[' ']' limit because it's invalid.
//		sheet: "([(^\')(\'$)]?(([\\w]+|[\']?[\\w\\s\\-]+)|#REF!)[\']?)",//"([\\w]+|[\'][\\w\\s\\-]+[\'])",
		doc: "([^\\\/\:\*\?\"\<\>\|]+)",
//		column: "([(^\$)]?[a-zA-Z]{1}|[a-hA-H]{1}[a-zA-Z]?|I[a-vA-V]?|aA[a-mA-M]{1}[a-jA-J]?|#REF!)",// "([(^\$)]?[a-zA-Z]{1}|[a-hA-H]{1}[a-zA-Z]?|I[a-vA-V]?)",
		column: "([(^\$)]?([a-zA-Z]{1}|[a-zA-Z]{2}|[aA][a-lA-L][a-zA-Z]|[aA][mM][a-jA-J]|#REF!))",
		row: "([(^\$)]?(([1-9][0-9]*)|#REF!))"
	},
	/*boolean*/_isLocaleSupport: function(locale) {
		return  locale.indexOf("fr")==0 ||
			    locale.indexOf("ko")==0;
	},
	
	_COLUMN_NAMES: [],
	
	_COLUMN_INDEX: {},

	/*int*/getColNum: function(/*string*/column) {
		if (column == null) {
			return;
		}
		var ret = this._COLUMN_INDEX[column];
		if (ret != null) {
			return ret;
		}
		var i = 0;
		ret = 0;
		var Z = 26;
		for ( var o = (column.length - 1); o >= 0; o--) {
			var ch = column.charCodeAt(o);
			var ba = 0;

			if (ch >= 65 && ch <= 90) // A-Z
				ba = ch - 64;
			else if (ch >= 97 && ch <= 122) // a-z
				ba = ch - 96;
			ret += ba * Math.pow(Z, i++);
		}
		this._COLUMN_INDEX[column] = ret;
		return ret;
	},

	/*string*/getColChar: function(/*int*/num) {
		var str = this._COLUMN_NAMES[num];
		if (str != null)
		{
			return str;
		}		
		
		var tempColNum = num;
		var Z = 26;
		var sb = "";

		while (tempColNum >= 1) {
			var mod = tempColNum % Z;
			var div = tempColNum / Z;
			if (mod < 1) {
				mod = Z;
				div = div - 1;
			}
			sb = this._intToColChar(mod) + sb;
			tempColNum = div;
		}
		this._COLUMN_NAMES[num] = sb;
		return sb;
	},

	/*string*/_intToColChar : function(/*integer*/i) {
		var ti = (i - 1) % 26;
		return String.fromCharCode(65 + ti);
	},
	
	/**
	 * The compiled regular expression for matching textual ref strings
	 */
	refMatch: null,
	
	newGuid:function(){
		var guid = "";
		for(var i = 1;i <= 32;i++){
			var n = Math.floor(Math.random()*16.0).toString(16);
			guid += n;
			if((i == 8)||(i == 12)||(i == 16)||(i == 20)){
				guid += "_";
			}
		}
		return guid;
	},
	
	convertToStringForBigNumber: function(cValue)
	{
		var constant = websheet.Constant;
		if((cValue >= constant.JavaLongMaxValue && cValue < constant.JsSnMinValue) || (cValue <= constant.JavaLongMinValue && cValue > constant.JsSnMaxValue_n))
		    cValue = cValue + "";
		return cValue;
	},
	
    cloneJSON: function (obj)
    {
        if (!obj)
            return obj;
        return JSON.parse(JSON.stringify(obj));
    },

	parseValue: function(value){
		var VALUETYPE = websheet.Constant.valueType;
		if(typeof value == "number")
			return  VALUETYPE.NUMBER;
		if(typeof value != "string")
			return VALUETYPE.UNKNOWN;
		if(value[0] == "\"")//string
			return VALUETYPE.STRING;
		else{
			var tmpV = value.toLowerCase();
			if(tmpV == "true" || tmpV == "false")
				return VALUETYPE.BOOLEAN;
			else
				return VALUETYPE.FORMULA;
		}
	},
	
	isRelativeRef: function(refMask){
		var refAddressType = websheet.Constant.RefAddressType;
		if(((refMask & refAddressType.ROW) > 0 && (refMask & refAddressType.ABS_ROW) == 0)
				|| ((refMask & refAddressType.COLUMN) > 0 && (refMask & refAddressType.ABS_COLUMN) == 0)
				|| ((refMask & refAddressType.END_ROW) > 0 && (refMask & refAddressType.ABS_END_ROW) == 0)
				|| ((refMask & refAddressType.END_COLUMN) > 0 && (refMask & refAddressType.ABS_END_COLUMN) == 0))
			return true;
		return false;
	},
	
	getRelativeRefType: function(refMask){
		var rType = 0;
		var cType = 0;
		var refAddressType = websheet.Constant.RefAddressType;
		if (((refMask & refAddressType.ROW) > 0 && (refMask & refAddressType.ABS_ROW) == 0)
			|| ((refMask & refAddressType.END_ROW) > 0 && (refMask & refAddressType.ABS_END_ROW) == 0)) {
			rType = 1;
		}
		if (((refMask & refAddressType.COLUMN) > 0 && (refMask & refAddressType.ABS_COLUMN) == 0)
			|| ((refMask & refAddressType.END_COLUMN) > 0 && (refMask & refAddressType.ABS_END_COLUMN) == 0)) {
			cType = 1;
		}
		return (rType << 1) + cType;
	},
	
    /*
	 * construct range info {sheetName, startCol, endCol, startRow,endRow}
	 * TODO: FORMULA, for row/column range type, the column/row index will be undefined, not sure if it impact
	 */
	getRangeInfoByRef: function(refValue,refType)
	{
		if(!refValue) return null;
		
		var rangeInfo = {};
		if(refType && refType == websheet.Constant.Event.SCOPE_SHEET)
		{
			rangeInfo.sheetName = websheet.Helper.handleRefValue(refValue,refType);
			return rangeInfo;
		}
		var Const = websheet.Constant;
		var parsedRef = websheet.Helper.parseRef(refValue);
		rangeInfo.sheetName = parsedRef.sheetName;
		rangeInfo.startRow = parsedRef.startRow;
		rangeInfo.endRow = parsedRef.endRow ;
		rangeInfo.endSheetName = parsedRef.sheetName;//might be null
		rangeInfo.startCol = parsedRef.startCol;
		rangeInfo.endCol = parsedRef.endCol;
		var type = parsedRef.getType();
		if(type == Const.RangeType.COLUMN){
			rangeInfo.startRow = 1;
			rangeInfo.endRow = Const.MaxRowNum;
		}else if(type == Const.RangeType.ROW){
			rangeInfo.startCol = 1;
			rangeInfo.endCol = Const.MaxColumnIndex;
		}
			
		return rangeInfo;
	},
    
	//parse a scientific number to two parts, for example 1.1e33, returns {exp=33,base=1.1}
	parseSciNum:function(num){
		var str = (num + "").toLocaleUpperCase();
		var tmps = str.split("E");
		
		var result = {};	
		
		if(tmps.length == 2 && tmps[1].length > 0)				
			result.exp = parseFloat(tmps[1]);			
		
		if(tmps[0].length > 0)
			result.base = parseFloat(tmps[0]);
		else
			result.base = 0;
				
		return result;	
	},
	
	// if true, display a number in formula bar/inline editor using scientific notation
	isSciNum4EditValue: function(num) {
		if (!this.isSciNum(num))
			return false;

		var sciNum = this.parseSciNum(num);
		if (!sciNum.exp)
			return false;
		
		// use a scientific notation when the absolute value is
		// 1. greater than 1e+20
		// 2. less than 1e+0 and the last non-zero digit is less than 1e-19
		var lastValuePlace = sciNum.exp < 0 && String(sciNum.base).indexOf(".") > 0 ? String(sciNum.base).length - 2 : 0;
		var result = (sciNum.exp > websheet.Constant.SciNumMinExp4Edit
					|| sciNum.exp - lastValuePlace < websheet.Constant.SciNumMaxExp4Edit_n);
		return result;
	},
	
	convertSciNum2General: function(num) {
		var sciNum = this.parseSciNum(num);
		var result = "";
		if (sciNum.exp != undefined && sciNum.base != undefined) {
			var bNegative = false;
			if (sciNum.base < 0) {
				sciNum.base = 0 - sciNum.base;
				bNegative = true;
			}
			var valueStr = sciNum.base.toString();
			var decimalPlace = valueStr.indexOf(".") > -1 ? valueStr.split(".")[1].length : 0;
			var value = valueStr.replace(".", "");
			var zeros = "";
			if (sciNum.exp < 0){
				for (var i = 0; i < - sciNum.exp - 1; ++i) zeros = zeros.concat("0");
				result = "0." + zeros + value;
			} else if (sciNum.exp >= decimalPlace) {
				for (var i = 0; i < sciNum.exp - decimalPlace; ++i) zeros = zeros.concat("0");
				result = value + zeros;
			} else {
				var idx = value.length - (decimalPlace - sciNum.exp);
				result = value.substring(0, idx) + "." + value.substring(idx);
			}
			if (bNegative) result = "-" + result;
		}	
		return result;
	},
	
	// if num is a scientific number, such as 1e33, return true, either, return false
	isSciNum:function(num){
		var str = (num + "");
		var len = str.length;
		for(var i = 0 ; i < len ; i ++)
		{
		  var ch = str.charAt(i);
		  if(ch == "E" || ch == "e")
		  	return true;
		}
		return false;
	},
		
	//if num is int, return true, either, return false
	isInt: function(num){
		return num % 1 == 0;
	},
	
	
	// checks to see if the passed value is a numeric value using a regular expression
	isNumeric: function(columnVal)
	{
		if(columnVal == null)
			return false;
			
		if(typeof columnVal == "number")
			return true;
						
		columnVal = columnVal + "";
		if(columnVal.length==0)
			return false;
			
		if(this.numeric.test(columnVal))
			return true;
		
		return false;
	},
	
	isValidNumeric: function(val) {
		// summary: true if val is a valid numeric, a valid numeric is neither NaN, nor Infinity.
		if (this.isNumeric(val)) {
			if (/[E|e]/.test(val)) {
				// is scientific, careful that it might be infinity, have to try parse first 
				// have to try parse first
				var v = parseFloat(val);
				if (isNaN(v) || !isFinite(v)) {
					// parse failed
					return false;
				} else {
					return true;
				}
			} else {
				return true;
			}
		} else {
			return false;
		}
	},
	
	isPercent: function(val)
	{
		if(val == null)
			return false;
		
		if(val==="")
			return false;
			
		if(this.percentReg.test(val))
			return true;
		
		return false;
	},
	
	trim:function(str){
		return str.replace(/(^\s*)|(\s*$)/g, "");
	},
	
	parseExRef: function(exRef){
		var tmp = websheet.Helper.exRefpattern.exec(exRef);
		if( tmp!= null){
			var uri = tmp[0];
			uri = uri.replace(websheet.Helper.exRefUri,"");
			var ref = exRef.replace(websheet.Helper.exRefpattern,"");

			return {"uri":uri, "ref":ref};
		}
	},
	
	handleRefValue: function(refValue, refType) {
		var newValue = refValue;

		switch(refType) {
//		case this.Event.SCOPE_ROW:
//			var index1 = refValue.lastIndexOf("!");
//			var index2 = refValue.lastIndexOf(":");
//			if( -1 == index2){
//				var name = refValue.substring(0,index1);
//				var tag = refValue.substring(index1);
//				if (tag){
//					tag = tag.replace(".","!A");
//				}
//				newValue = name + tag;
//			} else {
//				var sheetName = refValue.substring(0,index1);
//				var startIndex = refValue.substring(index1+1,index2);
//				var endIndex = refValue.substring(index2+1,refValue.length);
//				newValue = sheetName + "!A" + startIndex + ":A" + endIndex;
//			}
//		break;
//		case this.Event.SCOPE_COLUMN:
//			newValue = refValue + "1";
//		break;
            //Co-editing_Conflict
            //case this.SCOPE_SHEET:  //this line may be copied form other place
		case this.Event.SCOPE_SHEET:
			newValue = refValue.split("|")[0];
	        /**
	         * for insert/delete/rename/move the sheet use the real name don't need to normalize.
	         */
			//newValue = websheet.Helper.normalizeSheetName(newValue);
		break;
		}

		return newValue;   
	},
    
    /*
     * if the parsedRef is a correct reference(a cell or a range address) return true;
     * else return false;
     */
	isCorrectParsedRef: function(parsedRef)
	{
    	if(undefined == parsedRef || null == parsedRef)
    	{
    		return false;
    	}
    	if(undefined == parsedRef.row || null == parsedRef.row
    	 ||undefined == parsedRef.column || null == parsedRef.column
    	 ||( 0!= parsedRef.endRow && undefined == parsedRef.endColumn))
    	{
    		return false;
    	}
    	return true;
	},
	
	replaceSheetName: function(sheetName,strRef)
	{
		var newRef = strRef;
		if(strRef)
		{
			var index = strRef.lastIndexOf("!");
			if(index>= 0)
			{
				if(websheet.Helper.needSingleQuotePattern.test(sheetName)){
					sheetName = sheetName.replace(/\'/g,"''");	// change '' if the sheet name has '
					sheetName = "'" + sheetName + "'";
				}
				newRef = sheetName + strRef.substring(index,strRef.length);
			}
		}
		return newRef;
	},
	
	/*
	 * if parsedRef is a cell, there are two kinds: 
	 * 1, sheet1!A1
	 * 2, sheet1!A1:A1
	 * Make sure it's a valid ref if you want to use this.
	 */
	isCellRef: function(parsedRef)
	{
		if(parsedRef.startCol == parsedRef.endCol && parsedRef.startRow == parsedRef.endRow)
		{
			return true;
		}
		return false;
	},
	
	createVirtualRef: function(sheetName){
		if(websheet.Helper.needSingleQuotePattern.test(sheetName)){
			sheetName = sheetName.replace(/\'/g,"''");	// change '' if the sheet name has '
			sheetName = "'" + sheetName + "'";
		}
		return sheetName+"!A1:AZ65536";
	},
	/**
	 * parses a reference string into a parsed reference (object)
	 * If ref is not recognized by cell address, it will be treated as the whole sheet
	 * @param {String} ref
	 * @return {Object} parsed reference
	 */
	parseRef: function(ref, bNotMS) {
		
		if (!ref || !dojo.isString(ref)) {
			return ref;
		}
		//match the cell address doesn't have sheet name,if return null,then use another matcher to match
		var rangeMatch = this.rangeMatch;
		var rowsMatch = this.rowsMatch;
		var colsMatch = this.colsMatch;
		var invalidMatch = this.invalidrangeMatch;
		if(!bNotMS)
		{
			rangeMatch = this.mrangeMatch;
			rowsMatch = this.mrowsMatch;
			colsMatch = this.mcolsMatch;
			invalidMatch = this.minvalidrangeMatch;
			//#REF!#REF! will be interprete differently with ms and ods format
			var matches = invalidMatch.exec(ref);
			if(matches){
				return this.createParsedRef(matches[2], matches[3], null, null, null, null,
						websheet.Constant.RangeType.INVALID);
			}
		}
		
		var matches = rangeMatch.exec(ref);
		if(matches){
			//cell/Range
			//if matches[6] does not exist
			//IE: matches[6] == ""
			//FF: matches[6] == undefined
			return this.createParsedRef(matches[2], matches[3], matches[5], matches[10], matches[12], matches[14],
					websheet.Constant.RangeType.RANGE, bNotMS);
		}else
			matches = rowsMatch.exec(ref);
		if(matches){
			//row
			return this.createParsedRef(matches[2], null, matches[3], null, null, matches[6],
					websheet.Constant.RangeType.ROW, bNotMS);
		}else
			matches = colsMatch.exec(ref);
		if(matches)
			//col
			return this.createParsedRef(matches[2], matches[3], null, null, matches[5], null,
				websheet.Constant.RangeType.COLUMN, bNotMS);
		if (bNotMS){
			matches = invalidMatch.exec(ref);
			if(matches){
				return this.createParsedRef(matches[2], matches[3], null, null, null, null,
						websheet.Constant.RangeType.INVALID, bNotMS);
			}
		} else {
			var xmrowsMatch = this.xmrowsMatch;
			matches = xmrowsMatch.exec(ref);
			if (matches) {
				// change a ref like A1:XFD5 to rowRef
				return this.createParsedRef(matches[2], null, matches[5], null, null, matches[10],
						websheet.Constant.RangeType.ROW, bNotMS);
			}
		}
		return null;
	},
	//when start col/row number is large than end, then not only the number should be changed
	//but also the absolute address type for start/end col row
	swapAbsoluteType:function(refMask, bRow)
	{
		var STYPE = websheet.Constant.RefAddressType.ABS_COLUMN;
		var ETYPE = websheet.Constant.RefAddressType.ABS_END_COLUMN;
		if(bRow)
		{
			STYPE = websheet.Constant.RefAddressType.ABS_ROW;
			ETYPE = websheet.Constant.RefAddressType.ABS_END_ROW;
		}
		var endType = refMask & ETYPE;
		var startType = refMask & STYPE;
		if(endType !== startType)
		{
			refMask = refMask & (~ETYPE) & (~STYPE);
			if(endType)
				refMask |= STYPE;
			if(startType)
				refMask |= ETYPE;
		}
		return refMask;
	},
	/**
	 * creates a parsed reference object
	 *
	 *
	 * @param {String} sheet
	 * @param {String} column
	 * @param {int} row
	 * @param {String} endColumn
	 * @param {int} endRow
	 * @param (int) type: the type of the reference, value type is Constant.RangeType
	 * @param (bool) bNotNormalize: if returned ref is normalized or not, 
	 * 					such as the start row/column should less than end, 
	 * 					and column character should be upper, and sheet name contain single quote or not
	 * @return {Object} parsed reference
	 */
	createParsedRef: function(sheet, column, row, endSheet, endColumn, endRow, type, bNotMS) {
		var refMask = websheet.Constant.RefAddressType.NONE;
		for(var i=0;i<6;i++)
		{
			var a = arguments[i];
			if(a && a.length > 0)
			{
				var bAbs = (a.indexOf("$") == 0);
				if (bAbs)
					arguments[i] = a.substring(1);
				switch(i)
				{
				case 0:
					if (bAbs)
						refMask |= websheet.Constant.RefAddressType.ABS_SHEET;
					if (!bNotMS){
						if (sheet == "#REF"){// no '!' here because it has been eaten by sheet sepeartor
							refMask |= websheet.Constant.RefAddressType.INVALID_SHEET;
							sheet = "#REF!";
						}
					} else if (sheet == "#REF!")
						refMask |= websheet.Constant.RefAddressType.INVALID_SHEET;
					refMask |= websheet.Constant.RefAddressType.SHEET;
					break;
				case 1:
					if (bAbs)
						refMask |= websheet.Constant.RefAddressType.ABS_COLUMN;
					refMask |= websheet.Constant.RefAddressType.COLUMN;
					break;
				case 2:
					if (bAbs)
						refMask |= websheet.Constant.RefAddressType.ABS_ROW;
					refMask |= websheet.Constant.RefAddressType.ROW;
					break;
				case 3:
//					refMask |= websheet.Constant.AbsoluteAddressType.END_SHEET;
					break;
				case 4:
					if (bAbs)
						refMask |= websheet.Constant.RefAddressType.ABS_END_COLUMN;
					refMask |= websheet.Constant.RefAddressType.END_COLUMN;
					break;
				case 5:
					if (bAbs)
						refMask |= websheet.Constant.RefAddressType.ABS_END_ROW;
					refMask |= websheet.Constant.RefAddressType.END_ROW;
					break;
				}
			}
		}
		//if end sheet name exist, but does not equal to sheet, 
		//then consider it as the invalid parse ref
		if(endSheet ) {
			// Sheet1.A1:Sheet2.A3 we do not support ods format right now
			if(!bNotMS || (endSheet != sheet))
				return null;
		}
		if(sheet && !bNotMS) {
			// for MS support 3D reference Sheet1:Sheet2!A1:B2  'Sheet 1:Sheet3'!A:A 'Sheet1':Sheet2!1:2
			var s = sheet.split(":");
			if(s.length == 1) {
				// must both start and end with ' or not
				if (!(/^\'.*\'$/.test(sheet)) && (sheet.indexOf(" ") > -1 || sheet.indexOf("'") > -1))
					return null;
			} else if(s.length == 2) {
				sheet = s[0].replace(/^\'|\'$/,"");
				endSheet = s[1].replace(/^\'|\'$/,"");
				if(!(sheet.length > 0 && endSheet.length > 0))
					return null;
				if(sheet == endSheet) {
					endSheet = null;
				}
					
			} else // more than one colon Sheet1:Sheet2:Sheet3 is invalid
				return null;
		}
		
		var newSheetName = this.normalizeSheetName(sheet);
		var newEndSheetName = this.normalizeSheetName(endSheet);
		var sr = -1;
		var er = -1;
		var sc = -1;
		var ec = -1;
			if(column){
				column = column.toUpperCase();
				if(column == websheet.Constant.INVALID_REF)
					sc = -1;
				else
					sc = this.getColNum(column);
			}
			if(endColumn)
			{
				endColumn = endColumn.toUpperCase();
				if (endColumn == websheet.Constant.INVALID_REF ) {
					ec = -1;
				} else {
					ec = this.getColNum(endColumn);
				}
				if (sc != -1 && ec != -1)
				{
					if(ec < sc){
						var col = ec;
						ec = sc;
						sc = col;
						refMask = this.swapAbsoluteType(refMask);
					}
				}
			}
			if(row && (row !== websheet.Constant.INVALID_REF))
			{
				sr = parseInt(row);
			} else
				sr = -1;
			if(endRow && (endRow !== websheet.Constant.INVALID_REF))
			{
				er = parseInt(endRow);
				if(sr != -1)
				{
					if(er < sr)
					{
						var r = er;
						er = sr;
						sr = r;
						
						refMask = this.swapAbsoluteType(refMask, true);
					}
				}
			}else
				er = -1;
			
		var maxRow = websheet.Constant.MaxRowNum;
		if( (sr > maxRow) || (er > maxRow))
				return null;//not a valid reference
		if( sr == -1 && er > 0)  // 1:#REF!, A1:A#REF! are invalid
			return null;
		var maxCol = websheet.Constant.MaxColumnIndex;
		if( (sc > maxCol) || (ec > maxCol) )
			return null;//not a valid reference
		if(sc == -1 && ec > 0) //#REF!:B is invalid
			return null;
		return new websheet.parse.ParsedRef(newSheetName, sr, sc, er, ec, refMask, newEndSheetName);
		
	},	
	
	/*websheet.Constant.RangeType*/getRangeTypeByRefMask:function(refMask) {
		if( (refMask & websheet.Constant.DEFAULT_RANGE_MASK) == websheet.Constant.DEFAULT_RANGE_MASK)
			return websheet.Constant.RangeType.RANGE;
		if( (refMask & websheet.Constant.DEFAULT_CELL_MASK) == websheet.Constant.DEFAULT_CELL_MASK)
			return websheet.Constant.RangeType.CELL;
		if( (refMask & websheet.Constant.DEFAULT_ROWS_MASK) == websheet.Constant.DEFAULT_ROWS_MASK)
			return websheet.Constant.RangeType.ROW;
		if( (refMask & websheet.Constant.DEFAULT_COLS_MASK) == websheet.Constant.DEFAULT_COLS_MASK)
			return websheet.Constant.RangeType.COLUMN;
		return websheet.Constant.RangeType.INVALID;
	},
	
    tokenCompare: function(arr1, arr2){
    	if(dojo.isArray(arr1)&& dojo.isArray(arr2)){
    		if(arr1.length != arr2.length)
    			return false;
    		for(var i = 0; i< arr1.length; i++){
    			if(!this.tokenCompare(arr1[i],arr2[i]))
    				return false;
    		}
    		return true;
    	}
    	else 
    		return arr1 === arr2;
    },
	
	escapeXml: function(str, noSingleQuotes, ignoreIE) {
		return concord.util.acf.escapeXml(str, noSingleQuotes, ignoreIE);
	},
	
	//get the sheet name which should remove the first/last single quote, and remove the duplicate signle quote when parse ref
	//the returned sheet name might exist in the document model
	normalizeSheetName: function(sheetName) {
		if(dojo.isString(sheetName))
		{
			//remove the first and last single quote '
			sheetName = sheetName.replace(this.singleQuotePattern,"");
			//remove the duplicate ' if there are two continuous single quote
			sheetName = sheetName.replace(this.twoSingleQuotePattern, "$1");			
		}
		return sheetName;
	},
	
	isValidSheetName: function(sheetName) {
	    if(!dojo.isString(sheetName))
		    return false;
		
	    //If the sheet name contains only white space, pass
		if(dojo.trim(sheetName).length==0)
			return true;
		var isValid = new RegExp('^' + this.rgx.sheet4Input + '$').test(sheetName);
		if(isValid && sheetName.length!=0 && (sheetName.charAt(0)=="'" || sheetName.charAt(sheetName.length-1)=="'")) // not allow begin and end with '
			isValid=false;
		
		return isValid;
	},
	
	isValidName: function(nameText){
		var constant = websheet.Constant;
		if(!dojo.isString(nameText) || !nameText)
			return constant.NameValidationResult.INVALID_EMPTY;
		
		var lowerName = nameText.toLocaleLowerCase();
		
		if(lowerName == "true" || lowerName == "false")
			return constant.NameValidationResult.INVALID_KEYWORDS;
		
		if(lowerName.indexOf("_xl") == 0)//built-in defined name in excel
			return constant.NameValidationResult.INVALID_OTHER;
		
		if(lowerName == "rc" || lowerName == "r" || lowerName == "c")
			return constant.NameValidationResult.INVALID_RC;
		
		if(!this.validName.test(nameText))
			return constant.NameValidationResult.INVALID_OTHER;
		
		var matches = this.invalidNameMatchRC.exec(lowerName);
		if(matches){
			var r, c, rn, cn;
			if(matches[1] && matches[2]){
				var rn = parseInt(matches[2]);
				 if(rn > 0 && rn <= constant.MaxRowNum)
					 return constant.NameValidationResult.INVALID_RC;
		         else if(rn == 0 || rn > constant.MaxRowNum)
		        	 return constant.NameValidationResult.VALID;
			}
			if(matches[3] && matches[4]){
				var cn = parseInt(matches[4]);
				if(cn > 0 && cn <= constant.MaxColumnCount)
		            return constant.NameValidationResult.INVALID_RC;
			}
		}

		var matches = this.invalidNameMatch.exec(nameText);
		if(matches){
			if(matches[4] && parseInt(matches[4]) <= constant.MaxRowNum)
				return constant.NameValidationResult.INVALID_OTHER;
		}
		return constant.NameValidationResult.VALID;
	},
	/**
	 * Merges 2 parsed reference, returns the refernce that is the union of the 2 references. The references must be in the same sheet.
	 * For performance consideration, this function changes references in place in stead of cloning each one. For the cases:
	 * 
	 * 1) Cell + Cell: changes ref2
	 * 2) Cell + Range: changes ref2 (the range)
	 * 3) Range + Cell: changes ref1 (the range)
	 * 4) Range + Range: changes ref2 and ref1. ref2 becomes the result, ref1 changes to a temp value
	 */
	mergeRef: function(ref1, ref2) {
		//if one of ref1, ref2 contain #REF!,should return the valid one
		var isV1 = ref1.isValid();
		var isV2 = ref2.isValid();
		if(!isV1 || !isV2){
			if(!isV2)
				return ref1;
			else
				return ref2;
		}
		var type1 = ref1.getType();
		var type2 = ref2.getType();
		if (type1 == websheet.Constant.RangeType.CELL) {
			if (type2 == websheet.Constant.RangeType.CELL) {
				var row1 = ref1.startRow;
				var column1 = ref1.startCol;
				var row2 = ref2.startRow;
				var column2 = ref2.startCol;
				if (row2 < row1) {
					ref2.endRow = row1;
				} else {
					ref2.startRow = row1;
					ref2.endRow = row2;
				}
				if (column2 < column1) {
					ref2.endCol = column1;
				} else {
					ref2.startCol = column1;
					ref2.endCol = column2;
				}
				ref2.refMask |= websheet.Constant.RefAddressType.END_COLUMN | websheet.Constant.RefAddressType.END_ROW;
				return ref2;
			} else {
				var row1 = ref1.startRow;
				var column1 = ref1.startCol;
				var row2 = ref2.startRow;
				var column2 = ref2.startCol;
				var endRow2 = ref2.endRow;
				var endColumn2 = ref2.endCol;
				if (row1 < row2) {
					// move row2 up to row1
					ref2.startRow = row1;
				}
				if (row1 > endRow2) {
					ref2.endRow = row1;
				}
				if (column1 < column2) {
					ref2.startCol = column1;
				}
				if (column1 > endColumn2) {
					ref2.endCol = column1;
				}
				return ref2;
			}
		} else {
			if (type2 == websheet.Constant.RangeType.CELL) {
				return this.mergeRef(ref2, ref1);
			} else {
				// make ref3 as the start cell position of ref1
				var ref3 = new websheet.parse.ParsedRef(ref1.sheetName, ref1.startRow, ref1.startCol, ref1.startRow, ref1.startCol, websheet.Constant.CELL_MASK);
				ref2 = this.mergeRef(ref3, ref2);
				// change ref3 as the end cell position of ref1
				ref3.startRow = ref3.endRow = ref1.endRow;
				ref3.startCol = ref3.endCol = ref1.endCol;
				ref2 = this.mergeRef(ref3, ref2);
				// ref2 becomes the result
				return ref2;
			}
		}		
		
	},
	
	//the address might composed by several range address with space as separator	
	/* Array*/ getRanges: function(address, separator){
	    var sep = "'";
	    if(address.length > 1 && address[0] == "(" && address[address.length - 1] == ")")
	    	address = address.substring(1, address.length - 1);
	    
	    if(!separator)
	    	separator = ",";
	    var patt = separator + "+";
	    var pattern = new RegExp(patt, "g");
	    var newRanges = [];
	    
	    if(address){
	      var partRange ="" ;
	      var count = 0;
	      var strs = address.split(pattern);
	      var splits = address.match(pattern);
	      for(var i=0 ; i < strs.length - 1; i++){
	    	  var range = strs[i];
	    	  var n = 0;
	    	  while(true){
	    		  n = range.indexOf(sep, n);
	    		  if( n != -1){
		            count++;
		            n++;
		          }else
		            break;
	    	  }
	    	  partRange += range;
	    	  if(count%2 == 0){
	    		  newRanges.push(partRange);
	    		  partRange = "";
	    		  count = 0;
	    	  }else{
	    		  partRange += splits[i];
	    	  }
	      	}
	    	 partRange += strs[i];
	    	 newRanges.push(partRange);
	      }
	    return newRanges;
	  },
	  
	//according to type (cell/range) and absoluteType to add indent for start/end col/row index
	//and swap absoluteType is after add indent, the start is larger than end
	//start/end should be number or #REF!
	addIndentForAddress:function(start, end, indent, bRow, type, refMask)
	{
		var ret = {};
		if(bRow)
		{
			var bAbsoluteStart = refMask & websheet.Constant.RefAddressType.ABS_ROW;
			var bAbsoluteEnd = refMask & websheet.Constant.RefAddressType.ABS_END_ROW;
		}else
		{
			var bAbsoluteStart = refMask & websheet.Constant.RefAddressType.ABS_COLUMN;
			var bAbsoluteEnd = refMask & websheet.Constant.RefAddressType.ABS_END_COLUMN;
		}
		//if both start/end row address are absolute, do nothing
		if(!(bAbsoluteStart && bAbsoluteEnd))
		{
			if(start != websheet.Constant.INVALID_REF)
			{
				if(typeof start == "string" && !bRow)
					start = this.getColNum(start);
			}else
				start = -1;
			
			if(!bAbsoluteStart)
			{
				if(start != -1)
				{
					start += indent;
				}
			}
			if(end != websheet.Constant.INVALID_REF)
			{
				if(typeof end == "string" && !bRow)
					end = this.getColNum(end);
			}else
				end = -1;
			
			if(!bAbsoluteEnd)
			{
				if(end != -1)
				{
					end += indent;
				}
			}
			if(type != websheet.Constant.RangeType.CELL)
			{
				if(start > end)
				{
					var n = end;
					end = start;
					start = n;
					refMask = this.swapAbsoluteType(refMask, bRow);
				}
			}
			var max = websheet.Constant.MaxRowNum;
			if(!bRow)
				max = websheet.Constant.MaxColumnIndex;
			start = start > max? max:start;
			end = end > max? max:end;
		}
		ret.start = start;
		ret.end = end;
		ret.refMask = refMask;
		return ret;
	},	  
	
	isValidDocName: function(docName) { 
		var isValid = false;
		if (dojo.isString(docName) && dojo.trim(docName).length) {
			isValid = new RegExp('^' + this.rgx.doc + '$').test(docName);
		}
		return isValid;
	},
	
	//get the value of attribute which is defined in the css of node
	/*getStyle: function(node,attribute){
		if(dojo.isIE){
			return node.currentStyle?node.currentStyle[attribute]:'';
		}
		return document.defaultView.getComputedStyle(node,null)[attribute];   
	},*/

	// a random seed to generate hashed code
	HASH_SEED: 17,
	// a random integer as an initialize value for hashcode
	HASH_INIT: 7,
	// calc hash code by provided object
	hashCode: function(o, /* base hash code */ h) {
		if (h == undefined) {
			h = this.HASH_INIT;
		}
		
		h *= this.HASH_SEED;
		
		if (o != undefined) {
			var t = typeof(o);
			if ("number" == t && this.isInt(o)) {
				// is integer
				h += o;
			} else if ("boolean" == t) {
				h += o ? 21 : 22; // randomly pick 2 int for boolean true and false
			} else {
				// others, add o as string
				h += this._strHashCode(o + "");
			}
		}
		// normalize h
	    if(h > 0x7fffffff || h < 0x80000000)
		{
			// high end(32b+) of h
			// since bitwise ops are 32bit only, to save the high end of h,
			// we need to use division.
			var high = h / 0x100000000;
			// low end of h
    		h &= 0xffffffff;
    		if (high >= 1 || high <= -1) {
    			// leaves something in high end
    			h += high;
    			h &= 0xffffffff;
    		}
		}
		return h;		
	},
	
	// get hashCode for a string, returns integer
	_strHashCode: function(str)
	{
    	var h = 43; // if the str.length == 0, there would be a number > 0
    	var len = str.length;

    	for(var i = 0; i < len; i++)
    	{
    		var tmp = str.charCodeAt(i);
    		h = 31 * h  + tmp;
    		if(h > 0x7fffffff || h < 0x80000000)
    		{
        		h = h & 0xffffffff;
    		}
    	}

    	return h;
	},
	
	/*verify if valid url
	 * the pattern should same with the pattern in MedelHelper.java's method isValidURL
	 * */	
	isValidURL :function (url) {
		if(!(typeof url== "string"))
			return false;
		var tmp = url.toLowerCase();
		var regexpLoose =/^([\d\w\/\@\.\%\+\-\=\&amp;\?\!\:\\\&quot;\'\,\|\~\;\#])*$/i;
		
		if(tmp.indexOf("http://")==0){
			tmp = tmp.substring(7);// 7 is length of http://				
			return regexpLoose.test(tmp);				
		}
		if(tmp.indexOf("https://")==0){
			tmp = tmp.substring(8);// 8 is length of https://				
			return regexpLoose.test(tmp);			
		}
		if(tmp.indexOf("ftp://")==0){
			tmp = tmp.substring(6);// 6 is length of ftp://				
			return regexpLoose.test(tmp);			
		}
		if(tmp.indexOf("www.")==0){
			if(tmp.length == 4)// 4 is length of www. if value is www. return false
				return false;
			tmp = tmp.substring(4);
			if(tmp.indexOf(".")==0)//www.. return false
	    		return false;
			return regexpLoose.test(tmp);
		}	
		var regexp =/^((http(s|)\:\/\/)|(ftp\:\/\/(([\u0020-\u00fe]+:[\u0020-\u00fe]+|anonymous)@)?))((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])(\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])){3}|([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6})(:\d+)?(\/([\d\w\@\.\%\+\-\=\&amp;\?\:\\\&quot;\'\,\|\~\;\#])*)*$/i;
		
		return regexp.test(url);
	},
	
	/*int or float*/ getSerialNumberWithDate: function(date, /*boolean*/ bInteger){
		//ms in one day
		var MsinDay = 86400000;
		var baseDate = new Date(websheet.baseDateStr);
		var sn = (date.getTime() - baseDate.getTime() - this.getMSDifByTimezoneOffset(this.getTimezoneOffset(date), this.getTimezoneOffset(baseDate))) / MsinDay;
		if (bInteger)
			sn = Math.floor(sn);
		return sn;
	},
	
	/*int*/ getSerialNumberWithYMD: function(year, month, day){
		year=Math.floor(year);
		day=Math.floor(day);
		month=Math.floor(month);
		// year in [0,1899], add 1900 in excel.
		// Date function accept year in [0,99] (+1900), [1900,9999]
		if (year > 99 && year < 1899)
			year += 1900;
		
		var date=new Date(year, month, day);
		return this.getSerialNumberWithDate(date, true);
	},
	
	/*int*/ getMSWithSerialNumber: function(sn){
		if(!this.checkDateValidSpan(sn))
			return null;
		//ms in one day
		var MsinDay = 86400000; 
		var baseSN=this.getSerialNumberWithYMD(1970,0,1);// sn for 1970-01-01 this.getSerialNumberWithYMD(1970,0,1);
     	var ms = Math.floor( (sn - baseSN) * MsinDay);
    	return ms;
	},
	
	/**
	 * returns the timezone offset of a date.
	 * Fix the issue that Date.getTimezoneOffset() can not return the second part in chrome 67+
	 * 
	 * @param date
	 * @returns timezone offset in minutes
	 */
	/*float*/ getTimezoneOffset: function(date) {
		return (date.getTime() - new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds())).getTime()) / 60000;
	},
	
	/**
	* Set the timezone offset of a date,
    * to fix the time if it is Daylight Saving Time
	*/
	/*void*/ setTimezoneOffset: function(date) {
		date.setTime(date.getTime() + this.getMSDifByTimezoneOffset(this.getTimezoneOffset(date), 0));
	},
	
	checkDateValidSpan: function(sn){
		var snMax = websheet.baseDateStr == websheet.Constant.baseDateStr ? 2958465 : 2957003;// sn for 9999-12-31 this.getSerialNumberWithYMD(9999,11,31);
		var snMin = 0 ;  //0 is sn for 1899-12-30   this.getSerialNumberWithYMD(1899,11,30);

		if(sn>=snMax+1 || sn<snMin)
			return false;
		return true;
	},
	
	getMSDifByTimezoneOffset: function(o1,o2){
		var dif=o1-o2;
    	if(dif!=0){
    		return  Math.round(dif*60*1000);
    	} else
    		return 0;
	},
	
	_getDate: function(sn){
		var d = this.getMSWithSerialNumber(sn);
		if(d == null)
			return null;
		d = new Date(d);
		if(!d)
			return null;
		this.setTimezoneOffset(d);
		return d;
	},
	
	weekday: function(sn, isDate)
	{
		var d = sn;
		if(!isDate)
			d = this._getDate(sn);
		if(!d)
			return null;
		
		return d.getDay();
	},
	
	month: function(sn, isDate)
	{
		var d = sn;
		if(!isDate)
			d = this._getDate(sn);
		if(!d)
			return null;
		return d.getMonth() + 1;
	},
	
	year: function(sn, isDate)
	{
		var d = sn;
		if(!isDate)
			d = this._getDate(sn);
		if(!d)
			return null;
		return d.getFullYear();
	},	
	
	//val and base are serial number of date
	isLastWeek: function(val, base)
	{
		return this._weekCompare(val, base, "last");
	},
	
	isNextWeek: function(val, base)
	{
		return this._weekCompare(val, base, "next");
	},
	
	isThisWeek: function(val, base)
	{
		return this._weekCompare(val, base, "this");
	},
	
	_weekCompare: function(val, base, compare)
	{
		var date = base;
		var isDate = false;
		if(base == null){
			date = new Date();
			base = this.getSerialNumberWithDate(date, true);
			isDate = true;
		}
		
		var weekday = this.weekday(date, isDate) + 1;
		if(weekday == null)
			return false;
		val =  parseInt(val);
		switch(compare){
			case "last":
				return base - val >= weekday && base - val < weekday + 7;
			case "this":
				return base - val <=  weekday - 1 && val - base <= 7 - weekday;
			case "next":
				return val - base > 7 - weekday && val - base < 15 - weekday;
			default:
				break;
		}
	},
	
	//val and base are serial number of date
	isLastMonth: function(val, base)
	{
		return this._monthCompare(val, base, "last");
	},
	
	isThisMonth: function(val, base)
	{
		return this._monthCompare(val, base, "this");
	},
	
	isNextMonth: function(val, base)
	{
		return this._monthCompare(val, base, "next");
	},
	
	_monthCompare: function(val, base, compare)
	{
		var isDate = false;
		if(base == null){
			base = new Date();
			isDate = true;
		}
		
		var m = this.month(val);
		var y = this.year(val);
		var bm = this.month(base, isDate);
		var by = this.year(base, isDate);
		
		if(m == null || y == null || bm == null || by == null)
			return false;
		
		switch(compare){
		case "last":
			if(m != 12)
				return m == bm - 1 && y == by;
			return bm == 1 && y == by - 1;
		case "this":
			return m == bm && y == by;
		case "next":
			if(m != 1)
				return m == bm + 1 && y == by;
			return bm == 12 && y == by + 1;
		default:
			break;
		}
	},
	
	getDaysOfYear: function(sn1, sn2, basis) {
		switch (basis) {
			case 0:
			case 2:
			case 4: return 360;
			case 3: return 365;
			case 1: return this._getDaysOfYearBasis1(sn1, sn2);
		}
	},
	
	_isLeapYear: function(year) {
		if(year % 4 != 0)
			return false;
		if(year % 400 == 0)
			return true;
		if(year % 100 == 0)
			return false;
		return true;
	},
	
	_isLastOfFeb: function(day, year) {
		if(this._isLeapYear(year))
			return day == 29;
		return day == 28;
	},
	
	getDaysOfFraction: function(sn1, sn2, basis) {
		if(sn1 == sn2)
			return 0;
		if(sn1 > sn2) {
			var tmp = sn1; sn1 = sn2; sn2 = tmp;
		}
		switch (basis) {
			case 0: return this._getDaysBasis0(sn1, sn2);
			case 1: 
			case 2: 
			case 3: return this._getDaysBasis123(sn1, sn2);
			case 4: return this._getDaysBasis4(sn1, sn2);
		}
	},
	
	_getDaysBasis0: function(sn1, sn2) {
		var date1 = this._getDate(sn1);
		var date2 = this._getDate(sn2);
		var day1 = date1.getDate(); var month1 = date1.getMonth()+1; var year1 = date1.getFullYear();
		var day2 = date2.getDate(); var month2 = date2.getMonth()+1; var year2 = date2.getFullYear();

		if ((day1 == 31 || day1 == 30) && day2 == 31) {
			day2 = 30;
		}
		if (day1 == 31) {
			day1 = 30;
		}
		if(month1 == 2 && this._isLastOfFeb(day1, year1)) {
			day1 = 30;
			if(month2 == 2 && this._isLastOfFeb(day2, year2))
				day2 = 30;
		}
		
		return (year2-year1) * 360 + (month2-month1) * 30 + day2-day1;
		
	},
	
	_getDaysBasis123: function(sn1, sn2) {
		return sn2 - sn1;
	},
	
	_getDaysBasis4: function(sn1, sn2) {
		var date1 = this._getDate(sn1);
		var date2 = this._getDate(sn2);
		var day1 = date1.getDate(); var month1 = date1.getMonth()+1; var year1 = date1.getFullYear();
		var day2 = date2.getDate(); var month2 = date2.getMonth()+1; var year2 = date2.getFullYear();
		
		if(day1 == 31)
			day1 = 30;
		if(day2 == 31)
			day2 = 30;
		
		return (year2-year1) * 360 + (month2-month1) * 30 + day2-day1;
	},
	
	_isGreaterThanOneYear: function(date1, date2) {
		var day1 = date1.getDate(); var month1 = date1.getMonth()+1; var year1 = date1.getFullYear();
		var day2 = date2.getDate(); var month2 = date2.getMonth()+1; var year2 = date2.getFullYear();
		if (year1 == year2)
			return false;
		if (year1 + 1 != year2)
			return true;
		if(month1 != month2)
			return month1 < month2;
		return day1 < day2;
	},
	
	_shouldCountFeb29: function(date1, date2) {
		var day1 = date1.getDate(); var month1 = date1.getMonth()+1; var year1 = date1.getFullYear();
		var day2 = date2.getDate(); var month2 = date2.getMonth()+1; var year2 = date2.getFullYear();
		var startWithLeapYear = this._isLeapYear(year1);
		
		if(startWithLeapYear && year1 == year2)
			return true;
		
		var endWithLeapYear = this._isLeapYear(year2);
		if(!startWithLeapYear && !endWithLeapYear)
			return false;
		
		if(startWithLeapYear) {
			if(month1 == 1 || month1 == 2)
				return true;
			return false;
		}
		if(endWithLeapYear) {
			if(month2 == 1)
				return false;
			if(month2 == 2)
				return day2 == 29;
			return false;
		}
		return false;
	},
	
	_getDaysOfYearBasis1: function(sn1, sn2) {
		if(sn1 > sn2) {
			var tmp = sn1; sn1 = sn2; sn2 = tmp;
		}
		var date1 = this._getDate(sn1);
		var date2 = this._getDate(sn2);
		var year1 = date1.getFullYear();
		var year2 = date2.getFullYear();
		if (this._isGreaterThanOneYear(date1, date2)) {
			var days = 0;
			for(var i = year1; i <= year2; ++i)
				days += (this._isLeapYear(i) ? 366 : 365);
			return days / (year2 - year1 + 1);
		}
		else if (this._shouldCountFeb29(date1, date2)) {
			return 366;
		} else {
			return 365;
		}
	},
	
	/**
	 * range1, range2 are range info {sheetName, endSheetName, startCol, endCol, startRow,endRow}
	 * return type: websheet.Constant.RangeRelation
	 */
	compareRange: function(range1, range2)
	{
		var sC1 = range1.startCol;
		var eC1 = range1.endCol;
		var sR1 = range1.startRow;
		var eR1 = range1.endRow;
		if(sC1 < 0 || eC1 < 0 || sR1 < 0 || eR1 < 0)
			return -1;
		var sC2 = range2.startCol;
		var eC2 = range2.endCol;
		var sR2 = range2.startRow;
		var eR2 = range2.endRow;
		if(sC2 < 0 || eC2 < 0 || sR2 < 0 || eR2 < 0)
			return -1;
		var hasSameSheet = false;
		if(range1.sheetName == null && range2.sheetName == null)
			hasSameSheet = true;
		else if(range1.sheetName === range2.sheetName)
			hasSameSheet = true;
		if( hasSameSheet )
		{
			if((sR1 == sR2) && (eR1 == eR2) && (sC1 == sC2) && (eC1 == eC2))
				return websheet.Constant.RangeRelation.EQUAL;
			if((sR1 >= sR2) && (eR1 <= eR2) && (sC1 >= sC2) && (eC1 <= eC2))
				return websheet.Constant.RangeRelation.SUBSET;
			if((sR1 <= sR2) && (eR1 >= eR2) && (sC1 <= sC2) && (eC1 >= eC2))
				return websheet.Constant.RangeRelation.SUPERSET;
			var rowHasIntersect = !((eR1 < sR2) || (eR2 < sR1));
			var colHasIntersect = !((eC1 < sC2) || (eC2 < sC1));
			if(rowHasIntersect && colHasIntersect){
				return websheet.Constant.RangeRelation.INTERSECTION;
			}else
				return websheet.Constant.RangeRelation.NOINTERSECTION;
		}
		return -1;
	},
	
	//return intersection of two ranges, range1, range2 are range info
	rangeIntersection: function(range1, range2)
	{
		var relation = websheet.Helper.compareRange(range1, range2);
		
		if(relation == websheet.Constant.RangeRelation.EQUAL)
			return range1;
		if(relation == websheet.Constant.RangeRelation.SUBSET)
			return range1;
		if(relation == websheet.Constant.RangeRelation.SUPERSET)
			return range2;
		if(relation == websheet.Constant.RangeRelation.INTERSECTION){
			var sR = range1.startRow >=  range2.startRow ? range1.startRow :  range2.startRow;
			var eR = range1.endRow <= range2.endRow ? range1.endRow : range2.endRow;
			var sC = range1.startCol >= range2.startCol ? range1.startCol : range2.startCol;
			var eC = range1.endCol <= range2.endCol ? range1.endCol : range2.endCol;
			var info = {
				sheetName:range1.sheetName,
				startRow:sR,
				endRow:eR,
				startCol:sC,
				endCol:eC
			};
			return info;
		}
		
		return null;
	},
	
	/*
	 * The helper function to get cell address
	 */
	/*string*/getCellAddr: function(sheet, row, col) {
		return this.getAddressByIndex(sheet, row, col, null, null, null, {refMask: websheet.Constant.CELL_MASK});
	},
	
	/**
	 * according to the row/column index, return the range or cell address
	 * they are 1-based
	 * if any endRow or endCol set then return address with ":"
	 * refMask:
	 * 		ROWS_MASK   	  -> sheet1!3
	 * 		COLS_MASK		  -> sheet1!A
	 * 		CELL_MASK 		  -> sheet1!a1
	 * 		RANGE_MASK        -> sheet1!a3:b4
	 * invalidRef: true		  ->Sheet1!A#REF!, Sheet1!#REF!1
	 * 			 : false	  ->Sheet1!#REF!
	 */
	/*string*/getAddressByIndex:function(sheet, startRow, startCol, endSheet, endRow, endCol, params)
	{
		if (!params) params = {};
		var type = params.type;
		var refMask = params.refMask;
		if (!refMask)
			refMask = websheet.Constant.RANGE_MASK;
		var address = [];
		var wconst = websheet.Constant;
		var sheetAddress = "";
		if ((refMask & wconst.RefAddressType.SHEET) > 0 && sheet)
		{   
			var sheetPart = [];
			// AbsoluteToken doesn't needed if sheet id is using.
			// defect 48681, abs_sheet is not allowed in xls, so even it is old draft which contains abs_sheet, it should be removed
//			if(refMask & wconst.RefAddressType.ABS_SHEET)
//				sheetPart.push(wconst.AbsoluteToken);
			
			if ((refMask & wconst.RefAddressType.INVALID_SHEET) > 0)
				sheet = wconst.INVALID_REF;
			else {
				var bNeedSingleQuote = false;
				if(this.needSingleQuotePattern.test(sheet)){
					bNeedSingleQuote = true;
					sheet = sheet.replace(/\'/g,"''");	// change '' if the sheet name has '
				}
				if(endSheet && (endSheet != sheet)) {
					if(this.needSingleQuotePattern.test(endSheet)){
						bNeedSingleQuote = true;
						endSheet = endSheet.replace(/\'/g,"''");	// change '' if the sheet name has '
					}
					sheet = sheet + ":" + endSheet;
				}
				if (bNeedSingleQuote)
					sheet = ["'", sheet, "'"].join(""); 
			}

			sheetPart.push(sheet);
			if(sheet != wconst.INVALID_REF)
				sheetPart.push(wconst.TokenStr.XLS.SHEET_SEP);
			sheetAddress = sheetPart.join("");
		}
		
		if(refMask & wconst.RefAddressType.COLUMN){
			if(typeof startCol == "number") {
				if (!this.isValidCol(startCol) ){
					if(!params.invalidRef)
						return sheetAddress + wconst.INVALID_REF;
					address.push(wconst.INVALID_REF);
				} else {
					if(refMask & wconst.RefAddressType.ABS_COLUMN)
						address.push(wconst.AbsoluteToken);
					address.push(websheet.Helper.getColChar(startCol));
				}
			} else {
				if(refMask & wconst.RefAddressType.ABS_COLUMN)
					address.push(wconst.AbsoluteToken);
				address.push(startCol);
			}
		}
		
		if(refMask & wconst.RefAddressType.ROW){
			if (!this.isValidRow(startRow)){
				if(!params.invalidRef)
					return sheetAddress + wconst.INVALID_REF;
				address.push(wconst.INVALID_REF);
			} else {
				if(refMask & wconst.RefAddressType.ABS_ROW)
					address.push(wconst.AbsoluteToken);
				address.push(startRow);
			}
		}
		var bEndCol = refMask & wconst.RefAddressType.END_COLUMN;
		var bEndRow = refMask & wconst.RefAddressType.END_ROW;
		if (bEndRow || bEndCol){
			address.push(":");
			if (bEndCol) {
				if (endCol == null)
					endCol = startCol;
				if (typeof endCol == "number") {
					if(!this.isValidCol(endCol)){ // or > maxcolcount(1024)
						if(!params.invalidRef)
							return sheetAddress + wconst.INVALID_REF;
						address.push(wconst.INVALID_REF);
					}else {
						if(refMask & wconst.RefAddressType.ABS_END_COLUMN)
							address.push(wconst.AbsoluteToken);
						address.push(websheet.Helper.getColChar(endCol));
					}
				} else {
					if(refMask & wconst.RefAddressType.ABS_COLUMN)
						address.push(wconst.AbsoluteToken);
					address.push( endCol);
				}
			}
			if(bEndRow){
				if(endRow == null)
					endRow = startRow;
				if (!this.isValidRow(endRow)){
					if(!params.invalidRef)
						return sheetAddress + wconst.INVALID_REF;
					address.push(wconst.INVALID_REF);
				} else {
					if(refMask & wconst.RefAddressType.ABS_END_ROW)
						address.push(wconst.AbsoluteToken);
					address.push(endRow);
				}
			}
		}
		
		return sheetAddress + address.join("");
	},
	
	/*boolean*/isValidRow: function(/*int*/row){
		if((row >= 1) && (row <= websheet.Constant.MaxRowNum))
			return true;
		return false;
	},
	
	/*boolean*/isValidCol: function(/*int*/col){
		if((col >= 1) && (col <= websheet.Constant.MaxColumnIndex))
			return true;
		return false;
	},
	
	putToArray:function(array, index, obj)
	{
		var s = array.length;
		if (index < s) {
			array[index] = obj;
		} else {
			for ( var i = s; i < index; i++) {
				array.push(null);
			}
			array.push(obj);
		}
	},
	
	//////////////////////////////////For Area udpate util function/////////////////////////////////////
	//return {positionChanged:boolean, edgeChanged:boolean, sizeChanged:boolean, newStart:int, newEnd:int}
	updateArea:function(base, start, end, delta, max) {
		var startResult = this.updateStart(start, base, delta, max);
		var endResult = this.updateEnd(end, base, delta, max);
		var newStart = startResult.newStart;
		var newEnd = endResult.newEnd;
		var edgeChanged = startResult.edgeChanged || endResult.edgeChanged;
		var sizeChanged = false;
		var positionChanged = false;
		if (newEnd < newStart ) {
			positionChanged = true;
			newStart = newEnd = -1;
			sizeChanged = true;
		} else if (newStart != start || newEnd != end) {
			positionChanged = true;
			if ((end - start) != (newEnd - newStart))
				sizeChanged = true;
		}
		return {positionChanged:positionChanged, sizeChanged:sizeChanged, edgeChanged:edgeChanged,
			newStart:newStart, newEnd: newEnd};
	},
	//return {newStart:int, edgeChanged:boolean}
	updateStart: function(/*int*/start, /*int*/nStart, /*int*/delta, /*int*/max) {
		var edgeChanged = false;
		if (start >= nStart)
			start += delta;
		else if (delta < 0 && (nStart + delta) <= start) {
			start = nStart + delta;
			edgeChanged = true;
		}
		if (start < 1)
			start = -1;
		if (start > max)
			start = max;
		return {newStart:start, edgeChanged:edgeChanged};
	},
	//return {newEnd:int, edgeChanged:boolean}
	updateEnd: function(/*int*/end, /*int*/nEnd, /*int*/delta, /*int*/max) {
		var edgeChanged = false;
		if (end >= nEnd)
			end += delta;
		else if (delta < 0 && (nEnd + delta) <= end) {
			end = nEnd + delta - 1;
			edgeChanged = true;
		}
		if (end < 1)
			end = -1;
		if (end > max)
			end = max;
		return {newEnd:end, edgeChanged:edgeChanged};
	},
	
	/**
	 * Get the delta relative to this according to delete/insert range event
	 */	
	getRefChangeDeltas:function(range, ref, rDelta, cDelta, rowSize, colSize){
		var startRow = range.startRow;
	    var startCol = range.startCol;
	    var endRow = range.endRow;
	    var endCol = range.endCol;
	    var osr = ref.startRow;
	    var oer = ref.endRow;
	    var osc = ref.startCol;
	    var oec = ref.endCol;
	    
	    if (rDelta != 0 && (ref.refMask & websheet.Constant.RefAddressType.ROW) > 0) {
	        //get the original delete/insert part
	        if (rDelta < 0) {
	            endRow = startRow - 1;
	            startRow = startRow + rDelta;
	        } else {
	            endRow = startRow + rDelta - 1;
	        }
	        
	        if(oer < startRow)
	        	return null;
	        
	        var size = oer - osr;
	        var nsr = startRow - osr;
	        var ner = endRow - osr;
	        
	      //also need - rowSize because the formulas refer to such reference will be need update formula
	        if (rDelta > 0)
	            ner = nsr - 1;
	        nsr = nsr - rowSize + 1;
	        if (ner < 0 || nsr > size ) {
	            return null;
	        } else if (rDelta > 0 && ner < nsr) {
	            // insert rows for reference which rowSize == 1
	            // will result in split shared reference and create formula cell at position ner
	            ner = nsr;
	        }
	        if (nsr < 0) {
	            nsr = 0;
	        }
	        if (ner > size) {
	            ner = size;
	        }
	        var change = [nsr, ner];
	        return change;
	    }
	    // NOW only support shared formula in one column
	    // enable the following when we support shared formula in row
	    // Data validation needs to support shared formula in row, in range.
	    else if (cDelta != 0 && (ref.refMask & websheet.Constant.RefAddressType.COLUMN) > 0) {
	    	//get the original delete/insert part
	        if (cDelta < 0) {
	            endCol = startCol - 1;
	            startCol = startCol + cDelta;
	        } else {
	            endCol = startCol + cDelta - 1;
	        }
	        
	        if(oec < startCol)
	        	return null;
	        
	        var size = oec - osc;
	        var nsc = startCol - osc;
	        var nec = endCol - osc;
	        //also need - colSize because the formulas refer to such reference will be need update formula
	        if (cDelta > 0)
	            nec = nsc - 1;
	        nsc = nsc - colSize + 1; 
	        if (nec < 0 || nsc > size ) {
	            return null;
	        } else if (cDelta > 0 && nec < nsc) {
	            // insert rows for reference which rowSize == 1
	            // will result in split shared reference and create formula cell at position ner
	            nec = nsc;
	        }
	        if (nsc < 0) {
	            nsc = 0;
	        }
	        
	        if (nec > size) {
	            nec = size;
	        }
	        var change = [nsc, nec];
	        return change;
	    }
	    
	    return null;
	},
	
	getLocale: function() 
	{
		// it would happen prior to constructing editor object, have to access with global variable here
		return window["pe"].scene.getLocale();
	},
	
	// get the top left cell of the given reference, and return its number format
	getTokenFormat: function(reference) {
		if(!(websheet.functions.Object.isReference(reference)) || !reference.isValid())
			return null;
		
		// get the inherited number format with use the top left cell
		var format;
		var range = reference._getRangeInfo();
		var style = websheet.model.ModelHelper.getStyleCode(range.sheetName, range.startRow, range.startCol);		
		if (style) format = this.getFormat(style);
		
		return format;
	},
    /**
     * some of the nubmer format need to get the local js file from sever, using this method to get these kind of file first
     * @param styleJson
     */
	preFormat: function(styleJson)
	{
		var styleObj = new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.JSON,styleJson);
		var format = websheet.Helper.getFormat(styleObj);
		if(format)
		{
			websheet.i18n.Number.format(123,format);
		}	
	},
	// get number format for given style in json
	/**
	 * @param style -- input style to calculate format
	 * @param ignoreDefault -- ignore default format
	 */
	getFormat: function(style, ignoreDefault) {
		// summary: get valid format a cell from provided style. The provided style is related to one cell -- it is its style, or its column style
		// details: when bIgnoreFormulaFormat is false/null/not set: 
		//		1) if style format is set, return style format merges default cell style format
		//		2) if in 1) no format is got, return formulaFormat if current cell is formula
		//		3) if in 1) and 2) no format is got, return format in default cell style
		//			when bIgnoreFormulaFormat is true:
		//		1) if style format is set, return style format merges default cell style format
		//		2) if in 1) no format is got, return format in default cell style
		//			
		//			Returns null if format is empty.
		//	If [category, code, currency, color] are ["", "", "", ""], it means "general" as MS or Symphony
		//  if any item of [category, code, currency, color] is null, means item value should inherite from default cell style
		//  so if default cell style is like {"currency":"CNY;CNY;CNY","fmcolor":";#ff0000;","code":"\uffe5#,##0.00;-\uffe5#,##0.00;\uffe5#,##0.00","category":"currency;currency;currency"}
		//  and a cell style is percentage without color, it must explicitly write {"fmcolor":"", "currency":""}, otherwise it will inherite fmcolor as negative red, which is not suspected
		var dcs = websheet.style.DefaultStyleCode;
		var cnstStyle = websheet.Constant.Style;
		var fCategory, fCode, fCurr, fColor;
		
		if (style) {
			fCategory = style._attributes[cnstStyle.FORMATTYPE];
			fCode = style._attributes[cnstStyle.FORMATCODE];
			fCurr = style._attributes[cnstStyle.FORMATCURRENCY];
			fColor = style._attributes[cnstStyle.FORMAT_FONTCOLOR];
			
			if (((fCategory != null && fCategory.length > 0) ||
				(fCode != null && fCode.length > 0) ||
				(fCurr != null && fCurr.length > 0) ||
				(fColor != null && fColor.length > 0)) && !ignoreDefault) {
				// style format is set, merge in default cell style
				if (fCategory == null) {
					fCategory = dcs._attributes[cnstStyle.FORMATTYPE];
				}
				
				if (fCode == null) {
					fCode = dcs._attributes[cnstStyle.FORMATCODE];
				}
				
				if (fCurr == null) {
					fCurr = dcs._attributes[cnstStyle.FORMATCURRENCY];
				}
				
				if (fColor == null) {
					fColor = dcs._attributes[cnstStyle.FORMAT_FONTCOLOR];
				}
			}
		}
		
		if ((fCategory == null) &&
			(fCode == null) &&
			(fCurr == null) &&
			(fColor == null) &&
			!ignoreDefault) {
				// default cell style
			fCategory = dcs._attributes[cnstStyle.FORMATTYPE];
			fCode = dcs._attributes[cnstStyle.FORMATCODE];
			fCurr = dcs._attributes[cnstStyle.FORMATCURRENCY];
			fColor = dcs._attributes[cnstStyle.FORMAT_FONTCOLOR];
		}
		
		// finally, get format object out of all attributes gathered
		var format = {};
		var bEmpty = true;
		
		// empty for each format item, such as type, code,
		// it means same as general number format type, 
		// so it might different with default cell style format when default cell style can be customized, 
		// empty means the format item will not inherit from that of default cell style
		if (fCategory != null && fCategory.length > 0) {
			bEmpty = false;
			format[cnstStyle.FORMATTYPE] = fCategory;
		}
		
		if (fCode != null && fCode.length > 0) {
			bEmpty = false;
		  	format[cnstStyle.FORMATCODE] = fCode;
		}
		
		if (fCurr != null && fCurr.length > 0) {
			bEmpty = false;
			format[cnstStyle.FORMATCURRENCY] = fCurr;
		}
		
		if (fColor != null && fColor.length > 0) {
			bEmpty = false;
			format[cnstStyle.FORMAT_FONTCOLOR] = fColor;
		}
		
		return bEmpty ? null : format;
	},
	
	parseName: function(str, bMS)
	{
		if (!str || !dojo.isString(str)) {
			return str;
		}
		var nameMatch = this.nameMatch;
		if(bMS)
			 nameMatch = this.mnameMatch;
		var matches = nameMatch.exec(str);
		if(matches){
			var sheet = matches[1];
			if(sheet && !(/^\'.*\'$/.test(sheet)) && (sheet.indexOf(" ") > -1 || sheet.indexOf("'") > -1))
				return null;
			var newSheetName = this.normalizeSheetName(sheet);
			return{
				sheet:newSheetName,
				name:matches[2]
			};
		}
		return null;
	},
	   
	wildcardMapping: function(lookup_value)
	{
		var replaceItem = function(item)
		{
		    var c = item.charAt(0);
		    switch(c)
		    {
		    case '?':
		    	return "(.|\n){1}"; // translate to reg pattern
		    case '*':
		    	return "(.|\n)*"; // translate to reg pattern
		    case '~':
		    {
		    	var c1 = item.charAt(1);
		    	if(c1=="*" || c1=="?")
		    		return "\\" + c1; // escape either "?" or "*"
		    		
		    	return c1; // ~a -> a, ~ -> 
		    }
		    default:
                return "\\" + item; // escape any reg pattern character including to disable them 
		    }
		};
		var ntext = lookup_value.replace(websheet.Helper.wildcardReg,replaceItem);
		
		return ntext;
	},
	
	getDuplicateElems: function(arr, bCaseInsensitive)
	{
		if (!arr || arr.length < 1)
			return [];
			
		if(bCaseInsensitive) {
			for(var i in arr)
				if (typeof arr[i] == "string") {
					arr[i] = websheet.BrowserHelper._composeByLocale(arr[i].toLowerCase());
				}
		}
		
		arr.sort();
		var l = arr.length;
		var ret = arr.filter(function(v, i, a){
			if (l < 2) {
				return false;
			}
			else if (l == 2) {
				if(i == 1 && a[0] == a[1])
					return true;
				else
					return false;
			}
			else 
			{ // length > 2
				if (i > 0 && v != null && v != undefined && v != NaN)
				{
					if (i < (l-1))
					{
						var pre = a[i-1];
						var next = a[i+1];
						if (v == pre && v != next)  // get the last element for duplicate section
							return true;
						return false;	
					}				
					else if(i == (l-1))
					{
						var pre = a[i-1];
						if (v == pre)  // the last in the array
							return true;
						return false;
					}
				}
				return false;
			}
		});
		
		return ret;
	},

	/**
	 * arr element must be valid numeric for performance purpose!!! caller need ensure that!
	 */
	getNumericThreshold: function(arr, bottom, rank)
	{
		if (rank <= 0 || !arr || arr.length < 1)
			return NaN;
		
		var l = arr.length;
		arr.sort(function(a, b){
			return a - b;
		});
		
		var threshold = NaN;
		if (!bottom)
		{			
			if (rank >= l) 
			{
				threshold = arr[0];
			}
			else 
			{
				threshold = arr[l-rank];
			}			
		}
		else
		{
			if (rank >= l)
			{
				threshold = arr[l-1];
			}
			else 
			{
				threshold = arr[rank-1];
			}
		}	
		
		return threshold;
	},

	/**
	 * arr element must be sorted valid numeric for performance purpose!!! caller need ensure that!
	 */
	getPercentThreshold: function(arr, bottom, rank)
	{
		if (rank <= 0 || !arr || arr.length < 1)
			return NaN;

		if (rank > 100)
			rank = 100;

		var l = arr.length;

		var k = Math.ceil( (100 - rank) * l / 100 );
		
		if (!bottom)
		{			
			if (l == k)
				k -= 1;
			return arr[k];
		}
		else 
		{
			if (k == l)
				k -= 1;
			return arr[l-k-1];
		}		
	},


	/**
	 * arr element must be valid sorted numeric for performance purpose!!! caller need ensure that!
	 */
	getPercentileThreshold: function(arr, rank)
	{
		if (!arr || arr.length < 1)
			return NaN;

		if (rank < 0)
			rank = 0;			
		if (rank > 100)
			rank = 100;

		var l = arr.length;
		
	    if (l == 1)
	        return arr[0];
	    else
	    {
	    	var fPercentile = rank/100.0;
	        var nIndex = Math.floor( fPercentile * (l-1));
	        var fDiff = fPercentile * (l-1) - Math.floor( fPercentile * (l-1));
	        if (fDiff == 0.0)
	            return arr[nIndex];
	        else
	        {	       
	        	if (nIndex+1 == l) {
	        		return (arr[1-1] + arr[l-2])/2;
	        	}
	        	else {
		            var fVal = arr[nIndex];
		            return fVal + fDiff * (arr[nIndex+1] - fVal);
	        	}
	        }
	    }	    
	}		
};

websheet.Helper.wildcardReg = new RegExp("~(.|$)|[*?.+|()\\[\\]\\/\\$\\^{}\\\\]","g");
websheet.Helper.exRefpattern = new RegExp("^\\[[\\s\\S]*]");
websheet.Helper.exRefUri = new RegExp("^\\[|]$","ig");
websheet.Helper.numeric = new RegExp("(^[\-|\+]?\\d+(\\.\\d+)?([e|E][\-|\+]?\\d+)?$)");
websheet.Helper.localeNumeric = new RegExp("(^[\\.|'|,|\\d+]+(\\d+)?([e|E][\-|\+]?\\d+)$)");// locale numeric
websheet.Helper.percentReg = new RegExp("(^[\-|\+]?\\d+(\\.\\d+)?%$)");
websheet.Helper.localeRegexpNum = /^[0-9|,|'|.|%| ]+$/;
websheet.Helper.localeRegexpPercentage=/(\s*%+)+/;

websheet.Helper.nameRgx = "([^\\x00-\\x40\\x5B-\\x5E\\x60\\x7B-\\x7F\\u20AC\\uFDFC\\u20A4\\u20AD\\u20A6\\u20A8\\u20A9\\u20AE\\u0E3F\\u20A1\\u17DB\\u060B\\u20B4\\u20AA\\xA3\\xA2\\xA5\\xA9\\xAE][^\\x00-\\x2D\\x2F\\x3A-\\x3E\\x40\\x5B\\x5D\\x5E\\x60\\x7B-\\x7F\\xA3\\xA2\\xA5\\xA9\\xAE]{0,254}|[\\\\]([^\\x00-\\x2D\\x2F\\x3A-\\x3E\\x40\\x5B\\x5D\\x5E\\x60\\x7B-\\x7F\\xA3\\xA2\\xA5\\xA9\\xAE]{2,254})?)";
websheet.Helper.validName = new RegExp("^"+ websheet.Helper.nameRgx +"$");
//websheet.Helper.invalidNameP = "([a-zA-Z]{1,3}0*)";
websheet.Helper.invalidNameP = "(([a-zA-Z]{1}|[a-wA-W]?[a-zA-Z]{2}|[xX][a-eA-E][a-zA-Z]|[xX][fF][a-dA-D])0*)"; //xfd
websheet.Helper.invalidNameN = "([1-9][0-9]*)";
websheet.Helper.invalidName = "(" + websheet.Helper.invalidNameP + websheet.Helper.invalidNameN + ")";
websheet.Helper.invalidNameMatch = new RegExp("^" + websheet.Helper.invalidName + "$", "i");

websheet.Helper.invalidNameRC = "(r?)([0-9]*)(c?)([0-9]*)";
websheet.Helper.invalidNameMatchRC = new RegExp("^" + websheet.Helper.invalidNameRC, "i");


websheet.Helper.name = websheet.Helper.rgx.sheet +"\\." + websheet.Helper.nameRgx;
websheet.Helper.mname = websheet.Helper.rgx.sheet +"\\!" + websheet.Helper.nameRgx;
websheet.Helper.nameMatch = new RegExp("^" + websheet.Helper.name + "$", "i");
websheet.Helper.mnameMatch = new RegExp("^" + websheet.Helper.mname + "$", "i");
websheet.Helper.rgx.cell = "(" + websheet.Helper.rgx.sheet + "\\.)?" + websheet.Helper.rgx.column + websheet.Helper.rgx.row;
websheet.Helper.rgx.ecell = "((" + websheet.Helper.rgx.sheet + ")?\\.)?" + websheet.Helper.rgx.column + websheet.Helper.rgx.row;
websheet.Helper.rgx.range = websheet.Helper.rgx.cell + "(:" + websheet.Helper.rgx.ecell + ")?";
websheet.Helper.rgx.colrange = "(" + websheet.Helper.rgx.sheet + "\\.)?" + websheet.Helper.rgx.column + ":" + websheet.Helper.rgx.column; 
websheet.Helper.rgx.rowrange = "(" + websheet.Helper.rgx.sheet + "\\.)?" + websheet.Helper.rgx.row + ":" + websheet.Helper.rgx.row; 
websheet.Helper.rangeMatch = new RegExp("^" + websheet.Helper.rgx.range + "$", "i");
websheet.Helper.colsMatch = new RegExp("^" + websheet.Helper.rgx.colrange + "$", "i");
websheet.Helper.rowsMatch = new RegExp("^" + websheet.Helper.rgx.rowrange + "$", "i");
websheet.Helper.rgx.invalidrange = "(" + websheet.Helper.rgx.sheet + "\\.)?((\\$)?#REF!)";
websheet.Helper.invalidrangeMatch = new RegExp("^" + websheet.Helper.rgx.invalidrange + "$", "i");

//for ms, which use "!" as the sheet name separator
websheet.Helper.rgx.mcell = "(" + websheet.Helper.rgx.sheet + "!)?" + websheet.Helper.rgx.column + websheet.Helper.rgx.row;
websheet.Helper.rgx.mecell = "((" + websheet.Helper.rgx.sheet + ")?!)?" + websheet.Helper.rgx.column + websheet.Helper.rgx.row;
websheet.Helper.rgx.mrange = websheet.Helper.rgx.mcell + "(:" + websheet.Helper.rgx.mecell + ")?";
websheet.Helper.rgx.mcolrange = "(" + websheet.Helper.rgx.sheet + "!)?" + websheet.Helper.rgx.column + ":" + websheet.Helper.rgx.column;
websheet.Helper.rgx.mrowrange = "(" + websheet.Helper.rgx.sheet + "!)?" + websheet.Helper.rgx.row + ":" + websheet.Helper.rgx.row;
websheet.Helper.mrangeMatch = new RegExp("^" + websheet.Helper.rgx.mrange + "$", "i");
websheet.Helper.mcolsMatch = new RegExp("^" + websheet.Helper.rgx.mcolrange + "$", "i");
websheet.Helper.mrowsMatch = new RegExp("^" + websheet.Helper.rgx.mrowrange + "$", "i");
websheet.Helper.rgx.minvalidrange = "(" + websheet.Helper.rgx.sheet + "\\!)?((\\$)?#REF!)";
websheet.Helper.minvalidrangeMatch = new RegExp("^" + websheet.Helper.rgx.minvalidrange + "$", "i");
// for ms xlsx A:XFD
websheet.Helper.rgx.xmrowrange = "(" + websheet.Helper.rgx.sheet + "!)?" + "([(^$)]?([aA]|#REF!))" + websheet.Helper.rgx.row + ":([(^$)]?([xX][fF][dD]|#REF!))" + websheet.Helper.rgx.row;
websheet.Helper.xmrowsMatch = new RegExp("^" + websheet.Helper.rgx.xmrowrange + "$", "i");

//TODO: DELETE
websheet.Helper.rgx.scol = "(" + websheet.Helper.rgx.sheet + "\\.)?" + websheet.Helper.rgx.column;
websheet.Helper.rgx.ecol = "((" + websheet.Helper.rgx.sheet + ")?\\.)?" + websheet.Helper.rgx.column;
websheet.Helper.rgx.srow = "(" + websheet.Helper.rgx.sheet + "\\.)?" + websheet.Helper.rgx.row;
websheet.Helper.rgx.erow = "((" + websheet.Helper.rgx.sheet + ")?\\.)?" + websheet.Helper.rgx.row;
websheet.Helper.rgx.mscol = "(" + websheet.Helper.rgx.sheet + "!)?" + websheet.Helper.rgx.column;
websheet.Helper.rgx.mecol = "((" + websheet.Helper.rgx.sheet + ")?!)?" + websheet.Helper.rgx.column;
websheet.Helper.rgx.msrow = "(" + websheet.Helper.rgx.sheet + "!)?" + websheet.Helper.rgx.row;
websheet.Helper.rgx.merow = "((" + websheet.Helper.rgx.sheet + ")?!)?" + websheet.Helper.rgx.row;

websheet.Helper.rgx.colrange1 = websheet.Helper.rgx.scol + "(:" + websheet.Helper.rgx.ecol + ")?";
websheet.Helper.rgx.rowrange1 = websheet.Helper.rgx.srow + "(:" + websheet.Helper.rgx.erow + ")?";
websheet.Helper.rgx.mrowrange1 = websheet.Helper.rgx.msrow + "(:" + websheet.Helper.rgx.merow + ")?";
websheet.Helper.rgx.mcolrange1 = websheet.Helper.rgx.mscol + "(:" + websheet.Helper.rgx.mecol + ")?";
websheet.Helper.colsMatch1 = new RegExp("^" + websheet.Helper.rgx.colrange1 + "$", "i");
websheet.Helper.rowsMatch1 = new RegExp("^" + websheet.Helper.rgx.rowrange1 + "$", "i");
websheet.Helper.mcolsMatch1 = new RegExp("^" + websheet.Helper.rgx.mcolrange1 + "$", "i");
websheet.Helper.mrowsMatch1 = new RegExp("^" + websheet.Helper.rgx.mrowrange1 + "$", "i");
//TODO: DELETE END

websheet.Helper.formulaPattern = new RegExp("(^=.+)|(^{=.+}$)");//here \. will not match the line-break char, such as \n 
websheet.Helper.fileSheetlinkPattern = new RegExp("^" + websheet.Helper.rgx.fileSheetlink + "$","i")
websheet.Helper.singleQuotePattern = new RegExp("^\'|\'$","ig");// the string embraced by '''
websheet.Helper.twoSingleQuotePattern = new RegExp("(\')(\')","ig"); //the string contains continuous '
websheet.Helper.needSingleQuotePattern = new RegExp("([^\\w]+)|(^\\d)");//for sheet name, if contains special char or start with number, should use single quote to embrace it
websheet.Helper.lastNum = new RegExp("([0-9]*)$");
websheet.Helper.doubleQuotePattern = new RegExp("^\"|\"$","ig");// the string embraced by '"'
websheet.Helper.fontColorPattern = new RegExp("color:#[0-9a-f]{6}","ig"); // new RegExp("\\\[#[0-9a-f]{6}\\\]","ig"); // e.g. [#FF0000]

//websheet.Helper.datetimePattern = new RegExp("^((\\d{1,4}|[^\\u]+)(/|-|\\.| )(\\d{1,4}|[^\\u]+)(/|-|\\.|(, )|(\\. )| )\\d{1,4})?( ?([^\\x00-\\xff]+ )?\\d{1,4}:\\d{1,2}(:\\d{1,2})?( [^\\u]+)?)?$","ig");
//websheet.Helper.datetimePattern = new RegExp(websheet.Helper.datePattern + "?" + websheet.Helper.timePattern);
//"2001-1-1"; "2001/1/1"; "01.01.1990"; "Feb 21, 1999"; "Feb 21, 1999"; "January 21, 2005"; "January 21,2005"
//websheet.Helper.datePattern = new RegExp("(\\d{1,4}|[^\\u]+)(/|-|\\.| )(\\d{1,4}|[^\\u]+)(/|-|\\.|(, )|(\\. )| )\\d{1,4}","ig");
//"12:00 AM"; "12:00:00 AM"; "02:00 vorm."; "12:30 nachm."; "æ¶“å©�1�?�ï¿�?�? 8:00";
websheet.Helper.timePatternFull =  new RegExp("\\s*([a-zA-Z]+|[^\\x00-\\xff]+ )?\\s*\\d{1,4}\\s*:\\s*\\d{1,2}(\\s*:\\s*\\d{1,2})?(\\s+[^\\u]+)?","ig");
websheet.Helper.timePattern =  new RegExp("\\d{1,4}:\\d{1,2}(:\\d{1,2})? [^\\u]+","ig");
websheet.Helper.timePatternDoubleByte =  new RegExp("[^\\x00-\\xff]+ \\d{1,4}:\\d{1,2}(:\\d{1,2})?","ig");

websheet.Helper.numberFormatCode = new RegExp("([#0?]+[,]*)+(\\.[#0]+)*");