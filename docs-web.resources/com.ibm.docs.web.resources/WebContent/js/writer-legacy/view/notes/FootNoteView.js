dojo.provide("writer.view.notes.FootNoteView");
writer.view.notes.FootNoteView = function(model,ownerId, splited){
	this.model = model;
	this.left = 0;
	this.top = 0;
	this.h =0;
	this.w = 0;
	this.ownerId = ownerId;
	!splited&&this.init( ownerId );
};
writer.view.notes.FootNoteView.prototype={
	getViewType:function(){
		return 'note.footnote';
	},
	getContentLeft:function(){
		return this.getParent().getContentLeft();
	},
	getContentTop:function(){
		return this.getParent().getContentTop() + this.top;
	},
	init:function(ownerId){
		this._container = new common.Container(this);
		var blocks = this.model.container;
		var firstBlock = blocks.getFirst();
		while(firstBlock){
			var blockView = firstBlock.preLayout(ownerId);
			this._container.append(blockView);
			firstBlock = blocks.next(firstBlock);
		}
		this.container =  new common.SubContainer(this._container,this._container.getFirst(),this._container.getLast());
	},
	layout:function(view){
		var w = view.getWidth()||view.w;
		if(w==this.w&&this.hasLayouted()){
			return;
		}
		this.w = w;
		var h =0;
		this.parent = view;
		var that = this;
		var contentHeight = 0;
		this.container.forEach(function(c){
			c.layout(that);
			c.top = contentHeight;
			c.left = 0;
			contentHeight+=c.h;
		});
		this.h = contentHeight;
		this._layouted = true;
	},
	alignItem:function(){
		var that = this;
		var contentHeight = 0;
		this.container.forEach(function(c){
			c.top = contentHeight;
			c.left = 0;
			c.parent = that;
			contentHeight+=c.h;
		});
		this.h = contentHeight;
		this._layouted = true;
	},
	getContainer:function(){
		return this.container;
	},
	hasLayouted:function(){
		return this._layouted;
	},
	getWidth:function(){
		return this.w;
	},
	canFit:function(w,h){
		if(this.h>h){
			return false;
		}
		return true;
	},
	canSplit:function(w,h){
		return true;
	},
	split:function(w,h){
		var devideAt = this.container.select(function(c){
			if(h>c.h){
				h-=c.h;
				return false;
			}else{
				return true;
			}
		});
		var newView = null;
		if(!devideAt){
			devideAt = this.container.getFirst();
		}else{
			newView = devideAt.split(w,h,this);
			if(newView&&newView!=devideAt){
				this.container.insertAfter(newView, devideAt);
			}
		}
		if(!newView){
			newView = devideAt;
		}
		var c = this.container.divide(newView);
		if(c == this.container){
			return this;
		}else{
			var footNoteView = new writer.view.notes.FootNoteView(this.model,this.getOwnerId(), true);
			this.model.addViewer(footNoteView,this.getOwnerId(),this);
			footNoteView.container = c;
			footNoteView.parent = this.parent;
			footNoteView.alignItem();
			footNoteView.w = this.w;
			this.alignItem();
			return footNoteView;
		}
	},
	getId:function(){
		return this.model.id;
	},
	getReferer:function(){
		var model = this.model.getReferer();
		if(!model){
			return null;
		}
		var views = model.getAllViews();
		for(var ownId in views){
			var allViews = views[ownId];
			return allViews.getFirst();
		}
	},
	setReferer:function(refer){
		this.model.setReferer(refer);
	},
	canBreak2pieces:function(){
		return true;
	},
	_defalutClass:"footnote",
	render:function(){
		if(!this.domNode){
			this.domNode = dojo.create("div", {
				"class": this._defalutClass,
				"id": this.model.id
			});
			var view = this.container.getFirst();
			while(view){
				var viewDOM = view.render();
				this.domNode.appendChild(viewDOM);
				view = this.container.next(view);
			}
			
		}else if(this.isDirtyDOM()){
			delete this._markDirtyDOM;
			writer.view.update.tools.updateDOM(this.container,this.domNode);
			dojo.style(this.domNode,{"height":this.h+"px"});
		}
		return this.domNode;
	},
	canMerge:function(w,h){
		return true;
	},
	merge:function(fn){
		if(fn.model==this.model){
			var lastView  = this.container.getLast();
			var firstView = fn.container.getFirst();
			if(firstView&&lastView&&lastView.model==firstView.model&&firstView!==lastView){
				lastView.merge(firstView);
				var next = fn.container.next(firstView);
				this._container.remove(firstView);
				firstView = next;
			}
			while(firstView){
				this.container.append(firstView);
				firstView.parent = this;
				firstView=fn.container.next(firstView);
			}
			this.alignItem();
			this.model.removeViewer(fn);
			this.markDirtyDOM();
		}
	},
	getElementPath:function(x,y,path,options){
		// Check occupied space first for anchored object
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
	notifyUpdate:function(args,type){
		if(!args instanceof Array){
			console.error("the arg must be array");
		}
		if(type){
			switch (type)
			{
				case "insertBefore":
					this.insertBefore(args[0], args[1]);
					break;
				case "insertAfter":
					this.insertAfter(args[0], args[1]);
					break;
				case "delete":
					this.deleteView(args[0]);
					break;
				case "appendFirst":
					this.appendFront(args[0]);
					break;
				default:
					console.info("can not handle the update type: "+type);
			}			
		}
		this.parent.notifyUpdate([]);
	},
	insertBefore:function(view,tar){
		this.container.insertBefore(view,tar);
		view.parent = this;
	},
	insertAfter:function(view,tar){
		this.container.insertAfter(view,tar);
		view.parent = this;
	},
	deleteView:function(view){
		view.markDelete();
	},
	appendFront:function(view){
		if(this.container.length()!=0){
			console.info("when this function called, the container have to be empty!");
		}
		this.container.append(view);
		view.parent = this;
	},
	update:function(){
		var that = this;
		var contentHeight = 0;
		var c = this.container.getFirst();
		var changed = false;
		while(c){
			c.top = contentHeight;
			if(!c.hasLayouted()){
				c.layout(that);
				changed = true;
			}
			if(c.isDeleted()){
				var t = this.container.next(c);
				this.container.remove(c);
				c = t;
				changed = true;
				continue;
			}
			if(c.isDirtyDOM&&c.isDirtyDOM()){
				changed = true;
			}
			c.left = 0;
			c.parent = that;
			contentHeight+=c.h;
			c = this.container.next(c);
		}
		if(this.h!=contentHeight||changed){
			this.markDirtyDOM();
			this.parent.notifyUpdate([]);
		}
		this.h = contentHeight;
		this._layouted = true;
	},
	getPages: function(){
		var page = writer.util.ViewTools.getPage(this);
		var doc = writer.util.ViewTools.getDocument(page);
		return doc.getPages();
	}
};

writer.model.Model.prototype.viewConstructors[writer.model.notes.FootNote.prototype.modelType]=writer.view.notes.FootNoteView;
common.tools.extend(writer.view.notes.FootNoteView.prototype,new writer.view.AbstractView());
common.tools.extend(writer.view.notes.FootNoteView.prototype,new writer.view.update.BlockView());