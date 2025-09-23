dojo.provide("websheet.tests.ut.model.ut_ACL");

dojo.require("websheet.ACL.UserHandler");
dojo.require("websheet.ACL.UserIconList");
dojo.require("websheet.ACL.UserMultiSelector");
dojo.require("websheet.ACL.PermissionWidget");
dojo.require("websheet.test.stubs.widget.RangeHighlightProvider");
dojo.require("websheet.test.stubs.widget.ConfirmBox");
dojo.require("websheet.test.stubs.widget.MessageBox");
dojo.require("websheet.test.stubs.widget.PaneManager");

describe("websheet.test.ut.model.ut_ACL", function(){
	
	var _document = new websheet.model.Document();
	var _sheet = new websheet.model.Sheet(_document,"os1","sheet1");
	websheet.Constant.init();
	var editType = websheet.Constant.PermissionType.EDITABLE,
		readType = websheet.Constant.PermissionType.READONLY;
	
	var getACLViewSettings = function(){};
	
	beforeEach(function() {
		utils.bindDocument(_document);
		//fake objects for userHandler
		dojo.setObject("pe.scene.editors",{
			getAllEditors:function(){
				var editors = [];
				editors.push(builders.editor("#d3d3d3","test1","test1@ibm.com","1"));
				editors.push(builders.editor("#EA6400","test2","test2@ibm.com","2"));
				return {items:editors};
			}
		});
		dojo.setObject("concord.util.uri.getDocUri", function(){
			return "/docs/api/docsvr/concord.storage/acl.xlsx"
		});
		dojo.setObject("window.gIs_cloud",false);
		dojo.setObject("concord.util.uri.isExternal",function(){return false;});
		dojo.setObject("pe.authenticatedUser",{
			getId: function(){return "2";},
			getName: function(){return "test2";}
		});
		dojo.setObject("window.commandOperate",{INSERTRANGE:"insertRange",DELETERANGE:"deleteRange",SETRANGEINFO:"setRangeInfo"});
		
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	describe("test UserHandler", function(){
		var _userHandler;
		
		beforeEach(function() {

			_userHandler = new websheet.ACL.UserHandler();
		});
		
		it("test userHandler init users", function(){
			
			expect(Object.keys(_userHandler._users)).toEqual(["1","2"]);
		});
		
		it("test getEveryOneIconNode", function(){
			var node = _userHandler.getUserIconNode("everyone");
			expect(node).not.toBe(null);
		});
		
		it("test getUserIconNode", function(){
			dojo.setObject("concord.widgets.sidebar.EditorToken",function(args){
				var token = {
						generateClone:function(c){return c;},
						dealStack:[]
				};
				window.conditionRenderer.registerUnifiedToken(args.userId,token);
			});
			var node = _userHandler.getUserIconNode("1");
			expect(node).not.toBe(null);
		});
		
		it("test getAllUsers", function(){
			//have not mock the xhrGet here
			var users = _userHandler.getAllUsers();
			expect(Object.keys(users)).toEqual(["1","2"]);
		});
		
		it("test getUserNameById", function(){
			var name = _userHandler.getUserNameById("1");
			expect(name).toEqual("test1");
		});
		
		it("test editorsUpdated", function(){
			_userHandler.editorsUpdated();
			var user1 = _userHandler._users["1"];
			expect(user1.color).toEqual("#FFF");
		});
	});
	
	describe("test userIconList widget", function(){
		
		var iconList;
		
		beforeEach(function() {
			//fake for acl widget
			dojo.setObject("websheet.Main._aclHandler",{
				_userHandler:null,
				getUserHandler: function(){
					if(!this._userHandler)
						this._userHandler = new websheet.ACL.UserHandler();
					return this._userHandler;
				}
			});
			dojo.setObject("pe.scene.editor",websheet.Main);
			
			iconList = new websheet.ACL.UserIconList();
			var fakeParent = dojo.create("div");
			fakeParent.appendChild(iconList.domNode);
		});
		
		afterEach(function(){
			iconList = null;
		});
		
		it("can create userIconList", function(){
			expect(iconList.userList).not.toBe(null);
		});
		
		it("test updateUsers and notify", function(){
			var users = [];
			users.push({color:"#d3d3d3",id:"1"});
			users.push({color:"#EA6400",id:"2"});
			
			iconList.updateUsers({users:users});
			expect(iconList.userList.childElementCount).toBe(2);
			
			iconList.notify(null,{"1":{color:"#FA6400"}, "2":{color:"#EA6400"}});
			var user1 = iconList._users[0];
			expect(user1.color).toEqual("#FA6400");
		});
		
	});
	
	describe("test permission", function(){
		var pm;
		
		beforeEach(function(){
			var parsedRef = new websheet.parse.ParsedRef("sheet1", 1,1,2,2,websheet.Constant.RANGE_MASK);
			var area = new websheet.parse.Area(parsedRef, "ra_ACL_0", websheet.Constant.RangeUsage.ACCESS_PERMISSION);
			area.data = {type:websheet.Constant.PermissionType.EDITABLE, creator:"1",owners:["2","3"]};
			pm = new websheet.ACL.Permission(area);
			
		});
		
		afterEach(function(){
			pm = null;
		});
		
		it("test Permission basic method", function(){
			expect(pm.getId()).toEqual("ra_ACL_0");
			expect(pm.getType()).toEqual(editType);
			expect(pm.getCreator()).toEqual("1");
			expect(pm.getOwners()).toEqual(["2","3"]);
			expect(pm.getAddress()).toEqual("A1:B2");
			expect(pm.isValid()).toEqual(true);
		});
		
		it("test getType4User method", function(){

			//for edit type pm
			//test creator
			expect(pm.getType4User("1")).toEqual(editType);
			//test owner
			expect(pm.getType4User("2")).toEqual(editType);
			//test other
			expect(pm.getType4User("4")).toEqual(readType);
			
			//for readOnly type
			pm.area.data.type = readType;
			//test creator
			expect(pm.getType4User("1")).toBe(null);
			//test owner
			expect(pm.getType4User("2")).toEqual(readType);
			//test other
			expect(pm.getType4User("4")).toBe(null);
			
			//for everyone
			pm.area.data.owners = ["everyone"];
			expect(pm.getType4User("1")).toEqual(readType);
			
			//for everyoneExceptMe
			pm.area.data.owners = ["everyoneExceptMe"];
			pm.area.data.except = ["1"];
			expect(pm.getType4User("1")).toBe(null);
			expect(pm.getType4User("2")).toEqual(readType);
		});
		
	});
	
	//This test suite does not including method getPermissions(),test this method when the really aclHandler is ready;
	describe("test viewHandler", function(){
		var viewHandler;
		
		beforeEach(function(){
			dojo.setObject("websheet.Main._aclHandler",{
				editor: websheet.Main,
				_userHandler:null,
				_doc :_document,
				
				getUserHandler: function(){
					if(!this._userHandler)
						this._userHandler = new websheet.ACL.UserHandler();
					return this._userHandler;
				},
				getSheetPermissions: function(){
					var ret = {};
					ret.sheet = builders.permission("sheet1!1:1048576","ra_ACL_0",{type:readType, bSheet:true,creator:"1",owners:["2"]});
					ret.range=[];
					ret.range.push(builders.permission("sheet1!A1:B2","ra_ACL_1",{type:editType, creator:"1",owners:["2"]}));
					return ret;
				},
				
				_getCurrrentSheetName: function(){ return "sheet1";}
				
			});
			dojo.setObject("pe.scene.editor",websheet.Main);
			dojo.aspect = {after:function(){},before:function(){}};
			
			viewHandler = new websheet.ACL.ViewHandler(websheet.Main._aclHandler);
		});
		
		it("can draw and remove permissions", function(){
			
			// can draw permissions
			viewHandler.drawPermissions();
			expect(viewHandler._highlightRanges).not.toBe(null);
			var sheetRanges = viewHandler._highlightRanges["os1"];
			expect(sheetRanges).not.toBe(null);
			expect(sheetRanges["ra_ACL_0"]).not.toBe(null);
			expect(sheetRanges["ra_ACL_1"]).not.toBe(null);
			
			//remove permission
			viewHandler.removeHighlightRange("os1","ra_ACL_1");
			expect(sheetRanges["ra_ACL_1"]).toBe(undefined);
			//remove permisions
			viewHandler.removeAllHighlightRanges();
			expect(Object.keys(viewHandler._highlightRanges)).toEqual([]);
		});
		
		it("can highlightRange", function(){
			viewHandler.drawPermissions();
			
			var ranges = viewHandler.getHighlightRange("os1", "ra_ACL_1");
			expect(ranges[0]._borderWidth).toEqual(2);
			
			viewHandler.highlightRange("os1", "ra_ACL_1", true);
			expect(ranges[0]._borderWidth).toEqual(4);
			
			viewHandler.highlightRange("os1", "ra_ACL_1", false);
			expect(ranges[0]._borderWidth).toEqual(2);
		});
		
		it("can updateRanges", function(){
			viewHandler.drawPermissions();
			
			// update exist range
			var pm = viewHandler._aclHandler.getSheetPermissions().range[0];
			var ranges = viewHandler.getHighlightRange("os1", "ra_ACL_1");
			spyOn(ranges[0],"selectRange");
			spyOn(ranges[0],"setBorderColor");
			viewHandler.updateRanges([pm.area], "os1");
			expect(ranges[0].selectRange).toHaveBeenCalled();
			expect(ranges[0].setBorderColor).toHaveBeenCalled();
			
			//update unexitst range
			pm = builders.permission("sheet1!A2:B2","ra_ACL_2",{type:editType, creator:"1",owners:["2"]});
			viewHandler.updateRanges([pm.area], "os1");
			expect(viewHandler.getHighlightRange("os1", "ra_ACL_2")).not.toBe(null);
		});
	});
	
	describe("test permissionItem widget", function(){
		var pmItem;
		
		beforeEach(function(){
			dojo.setObject("pe.scene.editor",websheet.Main);
			
			dojo.setObject("websheet.Main._aclHandler",{
				editor: websheet.Main,
				_doc :_document,
				_userHandler: new websheet.ACL.UserHandler(),
				_viewHandler: new websheet.ACL.ViewHandler(websheet.Main._aclHandler),
				_behaviorCheckHandler:{
					canUpdatePermission: function(){return true;},
					canDeletePermission: function(){return true;}
				},
				getUserHandler: function(){return this._userHandler;},
				deletePermission:function(){},
				getPermissionPane:function(){return {updatePermissionWidget:function(){}}},
				_getCurrrentSheetName: function(){ return "sheet1";}
				
			});
			
			var pm = builders.permission("sheet1!1:1048576","ra_ACL_0",{type:websheet.Constant.PermissionType.READONLY, creator:"1",owners:["2"],bSheet:true});
			pmItem = new websheet.ACL.PermissionItem({permission:pm,users:[{id:"2",name:"test2",email:"test2@cn.ibm.com",color:"#faf"}],aclHandler:websheet.Main._aclHandler});
		});
		
		afterEach(function(){
			pmItem = null;
		});
		
		it("can create permissionItem", function(){
			
			expect(dojo.hasClass(pmItem.permissionType,"editable")).toBe(false);
			expect(pmItem.permissionAddr.innerHTML).toEqual("sheet1");
			expect(pmItem.creator.innerHTML).toEqual("test1");
		});
		
		it("can updateItem", function(){
			pmItem.permission.area.data.type = readType;
			pmItem.updateItem([{id:"2",name:"test2",email:"test2@cn.ibm.com",color:"#faf"}]);
			expect(dojo.hasClass(pmItem.permissionType,"readOnly")).toBe(true);
		});
		
		it("can highlightRange",function(){
			pmItem.highlightRange(true);
			expect(dojo.hasClass(pmItem.actionIcons,"hover")).toBe(true);
			
			pmItem.highlightRange(false);
			expect(dojo.hasClass(pmItem.actionIcons,"hover")).toBe(false);
		});
		
		//just for code coverage
		it("can delete and update permission", function(){
			pmItem.deletePermission();
			pmItem._deletePermission();
			pmItem.updatePermission();
		});
		
	});
	
	describe("test UserMultiSelector widget", function(){
		
		var selector;
		var users;
		
		beforeEach(function(){

			selector = new websheet.ACL.UserMultiSelector({},dojo.create("div"));
			users = {};
			users["1"] = builders.editor("#faf","test1","test1@cn.ibm.com","1");
			users["2"] = builders.editor("#fbf","test2","test2@cn.ibm.com","2");
			users["2"].isMe = true;
		});
		
		afterEach(function(){
			selector.domNode.style.display = "none";
			selector = null;
		});
		
		it("can updateStore", function(){
			
			selector.updateStore({type:"editable", users:users});
			expect(selector._items.length).toEqual(2);
			selector.updateStore({type:"readOnly", users:users});
			expect(selector._items.length).toEqual(4);
		});
		
		it("can selectUsers", function(){
			selector.updateStore({type:"editable", users:users});
			selector.selectUsers(["1"]);
			expect(selector._items[1].checked).toBe(true);
			selector.closeDropDown();
			expect(selector._selectedItems.length).toEqual(1);
			
			selector.selectUsers(["everyone"]);
			expect(selector._items[0].checked).toBe(true);
			expect(selector._items[1].checked).toBe(true);
			selector.closeDropDown();
			expect(selector._selectedItems.length).toEqual(1);
			
			selector.updateStore({type:"readOnly", users:users});
			selector.selectUsers(["everyoneExceptMe"]);
			expect(selector._items[2].checked).toBe(true);
			expect(!!selector._items[3].checked).toBe(false);
			selector.closeDropDown();
			expect(selector._selectedItems.length).toEqual(1);
			expect(selector.getSelectedUserIds()).toEqual(["everyoneExceptMe"]);
		});
		
		it("can _selectChange", function(){
			
			runs(function(){
				selector.updateStore({type:"readOnly", users:users});
				selector.loadDropDown();
				
			});
			
			waitsFor(function(){
				
				if(selector._items[0].widgetId)
				{
					console.log("finally the menu been created!");
					return true;
				}
			}, "The menuItems have been created", 500);
			
			runs(function(){
				//for readOnly type, if click everyone
				var target = {lastChild:{innerText:selector._nls.EVERYONE}};
				selector._items[0].checked = true;
				selector._items[1].checked = true;
				selector._selectChange(target);
				expect(selector._items[1].checked).toBe(false);
				expect(selector._items[2].checked).toBe(true);
				expect(selector._items[3].checked).toBe(true);
				
				//for readOnly type, if click everyoneExceptMe
				var target = {lastChild:{innerText:selector._nls.EVERYONE_EXCEPT_ME}};
				selector._items[1].checked = true;
				selector._selectChange(target);
				expect(selector._items[0].checked).toBe(false);
				expect(selector._items[2].checked).toBe(true);
				//isMe
				expect(selector._items[3].checked).toBe(false);
				
				//for readOnly type, if click
				var target = {lastChild:{innerText:"test1"}};
				selector._selectChange(target);
				expect(selector._items[1].checked).toBe(false);
			});
		});
		
	});
	
	describe("test permissionWidget", function(){
		
		var pmWidget;
		beforeEach(function(){
			dojo.setObject("pe.scene.editor",websheet.Main);
			pe.scene.editor.controller._documentObj = _document;
			dojo.aspect = {after:function(){}};
			var aclHandler = new websheet.ACL.PermissionController(pe.scene.editor);
			var users = aclHandler.getUserHandler().getAllUsers();
			pmWidget = new websheet.ACL.PermissionWidget({users:users,handler:aclHandler});
		});
		
		afterEach(function(){
			pmWidget.destroy();
			pmWidget = null;
		});
		
		it("can changeType", function(){
			pmWidget.changeType(editType);
			expect(pmWidget._rangeType).toEqual(editType);
			
			pmWidget.changeType(readType);
			expect(pmWidget._rangeType).toEqual(readType);
		});
		
		it("can update", function(){
			var pm = builders.permission("sheet1!A1:B2","ra_ACL_0",{type:editType, creator:"1",owners:["2"]});
			pmWidget.update(null,pm,false);
			expect(pmWidget._rangeAddr).toEqual("A1:B2");
			expect(pmWidget._rangeType).toEqual(editType);
			
			pmWidget.update(null,null,true);
			expect(pmWidget._rangeAddr).toEqual("Sheet1");
			expect(pmWidget._rangeType).toEqual(editType);
		});
		
		it("test onOK method can not edit", function(){
			pmWidget._rangeType = editType;
			pmWidget._rangeAddr = "A1:B2";
			
			var hhCheckor = pmWidget._aclHandler._behaviorCheckHandler;
			spyOn(hhCheckor,"canCreatePermission").andCallFake(function(){
				return hhCheckor.PRE_CREATE_PERM_CHECK.CAN_NOT_EDIT;
			});
			pmWidget.onOk();
		});
		
		it("test onOK method already have permission on sheet", function(){
			pmWidget._rangeType = editType;
			pmWidget._rangeAddr = "A1:B2";
			
			var hhCheckor = pmWidget._aclHandler._behaviorCheckHandler;
			spyOn(hhCheckor,"canCreatePermission").andCallFake(function(){
				return hhCheckor.PRE_CREATE_PERM_CHECK.HAVE_SHEET_PERM;
			});
			pmWidget.onOk();
		});
		
		it("test onOK method has conflict", function(){
			pmWidget._rangeType = editType;
			pmWidget._rangeAddr = "A1:B2";
			var hhCheckor = pmWidget._aclHandler._behaviorCheckHandler;
			spyOn(hhCheckor,"canCreatePermission").andCallFake(function(){
				return hhCheckor.PRE_CREATE_PERM_CHECK.HAVE_CONFLICT;
			});
			pmWidget.onOk();
		});
		
		it("test onOK method can create", function(){
			pmWidget._rangeType = editType;
			pmWidget._rangeAddr = "A1:B2";
			var hhCheckor = pmWidget._aclHandler._behaviorCheckHandler;
			spyOn(hhCheckor,"canCreatePermission").andCallFake(function(){
				return hhCheckor.PRE_CREATE_PERM_CHECK.CAN_CREATE;
			});
			spyOn(pmWidget._aclHandler,"getPermissionPane").andCallFake(function(){
				return {_updatePmItemsContainer: function(){}};
			});
			spyOn(pmWidget._aclHandler,"generatePermissionId").andCallFake(function(){
				return "ra0";
			});
			pmWidget.onOk();
		});
		
		//just for code coverage
		it("can focusRangePikcer", function(){
			
			var pm = builders.permission("sheet1!A1:B2","ra_ACL_0",{type:editType, creator:"1",owners:["2"]});
			pmWidget.update(null,pm,false);
			pmWidget.focusRangePikcer(true);
			pmWidget.focusRangePikcer(false);
			
			pmWidget.rangeSelector.set('displayedValue','Sheet1');
			pmWidget.onRangeAddrChange();
			pmWidget.rangeSelector.set('displayedValue','A2:B2');
			
		});
	});
	
	describe("test permissionPane widget", function(){
		
		var pmPane;
		var ranges;
		beforeEach(function(){
			ranges = [];
			dojo.setObject("pe.scene.editor",websheet.Main);
			pe.scene.editor.controller._documentObj = _document;
			dojo.aspect = {after:function(){}};
			var aclHandler = new websheet.ACL.PermissionController(pe.scene.editor);
			spyOn(aclHandler,"getSheetPermissions").andCallFake(function(){
				var ret = {};
				ret.sheet = builders.permission("sheet1!1:1048576","ra_ACL_0",{type:readType, bSheet:true,creator:"1",owners:["2"]});
				ranges.push(ret.sheet.area);
				ret.range=[];
				ret.range.push(builders.permission("sheet1!A1:B2","ra_ACL_1",{type:editType, creator:"1",owners:["2"]}));
				ranges.push(ret.range[0].area);
				return ret;
			});
			pmPane = new websheet.ACL.PermissionPane(dojo.create("div"),aclHandler);
			aclHandler._pane = pmPane;
		});
		
		afterEach(function(){
			pmPane.destroy();
			pmPane = null;
		});
		it("can create pane", function(){
			expect(pmPane._permisionsArray.length).toBe(2);
		});
		
		it("can updatePmItemsAddr", function(){
			
			var sheetRange = ranges[0];
			spyOn(sheetRange,"isValid").andCallFake(function(){
				return false;
			});
			
			pmPane.updatePmItemsAddr(ranges);
			expect(pmPane._permisionsArray.length).toBe(1);
		});
		
		it("can updatePmItem", function(){
			
			var pm = builders.permission("sheet1!A2:B2","ra_ACL_2",{type:editType, creator:"1",owners:["2"]});
			pmPane.updatePmItem(pm);
			expect(pmPane._permisionsArray.length).toBe(3);
			pmPane.updatePmItem(pm);
			expect(pmPane._permisionsArray.length).toBe(3);
		});
		
		it("can openPermissionWidget", function(){
			pmPane.openPermissionWidget({bSheet:true});
			pmPane.openPermissionWidget();
//			pmPane.open();
//			pmPane.close();
		});
	});
	
	describe("test permissionController", function(){
		
		var aclHandler;
		
		beforeEach(function(){
			dojo.setObject("pe.scene.editor",websheet.Main);
			pe.scene.editor.controller._documentObj = _document;
			dojo.aspect = {after:function(){}};
			aclHandler = new websheet.ACL.PermissionController(pe.scene.editor);
			pe.scene.editor._aclHandler = aclHandler;
			
			var pm = builders.permission("sheet1!1:1048576","ra_ACL_0",{type:readType, bSheet:true,creator:"1",owners:["2"]});
			aclHandler._areaMgr.addArea(pm.area);
			pm = builders.permission("sheet1!A1:B2","ra_ACL_1",{type:editType, creator:"1",owners:["2"]});
			aclHandler._areaMgr.addArea(pm.area);
		});
		
		it("can getPermissionPane", function(){
			
			var pane = aclHandler.getPermissionPane();
			expect(pane).toBe(null);
			
			pane = aclHandler.getPermissionPane(true);
			expect(pane).not.toBe(null);
			
			expect(aclHandler.isShow()).toBe(false);
		});
		
		it("can loadPermissions", function(){
			aclHandler.loadPermissions();
			var sheetPM = aclHandler.getSheetPermissions();
			expect(sheetPM).not.toBe(null);
			expect(sheetPM.sheet).not.toBe(null);
			expect(sheetPM.range[0]).not.toBe(null);
			expect(sheetPM.range[0].getId()).toBe("ra_ACL_1");
		});
		
		it("can getPermissionById", function(){
			aclHandler.loadPermissions();
			
			var pm = aclHandler.getPermissionById("os1","ra_ACL_0");
			expect(pm).not.toBe(null);
			
			pm = aclHandler.getPermissionById("os1","ra_ACL_1");
			expect(pm).not.toBe(null);
		});
		
		it("can getPermissionAreas4User", function(){
			
			var pm1 = builders.permission("sheet1!A1:B2","ra_ACL_2",{type:editType, creator:"1",owners:["2"]});
			var pm2 = builders.permission("sheet1!A2:B2","ra_ACL_3",{type:readType, creator:"1",owners:["3"]});
			var areaList = [pm1.area, pm2.area];
			
			var ret = aclHandler.getPermissionAreas4User(areaList,"1");
			expect(ret.edit.length).toBe(1);
			expect(ret.read.length).toBe(0);
			ret = aclHandler.getPermissionAreas4User(areaList,"2");
			expect(ret.edit.length).toBe(1);
			expect(ret.read.length).toBe(0);
			ret = aclHandler.getPermissionAreas4User(areaList,"3");
			expect(ret.edit.length).toBe(0);
			expect(ret.read.length).toBe(2);
			ret = aclHandler.getPermissionAreas4User(areaList,"3");
			expect(ret.edit.length).toBe(0);
			expect(ret.read.length).toBe(2);
		});
		
		it("can getSheetPermissionType4User", function(){
			
			expect(aclHandler.getSheetPermissionType4User("1")).toBe(editType);
			aclHandler.loadPermissions();
			expect(aclHandler.getSheetPermissionType4User("2")).toBe(readType);
			expect(aclHandler.getSheetPermissionType4User("3")).toBe(editType);
		});
		
		it("can getExtraSheetPmData",function(){
			aclHandler.loadPermissions();
			var ret = aclHandler.getExtraSheetPmData(editType,["1"]);
			expect(ret).not.toBe(null);
			ret = aclHandler.getExtraSheetPmData(editType,["2"]);
			expect(ret).toBe(null);
			ret = aclHandler.getExtraSheetPmData(editType,[3]);
			expect(ret).not.toBe(null);
		});
		
	});
});