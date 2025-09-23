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

dojo.provide("websheet.ACL.PermissionController");
dojo.require("websheet.widget.PaneManager");
dojo.require("websheet.ACL.PermissionPane");
dojo.require("websheet.ACL.BehaviorCheckHandler");
dojo.require("websheet.ACL.UserHandler");
dojo.require("websheet.ACL.ViewHandler");
dojo.requireLocalization("websheet.ACL","PermissionController");

dojo.declare("websheet.ACL.Permission", null,{
	area: null,
	
	bSheet: false,
	_editType			  : websheet.Constant.PermissionType.EDITABLE,
	_readOnlyType		  : websheet.Constant.PermissionType.READONLY,
	constructor: function(area)
	{
		this.area = area;
		if(area && area.data)
		{
			if(area.data.bSheet)
				this.bSheet = true;
		}
	},
	
	getId: function()
	{
		return this.area.getId();
	},
	
	getType: function()
	{
		return this.area.data.type;
	},
	
	getType4User: function(userId)
	{
		var type = this.getType();
		var owners = this.getOwners();
		
		// userId in the owner list
		var bEveryone = owners.indexOf("everyone") != -1;
		if(bEveryone) return type;
		var	bEveryoneExceptMe = owners.indexOf("everyoneExceptMe") != -1;
		if(bEveryoneExceptMe)
		{
			if(userId == this.area.data.except[0])
			{
				if(this.bSheet) return this._editType;
				else return null;
			}
			else
				return type;
		}	
		
		var containUser = false;
		for(var len = owners.length -1, i = len; i >=0; i--)
		{
			if(owners[i] == userId) 
			{
				containUser = true; 
				break;
			}
		}
		if(containUser) return type;
		
		// userId not in the owner list
		if(type == this._editType)
		{
//			var creator = this.getCreator();
//			if(creator == userId) return type;
			return this._readOnlyType;
		}	
		else
		{
			if(this.bSheet) return this._editType;
			return null;
		}
	},
	
	getCreator: function()
	{
		return this.area.data.creator;
	},
	
	isOwner: function(userId)
	{
		var owners = this.area.data.owners;
		if(owners[0] == "everyone")
			return true;
		if(owners[0] == "everyoneExceptMe")
			return userId != this.area.data.except[0];
		
		return owners.indexOf(userId) != -1;
	},
	
	getOwners: function()
	{
		return this.area.data.owners;
	},
	
	isValid: function()
	{
		return this.area.isValid();
	},
	
	getAddress: function()
	{
		if(this.bSheet)
			return this.area.getSheetName();
		var parsedRef = this.area.getParsedRef();
		var refMask = parsedRef.refMask &(~websheet.Constant.RefAddressType.SHEET);
		return this.area.getParsedRef().getAddress({refMask:refMask});
	}
});

