dojo.require("writer.util.SectionTools");
dojo.require("concord.i18n.WordBreakIterator");
dojo.require("concord.i18n.CharacterBreakIterator");
dojo.require("writer.core.Range");
dojo.require("writer.util.HelperTools");
dojo.provide("writer.util.ModelTools");
//dojo.require("writer.util.Walker");
//dojo.require("writer.common.tools");
writer.util.ModelTools = {
		
_getFilterFunction: function( filter ){
	if( dojo.isString( filter )){
		var modelType = filter;
		filter = function( item ){
			return item.modelType == modelType;
		};
	}
	if( !dojo.isFunction( filter ) ){
		filter = function(){ return true; };
	}
	return filter;
},
/**
 * 
 * @param maxLevel
 * @returns
 */
getOutlineParagraphs: function ( maxLevel, minLevel )
{
	
	(!maxLevel) && ( maxLevel = 5 ); //default maxLevel = 5
	minLevel = minLevel || 0;
	
	var headings = [];
	var doc = window.layoutEngine.rootModel;
	
	function filterFunc( p )
	{
		var text = p.text && p.text.replace(/\u0001/gi,"");
		
		if(  p.modelType == writer.MODELTYPE.PARAGRAPH && text && ( dojo.trim( text )!= "")
				&& p.getStyleId()!="TOCHeading" && p.parent.modelType != writer.MODELTYPE.TOC )
		{
			var styleId = p.getStyleId()
			var level = p.getOutlineLvl();
			return (level!= null ) && level< maxLevel && level >= minLevel;
		}
		else
			return false;
	}
	
	var para = writer.util.ModelTools.getNext( doc, filterFunc, true );
	
	while( para ){
		headings.push( para );
		para = writer.util.ModelTools.getNext( para, filterFunc, false );
	};
	return headings;
},
/*
 * operations of model
 */
insertInlineObject: function( cnt, para, index, select )
{
	para.insertRichText(cnt,index);
	var insertLen = (cnt.c ) ? cnt.c.length : 0 ;
	var actPair = WRITER.MSG.createInsertTextAct(index, insertLen, para);
	
	var msgs = [];
	var msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair]);
	msg && msgs.push( msg );
	if( select )
	{
		var selection = pe.lotusEditor.getSelection();;
		var range = selection.getRanges()[0];
		range.setStartModel( para, index+insertLen);
		range.collapse( true );
		selection.selectRangesBeforeUpdate([range]);
	}
	para.parent.update();

	WRITER.MSG.sendMessage( msgs );
},
/*
 * create empty paragraph
 */		
createEmptyParagraph: function(doc){
	return new writer.model.Paragraph( writer.util.ModelTools.getEmptyParagraphSource(), doc );
},

getEmptyParagraphSource: function(){
	return { 
		'fmt': [], 
		'pPr': {},
		'rPr':{},
		't': 'p',
		'id': WRITER.MSG_HELPER.getUUID(),
		'c':''};
},

isEmptyParagraph: function( p ){
	if( p.modelType == writer.MODELTYPE.PARAGRAPH){
		return !p.text || p.text == "";
	}
	return true;
},
isImage: function(m)
{
	var mType = m.modelType;
	if (mType == writer.MODELTYPE.IMAGE
			|| mType == writer.MODELTYPE.TBIMAGE
			|| mType == writer.MODELTYPE.SQIMAGE
			|| mType == writer.MODELTYPE.FLIMAGE
			|| mType == writer.MODELTYPE.SIMPLEIMAGE)
			return true;
	return false;
},


isTextBox: function(m)
{
	var mType = m.modelType;
	if(mType == writer.MODELTYPE.TXBX ||
			mType == writer.MODELTYPE.FLTXBX||
			mType == writer.MODELTYPE.TBTXBX  ||
			mType == writer.MODELTYPE.SQTXBX ||
			mType == writer.MODELTYPE.SIMPLETXBX)
		return true;
	return false;	
},

/*
 * merge two paragraph
 */
mergeParagraphs: function( p1, p2, msgs ){
	if( !p1 || !p2 )
		return null;
	if( msgs )
	{
		var index = 0, len = 0, msg;
		if(p1.text){
			index = p1.text.length;
		}
		if(p2.text){
			len = p2.text.length;
		}
		msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Element, [WRITER.MSG.createDeleteElementAct(p2)]);
		msg && msgs.push(msg);
	}

	if(!writer.util.ModelTools.isEmptyParagraph( p2 ))
		p1.merge(p2);
		
	p2.parent.remove(p2);
	
	if( msgs && len ){
		var actPair = WRITER.MSG.createInsertTextAct(index, len, p1),
			msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair]);
		msg && msgs.push(msg);
	}
	
	return p1;
},
/*
 * fix block to insert empty paragraph
 * 
 */
fixBlock: function( block, range, msgs ){
	var p = writer.util.ModelTools.createEmptyParagraph( block );
	block.insertAfter( p );
	range && range.moveToPosition( p, 0 );
	if( msgs ){
		msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( p )] ) );
	}
},
/*
 * delete paragraph
 */
