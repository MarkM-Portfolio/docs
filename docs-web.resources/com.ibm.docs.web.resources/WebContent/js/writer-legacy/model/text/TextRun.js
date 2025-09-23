dojo.provide("writer.model.text.TextRun");
dojo.require("writer.model.text.Hint");
dojo.require("writer.model.prop.TextProperty");

writer.model.text.TextRun = function(json, owner, text){
	
	if (text) {
		this.text = text;
		this.start = 0;
		this.length = text.length;
	} else {
		this.start = -1;
		this.length = -1;
	}
	this.textProperty= new writer.model.prop.TextProperty(json && json.style);
	if(!owner){
		//console.error("The text run must have a parent!");
		return;
	}
	this.paragraph =  owner.paragraph||owner;
	this.parent = owner;
	this.revision = false;
	this.comment_selected = false;
	this.clist = [];
	// use Style should removed after import change attributes into style object.
	this.fromJson(json);
//	this.resetSplitChars();

	// only for debug
	//this._text = this.getText();
};
writer.model.text.TextRun.prototype= {
	modelType:writer.MODELTYPE.TEXT,
	splitChars : ['\t', '\r'],
	addViewerCallBack:function(view){
    	
    },
//	resetSplitChars: function() {
//		this.splitChars = ['\t', '\r'];
//		if(this.paragraph.directProperty&&this.paragraph.directProperty.getAlign()=='justified'){
////			this.splitChars.push('\u0020');
//		}
//	},
    /**
     * return if it is rich text
     * @returns {Boolean}
     */
    isTextRun: function(){ 
    	if( this.br )
    		return false;
    	else
    		return true;
    },
    isPageBreak: function(){
    	if (this.br && this.br.type == "page")
    		return true;
    	else
    		return false;
    },
    fromJson:function(jsonSrc){
    	if(jsonSrc){
			if (this.start < 0) this.start = ( jsonSrc.s && parseInt(jsonSrc.s) ) || 0;	// TODO remove the parseInt after conversion changed.
			if (this.length <0) this.length = ( jsonSrc.l && parseInt(jsonSrc.l) ) || 0 ;
			
			if (jsonSrc.br){
	    		//for break
	    		this.br = jsonSrc.br;
	    	}
			if (jsonSrc.tab){
				// for tab
				this.tab = jsonSrc.tab;
			}
			if (jsonSrc.ptab){
				// for absolute positional tab
				this.ptab = jsonSrc.ptab;
			}
			this.author = jsonSrc.e_a;
			//defect 40937
			if(jsonSrc.sym){
				this._sym = jsonSrc.sym;
			}
    		if(jsonSrc.cl)
    		{
    			var cs = pe.lotusEditor.relations.commentService;
    			cs.trySetComment(this,jsonSrc,false);
    		}
    	}
    },
    toJson: function(index, length){
    	var jsonData = {};
		jsonData.style = this.textProperty.toJson();
		if(jsonData.style && jsonData.style["coloreBeforeIME"]){
			delete jsonData.style["coloreBeforeIME"];		
		}
		jsonData.rt = writer.model.text.Run.TEXT_Run;
		jsonData.s = "" + (index == undefined ?  this.start : index);
		jsonData.l = "" + (length == undefined ? this.length : length);
		if( this.author ) 
			jsonData.e_a = this.author;
		if (this.br){
			jsonData.br= this.br;
		}
		if (this.tab){
			jsonData.tab = this.tab;
		}
		if (this.ptab){
			// for absolute positional tab
			jsonData.ptab = this.ptab;
		}
		if(this.clist.length>0) {
			jsonData.cl = [];
			jsonData.cl = this.clist.concat();
			jsonData.cselected = this.comment_selected;
		}
		//defect 40937
		if(this._sym){
			jsonData.sym = this._sym;
		}
		return jsonData;
    },
	mark:function(tag){
		this[tag]=true;
	},
	markDelete:function(){
		this.deleted = true;
	},
	markDirty:function(){
		this.clearCache();
		this.dirty =true;
	},
	markInsert:function(){
		this.inserted = true;
	},
	createRun: function(reset)
	{
		if(!this.paragraph)
			return null;
		
		return this;
	},
	setStyle:function(styleDef,bRemove){
		this.textProperty.setStyle(styleDef, bRemove);
		this.markDirty();
	},
	getStyle:function(){
		return this.textProperty.getStyle();
	},
//	getComputedStyle:function(){
//		if(!this.paragraph){
//			return null;;
//		}
//		var parentTextProperty = this.paragraph.getMergedTextProperty();
//		return this.textProperty.getComputedStyle(parentTextProperty);
//	},
	/**
	 * Need override function.
	 */
	equalStyle: function(destProp){
		if (this.modelType != destProp.modelType)
			return false;
			
		if (this.br && !destProp.br || !this.br && destProp.br)
			return false;
			
		if (this.br && destProp.br && this.br.type != destProp.br.type)
			return false;
	
		return this.textProperty.equalStyle(destProp.textProperty);
	},
	
	equalComment: function(destProp){
		if(this.clist.length != destProp.clist.length)
			return false;
		for(var i=0;i<this.clist.length;i++){
			var find = false;
			for(var j=0;j<destProp.clist.length;j++)
			{
				if(this.clist[i]==destProp.clist[j]){
					find = true;
					break;
				}
			}
			if(find==false)
				return false;
		}
		return true;
	},
	
	/**
	 * split a text run in idx position.
	 * return the right run of split result
	 * own is the left part.
	 *  @param idx
	 *  @param len
	 *  @returns right text run of split result
	 */
	
	split: function( idx, len ){
		if( len <= 0 || len == null )
		{
			if( idx == this.start )
				return this;
			
			if( idx >= ( this.start + this.length ) )
				return null;
			
			var cloneTextRun = this.clone();
			
			if(this.text){
				cloneTextRun.text = this.text.substr(idx - this.start,this.length -1);
			}
			cloneTextRun.start = idx;
			cloneTextRun.length = this.start + this.length - idx;
			
			this.parent.hints.insertAfter( cloneTextRun, this );
			cloneTextRun.markInsert();
			
			if(this.text){
				this.text = this.text.substr(0,idx - this.start);
			}
			this.length = idx - this.start;
			this.markDirty();
			
			return cloneTextRun;
		}
		else
		{
			var right = this.split(idx );
			if( right )
				right = right.split( idx + len );
				
			return right;
		}
	
	},
	clone:function(){
		var cloneTextRun = new writer.model.text.TextRun();
		cloneTextRun.paragraph = this.paragraph;
		cloneTextRun.parent = this.parent;
//		cloneTextRun.splitChars = this.splitChars.concat();
		cloneTextRun.author = this.author;
		cloneTextRun.start = this.start;
		cloneTextRun.length = this.length;
		cloneTextRun.textProperty =  this.textProperty.clone();
		cloneTextRun.revision = this.revision;		
		cloneTextRun.comment_selected = this.comment_selected;
		if(this.clist.length>0) {
			cloneTextRun.clist = this.clist.concat();
			pe.lotusEditor.relations.commentService.insertCmtTextRun(cloneTextRun);
			
		}else
			cloneTextRun.clist = [];
		return cloneTextRun;
	},

    //override preLayout method
    //One text property run may contains more than 1 tabs, split it 
    preLayout: function(ownerId){
    	this._initView(ownerId);
		var text = null;
		if (this.text) {
			text = this.text;
		} else {
			text = this.paragraph.text;
		}
		if (!text){
			text = "";
		}
		var startIndex = this.start;
		var constructor = this.viewConstructors[this.modelType];
		
		var run,splitRun/*splitRun includes tab,shift+enter,Alignment */;
		var split = this.splitViewByChar(text, startIndex);
		if (split==null){
			var viewer = new constructor(this,ownerId);
			viewer.preMeasure && viewer.preMeasure();
			this.addViewer(viewer,ownerId);
			return viewer;
		}else{
			var newviews = [];
			var endIndex = split.index;
			var mark_splitted = false;
			while(endIndex>=0 && endIndex < this.start + this.length){
				if (endIndex> startIndex){
					run = new constructor(this,ownerId, startIndex,endIndex - startIndex);
					run.preMeasure && run.preMeasure();
					this.addViewer(run,ownerId);
					newviews.push(run);
					if (mark_splitted)
						{run.markSplittedFlag && run.markSplittedFlag(); mark_splitted = false;}
				}
				
				if (split.constructor) {
					splitRun = new split.constructor(this, ownerId, endIndex,1);
					splitRun.preMeasure && splitRun.preMeasure();
					this.addViewer(splitRun,ownerId);
					newviews.push(splitRun);
					startIndex = endIndex+1;
				} else {
					mark_splitted = true;
					if (run && run.markSplittedFlag) run.markSplittedFlag();
					startIndex = endIndex;
				}
				split = this.splitViewByChar(text,startIndex);
				if(!split){
					endIndex =-1;
				}else{
					endIndex = split.index;
				}
			}
			if (startIndex<this.start + this.length || ( !this.length && startIndex == this.start )){
				run = new constructor(this, ownerId, startIndex, this.start + this.length - startIndex);
				run.preMeasure && run.preMeasure();
				this.addViewer(run,ownerId);
				if (mark_splitted)
				  {run.markSplittedFlag && run.markSplittedFlag(); mark_splitted = false;}
				newviews.push(run);
			}
		}
		return newviews ;
	
    },
    // TODO Remove Alignment object
    splitViewByChar:function(text, start){
    	var min = -1;
    	var index = text.length;
    	for(var i=0;i< this.splitChars.length;i++){
    		var splitChar = this.splitChars[i];
    		var tmp = text.indexOf(splitChar,start);
    		if(tmp>=start&&tmp<index){
    			index =tmp;
    			min = i;
    		}
    	}
    	if(min==-1){
    		return null;
    	}
    	var viewType = null;
    	switch (this.splitChars[min]){
		case '\t': 
			viewType = writer.view.Tab;
			break;
		case '\r' :
			viewType = writer.view.Break;
			break;
    	}
    	
    	// undefined constructor is acceptable
    	var ret = {'constructor':viewType,'index':index};
    	return ret;
    },
    getStyleId: function(){
    	return this.textProperty.getStyleId();
    },
    getCSSStyle:function(){
    	var str = writer.model.Model.prototype.getCSSStyle.call(this);
    	
    	var cmtLen = this.clist.length;
    	if(cmtLen > 0)
    	{
        	var commentService = pe.lotusEditor.relations.commentService;
        	str += commentService.getCSSString(this.clist);
    	}	
    	str += pe.lotusEditor.indicatorManager.getIndicatorClass(this);
    	
		return str;
    },
    /**
	 * @returns Docuemnt's default character style
	 */
	getDefaultStyle:function(){
		if(this.getStyleId())
			return null;
		return pe.lotusEditor.getDefaultTextStyle();
	},
	deleteSel:function(){
		this.markDelete();
		//delete the comment
	//	if(this.clist.length>0) {
			//pe.lotusEditor.relations.commentService.removeCommentRef(this);
	//	}
	},
    getBorder:function(){
		if(this.textProperty){
			var border = this.textProperty.getBorder();
			return border;
		}
	},
	/**
	 * can merge
	 */
	canMerge: function( run )
	{
		// defect 43367
		if(this.tab || this.ptab || run.tab||run.ptab){
			return false;
		}
		var r = ( run.isTextRun && run.isTextRun() && this.isTextRun() && this.equalStyle(run ) && this.equalComment(run));		
		// author same or it is empty text run
		if(r && (run.author == this.author || this.length == 0))
			return true;
		return false;
	},
	/**
	 * add text length
	 * @param len
	 * @param index
	 */
	addTextLength: function( len, index )
	{
		if( this.isTextRun() && index>= this.start && index<= (this.start + this.length )){
			this.length += len;
			this.markDirty();
			return true;
		}
		return false;
	},
	/**
	 * Model function
	 * override this function to avoid merging blue color and underline properties of hyper link 
	 * in table of contents model.
	 * @returns
	 */
	getMergedTextProperty: function(){
		writer.model.Model.prototype.getMergedTextProperty.apply(this );
		if( this.mergedTextProperty && writer.util.ModelTools.isInToc( this ) ){
			if( !this.textProperty._decoration.u)
				this.mergedTextProperty.setStyle({"u":""},true );
			if( !this.textProperty.style["color"] )
				this.mergedTextProperty.setStyle({"color":""},true );
		}
		return this.mergedTextProperty;
	}
};
common.tools.extend(writer.model.text.TextRun.prototype,new writer.model.Model());
common.tools.extend(writer.model.text.TextRun.prototype,new writer.model.text.Hint());