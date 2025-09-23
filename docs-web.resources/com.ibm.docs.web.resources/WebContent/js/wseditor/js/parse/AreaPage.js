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

dojo.provide("websheet.parse.AreaPage");
dojo.require("websheet.parse.Area");
dojo.require("websheet.parse.NameArea");
dojo.require("websheet.parse.Reference");
dojo.declare("websheet.parse.AreaPage", null, {
	_areaMgr: null,
	areaList : null, // the area list which store all the unname/preserve range in this area page, 
	refList : null,  // the reference list
	ref3DList: null, // the 3D reference list
	invalidList : null, // all the invalid area or refs that they might be restored, such as image, name or chart_data, so they only care about the valid edge changes
	pageIndex : -1, // the page index of this page

	constructor: function(index, areaManager) {
		this.areaList = [];
		this.refList = [];
		this.ref3DList = [];
		this.invalidList = {};
		this._invalidLength = 0;
		this.pageIndex = index;
		this._areaMgr = areaManager;
	},

	/**
	 * add listener to the area, if area does not exist, insert it to page, 
	 * if area is null, then find the area at range position
	 * @param range
	 * @param area if area is given, it must get from the current page, rather than the new one
	 * @return
	 */
	/*Area*/startListeningArea:function(area, /*parsedRef*/range, listener, rangeArea) {
		if(range.isValid()){
			// for unname/preserve range
			if (rangeArea && !( rangeArea instanceof websheet.parse.Reference)) {
				return this.getOrCreateArea(range, this.areaList, true, listener, rangeArea);
			}
			// for reference
			var list = this.refList;
			if(range.is3D()) {
				list = this.ref3DList;
			}
			if (!area) {
				return this.getOrCreateArea(range, list, true, listener, rangeArea);
			} else {
				var pos = this.findArea(range, list, true, rangeArea);
				if (!pos.isFind)
					list.splice(pos.index+1, 0, area);
			}
		} else {
			var id;
			if(rangeArea){
				id = rangeArea.getId();
				area = rangeArea;
			}else if(area)
				id = area.getId();
			else {
				area =  new websheet.parse.Reference(range);
				id = area.getId();
			}
			this._addInvalidRange(id, area);
		}
		return area;
	},

	_addInvalidRange:function(id, area){
		if(!this.invalidList[id]){
			this.invalidList[id] = area;
			this._invalidLength++;
		}
	},
	
	_removeInvalidRange:function(id){
		if(this.invalidList[id]){
			delete this.invalidList[id];
			this._invalidLength--;
		}
	},
	
	getArea: function(/*parsedRef*/range, rangeArea) {
		if(range.isValid()){
			var list = this.refList;
			if (rangeArea && !( rangeArea instanceof websheet.parse.Reference)) {
				list = this.areaList;
			} else if(range.is3D())
				list = this.ref3DList;
			return this.getOrCreateArea(range, list, false, null, rangeArea);
		} else {
			if(rangeArea){
				return this.invalidList[rangeArea.getId()];
			}
			return null;
		}
	},
	
	/* get area in list according to range, if not find and bCreate = true, create a new area
	 * @param areaInfo the range position/size
	 * @param bCreate whether create a new area/reference/namearea
	 * @param hasData : (false)area just has position/size, without data, saved in areaList, else use refList
	*/
	/*area*/getOrCreateArea: function(/*parsedRef*/range, list, bCreate, listener, rangeArea) {
		var area;
		var pos = this.findArea(range, list, true, rangeArea);
		if (list == this.areaList) {
			area = rangeArea;
			if (!pos.isFind) {
				var index = pos.index < 0 ? 0 : pos.index + 1;
				if (bCreate){
					//the listener is added in araemanager.areaHandler
					this.areaList.splice(index, 0, area);
				}else
					return null;
			}
			return area;
		}
		// for reference and name range
		if (pos.isFind)
			return list[pos.index];
		if (bCreate) {
			if (rangeArea)
				area = rangeArea;
			else
				area = new websheet.parse.Reference(range);
			var index = pos.index < 0 ? 0 : pos.index + 1;
			list.splice(index, 0, area);
			area.addListener(listener);
			return area;
		}
		
		return null;
	},

	/*area*/findArea: function(/*parsedRef*/range, list, bMatch, rangeArea) {
		var length = list.length;
		if (length == 0) {
			var pos = {isFind:false, index:-1};
			return pos;
		}
		var low = 0;
		var high = length - 1;
		while (low <= high) {
			var mid = (low + high) >> 1;
			var a = list[mid];
			var rel = a.compare(range);
			switch (rel) {
			case websheet.Constant.AreaRelation.LESS:
				low = mid + 1;
				break;
			case websheet.Constant.AreaRelation.GREATER:
				high = mid - 1;
				break;
			case websheet.Constant.AreaRelation.EQUAL:
			case websheet.Constant.AreaRelation.EQUAL_NOTSHEETRANGE://for 3D reference
				pos = {isFind:true, index:mid};
				// the returned area might not the same with the given area meta
				if (bMatch) {
					if (rangeArea) {
						var i = pos.index;
						while ( i < length ) {
							var area = list[i];
							if (area == rangeArea) {
								pos.index = i;
								return pos;
							}
							relation = area.compare(range);
							if (relation != websheet.Constant.AreaRelation.EQUAL && relation != websheet.Constant.AreaRelation.EQUAL_NOTSHEETRANGE)
								break;
							i++;
						}
						i = pos.index - 1;
						while (i >= 0) {
							var area = list[i];
							if (area == rangeArea) {
								pos.index = i;
								return pos;
							}
							relation = area.compare(range);
							if (relation != websheet.Constant.AreaRelation.EQUAL && relation != websheet.Constant.AreaRelation.EQUAL_NOTSHEETRANGE)
								break;
							i--;
						}
						pos.isFind = false;
					} else {
						//rangeArea is null means it is now finding reference which can be shared
						// name reference should not be shared with normal reference
						// for 3D reference, it must have the same sheet range
						if (a.getUsage() == websheet.Constant.RangeUsage.REFERENCE && (rel == websheet.Constant.AreaRelation.EQUAL)){
							return pos;
						}
						pos.isFind = false;
						var relation;
						var i = pos.index;
						while ( i < length ) {
							var area = list[i];
							relation = area.compare(range);
							if (relation != websheet.Constant.AreaRelation.EQUAL && relation != websheet.Constant.AreaRelation.EQUAL_NOTSHEETRANGE)
								break;
							if (area.getUsage() == websheet.Constant.RangeUsage.REFERENCE && (relation == websheet.Constant.AreaRelation.EQUAL)) {
								pos.isFind = true;
								pos.index = i;
								return pos;
							}
							i++;
						}
						i = pos.index - 1;
						while (i >= 0) {
							var area = list[i];
							relation = area.compare(range);
							if (relation != websheet.Constant.AreaRelation.EQUAL && relation != websheet.Constant.AreaRelation.EQUAL_NOTSHEETRANGE)
								break;
							if (area.getUsage() == websheet.Constant.RangeUsage.REFERENCE && (relation == websheet.Constant.AreaRelation.EQUAL)) {
								pos.isFind = true;
								pos.index = i;
								return pos;
							}
							i--;
						}
					}
				}
				return pos;
			default:
				console.error("can not find area in the different area page");
				return null;
				break;
			}
		}
		return {
			isFind : false,
			index : high
		};
	},
	
	// insert area if such area does not exist, create a new area and insert
	/*void*/insertArea: function(area) {
		if (!area)
			return;
		if(area.isValid()){
			var list = this.refList;
			if (!( area instanceof websheet.parse.Reference))
				list = this.areaList;
			else if(area.is3DArea())
				list = this.ref3DList;
			var pos = this.findArea(area.getParsedRef(), list, true, area);
			if (pos.isFind)
				return;
			list.splice(pos.index+1, 0, area);
		} else {
			this._addInvalidRange(area.getId(), area);
		}
	},

	/**
	 * Remove the listener from area, if no listener in this area, remove this area
	 * @param area if area is given, it must get from the current page, rather than the new one
	 * @param range
	 * @param listener
	 */
	/*Area*/endListeningArea: function(area, /*parsedRef*/range, listener, rangeArea) {
		if(range.isValid()){
			// for unname/preserve range
			if (rangeArea && !( rangeArea instanceof websheet.parse.Reference)) {
				var pos = this.findArea(range, this.areaList, true, rangeArea);
				if (!pos.isFind)
					return null;
				var area = this.areaList[pos.index];
				//the listener is removed in araemanager.areaHandler
				this.areaList.splice(pos.index, 1);
				return area;
			}
			var list = this.refList;
			if(range.is3D())
				list = this.ref3DList;
			var index = -2;
			if (!area) {
				var pos = this.findArea(range, list, true, rangeArea);
				if (!pos.isFind)
					return null;
				index = pos.index;
				area = list[index];
				area.removeListener(listener);
			}
			// must be reference
			// 1) for normal reference, if it has no listener, should remove from areaPage
			// 2) for name reference, if given listener is nil, it means delete name reference
			var bName = (area.getUsage() == websheet.Constant.RangeUsage.NAME);
			if ( (area && !bName && !area.hasListener())
					|| (bName && !listener) ) {
				if (index == -2) { // never find such area
					var pos = this.findArea(range, list, true, rangeArea);
					if (pos.isFind){
						index = pos.index;
					} else
						index = -1;
				}
				if (index > -1)
					list.splice(index, 1);
			}
		} else {
			var id;
			if(rangeArea){
				id = rangeArea.getId();
				area = rangeArea;
			}else if(area)
				id = area.getId();
			if(id)
				this._removeInvalidRange(id, area);
		}
		return area;
	},
	
	/**
	 * Notify the listener of each area in the range
	 * @param range
	 * @param event
	 */
	/*boolean*/areaBroadcast: function(/*parsedRef*/range, event, bCut) {
		if(bCut)
			return this.cutBroadcast(range, event);
		
		var bBroadcast = this._areaBroadcast(range, this.refList, event, bCut);
		bBroadcast |= this._areaBroadcast(range, this.ref3DList, event, bCut);
		
		return bBroadcast;
	},
	
	/*boolean*/_areaBroadcast: function(/*parsedRef*/range, list, event, bCut) {
		var bBroadcast = false;
		var RangeUsage = websheet.Constant.RangeUsage;
		for (var i = 0; i < list.length; i++) {
			var ref = list[i];
			//ref is not in the updateAreas chain
			if (!ref.pre && this._areaMgr.updateAreas != ref && ref.intersect(range)) {
				ref.broadcast(event);
				this._areaMgr.appendToReferenceTrack(ref);
				ref.setContentDirty(true);
				bBroadcast = true;
			} else if((ref.usage == RangeUsage.CONDITION_FORMAT || ref.usage == RangeUsage.SHARED_REFS) && ref.intersect(range))
				ref.broadcast(event);
			else if (ref.getStartRow() > range.endRow)
				break;
		}
		return bBroadcast;
	},
	/**
	 * for the given range, collect the permission areas which has intersection with it
	 */
	broadcastByUsage: function(/*parsedRef*/range,collectAreas)
	{
		var len = this.areaList.length;
		var pUsage = websheet.Constant.RangeUsage.ACCESS_PERMISSION;
		for(var i = 0; i < len; i++)
		{
			var area = this.areaList[i];
			if(area.getUsage() == pUsage && area.data && !area.data.bSheet)
			{
				if(area.intersect(range))
				{
					if(collectAreas.indexOf(area) == -1)
						collectAreas.push(area);
				}
				else
				{
					if(area.isSingleCell())
					{
						var expand = websheet.Utils.getExpandRangeInfo(area.getParsedRef());
						//intersect with the expand info
						if(!(expand.startRow > range.endRow || expand.startCol > range.endCol 
							 || range.startRow > expand.endRow || range.startCol > expand.endCol))
						  collectAreas.push(area);
					}	
				}
			}	
		}	
		return false;
	},
	
	/*boolean*/cutBroadcast: function(/*parsedRef*/range, event) {
		var RangeRelation = websheet.Constant.RangeRelation;
		var bBroadcast = false;
		
		var relation;
		var areaRemoveIndexes = [];
//		// now do not consider comments and filter, what about other areas?
//		for (var i = 0; i < this.areaList.length; i++) {
//			var ref = this.areaList[i];
//			
//			if ((ref.updateStatus & AreaUpdateInfo.REMOVE) > 0) {
//				areaRemoveIndexes.push(i);
//			} else { 
//				if ((ref.updateStatus == AreaUpdateInfo.NONE)
//						&& (relation == websheet.Helper.compareRange(ref.getParsedRef(),range)) 
//						&& (relation == RangeRelation.EQUAL || relation == RangeRelation.SUBSET)) {
//					ref.transformCutDelta(event);
//					ref.updateStatus |= AreaUpdateInfo.REMOVE;
//					areaRemoveIndexes.push(i);
//					this._areaMgr.appendToReferenceTrack(ref);
//					bBroadcast = true;
//				}
//				ref.updateStatus |= AreaUpdateInfo.UPDATE;
//			}
//		}
//		for ( var i = areaRemoveIndexes.length - 1; i >= 0; i--) {
//			var index = areaRemoveIndexes[i];
//			list.splice(index, 1);
//		}
//		areaRemoveIndexes = [];
		var cfList = [];
		var AreaUpdateInfo = websheet.Constant.AreaUpdateInfo;
		for (var i = 0; i < this.refList.length; i++) {
			var ref = this.refList[i];
			if(ref.usage == websheet.Constant.RangeUsage.DATA_VALIDATION)
				continue;
			if(ref.usage == websheet.Constant.RangeUsage.CONDITION_FORMAT) {
				cfList.push(ref);
				continue;
			}
			if ((ref.updateStatus & AreaUpdateInfo.REMOVE) > 0) {
				areaRemoveIndexes.push(i);
			} else {
				if ( (ref.updateStatus == AreaUpdateInfo.NONE)
						&& (relation = websheet.Helper.compareRange(ref.getParsedRef(),range)) 
						&& relation != -1 && relation != RangeRelation.NOINTERSECTION) {
					if(relation == RangeRelation.EQUAL || relation == RangeRelation.SUBSET){
						ref.cutRef = true;
						ref.transformCutDelta(event);
						ref.updateStatus |= AreaUpdateInfo.REMOVE;
						areaRemoveIndexes.push(i);
						delete ref.cutRef;
					}
					else 
						ref.broadcast(event);
					
					ref.setContentDirty(true);
					bBroadcast = true;
				} else if (ref.getStartRow() > range.endRow)
					break;
				this._areaMgr.appendToReferenceTrack(ref);
				ref.updateStatus |= AreaUpdateInfo.UPDATE;
			}
		}
		
		// remove the area that should not be in this page or the mis-order areas after udpate
		var list = this.refList;
		for ( var i = areaRemoveIndexes.length - 1; i >= 0; i--) {
			var index = areaRemoveIndexes[i];
			list.splice(index, 1);
		}
		
		// cut should trigger set event for 3D reference broadcast
		var refValue = event._source.refValue;
		var ns = {
				action: websheet.Constant.DataChange.SET,
				refType:websheet.Constant.OPType.RANGE,
				refValue: range
			};
		var ne = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, ns);
		this._areaBroadcast(range, this.ref3DList, ne);
		// cut should trigger set event for CF reference broadcast
		this._areaBroadcast(range, cfList, ne);
		
		return bBroadcast;
	},

	areaBroadcastAll: function(event) {
		var list = this.refList.concat(this.ref3DList);
		for (var i = 0; i < list.length; i++) {
			var ref = list[i];
			//ref is not in the updateAreas chain
			if (!ref.pre && this._areaMgr.updateAreas != ref ) {
				ref.broadcast(event);
				this._areaMgr.appendToReferenceTrack(ref);
				ref.setContentDirty(true);
			} 
		}
	},

	/*void*/updateAreas: function(/*parsedRef*/range, rowDelta, colDelta, event) {
		this._updateAreas(range, this.areaList, rowDelta, colDelta, event);
		this._updateAreas(range, this.refList, rowDelta, colDelta, event);
		this._updateInvalidAreas(range, rowDelta, colDelta, event);
		// do not need update 3D reference, because insert/delete row/column will not affect 3D reference address
		// but the range3D content might be changed
		var source = event._source;
		var setRangeInfo = {sheetName: range.sheetName, startRow:range.startRow, startCol: range.startCol, endRow: range.endRow, endRow: range.endRow, endCol: range.endCol};
		if (rowDelta < 0)
			setRangeInfo.startRow += rowDelta;
		if(colDelta < 0)
			setRangeInfo.startCol += colDelta;
		var ns = {
				action: websheet.Constant.DataChange.SET,
				refType:websheet.Constant.OPType.RANGE,
				refValue: setRangeInfo
			};
		var ne = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, ns);
		this._areaBroadcast(setRangeInfo, this.ref3DList, ne);
	},
	
	_updateInvalidAreas: function(range, rowDelta, colDelta, event){
		var pageRange = this._areaMgr.getPageRange(range.sheetName, this.pageIndex);
		var AreaUpdateInfo = websheet.Constant.AreaUpdateInfo;
		for(var id in this.invalidList){
			var invalidRange = this.invalidList[id];
			if (invalidRange.updateStatus > 0) {
				var sr = invalidRange.getStartRow();
				var er = invalidRange.getEndRow();
				var sc = invalidRange.getStartCol();
				var ec = invalidRange.getEndCol();
				
				// if the area already in updateChain, it means that the range address has been updated
				if ((invalidRange.updateStatus & AreaUpdateInfo.REMOVE) > 0) {
					this._removeInvalidRange(id);
				} else {
					if (rowDelta != 0) {
						if (rowDelta < 0 ) {
							if ( er < pageRange.startRow)
								this._removeInvalidRange(id);
						} else {
							if (er > pageRange.endRow) {
								// the area have not been set REMOVE but it might need add to other area after insert action
								invalidRange.updateStatus |= AreaUpdateInfo.ADD;
							} else
								// do not need to add because area end in the next pageRange
								invalidRange.updateStatus &= (~AreaUpdateInfo.ADD);
						}
					} else if(colDelta != 0) {
						if (colDelta < 0 ) {
							if ( ec < pageRange.startCol)
								this._removeInvalidRange(id);
						} else {
							if (ec > pageRange.endCol) {
								// the area have not been set REMOVE but it might need add to other area after insert action
								invalidRange.updateStatus |= AreaUpdateInfo.ADD;
							} else
								// do not need to add because area end in the next pageRange
								invalidRange.updateStatus &= (~AreaUpdateInfo.ADD);
						}
					}
				}
			} else {
//				var startRow = invalidRange.getStartRow();
//				var startCol = invalidRange.getStartCol();
//				var endRow = invalidRange.getEndRow();
//				var endCol= invalidRange.getEndCol();
				if (invalidRange.update(range, rowDelta, colDelta, event)) { // if need update, put it to updateChain
					invalidRange.updateStatus |= AreaUpdateInfo.UPDATE;
					var sr = invalidRange.getStartRow();
					var er = invalidRange.getEndRow();
					var sc = invalidRange.getStartCol();
					var ec = invalidRange.getEndCol();
					if(rowDelta != 0) {
						//size changed, the order might be changed, so even it is still in this page, but it need first remove from page then add later
						if ( sr > pageRange.endRow || er < pageRange.startRow) {
							this._removeInvalidRange(id);
							invalidRange.updateStatus |= AreaUpdateInfo.REMOVE;
						}
					} else if(colDelta != 0) {
						if (  sc > pageRange.endCol || ec < pageRange.startCol) {
							this._removeInvalidRange(id);
							invalidRange.updateStatus |= AreaUpdateInfo.REMOVE;
						}
					}
					this._areaMgr.appendToReferenceTrack(invalidRange);
				}
			}
		}
	},
	
	/*void*/_updateAreas: function(range, list, rowDelta, colDelta, event) {
//		var areaList = hasData ? this.refList : this.areaList;
		var pageRange = this._areaMgr.getPageRange(range.sheetName, this.pageIndex);
		var areaRemoveIndexes = [];
		var AreaUpdateInfo = websheet.Constant.AreaUpdateInfo;
		var RangeUsage = websheet.Constant.RangeUsage;
		
		var length = list.length;
		for ( var i = 0; i < length; i++) {
			var a = list[i];
			if (a.updateStatus > 0) {
				// if the area already in updateChain, it means that the range address has been updated
				if ((a.updateStatus & AreaUpdateInfo.REMOVE) > 0) {
//					if ( (rowDelta != 0 && (a.getStartRow() > pageRange.startRow || a.getEndRow() < pageRange.endRow))
//						|| (colDelta != 0 && (a.getStartCol() > pageRange.endCol || a.getEndCol() < pageRange.startCol)) ) {
						areaRemoveIndexes.push(i);
//					}
				} else {
					if (rowDelta != 0) {
						if (rowDelta < 0 ) {
							if ( a.getEndRow() < pageRange.startRow)
								// but not set REMOVE status
								areaRemoveIndexes.push(i);
						} else {
							if (a.getEndRow() > pageRange.endRow) {
								// the area have not been set REMOVE but it might need add to other area after insert action
								a.updateStatus |= AreaUpdateInfo.ADD;
							} else
								// do not need to add because area end in the next pageRange
								a.updateStatus &= (~AreaUpdateInfo.ADD);
						}
					} else if(colDelta != 0) {
						if (colDelta < 0 ) {
							if ( a.getEndCol() < pageRange.startCol)
								// but not set REMOVE status
								areaRemoveIndexes.push(i);
						} else {
							if (a.getEndCol() > pageRange.endCol) {
								// the area have not been set REMOVE but it might need add to other area after insert action
								a.updateStatus |= AreaUpdateInfo.ADD;
							} else
								// do not need to add because area end in the next pageRange
								a.updateStatus &= (~AreaUpdateInfo.ADD);
						}
					}
				}
			} else {
				var startRow = a.getStartRow();
				var startCol = a.getStartCol();
				var endRow = a.getEndRow();
				var endCol= a.getEndCol();
				this._backupSharedFormula(a);
				if (a.update(range, rowDelta, colDelta, event)) { // if need update, put it to updateChain
					a.updateStatus |= AreaUpdateInfo.UPDATE;
					if(a.getUsage() == RangeUsage.SHARED_REFS || a.getUsage() == RangeUsage.SHARED_FORMULAS || a.getUsage() == RangeUsage.DATA_VALIDATION || a.getUsage() == RangeUsage.CONDITION_FORMAT){
						areaRemoveIndexes.push(i);
						a.updateStatus |= AreaUpdateInfo.REMOVE;
						this._areaMgr.appendToSharedRefTrack(a);
					}else{
						if(rowDelta != 0) {
							//size changed, the order might be changed, so even it is still in this page, but it need first remove from page then add later
							if ( (endRow - startRow) != (a.getEndRow() - a.getStartRow()) || a.getStartRow() > pageRange.endRow || a.getEndRow() < pageRange.startRow) {
								areaRemoveIndexes.push(i);
								a.updateStatus |= AreaUpdateInfo.REMOVE;
							}
						} else {
							if ( (endCol - startCol) != (a.getEndCol() - a.getStartCol()) || a.getStartCol() > pageRange.endCol || a.getEndCol() < pageRange.startCol) {
								areaRemoveIndexes.push(i);
								a.updateStatus |= AreaUpdateInfo.REMOVE;
							}
						}
						this._areaMgr.appendToReferenceTrack(a);
					}
				}
			}
			
		}
		// remove the area that should not be in this page or the mis-order areas after udpate
		
		for ( var i = areaRemoveIndexes.length - 1; i >= 0; i--) {
			var index = areaRemoveIndexes[i];
			list.splice(index, 1);
		}
		
	},
	
	_backupSharedFormula:function(area) {
		if(area.usage != "") return;
		
		var RangeUsage = websheet.Constant.RangeUsage;
		for (var i = 0; i < area.list; i++){
			var l = area.list[i];
			if(l.usage == RangeUsage.SHARED_FORMULAS || l.usage == RangeUsage.DATA_VALIDATION || l.usage == RangeUsage.CONDITION_FORMAT){
				this._areaMgr.prepareSharedRef4DeleteUndo(l);
			}
		}
	},
	
	setSheetName:function(newSheetName, event, bRecover, oldSheetName) {
		this._setSheetName(this.areaList, newSheetName, false, event);
		this._setSheetName(this.refList, newSheetName, false, event, bRecover);
		if(!bRecover)
			// rename sheet
			this._setSheetName(this.ref3DList, newSheetName, false, event, bRecover, oldSheetName);
		for( var id in this.invalidList){
			var a = this.invalidList[id];
			a.recoverSheetName(newSheetName);
		}
	},
	
	setInvalidSheetName:function(event, sheetName){
		this._setSheetName(this.areaList, null, true, event);
		this._setSheetName(this.refList, null, true, event, true);
		this.preDeleteSheet(event, sheetName);
		for( var id in this.invalidList){
			var a = this.invalidList[id];
			a.setInvalidSheetName();
		}
	},
	// oldSheetName given only for insert sheet, rather than recover sheet
	_setSheetName:function(list, newSheetName, bInvalidSheetName, event, bSetDirty, oldSheetName){
		for(var i = list.length - 1; i >= 0 ; i--){
			var a = list[i];
			if (!a.pre && this._areaMgr.updateAreas != a ) {
				a.broadcast(event);
				if(bInvalidSheetName){
					a.setInvalidSheetName();
					if(a.usage == websheet.Constant.RangeUsage.COMMENTS)
						list.splice(i, 1);
				}
				else
					a.recoverSheetName(newSheetName, oldSheetName);
				if(bSetDirty)
					a.setContentDirty(true);
				this._areaMgr.appendToReferenceTrack(a);
			}
		}
	},
	
	//delete sheet which is in the 3D referene sheet range
	preDeleteSheet: function(event, sheetName) {
		var AreaUpdateInfo = websheet.Constant.AreaUpdateInfo;
		for (var i = 0; i < this.ref3DList.length; i++) {
			var a = this.ref3DList[i];
			if((a.updateStatus & AreaUpdateInfo.UPDATE) == 0) {
				a.preDeleteSheet(event, sheetName);
				this._areaMgr.appendToReferenceTrack(a);
			}
		}
		// delete all the 3D reference of the deleted page
		this.ref3DList = [];
	},
	
	//change the start/end sheetName if modify sheet(include delete and move sheet operation) which contains 3D reference
	preMoveSheet: function(event, fromIndex, endIndex) {
		var AreaUpdateInfo = websheet.Constant.AreaUpdateInfo;
		var areaRemoveIndexes = [];
		for (var i = 0; i < this.ref3DList.length; i++) {
			var a = this.ref3DList[i];
			if((a.updateStatus & AreaUpdateInfo.UPDATE) == 0) {
				a.preMoveSheet(event, fromIndex, endIndex);
				this._areaMgr.appendToReferenceTrack(a);
			}
		}
	},
	
	// after delete sheet, some 3D reference might change to 2D reference
	modify3DTo2DRef: function(ref3D) {
		if(this.delete3DRef(ref3D))
			this.insertArea(ref3D);
	},
	
	delete3DRef: function(ref3D) {
		for (var i = 0; i < this.ref3DList.length; i++) {
			var a = this.ref3DList[i];
			if(a == ref3D) {
				this.ref3DList.splice(i, 1);
				return true;
			}
		}
		return false;
	},
	
	update3DRefForMove: function(ref3D, sheetName) {
		var AreaUpdateInfo = websheet.Constant.AreaUpdateInfo;
		if((ref3D.updateStatus & AreaUpdateInfo.CHANGE) > 0 && !ref3D.is3DArea()) {
			// change from 3D ref list to refList
			if (sheetName == ref3D.getSheetName())
				this.modify3DTo2DRef(ref3D);
		}
		if((ref3D.updateStatus & AreaUpdateInfo.REMOVE) > 0) {
			// remove from current page
			this.delete3DRef(ref3D);
		} else if((ref3D.updateStatus & AreaUpdateInfo.ADD) > 0) {
			// insert into from current page
			this.insertArea(ref3D);
		}
	},
	
	/*int*/getAreaSize: function(hasData) {
		return this.refList.length + this.ref3DList.length + this.areaList.length + this._invalidLength;
	},
	
