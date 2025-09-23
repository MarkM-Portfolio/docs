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

/**
 * Tools in document editor
 *@author: xuezhiy@cn.ibm.com
 */
dojo.provide("concord.text.tools");

concord.text.tools = new function()
{	
	/* fix range for br, span, and other problems. All range problem will be fixed here in the future
   	 * @param
   	 * the first parameter is editor,
   	 * the second parameter is range
   	 * @example
	 * fixRange(range); 
	 */
   this.fixRange = function(editor,range)
      {
		if (!editor || !range) {
			return;
		}

		if (!range.collapsed
				|| range.startContainer.type != CKEDITOR.NODE_ELEMENT) {
			return;
		}

		if (window.TASK != undefined && TASK.tools.cursor.focusMeta(range)) {
			return;
		}

		var changed = 0;
		console.log('fix range begin');
	//	console.log( "nodeName: " + range.startContainer.getName());
		if (range.startContainer.is('hr')) {
			// special deal with hr
			// Select hr the range is not collapsed in FF 3.6, but it's
			// collapsed in FF 6.
			// Solve the problem that insert a paragraph into hr in FF6.
			var selectedHr = range.startContainer;
			var parent = selectedHr.getParent();
			var index = selectedHr.getIndex();
			range.setStart(parent, index);
			range.setEnd(parent, index + 1);
			changed = 1;
		} else if (this.isAnchorParent(range.startContainer))
		{
			var shape = range.startContainer.$.querySelector('div[_type="secondDiv"]');
			if (shape)
			{
				shape = new CKEDITOR.dom.element(shape);
				range.setStartBefore(shape);
				range.setEndAfter(shape);
				changed = 1;
			}
		} else {
			if (range.startContainer.is('br')){
				if( !CKEDITOR.env.ie || CKEDITOR.env.version != 10 )
				{
					range.moveToPosition(range.startContainer, CKEDITOR.POSITION_BEFORE_START );
					changed = 1;
				}
			}
			var child;
			if (range.startOffset == range.startContainer.getChildCount()) {
				var last = range.startContainer.getLast();
				
				if (CKEDITOR.env.gecko && MSGUTIL.isBogus(last)) {
					// Process range for Firefox
					// If select after BR for Firefox, move before BR
					var previous = last.getPrevious();
					if (previous){
						range.moveToElementEditEnd(previous);
					}else{
						range.moveToElementEditStart(range.startContainer);
					}
					changed = 1;
				}else if ( (CKEDITOR.env.gecko || CKEDITOR.env.ie) && MSGUTIL.isBlock(last)) {
					// If select after a block for Firefox or IE, move at the
					// end of the block
					range.moveToElementEditEnd(last);
					changed = 1;
				}
				
				
			} else {
				child = range.startContainer.getChild(range.startOffset);
				if (MSGUTIL.isBogus(child)) {
					if (CKEDITOR.env.ie) {
						if (CKEDITOR.env.version<9 || range.startOffset == 0 ){
							// Process br for IE, if select before BR, move after BR
							// For ie9, if br is not at the start, don't fix
							var next = range.startContainer.getChild( range.startOffset+1);
							if(  CKEDITOR.env.version != 10 || !MSGUTIL.isList( next ))
							{ //if next is list , and in ie10, do not move cursor
								range.startOffset++;
								range.endOffset++;
								changed = 1;
							}
							
						}
						
					} else if ( CKEDITOR.env.webkit && range.collapsed ) {
						// defect 20413, we need add an empty span to solve the cursor issue
						if ( range.startOffset == 0 && MSGUTIL.isListItem( range.startContainer ) )
						{
							var fillingSpan = new CKEDITOR.dom.element( 'span' );
							fillingSpan.insertBefore( child );
						}
					}
				}
			}

			// defect 46939
			// The cursor position should be at the span start if the cursor
			// is before span (the span is not a bookmark)
			// The cursor should be at the span end if the cursor is between
			// a span and a BR after that

			child = range.startContainer.getChild(range.startOffset);
			
			if (child && child.is  && ( (child.is ('span') && !MSGUTIL.isBookMark(child)) || (!range.startContainer.is('li') && MSGUTIL.isBlock(child))) ) {
				range.moveToElementEditStart(child);
				changed = 1;
			} else if (child && child.is && MSGUTIL.isBogus(child)
					&& range.startOffset > 0) {
				var pre = range.startContainer.getChild(range.startOffset - 1);
				if (pre && pre.type == CKEDITOR.NODE_ELEMENT && !pre.is ('a') && !pre.is('img') && !pre.getAttribute('contenteditable') ){
					var last = pre.getLast();
					var editable = true;
					while(last && last.type == CKEDITOR.NODE_ELEMENT){
						if (!last.isEditable()){
							editable =false;
							break;
						}
						last = last.getLast();
					}
					if (editable){
						range.moveToElementEditEnd(pre);
						changed = 1;
					}

				}
			}
		}
		
		if(CKEDITOR.env.ie && CKEDITOR.env.version>=9){
			//For IE9, if range is after br, and there is text before br, we should move range before br
			if (range.startOffset>0 && range.startContainer.getChild){
				var previous = range.startContainer.getChild(range.startOffset-1);
				if (previous && previous.is && MSGUTIL.isBogus(previous) ){
					//13580, a very special case
					//if cursor is after a br, and before a ol, and there is text before br, we should move cursor before br.
						var previous = previous.getPrevious();
						if (previous && previous.type == CKEDITOR.NODE_TEXT && MSGUTIL.getPureText(previous).length>0){
							range.moveToPosition(previous, CKEDITOR.POSITION_BEFORE_END );
							changed = 1;
						}
						else if ( child && MSGUTIL.isList( child ) &&  CKEDITOR.env.version == 10  )
						{ //move into ol/ul
							range.moveToElementEditStart( child );
							changed = 1;
						}
					}
			}
			
		}

		
		if (changed) {
			range.select();
			// Notify non-IE that selection has changed.
			//if (!CKEDITOR.env.ie)
			//	editor.selectionChange();
		}

	};
	//defect 9336 Ie9 range error for table and bullet.
   this.moveRangeToTableBefore= function(range,msg){
	   if(!CKEDITOR.env.ie){
		   return;
	   }
	   if(window.g_presentationMode==true){
		   return;
	   }
	   if(range==null||!range.collapsed){
		   return;
	   }
	   var startContainer = range.startContainer;
	   var table = startContainer.getAscendant("table",true);
	   if(table==null){
		   return;
	   }
	   if(msg!=null){
		   var acts = msg.as || msg.updates; 
			if(!acts)
				return;
		   var row = startContainer.getAscendant("tr",true);
		   var col = startContainer.getAscendant("td",true)||startContainer.getAscendant("th",true);
		   if(row==null&&col==null){
			   return; 
		   }
		   var rid =row && row.getId();
		   var cid = col && col.getId();
		   var flag=false;
		   for(var i =0;i<acts.length;i++ ){
			   var act = acts[i];
			   if(act.t==MSGUTIL.actType.deleteElement){
				   var tids = act.elist;
				   if(tids==null){
					   continue;
				   }
				   for(var j=0;j< tids.length;j++){
					   if(rid && tids[j]==rid){
						   flag =true;
						   break;
					   }
					   if(cid && tids[j]==cid){
						   flag =true;
						   break;
					   }
				   }
				   if(flag){
					   break;
				   }
			   }
		   }
		   if(flag==false){
			   return ;
		   }
	   }
	   var node = table;
	   // the table can be the child of a div . 
	   while(!(node.getParent().is("body"))){
		   node = node.getParent();
	   };
	   var targetNode = node.getNext();
	   if(targetNode==null){
		   targetNode = node.getPrevious();
	   }
	   if(targetNode ==null){
		   targetNode = node.getParent();
	   }
	   range.moveToElementEditStart(targetNode);
	   range.select();
//	   console.info("move the cursor out of the table");
   };
	/*
	 * check whether current block should append a br to its end @param block
	 * current block element @example isBlockBrAttachable(paraElemeng); return
	 * true isBlockBrAttachable(tableElement); return false
	 */
   this.isBlockBrAttachable = function(block)
   {
   		if(!block || block.type != CKEDITOR.NODE_ELEMENT)
   			return false;
   			
   		var tagName = block.getName();
   		if(CKEDITOR.dtd.$listItem[tagName] || tagName == 'p' || MSGUTIL.isHeading(block))
   			return true;
   		return false;
   };
	
	this.createBogus = function( doc )
	{
		var node =  CKEDITOR.env.opera ?
				doc.createText('') :
				doc.createElement( 'br' ) ;
				
		if (node.type == CKEDITOR.NODE_ELEMENT) 
			node.addClass("hideInIE");
		return node;
	};
	/* append a br to li
	 * @param
	 * block li block
	 * @param
	 * dealWithNestedListItems flag, set to take care all nested li block
	 * @example
	 * <ol><li><ol><li>123<br></li></ol></li></ol>
	 * <ol><li><br><ol><li>123<br></li></ol></li></ol>
	 */  
   this.appendBogusToList = function(block,dealWithNestedListItems)
   {//assume that no ul/ol under ol/ul
   		if(!block || block.type != CKEDITOR.NODE_ELEMENT)
   			return;
   		
   		if(!MSGUTIL.isBullet(block))
   			return;
   		
   		if(MSGUTIL.isList(block))
   		{
   			if(!dealWithNestedListItems)
   				return;
   			var len = block.getChildCount();
   			for(var i=0;i<len;i++)
   			{
   				this.appendBogusToList(block.getChild(i),true);
   			}
   		}else
   		{
   			var firstBlock = block.getFirst( function( node )
   			{
   				return MSGUTIL.isBlockListItem(node);
   			});
   			
   			if( firstBlock && MSGUTIL.isList(firstBlock) && (LISTUTIL.getListClass(block)))
   			{
   				// Ignore empty/spaces text.
   				var previous = firstBlock.getPrevious();
   				while ( previous && (previous.type == CKEDITOR.NODE_TEXT && !CKEDITOR.tools.rtrim( previous.getText() )))
   				{
   					previous = previous.getPrevious();
   				}
   				if (!MSGUTIL.isNullBr(previous))
   				{
   					var bogus = this.createBogus(block.getDocument());
   					bogus.insertBefore( firstBlock );
   				}
   			}
   			else if( !firstBlock )
   			{
   				var last = block.getLast();
   				while ( last && (last.type == CKEDITOR.NODE_TEXT && !CKEDITOR.tools.rtrim( last.getText() )))
   				{
   					last = last.getPrevious();
   				}
   				if (!MSGUTIL.isNullBr( last ))
   				{
   					var bogus = this.createBogus( block.getDocument());
   					block.append( bogus );
   				}
   			}
   			if(dealWithNestedListItems)
   			{
   				while( firstBlock )
   				{
   					if(  MSGUTIL.isList(firstBlock) )
   						this.appendBogusToList( firstBlock,true);
   					else
   						firstBlock.appendBogus();
   					firstBlock = firstBlock.getNext();
   				}
   			}
   		}	
   };
   
   this.isFirstBlockListItem = function(block)
   {
   		if(!block || block.type != CKEDITOR.NODE_ELEMENT)
   			return false;
   		var parent = block.getParent();
   		if ((MSGUTIL.isHeading(block)||MSGUTIL.isParagraph(block)) && MSGUTIL.isListItem(parent))
   		{
			var first =  parent.getFirst();
			while (this.isAnchor(first))
				first = first.getNext();
			if (first && block.equals(first))
				return true;
   		}
   		return false;
   };
   
   /**
    * @param node
    * @returns true if empty 'a'
    */
   this.isAnchor = function(node)
   {
   		if(!node || node.type != CKEDITOR.NODE_ELEMENT)
   			return false;
   		var name = node.$.nodeName.toLowerCase();
   		if (name == 'a' && !node.getText())
   			return true;
   		return false;
   };
   
 	/*check whether current cursor start locates in some container
  	 * @param
  	 * the first parameter is selection. To support old code, the first parameter can also be editor
  	 * the other parameters are names of tag which you want to determine 
  	 * @example
	 * isStartInContainer(selection,'table'); check cursor start is in table or not
	 * isStartInContainer(selection,'th','td'); check cursor start is in tbody or not
	 */
  this.isStartInContainer = function()
  {
	   var selection = arguments[0];
	   if (selection.getSelection){
	    	  //to avoid defect, in case selection is editor.
	    	  selection = selection.getSelection();
	     }
	   
	   var range = selection.getRanges()[0];
	   if (!range){
		   return false;
	   }
	   for ( var i = 1 ; i < arguments.length ; i++ )
	   {
		   var container = range.startContainer.getAscendant(arguments[i],true);
		   if(container)
			   return true;
	   }
	   return false;

  };
   	/*check whether current cursor locates in some container
   	 * @param
   	 * the first parameter is selection. To support old code, the first parameter can also be editor
   	 * the other parameters are names of tag which you want to determine 
   	 * @example
	 * isInContainer(selection,'table'); check cursor is in table or not
	 * isInContainer(selection,'th','td'); check cursor is in tbody or not
	 */
   this.isInContainer = function()
   {
	   var selection = arguments[0];
	   if (selection.getSelection){
	    	  //to avoid defect, in case selection is editor.
	    	  selection = selection.getSelection();
	     }
	   
	   var range = selection.getRanges()[0];
	   if (!range){
		   return false;
	   }
	   range = range.clone();
	   
	   var common = range.getCommonAncestor();
	   var startContainer = range.startContainer, endContainer = range.endContainer;
	   var rangeChanged = false;
	   var needRevise = !range.collapsed && common.type == CKEDITOR.NODE_ELEMENT && common.is('body', 'div');
	   if( needRevise && common.equals(startContainer))
	   {
		   range.startContainer = startContainer.getChild(range.startOffset);
		   range.startOffset = 0;
		   rangeChanged = true;
	   }	
	   
	   if(needRevise && common.equals(endContainer))
	   {
		   var offset = range.endOffset;
		   if(offset > 0)
			   offset -= 1;
		   range.endContainer = endContainer.getChild( offset );
		   if(range.endContainer.type == CKEDITOR.NODE_ELEMENT)
			   range.endOffset = range.endContainer.getChildCount();
		   else
			   range.endOffset = range.endContainer.getLength();
		   rangeChanged = true;
	   }	   
	
	   common = rangeChanged ? range.getCommonAncestor() : common;
	   for ( var i = 1 ; i < arguments.length ; i++ )
	   {
		   var container = common.getAscendant(arguments[i],true);
		   if(container)
			   return true;
	   }		   
	   return false;
   };
   /*
    * Check a node is readonly 
    */
   this.isReadOnly = function( node )
   {
   		return CKEDITOR.tools.isInToc && CKEDITOR.tools.isInToc(node );
   };
   
   /*
    * Check a node is readonly 
    */
   this.containsReadOnly = function( node )
   {
	   //query div toc
	   return (dojo.query('div.TOC', node.$).length >0);
   };
   /*
    * Check a node is image indicator layer div 
    */   
   this.isImageIndicator = function(node)
   {
	 if(!node)
		 return false;
	 
	 if(!(node.is && node.is('div') && node.hasAttribute('id') && node.getId() == 'concord_image_indicator_div'))
		 return false;
	 
	 return true;
   };
   
   /*
    * Check selected content can be modified
    */
    this.isSelectedReadOnly = function( selection )
    {
    	if ( selection.getSelection){
    		selection = selection.getSelection();
    	}
    	
    	var that = this;
    	
    	var funcImpl = function(selection){
	    	//TOC placeholder_container
    		if (pe.lotusEditor.getCommand("deleteTOC").state == CKEDITOR.TRISTATE_OFF){
    			return false;
    		}
//	    	if (dojo.query('div.TOC', selection.document.$).length == 0)
//	    		return false;
	    	//
	    	
		   var ranges = selection.getRanges();
		   var range;
		   for ( var i = 0 ; i < ranges.length ; i++ )
		   {
		   	   range = ranges[i].clone();
		   	   var commonAncestor = range.getCommonAncestor();
		   	   
		   	   if(range.collapsed)
		   	   {
			   		if( that.isReadOnly(commonAncestor ))
		   	   			return true;
			   		else
			   			continue;
		   	   }
		   	   
		   	   var endParents = range.endContainer.getParents();
		   	   range.enlarge( CKEDITOR.ENLARGE_BLOCK_CONTENTS );
		   	   var boundaryNodes = range.getBoundaryNodes();
		   	   var current = boundaryNodes.startNode;
		   	   var last = boundaryNodes.endNode.getNextSourceNode( true, CKEDITOR.NODE_ELEMENT );
		   	   while( current )
		   	   {
		   		   // The isReadOnly function will check if it is in ToC
		   		   // So we will check block element first
		   	   		if( !MSGUTIL.isBlock(current) )
		   	   			current = MSGUTIL.getBlock(current);
		   	   		
		   	   		if( that.isReadOnly(current ) || that.containsReadOnly(current))
		   	   			return true;
		   	   		
		   	   		if(commonAncestor.equals(current) || MSGUTIL.containsElement2(endParents ,current))
		   	   			break;
		   	   		
		   	   		current = current.getNextSourceNode( true, CKEDITOR.NODE_ELEMENT, last );
		   	   }
		   }
		   return false;
    	};
    	
    	if(this._isSelectedReadOnlyCache && selection == this._isSelectedReadOnlyCache.selectionCache)
    	{
    		return this._isSelectedReadOnlyCache.hasReadOnlyCache;
    	}
    	
    	var ret = funcImpl(selection);
    	
    	this._isSelectedReadOnlyCache = {};
    	this._isSelectedReadOnlyCache.selectionCache = selection;
    	this._isSelectedReadOnlyCache.hasReadOnlyCache = ret;
    	
    	return ret;
    };
   this.getSiblingList = function(node, rtl, css)
   {
		var sibling = null;
		if (node && node.type == CKEDITOR.NODE_ELEMENT)
		{
			sibling = MSGUTIL.getBlock(node);
			do {
				sibling = rtl ? sibling.getPrevious(): sibling.getNext();
			} while  (sibling && (!MSGUTIL.isList(sibling) || css != MSGUTIL.getListClass(sibling)));
		}
		return sibling;
   };
   // return whether this list is the first list in a continued list
   this.getFollowedList = function (node, rtl)
   {
   		var follow = null;
   		if (MSGUTIL.isList(node))
   		{
   			var style = node.getStyle('counter-reset');
   			if (rtl && (style != ""))
   			{
   				// this list has been restart, so it's impossible to get a previous list.
   			} else {
	   			var css = MSGUTIL.getListClass(node);
	   			if (css != null && css != "")
	   			{
	   				follow = this.getSiblingList(node, rtl, css);
	   				if (!rtl && follow && follow.getStyle('counter-reset') != "")
	   				{
	   					// the next list has been restart, so it's not our followed list
	   					follow = null;
	   				}
	   			}
   			}
   		}
   		return follow;
   };
   this.getHeaderList = function (node, css)
   {
	 var header = null;
	 if (MSGUTIL.isList(node))
	 {
		 var list = null;
		 if (css == null)
		 {
			 css = MSGUTIL.getListClass(node);
			 list = node;
		 } else {
			 list = this.getSiblingList(node, true, css);
			 if (list == null && css == MSGUTIL.getListClass(node))
				 list = node;
		 }
		 while (list)
		 {
			 header = list;
			 list = this.getFollowedList(list, true);
		 }
	 }
	 return header;
   };
   this.fixContinueList  = function (node)
   {
   		var acts = [];
   		if (MSGUTIL.isList(node) && node.getStyle('counter-reset'))
   		{
   			var follow = this.getFollowedList(node);
   			if (follow && !follow.getStyle('counter-reset'))
   			{
   				var css = MSGUTIL.getListClass(node);
				follow.setStyle('counter-reset', css );
				acts.push( SYNCMSG.createAttributeAct( follow.getId(),null,{'counter-reset': css },null,{}));  				
   			}
   		}
   		return acts;
   };
   this.isImageSupported  = function (fileName)
   {
	   if(!fileName)
		   return false;
	   var extName = fileName.substring(fileName.lastIndexOf('.')+1,fileName.length).toLowerCase();
	   for(var ext in CKEDITOR.config.supportedImages)
	   {
		   if(CKEDITOR.config.supportedImages[ext] === extName)
			   return true;
	   }
   	   return false;
   };
   this.startWith = function(target,startString)
   {
	   if(!target || !startString)
		   return false;
	   if(typeof target != 'string')
		   return false;
	   if(typeof startString === 'string')
	   {
		   if(target.substring(0,startString.length) == startString)
			   return true;
	   }else if(typeof startString === 'object' && startString.length)
	   {
		   for(var i=0;i<startString.length;i++)
           {
			   if(target.substring(0,startString[i].length) == startString[i])
				   return true;
           }
	   }
	   return false;
   };
   
   this.handleSelectAllForFF = function(node)
   {
		if(CKEDITOR.env.gecko && (node.hasPrevious() && node.getPrevious().getName() == 'span' && node.getPrevious().hasAttribute('_fck_bookmark')))
			return 1;
		return 0;
   };

   this.isTab = function(node)
   {
	   return node && this.isImage(node) && !node.hasAttribute('src') && (node.hasClass('ConcordTab') || node.hasClass('noSrcAttr'));
   };
   
   this.isImage = function(imgNode)
   {
	   if(!imgNode || !imgNode.is)
		   return false;
	   var name = imgNode.$.nodeName.toLowerCase();
	   return (name == 'img');
   };
   this.isImageEditable = function ( img )
   {
	 if (img && img.type == CKEDITOR.NODE_ELEMENT)
	 {
		 if ((img.hasAttribute('_type') && img.getAttribute('_type') != 'image') || this.getAnchorParent(img))
			 return false;
	 }
	 return true;
   };
   this.isAnchorImage = function(imgNode)
   {
	   if(!this.isImage(imgNode))
		   return false;
	   if(imgNode.hasAttribute('_srcanchortype') && !imgNode.hasAttribute('_type') )
		   return true;
	   return false;
   };
   this.containsShape = function (selection,notIncludeOtherAnchor,includeAnchorParagraph)
   {
	   var that = this;
	   var containsShapeImpl = function(selection,notIncludeOtherAnchor,includeAnchorParagraph){
		
		var contains;
		var selector = 'div[_srcanchortype]';
		if(!selection.document.$.querySelector(selector))// no shape in body 
			return false;
		var range = selection.getRanges()[0];
		if (!range){
			return false;
		}
		if (range.collapsed && !includeAnchorParagraph)
			return false;
		
		var boundary = range.getBoundaryNodes();
		var startNode = boundary.startNode;
		var endNode = boundary.endNode;
		if (that.hasAnchorContainer(startNode) || that.hasAnchorContainer(endNode))
			return true;
		var startBlock = MSGUTIL.getBlock(startNode);
		var endBlock = MSGUTIL.getBlock(endNode);
		if((startBlock.equals(endBlock) && startBlock.is('p'))||range.collapsed)
		{// p under top div with anchor text
			var div = startBlock.getAscendant("div");
			var isAnchorPara = div && notIncludeOtherAnchor?that.isAnchorParent(div):that.isAnchorContainer(div);
			if(isAnchorPara && includeAnchorParagraph )
				return true;
			else
				return false;
		}

		var anchorElements = selection.document.$.querySelectorAll(selector);
		var length = anchorElements.length;
		for(var i=0;i<length;i++)
		{
			var anchorElement = new CKEDITOR.dom.element(anchorElements[i]);
			var parent = anchorElement.getParent();
			if(that.isAnchorParent(parent))
				anchorElement = parent;
			var position = anchorElement.getPosition(endBlock);
			if(position & CKEDITOR.POSITION_FOLLOWING || position & CKEDITOR.POSITION_IS_CONTAINED)//anchor element after endblock
				continue;
			position = anchorElement.getPosition(startBlock);
			if(position & CKEDITOR.POSITION_FOLLOWING || position & CKEDITOR.POSITION_IS_CONTAINED)//anchor element start block
				return true;
		}
		return false;
	   };
	   
	   if(!selection)
			return false;
		if (selection.getSelection){
			//to avoid defect, in case selection is editor.
			selection = selection.getSelection();
		}
		
	   if(this._containsShapeCache)
	   {
		   with(this._containsShapeCache)
		   {
			   if(selection == selectionCache && notIncludeOtherAnchor == noAnchorCache && includeAnchorParagraph && withAnchorCache)
				   return hasShapeCache;
		   }		   
	   };
	   
	   var ret = containsShapeImpl(selection,notIncludeOtherAnchor,includeAnchorParagraph);
	   
	   this._containsShapeCache = {};
	   with(this._containsShapeCache)
	   {
		   selectionCache = selection;
		   noAnchorCache = notIncludeOtherAnchor;
		   withAnchorCache = includeAnchorParagraph;
		   hasShapeCache = ret;
	   }
	   
	   return ret;
   };
   
   this.isReadContainer = function(element)
   {
	   if(element && element.getName && element.getName() == 'div')
	   {
		   if (element.getAttribute('_type') == 'secondDiv' && element.getAttribute('contenteditable') == 'false')
			   return true;  
	   }
	   return false;
   };   
   
   this.isEditContainer = function(element)
   {
	   if(element && element.getName && element.getName() == 'div')
	   {
		   if (element.getAttribute('_type') == 'secondDiv' && !element.getAttribute('contenteditable'))
			   return true;  
	   }
	   return false;
   }; 
   
   this.getAnchorParent = function( node )
   {
	   var parent = null;
	   if (node && node.type == CKEDITOR.NODE_ELEMENT)
	   {
		   parent = node.getAscendant('div');
		   while (parent && parent.getAttribute('_type') != 'secondDiv')
		   {
			   parent = parent.getAscendant('div');
		   }
	   }
	   return parent;
   };
   
   this.adjustTextboxRange = function(target,editor)
   {
	   var sel = editor.getSelection();
	   var ranges=sel.getRanges();
	   var range = ranges[0];
	   var common = range.getCommonAncestor();
	   var changed = false;
	   if (common.type == CKEDITOR.NODE_TEXT)
		   return true;
	   var div = common.getAscendant('div',true);
	   if( div && (div.hasClass('textbox') || (div.hasAttribute('_type') && div.getAttribute('_type')=='drawframe')) && div.isEditable() )//range in text box
	   {
		   if(!( common.contains(target) || common.equals(target)))
		   {
			    range.moveToElementEditStart(target);
			    sel.selectRanges([range]);
			    return true;
		   }  
	   }
	   return false;
   };
   
   this.adjustContainerRange = function(target,editor)
   {
	   var sel = editor.getSelection();
	   var ranges=sel.getRanges();
	   var range = ranges[0];
	   var common = range.getCommonAncestor();
	   var changed = false;
	   if (common.type == CKEDITOR.NODE_TEXT)
		   return;
	   if(!( common.contains(target) || common.equals(target)))//special case on ie,safari
	   {
		   var container = target.getAscendant('div',true);
		   while (container && !this.isReadContainer(container))
		   {
			   container = container.getAscendant('div');
		   }	 
			if (container)
			{
				range.setStartBefore(container);
				range.setEndAfter(container);
				changed = true;
			} 
	   }
	   else 
	   {
		   common = common.getAscendant('div',true);
		   if(common && this.isAnchorContainer(common) || this.isAnchorParent(common))
		   {
			   var container = null;
			   if (this.isAnchorContainer(common))
				   container = common;
			   else
			   {   
				   container = common.$.querySelector('div[_type="secondDiv"]');
				   container = new CKEDITOR.dom.element(container);
				   if (!(container.contains(target) || container.equals(target)))
					   container = null;
			   }
			   if (container == null)
				   return;
			   range.setStartBefore(container);
			   range.setEndAfter(container);
			   changed = true;
		   }	
		   else
		   {
			   if (range.startContainer.type == CKEDITOR.NODE_ELEMENT)
			   {
				   var start;
				   var offset = range.startOffset;
				   if (offset < range.startContainer.getChildCount())
				   {
					   start = range.startContainer.getChild(offset);
				   }
				   else
					   start = range.startContainer;
				   
				   var container = start.getAscendant('div',true);
				   while (container && !this.isReadContainer(container))
				   {
					   container = container.getAscendant('div');
				   }
		
				   if (container)
				   {
					   range.setStartBefore(container);
					   changed = true;
				   }	   				   
			   }	   
			   if (range.endContainer.type == CKEDITOR.NODE_ELEMENT)
			   {
				   var end;
				   if (range.endContainer.getChildCount()>0)
				   {
					   var offset = range.endOffset;
					   if ( offset > 0)
						   offset -= 1;
					   end = range.endContainer.getChild(offset);	
				   }
				   else
					   end = range.endContainer;
				   
				   var container = end.getAscendant('div',true);
				   while (container && !this.isReadContainer(container))
				   {
					   container = container.getAscendant('div');
				   }	
				   
				   if (container)
				   {	   
					   ranges[0].setEndAfter(container);
					   changed = true;
				   }		   
			   } 
		   }
	   }
		 
	   if (changed)
	   {
		   try
		   {
			   sel.selectRanges( ranges );
		   } 
		   catch(e) 
		   {
		   }
	   }
   };
   
   this.getAnchorContainer = function ( node, selection)
	{
		var container = null;
		/*
		if (selection)
		{
			var ancestor = selection.getCommonAncestor();
			// avoid range contain other elements beside shape. we should make sure user
			// only select shape or part of shape.
			// if user only select shape or part of shape, the largest range's commonancestor is the top div, in this case,
			// querySelector('div[_type=topDiv]') should return null, so if it return something, then the range is too large.
			if (ancestor.is && ancestor.$.querySelector('div[_type=topDiv]'))
				return shape;
			var range = selection.getRanges()[0];
			shape = this.getAnchorContainer(range.getEnclosedNode());
		}
		*/
		
		if (node && node.$)
		{		
			var parents = node.getParents(true);
			for (var i = 0; i < parents.length; i++)
			{
				var parent = parents[i];
				if (this.isAnchorContainer(parent))
				{
					container = parent;
					break;
				}
			}
		}
		return container;
	};
	this.hasAnchorContainer = function (element)
	{
		if (element)
		{
			var parent = element.getAscendant('div', true);
			if (this.isAnchorElement(parent))
				return true;
		}
		return false;
	}
	// remove the seconddiv
	this.removeAnchorContainer = function (element)
	{
		var acts = [];
		if (this.isAnchorContainer(element))
		{
			var children = [];
			var parent = element.getParent(); // this should be top div(shape container)
			var keep = true;
			if (this.isAnchorParent(parent))
			{
				keep = false;
				var next = parent.getFirst();
				
				while (next)
				{
					var node = next;
					next = next.getNext();
					if (!node.equals(element))
					{
						if (!this.isAnchorContainer(node) && !this.isAnchorParent(node))
						{
							children.push(node);
						} else {
							keep = true;
							break;
						}
					}	
				}
			}
			if (!keep)
			{	
				acts.push(SYNCMSG.createDeleteBlockElementAct(parent));
				for (var i = 0; i < children.length; i++)
				{
					var node = children[i];
					node.insertBefore(parent);	
					acts.push(SYNCMSG.createInsertBlockElementAct(node));
				}
				parent.remove();
			} else {
				acts.push(SYNCMSG.createDeleteBlockElementAct(element));
				element.remove();
			}
		}
		return acts;
	};
   // this function return whether the given element's original document is same as pasted one.  
   this.isSameDocument = function(document,element)
   {
	   var prefix = document.getBody().getId();
	   var id = element.getId();
	   if (id && id.indexOf(prefix) == 0) {
		   if (element.hasAttribute("_shapeid") ) {
			   if (element.getAttribute("_shapeid").indexOf(prefix) == 0) {
				   return true;
			   } else {
				   return false;
			   }
		   } else {
			   return true;
		   }
	   }
		   
	   return false;
   };
   
   this.isAnchorElement = function(element)
   {
	   return element && (element.hasAttribute('_type') || element.hasAttribute('_srcanchortype'));
   };
   
   this.isAnchorContainer = function(element)
   {
	   if(element && element.is && element.is('div') && element.getAttribute('_type') == 'secondDiv')
		   return true;
	   return false;
   };

   // check the element whether it's topdiv
   this.isAnchorParent = function(element)
   { 
	   if(element && element.is && element.is('div') && element.getAttribute('_type') == 'topDiv')
		   return true;
	   return false;   
   };
   
   this.isCommentIcon = function(imgNode)
   {
	   if(!this.isImage(imgNode))
		   return false;
	   if(imgNode.hasClass('commenttag'))
		   return true;
	   return false;
   };
  
   this.isTableInTextBox = function( node )
	{
		if(!node)
			return false;
		
		var tbl = node.getAscendant('table',true);
		var div = tbl && tbl.getAscendant('div',true);
		if( div && div.hasClass('textbox') )
			return true;
		return false;
	};
/**
 * Return the footer height;
 * 
 * 
 */
   this.getFooterHeight = function()
   {
	   var offsetFooter = 0, footerCon;
		if( CKEDITOR.env.ie && CKEDITOR.env.version == 9 )
		{
			footerCon = document.getElementById('footerDivCon');
			if( footerCon ) footerCon = new CKEDITOR.dom.element( footerCon, document );	
		}
		else
		{
			var footerFrame = frames["ifRTC1"];
			if (footerFrame && footerFrame.document && footerFrame.document.getElementById)
			{
				footerCon = footerFrame.document.getElementById('RTC1');
				if( footerCon )footerCon = new CKEDITOR.dom.element( footerCon, footerFrame.document );
			}
		}
								
		if(footerCon && footerCon.isVisible())
		{
			offsetFooter = footerCon.$.offsetHeight;
		}
			
		return offsetFooter;
   };
   
	/** scroll the element into view's top, and make sure it's after header if the document has a header
	 * @param element, the element to view
	 */
	this.scrollIntoViewUnderHeader = function(element)
	{
		if (!element || element.type != CKEDITOR.NODE_ELEMENT)
		{
			return;
		}
		
		var offsetHeader = 0, headerCon;
		if( CKEDITOR.env.ie && CKEDITOR.env.version == 9 )
		{
			headerCon = document.getElementById('headerDivCon');
			if( headerCon ) headerCon = new CKEDITOR.dom.element( headerCon, document );
		}
		else
		{
			var headerFrame = frames["ifRTC"];
			if (headerFrame && headerFrame.document && headerFrame.document.getElementById)
			{
				headerCon = headerFrame.document.getElementById('RTC');
				if( headerCon )headerCon = new CKEDITOR.dom.element( headerCon, headerFrame.document );
			}
		}
		
		if (headerCon && headerCon.isVisible() )			
			offsetHeader = headerCon.$.offsetHeight;

		element.scrollIntoView(true,offsetHeader);
		return offsetHeader;
	};
	/** change all children images' attribute _cke_saved_src from absolute path to relative path under element
	 * @param element, the element to check,element node is a native dom element, not ck element
	 */
	this.resetImageSrcAttribute = function(element)
	{
		if(!element)
			return;
		var images = element.querySelectorAll("img");
		var image;
		for(var i=0;i<images.length;i++)
		{
			image = images[i];
			if(this.isConcordStaticImage(image))
				continue;
			image.setAttribute('_cke_saved_src',image.getAttribute('src'));
		}
	};

	/** whether this image is a static image in concord server
	 * @param image, the image to check,image node is a native dom element, not ck element
	 */
	this.isConcordStaticImage = function(image)
	{
		if(!image || image.nodeName.toLowerCase() != 'img')
			return false;
		
		if(this.isCommentIcon(image) || image.src.indexOf(contextPath + staticRootPath + "/images/") > -1)
		{
			return true;
		}
		return false;
	};
	/** whether this image is a local image from operation system or other client applications
	 * @param image, the image to check,image node is a native dom element, not ck element
	 */	
	this.isLocalFileImage = function(image)
	{
		if(!image || image.nodeName.toLowerCase() != 'img')
			return false;
		var src = image.src;
		if(src && this.startWith(src,['file:///','data:image','webkit-fake-url']))
		{
			return true;
		}
		return false;
	};
	
	/**
	 * Get the body's left size, used by tab plugin, the unit is px
	 */
	this.getBodyLeft = function(body){			
		//the unit is px for paddingLeft
		var temp = body.getComputedStyle('padding-left');
		var bodyleft = temp? CKEDITOR.tools.toCmValue(temp) : 0;
		
		//refer to headerfooter.js
		temp = body.$.getBoundingClientRect().left;
		if (temp){
			bodyleft = bodyleft + CKEDITOR.tools.toCmValue(temp+'px');
		}
		return bodyleft;
	};
	this.fixRichComboMultiSelect=function(node,selectors){
		var removeHoverStyle = function(node){
			dojo.style( node, {
				'backgroundColor' : '#FFFFFF',
				'borderColor': '#FFFFFF'
			
			});
		};
		var addHoverStyle =function(node){
			dojo.style( node, {
				'backgroundColor' : '',
				'borderColor': ''
			});
		};
		var addSelectedStyle = function(node){
			if(!dojo.hasClass(node,'cke_selected')){
				addHoverStyle(node.firstChild);
			}
		};
		var removeSelectedStyle = function(node){
			if(!dojo.hasClass(node,'cke_selected')){
				removeHoverStyle(node.firstChild);
			}
		};
  		if (!CKEDITOR.env.gecko || (CKEDITOR.env.gecko && CKEDITOR.env.version < 40000)) {
  			return;
  		}
  		for (var i =0;i<selectors.length;i++){
  			var classType = selectors[i];
	  		dojo.query(classType, node).forEach(function(node, index, array) {
	  			if(!dojo.hasClass(node,'cke_selected')){
	  				removeHoverStyle(node.firstChild);
				}else{
					addHoverStyle(node.firstChild);
				}
	  			
				dojo.connect(node, 'onmouseover', function() {
					addSelectedStyle(node);
				});
				
				dojo.connect(node, 'onmouseout', function() {
					removeSelectedStyle(node);	
				});
				dojo.connect(node.firstChild,'onfocus',function(){
					if(pe.panelClick ==true){
						addSelectedStyle(node);
						pe.panelClick=false;
					}
				});
				dojo.connect(node.firstChild,'onblur',function(){
					removeSelectedStyle(node);	
				});
				dojo.connect(node, 'onclick', function() {
								
				});
			});
  		}
	};
	this.fixColorPanelMultiSelect = function(node,selectors,isCK,style,evaluator){
		if(style==null){
			return;
		}
		var rangeStyle=null;
		var sel = pe.lotusEditor.getSelection();
		if(sel == null){
//			console.info('selection is null');
			var previousElementPath = pe.lotusEditor._.selectionPreviousPath;
			if(evaluator==null  || evaluator == concord.text.tools.textEvaluator){
				// defect 7900 for the select text node, the previousElementPath will not contain the text node, 
				rangeStyle = concord.text.tools.getStyleValueFromElementPath(previousElementPath,style);
			}else{
				// the table evaluator is need to check the target style is the on the table element to distinguish the table cell background color and the text background color
				rangeStyle = concord.text.tools.getStyleValueFromElementPath(previousElementPath,style,evaluator);
			}
			rangeStyle = concord.text.tools.colorHex(rangeStyle);
		}else{
			var ranges = sel.getRanges();
			if(ranges==null){
//				console.info('range is  null');
			}
			rangeStyle = concord.text.tools.getStyleValue(ranges, style,evaluator);
			rangeStyle = concord.text.tools.colorHex(rangeStyle);
		}
		var isSelected = function(node){
			if(style == null){
				return false;
			}
			var color =concord.text.tools.colorHex( node.firstChild.style.backgroundColor);
			if(rangeStyle == color){
				return true;
			}
			return false;
		};
		var addStyle = function(node){
			dojo.style( node, {
				'border' : '#316ac5 1px solid',
				'backgroundColor': '#dff1ff'
			});
		};
		var removeStyle = function(node){
			dojo.style( node, {
				'border' : '#fff 1px solid',
				'backgroundColor': '#FFFFFF'
			});
		};
		var addSelectedStyle = function(node){
			addStyle(node);
		};
		var removeSelectedStyle = function(node){
			if(!dojo.hasClass(node,"cke_selected")){
				removeStyle(node);
			}else{
				addStyle(node);
			}
		};	
//		if (!CKEDITOR.env.gecko || (CKEDITOR.env.gecko && CKEDITOR.env.version < 40000)) {
//  			return;
//  		}

		for (var i =0;i<selectors.length;i++){
  			var classType = selectors[i];
	  		dojo.query(classType, node).forEach(function(node, index, array) {
	  			removeStyle(node);
				dojo.removeClass(node,'cke_selected');
				if(isCK==true){
					node.blur();
				}else{
					removeSelectedStyle(node);
				}
				if(isSelected(node)){
					dojo.addClass(node,"cke_selected");	
					addSelectedStyle(node);
				}
				dojo.connect(node, 'onmouseover', function() {				
					addSelectedStyle(node);
				});
				
				dojo.connect(node, 'onmouseout', function() {
					removeSelectedStyle(node);
				});
				dojo.connect(node,'onfocus',function(){
					addSelectedStyle(node);
				});
				dojo.connect(node,'onblur',function(){
					removeSelectedStyle(node);
				});
				dojo.connect(node, 'onclick', function() {
					//dojo.addClass(node,"cke_selected");	
				});
			});
		}
		
		return rangeStyle;
	};
	this.colorHex = function(color){
		var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
		if(/^(rgb|RGB)/.test(color)){
			var aColor = color.replace(/(?:\(|\)|rgb|RGB)*/g,"").split(",");
			var strHex = "#";
			for(var i=0; i<aColor.length; i++){
				var hex = Number(aColor[i]).toString(16);
				if(hex === "0"){
					hex += hex;	
				}
				strHex += hex;
			}
			if(strHex.length !== 7){
				strHex = color;	
			}
			return strHex;
		}else if(reg.test(color)){
			var aNum = color.replace(/#/,"").split("");
			if(aNum.length === 6){
				return color;	
			}else if(aNum.length === 3){
				var numHex = "#";
				for(var i=0; i<aNum.length; i+=1){
					numHex += (aNum[i]+aNum[i]);
				}
				return numHex;
			}
		}else{
			return color;	
		}
	};
	this.getStyleValueFromElementPath = function(elementPath,style,evaluator){
		if(elementPath == null || elementPath.elements == null){
			return null;
		}
		var elements = elementPath.elements;
		for (var i =0;i< elements.length;i++){
			var element = elements[i];
			if(evaluator &&	evaluator.call({},element)==false){
				continue;
			}
			var styleValue = element.getComputedStyle(style);//element.getStyle(style);
			if(styleValue==null || styleValue.length ==0){
				
			}else{
				return styleValue;
			}
		}
		return null;
	};
	
	//read only, if the range has more than 400 elements, change status according to the first 400 elements
	if(dojo.isIE == 8)
	{
		//this.max_state_elements = 400;
		this.max_state_elements = 600;
	}
	else
	{
		this.max_state_elements = 3000;
	}
	this.max_state_blocks = 100;
	
	
	this.textEvaluator = function(node){
		return ( node.type == CKEDITOR.NODE_TEXT && ( !node.isReadOnly() || MSGUTIL.isFieldElement(node.getParent()))
	    		&& node.getLength() > 0 );
	};
	this.tableEvaluator = function(node){
		if(node.is &&(node.is("td","th","tr","tbody","table"))){
			return true;
		}
		return false;
	};
	this.getStyleValue = function(ranges,style,evaluator){
		
		var countElements = 0;
		
		//get the first 400 elements only
		var countGuard = function( node )
		{
			countElements++;
			if (countElements > concord.text.tools.max_state_elements){
				return false;
			}
		};
		
		
		if(style==null){
			return null;
		}
		if(evaluator==null){
			evaluator = concord.text.tools.textEvaluator;
		}
		var ret = -1;
		for( var i=0; i<ranges.length; i++ )
		{
			var currentPath ;
			if(ranges[i].collapsed)
			{	
				var startE = ranges[i].startContainer;
				if (startE.type == CKEDITOR.NODE_ELEMENT){
					if(startE.getChildCount() > ranges[i].startOffset )
						startE = startE.getChild(ranges[i].startOffset);
					else if(startE.getChildCount() > 0)
						startE = startE.getChild(startE.getChildCount() - 1);
				}
				var stylevalue =null;
				currentPath = new CKEDITOR.dom.elementPath( startE );
				if(evaluator==null  || evaluator == concord.text.tools.textEvaluator){
					stylevalue = concord.text.tools.getStyleValueFromElementPath(currentPath,style);
				}else {
					stylevalue = concord.text.tools.getStyleValueFromElementPath(currentPath,style,evaluator);
				}
				if(ret == -1 ){
					ret = stylevalue;
				}else{
					if(ret != stylevalue){
						return null;
					}
				}
			}
			else
			{
				var walker = new CKEDITOR.dom.walker( ranges[i].clone());
				walker.evaluator = concord.text.tools.textEvaluator;
				walker.guard = countGuard;
				var node = null;
				while(node = walker.next())
				{
					currentPath = new CKEDITOR.dom.elementPath( node );
					if( evaluator == null || evaluator==concord.text.tools.textEvaluator){
						var stylevalue =  concord.text.tools.getStyleValueFromElementPath(currentPath,style);
					}else {
						var stylevalue =  concord.text.tools.getStyleValueFromElementPath(currentPath,style,evaluator);
					}
					if(ret == -1 ){
						ret = stylevalue;
					}else{
						if(ret != stylevalue){
							return null;
						}
					}
				}
				if (countElements > concord.text.tools.max_state_elements){
					return null;
				}
				
			}
		}
		return ret==-1?null:ret;
	};
	
	
	

	/**
	 * function to get the style for a selection
	 * check from start to end, return a value only if the whole range has the same style
	 * @param selection the selection to check
	 * @param style the style to check
	 * @param getStyleFn  optional param, the function to get style value, 
	 * @returns null if muliple style; otherwise, the result of style.checkActive or getStyleFn
	 * 
	 */
	this.getSelectedInlineStyle = function(selection, style, getStyleFn){
		var ranges = selection.getRanges();
		
		
		if (!getStyleFn){
			getStyleFn = style.checkActive;
		}
		
		var resultstyle = null;
		var firstvalue = true;
		
		for ( var i=0; i<ranges.length; i++ ){
			var range = ranges[i];
			if(range.collapsed)
			{
				var startE = range.startContainer;
				if (startE.type == CKEDITOR.NODE_ELEMENT){
					if(startE.getChildCount() > range.startOffset )
						startE = startE.getChild(range.startOffset);
					else if(startE.getChildCount() > 0)
						startE = startE.getChild(startE.getChildCount() - 1);
				}
				var currentstyle= getStyleFn.call(style, new CKEDITOR.dom.elementPath( startE ));
				if (firstvalue){
					resultstyle = currentstyle;
					firstvalue = false;
				}else if ( resultstyle != currentstyle){
					//style in range not the same
					return null;
				}
			}
			else
			{
				var countElements = 0;
				
				//get the first 400 elements only
				var countGuard = function( node )
				{
					countElements++;
					if (countElements > concord.text.tools.max_state_elements){
						return false;
					}
				};
				var walker = new CKEDITOR.dom.walker( range.clone() , concord.text.tools.max_state_elements);
				walker.evaluator = concord.text.tools.textEvaluator;
				walker.guard = countGuard;
				var node = null;

				while(node = walker.next())
				{
						var currentstyle = getStyleFn.call(style,  new CKEDITOR.dom.elementPath( node ));
						
						if (firstvalue){
							resultstyle = currentstyle;
							firstvalue = false;
						}else if ( resultstyle != currentstyle){
							//style in range not the same
							return null;
						}
						
				}
				
				if (countElements > concord.text.tools.max_state_elements){
					return null;
				}
			}
				
		}
		
		return resultstyle;
	};

	/**
	 * function to get the styles for a selection
	 * check from start to end, return an array matching the styles. value only if the whole range has the same style
	 * @param selection the selection to check
	 * @param getStyleFns the array of styles functions
	 * @returns null
	 * var style1 = styleBold; //instance of CKEDITOR.style;
	 * var style2 = styleItalica; //instance of CKEDITOR.style;
	 * var getStyleFn1 = {style: style1, stylefn: style1.checkActive, result: null};
	 * var getStyleFn2 = {style: style2, stylefn: style2.checkActive, result: null};
	 * var getStyleFns = [getStyleFn1, getStyleFn1]
	 * tools.getSelectedInlineStyles(selection, getStyleFns);
	 */
	this.getSelectedInlineStyles = function(selection, getStyleFns){
		if (!selection || !getStyleFns || getStyleFns.length <=0 ){
			return;
		}
		
		var ranges = selection.getRanges();
		
		//true if first value is got; false for the first time
		var valued = [];
		//true if the real value is got; false otherwise
		var resulted = [];
		var styleLength = getStyleFns.length;
		var isReadOnly = false;
		
		function checkReadOnly( elementPath, fns )
		{
			if( !fns[0].disabled )
				return false;
				
			var elements = elementPath.elements;
			for( var i = elements.length-1, element; i >=0; i-- )
			{
				element = elements[i];
				if( element.type == CKEDITOR.NODE_ELEMENT && element.getAttribute('contenteditable') == 'false')
					return true;
			}
			for (var j=0;j<fns.length;j++)
			{
				fns[j].disabled = false;
			}	
			return false;
		}
		
		for (var j=0;j<styleLength;j++)
			getStyleFns[j].disabled = true;
			
		for ( var i=0; i<ranges.length && !isReadOnly; i++ ){
			var range = ranges[i];
			if(range.collapsed)
			{
				var startE = range.startContainer;
				if (startE.type == CKEDITOR.NODE_ELEMENT){
					if(startE.getChildCount() > range.startOffset )
						startE = startE.getChild(range.startOffset);
					else if(startE.getChildCount() > 0)
						startE = startE.getChild(startE.getChildCount() - 1);
				}
				var finishd = true, path = new CKEDITOR.dom.elementPath( startE );
				checkReadOnly( path, getStyleFns );
				
				for (var j=0;j<styleLength;j++){
					if (resulted[j]) continue;
					finished = false;
					var currentstyle= getStyleFns[j].stylefn.call(getStyleFns[j].style, path);
					if (!valued[j]){
						getStyleFns[j].result = currentstyle;
						valued[j] = true;
					}else if ( getStyleFns[j].result != currentstyle){
						//style in range not the same
						getStyleFns[j].result = null;
						resulted[j] = true;
					}
				}
				if (finished){
					return;
				}
				
			}
			else
			{
				var countElements = 0;
				
				//get the first 400 elements only
				var countGuard = function( node )
				{
					countElements++;
					if (countElements > concord.text.tools.max_state_elements){
						return false;
					}
				};
				var walker = new CKEDITOR.dom.walker( range.clone() , concord.text.tools.max_state_elements);
				walker.evaluator = concord.text.tools.textEvaluator;
				walker.guard = countGuard;
				var node = null;

				while(node = walker.next())
				{
						var finished = true,
						 	path = new CKEDITOR.dom.elementPath( node );
					 	checkReadOnly( path, getStyleFns );
						for (var j=0;j<styleLength;j++){
							if (resulted[j]) continue;
							finished = false;
							var currentstyle= getStyleFns[j].stylefn.call(getStyleFns[j].style, path);
							if (!valued[j]){
								getStyleFns[j].result = currentstyle;
								valued[j] = true;
							}else if ( getStyleFns[j].result != currentstyle){
								//style in range not the same
								getStyleFns[j].result = null;
								resulted[j] = true;
							}
						}
						if (finished){
							return;
						}
						
				}
				
				if (countElements > concord.text.tools.max_state_elements){
					//return null for all styles
					for (var j=0;j<styleLength;j++){
						getStyleFns[j].result = null;
					}
					return;
				}
			}
				
		}
	};
	
	

	/**
	 * used by heading and align
	 * @param selection
	 * @param getStyleFn
	 * @returns null if muliple style,CKEDITOR.TRISTATE_DISABLED if disabled, or the result of getStyleFn
	 */
	this.getSelectedBlockStyle = function(selection, getStyleFn){
		//null or left,right, center, justify
		
		var ranges = selection.getRanges();
		
		if( concord.text.tools.isSelectedReadOnly(selection) ){
			return  CKEDITOR.TRISTATE_DISABLED;
		}
		var resultstyle = null;
		var firstvalue = true;
		
		for ( var i=0; i<ranges.length; i++ ){
			var range = ranges[i];
			if (range.collapsed){
				var startE = range.startContainer;
				if (startE.type == CKEDITOR.NODE_ELEMENT){
					if(startE.getChildCount() > range.startOffset )
						startE = startE.getChild(range.startOffset);
					else if(startE.getChildCount() > 0)
						startE = startE.getChild(startE.getChildCount() - 1);
				}
				var currentPath = new CKEDITOR.dom.elementPath( startE );
				var  tempresult=getStyleFn(currentPath);
				if (firstvalue){
					resultstyle = tempresult;
					firstvalue = false;
				}else if ( tempresult != resultstyle){
					//style in range not the same
					return null;
				}
			}else{
				
				var tempresult;
				var rangeClone = range.clone();
				rangeClone.enlarge(CKEDITOR.ENLARGE_ELEMENT);
				var iterator = rangeClone.createIterator();
				var block;
				var elementCount =0;
				while ( ( block = iterator.getNextParagraph() ) )
				{
					elementCount++;
					if (elementCount > concord.text.tools.max_state_blocks){
						return null;
					}
					var currentPath = new CKEDITOR.dom.elementPath( block );
					tempresult = getStyleFn( currentPath );

					if (firstvalue){
						resultstyle = tempresult;
						firstvalue = false;
					}else if ( tempresult != resultstyle){
						//style in range not the same
						iterator.reset();
						return null;
						
					}
				}
			}
		}
		
		
		return resultstyle;
		
	};
	
	this.isImageUnderTextBox = function (imgNode)
	{
		if(!imgNode || !imgNode.is || !imgNode.is('img'))
			return;
		var parent = imgNode.getParent();
		while(parent.is('div'))
		{
			if(parent.hasClass('textbox'))
				return parent;
			parent = parent.getParent();
		}
		return null;
	};
	
	this.showTextBoxBorder = function (imgNode)
	{
		var textBoxDiv;
		if(!(textBoxDiv = this.isImageUnderTextBox(imgNode)))
			return;
		if(textBoxDiv.getStyle('overflow') == 'hidden')
		{
			textBoxDiv.setAttribute('_border_old',textBoxDiv.getStyle('border'));
			textBoxDiv.setStyle('border','#777777 1px solid');
		}
			
	};
	
	this.hideTextBoxBorder = function (imgNode)
	{
		var textBoxDiv;
		if(!(textBoxDiv = this.isImageUnderTextBox(imgNode)))
			return;
		if(textBoxDiv.getStyle('overflow') == 'hidden' && textBoxDiv.hasAttribute('_border_old'))
		{
			textBoxDiv.setStyle('border',textBoxDiv.getAttribute('_border_old'));
			textBoxDiv.removeAttribute('_border_old');
		}
			
	};
	
	this.removeUnsupportedImage = function(imgNode,topParent){
		if(!this.isImage(imgNode))
			return;
		var parent = imgNode.getParent();
		imgNode.remove();
		while(parent && !parent.equals(topParent))
		{
			var temp = parent.getParent();
			if(parent.is('div') && (parent.getChildCount() == 0 || (parent.getChildCount() == 1 && MSGUTIL.isBr(parent.getFirst()))))
				parent.remove();
			else
				break;
			parent = temp;
		}
	};
	this.setCommandState = function (commandList)
	{
		if(!commandList || commandList.length == 0)
			return;
		for(var i=0;i<commandList.length;i++)
		{
//			console.log(commandList[i].name);
			pe.lotusEditor.getCommand(commandList[i].name).setState(commandList[i].disableCondition?CKEDITOR.TRISTATE_DISABLED:CKEDITOR.TRISTATE_OFF);
		}	
	};
	
	this.imageSelected = function( editor, selection )
	{
		var element = null;
		if (!selection){
		    	  //to avoid defect, in case selection is editor.
		    	  selection = editor.getSelection();
		}
		
		if (CKEDITOR.env.ie)
		{
			if (editor._.selectionPreviousPath ){
				element = editor._.selectionPreviousPath.lastElement;
			}
			else
			{
				if (selection && selection.getType() == CKEDITOR.SELECTION_ELEMENT)
				{
					var sel = selection.getNative();
					var e = sel && sel.createRange().item(0);
					element = new CKEDITOR.dom.node( e );
				}
			}			
		}
		else
		{
			if( selection )
			{
				element = selection.getSelectedElement();
			}			
		}
		if(element!= null && element.getName().toLowerCase() == 'img'){
			return true;
		}	
		return false;
	};
	
	/**
	 * 
	 * @param keyCode the key code from keyboard, varis on different platform
	 * @param noSpecial boolean. If true, regard backspace and delete as not-visible key
	 * @returns
	 */
	this.isVisibleKey = function(keyCode, noSpecial)
	{
		var specialKey = { /*Backspace*/ 8:1,  /*Delete*/ 46:1, /* Tune in Vietnamese IME mode */231:1};
		// Character and number Key
		if(keyCode >= 48 && keyCode <= 90 )
			return true;
		
		if(keyCode >= 96 && keyCode <= 111)
			return true;
		
		if(keyCode >= 186 && keyCode <= 192)
			return true;
		
		if(keyCode >= 219 && keyCode <= 222)
			return true;
		
		if (keyCode == 32)
			return true;
		
		if (keyCode == 229)
			return true;
		
		if(!noSpecial && keyCode in specialKey)
			return true;
		
		// Some keycode were changed after FF15
		// https://developer.mozilla.org/en-US/docs/DOM/KeyboardEvent#Virtual_key_codes
		if(dojo.isFF && dojo.isFF >= 15)
		{
			if(keyCode >= 160 && keyCode <= 176)
				return true;
		}	

		return false;
	
	};
	
	/**************************************************************************************************
	 * These functions are used in hack arrow keys in onKey event.
	 */
	this.createEmptyParagraph = function ( next, refNode )
	{
		var para = CKEDITOR.document.createElement('p');
		para.appendBogus();
		MSGUTIL.generateID(para);
		( next)? para.insertAfter( refNode ): para.insertBefore( refNode );
		var act = SYNCMSG.createInsertBlockElementAct(para);
		var msg = SYNCMSG.createMessage(MSGUTIL.msgType.Element, [act]);
		SYNCMSG.sendMessage([msg]);
		return para;
	};
	 
	 this.moveCursorToNode = function( editor, range, node, toEnd )
	 {
	 	if( !toEnd )
			range.moveToElementEditStart(node);	
		else
			range.moveToElementEditEnd(node);	
		concord.text.tools.fixRange(editor,range);
		range.select();
		if (!CKEDITOR.env.ie)		
			editor.selectionChange();
	 };
	 
	 this.isBlockNeedInsertParagraph = function ( node )
	 {
	 	return MSGUTIL.isTable(node)
				|| ( TASK && TASK.tools.node.isTaskContainer( node ) )
				|| ( node.is && node.is('hr') )
				|| ( CKEDITOR.tools.isToc && CKEDITOR.tools.isToc( node ) );
	 };
	 this.treatAsChar = function (node)
	 {
		 var result = false;
		 if ( node && node.type == CKEDITOR.NODE_ELEMENT)
		 {
			if ( node.is('img') || node.is('br') || MSGUTIL.isFieldElement(node))
				result = true;
		 }
		 return result;
	 };
	 this.skipBlock = function (node)
	 {
		 var result = false;
		 if (node && node.type == CKEDITOR.NODE_ELEMENT)
		 {
			 var parent = node.getParent();
			 if (this.isAnchorContainer(parent))
				 result = true;
		 }
		 return result;
	 };
	 this.destroyNode = function(node)
	 {
		if(node && node.$)
		{	
			node.clearCustomData && node.clearCustomData();
			dojo.destroy(node.$);
			node.$ = null;
		}
	 };
	 this.isLeftClick = function(event)
	 {
		 var isLeftClick = false;
		 if(!event)
			 return isLeftClick;
		 if(CKEDITOR.env.ie && CKEDITOR.env.version < 9)// ie 6-8 will set left click button value to 1, which in IE9 is 0,though
			isLeftClick = (event.data.$.button == 1);
		 else
			isLeftClick = (event.data.$.button == 0);
		 return isLeftClick;
			 
	 };
	 this.isTargetChanged = function(oldRange,newRange)
	 {
		 if(!oldRange || !newRange)
			 return true;
		 if(!oldRange.startContainer.$.parentNode || !newRange.startContainer.$.parentNode)
			 return true;
		
		 var oldBlock = MSGUTIL.getBlock(oldRange.startContainer);
		 var newBlock = MSGUTIL.getBlock(newRange.startContainer);
		 if(!oldBlock.equals(newBlock))
			 return true;
		 return false;
	 };
	 this.checkCmdState = function( editor, disableCondition, cmd, selection )
	 {
	 	if( !disableCondition )
   		{
   			var data = {'cmd':cmd, 'state': true ,'selection': selection};
			editor.fire('queryCmdStatus', data );
			disableCondition = !data.state;
   		}
   		editor.getCommand(cmd).setState(disableCondition?CKEDITOR.TRISTATE_DISABLED:CKEDITOR.TRISTATE_OFF);
	 };
	 
	 this.printExceptionStack = function(ex, outsideCheckerFunc)
	 {
		 //print exception for local dev environment only
		 if(!LOG || LOG.level!= 'console')
			 return;
		 
		 LOG.forceReport = true;
		 try{
			 var  indexInLiteral = function (str, index) {
			        var inStrLiteral = 0;
			        var inObjLiteral = 0;
			        var inArrayLiteral = 0;

			        for (var i = 0; i < str.length; i++) {
			          if (inStrLiteral) {
			            if (str.charAt(i) == "'" || str.charAt(i) == '"') {
			              inObjLiteral--;
			            }
			          } else {
			            if (str.charAt(i) == "'" || str.charAt(i) == '"') {
			              inObjLiteral++;
			            }
			          }
			          if (!inStrLiteral) {
			            if (inObjLiteral) {
			              if (i == index) {
			                return (true);
			              }
			              if (str.charAt(i) == "}") {
			                inObjLiteral--;
			              }
			            } else {
			              if (str.charAt(i) == "{") {
			                inObjLiteral++;
			              }
			            }
			            if (inArrayLiteral) {
			              if (i == index) {
			                return (true);
			              }
			              if (str.charAt(i) == "]") {
			                inArrayLiteral--;
			              }
			            } else {
			              if (str.charAt(i) == "[") {
			                inArrayLiteral++;
			              }
			            }
			          }
			        }

			        return (false);
			      };


			 var getLocals = function(args) {
			        var ret = [];
			        var reArg = /\(?\s*(\w+)\s*(,|\))/g;
			        var reEndArg = /\{/;
			        var reHasVar = /(\W|^)var\W/;
			        var reGetVar = /(var|,)\s*(\w+)/g;
			        var lookForArgs = true;
			        var reResult;
			        var a;
			        var regLine = /[;}\n]/ ;

			        if (typeof args == 'function' ) {
			          a = args.toString().split(regLine);
			        } else {
			          a = (args) ? args.callee.toString().split(regLine) : [];
			        }
			        ret.push(a[0]); // save the function name for later use
			        
			        for (var i = 0; i < a.length; i++) {
			          if (lookForArgs) {
			            reArg.lastIndex = 0;
			            while ((reResult = reArg.exec(a[i])) != null) {
			              ret.push(reResult[1]);
			            }
			            reEndArg.lastIndex = 0;
			            if (reEndArg.test(a[i])) {
			              lookForArgs = false;
			            }
			          }
			          if (!lookForArgs) {
			            reHasVar.lastIndex = 0;
			            if (reHasVar.test(a[i])) {
			              reGetVar.lastIndex = 0;
			              while ((reResult = reGetVar.exec(a[i])) != null) {
			                if (!indexInLiteral(a[i], reResult.index)) { 
			                  ret.push(reResult[2]);
			                }
			              }
			            }
			          }
			        }

			        return (ret);
			      };

			 
			var showLocals = function(func, args) {
			        var str = "Variables for ";
			        var arrayOfLocals = getLocals(args);
			        var v;

			        for (var i = 0; i < arrayOfLocals.length; i++) {
			          if (i == 0) {
			            str += arrayOfLocals[i] + "\n";
			          } else {
			            if (typeof func == 'function') {
			            	try{
			            		v = func(arrayOfLocals[i]);
					            v = concord.text.tools.printObject(v);
					              
					            str += "    " + arrayOfLocals[i] + " = " + v + "\n";
			            	}catch(e){
			            	}
			            } else {
			              str += "    " + arrayOfLocals[i] + "\n";
			            }
			          }
			        }
			        return str+"\n";
			      };
				 
			    var logMsg = ex+"\n";  
				var call= arguments.callee;
				if (call){
					call = call.caller;
				}
				if (call && outsideCheckerFunc){
					logMsg = logMsg + showLocals(outsideCheckerFunc, call) ;
				}

		  		if(call){
		  			var args = call.arguments;
		  			for( var i =0; i<args.length;i++){
		  				logMsg = logMsg + "argument "+ i +": " +concord.text.tools.printObject(args[i]) +"\n";
		  			}
		  			 
		  			logMsg = logMsg + call;
		   		}
		  		
		  		LOG.log(logMsg);
		 }catch(nex){
			 console.log("new exception when logging and printing exception:"+nex);
		 }
		 
	 };
	 
	 
	 this.printObject = function(/*Object*/ it){
		//	summary:
		//		Returns a [JSON](http://json.org) serialization of an object. If attribute is object, just print object
		//	description:
		//		Returns a [JSON](http://json.org) serialization of an object. 
		//	it:
		//		an object to be serialized. 

		if(it === undefined){
			return "undefined";
		}
		var objtype = typeof it;
		if(objtype == "number" || objtype == "boolean"){
			return it + "";
		}
		if(it === null){
			return "null";
		}
		if(dojo.isString(it)){
			return dojo._escapeString(it);
		}

		// array
		if(dojo.isArray(it)){
			return "Array[]";
		}

		if(objtype == "function"){
			return null; // null
		}
		// generic object code path
		var output = [], key;
		for(key in it){
			var keyStr, val;
			if(typeof key == "number"){
				keyStr = '"' + key + '"';
			}else if(typeof key == "string"){
				keyStr = dojo._escapeString(key);
			}else{
				// skip non-string or number keys
				continue;
			}
			if(it[key] == undefined || it[key]==null){
				val = "null";
			}else{
				var objtype = typeof it[key];
				if(objtype == "number" || objtype == "boolean"){
					val = it[key] + "";
				}else if(dojo.isString(it[key])){
					val = dojo._escapeString(it[key]);
				}else if (objtype == "function"){
					val = null;
				}else{
					val = objtype;
				}
			}
			if(typeof val != "string"){
				// skip non-serializable values
				continue;
			}
			// FIXME: use += on Moz!!
			//	 MOW NOTE: using += is a pain because you have to account for the dangling comma...
			output.push( keyStr + ": " + val);
		}
		return "{" + output.join(", ") + "}"; // String
	};
		
		
	this.isInSecondDiv = function(node){
		node = node && node.getAscendant('div',true);
		while(node){
			var textAttr = node.getAttribute&&node.getAttribute("_type");
			if(textAttr&&textAttr=="secondDiv"){
				return true;
			}else{
				node = node.getAscendant('div');
			}
		}
		return false;
	};
	
	this.inReadonlyDiv = function(node){
		var div = node && node.getAscendant('div',true);
		while(div){
			var editable = div.getAttribute('contentEditable');
			if (editable == "false"){
				return true;
			}else if (editable == "true"){
				return false;
			}
			div = div.getAscendant('div');
		}
		return false;
		
	};
	
	this.isIndicatorSpan = function(node){
		if(!node || !node.is || !node.is('span'))
			return false;
		
		if(node.getAttribute('type') == 'indicator' && node.getAttribute('class').indexOf('indicatortag') != -1)
			return true;
		
		return false;
	};
	
	this.isHeadingCmd = function(cmdName){
		if(cmdName == 'pcmd' || cmdName == 'h1cmd' || cmdName == 'h2cmd' || cmdName == 'h3cmd' || cmdName == 'h4cmd' || cmdName == 'h5cmd' || cmdName == 'h6cmd' || cmdName == 'heading')
			return true;
		return false;
	};
	
	this.ignoreRestoreCursor = false;
		this.extend = function( target )
		{
			var argsLength = arguments.length,
				overwrite, propertiesList;

			if ( typeof ( overwrite = arguments[ argsLength - 1 ] ) == 'boolean')
				argsLength--;
			else if ( typeof ( overwrite = arguments[ argsLength - 2 ] ) == 'boolean' )
			{
				propertiesList = arguments [ argsLength -1 ];
				argsLength-=2;
			}
			for ( var i = 1 ; i < argsLength ; i++ )
			{
				var source = arguments[ i ];
				for ( var propertyName in source )
				{
					// Only copy existed fields if in overwrite mode.
					if ( overwrite === true || target[ propertyName ] == undefined )
					{
						// Only copy  specified fields if list is provided.
						if ( !propertiesList || ( propertyName in propertiesList ) )
							target[ propertyName ] = source[ propertyName ];

					}
				}
			}

			return target;
		}
}();