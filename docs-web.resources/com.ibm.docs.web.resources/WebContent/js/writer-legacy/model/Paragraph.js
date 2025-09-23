dojo.provide("writer.model.Paragraph");
dojo.require("writer.model.update.Block");
dojo.require("writer.util.ModelTools");
dojo.require("writer.model.Model");
dojo.require("writer.model.Hints");
writer.model.Paragraph = function(json, parent, hasId, refPara) {
	this.parent = parent;
	// TODO need change to global, document is Real document, header footer, footnote endnote.
	this.doc = writer.util.ModelTools.getDocument(parent); 
	this.container = new common.Container(this);
	this.text = "";
	this.listSymbols = null;
	this.list = null;
	this.AnchorObjCount = 0;
	this.task = "";
	this.fromJson(json, hasId,refPara);
	this.deleted = false;
	//page break
	//this.isPageBreakBefore = false;
	dojo.publish(writer.EVENT.CREATEDNEWPARA, [this]);	
};
writer.model.Paragraph.prototype = {
	modelType : writer.MODELTYPE.PARAGRAPH,
	fromJson : function(json, hasId,refPara) {

		this.text = (json && json.c) || "";
		this.id = hasId ? (json.id || WRITER.MSG_HELPER.getUUID()) : json.id;
		this.task = (json && json.taskId) || "";
		// The directProperty was used for change current paragraph property
		this.directProperty = new writer.model.prop.ParagraphProperty(json.pPr, this);

		
		/* Store import format in order to correctly process alignment property of RTL paragraphs/tables */
		if(pe.lotusEditor.setting.isOdtImport() == null) {
			var paraDir = this.directProperty._getValue("direction");
			if(!paraDir)
				paraDir = pe.lotusEditor.setting.getDefaultDirection();

			if(paraDir)
				pe.lotusEditor.setting.setImportFormat(paraDir == "rl-tb" || paraDir == "lr-tb");
		}
		this.createHints(json.fmt, json.rPr);
		// It was used to display paragraph mark, like list symbol.
		this.paraTextProperty = new writer.model.prop.TextProperty(json.rPr, this);
		this.checkStartAndLength( 0, this.getLength(), true );
		this.buildRuns();
	},
	/**
	 * Convert the object to JSON format for copy and co-editing message.
	 * @param index
	 * @param length
	 * @param includeParagraph Boolean
	 *    includeParagraph is true will generated JSON should include the whole paragraph,
	 *    otherwise will only generate internal text JSON.  
	 */
	toJson: function(index, length, includeParagraph, btrimBookmark )
	{
		index = index || 0;
		length = length == undefined ? this.text.length : length;
		
		var retVal ={}; 
		retVal.fmt = this.hintsToJson(index, length, btrimBookmark );
		retVal.c = this.text.substring(index, index + length);
		if(includeParagraph)
		{
			if(this.task!="")
				retVal.taskId = this.task;
			retVal.t = 'p';
			retVal.id = this.id;
			var rPr = this.paraTextProperty.toJson();
			if(rPr){
				retVal.rPr = rPr;
			}
			var pPr = this.directProperty.toJson();
			var dir = this.directProperty.getDirection(true);
			if(dir == "rtl" || dir == "rl-tb") {
				if(!pPr) {
					var align = (dir == "rtl") ? "left" : "right";
					pPr = {direction: dir, align: align};
				}
				else if(!pPr.direction)
					pPr.direction = dir;
			}
			if(pPr){
				retVal.pPr = pPr;
			}
		}
		return retVal;
	},
	/**
	 * Get the paragraph length
	 * @returns
	 */
	getLength: function()
	{
		return this.text.length;
	},
	/**
	 * override function from Hints
	 */
	buildRuns: function(){
		writer.model.Hints.prototype.buildRuns.apply( this );
		writer.util.ModelTools.createParagraphCache( this );
	},
	markDirty:function(){
		this.stripMatchModels();
		var that = this;
		this.mark("dirty",function(){
			that.clearCache();
			that._cacheListSymbolProperty = null;
		});
		this.buildRuns();
	},
	markNextToBorderDirty:function(){
		var preModel = this.previous();
		var nextModel = this.next();
		if(this.getBorder() && preModel && preModel.modelType == writer.MODELTYPE.PARAGRAPH && preModel.getBorder())
			preModel.markDirty();
		if(this.getBorder() && nextModel && nextModel.modelType == writer.MODELTYPE.PARAGRAPH && nextModel.getBorder())
			nextModel.markDirty();
	},
	notifyInsertToModel:function(){
		try{
			this.directProperty.insertToModel();
		}catch(e){
			console.info(e);
		}
		
		
		// Notify paragraphs in text box.
		var mTools = writer.util.ModelTools;
		this.container.forEach(function(run){
			if(mTools.isTextBox(run) || mTools.isCanvas(run))
				run.notifyInsertToModel();
			if(writer.util.ModelTools.isNotesRefer(run)){
				run.insertSel();
			}
		}); 
	},
	notifyRemoveFromModel:function(){
		this.stripMatchModels();
		this.deleted = true;
		this.directProperty.removeFromModel();
		this.container.forEach(function(run){
			run.deleteSel&&run.deleteSel();
		});
		
		window._IDCache.removeId(this.id);
		
		// Notify paragraphs in text box.
		var mTools = writer.util.ModelTools;
		this.hints.forEach(function(run){
			if(mTools.isTextBox(run) || mTools.isCanvas(run))
				run.notifyRemoveFromModel();
		});
	},
	/**
	 * Sample: Copy a paragraph with list and heading will create the paragraph object.
	 *           Paste it into document will call this function to connect the paragraph with list object and heading style. 
	 */
	markInsert:function(){
		/*TODO:crash when modify foot note content for doc is null*/
		var that = this;
		this.notifyInsertToModel();
		this.mark("inserted",function(){
			that.updateListSymbolView();
		});
	},
	markReset:function(){
		var that = this;
		this.mark("reseted",function(){
			that.reset();
			that.createListRuns();
			that.updateListSymbolView();
		});
	},
	/**
	 * The function will remove paragraph property
	 * @param msgs
	 */
	cleanParagraphProperty: function(msgs)
	{		
		var msg = this.setIndentRight("none");
		msg && msgs && msgs.push(msg);
		
		// Clear indent
		this.directProperty.setIndentLeft("none");
		this.directProperty.clearSpecialIndent();

		/* alignment and direction should be preserved on creating headings from RTL paragraph */
		if(this.directProperty.getDirection() != "rtl") {
			msg = this.setAlignment("none");
			msg && msgs && msgs.push(msg);
		}
		
		msg = this.directProperty.getMessage();
		if(msg){
			this.markReset();
			this.parent.update();
		}
		
		msg && msgs && msgs.push(msg);
	},
	styleChanged: function()
	{
		this.directProperty.styleChanged();
		this.markNextToBorderDirty();
		this.markReset();
	},
	/**
	 * Return message Array
	 * @param styleId
	 * @returns
	 */
	addStyle:function(styleId){
		var msgs = this.directProperty.addStyle(styleId);
		this.styleChanged();
		this.parent.update();
		
		return msgs;
	},
	/**
	 * Return message Array
	 * @param styleId
	 */
	removeStyle:function(styleId){
		var msgs = this.directProperty.removeStyle();
		this.styleChanged();
		this.parent.update();
		
		return msgs;
	},
	_insertText: function(text, index)
	{
		if( !text || text == "")
			return;
		if(!this.text){
			this.text = text;
		}else if( index < 0 || index == null ){
			index =  this.text.length;
			this.text = this.text + text;
		}else{
			var preText = this.text.substring(0, index);
			var postText = this.text.substring(index);
			this.text = preText + text + postText;
		}
		this.markDirty();
		this.updateMiswordsIndex(index, text.length, text);
	},
	/**
	 * insert text 
	 * @param text
	 * @param index
	 */
	insertText : function(text, index, run ) {
		if( this.addTextLength( text.length, index )){
			this._insertText(text, index);
			this.markDirty();
			dojo.publish(writer.EVENT.REQUESTSPELLCHECKONPARA, [this, text, index]);
		}
		this.checkStartAndLength( 0, this.getLength());
	},
	
	_getEmptyRPr: function( index ){
		var emptyRPr = this.container.getLast() ? this.paraTextProperty.merge(this.container.getLast().textProperty, true).toJson() : this.paraTextProperty.toJson();
		if(emptyRPr && emptyRPr['coloreBeforeIME']){
			if(emptyRPr['color'] == 'auto' )
				delete emptyRPr['color'];
			else
				emptyRPr['color'] = emptyRPr['coloreBeforeIME'];
			delete emptyRPr['coloreBeforeIME'];
		}
		
		if( emptyRPr && emptyRPr['styleId']== "Hyperlink" )
			delete emptyRPr['styleId'];
		return emptyRPr;
	},
	/**
	 * internal method for delete text
	 * remove length from index
	 * @param index
	 * @param len
	 */
	removeTextLength: function( index, len )
	{
		var that = this;
		that.hints.forEach(function(curProp){
			if(curProp.removeTextLength){
				curProp.removeTextLength(index, len, that.hints);
			}
		});
		//#34820
		this.fillHintIfEmpty( this._getEmptyRPr(index));
	},
	/**
	 * For apply message and paste
	 * @param cnt format is similar with insert text message:
	 *    {"c": "hello", "fmt":[{"rt":"rPr", "style":{"b":1}} ]}
	 * @param index
	 */
	insertRichText: function(cnt, index, bNotMark)
	{
		var index = Math.min(index || 0, this.getLength());
		if(typeof cnt == "string")
			return this.insertText(cnt, index);
		
		if( cnt.rt && cnt.rt != writer.model.text.Run.TEXT_Run )
			this.insertObject( cnt, index, bNotMark );
		else
			index = this.insert(cnt.fmt, index, cnt.c.length);
		this._insertText(cnt.c, index);
		this.fillHintIfEmpty( this._getEmptyRPr(index));
		
		this.buildRuns();
		if( !bNotMark )
		{
			if (cnt && cnt.fmt && dojo.some(cnt.fmt, function(f){
				return f.anchor;
			}))
				this.markReset();
			else
				this.markDirty();
		}

	    dojo.publish(writer.EVENT.REQUESTSPELLCHECKONPARA, [this, cnt.c, index]);
	    return index;
	},
	/**
	 * remove bookmarks at index of idx
	 * @param idx
	 * @param bNotMark
	 * @returns {Array}
	 */
	removeBookmarks:function( idx, bNotMark ){
		var run = this.byIndex( idx );
		if( idx == this.getLength() )
			run = this.lastChild();
		
		var msgs = [], prev,next, dirty;
		if( run && run.modelType == writer.MODELTYPE.BOOKMARK ){
			this.removeBookmark( run, msgs );
			!bNotMark && this.markDirty();
			return msgs;
		}
		//remove previous child
		if( run && ( run.start == idx )){
			prev = this.previousChild( run );
			while( prev  &&  this.removeBookmark( prev, msgs ) ){
				prev = this.previousChild( run );
				dirty = true;
			}
		}
		
		//remove next child
		if(  run && ( run.start + run.length == idx )){
			next = this.nextChild( run );
			while( next && this.removeBookmark( next, msgs )){
				next = this.nextChild( run );
				dirty = true;
			}
		}
		!bNotMark && dirty && this.markDirty();
		return msgs;
	},
	
	/**
	 * remove bookmark
	 * @param index
	 * @param len
	 * @param bNotMark
	 */
	removeBookmark: function( bookmarkRun , msgs ){
		if( bookmarkRun && bookmarkRun.modelType == writer.MODELTYPE.BOOKMARK ){
			msgs.push( WRITER.MSG.createMsg( WRITER.MSGTYPE.Text, [WRITER.MSG.createDeleteInlineObjAct( bookmarkRun )], null, "bm"));
		    this.removeObject(  bookmarkRun );
		    return true;
		}
		return false;
	},
	
	deleteText : function(index, len, bNotMark) {
		// if text is pagebreak, then mark, for paragraph updateLayout
		var run = this.byIndex(index);

		while (run && 0 == run.length)
		{
			// filter the bookmark and some run whose length is 0
			run = run.next();
		}

		if (run && run.br && run.br.type == "page")
		{
			this.deletedPbr = true;
		}
	
		if( this._deleteText(index, len))
		{
			//this.move(index, len, true);
			this.removeTextLength(index, len);
			this.checkStartAndLength( 0, this.getLength());
			if( bNotMark )
				this.buildRuns();
			else
				this.markDirty();
		}
	},
	/*
	 * Remove text from this.text, donot modify properties
	 * index : where to remove
	 * len : the length to remove
	 * return true if removed text;
	 * otherwise return false.
	 */
	_deleteText: function( index, len )
	{
		if( this.text == null || this.text == "" || len <= 0 )
			return false;
		
		var preText = "", postText = "";
		preText = this.text.substring(0, index);
		postText = this.text.substring(index + len);
		this.text = preText + postText;
		
		// for spell check
		this.updateMiswordsIndex(index, -1*len);
		dojo.publish(writer.EVENT.REQUESTSPELLCHECKONPARA, [this, "", index, false]);

		return true;
	},
	/*
	 * removeHint from paragraph
	 */
	removeHint: function( hint, bNotMark ){
	//	this.deleteText( hint.start, hint.length, bNotMark );
		this._deleteText( hint.start, hint.length );
		var parent = hint.parent;
		var len = hint.length;
		parent.removeObject( hint, bNotMark );
		
		var next;  
		while( parent && parent!= this )
		{
			if( parent.length!= null )
				parent.length -= len;
			if( parent.parent && parent.parent!= this)
			{
				next = parent.parent.next(parent);
				next && next.moveBackward( -len, true );
			}
			parent = parent.parent;
		}
		this.checkStartAndLength( 0, this.getLength());
		this.buildRuns();
		if( !bNotMark )
			this.markDirty();
	},
	onSplitHandle:[],
	/*
	 * event fire up when paragraph split
	 * 
	 * */
	onSplit:function(){
		var sel = pe.lotusEditor.getShell().getSelection();
		var range = sel.getRanges()[0];
		
		// request spell check
		dojo.publish(writer.EVENT.REQUESTSPELLCHECKONPARA, [this, "", this.text.length, true]);
		
		if(!this.onSplitHandle) 
			return;
		for(var i=0;i<this.onSplitHandle.length;i++){
			var fn = this.onSplitHandle[i];
			fn(this);
		}
	},
	/*
	 * split model
	 * If the paragraph include a section and create paragraph after it, will move it to new created paragraph
	 */
	split : function(idx,msgs) {
		//create new paragraph json
		var len = idx > 0 ? (this.text && (this.text.length - idx)) : 0;
		var newParaJson = this.toJson(idx, len, true, true );
		newParaJson.id = WRITER.MSG_HELPER.getUUID();
		var curRun = null;
		if( idx == 0 ) // Start of paragraph 
		{
			curRun = this.byIndex(idx);
			
			var styleId = this.getStyleId();
			if( styleId && ( styleId == "TOCHeading" || (/TOC[1-6]/).test(styleId)))
			{
				if(!newParaJson.pPr)
					newParaJson.pPr = {};
				else if(newParaJson.pPr.numPr)
					delete newParaJson.pPr.numPr;
				delete newParaJson.pPr.styleId;
			}
		}	
		else if(idx == this.text.length) // End of paragraph
		{
			// Get next paragraph style
			var styleId = this.getStyleId();
			var style = styleId && styleId != "none" && pe.lotusEditor.getRefStyle(styleId);
			
			var hint = this.byIndex(idx-1);
			var tarHint = hint;
			while(tarHint&&(tarHint.modelType==writer.MODELTYPE.RFOOTNOTE||tarHint.modelType==writer.MODELTYPE.RENDNOTE)){
				tarHint = this.hints.prev(tarHint);
			}
			if(!tarHint){
				tarHint = hint;
				while(tarHint&&(tarHint.modelType==writer.MODELTYPE.RFOOTNOTE||tarHint.modelType==writer.MODELTYPE.RENDNOTE)){
					tarHint = this.hints.next(tarHint);
				}
			}
			
			if(style && style.next && style.next != "" && !style.isDefault)
			{
				if(!newParaJson.pPr)
					newParaJson.pPr = {};
				else if(newParaJson.pPr.numPr)
				{
					// Defect 39353, remove List
					delete newParaJson.pPr.numPr;
				}	
				newParaJson.pPr.styleId = style.next;
				newParaJson.fmt = [];
				// clear the rPr if next attr exist
				if(newParaJson.rPr)
					newParaJson.rPr = {};
			}else{
				if(tarHint){
					newParaJson.rPr = tarHint.textProperty.merge(this.paraTextProperty, true).toJson();//merge the last run text style with paragraph text style
				}else{
					newParaJson.rPr = this.paraTextProperty.toJson();
				}
			}
			curRun = tarHint;
		}
		else // Middle of paragraph
		{
			msgs && WRITER.MSG.addDeleteMsg( this, idx, null, msgs );
			this.deleteText(idx, len);
		}	
		
		if(curRun)
		{	
			newParaJson.fmt = [];
			var runJson = curRun.toJson(0,0)
			if(curRun.isTextRun && curRun.isTextRun()){
				//split from the end of para, we don't need inherit its comments
				if(idx == this.text.length)
					 delete runJson.cl;
				newParaJson.fmt.push(runJson);
			}

		}
		
		// TODO can cache the json for message
		var newPara = new writer.model.Paragraph( newParaJson, this.parent, true);

		// deal with section id
		if (0 == idx)
		{
			newPara.setSectionId("");
		}
		else
		{
			var message = this.setSectionId("", true);
			if (message){
				msgs.push(message);
			}
		}

		this.onSplit();
		return newPara;
	},
	emptyClone:function(){
		return this.split(this.text.length).toJson();
	},
	// merge another paragraph to this one
	merge:function(para){
		para.reset();
		// TODO Merge section
		if(!para.text){
			para.text ="";
		}
		var last = this.hints.getLast();
		// remove the empty run at the last of para
		if( last.modelType == writer.MODELTYPE.TEXT && last.length ==0){
			this.hints.remove(last);
			last = this.hints.getLast();
		}
		var that = this;
		para.hints.forEach( function(hint){
			//do not append bookmark
			if( hint.modelType != writer.MODELTYPE.BOOKMARK ){
				that.hints.append( hint );
				hint.setParent( that );
				hint.setParagraph( that );
				hint.markInsert();
			}
		});
		
		// dont call hints.removeObject which will mark the run deleted
		para.hints.removeAll();
		para.buildRuns();
		
		if(!this.text){
			var len =0;
		}else{
			var len = this.text.length;
		}
		this._insertText(para.text, len);
		this.fixStart( last );
		this.markDirty();
		this.buildRuns();
		
		// notify spell checker for a forced check
		if (para.text.length >= 0)
			dojo.publish(writer.EVENT.REQUESTSPELLCHECKONPARA, [this, para.text, len, true]);
	},
	/*
	 * appendRun
	 */
//	appendRun : function(text, attrs, style) {
//
//		var start = this.text.length;
//		var len = text.length;
//		var source = {
//			'start' : start,
//			'len' : len,
//			'attrs' : attrs,
//			'style' : style
//		};
//		// append
//		this.text += text;
//		this.hints.append(new writer.model.Run(source, this));
//		this.source.fmt.push(source);
//		this.buildRuns();
//	},

	replaceText : function(idx, len, content) {

	},
	splitRun : function(run, idx) {

	},
	reset:function(){
		this.clearCache();
		this._cacheListSymbolProperty = null;
		this.hints.forEach(function(hint){
			hint.clearAllCache();
		});
	},
//	resetTextAlignment: function() {
//		this.hints.forEach(function(hint){
//			hint.resetSplitChars && hint.resetSplitChars();
//		});
//	},
	changeStyle : function(style, idx, len) {

	},
	isPageBreakBefore: function()
	{
		return this.directProperty.isPageBreakBefore();
	},
	
	isKeepLines: function()
	{
		return this.directProperty.isKeepLines();
	},

	isWidowControl: function()
	{
		return this.directProperty.isWidowControl();
	},

	ifOnlyContianPageBreak: function()
	{
		var run = this.container.getFirst();
		while(run)
		{
			if (!run.br || run.br.type != "page")
				return false;
			
			run = this.container.next(run);
		}
		
		return true;
	},
	isList : function() {
		return !!this.list;
	},
	isBullet : function() {
		if (this.isList()) {
			var lvl = this.getListLevel();
			var absNum = this.list.getAbsNum();
			var numFmt = absNum.getNumDefinitonByLevel(lvl).getNumFmt();
			if (numFmt == "bullet" || numFmt == "none")
				return true;
		}
		return false;
	},
	isFirstListItem: function()
	{
		if(this.isList() && this == this.list.getParagraph(0))
		{
			return true;
		}	
		return false;
	},
	isHeading: function()
	{
		var styleId = this.getStyleId();
		if(styleId && styleId.indexOf("Heading") == 0)
			return true;
		return false;
	},
	isHeadingOutline: function()
	{
		if(this.isHeading() && this.isList())
		{
			var heading1Style = pe.lotusEditor.getRefStyle("Heading1");
			if(heading1Style)
			{	
				var styleProp = heading1Style.getParagraphProperty();
				var headingNumId = styleProp && styleProp.getNumId();
				if(headingNumId != "none" && headingNumId != -1 && pe.lotusEditor.number.isValidNumId(headingNumId))
				{
					// Defect 39363
					var otherNumIds = pe.lotusEditor.number.getSameListNumId(headingNumId);
					if(otherNumIds && otherNumIds.length > 0)
					{
						for(var i = 0; i < otherNumIds.length; i++)
						{
							if(this.list.id == otherNumIds[i])
								return true;
						}	
					}	
				}
			}
		}	
		
		return false;
	},
	isEndWithPageBreak:function(){
		var lastRun = this.container.getLast();
		while(lastRun && writer.util.ModelTools.isBookMark(lastRun)){
			lastRun = this.container.prev(lastRun);
		}
		if(lastRun && writer.util.ModelTools.isPageBreak(lastRun)){
			return true;
		}
		return false;
	},
	hasSectId:function(){
		var sectId = this.directProperty&&this.directProperty.sectId;
		if(sectId&&sectId.length>0){
			return true;
		}
		return false;
	},
	
	getOutlineLvl : function() {
		return this.directProperty.getOutlineLvl();
	},
	getSectId:function(){
		return this.directProperty.getSectId();
	},
	getDirectProperty:function(){
		return this.directProperty;
	},
	addViewerCallBack:function(view){
		var sectId = this.getSectId();
		if(!sectId){
			return;
		}
		var viewers = view.getViews();
    	var previousView = viewers.prev(view);
		if(previousView){
    		delete previousView.sectId;
    	}
		view.sectId= sectId;
    },
    isEmpty:function(){
    	if(this.hints.length() == 1 
    			&& this.hints.getFirst().start == 0
    			&& this.hints.getFirst().length == 0){
    		return true;
    	}
    },
    
    hasInlineContent: function(){
    	var hasInline = false;
		this.hints.forEach(function(run){
			if(run.length > 0 && !writer.util.ModelTools.isAnchor(run)){
				hasInline = true;
				return false;
			}
		}); 
		return hasInline;
    },
    
    /**
     * is in headerfooter container
     * @returns {Boolean}
     */
    isInHeaderFooter: function(){
    	return writer.util.ModelTools.getParent( this, writer.MODELTYPE.HEADERFOOTER )!= null;
    },
    getListSymbolProperty: function()
    {
    	if(!this.list)
    	{
    		this._cacheListSymbolProperty = null;
    		return null;
    	}
    	// Cache list symbol style
    	// The list property should be changed when change list type.
    	var listProperty = this.list.getListSymbolProperty( this.getListLevel() );
    	if(this._cacheListProperty != listProperty || !this._cacheListSymbolProperty)
    	{	
    		this._cacheListProperty = listProperty;
    	
    		var result = null;
    		if(this.paraTextProperty && listProperty)
    			result = this.paraTextProperty.merge(listProperty, true);
    		else
    		{
    			result = (listProperty || this.paraTextProperty);
    			if(result)
    				result = result.clone();
    		}
    		
    		// Defect 36902, remove underline from para text property
    		var hasUnderline = function(textProp)
    		{
    			if(!textProp)
    				return false;
    			var textDec = textProp.style["text-decoration"];
    			return (textDec && textDec.indexOf("underline") != -1);
    		};
    		if(result && hasUnderline(this.paraTextProperty) && !hasUnderline(listProperty))
    		{
    			var textDec = result.style["text-decoration"];
    			if(textDec)
    				result.style["text-decoration"] = textDec.replace(/underline/g, "");
    		}
    			
    		this._cacheListSymbolProperty = result; 
    	}
    	
    	return this._cacheListSymbolProperty;
    },
    /**
     * Change the list symbol
     * @param symbol
     * @param imageId	Image ID of picture bullet
     * @param justification The bullet justififaction.
     * @returns {Boolean} Return true when need change
     */
    setListSymbol: function(symbol,imageId, justification)
    {
    	if(this.listSymbols && this.listSymbols.txt == symbol)
    	{
    		if(imageId == this.listSymbols.imageId)
    			return false;
    	}	
    	this.listSymbols = {};
    	this.listSymbols.txt = symbol;
    	if(imageId || imageId == 0)
    		this.listSymbols.imageId = imageId;
    	this.listSymbols.lvlJc = justification;
    	this.createListRuns();
//    	this.markDirty();
    	return true;
    },
    /**
     * Remove the paragraph list
     * Return the messages
     * Boolean isClean, clear the numbering Id and level in direct property
     * Clean list maybe set the paragraph to list. Like remove list from heading outline then undo.
     */
    removeList: function(isClean)
    {
//    	if(!this.isList() && !isClean)
//    		return null;
    	
    	var msg = this.directProperty.removeList(isClean);
    	if(msg){
	    	delete this.listSymbols;
	    	delete this.listRuns;
	    	
	    	this.updateListSymbolView();
	    	this.markReset();
	    	this.parent.update();
    	}
    	
    	return msg;
    },
    /**
     * Set the paragraph to list
     * @param numId
     * @param level
     * @param needClearIndent is true will clean the paragraph's indent value
     * @returns
     */
    setList : function(numId, level, needClearIndent) {
    	
    	var msg = this.directProperty.setList(numId, level, needClearIndent);
    	if(msg)
    	{	
	    	this.markReset();
//			this.buildRuns();
	    	this.parent.update();
    	}
		return msg;
    },
    getListId : function()
    {
    	return this.directProperty.getNumId();
    },
    getListLevel : function() {
    	var lvl = this.directProperty.getNumLevel();
    	if (lvl == 'none') return -1;
    	return parseInt(lvl);
    },
    setListLevel : function(lvl) {
//    	if (!this.directProperty || !this.directProperty.getNumLevel() == 'none') return -1;
    	this.directProperty.setNumLevel(lvl);
    	var msg = this.directProperty.getMessage();
    	if(msg)
    	{
    		this.list.updateListValue();
    		// TODO Need considerate the update mechanism
    		this.markReset();
    		this.buildRuns();
    		this.parent.update();
    	}	
    	return msg;
    },
    /**
     * @argument bMessage
     * return a message for removing section property
     */
    setSectionId: function(sectId, bMessage){
    	var curSectId = this.directProperty.getSectId();
    	if(sectId == curSectId || (!sectId && !curSectId))
    		return null;
    	
    	var message = null;
    	if (this.directProperty ){
    		this.directProperty.setSectId(sectId);
			if (bMessage)
				message = this.directProperty.getMessage();
    	}
    	return message;
    },
    updateView : function() {
		var allViews = this.getAllViews();
		var textModelContainer = this.container;
		var textModel = this.container.getFirst();
		if(!textModel){
			this.deleteView();
			return;
		}
		for(var ownerId in allViews){
			var viewers = allViews[ownerId];
			var firstView = viewers.getFirst();
			// When apply multiple messages, the first message maybe reset the model
			// Then markDirty to update the paragraph will throw exception.
			if(firstView && firstView.hasLayouted())
			{
				firstView.update(textModel,textModelContainer,viewers);
			}
		}
		this.container.forEach(function(textModel){
			delete textModel.inserted;
			delete textModel.dirty;
		});
	},
	updateListSymbolView: function()
	{
		var allViews = this.getAllViews();
		for(var ownerId in allViews){
			var viewers = allViews[ownerId];
			var firstView = viewers.getFirst();
			firstView.updateListSymbol();
		}
	},
	/**
	 * The indent value should include unit.
	 * @param indentVal, 21pt
	 * @returns
	 */
	setIndent: function(indentVal, isFromMsg)
	{
		this.directProperty.setIndentLeft(indentVal, isFromMsg);
		
		var msg = this.directProperty.getMessage();
		if(msg){
			this.markReset();
			this.parent.update();
//			this.buildRuns();
		}
    	return msg;
	},
	
	setIndentRight: function(indentVal)
	{
		this.directProperty.setIndentRight(indentVal);
		
		var msg = this.directProperty.getMessage();
		if(msg){
			this.markReset();
			this.parent.update();
//			this.buildRuns();
		}
    	return msg;
	},
	
	/**
	 * Set indent type and value together.
	 * If type is empty string("") will not change the type attribute. 
	 */
	setIndentSpecialTypeValue: function(type, value)
	{
		this.directProperty.setIndentSpecialTypeValue(type, value);
		
		var msg = this.directProperty.getMessage();
		if(msg){
			this.markReset();
			this.parent.update();
		}
    	return msg;
	},
	
	/**
	 * Set paragraph's alignment
	 * @param align
	 * @returns The message
	 */
	setAlignment: function(align)
	{
		if(this.directProperty.getDirection(true) == "rtl") {
			if(align == "right")
				align = "left";
			else if(align == "left")
				align = "right";
		}
		this.directProperty.setAlign(align);
		
		var msg = this.directProperty.getMessage();
		if(msg){
//			this.resetTextAlignment();
			this.markReset();
			this.parent.update();
		}
		
		return msg;
	},
	setPageBreakBefore: function(value)
	{
		this.directProperty.setPageBreakBefore(value);
		
		var msg = this.directProperty.getMessage();
		if(msg){
			if (this.parent.modelType == writer.MODELTYPE.CELL){
				var table = this.parent.parent.parent;
				table.markReset();
			    table.update();
			}
			else {
				this.markReset();
				this.parent.update();
			}
				
		}
		
		return msg;
	},
	setKeepLines: function(value)
	{
		this.directProperty.setKeepLines(value);
		
		var msg = this.directProperty.getMessage();
		if(msg){
			if (this.parent.modelType == writer.MODELTYPE.CELL){
				var table = this.parent.parent.parent;
				table.markReset();
			    table.update();
			}
			else {
				this.markReset();
				this.parent.update();
			}
		}
		
		return msg;
	},

	setWidowControl: function(value)
	{
		this.directProperty.setWidowControl(value);
		
		var msg = this.directProperty.getMessage();
		if(msg){
			if (this.parent.modelType == writer.MODELTYPE.CELL){
				var table = this.parent.parent.parent;
				table.markReset();
			    table.update();
			}
			else {
				this.markReset();
				this.parent.update();
			}
		}
		
		return msg;
	},
	/**
	 * Set paragraph's direction
	 * @param direction
	 * @returns The message
	 */
	setDirection: function(direction)
	{
		this.directProperty.setDirection(direction);
		var msg = this.directProperty.getMessage();
		if(msg){
			this.markReset();
			this.parent.update();
		}
		
		return msg;
	},

	getTaskId:function(){
		return this.task;
	},
	isTask:function(){
		if(this.getTaskId()=="")
			return false;
		else 
			return true;
	},
	/**
	 * Set task to para 
	 * @param task_id
	 * @returns The message
	 */
	setTask: function(task_id)
	{
		var act = WRITER.MSG.createSetParaTaskAct(WRITER.ACTTYPE.SetParaTask,task_id==""?false:true, this.id, task_id==""?this.task:task_id);
		var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Attribute, [act] );
		this.task = task_id;
		this.markReset();
		this.parent.update();
		return msg;
	},
	
	setBackgroundColor: function(color)
	{
		this.directProperty.setBackgroundColor(color);
		
		var msg = this.directProperty.getMessage();
		if(msg){
			this.markReset();
			this.parent.update();
		}
		return msg;
	},
	
	setBorder: function(border)
	{
		this.directProperty.setBorder(border);
		
		var msg = this.directProperty.getMessage();
		if(msg){
			this.markReset();
			this.parent.update();
			this.markNextToBorderDirty();
		}
		return msg;
	},
	
	/**
	 * Set line spacing
	 * @param lineSpacing
	 * @param lineRule
	 * @returns
	 */
	setLineSpacing: function(lineSpacing, lineRule)
	{
		if(lineRule)
			this.directProperty.setLineSpaceType(lineRule);
		if(lineSpacing || lineSpacing == 0)
			this.directProperty.setLineSpaceValue(lineSpacing);
		
		var msg = this.directProperty.getMessage();
		if(msg){
			this.markReset();
			this.parent.update();
		}
		
		return msg;
	},
	
	getStyleId:function(){
		var styleId= this.directProperty.styleId;
		if(styleId&&styleId!=this.directProperty._defaultVal){
			return styleId;
		}
		else{
			// Defect 40376
			// Get default paragraph style.
			var defaultStyle = pe.lotusEditor.getDefaultParagraphStyle();
			styleId = defaultStyle && defaultStyle.styleId;
			return styleId;
		}
		return null;
	},
	/**
	 * @returns Docuemnt's default paragraph style
	 */
	getDefaultStyle:function(){
		if(this.getStyleId())
			return null;
		return pe.lotusEditor.getDefaultParagraphStyle();
	},
	/**
	 * 
	 * @param isPrevious true is Previous paragraph, false is Next paragraph
	 * @returns {Boolean}
	 */
	canMergeBorder:function(isPrevious){
		var curPara = isPrevious ? this.previous() : this;
		var nextPara = isPrevious ? this : this.next();
		
		if(!curPara || !nextPara || curPara.modelType != nextPara.modelType)
			return false;
		
		var curProp = curPara.directProperty, nextProp = nextPara.directProperty;
		if(curProp.getIndentLeft() != nextProp.getIndentLeft() || curProp.getIndentRight() != nextProp.getIndentRight())
			return false;
		
		var curBorder = curPara.getBorder();
		var nextBorder = nextPara.getBorder();
		if(!curBorder || !nextBorder)
			return false;
		
		if(curBorder["bottom"] && (nextBorder["bottom"] || nextBorder["top"]) || (curBorder["top"] && nextBorder["top"]))
		{
			// Compare border style
			var borderLen=0,nextBorderLen=0;
			for(var item in curBorder)
				borderLen++;
			for(var item in nextBorder)
				nextBorderLen++;
			if(borderLen!=nextBorderLen)
				return false;
			
			for(var item in curBorder){
				if(!nextBorder[item])
					return false;
				var borderItem = curBorder[item];
				var nextBorderItem = nextBorder[item];
				for(var count in borderItem){
					if(borderItem[count] != nextBorderItem[count])
						return false;
				}
			}
			// Same border style.
			return true;
		}
		
		return false;
	},
	getBorder:function(){
		if(this.directProperty){
			var border = this.directProperty.getBorder();
			return border;
		}
	},
	getBackgroundColor:function(){
		return this.directProperty.getBackgroundColor();
	},
	
	getParagraphs: function()
	{
			return [this];
	},

	pushFindResultModels : function(finder,model){
		if(!this.finder)
			this.finder = finder;
		if(this.finder.isReplacingAll)
			return;
		if(!this.matchModels)
			this.matchModels = [];
		this.matchModels.push(model);
	},
	
	getMatchModelIndex: function(matchModels, model){
		var len = matchModels.length;
		for(var i = 0; i < len; i++){
			var tmp = matchModels[i];
			if(tmp.start == model.start && tmp.end == model.end && tmp.para.id == model.para.id)
				return i;
		}
		return -1;
	},
	stripMatchModels : function(){
		if( pe.lotusEditor.isReplacingAll || pe.lotusEditor.isReplacing)
			return;
		if(!this.finder || (this.finder.matchModels.length == 0 && this.finder.replacedMatchModels.length == 0))
		{
			this.clearMatchModels();
			return;
		}
		var index,tempArray,sourceModels = this.finder.matchModels;
		if(this.matchModels && this.matchModels.length > 0)
			for(var i = 0; i < this.matchModels.length; i++)
			{
				index = this.getMatchModelIndex(sourceModels, this.matchModels[i]);
				if(index == -1)
				{
					sourceModels = this.finder.replacedMatchModels;
					index =sourceModels.indexOf(this.matchModels[i]);
					if(index == -1)
						continue;
					tempArray = sourceModels.splice(index);
					tempArray.shift();
					this.finder.replacedMatchModels = sourceModels = sourceModels.concat(tempArray);
				}
				else
				{
					tempArray = sourceModels.splice(index);
					tempArray.shift();
					this.finder.matchModels = sourceModels = sourceModels.concat(tempArray);
					dojo.publish(writer.EVENT.SHOWTOTALNUM, [this.finder.focusIndex, this.finder.matchBeforeFocus, this.finder.matchModels.length]);
				}
			}
		this.finder.highlight(this.finder.highlightAll,false, true);
		this.clearMatchModels();
	},
	clearMatchModels : function(){
		delete this.finder;
		delete this.matchModels;
	},
	
	/*
	 * get next misspelled word mark, considering every word's start and end
	 */
	getLastMisWordsMark : function(start, end) {
		var ret = -1;
		// when spellcheck is not enabled, always return -1
		if (!window.spellcheckerManager || 
				!window.spellcheckerManager.isAutoScaytEnabled())
			return ret;
		var scdata = this.scdata;
		if (scdata && dojo.isArray(scdata.misWords) && scdata.misWords.length > 0) {
			for (var i = 0; i < scdata.misWords.length; i++) {
				var mis_start = scdata.misWords[i].index;
				var mis_end = mis_start + scdata.misWords[i].word.length;
				if (mis_start < end && mis_start > start) {
					ret = mis_start; break;
				}
				if (mis_end < end && mis_end > start) {
					ret = mis_end; break;
				}
			}
		}
		return ret;
	},

	/*
	 * update misspelled words index when delete/add contents
	 */
	updateMiswordsIndex : function(index, len, text){
	  var scdata = this.scdata;
	  if (len == 0 || !scdata) return;
	  
	  // update the range to be checked
	  if (scdata.scrange_start == -1 ||
	      scdata.scrange_start == undefined || scdata.scrange_start > index)
		  scdata.scrange_start = index;
	  var change_end = len < 0 ? index : index + len;
	  if (scdata.scrange_end != undefined && scdata.scrange_end > 0 &&
		  scdata.scrange_end < change_end)
			  scdata.scrange_end = change_end;
	  
	  // update the checking range when the para is under spell checking
	  if (scdata.checking) {
		  var checking_range = scdata.checking; 
		  if (len > 0) {  // insert
			  if (index > checking_range.start && index < checking_range.end) {
				  checking_range.state = 1;
				  checking_range.end += len;
			  } else if (index <= checking_range.start) {
				  checking_range.start += len;
				  checking_range.end += len;
			  }
		  } else if (len < 0 && index < checking_range.end) { // delete, len is a negnative value
			  var delta_end = index - len;
			  if (delta_end <= checking_range.start ) {
				  checking_range.start += len;
				  checking_range.end += len;
			  } else {
				  checking_range.state = 1; // changed checking area
				  if (checking_range.end > index && checking_range.end < delta_end) {
					  checking_range.end = index;
				  } else {
					  checking_range.end += len;
				  } 
				  if (checking_range.start > index && checking_range.start < delta_end) {
					  checking_range.start = index;
				  }
			  }
		  }
	  }
	  
	  if (!dojo.isArray(scdata.misWords) || scdata.misWords.length == 0) return;
	  for (var i = scdata.misWords.length - 1; i >= 0; i--) {
		  var origindex = scdata.misWords[i].index;
		  // before the range
		  if ((origindex + scdata.misWords[i].word.length) <= index) continue;
		  // after the range
		  var endp = index;
		  if (len < 0) endp -= len;
		  if (origindex >= endp) {scdata.misWords[i].index += len; continue;}

		  var posinword, preText, postText;
		  // insert case
		  if (len>0){
			posinword = index - origindex;
			preText = scdata.misWords[i].word.substring(0, posinword);
			postText = scdata.misWords[i].word.substring(posinword);
			scdata.misWords[i].word = preText + text + postText;
		  } else {  // delete case
			if (index >= origindex) {
				preText = scdata.misWords[i].word.substring(0, index - origindex);
				var pos2 = index - len - origindex; // len is a neg val
				if (pos2 < scdata.misWords[i].word.length)
					postText = scdata.misWords[i].word.substring(pos2);
				else
					postText = "";
				scdata.misWords[i].word = preText + postText; // avoid undef
			} else {
				// in this case, we will also need update the index val
				scdata.misWords[i].index = index;
				var pos2 = index - len - origindex; // len is a neg val
				if (pos2 < scdata.misWords[i].word.length)
					postText = scdata.misWords[i].word.substring(pos2);
				else
					postText = "";
				scdata.misWords[i].word = postText; // avoid undef
			}
			if (scdata.misWords[i].word.length == 0)
				scdata.misWords.splice(i, 1);
		 }
	  }
	},
	getMergedTextProperty:function(){
		if(!this.mergedTextProperty){
			writer.model.Model.prototype.getMergedTextProperty.apply(this );
			if(this.directProperty &&  this.directProperty.backgroundColor){
				if(this.directProperty.backgroundColor.fill)
					this.mergedTextProperty.style["background-color"] = this.directProperty.backgroundColor.fill;					
				if(this.directProperty.backgroundColor.color && this.directProperty.backgroundColor.color != 'auto')
					this.mergedTextProperty.style["background-color"] = this.directProperty.backgroundColor.color["background-color"];
			}
		}
		return this.mergedTextProperty;
	}
};
common.tools.extend(writer.model.Paragraph.prototype, new writer.model.Hints());
common.tools.extend(writer.model.Paragraph.prototype, new writer.model.Model());
common.tools.extend(writer.model.Paragraph.prototype, new writer.model.update.Block());
