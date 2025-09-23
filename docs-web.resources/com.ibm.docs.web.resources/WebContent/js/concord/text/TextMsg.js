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

dojo.provide("concord.text.TextMsg");
dojo.require("concord.text.MsgUtil");
dojo.require("concord.text.SyncMsg");
dojo.require("concord.util.browser");
dojo.require("concord.util.mobileUtil");

dojo.declare("concord.text.TextMsg", null, {
			
	_oldState : null,
	_timer : null,	
	_deleteMsgs : null,	// Delete selection message. 
	_msgPairs: null,
	
	//maximum continuous input,const value
	_contMax: 6,
	//current continuous input count
	_contCount: 0,
	
	// for IME start
	preInput : function(ckEditor,selection){
		
		var range = null;
		if(!this._timer)
		{
			
			ckEditor.isLockKeyInput = true;
			try
			{
				if (!selection){
					selection = ckEditor.getSelection();
				}
				var ranges = selection.getRanges();
				var collapsed = true;
				for(var i=0;i< ranges.length;i++){
					if (!ranges[i].collapsed){
						collapsed = false;
						break;
					}
				}
				range = ranges[0];
				if (!collapsed){
					var deleteMsgs = [];
					
					range = MSGUTIL.getRange(selection, deleteMsgs);
					deleteMsgs = deleteMsgs.concat(range.deleteContentsMsg(true));
					if(deleteMsgs && deleteMsgs.length > 0){
						this._deleteMsgs = deleteMsgs;
						//DOM is changed here!!
					}
						
					range = ckEditor.getSelection().getRanges()[0];
				}
				
						
				if (collapsed && concord.text.tools && concord.text.tools.fixRange) {
				//	console.log( 'preInput: startContainer' + range.startContainer.getName() + " startOffset :" + range.startOffset );
					if( range.startContainer.type == CKEDITOR.NODE_ELEMENT && range.startContainer.is('body'))
					{//#23988
						//fixBlock
						var fixedBlock = range.fixBlock(true, 'p');
						range.moveToElementEditStart(fixedBlock);
						range.select();
						var act = SYNCMSG.createInsertBlockElementAct(fixedBlock);
						if( !this._deleteMsgs )
							this._deleteMsgs = [];
						this._deleteMsgs.push( SYNCMSG.createMessage(MSGUTIL.msgType.Element, [act]) );
						
					}
					concord.text.tools.fixRange(ckEditor,range);	
				}
				MSGUTIL.startCache();
				if (this._oldState && this._oldState.startBlock)
				{
					dojo.destroy(this._oldState.startBlock.$);
					this._oldState.startBlock = null;				
				}
				this._oldState = MSGUTIL.getContextByRange(range);
				if(concord.util.browser.isMobile()){
					//#15218,the message can not be sent until block element been removed,so we must remember its index and parent first here
					var blockId = this._oldState.startBlock.getId();
					var block = ckEditor.document.getById(blockId);
					this._oldState.index = block.getIndex();
					this._oldState.parentID = block.getParent().getId();
					
					// #32475 iOS7 will not send message when tap space to apply auto-correct.
					if(concord.util.browser.isMobile() && concord.util.browser.isMobileVersionGreaterOrEqual('7.0'))
					{
						var event = ckEditor.window.$.event;
						if(event && event.keyIdentifier && (concord.util.mobileUtil.applyAutoCorrectIssueIOS7.charCodeMap[event.keyIdentifier.toUpperCase()]))
							this._oldState.fixActForIOS7 = event.keyIdentifier.toUpperCase();
					}
				}
				this._seq = window['pe'].scene.session.getCurrentSeq();
				MSGUTIL.stopCache();

			}
			catch(e)
			{
				ckEditor.isLockKeyInput = false;
				LOG.log("Error on pre input: " + e);
				if (this._oldState && this._oldState.startBlock)
				{
					dojo.destroy(this._oldState.startBlock.$);
					this._oldState.startBlock = null;				
				}
				this._oldState = null;
				MSGUTIL.stopCache();
			}
		}
		return range;
	},
		
	// for IME end
	postInput : function(ckEditor){
		
		//#9694: [safari]press Backspace the first char at the first sub-level list item, redundant br generated
		if( CKEDITOR.env.webkit )
		{
			var range = ckEditor.getSelection().getRanges()[0];
				
			var block = MSGUTIL.getBlock(range.startContainer);
			var node = block.getLast();
			if( MSGUTIL.isBogus( node ) && ( MSGUTIL.getNodeLength( block )== 1 ) )
			{ //remove bogus to avoid two <br> created
				node.remove();
			}
		
			setTimeout( dojo.hitch(this, function( ckEditor ) 
			{
				var range = ckEditor.getSelection().getRanges()[0];
				var block = MSGUTIL.getBlock(range.startContainer);
				if( range.startContainer.type == CKEDITOR.NODE_ELEMENT)
				{
					var node = range.startContainer.getChild( range.startOffset );
					if( MSGUTIL.isNullBr( node ) && !MSGUTIL.isBogus( node ) )
					{ //remove new create br and replace with bogus
						console.log('remove br');
						var bogus = concord.text.tools.createBogus(node.getDocument());
						bogus.replace( node );
						range.select();
					}
				}
				!bogus && block.appendBogus();
				
			}, ckEditor ), 0);				
		}
		if(!this._timer)
		{
//			var interval = 0;
//			if (pe.scene.session.singleMode)
//				interval = 1000;
			this._timer = setTimeout( dojo.hitch(this, this._postInputExe, ckEditor), 0);			
		}
	},
	
	_postInputExe: function(ckEditor){
		this._contCount = 0;
		this._postInput.call(this,ckEditor,false);
	},
	
	_postInput : function(ckEditor, fromNextKey)
	{
		
		this._msgPairs = [];
		var curState = null;
		var tempState = null;
		var validinput = false;
		try
		{									
			var range = ckEditor.getSelection().getRanges()[0];
			
			if(this._oldState)
			{
				MSGUTIL.startCache();
				tempState = curState = MSGUTIL.getContextByRange(range, true);
				if(concord.util.browser.isMobile()){
					//#15218,the message can not be sent until block element been removed,so we must remember its index and parent first here
					var blockId = curState.startBlock.getId();
					var block = ckEditor.document.getById(blockId);
					tempState.parentID = block.getParent().getId();
					tempState.index = block.getIndex();
				}
				var oldState = this._oldState;
				
				var refreshBlock = function(){
					try{
						if (!oldState.startBlock)
							return;
						var block = ckEditor.document.getById(oldState.startBlock.getId());
						if(MSGUTIL.getPureText(block) != MSGUTIL.getPureText(oldState.startBlock))
						{	
							var acts =[];
							//acts.push(SYNCMSG.createDeleteBlockElementAct(block));
							acts.push(SYNCMSG.createDeleteElementAct(MSGUTIL.getBlockIndex(block), 1, block.getParent(), [oldState.startBlock]));
							// Change element ID for replace node message
							// Avoid OT error with other client's insert text message
							LISTUTIL.updateListId(block);
							acts.push(SYNCMSG.createInsertBlockElementAct(block));
							// Replace the current block
							this._msgPairs.push(SYNCMSG.createMessage(MSGUTIL.msgType.ReplaceNode, acts));
						}
						if(this._deleteMsgs && this._deleteMsgs.length > 0)
							this._msgPairs = this._deleteMsgs.concat(this._msgPairs);
						if (this._oldState && this._oldState.startBlock)
						{
							dojo.destroy(this._oldState.startBlock.$);
							this._oldState.startBlock = null;				
						}
						if(this._msgPairs.length > 0)
							SYNCMSG.sendMessage(this._msgPairs);
					}catch(exception){
						//var evalFn = function($$$$){return(eval($$$$))};
						//concord.text.tools.printExceptionStack(exception, evalFn);
					}
					
					
					this._timer = null;
					this._deleteMsgs = null;
					ckEditor.isLockKeyInput = false;
					this.handleMissingInput = false;
					this._oldState = null;
				
				};
				
				if(curState.startBlock.getId() != oldState.startBlock.getId())
				{
					var block = ckEditor.document.getById(oldState.startBlock.getId());
					if(!block)
					{
						console.log('oldstate startblock not exist');
						if(concord.util.browser.isMobile() && ckEditor.keystrokeHandler._.keyCode == 8){
							//#15218,in UIWebView,when keep pressing backspace button to delete content, for the first several times, keydown will fire after one character deleted,
							//but some times later, keydown will fire after several characters been deleted(might be UIWebview optimization for conitusous one key press),in this case,some times when delete characters at the beginning of block, 
							//key down some times will fire after the whole block element deleted,now the current block is the previous block, and getById() can not get old block since it had been already removed from DOM tree,
							//so need to send the delete element message to server and other clients to keep the DOM tree same with each other
							var act1 = SYNCMSG.createDeleteElementAct(oldState.index, 1, ckEditor.document.getById(oldState.parentID), [oldState.startBlock]);
							//console.log(dojo.toJson(act1));
							if (this._oldState && this._oldState.startBlock)
							{
								dojo.destroy(this._oldState.startBlock.$);
								this._oldState.startBlock = null;				
							}
							this._oldState = tempState;
							
							var acts1 = [act1];
							var bodyElement = ckEditor.document.getBody();
							if(bodyElement && bodyElement.getChildCount() == 0)
							{
								var fixedBlock = range.fixBlock(true, 'p');
								range.moveToElementEditStart(fixedBlock);
								range.select();
								acts1.push(SYNCMSG.createInsertBlockElementAct(fixedBlock));
								concord.text.tools && concord.text.tools.fixRange && concord.text.tools.fixRange(ckEditor,range);
							}
								
							this._msgPairs.push(SYNCMSG.createMessage(MSGUTIL.msgType.Element, acts1));
							SYNCMSG.sendMessage(this._msgPairs);
						}else
							this._oldState = null;
						this._timer = null;
						this._deleteMsgs = null;
						ckEditor.isLockKeyInput = false;
						MSGUTIL.stopCache();
						return;
					}	
					var newBlock = ckEditor.document.getById(curState.startBlock.getId());
					if (newBlock && block.contains(newBlock)){
						//if move from parent block to child block, we reset current state to parent block
						var newOffset = MSGUTIL.transOffsetRelToAbs(newBlock, curState.startOffset, block);
						curState = {};
						curState.startBlock = block.clone(true, true);
						curState.startLength = MSGUTIL.getNodeLength(block);
						curState.startOffset = newOffset;
					}else{
						// When the current state block was changed, get the latest state from old block element.
						refreshBlock.call(this);
						MSGUTIL.stopCache();
						return;
					}
					
				}
				var act = SYNCMSG.createTextChangeAct( oldState.startLength, oldState.startOffset, curState.startLength, curState.startOffset, curState.startBlock, oldState.startBlock);
//				console.log(dojo.toJson(act));
				if(!fromNextKey && act.length == 0 && !this.handleMissingInput && !this.isIME)
				{
//					this.handleMissingInput = true;
//					var that = this;
					// Regenerate message in this case also will omit input in some case.
//					setTimeout(function(){
//						that._postInput(ckEditor, false);
//						that.handleMissingInput = false;
//					}, 0);
					this.handleMissingInput = true;
					var that = this;
					setTimeout(function(){
						refreshBlock.call(that);
					}, 0);
					
					MSGUTIL.stopCache();
					return false;
				}
				else
				{
					if( act.length == 1 ){
						this._msgPairs.push(SYNCMSG.createMessage(MSGUTIL.msgType.Text, [act[0]]));
						validinput = true;
					}
					else if( act.length == 2 )
					{
						// #32475 iOS7 will not send message when tap space to apply auto-correct.
						this._oldState.fixActForIOS7 && concord.util.mobileUtil.applyAutoCorrectIssueIOS7.fixAct(act, this._oldState.fixActForIOS7);
						
						this._msgPairs.push(SYNCMSG.createMessage(MSGUTIL.msgType.Text, [act[0]]));
						this._msgPairs.push(SYNCMSG.createMessage(MSGUTIL.msgType.Text, [act[1]]));
						validinput = true; 
					}
				}
				MSGUTIL.stopCache();
			}
			
			if(this._deleteMsgs && this._deleteMsgs.length > 0)
				this._msgPairs = this._deleteMsgs.concat(this._msgPairs);
		}
		catch(e)
		{
			LOG.log("Error on post input: " + e);
			validinput = false;
			MSGUTIL.stopCache();
		}
				
		// The sequence in FF IME mode is
		// Keydown          -> 1. Get old state and start timer
		// Start IME mode   -> 2. Do nothing, because the timer is started
		// Time out	        -> 3. Keydown time out, clear timer.
		// End IME mode     -> 4. Get current state and generate.  
		// If the old state was cleared in step 3, would not generate IME input message
		 
		if (fromNextKey && validinput && this._timer){
			clearTimeout(this._timer);
		}
		
		if (!fromNextKey || validinput){
			this._timer = null;
			this._deleteMsgs = null;
			ckEditor.isLockKeyInput = false;
			if (tempState && this._oldState && this._oldState.startBlock)
			{
				dojo.destroy(this._oldState.startBlock.$);
				this._oldState.startBlock = null;				
				this._oldState = tempState;
			}
			SYNCMSG.sendMessage(this._msgPairs);
		}
		return validinput;
	},
	
	handleInput : function(ckEditor,selection){
		if (!selection){
			selection = ckEditor.getSelection();
		}
		var range = this.preInput(ckEditor,selection);
		this.postInput(ckEditor);
		return range;
	},
	
	processLastKey : function(ckEditor){
		if(this.isSafariIME)// safari do not need to processLastKey when use IME to input, composition event will handle key input
			return false;
		if(this.isIME || (this._contCount< this._contMax && this._timer)){ 
			//if (!pe.scene.session.singleMode)
			this._contCount ++;
			//execute last timer directly without any interval
			var processed = this._postInput(ckEditor,true);		
			return processed;
		}
		if (!this._timer)
			return true;
		return false;
	},
	
	disableInputOnce: function(){
		this._contCount = this._contMax;
	}
});

(function(){	
	if(typeof TEXTMSG == "undefined")
		TEXTMSG = new concord.text.TextMsg();	
})();