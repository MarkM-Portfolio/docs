dojo.provide("writer.model.update.Block");
writer.model.update.Block = function(){
};
writer.model.update.Block.prototype={
	_insertViewAfter:function(){
		var container = this.parent.container;
		var target =container.prev(this);
		if(target&&target.getSectId&&target.getSectId()){
			// the paragraph is the last paragraph;
			return false;
		}
		var allViewrs = target&&target.getAllViews();
		while(target&&!allViewrs){
			target  = container.prev(target);
			if(target&&target.getSectId&&target.getSectId()){
				// the paragraph is the last paragraph;
				return false;
			}
			allViewrs = target&&target.getAllViews();
		}
		if(allViewrs){
			for(var ownerid in allViewrs){
				var myView = this.preLayout(ownerid);
				var view = allViewrs[ownerid].getLast();
		    	view.insertAfterSel(myView);    		
			} 
			return true;
		}
		return false;
	 },
	_insertViewBefore:function(){
		var container = this.parent.container;
		var target  = container.next(this);
		var allViewrs = target&&target.getAllViews();
		while(target&&!allViewrs){
			target  = container.next(target);
			allViewrs = target&&target.getAllViews();
		}
		if(allViewrs){
			for(var ownerid in allViewrs){
    			var myView = this.preLayout(ownerid);
				var view = allViewrs[ownerid].getFirst();
				view.insertBeforeSel(myView);				
			} 
			return true;
		}
		return false;
	 },	 
	 insertView:function(){
    	var container = this.parent.container;
    	var target =null;
		if(!this._insertViewAfter()&&!this._insertViewBefore()){
			var parent = this.parent;
    		var allViewrs = parent.getAllViews();
    		for(var ownerid in allViewrs){
    			var myView = this.preLayout(ownerid);
				var view = allViewrs[ownerid].getFirst();
				myView.appendSel(view);
			}
    	}
	},
	deleteView:function(){
		var allViews = this.getAllViews();
		for(var ownerId in allViews){
			var viewers = allViews[ownerId];
			var firstView = viewers.getFirst();
			while(firstView){
				var next = viewers.next(firstView);
				firstView.deleteSel();
				firstView = next;
			}
		}	
		this.container.removeAll();
	},
	resetView:function(){
		var allViews = this.getAllViews();
		for(var ownerId in allViews){
			var viewers = allViews[ownerId];
			var firstView = viewers.getFirst();
			firstView.reset();
			var next = viewers.next(firstView);
			while(next){	
				var a = viewers.next(next);
				next.deleteSel();
				next = a;
			}
		}	
	},
	updateView:function(){
		var allViews = this.getAllViews();
		for(var ownerId in allViews){
			var viewers = allViews[ownerId];
			var firstView = viewers.getFirst();
			firstView.updateSelf();
			var next = viewers.next(firstView);
			while(next){				
				next.updateSelf();
				next = viewers.next(next);
			}
		}
	},
	/**
	 * the parent was mark inserted and not update 
	 * then no need mark children.
	 * @returns {Boolean}
	 */
	noNeedMark: function(){
		 return this.parent.CHANGESTATE 
			 && this.parent.CHANGESTATE.inserted 
			 && this.parent.CHANGESTATE.inserted.state;
	},
	mark:function(tag,callbackFun){
		if( this.noNeedMark() )
			return;
		
		if(!this.CHANGESTATE){
			this.CHANGESTATE={
					deleted:{},
					inserted:{},
					reseted:{},
					dirty:{},
					resize:{}
				};
		}
		this.CHANGESTATE[tag].state=true;
		this.CHANGESTATE[tag].callbackFunc = callbackFun;
		if(this.parent.addChangeModel){
			this.parent.addChangeModel(this);
			this.parent.update();
		}else{
			this.update();
		}
	},
	update:function(){
		if(!this.CHANGESTATE){
			return ;
		}
		try{
			if(this.CHANGESTATE.deleted.state){
				this.deleteView();
				this.CHANGESTATE.deleted.callbackFunc&&this.CHANGESTATE.deleted.callbackFunc();
			}else if(this.CHANGESTATE.inserted.state){
				this.insertView();
				this.CHANGESTATE.inserted.callbackFunc&&this.CHANGESTATE.inserted.callbackFunc();
			}else if(this.CHANGESTATE.reseted.state){
				this.resetView();
				this.CHANGESTATE.reseted.callbackFunc&&this.CHANGESTATE.reseted.callbackFunc();
			}else if(this.CHANGESTATE.dirty.state){
				this.updateView();
				this.CHANGESTATE.dirty.callbackFunc&&this.CHANGESTATE.dirty.callbackFunc();
			}else if(this.CHANGESTATE.resize.state){
				this.resizeView();
				this.CHANGESTATE.resize.callbackFunc&&this.CHANGESTATE.resize.callbackFunc();
			}else{
				console.log("has nothing to do!");
			}
		}catch(e){
			console.error(e);
		}
		
		delete this.CHANGESTATE;
	},
	// when the model is prelayout, the update state will be clear;
	clearState:function(){
		delete this.CHANGESTATE;
	},
	markDirty:function(){
		this.mark("dirty");
	},
	markInsert:function(){
		this.notifyInsertToModel();
		this.mark("inserted");
	},
	markDelete:function(){
		this.notifyRemoveFromModel();
		this.mark("deleted");
	},
	markReset:function(){
		this.mark("reseted");
	},
	notifyInsertToModel:function(){
		
	},
	notifyRemoveFromModel:function(){
		
	}
};