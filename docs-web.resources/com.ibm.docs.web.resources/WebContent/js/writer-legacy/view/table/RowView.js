dojo.provide("writer.view.table.RowView");
writer.view.table.RowView=function(model,ownerId, fromSplit){
	this.model = model;
	this.ownerId = ownerId;
	this.left =0;
	this.top =0;
	this.h=this._h=0;
	!fromSplit&&this.init( ownerId );
};
writer.view.table.RowView.prototype={
	init:function( ownerId ){
		this.h= this.model.getBoxHeight();
		this._h = Math.ceil(this.h);
		this.cells = new common.Container(this);
		var cellModel = this.model.cells.getFirst();
		while(cellModel){
			var cell = cellModel.preLayout(ownerId);
			cell.parent = this;
			this.cells.append(cell);
			cellModel = this.model.cells.next(cellModel);
		}
	},
	getViewType:function(){
		return 'table.Row';
	},
	layout:function(table){
		this.markDirtyDOM();
		this.parent = table;
		var rowMatrix = this.parent.getTableMatrix().getRowMatrix(this);
		var that = this;
		this.cells.forEach(function(cell){
			cell.layout(that,table);
		});
		var left =0;
		var maxHeight = this._h;
		for(var i=0;i< rowMatrix.length;i++){
			var cell = rowMatrix[i];
			if(cell == rowMatrix[i-1]){
				continue;
			}
			if(this.cells.contains(cell)){
				cell.left = left;
			}
			left += cell.getBoxWidth();
			var h1 =  cell.getRequiredHeight(this);
			maxHeight = Math.max(maxHeight,h1);
		}
		this.w = left;
		var isTableDirRtl = this.parent.model.tableProperty.getDirection() == 'rtl';
		for(var i=0;i< rowMatrix.length;i++){
			var cell = rowMatrix[i];
			if(cell == rowMatrix[i-1]){
				continue;
			}
			if(isTableDirRtl && this.cells.contains(cell))
				cell.left = this.w - cell.getBoxWidth() - cell.left;

			cell.allocateHeight(maxHeight,this);
		}
		this.setBoxHeight(maxHeight);
		this._hasLayout = true;
	},
	getContainer:function(){
		return this.cells;
	},
	childLen:function(){
		return this.cells.length();
	},
	render:function(){
		if(!this.domNode||this.isDirtyDOM()){
			this.domNode = dojo.create("tr", {
				"style":this.getStyleStr(),
				"class":"row "
			});
			var cell = this.cells.getFirst();
			while(cell){
				this.domNode.appendChild(cell.render());
				cell = this.cells.next(cell);
			}
			delete this._dirtyDOM;
			delete this._heightChange;
		}else{
			this.cells.forEach(function(cell){
				cell.updateCellDOM();
			});
			this.updateDOMHeight();			
		}
		return this.domNode;
	},
	getStyleStr:function(){
		return "height:"+this.getBoxHeight()+"px;";
	},
	getCSSStyle:function(){
		return this.model.getCSSStyle();
	},
	setBoxHeight:function(h){
		this.h =h;
		this.heightChange(true);
	},
	setContentTop:function(top){
		this.top = top;
	},
	getBoxHeight:function(){
		return Math.max(this.h,this._h) ;
	},
	getBoxWidth:function(){
		return this.w;
	},
	getContentLeft:function(){
		return this.getLeft();
	},
	getContentTop:function(){
//		return this.top;
		return this.parent.getContentTop()+this.top;
	},
	getRowIdx:function(){
		return this._rowIdx;
	},
	getRowMatrix:function(){
		return this.parent.getTableMatrix().getRowMatrix(this);
	},
	canSplit:function(w,h){
		var canSplit=false;
		this.cells.forEach(function(cell){
			if (cell.getRowSpan()==1){
				canSplit = canSplit || cell.canSplit(w,h);
			}
		});
		if (this._h>h){
			canSplit = false;
		}
		return canSplit;
	},
	split:function(w,h){
		var canSplit=false;
		var rowMatrix = this.parent.getTableMatrix().getRowMatrix(this);
		this.cells.forEach(function(cell){
			if(cell.getRowSpan()==1){
				canSplit = canSplit || cell.canSplit(w,h);
			}
		});
		if(this._h>h){
			canSplit = false;
		}
		if(!canSplit){
			if(this.getRowIdx()>0){
				for(var i=0;i< rowMatrix.length;i++){
					var cell = rowMatrix[i];
					if(cell == rowMatrix[i-1]){
						continue;
					}
					if(cell.getRowSpan()!=1&&cell.parent!=this){
						this.splitMergedCellH(cell, this, w,0);
					}
				}
			}
			
			return null;
		}
		var newRow = new writer.view.table.RowView(this.model,this.getOwnerId(),true);
		newRow.w = this.w;
		this.model.addViewer(newRow,this.getOwnerId(),this);
		var crossRowCells = [];
		for(var i=0;i< rowMatrix.length;i++){
			var cell = rowMatrix[i];
			if(cell == rowMatrix[i-1]){
				continue;
			}
			if(cell.getRowSpan()!=1){
				crossRowCells.push(cell);
				continue;
			}
			var newCell = cell.split(w,h);
			if(!newCell){
				console.error("the cell must can be splited!");
			}else{
				writer.util.TableTools.insertCell(newCell,newRow);
			}
		}
		this.parent.insertRow(newRow, this);
		writer.util.TableTools.splitHCells(rowMatrix,newRow);
		for(var i =0;i<crossRowCells.length;i++){
			var cell = crossRowCells[i];
			this.splitMergedCellH(cell, newRow,w, h);
		}
		this.alignItem(0);
		newRow._hasLayout = true;
		return newRow;
	},
	merge:function(row){
		var r  = this.parent.getTableMatrix().getRowMatrix(this);
		var r1 = row.parent.getTableMatrix().getRowMatrix(row);
		if(r.length!=r1.length){
			console.error("someting is error!");
			return;
		}	
		var i=0;
		var ret = false;
		var mergedCell =[];
		for(var i=0;i< r.length;i++){
			if(r[i]==r[i-1]||r1[i]==r1[i-1]){
				continue;
			}
			if(r[i].merge(r1[i])){
				row.cells.remove(r1[i]);
				ret = true;
				mergedCell.push(r[i]);
			}
		}
		if(ret){
			this.markDirtyDOM();
			if(row.cells.isEmpty()){
				row.deleted = true;
				this.model.removeViewer(row,row.getOwnerId());
			}else{
				row.toCheckBorder(true);
				row.markDirtyDOM();
				for(var i=0;i< mergedCell.length;i++){
					mergedCell[i].setRowSpan(mergedCell[i].getRowSpan()+1);
					mergedCell[i].toCheckBorder(true);
				}
			}
		}
		return ret;
	},
	splitMergedCellH:function(cell,newRow,w,h){
		h = h||0;
		var h1 = cell.getAllocatedHeight(this)+h;
		var newCell = cell.split(w,h1);
		writer.util.TableTools.insertCell(newCell,newRow);
		writer.util.TableTools.splitMergedCell(cell,[newCell]);
	},
	alignItem:function(h){
		if(isNaN(h)){
			h = this._h;
		}
		var rowMatrix = this.parent.getTableMatrix().getRowMatrix(this);
		for(var i=0;i< rowMatrix.length;i++){
			var cell = rowMatrix[i];
			if(cell == rowMatrix[i-1]){
				continue;
			}
			h =  Math.max(cell.getRequiredHeight(this),h);
		}
		for(var i=0;i< rowMatrix.length;i++){
			var cell = rowMatrix[i];
			if(cell == rowMatrix[i-1]){
				continue;
			}
			cell.allocateHeight(h,this);
		};
		this.setBoxHeight(h);
	},
	getElementPath:function(x,y,path,options){
		var rowMatrix = this.parent.getTableMatrix().getRowMatrix(this);
		var i1, isTableDirRtl = this.parent.model.tableProperty.getDirection() == 'rtl';
		var cell = isTableDirRtl ? rowMatrix[rowMatrix.length-1] : rowMatrix[0],prevCell=null;
		for(var i=1;i< rowMatrix.length;i++){
			i1 = isTableDirRtl ? rowMatrix.length-i-1 : i;
			if(cell==prevCell){
				cell = rowMatrix[i1];
				continue;
			}
			if(x<cell.getBoxWidth()){
				break;
			}
			x-=cell.getBoxWidth();
			prevCell = cell;
			cell = rowMatrix[i1];
		}
		if(!cell){
			cell = rowMatrix[rowMatrix.lenght-1]
			x = cell.getBoxWidth();
		}
		if(cell){
			if(!cell.canSelected()){
				var idx = rowMatrix.indexOf(cell);
				var i= 0;
				while(idx-i>=0||idx+i<rowMatrix.length){
					cell = rowMatrix[idx+i];
					if(rowMatrix[idx+i]&&rowMatrix[idx+i].canSelected()){
						cell = rowMatrix[idx+i];
						break;
					}
					if(rowMatrix[idx-i]&&rowMatrix[idx-i].canSelected()){
						cell = rowMatrix[idx-i];
						break;
					}
					i++;
				}
				if(!cell){
					console.error("something is error!");
					return ;
				}
			}
			path.push(cell);
			cell.getElementPath(x,y,path,options);
		}
	},
	indexOf:function(cell){
		return this.container.indexOf(cell);
	},
	hasLayouted:function(){
		return this._hasLayout;
	},
	getItemByIndex:function(index){
		if(index>=this.cells.length()){
			return null;
		}
		return this.cells.getByIndex(index);
	},
	getReferredFootNote:function(_cache){
		var c = null, bCache = false;
		if (typeof _cache != 'undefined' && this.refId) {
			bCache = true;
			var v = _cache[this.refId];
			if (typeof v != 'undefined')
				return v;
		}
		
		var children = this.getContainer();
		children&&children.forEach(function(child){
			var fns = child.getReferredFootNote(_cache);
			if(fns){
				if (!c) c = new common.Container();
				c.appendAll(fns);
			}
		});
		
		if (bCache)
			_cache[this.refId] = c;
		
		return c;
	},
	reset:function(){
		var parent = this.getParent();
		if(parent){
			var ownerId = this.getOwnerId();
			this.h= this.model.getBoxHeight();
			this._h = Math.ceil(this.h);
			var cell = this.cells.getFirst();
			while(cell){
				cell.init(ownerId);
				cell = this.cells.next(cell);
			}
			this.layout(parent);
			parent.notifyUpdate([this]);
		}
	},
	getChildPosition:function(idx){
		var cell = this.cells.getByIndex(idx);
		if(!cell){
			cell = this.cells.getLast();
			return {'x':cell.getBoxWidth()+this.getLeft(),'y':cell.getTop()};
		}else{
			return {'x':cell.getLeft(),'y':cell.getTop()};
		}
	}
};
writer.model.Model.prototype.viewConstructors[writer.model.table.Row.prototype.modelType]=writer.view.table.RowView;
common.tools.extend(writer.view.table.RowView.prototype,new writer.view.update.RowViewUpdate());
common.tools.extend(writer.view.table.RowView.prototype,new writer.view.AbstractView());