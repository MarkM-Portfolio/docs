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

dojo.provide("concord.spellcheck.scaytservice");
dojo.require("dijit._base.window");
dojo.require("dijit._editor.range");
dojo.require("dijit._base.focus");
dojo.require("dojox.collections.ArrayList");
dojo.require("dojox.collections.Dictionary");
dojo.require("concord.i18n.CharCategory");
dojo.require("concord.spellcheck.RegExpEx");
dojo.declare("concord.spellcheck.scaytservice", null,
	{
		eventHandlers : [],
		subscriptionHandlers : [],
		readonly_nodes : [],
		editable_nodes : [],
		bPublishStatus : false,
		document : null,
		window : null,
		serviceAvailable : true,
		autoScaytEnabled : false,
		requestId : 0,
		maxBytesToSend : 1024,  //URLs over 2,000 characters will not work in the most popular web browser
		lastRange : null,
		lastRangeTimer : null,
		breakSCTimer : null,
//		markBlocksTimer : null,		
//		markBlocksQueue : [],
		splitBlocksTimer : null,	
		instanceTimer : null,
		splitBlocksQueue : [],
		sepReg : null,
		isPres: false, //God, we need do special for Pres as they have more special requirenments
		block:"P|BUTTON|TEXTAREA|SELECT|DIV|H[1-6]|ADDRESS|PRE|OL|UL|LI|TABLE|TBODY|TR|DT|DE|TD|TH|SUB|SUP|FIELDSET",
		tagStart : "sc_start",
		tagEnd : "sc_end",	
		tagStartID : "sc_start_rqstId", // for customized node, IE added a : at the beginning of the tagName sometimes, which seems comes from the empty namespace
		tagEndID : "sc_end_rqstId",		// We use the attr rather than tagName to query the special nodes to by pass it.
		attrMis : "misword",
		editable : "contenteditable",
		classMis : "misspellWord",
		moveKeys : [dojo.keys.HOME,dojo.keys.UP_ARROW,dojo.keys.DOWN_ARROW,dojo.keys.LEFT_ARROW,dojo.keys.RIGHT_ARROW,dojo.keys.END,dojo.keys.PAGE_UP,dojo.keys.PAGE_DOWN,dojo.keys.TAB],
		constructor : function(document, bPublishStatus){
			this.document = document;
			this.window = dijit.getDocumentWindow(this.document);	
			this.isPres = window.g_presentationMode? true:false;

			this.eventHandlers = [];
			this.subscriptionHandlers = [];
			this.readonly_nodes = [];
			this.editable_nodes = [];
			
			this.setPublishStatus(bPublishStatus);

			this.document.spellchecker = this;
			this.autoScaytEnabled = spellcheckerManager.bAutoScaytEnabled;
			this.serviceAvailable = spellcheckerManager.bServiceAvailable;
			this.subscribeMsg();
			dojo.connect(this.document.body, "onbeforeunload", this, this.unsubscribeMsg);
			this._addStyles();
		},
		
		setPublishStatus : function(p) {
			if(p!=true && p != false)
				return;
			this.bPublishStatus = p;
		},
		
		isPublishStatus : function() {
			return this.bPublishStatus;
		},
		
		addScStyle : function() {
			if(!dojo.hasClass(this.document.body,"concordscEnabled"))
				dojo.addClass(this.document.body, "concordscEnabled");
		},
		
		removeScStyle : function() {
			if(dojo.hasClass(this.document.body,"concordscEnabled"))
				dojo.removeClass(this.document.body, "concordscEnabled");
		},
		
		_clearInstanceTimer : function()
		{
			if(this.instanceTimer)
			{			
				clearTimeout(this.instanceTimer);		
				var index = dojo.indexOf(spellcheckerManager.scTimerInstances, this.instanceTimer); 
				if(index>=0) // remove the timer from the manager
					spellcheckerManager.scTimerInstances.splice(index, 1);							
				this.instanceTimer = null;
			}		
		},
				
		_enableScaytImpl : function(enable)
		{			
			try{
				if (this.document == null){
					console.warn("no document specified");
				}
				else{			
					if (enable){
						this.addScStyle(); //dojo.addClass(this.document.body, "concordscEnabled");
						if (this.serviceAvailable){					
							this.doSpellCheck();
							if (this.editable_nodes.length > 0)
								this.connectEvents();
						}					
					}else {
						this.removeScStyle(); //dojo.removeClass(this.document.body, "concordscEnabled");
						this.disableSpellCheck();
						this.disconnectEvents();
					}
				}
			}catch(e) {
				console.log('_enableScaytImpl, error:' + e);
			}	
			
			this._clearInstanceTimer();
		},
		
		/**
		 * Automatic spell check
		 */
		enableAutoScayt : function(enable){
			var old_state = this.autoScaytEnabled; 
			this.autoScaytEnabled = enable;
			if(this.autoScaytEnabled) {
				// for multi spell checker instances, need handle the event async.				 
				if(!this.instanceTimer)
				{
					var i = spellcheckerManager.scTimerInstances.length;
					this.instanceTimer = setTimeout(dojo.hitch(this, function() {
						this._enableScaytImpl(true, old_state);						
					
					}),i*500);									
					
					spellcheckerManager.scTimerInstances.push(this.instanceTimer);
				}				
			}
			else
			{
				this._clearInstanceTimer();
				
				// for multi spell checker instances, need handle the event async.
				setTimeout(dojo.hitch(this, function() {
					this._enableScaytImpl(false, old_state);			
				}),0);
				if( this.splitBlocksTimer )
				{
					clearInterval(this.splitBlocksTimer);
					this.splitBlocksTimer = null;
				}							
			}	
			
			if(this.isPublishStatus())
				dojo.publish("concordsc::autoScaytEnabledInfo", [enable]);
			
		}, // end enableAutoScayt		
		
		enableConcordSpellcheck : function(enable){
			this.serviceAvailable = enable;
			
			if (enable && this.autoScaytEnabled) {
				this.enableAutoScayt(true);
			}else{
				// remove event listener
				this.disableSpellCheck();
			}
		}, // end enableConcordSpellcheck
		
		isDocChecked : function() {
			return this.serviceAvailable && dojo.hasClass(this.document.body,"concordscEnabled");
		},
		
		isAutoScaytEnabled : function() {
			return this.autoScaytEnabled && this.serviceAvailable;
		},
		
		removeAllNodes : function() {
			this.readonly_nodes = [];
			this.editable_nodes = [];
			this.document = null;
		},
		
		hasNode : function(node) {
			if( dojo.indexOf(this.readonly_nodes, node) >= 0)			
				return true;
			if( dojo.indexOf(this.editable_nodes, node) >= 0)			
				return true;	
			
			return false;
		},		
		
		removeNode : function(node) {
			if (node.nodeName.toUpperCase()=="IFRAME"){
				node = node.contentWindow.document;
			}		
			
		    var rmNode = null;	
			var index = dojo.indexOf(this.readonly_nodes, node);
			if(index>=0) {
				rmNode = this.readonly_nodes.splice(index, 1);
				rmNode.spellchecker = null;
			}
			
			index = dojo.indexOf(this.editable_nodes, node); 
			if(index>=0) {
				rmNode = this.editable_nodes.splice(index, 1);
				rmNode.spellchecker = null;
			}
			
			return rmNode;
		},
			
		addNode : function (node, editable, checkIt) {
			if(checkIt != false)
				checkIt = true;
			
			var curFrame = null;
			if (node.nodeName.toUpperCase()=="IFRAME"){
				curFrame = node;
				node = node.contentWindow.document;
			}

			node.spellchecker = this;

			if (!editable){
				this.readonly_nodes.push(node);				
			}else {
				this.editable_nodes.push(node);
				if (this.editable_nodes.length == 1){
					if(this.isDocChecked() || this.isAutoScaytEnabled())						
						this.connectEvents();
				}				
			}
			
			if (this.serviceAvailable && this.autoScaytEnabled && checkIt){
				if ((!curFrame) || (curFrame && curFrame.contentWindow.document.body))
					this._spellCheckOneNode(node);
				else
					dojo.connect(((dojo.isIE)?curFrame.contentWindow:curFrame),"onload",
											dojo.hitch(this, function(){
												spellcheckerManager.debug("iframe loaded");
												this._spellCheckOneNode(node);
												}));
			}
			else {
				this._disableSpellCheckOneNode(node);
			}
			
		}, // end addNode
		
		refresh : function(node){
			if (node == null)
				this.enableAutoScayt(this.autoScaytEnabled);
			else {
				if ((dojo.indexOf(this.readonly_nodes, node)>=0) || (dojo.indexOf(this.editable_nodes, node)>=0)){
					if (this.serviceAvailable && this.autoScaytEnabled){						
						this._spellCheckOneNode(node);
					}
					else {
						this._disableSpellCheckOneNode(node);
					}
				}
			}
		}, // end refresh
				
		spellcheckLangChanged: function()
		{
			if(this.autoScaytEnabled)
			{
				this.doSpellCheck();
			}
		},
		
		doSpellCheck : function() {
			dojo.forEach(this.readonly_nodes, dojo.hitch(this, "_spellCheckOneNode"));
			dojo.forEach(this.editable_nodes, dojo.hitch(this, "_spellCheckOneNode"));
		}, // end doSpellCheck
				
		checkNodes : function (node, endNode, root) {		
			if(node == endNode || !endNode)
				this._spellCheckOneNode(node);
			else
				this._spellCheckNodes(node, endNode, root, null, false, false);
		},
		
		// if tab was inserted in a misspelling word
		handleTabInput : function(node)
		{		
			var misSpan = node.parentNode; 
			if(misSpan && dojo.hasClass(misSpan, this.classMis))
			{				
				// reserve cursor in this check.
				this._spellCheckNodes(misSpan, null, misSpan, null, true, false);		
			}
			return;
		},
		
		_spellCheckDocNodeArray: function()
		{
			this.splitBlocksTimer = setInterval(dojo.hitch(this, function(){																	
				try{
					if( this.splitBlocksQueue.length > 0 && this.splitBlocksTimer )
					{
						var cNode = this.splitBlocksQueue.shift();
						
						// clear the timer before last check to ensure status get handled by load function
						if( this.splitBlocksQueue.length == 0)
						{
							clearInterval(this.splitBlocksTimer);
							this.splitBlocksTimer = null;
							spellcheckerManager.debug("The documents spelling check is completed!");
						}
						
						this._spellCheckNodes(cNode, null, cNode, null, true, true);
					}						
				}catch(e)
				{
					console.log("error happens when interval split document nodes: " + e);
				}
						
			}), 200);						
		},
		
		_spellCheckDocument : function()
		{
			var count = 0;
			for(var i=0; i < this.document.body.childNodes.length; i++)
			{
				var node = this.document.body.childNodes[i];
				if( this._isBlock(node) )
				{																																										
					if( node && spellcheckerManager._tagNameEquals(node.tagName, "FIELDSET") )
					{
						for(var j=0; j < node.childNodes.length; j++)
						{	
							var child = node.childNodes[j];
							if( this._isBlock(child) )
								this.splitBlocksQueue.push(child);
						}
					}
					else 
						this.splitBlocksQueue.push(node);
					count ++;
				}	
			}	
			spellcheckerManager.debug("the count of direct child in this document: " + count);
			
			this._spellCheckDocNodeArray();
		}, 
		
		spellCheckBlocks : function(startNode, endNode)
		{
			if(startNode && endNode){
				var node = startNode;
				var blockArray = [];
				while(node && node != endNode){					
					if( this._isBlock(node) )
					{                                                                                                                                                                       
						if( node && spellcheckerManager._tagNameEquals(node.tagName, "FIELDSET") )
						{
							for(var j=0; j < node.childNodes.length; j++)
							{   
								var child = node.childNodes[j];
								if( this._isBlock(child) )
									blockArray.push(child);
							}
						}
						else 
							blockArray.push(node);
					}
					node = node.nextSibling;                                        
				}//while 
				if( this._isBlock(endNode))
				{                                                                                                                                                                       
					if( endNode && spellcheckerManager._tagNameEquals(endNode.tagName, "FIELDSET") )
					{
						for(var j=0; j < endNode.childNodes.length; j++)
						{   
							var child = endNode.childNodes[j];
							if( this._isBlock(child) )
								blockArray.push(child);
						}
					}
				else 
					blockArray.push(endNode);
				}
		                
				this._spellCheckDocNodeBlocks(blockArray);            	
			}else{
				this.checkNodes(startNode, endNode, null);	
			}       	
		},    
		_spellCheckDocNodeBlocks: function(blockArray)
		{
			if(!blockArray) return;
			var blockTimer =  setInterval(dojo.hitch(this, function(){  
				if( blockArray.length > 0 && blockTimer)
				{                                                                 
					try{
						var cNode = blockArray.shift();
						if( blockArray.length == 0)
						{
							clearInterval(blockTimer);
							blockTimer = null;
						}                    	    
						this._spellCheckNodes(cNode, null, cNode, null, false, false); 
					}catch(e)
					{
						console.log("error happens when interval split document nodes: " + e);
					}
				}                       
			}), 200);           	              	                                    
		},				
		
		/**
		 * slide sorter document
		 */
		_spellCheckPrezSorter: function(slideSorter)
		{
			var count = 0;
			var slides = slideSorter.getAllSlides(); // slides
			for(var i=0; i < slides.length; i++)
			{
				var node = slides[i]; //slide
				this.splitBlocksQueue.push(node);
				count++;
			}	
			spellcheckerManager.debug("There are " + count + " slides in this presentation.");
			
			this._spellCheckDocNodeArray();
		},
		
		_spellCheckOneNode : function (node) {	
			try 
			{

				if(node == this.document || node == this.document.body)
				{				
					var slideSorter = window.pe.scene.slideSorter;
					if(slideSorter)
					{
						if(slideSorter.spellChecker == this) // when load the presentation
						{
							this._spellCheckPrezSorter(slideSorter);
						}
						else                                 // when exiting edit box
						{	
							setTimeout(dojo.hitch(this, function(){
								this._spellCheckNodes(node, null, node, null, false, false);
							}), 0); 											
						}
							
					}
					else
					{
						this._spellCheckDocument();
					}
				}
				else if( node && spellcheckerManager._tagNameEquals(node.tagName, "FIELDSET") )
				{
					for(var j=0; j < node.childNodes.length; j++)
					{	
						var child = node.childNodes[j];
						if( this._isBlock(child) )
							this._spellCheckOneNode(child);
					}
				}
				else
				{
					setTimeout(dojo.hitch(this, function(){
						this._spellCheckNodes(node, null, node, null, true, false);
					}), 0); 	
				}
			}
			catch(e){
				console.warn("exception is caught when run spell check " + e);
				if(window.pe.scene.slideSorter.editor.document)
					this.document = window.pe.scene.slideSorter.editor.document;
			}
			
			
		},
		
		_spellCheckNodes : function (node, endNode, root, selOffset, resvCursor, pubStatus) {
			if (node.nodeType == 9){//document
				node = node.body;
			}
			if (spellcheckerManager.bNative == true){
					node.spellcheck = true;
					if (node.nodeName.toUpperCase()=="DIV"){
						dojo.attr(node, "contenteditable", "false"); //need to refresh, don't know why
						dojo.attr(node, "contenteditable", "true");
					}
			}
			else{
				var cachedAll = true;
				
				function removeSCAttr(oNode){								
					if (dojo.hasAttr(oNode, this.attrMis)){
						var misAttr = oNode.getAttribute(this.attrMis);
						if(misAttr && this._IsInvalidMark(oNode, misAttr)){
							if(oNode == node)
							{
								node = oNode.firstChild || oNode.previousSibling || oNode.parentNode;
								spellcheckerManager.debug("removeSCAttr, node=oNode, reset node: " + node);
							}
							if(oNode == endNode)
							{
								endNode = oNode.lastChild || oNode.nextSibling;
								spellcheckerManager.debug("removeSCAttr, endNode=oNode, reset endNode: " + endNode);
							}
							
							this._removeSCAttribute(oNode, false);
							spellcheckerManager.debug("removeSCAttr: " + misAttr);
						}
					}	
					else if(dojo.hasClass(oNode, this.classMis)) {
						// if the node have misClass but don't have a misAttr, must be an invalid mark
						this._removeSCAttribute(oNode, false);
					}
				}
				
				var bNode = null;				
				// reserve cursor before remove spell check marks
				if(resvCursor && !selOffset)
				{
					bNode = endNode? this.getParentBlockNode(dijit.range.getCommonAncestor(node,endNode)) : this.getParentBlockNode(node);
					selOffset = this._getSelOffset(bNode);
				}
				
				this._iterateNode(node, endNode, root, null, removeSCAttr);
			
				var iCount = 0;
				var regSpace = this._getSeperatorReg();
				var lastWord = "";// the last word in the last visited node, it means the word is not ended if it is set
													// for example <p>an<b>oth</b>er ...<p>. "an" and "oth" is not the end of the word
													// when "an" is visited, lastWord is set as "an"
													// when "oth" is visited, lastWord is set as "anoth"
													// when "er ..." is visited, lastWord is set as "" since this is the end of a word
				var checkString = [];	
				var theWordRange = null;
				var startIndex = -1;
				var endIndex = -1;
				//console.time("split_words");

				function startOneCheck(wordRange){
						spellcheckerManager.debug("startOneCheck: " + this.requestId);
						checkString = [];
						var oNode = wordRange.startContainer;
						var startNode = oNode.ownerDocument.createElement(this.tagStart);
						dojo.attr(startNode, this.tagStartID, this.requestId);						
						startIndex = this.requestId;
						var newNode = oNode;
						var offset = wordRange.startOffset;
						if (offset){ // created new text node here and return it.
							var after = this.splitText(oNode,offset); //oNode.splitText(offset);
							oNode.parentNode.insertBefore(startNode,after);
							newNode = after;
							return newNode;
						}else {
							oNode.parentNode.insertBefore(startNode, oNode);
						}
						
						// no node change
						return null;						
				};

				function endOfOneCheck(oNode, offset, bEnd){
					spellcheckerManager.debug("endOfOneCheck: " + this.requestId);
					var endNode = this.document.createElement(this.tagEnd);
					dojo.attr(endNode, this.tagEndID, this.requestId);				
					if (!bEnd){
						var after = this.splitText(oNode,offset); //oNode.splitText(offset);
						oNode.parentNode.insertBefore(endNode,after);
						oNode = after;
					}else if (oNode.nextSibling){
						oNode.parentNode.insertBefore(endNode, oNode.nextSibling);
					}else{
						oNode.parentNode.appendChild(endNode);
					}
					endIndex = this.requestId;
					this._checkText(this.requestId, checkString.join(" "), resvCursor, pubStatus);
					this.requestId ++;
					cachedAll = false; // well, there is new misspelled words need check.		
					return oNode;
				};

				// callback function for _iterateNode. split one text node to words
				function split2Word(oNode, nextIterateNode){
					var walkLength = 0;
					var bEndText = false;// if this is the last text node

					var bIgnore = false;
					if (this._getMisspellNode(oNode)|| this._isInFieldNode(oNode)){
						bIgnore = true;
					}
					
					var innerTextStr = this._getText(oNode);

					if (!bIgnore && innerTextStr.length > 0){
						var leftTextStr = innerTextStr;
						
						while (leftTextStr.length){
							var theWord = "";
							// split the text with separator
							spellcheckerManager.debug("enter while, leftTextStr: " + leftTextStr);
							var spaceIndex = regSpace.exec(leftTextStr);
							if (spaceIndex != null){
								if (spaceIndex.index > 0){
									// there are separators in the text, for exmaple "hello world"
									theWord = leftTextStr.substring(0, spaceIndex.index); // "hello"
									leftTextStr = leftTextStr.substring(spaceIndex.index+spaceIndex[0].length);// "world"
									
									if (lastWord.length > 0){
										theWord = lastWord + theWord;
									}else{ // this is a start of a word
										theWordRange = dijit.range.create(oNode.ownerDocument.defaultView);
										theWordRange.setStart(oNode, walkLength); // mark the start point in the range
									}
									theWordRange.setEnd(oNode, walkLength + spaceIndex.index); // mark the end of a word
									walkLength += spaceIndex.index+spaceIndex[0].length; 									
								}
								else if (spaceIndex.index == 0){
									// if the left text start with separator, like " hello"
                  // skip these seperators
									leftTextStr = leftTextStr.substring(spaceIndex[0].length);// "hello"
									walkLength += spaceIndex[0].length;
									lastWord = "";
								}			
							}											
							else { 
								// no separator in the text
								if (lastWord.length == 0){// this is a start of a word
									theWordRange = dijit.range.create(oNode.ownerDocument.defaultView);
									theWordRange.setStart(oNode, walkLength); // mark the start of a word
								}
								lastWord += leftTextStr;
								
								var nextNode = oNode;
								while (nextNode = this._getNextNode(nextNode, endNode, root, 3)){
									if (this._getText(nextNode).length!=0)
										break;
								}
								if (nextNode == null){ // if there's no next node behind it
									theWord = lastWord;
									bEndText = true;
								}
								else {
									// check next node text to make sure if they are for the same word
									var nextTextStr = this._getText(nextNode);
									var nextSpaceIndex = regSpace.exec(nextTextStr);
									if (nextSpaceIndex && nextSpaceIndex.index == 0){//next node start with separator
										theWord = lastWord;
									}
									else{ // if next text node is next to this node
										// Here we must make sure the next non-style node is text node
										// for example, hello<img>...</img>world, the nextNonTextStyleNode for "hello" is img node
										// it should be parsed as two words
										// another example, se<B>par<I>at</I>or</B> should be parsed as one word										
										var nextNonTextStyleNode = oNode;
										while (nextNonTextStyleNode = this._getNextNonStyleNode(nextNonTextStyleNode, endNode)){
											if (nextNonTextStyleNode.nodeType != 3)
												break;
											if (this._getText(nextNonTextStyleNode).length!=0)
												break;
										}
										if (nextNonTextStyleNode != nextNode){// this is the end of the word
											theWord = lastWord;							
										}
									}
								}

								walkLength += leftTextStr.length;
								if (theWord){
									theWordRange.setEnd(oNode, walkLength); // mark the end of a word
								}
								leftTextStr = "";
							}
							
							
							if (theWord.length>0){ // a word needs to be checked																
								lastWord = "";
								if (spellcheckerManager.isCorrectWord(theWord) || spellcheckerManager.isSkipWord(theWord)){
									spellcheckerManager.debug("a correct word found : " + theWord);
									//skip this word
								}else if (spellcheckerManager.isMisspelledWord(theWord)){
									spellcheckerManager.debug("an incorrect word found : " + theWord);
									var bToSplitEndNode = (endNode == oNode);
									var spanNode = this._markMisWord(theWordRange, theWord, resvCursor);
									if (dojo.isArray(spanNode)){
										spanNode = spanNode[spanNode.length-1];
									}
									// reset oNode
									// get next text node after the marked one
									if (spanNode.nextSibling && spanNode.nextSibling.nodeType == 3)
									{
										oNode = spanNode.nextSibling;
									}
									else
									{
										var sNode = spanNode.nextSibling || spanNode.lastChild || spanNode;						
										oNode = this._getNextNode(sNode, endNode, root,3); 
									}
									
									if(oNode && oNode == nextIterateNode)
									{// 1. next text node is same as next iterate node, break the while to begin next iterate
										break;
									}
									else if(!oNode) 
									{// 2. there is no text node behind. to apply endOfOneCheck if need, otherwise, just return
										oNode = spanNode;
										bEndText = true;	
										leftTextStr = "";
									}	
									else
									{// 3. normal case, the oNode was set as the after part of split text node																		
										leftTextStr = this._getText(oNode);
										walkLength = 0;
										if(bToSplitEndNode)
										{
											endNode = oNode;
											spellcheckerManager.debug("an incorrect word found and splited the endNode : " + leftTextStr);
										}
									}									

								}else if (checkString && dojo.indexOf(checkString, theWord)!=-1){// already in checkString
									// skip
									spellcheckerManager.debug("a unknown word found : " + theWord);
								}else{
									if (iCount == 0){
										// insert start bookmark
										var bToSplitTheNode = (theWordRange.startContainer == oNode);
										var bToSplitEndNode = (endNode == oNode);
										var newNode = startOneCheck.apply(this, [theWordRange]);
										if (bToSplitTheNode && newNode && newNode != oNode){// if new node created
										    //the node, endNode, root may changed here...	
											oNode = newNode;
											walkLength = walkLength - theWordRange.startOffset;
											
											if(bToSplitEndNode)
											{// this must be the last iteration, reset the endNode just in this function.
												endNode = oNode;
												spellcheckerManager.debug("Just start one check and splited the endNode : " + leftTextStr);
											}	
										}
									}
									iCount++;
									checkString.push(theWord);
									spellcheckerManager.debug("word: " + theWord);
								}
								theWordRange.detach();
								theWordRange = null;
							}

							if ((leftTextStr.length == 0) && (!bEndText)){
								var nextNode = oNode;
								while (nextNode = this._getNextNode(nextNode, endNode, root, 3)){
									if (this._getText(nextNode).length!=0)
										break;
								}
								if (nextNode == null){ // if there's no next node behind it
									bEndText = true;
								}
							}
							if (iCount > 0){
								if ((encodeURI(checkString.join(" ")).length >= this.maxBytesToSend) || (bEndText)){
									// insert end bookmark
									oNode = endOfOneCheck.apply(this, [oNode, walkLength, (leftTextStr.length==0)]);								
									iCount = 0;
									walkLength = 0;
								}
							}
						} // end while (leftTextStr.length)
					}// if (!bIgnore && innerTextStr.length > 0)
					else if (startIndex != endIndex){ // this node is ignored
						if ((startIndex > endIndex) && (iCount >0)){
								var nextNode = oNode;
								while (nextNode = this._getNextNode(nextNode, endNode, root, 3)){
									if (this._getText(nextNode).length!=0)
										break;
								}
								if (nextNode == null){ // if there's no next node behind it
									bEndText = true;
								}
								if ((checkString.join(" ").length >= this.maxBytesToSend) || (bEndText)){
									// insert end bookmark
									oNode = endOfOneCheck.apply(this, [oNode, walkLength]);									
									iCount = 0;
									walkLength = 0;
								}
								
						}else{
							console.warn("error to insert start and end node");
						}
					}
					return bEndText;// if this is the last text node, break the iteration
				};
				
				this._iterateNode(node, endNode, root, 3, split2Word);
				if(resvCursor && selOffset)
					this._restoreSel(selOffset);
				
				if(pubStatus && this.isPublishStatus() && cachedAll && this.isAutoScaytEnabled() && !this.splitBlocksTimer)
				{
					dojo.publish("concordsc::scaytFinishedInfo", [true]);
				}					
				//console.timeEnd("split_words");
			} // end !spellcheckerManager.bNative			
		}, // end _spellCheckNodes		
		
		_clearRequestNodes : function(rqstId)
		{
			spellcheckerManager.debug("_clearRequestNodes: " + rqstId);
			dojo.query("[" + this.tagStartID + "=" + rqstId +"]", this.document).forEach(dojo.hitch(this, function(node){
				spellcheckerManager.debug(this.tagStartID + rqstId +":removed");
				node.parentNode.removeChild(node);
			}));
			dojo.query("[" + this.tagEndID + "=" + rqstId +"]", this.document).forEach(dojo.hitch(this, function(node){
				spellcheckerManager.debug(this.tagStartID + rqstId +":removed");	
				node.parentNode.removeChild(node);
			}));	
		},
		
		_checkText : function (scRequestId, strText, resvCursor, pubStatus){
			var checkedText = null;
			var checker = this;	
			// for the safari, an invisible char will be insert when a new paragraph is generaged. 
			strText = strText.replace(/\u200b/g,'');
			if (strText.length){				
				spellcheckerManager.debug("check text " + scRequestId +":" + strText);
				var myDoc = this.document;
				
				var scRequest = {
					requestId : scRequestId,
					pubStatus : pubStatus,					
					spellChecker : checker
				};
								
				var request = {
						url:  spellcheckerManager.backendServiceURL +"/" + spellcheckerManager.lang,
						content: {
							text: strText,
							suggestions: 0,							
							format: "json"
						},
						headers: {
							"Content-Type":"application/x-www-form-urlencoded;charset=utf-8"
						},
						handleAs: "json",
						sync: false,
						timeout: 10000, // execute error when timeout
						load : function (data){
							spellcheckerManager.debug(scRequest.requestId);
							var spellChecker = scRequest.spellChecker;
							var items = data.items;
							var regMiss = null;
							var sRegMiss = "";
							if (items instanceof Array && spellChecker.isAutoScaytEnabled()){
								var misspelled = new Array();
								
								function addMisWord(aWord) { 
									if (dojo.indexOf(misspelled, aWord) == -1){
										misspelled.push(aWord);
										spellcheckerManager.addMisspelledWord(aWord, null);
									}						
								};
								function compareStrLens(a,b){
									  if ( a.length < b.length )
										    return 1;
										  if ( a.length > b.length )
										    return -1;
										  return 0; // a == b
								}
								
								if (items.length){
									for (var i in items){
										var word = items[i].word;
										var type = items[i].type;
										
										var wArray = word.split(/\s+/); // the word returned from server contains space?? why? and any other separator?
																				
										if (dojo.isString(wArray)){
											if(wArray.lengh)
												addMisWord(wArray);
										}else if (dojo.isArray(wArray)){
											for(var k = 0; k<wArray.length; k++)
											{
												if(wArray[k].length)
													addMisWord(wArray[k]);
											}	
										}
									}
									
									var array = new Array();
									for (var j in misspelled){
										var code = misspelled[j].charCodeAt(0);
										if(!spellcheckerManager.isWordBoundaryChar(code))
										{// assume string was separated by XPD engine, here are atom words only 
											array.push(misspelled[j]);
										}
									}
									// move longer string ahead to generate an suitable alternative regex
									array.sort(compareStrLens); 
									for(var i=0; i<array.length; i++)
										sRegMiss += array[i] + "|";
									if(sRegMiss.length > 1)
										sRegMiss = sRegMiss.substr(0, sRegMiss.length-1);		
																		
									//sRegMiss = "\\b(" + sRegMiss + ")\\b";
									if(sRegMiss != "")
									   sRegMiss = "(" + sRegMiss + ")";									
									spellcheckerManager.debug("mis:" + sRegMiss);
								}
								var correctWords = null;
								try{
									if (sRegMiss.length > 0){
										correctWords = strText.replace(new RegExp(sRegMiss, "ig"), "");
									}
									else{
										correctWords = strText;
									}
									var correctArray = correctWords.split(/\s+/);
									spellcheckerManager.addCorrectWord(correctArray);
								}catch(e){
									console.warn("exception is caught after the word returned from server" + e);
									console.warn("sRegMiss is:" + sRegMiss);
								}
//								var markAtom = {id : scRequest.requestId, sRegMiss: sRegMiss};
//								spellChecker.markBlocksQueue.push(markAtom);
//								spellChecker.invokeMarkAction();
								if(sRegMiss.length)
									spellChecker._markMisspellForRequest.apply(spellChecker, [sRegMiss, scRequest.requestId, resvCursor]);
								else
									spellChecker._clearRequestNodes(scRequest.requestId);
							}
							else
							{																
								var requestId = scRequest.requestId;
								console.warn("there is no error words or the sc is diabled: " + requestId);
								spellChecker._clearRequestNodes(requestId);													
							}	
				
							if(spellChecker.requestId == scRequest.requestId + 1 && scRequest.pubStatus)
							{// this is the last returned check result
								if( spellChecker.isPublishStatus() && spellChecker.isAutoScaytEnabled() && !spellChecker.splitBlocksTimer )
								{// just publish finished message for batch check
									dojo.publish("concordsc::scaytFinishedInfo", [true]);
								}
							}
						},

						error : function (err, ioargs) {
							var requestId = scRequest.requestId;
							var spellChecker = scRequest.spellChecker;	
							console.warn("error got for request " + requestId);												
							spellChecker._clearRequestNodes(requestId);			
							
							if (ioargs.xhr.status == 404){
								spellcheckerManager.setServiceAvailable(false);
							}
						}
					};
				dojo.xhrGet(request);	
			}
			else
			{				
				console.warn("there is no text to check for:  " + scRequestId);
				this._clearRequestNodes(scRequestId);
			}						
		}, // end _checkText
		
		
//		invokeMarkAction : function()
//		{
//			if(this.markBlocksQueue.length && !this.markBlocksTimer)
//			{
//				this.markBlocksTimer = setInterval(dojo.hitch(this, function(){																	
//					if( this.markBlocksQueue.length > 0 )
//					{
//						var markAtom = this.markBlocksQueue.shift();
//						this._markMisspellForRequest(markAtom.sRegMiss, markAtom.id, false);
//					}	
//					
//					if( this.markBlocksQueue.length == 0 && this.markBlocksTimer)
//					{
//						clearInterval(this.markBlocksTimer);
//						this.markBlocksTimer = null;
//					}					
//				}), 500);
//			}
//		},
		

		/**
		 * FIXME: there is a risk here, when <BR> is in the middle of a block, will be filtered by the _getText.
		 * Such as: <p>thi<br>s</p> actually is a "thi" and "i" in two lines, will be trated as  a word "this"
		 * Need break at <BR> node when mark the mis-word.
		 */
		_markMisspellForRequest : function (sRegMiss, requestId, resvCursor){	
			//console.time("mis "+sRegMiss);
				var startNodeList = dojo.query("[" + this.tagStartID + "=" + requestId +"]", this.document);
				var endNodeList = dojo.query("[" + this.tagEndID + "=" + requestId + "]", this.document);
				var startBlock=null, endBlock=null;
				var markedAtleastOnce = false;
				var selOffset = null;
				try 
				{
					var scStartNode = startNodeList[0];
					var scEndNode = endNodeList[0];
															
	
					if (scStartNode && scEndNode && sRegMiss.length>0){
						//var regMiss = new RegExp(sRegMiss, "g");
						var regMiss = new concord.spellcheck.RegExpEx(sRegMiss, "g", true);
						var root = dijit.range.getCommonAncestor(scStartNode,scEndNode);	
						selOffset = resvCursor? this._getSelOffset(this.getParentBlockNode(root)) : null;
	
						var range = dijit.range.create(scStartNode.ownerDocument.defaultView);
						range.setStartAfter(scStartNode);
						range.setEndBefore(scEndNode);	
						// mark misspelled word block by block
						// get the start block and end block for iterate
						var startAncestor = dijit.range.getBlockAncestor(range.startContainer);
						startBlock = startAncestor.blockNode || startAncestor.blockContainer;
						var endAncestor = dijit.range.getBlockAncestor(range.endContainer);
						endBlock = endAncestor.blockNode || endAncestor.blockContainer;
						// get the offset in the start block
						var startOffset = this._getOffset(startBlock, range.startContainer, range.startOffset);
						// get the offset in the end block
						var endOffset = this._getOffset(endBlock, range.endContainer, range.endOffset);
						

						function markBlock(blockNode, nextNode){// block node
							//if (this.isChild(nextNode, blockNode, root))
							//	return false;
							var text = this._getBlockText(blockNode);
							spellcheckerManager.debug("block text: " + text);
							var start = 0;
							var bEndBlock = (blockNode == endBlock);
							if (blockNode == startBlock){
								if (startBlock != endBlock){
									text = text.substring(startOffset);
								}
								else{
									text = text.substring(startOffset, endOffset);
								}
								start = startOffset;
							}
							else if (blockNode == endBlock){
								text = text.substring(0, endOffset);
							}		
							
							var match = regMiss.exec(text);
							
							var walkLength = 0;
							var misWordBlock = {};						
							function markTextNode(node){								
								if(this._getBlock(node, blockNode) != blockNode || node == blockNode)
									return false;
								if (node.nodeType != 3)//img || br || immediate sub block 
									walkLength += 1;							
								do{
									var bMisInThisNode = false;
									
									var sPosition = match.index + start;
									var ePosition = sPosition +match[0].length;																		
									var nodevalue=node.nodeValue||"";
									var nodeLength=nodevalue.length;
									var nodeEndOffset = walkLength+nodeLength;
									if((sPosition>=0) && (nodeEndOffset>sPosition)&&!misWordBlock.startNode){
										misWordBlock.startNode=node;
										misWordBlock.startOffset=sPosition-walkLength;
									}
									if((ePosition >=0) && (nodeEndOffset>=ePosition)){
										misWordBlock.endNode=node;
										misWordBlock.endOffset=ePosition-walkLength;
										var misRange = dijit.range.create(node.ownerDocument.defaultView);
										misRange.setStart(misWordBlock.startNode,misWordBlock.startOffset);
										misRange.setEnd(misWordBlock.endNode,misWordBlock.endOffset);
										markedAtleastOnce = true;
										var spanNode = this._markMisWord(misRange, match[0], resvCursor);										
										if (dojo.isArray(spanNode)){
											spanNode = spanNode[spanNode.length -1 ];
										}
										//node = spanNode.nextSibling ? this._getNextNode(spanNode.nextSibling, null, spanNode.parentNode,3):null;
										if (misWordBlock.endOffset == nodeLength){
											node = null;
										}
//										else if (spanNode.nextSibling.nodeType == 3){
//											node = spanNode.nextSibling;
//										}
										else if(spanNode.nextSibling){
											if (spanNode.nextSibling.nodeType == 3){
												node = spanNode.nextSibling;
											}
											else{
												node = this._getNextNode(spanNode.nextSibling, null, spanNode.parentNode,3);
											}
										}
										else
											node = null; //the splitted node will be processed at the next iterationweiwen
										walkLength+=misWordBlock.endOffset;
										misWordBlock={};// clean up

										bMisInThisNode = true;
										match = regMiss.exec(text);// get next missword										
										if (!match)
											return true;
									}
									if (!bMisInThisNode){
										walkLength = nodeEndOffset;
									}
								}while (bMisInThisNode && node)
								return false;
							}

							if (match)
							{
								var checkEnd = null;
								if(blockNode == endBlock)
									checkEnd = scEndNode;
								this._iterateNode(blockNode, checkEnd, blockNode, this._textNodeFilter(), markTextNode);
							}
								


							return bEndBlock;
						}
	
						// mark words block by block
						this._iterateNode(startBlock, endBlock, root, new RegExp("^(?:"+this.block+")$","i"), markBlock);	
					}
				}
				catch(e){
					console.warn("exception is caught when marking for request " + e);
				}
				
				// make sure start and end node are removed
				startNodeList.forEach(dojo.hitch(this, function(node){
						spellcheckerManager.debug("start " + dojo.attr(node, this.tagStartID) +" is removed");
						node.parentNode.removeChild(node);
				}));
				endNodeList.forEach(dojo.hitch(this, function(node){
						spellcheckerManager.debug("end " + dojo.attr(node, this.tagEndID) +" is removed");
						node.parentNode.removeChild(node);
				}));
				
				try
				{
					if( markedAtleastOnce )
					{
						this._iterateNode(startBlock, endBlock, root, new RegExp("^(?:"+this.block+")$","i"), this._removeEmptyTextSpanNode);
						if (resvCursor && selOffset){
							this._restoreSel(selOffset);
						}
					}
					
				}
				catch(e)
				{
					console.warn("exception is caught when clear empty span after marking for request " + e);
				}
				//console.timeEnd("mis "+sRegMiss);
		}, // end _markMisspellForRequest
		
		_getBlock : function(node, rblock) {
			if(node == rblock)
				return rblock;	
			while((node = node.parentNode) != rblock){
				if(this._isBlock(node))
					return node;
			}
			return rblock;
				
		},
		
		
		
		_textNodeFilter : function(){
			return dojo.hitch(this, function(oNode){
				//if ((oNode.nodeType == 3) || (oNode.tagName.toUpperCase() == "IMG") || (oNode.tagName.toUpperCase() == "BR"))
				
				if (((oNode.nodeType == 3) && !this._isInFieldNode(oNode)) || 
						(spellcheckerManager._tagNameEquals(oNode.tagName, "IMG")) ||
						(spellcheckerManager._tagNameEquals(oNode.tagName, "BR")) || this._isFieldNode(oNode) || this._isBlock(oNode))
					return true;
				
				else
					return false;
			});
		},
		
		// wrap the given range by span
		// return the span node
		_markMisWord : function(misRange, word, resvCursor){
				// if this range is within a mis span
				var spanNode = null;
				if (((spanNode = this._getMisspellNode(misRange.endContainer)) != null) || 
					((spanNode = this._getMisspellNode(misRange.startContainer)) != null))
					return spanNode;
				spellcheckerManager.debug("mark: " + word);
//				var spanNode = this.document.createElement("span");
//				dojo.attr(spanNode, this.attrMis, word);
				var spanNodes = [];

					var startNode = null;
					var endNode = null;
					
					
					var startContainer = misRange.startContainer, startOffset = misRange.startOffset;
					if (misRange.endOffset == this._getText(misRange.endContainer).length)
						endNode = misRange.endContainer;
					else{
						var afterEnd = this.splitText(misRange.endContainer,misRange.endOffset); //misRange.endContainer.splitText(misRange.endOffset);
						endNode = afterEnd.previousSibling;
					}
//					if (this._getText(afterEnd) == "")//destroy empty text node, need delete it?
//						dojo.destory(afterEnd); 

					if (misRange.startOffset == 0){
						startNode = startContainer;
					}else{
						var bSameNode = false;
						if(dojo.isIE == 9)
						{
							bSameNode = (endNode == startContainer);
							startNode = this.splitText(startContainer,startOffset); //misRange.startContainer.splitText(misRange.startOffset);
						}
						else
						{
							bSameNode = (endNode == misRange.startContainer);
							startNode = this.splitText(misRange.startContainer,misRange.startOffset);
						}
						if (bSameNode)
							endNode = startNode;
					}

					// before: <p><span>a bc</span><I>e d</I></p>
					// after: <p><span>a </span><span>bc</span><I>e</I><I> d</I></p>
					var commonParent = null;										
					try{
						commonParent = dijit.range.getCommonAncestor(startNode,endNode); // may have bug on IE9, catch it					
						if (commonParent.nodeType == 3){
							commonParent = commonParent.parentNode;
					}
					}catch(e)
					{
						console.log("an error happen in dijit.range.getCommonAncestor(startNode,endNode): " + e);
						commonParent = this.getParentBlockNode(startNode); // startNode and endNode shared same block when mark a misspelling word.
					}
				
					var parent = commonParent;
					var spanParent = null;
					var parentPath = [];
					while (!this._isBlock(parent)){
						parentPath[parentPath.length] = parent;
						if( !spellcheckerManager._tagNameEquals(parent.tagName, "SPAN") ){
							parent = parent.parentNode;
						}
						else{
							spanParent = parent;
							break;
						}
					}
					
					commonParent = spanParent ? spanParent.parentNode : commonParent;
					var startParent = null;
					var endParent = null;
										
					this._splitTree(startNode, commonParent, false);
					this._splitTree(endNode, commonParent, true);
					
					startParent = startNode;
					while(startParent.parentNode != commonParent){
						startParent = startParent.parentNode;
					}
					endParent = endNode;
					while(endParent.parentNode != commonParent){
						endParent = endParent.parentNode;
					}
					var spanNodes = [];
					var oNode = startParent;
					var next = endParent.nextSibling;
					while(oNode && oNode != next){
						var nextNode = oNode.nextSibling;
						var span = null;						
						if( oNode.nodeType == 3 && this._getText(oNode).length ){
							span = this.document.createElement("span");
							span.appendChild(oNode);
							if (nextNode != null)
								commonParent.insertBefore(span, nextNode);
							else
								commonParent.appendChild(span);
						}else if(spellcheckerManager._tagNameEquals(oNode.tagName, "SPAN")){// oNode is a span
							span = oNode;
						}
						else
						{//what's this?? empty text?
							try{
								console.log("_markMisWord may have an error: " + word);
								console.log("node type: " + oNode.nodeType);
							}catch(e)
							{
							}
						}
						if(span)
						{
							dojo.attr(span, this.attrMis, word);
							dojo.addClass(span, this.classMis);
							dijit.setWaiState(span,"invalid",true);
							spanNodes[spanNodes.length] = span;
						}
						oNode = nextNode;						
					}
					
					return spanNodes;
		}, // end _markMisWord

		disableSpellCheck : function() {
			dojo.forEach(this.readonly_nodes, dojo.hitch(this, "_disableSpellCheckOneNode"));
			dojo.forEach(this.editable_nodes, dojo.hitch(this, "_disableSpellCheckOneNode"));
		}, // end disableSpellCheck
		
		_disableSpellCheckOneNode : function (node){
			if (node.nodeName.toUpperCase()=="#DOCUMENT"){
				node = node.body;
			}
			if (spellcheckerManager.bNative == true){
					node.spellcheck = false;
					if (node.nodeName.toUpperCase()=="DIV"){
						dojo.attr(node, "contenteditable", "false");
					}
			}

		}, // end _disableSpellCheckOneNode		
		
		reset : function() {
			dojo.forEach(this.readonly_nodes, dojo.hitch(this, "_resetOneNode"));
			dojo.forEach(this.editable_nodes, dojo.hitch(this, "_resetOneNode"));		
			dojo.query("["+this.tagStartID+"]", this.document).forEach(function(oNode){
				oNode.parentNode.removeChild(oNode);
			});
			dojo.query("["+this.tagEndID+"]", this.document).forEach(function(oNode){
				oNode.parentNode.removeChild(oNode);
			});
						
		},
		
		/**
		 * Remove the sc attr and class on the node. 
		 * called by other services, such as copy/paste.
		 */
		resetOneNode : function(node, keepSpan) {
			this._resetOneNode(node, keepSpan);
		},
		
		_resetOneNode : function (node, keepSpan){
			dojo.query("["+this.attrMis+"]", node).forEach(dojo.hitch(this, function (theNode){
					this._removeSCAttribute(theNode, keepSpan);
			}));
			dojo.query("."+this.classMis, node).forEach(dojo.hitch(this, function (theNode){
				this._removeSCAttribute(theNode, keepSpan);
			}));
			dojo.query("["+this.tagStartID+"]", node).forEach(function(oNode){
				oNode.parentNode.removeChild(oNode);
			});
			dojo.query("["+this.tagEndID+"]", node).forEach(function(oNode){
				oNode.parentNode.removeChild(oNode);
			});
						
			if (node.normalize)
				node.normalize();
		}, // end _resetOneNode
		

		_getMisspellNode : function (node){
			if (node == null)
				return null;
			var misNode = null;			
			do{
				if( spellcheckerManager._tagNameEquals(node.tagName, "SPAN") ){				
					if (dojo.hasAttr(node, this.attrMis)){
						misNode = node;
						break;
					}
				}
				else if (this._isBlock(node)){
						break; 
				}
			}while ((node=node.parentNode)!=this.document.body && node);

			return misNode;
		}, // return _getMisspellNode
				
		_isInFieldNode : function (node){
			if (node == null)
				return false;
			do{
				if(this._isFieldNode(node)){
						return true;
				}
				else if (this._isBlock(node)){
						return false; 
				}
			}while ((node=node.parentNode)!=this.document.body && node);
			return false;
		}, // return _getMisspellNode
		
		_isFieldNode : function(node) {
			if( spellcheckerManager._tagNameEquals(node.tagName, "SPAN") && 
					dojo.hasAttr(node, "contenteditable") && 
					dojo.attr(node, "contenteditable") == "false")
					return true;
			if(spellcheckerManager._tagNameEquals(node.tagName, "A")) // take <a> as a field
				return true;
			// 42561: [Co-editing]There have additional text add for the insert new shape
			// title node in shape svg node
			if (spellcheckerManager._tagNameEquals(node.tagName, "title") &&
				window.pe.scene.docType == "pres")
				return true;
			
			return false;
		},
				
		_getSeperatorReg : function(){			
			return spellcheckerManager.getSeperatorReg();
		},
	
		//remove spellcheck.css and add stylesheet by js
		_addStyles : function (){
			var cssLoaded = false;
			var head = null;
			dojo.query('head', this.document).some(function(oNode){
					head = oNode;
					return true;
				});
			dojo.query('style[type=\"text/css\"][id="spellcheckStyle"]', head).some(function(oNode){
						 cssLoaded = true; 
						 return true;						 
					});
			if(window.pe.scene.docType == "pres" && dojo.isIE){
				cssLoaded = false;
			}
			if (!cssLoaded){
				if(dojo.isIE && dojo.isIE < 11){
					var css = document.createElement('style');
					css.setAttribute('type', 'text/css');
					css.id = "spellcheckStyle";
					var cssText = ".concordscEnabled .misspellWord {background-image:url(" +
							window.contextPath + window.staticRootPath +
							"/images/underline.gif)!important;" +
							"background-position: center bottom !important;" +
							"background-repeat: repeat-x !important;}";
 					css.styleSheet.cssText = cssText;
					head.appendChild(css);
				}
				else{
					var stylesheet = this.document.createElement("style");
					stylesheet.type = "text/css";
					stylesheet.id = "spellcheckStyle";
					stylesheet.innerHTML = ".concordscEnabled .misspellWord {" +
							"background-image:	url(" +
							window.contextPath + window.staticRootPath +
							"/images/underline.gif)!important;" +
							"background-position: center bottom !important;" +
							"background-repeat: repeat-x !important;}";
					head.appendChild(stylesheet);
				}					
			}	
			if(spellcheckerManager.bChecked)
				this.addScStyle();
		}, // end _addStyles

		connectEvents : function () {
			if (this.eventHandlers.length == 0){
				if (this.editable_nodes.length > 0){
					console.info("connnect events");
					this.eventHandlers.push(dojo.connect(this.document, "onkeydown", this, this.onKeydown));
					this.eventHandlers.push(dojo.connect(this.document, "onkeypress", this, this.onKeyPressed));
					//this.eventHandlers.push(dojo.connect(this.document, "onkeyup", this, this.onKeyReleased));
					this.eventHandlers.push(dojo.connect(this.document, "onmouseup", this, this.onMouseUp));
//					this.eventHandlers.push(dojo.connect(this.document.body, "onblur", this, this.onBlur));
					this.eventHandlers.push(dojo.connect(this.document.body, "oncut", this, this.onCut));
//					this.eventHandlers.push(dojo.connect(this.document, "onpaste", this, this.onPaste));
				}
			}
		}, // end of connectEvents
		
		disconnectEvents : function () {
			dojo.forEach(this.eventHandlers, dojo.disconnect);
			this.eventHandlers = [];			
		}, // end of disconnectEvents
		
		subscribeMsg : function () {
			if (this.subscriptionHandlers.length == 0){
				//this.subscriptionHandlers.push(dojo.subscribe("concordsc::runSc", this, dojo.hitch(this, "runSc")));
				this.subscriptionHandlers.push(dojo.subscribe("concordsc::autoScaytEnabled", this, dojo.hitch(this, "enableAutoScayt")));
				this.subscriptionHandlers.push(dojo.subscribe("concordsc::scaytReset", this, dojo.hitch(this, "reset")));
				this.subscriptionHandlers.push(dojo.subscribe("concordsc::serviceAvailable", this, dojo.hitch(this, "enableConcordSpellcheck")));
				this.subscriptionHandlers.push(dojo.subscribe("concordsc::languageChanged", this, dojo.hitch(this, "spellcheckLangChanged")));				
			}
		},
		
		unsubscribeMsg : function () {
			dojo.forEach(this.subscriptionHandlers, dojo.unsubscribe);
		},
		
		_reverseStr : function(s)
		{
			return s.split("").reverse().join("");
		},
			
		/**
		 * get next separator offset comparing current offset
		 * get previous separator offset comparing current offset if reverse = true 
		 */		
		_getNextSeparatorOffset: function(node, curOff, reverse, skipCurOff)
		{
			var off = -1;
			if(!node) 
				return off;					
			
			var str = this._getText(node);
			if(str && str.length!=0)
			{							
				if(reverse)
				{
					if(curOff!=null)
					{ 					
						str = skipCurOff? str.substring(0, curOff) : str.substring(0, curOff+1);						
					}
									
					var revstr = this._reverseStr(str);						
					var result = this._getSeperatorReg().exec(revstr);						
					if(result)
					{
						off = revstr.length - 1 - result.index;
					}	
				}
				else
				{				
					if(curOff!=null)
					{
						str = skipCurOff? str.substring(curOff+1) : str.substring(curOff);		
					}
																			
					var result = this._getSeperatorReg().exec(str);
					if(result)
					{						
						off = curOff? curOff + result.index : result.index;
					}										
				}
			}				 
			
			return off;		  
		},		
				
		_createTagNode: function(range)
		{
			spellcheckerManager.debug("enter: _createTagNode");
			try{
				var sNode = range.startContainer;
				var sOffset = range.startOffset;			
				var eNode = range.endContainer;
				var eOffset = range.endOffset;
				
				var startTagNode=null, endTagNode=null;			  		  
			
				if( this._evaluateNode(eNode, 3) )
				{
				    if( eOffset == 0 )
				    	endTagNode = this._getNextNode(eNode, null, null, null, true); //reverse
				    if(!endTagNode)
				    {
						str = this._getText(eNode);
					    if(eOffset == 0 || str.length == eOffset || str.length==1)	
					    {
					    	endTagNode = eNode;
					    }
					    else
					    {
					    	this.splitText(eNode,eOffset); //eNode.splitText(eOffset);
					    	endTagNode = eNode;
					    }
				    }
				}
				else
				{
					endTagNode = eNode;
				}	
				
				if( this._evaluateNode(sNode, 3) )
				{
				    str = this._getText(sNode);
				    if(str.length == sOffset)
				    	startTagNode = this._getNextNode(eNode, null, null, null, false);
				    if(!startTagNode)
				    {
					    if(sOffset == 0 || str.length == sOffset || str.length==1)
					    {
					    	startTagNode = sNode;
					    }
					    else
					    {
					    	startTagNode = this.splitText(sNode,sOffset); //sNode.splitText(sOffset);
					    }
				    }
				}
				else
				{
					startTagNode = sNode;
				}						
						
			} catch(e) {
			    console.log("error to create instant spell check tag nodes: "+e);
				return null;	
			}
			
			if(startTagNode && endTagNode)
			{
				return [startTagNode, endTagNode];
			}
			
			
			return null;			
		},
		
		/**
		 * "HELLO"  -> 0H1E2L3L4O5
		 *             selection offset 
		 *             n -- node
		 *             o -- offset
		 *             s -- if separator just typed
		 */
		_createTagRange: function(n, o, s)
		{
			var node = this.getBoundaryNode(n, o);					
			var loffset = o;
			var eoffset = loffset;
			
			if(node != n)
				eoffset = 0;
				
			if(!node) return null;
			
			var range = dijit.range.create(node.ownerDocument.defaultView);  	  
		    
			// get next separator and set it as range end
			var nextOff = this._getNextSeparatorOffset(node, eoffset); // next separator than this one.
			if(nextOff < 0)
			{				
				do{
					var nextNode = this._getNextNode(node, null, null, 3);
					var nextNonTextStyleNode = node;
					while (nextNonTextStyleNode = this._getNextNonStyleNode(nextNonTextStyleNode, nextNode)){
						if (nextNonTextStyleNode.nodeType != 3)
							break;
						if (this._getText(nextNonTextStyleNode).length!=0)
							break;
					}
					if (nextNonTextStyleNode && (nextNonTextStyleNode != nextNode) )
					{// 1. got a separator node
						node = nextNonTextStyleNode;						
						nextOff = 0;				
					}	
					else if(nextNode)
					{// 2. try next text Node
						node = nextNode;
						nextOff = this._getNextSeparatorOffset(node, 0);
					}
					else
					{// 3. there is no text node after
						if(node && node != n)
							nextOff = this._getText(node).length;
					}	
				}while(nextOff == -1 && nextNode != null)	
				
				if(nextOff < 0) // no separator after loffset
				{
					nextOff = eoffset;
					node = n;
				}
			}

			if(!node) return null;
			
			range.setEnd(node, nextOff);
				
			// get previous separator and set it as range start
			if( loffset >= 1 && s) // loffset refers to the later of last char
				loffset -= 1;			
			
			node = this.getBoundaryNode(n, o);	
			if(node != n)
				loffset = 0;					
			
			var presOff = this._getNextSeparatorOffset(node, loffset, true, true); //reverse
		    if(presOff < loffset && presOff >= 0)
		    {			
		    	range.setStart(node, presOff);			    
		    }
		    else
			{				
				var off = -1;						
				do{
						var previousNode = this._getNextNode(node, null, null, 3, true); //reverse
						var nextNonTextStyleNode = node;
						while (nextNonTextStyleNode = this._getNextNonStyleNode(nextNonTextStyleNode, previousNode, true)){
							if (nextNonTextStyleNode.nodeType != 3)
								break;
							if (this._getText(nextNonTextStyleNode).length!=0)
								break;
						}
						if (nextNonTextStyleNode && (nextNonTextStyleNode != previousNode) )
						{// 1. got a separator node
							node = nextNonTextStyleNode;							
							off = 0;				
						}	
						else if(previousNode)
						{
							node = previousNode;
							off = this._getNextSeparatorOffset(node, null, true); //reverse
						}
				}while(off == -1 && previousNode != null)	    			

				if(!node) return null;
				
				if(off == -1) // did not found separator, set at the first of first text node.
					off = 0;					
				
				// set as first child for block?
//				if(this._isBlock(node)&& off == 0){			
//					node = node.firstChild;					
//				}	
				

				range.setStart(node, off);
			}
		    		
			return range;
		},		
		
		_getRangeStr: function(range)
		{						
			var startNode = range.startContainer;
			var endNode = range.endContainer
			var startOffset = range.startOffset;
			var endOffset = range.endOffset;
			var str = "";
			
			var getNodeText = function(node)
			{
				tStr = this._getText(node);
				if(startNode == endNode)
				{
					str += tStr.substring(startOffset, endOffset);
				}
				else if(node == startNode)
				{
					str += tStr.substring(startOffset);
				}	
				else if(node == endNode)
				{
					str += tStr.substring(0, endOffset);
				}	
				else
				{
					str += tStr;
				}
			};
			
			// reset startNode and endNode if it's a block node
			var boundaryNode = this.getBoundaryNode(startNode, startOffset);
			if(startNode != boundaryNode)
			{
				startNode = boundaryNode;
				startOffset = 0;
				
			}
			boundaryNode = this.getBoundaryNode(endNode, endOffset);
			if(boundaryNode != endNode)
			{
				endNode = boundaryNode;
				endOffset = 0;
			}									
			
			this._iterateNode(startNode, endNode, null, this._getTextFilter(), getNodeText);
			
			return str;
		},
		
		_removableSpan: function(node) 
		{		
			try {
				var sel=this._getSel(); 
				var curRange = ( sel && sel.rangeCount ) ? sel.getRangeAt(0) : null;
				if(curRange)
				{
					var span = this.getBoundaryNode(curRange.endContainer, curRange.endOffset);			
					do {
						if(span == node)
							return false;
					} while((span=span.parentNode)!=this.document.body && span)
				}
			} catch(e) { 
				console.log("removableSpan: error: " + e);
				return false;
			}
			var bookMarkAttr = node.getAttribute('_fck_bookmark');
			if(bookMarkAttr)
				return false;
			
			return true;
		},
			
		_removeEmptyTextSpanNode: function(node)
		{		
			if(!node) return;

			if(node.nodeType != 3) node.normalize();  // delete empty text node
			
			var cleaned;
			do{
				cleaned = true; // assume this is last pass
				dojo.query("span", node).forEach(dojo.hitch(this, function (theNode){				
					if(this._removableSpan(theNode))
					{
						var length = theNode.childNodes? theNode.childNodes.length : 0;
						if(length == 0)
						{
							theNode.parentNode.removeChild(theNode);
							cleaned = false;  // not last pass, need try again
						}
					}
				}));
			}while(!cleaned);
		},
		
		wordBetweenRanges: function(r1, r2)
		{
			if(!r1 || !r2)
				return false;		
			
			if(r1 == r2)
				return false;					
			
			// 1. for different node, we do check it anyway.
			if(r1.endContainer != r2.endContainer)   
				return true;
			
			// 2. if one of the range is block, check the word
			if(this._isBlock(r1.endContainer) || this._isBlock(r2.endContainer))
			{			
				return true;
			}
			else
			{// 3. if in same node, check if there is a separator
				var str = this._getText(r1.endContainer);
				var subStr = str? r1.endOffset > r2.endOffset? str.substring(r2.endOffset, r1.endOffset) : str.substring(r1.endOffset, r2.endOffset) : null;
				var match = subStr? this._getSeperatorReg().exec(subStr) : null;
				
				if(match)
					return true;
			}
			
			return false;

		},
		
		/**
		 * n -- container
		 * o -- offset
		 * get the DFS node if the "n" is an element
		 */
		getBoundaryNode: function(n, off)
		{
			var boundaryNode = n, childCount;
			if(n.nodeType == 1) 
			{// element
				childCount = boundaryNode.childNodes.length;
				if(childCount > 0)
				{
					if ( childCount > off )
					{
						boundaryNode = boundaryNode.childNodes[off];
						while ( boundaryNode.firstChild )
							boundaryNode = boundaryNode.firstChild;
					}
					else		
					{	// startOffset > childCount but childCount is not 0
						// Try to take the node just after the current position.						
						while ( boundaryNode.lastChild )
							boundaryNode = boundaryNode.lastChild;											
					}
				}
			}
			
			return boundaryNode;
		},
		
		_getNonBlockNode: function(n, index)
		{
			if( (this._isBlock(n) || n == this.document.body) && n.childNodes && n.childNodes.length>index)
				return this._getNonBlockNode( n.childNodes[index], 0);
			
			return n;
		},
		
		/**
		 * if the two range in same block
		 * check collapsed range only
		 */
		_inSameBlock: function(r1, r2)
		{
			if(!r1 || !r2)
				return false;
			
			var r1s=r1.startContainer, r1o=r1.startOffset, r2s=r2.startContainer, r2o=r2.startOffset;
			var n1 = this._getNonBlockNode(r1s, r1o); 
			var n2 = this._getNonBlockNode(r2s, r2o);
			
			return ( this.getParentBlockNode(n1) == this.getParentBlockNode(n2) );
		},
		
		isBlock: function(n)
		{
			return this._isBlock(n);
		},
		
		_isBlock: function(n)
		{
			var blockReg = new RegExp("^(?:"+this.block+")$","i");
			if(n && n.tagName && blockReg.test(n.tagName) )
				return true;
			
			return false;
		},
		
		getParentBlockNode: function(node)
		{
			do{
				if(this._isBlock(node))
				{			
					return node;
				}		
				node = node.parentNode;
			}while(node && node.parentNode)			
		},
		
		doInstantCheck: function(curRange, checkRange, resvCursor)
		{
			var wd = this._getRangeStr(checkRange); 
			spellcheckerManager.debug("range word is: "+wd);
			if(wd && wd.length >= 1)
			{				
				if(resvCursor && !this._inSameBlock(curRange, checkRange))
				{// double check if really need reserve cursor, which consume much CPU and have issues when restore.
					resvCursor = false;
				}					
				var bNode=null,selOffset=null;
				if(resvCursor)
				{
					bNode = this.getParentBlockNode( dijit.range.getCommonAncestor(curRange.startContainer,curRange.endContainer) );
					selOffset = this._getSelOffset(bNode);
				}
				
				var nodes = this._createTagNode(checkRange); // split text will cause cursor change
								
				if(nodes && nodes.length > 1)
				{
					checkRange.detach();
					checkRange = null;

					var parentRoot = dijit.range.getCommonAncestor(nodes[0], nodes[1]);
					// enlarge the check range if revising a misspelling word. ensue incorrect mark get removed. 
					var misSpan = nodes[0].parentNode;
					var startNode = ( misSpan && spellcheckerManager._tagNameEquals(misSpan.tagName, "SPAN") && dojo.hasClass(misSpan, this.classMis)) ? misSpan : nodes[0];
					this._spellCheckNodes(startNode, nodes[1], parentRoot, selOffset, resvCursor, false);
				}
				else if(resvCursor && selOffset)
					this._restoreSel(selOffset);

			}		
		},
		
		_isInLinkElement: function(evt)
		{
			var sel=this._getSel();
			var curRange = sel? sel.getRangeAt(0) : null;
			if(curRange)
			{						
				var boundaryNode = this.getBoundaryNode(curRange.endContainer, curRange.endOffset); // the deepest node
				var parent = boundaryNode.parentNode;
				if((boundaryNode && spellcheckerManager._tagNameEquals(boundaryNode.tagName, "A")) || (parent && spellcheckerManager._tagNameEquals(parent.tagName, "A")))
				{// This is an <a> element 
					return true;
				}
			}
			return false;
		},
				
		_needCheck: function(evt) {
			if( this._getSeperatorReg().test(evt.keyChar) )
			{					
				if(dojo.isIE && this._isInLinkElement(evt))
				{// don't check a <a> element
					return false;
				}
				return true;
			}
			
			return false;	
		},
		
		/**
		 * Handler of lastRangeTimer
		 */
		_setLastRange : function()
		{
			try
			{
				if(this.lastRange)
				{
					this.lastRange.detach();
					this.lastRange = null;
				}
				
				var range = this._getSel().getRangeAt(0);
				this.lastRange = range? range.cloneRange() : null;
				
				//spellcheckerManager.debug("_setLastRange, start:" + this._getText(this.lastRange.startContainer));
				//spellcheckerManager.debug("_setLastRange, end:" + this._getText(this.lastRange.endContainer));
			}
			catch(e)
			{// catch any exception to ensure timer could be reset
			}
			// reset timer after get the lastRange
			this.lastRangeTimer = null;
		},
		
		onKeydown: function (evt) {
			console.info("lala , spell check onkeydown")
			if(this.isAutoScaytEnabled() && 
					(
							dojo.keys.ENTER == evt.keyCode || (dojo.isChrome && (evt.keyCode == 32))
					)
				) 
			{//3.2 to check reserved lastRange if enter pressed
			 //enter key may not be caught by key release event for firefox.
				var targetNode = this.getEditableNode(evt.target);
				if ( targetNode != null ){				 
						this.lastRange = null;
						var curRange = this._getSel().getRangeAt(0);
						if(curRange)
						{
							// preserve the endContainer and use it in timer to calculate checking word 
							// as the curRange may be changed by CK on Safari, this is dojo range behavior
							var endNode = curRange.endContainer;
							var endOffset = curRange.endOffset;
							setTimeout(dojo.hitch(this, function(){																	
								try{																								
									var checkRange = this._createTagRange(endNode, endOffset, true);
									this.doInstantCheck(curRange, checkRange, false);
									if(this.lastRangeTimer == null)
										this._setLastRange();
								} catch(e) { 
									console.log("onKeydown: error to do instant spell check: " + e);
								}
							}), 30); // 30 interval is to get the range after enter took effect
						}
				}
				
				// to delete the misspell attribute and class for new created block.
				setTimeout(dojo.hitch(this, function(){																	
					try{																			
						var sel=this._getSel();
						var curRange = sel? sel.getRangeAt(0) : null;
						var boundaryNode = this.getBoundaryNode(curRange.endContainer, curRange.endOffset);
						var span = spellcheckerManager._tagNameEquals(boundaryNode.nodeName, "BR") ? boundaryNode.previousSibling : boundaryNode;
						while( span && !spellcheckerManager._tagNameEquals(span.tagName, "SPAN"))
						{
							span = span.parentNode;
						}
						
						// got the span
						if(span && spellcheckerManager._tagNameEquals(span.tagName, "SPAN"))						
						{
							var misAttr = span.getAttribute(this.attrMis);
							if(misAttr && this._IsInvalidMark(span, misAttr)){
								dojo.removeAttr(span, this.attrMis);
								dojo.removeClass(span, this.classMis);
								dijit.setWaiState(span,"invalid",false);
							}
						}else if(boundaryNode.nodeType == 3 && 
								this._getText(boundaryNode)== " " &&
								boundaryNode.previousSibling &&
								spellcheckerManager._tagNameEquals(boundaryNode.previousSibling.tagName, "SPAN") &&
								boundaryNode.previousSibling.innerHTML == "") {
							span = boundaryNode.previousSibling;
							dojo.removeAttr(span, this.attrMis);
							dojo.removeClass(span, this.classMis);
							dijit.setWaiState(span,"invalid",false);
						}
						
					} catch(e) { 
						console.log("onKeydown: error to remove the empty span node: " + e);
					}
				}), 30);
			}
		},		
			
		onKeyPressed : function (evt) {		
			var targetNode = this.getEditableNode(evt.target);
			if ( targetNode != null ){					
				if(this.isAutoScaytEnabled()) {																
					if ( this._needCheck(evt) )
					{//1. check when separate pressed									
						setTimeout(dojo.hitch(this, function(){																	
							try{
								var sel=this._getSel(); 
								var curRange = sel? sel.getRangeAt(0) : null;
								if(this._ignoreMarked(curRange.endContainer))
									return;
								var checkRange = curRange? this._createTagRange(curRange.endContainer, curRange.endOffset, true) : null;
								if(checkRange)
								{
									if(this.lastRange)
									{
										this.lastRange.detach();
										this.lastRange = null;
									}
									this.doInstantCheck(curRange, checkRange, true);
								}	
							} catch(e) { 
								console.log("onKeyPressed: error to do instant spell check: " + e);
							}
						}),0);
					}//this._needCheck(evt)
					
					else if( dojo.indexOf(this.moveKeys, evt.keyCode) != -1 )	
					{//3.1 to check reserved lastRange if cursor move
						if(this.lastRange)
						{								
							var isTabKey = (evt.keyCode == dojo.keys.TAB);
							setTimeout(dojo.hitch(this, function(){																	
								try{																			
									var curRange = this._getSel().getRangeAt(0);
									if( this.wordBetweenRanges(this.lastRange, curRange) )
									{
										var checkRange = this._createTagRange(this.lastRange.endContainer, this.lastRange.endOffset, false);					
										this.doInstantCheck( curRange, checkRange, !isTabKey ); // don't reserve cursor for TAB
										this.lastRange.detach();
										this.lastRange = null;
									}
								} catch(e) { 
									console.log("onKeyPressed: error to do instant spell check: " + e);
								}
							}), 0);
						}																							
					}
					
					else if( dojo.indexOf(this.moveKeys, evt.keyCode) == -1 ) 
					{// 2. reserve last range when input char or cut char and then check it when cursor change when onKeyReleased or mouseUp							
						if(this.lastRangeTimer == null)
						{			
							this.lastRangeTimer = setTimeout(dojo.hitch(this, function(){																
								this._setLastRange();
							}), 0);
						}
					}				
				}//this.isAutoScaytEnabled()		
			}
		},	
	/*
		onKeyReleased : function (evt) {
			var targetNode = this.getEditableNode(evt.target);
			if ( targetNode != null ){				
				if(this.isAutoScaytEnabled())
				{ 					
					if( dojo.indexOf(this.moveKeys, evt.keyCode) != -1 )	
					{//3.1 to check reserved lastRange if cursor move
						if(this.lastRange)
						{								
							var isTabKey = (evt.keyCode == dojo.keys.TAB);
							setTimeout(dojo.hitch(this, function(){																	
								try{																			
									var curRange = this._getSel().getRangeAt(0);
									if( this.wordBetweenRanges(this.lastRange, curRange) )
									{
										var checkRange = this._createTagRange(this.lastRange.endContainer, this.lastRange.endOffset, false);					
										this.doInstantCheck( curRange, checkRange, !isTabKey ); // don't reserve cursor for TAB
										this.lastRange.detach();
										this.lastRange = null;
									}
								} catch(e) { 
									console.log("onKeyReleased: error to do instant spell check: " + e);
								}
							}), 0);
						}																							
					}
				}//this.isAutoScaytEnabled()
			}											
		},*/
		
		onMouseUp: function(evt)
		{
			if(this.isAutoScaytEnabled()) {
				var targetNode = this.getEditableNode(evt.target);
				if ( targetNode != null && this.lastRange ){//3.2 to check reserved lastRange if mouse up				
					var sel=this._getSel();					
					if(sel)
					{					
						var curRange = sel.getRangeAt(0);	
						if(this.wordBetweenRanges(this.lastRange, curRange))
						{
							setTimeout(dojo.hitch(this, function(){																	
								try{																												
									var checkRange = this._createTagRange(this.lastRange.endContainer, this.lastRange.endOffset, false);
									curRange = this._getSel().getRangeAt(0);
									this.doInstantCheck(curRange, checkRange, true);
									this.lastRange.detach();
									this.lastRange = null;
								} catch(e) { 
									console.log("onMouseUp: error to do instant spell check: " + e);
								}
							}), 0);
						}
					}
				}
			}
		},
		
//		/**
//		 * Body's on blur registered here. 
//		 * WARNING: the range will be cached by DOCUEMENT when lost focus, may cause sever issue if changed the range when do
//		 * 			spell check, we disable this function as the last word will be checked when focus in triggered by mouse event. 
//		 */
//		onBlur : function(evt)
//		{
//			if(this.isAutoScaytEnabled()) {
//				if ( this.lastRange ){//3.3 to check reserved lastRange if lost focus				
//					setTimeout(dojo.hitch(this, function(){																							
//						try{																												
//							var checkRange = this._createTagRange(this.lastRange.endContainer, this.lastRange.endOffset, false);					
//							this.doInstantCheck(null, checkRange, true); 
//							this.lastRange.detach();
//							this.lastRange = null;
//						} catch(e) { 
//							console.log("onBlur: error to do instant spell check: " + e);
//						}
//					}), 0);
//				}
//			}		
//		},
		
		/**
		 * Body's on cut registered here. 
		 */		
		onCut : function(evt)
		{
			if(this.isAutoScaytEnabled()) {
				var delay = dojo.isIE? 50 : 0;
				// the last range may set via key event handler, we need reset it after cut happens.
				if(this.lastRangeTimer == null)
				{			
					this.lastRangeTimer = setTimeout(dojo.hitch(this, function(){																
						this._setLastRange();
					}), delay);
				}
				else
				{
					clearTimeout(this.lastRangeTimer);
					this.lastRangeTimer = setTimeout(dojo.hitch(this, function(){																
						this._setLastRange();
					}), delay);
				}	
			}
		},
		
		_ignoreMarked : function(node) {
			var bIgnore = false;
			var content = this._getText(node);
			var sep = this._getSeperatorReg();
			if(content.length > 0 && content.search(sep) == content.length - 1) {
				var next = this._getNextNode(node, null, null, null, false);
				while(next && this._hasText(next)) {
					var str = this._getText(next);
					if(str.length > 0 && str.search(sep) != 0)
						return bIgnore;
					else
						break;
					next = this._getNextNode(next, null, null, null, false);
				}
				
				var span = node;
				while(span && span != this.document.body) {
					if(spellcheckerManager._tagNameEquals(span.tagName, "SPAN") &&
							dojo.hasAttr(span, this.attrMis)) {
						var curword = this.getMisspelledText(span);
						curword = this._trimText(curword, true);
						var misword = dojo.attr(span, this.attrMis);
						if(curword == misword) {
							bIgnore = true;
							break;
						}
						else
							return bIgnore;
					}
					span = span.parentNode;
				}
				
				if(bIgnore) {
					var cursor = this._getSelOffset(this.getParentBlockNode(node));
					var textNode = this.splitText(node,content.length - 1); //node.splitText(content.length - 1); 
					var newNode = textNode;
					if(dojo.hasAttr(span, "style") || this.isPres){
						newNode = span.cloneNode(false);
						this._removeSCAttribute(newNode, this.isPres);
						dojo.empty(newNode);
						newNode.appendChild(textNode);					
					}					
					var upper = span.parentNode;
					if(upper.lastChild == span)
						upper.appendChild(newNode);
					else
						upper.insertBefore(newNode, span.nextSibling);
					if(cursor) 
					this._restoreSel(cursor);
				}
			}
			
			return bIgnore;
		},
		
		_trimText : function(text, tail) {
			var sep = this._getSeperatorReg();
			if(tail)
				text = this._reverseStr(text);		
			while(text.search(sep) == 0) {
				if(text.length > 1)
					text = text.substr(1);
				else
					return "";
			}
			if(tail)
				text = this._reverseStr(text);
			return text;
		},		
		

		getEditableNode : function (node) {
			var editableNode = null;
			while (node){
				if (typeof node.spellchecker != 'undefined'){
					if (dojo.indexOf(this.editable_nodes, node)>=0){
						editableNode = node;
						break;
					}
				}			
				node=node.parentNode;
			}
			return editableNode;
		},// end getEditableNode

/////////////////////////////////////util////////////////////////////////////		
		// check if node1 is child of node2
		isChild : function(node1, node2, root){
			if (node1 == node2)
				return false;
			if (!root)
				root = this.document.body;
			if ((node1 == null) || (node2==null))
				return false;
			var parent = node1;
				while (parent && (parent=parent.parentNode)!=root){
					if (parent == node2)
						return true;
					}
				return false;
		},
		// remove the element tag
		// for example, hello <span>world</span>
		// after removing tag for <span>world</span>, the result is "hello world"
		_removeMarkTag : function (node){
			while (node.firstChild){
				/*the paragraph contatin textnode without span is invalid for presentation*/
				if(node.parentNode && (!this.isPres||(this.isPres&&node.parentNode.nodeName == "span")))
				{					
					node.parentNode.insertBefore(node.firstChild, node);
				}
				else
					break;
			}	
			if(node.firstChild == null)
				node.parentNode.removeChild(node);		
		}, // end _removeMarkTag

		_removeSCAttribute : function (node, keepSpan){
			dojo.removeAttr(node, this.attrMis);
			dojo.removeClass(node, this.classMis);
			dijit.setWaiState(node,"invalid",false);			
			if(keepSpan && keepSpan == true)
			{
				this._removeEmptyTextSpanNode(node);
			}
			else
			{			
				var clsValue = dojo.attr(node, "class");
				if (node.attributes.length == 0)
					this._removeMarkTag(node);
				else if((node.attributes.length == 1) && (dojo.hasAttr(node, "id")))
					this._removeMarkTag(node);
				else if( (node.attributes.length == 1) && (clsValue=="") )
					this._removeMarkTag(node);
				else			
					this._removeEmptyTextSpanNode(node);
			}
		},
				
		_getText : function (node) {
			//return String(dojo.isIE?node.nodeType==3?node.nodeValue:node.innerText:node.textContent);
			if (node.nodeType == 3)
				return String(dojo.isIE ? node.nodeValue : node.textContent);
			if (spellcheckerManager._tagNameEquals(node.tagName, "BR"))
				return " ";
			
			if (spellcheckerManager._tagNameEquals(node.tagName, "IMG"))
				return " ";
			
			if(this._isFieldNode(node))
				return " ";
			
			var clonedNode = node.cloneNode(true);
			dojo.query("br,img,a", clonedNode).forEach(function(oNode){
				var spaceNode = node.ownerDocument.createTextNode('\u00a0');
				oNode.parentNode.replaceChild(spaceNode,oNode);
			});
			
			
			dojo.query('span[ ' + this.editable + '=false]', clonedNode).forEach(function(oNode){
				var spaceNode = node.ownerDocument.createTextNode('\u00a0');
				oNode.parentNode.replaceChild(spaceNode,oNode);
			});

			try{
				if(dojo.isIE)
				{			
					return String(clonedNode.innerText.replace(/\r\n/g,''));
				}
				else
				{
					return String(clonedNode.textContent);
				}				
			}
			catch(e){
				console.log("error to get text: " + e);
			}
		
			dojo.destroy(clonedNode);
			
			return "";
		}, // end _getText
		
		
		_getBlockText : function (node) {
			//return String(dojo.isIE?node.nodeType==3?node.nodeValue:node.innerText:node.textContent);
			if (node.nodeType == 3)
				return String(dojo.isIE ? node.nodeValue : node.textContent);
			
			var clonedNode = node.cloneNode(true);
			next = clonedNode;
			while(next) {
				var next = this._getNextNode(clonedNode, null, clonedNode, new RegExp("^(?:"+this.block+")$","i"));
				if(next) {
					var brNode = next.ownerDocument.createElement("br");;
					next.parentNode.replaceChild(brNode,next);
				}
			}
			dojo.query("br,img,a", clonedNode).forEach(function(oNode){
				var spaceNode = node.ownerDocument.createTextNode('\u00a0');
				oNode.parentNode.replaceChild(spaceNode,oNode);
			});
			
			
			dojo.query('span[ ' + this.editable + '=false]', clonedNode).forEach(function(oNode){
				var spaceNode = node.ownerDocument.createTextNode('\u00a0');
				oNode.parentNode.replaceChild(spaceNode,oNode);
			});

			try{
				if(dojo.isIE)
				{			
					return String(clonedNode.innerText.replace(/\r\n/g,''));
				}
				else
				{
					return String(clonedNode.textContent);
				}				
			}
			catch(e){
				console.log("error to get text: " + e);
			}
		
			dojo.destroy(clonedNode);
			
			return "";
		}, // end _getText

		_getRelatedMisspelledNodes : function (node){
			var nodes = [];
			if (dojo.hasAttr(node, this.attrMis)){
				var misword = dojo.attr(node, this.attrMis);
				// check previous siblings
				var startNode = node;
				while (startNode.previousSibling && (dojo.attr(startNode.previousSibling, this.attrMis) == misword)){
					startNode = startNode.previousSibling;
				}
				var oNode = startNode;
				while (oNode && (dojo.attr(oNode, this.attrMis) == misword)){
					nodes[nodes.length] = oNode;
					oNode = oNode.nextSibling;
				}
			}
			return nodes;
			
		},
		
		/**
		 * DFS iteration of the tree, 
		 * reverse = true/false for reverse DFS 
		 */
		_getNextNode : function (node, stopNode, root, filter, reverse){
			
			if (node == stopNode){
				  return null;
			}
			root = root || this.document.body;
			
			try{		
				if(reverse)
				{				
					var pNode = node.previousSibling;
	      
					// pSibling's last child
					if(pNode)
					{
						var tNode = pNode
						while(tNode = tNode.lastChild)
						{
							pNode = tNode;      		
						}
					}      
					else
					{
						pNode = node.parentNode;
					}
	            
					if (!pNode){
						return pNode;
					}else if (!filter){
						return pNode;
					}
					else if (this._evaluateNode(pNode, filter)){
						return pNode;
					}else {
						return this._getNextNode(pNode, stopNode, root, filter, reverse);
					}      						
				}
				else
				{
				  var nextNode = node.childNodes? node.firstChild : null;			  
				  if (!nextNode){    // if next node is null
					  if(node==root) // and if start node equals root  
						  return nextNode;
					  else           // else
						  nextNode = node.nextSibling;					  
				  }
				  
	
				  if (!nextNode){
					   while ((node = node.parentNode)){
						  if (node == root)
							  break;
						  nextNode = node.nextSibling;
						  if (nextNode)
							  break;
					  }
				  }
				  if (!nextNode){
					  return nextNode;
				  }else if (!filter){
					  return nextNode;
				  }
				  else if (this._evaluateNode(nextNode, filter)){
					  	  return nextNode;
				  }else {
					      return this._getNextNode(nextNode, stopNode, root, filter, reverse);
				  }
				}
			} catch(e){
				console.log("error to getNextNode: " + e);
			}
		}, // end _getNextNode		
		
		// func return true, break the iterator
		_iterateNode : function (startNode, stopNode, root, filter, func){
				var oNode = startNode? startNode : this.document;
				if (root == null){
					// if no stop node and root specified, only check startNode and its subtree
					if (!stopNode)
						root = startNode;
					else
						root = this.document;
				}

				if (!this._evaluateNode(oNode, filter)){
					oNode = this._getNextNode(oNode, stopNode, root, filter);
				}
				while (oNode){
					var nextNode = this._getNextNode(oNode, stopNode, root, filter);
					if (dojo.isFunction(func)){
								if (func.apply(this, [oNode, nextNode])){
									break;
								}
					}
					oNode = nextNode;
				}
				
		}, // end _iterateNode

		_evaluateNode : function (node, filter){
			var bFind = true;
			if (filter){
				if (typeof filter == "number"){
					bFind = (node.nodeType == filter);
				}else if (typeof filter == "function"){
					bFind = (filter)(node);
				}
				else{
					var nodeReg = dojo.isString(filter) ? new RegExp(filter) : filter;
					try {
						bFind = nodeReg.test(node.tagName, "i");
					}
					catch(ex){
					}
				}
			}
			return bFind;
		},// end _evaluateNode

		/**
		 * get next node, which is a text node or:
		 * not a span, strong, em, b i, ...
		 * such as: img, br, ... 
		 * So, the return is, 3, img, br ...
		 */
		_getNextNonStyleNode : function (node, endNode, reverse){
			if (node == null)
				return null;
			var textNodeTag = /^(?:SPAN|STRONG|EM|B|I)$/i;
			var checkTag = dojo.hitch(this, function(oNode){
				if(this._isFieldNode(oNode))
					return true;
				if(this._isInFieldNode(oNode))
					return false;
				if (oNode.nodeType == 3)
					return true;
				return (!textNodeTag.test(oNode.tagName));
			});
			return this._getNextNode(node, endNode, null, checkTag, reverse);
		}, // end _getNextNonStyleNode
		
		_getPos:function(sPosition,ePosition,container){
			var node = null;
			var walkLength = 0;
			var block = {};
			function calcPos(node){
				var nodeValue = "";
				if (node.nodeType != 3)// br or img
					nodevalue = " ";
				else
					nodevalue=node.nodeValue||"";
					
				var strLength=nodevalue.length;
				walkLength+=strLength;
				if((sPosition>=0) && (walkLength>sPosition)&&!block.startNode){
					block.startNode=node;
					block.startOffset=sPosition-(walkLength-strLength);
				}
				if((ePosition >=0) && (walkLength>=ePosition)){
					block.endNode=node;
					block.endOffset=ePosition-(walkLength-strLength);
					if ((!block.startNode) && (sPosition==ePosition)){
						block.startNode = node;
						block.startOffset = block.endOffset;
					}
					return true;// stop iterator
				}
			}
			this._iterateNode(container, null, null, this._getTextFilter(), calcPos);

			return block;

		}, // end _getPos		

		_splitTree: function(endNode, root, includeEnd){
			var leftTree = null;
			var node = endNode;
			if (includeEnd)
				leftTree = endNode;
			while (node!=root){
				var parent = node.parentNode;
				if ((leftTree != null) || (node.previousSibling != null)){
					if (parent != root){
						var newTree = parent.cloneNode(false);	
						var child = parent.firstChild;
						while(child != node){
							var next = child.nextSibling;
							newTree.appendChild(child);
							child = next;
						}
						if (leftTree)
							newTree.appendChild(leftTree);
						leftTree = newTree;					
					}else{//parent == root
						if ((leftTree) && (leftTree != node))
							parent.insertBefore(leftTree, node);
					}
				}
				node = parent;
			
			}
		},

		_getSel : function () {
			//return dojo.isIE?this.document.selection:this.window.getSelection();
			return  dijit.range.getSelection(this.window);
		}, // end _getSel
		
		_setSel : function (selRange) {
			var sel = this._getSel();
			sel.removeAllRanges();
			sel.addRange(selRange);
		}, // end _setSel
		
		_getOffset : function (container, node, index){
			var offset = -1;
			var walk = null;
			if (container && node && (index>=0)){
				var bChild = false;
				var parent = node;
				while (parent){
					if (parent == container){
						bChild = true;
						break;
					}
					parent = parent.parentNode;
				}
				
				if (bChild){
					offset = 0;
					function addOffset(oNode){
						if (oNode == node){
							if (node.nodeType == 3)
								offset += index;
							else{
								for(var i=0;i<index;i++){
									offset+=this._getText(node.childNodes[i]).length;
								}
							}
						}
						else if (oNode.nodeType ==3){
							if(this._isInFieldNode(oNode))
								;// already calculated
							else
								offset+=(oNode.nodeValue?oNode.nodeValue : "").length;
						}else if (this._getTextFilter()(oNode)){// br or img
							offset+=1;
						}
						return false;
					}
					if(node.nodeType==3){
						this._iterateNode(container,node, null, this._getTextFilter(), addOffset);
					}else{
						this._iterateNode(container,node, null, 0,addOffset);
					}
				}
			}
			return offset;
		}, // end _getOffset		

		_getSelOffset:function(container){
			var sel=this._getSel();
			var sp,nv;
			var o={collapse:0, start:-1, end:-1};
			if((!sel) || (!sel.rangeCount)){
				return o;
			}
			var p=this.getParentElement(sel);
			if(p&&p.nodeName=="IMG"){
				return o;
			}
			var selRange= sel.getRangeAt(0);			
			var sc=selRange.startContainer,se=selRange.endContainer, an=sel.anchorNode,n,w;
								
			o.collapse = sel.isCollapsed;
			o.block = container;
			var startOffset = -1;
			var endOffset = -1;
			// minimize container
			// for example, if start and end container is in a td, container is table, 
			// we can minimize the container to the td 
			var startBlock = this.getParentBlockNode(sc);
			var endBlock =sel.isCollapsed ? startBlock : this.getParentBlockNode(se);
			var bStartBlockChildOfContainer = (startBlock == container) || this.isChild(startBlock, container);
			var bEndBlockChildOfContainer = sel.isCollapsed ? bStartBlockChildOfContainer : (endBlock == container) || this.isChild(endBlock, container);
			var bStartChildOfContainer = false;
			var bEndChildOfContainer = false;
			if (bStartBlockChildOfContainer && bEndBlockChildOfContainer){ 
				// if both start block and end block are the child of container
				// the container can be minimized
				container = this.getParentBlockNode(dijit.range.getCommonAncestor(startBlock,endBlock));
				bStartChildOfContainer = true;
				bEndChildOfContainer = true;
			}
			else{
				bStartChildOfContainer = (sc == container) || this.isChild(sc, container);
				bEndChildOfContainer = sel.isCollapsed ? bStartChildOfContainer : (se == container) || this.isChild(se, container);
				if (!bStartChildOfContainer && !bEndChildOfContainer)// neither start nor end is child of the container, no need to get offset
					return o;
				if (!bStartChildOfContainer || !bEndChildOfContainer) {// either start or end is child of the container
					if (bStartChildOfContainer && bStartBlockChildOfContainer){
						container = startBlock;
					}
					else if (bEndChildOfContainer && bEndBlockChildOfContainer){
						container = endBlock;
					}
				}
			}
			
			startOffset = bStartChildOfContainer ? this._getOffset(container, sc, selRange.startOffset) : -1;
			if (sel.isCollapsed){
				endOffset = startOffset;
			}
			else {
				endOffset = bEndChildOfContainer ? this._getOffset(container, se, selRange.endOffset) : -1;
			}
			o.start = startOffset;
			o.end = endOffset;
			o.block = container;
			o.selRange = sel.getRangeAt(0);
			return o;
		}, //end _getSelOffset
		
		_restoreSel : function (selOffset){
			if ((selOffset.start!=-1) || (selOffset.end!=-1)){
				selOffset.block.normalize();
				var newSel = this._getPos(selOffset.start, selOffset.end, selOffset.block);
				var newRange = selOffset.selRange.cloneRange();
				var bInSameNode = (newSel.startNode == newSel.endNode);
				
				if (newSel.startNode && (newSel.startOffset!= -1))
				{	
					var boundaryNode = newSel.startNode;
					if( bInSameNode && spellcheckerManager._tagNameEquals(boundaryNode.tagName, "BR") )
					{
						newRange.setStartBefore(newSel.startNode, newSel.startOffset);
					}	
					else if( bInSameNode && spellcheckerManager._tagNameEquals(boundaryNode.tagName, "IMG") )
					{
						newRange.setStartAfter(newSel.startNode, newSel.startOffset);
					}
					else
					{	
						newRange.setStart(newSel.startNode, newSel.startOffset);
					}
				}
				if (newSel.endNode && (newSel.endOffset != -1))
				{
					var boundaryNode = newSel.endNode
					if( bInSameNode && spellcheckerManager._tagNameEquals(boundaryNode.tagName, "BR") )
					{
						newRange.setEndBefore(newSel.endNode, newSel.endOffset);
					}	
					else if( bInSameNode && spellcheckerManager._tagNameEquals(boundaryNode.tagName, "IMG") )
					{
						newRange.setEndAfter(newSel.endNode, newSel.endOffset);
					}
					else
					{	
						newRange.setEnd(newSel.endNode, newSel.endOffset);
					}										
				}
					
				this._setSel(newRange);
			}

		}, //end _restoreSel		

//		_restoreSel : function (selOffset){
//			if ((selOffset.start!=-1) || (selOffset.end!=-1)){
//				selOffset.block.normalize();
//				var newSel = this._getPos(selOffset.start, selOffset.end, selOffset.block);
//				var newRange = selOffset.selRange.cloneRange();
//				if (newSel.startNode && (newSel.startOffset!= -1))
//					newRange.setStart(newSel.startNode, newSel.startOffset);
//				if (newSel.endNode && (newSel.endOffset != -1))
//					newRange.setEnd(newSel.endNode, newSel.endOffset);
//				
//				this._setSel(newRange);
//			}
//
//		}, //end _restoreSel
	
		
		_getTextFilter : function(){
			return dojo.hitch(this, function(oNode){
				//if ((oNode.nodeType == 3) || (oNode.tagName.toUpperCase() == "IMG") || (oNode.tagName.toUpperCase() == "BR"))
				
				if (((oNode.nodeType == 3) && !this._isInFieldNode(oNode)) || 
						(spellcheckerManager._tagNameEquals(oNode.tagName, "IMG")) ||
						(spellcheckerManager._tagNameEquals(oNode.tagName, "BR")) || this._isFieldNode(oNode))
					return true;
				
				else
					return false;
			});
		},

		getSelSpanNode : function() {
			var sel=this._getSel();
			// #defect 19910
			if (sel.rangeCount != 1) 
				return null;
			var selRange=sel.getRangeAt(0);
			
			var span = this._getMisspellNode(selRange.startContainer);
			if (span){
				var misword = dojo.attr(span, this.attrMis);
				// check previous siblings
				var startNode = span;
				while (startNode.previousSibling && (dojo.attr(startNode.previousSibling, this.attrMis) == misword)){
					startNode = startNode.previousSibling;
				}
				return startNode;
			}
			else
				return null;
		},
		
		getNextMisspellSpan : function(word) {		
			var spans = dojo.query('span[ ' + this.attrMis + '=' + word + ' ]', this.document);
			var node = null;
			for(var i = 0; i < spans.length; i++) {
				if(dojo.hasClass(spans[i], this.classMis)) {
					node = spans[i];
					break;
				}
			}
			
			while (node && node.previousSibling && (dojo.attr(node.previousSibling, this.attrMis) == word)){
				node = node.previousSibling;
			}
			
			return node;
		},
				
		replaceMispell: function(span, word, cursor, keepSpan) {
			if (span){
				if(cursor) {
					var currange = dijit.range.create(span.ownerDocument.defaultView);
					currange.setStartAfter(span);
					currange.setEndAfter(span);
				}
				var spans = this._getRelatedMisspelledNodes(span);
				span = spans[0]; // the first span
				span.innerHTML = word;
				this._removeSCAttribute(span, keepSpan);
				
				if (spans.length > 1){
					for (var i = 1; i < spans.length; i++){
						var theSpan = spans[i];
						theSpan.parentNode.removeChild(theSpan);
					}
				}
				if(cursor)
				this._setSel(currange);
			}
		},
		
		numMispellWord: function(span) {
			var num = 0;
			if(span){
				var spans = this._getRelatedMisspelledNodes(span);
				for (var i = 0; i < spans.length; i++){
					var theSpan = spans[i];
					num += this._getText(theSpan).length;
				}
			}
			return num;
		},
			
		
		//skip current misspelled word for the span
		skipMispellWord: function(span, misWord, isAll) {				
			if (span){
				var spans = this._getRelatedMisspelledNodes(span);
				span = spans[0]; // the first span				
				if(span && dojo.hasAttr(span, this.attrMis) && isAll) {
					misWord = dojo.attr(span, this.attrMis);
					spellcheckerManager.addSkipWord(misWord);
				}				
				
				for(var i = 0; i < spans.length; i++ ){
					dojo.removeClass(spans[i], this.classMis);	
					dijit.setWaiState(spans[i],"invalid",false);
				}
			}	
		},				
				
		//any other misspelled words
		HasOtherMispellWords : function() {
			var span = this.getSelSpanNode();
			if(span && dojo.hasAttr(span, this.attrMis)) {
				var num = 0;
				var misWord = dojo.attr(span, this.attrMis);
				var spannodes = new Array();
				
				var isRepeatMisSpan = function(node) {
					for(var i = 0; i < spannodes.length; i++) {
						if(node == spannodes[i])
							return true;
					}
					return false;
				};
				
				dojo.query('span[ ' + this.attrMis + '=' + misWord + ' ]', this.document).forEach(dojo.hitch(this, function(node){
					if(num > 1)
						return true;
					if(dojo.hasClass(node, this.classMis) && !isRepeatMisSpan(node) && !this._IsInvalidMark(node, misWord)) {
						num = num + 1;
						spannodes.push(node);
						var pre = node.previousSibling; 
						while(pre && spellcheckerManager._tagNameEquals(pre.tagName, "SPAN") && 
								dojo.hasClass(node, this.classMis)) {
							if(dojo.attr(pre, this.attrMis) == misWord)
								spannodes.push(pre);
							pre = pre.previousSibling;
						}
						
						var post = node.nextSibling;
						
						while(post && spellcheckerManager._tagNameEquals(post.tagName, "SPAN") && 
								dojo.hasClass(post, this.classMis)) {
							if(dojo.attr(post, this.attrMis) == misWord)
								spannodes.push(post);
							post = post.nextSibling;
						}
						
					}
				}));
				if(num > 1)
					return true;
			}
			return false;
		},
		
//		// return the text wrapped by <span misword=**></span>
//		// It will cause one word corresponded with several "span"s after changing style,
//		// for example:
//		//<span misword="hellow">h</span><span style="font-weight: bold;" misword="hellow">e</span>
//		// <span style="font-style: italic;" misword="hellow">l</span>
//		// <span style="font-style: italic; font-weight: bold;" misword="hellow">l</span>
//		// <span style="font-style: italic;" misword="hellow">o</span><span misword="hellow">w</span>
//		// This function need to go through these nodes to get the text
		getMisspelledText : function(node) {
			if (dojo.hasAttr(node, this.attrMis)){
				var misword = dojo.attr(node, this.attrMis);
				// check previous siblings
				var startNode = node;
				while (startNode.previousSibling && (dojo.attr(startNode.previousSibling, this.attrMis) == misword)){
					startNode = startNode.previousSibling;
				}
				var oNode = startNode;
				var text = this._getText(oNode);
				while (oNode.nextSibling && (dojo.attr(oNode.nextSibling, this.attrMis) == misword)){
					oNode = oNode.nextSibling;
					text += this._getText(oNode);
				}
				return text;
			}
			else
				return null;
		},// end getMisspelledText
		
		_hasText : function(node) {
			var textNodeTag = /^(?:SPAN|STRONG|EM|B|I)$/i;
			if (node.nodeType == 3)
				return true;
			return (textNodeTag.test(node.tagName));
		},
		
		_IsInvalidMark : function(node, misword) {
			var text = "";
			//var sep = this._getSeperatorReg();
			
			var filter = function(node) {
				return (node.childNodes.length == 0);
			};
			
			var block = this.getParentBlockNode(node);
			
			var preneibor = this._getNextNode(node, null, null, filter, true);
			//img, br and other non-text node is seen as a seperator			
			while(preneibor && /*this._hasText(preneibor) &&*/ (block == this.getParentBlockNode(preneibor))) {
				var str = this._getText(preneibor);
				
				if(this._isMispelledNode(preneibor,misword)) {
					//if(str.search(sep) != -1)
					if(spellcheckerManager.getSeparator(str) != -1)
						return true;
					else
						text = str + text;
				}
				else if(str.length != 0) {
					
					//if( this._reverseStr(str).search(sep) != 0)
					if( spellcheckerManager.getSeparator(this._reverseStr(str)) != 0)
						return true;
					else 
						break;
				}
				preneibor = this._getNextNode(preneibor, null, null, filter, true);
			}
			
			var postneibor = this._getNextNode(node, null, null, filter, false);
			//img, br and other non-text node is seen as a seperator
			while(postneibor && /*this._hasText(postneibor) &&*/ (block == this.getParentBlockNode(postneibor))) {
				var str = this._getText(postneibor);
				
				if(this._isMispelledNode(postneibor,misword)) {
					//if(str.search(sep) != -1)
					if(spellcheckerManager.getSeparator(str) != -1)
						return true;
					else
						text = text + str;
				}
				else if(str.length != 0){
					//if(str.search(sep) != 0)
					if(spellcheckerManager.getSeparator(str) != 0)
						return true;
					else
						break;
				}
				
				postneibor = this._getNextNode(postneibor, null, null, filter, false);
			}
			
			if(text == misword)
				return false;
			else
				return true;
		},
		
		//Is the node is included in a span which used to mark a misspelled word
		_isMispelledNode : function(node, word) {
			var n = node;
			while(n && n != this.document.body) {
				if(spellcheckerManager._tagNameEquals(n.tagName, "SPAN")) {
					if (dojo.hasAttr(n, this.attrMis)){
						misword = dojo.attr(n, this.attrMis);
						if(misword.toLowerCase() == word.toLowerCase())
							return true;
					}
				}
				n = n.parentNode;
			}
			return false;
		},
		
		/* get sub-string(0-first separator)
		 * dir: left sub-string or right sub-string
		**/
		/*_trimText : function(text, reverse) {
			if(reverse)
				text = this._reverseStr(text);
			var sep = this._getSeperatorReg();
			var idx = text.search(sep);
			if(idx != -1)
				text = text.substr(0, idx);
			if(reverse)
				text = this._reverseStr(text);
			return text;
		},*/
		getMisspellWord : function(node) {
			var word = '';			
			if (!node || spellcheckerManager._tagNameEquals(node.tagName, "BODY"))
				return null;
			do{				
				if (spellcheckerManager._tagNameEquals(node.tagName, "SPAN")){
					if (dojo.hasAttr(node, "misword") && dojo.hasClass(node, "misspellWord")){
						word = node.getAttribute("misword");
						break;
					}
				}
				node = node.parentNode;
			}while (node && !spellcheckerManager._tagNameEquals(node.tagName, "BODY"));	
				
			return word;
		},
				
		getCurMisspellWord : function() {
			var sel = this._getSel();
			if(sel.rangeCount != 1)
				return null;
			var range = sel.getRangeAt(0);
			var rtxt = this._getRangeStr(range);
			if(this._getSeperatorReg().exec(rtxt))
				return null;
			
			var snode = this.getBoundaryNode(range.startContainer, range.startOffset);
			var enode = this.getBoundaryNode(range.endContainer, range.endOffset);
			var startWord = this.getMisspellWord(snode);
			var endWord = this.getMisspellWord(enode);
			if(startWord == "")
				return endWord;
			if(endWord == "")
				return startWord;
			if(startWord == endWord)
				return startWord;
			return null;
		},
		
		getParentElement:function(sel){
			if(sel){
				var node=sel.anchorNode;
				while(node&&(node.nodeType!=1)){
					node=node.parentNode;
				}
				return node;
			}
		}, 
		
		// Note that we cannot use splitText() because it is bugridden in IE 9.
		splitDataNode : function(node, index) 
		{			
			function insertAfter(node, precedingNode) {
				var nextNode = precedingNode.nextSibling, parent = precedingNode.parentNode;
				if (nextNode) {
				parent.insertBefore(node, nextNode);
				} else {
				parent.appendChild(node);
				}
				return node;
			}
			var newNode = node.cloneNode(false);
			newNode.deleteData(0, index);
			node.deleteData(index, node.length - index);
			insertAfter(newNode, node);
			return newNode;
		},
		
		splitText : function(node, index)
		{
			if(dojo.isIE == 9)
				return this.splitDataNode(node, index);
			else
				return node.splitText(index);
		}// end of function
	} // end of class
);

