dojo.provide("writer.view.AbstractView");
dojo.require("writer.controller.Editor");
writer.view.AbstractView = function(){
	this.refId = null;
	this.fontSizeState = controller.Editor.fontResizeState;
};
writer.view.AbstractView.prototype = {
	borderStyles:{
		"none":"none",
		"dotted":"dotted",
		"single":"solid","wave":"solid","doubleWave":"solid","dashDotStroked":"solid",
		"dashSmallGap":"dashed","dashed":"dashed","dotDash":"dashed","dotDotDash":"dashed",
		"double":"double","triple":"double","thinThickSmallGap":"double","thickThinSmallGap":"double","thinThickThinSmallGap":"double","thinThickMediumGap":"double",
		"thickThinMediumGap":"double","thinThickThinMediumGap":"double","thinThickLargeGap":"double","thickThinLargeGap":"double","thinThickThinLargeGap":"double",
		"threeDEngrave":"groove",
		"threeDEmboss":"ridge",
		"inset":"inset",
		"outset":"outset"
	},
		
   generateUUID:function(){
	   this.ownerId = WRITER.MSG_HELPER.getUUID();
   },
   getViews:function(){
	   return this.model.getRelativeViews(this.ownerId);
   },
   getOwnerId:function(){
	   return this.ownerId;	// Model is null when the view is page.
   },
   isZoomed: function()
   {
	   return (this.fontSizeState != controller.Editor.fontResizeState);
   },
   _zoomChangedImpl:function(){
	   // Implemented in child object
   },
   zoomChanged: function()
   {
	   if(this.fontSizeState != controller.Editor.fontResizeState)
	   {
		   // Update this view's left, top, width, height information
		   this.fontSizeState = controller.Editor.fontResizeState;
		   this._zoomChangedImpl();
	   }
   },
   //
   getParent:function(){
	   return this.parent;
   },
   getLeft:function(){
	   this.zoomChanged();
	  
	   var result = this.getParent().getContentLeft()+(this.left || 0);
   	   if(isNaN(result)){
   		   console.error("the left position value must be number!");
   		   return 0;
   	   }
   	   return result;
   },
   getTop:function(){
	   var result=   this.getParent().getContentTop()+(this.top || 0);
	   if(isNaN(result)){
   		   console.error("the top position value must be number!");
   		   return 0;
   	   }
   	   return result;
	},
	getWidth:function(){
		this.zoomChanged();
		return this.w;
	},
	setWidth:function(w){
		this.w = w;
	},
	// optional implement
	next:function(){
		var p = this.getParent();
		if(p){
			var next = p.getContainer().next(this);
			return next?next.canSelected()?next:next.next():null;
		}else{
			return null;
		}
		
	},
	previous:function(){
		var p = this.getParent();
		if(p){
			var prev= p.getContainer().prev(this);
			return prev?(prev.canSelected()?prev:prev.previous()):null;
		}else{
			return null;
		}
	},
	previousEx:function()
	{
		var p = this.getParent();
		if(p){
			var prev= p.getContainer().prev(this);
			return prev;
		}else{
			return null;
		}
	},
	getFirst:function(){
		var c = this.getContainer();
		var first = c&&c.getFirst();
		return first?first.canSelected()?first:first.next():null;
	},
	getLast:function(){
		var c = this.getContainer();
		var last = c&&c.getLast();
		return last?last.canSelected()?last:last.previous():null;
	},
	getByIndex:function(index){
		var c = this.getContainer();
		if(c){
			return c.getByIndex(index);
		}
		return null;
	},
	canSelected:function(){
		return true;
	},
	//must be implement!
	getViewType:function(){
		console.error("this function getViewType must be implement");
		throw "this function getViewType must be implement";
	},
	getElementPath:function(){
		console.error("this function getElementPath must be implement");
		throw "this function getElementPath must be implement";
	},
	getChildPosition:function(){
		console.error("this function getChildPosition must be implement");
		throw "this function getChildPosition must be implement";
	},
	getContainer:function(){
		console.warn("the function getContainer has not be implemented!");
		return null;
	},
	// if the in the point, really has some thing, gap? it can be penetrate?
	// default, can not be penetrated.
	canBePenetrated:function(x, y)
	{
		console.warn("the function canBePenetrated has not be implemented!");
		return false;
	},
	// if the view can be split to more than two part to append to more than two page body then return value is true;
	canBreak2pieces:function(){
		return false;
	},
	getFirstViewForCursor:function(){
		var container = this.getContainer();
		if(container){
			var first = container.getFirst();
			if(first){
				return first.getFirstViewForCursor();
			}
		}
		return this;
	},
	getReferredFootNote:function(_cache){
		var c;
		var children = this.getContainer();
		children&&children.forEach(function(child){
			var fns = child.getReferredFootNote(_cache);
			if(fns){
				if (!c) c = new common.Container();
				c.appendAll(fns);
			}
		});
		return c;
	},
	isEmpty:function(){
		var c = this.getContainer();
		if(c&&c.isEmpty()){
			return true;
		}
		return false;
	},
	getDomNode: function(){
		return this.domNode;
	},
	releaseDom: function(){
		var c = this.getContainer();
		if (c)
		{
			var child = c.getFirst();
			while(child){
				child.releaseDom();
				child = c.next(child);
			}
		}

		if (this.domNode)
		{
			dojo.destroy(this.domNode);
			this.domNode = null;
		}
		this._releaseDom&&this._releaseDom();
	},
	// if the view A has been splited to A,B,C...to be append to different container, this function will return true;
	isFirstView:function(){
		try{
			if(this.model.getRelativeViews(this.getOwnerId()).getFirst()==this){
				return true;
			}
		}catch(e){
			console.error(e);
			return false;
		}
	}
};