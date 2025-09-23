/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2015. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.ACL.ViewHandler");

dojo.declare("websheet.ACL.ViewHandler", null, {
	
	_aclHandler: null,
	
	_highlightProvider: null,
	
	//in map structure : {sheetId: { rangeId: range}}
	_highlightRanges: null,
	
	_editColor: "#8cd211",
	_readColor: "#ff5050",
	
	_subHandlers: null,
	
	constructor: function(handler)
	{
		this._aclHandler = handler;
		this._highlightProvider = this._aclHandler.editor.getController().getHighlightProvider();
		this._highlightRanges = {};
		this._subHandlers = [];
		this._subHandlers.push(dojo.subscribe("PermissionPaneOpen",dojo.hitch(this,this.drawPermissions)));
		this._subHandlers.push(dojo.subscribe("PermissionPaneClose",dojo.hitch(this,this.removeAllHighlightRanges)));
	},
	
	drawPermissions: function()
	{
		this.removeAllHighlightRanges();
		var curSheetName = this._aclHandler._getCurrrentSheetName();
		var sheetId = this._aclHandler._doc.getSheetId(curSheetName);
		this._drawPermissions(sheetId);
	},
	
	removeHighlightRange: function(sheetId, rangeId)
	{
		var ranges = this._highlightRanges[sheetId];
		if(ranges)
		{
			var range = ranges[rangeId];
			if(range)
			{
				if(range[0] && range[0].domNode)
					dojo.removeClass(range[0].domNode,"permissionRectangle");
				this._highlightProvider.removeHighlight(range);
				delete ranges[rangeId];
			}
		}	
	},
	
	highlightRange: function(sheetId, rangeId, bHighlight)
	{
		var ranges = this._highlightRanges[sheetId];
		if(ranges)
		{
			var rangeList = ranges[rangeId];
			if(rangeList && rangeList[0])
			{
				var range = rangeList[0];
				if(bHighlight)
				{
					range.setBorderWidth(4);
					range.render();
				}	
				else
				{
					range.setBorderWidth(2);
					range.render();
				}
			}	
		}	
	},
	
	removeAllHighlightRanges: function()
	{
		for(var sId in this._highlightRanges)
		{
			var ranges = this._highlightRanges[sId];
			var views = [];
			for(var rId in ranges)
			{
				views.push(ranges[rId]);
			}
			this._highlightProvider.removeHighlight(views);
		}
		this._highlightRanges = {};
	},
	
	_drawPermissions: function(sheetId)
	{
		var sheetPMap = this._aclHandler.getSheetPermissions(sheetId);
		if(!sheetPMap) return;
		if(sheetPMap.sheet)
			this.drawPermission(sheetPMap.sheet,sheetId);
		var pms = sheetPMap.range;
		var len = pms.length;
		for(var i = 0; i < len; i++)
		{
			var pm = pms[i];
			if(pm.isValid())
			{
				this.drawPermission(pm,sheetId);
			}	
		}	
	},
	
	getHighlightRange: function(sheetId,rangeId)
	{
		var ranges = this._highlightRanges[sheetId];
		if(!ranges)
			return null;
		return ranges[rangeId];
	},
	
	drawPermission: function(pm,sheetId)
	{
		if(!pm.isValid()) return;
		var rangeInfo = pm.area._getRangeInfo();
		var refType = pm.area.getType();
		if(pm.bSheet || refType == websheet.Constant.RangeType.COLUMN)
		{
			rangeInfo.endRow = this._aclHandler.editor.getMaxRow();
		}	
		var ranges = [{_getRangeInfo: function(){return rangeInfo;},
						getType: function(){return refType;}
			}];
		var color = pm.getType() == websheet.Constant.PermissionType.EDITABLE ? this._editColor : this._readColor;
		var view = this._highlightProvider.highlightRange(ranges,color);
		
		//here for these highlight rectangle, need to add z-index to make it not swallow the mouse event
		if(view[0] && view[0].domNode)
		{
			dojo.addClass(view[0].domNode,"permissionRectangle");
		}
		
		var highlightRangesPSheet = this._highlightRanges[sheetId];
		if(!highlightRangesPSheet)
		{
			highlightRangesPSheet = {};
			this._highlightRanges[sheetId] = highlightRangesPSheet;
		}
		var rangeId = pm.getId();
		highlightRangesPSheet[rangeId] = view;
	},
	
	/**
	 * 
	 * @param ranges: areaList need to be updated
	 */
	updateRanges: function(ranges, sheetId, bCreate)
	{
		var len = ranges.length;
		for(var i = 0; i < len; i++)
		{
			var range = ranges[i];

//			if(range.data && range.data.bSheet) continue;

			var rangeId = range.getId();
			var hRanges = this._highlightRanges[sheetId];
			if(hRanges && hRanges[rangeId])
			{
				var hRange = hRanges[rangeId];
				if(!range.isValid())
				{
					this.removeHighlightRange(sheetId,rangeId);
					continue;
				}
				var startRow = range.getStartRow();
				var endRow = range.getEndRow();
				var startCol = range.getStartCol();
				var endCol = range.getEndCol();
				if(range.data.type)
				{
					var color = range.data.type == this._aclHandler._editType ? this._editColor : this._readColor;
					hRange[0].setBorderColor(color);
				}	
				hRange[0].selectRange(startRow-1,startCol,endRow-1,endCol);
			}
			else
			{ 
				if(bCreate)
				{
					var pm = new websheet.ACL.Permission(range);
					this.drawPermission(pm,sheetId);
				}	
			}
		}	
	},
	
	/**
	 * if the pm not all visible in the current view, scroll to make the lef top visible 
	 */
	moveHighlightToCurView: function(pm)
	{
		if(pm.bSheet) return;
		var grid = this._aclHandler.editor.getCurrentGrid();
		var scroller = grid.scroller;
		var firstVRow = scroller.firstVisibleRow + 1,
			lastVRow = scroller.lastVisibleRow + 1,
			firstVCol = scroller.firstVisibleCol,
			lastVCol = scroller.lastVisibleCol;
		var sr = pm.area.getStartRow(),
			er = pm.area.getEndRow(),
			sc = pm.area.getStartCol(),
			ec = pm.area.getEndCol(),
			type = pm.area.getType();
		
		var isRowVis = function(rIndex){
			if(grid.freezeRow > 0 && rIndex <= grid.freezeRow) return true;
			if(rIndex >= firstVRow && rIndex <= lastVRow) return true;
			return false;
		};
		
		var isColVis = function(cIndex){
			if(grid.freezeCol > 0 && cIndex <= grid.freezeCol) return true;
			if(cIndex >= firstVCol && cIndex <= lastVCol) return true;
			return false;
		};
		//check if need to scroll row
		if( type != websheet.Constant.RangeType.COLUMN)
		{
			if(!isRowVis(sr) || !isRowVis(er))
			{
				scroller.scrollToRow(sr -1);
			}	
		}
		if( type != websheet.Constant.RangeType.ROW)
		{
			if(!isColVis(sc) || !isColVis(ec))
			{
				scroller.scrollToColumn(sc);
			}	
		}
	},
	/**
	 * If user in view permissions mode, every time when grid render
	 * need to get the permissions for the render range.
	 * result in the format: 
	 * {
	 * 	 basic: edit/readOnly,
	 *   ranges: []     // if the basic is edit, here is the readOnlyRanges, else editRanges
	 * }
	 */
	getPermissions: function(userId, range)
	{
		var aclHandler = this._aclHandler;
		
		var parsedRef = new websheet.parse.ParsedRef(range.sheetName, range.startRow, range.startCol, range.endRow, range.endCol, websheet.Constant.RANGE_MASK);
		var list = aclHandler.getPermissionAreasInRange(parsedRef);
		
		var userView = aclHandler.getPermissionAreas4User(list,userId);
		var sheetPType = aclHandler.getSheetPermissionType4User(userId);
		var areas = sheetPType == aclHandler._editType ? userView.read : userView.edit;
		
		var newRanges = []; // get the area inside the range
		var len = areas.length;
		for(var i = 0; i < len ; i++)
		{
			var area = areas[i];
			var areaRange = area.getParsedRef();
			var newRange = websheet.ACL.BehaviorCheckHelper.getIntersection(areaRange,range);
			
			//if the area is a single merged cell, then the newRange maybe null, or not complete,
			//need to get intersection with the expand
			if(!newRange || area.isSingleCell())
			{
				var expand = websheet.Utils.getExpandRangeInfo(areaRange);
				newRange = websheet.ACL.BehaviorCheckHelper.getIntersection(expand,range);
			}	
			newRanges.push(newRange);
		}	
		var ret = {basic: sheetPType, ranges:newRanges };
		return ret;
	},
	
	destroy: function()
	{
		this._subHandlers.forEach(function(handler){
			dojo.unsubscribe(handler);
		});
		this._subHandlers = [];
	}
	
});