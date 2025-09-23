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

dojo.provide("websheet.parse.Area");
dojo.require("websheet.listener.BroadCaster");
dojo.declare("websheet.parse.Area", websheet.listener.BroadCaster, {

	_parsedRef 	: null,
	_id 		: null,
	usage 		: null,
	_refType	: websheet.Constant.RangeType.INVALID,
	data  		: null, // the json data for unname range
	updateStatus: 0,
	pre			: null,
	next		: null,
	doc			: null, // document model

	constructor: function(/*parsedRef*/range, id, usage) {
		this._list = []; //broadcast list
		var sr = -1;
		var er = -1;
		var sc = -1;
		var ec = -1;
		var sheetName = null, endSheetName = null;
		var refMask = websheet.Constant.RefAddressType.NONE;
		if (range) {
			sheetName = range.sheetName;
			endSheetName = range.endSheetName;
			sr = range.startRow;
			er = range.endRow;
			sc = range.startCol;
			ec = range.endCol;
			refMask = range.refMask;
		}
		this._parsedRef = new websheet.parse.ParsedRef(sheetName, sr,sc,er,ec, refMask, endSheetName);
		this._refType = this._parsedRef.getType();
		
		if (id)
			this._id = id;
		if (usage)
			this.usage = usage;
	},

	getDoc: function() {
		if (!this.doc) 
			this.doc = websheet.model.ModelHelper.getDocumentObj();
		return this.doc;
	},
	
	setId: function(id) {
		this._id = id;
	},
	
	getId: function() {
		return this._id;
	},
	
	/*boolean*/is3DArea: function() {
		return this._parsedRef.is3D();
	},
	
	/*boolean*/isACLSheetArea: function(){
		if(this.usage == websheet.Constant.RangeUsage.ACCESS_PERMISSION && this.data && this.data.bSheet)
			return true;
		return false;
	},
	//used by areaManager
	getParsedRef:function() {
		return this._parsedRef;
	},
	
	setParsedRef:function(ref) {
		this._parsedRef = ref;
		this._refType = this._parsedRef.getType();
	},
	
	// being compatible with old version of implementation in Range.js
	// need to be deprecated later
	_getRangeInfo: function(bMSMaxCol) {
		var info = {
				sheetName:this._parsedRef.sheetName,
				endSheetName: this._parsedRef.endSheetName,
				startRow:this._parsedRef.startRow,
				endRow:this._parsedRef.endRow,
				startCol:this._parsedRef.startCol,
				endCol:this._parsedRef.endCol
			};
		if (bMSMaxCol) {
			if (this.getType() == websheet.Constant.RangeType.ROW)
				info.endCol = websheet.Constant.MaxColumnCount; // 16384 for formula calculation
		}
		return info;
	},
	
	/*string*/getSheetName: function() {
		return this._parsedRef.sheetName;
	},
	
	/*string*/getEndSheetName: function() {
		return this._parsedRef.endSheetName;
	},

	/*int*/getStartRow: function() {
		return this._parsedRef.startRow;
	},

	/*int*/getEndRow: function() {
		return this._parsedRef.endRow;
	},

	/*int*/getStartCol: function() {
		return this._parsedRef.startCol;
	},

	/*int*/getEndCol: function() {
		return this._parsedRef.endCol;
	},

	/*
	 * this function is used to find existing area in page table, if not, one new area will be created
	 * and inserted into one page in page table
	 * @range	the area defined in page table. both range and this object would be 3-D reference
	 */
	/*AreaRelation*/compare: function(/*parsedRef*/range) {
		var AreaRelation = websheet.Constant.AreaRelation;
		if (range != null) {
			{
				//here we do not care about the sheet name, even the sheet name are different
				// it is only used to search area in area page
				// because for 3D reference, Sheet1:Sheet3!A1:B2 and Sheet1:Sheet2!A1:B2
				// will exist in Sheet1 and Sheet2 page
				if (this._parsedRef.startRow < range.startRow)
					return AreaRelation.LESS;
				if (this._parsedRef.startRow > range.startRow)
					return AreaRelation.GREATER;
				if (this._parsedRef.endRow < range.endRow)
					return AreaRelation.LESS;
				if (this._parsedRef.endRow > range.endRow)
					return AreaRelation.GREATER;
				if (this._parsedRef.startCol < range.startCol)
					return AreaRelation.LESS;
				if (this._parsedRef.startCol > range.startCol)
					return AreaRelation.GREATER;
				if (this._parsedRef.endCol < range.endCol)
					return AreaRelation.LESS;
				if (this._parsedRef.endCol > range.endCol)
					return AreaRelation.GREATER;
				if( ( (this._parsedRef.sheetName == range.sheetName && this._parsedRef.endSheetName == range.endSheetName)
								|| (this._parsedRef.sheetName == range.endSheetName && this._parsedRef.endSheetName == range.sheetName) )) 
					return AreaRelation.EQUAL;
				return AreaRelation.EQUAL_NOTSHEETRANGE;
			}
		}
		return AreaRelation.NONE;
	},
	
	/*boolean*/intersectSheet: function(sheetName) {
		var ret = false;
		if (this.is3DArea()) {
			var sheets = this.getDoc().getSheetNameRanges(this.getSheetName(), this.getEndSheetName());
			for (var i = 0; i < sheets.length; i++) {
				var sheet = sheets[i];
				if (sheet == sheetName) {
					ret = true;
					break;
				}
			}
		} else
			ret = this.getSheetName() == sheetName;

		return ret;
	},

	/*
	 * @param range		the operation range, it won't be any 3-D reference 
	 */
	/*boolean*/intersect: function(/*parsedRef*/range) {
		if (this.intersectSheet(range.sheetName)) {
			var bRow = !((this.getEndRow() < range.startRow) || (range.endRow < this.getStartRow()));
			if (!bRow) return false;
			var bCol = !((this.getEndCol() < range.startCol) || (range.endCol < this.getStartCol()));
			return bCol;
		}
		return false;
	},
	
//	/*boolean*/inside: function(/*parsedRef*/range) {
//		return ((this.getSheetName() == range.sheetName)
//				&& (this.getStartRow() >= range.startRow) && (this.getEndRow() <= range.endRow)
//				&& (this.getStartCol() >= range.startCol) && (this.getEndCol() <= range.endCol));
//	},

	/*boolean*/update: function(range, /*int*/rowDelta, /*int*/colDelta, event) {
		if (this.is3DArea()) return false;
		if(this.isACLSheetArea()) return false;
		
		if ( (this._refType == websheet.Constant.RangeType.COLUMN && rowDelta != 0 )
		  || (this._refType == websheet.Constant.RangeType.ROW && colDelta != 0 ) )
			return false;
		
		var sr = this.getStartRow();
		var sc = this.getStartCol();
		var er = this.getEndRow();
		var ec = this.getEndCol();
		var startRow = range.startRow;
		var startCol = range.startCol;
		var endRow = range.endRow;
		var endCol = range.endCol;
		var nsr = sr;
		var nsc = sc;
		var ner = er;
		var nec = ec;
		var sizeChanged = false;
		var edgeChanged = false;
		var positionChanged = false;
		
		if (rowDelta != 0) {
			if(sr == -1 && er == -1)//invalid range
				return false;
			var updateResult = websheet.Helper.updateArea(startRow, sr, er, rowDelta, websheet.Constant.MaxRowNum);
			sizeChanged = updateResult.sizeChanged;
			edgeChanged = updateResult.edgeChanged;
			positionChanged = updateResult.positionChanged;
			nsr = updateResult.newStart;
			ner = updateResult.newEnd;
		}
		if (colDelta != 0) {
			if(sc == -1 && ec == -1)//invalid range
				return false;
			var updateResult = websheet.Helper.updateArea(startCol, sc, ec, colDelta, websheet.Constant.MaxColumnIndex);
			sizeChanged = updateResult.sizeChanged;
			edgeChanged = updateResult.edgeChanged;
			positionChanged = updateResult.positionChanged;
			nsc = updateResult.newStart;
			nec = updateResult.newEnd;
		}
		var data = event._source.data;
		if (!data){
			data = {};
			event._source.data = data;
		}
		if (positionChanged) {
			data.sizeChanged = sizeChanged;
			data.collectUndo = edgeChanged;
			var bRef =  this instanceof websheet.parse.Reference;
			if ((sizeChanged || edgeChanged) && bRef){
				this.setContentDirty(true);
			}
			if (edgeChanged) {
				//only collect unname range and name range, rather than reference
				if (!bRef || ( this instanceof websheet.parse.NameArea) ) {
					var areaManager = this.getDoc().getAreaManager();
					areaManager.delUndoAreas[this._id] = this._toUndoRangeInfo();
				}
			}
			//collect impact cells for delete undo and setd dirty for impact cells
			//broadcast before set rangeInfo so that the delete undo cells can update formula correctly
			this.broadcast(event);
			this._parsedRef.startRow = nsr;
			this._parsedRef.startCol = nsc;
			this._parsedRef.endRow = ner;
			this._parsedRef.endCol = nec;
		} else {
			data.sizeChanged = false;
			data.collectUndo = false;
		}
		
		return positionChanged;
	},
	
	// transform the range with delta change
	// it is used for cut event
	transformCutDelta: function(event) {
		if (this.is3DArea()) return;

		var source = event._source;
		var data = source.data;
		var rowDelta = data.rowDelta;
		var colDelta = data.colDelta;
		var sheetDelta = data.sheetDelta;
		var sr = this.getStartRow();
		var sc = this.getStartCol();
		var er = this.getEndRow();
		var ec = this.getEndCol();
		var nsr = sr, ner = er, nsc = sc, nec = ec;
		if(rowDelta){
			// do not care about the absolute ref mask, will transform delta anyway
			ret = websheet.Helper.addIndentForAddress(sr, er, rowDelta, true, websheet.Constant.RangeType.RANGE, websheet.Constant.RANGE_MASK);
			if(sr != -1)
				nsr = ret.start;
			if(er != -1)
				ner = ret.end;
		}
		if(colDelta){
			// do not care about the absolute ref mask, will transform delta anyway
			ret = websheet.Helper.addIndentForAddress(sc, ec, colDelta, false, websheet.Constant.RangeType.RANGE, websheet.Constant.RANGE_MASK);
			if(sc != -1)
				nsc = ret.start;
			if(ec != -1)
				nec = ret.end;
		}
		var bRef =  this instanceof websheet.parse.Reference;
		if (!bRef || ( this instanceof websheet.parse.NameArea) ) {
			var areaManager = this.getDoc().getAreaManager();
			areaManager.delUndoAreas[this._id] = this._toUndoRangeInfo();
		}
		
		this.broadcast(event);
		
		this._parsedRef.startRow = nsr;
		this._parsedRef.startCol = nsc;
		this._parsedRef.endRow = ner;
		this._parsedRef.endCol = nec;
		if(sheetDelta)
			this._parsedRef.sheetName = sheetDelta;
	},
	
	_toUndoRangeInfo:function() {
		var attrs = {
				range: this,
				rangeid:this._id,
				parsedref:this._parsedRef.copy(),//clone
				usage:this.usage
		};
		if(this.data)
			attrs.data = this.data;
		return attrs;
	},
	

	/*void*/preDeleteSheet: function(event, deleteSheetName) {
		if (!this.is3DArea()) return;
		
		this.setContentDirty(true);
		
		var AreaUpdateInfo = websheet.Constant.AreaUpdateInfo;
		this.updateStatus |= AreaUpdateInfo.UPDATE;
		var data = event._source.data;
		if (!data){
			data = {};
			event._source.data = data;
		}
		data.b3DRef = true;
		var newSheetName = this._parsedRef.sheetName;
		var newEndSheetName = this._parsedRef.endSheetName;
		if (this.getSheetName() == deleteSheetName || this.getEndSheetName() == deleteSheetName) {
			//only collect unname range and name range, rather than reference
			if (!(this instanceof websheet.parse.Reference) || ( this instanceof websheet.parse.NameArea) ) {
				var areaManager = this.getDoc().getAreaManager();
				areaManager.delUndoAreas[this._id] = this._toUndoRangeInfo();
			}
			var sheets = this.getDoc().getSheetNameRanges(this.getSheetName(), this.getEndSheetName());
			if (this.getSheetName() == deleteSheetName) {
				newSheetName = sheets[1];
//				this._parsedRef.setSheetName(newSheetName);
			} else {
				newEndSheetName = sheets[sheets.length-2];
//				this._parsedRef.setEndSheetName(newSheetName);
			}
			if (newSheetName == newEndSheetName) {
				// not 3D reference any more
				// should remove from the ref3DList of areaPage of newSheetName and insert to refList
//				this._parsedRef.setSheetName(newSheetName);
//				this._parsedRef.setEndSheetName(null);
				newEndSheetName = null;
				this.updateStatus |= AreaUpdateInfo.CHANGE;
			}
			data.addressNotChanged = false;
		} else
			data.addressNotChanged = true;
		this.broadcast(event);
		this._parsedRef.setSheetName(newSheetName);
		this._parsedRef.setEndSheetName(newEndSheetName);
		delete data.b3DRef;
		delete data.addressNotChanged;
	},
	
	/*
	 * 	Move sheet action will make 3D reference sheet range change
	 * 
	 *  shrink 3D reference (1.1, toIndex is inside 3D reference)
	 *   |-------|
	 *   |-->    |
	 *   |    <--|
	 *   |-------|
	 *  
	 *  shrink 3D reference (1.2, toIndex is outside 3D reference)
	 *   |-------|
	 *   |-------|-->
	 * <-|-------|
	 *   |-------|
	 *   
	 *  expand 3D reference (2)
	 *   |-------|
	 * <-|       |
	 *   |       |->
	 *   |-------|
	 * 
	 *  move out of 3D reference (3)
	 *   |-------|
	 *   |     --|->
	 * <-|--     |
	 *   |-------|
	 *   
	 *  move inside 3D reference (4)
	 *   |-------|
	 *   |  -->  |
	 *   |  <--  |
	 *   |-------|
	 *   
	 *   The following two case should not be happend in here,
	 *   because now only tranverse the area in the moved sheet
	 *   while the following two case, the move sheet is out of the area
	 *   we need deal with it like insert sheet action
	 *   
	 *  move in 3D reference (5)
	 *   |-------|
	 * --|->     |
	 *   |     <-|--
	 *   |-------|
	 *   
	 *  across 3D reference (6)
	 *   |-------|
	 * --|-------|-->
	 * <-|-------|--
	 *   |-------|
	*/
	/*void*/preMoveSheet: function(event, /*1-based*/fromIndex, /*1-based*/toIndex) {
		if (!this.is3DArea()) return false;
		var AreaUpdateInfo = websheet.Constant.AreaUpdateInfo;
		this.updateStatus |= AreaUpdateInfo.UPDATE;
		
		var data = event._source.data;
		if (!data){
			data = {};
			event._source.data = data;
		}
		data.b3DRef = true;
		data.addressNotChanged = true;
		data.bDirty = true;
		var newSheetName = this.getSheetName();
		var newEndSheetName = this.getEndSheetName();
		
		var opSheets = [];
		var startSheet = this.getDoc().getSheet(this.getSheetName());
		var startIndex = startSheet.getIndex();//1-based
		var endSheet = this.getDoc().getSheet(this.getEndSheetName());
		var endIndex = endSheet.getIndex();//1-based
		var allSheets = this.getDoc()._sheets;
		if(fromIndex == startIndex || fromIndex == endIndex) { // 1 || 2
			if( (fromIndex == startIndex && toIndex > fromIndex)
					|| (fromIndex == endIndex && toIndex < fromIndex) ){ // 1 for shrink
				// remove 3D reference from out sheet
				if( toIndex > startIndex && toIndex < endIndex) { //1.1
					if(fromIndex == startIndex) {
						opSheets = allSheets.slice(startIndex, toIndex);
					} else {
						opSheets = allSheets.slice(toIndex-1, endIndex-1);
					}
				} else { // 1.2 for change the start/end sheet name
					opSheets.push(allSheets[fromIndex - 1]);
					data.addressNotChanged = false;
					//only collect unname range and name range, rather than reference
					if (!(this instanceof websheet.parse.Reference) || ( this instanceof websheet.parse.NameArea) ) {
						var areaManager = this.getDoc().getAreaManager();
						areaManager.delUndoAreas[this._id] = this._toUndoRangeInfo();
					}
					if (fromIndex == startIndex) {
						newSheetName = allSheets[startIndex].getSheetName();
//						this._parsedRef.setSheetName(newSheetName);
					} else {
						newEndSheetName = allSheets[endIndex - 2].getSheetName();
//						this._parseRef.setEndSheetName(newSheetName);
					}
					if (endIndex - startIndex == 1) {
						// not 3D reference any more
						// should remove from the ref3DList of areaPage of newSheetName and insert to refList
//						this._parsedRef.setSheetName(newSheetName);
//						this._parsedRef.setEndSheetName(null);
						this.updateStatus |= AreaUpdateInfo.CHANGE;
						opSheets.push(this.getDoc().getSheet(newSheetName));
					}
				}
				this.updateStatus |= AreaUpdateInfo.REMOVE;
			} else { // 2 for expand
				// insert 3D reference for expand sheet
				if(fromIndex == startIndex){
					opSheets = allSheets.slice(toIndex - 1, startIndex - 1);
				} else
					opSheets = allSheets.slice(endIndex, toIndex);
				this.updateStatus |= AreaUpdateInfo.ADD;
			}
		} else if( fromIndex > startIndex && fromIndex < endIndex) {
			if( endIndex > startIndex && endIndex < endIndex) { // 4 for move inside
				// nothing happens, only the sheet order has changed
				data.bDirty = false;
			} else { // 3 for move out
				opSheets.push(allSheets[fromIndex - 1]);
				this.updateStatus |= AreaUpdateInfo.REMOVE;
			}
		} else  {
			if ( toIndex > startIndex && toIndex < endIndex ) { // 5 for move in
				opSheets = allSheets[fromIndex - 1];
				this.updateStatus |= AreaUpdateInfo.ADD;
			} else { // 6 for accross
				// nothing happens, only the sheet index has changed
				data.bDirty = false;
			}
		}
		if (data.bDirty)
			this.setContentDirty(true);
		this.opSheets = opSheets;
		this.broadcast(event);
		this._parsedRef.setSheetName(newSheetName);
		this._parsedRef.setEndSheetName(newEndSheetName);
		delete data.b3DRef;
		delete data.addressNotChanged;
		delete data.bDirty;
	},
	
	/*
	 * For 3-D area, check whether either its start sheet name or end sheet name should be set
	 * @param sheetName  	new sheet name after rename sheet
	 * @param oldSheetName 	old sheet name
	 */
	/*void*/recoverSheetName: function(sheetName, oldSheetName) {
		if (oldSheetName) {
			if (this.getSheetName() == oldSheetName)
				this._parsedRef.setSheetName(sheetName);
			if (this.getEndSheetName() == oldSheetName)
				this._parsedRef.setEndSheetName(sheetName);
		} else {
			this._parsedRef.setSheetName(sheetName);
			this._parsedRef.setEndSheetName(sheetName);
		}
	},

	/*void*/setInvalidSheetName: function() {
		this._parsedRef.setInvalidSheetName();
	},
	
	/*void*/setUnexistSheetName: function() {
		this._parsedRef.setUnexistSheetName();
	},
	
	/*boolean*/isValid: function() {
		return this._parsedRef.isValid();
	},

	/*boolean*/isSingleCell: function() {
		if (this.is3DArea()) return false;

		var sr = this.getStartRow();
		var sc = this.getStartCol();
		var er = this.getEndRow();
		var ec = this.getEndCol();
		if ((sr != -1) && (er == -1 || sr === er) && (sc != -1) && (ec == -1 || sc === ec))
			return true;
		return false;
	},
	// usage for unnames, names
	setUsage: function(usage) {
		this.usage = usage;
	},

	getUsage: function() {
		return this.usage;
	},
	
	// cell/range/row/column/invalid
	/*type*/getType: function() {
		return this._refType;
	}
});