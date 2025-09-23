dojo.provide("writer.view.text.TextArea");
dojo.require("writer.view.SpaceBlock");

writer.view.text.TextArea = function(parent,space,options){
	if(!parent){
		console.error("a parent must be need!");
		return ;
	}
	if(!space){
		console.error("a space must be need!");
		return ;
	}
	this.bodySpace = space;
	space.setOwner( this );
	this.offsetY =0;
	this.top=0;
	this.parent = parent;
	if(options&&options.parentContainer){
		this.container = new common.SubContainer(options.parentContainer);
	}else{
		this.container = new common.Container(this);
	}
	
	if(this.getHeight()==0){
		this._fixedHeight=false;
	}
	this._name= options&&options.name;
	this._viewType = options&&options.viewType;
};
writer.view.text.TextArea.prototype={
	left:0,
	top:0,
	offsetY:0,
	_fixedHeight:true,
	_fixedWidth:false,
	getViewType:function(){
		return this._viewType||'text.textArea';
	},
	getContainer:function(){
		return this.container;
	},
	getLeft: function( ){
		return this.left;
	},	
	getTop: function(){
		return this.top;
	},	
	getWidth: function(){
		return this.bodySpace.w;
	},	
	getOffsetY:function(){
		return this.offsetY;
	},
	getHeight: function(){
		return this.bodySpace.h;
	},
	setHeight:function(h){
		return this.bodySpace.h = h;
	},
	setName:function(name){
		this._name = name;
	},
	getName:function(){
		return this._name;
	},
	getContentLeft:function(){
		return this.getParent().getContentLeft() + this.left;
	},
	getContentTop:function(){
		return this.getParent().getContentTop() + this.top;
	},
	getChildPosition:function(idx){
		var para = this.container.getByIndex(idx);
		if(!para){
			para = this.container.getLast();
			return {'x':para.w,'y':para.getTop()+para.h};
		}else{
			return {'x':para.getLeft(),'y':para.getTop()};
		}
	},
	_appendView:function(view){
		this.container.append(view);
		view.parent = this;
		view.left = 0;
		view.top = this.offsetY;
		view.setSpace&&view.setSpace(this.offsetY,this.getWidth());
		this.offsetY = this.offsetY+ view.h;
	},
	_forceFix:function(view){
		if(this.offsetY<3 && Math.abs(this.getHeight()-this.parent.getHeight())<5 ){
			return true;
		}
		return false;
	},
	append:function(view){
		if (!this.bodySpace || !this.bodySpace.h)
		{
			console.error("bodySpace error!");
		}
	
		view.top = this.offsetY;
		if(view.canFit(this.bodySpace.w,this.bodySpace.h-this.offsetY, this) ){
			this._appendView(view);
			return null;
		}else{
			var forceFix = this._forceFix(view);
			if(view.canSplit(this.bodySpace.w,this.bodySpace.h-this.offsetY, this)){
				var breakView = view.split(this.bodySpace.w,this.bodySpace.h-this.offsetY, this);
				if(breakView!=view){
					this._appendView(view);
					breakView && breakView.releaseBodySpace && breakView.releaseBodySpace(this);
					return breakView;
				}else if(forceFix){
					this._appendView(view);		
					return null;
				}else{
					view.releaseBodySpace && view.releaseBodySpace(this);
					return view;	
				}
			}else if(forceFix){
				this._appendView(view);
				return null;
			}else{
				view.releaseBodySpace && view.releaseBodySpace(this);
				return view;
			}
		}
	},
	alignItem:function(){
//		debugger;
		var left =0,top=0;
		this.container.forEach(function(para){
			para.left = left;
			para.top = top;
			top = top + para.h;
		});
	},
	getAnchorObject: function(x, y) {
		return this.bodySpace.getOccupiedObject(x, y);
	},
	getElementPath:function(x,y,path, options ){
		return this.getSpaceElementPath(x, y, path, options );
	},
	inArea:function(x,y){
		if(this.getHeight()+this.top>=y){
			return true;
		}
		return false;
	},
	release:function(view){
		this.offsetY =0;
		this.h =0;
		var p = this.container.getFirst();
		while(p&&p != view){
			this.offsetY+=p.h;
			p = this.container.next(p);
		}
		var next;
		while(p){
			next = this.container.next(p);
			p.releaseBodySpace && p.releaseBodySpace(this);
			this.container.remove(p,true);
			p = next;
		}
		if(this.container.isEmpty()){
			this.container.reset();
		}
	},
	releaseAll:function(){
		if(this.isEmpty()){
			return ;
		}
		this.release(this.container.getFirst());
	},
	isEmpty:function(){
		return this.container.isEmpty();
	},
	mergeView:function(view){
		var last = this.container.getLast();
		if(view&&last&&last.model==view.model&&view.canMerge(this.bodySpace.w,this.bodySpace.h-this.offsetY)){
			this.offsetY-=last.h;
			this.container.remove(last,true);
			return last;
		}
		return null;
	},
	resize:function(h,w){
		if(h){
			this.bodySpace.h = h;
		}
		if(w){
			this.bodySpace.w = w;
		}
	},
	updatePosition:function(delT){
		var change = {};
		if(delT){
			this.top+=delT;
			change.top = this.top+"px";
		}
	},
	setHeight:function(h){
		this.bodySpace.h = h;
	},
	update:function(){
		
	},
	updateDOM:function(){
		writer.view.update.tools.updateDOM(this.getContainer(),this.domNode);
		if (pe.scene.isNote())
			this.domNode.style.height = "auto";
		else
			dojo.style(this.domNode,{"height":this.getHeight()+"px"});
	},
	render:function(){
		if(!this.domNode){
			var pageNode = dojo.create("div",{
				"class":"textArea "+this._name||"",
				"style": "height:"+this.getHeight()+"px"	// add position:absolute to prevent textArea overlapping the anchorImage so that the image cannot be selected.
			});
			this.domNode = pageNode;
			var param = this.container.getFirst();
			while(param){
				var childNode = param.render();
				pageNode.appendChild(childNode);
				param = this.container.next(param);
			}
		}
		if (pe.scene.isNote())
			this.domNode.style.height = "auto";
		return this.domNode;
	},
	_notifyUpdateImpl:function(args,type){
		this.parent.notifyUpdate(this);
	}
};
common.tools.extend(writer.view.text.TextArea.prototype,new writer.view.AbstractView());
common.tools.extend(writer.view.text.TextArea.prototype,new writer.view.update.BlockContainerView());
common.tools.extend(writer.view.text.TextArea.prototype,new writer.view.SpaceBlock());