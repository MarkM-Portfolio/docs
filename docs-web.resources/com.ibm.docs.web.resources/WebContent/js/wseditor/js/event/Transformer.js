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

/************************************************************************************/
/* event transform in  co-editing mode												*/
/* Operation transform is implemented here										*/
/************************************************************************************/
dojo.provide("websheet.event.Transformer");

dojo["require"]("websheet.Constant");
dojo["require"]("websheet.Helper");
dojo["require"]("websheet.event.Factory");
dojo.require("websheet.event.IDManagerHelper");
dojo.require("websheet.event.DocumentAgent");

dojo.declare("websheet.event.Transformer",null, {

	docAgent:null,
	manager:null,
	Event: websheet.Constant.Event,
	_index:null,
	_localEventIdx: -1,
	_latterEventIndex:null,
    
	_ERROR:"###ERR###",
	
    constructor: function () {
    	this.docAgent = websheet.event.DocumentAgent;
    	if(this.docAgent.bMobile)
    		this.manager = new websheet.event.OTManagerBase(this.docAgent);
    	else
    		this.manager = new websheet.event.OTManager(this.docAgent);
	},
	
	getOTManager:function()
	{
		return this.manager;
	},
	// return true if the event isn't cursor, lock and release event
	isOperationMsg : function(event) {
		var ret = true;
		if ((event.action == this.Event.CURSOR) ||
		    (event.action == this.Event.LOCK) ||
		    (event.action == this.Event.RELEASE))
		    ret = false;

		return ret; 
	},
	
	isContentMsg: function(msg)
	{
		if(msg && msg.updates)
		{ 
			var update = msg.updates[0];
			if (update.reference && update.reference.refType == "fragment")
				return false;
			return true;
		}
		else return false;
	},
	
	isEventChangeStruct: function(event)
	{
		return  event.reference.refType == this.Event.SCOPE_SHEET ||
		        ( (event.action == this.Event.ACTION_INSERT || event.action == this.Event.ACTION_DELETE) && 
		          (event.reference.refType == this.Event.SCOPE_ROW) || (event.reference.refType == this.Event.SCOPE_COLUMN) );
	},
	
	updateRanges: function(event,tIdManager)
	{
		if(event.action == this.Event.ACTION_DELETE && 
		  (event.reference.refType == this.Event.SCOPE_ROW || event.reference.refType == this.Event.SCOPE_COLUMN))
		{
			var refValue = event.reference.refValue;
			var parsedRef = websheet.Helper.parseRef(refValue);
			var sheetId = tIdManager.getSheetIdBySheetName(parsedRef.sheetName);
			var msgTransformer = this.docAgent.getMsgTransformer();
			var rangList = msgTransformer.getRangeList(true);
			var source = {};
			source.action = websheet.Constant.DataChange.PREDELETE;
			source.refValue = parsedRef;
			if(event.reference.refType == this.Event.SCOPE_ROW)
			{
				source.refType = websheet.Constant.OPType.ROW;
			}
			else
			{
				source.refType = websheet.Constant.OPType.COLUMN;
			}
			var e = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, source);
			rangList.notify(null,e);
		}
	},
	/*
	 * this function just used for updating start index in the internal object list
	 * @param{msg}   the message json
	 * @param{list}  the internal message list, an array
	 */
	updateStartIndex: function(event, list, tIdManager)
	{
		if(list == null)
			return;
		var length = list.length;
		if(event.reference.refType == this.Event.SCOPE_ROW)
		{
			var refValue = event.reference.refValue;
			var parsedRef = websheet.Helper.parseRef(refValue);
			var sheetId = tIdManager.getSheetIdBySheetName(parsedRef.sheetName);
			for(var i = 0; i < length; i++)
			{
				var msg = list[i].message;
				var msgSheetId = (msg.msgList[0]) ? msg.msgList[0].refTokenId.getSheetId() : null;
				if( msgSheetId == sheetId && msg.msgList[0] && msg.msgList[0] instanceof websheet.event.undo.InsertRowEvent)
				{
					var source = {};
					source.mode = websheet.Constant.MSGMode.NORMAL;
					source.refType = websheet.Constant.OPType.ROW;
					source.refValue = parsedRef;
					if(event.action == this.Event.ACTION_INSERT)
					{
						if(parsedRef.startRow <= msg.msgList[0]._startRowIndex)
						{
							//			msg.msgList[0]._startRowIndex++;
							source.action = websheet.Constant.DataChange.INSERT;
						}
					}
					else if(event.action == this.Event.ACTION_DELETE)
					{
						if(parsedRef.startRow < msg.msgList[0]._startRowIndex)
						{
//							msg.msgList[0]._startRowIndex--;
							source.action = websheet.Constant.DataChange.PREDELETE;
						}
					}
					if(source.action)
					{
						var e = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, source);
						msg.msgList[0].notify(null,e);
					}
				}
			}
		}
		else if(event.reference.refType == this.Event.SCOPE_COLUMN)
		{
			var refValue = event.reference.refValue;
			var parsedRef = websheet.Helper.parseRef(refValue);
			var sheetId = tIdManager.getSheetIdBySheetName(parsedRef.sheetName);
			for(var i = 0; i < length; i++)
			{
				var msg = list[i].message;
				var msgSheetId = (msg.msgList[0]) ? msg.msgList[0].refTokenId.getSheetId() : null;
				if( msgSheetId == sheetId && msg.msgList[0] && msg.msgList[0] instanceof websheet.event.undo.InsertColumnEvent)
				{
					var sColIndex = parsedRef.startCol;
					var source = {};
					source.mode = websheet.Constant.MSGMode.NORMAL;
					source.refType = websheet.Constant.OPType.COLUMN;
					source.refValue = parsedRef;
					if(event.action == this.Event.ACTION_INSERT)
					{
						if(sColIndex <= msg.msgList[0]._startColIndex)
						{
//							msg.msgList[0]._startColIndex++;
							source.action = websheet.Constant.DataChange.INSERT;
						}
					}
					else if(event.action == this.Event.ACTION_DELETE)
					{
						if(sColIndex < msg.msgList[0]._startColIndex)
						{
//							msg.msgList[0]._startColIndex--;
							source.action = websheet.Constant.DataChange.PREDELETE;
						}
					}
					if(source.action)
					{
						var e = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, source);
						msg.msgList[0].notify(null,e);
					}
				}
			}
		}
		else if(event.reference.refType == this.Event.SCOPE_SHEET)
		{
			var refValue = event.reference.refValue;
			var sheetName = refValue.split("|")[0];
			for(var i = 0; i < length; i++)
			{
				var msg = list[i].message;
				if(msg.msgList[0] && msg.msgList[0] instanceof websheet.event.undo.InsertSheetEvent)
				{
					var source = {};
					source.refType = websheet.Constant.OPType.SHEET;
					
					if(event.action == this.Event.ACTION_INSERT)
					{
						var index = event.data.sheet.sheetindex;
						if(index <=  msg.msgList[0]._sheetIndex)
						{
							msg.msgList[0]._sheetIndex++;
						}
					}
					else if(event.action == this.Event.ACTION_DELETE)
					{
						var index = refValue.split("|")[1];
						if(index < msg.msgList[0]._sheetIndex)
						{
//							msg.msgList[0]._sheetIndex--;
							source.action = websheet.Constant.DataChange.PREDELETE;
							source.refValue = sheetName ;
						}
					}
					else if(event.action == this.Event.ACTION_MOVE)
					{
						var srcIndex = refValue.split("|")[1];
						var delta = event.data.delta;
						var dstIndex = srcIndex + delta;
						var sheetIndex = msg.msgList[0]._sheetIndex;
						
						source.action = websheet.Constant.DataChange.PREMOVE;
						source.refValue = sheetName  + "|" + srcIndex + "|" + dstIndex;
//						if(srcIndex < sheetIndex && dstIndex >= sheetIndex)
//							msg.msgList[0]._sheetIndex--;
//						else if(srcIndex >= sheetIndex && dstIndex < sheetIndex)
//						    msg.msgList[0]._sheetIndex++;
					}
					if(source.action)
					{
						var e = new websheet.listener.NotifyEvent(websheet.Constant.EventType.DataChange, source);
						msg.msgList[0].notify(null,e);
					}
				}
			}
		}
	},
	
	transformEvent: function(incomingEvent,list)
	{
		this._localEventIdx = 0;
		incomingEvent.extraArray = [];
		//OTResult, 0 is default, 1 means use undo/redo, 2 means not apply, 3 resets client to force sync with server side
		incomingEvent.OTResult = 0;
		for (var index=0; index<list.length; index++)
		{
			this._index = index;
			var sendoutMsg = list[index];
			
			if(!this.isContentMsg(sendoutMsg) || sendoutMsg.isConflict) 
				continue;
			
			var sendoutMsg = list[index];
			this._message = sendoutMsg;
			var eventCnt = sendoutMsg.updates.length;
			for (var priorEventIndex=0; priorEventIndex<eventCnt; priorEventIndex++)
			{	
				var priorEvent = sendoutMsg.updates[priorEventIndex];
				//Tell OT process if the event is master or not
				priorEvent.bMaster = priorEventIndex==0;
				if(this.isOperationMsg(priorEvent) && this.isOperationMsg(incomingEvent))
					this.transform(priorEvent, incomingEvent);
				delete priorEvent.bMaster;
				
				// 2 means this incoming event will not be applied
				// 3 force sync this client
				if(incomingEvent.OTResult == 2 || incomingEvent.OTResult == 3)
					return;
				this._localEventIdx++;
			}
		}
	},	

	transformMsg: function(change, list) 
	{
		/*
		 * 1 construct temp IdManager ( use only one tmpIdManager)
		 * 2 backup the changeMsg, if changeMsg would change the doc structer, then 
		 * 3 undo message in list, at every step, got the middle id object
		 * 4 after implenment OT, on the temp idManager, aplly  changeMsg ,and redo the list msg, 
		 *   at every step, got the id->index msg
		 * notice, the ot may set some msg in the list as invalid, then need remove them from the list before step 4's translate
		 */
		var bakIncomingMsg = websheet.Helper.cloneJSON(change);
		var interList = null;
		var tIdManager = null;
		if(this.isEventChangeStruct(change.updates[0]))
		{
			var idManagerHelper = websheet.event.IDManagerHelper;
			var docAgent = websheet.event.DocumentAgent;
			tIdManager = docAgent.getModelStructure();
			tIdManager.bTrans = true;
			var msgTransformer = this.docAgent.getMsgTransformer();
			msgTransformer.resetRangeList4Trans(tIdManager);
			var length = list.length;
			interList = new Array(length);
			
			for(var i = length - 1; i >= 0; i--)
			{
				var dltIds = idManagerHelper.updateByEvents(tIdManager,list[i],true);
				var message =  new websheet.event.undo.Message(list[i],tIdManager);
				interList[i] = {};
				interList[i].message = message;
				interList[i].dltIds = dltIds;
			}
		}
		var localSendoutList = this.docAgent.getConnector().sendOutList;
		
		var incomingEventCnt = change.updates.length;
		for (var latterEventIndex=0; latterEventIndex<incomingEventCnt; latterEventIndex++)
		{
			var incomingEvent = change.updates[latterEventIndex];
			this._latterEventIndex = latterEventIndex;
			
			this.transformEvent(incomingEvent,list);
			
			var bakIncomingEvent = bakIncomingMsg.updates[latterEventIndex];
			//transform sendout messages
			if(this.isEventChangeStruct(bakIncomingEvent))
			{
				this.updateStartIndex(bakIncomingEvent,interList,tIdManager);
				this.updateRanges(bakIncomingEvent,tIdManager);
				
				idManagerHelper.updatebyEvent(tIdManager,bakIncomingEvent,false);
				docAgent.setTransFlag(true);
				var length = list.length;
				for(var i = 0; i < length; i++)
				{
					if(localSendoutList[i] && localSendoutList[i].isConflict)
					{ 
						list[i].isConflict = true;
						continue;
					}
					if(interList != null){
						var message = interList[i].message;
						message.setTransSendoutMsg(true);
						var newMsg = message.toJson();
						message.setTransSendoutMsg(false);
						if(this.isContentMsg(newMsg))
							list[i].updates = newMsg.updates;
						message.updateIDManager(tIdManager,false,interList[i].dltIds);
						message.clear();
					}
				}
				docAgent.setTransFlag(false);
			}
		}
		
		var undoredo = false;
		for (var i=incomingEventCnt-1; i>=0; i--)
		{
			var incomingEvent = change.updates[i];
			if(incomingEvent.OTResult==2)
			{
				change.updates.splice(i,1);
				bakIncomingMsg.updates.splice(i,1);
			}
			else if(incomingEvent.OTResult==1)
			{
				undoredo = true;
			}
			else if (incomingEvent.OTResult == 3) {
				throw this.getOTManager()._INCONSIS_ERR;
			}
		}
		
		var len = change.updates.length;
		//discard the message
		if(len==0)
		{
			return;
		}
		
		if(undoredo)
		{
			//Undo stack capacity is 20. So if more than 20 messages need undo/redo, undo stack can't work.
			//Use reload to sync with server in this case
			if(localSendoutList.length>websheet.Constant.MaxUndoStackSize)
				throw this.getOTManager()._INCONSIS_ERR;
			
			this.getOTManager().perform(0,bakIncomingMsg);
			change.updates = [];
		}
		else
		{
			//get extra
			var localIdx = 0;
			for (var index=0; index<list.length; index++)
			{
				var localMsg = list[index];
				//some messages, such as comments control, not have updates
				if(!localMsg.updates) continue;
				for(var i=0;i<localMsg.updates.length;i++)
				{
					if(!localMsg.isConflict)
					{
						for(var j=0;j<len;j++)
						{
							var extra = change.updates[j].extraArray[localIdx];
							if(extra)
								change.updates.push(extra);
						}
					}
					localIdx++;
				}
			}
		}
	},
	
	// remove action in the undo manager
	removeAction: function()
	{
		var msgList = this.docAgent.getConnector().getSendOutList();
		
		var msgId = null;
		if(this._index < msgList.length)
			msgId = msgList[this._index].id;
		if(msgId)
			this.docAgent.removeUndoActionById(msgId);
	},
	
	preHandleDltSheet: function(prior, latter)
	{
		var priorRefType = prior.reference.refType;
		var priorActon = prior.action;
		var latterRefType = latter.reference.refType;
		var latterAction = latter.action;
		try
		{
			// prior is delete sheet and latter is not delete sheet
			// need undo it's own action and redo the latter, 
			if(priorRefType == this.Event.SCOPE_SHEET && priorActon == this.Event.ACTION_DELETE
			  && (!(latterRefType == this.Event.SCOPE_SHEET && latterAction == this.Event.ACTION_DELETE)))
			{
				var priorSheetName = prior.reference.refValue.split("|")[0];
				var latterValue = latter.reference.refValue;
				var latterSheetName = (latterRefType == this.Event.SCOPE_SHEET)? latterValue.split("|")[0] : websheet.Helper.parseRef(latterValue).sheetName;
				if(priorSheetName == latterSheetName)
					this.getOTManager().perform(this._index,{updates:[latter]});
			}
			// latter is delete sheet and prior is not 
			// need undo it's own action
			else if(latterRefType == this.Event.SCOPE_SHEET && latterAction == this.Event.ACTION_DELETE
			  && (!(priorRefType == this.Event.SCOPE_SHEET && priorActon == this.Event.ACTION_DELETE)))
			{
				var latterSheetName = latter.reference.refValue.split("|")[0];
				var priorValue = prior.reference.refValue;
				var priorSheetName = (priorRefType == this.Event.SCOPE_SHEET)? priorValue.split("|")[0] : websheet.Helper.parseRef(priorValue).sheetName;
				if(priorSheetName == latterSheetName)
					this.getOTManager().perform(this._index);
			}
		}catch(e)
		{
			console.log("error happend in ot delete sheet" + e);
		}
	},
	 	
	 	
	transform: function(prior, latter)
	{
		this.preHandleDltSheet(prior, latter);
		var priorRefType = prior.reference.refType;
		var latterRefType = latter.reference.refType;
		
		if ((priorRefType == this.Event.SCOPE_SHEET)&&
				(latterRefType == this.Event.SCOPE_SHEET))
			this.transformSheetSheet(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_ROW)&&
				(latterRefType == this.Event.SCOPE_ROW))
			this.transformRowsRows(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_ROW)&&
				(latterRefType == this.Event.SCOPE_COLUMN))
			this.transformRowCol(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_COLUMN)&&
				(latterRefType == this.Event.SCOPE_COLUMN))
			this.transformColCol(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_CELL)&&
				(latterRefType == this.Event.SCOPE_CELL))
			this.transformCellCell(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_CELL)&&
				(latterRefType == this.Event.SCOPE_ROW))
			this.transformCellRow(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_CELL)&&
				(latterRefType == this.Event.SCOPE_COLUMN))
			this.transformCellCol(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_ROW)&&
				(latterRefType == this.Event.SCOPE_CELL))
			this.transformRowCell(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_COLUMN)&&
				(latterRefType == this.Event.SCOPE_CELL))
			this.transformColCell(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_ROW)&&
				(latterRefType == this.Event.SCOPE_SHEET))
			this.transformRowSheet(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_COLUMN)&&
				(latterRefType == this.Event.SCOPE_SHEET))
			this.transformColSheet(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_SHEET)&&
				(latterRefType == this.Event.SCOPE_ROW))
			this.transformSheetRow(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_SHEET)&&
				(latterRefType == this.Event.SCOPE_COLUMN))
			this.transformSheetCol(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_CELL)&&
				(latterRefType == this.Event.SCOPE_SHEET))
			this.transformCellSheet(prior, latter);
		else if ((priorRefType == this.Event.SCOPE_SHEET)&&
				(latterRefType == this.Event.SCOPE_CELL))
			this.transformSheetCell(prior, latter);
		else if  ((priorRefType == this.Event.SCOPE_COLUMN)&&
				(latterRefType == this.Event.SCOPE_ROW))
			this.transformColRow(prior, latter);
		else if  ((priorRefType == this.Event.SCOPE_NAMERANGE) || 
				(latterRefType == this.Event.SCOPE_NAMERANGE)  ||
				(priorRefType == this.Event.SCOPE_UNNAMERANGE) || 
				(latterRefType == this.Event.SCOPE_UNNAMERANGE))
			this.transformRange(prior, latter);
		else if  (priorRefType == this.Event.SCOPE_RANGE || 
				latterRefType == this.Event.SCOPE_RANGE)
			this.transformRangeInfo(prior, latter);
		else if(priorRefType == this.Event.SCOPE_ROW && 
				latterRefType == this.Event.SCOPE_CHART)
			this.transformRowsChart(prior, latter);
		else if(priorRefType == this.Event.SCOPE_CHART && 
				latterRefType == this.Event.SCOPE_ROW)
			this.transformChartRows(prior, latter);
		else if(priorRefType == this.Event.SCOPE_COLUMN && 
				latterRefType == this.Event.SCOPE_CHART)
			this.transformColsChart(prior, latter);
		else if(priorRefType == this.Event.SCOPE_CHART && 
				latterRefType == this.Event.SCOPE_COLUMN)
			this.transformChartCols(prior, latter);			
		else if(priorRefType == this.Event.SCOPE_SHEET && 
				latterRefType == this.Event.SCOPE_CHART)
			this.transformSheetChart(prior, latter);
		else if(priorRefType == this.Event.SCOPE_CHART && 
				latterRefType == this.Event.SCOPE_CHART)
			this.transformChartChart(prior, latter);
		else
		{
			console.log("a strange type of event that is not handled by transform");
		}
		
		if(prior.action == this.Event.ACTION_FREEZE && latter.action == this.Event.ACTION_FREEZE )
			this.transformFreezeFreeze(prior, latter);
	},
	
	
	transformFreezeFreeze: function(prior, latter)
	{
		var prefValue  = prior.reference.refValue; 
		var pSheetName = null, pType = prior.reference.refType;
		if(pType == this.Event.SCOPE_SHEET)
		{
			pSheetName = prefValue;
			pType = prior.data.row == true ? this.Event.SCOPE_ROW : this.Event.SCOPE_COLUMN;
		}
		else
		{
			var pRef = websheet.Helper.parseRef(prior.reference.refValue);
			pSheetName = pRef.sheetName;
		}	
		
		var lrefValue  = latter.reference.refValue;
		var lSheetName = null, lType = latter.reference.refType;
		if(lType == this.Event.SCOPE_SHEET)
		{
			lSheetName = lrefValue;
			lType = latter.data.row == true ? this.Event.SCOPE_ROW : this.Event.SCOPE_COLUMN;
		}	
		else
		{
			var lRef = websheet.Helper.parseRef(latter.reference.refValue);
			lSheetName = lRef.sheetName;
		}	
		if(pSheetName == lSheetName && pType == lType)
		{
			latter.OTResult=2;
		}	
	},
	
	transformSheetSortRange:function(prior,latter)
	{
		var prefValue  = prior.reference.refValue;
		var priorSheetName = websheet.Helper.handleRefValue(prefValue,this.Event.SCOPE_SHEET);
		if(prior.action == this.Event.ACTION_DELETE)
		{
			var lrefValue  = latter.reference.refValue;
			var handledLatRef = lrefValue;
			var parsedLatRef = websheet.Helper.parseRef(handledLatRef);
			
			var latterSheetName = parsedLatRef.sheetName;
            if (priorSheetName == latterSheetName)
				latter.OTResult=2;
		}
		else if(prior.action == this.Event.ACTION_SET){
			var oldSheetName = priorSheetName;
			var newSheetName = prior.data.sheet.sheetname;
			//not rename sheet
			if (newSheetName == undefined)
				return;
			var lrefValue  = latter.reference.refValue;
			var parsedLatRef = websheet.Helper.parseRef(lrefValue);
			if(oldSheetName == parsedLatRef.sheetName){
				var index = lrefValue.split(":")[0].lastIndexOf("!");
				var newRefValue = lrefValue.substring(index);
				newRefValue = newSheetName + newRefValue;
				latter.reference.refValue = newRefValue;								
			}
		}
	},
	
	transformRowSortRange:function(prior, latter)
	{
		var pRef = websheet.Helper.parseRef(prior.reference.refValue);
		var lRef = websheet.Helper.parseRef(latter.reference.refValue);
		if(pRef.sheetName != lRef.sheetName)
			return;
		
		var pStartRow = pRef.startRow;
		var pEndRow = pRef.endRow;
		var lStartRow = lRef.startRow;
		var lEndRow = lRef.endRow;
		var needOT = false;
		
		if (prior.action == this.Event.ACTION_INSERT) 
		{
			//If insert row changes the sort range index, OT
			if(pStartRow<=lEndRow)
				needOT = true;
		}
		else if (prior.action == this.Event.ACTION_DELETE)
		{
			//If sort range are all deleted, ignore the incoming message
			if(pStartRow<=lStartRow && pEndRow>=lEndRow)
			{
				latter.OTResult=2;
				return;
			}
			else if(pStartRow<=lEndRow)
				needOT = true;
		}
		else if(prior.action == this.Event.ACTION_CLEAR || prior.action == this.Event.ACTION_SET)
		{
			//Set or clear range has interact with sort range
			if(!(pStartRow>lEndRow || pEndRow<lStartRow))
				needOT = true;
		}
		if(needOT)
		{
			latter.OTResult=1;
		}
	},
	
	transformSortRangeRow:function(prior, latter)
	{
		var pRef = websheet.Helper.parseRef(prior.reference.refValue);
		var lRef = websheet.Helper.parseRef(latter.reference.refValue);
		if(pRef.sheetName != lRef.sheetName)
			return;
		
		var pStartRow = pRef.startRow;
		var pEndRow = pRef.endRow;
		var lStartRow = lRef.startRow;
		var lEndRow = lRef.endRow;
		
//      SortMsg.java of server side has transformed the sortResult array to make it consistent in all clients and server.
//		if (latter.action == this.Event.ACTION_INSERT) 
//		{
//			if(lStartRow<=pEndRow){
//				latter.OTResult=1;
//			}
//		}
//		else
		if (latter.action == this.Event.ACTION_DELETE)
		{
			if(lStartRow<=pStartRow && lEndRow>=pEndRow)
			{
				//If all the sort range are deleted, no OT
			}
			else if(lStartRow<=pEndRow){
				latter.OTResult=1;
			}
		}
		else if(latter.action == this.Event.ACTION_CLEAR || latter.action == this.Event.ACTION_SET)
		{
			// clear and set will not change id manager, so we use original event for redo
			if(!(lStartRow>pEndRow || lEndRow<pStartRow))
			{
				latter.OTResult=1;
			}
		}
	},
	transformSortRangeColumn: function(prior, latter)
	{
		var pRef = websheet.Helper.parseRef(prior.reference.refValue);
		var lRef = websheet.Helper.parseRef(latter.reference.refValue);
		if(pRef.sheetName != lRef.sheetName) return;
		
		var pStartCol = pRef.startCol;
		var pEndCol = pRef.endCol;
		var lStartCol = lRef.startCol;
		var lEndCol = lRef.endCol;
		
		if( latter.action == this.Event.ACTION_INSERT)
		{
			if(lStartCol <= pEndCol+1)
				latter.OTResult=1;	
		}	
		else if(latter.action == this.Event.ACTION_DELETE)
		{
			if(lStartCol <= pEndCol)
				latter.OTResult=1;	
			if(pStartCol >= lStartCol && pEndCol <= lEndCol)
        	{
				delete latter.OTResult;
				this.getOTManager().conflictResolve(this._index);
        	}	
		}	
		else if(latter.action == this.Event.ACTION_SET && latter.data.rows)
		{
			if (!(lEndCol < pStartCol || lStartCol > pEndCol))
				latter.OTResult=1;
		}
	},
	
	transformColumnSortRange:function(prior, latter)
	{
		var pRef = websheet.Helper.parseRef(prior.reference.refValue);
		var lRef = websheet.Helper.parseRef(latter.reference.refValue);
		if(pRef.sheetName != lRef.sheetName) return;
		
		var pStartCol = pRef.startCol;
		var pEndCol = pRef.endCol;
		var lStartCol = lRef.startCol;
		var lEndCol = lRef.endCol;
		
		if( prior.action == this.Event.ACTION_INSERT)
		{
			if(pStartCol <= lEndCol+1)
				latter.OTResult=1;	
		}	
		else if(prior.action == this.Event.ACTION_DELETE)
		{
			if(pStartCol <= lEndCol)
				latter.OTResult=1;	
			if(lStartCol >= pStartCol && lEndCol <= pEndCol)
        		latter.OTResult=2;
		}	
		else if(prior.action == this.Event.ACTION_SET && prior.data.rows)
		{
			if (!(lEndCol < pStartCol || lStartCol > pEndCol))
				latter.OTResult=1;
		}	
	},
	
	transformCellSortRange:function(prior, latter)
	{
		var sortRef = websheet.Helper.parseRef(latter.reference.refValue);
		var cellRef = websheet.Helper.parseRef(prior.reference.refValue);
		if(!sortRef || !cellRef || sortRef.sheetName != cellRef.sheetName)
			return;
		
		var lStartRow = sortRef.startRow;
		var lEndRow = sortRef.endRow;
		var lStartCol = sortRef.startCol;
		var lEndCol = sortRef.endCol;
		
		var pRow = cellRef.startRow;
		var pCol = cellRef.startCol;
		if(pRow>=lStartRow && pRow<=lEndRow && pCol>=lStartCol && pCol<=lEndCol)
		{
			latter.OTResult=1;
		}
	},
	
	transformSortRangeCell:function(prior, latter){
		var lRangeInfo = websheet.Helper.getRangeInfoByRef(latter.reference.refValue);
		var pRangeInfo = websheet.Helper.getRangeInfoByRef(prior.reference.refValue);
		if(pRangeInfo.sheetName == lRangeInfo.sheetName && websheet.Helper.compareRange(pRangeInfo, lRangeInfo) == websheet.Constant.RangeRelation.SUPERSET){
			latter.OTResult=1;
		}
	},
	
	transformSortRanges:function(prior, latter)
	{
		var lRangeInfo = websheet.Helper.getRangeInfoByRef(latter.reference.refValue);
		var pRangeInfo = websheet.Helper.getRangeInfoByRef(prior.reference.refValue);
		if(pRangeInfo.sheetName == lRangeInfo.sheetName && websheet.Helper.compareRange(lRangeInfo, pRangeInfo) != websheet.Constant.RangeRelation.NOINTERSECTION)
		{
			latter.OTResult=1;
		}
	},
	
	transformSortUnnamedRange: function(prior, latter) 
	{
		var pRangeInfo = websheet.Helper.getRangeInfoByRef(prior.reference.refValue);
		var lRangeInfo = websheet.Helper.getRangeInfoByRef(latter.reference.refValue);
		var relation = websheet.Helper.compareRange(pRangeInfo, lRangeInfo);
		if (relation != websheet.Constant.RangeRelation.NOINTERSECTION) 
		{
		    var priorAction = prior.action;
	        var latterAction = latter.action;
		    if(priorAction == this.Event.ACTION_SORT && (latterAction == this.Event.ACTION_MERGE || latterAction == this.Event.ACTION_SPLIT))
	        {
		    	this.getOTManager().perform(this._index);
	        }
		    else
		    	latter.OTResult=1;
		}
	},

