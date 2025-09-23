dojo.provide("websheet.event.DocumentAgent");

dojo.require("websheet.model.IDManager");

dojo.declare("websheet.event.ModelStructure",websheet.model.IDManager,{
	
	_sheetVisInfo: null, 	// store sheet visibility meta info 
	
	constructor: function(meta)
	{
		this.reset();
		if(meta)
			this.initWithMeta(meta);
	},
	
	reset: function()
	{
		this._IDMap = {};
		this._IDCache = {};
		this._SheetIDArray = [];
		this._SheetsMap = {};
		this._sheetVisInfo = {};

		this._maxRowIndex = 0;
		this._maxColIndex = 0;
		this._maxSheetIndex = 0;
	},
	
	initWithMeta: function(sheetsMeta)
	{
		var cnt = sheetsMeta.length;
		for(var i = 0; i < cnt; i++)
		{
			var meta = sheetsMeta[i];
			var sheetId = this.insertSheetAtIndex(i, null, meta.sheetName);
			this._sheetVisInfo[sheetId] = meta.visibility;
		}	
	}
});

websheet.event.DocumentAgent = {
		
	bMobile 	: false,
	bTans		: true,
	_modelStructure  : null, //
	
	setBase: function(editor) {
		this.editor = editor;
	},
	
	getSheetMeta:function()
	{
		var meta = [];
		if(this.bMobile)
		{
			//TODO: get from object-c modle
		}	
		else
		{
			var doc = this.editor.getDocumentObj();
			var sheets = doc.getSheets();
			var cnt = sheets.length;
			for(var i = 0; i < cnt; i++)
			{
				var sheet = sheets[i];
				var info = {};
				info.sheetName = sheet.getSheetName();
				info.visibility = sheet.isSheetVisible();
				meta.push(info);
			}	
		}	
		return meta;
	},
	
	getConnector: function()
	{
		if(this.bMobile)
		{
			return this.editor.scene.connector;
		}	
		else
		{
			return this.editor.getConnector();
		}
	},
	
	rollbackAddedTask: function(rangeid)
	{
		if(this.bMobile)
		{
			//TODO:roll back added task in mobile
		}	
		else
		{
			var taskHdl = this.editor.getTaskHdl();
			if (taskHdl) taskHdl.rollbackAddedTask(rangeid);
		}
	},
	
	
	unRestoreRange: function(rangeId,delta,startIndex,endIndex,type)
	{
		if(this.bMobile)
		{
			//TODO: roll back in mobile.
		}	
		else
		{
			this.editor.getDocumentObj().unRestoreRange(rangeId,delta,startIndex,endIndex,type);
		}
	},
	
	getFilterHeaderRow: function(sheetName)
	{
		if(this.bMobile)
		{
			//TODO: get from object-c modle
		}	
		else
		{
			var filter = this.editor.getAutoFilterHdl().getFilter(sheetName);
			if(filter!=null)
			{
				var filterHeaderRow = filter.getRangeInfo().startRow;
				return filterHeaderRow;
			}
		}
		return null;
	},
	
	getFilterRange: function(sheetName)
	{
		if(this.bMobile)
		{
			//TODO: get from object-c modle
		}	
		else
		{
			var filter = this.editor.getAutoFilterHdl().getFilter(sheetName);
			if(filter!=null)
				return filter.getRangeInfo();
		}
		return null;
	},
	
	isFilterInSheet: function(sheetName)
	{
		if(this.bMobile)
		{
		
		}
		else
		{
			return this.editor.getAutoFilterHdl().getFilter(sheetName) != null;
		}
	},
	
	getFreezePos: function(sheetName, type)
	{
		if(this.bMobile)
		{
		
		}
		else
		{
			 var sheet = this.editor.getDocumentObj().getSheet(sheetName);
			 if(sheet)
				 return sheet.getFreezePos(type);
		}
		return null;
	},
	
	getMsgTransformer: function()
	{
		if(this.bMobile)
		{
		
		}
		else
		{
			return this.editor.getUndoManager().getMsgTransformer();
		}
	},
	
	removeUndoActionById: function(msgId)
	{
		if(this.bMobile)
		{
		
		}
		else
		{
			var undoManager = this.editor.getUndoManager();
			undoManager.removeActionById(msgId);
		}
	},
	
	deleteRange: function(rangeId)
	{
		if(this.bMobile)
		{
		
		}
		else
		{
			var controller = this.editor.getController();
			controller.deleteRange(rangeId);
		}
	},
	
	getSheetIndex: function(sheetName)
	{
		if(this.bMobile)
		{
		
		}
		else
		{
			var Sheet= this.editor.getDocumentObj().getSheet(sheetName);
			if(Sheet)
				return Sheet.getIndex();
		}
		return null;
	},
	
	getStyleById: function(styleId)
	{
		if(this.bMobile)
		{
			//TODO: get from object-c modle
		}	
		else
		{
			var styleManager = this.editor.getDocumentObj()._getStyleManager();
			if(styleManager)
				return styleManager.getStyleById(styleId);
		}
	},
	
	getModelStructure: function()
	{
		var sheetMeta = this.getSheetMeta();
		this._modelStructure = new websheet.event.ModelStructure(sheetMeta);
		var doc = this.editor.getDocumentObj();
		this._modelStructure.setMaxRow(doc.maxSheetRows);
		return this._modelStructure;
	},
	/**
	 * 
	 * @param bTans : true means current the DocumentAgent is used for OT transform
	 */
	setTransFlag: function(bTans)
	{
		this.bTrans = bTans;
	},

	/**
	 * 
	 * @param sheetName
	 * @param bSheetId
	 * @param checkWithModel : {boolean}, true means using sheetId in sheet model to detect whether sheet existed( when insert sheet, check whether it in the model)
	 * @returns
	 */
	isSheetExist: function(sheetName, bSheetId, checkWithModel)
	{
		//here if it's for OT, just return true, cause if the other user rename the sheet, 
		//for the given sheetName could not detect whether it exists
		if(this.bTrans && !bSheetId) return true;
		
		if(this.bMobile)
		{
			if(checkWithModel)
			{
				//TODO: here to call the native code
			}	
			else
			{
				//using idManager to detect in mobile mode
				var rst = bSheetId ? this._modelStructure.getSheetNameById(sheetName): this._modelStructure.getSheetIdBySheetName(sheetName);
				return rst ? true : false;
			}	
		}	
		else
		{
			var docObj = websheet.functions.Object.getDocument();
			return docObj.isSheetExist(sheetName, bSheetId);
		}	
	},
	
	//Only used by sheetDocSceneMobile	
	getCurrentSheetName: function()
	{
		if(this.bMobile)
		{
			//TODO:
		
		}	
	},

	//Only used by sheetDocSceneMobile		
	processMessage: function(message)
	{
		if(this.bMobile)
		{
			//TODO:
			this.editor.scene.connector.processMessage(message);
		}	
	},
	
	/**
	 * detect whether the column of colIndex has merged cell
	 * @param sheetName
	 * @param colIndex
	 */
	hasMergeCellForCol: function(sheetName, colIndex)
	{
		var bMergeCell = false;
		if(this.bMobile)
		{
			
		}	
		else
		{
			var doc = this.editor.getDocumentObj();
			var sheet = doc.getSheet(sheetName);
			var rows = sheet.getRows();
			var cnt = rows.length;
			var coverType = websheet.Constant.CellType.COVERINFO;
			for(var i = 0; i < cnt; i++)
			{
				var row = rows[i];
				var mCell = row.getCell(colIndex, coverType, true);
				if(mCell && mCell.getCol() + mCell._colSpan - 1> colIndex)
				{
					bMergeCell = true; break;
				}	
			}	
		}	
		return bMergeCell;
	},

	hasSharedFormulaRef: function(ref) {
		var doc = this.editor.getDocumentObj();
		var areaMgr = doc.getAreaManager();
		var sharedRefs = areaMgr.splitUndoSharedRefs;
		if (Object.keys(sharedRefs).length === 0) {
			return false;
		}
		var ranges = areaMgr.getRangesByUsage(websheet.Constant.RangeUsage.CONDITION_FORMAT, ref.sheetName);
		var len = ranges.length;
		for (var id in sharedRefs) {
			for (var i = 0; i < len; i++) {
				var range = ranges[i];
				if (id.indexOf(range._id) >= 0) {
					return true;
				} else if (range._id.indexOf(id) < 0) {
					continue;
				}
				var result = websheet.Helper.compareRange(range._parsedRef, ref);
				if (result != -1 && result != websheet.Constant.RangeRelation.NOINTERSECTION){
					return true;
				}
			}

		}
		return false;
	}
};