////////////////////////////////////////////HEALTH CHECK//////////////////////////////
	consistencyCheck:function(){
		var bConsistency = this.inOrder(this.areaList);
		if (bConsistency)
			bConsistency = this.inOrder(this.refList);
		if (bConsistency)
			bConsistency = this.inOrder(this.ref3DList);
		return bConsistency;
	},
	
	inOrder:function(list) {
		var pageRange;
		var preArea;
		for(var i = 0; i < list.length; i++) {
			var area = list[i];
			if (!pageRange)
				pageRange = this._areaMgr.getPageRange(area.getSheetName(), this.pageIndex);
			if ( !( (list == this.areaList && area instanceof websheet.parse.Area)
					|| (list == this.refList && (area instanceof websheet.parse.Reference || area instanceof websheet.parse.NameArea))
					|| (list == this.ref3DList && area.is3DArea() && (area instanceof websheet.parse.Reference || area instanceof websheet.parse.NameArea)) ))
				return false;
			if (!area.intersect(pageRange) 
					&& !(area.compare(pageRange) == websheet.Constant.AreaRelation.GREATER
							&& (area.getStartRow() > this._areaMgr.maxSheetRows || area.getStartCol() > this._areaMgr.maxSheetCols) ) )
				return false;
			if (preArea){
				var relation = preArea.compare(area.getParsedRef());
				if (relation == websheet.Constant.AreaRelation.GREATER || relation == websheet.Constant.AreaRelation.NONE)
					return false;
			}
			if(list == this.refList || list == this.ref3DList) {
				var type = area.getType();
				if (type == websheet.Constant.RangeType.COLUMN 
						|| type == websheet.Constant.RangeType.ROW) {
					var isEdge = this._areaMgr.isStartEdgePage(this.pageIndex, type == websheet.Constant.RangeType.ROW);
					if(!isEdge)
						return false;
				}
			}
			//check area is stored in the right place
			if (!this._areaMgr.areaConsistencyCheck(area.getParsedRef(), area, true))
				return false;
			preArea = area;
		}
		return true;
	}
});