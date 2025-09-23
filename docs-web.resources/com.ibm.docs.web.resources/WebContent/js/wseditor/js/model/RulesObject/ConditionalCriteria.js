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
dojo.provide("websheet.model.RulesObject.ConditionalCriteria");
dojo.declare("websheet.model.RulesObject.ConditionalCriteria", null, {
	_parentCF: null,    // ConditionalFormat object host this ConditionalCriteria
	_type:null,			//websheet.Constant.CriteriaType, must have
	_operator:null,		//websheet.Constant.CriteriaOperator
	
	VALUETYPE: websheet.Constant.valueType,
	
	_styleid:null,		//format style id
	_dxfId:null,		//ooxml only ?
	
	_priority:1,		//int	, must have
	_stopIfTrue:null,	//bool
	
	_colors: null, //array, for color scale
	
	_cfvos: null, //array
	
	/*type is aboveAverage*/
	_aboveAverage: null,
	_equalAverage: null,
	_stdDev:null,
	
	/*type is top10*/
	_bottom: null,
	_percent: null,
	_rank:null,
	
	/*type is timePeriod*/
	_timePeriod: null, //websheet.Constant.CriteriaType.TimePeriod
	
	/*text for containsText, notContainsText, beginsWith, endsWith*/
	_text: null,
	
	_absResult: null, //all cells share the same result, the result is only related to criteria value, not related to cell itself.
	_result:null, // {rangeId, [styleId array]}
	_calcing: false,
	
	_tokenPos: 0,
		
	constructor: function(doc, criteria, parentCF){
		if(!criteria)
			return;
		
		this._parentCF = parentCF;
		this._doc = doc;
		this._type = criteria.type;
		this._operator = criteria.operator;
		
		if (criteria.styleid != null) {
			this._styleid = criteria.styleid;
		} else if (criteria.style != null) {
			this._styleid = this._doc._styleManager.addStyle(criteria.style);
		}

		if(criteria.dxfId != null)
			this._dxfId = criteria.dxfId;
		
		this._priority = criteria.priority;
		
		if(criteria.stopIfTrue != null)
			this._stopIfTrue = criteria.stopIfTrue;
		
		if(criteria.colors != null)
			this._colors = criteria.colors;
			
		this._cfvos = [];
		var cfvos = criteria.cfvos;
		if(cfvos){
			var len = cfvos.length;
			for(var i = 0; i < len ; i ++){
				switch(this._type){//Don't create cfvos for aboveAverage, top10 and timePeriod, they are not reference.
				case websheet.Constant.CriteriaType.ABOVEAVERAGE:
					var c = cfvos[i];
					if(c.type == websheet.Constant.CfvosType.ABOVEAVERAGE)
						this._aboveAverage = c.val;
					else if(c.type == websheet.Constant.CfvosType.EQUALAVERAGE)
						this._equalAverage = c.val;
					else if(c.type == websheet.Constant.CfvosType.STDDEV)
						this._stdDev = c.val;
					break;
				case websheet.Constant.CriteriaType.TOP10:
					var c = cfvos[i];
					if(c.type == websheet.Constant.CfvosType.BOTTOM)
						this._bottom = c.val;
					else if(c.type == websheet.Constant.CfvosType.PERCENT)
						this._percent = c.val;
					else if(c.type == websheet.Constant.CfvosType.RANK)
						this._rank = c.val;
					break;
				case websheet.Constant.CriteriaType.TIMEPERIOD:
					var c = cfvos[i];
					if(c.type == websheet.Constant.CfvosType.TIMEPERIOD)
						this._timePeriod = c.val;
					break;
				default:
					if(cfvos[i].type == websheet.Constant.CfvosType.TEXT)
						this._text = cfvos[i].val;
					else{
						var c = new websheet.model.RulesObject.ConditionalFvos(cfvos[i].val, cfvos[i]);
						this._cfvos.push(c);
					}
					break;
				}
			}
		}
	},
	
	getResult4Cell: function(rangeid, ri, ci)
	{
		if(this._absResult != null){
			if(this._absResult){
				if (this._stopIfTrue === true)
					return {p: this._priority, s : this._styleid, stt: true};
				return {p: this._priority, s : this._styleid};
			}
			return null;
		}
		if(!this._result)
			return null;
		if(!this._result[rangeid])
			return null;
		if(!this._result[rangeid][ri])
			return null;
		
		if (this._type == websheet.Constant.CriteriaType.COLORSCALE) {
			if(this._result[rangeid][ri][ci] == undefined)
				return null;
			
			if (this._stopIfTrue === true)
				return {p: this._priority, c : this._result[rangeid][ri][ci], stt: true};				
			return {p: this._priority, c : this._result[rangeid][ri][ci]};
		}
		else {
			if(!this._result[rangeid][ri][ci])
				return null;
			
			if (this._stopIfTrue === true)
				return {p: this._priority, s : this._styleid, stt: true};
			return {p: this._priority, s : this._styleid};
		}
	},
		
	cal4Range: function(baseRange, range, callBack)
	{
		if(range.endRow > g_maxSheetRows){
			range.endRow = g_maxSheetRows;
			if(range.startRow > range.endRow){
				callBack();
				return;
			}
		}
		
		if(range.endCol > websheet.Constant.MaxColumnIndex){
			range.endCol = websheet.Constant.MaxColumnIndex;
			if(range.startCol > range.endCol){
				callBack();
				return;
			}
		}
		
		if(!this._result)
			this._result = {};
		
		var ranges = this._parentCF ? this._parentCF.getRanges() : [baseRange];
		if (this.isRangeBasedCriteria()) {							
			var allExist = true;
			for (var i = 0; i<ranges.length; i++) {
				var arange = ranges[i];
				if(!this._result[arange._id]) {
					this._result[arange._id] = [];
					allExist = false;
				}
			}
			if (allExist) {//already has result for the range
				callBack();
				return;
			}
		}
		if(!this._result[baseRange._id]) {
			this._result[baseRange._id] = [];
		}
		
		var result = this._result[baseRange._id];//two dimensional array; For others the node is a boolean value, for colorScale the node is color value
		
		switch(this._type){//two kinds of type, related to one cell and related to entire range.
							//For criteria related to entire range, it means all the ranges in cf.ranges. The refs for its criteris can't be relative reference.
		case websheet.Constant.CriteriaType.CELLIS:
		case websheet.Constant.CriteriaType.BEGINSWITH:
		case websheet.Constant.CriteriaType.ENDSWITH:
		case websheet.Constant.CriteriaType.CONTAINSTEXT:
		case websheet.Constant.CriteriaType.NOTCONTAINSTEXT:
			this._cal4CellWithCfvos(baseRange, range, result, callBack);
			break;
		case websheet.Constant.CriteriaType.CONTAINSBLANKS:
		case websheet.Constant.CriteriaType.CONTAINSERRORS:
		case websheet.Constant.CriteriaType.NOTCONTAINSBLANKS:
		case websheet.Constant.CriteriaType.NOTCONTAINSERRORS:
		case websheet.Constant.CriteriaType.TIMEPERIOD:
			this._cal4CellOnly(baseRange, range, result, callBack);
			break;
		case websheet.Constant.CriteriaType.EXPRESSION:
			this._cal4CfvosOnly(baseRange, range, result, callBack);
			break;
		case websheet.Constant.CriteriaType.ABOVEAVERAGE:
			var equalAverage = this._equalAverage != null ? this._equalAverage : false;
			var aboveAverage = this._aboveAverage != null ? this._aboveAverage : true;
			var stdDev = this._stdDev != null ? this._stdDev : 0;
			this._calc4Average(equalAverage, aboveAverage, stdDev, ranges, this._result, callBack);
			break;
		case websheet.Constant.CriteriaType.TOP10:
			var percent = this._percent != null ? this._percent : false;
			var bottom = this._bottom != null ? this._bottom : false;
			var rank = this._rank != null ? this._rank : 0;
			this._calc4TopN(percent, bottom, rank, ranges, this._result, callBack);
			break;
		case websheet.Constant.CriteriaType.DUPLICATEVALUES:
			this._calc4Duplicates(false, ranges, this._result, callBack);
			break;
		case websheet.Constant.CriteriaType.UNIQUEVALUES:
			this._calc4Duplicates(true, ranges, this._result, callBack);
			break;
		case websheet.Constant.CriteriaType.COLORSCALE:
			this._calc4ColorScale(ranges, this._result, callBack);
			break;
		default:
			callBack();
			break;
		}
	},
	
	_cal4CfvosOnly: function(baseRange, range, result, callBack)
	{
		var callback = dojo.hitch(this,"_cal4CfvosOnly", baseRange, range, result, callBack);
		if(!this._prepareData(range, baseRange, callback, false, true))
			return;
		
		var parsedRef = baseRange._parsedRef;
		var sr = parsedRef.startRow;
		var sc = parsedRef.startCol;
		
		var value1 = this._cfvos[0];
		if(value1._type == this.VALUETYPE.RELFORMULA){
			value1Data = value1.getData4Range(baseRange._id);
			if(!value1Data){
				callBack();
				return;
			}
			for(var i = range.startRow; i <= range.endRow; i++){
				var rI = i - sr;
				if(!value1Data[rI])
					continue;
				for(var j = range.startCol; j <= range.endCol; j++){
					var cI = j - sc;
					if(result[rI] && result[rI][cI] != null)
						continue;
					var v = value1Data[rI][cI];
					if(v != null){
						if(v instanceof websheet.model.RulesObject.RuleDataCache)
							v = v.value;
						var ret = false;
						if(typeof v == "number" && v != 0)
							ret = true;
						else if(typeof v == "boolean")
							ret = v;
						if(!result[rI])
							result[rI] = [];
						result[rI][cI] = ret;
					}
				}
			}
		}else{//all cells in ranges have the same result.
			value1 = value1.getValue();
			if(value1 instanceof websheet.model.RulesObject.RuleDataCache)
				value1 = value1.value;
			var ret = false;
			if(typeof value1 == "number" && value1 != 0)
				ret = true;
			else if(typeof value1 == "boolean")
				ret = value1;
			this._absResult = ret;
		}
		callBack();
	},
	
	_cal4CellOnly: function(baseRange, range, result, callBack)
	{
		var callback = dojo.hitch(this,"_cal4CellOnly", baseRange, range, result, callBack);
		if(!this._prepareData(range, baseRange, callback, true, false))
			return;
		
		var parsedRef = baseRange._parsedRef;
		var sr = parsedRef.startRow;
		var sc = parsedRef.startCol;
		
		var iter = new websheet.model.RangeIterator(range, websheet.Constant.RangeIterType.CFOPTIMIZE);
		iter.iterate(dojo.hitch(this, function(obj, row, col){
			if(result[row - sr] && result[row - sr][col - sc])
				return true;
			
			var cell = obj ? obj.cell : null;
			var ret = false;
			switch(this._type){
			case websheet.Constant.CriteriaType.CONTAINSBLANKS:
				ret = !cell || cell.getCalculatedValue() === "";
				break;
			case websheet.Constant.CriteriaType.CONTAINSERRORS:
				ret = cell && cell.isError();
				break;
			case websheet.Constant.CriteriaType.NOTCONTAINSBLANKS:
				ret = cell && cell.getCalculatedValue() !== "";
				break;
			case websheet.Constant.CriteriaType.NOTCONTAINSERRORS:
				ret = !cell || !cell.isError();
				break;
			case websheet.Constant.CriteriaType.TIMEPERIOD:
				ret = this._calTimeperiod(cell);
				break;
			default:
				break;
			}
			if(!result[row - sr])
				result[row - sr] = [];
			result[row - sr][col - sc] = ret;
			return true;
		}));
		callBack();
	},
	
	_calTimeperiod: function(cell)
	{
		if(!cell)
			return false;
		var val = cell.getCalculatedValue();
		if(typeof val != "number")
			return false;
		if(!websheet.Helper.checkDateValidSpan(val))
			return false;
		
		switch(this._timePeriod){
		case websheet.Constant.TimePeriod.LASTMONTH:
			return websheet.Helper.isLastMonth(val);
		case websheet.Constant.TimePeriod.LASTWEEK:
			return websheet.Helper.isLastWeek(val);
		case websheet.Constant.TimePeriod.NEXTMONTH:
			return websheet.Helper.isNextMonth(val);
		case websheet.Constant.TimePeriod.NEXTWEEK:
			return websheet.Helper.isNextWeek(val);
		case websheet.Constant.TimePeriod.THISMONTH:
			return websheet.Helper.isThisMonth(val);
		case websheet.Constant.TimePeriod.THISWEEK:
			return websheet.Helper.isThisWeek(val);
		default:
			break;
		}
		
		var today = new Date();
		val = parseInt(val);
		var tsn = websheet.Helper.getSerialNumberWithDate(today, true);
		switch(this._timePeriod){
		case websheet.Constant.TimePeriod.LAST7DAYS:
			return tsn - val <= 6 && tsn >= val;
		case websheet.Constant.TimePeriod.TODAY:
			return tsn === val;
		case websheet.Constant.TimePeriod.TOMORROW:
			return tsn + 1 == val;
		case websheet.Constant.TimePeriod.YESTERDAY:
			return tsn - 1 == val;
		default:
			break;
		}
	},
	
	//In Excel error can not compare with any other type including error type. It always return false when comparing
	_cal4CellWithCfvos: function(baseRange, range, result, callBack)
	{
		var callback = dojo.hitch(this,"_cal4CellWithCfvos", baseRange, range, result, callBack);
		if(!this._prepareData(range, baseRange, callback, true, true))
			return;
		
		var parsedRef = baseRange._parsedRef;
		var sr = parsedRef.startRow;
		var sc = parsedRef.startCol;
		
		var value1 = this._text != null ? this._text : this._cfvos[0];
		var value2 = this._cfvos[1];
		
		var value1Data, value2Data;
		if(this._text != null)
			;
		else if(value1._type == this.VALUETYPE.RELFORMULA)
			value1Data = value1.getData4Range(baseRange._id);
		else{
			value1 = value1.getValue();
			if(typeof value1 == "string"){
				if(value1.indexOf("\"") == 0 && value1.lastIndexOf("\"") == value1.length - 1)
					value1 = value1.substring(1,value1.length - 1);
			}
			if(value1 instanceof websheet.model.RulesObject.RuleDataCache)
				value1 = value1.value;
			if(typeof value1 == "object" && value1.errorCode !== null){//all is false
				this._absResult = false;
				callBack();
				return;
			}
		}
		
		if(value2 != null){
			if(value2._type == this.VALUETYPE.RELFORMULA)
				value2Data = value2.getData4Range(baseRange._id);
			else{
				value2 = value2.getValue();
				if(typeof value2 == "string"){
					if(value2.indexOf("\"") == 0 && value2.lastIndexOf("\"") == value2.length - 1)
						value2 = value2.substring(1,value2.length - 1);
				}
				if(value2 instanceof websheet.model.RulesObject.RuleDataCache)
					value2 = value2.value;
				if(typeof value2 == "object" && value2.errorCode !== null){//all is false
					this._absResult = false;
					callBack();
					return;
				}				
			}
		}
		
		var compare = function(val, opt, v1, v2){
			switch(opt){
			case websheet.Constant.CriteriaOperator.GREATERTHAN:
				if(typeof val == typeof v1) {
					if(typeof val == "string"){
						val = val.toLowerCase();
						v1 = v1.toLowerCase();
					}
					return val > v1;
				}
				if(typeof val == "object" && val == null && typeof v1 == "number")
					return 0 > v1;
				if(typeof val == "object" && val == null && typeof v1 == "string")
					return false;
				if(typeof val == "boolean")
					return true;
				if(typeof v1 == "boolean")
					return false;
				return !(typeof val == "number");
			case websheet.Constant.CriteriaOperator.LESSTHAN:
				if(typeof val == typeof v1) {
					if(typeof val == "string"){
						val = val.toLowerCase();
						v1 = v1.toLowerCase();
					}
					return val < v1;
				}
				if(typeof val == "object" && val == null && typeof v1 == "boolean")
					return v1;
				if(typeof val == "object" && val == null && typeof v1 == "number")
					return 0 < v1;
				if(typeof val == "object" && val == null && typeof v1 == "string")
					return v1 != "";
				if(typeof val == "boolean")
					return false;
				if(typeof v1 == "boolean")
					return true;
				return typeof val == "number";
			case websheet.Constant.CriteriaOperator.GREATERTHANOREQUAL:
				return compare(val, websheet.Constant.CriteriaOperator.GREATERTHAN, v1, v2) || compare(val, websheet.Constant.CriteriaOperator.EQUAL, v1, v2);
			case websheet.Constant.CriteriaOperator.LESSTHANOREQUAL:
				return compare(val, websheet.Constant.CriteriaOperator.LESSTHAN, v1, v2) || compare(val, websheet.Constant.CriteriaOperator.EQUAL, v1, v2);
			case websheet.Constant.CriteriaOperator.EQUAL:
				if(typeof val == typeof v1){
					if(typeof val == "string"){
						val = val.toLowerCase();
						v1 = v1.toLowerCase();
					}
					return val == v1;
				}
				else if(typeof val == "object" && val == null && ( (typeof v1 == "number" && v1 == 0) || (typeof v1 == "string" && v1 == "") || (typeof v1 == "boolean" && v1 == false) ))
					return true;
				else
					return false;
			case websheet.Constant.CriteriaOperator.NOTEQUAL:
				return !compare(val, websheet.Constant.CriteriaOperator.EQUAL, v1, v2);
			case websheet.Constant.CriteriaOperator.BETWEEN:
				return (compare(val, websheet.Constant.CriteriaOperator.GREATERTHANOREQUAL, v1, v2) && compare(val, websheet.Constant.CriteriaOperator.LESSTHANOREQUAL, v2, v2)) 
					|| (compare(val, websheet.Constant.CriteriaOperator.GREATERTHANOREQUAL, v2, v2) && compare(val, websheet.Constant.CriteriaOperator.LESSTHANOREQUAL, v1, v2));
			case websheet.Constant.CriteriaOperator.NOTBETWEEN:
				return !compare(val, websheet.Constant.CriteriaOperator.BETWEEN, v1, v2);
			default:
				break;
			}
		};
		
		var containsText = function(val, v1){
			if(val === "" || val === null || val === undefined)
				return false;			
			if(typeof val != "string")
				val = val + "";
			val = val.toLowerCase();
			if(typeof v1 != "string")
				v1 = v1 + "";
			v1 = v1.toLowerCase();
			var s1 = websheet.Helper.wildcardMapping(v1);
			var reg = new RegExp(s1,"i");
			return reg.test(val);
		};
		
		var iter = new websheet.model.RangeIterator(range, websheet.Constant.RangeIterType.CFOPTIMIZE);
		iter.iterate(dojo.hitch(this, function(obj, row, col){//Add empty result for hide row or col?
			var rI = row - sr;
			var cI = col - sc;
			if(result[rI] && result[rI][cI] != null) //There is cached data in result
				return true;

			var cell = obj ? obj.cell : null;
			var val = null;
			var isEmptyCell = true;
			if(cell){
				isEmptyCell = false;
				val = cell.isError() ? null : cell.getCalculatedValue();
				if(cell.isBoolean())
					val = val === 0 ? false : true;
			}
			
			var ret = true;
			var v1 = value1, v2 = value2;
			if(val != null || isEmptyCell){
				if(value1Data && value1Data[rI]){
					v1 = value1Data[rI][cI];
					if(v1 instanceof websheet.model.RulesObject.RuleDataCache)
						v1 = v1.value;
					if(typeof v1 == "object" && v1.errorCode !== null)
						ret = false;
				}
				if(value2Data && value2Data[rI]){
					v2 = value2Data[rI][cI];
					if(v2 instanceof websheet.model.RulesObject.RuleDataCache)
						v2 = v2.value;
					if(typeof v2 == "object" && v2.errorCode !== null)
						ret = false;
				}
				if(ret){
					switch(this._type){
					case websheet.Constant.CriteriaType.CELLIS:
						ret = compare(val, this._operator, v1, v2);
						break;
					case websheet.Constant.CriteriaType.BEGINSWITH:
						if(typeof v1 != "string")
							v1 += "";
						
						if(typeof val != "string")
							val = val + "";
						val = val.toLowerCase();
						v1 = v1.toLowerCase();
						ret = (val.indexOf(v1) == 0);
							
						break;
					case websheet.Constant.CriteriaType.ENDSWITH:
						if(typeof v1 != "string")
							v1 += "";
						if(typeof val != "string")
							val = val + "";
						val = val.toLowerCase();
						v1 = v1.toLowerCase();
						var idx = val.lastIndexOf(v1);
						ret = (idx != -1) && (v1.length + idx == val.length);
						
						break;
					case websheet.Constant.CriteriaType.CONTAINSTEXT:
						ret = containsText(val, v1);
						break;
					case websheet.Constant.CriteriaType.NOTCONTAINSTEXT:
						ret = !containsText(val, v1);
						break;
					default:
							break;
					}
				}
			}else
				ret = false;
			
			if(!result[rI])
				result[rI] = [];
			result[rI][cI] = ret;
			
			return true;
		}));
		callBack();
	},
	
	_prepareData4Ranges: function(ranges, CB, preCell, preCfvos)
	{
		for (var i=0; i< ranges.length; i++) {
			if (!this._prepareData(ranges[i]._parsedRef, ranges[i], CB, preCell, preCfvos))
				return false;
		}
		return true;
	},
	
	/**
	 * 
	 * @param unique -- boolean, check duplicates or unique
	 * @param baseRange -- the range of the CF
	 * @param result -- the cache of the result calculated
	 * @param callBack -- callback function after calculation
	 */
	_calc4Duplicates: function(unique, ranges, results, callBack)
	{
		var callback = dojo.hitch(this,"_calc4Duplicates", unique, ranges, results, callBack);
		if(!this._prepareData4Ranges(ranges, callback, true, false))
			return;
		
		// generate a cells array
		var arr = this._generateArray4Ranges(ranges, false);
		var l = arr.length;
		if (l < 1) {
			this._clearResult4Ranges();
			this._absResult = false;
			callBack();
			return;
		}
				
		// get the duplicate values array
		var dups = websheet.Helper.getDuplicateElems(arr, true);		
		
		// set result that will use the CF style
		for (var i=0; i<ranges.length; i++) {
			var arange = ranges[i];
			var parsedRef = arange._parsedRef;
			var sr = parsedRef.startRow;
			var sc = parsedRef.startCol;
			var result = results[arange._id];
			var iter = new websheet.model.RangeIterator(parsedRef, websheet.Constant.RangeIterType.CFOPTIMIZEVALUE);
			iter.iterate(dojo.hitch(this, function(cell, row, col){
				var v = cell && cell.getCalculatedValue();
				
				if(!result[row - sr])
					result[row - sr] = [];
				
				if (v != null && v != undefined)
				{					
					if(cell.isBoolean())
						v = cell._showValue;
					if(typeof v == "string")
						v = websheet.BrowserHelper._composeByLocale(v.toLowerCase());
					var found = false;
					for (var k = 0; k < dups.length; k++)
					{
						if(v == dups[k]) {
							found =true;
							break;
						}
					}
					
					result[row - sr][col - sc] = (found != unique);
				}
				else
				{
					// don't set style for duplicate/unique CF for empty cells
					result[row - sr][col - sc] = false;
				}
				return true;
			}));
		}
		
		// call back
		callBack();		
	},
	
	/**
	 * 
	 * @param percent -- boolean, percentage or absolute number 
	 * @param bottom -- boolean, top N or bottom N
	 * @param rank -- N of the top N or bottom N
	 * @param baseRange
	 * @param result
	 * @param callBack
	 */
	_calc4TopN: function(percent, bottom, rank, ranges, results, callBack)
	{
		if (!websheet.Helper.isInt(rank) || rank < 1){
			this._absResult = false;
			callBack();
			return;
		}
		
		var callback = dojo.hitch(this,"_calc4TopN", percent, bottom, rank, ranges, results, callBack);
		if(!this._prepareData4Ranges(ranges, callback, true, false))
			return;
		
		// generate a cells array
		var arr = this._generateArray4Ranges(ranges, true);
		var l = arr.length;
		if (l < 1) {
			this._clearResult4Ranges();
			this._absResult = false;
			callBack();
			return;
		}
		
		arr.sort(function(a, b){
			return a - b;
		});
		
		var threshold = 0;
		// calculate threshold	
		if (!percent) 
		{
			threshold = websheet.Helper.getNumericThreshold(arr, bottom, rank);
		}
		else 
		{
			threshold = websheet.Helper.getPercentThreshold(arr, bottom, rank);
		}
		
		// set result that will use the CF style
		for (var i=0; i<ranges.length; i++) {
			var arange = ranges[i];
			var result = results[arange._id];
			this._setResult4Threshold(arange._parsedRef, result, true, !bottom, threshold);
		}
		
		// call back
		callBack();		
	},
	
	/**
	 * 
	 * @param include -- boolean, include average
	 * @param above -- boolean, above average or below average
	 * @param stddev -- Number, sigma count
	 *                  for above, average = average + stddev * sigma
	 *                  for below, average = average - stddev * sigma
	 * @param baseRange
	 * @param result
	 * @param callBack
	 */
	_calc4Average: function(include, above, stddev, ranges, results, callBack)
	{
		var callback = dojo.hitch(this,"_calc4Average", include, above, stddev, ranges, results, callBack);
		if(!this._prepareData4Ranges(ranges, callback, true, false))
			return;
		
		// generate a cells array
		var arr = this._generateArray4Ranges(ranges, true);
		if (arr.length < 1) {
			this._clearResult4Ranges();
			this._absResult = false;
			callBack();
			return;
		}
		
		var sigma = 0, average = 0;
		average = websheet.Math.mean(arr);
		// calculate the sigma
		if (stddev && stddev % 1 == 0)
		{
			sigma = websheet.Math.std(arr, average, true);
		}
		
		// get threshold value
		var threshold = average;
		if (above === true)
		{
			threshold = websheet.Math.add(threshold, stddev * sigma);
		}
		else 
		{
			threshold = websheet.Math.sub(threshold, stddev * sigma);
		}
		
		// set result that will use the CF style
		for (var i=0; i<ranges.length; i++) {
			var arange = ranges[i];
			var result = results[arange._id];
			this._setResult4Threshold(arange._parsedRef, result, include, above, threshold);
		}
		
		// call back
		callBack();
	},
	
	_generateArray4Ranges: function(ranges, mustNumber)
	{
		var arr = [];		
		for (var i=0; i<ranges.length; i++) {
			var iter = new websheet.model.RangeIterator(ranges[i]._parsedRef, websheet.Constant.RangeIterType.OPTIMIZEVALUE);
			iter.iterate(dojo.hitch(this, function(cell, row, col){
				if (cell) 
				{
					var v = cell && cell.getCalculatedValue();
					if (v != null && v != undefined)
					{
						if (mustNumber)
						{
							if (typeof v == "number" && !isNaN(v) && !cell.isBoolean())
								arr.push(v);
						}
						else {
						    if (cell.isBoolean())
						    	v = cell._showValue;
							arr.push(v);
						}
					}
				}
				return true;
			}));
		}
		
		return arr;
	},

	_setResult4Threshold: function(range, result, include, above, threshold)
	{
		var sr = range.startRow;
		var sc = range.startCol;
		
		var iter = new websheet.model.RangeIterator(range, websheet.Constant.RangeIterType.CFOPTIMIZEVALUE);
		iter.iterate(dojo.hitch(this, function(cell, row, col){
			var v = cell && cell.getCalculatedValue();
			
			if(!result[row - sr])
				result[row - sr] = [];
			
			if (typeof v == "number" && !isNaN(v) && !cell.isBoolean())
			{	
				if (above) {
					if (v > threshold) {
						result[row - sr][col - sc] = true;
					}
					else if (v == threshold && include) {
						result[row - sr][col - sc] = true;
					}
					else {
						result[row - sr][col - sc] = false;
					}
				}
				else {
					if (v < threshold) {
						result[row - sr][col - sc] = true;
					}
					else if (v == threshold && include) {
						result[row - sr][col - sc] = true;
					}
					else {
						result[row - sr][col - sc] = false;
					}						
				}				
			}
			else
			{					
				result[row - sr][col - sc] = false;
			}
			return true;
		}));			
	},
	
	/**
	 * 
	 * @param baseRange
	 * @param result
	 * @param callBack
	 */
	_calc4ColorScale: function(ranges, results, callBack)
	{
		var callback = dojo.hitch(this,"_calc4ColorScale", ranges, results, callBack);
		if(!this._prepareData4Ranges(ranges, callback, true, true))
			return;
		
		// generate a cells array
		var arr = this._generateArray4Ranges(ranges, true);
		if (arr.length < 1) {
			this._clearResult4Ranges();
			this._absResult = false;
			callBack();
			return;
		}
		
		arr.sort(function(a, b){
			return a - b;
		});		
		
		for (var i=0; i<ranges.length; i++) {
			var arange = ranges[i];
			var result = results[arange._id];			
			this._setResult4ColorScale(arange._parsedRef, result, arr);
		}
		
		// call back
		callBack();
	},
	
	/**
	 * cfvo -- Cfvo object
	 * arr -- the sorted number array
	 */
	_getColorScaleValue: function(cfvo, arr)
	{
		switch(cfvo.getType()) {
		case websheet.Constant.CfvosType.MIN:
			return arr && arr.length ? arr[0] : NaN;
		case websheet.Constant.CfvosType.MAX:
			return arr && arr.length >= 0 ? arr[arr.length-1] : NaN;
		case websheet.Constant.CfvosType.PERCENT:
			var min = arr[0];
			var max = arr[arr.length -1];
			var ret = min+(max-min)*cfvo.getValue()/100;
			return ret;
		case websheet.Constant.CfvosType.PERCENTILE:
			return websheet.Helper.getPercentileThreshold(arr, cfvo.getValue());
		case websheet.Constant.CfvosType.NUMBER:
			return cfvo.getValue();
		default:
			return cfvo.getValue();
		}
	},
	
	_getColor: function(r1, g1, b1, r2, g2, b2, min, max, val) 
	{
		// caller should check that val, min, max are number for performance purpose
		var clr;
		if (val <= min) {
			clr = [r1,g1,b1];
			return dojo.colorFromArray(clr);
		}
		else if (val >= max) {
			clr = [r2,g2,b2];
			return dojo.colorFromArray(clr);
		}
		else if (min === max) {
			clr = [r1,g1,b1];
			return dojo.colorFromArray(clr);
		}
		else {						
			var ratio = (val - min) / (max - min);
			clr = [Math.abs(Math.floor((r2 - r1) * ratio) + r1), Math.abs(Math.floor((g2 - g1) * ratio) + g1), Math.abs(Math.floor((b2 - b1) * ratio) + b1)];			
			return dojo.colorFromArray(clr);
		}
	},
	
	_setResult4ColorScale: function(range, result, arr)
	{
		var lo = this._cfvos ? this._cfvos.length : 0;
		var lc = this._colors ? this._colors.length : 0;
		var min, mid, max, clr1, clr2, clr3;
		var r1, g1, b1, r2, g2, b2, r3, g3, b3;
		var is3D = false;
		if (lo === 2 && lc >= 2) {
			min = this._getColorScaleValue(this._cfvos[0], arr);
			max = this._getColorScaleValue(this._cfvos[1], arr);
			if (typeof min != 'number' || typeof max != 'number') {
				return;
			}
			var tempArr = [min, max];
			tempArr.sort(function(a, b){
				return a - b;
			});	
			min = tempArr[0];
			max = tempArr[1];
			
			clr1 = dojo.colorFromHex(this._colors[0]);
			clr2 = dojo.colorFromHex(this._colors[1]);
			
			r1 = clr1.r, g1 = clr1.g, b1 = clr1.b;
			r2 = clr2.r, g2 = clr2.g, b2 = clr2.b;
		}
		else if (lo === 3 && lc >= 3) {
			is3D = true;
			min = this._getColorScaleValue(this._cfvos[0], arr);
			mid = this._getColorScaleValue(this._cfvos[1], arr);
			max = this._getColorScaleValue(this._cfvos[2], arr);
			if (typeof min != 'number' || typeof max != 'number' || typeof mid != 'number') {
				return;
			}
			var tempArr = [min, mid, max];
			tempArr.sort(function(a, b){
				return a - b;
			});	
			min = tempArr[0];
			mid = tempArr[1];
			max = tempArr[2];
			
			clr1 = dojo.colorFromHex(this._colors[0]);
			clr2 = dojo.colorFromHex(this._colors[1]);
			clr3 = dojo.colorFromHex(this._colors[2]);
			
			r1 = clr1.r, g1 = clr1.g, b1 = clr1.b;
			r2 = clr2.r, g2 = clr2.g, b2 = clr2.b;
			r3 = clr3.r, g3 = clr3.g, b3 = clr3.b;
		}
		else {
			return;
		}
		
		var sr = range.startRow;
		var sc = range.startCol;
		
		var context = this;
		var iter = new websheet.model.RangeIterator(range, websheet.Constant.RangeIterType.CFOPTIMIZEVALUE);
		iter.iterate(dojo.hitch(this, function(cell, row, col){
			var v = cell && cell.getCalculatedValue();
			
			if(!result[row - sr])
				result[row - sr] = [];
			
			if (typeof v == "number" && !isNaN(v) && !cell.isBoolean())
			{	
				var color;
				if (is3D) {
					if (v <= mid) {
						color = context._getColor(r1, g1, b1, r2, g2, b2, min, mid, v);
					}
					else {
						color = context._getColor(r2, g2, b2, r3, g3, b3, mid, max, v);
					}
					
				}
				else {
					color = context._getColor(r1, g1, b1, r2, g2, b2, min, max, v);					
				}
				result[row - sr][col - sc] = color.toHex();
			}
			return true;
		}));			
	},
	
	_optimizeHideCell: function()
	{
		var ret = false;
		switch(this._type){
		case websheet.Constant.CriteriaType.CELLIS:
		case websheet.Constant.CriteriaType.BEGINSWITH:
		case websheet.Constant.CriteriaType.CONTAINSBLANKS:
		case websheet.Constant.CriteriaType.CONTAINSERRORS:
		case websheet.Constant.CriteriaType.CONTAINSTEXT:
		case websheet.Constant.CriteriaType.ENDSWITH:
		case websheet.Constant.CriteriaType.EXPRESSION:
		case websheet.Constant.CriteriaType.NOTCONTAINSBLANKS:
		case websheet.Constant.CriteriaType.NOTCONTAINSERRORS:
		case websheet.Constant.CriteriaType.NOTCONTAINSTEXT:
		case websheet.Constant.CriteriaType.TIMEPERIOD:
			ret = true;
			break;
		default:
			break;
		}
		return ret;
	},
	
	_prepareData: function(range, baseRange, CB, preCell, preCfvos)
	{
		var optimize = this._optimizeHideCell();//optimize for cellis, but not for average or topn
		var pcm = this._doc._mhelper.getPartialCalcManager();
		var tm = this._doc._taskMgr;
		var calcingData = {};
		//calculate range itself.
		//check range itself.
		if(preCell){
			var isUnCal = false;
			var iter = new websheet.model.RangeIterator(range, websheet.Constant.RangeIterType.OPTIMIZEVALUE);
			iter.iterate(dojo.hitch(this, function(cell, row, col){
				if(!cell.isParsed || cell._isUnCalc || cell._isDirty){
					isUnCal = true;
					return false;
				}
				return true;
			}));
			if(isUnCal){
				calcingData.range = range;
				var callback = dojo.hitch(this,"_cellCalcFinished","range", calcingData, CB);
				tm.addTask(pcm, "startWithCondition", [range, callback], tm.Priority.UserOperation);
			}
		}
		if(preCfvos){
			var sheet = this._doc.getSheet(range.sheetName);
			if(optimize){
				var colsMap = websheet.Utils.getColsVisMap(sheet, range.startCol, range.endCol);
				var rowsMap = websheet.Utils.getRowsVisMap(sheet, range.startRow, range.endRow);
			}
			
			//calculate values for criteria
			var len = this._cfvos.length;
			var tokenNum = this._tokenPos;
			var tmpCells = {};
			for(var i = 0; i < len; i++){
				var val = this._cfvos[i];
				if(!val.isFormula())
					continue;
				var refTokens = baseRange.getRefTokens();
				var end = tokenNum + val.getTokenLength();
				var tokenArray = refTokens ? refTokens.slice(tokenNum, end) : null;
				tokenNum = end;
				
				if(val._type == this.VALUETYPE.ABSFORMULA){
					if(!val._isDirty){
						var v = val.getValue();
						if(!(v instanceof websheet.model.RulesObject.RuleDataCache) || !v.isDirty)//cache data ready, do not need to calculate
							continue;
					}
					val._isDirty = true;
					var tmpId = baseRange._id + "_cell" + i;
					var tmpCell = new websheet.model.RulesObject.DummyFormulaCell(val._tokens, tokenArray, range.sheetName, range.startRow, range.startCol, tmpId, this._doc);
					tmpCell.cfIdx = i;
					tmpCell.rangeId = baseRange._id;
					tmpCells[tmpId] = tmpCell;
				}
				else if(val._type == this.VALUETYPE.RELFORMULA){
					var cacheData = val.getData4Range(baseRange._id);
					var parsedRef = baseRange._parsedRef;
					var sr = parsedRef.startRow;
					var sc = parsedRef.startCol;
					for(var j = range.startRow; j <= range.endRow; j++){
						if(optimize && rowsMap[j])
							continue;
						var rI = j - sr;
						for(var k = range.startCol; k <= range.endCol; k++){
							if(optimize && colsMap[k])
								continue;
							var cI = k - sc;
							if(cacheData && cacheData[rI] && cacheData[rI][cI] != null){
								var v = cacheData[rI][cI];
								if(!(v instanceof websheet.model.RulesObject.RuleDataCache) || !v.isDirty)//cache data ready, do not need to calculate
									continue;
							}
							if (sheet.isCoveredCell(j, k)) {
								continue;
							}
							
							//adjust the size in refToken before using it to generate tmpCells
							for(var token in tokenArray) {
								var refMask = tokenArray[token].getRefMask();
								if((refMask & websheet.Constant.RefAddressType.END_ROW) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_END_ROW) == 0)
									tokenArray[token].getValue()._rowSize += rI;
								if((refMask & websheet.Constant.RefAddressType.ROW) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_ROW) == 0)
									tokenArray[token].getValue()._rowSize -= rI;
								if((refMask & websheet.Constant.RefAddressType.END_COLUMN) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_END_COLUMN) == 0)
									tokenArray[token].getValue()._colSize += cI;
								if((refMask & websheet.Constant.RefAddressType.COLUMN) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_COLUMN) == 0)
									tokenArray[token].getValue()._colSize -= cI;
							}
							
							var tmpTokenArray = val.createTokenArray4Index(range.sheetName, tokenArray, rI, cI);
							var tmpId =  baseRange._id + "_cell" + "i" + "_r" + rI + "_c" + cI;
							if(val._tokens instanceof websheet.parse.tokenList)
								tmpCell = new websheet.model.RulesObject.DummyFormulaCell(val._tokens, tmpTokenArray, range.sheetName, j, k, tmpId, this._doc);
							else
								tmpCell = new websheet.model.RulesObject.DummyFormulaCell(tmpTokenArray[0], tmpTokenArray, range.sheetName, j, k, tmpId, this._doc);
							tmpCell.cfIdx = i;
							tmpCell.rangeId = baseRange._id;
							tmpCell.rIdx = rI;
							tmpCell.cIdx = cI;
							tmpCells[tmpId] = tmpCell;		
							
							//recovery the base tokenArray
							for(var token in tokenArray) {
								var refMask = tokenArray[token].getRefMask();
								if((refMask & websheet.Constant.RefAddressType.END_ROW) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_END_ROW) == 0)
									tokenArray[token].getValue()._rowSize -= rI;
								if((refMask & websheet.Constant.RefAddressType.ROW) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_ROW) == 0)
									tokenArray[token].getValue()._rowSize += rI;
								if((refMask & websheet.Constant.RefAddressType.END_COLUMN) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_END_COLUMN) == 0)
									tokenArray[token].getValue()._colSize -= cI;
								if((refMask & websheet.Constant.RefAddressType.COLUMN) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_COLUMN) == 0)
									tokenArray[token].getValue()._colSize += cI;
							}
							
						}
					}
				}
			}
			if(Object.keys(tmpCells).length > 0){
				calcingData.criterias = tmpCells;
				var callback = dojo.hitch(this,"_cellCalcFinished","criterias", calcingData, CB);
				tm.addTask(pcm, "startWithDummyCells", [tmpCells,callback], tm.Priority.UserOperation);
			}
		}
		
		if(Object.keys(calcingData).length == 0)
			return true;
		
		tm.start();
	},
	
	_cellCalcFinished: function(key, calcingData, callback){
		switch(key){
		case "criterias":
			for(var id in calcingData[key]){
				var tmpCell = calcingData[key][id];
				var cfVos = this._cfvos[tmpCell.cfIdx];
				var v = tmpCell._error ? tmpCell._error : tmpCell.getCalculatedValue();
				var updateTokens = tmpCell.getUpdateRefTokens();
				if(Object.keys(updateTokens).length !=0){
					var cacheCell = new websheet.model.RulesObject.RuleDataCache(v, updateTokens, this._doc, this);
					v = cacheCell;
					tmpCell.clearUpdateRefs(cacheCell);
					if(cfVos._type != this.VALUETYPE.ABSFORMULA)
						cacheCell.rangeId = tmpCell.rangeId;
				}
				if(cfVos._type == this.VALUETYPE.ABSFORMULA){
					cfVos._calculatedValue = v;
					cfVos._isDirty = false;
				}
				else
					cfVos.setValue4Range(v, tmpCell.rangeId, tmpCell.rIdx, tmpCell.cIdx);
			}
			break;
		default:
			break;
		}
		delete calcingData[key];
		if(Object.keys(calcingData).length ==0)
			callback();
	},
	
	dirtyByCacheCell : function(cacheCell)
	{
		var rangeId =  cacheCell.rangeId;
		delete this._absResult;
		if(rangeId){//TODO: only clear the result for single cell but not the range
			delete this._result[rangeId];
			if (this._parentCF) {
				var ranges = this._parentCF.getRanges();
				for (var i=0; i<ranges.length; i++) {
					var range = ranges[i];
					if(range._id == rangeId){
						range.setDirty();
						break;
					}
				}
			}
		}else{//absolute criteria dirty, clear result of all ranges.
			this._result = {};
			if (this._parentCF) {
				var ranges = this._parentCF.getRanges();
				for (var i=0; i<ranges.length; i++) {
					var range = ranges[i];
					range.setDirty();
				}
			}
		}
	},
	
	getTokenList : function(idx)
	{
		if(idx != null)
			this._tokenPos = idx;
		var tokenList = [];
		var len = this._cfvos.length;
		for(var i = 0; i < len ; i ++){
			var val = this._cfvos[i];
			if(val.isFormula())
				tokenList = tokenList.concat(val._tokenArray);
		}
		return tokenList;
	},
	
