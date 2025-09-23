dojo.provide("concord.text.ProcCursor");
dojo.require("concord.text.MsgUtil");

dojo.declare("concord.text.ProcCursor",null,{
	bookmarks: [],
	tar: null,
	editor: null,
	doc:null,
	defaultProc: true,
	constructor: function( editor,doc,msg ){
		this.editor = editor;	
		this.bookmarks = [];
		this.doc = doc;
	},
	storeDocumentPos : function( sel)
	{
		if( sel )
		{
			var e = sel.getStartElement();
			if(!e ){
				sel = this.editor.getSelection();
				e = sel.getStartElement();
			}
			if( e.type == CKEDITOR.NODE_TEXT || !e.isVisible() ) 
				e = e.getParent();
			this.y =  e.getDocumentPosition().y;
		}
	},
	restoreDocumentPos: function( sel )
	{
		if( sel )
		{
			var e = sel.getStartElement();
			if( e.type == CKEDITOR.NODE_TEXT || !e.isVisible() ) 
				e = e.getParent();
			var offset = e.getDocumentPosition().y - this.y ;
			if( offset > 0.01 )
				e.getWindow().$.scrollBy( 0, offset );
		}
	},
	_transBookMarkNode: function( node, para )
	{	
		if( para.contains( node ))
		{
			var start = MSGUTIL.transOffsetRelToAbs( node.getParent(),node.getIndex(),para );
			node.remove();
			return  start;
		}		
		return node ;
	},
	storeCursor : function()
	{
		var sel = this.editor.getSelection();
		if(sel)
		{
			this.bookmarks = sel.createBookmarks( true );
			this.storeDocumentPos( sel );
		}
	},
	restoreCursor: function()
	{
		var sel = this.editor.getSelection();
		if( sel )
		{
			var ranges = [];
			var doc = this.editor.document;
			for ( var i = 0 ; i < this.bookmarks.length ; i++ )
			{
				var range = new CKEDITOR.dom.range( doc );
				var bookmark = this.bookmarks[i];
				var startNode	= doc.getById( bookmark.startNode );
				var endNode		= doc.getById( bookmark.endNode );
				if( startNode )
				{
					range.setStartBefore( startNode );
					startNode.remove();
				}
				else 
					continue;
				if ( endNode )
				{
					range.setEndBefore( endNode );
					endNode.remove();
				}
				else
					range.collapse( true );
				ranges.push( range );
				concord.text.tools.destroyNode(startNode);
				concord.text.tools.destroyNode(endNode);
			}
			if( ranges.length)
			{
				sel.selectRanges( ranges );
				this.restoreDocumentPos(sel);
			}
		}
	}
});

