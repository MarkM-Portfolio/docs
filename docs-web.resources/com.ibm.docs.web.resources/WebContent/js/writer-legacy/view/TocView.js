dojo.provide("writer.view.TocView");
dojo.require("writer.view.AbstractView");
dojo.require("writer.view.update.TocViewUpdate");
dojo.require("dojox.html.metrics");
dojo.declare("writer.view.TocView",[writer.view.update.BlockView,writer.view.update.TocViewUpdate,writer.view.AbstractView],
{
	left:0,
	top: 0,
	w:0,
	h:0,
	max_h: 0,
	_borderWidth: 1,
	padding: 6,
	bSplit: false,
	
	constructor: function(  model, ownerId, fromSplit ) {
		this.model = model;
		this.generateUUID();
		this.ownerId = ownerId;
		
		this.bSplit = fromSplit;
		if( !fromSplit )
			this.initTextArea( this.model.container, ownerId );
		else
			this.model.addViewer(this,ownerId);
	
		dojox.html.metrics.initOnFontResize();
		dojo.connect(dojox.html.metrics, "onFontResize", this, "zoomChanged");
	},
// functions must be implemented
	getSpace:function(offsetY,w,h){
		return this.parent.getSpace&&this.parent.getSpace(offsetY,w,h);
	},
	
	getViewType: function(){
		return 'toc';
	},
	
	getLeft: function( ){
		return this.left;
	},
	
	getTop: function(){
		return this.top;
	},
	
	getWidth: function(){
		return this.w;
	},
	
	getHeight: function(){
		return this.h;
	},
	layout:function( parent ){
		//var vTools = writer.util.ViewTools;
		//var body = vTools.isTextBox(parent) ? parent : vTools.getBody( parent );
		this.w = Math.ceil( parent.getWidth(true) );
		this.offsetY = parent.offsetY;
		this.parent = parent;
		this.h = this.layoutText();
		this._hasLayout = true;
	},
	
	highLight: function( highlight ){
		if( this.domNode ){
			if( highlight ){
				dojo.style(
					this.domNode, {
						"border":"1px solid #b5cfe6"
					}
				);
			}
			else{
				dojo.style(this.domNode, {
					"border":"1px solid #ffffff"
					}
				);
			}
			
		}
		
	},
	
	hasLayouted:function(){
		return this._hasLayout;
	},
	canBreak2pieces:function(){
		return true;
	},
	releaseLayout:function(){
		this._hasLayout = false;
	},
	canFit:function(w,h){
		if(this.h <= h){
			return true;
		}else{
			return false;
		}
	},
	canMerge:function(w,h){
		return true;
	},
	merge:function( toc ){
		var last = this.getContainer().getLast();
		var r = toc.getContainer().getFirst();
		if(r && last && r.model==last.model){
			var next = toc.getContainer().next(r);
			last.merge(r);
			r = next;
		}
		while(r){
			this.appendText(r);
			r =  toc.getContainer().next(r);
		}
		this.alignItem();
		this.markDirtyDOM();
		
		this.model.removeViewer(toc,toc.getOwnerId());		
	},
	canSplit:function(w,h){
		return true;
	},
	split:function(w,h, container ){
		var children = this.getContainer();
		var view = children.select(function(p){
			var paraH = p.h || p.getHeight();
			if(h>paraH){
				h -= paraH; 
				return false;
			}else{
				return true;
			}
		});
		
		if(view){
			var breakView = view.split(w,h);
			if(!breakView){
				breakView = view;
			}else if(breakView!=view){
				this.container.insertAfter(breakView,view);
			}
			
			if( breakView == view && view == children.getFirst()){
			//first paragraph
				return this;
			}
			
			var newToc = new writer.view.TocView(this.model,this.getOwnerId(),true);
			newToc.container = this.container.divide(breakView);	
			newToc.w = this.w;
			newToc.parent = container;
			this.alignItem();
			newToc.alignItem();
			newToc.render();
			if( this.domNode && newToc.domNode )
				dojo.style( newToc.domNode,{"border": dojo.style(this.domNode, "border" )} );
			return newToc;
		}
		return null;	
	},
	//used to fix the width of domNode
	//via marginLeft
	_fixMargin: function(){
		var marginleft = 0, childMargin, lineNode;
		var param = this.container.getFirst();
		while(param){
			var childNode = param.domNode;
			lineNode = childNode.firstChild;
			if( lineNode ){
				childMargin = dojo.style(lineNode, "marginLeft" )||0;
				childMargin = parseInt(childMargin);
				if( marginleft > childMargin ) {
					marginleft = childMargin;
				}
			}
			param = this.container.next(param);
		}
		var padding = this.padding;
		dojo.style(this.domNode,{"left":marginleft-padding+"px"});
		dojo.style(this.domNode,{"top": "1px"});
		this.marginLeft = marginleft;
		dojo.style(this.domNode,{"width":( this.w - marginleft + padding*2 )+"px"});
		
		var param = this.container.getFirst();
		if( param && param.domNode ){
			dojo.style(param.domNode, "marginTop", "-1px");
		}
		while( param ){
			childNode = param.domNode;
			if( childNode ){
				dojo.style(childNode, "marginLeft", ( - marginleft + padding )+ "px");
			}
			param = this.container.next(param);
		}
		
	},
	
	render:function(){
		if(!this.domNode){
			this.domNode = dojo.create("div", {
				"class": "Toc",
				"style":("position:relative;width:"+this.w+"px;height:"+(this.h-2)+"px;" + "border: 1px solid #ffffff" )
			});
			var marginleft = 0, childMargin, lineNode;
			var param = this.container.getFirst();
			while(param){
				var childNode = param.render();
				this.domNode.appendChild(childNode);
				param = this.container.next(param);
			}
		
		}else{
			writer.view.update.tools.updateDOM(this.getContainer(),this.domNode);
			dojo.style(this.domNode,{"height":(this.h-2)+"px"});
		}
		this._fixMargin();
		//delete this.dirty;
		delete this._dirtyDOM;
		return this.domNode;
	},
	getElementPath:function(x,y,path,options){
		var tarPara = this.container.select(function(para){
			if(y<=para.h){
				return true;
			}else{
				y=y-para.h;
				return false;
			}
		});
		if(!tarPara){
			tarPara = this.container.getLast();
			y = tarPara.h;
		}
		path.push(tarPara);
		tarPara.getElementPath(x,y,path,options);
	},
// end
	alignItem:function(){
		var contentHeight=0;
		var that = this;
		this.container.forEach(function(p){
			p.parent = that;
			p.top = contentHeight;
			contentHeight+=p.h;
		});
		this.h = contentHeight;
	},
	init:function(){
		
	},
	/**
	 * common text container properties 
	 * ???
	 */
	container: null,
	/*
	 * functions must implemented
	 */
	getContainer:function(){
		if(!this.container )
			this.container = new common.Container(this);
		return this.container;
	},
	getContentTop: function(){
		 return this.getParent().getContentTop()+(this.top || 0) + this._borderWidth;
	},
	getContentLeft: function(){
		return this.getParent().getContentLeft()+(this.left || 0) + this._borderWidth;
	},
	
	
	initTextArea: function( contents, ownerId){
		var c = contents.getFirst();
		while(c){
			var v = c.preLayout(ownerId);
			this.appendText(v);
			c = contents.next(c);
		}
	},
	
	layoutText: function(){
		var that = this;
		var contentHeight = 0;
		this.getContainer().forEach(function(c){
			c.layout(that);
			c.top = contentHeight;
			c.left = 0;
			contentHeight+=c.h;
		});
		return contentHeight;
	},
	appendText: function( v ){
		this.getContainer().append(v);
		v.parent = this;
	},
	
	_zoomChangedImpl:function(){
		if(!this.domNode)
			return;
		
		// #42498 Re-render tab leading in TOC
		var para = this.container.getFirst();
		while(para){
			var lines = para.getContainer();
			if(lines)
			{
				lines.forEach(function(line){
					line.zoomChanged();
				});
			}	
			
			para = this.container.next(para);
		}
	}
});
writer.model.Model.prototype.viewConstructors[writer.model.Toc.prototype.modelType]=writer.view.TocView;