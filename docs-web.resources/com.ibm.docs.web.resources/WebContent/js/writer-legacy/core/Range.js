dojo.provide("writer.core.Range");
dojo.require("writer.util.RangeTools");
dojo.require("writer.common.RangeIterator");
dojo.require("writer.util.SectionTools");
dojo.declare("writer.core.Range",
null, {
/*
 * start is an object with two members 'obj' and 'index', this is for view
 */
_start: null,
/*
 * end is an object with two members 'obj' and 'index', this is for view
 */
_end: null,

/**
 * _startModel is an object with two members 'obj' and 'index', this is for model
 */
startModel: null,
/**
 * _startModel is an object with two members 'obj' and 'index', this is for model
 */
endModel: null,

/*
 * utils
 */
modelTools:  writer.util.ModelTools,

/*
 * rootView
 */
rootView: null,

//TODO: not all view range and model range match. So, we need to write a function to convert from view to model
/**
 * view is an object with two members 'obj' and 'index'
 */
_viewToModel : function(view){
	if (!view || !view.obj){
		console.log("WARNING:unknown range start or end");
		return null;
	}
	if (!view.obj.model){
		if( writer.util.ViewTools.isLine( view.obj ))
		{//line, only in \r , empty line
			var paraView = view.obj.parent, 
				m = paraView.model,
				viewers = m.getViews( paraView.ownerId ), 
				index = 0, 
				viewer = viewers && viewers.prev( paraView );
			
			while( viewer )
			{
				var line = viewer.lines.getLast();
				var lastRun = line && line.container.getLast();
				if( lastRun )
				{
					index +=lastRun.start + lastRun.len;
					break;
				}	
				else
				{
					index++;
					viewer = viewers.prev( viewer );
				}
			}
			return { 'obj': m, 'index': index };
		}
		else
		{
//			console.log("WARNING:unknown model for view");
			return null;
		}
	}
	try{
		var obj = view.obj.model, index = view.index || 0 ;
		var viewers = view.obj.getViews();
		if( viewers && obj.modelType ==  writer.MODELTYPE.TEXT ){
			var viewer = viewers.prev( view.obj );
//			if(!viewers.contains(view.obj))
//				debugger;
			
	    	while(viewer ){
	    		index += viewer.len;
	    		viewer = viewers.prev( viewer );
	    	}	
		}else if(writer.util.ViewTools.isCell(view.obj)){
			var index = view.index;
			if(index==0){
				var targetPara = view.obj.getContainer().getFirst();
				var modelIndex = targetPara.container.getFirst().start;
			}else{
				var targetPara = view.obj.getContainer().getLast();
				var lastRun = targetPara.container.getLast();
				var modelIndex =  lastRun.start + lastRun.len;
			}
			return {"obj":targetPara.model,"index":modelIndex};
		}else if(writer.util.ViewTools.isRow(view.obj)){
			//temp solution. there is more better solution, it will be removed;
			var allViewers = view.obj.getViews();
			if(view.obj!=allViewers.getFirst()){
				this.isSplited = true;
			}
			return {"obj":view.obj.model,index:view.index};
		}else if(writer.util.ViewTools.isTable(view.obj)){
			var row = view.obj.getItemByIndex(view.index);
			if(row){
				var index = row.model.getRowIdx();
			}else{
				var index = view.obj.model.rows.length();
			}
			return {"obj":view.obj.model,index:index};
		}
		else{ 
			var viewer =  viewers.prev( view.obj );
			while( viewer ){
				index += viewer.getContainer().length();
				viewer =  viewers.prev( viewer );
			}
		}
	} catch( e ){
		console.error( 'model maybe have been deleted');
	}
	
	return { 'obj': obj, 'index': index };
},

_modelToView : function( pos ){
	return writer.util.RangeTools.toViewPosition(pos.obj, pos.index , this.rootView );
},
/**
 * @param start
 * @param end
 * @param rootView
 */
constructor: function(start, end, rootView ) {
	if( !start || !end || !start.obj || !end.obj ){
		console.error('wrong parameters in range\'s constructor');
	}
	//init rootView
	var vTools = writer.util.ViewTools;
	if( rootView )
		this.rootView = rootView ;//use view of document instend model
	else if( start.obj.getViewType )
	{
		if (vTools.isTextBox(start.obj))
		{
			this.rootView = vTools.getTextBox(start.obj.getParent()) || vTools.getDocument(start.obj);
		}
		else
		{
			this.rootView = vTools.getTextBox(start.obj) || vTools.getDocument( start.obj );
		}
	}
	else
		this.rootView = pe.lotusEditor.layoutEngine.rootView;
	
	if( start.obj.modelType  )
		this.setStartModel(start.obj, start.index );
	else
		this.setStartView( start );
	
	if( end.obj.modelType )
		this.setEndModel(end.obj, end.index );
	else
		this.setEndView(end);

},

clone: function(){
	return new writer.core.Range( this.startModel, this.endModel, this.rootView );
},

isCollapsed: function(){
	if( this._start && this._end )
		return this._start.obj == this._end.obj && this._start.index == this._end.index;
	else
		return this.startModel.obj == this.endModel.obj && this.startModel.index == this.endModel.index;
},

collapse: function( toStart ){
	if( toStart ){
		this._end = this._start;
		this.endModel = this.startModel;
	}else{
		this._start = this._end;
		this.startModel = this.endModel;
	}
},

getStartView: function(){
	if( !this._start && this.startModel  )
	{
		this._start = this._modelToView( this.startModel );
		if( this._start && this._start.index == null )
			 this._start.index = 0;
	}
	return this._start;
},
getEndView: function(){
	if( !this._end && this.endModel  )
		this._end = this._modelToView( this.endModel );
	return this._end;
},

getRootView: function(){
	return this.rootView;
},

setRootView: function(rootView){
	this.rootView = rootView;
},

setStartView: function( start, index ){
	if( index == null && start.obj){
		this._start = start;
	}else{
		this._start = {'obj': start, 'index': index};
	}
	this.startModel = this._viewToModel(this._start);
},

setEndView: function( end, index ){
	if( index == null && end.obj){
		this._end = end;
	}else{
		this._end = {'obj': end, 'index': index };
	}
//	this._setEndViewOwnerId();
	this.endModel = this._viewToModel(this._end);
},

/*
 * start can be model or view 
 */
setStart: function( obj, index ){
	if( obj.modelType  )
		this.setStartModel( obj, index );
	else
		this.setStartView( obj, index );
},

/*
 * end can be model or view 
 */
setEnd: function( obj, index ){
	if( obj.modelType  )
		this.setEndModel( obj, index );
	else
		this.setEndView( obj, index );
},
/**
 * 
 * @param obj start model object
 * @param index start model index
 * @param pageLimit start view limit, optional param, used for header/footer, the viewLimit is 
 * the page view for the header/footer.
 */
setStartModel: function( obj, index ){
	if( index == null && obj.obj )
		this.startModel = obj;
	else
		this.startModel = {'obj': obj, 'index': index };
	this._start = null;
//	this._start = this._modelToView( this.startModel );
},

setEndModel: function( obj, index ){
	if( index == null && obj.obj )
		this.endModel = obj;
	else
		this.endModel = {'obj': obj, 'index': index };
	this._end = null;
//	this._end = this._modelToView( this.endModel );
},

getStartModel: function(){
	return this.startModel;
},

_getParaPos: function( pos, bEnd ){
	var obj = pos.obj;
	var index = pos.index;
	
	if( obj.modelType && obj.modelType == 'paragraph' ){
		return pos;
	}
	else if( this.modelTools.isRun(obj) || this.modelTools.isAnchor(obj) || this.modelTools.isInlineObject(obj) ){
		return { "obj": this.modelTools.getParagraph( obj ), "index":  index = obj.start + index };
	}
	else{
		var container = obj.getContainer && obj.getContainer();
		if( !container )
			return null;
		var child = container.getByIndex( index );
		if( !child )
		{
			child = container.getLast();
			if( !child )
				return null;
			if( child.modelType == 'paragraph')
				return {"obj": child, "index": child.getLength()};
			else
				return this._getParaPos({"obj": child,"index":  child.getContainer && ( child.getContainer().length())});
		}
		else
		{
			//For getEndParaPos in cells, should return the last paragraph length of the last selected cell.
			if( bEnd )
			{// end position
				child = container.getByIndex( index - 1 );
				try{
					return this._getParaPos( {"obj":child,"index": child.getContainer().length() } );
				}catch(e){
					return this._getParaPos({"obj":child,"index": 0 });	
				}
				
				
			}
			return this._getParaPos({"obj":child,"index": 0 });	
		}		
	}
},

_isAnchorAtPos:function(para, index)
{
	var hint = para.byIndex( index );
	return hint && this.modelTools.isAnchor(hint);
},

getStartParaPos: function(){
	return this._getParaPos( this.getStartModel() ); 
},
getEndParaPos: function(){
	return this._getParaPos( this.getEndModel(), true ); 
},

getEndModel: function(){
	return this.endModel;
},

/**
 * Find the node which fully contains the range.
 * @param includeSelf
 */
getCommonAncestor: function( includeSelf, modelType ){
	var start = this.getStartParaPos(),
	end = this.getEndParaPos();
	if( start && end && start.obj == end.obj ){
		var iStart = start.index <= end.index ? start.index : end.index
				,iEnd =  start.index <= end.index ? end.index : start.index
				,obj = start.obj;
		if( modelType ){
			var hint1 =  obj.byIndex( iStart, true, false), hint2 = obj.byIndex(iEnd, true, true);
			hint1= hint1 && this.modelTools.getParent( hint1,modelType );
			hint2 = hint2 && this.modelTools.getParent( hint2,modelType );
			return ( hint1 == hint2 )? hint1 : null;
		}
		else{
			if( iStart < iEnd  )
			{
				var hint1 = obj.byIndex( iStart )
				, hint2 = (iEnd-1 == iStart ) ? hint1 : obj.byIndex( obj, iEnd-1 );
				if( hint1 == hint2 )
					return hint1;
				else 
					return obj;
			}
			else
			{
				return  obj.byIndex( iStart ) || obj;
			}	
		}
	}
	else
	{ 
		var mTools = this.modelTools;
		var commAncestor = mTools.getParent( start.obj, function( p ){
			return mTools.getParent( end.obj, function( p2 ){
				return p2 == p;
			} );
		})
		if(modelType && commAncestor ){
			if(commAncestor.modelType == modelType) {
				return commAncestor;
			}else
				return this.modelTools.getParent(commAncestor,modelType);
		}
		return commAncestor;
	}
	
},
/**
 * move to position
 * @param start
 * @param index
 */
moveToPosition: function( start, index ){
	if( index == -1 ){
	//Move to end
		if( start.modelType )
			index = writer.util.ModelTools.getLength( start );
		else
			index = writer.util.ViewTools.length( start );
	}
	this.setStart(start, index);
	this.collapse(true);
},
/**
 * move to edit start position of m
 * @param m
 */
moveToEditStart: function( m )
{
	//Model 
	var p;
	if( writer.util.ModelTools.isParagraph(m))
		p = m;
	else
		p =  writer.util.ModelTools.getFirstChild( m, writer.util.ModelTools.isParagraph,true );
	p && this.moveToPosition( p, 0 );
	//TODO:
	//m is view
},
/**
 * move to edit end postion of m
 * @param m
 */
moveToEditEnd: function( m)
{
	//Model 
	var p;
	if( writer.util.ModelTools.isParagraph(m))
		p = m;
	else
		p =  writer.util.ModelTools.getLastChild( m, writer.util.ModelTools.isParagraph,true);
	p && this.moveToPosition( p, -1 );
	//TODO:
	//m is view
},
/**
 * check if the range is from the beginning of a paragraph
 * @returns {Boolean}
 */
isStartOfPara: function()
{
	  var start = this.getStartParaPos();
	  if( !start )
		return false;
		
	  var index = start.index;
	  if(index == 0)
		  return true;
	  return false;
},
/**
 * check if the range is end of a paragraph
 * @returns {Boolean}
 */
isEndofPara: function()
{
	var end = this.getEndParaPos();
	if(!end)
		return false;
	
	var index = end.index;
	if(index == end.obj.text.length)
		return true;
	
	return false;
},

resetView: function(){
	this._start = null ;
	this._end = null;
},

shrink: function(){
//TODO:
},

store: function( msg ){
 //#35276
	var start = this.getStartModel(),
	end = this.getEndModel();
	
	if (!start || !end)
	{
		console.error("range store :: no startModel or endModel")
		return;
	}

	function isInParagraph( obj ){
		return ( !obj.getContainer ) &&  writer.util.ModelTools.isRun( obj );
	}
	if( isInParagraph( start.obj ) ){
		start = this.getStartParaPos();
	}
	if( isInParagraph( end.obj ) ){
		end = this.getEndParaPos();
	}
	
	if (!start || !end)
	{
		console.error("range store :: no startModel or endModel")
		return;
	}
	
	if( msg ){
		function checkDeleteAction(  pos ){
			for(var i = 0; i < msg.updates.length; i++)
			{	
				var act = msg.updates[i];
				if( act.t == WRITER.ACTTYPE.DeleteElement && act.tid == pos.obj.id ){
					var prenext = pos.obj.previous() || pos.obj.next();
					if (prenext)
					{
						pos.obj = prenext;
						pos.index = writer.util.ModelTools.getLength(pos.obj);
					}
				}
			}
		}	
		checkDeleteAction( start );
		checkDeleteAction( end );
	}
	
	if( start.obj && start.obj.id )
		this.start_id = { 'obj': start.obj.id, 'index': start.index } ;

	if( end.obj && end.obj.id )
		this.end_id = {'obj': end.obj.id,'index': end.index };
	
},

isSaved: function(){
	return this.start_id || this.end_id;
},

restore: function(){
	var obj;
	if( this.start_id ){
		obj = this.rootView.model.byId( this.start_id.obj );
		if( !obj )
		{
//			console.error( 'start obj have been removed ');
//			The object maybe deleted by other client
//			Set cursor to the start of document
			var firstChild = this.rootView.model.firstChild();
			firstChild && this.moveToEditStart( firstChild );
			delete this.start_id;
			return this;
		}
		else{
			var len = -1;
			if( this.modelTools.isParagraph( obj ))
			//is paragraph
				len = this.modelTools.getLength( obj);
			else if( obj.getContainer )
			 //is container 
				len = obj.getContainer().length();
			if( len >= 0 && this.start_id.index > len )
				this.start_id.index = len;
			this.setStartModel(obj, this.start_id.index );
			delete this.start_id;
		}
	}
	
	if( this.end_id ){
		obj = this.rootView.model.byId( this.end_id.obj );
		if( !obj )
		{
//			The object maybe deleted by other client
			this.setEndModel(this.rootView.model.lastChild(), 0 );
			delete this.end_id;
			return this;
		}
		
		var len = -1;
		if( this.modelTools.isParagraph( obj ))
		//is paragraph
			len = this.modelTools.getLength( obj);
		else if( obj.getContainer )
		 //is container 
			len = obj.getContainer().length();
		
		if( len >= 0 && this.end_id.index > len )
			this.end_id.index = len;
		this.setEndModel(obj, this.end_id.index );
		delete this.end_id;
	}
	return this;
},

_removeParaSection: function(p, msgs)
{
	var secId = p.directProperty && p.directProperty.getSectId && p.directProperty.getSectId();

	if (secId && "" != secId)
	{
		// remove p id and its section
		writer.util.SectionTools.deleteSection(p,msgs);

		var views = p.getRelativeViews("rootView");
		var paraView = views && views.getFirst();
		if (!paraView)
			console.error("!range->remove paragraph secid: cannot find paragraph view");

		var msg = p.setSectionId(null, true);
		msgs.push(msg);
		dojo.publish(writer.EVENT.UPDATEDELETESECTION,[paraView, secId]);
	}
},

_mergeParaSection: function(p1, p2, msgs)
{
	var secId1 = p1.directProperty && p1.directProperty.getSectId && p1.directProperty.getSectId();
	var secId2 = p2.directProperty && p2.directProperty.getSectId && p2.directProperty.getSectId();

	if ((secId1 && "" != secId1)
		|| (secId2 && "" != secId2))
	{
		// remove p1 id and its section
		writer.util.SectionTools.deleteSection(p1,msgs);

		var views = p1.getRelativeViews("rootView");
		var paraView = views && views.getFirst();
		if (!paraView)
			console.error("!range->merge paragraph: cannot find paragraph view");

		// move p2 secId to p1
		if (secId2 && "" != secId2)
		{
			var msg = p1.setSectionId(secId2, true);
			msgs.push(msg);
			dojo.publish(writer.EVENT.UPDATEINSERTSECTION,[paraView, paraView.directProperty.getSectId()]);
		}
		else
		{
			var msg = p1.setSectionId(null, true);
			msgs.push(msg);
			dojo.publish(writer.EVENT.UPDATEDELETESECTION,[paraView, secId1]);
		}
	}
},

/**
 * delete contents without selecting something
 * @param isBackspace
 * @returns {Array}
 */
deleteAtCursor : function( isBackspace ){
	var tools = writer.util.ModelTools;
	
	var that = this;

	var mergeParagraphs = function( p1, p2, msgs  ){
		if( !p1 || !p2 )
			return;
		
		// Defect 37921 Delete page break/section break
		if(p1.isEndWithPageBreak())
		{
			var index = p1.getLength() - 1, cnt = 1;
			
			var actPair = WRITER.MSG.createDeleteTextAct(index, cnt, para);
			var msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair]);
			msg && msgs.push(msg);
			
			p1.deleteText( index, cnt );
			return;
		}	
		
		p1 = tools.mergeParagraphs( p1, p2, msgs );
		p1.markDirty();
		p2.markDelete();

		// update section
		that._mergeParaSection(p1, p2, msgs);
	};
	//check if the paragrpah contain assigment, which can not be removed
//	if(!writer.util.HelperTools.canTaskDelete()){
//		var nls = dojo.i18n.getLocalization("concord.widgets","CKResource");
//		window.pe.scene.showWarningMessage(nls.coediting.forbiddenInput,10000);
//		return [];
//	}	
	var range = this;
	var msgs = [], msg = null;
	var start = range.getStartParaPos();
	if( !start ) {
		//TODO: delete before image... 
		console.error('delete object: not implimented yet !!');
	}
	else{
		var para = start.obj;
		var index = start.index;
		
		if (isBackspace){
			// try to move cursor left first, and skip the anchor run
			do{
				index--;
			}
			while(index >= 0 && this._isAnchorAtPos(para, index));
			
			if (index > 0) { // avoid breaking hi/lo surrogates
				var chcode = para.text.charCodeAt(index);
				if (chcode >= 0xDC00 && chcode <= 0xDFFF) {
					chcode = para.text.charCodeAt(index-1);
					if (chcode >= 0xD800 && chcode <= 0xDBFF)
						index--;
				}
			}
			
			if (index < 0){
				var paraProperty = para.getDirectProperty();
				var isList = para.isList();
				if( isList && para.getListLevel() > 0){
					// Begin of list and it's not the first level.
					pe.lotusEditor.execCommand("outdent");
					return msgs;
				}
				else{
					var indentLeft = paraProperty.getIndentLeft();
					var indentSpecialVal = paraProperty.getIndentSpecialValue();
					var indentSpecialType = paraProperty.getIndentSpecialType();
					if(!isList && indentLeft == 0 && (indentSpecialVal == 0 || (indentSpecialType != "hanging" && indentSpecialType != "firstLine"))){
						//Begin of normal paragraph
						para = para.previous();
						if( para )
							index = tools.getLength(para);
						else 
							return msgs;
					}
					else
					{	
						// 1. Remove list
						if(isList){
							// Set the paragraph list id to -1.
							msg = para.setList(-1);//removeList(true);
							msg && msgs.push(msg);
							
							if(indentSpecialType == "hanging" || indentSpecialType == "firstLine")
							{
								msg = para.setIndentSpecialTypeValue("none", "none");
								msg && msgs.push(msg);
								
								msg = para.setIndent(indentLeft + "pt");
								msg && msgs.push(msg);
							}	
						}
						else
						{
							if(indentSpecialVal == 0)
								pe.lotusEditor.execCommand("outdent");
							else if(indentSpecialType == "hanging" || indentSpecialType == "firstLine")
							{
								msg = para.setIndentSpecialTypeValue("none", "none");
								msg && msgs.push(msg);
								
								var realIndentLeft = paraProperty.getRealIndentLeft();
								if(realIndentLeft != "none" && realIndentLeft != 0)
									msg = para.setIndent("none");	// Defect 43280								
								else
									msg = para.setIndent(indentLeft + "pt");
								msg && msgs.push(msg);
							}
							else
								pe.lotusEditor.execCommand("outdent");
						}	
						return msgs;
					}
				}
			}
			
			// move cursor left
			if(writer.util.ModelTools.isParagraph(para)){
				range.moveToPosition(para, index);
			}else{
				if(writer.util.ModelTools.isTOC(para)){
					var lastPara = writer.util.ModelTools.getLastChild(para,writer.util.ModelTools.isParagraph,true);
					range.moveToPosition(lastPara, writer.util.ModelTools.getLength(lastPara));
					range.collapse();
					pe.lotusEditor.getSelection().selectRanges([range]);
				}
			}
			
		}
		
		// check if next run is anchor
		if(!writer.util.ModelTools.isParagraph(para)){
			return msgs;
		}
		while(index < para.text.length && this._isAnchorAtPos(para, index))
		{
			index++;
		}
		
		if ( index == para.text.length ){
			//end of paragrpah	
			if( writer.util.ModelTools.isEmptyParagraph( para ) && !para.isList())
			{
				//do not delete empty paragraph after table/textbox/toc... 
				//if at the end of Document
				var next = para.next(), donotDel;
				if( !next )
				{
					var prev = para.previous();
					if( prev )
					{
						switch( prev.modelType )
						{
							case writer.MODELTYPE.TOC:
							case writer.MODELTYPE.TABLE:
							case writer.MODELTYPE.TBTXBX:
								donotDel = true;
						}
					}
					else{
						donotDel = true;
						msgs = msgs.concat( para.removeBookmarks(0 ));
					}
				}
				//DONT delete  para at task boundary
//				if(next&&next.getTaskId&&(next.getTaskId()!=para.getTaskId()))
//					donotDel = true;
				(!donotDel) && writer.util.ModelTools.removeBlock( para , this, msgs );
			}
			else {
				var next = para.next();
				var donotDel = false;
				//DONT delete  para at task boundary
//				if(next&&next.getTaskId&&(next.getTaskId()!=para.getTaskId()))
//					donotDel = true;
				(!donotDel) && mergeParagraphs( para, para.next(), msgs);
			}
		}
		
		else if( index >=0 ){
			// delete key deletes a GC while backspace key still delete char one by one
			var cnt = 1;
			if (!isBackspace) {
				var cbs = this.modelTools.getCharBoundaries({obj:para, index:index});
				if (cbs.end > cbs.start) {
					index = cbs.start;
					cnt = cbs.end - cbs.start;
				}
			} else {
				// backspace key, check hi/lo surrogate
				var charcode = para.text.charCodeAt(index);
				if (charcode >= 0xdc00 && charcode <= 0xDFFF && index > 0) { // lo surrogate
					charcode = para.text.charCodeAt(index-1);
					if (chcode >= 0xD800 && chcode <= 0xDBFF) {
						index -= 1; cnt = 2;
					}
				} else if (charcode >= 0xd800 && charcode <= 0xDBFF) {
					charcode = para.text.charCodeAt(index+1);
					if (charcode >= 0xdc00 && charcode <= 0xDFFF)
						cnt = 2;
				}
			} 
			var actPair = WRITER.MSG.createDeleteTextAct(index, cnt, para);
			var emptyRun, prev;
			if( isBackspace  ){
				var curRun = para.byIndex( index );
				if( curRun && curRun.length == cnt && curRun.isTextRun && curRun.isTextRun()){
					emptyRun = curRun.clone();
					emptyRun.length = 0;
					prev = curRun.previous();
				}
			}
			para.deleteText( index, cnt );
			if( emptyRun ){
				var curRun = para.byIndex( index );
				if( curRun && curRun.length == 0 && curRun.isTextRun && curRun.isTextRun()){
					curRun.isStyleRun = true;
				}
				else
				{//if there is not empty run ( when paragraph is empty , will filled with empty text run )
					emptyRun.isStyleRun = true;
					para.hints.insertAfter( emptyRun, prev );
					emptyRun.markInsert();
					this.setStartModel(emptyRun, 0 );
					this.collapse(true);
					para.markDirty();
				}
			}
			
			msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair]);
			msg && msgs.push(msg);
		}
		
	}
	//append the comment del msg
	var cmtMsgs = pe.lotusEditor.relations.commentService.checkCommentsDelete();
	if(cmtMsgs.length>0)
		msgs = msgs.concat(cmtMsgs);
	
	return msgs;
},

