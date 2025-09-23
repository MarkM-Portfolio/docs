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

dojo.provide("concord.text.MsgUtil");

dojo.declare("concord.text.MsgUtil", null, {
	// Define command type
	actType : {"insertText":"it", 
		"deleteText":"dt", 
		"insertStyleElement":"ise",
		"deleteStyleElement":"dse",
		"insertElement":"ie", 
		"deleteElement":"de",
		"setStyle":"sst",
		"removeStyle":"rst",
		"setAttributes":"sbt",
		"updateFragment":"uft",
		"removeAttributes":"rbt",
		"insertTask" : "itsk",
		"updateTask" : "utsk",
		"deleteTask" : "dtsk",
		"ResetContentAction" : "rcnt",
		"UpdateListValue":"ulv",
		"ChangeListType":"clt",
		"updateHeaderFooter":"uhf"
		},
		
	msgType : {"Text":"t", 
		"Element":"e", 
		"InlineStyle":"s", 
		"Attribute":"a",
		"ReplaceNode":"rn",
		"Table":"tb",
		"Task" : "tsk",
		"Toc" : "toc",
		"Split":"sp",
		"Join":"jn",		
		"ResetContent" : "rc",
		"presResetContent": "resetContent",
		"List":"l",
		"OUTLINE":"o",
		"HeaderFooter":"hf",
		"StyleElement":"se",
		"MoveSlide":"ms"	// The message type was used to move slide in presentation. The message include IE/DE actions.
		},
	
	mainId : '',
		
		//check whether range contains the div inside task assignment.
	checkTaskReference:function(range)
	{
		var start=range.startContainer;
		var end=range.endContainer;
		if(start.type == CKEDITOR.NODE_ELEMENT&&start.$.id.indexOf("reference")!=-1&&start.$.className=="reference")
			return true;
		if(end.type == CKEDITOR.NODE_ELEMENT&&end&&end.$.id.indexOf("reference")!=-1&&end.$.className=="reference")
			return true;
		return false;
	},
	// Check if the editor selection contains task.	
	containsTask : function( selection )
	{
		var entitlements = pe.authenticatedUser.getEntitlements();
		if( !entitlements.assignment.booleanValue )
			return false;
		
		   if (selection.getSelection){
		    	  //to avoid defect, in case selection is editor.
		    	  selection = selection.getSelection();
		      }
		   
		   var tasks = dojo.query('fieldset.concordNode',selection.document.$);
			if (tasks.length == 0)//no task in document			   
			 	return false;
		   //
		// This plugin should not depend on TASK plugin. 
		// Ugly code.
		if(typeof TASK == 'undefined') {
			return false;
		}
		var ranges = selection.getRanges();	
		var range;		
		var FIELDSET = 'fieldset';
		for(var i = 0; i < ranges.length; i ++)
		{
			range = ranges[i];
			if (range.collapsed)
				return false;

			var boundary = TASK.tools.range.getBoundary(range);
			var startNode = boundary.startNode;
			var endNode = boundary.endNode;
			var startInTask = startNode.hasAscendant(FIELDSET,true);
			var endInTask = endNode.hasAscendant(FIELDSET,true);
			if ( startInTask && endInTask)
			{
				var startTask = startNode.getAscendant(FIELDSET,true);
				var endTask = endNode.getAscendant(FIELDSET,true);
				if (!startTask.equals(endTask))//in different task
					return true;
				else //within same task
				{
					var startContainer = startNode.getAscendant('div');//should not contain itself
					var endContainer = endNode.getAscendant('div');
					if (startContainer && startContainer.hasClass('reference') && endContainer && endContainer.hasClass('reference') )//in content area
							return false;
					return true;
				}
			}
			else if (!startInTask && !endInTask)
			{
				var startElements	= new CKEDITOR.dom.elementPath( startNode ).elements;
				var endElements = new CKEDITOR.dom.elementPath( endNode ).elements;
				var startBlock = startElements[startElements.length-2];//direct child under body
				var endBlock = endElements[endElements.length-2];
				while ( startBlock && !startBlock.equals(endBlock))
				{
					if ( startBlock.is(FIELDSET))
						return true;
					startBlock = startBlock.getNext();
				}
				return false;
			}			
			else
				return true;
		}
		
		return false;
	},
	repositionSelection : function(editor)
	{
		var selection = editor.getSelection();
		if ( selection && (typeof TASK != 'undefined') && TASK != null )
		{
			   var tasks = dojo.query('fieldset.concordNode',selection.document.$);
				if (tasks.length == 0)//no task in document			   
				 	return;

			TASK.tools.cursor.repositionCursor(selection);
		}
	},
	
	getSelectedTask : function (editor,selection)
	{
	      if (!selection){
	    	  selection = editor.getSelection();
	      }
	      
		   var tasks = dojo.query('fieldset.concordNode',selection.document.$);
			if (tasks.length == 0)//no task in document			   
			 	return null;

		var task = null;
		if ( (editor.getTaskHdl) && (editor.getTaskHdl()) )
		{
			task = editor.getTaskHdl().getSelectedTask(selection);
		}
		return task;
	},
	// Check if the editor selection contains comments.	
	isCommentsNode : function(node)
	{
		if(node && node.type == CKEDITOR.NODE_ELEMENT)
		{
			if(node.hasAttribute('commentid'))
				return true;
			
			for(var i = 0; i < node.getChildCount(); i++)
			{
				if( this.isCommentsNode( node.getChild(i) ) )
					return true;
			}
		}
		
		return false;
	},
		
	containsComments : function(editor)
	{
		var ranges = editor.getSelection().getRanges();	
		var range;
		for(var cnt = 0; cnt < ranges.length; cnt ++)
		{
			range = ranges[cnt];
			if(range.collapsed)
				continue;
			
			var startNode = range.startContainer;
			var endNode = range.endContainer;
			
			// Get the parent nodes tree for the start and end boundaries.
			var startParents	= startNode.getParents();
			var endParents		= endNode.getParents();

			// Compare them, to find the top most siblings.
			var i, topStart, topEnd;

			for ( i = 0 ; i < startParents.length ; i++ )
			{
				topStart = startParents[ i ];
				topEnd = endParents[ i ];

				if ( !topStart.equals( topEnd ) )
					break;
			}

			var levelStartNode, currentNode;

			// startParents tree.
			for ( var j = i ; j < startParents.length ; j++ )
			{
				levelStartNode = startParents[j];

				currentNode = levelStartNode.getNext();
				
				while( currentNode )
				{
					// Stop processing when the current node matches a node in the
					// endParents tree or if it is the endNode.
					if ( currentNode.equals( endParents[ j ] ) || currentNode.equals( endNode ) )
						break;

					if( this.isCommentsNode(currentNode) )
						return true;
					
					currentNode = currentNode.getNext();
				}
			}

			// endParents tree.
			for ( var k = i ; k < endParents.length ; k++ )
			{
				levelStartNode = endParents[ k ];

				// The processing of siblings may have already been done by the parent.
				if ( !startParents[ k ] || levelStartNode.$.parentNode != startParents[ k ].$.parentNode )
				{
					currentNode = levelStartNode.getPrevious();

					while( currentNode )
					{
						// Stop processing when the current node matches a node in the
						// startParents tree or if it is the startNode.
						if ( currentNode.equals( startParents[ k ] ) || currentNode.equals( startNode ) )
							break;
						
						if( this.isCommentsNode(currentNode) )
							return true;
						
						currentNode = currentNode.getPrevious();
					}
				}
			}
		}
		
		return false;
	},
	
	/* check whether the elementList contains the specific element or not
	 * @name MSGUTIL.containsElement 
	 * @function
	 * @param element array
	 *  element
	 * @example
	 * var elementArray = [];	
	 * var element = CKEDITOR.dom.element.createFromHtml("<p>ABCEFG</p>");
	 * MSGUTIL.containsElement(elementArray,element);//return false
	 */
	 containsElement: function (elementList,element){
		   if(elementList == null || element == null)
			   return false;
		   if(elementList.length == 0)
			   return false;
		   for(var i=0;i<elementList.length;i++)
		   {
			   if(elementList[i] == element)
				   return true;
		   }
		   return false;
	  },
	  // CKEditor node
	  containsElement2: function (elementList,element){
		   if(elementList == null || element == null)
			   return false;
		   if(elementList.length == 0)
			   return false;
		   for(var i=0;i<elementList.length;i++)
		   {
			   if(elementList[i].equals(element))
				   return true;
		   }
		   return false;
	  },
	// For delete range content.
	getRange : function( selection, msgList)
	{
	      if (selection.getSelection){
	    	  //to avoid defect, in case selection is editor.
	    	  selection = selection.getSelection();
	      }
		// Get the selection ranges.
		var ranges = selection.getRanges();

		// TODO Need more test.
		// Delete the contents of all ranges except the first one.
		for ( var i = ranges.length - 1 ; i > 0 ; i-- )
		{
			// Delete other selection content
			var msgs = ranges[ i ].deleteContentsMsg(false, true);
			// msgList is a return value, can't use Array.concat()
			for(var j = 0; j< msgs.length; j++)
				msgList.push(msgs[j]);
		}

		// Return the first range.
		return ranges[ 0 ];
	},
	_PureTextCache: [],
	_CacheEnabled: false,
	startCache: function(){
		this._PureTextCache = [];
		this._CacheEnabled = true;
	},
	
	stopCache: function(){
		this._PureTextCache = [];
		this._CacheEnabled = false;
	},
	
	// Get the context from range
	getContextByRange : function(range, isEnd)
	{
		var context = {};
	//	context.commonAncestor = null;	 // The common ancestor
	//	context.exStart = null;         // The external start block
	//	context.exEnd = null;           // The external end block
	//	context.nodes = [];			 // Select node list: node id, node index, node's parent
	//	context.collapsed = range.collapsed;		 // If it's collapsed
	//	context.isStartOfBlock = false;		 // If it's start of block
	//	context.isEndOfBlock = false;	         // If it's end of block
	//	context.startOffset = 0;        // The start offset
	//	context.endOffset = 0;          // The end offset
	//	context.startLength = null;	 // The first block's pure text length
	//	context.document = range.document();
	//	context.startBlock = null;
		
		context.startBlock = this.getBlock(range.startContainer);
		context.startLength = this.getNodeLength(context.startBlock);
		context.startOffset = this.transOffsetRelToAbs(isEnd ? range.endContainer : range.startContainer, isEnd ? range.endOffset: range.startOffset, context.startBlock);
		context.isStartOfBlock = range.checkStartOfBlock();
		context.isEndOfBlock = range.checkEndOfBlock();
		
		context.startBlock = context.startBlock.clone(true, true);
		
		return context;
	},
	
	// Get range delete text message.
	// <p>abcd</p>, If the range is collapsed and the start offset is 2
	// The message is delete "cd" text.
	deleteContentsToEnd : function( range )
	{
		var act;
		
		if(range.collapsed)
		{	
			var startBlock = this.getBlock(range.startContainer);
			var isStartOfBlock = range.checkStartOfBlock();
			var isEndOfBlock = range.checkEndOfBlock();
			var parent = startBlock.getParent();
			if (MSGUTIL.isHeading(startBlock) && MSGUTIL.isListItem(parent) && parent.getFirst().equals(startBlock))
			{	
				if (startBlock.getNext())
					isEndOfBlock = false;
				startBlock = parent;
			}
			if( !isStartOfBlock )
			{ //check if the prev node is a block
				var cloneRange = range.clone();
				cloneRange.optimize();
				var start=  cloneRange.startContainer,offset =  cloneRange.startOffset;
				if( start.type == CKEDITOR.NODE_ELEMENT && offset >0)
				{
					var prev = start.getChild( offset-1 );
					if( this.isBlock(prev) )
						isStartOfBlock = true;
				}
			}					
			if(!isStartOfBlock && !isEndOfBlock)
			{
				// Delete text
				var startOffset = MSGUTIL.transOffsetRelToAbs(range.startContainer, range.startOffset, startBlock);
				var endOffset = MSGUTIL.getNodeLength(startBlock);
				act = SYNCMSG.createDeleteTextAct(startOffset, endOffset, startBlock);
				//msg = SYNCMSG.createMessage(MSGUTIL.msgType.Text, [act]);
			}
		}
		
		return act;
	},
	
	getChildById : function(element, id)
	{
		if(element.type == CKEDITOR.NODE_TEXT)
			return null;
			
		if(element.getId() == id)
			return element;
		
		var child = null;
		for(var i = 0; ( i < element.getChildCount() )&& child == null; i++)
			child = this.getChildById( element.getChild(i), id );
		
		return child;
	},
	
	getBlockIndex: function( node )
	{
		return this.getIndex(node,true);
	},
	
	getIndex : function(node, bblock)
	{
		if(!node)
			return -1;
		var index = 0, child = node.getPrevious();
		var parent = node.getParent();
		var parentName = parent && parent.getName();
		var isBullet  = MSGUTIL.isBullet(parentName);
		var isBody = (parentName == 'body');
		//defect 5464, performance improvement
		if (child && child.$ ){
			child = child.$;
			while( child )
			{
				var ignorethis = false;
		    	
				if (bblock){
					var isBookMark, nonBlock = false;
					if( child.nodeType == CKEDITOR.NODE_ELEMENT ){
						var $attr = child.attributes.getNamedItem( '_fck_bookmark' );
						isBookMark = !!( $attr && $attr.specified );
						
						nonBlock = isBody && !MSGUTIL.isBlock(child.nodeName);
					}else{
						isBookMark = false;
						nonBlock = isBody;
					}
					
					if (isBookMark || nonBlock){
						ignorethis = true;
					}else{
						if (isBullet){
							 var isBlock = false;
							 if( child.nodeType == CKEDITOR.NODE_ELEMENT){
								 
								 var nodeName = child.nodeName.toLowerCase();
								 
								 var dtd = CKEDITOR.dtd;
								 isBlock = dtd.$block[nodeName] || dtd.$blockLimit[nodeName] || dtd.$listItem[nodeName] || dtd.$list[nodeName] || dtd.$tableContent[nodeName];		
								 isBlock = isBlock || nodeName == 'html';
								 
								 if( nodeName == 'div' )//#8863
									isBlock = false;
							 }
								
								
							if( !isBlock){
								ignorethis = true;
							}
						}
					}
				}
				
				if( !ignorethis)
					index++;
				var tmp = child;
				child = child.previousSibling;
				
				if(nonBlock && parent)	// Remove the non block element from body.
					parent.$.removeChild( tmp );
			}
		}
		return index;
	},

	//current li and all children li's max indent level, not including slibings
	getMaxIndentLevel : function(node)
	{
		if(!node || node.type != CKEDITOR.NODE_ELEMENT || !node.is('li'))
			return -1;
		var listNodeNames = { ol : 1, ul : 1 };
		var child,childCnt;maxLen = 0;
//		do
//		{
			if(node.getElementsByTag('ul').count() == 0 && node.getElementsByTag('ol').count() == 0)
			{
				var len = 0;
				var parents = node.getParents();
				for(var i = 0;i<parents.length;i++)
				{
					if(listNodeNames[parents[i].getName()])
						len++;
				}
				
				maxLen = Math.max(maxLen,len);
			}
			else
			{
				childCnt = node.getChildCount();
				for(var i = 0;i<childCnt;i++)
				{
					child = node.getChild(i);
					if(child.getName && listNodeNames[child.getName()])
						maxLen = Math.max(maxLen,this.getMaxIndentLevel(child.getFirst()));
				}			
			}

//		}while((node = node.getNext()));

		return maxLen;
		
	},
	
	
	getUUID : function() {
			if (this.mainId == '')
			{
				var id = '';
				if (pe.scene.CKEditor)
					id = pe.scene.CKEditor.document.getBody().getId();
				else if (window.__pres2 && pe.scene.doc)
					id = pe.scene.doc.id;
				if (id != null)
					this.mainId = id;
			}
			var seedA = Math.random().toString(16);
			var seedB = Math.random().toString(16);
			var uuid = seedA + seedB;
			uuid = uuid.replace(/0\./g, "");
			//uuid = uuid.substring(0, 8) + "-" + uuid.substring(8, 13);
			return this.mainId + uuid.substring(0, 12);
	 		//return "id_" + uuid;
	},
	
	/* Generate UUID for node and replace duplicate ID with new ID
	 * @name MSGUTIL.generateID 
	 * @function
	 * @param CKEDITOR.dom.node
	 *  ID array
	 * @example
	 *	var node = CKEDITOR.dom.element.createFromHtml("<p>ABCEFG</p>");
	 *  MSGUTIL.generateID(node);
	 *  alert(node.getId())	// the node's id
	 */
	generateID : function(node, ids, force)
	{
		var isNeedIdNode = false;
		if(node.type == CKEDITOR.NODE_TEXT || node.getName() == "#comment" || node.getName() == 'br')
			return isNeedIdNode;
		
		var id;
		ids = ids || {};
		
		id = node.getId();
		var hasId = true;
		if(id == null)		
		{
			hasId = false;
			isNeedIdNode = this.isBlock(node) || node.is('img', 'a');
		}
		else if (id in ids)
			isNeedIdNode = true;	// Duplicated ID, should be removed
		else
			ids[id] = 1;			// Record the ID
		if(isNeedIdNode || (force && hasId))
		{			
			id = this.getUUID();
			node.setAttribute('id', id);
			ids[id] = 1;		
		}
		
		for(var i = 0; i < node.getChildCount(); i++)
			isNeedIdNode = this.generateID(node.getChild(i), ids, force) || isNeedIdNode;
						
		return isNeedIdNode;		
	},
	
	// Check the element whether is a page break image.
	isPageBreakElement : function( node )
	{
		return (node.type == CKEDITOR.NODE_ELEMENT &&  node.getName() == 'img' && node.getAttribute('class') == 'cke_pagebreak');
	},

	// Check the given node whether is a Field element.
	isFieldElement : function( node )
	{
		return node && node.is && node.is("span") && node.getAttribute('class')
					&& ( node.getAttribute('class').indexOf("ODT_DT") >= 0
					|| node.getAttribute('class').indexOf("ODT_PN") >= 0
					|| node.getAttribute('class').indexOf("ODT_TS") >= 0
					);
	},
	
	// Check the cursor whether is after a element which guard function return true.
	// Return null if not, return the node if yes.
	isAfterElement : function( range, guard )
	{
		var previousNode = null;
		var node = null;
		if( range.startContainer.type == CKEDITOR.NODE_TEXT )
		{
			// <span class="ODT_PN" contenteditable="false">#</span>^aaa
			if( range.startOffset == 0 )
				node = range.startContainer;
			// <span class="ODT_PN" contenteditable="false">#^</span>
			else if ( range.startOffset == range.startContainer.getLength())
			{
				var parent = range.startContainer.getParent();
				if( range.startContainer.getIndex() == parent.getChildCount() - 1 )
					previousNode =  range.startContainer.getParent();
				else
					previousNode = range.startContainer;
			}
		}
		else if ( range.startContainer.type == CKEDITOR.NODE_ELEMENT )
		{
			// <span class="ODT_PN" contenteditable="false">#</span><span">^</span>
			if( range.startContainer.getChildCount() == 0 )
				node = range.startContainer;
			// <p><span class="ODT_PN" contenteditable="false">#</span>^</p>
			else if( range.startContainer.getChildCount() == range.startOffset )
				previousNode = range.startContainer;
			else
				node = range.startContainer.getChild(range.startOffset);
		}
		var isBlock = false;
		while( previousNode == null && node != null )
		{
			isBlock = MSGUTIL.isBlock(node);
			previousNode = node.getPrevious();
			node = node.getParent();
			if(node && node.is && node.is('body'))
				break;
		}
		// Return null if range and field in different block.
		if(previousNode && isBlock)
			return null;
		var isField = false;
		while( previousNode && previousNode.type == CKEDITOR.NODE_ELEMENT )
		{				
			if( !guard || guard( previousNode ) )
			{
				isField = true;
				break;
			}
			if( (typeof previousNode.getLast() != "undefined") &&  previousNode.getLast() != null)
			{
				previousNode = previousNode.getLast();
				if( previousNode && MSGUTIL.isBogus(previousNode) )
					previousNode = previousNode.getPrevious();
			}
			else
				break;
		}
		return isField ? previousNode : null;
	},
	
	// Check the cursor whether is before a element which guard function return true
	// Return null if not, return the node if yes.
	isBeforeElement : function( range, guard )
	{
		var nextNode = null;
		var node = null;
		if( range.endContainer.type == CKEDITOR.NODE_TEXT )
		{
			// aaa^<span class="ODT_PN" contenteditable="false">#</span>
			if( range.endOffset == range.endContainer.getLength() )
				node = range.endContainer;
			// <span class="ODT_PN" contenteditable="false">^#</span>
			else if ( range.endOffset == 0 )
			{
				if( range.endContainer.getIndex() == 0 )
					nextNode = range.endContainer.getParent();
				else
					nextNode = range.endContainer;
			}
		}
		else if( range.endContainer.type == CKEDITOR.NODE_ELEMENT )
		{
			// <span>^</span><span class="ODT_PN" contenteditable="false">#</span>
			// <span>aa^</span><span class="ODT_PN" contenteditable="false">#</span>
			if( range.endContainer.getChildCount() == range.endOffset )
				node = range.endContainer;
			// <p>^<span class="ODT_PN" contenteditable="false">#</span></p>
			else
				nextNode = range.endContainer.getChild(range.endOffset);
		}
		var isBlock = false;
		while( nextNode == null && node != null )
		{
			isBlock = MSGUTIL.isBlock(node);
			nextNode = node.getNext();
			node = node.getParent();
			if(node && node.is && node.is('body'))
				break;
		}
		// Return null if range and field in different block.
		if(nextNode && isBlock)
			return null;
		var isField = false;
		while( nextNode && nextNode.type == CKEDITOR.NODE_ELEMENT )
		{				
			if( !guard || guard( nextNode ) )
			{
				isField = true;
				break;
			}
			if( (typeof nextNode.getFirst() != "undefined") &&  nextNode.getFirst() != null)
				nextNode = nextNode.getFirst();
			else
				break;
		}
		return isField ? nextNode : null;
	},
	
	
	// Check the cursor whether is after a Field element.
	// Return null if not, return the Field node if yes.
	isAfterFieldElement : function( range )
	{
		return MSGUTIL.isAfterElement(range, MSGUTIL.isFieldElement);
	},
	
	// Check the cursor whether is before a Field element.
	// Return null if not, return the Field node if yes.
	isBeforeFieldElement : function( range )
	{
		return MSGUTIL.isBeforeElement(range, MSGUTIL.isFieldElement);
	},
	
	
	

	/* check whether the node in a table
	 * @name MSGUTIL.getBulletParent 
	 * @function
	 * @param CKEDITOR.dom.node
	 * @returns return the node's bullet parent
	 * @example
	 *	
	 */
	getBulletParent : function(node)
	{
		node = this.getBlock(node);
		if(!node)
			return null;
		
		var nodeName = node.getName();
		if(nodeName == 'body')
			return null;
		
		return CKEDITOR.dtd.$listItem[nodeName] ? node : this.getBulletParent(node.getParent());
	},
	
	/* get common list ancestor
	 * @name MSGUTIL.getCommonListAncestor 
	 * @function
	 * @param CKEDITOR.dom.node startNode
	 * @param CKEDITOR.dom.node endNode
	 * @returns return if both nodes in one bullet
	 * @example
	 *	
	 */
	getCommonListAncestor : function(startNode,endNode)
	{		
		if(this.getBulletParent(startNode) == null || this.getBulletParent(endNode) == null )
		{
			return null;
		}
		
		// Get the parent nodes tree for the start and end boundaries.
		var startParents = startNode.getParents();
		var endParents = endNode.getParents();
		
		
		// Compare them, to find the top most siblings.
		var i, topStart, topEnd;
		for ( i = 0 ; i < startParents.length ; i++ )
		{
			topStart = startParents[ i ];
			topEnd = endParents[ i ];

			// The compared nodes will match until we find the top most
			// siblings (different nodes that have the same parent).
			// "i" will hold the index in the parents array for the top
			// most element.
			if ( !topStart.equals( topEnd ) )
				return null;
			else if(topStart.equals( topEnd ) && topStart.is && (topStart.is('ol') || topStart.is('ul')))
			{
				return topStart;
			}
		}
		return null;
	},

	getListClass : function ( node )
	{
		return LISTUTIL.getListClass(node);
		/*
		var regUnderline = /[A-Za-z0-9]+(_[0-9]+)+(\s|$)|lst-[a-zA-Z0-9]+/g,
			regOutline = /(O|o)utline_[0-9]+/g,
			listClass;
		var cls = node.getAttribute('class');
		var match = cls && cls.match(regUnderline);
		if ( match )
		{
			for ( var j = 0; j < match.length; j++ )
			{	
				if ( ! regOutline.test( match[j] ) )
				{
					listClass =  CKEDITOR.tools.trim(match[j]);
					break;
				}
			}
		}
		// conversion don't set list class on ol/ul, so try to get from its li
		if (listClass == null && this.isList(node))
		{
			var listItem = node.getFirst();
			if (this.isListItem(listItem))
			{
				var first = listItem.getFirst();
				while (first && first.is && first.is('a') && first.hasClass('cke_anchor'))
					first = first.getNext();
				if (this.isHeading(first))
					listClass = this.getListClass(first);
				else 
					listClass = this.getListClass(listItem);
			}
		}
		return listClass;
		*/
	},

	removeListClass : function ( node )
	{
		return LISTUTIL.removeAllListClass(node);
		/*
		var listClass = this.getListClass(node);
		if (listClass != null && listClass != "")
		{
			node.removeClass(listClass);
		}
		*/
	},
	
	adjustStyle : function ( index, listArray )
	{	// for defect 44284
		for ( var j = 0; j < listArray.length; j++ )
		{
			if( index != j && listArray[index].indent == listArray[j].indent
				&& listArray[index].parent.getName() == listArray[j].parent.getName() )
			{
				var inheritClass = true;
				for ( var k = Math.min(index,j) + 1 ; k < Math.max(index,j) ; k++ )
				{
					if ( listArray[k].indent < listArray[index].indent )
					{
						inheritClass = false;
						break;
					}
				}
				if ( inheritClass )
				{
					listArray[index].className = listArray[j].className;
					listArray[index].style = listArray[j].style;
					break;
				}
			}
		}
	},

	/* get neareat <li> node,
	 * @name MSGUITL.getNearestListItem
	 * @function
	 * @param CKEDITOR.dom.element
	 * @param isUpward true to get nearest <li> node up, false to get nearest <li> node below
	 */
	getNearestListItem : function(liBlock,isDownward)
	{		
		if(!liBlock || liBlock.type == CKEDITOR.NODE_TEXT || (liBlock.type == CKEDITOR.NODE_ElEMENT && !this.isBullet(liBlock)))
		{
			return null;
		}
		var nearest = liBlock;
		var node;
		if(isDownward)
		{
			if(this.isBullet(node = nearest.getLast()))
			{
				nearest = node.getFirst();
			}else if((node = nearest.getNext()))
			{
				nearest = node;
			}else if(node = nearest.getParent().getParent().getNext())
			{
				nearest = node;
			}
		}
		else
		{
			if((node = nearest.getPrevious()))
			{
				if(this.isBullet(node = node.getLast()))
				{
					nearest = node.getFirst();
				}else
				{
					nearest = newEndBlock.getPrevious();										
				}
			}
			else if(node = nearest.getParent().getParent())
			{
				if(CKEDITOR.dtd.$listItem[node.getName()])
					nearest = node;
			}
		}
		
		return nearest;
	},
	
	modifyChildrenElementsID : function(element)
	{
		if(!element)
			return;
		
		var noIdElements = { '#text':1, 'br':1, 'strong':1, 'u':1, 'em':1, 'strike':1, 'span':1, 'sc_start':1, 'sc_end':1 };
		var tagName = element.getName?element.getName():null;
		if(!tagName || tagName in noIdElements )
			return;
		
		element.setAttribute('id',MSGUTIL.getUUID());
		var childCnt = element.getChildCount();
		for(var i =0;i<childCnt;i++)
		{
			var child = element.getChild(i);
			this.modifyChildrenElementsID(child);
		}
	},
	
	/*generate default <p> element for cell
	 * @name MSGUITL.genDefaultContentForCell
	 * @function
	 * @param CKEDITOR.dom.element
	 */
	genDefaultContentForCell : function(element)
	{
		 var para = element.getDocument().createElement('p');
		 para.appendBogus();
		 element.append(para);
	},

	/*
	 * check two blocks in same 'div'/table cell/...
	 */
	isInSameScope : function(startNode,endNode)
	{
		if(!startNode || !endNode)
			return false;
		var startPath = new CKEDITOR.dom.elementPath( startNode.getParent() ),
			endPath = new CKEDITOR.dom.elementPath( endNode.getParent() );
	
		return  endPath.blockLimit && endPath.blockLimit.equals( startPath.blockLimit);
	},
	/* check whether the node in a table
	 * @name MSGUTIL.isInBullet 
	 * @function
	 * @param CKEDITOR.dom.node
	 * @returns return if the node in a bullet
	 * @example
	 *	
	 */
	isInBullet : function(node)
	{		
		return (this.getBulletParent(node) != null)
	},
	
	/* check whether the node in a table
	 * @name MSGUTIL.isTableFrames
	 * @function
	 * @param CKEDITOR.dom.node
	 * @returns return if the node is table cells/rows/columns/caption object.
	 * @example
	 *	
	 */
	isTableFrames : function(node)
	{	
		if(!node)
			return false;
		
		node = this.getBlock(node);
		return CKEDITOR.dtd.$tableContent[node.getName()];
	},
	isPasteTableToCell:function(editor,data)
	{ 
		var sel = editor.getSelection();
		if (sel == null) 
			return false;
		
		var ranges = sel.getRanges();
		var range = ranges[0];
		var table = range.startContainer.getAscendant('table',true);
		if(table)
		{
			var tableRegEx = /<\s*table/g;
			var pasteContent = data.toLowerCase();
			// if there is no table in the data the user is about to paste do nothing
			if(pasteContent.search(tableRegEx) >= 0)
				return true;				
		}
		return false;
	},		
	/* check is the tag is block tag
	 * @name MSGUTIL.isBlock 
	 * @function
	 * @param CKEDITOR.dom.node
	 * @returns return if the node is a block node
	 * @example
	 *	var node = CKEDITOR.dom.element.createFromHtml("<p>ABCEFG</p>");
	 *  alert( MSGUTIL.isBlock(node) ) // true
	 */
	isBlock : function(node)
	{
		if(!node)
			return false;
			
		var nodeName;
		if(typeof node == "string")
			nodeName = node.toLowerCase();
		else if(node.type == CKEDITOR.NODE_ELEMENT)
			nodeName = node.getName();
		else if(node.type == CKEDITOR.NODE_TEXT)
			return false;		
		else
			return false;
			
		if( nodeName == 'div' && node.getParent && node.getParent() && node.getParent().is('li'))
			return false;
		
		var dtd = CKEDITOR.dtd;
		var isBlock = dtd.$block[nodeName] || dtd.$blockLimit[nodeName] || dtd.$listItem[nodeName] || dtd.$list[nodeName] || dtd.$tableContent[nodeName];		
		isBlock = isBlock || nodeName == 'html';
		
		return isBlock;
	},
	
	isBr : function(node)
	{
		if(!node)
			return false;
			
		return node.type == CKEDITOR.NODE_ELEMENT && node.is('br');
	},

	isSelectedRangeNotAvailable : function(range,ignoreEnd)
	{
		if(!range)
			return false;
		//defect 10431, link dialog on ok button is clicked, 
		//range.startContainer is destroyed in IE, but we don't know
		//Access range.startContainer.$.parentNode will cause exception
		try{
			range.startContainer.$.parentNode && range.endContainer.$.parentNode;
		}catch(e){
			return false;
		}
		
		if(range.collapsed)
		{
			block = MSGUTIL.getBlock(range.startContainer);
			if(!this.isBlockInDomTree(block))
				return true;
		}
		else
		{
			var startBlock = MSGUTIL.getBlock(range.startContainer);
			var endBlock = MSGUTIL.getBlock(range.endContainer);
			if(ignoreEnd)
			{
				if(!this.isBlockInDomTree(startBlock))
					return true;
			}
			else
			{
				if(!this.isBlockInDomTree(startBlock) || !this.isBlockInDomTree(endBlock))
					return true;
			}

		}
		return false;	
	},

	isBlockInDomTree : function(block)
	{
		if(!block)
			return false;
		try{
			if (block.getAscendant('html'))
				return true;
		}catch(e){
			//defect 10431, return false when exception
		}
		
		return false;
	},

	/* Get the node's block element
	 * @name MSGUTIL.getBlock 
	 * @function
	 * @param 
	 * 	CKEDITOR.dom.node
	 * @returns
	 * 	return the node's block parent
	 * @example
	 *	var ascendant = CKEDITOR.dom.element.createFromHtml("<p>ABC<span>123</span>EFG</p>");
	 *  var node = ascendant.getChild(2); 	// <span>123</span>
	 *  MSGUTIL.getBlock(node)	// return <p>ABC<span>123</span>EFG</p>
	 */
	getBlock : function(node)
	{	
		var block = node;
		if(!block)
			return null;
		while(block && !this.isBlock(block))
			block = block.getParent();
		
		return block;
	},
	
	/* Get the node's pure text
	 * @name MSGUTIL.getPureText 
	 * @function
	 * @param CKEDITOR.dom.node
	 * @returns return the node's pure Text
	 * @example
	 */
		
	// The helper function for get img's replace text
	getImgText : function(imgNode)
	{
		if(imgNode && imgNode.getName() == 'img')
		{
			// Use the special character to replace the image.
			//var imgText = "\u0002" + imgNode.getId() + "\u0003";
			if( imgNode.hasClass('ConcordTab') || imgNode.hasClass('listSpacer'))
				return "\u0009";
			else
				return "\u0001";
		}
		return '';
	},
	isTable : function(node)
	{
		if (!node || node.type == CKEDITOR.NODE_TEXT)
			return false;
		return node.is('table');
	},
	isHeading : function(node)
	{
		if(!node || node.type == CKEDITOR.NODE_TEXT)
			return false;
			
		var headerTagRegex = /^h[1-6]$/; 
		var name = node.$.nodeName.toLowerCase();
		return headerTagRegex.test( name);
	},
	
	isList : function (node)
	{
		if(!node || node.type == CKEDITOR.NODE_TEXT)
			return false;
		var name = node.$.nodeName.toLowerCase();
		return (name == 'ol' || name == 'ul');
	},
	isListItem : function (node)
	{
		if(!node || node.type == CKEDITOR.NODE_TEXT)
			return false;
		var name = node.$.nodeName.toLowerCase();
		return (name == 'li');
	},
	isListSpacer : function (node)
	{
		if (node && node.is && node.is('img') && node.hasClass('listSpacer'))
			return true;
		return false;
	},
	isBlockListItem: function ( node )
	{
		return MSGUTIL.isHeading(node)||MSGUTIL.isList(node)||MSGUTIL.isParagraph(node);
	},
	/**
	 * Checks if the element has child matches one or more names.
	 * @param {Element} element The target element
	 * @param {String} name[,name[,...]] One or more names to be checked.
	 * @returns {Boolean} true if the element name matches any of the names.
	 * @sample
	 * MSGUTIL.hasChildElement(element, 'td', 'th');
	 */
	hasChildElement : function ()
	{
		if(arguments.length < 2)
			return false;
		
		var element = arguments[0];
		if(!element || element.type != CKEDITOR.NODE_ELEMENT || element.getChildCount() == 0 )
			return false;
		
		for ( var i = 1 ; i < arguments.length ; i++ )
		{
			var childrenByName = element.getElementsByTag(arguments[ i ]);
			
			if ( childrenByName.count() > 0 )
				return true;
		}
		return false;
	},
	isBullet : function(node)
	{
		if(!node)
			return false;
			
		var nodeName;
		if(typeof node == "string")
			nodeName = node.toLowerCase();
		else if(node.type == CKEDITOR.NODE_ELEMENT)
			nodeName = node.getName();
		else if(node.type == CKEDITOR.NODE_TEXT)
			return false;		
		else
			return false;
		
		var dtd = CKEDITOR.dtd;
		var isBullet = dtd.$listItem[nodeName] || dtd.$list[nodeName];		
		
		return isBullet;
	},
	
	isBogus: function( node )
	{
		return MSGUTIL.isBr(node) && node.hasClass('hideInIE');
	},
	isMozBr: function( node )
	{
		return this.isBr(node)&& (node.getAttribute('type') == '_moz' || node.getAttribute('_moz_dirty') != null);
	},
	isLineBreak: function( node )
	{
		if( this.isBr(node) )
		{
			var type = node.getAttribute('type');
			if(type && type.toLowerCase() == 'lb')
				return true;
		}
		return false;
	},

	// Should ensure the function in XHTMLDomUtil.java according with it.
	isNullBr: function( node )
	{
		return ( this.isBr(node) && !this.isLineBreak(node) );
	},
	
	isLineBreakSpan : function (node)
	{
		if (node && node.is && node.is('span') && node.getChildCount()>0)
			return this.isLineBreak(node.getLast());
		return false;
	},

	getPureText: function(node){
		if(!node)	
			return '';
		
		var domNode;
		if (node.$){
			domNode = node.$;
		}else{
			domNode = node;
		}
		
		
		var ret = '';
		if(domNode.nodeType == CKEDITOR.NODE_TEXT)	// Text node
		{
			if(window.g_presentationMode){
				ret = domNode.nodeValue;
			}else{
				ret = domNode.nodeValue.replace( /\u200B/g, '' );
			}
		}
		else if(domNode.nodeType == CKEDITOR.NODE_ELEMENT)
		{
			
			var id = domNode.uniqueID;
			
			if (!id){
				var uniqueKeyCK = 'data-cke-expando' ;
				//refer to domObjectProto.getUniqueId 
				//uniqueID is supported by IE only, so when there is no uniqueID, we generate by ourselves
				id = domNode[ uniqueKeyCK ] || ( domNode[ uniqueKeyCK ] = CKEDITOR.tools.getNextNumber() );
			}
			
			if (id && this._CacheEnabled && this._PureTextCache[id]){
				return this._PureTextCache[id];
			}
			
			
			var name = domNode.nodeName.toLowerCase();
			if(name == 'img')
			{	
				ret = this.getImgText(node.$ ? node: new CKEDITOR.dom.node(domNode));			
			}else if( name == 'br' && !this.isNullBr(node.$ ? node: new CKEDITOR.dom.node(domNode)) )
			{
				ret = "\n";	
			}
			else if ( !this.isBookMark(domNode))
			{
				var child = domNode.firstChild;
				while(child != null)
				{
					ret += this.getPureText(child);
					child = child.nextSibling;
				}
			}
			
			if (id && this._CacheEnabled){
				this._PureTextCache[id]=ret;
			}
		}
		
	
		return ret;	
	
	
	},


	//ignored node when count elements when  process message.
	_isIgnored: function( node )
    {
    	if( MSGUTIL.isBookMark(node) ) //ignore bookMark of node
    		return true;
    	if( !MSGUTIL.isBlock(node) && this.isBullet(node.getParent() )) //ignore inline childs in list
    		return true;
    	return false;
    },
	//merged bookmark
	getChildNode: function( parent, index )
	{
		// Parent is not bullet
		if(!this.isBullet(parent))
		{
			var bookmarks = parent.$.querySelectorAll("[_fck_bookmark]");
			if(bookmarks.length == 0)
			{
				if(index < parent.getChildCount())
					return parent.getChild(index);
				else
					return null;
			}
		}
		
		var j = 0,node;
		
		while( j <= index  )
		{
			node = (node)? node.getNext():parent.getFirst();
			if( node && this._isIgnored( node ) )
				continue;
			if( !node )
				return null;
			j++;	
		}
		return node;
	},
	
	/**
	 * 
	 * @param node
	 * @returns true if contains children(exclue bookmark)
	 */
	containsRealChild: function (node){
		var count =0;
		var child = node.getFirst();
		while( child )
		{
			if( !this.isBookMark(child))
				return true;
			child = child.getNext();
		}
		return false;
	},
	getChildCount: function( node ) //remove bookmark object
	{
		var count =0;
		var child = node.getFirst();
		while( child )
		{
			if( !this.isBookMark(child))
				count++;
			child = child.getNext();
		}
		return count;
	},

	/* Transform the relative offset to absolute offset
	 * @name transOffsetRelToAbs 
	 * @function
	 * @param 
	 * 	(CKEDITOR.dom.node) The relative node
	 * 	(Number) The offset of node
	 *  (CKEDITOR.dom.node) The ascendant node
	 * @returns
	 * 	return the absolute offset in the ascendant node
	 * @example
	 *	var ascendant = CKEDITOR.dom.element.createFromHtml("<p>ABC<span>12<span style="">3</span></span>EFG</p>");
	 *  var node = ascendant.getChild(1);	// The span element
	 *  var ret = MSGUTIL.transOffsetRelToAbs(node, 1, ascendant);
	 *  alert( ret ); // 5
	 */
	transOffsetRelToAbs : function(node, offset, ascendant)
	{	
		var ret = 0;
		/*	
		 *  <p>123<br></p> 
		 *  When the cursor at the end of the paragraph, 
		 *  the range's start element is <p> and start offset is 1.
		 *  The following code would get the absolute offset in internal
		 */
		if(node.type == CKEDITOR.NODE_ELEMENT)
		{
			for(var i=0; i < offset; i++)
			{
				
				ret += this.getPureText(node.getChild(i)).length;
			}		
		}
		if (node.type == CKEDITOR.NODE_TEXT)
		{
			ret = node.substring(0, offset).replace( /\u200B/g, '' ).length;
		}
		
		var indexArray = [];//relative index array,like {0,0,1}..
		while(!node.equals(ascendant))
		{
			indexArray.push(node.getIndex());
			node = node.getParent();
		}//end by node = ascendant	
		
		for (var i=indexArray.length-1;i>=0;i--)
		{
			for (var j=0; j< indexArray[i];j++)
			{
				var preSibling = node.getChild(j);
				ret += this.getPureText( preSibling ).length;
			}
			node = node.getChild(j);
		}	
		
		return ret;
	},
	
	
	/* Get the insert position within the ascendant
	 * @name MSGUTIL.getInsertPos 
	 * @function
	 * @param 
	 * 	(CKEDITOR.dom.node) The ascendant node
	 * 	(Number) The absolute offset of ascendant node
	 * 
	 * @param fragment The text fragment of offset.
	 * @returns
	 * 	return the target node and its relative offset
	 * @example
	 *	var ascendant = CKEDITOR.dom.element.createFromHtml("<p>ABC<span>123</span>EFG</p>");
	 *  var ret = MSGUTIL.getInsertPos(ascendant, 5);
	 *  alert( ret.node.type ); // CKEDITOR.NODE_TEXT or CKEDITOR.NODE_ELEMENT(Image)
	 *  alert( ret.node.getText() ); // 123
	 *  alert( ret.offset ); // 2
	 */
	getInsertPos : function(ascendant, offset, fragment)
	{		
		// Textnode, return itself.
		var offsetBak = offset;
		if(ascendant.type == CKEDITOR.NODE_TEXT)
		{	
			var str = ascendant.getText();
			if (str.length > 0)
			{
				for (var i = 0; i<offset; i++)
				{
					if ( str[i] == '\u200B')
					{
						++offset;
					}
				}
			}
			return { "container": ascendant, "offset": offset, "insertBefore": (offset == 0) };
		}
		/*else if(ascendant.getName() == 'img')
		{						
			return { "container": ascendant, "offset": 0, "insertBefore": (offset == 0) };		
		}*/	
		else
		{					
			var childCnt = ascendant.getChildCount();
			var containsChild = this.containsRealChild(ascendant);
			if(!containsChild)
			{
				if(this.isBlock(ascendant))
				{
					// If the insert a text in a empty block, return it directly
					return { "container": ascendant, "offset": 0, "insertBefore": false};
				}	
				else
				{	
					// When the img is the first element of block element. 
					// The insert position is 0, the before would be true.
					return { "container": ascendant.getParent(), "offset": ascendant.getIndex(), "insertBefore": (offset == 0)};
				}
			}
			
			var lastContentNode = null;
			for (var i=0; i < childCnt; i++)
			{
				var node = ascendant.getChild(i);
				if( this.isBookMark(node))
				   continue;
				var len = this.getPureText(node).length;
				
				if(len > 0) lastContentNode = node;
				
				if(len >=offset)
				{				
					// <li>^<ul><li>abc</li></ul>
					// For this case: insert text before abc
					if(offset == 0 && ascendant.is('li'))
						return { "container": ascendant, "offset": 0, "insertBefore": true};
					else
					{
						// the element is a field
						if(len == offset && MSGUTIL.isFieldElement(ascendant))
							return { "container": ascendant.getParent(), "offset": ascendant.getIndex(), "insertBefore": false};
					
					// The index is in this node or sub node
						return this.getInsertPos(node, offset, fragment);
					}
				}
				
				offset -= len;			
			}
			
			// Expecption happened.
			console.log("The target is: " + ascendant.getOuterHtml() + " offset is: " + offsetBak); 
			
			if(offset > 0)
			{
				var str = "";
				if(fragment && fragment.length >= offset)
				{
					str = fragment.substring(fragment.length - offset, fragment.length);
					// Check last content node content
					if(lastContentNode && fragment.length > offset)
					{
						var child = null;
						if(lastContentNode.type == CKEDITOR.NODE_TEXT)
							child = lastContentNode;
						else if(lastContentNode.is && lastContentNode.is("span") && lastContentNode.getChildCount() == 1)
							child = lastContentNode.getFirst();
						if(child && child.type == CKEDITOR.NODE_TEXT)
						{	
							var otherCnt = fragment.substring(0, fragment.length - offset);
							var childText = child.getText();
							if(otherCnt.length > 0 && child.type == CKEDITOR.NODE_TEXT && childText.length >= otherCnt.length)
							{
								var postCnt = childText.substring(childText.length - otherCnt.length, childText.length);
								if(otherCnt != postCnt)
								{
									var newCnt = childText.substring(0, childText.length - otherCnt.length);
									newCnt += otherCnt;
									child.setText(newCnt);
								}	
							}
						}
					}	
				}
				else{
					if(fragment)
					{
						str = fragment;
						offset = offset - fragment.length;
					}
					var spaceCnt = " ";
					for(var i = 0; i < offset - 1; i++)
						spaceCnt += "\u00a0";
					
					str = spaceCnt + str;
				}
				
				var dummyTxtNode = new CKEDITOR.dom.text(str);
				
				// Append &nbsp
				if(lastContentNode)
					dummyTxtNode.insertAfter(lastContentNode);
				else
					ascendant.append(dummyTxtNode);

				return { "container": dummyTxtNode, "offset": offset, "insertBefore": false };
			}	
		}
		
	},

	getBulletChildCount : function(liNode)
	{
		if(!liNode || liNode.type != CKEDITOR.NODE_ELEMENT || !liNode.is('li'))
			return; 
		
		var len = liNode.getChildCount();
		var count = 0;
		for(var i =0;i<len;i++)
		{
			var child = liNode.getChild(i);
			var tagName = child.getName && child.getName();
			if(tagName && CKEDITOR.dtd.$list[tagName])
				count++;
			else if( i!= 0 && this.isBlock(child ))
			//support <p> element in the middle of list
				count++;
		}
		return count;
	},
	
	getBulletTextNodeLength : function (liNode)
	{
		if(!liNode || liNode.type != CKEDITOR.NODE_ELEMENT || !liNode.is('li'))
			return; 
			
		if(!liNode.getFirst())
			return 0;
		else
		{
			var first = liNode.getFirst();
			var next = first;
			var nodeLen = this.getPureText(next).length;
			while((next = next.getNext()) && !this.isBlockListItem(next))// support p inside the list
			{
				nodeLen += this.getPureText(next).length;
			}
			return nodeLen;
		}
	},
	
	/*****************************************************************************************************************************************
	 * calculate node's text length, img is reagarded as one char
	 * @name getNodeLength 
	 * @function
	 * @param CKEDITOR.dom.node
	 * @returns 
	 * @example
	*/
	getNodeLength : function ( e ) 
	{	
		
		/*if( e.type == 1 )
		{
			if( e.getName() === "img" )
				return 1;
			if( !e.isVisible())
				return 0;	
			var n = e.getFirst();
			var len = 0;
			while( n ) 
			{
				len +=getNodeLength(n );
				n = n.getNext();
			}
			return len;
			
		}
		else if ( e.nodeType == 3 )
		{
			var v = e.getText();
			return v.length;
		}
		return 0;*/
		return this.getPureText(e).length;
	},
	isBookMark: function ( node )
	{
		if (node) {
			if (node.$){
				node = node.$;
			}
			if( node.nodeType == CKEDITOR.NODE_ELEMENT ){
				var $attr = node.attributes.getNamedItem('_fck_bookmark');
				return !!( $attr && $attr.specified );
			}
		}
		return false;
	},
	getBlockNode : function ( node )
	{
		var path	= new CKEDITOR.dom.elementPath( node );
		var blockLimit	= path.blockLimit;
		var block	= path.block;
		var node = block? block : blockLimit;
		return node;
	},
	/**********************************************
	 * convert all the text which is not in <p> in table to <p>text</p>
	 * @name convertTextInTableToElement
	 * @function
	 * @param table node
	 * @returns the converted table
	 */
	convertTextInTableToElement : function(table)
	{
		if(!table || !table.is('table'))
			return null;
		var cells = this.getSubCells(table);
		for(var i = 0; i < cellscells.length; i++)
		{
			var cell = cells[i];
			var childNode = cell.getFirst();
			var elementList = [];
			while(childNode)
			{
				if(!this.isBlock(childNode))
				{
					elementList.push(childNode);
					childNode.remove(false);
				}
				else
				{
					if(elementList.length > 0)
						this.createParawithTextContent(elementList,table.getDocument(),childNode,null);
				}
				childNode = childNode.getNext();
			}
			if(elementList.length > 0)
				this.createParawithTextContent(elementList,table.getDocument(),null,cell);
		}
		return table;
	},
	//create a paragraph with the content supplied
	createParawithTextContent:function(elementList,document,siblingNode,parentNode)
	{
		var para = document.createElement('p');
		while(elementList.length > 0)
		{
			var element = elementList.shift();
			if(element.type == CKEDITOR.NODE_TEXT)// Text node
				para.appendText(element.getText());
			else if(element.type == CKEDITOR.NODE_ELEMENT)
				para.append(element);
		}
		
		para.appendBogus();
		if(siblingNode)
			para.insertBefore(siblingNode);
		else if(parentNode)
			parentNode.append(para);
	},
	/*****************************************************************************************************************************************
	 * get all the cells contained in the currentNode
	 * @name getSubCells 
	 * @function
	 * @param 
	 	  the table node such as table, caption, tbody, tr, td, th 
	 * @returns 
	 		all the cells contained in currentNode.
	 * @example
	*/
	getSubCells : function(currentNode)
	{
		var selectedCells = [];
		var tbody = null,
			rows = null;
		if(currentNode.is('table'))
		{
			if(currentNode.$.caption)
				selectedCells.push(currentNode.getFirst());
			rows = new CKEDITOR.dom.nodeList(currentNode.getLast().$.childNodes);
		}
		else if(currentNode.is('caption'))
		{
			selectedCells.push(currentNode);
		}
		else if(currentNode.is('tbody'))
		{
			rows = new CKEDITOR.dom.nodeList(currentNode.$.childNodes);
		}
		else if(currentNode.is('tr'))
		{
			rows = new CKEDITOR.dom.nodeList([currentNode.$]);
		}
		else if(currentNode.is('th') || currentNode.is('td'))
		{
			selectedCells.push(currentNode);
		}
		
		if(rows)
		{
			for(var rowNum = 0; rowNum < rows.count(); rowNum++)
			{
				var row = rows.getItem(rowNum);
				for(var colNum = 0; colNum < row.getChildCount(); colNum++)
				{
					if(row.getChild(colNum).is("td") || row.getChild(colNum).is("th"))
						selectedCells.push(row.getChild(colNum));
				}
			}
		}
		return selectedCells;
	},
	/*****************************************************************************************************************************************
	 * get the paragraph node if the node is in a paragraph or return null
	 * @name getParagraphNode 
	 * @function
	 * @param 
	 	  CKEDITOR.dom.node node
	 * @returns 
	 		CKEDITOR.dom.node, which tag name is <p>
	 * @example
	*/
	getParagraphNode : function ( node )
	{
		var b = false;
			var p = node;
		while( !b )
		{
			b = false;
			if ( p && p.type == CKEDITOR.NODE_ELEMENT)
			{
				var tagName = p.getName();
				var dtd	= CKEDITOR.dtd;
				b =  !!( dtd.$tableContent[ tagName ]||dtd.$block[ tagName ] || dtd.$listItem[ tagName ] );
			}
			node = p;
			p = node.getParent();
			}
		return node;
	},
	
	/*****************************************************************************************************************************************
	 * if the node is a text paragraph or table contents
	 * wangxum@cn.ibm.com
	*/
	isParagraph: function( node )
	{
		if (!node || node.type == CKEDITOR.NODE_TEXT)
			return false;
		return node.is('p');
	},
	/*****************************************************************************************************************************************
	 * replace the node with all its children nodes
	 *
	*/
	moveChildren: function ( node )
	{
		if( node.type == CKEDITOR.NODE_ELEMENT  )
		{
			var child = node.getFirst();
		    while (child != null)
		    {
		      var next = child.getNext();
		      child.remove().insertBefore(node);
		      child = next;
		    }
		    node.remove();
		}
	},
	
	removeChildren: function ( node )
	{
		if( node.type == CKEDITOR.NODE_ELEMENT  )
		{
			var child = node.getFirst();
		    while (child != null)
		    {
		      var next = child.getNext();
		      child.remove();
		      child = next;
		    }
		}
	},
	/*****************************************************************************************************************************************
	 * aplit nodes to individual nodes, cause the start and end position is not inside a text node.
	 * @name splitNode 
	 * @function
	 * @param 
	 	  CKEDITOR.dom.node node
	 	  int start
	 	  int offset 
	 	  CKEDITOR.dom.node paragraph node
	 * @returns 
	 	  The three nodes lists
	 	  {l:...,m:...,r:...}
	 	  l: left node(s) in the range [0, start)
	 	  m: node(s) in the range [ start , start +  offset-1 ]
	 	  r: right node in the range (start + offset-1, len )
	 * @example
	 * 1 elementName: <b>  start: 1, offset: 1 
	 		--- <p> <b> <span> a </span> bc </b></p> => <p><b><span>a</span></b><b>b</b><b>c</b></p>
	 * 2 elementName: null  start: 1, offset: 1 
	 		 --- <p> <b> <span> a </span> bc </b></p> => <p><b><span>a</span><span>b</span>c</b></p>
	*/
	splitNode : function( node,start,offset,elementName, splitRoot )
	{ 
		var doc = node.getDocument();
		var p = node.getParent();	
		//create new element and insert the nodes
		var createElement = function ( nodes, elementName )
		{
			var node = doc.createElement(elementName);
			var pos,p ;
			if( nodes instanceof Array )
			{
				if( nodes.length )
				{
					 pos = nodes[nodes.length-1].getNext();
					 p = nodes[nodes.length-1].getParent();
				}
				for( i = 0; i< nodes.length; i++ )	
				 node.append(nodes[i].remove());		
			}
			else
			{
				pos = nodes.getNext();
				p = nodes.getParent();
				node.append(nodes.remove());
			}
			if(pos) node.insertBefore(pos); 
			else 	p.append( node );

			return node;
		};
		//move child nodes outside the node
		var makeElement= function( nodes )
		{
			var n , p1, i, pos;
			if( nodes instanceof Array )
			{		
				if( nodes.length )
				{
					p1 = nodes[0].getParent();
					pos = nodes[0].getPrevious();
					n = p1.clone(false); //new node
					for( i = 0; i< nodes.length; i++ )	
						n.append(nodes[i].remove());		
				}
			}
			else if( nodes )// one node 
			{
					p1 = nodes.getParent();
					n = p1.clone(false);
					n.append( nodes.remove() );
			}
			if( pos ) n.insertAfter(pos); 
			else if( n && p1 ) n.insertBefore( p1 );
			if( p1 && p1.getHtml()=="" ) p1.remove();
			return n;
		};
		//
		var fixSpan = function( node ){
			//change <span> abc<a>...</a></span> to <span>abc</span><a><span>...</span></a>
			var array = [],next, child = node.getFirst();
			while( child  ){
				next = child.getNext();
				if( child.type == CKEDITOR.NODE_TEXT || child.getName()!='a'){
					array.push(child);
				}else{
					makeElement(array);
					var span = node.clone(false);
					child.append( span );
					var prev, target = span.$;
					while( prev = target.previousSibling ){
						target.insertBefore( child.$.removeChild( prev ), target.firstChild );
					}
					child.remove();
					child.insertBefore(node);
					array = [];		
				}
				child = next;
			}
			if( node.getChildCount() == 0 )
				node.remove();
		}
		//slit text node
		var splitTextNode = function ( node, start,offset, splitParent,elementName )
		{
			elementName = elementName||'span';	
			var len = MSGUTIL.getNodeLength( node );
			var str = node.getText();
			for (var i = 0; i < start; i++)
			{
				if (str[i] == '\u200B')
				{
					++start;
				}
			}
			for (var i = start; i < offset; i++)
			{
				if (str[i] == '\u200B')
				{
					++offset;
				}
					
			}
			var p1 = node.getParent(),node1,node2,node3,span,n;
			if( start == 0  &&  offset >= len )// no need split node
				node2 = node;		
			else if( start >0 ) //create new span nodes
			{	
				node2 = node.split( start );
				node1 = node;
				if( start + offset < len ) 
					node3 = node2.split( offset );
			}
			else
			{
				node3 = node.split( offset );
				node2 = node;
			}		
			if( !splitParent && node2 &&( node1||node3) )
			{
					span = doc.createElement(elementName);
					n = node2.getNext();
					span.append(node2.remove());
					if( n ) span.insertBefore( n );
					else p1.append( span );
					node2 = span;
			}
			return {"l":node1,"m":node2,"r":node3 };
		};
		//split element
		var splitElement = function( node,start,offset,elementName, splitRoot )
		{
				elementName = elementName||'span';
				var newTag = elementName;	
				if( splitRoot) elementName = 'span';
				var nextChild = null;
				var currentChild = node.getFirst();
				var l = new Array(),m= new Array(),r = new Array();
				var splitOwn = ( node.getName()==elementName ) && !node.getId();
				var ret, len;
				if( currentChild == null )
					return {"m": node };
				
				//#2786 when splitRoot equals true, the span node will be merged.
				//If the node is readonly, such as a field, the format will loss as a normal node.
				//Thus skip splitElement and return the node itself.
				if ( node.isReadOnly && node.isReadOnly() && node.getName()!='a' )
					return {"m": node };
				
				if( elementName == 'span'){
					var child = node.getFirst();
					while( child ){
						next = child.getNext();
						if( child.type == CKEDITOR.NODE_ELEMENT && child.getName() == elementName ){
							fixSpan( child );
						}
						child = next;
					}
				}
					
				currentChild = node.getFirst();
				while( currentChild!=null )
				{ //check every child node		
					nextChild =  currentChild.getNext();
					len = MSGUTIL.getNodeLength(currentChild);
					if ( start == 0 && len == 0 && offset >= 0 )
					{ //bookmark ?
						if( offset == 0 && currentChild.is && currentChild.is('br'))
						{
							ret = {'r':currentChild };
							offset = -1;
						}
								
						else
							ret = {'m':currentChild };
					}	
					else if( offset <= 0 ) //in the right of range
					{
						offset -= len;
						ret = {"r": currentChild };
					}	
					else if( start >=len )
					{
						start -=len;
						ret = {"l":currentChild};
					}
					else 
					{
						if ( currentChild.type == CKEDITOR.NODE_TEXT  )
							ret = splitTextNode( currentChild,start,offset,splitOwn,elementName );
						else if ( currentChild.type == CKEDITOR.NODE_ELEMENT ){
							ret = splitElement( currentChild,start,offset,elementName );
						}
						offset = offset + start - len;
						start = 0;
					}
					currentChild = nextChild;
					if( ret.l ) l = l.concat( ret.l);
					if( ret.m ) m = m.concat( ret.m);
					if( ret.r ) r = r.concat( ret.r );
				}
				if( splitRoot )
				{					
					m = [createElement(m,newTag)];
				}
				//for defect 26353, we need let text span to split, and return span element, not 
				//textnode element
				else if( splitOwn || (node != null && node.getAttribute('class')!= null &&
						node.getAttribute('class').indexOf('text_span') >= 0))
				{
					l= makeElement( l );
					m =makeElement(  m );
					r =makeElement( r  );
				}
				return {"l":l, "m": m,"r":r};	
		};
		if( node.type == CKEDITOR.NODE_ELEMENT  )
		{ //element
			return splitElement( node,start,offset,elementName,splitRoot );
		}
	},
	oc : function (a)
	{	//array to object converter for array IN operatiioin, like ["1111","2222"]=> {"1111":1,"2222":1}
		var o = {};
		for(var i=0;i<a.length;i++)	o[a[i]]=1;
		return o;
	},
	
	hasDelOrInsertAct : function (msg)
	{
		if(!msg)
			return false;
		for(var i = 0; i < msg.updates.length; i++)
		{
			var op = msg.updates[i];
			if(op.t == MSGUTIL.actType.deleteText || op.t == MSGUTIL.actType.deleteElement || op.t == MSGUTIL.actType.insertText || op.t == MSGUTIL.actType.insertElement)
			{
				return true;
			}
		}
		return false;		
	},
	
	isInlineMsg : function(msg)
	{
		if(!msg)
			return;
		if(msg.type == this.msgType.Text || msg.type == this.msgType.InlineStyle || msg.type == this.msgType.Attribute)
			return true;
		else
			return false;
	},
	
	isElementMsg : function(msg)
	{
		if(!msg)
			return;
		if(!this.isInlineMsg(msg))
			return true;
		else
			return false;
	},
	
	isMsgOT : function(baseMsg,incomingMsg)
	{
		if((this.isInlineMsg(baseMsg) && !this.isInlineMsg(incomingMsg)) || ((this.isInlineMsg(incomingMsg) && !this.isInlineMsg(baseMsg))))
			return false;
		else
			return true;
	},
	
	isReplaceNode : function (msg)
	{
		if(!msg)
			return false;
		if(msg.type == this.msgType.ReplaceNode)
			return true;
		else if(msg.type == this.msgType.Table)
		{
			if(msg.updates.length >=2)
			{
				var act1 = msg.updates[0];
				var act2 = msg.updates[1];
				if(act1.t == this.actType.deleteElement && act2.t == this.actType.insertElement 
					&& act1.idx == act2.idx && act1.tid == act2.tid)
					return true;
			}
		}
		return false;
	},
	
	isSplitJoin : function(msg)
	{
		if(!msg)
			return false;
			
		if(msg.type == this.msgType.Split || msg.type == this.msgType.Join)
			return true;
		else
			return false;
	},
	getRuntimeStyle: function(editor)
	{
		var styleNode = editor.document.getById("runtimeStyle");
		if (styleNode == null)
		{
			var head = editor.document.getHead();
			styleNode = editor.document.createElement("style", { 
																	attributes : {
																				id:"runtimeStyle",
																				type:"text/css"}
																}
														);
			head.append(styleNode);				
		}
        return styleNode;
	},
	fixBrPosition: function(node)
	{
		/* we may get following node contents on IE
			 * <p><br class="hideInIE"/>somethings</p>
			 * the <br> is hiden on IE, but not on other browsers, so this will lead to an unexpected blank line before "somethins",
			 * let's fix it here.
			 */		
		var brs = node.$.querySelectorAll("br.hideInIE");
		if (brs && brs.length > 0)
		{
			for (var i = 0; i<brs.length; i++)
			{
				var br = new CKEDITOR.dom.element(brs[i]);
				var parent = br.getParent();
				if (parent && !parent.is('body'))
				{
					var last = parent.getLast();
					while ( (last.type == CKEDITOR.NODE_TEXT && !CKEDITOR.tools.rtrim( last.getText() )) || 
							this.isBlockListItem(last) || this.isBookMark(last)  )
							last = last.getPrevious();
					if (last.$ != br.$ )
					{
						// the last element isn't br, but there is br in this block, so we should move the br to the last;
						br.remove();
						if ( last.type == CKEDITOR.NODE_TEXT || !last.is('br'))
						{
							br.insertAfter(last);
						}
					} else {
						// ok, the last element is br, but we still need to make sure no ul/ol before the br
						var prev = last.getPrevious();
						while (this.isBlockListItem(prev))
							prev = prev.getPrevious();
						if (prev)
						{
							br.remove();
							br.insertAfter(prev);
						} else {
							// when the block/parent only have br, like <p><br></p>, it isn't necessary to move br.
							var first = parent.getFirst();
							if (first.$ != br.$)
							{
								br.remove();
								br.move(parent,true);
							}
						}
					}
				}
			}
		}
	},
	normalize : function (node)
	{
		if (!node)
			return;
		node.$.normalize();
		MSGUTIL.normalizeFix(node);
		var spans = node.$.querySelectorAll("span");
		for (var i = 0; i<spans.length; i++)
		{
			var span = new CKEDITOR.dom.element(spans[i]);
			var text = MSGUTIL.getPureText(span);
			if ( !MSGUTIL.isBookMark(span) && (text == null || text.length == 0))
				span.remove();
		}
	},
	// for IE 8 the native normalize defect 6345
	normalizeFix:function(node){
		if(!CKEDITOR.env.ie)
			return;
		for (var i=1;i< 7; i++){
			var headingTag  = "h"+i;
			var headings = node.$.querySelectorAll(headingTag);
			if(headings!=null){
				for( var j =0;j < headings.length;j++ ){
					var heading = new CKEDITOR.dom.element(headings[j]);
//					if( MSGUTIL.getNodeLength(heading) == 0){
//						console.info("remove the illegal heading node");
//						heading.remove();
//					}
					if(MSGUTIL.isHeading(heading.getParent())){
						heading.remove(true);
						console.info("remove the illegal heading node");
					}
				}
			}
		}
	},
	/*
	 *	merge fromBlock's contents to toBlock
	 *  the caller must make sure fromBlock is the bottommost block, 
	 * like <li><h1>aaa</h1></li>, the fromBlock should be <h1>, same as the toBlock;
	 *	 
	*/
	merge : function (fromBlock, toBlock, range)
	{
		var acts = [],bookmark;
		var last = toBlock.getLast();
		
		while (this.isNullBr(last))
		{
			last.remove();
			last = toBlock.getLast();
		}
			
		if(range)
		{
			range.moveToElementEditEnd(toBlock);
			bookmark = range.createBookmark();
		}
		
		// insert next block content to current block message
		var act = SYNCMSG.createInsertTextAct(0, MSGUTIL.getNodeLength(fromBlock), fromBlock, toBlock);
		acts.push(act);
		
		// delete next block message
		var removedBlock = fromBlock;
		// TODO:
		// should process following case:
		// <ul><li><ol><li><h1>aaa</h1></li></ol></li></ul>
		if (fromBlock.getParent() && fromBlock.getParent().getChildCount() == 1)
		{
			removedBlock = fromBlock.getParent();
			if (MSGUTIL.isListItem(removedBlock) && removedBlock.getParent().getChildCount() == 1)
				removedBlock = removedBlock.getParent();
			else
				removedBlock = fromBlock;
		}
		act = SYNCMSG.createDeleteBlockElementAct(removedBlock);
		acts.push(act);
		
		fromBlock.moveChildren(toBlock);
		removedBlock.remove();

		toBlock.$.normalize();
		
		if(range && bookmark )
		{
			range.moveToBookmark( bookmark );
		}
		
		return acts;
	},
	/* mergePToLi
	 * p  <p>..</p> or <h1>...</h1>....
	 * li <li>...</li>
	 *  merge abc and def 
	 * <li> abc
	 * 		<p> def </p>
	 *  </li>  
	 */
	mergePToLi: function( p, li, range )
	{		
		if( li.equals( p.getParent()))
		{
			/*
			 * <li> abc
			 * 		<p> def </p>
			 *  </li>
			 */
			var act, acts = [],node;
			//remove br
			while( ( node = p.getPrevious() )&& MSGUTIL.isNullBr(node) )
				node.remove();
				
			var offset = p.getIndex()
				,start = MSGUTIL.transOffsetRelToAbs(li, offset, li)
				,end = start+ MSGUTIL.getNodeLength(p);
			
			act = SYNCMSG.createDeleteBlockElementAct(p);
			acts.push(act);
				
			//move children before p
			while(node = p.getFirst())
				node.remove().insertBefore(p);
			p.remove();
				
			var act = SYNCMSG.createInsertTextAct( start, end, li);
			acts.push(act);
			
			range.setStart(li, offset);
			
			return acts;
		}
		else
			throw 'error parameters';
	},
	isPrivateDocument : function ( doc)
	{
		var result = false;
		var body = doc.getBody();
		var masterDoc = body.getAttribute('masterdoc');
		if ( masterDoc && masterDoc != "")
			result = true;
		return result;
	},
	/* mergeLiToLi
	 * fromBlock: <li><h2>bbb</h2></li> or <li>bbb</li>
	 * toBlock: <li><h1>aaa</h1></li> or <li>aaa</li>
	 * one case should be processed specially, like this: 
	 * 										<li>aaa
	 *											<ol>
	 * 												<li>^bbb</li>
	 * 												<li>ccc</li>
	 * 											</ol>
	 *										</li>
	 *
	*/
	mergeLiToLi: function(fromBlock, toBlock, range)
	{
		var act, acts = [];
		//var parent = fromBlock.getParent();
		//if (parent.getParent().equals(toBlock))
		
		if( toBlock.contains(fromBlock))
		{
			var parent = fromBlock;
			while( !parent.getParent().equals(toBlock ))
				parent = parent.getParent();
			// the special case:
			//	<li>aaa
			// 		<ol><li>^bbb</li></ol>
			//  </li>
			//or 
			// <li>aaa
			//		<ol><li><ol><li>bbb</li></ol></li><ol>
			//</li>
			
			acts.push( SYNCMSG.createDeleteBlockElementAct(toBlock));
			
			
			// add a class temporary, because it will be updated by updateListValue based on outline later
			if (LISTUTIL.getListClass(toBlock) == null)
			{
				LISTUTIL.setListClass(toBlock, LISTUTIL.getListClass(fromBlock));
			}
			
			var parentSibling = parent.getPrevious();
			
			// remove null br
			while (MSGUTIL.isNullBr(parentSibling))
			{
				parentSibling.remove();
				parentSibling = parent.getPrevious();
			}
			
			var isRemoveParentSibling = false;
			if(!parentSibling)
			{
				parentSibling = new CKEDITOR.dom.text('');
				parentSibling.insertBefore(parent);
				isRemoveParentSibling = true;
			}
			
			var toLastNode = parentSibling;
			var nextSibling = parentSibling.getNext();
			var targetNodeParent = toLastNode.getParent();
			if (MSGUTIL.isHeading(parentSibling))
			{
				// remove null br
				var last = parentSibling.getLast();
				while (MSGUTIL.isNullBr(last))
				{
					last.remove();
					last = parentSibling.getLast();
				}
				toLastNode = last;
				targetNodeParent = parentSibling;
				var first = fromBlock.getFirst();
				while (concord.text.tools.isAnchor(first))
					first = first.getNext();
				if ( MSGUTIL.isHeading(first))
				{
					var child = first.getFirst();
					if (MSGUTIL.isListSpacer(child))
						child.remove();
					first.moveChildren(parentSibling);
					first.remove();
				} else {
					var child;
					while ( (child = fromBlock.getFirst()) && !MSGUTIL.isList(child))
					{
						if (MSGUTIL.isListSpacer(child))
							child.remove();
						else
							parentSibling.append(child.remove());
					}
				}
			} else {
				var first = fromBlock.getFirst();
				while (concord.text.tools.isAnchor(first))
					first = first.getNext();
				var from;
				if (MSGUTIL.isHeading(first))
				{
					var child;
					while ( child = first.getFirst())
					{
						if (LISTUTIL.isListSpacer(child))
							child.remove();
						else 
							child.insertBefore(parent);
					}
					first.remove();
				} else {
					var child;
					while ( (child = fromBlock.getFirst()) && !MSGUTIL.isList(child))
					{
						if (MSGUTIL.isListSpacer(child))
							child.remove();
						else
							child.insertBefore(parent);
					}
				}
			}
			if (fromBlock.getChildCount() > 0)
			{
				LISTUTIL.removeListClass(fromBlock);
			} else {
				var removeBlock = fromBlock;
				var removeParent = removeBlock.getParent();
				while (!removeParent.equals(toBlock) && removeParent.getChildCount() == 1)
				{
					removeBlock = removeParent;
					removeParent = removeBlock.getParent();
				}
				removeBlock.remove();
			}
			
			if (isRemoveParentSibling)
			{
				parentSibling.remove();
			}
			/*
			if( nextSibling && this.isList(nextSibling) )
			//fixed a defect 
			//merge 222 with 444 
			// need merge two ol
			//	<li> 222
			//		<li>444
			//		<ol> ... <ol>
			//		</li>
			//		<ol> ... <ol>
			//	</li>
			//
				LISTUTIL.mergeListSibling( nextSibling, true );
			*/

			var offset = toLastNode ? MSGUTIL.getNodeLength(toLastNode) : 0;
			var index = toLastNode ? toLastNode.getIndex() : 0;
			toBlock.$.normalize();
			if(range)
			{
				if(!isRemoveParentSibling)
				{
					if (!toLastNode) {
						range.setStart(targetNodeParent, index);
					} else if (toLastNode.type == CKEDITOR.NODE_TEXT)
					{
						range.setStart(targetNodeParent.getChild(index),offset);
					} else {
						range.setStart(targetNodeParent, index+1);
					}
					range.collapse(true);
				}
				else
					range.moveToElementEditStart(toBlock);
			}
			LISTUTIL.updateListId(toBlock);
			acts.push(SYNCMSG.createInsertBlockElementAct(toBlock));
		} else {
			var startIndex = MSGUTIL.getNodeLength(toBlock);
			var removeBlock = fromBlock;
			var removeParent = removeBlock.getParent();
			while (removeParent.getChildCount() == 1)
			{
				removeBlock = removeParent;
				removeParent = removeBlock.getParent();
			}
			acts.push(SYNCMSG.createDeleteBlockElementAct(removeBlock));
			var to = toBlock;
			// TODO For defect 13798
//			<li>text 1^</li>
//			<li>
//			   <ol>
//			     <li>text 2</li>
//			     	<ol><li>text 3</li></ol>
//			      <li>text 4</li>
//			    </ol>
//			</li>
			// 1. Get first content deeply.
			// 2. Check if the elment is empty then delete it.
			var first = toBlock.getFirst();
			while (concord.text.tools.isAnchor(first))
				first = first.getNext();
			if (MSGUTIL.isHeading(first))
			{
				to = first;
			}
			// remove null br
			var last = null;
			while (MSGUTIL.isNullBr(last = to.getLast()))
			{
				last.remove();
			}
			first = fromBlock.getFirst();
			while (concord.text.tools.isAnchor(first))
				first = first.getNext();
		
			if (MSGUTIL.isHeading(first))
			{
				var child = first.getFirst();
				if (MSGUTIL.isListSpacer(child))
					child.remove();
				first.moveChildren(to);
				first.remove();
			} else {
				var child;
				while ( (child = fromBlock.getFirst()) && !MSGUTIL.isList(child))
				{
					if (MSGUTIL.isListSpacer(child))
						child.remove();
					else 
						to.append(child.remove());
				}
			}
			acts.push(SYNCMSG.createInsertTextAct(startIndex, MSGUTIL.getNodeLength(toBlock), toBlock));
			if (fromBlock.getChildCount() > 0)
			{
				LISTUTIL.removeListClass(fromBlock);
				LISTUTIL.updateListId(removeBlock);
				acts.push(SYNCMSG.createInsertBlockElementAct(removeBlock));
			} else {
				removeBlock.remove();
			}
		}
		return acts;
	}
	
	
});

(function(){
	if(typeof MSGUTIL == "undefined")
		MSGUTIL = new concord.text.MsgUtil();	
})();

