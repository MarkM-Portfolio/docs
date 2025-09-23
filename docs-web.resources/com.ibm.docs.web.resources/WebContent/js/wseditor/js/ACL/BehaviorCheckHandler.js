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

dojo.provide("websheet.ACL.BehaviorCheckHandler");
dojo.requireLocalization("websheet.ACL","BehaviorCheckHandler");
dojo.declare("websheet.ACL.BehaviorCheckHandler",null,{
	
	_aclHandler: null,
	_helper : null,
	nls	 	: null,
	
	PRE_CREATE_PERM_CHECK: {
		CAN_CREATE		: 0,
		CAN_NOT_EDIT	: 1,
		HAVE_CONFLICT	: 2,
		HAVE_SHEET_PERM	: 3
	},
	
	constructor: function(aclHandler)
	{
		this._aclHandler = aclHandler;
		this._helper = websheet.ACL.BehaviorCheckHelper;
		this.nls = dojo.i18n.getLocalization("websheet.ACL","BehaviorCheckHandler");
		dojo.subscribe("UserSelection",dojo.hitch(this,this.modifyToolbar));
	},
	
	/**
	 * 
	 * @param parsedRef: when bSheet is true, parsedRef just means the sheet name
	 * @param bSheet : boolean
	 * @param type   : permission type, edit or readOnly
	 * @param owners
	 * @returns
	 */
	canCreatePermission: function(parsedRef, bSheet, type, owners, allUserIdList)
	{
		//here for sheet permission, if the parsedRef is object, reset it to sheetName
		if(bSheet && !!parsedRef.sheetName)
			parsedRef = parsedRef.sheetName;
		
		var userId = this._aclHandler._userHandler.getCurrentUserId();
		var interactAreas = [];
		if(!bSheet)
			interactAreas = this._aclHandler.getPermissionAreasInRange(parsedRef);
		
		var canEdit = bSheet ? this.canUserEditSheet(userId,parsedRef): this.canUserEditRange(userId,parsedRef,interactAreas);

		if(!canEdit) return this.PRE_CREATE_PERM_CHECK.CAN_NOT_EDIT;
		
		if(bSheet)
		{
			if(this._hasSheetPermission(parsedRef)) return this.PRE_CREATE_PERM_CHECK.HAVE_SHEET_PERM;
			else 
				return this.PRE_CREATE_PERM_CHECK.CAN_CREATE;
		}	
		
		var pm = {parsedRef:parsedRef, type:type, owners:owners,creator:userId};
		var hasConflict = this.hasConflict(pm,bSheet,interactAreas, allUserIdList);
		if(hasConflict) return this.PRE_CREATE_PERM_CHECK.HAVE_CONFLICT;
		return this.PRE_CREATE_PERM_CHECK.CAN_CREATE;
	},
	
	_hasSheetPermission: function(sheetName)
	{
		var sheetId = this._aclHandler._doc.getSheetId(sheetName);
		var sheetPMap = this._aclHandler.getSheetPermissions(sheetId);
		if(!sheetPMap) return false;
		return !!sheetPMap.sheet;
	},
	
	/**
	 * if sheet type permission: check the current user whether can edit this sheet
	 * if range type permission: check the current user is the creator of this permission or is the owner of this doc
	 * @param permission
	 */
	canUpdatePermission: function(permission)
	{
		var userHandler = this._aclHandler._userHandler;
		var userId = userHandler.getCurrentUserId();
		var sheetName = permission.area.getSheetName();
		if(permission.bSheet)
		{
			return this.canUserEditSheet(userId,sheetName);
		}else
		{
			
			if(userHandler.isCurrentUserDocOwner() || userId == permission.getCreator()) return true;
			return false;
		}
	},
	
	/**
	 * check whether the current permission could be changed to the new one
	 */
	canChangePermission: function(permission,parsedRef,type, owners,allUserIdList)
	{
		var userHandler = this._aclHandler._userHandler;
		var userId = userHandler.getCurrentUserId();
		var sheetName = permission.area.getSheetName();
		if(permission.bSheet)
		{
			if(this.canUserEditSheet(userId,sheetName))
				return this.PRE_CREATE_PERM_CHECK.CAN_CREATE;
			else
				return this.PRE_CREATE_PERM_CHECK.CAN_NOT_EDIT;
		}
		else if(parsedRef == sheetName)
		{
			if(!this.canUserEditSheet(userId,sheetName))
				return this.PRE_CREATE_PERM_CHECK.CAN_NOT_EDIT;
			else if(this._hasSheetPermission(sheetName))
				return this.PRE_CREATE_PERM_CHECK.HAVE_SHEET_PERM;
			else
				return this.PRE_CREATE_PERM_CHECK.CAN_CREATE;
		}
		else
		{
			var interactAreas = this._aclHandler.getPermissionAreasInRange(parsedRef);
			for(var len = interactAreas.length, i =len -1; i >=0 ; i--)
			{
				var area = interactAreas[i];
				//here maybe lots of areas, cause stored in differenct areaPage
				if(permission.area == area)
				{
					interactAreas.splice(i,1);
				}
			}	
			var canEdit = this.canUserEditRange(userId,parsedRef,interactAreas);
			if(!canEdit) return this.PRE_CREATE_PERM_CHECK.CAN_NOT_EDIT;
			var pm = {parsedRef:parsedRef, type:type, owners:owners,creator:userId};
			var hasConflict = this.hasConflict(pm,permission.bSheet,interactAreas, allUserIdList);
			if(hasConflict) return this.PRE_CREATE_PERM_CHECK.HAVE_CONFLICT;
			return this.PRE_CREATE_PERM_CHECK.CAN_CREATE;
		}
	},
	
	/**
	 * The owner of the doc could delete all the permissions, otherwise
	 * if sheet type permission: check the current user whether can edit this sheet
	 * if range type permission: check the current user is the creator of this permission 
	 * @param permission
	 */
    canDeletePermission: function(permission)
    {
    	var userHandler = this._aclHandler._userHandler;
    	if(userHandler.isCurrentUserDocOwner()) return true;
		
    	return this.canUpdatePermission(permission);
    },
	
    canEditSheet: function(sheetName)
    {
		var userHandler = this._aclHandler._userHandler;
		var userId = userHandler.getCurrentUserId();
		return this.canUserEditSheet(userId,sheetName);
    },
    
	canUserEditSheet: function(userId,sheetName)
	{
		// check this user has edit permission in this sheet
		var userPType = this._aclHandler.getSheetPermissionType4User(userId, sheetName);
	
		return userPType == this._aclHandler._editType;
	},
	
	canCurUserEditRange: function(addr)
	{
		var range = websheet.Helper.parseRef(addr);
		
		var userHandler = this._aclHandler._userHandler;
		var userId = userHandler.getCurrentUserId();
		var interactAreas = this._aclHandler.getPermissionAreasInRange(range);
		return this.canUserEditRange(userId, range, interactAreas);
	},
	
	canCurUserEditCell: function(sheetName, row, col)
	{
		var addr = websheet.Helper.getAddressByIndex(sheetName, row, col, null, row, col, {refMask: websheet.Constant.RANGE_MASK});
		var range = websheet.Helper.parseRef(addr);
		
		var userHandler = this._aclHandler._userHandler;
		var userId = userHandler.getCurrentUserId();
		var interactAreas = this._aclHandler.getPermissionAreasInRange(range);
		return this.canUserEditRange(userId, range, interactAreas);
	},
	
	canUserEditRange: function(userId, range, interactAreas)
	{
		var sheetPType = this._aclHandler.getSheetPermissionType4User(userId, range.sheetName);
		var userViewP = this._aclHandler.getPermissionAreas4User(interactAreas,userId);
		var editList = userViewP.edit, readList = userViewP.read;
		if(sheetPType == this._aclHandler._editType)
		{
			//if sheet permission is edit, then check whether it interact with readOnly area
			return readList.length == 0;
		}	
		else
		{
			//if sheet permission is read only, then check if it inside the edit area
			//1) get the interactions with the range, if the range just inside the area, bingo!
			//2) else, do the complicated check: 
			//         1 sort the interaction ranges in startRow, startCol order check if some gap in colum
			//         2 sort the interaction ranges in startCol, startRow order check if some gap in row
			if(!editList) return false;
			var interactionsList = [];
			for(var len = editList.length - 1, i = len; i >= 0; i--)
			{
				var area = editList[i];
				var intersect = this._helper.getIntersection(area.getParsedRef(),range);
				if(this._helper.isSameRange(intersect,range))
					return true;
				interactionsList.push(intersect);
			}	
			if(interactionsList.length == 0) return false;
			
			var sortedRow = this._helper.sortRanges(interactionsList,"startRow","startCol");
			if(sortedRow[0].startRow < range.startRow) return false;
			var hasGap = this._helper.checkHasGap(sortedRow,range.startCol, range.endCol, "startCol","endCol");
			if(hasGap) return false;
			var sortedCol = this._helper.sortRanges(interactionsList,"startCol", "startRow");
			if(sortedCol[0].startCol < range.startCol) return false;
			hasGap = this._helper.checkHasGap(sortedCol, range.startRow, range.endRow,"startRow", "endRow");
			if(hasGap) return false;
		}
		return true;
	},
	
	_getOtherUsers: function(creator, owners,allUserIdList)
	{
		var others = [];
		if(owners[0] == "everyoneExceptMe")
		{
			others = [creator];
		}
		else if(owners[0] != "everyone")
		{
			var ownersMap = {};
			for(var len = owners.length, i = len -1; i >= 0; i--)
				ownersMap[owners[i]] = true;
			for(var len = allUserIdList.length, i= len -1; i >= 0; i--)
			{
				var userId = allUserIdList[i];
//				if(userId == creator) continue;
				if(!ownersMap[userId])
					others.push(userId);
			}	
		}
		return others;
	},
	
	_checkPermission4User: function(owners,interactAreas, bEdit)
	{
		for(var len = owners.length, i = len -1; i >= 0; i--)
		{
			var userId = owners[i];
			var userView = this._aclHandler.getPermissionAreas4User(interactAreas,userId);
			if(bEdit)
			{
				if(userView.read.length > 0)
					return true;
			}
			else
			{
				if(userView.edit.length > 0)
					return true;
			}
		}
		return false;
	},
	
	/**
	 * Given the new permission(parsedRef,creator,type,owners), check if it would have conflict with all the other permission for every user
	 * check rules :
	 * 	1) for range permission: if the permission type the reverse of sheet permission type, do not need check;
	 *                           if the permission type the same with sheet permission type : if it interact with the reverse permission type range
	 *  2) for sheet permission: check for this user on the sheet, if contain contrast range permission                         
	 */
	hasConflict: function(pm, bSheet,interactAreas, allUserIdList)
	{
		var parsedRef = pm.parsedRef,
			type = pm.type,
			owners = pm.owners,
			creator = pm.creator;
		var editOwners = [], readOwners = [],newOwners = [];
		if(type == this._aclHandler._editType)
		{
			editOwners = owners[0] == "everyone" ? allUserIdList : owners;
			readOwners = this._getOtherUsers(creator,owners,allUserIdList);
			newOwners = editOwners.concat(readOwners);
		}
		else
		{
			newOwners = owners[0] == "everyone" ? allUserIdList : owners;
			if(owners[0] == "everyoneExceptMe")
			{
				newOwners = [];
				allUserIdList.forEach(function(id){
					if(id != creator)
						newOwners.push(id);
				});
			}	
		}	
		if(bSheet)
		{
			return false;
//			var sheetPMap = this._aclHandler.getSheetPermissions();
//			if(sheetPMap && sheetPMap.range)
//			{
//				var len = sheetPMap.range.length;
//				for(var i = 0; i < len; i++)
//					interactAreas.push(sheetPMap.range[i].area);
//			}
//			for(var len = newOwners.length, i = len -1; i >= 0; i--)
//			{
//				var userId = owners[i];
//				var userView = this._aclHandler.getPermissionAreas4User(interactAreas,userId);
//				if(userView.edit.length > 0 && userView.read.length > 0)
//					return true;
//			}	
		}	
		else
		{
			if(type == this._aclHandler._editType)
			{
				//for edit permission, the owners need to check: the range if interact with other readOnly range
				return this._checkPermission4User(editOwners, interactAreas, true) 
						|| this._checkPermission4User(readOwners,interactAreas);
			}
			else
			{
				//for readOnly permission, only need to check the owners
				return this._checkPermission4User(newOwners,interactAreas);
			}
		}
		return false;
	},
	
	/**
	 * when user select rows, this method could used to decide whether could insert row before/after, or delete
	 * for the returned value canDelete, must used together with canEdit( canDelete = canDelete && canEdit),
	 * cause for the edit sheet permission type, canDelete = canEdit
	 * @param userId
	 * @param sheetName
	 * @param start	   : 1-based
	 * @param end      : 1-based
	 */
	canCurUserInsDlt: function(sheetName, start, end, bRow)
	{
		var ret = this.canCurUserInsert(sheetName, start, end, bRow);
		ret.canDelete = this.canCurUserDlt(sheetName, start, end, bRow);
		return ret;
		
		var userHandler = this._aclHandler._userHandler;
		var userId = userHandler.getCurrentUserId();
		
		var sheetPType = this._aclHandler.getSheetPermissionType4User(userId, sheetName);
		
		var ret = {};
		ret.canInsertBefore = this.canInsert(sheetPType, userId, sheetName, start, bRow);
		ret.canInsertAfter = this.canInsert(sheetPType, userId, sheetName, end+1, bRow);
		
		if(sheetPType == this._aclHandler._editType)
		{
			ret.canDelete = true;
		}
		else
		{
			ret.canDelete = this.canDelete(userId, sheetName, start, end, bRow);
		}
		return ret;
	},
	
	canCurUserInsert: function(sheetName, start, end, bRow)
	{
		var userId = this._aclHandler._userHandler.getCurrentUserId();
		var sheetPType = this._aclHandler.getSheetPermissionType4User(userId, sheetName);
		var ret = {};
		ret.canInsertBefore = this.canInsert(sheetPType, userId, sheetName, start, bRow);
		ret.canInsertAfter = this.canInsert(sheetPType, userId, sheetName, end+1, bRow);
		return ret;
	},
	
	/**
	 * for the edit sheet permission type, canDelete need to decided by canEdit
	 */
	canCurUserDlt: function(sheetName, start, end, bRow)
	{
		var userId = this._aclHandler._userHandler.getCurrentUserId();
		var sheetPType = this._aclHandler.getSheetPermissionType4User(userId, sheetName);
		return this.canDelete(userId, sheetName, start, end, bRow, sheetPType);

	},
	
	/**
	 * 1) If for this user the sheet level permission is editable, check the interacted readonly range permission,
	 * 	  only if there is no interaction readonly ranges, or for every interact readonly range( index == rangeStart )
	 * 2) If for this user the sheet level permission is readOnly, check the interacted editable range, 
	 * 	  only if the ( index >= rangeStart && index <= rangeEnd) for one editable range;
	 * @param userId	: user uuid
	 * @param sheetName
	 * @param index 	: 1-based
	 */
	canInsert: function(sheetPType, userId, sheetName,index, bRow)
	{
		var addr = bRow ? websheet.Helper.getAddressByIndex(sheetName, index, null, null, index, null, {refMask:websheet.Constant.ROWS_MASK})
				: websheet.Helper.getAddressByIndex(sheetName, null, index, null, null, index, {refMask:websheet.Constant.COLS_MASK});

		var parsedRef = websheet.Helper.parseRef(addr);
		var interactAreas = this._aclHandler.getPermissionAreasInRange(parsedRef);
		var userView = this._aclHandler.getPermissionAreas4User(interactAreas,userId);
		
		if(sheetPType == this._aclHandler._editType)
		{
			var readList = userView.read;
			var len = readList.length;
			if(len == 0 ) return true;
			for(var i = 0; i < len ; i++)
			{
				var area = readList[i];
				var type = area._parsedRef.getType();
				if( (type == websheet.Constant.RangeType.ROW && !bRow) || (type == websheet.Constant.RangeType.COLUMN && bRow))
					return false;
				var start = bRow ? area.getStartRow() : area.getStartCol();
				if(index != start)
					return false;
			}
			return true;
		}
		else
		{
			var editList = userView.edit;
			var len = editList.length;
			if(len == 0) return false;
			for(var i = 0; i < len; i++)
			{
				var area = editList[i];
				var start = bRow ? area.getStartRow() : area.getStartCol(),
					end = bRow ? area.getEndRow() : area.getEndCol();
				var bSameType = bRow ? area._parsedRef.getType() == websheet.Constant.RangeType.ROW : area._parsedRef.getType() == websheet.Constant.RangeType.COLUMN;
				if(bSameType && index > start && index <= end)
					return true;
			}
			return false;
		}
	},
	
	/**
	 * (1)If the sheet permission type is readOnly, then if the delete rows/columns occupy the entire range permission, 
	 * 		or it not inside a row/column edit range, the delete action would be reject;
	 * @param userView
	 * @param start  : 1-based
	 * @param end    : 1-based
	 * @param bRow
	 */
	canDelete: function(userId, sheetName, dStart, dEnd, bRow,sheetType)
	{
		var addr = bRow ? websheet.Helper.getAddressByIndex(sheetName, dStart, null, null, dEnd, null, {refMask:websheet.Constant.ROWS_MASK})
				: websheet.Helper.getAddressByIndex(sheetName, null, dStart, null, null, dEnd, {refMask:websheet.Constant.COLS_MASK});

		var parsedRef = websheet.Helper.parseRef(addr);
		var interactAreas = this._aclHandler.getPermissionAreasInRange(parsedRef);
		var userView = this._aclHandler.getPermissionAreas4User(interactAreas,userId);
		
		if(sheetType == this._aclHandler._editType)
		{
			return userView.read.length == 0;
		}	
		else
		{
			var editList = userView.edit;
			var len = editList.length;
			
			var bCover = false;
			var rangeType = websheet.Constant.RangeType;
			for(var i = 0; i < len ; i++)
			{
				var area = editList[i];
				var start, end;
				start = bRow ? area.getStartRow() : area.getStartCol();
				end = bRow ? area.getEndRow() : area.getEndCol();
				var bSameType = bRow ? area._parsedRef.getType() == websheet.Constant.RangeType.ROW : area._parsedRef.getType() == websheet.Constant.RangeType.COLUMN;
				if( bSameType && dStart >= start && dEnd <= end)
				{
					bCover = true;
				}	
//				if(dStart <= start && dEnd >= end)
//					return false;
			}	
			return bCover;
		}	

	},
	
	canMergeCell: function(addr)
	{
		var parsedRef = websheet.Helper.parseRef(addr);
		var areas = this._aclHandler.getPermissionAreasInRange(parsedRef);
		
		var len = areas.length;
		if(len == 0) return true;
		for(var i = 0; i < len; i++)
		{
			if(!this._helper.isSuperInterSection(areas[i]._parsedRef,parsedRef))
				return false;
		}	
		return true;
	},
	
	modifyToolbar: function(args)
	{
		if(websheet.model.ModelHelper.isSheetProtected() || !this._aclHandler.editor.hasACLHandler()) return;
		
		var toolbar = this._aclHandler.editor.getToolbar();
		if(!toolbar || !toolbar.isShow()) return;
		var selector = args.selector;
		var addr = selector.getSelectedRangeAddress();
//		console.log("in modifyToolbar addr is" + addr);
		var canEdit = this.canCurUserEditRange(addr);
		var configs = getToolbarConfig();
		var len = configs.length;
		for(var i = 0; i < len; i++)
		{
			var config = configs[i];
			if(config.group == websheet.Constant.ToolbarGroup.TOOLS)
				continue;
			var btn = dijit.registry.byId(config.id);	
			if(btn)
			{
				toolbar.disableToolbarById(config.id,!canEdit);
			}	
		}
		var type = selector.getSelectType();
//		console.log("type is : " + type + " canEdit is " + canEdit);
		var constant = websheet.Constant;
		var sheetName = selector.grid.sheetName;
		
		if(type == constant.Range && canEdit && !this.canMergeCell(addr))
		{
			toolbar.disableToolbarById("S_t_MergeSplitCell",true);
		}	
		// cell or column
		if((type != constant.Row && type != constant.RowRange) || selector.selectingSheet())
		{
			var start = selector._startColIndex,
				end = selector._endColIndex;
			var ret = this.canCurUserInsDlt(sheetName,start,end);
			var canDlt = canEdit && ret.canDelete;
			var enable = ret.canInsertBefore || ret.canInsertAfter || canDlt;
			toolbar.disableToolbarById("S_t_InsertDeleteCol",!enable);
			if( enable )
			{
				pe.insertColumnDropDown && pe.menuItemDisabled(pe.insertColumnDropDown,!ret.canInsertBefore);
				pe.insertColumnAfterDropDown && pe.menuItemDisabled(pe.insertColumnAfterDropDown, !ret.canInsertAfter);
				pe.deleteColumnDropDown && pe.menuItemDisabled(pe.deleteColumnDropDown, !canDlt);
			}
		}
		else
			toolbar.disableToolbarById("S_t_InsertDeleteCol",true);
		
		if (type != constant.Column && type != constant.ColumnRange)
		{
			var start = selector._startRowIndex + 1,
			    end = selector._endRowIndex + 1;
			var ret = this.canCurUserInsDlt(sheetName,start,end, true);
			var canDlt = canEdit && ret.canDelete;
			var enable = ret.canInsertBefore || ret.canInsertAfter || canDlt;
			toolbar.disableToolbarById("S_t_InsertDeleteRow",!enable);
			if( enable )
			{
				pe.insertRowDropDown && pe.menuItemDisabled(pe.insertRowDropDown, !ret.canInsertBefore);
				pe.insertRowBelowDropDown && pe.menuItemDisabled(pe.insertRowBelowDropDown, !ret.canInsertAfter);
				
				pe.deleteRowDropDown && pe.menuItemDisabled(pe.deleteRowDropDown, !canDlt);
			}
		}
		else
			toolbar.disableToolbarById("S_t_InsertDeleteRow",true);
	},
	
	cannotEditWarningDlg: function()
	{
		if(!dijit.byId("C_d_MessageBox"))
		{
			var ownerId = pe.scene.bean.getOwner();
			var userName = this._aclHandler._userHandler.getUserNameById(ownerId);
			if(!userName)
			{
				var fileOwner = ProfilePool.getUserProfile(ownerId);
				userName = fileOwner.getName();
			}
			var msg = dojo.string.substitute(this.nls.FORBIDDEN_EDIT_MSG, [userName]);
			var dlg = new concord.widgets.MessageBox(this, this.nls.PERMISSION_ERROR, null, false, {message: msg});
			dlg.show();
		}
	},
	
	/**
	 * here for the undoRanges, if they are access permission, need to filter some to avoid conflict 
	 * @param ranges : map of undoRanges
	 * @param sheetName
	 * @param startIndex
	 * @param bRow
	 * @returns
	 */
	filterUndoRanges: function(ranges,sheetName, startIndex, bRow)
	{
		var undoRanges = dojo.clone(ranges);
		var aclHandler = this._aclHandler;
		var aclUsage = websheet.Constant.RangeUsage.ACCESS_PERMISSION;
		var sheetId = aclHandler._doc.getSheetId(sheetName);
		var uerIds = Object.keys(aclHandler._userHandler._users);
		for(var id in ranges)
		{
			var uRange = ranges[id];
			if(uRange.usage != aclUsage) continue;
			var pm = aclHandler.getPermissionById(sheetId,id);
			if(!pm || pm.isValid()) continue;
			var srIndex = bRow ? startIndex : pm.area.getStartRow();
			var erIndex = bRow ? startIndex : pm.area.getEndRow();
			var scIndex = bRow ? pm.area.getStartCol(): startIndex;
			var ecIndex = bRow ? pm.area.getEndCol() : startIndex;
			
			var rangeAddr = websheet.Helper.getAddressByIndex(sheetName, srIndex, scIndex, null, erIndex, ecIndex, {refMask:websheet.Constant.RANGE_MASK});
			var rangeRef = websheet.Helper.parseRef(rangeAddr);
			var preCheckCode = this.canCreatePermission(rangeRef,false,pm.getType(),pm.getOwners(), uerIds);
			if(preCheckCode == this.PRE_CREATE_PERM_CHECK.CAN_NOT_EDIT || preCheckCode == this.PRE_CREATE_PERM_CHECK.HAVE_CONFLICT)
			{
				delete undoRanges[id];
			}
		}
		return undoRanges;
	}
});

