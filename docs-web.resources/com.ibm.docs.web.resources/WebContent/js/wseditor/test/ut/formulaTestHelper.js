dojo.provide("websheet.test.ut.formulaTestHelper");

/**
 *  Provide the Helper for simplifying the formula test
 *  1) broadcast the event
 *  2) construct formula token tree
 */

(function(){
	_helper = window.formulaTestHelper = {};
	_helper.broadcastInsertRange = function(broadcaster, rangeId, rangeAddress, usage, data) {
		var type = websheet.Constant.EventType.DataChange;
		var d = {rangeid: rangeId, usage: usage};
		if(data)
			d.data = data;
		var source = {action: websheet.Constant.DataChange.INSERT,
				  refType: websheet.Constant.OPType.RANGEADDRESS,
				  refValue: websheet.Helper.parseRef(rangeAddress),
				  data: d};
		var e = new websheet.listener.NotifyEvent(type, source);
		broadcaster.broadcast(e);
	};
	
	_helper.broadcastDeleteRange = function(broadcaster, rangeId, usage) {
		var type = websheet.Constant.EventType.DataChange;
		var source = {action: websheet.Constant.DataChange.DELETE,
				  refType: websheet.Constant.OPType.RANGEADDRESS,
				  data: {usage:usage, rangeid: rangeId}};
		var e = new websheet.listener.NotifyEvent(type, source);
		broadcaster.broadcast(e);
	};
	
	_helper.broadcastUpdateRange = function(broadcaster, rangeId, rangeAddress, usage, data) {
		var type = websheet.Constant.EventType.DataChange;
		var d = {rangeid: rangeId, usage: usage};
		if(data)
			d.data = data;
		var source = {action: websheet.Constant.DataChange.SET,
					  refType: websheet.Constant.OPType.RANGEADDRESS,
					  refValue: websheet.Helper.parseRef(rangeAddress),
					  data: d};
		var e = new websheet.listener.NotifyEvent(type, source);
		broadcaster.broadcast(e);
	};
	
	_helper.broadcastSetRange = function(broadcaster, address) {
		
	};
	
	_helper.broadcastRowCol = function(broadcaster, address, bRow, bDelete) {
		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		if(bDelete)
			source.action = websheet.Constant.DataChange.PREDELETE;
		else
			source.action = websheet.Constant.DataChange.PREINSERT;
		if(bRow)
			source.refType = websheet.Constant.OPType.ROW;
		else
			source.refType = websheet.Constant.OPType.COLUMN;
		
		source.refValue = websheet.Helper.parseRef(address);
		var e = new websheet.listener.NotifyEvent(type, source);
		broadcaster.broadcast(e);
	};
	
	_helper.broadcastMoveSheet = function(broadcaster, sheetName, sheetIndex, newIndex) {
		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		source.action = websheet.Constant.DataChange.PREMOVE;
		source.refType = websheet.Constant.OPType.SHEET;
		source.refValue = sheetName  + "|" + sheetIndex + "|" + newIndex;
		var e = new websheet.listener.NotifyEvent(type, source);
		broadcaster.broadcast(e);
	};
	
	_helper.broadcastDeleteSheet = function(broadcaster, sheetName, uuid) {
		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		source.action = websheet.Constant.DataChange.PREDELETE;
		source.refType = websheet.Constant.OPType.SHEET;
		source.refValue = sheetName;
		source.data = {uuid:uuid};
		e = new websheet.listener.NotifyEvent(type, source);
		broadcaster.broadcast(e);
	};
	
	_helper.broadcastRenameSheet = function(broadcaster, sheetName, newSheetName) {
		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		source.action = websheet.Constant.DataChange.SET;
		source.refType = websheet.Constant.OPType.SHEET;
		source.refValue = sheetName;
		source.oldSheetName = sheetName;
		source.newSheetName = newSheetName;
		var e = new websheet.listener.NotifyEvent(type, source);
		broadcaster.broadcast(e);
	};
	
	_helper.broadcastInsertSheet = function(broadcaster, sheetName, sheetIndex) {
		var type = websheet.Constant.EventType.DataChange;
		var source = {};
		source.action = websheet.Constant.DataChange.INSERT;
		source.refType = websheet.Constant.OPType.SHEET;
		source.refValue = sheetName + "|" + sheetIndex;
		source.data = {areaMap:null};
		var e = new websheet.listener.NotifyEvent(type, source);
		broadcaster.broadcast(e);
	};
	
})();