removeBlock : function ( c, range, msgs ){

	var next = c.next(),prev,parent = c.parent;;
	var donotDel = false;
	if( next ){
		//move to begin of next
		range && range.moveToEditStart( next );
	}
	else{
		//move to end of previous
		prev = c.previous();
		if( prev )
		{
			switch( prev.modelType )
			{
				case writer.MODELTYPE.TOC:
				case writer.MODELTYPE.TABLE:
				case writer.MODELTYPE.TBTXBX:
					donotDel = true;
			}
			if(prev.isEndWithPageBreak&&prev.isEndWithPageBreak()||prev.hasSectId&&prev.hasSectId()){
				donotDel = true;
			}	
		}
		range && prev && range.moveToEditEnd( prev );
	}
	
	if( !next && !prev ||donotDel){
		writer.util.ModelTools.fixBlock(parent, range, msgs);
	}
	
	if( msgs )
		msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element, [ WRITER.MSG.createDeleteElementAct( c )] ) );

	//if para has border , after delete to markdirty
	//or it is a task para
	if(( c.getBorder && c.getBorder()) || (c.isTask && c.isTask()) ){
		prev = c.previous();
		if(next && ((next.getBorder&&next.getBorder()) || (next.isTask&&next.isTask())))
			next.markDirty();
		if(prev && ((prev.getBorder&&prev.getBorder()) || (prev.isTask&&prev.isTask())))
			prev.markDirty();
	}
	parent.container.remove(c);
	c.markDelete(msgs);
	writer.util.SectionTools.deleteSection(c, msgs);
},
/*
 * check if it is a block 
 */
isBlock: function( p ){
	//TODO: add more block types
	
	// Footnote, endNote, text box..
	var mt = writer.MODELTYPE;
	switch(p.modelType)
	{
	case mt.PARAGRAPH:
	case mt.TOC:
	case mt.TABLE:
	case mt.ROW:
	case mt.CELL:
		return true;
		
	default: 
		return false;
	}
	return false;
},
isParagraph: function(model)
{
	return (model && model.modelType == writer.MODELTYPE.PARAGRAPH);
},
isTOC:function(model){
	return (model && model.modelType == writer.MODELTYPE.TOC);
},
/*
 * is field 
 * or image 
 * or link
 */
isInlineObject: function( model )
{
	if( !model )
		return false;
	return ( model.modelType == writer.MODELTYPE.IMAGE
			|| model.modelType == writer.MODELTYPE.CANVAS
			|| model.modelType == writer.MODELTYPE.FIELD 
			|| model.modelType == writer.MODELTYPE.PAGENUMBER
			|| model.modelType == writer.MODELTYPE.LINK 
			|| model.modelType == writer.MODELTYPE.RFOOTNOTE
			|| model.modelType == writer.MODELTYPE.RENDNOTE
			|| model.modelType == writer.MODELTYPE.ALTCONTENT);
},

isLinkOrField: function(model){
	if( !model )
		return false;
	return ( model.modelType == writer.MODELTYPE.LINK || model.modelType == writer.MODELTYPE.FIELD);
},

isLink: function(model){
	if( !model )
		return false;
	return ( model.modelType == writer.MODELTYPE.LINK);
},

isInLink:function(model){
	if(!model){
		return false;
	}		
	if(writer.util.ModelTools.isLink(model)){
		return true;
	}
	return writer.util.ModelTools.isInLink(model.parent);
},

isField: function(model){
	if( !model )
		return false;
	return ( model.modelType == writer.MODELTYPE.FIELD);
},

getLink:function(model){
	if(!model){
		return null;
	}		
	if(writer.util.ModelTools.isLink(model)){
		return model;
	}
	if(writer.util.ModelTools.isParagraph(model))
		return null;
	return writer.util.ModelTools.getLink(model.parent);
},

getField:function(model){
	if(!model){
		return null;
	}		
	if(writer.util.ModelTools.isField(model)){
		return model;
	}
	if(writer.util.ModelTools.isParagraph(model))
		return null;
	
	return writer.util.ModelTools.getField(model.parent);
},

hasComments:function(model) {
	if (model.clist && model.clist.length > 0)
		return true;
	else
		return false;
},

/*
 * is paragraph 
 * or table
 */
isParaOrTable: function( model )
{
	if( !model )
		return false;
	return ( model.modelType == writer.MODELTYPE.PARAGRAPH
			|| model.modelType == writer.MODELTYPE.TABLE);
},

isBookMark: function(r){
	if( !r )
	{
		console.error( "r is null!! ");
		return false;
	}	
	 return  r.modelType == writer.MODELTYPE.BOOKMARK;
},
/*
 * check if it is a run 
 */