/*Filter*/
	transformSheetFilterRange:function(prior,latter)
	{
		var prefValue  = prior.reference.refValue;
		var priorSheetName = websheet.Helper.handleRefValue(prefValue,this.Event.SCOPE_SHEET);
		if(prior.action == this.Event.ACTION_DELETE)
		{
			var lrefValue  = latter.reference.refValue;
			var handledLatRef = lrefValue;
			var parsedLatRef = websheet.Helper.parseRef(handledLatRef);
			
			var latterSheetName = parsedLatRef.sheeNamet;
            if (priorSheetName == latterSheetName)
				latter.OTResult=2;
		}
		else if(prior.action == this.Event.ACTION_SET){
			var oldSheetName = priorSheetName;
			var newSheetName = prior.data.sheet.sheetname;
			//not rename sheet
			if (newSheetName == undefined)
				return;
			var lrefValue  = latter.reference.refValue;
			var parsedLatRef = websheet.Helper.parseRef(lrefValue);
			if(oldSheetName == parsedLatRef.sheetName){
				var index = lrefValue.split(":")[0].lastIndexOf("!");
				var newRefValue = lrefValue.substring(index);
				newRefValue = newSheetName + newRefValue;
				latter.reference.refValue = newRefValue;								
			}
		}
	},
	
	transformRowFilterRange:function(prior, latter)
	{
		if (prior.action == this.Event.ACTION_DELETE || prior.action == this.Event.ACTION_INSERT) 
		{
			var pRef = websheet.Helper.parseRef(prior.reference.refValue);
			var lRef = websheet.Helper.parseRef(latter.reference.refValue);
			if(pRef.sheetName == lRef.sheetName)
			{
				var lEndRow = lRef.endRow || lRef.startRow;
				if(pRef.startRow <= lEndRow)
					latter.OTResult = 1;
			}
		}
	},
	
	transformFilterRangeRow:function(prior, latter){
	},
	
	transformColumnFilterRange:function(prior, latter){
		if (prior.action == this.Event.ACTION_DELETE || prior.action == this.Event.ACTION_INSERT) 
		{
			var pRef = websheet.Helper.parseRef(prior.reference.refValue);
			var lRef = websheet.Helper.parseRef(latter.reference.refValue);
			
			if(pRef.sheetName == lRef.sheetName)
			{
				var pStartCol = pRef.startCol;
				var lEndCol = lRef.endCol;
				if(pStartCol <= lEndCol)
					latter.OTResult = 1;
			}
		}
	},
	
	transformCellFilterRange:function(prior, latter){
	},
	
	transformFilterRangeCell:function(prior, latter){
	},
	
	transformFilterRanges:function(prior, latter)
	{
		var pRef = websheet.Helper.parseRef(prior.reference.refValue);
		var lRef = websheet.Helper.parseRef(latter.reference.refValue);
		
		if(pRef.sheetName == lRef.sheetName)
		{
			this.getOTManager().perform(this._index);
		}
	},
	
	transformFilterUnnamedRange: function(prior, latter) {
		var pRangeInfo = websheet.Helper.getRangeInfoByRef(prior.reference.refValue);
		var lRangeInfo = websheet.Helper.getRangeInfoByRef(latter.reference.refValue);
		var relation = websheet.Helper.compareRange(pRangeInfo, lRangeInfo);
		if (relation != websheet.Constant.RangeRelation.NOINTERSECTION) {
			latter.OTResult=1;
		}
	},

	/*
	 * section {start, end} start and end are integers
	 * get the new section1 position after delete section2
	 * ret {start, end} if start and end both equal -1, it means section1 has been deleted
	 */
	_getSectionAfterDelete: function(section1, section2)
	{
		var ret = {};
		var deleteCnt = section2.end - section2.start + 1;
		// handle start
		if(section1.start > section2.end)
		{
			ret.start = section1.start - deleteCnt;
		}
		else if(section1.start >= section2.start && section1.start <= section2.end)
		{
			ret.start = -1;
		}
		else
		{
			ret.start = section1.start;
		}
		// handle end
		if(section1.end > section2.end)
		{
			ret.end = section1.end - deleteCnt;
		}
		else if(section1.end >= section2.start && section1.end <= section2.end)
		{
			ret.end = -1;
		}
		else
		{
			ret.end = section1.end;
		}
		
		if(ret.start == -1 && ret.end != -1)
		{
			ret.start = section2.start;
		}
		else if(ret.start != -1 && ret.end == -1)
		{
			ret.end = section2.start -1;
		}
		
		return ret;
	},
	
	transformMergeSplit: function(prior, latter)
	{
		var priorAction = prior.action;
		var latterAction = latter.action;
		var priorRefType = prior.reference.refType;
		var latterRefType = latter.reference.refType;
		var mHelper = websheet.model.ModelHelper;
		var pRangeInfo = websheet.Helper.getRangeInfoByRef(prior.reference.refValue,priorRefType);
		var lRangeInfo = websheet.Helper.getRangeInfoByRef(latter.reference.refValue,latterRefType);
		var params = {refMask : websheet.Constant.RANGE_MASK};
		
		if(pRangeInfo.sheetName != pRangeInfo.sheetName) return;
		if(priorAction == this.Event.ACTION_MERGE)
		{
			if(latterAction == this.Event.ACTION_MERGE )
			{
				if(websheet.Helper.compareRange(pRangeInfo,lRangeInfo) != websheet.Constant.RangeRelation.NOINTERSECTION)
					this.getOTManager().perform(this._index);
			}
			else if(latterAction == this.Event.ACTION_SPLIT)
			{
				if(websheet.Helper.compareRange(pRangeInfo,lRangeInfo) != websheet.Constant.RangeRelation.NOINTERSECTION)
					latter.OTResult=1;
			}
			else if(latterAction == this.Event.ACTION_INSERT)
			{
				if(latterRefType == this.Event.SCOPE_ROW)
				{
					if(lRangeInfo.startRow > pRangeInfo.startRow && lRangeInfo.startRow <= pRangeInfo.endRow)
					{
						var tmpRef = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,lRangeInfo.startRow, pRangeInfo.startCol,null,
													 lRangeInfo.endRow, pRangeInfo.endCol,params);
						var event = new websheet.event.MergeCells(tmpRef);
						latter.extraArray[this._localEventIdx] = event.getMessage().updates[0];
					}
				}
			}
			else if(latterAction == this.Event.ACTION_DELETE)
			{
				if(latterRefType == this.Event.SCOPE_ROW)
				{
					if(lRangeInfo.startRow <= pRangeInfo.startRow && lRangeInfo.endRow >= pRangeInfo.endRow)
					{
						this.getOTManager().conflictResolve(this._index);
					}
				}
				else if(latterRefType == this.Event.SCOPE_COLUMN)
				{
					if (lRangeInfo.startCol <= pRangeInfo.startCol && lRangeInfo.endCol >= pRangeInfo.endCol) 
					{
						this.getOTManager().conflictResolve(this._index);
					} 
					else if (lRangeInfo.startCol <= pRangeInfo.startCol && lRangeInfo.endCol >= pRangeInfo.startCol) 
					{
						var colSpan = pRangeInfo.endCol - pRangeInfo.startCol ;
						var dltCnt = lRangeInfo.endCol - pRangeInfo.startCol + 1;
						if(dltCnt < colSpan)
						{
							var endCol = colSpan - dltCnt + lRangeInfo.startCol;
							var tmpRef = websheet.Helper.getAddressByIndex(pRangeInfo.sheetName,pRangeInfo.startRow, lRangeInfo.startCol,null,pRangeInfo.endRow, endCol,params);
							var event = new websheet.event.MergeCells(tmpRef);
							latter.extraArray[this._localEventIdx] = event.getMessage().updates[0];
						}	
					}
				}
				else if(latterRefType == this.Event.SCOPE_SHEET)
				{
					this.getOTManager().conflictResolve(this._index);
				}
			}
			else if(latterAction == this.Event.ACTION_SET)
			{
				if(latterRefType == this.Event.SCOPE_UNNAMERANGE)
				{
					if(!latter.data.bR) return;
					if(websheet.Helper.compareRange(pRangeInfo,lRangeInfo)!= websheet.Constant.RangeRelation.NOINTERSECTION)
					{
						latter.extraArray[this._localEventIdx] = prior;
					}
				}
			}
		}
		else if(priorAction == this.Event.ACTION_SPLIT)
		{
			if(latterAction == this.Event.ACTION_MERGE)
			{
				if(websheet.Helper.compareRange(pRangeInfo,lRangeInfo) != websheet.Constant.RangeRelation.NOINTERSECTION)
				{
					if(lRangeInfo.startRow >= pRangeInfo.startRow && lRangeInfo.endRow <= pRangeInfo.endRow)
					{
						latter.OTResult=2;
					}
					else
					{
						var startRow = (lRangeInfo.startRow >= pRangeInfo.startRow && lRangeInfo.startRow <= pRangeInfo.endRow)? pRangeInfo.endRow+1: lRangeInfo.startRow;
						var endRow = (lRangeInfo.endRow >= pRangeInfo.startRow && lRangeInfo.endRow <= pRangeInfo.endRow)? pRangeInfo.startRow-1: lRangeInfo.endRow;
						if(lRangeInfo.startCol >= pRangeInfo.startCol && lRangeInfo.startCol <= pRangeInfo.endCol)
						{
							latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,startRow,lRangeInfo.startCol, null,
							        						endRow, lRangeInfo.endCol,params);
						}
					}
				}
			}
			else if(latterAction == this.Event.ACTION_DELETE)
			{
				var bResolveConflict = false;
				if(latterRefType == this.Event.SCOPE_ROW)
				{
					if(lRangeInfo.startRow <= pRangeInfo.startRow && lRangeInfo.endRow >= pRangeInfo.endRow)
						bResolveConflict = true;
				}
				else if(latterRefType == this.Event.SCOPE_COLUMN)
				{
					if(lRangeInfo.startCol <= pRangeInfo.startCol && lRangeInfo.endCol >= pRangeInfo.endCol)
						bResolveConflict = true;
				}
				else if(latterRefType == this.Event.SCOPE_SHEET)
				{
					bResolveConflict = true;
				}
				if(bResolveConflict) 
					this.getOTManager().conflictResolve(this._index);
			}
		}
		
		if(latterAction == this.Event.ACTION_MERGE)
		{
			 if(priorAction == this.Event.ACTION_INSERT)
			{
				if(priorRefType == this.Event.SCOPE_ROW)
				{
					var insertRowCnt = pRangeInfo.endRow - pRangeInfo.startRow + 1;
					// should split the merge into two parts
					if(pRangeInfo.startRow > lRangeInfo.startRow && pRangeInfo.startRow <= lRangeInfo.endRow)
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex( lRangeInfo.sheetName,lRangeInfo.startRow,
									lRangeInfo.startCol,null,(pRangeInfo.startRow -1),lRangeInfo.endCol,params);
						var tmpRef = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,(pRangeInfo.endRow+1),
										lRangeInfo.startCol,null, (lRangeInfo.endRow+insertRowCnt),lRangeInfo.endCol,params);
						var event = new websheet.event.MergeCells(tmpRef);
						latter.extraArray[this._localEventIdx] = event.getMessage().updates[0];
					}
					// the insert row before the merge rows
					else if(pRangeInfo.startRow <= lRangeInfo.startRow )
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,(lRangeInfo.startRow + insertRowCnt),
								lRangeInfo.startCol, null, (lRangeInfo.endRow + insertRowCnt),lRangeInfo.endCol,params);
					}
				}
				else if(priorRefType == this.Event.SCOPE_COLUMN)
				{
					var insertColCnt = pRangeInfo.endCol - pRangeInfo.startCol + 1;
					if(pRangeInfo.startCol <= lRangeInfo.startCol)
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,lRangeInfo.startRow ,
								(lRangeInfo.startCol + insertColCnt),null, lRangeInfo.endRow, (lRangeInfo.endCol + insertColCnt),params);
					}
					else if(pRangeInfo.startCol > lRangeInfo.startCol && pRangeInfo.startCol <= lRangeInfo.endCol)
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,lRangeInfo.startRow ,
							lRangeInfo.startCol, null, lRangeInfo.endRow, (lRangeInfo.endCol + insertColCnt),params);
					}
				}
			}
			else if(priorAction == this.Event.ACTION_DELETE)
			{
				if(priorRefType == this.Event.SCOPE_ROW)
				{
					if(pRangeInfo.startRow <= lRangeInfo.startRow && pRangeInfo.endRow >= lRangeInfo.startRow){
						latter.OTResult=2;
					}else{
						var ret = this._getSectionAfterDelete({start:lRangeInfo.startRow,end:lRangeInfo.endRow},{start:pRangeInfo.startRow,end:pRangeInfo.endRow});
						if(ret.start == -1 && ret.end == -1)
						{
							latter.OTResult=2;
						}else
						{
							latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName, ret.start,
									 lRangeInfo.startCol,null, ret.end,lRangeInfo.endCol,params);
						}
					}
				}
				else if(priorRefType == this.Event.SCOPE_COLUMN)
				{
					var deltCount = pRangeInfo.endCol - pRangeInfo.startCol + 1;
					if(pRangeInfo.startCol < lRangeInfo.startCol)
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName, lRangeInfo.startRow,
								 (lRangeInfo.startCol-deltCount),null, lRangeInfo.endRow,(lRangeInfo.endCol-deltCount),params );
					}
					else if(pRangeInfo.startCol == lRangeInfo.startCol)
					{
						latter.OTResult=2;
					}
					else if(pRangeInfo.startCol > lRangeInfo.startCol && pRangeInfo.startCol <= lRangeInfo.endCol)
					{
						var delta = Math.max(Math.min(pRangeInfo.endCol, lRangeInfo.endCol) - pRangeInfo.startCol + 1, 1);
						latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName, lRangeInfo.startRow,
								 lRangeInfo.startCol,null, lRangeInfo.endRow,(lRangeInfo.endCol - delta),params );
					}
				}
				else if(priorRefType == this.Event.SCOPE_SHEET)
				{
					latter.OTResult=2;
				}
			}
			else if(priorAction == this.Event.ACTION_SET)
			{
				if(priorRefType == this.Event.SCOPE_SHEET)
				{
					var newSheetName = prior.data.sheet.sheetname;
					//rename sheet
					if (newSheetName != undefined)						
						latter.reference.refValue = latter.reference.refValue.replace(lRangeInfo.sheetName,newSheetName);
				}
				else if(priorRefType == this.Event.SCOPE_UNNAMERANGE)
				{
					if(!prior.data.bR) return;
					var relation = websheet.Helper.compareRange(pRangeInfo,lRangeInfo);
					if(relation == websheet.Constant.RangeRelation.NOINTERSECTION) return;
					if(pRangeInfo.startRow<=lRangeInfo.startRow && pRangeInfo.endRow>= lRangeInfo.endRow)
					{
						latter.OTResult=2;
					}
					else if(lRangeInfo.startRow < pRangeInfo.startRow && lRangeInfo.endRow <= pRangeInfo.endRow)
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,
							lRangeInfo.startRow,lRangeInfo.startCol, null, pRangeInfo.startRow-1,lRangeInfo.endCol,params);
					}
					else if(lRangeInfo.endRow > pRangeInfo.endRow && lRangeInfo.startRow >= pRangeInfo.startRow)
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,
							pRangeInfo.endRow+1,lRangeInfo.startCol, null, lRangeInfo.endRow,lRangeInfo.endCol,params);
					}
					else if(lRangeInfo.startRow < pRangeInfo.startRow && lRangeInfo.endRow > pRangeInfo.endRow)
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,
							lRangeInfo.startRow,lRangeInfo.startCol, null, pRangeInfo.startRow-1,lRangeInfo.endCol,params);
						var extra = websheet.Helper.cloneJSON(latter);
						extra.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,
							pRangeInfo.endRow+1,lRangeInfo.startCol, null, lRangeInfo.endRow,lRangeInfo.endCol,params);
						
						latter.extraArray[this._localEventIdx] = extra;
					}
				}
			}
		}
		else if(latterAction == this.Event.ACTION_SPLIT)
		{
			if(priorAction == this.Event.ACTION_INSERT)
			{
				if(priorRefType == this.Event.SCOPE_ROW)
				{
					var insertRowCnt = pRangeInfo.endRow - pRangeInfo.startRow + 1;
					// insert before the split rows
					if(pRangeInfo.startRow <= lRangeInfo.startRow )
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,(lRangeInfo.startRow + insertRowCnt),
								lRangeInfo.startCol, null, (lRangeInfo.endRow + insertRowCnt),lRangeInfo.endCol,params);
					}
					else if(pRangeInfo.startRow > lRangeInfo.startRow && pRangeInfo.startRow <= lRangeInfo.endRow)
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex( lRangeInfo.sheetName,lRangeInfo.startRow,
									lRangeInfo.startCol, null, (pRangeInfo.startRow -1),lRangeInfo.endCol,params);
						var tmpRef = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,(pRangeInfo.endRow+1),
										lRangeInfo.startCol, null, (lRangeInfo.endRow+insertRowCnt),lRangeInfo.endCol,params);
						var event = new websheet.event.SplitCells(tmpRef);
						latter.extraArray[this._localEventIdx] = event.getMessage().updates[0];
					}
				}
				else if(priorRefType == this.Event.SCOPE_COLUMN)
				{
					var insertColCnt = pRangeInfo.endCol - pRangeInfo.startCol + 1;
					if(pRangeInfo.startCol <= lRangeInfo.startCol)
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,lRangeInfo.startRow ,
								(lRangeInfo.startCol + insertColCnt), null, lRangeInfo.endRow, (lRangeInfo.endCol + insertColCnt),params);
					}
				}
			}
			else if(priorAction == this.Event.ACTION_DELETE)
			{
				if(priorRefType == this.Event.SCOPE_ROW)
				{
					var ret = this._getSectionAfterDelete({start:lRangeInfo.startRow,end:lRangeInfo.endRow},{start:pRangeInfo.startRow,end:pRangeInfo.endRow});
					if(ret.start == -1 && ret.end == -1)
					{
						latter.OTResult=2;
					}
					else
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName, ret.start,
								 lRangeInfo.startCol, null, ret.end,lRangeInfo.endCol,params );
					}
				}
				else if(priorRefType == this.Event.SCOPE_COLUMN)
				{
					var ret = this._getSectionAfterDelete({start:lRangeInfo.startCol,end: lRangeInfo.endCol},{start:pRangeInfo.startCol, end: pRangeInfo.endCol});
					if(ret.start == -1 && ret.end == -1)
					{
						latter.OTResult=2;
					}
					else{
						latter.reference.refValue = websheet.Helper.getAddressByIndex(lRangeInfo.sheetName,lRangeInfo.startRow, ret.start,null,
								 lRangeInfo.endRow,ret.end,params );
					}
				}
				else if(priorRefType == this.Event.SCOPE_SHEET)
				{
					latter.OTResult=2;
				}
			}
			else if(priorAction == this.Event.ACTION_SET)
			{
				if(priorRefType == this.Event.SCOPE_SHEET)
				{
					var newSheetName = prior.data.sheet.sheetname;
					//rename sheet
					if (newSheetName != undefined)
						latter.reference.refValue = latter.reference.refValue.replace(lRangeInfo.sheetName,newSheetName);
				}
			}
		}
	},
	
	transformRangeInfo:function(prior, latter){
		var priorRefType = prior.reference.refType;
		var latterRefType = latter.reference.refType;
		var priorAction = prior.action;
		var latterAction = latter.action;

		if( priorRefType == this.Event.SCOPE_SHEET && latterRefType == this.Event.SCOPE_RANGE && latterAction != this.Event.ACTION_DELETE)
		{
			this.transformSheetRange(prior, latter);
		}
		else if(priorRefType == this.Event.SCOPE_RANGE && priorAction != this.Event.ACTION_DELETE && latterRefType == this.Event.SCOPE_SHEET )	
		{
			this.transformRangeSheet(prior, latter);				
		}		
		else if(priorRefType == this.Event.SCOPE_ROW && latterRefType == this.Event.SCOPE_RANGE && latterAction != this.Event.ACTION_DELETE)
		{	
			this.transformRowRange(prior, latter);
		}
		else if(priorRefType == this.Event.SCOPE_RANGE  && priorAction != this.Event.ACTION_DELETE && latterRefType == this.Event.SCOPE_ROW )
		{	
			this.transformRangeRow(prior, latter);				
		}	
		else if(priorRefType == this.Event.SCOPE_COLUMN && latterRefType == this.Event.SCOPE_RANGE && latterAction != this.Event.ACTION_DELETE)
		{
			this.transformColRange(prior, latter);
		}
		else if(priorRefType == this.Event.SCOPE_RANGE && priorAction != this.Event.ACTION_DELETE && latterRefType == this.Event.SCOPE_COLUMN)
		{
			this.transformRangeCol(prior, latter);
		}
		else if(priorRefType == this.Event.SCOPE_RANGE && latterRefType == this.Event.SCOPE_RANGE)
		{
			this.transformRangeRange(prior, latter);
		}	
	},
	transformRange:function(prior, latter){
		var priorRefType = prior.reference.refType;
		var latterRefType = latter.reference.refType;
		var priorAction = prior.action;
		var latterAction = latter.action;
		var rangeMsg = null;
		var otherMsg = null;
		var rangeSheetName = null;
		var otherSheetName = null;
		var latterUsage = latter.data.usage;
		var priorUsage = prior.data.usage;
		
		//sort action
		if(priorAction == this.Event.ACTION_SORT || latterAction == this.Event.ACTION_SORT)
		{
			if((priorRefType == this.Event.SCOPE_SHEET) ||	(latterRefType == this.Event.SCOPE_SHEET))
			{
				if(latterAction == this.Event.ACTION_SORT)
				{
					this.transformSheetSortRange(prior, latter);
				}
			}
			else if((priorRefType == this.Event.SCOPE_ROW) || (latterRefType == this.Event.SCOPE_ROW))
			{
				if(priorAction == this.Event.ACTION_SORT)
					this.transformSortRangeRow(prior, latter);
				else
					this.transformRowSortRange(prior, latter);
			}
			else if((priorRefType == this.Event.SCOPE_COLUMN) || (latterRefType == this.Event.SCOPE_COLUMN))
			{
				if(priorAction == this.Event.ACTION_SORT)
					this.transformSortRangeColumn(prior, latter);
				else
					this.transformColumnSortRange(prior, latter);
			}
			else if((priorRefType == this.Event.SCOPE_CELL) || (latterRefType == this.Event.SCOPE_CELL))
			{
				if(latterAction == this.Event.ACTION_SORT)
					this.transformCellSortRange(prior, latter);
				else if(priorAction == this.Event.ACTION_SORT)
					this.transformSortRangeCell(prior, latter);
			}
			else if((priorRefType == this.Event.SCOPE_UNNAMERANGE) && (latterRefType == this.Event.SCOPE_UNNAMERANGE))
			{
				if (priorAction == this.Event.ACTION_SORT && latterAction == this.Event.ACTION_SORT) 
				{
					this.transformSortRanges(prior, latter);
				}
				else
				{
					this.transformSortUnnamedRange(prior, latter);
				}
			}
		}
		else 		//filter action
		if(priorAction == this.Event.ACTION_FILTER || latterAction == this.Event.ACTION_FILTER)
		{
			if((priorRefType == this.Event.SCOPE_SHEET) ||	(latterRefType == this.Event.SCOPE_SHEET))
			{
				if(latterAction == this.Event.ACTION_FILTER)
				{
					this.transformSheetFilterRange(prior, latter);
				}
			}
			else if((priorRefType == this.Event.SCOPE_ROW) || (latterRefType == this.Event.SCOPE_ROW))
			{
				if(priorAction == this.Event.ACTION_FILTER)
					this.transformFilterRangeRow(prior, latter);
				else
					this.transformRowFilterRange(prior, latter);
			}
			else if((priorRefType == this.Event.SCOPE_COLUMN) || (latterRefType == this.Event.SCOPE_COLUMN))
			{
				this.transformColumnFilterRange(prior, latter);
			}
			else if((priorRefType == this.Event.SCOPE_CELL) || (latterRefType == this.Event.SCOPE_CELL))
			{
				if(latterAction == this.Event.ACTION_FILTER)
					this.transformCellFilterRange(prior, latter);
				else if(priorAction == this.Event.ACTION_FILTER)
					this.transformFilterRangeCell(prior, latter);
			}
			else if((priorRefType == this.Event.SCOPE_UNNAMERANGE) && (latterRefType == this.Event.SCOPE_UNNAMERANGE))
			{
				if (priorAction == this.Event.ACTION_FILTER && latterAction == this.Event.ACTION_FILTER) 
				{
					this.transformFilterRanges(prior, latter);
				}
				else  //autofill should ignore filter rows
				{
					if((latterAction == this.Event.ACTION_FILTER && prior.data && prior.data.ignoreFilteredRow) ||
						priorAction == this.Event.ACTION_FILTER && latter.data && latter.data.ignoreFilteredRow)
					{
						var filterEvent = latterAction == this.Event.ACTION_FILTER ? latter : prior;
						var rangeEvent = latterAction == this.Event.ACTION_FILTER ? prior : latter;
						var pRef = websheet.Helper.parseRef(rangeEvent.reference.refValue);
						var sr = pRef.startRow;
						var er = pRef.endRow;
						var changedRows = [];
						var showrows = filterEvent.data.s;
						var hiderows = filterEvent.data.h;
						if(showrows)
							changedRows = changedRows.concat(showrows);
						if(hiderows)
							changedRows = changedRows.concat(hiderows);
						for(var i=0,len=changedRows.length;i<len;i++)
						{
							var r = changedRows[i];
							if(r>=sr && r<=er)
							{
								latter.OTResult = 1;
								break;
							}
						}
					}
				}
			}
		}
		else if(priorAction == this.Event.ACTION_MERGE || priorAction == this.Event.ACTION_SPLIT
		      ||latterAction == this.Event.ACTION_MERGE || latterAction == this.Event.ACTION_SPLIT )
		{
			this.transformMergeSplit(prior, latter);
		}
		else
		{			
			if( priorRefType == this.Event.SCOPE_SHEET && latterRefType == this.Event.SCOPE_UNNAMERANGE )
			{
				this.transformSheetUnnamedRange(prior, latter);
			}
			else if( priorRefType == this.Event.SCOPE_UNNAMERANGE && latterRefType == this.Event.SCOPE_SHEET )
			{
				this.transformUnnamedRangeSheet(prior, latter);
			}			
			else if(priorRefType == this.Event.SCOPE_ROW && latterRefType == this.Event.SCOPE_UNNAMERANGE )
			{	
				this.transformRowUnnamedRange(prior, latter);				
			}
			else if(priorRefType == this.Event.SCOPE_UNNAMERANGE && latterRefType == this.Event.SCOPE_ROW )
			{	
				this.transformUnnamedRangeRow(prior, latter);				
			}		
			else if(priorRefType == this.Event.SCOPE_COLUMN && latterRefType == this.Event.SCOPE_UNNAMERANGE)
			{
				this.transformColUnnamedRange(prior, latter);
			}
			else if(priorRefType == this.Event.SCOPE_UNNAMERANGE && latterRefType == this.Event.SCOPE_COLUMN)
			{
				this.transformUnnamedRangeCol(prior, latter);
			}
			else if(priorRefType == this.Event.SCOPE_CELL && latterRefType == this.Event.SCOPE_UNNAMERANGE)
			{
				this.transformCellUnnamedRange(prior, latter);
			}
			else if(priorRefType == this.Event.SCOPE_UNNAMERANGE && latterRefType == this.Event.SCOPE_CELL)	
			{
				this.transformUnnamedRangeCell(prior, latter);
			}
			else if(priorRefType == this.Event.SCOPE_UNNAMERANGE && latterRefType == this.Event.SCOPE_UNNAMERANGE)	
			{
				this.transformUnnamedRangeUnnamedRange(prior, latter);
			}							
		}
	},
	
	transformSheetRange:function(prior, latter){
		switch (prior.action)
		{
		case this.Event.ACTION_SET:
            var newSheetName = prior.data.sheet.sheetname;
            //not rename sheet          
			if (newSheetName == undefined)
				break;
            var oldSheetName = websheet.Helper.handleRefValue(prior.reference.refValue,this.Event.SCOPE_SHEET);
            
			var rangeRef = latter.reference.refValue;
	    	var parsedRangeRef = websheet.Helper.parseRef(rangeRef);
	    	
	    	var rangeStartRow = parsedRangeRef.startRow;
			var	rangeEndRow = parsedRangeRef.endRow;
			var rangeStartColumn = parsedRangeRef.startCol;
			var	rangeEndColumn = parsedRangeRef.endCol;
	
	    	if(parsedRangeRef.sheetName == oldSheetName)
	    	{
	    		var params = {refMask: parsedRangeRef.refMask};
	    		var newRangeRef = websheet.Helper.getAddressByIndex(newSheetName, rangeStartRow,rangeStartColumn,newSheetName,rangeEndRow,rangeEndColumn,params);
	    		latter.reference.refValue = newRangeRef;
	    	}						
		break;		
		case this.Event.ACTION_DELETE:
			var pSheetName = websheet.Helper.handleRefValue(prior.reference.refValue,this.Event.SCOPE_SHEET);
			var parsedRangeRef = websheet.Helper.parseRef(latter.reference.refValue);
			if(pSheetName == parsedRangeRef.sheetName)	
				latter.OTResult=1;
		break;
		}
	},
	
	transformSheetUnnamedRange:function(prior, latter)
	{	    
		switch (prior.action)
		{
		case this.Event.ACTION_SET:			
		    var newSheetName = prior.data.sheet.sheetname;
		    //not rename sheet
		    if (newSheetName == undefined)
		    	break;
            var oldSheetName = websheet.Helper.handleRefValue(prior.reference.refValue,this.Event.SCOPE_SHEET);
            
			var rangeRef = latter.reference.refValue;
	    	var parsedRangeRef = websheet.Helper.parseRef(rangeRef);
	    	
	    	var rangeStartRow = parsedRangeRef.startRow;
			var	rangeEndRow = parsedRangeRef.endRow;
			var rangeStartColumn = parsedRangeRef.startCol;
			var	rangeEndColumn = parsedRangeRef.endCol;
	
	    	if(parsedRangeRef.sheetName == oldSheetName)
	    	{
	    		var params = {refMask: parsedRangeRef.refMask};
	    		var newRangeRef = websheet.Helper.getAddressByIndex(newSheetName, rangeStartRow,rangeStartColumn,null,rangeEndRow,rangeEndColumn,params);
	    		latter.reference.refValue = newRangeRef;
	    	}
	    	//Transform data source of chart.
	    	if(latter.data && latter.data.usage == websheet.Constant.RangeUsage.CHART){
	    		this.transformDataSourceInChart(latter, "sheet", prior.action,{"oldSheetName" : oldSheetName , "newSheetName" : newSheetName});
	    	}
		break;
		case this.Event.ACTION_DELETE:
			var pSheetName = websheet.Helper.handleRefValue(prior.reference.refValue,this.Event.SCOPE_SHEET);
			var parsedRangeRef = websheet.Helper.parseRef(latter.reference.refValue);
			if(pSheetName == parsedRangeRef.sheetName)			
				latter.OTResult=2;
			else if(latter.data && latter.data.usage == websheet.Constant.RangeUsage.CHART){//Transform data source of chart.
				this._transformDeleteSheetDataSourceInChart(latter, pSheetName);
			}
		break;
		}
	},
	
	//using undo/redo to keep the datasource in chart when undo delete sheet.
	_transformDeleteSheetDataSourceInChart: function(latter, pSheetName)
	{
		if(!latter.data.data)
			return;
		var chartJson = latter.data.data.chart;
		if(!chartJson)
			return;
		
		var axisJson = chartJson.plotArea.axis;
		if(axisJson){
			for(var i = 0; i< axisJson.length; i++){
				var axis = axisJson[i];
				if(axis.cat && axis.cat.ref){
					if(this._transformDeleteSheetRefsInChart(pSheetName, axis.cat.ref)){
						latter.OTResult = 1;
						return;
					}
				}
			}
		}
		
		var _roles = ["label","xVal","yVal", "val", "bubbleSize"];
		var plotsJson = chartJson.plotArea.plots;
		if(plotsJson){
			for(var i = 0; i< plotsJson.length; i++){
				var plotJson = plotsJson[i];
				if(plotJson.series){
					var seriesJson = plotJson.series;
					for(var j = 0; j< seriesJson.length; j ++){
						var serieJson = seriesJson[j];
						for(var t=0;t<_roles.length;t++)
						{
							var role = _roles[t];
							var valJson = serieJson[role];
							if(valJson && valJson.ref){
								if(this._transformDeleteSheetRefsInChart(pSheetName, valJson.ref)){
									latter.OTResult = 1;
									return;
								}
							}
						}
					}
				}
			}
		}
	},
	
	_transformDeleteSheetRefsInChart: function(pSheetName, ref)
	{
		var addrs = websheet.Helper.getRanges(ref);
		var newRef = "";
		for(var i = 0; i < addrs.length; i++){
			var addr = addrs[i];
			var parsedRefInChart = websheet.Helper.parseRef(addr);
			if(parsedRefInChart && pSheetName == parsedRefInChart.sheetName)
				return true;
		}
		return false;
	},
	
	transformUnnamedRangeSheet: function(prior, latter)
	{
		if(latter.action == this.Event.ACTION_DELETE)
		{
			var lSheetName = websheet.Helper.handleRefValue(latter.reference.refValue,this.Event.SCOPE_SHEET);
			var parsedRangeRef = websheet.Helper.parseRef(prior.reference.refValue);
			if(lSheetName == parsedRangeRef.sheetName){
				this.docAgent.rollbackAddedTask(prior.data.rangeid);
				this.getOTManager().conflictResolve(this._index);
			}
		}
	},
	
	transformRangeSheet: function(prior, latter)
	{
		if(latter.action == this.Event.ACTION_DELETE)
		{
			var lSheetName = websheet.Helper.handleRefValue(latter.reference.refValue,this.Event.SCOPE_SHEET);
			var parsedRangeRef = websheet.Helper.parseRef(prior.reference.refValue);
			if(lSheetName == parsedRangeRef.sheetName){
				this.getOTManager().perform(this._index);
				//this.editor.getNameRangeHdl().showRollBackMsg();
			}
		}
	},
	transformRangeRow: function(prior, latter)
	{
		var priorAction = prior.action;
		var latterAction = latter.action;
		var priorRefValue = prior.reference.refValue;
		var latterRefValue = latter.reference.refValue;
		
		var handledRowRefValue = websheet.Helper.handleRefValue(latterRefValue,this.Event.SCOPE_ROW);		
		var parsedRowRef = websheet.Helper.parseRef(handledRowRefValue);
		
		var parsedRangeRef = websheet.Helper.parseRef(priorRefValue);		
		var rangeStartRow = parsedRangeRef.startRow;
		var	rangeEndRow = parsedRangeRef.endRow;
		var rangeStartColumn = parsedRangeRef.startCol;
		var	rangeEndColumn = parsedRangeRef.endCol;			
		
		
		if(parsedRowRef.sheetName == parsedRangeRef.sheetName){
			if(latterAction == this.Event.ACTION_DELETE && ((parsedRowRef.startRow <= rangeStartRow && parsedRowRef.endRow >= rangeStartRow) 
			|| (parsedRowRef.startRow <= rangeEndRow && parsedRowRef.endRow >= rangeEndRow))){
				this.getOTManager().perform(this._index);
				//this.editor.getNameRangeHdl().showRollBackMsg();
			}
			else if(latterAction == this.Event.ACTION_INSERT )
			{
					var insertRowCount = parsedRowRef.endRow - parsedRowRef.startRow + 1;
					var params = {refMask: parsedRangeRef.refMask};
					if(parsedRowRef.startRow <= rangeStartRow)
					{
						var newStartRowIndex = parseInt(rangeStartRow) + insertRowCount;						
						var newEndRowIndex = parseInt(rangeEndRow) + insertRowCount;
						
						var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,newStartRowIndex,rangeStartColumn,parsedRangeRef.sheetName,newEndRowIndex,rangeEndColumn,params);
						var extra = websheet.Helper.cloneJSON(prior);
						extra.action = this.Event.ACTION_SET;
						extra.reference.refValue = newRangeRef.toString();
						latter.extraArray[this._localEventIdx] = extra;
					}				
					else if(parsedRowRef.startRow > rangeStartRow && parsedRowRef.startRow <= rangeEndRow)
					{
						var newStartRowIndex = parseInt(rangeStartRow);						
						var newEndRowIndex = parseInt(rangeEndRow) + insertRowCount;
								
						var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,newStartRowIndex,rangeStartColumn ,parsedRangeRef.sheetName, newEndRowIndex, rangeEndColumn,params);
						var extra = websheet.Helper.cloneJSON(prior);
						extra.action = this.Event.ACTION_SET;
						extra.reference.refValue = newRangeRef.toString();
						latter.extraArray[this._localEventIdx] = extra;
					}	
			}
		}
	},
	transformRangeCol: function(prior, latter)
	{
		var parsedColRef = websheet.Helper.parseRef(latter.reference.refValue);
		var isCol = parsedColRef.startCol;
		var ieCol = parsedColRef.endCol;
		var parsedRangeRef = websheet.Helper.parseRef(prior.reference.refValue);	
		var iRangeSCol = parsedRangeRef.startCol;
		var iRangeECol = parsedRangeRef.endCol;
		var rangeStartRow = parsedRangeRef.startRow;
		var	rangeEndRow = parsedRangeRef.endRow;
				
		if(parsedColRef.sheetName == parsedRangeRef.sheetName){
			if(latter.action == this.Event.ACTION_DELETE && ((isCol <= iRangeSCol && ieCol >= iRangeSCol)
			||(isCol <= iRangeECol && ieCol >= iRangeECol)))
			{
				this.getOTManager().perform(this._index);
				//this.editor.getNameRangeHdl().showRollBackMsg();	
			}
			else if(latter.action  == this.Event.ACTION_INSERT)
			{
				var params = {refMask: parsedRangeRef.refMask};
				var insertColCount = ieCol - isCol + 1;
				if(isCol <= iRangeSCol)
				{
					var newStartColIndex = parseInt(iRangeSCol) + insertColCount;						
					var newEndColIndex = parseInt(iRangeECol) + insertColCount;
							
					var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,rangeStartRow,newStartColIndex,parsedRangeRef.sheetName,rangeEndRow,newEndColIndex,params);
					var extra = websheet.Helper.cloneJSON(prior);
					extra.action = this.Event.ACTION_SET;
					extra.reference.refValue = newRangeRef.toString();
					latter.extraArray[this._localEventIdx] = extra;
				}				
				else if(isCol > iRangeSCol && isCol <= iRangeECol)
				{
					var newStartColIndex = parseInt(iRangeSCol);						
					var newEndColIndex = parseInt(iRangeECol) + insertColCount;
							
					var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,rangeStartRow,newStartColIndex,parsedRangeRef.sheet,rangeEndRow,newEndColIndex,params);
					var extra = websheet.Helper.cloneJSON(prior);
					extra.action = this.Event.ACTION_SET;
					extra.reference.refValue = newRangeRef.toString();
					latter.extraArray[this._localEventIdx] = extra;
				}	
			}
		}
	},
	transformRangeRange: function(prior, latter)
	{
		var priorAction = prior.action;
		var latterAction = latter.action;
		var priorRefValue = prior.reference.refValue;
		var latterRefValue = latter.reference.refValue;
		
		if(prior.data.rangeid != latter.data.rangeid){
			 if(!(prior.data.usage == websheet.Constant.RangeUsage.NAME
			  && latter.data.usage == websheet.Constant.RangeUsage.NAME 
			  && prior.data.rangeid.toLowerCase() == latter.data.rangeid.toLowerCase()))
			return;
		}
				
		if(priorAction == this.Event.ACTION_SET && latterAction == this.Event.ACTION_SET){
			latter.OTResult=2;
		}
		else if(priorAction == this.Event.ACTION_INSERT && latterAction == this.Event.ACTION_DELETE){
		
			latter.action = this.Event.ACTION_SET;
			latter.reference.refValue = prior.reference.refValue;
		}
		else if((priorAction == this.Event.ACTION_SET || priorAction == this.Event.ACTION_DELETE) && latterAction == this.Event.ACTION_INSERT){
			this.getOTManager().perform(this._index);
		}
		else if(priorAction == this.Event.ACTION_INSERT && latterAction == this.Event.ACTION_INSERT){			
			latter.OTResult=1;			
		}
		
	},
	transformColRange: function(prior, latter)
	{
		var priorAction = prior.action;
		var latterAction = latter.action;
		var priorRefValue = prior.reference.refValue;
		var latterRefValue = latter.reference.refValue;
		
		var handledColRefValue = websheet.Helper.handleRefValue(priorRefValue,this.Event.SCOPE_COLUMN);		
		var parsedColRef = websheet.Helper.parseRef(handledColRefValue);
		
		var startColumn = parsedColRef.startCol;
		var endColumn = parsedColRef.endCol;
		
		var parsedRangeRef = websheet.Helper.parseRef(latterRefValue);		
		var rangeStartRow = parsedRangeRef.startRow;
		var	rangeEndRow = parsedRangeRef.endRow;
		var rangeStartColumn = parsedRangeRef.startCol;
		var	rangeEndColumn = parsedRangeRef.endCol;
		
		var params = {refMask: parsedRangeRef.refMask};
		if(priorAction == this.Event.ACTION_INSERT)
		{
			if(parsedColRef.sheetName == parsedRangeRef.sheetName)
			{
				var insertColCount = endColumn - startColumn + 1;
				if(startColumn <= rangeStartColumn)
				{
					var newStartColIndex = parseInt(rangeStartColumn) + insertColCount;						
					var newEndColIndex = parseInt(rangeEndColumn) + insertColCount;
					var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,rangeStartRow,newStartColIndex,parsedRangeRef.sheetName,rangeEndRow,newEndColIndex,params);
					latter.reference.refValue = newRangeRef;
				}				
				else if(startColumn > rangeStartColumn && startColumn <= rangeEndColumn)
				{
					var newStartColIndex = parseInt(rangeStartColumn);						
					var newEndColIndex = parseInt(rangeEndColumn) + insertColCount;
					var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,rangeStartRow,newStartColIndex,parsedRangeRef.sheetName,rangeEndRow,newEndColIndex,params);
					latter.reference.refValue = newRangeRef;
				}	
				if(latterAction == this.Event.ACTION_INSERT ||  latterAction == this.Event.ACTION_SET){
				  if(prior.data && prior.data.undoRangess){
					for(var rangeId in prior.data.undoRangess){
						if(rangeId == latter.data.rangeid){
							//undo setRange, remove it from msg
							this.docAgent.unRestoreRange(rangeId,prior.data.undoRanges[rangeId],startColumn,endColumn,this.Event.SCOPE_COLUMN);
							delete  prior.data.undoRangess[rangeId];
						}
					}
				}
			  }					
			}
		}else if(priorAction == this.Event.ACTION_DELETE){
			var deleteColCount = endColumn - startColumn + 1;
			if(endColumn < rangeStartColumn)
			{
					var newStartColIndex = parseInt(rangeStartColumn) - deleteColCount;						
					var newEndColIndex = parseInt(rangeEndColumn) - deleteColCount;
					var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,rangeStartRow,newStartColIndex,parsedRangeRef.sheetName,rangeEndRow,newEndColIndex,params);
					latter.reference.refValue = newRangeRef;
			}	
			else if(startColumn >rangeStartColumn && endColumn <rangeEndColumn)
			{
				var newStartColIndex = parseInt(rangeStartColumn);						
				var newEndColIndex = parseInt(rangeEndColumn) - deleteColCount;
				var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,rangeStartRow,newStartColIndex,parsedRangeRef.sheetName,rangeEndRow,newEndColIndex,params);
				latter.reference.refValue = newRangeRef;
			}
			else if((startColumn <= rangeStartColumn && endColumn >= rangeEndColumn)|| ( startColumn <= rangeEndColumn && endColumn >=rangeEndColumn))
			{
				latter.OTResult=1;
			}
		}
	},
	
	transformRowRange: function(prior, latter)
	{
		var priorAction = prior.action;
		var latterAction = latter.action;
		var priorRefValue = prior.reference.refValue;
		var latterRefValue = latter.reference.refValue;
		var handledRowRefValue = websheet.Helper.handleRefValue(priorRefValue,this.Event.SCOPE_ROW);		
		var parsedRowRef = websheet.Helper.parseRef(handledRowRefValue);
		var parsedRangeRef = websheet.Helper.parseRef(latterRefValue);		
		var rangeStartRow = parsedRangeRef.startRow;
		var	rangeEndRow = parsedRangeRef.endRow;
		var rangeStartColumn = parsedRangeRef.startCol;
		var	rangeEndColumn = parsedRangeRef.endCol;
		var params = {refMask: parsedRangeRef.refMask};
		if(priorAction == this.Event.ACTION_INSERT)
		{
				if(parsedRowRef.sheetName == parsedRangeRef.sheetName)
				{
					var insertRowCount = parsedRowRef.endRow - parsedRowRef.startRow + 1;
					if(parsedRowRef.startRow <= rangeStartRow)
					{
						var newStartRowIndex = parseInt(rangeStartRow) + insertRowCount;						
						var newEndRowIndex = parseInt(rangeEndRow) + insertRowCount;
								
						var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,newStartRowIndex,rangeStartColumn,parsedRangeRef.sheetName,newEndRowIndex,rangeEndColumn,params);
						latter.reference.refValue = newRangeRef;
					}				
					else if(parsedRowRef.startRow <= rangeEndRow)//parsedRowRef.row > rangeStartRow && 
					{
						var newStartRowIndex = parseInt(rangeStartRow);						
						var newEndRowIndex = parseInt(rangeEndRow) + insertRowCount;
								
						var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,newStartRowIndex,rangeStartColumn ,parsedRangeRef.sheetName, newEndRowIndex, rangeEndColumn,params);
						latter.reference.refValue = newRangeRef;
					}
					if(latterAction == this.Event.ACTION_INSERT ||latterAction == this.Event.ACTION_SET){
						if(prior.data && prior.data.undoRanges){
							for(var rangeId in prior.data.undoRanges){
								if(rangeId == latter.data.rangeid){
									//undo setRange, remove it from msg
									this.docAgent.unRestoreRange(rangeId,prior.data.undoRanges[rangeId],parsedRowRef.startRow,parsedRowRef.endRow,this.Event.SCOPE_ROW);
									delete  prior.data.undoRanges[rangeId];
								}
							}
						}
					}				
				}
		}else if(priorAction == this.Event.ACTION_DELETE){
			if(parsedRowRef.sheetName == parsedRangeRef.sheetName ){
				var deleteRowCount = parsedRowRef.endRow - parsedRowRef.startRow + 1;
				if(parsedRowRef.endRow < rangeStartRow)
				{
						var newStartRowIndex = parseInt(rangeStartRow) - deleteRowCount;						
						var newEndRowIndex = parseInt(rangeEndRow) - deleteRowCount;
						var newRangeRef =  websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,newStartRowIndex,rangeStartColumn,parsedRangeRef.sheetName,newEndRowIndex,rangeEndColumn,params );
						latter.reference.refValue = newRangeRef;
				}	
				else if(parsedRowRef.startRow >rangeStartRow && parsedRowRef.endRow <rangeEndRow)
				{
					var newStartRowIndex = parseInt(rangeStartRow);						
					var newEndRowIndex = parseInt(rangeEndRow) - deleteRowCount;
					var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,newStartRowIndex,rangeStartColumn, parsedRangeRef.sheetName, newEndRowIndex,rangeEndColumn,params);
					latter.reference.refValue = newRangeRef;
				}
				else if((parsedRowRef.startRow <= rangeStartRow && parsedRowRef.endRow >= rangeStartRow)|| ( parsedRowRef.startRow <= rangeEndRow && parsedRowRef.endRow >=rangeEndRow))
				{
					latter.OTResult=1;
				}
			}
		}
	},
	transformRowUnnamedRange: function(prior, latter)
    {
		if(latter.data && latter.data.data && latter.data.data.bSheet)
			return;
		var priorAction = prior.action;
		var latterAction = latter.action;
		var priorRefValue = prior.reference.refValue;
		var latterRefValue = latter.reference.refValue;
		
		var handledRowRefValue = websheet.Helper.handleRefValue(priorRefValue,this.Event.SCOPE_ROW);		
		var parsedRowRef = websheet.Helper.parseRef(handledRowRefValue);
		
		var parsedRangeRef = websheet.Helper.parseRef(latterRefValue);		
		var rangeStartRow = parsedRangeRef.startRow;
		var	rangeEndRow = parsedRangeRef.endRow;
		var rangeStartColumn = parsedRangeRef.startCol;
		var	rangeEndColumn = parsedRangeRef.endCol;
		var params = {refMask: parsedRangeRef.refMask};
		//the latter action is set range
		if(latterAction == this.Event.ACTION_SET)
		{		
			if(parsedRowRef.sheetName != parsedRangeRef.sheetName)
				return;
			if(parsedRowRef.startRow<=rangeEndRow){
				if(priorAction == this.Event.ACTION_CLEAR){
					latter.extraArray[this._localEventIdx] = prior;
				}
				else
					latter.OTResult=1;
			}
		}
		else
		{
			if(priorAction == this.Event.ACTION_INSERT)
			{
				var insertRowCount = parsedRowRef.endRow - parsedRowRef.startRow + 1;
				if(parsedRowRef.sheetName == parsedRangeRef.sheetName)
				{		
					if(parsedRowRef.startRow <= rangeStartRow)
					{
						var newStartRowIndex = parseInt(rangeStartRow) + insertRowCount;						
						var newEndRowIndex = parseInt(rangeEndRow) + insertRowCount;
								
						var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,newStartRowIndex,rangeStartColumn,null,newEndRowIndex,rangeEndColumn,params);
						latter.reference.refValue = newRangeRef;
					}				
					else if(parsedRowRef.startRow > rangeStartRow && parsedRowRef.startRow <= rangeEndRow)
					{
						var newStartRowIndex = parseInt(rangeStartRow);						
						var newEndRowIndex = parseInt(rangeEndRow) + insertRowCount;
								
						var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,newStartRowIndex,rangeStartColumn ,null, newEndRowIndex, rangeEndColumn,params);
						latter.reference.refValue = newRangeRef;
					}				
				}
			}
			else if(priorAction == this.Event.ACTION_DELETE)
			{				
				if(parsedRowRef.sheetName == parsedRangeRef.sheetName )
				{
					var deleteRowCount = parsedRowRef.endRow - parsedRowRef.startRow + 1;
					
					if(parsedRowRef.endRow < rangeStartRow)
					{
						var newStartRowIndex = parseInt(rangeStartRow) - deleteRowCount;						
						var newEndRowIndex = parseInt(rangeEndRow) - deleteRowCount;
						var newRangeRef =  websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,newStartRowIndex,rangeStartColumn,null,newEndRowIndex,rangeEndColumn,params);
						latter.reference.refValue = newRangeRef;
					}
					else if(parsedRowRef.startRow <rangeStartRow && parsedRowRef.endRow >= rangeStartRow && parsedRowRef.endRow <rangeEndRow)
					{
						var newStartRowIndex = parseInt(parsedRowRef.startRow);						
						var newEndRowIndex = parseInt(rangeEndRow) - deleteRowCount;
						var newRangeRef =  websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,newStartRowIndex,rangeStartColumn,null,newEndRowIndex,rangeEndColumn,params);
						latter.reference.refValue = newRangeRef;
					}
					else if(parsedRowRef.startRow <=rangeStartRow && parsedRowRef.endRow >= rangeEndRow)
					{
						latter.OTResult=2;
					}
					else if (parsedRowRef.startRow == rangeStartRow &&
							(latter.data && latter.data.usage == websheet.Constant.RangeUsage.FILTER) ||
							(latter.action == websheet.Constant.RangeUsage.FILTER))
					{
			            latter.OTResult=2;
					}
					else if(parsedRowRef.startRow >=rangeStartRow && parsedRowRef.endRow <= rangeEndRow)
					{
						var newStartRowIndex = parseInt(rangeStartRow);						
						var newEndRowIndex = parseInt(rangeEndRow) - deleteRowCount;
						var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,newStartRowIndex,rangeStartColumn, null, newEndRowIndex,rangeEndColumn,params);
						latter.reference.refValue = newRangeRef;
					}
					else if(parsedRowRef.startRow >=rangeStartRow && parsedRowRef.startRow <= rangeEndRow && parsedRowRef.endRow > rangeEndRow)
					{
						var newStartRowIndex = parseInt(rangeStartRow);						
						var newEndRowIndex = parseInt(parsedRowRef.startRow-1);
						var newRangeRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,newStartRowIndex,rangeStartColumn, null, params);
						latter.reference.refValue = newRangeRef;
					}				
				}
			}
		}
		
		//if not undoredo or ignore, then transform data source of chart.
		if((priorAction == this.Event.ACTION_DELETE || priorAction == this.Event.ACTION_INSERT) && !latter.OTResult 
				&& latter.data && latter.data.usage == websheet.Constant.RangeUsage.CHART){
			//delete action effect the boundary of the chart
			if(priorAction == this.Event.ACTION_DELETE && parsedRowRef.sheetName == parsedRangeRef.sheetName && latter.data.data){
				if(parsedRowRef.startRow <= rangeStartRow && parsedRowRef.endRow >= rangeStartRow){
					latter.data.data.y = 0;
				}
				if(parsedRowRef.startRow <= rangeEndRow && parsedRowRef.endRow >= rangeEndRow){
					latter.data.data.ey = -1;
				}
			}
			else if(priorAction == this.Event.ACTION_INSERT && parsedRowRef.sheetName == parsedRangeRef.sheetName){
				if(prior.data && prior.data.undoRanges){
					var chartId = latter.data.rangeid;
					var undoRange = prior.data.undoRanges[chartId];
					if(undoRange && undoRange.usage == websheet.Constant.RangeUsage.CHART){
						var parsedLatterRef = websheet.Helper.parseRef(latter.reference.refValue);	
						var rangeStartRow = parsedLatterRef.startRow;
						var	rangeEndRow = parsedLatterRef.endRow;
						var ret = this._transformRefByDelta(parsedRowRef.startRow, parsedRowRef.endRow,rangeStartRow, rangeEndRow, undoRange);
						var params = {refMask: parsedRangeRef.refMask};
						var newRef = websheet.Helper.getAddressByIndex(parsedLatterRef.sheetName,ret.start,parsedLatterRef.startCol,parsedLatterRef.sheetName,ret.end,parsedLatterRef.endCol,params);
						latter.reference.refValue = newRef;
						if(undoRange.data && latter.data.data){
							for(var attr in undoRange.data)
					   		{
					   			latter.data.data[attr] = undoRange.data[attr];
					   		}
						}
					}
				}
			}
			var undoCharts;
			if(priorAction == this.Event.ACTION_INSERT && prior.data && prior.data.undoCharts)
				undoCharts = prior.data.undoCharts;
			this.transformDataSourceInChart(latter, "row", priorAction, {"parsedRef" : parsedRowRef, "undoCharts" : undoCharts});
		}
	},
	
	transformDataSourceInChart: function(latter, type, action, params)
	{
		if(!latter.data.data)
			return;
		var chartJson = latter.data.data.chart;
		if(!chartJson)
			return;
		
		var undoChart;
		var undoCharts = params.undoCharts;
		if(undoCharts){
			var chartId = latter.data.rangeid;
			undoChart = undoCharts[chartId];
		}
		
		var axisJson = chartJson.plotArea.axis;
		if(axisJson){
			for(var i = 0; i< axisJson.length; i++){
				var axis = axisJson[i];
				if(axis.cat && axis.cat.ref){
					var deltas;
					if(undoChart){
						var key = "cat " + axis.axId;
						deltas = undoChart[key];
					}
					var newRef = this.transformRefsInChart(type, action, params, axis.cat.ref, deltas);
					axisJson[i].cat.ref = newRef;
				}
			}
			chartJson.plotArea.axis = axisJson;
		}
		var _roles = ["label","xVal","yVal", "val", "bubbleSize"];
		var plotsJson = chartJson.plotArea.plots;
		if(plotsJson){
			for(var i = 0; i< plotsJson.length; i++){
				var plotJson = plotsJson[i];
				if(plotJson.series){
					var seriesJson = plotJson.series;
					for(var j = 0; j< seriesJson.length; j ++){
						var serieJson = seriesJson[j];
						var serieId = serieJson.id;
						
						for(var t=0;t<_roles.length;t++)
						{
							var role = _roles[t];
							var valJson = serieJson[role];
							if(valJson && valJson.ref){
								var deltas;
								if(undoChart){
									var key = role + " " + serieId;
									deltas = undoChart[key];
								}
								var newRef = this.transformRefsInChart(type,action,params,valJson.ref, deltas);
								serieJson[role].ref = newRef;
							}
						}
					}
				}
				plotsJson[i].series = seriesJson;
			}
			 chartJson.plotArea.plots = plotsJson;
		}
		latter.data.data.chart =  chartJson;
	},
	
	transformRefsInChart: function(type, action, params,ref, deltas){
		var addrs = websheet.Helper.getRanges(ref);
		var newRef = "";
		var len = addrs.length;
		if(len > 1)
			newRef = "(";
		for(var i = 0; i < len; i++){
			var delta;
			if(deltas)
				delta = deltas[i];
			var addr = this._transformRefsInChart(type, action, params,addrs[i], delta);
			if(addr)
				newRef += addr;
			else
				newRef += addrs[i];
			if(i < len - 1)
				newRef += ",";
		}
		if(len > 1)
			newRef += ")";
		return newRef;
	},
	
	/*
	 * parsedRef : row ref or column ref
	 * now only handle insert/delete row/col, not handle row/col range, (could change 1 to delta)
	 */
	_transformRefsInChart: function(type, action, args, ref, delta)
	{
		var parsedRefInChart = websheet.Helper.parseRef(ref);
		if(!parsedRefInChart || !parsedRefInChart.isValid())
			return null;
		var newRef = ref;
    	var params = {refMask: parsedRefInChart.refMask};
		if(type == "row"){
			var parsedRef = args.parsedRef;
			if(parsedRefInChart.sheetName != parsedRef.sheetName)
			{
	    		return newRef;
			}

			switch(action)
			{
			    case this.Event.ACTION_INSERT:
			    {
			    	var insertRowCount = parsedRef.endRow - parsedRef.startRow + 1;
			    	if(delta){
			    		var ret = this._transformRefByDelta(parsedRef.startRow, parsedRef.endRow, parsedRefInChart.startRow, parsedRefInChart.endRow, delta);			    		
			    		newRef = websheet.Helper.getAddressByIndex(parsedRefInChart.sheetName,ret.start,parsedRefInChart.startCol,parsedRefInChart.sheetName,ret.end,parsedRefInChart.endCol,params);
			    	}
			    	else if(parsedRef.startRow <=  parsedRefInChart.startRow)
    				{
    					var newStartRowIndex = parseInt(parsedRefInChart.startRow) + insertRowCount;
    					var newEndRowIndex = parseInt(parsedRefInChart.endRow) + insertRowCount;
    					newRef = websheet.Helper.getAddressByIndex(parsedRefInChart.sheetName,newStartRowIndex,parsedRefInChart.startCol,parsedRefInChart.sheetName,newEndRowIndex,parsedRefInChart.endCol,params);
    				}
    				else if( parsedRef.startRow > parsedRefInChart.startRow &&  parsedRef.startRow <= parsedRefInChart.endRow)
    				{
    					var newEndRowIndex = parseInt(parsedRefInChart.endRow) + insertRowCount;
    					newRef = websheet.Helper.getAddressByIndex(parsedRefInChart.sheetName,parsedRefInChart.startRow,parsedRefInChart.startCol,parsedRefInChart.sheetName,newEndRowIndex,parsedRefInChart.endCol,params);
    				}
			    }
			    break;
			    case this.Event.ACTION_DELETE:
			    {
			    	if(parsedRefInChart.endRow < parsedRef.startRow)
			    		return newRef;
			    	var deleteRowCount = parsedRef.endRow - parsedRef.startRow + 1;
			    	var sIndex = 0;
					var eIndex = 0;
					if(parsedRefInChart.startRow >= parsedRef.startRow && parsedRefInChart.endRow <= parsedRef.endRow)
						sIndex = eIndex = -1;
					else if(parsedRefInChart.startRow < parsedRef.startRow)
					{
						sIndex = parsedRefInChart.startRow;
					}else if( parsedRefInChart.startRow >= parsedRef.startRow && parsedRefInChart.startRow <= parsedRef.endRow)
					{
						sIndex = parsedRef.startRow;
					}else if(parsedRefInChart.startRow > parsedRef.endRow)
					{
						sIndex = parsedRefInChart.startRow - deleteRowCount;
					}
					
					if( parsedRefInChart.endRow >= parsedRef.startRow && parsedRefInChart.endRow <= parsedRef.endRow)
					{
						eIndex = parsedRef.startRow -1 ;
					}else if(parsedRefInChart.endRow > parsedRef.endRow)
					{
						eIndex = parsedRefInChart.endRow - deleteRowCount;
					}
					newRef = websheet.Helper.getAddressByIndex(parsedRefInChart.sheetName,sIndex,parsedRefInChart.startCol,parsedRefInChart.sheetName,eIndex,parsedRefInChart.endCol,params);
			    }
			    break;
			}
		}
		else if( type == "column"){
			var parsedRef = args.parsedRef;
			if(parsedRefInChart.sheetName != parsedRef.sheetName)
			{
	    		return newRef;
			}
			var iparsedRefInChartColumn = parsedRefInChart.startCol;
			var iparsedRefColumn =  parsedRef.startCol;
			var iparsedRefEndColumn = parsedRef.endCol;
			var count = iparsedRefEndColumn - iparsedRefColumn + 1;
			var iparsedRefInChartEndColumn = parsedRefInChart.endCol;
			switch(action)
			{
			    case this.Event.ACTION_INSERT:
			    {
			    	if(delta){
//			    		if(parsedRefInChart.column == websheet.Constant.INVALID_REF || parsedRefInChart.endColumn == websheet.Constant.INVALID_REF)
//			    			iparsedRefInChartColumn = iparsedRefInChartEndColumn = -1;
			    		var ret = this._transformRefByDelta(iparsedRefColumn, iparsedRefEndColumn, iparsedRefInChartColumn, iparsedRefInChartEndColumn, delta);
			    		newRef = websheet.Helper.getAddressByIndex(parsedRefInChart.sheetName,parsedRefInChart.startRow,ret.start,parsedRefInChart.sheetName,parsedRefInChart.endRow,ret.end,params);
			    	}		
			    	else if(iparsedRefColumn <=  iparsedRefInChartColumn)
    				{
    					var newStartColIndex = iparsedRefInChartColumn + count;
    					var newEndColIndex = iparsedRefInChartEndColumn + count;  					
    					newRef = websheet.Helper.getAddressByIndex(parsedRefInChart.sheetName,parsedRefInChart.startRow,newStartColIndex,parsedRefInChart.sheetName,parsedRefInChart.endRow,newEndColIndex,params);
    				}
    				else if( iparsedRefColumn > iparsedRefInChartColumn &&  iparsedRefColumn <= iparsedRefInChartEndColumn)
    				{
    					var newEndColIndex = iparsedRefInChartEndColumn + count;
    					newRef = websheet.Helper.getAddressByIndex(parsedRefInChart.sheetName,parsedRefInChart.startRow,parsedRefInChart.startCol,parsedRefInChart.sheetName,parsedRefInChart.endRow,newEndColIndex,params);
	   				}
			    }
			    break;
			    case this.Event.ACTION_DELETE:
			    {
			        if(iparsedRefColumn <= iparsedRefInChartColumn && iparsedRefEndColumn >= iparsedRefInChartEndColumn)
			        {
			        	newRef = websheet.Helper.getAddressByIndex(parsedRefInChart.sheetName,parsedRefInChart.startRow,-1,parsedRefInChart.sheetName,parsedRefInChart.endRow,-1,params);
			        }
			        else if(iparsedRefColumn <= iparsedRefInChartColumn && iparsedRefEndColumn >= iparsedRefInChartColumn)
			        {
			        	var newStartColIndex = iparsedRefColumn;
			        	var newEndColIndex = iparsedRefInChartEndColumn - count;
			        	newRef = websheet.Helper.getAddressByIndex(parsedRefInChart.sheetName,parsedRefInChart.startRow,newStartColIndex,parsedRefInChart.sheetName,parsedRefInChart.endRow,newEndColIndex,params);
			        }
			    	else if(iparsedRefEndColumn < iparsedRefInChartColumn)
    				{
    					var newStartColIndex = iparsedRefInChartColumn - count;
    					var newEndColIndex = iparsedRefInChartEndColumn - count;
	   					newRef = websheet.Helper.getAddressByIndex(parsedRefInChart.sheetName,parsedRefInChart.startRow,newStartColIndex,parsedRefInChart.sheetName,parsedRefInChart.endRow,newEndColIndex,params);
    				}
    				else if( iparsedRefColumn <= iparsedRefInChartEndColumn && iparsedRefColumn > iparsedRefInChartColumn)
    				{
    					var newEndColIndex = iparsedRefInChartEndColumn;
    					if (iparsedRefEndColumn > iparsedRefInChartEndColumn)
    						newEndColIndex = iparsedRefColumn - 1;
    					if (iparsedRefEndColumn <= iparsedRefInChartEndColumn)
    						newEndColIndex -= count;
    					newRef = websheet.Helper.getAddressByIndex(parsedRefInChart.sheetName,parsedRefInChart.startRow,parsedRefInChart.startCol,parsedRefInChart.sheetName,parsedRefInChart.endRow,newEndColIndex,params);
   					}
			    }
			    break;
			}
		}
		else if(type == "sheet" && action == this.Event.ACTION_SET){
			var oldSheetName = args.oldSheetName;
			var newSheetName = args.newSheetName;
			var sheet = null, endSheet = null;
			if(parsedRefInChart.sheetName && parsedRefInChart.sheetName == oldSheetName)
				sheet = newSheetName;
//			if(parsedRefInChart.endSheet && parsedRefInChart.endSheet == oldSheetName)
//				endSheet = newSheetName;
			
			//at least one sheetname changed
			if(sheet || endSheet){
				if(!sheet)
					sheet = parsedRefInChart.sheetName;
//				if(!endSheet)
//					endSheet = parsedRefInChart.endSheet;
				newRef = websheet.Helper.getAddressByIndex(sheet,parsedRefInChart.startRow,parsedRefInChart.startCol,sheet,parsedRefInChart.endRow,parsedRefInChart.endCol,params);
			}
		}
		return newRef;
	},
	
	_transformRefByDelta: function(startIndex, endIndex, start, end, delta)
	{
		if(start == websheet.Constant.INVALID_REF || end == websheet.Constant.INVALID_REF)
			start = end = -1;
		 if(delta.startIndex ==1){
	   	    if(start != -1){
	   	    	if(startIndex + delta.delta == start)
	   	    		start = startIndex;
	   	    	else
	   	    		end = end + delta.delta;
	   	    }
	   	    else{
	   	    	start = startIndex;
	   	    	end = startIndex + delta.delta-1;
	   	    }				   	    
	   }else{
	   		if(start!= -1)
	   			start = start - delta.delta;
	   		else{
	   			start = startIndex + delta.startIndex-1;
	   			end = start + delta.delta -1;
	   		}
	   }
	   return{"start":start, "end":end};
	},
	
	transformUnnamedRangeRow: function(prior, latter)
	{
		var priorAction = prior.action;
		var latterAction = latter.action;
		var priorRefValue = prior.reference.refValue;
		var latterRefValue = latter.reference.refValue;
		
		var handledRowRefValue = websheet.Helper.handleRefValue(latterRefValue,this.Event.SCOPE_ROW);		
		var parsedRowRef = websheet.Helper.parseRef(handledRowRefValue);
		
		var parsedRangeRef = websheet.Helper.parseRef(priorRefValue);		
		var rangeStartRow = parsedRangeRef.startRow;
		var	rangeEndRow = parsedRangeRef.endRow;
		
		if(parsedRowRef.sheetName != parsedRangeRef.sheetName){ 
			if(!latter.OTResult && latterAction == this.Event.ACTION_INSERT 
					&& priorAction == this.Event.ACTION_INSERT && prior.data 
					&& prior.data.usage == websheet.Constant.RangeUsage.CHART)
			{
				if(latter.data && latter.data.undoCharts){
					var chartId = prior.data.rangeid;
					delete latter.data.undoCharts[chartId];
				}
			}
			return;
		}
		if(latterAction == this.Event.ACTION_SET || latterAction == this.Event.ACTION_CLEAR)
		{
			if(priorAction == this.Event.ACTION_SET || priorAction == this.Event.ACTION_CLEAR)
			{
				if((rangeStartRow>=parsedRowRef.startRow && rangeStartRow<=parsedRowRef.endRow) ||
				  (rangeEndRow >=parsedRowRef.startRow && rangeEndRow<=parsedRowRef.endRow) ||
				  (rangeStartRow<=parsedRowRef.startRow && rangeEndRow>=parsedRowRef.endRow))
				 {
					latter.extraArray[this._localEventIdx] = prior;
				 }
			}
		}
		else if(latterAction == this.Event.ACTION_DELETE)
		{
			if(parsedRowRef.startRow <= rangeStartRow && parsedRowRef.endRow >= rangeEndRow){
				this.docAgent.rollbackAddedTask(prior.data.rangeid);
				this.getOTManager().conflictResolve(this._index);
				if (this._isAtomicMsg()) {
					// prior is cut message and here we let delete go. In the other client and server side the cut message
					// will not execute. Here we need to UNDO the cut to sync with others
					this.getOTManager().perform(this._index);
				}
			}
			//If the filter is deleted by delete row, autofill action will be impacted
			if(prior.data && prior.data.ignoreFilteredRow)
			{
				var rangeInfo = this.docAgent.getFilterRange(parsedRowRef.sheetName);
				if(rangeInfo!=null)
				{
					var filterHeaderRow = rangeInfo.startRow;
					if(filterHeaderRow>=parsedRowRef.startRow && filterHeaderRow<=parsedRowRef.endRow)
						latter.OTResult=1;
				}
			}
			
			if(prior.data && prior.data.usage == websheet.Constant.RangeUsage.FILTER)
			{
				if(rangeStartRow >= parsedRowRef.startRow && rangeStartRow  <= parsedRowRef.endRow)
					latter.OTResult = 1;				
			}
		}
		else if(latterAction == this.Event.ACTION_INSERT)
		{
			if(priorAction == this.Event.ACTION_SET || priorAction == this.Event.ACTION_CLEAR)
			{
				if(parsedRowRef.startRow > rangeStartRow && parsedRowRef.startRow <= rangeEndRow)
				{
					if(priorAction == this.Event.ACTION_CLEAR )
					{
						var extra = websheet.Helper.cloneJSON(prior);
						parsedRangeRef.startRow = parsedRowRef.startRow;
						parsedRangeRef.endRow = parsedRowRef.endRow;
						extra.reference.refValue = parsedRangeRef.toString();
						
						latter.extraArray[this._localEventIdx] = extra;
					}
					else
					{					
						latter.OTResult=1;
					}
				}
				else if(parsedRowRef.startRow == rangeEndRow + 1 || parsedRowRef.startRow == 1)
				{
					latter.OTResult=1;
				}
			}
			if(!latter.OTResult && priorAction == this.Event.ACTION_INSERT && prior.data 
					&& prior.data.usage == websheet.Constant.RangeUsage.CHART)
			{
				if(latter.data && latter.data.undoCharts){
					var chartId = prior.data.rangeid;
					delete latter.data.undoCharts[chartId];
				}
				if(latter.data && latter.data.undoRanges){
					var chartId = prior.data.rangeid;
					delete latter.data.undoRanges[chartId];
				}
			}				
		}
	},
	
	transformUnnamedRangeCol: function(prior, latter)
	{
		var parsedColRef = websheet.Helper.parseRef(latter.reference.refValue);
		var isCol = parsedColRef.startCol;
		var ieCol = parsedColRef.endCol;
		var parsedRangeRef = websheet.Helper.parseRef(prior.reference.refValue);	
		var iRangeSCol = parsedRangeRef.startCol;
		var iRangeECol = parsedRangeRef.endCol;
		
		if(parsedColRef.sheetName != parsedRangeRef.sheetName){ 
			if(!latter.OTResult && latter.action == this.Event.ACTION_INSERT
					&& prior.action == this.Event.ACTION_INSERT && prior.data 
					&& prior.data.usage == websheet.Constant.RangeUsage.CHART)
			{
				if(latter.data && latter.data.undoCharts){
					var chartId = prior.data.rangeid;
					delete latter.data.undoCharts[chartId];
				}
			}		
			return;		
		}
		
		if(latter.action == this.Event.ACTION_DELETE)
		{
			if(isCol <= iRangeSCol && ieCol >= iRangeECol ){
			    
			    if (prior.action == websheet.Constant.RangeUsage.FILTER){
    			    //always delete the range 
        			var rangeId = prior.data.rangeid;
        			this.docAgent.deleteRange(rangeId);
			    }else{
			    	this.docAgent.rollbackAddedTask(prior.data.rangeid);
			    	if(this._isAtomicMsg())
			    		this.getOTManager().perform(this._index);
			    }
			    
				this.getOTManager().conflictResolve(this._index);
			}
			return;
		}
		if(prior.action == this.Event.ACTION_SET || prior.action == this.Event.ACTION_CLEAR)
		{
			if(latter.action  == this.Event.ACTION_INSERT)
			{
				latter.OTResult=1;
			}
			else if(latter.action == this.Event.ACTION_SET)
			{
				if(iRangeSCol >= isCol && iRangeSCol <= ieCol || isCol >= iRangeSCol && isCol <= iRangeECol )
				{
					if(!latter.data) latter.data = {};
					latter.extraArray[this._localEventIdx] = prior;
				}
			}
		}
		if(!latter.OTResult && latter.action == this.Event.ACTION_INSERT
				&& prior.action == this.Event.ACTION_INSERT && prior.data 
				&& prior.data.usage == websheet.Constant.RangeUsage.CHART)
		{
			if(latter.data && latter.data.undoCharts){
				var chartId = prior.data.rangeid;
				delete latter.data.undoCharts[chartId];
			}
			if(latter.data && latter.data.undoRanges){
				var chartId = prior.data.rangeid;
				delete latter.data.undoRanges[chartId];
			}
		}
	},
	
	transformColUnnamedRange: function(prior, latter)
	{
		if(latter.data && latter.data.data && latter.data.data.bSheet)
			return;
		var priorAction = prior.action;
		var latterAction = latter.action;
		var priorRefValue = prior.reference.refValue;
		var latterRefValue = latter.reference.refValue;
		
		var parsedColRef = websheet.Helper.parseRef(priorRefValue);
		var startColumn = parsedColRef.startCol;
		var endColumn = parsedColRef.endCol;
		
		var parsedRangeRef = websheet.Helper.parseRef(latterRefValue);		
		var rangeStartRow = parsedRangeRef.startRow;
		var	rangeEndRow = parsedRangeRef.endRow;
		var rangeStartColumn = parsedRangeRef.startCol;
		var	rangeEndColumn = parsedRangeRef.endCol;
		var params = {refMask: parsedRangeRef.refMask};
		
		//the latter action is set range
		if(latterAction == this.Event.ACTION_SET)
		{		
			if(parsedColRef.sheetName == parsedRangeRef.sheetName)
			{
				if(startColumn <= rangeEndColumn + 1) {
					// for insert column, set range may affect the result
					latter.OTResult=1;
				}
			}
		}
		else
		{
			if(priorAction == this.Event.ACTION_INSERT)
			{
				if(parsedColRef.sheetName == parsedRangeRef.sheetName )
				{
					var insertColNum = endColumn - startColumn + 1;
					if(startColumn<=rangeStartColumn)
					{
						var newStartCol = websheet.Helper.getColChar(rangeStartColumn + insertColNum);
						var newEndCol = websheet.Helper.getColChar(rangeEndColumn + insertColNum);
						var newColRef =  websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,rangeStartRow,newStartCol,null,rangeEndRow,newEndCol,params);
						latter.reference.refValue = newColRef;
					}
					else if(startColumn>rangeStartColumn && startColumn<=rangeEndColumn)
					{
						var newStartCol = websheet.Helper.getColChar(rangeStartColumn);
						var newEndCol = websheet.Helper.getColChar(rangeEndColumn + insertColNum);
						var newColRef =  websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,rangeStartRow,newStartCol,null,rangeEndRow,newEndCol,params);
						latter.reference.refValue = newColRef;
					}
				}
			}
			else if(priorAction == this.Event.ACTION_DELETE)
			{
				if(parsedColRef.sheetName == parsedRangeRef.sheetName )
				{
					var deleteColNum = endColumn - startColumn + 1;
					if(endColumn<rangeStartColumn)
					{
						var newStartCol = websheet.Helper.getColChar(rangeStartColumn-deleteColNum);
						var newEndCol = websheet.Helper.getColChar(rangeEndColumn - deleteColNum);
						var newColRef =  websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,rangeStartRow,newStartCol,null,rangeEndRow,newEndCol,params);
						latter.reference.refValue = newColRef;
					}
					else if(startColumn<rangeStartColumn && endColumn>=rangeStartColumn && endColumn<rangeEndColumn)
					{
						var newStartCol = websheet.Helper.getColChar(startColumn);
						var newEndCol = websheet.Helper.getColChar(rangeEndColumn - deleteColNum);
						var newColRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,rangeStartRow,newStartCol,null,rangeEndRow,newEndCol,params);
						latter.reference.refValue = newColRef;
					}
					else if( startColumn<=rangeStartColumn &&  endColumn>=rangeEndColumn)
					{
						latter.OTResult=2;
					}
					else if(startColumn>=rangeStartColumn && endColumn<=rangeEndColumn)
					{
						var newStartCol = websheet.Helper.getColChar(rangeStartColumn);
						var newEndCol = websheet.Helper.getColChar(rangeEndColumn - deleteColNum);
						var newColRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,rangeStartRow,newStartCol,null,rangeEndRow,newEndCol,params);
						latter.reference.refValue = newColRef;
					}
					else if(startColumn>=rangeStartColumn && startColumn<=rangeEndColumn && endColumn>rangeEndColumn)
					{
						var newStartCol = websheet.Helper.getColChar(rangeStartColumn);
						var newEndCol = websheet.Helper.getColChar(rangeStartColumn-1);
						var newColRef = websheet.Helper.getAddressByIndex(parsedRangeRef.sheetName,rangeStartRow,newStartCol,null,rangeEndRow,newEndCol,params);
						latter.reference.refValue = newColRef;
					}
				}
			}
		}
		
		//if not undoredo or ignore, then transform data source of chart.
		if((priorAction == this.Event.ACTION_DELETE || priorAction == this.Event.ACTION_INSERT) && !latter.OTResult 
				&& latter.data && latter.data.usage == websheet.Constant.RangeUsage.CHART){
			//delete action effect the boundary of the chart
			if(priorAction == this.Event.ACTION_DELETE && parsedColRef.sheetName == parsedRangeRef.sheetName && latter.data.data){
				if(startColumn <= rangeStartColumn && endColumn >= rangeStartColumn){
					latter.data.data.x = 0;
				}
				if(startColumn <= rangeEndColumn && endColumn >= rangeEndColumn){
					latter.data.data.ex = -1;
				}
			}
			else if(priorAction == this.Event.ACTION_INSERT && parsedColRef.sheetName == parsedRangeRef.sheetName){
				if(prior.data && prior.data.undoRanges){
					var chartId = latter.data.rangeid;
					var undoRange = prior.data.undoRanges[chartId];
					if(undoRange && undoRange.usage == websheet.Constant.RangeUsage.CHART){
						var parsedLatterRef = websheet.Helper.parseRef(latter.reference.refValue);	
						var rangeStartColumn = parsedLatterRef.startCol;
						var	rangeEndColumn = parsedLatterRef.endCol;
						var ret = this._transformRefByDelta(startColumn, endColumn,rangeStartColumn, rangeEndColumn, undoRange);
						var params = {refMask: parsedLatterRef.refMask};
						var newRef = websheet.Helper.getAddressByIndex(parsedLatterRef.sheetName,parsedLatterRef.startRow,ret.start,parsedLatterRef.sheetName,parsedLatterRef.endRow,ret.end,params);
						latter.reference.refValue = newRef;
						if(undoRange.data && latter.data.data){
							for(var attr in undoRange.data)
					   		{
					   			latter.data.data[attr] = undoRange.data[attr];
					   		}
						}
					}
				}
			}
			var undoCharts;
			if(priorAction == this.Event.ACTION_INSERT && prior.data && prior.data.undoCharts)
				undoCharts = prior.data.undoCharts;
			this.transformDataSourceInChart(latter, "column", priorAction,{"parsedRef" : parsedColRef, "undoCharts" : undoCharts});
		}
	},

	transformCellUnnamedRange:function(prior, latter){
		var priorAction = prior.action;
		var latterAction = latter.action;
		var priorRefValue = prior.reference.refValue;
		var latterRefValue = latter.reference.refValue;
		
		var parsedRangeRef = websheet.Helper.parseRef(latterRefValue);
		var parsedCellRef = websheet.Helper.parseRef(priorRefValue);
		
		if(parsedRangeRef.sheetName == parsedCellRef.sheetName)
		{
			var rangeStartRow = parsedRangeRef.startRow;
			var	rangeEndRow = parsedRangeRef.endRow;
			var rangeStartColumn = parsedRangeRef.startCol;
			var	rangeEndColumn = parsedRangeRef.endCol;
			
			var cellRow = parsedCellRef.startRow;
			var	cellCol = parsedCellRef.startCol;		
					
			if(cellRow >= rangeStartRow && cellRow <= rangeEndRow && cellCol >= rangeStartColumn && cellCol <= rangeEndColumn)
			{
				var wconstRangeUsage = websheet.Constant.RangeUsage;
				// cell in range
				if (latter.data.usage == wconstRangeUsage.COMMENTS || latter.data.usage == wconstRangeUsage.TASK)
				{
					// the coming message is collaboration message, no OT
					return;
				}
				else if (latter.action == this.Event.ACTION_SET && latter.data.bR)
				{
					// latter is paste range, set cell again
					latter.extraArray[this._localEventIdx] = prior;
				}
				else
				{
					latter.OTResult=1;
				}
			}				
		}
	},
	
	transformUnnamedRangeCell:function(prior, latter){
		var priorAction = prior.action;
		var latterAction = latter.action;
		var priorRefValue = prior.reference.refValue;
		var latterRefValue = latter.reference.refValue;
		
		var parsedRangeRef = websheet.Helper.parseRef(priorRefValue);
		var parsedCellRef = websheet.Helper.parseRef(latterRefValue);
		
		if(parsedRangeRef.sheetName == parsedCellRef.sheetName)
		{
			var rangeStartRow = parsedRangeRef.startRow;
			var	rangeEndRow = parsedRangeRef.endRow;
			var rangeStartColumn = parsedRangeRef.startCol;
			var	rangeEndColumn = parsedRangeRef.endCol;
			
			var cellRow = parsedCellRef.startRow;
			var	cellCol = parsedCellRef.startCol;		
						
			if(cellRow >= rangeStartRow && cellRow <= rangeEndRow && cellCol >= rangeStartColumn && cellCol <= rangeEndColumn)
			{
				var wconstRangeUsage = websheet.Constant.RangeUsage;
				// cell in range
				if (prior.data.usage == wconstRangeUsage.COMMENTS || prior.data.usage == wconstRangeUsage.TASK)
				{
					// the coming message is collaboration message, no OT
					return;
				}
				/*
				 * range | cell		value	style	paste
				 * paste			STP		STP		STP
				 * style			--		*		*
				 * set value		**		--		**
				 * set style		--		RD		***
				 * clear			STP		--		****
				 * 
				 * STP: stop cell message
				 * RD: redo range message
				 * [*] merge range style to cell style
				 * [**] if in range, cell has value, remove value, else, go
				 * [***] if cell has style, RD, else, go
				 * [****] remove value and go
				 */
				var type = this.getRangeMsgType(prior);
				switch (type)
				{
				case this.PASTE:
					latter.OTResult=2;
					break;
				case this.STYLE:
			 		// merge range style
			 		var priorStyle = prior.data.style;
			 		var latterStyle = latter.data.cell.style
			 		if (latterStyle)
			 		{
			 			// latter is set cell style, merge 2 styles
			 			var t = websheet.Constant.PARAM_TYPE.JSON;
						var priorStyleCode = new websheet.style.StyleCode(t, priorStyle);
						var latterStyleCode = new websheet.style.StyleCode(t, latterStyle);
						priorStyleCode.mergeStyle(latterStyleCode);
						latter.data.cell.style = priorStyleCode.toJSON();
			 		}
			 		break;
			 	case this.UNDO_CLEAR:
			 		// undo range data
			 		if (latter.data.cell.v)
			 		{
			 			// latter is set cell value
			 			// if prior has value that latter going to set, then stop latter
			 			var rows = prior.data.rows;
			 			var row = rows[cellRow];
			 			if (row)
			 			{
			 				var colChar = websheet.Helper.getColChar(parsedCellRef.startCol);
			 				var cell = row.cells[colChar];
			 				if (cell && cell.v)
			 				{
			 					if (cell.style)
			 					{
			 						delete cell.v;
			 					}
			 					else
			 					{
				 					latter.OTResult=2;
			 					}
			 				}
			 			}
			 		}
			 		break;
			 	case this.UNDO_STYLE:
		 			// undo set style
		 			if (latter.data.cell.style)
		 			{
		 				latter.extraArray[this._localEventIdx] = prior;
		 			}
		 			break;
		 		case this.CLEAR:
					if (latter.data.cell.v)
					{
						// set cell value, ignore
						if (latter.data.cell.style)
						{
							delete latter.data.cell.v;
						}
						else
						{
							latter.OTResult=2;
						}
					}
					break;
				default:
					break;
				}
			}
		}
	},
	
	/* range message type, prior side */
	PASTE: 1,
	STYLE: 1 << 1,
	UNDO_CLEAR: 1 << 2,
	UNDO_STYLE: 1 << 3,
	CLEAR: 1 << 4,
	/* latter side */
	LATTER_PASTE: 1 << 10,
	LATTER_STYLE: 1 << 11,
	LATTER_UNDO_CLEAR: 1 << 12,
	LATTER_UNDO_STYLE: 1 << 13,
	LATTER_CLEAR: 1 << 14,
	/*
	 * return range message type, return constant defined above
	 */
	getRangeMsgType: function(event, bLatter)
	{
		var ret;
		if (event.action == this.Event.ACTION_SET)
		{
			 if (event.data.bR)
			 {
			 	ret = this.PASTE;
			 }
			 else
			 {
			 	if (event.data.style)
			 	{
			 		ret = this.STYLE;
			 	}
			 	else
			 	{
	 				var rows = event.data.rows;
					for (var rowIndex in rows)
					{
						var row = rows[rowIndex];
						var cells = row.cells;
						for (var colIndex in cells)
						{
							var cell = cells[colIndex];
							ret = (cell.v != undefined) ? this.UNDO_CLEAR : this.UNDO_STYLE;
							break;
						}
						break;
					}
			 	}
			 }
		}
		else if (event.action == this.Event.ACTION_CLEAR)
		{
			ret = this.CLEAR;
		}
		return bLatter ? ret << 10 : ret;
	},
	
	transformUnnamedRangeUnnamedRange:function(prior, latter){
		var priorAction = prior.action;
		var latterAction = latter.action;
		var priorRefValue = prior.reference.refValue;
		var latterRefValue = latter.reference.refValue;
		
		var parsedRange1 = websheet.Helper.parseRef(latterRefValue);
		var parsedRange2 = websheet.Helper.parseRef(priorRefValue);
		
		if(parsedRange1.sheetName == parsedRange2.sheetName)
		{
			var wsConstRangeUsage = websheet.Constant.RangeUsage;
			if (latter.data.usage == wsConstRangeUsage.COMMENTS)
			{
				if(prior.data.usage == wsConstRangeUsage.COMMENTS )
				{
					if(latterAction == this.Event.ACTION_INSERT && priorAction == this.Event.ACTION_INSERT && latterRefValue == priorRefValue)
						this.getOTManager().perform(this._index);
					else if(latter.data.rangeid ==  prior.data.rangeid){
						if(priorAction == this.Event.ACTION_SET && latterAction == this.Event.ACTION_SET
							&& latter.data.data && latter.data.data.action == "append" && prior.data.data && prior.data.data.action == "append")
							latter.OTResult = 1;
						else if(priorAction == this.Event.ACTION_DELETE && this.Event.ACTION_DELETE)
							latter.OTResult = 2;
					}
				}
				return;
			}

			if(latter.data && prior.data && latter.data.usage == wsConstRangeUsage.CHART && prior.data.usage == wsConstRangeUsage.CHART)
			{
				if(latter.data.rangeid == prior.data.rangeid)
					{
						if(priorAction == this.Event.ACTION_SET && latterAction == this.Event.ACTION_SET){//set the same chart size or position
							if((!latter.data.data || !latter.data.data.chart) && (!prior.data.data || !prior.data.data.chart)){
								latter.reference.refValue = priorRefValue;
								if(prior.data.data){
									for(var attr in prior.data.data){
										if(latter.data.data[attr])
											delete latter.data.data[attr];
									}
								}
								//latter.OTResult = 2;
								return;
							}	
						}
						if(priorAction == this.Event.ACTION_DELETE && latterAction == this.Event.ACTION_DELETE){//delete
							//latter.OTResult = 2;
							this.removeAction();
							return;
						}
				}
			}
			
			if((latter.data && latter.data.usage == wsConstRangeUsage.CHART) ||(prior.data  && prior.data.usage == wsConstRangeUsage.CHART))
				return;
			
            //one sheet has one filter
			if ((latter.data.usage == wsConstRangeUsage.FILTER && prior.data.usage == wsConstRangeUsage.FILTER)
			|| (latter.data.usage == wsConstRangeUsage.FILTER && prior.action == wsConstRangeUsage.FILTER))
			{
				latter.OTResult = 2;
        		this.getOTManager().conflictResolve(this._index);
				return;
			}
						
			var sRow1 = parsedRange1.startRow;
			var	eRow1 = parsedRange1.endRow;
			var sCol1 = parsedRange1.startCol;
			var	eCol1 = parsedRange1.endCol;
			
			var sRow2 = parsedRange2.startRow;
			var	eRow2 = parsedRange2.endRow;
			var sCol2 = parsedRange2.startCol;
			var	eCol2 = parsedRange2.endCol;
			
			var rangeInfo1 = {}; // latter
			rangeInfo1.sheetName = parsedRange1.sheetName;
			rangeInfo1.startCol = sCol1;
			rangeInfo1.endCol = eCol1;
			rangeInfo1.startRow = sRow1;
			rangeInfo1.endRow = eRow1;
			
			var rangeInfo2 = {}; // prior
			rangeInfo2.sheetName = parsedRange2.sheetName;
			rangeInfo2.startCol = sCol2;
			rangeInfo2.endCol = eCol2;
			rangeInfo2.startRow = sRow2;
			rangeInfo2.endRow = eRow2;
			
			var rel = websheet.Helper.compareRange(rangeInfo1, rangeInfo2);
			var wsConstRangeRelation = websheet.Constant.RangeRelation;
			
			if (rel == wsConstRangeRelation.NOINTERSECTION)
			{
				return;
			}
		
			//If the two new created task ranges have intersection, the latter task will be rejected
			if((prior.data.usage == wsConstRangeUsage.TASK) && (latter.data.usage == wsConstRangeUsage.TASK) && 
			   (priorAction==this.Event.ACTION_INSERT) && (latterAction==this.Event.ACTION_INSERT))
			{
				this.docAgent.rollbackAddedTask(prior.data.rangeid);
				this.getOTManager().conflictResolve(this._index);
				return;
			}
			else if(latter.data.usage == wsConstRangeUsage.TASK)
				return;
			
			if (prior.data.usage == wsConstRangeUsage.ACCESS_PERMISSION)
			{
				if(latter.data.usage == wsConstRangeUsage.ACCESS_PERMISSION)
				{
					if(priorAction == this.Event.ACTION_INSERT || priorAction == this.Event.ACTION_SET){
						if(latterAction == this.Event.ACTION_INSERT || latterAction == this.Event.ACTION_SET){
							this.getOTManager().perform(this._index);
						}
					}
				}
				return;
			}else if(latter.data.usage == wsConstRangeUsage.ACCESS_PERMISSION)
				return;
			
			var priorType = this.getRangeMsgType(prior);
			var latterType = this.getRangeMsgType(latter, true);
			var eventType = priorType | latterType;
			
			if (rel == wsConstRangeRelation.EQUAL || rel == wsConstRangeRelation.SUBSET)
			{
				// prior range >= latter range
				// prior will overwrite the latter event
				/*
				 * prior | latter	paste	style	set data	set style	clear
				 * paste			STP		STP		STP			STP			STP
				 * style			RD		*		--			RD			--
				 * set data			RD		--		RD			--			STP
				 * set style		RD		RD		--			RD			--
				 * clear			**		--		STP			--			STP
				 * 
				 * [*] merge prior style to latter style
				 * [**]	remove value in latter paste data
				 */
				switch (eventType)
				{
					case this.PASTE | this.LATTER_PASTE:
					case this.PASTE | this.LATTER_STYLE:
					case this.PASTE | this.LATTER_UNDO_CLEAR:
					case this.PASTE | this.LATTER_UNDO_STYLE:
					case this.PASTE | this.LATTER_CLEAR:
					case this.UNDO_CLEAR | this.LATTER_CLEAR:
					case this.CLEAR | this.LATTER_UNDO_CLEAR:
					case this.CLEAR | this.LATTER_CLEAR:
						latter.OTResult=2;
						break;
					case this.STYLE | this.LATTER_PASTE:
					case this.STYLE | this.LATTER_UNDO_STYLE:
					case this.UNDO_CLEAR | this.LATTER_PASTE:
					case this.UNDO_CLEAR | this.LATTER_UNDO_CLEAR:
					case this.UNDO_STYLE | this.LATTER_PASTE:
					case this.UNDO_STYLE | this.LATTER_STYLE:
					case this.UNDO_STYLE | this.LATTER_UNDO_STYLE:
						latter.extraArray[this._localEventIdx] = prior;
						break;
					case this.STYLE | this.LATTER_STYLE:
			 			// latter is set range style, merge prior style to latter style
						latter.data.style = this.mergeStyles(prior.data.style, latter.data.style);
						break;
					case this.CLEAR | this.LATTER_PASTE:
			 			var rows = latter.data.rows;
			 			for (var rowIndex in rows)
			 			{
			 				var cells = rows[rowIndex].cells;
			 				if (!cells)
			 				{
			 					continue;
			 				}
			 				
			 				for (var colIndex in cells)
			 				{
			 					var cell = cells[colIndex];
			 					if (cell.v)
			 					{
			 						delete cell.v;
			 					}
			 				}
			 			}
			 			break;
			 		default:
			 			break;
				}
			}
			else if (rel == wsConstRangeRelation.SUPERSET || rel == wsConstRangeRelation.INTERSECTION)
			{
				/*
				 * prior | latter	paste	style	set data	set style	clear
				 * paste			RD		RD		RD			RD			RD
				 * style			RD		RD		--			RD			--
				 * set data			RD		--		RD			--			RD
				 * set style		RD		RD		--			RD			--
				 * clear			RD		--		RD			--			--
				 */
				 
				switch (eventType)
				{
					case this.STYLE | this.LATTER_UNDO_CLEAR:
					case this.STYLE | this.LATTER_CLEAR:
					case this.UNDO_CLEAR | this.LATTER_STYLE:
					case this.UNDO_CLEAR | this.LATTER_UNDO_STYLE:
					case this.UNDO_STYLE | this.LATTER_UNDO_CLEAR:
					case this.UNDO_STYLE | this.LATTER_CLEAR:
					case this.CLEAR | this.LATTER_STYLE:
					case this.CLEAR | this.LATTER_UNDO_STYLE:
					case this.CLEAR | this.LATTER_CLEAR:
						// no OT
						break;
					default:
						latter.extraArray[this._localEventIdx] = prior;
						break;
				}
			}
		}
	},
	
	transformSheetSheet:function(prior, latter){
		// this OT have conflict with #preHandleDltSheet#, need much care when prior is DELETE, or latter is DELETE.
		var priorAction = prior.action;
		var latterAction = latter.action;
		var latterSetVisibility = false;
		var priorSetVisibility = false;		
		if (priorAction == this.Event.ACTION_SET && prior.data.sheet.visibility != undefined)
			priorSetVisibility = true;
		if (latterAction == this.Event.ACTION_SET && latter.data.sheet.visibility != undefined)
			latterSetVisibility = true;
		var priorGridlines = false;
		var laterGridlines = false;
		if (priorAction == this.Event.ACTION_SET && (prior.data.sheet.offGridLine === false || prior.data.sheet.offGridLine === true))
			priorGridlines = true;
		if (latterAction == this.Event.ACTION_SET && (latter.data.sheet.offGridLine === false || latter.data.sheet.offGridLine === true))
			laterGridlines = true;
		var laterRename = (laterGridlines || latterSetVisibility) ? false : true;
		var priorRename = (priorGridlines || priorSetVisibility) ? false : true;
		
		// incoming is rename event
		if (latterAction == this.Event.ACTION_SET && laterRename)
		{
			switch (priorAction)
			{
				case this.Event.ACTION_SET:
					if (priorRename){
						// incoming is rename, local is rename
						var latterValue = latter.reference.refValue;
						var latterName = latter.data.sheet.sheetname;
						var prefValue = prior.reference.refValue;
						var priorName = prior.data.sheet.sheetname;
						
						if (priorName == latterName)
						{
							//conflict handling. Rollback any local messages
							//and send conflictResolve message to server
							this.getOTManager().perform(this._index);
						}
						if((prefValue == latterValue)&&(priorName != latterName))
							latter.OTResult=2;						
					}
					else {
						//incoming is a rename event, local is a hide/unhide sheet or set gridlines event
						//no need OT					
					}
					break;
				case this.Event.ACTION_INSERT:
					var latterName = latter.data.sheet.sheetname;
					var priorName = prior.data.sheet.sheetname;
					
					if (priorName == latterName)
					{
						//undo the prior event, then continue
						this.getOTManager().perform(this._index);
					}						
					break;			
				case this.Event.ACTION_DELETE:
					var latterValue = latter.reference.refValue;
					var prefValue = prior.reference.refValue;					
					var sheetName = prefValue.split("|")[0];					
					if (sheetName == latterValue)
					{
						// #preHandleDltSheet# prior is DELETE and latter is not, in pre, did UNDO-REDO, 
						// here let the latter message not apply, it is good
						latter.OTResult=2;
					}
					break;
				case this.Event.ACTION_MOVE:
					// no OT needed
					break;
			}
		}
		//incoming is a hide/unhide or set gridlines sheet event
		else if (latterAction == this.Event.ACTION_SET && !laterRename)
		{
			switch (priorAction)
			{
				case this.Event.ACTION_SET:
					if (priorRename){
						//incoming is a hide/unhide sheet or set gridlines event, local is a rename sheet event
						var prefValue = prior.reference.refValue; // old sheetname
						var priorName = prior.data.sheet.sheetname; // new sheetname
						
						var latterValue = latter.reference.refValue;
						var latterName = latterValue.split("|")[0];
						
						//if old sheet name equals incoming event sheet name,
						//it means some one hide the sheet before you change its name 
						//need change incoming event(old sheet name -> new sheet name)
						if ( prefValue == latterName)
						{
							if (latterValue.split("|")[1] != undefined)
								latter.reference.refValue = priorName + "|" + latterValue.split("|")[1];
							else
								latter.reference.refValue = priorName;							
						}
						
					}
					else if (latterSetVisibility && priorSetVisibility){
						//incoming is a hide/unhide sheet event, local is a hide/unhide sheet event						
						var preRefValue = prior.reference.refValue;
						var latterRefValue = latter.reference.refValue;
						var preArray = preRefValue.split("|");
						var latterArray = latterRefValue.split("|");
						var preSheetCount = preArray[1];					
						var preSheetName = preArray[0];
						var latterSheetName = latterArray[0];
						
						var pre_visibility_setting = prior.data.sheet.visibility;
						var pre_hide_sheet = false;
						if (pre_visibility_setting == "hide") 
							pre_hide_sheet = true;
						var latter_visibility_setting = latter.data.sheet.visibility;
						var latter_hide_sheet = false;
						if (latter_visibility_setting == "hide") 
							latter_hide_sheet = true;
												
						if (pre_hide_sheet && latter_hide_sheet && preSheetCount == 2 && preSheetName != latterSheetName )
						{
							//local is hide one sheet, incoming is hide another sheet,
							//and there are only 2 visible sheets, need undo local event
							this.getOTManager().perform(this._index);
						}
						else if (preSheetName == latterSheetName)						
							latter.OTResult=2;						
					}
					else if (priorGridlines && laterGridlines){
						//incoming is a set gridlines event, local is a set gridlines event						
						var preSheetName = prior.reference.refValue;
						var latterSheetName = latter.reference.refValue;
						if (preSheetName == latterSheetName)						
							latter.OTResult=2;						
					}					
					break;
				case this.Event.ACTION_DELETE:
					//incoming is a hide/unhide sheet or set gridlines event, local is a delete sheet event
					var preRefValue = prior.reference.refValue;
					var latterRefValue = latter.reference.refValue;
					var preSheetName = preRefValue;
					var latterSheetName = latterRefValue;
					var preSheetCount = null;
					if(latterSetVisibility) { //incoming is a hide/unhide sheet
						var preArray = preRefValue.split("|");
						var latterArray = latterRefValue.split("|");
						preSheetCount = preArray[2];					
						preSheetName = preArray[0];
						latterSheetName = latterArray[0];
					}
					
					var visibility_setting = latter.data.sheet.visibility;
					var hide_sheet = false;
					if (visibility_setting == "hide") 
						hide_sheet = true;
					//local has 2 visible sheets, incoming one hide sheet event to hide the other sheet
					if(preSheetCount == 2 && preSheetName != latterSheetName && hide_sheet)
					{
						this.getOTManager().perform(this._index);
					}					
					else if (preSheetName == latterSheetName)
					{
						//incoming is a hide/unhide sheet event, local is a delete sheet event
						//use local event
						latter.OTResult = 2;
					}
					break;
			}
		
		}
		else if (latterAction == this.Event.ACTION_INSERT)
		{
			switch (priorAction)
			{
				case this.Event.ACTION_SET: 
					if (!priorSetVisibility){
						var latterName = latter.data.sheet.sheetname;
						var priorName = prior.data.sheet.sheetname;
						
						if (priorName == latterName)
						{
							//undo the prior event, then continue
							this.getOTManager().perform(this._index);
						}
					}
					break;
				case this.Event.ACTION_INSERT:
				{
					var latterIndex = latter.data.sheet.sheetindex;
					var priorIndex = prior.data.sheet.sheetindex;
					var latterName = latter.data.sheet.sheetname;
					var priorName = prior.data.sheet.sheetname;
					
					if (priorName == latterName)
					{
						//undo the prior event, then continue
						this.getOTManager().perform(this._index);
					}
					else if (latterIndex>priorIndex)
	            	{
	            		latter.data.sheet.sheetindex++;
	            	}
			    }
				break;
				case this.Event.ACTION_DELETE:
				{
					var latterIndex = latter.data.sheet.sheetindex;
					var prefValue = prior.reference.refValue;
					var priorIndex = parseInt(prefValue.split("|")[1]);
					
					// #preHandleDltSheet# prior is DELETE and latter is INSERT, in pre, 
					// only UNDO-REDO when prior and latter operates on the same sheet, it is not possible in this case,
					// so here it is good
					if (latterIndex>priorIndex)
	            	{
	            		latter.data.sheet.sheetindex--;
	            	}
			    }
				break;
				//TODO: use undo&redo
				case this.Event.ACTION_MOVE:
				{
					var latterIndex = latter.data.sheet.sheetindex;
					var prefValue = prior.reference.refValue;
		            var priorIndex = parseInt(prefValue.split("|")[1]);
		            var delta = prior.data.delta;
		            latter.OTResult=1;
			    }
				break;
			}
		}
		else if (latterAction == this.Event.ACTION_DELETE)
		{
			switch (priorAction)
			{
					case this.Event.ACTION_SET: 
					{
						if (!priorSetVisibility){
							var prefValue = prior.reference.refValue; // old sheetname
							var priorName = prior.data.sheet.sheetname; // new sheetname
							
							var latterValue = latter.reference.refValue;
							var latterName = latterValue.split("|")[0];
							
							if ( prefValue == latterName)
							{
								// #preHandleDltSheet# prior is not DELETE and latter is DELETE, in pre, prior is UNDOed,
								// no need to transform latter any more. 
	
								// NO NEED TO DO delete a renamed sheet. So delete event need to be transformed
								// var latterIndex = latterValue.split("|")[1];
								// latter.reference.refValue = priorName+"|"+latterIndex;
								// this.getOTManager().conflictResolve(this._index);
							}
						}
						else {
							//incoming is a delete sheet event, local is a hide/unhide sheet event
							var preRefValue = prior.reference.refValue;
							var latterRefValue = latter.reference.refValue;
							var preArray = preRefValue.split("|");
							var latterArray = latterRefValue.split("|");
							var preSheetCount = preArray[1];					
							var preSheetName = preArray[0];
							var latterSheetName = latterArray[0];
							
							var visibility_setting = prior.data.sheet.visibility;
							var hide_sheet = false;
							if (visibility_setting == "hide") 
								hide_sheet = true;
							//local has 2 visible sheets, incoming one delete sheet event to delete the other sheet
							if(preSheetCount == 2 && preSheetName != latterSheetName && hide_sheet)
							{
								this.getOTManager().perform(this._index);
							}					
							else if (preSheetName == latterSheetName)
							{
								//incoming is a delete sheet event, local is a hide/unhide sheet event
								//need apply incoming event								
							}
						}
					}	
					break;
				case this.Event.ACTION_INSERT: // no OT needed
					//actually, no OT needed here, cause the sever side could not correct the delete message
					{
						var preRefValue = prior.reference.refValue;
						var latterRefValue = latter.reference.refValue; 
						var pSheetName = preRefValue.split("|")[0];
						var lSheetName = latterRefValue.split("|")[0];
						// #preHandleDltSheet# prior is not DELETE and latter is DELETE, in pre, 
						// prior is UNDOed only if pSheetName == lSheetName, this is impossible,
						// it is good

						if(pSheetName != lSheetName)
						{
							var lSheetIndex = this.docAgent.getSheetIndex(lSheetName);
							var pSheetIndex = prior.data.sheet.sheetindex;
							if(lSheetIndex < pSheetIndex)
							{
								var attrs = {delta:1};
								var event = new websheet.event.MoveSheet(pSheetName,attrs);
								latter.extraArray[this._localEventIdx] = event.getMessage().updates[0];
							}
						}
					}
					break;
				case this.Event.ACTION_DELETE: // no OT needed
					{
						var preRefValue = prior.reference.refValue;
						var latterRefValue = latter.reference.refValue;
						var preArray = preRefValue.split("|");
						var latterArray = latterRefValue.split("|");
						var preSheetCount = preArray[2];
						var latterSheetCount = latterArray[2];
						var preSheetName = preArray[0];
						var latterSheetName = latterArray[0];
						if(preSheetCount == 2 && preSheetName != latterSheetName)
						{
							this.getOTManager().perform(this._index);
						}
						else if(preSheetName == latterSheetName)
						{
		            		var oriUuid = null;
		            		var newUuid = null;
		            		if(prior.data && prior.data.sheet && prior.data.sheet.uuid)
		            			oriUuid =  prior.data.sheet.uuid;
		            		if(latter.data && latter.data.sheet && latter.data.sheet.uuid)
		            		    newUuid = latter.data.sheet.uuid;
		            		//both prior and latter are UI action, and they delete the same sheet
		            		if(oriUuid && newUuid)
		            		{
		            			var doc = websheet.model.ModelHelper.getDocumentObj();
		            			var recoverManager = doc.getRecoverManager();
		            			var info = recoverManager.getDeletedSheetInfo(oriUuid);
		            			recoverManager.clear(oriUuid);
		            			recoverManager.addDltSheetInfo(newUuid,info);
		            		}
		            		
		            		latter.OTResult=2;
		            		this.removeAction();
		            		this.getOTManager().conflictResolve(this._index);
						}
						else
						{
							prior.reference.refValue = preArray[0] + "|" + preArray[1] + "|" + parseInt(preSheetCount -1); 
						}						
					}
					break;
				case this.Event.ACTION_MOVE:
				{
					var lrefValue = latter.reference.refValue;
					var lsheetName = lrefValue.split("|")[0];
					var latterIndex = parseInt(lrefValue.split("|")[1]);
					var prefValue = prior.reference.refValue;
					var priorIndex = parseInt(prefValue.split("|")[1]);
					var pSheetName = prefValue.split("|")[0];
					var delta = prior.data.delta;
	            	
	            	if(pSheetName == lsheetName)
					{
						// #preHandleDltSheet# prior is not DELETE and latter is DELETE, in pre, prior is UNDOed,
	            		// this case UNDO move nothing to do with latter DELETE, it is good

						this.getOTManager().conflictResolve(this._index);
					}else{
						latter.OTResult=1;
					}
				}
				break;
			}
		}
		else if (latterAction == this.Event.ACTION_MOVE)
		{
			switch (priorAction)
			{
				case this.Event.ACTION_SET: 
				{
					var prefValue = prior.reference.refValue; // old sheetname
						var priorName = prior.data.sheet.sheetname; // new sheetname
						//not rename sheet
						if (priorName == undefined)
							break;
						
						var latterValue = latter.reference.refValue;
						var latterName = latterValue.split("|")[0];
						
						if ( prefValue == latterName)
						{
							// delete a renamed sheet. So delete event need to be transformed
							var latterIndex = latterValue.split("|")[1];
							latter.reference.refValue = priorName+"|"+latterIndex;
						}
				}
				break;
				case this.Event.ACTION_INSERT:
				{
					var lrefValue = latter.reference.refValue;
					var latterIndex = parseInt(lrefValue.split("|")[1]);
		            var delta = latter.data.delta;
		            var priorIndex = prior.data.sheet.sheetindex;
		            
		            if (delta <0)
	            	{
			            if ( priorIndex < latterIndex+delta )
			            {
			            	latterIndex++;
			            	var lsheetName = lrefValue.split("|")[0];
			            	latter.reference.refValue = lsheetName+"|"+latterIndex;
			            }
			            if ( (priorIndex <= latterIndex)&&(priorIndex>latterIndex+delta))
			            {
			            	latterIndex++;
			            	delta--;
			            	
			            	var lsheetName = lrefValue.split("|")[0];
			            	latter.reference.refValue = lsheetName+"|"+latterIndex;
			            	latter.data.delta = delta;
			            }
			        }
	            	if (delta > 0)
	            	{
	            		if ( priorIndex <= latterIndex )
			            {
			            	latterIndex++;
			            	var lsheetName = lrefValue.split("|")[0];
			            	latter.reference.refValue = lsheetName+"|"+latterIndex;
			            }
	            		else if ( (priorIndex <= latterIndex+delta)&&(priorIndex>latterIndex))
			            {
				            delta++;
				            latter.data.delta = delta;
			            }
	            	}
				}
				break;
				case this.Event.ACTION_DELETE:
				{
					var lrefValue = latter.reference.refValue;
					var larray = lrefValue.split("|");
					var lSheetName = larray[0];
					var latterIndex = parseInt(larray[1]);
					
					var delta = latter.data.delta;
					var prefValue = prior.reference.refValue;
					var parray = prefValue.split("|");
					var pSheetName = parray[0];
					var priorIndex = parseInt(parray[1]);
					
					if(lSheetName == pSheetName)
					{
						// #preHandleDltSheet# prior is DELETE and latter is not DELETE, in pre, did UNDO-REDO
						// latter not apply so it is good

						latter.OTResult=2;
						return;
					}
					if (delta <0)
	            	{
			            if ( priorIndex < latterIndex+delta )
			            {
			            	latterIndex--;
			            	var lsheetName = lrefValue.split("|")[0];
			            	latter.reference.refValue = lsheetName+"|"+latterIndex;
			            }
			            else if ( (priorIndex < latterIndex)&&(priorIndex>=latterIndex+delta))
			            {
			            	latterIndex--;
			            	delta++;
			            	
			            	var lsheetName = lrefValue.split("|")[0];
			            	latter.reference.refValue = lsheetName+"|"+latterIndex;
			            	latter.data.delta = delta;
			            }
			        }
	            	if (delta > 0)
	            	{
	            		if ( priorIndex < latterIndex )
			            {
			            	latterIndex--;
			            	var lsheetName = lrefValue.split("|")[0];
			            	latter.reference.refValue = lsheetName+"|"+latterIndex;
			            }
	            		else if ( (priorIndex <= latterIndex+delta)&&(priorIndex>latterIndex))
			            {
	            			delta--;
				            latter.data.delta = delta;
			            }
	            	}
				}
				break;
				
				case this.Event.ACTION_MOVE:
				{
					latter.OTResult=1;
				}
				break;
			}
		}
		else if(latterAction == this.Event.ACTION_FREEZE)
		{
			switch (priorAction)
			{
				case this.Event.ACTION_SET: 
				{
					var prefValue = prior.reference.refValue; // old sheetname
						var priorName = prior.data.sheet.sheetname; // new sheetname
						//not a rename sheet
						if (priorName == undefined)
							break;
						
						var latterName = latter.reference.refValue;
						
						if ( prefValue == latterName)
						{
							latter.reference.refValue = priorName;
						}
				}
				break;
				case this.Event.ACTION_DELETE:
				{
					var lrefValue = latter.reference.refValue;
					var larray = lrefValue.split("|");
					var lSheetName = larray[0];
					
					var prefValue = prior.reference.refValue;
					var parray = prefValue.split("|");
					var pSheetName = parray[0];
					
					if(lSheetName == pSheetName)
					{
						latter.OTResult=2;
						return;
					}
				}	
				break;
			}
		}
		return false;
	},
	/*
	 * para are integers and startIndex1 <= endIndex1, startIndex2 <= endIndex2
	 * this function return the overlap for range1(startIndex1:endIndex1) and range2(startIndex2:endIndex2)
	 * if on overlap, return null
	 */
	getOverlapFor2Ranges: function(startIndex1, endIndex1, startIndex2, endIndex2)
	{
		var sIndex = (startIndex1 > startIndex2)? startIndex1: startIndex2;
		var eIndex = (endIndex1 < endIndex2 )? endIndex1: endIndex2;
		if(sIndex > eIndex)
			return null;
		else
		{
			var ret = {};
			ret.startIndex = sIndex;
			ret.endIndex = eIndex;
			return ret;
		}
	},
	/*
	 * input para refValue is a string
	 */
	isRange: function(refValue)
	{
		if(refValue && dojo.isString(refValue) && refValue.indexOf(":")>0)
		{
			return true;
		}
		else
		{
			return false;
		}
	},
	/*
	 * for every row in the rowsArray, the rowIndex + delta
	 * return the new rowsArray
	 */
	changeRowIndex4RowsArray: function(rowsArray, delta)
	{
		var newRowsArray = new Array();
		for(var index = 0 ; index < rowsArray.length; index++)
		{
			var item = rowsArray[index];
			for(var rowIndex in item)
			{
				var row = item[rowIndex];
				var newItem = {};
				var newRowIndex = parseInt(rowIndex) + delta;
				newItem[newRowIndex] = row;
				newRowsArray.push(newItem);
			}
		}
		return newRowsArray;
	},
	
	transformRowsRows: function(prior,latter)
	{
		var priorAction = prior.action;
		var latterAction = latter.action;
		var pRefValue = websheet.Helper.handleRefValue(prior.reference.refValue,this.Event.SCOPE_ROW);
		var parsedPRef = websheet.Helper.parseRef(pRefValue);
		var lRefValue = websheet.Helper.handleRefValue(latter.reference.refValue,this.Event.SCOPE_ROW);
		var parsedLRef = websheet.Helper.parseRef(lRefValue);
		if (latterAction == this.Event.ACTION_SET)
		{
			switch (priorAction)
			{
				case this.Event.ACTION_SET:
				{
					if(parsedPRef.sheetName != parsedLRef.sheetName) return;

					if (null != latter.data.visibility && null != prior.data.visibility) {
						// the case of show/hide rows;
						var lRangeInfo = websheet.Helper.getRangeInfoByRef(latter.reference.refValue);
						var pRangeInfo = websheet.Helper.getRangeInfoByRef(prior.reference.refValue);
						var comparedResult = websheet.Helper.compareRange(lRangeInfo, pRangeInfo);
						
						if(comparedResult == websheet.Constant.RangeRelation.INTERSECTION &&
							latter.data.visibility == prior.data.visibility)
						{
							if(lRangeInfo.startRow > pRangeInfo.startRow)
								lRangeInfo.startRow = pRangeInfo.endRow + 1;
							else
								lRangeInfo.endRow = pRangeInfo.startRow - 1;
							parsedLRef.startRow = lRangeInfo.startRow;
							parsedLRef.endRow = lRangeInfo.endRow;
							latter.reference.refValue = parsedLRef.toString();							
						}else if(comparedResult == websheet.Constant.RangeRelation.NOINTERSECTION){
							return;
						}else{
							latter.OTResult=1;
						}
					} else {
						var overlapRange = this.getOverlapFor2Ranges(parsedPRef.startRow,parsedPRef.endRow,parsedLRef.startRow,parsedLRef.endRow);
						if(null != overlapRange)
						{
							// set rows range overlapping, merge overlapping 
							var priorRowStyle = prior.data.style;
							var latterRowStyle = latter.data.style;
							if(undefined != priorRowStyle && undefined != latterRowStyle)
							{
								var overlapRangeRef = null;
								overlapRangeRef = websheet.Helper.getAddressByIndex(parsedPRef.sheetName, overlapRange.startIndex, null,null,overlapRange.endIndex,null, {refMask:websheet.Constant.ROWS_MASK});
								var setRowRangeEvent = new websheet.event.SetRow(overlapRangeRef, { style: priorRowStyle });
								latter.extraArray[this._localEventIdx] = setRowRangeEvent.getMessage().updates[0];
							} else {
								latter.extraArray[this._localEventIdx] = prior;
							}
						}					
					}
				}
				break;
				case this.Event.ACTION_INSERT:
				{
					if(parsedPRef.sheetName != parsedLRef.sheetName) 
						return;
					var insertCnt = parsedPRef.endRow - parsedPRef.startRow + 1;	
					if(null != latter.data.visibility)
					{
						if(parsedPRef.startRow <= parsedLRef.startRow)
						{
							parsedLRef.startRow += insertCnt;
							parsedLRef.endRow += insertCnt;
							latter.reference.refValue = parsedLRef.toString();
						}
						else if(parsedPRef.startRow > parsedLRef.startRow &&	parsedPRef.startRow <= parsedLRef.endRow)
						{
							var extra = websheet.Helper.cloneJSON(latter);	
								
							var tmpParsedLRef = dojo.clone(parsedLRef);
							tmpParsedLRef.startRow = parsedPRef.endRow + 1;
							tmpParsedLRef.endRow += insertCnt;
							extra.reference.refValue = tmpParsedLRef.toString();
								
							latter.extraArray[this._localEventIdx] = extra;
							
							parsedLRef.endRow = parsedPRef.startRow - 1;
							latter.reference.refValue = parsedLRef.toString();
						}
					}
					else
					{
						latter.OTResult=1;	
					}
				}
				break;
				case this.Event.ACTION_DELETE:
				{
					if(parsedPRef.sheetName != parsedLRef.sheetName) 
						return;
					
					var deleteCnt = parsedPRef.endRow - parsedPRef.startRow + 1;
					
					var hasDataTrans = false;
					var rowsJson = prior.data.rows;
					if(rowsJson && !this._isEmpty(rowsJson))
						hasDataTrans = true;
					
					if(parsedPRef.startRow<=parsedLRef.startRow)
					{
						if(parsedPRef.endRow<parsedLRef.startRow)
						{
							if (hasDataTrans)
								latter.OTResult=1;
							else if (latter.data.style != undefined) {
								parsedLRef.startRow -= deleteCnt;
								parsedLRef.endRow -= deleteCnt;
								latter.reference.refValue = parsedLRef.toString();
							} else if (latter.data.rows != undefined) {
								if (this._isRowsJsonForStyle(latter.data.rows)) {
									parsedLRef.startRow -= deleteCnt;
									parsedLRef.endRow -= deleteCnt;
									latter.reference.refValue = parsedLRef.toString();
									// adjust latter data to fit for new row ref
									latter.data.rows = this._addDeltaToRowJson(latter.data.rows, -deleteCnt);
								} else {
									latter.OTResult=1;
								}
							}
						}
						else if(parsedPRef.endRow>=parsedLRef.startRow && parsedPRef.endRow<parsedLRef.endRow)
						{
							latter.OTResult=1;
						}
						else if(parsedPRef.endRow>=parsedLRef.endRow)
						{
							latter.OTResult=2;
						}
					}
					else if(parsedPRef.startRow > parsedLRef.startRow && parsedPRef.startRow <= parsedLRef.endRow)
					{
						latter.OTResult=1;
					}
				}
				break;
				case this.Event.ACTION_CLEAR:
				{
					if(parsedPRef.sheetName != parsedLRef.sheetName) 
						return;
					latter.extraArray[this._localEventIdx] = prior;
				}
				break;
			}
		}
		else if (latterAction == this.Event.ACTION_INSERT)
		{
			switch (priorAction)
			{
				case this.Event.ACTION_SET:
				{
					if(parsedPRef.sheetName != parsedLRef.sheetName) 
						return;
					
					if(parsedPRef.endRow + 1 == parsedLRef.startRow || parsedLRef.startRow == 1 /* special case when insert before 1 */)
					{
						latter.OTResult=1;
					}
					else if(prior.data && (prior.data.visibility == websheet.Constant.ROW_VISIBILITY_ATTR.HIDE || prior.data.style))
					{
						// TODO the case that prior set msg is splited by latter insert msg,
						// current way is to make prior set msg "wrong" by fill the range enlarged
						// by insert msg. this is not good. we would rather to split set msg in
						// server and another client to make it sync.
						if(parsedLRef.startRow>parsedPRef.startRow && parsedLRef.startRow<=parsedPRef.endRow)
						{
							var tmpParsedPRef = dojo.clone(parsedPRef);
							tmpParsedPRef.endRow = tmpParsedPRef.endRow + (parsedLRef.endRow-parsedLRef.startRow+1);
							var extra = websheet.Helper.cloneJSON(prior);							
							extra.reference.refValue = tmpParsedPRef.toString();
							latter.extraArray[this._localEventIdx] = extra;
						}
					}
				}
				break;
				case this.Event.ACTION_INSERT:
				{
					if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
					if(this.hasFormulaImpacted(latter, prior) || this.hasFormulaImpacted(prior,latter))
					{
						latter.OTResult = 1;
						return;
					}
					if(parsedPRef.sheetName != parsedLRef.sheetName) 
						return;
					// if prior range totally below latter range, no OT
					if (parsedPRef.startRow > parsedLRef.endRow)
					{
						return;
					}
					else
					{
						latter.OTResult = 1;
					}
				}
				break;
				case this.Event.ACTION_DELETE:
				{
					if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
					if(parsedPRef.sheetName == parsedLRef.sheetName || this.hasFormulaImpacted(prior,latter))
						latter.OTResult=1;

				}
				break;
				case this.Event.ACTION_CLEAR:
				{
					//no OT
				}
				break;
				case this.Event.ACTION_FREEZE:
				{
					if(latter.data && latter.data.undoFreeze)
					{
						latter.data.undoFreeze = undefined;
					}	
				}	
				break;
			}
		}
		else if (latterAction == this.Event.ACTION_DELETE)
		{
			switch (priorAction)
			{
				case this.Event.ACTION_SET:
				case this.Event.ACTION_CLEAR:
				{
					if(parsedPRef.sheetName != parsedLRef.sheetName) return;
					if(parsedLRef.startRow <= parsedPRef.startRow && 
						parsedLRef.endRow >= parsedPRef.endRow)
					{
						this.getOTManager().conflictResolve(this._index);
						
					}
				}
				break;
				case this.Event.ACTION_INSERT:
				{
					if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
					if(this.hasFormulaImpacted(latter,prior))
					{
						latter.OTResult=1;
						return;
					}
					if(parsedPRef.sheetName != parsedLRef.sheetName) 
						return;
					// fix issue 7330
					if(parsedPRef.startRow - 1 <= parsedLRef.endRow)
						latter.OTResult=1;
				}
				break;
				case this.Event.ACTION_DELETE:
				{
					if(parsedPRef.sheetName != parsedLRef.sheetName) return;

					var deleteRowCount = parsedPRef.endRow - parsedPRef.startRow + 1;
					var sIndex = parsedLRef.startRow;
					var eIndex = parsedLRef.endRow;
					var undoChange = null;
					//if equal
					if(parsedLRef.startRow == parsedPRef.startRow && parsedLRef.endRow == parsedPRef.endRow)
					{
						latter.OTResult=2;
	            		this.removeAction();
	            		this.getOTManager().conflictResolve(this._index);
	            		return;
					}
					// prior is the subset of latter
					else if(parsedLRef.startRow <= parsedPRef.startRow && parsedLRef.endRow >= parsedPRef.endRow)
					{
						sIndex = parsedLRef.startRow;
						eIndex = parsedLRef.endRow - deleteRowCount;
						this.removeAction();
						this.getOTManager().conflictResolve(this._index);
					}
					//latter is the subset of prior
					else if(parsedLRef.startRow>= parsedPRef.startRow && parsedLRef.endRow <= parsedPRef.endRow) 
					{
						var latterDltCnt = parsedLRef.endRow - parsedLRef.startRow + 1;
						var newRefValue = websheet.Helper.getAddressByIndex(parsedPRef.sheetName, parsedPRef.startRow, null, null, parsedPRef.endRow - latterDltCnt, null, {refMask:websheet.Constant.ROWS_MASK});
						undoChange = {refValue: newRefValue};
					}
					else if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
					//latter is under the prior
					else if(parsedLRef.startRow> parsedPRef.endRow)
					{
						sIndex = parsedLRef.startRow - deleteRowCount;
						eIndex = parsedLRef.endRow - deleteRowCount;
					}

					//down overlap
					else if(parsedLRef.startRow >= parsedPRef.startRow && parsedLRef.startRow <= parsedPRef.endRow)
					{
						sIndex = parsedPRef.startRow;
						eIndex = parsedLRef.endRow - deleteRowCount;
						var newRefValue = websheet.Helper.getAddressByIndex(parsedPRef.sheetName, parsedPRef.startRow, null,null,parsedLRef.startRow -1,null, {refMask:websheet.Constant.ROWS_MASK});
						undoChange = {refValue: newRefValue};
					}
					//up overlap
					else if(parsedLRef.endRow >= parsedPRef.startRow && parsedLRef.endRow <= parsedPRef.endRow)
					{
						sIndex = parsedLRef.startRow;
						eIndex = parsedPRef.startRow -1;
						var latterDltCnt = parsedLRef.endRow - parsedLRef.startRow + 1;
						var newRefValue = websheet.Helper.getAddressByIndex(parsedPRef.sheetName, parsedLRef.startRow, null,null,parsedPRef.endRow - latterDltCnt,null, {refMask:websheet.Constant.ROWS_MASK});
						undoChange = {refValue: newRefValue};
					}

					if(!undoChange)
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex(parsedLRef.sheetName, sIndex, null, null, eIndex, null, {refMask:websheet.Constant.ROWS_MASK});
						return;
					}
					
					this.getOTManager().setModifyInfo(undoChange);
					latter.OTResult=1;
					this.getOTManager().setModifyInfo(null);
				}
				break;
			}
		}
		else if (latterAction == this.Event.ACTION_CLEAR)
		{
			switch (priorAction)
			{
				case this.Event.ACTION_SET:
				{
					latter.extraArray[this._localEventIdx] = prior;
				}
				break;
				case this.Event.ACTION_INSERT:
				{
					if(parsedPRef.sheetName != parsedLRef.sheetName) return;
					var insertRowCount = parsedPRef.endRow - parsedPRef.startRow + 1;
					if(parsedPRef.startRow <= parsedLRef.startRow)
					{
						if(parsedLRef.startRow == parsedLRef.endRow)
						{
							var rowIndex = parsedLRef.startRow + insertRowCount;
							latter.reference.refValue = websheet.Helper.getAddressByIndex(parsedLRef.sheetName, rowIndex, null, null, rowIndex, null, {refMask:websheet.Constant.ROWS_MASK});
						}
						else
						{
							var sIndex = parsedLRef.startRow + insertRowCount;
							var eIndex = parsedLRef.endRow + insertRowCount;
							latter.reference.refValue = websheet.Helper.getAddressByIndex(parsedLRef.sheetName, sIndex, null, null, eIndex, null, {refMask:websheet.Constant.ROWS_MASK});
						}
					}
					else if(parsedPRef.startRow > parsedLRef.startRow && parsedPRef.startRow <= parsedLRef.endRow)
					{
						// the set range split into two pieces
						// first pieces
						var eIndex1 = parsedPRef.startRow-1;
						var newRefVale = websheet.Helper.getAddressByIndex(parsedLRef.sheetName, parsedLRef.startRow, null, null, eIndex1, null, {refMask:websheet.Constant.ROWS_MASK});
						latter.reference.refValue = newRefVale;
						// second piece
						var attrUpdates = {};
						var sIndex2 = parsedPRef.startRow + insertRowCount;
						var eIndex2 = parsedLRef.endRow + insertRowCount;
						var newRefVale2 = websheet.Helper.getAddressByIndex(parsedLRef.sheetName, sIndex2, null, null, eIndex2, null, {refMask:websheet.Constant.ROWS_MASK});
						latter.data = {};
						var clearRowRangeEvent = new websheet.event.ClearRow(newRefVale2);
						latter.extraArray[this._localEventIdx] = clearRowRangeEvent.getMessage().updates[0];
					}
				}
				break;
				case this.Event.ACTION_DELETE:
				{
					if(parsedPRef.sheetName != parsedLRef.sheetName) return;
					if(parsedLRef.startRow>= parsedPRef.startRow && parsedLRef.endRow <= parsedPRef.endRow)
					{
						latter.OTResult=2;
						return;
					}
					var sIndex = 0;
					var eIndex = 0;
					var deleteRowCount = parsedPRef.endRow - parsedPRef.startRow + 1;
					if(parsedLRef.startRow < parsedPRef.startRow)
					{
						sIndex = parsedLRef.startRow;
					}else if(parsedLRef.startRow >= parsedPRef.startRow && parsedLRef.startRow <= parsedPRef.endRow)
					{
						sIndex = parsedPRef.startRow;
					}else if(parsedLRef.startRow > parsedPRef.endRow)
					{
						sIndex = parsedLRef.startRow - deleteRowCount;
					}
					
					if(parsedLRef.endRow < parsedPRef.startRow)
					{
						eIndex = parsedLRef.endRow;
					}else if(parsedLRef.endRow >= parsedPRef.startRow && parsedLRef.endRow <= parsedPRef.endRow)
					{
						eIndex = parsedPRef.startRow - 1;
					}else if(parsedLRef.endRow > parsedPRef.endRow)
					{
						eIndex = parsedLRef.endRow - deleteRowCount;
					}
					latter.reference.refValue = websheet.Helper.getAddressByIndex(parsedLRef.sheetName, sIndex, null, null, eIndex, null, {refMask:websheet.Constant.ROWS_MASK});
				}
				break;
				case this.Event.ACTION_CLEAR:
				{
					//no OT
				}
				break;
			}
		}
		else if (latterAction == this.Event.ACTION_FREEZE)
		{
			if(parsedPRef.sheetName != parsedLRef.sheetName) return;
			switch (priorAction)
			{
				case this.Event.ACTION_DELETE:
				{
					var freezeRow = parsedLRef.startRow;
					var dltSRow = parsedPRef.startRow, dltERow = parsedPRef.endRow;
					if(freezeRow > dltERow)
					{
						freezeRow -= (dltERow - dltSRow + 1);
					}	
					else if( freezeRow >= dltSRow && freezeRow <= dltERow)
					{
						freezeRow = dltSRow -1;
					}	
					if(freezeRow < 1) freezeRow = 1;
					if(freezeRow != parsedLRef.startRow)
					{
						latter.reference.refValue = websheet.Helper.getAddressByIndex(parsedLRef.sheetName, freezeRow, null, null, freezeRow, null, {refMask:websheet.Constant.ROWS_MASK});
					}	
				}	
				break;
				case this.Event.ACTION_INSERT:
				{
					if(prior.data && prior.data.undoFreeze)
					{
						latter.OTResult = 2;
						return;
					}	
					var freezeRow = parsedLRef.startRow;
					var insertSRow = parsedPRef.startRow, insertERow = parsedPRef.endRow;
					if(insertSRow <= freezeRow)
					{
						freezeRow += (insertERow - insertSRow + 1);
						latter.reference.refValue = websheet.Helper.getAddressByIndex(parsedLRef.sheetName, freezeRow, null, null, freezeRow, null, {refMask:websheet.Constant.ROWS_MASK});
					}	
				}
				break;
			}
		}	
	},
	
	// no OT for row/column, but in the future when supportting set row/column with style
	// OT is needed here
	transformRowCol:function(prior, latter){
	   var priorAction = prior.action;
	   var latterAction = latter.action;
	   
		var lrefValue  = latter.reference.refValue;
		var lref = websheet.Helper.parseRef(lrefValue);
        
        var prefValue = prior.reference.refValue;
        var pref = websheet.Helper.parseRef(prefValue);
		if (latterAction == this.Event.ACTION_SET)
		{
			switch(priorAction)
			{
				case this.Event.ACTION_SET:
				{
		            if( lref.sheetName == pref.sheetName)
		            {						
		            	latter.extraArray[this._localEventIdx] = prior;
		            }
				}
				break;
				case this.Event.ACTION_INSERT:
				{
		            if( lref.sheetName == pref.sheetName) 
		            	latter.OTResult=1;
				}
				break;
				case this.Event.ACTION_DELETE:
				{
		            if( lref.sheetName == pref.sheetName) 
		            	latter.OTResult=1;
				}
				break;
				case this.Event.ACTION_MOVE:
				{
		            if( lref.sheetName == pref.sheetName) 
		            	latter.OTResult=1;
				}
				break;
				case this.Event.ACTION_CLEAR:
				{
					var bCut = prior.data && prior.data.bCut;
					if(!bCut) return false;
					if( lref.sheetName == pref.sheetName) 
						latter.extraArray[this._localEventIdx] = prior;
				}	
				break;
			}
		}
		else if(latterAction == this.Event.ACTION_INSERT)
		{
			switch(priorAction)
			{
				case this.Event.ACTION_SET:
				{
		            if( lref.sheetName == pref.sheetName) 
		            {
						latter.OTResult=1;
		            }
				}
				break;
				case this.Event.ACTION_INSERT:
				{
					if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
		            if( lref.sheetName == pref.sheetName || this.hasFormulaImpacted(prior, latter) || this.hasFormulaImpacted(latter, prior)) 
		            {
   						latter.OTResult=1;
		            }
				}
				break;
				case this.Event.ACTION_DELETE:
				{
					if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
		            if( lref.sheetName == pref.sheetName || this.hasFormulaImpacted(prior,latter)) 
		            {
						latter.OTResult=1;
		            }
				}
				break;
			}
		}
		else if(latterAction == this.Event.ACTION_DELETE)
		{
			switch(priorAction)
			{
				case this.Event.ACTION_INSERT:
				{
		            if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
		            if(this.hasFormulaImpacted(latter,prior)) 
		            {
   						latter.OTResult=1;
		            }
				}
				break;
			}
		}
		return false;
	},
		
	transformChartRows: function(prior, latter){
		this.transformChartUndos(prior, latter);
	},
	transformChartCols: function(prior, latter){
		this.transformChartUndos(prior, latter);
	},
	transformChartUndos: function(prior, latter){
		if(!prior.data || !prior.data.settings)
			return;
		if(!latter.data || !latter.data.undoCharts)
			return;
		
		var chartId = prior.data.chartId;
		var undoCharts = latter.data.undoCharts;
		var undoChart = undoCharts[chartId];
		if(undoChart)
		{
			var settings = prior.data.settings;
			if(settings.series){
				for(var serId in settings.series){
					var serData = settings.series[serId].data;
					if(serData){
						for(var role in serData){
							var key = role + " " + serId;
							delete undoChart[key];
						}
					}
				}
			}
			if(settings.axis){
				for(var axisId in settings.axis){
					var axis = settings.axis[axisId];
					if(axis.cat && axis.cat.ref){
						var key = "cat " + axisId;
						delete undoChart[key];
					}
				}
			}
		}
	},
	
	transformRowsChart: function(prior, latter){
		if(!latter.data || !latter.data.settings)
			return;
		var priorAction = prior.action;
		
		if(priorAction == this.Event.ACTION_DELETE || priorAction == this.Event.ACTION_INSERT){		
			var parsedPRef = websheet.Helper.parseRef(prior.reference.refValue);
			var undoCharts;
			if(priorAction == this.Event.ACTION_INSERT && prior.data && prior.data.undoCharts)
				undoCharts = prior.data.undoCharts;		
			this._transformChart(latter, this.Event.SCOPE_ROW, priorAction, {"parsedRef" : parsedPRef, "undoCharts" : undoCharts});
		}
	},	
	
	transformColsChart: function(prior, latter){
		if(!latter.data || !latter.data.settings)
			return;
		var priorAction = prior.action;
		
		if(priorAction == this.Event.ACTION_DELETE || priorAction == this.Event.ACTION_INSERT){		
			var parsedPRef = websheet.Helper.parseRef(prior.reference.refValue);
			var undoCharts;
			if(priorAction == this.Event.ACTION_INSERT && prior.data && prior.data.undoCharts)
				undoCharts = prior.data.undoCharts;
			this._transformChart(latter, this.Event.SCOPE_COLUMN, priorAction, {"parsedRef" : parsedPRef, "undoCharts" : undoCharts});
		}
	},	
	
	transformSheetChart: function(prior, latter){
		if(!latter.data || !latter.data.settings)
			return;
		switch (prior.action)
		{
			case this.Event.ACTION_SET:
			    var newSheetName = prior.data.sheet.sheetname;
			  //not rename sheet
				if (newSheetName == undefined)
					break;
	            var oldSheetName = websheet.Helper.handleRefValue(prior.reference.refValue,this.Event.SCOPE_SHEET);
				this._transformChart(latter, this.Event.SCOPE_SHEET, prior.action, {"oldSheetName" : oldSheetName , "newSheetName" : newSheetName});
	            break;
			case this.Event.ACTION_DELETE:
				var pSheetName = websheet.Helper.handleRefValue(prior.reference.refValue,this.Event.SCOPE_SHEET);
				this._transformDeleteSheetSetChart(latter, pSheetName);
				break;
		}
            
	},	
	
	_transformDeleteSheetSetChart: function(latter, pSheetName)
	{
		var settings = latter.data.settings;
		if(settings.series){
			for(var serId in settings.series){
				var serData = settings.series[serId].data;
				if(serData){
					for(var role in serData){
						var roleJson = serData[role];
						if(roleJson.ref)
							if(this._transformDeleteSheetRefsInChart(pSheetName, roleJson.ref)){
								latter.OTResult = 1;
								return;
							}
					}
				}
			}
		}
		if(settings.axis){
			for(var axisId in settings.axis){
				var axis = settings.axis[axisId];
				if(axis.cat && axis.cat.ref){
					if(this._transformDeleteSheetRefsInChart(pSheetName, axis.cat.ref)){
						latter.OTResult = 1;
						return;
					}
				}
			}
		}
	},
	
	_transformChart: function(latter, type, action, params){
		var settings = latter.data.settings;
	    
		var undoChart;
		var undoCharts = params.undoCharts;
		if(undoCharts){
			var chartId = latter.data.chartId;
			undoChart = undoCharts[chartId];
		}
		 if(settings.series){
			for(var serId in settings.series){
				var serData = settings.series[serId].data;
				if(serData){
					for(var role in serData){
						var roleJson = serData[role];
						if(roleJson.ref)
						{
							var deltas;
							if(undoChart){
								var key = role + " " + serId;
								deltas = undoChart[key];
							}
							roleJson.ref = this.transformRefsInChart(type, action, params, roleJson.ref, deltas);
						}						
					}
				}
			}
		}
		if(settings.axis){
			for(var axisId in settings.axis){
				var axis = settings.axis[axisId];
				if(axis.cat && axis.cat.ref){
					var deltas;
					if(undoChart){
						var key ="cat " + axisId;
						deltas = undoChart[key];
					}
					axis.cat.ref = this.transformRefsInChart(type, action, params, axis.cat.ref, deltas);
				}
			}
		}
	},
	
	transformChartChart: function(prior, latter){
		if(latter.data && prior.data && prior.data.chartId == latter.data.chartId)
			latter.extraArray[this._localEventIdx] = prior;
	},
	
	hasSharedFormulaRefImpacted: function(opt1, opt2){
		var ref1 = websheet.Helper.parseRef(opt1.reference.refValue);
        var ref2 = websheet.Helper.parseRef(opt2.reference.refValue);
        if (ref1.sheetName != ref2.sheetName) {
        	return false;
        }
        return this.docAgent.hasSharedFormulaRef(ref2);
	},
	
	_formulaReg : /(^=.+)|(^{=.+}$)/,
	/**
	 * check if opt1 will impact the formulas in opt2
	 * @param opt1: insert/delete row/column, rename sheet
	 * @param opt2: insert row/column, and contain data.
	 * The formulas in the undo delete row/column message should not be transformed
	 * @returns
	 */
	
	hasFormulaImpacted: function(opt1,opt2)
	{
		//If opts doesn't contain data
		if(!opt2.data || !opt2.data.rows)
			return false;
		
		var ref1 = websheet.Helper.parseRef(opt1.reference.refValue);
        var ref2 = websheet.Helper.parseRef(opt2.reference.refValue);
        
		var rowAction = (opt1.reference.refType == this.Event.SCOPE_ROW) 
		                &&( opt1.action==this.Event.ACTION_DELETE || opt1.action==this.Event.ACTION_INSERT);
		var colAction = (opt1.reference.refType == this.Event.SCOPE_COLUMN) 
                        &&( opt1.action==this.Event.ACTION_DELETE || opt1.action==this.Event.ACTION_INSERT);
		var renameSheet = opt1.reference.refType == this.Event.SCOPE_SHEET && opt1.action==this.Event.ACTION_SET;
		
		if(!rowAction && !colAction && !renameSheet)
			return false;
		if(renameSheet)
		{
			var psheetName = opt1.reference.refValue.split("|")[0];
			ref1 = {sheetName:psheetName};
		}
		//only care formula cells here
		var rows = opt2.data.rows;
		for(var rowIdx in rows)
		{
			var row = rows[rowIdx];
			var cells = row.cells;
			if(!cells)
				continue;
			for(var col in cells)
			{
				var cell = cells[col];
				if(typeof(cell.v)=="string" && this._formulaReg.test(cell.v))
				{
					var tokens = null;
					if(!cell.tarr)  {
						try{
							tokens = websheet.parse.FormulaParseHelper.parseTokenList(cell.v);
						} catch(e){
							tokens = [];
						}
					}else
						tokens = websheet.parse.FormulaParseHelper.getTokenList(cell.v, cell.tarr);
					for(var i=0;i<tokens.length;i++)
					{
						var token =tokens[i];
						var type = token._type;
						if (type == "range" || type == "cell") 
						{
							var tokenRef = token.getRef();
							var sheetName = tokenRef.sheetName || ref2.sheetName;
							
							var sc = tokenRef.startCol;
						    var ec = tokenRef.endCol;
						    var sr = tokenRef.startRow;
						    var er = tokenRef.endRow;
						        
							if(ref1.sheetName==sheetName)
							{
								if(renameSheet && tokenRef.sheetName)
									return true;
								else if(rowAction)
								{
									//er is null means tokenRef is column, row action will not impact column reference
									if(er!=null && ref1.startRow<=er)
										return true;
								}
								else if(colAction)
								{
									//ec is null means tokenRef is row
									if(ec!=null && ref1.startCol <= ec)
										return true;
								}
							}
						}
					}
				}
			}
		}
		
		return false;
	},
	
	transformColCol: function(prior, latter){
		var priorAction = prior.action;
		var latterAction = latter.action;
		
		var lrefValue  = latter.reference.refValue;
		var lref = websheet.Helper.parseRef(lrefValue);
        var latterSheetName = lref.sheetName;
        var latterColIndex = lref.startCol;
        var latterEndColIndex = lref.endCol;
        
        var prefValue = prior.reference.refValue;
        var pref = websheet.Helper.parseRef(prefValue);
        var priorSheetName = pref.sheetName;
        var priorColIndex = pref.startCol;
        var priorEndColIndex = pref.endCol;
        
		if (latterAction == this.Event.ACTION_SET)
		{
			switch (priorAction){
				case this.Event.ACTION_SET:
				{
					//if they have intersection
		            if (!(latterEndColIndex < priorColIndex || latterColIndex > priorEndColIndex) )
		            	latter.extraArray[this._localEventIdx] = prior;
				}
				break;
				case this.Event.ACTION_INSERT:
				{
					if (priorSheetName == latterSheetName)
					{	
						if((priorColIndex<=latterEndColIndex) || (latterEndColIndex+1==priorColIndex))
							latter.OTResult=1;
					}
				}
				break;
				case this.Event.ACTION_DELETE:
				{
		            if (priorSheetName == latterSheetName)
		            {	
		            	if(latterEndColIndex >= priorColIndex)
							latter.OTResult=1;
						if(latterColIndex>=priorColIndex && latterEndColIndex<=priorEndColIndex)
		            		latter.OTResult=2;
		            }
				}
				break;
			}
			return false;
		}
		else if (latterAction == this.Event.ACTION_INSERT)
		{
			switch (priorAction)
			{
				case this.Event.ACTION_SET: 
				{
		            if ( (priorSheetName == latterSheetName)&&(latterColIndex<=(priorEndColIndex+1) && latterColIndex > priorColIndex) )
		            	latter.OTResult=1;
				}
				break;
				case this.Event.ACTION_INSERT:
				{
					if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
					if(priorSheetName == latterSheetName && priorColIndex >= websheet.Constant.MaxColumnIndex)
					{
						latter.OTResult=1;
					}
					else if(this.hasFormulaImpacted(latter,prior) || this.hasFormulaImpacted(prior, latter))
            		{
            			latter.OTResult=1;
            		}
					else if ( (priorSheetName == latterSheetName) &&(latterColIndex>priorColIndex) )
	            	{
            			var delta = priorEndColIndex - priorColIndex + 1;
            			latter.reference.refValue = websheet.Helper.getAddressByIndex(latterSheetName, null, latterColIndex + delta, null, null, latterEndColIndex + delta, {refMask:websheet.Constant.COLS_MASK});
	            	}
		            if(!latter.OTResult){
		            	if(priorSheetName == latterSheetName && !(latterEndColIndex < priorColIndex || priorEndColIndex < latterColIndex)){
		            		if(latter.data && (latter.data.undoRanges || latter.data.undoCharts))
		            			latter.OTResult = 1;
		            		else if(prior.data && (prior.data.undoRanges || prior.data.undoCharts))
		            			latter.OTResult = 1;	            			
		            	}
		            	if(!latter.OTResult && latter.data && latter.data.undoRanges && prior.data && prior.data.undoRanges){
		            		for(var rangeid in latter.data.undoRanges){
		            			if(prior.data.undoRanges[rangeid]){
		            				if(latter.data.undoRanges[rangeid].data && prior.data.undoRanges[rangeid].data){
		            					for(var attr in latter.data.undoRanges[rangeid].data){
		            						if(prior.data.undoRanges[rangeid].data[attr])
		            							delete latter.data.undoRanges[rangeid].data[attr];
		            					}
		            				}
		            			}
		            		}
		            	}
		            }
				}
				break;
				case this.Event.ACTION_DELETE:
				{
					if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
					if(this.hasFormulaImpacted(prior,latter))
            		{
            			latter.OTResult=1;
            			return;
            		}
					
		            if(priorSheetName != latterSheetName)
		            	return;
		            var freezeCol = this.docAgent.getFreezePos(priorSheetName, websheet.Constant.FreezeType.COLUMN);
		            if(latterColIndex <= freezeCol || latterColIndex >= priorColIndex)
		            {
		            	latter.OTResult=1;
		            	return;
		            }	
			    }
				break;	
				case this.Event.ACTION_FREEZE:
				{
					if(latter.data && latter.data.undoFreeze)
					{
						latter.data.undoFreeze = undefined;
					}	
				}	
				break;
			}
		}
		else if (latterAction == this.Event.ACTION_DELETE)
		{
			switch (priorAction)
			{
				case this.Event.ACTION_SET: 
				{
					if((priorSheetName == latterSheetName) && (priorColIndex >= latterColIndex && priorEndColIndex <= latterEndColIndex))
		            {
		            	this.getOTManager().conflictResolve(this._index);
		            }
				}
				break;
				case this.Event.ACTION_INSERT:
				{	
					if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
					if(this.hasFormulaImpacted(latter,prior))
            		{
            			latter.OTResult=1;
            		}
					else if(priorSheetName == latterSheetName)
	            	{
			            var freezeCol =  this.docAgent.getFreezePos(priorSheetName, websheet.Constant.FreezeType.COLUMN);
			            if(latterColIndex <= freezeCol)
			            {
			            	latter.OTResult=1;
			            	return;
			            }	
						// fix issue 7330						
	            		if((priorColIndex-1) >=latterColIndex && (priorColIndex-1)<= (latterEndColIndex)){
	            			latter.OTResult=1;
	            		}
						else if(priorColIndex <= latterColIndex)
						{
							var deltCount = priorEndColIndex - priorColIndex + 1;
	            			latter.reference.refValue = websheet.Helper.getAddressByIndex(latterSheetName, null, latterColIndex + deltCount, null, null, latterEndColIndex + deltCount, {refMask:websheet.Constant.COLS_MASK});
						}
						else if(priorColIndex <= latterEndColIndex) {
							latter.OTResult=1;
						}
	            	}	
			    }
				break;
				case this.Event.ACTION_DELETE: 
				{
		            var localDelCount = priorEndColIndex - priorColIndex + 1;
		            
		            if(priorSheetName != latterSheetName) return;
		            var sIndex = latterColIndex;
		            var eIndex = latterEndColIndex;
		            // if equal
		            if(latterColIndex == priorColIndex && latterEndColIndex == priorEndColIndex)
		            {
            			latter.OTResult=2;
	            		this.removeAction();
	            		this.getOTManager().conflictResolve(this._index);
	            		return;
		            }	
		            // prior is the subset of latter
		            else if(latterColIndex <= priorColIndex && latterEndColIndex >= priorEndColIndex )
		            {
		            	eIndex = latterEndColIndex - localDelCount;
	            		this.removeAction();
	            		this.getOTManager().conflictResolve(this._index);
		            }	
		            //latter is the subset of prior
		            else if(latterColIndex >= priorColIndex && latterEndColIndex <= priorEndColIndex)
		            {
		            	latter.OTResult=2;
	            		this.removeAction();
	            		return;
		            } 
		            else if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
		            //latter is under the prior
		            else if(latterColIndex > priorEndColIndex)
		            {
		            	sIndex -= localDelCount;
		            	eIndex -= localDelCount;
		            }	
		            //down overlap
		            else if(latterColIndex >= priorColIndex && latterColIndex <= priorEndColIndex)
		            {
		            	sIndex = priorColIndex;
		            	eIndex = latterEndColIndex - localDelCount;
		            	this.removeAction();
		            }	
		            //up overlap
		            else if(latterEndColIndex >= priorColIndex && latterEndColIndex <= priorEndColIndex)
		            {
		            	eIndex = priorColIndex -1;
		            	this.removeAction();
		            }	
            		latter.reference.refValue = websheet.Helper.getAddressByIndex(latterSheetName, null, sIndex, null, null, eIndex, {refMask:websheet.Constant.COLS_MASK});
			    }
				break;
			}
		}
		else if (latterAction == this.Event.ACTION_FREEZE)
		{
			var parsedPRef = websheet.Helper.parseRef(prior.reference.refValue);
			var parsedLRef = websheet.Helper.parseRef(latter.reference.refValue);
			if(parsedPRef.sheetName != parsedLRef.sheetName) return;
			switch (priorAction)
			{
			case this.Event.ACTION_DELETE:
			{
				var freezeCol = parsedLRef.startCol;
				var dltSCol = parsedPRef.startCol, dltECol = parsedPRef.endCol;
				if(freezeCol > dltECol)
				{
					freezeCol -= (dltECol - dltSCol + 1);
				}	
				else if( freezeCol >= dltSCol && freezeCol <= dltECol)
				{
					freezeCol = dltSCol -1;
				}	
				if(freezeCol < 1) freezeCol = 1;
				if(freezeCol != parsedLRef.startCol)
				{
					latter.reference.refValue = websheet.Helper.getAddressByIndex(parsedLRef.sheetName, null, freezeCol, null, null, freezeCol, {refMask:websheet.Constant.COLS_MASK});
				}	
			}	
				break;
			case this.Event.ACTION_INSERT:
			{
				if(prior.data && prior.data.undoFreeze)
				{
					latter.OTResult = 2;
					return;
				}	
				var freezeCol = parsedLRef.startCol;
				var insertSCol = parsedPRef.startCol, insertECol = parsedPRef.endCol;
				if(!insertECol) insertECol = insertSCol;
				if(insertSCol <= freezeCol)
				{
					freezeCol += (insertECol - insertSCol + 1);
					latter.reference.refValue = websheet.Helper.getAddressByIndex(parsedLRef.sheetName, null, freezeCol, null, null, freezeCol, {refMask:websheet.Constant.COLS_MASK});
				}	
			}
				break;
			}
		}	
		return false;
	},
	
	_innerTransSetCellSetCell: function(prior, latter)
	{
		var priorRefValue = prior.reference.refValue;
		var latterRefValue = latter.reference.refValue;
		if(priorRefValue != latterRefValue)
		{			
			return ;   // NO OT
		}
		var priorStyle = prior.data.cell.style;
		var latterStyle = latter.data.cell.style;
		var bCut = latter.data.bCut;
		
		if(bCut){//OT defect 15155
			//if latter event is cut, latter style should alway be overlapped
			latter.data.cell.style = priorStyle;
			delete latter.data.bCut;
		}
		else if(undefined != priorStyle)
		{	
			if(undefined != latterStyle)
				latter.data.cell.style = this.mergeStyles(priorStyle,latterStyle);
			else
				latter.data.cell.style = priorStyle;
		}
		
		if(undefined != prior.data.cell.v)
		{
			latter.data.cell.v = prior.data.cell.v;
		}
		
		if(undefined != prior.data.cell.calculatedvalue && undefined != latter.data.cell.calculatedvalue)
		{
			latter.data.cell.calculatedvalue = prior.data.cell.calculatedvalue;
		}		
		if(undefined != prior.data.cell.v && undefined != latter.data.cell.link)
		{
			latter.data.cell.link = prior.data.cell.v;
		}
		if(undefined != prior.data.cell.link)
		{
			latter.data.cell.link = prior.data.cell.link;
		}
	},
	transformCellCell: function(prior, latter)
	{
		var priorAction = prior.action;
		var latterAction = latter.action;
		if(priorAction == this.Event.ACTION_SET)
		{	
			switch (latterAction)
			{
				case this.Event.ACTION_SET:
				{			
					this._innerTransSetCellSetCell(prior, latter);
				}
				break;
				case this.Event.ACTION_MOVE:
					// no OT
				break;
			}
		}
		else if(priorAction == this.Event.ACTION_MOVE)
		{	
			switch (latterAction)
			{
				case this.Event.ACTION_SET:
				{
				   // implement latter
				}
				break;
				case this.Event.ACTION_MOVE:
				{
				   // implement latter
				}
				break;
			}
		}
		return false;
	},
	
	/*
	 *  para1 : the cell ref
	 *  para2 : the row ref
	 */
	isCellInRow: function(cellRefValue, rowRefValue)
	{
		var parsedCellRef = websheet.Helper.parseRef(cellRefValue);
		var handledRowRefValue = websheet.Helper.handleRefValue(
				rowRefValue,this.Event.SCOPE_ROW);
		var parsedRowRef = websheet.Helper.parseRef(handledRowRefValue);
		if(parsedCellRef.sheetName == parsedRowRef.sheetName &&
		   parsedCellRef.startRow >= parsedRowRef.startRow && parsedCellRef.startRow <= parsedRowRef.endRow)
		{
			return true;
		}
		return false;
	},
	
	isCellBeforeCol: function(cellRefValue, colRefValue) {
		var h = websheet.Helper;
		var parsedCellRef = h.parseRef(cellRefValue);
		var handledColRefValue = h.handleRefValue(colRefValue, this.Event.SCOPE_COLUMN);
		var parsedColRef = h.parseRef(handledColRefValue);
		if (parsedCellRef.sheetName == parsedColRef.sheetName) {
			var cellColIndex = parsedCellRef.startCol;
			var colIndex = parsedColRef.startCol;
			return cellColIndex == colIndex - 1;
		}
		return false;
	},
	
	isCellAfterCol: function(cellRefValue, colRefValue) {
		var h = websheet.Helper;
		var parsedCellRef = h.parseRef(cellRefValue);
		var handledColRefValue = h.handleRefValue(colRefValue, this.Event.SCOPE_COLUMN);
		var parsedColRef = h.parseRef(handledColRefValue);
		if (parsedCellRef.sheetName == parsedColRef.sheetName) {
			var cellColIndex = parsedCellRef.startCol;
			var colIndex = parsedColRef.startCol;
			return cellColIndex >= colIndex;
		}
		return false;
	},	
	
	isCellInColumn: function(cellRefValue, colRefValue)
	{
		var parsedCellRef = websheet.Helper.parseRef(cellRefValue);
		var handledColRefValue = websheet.Helper.handleRefValue(
				colRefValue,this.Event.SCOPE_COLUMN);
		var parsedColRef = websheet.Helper.parseRef(handledColRefValue);
		if(parsedCellRef.sheetName == parsedColRef.sheetName &&
		   parsedCellRef.startCol == parsedColRef.startCol)
		{
			return true;
		}
		return false;
	},
	/*
	 * if the cell in the row(cell repeate), return it
	 * else return null
	 * the returned cell format is : 
	 * column: the column of this cell in the 
	 * cell : the content of this cell
	 */
	getCellInRowByRef: function(column, row)
	{
		var cells = row.cells;
		if(undefined == cells || null == cells) return null;
		var columnIndex = websheet.Helper.getColNum(column);
		for(var colIndex in cells)
		{
			var cell = cells[colIndex];
			if(colIndex == column)
			{
				var ret = {};
				ret.column = colIndex;
				ret.cell = cell
				return ret;
			}
			if(undefined != cell.rn || null != cell.rn)
			{
				var repeatednum = parseInt(cell.rn);
				var startColIndex = websheet.Helper.getColNum(colIndex);
				var endColIndex = startColIndex + repeatednum;	
				if(columnIndex >= startColIndex && columnIndex <= endColIndex)
				{
					var ret = {};
					ret.column = colIndex;
					ret.cell = cell
					return ret;
				}
			}
		}
		return null;	
	},
	
	generateEvent: function(action, reference, data)
	{
		var event = {};
		event.action = action;
		event.reference = reference;
		event.data = data;
		return event;
	},
	
	//not handle row range
	transformCellRow: function(prior, latter)
	{
		var priorAction = prior.action;
		var latterAction = latter.action;
		if(priorAction == this.Event.ACTION_SET)
		{	
			switch (latterAction)
			{
				
				case this.Event.ACTION_SET:
				{
					// only OT for cell style set
					if (prior.data && prior.data.cell && prior.data.cell.style) {
						latter.OTResult=1;
					}
				}
				break;
				case this.Event.ACTION_CLEAR:
				{
					var priorRefValue = prior.reference.refValue;
					var latterRefValue = latter.reference.refValue;
					// row may be row range
					if(this.isCellInRow(priorRefValue,latterRefValue))
					{
						latter.OTResult=1;
					}
				}
				break;
				case this.Event.ACTION_INSERT:
				{
					var priorRefValue = prior.reference.refValue;
					var latterRefValue = latter.reference.refValue;
					// row may be row range
					var parsedCellRef = websheet.Helper.parseRef(priorRefValue);
					var handledRowRefValue = websheet.Helper.handleRefValue(latterRefValue,this.Event.SCOPE_ROW);
					var parsedRowRef = websheet.Helper.parseRef(handledRowRefValue);
					
					if (parsedCellRef.sheetName == parsedRowRef.sheetName) 
					{
						if (parsedCellRef.startRow == parsedRowRef.startRow - 1 && prior.data && prior.data.cell && prior.data.cell.style)
						{
							latter.OTResult=1;
						}
						else if(parsedRowRef.startRow<parsedCellRef.startRow && !prior.bMaster)
						{
							parsedCellRef.startRow += parsedRowRef.endRow - parsedRowRef.startRow + 1;
							var tmpEvent = websheet.Helper.cloneJSON(prior);
							tmpEvent.reference.refValue = parsedCellRef.toString();
							latter.extraArray[this._localEventIdx] = tmpEvent;
						}
					}
				}
				break;
				case this.Event.ACTION_DELETE:
				{
					var priorRefValue = prior.reference.refValue;
					var latterRefValue = latter.reference.refValue;
					var pRef = websheet.Helper.parseRef(priorRefValue);
					var lRef = websheet.Helper.parseRef(latterRefValue);
					if(pRef.sheetName == lRef.sheetName && pRef.startRow >= lRef.startRow && pRef.startRow <= lRef.endRow)
					{
						this.getOTManager().conflictResolve(this._index);
					}
				}
				break;
			}
		}
		// no OT for others 
		return;
	},
	
	transformCellCol: function(prior, latter)
	{
		var priorAction = prior.action;
		var latterAction = latter.action;
		// prior action is set cell event
		if(priorAction == this.Event.ACTION_SET)
		{
			var pRef = websheet.Helper.parseRef(prior.reference.refValue);
			var lRef = websheet.Helper.parseRef(latter.reference.refValue);
			
			if(pRef.sheetName != lRef.sheetName)
				return;
			
			var pCol = pRef.startCol;
			var lStartCol = lRef.startCol;
			var lEndCol = lRef.endCol;
			
			switch (latterAction)
			{
				case this.Event.ACTION_SET:
				{
					if(pCol >= lStartCol && pCol <= lEndCol)
					{
						latter.extraArray[this._localEventIdx] = prior;
					}	
					break;
				}
				case this.Event.ACTION_INSERT:
					// if prior cell set affects latter col insert
					if ( pCol==lStartCol-1 &&prior.data && prior.data.cell && prior.data.cell.style)
					{
						latter.OTResult=1;
					}
					else if(!prior.bMaster && lStartCol<pCol)
					{
						pRef.startCol = pCol + 1;
						var tmpEvent = websheet.Helper.cloneJSON(prior);
						tmpEvent.reference.refValue = pRef.toString();
						latter.extraArray[this._localEventIdx] = tmpEvent;
					}
						
					break;
				case this.Event.ACTION_DELETE:
				{
					if(pCol >= lStartCol && pCol <= lEndCol)
					{
						this.getOTManager().conflictResolve(this._index);
					}
				}
				break;
				default:
					// no OT for others 
					break;
			}
		}
	},
	/*
	 * return the json styleobj
	 * if have conflict, use the prior overlap latter
	 */
	mergeStyles: function(priorStyle, latterStyle)
	{
		var pStyle = priorStyle;
		var lStyle = latterStyle;
		if (priorStyle.id)
		{
			var pStyleCode = this.docAgent.getStyleById(priorStyle.id);
			if(pStyleCode)
				pStyle = pStyleCode.toJSON();
		}
		if(latterStyle.id)
		{
			var lStyleCode = this.docAgent.getStyleById(latterStyle.id);
			if(lStyleCode)
				lStyle = lStyleCode.toJSON();
		}

		var priorStyleCode = new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.JSON,pStyle);
		var latterStyleCode = new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.JSON,lStyle);
		priorStyleCode.mergeStyle(latterStyleCode);
		return priorStyleCode.toJSON();

	},
	
	/*input:
	 * moveFrom: the soure of move index
	 * moveTo : the target of move index
	 * rangeStart: the start index of range
	 * rangeEnd: the end index of range
	 * rangeStart <= rangeEnd
	 * output: the new index of range after move 
	 * range.start
	 * range.end
	 */
	moveHelper: function(moveFrom, moveTo,rangeStart, rangeEnd)
	{
		var retRange = {};
		
		var isMoveFromInRange = false;
		var isMoveToInRange = false;
		if(moveFrom >= rangeStart && moveFrom <= rangeEnd)
		{
			isMoveFromInRange = true;
		}
		if(moveTo >= rangeStart && moveTo <= rangeEnd)
		{
			isMoveToInRange = true;
		}
		if(true == isMoveFromInRange && true == isMoveToInRange)
		{
			//do nothing;
			retRange.start = rangeStart;
			retRange.end = rangeEnd;
		}
		else if(true == isMoveFromInRange && true != isMoveToInRange)
		{
			if(moveTo > rangeEnd)
			{
				retRange.start = rangeStart;
				retRange.end = rangeEnd -1;
			}
			else if( moveTo < rangeStart)
			{
				retRange.start = rangeStart + 1;
				retRange.end = rangeEnd;
			}
		}
		else if(true != isMoveFromInRange && true == isMoveToInRange)
		{
			if(moveFrom < rangeStart)
			{
				retRange.start = rangeStart - 1;
				retRange.end = rangeEnd;
			}
			else if( moveFrom > rangeEnd)
			{
				retRange.start = rangeStart ;
				retRange.end = rangeEnd + 1;
			}
		}
		else if(true != isMoveFromInRange && true != isMoveToInRange)
		{
			if((moveFrom < rangeStart && moveTo < rangeStart)
			 || (moveFrom > rangeEnd && moveTo > rangeEnd))
			{
				//do nothing;
				retRange.start = rangeStart;
				retRange.end = rangeEnd;
			}
			else
			{
				if( moveFrom < rangeStart && moveTo > rangeEnd)
				{
					retRange.start = rangeStart - 1;
					retRange.end = rangeEnd - 1;
				}
				else if( moveFrom > rangeEnd && moveTo < rangeStart)
				{
					retRange.start = rangeStart + 1;
					retRange.end = rangeEnd + 1;
				}
			}
		}
		return retRange;
	},
	
	/*
	 * parsedRef : row ref or column ref
	 * now only handle insert/delete row/col, not handle row/col range, (could change 1 to delta)
	 */
	transformFormulaInCell: function(type, action, parsedRef, cellValue, parsedCellRef, tarr)
	{
		if(null == cellValue || undefined == cellValue) return null;
    	var tokenList = this.getReferenceTokenList(cellValue, tarr);
    	if(null == tokenList || 0 == tokenList.length) 
    	{
    		return null;
    	}
    	
    	var INVALID_REF = websheet.Constant.INVALID_REF;
		if(type == "row")
		{
			switch(action)
			{
			    case this.Event.ACTION_INSERT:
			    {
			    	for(var index in tokenList)
			    	{		    
			    		var token = tokenList[index];
			    		var formulaRef = token.getText();
			    		var parsedRefInFormula = websheet.Helper.parseRef(formulaRef);
			    		var isHasSheetName = true;
			    		if( null == parsedRefInFormula || undefined == parsedRefInFormula)
			    			continue;
			    		if( null == parsedRefInFormula.sheetName || undefined == parsedRefInFormula.sheetName)
			    		{
			    			parsedRefInFormula.sheetName = parsedCellRef.sheetName;
			    			isHasSheetName = false;
			    		}
			    		
			    		var insertRowCount = parsedRef.endRow - parsedRef.startRow + 1;
			    		if(token.getType()=="cell")
			    		{
			    			if(parsedRefInFormula.sheetName == parsedRef.sheetName
			    			   && parsedRefInFormula.startRow >= parsedRef.startRow )
			    			{
			    				var newRowIndex = parseInt(parsedRefInFormula.startRow) + insertRowCount;
			    				var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
			    				formulaRef = websheet.Helper.getCellAddr(refSheetName, newRowIndex, parsedRefInFormula.startCol);
			    			}
			    		}
			    		else if(token.getType() == "range")
			    		{
			    			if(parsedRefInFormula.sheetName == parsedRef.sheetName)
			    			{
			    				if(parsedRef.startRow <=  parsedRefInFormula.startRow)
			    				{
			    					var newStartRowIndex = parseInt(parsedRefInFormula.startRow) + insertRowCount;
			    					var newEndRowIndex = parseInt(parsedRefInFormula.endRow) + insertRowCount;
			    					var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
			    					formulaRef = websheet.Helper.getAddressByIndex(refSheetName, newStartRowIndex, parsedRefInFormula.startCol, null, newEndRowIndex, parsedRefInFormula.endCol, {refMask:websheet.Constant.RANGE_MASK});
			    				}
			    				else if( parsedRef.startRow > parsedRefInFormula.startRow &&  parsedRef.startRow <= parsedRefInFormula.endRow)
			    				{
			    					var newEndRowIndex = parseInt(parsedRefInFormula.endRow) + insertRowCount;
			    					var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
			    					formulaRef = websheet.Helper.getAddressByIndex(refSheetName, parsedRefInFormula.startRow , parsedRefInFormula.startCol, null, newEndRowIndex, parsedRefInFormula.endCol, {refMask:websheet.Constant.RANGE_MASK});
			    				}
			    			}
			    		}
			    		token.setChangedText(formulaRef);
			    	}	
			    }
				break;
			    case this.Event.ACTION_DELETE:
			    {
			    	for(var index in tokenList)
			    	{
			    		var token = tokenList[index];
			    		var formulaRef = token.getText();
			    		var parsedRefInFormula = websheet.Helper.parseRef(formulaRef);
			    		var isHasSheetName = true;
			    		if( !parsedRefInFormula)
			    			continue;
			    		if(!parsedRefInFormula.sheetName)
			    		{
			    			parsedRefInFormula.sheetName = parsedCellRef.sheetName;
			    			isHasSheetName = false;
			    		}
			    		var deleteRowCount = parsedRef.endRow - parsedRef.startRow + 1;
			    		if(token.getType()=="cell")
			    		{
			    			if(parsedRefInFormula.sheetName == parsedRef.sheetName)
			    			{
			    				if(parsedRefInFormula.startRow >= parsedRef.startRow && parsedRefInFormula.startRow <= parsedRef.endRow)
			    				{
			    					formulaRef = this._ERROR;
			    				}
			    				else if(parsedRefInFormula.startRow > parsedRef.startRow)
			    				{
									var newRowIndex = parseInt(parsedRefInFormula.startRow) - deleteRowCount;
									var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
									formulaRef = websheet.Helper.getCellAddr(refSheetName, newRowIndex, parsedRefInFormula.startCol);
								}
			    			}
			    		}
			    		else if(token.getType() == "range")
			    		{
			    			if(parsedRefInFormula.sheetName == parsedRef.sheetName)
			    			{
			    				if( 1 == deleteRowCount)
			    				{
			    					if(parsedRef.startRow < parsedRefInFormula.startRow)
				    				{
				    					var newStartRowIndex = parseInt(parsedRefInFormula.startRow) - 1;
				    					var newEndRowIndex = parseInt(parsedRefInFormula.endRow) - 1;
				    					var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
				    					formulaRef = websheet.Helper.getAddressByIndex(refSheetName, newStartRowIndex , parsedRefInFormula.startCol, null, newEndRowIndex, parsedRefInFormula.endCol, {refMask:websheet.Constant.RANGE_MASK});
				    				}
			    					else if(parsedRef.startRow == parsedRefInFormula.startRow && parsedRef.startRow == parsedRefInFormula.endRow)
			    					{
			    						var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
			    						formulaRef = websheet.Helper.getAddressByIndex(refSheetName, -1, parsedRefInFormula.startCol, null, -1, parsedRefInFormula.endCol, {refMask:websheet.Constant.RANGE_MASK, invalidRef:true});
									}
				    				else if( parsedRef.startRow <= parsedRefInFormula.endRow)
				    				{
				    					var newEndRowIndex = parseInt(parsedRefInFormula.endRow) - 1;
				    					var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
				    					formulaRef = websheet.Helper.getAddressByIndex(refSheetName, parsedRefInFormula.startRow, parsedRefInFormula.startCol, null, newEndRowIndex, parsedRefInFormula.endCol, {refMask:websheet.Constant.RANGE_MASK});
				    				}
			    				}
								else
								{
									var sIndex = 0;
									var eIndex = 0;
									if(parsedRefInFormula.startRow < parsedRef.startRow)
									{
										sIndex = parsedRefInFormula.startRow;
									}else if( parsedRefInFormula.startRow >= parsedRef.startRow && parsedRefInFormula.startRow <= parsedRef.endRow)
									{
										sIndex = parsedRef.startRow;
									}else if(parsedRefInFormula.startRow > parsedRef.endRow)
									{
										sIndex = parsedRefInFormula.startRow - deleteRowCount;
									}
									
									if(parsedRefInFormula.endRow < parsedRef.startRow)
									{
										eIndex = parsedRefInFormula.endRow;
									}else if( parsedRefInFormula.endRow >= parsedRef.startRow && parsedRefInFormula.endRow <= parsedRef.endRow)
									{
										eIndex = parsedRef.startRow -1 ;
									}else if(parsedRefInFormula.endRow > parsedRef.endRow)
									{
										eIndex = parsedRefInFormula.endRow - deleteRowCount;
									}
									
			    					if(parsedRef.startRow <= parsedRefInFormula.startRow && parsedRef.endRow >= parsedRefInFormula.endRow)
			    					{
			    						sIndex = eIndex = INVALID_REF;
			    					}
			    					var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
		    						formulaRef = websheet.Helper.getAddressByIndex(refSheetName, sIndex, parsedRefInFormula.startCol, null, eIndex, parsedRefInFormula.endCol, {refMask:websheet.Constant.RANGE_MASK, invalidRef:true});
			    				}
			    			}
			    		}
			    		token.setChangedText(formulaRef);
			    	}	
			    }
				break;
			}
		}
		else if( type == "column")
		{
			switch(action)
			{
			    case this.Event.ACTION_INSERT:
			    {
			    	for(var index in tokenList)
			    	{		    
			    		var token = tokenList[index];
			    		var formulaRef = token.getText();
			    		var parsedRefInFormula = websheet.Helper.parseRef(formulaRef);
			    		var isHasSheetName = true;
			    		if( !parsedRefInFormula)
			    			continue;
			    		if( !parsedRefInFormula.sheetName)
			    		{
			    			parsedRefInFormula.sheetName = parsedCellRef.sheetName;
			    			isHasSheetName = false;
			    		}
			    		var iparsedRefInFormulaColumn = parsedRefInFormula.startCol;
		    			var iparsedRefColumn =  parsedRef.startCol;
			    		if(token.getType()=="cell")
			    		{
			    			if(parsedRefInFormula.sheetName == parsedRef.sheetName
			    			   && iparsedRefInFormulaColumn >= iparsedRefColumn )
			    			{
			    				var newColIndex = iparsedRefInFormulaColumn + 1;
			    				var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
	    						formulaRef = websheet.Helper.getCellAddr(refSheetName, parsedRefInFormula.startRow, newColIndex);
			    			}
			    		}
			    		else if(token.getType() == "range")
			    		{
			    			if(parsedRefInFormula.sheetName == parsedRef.sheetName)
			    			{
			    				var iparsedRefInFormulaEndColumn = parsedRefInFormula.endCol;
			    				if(iparsedRefColumn <=  iparsedRefInFormulaColumn)
			    				{
			    					var newStartColIndex = iparsedRefInFormulaColumn + 1;
			    					var newEndColIndex = iparsedRefInFormulaEndColumn + 1;			    					
			    					var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
		    						formulaRef = websheet.Helper.getAddressByIndex(refSheetName, parsedRefInFormula.startRow, newStartColIndex, null, parsedRefInFormula.endRow, newEndColIndex, {refMask:websheet.Constant.RANGE_MASK});
			    				}
			    				else if( iparsedRefColumn > iparsedRefInFormulaColumn &&  iparsedRefColumn <= iparsedRefInFormulaEndColumn)
			    				{
			    					var newEndColIndex = iparsedRefInFormulaEndColumn + 1;
			    					var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
		    						formulaRef = websheet.Helper.getAddressByIndex(refSheetName, parsedRefInFormula.startRow, parsedRefInFormula.startCol, null, parsedRefInFormula.endRow, newEndColIndex, {refMask:websheet.Constant.RANGE_MASK});
			    				}
			    			}
			    		}
			    		token.setChangedText(formulaRef);
			    	}	
			    }
				break;
			    case this.Event.ACTION_DELETE:
			    {
			    	for(var index in tokenList)
			    	{		    
			    		var token = tokenList[index];
			    		var formulaRef = token.getText();
			    		var parsedRefInFormula = websheet.Helper.parseRef(formulaRef);
			    		var isHasSheetName = true;
			    		if(! parsedRefInFormula)
			    			continue;
			    		if(!parsedRefInFormula.sheetName)
			    		{
			    			parsedRefInFormula.sheetName = parsedCellRef.sheetName;
			    			isHasSheetName = false;
			    		}
			    		var iparsedRefInFormulaColumn = parsedRefInFormula.startCol;
		    			var iparsedRefColumn =  parsedRef.startCol;
			    		if(token.getType()=="cell")
			    		{
			    			if(parsedRefInFormula.sheetName == parsedRef.sheetName)
			    			{
			    				if(parsedRefInFormula.startCol == parsedRef.startCol)
			    				{
			    					formulaRef = this._ERROR;
			    				}
			    				else if(iparsedRefInFormulaColumn > iparsedRefColumn)
			    				{
									var newColIndex = iparsedRefInFormulaColumn - 1;
									var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
		    						formulaRef = websheet.Helper.getCellAddr(refSheetName, parsedRefInFormula.startRow, newColIndex);
			    				}
			    			}
			    		}
			    		else if(token.getType() == "range")
			    		{
			    			if(parsedRefInFormula.sheetName == parsedRef.sheetName)
			    			{
			    				var iparsedRefInFormulaEndColumn = parsedRefInFormula.endCol;
			    				if(iparsedRefColumn < iparsedRefInFormulaColumn)
			    				{
			    					var newStartColIndex = iparsedRefInFormulaColumn - 1;
			    					var newEndColIndex = iparsedRefInFormulaEndColumn - 1;
			    					var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
		    						formulaRef = websheet.Helper.getAddressByIndex(refSheetName, parsedRefInFormula.startRow, newStartColIndex, null, parsedRefInFormula.endRow, newEndColIndex, {refMask:websheet.Constant.RANGE_MASK});
			    				}
			    				else if(iparsedRefColumn == iparsedRefInFormulaColumn && iparsedRefColumn == iparsedRefInFormulaEndColumn)
			    				{
			    					var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
		    						formulaRef = websheet.Helper.getAddressByIndex(refSheetName, parsedRefInFormula.startRow, -1, null, parsedRefInFormula.endRow, -1, {refMask:websheet.Constant.RANGE_MASK, invalidRef:true});
			    				}	
			    				else if( iparsedRefColumn <= iparsedRefInFormulaEndColumn)
			    				{
			    					var newEndColIndex = iparsedRefInFormulaEndColumn - 1;
			    					var refSheetName = isHasSheetName ? parsedRefInFormula.sheetName : null;
		    						formulaRef = websheet.Helper.getAddressByIndex(refSheetName, parsedRefInFormula.startRow, parsedRefInFormula.startCol, null, parsedRefInFormula.endRow, newEndColIndex, {refMask:websheet.Constant.RANGE_MASK});
			    				}
			    			}
			    		}
			    		token.setChangedText(formulaRef);
			    	}	
			    }
				break;
			}
		}
		var newCellValue = this.modifyFormulaContent(cellValue,tokenList, tarr);
		return newCellValue;
	},
	
	transformRowCell: function(prior, latter)
	{
		var priorAction = prior.action;
		var latterAction = latter.action;
		var priorRefValue = prior.reference.refValue;
		var latterRefValue = latter.reference.refValue;
		var handledRowRefValue = websheet.Helper.handleRefValue(priorRefValue,this.Event.SCOPE_ROW);
		
		var parsedRowRef = websheet.Helper.parseRef(handledRowRefValue);
		var parsedCellRef = websheet.Helper.parseRef(latterRefValue);
		
		if(parsedRowRef.sheetName != parsedCellRef.sheetName)
			return;
		
		if(priorAction == this.Event.ACTION_SET)
		{	
			switch (latterAction)
			{
				case this.Event.ACTION_SET:
				{
					if(!this.isCellInRow(latterRefValue,priorRefValue)) 
						return;
					if(undefined != prior.data.visibility &&  null != prior.data.visibility)
						return;
					latter.OTResult=1;
				}
				break;
			}
		}
		else if(priorAction == this.Event.ACTION_INSERT)
		{
			switch (latterAction)
			{
				case this.Event.ACTION_SET:
				{
					//If the set cell is just above the insert row, the row need follow the cell's style 
					if (parsedCellRef.startRow == parsedRowRef.startRow - 1 && latter.data && latter.data.cell && latter.data.cell.style)
					{
						latter.OTResult=1;
						return;
					}
					
					var cellValue = latter.data.cell.v;
					//Set cell is formula cell
					if(typeof cellValue == "string" && websheet.Helper.formulaPattern.test(cellValue))
					{
						var tarr = latter.data.cell.tarr;
						var newCellValue = this.transformFormulaInCell("row",this.Event.ACTION_INSERT, parsedRowRef, cellValue, parsedCellRef, tarr);
						if (newCellValue) 
						{
							latter.data.cell.v = newCellValue;
							if(tarr)
				    	    	latter.data.cell.tarr = tarr;
						}
					}
					
					//Change formula cell refValue
					if (parsedCellRef.startRow >= parsedRowRef.startRow)
					{
						var insertRowCount = parsedRowRef.endRow - parsedRowRef.startRow + 1;
						parsedCellRef.startRow += insertRowCount;
						latter.reference.refValue = parsedCellRef.toString();
					}
				}
				break;
			}		
		}
		else if(priorAction == this.Event.ACTION_DELETE)
		{
			switch (latterAction)
			{
				case this.Event.ACTION_SET:
				{
					if(parsedRowRef.sheetName == parsedCellRef.sheetName )
					{
						if(parsedCellRef.startRow >=parsedRowRef.startRow && parsedCellRef.startRow <=parsedRowRef.endRow)
						{
							latter.OTResult=2;
						}
						else
						{
							var cellValue = latter.data.cell.v;
							//Set cell is formula cell
							if(typeof cellValue == "string" && websheet.Helper.formulaPattern.test(cellValue))
							{
								var tarr = latter.data.cell.tarr;
								var newCellValue = this.transformFormulaInCell("row",this.Event.ACTION_DELETE, parsedRowRef, cellValue, parsedCellRef, tarr);
								if (newCellValue) 
								{
									latter.data.cell.v = newCellValue;
									if(tarr)
						    	    	latter.data.cell.tarr = tarr;
								}
							}
							//Change formula cell refValue
							if (parsedCellRef.startRow >= parsedRowRef.startRow)
							{
								var insertRowCount = parsedRowRef.endRow - parsedRowRef.startRow + 1;
								parsedCellRef.startRow -= insertRowCount;
								latter.reference.refValue = parsedCellRef.toString();
							}
						}
					}
				}
				break;
				case this.Event.ACTION_MOVE:
				//implement latter:
				break;
			}	
		}
		else if(priorAction == this.Event.ACTION_MOVE)
		{
			var moveFrom = parsedRowRef.startRow;
			var moveTo = moveFrom + parseInt(prior.data.delta);
			switch (latterAction)
			{
				case this.Event.ACTION_SET:
				{
					if(parsedRowRef.sheetName == parsedCellRef.sheetName )
					{
						latter.OTResult=1;
					}
				}
				break;
				case this.Event.ACTION_MOVE:
				//implement latter:
				break;
			}	
		}
		else if(priorAction == this.Event.ACTION_CLEAR)
		{
			switch (latterAction)
			{
				case this.Event.ACTION_SET:
				{
					if(!this.isCellInRow(latterRefValue,priorRefValue)) 
						return;
					latter.OTResult=2;
				}
				break;
			}
		}
	},
		
	transformColCell: function(prior, latter)
	{
		var priorAction = prior.action;
		var latterAction = latter.action;
		var priorRefValue = prior.reference.refValue;
		var latterRefValue = latter.reference.refValue;
		var handledColRefValue = websheet.Helper.handleRefValue(priorRefValue,this.Event.SCOPE_COLUMN);
		
		var parsedColRef = websheet.Helper.parseRef(handledColRefValue);
		var parsedCellRef = websheet.Helper.parseRef(latterRefValue);
		
		var icellColIndex = parsedCellRef.startCol;
		var iColIndex =  parsedColRef.startCol;
		var iColEndIndex = parsedColRef.endCol; 
		if(priorAction == this.Event.ACTION_SET)
		{	
			switch (latterAction)
			{
				case this.Event.ACTION_SET:
				{
					if(parsedColRef.sheetName != parsedCellRef.sheetName) return;
					if(icellColIndex >= iColIndex && icellColIndex <= iColEndIndex)
					{
						latter.extraArray[this._localEventIdx] = prior;
					}	
				}
				break;
			}
		}
		else if(priorAction == this.Event.ACTION_INSERT)
		{
			switch (latterAction)
			{
				case this.Event.ACTION_SET:
				{
					if(parsedColRef.sheetName == parsedCellRef.sheetName )
					{
						//Cell is just left of the inserted column, the column need follow the cell's style
						if(icellColIndex+1==iColIndex && latter.data && latter.data.cell && latter.data.cell.style)
						{
							latter.OTResult=1;
							return;
						}
						
						var cellValue = latter.data.cell.v;	
						//Transform the formula cell
						if(typeof cellValue == "string" && websheet.Helper.formulaPattern.test(cellValue))
						{
							var tarr = latter.data.cell.tarr;
							var newCellValue = this.transformFormulaInCell("column",this.Event.ACTION_INSERT, parsedColRef, cellValue, parsedCellRef, tarr);
							if (newCellValue) 
							{
								latter.data.cell.v = newCellValue;
								if(tarr)
					    	    	latter.data.cell.tarr = tarr;
							}
						}
						var insertCount = iColEndIndex - iColIndex + 1;
						if(icellColIndex >= iColIndex)
						{
							parsedCellRef.startCol = icellColIndex + insertCount;
							latter.reference.refValue = parsedCellRef.toString();
						}
						else
						{
							var colspan = latter.data.cell.cs;
							if(colspan && colspan > 1 && icellColIndex + colspan - 1 >= iColIndex)
								latter.data.cell.cs = colspan + insertCount;
						}
					}
				}
				break;
			}		
		}
		else if(priorAction == this.Event.ACTION_DELETE)
		{
			switch (latterAction)
			{
				case this.Event.ACTION_SET:
				{
					if(parsedColRef.sheetName == parsedCellRef.sheetName )
					{
						if( parsedCellRef.startCol == parsedColRef.startCol )
						{
							latter.OTResult=2;
							return;
						}
						
						var cellValue = latter.data.cell.v;						
						if(typeof cellValue == "string" && websheet.Helper.formulaPattern.test(cellValue))
						{
							var tarr = latter.data.cell.tarr;
							var newCellValue = this.transformFormulaInCell("column",this.Event.ACTION_DELETE, parsedColRef, cellValue, parsedCellRef, tarr);
							if (newCellValue) 
							{
								latter.data.cell.v = newCellValue;
								if(tarr)
					    	    	latter.data.cell.tarr = tarr;
							}
						}
						//Change cell refValue
						if (icellColIndex > iColIndex)
						{
							var cnt = iColEndIndex - iColIndex + 1;
							parsedCellRef.startCol = icellColIndex - cnt;
							latter.reference.refValue = parsedCellRef.toString();
						}
						else
						{
							var colspan = latter.data.cell.cs;
							if(colspan && colspan>1 && icellColIndex+colspan-1>=iColIndex)
								latter.data.cell.cs = colspan - 1;
						}
					}
				}
				break;
				case this.Event.ACTION_MOVE:
				//implement latter:
				break;
			}	
		}
		else if(priorAction == this.Event.ACTION_MOVE)
		{
			var moveFrom = parsedColRef.startCol;
			var moveTo = moveFrom + parseInt(prior.data.delta);
			switch (latterAction)
			{
				case this.Event.ACTION_SET:
				{
					if(parsedColRef.sheetName == parsedCellRef.sheetName )
						latter.OTResult=1;
				}
				break;
			}	
		}
	},
	
	// no OT needed
	transformRowSheet:function(prior, latter){
		var priorAction = prior.action;
		var latterAction = latter.action;
		if(latterAction == this.Event.ACTION_DELETE)
		{
			var pRef = websheet.Helper.parseRef(prior.reference.refValue);
			var lsheetName = latter.reference.refValue.split("|")[0];
			if(pRef.sheetName == lsheetName)
			{
				this.getOTManager().conflictResolve(this._index);
			}
		}
		else if(latterAction == this.Event.ACTION_SET)
		{
			if(priorAction == this.Event.ACTION_INSERT && this.hasFormulaImpacted(latter,prior) )
			{
				latter.OTResult = 1;
				return;
			}
		}	
		else if(latterAction == this.Event.ACTION_FREEZE)
		{
			//if the prior action (insert row) contain some info about undoFreeze row,
			//and the latter action is also freeze row
			if(priorAction == this.Event.ACTION_INSERT && prior.data && prior.data.undoFreeze
				&& latter.data && latter.data.row)
			{
				latter.OTResult = 2;
				return;
			}
		}	
	},
		
	// no OT needed
	transformColSheet:function(prior, latter){
		var priorAction = prior.action;
		var latterAction = latter.action;
		var pRef = websheet.Helper.parseRef(prior.reference.refValue);
		var lsheetName = latter.reference.refValue.split("|")[0];

		if(latterAction == this.Event.ACTION_DELETE)
		{
			if(pRef.sheetName == lsheetName)
			{
				this.getOTManager().conflictResolve(this._index);
			}
		}
		else if(latterAction == this.Event.ACTION_SET)
		{
			if(priorAction == this.Event.ACTION_INSERT && this.hasFormulaImpacted(latter,prior) )
			{
				latter.OTResult = 1;
				return;
			}
		}	
		else if(latterAction == this.Event.ACTION_FREEZE)
		{
			if(pRef.sheetName != lsheetName) return;
			//if the prior action (insert col) contain some info about undoFreeze col,
			//and the latter action is also freeze col
			if(priorAction == this.Event.ACTION_INSERT && prior.data && prior.data.undoFreeze
				&& latter.data && latter.data.col)
			{
				latter.OTResult = 2;
				return;
			}
		}	
	},
	
	transformSheetRow:function(prior, latter){
		var priorAction = prior.action;
		var latterAction = latter.action;
		
		if (priorAction == this.Event.ACTION_DELETE)
		{
			var prefValue  = prior.reference.refValue;
			var priorSheetName = websheet.Helper.handleRefValue(prefValue,this.Event.SCOPE_SHEET);
			var lrefValue  = latter.reference.refValue;
			var handledLatRef = websheet.Helper.handleRefValue(
					lrefValue,this.Event.SCOPE_ROW);
			var parsedLatRef = websheet.Helper.parseRef(handledLatRef);
			var latterSheetName = parsedLatRef.sheetName;
            if (priorSheetName == latterSheetName)
            {
            	latter.OTResult=2;
            	return;	
           	}
            	
		}	
		else if(priorAction == this.Event.ACTION_SET )
		{
			var latterRefValue = latter.reference.refValue;		
			var handledRowRefValue = websheet.Helper.handleRefValue(
					latterRefValue,this.Event.SCOPE_ROW);	
			var parsedRowRef = websheet.Helper.parseRef(handledRowRefValue);
			var oldSheetName = websheet.Helper.handleRefValue(prior.reference.refValue,this.Event.SCOPE_SHEET);
			var newSheetName = prior.data.sheet.sheetname;
			//not rename sheet
			if (newSheetName == undefined)
				return;
			if(latterAction == this.Event.ACTION_INSERT && this.hasFormulaImpacted(prior,latter) )
			{
				latter.OTResult = 1;
				return;
			}
			if( oldSheetName == parsedRowRef.sheetName)
			{
				var newEndRow = (parsedRowRef.startRow == parsedRowRef.endRow && undefined == latter.data.visibility) ? parsedRowRef.startRow : parsedRowRef.endRow;
				latter.reference.refValue = websheet.Helper.getAddressByIndex(newSheetName, parsedRowRef.startRow, null, null, newEndRow, null, {refMask:websheet.Constant.ROWS_MASK});
			}			
		}
		else if(priorAction == this.Event.ACTION_FREEZE)
		{
			if(prior.data && prior.data.row && 
			 latterAction == this.Event.ACTION_INSERT && latter.data && latter.data.undoFreeze)
			{
				latter.data.undoFreeze = undefined;
			}	
		}	
	},
	
	transformSheetCol:function(prior, latter){
		var priorAction = prior.action;
		var latterAction = latter.action;
		
		var lRef = websheet.Helper.parseRef(latter.reference.refValue);
		var psheetName = prior.reference.refValue.split("|")[0];
	
		if (priorAction == this.Event.ACTION_DELETE)
		{
			if(lRef.sheetName != psheetName) return;
			latter.OTResult=2;
		}
		else if(priorAction == this.Event.ACTION_SET )
		{
			var newSheetName = prior.data.sheet.sheetname;
			//not rename sheet
			if (newSheetName == undefined)
				return false;
			if(latterAction == this.Event.ACTION_INSERT && this.hasFormulaImpacted(prior,latter) )
			{
				latter.OTResult = 1;
				return;
			}
			if(lRef.sheetName == psheetName)
			{
				latter.reference.refValue = websheet.Helper.getAddressByIndex(newSheetName, null, lRef.startCol, null, null, lRef.endCol, {refMask:websheet.Constant.COLS_MASK});
			}	
		}
		else if(priorAction == this.Event.ACTION_FREEZE)
		{
			if(lRef.sheetName != psheetName) return;
			if(prior.data && prior.data.col && 
			 latterAction == this.Event.ACTION_INSERT && latter.data && latter.data.undoFreeze)
			{
				latter.data.undoFreeze = undefined;
			}	
		}
		
		return false;
	},
	// parse the ReferenceToken from the value with tokenArray
	getReferenceTokenList: function(value, tarr)
	{
    	if(null == value || undefined == value) return null;
    	if(tarr)
    		return websheet.parse.FormulaParseHelper.getTokenList(value, tarr);
    	else {
    		var list;
    		try {
    			list = websheet.parse.FormulaParseHelper.parseTokenList(value);
    		} catch(e){
    			list = null;
    		}
    		return list;
    	}
	},
	
	//update the originalValue and tokenArray with the referenceTokenList changed text
	modifyFormulaContent: function(originalValue, ReferenceTokenList, tarr)
	{
		return websheet.parse.FormulaParseHelper.updateFormula(originalValue, ReferenceTokenList, tarr);
	},
	// no OT needed
	transformCellSheet:function(prior, latter){
		var priorAction = prior.action;
		var latterAction = latter.action;
		if(latterAction == this.Event.ACTION_DELETE)
		{
			var pRef = websheet.Helper.parseRef(prior.reference.refValue);
			var lsheetName = latter.reference.refValue.split("|")[0];
			if(pRef.sheetName == lsheetName)
			{
				this.getOTManager().conflictResolve(this._index);
			}
		}
		if(latterAction == this.Event.ACTION_INSERT)
		{
			var pRef = websheet.Helper.parseRef(prior.reference.refValue);
			var lsheetName = latter.reference.refValue.split("|")[0];
			if(pRef.sheetName != lsheetName)
			{
				latter.OTResult = 1;
			}
		}
		return;
	},
	
	/*just handle the set cell with formula, 
	 * return the new cell value if it contain reference
	 * null :  the cell value not contain reference
	*/
	transformRenameSheetSetCellWithFormula: function(oldSheetName, newSheetName,cellValue, tarr)
	{
    	if(null == cellValue || undefined == cellValue )
    	{		    	
    		return null;  //no OT
    	}
    	var tokenList = this.getReferenceTokenList(cellValue, tarr);
    	if(null == tokenList || 0 == tokenList.length) 
    	{
    		return null;
    	}
    	for(var index in tokenList)
    	{		    
    		var token = tokenList[index];
    		var formulaRef = token.getText();
    		formulaRef = formulaRef.replace(oldSheetName,newSheetName);
    		token.setChangedText(formulaRef);
    	}	
    	var newCellValue = this.modifyFormulaContent(cellValue,tokenList, tarr);
    	return newCellValue;
	},
	
	transformSheetCell:function(prior, latter)
	{
		var priorAction = prior.action;
		var latterAction = latter.action;
		if(priorAction == this.Event.ACTION_SET)
		{	
	    	var newSheetName = prior.data.sheet.sheetname;
	    	//not rename sheet
			if (newSheetName == undefined)
				return;
	    	var oldSheetName = prior.reference.refValue;
	    	var cellRefValue = latter.reference.refValue;
	    	var parsedCellRef = websheet.Helper.parseRef(cellRefValue);
	    	if(parsedCellRef.sheetName == oldSheetName)
	    	{
	    		latter.reference.refValue = websheet.Helper.getCellAddr(newSheetName, parsedCellRef.startRow, parsedCellRef.startCol);
	    	}
			switch (latterAction)
			{
				case this.Event.ACTION_SET:
			    {
			    	var cellValue = latter.data.cell.v;
			    	var tarr = latter.data.cell.tarr;
			    	if(null == cellValue || undefined == cellValue )
			    	{		    	
			    		return;  //no OT
			    	}
			    	var newCellValue = this.transformRenameSheetSetCellWithFormula(oldSheetName,newSheetName,cellValue, tarr);
			    	if( null != newCellValue)
			    	{
			    	    latter.data.cell.v = newCellValue;
			    	    if(tarr)
			    	    	latter.data.cell.tarr = tarr;
			    	}
			    }
				break;
			    case this.Event.ACTION_MOVE:
			    // no OT
			    break;
			}	
		}
		else if(priorAction == this.Event.ACTION_DELETE)
		{
			//TODO: sheetId 2 name
			var pRefValue = prior.reference.refValue;
	    	var pSheetName = pRefValue.split("|")[0];
	    	var lRefValue = latter.reference.refValue;
	    	var parsedCellRef = websheet.Helper.parseRef(lRefValue);
	    	var lSheetName = parsedCellRef.sheetName;
			switch(latterAction)
			{
				case this.Event.ACTION_SET:
				{				
			    	if(pSheetName == lSheetName)
			    	{    	
			    		latter.OTResult=2;
			    	}	
				}	
				break;
				case this.Event.ACTION_MOVE:
				{				
			    	if(pSheetName == lSheetName)
			    	{    	
			    		latter.OTResult=2;
			    	}	
				}
				break;
			}
		}
	},
	
	transformColRow:function(prior, latter)
	{
		var priorAction = prior.action;
	   	var latterAction = latter.action;
		var lrefValue  = latter.reference.refValue;
		var lref = websheet.Helper.parseRef(lrefValue);
        var prefValue = prior.reference.refValue;
        var pref = websheet.Helper.parseRef(prefValue);
		if (latterAction == this.Event.ACTION_SET)
		{
			switch(priorAction)
			{
				case this.Event.ACTION_SET:
				{
		            if(lref.sheetName == pref.sheetName)
		            	latter.extraArray[this._localEventIdx] = prior;
				}
				break;
				case this.Event.ACTION_INSERT:
				{
					if(lref.sheetName == pref.sheetName)
		            {
		            	if(latter.data && latter.data.rows)
		            		latter.OTResult=1;
		            }	
		            //No OT for set row range
				}
				break;
				case this.Event.ACTION_DELETE:
				{
					if(lref.sheetName == pref.sheetName)
		            {
		            	if(latter.data && latter.data.rows)
		            		latter.OTResult=1;
		            }	
				}
				break;
			}
		}
		else if(latterAction == this.Event.ACTION_INSERT)
		{
			switch(priorAction)
			{
				case this.Event.ACTION_SET:
				{
					if(lref.sheetName == pref.sheetName)
						latter.OTResult=1;
				}
				break;
				case this.Event.ACTION_INSERT:
				{
					if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
		            if(lref.sheetName == pref.sheetName || this.hasFormulaImpacted(prior, latter) || this.hasFormulaImpacted(latter, prior))	
		            	latter.OTResult=1;
				}
				break;
				case this.Event.ACTION_DELETE:
				{
		            if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
		            if(lref.sheetName == pref.sheetName || this.hasFormulaImpacted(prior, latter))	
		            	latter.OTResult=1;
				}
				break;
			}
		}
		else if(latterAction == this.Event.ACTION_CLEAR)
		{
			var bCut = latter.data && latter.data.bCut;
			if(!bCut)
				return false;
			if(lref.sheetName == pref.sheetName)
				latter.extraArray[this._localEventIdx] = prior;
		}
		else if(latterAction == this.Event.ACTION_DELETE)
		{
			switch(priorAction)
			{
				case this.Event.ACTION_INSERT:
				{
		            if (this.hasSharedFormulaRefImpacted(latter, prior)) {
						latter.OTResult = 1;
						return;
					}
		            if(this.hasFormulaImpacted(latter, prior))	
		            	latter.OTResult=1;
				}
				break;
			}
		}
		return false;
	},
	
	/*
	 * determine if json is empty. didn't consider properties set in object prototype.
	 */
	_isEmpty: function(json) {
		for (var p in json) { return false; }
		return true;
	},
	
	/*
	 * add delta to rows json index, if row index is greater then startIndex (default to 0), return adjusted json
	 */
	 _addDeltaToRowJson: function(rowsJson, delta, startIndex) {
	 	if (delta == 0) {
	 		return rowsJson;
	 	}
	 	
	 	if (startIndex == undefined || startIndex == null) {
	 		startIndex = 0;
	 	}
	 	
	 	var ret = {};
	 	
	 	for (var rowIndex in rowsJson) {
	 		rowIndex = parseInt(rowIndex);
	 		var o = rowsJson[rowIndex];
	 		if (rowIndex >= startIndex) {
	 			rowIndex += delta;
	 		}
	 		ret[rowIndex] = o;
	 	}
	 	
	 	return ret;
	 },
	 
	 _isRowsJsonForStyle: function(rowsJson) {
	 	for (var rowIndex in rowsJson) {
	 		var row = rowsJson[rowIndex];
	 		for (var colName in row) {
	 			var cell = row[colName];
	 			return cell.style != undefined;
	 		}
	 	}
	 	return false;
	 },
	 
	 _isAtomicMsg: function(){
		 var msg = this._message;
		 if (msg && msg.updates && msg.updates.length > 1 && msg.atomic)
			 return true;
		 else
			 return false;
	 }
});