/**
 * If the range selection start in table will return the selection rows/columns.
 * Else will return null;
 * @returns
 */
_getRowColumn: function(selModel, selIndex, isEnd)
{
	var selTable = null, rowIdx, columnIdx;

	var modelTools = writer.util.ModelTools;
	if(modelTools.isCell(selModel))
	{
		var row = selModel.parent;
		selTable = row.parent;
		rowIdx = row.getRowIdx();
		columnIdx = selModel.getColIdx();
	}
	else if(modelTools.isRow(selModel))
	{
		selTable = selModel.parent;
		rowIdx = selModel.getRowIdx();
//		columnIdx = selIndex;
		var idx = isEnd ? (selIndex > 0 ? (selIndex - 1) : 0 ) : selIndex;
		var cell = selModel.getItemByIndex(idx);
		columnIdx = cell.getColIdx();	// Defect 40720
		if(isEnd){
			columnIdx += cell.getColSpan();
//			columnIdx++;
		}
			
	}
	else if(modelTools.isTable(selModel))
	{
		selTable = selModel;
		rowIdx = isEnd ? selIndex - 1 : selIndex;
		columnIdx = 0;
	}
	else
	{
		var startCell = modelTools.getCell(selModel);
		if(startCell)
		{
			// In cell
			var row = modelTools.getRow(startCell);
			selTable = row.parent;
			rowIdx = row.getRowIdx();
			columnIdx = startCell.getColIdx();
		}
		else if(modelTools.isBlock(selModel) && !modelTools.isParagraph(selModel) )
		{
			// In table's parent. like table in table, body, text box etc.
			var selectedObj = selModel.getByIndex(selIndex);
			if(modelTools.isTable(selectedObj))
			{
				selTable = selectedObj;
				rowIdx = 0;
				columnIdx = 0;
			}	
		}	
	}	
	
	return selTable == null ? null : {"selTable":selTable, "rowIndex":rowIdx, "columnIndex": columnIdx};
},