//	getTokenLength: function()
//	{
//		var len = this._cfvos ? this._cfvos.length : 0;
//		var length = 0;
//		for(var i = 0; i < len ; i ++){
//			var val = this._cfvos[i];
//			length += val.getTokenLength();
//		}
//		return length;
//	},
		
	//tokenIdxs is array[undefined/true,undefined/true...]
	getTokenIdxs: function(ref, tokenArray, tokenIdxs){
		var len = this._cfvos.length;
		var startIdx = this._tokenPos;
		for(var i = 0; i < len; i++){
			var val = this._cfvos[i];
			var length = val.getTokenLength();
			for(var j = startIdx ; j < startIdx + length; j++){
				if(tokenArray[j].getValue() == ref){
					if(!tokenIdxs)
						tokenIdxs = [];
					tokenIdxs[i] = true;
					break;
				}
			}
			startIdx += length;
		}
		return tokenIdxs;
	},
	
	isRangeBasedCriteria: function()
	{
		if (this._type == websheet.Constant.CriteriaType.ABOVEAVERAGE 
				|| this._type == websheet.Constant.CriteriaType.TOP10
				|| this._type == websheet.Constant.CriteriaType.DUPLICATEVALUES
				|| this._type == websheet.Constant.CriteriaType.UNIQUEVALUES
				|| this._type == websheet.Constant.CriteriaType.COLORSCALE
				|| this._type == websheet.Constant.CriteriaType.ICONSET
				|| this._type == websheet.Constant.CriteriaType.DATABAR)
		{
			return true;
		}
		return false;
	},
	
	_clearResult4Ranges: function()
	{
		if (!this._result) return false;
		
		if (this.isRangeBasedCriteria())
		{	
			if (this._parentCF) {
				var ranges = this._parentCF.getRanges();
				for (var i=0; i<ranges.length; i++) {
					var range = ranges[i];
					delete this._result[range._id];
				}
			}
			return true;
		}
		return false;
	},
		
	clearAllData: function(rangeId, dirtyFlag)
	{
		if(!dirtyFlag)
			return;
		var len = dirtyFlag.length;
		var dirty = false;
		for(var i = 0; i < len; i++){
			if(!dirtyFlag[i])
				continue;
			var val = this._cfvos[i];
			val._isDirty = true;
			val.clearData(rangeId);
			dirty = true;
		}
		
		if(dirty && this._result) {
			delete this._result[rangeId];
			this._clearResult4Ranges();
		}
		if(dirty && this._absResult != null) {
			delete this._absResult;
		}
	},
	
	clearData4Cell: function(rangeId, sr, sc, er, ec, dirtyFlag)
	{
		if(!dirtyFlag)
			return;
		var len = dirtyFlag.length;
		var dirty = false;
		for(var i = 0; i < len; i++){
			if(!dirtyFlag[i])
				continue;
			var val = this._cfvos[i];
			val.clareData4Cell(rangeId, sr, sc, er, ec);
			dirty = true;
		}
		if(dirty)
			this.clearResult(rangeId, sr, sc, er, ec);//for color scale, it is range based?
	},
	
	clearResult: function(rangeId, dsr, dsc, der, dec)
	{
		var allClear = this._clearResult4Ranges();
		
		if(!this._result)
			return allClear;
		if(allClear){
			delete this._absResult;
			delete this._result[rangeId];
			return allClear;
		}
		var result = this._result[rangeId];
		if(result){
			for(var i = dsr; i <= der; i ++){
				var r = result[i];
				if(!r)
					continue;
				for(var j = dsc; j <= dec && j < r.length; j++){
					delete r[j];
				}
			}
		}
		return allClear;
	},
	
	clone: function(){
		var ret = new websheet.model.RulesObject.ConditionalCriteria();
		dojo.mixin(ret, this);
		ret._cfvos = [];
		for(var i = 0; i < this._cfvos.length; i++)
			ret._cfvos.push(this._cfvos[i].clone());
		
		delete ret._absResult;
		delete ret._result;
		
		return ret;
	},
	
	getJSON4Range: function(rangeInfo, baseRange)
	{
		var ret = {};
		ret.type = this._type;
		if(this._operator != null)
			ret.operator = this._operator;
		if (this._styleid != null) {
			var styleCode =	this._doc._styleManager.getStyleById(this._styleid);
			ret.style = styleCode.toJSON();
		}
		if (this._dxfId != null)
			ret.dxfId = this._dxfId;
		ret.priority = this._priority;
		if(this._stopIfTrue != null)
			ret.stopIfTrue = this._stopIfTrue;
		if(this._colors != null)
			ret.colors = this._colors;
		
		var cfvos = [];
		ret.cfvos = cfvos;
		switch(this._type){
		case websheet.Constant.CriteriaType.ABOVEAVERAGE:
			if(this._aboveAverage != null){
				var c = {};
				c.type = websheet.Constant.CfvosType.ABOVEAVERAGE;
				c.val = this._aboveAverage;
				cfvos.push(c);
			}
			if(this._equalAverage != null){
				var c = {};
				c.type = websheet.Constant.CfvosType.EQUALAVERAGE;
				c.val = this._equalAverage;
				cfvos.push(c);
			}
			if(this._stdDev != null){
				var c = {};
				c.type = websheet.Constant.CfvosType.STDDEV;
				c.val = this._stdDev;
				cfvos.push(c);
			}
			break;
		case websheet.Constant.CriteriaType.TOP10:
			if(this._bottom != null){
				var c = {};
				c.type = websheet.Constant.CfvosType.BOTTOM;
				c.val = this._bottom;
				cfvos.push(c);
			}
			if(this._percent != null){
				var c = {};
				c.type = websheet.Constant.CfvosType.PERCENT;
				c.val = this._percent;
				cfvos.push(c);
			}
			if(this._rank != null){
				var c = {};
				c.type = websheet.Constant.CfvosType.RANK;
				c.val = this._rank;
				cfvos.push(c);
			}
			break;
		case websheet.Constant.CriteriaType.TIMEPERIOD:
			if(this._timePeriod != null){
				var c = {};
				c.type = websheet.Constant.CfvosType.TIMEPERIOD;
				c.val = this._timePeriod;
				cfvos.push(c);
			}
			break;
		default:
			if(this._text != null){
				var c = {};
				c.type = websheet.Constant.CfvosType.TEXT;
				c.val = this._text;
				cfvos.push(c);
			}
			var len = this._cfvos.length;
			if(len == 0)
				break;
			var refTokens = baseRange.getRefTokens();
			var idx = this._tokenPos;
			for(var i = 0; i < len; i++){
				var v = this._cfvos[i];
				var l = v.getTokenLength();
				var tokenArray = refTokens ? refTokens.slice(idx, idx + l) : null;
				var c = v.getJSON(tokenArray, baseRange, rangeInfo);
				cfvos.push(c);
				idx += l;
			}
			break;
		}
		return ret;
	},
	
	clearAll: function(rangeId)
	{
		var len = this._cfvos.length;
		for(var i = 0; i < len; i++){
			var val = this._cfvos[i];
			val._isDirty = true;
			val.clearData(rangeId);
		}
		if(this._result) {
			delete this._result[rangeId];
			this._clearResult4Ranges();
		}
	}
});