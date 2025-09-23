dojo.provide("writer.model.table.Row");
dojo.require("writer.model.prop.RowProperty");
dojo.require("writer.model.table.Cell");
writer.model.table.Row=function(json,table){
	this.parent = table;
	this.init(json);
};
writer.model.table.Row.prototype={
	modelType : writer.MODELTYPE.ROW,
	init:function(json){
		this.id = json.id;
		this.container = this.cells = new common.Container(this);
		var trPr = json.trPr;
		this.rowProperty = new writer.model.prop.RowProperty(trPr,this);
		if(trPr && trPr.trHeight){
			this.h = this.rowProperty.h;
		}
		
		var cells = json.tcs;
		if(cells){
			for(var i =0;i< cells.length;i++){
				var cell = new writer.model.table.Cell(cells[i],this,this.parent);
				cell&&this.cells.append(cell);
			}
		}
	},
	clearMergedCell:function(){
		var cell = this.cells.getFirst();
		while(cell){
			var next = this.cells.next(cell);
			if(cell.isMergedCell()){
				this.cells.remove(cell);
			}
			cell = next;
		}
	},
	getBoxHeight:function(){
		return this.h||0;
	},
	getRowIdx:function(){
		return this._rowIdx;
	},
	getProperty:function(){
		return this.rowProperty;
	},
	toJson:function(startColumn, endColumn,asFirstRow){
		startColumn = startColumn || 0;
		endColumn = (endColumn != undefined) ? endColumn : this.parent.getColumnCount();
		var tr = {};
		tr.tcs=[];
		tr.t = "tr";
		tr.id=this.id;
		tr.trPr = this.rowProperty&&this.rowProperty.toJson();
		if(!tr.trPr){
			delete tr.trPr;
		}
		var tableMatrix = this.parent.getTableMatrix();
		var cells = tableMatrix.getRowMatrix(this);
		for(var i=startColumn;i< endColumn;i++){
			if(i > 0 && cells[i]==cells[i-1]){
				continue;
			}
			var cell = cells[i];
			if(!this.cells.contains(cell)){
				if(asFirstRow){
					tr.tcs.push(cell.emptyClone());
				}else{
					tr.tcs.push(this.creatVMergedCell(cell));
				}
				
				
			}else{
				tr.tcs.push(cell.toJson());
			}			
		}
		return tr;
	},
	creatVMergedCell:function(cell){
		var json = {};
		json.tcPr={};
		json.tcPr.vMerge={};
		json.t = "tc";
		if(cell&&cell.getColSpan()>1){
			json.tcPr.gridSpan={};
			json.tcPr.gridSpan.val=cell.getColSpan();
		}
		var tableMatrix = this.parent.getTableMatrix();
		tableMatrix && (json.tcPr.tcBorders = tableMatrix.getBorder(this.getRowIdx(),cell.getColIdx()));
		return json;
	},
	emptyClone:function(after){
		var tableMatrix = this.parent.getTableMatrix();
		var cells = tableMatrix.getRowMatrix(this);
		var json = {};
		json.id= WRITER.MSG_HELPER.getUUID();
		var trPr = null;
		if(this.rowProperty){
			trPr = this.rowProperty.toJson();
		}
		json.trPr = trPr;
		json.tcs =[];
		var nextRow = this.parent.rows.next(this);
		var nextCells = nextRow&&tableMatrix.getRowMatrix(nextRow)||[];
		for(var i=0;i< cells.length;i++){
			if(cells[i]==cells[i-1]){
				continue;
			}
			var cell = cells[i];
			var cellJson = cell.emptyClone();
			if(cellJson.tcPr){
				//fix boders
				if(after && cellJson.tcPr.tcBorders)
					cellJson.tcPr.tcBorders.top = cellJson.tcPr.tcBorders.bottom;
				if(!after && cellJson.tcPr.tcBorders)
					cellJson.tcPr.tcBorders.bottom = cellJson.tcPr.tcBorders.top;
				if(this.cells.contains(cell)&&!after||nextCells[i]!=cell&&after){
					delete cellJson.tcPr.vMerge;
				}else if(cellJson.tcPr.vMerge){
					delete cellJson.tcPr.vMerge.val;
				}
			}			
			json.tcs.push(cellJson);
		}
		return json;
	},
	changeCSSStyle:function(style,isFirstColumn,isLastColumn,isVBand,isTBRow){
		var acts = [];
		if(isFirstColumn||isLastColumn||isVBand){
			var cnt = this.parent.getTableMatrix().length2();
			this.cells.forEach(function(cell){
				var cCnStOld = dojo.clone(cell.getProperty().getConditionStyle());
				var needMsg = cell.changeCSSStyle(isFirstColumn,isLastColumn,isVBand,cnt,isTBRow);
				if(!needMsg)return;
				var cCnStNew = cell.getProperty().getConditionStyle();
				var cStN = {type: 'cnSt', v: cCnStNew}, cStO = {type: 'cnSt', v: cCnStOld};
				acts.push(WRITER.MSG.createSetAttributeAct( cell, cStN, cStO, null, null ));
			});
		}
		var oldStyle = this.getConditionStyle()[0];
		var tableProperty = this.parent.getProperty();
		var ret = tableProperty.compareConditionStyle(oldStyle,style);
		if(ret){
//				this.markChangeStyle();
			this.cells.forEach(function(cell){
				cell.markChangeCSSStyle();
			});
			var rCnStOld = dojo.clone(this.getProperty().getConditionStyle());
			this.getProperty().setConditionStyle(style);
			this.clearAllCache();
			var rCnStNew = this.getProperty().getConditionStyle();
			var rStN = {type: 'cnSt', v: rCnStNew}, rStO = {type: 'cnSt', v: rCnStOld};
			!rCnStOld && delete rStO.v;
			!rCnStNew && delete rStN.v;
			acts.push( WRITER.MSG.createSetAttributeAct( this, rStN, rStO, null, null )  );
			if(ret==2){
				this.markReset();
			}
			this.checkRowBorder();
		}
		return acts;
		
	},
	changeCSSStyleByValue: function(conditionStyle){
		var oldStyle = this.getConditionStyle()[0];
		var newStyle = this.getProperty().mergeConditionStyle(conditionStyle)[0];
		var tableProperty = this.parent.getProperty();
		var ret = tableProperty.compareConditionStyle(oldStyle,newStyle);
		if(ret){
			this.getProperty().setConditionStyleByValue(conditionStyle);
			this.clearAllCache();
			this.cells.forEach(function(cell){
				cell.markChangeCSSStyle();
			});				
			if(ret==2){
				this.markReset();
			}
			this.checkRowBorder();
		}
	},
	markWidthChange:function(colIdxs){
		var cell = this.container.getFirst();
		var cellHitHandler = function(idx){
			return cell.getColIdx() <= idx && cell.getColIdx() + cell.getColSpan() >= idx;
		};
		while(cell){
			// cells contain the idx (the cell may be merged) should be update
			var hit = dojo.some(colIdxs,cellHitHandler);
			if(hit)
				cell.markCheckBorder && cell.markCheckBorder(true);
			cell = cell.next();
		}
		var allViews = this.getAllViews();
		for(var ownerId in allViews){
			var viewers = allViews[ownerId];
			var firstView = viewers.getFirst();
			while(firstView){
				firstView.hasLayouted()&&firstView.widthChange(colIdxs);
				firstView = viewers.next(firstView);
			}
    	}
	},
	resizeHeight:function(delH){
		if(Math.abs(delH)<=3){
			return false;
		}
		var oldH = 0;
		var allViews = this.getAllViews();
		for(var ownerId in allViews){
			var viewers = allViews[ownerId];
			var firstView = viewers.getFirst();
			oldH = firstView.getBoxHeight();
			break;
    	}
		var newH = oldH+delH;
		if(newH<10){
			return false;
		}
		this.h = newH;
		this.rowProperty.setHeight(this.h);
		return this.markHeightChange();		
	},
	setHeight:function(newH){
		this.h = newH;
		this.rowProperty.setHeight(this.h);
		return this.markHeightChange();	
	},
	setTblHeaderRepeat:function(value){
	 	this.rowProperty.setTblHeaderRepeat(value); 
	 	this.markHeadRepeat();
	 	this.parent.update();
	},
	// there are two return values: true, "none" .
	isTblHeaderRepeat:function(){
	 	return this.rowProperty.getTblHeaderRepeat();
	},
	markHeightChange:function(){
		var allViews = this.getAllViews();
		for(var ownerId in allViews){
			var viewers = allViews[ownerId];
			var firstView = viewers.getFirst();
			firstView.resizeHeight();
    	}
		return true;
	},
	markHeadRepeat:function(){
		var allViews = this.getAllViews();
		for(var ownerId in allViews){
			var viewers = allViews[ownerId];
			var firstView = viewers.getFirst();
			firstView.repeatHead();
    	}
		return true;
	},
	markInsert:function(){
		this.notifyInsertToModel();
		this.clearMergedCell();
		this.insertView();
	},
	markDelete:function(){
		this.notifyRemoveFromModel();
		this.deleteView();
	},
	markReset:function(){
		this.resetView();
	},
	update:function(forceExecu){
		if(forceExecu){
			this.suspendUpdate();
			return;
		}
	},
	isCrossPage:function(){
		var allViewrs = this.getAllViews();
		if(allViewrs){
			for(var ownerid in allViewrs){
				if(allViewrs[ownerid].length()>1){
					return true;
				}
			} 
			return false;
		}
	},
	getRowMatrix:function(){
		return this.parent.getTableMatrix().getRowMatrix(this);
	},
	getItemByIndex:function(index){
		if(index>=this.cells.length()){
			return null;
		}
		return this.cells.getByIndex(index);
	},
	checkRowBorder:function(){
		var tableMatrix = this.parent.getTableMatrix();
		var cells = tableMatrix.getRowMatrix(this);
		dojo.forEach(cells,function(cell){
			cell.markCheckBorder();
		});
	}
};
common.tools.extend(writer.model.table.Row.prototype, new writer.model.table.TableBase());