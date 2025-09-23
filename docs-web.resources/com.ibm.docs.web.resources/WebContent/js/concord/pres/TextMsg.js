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

dojo.provide("concord.pres.TextMsg");

dojo.require("concord.text.TextMsg");
dojo.require("concord.pres.ProcMsg");

dojo.declare("concord.pres.TextMsg", concord.text.TextMsg, {
	
	_documents: null,

	handleInput : function(ckEditor, isVisibleKey){
		//this.preInput(ckEditor);
		this._postInput(ckEditor, isVisibleKey);
	},
	
	preInput : function(ckEditor){
		
	},

	_postInput : function(ckEditor, isVisibleKey)
	{
		//console.log("------------------- _postInput");
		this._msgPairs = [];
		//For presentation. We need to merge any msgPair waiting on the CKEDITOR.msgPair entry. 
		//This entry exist when entering edit mode on  a default text box for the first time.
		//We need to merge this message with the first character typed for undo/redo purposes
		if (ckEditor.newBox != undefined  && ckEditor.newBox!=null && ckEditor.newBox) {
			//Let's handle nbsp that exists on entering edit mode
			//D27196: [Regression][Co-editing][Safari][Chrome]Failed to input first character in placeholder
			var TEXTMSG = this;
			setTimeout(function(){					 
				TEXTMSG.handleNBSP(ckEditor);
			},TEXTMSG,10);			
			ckEditor.newBox = false;
			// D13833 when a new box is double clicked and nbsp is highlighted ctrlA flag is turned on by PresCKUtil.fixRange()
			// turn it off since there is already code that specifically handles default contentBoxes
			// TODO for now turn off on Safari and Chrome only ... other browsers later
			if ( dojo.isWebKit){
				ckEditor.ctrlA = false;
			}
		} else {//Let flow as usual i.e let it added to the undo queue and send coedit message 
		    this.handleNBSP_keepme( ckEditor, isVisibleKey );
		}
		delete ckEditor.enterPending;
	},	
	
	
	
	//
	// Handles processing the parked message pairs list 
	//
	processParkedMessage: function(_msgPairs,cb,sndCoedit,undoMsgId,pre,post,node){
		var ckEditor = cb.editor;
		ckEditor.newBox = false;
		if (typeof ckEditor.parkedMsgPairList!=undefined && ckEditor.parkedMsgPairList !=null && ckEditor.parkedMsgPairList.length >0){		
			
			//1-  Set addToUndo=false on coedit message (we will add to undo queue as part of merged list in step 5 below)
			var addToUndo = false;
			_msgPairs[0] = SYNCMSG.addUndoFlag(_msgPairs[0],addToUndo); 
			//2- Send Coedit of the new character input only
			var msgPairList;
			if (!sndCoedit) msgPairList = SYNCMSG.sendMessage(_msgPairs, SYNCMSG.SYNC_BOTH,true,undoMsgId,false);	
			msgPairList = cb.makeUndoRedoMsgForPTT(pre,post,node,msgPairList.msgList,msgPairList.rMsgList);
			//3- Add the merged list to the undo queue
			var msgList = [];
			var rMsgList = [];//1- merge with Parked 	
			while (ckEditor.parkedMsgPairList.length >0 )
			{
				var parkedmsg = ckEditor.parkedMsgPairList.shift();
				var msg = parkedmsg.msg;
				var rMsg = parkedmsg.rMsg;
				try{

					if(msg.updates!=null && msg.updates.length <= 0)
						continue;
				}catch(e){
					console.log(e);
				}
				
				msgList.push(msg);
				rMsgList.push(rMsg);
			}
			//4- clear the park
			if(ckEditor.parkedMsgPairList && ckEditor.parkedMsgPairList.length == 0)
				delete ckEditor.parkedMsgPairList;
			msgList = msgList.concat(msgPairList.msgList);
			rMsgList = rMsgList.concat(msgPairList.rMsgList);
			//5 - record undo stack
			PresCKUtil.normalizeMsgSeq(msgList,rMsgList,undoMsgId);
		}			
	},
	
	/**
	 * This function called in coediting.keyup, to clear internal use 8203.
	 * @param editor
	 * @param event
	 */
	handlePostInput: function(editor, event){
		var sel = editor.getSelection();
		var range = sel.getRanges()[0];
		
		if(!range)
			return;

		var removeInvisibleChar = dojo.hitch(this, function(node){
			if(!PresCKUtil.checkNodeName(node, 'span'))
				return;
			var txt = node.getText();
			var len = txt.length;
			if (len >= 2) {
				//for Safari issue happens when co-editing because the node.$.innerHTML will be &nbsp; 
				var tmpS = txt;
				var removed = false;
				
				if(txt.charCodeAt(0) === 8203){
					node.setText(tmpS.substring(1));
					removed = true;
				}else if(txt.charCodeAt(len - 1) === 8203){
					node.setText(tmpS.substring(0, len - 1));
					removed = true;
				}
				if (removed) {
					var retString = TEXTMSG.getTextContent(node.$);
					//For the frist node, the first character should not be ' ', it must be '&nbsp;'
					//32 is ' ',160 is '&nbsp;'
					if((node.getIndex() == 0)&&(retString.charCodeAt(0) == 32))
					{
						retString = String.fromCharCode(160) + retString.substring(1, retString.length);
						node.setHtml(retString);
					}
					
					
					var range = new CKEDITOR.dom.range(editor.document);
					range.setStartAt(node, CKEDITOR.POSITION_BEFORE_END);
					range.setEndAt(node, CKEDITOR.POSITION_BEFORE_END);
					range.collapse(true);
					range.select();
				}
			}
		});
		
		if(range.collapse){
			var touchNode = range.startContainer;
			if(touchNode.type == CKEDITOR.NODE_TEXT){
				touchNode = touchNode.getParent();
			}
			removeInvisibleChar(touchNode);
		}else{
			
			//iterate node between touchSNode and touchENode, 
			var touchSNode = range.getTouchedStartNode(),
			touchENode = range.getTouchedEndNode();
			touchENode = touchENode.getNextSourceNode(true, CKEDITOR.NODE_ELEMENT);
			var next = touchSNode.getNextSourceNode(true, CKEDITOR.NODE_ELEMENT, touchENode);
			while(next){
				removeInvisibleChar(next);
				next = next.getNextSourceNode(true, CKEDITOR.NODE_ELEMENT, touchENode);
			}
		}
		PresCKUtil.removeAppleStyleSpan(editor);
	},

	
	/**
	 * Remove leading '&nbsp;' and move the cursor after first character
	 * Note: uses the current cursor position
	 */
    handleNBSP_keepme: function(ckEditor, isVisibleKey) {
        var dfChild = null,
            tableCell = null,
            handled = false;
        var selection = ckEditor.getSelection();
        var range = selection.getRanges()[0];
        // only do this for collapsed ranges,
        //14821, for some reason, in IE, when we have a selection (highlight across spans), range.collapsed is true, so we need to 
        //14821, do extra check if start container the same as end container
        //if ( !range.collapsed || (range.startContainer!=range.endContainer))
        if (!range || !range.collapsed)
            return;
        var selectedCell = range.startContainer.getAscendant( { 'td':1, 'th':1 }, true );
        if ( selectedCell ) {
            tableCell = selectedCell.$;
        }

        var dfChildCK = range.startContainer.getAscendant( { 'p':1, 'li':1 }, true );
        if ( !dfChildCK )
            return;
        dfChild = dfChildCK.$; // use the DOM node for the rest
        var spanToMoveCursor = null;
        if (PresCKUtil.checkNodeName(dfChild, 'p', 'li')) {
            //Now we have the p or li let's loop through the span        	
            for (var i = 0; i < dfChild.childNodes.length; i++) {
                var span = dfChild.childNodes[i];
                if (PresCKUtil.checkNodeName(span,'span')) {
                	//D16568 - We have already processed the first span and determined where to place the cursor
                	// any subsequent empty spans should be removed 
                	var textContent = this.getTextContent(span);  
                	var styleInfo = CKEDITOR.dom.node(span).getAttribute('style');
                	if (i>0 && spanToMoveCursor!=null && !this.hasTxt(textContent,true) && styleInfo==null){
                		dojo.destroy(span);
						i=i-1;
                	}
                	// D11412 - make sure we get to the inner-most SPAN                	
                    while ( span.firstChild && span.firstChild.nodeName.toLowerCase() == 'span' )
                        span = span.firstChild;
                    textContent = this.getTextContent(span);                    
                    
                    if ( textContent.length == 0 && span.firstChild || ( textContent.length == 1 && !this.hasTxt(textContent,true) ) ) { //this is an nbsp
                        // remove the text nodes but keep the SPAN (with its correct style info)
                    	// If the break is a text line break though do not delete
                    	// Text line breaks can be generated using shift-enter
                        if (span.firstChild && !dojo.hasClass(span.firstChild, 'text_line-break')) {
                        	handled = true;
                        	//14821
                        	//The flow comes to this point (destroying the nbsp) only when there is an empty span in the beginning (first child) of the p or li
                        	//If the cursor is in the span, we need to put the cursor back in the span so we need to get a handle of the span to be used in 
                        	//moveToEndOfRange function call below.
                     
                        	//14821, in IE and Safari, startContainer is a text node, need to adjust the moveToEndOfRange node to the span, not the p
                        	//when having cursor at the beginning of the textbox with text (in front of the text), and choose color picker
                        	//it creates a empty span with style color set
                        	//when start typing it comes here and we need to adjust the cursor since below we destroy the textnode where the cursor is
                        	//so the cursor doesn't jump to the end of p
                        	if (range.collapsed && range.startContainer!=null && range.endContainer!=null
                        			&& range.startContainer.type == CKEDITOR.NODE_TEXT && range.endContainer.type == CKEDITOR.NODE_TEXT
                        			&& range.startContainer.$ === range.endContainer.$ 
                        			&& range.startContainer.$ === span.firstChild && range.startContainer.getParent()!=null) {
                        		spanToMoveCursor = range.startContainer.getParent(); // to be used for moveToEndOfRange
                        	}
                        	//14405 - if the collapsed range start container is the span, save the span to be used for moveToEndOfRange
                        	else if (range.collapsed 
                        			&& range.startContainer.type == CKEDITOR.NODE_ELEMENT && range.endContainer.type == CKEDITOR.NODE_ELEMENT
                        			&& range.startContainer.$ === range.endContainer.$ && range.startContainer.$ === span) {
                        		spanToMoveCursor = range.startContainer;
                        	}
                        	
	                        while ( span.firstChild ) {
	                        		dojo.destroy( span.firstChild );
	                        }
                        }
                    }
                    // D10864 - if you find *any* text, don't continue
                    else{
                    	//if the key down triggered by an visible key input, then
                    	if(!(isVisibleKey && textContent && (textContent.length === 1) && (textContent.charCodeAt(0) === 8203)))
                    		break;
                    }
                }
            }
        }

        _removeInvisibleCharSpan = function(span) {
            if (!span || !span.$) return;
            var textContent = TEXTMSG.getTextContent(span.$);
            if(isVisibleKey && textContent &&
                (textContent.length === 1) && (textContent.charCodeAt(0) === 8203)){
                //D32691 [Safari][B2B][Regression][Co-editing]Press char, cursor moved to the beginning.
                //So far, don't remove 8203 to avoid cursor issue. so D31370 may reopen for safari, this is a workaround
                if(!dojo.isWebKit || ckEditor.isTable){
                    dojo.destroy(span.$.firstChild);
                    range.moveToElementEditStart( span );
                    range.select();
                }
            }
        };

        // Remove 8203 when input visible chars
        // Just handle it in span level
        // other than in p block. Or all 8203 in all spans of
        // shift enter lines will be removed after an input
        var startContainer = range.startContainer;
        if (PresCKUtil.checkNodeName(startContainer, '#text')) {
            // Get parent span
            var parentSpan = startContainer.getAscendant('span');
            _removeInvisibleCharSpan(parentSpan);
        } else if (PresCKUtil.checkNodeName(startContainer, 'span')) {
            _removeInvisibleCharSpan(startContainer);
        } else if (PresCKUtil.checkNodeName(startContainer, 'li', 'p')) {
            var currentSpan = null;
            if (range.startOffset - 1 >= 0) {
                currentSpan = startContainer.getChild(range.startOffset - 1);
            } else {
                currentSpan = startContainer.getChild(0);
            }
            _removeInvisibleCharSpan(currentSpan);
        }

        /*
         * 14821, this is not needed anymore, we captured this case in the else if above
        //if the range is a collapsed element
        //of zero length then do not continue
        //14405 gjo
        if (range.collapsed 
    			&& range.startContainer.type == CKEDITOR.NODE_ELEMENT && range.endContainer.type == CKEDITOR.NODE_ELEMENT
    			&& range.startContainer.equals(range.endContainer) && range.startContainer.getHtml().length == 0) {
        	handled = false;
    	}
         */
        // nothing to do if no space was handled
        if ( !handled )
            return;
      
        
//        range.moveToElementEditEnd( dfChildCK );
//        range.select();
        //14821, in IE and Safari, cursor was at the span that contained the nbsp text node, need to adjust the moveToEndOfRange node to the span, not the p
    	//so the cursor doesn't jump to the end of p
        if(spanToMoveCursor!=null){
        	//14821-update, trying to bypass the use of moveToEndOfRange that is so complex for what we need to do.
        	//we force the cursor to the span here directly
        	//PresCKUtil.moveToEndOfRange( range, spanToMoveCursor);
        	spanToMoveCursor.setHtml( '&#8203;' );
        	var cursorPos = CKEDITOR.POSITION_AFTER_START;
        	var lastNodeCk = spanToMoveCursor;
            range.setStartAt( lastNodeCk, cursorPos );
            range.setEndAt( lastNodeCk, cursorPos );                 
            range.collapse(true);
            range.select();

        }else{
        	PresCKUtil.moveToEndOfRange(range);
        }
        
         //Now that content is clean let's create new msgPair
        var pNode = dfChildCK.getAscendant( { 'ol':1, 'ul':1, 'p':1 }, true ); //reset ul if an li and reset p if not li
        
        //So now we have the new msgPairs we need to update this._msgPairs
        this._msgPairs = [SYNCMSG.createReplaceNodeMsg(pNode)]; // here we are overwriting the insert text message with the new 'e e' message.   
    },
	
	//
	// Remove leading nbsp and move the cursor after first character
    // @deprecated - port to use handleNBSP_keepme
	//
	handleNBSP: function(ckEditor) {
		if (!ckEditor.isTable) {
			return;         // nbsp only exists for table now
		}

	    // D101227
	    // consider the following scenario:
	    // - user presses enter several times in a new text box
	    // - user starts entering text (without waiting long enough for his session to sync to the server)
	    // the text box is still flagged as new (until the sync happens), so this code (which should
	    // only get called for new text boxes) gets called and messes up the cursor position.
		if ( ckEditor.enterPending ) {
		    // call handleNBSP_keepme instead
		    this.handleNBSP_keepme( ckEditor );
		    return;
		}
		var dfChild = null;
		var tableCell = null;
		if ( !ckEditor.isTable){
			var dfClasses = dojo.query(".draw_frame_classes", ckEditor.document.$.body)[0];
			dfChild = dfClasses.firstChild;
		} else {
			var selection = ckEditor.getSelection();
			var range = selection.getRanges()[0];
			var selectedCell = range.startContainer.getAscendant('td',true) || range.startContainer.getAscendant('th',true);
			if ( selectedCell){
				tableCell = selectedCell.$;
			}
			dfChild = tableCell;
		}
		while (dfChild.nodeName.toLowerCase() != 'p' && dfChild.nodeName.toLowerCase() != 'li'  && dfChild.firstChild) {
			dfChild = dfChild.firstChild;
		}
		if (dfChild.nodeName.toLowerCase() == 'p' || dfChild.nodeName.toLowerCase() == 'li') {
			//Now we have the p or li let's loop through the span
			for (var i=0; i< dfChild.childNodes.length;i++){
				var span = dfChild.childNodes[i];
				if (span.nodeName.toLowerCase() == 'span'){
					var textContent = this.getTextContent(span);
					if (textContent.length==1 && !this.hasTxt(textContent,true)){ //this is an nbsp
						dojo.destroy(span);
						i=i-1;
					}else if (textContent.length>1 && this.hasTxt(textContent,true)){// We expect two characters at this point. The nbsp may be before or after the character
						var firstChar = textContent.charAt(0);
						var lastChar = textContent.charAt(textContent.length-1);
						 if (this.isNbsp(firstChar)){
							 this.setTextContent(span,textContent.substring(1));
						 }else if (this.isNbsp(lastChar)){
							 this.setTextContent(span,textContent.substring(0,textContent.length-1));
						 }	
					}else if (textContent.length==2 && !this.hasTxt(textContent,true)){ //In the case of double space we need to remove one space
						var firstChar = textContent.charAt(0);
						 if (this.isNbsp(firstChar)){
							 this.setTextContent(span,textContent.substring(1));
						 }						
					}
				}			
			}			
		}
		//Let's reposition the cursor after the fist character typed
		var selection = ckEditor.getSelection();
		if ( ckEditor.isTable){
			ckEditor.contentBox.moveCursorPositionToLastNodeOfTableCell( tableCell, selection);
		} else {
			this.moveCursorPositionToLastNode(selection,selection,dfChild);
		}
		
		 //Now that content is clean let's create new msgPair
		var pNode = new CKEDITOR.dom.node((dfChild.nodeName.toLowerCase() == 'li')? dfChild.parentNode :dfChild); //reset ul if an li and reset p if not li
		
		//So now we have the new msgPairs we need to update this._msgPairs
		this._msgPairs = [SYNCMSG.createReplaceNodeMsg(pNode)]; // here we are overwriting the insert text message with the new 'e e' message.	
	},

	getTextContent: function(node){
		var textContent;
		if (dojo.isIE < 9){
			textContent = node.innerText || node.nodeValue || node.textContent;
		}else {
			textContent = node.textContent;
		}
		
		return textContent;
	},
	
	setTextContent: function(node,text){
		if (dojo.isIE < 9){
			node.innerText = text;
		}else{
			node.textContent = text;
		}
	},
	
	isNbsp: function(ch){
		//D27196: [Regression][Co-editing][Safari][Chrome]Failed to input first character in placeholder
		var nbsp = false;
		var chcode = ch.charCodeAt(0);
			if (ch =='' || chcode == 8203 || chcode == 65279){
				nbsp=true;
			}
		return nbsp;
	},
	
	// blankSpace = true: take blank space as text content;
	// blankSpace = false: ingore blank space;
	// e.g. for "<span>&nbsp;<span>", hasTxt(childTxt, true) ==> true; hasTxt(childTxt) ==> false;
	// '\xa0' == "&#160;" or "&#xa0;";
	// Unicode character 0 width space. seen in Safari for ex D9038
	// D15255 Zero width no break space as seen in Safari
	hasTxt:function(childTxt, blankSpace){
		
	    if ( childTxt == null )
	        return false;
		var hasTxt = false;
		var subStr = "";
		var subChar = '';
		for(var i=0;i<childTxt.length;i++){
			subStr = childTxt.substring(i,i+1);
			subChar = childTxt.charCodeAt(i);
			if(subStr == ' ' || subStr == '\xa0'){
				!hasTxt && (hasTxt = blankSpace || false);
			}
			else if(subStr !='' && subChar != 65279){ 
				hasTxt = true;
				break;
			}
		}
		return hasTxt;
	},	
	
    //
    //Move cursor position to node. lastnode is p node
    //
    moveCursorPositionToLastNode: function(selection,editor,lastNode){
        //console.log("moveCursorPositionToLastNode Editor mouse up - Entry");
        if (selection != null && selection.document != null) {
            var range = new CKEDITOR.dom.range(selection.document);

            while (lastNode && lastNode.childNodes && lastNode.childNodes.length > 0)
            	lastNode = lastNode.childNodes[lastNode.childNodes.length-1];
            if (!lastNode)
            	return;
                        
            var cursorPos = CKEDITOR.POSITION_BEFORE_END;
            if (lastNode.nodeName.toLowerCase() == 'br') {
            	if (lastNode.previousSibling) {
            		lastNode = lastNode.previousSibling;    // set the stage to set the range before br
            	} else {
            		cursorPos = CKEDITOR.POSITION_BEFORE_START;
            	}
            }

            var lastNodeCk = new CKEDITOR.dom.node(lastNode);
            range.setStartAt( lastNodeCk, cursorPos );
            range.setEndAt( lastNodeCk, cursorPos );                 
            range.collapse(true);
            selection.selectRanges( [ range ] );
        }
        //console.log("moveCursorPositionToLastNode Editor mouse up - Exit");
    },	
	
	// jmt - this function is obsolete. should delete after test is complete.
	handleDefaultText: function(pNode, proc) {
		this._msgPairs = [];
		
		var act = SYNCMSG.createDeleteTextAct(0, MSGUTIL.getNodeLength(pNode), pNode);
		if(act) {
			this._msgPairs.push(SYNCMSG.createMessage(MSGUTIL.actType.deleteText, [act]));
		}
		
		proc();
		
		act = SYNCMSG.createInsertTextAct(0, MSGUTIL.getNodeLength(pNode), pNode);
		if(act) {
			this._msgPairs.push(SYNCMSG.createMessage(MSGUTIL.actType.insertText, [act]));
		}
		
		SYNCMSG.sendMessage(this._msgPairs);
		
		pe.scene.getEditor().removeUndo();
	},
	
	
	handleDefaultTextNoUndo: function(pNode, proc) {
		this._msgPairs = [];
		
		var act = SYNCMSG.createDeleteTextAct(0, MSGUTIL.getNodeLength(pNode), pNode);
		if(act) {
			this._msgPairs.push(SYNCMSG.createMessage(MSGUTIL.actType.deleteText, [act]));
		}
		
		proc();
		
		act = SYNCMSG.createInsertTextAct(0, MSGUTIL.getNodeLength(pNode), pNode);
		if(act) {
			this._msgPairs.push(SYNCMSG.createMessage(MSGUTIL.actType.insertText, [act]));
		}
		
		
		var newMsgPairList=[];
		for (var i=0; i< this._msgPairs.length; i++){
			var msgPair = dojo.clone(this._msgPairs[i]);			
			msgPair = SYNCMSG.addUndoFlag(msgPair,false); //do not add to q
			newMsgPairList.push(msgPair);						
		}

		SYNCMSG.sendMessage(newMsgPairList);
	},	
	
	handleLayoutDefaultText: function(node, attrName, proc, data) {
		var act = this._handleAttr(node, attrName, proc, data);
		this._msgPairs.push(SYNCMSG.createMessage(MSGUTIL.msgType.cleanLayoutDefaultText, [act]));
		
		SYNCMSG.sendMessage(this._msgPairs, SYNCMSG.SYNC_SORTER);
		
		//console.info('LayoutDefaultText');
	},
	
	handleNodeAttr: function(node, attrName, proc, data, parkMsgPair, editor, msgPairList,sendPark) {		
		var usePark = (sendPark!=undefined && sendPark!=null) ? sendPark : true;
		var act = this._handleAttr(node, attrName, proc, data);
		//Let's clean act.class if present
		act = this.cleanClass(act);
		var park= false;
		this._msgPairs.push(SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, [act]));
		if (parkMsgPair!=undefined && parkMsgPair !=null){
			park=parkMsgPair;
		}
		if (park){
			var newMsgPairList=(msgPairList==null)? [] : msgPairList;
			var msgPair = dojo.clone(this._msgPairs[0]);			
			msgPair = SYNCMSG.addUndoFlag(msgPair,false); //do not add to q
			newMsgPairList.push(msgPair);			
			console.log('reset parked msg list from text msg 499');
			if(!editor.parkedMsgPairList)
				editor.parkedMsgPairList = newMsgPairList;
			else
				editor.parkedMsgPairList.concat(newMsgPairList);		
			//let's send coedit message only for last entry in handleNodeAttr
			if (usePark){
				SYNCMSG.sendMessage(newMsgPairList, SYNCMSG.SYNC_SORTER);
			} else{
				SYNCMSG.sendMessage([dojo.clone(msgPair)], SYNCMSG.SYNC_SORTER);
			}
		}else {
			SYNCMSG.sendMessage(this._msgPairs, SYNCMSG.SYNC_SORTER);
		}
		//console.info('handleNodeAttr');
	},
	
	//This function is called when building a coedit message for class attribute.
	// It ensures that unwanted classes are not sent to other clients.
	// for instance resizableContainerSelected
	cleanClass: function(action){		
		var act = action.act;
		var rAct = action.rAct;
		if (typeof act.a != undefined && typeof act.a['class']!= undefined && act.a['class']!=null &&  act.a['class'].length!=0){
			act.a['class'] = act.a['class'].replace('resizableContainerSelected','resizableContainer');
		}
		if (typeof rAct.a != undefined && typeof rAct.a['class']!= undefined && rAct.a['class']!=null &&  rAct.a['class'].length!=0){
			rAct.a['class'] = rAct.a['class'].replace('resizableContainerSelected','resizableContainer');
		}	
		return action;
	},
	
	//Will send attribute without adding to undo q
	handleNodeAttrNoUndo: function(node, attrName, proc, data) { 
		var act = this._handleAttr(node, attrName, proc, data);
		this._msgPairs.push(SYNCMSG.createMessage(MSGUTIL.msgType.Attribute, [act]));
		var newMsgPairList=[];
		var msgPair = dojo.clone(this._msgPairs[0]);			
		msgPair = SYNCMSG.addUndoFlag(msgPair,false); //do not add to q
		newMsgPairList.push(msgPair);			
		SYNCMSG.sendMessage(newMsgPairList, SYNCMSG.SYNC_SORTER);
		//console.info('handleNodeAttr');
	},
		
		
	
	_handleAttr: function(node, attrName, proc, data){
		this._msgPairs = [];
		var oldAttrs = {};
		oldAttrs[attrName] = node.getAttribute(attrName);
		
		if(data) {
			proc(data);
		}
		else {
			proc();
		}
		
		var newAttrs = {};
		newAttrs[attrName] = node.getAttribute(attrName);
		var act = SYNCMSG.createAttributeAct( node.id, newAttrs, {}, oldAttrs, {});
		
		return act;
	}
});

(function(){	
	TEXTMSG = new concord.pres.TextMsg();	
})();