isRun: function( r ){
	//TODO: Add more run types
	if( !r )
	{
		console.error( "r is null!! ");
		return false;
	}
	
	 return r.modelType == writer.MODELTYPE.TEXT//'run.text' 
		 		|| r.modelType == writer.MODELTYPE.IMAGE//'run.image'
				|| r.modelType == writer.MODELTYPE.TXBX
		 		|| r.modelType == writer.MODELTYPE.LINK//'run.hyperlink'
				|| r.modelType == writer.MODELTYPE.PAGENUMBER
				|| r.modelType == writer.MODELTYPE.BOOKMARK
				|| r.modelType == writer.MODELTYPE.RFOOTNOTE
				|| r.modelType == writer.MODELTYPE.RENDNOTE;
	 			
},
isPageBreak: function(r)
{
	if( !r )
	{
		console.error( "r is null!! ");
		return false;
	}

	if (r.modelType == writer.MODELTYPE.TEXT)
	{
		return r.isPageBreak();
	}

	return false;
},
isCanvas: function(r){
	return r.modelType == writer.MODELTYPE.CANVAS
		|| r.modelType == writer.MODELTYPE.SQCANVAS
		|| r.modelType == writer.MODELTYPE.FLCANVAS
		|| r.modelType == writer.MODELTYPE.TBCANVAS
		|| r.modelType == writer.MODELTYPE.SIMPLECANVAS;

},
isDrawingObj: function(r)
{
	return writer.util.ModelTools.isImage(r) || writer.util.ModelTools.isTextBox(r) || writer.util.ModelTools.isCanvas(r);
},
inCanvas: function(r){
	return r.parent && writer.util.ModelTools.isCanvas(r.parent);
},
isNotesRefer:function(r){
	if( !r )
	{
		console.error( "r is null!! ");
		return false;
	}
	
	 return r.modelType == writer.MODELTYPE.RFOOTNOTE || r.modelType == writer.MODELTYPE.RENDNOTE;
},
isAnchor:function(r)
{
	return r.modelType == writer.MODELTYPE.SQIMAGE
		|| r.modelType == writer.MODELTYPE.FLIMAGE
		|| r.modelType == writer.MODELTYPE.TBIMAGE

		|| r.modelType == writer.MODELTYPE.SQTXBX
		|| r.modelType == writer.MODELTYPE.FLTXBX
		|| r.modelType == writer.MODELTYPE.TBTXBX

		|| r.modelType == writer.MODELTYPE.SQCANVAS
		|| r.modelType == writer.MODELTYPE.FLCANVAS
		|| r.modelType == writer.MODELTYPE.TBCANVAS;
},
isWrappingAnchor: function(r)
{
	return r.modelType == writer.MODELTYPE.SQIMAGE
		|| r.modelType == writer.MODELTYPE.TBIMAGE

		|| r.modelType == writer.MODELTYPE.SQTXBX
		|| r.modelType == writer.MODELTYPE.TBTXBX

		|| r.modelType == writer.MODELTYPE.SQCANVAS
		|| r.modelType == writer.MODELTYPE.TBCANVAS;
},
isCell: function(m)
{
	return m.modelType == writer.MODELTYPE.CELL;
},
/*
 * check if it is a document
 */
isDocument: function( m ){
	return m.modelType == writer.MODELTYPE.DOCUMENT ||
			m.modelType == writer.MODELTYPE.HEADERFOOTER||
			m.modelType == writer.MODELTYPE.FOOTNOTE||
			m.modelType == writer.MODELTYPE.ENDNOTE;//||m.modelType==writer.MODELTYPE.CELL;
},
isNotes:function(m){
	return m.modelType == writer.MODELTYPE.FOOTNOTE||m.modelType == writer.MODELTYPE.ENDNOTE;
},
isHeaderFooter:function(m){
	return m.modelType == writer.MODELTYPE.HEADERFOOTER;
},
isInHeaderFooter:function(m){
	if(m.parent){
		if(writer.util.ModelTools.isHeaderFooter(m.parent)){
			return true;
		}else{
			return writer.util.ModelTools.isInHeaderFooter(m.parent);
		}
	}
	return false;
},
isInNotes:function(m){
	if(m.parent){
		if(writer.util.ModelTools.isNotes(m.parent)){
			return true;
		}else{
			return writer.util.ModelTools.isInNotes(m.parent);
		}
	}
	return false;
},
getNotes:function(m){
	return writer.util.ModelTools.getParent(m, writer.util.ModelTools.isNotes);
},
inTable:function(model){
	if(!model){
		return false;
	}		
	if(model.modelType==writer.MODELTYPE.ROW||model.modelType==writer.MODELTYPE.CELL){
		return true;
	}
	return writer.util.ModelTools.inTable(model.parent);
},
isTableinTable:function(model){
	if(!model){
		return false;
	}		
	if(model.modelType==writer.MODELTYPE.TABLE){
		return writer.util.ModelTools.inTable(model.parent);
	}
	return writer.util.ModelTools.isTableinTable(model.parent);
},
inTextBox:function(model){
	if(!model){
		return false;
	}		
	if(writer.util.ModelTools.isTextBox(model)){
		return true;
	}
	return writer.util.ModelTools.inTextBox(model.parent);
},
isInSmartart:function(){
	var paras = pe.lotusEditor.getSelectedParagraph();
	if(paras.length > 0)
	{
		var model = paras[0];
		
		var inlineCanvas = this.getParent(model, this.isCanvas);
		if(inlineCanvas && inlineCanvas.isSmartArt)
			return true;
	}
	
	return false;
},
getTable:function(model){
	if(!model){
		return null;
	}		
	if(model.modelType==writer.MODELTYPE.TABLE){
		return model;
	}
	return writer.util.ModelTools.getTable(model.parent);
},
//get the table,which parent is document
getRootTable:function(model){
	if(!model){
		return null;
	}		
	if(model.modelType==writer.MODELTYPE.TABLE &&
			model.parent &&
			model.parent.modelType==writer.MODELTYPE.DOCUMENT){
		return model;
	}
	return writer.util.ModelTools.getRootTable(model.parent);	
},
getRow:function(model){
	if(!model){
		return null;
	}		
	if(model.modelType==writer.MODELTYPE.ROW){
		return model;
	}
	return writer.util.ModelTools.getRow(model.parent);
},
getCell:function(model){
	if(!model){
		return null;
	}		
	if(model.modelType==writer.MODELTYPE.CELL){
		return model;
	}
	return writer.util.ModelTools.getCell(model.parent);
},
isCell:function(model){
	return model.modelType==writer.MODELTYPE.CELL;
},
isRow:function(model){
	return model.modelType==writer.MODELTYPE.ROW;
},
isTable:function(model){
	return model.modelType==writer.MODELTYPE.TABLE;
},
/*
 * first child of model
 */