dojo.declare("concord.text.DeleteCursor",concord.text.ProcCursor,{
	translateBookMark: function( bmkId)
	{
		if(bmkId == null) return null;
		var obj = {};
		var doc = this.editor.document;
		var node = doc.getById( bmkId );;
		if( node == null ) return null;
		
		var block = MSGUTIL.getBlock(node);
		var paths = [];
		var  offset = MSGUTIL.transOffsetRelToAbs( node.getParent(),node.getIndex(), block );
		paths.push({"tid":block.getId(),"idx":offset});
		while( block.getName() != 'body')
		{
			paths.push( {"tid":block.getParent().getId(),"idx":block.getIndex()});
			block = block.getParent();
		}
		return { "id":bmkId,"paths":paths };
	},
	translateBookMarkToNode: function( bmkObj )
	{
		if( bmkObj == null ) return null;
		var doc = this.editor.document;
		var bmkId = bmkObj.id;
		var node = doc.getById( bmkId);
		return node;	
	},
	translateBookMarkToOffset: function( bmkObj )
	{
		if( bmkObj == null ) return null;
		var doc = this.editor.document;
		
		var node,paths = bmkObj.paths;
		var path = paths[0];
		var block = path && doc.getById(path.tid);
		if( block != null )
		 //the parent block moved to another place
			return MSGUTIL.getInsertPos(block,path.idx); 
		else
			return null; 
	},
	translateBookMarkToPrevNode: function( bmkObj )
	{
		if( bmkObj == null ) return null;
		var doc = this.editor.document;
		
		var node,paths = bmkObj.paths;
		for(var i = 1; !node && i<paths.length; i++ )
		{
			var path = paths[i];
			var block = doc.getById(path.tid);
			if(block != null )
			{
				var idx = path.idx;
				idx = ( idx == 0 ) ? 0: (idx-1);
				return block.getChild( idx );
			}
		}
		return null;
	},
	
	storeCursor : function( msg )
	{
		//this.editor.focus();
		var sel = this.editor.getSelection();
		var acts =msg.as || msg.updates;		
		var bookmarks = sel.createBookmarks( true );
		this.bookmarks = [];
		for( var i =0; i< bookmarks.length; i++ )
		{//convert bookmark to an object
			var bookmark = bookmarks[i];
			this.bookmarks.push({"start": this.translateBookMark(bookmark.startNode),
				"end": this.translateBookMark(bookmark.endNode)});
		}
		
		this.storeDocumentPos( sel );			
	},
	restoreCursor: function(){
		
		var sel = this.editor.getSelection();
		if( !sel ) return;
		
		var ranges = [], range;

			for( var i= 0; i< this.bookmarks.length; i++ )
			{
				range = sel.getRanges()[0].clone();
				var start = this.bookmarks[i].start;
				var end = this.bookmarks[i].end;
				var rel;
						
				if( start ) 
				{
					var node = this.translateBookMarkToNode( start );
					if( node )
					{ //is a node
						range.setStartBefore( node );
						node.remove();
						concord.text.tools.destroyNode(node);
					}
					else
					{
						var rel = this.translateBookMarkToOffset( start );
						if( rel )
						{ //the paragraph moved.
							range.setStart(rel.container,rel.offset );
						}
						else
						{
							node = this.translateBookMarkToPrevNode( start );
							if( node )
							{
								if( CKEDITOR.tools.isToc && CKEDITOR.tools.isToc( node ))
									range.setStartAfter( node );
								else
									range.setStartAt( node, CKEDITOR.POSITION_BEFORE_END );
							}
							else
								range.setStartAt( this.editor.document.getBody(),0);
						}
					}
				}
				if ( end )
				{
					var node = this.translateBookMarkToNode( end );
					if( node )
					{ //is a node
						range.setEndBefore( node );
						node.remove();
						concord.text.tools.destroyNode(node);
					}
					else
					{
						var rel = this.translateBookMarkToOffset( end );
						if( rel )
						{ //the paragraph moved.
							range.setEnd(rel.container,rel.offset );
						}
						else
						{
							node = this.translateBookMarkToPrevNode( end );
							if( node )
							{
								if( CKEDITOR.tools.isToc && CKEDITOR.tools.isToc( node ))
									range.setEndBefore( node );
								else
									range.setEndAt( node, CKEDITOR.POSITION_BEFORE_END );
							}
							else
								range.collapse( true );
						}
					}
				}
				else{
					range.collapse( true );
					
				}
					
				
				if( CKEDITOR && CKEDITOR.env && CKEDITOR.env.gecko && range.collapsed && range.startContainer.type == CKEDITOR.NODE_ELEMENT 
						&&  range.startOffset == range.startContainer.getChildCount() )
				{		
						var last = range.startContainer.getLast();
						if( MSGUTIL.isBogus(last) )
						{
							range.moveToElementEditablePosition(last);
						}else if ( MSGUTIL.isBlock(last) ){
							range.moveToElementEditEnd(last);
						}
				}
				ranges.push(range);
			}
			
			sel = this.editor.getSelection();
			if( sel && ranges.length>0)
			{
				sel.selectRanges(ranges);
			    this.restoreDocumentPos(sel);

			}
	}
	
});
//to store and restore curor for replace node message
dojo.declare("concord.text.ReplaceNodeCursor",concord.text.ProcCursor,{
	tid: null, 

	_storeDelCursor: function( nodes )
	{
		var sel = this.editor.getSelection(),bookmark;
		if(sel)
		{
			var ranges = sel.getRanges();					
			for ( var i = 0; i< ranges.length; i++ )
			{
				bookmark = ranges[i].createBookmark();
				var start =  this._getNodePos(bookmark.startNode,nodes );
				var end;
				if( bookmark.endNode )
					end = this._getNodePos(bookmark.endNode,nodes);
				this.bookmarks.push({'start':start,'end':end});
			}
		}
	},
	
	_isParagraph: function( element ){
		var ret = false;
		if( MSGUTIL.isParagraph(element) || MSGUTIL.isHeading(element )){
			ret = true;
		}
		else if( MSGUTIL.isListItem(element)){
			var first = element.getFirst();
			if( first && !MSGUTIL.isBlockListItem( first ))
				ret = true;
		}
		if( ret ){
			element.appendBogus();
		}
		return ret;
	},
	
	_getNodePos: function( node, nodes )
	{
		var offset = 0;
		for( var i = 0 ; i< nodes.length; i++ )
		{
			if( nodes[i].contains(node ))
			{
//				var e = new CKEDITOR.dom.elementPath( node );
				var block = MSGUTIL.getBlock( node );
				
				var target = nodes[0].getPreviousSourceNode( true,  CKEDITOR.NODE_ELEMENT );
				if( target ){
					for( var j= 0; j< nodes.length; j++ ){
						if( target.equals(nodes[j])){
							target = nodes[nodes.length-1].getPreviousSourceNode( true,  CKEDITOR.NODE_ELEMENT );
							break;
						}
					}
				}
				var elemet = target;
				if( elemet == null )
					elemet = new CKEDITOR.dom.element( this.doc.body.firstChild );
				
				var idx = 0 ;
		
				while( elemet!= null && !elemet.equals(node) ){
					if(  this._isParagraph( elemet ) )
						idx++;
					elemet = elemet.getNextSourceNode( false, CKEDITOR.NODE_ELEMENT );
				}
				
//				if( target == null ){
//				//previous is null
//					block = new CKEDITOR.dom.element( this.doc.body.firstChild );
//				}
				var offset = MSGUTIL.transOffsetRelToAbs( node.getParent(),node.getIndex(), block );
				return {"target": target.getId(),"para": idx, "idx": offset };
			}
		}
		return node;
	},
	
	_getRelPos: function( start )
	{
		var target;
		if( start.target ){
				target =  this.doc.getElementById( start.target);
		}else{
			target = this.doc.body.firstChild;
		}
		target && (target = new CKEDITOR.dom.element(target));
		
		if( !target ) return null;
		
//		var range = new CKEDITOR.dom.range( target.getDocument());
//		range.selectNodeContents( target );
//		
//		var iterator = range.createIterator(),para,idx = 0;
//		while( ( para = iterator.getNextParagraph()) )
//		{ //get the paragraph by the paragraph index
//			if( idx == start.para )
//				return MSGUTIL.getInsertPos(para,start.idx);
//			idx++;
//		}
		var para , idx = 0 ;
		
		while( para == null && target!= null ){
			if( idx >= start.para ){
				para = target;
			}
			else{
				if( this._isParagraph( target ) )
					idx++;
				target = target.getNextSourceNode( false, CKEDITOR.NODE_ELEMENT );
			}
		}
		
		target = MSGUTIL.getBlock( para );
			
		var ret = MSGUTIL.getInsertPos(target,start.idx);
		/*
		 * in the case <li><ol><li>...</li></ol></li>
		 * optimize the range
		 */
		var container = ret.container, offset = ret.offset;
		while( container.type == CKEDITOR.NODE_ELEMENT  &&  offset == 0 && container.getChildCount() ){
			container = container.getFirst();
		}
		return { 'container': container, 'offset': offset };
	},
	restoreCursor: function(){
			
		if( this.defaultProc )
		{
			concord.text.ProcCursor.prototype.restoreCursor.call(this);
			return;
		}
		var sel = this.editor.getSelection();
		if( !sel ) return;
		
		var ranges = [], range;

			for( var i= 0; i< this.bookmarks.length; i++ )
			{
				range = sel.getRanges()[0].clone();
				var start = this.bookmarks[i].start;
				var end = this.bookmarks[i].end;
				var rel;
						
				if( dojo.isObject(start)) 
				{
					if(start.para != null  && start.idx!=null )
					{
						rel = this._getRelPos( start);
						if( rel )
							range.setStart(rel.container,rel.offset );
						else
							return;	
					}
					else
					{ //is a node
						range.setStartBefore( start );
						start.remove();
						concord.text.tools.destroyNode(start);
					}
				}
				if ( end )
				{
					if( dojo.isObject(end) )
					{
						if( end.para!=null && end.idx!=null )
						{
							rel =  this._getRelPos( end );
							if( rel )
								range.setEnd(rel.container,rel.offset );
							else
								return;	
						}
						else
						{
							range.setEndBefore( end );
							end.remove();
							concord.text.tools.destroyNode(end);
						}
					}
					
				}
				else
					range.collapse( true );
				concord.text.tools.fixRange(this.editor,range);
				ranges.push(range);
			}
			
			sel = this.editor.getSelection();
			if( sel && ranges.length>0)
			{
				sel.selectRanges(ranges);
				this.restoreDocumentPos(sel);
			}

	},
	storeCursor : function( msg )
	{
			if( msg.type == MSGUTIL.msgType.ReplaceNode )
			{
				var delList = [],insList = [];
				
				var acts =msg.as || msg.updates;	
				var target = new CKEDITOR.dom.element(tar);	
				
				for( var i = 0; i< acts.length; i++ )
				{//get insert action and delete action list;
					if(acts[i].t == MSGUTIL.actType.deleteElement ) 
						delList.push( acts[i]);
					if( acts[i].t == MSGUTIL.actType.insertElement )
						insList.push( acts[i]);
				}
				if( delList.length && insList.length )
				{				
					var firstAct = delList[0];
					var insAct = insList[0];
					
					this.tid = insAct.tid;
					this.idx = insAct.idx;
					//get first paragraph index
					for( var i = 0; i< insList.length;i++)
					{
						var act = insList[i];
						if( this.tid == act.tid && act.idx < this.idx )
							this.idx = act.idx;
					}
					
					var nodes = [];
					
					//get first delete paragraph index and deleted paragraph's count
					for ( var i = 0; i< delList.length; i++ )
					{
						var act = delList[i];
						var tar = this.doc.getElementById(act.tid);
						if (tar)
						{			
	 						var target = new CKEDITOR.dom.element(tar);
							for(var j = 0; j < act.len; j++)
							{			
								var	node = MSGUTIL.getChildNode( target, act.idx + j);
								node && nodes.push( node );	
							}
							
						}
					}
					//get the delete elements list 
					this.defaultProc = false;
					//this.editor.focus();
					this._storeDelCursor( nodes);
				}	
			}
			if( this.defaultProc )
				concord.text.ProcCursor.prototype.storeCursor.call( this,msg );
	}
	
});
dojo.declare("concord.text.SplitJoinCursor",concord.text.ProcCursor,{
	
	_storeDelCursor: function( tar )
	{
		var sel = this.editor.getSelection(),bookmark;
		if(sel)
		{
			var ranges = sel.getRanges();					
			for ( var i = 0; i< ranges.length; i++ )
			{
				bookmark = ranges[i].createBookmark();
				var start =  this._transBookMarkNode(bookmark.startNode,tar);
				var end;
				if( bookmark.endNode )
					end = this._transBookMarkNode(bookmark.endNode,tar);
				this.bookmarks.push({'start':start,'end':end});
			}
		}
	},
	
	restoreCursor: function(  )
	{
		var sel = this.editor.getSelection();
		if( !sel ) return;
		
		if( this.defaultProc )
		{
			concord.text.ProcCursor.prototype.restoreCursor.call(this);
			return;
		}
			
		var ranges = [], range;

			for( var i= 0; i< this.bookmarks.length; i++ )
			{
				range = sel.getRanges()[0].clone();
				var start = this.bookmarks[i].start;
				var end = this.bookmarks[i].end;
				var rel;
						
				if( dojo.isObject(start)) //is a node
				{
					range.setStartBefore( start );
					start.remove();
					concord.text.tools.destroyNode(start);
				}
				else
				{
					rel = this.getRelPos(this.tar,start);
					//console.log('start',rel.container.getText());
					//console.log('offset',rel.offset);
					range.setStart(rel.container,rel.offset );				
				}
				
				if ( end )
				{
					if( dojo.isObject(end) )
					{
						range.setEndBefore( end );
						end.remove();
						concord.text.tools.destroyNode(end);
					}
					else
					{
						rel = this.getRelPos(this.tar,end);
						//console.log('end',rel.container.getText());
						//console.log('offset',rel.offset);
						range.setEnd(rel.container,rel.offset );
					}
				}
				else
					range.collapse( true );
				ranges.push(range);
			}
			
			sel = this.editor.getSelection();
			if( sel && ranges.length>0)
			{
				sel.selectRanges(ranges);
				this.restoreDocumentPos(sel);
				
			}
	}
});
dojo.declare("concord.text.ProcSplitCursor",concord.text.SplitJoinCursor,{
	insertCount: 0,
	constructor: function( editor,doc,msg )
	{
		this.insertCount = 0;
		
	},
	storeCursor : function( msg )
	{
		var deleteAct;
		if( msg.type == MSGUTIL.msgType.Split )
		{
			//this.editor.focus();
			var acts =msg.as || msg.updates;
	
			if( acts && acts.length >=1 )
			{
				deleteAct = acts[0];
				for( var i = 1; i< acts.length; i++ )
				{
					if(acts[i].t == MSGUTIL.actType.insertElement ) this.insertCount++;
				}
			}
			
			if( deleteAct && deleteAct.t == MSGUTIL.actType.deleteText )
			{
				var paraId = deleteAct.tid;
				var tarnode = this.doc.getElementById(paraId);
				if( tarnode != null )
				{
					this.defaultProc = false;
					var tar = new CKEDITOR.dom.element(tarnode);
					this.tar = tar;
					this._storeDelCursor(tar );
					var sel = this.editor.getSelection();
					this.storeDocumentPos(sel);
				}
				
			}
		}
		if( this.defaultProc )
			concord.text.ProcCursor.prototype.storeCursor.call( this,msg );
	},
	
	getRelPos: function( para, index )
	{
		var len = MSGUTIL.getNodeLength( para ); 
		if( index >= len )
		{
			index -=len;
			var count = this.insertCount;
			while(count>0 && para )
			{
				para = para.getNext();
				count--;
			}
		}
		return MSGUTIL.getInsertPos(para,index);
	}
   }
);

