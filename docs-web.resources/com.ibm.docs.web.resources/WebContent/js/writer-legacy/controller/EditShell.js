dojo.provide("writer.controller.EditShell");

dojo.require("writer.controller.DrawShell");
dojo.require("writer.controller.Cursor");
dojo.require("writer.controller.Selection");

dojo.require("writer.util.RangeTools");

//read only constant
EDITMODE = {
	EDITOR_MODE: 0,
	HEADER_FOOTER_MODE: 1,
	FOOTNOTE_MODE:2,
	ENDNOTE_MODE:3
};

dojo.declare("writer.controller.EditShell", [
writer.controller.DrawShell], {
	_mode: EDITMODE.EDITOR_MODE,
	
	_selection: null,
	
	_renderParam: null,
	
	getSelection: function(){
		if( this.view()){
			if (!this._selection)
				this._selection = new writer.controller.Selection({ shell: this}); 
			return this._selection;
		}
	},
	
	getInputPos: function(){
		return this.getSelection().getInputPos();
	},
	/*
	 * return maybe text or object
	 * return value : {'line': line,'point': point, 'obj': run,'index':index };
	 *
	 */
	pickAnything: function( point ){
		this.itemByPoint(point.x,point.y);
		// Select no paragraph text box the path should not include run.
		var sel = this.getSelectedIdx();
		var run, line;
		if(sel.index == undefined )
		{
			run = sel;
			line = run.parent;
			sel = {};
			sel.index = 0;
		}	
		else
		{
			run = this.getSelectedRun();
			line= this.getSelectedLine();
		}	
		var fixedX = this.basePoint.x;
		var fixedY = this.basePoint.y;
		if( !run ){
		 //Create empty paragraph and set cursor to it
			console.log('create empty paragraph');
		
		}
		else{
			return {'line': line,'point': {x:fixedX,y:fixedY}, 'obj': run,'index':sel.index, 'isInside':sel.isInside };
		}
	},
	/**
	 * mouse down  event will call this function to begin selecting ( set selecting status ) 
	 * @param target
	 * @param x
	 * @param y
	 * @param isCtrl
	 * @param isShift
	 */
	beginSelect: function(target, x, y, isCtrl, isShift, onBoundary)
	{
		//#38724
		if( this.getSelection().isSelecting() )
			return this.endSelect(target, x, y, isCtrl, onBoundary);
		
		this.clearScrollTimer();
		
		var point = this.screenToClient({'x': x,'y': y });
		var ret = this.pickAnything(point);
		if( ret )
		{
			var sel = this.getSelection();
			if(isShift && !isCtrl)	// SHIFT 
			{
				sel.selectTo(ret, onBoundary);
			}
			else if( !isShift && isCtrl ) // CTRL
			{
				this.selectParagraph(target, x, y); 	// this.selectParagraph(ret);
			}
			else  // Normal or SHIFT + CTRL
			{
				// select drawingObj
				var vTools = writer.util.ViewTools;
				if (0 == ret.index && vTools.isDrawingObj(ret.obj))
				{
					if (vTools.isInlineDrawingObj(ret.obj))
					{
						 if (ret.isInside)
						 {
						 	var retEnd = {"obj": ret.obj, "index": 1};
							sel.select(ret, retEnd);
						 }
						 else
						 	sel.beginSelect(ret,  onBoundary);
					}
					else
					{
						var retEnd = {"obj": ret.obj, "index": 1};
						sel.select(ret, retEnd);
					}
				}
				else
					sel.beginSelect(ret,  onBoundary);
			}
		}
		else
			console.log('click in none in beginSelect');
	},
	/**
	 * mouse move event call this function to change selection( in selecting status )
	 * @param target
	 * @param x
	 * @param y
	 * @param isCtrl
	 */
	moveSelect: function(target, x, y, isCtrl, onBoundary)
	{
		var sel = this.getSelection();
		this.clearScrollTimer();
		if( sel.isSelecting() )
		{
			var that = this;
			function renderSelect( nx, ny ){
				var point = that.screenToClient({'x': nx,'y': ny });
				var ret = that.pickAnything(point);
				if(ret)
				{
					try{
						if( sel.isSelecting() ){
							sel.selectTo(ret, onBoundary);
						}
					}catch( e ){
						console.error("error in moveSelect");
					}
				}
			};
			if( this._mode == EDITMODE.EDITOR_MODE )
			{ //
				var scrollH = 50, nscroll = 0;
				var editorwin = pe.lotusEditor.getWindow();
				var scale = pe.lotusEditor.getScale();
				if( y >= ( editorwin.innerHeight-scrollH )/scale )
					nscroll = scrollH;
				else if( y <= scrollH )
					nscroll = -scrollH;
				if( nscroll ){
					 function proc() {
						var scrollTop = pe.lotusEditor.getScrollPosition();
						pe.lotusEditor.layoutEngine.rootView.render(scrollTop);
						editorwin.scrollBy( 0, nscroll );
						y += nscroll;
						renderSelect( x,y); 
						that._scrollTimer = setTimeout( proc, 80 );	
					};
					proc();
				}
				else
					renderSelect( x, y );
			}	
			else
				renderSelect( x, y );
		}
	},
	/**
	 * clear scroll timer
	 */
	clearScrollTimer: function(){
		if( this._scrollTimer )
			clearTimeout( this._scrollTimer );
		this._scrollTimer = null;
	},
	/**
	 * mouse up event call this function ( end selecting status )
	 * @param target
	 * @param x
	 * @param y
	 * @param isCtrl
	 */
	endSelect: function(target, x, y, isCtrl, onBoundary)
	{
		this.clearScrollTimer();
		
		var sel = this.getSelection();
		if(isCtrl || sel.isSelecting())
		{
			var point = this.screenToClient({'x': x,'y': y });
			var ret = this.pickAnything(point);
			if ( sel.isSelecting() ) {
				this.getSelection().endSelect(ret, onBoundary);
			}
		}
	},
  
  /**
   * Check if selection in table 
   * @param domTarget or Ranges
   */
  isInTable: function(domTarget)
  {
	  // Two option to implement this function
	  // 1. Check if the domTarget is in rendered Table element
	  // 2. Pickup selected object from the selection
	  console.log("Function editShell:isInTable not implemented yet.");
  },
  
  /**
   * Check if current position in Header and Footer
   * @param target
   * @param x
   * @param y
   * @returns
   */
  isPositionInHeaderFooter: function(area)
  {
	  if (area && area.getViewType && (area.getViewType() == "page.HeaderFooter" || 
				 area.getViewType() == "page.Header" || area.getViewType() == "page.Footer")){
			 return true;
		 }
	  return false;  
  },
  
  /**
   * Check if current position in Editor area
   * @param target
   * @param x
   * @param y
   * @returns   */
  isPositionInEditorContent: function(area)
  {
	  if(area && area.getViewType && area.getViewType() == "text.content"){
		  return true;
	  }
	  return false;  
  
  },
  isPositionInFootnotes:function(area){
	  if(area && area.getViewType && area.getViewType() == "text.footnotes"){
		  return true;
	  }
	  return false;  
  },
  isPositionInEndnotes:function(area){
	  if(area && area.getViewType && area.getViewType() == "text.endnotes"){
		  return true;
	  }
	  return false;  
  },
  getEditorArea:function(target,x,y){
	  var point = this.screenToClient({'x': x,'y': y});
	  var document = this.view();
	  return document&&document.getEditorArea(point.x,point.y-10);
  },
  isPointInHeaderFooter: function(x, y)
  {
	var point = this.screenToClient({'x': x,'y': y});
	var document = this.view();
	return document&&document.isPointInHeaderFooter(point.x,point.y-10);
  },
  setEditMode:function(model){
	  this._mode = model;
  },
  
  /**
   * @returns Return the edit mode
   */
  getEditMode: function()
  {	
	return this._mode;  
  },
  
  /**
   * Enter edit header and footer mode.
   * @returns If enter Header Footer edit mode.
   */
  enterHeaderFooterMode:function(target,offsetX, offsetY)
  { 
	  if(this._mode != EDITMODE.HEADER_FOOTER_MODE)
	  {
		  this._mode = EDITMODE.HEADER_FOOTER_MODE;
		  this.view().markHeaderFooterEditing(true);
		  this.beginSelect(target, offsetX, offsetY);
		  dojo.publish(writer.EVENT.EDITAREACHANGED);
		  if(!this.nls){
			  this.nls = dojo.i18n.getLocalization("writer","lang");
		  }
		  pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(this.nls.ACC_headerFooterMode);
		  return true;
	  }
	  return false;// No changed
  },

  /**
   * 
   * @param headerfooter the header/footer to be moved into
   * @returns boolean If the editor mode was changed
   */
  moveToHeaderFooter: function(headerfooter, force, bNotSetCursor){
	  if(force || this._mode != EDITMODE.HEADER_FOOTER_MODE)
	  {
		  this._mode = EDITMODE.HEADER_FOOTER_MODE;
		  if(!this.nls){
			  this.nls = dojo.i18n.getLocalization("writer","lang");
		  }
		  pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(this.nls.ACC_headerFooterMode);
		  this.view().markHeaderFooterEditing(true);
		  var selection = this.getSelection();
		  if( !bNotSetCursor ){
			  selection.moveTo(headerfooter, 0);
			  selection.scrollIntoView();
		  }
		  dojo.publish(writer.EVENT.EDITAREACHANGED);
		  return true;
	  }
	  return false;
  },
  
  /**
   * Enter edit document mode.
   * @returns boolean If the editor mode was changed
   */
  enterEditorMode: function(target,offsetX, offsetY)
  {
	  if(this._mode != EDITMODE.EDITOR_MODE)
	  {	  
		  this._mode = EDITMODE.EDITOR_MODE;
//		  console.log("enter editor mode");
		  if(!this.nls){
			  this.nls = dojo.i18n.getLocalization("writer","lang");
		  }
		  pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(this.nls.ACC_EditorMode);
		  this.view().markHeaderFooterEditing(false);
		  if( offsetX != null && offsetY != null )
			  this.beginSelect(target, offsetX, offsetY);
		  dojo.publish(writer.EVENT.EDITAREACHANGED);
		  return true;
	  }
	  return false;	// No changed
  },
  enterFootnotesMode:function(target,offsetX, offsetY){
	  if(this._mode!= EDITMODE.FOOTNOTE_MODE){
//		  console.info("enter the footnotes x: "+offsetX+";y: "+ offsetY);
		  if(this._mode== EDITMODE.HEADER_FOOTER_MODE){
			  this.view().markHeaderFooterEditing(false);
		  }
		  if(!this.nls){
			  this.nls = dojo.i18n.getLocalization("writer","lang");
		  }
		  pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(this.nls.ACC_FootnotesMode);
		  this._mode = EDITMODE.FOOTNOTE_MODE;
		  if( offsetX != null && offsetY != null )
			  this.beginSelect(target, offsetX, offsetY);
		  return true;
	  }
	  return false;
  },
  setMode:function(mode){
	  this._mode = mode;
  },
  enterEndnotesMode:function(target,offsetX, offsetY){
	  if(this._mode!= EDITMODE.ENDNOTE_MODE){
		  if(this._mode== EDITMODE.HEADER_FOOTER_MODE){
			  this.view().markHeaderFooterEditing(false);
		  }
		  if(!this.nls){
			  this.nls = dojo.i18n.getLocalization("writer","lang");
		  }
		  pe.lotusEditor && pe.lotusEditor.getShell()._editWindow.announce(this.nls.ACC_EndnotesMode);
		  this._mode = EDITMODE.ENDNOTE_MODE;
		  if( offsetX != null && offsetY != null )
		 	this.beginSelect(target, offsetX, offsetY);		 
		  return true;
	  }
	  return false;
  },
  
  /**
   * Insert text into cursor position.
   * @param text The inserted content.
   * @param keepStyle if keep the style of text which current selected( which will be deleted )
   * @returns Boolean
   */
  insertText: function(text, keepStyle )
  {
	   //delete in selection
	  	var msgs = [], msg, actPair ;
	  	var sel = this.getSelection();
	  	sel && sel.clearSelectionChangeTimer();
	  	var ranges = sel.getRanges();
	  	if(!writer.util.RangeTools.canDo(ranges)){
			/*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
			return;
		}
	  	var targetRun;
	  	if( keepStyle && dojo.isString(text) && !ranges[0].isCollapsed()){
	  	//keep style when insert text at the beginning of text run 
	  		var start = ranges[0].getStartParaPos();
	  		var end = ranges[0].getEndParaPos();
	  		
		  	var para = start.obj;
		  	var index = start.index;
		  	var run = para.byIndex( index );
		  	if( run && !run.tab && run.length>0 && run.start == index  ){
		  		if ( end.obj == para && end.index < ( index + run.length )){
		  		// run will not deleted
		  			targetRun = run;
		  		}
		  		else{
		  			var jsonText = run.toJson( null,text.length);
		  			if( jsonText.fmt ){
		  			//inline object
		  				jsonText.c = text;
		  				return this.insertInlineObj(jsonText);
		  			}
		  			else{
				  		text = {"c": text, "fmt": [jsonText]};
		  			}
		  		}
		  	}
	  	}
	  	
		
	  	for(var i=0;i< ranges.length;i++){
	  		var range = ranges[i];
			if (!range) {
				console.log("range not exist!");
				return false;
			}
			if( !range.isCollapsed()){
				// TODO The msgs will be return without send .....
				 msgs = msgs.concat(range.deleteContents(true,true));
			}
			
	  	}
	  	var range = ranges[0];
	  	//Insert text.
	  	var start =  writer.util.RangeTools.getFirstParaInRanges(ranges);
		if( !start )
			return false;
		
		var para = start.obj;
		var index = start.index;	
		var length = 0;
		if( targetRun && targetRun.insertText( text, index ) ){
			length = text.length;
		}
		else if( dojo.isString(text))
		{
			if(text == "\r")	// Insert line break by shift + enter
			{
				// The function will return Textrun or other inline object.
				// Change it to text run.
				var curFmt = {};
				var prevIdx = index == 0?0:index - 1;
				curFmt.style = dojo.clone(para.byIndex(prevIdx).textProperty.toJson());//follow prev run style
				curFmt.rt = writer.model.text.Run.TEXT_Run;
				curFmt.s = index;
				curFmt.l = 1;
				curFmt.br = {};
				curFmt.br.t = "br";
				
				var lineBreak = {};
				lineBreak.c = text;
				lineBreak.fmt = [curFmt];
				if( para.c == "" ){
					para.hints.removeAll();
				}
				index = para.insertRichText(lineBreak, index);
			}
			else if (text == "\t")	// Insert tab key, add tab format
			{
				var curFmt = {};
				var prevIdx = index == 0?0:index - 1;
				curFmt.style = dojo.clone(para.byIndex(prevIdx).textProperty.toJson());//follow prev run style
				curFmt.rt = writer.model.text.Run.TEXT_Run;
				curFmt.s = index;
				curFmt.l = 1;
				curFmt.tab = {};
				curFmt.tab.t = "tab";
				
				var tabKey = {};
				tabKey.c = text;
				tabKey.fmt = [curFmt];
				if( para.c == "" ){
					para.hints.removeAll();
				}
				index = para.insertRichText(tabKey, index);
			}
			else{
				var bTrackAuthor = pe.scene.isTrackAuthor();
				// Not track TOC now
				if(bTrackAuthor && !writer.util.ModelTools.isInToc(para)){
					var formats = pe.lotusEditor.indicatorManager.createTextFmt(para, text, index);
					// delete 'br', because it is not a break
					if (formats && formats.fmt)
					{
						for (var i = 0; i < formats.fmt.length; ++i)
						{
							var ofmt = formats.fmt[i];
							if (ofmt.br)
								delete ofmt.br;
						}
					}
					index = para.insertRichText(formats, index);
				}else
					para.insertText(text,index);
			}
			length = text.length;
		}
		else if( text.c && text.fmt )
		{
			var bTrackAuthor = pe.scene.isTrackAuthor();
			// Not track TOC now
			if (bTrackAuthor && !writer.util.ModelTools.isInToc(para)){
				for(var i =0; i < text.fmt.length; i++){
					if (!text.fmt[i].e_a)
						text.fmt[i].e_a = pe.scene.getCurrUserId();
				}
			}
			index = para.insertRichText(dojo.clone(text), index);
			length = text.c.length;
		}
		else
		{ //wrong text 
			return false;
		}
		
		if( length )
		{
			actPair = WRITER.MSG.createInsertTextAct(index, length, para);
			msg= WRITER.MSG.createMsg(WRITER.MSGTYPE.Text, [actPair]);
			msg && msgs.push( msg );
			
			range.setStartModel(para, index + length);
			range.collapse( true );
			sel.selectRangesBeforeUpdate([range]);
			pe.lotusEditor.needScroll = true;
			para.parent.update();
			
			WRITER.MSG.sendMessage( msgs );
			return true;
		}
		return false;
  },
  
  /**
   * Insert image
   *  @param cnt format is similar with insert text message:
	 *    {"c": "hello", "fmt":[{"rt":"rPr", "style":{"b":1}} ]}
   */
  insertInlineObj: function(cnt)
  {
	//delete in selection
  	var msgs = [], msg;
	var ranges = this.getSelection().getRanges();
	var range = ranges[0];
	if(!writer.util.RangeTools.canDo(ranges)){
		/*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
		return false;
	}
	
	WRITER.MSG.beginRecord();
	try{
		if( !range.isCollapsed()){
			 msgs = range.deleteContents(true,true);
			 WRITER.MSG.sendMessage(msgs);
		}
		
		//Insert text.
		var start = range.getStartParaPos();
		start && writer.util.ModelTools.insertInlineObject( cnt, start.obj, start.index, true );
	}
	catch(e){
		
	}
	
	WRITER.MSG.endRecord();

	if( !start )
		return false;
	
	return true;
  },
  /**
   * split in current cursor
   * @param msgs
   */
  split: function( msgs ){
	  
	   var sendMsg = ( msgs == null );
	  	msgs = msgs || [];
	  	
	    var selection = pe.lotusEditor.getSelection();
		var ranges = selection.getRanges();
		var range = ranges[0];
		if(!writer.util.RangeTools.canDo(ranges)){
			/*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
			return;
		}
		if( !range.isCollapsed()){
			 var tmpMsg = range.deleteContents(true,true);
			 for( var i =0; i< tmpMsg.length; i++ )
				 msgs.push( tmpMsg[i]);
		}
		var start = range.getStartParaPos();
		if( !start )
		{
			sendMsg && msgs.length && WRITER.MSG.sendMessage( msgs );
			return null;
		}
		var para = start.obj;
		var index = start.index;
		var parent = para.parent;
		if(index == 0){
			sendMsg && msgs.length && WRITER.MSG.sendMessage( msgs );
			return para;
		}
		else{
			var sectId = para.getSectId();
			if(index == para.text.length && (!sectId || sectId == "none" || sectId =="") )
			{	
				var nextPara = para.next();
				if(nextPara && nextPara.modelType == writer.MODELTYPE.PARAGRAPH )
				{
					sendMsg && msgs.length && WRITER.MSG.sendMessage( msgs );
					return nextPara;
				}
			}
			
			var newPara = para.split(index, msgs);
			//remove section property from the old 
			var message = para.setSectionId("", true);
			message && msgs.push(message);
			parent.insertAfter(newPara,para);
			
			msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( newPara )] ) );
			sendMsg &&	WRITER.MSG.sendMessage( msgs );
			return newPara;
		}	
	  
  },
  /*
   * Insert Block
   */
  insertBlock:function( obj, forceUpdate )
  {
		var msgs=[];
		var nextPara = this.split(msgs);
		if( nextPara ){
			nextPara.parent.insertBefore(obj,nextPara);
			msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Element,  [WRITER.MSG.createInsertElementAct( obj )] ) );
			
			var selection = pe.lotusEditor.getSelection();
			var range = selection.getRanges()[0];
			range.moveToEditStart( nextPara );
			selection.selectRangesBeforeUpdate([range]);
			nextPara.parent.update( forceUpdate );
			WRITER.MSG.sendMessage( msgs );
		}
  },
  
  /*
   * delete Text 
   */
  deleteText: function(ime){
		var selection = pe.lotusEditor.getSelection();
		if (!selection){
			return false;
		}
		var ranges = selection.getRanges();
		if (!ranges){
			return false;
		}
		if(!writer.util.RangeTools.canDo(ranges)){
			/*if the range is crossing more than one footnote/endnote, it can not delete anything.				 */
			return false;
		}
		var msgs = [];
		
		for (var i=0;i<ranges.length;i++){
			var range = ranges[i];
			if( !range.isCollapsed() ){
			//delete contents
				msgs = msgs.concat( range.deleteContents( true, true, {keepBookmark: ime} ));
			}
			else if (range.isCollapsed()){
				//remove a char
				msgs = msgs.concat( range.deleteAtCursor( false ) );
			}
		}
		
		//send msgs
		var para = ranges[0].getStartParaPos().obj;
		
		para.parent.update();
		WRITER.MSG.sendMessage( msgs );
		return true;
  },
  
  /**
   * Hide the context menu.
   * @returns If the context menu was opened and dismissed it.
   */
   
  dismissContextMenu : function()
  {
	  var ctxMenu = dijit.byId("ctx");
	  if(ctxMenu && ctxMenu.isShowingNow ) 
		  dijit.popup.close(ctxMenu);
  },
  
  /**
   * Open the context menu
   * @param {DOM object} target The target element.
   * @param {Integer} x
   * @param {Integer} y
   */
  openContextMenu: function(target, x, y)
  {
	// TODO Should forbidden default context menu when right click in TOOLBAR, MENU BAR, TITLE BAR, SIDEBAR.
	//COMMON code to do that for three Editor.
	  // Generate the context menu
	  this.dismissContextMenu();
	  var ctx = pe.lotusEditor.ContextMenu,
	  	  selection = this.getSelection();
	  if(selection && selection._cursor) selection._cursor.hide();
	  if(ctx && ctx.show)
		  ctx.show(target,selection,x,y);
  },
  
  /**
   * Select the mouse clicked whole word
   * @param target
   * @param x
   * @param y
   */
  selectWord: function(target, x, y)
  {
		var point = this.screenToClient({'x': x,'y': y });
		var ret = this.pickAnything(point);
		if (ret) {
			var sel = this.getSelection();
			sel.selectOneWord(ret);
		}
  },
  
  /**
   * Select the mouse clicked whole paragraph
   * @param target
   * @param x
   * @param y
   */
  selectParagraph: function(target, x, y)
  {
	  console.log("Function editShell:selectParagraph not implemented yet.");
  }
  
});