firstChild: function( m ){
	if( m.hints )
			return m.hints.getFirst();
		
	return m.firstChild();
},
/*
 * next sibling of model
 */
nextSibling: function( m ){
	if(  m.parent && m.parent.hints )
		return m.parent.hints.next(m);
	return m.next();
},
/*
 * parent of model
 */
getParent: function( m , filter ){
	filter = writer.util.ModelTools._getFilterFunction(filter);
	var p = m.parent;
	while( p && !filter( p ))
		p = p.parent;
	return p;
},

/*
 * get length
 */
getLength: function( m ){
	if( !m )
	{
		console.error("m is null");
		return 0;
	}
	if( writer.util.ModelTools.isDocument(m))
		return m.container.length();
	
	switch( m.modelType ){
	case writer.MODELTYPE.TEXT:
	case writer.MODELTYPE.LINK:
	case writer.MODELTYPE.FIELD:
		if( m.length )
			return m.length;
		else
			m = writer.util.ModelTools.getParagraph(m);
	case writer.MODELTYPE.PARAGRAPH:
		return m.getLength();
	case writer.MODELTYPE.CELL:
	case writer.MODELTYPE.ROW:
	case writer.MODELTYPE.TABLE:
		return m.container.length();
	default:
		if(m.container){
			return m.container.length();
		}
		return 1;
	}
},
/*
 * get paragaraph	
 */
getParagraph: function( m ){
	return writer.util.ModelTools.getParent( m, writer.MODELTYPE.PARAGRAPH );
},

/**
 * is hint in toc
 * @param modelObj, hint or paragraph
 * @returns
 */
isInToc: function ( modelObj ){
	if(!modelObj) return false;
	 var paragraph = writer.util.ModelTools.getAncestor(modelObj, writer.MODELTYPE.PARAGRAPH);
	 var styleId =  paragraph && paragraph.getStyleId();
	 if( styleId && styleId.match(/^TOC\d+$/) ){
	  //paragraph may not in a toc div now
		 return true;
	 }
	 else
	 {
	 	if (!paragraph)
	 		return false;
	 	else
	 		return writer.util.ModelTools.getParent( paragraph,writer.MODELTYPE.TOC);
	 }
},
/*
 * get Document
 */
getDocument: function( m ){
	if( writer.util.ModelTools.isDocument(m))
		return m;
	else
		return writer.util.ModelTools.getParent( m, writer.util.ModelTools.isDocument );
},
getAncestor:function(model, type){
	if(!model){
		return null;
	}
	if(model.modelType == type){
		return model;
	}else{
		return writer.util.ModelTools.getAncestor(model.parent,type);
	}
},
isChildOf:function(child,parent){
	if(!child){
		return false;
	}
	if(child.parent == parent){
		return true;
	}
	return writer.util.ModelTools.isChildOf(child.parent, parent);
},
/*
 * get child
 */
getChild: function( m, filter )
{
	filter = writer.util.ModelTools._getFilterFunction(filter);
	var child =  writer.util.ModelTools.firstChild( m );;
	while( child ){
		if( filter(child) )
			return child;
		else
			child = writer.util.ModelTools.nextSibling( child );
	}
	return null;
},

/**
 * Get the paragraph's element path
 * @param para
 */
getParagraphPath: function(para)
{
	if( para.modelType != writer.MODELTYPE.PARAGRAPH)
		return null;
	
	var path = [];
	var curObj = para;
	var parent = curObj.parent;
	while(true)
	{
		if(!parent)
			throw "The object has no parent.";
		
		if( writer.util.ModelTools.isParagraph(parent) ){
			// In text Box
			if(writer.util.ModelTools.isTextBox(curObj))
			{
				path.unshift( curObj.start || 0 );
			}	
			else
				break;
		}
		else
			path.unshift(parent.indexOf(curObj));
		
		if( writer.util.ModelTools.isDocument(parent) )
		{
			if(writer.util.ModelTools.isNotes(parent))
			{
				path.unshift(parent.getSeqId());
				path.unshift(4);		// After body
			}
			else if(this.isHeaderFooter(parent))
			{
				if(parent.hfType == "hdr")
					path.unshift(1);	// Before body content
				else
					path.unshift(3);	// After body content
			}
			else
				path.unshift(2);
				
			break;
		}
		curObj = parent;
		parent = curObj.parent;
	}	
	
	return path;
},
/**
 * get first child which meet the filter function
 * @param element
 * @param filter
 * @param deepSearch
 */
