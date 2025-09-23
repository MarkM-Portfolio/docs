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

dojo.provide("websheet.functions.FormulaBase");
dojo.require("websheet.functions.IObject");
dojo.require("websheet.Constant");
dojo.require("websheet.parse.tokenType");
dojo.require("websheet.parse.FormulaParseHelper");
dojo.require("websheet.Math");
dojo.require("websheet.i18n.numberRecognizer");
dojo.require("websheet.BrowserHelper");
dojo.declare("websheet.functions.FormulaBase", null, {
	
	EN_TRUE: true,
	EN_FALSE: false,
	bMS: true, // need to be sync-ed with bMSFormula setting in Base.js
	
	minNumOfArgs: 1,
	maxNumOfArgs: 0,
	oddNumOfArgs: null, //To indicate if the arguments need to exist in pairs
	args: null,
	privateAcc: false,
	bArrayFormula: false,
	STR_TO_NUM: 1,
	LOCALE_NUM: 1 << 1,
	CHECK_MS_MODE: 1 << 2, //To indicate if the specified formula needs bMS check
	NOT_SUPPORT_ARRAY: 1 << 3, //To indicate that the formula don't support Array with length > 1 as parameter
	
	_wildcardMapReg: null,
	
	MAX_NUM : 134217727, //2^27-1
	MIN_NUM : -134217727, //-2^27+1
	
	Object: websheet.functions.Object,
	tokenType: websheet.parse.tokenType,
	Constant: websheet.Constant,
	FormulaParseHelper: websheet.parse.FormulaParseHelper,
	NumberRecognizer: websheet.i18n.numberRecognizer,
	
	constructor: function(minNumOfArgs, maxNumOfArgs) {
		if (minNumOfArgs) this.minNumOfArgs = minNumOfArgs;
		if (maxNumOfArgs) this.maxNumOfArgs = maxNumOfArgs;
	},

	/*
	 * Check whether the arguments are valid
	 */
	/*boolean*/preCheck: function () {
		this.bArrayFormula = false;
		if (this.minNumOfArgs == 0) {
			if (this.args == undefined || this.args == null)
				return true;
			if (this.maxNumOfArgs == 0) {
				//if has none token( blank ), return true
				if(this.args){
					//for example =NOW( ), the none_token should be ignored here
					//but =NOW( , ) should return 508
					var size = this.args.length;
					if(size == 1)
					{
						var token = this.args[0];
						if(this._isNoneToken(token))
							return true;
					}
				} 
				throw this.Constant.ERRORCODE["508"];//;"#Err508";
			}
		}
		
		if (this.args == undefined || this.args == null)
			throw this.Constant.ERRORCODE["511"];
		
		var length = this.args.length;
		if (length >= this.minNumOfArgs && length <= this.maxNumOfArgs)
			return true;
		
		//511 Parameter list error
		throw this.Constant.ERRORCODE["511"];
	},
	
	//check if the token is the NONE_TOKEN type
	_isNoneToken:function(token){
		if(token)
		{
			if (this.Object.isFormulaToken(token) && token.getType() == this.tokenType.NONE_TOKEN)
				return true;
			return false;
		}
		
		return true;//token==null
	}, 
	
	/**
	 * Regulate all formula parameters validation rule and each formula implement this function itself to handle all rules before 
	 * do the calculation.You need balance the performance and code readability   
	 * @param args   parameters array
	 * @param context
	 * @param funcName   name of each formula validation function
	 */
	_validateParameters:function(args,context,funcName){
		var tokenType = this.tokenType;
		for(var i=0,token;token=args[i];i++){
			if(token){
				if(token._tokenType && token._tokenType == tokenType.SINGLEQUOT_STRING){ // it's token not tokenList
					throw this.Constant.ERRORCODE["519"];
				}
			}
			if(funcName){
				var func = dojo.hitch(this,funcName);
				func();
			}
		}
		return args;
	},
	
	/*  
	 * Default(no the third parameter)
	 * "abc" ==> "abc"
	 * "2011-01-04" ==> "2011-01-04"
	 * "1<2" ==> "1<2"
	 * 10==>"10"
	 * "true" ==> "true"
	 * true ==> "1"
	 * 'abc ==> "'abc"
	 * '1,234.5 ==> "1234.5"
	 * '2011-01-04 ==> "2011-01-04"
	 * 1<2 ==> "1"
	 * 
	 * LOCALE_NUM
	 * "abc" ==> ERR[519]
	 * "2011-01-04" ==> 40547
	 * "1<2" ==> ERR[519]
	 * 'abc ==> ERR[519]
	 * '1,234.5 ==> 1234.5
	 * '2011-01-04 ==> 40547
	 * 1<2 ==> 1
	 * 
	 * Apply to:
	 * =asin(); 
	 * =text(); 
	 * =trim();
	 * ...
	 * 
	 * Can't apply to:
	 * =sum(); 
	 * e.g. A1='123; =sum(A1); A1 should be parsed as 0 and this formula should return 0; 
	 * But if use getValue() which will parse A1 as 123, so the result of this formula would be 123.
	 * =islogical();
	 * // islogical ask for boolean parameter but getValue() only return number or string value.
	 * =average();
	 * e.g. A1='123; =average(A1); this formula should throw "#DIV/0!";
	 * But if use getValue() which will parse A1 as 123, so the result of this formula would be 123.
	 * ...
	 * 
	 */
	/*numberORstring*/getValue: function(value, type, mode){
		if(type == this.tokenType.SINGLEQUOT_STRING)
			throw this.Constant.ERRORCODE["525"];

		var bAllowNumber = false;
		if(mode)
			bAllowNumber = true;
			
		if(bAllowNumber){
			if(type == this.tokenType.DOUBLEQUOT_STRING){
				var checkMS = mode ? mode & this.CHECK_MS_MODE : false;
				if(checkMS && !this.bMS)
					throw this.Constant.ERRORCODE["519"]; //#VALUE
				if(value == null || value == "")
					throw this.Constant.ERRORCODE["519"]; //#VALUE
			}
			return this.parseNumber(value, mode);
		}
		else{
			if(type == this.tokenType.NONE_TOKEN)
				return "";
			else
				return this.parseString(value);
		}
	},
	
	/*Number*/getNumValue: function(value) {
		var parm = this.fetchScalaResult(value, true);
		var type = value.getType();
		parm = this.getValue(parm, type, this.LOCALE_NUM);
		return parm;
	},

	/*
	 * either throw error code or return the calculated value 
	 */
	/* value */calc: function () {
		/* to be overridden */
		return true;
	},
	
	/*
	 * either throw error code or return the calculated value
	 */
	/* value */_calc: function (context, args) {
		this.args = args;
		this.preCheck();
		var ret = this.calc(context);
		if(typeof(ret) == "number" && (isNaN(ret) || !isFinite(ret)))
			throw this.Constant.ERRORCODE["504"];
		return ret;
	},
	
	/*
	 * Tell if the object is either range model, cell reference token or range reference token
	 */
	/*boolean*/isRangeObj: function(object){
		 return this.FormulaParseHelper.isRangeObj(object);
	},
	
	/*
	 * Tell if 'value' is number or not,
	 * use number recognizer to determine it if it is one locale sensitive number
	 * @params	bLocaleNumString		true if 'value' is one locale sensitive number
	 */
	/*boolean*/isNum: function(value, bLocaleNumString){
		 return this.FormulaParseHelper.isNum(value, bLocaleNumString);
	},
	
	/**
	 * analyze token the parser get,then return the real result.Maybe it is a
	 * websheet.parse.tokenList,or some other type, we only want to get the
	 * calculative result to join the next calculation.
	 */
	analyzeToken: function(/*websheet.functions.Token*/token, bThrowError) {
		return this.FormulaParseHelper.analyzeResult(token, bThrowError);
	},
		
	fetchScalaResult:function(/*websheett.functions.Token*/value, singleCell,bNonZero, currentParsedCell,parentToken,ignoreIntersect) {
		return this.FormulaParseHelper.fetchScalaResult(value, singleCell, bNonZero, currentParsedCell,parentToken,ignoreIntersect);
	},

	/*cell*/getScalaCell:function(/*websheet.functions.Reference*/reference,bIgnoreError, token) {
		return this.FormulaParseHelper.getScalaCell(reference, bIgnoreError, token);
	},
	
	fetchScalaBoolean:function(value) {
		var result = this.analyzeToken(value);
		if (this.isRangeObj(result)) {
			var cell = this.getScalaCell(result, false, value);
			//if the cell is error, throw it directly, otherwise get the calculate value
			if(cell) {
				var err = cell.getError();
				if (err) {
					if (err.errorType == this.Constant.ErrorType.UNSUPPORTFORMULA)
						throw this.Constant.ERRORCODE["1003"];
					else
						throw err;
				} else {
					return cell.isBoolean();
				}
			} 
		}
		
		return false;
	},
	
	/*
	 * Transform boolean value to int value
	 */
	/*int*/toInt: function (/*boolean*/ bol) {
		var ret = bol ? 1 : 0;
		return ret;
	},
	
	/**
	 * process the String to boolean with locale
	 * return the original string if no match TRUE/FALSE string.
	 * @param value
	 * @param bIgnoreErr
	 * @returns
	 */
	/*number*/toBoolean:function(/*string*/value,bIgnoreErr){
		var result = value;
		var parseResult = null;
		if(this.Object.JS)
			parseResult = this.NumberRecognizer.autoParseAsBoolean(new String(result).toUpperCase()); // parse boolean
		else{
			var boolT = "TRUE";
			var boolF = "FALSE";
			if(value == boolT)
				return 1;
			else if (value == boolF)
				return 0;
		}
	    if(parseResult && parseResult.isNumber)
	    	result = parseResult.fValue;
	    else{
		   if(!bIgnoreErr)
			   throw this.Constant.ERRORCODE["519"];
	    }

	    return result;
	},
	
	/*string*/parseString: function(value){		
		if (value == null )
		   throw this.Constant.ERRORCODE["519"];
		switch (typeof value) {
			case "string":
			   return value;
			case "number":
				return value + "";
			case "boolean":
				return this.toInt(value) + "";
		    case "object":
		        if(value instanceof String)
		          return value + "";
                 // TODO
				break;
			default:
			   throw this.Constant.ERRORCODE["519"];
		}
	},
	
	/*
	 * parse 'value' to one number. 
	 * If STR_TO_NUM mode is given, it can recognize one string like "12" and return 12 instead,
	 * with LOCALE_NUM mode, it can recognize locale sensitive number like "1,234.56"  
	 * with NOT_SUPPORT_ARRAY given, exception will be thrown out if value is Array and with length > 1
	 * otherwise throw error code
	 * 
	 * @params 	mode		STR_TO_NUM | LOCALE_NUM | NOT_SUPPORT_ARRAY
	 * parseNumber(value) == Convert2Num4Not
	 * parseNumber(value, STR_TO_NUM) == Convert2Num
	 */
	/*int*/parseNumber: function(value, mode){
		//if value is get from the cell model, and want to parse it to number
		//if it is empty cell, the input vaule should be 0, rather than ""
		//pls refer to fetchScalaResult
		//when value == "", if bString=true, return 0, else throw #VALUE!
		var bString = mode ? mode & this.STR_TO_NUM : false;
		var bLocaleNumStr = mode ? mode & this.LOCALE_NUM : false;
		var bNotArray = mode ? mode & this.NOT_SUPPORT_ARRAY : false;
		
		switch (typeof value) {
			case "string":
				// case:"1000-01-01" will recognize as a negative number
				//value = dojo.trim(value.replace(websheet.Helper.doubleQuotePattern,""));
				if (bLocaleNumStr){
					var parseResult = this.NumberRecognizer.parse(value);
					if(parseResult.isNumber && !isNaN(parseResult.fValue) && isFinite(parseResult.fValue))
						return parseResult.fValue;
				}else if (this.isNum(value))
					return parseFloat(value);
				if (!bString) 
					throw this.Constant.ERRORCODE["519"];
				break;
			case "number":
				return value;
			case "boolean":
				return this.toInt(value);
			case "object":
				if(bNotArray && dojo.isArray(value))
					return this.fetchScalaResult(value, true);
				break;
			default:
				if (!bString) 
					throw this.Constant.ERRORCODE["502"];
		}
		
		return 0;
	},
	
	/**
	 * iterate the 'array' and use the 'operator' to calculate the formula and put result into context
	 *  
	 * @param {Array} arrays			the values arrays which to be added.
	 * @param {} context				do the operator,then store the value in context.
	 * 
	 * @params 	paraObj	 {bIgnoreErr}
	 * @param {Boolean} bIgnoreErr		whether ingore error, for some functions, count
	 */
	/*void*/iterate: function(arrays, context, paraObj) {
		var operator = dojo.hitch(this, this.operator);
		var ignoreError = paraObj ? paraObj.bIgnoreErr : null;
		
		if (!paraObj)
			paraObj = {};
		var temp = arrays;
		if (this.Object.isFormulaTokenList(arrays)) temp = arrays.getList();
		
		if(!dojo.isArray(arrays)) {
			temp = new Array();
			temp.push(arrays);
		}
		
		dojo.forEach(temp,function(item,index){
			if (dojo.isArray(item)) {
				this.iterate(item,context,paraObj);
			} else {
				if (this.isRangeObj(item)) {
					//calculate check
					var range = item;
					var type = this.tokenType.RANGEREF_TOKEN;
					
					var refType = 0;
					if(context && context.refType > 0)
						refType = context.refType;
					
					if (!this.Object.isArea(item))
					{
						range = item.getValue();
						type = item.getType();
					}
					
					if(!range.isValid() && !ignoreError){ // should not throw exception when ignore error
						throw this.Constant.ERRORCODE["524"];
					}
					
					var count = 0;
					if (range.isValid()) {
					// for any formula which cares about hide show filter cells
					if(refType & this.Constant.RefType.CARESHOWHIDE || refType & this.Constant.RefType.CAREFILTER){
						// set ignoreError to true here, because the error cell might be filtered or hide
						var param = {bIgnoreError: true};
						var bCareShowHide = refType & this.Constant.RefType.CARESHOWHIDE;
						this.iterateWithFunc(range, dojo.hitch(this, function(cell, row, col) {
							if (!cell) return true;
							var bFormula  = cell.isFormula();
							if(context.filterCell && !(bFormula && context.filterCell(cell))){
								if(this.Object.JS) {
									var rowObj = cell._parent;
									// 1. don't push filter cells; 2.don't push hide rows meantime the flag is CARESHOWHIDE
									if(rowObj._filtered || (bCareShowHide && !rowObj._visible)){
										// do nothing
									}else{
										if(!ignoreError )//|| err == this.Constant.ERRORCODE["522"])
											cell._error && this._throwError(cell._error, true);//it is cell model
										this._operatorSingleValue(context, cell, count++, type, 1);
									}
								}
							}
							return true;
						}), param);
					} else {
						var param = {bIgnoreError: ignoreError};
						var func = dojo.hitch(this, function(cell, row, col) {
										this._operatorSingleValue(context, cell, count++, type, 1);
										return true;
									});
						if (range.is3DArea())
							this.iterate3DWithFunc(range, func, param);
						else
							this.iterateWithFunc(range, func, param);
					}
					}
					if (count == 0) {
						var value = "";
						if (!range.isValid() && ignoreError) // counta count even it's error.
							value = "valid";
						operator(context, value, 0, this.tokenType.RANGEREF_TOKEN);
					}
				}else if (this.Object.isToken(item)){
					if(!ignoreError)
						this._throwError(item._error, item);
					var calcValue = item.getValue();
				
					var type = item.getType();
					if(type == this.tokenType.BRACKET_TOKEN && item._error){//it means here it must ignore error
						//enclosed by (), as to MATH operation, it is not necessary to iterate the token list
						//check if it is math operation first
						var bMath = false;
						var tList = item.getList();
						if(tList && tList.length == 1)
						{
							var childToken = tList[0];
							if(childToken && childToken.getType() == this.tokenType.OPERATOR_TOKEN)
								bMath = true;
						}
						if(!bMath)
							this.iterate(item.getList(),context, paraObj);
						else{
							//if BRACKET_TOKEN contain one and only one math operation, do it directly
							//such as =counta((A1:B1,#REF!)) which is updated by =counta((A1:C1,A1)) and delete column A
							operator(context,item._error.message,index,type);
						}
					} else if(dojo.isArray(calcValue) || this.isRangeObj(calcValue)) {
						if((dojo.isArray(calcValue) && !this.isRangeObj(calcValue[0]))
							|| type == this.tokenType.ARRAYFORMULA_TOKEN) // case:=sum({1,"aa"},32,"aa")
							this.bArrayFormula=true;
						this.iterate(calcValue,context,paraObj);
						//for range expression there might be defaultValue, so each operator should deal with this case
						if(calcValue.defaultValue != undefined){
							operator(context,calcValue,index);
						}
						this.bArrayFormula = false;
					} else {
						if (type == this.tokenType.NEGATIVE_TOKEN || type == this.tokenType.POSITIVE_TOKEN
							|| type == this.tokenType.FUNCTION_TOKEN) {
							this.iterate(calcValue,context,paraObj);
						} else if (type == this.tokenType.NONE_TOKEN){
							operator(context,0,index,type); // set the value to zore for some formulas like count,couta,average,min,max,etc.
						} else if (type == this.tokenType.BRACKET_TOKEN) {
							this.iterate(item.getList(),context,paraObj);
						} else {
							var value = calcValue;
							operator(context,value,index,type);
						}
					}
				} else {
					// just throw error if it is an error object in constant-array
					if (!ignoreError && item && item.errorCode!= undefined)
						throw item;
					operator(context,item,index);
				}
			}
		},this);
	},
	
	/*void*/operator: function(context,item,index,type){
		var num = 1;
		if(dojo.isArray(item) && item.defaultValue != undefined){
			num = this._getArrayValueDefaultNum(item);//get the number of default value of range expression
			if(num == 0)
				return;
			item = item.defaultValue;
			//defaultValue for range expression must be two dimension array
			if(dojo.isArray(item)){
				var y = item.length;
				var x = item[0].length;
				num = num/(x*y);//the num for each item in default value arrays
				for(var i = 0; i < y; i++){
					var yValue = item[i];
					if(yValue == null)
						continue;
					for(var j = 0; j < x; j++){
						var v = yValue[j];
						this._operatorSingleValue(context, v, index, type, num);	
					}
				}
			}else
				this._operatorSingleValue(context, item, index, type, num);	
		}else
			this._operatorSingleValue(context, item, index, type, 1);
	},
	
	/*
	 * return two-demensional array by row as one cached array
	 * The similar implementation as getCells in ModelHelper
	 * @param param			parameters used to check error by this._checkCell
	 * @param bNotOptimze	true if not optimized
	 */
	/*Array*/getRows: function(/*Reference*/reference, param, bNotOptimize) {
		if(reference.is3DArea())
			throw this.Constant.ERRORCODE["524"];
		var rows = reference.getCache(this.Constant.RangeType.ROW, !bNotOptimize);
		if (rows) return rows;
		
		rows = [];
		var rangeInfo = reference._getRangeInfo();
		var startRow = rangeInfo.startRow;
		var startCol = rangeInfo.startCol;
		var endCol = rangeInfo.endCol;
		var oneRow = [];
		var currentRow = -1;
		var currentCol = startCol - 1;
		var maxColSize = 1;
		if(!param)
			param = {};
		param.checkRow = true;
		this.iterateWithFunc(reference, function(cell, row, col) {
			if (currentRow == -1) {
				for (var i = startRow; i < row; ++i) {
					var r = [];
					if (bNotOptimize) {
						for (var j = startCol; j <= endCol; ++j)
							r.push(null);
					}
					rows.push(r);
				}
				
				currentRow = row;
			} else if (currentRow != row) {
				maxColSize = Math.max(maxColSize, oneRow.length);
				// iterate into new row
				if (bNotOptimize) {
					for (var i = currentCol + 1; i <= endCol; ++i)
						oneRow.push(null);
				}
				rows.push(oneRow);
				
				for (var i = currentRow + 1; i < row; ++i) {
					var r = [];
					if (bNotOptimize) {
						for (var j = startCol; j <= endCol; ++j)
							r.push(null);
					}
					rows.push(r);
				}
				
				currentRow = row;
				currentCol = startCol - 1;
				oneRow = []; // reset it
			}
		
			for (var i = currentCol + 1; i < col; i++)
				oneRow.push(null);
			oneRow.push(cell);
			currentCol = col;
			return true;
		}, param);
		
		if (currentRow != -1) {
			maxColSize = Math.max(maxColSize, oneRow.length);
			if (bNotOptimize) {
				for (var i = currentCol + 1; i <= endCol; ++i)
					oneRow.push(null);
			}
			rows.push(oneRow);
		}
		
		if (rows.length == 0) rows.push([]);
		
		if (!bNotOptimize)
			rows.colSize = maxColSize;
		
		reference.setCache(rows, this.Constant.RangeType.ROW, !bNotOptimize);
		
		return rows;
	},
	
	/*
	 * get two-dimensional array by column as one cached array
	 */
	/*Array*/getCols: function(/*reference*/reference, param, bNotOptimize) {
		var cols = reference.getCache(this.Constant.RangeType.COLUMN, !bNotOptimize);
		if (cols) return cols;

		cols = [];
		var rows = this.getRows(reference, param, bNotOptimize);
		for(var i=0; i<rows.length; i++)
		{
			var row = rows[i];
			for(var j=0; j < row.length; j++)
			{
				var cell = row[j];
				if(!cols[j])
					cols[j] = [];
				cols[j][i] = cell;
			}
			if (cols.length == 0) cols.push([]);
		}
		
		reference.setCache(cols, this.Constant.RangeType.COLUMN, !bNotOptimize);
		
		return cols;
	},
	
	/*void*/iterate3DWithFunc: function(/*Reference*/reference, /*function*/func, param) {
		var sheets = reference._doc.getSheetNameRanges(reference.getSheetName(), reference.getEndSheetName());
		for (var i = 0; i < sheets.length; i++) {
			var sheetName = sheets[i];
			var range = reference._getRangeInfo();
			delete range.endSheetName;
			range.sheetName = sheetName;
			// create one temporary reference for formula calculation
			var ref = new websheet.parse.Reference(range);
			ref.enableCache(false);
			ref.setNeedPartial(reference.needPartial);
			
			this.iterateWithFunc(ref, func, param);
		}
	},
	
	/*
	 * iterate the range specified by 'ref'
	 * @ref			reference range
	 * @func		callback function which will be executed for each cell
	 * @param		parameters used to check error
	 */
	/*void*/iterateWithFunc: function(/*Reference*/reference, /*function*/func, param) {
		if (!param) param = {};
		var rangeInfo = reference._getRangeInfo();
		if (reference.isSingleCell()) {
			// if it is one single cell, just calculate here in order to improve performance
			var cell = reference.getCell(0, 0, true, param.bIgnoreError);
			if (cell)
				func(cell, rangeInfo.startRow, rangeInfo.startCol);
			return;
		}
		
		var doc = reference._doc;
		var checkRow = param.checkRow;
		var sheet = doc.getSheet(rangeInfo.sheetName);
		if (!sheet) return;
		
		if(doc.partialLevel != this.Constant.PartialLevel.ALL){
			if( reference.needPartial || doc.getPartialLoading(sheet.getId()) || sheet.isDirty()){
				if (doc.controller){
					var bRet = doc.controller.getPartial(rangeInfo.sheetName);
					if (bRet)
						throw this.Constant.ERRORCODE["2001"];
				}
				delete reference.needPartial;
			}
		}

		param.bFirstCheck = checkRow ? reference._firstCheckRows : reference._firstCheckCells;
		if (!this._pcm)
			this._pcm = websheet.model.ModelHelper.getPartialCalcManager();
		if (!this._tm)
			this._tm = doc._taskMgr;
		
		var deepParsing = doc.isDeepParsing; // always being false
		
		var	cells = reference.getCache(this.Constant.RangeType.RANGE);
		if (cells) {
			// caculate formula with cache
			param.bFirstCheck = false;
			var length = cells ? cells.length : 0;
			var len = rangeInfo.endCol - rangeInfo.startCol + 1;
			for (var i = 0; i < length; i++) {
				var cell = cells[i];
				if (cell) {
						try {
							this._checkCell(cell, param);
						} catch (e) {
							if (checkRow)
								reference._firstCheckRows = false;
							else
								reference._firstCheckCells = false;
							this._pcm._rangeList[reference.getId()] = reference;//TODO: rangeId might not exist for area, it is id		
							throw e;
						}
					
					var success = func(cell, parseInt((i / len)) + rangeInfo.startRow, (i % len) + rangeInfo.startCol);
					if (!success) break;
				}
			}
		
			return;
		}
		var withCache = reference.isCacheEnabled();
			var iter = new websheet.model.RangeIterator(rangeInfo, this.Constant.RangeIterType.OPTIMIZEVALUE);
			cells = [];
			iter.iterate(dojo.hitch(this, function(cell, row, col){
				try {
						this._checkCell(cell, param);
					} catch (e) {
						if (checkRow)
							reference._firstCheckRows = false;
						else
							reference._firstCheckCells = false;
						this._pcm._rangeList[reference.getId()] = reference;//TODO: rangeId might not exist for area, it is id		
						throw e;
					}
				if (withCache) {
					var size = (row - rangeInfo.startRow) * (rangeInfo.endCol - rangeInfo.startCol + 1) + (col - rangeInfo.startCol);
					for (var i = cells.length; i < size; i++)
						cells.push(null);
					cells.push(cell);
				}
				
				return func(cell, row, col);
			}));
			
			reference.setCache(cells, this.Constant.RangeType.RANGE);
			
			if (!deepParsing) {
				var error = param.error;
				if(error && error != this.Constant.ERRORCODE["2001"])
					throw error;

				if(!param.bIgnoreUnParse){
					if(param.bThrowUnCalcExp){
						throw this.Constant.ERRORCODE["2001"];
					}
				}

				if (checkRow)
					reference._firstCheckRows = false;
				else
					reference._firstCheckCells = false;
				this._pcm._rangeList[reference.getId()] = reference;//TODO: rangeId might not exist for area, it is id
			}
		
	},
	
	checkCellFunc: function(cell, row, col) {
//		if (deepParsing)
//			this._parseCell(cell, param.bIgnoreError);
		
//		if (!deepParsing) {
			if ((!cell.isParsed || cell._isUnCalc || cell._isDirty) || cell._error) {
				try {
					this._checkCell(cell, param);
				} catch (e) {
					if (checkRow)
						reference._firstCheckRows = false;
					else
						reference._firstCheckCells = false;
					this._pcm._rangeList[reference.getId()] = reference;//TODO: rangeId might not exist for area, it is id		
					throw e;
				}
				
//				// don't calculate formula if it is first time to check the reference, and the formula isn't sumif that ignores unparsed cell, and there have unparsed cells.
//				// need to put them into partialCalcManager 
//				if (param.bFirstCheck && !param.bIgnoreUnParse && param.error == this.Constant.ERRORCODE["2001"])
//					return true;
			}
//		}
		
//		if (withCache) {
//			var size = (row - rangeInfo.startRow) * (rangeInfo.endCol - rangeInfo.startCol + 1) + (col - rangeInfo.startCol);
//			for (var i = cells.length; i < size; i++)
//				cells.push(null);
//			cells.push(cell);
//		}
//		
//		return func(cell, row, col);
	},
	
	//when loading document, if the cell has error, throw it directly
	//so that the formula cell reference this cell will return error without calculation
	/*void*/_parseCell:function(cell, bIgnoreError)
	{
		if (!cell) return;
		
		if(!cell.isParsed)
		{
			cell._parse();
			var et = cell.getError();
			if(et && !bIgnoreError)
			{
				if(et.errorType == this.Constant.ErrorType.UNSUPPORTFORMULA)
				{
					throw this.Constant.ERRORCODE["1003"];
				}else{
					throw et;
				}
			}
		}
	},
	
	/*
	 * Check whether this cell should be parsed or calculated or contain any error
	 */
	/*void*/_checkCell:function(cell, param){
		if (!cell) return;
		
		var bIgnoreError = param.bIgnoreError;
		var bIgnoreRecursive = param.bIgnoreRecursive;
		if(!cell.isParsed || cell._isUnCalc || cell._isDirty){
			//for first check, should put all the cells to partialCalcManager
			//if the cell is not parsed
			//then put it to fCells of sheet
			//so that it can be parsed in sheet.partialParse
			//make sure that cell is unique in _fCells
			var bFirstCheck = param.bFirstCheck;
			var bIgnoreUnParse = param.bIgnoreUnParse;
			var currentCalcManager = null;
			var sId = null;
			if(!currentCalcManager)
			{
				var currentTask = this._tm._current;
				if(currentTask){
					var scope = currentTask.scope;
					if(scope && scope._addF)
					{
						currentCalcManager = scope;
						sId = currentTask.args[0];
					}
				}
				if(!currentCalcManager)
					currentCalcManager = this._pcm;
			}
			currentCalcManager._addF(cell, sId);

			var curCell = this.FormulaParseHelper.getCurrentParseCell();
			if(cell == curCell && !bIgnoreRecursive)
				throw this.Constant.ERRORCODE["522"];
			
			if(!bFirstCheck){
				if(!bIgnoreUnParse)
					throw this.Constant.ERRORCODE["2001"];
			}
			param.bThrowUnCalcExp = true;
			if(!param.error)//return the first encountered error, the unparsed cell might also contain error value after calcuated done
				param.error = this.Constant.ERRORCODE["2001"];
		} else {
			var et = cell._error;
			if(!bIgnoreRecursive){
				var curCell = this.FormulaParseHelper.getCurrentParseCell();
				if(cell == curCell)
					throw this.Constant.ERRORCODE["522"];
			}
			if(et && !bIgnoreError)
			{
				if(et.errorType == this.Constant.ErrorType.UNSUPPORTFORMULA)
				{
					et = this.Constant.ERRORCODE["1003"];
				}
				throw et;
			}
		}
	},
	
	//token should be the FormulaToken or true if it has been regonized as range or cell model
	_throwError: function(err, token){
		if(err){
			if (err.errorType == this.Constant.ErrorType.UNSUPPORTFORMULA)
				if(this.isRangeObj(token) || token === true)
					throw this.Constant.ERRORCODE["1003"];// throw #VALUE! if the parameter is range which refer to unsupport formula
				//else if parameter is a function which is unsupport, then throw 1001(that is unsupport formula error)
			
			throw err;
		}
	},
	
	wildcardMapping: function(lookup_value)
	{
		return websheet.Helper.wildcardMapping(lookup_value);
	},
	
	/**
	 * Generate the update token for the given token with updateParsedRef
	 * delete the old update token and push this new update token to current cell
	 * if the update token address is not changed, do nothing
	 * @param token
	 * @param updateParsedRef
	 * @param sheetName
	 * @param currentCell
	 * @param bCheckExist  check if the updateParsedRef exist in token's updateTokens
	 */
	generateUpdateToken:function(token, updateParsedRef, sheetName, currentCell, bCheckExist)
	{
		return this.FormulaParseHelper.generateUpdateToken(token, updateParsedRef, sheetName, currentCell, bCheckExist);
	},
	
	/*
	 * check whether this cell has error when calculated
	 * detect circular loop and throw 522 code when load the sheet 
	 */
	preCheckCellError: function(context, cell){
		var currentCell = context.currentCell;
		if(cell && currentCell && cell == currentCell && this.Object.JS)
		{
			var doc = currentCell._doc;
//			if(doc.isLoading && !doc.isDeepParsing)//in this senaria, cell._checkCR will not be excecute
			if(!doc.isDeepParsing)
				throw this.Constant.ERRORCODE["522"];
		}
		if(cell){
			var err = cell.getError();
			this._throwError(err, true);
		}
	},
	
	/**
	 * check the string wheather error message used by iserr, iserror formulas.
	 * @param text
	 * @returns
	 */
	isError: function(text){
		var errMsg = websheet.functions.errMsg;
		switch(text){
		case errMsg.DIV:
		case errMsg.NAME:
		case errMsg.VALUE:
		case errMsg.NUL:
		case errMsg.NUM:
		case errMsg.REF:
		case errMsg.NA:
			return true;
		default:
			return false;	
		}
	},
	
	getLocale: function() {
		return websheet.Helper.getLocale();
	},
	
	isCJKLocale: function() {
		var isCJK = false;
		var locale = this.getLocale();
		//Defined in websheet.i18n.Number.getLocaleStore();
		if(locale == "ja" || locale == "ko-kr" || locale == "zh-cn" || locale == "zh-tw"){
			isCJK = true;
		}
		
		return isCJK;
	},
	
	// get row/column and dimension size of range/array
	getArrayRowColSize: function(value) {
		var rowSize = 1;
		var colSize = 1;
		var dimension = 0;
		var ret = {};
		if (dojo.isArray(value)) {
			// 2-dimensional array
			if (value && value.colSize) {
				ret.colSize = value.colSize;
				ret.rowSize = value.rowSize;
				if (!dojo.isArray(value[0])) {
					ret.dimension = 1;
				} else
					ret.dimension = 2;
				return ret;
			} else if (dojo.isArray(value[0])) {
				colSize = value[0].length;
				rowSize = value.length;
				dimension = 2;
			} else {
				// change array form 1-dimensional to 2-dimensional
				colSize = value.length;
				dimension = 1;
			}
			// check every column size of every row for 2-dimensional array
	 		for (var i = 1; i < rowSize; i++) {
	 			if (value[i].length != colSize)
	 				throw this.Constant.ERRORCODE["519"]; //can't be existed in MS
	 		}
		} else if (this.Object.isReference(value)) {
			if(value.is3DArea())
				throw this.Constant.ERRORCODE["519"];
			var valueInfo = value._getRangeInfo(true);//get the max column size as MS office - 16384
			rowSize = valueInfo.endRow - valueInfo.startRow + 1;
			colSize = valueInfo.endCol - valueInfo.startCol + 1;
			if (!(rowSize == 1 && colSize == 1)) {
				if (rowSize == 1)
					dimension = 1;
				else
					dimension = 2;
			}
		}
	
		ret.colSize = colSize;
		ret.rowSize = rowSize;
		ret.dimension = dimension;
		return ret;
	},	
	
	// get information of range/array/cell/value
	// column and row size, value(2D), dimension
	getArrayInfo: function(value) {
		var ret = this.getArrayRowColSize(value);
		var dimension = ret.dimension;
		if (dojo.isArray(value)) {
			if (dimension == 1)
				value = [value];
			ret.defaultValue = value.defaultValue;
		} else if (this.Object.isReference(value)) {
			if (dimension == 0) {
				value = value.getCell(0, 0, true, this.bIgnoreError);
				value = [[value]];
			} else {
				var param = {bIgnoreError: true, bIgnoreRecursive: true};
				value = this.getRows(value, param);
			}
		} else if (dimension == 0) {
			value = [[value]];
		}
		
		ret.array = value;
		return ret;
	},	
	
	// handle with the function which only has one argument(Ex. is*, code, value)
	// @value: the argument (can be const-array, intersection/union, range/cell, value)
	// @argIndex: argument index in current fucntion, just for "index" now
	// @bIgnoreError: ingore error
	/*array*/calcSingleArgFunc: function(context, value, bIgnoreError, argIndex) {
		if(value.getType() == this.tokenType.SINGLEQUOT_STRING)
			throw this.Constant.ERRORCODE["519"];		
		// the tokenList is not error
		var result = this.analyzeToken(value);
		if(dojo.isArray(result)) {
			if (this.isRangeObj(result[0])) {
				if (result.length > 1) {
					// union return #VALUE! default, if ignore error, need special handling
					if (bIgnoreError)
						return this.operatorUnionValue(context);
					else
						throw this.Constant.ERRORCODE["519"];   // general rule is return #value! for union
				} else {
					result = this.analyzeToken(result[0]);
				}
			} else {
				// iterate element in const-array
				return this.iterate2D(result);
			}
		}
		
		var retValue;
		if (this.isRangeObj(result)) {
			if(result.is3DArea())
				throw this.Constant.ERRORCODE["524"];
			if (!this.isArrayValueFunc(context, argIndex)) {
				// get a single value, but not array value
				try{
					retValue = this.getScalaCell(result, bIgnoreError);
				}catch(e){
					if( e == this.Constant.ERRORCODE["2001"] || 
						e == this.Constant.ERRORCODE["1001"] ||
						e == this.Constant.ERRORCODE["522"])
					{
						if(!this.ignoreUnparse)
							throw e;
					}
					//if can not get scala cell, it will throw #VALUE!
					if(bIgnoreError)
						retValue = e;
					else
						throw e;
				}
			} else {
				if(result.isSingleCell()){
					// is a single cell
					retValue = result.getCell(0, 0, true, bIgnoreError);
				} else {
					// iterate every cell in range
					return this.iterate2D(result, bIgnoreError);
				}
			}
		} else
			retValue = result;
		
		return this._operatorSingleValue(retValue);
	},
	
	// array is result of constant-array, range calculated or union/intersection
	// @funName(must): other cases, current function name
	iterate2D: function(value, ignoreErr) {
		var result = [];
		var rowLen;
		var colLen;
		// convert to 2D
		if (dojo.isArray(value)) {
			if (!dojo.isArray(value[0]))
				value = [value];
			rowLen = value.length;
			colLen = value[0].length;
			for (var i = 0; i < rowLen; i++) {
				var row = [];
				for (var j = 0; j < colLen; j++) {
					try {
						row[j] = this._operatorSingleValue(value[i][j]);
					} catch (err) {
						row[j] = err;
					}
				}
				result[i] = row;
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
							defRow[j] = this._operatorSingleValue(defValue[i][j]);
						} catch (err) {
							defRow[j] = err;
						}
					}
					defRes[i] = defRow;
				}
				result.defaultValue = defRes;
			}
			// row and column size of input
			if (value.rowSize && value.colSize) {
				result.rowSize = value.rowSize;
				result.colSize = value.colSize;
			}
		} else if (this.Object.isReference(value)) {
			var param = {bIgnoreError: ignoreErr};
			var rows = this.getRows(value, param);
			rowLen = rows.length;
			colLen = rows.colSize;
			
			for(var r = 0;r < rowLen; r++){
				var row = [];
				for(var c =0; c < colLen; c++){
					var cell = rows[r][c];
					row[c] = this._operatorSingleValue(cell);
				}
				result[r] = row;
			}
			// get default value for range empty cells. Ex. A:B, except the data rows, other need default value
			var rangeInfo = value._getRangeInfo();
		 	var rowSize = rangeInfo.endRow - rangeInfo.startRow + 1;
		 	var colSize = rangeInfo.endCol - rangeInfo.startCol + 1;
		 	
		 	if(rowSize != rowLen || colSize != colLen){
		 		result.rowSize = rowSize;
		 		result.colSize = colSize;
		 		var defValue = this._operatorSingleValue();
		 		result.defaultValue = [[defValue]];
		 	}
		}
		return result;
	},
	
	/**
	 * check if range expression is embraced by function which need return array values
	 * such as sumproduct and mode
	 */
	isArrayValueFunc: function(context, argIndex){
		var funcStack = context.funcStack;
		var size = funcStack.length;
		if(size > 0){
			var funcUtil = websheet.functions.Util;
			var func1 = funcStack[size - 1];
			// get argument index of func1
			var curIndex = (argIndex != undefined) ? argIndex : -1;
			var funcArgIndex = context.argIndexStack;
			var argSize = funcArgIndex.length;
			if (curIndex == -1 && argSize >= 1)
				curIndex = funcArgIndex[argSize - 1];

			var func1Res = funcUtil.isArrayValueFormulas(func1.getName(), curIndex);
			if (func1Res == this.Constant.FunctionValueType.ARRAY_VALUE)
				return true;
			else if (func1Res == this.Constant.FunctionValueType.SCALA_VALUE)
				return false;
			
			var func2 = null;
			var i;
			if(size > 1) {
				for (i = 2; i <= size; i++) {
					func2 = funcStack[size - i];
					// function n should be ingored.Ex: sumproduct(n(n(sum(a1:b2+1)))get array value
					if (func2.getName() != "N")
						break;
				}
			}
			// get index for func2
			curIndex = (argSize >= i) ? funcArgIndex[argSize - i] : -1;
			return funcUtil.isArrayValueFormulas(func2?func2.getName():null, curIndex) == this.Constant.FunctionValueType.ARRAY_VALUE;
		}
		return false;
	},
	
	getCurrentFunc: function(context){
		var funcStack = context.funcStack;
		return funcStack[funcStack.length - 1];
	},
	
	/**
	 * for array value of range expression, there might be default value for empty cell, such as A:A+1
	 * this method is used to get how many default values of this range expression
	 */
	_getArrayValueDefaultNum: function(item){
		var lenY = item.length;
		var y = item.rowSize;
		var x = item.colSize;
		var num = 0;
		for(var iy = 0; iy < lenY; iy++){
			var itemY = item[iy];
			if(item != null){
				if(dojo.isArray(itemY)){
					num += itemY.length;
				}else
					num++;
			}
		}
		num = x * y - num;
		return num;
	},
	
	// get one element from array by row/column index
	// {1,2,3;4,5,6} 2,2 -> 5    {1,2,3,4,5} 2,3 -> 3
	getArrayElementByPos : function(array, rowIndex, colIndex) {
		// if array has default value, use it. else, set it [null]
		var defaultRow;
		var arrayInfo = this.getArrayInfo(array);
		var row = [];
		if (rowIndex < arrayInfo.rowSize) {
			if (rowIndex < arrayInfo.array.length) {
				row = arrayInfo.array[rowIndex];
			} else if (array.defaultValue) {
				row = array.defaultValue[0];
				// if array has default value and its rowsize is bigger, use its default value
				if (arrayInfo.rowSize <= array.rowSize)
					defaultRow = row;
			} else {
				row = [null];    // for empty cell
				defaultRow = row;
			}
		} else if (arrayInfo.rowSize == 1) {
			row = arrayInfo.array[0];
			defaultRow = row;
		} else
			throw this.Constant.ERRORCODE["7"]; 
		
		var result;
		if (colIndex < arrayInfo.colSize)
			result = row[colIndex];
		else if (arrayInfo.colSize == 1)
			result = row[0];
		else
			throw this.Constant.ERRORCODE["7"];
		if (result == undefined) result = 0;
		if (this.Object.isCell(result))
			result = result.getComputeValue();
		// return the selected value and defaultRow if exist
		var ret = {};
		ret.value = result;
		if (defaultRow)
			ret.defaultRow = defaultRow;
		return ret;
	}
});