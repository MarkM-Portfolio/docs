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


dojo.provide("concord.text.SyncMsg");
dojo.require("concord.text.MsgUtil");
dojo.require("concord.text.Log");

dojo.declare("concord.text.SyncMsg", null, {
	
	sendMessage : function(msgPairList, data)
	{
		if(window._normalizeMsg || window._normalizeTableMsg)
		{
			// Defect 28814
			setTimeout(function(){
				// Do not record it in undo stack 
				var msgs = window._normalizeMsg;
				var msgs = [];
				if(window._normalizeMsg)
					msgs = window._normalizeMsg;
				
				if(window._normalizeTableMsg)
					msgs = msgs.concat(window._normalizeTableMsg);
				
				delete window._normalizeMsg;
				delete window._normalizeTableMsg;
				
				SYNCMSG.sendMessage(msgs);
				pe.lotusEditor.removeUndo();
				
				SYNCMSG.sendMessage(msgPairList, data);
			}, 0);
			
			return;
		}	
		
		var listMsgList=[];
		var listRedoMsgList=[];
		var msgList = [];
		var rMsgList = [];
		var scene = window['pe'].scene;
		
		// Use the flag to check if content size has been changed.
		scene.editorContentChanged = true;
		
		for (var i=0; i<msgPairList.length; i++)
		{
			var msg = msgPairList[i].msg;
			var rMsg = msgPairList[i].rMsg;
			if(msg.updates.length <= 0)
				continue;
			if(msg.type==MSGUTIL.msgType.List || msg.type==MSGUTIL.msgType.HeaderFooter){
				listMsgList.push(msg);
			}else{
				msgList.push(msg);
			}
			if(rMsg.type==MSGUTIL.msgType.List || rMsg.type==MSGUTIL.msgType.HeaderFooter){
				listRedoMsgList.push(rMsg);
			}else{
				rMsgList.push(rMsg);
			}
			
		}
		msgList=msgList.concat(listMsgList);
		rMsgList=listRedoMsgList.concat(rMsgList);
		window['pe'].lotusEditor.fire("msgsTab", msgList);
		this.preSend(msgList, rMsgList, data);
		
		if(msgList.length > 0)
		{
			
			if(window.g_presentationMode)
			{
				scene.session.sendMessage(msgList);
				scene.getEditor().recordUndo(msgList,rMsgList);
			}
			else{
				this._compressMsg(msgList, rMsgList);
			}
		}
		window['pe'].lotusEditor.fire("tableResizeCancel");
	},
	
	// The new message design will set message server/client sequence in message sending.
	// We should update these information to undo/redo stack. 
	updateMsgState : function(sendOutList, stackMsgs)
	{		
		// Both arguments are array
		if( (sendOutList instanceof Array) && (stackMsgs instanceof Array))
		{			
			for(var i = 0; i < sendOutList.length; i++ )
			{
				stackMsgs[i].server_seq = sendOutList[i].server_seq;
				stackMsgs[i].client_seq = sendOutList[i].client_seq;
				stackMsgs[i].client_id = sendOutList[i].client_id;
			}
		}
		else if( !(sendOutList instanceof Array) && !(stackMsgs instanceof Array))
		{
			// Both arguments are normal object
			stackMsgs.server_seq = sendOutList.server_seq;
			stackMsgs.client_seq = sendOutList.client_seq;
			stackMsgs.client_id = sendOutList.client_id;
		}		
		else
			console.error("Illeagal arguments in SyncMsg.updateMsgState(), sendOutList: '" + sendOutList.toString() + " ' StackMsgs: '" + stackMsgs.toString() + " '");
	},
	
	// Combine new message to old message
	// AB -> ABC -> ABCD
	// The newMsg message is insert D, the oldMsg message is Insert C.
	_combineMsg : function(newMsg, oldMsg, isUndo)
	{
		// Both message type is text message
		if(newMsg.type != oldMsg.type || newMsg.type != MSGUTIL.msgType.Text)
			return false;
		
		var newActs = newMsg.updates, oldActs = oldMsg.updates;
		
		// Both message have only one action, same target id, same action type
		if(newActs.length != 1 || oldActs.length != 1 || newActs[0].tid != oldActs[0].tid || newActs[0].t != oldActs[0].t)
			return false;
		
		if( newActs[0].t == MSGUTIL.actType.insertText )
		{
			// Insert text action is a pure text
			var newCnts = newActs[0].cnt, oldCnts = oldActs[0].cnt;
			if(!isUndo && (newCnts[newCnts.length - 1].t == null || oldCnts[oldCnts.length - 1].t == null) )
				return false;
			
			// Merge continuous content which type is 't' 
			var mergeInsertTextCnts = function(srcCnts, destCnts)
			{
				var lastSrcCnt = srcCnts[srcCnts.length - 1];
				if(lastSrcCnt.t != undefined)
				{
					var isContinuous = true;
					for(var i = 0; i < destCnts.length; i++)
					{
						var destCnt = destCnts[i];
						if(isContinuous && destCnt.t != undefined)
						{
							if (lastSrcCnt.t[lastSrcCnt.t.length - 1] == '\u0020' && destCnt.t[0] == '\u0020')
							{
								lastSrcCnt.t = lastSrcCnt.t.substring(0, lastSrcCnt.t.length - 1).concat('\u00a0');
							} else if ( lastSrcCnt.t[lastSrcCnt.t.length - 1] != '\u0020' && destCnt.t[0] == '\u00a0') {
								destCnt.t = '\u0020'.concat(destCnt.t.substring(1, destCnt.t.length));
							}
							lastSrcCnt.t += destCnt.t;
						}
						else
						{
							isContinuous = false;
							srcCnts.push(destCnt);
						}
					}	
					return srcCnts;
				}
				else
					return srcCnts.concat(destCnts);
			};
			
			if(newActs[0].idx == (oldActs[0].idx + oldActs[0].len))
			{
				// Insert text: A -> AB -> ABC
				oldActs[0].len += newActs[0].len;
				oldActs[0].cnt = mergeInsertTextCnts(oldActs[0].cnt, newActs[0].cnt); //oldActs[0].cnt.concat(newActs[0].cnt);
				return true;
			}
			else if(isUndo && (newActs[0].idx + newActs[0].len) == oldActs[0].idx)
			{
				// Delete before, ABCD -> ABC -> AB -> A
				oldActs[0].idx = newActs[0].idx;
				oldActs[0].len += newActs[0].len;
				oldActs[0].cnt = mergeInsertTextCnts(newActs[0].cnt, oldActs[0].cnt); //newActs[0].cnt.concat(oldActs[0].cnt);
				return true;
			}
			else if(isUndo && newActs[0].idx == oldActs[0].idx)
			{
				// For undo message: Delete after, ABCD -> ACD -> AD -> A
				oldActs[0].len += newActs[0].len;
				oldActs[0].cnt = mergeInsertTextCnts(oldActs[0].cnt, newActs[0].cnt); //oldActs[0].cnt.concat(newActs[0].cnt);
				return true;
			}
		}
		else if( newActs[0].t == MSGUTIL.actType.deleteText )
		{
			if(newActs[0].idx == oldActs[0].idx)
			{
				// Delete after, ABCD -> ACD -> AD -> A
				oldActs[0].len += newActs[0].len;
				return true;
			}
			else if((newActs[0].idx + newActs[0].len) == oldActs[0].idx)
			{
				// Delete before, ABCD -> ABC -> AB -> A
				oldActs[0].idx = newActs[0].idx;
				oldActs[0].len += newActs[0].len;
				return true;
			}
			else if(isUndo && newActs[0].idx == (oldActs[0].idx + oldActs[0].len))
			{
				// For undo message: Insert text A -> AB -> ABC
				oldActs[0].len += newActs[0].len;
				return true;
			}
		}
		
		return false;
	},
	
	// Compress continuous insert/delete text message
	_compressMsg : function( msgList, rMsgList )
	{
		var scene = window['pe'].scene;
		var sess = scene.session;
		var editor = scene.getEditor();
		var undoStack = editor.getStack();
		
		// Compress message text message, has no redo
		if(sess.waitingList.length > 0 && msgList.length == 1 && !editor.hasRedo() && undoStack.length > 0)
		{
			// Get the latest redo message from stack
			var msgs = undoStack[undoStack.length - 1];
			if(msgs.redo.length == 1)
			{
				var combined = this._combineMsg(msgList[0], msgs.redo[0]);
				if(combined)
				{
					this._combineMsg(rMsgList[0], msgs.undo[0], true);
					
					// Remove the latest message from waiting list
					sess.waitingList.pop();
					
					// Send the combined message
					//var clone = dojo.clone(msgs.redo);
//					var clone = dojo.fromJson(dojo.toJson(msgs.redo));
					var clone = pe.scene.session.isSingleMode() ? msgs.redo : dojo.fromJson(dojo.toJson(msgs.redo));
					sess.sendMessage(clone);
					this.updateMsgState(clone, msgs.redo);
					
					return;
				}
			}
		}
		
		for(var i=0; i<msgList.length; i++)
			LOG.logMessage(msgList[i], true);
		
		//var cloneList = dojo.clone(msgList);
		var cloneList = pe.scene.session.isSingleMode() ? msgList : dojo.fromJson(dojo.toJson(msgList));
		editor.recordUndo(msgList,rMsgList);
		sess.sendMessage(cloneList);
		this.updateMsgState(cloneList, msgList);
		this.updateMsgState(cloneList, rMsgList);
	},
	
	// Need not record undo
	sendResetContentMsg : function(msgList, data)
	{
		if( !(msgList instanceof Array) )
		{
			var a = [];
			a.push(msgList);
			msgList = a;
		}
		
		if(msgList.length > 0)
		{
			var scene = window['pe'].scene;
			scene.session.sendMessage(msgList);
		}
	},
	
	preSend: function(msgList, rMsgList, data){
		/*do nothing*/
	},
				
	createContentResetMsg : function()
	{
		var editor = window['pe'].scene.getEditor();
		var cloneDoc = editor.document.$.cloneNode(true);
		
		var head = null;
		var body = null;
		var docElement = null;
		
		if(cloneDoc)
		{
			head = cloneDoc.getElementsByTagName( 'head' )[0];
			
			body = cloneDoc.body;
			docElement = cloneDoc.documentElement;
		}
		else
		{
			// On Safari, document.cloneNode(true) return null
			docElement = editor.document.$.documentElement.cloneNode(true);
				
			if(!docElement)
				throw('The Document element is empty in create reset content message');
			
			head = docElement.getElementsByTagName( 'head' )[0];
			body = docElement.getElementsByTagName( 'body' )[0];
		}
		//remove css link added by ck
		var ckstyles = head.querySelectorAll(".ckstyle");
		for(var i=0; i<ckstyles.length; i++ )
		{
			ckstyles[i].parentNode.removeChild(ckstyles[i]);
		}
		
		//remove spell check styles
		if(editor.spellchecker)
			editor.spellchecker.resetOneNode(body, false);
		//remove runtime style		
		var styleNode = null;
		if(cloneDoc)
			styleNode = cloneDoc.getElementById("runtimeStyle");
		else
			styleNode = head.querySelector("#runtimeStyle");
		if (styleNode && styleNode.parentNode)
		{
			styleNode.parentNode.removeChild(styleNode);
		}
		//remove img indicator
		concord.util.browser.removeImageIndicator(cloneDoc, body);
		concord.text.tools.resetImageSrcAttribute(body);
		// Remove table selection class
		var ckBody = new CKEDITOR.dom.element(body);
		editor.fire('removeTableSelection', ckBody);
		
		//remove \r\n on ie
		var content = docElement.innerHTML;
		if (CKEDITOR.env.ie)
			content = content.replace(/\r\n/g,'');
		content = "<html>" + content + "</html>";
		
		var act = {};
		act.t = MSGUTIL.actType.ResetContentAction;
		act.data = content;
		act.tid = '';
		
		var actPair = {};
		actPair.act = act;
		actPair.rAct = {};
		
		var msgPair = this.createMessage(MSGUTIL.msgType.ResetContent, [actPair]);
		
		return msgPair.msg;
	},
	
	checkDocValid : function(editor)
	{
		var body = editor.document.getBody();
		var flag = editor.addIdToElement(body);
		if (flag)	
		{				
			var msg = this.createContentResetMsg();
	 		this.sendResetContentMsg([msg]);
		}
	},
	
	/**
	 * 
	 * @param logData The logData is a string which will be recorded in server.
	 */
	sendLogMessage:function(logData)
	{
		var app = window['pe'];
		var sess = app.scene.session;  
    	
    	var msg = sess.createMessage();
    	msg.client_log = logData || "empty log";
    	msg.type = "client_log";
    	msg.data = '';
    	
    	sess.sendMessage(msg);
    	
    	return msg;
	},
	
//public action generation functions
	/*
	 * isCtrl = true, indicate this message is not a content change message
	 * just used to notify other clients, such as "slideSelected" events
	 */
	createMessage : function(type, actPairList, callback, data, isCtrl, asCtrl)
	{
		return this.createMessage2( type, type, actPairList, callback, data, isCtrl, asCtrl);
	},
	
	createMessage2 : function(type, rtype, actPairList, callback, data, isCtrl, asCtrl)
	{
		var app = window['pe'];
		var sess = app.scene.session;  
    	
    	var msg = sess.createMessage(isCtrl, asCtrl);
    	var rMsg = sess.createMessage(isCtrl, asCtrl);
		msg.type = type;
		rMsg.type = rtype;
		if (!data)
		{
			msg.data = '';
			rMsg.data = '';		
		}
		else
		{
			msg.data = data;
			rMsg.data = data;
		}
		
		msg.as = [];
		rMsg.as = [];						// Acts
		
		for (var i=0;i<actPairList.length;i++)
		{
			var act = actPairList[i];
			if (act != null)
			{
				if (act.act != null)
			 		msg.as.push(act.act);
				if (act.rAct != null)
			 	{
			 		// Insert element
			 		if(act.rAct.actions)
			 		{
			 			// Reversed
			 			for(var j=act.rAct.actions.length - 1; j >= 0 ; j--)
			 				rMsg.as.unshift(act.rAct.actions[j]);
//			 				rMsg.as.push(act.rAct.actions[j]);
			 		}
			 		else
			 			rMsg.as.unshift(act.rAct);
//			 			rMsg.as.push(act.rAct);
			 	}
			}
		}
		
		// TODO remove updates
		msg.updates = msg.as;
		rMsg.updates = rMsg.as;
		delete msg.as;
		delete rMsg.as;
		
		return {"msg": msg, "rMsg": rMsg};
	},

	// joinNode for join element
	createInsertTextAct : function(sIdx, eIdx, target, joinNode)
	{		
		var act= this._createInsertTextAct(sIdx, eIdx, target, joinNode);
		//var rAct = this._createDeleteTextAct(sIdx, eIdx, target, context);
		var rAct = null;
		if(act)
		{
			rAct = {};
			rAct.tid = act.tid;					// target id
			rAct.t = MSGUTIL.actType.deleteText;	// Type
			rAct.idx = act.idx;
			rAct.len = act.len;
			concord.util.mobileUtil.isProcessedMessage = true;
		}
		return {"act": act, "rAct": rAct};
	},

	
	createDeleteTextAct : function(sIdx,eIdx,target)
	{		
		var act= this._createDeleteTextAct(sIdx, eIdx, target);	
		var rAct = this._createInsertTextAct(sIdx, eIdx, target);
		concord.util.mobileUtil.isProcessedMessage = true;	
		return {"act": act, "rAct": rAct};
	},
	
	createTextChangeAct : function(oldLen, oldPos, newLen, newPos, target, oldTarget)
	{	
		var act = [];

//		if ( CKEDITOR.env.ie || concord.util.browser.isMobile())
		{
			var oldContent = MSGUTIL.getPureText(oldTarget),
				newContent = MSGUTIL.getPureText(target),
				beginPos = Math.min( oldPos, newPos ),
				endPos = Math.min( oldLen - oldPos ,  newLen - newPos );
			// If more than 3 characters are the same, we regard that the strings before/after are the same.
//			while ( ( beginPos > 0 && oldContent[beginPos-1] != newContent[beginPos-1] )
//				    || ( beginPos - 1 > 0 && oldContent[beginPos-2] != newContent[beginPos-2] )
//				    || ( beginPos - 2 > 0 && oldContent[beginPos-3] != newContent[beginPos-3] ) )
//				beginPos--;
			
			if(oldContent == newContent)
				return act;
			
			var eqaulStr = function(str1, str2)
			{
				str1 = str1.replace(/\u00a0/g, " ");
				str2 = str2.replace(/\u00a0/g, " ");
				return str1 == str2;
			};
			
			while(beginPos > 0)
			{
				if( eqaulStr(newContent.substring(0, beginPos),oldContent.substring(0, beginPos)) )
					break;
				else
					beginPos--;
			}
			
//			while ( ( endPos > 0 &&  oldContent[oldLen-endPos] != newContent[newLen-endPos] )
//					|| ( endPos - 1 > 0 &&  oldContent[oldLen-endPos+1] != newContent[newLen-endPos+1] )
//					|| ( endPos - 2 > 0 &&  oldContent[oldLen-endPos+2] != newContent[newLen-endPos+2] ) )
//				endPos--;
			
			while(endPos > 0)
			{
				if(eqaulStr(newContent.substring(newLen - endPos, newLen), oldContent.substring(oldLen - endPos, oldLen)))
					break;
				else
					endPos--;
			}
			
			var deleteLen = oldLen - endPos - beginPos,
				insertLen = newLen - endPos - beginPos,
				index = 0;		
			if ( deleteLen > 0 )
			{
				act[index++] = this.createDeleteTextAct( beginPos, oldLen - endPos, oldTarget);
				if( window.g_concordInDebugMode )
					console.log("Delete text action: " + target.getId() + " pos = " + beginPos + " len = " + deleteLen);
			}
			if ( insertLen > 0 )
			{
				act[index] = this.createInsertTextAct( beginPos, newLen - endPos, target);
				var offset = 8;
				if(beginPos < offset)
					offset = beginPos;
				act[index].act.frag = newContent.substring(beginPos - offset, beginPos);
				
				if( window.g_concordInDebugMode )
					console.log("Insert text action: " + target.getId() + " pos = " + beginPos + " len = " + insertLen);
			}
		}
//		else
//		{
//			var pos = Math.min(oldPos, newPos);	
//			if(oldLen > newLen)
//			{
//				// delete text	
//				var len = oldLen - newLen;
//					
//				//act = this.createDeleteTextAct(pos, pos + len, target);
//				act[0] = this.createDeleteTextAct(pos, pos + len, oldTarget);
//				if( window.g_concordInDebugMode )
//					console.log("Delete text action: " + target.getId() + " pos = " + pos + " len = " + len);
//			}
//			else if(oldLen < newLen)
//			{	
//				// Insert text
//				var len = newLen - oldLen;
//				//var text = newText.substring(pos, pos + len);	
//				//act = this.createInsertTextAct(pos, pos + len, target, text);
//				
//				// In IE, select all paragraph and insert text, the generated Paragraph without ID
//				if(!target.getId() && oldLen == 0 && oldPos == 0)
//				{	
//					target.setAttribute("id", MSGUTIL.getUUID());
//					act[0] = this.createInsertElementAct(target.getIndex(), target.getParent(), target, MSGUTIL.isBlock(target));
//				}
//				else
//				{
//					act[0] = this.createInsertTextAct(pos, pos + len, target);
//					if( window.g_concordInDebugMode )
//						console.log("Insert text action: " + target.getId() + " pos = " + pos + " len = " + len);
//				}
//			}
//			else
//			{	
//				// text change ?
//			}
//		}
		return act;
	},	
	
	/**
	 * must be called after inserting block for index
	 * @param node
	 * @returns
	 */
	createInsertBlockElementAct : function( node )
	{
		return this.createInsertElementAct( MSGUTIL.getBlockIndex(node), node.getParent(),node);
	},
	
	createInsertElementAct : function(index,target,node)
	{
		if(typeof node == 'string')
			node = CKEDITOR.dom.element.createFromHtml(node);	
		var act= this._createInsertElementAct(index, target, node);
		var rAct = this._createDeleteElementAct(index, 1, target, [node]);
		//rAct.t = MSGUTIL.actType.deleteElement;
		
		
		return {"act": act, "rAct": rAct};
	},

	createInsertStyleElementAct : function(index,target,node)
	{
		if(typeof node == 'string')
			node = CKEDITOR.dom.element.createFromHtml(node);	
		var act= this._createInsertStyleElementAct(index, target, node);
		var rAct = this._createDeleteStyleElementAct(index, 1, target, [node]);		
		return {"act": act, "rAct": rAct};
	},
	
	/**
	 * must be called before deleting node for index
	 * @param node
	 * @returns
	 */
	createDeleteBlockElementAct : function( node )
	{
		return this.createDeleteElementAct( MSGUTIL.getBlockIndex(node),1, node.getParent(),[node]);
	},
	
	createDeleteElementAct : function(index, length, target, deleteNodes)
	{		
		
		var act = this._createDeleteElementAct(index, length, target, deleteNodes);
		var rActs = [];
		for(var i = 0; i < length; i++)
		{
			var node = deleteNodes[i];
			if(typeof node == 'string')
				node = pe.lotusEditor.document.getById(deleteNodes[i]);
			
			var rA = this._createInsertElementAct(index + i,target,node);
			rActs.push(rA);					
		}
		
		var rAct = {};
		rAct.actions = rActs;
		return {"act": act, "rAct": rAct};
	},

	createDeleteStyleElementAct : function(index, length, target, deleteNodes)
	{		
		
		var act = this._createDeleteStyleElementAct(index, length, target, deleteNodes);
		var rActs = [];
		for(var i = 0; i < length; i++)
		{
			var node = deleteNodes[i];
			if(typeof node == 'string')
				node = pe.lotusEditor.document.getById(deleteNodes[i]);
			
			var rA = this._createInsertStyleElementAct(index + i,target,node);
			rActs.push(rA);					
		}
		
		var rAct = {};
		rAct.actions = rActs;
		return {"act": act, "rAct": rAct};
	},

	/*****************************************************************************************************************************************
	 * create attribute actions for inline text
	 * 
	 * */
	 _createSingleInlineStyleAct : function ( type, target,index,offset,styles, atts, element )
	 {
	 	var act = {};
	 	act.t = type;
	 	act.tid = target;
	 	act.i = index;
	 	act.l = offset;
	 	styles && (act.s = styles );
	 	element && (act.e = element);
		atts &&	(act.a = atts);
		
	 	return act;
	 }
	 ,
 	createInlineStyleAct : function( remove, target,index, offset, styles,atts,element, oldstyles, oldatts )
	{
		var type  = (remove)?MSGUTIL.actType.removeStyle : MSGUTIL.actType.setStyle;
		styles = this._normalizeStyles(styles);
		oldstyles = this._normalizeStyles(oldstyles);
		
		if( atts ) atts = dojo.clone( atts );
		if( oldatts ) oldatts = dojo.clone( oldatts );
		
		for( var style in styles)
		{
			if( !MSGUTIL.isStyleExist(oldstyles,style) )
			 	oldstyles[style] = "";
		}
		
		//#39189
		for( var oldstyle in oldstyles )
		{
			if( !MSGUTIL.isStyleExist(styles,oldstyle) )
			   delete oldstyles[oldstyle];
		}
		
		styles && MSGUTIL.checkNullValues( styles );
		oldstyles && MSGUTIL.checkNullValues( oldstyles );
		if( !remove ) styles && oldstyles && MSGUTIL.checkSameValues( styles , oldstyles );
		atts && MSGUTIL.checkNullValues( atts );
		oldatts && MSGUTIL.checkNullValues( oldatts );
		if( !remove ) atts && oldatts && MSGUTIL.checkSameValues( atts , oldatts );
		
		var act = this._createSingleInlineStyleAct( type,target,index,offset,styles,atts, element );
					
		var rAct={};
		if( element && element!="span")
		{
			rAct.e = element;
			if(atts && atts['id'])
			{
				rAct.t = "rbt";
				rAct.tid = atts['id'];
			}
		}
		else
			rAct = this._createSingleInlineStyleAct( MSGUTIL.actType.setStyle, target,index,offset,oldstyles, oldatts );
		return {"act": act, "rAct": rAct};	
	},

	_normalizeStyles: function(styles)
	{
		styles = dojo.clone(styles);
		if( styles && dojo.isString(styles))
		 styles = MSGUTIL.getStyleParas( styles );
		//normallize text-decoration
		if( styles && styles['text-decoration']!=null && styles['text-decoration']!='none')
		{
			var values = styles['text-decoration'].split(/\s+/);
			for( var i = 0; i< values.length; i++ )
			{ //only surport strikethrough and underline
				if(  MSGUTIL.isTextDecorationStyle(values[i]) )
					styles[values[i]] = "1";
			}
			delete styles['text-decoration'];
		}
		return styles;
	},
	
	_createSingleAttributeAct : function ( target, t, atts, styles )
	{
		var tid = ( target && target.$ )? target.getId(): target;
		
		var act = {};
		act.t = t;
		act.tid = tid;
		if( styles )
			act.s = styles;
//		if( element )
//			act.e = element;
		if( atts )
			act.a = atts;
		
		//check block and get index
		act.isb = true;
		act.bid = tid;
		
		var node = ( target && target.$ )? target : window['pe'].scene.getEditor().document.getById(target);
		if(node) {
			var block = MSGUTIL.getBlock(node);
			if (!block.equals(node))
			{
				act.isb = false;
				act.bid = block.getId();
				act.idx = MSGUTIL.transOffsetRelToAbs(node, 0, block);
				act.len = MSGUTIL.getNodeLength(node);
			}
		}
		return act;
	},
	
	/*****************************************************************************************************************************************
	 *  create set block attributes actions 
	 *  @param string target: element's id
	 *  @param object atts: object (such as { "href":"http://www.ibm.com", "class":"cke_anchor"} )
	 *  @param string or object: styles 
	 * 			can be the string value of html style attribute, such as "font-weight: bolder; font-style: italic;"
	 * 			or object such as {"font-weight":"bolder","font-style":"italic"};
	 *  @param object oldatts
	 *  @param string or object: oldstyles
	 *  return object { "act": ..., "rAct":...}; 
	 */	
	//for the table, it is special, and it is not necessary to check whether the old style value is the same with the new style value. 
	createAttributeAct : function(target,atts,styles,oldatts,oldstyles,forTable)
	{
		styles = this._normalizeStyles(styles);
		oldstyles = this._normalizeStyles(oldstyles);
		for( var style in styles)
		{
			if( !MSGUTIL.isStyleExist(oldstyles,style) )
			 	oldstyles[style] = "";
		}
		styles && MSGUTIL.checkNullValues( styles );
		oldstyles && MSGUTIL.checkNullValues( oldstyles );
		!forTable&&styles && oldstyles && MSGUTIL.checkSameValues( styles , oldstyles );
		atts && MSGUTIL.checkNullValues( atts );
		oldatts && MSGUTIL.checkNullValues( oldatts );
		atts && oldatts && MSGUTIL.checkSameValues( atts , oldatts );

		var act = this._createSingleAttributeAct(target,"sbt",atts,styles);		
		var rAct=  this._createSingleAttributeAct(target,"sbt",oldatts,oldstyles);
		return {"act": act, "rAct": rAct};	
	},
	
	createRemoveTagAct : function(target,tag, targetId, index, offset, styles, atts)
	{
		var type = "rbt";
		var rtype = MSGUTIL.actType.setStyle;
			
		if( dojo.isString( target) )
		{
			var act =  this._createSingleAttributeAct(target,type,{},{});		
			if( tag )
				act.e = tag;
			var rAct = this._createSingleInlineStyleAct( rtype,targetId,index,offset,styles,atts, tag );
			return {"act": act, "rAct": rAct};	
		}
		else if( dojo.isObject( target ))
		{
			var id = target.getId();
			tag = target.getName();
			var paragraph =  MSGUTIL.getParagraphNode( target );
			targetId =  paragraph.getId();
			index = MSGUTIL.transOffsetRelToAbs ( target, 0, paragraph );
			offset = MSGUTIL.getNodeLength(target);
			atts = MSGUTIL.getElementAttributes( target );
			styles = target.getAttribute('style');
			return this.createRemoveTagAct( id, tag, targetId, index, offset, styles, atts );
		}
	},
	createInsertTaskAct : function (target, index, length, uuid, taskId)
	{
		var act = {};
		var rAct = {};
		act.t = MSGUTIL.actType.insertTask;
		act.tid = target;
		act.idx = index;
		act.len = length;
		rAct.t = MSGUTIL.actType.deleteTask;
		rAct.tid = target;
		rAct.idx = index;
		rAct.len = length;
		if ( uuid != null ) {
			act.uuid = uuid;
			rAct.uuid = uuid;
		}
		if ( taskId != null ) {
			act.tsk = taskId;
			rAct.tsk = taskId;
		}
		return { "act" : act, "rAct" : rAct }; 
	},
	createUpdateTaskAct : function (uuid, taskId, cachedTask)
	{
		var act = {};
		var rAct = {};
		act.t = MSGUTIL.actType.updateTask;
		rAct.t = MSGUTIL.actType.updateTask;
		if ( uuid != null ) {
			act.uuid = uuid;
			rAct.uuid = uuid;
		}
		if ( taskId != null ) {
			act.tsk = taskId;
			rAct.tsk = taskId;
		}
		if ( cachedTask != null ) {
			act.cachedTask = cachedTask;
			rAct.cachedTask = cachedTask;
		}
		rAct.revert = true;
		return { "act" : act, "rAct" : rAct }; 
	},
	createDeleteTaskAct : function (target, index, length, uuid, taskId, refId)
	{
		var act = {};
		var rAct = {};
		act.t = MSGUTIL.actType.deleteTask;
		act.tid = target;
		act.idx = index;
		act.len = length;
		
		rAct.t = MSGUTIL.actType.createTask;
		rAct.tid = target;
		rAct.idx = index;
		rAct.len = length;
		if ( uuid != null ) {
			act.uuid = uuid;
			rAct.uuid = uuid;
		}
		if ( taskId != null ) {
			act.tsk = taskId;
			rAct.tsk = taskId;
		}
		if (refId != null)
		{
			act.rid = refId;
			rAct.rid = refId;
		}
		return { "act" : act, "rAct" : rAct }; 
	},
//internal action generation functions

	_createInsertTextAct : function(sIdx, eIdx, target, joinNode)
	{
		if(eIdx - sIdx <= 0)
			return null;
			
		var act= {};		
		var id;
		if ( typeof target == 'string' )
		{
			id = target;
			var editor = window['pe'].scene.getEditor();
			var targetDoc = editor.document.$;
			target = targetDoc.getElementById(id);
			if(target)
				target = new CKEDITOR.dom.element(targetDoc.getElementById(id)); 
		}
		else
			id = target.getId();
		
		act.tid = joinNode ? joinNode.getId() : id;	// target id
		
		act.idx = joinNode? MSGUTIL.getPureText(joinNode).length : sIdx;	// index
		act.t = MSGUTIL.actType.insertText;	// type
		act.len = eIdx - sIdx;				// length
		
		var nodelist = [];
		if(target)
		{
			var cloneTarget;
			//concord tab image doesn't have src
			if (target.$.querySelector("img[src]")){
				cloneTarget = target.clone(true,true);
				concord.text.tools.resetImageSrcAttribute(cloneTarget.$);
			}else{
				cloneTarget = target;
			}
			
			nodelist = this.getContentsFromNode(cloneTarget, sIdx, eIdx - sIdx, nodelist, joinNode);
		}
			
		delete nodelist.compareSibling;
		delete nodelist.ignorePos;		
		if (nodelist && nodelist.length > 0)
		{
			for (var i = 0; i<nodelist.length; i++)
			{
				if (nodelist[i].t != null)
				{
					nodelist[i].t = nodelist[i].t.replace( /\u200B/g, '' );
				}
				if (nodelist[i].e != null)
				{
					nodelist[i].e = nodelist[i].e.replace( /\u200B/g, '' );
				}
			}
			act.cnt = nodelist;	// content
		}
		else
		{
			//console.log('Can not get content from: ' + sIdx + ' to ' + eIdx + ' in node id: ' + id + ' cnt: ' + (target ? target.getOuterHtml() : 'Empty node'));
			return null;
		}
		
		return act;
	},
	
	_createDeleteTextAct : function(sIdx,eIdx,target)
	{
		if(eIdx - sIdx <= 0)
			return null;
			
		var rAct = {};
		var act= {};	
		var id;
		if ( typeof target == 'string' )
			id = target;
		else
			id = target.getId();
		act.tid = id;							// target id
		act.t = MSGUTIL.actType.deleteText;		// type
		act.idx = sIdx;							// index
		act.len = eIdx - sIdx;					// length
		
		return act;
	},

	_createInsertStyleElementAct : function(index,target,node)
	{
		var act= {};		
		act.t = MSGUTIL.actType.insertStyleElement;		// type
		if(typeof target == 'string')
			act.tid = target;
		else
			act.tid = target.getId();
		act.idx = index;
			
		// TODO remove isBlock?
		act.isb = true;						// is block
		
		var cloneNode = node;
		var tmpStr = cloneNode.getOuterHtml();		
		tmpStr = tmpStr.replace(/\r\n|\u200B/g,'');
		act.s = tmpStr;							// string
		// TODO remove length?
		act.len = tmpStr.length;				// length
		return act;
	},

	_createDeleteStyleElementAct : function(index, length, target, deleteNodes)
	{
		if(length < 0)
			return null;
			
		var act = {};
		var id;
		if ( typeof target == 'string' )
			id = target;
		else
			id = target.getId();
		
		act.tid = id;
		act.t = MSGUTIL.actType.deleteStyleElement;		// type
		act.idx = index;
		act.len = length;						// length
		act.isb = true;			// is block
		
		//get contained node id list by deleteNodes
		act.elist = [];
		for(var i = 0; i < deleteNodes.length; i++)
		{
			var id;
			if(typeof deleteNodes[i] == 'string')
			{
				id = deleteNodes[i];
				act.elist[act.elist.length]=id;
				continue;
			}
			else
			{
				id = deleteNodes[i].getId();
				if (id != null)
					act.elist[act.elist.length]=id;		
			}
			
			var nodeList = deleteNodes[i].$.querySelectorAll("[id]");
			for (var j=0; j<nodeList.length; j++)
			{
				act.elist[act.elist.length]=nodeList[j].id;
			}
		}

		return act;	
	},

	_createInsertElementAct : function(index,target,node, keep8203)
	{
		var act= {};		
		act.t = MSGUTIL.actType.insertElement;		// type
		if(typeof target == 'string')
			act.tid = target;
		else
			act.tid = target.getId();
		act.idx = index;
			
		// TODO remove isBlock?
		act.isb = true;						// is block
		
		//
		/*if(!CKEDITOR.env.ie )
		{
			nde = node.clone(true,true);
			var last = node.getLast();
			last && last.is && last.is('br') && last.remove();
		}*/
		var cloneNode = node;
		if(!window.g_presentationMode && node.$.querySelector('img'))
		{
			var cloneNode = node.clone(true,true);
			concord.text.tools.resetImageSrcAttribute(cloneNode.$);
		}
		var tmpStr;
		if (node.ignoreMarknode || window.g_presentationMode ){
			tmpStr = cloneNode.getOuterHtml();
		}else{
			tmpStr = this.filterMarkNode(cloneNode);
		}
		if(keep8203 && window.g_presentationMode){
			tmpStr = tmpStr.replace(/\r\n/g,'');
		}else{
			tmpStr = tmpStr.replace(/\r\n|\u200B/g,'');
		}
		act.s = tmpStr;							// string
		// TODO remove length?
		act.len = tmpStr.length;				// length
		return act;
	},

	_createDeleteElementAct : function(index, length, target, deleteNodes)
	{
		if(length < 0)
			return null;
			
		var act = {};
		var id;
		if ( typeof target == 'string' )
			id = target;
		else
			id = target.getId();
		
		act.tid = id;
		act.t = MSGUTIL.actType.deleteElement;		// type
		act.idx = index;
		act.len = length;						// length
		act.isb = true;			// is block
		//get contained node id list by deleteNodes
		act.elist = [];
		for(var i = 0; i < deleteNodes.length; i++)
		{
			var id;
			if(typeof deleteNodes[i] == 'string')
			{
				id = deleteNodes[i];
				act.elist[act.elist.length]=id;
				continue;
			}
			else
			{
				id = deleteNodes[i].getId();
				if (id != null)
					act.elist[act.elist.length]=id;		
			}
			
			var nodeList = deleteNodes[i].$.querySelectorAll("[id]");
			for (var j=0; j<nodeList.length; j++)
			{
				act.elist[act.elist.length]=nodeList[j].id;
			}
		}
		//
		
		return act;	
	},
	createUpdateListValueAct:function(list,listinfo, forceFromHeader)
	{
		var tid = list.getId();
		list = pe.lotusEditor.document.getById(tid);
		if( listinfo ==null){
			listinfo =LISTUTIL.getWholeListInfo(list);
		}
		var lists =listinfo.lists;
		var lids = [];
		var currentIndex = listinfo.currentIndex;
		for(var i = currentIndex;i< lists.length;i++){
			lids.push(lists[i].getId());
		}
		
		var act = this._createUpdateListValueAct(list,lids, forceFromHeader);		
		var rAct=  this._createUpdateListValueAct(list,lids, forceFromHeader);
		return {"act": act, "rAct": rAct};
	},
	_createUpdateListValueAct:function(list,lids, forceFromHeader){
		var act={};
		act.tid = list.getId();
		act.t = MSGUTIL.actType.UpdateListValue;
		act.lids = lids||[];
		act.force = forceFromHeader ? true : false;
//		act.lid=(li&&li.getId())||"";
//		act.lt=type||"";
		return act;
	},
	createChangeListTypeAct:function(listParentNode){
		var act = this._createChangeListTypeAct(listParentNode);
		var rAct=  this._createChangeListTypeAct(listParentNode);
		return {"act": act, "rAct": rAct};
	},
	_createChangeListTypeAct:function(listParentNode){
		var act={};
		act.tid = parentNode.getId();
		act.t = MSGUTIL.actType.ChangeListType;
		return act;
	},
	createUpdateHeaderFooterAct:function(target){
		var id;
		if ( typeof target == 'string' )
			id = target;
		else
			id = target.getId();
		var act={};
		act.tid = id;
		act.t = MSGUTIL.actType.updateHeaderFooter;	
		var rAct={};
		rAct.tid = id;
		rAct.t = MSGUTIL.actType.updateHeaderFooter;
		return {"act": act, "rAct": rAct};
	},
	/* Get content information from node
	 * @name SyncMsg.getContentsFromNode 
	 * @function
	 * @param CKEDITOR.dom.node
	 * @param the absolute index in pure text 
	 * @param the content's length
	 * @returns return the content in the node from start index with length
	 * @example
	 *	var element = CKEDITOR.dom.element.createFromHtml("<p>ABC<strong>123</strong>DEF</p>");
	 *  var contents = getContentsFromNode(element, 2, 3);	// The node list
	 *  alert(contents.length)		// 2
	 *  alert( contents[0].t );		// C
	 *  alert( contents[1].e );		// <strong>12</strong>
	 *  alert( contents[1].type );	// Internal
	 *  
	 * Four types of element insert position: Internal, Append, After, Break;
	 *	<p>AB<strong>123</strong>DE</p>
	 *	Type Internal, getContentsFromNode(element, 2, 3), return "<strong>123</strong>" and type is 0
	 *	Insert the element as the text's sibling
	 *
	 *	<p>AB<strong>123<em>45<strike>67</strike><strike>89</strike></em></strong>DE</p>
	 *	Type Append, getContentsFromNode(element, 9, 2), return "<strike>89</strike>" and type is 1
	 *	Insert the element as the text parent's sibling
	 *
	 *	<p>AB<strong>123<em>45<strike>67</strike></em><strike>89</strike></strong>DE</p>
	 *	Type After, getContentsFromNode(element, 9, 2), return "<strike>89</strike>" and type is 2
	 *	Insert element as the text ascendant's sibling
	 *
	 *	<p>AB<strong>123</strong><em>45</em><strong>67</strong>DE</p>
	 *	Type Break, getContentsFromNode(element, 5, 2), return "<em>45</em>" and type is -1
	 *	Break style before insert element. The element and previous/after sibling's common parent is block.
	 */
	
	_getInsertPos : function(compareSibling, targetNode)
	{
		var insertPos = 0;		
		
		var commonAncestor = compareSibling.getCommonAncestor(targetNode);
		// When their common ancestor is block element, should break style.
		var isBlock = MSGUTIL.isBlock(commonAncestor);
		if(isBlock)
		{	
			// Two sibling text node for input with selection 
			if(compareSibling.type == CKEDITOR.NODE_TEXT && targetNode.type == CKEDITOR.NODE_TEXT && compareSibling.getParent().equals(targetNode.getParent()))
				{
				insertPos = 0;
				}
			// Common ancestor is block and parent is block
			else if(!compareSibling.getParent().equals(commonAncestor) || targetNode.type == CKEDITOR.NODE_TEXT )				
				insertPos = -1;			
		}
		else if( !compareSibling.getParent().equals( commonAncestor ) )
		{
			/*while( !compareSibling.getParent().equals( commonAncestor ))
			{
				insertPos ++;
				compareSibling = compareSibling.getParent();
			}*/
			
			insertPos = 1;
		}
		return insertPos;
	},
	
	// Ensure all acts have same insert position.
	getContentsFromNode : function(node, index, length, contents, joinNode)
	{
		// -1 break, 0 sibling, 1 parent's sibling, 2 parent's parent's sibling ....
		var contents = contents || [];
				
//		if(length == 0)
//			return contents;
//			
		if(node.type == CKEDITOR.NODE_TEXT)
		{
			if(length == 0)
			{
				if(!contents.compareSibling)
					contents.compareSibling = node;	// Compare its parent with element's parent to get element's insert position.
				return contents;
			}
								
			// Text type
			var content = {};
			content.t = node.getText().replace(/\u200B/g, '' ).substring(index, index + length);
			
			var insertPos = joinNode ? -1 : 0;			
			if(!contents.compareSibling)
				contents.compareSibling = node;	// Compare its parent with element's parent to get element's insert position.
			else if( !contents.ignorePos)
			{
				insertPos = this._getInsertPos(contents.compareSibling, node);
			}
			
			content.ip = insertPos;
			contents.push(content);
		}
		else if(node.type == CKEDITOR.NODE_ELEMENT && !MSGUTIL.isNullBr(node) )
		{
			var childCnt = node.getChildCount();
			// img
			if(childCnt == 0 && !contents.compareSibling)
				contents.compareSibling = node;	// Compare its parent with element's parent to get element's insert position.
			
			for (var i=0; i < childCnt; i++)
			{
				var child = node.getChild(i);
				if (child.type == CKEDITOR.NODE_ELEMENT && (MSGUTIL.isNullBr(child) || ( child.is('span') && child.getChildCount() == 0) ))
					continue;
				
				var textLen = MSGUTIL.getPureText(child).length;
				//#9468
				if( i==0 && textLen == 0 )
					continue;
				
				if(textLen >= index)
				{				
					if(index == 0)
					{
						var content = {};
						if(textLen <= length)
						{								
							if(child.type == CKEDITOR.NODE_TEXT)
							{
								if(textLen == 0)
									continue;
								content.t = child.getText();
							}
							else{
								var name = child.getName();
								if (name != "sc_start" && name != "sc_end"){
									content.e = child.getOuterHtml();	
								}else{
									if (textLen==0) continue;
									content.t = child.getText();
								}
							}					
																										
						}
						else
						{								
							if(child.type == CKEDITOR.NODE_TEXT)
								content.t = child.substring(index, index + length);
							else	
							{	
								// Avoid to generate ID for no id element in clone function.
								var wrapper = child.clone(false, true);
								if( wrapper.getAttribute("id"))
									wrapper.setAttribute("id", MSGUTIL.getUUID());
								
								var internals = [];
								internals.ignorePos = true;
								this.getContentsFromNode(child, 0, length, internals);
								for(var j = 0; j < internals.length; j++)
								{	
									var internal = internals[j];
									if(internal.t)
									{
										var textNode = new CKEDITOR.dom.text(internal.t); 
										wrapper.append(textNode);
									}
									else if(internal.e)
									{
										var element = new CKEDITOR.dom.element.createFromHtml(internal.e);
										wrapper.append(element);
									}												
								}									
								content.e = wrapper.getOuterHtml();																	
							}																
						}

						var insertPos = joinNode ? -1 : 0;
						if(contents.compareSibling && !contents.ignorePos)
						{
							insertPos = this._getInsertPos(contents.compareSibling, child);
							if( insertPos == 1 && child.type == CKEDITOR.NODE_TEXT )
							{ //insert is not continue
								var base_node = contents.compareSibling.getCommonAncestor(child);
								base_node = base_node.clone();
								base_node.setText( content.t );
								content.e = base_node.getOuterHtml();
								insertPos = -1;
								delete content.t;
							}
							contents.compareSibling = child;
						}
						else if(!contents.compareSibling && index == 0 /*&& child.type == CKEDITOR.NODE_ELEMENT*/)	
							insertPos = -1; // If the insert content is the first element	
						/*else if(!contents.compareSibling && index == 0 && child.type == CKEDITOR.NODE_TEXT )
						{
							var next = child.getNext();
							if(next && MSGUTIL.isFieldElement(next))	
								insertPos = -1; // If the insert content is text node and next sibling is a field element.	
						}*/
						content.ip = insertPos;
						contents.push(content);
					}
					else							
					{							
						this.getContentsFromNode(child, index, Math.min(textLen - index, length), contents, joinNode);
					}					
					
					length -= textLen - index;
					if(length <= 0)
						break;
					index = 0;									
				}
				else
					index -= textLen;
			}
		}
		
		return contents;
	},
	beginRecord:function()
	{
		if( !this.msgsLevel ) this.msgsLevel = [];
		this.msgsLevel.push([]);
		this.sendMessage = function(msgs){
			var i = this.msgsLevel.length-1;
			var current = this.msgsLevel[i];
			this.msgsLevel[i] = current.concat(msgs);
		};
	},
	endRecord:function()
	{
		var msgs = this.msgsLevel.pop();
		if( this.msgsLevel.length == 0 || (this.msgsLevel.length == 1 && msgs.length == 0))
			delete this.sendMessage;
		return msgs;
	},
	/* track element attributes and styles change
	 * @param CKEDITOR.dom.Element e
	 */
	 beginTrackAttributes:function (e)
	 {
	 	if( e )
	 	{
		 	e.tmp_styles = {};
		 	e.tmp_attributes = {}; 
		 	e.tmp_oldstyles = {};
		 	e.tmp_oldatts = {};
		 	e._restore_oldStyles = function ( n )
		 	{
		 		if( !MSGUTIL.isStyleExist( this.tmp_oldstyles, n ) )
		 			this.tmp_oldstyles[n] = this.getStyle(n);
		 	};
		 	e._remove_Style = function ( n )
		 	{
		 		this.tmp_styles[n]="";
				if( n == "margin")
				{
					this.tmp_styles["margin-left"]="";
					this.tmp_styles["margin-top"]="";
					this.tmp_styles["margin-bottom"]="";
					this.tmp_styles["margin-right"]="";
				}
				if( n == "border")
				{
					this.tmp_styles["border-left"]="";
					this.tmp_styles["border-top"]="";
					this.tmp_styles["border-bottom"]="";
					this.tmp_styles["border-right"]="";
					this.tmp_styles["border-width"]="";
					this.tmp_styles["border-style"]="";
				}
				if( n == "border-width")
				{
					this.tmp_styles["border-left"]="";
					this.tmp_styles["border-top"]="";
					this.tmp_styles["border-bottom"]="";
					this.tmp_styles["border-right"]="";
				}

		 	};
		 	
		 	e.setStyle = function( name,value )
		 	{
		 		var n = name.toLowerCase();
		 		name = n;
		 		if( ( n == "border-width" || n== "border-style") && this.getStyle('border')!='')
		 			n = "border";
		 		this._restore_oldStyles(n);
		 		CKEDITOR.dom.element.prototype.setStyle.call(this,name,value);	
		 		if( name != n)
		 		//#45424: Change border for a converted image, then refresh, the border changed to the original one
		 		 //the image has border style "4pt solid #ff3366"
		 			value = this.getStyle(n);				
				this.tmp_styles[n]=value;
		 	};
		 	
		 	e.removeStyle = function( name )
		 	{
		 		var n = name.toLowerCase();
		 		this._restore_oldStyles(n);
		 		CKEDITOR.dom.element.prototype.removeStyle.call(this,name);	 		
				this._remove_Style(n);
		 	};
		 	
	
		 	e.setAttribute = function( name, value )
		 	{
		 		var n = name.toLowerCase();
		 		if( n == 'style')
		 		{	 	
		 			if(value == "")
		 				return this.removeAttribute(n);
		
		 			var oldstyles = MSGUTIL.getStyleParas(this.getAttribute(n)||'');
					for( var old in oldstyles)
					{
						this._restore_oldStyles(old);
						this.tmp_styles[old]="";
					}
					var newstyles = MSGUTIL.getStyleParas(value);;
					for( var style in newstyles )
					{
						e._restore_oldStyles( style );
						this.tmp_styles[style] = newstyles[style];
					}
		 		}
		 		else
		 		{
		 			if(this.tmp_oldatts[n]== null )
		 				this.tmp_oldatts[n] = this.getAttribute(n);
		 			if( this.tmp_oldatts[n] == null ) this.tmp_oldatts[n]= "";
		 			this.tmp_attributes[n]=value;
		 			if( this.tmp_oldatts[n] == value )
		 			{
		 				delete this.tmp_oldatts[n];
		 				delete this.tmp_attributes[n];
		 			}
		 		}
		 		if( value == "")
		 		//#46300: [IE]HSpace in image properties shows -1 after changing HSpace to 0.
		 		//in IE if the attribute name is hspace, then setAttribute( 'hspace',"") will set 
		 		//hspace to "-1".
		 			CKEDITOR.dom.element.prototype.removeAttribute.call(this,n);
		 		else
		 			CKEDITOR.dom.element.prototype.setAttribute.call(this,n,value);
			
				
		 	};
		 	e.replaceStyle=function(newStyle){
		 		var name="style";
				var value=newStyle;
				var n = name.toLowerCase();
				
				if(this.tmp_oldatts[n]== null )
		 				this.tmp_oldatts[n] = this.getAttribute(n);
		 		if( this.tmp_oldatts[n] == null ) this.tmp_oldatts[n]= "";
		 		this.tmp_attributes[n]=value;
		 		if( this.tmp_oldatts[n] == value )
		 		{
		 			delete this.tmp_oldatts[n];
		 			delete this.tmp_attributes[n];
		 		}
				CKEDITOR.dom.element.prototype.setAttribute.call(this,n,value);
		 	};
			e.clearStyle=function(){
				var name="style";
				var value="";
				var n = name.toLowerCase();
				
				if(this.tmp_oldatts[n]== null )
		 				this.tmp_oldatts[n] = this.getAttribute(n);
		 		if( this.tmp_oldatts[n] == null ) this.tmp_oldatts[n]= "";
		 		this.tmp_attributes[n]=value;
		 		if( this.tmp_oldatts[n] == value )
		 		{
		 			delete this.tmp_oldatts[n];
		 			delete this.tmp_attributes[n];
		 		}
				CKEDITOR.dom.element.prototype.setAttribute.call(this,n,value);
			};
			e.appendStyle=function(addStyle){
				var name="style";
				var n = name.toLowerCase();
				var value
				var attributeValue=this.getAttribute(n);
				
				if (attributeValue == null) {
					value = addStyle;
				}else {
					var lastIdx=attributeValue.lastIndexOf(";");
					if (lastIdx != attributeValue.length) {
						value = attributeValue + "; " + addStyle;
					}
					else {
						value = attributeValue + addStyle;
					}
				}
				if(this.tmp_oldatts[n]== null )
		 				this.tmp_oldatts[n] = this.getAttribute(n);
		 		if( this.tmp_oldatts[n] == null ) this.tmp_oldatts[n]= "";
				
			
		 		this.tmp_attributes[n]=value;
		 		if( this.tmp_oldatts[n] == value )
		 		{
		 			delete this.tmp_oldatts[n];
		 			delete this.tmp_attributes[n];
		 		}
				CKEDITOR.dom.element.prototype.setAttribute.call(this,n,value);
			};
		 	e.removeAttribute = function(name)
		 	{
		 		var n = name.toLowerCase();
				if( n == 'style' )
				{
					var oldstyles = MSGUTIL.getStyleParas(this.getAttribute(n)||'');
					for( var old in oldstyles)
					{
						this._restore_oldStyles(old);
						this._remove_Style(old);
					}
				}
				else
				{
					return this.setAttribute( name,"");
				}
		 		CKEDITOR.dom.element.prototype.removeAttribute.call(this,n);
		 		
		 	};
		 	
		 	e.addClass = function(className )		 	
		 	{		 		
		 		var n = 'class';
		 		if( this.tmp_oldatts[n] == null )
		 			this.tmp_oldatts[n] = this.getAttribute(n)||"";
		 		CKEDITOR.dom.element.prototype.addClass.call(this,className);
		 		this.tmp_attributes[n]=this.getAttribute(n)||"";//#36943
		 	};
		 	
		 	e.removeClass = function(className)
		 	{
		 		var n = 'class';
		 		if( this.tmp_oldatts[n] == null )
		 			this.tmp_oldatts[n] = this.getAttribute(n)||"";
		 		CKEDITOR.dom.element.prototype.removeClass.call(this,className);
		 		this.tmp_attributes[n]=this.getAttribute(n)||"";//#36943
		 	}
	 	}
	 	return e;
	 },
	 endTrackAttributes:function(e)
	 {
	 	if( e )
	 	{
	 		function isEqual( ob1, ob2 )
	 		{
	 			return dojo.toJson(ob1) == dojo.toJson(ob2);
	 		};
	 		if( !isEqual( e.tmp_styles, e.tmp_oldstyles ) || !isEqual( e.tmp_attributes, e.tmp_oldatts ) )
	 		{
		 		var act = this.createAttributeAct( e.getId(),e.tmp_attributes,e.tmp_styles,e.tmp_oldatts, e.tmp_oldstyles );
				var msg = this.createMessage(MSGUTIL.msgType.Attribute,[act]);
				this.sendMessage([msg]);
	 		}   
		 	delete e.tmp_styles;
		 	delete e.tmp_attributes;
		 	delete e.tmp_oldstyles;
		 	delete e.tmp_oldatts;
		 	delete e.setStyle; 		 	
		 	delete e.removeStyle;		 	
		 	delete e.setAttribute;	 		 	
		 	delete e.removeAttribute;		 	
		 	delete e.addClass;		 	
		 	delete e.removeClass;
		 	delete e._restore_oldStyles;
		 	delete e._remove_Style;
	 	}
	 },
	 //TODO:: filterMarkNode is slow if node is a very large table
	 filterMarkNode : function (node)
	 {
		if(typeof node == 'string')
			return node;
		else
		{
			var editor = window['pe'].scene.getEditor();
			var cNode = node.clone(true,true);
			//remove selected cell's class
			//#25516 
			var nodes = new CKEDITOR.dom.nodeList(dojo.query(
					'td.selectedSTCell', cNode.$));
			var count = nodes.count(), cell;
			for ( var i = 0; i < count; i++) {
				cell = nodes.getItem(i);
				cell.removeClass("selectedSTCell");
			}
			//
			 
			var destroyClone = false;
			if(editor.spellchecker)
				editor.spellchecker.resetOneNode(cNode.$, false);
			else
				destroyClone = true;
			
			var tmpStr = cNode.getOuterHtml();
			
			
			 // book mark
			tmpStr = tmpStr.replace(/<span[^>]+_fck_bookmark.*?\/span>/gi,'');
			//D41774 destroy clone after usage to avoid memory leak
			if(destroyClone){
				dojo.destroy(cNode.$);
				cNode.$=null;
			}
			return tmpStr;
		}				
	 }
});

(function(){	
	if(typeof SYNCMSG == "undefined")
		SYNCMSG = new concord.text.SyncMsg();	
})();