if (typeof spellcheckerManager == 'undefined') {
	//console.debug("scaytservice is loading... ");

	spellcheckerManager = concord.spellcheck.scaytservice;
	
	dojo.mixin(spellcheckerManager, {
		bNative : false,
		bAutoScaytEnabled : false,
		bServiceAvailable : true, 
		backendServiceURL : "",
		supportedLang : ['ca-CT','cs-CZ','da-DK','nl-NL','en-AU','en-GB','en-US','fi-FI','fr-FR','fr-CA','de-DE','de-CH','el-GR','it-IT','pl-PL','pt-BR','pt-PT','ru-RU','es-ES','sv-SE','nb-NO','nn-NO','he-IL'],
		lang: "en-US",
		bDebug: false,
		bChecked: false,
		numSugg : 10,
		misWordArray : new dojox.collections.Dictionary(),// {Key:misword, value:suggestion[]}
		skipWords : new dojox.collections.ArrayList(),
		wordArray : new dojox.collections.ArrayList(),
		separator:"\\s.!\"#\u2014$%&#()*+,/~`:\u20AC;=?[]^{|}<>\u00A0\u00A7\u00A9\u00AB\u00AE\u00B1\u00B6\u00B7\u00B8\u00BB\u00BC\u00BD\u00BE\u00BF\u00D7\u00F7\u00A4\uFFFD\u2013\u201D\u201C\u200b",
		scTimerInstances : [],

		createSpellchecker : function (node, editable, bPublishStatus){
			var spellchecker = null;
			if (typeof node == 'undefined'){
				console.warn("createSpellckecker: no node specified");
			}
			else if (!spellcheckerManager.bServiceAvailable){
				console.warn("createSpellchecker: service in unavailable");
			}
			else{
				
				node = dojo.byId(node);
				if(!node){
					console.info("createSpellckecker: node is null");
					return;
				} 
				spellchecker = node.spellchecker;
				
				if (editable == null)
					editable = true;
				
				if (spellchecker == null){
					var mainDoc = null;
					if (node.nodeName.toUpperCase() == "IFRAME"){
						mainDoc = node.contentWindow.document;
					}
					else {
						mainDoc = node.ownerDocument;
					}

					if (typeof mainDoc.spellchecker == 'undefined'){
						spellchecker = new concord.spellcheck.scaytservice( mainDoc, bPublishStatus ); 
					}
					
					spellchecker = mainDoc.spellchecker;					
					spellchecker.addNode(node, editable, false);	
					
					spellchecker.enableAutoScayt(this.bAutoScaytEnabled);					
				}
			}
			return spellchecker;
		}, // end of createSpellchecker		
			
		refresh : function(node){
			if(!node)
				return;
			
			var mainDoc = null;
			if (node.nodeName.toUpperCase() == "IFRAME"){
				mainDoc = node.contentWindow.document;
			}	
			else if (node.nodeName.toUpperCase()=="#DOCUMENT")
			{
				mainDoc = node;
			}	
			else {
				mainDoc = node.ownerDocument;
			}
			
			var spellchecker = mainDoc.spellchecker;
			if (spellchecker){
				spellchecker.refresh(node);
			}
		}, // end of refresh
		
		reset : function() {
			dojo.publish("concordsc::scaytReset");
		}, // end of reset
					
		
		getSeperatorReg : function(){		
			if (this.sepReg == null){
				var re = "";
				for(var i=0;i<this.separator.length;re+="\\"+this.separator.charAt(i++)){
				}
				this.sepReg = new RegExp("["+re+"]+|^'+");
			}
			return this.sepReg;
		},
		
		getSeparator: function(str)
		{
			for(var ii=0; ii<str.length; ii++)
			{
				var ch = str.substr(ii,1);
			
				if( this.getSeperatorReg().test(ch) )					
					return ii;
			
				var code = ch.charCodeAt(0);
				if(this.isWordBoundaryChar(code))
					return ii;
			}			
			return -1;
		},		
		
		isSeparator: function(str, pos)
		{
			if(pos < 0 || pos >= str.length)
				return true;
			
			var ch = str.substr(pos,1);
			
			if( this.getSeperatorReg().test(ch) )					
				return true;
			
			var code = ch.charCodeAt(0);
			if(this.isWordBoundaryChar(code))
				return true;			
			
			return false;
		},		
		
		isWordBoundaryChar: function(code)
		{
			if(concord.i18n.CharCategory.isCJK(code))
				return true;
			
			return false;
		},
		
		isScServiceAvialable : function (){
			return spellcheckerManager.bServiceAvailable;
		}, 
		
		/**
		 * Automatic spell check
		 */
		isAutoScaytEnabled : function (){
			return spellcheckerManager.bServiceAvailable && spellcheckerManager.bAutoScaytEnabled;
		}, // end of isAutoScaytEnabled
		
		setAutoScayt: function (enabled){
			this.bChecked = true
			this.bAutoScaytEnabled = enabled;			
		},
		
		enableAutoScayt: function (enabled){
			this.bAutoScaytEnabled = enabled;
			this.bChecked = true
			this.scTimerInstances = []; // clear the timer instances when enable or disable
			dojo.publish("concordsc::autoScaytEnabled", [enabled]);			
		}, 

		setServiceAvailable : function (available){
			this.bServiceAvailable = available;
			dojo.publish("concordsc::serviceAvailable", [available]);
		}, 		

		getSupportedLang: function () {
			return this.supportedLang; // TODO: initialize lang list
		}, // end getSupportedLang
		
		setLanguage: function (language) {
			var bSucc = false;
			if (language == this.lang){ // 1. language did not change
				bSucc = true;
			}
			else if (dojo.indexOf(this.supportedLang, language) >=0){ // 2. Passed a valid language and changed
				this.lang = language;
				bSucc = true;
				dojo.publish("concordsc::languageChanged", [language]);
			}
			else{ // 3. Passed a invalid language
				this.initLanguage();
				dojo.publish("concordsc::languageChanged", [this.lang]);
				bSucc = true;
			}
			this._resetDicMenu(); 
			return bSucc;
		}, // end setLanguage
		
		isCorrectWord : function (word){
			if(word.charCodeAt(word.length - 1) == 0x200B) {
				word = word.substr(0, word.length - 1);
			}
			return (this.wordArray.contains(word));
		}, // end isCorrectWord
		
		isSkipWord : function (word){
			if(word.charCodeAt(word.length - 1) == 0x200B) {
				word = word.substr(0, word.length - 1);
			}
				
			return (this.skipWords.contains(word));
		}, // end isSkipWord
		
		isMisspelledWord : function (word){
			if(word.charCodeAt(word.length - 1) == 0x200B) {
				word = word.substr(0, word.length - 1);
			}
			return (this.misWordArray.contains(word));
		}, // end isMisspelledWord
		
		getSuggestions : function(misWord) {
			if(misWord == null)
				return null;
			var sugg = this.misWordArray.item(misWord);
			if(sugg && sugg.length > 0)
				return sugg;
			var checker = this;
			var rlt = null;
			if (misWord.length){
				var scRequest = {
					//requestId : scRequestId,
					spellChecker : checker
				};
				var request = {
						context : scRequest,
						
						url:  spellcheckerManager.backendServiceURL +"/" + spellcheckerManager.lang,
						content: {
							text: misWord,
							suggestions: this.numSugg,
							format: "json"
						},
						headers: {
							"Content-Type":"application/x-www-form-urlencoded;charset=utf-8"
						},
						handleAs: "json",
						sync: true,
						load : function (data){
							var items = data.items;
							if (items.length){
								var word = items[0].word;
								var suggs = items[0].suggestions;
								spellcheckerManager.addMisspelledWord(word, suggs);
								rlt = dojo.clone(suggs);
							}
						},

						error : function (err, ioargs) {
							if (ioargs.xhr.status == 404){
								spellcheckerManager.setServiceAvailable(false);
							}
						}
					};
				if (spellcheckerManager.lang == 'he-IL')
					request.headers = {"Content-Type":"application/x-www-form-urlencoded;charset=utf-8"};
					
				dojo.xhrGet(request);
				return rlt;
			}
			return null;
		},
		
		addCorrectWord : function (word){
			if (this.wordArray.count>=500)//max size
				return;
			if (dojo.isString(word)){
				if (!this.isCorrectWord(word)){
					this.wordArray.add(word);
				}
			}else if (dojo.isArray(word)){
				dojo.forEach(word, dojo.hitch(this, function(theWord){
					this.addCorrectWord(theWord);
				}));
			}
		}, // end addCorrectWord

		addSkipWord : function (word){
				if (!this.isSkipWord(word)){
					this.skipWords.add(word);
				}
		}, // end addSkipWord
		addMisspelledWord : function (word, suggestion){
			var oldSuggestion = this.misWordArray.item(word);
			if (oldSuggestion){ // the word has been added
				if (suggestion)
					oldSuggestion = oldSuggestion.concat(suggestion);
				this.misWordArray.remove(word);
				this.misWordArray.add(word, oldSuggestion);
			}
			else {
				if (this.misWordArray.count < 100){
					if (!suggestion)
						suggestion = new Array();
					this.misWordArray.add(word, suggestion);
				}
			}
		}, // end addMisspelledWord
		
		getDicsReg : function(){			
			if (this.dicReg == null){
				var re = "";
				for(var i=0;i<spellcheckerManager.supportedLang.length;i++){					
					re+=spellcheckerManager.supportedLang[i];
					if(i!=spellcheckerManager.supportedLang.length-1)
						re+="|";
				}
				this.dicReg = new RegExp("^"+re+"$","i");
			}
			return this.dicReg;
		},
		
		initLanguage: function()
		{
			var lng = g_locale || navigator.userLanguage || navigator.language;
			
			var enableLocales = this.getDicsReg();
			
			if(enableLocales.test(lng)) {
				spellcheckerManager.lang = lng.substr(0, 2).toLowerCase() + '-' + lng.substr(3, 2).toUpperCase();
			}
			else {
				lng = lng.substr(0, 2).toLowerCase();
				if(lang2locale[lng])
					spellcheckerManager.lang = lang2locale[lng];
			}
		},
		
		/**
		 * this is to init concord spell check language menus
		 * this function may be moved to applications side later
		 */
		_resetDicMenu: function()
		{
			if(window.pe.dicMenus)
			{
				for(var dic in pe.dicMenus)			
				{
					if(dic == spellcheckerManager.lang)
						pe.dicMenus[dic].attr("checked", true);  
					else
						pe.dicMenus[dic].attr("checked", false);  
				}
			}
		},

		debug : function (str){
			if (this.bDebug){
				console.log(str);
			}
		},
		
		_tagNameEquals : function(tagName, tag)
		{
			if(tagName && tag)
			{
				return tagName.toUpperCase() == tag.toUpperCase();
			}			
			return false;
		}		

	}); // end dojo.mixin(concord.spellcheck.scaytservice)
	
	//var enableLocales = new RegExp((/^ca-CT|da-DK|de-DE|el-GR|en-US|en-GB|es-ES|fi-FI|fr-FR|it-IT|nl-NL|pl-PL|tr-TR|pt-PT|pt-BR|ru-RU|sv-SE$/i));
	var lang2locale = { 
			'ca' : 'ca-CT',
			'cs' : 'cs-CZ',
			'da' : 'da-DK',
			'nl' : 'nl-NL',
			'en' : 'en-US',						
			'es' : 'es-ES',
			'fi' : 'fi-FI',
			'fr' : 'fr-FR',
			'de' : 'de-DE',
			'el' : 'el-GR',		
			'it' : 'it-IT',			
			'pl' : 'pl-PL',
			'pt' : 'pt-BR',
			'ru' : 'ru-RU',
			'es' : 'es-ES',
			'sv' : 'sv-SE',
			'nb' : 'nb-NO',
			'nn' : 'nn-NO',
			'no' : 'nb-NO'
	};
	
	spellcheckerManager.initLanguage();
//	var lng = g_locale || navigator.userLanguage || navigator.language;
//	
//	if(enableLocales.test(lng)) {
//		spellcheckerManager.lang = lng.substr(0, 2).toLowerCase() + '-' + lng.substr(3, 2).toUpperCase();
//	}
//	else {
//		lng = lng.substr(0, 2).toLowerCase();
//		if(lang2locale[lng])
//			spellcheckerManager.lang = lang2locale[lng];
//	}
	
	g_concord_spellcheck_service_URL=document.location.protocol +"//" + document.location.host+ window.contextPath + "/spellcheck/rest/spell";
	if (typeof g_concord_scayt_autoenable != 'undefined')
			spellcheckerManager.bAutoScaytEnabled = g_concord_scayt_autoenable;
	else
			spellcheckerManager.bAutoScaytEnabled = false;
			
	if (typeof g_concord_spellcheck_service_available != 'undefined')
			spellcheckerManager.bServiceAvailable = g_concord_spellcheck_service_available;
	else
			spellcheckerManager.bServiceAvailable = true;
	
	if (typeof g_concord_spellcheck_service_URL != 'undefined')
			spellcheckerManager.backendServiceURL = g_concord_spellcheck_service_URL;
	else if (!spellcheckerManager.bNative)
			spellcheckerManager.bServiceAvailable = false;
	

}