getFirstChild: function( m, filter, deepSearch )
{
	filter = writer.util.ModelTools._getFilterFunction(filter);
	var child =  m.firstChild();
	
	while( child ){
		if( filter(child) )
			return child;
		if( deepSearch )
		{
			var first = writer.util.ModelTools.getFirstChild(child, filter, true);
			if( first )
				return first;
		}
		child = child.next();
	}
	return null;
},
getFirstChildInRange:function(m,filter,deepSearch,start,end){	
	var ret = null;
	var idx = start;
	if(end==null){
		end = writer.util.ModelTools.getLength(m)-1;
	}
	while(!ret&&idx<=end){
		var item = m.getItemByIndex(idx);
		ret = writer.util.ModelTools.getFirstChild(item,filter,deepSearch);
		idx++;
	}
	return ret;
},
getLastChildInRange:function(m,filter,deepSearch,start,end){
	var ret = null;
	var idx = end;
	if(start==null){
		start = 0;
	}
	while(!ret&&idx>=start){
		var item = m.getItemByIndex(idx);
		ret = writer.util.ModelTools.getLastChild(item,filter,deepSearch);
		idx--;
	}
	return ret;
},
/**
 * get last child which meet the filter function
 * @param element
 * @param filter
 * @param deepSearch: if search child of children?
 * @returns
 */
getLastChild: function( m, filter, deepSearch  )
{
	filter = writer.util.ModelTools._getFilterFunction(filter);
	var child =   m.lastChild();
	while( child ){
		if( filter(child) )
			return child;
		if( deepSearch )
		{
			var last = writer.util.ModelTools.getLastChild(child, filter, true);
			if( last )
				return last;
		}
		child = child.previous();
	}
	return null;
},
/**
 * get next model
 * @param element
 * @param filter
 * @param startFromChild
 * @param guard
 * @returns
 */
getNext: function( element, filter, startFromChild, guard ){
	if( !element )
		return null;
	filter = writer.util.ModelTools._getFilterFunction(filter);

	if ( guard && !guard.call )
	{
		var guardModel = guard;
		guard = function( e )
		{
			return e != guardModel;
		};
	}
	
	function _checkChild( m ){
		var child =  writer.util.ModelTools.firstChild( m ), ret;
		while( child ){
		
			if ( guard && guard( child, true ) === false )
				return "outside";
			if( filter(child) )
				return child;
			else if( ret = _checkChild( child )){
				return ret;
			}
			child = writer.util.ModelTools.nextSibling( child );
		}
		return null;
	}
	
	//check child element
	var item = startFromChild && _checkChild( element );
	if(  item == "outside")
		return null;
	else if ( item )
		return item;
	
	//check itself is outside
	if ( guard && guard( element, true ) === false )
		return null;
	
	//check next sibling
	item = writer.util.ModelTools.nextSibling( element );

	var startFromChild = true;
	if ( !item ){
	// no sibling
	//then check start from element's parent
		item = writer.util.ModelTools.getParent(  element );
		startFromChild = false;
	}

	if( !item )
		return null;
	
	if ( guard && guard( item ) === false )
		return null;


	if ( !filter(item) )
		return writer.util.ModelTools.getNext( item,  filter, startFromChild, guard );

	return item;
},
/**
 * return children of json Data of a Model.
 * @param jsonData
 */
getJsonChildren: function( jsonData){
	var rt = jsonData.rt||jsonData.t;
	switch ( rt ){
	case writer.model.text.Run.TXBX:
		if( jsonData.txContent )
			return jsonData.txContent;
		else if( jsonData.txbxContent )
			return jsonData.txbxContent;
		else if ( jsonData.anchor && jsonData.anchor.graphicData && jsonData.anchor.graphicData.txbx )
			return jsonData.anchor.graphicData.txbx.txbxContent;
		else if( jsonData.inline && jsonData.inline.graphicData && jsonData.inline.graphicData.txbx )
			return jsonData.inline.graphicData.txbx.txbxContent;
		break;
	case writer.MODELTYPE.FOOTNOTE:
	case writer.MODELTYPE.ENDNOTE:
		return  jsonData.ps;
	case "wgp":
	case "wpc":
	case "grpSp":
		//canvas
		{
			var children = [];
			var wpx = jsonData.anchor && jsonData.anchor.graphicData && 
				(jsonData.anchor.graphicData.wpc || jsonData.anchor.graphicData.wgp);
			if (!wpx)
				wpx = jsonData.inline && jsonData.inline.graphicData && 
				(jsonData.inline.graphicData.wpc || jsonData.inline.graphicData.wgp);
			if (!wpx)
				wpx = jsonData;
			
			if( wpx.grpSp )
				children = children.concat( wpx.grpSp );
			if( wpx.txbx )
				children = children.concat( wpx.txbx );
			if( wpx.pic )
				children = children.concat( wpx.pic );
			if( wpx.wgp )
				children = children.concat( wpx.wgp );
			return children;
		}
	}
	
	if( jsonData.fmt ){
		return jsonData.fmt;
	}
	switch( jsonData.t ){
	case 'tbl':
		return jsonData.trs;
	case 'tr':
		return jsonData.tcs;
	case 'tc':
		return jsonData.ps;
	case 'sdt':
		return jsonData.sdtContent;
	}
	
	return [];
},

getNextWordPosition : function(pos) {
	var nextp = -1;
	if (writer.util.ModelTools.isRun(pos.obj) && pos.obj.paragraph) {
		var wordbrk = new concord.i18n.WordBreakIterator(pos.obj.paragraph.text);
		nextp = wordbrk.nextBoundary(pos.obj.start + pos.index);
	}
	return nextp;
},

