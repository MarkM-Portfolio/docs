dojo.provide("writer.model.table.Table");
dojo.require("writer.model.prop.TableProperty");
dojo.require("writer.model.table.TableBase");
dojo.require("writer.util.TableTools");
dojo.require("writer.model.table.Row");
writer.model.table.Table=function(json,doc){
	this.parent = doc;
	this.doc = doc;
	this.task = "";
	this.init(json);
};
writer.model.table.Table.prototype={
	modelType : writer.MODELTYPE.TABLE,
	init:function(json){
		this.id = json.id;
		this.task = (json && json.taskId) || "";
		this.container = this.rows = new common.Container(this);
		this.cols = [];
		this._initTableCol(json);
		this._initTableProperty(json.tblPr);
		this._createRows(json.trs);
		this._initCellRowSpan();
	},
	/**
	 * Get the table length
	 * Use this function for select after table
	 * @returns
	 */
	getLength: function()
	{
		return 1;
	},
	_initTableProperty:function(json){
		this.tableProperty = new writer.model.prop.TableProperty(json,this); 
		this.tableStyleId = json.styleId;
		if(this.tableStyleId){
			var refStyle = pe.lotusEditor.getRefStyle(this.tableStyleId);
			refStyle&&refStyle.addReferer(this);
			if(refStyle){
				if(refStyle.isTableStyle){
					this.tableProperty.tableStyle=refStyle;
				}else{
					console.info("the refered Style is not a table Style!");
				}
				
			}
		}
		this.tableProperty.tblLook&&this.initConditionStyle(this.tableProperty.tblLook);
	},
	_createRows:function(trs){
		for(var i=0;i< trs.length;i++){
			var tr = new writer.model.table.Row(trs[i],this);
			tr&&this.rows.append(tr);
		}
	},
	_initTableCol:function(json){
		var colsj = json.tblGrid;
		for(var i=0;i< colsj.length;i++){
			this.cols.push(Math.round(common.tools.toPxValue(colsj[i].w)));
		}
	},
	_initCellRowSpan:function(){
		var rowCount = this.getTableMatrix().length();
		var row = this.rows.getFirst();
		while(row){
			var cell = row.cells.getFirst();
			while(cell){
				var next = row.cells.next(cell);
				if(cell.isMergedCell()){
					this.getTableMatrix().mergeVerticalCell(row,cell);
					row.cells.remove(cell);
				}
				cell = next;
			}
			row = this.rows.next(row);
		}
		this.getTableMatrix().fixBorderMatrix();
		
	},
	insertColumnW:function(idx,cnt){
		if(cnt==null||cnt<1){
			cnt = 1 ;
		}
		var total = 0;
		for(var i=0;i< this.cols.length;i++){
			total+= this.cols[i];
		}
		var ratio = total/(total+this.cols[idx]*cnt);
		var temp=0;
		for(var i=0;i< this.cols.length;i++){
			this.cols[i]= this.cols[i]*ratio;
			temp+=this.cols[i];
		}
		for(var i=0;i<cnt;i++){
			this.cols.splice(idx,0,(total-temp)/cnt);
		}
		
	},
	deleteColumnW:function(idx,cnt){
		if(cnt==null||cnt<1){
			cnt = 1 ;
		}
		var total = 0;
//		for(var i=0;i<this.cols.length;i++){
//			total+=this.cols[i];
//		}
//		var ratio = total/(total-this.cols[idx]);
		for(var i=0;i<cnt;i++){
			this.cols.splice(idx,1);
		}
		
//		for(var i=0;i<this.cols.length;i++){
//			this.cols[i] = this.cols[i]*ratio;
//		}
	},
	mergeColumnW:function(idx,cnt){
		var newW = 0;
		for(var i=1;i<cnt;i++){
			this.cols[idx] += this.cols[idx+1];
			this.cols.splice(idx+1,1);
		}
	},
	splitColumn:function(idx,nums){
		var colW = this.cols[idx];
		this.cols[idx] = colW/nums;
		for(var i=1;i<nums;i++){
			this.cols.splice(idx,0,colW/nums);
		}
		
	},
	resizeColunm:function(idx,del){
		if(idx<0||idx>this.cols.length-1){
			return;
		}
		if(this.cols[idx]+del<10){
			return ;
		}
		this.cols[idx]= this.cols[idx]+del;
	},
	scaleColumn:function(delW){
		var colLen = this.cols.length;
		var delWPerCol = delW/colLen;
		for(var i=0;i<this.cols.length;i++){
			if(this.cols[i] + delWPerCol >= 20){
				this.cols[i] += delWPerCol;
				delW -= delWPerCol;
			}else{
				var tmpDelW = 20 - this.cols[i];
				this.cols[i] = 20;
				delW -= tmpDelW;
				if(colLen-1-i > 0){
					delWPerCol = delW/(colLen-1-i);
				}				
			}
		}
	},
	changeCols:function(cols){
		var widthChange = false;
		if(this.cols.length!=cols.length){
			this.cols=[];
			for(var i=0;i< cols.length;i++){
				this.cols[i]= Math.round(common.tools.toPxValue(cols[i].w));
			}
			widthChange = true;
		}else{
			for(var i=0;i< this.cols.length;i++){
				if(this.cols[i]!=cols[i]){
					this.cols[i]=  Math.round(common.tools.toPxValue(cols[i].w));
					widthChange = true;
				}				
			}
		}
		if(widthChange){
			this.markWidthChange();
			this.update();
		}
	},
	getAligin:function(){
		var align = this.tableProperty.getAlignment();
		if(this.tableProperty.getDirection(true) == "rtl") {
			if(align == "right")
				align = "left";
			else if(align == "left" || !align)
				align = "right";
		}
		return align;
	},
	getIndent:function(){
		var ind = this.tableProperty.getIndent();
		if(!ind){
			ind =0;
		}
		return ind;
	},
	markWidthChange:function(colIdxs){
		this.rows.forEach(function(row){
			row.markWidthChange(colIdxs);
		});
	},
	getMinScaleWidth:function(){
		var colLen = this.cols.length;
		return colLen * 20;
	},
	getMinScaleHeight:function(){
		var rowLen = this.getTableMatrix().length();
		return rowLen * 20;
	},
	setCols: function(cols){
		var oldCols = this.cols;
		this.cols = cols;
		delete oldCols;
	},
	getColumnCount: function(){
		return this.cols.length;
	},
	getProperty:function(){
		return this.tableProperty;
	},
	getDefaultStyle:function(){
		return this.tableProperty.tableStyle();
	},
	getColumnWidth:function(i){
		return this.cols[i];
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
		var allViews = this.getAllViews();
    	for(var ownerId in allViews){
			var viewers = allViews[ownerId];
			var firstView = viewers.getFirst();
			while(firstView){
				firstView.changeTable();
				firstView = viewers.next(firstView);
			}
    	}
	},
	getTaskId:function(){
		return this.task;
	},
	isTask:function(){
		if(this.getTaskId()=="")
			return false;
		else 
			return true;
	},
	/**
	 * Set task to para 
	 * @param task_id
	 * @returns The message
	 */
	setTask: function(task_id)
	{
		var act = WRITER.MSG.createSetParaTaskAct(WRITER.ACTTYPE.SetTableTask,task_id==""?false:true, this.id, task_id==""?this.task:task_id);
		var msg = WRITER.MSG.createMsg( WRITER.MSGTYPE.Attribute, [act] );
		this.task = task_id;
		this.markDirty();
		return msg;			
	},
	getBorder:function(){
		var tableProperty  = this.getProperty();
		var border = dojo.clone(tableProperty.getBorder());
		if(tableProperty.tableStyle){
			var styleBorder = tableProperty.tableStyle.getBorder();
			border.left  = border.left||dojo.clone(styleBorder.left);
			border.right = border.right||dojo.clone(styleBorder.right);
			border.top =   border.top||dojo.clone(styleBorder.top);
			border.bottom =   border.bottom||dojo.clone(styleBorder.bottom);
		}
		return border;
	},
	getMergedTextProperty: function(){
    	if(!this.mergedTextProperty){
    		var property = this.getProperty();
    		if(!property){
    			this.mergedTextProperty ="empty";
    			return "empty";
    		}
    		this.mergedTextProperty = property.getMergedTextProperty();
    		var parentTextProp = this.parent.getMergedTextProperty();
    		if( parentTextProp && parentTextProp != "empty" )
			{
				if(this.mergedTextProperty == "empty")
					this.mergedTextProperty = parentTextProp.clone();
				else
					this.mergedTextProperty = parentTextProp.merge(this.mergedTextProperty);
			}
    	}
    	return this.mergedTextProperty;
    },
    clearStyle:function(value){
    	if(value){
    		this._noRecordStyle = true;
    	}else{
    		delete this._noRecordStyle ;
    	}
    },
    /**
     * 
     * @param startRow Start Row
     * @param endRow End Row
     * @param startCol Start column
     * @param endCol End column
     * @returns {___anonymous6494_6495}
     */
	toJson:function(startRow, endRow, startCol, endCol){
		startRow = parseInt(startRow) || 0;
		startCol = parseInt(startCol) || 0;
		endRow = parseInt(endRow);
		endCol = parseInt(endCol) ;
		if(isNaN(endRow)){
			endRow = (this.rows.length() - 1);
		}
		if(isNaN(endCol)){
			endCol = this.cols.length;;
		}		
		var result = {};
		result.t = "tbl";
		result.tblPr = this.tableProperty&&this.tableProperty.toJson();
		if(this.task!="")
			result.taskId = this.task;
		if(this.tableStyleId){
			if(!result.tblPr )result.tblPr ={};
			result.tblPr.styleId = this.tableStyleId;	// TODO for copy/paste, copy style content.
		}
		if(!result.tblPr ){
			delete result.tblPr ;
		}
		if(this._noRecordStyle && result.tblPr){
			delete result.tblPr.tblBorders ;
			delete result.tblPr.tblCellSpacing  ;
			delete result.tblPr.shd;
			delete result.tblPr.align ;
			
		}
		result.id = this.id;
		result.tblGrid = [];
		for(var i=startCol;i<endCol;i++){
			result.tblGrid.push({"t":"gridCol","w":common.tools.PxToPt(this.cols[i])+"pt"});
		}
		result.trs = [];
		var row = this.rows.getFirst();
		var i = 0;
		while(row){
			if(i >= startRow)
				result.trs.push(row.toJson(startCol, endCol,i==startRow));
			i++;
			if(i > endRow)
				break;
			
			row = this.rows.next(row);
		}
		return result;
	},
	getStyleId: function()
	{
		this.tableProperty.styleId;
	},
	resizeView:function(){
		var allViews = this.getAllViews();
		for(var ownerId in allViews){
			var viewers = allViews[ownerId];
			var firstView = viewers.getFirst();
			firstView.updateSelf();
			var next = viewers.next(firstView);
			while(next){		
				var tmpNext = viewers.next(next);
				next.deleteSel();
				firstView.merge(next);
				next = tmpNext;
			}
		}
	},
	setStyleFormat:function(firstRow,lastRow,firstColumn,lastColumn,noHBand,noVBand){
		var tblProperty = this.getProperty();
		if(!tblProperty){
			return ;
		}
		var conditionStyle = tblProperty.conditionStyle;
		if(!conditionStyle){
			tblProperty.conditionStyle = {};
			conditionStyle = tblProperty.conditionStyle;
		}
		if(firstRow==1||firstRow==0){
			conditionStyle.firstRow = firstRow;
		}
		if(lastRow==1||lastRow==0){
			conditionStyle.lastRow = lastRow;
		}
		if(firstColumn == 1 || firstColumn ==0){
			conditionStyle.firstColumn = firstColumn;
		}
		if(lastColumn==1||lastColumn==0){
			conditionStyle.lastColumn = lastColumn;
		}
		if(noHBand ==1 || noHBand == 0){
			conditionStyle.noHBand = noHBand ;
		}
		if(noVBand==0 || noVBand==1){
			conditionStyle.noVBand = noVBand;
		}
	},
	updateConditonStyle:function(type){
		var acts = [];
		var tblProperty = this.getProperty();
		if(!tblProperty){
			return ;
		}
		var conditionStyle = tblProperty.getConditionStyle();
		var firstRowStyle = tblProperty.checkStyle("firstRow")?"firstRow":null;
		firstRowStyle =    (conditionStyle.firstRow==1&&firstRowStyle);
		
		var lastRowStyle = tblProperty.checkStyle("lastRow")?"lastRow":null;
		lastRowStyle =     (conditionStyle.lastRow==1&&lastRowStyle);
		
		var isFirstColumn = (conditionStyle.firstColumn==1&&tblProperty.checkStyle("firstColumn"));
		var isLastColumn  = (conditionStyle.lastColumn==1&&tblProperty.checkStyle("lastColumn"));
		
		var evenRowStyle = tblProperty.checkStyle("evenHBand")?"evenHBand":null;
		var oddRowStyle  = tblProperty.checkStyle("oddHBand")?"oddHBand":null;
		var isHBand =  (conditionStyle.noHBand==0&&(evenRowStyle||oddRowStyle));
		if(!isHBand){
			evenRowStyle = null;
			oddRowStyle  = null;
		}
		
		var evenColStyle = tblProperty.checkStyle("evenVBand")?"evenVBand":null;
		var oddColStyle  = tblProperty.checkStyle("oddVBand")?"oddVBand":null;
		var isVBand =(conditionStyle.noVBand==0&&(evenColStyle||oddColStyle));
		if(!isVBand){
			evenColStyle = null;
			oddColStyle  = null;
		}
		var nwCellStyle = tblProperty.checkStyle("firstRowFirstColumn")&&firstRowStyle&&isFirstColumn?"firstRowFirstColumn":null;
		var swCellStyle = tblProperty.checkStyle("lastRowFirstColumn")&&lastRowStyle&&isFirstColumn?"lastRowFirstColumn":null;
		var neCellStyle = tblProperty.checkStyle("firstRowLastColumn")&&firstRowStyle&&isLastColumn?"firstRowLastColumn":null;
		var seCellStyle = tblProperty.checkStyle("lastRowLastColumn")&&lastRowStyle&&isLastColumn?"lastRowLastColumn":null;
		
		
		var changeCell = type!="row"&&(isFirstColumn||isLastColumn||isVBand)||(nwCellStyle||swCellStyle||neCellStyle||seCellStyle);
		var firstRow = this.rows.getFirst();
		var lastRow =  null;
		var nextRow = firstRow;
		var i = 1;
//		if(firstRowStyle){
			if(changeCell){
				var nActs = firstRow.changeCSSStyle(firstRowStyle,isFirstColumn,isLastColumn,isVBand,true);
				acts = acts.concat(nActs);
				firstRow = this.rows.next(firstRow);
			}else{
					do{
						var nActs = firstRow.changeCSSStyle(firstRowStyle);
						acts = acts.concat(nActs);
						firstRow = this.rows.next(firstRow);
					   } while(firstRow && firstRow.isTblHeaderRepeat() ==  true)
			}
			if(firstRowStyle){
				nextRow = firstRow;
			}			
//		}
//		if(lastRowStyle){
			lastRow = this.rows.getLast();
			if(changeCell){
				var nActs = lastRow.changeCSSStyle(lastRowStyle,isFirstColumn,isLastColumn,isVBand,true);
				acts = acts.concat(nActs);
			}else{
				var nActs = lastRow.changeCSSStyle(lastRowStyle);
				acts = acts.concat(nActs);
			}
//		}
//		if(isHBand){
			while(nextRow&&(nextRow!=lastRow||!lastRowStyle)){
				if(i%2==0){
					if(changeCell){
						var nActs = nextRow.changeCSSStyle(evenRowStyle,isFirstColumn,isLastColumn,isVBand);
						acts = acts.concat(nActs);
					}else{
						var nActs = nextRow.changeCSSStyle(evenRowStyle);
						acts = acts.concat(nActs);
					}
				}else{
					if(changeCell){
						var nActs = nextRow.changeCSSStyle(oddRowStyle,isFirstColumn,isLastColumn,isVBand);
						acts = acts.concat(nActs);
					}else{
						var nActs = nextRow.changeCSSStyle(oddRowStyle);
						acts = acts.concat(nActs);
					}
				}
				nextRow = this.rows.next(nextRow);
				i++;
			}			
//		}
		
		// for the four cells at the four corners of the table;
		var tbMatrix = this.getTableMatrix();
		var rowCnt = tbMatrix.length();
		var colCnt = tbMatrix.length2();
		
		var _changeCornerCSSStyle = function(cell, cellStyle){
			if(!cell){
				return;
			}
			var cCnStOld = cell.getProperty().getConditionStyle();
			if(cell.changeCornerCSSStyle(cellStyle)){
				var cCnStNew = cell.getProperty().getConditionStyle();
				var cStO = {type:'cnSt', v:cCnStOld},
					cStN = {type:'cnSt', v:cCnStNew};
				acts.push(WRITER.MSG.createSetAttributeAct( cell, cStN, cStO, null, null ) );
			}
		};
		
		if(nwCellStyle){
			var nwCell = tbMatrix.getCell(0, 0);
			_changeCornerCSSStyle(nwCell, nwCellStyle);
		}
		if(swCellStyle){
			var swCell = tbMatrix.getCell(rowCnt-1, 0);
			_changeCornerCSSStyle(swCell, swCellStyle);
		}
		if(neCellStyle){
			var neCell = tbMatrix.getCell(0,colCnt-1);
			_changeCornerCSSStyle(neCell, neCellStyle);
		}
		if(seCellStyle){
			var seCell = tbMatrix.getCell(rowCnt-1, colCnt-1);
			_changeCornerCSSStyle(seCell, seCellStyle);
		}
		return acts;
	},
	isCrossPages:function(){
		var allViews = this.getAllViews();
		for(var ownerId in allViews){
			var viewers = allViews[ownerId];
			if(viewers.length()>1){
				return true;
			}
		}
		return false;
		
	},
	inTheSameBody:function(row1,row2){
		if(row1==row2){
			return true;
		}
		var body1 = null;
		var body2 = null;
		var allViewrs = row1.getAllViews();
		if(allViewrs){
			for(var ownerid in allViewrs){
				var rowView = allViewrs[ownerid].getFirst();
				body1 = writer.util.ViewTools.getBody(rowView);
				break;
			} 			
		}
		allViewrs = row2.getAllViews();
		if(allViewrs){
			for(var ownerid in allViewrs){
				var rowView = allViewrs[ownerid].getFirst();
				body2 = writer.util.ViewTools.getBody(rowView);
				break;
			} 			
		}
		return body1==body2;
	},
	insertRow:function(newRow,targetRow,fixCells){
		var toReset = false;
		var tableMatrix = this.getTableMatrix();
		var nextRow = this.rows.getFirst();
		if(targetRow){
			nextRow = this.rows.next(targetRow);
		}		
		var cells = targetRow&&tableMatrix.getRowMatrix(targetRow);
		var nextCells = nextRow&&tableMatrix.getRowMatrix(nextRow);
		var idx = 0;
		var newCell = newRow.cells.getFirst();
		while(newCell){
			if(newCell.isMergedCell()){
				cells[idx].markRowSpanChanged(1);
				toReset = true;
			}else if(fixCells&&fixCells[idx]){
				var toRemove = nextCells[idx];
				var rowSpan = toRemove.getRowSpan();
				nextRow.remove(toRemove);
				newCell.changeRowSpan(rowSpan);
				toReset = true;
			}
			idx = idx + newCell.getColSpan();
			newCell = newRow.cells.next(newCell);
		}
		newRow.clearMergedCell();
		this.insertBefore(newRow,nextRow);
		if(toReset && this.isCrossPages()){
			this.resetView();
		}
		this.changeTable();
		this.getTableMatrix();
		targetRow&&targetRow.checkRowBorder();
		nextRow&&nextRow.checkRowBorder();
	},
	deleteRow:function(row,fixCells){
		var toReset = false;
		var tableMatrix = this.getTableMatrix();
		var cells = tableMatrix.getRowMatrix(row);
		var nextRow = this.rows.next(row);
		var prevRow = this.rows.prev(row);
		for(var i =0; i<cells.length;i++ ){
			if(cells[i]==cells[i-1]){
				continue;
			}
			if(!row.cells.contains(cells[i])){
				cells[i].markRowSpanChanged(-1);
				toReset = true;
			}else if(fixCells&&fixCells[i]){
				var newCell = new writer.model.table.Cell(fixCells[i],nextRow,this);
				newCell.setRowSpan(cells[i].getRowSpan()-1);
				cells[i].setRowSpan(1);
				
				var targetCell = nextRow.cells.getFirst();
				while(targetCell){
					if(targetCell.getColIdx()>i){
						break;
					}
					targetCell = nextRow.cells.next(targetCell);
				}
				if(targetCell){					
					nextRow.insertBefore(newCell,targetCell);
				}else{
					targetCell = nextRow.cells.getLast();
					nextRow.insertAfter(newCell,targetCell);
				}
				toReset = true;
			}
		}
		this.remove(row);
		if(toReset && this.isCrossPages()){
			this.resetView();
		}
		this.changeTable();
		this.getTableMatrix();
		prevRow&&prevRow.checkRowBorder(prevRow);
		nextRow&&nextRow.checkRowBorder(nextRow);
	},
	insertColumn:function(index,cells,fixCells){
		var toReset = false;
		var tableMatrix = this.getTableMatrix();
		var currentRow = this.rows.getFirst();
		var prevInsertCell = null;
		while(currentRow){
			var rowIdx = currentRow.getRowIdx();
			var currentCells = tableMatrix.getRowMatrix(currentRow);
			var cellJson = cells[rowIdx];
			var targetCell = currentCells[index];
			if(cellJson.hMerged){
				var preCell=currentCells[index-1];
				if(currentRow.cells.contains(preCell)){
					if(preCell){
						preCell.markColSpanChanged(1);
					}else{
						console.error("the column data is incorrect");
					}
					toReset = true;
				}			
			}else if(cellJson.vMerged){
				if(prevInsertCell){
//					prevInsertCell.setMergedStart();
					prevInsertCell.markRowSpanChanged(1);
				}else{
					console.error("the data format is incorrect!");
				}
				toReset = true;
			}else if(cellJson.cnt){
				var newCell = new writer.model.table.Cell(cellJson.cnt,currentRow,this);
				prevInsertCell = newCell;
				var toMoveCell = null;
				if(fixCells&&fixCells[rowIdx]){
					var colSpan = targetCell.getColSpan();
					newCell.setColSpan(1+colSpan);
					toMoveCell = targetCell;
					toReset = true;
				}
				if(!currentRow.cells.contains(targetCell)){
					var i=1;
					while(targetCell && !currentRow.cells.contains(targetCell)){
						targetCell = currentCells[index+i];
						i++;
					}
				}
				currentRow.insertBefore(newCell,targetCell);
				toMoveCell&&currentRow.remove(toMoveCell);
			}			
			currentRow = this.rows.next(currentRow);
		}
		if(toReset && this.isCrossPages()){
			this.resetView();
		}
		this.changeTable();
		this.getTableMatrix();
		this.checkColumnBorder(index-1);
		this.checkColumnBorder(index+1);
		
	},
	deleteColumn:function(index,cells,fixCells){
		var toReset = false;
		var tableMatrix = this.getTableMatrix();
		var currentRow = this.rows.getFirst();
		while(currentRow){
			var rowIdx = currentRow.getRowIdx();
			var currentCells = tableMatrix.getRowMatrix(currentRow);
			var cellJson = cells[rowIdx];
			var targetCell = currentCells[index];
			if(cellJson.hMerged){
				var preCell=currentCells[index-1];
				if(currentRow.cells.contains(preCell)){
					if(preCell){
						preCell.markColSpanChanged(-1);
					}else{
						console.error("the column data is incorrect");
					}
					toReset = true;
				}
			}else if(cellJson.vMerged){
				
			}else if(cellJson.cnt){
				var toInsertCell = null;
				if(fixCells&&fixCells[rowIdx]){
					toInsertCell = new writer.model.table.Cell(fixCells[rowIdx],currentRow,this);
					toInsertCell.setRowSpan(targetCell.getRowSpan());
//					if(toInsertCell.getRowSpan()>1){
//						toInsertCell.setMergedStart();
//					}
					toReset = true;
				}
				toInsertCell&&currentRow.insertBefore(toInsertCell,targetCell);
				currentRow.remove(targetCell);
			}			
			currentRow = this.rows.next(currentRow);
		}
		if(toReset && this.isCrossPages()){
			this.resetView();
		}
		this.changeTable();
		this.getTableMatrix();
		this.checkColumnBorder(index-1);
		this.checkColumnBorder(index);
	},
	mergeCell:function(startColIdx,startRowIdx,newRowSpan,newColSpan){
		var tableMatrix =  this.getTableMatrix();
		var targetCell = tableMatrix.getCell(startRowIdx,startColIdx);
		var oldRowSpan = targetCell.getRowSpan(),oldColSpan = targetCell.getColSpan();
		targetCell.setRowSpan(newRowSpan);
		targetCell.setColSpan(newColSpan);
		var endColIdx = startColIdx + newColSpan;
		var endRowIdx = startRowIdx + newRowSpan;
		var currentRow = targetCell.parent;
		var toDeleteRow = [];
		for(var i = startRowIdx ;i< endRowIdx;i++){
			if(!currentRow){
				console.error("something error,please check!");
				break;
			}			
			var currentCells = tableMatrix.getRowMatrix(currentRow);
			for(var j=startColIdx;j<endColIdx;j++){
				if( currentCells[j]== currentCells[j-1]){
					continue;
				}
				if(currentRow.cells.contains(currentCells[j])&&targetCell!=currentCells[j]){
					currentRow.remove(currentCells[j]);
				}				
			}
			var next = this.rows.next(currentRow);
			if(currentRow.cells.isEmpty()){
				toDeleteRow.push(currentRow);
			}
			currentRow = next;
		}
		var toReset = false;	
		if(this.isCrossPages()){
			currentRow = targetCell.parent;
			var firstRow = currentRow;
			for(var i=0;i<newRowSpan;i++){
				if(currentRow.isCrossPage()){
					toReset=true;
					break;
				}else if(!this.inTheSameBody(firstRow, currentRow)){
					toReset=true;
					break;
				}
				currentRow = this.rows.next(currentRow);
			}
		}
		if(toReset){
			this.resetView();
		}else{
			targetCell.resetView();
		}
		this.changeTable();
		this.getTableMatrix();
		return toDeleteRow;
	},
	splitCell:function(startColIdx,startRowIdx,newRowSpan,newColSpan,changedCells){
		var tableMatrix =  this.getTableMatrix();
		var targetCell = tableMatrix.getCell(startRowIdx,startColIdx);
		var oldRowSpan = targetCell.getRowSpan(),oldColSpan = targetCell.getColSpan();
		targetCell.setRowSpan(newRowSpan);
		targetCell.setColSpan(newColSpan);
		var currentRow = targetCell.parent;
		var subTable = this._createSubTable(changedCells);
		var subTableMatrix = subTable.getTableMatrix().getArrayMatrix();
		var firstSubRow = subTable.rows.getFirst();
		var firstSubCell = subTableMatrix[0][0];
		var tmpCell = targetCell;
		firstSubRow.cells.forEach(function(cell){
			if(cell==firstSubCell){
				return ;
			}
			currentRow.insertAfter(cell,tmpCell);
			cell.table = currentRow.parent;
			tmpCell = cell;
		});
		
		for(var j=1;j< subTable.rows.length();j++){
			currentRow = this.rows.next(currentRow);
			firstSubRow = subTable.rows.next(firstSubRow);
			var k=1;
			var insertBeforePosCell = tableMatrix.getCell(startRowIdx+j, startColIdx+subTableMatrix[0].length);
			while(insertBeforePosCell  && !currentRow.cells.contains(insertBeforePosCell)){
				insertBeforePosCell = tableMatrix.getCell(startRowIdx+j, startColIdx+subTableMatrix[0].length+k);
				k++;
			}
			firstSubRow.cells.forEach(function(cell){
				currentRow.insertBefore(cell,insertBeforePosCell);
				cell.table = currentRow.parent;
			});
		}
		var toReset = false;		
		if(this.isCrossPages()){
			currentRow = targetCell.parent;
			var firstRow = currentRow;
			for(var i=0;i<oldRowSpan;i++){
				if(currentRow.isCrossPage()){
					toReset=true;
					break;
				}else if(!this.inTheSameBody(firstRow, currentRow)){
					toReset=true;
					break;
				}
				currentRow = this.rows.next(currentRow);
			}
		}
		if(toReset){
			this.resetView();
		}else{
			targetCell.resetView();
		}
		this.changeTable();
		tableMatrix = this.getTableMatrix();
		// mark checkborder
		var checkRowSpan = Math.max(oldRowSpan,newRowSpan);
		var checkColSpan = Math.max(oldColSpan,newColSpan);
		for(var i= 0; i < checkColSpan; i++){
			if(startRowIdx > 0){
				var topCell = tableMatrix.getCell(startRowIdx - 1,startColIdx + i);
				if(topCell)
					topCell.markCheckBorder();
			}
			if(startRowIdx < tableMatrix.length() - checkRowSpan){
				var bottomCell = tableMatrix.getCell(startRowIdx + checkRowSpan,startColIdx + i);
				if(bottomCell)
					bottomCell.markCheckBorder();
			}
		}
		for(var j=0;j < checkRowSpan; j++){
			if(startColIdx > 0){
				var leftCell = tableMatrix.getCell(startRowIdx + j,startColIdx - 1);
				if(leftCell)
					leftCell.markCheckBorder();
			}
			if(startColIdx < tableMatrix.length2() - checkColSpan){
				var rightCell = tableMatrix.getCell(startRowIdx + j,startColIdx + checkColSpan);
				if(rightCell)
					rightCell.markCheckBorder();
			}
		}
	},
	createEmptyRow:function(targetRow){
		var json = {};
		json.id= WRITER.MSG_HELPER.getUUID();
		var trPr = null;
		if(targetRow.rowProperty){
			trPr = targetRow.rowProperty.toJson();
		}
		json.trPr = trPr;
		json.tcs =[];
		return json;
	},
	_createSubTable:function(subCells){
		var result = {};
		result.t = "tbl";
		result.tblPr = this.tableProperty&&this.tableProperty.toJson()||{};
		if(this.tableStyleId){
			result.tblPr.styleId = this.tableStyleId;
		}
		result.id = this.id;
		result.tblGrid = [];
		result.trs = [];
		for(var i=0;i< subCells.length;i++){
			var rowjson = {};
			rowjson.tcs = subCells[i];
			result.trs.push(rowjson);
		}
		return new writer.model.table.Table(result,this.parent);
	},
	getItemByIndex:function(index){
		return this.rows.getByIndex(index);
	},
	checkColumnBorder:function(colIdx){
		var tableMatrix = this.getTableMatrix();
		if(colIdx>=0&&colIdx<tableMatrix.length2()){
			var cells =  tableMatrix.getColumn(colIdx);
			for(var i=0;i< cells.length;i++){
				cells[i].markCheckBorder();
			}
			
		}
	}
};
common.tools.extend(writer.model.table.Table.prototype, new writer.model.table.TableBase());
