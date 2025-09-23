dojo.provide("writer.model.Hints");
/**
 * The Object was used manage the paragraph's text property. 
 * @param json
 * @param para
 */
writer.model.Hints = function(){
	
};
writer.model.Hints.prototype = {
		/**
		 * 
		 * @param jsonAttr
		 * @param paragraphRPR The default's paragraph mark property.
		 * @returns {common.Container}
		 */
	createHints:function(jsonAttr, paragraphRPR){
		this.hints = new common.Container(this);
		
		var empty = true;
		for(var i = 0; jsonAttr && ( i < jsonAttr.length ); i ++)
		{
			var att = jsonAttr[i];
			var run = writer.model.text.Run.createRun(att, this);
			if(!run)
				console.info("Not implemented property type: " + dojo.toJson(att));
			else
				this.hints.append(run);
		}
		this.fillHintIfEmpty(paragraphRPR);
		return this.hints;
	},
	/**
	 * check start and length
	 * @param start
	 * @param length
	 */
	checkStartAndLength: function( start, length, bInit ){
		var hasError;
		var index = start, hints = this.hints;
		
		var doc = this.modelType && writer.util.ModelTools.getDocument(this);
		var isloading = doc && doc.isLoading;
		for( var i = 0; i< hints.length(); i++ )
		{
			var hint = hints.getByIndex(i);
			if( hint.start != index ){
				if( !bInit && hint.length != 0 )//may init paragraph from split json
					hasError = true;
				hint.setStart( index );
			}
			if( hint.start > (start+length)|| hint.length < 0 || ( hint.length>0 && (hint.start >= (start+length))) ){
				hints.remove( hint );
				if( !isloading || bInit )
					hint.markDelete();
				hasError = true;
				continue;
			}
			index += hint.length;
		};
		
		if( start+length != index )
		{
			var hint = hints.getLast();
			if( hint ){
				hint.setLength( start+length - hint.start );
				if( !isloading || bInit )
					hint.markDirty();
				hasError = true;
			}
		}
		this.fillHintIfEmpty();
		if( hasError )
			console.error("error happend in hints list!!");
	},
	
	fillHintIfEmpty: function( paragraphRPR )
	{
		var empty = true;
		this.hints.forEach(function(run){
			if(run.modelType != writer.MODELTYPE.BOOKMARK
				&& !writer.util.ModelTools.isAnchor(run)){
				empty = false;
				return false;
			}
		}); 
		if ( empty ){
			// If the paragraph is empty will create a dummy run with its paragraph's run property
			paragraphRPR = paragraphRPR?dojo.clone(paragraphRPR) : "";
			if( paragraphRPR && paragraphRPR.styleId == "Hyperlink"){
				delete paragraphRPR.styleId;
				delete paragraphRPR.color;
			}
			
			this.hints.appendFront(new writer.model.text.TextRun({s:0,l:0, "style":paragraphRPR}, this));
		}
		
		//insert empty hint for block ojbect
		var blocks = [], that = this;
		this.hints.forEach(function(run){
			if( writer.util.ModelTools.isDrawingObj( run )){
				var prev = that.hints.prev( run );
				while( prev && prev.modelType == writer.MODELTYPE.BOOKMARK )
					prev = that.hints.prev( prev );
				if( !prev || writer.util.ModelTools.isDrawingObj( prev ) ){
					blocks.push( run );
				}
			}
		}); 
		for( var i=0; i< blocks.length; i++ ){
			paragraphRPR = paragraphRPR? dojo.clone(paragraphRPR) : "";
			this.hints.insertBefore(new writer.model.text.TextRun({s:blocks[i].start,l:0, "style":paragraphRPR}, this ),blocks[i]);
		}
		
		
		var last = this.hints.getLast();
		while( last && (last.modelType == writer.MODELTYPE.BOOKMARK || last.br ))
			last = this.hints.prev( last );
		
		if( last && writer.util.ModelTools.isDrawingObj( last )){
			paragraphRPR = paragraphRPR? dojo.clone(paragraphRPR) : "";
			this.hints.insertAfter(new writer.model.text.TextRun({s: last.start + last.length,l:0, "style":paragraphRPR},this), last );
		}
	},
	
	createListRuns: function()
	{
		if(!this.listSymbols)
			return;
		this.listRuns = {};
		if (this.listSymbols.txt) {
			var textRun = new writer.model.text.TextRun(null, this, this.listSymbols.txt);
			textRun.isListRun = true;
			this.listRuns['txt'] = textRun;
			var listProp = this.getListSymbolProperty();
			if(listProp)
				textRun.textProperty = listProp;
		}
		if (this.listSymbols.imageId || this.listSymbols.imageId == 0){
			this.listRuns['img'] = pe.lotusEditor.number.getImg(this.listSymbols.imageId, this);
		}
	},
	buildRuns: function()
	{
		//this.container.removeAll();
		this.container = new common.Container(this);
		
		this.createListRuns();
		var paragraph = this;
		var last = this.hints.getLast();
		if (writer.util.ModelTools.isParagraph(paragraph) && last && last.br && last.br.type != "page" ){
			//for break, add a dummy run after this br with br run text style
			this.hints.append(new writer.model.text.TextRun({s:last.start+last.length,l:0,style:last.textProperty.toJson()}, this));
		}
		 
		this.hints.forEach(function(run){
			var textRuns = run.createRun();
			if(!textRuns)
				return;
			
			if(textRuns.isContainer){
				paragraph.container.appendAll(textRuns);
			}else{
				paragraph.container.append(textRuns);
			}
		}); 
		
		return this.container;
	},
	removeChildTextRun:function(childTextRun){
		if(this.hints.length()<=1){
			return false;
		}else{
			this.hints.remove(childTextRun);
			return true;
		}
	},
	
	firstChild: function(){
		if (!this.hints){
			return null;
		}
		return this.hints.getFirst();
	},
	lastChild: function(){
		if (!this.hints){
			return null;
		}
		return this.hints.getLast();
	},
	
	nextChild: function( m ){
		if (!this.hints){
			return null;
		}
		return this.hints.next(m);
	},
	
	previousChild: function( m ){
		if (!this.hints){
			return null;
		}
		return this.hints.prev( m );
	},
	
	/**
	 * Insert an Object (link,field ...)  into model 
	 * @param cnt: {"fmt" : [ {
				"style" : {
					"styleId" : "Hyperlink"
				},
				"rt" : "rPr",
				"s" : 5,
				"l" : 5
			} ],
			"id" : "2",
			"rt" : "hyperlink",
			"src" : "http://www.ibm.com" }
	 * @param index: insert position.
	 */
	insertObject: function( cnt, index, bNotMark )
	{
		var hint = this.byIndex( index );
		if( !hint ){
			hint = this.hints.getLast();
		}
		var prop = writer.model.text.Run.createRun(cnt, this);
		if( prop ){
			hint = hint.insertHint( index, prop  );
			// Check if there is a blank text run is next to the inline Object run and it needs to be deleted.
			var nextHint = this.hints.next( hint );
			if(nextHint && nextHint.isTextRun && nextHint.isTextRun() &&  nextHint.length == 0)
				this.removeObject(nextHint,true);
			else
				this.fixStart(hint);
			this.markDirty();
		}
		return prop;
	},
	/*
	 * removeObject from hints
	 */
	removeObject: function( obj, bNotMark )
	{
		var next = this.hints.next(obj);
		var len = obj.length;
		
		this.hints.remove(obj);
		!bNotMark && obj.markDelete();
		next && next.moveBackward( -len, true );
	},
	/**
	 * check start from fromHint
	 * @param from
	 */
	fixStart: function( fromHint ){
		var hints = this.hints;
		if( !fromHint ){
			fromHint = hints.getFirst();
		}
		var index;
		while( fromHint ){
			if( index == null )
				index = fromHint.start || 0;
			else if( fromHint.start != index ){
				fromHint.setStart( index );
			}
			index += fromHint.length;
			fromHint = this.hints.next( fromHint );
		}
	},
	/**
	 * Insert formats into model
	 * @param formats : [{ "att":"tp", "style":{"b":1}, "l" :1} ]
	 * @param index The insert position.
	 * @param len  The formats length.
	 */
	insert: function(formats, index, len )
	{
		var prop,l, hint, retIndex = index, next ;
		for( var i = 0; i< formats.length; i++ ){
			hint = this.byIndex( index, false, true );
			
			if( hint && index == ( hint.start + hint.length )){
				next =  this.hints.next(hint);
				while( next && next.modelType == writer.MODELTYPE.BOOKMARK){
					hint = next;
					next = this.hints.next(hint);
				}
			}
			
			if( !hint ){
				hint = this.hints.getLast();
			}
			l = parseInt(formats[i].l) || 0;
			prop = writer.model.text.Run.createRun(formats[i], this);
			if( prop ){
				if(!hint){
					this.hints.append(prop);
					hint = prop;
				}
				else if( hint.modelType == writer.MODELTYPE.BOOKMARK ){
					this.hints.insertAfter(prop, hint);
				}
				else{
					var oldHint = hint;
					hint = hint.insertHint( index, prop  );
					if( hint != oldHint && i==0 )
					//not inserted into
						retIndex = hint.start;
					if (hint === oldHint && prop.clist&& prop.clist.length>0) // merged into existing hints, this run will then be thrown off
						prop.markDelete && prop.markDelete();  
				}
				prop.insertSel&&prop.insertSel();
				if(prop.container){
					prop.container.forEach(function(r){
						r.insertSel&&r.insertSel();
					});
				}
				this.fixStart(hint);
				index += l;
			}
		}
		return retIndex;
	},
	
	/**
	 * use to get text run which inserted text follow
	 * @param index
	 */
/*	getFollowTextRun: function(  index, curObj ){
		var modelTools = writer.util.ModelTools;
		if( !curObj ) curObj = (index >0 ) ? this.byIndex(index-1) : this.byIndex( 0 ); 
		
		if( curObj && ( ( modelTools.isInlineObject(curObj) && !curObj.anchor ) || modelTools.isAnchor(curObj))
			&& ( index== curObj.start || (index ==curObj.start+ curObj.length) ))
		{
			var siblingRun = curObj.previous();
			while(siblingRun)
			{
				if(siblingRun.isTextRun && siblingRun.isTextRun() && siblingRun.modelType != writer.MODELTYPE.BOOKMARK )
					break;
				else
					siblingRun = siblingRun.previous();
			}
			if(!siblingRun)
			{
				siblingRun = curObj.next();
				while(siblingRun)
				{
					if( siblingRun.isTextRun && siblingRun.isTextRun() && siblingRun.modelType != writer.MODELTYPE.BOOKMARK )
						break;
					else
						siblingRun = siblingRun.next();
				}
			}
			return siblingRun;
		}
		return curObj;
		
	},*/
	/**
	 * insert text in the position of index
	 * @param text
	 * @param index
	 */
/*	addTextLength: function( len, index )
	{
		var curObj =  (index >0 ) ? this.byIndex(index-1) : this.byIndex( 0 );
		if( curObj && ( ( curObj.start + curObj.length ) == index ) )
		{
			var nextObj =  curObj.next();
			if( nextObj && nextObj.length==0 && nextObj.isTextRun && nextObj.isTextRun())
			//follow next empty text run
				curObj = nextObj;
		}
		
		if( curObj && curObj.br ) //br run
			curObj = curObj.next();
		
		while( curObj && !curObj.length && ( curObj.isTextRun && !curObj.isTextRun() )){
			//skip bookmark
			curObj = curObj.next();
		}
		
		var followObj = null;
		if( curObj )
			followObj = this.getFollowTextRun( index, curObj);
		
		if( ( curObj != followObj )|| !curObj  )
		{
			var cnt = {};
			if(followObj)
				cnt.fmt = [followObj.toJson(index, len)];
			else
				cnt.fmt = [{"rt":"rPr", "s":index, "l": len}];
			this.insert(cnt.fmt, index);
			return true;
		}
		else
		{
			if( curObj.addTextLength( len, index ))
			{
				this.fixStart( curObj );
				this.markDirty();
				return true;
			}
		}
		return false;
	},
*/
	addTextLength: function( len, index )
	{
		var ret = this.getInsertionTarget(index);
		if (ret.target && ret.target == ret.follow)
		{
			var targetObj = ret.target;
			if (targetObj.addTextLength(len, index))
			{
				this.fixStart(targetObj);
				this.markDirty();
				return true;
			}
		}
		else {
			var cnt = {};
			var followObj = ret.follow;
			if (followObj)
				cnt.fmt = [followObj.toJson(index, len)];
			else
				cnt.fmt = [{"rt":"rPr", "s":index, "l": len}];
			this.insert(cnt.fmt, index);
			return true;
		}
		
		return false;
	},
	_canfollow:function(run){
		if(run.modelType==writer.MODELTYPE.RFOOTNOTE||run.modelType==writer.MODELTYPE.RENDNOTE){
			return false;
		}
		return true;
	},
	getInsertionTarget: function(index)
	{
		var curObj =  (index > 0) ? this.byIndex(index-1) : this.byIndex(0);
		var followObj = curObj;
		if (!curObj)
		{	// need to create new run
		}
		else {
			if(  curObj.canInsert && !curObj.canInsert())
			//can not insert into page number field
				index = curObj.start + curObj.length;
			
			if ( (index > curObj.start) && (index < curObj.start + curObj.length) )
			{	// in middle of a text run
				// directly add into existing text run
			}
			else
			{
				while( curObj && !curObj.length && ( curObj.isTextRun && !curObj.isTextRun() ))
				{	// skip bookmark 
					curObj = curObj.next();
				}
				if( curObj )
				{
					if (index == curObj.start)
					{
						// at the beginning of a text run
					}
					else
					{	// at the end of a text run
						var nextObj = curObj.next();
						if (nextObj && !nextObj.length && nextObj.isTextRun && nextObj.isTextRun())
						{	// an empty text run follows
							curObj = nextObj;
						}
						
						if (curObj.br)
						{	// end of a br
							curObj = curObj.next();
						}
	
					}
				}
				
				followObj = curObj;
				// now there are situations which makes the insertion should not follow the target run's style
				// e.g, insertion at the end of a link
				// check if the end of the comment
				var isCommentObj = false;
				if(curObj && !pe.lotusEditor.relations.commentService.isCommentContinued(curObj,index))
					isCommentObj = true;
				var modelTools = writer.util.ModelTools;
				if ( curObj && (modelTools.isInlineObject(curObj) && ( modelTools.isLink(curObj) || !curObj.anchor ) || modelTools.isAnchor(curObj) || modelTools.isTextBox(curObj) || isCommentObj ||!this._canfollow(curObj) ))
				{
					var siblingRun = curObj.previous();
					while(siblingRun)
					{
						if(siblingRun.isTextRun && siblingRun.isTextRun() && siblingRun.modelType != writer.MODELTYPE.BOOKMARK && this._canfollow(siblingRun))
							break;
						else
							siblingRun = siblingRun.previous();
					}
					if(!siblingRun)
					{
						siblingRun = curObj.next();
						while(siblingRun)
						{
							if( siblingRun.isTextRun && siblingRun.isTextRun() && siblingRun.modelType != writer.MODELTYPE.BOOKMARK && this._canfollow(siblingRun))
								break;
							else
								siblingRun = siblingRun.next();
						}
					}
					followObj = siblingRun;
				}
			}
		}
		
		var ret = {};
		if (curObj && curObj.br)
		{	// it's still a br, a new run should be created
			curObj = null;
		}
		if(!followObj && curObj && !curObj.hints && this._canfollow(curObj)){
		//do not follow inline ojbects
			followObj = curObj;
		}
		
		ret.target = curObj;
		ret.follow = followObj;
		return ret;
	},
	
	/**
	 * split a text run in idx position.
	 * return the right part of split result
	 * own is the left part.
	 *  @param idx
	 *  @returns right text runs of split result
	 */
	split: function(idx, len  ){
		
		if( idx <= this.start && len == this.length )
			return;
		
		if( idx >= ( this.start + this.length ) )
			return;
		
		// When the length is 0, the by Index will return the left side object, otherwise will return the right object
		// run1.start = 0, run1.length = 1, run2.start = 1, run2.length =1;
		// The this.byIndex(idx, null, true) will return run 1, this.byIndex(idx, null, false) will return run 2
		var bLeftSide = !len;
		var hint = this.byIndex( idx, null,  bLeftSide);
		var tools = writer.util.ModelTools;		
		if( !hint )
			return;
		// if it is image or textbox
		if(tools.isImage(hint) || tools.isTextBox(hint)){
			hint = this.byIndex( idx, null, !bLeftSide);
			if( !hint )
				return;
		}
		
		var right = hint.split( idx,len );
		hint.markDirty();
		
		if( len == null || len <= 0 )
		{
			// For empty paragraph, only need to return the empty run
			if(right == hint && tools.isParagraph(this) && tools.isEmptyParagraph(this))
				return hint;
			var cloneObj = hint.clone();
			cloneObj.length = 0;
			if(idx == 0)
			{
				// In the beginning of hints.
				cloneObj.start = 0;
				hint.parent.hints.insertBefore( cloneObj, hint );
			}
			else
			{	
				cloneObj.start = hint.start + hint.length;
				hint.parent.hints.insertAfter( cloneObj, hint );
			}
			cloneObj.markInsert();
			return cloneObj;
		}
		else
		{
			
			var hint2 = this.byIndex( idx + len -1 );
			
			if( hint2 )
			{
				right = hint2.split( idx + len );
				right && hint2.markDirty();
			}
		
			return right;
		}
	},
	
	splitRuns:function(start,len){
		var ret = new common.Container(this);
		
		if( len <=0 || len == null )
		{
			var right = writer.model.Hints.prototype.split.apply( this,[start] );
			right && ret.append(right );
			this.buildRuns();
		}
		else
		{
			writer.model.Hints.prototype.split.apply( this,[start,len] );
			this.buildRuns();
			this.container.forEach( function( run )
			{
				if(run.start >= start && ( run.start + run.length )<= ( start + len ))
					ret.append( run);
				else if(run.start > (start + len) )
					return false;
			});
		}
		
		return ret;
	},
	/**
	 * Return the object by index
	 * @param index The index of paragraph
	 * @param bLeftSide, return left side first
	 * 
	 * @Sample
	 *   run1.start = 0, run1.length = 1; run2.start = 1, run2.length =1;
	 *   The this.byIndex(1, null, true) will return run 1, this.byIndex(1, null, false) will return run 2
	 */
	byIndex: function(index, bSearchChild, bLeftSide )
	{
		var ret = null;
		
		var hints = this.hints;
		hints.forEach( function(hint){
			if(  bSearchChild )
				ret = hint.byIndex( index, bSearchChild, bLeftSide );
			else if( index >= hint.start && 
					(index < ( hint.start + hint.length ) || ( (bLeftSide || !hint.length) && index == ( hint.start + hint.length ))))
				ret = hint;
			
			if( ret )	
				return false;
		});
		return ret;
	},
	/**
	 * Return the deep level text run
	 * @param index
	 * 
	 * For link, will return the internal run.
	 */
//	getTextRunByIndex: function(index)
//	{
//		var ret = this.byIndex(index);
//		if(ret && ret.getTextRunByIndex)
//			return ret.getTextRunByIndex(index);
//		
//		return ret;
//	},
//	/**
//	 * Check the position is an image object. 
//	 * @param index
//	 */
//	isImage: function(index)
//	{
//		var obj = this.byIndex(index);
//		return obj && obj.modelType == "run.image";
//	},
	
	/**
	 * Generate JSON format
	 * @param index
	 * @param length
	 */
	hintsToJson: function(index, length, btrimBookmark )
	{
		var jsonData = [];
		var start = 0;
		var oldIndex = index;
		this.hints.forEach(function(prop){
			//Bookmark no start...
			if( prop.start == null )
				prop.start = start;
			start += prop.length || 0;
			
			if( prop.length == 0 && prop.isTextRun && prop.isTextRun() && prop.next && prop.next())
				return;
			if( btrimBookmark && start == oldIndex && prop.modelType == writer.MODELTYPE.BOOKMARK )
			//trim bookmark of left side
				return;
			if(prop.start <= index)
			{
				if( ( prop.length && ((prop.start + prop.length) <= index) )
						|| ( !prop.length && prop.start < index ))
					return;
				
				var len = Math.min(prop.length - index + prop.start, length);
				jsonData.push( prop.toJson(index, len) );
				length -= len;
				if(length <= 0 )
					return false;
				index += len;
			}
			else if(prop.start < (index + length))
				jsonData.push( prop.toJson(index, length) );
			else if( prop.start == null )
				return false;
		}); 	
		
		return jsonData;
	},
	/**
	 * Need override this function for link, field and toc.
	 * @param id
	 * @returns
	 */
	byId: function(id)
	{
		var retModel = null;
		this.hints.forEach(function(child){
			if( child.id == id)
			{
				retModel = child;
				return false;
			}
			else
			{
				var ret = child.byId && child.byId(id);
				if(ret)
				{
					retModel = ret;
					return false;
				}
			}	
		});
		
		return retModel;
	},
	/*
	 * search deep hint of the child
	 */
	getChildHint: function( filterFunc )
	{
		var retModel = null;
		this.hints.forEach(function(child){
			if( filterFunc( child ))
			{
				retModel = child;
				return false;
			}
		});
		
		if( retModel && retModel.getChildHint )
		{
			var m = retModel.getChildHint( filterFunc );
			if( m ) retModel = m;
		}
		
		return retModel;
	}
};
