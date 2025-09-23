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

dojo.provide("websheet.collaboration.CommentsHandler");
dojo.require("concord.util.events");
dojo.require("concord.util.browser");
dojo.require("dojo.i18n");
dojo.requireLocalization("websheet","base");
dojo.requireLocalization("websheet.collaboration","CommentsHandler");

dojo.declare("websheet.collaboration.CommentsHandler", websheet.listener.Listener, {
	editor : null,
	_commentsList:null,
	active:"active",
	inactive:"inactive",
	usage:websheet.Constant.RangeUsage.COMMENTS,
	msgType: 'comments',
	actAdd: 'add',
	actDelete: 'delete',
	actAppend: 'append',
	actUpdate: 'update',
	actUndoAppend: 'undoAppend',
	activeId: null,
	activedPri: 0,
	cmtSidebar : null,
	newCmt: false,
	
	constructor: function(editor){
		this.editor = editor;
		this._doc = editor.getDocumentObj();
		this._commentsList = {};
		this._regEvent();
		this.nls = dojo.i18n.getLocalization("websheet.collaboration","CommentsHandler");
	},
	
	_regEvent: function(){
    	concord.util.events.subscribe(concord.util.events.commenting_popupDlg_click, this, '_handleCommentsBoxClick');
    	concord.util.events.subscribe(concord.util.events.commenting_popupDlg_mouseOut, this, '_handleCommentsBoxMouseOut');
    	concord.util.events.subscribe(concord.util.events.commenting_addCommentPopupDlg, this, '_handleaddCommentPopup');
    	concord.util.events.subscribe(concord.util.events.commenting_closeCommentPopupDlg, this, '_handleCommentsBoxClose');
	},
	
	_handleCommentsBoxClose: function()
	{
		if(this.activeId){
			var cmt = this._commentsList[this.activeId];
			cmt.state = this.inactive;
		}
		this.activeId = null;
		this.activedPri = 0;
	},
	
	_handleaddCommentPopup:function(isOpen)
	{
		this.newCmt = isOpen;
	},
	
	_handleCommentsBoxClick: function()
	{
		if(this.activeId){
			var range = this._commentsList[this.activeId].range;
	    	var refValue = this._getRefValue(range);
	    	this.activedPri = 1;
	    	var selection = window.getSelection();
	    	if (selection.type == "None" || selection.isCollapsed) {
	    		var rangeInfo = range._getRangeInfo();
	    		var grid = this.editor.getController().getGrid(rangeInfo.sheetName);
	    		if (grid) {
	    			grid.selection.scrollToSelection(rangeInfo.startRow - 1, rangeInfo.startCol);
	    		}
	    	}
			// unselect image
	    	var parsedRef = websheet.Helper.parseRef(refValue);
	    	this.editor.getDrawFrameHdl().unSelectDrawFrames(parsedRef.sheetName);
		}
	},
	
	_handleCommentsBoxMouseOut: function()
	
	{
		if(!this.activeId || this.activedPri)
    		return;
        var range = this._commentsList[this.activeId].range;
        
        var grid = this.editor.getCurrentGrid();
        if(grid.hoverCell && range.compare(websheet.Helper.parseRef(grid.hoverCell)) == websheet.Constant.AreaRelation.EQUAL)
        	return;
        
        this.commentsUnSelected(this.activeId);
		concord.util.events.publish(concord.util.events.comments_deselected,[this.activeId, true]);
		if (grid.selection.isSelectingRange()) {
			grid.focus();
		}
	},
	
	scrollIntoView:function()
	{
		var grid = this.editor.getCurrentGrid();
		var colIndex = grid.selection.getFocusedCol();
		var rowIndex = grid.selection.getFocusedRow();
		if (rowIndex >= grid.freezeRow && (rowIndex < grid.scroller.firstVisibleRow || rowIndex > grid.scroller.lastVisibleRow)) {
			grid.scroller.scrollToRow(rowIndex);
		}
		if (colIndex > grid.freezeCol && (colIndex < grid.scroller.firstVisibleCol || colIndex > grid.scroller.lastVisibleCol)) {
			grid.scroller.scrollToColumn(colIndex);
		}
	},
	
	//get position to popup comments box.
	getPosition: function(commentsId)
	{
		if(this._doc.getPartialLoading())
			return {x: -1, y: -1};
		var grid = this.editor.getCurrentGrid();
		var cell, posCol, posRow;
		if(commentsId){
			var comments = this._commentsList[commentsId];
			if(comments)
				cell = comments.range;
			if(cell){
				var info = cell._getRangeInfo();
				posCol = info.startCol;
				posRow = info.startRow - 1;
			}
		} else {
			posRow = grid.selection.getFocusedRow();
			posCol = grid.selection.getFocusedCol();
		}
		var merge = grid.cellMergeInfo(posRow, posCol);
		if (posCol < grid.scroller.firstVisibleCol && merge && merge.colSpan + posCol > grid.scroller.firstVisibleCol) {
			posCol = grid.scroller.firstVisibleCol;
		}
		if (grid.scroller.isRowInVisibleArea(posRow) && grid.scroller.isColumnInVisibleArea(posCol)) {//&& grid.isColumnInVisibleArea(posCol)//merge cell
			var position = grid.geometry.getCellPosition(posRow, posCol, true);
			if (position.w > 0 && position.h > 0) {
				position.y = position.t + grid.gridRect.top;
				if (!grid.isMirrored) {
					position.x = position.l;
				} else {
					position.x = grid.geometry.getGridWidth() - position.l - position.w;
				}
				return position;
			} else {
				this.collapseCommentsByFocus(true);
			}
		}
		return {x: -1, y: -1};			
	},
		
	commentBoxReLocation:function(){
		if(this.activeId || this.newCmt){
			if(!this.activedPri && !this.newCmt){
				this.commentsUnSelected(this.activeId);
				concord.util.events.publish(concord.util.events.comments_deselected,[this.activeId, true]);
			}else{
				concord.util.events.publish(concord.util.events.commentBoxReLocation,[this.activeId]);
			}
		}else
			concord.util.events.publish(concord.util.events.comments_deselected,[]);
	},
	
	moveComments: function(range, sortData)
	{
		var rangeJson = sortData.sortresults;
		var isExtend = false;
		if(sortData.criterion && sortData.criterion.isExtend)
		{
			isExtend = true;
		}
	
		var rangeInfo = range._getRangeInfo();
		var sheetName = rangeInfo.sheetName;
		var commentsList = this._commentsList; 
		for(var commentId in commentsList)
		{
			var cmt = commentsList[commentId];
			var cmtRange = cmt.range;
			var cmtRangeInfo = cmtRange._getRangeInfo();
			// comment range is a cell
			if(isExtend)
			{
				
				var theSameSheet = sheetName === cmtRangeInfo.sheetName;
				if (theSameSheet)
				{
					this._moveComments(cmtRange, cmtRangeInfo, range, rangeInfo, rangeJson, isExtend);
				}
			}
			else
			{
				var compareResult = websheet.Helper.compareRange(rangeInfo, cmtRangeInfo);
				if (compareResult == websheet.Constant.RangeRelation.EQUAL || compareResult == websheet.Constant.RangeRelation.SUPERSET)
				{
					this._moveComments(cmtRange, cmtRangeInfo, range, rangeInfo, rangeJson, isExtend);
				}
			}
		}
	},
	
	_moveComments: function(cmtRange, cmtRangeInfo, range, rangeInfo, rangeJson, isExtend)
	{
		var offset = rangeInfo.startRow - 1; 
		var cmtRow = cmtRangeInfo.startRow - 1;
		var cmtRowWithOffset = cmtRow - offset;
		var sheetName = rangeInfo.sheetName;
		if(rangeJson && rangeJson.length >= cmtRowWithOffset + 1)
		{
			var colIndex = cmtRangeInfo.startCol;
			var cmtNewRow = rangeJson.indexOf(cmtRowWithOffset) + offset;
			
			if(cmtNewRow == cmtRow)
				return;

			var rangeId = cmtRange.getId();
			var parsedRef = new websheet.parse.ParsedRef(sheetName, cmtNewRow+1,colIndex, -1, -1, websheet.Constant.CELL_MASK);
			var areaMgr = this._doc.getAreaManager();
			areaMgr.updateRangeByUsage(parsedRef, rangeId, websheet.Constant.RangeUsage.COMMENTS);
			
			var controller = this.editor.getController();
			var grid = controller.getGrid(sheetName);		
			if (grid && grid.isGridLoaded()) {
				// TODO, How to render and update the comments ?
				grid.renderer.renderWidgets();
			}
		}
	},
	
	add:function(commentsId){
		if(!this._commentsList[commentsId]){
			var areaMgr = this._doc.getAreaManager();
			var range = areaMgr.getRangeByUsage(commentsId, websheet.Constant.RangeUsage.COMMENTS);
			if(range != null){
				var parsedRef = range.getParsedRef();
				if(this.getCommentsByRef(parsedRef) == null){
					this.appendCmtsInfo(commentsId, range);
					this._updateCommentsIcon(parsedRef);
				}
			}
		}
    },
    
    _updateCommentsIcon:function (parsedRef)
    {
    	var grid = this.editor.getController().getGrid(parsedRef.sheetName);
    	if (grid) {
    		//update comments icon?
    		grid.renderer.renderWidgets();
    	}
    },
    
    //Change the comments icon in cell when comments actived/inactived.
    //If the cell of the comments is not displayed(hide, merged and so on), return true;
    _show: function(commentsId){
    	var commentsList = this._commentsList;
    	var range = commentsList[commentsId].range;
    	var refValue = this._getRefValue(range);
//    	console.warn("TODO: Change comments icon on the cell");
    	return;
    	//TODO, NO CELL NODE ANYMORE
     	var cellNode = websheet.Utils.getGridCellNode(refValue);
    	if(!cellNode || dojo.style(cellNode, "display") == "none" || dojo.style(cellNode.parentNode, "display") == "none")
    		return true;
    	var state = commentsList[commentsId].state;
    	var comments = this._doc.getComments(commentsId);
    	if(state==this.active){
    		if(!comments.items[0].resolved){
    			dojo.removeClass(cellNode, "inactiveCommentImg");
    			dojo.removeClass(cellNode, "resolvedCommentImg");
	    		dojo.addClass(cellNode, "activeCommentImg");
    		}else{
    			dojo.removeClass(cellNode, "inactiveCommentImg");
    			dojo.removeClass(cellNode, "activeCommentImg");
    			dojo.addClass(cellNode, "resolvedCommentImg");
    		}
    	}
    	else{
    		if(!comments.items[0].resolved){
    			dojo.removeClass(cellNode, "activeCommentImg");
    			dojo.removeClass(cellNode, "resolvedCommentImg");
	    		dojo.addClass(cellNode, "inactiveCommentImg");
    		}else{
    			dojo.removeClass(cellNode, "inactiveCommentImg");
    			dojo.removeClass(cellNode, "activeCommentImg");
    			dojo.removeClass(cellNode, "resolvedCommentImg");
    		}
    	}
    },
    
    getCommentsByRef: function(parsedRef){
    	var commentsList = this._commentsList;
    	for(var commentsId in commentsList){
    		var range = commentsList[commentsId].range;
    		if( range.compare(parsedRef) == websheet.Constant.AreaRelation.EQUAL )
    			return commentsId;
    	}
    	return null;
    },
    
	appendCmtsInfo : function(commentsId, range,state){
		this._commentsList[commentsId] = {};
		this._commentsList[commentsId].range = range;
		this._commentsList[commentsId].state = this.inactive;
	},
    
    remove:function(commentsId, commentArea){
    	if(this.hasCmts(commentsId)){
    		if(this.activeId == commentsId){
    			this.commentsUnSelected(commentsId);
    			concord.util.events.publish(concord.util.events.comments_deselected,[commentsId]);
    		}
			delete this._commentsList[commentsId];
			
			var parsedRef = commentArea.getParsedRef();
			this._updateCommentsIcon(parsedRef);
			var parsedRef = websheet.Helper.parseRef(this._getFocsuedCellAddr());
			if(commentArea.compare(parsedRef) == websheet.Constant.AreaRelation.EQUAL)
    			concord.util.events.publish(concord.util.events.commentButtonDisabled,[false]);
		}
    },

	//If the cell of the comments is not displayed(hide, merged and so on), return true;
	commentsSelected:function(commentsId, noFocus){
    	this._commentsList[commentsId].state = this.active;
    	var inVisible = false;
    	var range = this._commentsList[commentsId].range;
    	if(!noFocus){
	    	var refValue = this._getRefValue(range);
	    	var parsedRef = websheet.Helper.parseRef(refValue);
	    	if(parsedRef){
	    		var sheetObj = this._doc.getSheet(parsedRef.sheetName);
	    		if (sheetObj && !sheetObj.isSheetVisible()) 
	    			inVisible = true;
	    		else{
	    			var controller = this.editor.getController();
	    			if(controller.getPartial(parsedRef.sheetName)){
	    				var method = dojo.hitch(pe.scene.sidebar.commentsController, "_handleShowComments",commentsId);
	           			this.editor.getPartialManager().addNotify(method);
	           				return true;
	    			}
	    			else
	    			{
	    				if(parsedRef.startRow > this.editor.getMaxRow())
	    					inVisible = true;
	    				else
	    				{
	    					var col = sheetObj.getColumn(parsedRef.startCol,true);
	    					if(col && !col.isVisible())
	    						inVisible = true;
	    					if(!inVisible)
	    					{
	    						var row = sheetObj.getRow(parsedRef.startRow,true);
	    						if(row && !row.isVisibility())
	    							inVisible = true;
	    					}
	    					if(!inVisible)
	    					{
	    						inVisible = sheetObj.isCoveredCell(parsedRef.startRow,parsedRef.startCol);
	    					}	
	    				}	
	    			}
	    		}
	    		if(!inVisible){
	    			// unselect image
	    	    	this.editor.getDrawFrameHdl().unSelectDrawFrames(parsedRef.sheetName);
	    			
	    	    	this.editor.moveFocusTo(refValue, true);
	    	    	var colIndex =  parsedRef.startCol;
			    	var grid = this.editor.getCurrentGrid();
			    	if (colIndex > grid.freezeCol && colIndex < grid.scroller.firstVisibleCol || colIndex > grid.scroller.lastVisibleCol) {
			    		grid.scroller.scrollToColumn(colIndex);
			    	}
					this.activedPri = 1;
	    		}
	    	}
    	}
    	if(!inVisible)
    		inVisible = this._show(commentsId);
    	if(!noFocus && inVisible){
    		this.collapseCommentsByFocus(true);
    		var ref = range.getParsedRef().getAddress({refMask: websheet.Constant.CELL_MASK});
        	//this.editor.scene.showWarningMessage(dojo.string.substitute(this.nls.CMT_CAN_NOT_POPUP, [ref]), 5000);
        	var dlg =  new concord.widgets.MessageBox(this, "", null, false, 
					{message: dojo.string.substitute(this.nls.CMT_CAN_NOT_POPUP, [ref])});
        	dlg.show();
    		return true;
    	}
    	this.activeId = commentsId;
    },
    
    commentsUnSelected:function(commentsId){
    	this._commentsList[commentsId].state = this.inactive;
    	this._show(commentsId);
    	this.activeId = null;
    	this.activedPri = 0;
    },  
    
    //popup comments box when cell mouseover
    expandComments:function(rangeAddress){
    	if((dijit.popup._stack && dijit.popup._stack.length > 0) || (dijit.Dialog._dialogStack && dijit.Dialog._dialogStack.length > 1))
    		return;
    	
    	if((this.activeId && this.activedPri) || this.newCmt)
    		return;
    	
    	var grid = this.editor.getCurrentGrid();
    	if (grid.selection.isPickingRange())
    		return;
		
    	var newOpened = false;
    	if (!this.editor.scene.sidebar && !pe.scene.bMobileBrowser) 
		{
    		newOpened = true;
    		dojo["require"]("concord.concord_sheet_widgets");
    		this.editor.scene.toggleSideBar(); 
		}

        var commentsList = this._commentsList;
        var parsedRef = websheet.Helper.parseRef(rangeAddress);
        for(var commentsId in commentsList)
        {
			var range = commentsList[commentsId].range;
			
			if( range.compare(parsedRef) == websheet.Constant.AreaRelation.EQUAL ){
				if(this.activeId != commentsId){
					if(newOpened){
						setTimeout(dojo.hitch(this, function(){
						  this.commentsSelected(commentsId, true);
					      concord.util.events.publish(concord.util.events.comments_selected,[commentsId, true]);
					    }), 220 );
		        	}else{
		        		this.commentsSelected(commentsId, true);
		        		concord.util.events.publish(concord.util.events.comments_selected,[commentsId, true]);
		        	}
					var events = [];
	    			events.push({"name":"commentClicked", "params":[commentsId]});
	    			this.editor.publishForMobile(events);
				}
				break;
			}
        }
    },
    
    isCommentsOpening: function(rangeAddress){
    	if(!this.activeId)
    		return false;
    	
        var range = this._commentsList[this.activeId].range;
        var parsedRef = websheet.Helper.parseRef(rangeAddress);
        if(range.compare(parsedRef) == websheet.Constant.AreaRelation.EQUAL)
        	return true;
        
        return false;
    },
    
    collapseCommentsByFocus:function(close){
    	if(!this.activeId){
    		concord.util.events.publish(concord.util.events.comments_deselected,[]);
    		if(this.newCmt){//close new/orphan comments box  if it is opened when cell focused.
    			this.newCmt = false;
    		} 
			return;
    	}
    	
    	if(close){
    		concord.util.events.publish(concord.util.events.comments_deselected,[this.activeId]);
    		this.commentsUnSelected(this.activeId);
    	}else{
            var range = this._commentsList[this.activeId].range;
        	
            var cellAddr = this._getFocsuedCellAddr();
            var parsedRef = websheet.Helper.parseRef(cellAddr);
        	if(range.compare(parsedRef) == websheet.Constant.AreaRelation.EQUAL)
        		return;
        	
			concord.util.events.publish(concord.util.events.comments_deselected,[this.activeId]);
			this.commentsUnSelected(this.activeId);
			if (this.editor.getCurrentGrid().geometry.quickRowHeight(parsedRef.startRow - 1) <= 0) {
				return;
			}
			var currComm = this.getCommentsByRef(parsedRef);
			if(currComm){
				this.commentsSelected(currComm, true);
				concord.util.events.publish(concord.util.events.comments_selected,[currComm, true]);
			}
    	}
    },
    
    //close comments box when mouse out
    collapseComments:function(commentsId){
    	if(!this.activeId){
    		return;
    	}
    	if(this.activedPri)
    		return; 
    	
        var range = this._commentsList[this.activeId].range;
        
        //collapse comments box when mouse out, other comments maybe actived because of 500ms delay when mouse out.
    	if(commentsId == this.activeId){
    		var parsedRef = websheet.Helper.parseRef(this._getFocsuedCellAddr());
			if(range.compare(parsedRef) == websheet.Constant.AreaRelation.EQUAL)
				return;
        	if(!this.cmtSidebar)
        		this.cmtSidebar = this.editor.scene.getSidebar();
    		var grid = this.editor.getCurrentGrid();
    		if(!this.cmtSidebar.getPCommentsHoverStatus(commentsId) &&(!grid.hoverCell || range.compare(websheet.Helper.parseRef(grid.hoverCell)) != websheet.Constant.AreaRelation.EQUAL)){
        		this.commentsUnSelected(commentsId);
    			concord.util.events.publish(concord.util.events.comments_deselected,[commentsId, true]);
    		}
    	}
    	else{
    		this._commentsList[commentsId].state = this.inactive;
			this._show(commentsId);
    	}
    },
    
    //when cell focused, changed the status of comment button. 
    focus2Cell:function(sheetName, rowIndex, colIndex){
    	if(this.editor.getCurrentGrid().getInlineEditor().isEditing()){
    		concord.util.events.publish(concord.util.events.commentButtonDisabled,[true]);
    		return;
    	}
    	var commentsList = this._commentsList;
    	for(var commentsId in commentsList){
    		var range = commentsList[commentsId].range;
    		var rangeInfo = range._getRangeInfo();
    		if(rangeInfo.sheetName == sheetName && rangeInfo.startRow == rowIndex && rangeInfo.startCol == colIndex){
    			concord.util.events.publish(concord.util.events.commentButtonDisabled,[true]);
    			return;
    		}
    	}
    	concord.util.events.publish(concord.util.events.commentButtonDisabled,[false]);
    },
   
    /*
     * Called by sidebar to create/delete/append/update(resolved/reopen) comments.
     */
  //register comments on range
	CreateComments:function(comments) {
		var commentsId = comments.getId();
		concord.util.events.publish(concord.util.events.commentButtonDisabled,[true]);
		
		var refValue = this._getFocsuedCellAddr();
		var attrs = {usage: this.usage, rangeid: commentsId};
	    var items = [];
	    items.push(comments.items[0].e);
	    attrs.data = {items: items};
	    var revAttrs = {usage: this.usage, rangeid: commentsId};
	    this.editor.execCommand(commandOperate.INSERTRANGE, [commentsId, refValue, attrs, revAttrs]);
    },
	
	_getFocsuedCellAddr: function()
	{
		var grid = this.editor.getCurrentGrid();
		var rangeAddress = websheet.Helper.getCellAddr(grid.sheetName, (grid.selection.getFocusedRow() + 1), grid.selection.getFocusedCol());
		return rangeAddress;
	},
	
	DeleteComments:function(commentsId){
		if(this._commentsList[commentsId]){
			if(commentsId == this.activeId && this._commentsList[commentsId].state == this.active){
        		this.commentsUnSelected(this.activeId);
    			concord.util.events.publish(concord.util.events.comments_deselected,[this.activeId]);
			}
			
			var range = this._commentsList[commentsId].range;
			var controller = this.editor.getController();
			var refValue = range.getParsedRef().getAddress();
			var attrs = {usage: this.usage, rangeid: commentsId};
			var revAttrs = {usage: this.usage, rangeid: commentsId};
			var comments = this._doc.getComments(commentsId);
			revAttrs.data = {items: comments.items};
			this.editor.execCommand(commandOperate.DELETERANGE, [commentsId, refValue, attrs, revAttrs]);
			
			controller.validateSheet(range.getSheetName());
		}
    },
	    
    AppendComments:function(commentsId, item){
		if(this._commentsList[commentsId]){
			var range = this._commentsList[commentsId].range;
			var refValue = range.getParsedRef().getAddress();
	        var attrs = {usage: this.usage, rangeid: commentsId};
	        attrs.data = {action : this.actAppend, item: item.e};
	        
	        var revAttrs = {usage: this.usage, rangeid: commentsId};
	        revAttrs.data = {action: this.actUndoAppend, item: item.e};
	        
			this.editor.execCommand(commandOperate.SETRANGEINFO, [refValue, attrs, refValue, revAttrs]);
		}
    },
    
    UpdateComments:function(commentsId, index, item)
    {
		if(this._commentsList[commentsId]){
			var comments = this._doc.getComments(commentsId);
			var range = this._commentsList[commentsId].range;
			var refValue = range.getParsedRef().getAddress();
			var attrs = {usage: this.usage, rangeid: commentsId};
	        attrs.data = {index: index, item: dojo.clone(item.e)};

	        var revAttrs = {usage: this.usage, rangeid: commentsId};
	        revAttrs.data = {index: index};
	        revAttrs.data.item = dojo.clone(comments.items[index]);
	        revAttrs.data.item.resolved = !item.e.resolved;
	        
	        this.editor.execCommand(commandOperate.SETRANGEINFO, [refValue, attrs, refValue, revAttrs]);
		}
    },
    
    /*
     * Send message to sidebar when insert/delete/append/undo append/update comments is from undo/redo or othere clients.
     */    
    publishInsCmtsMsg:function(commentsId,comments)
	{
		var msg = {};
		msg.type = this.msgType;
		msg.action = this.actAdd;
		msg.id = commentsId;
		
		var msgList = [];
		for(var i = 0; i< comments.length; i++){
			msg.data = comments[i];
			msgList.push(msg);
		}
		
		this._msgReceived(msg);
	},
	
	publishDelCmtsMsg:function(commentsId)
    {
    	var msg = {};
		msg.type = this.msgType;
		msg.action = this.actDelete;
		msg.id = commentsId;
		
		var msgList = [];
		msgList.push(msg);
		this._msgReceived(msg);
    },
    
    publishAppCmtsMsg:function(commentsId, item)
    {
    	var msg = {};
		msg.type = this.msgType;
		msg.action = this.actAppend;
		msg.id = commentsId;
		msg.data = item;
		
		var msgList = [];
		msgList.push(msg);
		this._msgReceived(msg);
    },
    
    publishUndoAppCmtsMsg:function(commentsId, item)
    {
    	var msg = {};
		msg.type = this.msgType;
		msg.action = this.actUndoAppend;
		msg.id = commentsId;
		msg.data = item;
		
		var msgList = [];
		msgList.push(msg);
		this._msgReceived(msg);
    },
        
    publishUptCmtsMsg:function(commentsId, index, item)
    {
    	var msg = {};
		msg.type = this.msgType;
		msg.action = this.actUpdate;
		msg.id = commentsId;
		msg.index = index;
		msg.data = item;
		
		var msgList = [];
		msgList.push(msg);
		this._msgReceived(msg);
    },

    _msgReceived:function(msg){
    	var commentsProxy = this.editor.scene.getSession().commentsProxy;
    	if(commentsProxy)
    		commentsProxy.msgReceived(msg);
    },
    
	hasCmts:function(commentsId){
		return this._commentsList[commentsId] ? true : false;
	},
	
	//called when user join, initalize the comments list
	loadComments : function(){
		var areaManager = this._doc.getAreaManager();
		var ranges = areaManager.getRangesByUsage(websheet.Constant.RangeUsage.COMMENTS);
		for(var i=0; i<ranges.length; i++){
			var range = ranges[i];
			var commentsId = range.getId();
			this.appendCmtsInfo( commentsId, range);
		}
	},

	_getRefValue:function(range){
		var refValue = range.getParsedRef().getAddress({refMask: websheet.Constant.CELL_MASK});
    	return refValue;
	},
	
	initCommentsStore: function()
	{
		return this._doc._comments;
	},
	
	/*************************Listener***************************/
	//listen insert/delete/set area, predelete row/col, predelete sheet which is broadcast by area
	notify: function(source, e)
	{
		if(e && e._type == websheet.Constant.EventType.DataChange)
		{
			var s = e._source;
			var area = source;
			var commentsId = area.getId();
			if (s.refType == websheet.Constant.OPType.AREA) {
				switch(s.action) {
					case websheet.Constant.DataChange.DELETE:{
						this.remove(commentsId, area);
						this._doc.deleteComments(commentsId);
						if(s.mode !== undefined)
							this.publishDelCmtsMsg(commentsId);
						break;
					}
					case websheet.Constant.DataChange.INSERT:{
						this.add(commentsId, area);
						this._doc.addComments(commentsId, s.data.items);
						if(s.mode !== undefined)
							this.publishInsCmtsMsg(commentsId, s.data.items);
						delete area.data.items;
						break;
					}
					case websheet.Constant.DataChange.SET:{
						if (!s.data)
							break;
						if(this.actAppend  == s.data.action){
							this._doc.appendComments(commentsId, s.data.item);
							if(s.mode !== undefined)
								this.publishAppCmtsMsg(commentsId, s.data.item);
						}else if(this.actUndoAppend == s.data.action){
							this._doc.undoAppendComments(commentsId, s.data.item);
							if(s.mode !== undefined)
								this.publishUndoAppCmtsMsg(commentsId, s.data.item);
						}else{
							this._doc.updateComments(commentsId, s.data.index, s.data.item);
							if(s.mode !== undefined)
								this.publishUptCmtsMsg(commentsId, s.data.index, s.data.item);
							this._updateCommentsIcon(area.getParsedRef());
						}
						// you can do something when comment position changed, such as sort the area which contains the comments
						break;
					}
				}
			}else if(s.refType == websheet.Constant.OPType.SHEET){
				if (s.action == websheet.Constant.DataChange.PREDELETE ){
					var comments = this._doc.getComments(commentsId);
					area.data = {items : comments.items};//backup comments
					this.remove(commentsId, area);
					this._doc.deleteComments(commentsId);
					this.publishDelCmtsMsg(commentsId);
					
				}
//				else if(s.action == websheet.Constant.DataChange.INSERT ){//recover sheet
//					this.add(commentsId, area);
//					if(area.data && area.data.items){
//						this._doc.addComments(commentsId, area.data.items);
//						this.publishInsCmtsMsg(commentsId, area.data.items);
//						delete area.data;
//					}
//				}
			}else if(s.action == websheet.Constant.DataChange.PREDELETE ){
				if (s.refType == websheet.Constant.OPType.ROW || s.refType == websheet.Constant.OPType.COLUMN){
					if(s.data && s.data.collectUndo){
						var undoRange = this._doc.getAreaManager().delUndoAreas[area.getId()];
						var comments = this._doc.getComments(commentsId);
						if (comments) {
							undoRange.data ={items : comments.items};
						}
						if (commentsId) {
							this.remove(commentsId, area);
							this._doc.deleteComments(commentsId);
							this.publishDelCmtsMsg(commentsId);
						}
					}
				}
			}
		}
	}
});