getPreviousWordPosition : function(pos) {
	var prevp = -1;
	if (writer.util.ModelTools.isRun(pos.obj) && pos.obj.paragraph) {
		var wordbrk = new concord.i18n.WordBreakIterator(pos.obj.paragraph.text);
		prevp = wordbrk.prevBoundary(pos.obj.start + pos.index);
	}
	return prevp;
},

isValidSel4Find: function(){
	var range = pe.lotusEditor.getSelection().getRanges()[0];
	
	var obj = range.getSelectedObject();
	if (obj && (this.isTextBox(obj)|| this.isCanvas(obj) || this.isImage(obj)))
		return false;
	return true;
},

getCurrentWordRange : function(pos, rootview) {
	var start = {index:pos.index, obj:pos.obj};
	var end = {index:pos.index, obj:pos.obj};
	if (writer.util.ModelTools.isRun(pos.obj) && pos.obj.paragraph) {
		var wordbrk = new concord.i18n.WordBreakIterator(pos.obj.paragraph.text);
		var wordrange = wordbrk.curWordBoundary(pos.obj.start + pos.index);
		end.index = wordrange.end;
		start.index = wordrange.start;
		end.obj = pos.obj.paragraph;
		start.obj = pos.obj.paragraph;
	} else if (writer.util.ModelTools.isParagraph(pos.obj)){
		var wordbrk = new concord.i18n.WordBreakIterator(pos.obj.text);
		var wordrange = wordbrk.curWordBoundary(pos.index);
		end.index = wordrange.end;
		start.index = wordrange.start;
		end.obj = pos.obj;
		start.obj = pos.obj;
	}
	return (new writer.core.Range(start, end, rootview));
},

//
// Get next character boundary
// return, -1 if pos.obj is not a valid run
//         or next char pos 
getNextCharBoundary : function(pos) {
	var ret = -1; 
		
	if (writer.util.ModelTools.isRun(pos.obj) && pos.obj.paragraph) {
		ret = pos.obj.start + pos.index + 1; 
		var charbrk = new concord.i18n.CharacterBreakIterator(pos.obj.paragraph.text);
		if (!charbrk.isBoundary(ret)) {
			var nextb = charbrk.nextBoundary(ret);
			if (nextb >= 0)
				ret = nextb;
		}
	}
	
	return ret;
},

//
//Get prev character boundary
//return, -1 if pos.obj is not a valid run
//      or prev char pos
getPrevCharBoundary : function(pos) {
	var ret = -1;
	if (writer.util.ModelTools.isRun(pos.obj) && pos.obj.paragraph) {
		ret = pos.obj.start + pos.index - 1;
		var charbrk = new concord.i18n.CharacterBreakIterator(pos.obj.paragraph.text);
		if (!charbrk.isBoundary(ret)) {
			var prevb = charbrk.prevBoundary(ret);
			if (prevb >= 0)
				ret = prevb;
		}
	}
	return ret;
},

// return a char's start and end boundaries
// @param, char index, may be at the begin or in the middle of a grapheme cluster 
// {start:val0,end:val1}
getCharBoundaries : function(pos) {
	var ret = {start:pos.index, end:pos.index};
	var para = null;
	var index = pos.index;
	if (writer.util.ModelTools.isRun(pos.obj)) {
		para = pos.obj.paragraph;
		index += pos.obj.start;
	} else if (writer.util.ModelTools.isParagraph(pos.obj))
		para = pos.obj;
	
	if (para && para.text.length > 0) {
		var charbrk = new concord.i18n.CharacterBreakIterator(para.text);
		var e_index = charbrk.nextBoundary(index); 
		if (!charbrk.isBoundary(index)) {
			var s_index = charbrk.prevBoundary(index);
			if (s_index >= 0 && e_index > 0) {ret.start = s_index; ret.end = e_index;} 
		} else if (e_index > 0)
			ret.end = e_index;
	}

	return ret;
},

/**
 * get previous model
 * @param element
 * @param filter
 * @param startFromChild
 * @param guard
 * @returns
 */
getPrev: function( element, filter, startFromChild, guard ){
	filter = writer.util.ModelTools._getFilterFunction(filter);

	if ( guard && !guard.call )
	{
		var guardModel = guard;
		guard = function( e )
		{
			return e != guardModel;
		};
	}

	var item = ( startFromChild && element && writer.util.ModelTools.lastChild( element ) ),
	parent;

	if ( !item )
	{
		if ( guard && guard( element, true ) === false )
			return null;
		item =  element  && writer.util.ModelTools.previousSibling( element );
	}

	while ( !item && ( parent = writer.util.ModelTools.getParent( parent || element )) )
	{
		// The guard check sends the "true" paramenter to indicate that
		// we are moving "out" of the element.
		if ( guard && guard( parent, true ) === false )
			return null;
		if (  filter(parent) )
			return parent;
			item = writer.util.ModelTools.previousSibling( parent );
	}

	if ( !item )
		return null;

	if ( guard && guard( item ) === false )
		return null;


	if ( !filter(item) )
		return writer.util.ModelTools.getPrev( item,  filter, true, guard );

	return item;
},
previousSibling: function( m ){
	if(  m.parent && m.parent.hints )
		return m.parent.hints.prev(m);
	return m.previous();
},
lastChild: function( m ){
	if( m.hints )
			return m.hints.getLast();
	return m.lastChild();
},
/**
 * check if index is end of obj
 * @param obj
 * @param index
 * @returns block or null
 */
