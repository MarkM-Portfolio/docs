dojo.provide("writer.view.update.RowViewUpdate");
dojo.require("writer.view.update.BlockView");
dojo.require("writer.view.update.BlockContainerView");
writer.view.update.RowViewUpdate=function(){
	
};
writer.view.update.RowViewUpdate.prototype={
	update:function(){
		var cell = this.cells.getFirst();
		while(cell){
			if(cell.toCheckBorder()){
				cell.checkBorder();
			}
			if(!cell.hasLayouted()){
				cell.layout(this);
				this.markDirtyDOM();
			}else if(cell.isResizeWidth()){
				cell.resizeWidth();
			}
			cell.updateCellCSSStyle();
			cell = this.cells.next(cell);
		}
		var h = this.getBoxHeight();
		this._updateHeight();
		var h1 = this.getBoxHeight();
		if(!this.domNode){
			//new view(without being rendered),have to render in advance
			this.render();
		}
		if(this.isDirtyDOM()){
			this.getParent().markDirtyDOM();
			this.getParent().notifyUpdate([this]);
		}
		
		this.updateDOMHeight();
		this.updateCell();
	},
	updateCell:function(updateDom){
		var rowMatrix = this.parent.getTableMatrix().getRowMatrix(this);
		var left =0;
		var i1, isTableDirRtl = this.getParent().model.tableProperty.getDirection() == 'rtl';
		for(var i=0;i< rowMatrix.length;i++){
			i1 = isTableDirRtl ? rowMatrix.length-i-1 : i;
			var cell = rowMatrix[i1];
			if(cell == rowMatrix[i1-1]){
				continue;
			}
			cell.setLeft(left);
			cell.updateCellDOM();
			left+=cell.getBoxWidth();
		}
		this.w = left;
	},
	updateRowCSSStyle:function(){
		if(this._changeCSSStyle){
			dojo.attr(this.domNode,{style:this.getStyleStr()});
			delete this._changeCSSStyle;
		}
	},
	updateDOMHeight:function(){
		if(this.heightChange()){
			var node = this.domNode;
			dojo.style(node,{"height":this.getBoxHeight()+"px"});
			delete this._heightChange;
		}		
	},
	_updateHeight:function(){		
		var oldH = this.getBoxHeight();
		var h = this._h;
		if(this.isResized()){
			var newH = this.model.getBoxHeight();
			if(h!=newH){
				h = newH;
				this._h = h;
			}
			delete this._resized;
		}
		var rowMatrix = this.parent.getTableMatrix().getRowMatrix(this);
		for(var i=0;i< rowMatrix.length;i++){
			var cell = rowMatrix[i];
			if(cell == rowMatrix[i-1]){
				continue;
			}
			h =  Math.max(cell.getRequiredHeight(this),h);
		}
		if(oldH!=h){
			for(var i=0;i< rowMatrix.length;i++){
				var cell = rowMatrix[i];
				if(cell == rowMatrix[i-1]){
					continue;
				}
				cell.increaseHeight(h,this);
			};
			this.setBoxHeight(h);
		}else{
			for(var i=0;i< rowMatrix.length;i++){
				var cell = rowMatrix[i];
				if(cell == rowMatrix[i-1]){
					continue;
				}
				cell.allocateHeight(h,this);
			};
		}
	},
	heightChange:function(change){
		if(change){
			this._heightChange = true;
		}
		return this._heightChange;
	},
	positionChange:function(change){
		if(change){
			this._positionChange = true;
		}
		return this._positionChange;
	},
	notifyUpdate:function(args,type){
		if(!args instanceof Array){
			console.error("the arg must be array");
		}
		if(type){
			switch (type)
			{
				case "update":
					this.addChangedView(args[1]);
					break;
				case "insertBefore":
					this.insertBefore(args[0], args[1]);
					break;
				case "insertAfter":
					this.insertAfter(args[0], args[1]);
					break;
				case "delete":
					this.deleteView(args[0]);
					break;
				case "heightChange":
					this.heightChange(true);
					break;
				case "positionChange":
					this.positionChange(true);
					break;
				case "append":
					this.appendView(args[0]);
					break;
				default:
					console.info("can not handle the update type: "+type);
			}
		}
		this.getParent().notifyUpdate([this]);
		
	},
	deleteView:function(view){
		this.getContainer().remove(view);
		this.markDirtyDOM();
	},
	widthChange:function(colIdxs){
		this.getParent().notifyUpdate([this]);
	},
	resizeHeight:function(){
//		this._h = this.model.getBoxHeight();
//		this.heightChange(true);
		this.getParent().notifyUpdate([this]);
		this._resized = true;
	},
	repeatHead:function(){
		this.notifyUpdate([this],"heightChange");
		this.markDirtyDOM();
	},
	toCheckBorder:function(check){
		var cellView = this.cells.getFirst();
		while(cellView){
			cellView.toCheckBorder(check);
			cellView = cellView.next();
		}
	},
	isResized:function(){
		return this._resized;
	}
};
common.tools.extend(writer.view.update.RowViewUpdate.prototype,new writer.view.update.BlockView());
common.tools.extend(writer.view.update.RowViewUpdate.prototype,new writer.view.update.BlockContainerView());