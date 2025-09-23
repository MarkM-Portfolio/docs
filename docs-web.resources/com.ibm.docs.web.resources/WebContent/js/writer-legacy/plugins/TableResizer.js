dojo.provide("writer.plugins.TableResizer");
dojo.declare("writer.plugins.TableResizer",[writer.plugins.Plugin], {
	_checkInterVal:0,
	init: function() {
//		this.editor = editor;
		dojo.subscribe(writer.EVENT.FIRSTTIME_RENDERED, this, this._init);
	},
	_init:function()
	{
		this._editorFrame = dojo.byId("editorFrame");
		this._mainNode = concord.util.browser.getEditAreaDocument().body;
		dojo.connect(this._mainNode , "mousemove", this, this._bindMouseMove);
		this._tblResizer = new writer.plugins.TableResizer.tblResizer(this);
		this._colResizer = new writer.plugins.TableResizer.colResizer(this);
		this._rowResizer = new writer.plugins.TableResizer.rowResizer(this);
		dojo.subscribe(writer.EVENT.TBLDOMCHG,this,"tableDomChange");
		dojo.subscribe(writer.EVENT.CANCELRESIZE,this,"_cancelResize");
		dojo.subscribe(writer.EVENT.UPDATECHANGESECTION,this,"_cancelResize");
	},
	_bindMouseMove:function(event){
		if(this._checking){
			return;
		}
		this._checking = true;
		var that = this;
		var x = event.clientX;
		var y = event.clientY;
		
		try{
			this.checkTarget(x,y);
		}catch(e){
			console.error(e);
		}		
		setTimeout(function(){			
			that._checking = false;
		},this._checkInterVal);		
	},
	_cancelResize:function(){
		this._tblResizer.cancelResize();
		this._rowResizer.cancelResize();
		this._colResizer.cancelResize();
	},
	tableDomChange:function(table){
		if(this._attachedTable == table){
//			console.info("delete the attach table")
			delete this._attachedTable;
		}
	},
	checkTarget:function(x,y){
		if(this.isResizing()){
			return;
		}
		var shell = this.editor.getShell();
		var sel = shell && shell.getSelection();
		if(sel&&sel.isSelecting()){
			return;
		}
		var point = shell.screenToClient({'x': x-2,'y': y-2 });
		var ret = shell.pickAnything(point);
		var obj = ret.obj.model;
		var inTable = writer.util.ModelTools.inTable(obj);
		if(!inTable){
			this._checkInterVal=400;
			this.hideAll();
//			console.log("it is not in table");
		}else{
			this._checkInterVal=50;
			var cell =  writer.util.ViewTools.getCell(ret.obj);
			if(!cell){
				console.info("no cell!!");
			}
			var point2 = shell.clientToLogical(point);
			this._currentCell = this._getTargetCellView(cell, point2.x, point2.y);
//			this.hideAll();
			if(this._currentCell ){
				this.currentPage = writer.util.ViewTools.getPage(this._currentCell);
//				console.info("point1: "+point.x+" "+point.y+" point2:"+point2.x+" "+point2.y)
//				console.info(this._currentCell.domNode);
				if(this.inTableRange(this._currentCell.getTable(), point2.x, point2.y)){
					this.attachTableResizer();
					if(!this.attachColumnResizer(point2.x,point2.y)){
						this.attachRowResizer(point2.x,point2.y);
					}	
				}else{
					console.info("out the range of the table");
				}
				
				
			}else{
				console.info("no cell view!!");
			}
		}
	},
	_getTargetCellView:function(cell,x,y){
		if(!cell){
			return null;
		}
		var left = cell.getLeft();
		var top =  cell.getTop();
		var h =    cell.getBoxHeight();
		var w =    cell.getBoxWidth();
		if(y<top-16||y>top+h+16){
			return null;
		}
//		console.info("point x: "+x+" y: "+y+" ;cell point left: "+left+" ;top: "+top+" ;w"+w+" ;h"+h);
//		if(x>=(left-16)&&x<=(left+w+16 )){
//			return cell;
//		}
		var row = cell.getParent();
		var isTableDirRtl = cell.getTable().model.tableProperty.getDirection() == "rtl";
		var firstCell = isTableDirRtl ? row.cells.getLast() : row.cells.getFirst();
		while(firstCell){
			left = firstCell.getLeft();
			w =    firstCell.getBoxWidth();
			if(x>=(left-16)&&x<=(left+w+16 )){
				return firstCell;
			}
			firstCell = isTableDirRtl ? row.cells.prev(firstCell) : row.cells.next(firstCell);
		}
		var parentCell = writer.util.ViewTools.getCell(cell.parent);
		if(parentCell){
			return this._getTargetCellView(parentCell,x,y);
		}
		return null;
	},
	inTableRange:function(table,x,y){
		var left = table.getContentLeft();
		var top  = table.getContentTop();
		var width = table.getWidth();
		var height= table.getBoxHeight();
		if(x<left-16||x>left+width+16){
			return false;
		}
		if(y<top-16||y>top+height+16){
			return false;
		}
		return true;
	},
	getCurrentTableView:function(table){
		var allViews = table.model.getAllViews();
		if(!allViews){
			return null;
		}
		var ownerId = this._currentCell.getOwnerId();
		var views = allViews[ownerId];
		var lastView = views&&views.getLast();
		return lastView;
	},
	attachTableResizer:function(){
		var currentTable = this._currentCell.getTable();
		if(!currentTable){
			this.hideTblResizer();
			return;
		}
		if(currentTable!=this._attachedTable||!this._tblResizer.isAttach() ){
			var attachView = this.getCurrentTableView(currentTable);
			this._tblResizer.attach(attachView);
			this._attachedTable = attachView;
		}
		this.showTblResizer();
	},
	attachRowResizer:function(x,y){		
		var left = this._currentCell.getLeft();
		var top =  this._currentCell.getTop();
		var h =    this._currentCell.getBoxHeight();
		var w =    this._currentCell.getBoxWidth();
		if(y>top+h-3&&y<top+h+3&&!this._rowResizer.isResizing()){
			this._rowResizer.attach(this._currentCell);
			this.showRowResizer();
			this.hideColResizer();
//			console.info("show row-resizer");
			return true;
		}		
	},
	attachColumnResizer:function(x,y){
		var left = this._currentCell.getLeft();
		var top =  this._currentCell.getTop();
		var h =    this._currentCell.getBoxHeight();
		var w =    this._currentCell.getBoxWidth();
		if(x>left+w-3&&x<left+w+3&&!this._colResizer.isResizing()){
			this._colResizer.attach(this._currentCell,x,y);
			this.showColResizer();
			//console.info("show col-resizer:x"+x + " left: "+left +" w:"+w);
			this.hideRowResizer();
			return true;
		}
		return false;
	},
	hideTblResizer:function(){
//		console.info("hide the table resize");
		this._tblResizer.hideResizer();
	},
	showTblResizer:function(){
		this._tblResizer.showResizer();
	},
	hideRowResizer:function(){
		this._rowResizer.hideResizer();
	},
	showRowResizer:function(){
		this._rowResizer.showResizer();
	},
	hideColResizer:function(){
	    this._colResizer.hideResizer();
	},
	showColResizer:function(){
		this._colResizer.showResizer();
	},
	hideAll:function(){
		this.hideColResizer();
		this.hideRowResizer();
		this.hideTblResizer();
	},
	showAll:function(){
		this.showColResizer();
		this.showRowResizer();
		this.showTblResizer();
	},
	isResizing:function(){
		return this._tblResizer.isResizing()||this._colResizer.isResizing()||this._rowResizer.isResizing();
	},
	disAttach:function(){
		this._tblResizer.destory();
		this._rowResizer.destory();
		this._colResizer.destory();
	}
});
writer.plugins.TableResizer.BaseResizer=function(owner){
	this.owner = owner;
};
writer.plugins.TableResizer.BaseResizer.prototype = {
	attach:function(target){
		this.destory();
		this._attach&&this._attach(target);
		this._isAttaching = true;
	},
	setResizer:function(x,y){
		
	},
	hideResizer:function(){
		if(this._isResizing){
			return;
		}
		dojo.style(this.resizer, "display","none");
	},
	showResizer:function(){
		dojo.style(this.resizer, "display","");
		if(this._startResizeEvent){			
			return;
		}
		this._startResizeEvent = dojo.connect(this.resizer, "mousedown", this, this.resizeStart);
//		console.info("binding mousedown!");
	},
	resizeStart:function(event){
//		console.info("start resize: "+this._isResizing);
		if(this._isResizing){
			return;
		}
		this._isResizing = true;
		var _editorFrame = dojo.byId("editorFrame");
		this._mainNode = concord.util.browser.getEditAreaDocument().body;
		var docNode = concord.util.browser.getEditAreaDocument();
		this._resizingEvent = dojo.connect(docNode , "mousemove", this, this.resizing);
		this._resizeEndEvent =dojo.connect(docNode , "mouseup", this, this.resizeEnd);
		this._resizeStart&&this._resizeStart();
		pe.lotusEditor.isResizing = true;
	},
	resizing:function(event){
		var x = event.clientX;
		var y = event.clientY;
		var point = this._pointToLogin(x, y);
		try{
			if(this.setResizer(point.x,point.y)){
				this.movingPoint = point;
			}
		}catch(e){
			console.error(e);
			this.destory();
			this.resizeEnd();
		}		
	},
	_pointToLogin:function(x,y){
		var shell = pe.lotusEditor.getShell();
		return shell.clientToLogical(shell.screenToClient({x:x,y:y}));
	},	
	resizeEnd:function(event){
		this._resizeEnd&&this._resizeEnd();
		this.destory();
		pe.lotusEditor.isResizing =false;
//		console.info("resizing end!");
	},
	destory:function(){
		this._isAttaching = false;
		dojo.disconnect(this._resizingEvent);
		dojo.disconnect(this._resizeEndEvent);
		dojo.disconnect(this._startResizeEvent);
		delete this._resizingEvent;
		delete this._resizeEndEvent;
		delete this._startResizeEvent;
		delete this._startRect;
		delete this._originalOverflow;
		delete this.movingPoint;
		this._isResizing = false;
		this.hideResizer();
		this._destory&&this._destory();
		pe.lotusEditor.isResizing = false;
	},			
	isAttach:function(){
		return this._isAttaching ;
	},
	isResizing:function(){
		return this._isResizing;
	},
	cancelResize:function(){
		this._cancel && this._cancel();
		this.destory();		
	}
};
dojo.declare("writer.plugins.TableResizer.tblResizer",[writer.plugins.TableResizer.BaseResizer], {
	resizer : dojo.create("div",{"style":"position:relative;opacity:1;z-index:10000;background-color:#FFFFFF;font-size:0;border:1px solid #000000;cursor:se-resize;width:4px;height:4px"}),
	resizerIndicator :dojo.create('div',{style:"filter:alpha(opacity=100);opacity:1;padding:0;border:1px dashed;position: relative; z-index: 299"}),
	_attach:function(target){
		//add for table head repeat no table view domnode error
		var node = target.getMainNode();
		if(!node) return; 
		var width = target.getWidth();
		var height = target.getBoxHeight();
		var contentHeight = target.getContentHeight();
		this._isTableDirRtl = target.model.tableProperty.getDirection() == "rtl";
		var resizerPos = this._isTableDirRtl ? 0 : width - 2;
		this._startRect = {x:target.getContentLeft()+width,y:target.getContentTop()+contentHeight+target.getBottomEdge()+target.marginBottom-6,w:width,h:contentHeight};
		dojo.style(this.resizer,{left:resizerPos+"px",top:"-2px"});
		dojo.style(this.resizerIndicator,{left:"0px",top:(0-contentHeight-6)+"px",width:width+"px",height:contentHeight+"px"});
		node.appendChild(this.resizer);
		node.appendChild(this.resizerIndicator);
		this._attachedTable = target;
		var tblMatrix = this._attachedTable.getTableMatrix();
		var rowCnt = tblMatrix.length();
		var colCnt = tblMatrix.length2();
		this._minH = this._attachedTable.getMinHeight();
		this._minW = this._attachedTable.getMinWidth();
		var tableContainer = writer.util.ViewTools.getTableContainer(this._attachedTable);
		this._maxW = tableContainer.getLeft()+tableContainer.getWidth()-6-this._attachedTable.getLeft()+this.owner.currentPage.left;
		this._maxW = Math.max(this._maxW,width);
	},
	setIndicator:function(x,y){
//		if(x<=this._startRect.x-this._startRect.w||y<=this._startRect.y-this._startRect.h){
//			return;
//		}
		if(x>=0 && y>=0){
			if(this._isTableDirRtl)
				dojo.style(this.resizerIndicator,{left:x-this._attachedTable.getContentLeft()+"0px",width:this._startRect.x-x+"px",height:(y-this._startRect.y+this._startRect.h)+"px"});
			else
				dojo.style(this.resizerIndicator,{width:(x-this._startRect.x+this._startRect.w)+"px",height:(y-this._startRect.y+this._startRect.h)+"px"});
		}else if(x>=0){
			if(this._isTableDirRtl)
				dojo.style(this.resizerIndicator,{left:x-this._attachedTable.getContentLeft()+"0px",width:this._startRect.x-x+"px"});
			else
				dojo.style(this.resizerIndicator,{width:(x-this._startRect.x+this._startRect.w)+"px"});
		}else if(y>=0){
			dojo.style(this.resizerIndicator,{height:(y-this._startRect.y+this._startRect.h)+"px"});
		}
		
	},
	hideResizer:function(){
		if(this._isResizing){
			return;
		}
		dojo.style(this.resizer, "display","none");
		dojo.style(this.resizerIndicator, "display","none");
	},
	_showIndicator:function(){
		dojo.style(this.resizerIndicator, "display","");
	},
	resizing:function(event){
		var x = event.clientX;
		var y = event.clientY;
		var point = this._pointToLogin(x, y);
		this.movingPoint = this.movingPoint||{};
		try{
			var ret = this.setResizer(point.x,point.y);
			if(ret.x){
				this.movingPoint.x = point.x;
			}
			if(ret.y){
				this.movingPoint.y = point.y;
			}
//			if(this.setResizer(point.x,point.y)){
//				this.movingPoint = point;
//			}
		}catch(e){
			console.error(e);
			this.destory();
			this.resizeEnd();
		}		
	},
	
	setResizer:function(x,y){
		var ret = {x:true,y:true};
		if((!this._isTableDirRtl&&x<=this._startRect.x-this._startRect.w)||(this._isTableDirRtl&&x>=this._startRect.x)){
			ret.x = false;
		}
		if(y<=this._startRect.y-this._startRect.h){
			ret.y = false;
		}
		var delta = this._isTableDirRtl ? this._startRect.w+this._attachedTable.getContentLeft()-x : this._attachedTable.getWidth()+(x-this._startRect.x);
		if(delta >= this._maxW || delta <= this._minW){
			ret.x = false;
		}
		if(this._attachedTable.getBoxHeight()+(y-this._startRect.y-2)<=this._minH){
			ret.y = false;
		}
//		if(this._attachedTable.getWidth()+(x-this._startRect.x)>=this._maxW||this._attachedTable.getWidth()+(x-this._startRect.x)<=this._minW||this._attachedTable.getBoxHeight()+(y-this._startRect.y-2)<=this._minH){
//			return false;
//		}
		if(ret.x&&ret.y){
			dojo.style(this.resizer,{left:(x-this._startRect.x+this._startRect.w-2)+"px",top:(y-this._startRect.y-2)+"px"});
			this.setIndicator(x,y);
		}else if(ret.x){
			dojo.style(this.resizer,{left:(x-this._startRect.x+this._startRect.w-2)+"px"});
			this.setIndicator(x,-1);
		}else if(ret.y){
			dojo.style(this.resizer,{top:(y-this._startRect.y-2)+"px"});
			this.setIndicator(-1,y);
		}		
		this._showIndicator();		
		return ret;
	},
	_resizeEnd:function(){
		if(!this.movingPoint||!this.isResizing()){
			return;
		}
		try{
			var delX = this._isTableDirRtl ? this._startRect.x - this._startRect.w - this.movingPoint.x
					: this.movingPoint.x - this._startRect.x;
			var delY = this.movingPoint.y - this._startRect.y;
			dojo.publish(writer.EVENT.RESIZETABLE,[this._attachedTable.model,delX,delY]);			
		}catch(e){
			console.error(e);
		}
		this.owner.disAttach();
	}
});
dojo.declare("writer.plugins.TableResizer.colResizer",[writer.plugins.TableResizer.BaseResizer], {
	resizer : dojo.create("div",{style:"position:relative;border-left:1pt  dashed #000000;cursor: col-resize; opacity: 0;width:5px"}),
	extendHeght:1000,
	_attach:function(target){
		var table = target.getTable();
		var left = target.getBoxWidth()+target.left;
		var width = table.getWidth();
		var height = table.getBoxHeight();		
		dojo.style(this.resizer,{left:left+"px",top:(0-height-this.extendHeght/2)+"px",height:this.extendHeght+height+"px"});
		//add for table head repeat no table view domnode error
		var node = table.getMainNode();
		if(!node) return;
		node.appendChild(this.resizer);
		this._attachedCell = target;
		
	},
	setResizer:function(x,y){
		var targetCell = this._attachedCell;
		if(this._attachedCell.getColSpan()>1){
			var matrix = this._attachedCell.getTable().getTableMatrix();
			var colIdx = this._attachedCell.getColIdx()+this._attachedCell.getColSpan()-1;
			var cells = matrix.getColumn(colIdx);
			var targetCell = null;
			for(var i=0;i<cells.length;i++){
				if(cells[i].getColSpan()==1){
					targetCell = cells[i];
					break;
				}
			}
		}
		if(x>targetCell.getLeft()+ targetCell.getMinWidth()){
			var isTableDirRtl = this._attachedCell.getTable().model.tableProperty.getDirection() == "rtl";
			var nextCell = isTableDirRtl ? this._attachedCell.previous(true) : this._attachedCell.next(true);
			if(nextCell){
				if(x>=  nextCell.getLeft()+nextCell.getBoxWidth()- nextCell.getMinWidth()){
					return false;
				}
			}else{
				var tableContainer = writer.util.ViewTools.getTableContainer(this._attachedCell.getParent());
				var _maxW = tableContainer.getLeft()+tableContainer.getWidth()-5-this._attachedCell.getLeft()+this.owner.currentPage.left+this._attachedCell.getTable().marginLeft;
				_maxW = Math.max(_maxW,this._attachedCell.getBoxWidth());
				if(x - this._attachedCell.getLeft()>=_maxW){
					return false;
				}
			}
			dojo.style(this.resizer,{left:(x-this._attachedCell.getLeft()+this._attachedCell.left)+"px"});
			return true;
		}
		return false;
	},
	_destory:function(){
		dojo.style(this.resizer,{opacity:0});
	},
	_resizeStart:function(){
		dojo.style(this._mainNode,{cursor: "col-resize"});
		dojo.style(this.resizer,{opacity:1});
	},
	_resizeEnd:function(){
		dojo.style(this._mainNode,{cursor: "auto"});
		if(!this.movingPoint||!this.isResizing()){
			return;
		}
		try{
			var delX = this.movingPoint.x - (this._attachedCell.getBoxWidth()+this._attachedCell.getLeft());
			var table = this._attachedCell.getTable().model;
			if(table.tableProperty.getDirection() == "rtl") {
				this._attachedCell = this._attachedCell.previous(true);
				delX = 0 - delX;
			}
			var idx = this._attachedCell ? this._attachedCell.getColIdx()+this._attachedCell.getColSpan()-1 : -1;
			dojo.publish(writer.EVENT.RESIZECOLUMN,[table,idx,delX]);
		}catch(e){
			console.error(e);
		}
		this.owner.disAttach();
	},
	_cancel:function(){
		if(this._mainNode){
			dojo.style(this._mainNode,{cursor: "auto"});
		}
	}
});
dojo.declare("writer.plugins.TableResizer.rowResizer",[writer.plugins.TableResizer.BaseResizer], {
	resizer:dojo.create("div",{style:"position:relative;border-top:1pt  dashed #000000;cursor: row-resize; opacity:0;height:5px;"}),
	extendWidth:1000,
	attach:function(target){
		this.destory();
		var row   =  this.getAttachRowView(target,target.getOwnerId());
		var table = row.parent;
		var top =  table.getContentHeight()-(row.top+row.getBoxHeight())+6;
		var width = table.getWidth();
		var left  = table.getLeft();
		var topWidth  = target.getBottomBorderWidth();
//		var resizerHeight = topWidth+bottomWidth-1-marginTop;
		top = top;
		var page = this.owner.currentPage;
		var pageWidth = page.getWidth();
		dojo.style(this.resizer,{left:(0-left+page.left-3)+"px",top:(0-top)+"px",width:(pageWidth)+"px"});
		//add for table head repeat no table view domnode error
		var node = table.getMainNode();
		if(!node) return;
		node.appendChild(this.resizer);
		this._attachedRow = row;
		this._isAttaching = true;
	},
	setResizer:function(x,y){
		var top = this._attachedRow.getTop()+6;
		if(y>top+16){
			var table = this._attachedRow.parent;
			top = y-top+this._attachedRow.top;
			top =  table.getContentHeight()-top;
			dojo.style(this.resizer,{top:(0-top-3)+"px"});
			return true;
		}
		return false;
	},
	_destory:function(){
		dojo.style(this.resizer,{opacity:0});
	},
	_resizeStart:function(){
		dojo.style(this._mainNode,{cursor: "row-resize"});
		dojo.style(this.resizer,{opacity:1});
	},
	_resizeEnd:function(){
		dojo.style(this._mainNode,{cursor: "auto"});
		if(!this.movingPoint||!this.isResizing()){
			return;
		}
		try{
			var delH = this.movingPoint.y - this._attachedRow.getTop()-this._attachedRow.getBoxHeight();
			var table = this._attachedRow.getParent().model;
			dojo.publish(writer.EVENT.RESIZEROW,[table,this._attachedRow.model.getRowIdx(),Math.round(delH)]);
		}catch(e){
			console.error(e);
		}
		this.owner.disAttach();
	},
	getAttachRowView:function(cell,ownerId){
		var rowSpan = cell.getRowSpan();
		var targetRow = cell.getParent();
		while(rowSpan>1){
			targetRow = targetRow.next();
			rowSpan--;
		}
		return targetRow;
	},
	_cancel:function(){
		if(this._mainNode){
			dojo.style(this._mainNode,{cursor: "auto"});
		}
	}
});