isEndBlock: function( obj, index ){
	if (writer.util.ModelTools.isParagraph(obj) && index == obj.getLength())
		return obj;
	else if (obj.paragraph && obj.start != null)
		return writer.util.ModelTools.isEndBlock(obj.paragraph, obj.start + index);
	else if (obj.container && index == obj.container.length())
		return obj;
	return null;
},
/**
 * check if index is start of obj
 * @param obj
 * @param index
 * @returns block or null
 */
isStartBlock: function( obj, index ){
	if( obj.paragraph && obj.start!= null )
	//hint
		return writer.util.ModelTools.isStartBlock( obj.paragraph, obj.start + index );
		
	if( index == 0 )
		return obj;
	else
		return null;
},
/**
 * if the position is start of a block( outside most )
 * return the block
 * else return null
 * @param obj
 * @param index
 */
getStartOfBlock: function( obj, index ){
	var block = writer.util.ModelTools.isStartBlock(obj, index);
	if( block ){
		var p = block.parent,nextBlock;
		if( p && p.getContainer && ( nextBlock = writer.util.ModelTools.getStartOfBlock( p, p.getContainer().indexOf(block))))
				return nextBlock;
		else
			return block;
	}
	return null;
},
/**
 * if the position is end of a block( outside most )
 * return the block
 * @param obj
 * @param index
 */
getEndOfBlock: function( obj, index ){
	var block = writer.util.ModelTools.isEndBlock(obj, index);
	if( block ){
		var p = block.parent,nextBlock;
		if( p && p.getContainer && ( nextBlock = writer.util.ModelTools.getEndOfBlock( p, p.getContainer().indexOf(block))))
				return nextBlock;
		else
			return block;
	}
	return null;
},
/**
 * compare two position'
 * @param obj1
 * @param index1
 * @param obj2
 * @param index2
 * return:
 * 0  --- equail
 * 1  --- big
 * -1 --- small
 */
compare: function( obj1, index1, obj2, index2){
	if( obj1 == obj2 ){
		if( index1 == index2 )
			return 0;
		else
			return ( index1 < index2 ) ? -1: 1;
	}
	else{
		var that = this;
		function isNeighborBlock( ob1,idx1, ob2, idx2 ){
			//end of block1 and start of block2 ?
			var endBlock = that.getEndOfBlock(ob1, idx1);
			var startBlock = that.getStartOfBlock(ob2, idx2);
			return ( startBlock && endBlock && endBlock == startBlock.previous());
		}
		//check neighbor block
		if( isNeighborBlock( obj1,index1,obj2,index2) 
				|| isNeighborBlock( obj2,index2,obj1,index1) )
			return 0;
		
		function indexOf( ob1, ob2 ){
		//ob2 is descendants of obj1?
		//if it is , return the index
		//else return -1;
			var p = ob2.parent;
			while( p && ob1 != p )
			{
				ob2 = p;
				p = ob2.parent;
			}
			if( ob1 == p  ){
				return p.container.indexOf( ob2 );
			}
			else{
				return -1;
			}
		}
		//obj1 contains obj2 ??
		var index = indexOf(obj1,obj2);
		if( index>=0 ){
			return writer.util.ModelTools.compare( obj1, index1, obj1, index );
		}
		//obj2 contains obj1 ??
		index = indexOf(obj2,obj1);
		if( index>=0 ){
			return writer.util.ModelTools.compare( obj2, index, obj2, index2 );
		}
		//use index Of block container to compare
		var container;
		if( ( obj1.parent == obj2.parent ) && obj1.parent ){
		//in a cell/textbox/document
			container = obj1.parent;
		}
		else
			container = writer.util.ModelTools.getDocument( obj1 );
		index1 = indexOf( container, obj1 );
		index2 = indexOf( container, obj2 );
		return writer.util.ModelTools.compare( container, index1, container, index2 );
	}
	
},
/********************************************************
 * Field part
 */
getBookMark: function( anchor ){
	
	var bm;
	if( pe.lotusEditor.paraCache ){
	//check from editor
		for( var id in pe.lotusEditor.paraCache ){
			if(  pe.lotusEditor.paraCache[id].bookMarks )
				bm = pe.lotusEditor.paraCache[id].bookMarks[anchor] ;
				if( bm && bm.name == anchor )
					break;
				else if( bm )//renamed ?
					delete pe.lotusEditor.paraCache[id].bookMarks[anchor];
		}
	}
		
	if( !bm ){
		var doc = window.layoutEngine.rootModel;
		bm = writer.util.ModelTools.getNext( doc, function( model ){
				if( model.modelType == writer.MODELTYPE.BOOKMARK && model.name== anchor )
					return true;
			}, true );
	}
	return bm;
},

/**************************************************************************
 * get bookmarks
 */
