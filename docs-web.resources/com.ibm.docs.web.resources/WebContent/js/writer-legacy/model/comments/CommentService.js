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
dojo.provide("writer.model.comments.CommentService");
dojo.require("concord.util.events");
/*
 * This class is intend to manage comments
 * It responses for comments load/save
 * and add/modify/delete 
 */
writer.model.comments.CommentService = (function () {
    var instantiated = null;
    var init = function () {
    	var clz = { 
// class definition starts
    constructor:function(){	
		this.comments = {};
		this.comments_children = [];
		this.comment_items = [];
		this.select_comment_id = [];
		this.laststate = {len:0, startview:null, endview:null, scrbasept:null, enablechksel:false, sticky:false};
		dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, this.selectionChangeHandler);
		dojo.subscribe(writer.EVENT.PAGESCROLLED, this, this.selectionChangeHandler);
		dojo.subscribe(writer.EVENT.DOMCREATED, this, this.nodeDomCreated);
		dojo.subscribe(writer.EVENT.EDITAREACHANGED, this, this.editModeChangeHandler);
		dojo.subscribe(concord.util.events.comments_queryposition, this, this._getPosition); 
		var openCommentBar = function() {
			pe.scene.instanceReady();
		};
		dojo.subscribe(writer.EVENT.FIRSTTIME_RENDERED, this, openCommentBar);
		
		concord.util.events.subscribe(concord.util.events.commenting_popupDlg_click, this, '_handlePopupCommentsBoxClick');
		concord.util.events.subscribe(concord.util.events.commenting_popupDlg_mouseOut, this, '_handlePopupCommentsBoxMouseOut');
		concord.util.events.subscribe(concord.util.events.commenting_popupDlg_mouseOver, this, '_handlePopupCommentsBoxMouseOver');
		concord.util.events.subscribe(concord.util.events.commenting_addCommentPopupDlg, this, '_handleaddCommentPopup');
	},
	//register selection change event
	selectionChangeHandler:function(){
		if (this.hoverIntent_t) 
			this.hoverIntent_t = clearTimeout(this.hoverIntent_t);
		if (this.hoverinterval) 
			this.hoverinterval = clearInterval(this.hoverinterval);
		setTimeout(dojo.hitch(this, function() {
			var bAdd = this.checkAddComment(true, true);  // check valid range
			var comment_btn = dijit.byId("concord_comment_btn");
			if (bAdd){
				pe.lotusEditor.getCommand('toggleCommentsCmd').enable();
				if(comment_btn) comment_btn.setAttribute('disabled', false);
			} else {
				pe.lotusEditor.getCommand('toggleCommentsCmd').disable();
				if(comment_btn) comment_btn.setAttribute('disabled', true);
			}
			
			if (!this.laststate.enablechksel)
				return;
			
			var selectionchanged = false;
			var selection = pe.lotusEditor.getSelection();
			var ranges = selection.getRanges();
			var lastcmtrangelen = this.laststate.len,
			lastcmtsview = this.laststate.startview,
			lastcmteview = this.laststate.endview;
			if (lastcmtsview && lastcmtsview.obj && lastcmteview && lastcmteview.obj) {
				var startview = ranges[0].getStartView(), endview = ranges[0].getEndView(); 
				if (lastcmtrangelen != ranges.length || 
					lastcmtsview.obj != startview.obj || lastcmtsview.index != startview.index ||
					lastcmteview.obj != endview.obj || lastcmteview.index != endview.index) {
					 selectionchanged = true;
				}
			}

			if (!selectionchanged) {
				var lefttop = {x:0, y:0};
				lefttop = pe.lotusEditor._shell.logicalToScreen(lefttop);
				if (this.laststate.scrbasept && ((Math.abs(this.laststate.scrbasept.x - lefttop.x) > 1) || 
						                   (Math.abs(this.laststate.scrbasept.y - lefttop.y) > 1))) {
					/*
					if (this.laststate.sticky) {
						// scrolled or resized, need relocate popup comment box
						var cmtid = null;
						if (this.select_comment_id.length > 1)
							cmtid = this.select_comment_id;
						else if (this.select_comment_id.length === 1)
							cmtid = this.select_comment_id[0];
						concord.util.events.publish(concord.util.events.commentBoxReLocation,[cmtid]);
						return;
					} */
					selectionchanged = true;
				}
			}

			if (!selectionchanged)
				return;
			
			// this function is only to disable pop comment dialog.
			// so if there is no selected comment, do nothing.
			if (this.select_comment_id.length == 0) {
				this.laststate.len = 0; this.laststate.startview = null; this.laststate.endview = null;this.laststate.scrbasept = null; this.laststate.enablechksel = false; this.laststate.sticky = false;
				concord.util.events.publish(concord.util.events.comments_deselected,[]);
				return;
			}
			
			this.unselectAllCommentsAndClearState(true);

			//if(ranges.length>1)
			//	return;

/*			var torestcmtrange = false;
			var range = ranges[0];
			if(range.isCollapsed()) {
				if (this.handleCommentRange(range))
					torestcmtrange = true;
			} else if(this.isImageRange(range)){
				var clist = this.getCList(range.startModel.obj);
				if (clist.length <= 0 || !this.isSelectedComments(clist[0]))
					this.unselectAllComments();
				torestcmtrange = true;
			}
			if (torestcmtrange) {
				this.laststate.len = 0; this.laststate.startview = null; this.laststate.endview = null;this.laststate.scrbasept = null; this.laststate.sticky = false;
			}*/
		}), 30);
	},
	//register the edit mode change event
	editModeChangeHandler:function(){
		if(pe.lotusEditor.isContentEditing()) {
			dojo.publish(concord.util.events.disable_commentsPanel, [false]);
		}else{
			dojo.publish(concord.util.events.disable_commentsPanel, [true]);
		}
	},

	hoverIntent_t : null,
	hoverinterval : null,
	closeHover_t  : null,
	
	nodeDomCreated:function(model, domNode, view, args) {
		var hoverIntent_s = false;
		var cmtsrv = this;
		var m_moveevent = null;
		if (!writer.util.ModelTools.hasComments(model) || !domNode) return;
		
		var cfg = {
			interval: 100,   // interval for mouse move check
			delay: 500,      // delay time for hover handler
			sensity: 5,       // mouse sensitivity distance
			updatesensity: 1  // for update check
		};
		
		// Mac/safari is more sensitive
		if (dojo.isMac&&dojo.isSafari) {cfg.interval=200;cfg.sensity = 3;}

		// instantiate variables
		// cX, cY = current X and Y position of mouse, updated by mousemove event
		// pX, pY = previous X and Y position of mouse, set by mouseover and polling interval
		// oX, oY = original X and Y position of mouse, set by mouseover
		var cX, cY, pX, pY, oX, oY;

		var _onHoverInterval = function(model, domNode, view) {
			if (cmtsrv.laststate.sticky) // one time trigger, kill the interval himself
				return;
			cmtsrv.hoverinterval = clearInterval(cmtsrv.hoverinterval);
			if (!domNode || !model || !writer.util.ModelTools.hasComments(model)) return;
			// close all hover close timer triggered by other domNode
			cmtsrv.closeHover_t = clearTimeout(cmtsrv.closeHover_t);
			var clist = cmtsrv.getCList(model);
			if (clist.length <= 0 || cmtsrv.isSameClistAsSelected(clist))
				return;
			cmtsrv.showSelectComment(model);
		};
		// in this timer, it always close all popup boxes except it has been changed into sticky state already
		// so do not want to close pop, need close the timer before it is triggered
		var _onCloseHoverTimer = function() {
			if (cmtsrv.closeHover_t)
				cmtsrv.closeHover_t = clearTimeout(cmtsrv.closeHover_t);
			
			if (cmtsrv.laststate.sticky) return;

			cmtsrv.unselectAllCommentsAndClearState(true);
		};
        // A private function for comparing current and previous mouse position
        var compare = function() {
        	cmtsrv.hoverIntent_t = clearTimeout(cmtsrv.hoverIntent_t);
            // compare mouse positions to see if they've crossed the threshold
            if (Math.sqrt( (pX-cX)*(pX-cX) + (pY-cY)*(pY-cY) ) < cfg.sensity &&
            	Math.sqrt( (oX-cX)*(oX-cX) + (oY-cY)*(oY-cY) ) >= cfg.updatesensity) {
                // set hoverIntent state to true (so mouseOut can be called)
                hoverIntent_s = true;
                dojo.disconnect(m_moveevent); m_moveevent = null; 
                /*cmtsrv.hoverinterval = setInterval(dojo.hitch(cmtsrv, _onHoverInterval, model, domNode, view), cfg.delay);*/
                _onHoverInterval(model, domNode, view);
                return;
            } else {
                // set previous coordinates for next time
                pX = cX; pY = cY;
                // use self-calling timeout, guarantees intervals are spaced out properly (avoids JavaScript timer bugs)
                cmtsrv.hoverIntent_t = setTimeout( function(){compare();}, cfg.interval);
            }
        };
		var _onMouseMove = function (ev) {
			cX = ev.pageX;
			cY = ev.pageY;
		};
		var _onMouseOver = function(ev) {
			pX = ev.pageX; pY = ev.pageY;
			oX = pX; oY = pY;
			cX = pX; cY = pY;
			
			if (!domNode || !model || !writer.util.ModelTools.hasComments(model)) return;
			
			// check if having the same cl list
			if (cmtsrv.closeHover_t) {
				var clist = cmtsrv.getCList(model);
				if (clist.length>0 && cmtsrv.isSameClistAsSelected(clist)) { // treat it as same domnode
					hoverIntent_s = true;
					cmtsrv.closeHover_t = clearTimeout(cmtsrv.closeHover_t);
					return;
				}
			}

			m_moveevent = dojo.connect(domNode, 'onmousemove', null, _onMouseMove);
			if (!hoverIntent_s) { cmtsrv.hoverIntent_t = setTimeout( function(){compare();}, cfg.interval);}
		};
		var _onMouseOut = function () {
			if (hoverIntent_s) {
				hoverIntent_s = false;
				cmtsrv.closeHover_t = setTimeout( _onCloseHoverTimer, cfg.delay);
			}
			cmtsrv.hoverIntent_t = clearTimeout(cmtsrv.hoverIntent_t);
			if (cmtsrv.hoverinterval)
				cmtsrv.hoverinterval = clearInterval(cmtsrv.hoverinterval);
			if (m_moveevent) dojo.disconnect(m_moveevent);
		};

		dojo.connect(domNode, 'onmouseenter', null, _onMouseOver);
		dojo.connect(domNode, 'onmouseleave', null, _onMouseOut);
		//dojo.connect(domNode, 'onmousemove', null, _onMouseMove);
		dojo.connect(domNode, "onmousedown", null, _onMouseOut); // same behavior as out
	},
	
	findSameCommentID:function(run_pre,run_next){
		var comment_ids = [];
		if (!run_pre && !run_next) return comment_ids;
		if (run_pre === run_next && run_pre.start === 0 && run_pre.length ===0) {
			if (run_next.clist) comment_ids = run_next.clist.concat();
			return comment_ids;
		}
		if (!run_pre || run_pre === run_next) // try to find prev run
			run_pre = writer.util.ModelTools.getPrev(run_next,writer.util.ModelTools.isRun);			
		if (!run_next)
			run_next = writer.util.ModelTools.getNext(run_pre,writer.util.ModelTools.isRun);
		if(!run_pre || !run_pre.clist || !run_next || !run_next.clist || run_pre === run_next)
			return comment_ids;
		for(var i=0;i<run_pre.clist.length;i++){
			var comment_id = run_pre.clist[i];
			for(var j=0;j<run_next.clist.length;j++){
				if(comment_id==run_next.clist[j])
					comment_ids.push(comment_id);
			}
		}
		return comment_ids;
	},
	handleCommentByView:function(runview){
		if(runview.model&&runview.model.modelType===writer.MODELTYPE.IMAGE)
			this._trackImageCommentRange(runview);
		else if(runview.model&&runview.model.modelType===writer.MODELTYPE.TEXT)
			this._trackTextCommentRange(runview);
	},
	_trackImageCommentRange:function(runview){
		start = {"obj": runview, "index": 0 };
		end = {"obj": runview, "index": 0};
		//var range = new writer.core.Range( start, end);
		var next_run = writer.util.ModelTools.getNext(runview.model,writer.util.ModelTools.isRun);
		var pre_run = writer.util.ModelTools.getPrev(runview.model,writer.util.ModelTools.isRun);
		while(next_run!=null) {
			if(next_run.length==0) {
				var nrun = writer.util.ModelTools.getNext(next_run,writer.util.ModelTools.isRun);
				next_run = (nrun===next_run?null:nrun);
			} else
				break;
		}
		while(pre_run!=null) {
			if(pre_run.length==0) {
				var prun = writer.util.ModelTools.getPrev(pre_run,writer.util.ModelTools.isRun);
				pre_run = (prun===pre_run?null:prun);
			} else
				break;
		}
		if(next_run==null || pre_run==null) {
			return;
		}		
		var same_ids = this.findSameCommentID(next_run,pre_run);
		if(same_ids.length>0) {
			if(!runview.model.clist||runview.model.clist.length==0) {
				runview.model.clist = same_ids.concat();
				this.insertCmtTextRun(runview.model);
			}
		}			
	},
	_trackTextCommentRange:function(runview){
		if(runview.model.length!=0)
			return;
		start = {"obj": runview, "index": 0 };
		end = {"obj": runview, "index": 0};
		var range = new writer.core.Range( start, end);		
		var iterator = new writer.common.RangeIterator(range);
		var next_run = null;
		var pre_run = null;
		var next = null;
		if(next = iterator.next()){
			if(next.length==0) 
			//the empty line cases
			{
				next_run = writer.util.ModelTools.getNext(next,writer.util.ModelTools.isRun);
				pre_run = writer.util.ModelTools.getPrev(next,writer.util.ModelTools.isRun);
				while(next_run!=null) {
					if(next_run.length==0){
						var nrun = writer.util.ModelTools.getNext(next_run,writer.util.ModelTools.isRun);
						next_run = (nrun===next_run?null:nrun);
					} else
						break;
				}
				while(pre_run!=null) {
					if(pre_run.length==0) {
						var prun = writer.util.ModelTools.getPrev(pre_run,writer.util.ModelTools.isRun);
						pre_run = (prun===pre_run?null:prun);
					} else
						break;
				}
				if(pre_run==null) {
					//this.removeCommentRef(next);
					return;
				}
				
				var same_ids = null;
				if (pre_run.clist && pre_run.clist.length >0) {
					var tbl = writer.util.ModelTools.getTable(runview.model);
					var nexttbl = writer.util.ModelTools.getTable(next_run);
					if (tbl && (tbl != nexttbl || !next_run)) {
						var cell = writer.util.ModelTools.getCell(runview.model);
						var prevcell = writer.util.ModelTools.getCell(pre_run);
						if (cell == prevcell) same_ids = pre_run.clist;
					}
				} else
					same_ids = [];
				if (!same_ids&&next_run!=null)
					same_ids = this.findSameCommentID(next_run,pre_run);
				if(same_ids&&same_ids.length>0) {
					if(!next.clist||next.clist.length==0) {
						this.addComment2Run(next, same_ids);
					}
				}
				/*
				else {
					if(next.clist.length>0){
						this.removeCommentRef(next);					
					}
				}
				*/
			}

		}
	},
	isCommentContinued:function(obj,index){
		if(obj.clist&&obj.clist.length==0)
			return true;
		else {
			if(index<obj.length)
				return true;
		}

		// check if the end of last table cell
		var tbl = writer.util.ModelTools.getTable(obj);
		var next_run = writer.util.ModelTools.getNext(obj,writer.util.ModelTools.isRun);
		if(next_run==null) {
			if (tbl) return true;
			else return false;
		} else {
			var ntbl = writer.util.ModelTools.getTable(next_run);
			if (tbl && (!ntbl || ntbl !== tbl ))
				return true;
		}
		var same_ids = this.findSameCommentID(next_run,obj);
		if(same_ids.length>0) {
			return true;
		}
		return false;
	},
	handleCommentRange:function(range){
		var ret = false;
		var iterator = new writer.common.RangeIterator(range);
		var next = null;
		if(next = iterator.next()){
			var clist = this.getCList(next);
			if (clist.length <= 0 || !this.isSelectedComments(clist[0])) {
				ret = true;
				this.unselectAllComments();
			}
		}
		return ret;
	},
	
	trySetComment:function(obj,json,create){
		if(pe.scene && pe.scene.isHTMLViewMode())
			return;
		
		if(json && json.cl&&json.cl.length>0) {
			obj.clist = json.cl.concat();
			this.insertCmtTextRun(obj);
			obj.comment_selected = json.cselected;
		}
	},

	trySetCommentOnInsertHint:function(hint, pre_run, next_run) {
		if(pe.scene.isHTMLViewMode())
			return;
		
		if(hint.modelType===writer.MODELTYPE.IMAGE || hint.modelType===writer.MODELTYPE.TEXT) {
			var same_ids = this.findSameCommentID(pre_run, next_run);
			if(same_ids.length>0) {
				hint.clist = same_ids.concat();
				this.insertCmtTextRun(hint);
			}
		}
	},

	isImageRange:function(range){
			if(range.getStartModel().obj == range.getEndModel().obj) {
				return writer.util.ModelTools.isImage(range.getStartModel().obj);
			}
			return false;
	},
	isTextBoxRange:function(range){
		if(range.getStartModel().obj == range.getEndModel().obj) {
			return writer.util.ModelTools.isTextBox(range.getStartModel().obj);
		}
		return false;
	},
	
	getCommentListOnPara:function(para, idx, len) {
		var cllist = [], end = para.text.length; 
		if (!idx) idx = 0;
		if (len) end = idx + len;
		var run = para.container.getFirst();
		while(run)
		{
			if (run.start < idx) continue;
			if ((run.start+run.length) >= end) break;
			if (run.clist && run.clist.length > 0)
				cllist.concat(run.clist);
			run = this.container.next(run);
		}
		
		return cllist;
	},

	showSelectComment:function(run){
		//disable showSelectComment 
		//when cmd is disabled
		var command =  pe.lotusEditor.getCommand("selectComment");
		if( command && (command.state == writer.TRISTATE_DISABLED || command.state == writer.TRISTATE_HIDDEN ) )
			return;
		
		// when focus in notes/header/footer, do nothing
		var selection = pe.lotusEditor.getSelection();
		var ranges = selection.getRanges();
		if (ranges.length > 0) {
			var model = ranges[0].getStartModel().obj;
			if (writer.util.ModelTools.isInNotes(model)|| writer.util.ModelTools.isInHeaderFooter(model))
				return;
			if (this.isImageRange(ranges[0]) && run === model)
				return;  // hover on selected image
		}

		if(run.clist&&run.clist.length>0) {
			var commentsIds = [];
			for (var i = run.clist.length - 1; i >= 0; i--) {
				var commentsId = run.clist[i];
				var comment = this.comments[commentsId];
				// don't show response and resolved comment
				if (!comment || comment.done == "1") continue;
				commentsIds.push(commentsId); // only for parent comments
			}

			if (commentsIds.length >= 0) {
				if ( !pe.scene.sidebar ) pe.scene.toggleSideBar();    	    
				/*var newOpened = pe.scene.sidebar.openCommentsPane();			
				if( newOpened )
				{
				    setTimeout( function(){	
				      concord.util.events.publish(concord.util.events.comments_selected,[commentsId, true]);
				      pe.lotusEditor.focus();
				    }, 1020);
				}
				else
				{
				}*/
				if (commentsIds.length == 1) {
					concord.util.events.publish(concord.util.events.comments_selected,[commentsIds[0], true]);
				} else {
					concord.util.events.publish(concord.util.events.comments_selected,[commentsIds, true]);
				}
//				console.error( "Need change the behavior of 'writer.model.comments.CommentServiceshowSelectComment()'");

				//this.selectComment(commentsIds[0],false,false);
			}
		} 	
	},
	createComments:function(commentsJson){
		if(commentsJson){
			for(var n=0;n<commentsJson.length;n++) {
				var comment = commentsJson[n];
				if(comment) {
					if (!comment.date)
						comment.date = "1999-06-07T00:00:00.000Z"; // Office 97 release date
					if(!comment.pid && comment.pid != 0)
						this.comments[comment.id] = comment;
					else
						this.comments_children.push(comment);
				}
			}
		}
		/*function sortCommentByDate(a,b){
			return new Date(a.date).getTime() - new Date(b.date).getTime();
		}
		this.comments_children.sort(sortCommentByDate);*/
	},
	
	/*
	 * when load comments from JSON
	 * add the related runs to comment item
	 */
	insertCmtTextRun:function(textrun){
		for(var n=0;n<textrun.clist.length;n++) {
			var comment = this.comments[textrun.clist[n]];
			if(comment) {
				comment.runs = comment.runs||new Array();
				comment.runs.push(textrun);
			}
		}
	},

	getCurrentMaxIndex:function(){
		var maxIndex = 0;
		for(var n in this.comments){
			var comment = this.comments[n];
			if(comment&&comment.index) {
				maxIndex = Math.max(parseInt(comment.index), maxIndex);
			}
		}
		return parseInt(maxIndex);
	},
	/*
	 * construct the comment store for side bar show
	 */
	initCommentsStore:function() {
		this.comment_items = [];
		for(var n in this.comments){
			var comment = this.comments[n];
			var xcomment = this.getXCommentItem(comment.id);
			if (xcomment)
				this.comment_items.push(xcomment);
		}
		function sortCommentByIndex(a,b){
			return parseInt(a.index) - parseInt(b.index);
		};
		this.unselectAllComments();
		return this.comment_items.sort(sortCommentByIndex);
	},
	
	// construct a xcomment object from parent or child comment list
	getXCommentItem:function(cmtid) {
		var xcomment = null;
		var comment = this.comments[cmtid];
		if (comment) {
			if(comment instanceof concord.xcomments.Comments ){
				xcomment = new concord.xcomments.Comments(comment);
			}else if(comment instanceof Object){
				xcomment = new concord.xcomments.Comments();
				xcomment.id = comment.id;
				if(!comment.index)
					comment.index = comment.id;
				xcomment.index = comment.index;
				var xcomment_item = new concord.xcomments.CommentItem;
				var content="";
				for(var i=0;i<comment.content.length;i++){
					if(comment.content[i].c !== null && typeof comment.content[i].c != 'undefined')
						content = content + comment.content[i].c + "\n";
				}
				if (content.replace(/(^\s*)|(\s*$)/g, "").length ==0){
					content = "EMPTY";
				}
				xcomment_item.content = content;
				xcomment_item.name = comment.author;
				xcomment_item.time = new Date(comment.date).getTime();
				xcomment_item.resolved = (comment.done == "1"?true:false);
				
				xcomment_item.org = comment.org? comment.org : null; 
				xcomment_item.uid = comment.uid? comment.uid : null;
				xcomment_item.assigneeOrg = comment.assigneeOrg? comment.assigneeOrg.concat() : null;
				xcomment_item.assigneeId = comment.assigneeId? comment.assigneeId.concat() : null;
				xcomment_item.assignee = comment.assignee? comment.assignee.concat() : null;
				xcomment_item.mentions = (comment.mentions && comment.mentions.length > 0)? comment.mentions.slice(0) : null; 

				xcomment.appendItem(xcomment_item);
			}
		}
		// no matter whether parent comment exsit or not, find from child comment list
		for(var i=0;i<this.comments_children.length;i++) {
			if(this.comments_children[i].pid == cmtid || this.comments_children[i].id == cmtid) {
				if (!xcomment) xcomment = new concord.xcomments.Comments();
				var comment_app_item = this.comments_children[i];
				var app_item = new Object();
				app_item.content="";
				for(var it=0;it<comment_app_item.content.length;it++){
					if(comment_app_item.content[it].c !== null && typeof comment_app_item.content[it].c != 'undefined')
						app_item.content = app_item.content + comment_app_item.content[it].c + "\n";
				}
				app_item.name = comment_app_item.author;
				app_item.time = new Date(comment_app_item.date).getTime();
				app_item.org = comment_app_item.org? comment_app_item.org : null; 
				app_item.uid = comment_app_item.uid? comment_app_item.uid : null;
				app_item.assigneeOrg = comment_app_item.assigneeOrg? comment_app_item.assigneeOrg.concat() : null;
				app_item.assigneeId = comment_app_item.assigneeId? comment_app_item.assigneeId.concat() : null;
				app_item.assignee = comment_app_item.assignee? comment_app_item.assignee.concat() : null;
				app_item.resolved = (comment_app_item.done == "1"?true:false);
				app_item.mentions = (comment_app_item.mentions && comment_app_item.mentions.length > 0)? comment_app_item.mentions.slice(0) : null;
				
				xcomment.appendItem(app_item);
			}
		}
		
		return xcomment;
	},
	
	setCommentSelected:function(comment,selected, noUpdate) {
		if(!comment || !comment.runs)
			return false;
		
		// for resolved comments, force to update when unselect it
		if (comment.done == '1')
			noUpdate = false;
		
		var paras = []; // collect paras to avoid duplication
		for(var n=comment.runs.length-1;n>=0;n--) {
			var run = comment.runs[n];
			if (run.deleted === true) {comment.runs.splice(n,1);continue;}
			run.comment_selected = selected;
			if (!noUpdate)
				run.markDirty();
			var para = run.paragraph;
			var j = 0;
			for (; j<paras.length; j++)
				if (paras[j] == para) break;
			if (j == paras.length)
				paras.push(para);
		}
		var plen = paras.length;
		if (plen > 0) {
			for (var n=plen-1; n>=0; n--) {
				var para = paras[n];
				if (!noUpdate){
					para.markDirty();
					para.parent.update();
				}
			}
			if (!noUpdate)
				pe.lotusEditor.updateManager.update();
		}
		return true;
	},
	
	// the 3rd param noFocus means mouse hover triggerred select comments
	selectComment:function(comment_id, bscroll, noFocus) {
		var isidarray = false;
		var cmtsvc = this;
		if(!pe.lotusEditor.isContentEditing())
			return;
		
		// first check the case to show add comments popup box 
		if (comment_id == null) {
			var selection = pe.lotusEditor.getSelection();
			var selranges = selection.getRanges();

			// some times the current selection is scrolled out
			// scroll to current range if necessary
			if (selranges.length > 0) { 
				if (selranges[0].isCollapsed())
					selection.scrollIntoView(false, false, selranges[0]);
				else {  // make sure the start view is always visible
					var sview = selranges[0].getStartView();
					selection.scrollIntoView(false, false, new writer.core.Range(sview, sview));
				}
			}

			this.laststate.enablechksel = false; this.laststate.sticky = true;
			return;
		}

		var cmtid = null;
		if (dojo.isArray(comment_id)){ // temp code
			isidarray = true;
			cmtid = comment_id[0];
			var bsame = true;
			if (this.select_comment_id.length != comment_id.length)
				bsame = false;
			if (bsame) {
				for (var it=this.select_comment_id.length-1; it >= 0; it--) {
					var id_ = this.select_comment_id[it];
					if (!this.isSelectedComments(id_))
						bsame = false;
				}
			}
			if (bsame) return;
		} else {
			cmtid = comment_id;
			if(this.select_comment_id.length == 1 && this.isSelectedComments(cmtid))
				return;
		}

		var noUpdate = noFocus? true:false;
		for (var it=this.select_comment_id.length-1; it>=0; it--) {
			var cmtid_ = this.select_comment_id[it];
			var cmt = cmtsvc.comments[cmtid_];
			cmt && cmtsvc.setCommentSelected(cmt,false,noUpdate);
			concord.util.events.publish(concord.util.events.comments_deselected,[cmtid_]);
		};

		if (isidarray) {
			for (var it=0; it<comment_id.length; it++) {
				var cmt = cmtsvc.comments[comment_id[it]];
				cmt && cmtsvc.setCommentSelected(cmt,true,noUpdate);
			};
			this.select_comment_id = comment_id.slice(0);
		} else {
			var comment = this.comments[cmtid];
			comment && this.setCommentSelected(comment,true,noUpdate);
			this.select_comment_id = [cmtid];
		}
		
		//this.watch("select_comment_id", function (id, oldval, newval) {
		//    console.log( "o." + id + " changed from " + oldval + " to " + newval );
		//    return newval;
		//});
		//this.select_comment_id.watch("length", this.debug);
		if(bscroll)
			this.scroll2Comment(cmtid);
		
		// after select comment comment, disable selection change check because of view may 
		// change before popup widget shown, we should avoid unexpected reset selected comment list 
		this.laststate.enablechksel = false;
		if (noFocus)
			this.laststate.sticky = false;
		else
			this.laststate.sticky = true;
	},
	unselectAllCommentsAndClearState:function(noUpdate) {
		this.unselectAllComments(noUpdate);
		this.laststate.len = 0; this.laststate.startview = null; this.laststate.endview = null;
		this.laststate.scrbasept = null;this.laststate.enablechksel=false;this.laststate.sticky = false;
	},
	unselectAllComments:function(noUpdate){
		if(this.select_comment_id.length == 0)
			return;

		var cmtsvc = this;
		var selected_ids = this.select_comment_id.slice(0);
		for (var it=selected_ids.length-1; it>=0; it--) {
			cmtsvc.unselectComment(selected_ids[it], noUpdate);
		};
		this.select_comment_id = [];
		this.laststate.sticky = false;
	},
	unselectComment:function(comment_id, noUpdate) {
		//if(!pe.lotusEditor.isContentEditing())
		//	return;
		
		for (var it = this.select_comment_id-1; it >= 0; it--){
			if (this.select_comment_id == comment_id) {
				this.select_comment_id.splice(it,1);
				break;
			}
		}
		var comment = this.comments[comment_id];
		concord.util.events.publish(concord.util.events.comments_deselected,[comment_id]);
		comment && this.setCommentSelected(comment,false, noUpdate);
	},
	insertComment:function(commentId, commentContent){
		if (commentContent.pid)
			this.comments_children.push(commentContent);
		else
			this.comments[commentId] = commentContent;

		// notify sidebar to show widget
		var eventData = [{eventName: concord.util.events.commenting_undoDelete, widgetId: commentId}];
		concord.util.events.publish(concord.util.events.commentingEvents, eventData);
	},
	deleteComment:function(comment_id,coedit) {
		var comment = this.comments[comment_id];
		if(!comment) return;
		
		var rcids = [];
		rcids.push(comment);
		// child comment id list
		for(var i=this.comments_children.length-1;i>=0;i--) {
			var rcmt = this.comments_children[i];
			if (rcmt.pid == comment_id) {
				rcids.push(rcmt);
				this.comments_children.splice(i,1);
			}
		}
		
		var del_msg_list = [];
		if(comment.runs) {
			for(var n=0;n<comment.runs.length;n++) {
				var run = comment.runs[n];
				if (run.deleted === true) continue;
				run.comment_selected = false;
				for (var j = 0; j < rcids.length; j++) {
					var cmtid = rcids[j].id;
					for(var i=0;i<run.clist.length;i++) {
						if(run.clist[i] == cmtid) {
							run.clist.splice(i,1);
							break;
						}
					}
				}
				run.markDirty();
				run.paragraph.markDirty();
				var del_msg = {};
				del_msg.pid = run.paragraph.id;
				del_msg.start = run.start;
				del_msg.end = run.start+run.length;
				del_msg_list.push(del_msg);
			}
		}
		if(!coedit){
			var msgs = [];
			for (var n = 0; n < rcids.length; n++) {
				//1. the update text content json
				var target_cmt = rcids[n];
				for (var i = 0; i < del_msg_list.length; i++) { 
					var del_msg = del_msg_list[i];
					tx_msg = WRITER.MSG.createMsg(WRITER.MSGTYPE.TextComment, [WRITER.MSG.delCommentAct(del_msg.pid,target_cmt.id,del_msg.start,del_msg.end)], WRITER.MSGCATEGORY.Content);
					msgs.push(tx_msg.msg);
				}
				//2. update the relation json
				msg = WRITER.MSG.createMsg(WRITER.MSGTYPE.KeyMessage, [WRITER.MSG.createDeleteArrayAct(target_cmt.id, target_cmt, "comments")], WRITER.MSGCATEGORY.Relation);
				msgs.push(msg.msg);
			}
			pe.scene.session.sendMessage(msgs);
			
			pe.lotusEditor.updateManager.update();
		}
		for (var n = 0; n < rcids.length; n++) {
			var target_cmt = rcids[n];
			if(target_cmt.runs) target_cmt.runs = [];
		}
		delete this.comments[comment_id];
		if(coedit){
			var deleventData = [{eventName: concord.util.events.commenting_delete, widgetId:comment_id}];
			concord.util.events.publish(concord.util.events.commentingEvents, deleventData);
		}
		pe.lotusEditor.focus();
	},
	
	prepareContentTemplate:function(c) {
		var contents = [];
		
		// split content by \n into several paragraphs
		var cs = c.split("\n");
		
		for (var c0 in cs) {
			var content = {};
			
			content.attr_pre = {};
			content.attr_pre.paraId = "w14";
			content.attr_pre.textId = "w14";
			content.c = cs[c0];
	
			content.fmt = new Array();
			var  r0 = {};
			r0.fmt = new Array();
			r0.fmt.push({t: "annotationRef"});
			r0.l = 0;
			r0.rt = "rPr";
			r0.s = 0;
			r0.style = {};
			r0.style.styleId = "CommentReference";
			r0.style.t = "rPr";
			r0.t = "r";
			content.fmt.push(r0);
			
			var r1 = {};
			r1.s = 0;
			r1.rt = "rPr";
			r1.t = "r";
			r1.l = cs[c0].length;
			content.fmt.push(r1);

			content.t = "p";

			contents.push(content);
		}

		return contents;
	},
	
	appendComment:function(pid,item) {
		//send the msg to server
		var msgs = [];
		//1. the update relation msg
		var json_comment = {};
		json_comment.t = "comment";
		json_comment.id = dojox.uuid.generateRandomUuid();
		json_comment.pid = pid;
		json_comment.uid = item.e.uid;
		json_comment.org = item.e.org;
		json_comment.assignee = item.e.assignee? item.e.assignee.concat() : null;
		json_comment.assigneeId = item.e.assigneeId? item.e.assigneeId.concat() : null;
		json_comment.assigneeOrg = item.e.assigneeOrg? item.e.assigneeOrg.concat() : null;
		json_comment.date = new Date(item.e.time).toISOString();
		json_comment.done = "0";
		json_comment.author= item.e.name;
		if (item.e.mentions && item.e.mentions.length > 0)
			  json_comment.mentions = item.e.mentions.slice(0);
		json_comment.content = this.prepareContentTemplate(item.e.content);
		
		this.comments_children.push(dojo.clone(json_comment));
		
		msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.KeyMessage,  [WRITER.MSG.createInsertArrayAct( json_comment.id, json_comment, "comments")] ,WRITER.MSGCATEGORY.Relation );
		msgs.push(msg);
		WRITER.MSG.sendMessage( msgs );
		
		var paras = {};
		var parent_cmt = this.comments[pid];
		var runs = parent_cmt.runs;
		
		// find latest reply comment id
		var rcmtid = pid;
		var ldt = new Date(parent_cmt.date).getTime(); 
		for(var i=0;i<this.comments_children.length;i++) {
			if(this.comments_children[i].pid != pid)
				continue;
			if(this.comments_children[i].id == json_comment.id)
				continue;
			var ndt = new Date(parent_cmt.date).getTime();
			if (ldt <= ndt){
				ldt = ndt;
				rcmtid = this.comments_children[i].id;
			}
		}
	
		for (var i = 0; i < runs.length; i++) {
			if (typeof runs[i].paragraph == 'undefined')
				continue;
			var para = runs[i].paragraph;
			if (para && !paras[para.id])
			  paras[para.id] = para;
			else
			  continue;
			
			var append_msg = WRITER.MSG.createMsg(WRITER.MSGTYPE.TextComment,
					[WRITER.MSG.addCommentAct( para.id, json_comment.id, 0, 0, pid, rcmtid)] ,WRITER.MSGCATEGORY.Content );
			var msgs = [];
			msgs.push(append_msg);
			WRITER.MSG.sendMessage(msgs);
		}
	},
	
	addComment2Paragraph:function(para,c_id,start,end,msgs, runid) {
		if(!this.checkParaType(para))
			return;
//		if(para.parent.modelType == writer.MODELTYPE.CELL) {
//			start = 0;
//			end = para.getLength();
//		}
		var runs = this.addComment2ParaModel(para, c_id, start, end, runid);
		for(var i=0;i<runs.length;i++){
			var start = runs[i].start;
			var end = start + runs[i].length;
			var runid;
			if (writer.util.ModelTools.isImage(runs[i]))
				runid = runs[i].id;
			var tx_msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.TextComment, [WRITER.MSG.addCommentAct( para.id,c_id,start,end,null,null,runid)] ,WRITER.MSGCATEGORY.Content );
			msgs.push(tx_msg);
		}
	},
	addComment2ParaModel:function(para,c_id,start,end,runid){
		if (runid) {
			var therun = para.byId(runid);
			if (therun) {
				therun.comment_selected = true;
				if (!therun.clist)
					therun.clist = [];
				for (var it = 0; it < therun.clist.length; it++) {
					if (therun.clist[it] == c_id) {
						// dupplicated
						return [];
					}
				}
				therun.clist.push(c_id);
				this.insertCmtTextRun(therun);
				therun.markDirty();
				return [therun];
			}
			return [];
		}
		var runs = para.splitRuns(start,end-start);
		if(runs.length() == 0 && para.isEmpty()){
			runs = para.hints;
		}
		var that = this;
		runs.forEach(function(run){
	//		if(run.modelType===writer.MODELTYPE.IMAGE)
	//			return;
			run.comment_selected = true;
			if (!run.clist)
				run.clist = [];
			run.clist.push(c_id);
			that.insertCmtTextRun(run);
		});
		return runs.toArray();
	},
	addComment2Run:function(run,clist){
		run.clist = clist.concat();
		this.insertCmtTextRun(run);
		//send the msg to server
		var msgs = [];
		var para = run.paragraph;
		var start = run.start;
		var end = start + run.length;
		for(var i=0;i<run.clist.length;i++){
			var c_id = run.clist[i];
			var tx_msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.TextComment, [WRITER.MSG.addCommentAct( para.id,c_id,start,end)] ,WRITER.MSGCATEGORY.Content );
			msgs.push(tx_msg);
		}
	//	WRITER.MSG.sendMessage( msgs );
	},
	checkParaType:function(para) {
		//if(para.getLength()==0)
		//	return false;
		if(writer.util.ModelTools.getParent( para,writer.MODELTYPE.TOC))
			return false;
		if(writer.util.ModelTools.isTextBox(para.parent))
			return false;
		if(para.modelType == writer.MODELTYPE.PARAGRAPH)
			return true;
		return false;
	},
	_getAddCommentRange:function(noselection){
		var selection = pe.lotusEditor.getSelection();
		var ranges = selection.getRanges();
		if(ranges.length==1){
			//select the tx, return directly 
			if(this.isTextBoxRange(ranges[0]))
				return ranges;
			if(ranges[0].isCollapsed()) {
				var modelpos=ranges[0].getStartModel();
				var wordrange = writer.util.ModelTools.getCurrentWordRange(modelpos, ranges[0].getRootView());
				if (!wordrange.isCollapsed()) { // start and end have a same obj, must not an empty range
					if (!noselection) {
					selection.selectRanges([wordrange]);
						ranges = selection.getRanges();
					} else {
						ranges = []; ranges.push(wordrange);
					}
				}
				else
					return null;	// The range is empty run.
			}
		}
		return ranges;
	},
	checkAddComment:function(noselection, async) {
		var tools = writer.util.ModelTools;
		var ranges = this._getAddCommentRange(noselection);
		if(!ranges)
			return false;
		var bAdd = false;
		if(ranges.length==1 && ranges[0]){
			var model = ranges[0].getStartModel().obj;
			bAdd = tools.isInNotes(model)|| tools.isInHeaderFooter(model) || 
			       tools.isPageBreak(model) || (tools.isParagraph(model)&&model.ifOnlyContianPageBreak())? false : true;
			if(bAdd){
				var modelEnd = ranges[0].getEndModel().obj;
				if(tools.inTextBox(model) || tools.isInToc(model)){
					bAdd = false;
				}else if(!ranges[0].isCollapsed() && (tools.inTextBox(modelEnd) || tools.isInToc(modelEnd))){
					bAdd = false;
				}
			}
			if(ranges[0].isCollapsed()) {
				bAdd = false;
			}
		} else
			bAdd = true;
		if (bAdd) {
			for (var i = 0; i < ranges.length; i++) {
				var maxParagraphCount = 100;
				var it = new writer.common.RangeIterator( ranges[i], maxParagraphCount );
				var para = null;
				while ( para = it.nextParagraph()) {
					if(this.checkParaType(para)&&para.getLength()>0)
						return true;
				}
			}
		}
		return false;
	},
	addComment:function(comments) {
		var ranges = this._getAddCommentRange();
		if(!ranges)
			return;
		
		var range, it, para;
		//send the msg to server
		var msgs = [];
		//1. the update relation msg
		var json_comment = {};
		json_comment.t = "comment";
		json_comment.id = comments.id;
		json_comment.index = this.getCurrentMaxIndex() + 1;
		json_comment.date = new Date(comments.items[0].e.time).toISOString();
		json_comment.done = "0";
		json_comment.author= comments.items[0].e.name;
		json_comment.uid = comments.items[0].e.uid;
		json_comment.org = comments.items[0].e.org;
		json_comment.assignee = comments.items[0].e.assignee? comments.items[0].e.assignee.concat() : null;
		json_comment.assigneeId = comments.items[0].e.assigneeId? comments.items[0].e.assigneeId.concat() : null;
		json_comment.assigneeOrg = comments.items[0].e.assigneeOrg? comments.items[0].e.assigneeOrg.concat() : null;
		if (comments.items[0].e.mentions && comments.items[0].e.mentions.length > 0)
		  json_comment.mentions = comments.items[0].e.mentions.slice(0);
		
		json_comment.content = this.prepareContentTemplate(comments.items[0].e.content);
		this.comments[json_comment.id] = (dojo.clone(json_comment));
		msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.KeyMessage,  [WRITER.MSG.createInsertArrayAct( comments.id, json_comment, "comments")] ,WRITER.MSGCATEGORY.Relation );
		msgs.push(msg);
		
		for (var i = 0; i < ranges.length; i++) {
			range = ranges[i];
			it = new writer.common.RangeIterator( range );
			para = null;
			var paras = [];
			while ( para = it.nextParagraph()) {
			//	if(this.checkParaType(para))
					paras.push(para);
			}
			if(paras.length == 0)
				continue;
			para = paras[0];
			var start = range.getStartParaPos().index, end = range.getEndParaPos().index;
			if(paras.length == 1)
			{
				if (this.isImageRange(range))
					this.addComment2Paragraph(para,comments.id,start,end,msgs,range.getStartModel().obj.id);
				else
					this.addComment2Paragraph(para,comments.id,start,end,msgs);
			}
			else
			{	
				this.addComment2Paragraph(para,comments.id,start,para.getLength(),msgs);
				// Set other paragraphs
				for(var j = 1; j < paras.length - 1; j++)
				{
					para = paras[j];
					this.addComment2Paragraph(para,comments.id,0, para.getLength(),msgs);
				}
				// Set the last paragraph
				var lastPara = paras[paras.length - 1];
				this.addComment2Paragraph(lastPara, comments.id, 0, end,msgs);
			}
		}
		this.selectComment(comments.id,false,false);

		WRITER.MSG.sendMessage( msgs );
	},
	
	/*
	 * update comment value, for ex, comment.done
	 *  item is the sidebar comment item
	 */
	updateComment:function(cmtid, index, item){
		var isparent = true;
		var comment = this.comments[cmtid];
		if (!comment) {
			isparent = false;
			for(var i=0;i<this.comments_children.length;i++) {
				if(this.comments_children[i].id == cmtid) {
					comment = this.comments_children[i];
					break;
				}
			}
		}
		if (!comment || !item.e) return;
		
		var oldval = comment.done,
		    newval = (item.e.resolved==true? "1":"0");
		
		if (oldval == newval) return;
		
		comment.done = newval;
		
		// also update child comment state
		if (isparent) {
			for(var i=0;i<this.comments_children.length;i++) {
				if(this.comments_children[i].pid == cmtid) {
					this.comments_children[i].done = newval;
				}
			}
		}
		
		if (this.isSelectedComments(cmtid))
			this.setCommentSelected(comment, true);
		
		var updateitem = {name:"done", oldval:oldval, val:newval};

		// update server side value
		var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.TextComment,
				[WRITER.MSG.createUpdateCommentAct(cmtid,index,updateitem)],
				WRITER.MSGCATEGORY.Relation),
		    msgs = [];
		
		msgs.push(msg.msg);

		pe.scene.session.sendMessage(msgs);
		
		if (newval == "1") // not show resolved comment
			this.unselectAllCommentsAndClearState(false);
	},
	
	//
	// for coediting update message only
	//
	updatedComment: function(cmtid, idx, key, val) {
		var comment = this.comments[cmtid];
		if (!comment || key != "done") return;
		
		comment.done = val;
		
		for(var i=0;i<this.comments_children.length;i++) {
			if(this.comments_children[i].pid == cmtid) {
				this.comments_children[i].done = val;
			}
		}
		
		var xcmt = this.getXCommentItem(cmtid);
		
		// notify sidebar
		var cmsg = {};
		cmsg.isCtrl = true;
		cmsg.type = "comments";
		cmsg.action = "update";
		cmsg.id = cmtid;
		cmsg.index = idx;
		cmsg.data = xcmt.getItem(0);
		
		var msgList = [];
		msgList.push(cmsg);
		//pe.scene.session.sendMessage(msgList);
		pe.scene.getSession().commentsProxy.msgReceived(cmsg);
		
		this.setCommentSelected(comment, false);  // update marker
	},
	
	//when run deleted, remove the ref from comment
	removeCommentRef:function(textrun){
		for(var n=0;n<textrun.clist.length;n++) {
			var comment = this.comments[textrun.clist[n]];
			if(comment) {
				for(var i=0;i<comment.runs.length;i++){
				var run = comment.runs[i];
				if(textrun==run) {
					//remove the run from comment ref
					comment.runs.splice(i,1);
				}
			  }
			}
			if(comment.runs.length<=0) {
				var cmsg = {};
				cmsg.isCtrl = true;
				cmsg.type = "comments";
				cmsg.action = "delete";
				cmsg.id = comment.id;

				var msgList = [];
				msgList.push(cmsg);
				//pe.scene.session.sendMessage(msgList);
				pe.scene.getSession().commentsProxy.msgReceived(cmsg);
			}
		}
		textrun.clist = [];
	},
	checkCommentsDelete:function(){
		var msgs = [];
		for (var id in this.comments) {
			var comment = this.comments[id];
			if(!comment.runs)
				continue;
			var runs_bak = comment.runs.concat();
			for(var i=comment.runs.length-1;i>=0;i--) {
				if(comment.runs[i].deleted||comment.runs[i].paragraph.deleted)
					comment.runs.splice(i,1);
			}
			if(comment.runs.length<=0) {
				comment.runs = runs_bak.concat();
				msgs = msgs.concat(this.genDelCommentMsg(comment.id));
			}				
		}
		return msgs;
	},
	genDelCommentMsg:function(cmt_id) {
		var cmts = [], msgs = [];
		cmts.push(this.comments[cmt_id]);
		delete this.comments[cmt_id];
		
		for(var i=0;i<this.comments_children.length;i++) {
			if(this.comments_children[i].pid == cmt_id || this.comments_children[i].id == cmt_id) {
				cmts.push(this.comments_children[i]);
				this.comments_children.splice(i,1);
			}
		}
		
		for (var idx=cmts.length-1; idx>=0; idx--) {
			var comment = cmts[idx];
			var comment_id = comment.id;
			var del_msg_list = [];
			if(comment && comment.runs) {
				for(var n=0;n<comment.runs.length;n++) {
					var run = comment.runs[n];
					run.comment_selected = false;
					if (run.deleted===true || run.paragraph.deleted === true)
						continue;
					for(var i=0;i<run.clist.length;i++) {
						if(run.clist[i] == comment_id) {
							run.clist.splice(i,1);
							break;
						}
					}
					run.markDirty();
					run.paragraph.markDirty();
					var del_msg = {};
					del_msg.pid = run.paragraph.id;
					del_msg.start = run.start;
					del_msg.end = run.start+run.length;
					del_msg_list.push(del_msg);
				}
			}
	
			//1. the update text content json
			for (var i = 0; i < del_msg_list.length; i++) { 
				var del_msg = del_msg_list[i];
				tx_msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.TextComment,  [WRITER.MSG.delCommentAct(del_msg.pid,comment_id,del_msg.start,del_msg.end)] ,WRITER.MSGCATEGORY.Content );
				msgs.push(tx_msg);
			}
			// need remove commentservice added date
			if (comment.date == "1999-06-07T00:00:00.000Z")
				delete comment.date;
			//2. update the relation json
			msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.KeyMessage,  [WRITER.MSG.createDeleteArrayAct( comment_id, comment, "comments")] ,WRITER.MSGCATEGORY.Relation );
			msgs.push(msg);
	
			if(comment.runs) comment.runs = [];
			
			delete this.comments[comment_id];
	
			//3. notify sidebar to hide the comment widget
			var deleventData = [{eventName: concord.util.events.commenting_delete, widgetId:comment_id}];
			concord.util.events.publish(concord.util.events.commentingEvents, deleventData);	
		}

		pe.lotusEditor.updateManager.update();

		pe.lotusEditor.focus();
		return msgs;
	},
	/*
	 * scroll to the selected comment
	 */
	scroll2Comment:function(comment_id) {
		if(!pe.lotusEditor.isContentEditing())
			return;
		var selection = pe.lotusEditor.getSelection();
		var curranges = selection.getRanges();
		var comment = this.comments[comment_id];
		if(comment && comment.runs) {
			if(comment.runs.length > 0) {
				var start = {"obj": comment.runs[0], "index": 0 };
				var end = {"obj": comment.runs[comment.runs.length-1], "index": 0 };
				var range = null;
				if (!writer.util.ModelTools.isImage(start.obj)) {
					range = new writer.core.Range( start, start);
				} else {
					var views = start.obj.getViews(curranges[0].getRootView().getOwnerId());
					start.obj = views.getFirst();
					range = new writer.core.Range( start, start);					
				}
				// first check if target view need scroll
				var bscrolled = selection.scrollIntoView(false, false, range, true);
				// then check if current selection need scroll back
				if (!bscrolled && curranges.length > 0)
					bscrolled = selection.scrollIntoView(false, false, curranges[0], false, true);
				if (bscrolled || typeof bscrolled == 'undefined')
					selection.selectRanges([range]);
			}
		}			
	},
	getCList:function(model) {
		var clist = [];
		if(model.clist&&model.clist.length>0) {
			for (var i = model.clist.length - 1; i >= 0; i--) {
				var commentsId = model.clist[i];
				if (typeof this.comments[commentsId] == 'undefined') continue;
				clist.push(commentsId); // only for parent comments
			}
		}
		return clist;
	},
	// to set popup comment widget position
	_getPosition:function(pos) {
		var selection = pe.lotusEditor.getSelection();
		var selranges = selection.getRanges();
		
		if (pos.eventName == "checkforshowcomments") {
			pos.filled = true;
			pos.ret = true;
			if (selranges.length > 0) {
				var model = selranges[0].getStartModel().obj;
				if (writer.util.ModelTools.isInNotes(model)|| writer.util.ModelTools.isInHeaderFooter(model))
					pos.ret = false;
			}
			return;
		}
		
		var doc_height = document.body.clientHeight;
		var view_height = dojo.byId('editorFrame').offsetHeight;
		var headerheight = doc_height-view_height;
		
		var firstvw = null;
		if (this.select_comment_id.length == 0) {
			// assume the ranges is valid and checked by checkAddComment() 
			var ranges = this._getAddCommentRange(true); // don't change selection
			if (ranges && ranges.length >= 1) {
				if (selranges[0].isCollapsed()) {
					var cursorinfo = pe.lotusEditor.getSelection().getInputPos().getCursorInfo();
					var curpos = pe.lotusEditor._shell.clientToLogical(cursorinfo.position);
					pos.filled = true;
					pos.x = curpos.x;
					pos.y = curpos.y;
					pos.w = 10;
					pos.h = cursorinfo.length+3;
				} else { // for simplicity, just check the first view
					var range = ranges[0];
					var view = range.getStartView();
					if (view) {
						if (!firstvw) firstvw = view.obj;
					    var spos = selection._getViewPos(view), // logical pos
					        epos = selection._getViewPos(range.getEndView());
					    pos.filled = true;
					    pos.x = spos.x,
					    pos.y = spos.y,
					    pos.w = epos.x-spos.x;  // also overwrite collapsed case
					    if (view.obj.getHeight)
					    	pos.h = view.obj.getHeight();
					    else {
					    	pos.h = 17;					    	
					    	if (view.obj.domNode) {
					    		var domrect = dojo.position(view.obj.domNode);
					    		pos.h = domrect.h;
					    	}
					    }
					    if (this.isImageRange(range)) {
					    	if (writer.util.ViewTools.isAnchor(view.obj)) {
					    		pos.w = view.obj.getWholeWidth();
					    		pos.h = view.obj.getWholeHeight();
					    	} else
					    		pos.y = pos.y-pos.h+spos.h;         // top left
					    }
					    pos.h += 2;
					}
				}
			}
			if (!pos.filled) { // try the cursor position
				var cursor = pe.lotusEditor.getSelection().getCursor();
				pos.filled = true;
				pos.x = cursor.getX();
				pos.y = cursor.getY();
				pos.w = 10;
				pos.h = 17;
			}
		} else {
			// @todo(zhangjf), use the right comment for pos from the array
			var cmtid_ = this.select_comment_id[0];
			var comment = this.comments[cmtid_];
			
			if (!comment || !comment.runs || comment.runs.length==0){
				// for dangling comments
				var pt = pe.lotusEditor._shell.screenToClient({x:0, y:10});
				    pt = pe.lotusEditor._shell.clientToLogical(pt);
				pos.x = 0;
				pos.y = pt.y;
				pos.w = 10;
				pos.h = 10;
				pos.filled = true;
				//return;
			} else {
				//var firstview = null;
				pos.filled = true;
				var runbt = 0;
				for(var n=0;n<comment.runs.length;n++) {
					var run = comment.runs[n];
					if (run.deleted === true) continue; 
					var allViews = run.getAllViews();
					for(var ownerId in allViews){
						var viewers = allViews[ownerId];
						var view = viewers.getFirst();
						//if (view && !firstview) firstview = view;
						while (view) {
						    if (!view.getParent()) {view = viewers.next(view); continue;}
						    var l = view.getLeft(),
						    t = view.getTop(),
						    w = view.getWidth(),
						    h = view.getHeight(),
						    r = l+w,
						    b = t+h;

							var line = writer.util.ViewTools.getLine(view);
							if(BidiUtils.isBidiOn() && line && view._logicalIndexToOffset) {
								!line.bidiMap && line.initBidiMap();
								l = view.getParent().getContentLeft() + view._logicalIndexToOffset(0, line);
							}
							var scale = pe.lotusEditor.getScale();
							if (writer.util.ViewTools.isImage(view) && writer.util.ViewTools.isAnchor(view)) {
					    		w = view.getWholeWidth()*scale;
					    		h = view.getWholeHeight()*scale;
					    		r = l+w;
					    		b = t+h;
							} else if (scale != 1 && writer.util.ViewTools.isImage(view)){
								w = w*scale;  // recale the width and height in zoom mode
								h = h*scale;
								r = l+w;
								b = t+h;
							}
							if (b <= runbt || !pos.x) {  // the most top-left one by checking bottom
								runbt = b;
								firstvw = view;
								if (!pos.x) {
									pos.x=l;pos.w=r-l;pos.y=t;pos.h =b-t;
								} else {
									var hdiff = pos.y - t;
									/*if (t < pos.y)*/ pos.y = t; pos.h += hdiff;
									if (l < pos.x) {
										pos.x = l;
										if ((b >= (pos.y+pos.h)) && (b < (pos.y+pos.h+200)) &&    /* only when horiztol position overlapped*/ 
												((r>=pos.x-80 && r<=pos.x+pos.w+80) || (l>=pos.x-80 && l<=pos.x+pos.w+80) || (l>=pos.x-80&&r<=pos.x+pos.w+80))) 
											pos.h = b - pos.y;
										if (r > (pos.x+pos.w)) pos.w = r - pos.x;
									}
								}
							} else {
								if ((b >= (pos.y+pos.h)) && (b < (pos.y+pos.h+200)) &&    /* only when horiztol position overlapped*/ 
										((r>=pos.x-80 && r<=pos.x+pos.w+80) || (l>=pos.x-80 && l<=pos.x+pos.w+80) || (l>=pos.x-80&&r<=pos.x+pos.w+80))) 
									pos.h = b - pos.y;
								if (r > (pos.x+pos.w)) pos.w = r - pos.x;
							}
							view = viewers.next(view);
						}
					}
				}
			}
		}
		var rpt = pe.lotusEditor._shell.logicalToScreen(pos);
		pos.x = rpt.x; pos.y=rpt.y;
		pos.y += headerheight;
		
		// check image view for some special handle
		if (pos.y < 0 && firstvw && writer.util.ViewTools.isImage(firstvw)) {
			var first_vw_h = firstvw.getHeight();
			if (writer.util.ViewTools.isAnchor(firstvw))
				first_vw_h = firstvw.getWholeHeight();
			var img_bottom = pos.y + first_vw_h;
			if (img_bottom > headerheight){ // when the image bottom is visible
				pos.y = headerheight + 1;   // temporarily adjust height
				pos.h = img_bottom - headerheight;
			}
		} else {
			// check visiblity
			var rect_b = pos.y + pos.h;
			if (rect_b < (headerheight+1) || pos.y > (doc_height-5)) {
				pos.x = -200; pos.y = -200;   // make the comment box invisible
			} else if (pos.y < 0){
				pos.y = headerheight + 1;
				pos.h = rect_b - headerheight; 
			}
		}
		
		//console.log("--("+pos.x+")("+pos.y+")("+pos.w+")("+pos.h+")--");
		
		// finally remember current selection and base point for selection change or 
		// scroll/resize event check
		this.laststate.enablechksel = true;
		var lefttop = {x:0, y:0};
		lefttop = pe.lotusEditor._shell.logicalToScreen(lefttop);
		this.laststate.scrbasept = {x:lefttop.x, y:lefttop.y};
		this.laststate.len = 0; this.laststate.startview = null; this.laststate.endview = null;
		var cur_ranges = selection.getRanges();
		// only remember current first range for selection change check
		var rlen = cur_ranges.length;
		if (rlen>0) {
			this.laststate.len = rlen;
			this.laststate.startview = cur_ranges[0].getStartView();
			this.laststate.endview = cur_ranges[0].getEndView();
		}

		return;
	},
	isSelectedComments : function(cmtid) {
		var ret = false;
		for (var it = 0; it < this.select_comment_id.length; it++) {
			if (cmtid == this.select_comment_id[it]) {
				ret = true; break;
			}
		}
		return ret;
	},
	// check if the clist same as selected one
	// notice, cl1 may also contain the response comment ids
	isSameClistAsSelected : function(cl1) {
		var bsame = true;
		if (!cl1) return false;
		var cmt_count = 0;
		for (var it=cl1.length-1; it>=0; it--) {
			var cmt = this.comments[cl1[it]];
			if (!cmt) continue;
			cmt_count++;
			if (!this.isSelectedComments(cl1[it]))
				return false;
		}
		if (cmt_count != this.select_comment_id.length)
			bsame = false;
		return bsame;
	},	
	_handlePopupCommentsBoxMouseOver:function() {
		if (this.closeHover_t && !this.laststate.sticky)
			this.closeHover_t = clearTimeout(this.closeHover_t);
	},
	qread_close_timeout : null,
	_handlePopupCommentsBoxMouseOut: function() {
		if (this.select_comment_id.length == 0) {
			// adding comment, do nothing
			return; 
		} else if (!this.laststate.sticky){
			var cmtsvr = this;
			var mvout_handler = function() {
				if (cmtsvr.qread_close_timeout)
					cmtsvr.qread_close_timeout = clearTimeout(cmtsvr.qread_close_timeout);
				// popup coment dialog, mouse out still to close it
				cmtsvr.unselectAllComments();
				cmtsvr.laststate.len = 0; cmtsvr.laststate.startview = null; cmtsvr.laststate.endview = null;cmtsvr.laststate.scrbasept = null;				
			};
			// when mutiple popups, close it by timer, so it have a chance switch by click another box
			if (this.select_comment_id.length > 1)
				this.qread_close_timeout = setTimeout(mvout_handler, 300);
			else
				mvout_handler();
		}
	},
	_handlePopupCommentsBoxClick:function() {
		if (this.select_comment_id.length > 0) {
			this.laststate.sticky = true;
			if (this.qread_close_timeout)
				this.qread_close_timeout = clearTimeout(this.qread_close_timeout);
		}
		//else
		// ;  add comment box is always sticky
	},
	_handleaddCommentPopup:function(isOpen) {
		if (isOpen===false){  // add comment dialog closed
			this.laststate.sticky = false;
			//this.laststate.watch("sticky", function (id, oldval, newval) {
			//    console.log( "o." + id + " changed from " + oldval + " to " + newval );
			//    return newval;
			//});
		}
	},

	getCSSString:function(cl, isimg) {
		var ret = "";
		if (!cl) return ret;
		var cmtLen = cl.length;
		if(cmtLen > 0)
		{
    		var unresolved_cmt = 0, resolved_cmt = 0;
    		for (var it=0; it<cmtLen; it++){
    			var isResolved = 0;
    			var it_cmtid = cl[it];
    			var it_cmt = this.comments[it_cmtid];
    			
    			if (it_cmt&&it_cmt.done=='1') {
    				// for resolved comment, check if it is selected
    				if (this.isSelectedComments(it_cmtid))
    					isResolved = 2;
    			} else {
	    			if (!it_cmt) { // try to get parent comment state
	    				for(var i=0;i<this.comments_children.length;i++) {
	    					if (this.comments_children[i].id == it_cmtid) {
	    						it_cmt = this.comments[this.comments_children[i].pid];
	    						break;
	    					}
	    				}
	    			}
	    			if (it_cmt && it_cmt.done!="1")
	    				isResolved = 1;
    			}
    			
    			if (isResolved == 2) resolved_cmt++;
    			else if (isResolved) unresolved_cmt++;
    		}

    		if (!isimg){
	    		if(unresolved_cmt == 1)
	    			ret += " comments";
	    		else if(unresolved_cmt == 2)
	    			ret += " comments2";
	   			else if (unresolved_cmt>2)
	    			ret += " commentsMore";
	   			else if (resolved_cmt)
	    			ret += " comments_resolved";
    		} else {
    			if (unresolved_cmt >= 1)
    				ret += " comments_img";
    			else if (resolved_cmt)
    				ret += " comments_resolvedimg";
    		}
		}
		return ret;
	}
    };
    clz.constructor();
    return clz;
// class definition ends
};

return {
	    getInstance: function () {
	        if (!instantiated) {
	            instantiated = init();
	        }
	        return instantiated;
	    }
	};
	
})();