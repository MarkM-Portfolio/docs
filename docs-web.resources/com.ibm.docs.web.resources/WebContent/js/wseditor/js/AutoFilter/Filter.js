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

dojo.provide("websheet.AutoFilter.Filter");
dojo.require("websheet.sort.Sorter");
dojo.require("websheet.AutoFilter.FilterHeader");
dojo.require("concord.util.BidiUtils");
dojo.require("websheet.Constant");
dojo.requireLocalization("websheet.dialog","sortRange");

dojo.declare('websheet.AutoFilter.Filter', websheet.listener.Listener,{
	
	_range: null,
	_keywordsRecord: null,  //array, one column, one item
	_rules: null,
	_filteredInfo: null,    //map, the key is the row index, the value is counter
	_filteredItems: null,	//map, the key is the row index, the value is cached items to be displayed
	_header: null,
	_headerShowValue: null, //map, the key is col index, value is the filter header showValue
	_activeIndex: 0,        //which column filter is activated
	_dirty : false,         //if true, need get data
	_reset: false,          //if true, need reset all filter information
	_expandRow : 0,
	_bNoSupportFilter: false,     //there are 3 kinds of not support filter :1)  the ods range filter. 2) the old column filter  3) for xlsx, such as color, data filter
	  //the old filter been changed in docs, it would be set to false

	_dirtyRowInfo:null,		//its a map, key is rowIndex, value is the updated cell info
							//when change the cell value in the filter area(or cell in expandRow), the corresponding rowIndex stored here
							//the value stored when prepareData
	
	_dataChange: true,    // if the filter range area data changed, such as cell value changed, or insert/delete row, the flag would been set as true
	 					  // the initial value is true cause, for the client side, we do know whether the data is been changed by the last save on server side
	
	_trimSpaceReg: /(^ *)|( *$)/g,
	
	constructor: function(range,editor)
	{
		this.editor = editor;
		this._range = range;
		var rangeInfo = range._getRangeInfo();
		this._expandRow = rangeInfo.endRow;
		
		this._keywordsRecord = [];
		if(range.data)
		{
			delete range.data.originalOOXMLFilter;
			this._rules = websheet.Helper.cloneJSON(range.data);
		}	
		else
			this._rules = {};
		
		if(range.data && range.data.originalOdsFilter == true)
		{
			this._bNoSupportFilter = true;
			this._rules = {};
		}
			
		if(this._range.getType() == websheet.Constant.RangeType.COLUMN)
		{
			this._bNoSupportFilter = true;
			var rangeInfo = this._range._getRangeInfo();
			var newParsedRef = new websheet.parse.ParsedRef(this._range.getSheetName(), 1, this._range.getStartCol(), websheet.Constant.MaxRowNum, this._range.getEndCol(), websheet.Constant.RANGE_MASK);
			var areaMgr = this.editor.getDocumentObj().getAreaManager();
			areaMgr.updateRangeByUsage(newParsedRef, this._range.getId(), this._range.getUsage());
		}
		for(var idx in this._rules)
		{
			var rule = this._rules[idx];
			var keys = rule.keys;
			if(keys)
			{
				//change keyword list from array to map to improve performance
				var keyMap = {};
				for(var i=0;i<keys.length;i++)
				{
					keyMap[keys[i]] = 1;
				}
				rule.keys = keyMap;
			}
			if(rule.color || rule.datetime || rule.top10 || rule.dynamic)
				this._bNoSupportFilter = true;
			if(rule.rules)
			{
				var len = rule.rules.length;
				for(var j = 0; j < len; j++)
				{
					if(rule.rules[j] && "string" == typeof rule.rules[j].v)
						rule.rules[j].v = this._trimSpace(rule.rules[j].v);
				}	
			}	
		}
		this._filteredInfo = {};
		this._filteredItems = {};
		this._reset = true;
		this._headerShowValue = {};
	},
	
	getRange: function()
	{
		return this._range;
	},
	
	getRangeInfo: function()
	{
		return this._range._getRangeInfo();
	},
	
	getRule: function(col)
	{
		return this._rules[col];
	},
	
	/*
	 * get reverse attribute in order to create reverse event in Factory
     */ 
	getRestoreAttrs: function()
	{
		var rangeid = this._range.getId();
		var revAttrs = {usage: websheet.Constant.RangeUsage.FILTER, rangeid: rangeid};
        for(var col in this._rules)
        {
        	var rule = this._rules[col];
        	if(revAttrs.data==null)
        		revAttrs.data = {};
        	if(rule.keys)
        		revAttrs.data[col] = {keys: Object.keys(rule.keys)}; //change keys from map to array
        	else
        		revAttrs.data[col] = rule;
        }
        
		var hiddenRows = this._getHiddenRows();
		var content = null;
		if (!this._bNoSupportFilter && hiddenRows.length > 0)
			content = {rangeid: rangeid, hiddenRows: hiddenRows};
		
		return {attrs: revAttrs, content: content};
	},
	
	/**
	 * when delete the whole filter, get the reverse message here
	 * include the filter rules and the filtered row index
	 * @returns {websheet.event.InsertUnnameRange}
	 */
	getRestoreMsg: function()
	{
		var refValue = this._range.getParsedRef().getAddress({hasSheetName:true});
//		if(this._range.getType() == websheet.Constant.RangeType.COLUMN)
//		{
//			var rangeInfo = this._range._getRangeInfo();
//			refValue = websheet.Helper.getAddressByIndex(rangeInfo.sheetName,1,rangeInfo.startCol,null,websheet.Constant.MaxRowNum,rangeInfo.endCol);
//		}
		var revAttrs = {};
        revAttrs.usage = websheet.Constant.RangeUsage.FILTER;
        revAttrs.rangeid = this._range.getId();
        for(var col in this._rules)
        {
        	var rule = this._rules[col];
        	if(revAttrs.data==null)
        		revAttrs.data = {};
        	if(rule.keys)
        		revAttrs.data[col] = {keys:Object.keys(rule.keys)}; //change keys from map to array
        	else
        		revAttrs.data[col] = rule;
        }
        
		var event = new websheet.event.InsertUnnameRange(refValue, revAttrs);
		if(this._bNoSupportFilter)
			return event;
		
		var hiddenRows = this._getHiddenRows();
		if(hiddenRows.length>0)
		{
			var filterAttr = {};
			filterAttr.rangeid = this._range.getId();
	        filterAttr.usage = websheet.Constant.RangeUsage.FILTER;
			filterAttr.col = 0; 
			filterAttr.h = hiddenRows;
			var subEvent = new websheet.event.Filter(refValue, filterAttr); 
			m = subEvent.getMessage().updates[0];
			event.getMessage().updates.push(m);
		}
		
		return event;
	},
	
	_trimSpace: function(value)
	{
		var ret = value + "";
	    if(value[0]===" " || value[value.length-1]===" ")
        {
            //Ignore all the spaces at the begin and the end of the string
	        ret = value.replace(this._trimSpaceReg,"");
            //"" will be treated as empty string
//            if(ret.length==0)
//                ret = null;
        }
	    return ret;
	},
	
	updateDataChangeFlag: function(state)
	{
		this._dataChange = state;
	},
	
	updateDirtyRowFilterInfo: function()
	{
		if(!this._dirtyRowInfo) return;
		
		var rangeInfo = this._range._getRangeInfo();
		var startCol = rangeInfo.startCol;
		var endCol = rangeInfo.endCol;
		
		for(var rIndex in this._dirtyRowInfo)
		{
			rIndex = parseInt(rIndex);
			delete this._filteredInfo[rIndex];
		}
		
		for(var i=startCol;i<=endCol;i++)
		{
			var rule = this._rules[i];
			if(rule==null)
				continue;
				
			for(var rIndex in this._dirtyRowInfo)
			{
				rIndex = parseInt(rIndex);
				var dirtyRow = this._dirtyRowInfo[rIndex];
				
				var item = dirtyRow[i-startCol];
				if(!item) continue;
				
				if(!this.match(item, rule))
				{
					var cnt = this._filteredInfo[rIndex] || 0;
					this._filteredInfo[rIndex] = cnt + 1;
				}
			}
			
			this.cleanRuleCache(rule);
		}
		
		this._resetDirtyRowInfo();
	},
	/**
	 * if rIndex > expandRow, store this row as dirty row, cause its a new expandRow
	 * else check the rIndex in this._dirtyRowInfo if already exist, if does means is dirty row set in notify method, add the row info
	 * @param rIndex	: 1-based row index
	 * @param colIndex	: 0-based delta relative to start colIndex of the filter
	 * @param cretia	: if rIndex > expandRow, cretia should always exist, else { null means just store the rIndex, not null means store info }
	 */
	_addDirtyRowInfo: function(rIndex,colIndex, cretia)
	{
		var item = null;
		if(rIndex > this._expandRow || !cretia)
		{
			if(!this._dirtyRowInfo)
				this._dirtyRowInfo = {};
			item = this._dirtyRowInfo[rIndex];
			if(!item)
			{
				item = {};
				this._dirtyRowInfo[rIndex] = item;
			}
		}
		else
		{
			if(this._dirtyRowInfo)
				item = this._dirtyRowInfo[rIndex];
		}
		
		if(item && cretia)
		{
			item[colIndex] = {sv:cretia.sv,data:cretia.data,type:cretia.type};
		}
	},
	
	_resetDirtyRowInfo: function()
	{
		this._dirtyRowInfo = null;
	},
	
	prepareData: function()
	{
		this._dirty = false;

		//find all the filtered rows
		var rangeInfo = this._range._getRangeInfo();
		var CellType = websheet.Constant.CellType;
		var sheetName = rangeInfo.sheetName;
		var startCol = rangeInfo.startCol;
		var startRow = rangeInfo.startRow + 1;
		var endCol = rangeInfo.endCol;
		var endRow = rangeInfo.endRow;
		
		var docObj = this.editor.getDocumentObj();
		var sheet = docObj.getSheet(sheetName);
		if(!sheet)
			return;
		
		var styleManager = docObj._styleManager;
	    var styleConst = websheet.Constant.Style;
	    var FORMATTYPE = websheet.Constant.Style.FORMATTYPE;
		
	    var colModelArray = websheet.model.ModelHelper.getCols(rangeInfo, true, true).data;
		var rowModels = sheet.getRows();
		var sRIndex = sheet.getRowPosition(startRow,false);
		if(sRIndex < 0)
			sRIndex = -(sRIndex + 1);
		
		var allKeywords = this._keywordsRecord = []; //each item is a map, and the map contain all the keywords in a column
		for(var i=startCol;i<=endCol;i++)
		{
			allKeywords[i-startCol] = {};
		}
		var index = sRIndex;
		var last = startRow;
		
		var valueRowIdx = {};
		while(index < rowModels.length)
		{
			var row = rowModels[index++];
			var rowRepeat = row.getRepeatedNum();
			var rowIndex = row.getIndex();
			//If repeat number > 0, no value cells
			//Only the value cell will be processed.
			//TODO: if support color filter, the style cell need be considered.
			var isEmptyRow = true;
			var info = {sheetName: sheetName, startRow: rowIndex, endRow: rowIndex, startCol: startCol, endCol: endCol};
			var iter = new websheet.model.RangeIterator(info, websheet.Constant.RangeIterType.NORMAL);
			if(rowRepeat == 0)
			{
				//Get mixed cell here for get cells' show value
				iter.iterate(function(obj, row, col) {
					// ignore covered cell
					if (obj.isCovered)
					{
						endRow = Math.max(endRow, rowIndex);
						return true;
					}
					var cellModel = (obj && obj.cell) || (obj && obj.masterCell && obj.masterCell.cell);
					//Check if the cell has content
					if(cellModel && cellModel._rawValue!=="")
					{
						isEmptyRow = false;
						if(obj.coverInfo) {
							var rowSpan = obj.coverInfo._rowSpan;
							if(rowSpan > 1)
								endRow = Math.max(endRow, rowIndex + rowSpan - 1);
						}
						return false;
					}
					return true;
				});
			}
			//extend the filter range
			if(!isEmptyRow && rowIndex==endRow+1)
				endRow++;
			
			if(!isEmptyRow && rowIndex<=endRow)
			{
				valueRowIdx[rowIndex] = 1;
				var valueCellIdx = {};
				iter = new websheet.model.RangeIterator(info, websheet.Constant.RangeIterType.NORMAL);
				iter.iterate(dojo.hitch(this, function(obj, row, col) {
					var cellModel = (obj && obj.cell) || (obj && obj.masterCell && obj.masterCell.cell);
					if(!cellModel || cellModel._rawValue==="")
						return true;

					var colModel = colModelArray[col-startCol];
					var colStyleId = colModel!=null ? colModel._styleId : null;
					var cellStyleId = obj.styleCell ? obj.styleCell._styleId : colStyleId;
				    var style = cellStyleId ? styleManager.styleMap[cellStyleId] : null;
				    var isCovered = obj.isCovered;
				    
					//record the cell has been processed
					valueCellIdx[col] = 1;
				    	
					var keyMap = allKeywords[col-startCol];
					var sv = null;
					//Ignore the covered cell
					if(isCovered)
						sv = "";
					else
					{
						sv = cellModel.getShowValue(cellStyleId) || "";
						sv = this._trimSpace(sv);
					    if(!cellModel.isParsed || cellModel._isUnCalc || cellModel._isDirty)
					    	this._reset = true;
					}
					
					var keySv = sv.toLowerCase();
					var cretia = keyMap[keySv];
					var bAdd = false;
					if(!keyMap.hasOwnProperty(keySv))
					{
						cretia = keyMap[keySv] = {rowids:[]};
						if(cellModel.isError()) 
						{
							cretia.data = sv;
							cretia.type = "error";
						}
						else if(cellModel.isNumber())
						{
							var isDate = false;
							if(style!=null)
					    	{
					    		var format = websheet.Helper.getFormat(style);
					    		isDate = (format!=null && (format[FORMATTYPE]=="date" || format[FORMATTYPE]=="time" || format[FORMATTYPE]== "dateTime") );
					    	}
							cretia.type = isDate ? "date" : "number";
							cretia.data = cellModel.getCalculatedValue();
						}
						else if(cellModel.isBoolean())
					    {
					    	cretia.type = "boolean";
					    	cretia.data = !!cellModel.getCalculatedValue();
					    }
						else
						{
							cretia.type = "string";
							cretia.data = sv;
							var dir = styleManager.getAttr(style, styleConst.DIRECTION);
							if (!dir)
								dir = BidiUtils.calculateDirForContextual(sv);

							cretia.dir = dir;
						}
						cretia.sv = sv;
					}
					else if (!isCovered)
					{
						if(cellModel.isNumber())
						{
							var cv = cellModel.getCalculatedValue();
							if(cv != cretia.data || cretia.type == "string")
							{
								if(!cretia.others)
									cretia.others = {};
								var others = cretia.others;
								var keyCv = cv + "";
								var item = others[keyCv];
								if(!others.hasOwnProperty(keyCv))
								{
									item = {rowids:[],data:cv, sv:sv};
									var isDate = false;
									if(style!=null)
							    	{
							    		var format = websheet.Helper.getFormat(style);
							    		isDate = (format!=null && (format[FORMATTYPE]=="date" || format[FORMATTYPE]=="time" || format[FORMATTYPE]== "dateTime") );
							    	}
									item.type = isDate ? "date" : "number";
									others[keyCv] = item;
								}	 
								item.rowids.push(rowIndex);
								bAdd = true;
							}	
						}
						else if (cellModel.isString())  // different type need to store as different item
						{ 
							var cv = cellModel.getCalculatedValue();
							if(cv == cretia.data && (cretia.type=="number" || cretia.type=="date") )
							{
								if(!cretia.others)
									cretia.others = {};
								var others = cretia.others;
								var keyCv = (cv + "").toLowerCase();
								var item = others[keyCv];
								if(!others.hasOwnProperty(keyCv))
								{
									item = {rowids:[],data:cv, sv:sv};
									item.type = "string";
									others[keyCv] = item;
								}
								item.rowids.push(rowIndex);
								bAdd = true;
							}
						}
					}
					if(!bAdd)
						cretia.rowids.push(rowIndex);				
					this._addDirtyRowInfo(rowIndex, (col-startCol), cretia);
					
					return true;
				}));
				
				for(var j=startCol;j<=endCol;j++)
				{
					if(valueCellIdx[j])
						continue;
					var keyMap = allKeywords[j-startCol];
					var blank = keyMap[""];
					if(blank==null)
						blank = keyMap[""] = { sv:"", rowids:[], data:"",type:"string"};
					blank.rowids.push(rowIndex);
					this._addDirtyRowInfo(rowIndex, (j-startCol), blank);
				}
			}
			
			if(rowIndex > endRow)
				break;
		}
		
		var maxRow = this.editor.getMaxRow();
		if(endRow > maxRow)
			endRow = maxRow;
		
		for(var j=startRow;j<=endRow;j++)
		{
			if(valueRowIdx[j])
				continue;
			for(var i=startCol;i<=endCol;i++)
			{
				var keyMap = allKeywords[i-startCol];
				var blank = keyMap[""];
				if(blank==null)
					blank = keyMap[""] = {sv:"", rowids:[], data:"",type:"string"};
				blank.rowids.push(j);
			}
		}
		
		this._expandRow = endRow;
		
		//prepare header show value
		this._headerShowValue = {};
		for(var i = startCol; i <= endCol; i++)
		{
			this._headerShowValue[i] = "";
		}	
		var info = {sheetName: sheetName, startRow: rangeInfo.startRow, endRow: rangeInfo.startRow, startCol: startCol, endCol: endCol};
		var iter = new websheet.model.RangeIterator(info, websheet.Constant.RangeIterType.NORMAL);
		iter.iterate(dojo.hitch(this, function(obj, row, col) {
			var cellModel = (obj && obj.cell) || (obj && obj.masterCell && obj.masterCell.cell);
			if(!cellModel || cellModel._rawValue==="")
				return true;
			
			var colModel = colModelArray[col-startCol];
			var colStyleId = colModel!=null ? colModel._styleId : null;
			var styleId = obj.styleCell ? obj.styleCell._styleId : colStyleId;
			var sv = cellModel.getShowValue(styleId) || "";
			this._headerShowValue[col] = sv;
			
			return true;
		}));
	},
	
	/*
	 * For custom filter, it will cache parsed number and regular expression object for given rule's value,
	 * need to remove the cache later by using cleanRuleCache
	 */
	match: function(item,rule)
	{
		if(rule==null)
			return true;
		
		//keyword
		if(rule.keys)
			return rule.keys.hasOwnProperty(item.sv.toLowerCase());
		
		//number filter or text filter
		if(rule.rules)
			return this._matchRule(item, rule);
		
		if(rule.top10)
		{
			if(typeof item.data!="number")
				return false;
			//fv is a number which import from ooxml
			return item.data >= rule.top10.fv;
		}
		
		//TODO: color filter
		
		//TODO: dynamic filter
		
		return true;
	},
	
	cleanRuleCache: function(rule) {
		if (!rule || !rule.rules) return;
		
		for(var i=0, len=rule.rules.length; i<len; i++) {
			var condition = rule.rules[i];
			delete condition.parseResult;
			delete condition.regTest;
		}
	},
	
	/*
	 * For customer filter, given each rule's value, it will cache and use cached parsed number and regular expression object,
	 * the performance will be better when match many items against the same custom rule
	 */
	_matchRule: function(item, rule)
	{
		try
		{
			var result = null;
			for(var i=0,len=rule.rules.length;i<len;i++)
			{
				var condition = rule.rules[i];
				var ret = false;
				var op = condition.op || "==";
	
				if (!condition.parseResult)
					condition.parseResult = websheet.i18n.numberRecognizer.parse(condition.v, true);
				var type = condition.parseResult.isNumber?"number" : "string";
				var fv = condition.parseResult.fValue;
				
				if(typeof item.data == "number")  //number filter
				{
					if(op=="==")
						ret = item.sv == condition.v;
					else 
					{
						//if both number, just compare them
						//else, means one is number, another is string, they are not equal
						if(type=="number")
							ret = eval(item.data + op + fv);
						else if(op=="!=")
							ret = true;
					}
				}
				else  //text filter
				{
					if(type=="string")
					{
						if(op==">" || op==">=" || op=="<" || op=="<=")
						{						
							var value = condition.v.toLowerCase();
							var data = item.data.toLowerCase();
							var c = data.localeCompare(value);
							ret = eval(c + op + 0);
						}
						else
						{
							if (!condition.regTest) {
								var rv = websheet.Helper.wildcardMapping(condition.v.toLowerCase());
								condition.regTest = new RegExp("^" + rv + "$","ig");
							}
							ret = condition.regTest.test(item.data.toLowerCase());
							condition.regTest.lastIndex = 0; // reset the cached lastIndex
							if(op=="!=")
								ret = !ret;
						}
					}
					else if(op=="==" && type=="number") //number can match with text
					{
						if (!condition.regTest) {
							var rv = websheet.Helper.wildcardMapping(condition.v);
							condition.regTest = new RegExp("^" + rv + "$","ig");
						}
						ret = condition.regTest.test(item.data);
						condition.regTest.lastIndex = 0; // reset the cached lastIndex
					}
					else if(op=="!=")
						ret = true;
				}
				
				if(rule.and)
				{
					if(result == null)
						result = ret;
					else
						result = result && ret;
					if(!result)
						return false;
				}
				else
				{
					if(result==null)
						result = ret;
					else
						result = result || ret;
				}
			}
		}
		catch(e)
		{
			return false;
		}
		
		return result;
	},
	
	_concatAllItems: function(item)
	{
		var items = [item];
		if(item.others)
		{
			for(var key in item.others)
			{
				items.push(item.others[key]);
			}	
		}	
		return items;
	},
	
	init: function()
	{
		this._reset = false;
		this._resetDirtyRowInfo();
		this.prepareData();
		
		this._filteredInfo = {};
		if(this._rules==null)
			return;
		
		var rangeInfo = this._range._getRangeInfo();
		var startCol = rangeInfo.startCol;
		var endCol = rangeInfo.endCol;
		
		for(var i=startCol;i<=endCol;i++)
		{
			var rule = this._rules[i];
			if(rule==null)
				continue;
			var keyMap = this._keywordsRecord[i-startCol];
			
			for(var key in keyMap)
			{
				var firstItem = keyMap[key];
				var items = this._concatAllItems(firstItem);

				for(var j = 0; j < items.length; j++)
				{
					var item = items[j];
					if(!this.match(item, rule))
					{
						var rows = item.rowids;
						for(var k=0;k<rows.length;k++)
						{
							var idx = rows[k];
							var cnt = this._filteredInfo[idx] || 0;
							this._filteredInfo[idx] = cnt + 1;
						}
					}
				}	
			}
			
			this.cleanRuleCache(rule);
		}
	},

	showHeader: function(grid)
	{
		if(this._header==null)
		{
			this._header = new websheet.AutoFilter.FilterHeader(this._range, this.editor);
			
			dojo.connect(this._header,"onClick", this, "fillMenu");
			dojo.connect(this._header,"onMouseDown", this, "fillMenu");
		}
		
		this._header.show(grid);
		this.updateHeaderStatus();
	},
	
	getStartDataRowIndex: function(sheetName, hRowIndex, hColIndex)
	{
		var ret = hRowIndex + 1;
		var docObj = this.editor.getDocumentObj();
		var sheet = docObj.getSheet(sheetName);
		var colModels = sheet.getColumns();
		var sCIndex = sheet.getColumnPosition(hColIndex, true);
		if(sCIndex >= 0)
		{
			var col = colModels[sCIndex];
			var coverInfos = col._coverInfos;
			var rIndex = col.getCoverCellPosition(hRowIndex,true);
			if (rIndex >= 0){
				var cInfo = coverInfos[rIndex];
				var rowSpan = cInfo.getRowSpan();
				if (cInfo._parent) {
					var mrIndex = cInfo._parent.getIndex();
					ret = mrIndex + rowSpan;
				}
			}
		}
		return ret;
	},
	
	sort: function(ascending)
	{
		this.editor._calcManager.pauseTasks();
		var rangeInfo = this._range._getRangeInfo();
		var startRowIndex = this.getStartDataRowIndex(rangeInfo.sheetName, rangeInfo.startRow, this._activeIndex);
		var rangeAddress = websheet.Helper.getAddressByIndex(rangeInfo.sheetName, startRowIndex,this._activeIndex,null,this._expandRow,this._activeIndex);
		
		dojo["require"]("concord.concord_sheet_widgets");
	    var rangeSorting = new websheet.sort.RangeSorting(this.editor, rangeAddress);
	    rangeSorting._bLocal = true;

		var sortArgs = {
				withHeader: false, 
				isExtend: true,
				rules : [{
					isAscend: ascending, 
					sortByIdx: 0
				}]
		};
		var sortData = {criterion: sortArgs};
		var callback = dojo.hitch(this, "_confirmSortRange");
		if(!rangeSorting.checkSortRangeConflict(sortData, callback))
		{
			this._confirmSortRange(rangeAddress, sortData);
		}
		this.editor.focus2Grid();
	},
	
	_confirmSortRange: function(rangeAddress, sortData)
	{
	    var nls = dojo.i18n.getLocalization("websheet.dialog","sortRange");
	    var res = this.editor.execCommand(commandOperate.INSTANCESORT, [rangeAddress, sortData]);
	    if(res == null) return;
	    var self = this;
	    dojo.when(res, function(obj) {
	    	if (obj.result != null) {
	    		obj = obj.result;
	    	}
	    	if (obj == -1) {
	    		self.editor.scene.showWarningMessage(nls.STR_SORT_CONFLICT_DEL_SHEET, 5000);
	    	} else if (obj == -3) {
	    		self.editor.scene.showWarningMessage(nls.CAN_NOT_SORT_MERGE_CELLS, 5000);
	    	}
	    });
	},
	
	showMenu: function(col)
	{
		var rangeInfo = this._range._getRangeInfo();
		var btn = this._header._buttons[col-rangeInfo.startCol];
		if(btn)
		{
			btn.openDropDown();
			this.fillMenu(btn);
		}
	},
	
	hideMenu: function()
	{
		var rangeInfo = this._range._getRangeInfo();
		var btn = this._header._buttons[this._activeIndex - rangeInfo.startCol];
		if (btn) {
			btn.closeDropDown(false);
		} else if (this._activeIndex == 0) {
			dojo.forEach(this._header._buttons, function (btn) {
				btn.closeDropDown(false);
			})
		}
	},
	// hide filter menu if the column is deleted
	hideFilterMenu: function(col)
	{
		var rangeInfo = this._range._getRangeInfo();
		var ec = rangeInfo.endCol;
		if (this._header && this._header._buttons) {
			for (var i=col;i<=ec;i++)
			{
				var btn = this._header._buttons[i-rangeInfo.startCol];
				if(btn)
				{
					btn.closeDropDown(false);
				}
			}
		}
	},
	
	fillMenu: function(btn)
	{
		var filterMenu = btn.dropDown;
		filterMenu.customFilter.set('disabled', true);
		filterMenu.clearFilterItem.set('disabled', true);
		//Maybe there are many formulas need be calculated, so use async mode
		if(this._reset || this._dirty)
		{
			var info = this._range._getRangeInfo();
			var controller = this.editor.getController();
	   		if( controller.getPartial(info.sheetName))
	   		{
	   			var method = dojo.hitch(this, "fillMenu", btn);
	   			this.editor.getPartialManager().addNotify(method);
	   			return;
	   		}
	   		//hide the keywordlist before it can be updated
	   		filterMenu.keywordlistWrapper.style.display = 'none';	   		
	   		var func = dojo.hitch(this, "_fillMenu",btn);
			var tm = this.editor.getTaskMan();
			tm.addTask(this.editor.getInstanseOfPCM(), "start", [info,func], tm.Priority.UserOperation);
			tm.start();
		}
		else
			this._fillMenu(btn);
	},
	
	_fillMenu: function(btn)
	{
		var filterMenu = btn.dropDown;
		filterMenu.customFilter.set('disabled', false);
		filterMenu.clearFilterItem.set('disabled', false);
		this._activeIndex = btn.index;
		this._activeStatus = this._prepareStatus(btn.index);
		
		var sheetName = this._range.getSheetName();
		var col = btn.index;
		filterMenu && filterMenu.setStatus(sheetName, col, this._activeStatus,this.hasCustomRule(col),this.hasRule(col));
		
		this.curFilterMenu = filterMenu;
	},

	_prepareStatus: function(colIdx,serverSort)
	{
		if(this._reset)
			this.init();
		else if(this._dirty)
		{
			this.prepareData();
//			this.updateDirtyRowFilterInfo();
		}	
		
		// _filteredItems should be reset whenever there has any change on _keywordsRecord, _rules[colIdx] and _filteredInfo
		if (this._filteredItems[colIdx])
			return this._filteredItems[colIdx];
		
		var rangeInfo = this._range._getRangeInfo();
		var startCol = rangeInfo.startCol;
		
		//the order is: date, number, string, error, blank
		//We need know the number of these items. For it will decide to show which type of filter
		var dateItems = []; 
		var numberItems = [];
		var stringItems = [];
		var boolItems = [];
		var errorItems = [];
		var blankItems = [];
		
		//Not display in filter menu, just used for filter info
		var hiddenItems = [];
		
		var keyMap = this._keywordsRecord[colIdx-startCol];
		var rule = this._rules[colIdx];
		
		for(var sv in keyMap)
		{
			var firstItem = keyMap[sv];
			var items = this._concatAllItems(firstItem);
			for(var index = 0; index < items.length; index++)
			{
				var item = items[index];
				var rows = item.rowids;
				var state = 0;  //0: hide, 1: show, checked, 2: show, unchecked
				
				if(!this.match(item,rule))
				{
					for(var i=0;i<rows.length;i++)
					{
						//If one row filtered cnt > 1, it means the row has been filtered by other column filter
						//If one row filtered cnt is 1, this keyword should be shown and not checked
						var cnt = this._filteredInfo[rows[i]] || 0;
						if(cnt<=1)
						{
							state = 2;
							break;
						}
					}
				}
				else
				{
					for(var i=0;i<rows.length;i++)
					{
						//If one row is not filter, this keyword should be shown and checked
						if(!this._filteredInfo[rows[i]])
						{
							state = 1;
							break;
						}
					}
				}
				
				if(state==0)
				{
					hiddenItems.push(item);
					continue;
				}
				
				item.checked = !this._bNoSupportFilter && state==1;
				if(sv==="")
					blankItems.push(item);
				else if(item.type=="string")
					stringItems.push(item);
				else if(item.type=="number")
					numberItems.push(item);
				else if(item.type=="boolean")
					boolItems.push(item);
				else if(item.type=="error")
					errorItems.push(item);
				else if(item.type=="date")
					dateItems.push(item);
			}
		}
		
		this.cleanRuleCache(rule);
		
		//Error need not sort, all the errors are equal
		if (stringItems.length)
			stringItems = websheet.sort.Sorter._sortStringArray(stringItems,true,serverSort);
		numberItems.sort(function(v1,v2){ return v1.data - v2.data;});
		dateItems.sort(function(v1,v2){ return v1.data - v2.data;});
		boolItems.sort(function(v1,v2){ return v1.data - v2.data;});
		
		var filterKeywords = [];
		var keywordkSet = {};
		for(var i=0;i<dateItems.length;i++)
		{
			if (keywordkSet[dateItems[i].sv]) 
				continue;
			keywordkSet[dateItems[i].sv] = true;
			filterKeywords.push(dateItems[i]);
		}
		
		for(var i=0;i<numberItems.length;i++)
		{
			if (keywordkSet[numberItems[i].sv]) 
				continue;
			keywordkSet[numberItems[i].sv] = true;
			filterKeywords.push(numberItems[i]);
		}
		
		for(var i=0;i<stringItems.length;i++)
		{
			if (keywordkSet.hasOwnProperty(stringItems[i].sv)) 
				continue;
			keywordkSet[stringItems[i].sv] = true;
			filterKeywords.push(stringItems[i]);
		}
		
		for(var i=0;i<boolItems.length;i++)
		{
			if (keywordkSet[boolItems[i].sv]) 
				continue;
			keywordkSet[boolItems[i].sv] = true;
			filterKeywords.push(boolItems[i]);
		}
		
		for(var i=0;i<errorItems.length;i++)
		{
			if (keywordkSet[errorItems[i].sv]) 
				continue;
			keywordkSet[errorItems[i].sv] = true;
			filterKeywords.push(errorItems[i]);
		}
		
		for(var i=0;i<blankItems.length;i++)
		{
			filterKeywords.push(blankItems[i]);
		}
		
		//only need to sort the show items
		return this._filteredItems[colIdx] = {show:filterKeywords,hidden:hiddenItems};
	},
	
	deleteRows: function(sr, er)
	{
		var rangeInfo = this._range._getRangeInfo();
		if(sr<= (this._expandRow  + 1))
			this._reset = true;
		
		if(rangeInfo.endRow >= sr && rangeInfo.endRow <= er)
		{
			var attrs =  {col: 0, rangeid: this._range.getId(), usage:websheet.Constant.RangeUsage.FILTER};
			return new websheet.event.Filter(this._range.getParsedRef().getAddress({hasSheetName:true}), attrs);
		}
		return null;
	},
	
	/**
	 * clear the rules from start column to end column
	 * return the reverse message
	 */
	deleteCols: function(sc, ec)
	{
		var rangeInfo = this._range._getRangeInfo();
		
		var refValue = this._range.getParsedRef().getAddress({hasSheetName:true});
		var reverse = null;
		
		var lEdgeDel = rangeInfo.startCol>=sc && rangeInfo.startCol<=ec;
		var rEdgeDel = rangeInfo.endCol>=sc && rangeInfo.endCol<=ec;
		if(this._rules==null)
		{
			//send messge for restore filter range address
			if(lEdgeDel || rEdgeDel) {
				var attrs = {col: 0, rangeid: this._range.getId(), usage: websheet.Constant.RangeUsage.FILTER};
				reverse = new websheet.event.Filter(refValue, attrs);
			}
			return reverse;
		}
		var bakRules = null, bakFilterInfo = null;
		var newRules = {};
		var cnt = ec - sc + 1;
		this.hideFilterMenu(sc);
		for(var idx in this._rules)
		{
			var col = parseInt(idx);
			var rule = this._rules[idx];
			if(rule==null)
				continue;
			
			if(col<sc) //keep
				newRules[idx] = rule;
			else if(col>ec)  ///move
				newRules[col - cnt] = rule;
			else if(col>=sc && col<=ec)  //delete
			{
				var attrs = {};
				attrs.col = col;
				attrs.rangeid = this._range.getId();
				attrs.usage = websheet.Constant.RangeUsage.FILTER;
				if(rule.keys)
				{
					attrs.type = "key";
					attrs.set = {keys: Object.keys(rule.keys)};
				}
		    	else
		    		attrs.set = rule;
				
				var data = {};
				data.col = col;
				data.clear = 1;
				data.s = []; // when delete the rule, the hidden rows should be shown
				this.updateRule(data, true);
				
				if(data.s && data.s.length>0)
				{
					data.s.sort(function(a,b){return (a-b);});
				}
				attrs.h = data.s;
				
				this.filterRows(data);
				
				var event = new websheet.event.Filter(refValue, attrs);
				if(reverse==null)
					reverse = event;
				else
				{
					var m = event.getMessage().updates[0];
					reverse.getMessage().updates.push(m);
				}
			}
		}
		this._dirty = true;
		this._rules = newRules;
		
		if(reverse==null)
		{
			//send messge for restore filter range address
			if(lEdgeDel || rEdgeDel) {
				var revAttrs = {col: 0, rangeid: this._range.getId(), usage: websheet.Constant.RangeUsage.FILTER};
				reverse = new websheet.event.Filter(refValue, revAttrs);
			}
		}
		return reverse;
	},
	
	apply: function(colIdx, data)
	{
//		if(data == null && !this._dataChange)
//			return;
		
		var ruleChange = true;
		if(data == null)
		{
			data = {};
			ruleChange = false;
		}
		if(this._activeStatus==null)
			this._prepareStatus(colIdx);
		
		var rangeInfo = this._range._getRangeInfo();
		var startCol = rangeInfo.startCol;
		var rule = this._rules[colIdx];
		
		var type = data.type;
		data.col = colIdx;
		data.s = [];
		data.h = [];
		
		var oriRule = null;
		var bNotSupportFilter = this._bNoSupportFilter;
		if(rule!=null)
		{
			if(rule.keys)
				oriRule = {keys:Object.keys(rule.keys)};
			else
				oriRule = websheet.Helper.cloneJSON(rule);
		}
		
		if(this._dataChange)
		{
			var flag = this._reset;
			this.updateRule(data);
			this._reset = ruleChange ? true : flag;
			this.collectShowHideRow(data.s, data.h);
		}
		else
			this.updateRule(data, true);
		
		if(type=="key")
		{
			rule = this._rules[colIdx];
			if(rule!=null)
			{
				var keywords = Object.keys(rule.keys);
				var addLen = data.add ? data.add.length : 0;
				var delLen = data.del ? data.del.length : 0;
				if(addLen + delLen >= keywords.length)
				{
					//If changed items number is bigger than the keywords number, send the keywords to server
					data.set = {keys:keywords};
					delete data.add;
					delete data.del;
				}
				else //or send changed items to server
				{
					if(addLen==0)
						delete data.add;
					if(delLen==0)
						delete data.del;
				}
			}
		}
		
		if(data.h && data.h.length>0)
			data.h.sort(function(a,b){return (a-b);});
		else
			delete data.h;
		
		if(data.s && data.s.length>0)
			data.s.sort(function(a,b){return (a-b);});
		else
			delete data.s;
		
		this._activeStatus = null;
		
		this.filterRows(data);
		
		//send message
		var refValue = this._range.getParsedRef().getAddress({hasSheetName:true});
		if(rangeInfo.endRow < this._expandRow)
		{
			refValue = websheet.Helper.getAddressByIndex(rangeInfo.sheetName, rangeInfo.startRow, rangeInfo.startCol,null,this._expandRow,rangeInfo.endCol);
			
			var areaMgr = this.editor.getDocumentObj().getAreaManager();
			areaMgr.updateRangeByUsage(websheet.Helper.parseRef(refValue), this._range.getId(), this._range.getUsage());
		}
		var attrs = websheet.Helper.cloneJSON(data);
		attrs.rangeid = this._range.getId();
		attrs.usage = websheet.Constant.RangeUsage.FILTER;
		var event = new websheet.event.Filter(refValue, attrs);
		
		var revAttrs = {};
		revAttrs.col = colIdx;
		if(!bNotSupportFilter)
		{
			if(data.add)
				revAttrs.del = data.add;
			if(data.del)
				revAttrs.add = data.del;
			if(data.set || data.clear)
				revAttrs.set = oriRule;
		}	
		else
		{
			revAttrs.clear = 1;
			revAttrs.type = "key";
		}
		if(data.s)
			revAttrs.h = data.s;
		if(data.h)
			revAttrs.s = data.h;
		revAttrs.rangeid = this._range.getId();
		revAttrs.usage = websheet.Constant.RangeUsage.FILTER;
		var reverse = new websheet.event.Reverse(event, refValue, revAttrs);
		
		this.editor.sendMessage(event, reverse);
		this.updateDataChangeFlag(false);
	},
	
	filterRows: function(data)
	{
		var showRows = data.s || [];
		var hideRows = data.h || [];
		
		var rangeInfo = this._range._getRangeInfo();
		var sheetName = rangeInfo.sheetName;
		var controller = this.editor.getController();
		var grid = controller.getGrid(sheetName);
		
		if (showRows.length + hideRows.length==0) {
			return;
		}
		
		controller.filterRows(sheetName,showRows, false);
		controller.filterRows(sheetName,hideRows, true);
		
		/***********broadcast hide row event**************/
		var constant = websheet.Constant;
		var type = constant.EventType.DataChange;
		var source = {};
		source.action = constant.DataChange.FILTER;
		source.refType = constant.OPType.RANGE;
		
		var minRow = -1;
		var maxRow = -1;
		if(showRows.length > 0)
		{
			minRow = showRows[0];
			maxRow = showRows[showRows.length-1];
		}
		if(hideRows.length > 0)
		{
			if(minRow==-1 || hideRows[0] < minRow)
				minRow = hideRows[0];
			if(maxRow==-1 || hideRows[hideRows.length-1] > maxRow)
				maxRow = hideRows[hideRows.length-1];
		}
		
		if(showRows.length + hideRows.length > controller._LOTS_OF_ROWS)
		{
			var ref = new websheet.parse.ParsedRef(sheetName, minRow, -1, maxRow, -1, websheet.Constant.ROWS_MASK);
			source.refValue = [ref];
		}
		else
		{
			var showRefs = this._getRowsParsedRefArray(sheetName, showRows);
			var hideRefs = this._getRowsParsedRefArray(sheetName, hideRows);
			var refs = showRefs.concat(hideRefs);
			if(refs.length == 0)//No notify is needed
				return;
			source.refValue = refs;
		}
		
		var e = new websheet.listener.NotifyEvent(type, source);
		controller.broadcast(e);
		grid.updateRows(minRow - 1, maxRow - 1);
	},
	
	/*array of row parsed ref which merge the adjancent rows*/_getRowsParsedRefArray:function(sheetName, /*array of row index*/rows) {
		var length = rows.length;
		var returnRefs = [];
		var ref;
		for(var i = 0 ; i < length; i++){
			var row = rows[i];
			if(ref && row - 1 == ref.endRow ){
				ref.endRow = row;
			} else {
				ref = new websheet.parse.ParsedRef(sheetName, row, -1, row, -1, websheet.Constant.ROWS_MASK);
				returnRefs.push(ref);
			}
		}
		return returnRefs;
	},
	
	restoreFilteredRows: function(rangeInfo)
	{
		var s = this._getHiddenRows(rangeInfo);
		this.filterRows({s:s});
		this._rules = {};
	},
	
	collectShowHideRow: function(show,hide)
	{
		if(this._reset)
			this.init();
		if(this._dirty)
		{
			this.prepareData();
		}
		this.updateDirtyRowFilterInfo();
		var rangeInfo = this.getRangeInfo();
		var startRow = rangeInfo.startRow;
		var preInfo = websheet.Utils.getShowHideInfo(rangeInfo.sheetName,startRow, this._expandRow);

		var len = preInfo.length;
		for(var i = 0; i < len; i++)
		{
			var rIndex = startRow + i;
			var preShow = !!preInfo[i];
			var latShow = !(this._filteredInfo[rIndex] || 0);
			if(preShow && !latShow)
				hide.push(rIndex);
			else if( !preShow && latShow)
				show.push(rIndex);
		}
	},
	
	/**
	 * change the rules by data, and get the new show&hide rows 
	 * @param data
	 * @param bLocal: true means local action
	 * @param notChangeSH: true means not change s,h array
	 */
	updateRule: function(data, bLocal, notApply,notChangeSH)
	{
		if(this._bNoSupportFilter)
		{
			this.restoreFilteredRows();
			this._bNoSupportFilter = false;
		}
		
		//If this call is not from local, cache data and filter counter info will not be changed
		//Only set a flag
		if(!bLocal)
			this._reset = true;
		else
		{
			if(this._reset)
				this.init();
			if(this._dirty)
			{
				this.prepareData();
				this.updateDirtyRowFilterInfo();
			}
		}
		
		// reset this cached this._filteredItems
		this._filteredItems = {};
		
		var rangeInfo = this._range._getRangeInfo();
		var startCol = rangeInfo.startCol;
		
		var colIdx = data.col;
		var rule = this._rules[colIdx];
		
		var keyMap = this._keywordsRecord[colIdx-startCol];
		if(data.clear || "set" in data)
		{
			var newRule = null;
			if(data.set)
			{
				newRule = {};
				//keyword filter
				if(data.set.keys)
				{
					newRule.keys = {};
					var keys = data.set.keys;
					for(var i=0;i<keys.length;i++)
						newRule.keys[keys[i].toLowerCase()] = 1;
				}
				else
				{
					dojo.mixin(newRule, data.set);
				}
			}
			
			if(newRule)
				this._rules[colIdx] = newRule;
			else
				delete this._rules[colIdx];
			
			//only local filter operation will update filteredInfo.
			//If filter operation come from co-editing, this sheet maybe hasn't been loaded, keywords are not ready.
			//If keywords are not ready, we can't calculate the filteredInfo
			//We only set this._reset = true in this case, when user open this sheet and click the filter button, filteredInfo will be init then.
			if(bLocal)
			{
				if (!notChangeSH)
				{
					// reset data.s and data.h for caclulate later.
					data.s = [];
					data.h = [];
				}
				for(var key in keyMap)
				{
					var firstItem = keyMap[key];
					var items = this._concatAllItems(firstItem);
					for(var index = 0; index < items.length; index++)
					{
						var item = items[index];
						var oldMatch = this.match(item, rule);
						var newMatch = this.match(item, newRule);
						if(oldMatch != newMatch)
						{
							var rows = item.rowids;
							for(var j=0;j<rows.length;j++)
							{
								var idx = rows[j];
								var cnt = this._filteredInfo[idx] || 0;
								if(newMatch)
								{
									if(cnt>1)
									{
										this._filteredInfo[idx] = cnt-1;
									}
									else
									{
										delete this._filteredInfo[idx];
										if( !notChangeSH && data.s != undefined)
											data.s.push(idx);
									}
								}
								else
								{
									!notChangeSH && cnt == 0 && data.h != undefined && data.h.push(idx);
									this._filteredInfo[idx] = cnt + 1;
								}
							}
						}
					}	

				}
				
				this.cleanRuleCache(rule);
				this.cleanRuleCache(newRule);
				
				if(data.h.length>0)
					data.h.sort(function(a,b){return (a-b);});
				else
					delete data.h;
				
				if(data.s.length>0)
					data.s.sort(function(a,b){return (a-b);});
				else
					delete data.s;
			}
		}
		else
		{
			if(data.add && data.add.length>0)
			{
				for(var i=0;i<data.add.length;i++)
				{
					var key = data.add[i].toLowerCase();
					rule.keys[key] = 1;
					
					if(!bLocal)
						continue;
					var firstItem = keyMap[key];
					if(!keyMap.hasOwnProperty(key))
						continue;
					var items = this._concatAllItems(firstItem);
					for(var index = 0; index < items.length; index++)
					{
						var item = items[index];
						var rows = item.rowids;
						for(var j=0;j<rows.length;j++)
						{
							var idx = rows[j];
							var cnt = this._filteredInfo[idx] || 0;
							if(cnt<=1)
							{
								delete this._filteredInfo[idx];
								!notChangeSH && bLocal && cnt==1 && data.s != undefined && data.s.indexOf(idx) == -1 && data.s.push(idx);
							}
							else
								this._filteredInfo[idx] = cnt-1;
						}
					}

				}
			}
			
			if(data.del && data.del.length>0 && rule!=null)
			{
				for(var i=0;i<data.del.length;i++)
				{
					var key = data.del[i].toLowerCase();
					delete rule.keys[key];
					
					if(!bLocal)
						continue;
					var firstItem = keyMap[key];
					if(!keyMap.hasOwnProperty(key))
						continue;
					var items = this._concatAllItems(firstItem);
					for(var index = 0; index < items.length; index++)
					{
						var item = items[index];
						var rows = item.rowids;
						for(var j=0;j<rows.length;j++)
						{
							var idx = rows[j];
							var cnt = this._filteredInfo[idx] || 0;
							if( !notChangeSH && cnt==0 && bLocal && data.h != undefined && data.h.indexOf(idx) == -1)
								data.h.push(idx);
							this._filteredInfo[idx] = cnt+1;
						}
					}
				}
			}
		}
	},
	
	getHeaderShowValue: function()
	{
		if(this._headerShowValue)
			return this._headerShowValue[this._activeIndex];
		return "";
	},
	
	updateHeaderStatus: function()
	{
		var rangeInfo = this._range._getRangeInfo();
		var startCol = rangeInfo.startCol;
		for(var i = startCol; i <= rangeInfo.endCol; i++)
		{
			this._header.updateButtonStatus(i-startCol, this.hasRule(i));
		}	
	},
	
	hasRule: function(colIdx)
	{
		if(colIdx)
			return !!this._rules[colIdx];
		
		return false;
	},
	
	hasCustomRule: function(colIdx)
	{
		if(!this._rules[colIdx])
			return false;
		return !!this._rules[colIdx].rules;
	},
	/**
	 * when delete filter, if current sheet has filter rules, the hidden rows in this range would be show
	 * here need to collect the hidden rows
	 * @returns {Array}
	 */
	_getHiddenRows: function(rangeInfo)
	{
		var s = [];
		if(!rangeInfo)
		{
			rangeInfo = this.getRangeInfo();
			rangeInfo.endRow = this._expandRow;
		}

		var VISATTR = websheet.Constant.ROW_VISIBILITY_ATTR;
		var bRule = this.hasRule();
//		var rowsdata = websheet.model.ModelHelper.getRows(rangeInfo, true, true);
//		var start = rangeInfo.startRow;
//	    if (rowsdata && rowsdata.data)
//	    {
//	    	var rows = rowsdata.data;
//	        for (var i=0,len=rows.length; i<len; i++)
//	        {
//	        	var row = rows[i];
//	            if(row)
//	            {
//	            	var hidden = row._visibility == VISATTR.FILTER;
//	            	if(b)
//	            		hidden = hidden || row._visibility == VISATTR.HIDE;
//	            	if(hidden)
//	            		s.push(i+ start);
//	            }
//	        }
//	    }
		
		var start = rangeInfo.startRow, end = rangeInfo.endRow;
		var doc = this.editor.getDocumentObj();
		var sheet = doc.getSheet(rangeInfo.sheetName);
		var len = sheet._rows.length;
		for(var i = 0; i < len ; i++)
		{
			var row = sheet._rows[i];
			var sIndex = row.getIndex();
			var eIndex = row._repeatedNum ? sIndex + row._repeatedNum : sIndex;

			var hidden = row._visibility == VISATTR.FILTER;
			if(!hidden && bRule && row._visibility == VISATTR.HIDE && sIndex >= start && eIndex <= end)
				hidden = true;
			if(hidden)
			{
				for(var j = sIndex ; j <= eIndex; j++)
					s.push(j);
			}	
		}
		
	    return s;
	},
	
	destroy: function()
	{
		var s = this._getHiddenRows();
		this.filterRows({s:s});
		this._filteredInfo = {};
		this._filteredItems = {};
		//Destroy the fitler header
		this._header && this._header.destroy();
	},
	
	updateResetState: function(state)
	{
		this._reset = state;
	},
	
	_restoreRef:function(area, parsedRef)
	{
		var areaMgr = this.editor.getDocumentObj().getAreaManager();
		areaMgr.endListeningArea(area, this);
		var newArea = areaMgr.startListeningArea(parsedRef,this);
		this.broadcaster = newArea;
	},
	
    notify: function(area, e)
    {
//    	if(this._reset)
//    		return;
    	
		var s = e._source;
		var rangeInfo = this._range._getRangeInfo();
		var parsedRef = websheet.Helper.parseRef(s.refValue);
		if(!parsedRef || !parsedRef.sheetName)
			return;
		
		var doc = this.editor.getDocumentObj();
		if(rangeInfo.sheetName != parsedRef.sheetName)
			return;
		var Constant = websheet.Constant;
		var sr = parsedRef.startRow;
		var er = parsedRef.endRow;
		var sc = parsedRef.startCol;
		var ec = parsedRef.endCol;
		
		//check if expand row is covered by merge cell
		var expandRow = this._expandRow;
		var expRange = websheet.Utils.getExpandRangeInfo({sheetName: rangeInfo.sheetName, startRow: expandRow, endRow: expandRow, startCol: rangeInfo.startCol, endCol: rangeInfo.endCol});
		expandRow = expRange.endRow;
		
		//insert row
		if(s.action == Constant.DataChange.PREINSERT)
		{
			if(s.refType == Constant.OPType.ROW)
			{
				if(sr<=expandRow)
					this._reset = true;
				else if(sr==expandRow+1){
					this._dirty = true;
				}
			}
			else if(s.refType == Constant.OPType.COLUMN)
			{
				this.hideFilterMenu(sc);
				if(sc<=rangeInfo.endCol)
				{
					this._dirty = true;
					if(this._rules!=null)
					{
						var cnt = ec - sc + 1;
						var newRules = {};
						for(var idx in this._rules)
						{
							var col = parseInt(idx);
							if(col>=sc)
								newRules[col + cnt] = this._rules[idx];
							else
								newRules[idx] = this._rules[idx];
						}
						this._rules = newRules;
					}
				}
			}
		}
		//here to detect the preDelete row event, cause some of the delete action would not be listend in autofilterHandler
		else if(s.action == Constant.DataChange.PREDELETE)
		{
			if(s.refType == Constant.OPType.ROW)
			{
				if(sr<= (expandRow  + 1))
					this._reset = true;
			}	
		}	
		else if(s.action == Constant.DataChange.SET || s.action == Constant.DataChange.CLEAR
				|| s.action == Constant.DataChange.MERGE || s.action == Constant.DataChange.PRESPLIT)
		{
			if(s.refType == Constant.OPType.ROW)
			{
//				if(!(sr>rangeInfo.endRow || er<rangeInfo.startRow))
//					this._dirty = true;
//				else if(sr == rangeInfo.startRow+1 && s.action == Constant.DataChange.CLEAR)
//					this._dirty = true;
				if(!(sr>expandRow || er<rangeInfo.startRow))
					this._dirty = true;
			}
			else if(s.refType == Constant.OPType.COLUMN)
			{
				if(!(sc>rangeInfo.endCol || ec<rangeInfo.startCol))
					this._reset = true;
			}
			else if(s.refType == Constant.OPType.CELL || s.refType == Constant.OPType.RANGE)
			{
				var colOver = !(sc>rangeInfo.endCol || ec<rangeInfo.startCol);
				var rowOver = !(sr>expandRow || er<rangeInfo.startRow);
				
				var adjacent = sr == expandRow + 1;
				if(colOver && (rowOver||adjacent))
					this._dirty = true;
			}
			if(this._dirty)
			{
				var sIndex = sr > rangeInfo.startRow ? sr : rangeInfo.startRow;
				var eIndex = er < rangeInfo.endRow ? er : rangeInfo.endRow;
				for(var i = sIndex; i <= eIndex; i++)
				{
					this._addDirtyRowInfo(i);
				}
			}
		}
		else if(s.action == Constant.DataChange.CUT){
			if(this._reset)
				this.init();
			this._dirty = true;
			if(area.cutRef){
				var paresedRef = area.getParsedRef();
			    setTimeout(dojo.hitch(this, "_restoreRef", area, parsedRef));//use timer to restore ref after area transformCutDelta.
			}
		}
		//If the filter menu is show, co-editing user change the sheet data, then the keywords status is dirty
		//Disable the ok button, user can't submit this action
		if(this._dirty || this._reset)
		{
			this.updateDataChangeFlag(true);
			this._filteredItems = {};
			if(this.curFilterMenu && this.curFilterMenu._popupWrapper && this.curFilterMenu._popupWrapper.style.display!="none")
				this.curFilterMenu.okBtn.setDisabled(true);
		}
    }
});