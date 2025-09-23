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

dojo.provide("concord.text.ProcMsg");
dojo.require("concord.text.MsgUtil");
//dojo.require("concord.text.SyncMsg");
dojo.require("concord.text.StyleMsg");
dojo.require("concord.text.OTService");
dojo.require("concord.util.acf");
dojo.require("concord.text.tools");
dojo.require("dojo.i18n");
dojo.require("concord.text.Log");
dojo.require("concord.text.ProcCursor");
dojo.require("concord.text.UndoCursor");

dojo.requireLocalization("concord.scenes","Scene");

dojo.declare("concord.text.ProcMsg", null, {
	
	receiveMessage : function(msg)
	{
		LOG.logMessage(msg, false);
		
		// 1.Transform message in sendoutList
		this.transformMessage(msg);	
		// 2 apply message to editor
		this.processMessage(msg);
		// 3. Transform Undo/Redo message
		window['pe'].scene.CKEditor.transformUndo(msg);
		
//		// When the message's serve sequence less than the current sequence, 
//		// It means it has been processed, so just return it.
//		if (msg&&this._serSeq && msg.server_seq < this._serSeq)
//		    return;
//		    
//		this._msgList = this._msgList || [];
//        //		if (dojo.indexOf(this._msgList, msg) < 0) {
//        if (msg) {
//			this._msgList.push(msg);	
//		
//            //			if (pe.startRecord) {
//            //				pe.recordProcess = pe.recordProcess || [];
//            //				pe.recordProcess.push(dojo.clone(msg));
//            //}
//        }
//        if (TEXTMSG._timer || TEXTMSG.lockCut) {
//            setTimeout(dojo.hitch(this, this.receiveMessage, null), 0);
//		}
//		else
//		{
//			for(var i = 0; i < this._msgList.length; i++)
//			{
//				msg = this._msgList[i];
//				// 1.Transform message in sendoutList
//				this.transformMessage(msg);	
//				// 2 apply message to editor
//				this.processMessage(msg);
//				
//				// 3. Transform Undo/Redo message
//				window['pe'].scene.CKEditor.transformUndo(msg);
//				
//				this._serSeq = msg.server_seq;
//			}
//			this._msgList = [];
//		}
	},
	_checkSuspiciousStyles : function(styles)
	{
		if(!styles)
			return false;
		
		var acf = concord.util.acf;
		for( var name in styles )
		{
			if(acf.suspiciousAttribute(name, styles[name]))
			{
				LOG.log("malicious Attribute fragment detected: " + name + " :" + styles[name]);
				return true;
			}	
		}
		
		return false;
	},
	
	processMessage : function(msg,dom,docKey,fromUndoRedo,stripACF)
	{	
		var tstart = new Date();

		var editor = window['pe'].scene.getEditor();
		
		// Use the flag to check if content size has been changed.
		window['pe'].scene.editorContentChanged = true;
		
		var targetDoc = dom || editor.document.$;
		
		var actType = MSGUTIL.actType;
		// TODO remove msg.updates
		var acts = msg.as || msg.updates; //Act command list
		
		if(!acts)
			return;
		
		var acf = concord.util.acf;
		var sel = editor.getSelection();
		var range = null;
		if( !sel) {
			range = editor._.selectionPreviousRange;
		}else{
			var ranges = sel.getRanges();
			if (ranges.length ==1){
				range = ranges[0];
			}
		}
		var procCursor;
		if( fromUndoRedo ){
			procCursor = 
			function( msg ){
				switch ( msg.type )
				{
					case MSGUTIL.msgType.Split:
					case MSGUTIL.msgType.Join:
					case MSGUTIL.msgType.ReplaceNode:
					case MSGUTIL.msgType.Element:
					case MSGUTIL.msgType.Table:
					case MSGUTIL.msgType.Text:
					case MSGUTIL.msgType.InlineStyle:
					case MSGUTIL.msgType.Attribute:
					case MSGUTIL.msgType.List:
						return new concord.text.UndoCursor(editor,targetDoc,msg);
					default:
						return null;
				}
			}( msg );
		}
		if( !procCursor )
		{
			procCursor = concord.util.editor.run4Text(function(foo) {
			var range = foo.range;
			// we need always store cursor for list message in Safari
			var force = ( CKEDITOR.env.webkit && foo.msg.type == MSGUTIL.msgType.List ) || foo.msg.type == MSGUTIL.msgType.UpdateListValue;
			var defaultMsg = false;
			switch( foo.msg.type  )
			{
			case MSGUTIL.msgType.Text:
			case MSGUTIL.msgType.Task:
			case MSGUTIL.msgType.InlineStyle:
			case MSGUTIL.msgType.Attribute:
			case MSGUTIL.msgType.List:
				defaultMsg = true;
				break;
			};
			if( range && !force && !defaultMsg)
			{
				var block = MSGUTIL.getBlock(range.getCommonAncestor(true));
				if (block){
					var sId = block.getId();
					var nodes = OTSERVICE.getTargetNodes(msg);	
					for (var i=0; i<nodes.length; i++)
					{
						if (nodes[i] == sId)
					          break;
					}
					if (i == nodes.length)//unrelated, no impact to local cursor
					{
						return null;		
					}
				}
			}
				
			if( !sel){
//				//in IE, when float panel appeared, can not get the selection
//				// eidtor.focus will hide the float panel( background,heading... cmd )
				editor.focus();
				sel = editor.getSelection();
				if (!sel){
					return null;
				}
			}
			
			switch ( foo.msg.type )
			{
				case MSGUTIL.msgType.Split:
						return new concord.text.ProcSplitCursor(editor,targetDoc,msg);
				case MSGUTIL.msgType.Join:
						return new concord.text.ProcJoinCursor(editor,targetDoc,msg);
				case MSGUTIL.msgType.ReplaceNode:
					return new concord.text.ReplaceNodeCursor(editor,targetDoc,msg);
				case MSGUTIL.msgType.Element:
				case MSGUTIL.msgType.Table:
						return new concord.text.DeleteCursor(editor,targetDoc,msg);
//				case MSGUTIL.msgType.ReplaceNode:
				case MSGUTIL.msgType.Text:
				case MSGUTIL.msgType.Task:
				case MSGUTIL.msgType.InlineStyle:
				case MSGUTIL.msgType.Attribute:
				case MSGUTIL.msgType.List:
						return new concord.text.ProcCursor(editor,targetDoc,msg);
				default:
						return null;
			}
		}, {msg:msg, editor:editor,range:range});
		}
		
		try{
			if( procCursor && !concord.text.tools.ignoreRestoreCursor)
				procCursor.storeCursor( msg );
		}catch(e){
			LOG.log('store Cursor fail '+ e);
		}
		
		//defect 9336
		if(msg.type == MSGUTIL.msgType.Table || msg.type == MSGUTIL.msgType.Element){
			concord.text.tools.moveRangeToTableBefore(range,msg);
		}			
		var fristDeleteNode;
		var hasDeleteElement = false;
		for( var i=0; i < acts.length; i++ )
		{
			var act = acts[i];	
			switch(act.t)
			{
				case actType.insertText:
				{										
					if(!fromUndoRedo && !stripACF)
					{	
						for(var j = 0; j < act.cnt.length; j++)
						{
							var data = act.cnt[j];	
							var str = data.t || data.e || '';
							if(acf.suspiciousHtml(str))
							{
								LOG.log("malicious html fragment detected: " + str);
								return;
							}
						}	
					}
					
					this.insertText(targetDoc, act, fristDeleteNode, fromUndoRedo);
					if(concord.util.browser.isMobile() && isMessageProcessed(targetDoc,act,range)){
						concord.util.mobileUtil.isProcessedMessage = true;
					}
					break;
				}
				case actType.deleteText:
				{																																																														
					if(concord.util.browser.isMobile() && isMessageProcessed(targetDoc,act,range)){
						concord.util.mobileUtil.isProcessedMessage = true;
					}
					var deleteNode = this.deleteText(targetDoc,act);
					fristDeleteNode = fristDeleteNode || deleteNode;
					break;
				}
				case actType.insertElement:
				{
					if (!fromUndoRedo && !stripACF && acf.suspiciousHtml(act.s))
					{
						LOG.log("malicious html fragment detected: " + act.s);
						return;
					}
					
					// Assume Insert/delete element is block.
					this._postInsertElement(
						this.insertElement(targetDoc,act,fromUndoRedo), docKey);
					
					break;
				}	
				case actType.deleteElement:
				{
					// TODO delete element in table should remain a "&nbsp;" character  
					
					// TODO remove all elements should keep the first's paragraph as placehold
					//console.info("before delete element");
					this.deleteElement(targetDoc,act);
					hasDeleteElement = true;
					// For replace block 
					// fristDeleteNode = fristDeleteNode || deleteNode;
					//console.info("after delete Element");
					break;
				}
				case actType.insertStyleElement:
				{
					console.log('insert Style Element');
					this.insertStyleElement(targetDoc,act,fromUndoRedo);					
					break;
				}
				case actType.deleteStyleElement:
				{
					console.log('delete Style Element');
					this.deleteStyleElement(targetDoc,act);
					break;
				}				
				case actType.setStyle:
				case actType.removeStyle:
				{
					if(!fromUndoRedo &&!stripACF && act.t == actType.setStyle)
					{
						if(act.e && acf.suspiciousHtmlRegex('<' + act.e + '>'))
						{
							LOG.log("malicious html element detected: " + act.e);
							return;
						}
						else if( this._checkSuspiciousStyles(act.s) )
						{
							return;	
						}	
					}	
					
					//console.info("before style action");	
					this.exeStyle(targetDoc, act );					
					//console.info("after sytle action");
					break;				
				}
				case actType.setAttributes:
				case actType.removeAttributes:
				{
					if(!fromUndoRedo &&!stripACF&& act.t == actType.setAttributes)
					{
						if(this._checkSuspiciousStyles(act.s) || this._checkSuspiciousStyles(act.a) )
							return;
					}
					
					//console.info("before attribute action");					
					this.execBlockStyle(targetDoc,act);				
					this._postAttrChange(docKey,act);
					//console.info("after style action");
					break;
				}
				case actType.insertTask:
				case actType.deleteTask:
				case actType.updateTask:
				case actType.updateFragment:
				{
					editor.getTaskHdl().processMessage(act.t, act);
					break;
				}
				case actType.ResetContentAction:
				{
					// ACF
					if (!stripACF && acf.suspiciousHtml(act.data))
					{
						LOG.log("malicious html fragment detected: " + act.data);
						return;
					}

					editor.setData(act.data);
					
					// Clear undo/redo stack, all content has been removed
					editor.fire("resetUndo");
					
					return;
				}
				case actType.UpdateListValue:
				{
					if( window.g_concordInDebugMode )
						console.info("before updateListValue ");
					this.updateListValue(targetDoc,act);
					// For replace block 
					// fristDeleteNode = fristDeleteNode || deleteNode;
					if( window.g_concordInDebugMode )
						console.info("after updateListValue ");
					break;
				}
				case actType.ChangeListType:
				{
					if( window.g_concordInDebugMode )
						console.info("before change list type ");
					this.changeListType(targetDoc,act);
					// For replace block 
					// fristDeleteNode = fristDeleteNode || deleteNode;
					if( window.g_concordInDebugMode )
						console.info("after change list type ");
					break;
				}
				case actType.updateHeaderFooter:
				{
					pe.scene.refreshHeaderFooter(act.tid);
					break;
				}
			}
		}
		var cursorchanged =false;
		//restore user cursor
		if( procCursor && !concord.text.tools.ignoreRestoreCursor){
			try{
				procCursor.restoreCursor();
			}catch(e){
				LOG.log('restore Cursor fail '+ e);
			}
			
			cursorchanged = true;
		}
		
		//check if the cursor in the body  
		var selection = editor.getSelection();
		concord.util.editor.run4Text(function(foo) {
			try{
				if(foo.selection)
				{
					var sel = foo.selection;
					var ranges = sel.getRanges();
					var doc = new CKEDITOR.dom.document(foo.targetDoc);
					var body = doc.getBody();
					if( ranges.length == 1 && ranges[0].collapsed && ranges[0].startContainer.equals( body ) )
					{ //wrong pos, seleted body
						var index = ranges[0].startOffset;
						if( index >= body.getChildCount()) index = body.getChildCount()-1;
						if( index >= 0 )
						{
							var block = body.getChild(index);
							if( block )
							{
								ranges[0].moveToElementEditablePosition(block);
								sel.selectRanges(ranges);
								cursorchanged = true;
							}
						}
					}
				}
			}
			catch(e)
			{
				LOG.log("Adjust cursor fail "+e);
			}
		}, 
	   	{selection:selection,targetDoc:targetDoc});
		
		//notify tab plugin for content changing caused by undo/redo or others
		//notify concordimage plugin for content been changed
		editor.fire("arrangeTab", msg);
		
		if(!window.processmsgTimer)
			window.processmsgTimer = setTimeout(function(){
				window.processmsgTimer = null;
				var sel = editor.getSelection();
				editor.fire("processMessage", { selection : sel });	// Similiar with selectchange event to to change status.
				
				if(hasDeleteElement)
					editor.fire('contentDelete');
			}, 0);
		
		if(msg.type == MSGUTIL.msgType.Table){
			editor.fire("markTableSelection", editor);
			editor.fire("processTable",{"id":msg.data});
		}
		editor.fire("tableResizeCancel");	
		editor.fire("processImage");
		if (cursorchanged && !CKEDITOR.env.ie){
			//fire selectionchange and selectionrange change for ff, safari
			editor.selectionChange();

		}
		if (msg.cb != null && msg.cb != "")
		{
			eval(msg.cb);
		}
		
		function isMessageProcessed(doc,act,range){
			var result = false;
			if(!range || !act)
				return result;
			
			var tar = doc.getElementById(act.tid);
			if (!tar){
				return result;
			}
			var block = MSGUTIL.getBlock(range.startContainer);
			if(block && act.tid == block.getId())
				result = true;
			
			return result;
		}
		
		var tend = new Date();
		console.log("text.procMsg.processMessage: " + (tend.getTime() - tstart.getTime()));
	},
	
	// it is to be overridden
	transform: function(msg, localList)
	{
		return null;
	},
	
	transformMessage : function(msg)
	{
		var sess = window['pe'].scene.session;
		// if message in waitingList isn't conflict with others, then the message will be OT on server, 
		// so we should clone the waitingList here, or else the message will be OT twice.
		var localList = sess.sendoutList.concat(sess.waitingList);
		//var localList = sess.sendoutList2.concat(sess.waitingList2);
		if(localList.length > 0)
		{
			var conflictMsg = this.transform(msg, localList);
			if (conflictMsg == null)
				conflictMsg = OTSERVICE.transform(msg,localList);
			if (conflictMsg != null)//conflict
				this.handleConflict(conflictMsg);				
		}
	},
	
	handleConflict : function(msg)
	{
		var sess = window['pe'].scene.session;
		//1 show error message
		var nls = dojo.i18n.getLocalization("concord.scenes","Scene");
		pe.scene.showWarningMessage(nls.conflictMsg,5000);
		
		//remove message on sendloutlist
		var index = -1;
		for (var i=0; i<sess.sendoutList.length; i++)
		{
			if (sess.sendoutList[i].client_seq == msg.client_seq)
			{
				index = i;
				break;
			}
		}
		if (index != -1)
			sess.sendoutList.splice( index, sess.sendoutList.length - index );

		//remove message on waiting list
		sess.waitingList = [];
		
		//send resolve conflict message to server
		var newmsg =sess.createMessage();
		newmsg.resolve_conflict= "true";
		sess.sendMessage([newmsg]);	
		
		//for presentation mostly have client's handle conflict scenario
		//which does not need to reload from server
		//the throw exception is for document temporarily until finding better solution
		//to document's complex scenarios (bullet numbering manipulation - defect 6447) in handling conflict
//		if(window.g_presentationMode!=true)
//		{
//			throw "reload for local conflict";
//		}
		
		//2 roll back local change
		var isReload=window['pe'].scene.CKEditor.rollback(msg);
		if(isReload){
			throw "reload for local conflict";
		}
	
	},
	
	getLocalDocuments: function() {
		return null;
	},
	
	/**
	 * particularly for presentation
	 */
	_postInsertElement: function(node, docKey){
		return;
	},
	
	_postAttrChange: function(docKey) {
		return;
	},
	
	// Return all node list which will be removed.
	// The firstDeleteNode.node firstDeleteNode.offset like the range struct
	// If firstDeleteNode.node is a text node, the firstDeleteNode.offset is the offset
	// If firstDeleteNode.node is a element, the firstDeleteNode.offset is its child offset
	_deleteText : function(target, nodeList, firstDeleteNode)
	{
		nodeList = nodeList || [];
		firstDeleteNode = firstDeleteNode || {};
		
		var node = target.node;
		if(node.type == CKEDITOR.NODE_ELEMENT)
		{					
			var childCnt = node.getChildCount();
			if(childCnt == 0)
			{
				nodeList.push(node);				
				// Delete one element, such as img 				
				if(!firstDeleteNode.container)
				{
					firstDeleteNode.container = node.getParent();
					firstDeleteNode.offset = node.getIndex();
				}
			}
			
			for (var i=0; i < childCnt; i++)
			{
				var child = node.getChild(i);
				var len = MSGUTIL.getPureText(child).length;//LB_COM.getText(child).length;
				
				if(len >= target.index)
				{				
					if( len >= target.index + target.length )
					{	
						// Not the first node.
//						if( target.index == 0 && len == target.length && firstDeleteNode.container)
						if( target.index == 0 && len == target.length )
							nodeList.push(child);
						else
							this._deleteText({"node":child, "index":target.index, "length":target.length}, nodeList, firstDeleteNode);
						return firstDeleteNode;
					}
					else
					{		
						// the element <span> <br> <br></span> also need to delete. 
						if ( len == 0 || (target.length > len && target.index == 0)) {
							nodeList.push(child);
						}
						else {
							len -= target.index;
							if (len > 0) {
								// Other element should be delete
								//							if(firstDeleteNode.container)
								//								nodeList.push(child);
								//							else
								this._deleteText({
									"node": child,
									"index": target.index,
									"length": len
								}, nodeList, firstDeleteNode);
							}
							
						}
						target.length -= len;
						target.index = 0;
					}				
				}
				else			
					target.index -= len;
			}
		}
		else if(node.type == CKEDITOR.NODE_TEXT)
		{
			var str = node.getText();
			for (var i = 0; i<target.index; i++)
			{
				if (str[i] == '\u200B')
				{
					++target.index;
				}
			}
			for (var i = target.index; i<target.length; i++)
			{
				if (str[i]== '\u200B')
				{
					++target.length;
				}
			}
			node.$.deleteData(target.index, target.length);
			CKEDITOR.tools.replaceLBlank && CKEDITOR.tools.replaceLBlank(node);
			CKEDITOR.tools.replaceDoubleBlank && CKEDITOR.tools.replaceDoubleBlank(node);
			// Delete text 				
			if(!firstDeleteNode.container)
			{
				firstDeleteNode.container = node;
				firstDeleteNode.offset = target.index;
			}
		}
		
		return firstDeleteNode;
	},
	
	// Insert position
	// -1 : Break the insert position, and then insert content  
	// 0  : Follow the insert position's style
	// >0 : Insert to the first delete content's position  
	
	_breakTextNode : function(textNode, offset, element)
	{		
		var len = textNode.getLength();
		if(offset >= len)
			element.insertAfter(textNode);
		else if(offset == 0)
			element.insertBefore(textNode);
		else
		{
			var clone = textNode.clone(true);
			textNode.$.deleteData(offset, len - offset);
			clone.$.deleteData(0, offset);
			
			element.insertAfter(textNode);
			clone.insertAfter(element);
		}
	},
		
	insertText : function (doc,act,deleteNodePos,fromUndoRedo)
	{
		if(!act.cnt || act.cnt.length <= 0)
			return;
		var tar = doc.getElementById(act.tid);
		if (tar == null){
			act.len=0;
			return;	
		}
					
		var target = new CKEDITOR.dom.element(tar);
		
		var insertContext;		
		var insertBefore = false;
		var insertPos = act.cnt[0].ip;		
		if(insertPos > 0)
		{			 	
			// Insert position is greater than 0
			// We think we have already delete some content.
			 insertContext = deleteNodePos || MSGUTIL.getInsertPos(target,act.idx, act.frag);
		}
		else
		{				
			insertContext = MSGUTIL.getInsertPos(target,act.idx, act.frag);
			insertBefore = insertContext.insertBefore;
			
			// break style to revise insert context.			
			if(insertPos == -1)
			{		
				var nOffset = insertContext.offset;
				var container = insertContext.container;				
				var blockElement = MSGUTIL.getBlock(container);
				
				// The insert position is the latest child 			
				if (act.idx == MSGUTIL.getNodeLength(blockElement))
				{
					var last = blockElement.getLast();
					// Ignore empty text.
					while ( last && last.type == CKEDITOR.NODE_TEXT && last.getLength() == 0 )
					{
						last = last.getPrevious();
					}
					if(last && MSGUTIL.isNullBr(last))
					{						
						last = last.getPrevious();						
					}
					
					if(last && last.type == CKEDITOR.NODE_TEXT)
					{
						insertContext.container = last;
						insertContext.offset = last.getLength();
					}
					else
					{
						insertContext.container = blockElement;
						insertContext.offset = last ? last.getIndex() : 0;
					}
				}
				else if( ( container.type == CKEDITOR.NODE_TEXT && (nOffset != MSGUTIL.getNodeLength(container) || nOffset != container.getLength() ) ) ||
					( container.type == CKEDITOR.NODE_ELEMENT && nOffset != container.getChildCount()) ) 
				{
					var breakElement = (container.type == CKEDITOR.NODE_TEXT) ? container.getParent() : container;
					if(MSGUTIL.isBlock(breakElement) || breakElement.getName() == 'a')
							breakElement = null;	
					// Insert a dummy node to break style
					var dummy = new CKEDITOR.dom.element("span");
					if(container.type == CKEDITOR.NODE_TEXT)
					{
						this._breakTextNode(container, nOffset, dummy);				
					}
					else
					{
						// Split between element
						var sibling = container.getChild(nOffset);						
						if(insertBefore)
							dummy.insertBefore(sibling);
						else
							dummy.insertAfter(sibling);
					}
					if ( breakElement )
						dummy.breakParent(breakElement);
						
					insertContext.container = dummy.getParent();
					// Previous sibling's index
					
					// If previous sibling is a splitted empty span, remove it.
			        var preSibling = dummy.getPrevious();
			        if(preSibling && preSibling.is && preSibling.is('span') && MSGUTIL.getNodeLength(preSibling) == 0)
			        {            		
						preSibling.remove();
						insertBefore = true;
			        }
			                   		
					preSibling = dummy.getPrevious() || dummy;
					insertContext.offset = preSibling.getIndex();
					
					dummy.remove();	
				}			
			}
		}
		
		var preSibling = insertContext.container;
		var nOffset = insertContext.offset;
		var editor = window['pe'].scene.getEditor();
		var range = new CKEDITOR.dom.range( editor.document );
		range.startContainer = preSibling;
		range.startOffset = nOffset;
		
		var isEmpty = false;
		if(preSibling.type == CKEDITOR.NODE_ELEMENT)
		{
			var child = preSibling.getChild(nOffset);
			if(!child)
				isEmpty = true;
			else if(child.type == CKEDITOR.NODE_TEXT)
				{
			        nOffset = MSGUTIL.getNodeLength(child);
				}
			preSibling = child || preSibling;
		}
		
					
		var node, oldpreSibling;
		var reg = /[\r\n]/g;		
		for (var i = 0; i < act.cnt.length; i++)
		{
			var data = act.cnt[i];	
			insertPos = data.ip;
									
			if (data.t != undefined)					
				node = new CKEDITOR.dom.text(data.t);			
			else if (data.e != undefined){
				/* replace all the /r/n, because browser will treat them as a textnode */
				var str = data.e.replace(reg, '');
				node = CKEDITOR.dom.element.createFromHtml(str);
			}			
			else
				continue;		
			
			// Insert text in a empty paragraph.
			// In IE, press enter and insert text.
			if(isEmpty)
			{
				preSibling.append(node);
				preSibling = node;
				if(preSibling.type == CKEDITOR.NODE_TEXT)
					nOffset = MSGUTIL.getNodeLength(preSibling);
				else
					nOffset = 0;
				isEmpty = false;
				insertBefore = false;
				continue;
			}
			//#45600: [Firefox]Insert a link and then delete it char by char, and then undo, the link is just added to the first letter.
			// Should append to previous insertNode's last child, when i >0
			oldpreSibling = null;
			if( i > 0 && node.type == CKEDITOR.NODE_TEXT && data.ip>=0 && preSibling.type == CKEDITOR.NODE_ELEMENT
				&& !preSibling.is("img","br")&& preSibling.getLast())
			{
				oldpreSibling = preSibling;
				preSibling = preSibling.getLast();
				nOffset = MSGUTIL.getNodeLength(preSibling);
			}
			//#7453
			if( insertPos == -1  )
			{ //need insert text to the parent node when insertPos == -1;
				while(!preSibling.getParent().equals(target))
				{
					var n = preSibling.getNext();
					while( n && MSGUTIL.getNodeLength(n)==0 && ( n.type == CKEDITOR.NODE_TEXT || n.is('span') ) )
					{
						var tmp = n.getNext();
						n.remove();
						n = tmp;
					}
					if( n ) break;
					preSibling = preSibling.getParent();
				}
				
			}
			// Just merge the first text node with previous text node.
			//if(i == 0 && preSibling.type == CKEDITOR.NODE_TEXT)
			if(node.type == CKEDITOR.NODE_TEXT && preSibling.type == CKEDITOR.NODE_TEXT)
			{
				// #36554 #36839: Insert blank as &nbsp; will introduce browser layout problem. 
				// Convert n blank to (n-1)&nbsp; + blank
				// insert blank space					
				if(data.t == ' ')
				{
					// Previous character is blank
					if(nOffset > 0 && preSibling.substring(nOffset - 1, nOffset) == ' ')
					{
						//data.t = "\u00a0";
						// Insert &nbsp; before blank
						//nOffset--;
						
						// replace previous blank to &nbsp;
						if (CKEDITOR.env.webkit)
						{
							// insertData will expand current selection to include added text on webkit, that's not expected.
							// so save selection and restore it after insertData
							var sel = editor.document.getWindow().$.getSelection();
							var cursor = null;
							if (sel && sel.rangeCount > 0)
							{
								cursor = sel.getRangeAt(0);
							}
							preSibling.$.replaceData(nOffset - 1, 1, "\u00a0");
							if ( cursor )
							{
								sel.removeAllRanges();
								sel.addRange(cursor);
							}
						} else {
							preSibling.$.replaceData(nOffset - 1, 1, "\u00a0");
						}
					}
					else if(preSibling.substring(nOffset, nOffset + 1) == ' ')
					{
						// Next character is blank;
						data.t = "\u00a0";
					}
				} else if (data.t == "\u00a0") {
					// Previous character is not blank
					if(nOffset > 0 && preSibling.substring(nOffset - 1, nOffset) != ' ')
					{
						data.t = ' ';
					}
				}
				else if( data.t != "\u00a0" && preSibling.getLength() > 1) // Insert text is not blank or &nbsp;
				{
					// Convert previous or next &nbsp; to blank
					// Previous character is &nbsp;
					var index = null;
					var space = ' ';
					if(nOffset > 0 && preSibling.substring(nOffset - 1, nOffset) == "\u00a0")
					{
						// Delete &nbsp; and insert a blank
						index = nOffset -1;
					}
					else if(preSibling.substring(nOffset, nOffset + 1) == '\u00a0')
					{
						// Next character is &nbsp;
						// Delete &nbsp; and insert a blank
						index = nOffset;
					}
					if (index != null)
					{
						if (CKEDITOR.env.webkit)
						{
							// insertData will expand current selection to include added text on webkit, that's not expected.
							// so save selection and restore it after insertData
							var sel = editor.document.getWindow().$.getSelection();
							var cursor = null;
							if (sel && sel.rangeCount > 0)
							{
								cursor = sel.getRangeAt(0);
							}
							preSibling.$.replaceData(index, 1, space);
							if ( cursor )
							{
								sel.removeAllRanges();
								sel.addRange(cursor);
							}
						} else {
							preSibling.$.replaceData(index, 1, space);
						}
					}
				}
				if (CKEDITOR.env.webkit)
				{
					// insertData will expand current selection to include added text on webkit, that's not expected.
					// so save selection and restore it after insertData
					var sel = editor.document.getWindow().$.getSelection();
					var cursor = null;
					if (sel && sel.rangeCount > 0)
					{
						cursor = sel.getRangeAt(0);
					}
//						preSibling.$.insertData(nOffset,data.t);
					if ( cursor )
					{
						sel.removeAllRanges();
						sel.addRange(cursor);
					}
				} else {
//						preSibling.$.insertData(nOffset,data.t);
				}
				// message was changed
				node = new CKEDITOR.dom.text(data.t);
			
				// break text node
				if(insertBefore)				
				{
					if(node.type == CKEDITOR.NODE_ELEMENT && node.getName() == preSibling.getParent().getName() && node.getName() == 'a'){
	                	var ch;
                		var sParent = preSibling.getParent().$;

        				while ( ( ch = node.$.firstChild ) )
        					sParent.insertBefore( node.$.removeChild( ch ), preSibling.$ );
        				
        				node = preSibling.getPrevious();
					}
					else
						node.insertBefore(preSibling);
				}
				else
					this._breakTextNode(preSibling, nOffset, node);
				
				if(node.is && node.is('span')){
	                 if(preSibling.getParent().is('span'))
	                    node.breakParent(preSibling.getParent());
				}						
				
			}
			else
			{
				if(insertBefore)				
				{
					if(node.type == CKEDITOR.NODE_ELEMENT && node.getName() == preSibling.getParent().getName() && node.getName() == 'a'){
	                	var ch;
                		var sParent = preSibling.getParent().$;

        				while ( ( ch = node.$.firstChild ) )
        					sParent.insertBefore( node.$.removeChild( ch ), preSibling.$ );
        				
        				node = preSibling.getPrevious();
					}
					else
						node.insertBefore(preSibling);
				}
				else
				{
					// Break the the text node for the first text node.
					if(i == 0 && preSibling.type == CKEDITOR.NODE_TEXT)
					{
						this._breakTextNode(preSibling, nOffset, node);						
						if(node.is && node.is('span')){
			                 if(preSibling.getParent().is('span'))
			                    node.breakParent(preSibling.getParent());
						}
					} else {
						if ( MSGUTIL.isList(node))
						{
							while (!preSibling.getParent().equals(target))
								preSibling = preSibling.getParent();
						}
						node.insertAfter(preSibling);
							
						if(i != 0){
							if(node.is && node.is('span')){
			                 if(preSibling.getParent().is('span'))
			                    {
			                    	node.breakParent(preSibling.getParent());
			                    	var nextSib = node.getNext(); 
			                    	// Remove the empty breaked node.
			                    	if(nextSib != null && MSGUTIL.getNodeLength(nextSib) == 0 )
			                    		nextSib.remove();
			                    		
			                    	var preSib = node.getPrevious();
			                    	// Remove the empty breaked node.
			                    	if(preSib != null && MSGUTIL.getNodeLength(preSib) == 0 )
			                    		preSib.remove();
			                    }
							}
						}
					}
						
					// Defect 44869, <br> after ul or ol will behave like an empty line, so remove it.	
					if (node.is && (node.is('ul') || node.is('ol')) )
					{
						var next = node.getNext();
						if (next && next.type == CKEDITOR.NODE_ELEMENT && next.is('br') )
						{
							next.remove();
						}	
					}
				}
			}
			//#45600: [Firefox]Insert a link and then delete it char by char, and then undo, the link is just added to the first letter.
			// restore preSibling for next insert
			preSibling = node;
			if( oldpreSibling )
				preSibling = oldpreSibling;
				
			nOffset = MSGUTIL.getNodeLength(preSibling);
			// Other content should append preSibling node.
			insertBefore = false;				
		}

		range.setEndAfter(preSibling);
		range.isFromUndoRedo = fromUndoRedo;
		range.insertElement = target;
		editor.fire('contentInsert', range);
		target.$.normalize();
		MSGUTIL.normalizeFix(target);
	},
	
	deleteText : function(doc,act)
	{
		var nodeList = [];
		var firstDeleteNode = {};
		var tar = doc.getElementById(act.tid);
		if (tar == null){
			act.len=0;
			return;	
		}
		var node = new CKEDITOR.dom.element(tar);
		var target = {"node": node, "index": act.idx, "length": act.len};
		firstDeleteNode = this._deleteText(target, nodeList, firstDeleteNode);

		for(var j=0; j< nodeList.length; j++)		
		{
			if(node.equals(nodeList[j]))
				continue;
			nodeList[j].remove();
			concord.text.tools.destroyNode(nodeList[j]);
		}
		
		node.$.normalize();
		MSGUTIL.normalizeFix(node);
		
		var editor = window['pe'].scene.getEditor();
		//editor.fire('contentDelete');  // Content delete only used for update TOC status 
		
		return firstDeleteNode;					
	},

	insertStyleElement : function(doc,act, fromUndoRedo)
	{
		var tar;
		var editor = window['pe'].scene.getEditor();
		tar = editor.document.getHead();
		if(!tar)
			return;

		var cStart = act.s.indexOf(">");
		var cEnd = act.s.indexOf("<",cStart);
		var styleContent = act.s.substring(cStart + 1,cEnd);

		var pattern = /([^\s=]*)=([^\s]*)/g;
		var styleAttr = {};
		act.s.substring(0,cStart)
				.replace(pattern,function(all,name,value){
					if(value)
					{
						if(value[0]=="'" || value[0]=='"')
							value = value.substring(1);
						var iL = value.length-1;
						if(value[iL]=="'" || value[iL]=='"')
							value = value.substring(0,iL);
					}
					if(name && value)
						styleAttr[name] = value;
				});
		
		
		var newStyleNode = editor.document.createElement('style',{attributes : styleAttr});
		MSGUTIL.generateID(newStyleNode);
		
		try
		{
			newStyleNode.$.innerHTML = styleContent;
		}
		catch(error)
		{
			newStyleNode.$.styleSheet.cssText = styleContent;
		}

		tar.append(newStyleNode);

		return newStyleNode;
	},
	
	deleteStyleElement : function(doc,act)
	{
		var tar;
		if(act.tid)
			tar = doc.getElementById(act.tid);
		if (!tar)
		{
			var editor = window['pe'].scene.getEditor();
			tar = editor.document.getHead();
			if(!tar)
				return;
		}
		
//		var ref;
//		if(act.idx)
//			ref = MSGUTIL.getChildNode( tar,act.idx);
//		
//		if(ref)
//			ref.remove();
	},

	insertElement : function(doc,act, fromUndoRedo)
	{
		var tar = doc.getElementById(act.tid);
		if (tar == null)
			return;			
		var target = new CKEDITOR.dom.element(tar);
		if (!target.is('body'))
		{
			MSGUTIL.normalize(target);
		}
		var element = CKEDITOR.dom.element.createFromHtml(act.s);
		var ref;
		if (act.isb)
		{
			//InsertNode, trigger by IE, FF need to add BR explicitly
			var tagName = element.getName();
			if( !element.is('hr') && !element.is('img'))
			{				 
				if(MSGUTIL.isTableFrames(element) || element.is('table'))
				{
					var subCells = MSGUTIL.getSubCells(element);
					for(var cellIdx = 0; cellIdx < subCells.length; cellIdx++)
					{
						var subCell = subCells[cellIdx];
						CKEDITOR.tools.increaseBorderWidth(subCell);
//						if(CKEDITOR.env.webkit){
//							var borderWidths = subCell.getStyle('border-width').split(' ');
//							var newBorderWidth = '';
//							for(var i=0; i<borderWidths.length; i++){
//								var index = borderWidths[i].indexOf('pt');
//								if(index != -1)
//								{
//									if(!isNaN(borderWidths[i].substring(0,index)))
//										if(borderWidths[i].substring(0,index)<0.75)
//											borderWidths[i] = '0.75pt';
//								}
//								newBorderWidth += borderWidths[i]+' ';
//							}
//							subCell.setStyle('border-width',newBorderWidth);
//						}
						for(var subIdx = 0; subIdx < subCell.getChildCount(); subIdx++)
						{
							var subChild = subCell.getChild(subIdx);
							if(subChild.type == CKEDITOR.NODE_ELEMENT && subChild.is('p'))
							{
								if(subChild.getElementsByTag('br').count() == 0)
									subChild.appendBogus();
							}
						}
					}
				} //performance improvment: getPureText is slow for large table
				else if( (!concord.text.tools.isAnchorContainer(element)) && (!concord.text.tools.isAnchorParent(element)) && MSGUTIL.getPureText(element).length == 0)
				{
					var lastChild = element.getLast();
					var lastChildTagName;
					if(lastChild)
						lastChildTagName = lastChild.getName?lastChild.getName():null;
					if(!CKEDITOR.dtd.$list[tagName] && (lastChildTagName && !CKEDITOR.dtd.$list[lastChildTagName]))
					{//empty ol&ul do not need br
						element.appendBogus();
					}
				}
				else if(element.hasClass("thinborder"))
					CKEDITOR.tools.increaseBorderWidth(element);
					
			}
			ref = null;
			if(act.idx > 0)
				ref = MSGUTIL.getChildNode( target,act.idx - 1);
			else
				ref = MSGUTIL.getChildNode( target,0); 	
			if( ref )
				(act.idx>0)? element.insertAfter(ref):element.insertBefore(ref);
			else
				target.append(element);
			
			if( (MSGUTIL.isHeading(element)||MSGUTIL.isParagraph(element)) && MSGUTIL.isInBullet(element))
			{//if heading in bullet, the null br should append to heading,not list item
				var nextSibling = element.getNext();
				if(MSGUTIL.isNullBr(nextSibling))
					nextSibling.remove();
				nextSibling = element.getPrevious();
				if( MSGUTIL.isNullBr(nextSibling) )
					nextSibling.remove();
			}	
			if(concord.text.tools.isBlockBrAttachable(element))
				element.appendBogus();
		}
		
		var editor = window['pe'].scene.getEditor();
		var range = new CKEDITOR.dom.range( editor.document );
		range.setStartBefore(element);
		range.setEndAfter(element);
		range.isFromUndoRedo = fromUndoRedo;
		range.insertElement = element;
		editor.fire('contentInsert', range);
		//jmt - coeditfix
		this._adjustTableFocus(target,act);
		return element;
	},
	
	deleteElement : function(doc,act)
	{		
		var tar = doc.getElementById(act.tid);
		if (tar == null)
			return;			
		var target = new CKEDITOR.dom.element(tar);
		if (!target.is('body'))
		{
			MSGUTIL.normalize(target);
		}
		if (act.isb)
		{
			for(var i = act.len - 1; i >= 0 ; i--)
			{			
				var	node = MSGUTIL.getChildNode( target,act.idx + i );
				if( node ){
					node.remove();
					concord.text.tools.destroyNode(node);
				}
					
			}
		}
		
		var editor = window['pe'].scene.getEditor();		
				
		this._adjustTableFocus(target,act);
		//inline element, no specific delete inline element handing, same with char	
	},
	updateListValue:function(doc,act){
		var tar = doc.getElementById(act.tid);
		if(tar == null){
			var lids = act.lids||[];
			for(var i =0;i< lids.length;i++){
				var lid = lids[i];
				tar = doc.getElementById(lid);
				if(tar != null){
					break;
				}
			}
		}
		if(tar == null){
			return;
		}
		tar=new CKEDITOR.dom.element(tar);
		LISTUTIL.updateListValue(tar, null, act.force);
	},
	changeListType:function(doc,act){
		
	},
	_adjustTableFocus:function(target,act)
	{
		if(target.is('tr') || target.is('tbody'))
		{
			var editor = window['pe'].scene.getEditor();
			var selection = editor.getSelection();
			var range = selection && selection.getRanges()[0];
			if(range && (range.startContainer.$.nodeName.toLowerCase() == 'tbody'||
				range.startContainer.$.nodeName.toLowerCase() == 'tr'))
			{
				var element = null;
				if(target.is('tr'))
				{
					while(target.hasPrevious())
						target = target.getPrevious();
					if(target.hasClass('tableHeaderRow') && target.hasNext())
						target = target.getNext();
				}
				var sibling = target.getChild(act.idx);
				if(!sibling || sibling.type == CKEDITOR.NODE_TEXT)
				{
					if(act.idx > 0)
						sibling = target.getChild(act.idx - 1);
				}
				if(sibling && sibling.type == CKEDITOR.NODE_ELEMENT)
					element = sibling.is('tr')?sibling.getFirst():sibling;
				if(!element || element.type == CKEDITOR.NODE_TEXT)	
					element = target;
				if(element.getFirst())
				{
					element = element.getFirst();
					while(element.hasNext())
					{
						if(element && element.type == CKEDITOR.NODE_ELEMENT && element.is('br'))
							break;
						element = element.getNext();
					}
				}
				range.moveToPosition(element,CKEDITOR.POSITION_AFTER_START);//#40126: [Co-editing]User1 delete row and user2 insert/delete text, two clients are not synced.
				range.select();
			}
		}
	},
	/*****************************************************************************************************************************************
	 * set styles and attributes to an element
	 */
	setElementAttrs: function(node,styles,attrs )
	{
		//set style
		if( node.type != CKEDITOR.NODE_ELEMENT )
	 		return;
		if( styles ) 
			MSGUTIL.setStyles(node,styles);
		//set attribute	
		if( attrs)
		{
			for( var name in attrs )
			{
				if(attrs[name]!="" )
					node.setAttribute(name,attrs[name]);
				else
					node.removeAttribute(name);
			}
		}
	},
	
	_removeChildrenStyles : function ( node,styles, guard )
	{
		if( node.type ==CKEDITOR.NODE_ELEMENT )
		{
			var  child = node.getFirst();
			while( child )
			{
				var next = child.getNext();
				if( !guard || (dojo.isFunction(guard) && guard.call(this,child)) )
					this._removeElementAttrs( child,styles );
				this._removeChildrenStyles(child,styles,guard);
				child = next;
			}
		}
	},
	/*****************************************************************************************************************************************
	 * remove styles and attributes to an element
	 * 
	 */
	_removeElementAttrs : function(node,styles,attrs) 
	 {
	 	if( node.type != CKEDITOR.NODE_ELEMENT )
	 		return;
	 	//remove style
		if( styles ) {
			MSGUTIL.removeStyles(node,styles);
			if (styles['font-size'])
				node.removeAttribute( 'pfs' );
		}
		//remove attribute
		//set attribute	
		if( attrs)
		{
			for ( var name in attrs )
			{
				if ( name == 'class') {
					node.removeClass(attrs[name]);	
				} else {
					node.removeAttribute( name );
				}
			}
		}		
			
		var  child = node.getFirst();
		while( child )
		{
			var next = child.getNext();
			this._removeElementAttrs(child,styles,attrs);
			child = next;
		}
	 },
	 
	 /*****************************************************************************************************************************************
	 * exexute set/remove styles and attributes to message cmd
	 * 
	 */
	exeStyle: function( doc, cmd )
	{
		if(concord.util.browser.isMobile()){
			if(!pe.lotusEditor.commandExec)
				pe.lotusEditor.commandExec = [];
			pe.lotusEditor.commandExec.push('exeStyle');
		}
		var type = cmd.t;
		var targetId = cmd.tid;
		if( type != MSGUTIL.actType.setStyle && type != MSGUTIL.actType.removeStyle )
				return null;
		var remove = ( type != MSGUTIL.actType.setStyle );
		var targetNode = doc.getElementById(targetId);
		if( !targetNode )
			return;
		var removeElement = function( node, name )
		{
			if( !node ) return;
			var n = node.getAscendant( name,true);
			if( n )
			{
				var p = n.getParent();			
				var  child = n.getFirst();
				while( child )
				{
					var next = child.getNext();
					child.remove().insertBefore( n );
					child = next;
				}
				n.remove();
				removeElement( p );
			}
		};
		var createElement = function( node, name )
		{
			if( !node.getAscendant( name,true) || node.type == CKEDITOR.NODE_TEXT  ||  (node.hasClass && node.hasClass('ConcordTab') ) )
			{
				var doc = node.getDocument();
				var newNode = doc.createElement( name );
				newNode.insertBefore(node);
				newNode.append( node.remove() );
				return newNode;
			}
			return node;
		};
		
		var checkImage = function( element )
		{ 
		  //#13389
		  //remove the span which contains img such as
		  // <a> <span> ...<img>... </span> </a >
		  // changed to <a> <span>...</span><img><span>...<span> </a>
		  	if( element.is && element.is('a') )
			{
				var nodes = dojo.query( 'img',element.$ );
				for( var i=0; i< nodes.length; i++ )
				{
					var img = new CKEDITOR.dom.element( nodes[i] );
					var p = img.getParent(), span1 = null, span2 = null;
					if( p.is('span'))
					{
						span1 , span2;
						var child;
						while( child = img.getPrevious() )
						{
							if( !span1 )
							{
								span1 = p.clone();
								span1.insertBefore(p);
							}
							child.remove();
							span1.append( child, true);
						}
						while( child = img.getNext())
						{
							if( !span2 )
							{
								span2 = p.clone();
								span2.insertAfter(p);
							}
							child.remove();
							span2.append( child );
						}
						img.remove();
						img.insertAfter(p);
						p.remove();
					}
				}
			}		  	
		};
		
		var begin = cmd.i;
		var len = cmd.l;
	
		if( len && targetNode.innerHTML!="")
		{//replace with newNode
			begin = begin||0;
		    //var newNode = targetNode.cloneNode(true);
			var nodeElement =  new CKEDITOR.dom.element( targetNode );//newNode);
			var e = cmd.e ||'span';
			var styles = cmd.s;
			var attr = cmd.a;
			var splitRoot = ( e.toLowerCase() != 'span' && !remove );
			var ret= MSGUTIL.splitNode( nodeElement,begin,len, e ,splitRoot); 		
			var nodes = ret.m;
			
			for ( var i = 0; i < nodes.length;i++ )
			{
				if( remove )
				{
					if( e!='span' ) 
						removeElement( nodes[i], e );
					else
						this._removeElementAttrs( nodes[i],styles,attr );
				}
				else
				{
					// Skip and do not set style if it is br.
					if( MSGUTIL.isBr(nodes[i]) )
						continue;
					nodes[i] = createElement( nodes[i],e );
					checkImage( nodes[i]);
					//for defect 20457
					//Due to current structure from convert, <p><span text_p><span>, we will set all attribues to the last <span>
					//we use text_p to recoginized the middle span, and get whose the only child.
					var classname = nodes[i].getAttribute('class');
					if(classname != null && classname.indexOf('text_p') == 0 
							&& nodes[i].getChild(0) != null){
						this.setElementAttrs( nodes[i].getChild(0),styles,attr );
					}
					else{
						this.setElementAttrs( nodes[i],styles,attr );
						this._removeChildrenStyles(nodes[i],styles,MSGUTIL.isSpan);
					}
				}
				if( !e || e == 'span')
				{
					MSGUTIL.mergeElements(nodes[i], nodes[i].getPrevious() );
					if( i == nodes.length-1)
						MSGUTIL.mergeElements(nodes[i], nodes[i].getNext(),true );
					MSGUTIL.removeNoAttribsElement(nodes[i]);
				}
			}
			//targetNode.parentNode.replaceChild( newNode, targetNode );			
			return nodeElement;
		} 
	},
	
	/*****************************************************************************************************************************************
	 * exexute set/remove block element styles and attributes to message cmd
	 * 
	 */
	execBlockStyle: function( doc, cmd )
	{
		var type = cmd.t;
		var targetId = cmd.tid;
		var styles = cmd.s;
		var attr = cmd.a;
		if( type != MSGUTIL.actType.setAttributes && type != MSGUTIL.actType.removeAttributes )
				return null;
		var remove = ( type != MSGUTIL.actType.setAttributes );
		var el = doc.getElementById(targetId);
		if(el) {
			var element = new CKEDITOR.dom.element(el);
			if( remove)
			{
				if(cmd.e && cmd.e!="span")
					MSGUTIL.moveChildren(element);
				else
					this._removeElementAttrs( element,styles,attr );
			}
			else
				this.setElementAttrs( element,styles,attr );
//			var listItem = null;
//			if (MSGUTIL.isListItem(element))
//				listItem = element;
//			else if (MSGUTIL.isHeading(element))
//			{
//				var parent = element.getParent();
//				if (MSGUTIL.isListItem(parent))
//					listItem = parent;
//			}
//			if (listItem)
//			{
//				setTimeout( function () { LISTUTIL.updateListItemShow(listItem)});
//			}
			return element;
		}
	}
});

(function(){	
	if(typeof PROCMSG == "undefined")
		PROCMSG = new concord.text.ProcMsg();	
})();