getStartRowColumn: function()
{
	var startModel = this.getStartModel();
	return this._getRowColumn(startModel.obj, startModel.index);
},

/**
 * If the range selection end in table will return the selection rows/columns.
 * Else will return null;
 */
getEndRowColumn: function()
{
	var endModel = this.getEndModel();
	return this._getRowColumn(endModel.obj, endModel.index, true);
},
/**
 * get selected object 
 * if selected one drawing object
 */
getSelectedObject: function(){
	var startObj = this.getStartModel().obj, startIndex = this.getStartModel().index;
	var endObj = this.getEndModel().obj, endIndex = this.getEndModel().index;
	
	if( startObj == endObj && this.modelTools.isDrawingObj( startObj) 
			&& startIndex ==0  ){
		var len = ( startObj.getContainer && startObj.getContainer().length()) || startObj.length ;
		if( endIndex == len ){
			return startObj;
		}
	}
	return null;
},
/**
 * 
 * @param ignoreTableBoundary is true will not extract start/end table in range. But will extract whole selected table.
 * @returns
 */
extractContents: function(styleFilterFunc, ignoreTableBoundary, limitedCount)
{
	var modelTools = writer.util.ModelTools;

	if( this.isCollapsed() )
		return null;
	
	var range = this.clone();
	
	function enLargeStartToBlock( r ){
		var startM = r.getStartModel(),
			obj = startM.obj,
			p = obj.parent,
			index = startM.index;
		if( p == null )
			return r;

		if ( modelTools.isTextBox(p)|| modelTools.isCanvas(p) || p.modelType == writer.MODELTYPE.CELL )
			return r;
		
		if( index == 0 ){
			if( obj.paragraph && obj.start!=null )
				r.setStartModel( obj.paragraph, obj.start );
			else
				r.setStartModel( p, p.getContainer().indexOf( obj ) );
			return enLargeStartToBlock( r );
		}
		else
			return r;
	}
	
	enLargeStartToBlock( range );
	
	function enLargeEndToBlock( r ){
		var endM = r.getEndModel(),
			obj = endM.obj,
			index = endM.index,
			p = endM.obj.parent;
		if( p == null )
			return r;

		if ( modelTools.isTextBox(p)|| modelTools.isCanvas(p) || p.modelType == writer.MODELTYPE.CELL )
			return r;
		
		if( obj.paragraph && index == obj.length ){
			r.setEndModel( obj.paragraph, obj.start + index  );
			return enLargeEndToBlock( r );
		}
		else if( ( obj.getContainer  && (index == obj.getContainer().length())) ||
			(obj.modelType == writer.MODELTYPE.PARAGRAPH && index == obj.getLength()) ){
			r.setEndModel( p, p.getContainer().indexOf( obj )+1 );
			return enLargeEndToBlock( r );
		}
		return r;
	}
	
	enLargeEndToBlock( range );
	
	var selectedOneDrawingObj = range.getSelectedObject();
	
	var start = this.getStartParaPos();
	var end = this.getEndParaPos();
	
	var startModel = start.obj;
	var endModel = end.obj;
	var startIndex = start.index;
	var endIndex = end.index;
	
	var it = new writer.common.RangeIterator( range, limitedCount );
	var c = it.nextBlock(),next;
	var firstObj = c;
	var result = [], jsonObject;
	while( c ){
		next = it.nextBlock();
		//extract styles
		styleFilterFunc && styleFilterFunc( c );
		if( c == startModel && startModel == endModel ){
			var wholeParagraph = !!(c.modelType == writer.MODELTYPE.PARAGRAPH && startIndex ==0 && (endIndex >= c.getLength()) && !selectedOneDrawingObj );
			var selectOneObject = false;
			
			if( wholeParagraph && c.modelType == writer.MODELTYPE.PARAGRAPH && endIndex - startIndex == 1 ){
			//select only one object 
				var obj = c.byIndex( startIndex );
				while( obj && obj.length == 0 )
					obj = obj.next();
				if( obj && obj.start == startIndex && obj.length == 1 && obj.modelType != writer.MODELTYPE.TEXT)
					selectOneObject = true;
			}
			if( !selectOneObject && wholeParagraph )
				jsonObject = c.toJson( startIndex, null, true );
			else
				jsonObject = c.toJson( startIndex, endIndex - startIndex );
			result.parentJson = c.toJson(0, null,true );
		}
		else if( c == startModel && c.modelType == writer.MODELTYPE.PARAGRAPH){
			jsonObject = c.toJson( startIndex, null, true );
		}else if ( c == endModel && c.modelType == writer.MODELTYPE.PARAGRAPH){
			jsonObject=  c.toJson( 0, endIndex, true );
		}else if(ignoreTableBoundary && c.modelType == writer.MODELTYPE.ROW){
			jsonObject = null;	// Table row
		}
		else if(ignoreTableBoundary && c.modelType == writer.MODELTYPE.TABLE){
			if(c == firstObj || !next)	// Ignore the first and last table
				jsonObject = null;
			else
				jsonObject =  c.toJson();
		}
		else if ( c.toJson ){
			if(c.modelType == writer.MODELTYPE.PARAGRAPH)
				jsonObject =  c.toJson( 0, null, true );
			else
				jsonObject =  c.toJson();
		}
		else
		{
			console.error( "Need implement the function toJson for model: "+ c.modelType );
			jsonObject = null;
		}
		jsonObject && result.push( jsonObject );
		c = next;
	}
	return result;
},

