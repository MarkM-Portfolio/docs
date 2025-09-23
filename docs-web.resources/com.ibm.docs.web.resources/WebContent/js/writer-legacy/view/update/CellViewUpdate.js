dojo.provide("writer.view.update.CellViewUpdate");
dojo.require("writer.view.update.BlockContainerView");
dojo.require("writer.view.SpaceBlock");
writer.view.update.CellViewUpdate=function(){
	
};
writer.view.update.CellViewUpdate.prototype={
	update:function(){
		if(!this.changedView||this.changedView.len==0){
			return;
		}
		delete this.changedView;
		var h = this.contentHeight;
		this._updateCellContent();
		this.alignItem();
		var c  = new common.Container();
		c.append(this.aligner);
		c.appendAll(this.getContainer());
		writer.view.update.tools.updateDOM(c,this.domNode.childNodes[0]);
		var h1 = this.contentHeight;
		var isRepeatHead = writer.util.ModelTools.isInDocTable(this.model) && (this.getParent().model.isTblHeaderRepeat() == true);
		if (h1!=h || isRepeatHead){
			var tarRow = this.getParent();
			var index = this.getRowSpan()-1;
			while(index>0&&tarRow){
				index--;
				tarRow = tarRow.next();
			}
			if(!tarRow){
				console.error("something error");
				return ;
			}
			tarRow.notifyUpdate([this],"heightChange");
			this.heightChange(true);
		}
	},
	_updateCellContent:function(){
		var view = this.container.getFirst();
		while(view){
			if(view.isDeleted()){
				var t = this.container.next(view);
				this.container.remove(view);
				view =t;
				continue;
			}
			if(!view.hasLayouted()){
				view.layout(this);
			}
			view = this.container.next(view);
		}
	},
	updateCellDOM:function(){
		if(this.heightChange()){
			this.adjustAlign();
		}
		if((this.heightChange()||this.widthChange())&&this.domNode){
			var node = this.domNode.childNodes[0];
			dojo.style(node,{"height":Math.max(this.contentHeight,this._rowContentHeight)+"px","width":this.contentWidth+"px"});
			this._borderChange = true;
			delete this._heightChange;
			delete this._widthChange;
		}
		if(this.positionChange()&&this.domNode){
			dojo.style(this.domNode,{"left":this.left+"px"});
			delete this._positionChange;
		}
		if(this._borderChange && this.domNode){
			this.renderBorder();
			delete this._borderChange;
		}
	},
	updateDOMPositon:function(){
		if(this.positionChange()&&this.domNode){
			dojo.style(this.domNode,{"left":this.left+"px;"});
			delete this._positionChange;
		}
	},
	updateCellCSSStyle:function(){
		if(this._changeCSSStyle&&this.domNode){
			dojo.attr(this.domNode,{"class":"cell "+this.getCSSStyle()});
			var contentNode = this.domNode.childNodes[0];
			dojo.attr(contentNode,{"style":this.getStyleStr()});
			delete this._changeCSSStyle;
		}
	},
	increaseHeight:function(h,row){
		var oldH = row.getBoxHeight();
		var  idx = row.getRowIdx()- this.parent.getRowIdx()+1;
		if(idx!= this.rowSpan){
			var delH = h-oldH;
			var t = this._rowContentHeight;
			this._rowContentHeight +=delH;
			this.heightChange(Math.max(this.contentHeight,this._rowContentHeight)!=Math.max(this.contentHeight,t));
		}else{
			this.allocateHeight(h,row);
		}
	},
	resizeWidth:function(){
//		var w = this.contentWidth;
//		var view = this.getContainer().getFirst();
//		var canFit = true;
//		while(view){
//			if(view.canFitWidth && !view.canFitWidth(w)){
//				canFit = false;
//				break;
//			}
//			view = this.getContainer().next(view);
//		}
//		if(!canFit){
			this.relayout();
			this.markDirtyDOM();
			this.parent.markDirtyDOM();
//		}
	},
	isResizeWidth:function(){
		var cw = this.model.getContentWidth()-(this.getLeftEdge()+this.getRightEdge())-this.cellSpacing*2;
		if(this.contentWidth!=cw){
			this.contentWidth = cw;
			this.widthChange(true);
			return true;
		}
	},
	relayout:function(){
		var that = this;

		if (that.bodySpace)
			delete that.bodySpace;
		that.bodySpace = new common.Space(that.contentWidth, 1080, 0, 0, that);

		var contentHeight = 0;
		var firstView = this.container.getFirst();
		if(firstView&&!firstView.isFirstView()){
			this.container.remove(firstView);
			firstView.model.removeViewer(firstView,firstView.getOwnerId());
		}
		this.container.forEach(function(c){
			c.reset();
			delete c.inserted;
			if(!c.hasLayouted()){
				c.layout(that);
			}
			c.top = contentHeight;
			c.left = 0;
			contentHeight+=c.h;
		});
		this.contentHeight = contentHeight;
		this._rowContentHeight = this.contentHeight; 
	},
	checkBorder:function(){
		if(this._toCheckBorder){
//			var w =  this.getLeftEdge() + this.getRightEdge();
//			var h =  this.getTopEdge()  + this.getBottomEdge();
			this.initEdgeWidth();
//			var w1 = this.getLeftEdge() + this.getRightEdge();
//			var h1 = this.getTopEdge()  + this.getBottomEdge();
//			if(w1!=w){
//				this.contentWidth=-1;
//				this._getContentWidth();
//				this.resizeWidth();
//			}else{
				this.changeCSSStyle(true);
//			}
			
		}
		delete this._toCheckBorder;
		
	},
	release:function(view){
		var p = view;
		while(p){
			var t = this.container.next(p);
			this.container.remove(p);
			p = t;
		}
	},
	setLeft:function(left){
		if(this.left!=left){
			this.left = left;
			this.positionChange(true);
		}		
	},
	positionChange:function(change){
		if(change){
			this._positionChange = true;
		}
		return this._positionChange;
	},
	heightChange:function(change){
		if(change){
			this._heightChange = true;
		}
		return this._heightChange;
	},
	widthChange:function(change){
		if(change!=null){
			this._widthChange = true;
		}
		return this._widthChange;
	},
	changeRowSpan:function(delSpan){
		var rowSpan = this.getRowSpan();
		rowSpan+=delSpan;
		this.setRowSpan(rowSpan);
		this.parent.markDirtyDOM();
	},
	toCheckBorder:function(toCheck){
		if(toCheck){
			this._toCheckBorder = true;
			this._borderChange = true;
			this.getParent().notifyUpdate([this]);
		}
		return this._toCheckBorder;
	},
	changeColSpan:function(delSpan){
		var colSpan = this.getColSpan();
		colSpan +=delSpan;
		this.setColSpan(colSpan);
//		 this.markDirtyDOM();
		this.parent.markDirtyDOM();
	},
	changeStyle:function(){
		if(this.domNode){
			var node = this.domNode.childNodes[0];
			dojo.attr(node,{"style":this.getStyleStr()});
		}
	},
	reset:function(){
		this.rowSpan = this.model.rowSpan;
		this.colSpan = this.model.colSpan;
		this.padding = this.model.getPadding();
		this.cellSpacing = this.model.getCellSpacing()||0;
		this.contentWidth= -1;
		this.contentWidth = this.model.getContentWidth()-(this.getLeftEdge()+this.getRightEdge())-this.cellSpacing*2;
		this.init(this.ownerId);
		this.layout(this.parent);
		this.model.clearChangeModel();
		this.parent.markDirtyDOM();
		this.markDirtyDOM();
	},
	mergeView:function(view){
		var last = this.container.getLast();
		var h = view.h+10;
		if(last&&last.model==view.model&&view.canMerge(this.contentWidth,h)){
			view = last.merge(view,this.contentWidth,h);
		}
		return view;
	}
};
common.tools.extend(writer.view.update.CellViewUpdate.prototype,new writer.view.update.BlockView());
common.tools.extend(writer.view.update.CellViewUpdate.prototype,new writer.view.update.BlockContainerView());
common.tools.extend(writer.view.update.CellViewUpdate.prototype,new writer.view.SpaceBlock());