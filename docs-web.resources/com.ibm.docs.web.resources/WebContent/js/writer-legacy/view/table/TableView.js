dojo.provide("writer.view.table.TableView");
dojo.require("writer.util.TableTools");
writer.view.table.TableView = function(model, ownerId, fromSplit){
	this.model = model;
	this.ownerId = ownerId;
	this.taskNode = new Object();
	this.tpNode=null;
	!fromSplit&&this.init( ownerId );	
//	this.initEdgeWidth();
};
writer.view.table.TableView.prototype={
	_MIN_MARGINTOP:3,
	marginTop:3,
	marginBottom:3,
	// if set as true means diable the repeat header function
	repeatHeadDisabled: false,
	init:function( ownerId ){
		this.rows = new common.Container(this);
		var rowModel = this.model.rows.getFirst();
		while(rowModel){
			var row = rowModel.preLayout(ownerId);
			row.parent = this;
			this.rows.append(row);
			rowModel = this.model.rows.next(rowModel);
		}
		this.marginLeft = 0;
	},
	destory: function()
	{
		this.model.removeViewer(this);
	},
	// implement of abstractView:canBePenetrated()
	canBePenetrated: function(x, y)
	{
		if (y < this.marginTop)
			return true;

		return false;
	},
	getViewType:function(){
		return 'table.Table';
	},
	getContainer:function(){
		return this.rows;
	},
	getBoxHeight:function(){
		return this.h;
	},
	getContentHeight:function(){
		return this._h;
	},
	getColumnWidth:function(i){
		return this.model.getColumnWidth(i);
	},
	calculateMarginTop: function()
	{
		var textArea = this.parent;
		var body = writer.util.ViewTools.getBody(textArea);
		if (!body || !textArea.bodySpace)
		{
			this.marginTop = this._MIN_MARGINTOP;
			return;
		}

		this.marginTop = textArea.bodySpace.getBottomFlatY() - textArea.offsetY + this._MIN_MARGINTOP;
		if (isNaN(this.marginTop)||this.marginTop < this._MIN_MARGINTOP)
			this.marginTop = this._MIN_MARGINTOP;
	},
	layout:function(body){
		this.parent = body;
		this.calculateMarginTop();
		if(this.isSplited){
			delete this.isSplited;
			return;
		}
		var row = this.rows.getFirst();
		var that = this;
		var rowWidth =0;
		var top =0;
		this.rows.forEach(function(row){
			row.setContentTop(top);
			row.layout(that);
			rowWidth = Math.max(rowWidth,row.getBoxWidth());
			top+= row.getBoxHeight();
		});
		this.w = rowWidth;
		this.adjustAlign();
		this._h = top;
		this.h = top+ this.getTopEdge()+this.getBottomEdge()+this.marginTop+this.marginBottom;
		this._hasLayout = true;
		this.markDirtyDOM();
	},
	adjustAlign:function(){
		var align = this.model.getAligin();
		if(!this.parent){
			return;
		}
		this.marginLeft = 0;
		if(align=="right"){
			this.marginLeft = this.parent.getWidth()-this.w;
		}else if(align=="center"){
			this.marginLeft = (this.parent.getWidth()-this.w)/2;
		}else {
			this.marginLeft = this.model.getIndent();
		}
	},
	canFit:function(w,h){
		if(this.h <= h){
			return true;
		}else{
			return false;
		}
	},
	getRepeatHeader:function(){
		var rowViews = [];
		var tableModel = this.model;
		//if this tableView disable repeatHeadDisabled we don't need to repeat header rows
		if(this.repeatHeadDisabled)
			return [];
		var row = tableModel ? tableModel.rows.getFirst() : null;
		while(row){
			if(row.isTblHeaderRepeat() != true || !writer.util.ModelTools.isInDocTable(row))
				break;
			//if repeat rows are splited
			var view = writer.util.ModelTools.getAllNonSplitedView(row);
			if(!view){
				// this row is splitted.
				rowViews = [];
				break;
			}
			//if cells in repeat rows are splited
			if(row.cells){
				var irregularRow = false;
				var cellSplitted = false;
				var rowSpan = row.cells.getFirst().getRowSpan();
				row.cells.forEach(function(cell){
					if(cell.getRowSpan() != rowSpan){
						irregularRow = true;
						return false;
					}
					if(!writer.util.ModelTools.getAllNonSplitedView(cell))
					{
						// this cell is splitted, should not go there.
						cellSplitted = true;
						return false;
					}
				});
				if (irregularRow || cellSplitted){
					rowViews = [];
					break;
				}
			}
			rowViews.push(view);
			row = tableModel.rows.next(row);
		}
		var viewCount = rowViews.length;
		if (viewCount > 0){
			var firstRowTableView = writer.util.ViewTools.getTable(rowViews[0]);
			if (firstRowTableView.rows.length() <= viewCount){
				rowViews = [];
				return rowViews;
			}
			for(var i=0; i<viewCount; i++){
				// should be in same tableView
				var rowTableView = writer.util.ViewTools.getTable(rowViews[i]);
				if (firstRowTableView != rowTableView){
					rowViews = [];
					break;
				}
				// should NOT be me
				if(this == rowTableView){
					rowViews = [];
					break;
				}
			}
		}
		return rowViews;
	},
	repeatViewH:function(rows){
		var rowViews = rows || this.getRepeatHeader();
		var h = 0;
		if(rowViews.length > 0){
			for (var i=0; i<rowViews.length; i++){
				 h += rowViews[i].getBoxHeight();
			}
		}
		return h;	
	},
	canSplit: function(w, h, body) {
		var rowModels = writer.util.TableTools.getRepeatHeaderRows(this.model);
		var repeatHeight = 0;
		var reserveHeight = 0;
		var view;
		//only need to decide repeatHeders can Split or not
		if (rowModels.length > 0 && this.rows.getFirst() == writer.util.ModelTools.getAllNonSplitedView(rowModels[0])) {
			//calculate repeatHeader's height
			for (var i = 0; i < rowModels.length; i++) {
				view = writer.util.ModelTools.getAllNonSplitedView(rowModels[i]);
				if (view)
					repeatHeight += view.getBoxHeight();
				else break;
			}
			// repeatHeder must render with next rowView,if not means table
			var next = this.rows.next(view);
			if (next) {
				reserveHeight = repeatHeight + next.getBoxHeight();
				if (body && body.getHeight() - (this.marginTop - this._MIN_MARGINTOP) > repeatHeight) {
					if (body.getHeight() - (this.marginTop - this._MIN_MARGINTOP) < reserveHeight) {
						var bodyContentH = body.getHeight() - (this.marginTop - this._MIN_MARGINTOP);
						var tarRow = this.rows.select(function(row) {
							var rowH = row.getBoxHeight();
							if (bodyContentH > rowH) {
								bodyContentH = bodyContentH - rowH;
								return false;
							} else {
								return true;
							}
						});
						if (tarRow && !tarRow.canSplit(w, bodyContentH) && tarRow == next)
							return true;
					} else {
						//  first table View ,no need to minus repeatH
						var unUsedHeight = h - (this.marginTop - this._MIN_MARGINTOP);
						if (unUsedHeight <= repeatHeight)
							return false;
						else if (unUsedHeight < reserveHeight) {
							var tarRow = this.rows.select(function(row) {
								var rowH = row.getBoxHeight();
								if (unUsedHeight > rowH) {
									unUsedHeight = unUsedHeight - rowH;
									return false;
								} else {
									return true;
								}
							});
							if (tarRow && !tarRow.canSplit(w, unUsedHeight) && tarRow == next)
								return false;
						}
					}
				}
			}
		}
		return true;
	},
	split:function(w,h,body){
		var repeatH = this.repeatViewH();
		var oh = h;
		h -= (this.marginTop - this._MIN_MARGINTOP + repeatH);
		var tarRow = this.rows.select(function(row){
			var rowH = row.getBoxHeight();
			if(h>=rowH){
				h = h - rowH; 
				return false;
			}else{
				return true;
			}
		});
		if(tarRow){
			var newRow = tarRow.split(w,h);
			var splitted = newRow != null;
			if(!newRow){
				newRow = tarRow;
			}
			if(newRow.getRowIdx()==0){
				// the row is out of the range of the body, then it will be force fixed in the body!
				if (splitted == false && repeatH > 0)
				{
					//if tried split first row onece but can't not split and it caused by repeat header
					//we disable this tableView repeatHeadDisabled prop,so that we don't repeat the header rows
					this.repeatHeadDisabled = true;
					return this.split(w, oh, body);
				}
				
				if(body && !body.getContainer().length()==0){
					return this;
				}else{
					newRow = this.rows.next(newRow);
					if(!newRow){
						return null;
					}
				}				
			}
			var newTable = new writer.view.table.TableView(this.model,this.getOwnerId(),true);
			/*new created tableView must inherited it's previous tableView's repeatHeadDisabled prop
			 which means if one tableview's previous tableviews don't repeat header,
			  this don't repeat as well
			*/
			newTable.repeatHeadDisabled = this.repeatHeadDisabled;
			var rows = this.rows.divide(newRow);
			newTable.rows = rows;
			newTable.isSplited=true;
			newTable.marginLeft = this.marginLeft;
			this.changeTable();
			this.model.addViewer(newTable,this.getOwnerId(),this);
			this.alignItem();
			newTable.alignItem();
			this.adjustAlign();
			newTable.marginLeft = this.marginLeft;
			newTable._hasLayout = true;
			var firstRow = newTable.rows.getFirst();
			firstRow.toCheckBorder(true);
			return newTable;
		}
		return null;
	},
	getTableMatrix:function(){
		if(!this._tableMatrix||this._tableStructChange){
			this._tableMatrix = new writer.util.TableMatrix(this);
			delete this._tableStructChange;
		}
		return this._tableMatrix ;
	},
	changeTable:function(){
		this._tableStructChange=true;
		this.markDirtyDOM();
	},
	canMerge:function(w,h){
		return true;
	},
	merge:function(table){
		var last = this.rows.getLast();
		var r = table.rows.getFirst();
		if(last.merge(r)&&r.deleted){
			r = table.rows.next(r);
		}		
		while(r){
			this.insertRow(r, last);
			last = r;
			r = table.rows.next(r);
		}
		this.changeTable();
		this.fixFirstRow();
		this.alignItem();
		this.markDirtyDOM();
//		table.deleteSel();
		this.model.removeViewer(table,table.getOwnerId());
	},
	alignItem:function(){
		var that = this;
		var rowWidth =0;
		var top = this.repeatViewH();
		this.rows.forEach(function(row){
			row.parent = that;
			rowWidth = Math.max(rowWidth,row.getBoxWidth());
			row.setContentTop(top);
			row.alignItem();
			top+= row.getBoxHeight();
		});
		this.w = rowWidth;
		this.h = top+ this.getTopEdge()+this.getBottomEdge()+this.marginTop+this.marginBottom;
		this._h = top;
	},
	taskRender : function() {
		if (pe.lotusEditor.getTaskHdl())
			pe.lotusEditor.getTaskHdl().taskRender(this);
	},
	getMainNode :function(){
		//add for table head repeat no table view domnode error
		if(!this.domNode)
			return null;
		return this.domNode.childNodes[0];
	},
	cleanRepeatHeaderDom: function(dom)
	{
		var selections = dojo.query(".cellSelection", dom);
		dojo.forEach(selections, dojo.destroy);
	},
	checkLinks: function(dom)
	{
		var selections = dojo.query(".hasLink", dom);
		dojo.forEach(selections, function(d){d.title=""});
	},
	render:function(){
		if(!this.domNode||this.isDirtyDOM()){
			this.adjustAlign();
			
			this.domNode = document.createElement("div");
			var style = "padding-bottom:"+this.marginBottom+"px;padding-top:"+this.marginTop +"px";
			this.domNode.setAttribute("style", style);
			this.domNode.id = this.model.id;
			
			var tableNode = document.createElement("table");
			tableNode.className = "table " + this.getCSSStyle();
			var tr = this.rows.getFirst();
			var repeatViews = this.getRepeatHeader();
			if (repeatViews.length >0 && this.repeatViewH(repeatViews)>0){
				for(var i=0; i<repeatViews.length; i++){
					var newDom = repeatViews[i].render().cloneNode(true);
					this.cleanRepeatHeaderDom(newDom);
					this.checkLinks(newDom);
					if(i == repeatViews.length - 1){
						dojo.query(">.cell>.bottomGroup",newDom).forEach(function(borderDom){
							dojo.destroy(borderDom);
						});
					}
					tableNode.appendChild(newDom);
				}
			}			
			while(tr){
				tableNode.appendChild(tr.render());
				tr = this.rows.next(tr);
			}
//			this.tpNode = tableNode;  // Unsupport task to remove it.
//			this.taskRender();
			
			var tblOuterNode = document.createElement("div");
			tblOuterNode.setAttribute("style", this.getStyleStr());
			tblOuterNode.appendChild(tableNode);
			this.domNode.appendChild(tblOuterNode);
			
			delete this._dirtyDOM;
			dojo.publish(writer.EVENT.TBLDOMCHG,[this]);
		}
		return this.domNode;
	},
	getStyleStr:function(){
		return "margin-left:"+this.marginLeft +"px;width:"+this.w+"px;height:"+this._h+"px;"+this.getBorderStyleStr();
	},
	getCSSStyle:function(){
		return this.model.getCSSStyle();
	},
	insertRow:function(newRow,tarRow){
		this.rows.insertAfter(newRow, tarRow);
		newRow.parent = this;
	},
	getElementPath:function(x,y,path,options){
		x -=  this.marginLeft;
		y -= this.getTopEdge();
		y -= this.marginTop;
		x-=this.getLeftEdge();
		var y1 = y;
		y -= this.repeatViewH();
		var tarRow = this.rows.select(function(row){
			if(y<=row.getBoxHeight()){
				return true;
			}else{
				y = y- row.getBoxHeight();
				return false;
			}
		});
		if(!tarRow){
			tarRow = this.rows.getLast();
			y = tarRow.getBoxHeight();
		}
		if(tarRow){
			path.push(tarRow);
			tarRow.getElementPath(x,y1,path,options);
		}
	},
	getContentTop:function(){
		var top = this.getTop();
		top+=this.getTopEdge();
		top+=this.marginTop;
		return top;
	},
	getContentLeft:function(){
		var left = this.getLeft();
		left+= this.getLeftEdge()+this.marginLeft;
		return left;
	},
	hasLayouted:function(){
		return this._hasLayout;
	},
	canBreak2pieces:function(){
		return true;
	},
	updateSelf:function(){
		this.markDirtyDOM();
		var parent = this.getParent();
		if(parent){
			this.parent.notifyUpdate([this]);
		}
	},
	reset:function(forceExe){
		var parent = this.getParent();
		if(!forceExe){
			parent.notifyUpdate([this]);
			this._reseted = true;
			return;
		}		
		if(parent){
			this.init(this.getOwnerId());
			delete this._hasLayout;
			this.markDirtyDOM();
			delete this._reseted ;			
			this.changeTable();
			this.getTableMatrix();
		}
	},
	getItemByIndex:function(index){
		return this.rows.getByIndex(index);
	},
	isReseted:function(){
		return this._reseted == true;
	},
	//fix the first row defect 37880
	fixFirstRow:function(){
		var toDelete = true;
		var firstRow = this.rows.getFirst();
		var cells = firstRow.cells;
		cells.forEach(function(cell){
			if(cell.getRowSpan()==1 && cell.container && cell.container.length()>0){
				toDelete = false;
			}
		});
		if(!toDelete){
			return;
		}
		var i =0;
		var cell = cells.getFirst();
		var nextRow = this.rows.next(firstRow);
		if(!nextRow){
			console.warn("something is incorrect!");
			return;
		}
		while(cell){
			var rowSpan = cell.getRowSpan();
			if(rowSpan>1){
				cell.setRowSpan(rowSpan-1);
				nextRow.cells.insertAt(cell,i);
			}
			cell = cells.next(cell);
			i++;
		}
		this.rows.remove(firstRow);
		firstRow.model.removeViewer(firstRow,firstRow.getOwnerId());
		this.changeTable();
	},
	_initEdgeWidth:function(){
		return {left:{border:0,padding:0},right:{border:0,padding:0},top:{border:0,padding:0},bottom:{border:0,padding:0}};
	},
	getMinWidth:function(){
		var matrix = this.getTableMatrix();
		var rowMatrix = matrix.getRowMatrix(this.rows.getFirst());
		var minW = 0;
		for(var i=0;i<rowMatrix.length;i++){
			var cell = rowMatrix[i];
			minW = minW + cell.getMinWidth();
		}
		return minW;
	},
	getMinHeight:function(){
		var matrix = this.getTableMatrix();
		var cells = matrix.getColumn(0);
		var minH =0;
		for(var i =0;i< cells.length;i++){
			var cell = cells[i];
			minH = minH + cell.getMinHeight();
		}
		return minH;
	},
	getChildPosition:function(idx){
		var row = this.rows.getByIndex(idx);
		if(!row){
			row = this.rows.getLast();
			return {'x':row.getBoxWidth()+this.getLeft(),'y':row.getTop()};
		}else{
			return {'x':row.getLeft(),'y':row.getTop()};
		}
	}
	
};
writer.view.table.TableBase = function(){
	
};
writer.view.table.TableBase.prototype = {
	initEdgeWidth:function(){
		this._edgeWidth= this._initEdgeWidth();
		var border = this.model.getBorder();
		if(border.left){
			borderWidth = common.tools.toPxValue(border.left.width)/2;
			if ( dojo.isWebKit && borderWidth<1.0 && borderWidth!=0){
				borderWidth = 1.0;
			}
			if(this._adapterBorderStyle(border.left.style) === "double")
				borderWidth = borderWidth * 3;
			this._edgeWidth.left.border =  Math.ceil(borderWidth);
		}
		if(border.right){
			borderWidth = common.tools.toPxValue(border.right.width)/2;
			if ( dojo.isWebKit && borderWidth<1.0 && borderWidth!=0){
				borderWidth = 1.0;
			}
			if(this._adapterBorderStyle(border.right.style) === "double")
				borderWidth = borderWidth * 3;
			this._edgeWidth.right.border =  Math.ceil(borderWidth);
		}
		if(border.top){
			borderWidth = common.tools.toPxValue(border.top.width)/2;
			if ( dojo.isWebKit && borderWidth<1.0 && borderWidth!=0){
				borderWidth = 1.0;
			}
			if(this._adapterBorderStyle(border.top.style) === "double")
				borderWidth = borderWidth * 3;
			this._edgeWidth.top.border =  Math.ceil(borderWidth);
		}
		if(border.bottom){
			borderWidth = common.tools.toPxValue(border.bottom.width)/2;
			if ( dojo.isWebKit && borderWidth<1.0 && borderWidth!=0){
				borderWidth = 1.0;
			}
			if(this._adapterBorderStyle(border.bottom.style) === "double")
				borderWidth = borderWidth * 3;
			this._edgeWidth.bottom.border =  Math.ceil(borderWidth);
		}
	},
	_borderSet:{"none":true,"dotted":true,"dashed":true,"solid":true,"double":true,"groove":true,"ridge":true,"inset":true,"outset":true},
	_adapterBorderStyle : function(style) {
		style = style.toLowerCase();
		var ret = common.tools.borderMap[style];
		if(this._borderSet[ret]){
			return ret;
		}else{
			return "solid";
		}
	},
	_adapterBorderColor : function(color) {
		if (!color) {
			return "";
		}
		color = color.toLowerCase();
		switch (color) {
		case "auto":
			return "000000";
		default:
			return color;
		}
	},
	getLeftEdge:function(){
		var edge = this.getEdgeWdith();
		return edge.left.border+edge.left.padding;
	},
	getRightEdge:function(){
		var edge = this.getEdgeWdith();
		return edge.right.border+edge.right.padding;
	},
	getTopEdge:function(){
		var edge = this.getEdgeWdith();
		return edge.top.border+edge.top.padding;
	},
	getBottomEdge:function(){
		var edge = this.getEdgeWdith();
		return edge.bottom.border+edge.bottom.padding;
	},
	getLeftBorderWidth:function(){
		return this.getEdgeWdith().left.border;
	},
	getRightBorderWidth:function(){
		return this.getEdgeWdith().right.border;
	},
	getTopBorderWidth:function(){
		return this.getEdgeWdith().top.border;
	},
	getBottomBorderWidth:function(){
		return this.getEdgeWdith().bottom.border;
	},
	getBorderStyleStr:function(){
		var border = this.model.getBorder();
		var edge = this.getEdgeWdith();
		var str ="";
		if(edge.left.border>0 || edge.left.padding>0){
			str+="padding-left:"+(edge.left.border + edge.left.padding)+"px;";
		}
		if(edge.right.border>0 || edge.right.padding>0){
			str+="padding-right:"+(edge.right.border + edge.right.padding)+"px;";
		}
		if(edge.top.border>0 || edge.top.padding>0){
			str+="padding-top:"+(edge.top.border + edge.top.padding)+"px;";
		}
		if(edge.bottom.border>0 || edge.bottom.padding>0){
			str+="padding-bottom:"+(edge.bottom.border + edge.bottom.padding)+"px;";
		}
		return str;
	},
	getEdgeWdith:function(){
		if(!this._edgeWidth){
			this.initEdgeWidth();
		}
		return this._edgeWidth;
	}
	
};
writer.model.Model.prototype.viewConstructors[writer.model.table.Table.prototype.modelType]=writer.view.table.TableView;
common.tools.extend(writer.view.table.TableView.prototype,new writer.view.AbstractView());
common.tools.extend(writer.view.table.TableView.prototype,new writer.view.update.TableViewUpdate());
common.tools.extend(writer.view.table.TableView.prototype,new writer.view.table.TableBase());