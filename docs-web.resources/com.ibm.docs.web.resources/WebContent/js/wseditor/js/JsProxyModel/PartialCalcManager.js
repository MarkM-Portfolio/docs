dojo.provide('websheet.JsProxyModel.PartialCalcManager');

dojo.declare('websheet.JsProxyModel.PartialCalcManager', null,{
	_fCells:null,					//all the formula cells array that need to be calc
	_unCalcCells: null,				//map
	_cellsPool: null,				//all the formula cells which will prevent different javascript cells corresponding to one java cell when reference.getCells
	_doc: null,						//JSProxyModel.Document
	_startTime: null,				// start time
	_callBack: null,				//call back function when calculation done
	_calculator: null,				// PartialCalcManager and Calculator are 1:1 relationship
	bBatchGetCells : null,			// Batch get cells for autofill formulas
	_timerPair:	null,				// the start timer and calc formula number pair for record the calc time, if the interval is larger than 2s, should serialize document
	_bFirst: null,					// the first time to serialize document
	_bDeep: null,					// calculate formula cells in deep traverse or width traverse
	constructor: function(calculator){
		this._calculator = calculator;
		this._doc = calculator._doc;
		this._fCells = [];
		this._unCalcCellsList = [];
		this._unCalcCells = {};
		this._cellsPool = {};
		this._taskMgr = websheet.TaskManager;
		this.bBatchGetCells = false;
		this._timerPair = [null, 0];
		this.ONE_ROUND_NUM = 500;
		this._bFirst = true;
		//enable deep tranverse
		this._bDeep = true;
	},
	
	//cell_list is a java array list which need to be calculated
	start:function(cell_list, callback){
		this._callBack = callback;
		this._startTime = new Date();
		//iterate through all cells in the java document model
		var size = cell_list.length;
		for(var k=0;k<size;k++){
			var jCell = cell_list[k];
			var cell = new websheet.JsProxyModel.Cell(this._doc);
			cell.setJavaModel(jCell);
			this._addF(cell);
		}
		this._formulaSize = this._fCells.length;
		var dt = (new Date() - this._startTime) ;
		var service = this._calculator._service;
		service.formulaSize = this._formulaSize;
		service.j2jsCellTime = dt;
		console.log("collect " + this._formulaSize + " formulas cost : " + dt + " ms for doc " + this._doc.docId);
		if(this._fCells.length == 0){
			this._task = null;
			if(this._callBack)
				this._callBack(this._task, {bTerminate:true, bNoFormula: true});//set task for calculator
		}else
			this.calc();
	},
	
	_addF:function(cell){
		if(cell){
			var cellId = cell._uniqueId;
			if(!this._unCalcCells[cellId]){
				this._unCalcCells[cellId] = cell;
				this._fCells.push(cell);
				if(!this._cellsPool[cellId])
					this._cellsPool[cellId] = cell;
			}
		}
	},
	
	getCell:function(cellId){
		return this._cellsPool[cellId];
	},
	
	//create the js cell when jCell is not null and there is no such cell in cellsPool
	getCellByJavaModel:function(jCell, bCreate){
		if(jCell){
			var cellInfos = jCell.info;
			if(cellInfos != null){
				var cInfo = cellInfos[0];
				var sheetName = cInfo[0];
				var colIndex = cInfo[1];
				var rowIndex = cInfo[2];
				var cellId = sheetName + "." + websheet.Helper.getColChar(colIndex) + rowIndex;
				var cell = this._cellsPool[cellId];
				if(cell == null && bCreate){
					cell = new websheet.JsProxyModel.Cell(this._doc);
					cell.setJavaModel(jCell, {sheetName: sheetName, rowIndex:rowIndex, colIndex:colIndex}, cellId, cellInfos);
					this._cellsPool[cellId] = cell;
				}
			}
			return cell;
		}
		return null;
	},
	
	calc:function(startIndex){
		//change the calculation context
		websheet.functions.Object.setCalculator(this._calculator);
		
		if(this._task && this._task._delete){
			console.log("calculation task has been removed for doc " + this._doc.docId);
			this._task = null;
			if(this._callBack)
				this._callBack(this._task);//set task for calculator
			return;
			
		}
		//calcIndex is used to record how many cells have been calcualted in one round in deep tranverse 
		if(this._bDeep)
			this.calcIndex = 0;
		
		if(!this._timerPair[0])
			this._timerPair[0] = new Date();
		this._hasCellCalc = false;
		if(!startIndex)
			startIndex = 0;
		var endIndex = startIndex + this.ONE_ROUND_NUM;
		var clearRefsCells = [];
		for(var i=startIndex; i<this._fCells.length; i++){
			if(this._bDeep){
				if(this.calcIndex > this.ONE_ROUND_NUM){
					endIndex = i+1;
					break;
				}
			}else{
				if(i > endIndex){
					break;
				}
			}
			var cell = this._fCells[i];
			if(cell._isUnCalc || !cell.isParsed){
				cell._calculate(cell.isParsed);
				if(cell._isUnCalc || !cell.isParsed)
					this._unCalcCellsList.push(cell);
				else {
					delete this._unCalcCells[cell._uniqueId];
					this._hasCellCalc = true;
					clearRefsCells[cell._uniqueId] = cell;
				}
			}else{
				delete this._unCalcCells[cell._uniqueId];
				clearRefsCells[cell._uniqueId] = cell;
			}
		}
		this.batchGetCells();
		var size = this._fCells.length;
		if(endIndex < size){
			this.continueCalc(endIndex);
		}else{
			var bFinish = true;
			for(var id in clearRefsCells){
				var clearCell = clearRefsCells[id];
				if(clearCell)
					clearCell.clearRefs();
			}
			this._fCells = this._unCalcCellsList.reverse();//reverse the unCalcCells so that next time the calculate order will be reversed
			this._unCalcCellsList = [];
			size = this._fCells.length;
			if(this._hasCellCalc && size > 0){
				this._hasCellCalc = false;
				if(size > 0){
					console.log("CalcManager: Still left " + size + " formulas for doc " + this._doc.docId);
					this.continueCalc(0);
					bFinish = false;
				}
			}
			if(bFinish){
				console.log("calc done with " + size + "formulas not been calculated for doc " + this._doc.docId);
				
				if(size > 0)
					this.checkRecursiveCells();
				
				this._fCells = null;
				this._unCalcCells = null;
				this._cellsPool = null;
				
				var end = new Date();
				var dt = (end - this._startTime);
				this._calculator._service.calcTime = dt;
				console.log("finish calc cost : " + dt + " ms with " + this._formulaSize + " formulas for doc " + this._doc.docId);
				this._task = null;
				if(this._callBack)
					this._callBack(this._task);//set task for calculator
			}
		}
	},
	
	// if interval is less than calcInterval(2s by default), go on calc
	// else addTask for calc
	continueCalc: function(calcIndex){
		var st = this._timerPair[0];
		var et = new Date();
		var interval = et - st;
		this._timerPair[1] += this.ONE_ROUND_NUM;
		if(interval > this._calculator._calcInterval){
			this._task = this._taskMgr.addTask(this, "calc", [calcIndex]);
			this._taskMgr.start();
			console.log("CalcManager: this round calc " + this._timerPair[1] + " formulas and cost " + interval + " ms for doc " + this._doc.docId);
			this._timerPair = [null, 0];//reset
			if(this._callBack){
				this._callBack(this._task,{bSerialize: this._bFirst});//set task for calculator
				this._bFirst = false;
			}
		}else{
			this.calc(calcIndex);
		}
	},
	
	//if there are still cells in this._fCells, it must contains recursive cells
	checkRecursiveCells: function(){
		size = this._fCells.length;
		var recursiveErr = websheet.Constant.ERRORCODE["522"];
		var recursiveMsg = recursiveErr.message;
		for(var i = 0; i < size; i++){
			var cell = this._fCells[i];
			delete cell._isUnCalc;
			cell.setComputeValue(recursiveMsg);
			cell._javaCell.setDirtySync(false);
			cell.setError(recursiveErr);
			cell.clearRefs();
		}
	},
	
	batchGetCells: function(){
		if(this.bBatchGetCells){
			var af = this._doc._afFormulas;
			var areas = af?af.areas:null;
			var refAreas = [];
			if(areas){
				for(var id in areas){
					var area = areas[id];
					this._mergeRefAreas(area, refAreas);
					delete area.cell;
					delete area.endCell;
					areas[id] = null;
					delete areas[id];
				}
			}
			var length =  refAreas.length;
			for(var m = 0; m < length; m++){
				var area = refAreas[m];
				if(!area)
					continue;
				var javaRows = this._doc._javaDoc.getCellsByRowSync(area.sheetId, area.startRow, area.startCol,
						area.endRow, area.endCol, true);
				var rowSize = javaRows.length;
				for(var i = 0; i < rowSize; i++){
					var javaRow = javaRows[i];
					if(!javaRow){
						continue;
					}
					var size = javaRow.length;
					for(var j = 0; j < size; j++){
						var javaCell = javaRow[j];
						var cell = null;
						if(javaCell){
							cell = this.getCellByJavaModel(javaCell, true);
							if(!cell.isParsed || cell._isUnCalc){
								this._addF(cell);
							}
						}
					}
				}
			}
		}
	},
	
	_mergeRefAreas: function(autofillArea, refAreas){
		if(!autofillArea || !autofillArea.endCell)
			return;
		// TODO: dynamic pushRefs and get the cells for that reference, 
		// such as A1:B1:C3, it will create A1:C3 reference then getCells
		var isReference = websheet.functions.Object.isReference;
		var NAMEUSAGE = websheet.Constant.RangeUsage.NAME;
		var cell = autofillArea.cell;
		var endCell = autofillArea.endCell;
		var ta = cell._tokenArray;
		var endta = endCell._tokenArray;
		var length = ta.length;
//		console.log(cell.getValue() + " : Batch get cells for area : " + cell._sheetName + 
//		"." + websheet.Helper.getColChar(autofillArea.startCol) + autofillArea.startRow
//		+ ":" + websheet.Helper.getColChar(autofillArea.endCol) + autofillArea.endRow );
		for(var m = 0; m < length; m++){
			var token = ta[m];
			var endToken =endta[m];
			var range = token.getValue();
			var endRange = endToken.getValue();
			if(range != endRange && isReference(range) && isReference(endRange) && range.usage != NAMEUSAGE){
				var ri = range._rangeInfo;
				var eri = endRange._rangeInfo;
//				console.log("*********Batch get cells for ref : " + ri.sheetName + 
//				"." + websheet.Helper.getColChar(ri.startCol) + ri.startRow
//				+ ":" + websheet.Helper.getColChar(eri.endCol) + eri.endRow );
				this._addRefArea(refAreas, {sheetId: range._sheetId, sheetName: ri.sheetName, startRow: ri.startRow, startCol: ri.startCol, endRow: eri.endRow, endCol: eri.endCol});
			}
		}
	},
	
	//batch calc cells in the autofillArea, these cells have the same formula pattern
	_addRefArea: function( areas, area){
		var length = areas.length;
		var helper = websheet.Helper;
		var EQUAL = websheet.Constant.RangeRelation.EQUAL;
		var SUBSET = websheet.Constant.RangeRelation.SUBSET;
		var SUPERSET = websheet.Constant.RangeRelation.SUPERSET;
		var bInsert = true;
		for(var i = 0; i < length; i++){
			var a = areas[i];
			if(a){
				var rel = helper.compareRange(a, area);
				if(rel == EQUAL || rel == SUPERSET){
					bInsert = false;
					break;
				}
				if(rel == SUBSET)
					areas[i] = null;
			}
		}
		if(bInsert)
			areas.push(area);
	},
	
	decompose:function(){
		this._fCells = null;
		this._unCalcCells = null;
		for(var id in this._cellsPool){
			var cell = this._cellsPool[id];
			if(cell){
				cell.decompose();
				cell = null;
			}
		}
		this._cellsPool = null;
		this._calculator = null;
	}
	
});