getAllBookMarks: function(){
	var bms=[];
	if( pe.lotusEditor.paraCache ){
		
		function getBookmarksFromDoc( doc ){
			function filterFunc( p ){
				 return !!( pe.lotusEditor.paraCache[p.id] && pe.lotusEditor.paraCache[p.id].bookMarks ) ;
			}
			
			var para = writer.util.ModelTools.getNext( doc, filterFunc, true );
			
			while( para ){
				for( var bmId in pe.lotusEditor.paraCache[para.id].bookMarks )
					bms.push( pe.lotusEditor.paraCache[para.id].bookMarks[bmId] );
				para = writer.util.ModelTools.getNext( para, filterFunc, false, doc );
			};
		};
		
		getBookmarksFromDoc( window.layoutEngine.rootModel );
		pe.lotusEditor.relations.forEachHeaderFooter( getBookmarksFromDoc );
		var notesManager = pe.lotusEditor.relations.notesManager;
		if( notesManager ){
			for(var i=0;i< notesManager.footnotes.length;i++){
				getBookmarksFromDoc( notesManager.footnotes[i] );
			}
			for(var i=0;i< notesManager.endnotes.length;i++){
				getBookmarksFromDoc( notesManager.endnotes[i] );
			}
		}
		
	}
	return bms;
},

/**
 * 
 */
createParagraphCache: function( para ){
	if( !pe.lotusEditor.paraCache )
		pe.lotusEditor.paraCache = {};
	if( !pe.lotusEditor.paraCache[ para.id ])
		pe.lotusEditor.paraCache[ para.id ] = {};
	var cache = pe.lotusEditor.paraCache[ para.id ];
		cache.bookMarks = {};
	para.container.forEach( function( run ){
		if( run.modelType == writer.MODELTYPE.BOOKMARK && run.name ){
			cache.bookMarks[ run.name ] = run;
		}
	});
},
/**
 * release cache for paragraph search
 * @param para
 */
releaseParagraphCache: function( para ){
	
	if( pe.lotusEditor.paraCache && pe.lotusEditor.paraCache[para.id] )
		delete pe.lotusEditor.paraCache[para.id];
	
},
/**
 * create field instr text
 */
createFieldInstrTextJson: function( instrText, index, length )
{
	index = index || 0;
	length = length || 1;
	
	if( dojo.isString( instrText ))
	{
		instrText = {
				"space" : "preserve",
				"t" : instrText
			};
	}
	
	var fld = [];
	fld.push( {
		"s" : ""+index,
		"l" : "0",
		"fldType" : "begin",
		"t" : "r",
		"rt" : "fld",
		"id" :  WRITER.MSG_HELPER.getUUID(),
		"style" : {
			"t" : "rPr",
			"preserve" : {
				"noProof" : {}
			}
		}
	});
	fld.push(
		{
			"s" : ""+index,
			"l" : "0",
			"fldType" : "instrText",
			"t" : "r",
			"rt" : "fld",
			"instrText" : instrText,
			"id" : WRITER.MSG_HELPER.getUUID(),
			"style" : {
				"t" : "rPr",
				"preserve" : {
					"noProof" : {}
				}
			}
		}
	);
	fld.push({
		"s" : ""+index,
		"l" : "0",
		"fldType" : "separate",
		"t" : "r",
		"rt" : "fld",
		"id" :  WRITER.MSG_HELPER.getUUID(),
		"style" : {
			"t" : "rPr",
			"preserve" : {
				"noProof" : {}
			}
		}
	});
	fld.push(
			{
			"rsidRPr" : "006E25B5",
			"s" : ""+( index + length ),
			"l" : "0",
			"fldType" : "end",
			"t" : "r",
			"rt" : "fld",
			"id" : WRITER.MSG_HELPER.getUUID(),
			"style" : {
				"t" : "rPr",
				"preserve" : {
					"bCs" : "1",
					"noProof" : {}
				}
			}
	});
	return fld;
},
/**
 * used in bookmark dialog and link dialog
 */
getLineFromSelection: function( selection ){
	var ranges = selection.getRanges();
	var startView = ranges[0].getStartView().obj;
	var line = writer.util.ViewTools.getLine( startView );
	if( !line ){
		var view = startView;
		while( view ){
		//get first line
			var container = view.getContainer && view.getContainer();
			if( container ){
				view = container.getFirst();
				if( writer.util.ViewTools.isLine( view )){
					line = view;
				}
				else
					continue;
			}
			view = null;
		}
	}
	return line;
},

isInDocPara:function(p){
	if (!p)
		return false;
	if( p.modelType != writer.MODELTYPE.PARAGRAPH)
		return false;
	if (!p.parent)
		return false;
	if (p.parent.modelType != writer.MODELTYPE.DOCUMENT)
		return false;
		
	var nonFuncSet =  this.isInHeaderFooter(p) || this.isInNotes(p) 
					|| this.inTable(p) || this.inTextBox(p)
					|| this.isInToc(p) ;	
					
 	if (nonFuncSet)
		return false;
		
	return true;
},

isInDocTable:function(p){
	if (!p)
		return false;
	if(this.isTableinTable(p))
		return false;
	if(this.getTable(p) && this.getTable(p).parent && (this.getTable(p).parent.modelType != writer.MODELTYPE.DOCUMENT))
		return false;		
	return true;
},
getAllNonSplitedView:function(model){
	var allViews = model.getAllViews();
	var firstView;
	for(var ownerId in allViews){
		var viewers = allViews[ownerId];
		firstView = viewers.getFirst();
		if(viewers.next(firstView)) return false;
	}
	return firstView;	
}
/**
 * End 
 */
};
//common.tools.extend( writer.util.ModelTools, writer.util.Walker);