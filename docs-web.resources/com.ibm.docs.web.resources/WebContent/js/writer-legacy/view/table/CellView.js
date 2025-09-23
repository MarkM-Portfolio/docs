dojo.provide("writer.view.table.CellView");
writer.view.table.CellView=function(model,ownerId,fromSplit ){
	this.top=0;
	this.model = model;
	this.ownerId = ownerId;
	!fromSplit&&this.init( ownerId );
	this.rowSpan = this.model.rowSpan;
	this.colSpan = this.model.colSpan;
	this.padding = this.model.getPadding();
	this.cellSpacing = this.model.getCellSpacing()||0;
	this.contentWidth= -1;
//	this.initEdgeWidth();
	this.aligner = {
		domNode:dojo.create("div",{
			"className":"align",
			"style":"height:0px;width:1px"
		}),
		render:function(){
			return this.domNode;
		},
		h:0
	};
};
writer.view.table.CellView.prototype={
	init:function( ownerId ){
		this.container = new common.Container(this);
		var c = this.model.container.getFirst();
		while(c){
			var v = c.preLayout(ownerId,true);
			this.container.append(v);		
			v.parent = this;
			c = this.model.container.next(c);
		}
	},
	_getContentWidth:function(){
		if(this.contentWidth==-1){
			var w =  this.model.getContentWidth();
			if(w<=0){
				console.error("the cell can not be zero");
			}
			this.contentWidth = this.model.getContentWidth()-(this.getLeftEdge()+this.getRightEdge())-this.cellSpacing*2;
		}
		return this.contentWidth;
	},
	layout:function(row){
		this.contentWidth = this.model.getContentWidth()-(this.getLeftEdge()+this.getRightEdge())-this.cellSpacing*2;
		if (this.bodySpace)
			delete this.bodySpace;
		this.bodySpace = new common.Space(this.contentWidth, common.Space.prototype._INFINITE, 0, 0, this);
		
		this.parent = row;
		this.markDirtyDOM();
		var that = this;
		var contentHeight = 0;
		this.container.forEach(function(c){
			c.top = contentHeight;
			c.left = 0;
			c.layout(that);
			contentHeight+=c.h||0;
		});
		this.contentHeight = Math.ceil(contentHeight);
		this._rowContentHeight = this.contentHeight; 
		this._hasLayout = true;
	},
	canSelected:function(){
		return !this.container.isEmpty();
	},
	canSplit:function(w,h){
		h = h - this.cellSpacing*2-(this.getTopEdge()+this.getBottomEdge());
		if(h >= this.contentHeight && this.contentHeight>0){
			return false;
		}
		var firstItem = this.container.getFirst();
		return firstItem&&firstItem.canSplit(w,h);
	},
	split:function(w,h,row){
		h = h - this.cellSpacing*2-(this.getTopEdge()+this.getBottomEdge());
		if(h>=this.contentHeight||this.container.isEmpty()){
			var c = new common.Container();
		}else{
			var tarPara = this.container.select(function(c){
				if(h>=c.h){
					h-=c.h;
					return false;
				}else{
					return true;
				}
			});
			var newPara = null;
			if(!tarPara){
				tarPara = this.container.getFirst();
			}else{
				newPara = tarPara.split(w,h);
				if(newPara&&newPara!=tarPara){
					this.container.insertAfter(newPara, tarPara);
				}
			}
			if(!newPara){
				newPara = tarPara;
			}
			var c = this.container.divide(newPara);
			if(c == this.container){
				this.container = new common.Container();
			}
		}
		
		var newCell = new writer.view.table.CellView(this.model,this.getOwnerId(), true);
		newCell.bodySpace = new common.Space(this._getContentWidth(), common.Space.prototype._INFINITE, 0, 0, this);
		newCell._hasLayout = true;
		this.model.addViewer(newCell,this.getOwnerId());
		newCell.container = c;
		newCell.parent = this.parent;
		newCell.alignItem();
		var contentHeight = newCell.contentHeight;
		newCell.setColIdx(this.getColIdx());
		newCell.left = this.left;
		newCell.setRowSpan(1);
		this.setContentHeight(this.contentHeight-contentHeight);
		return newCell;
	},
	merge:function(cell,force){
		var theSameModel = cell.model == this.model;
		if(!theSameModel&&!force){
			return false;
		}
		var firstPara = cell.container.getFirst();
		var lastPara = this.container.getLast();
		if(lastPara&&firstPara&&firstPara.model == lastPara.model){
			lastPara.merge(firstPara,0,firstPara.h+10);
			firstPara = cell.container.next(firstPara);
		}
		while(firstPara){
			this.container.append(firstPara);
			firstPara.parent = this;
			var t  = cell.container.next(firstPara);
			cell.container.remove(firstPara);
			firstPara = t;
		}
		this.markDirtyDOM();
		this.alignItem();
		this.setRowSpan(this.getRowSpan()+cell.getRowSpan()-1);
		this.model.removeViewer(cell,cell.getOwnerId());
		return true;
	},
	alignItem:function(){
		var contentHeight=0;
		var alignH = this.aligner&&this.aligner.h || 0;
		var that = this;
		this.container.forEach(function(p){
			p.parent = that;
			p.top = contentHeight+alignH;
			contentHeight+=p.h;
		});
		this.contentHeight =  Math.ceil(contentHeight);
//		this._rowContentHeight = this.contentHeight;
	},
	adjustAlign:function(){
		var align = this.model.getAlgin(this);
		var alignH = -1;
		
		if(align=="bottom"){
			alignH = this._rowContentHeight - this.contentHeight;			
		}
		if(align=="center"){
			alignH= (this._rowContentHeight - this.contentHeight)/2;
		}
		if(alignH>=0){
			dojo.style(this.aligner.domNode,{"height":alignH+"px"});
			var contentHeight=alignH;
			var that = this;
			this.container.forEach(function(p){
				p.top = contentHeight;
				contentHeight+=p.h;
			});
			this.aligner.h = alignH;
		}
	},
	
	render:function(){
		if(!this.domNode||this.isDirtyDOM()){
			this.domNode = dojo.create("td", {
				"style":"padding:"+this.cellSpacing+"px;left:"+this.left+"px;",
				"className":"cell "+this.getCSSStyle(),
				"colSpan":this.getColSpan(),
				"rowSpan":this.getRowSpan()
			});
			var contentNode = dojo.create("div",{
				"style":this.getStyleStr()
			});
			this.adjustAlign();
			contentNode.appendChild(this.aligner.domNode);
			var para = this.container.getFirst();
			while(para){
				contentNode.appendChild(para.render());
				para = this.container.next(para);
			}
			this.domNode.appendChild(contentNode);
			this.renderBorder();
			delete this._dirtyDOM;
			delete this._positionChange;
			delete this._heightChange;
			delete this._borderChange;
		}else{
			this.updateCellDOM();
		}

		// only for debug, easy to see sapce. turn on in SpaceBlock.js "_DEBUG: false,"
		this.drawSpace();

		return this.domNode;
	},
	renderBorder: function(){
		dojo.query('>.borderGroup',this.domNode).forEach(function(dom){
			dojo.destroy(dom);
		});
		var border = this.model.getBorder();
		if(!border)
			return;
		var edge = this.getEdgeWdith();
		var rowIndex = this.parent.getRowIdx();
		var colIndex = this.getColIdx();
		var table = this.getTable();
		var tableBorderMatrix = table.getTableMatrix()._borders;
		var topBorders = dojo.create("div",{
			className: "borderGroup topGroup"
		});
		var bottomBorders = dojo.create("div",{
			className: "borderGroup bottomGroup"
		});
		var c = 0,topBD = null,bottomBD = null;
		// fix corner
		var topLeftOffset = edge.left.border || 0,
			topRightOffset = edge.right.border || 0,
			bottomLeftOffset = edge.left.border || 0,
			bottomRightOffset = edge.right.border || 0;
		var me = this;
		var getOffsetHandler = function(border){
			if(border){
				border.width = border.width || border.sz;
				border.style = border.style || border.val;
			}
			if(border && border.width){
				var borderWidth = common.tools.toPxValue(border.width)/2;
				if ( dojo.isWebKit && borderWidth<1.0 && borderWidth!=0){
					borderWidth = 1.0;
				}
				if(me._adapterBorderStyle(border.style) === "double")
					borderWidth = borderWidth * 3;
				return Math.ceil(borderWidth);
			}
			return 0;
		};
		if(rowIndex > 0){
			var topLeftLink = tableBorderMatrix.cols[colIndex][rowIndex - 1];
			var topLeftCell = topLeftLink.getLinkedCell();
			var topLeftCellBorder = topLeftCell && topLeftCell.model && topLeftCell.model.getBorder(); 
			var topLeftBorder = null;
			if(topLeftLink.isLinkedPre()){
				topLeftBorder = topLeftCellBorder && topLeftCellBorder.right;
			}else{
				topLeftBorder = topLeftCellBorder && topLeftCellBorder.left;
			}
			topLeftOffset = Math.max(topLeftOffset,getOffsetHandler(topLeftBorder));
			if(colIndex < table.getTableMatrix().length2()){
				var topRightLink = tableBorderMatrix.cols[colIndex + this.colSpan][rowIndex - 1];
				var topRightCell = topRightLink.getLinkedCell();
				var topRightCellBorder = topRightCell && topRightCell.model && topRightCell.model.getBorder();
				var topRightBorder = null;
				if(topRightLink.isLinkedPre()){
					topRightBorder = topRightCellBorder && topRightCellBorder.right;
				}else{
					topRightBorder = topRightCellBorder && topRightCellBorder.left;
				}
				topRightOffset = Math.max(topRightOffset,getOffsetHandler(topRightBorder));
			}
		}
		if(rowIndex < table.getTableMatrix().length() - this.rowSpan){
			var bottomLeftLink = tableBorderMatrix.cols[colIndex][rowIndex + this.rowSpan];
			var bottomLeftCell = bottomLeftLink.getLinkedCell();
			var bottomLeftCellBorder = bottomLeftCell && bottomLeftCell.model && bottomLeftCell.model.getBorder();
			var bottomLeftBorder = null;
			if(bottomLeftLink.isLinkedPre()){
				bottomLeftBorder = bottomLeftCellBorder && bottomLeftCellBorder.right;
			}else{
				bottomLeftBorder = bottomLeftCellBorder && bottomLeftCellBorder.left;
			}
			bottomLeftOffset =Math.max(bottomLeftOffset,getOffsetHandler(bottomLeftBorder));
			if(colIndex < table.getTableMatrix().length2()){
				var bottomRightLink = tableBorderMatrix.cols[colIndex + this.colSpan][rowIndex + this.rowSpan];
				var bottomRightCell = bottomRightLink.getLinkedCell();
				var bottomRightCellBorder = bottomRightCell && bottomRightCell.model && bottomRightCell.model.getBorder();
				var bottomRightBorder = null;
				if(bottomRightLink.isLinkedPre()){
					bottomRightBorder = bottomRightCellBorder && bottomRightCellBorder.right;
				}else{
					bottomRightBorder = bottomRightCellBorder && bottomRightCellBorder.left;
				}
				bottomRightOffset =Math.max(bottomRightOffset,getOffsetHandler(bottomRightBorder));
			}
		}
		var tLeft = -topLeftOffset || 0,
			bLeft = -bottomLeftOffset || 0,
			right = 0;
		while(c < this.colSpan){
			right += table.model.getColumnWidth(colIndex + c);
			var topBorderMatrix = tableBorderMatrix.rows[rowIndex][colIndex+c];
			var bottomBorderMatrix = tableBorderMatrix.rows[rowIndex + this.rowSpan][colIndex+c];
			var TableBorder = writer.util.TableMatrix.Border;
			if(border.top){
				if(topBorderMatrix.linkMark.pos == TableBorder.LinkMark.TOP.pos){
					if(!topBD){
						topBD = dojo.create("div",{
							style:"position:absolute;top:"+(-edge.top.border) + "px;",
							className:"cellBorder"
						});
						dojo.style(topBD,"left",tLeft+"px");
						dojo.style(topBD,"borderTop",edge.top.border*2+"px "
							+ this._adapterBorderStyle(border.top.style)+ " #" +this._adapterBorderColor(border.top.color));
					}
					if(c == this.colSpan - 1)
						dojo.style(topBD,"width",(right + topRightOffset - tLeft) +"px");
					else
						dojo.style(topBD,"width",(right - tLeft) + "px");	
				}else{
					if(topBD)
						topBorders.appendChild(topBD);
					topBD = null;
					tLeft = right;
				}	
			}
			if(border.bottom){
				if(bottomBorderMatrix.linkMark.pos == TableBorder.LinkMark.BOTTOM.pos){
					if(!bottomBD){
						bottomBD = dojo.create("div",{
							style:"position:absolute;bottom:"+(-edge.bottom.border) + "px;",
							className:"cellBorder"
						});
						dojo.style(bottomBD,"left",bLeft+"px");
						dojo.style(bottomBD,"borderBottom",edge.bottom.border*2+"px "
							+ this._adapterBorderStyle(border.bottom.style)+" #"+this._adapterBorderColor(border.bottom.color));
					}
					if(c == this.colSpan - 1)
						dojo.style(bottomBD,"width",(right + bottomRightOffset - bLeft) +"px");
					else
						dojo.style(bottomBD,"width",(right - bLeft) + "px");
				}else{
					if(bottomBD)
						bottomBorders.appendChild(bottomBD);
					bottomBD = null;
					bLeft = right;
				}
			}
			
			c++;
		}
		if(topBD){
			topBorders.appendChild(topBD);
			topBD = null;
		}
		if(bottomBD){
			bottomBorders.appendChild(bottomBD);
			bottomBD = null;
		}
		this.domNode.appendChild(topBorders);
		this.domNode.appendChild(bottomBorders);
		var leftBorders = dojo.create("div",{
			className:"borderGroup leftGroup"
		});
		var rightBorders = dojo.create("div",{
			className:"borderGroup rightGroup"
		});
		var r = 0,leftBD = null,rightBD = null;
		var lTop = edge.top.border || 0,
			rTop = edge.top.border || 0,
			bottom = 0;
		var row = this.parent;
		while(r < this.rowSpan && row){
			bottom += row.getBoxHeight();
			if(r == this.rowSpan -1)
				bottom -= edge.bottom.border;
			var leftBorderMatrix = tableBorderMatrix.cols[colIndex][rowIndex + r];
			var rightBorderMatrix = tableBorderMatrix.cols[colIndex+this.colSpan][rowIndex + r];
			if(border.left){
				if(leftBorderMatrix.linkMark.pos == TableBorder.LinkMark.LEFT.pos){
					if(!leftBD){
						leftBD = dojo.create("div",{
							style:"position:absolute;left:"+(-edge.left.border) + "px;"
						});
						dojo.style(leftBD,"top",lTop+"px");
						dojo.style(leftBD,"borderLeft",edge.left.border*2+"px "
							+ this._adapterBorderStyle(border.left.style)+ " #" +this._adapterBorderColor(border.left.color));
					}
					dojo.style(leftBD,"height",(bottom - lTop) +"px");
				}else{
					if(leftBD)
						leftBorders.appendChild(leftBD);
					leftBD = null;
					lTop = bottom;
				}
			}
			if(border.right){
				if(rightBorderMatrix.linkMark.pos == TableBorder.LinkMark.RIGHT.pos){
					if(!rightBD){
						rightBD = dojo.create("div",{
							style:"position:absolute;right:"+(-edge.right.border) + "px;"
						});
						dojo.style(rightBD,"top",rTop+"px");
						dojo.style(rightBD,"borderRight",edge.right.border*2+"px "
							+this._adapterBorderStyle(border.right.style)+" #"+this._adapterBorderColor(border.right.color));
					}
					dojo.style(rightBD,"height",(bottom - rTop) +"px");
				}else{
					if(rightBD)
						rightBorders.appendChild(rightBD);
					rightBD = null;
					rTop = bottom;
				}	
			}
			r++;
			row = row.next();
		}
		if(leftBD){
			leftBorders.appendChild(leftBD);
			leftBD = null;
		}
		if(rightBD){
			rightBorders.appendChild(rightBD);
			rightBD = null;
		}
		this.domNode.appendChild(leftBorders);
		this.domNode.appendChild(rightBorders);
	},
	getChildCount: function(){
		return this.container.length();
	},
	getStyleStr:function(){
		var val =  "overflow: visable;width:"+this._getContentWidth()+"px;height:"+Math.max(this.contentHeight,this._rowContentHeight)+"px;"+this.getBorderStyleStr()+this.getColorStyleStr();
		return val;
	},
	getCSSStyle:function(){
		return this.getTable().getCSSStyle()+" "+this.model.getCSSStyle();
	},
	getColorStyleStr:function(){
		var color = this.model.getColor();
		if(color){
			var str =" ";
			if(color["background-color"]){
				str+="background-color:#"+color["background-color"];
					  
			}
			if(color['color']){
				if(str.length!=0){
					str+=";";
				}
				str+="color"+color['color'];
			}
			return str;
		}
		return " ";
	},
//	getPaddingStyelStr:function(){
//		return "padding:"+(this.edgeWidth-1)+"px;";
//	},
	getViewType:function(){
		return 'table.Cell';
	},
	getContainer:function(){
		return this.container;
	},
	getWidth:function(){
		var w = this._getContentWidth();
		if(this.padding){
			w = w- this.padding.left - this.padding.right;
		}
		return w;
	},
	//37465
	getHeight: function(){
		return this.getContentHeight();
	},
	
	getPaddingLeft: function() {
		return this.getLeftEdge();
	},
	getContentWidth:function(){
		return this._getContentWidth()+ (this.getLeftEdge()+this.getRightEdge());
	},
	getBoxWidth:function(){
		return this.getContentWidth()+this.cellSpacing*2;
	},
	getContentHeight:function(onlyContent){
		if(onlyContent){
			return this.contentHeight+ (this.getTopEdge()+this.getBottomEdge());
		}else{
			return Math.max(this.contentHeight,this._rowContentHeight)+ (this.getTopEdge()+this.getBottomEdge());
		}
		
	},
	getBoxHeight:function(onlyContent){
		return this.getContentHeight(onlyContent)+ this.cellSpacing*2;
	},
	getAllocatedHeight:function(row){
		return row.top- this.parent.top;
	},
	getRequiredHeight:function(row){
		if(this.getRowSpan()==1){
			return this.getBoxHeight(true);
		}else{
			var idx = row.getRowIdx()- this.parent.getRowIdx()+1;
			if(idx!= this.rowSpan){
				return 0;
			}else{
				return this.getBoxHeight(true) - this.getAllocatedHeight(row);
			}
		}
	},
	allocateHeight:function(h,row){
		if(this.getRowSpan()==1){
			 this.setBoxHeight(h);
		}else{
			var idx = row.getRowIdx()- this.parent.getRowIdx();
			if(idx+1== this.rowSpan){
				this.setBoxHeight(this.getAllocatedHeight(row)+h);
			}
		}
	},
	setBoxHeight:function(h){
		h = h - this.cellSpacing*2 - (this.getTopEdge()+this.getBottomEdge());
		if(this._rowContentHeight!=h){
			this._rowContentHeight = h;
			this.heightChange(true);
			this.adjustAlign();
		}
	},
	setContentHeight:function(h){
		h =  Math.ceil(h);
		this.contentHeight = h;
		if(this._rowContentHeight!=h){
			this._rowContentHeight = h;
			this.heightChange(true);
		}
	},
	getContentTop:function(){
		var top = this.getTop();
//		var table = this.getTable();
//		top +=table.getContentTop();
		return top+this.cellSpacing+this.getTopEdge();
	},
	getContentLeft:function(){
		var left = this.getLeft();
//		var table = this.getTable();
//		left +=table.getContentLeft();
		return left+this.cellSpacing+this.getLeftEdge();
	},
	getTable:function(){
		return this.parent.parent;
	},
	getRowSpan:function(){
		return  this.rowSpan;
	},
	getColSpan:function(){
		return this.colSpan;
	},
	setRowSpan:function(s){
		this.rowSpan =s;
	},
	setColSpan:function(s){
		this.colSpan=s;
	},
	getColIdx:function(){
		return this._colIdx;
	},
	setColIdx:function(idx){
		this._colIdx = idx;
	},
	getElementPath:function(x,y,path,options){
		y = y- (this.parent&&this.parent.top||0);
		y = y - this.aligner.h;
		x = Math.max(x-this.cellSpacing-this.getLeftEdge(),0);
		y = Math.max(y-this.cellSpacing-this.getTopEdge()-this.top,0);

		return this.getSpaceElementPath(x, y, path,options);
	},
	getChildPosition:function(){
//		var x = this._indexToOffset(idx);
		var x = this.getContentLeft();
		var y = this.getContentTop();
		return {'x':x,'y':y};
	},
	hasLayouted:function(){
		return this._hasLayout ;
	},
	markDirtyDOM:function(){
		this._dirtyDOM =true;
		this.parent.markDirtyDOM();
	},
	next:function(theSameRow){
		return this.parent.cells.next(this);
	},
	previous:function(theSameRow){
		return this.parent.cells.prev(this);
	},
	nextVertical:function(clearRecord){
		return writer.util.TableTools.moveDown(this,clearRecord);
	},
	prevCertical:function(clearRecord){
		return writer.util.TableTools.moveUp(this,clearRecord);
	},
	_initEdgeWidth:function(){
		return {left:{border:0,padding:5},right:{border:0,padding:5},top:{border:0,padding:3},bottom:{border:0,padding:2}};
	},
	getMinWidth:function(){
		return this.getLeftEdge()+this.getRightEdge()+this.cellSpacing*2+7;
	},
	getMinHeight:function(){
		return this.getTopEdge()+this.getBottomEdge()+this.cellSpacing*2+10;
	}
};
writer.model.Model.prototype.viewConstructors[writer.model.table.Cell.prototype.modelType]=writer.view.table.CellView;
common.tools.extend(writer.view.table.CellView.prototype,new writer.view.AbstractView());
common.tools.extend(writer.view.table.CellView.prototype,new writer.view.update.CellViewUpdate());
common.tools.extend(writer.view.table.CellView.prototype,new writer.view.table.TableBase());