dojo.declare("concord.text.ProcJoinCursor",concord.text.SplitJoinCursor,{
	
	oldlen:0,
	deleteCount: 0,
	constructor: function( editor,doc,msg )
	{
		this.deleteCount =0;
		this.oldlen = 0;
	},
	storeCursor : function( msg )
	{
		var insertAct;
		var deletAct;
		if( msg.type == MSGUTIL.msgType.Join )
		{
			//this.editor.focus();
			var acts = msg.as || msg.updates;
	
			if( acts && acts.length >= 2 )
			{
				for( var i = 0; i< acts.length; i++ )
				{
					if(acts[i].t == MSGUTIL.actType.insertText ) 
						insertAct = acts[i];
					if(acts[i].t == MSGUTIL.actType.deleteElement)
						deletAct = acts[i]; 
				}
						
			}
			if( deletAct && insertAct )
			{
				var target = new CKEDITOR.dom.element(this.doc.getElementById(deletAct.tid));
				var act = deletAct;
				if (act.isb && act.len == 1)
				{	
					var node = MSGUTIL.getChildNode( target,act.idx );//target.getChild(act.idx );
					var tar = this.doc.getElementById(insertAct.tid);
					if( tar )
					{
						this.defaultProc = false;
						this.tar =  new CKEDITOR.dom.element(tar);
						this._storeDelCursor(node );
						this.oldlen = MSGUTIL.getNodeLength( this.tar ); 
						var sel = this.editor.getSelection();
						this.storeDocumentPos(sel);
					}
					else
						LOG.log( "Can not find the target!");
				}
				else
					LOG.log( "Join message is wrong" );
			
			}
		}
		if( this.defaultProc )
			concord.text.ProcCursor.prototype.storeCursor.call( this,msg );
	},
	getRelPos: function( para, index )
	{
		return MSGUTIL.getInsertPos(para,index+this.oldlen);
	}
}
);