dojo.declare("websheet.ACL.PermissionController", websheet.listener.Listener, {
	// module:
	//		websheet/ACL/PermissionController
	// description:
	// 
	
	editor    : null,
	_areaMgr  : null,
	_pane     : null, // permission pane widget
	
	/**
	 * in format of :
	 * {
	 * 		sheetId : {
	 * 			sheet : permission, // sheet permission ,
	 * 			range : [] //range permission list
	 *  	}
	 * }
	 */
	_permissionsMap       : null, 
	
	_dirtyAreas			  : null,
	_behaviorCheckHandler : null,
	_userHandler          : null,
	_viewHandler		  : null,
	
	_editType			  : websheet.Constant.PermissionType.EDITABLE,
	_readOnlyType		  : websheet.Constant.PermissionType.READONLY,
	
	_viewACL			  : false,
	_aclIcon	 		  : window.contextPath + window.staticRootPath + "/styles/css/websheet/img/sheetACL.png",
	 
	_preCacheImgs		  : ["checkbox16x16.png","checkedbox16x16.png","everyone_32x32.png","everyone_me_32x32.png"],
	constructor: function(editor)
	{
		this.editor = editor;
		this._doc = editor.getDocumentObj();
		this._areaMgr = this._doc.getAreaManager();
//		this._pane = this.getPermissionPane();
		this._permissionsMap = {};
		this._dirtyAreas = [];
		this._behaviorCheckHandler = new websheet.ACL.BehaviorCheckHandler(this);
		this._userHandler = new websheet.ACL.UserHandler(this);
		this._viewHandler = new websheet.ACL.ViewHandler(this);
		
		this._viewACL = getACLViewSettings();
		this.nls = dojo.i18n.getLocalization("websheet.ACL","PermissionController");
	},
	
	getPermissionPane: function(bCreate)
	{
		if(!this._pane && bCreate)
		{
			this.init();
			var mainNode = dojo.byId("mainNode");
			var pNode = dojo.create("div",{id: "permission_sidebar_div"}, mainNode);
			this._pane = new websheet.ACL.PermissionPane(pNode,this);
		}	
		return this._pane;
	},
	
	init: function()
	{
		this._userHandler.initUsers();
	},
	
	getUserHandler: function()
	{
		return this._userHandler;
	},
	
	
	isShow: function()
	{
		var pane = this.getPermissionPane();
		if(!pane) return false;
		return !pane.isCollapsed();
	},
	
	getPermissionById: function(sheetId, rangeId)
	{
		var shMap = this._permissionsMap[sheetId];
		if(!shMap) return null;
		if(shMap.sheet && shMap.sheet.getId() == rangeId) 
			return shMap.sheet;
		var ranges = shMap.range;
		if(ranges)
		{
			for(var len = ranges.length, i = len -1; i >= 0; i--)
			{
				var range = ranges[i];
				if(range.getId() == rangeId)
					return range;
			}	
		}
		return null;
	},
	/**
	 * get all the permission in the sheet
	 * @param sheetId
	 */
	getSheetPermissions: function(sheetId)
	{
		if(!sheetId)
		{
			var curSheetName = this.editor.getCurrentGrid().getSheetName();
			sheetId = this._doc.getSheetId(curSheetName);
		}	
		return this._permissionsMap[sheetId];
	},
	
	/**
	 * for a given range, get all the range permission interact with it
	 */
	getPermissionAreasInRange: function(parsedRef)
	{
		var interactAreas = [];
		this._areaMgr.areaBroadcast(parsedRef,null,null,interactAreas);
		return interactAreas;
	},
	
	getPermissionAreas4User: function(areaList, userId)
	{
		var editList = [], readList = [];
		var len = areaList.length;
		for(var i = 0; i < len; i++)
		{
			var area = areaList[i];
			var pm = new websheet.ACL.Permission(area);
			var type = pm.getType4User(userId);
			if(!type) continue;
			if(type == this._editType)
				editList.push(area);
			else
				readList.push(area);
		}
		var ret = {edit:editList, read:readList};
		return ret;
	},
	
	getSheetPermissionType4User: function(userId, sheetName)
	{
		if(!userId) userId = this._userHandler.getCurrentUserId();
		if(!sheetName) sheetName = this._getCurrrentSheetName(); 
		var sheetId = this._doc.getSheetId(sheetName);
		var sheetPMap = this._permissionsMap[sheetId];
		if(!sheetPMap || !sheetPMap.sheet) return this._editType;
		
		return sheetPMap.sheet.getType4User(userId);
	},
	
	generatePermissionId: function()
	{
		var uuid = dojox.uuid.generateRandomUuid();
		var rangeid = websheet.Constant.IDPrefix.RANGE + uuid;
		return rangeid;
	},
	
	
	_getSheetPermissionMap: function(sheetName)
	{
		var sheetId = this._doc.getSheetId(sheetName);
		var sheetPMap = this._permissionsMap[sheetId];
		if(!sheetPMap)
		{
			sheetPMap = {};
			sheetPMap.sheet = null;
			sheetPMap.range = [];
			this._permissionsMap[sheetId] = sheetPMap;
		}	
		return sheetPMap;
	},
	
	hasValidPermission: function()
	{
		for(var sId in this._permissionsMap)
		{
			var sheetPMap = this._permissionsMap[sId];
			if (this._checkHasValidPm(sId,sheetPMap,true))
				return true;
		}
		return false;
	},
	
	loadPermissions: function()
	{
		var RangeUsage = websheet.Constant.RangeUsage;
		var map = this._areaMgr._usageMap[RangeUsage.ACCESS_PERMISSION];
		for(var sName in map)
		{
			var sheet = map[sName];
			var sheetPMap = this._getSheetPermissionMap(sName);
			for(var rangeId in sheet)
			{
				var area = sheet[rangeId];
				var pm = new websheet.ACL.Permission(area);
				if(pm.bSheet)
				{
					//for sheet here make sure the reference is correct;
					area._parsedRef.startRow = 1;
					area._parsedRef.endRow = websheet.Constant.MaxRowNum;
					sheetPMap.sheet = pm;
				}	
				else
					sheetPMap.range.push(pm);
			}
		}
		this.addIcons();
		setTimeout(dojo.hitch(this,this.preCacheImages),10);
		
	},

	preCacheImages: function()
	{
		var basePath = window.contextPath + window.staticRootPath + "/styles/css/websheet/img/";
		var len = this._preCacheImgs.length;
		for(var i = 0; i < len; i++)
		{
			var image = new Image();
			image.src = basePath + this._preCacheImgs[i];
			image.onload = function(){
				console.log("load image" + this.src );
			};
		}
	},

	
	addIcons: function()
	{
		for(var sId in this._permissionsMap)
		{
			var sheetPMap = this._permissionsMap[sId];
			this._checkHasValidPm(sId,sheetPMap);
		}	
	},
	
	addIconPerSheet: function(sheetId)
	{
		var workSheet = this.editor.getWorksheetContainer();
		var node = dojo.byId(workSheet.TITLE_ID + sheetId);
		if(node && node.parentNode && node.parentNode.firstChild == node)
		{
			var iconNode = dojo.create("img",{
					src:this._aclIcon,
					alt:this.nls.SHEET_ACL_ICON_MSG,
					style:{ paddingRight:"2px"}
			});
			node.parentNode.insertBefore(iconNode,node);
		}
	},
	
	dltIconPerSheet: function(sheetId)
	{
		var workSheet = this.editor.getWorksheetContainer();
		var node = dojo.byId(workSheet.TITLE_ID + sheetId);
		if(node && node.parentNode)
		{
			var parent = node.parentNode;
			if(parent.firstChild.tagName == "IMG")
				parent.removeChild(parent.firstChild);
		}
	},
	
	getExtraSheetPmData: function(rangeType, owners)
	{
		//only for edit type range, may add the extra sheet pm event
		if(rangeType == this._readOnlyType) return null;
		
		var hasExtra = true;
		var curSheetName = this._getCurrrentSheetName();
		var pmMap = this._getSheetPermissionMap(curSheetName);
		//1) if current sheet exist edit type sheet permission, or readOnly type sheet permission for everyone
		//   means cloud not add extra sheet pm event
		var sheetPm = pmMap.sheet;
		if(sheetPm)
		{
			if(sheetPm.getType() == this._editType)
				hasExtra = false;
			else
			{
				var shOwners = sheetPm.getOwners();
				if(shOwners[0] == "everyone" || shOwners[0] == "everyoneExceptMe")
					hasExtra = false;
			}
		}
		if(!hasExtra) return null;
		
		//2) for every user in owners,check if he/she's sheet pm is not readonly and for him/her, 
		//   there is no other range permission
		var rangePms = pmMap.range;
		var shOwners = [];
		for(var len = owners.length, i = len -1; i >= 0; i--)
		{
			var userId = owners[i];
			var shType = sheetPm ? sheetPm.getType4User(userId) : this._editType;
			//if is already readOnly, no more need add extra
			if(shType == this._readOnlyType)
				continue;
			
			//check if for this user, on this sheet contain other range permission
			if(!rangePms)
				shOwners.push(userId);
			else
			{
				var noRangePm = true;
				for(var j = 0; j < rangePms.length; j++)
				{
					if(rangePms[j].area.isValid() && rangePms[j].isOwner(userId))
					{
						noRangePm = false;
						break;
					}
				}	
				if(noRangePm)
					shOwners.push(userId);
			}	
		}

		if(shOwners.length == 0) return null;
		
		var id = sheetPm ? sheetPm.getId() : this.generatePermissionId();
		
		return {owners:shOwners, id:id};
	},
	
	_getCurrrentSheetName: function()
	{
		 return pe.scene.editor.getCurrentGrid().getSheetName();
	},
	
	_getCurrentSheetId: function()
	{
		var sheetName = this._getCurrrentSheetName();
		return this._doc.getSheetId(sheetName);
	},
	
	// UI interface, do send message related things
	insertPermission: function(rangeid, rangeAddr, attrs)
	{
		var revAttrs = {usage: websheet.Constant.RangeUsage.ACCESS_PERMISSION, rangeid: rangeid};
		this.editor.execCommand(commandOperate.INSERTRANGE, [rangeid, rangeAddr, attrs, revAttrs]);
	},
	
	// 1 handle the _permissionsMap related stuff, 
	// 2 update UI : if the area in current sheet, update pane list
	_handleInsPermission: function(area)
	{
		var pm = new websheet.ACL.Permission(area);
		var sheetName = area.getSheetName();
		var sheetPMap = this._getSheetPermissionMap(sheetName);

		if(pm.bSheet)
			sheetPMap.sheet = pm;
		else
			sheetPMap.range.push(pm);
		
		var sId = this._doc.getSheetId(sheetName);
		this._checkHasValidPm(sId,sheetPMap);
		
		var pane = this.getPermissionPane();
		var curSheetName = this._getCurrrentSheetName();
		if( sheetName == curSheetName )
		{
			//TODO: here if is sheet level permission, need to put in the top of item list
			if(pane && !pane.isCollapsed())
			{
				pane.createPermissionItem(pm);
				var sheetId = this._doc.getSheetId(sheetName);
				this._viewHandler.drawPermission(pm,sheetId);
			}	
			if(this.isInACLView())
			{
				var grid = this.editor.getCurrentGrid();
				grid.requestWidgetsUpdate();
			}	
		}	
	},
	
	// current just for internal test usage
	deleteAllPermissions: function()
	{
		var sheetPMap = this.getSheetPermissions();
		var usage = websheet.Constant.RangeUsage.ACCESS_PERMISSION;
		var controller = this.editor.getController();
		if(sheetPMap.sheet)
		{
			var rangeId = sheetPMap.sheet.getId();
			this.deletePermission(rangeId);
		}	
		if(sheetPMap.range)
		{
			var pms = sheetPMap.range;
			for(var len = pms.length -1, i = len; i >= 0; i--)
			{
				var pm = pms[i];
				var rangeId = pm.getId();
				this.deletePermission(rangeId);
			}	
		}	
	},
	
	deletePermission: function(rangeId)
	{
		var usage = websheet.Constant.RangeUsage.ACCESS_PERMISSION;
		var area = this._areaMgr.getRangeByUsage(rangeId,usage);
		
		var revData = JSON.parse( JSON.stringify(area.data) );
		
		var refValue = area.getParsedRef().getAddress();
		var attrs = {usage: usage, rangeid: rangeId};
		var revAttrs = {usage: usage, rangeid: rangeId, data: revData};
		this.editor.execCommand(commandOperate.DELETERANGE, [rangeId, refValue, attrs, revAttrs]);
	},
	
	// 1 handle the _permissionsMap related stuff, 
	// 2 update UI : if the area in current sheet, update pane list
	_handleDltPermission: function(area)
	{
		var sheetName = area.getSheetName();
		var sheetPMap = this._getSheetPermissionMap(sheetName);
		var dltId = area.getId();
		if(sheetPMap.sheet && sheetPMap.sheet.getId() == dltId)
		{
			sheetPMap.sheet = null;
		}
		else
		{
			var ranges = sheetPMap.range;
			var len = ranges.length;
			for(var i = 0; i < len ; i++)
			{
				var rangePm = ranges[i];
				if(rangePm.getId() == dltId)
				{
					ranges.splice(i, 1);
					break;
				}	
			}	
		}
		var sheetId = this._doc.getSheetId(sheetName);
		this._checkHasValidPm(sheetId,sheetPMap);

		var pane = this.getPermissionPane();
		var curSheetName = this._getCurrrentSheetName();
		if( sheetName == curSheetName )
		{
			if(pane && !pane.isCollapsed())
			{
				pane.removePermissionItem(area);
				var sheetId = this._doc.getSheetId(sheetName);
				this._viewHandler.removeHighlightRange(sheetId,dltId);
			}	
			if(this.isInACLView())
			{
				var grid = this.editor.getCurrentGrid();
				grid.requestWidgetsUpdate();
			}	
		}
	},
	
	setPermission: function(rangeAddr, attrs, extra)
	{
		var oriAddr,revAttrs,revContent;
		//if has extra, means this set permission must be an extra event which cause by insert edit range pm
		if(extra)
		{
			oriAddr = rangeAddr;
			revAttrs = {usage:websheet.Constant.RangeUsage.ACCESS_PERMISSION,data:{"delete":attrs.data.add, creator:attrs.data.creator}};
			revAttrs.rangeid = attrs.rangeid;
			
			attrs.data.insert = extra;
			revAttrs.data.remove = extra;
		}
		else
		{
			var rangeid = attrs.rangeid;
			var oriArea = this._areaMgr.getRangeByUsage(rangeid,attrs.usage);
			oriAddr = oriArea.getParsedRef().getAddress();
			revAttrs = {rangeid: rangeid, usage: attrs.usage};
			var revData = JSON.parse( JSON.stringify(oriArea.data) );
			revAttrs.data = revData;
			//here if the set action is to change a range permission to sheet permission, then it cann't undo
			//then just set revAttrs as null, to make it could not add to the undo stack
			if(attrs.data && attrs.data.bSheet && !oriArea.data.bSheet)
				revAttrs = null;
		}

		this.editor.execCommand(commandOperate.SETRANGEINFO, [rangeAddr, attrs, oriAddr, revAttrs]);
	},
	
	// 1 if this permission in current pane, update item in UI
	_handleSetPermission: function(area,e)
	{
		if(e._source.data)
		{
			if(e._source.data.add)
			{
				if(area.data.owners[0] !="everyone" && area.data.owners[0]!="everyoneExceptMe")
				{
					var ownersMap = {};
					var nOwners =  area.data.owners.concat(e._source.data.add);
					nOwners.forEach(function(id){ownersMap[id] = true;});
					area.data.owners = Object.keys(ownersMap);
				}
			}
			else if(e._source.data["delete"])
			{
				var dltIds = e._source.data["delete"];
				var dltIdsMap = {};
				dltIds.forEach(function(id){dltIdsMap[id] = true;});
				var nOwners = [];
				area.data.owners.forEach(function(id){
					if(!dltIdsMap[id])
						nOwners.push(id);
				});
				if(nOwners.length == 0)
				{
					this._handleDltPermission(area);
					this._areaMgr.deleteArea(area);
					area.removeAllListener();
					return;
				}
				else
					area.data.owners = nOwners;
			}
			else
				area.data = e._source.data;
			if(area.data.bSheet)
			{
				area.data.creator = e._source.data.creator;
				var sheetName = area.getSheetName();
		        var sheetPMap = this._getSheetPermissionMap(sheetName);
		        var orgId = area.getId();
		        //if this set action is to change a range pm to sheet pm
		        if(!sheetPMap.sheet)
		        {
					var ranges = sheetPMap.range;
					var len = ranges.length;
					for(var i = 0; i < len ; i++)
					{
						var rangePm = ranges[i];
						if(rangePm.getId() == orgId)
						{
							ranges.splice(i, 1);
							sheetPMap.sheet = rangePm;
							rangePm.bSheet = true;
							break;
						}	
					}
		        }	
			}	
		}	
		// here for invalid area, do not handle it
		if(!area.isValid()) return;
		
		var sheetName = area.getSheetName();
        var sheetPMap = this._getSheetPermissionMap(sheetName);
   		var sId = this._doc.getSheetId(sheetName);
		this._checkHasValidPm(sId,sheetPMap);
		
		var pane = this.getPermissionPane();
		var curSheetName = this._getCurrrentSheetName();
		if( sheetName == curSheetName )
		{
			if(pane && !pane.isCollapsed())
			{
				var sheetPMap = this.getSheetPermissions();
				var areaId = area.getId();
				var pm = null;
				if(area.data && area.data.bSheet)
				{
					pm = sheetPMap.sheet;
				}
				else
				{
					for(var i = sheetPMap.range.length -1; i >= 0; i-- )
					{
						var tPM =  sheetPMap.range[i];
						if(tPM.getId() == areaId)
						{
							pm = tPM; break;
						}
					}
				}	
				
				pane.updatePmItem(pm);
				var sheetId = this._doc.getSheetId(sheetName);
				this._viewHandler.updateRanges([pm.area],sheetId,true);
			}	
			if(this.isInACLView())
			{
				var grid = this.editor.getCurrentGrid();
				grid.requestWidgetsUpdate();
			}	
		}
	},
	
	//if the insert sheet action is a redo, then it would reuse the original sheetid
	//but it would actually insert a new sheet, then here need to remove the orignal pms
	handleInsertSheetForRedo: function(sheetId)
	{
		if(this._permissionsMap && this._permissionsMap[sheetId])
			delete this._permissionsMap[sheetId];
	},
	
	handleRenameSheet: function(event)
	{
		if(!this.isShow()) return;
		var currentSheetName = this.editor.getCurrentGrid().sheetName;
		if(event.newSheetName == currentSheetName)
		{
			var sheetPMap = this.getSheetPermissions();
			var sheetPm = sheetPMap ? sheetPMap.sheet : null;
			this._pane.handleRenameSheet(currentSheetName, sheetPm);
		}	
	},
	
	
	handleShowSheet: function(sheetName)
	{
		this.checkHasValidPm(sheetName);
	},
	
	_handleAddSheet: function(event)
	{
		var usage = websheet.Constant.RangeUsage.ACCESS_PERMISSION;
		var bPM = event.data && event.data.areaMap && event.data.areaMap.usageMap && event.data.areaMap.usageMap[usage];
		if(!bPM) return;
		
		var sheetName = event.refValue.split("|")[0];
		var sheetId = this._doc.getSheetId(sheetName);
		this.addIconPerSheet(sheetId);
	},
	
	_addDirtyArea: function(area,s)
	{
		// here for invalid area, do not handle it
		if(!area.isValid()) return;
		
		if(this.isShow())
		{
			var currentSheetName = this.editor.getCurrentGrid().sheetName;
			if(area.getSheetName() == currentSheetName)
			{
				this._dirtyAreas.push(area);
			}
		}	

		if(s.action == websheet.Constant.DataChange.PREDELETE && s.data && s.data.sizeChanged)
		{
			var start, end, dltStart, dltEnd;
			if(s.refType == websheet.Constant.OPType.ROW)
			{
				start = area.getStartRow();
				end = area.getEndRow();
				dltStart = s.refValue.startRow;
				dltEnd = s.refValue.endRow;
			}	
			else
			{
				start = area.getStartCol();
				end = area.getEndCol();
				dltStart = s.refValue.startCol;
				dltEnd = s.refValue.endCol;
			}
			//this area would be invalid after the delete action, so here need a timer to check after the delete
			if(dltStart <= start && dltEnd >= end)
			{
				var sheetName = area.getSheetName();
				if(!this._invalidMap)
					this._invalidMap = {};
				this._invalidMap[sheetName] = true;
				if(this._lazyCheckTimer)
				{
					clearTimeout(this._lazyCheckTimer);
					this._lazyCheckTimer = null;
				}
				this._lazyCheckTimer = setTimeout(dojo.hitch(this,this._lazyCheck),100);
			}	
		}	
	},
	
	_lazyCheck: function()
	{
		if(this._invalidMap)
		{
			for(var sheetName in this._invalidMap)
			{
				this.checkHasValidPm(sheetName);
			}	
		}	
		this._invalidMap = null;
	},
	
	checkHasValidPm: function(sheetName)
	{
   		var sId = this._doc.getSheetId(sheetName);
   		var sheetPMap = this._permissionsMap[sId];
		this._checkHasValidPm(sId,sheetPMap);
	},
	
	_checkHasValidPm: function(sheetId,sheetPMap, ignoreUI)
	{
		var hasValid = false;
		if(sheetPMap)
		{
			if(sheetPMap.sheet) 
				hasValid = true;
			else
			{
				var ranges = sheetPMap.range;
				
				for(var len = ranges.length, i = len -1; i >= 0; i--)
				{
					var pm = ranges[i];
					if(pm.area.isValid())
					{
						hasValid = true; break;
					}	
				}
			}	
		}	
		
		if(ignoreUI) return hasValid;
		
		if(hasValid)
			this.addIconPerSheet(sheetId);
		else
			this.dltIconPerSheet(sheetId);
	},
	
	//controller updateUI would call this method to update all the dirty areas
	updateUI: function()
	{
		var len = this._dirtyAreas.length;
		if(len > 0)
		{
			var sheetId = this._getCurrentSheetId();
			this._viewHandler.updateRanges(this._dirtyAreas,sheetId);
			this._pane.updatePmItemsAddr(this._dirtyAreas);
			this._dirtyAreas = [];
		}	
	},
	
	
	isEditing: function()
	{
		var pane = this.getPermissionPane();
		if(!pane) return false;
		return pane.isEditing();
	},
	
	getPermission4Render: function(range)
	{
		var userId = this._userHandler.getCurrentUserId();
		return this._viewHandler.getPermissions(userId,range);
	},
	
	isInACLView : function()
	{
		return this._viewACL;
	},
	
	toggleViewACL: function()
	{
		this._viewACL = !this._viewACL;
		websheet.Utils.setLocalStorageItem(websheet.Constant.ACLViewPrefix,true,true,this._viewACL);
		var grid = this.editor.getCurrentGrid();
		grid.requestUpdate();
	},
	/**
	 * the permissionController is a listener for all the permission area
	 */
	notify: function(area, e)
	{
		if(e)
		{
			if(e._type == websheet.Constant.EventType.DataChange)
			{
				var s = e._source;
				if (s.refType == websheet.Constant.OPType.AREA) 
				{
					switch(s.action) {
						case websheet.Constant.DataChange.DELETE: {
							this._handleDltPermission(area);
							break;
						}
						case websheet.Constant.DataChange.INSERT:{
							this._handleInsPermission(area);
							break;
						}
						case websheet.Constant.DataChange.SET:{
							this._handleSetPermission(area,e);
							break;
						}
					}
				} 
				//here not handle the rename sheet event, cuase if their is no pm, can not get notified here
//				else if(s.action == websheet.Constant.DataChange.SET && s.refType == websheet.Constant.OPType.SHEET)
//				{
//					this._handleRenameSheet(s);
//				}
				else if(s.action == websheet.Constant.DataChange.INSERT && s.refType == websheet.Constant.OPType.SHEET)
				{
					this._handleAddSheet(s);
				}	
				else if( (s.action == websheet.Constant.DataChange.PREINSERT || s.action == websheet.Constant.DataChange.PREDELETE) 
					   &&( s.refType == websheet.Constant.OPType.ROW ||s.refType == websheet.Constant.OPType.COLUMN ))
				{
					this._addDirtyArea(area,s);
				}
			}
		}
	},
	
	destory: function()
	{
		if(this._pane)
		{
			this._pane.close();
			this._pane.destroy();
		}
		this._viewHandler.destroy();
	}
});