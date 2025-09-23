/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.model.chart.DataProvider");
dojo.require("concord.chart.data.DataProvider");
dojo.require("websheet.model.ModelHelper");
dojo.require("websheet.Helper");
dojo.require("websheet.model.chart.DataSequence");

dojo.declare("websheet.model.chart.DataProvider", [concord.chart.data.DataProvider],{
	document: null,

	refType: websheet.Constant.RefType.CAREFILTER | websheet.Constant.RefType.CARESHOWHIDE,
	
	constructor: function(doc)
	{
		this._dataSource = null;
		this.document = doc;
	},
	
	/**
	 * 
	 * @param args
	 * @param dataInterpreter
	 * @returns {Array}  List<{role:xx, addr:xxx}>
	 */
	
	createDataSource: function(args,dataInterpreter)
	{
		var rangeAddr = args.rangeAddr;
		
		var parseRef = websheet.Helper.parseRef(rangeAddr);
		var rangeInfo = {};
		rangeInfo.sheetName = parseRef.sheetName;
		rangeInfo.startCol = parseRef.startCol;
		rangeInfo.startRow = parseRef.startRow;
		rangeInfo.endCol = parseRef.endCol;
		rangeInfo.endRow = parseRef.endRow;
		
		var dataArray = this._getValues(rangeInfo,"row");
		
		var rowNum = rangeInfo.endRow - rangeInfo.startRow + 1;
		var colNum = rangeInfo.endCol - rangeInfo.startCol + 1;
		
		var res = dataInterpreter.interpreteDataSource(dataArray,args.dataSource);
		var dataSource = res.dataSource;
		this._dataSource = dataSource;
		
		var bRow = dataSource=="row";
		
		var seqNum = bRow ? rowNum: colNum;
		var dataPoints = bRow ? colNum: rowNum;
		
		//no data point
		if(res.labelNumber==dataPoints)
			return null;
		
		var dataSeqArray = [];
		var categoryAddr = null;
		var doc = this.document;
		
		if(res.categoryNumber>0)
		{
			var catSRow = bRow ? parseRef.startRow : parseRef.startRow + res.labelNumber;
			var catERow = bRow ? catSRow + res.categoryNumber-1 : rangeInfo.endRow;
			var catSCol = bRow ? rangeInfo.startCol + res.labelNumber : rangeInfo.startCol;
			var catECol = bRow ? rangeInfo.endCol : rangeInfo.startCol + res.categoryNumber-1;
			
			var params = {};
			var bCell = (catSRow == catERow && catSCol == catECol);
			if(bCell)
				params.refMask = websheet.Constant.CELL_MASK;
			categoryAddr = websheet.Helper.getAddressByIndex(parseRef.sheetName,catSRow,catSCol,null,catERow,catECol, params);
			
			dataSeqArray.push({role:"cat",addr:categoryAddr});
		}
		
		for(var i=res.categoryNumber;i<seqNum;i++)
		{
			if(res.labelNumber>0)
			{
				var labelAddr = null;
				if(bRow)
				{
					var labelSCol = rangeInfo.startCol;
					var labelECol = rangeInfo.startCol+res.labelNumber-1;
					var params = {};
					var bCell = (labelSCol == labelECol);
					if(bCell)
						params.refMask = websheet.Constant.CELL_MASK;
					labelAddr = websheet.Helper.getAddressByIndex(parseRef.sheetName,parseRef.startRow + i,	labelSCol,null,parseRef.startRow + i,labelECol, params);
				}
				else
				{
					var labelSRow = rangeInfo.startRow;
					var labelERow = rangeInfo.startRow + res.labelNumber-1;
					var params = {};
					var bCell = (labelSRow == labelERow);
					if(bCell)
						params.refMask = websheet.Constant.CELL_MASK;
					labelAddr = websheet.Helper.getAddressByIndex(parseRef.sheetName,labelSRow,rangeInfo.startCol+i,null,labelERow,rangeInfo.startCol+i, params);
				}
				
				dataSeqArray.push({role:"label",addr:labelAddr});
			}
			var seriesAddr = null;
			if(bRow)
			{
				var params = {};
				var bCell = (rangeInfo.startCol+res.labelNumber == rangeInfo.endCol);
				if(bCell)
					params.refMask = websheet.Constant.CELL_MASK;
			   seriesAddr = websheet.Helper.getAddressByIndex(parseRef.sheetName,parseRef.startRow + i,rangeInfo.startCol+res.labelNumber,null,parseRef.startRow + i,rangeInfo.endCol, params);
			}
			else
			{
				var params = {};
				var bCell = (rangeInfo.startRow+res.labelNumber == rangeInfo.endRow);
				if(bCell)
					params.refMask = websheet.Constant.CELL_MASK;
			   seriesAddr = websheet.Helper.getAddressByIndex(parseRef.sheetName,rangeInfo.startRow+res.labelNumber,rangeInfo.startCol+i,null,rangeInfo.endRow,rangeInfo.startCol+i, params);
			}
			
			dataSeqArray.push({role:"values",addr:seriesAddr});
		}
		return dataSeqArray;
	},
	
	/*DataSequence*/createDataSequence: function(params)
	{
		var dataSeq = new websheet.model.chart.DataSequence(this,this.document);
		
		var role;
		if(params)
			role = params.role;			
		dataSeq.setProperty("role", role);
		
		var address = params.ref;
		//address[0]=='[' means the reference is a external link. Don't create reference for it
		if(address && address[0]!='['){
			dataSeq.setReference(address);
		}
		//If there is not ref ss can parsed, use cache data
		if(!dataSeq._refList || !dataSeq._refList.length){
			if(params && params.pts)
				dataSeq.setData(params.pts);
		}
		
		if(params && params.exRef)
			dataSeq.setExRef(params.exRef);		
		return dataSeq;
	},
	
	_getValues: function(rangeInfo, dataSource)
	{
		var rowNum = rangeInfo.endRow - rangeInfo.startRow + 1;
		var colNum = rangeInfo.endCol - rangeInfo.startCol + 1;
		
		if(typeof rowNum!="number" || typeof colNum!="number")
			return [];
		
		var seqNum = dataSource=="row" ? rowNum: colNum;
		var dataPoints = dataSource=="row" ? colNum: rowNum;
		
		var values = [];
		var ignorDateTime = rowNum>1 && colNum>1; //multiple rows or columns, date/time is special
		var iter = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.NORMAL);
		var styleManager = this.document._getStyleManager();
		iter.iterate(dojo.hitch(this, function(obj, row, col) {
			var cell = obj && obj.cell;
			if (!cell || cell.isNull())
				return true;
			
			var styleId = obj && obj.styleCell ? obj.styleCell._styleId : null;
			var cv = null;
			if(cell._error==null)
			{
				var format = null;
				if(ignorDateTime)
				{
					var style = styleId ? styleManager.styleMap[styleId] : null;
					format = websheet.Helper.getFormat(style);
				}
				//treat date/time as string
				var FORMATTYPE = websheet.Constant.Style.FORMATTYPE;
				if(format!=null && (format[FORMATTYPE]=="date" || format[FORMATTYPE]=="time"))
				{
					//If the right bottom of the range is date/time, the date/time will not be treated as string
					if(row==rowNum-1 && col==colNum-1)
					{
						ignorDateTime = false;
						cv = cell.getCalculatedValue();
					}
					else
						cv = cell.getShowValue(); // FIXME
				}
				else
					cv = cell.getCalculatedValue();
			}
			else
				cv = 0;
			
			var idx = row - rangeInfo.startRow;
			if (!values[idx])
				values[idx] = [];
			var data = values[idx];
			data[col - rangeInfo.startCol] = cv;
			
			return true;
		}));
		//at least has one item
		if(values.length==0)
			values.push([]);
		
		var dataArray = new Array(seqNum);
		for(var i=0;i<seqNum;i++)
		{
			var data = new Array(dataPoints);
			for(var j=0;j<dataPoints;j++)
			{
				var dp = null;
				if(dataSource=="row")
					dp = values[i]!=null ? values[i][j] : null;
				else if(dataSource=="column")
					dp = values[j]!=null ? values[j][i] : null;
					
				data[j] = dp;
			}
			dataArray[i] = data;
		}
		
		return dataArray;
	},
	
	
	address4Dlg : function(address)
	{
		var addrs = websheet.Helper.getRanges(address);
		var editor = websheet.model.ModelHelper.getEditor();
		var title = editor.scene.getDocBean().getTitle();
		if(websheet.Helper.needSingleQuotePattern.test(title)){
			title = title.replace(/\'/g,"''");	// change '' if the sheet name has '
			title = "'" + title + "'";
		}
		var locale = editor.scene.getLocale();
		var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
		var separator = bundle["decimal"]=="," ? ";" : ",";
		for(var i = 0;i < addrs.length; i++)
		{
			var addr = addrs[i];
			var parsedRef = websheet.Helper.parseRef(addr);
			if(parsedRef && parsedRef.isValid())
				addrs[i] = parsedRef.getAddress();
			else 
				addrs[i] = title + "!" + addrs[i];
		}
		var addr = addrs.join(separator);
		if(addrs.length > 1)
			addr = "(" + addr + ")";
		return addr;
	},
	
	//If str is a multi- dimension range , return false;
	isMultiDim: function(str)
	{
		if(!str)
			return false;
		var res = this._parseStr2Ref(str);
		if(!res)
			return false;
		var bSingleRow = false;
		var bSingleCol = false;
		if(res.type=="name")
		{
			var areaManager = this.document.getAreaManager();
			var ref = areaManager.getRangeByUsage(res.ref,websheet.Constant.RangeUsage.NAME);
			if(!ref || !ref.isValid())
				return false;
			bSingleRow = ref.getStartRow() == ref.getEndRow();
			bSingleCol = ref.getStartCol() == ref.getEndCol();
			if(!bSingleRow && !bSingleCol)
				return true;
			return false;			
		}
		else if(res.type=="range")
		{
			var sheet = this.document.getSheet(res.sheetName);
			if(!sheet)
				return false;
			
			bSingleCol = res.startCol == res.endCol;
			bSingleRow = res.startRow == res.endRow;
			if(!bSingleRow && !bSingleCol)
				return true;
			return false;
		}
		return false;
	},
	
	parseRef: function(str)
	{
		var areaManager = this.document.getAreaManager();
		var helper = websheet.Helper;
		
		//split the input string
		var editor = websheet.model.ModelHelper.getEditor();
		var locale = editor.scene.getLocale();
		var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
		var separator = bundle["decimal"]=="," ? ";" : ",";
		var addrs = helper.getRanges(str,separator);
		
		var newAddrs = [];
		var sheetName = null;
		
		var containAddr = false;
		var containNoneAddr = false;
		
		var parsedRes = [];
		for(var i=0;i<addrs.length;i++)
		{
			var addr = dojo.trim(addrs[i]);
			var options = {type:"decimal", locale: locale};
	   		var fValue = dojo.number.parse( addr, options);
			if(!isNaN(fValue))
			{
				if(containAddr)
					throw "ERR5";  //The range must exist
				throw "ERR10";     //Not reference address
			}
			if(addr[0]=='"' || addr[addr.length-1]=='"')
			{
				if(containAddr)
					throw "ERR5";  //The range must exist
				throw "ERR10";     //Not reference address
			}
			
			var res = this._parseStr2Ref(addr);
			if(res==null) 
			{
				if(containAddr)
					throw "ERR5";  //The range must exist
				containNoneAddr = true;
			}
			else
			{
				if(containNoneAddr)
					throw "ERR5";  //The range must exist
				containAddr = true;
			}
			parsedRes.push(res);
		}
		if(containNoneAddr)
			throw "ERR10";     //Not reference address
		
		//check all the references
		for(var i=0;i<parsedRes.length;i++)
		{
			var res = parsedRes[i];
			
			var bSingleRow = false;
			var bSingleCol = false;
			
			if(res.type=="name")
			{
				var sheet = this.document.getSheet(res.sheetName);
				if(!sheet){
					var title = editor.scene.getDocBean().getTitle();
					if(res.sheetName != title)
						throw "ERR5"; //The range must exist
				}
				var ref = areaManager.getRangeByUsage(res.ref,websheet.Constant.RangeUsage.NAME);
				
				if(!ref || !ref.isValid())
					throw "ERR5";  //The range must exist
				
				if(sheetName==null)
					sheetName = ref.getSheetName();
				else if(sheetName!=ref.getSheetName())
					throw "ERR6";  //All the ranges must be in one sheet
				
				bSingleRow = ref.getStartRow() == ref.getEndRow();
				bSingleCol = ref.getStartCol() == ref.getEndCol();
				if(!bSingleRow && !bSingleCol)
					throw "ERR7";  //All the ranges must be single row or column
				
				newAddrs.push(ref.getId());				
			}
			else if(res.type=="range")
			{
				var sheet = this.document.getSheet(res.sheetName);
				if(!sheet)
					throw "ERR5"; //The range must exist
				
				if(sheetName==null)
					sheetName = res.sheetName;
				else if(sheetName!=res.sheetName)
					throw "ERR6";  //The ranges must be in one sheet
				
				bSingleCol = res.startCol == res.endCol;
				bSingleRow = res.startRow == res.endRow;
				if(!bSingleRow && !bSingleCol)
					throw "ERR7";  //All the ranges must be single row or column
				
				newAddrs.push(res.ref);
			}
		}

		var ret = newAddrs.join(",");
		if(newAddrs.length>1)
			ret = "(" + ret + ")";
		return ret;
	},
	
	_parseStr2Ref: function(addr)
	{
		var helper = websheet.Helper;
		var addr = dojo.trim(addr);
		var parseRef = helper.parseRef(addr);
		var ret = null;
	    if(parseRef && parseRef.sheetName){
	    	if(parseRef.isValid())
	    		return ret = { type: "range",
	    			sheetName: parseRef.sheetName, 
	    			startRow: parseRef.startRow, 
	    			endRow: parseRef.endRow,
	    			startCol: parseRef.startCol,
	    			endCol: parseRef.endCol,
	    			ref: parseRef.toString()
	    		 };
	    	else
	    		return null;
	    }
	    
	    var prasedName = helper.parseName(addr, true);
	    if(prasedName){
	    	ret = {
	    			type : "name",
	    			sheetName: prasedName.sheet, 
	    			ref: prasedName.name
	    		};
	    	return ret;
	    }
	    return null;
	}
});