websheet.ACL.BehaviorCheckHelper = {
	
    // here range1 and range2 should have intersection
	getIntersection: function(range1, range2)
	{
		if(range1.startRow > range2.endRow || range1.startCol > range2.endCol 
				 || range2.startRow > range1.endRow || range2.startCol > range1.endCol)
			return null;
		var intersect = {};
		intersect.startRow = range1.startRow < range2.startRow ? range2.startRow : range1.startRow;
		intersect.endRow = range1.endRow < range2.endRow ? range1.endRow : range2.endRow;
		intersect.startCol = range1.startCol < range2.startCol ? range2.startCol : range1.startCol;
		intersect.endCol = range1.endCol < range2.endCol ? range1.endCol : range2.endCol;
		return intersect;
	},
	
	isSameRange: function(range1, range2)
	{
		return range1.startRow == range2.startRow && range1.endRow == range2.endRow
		       && range1.startCol == range2.startCol && range1.endCol == range2.endCol;
	},
	
	/**
	 * range1 would contain ranges, (including the same size)
	 */
	isSuperInterSection: function(range1, range2)
	{
		return range1.startRow <= range2.startRow && range1.endRow >= range2.endRow
	       && range1.startCol <= range2.startCol && range1.endCol >= range2.endCol;
	},
	/**
	 * true means has gap, else false
	 */
	checkHasGap: function(itemList, start, end, startAttr, endAttr )
	{
		var len = itemList.length;
		for(var i = 0; i < len ; i++)
		{
			var list = itemList[i].list;
			var len2 = list.length;
			var curStart = start -1;
			for(var j = 0; j < len2; j++)
			{
				var range = list[j];
				if( (curStart+1) >= range[startAttr] && (curStart+1) <= range[endAttr])
				{
					curStart = range[endAttr];
				}	
				else if(curStart+1 < range[startAttr])
				{
					return true;
				}	
			}
			if(curStart < end) return true;
		}	
		return false;
	},
	/**
	 * sort the rangeList according to the sortAttr1 first, then sortAttr2
	 */
	sortRanges: function(rangeList, sortAttr1, sortAttr2)
	{
		var len = rangeList.length;
		rangeList.sort(function(a,b){
			if(a[sortAttr1] > b[sortAttr1])
				return 1;
			else if(a[sortAttr1] < b[sortAttr1])
				return -1;
			else
			{
				return a[sortAttr2] - b[sortAttr2];
			}
		});
		
		var endAttr = sortAttr1 == "startRow" ? "endRow" : "endCol";
		var result = [];
		var start = -1, item = {list:[]}, i = 0;
		while(i < len)
		{
			var curItem = {};
			var curStart = rangeList[i][sortAttr1];
			curItem.start = curStart;
			curItem.list = [];
			
			while(i < len && rangeList[i][sortAttr1] == curStart)
			{
				curItem.list.push(rangeList[i]);
				i++;
			}	
			var len2 = item.list.length;
			if(len2 > 0)
			{
				for(var j = 0; j < len2; j++)
				{
					var lRange = item.list[j];
					if(lRange[endAttr] >= curStart)
						curItem.list.push(lRange);
				}	
				curItem.list.sort(function(a,b){return a[sortAttr2] - b[sortAttr2]});
			}	
			result.push(curItem);
			item = curItem;	
		}	
		return result;
	}
};