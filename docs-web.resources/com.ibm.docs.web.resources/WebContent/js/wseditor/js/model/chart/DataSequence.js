/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.model.chart.DataSequence");
dojo.require("concord.chart.data.DataSequence");
dojo.require("websheet.model.ModelHelper");

dojo.declare("websheet.model.chart.DataSequence", [concord.chart.data.DataSequence],{
	_refList: null,//there maybe null in _refList to take up position 
	_document: null,
	_isValid: true,
	_isDataReady: false,
	_addrs: null,
	
	constructor: function(dataProvider,doc)
	{
		this._properties = {};
		this._refList = [];
		this._dataProvider = dataProvider;
		this._document = doc;
		this._isDirty = true;
	},
	
	getData: function()
	{
		if(!this._refList || !this._refList.length)
			return this.inherited(arguments);
		
		if(this._isDataReady)
			this._isDirty = false;
		else if(this._isDirty){
			this._isValid = true;
			this._buildDataCache();
			this._isDirty = false;
		}
		if(!this._isValid){//#REF will return empty array.			
			if(this.getProperty("role") == "label")
				return[websheet.Constant.ERRORCODE[524].message];
			else
				return [];
		}
		if(this.getProperty("role") == "yVal"){
			if(this._dataArray.length == 0)
				this._parent.hide = true;
			else
				this._parent.hide = false;
		}
		return this._dataArray;
	},
	
	setDirty: function(dirty)
	{
		this._isDirty = dirty;
		if(dirty)
		   this._isDataReady = false;
	},
	
	//If prepare data failed, return false
	prepareData: function()
	{
		try
		{
			var dirty = this._isDirty;
			this.getData();
			this._isDirty = dirty;
			this._isDataReady = true;
		}
		catch(e)
		{
			if(e==websheet.Constant.ERRORCODE["2001"])
			{
				return false;
			}
		}
		return true;
	},
	
	getAddress: function(beMSFmt,separator, bDlg)
	{
		if(bDlg && this._addrs){
			if(this.getProperty("role") == "cat" && this._addrs.length > 1)
				return "#MULT";
			for(var i=0;i<this._refList.length;i++){
				var ref = this._refList[i];				
				if(ref && ref.isValid()){
					var rangeInfo = ref._getRangeInfo();
					var type = ref.getType();
					var rowCnt = (type == websheet.Constant.RangeType.COLUMN) ? this._document.maxSheetRows : (rangeInfo.endRow - rangeInfo.startRow + 1);
					var colCnt = rangeInfo.endCol - rangeInfo.startCol + 1;
					if(rowCnt > 1 && colCnt > 1)
						return "#MULT";
				}			
			}
		}
		if(!separator)
			separator = ",";
		var addrs = this.getAddrsList(beMSFmt, bDlg);
		var addr = addrs.join(separator);
		if(addrs.length > 1)
			addr = "(" + addr + ")";
		return addr;
	},
	
	getAddrsList: function(beMSFmt, bDlg)
	{
		var addrs = [];
		for(var i=0;i<this._refList.length;i++)
		{
			if(this._refList[i]){
				if(this._refList[i].getUsage() == websheet.Constant.RangeUsage.NAME){
					if(bDlg){
						var editor = websheet.model.ModelHelper.getEditor();
						var title = editor.scene.getDocBean().getTitle();
						if(websheet.Helper.needSingleQuotePattern.test(title)){
							title = title.replace(/\'/g,"''");	// change '' if the sheet name has '
							title = "'" + title + "'";
						}
						var v = title + (beMSFmt ? "!" : ".") + this._addrs[i];
						addrs.push(v);
					}
					else
						addrs.push(this._addrs[i]);
				}
				else {
					addrs.push(this._refList[i].getParsedRef().getAddress({hasSheetName:true}));
				}
			}
			else
				addrs.push(this._addrs[i]);
		}
		return addrs;
	},
	
	generateLabel: function()
	{
	},
	
	_buildDataCache: function()
	{
		this._dataArray = [];
		
		if(this._refList.length==0)
			return;
		
		var role = this.getProperty("role");
		var bRow = this._dataProvider._dataSource=="row";
		var reSetFmt = true;
		this._numFmt = null;
		var rowLen, colLen;
		for(var i=0;i<this._refList.length;i++)
		{
			var ref = this._refList[i];
			if(!ref){
				this._isValid = false;
				break;
			}
			var firDimArray, secDimArray;
			var colArray, rowArray;
			
			var rangeInfo = ref._getRangeInfo();
			if(!ref.isValid()){
				this._isValid = false;
				return;
			}
			var type = ref.getType();
			var rowCnt = (type == websheet.Constant.RangeType.COLUMN) ? this._document.maxSheetRows : (rangeInfo.endRow - rangeInfo.startRow + 1);
			var colCnt = rangeInfo.endCol - rangeInfo.startCol + 1;
			
			if(role != "cat"){
				if(rangeInfo.startCol != rangeInfo.endCol && rangeInfo.startRow != rangeInfo.endRow)
				{
					this._dataArray = [];
					return;
				}
				bRow = rangeInfo.startCol == rangeInfo.endCol ? false : true;
				
				if(role!="label" && this._dataProvider._dataSource==null)
					this._dataProvider._dataSource = bRow ? "row" : "column";
			}else{
				if(rowLen === undefined){
					rowLen = rowCnt;
					colLen = colCnt;
				}else if(rowCnt != rowLen || colCnt != colLen)
				{
					this._dataArray = [];
					return;
				}
			}
			
			var colModelArray = websheet.model.ModelHelper.getCols(rangeInfo, true, true).data;
			if(role != "label"){
				var tmpColC = colCnt;
				var tmpRowC = rowCnt;
				colArray = new Array(colCnt);
				for(var j = 0; j< tmpColC; j++){
					colArray[j] = colModelArray[j] ? colModelArray[j].isVisible() : true;
					if(!colArray[j])
						colCnt --;
				}
				
				rowArray = websheet.model.ModelHelper.getRows(rangeInfo, true, true);
				rowArray = rowArray.data;
				for(var j = 0; j< tmpRowC; j++){
					rowArray[j] = rowArray[j] ? rowArray[j].isVisible() && !rowArray[j].isFiltered() : true;
					if(!rowArray[j])
						rowCnt --;
				}
			}
			
			if(reSetFmt && role != "cat" && role != "label"){
				if(rowCnt != 0 && colCnt !=0){
					this._setFormat(ref,colModelArray);
					reSetFmt = false;
				}
			}
			
			var dataArray = null;
			var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.NORMAL, !bRow);
			if(bRow){
				if(rowArray){
					firDimArray = rowArray;
					secDimArray = colArray;
				}
			}
			else{
				if(colArray){
					firDimArray = colArray;
					secDimArray = rowArray;
				}
			}			
			
			//category use multiple dim array
			if(role=="cat")
			{
				var idx = 0;
				var isRangeRef = (ref.getStartCol() != ref.getEndCol()) && (ref.getStartRow() != ref.getEndRow());
				var current = -1;
				iter.iterate(dojo.hitch(this, function(obj, row, col) {
					var i, j;
					if (bRow) {
						i = col - rangeInfo.startCol, j = row - rangeInfo.startRow;
					} else {
						j = col - rangeInfo.startCol, i = row - rangeInfo.startRow;
					}
					
					if(!firDimArray[j])
						return true;

					if (current == -1) current = bRow ? row : col;
					if (current != (bRow ? row : col)) { 
						idx ++;
						current = bRow ? row : col;
					}

					if(!secDimArray[i])
						return true;
					
					var cell = obj && obj.cell;
					var styleCell = obj && obj.styleCell;
					var v = "";
					if(cell!=null)
					{
						if(!cell.isParsed || cell._isUnCalc || cell._isDirty)
							throw websheet.Constant.ERRORCODE["2001"];
						var axis = this._parent;
						if(!axis.sourceLinked && axis.format!=null)
							v = cell.getCalculatedValue();
						else
						{
							var	colSid = colModelArray[i] ? colModelArray[i]._styleId : null;
							v = cell.getShowValue(styleCell ? styleCell._styleId : colSid);
						}
					}
					
					if(this._dataArray[idx]==null && isRangeRef)
						this._dataArray[idx] = [];

					if(isRangeRef)
						this._dataArray[idx].push(v);
					else
						this._dataArray.push(v);
					
					return true;
				}));
			}
			else  //the values data sequence always use 1 dim array
			{
				if(firDimArray && !firDimArray[0])
					continue;
				var current = -1;
				iter.iterate(dojo.hitch(this, function(obj, row, col) {
					var j = bRow ? col - rangeInfo.startCol : row - rangeInfo.startRow;
					if(secDimArray && !secDimArray[j])
						return true;
				
					if (current == -1) current = bRow ? row : col;
					if (current != (bRow ? row : col))
						return false;

					var cell = obj && obj.cell;
					var styleCell = obj && obj.styleCell;
					var v = null;
					if(cell!=null)
					{
						if(!cell.isParsed || cell._isUnCalc || cell._isDirty)
							throw websheet.Constant.ERRORCODE["2001"];
						if(role == "label"){
							var	colSid = colModelArray[j] ? colModelArray[j]._styleId : null;
							v = cell.getShowValue(styleCell ? styleCell._styleId : colSid);
						}else{							
							if(cell._error!=null && cell._error != websheet.Constant.ERRORCODE["7"])
								v = 0;
							else
								v = cell.getCalculatedValue();
							if(v === "" && cell._rawValue === "")
								v = null;
						}
					}
					this._dataArray.push(v);
					
					return true;
				}));
			}
		}
	},
	
	putRef: function(ref,index)
	{
		if(index != null){
			var oldRef = this._refList[index];
			if(oldRef){
				this._document.getAreaManager().endListeningArea(oldRef, this);
			}
			this._refList[index] = ref;
		}
		else
			this._refList.push(ref);
	},
	
	setReference: function(addr){
		var len = this._refList.length;
		var areaMgr = this._document.getAreaManager();
		for(var i = 0; i< len; i++){
			var oldRef = this._refList[i];
			if(oldRef){
				areaMgr.endListeningArea(oldRef, this);
			}
		}
		this._refList.length = 0;
		this._addrs = websheet.Helper.getRanges(addr);
		for(var i = 0 ; i < this._addrs.length; i++){
			var addr = this._addrs[i];
			var parsedRef = websheet.Helper.parseRef(addr);
			if(parsedRef){
				if(parsedRef.isValid()){
					var	reference = areaMgr.startListeningArea(parsedRef,this);
					this.putRef(reference);
				}
				else
					this.putRef(null);
			}else{
				var	ref = areaMgr.getRangeByUsage(addr,websheet.Constant.RangeUsage.NAME);
				if(ref){
					this.putRef(ref);
					ref.addListener(this);
				}else{
					this.putRef(null);
				}
			}
		}
	},
	
	/*void*/disableName:function(range)
	{
		var rangeId = range.getId().toLowerCase();
		for(var i = 0; i < this._addrs.length; i++){
			if(this._addrs[i].toLowerCase() == rangeId && this._refList[i]){
				this.putRef(null,i);
				return;
			}
		}
	},
	
	//return if there is at least one name enabled.
	/*void*/enableName:function(range)
	{
		var rangeId = range.getId().toLowerCase();
		for(var i = 0; i < this._addrs.length; i++){
			if(this._refList[i] == null){
				if(this._addrs[i].toLowerCase() == rangeId){
					this.putRef(range, i);
					break;
				}
			} 
		}
	},
	
	destroy: function()
	{
		var areaMgr = this._document.getAreaManager();
		for(var j=0;j<this._refList.length;j++)
		{
			var ref = this._refList[j];
			if(ref){
				areaMgr.endListeningArea(ref, this);
			}
		}
	},
	
	_setFormat: function(ref,colModelArray)
	{
		this._numFmt = websheet.Helper.getTokenFormat(ref);
	},
	
	getDataPointNumber: function()
	{
		if(!this._refList || !this._refList.length)
			return this._dataArray.length;
		
		var cnt = 0;
		for(var i=0;i<this._refList.length;i++)
		{
			var ref = this._refList[i];
			if(ref && ref.isValid())
			{
				var rangeInfo = ref._getRangeInfo();
				var type = ref.getType();
				var rowCnt = (type == websheet.Constant.RangeType.COLUMN) ? this._document.maxSheetRows : (rangeInfo.endRow - rangeInfo.startRow + 1);
				var colCnt = rangeInfo.endCol - rangeInfo.startCol + 1;
				cnt += rowCnt*colCnt;
			}
		}
		return cnt;
	},
	
	///////////////////////////////////////////////////////////
	/////////// THE LISTENER OF REFERENCE /////////////////////
	///////////////////////////////////////////////////////////
	/*void*/notify: function(area, event){
		var constant = websheet.Constant;
		if(event._type == constant.EventType.DataChange) {
			var source = event._source;
			var action = source.action;
			var refType = source.refType;
			var refValue = source.refValue;
			var bDirty = false;
			if (refType == constant.OPType.AREA) {
				bDirty = true;
			    var area = refValue;
			    if (action == constant.DataChange.INSERT){
			    	this.enableName(area);
			    } else if (action == constant.DataChange.DELETE){
			    	this.disableName(area);
			    }
			} else if (refType == constant.OPType.SHEET) {
				if(action == constant.DataChange.PREDELETE || websheet.Constant.DataChange.INSERT) {
					bDirty = true;
					if(action == constant.DataChange.PREDELETE){
						var attrs = {};
						attrs.rangeid = area.getId();
						attrs.address = area.getParsedRef().getAddress();
						this._document.getAreaManager()._addChartSequenceRef4DeleteUndo(attrs, this);
					}
				}
			} else if ((action == constant.DataChange.PREINSERT || action == constant.DataChange.PREDELETE)) {
				if (refType == constant.OPType.ROW || refType == constant.OPType.COLUMN) {
					var data = source.data;
					if(data){
						if(data.sizeChanged)
							bDirty = true;
						if(data.collectUndo){
							var attrs = area._toUndoRangeInfo();
							this._document.getAreaManager()._addChartSequenceRef4DeleteUndo(attrs, this);
						}
					}
				}
			} else if (action == constant.DataChange.SET || action == constant.DataChange.FILTER
					|| action == constant.DataChange.SHOW || action == constant.DataChange.HIDE) {
				bDirty = true;
			} else if(action == constant.DataChange.CUT){
				bDirty = true;
				if(area.cutRef){
					var attrs = area._toUndoRangeInfo();
					var areaMgr = this._document.getAreaManager();
					areaMgr._addChartSequenceRef4DeleteUndo(attrs, this);
				}
			}
	    }
		
		if (bDirty && !this._isDirty) {
			this.setDirty(true);
			// update chart for co-editting (bad way)
			// FIXME should have better way to update chart
			var chartId = this.getChartId();		
	        var chartRange = this._document.getAreaManager().getRangeByUsage(chartId, constant.RangeUsage.CHART);
	        if(chartRange){
		        if(!event._data)
					event._data = {};
				if(!event._data.rows) {
					event._data.rows = [];
					event._data.rowsId = {};
				}
				if(!event._data.chartGrids){
					event._data.chartGrids = {}; 
				}
				// push row into array e._data.rows for grid
				var rowIndex = chartRange.getStartRow();
				var sheetName = chartRange.getSheetName();
				var sheet = this._document.getSheet(sheetName);
				var rowId = this._document._getIDManager().getRowIdByIndex(sheet.getId(), rowIndex);
				event._data.chartGrids[sheetName] = true;
				if(!event._data.rowsId[rowId])
				{
		       		var row = [sheetName, ".", rowIndex].join("");
		        	event._data.rows.push(row);
		        	event._data.rowsId[rowId] = true;
				}
			}
		}
	}
});