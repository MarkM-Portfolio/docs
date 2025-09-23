dojo.provide("writer.common.RangeIterator");

dojo.require("writer.model.Model");
dojo.require("writer.core.Range");
dojo.require("writer.util.ModelTools");

dojo.declare("writer.common.RangeIterator", null, {
	//start and end are obj with two members 'obj' and 'index'
	_start: null,
	_end: null,
	_isEnd: false,
	_currentModel: null,
	_collapsed: false,
	_maxParagraphCount : 10000000, // The range iterator 
	constructor: function(range, paragraphLimit)
	{
		if(!range){
			throw "null reference of range in RangeIterator's constructor";
		}
		if(!range.getStartModel){
			return;
		}
		try{
			this._start = range.getStartModel();
			this._end = range.getEndModel();
			if (!this._start || !this._end){
				throw "range not right, should have start and end!!";
			}
			if(paragraphLimit)
				this._maxParagraphCount = paragraphLimit;
			this._collapsed = range.isCollapsed();
			this._currentIdx = 0;
			this._walkers = [];
			if(!range.isSplited){
				// temp code. the range end index sometime will be -1; it is wrong!
				if(this._end.index==-1){
					this._end.index = this._start.index;
				}
				this._initWalker({obj:this._start.obj,index:this._start.index}, {obj:this._end.obj,index:this._end.index});
			}else{
//				console.info("no need to create iterator!");
			}
			
		}catch(e){
			console.info("error,debugger!" + e);
		}
		
		
	},

	_isRichText: function(model){
		return (model && model.modelType == writer.MODELTYPE.TEXT);
	},
	
	nextRichText: function(){
		return this.nextModel( this._isRichText );
	},
	
	nextBlock: function(){
		return this.nextModel( writer.util.ModelTools.isBlock );
	},
	
	/**
	 * Get next paragraph of the iterator
	 */
	nextParagraph:function()
	{
		return this.nextModel( writer.util.ModelTools.isParagraph );
	},
	_initWalker:function(start,end){
		var tools = writer.util.ModelTools;
		var walkers = this._walkers||[];
		if((tools.isRun(start.obj) && !tools.isChildOf(end.obj,start.obj)) || (tools.isDrawingObj(start.obj)&& !tools.isChildOf(end.obj,start.obj)) ||tools.isParagraph(start.obj)){
			var startPara = tools.isParagraph(start.obj)?start.obj:tools.getParagraph(start.obj);
			var walker = {};
			walker.start={};
			walker.end = {};
			walker.start.obj = start.obj;
			walker.start.index = start.index;
			walkers.push(walker);
			if(tools.isRun(end.obj) || (tools.isDrawingObj(start.obj)&&! tools.isChildOf(end.obj,start.obj)) ||tools.isParagraph(end.obj)){
				var endPara = tools.isParagraph(end.obj)?end.obj:tools.getParagraph(end.obj);
				if(endPara==startPara){
					walker.end.obj = end.obj;
					walker.end.index  = end.index;
					return;
				}							
			}
			walker.end.obj = startPara;
			walker.end.index  = tools.getLength(startPara);	
			// for the next block;
			var nextBlock = startPara.next();
			if(nextBlock){
//				this._initWalker({obj:nextBlock,index:0},end);	
				this._initWalker({obj:startPara.parent,index:startPara.parent.getContainer().indexOf(startPara)+1},end);	
			}else{
				this._initWalker({obj:startPara.parent,index:writer.util.ModelTools.getLength(startPara.parent)},end);
			}
		}else {
			if(start.obj==end.obj){
				var endIndex = end.index;
				var firstChild = start.obj.getItemByIndex(start.index);
				for(var i= start.index;i< endIndex;i++){
					walkers.push( new writer.common._RangeIterator(firstChild) );
					firstChild = firstChild.next(firstChild);
					
					if(walkers.length > this._maxParagraphCount)
						return;
				}
				return;
			}else{	
				var startIndex = start.index;
				var endIndex = tools.getLength(start.obj);
				var child = start.obj.getItemByIndex(start.index);
				for( var i = start.index; i< endIndex && child; i++ ){
					if( child == end.obj  ||  tools.getParent( end.obj, function( m ){ return m == child;} )){
					//child == end.obj or child contains end.obj
						this._initWalker({obj:child,index:0},end);
						return;
					}
					else
					{
						if(walkers.length > this._maxParagraphCount)
							return;
						
						walkers.push( new writer.common._RangeIterator(child));
						child = child.next();
					}
				}
			//	var _it = new writer.common._RangeIterator(start.obj);
			//	walkers.push(_it);
			}			
			
			var next = start.obj.next();
			if(next){
				this._initWalker({obj:next,index:0},end);	
			}else if ( start.obj.parent ){
				this._initWalker({obj:start.obj.parent,index:writer.util.ModelTools.getLength(start.obj.parent)},end);	
			}
						
		}
	},
	nextModel:function(guard){
		if(this._currentIdx >=this._walkers.length){
			return null;
		}
		var currentWalker = this._walkers[this._currentIdx];
		if(currentWalker._isRI){
			var next =  currentWalker.nextModel(guard);
		}else{
			var next =  this._nextModel(currentWalker,guard);	
		}			
		if(next){
			return next;
		}else{
			this._currentIdx ++;
			return this.nextModel(guard);
		}
	},
	/**
	 *TODO: isDeepSearch
	 * isDeepsearch boolean  true for deep-first search
	 * false for next by next
	 */
	_nextModel: function( walker, guard ){
		//TODO:
		//Check this._start is end of start object;
		//Check this._end is start of end object;
		
		// Check if the model is a block object but not a paragraph. 
		var tools = writer.util.ModelTools;
		var isNotParagraphBlock = function(model)
		{
			return (tools.isBlock(model) && !tools.isParagraph(model));
		};
		
		if (!this._currentModel){
			this._currentModel = walker.start.obj;
			this._endGuard = null;
			var index = walker.start.index;
			if( index == null || index == 0 || index <= tools.getLength( this._currentModel ) || ( walker.start.obj == walker.end.obj  && walker.start.index == walker.end.index ) ){
			//is not the end of startModel
				if( !guard || guard( this._currentModel ) )
				{
					//defect38548, return the right run model if the _currentModel is wrong
					var currRun;
					if(this._currentModel.modelType == writer.MODELTYPE.TEXT )
					{
						currRun = tools.getParagraph(this._currentModel).byIndex(this._currentModel.start);
						if(this._currentModel != currRun){
							this._currentModel = currRun;
							return currRun;
						}
					}
					return this._currentModel;
				}
				else{
					var p =  tools.getParent( this._currentModel, guard );
					if( p ){
						this.notSearchChild = true;
						this._currentModel = p;
						return p;
					}
				}
			}
		}
		
		// The first time call
		if(!this._endGuard && this._endGuard != "")
		{
			this._endGuard = tools.getNext( walker.end.obj, guard) || "";
		}
		var guardNode = this._endGuard == "" ? null : this._endGuard;
		
		var current = this._currentModel;
		// For select one cell, start object equal end object
//		if (!this._end.obj || current == this._end.obj || tools.getParent( this._end.obj, function( m ){ return m == current;}) ){
		if (!walker.end.obj || tools.getParent( walker.end.obj, function( m ){ return m == current;}) ){
			this._currentModel = null;
			return null;
		}
		
		var startFromChild = !this.notSearchChild && isNotParagraphBlock(this._currentModel);
		this.notSearchChild = false;
		this._currentModel = tools.getNext( this._currentModel, guard, startFromChild, guardNode);
		
		return this._currentModel;
	},
	/**
	 *  If the range is collapsed. Collapsed case will return left side run.
	 *  run1.start = 0, run1.length = 1; run2.start = 1, run2.length =1;
	 *  The this._collapsed is true, this.getRun(p, 1) will return run 1. 
	 *  The this._collapsed is false, this.getRun(p, 1) will return run 2.
	 *   
	 * @param p
	 * @param i
	 * @param isLast
	 * @returns {Boolean}
	 */
	getRun:function(p,i,isLast){
		if( !writer.util.ModelTools.isParagraph(p) && p.getContainer ){
			if(p.getContainer().length() == 0)	// For empty shape, like arrow.
				return null;
			p = p.getContainer().getByIndex(i);
			p = p && writer.util.ModelTools.getFirstChild( p, 
					writer.util.ModelTools.isParagraph, true );
			i =0;
		}
		var t = p && p.container && p.container.getFirst();
		while(t){
			// Change "t.start+t.length > i" to "t.start+t.length>=i".
			// For case insert text at the end of run, the command will update with next run's status. 
			// _collapsed
			if(t.start<=i && (t.start+t.length>i || (this._collapsed && t.start+t.length == i)) || (isLast && t.start+t.length==i)){
				return t;				
			}
			t=t.next();
		}
		return null;
	},
	next:function(fn){
		var cur = this.cur;
		if(!fn) fn=this._isRichText;//set default model type
		var tool = writer.util.ModelTools;
		if(!this.sobj)
			this.sobj=this._start.obj;
		if(!this.eobj){
			this.eobj=this._end.obj;
			this.fake = fn(this.eobj) && this._end.index==0 || (!fn(this.eobj)&&this._end.index==this.eobj.start);
		}
		//first iterator
		if(!this.cur) {
			if(fn && fn(this.sobj)){
				this.cur=this.sobj;
				if(this._start.index==this.cur.length){
//					this.cur=tool.getNext(this.cur,fn);
					var next=tool.getNext(this.cur,fn);
					
					if(this.sobj==this.eobj) {
						if(next && next.paragraph==this.sobj.paragraph){
							if(this._start.index==this._end.index){//collapse

							}else{
								this.eobj = next;
							}
						}else{//at the end of the paragraph.
//							this.cur=null;
						}
					}
				}
			}else{
				this.cur=this.getRun(this.sobj,this._start.index);
				this.sobj=this.cur;
				this.eobj=this.getRun(this.eobj,this._end.index,true);
			}
		}else{
			if(fn && fn(this.eobj)){
				if((this.fake && tool.getNext(this.cur,fn)==this.eobj) ||!this.fake && this.cur==this.eobj){
					this.cur=null;
				}
				else if(this.sobj==this.eobj){
					this.cur=null;
				}
				else if (this.cur==this.eobj && this.cur.start==this._end.index){
					this.cur=null;
				}
				else{
					do{
						var n = tool.getNext(this.cur,fn);
						this.cur=n;
					}
					while(this.cur && this.cur.length==0);
				}
			}
		}
		if (this.cur == cur){
			return null;
		}
		return this.cur;
	}
});
dojo.declare("writer.common._RangeIterator", [writer.common.RangeIterator], {
	_isRI:true,
	constructor: function(model)
	{
		this._start = {obj:model,index:0};
		this._end = {obj:model,index:writer.util.ModelTools.getLength(model)};
		if (!this._start || !this._end){
			throw "range not right, should have start and end!!";
		}
		this._collapsed = false;
		this._currentIdx = 0;
		this._walkers = [];
		this._initWalker({obj:this._start.obj,index:this._start.index}, {obj:this._end.obj,index:this._end.index});
		
	},
	nextModel:function(guard){
		if(this._currentIdx >=this._walkers.length){
			return null;
		}
		if(guard&&guard(this._start.obj)){
			this._currentIdx = this._walkers.length;
			return this._start.obj;
		}else{
			return this.inherited(arguments);
		}
	}
});