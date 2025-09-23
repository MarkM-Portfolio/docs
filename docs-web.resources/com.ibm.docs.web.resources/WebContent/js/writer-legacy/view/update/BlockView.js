dojo.provide("writer.view.update.BlockView");
writer.view.update.BlockView=function(){
	
};
writer.view.update.BlockView.prototype={
	update:function(){
		
	},
	updatePosition:function(body){
		
	},
	changeCSSStyle:function(value){
		if(value!=null){
			this._changeCSSStyle=value;
		}
		return this._changeCSSStyle;
	},
	markRelayout:function(){
		this._relayout = true;
		this.markDirtyDOM();
	},
	markDelete:function(){
		this._deleted = true;
	},
	markInsert:function(){
		this._inserted= true;
	},
	isDirty:function(){
		return this._relayout==true;
	},
	isDeleted:function(){
		return this._deleted == true;
	},
	isInsert:function(){
		return this._inserted==true;
	},
	markDirtyDOM:function(){
		this._dirtyDOM =true;
	},
	isDirtyDOM:function(){
		return this._dirtyDOM==true;
	},
	reset:function(){
		var parent = this.getParent();
//		debugger;
		if(parent){
			this.init(this.getOwnerId());
			this.layout(parent);
			this.inserted=true;
			parent.notifyUpdate([this]);
			this.dirty=true;
		}
		
	},
	deleteSel:function(){
		this.getParent().notifyUpdate([this],"delete");
		if(this.directProperty && this.directProperty.getSectId()){
			dojo.publish(writer.EVENT.UPDATEDELETESECTION,[this,this.directProperty.getSectId()]);
		}
		this.model.removeViewer(this,this.getOwnerId());		
	},
	_insertSection:function(block){
		if(block.directProperty && block.directProperty.getSectId()){
			dojo.publish(writer.EVENT.UPDATEINSERTSECTION,[block,block.directProperty.getSectId()]);
		}
	},
	insertBeforeSel:function(tar){
		this.getParent().notifyUpdate([tar,this],"insertBefore");
		this._insertSection(tar);
	},
	insertAfterSel:function(tar){
		this.getParent().notifyUpdate([tar,this],"insertAfter");
		this._insertSection(tar);
	},
	appendSel:function(tar){
//		console.error("this function shouldnot be invoked");
		tar.notifyUpdate([this],"append");
		this._insertSection(this);
	},
	updateSelf:function(){
		this.notifyUpdate([this]);
	},
	clearTag:function(){
		delete this.deleted;
		delete this.dirty;
		delete this.inserted;
		delete _changeCSSStyle;
		delete _relayout;
		delete _deleted;
		delete _inserted;
		delete _dirtyDOM;
	},
	hasLayouted:function(){
		console.error("HasLayouted need implemented!!");
	}
};