deleteContents: function( bReturnMsg, merge, options){	
	if( this.isCollapsed() )
		return [];
	if (!options)
		options = {};
	//check if the contents contain assigment, which can not be removed
//	if(!writer.util.HelperTools.canTaskDelete()){
//		var nls = dojo.i18n.getLocalization("concord.widgets","CKResource");
//		window.pe.scene.showWarningMessage(nls.coediting.forbiddenInput,10000);
//		return [];
//	}
	
	function filter( p ){
		var mt = writer.MODELTYPE;
		switch(p.modelType)
		{
		case mt.PARAGRAPH:
		case mt.TOC:
		case mt.TABLE:
		case mt.ROW:
			return true;
			
		default: 
			return false;
		}
		return false;
	}
	
	var start = this.getStartParaPos();
	var end = this.getEndParaPos();
	
	var startModel = start.obj;
	var endModel = end.obj;
	var startIndex = start.index;
	var endIndex = end.index;
	var range = this;
	
	var startTable = writer.util.ModelTools.getParent( startModel, writer.MODELTYPE.TABLE );
	var endTable = writer.util.ModelTools.getParent( endModel, writer.MODELTYPE.TABLE );
	var startRow = writer.util.ModelTools.getParent( startModel, writer.MODELTYPE.ROW );
	if(startRow){
		var startCelll = writer.util.ModelTools.getParent( startModel, writer.MODELTYPE.Cell )||startRow.cells.getByIndex(startIndex);
	}
	var endRow = writer.util.ModelTools.getParent( endModel, writer.MODELTYPE.ROW );
	if(endRow){
		var endCell = writer.util.ModelTools.getParent( endModel, writer.MODELTYPE.Cell )||endRow.cells.getByIndex(endIndex);
	}
	if( startTable && (startTable == endTable ) )
	{ //In same table, only delete text and object in the cell, such as the nested table.
		filter =  function(model){
			if(writer.util.ModelTools.isParagraph(model)||writer.util.ModelTools.isTable(model)){
				return true;
			}
			return false;
		};
	}
	
	var it = new writer.common.RangeIterator( range );
	var sobj = this.getStartModel().obj;

	var c = it.nextModel( filter ),next;
	var result = [], removeStart, removeEnd;
	if(sobj.modelType == writer.MODELTYPE.TOC){
		if ( sobj.toJson ){
			var nmodel = writer.util.ModelTools.getNext( sobj, filter );
			removeBlock( sobj, nmodel );
			removeStart = true;
			while(c.parent.modelType==writer.MODELTYPE.TOC)
				c = it.nextModel( filter );
		}
	}
	function removeBlock( c, next )
	{
		if(  c.modelType == writer.MODELTYPE.PARAGRAPH ){
		//remove right bookmark
			result = result.concat( c.removeBookmarks( c.text.length ) );
		}
		
		if( !bReturnMsg )
			result.push( c.toJson( 0, null, true ));
		else 
			writer.util.ModelTools.removeBlock( c , (next) ? null: range, result );
		if( c == endModel || c == startModel )
			merge = false;
		if( !removeStart ) removeStart = ( c == startModel );
		if( !removeEnd ) removeEnd = ( c== endModel );
	}
	
	function deleteText( c, idx1, idx2)
	{
		if (!options.keepBookmark)
		{
			if( c.removeBookmarks ){
				result = result.concat( c.removeBookmarks( idx1 ) );
				if( idx2!= (idx1+1) )
					result = result.concat( c.removeBookmarks( idx2 ) );
			}
		}
		var len = idx2 - idx1;
		if( !bReturnMsg )
			result.push( c.toJson( idx1,  len ));
		else
			WRITER.MSG.addDeleteMsg( c,idx1, idx2, result);
		c.deleteText( idx1, len );
	}
	var startInTable = writer.util.ModelTools.getTable(startModel);
	if(startInTable){
		var previousBlock = startInTable.previous();
	}
	var endInTable   = writer.util.ModelTools.getTable(endModel);
	if(endInTable){
		var nextBlock = endInTable.next();
	}
	var deletedTbl = [];
	var tableChanaged = false;
	while( c ){
		
		next = it.nextModel( filter );
		if( c == startModel && startModel == endModel ){
			deleteText( c, startIndex, endIndex );
		}
		else if( c == startModel && c.modelType == writer.MODELTYPE.PARAGRAPH){
			if( startIndex == 0 )
				removeBlock( c, next );
			else
				deleteText( c, startIndex, c.text.length );
		}else if ( c == endModel && c.modelType == writer.MODELTYPE.PARAGRAPH){
			if(endIndex == c.text.length && !next && !c.previous())
				deleteText( c, 0, endIndex );
			else if( endIndex >= c.text.length )
				removeBlock( c, next );
			else
				deleteText( c, 0, endIndex );
		}else if(c.modelType==writer.MODELTYPE.ROW){
			var rows = [];
			rows.push(c);
			while(next&&next.modelType==writer.MODELTYPE.ROW){
				rows.push(next);
				next = it.nextModel( filter );
			}
			var deleteTbl = function(table,rows){
				tableChanaged = true;
				if(rows.length == table.rows.length()){
					removeBlock( table );
					deletedTbl.push(table);
				}else{
					var acts = pe.lotusEditor.getPlugin("Table").deleteRow(rows,true);
					var tableId = table.id;
					result.push(WRITER.MSG.createTableMsg(tableId,acts));
				}
			};
			var currTable = rows[0].parent;
			var startTable = currTable;
			var toDelRows = [];
			for(var i=0;i<rows.length;i++){
				if(rows[i].parent == currTable ){
					toDelRows.push(rows[i]);
				}else{
					deleteTbl(currTable,toDelRows);
					toDelRows = [];
					toDelRows.push(rows[i]);
					currTable = rows[i].parent;
				}
			}
			if(currTable&&toDelRows.length>0){
				deleteTbl(currTable,toDelRows);
			}
		}		
		else if ( c.toJson ){
			removeBlock( c, next );
		}
		else
			console.error( "Need implement the function toJson for model: "+ c.modelType );
		//
		c = next;
	}
	if(tableChanaged&&(startInTable||endInTable)){
		if(startInTable&&endInTable ){
			if(startInTable!=endInTable){
				if(deletedTbl.indexOf(startInTable)==-1){
					var lastRun = writer.util.ModelTools.getLastChild(startInTable,writer.util.ModelTools.isRun,true);
				}else if(deletedTbl.indexOf(endInTable)==-1){
					var firstRun = writer.util.ModelTools.getFirstChild(endInTable,writer.util.ModelTools.isRun,true);
				}else{
					if(previousBlock){
						var lastRun = writer.util.ModelTools.getLastChild(previousBlock,writer.util.ModelTools.isRun,true);
					}else if(nextBlock){
						var firstRun = writer.util.ModelTools.getFirstChild(nextBlock,writer.util.ModelTools.isRun,true);
					}else{
						var lastRun = writer.util.ModelTools.getLastChild(startInTable.parent,writer.util.ModelTools.isRun,true);
					}	
				}
			}else{
				var firstCell = writer.util.ModelTools.getCell(startModel);
				firstRun = firstCell&&writer.util.ModelTools.getFirstChild(firstCell,writer.util.ModelTools.isRun,true);
			}	
		}else if(endInTable){
			if(deletedTbl.indexOf(endInTable)==-1){
				var firstRun = writer.util.ModelTools.getFirstChild(endInTable,writer.util.ModelTools.isRun,true);
			} else if(nextBlock){
				var firstRun = writer.util.ModelTools.getFirstChild(nextBlock,writer.util.ModelTools.isRun,true);				
			}else{
				var firstRun = writer.util.ModelTools.getFirstChild(endInTable.parent,writer.util.ModelTools.isRun,true);
			}
		}else {
			if(deletedTbl.indexOf(startInTable)==-1){
				var lastRun = writer.util.ModelTools.getLastChild(startInTable,writer.util.ModelTools.isRun,true);
			}else if(previousBlock){
				var lastRun = writer.util.ModelTools.getLastChild(previousBlock,writer.util.ModelTools.isRun,true);
			}else{
				var lastRun = writer.util.ModelTools.getLastChild(startInTable.parent,writer.util.ModelTools.isRun,true);
			}
		}
		if(!lastRun && !firstRun){
			var doc = endInTable&&endInTable.parent||startInTable&&startInTable.parent;
			var firstRun = writer.util.ModelTools.getFirstChild(doc,writer.util.ModelTools.isRun,true);
		}
		if(lastRun){
			range.setStartModel(lastRun, writer.util.ModelTools.getLength(lastRun));
		}else if(firstRun){
			range.setStartModel(firstRun, 0);
		}
	}else if (startRow==endRow && startRow && startCelll != endCell) {
		range.moveToEditStart(startCelll);
	}else{
		if( startModel != endModel && merge )
		{ //merge startModel and endModel
			var msgs;
			if( bReturnMsg) 
				msgs = result;
			startModel = writer.util.ModelTools.mergeParagraphs( startModel, endModel, msgs );

			// update section
			this._mergeParaSection(startModel, endModel, msgs);
		}
		if( !removeStart )
		{
			var msgs;
			if( bReturnMsg) 
				msgs = result;

			range.setStartModel(startModel, startIndex);
			if (startModel != endModel && !merge)
				this._removeParaSection(startModel, msgs);
		}
		else if ( !removeEnd )
			range.setStartModel(endModel, 0);
	}
	range.collapse(true);
	//append the comment del msg
	var cmtMsgs = pe.lotusEditor.relations.commentService.checkCommentsDelete();
	if(cmtMsgs.length>0)
		result = result.concat(cmtMsgs);
	//
	return result;
	//...
}
});