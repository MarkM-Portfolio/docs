/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.model.PartialCalcManager");
dojo.declare("websheet.model.PartialCalcManager",null,{
	_doc:null,									//document
	_taskMgr:null,								//task manager
	isDeepParsing:false,
	_cm: null,									//calcManager
	_unCalcCells:null,
	_fCells:null,								//record the formula cells in visible area
	_visibleCFRange: null,
	_calcingCFs: null,
	_postFuncs:null,							//when parse/calc done, _postFuncs should be hitched one by one, 
												//it is an array because that one delete undo operation might has several set cell event, which need sendnotify4setrange 
	_interruptFunc:null,						//when parse/calc has been interrupted, this function should be triggered manually
	_updateRows:null,							//the rows contain the formula which should be calculated
	_updateRows4CF:null,						//the rows contain the conditional format which should be calculated
	_rangeList:null,							//cache the range which need getCells. getRows...
	// priority for all managed PCM tasks, if PCM tasks are started in a managed task, the priority would be the same as parent task, in fact,
	// any priority would do in such cases,
	// if PCM tasks are started in ROOT (called from appendRows() or selectChild(), the task will be appended in root,
	// the priority would be VisibleFormulaCalculation(fairly low)
	_taskPriority: null, 		
	_task:null, //the generated task in partial calculate manager
	_afFormulas:null,							//autofill formulas for predicting if the adjacent cells contains the formula with the same pattern 
	/*void*/constructor: function(args) {
		var mhelper = websheet.model.ModelHelper;
		this._cm = mhelper.getCalcManager();
		this._doc = mhelper.getDocumentObj();
		this._taskMgr = this._doc._taskMgr;
		this.isDeepParsing = websheet.Constant.isDeepParsing;
		this._updateRows = {};
		this._updateRows4CF = {};
		this._postFuncs = [];
		this._rangeList = {};
		this.reset();
		dojo.mixin(this, args); 			  // controller, a.k.a dataConcentrator
		this._startIndex = 0;
		this._afFormulas = {};
	},
	
	_addF:function(cell){
		if(cell){
			if(!this._unCalcCells[cell._uniqueId]){
				this._unCalcCells[cell._uniqueId] = cell;
				this._fCells.push(cell);
			}
		}
	},
	getAutofillFormulas:function(){
		return this._afFormulas;
	},
	
	reset:function(bNotClearFCells){
		if(!bNotClearFCells){
			this._fCells = [];
			this._unCalcCellsArr = [];
			this._unCalcCells = {};
			this._hasCalc = false;
			this._visibleCFRange = null;
			this._calcingCFs = [];
			// remove the will be execute task
			// because there might already collect cells in _fCells 
			// but the task startIndex is not begin from 0, 
			// so there will be no chance to collect the referenced cells in the 0~startIndex cells
			if(this._task)
				this._task.remove();
			this._task = null;
		}
		this._bToggleCalc = true;
		this._interruptFunc = null;
		// this._clearTimer();
		//should set true when get partial sheet,so that the partial calculation can be terminate
		//and resume when renderPartial to trigger partialManager.notify
		this._bTerminate = true;
		this._resetReferences();
	},
	
	_resetReferences:function(){
		for(var id in this._rangeList){
			var range = this._rangeList[id];
			if(range){
				range._firstCheckCells = true;
				range._firstCheckRows = true;
//				delete range._firstCheckIndexCols;
//				delete range._firstCheckIndexRows;
			}
		}
		this._rangeList = {};
	},
	
//	_clearTimer:function(){
//		if(this.parseTimeout){
//			clearTimeout(this.parseTimeout);
//			this.parseTimeout = null;
//		}
//		if(this.calcTimeout){
//			clearTimeout(this.calcTimeout);
//			this.calcTimeout = null;
//		}
//	},
	
	addCalcVisibleTask: function(){
		 this._taskMgr.addTask(this, "calcVisibleFormula", [], this._taskPriority, false, 0, function (newTask, taskInQueue) {
				if (newTask.task == taskInQueue.task) {
					return -1; // remove the old task in queue, keep the new task;
				}
			});
		 this._taskMgr.start();
	},	
	
	calcVisibleFormula:function(){
		// callers could be appendRows() and selectChild(), which is not a managed task,
		// or Base.postLoad(), which is a managed task
		this.reset();
		if(this.controller){
			var rangeInfo = this.controller.getVisibleRange();
			if(rangeInfo) {
//				if (this._taskMgr._current) {
//					// called from a managed task
//					this._taskPriority = this._taskMgr._current.priority;
//				} else {
					this._taskPriority = this._taskMgr.Priority.VisibleFormulaCalculation;
//				}
				this._visibleCFRange = rangeInfo;
				this.start(rangeInfo);//use default postFunc which is this._postRender
//				if(!this._bTerminate)
//					this._startCF(rangeInfo, bNotParse);
			}
		}
	},
	
	//todo: 	var startFreezeRow = rangeInfo.startFreezeRow;
	//var endFreezeRow = rangeInfo.endFreezeRow;
	_startCF: function(rangeInfo){
		var partialMgr = websheet.model.ModelHelper.getEditor().getPartialManager();
		var sheet = this._doc.getSheet(rangeInfo.sheetName);
		var sheetId = sheet ? sheet.getId() : null;
		if (!partialMgr.isComplete(sheetId))//Do not calculate conditional format until sheet is loaded complete.
			return;
		var areaMgr = this._doc.getAreaManager();
		var ranges = areaMgr.getRangesByUsage(websheet.Constant.RangeUsage.CONDITION_FORMAT, rangeInfo.sheetName);
		var startCol = rangeInfo.startCol;
		var startRow = rangeInfo.startRow;
		var endCol = rangeInfo.endCol;
		var endRow = rangeInfo.endRow;
		var startFreezeRow = rangeInfo.startFreezeRow;
		var endFreezeRow = rangeInfo.endFreezeRow;
		this._calcingCFs = [];
		for(var i = 0; i < ranges.length; i++){
			var range = ranges[i];
			if(!range.dirty || !range.isValid())
				continue;
			var info = range._getRangeInfo();
			//the whole row
			if(startCol < 1 && endCol < 1){
				// freeze rows
				if (startFreezeRow && info.startRow <= endFreezeRow && info.endRow >= startFreezeRow) {
					var interRange = websheet.Helper.rangeIntersection({sheetName:rangeInfo.sheetName ,startRow: startFreezeRow, endRow: endFreezeRow, startCol: info.startCol, endCol: info.endCol}, info);
					if (range.isPartialDirty(interRange))
						this._calcingCFs.push([interRange, range]);
				}
				if(info.endRow < startRow || info.startRow > endRow)
					continue;
				var interRange = websheet.Helper.rangeIntersection({sheetName:rangeInfo.sheetName ,startRow: startRow, endRow: endRow, startCol: info.startCol, endCol: info.endCol}, info);
				if(range.isPartialDirty(interRange))
					this._calcingCFs.push([interRange, range]);
			}else{
				var relation = websheet.Helper.compareRange(rangeInfo, info);
				if(relation == websheet.Constant.RangeRelation.EQUAL || relation == websheet.Constant.RangeRelation.SUBSET){
					if(range.isPartialDirty(rangeInfo))
						this._calcingCFs.push([rangeInfo, range]);
					break;
				}
				var interRange = (relation == websheet.Constant.RangeRelation.SUPERSET) ? info : null;
				if(relation == websheet.Constant.RangeRelation.INTERSECTION)
					interRange = websheet.Helper.rangeIntersection(rangeInfo, info);
				if(interRange && range.isPartialDirty(interRange))
					this._calcingCFs.push([interRange, range]);
			}
		}
		//if(this._calcingCFs.length)
		this._postCFCalc();
	},
	
	_postCFCalc: function()
	{
		var len = this._calcingCFs.length;
		if (len){
			this._cfCounter = 0;
			for (var i = 0; i < len; i++) {
				var calcCF = this._calcingCFs.pop();
				var range = calcCF[1];
				var cf = range.data;
				this._collectRows4Range(calcCF[0]);
				cf.cal4Range(range, calcCF[0], dojo.hitch(this, function(){
					this._cfCounter++;
					if (this._cfCounter == len) {
						this._calcingCFs = null;
						if(this.controller){
							this.controller.postRender(this._updateRows4CF);
						}
						this._taskMgr.addRootTask(this._cm, "startTasks", [], this._taskPriority);
						this._taskMgr.start();
					}
				}));
			}
		}
	},
	
	//the rows which contain the calculated formula, after _postRender, the rows will be cleared
	_collectRows:function(cell){
		if(cell instanceof websheet.model.RulesObject.DummyFormulaCell)
			return;
		var sheetId = cell._getSheet()._id;
		var rowId = cell._parent._id;
		var sheetMap = this._updateRows[sheetId];
		if(!sheetMap){
			this._updateRows[sheetId] = {};
			sheetMap = this._updateRows[sheetId];
		}
		sheetMap[rowId] = true;
	},
	
	//the rows which contain the calculated conditional format, after _postRender, the rows will be cleared.
	_collectRows4Range:function(rangeInfo){
		var sheetName = rangeInfo.sheetName;
		var startRow = rangeInfo.startRow;
		var endRow = rangeInfo.endRow;
		var sheet = this._doc.getSheet(sheetName);
		var sheetId = sheet.getId();
		
		var sheetMap = this._updateRows4CF[sheetId];
		if(!sheetMap){
			this._updateRows4CF[sheetId] = {};
			sheetMap = this._updateRows4CF[sheetId];
		}
		var rowIds = sheet.getRowIdArray(startRow-1, endRow-1);
		for(var i = 0; i < rowIds.length; i++)
			sheetMap[rowIds[i]] = true;
	},
	
	_postRender:function(){
		if(this.controller){
			this.controller.postRender(this._updateRows);
		}

		//if there is cf to calculate, calculate cf.
		if(this._visibleCFRange && !this._bTerminate){
			this._startCF(this._visibleCFRange);
			this._visibleCFRange = null;
		}		
		else if(!this._calcingCFs){
			this._taskMgr.addRootTask(this._cm, "startTasks", [], this._taskPriority);
			// setTimeout(dojo.hitch(this._cm, "startTasks"),200);
			// this._cm.startTasks();
			this._taskMgr.start();
		}
	},
	
	startWithDummyCells: function(cells, postFunc){
		for(var id in cells){
			var cell = cells[id];
			this._addF(cell);
		}
		if (postFunc) {
			// CF and DV don't change cell values so don't recalculate visible formulas 
			postFunc.reCalc = false;
			this._postFuncs.push(postFunc);
		}
		this._bTerminate = false;
		this._parse();
	},
	
	/**
	 * Called by the instance of PartialCalcManager, which is used for calc the referred formula cells 
	 * such as chart, sort etc
	 * The calc should not start until partial loading document is done.
	 * Because some cells might refer to the unloaded part of the document
	 * @param rangeInfo
	 * @param postFunc
	 */
	startWithCondition:function(rangeInfo, postFunc){
		//make sure this call is from the taskManager
		var tm = this._taskMgr;
		var currentTask = tm._current;
		if(currentTask){
			var scope = currentTask.scope;
			if(scope == this){
				if(this._doc.isLoading || this._doc.getPartialLoading()){
					//clone currentTask with isPause = true
					var task = tm.addTask(currentTask.scope, currentTask.task, currentTask.args, currentTask.priority, true, //isPaused = true
						 currentTask.interval, currentTask.deltaLevel);
					task.pause("loading");
					return;
				}
			}	
		}
		this.start(rangeInfo, postFunc);
	},
	
	/**
	 * start partial parse/calc the formula cell in the range
	 * @param rangeInfo, 1-based
	 */
	/*void*/start:function(rangeInfo, postFunc, interruptFunc, params){
		this._cm.pauseTasks();
		if(this._doc.isLoading){
			this._bTerminate = true;
			if(postFunc){
				this._postFuncs.push(postFunc);
			}
			this._interruptFunc = interruptFunc;
			return;
		}else
			this._bTerminate = false;
		
		//need parse immediately after collect the formula cells
		var bNotParse = false;
		//if there is task will be running, will not parse formula cell immediately
		if(this._task != null && (this._task._prev != null || this._task._next != null || this._taskMgr._head == this._task))
			bNotParse = true;
		var sheetName = rangeInfo.sheetName;
		var startCol = rangeInfo.startCol;
		var startRow = rangeInfo.startRow;
		var endCol = rangeInfo.endCol;
		var endRow = rangeInfo.endRow;
		var startFreezeRow = rangeInfo.startFreezeRow;
		var endFreezeRow = rangeInfo.endFreezeRow;
		var sheet = this._doc.getSheet(sheetName);
		var sheetId = sheet.getId();
		var rowMap = this._cm._fCellsMap[sheetId];
		//if not empty means that there are still formula has not calculated yet
		//put the will be parse/calc formula cell in _fCells
		//and referenced by _fCells will be push in _fCells when calculation(by Reference.getCells,getRows.getCols)
		if(rowMap){
			var rowIds = sheet.getRowIdArray(startRow-1, endRow-1);
			if(startFreezeRow >=0 && endFreezeRow >= startFreezeRow){
				var _rowIds = sheet.getRowIdArray(startFreezeRow - 1, endFreezeRow - 1);
				rowIds = rowIds.concat(_rowIds);
			}
			var length = rowIds.length;
			//the whole row
			if(startCol < 1 && endCol < 1){
				for(var i=0; i<length; i++){
					var rowId = rowIds[i];
					var cellMap = rowMap[rowId];
					if(cellMap){
						for(colId in cellMap){
							var cell = cellMap[colId];
							if(!cell.isParsed || cell._isUnCalc || cell._isDirty){
								if(!this._unCalcCells[cell._uniqueId]){
									this._fCells.push(cell);
									this._unCalcCells[cell._uniqueId] = cell;
								}
							}
						}
					}
				}
			}else{//the range with limited columns
				var colIds = sheet.getColIdArray(startCol-1, endCol-1);
				for(var i=0; i<length; i++){
					var rowId = rowIds[i];
					var cellMap = rowMap[rowId];
					if(cellMap){
						var colLength = colIds.length;
						for(var j=0;j<colLength;j++){
							var colId = colIds[j];
							var cell = cellMap[colId];
							if(cell){
								if(!cell.isParsed || cell._isUnCalc || cell._isDirty){//only put the uncalculated cell
									if(!this._unCalcCells[cell._uniqueId]){
										this._fCells.push(cell);
										this._unCalcCells[cell._uniqueId] = cell;
									}
								}
							}
						}
					}
				}
			}
		}
		if(postFunc){
			this._postFuncs.push(postFunc);
		}
		this._interruptFunc = interruptFunc;
		if(!bNotParse)
			this._parse();
	},
	
	
	_parse:function(){
		if(this._fCells.length > 0){
			this._partialParse();
		}else{
			this._partialParseDone = true;
			this._postParse();
		}
	},
	
	_delUncalcCells: function(cell){
		delete this._unCalcCells[cell._uniqueId];
		this._doc.getAreaManager().removeFromFormulaTrack(cell);
	},
	
	/**
	 * partial parse the cells in current sheet,
	 * and set time out for the unparsed cells
	 */
	_partialParse:function(startIndex){
//		console.log("partial parse ==> from " + startIndex + " with total length " + this._fCells.length);
		try{
			if(!startIndex)
				startIndex = 0;
			if(startIndex == 0)
				this._afFormulas = {};
			
			this._partialParseDone = false;
			//_fCells can be enlarged when calculate cell which refer other unparsed formula cell
			//refer to Reference.getCells
			var endIndex = startIndex + websheet.Constant.PartialParseCellCnt;
			if(endIndex < startIndex)
				endIndex = this._fCells.length;
			
			for(var i=startIndex; i<this._fCells.length; i++){
				if(i < endIndex ){
					var cell = this._fCells[i];
					this._collectRows(cell);
					cell._calculate(cell.isParsed);
					if(cell._isUnCalc || !cell.isParsed)
						this._unCalcCellsArr.push(cell);
					else 
						//incase cell has already been calculated
						//for example the cell with #REF! which has no tokens
						//so return #REF! directly
						this._delUncalcCells(cell);
				}else
					break;
			}
			if(endIndex < this._fCells.length ){
				this._task = this._taskMgr.addTask(this, "_partialParse", [endIndex], this._taskPriority);
				this._taskMgr.start();
			}else{
				this._partialParseDone = true;
				this._fCells = [];
				this._postParse();
			}
		}catch(e){
			console.log("client side partial parse visible cell error");
			this._fCells = [];
		}	
	},
	_postParse:function(){
		if(this._partialParseDone){
			if (!this.isDeepParsing) {
				this._partialCalc();
				return;
			}
			this._startPostFunc();
			this._postRender();
		}
	},
	/**
	 * partial calculate the cells in doc._unCalcCells
	 * until it has nothing
	 */
	_partialCalc:function(startIndex){
		
		try{
			if(this._bTerminate)
				return;
//			console.log("partial calc ==>from " + startIndex + " with total length " + this._unCalcCellsArr.length + " and order is " + this._bToggleCalc);
			//after loop the uncalc cells, if this._hasCalc=true, means that some cell has been calculate
			//if this._hasCalc=false, it means that the cells in _unCalcCells has dependency, they might be recursive cells
			//should check by cell._checkCR
			
			//bContinue means that one loop for calc formula cells has been split to several time slot
			var bContinue = false;
			var endIndex = -1;
			if(this._unCalcCellsArr){
				if(!startIndex || startIndex < 0)
					startIndex = 0;
				var cellCount = websheet.Constant.PartialCalcCellCnt;
				var length = this._unCalcCellsArr.length;
				var count = 0;//the number of the cells which has been calculate this time
				//in this time, _unCalcCells must be the whole set of unCalc/isDrity formula cells
				//Almost end cells need calc first, so that the previous cell can get the value from the later cells
				//_bToggleCalc is used to decide tranverse this._unCalcCellsArr from start to end or from end to start
				if(this._bToggleCalc){
					//calc from end to start
					//because sometimes end cell should be calc first which might be referred by start ones
					for(var i=length-1-startIndex; i>=0;i--){
						if(count >= cellCount){
							endIndex = length - 1 - i;
							bContinue = true;//means will setTimeout for _partialCalc anyway
							break;
						}
						var cell = this._unCalcCellsArr[i];
						if(cell){
							if(cell.isFormula() && (!cell.isParsed || cell._isUnCalc || cell._isDirty)){
								count++;
								cell._calculate(cell.isParsed);
								if(!cell._isUnCalc){
									
									this._unCalcCellsArr[i] = null;
									//because the cells in _unCalcCellsArray calculation has been split to several time slot
									//so at least one cell has been calculated done in one time slot
									//hasCalc should set to true in order to start another timeout for  _partialCalc
									this._hasCalc = true;
									this._delUncalcCells(cell);
								}else
									//might getPartial when _partialCalc
									//which will make several cells unCalc due to the unload cells 
									if(this._bTerminate)
										return;
							}else{
								this._unCalcCellsArr[i] = null;
								this._delUncalcCells(cell);
							}
						}
					}
				}else{
					//next time will calc from start to end
					for(var i=startIndex; i<length;i++){
						if(count >= cellCount){
							endIndex = i;
							bContinue = true;//means will setTimeout for _partialCalc anyway
							break;
						}
						var cell = this._unCalcCellsArr[i];
						if(cell){
							if(cell.isFormula() && (!cell.isParsed || cell._isUnCalc || cell._isDirty)){
								count++;
								cell._calculate(cell.isParsed);
								if(!cell._isUnCalc){
									this._unCalcCellsArr[i] = null;
									this._hasCalc = true;
									this._delUncalcCells(cell);
								}else
									//might getPartial when _partialCalc
									//which will make several cells unCalc due to the unload cells 
									if(this._bTerminate)
										return;
							}else{
								this._unCalcCellsArr[i] = null;
								this._delUncalcCells(cell);
							}
						}
					}
				}
			}
//			console.log("partial calc==> with " + count + " formula calculted");
			var size = this._fCells.length;
			//when calculate formula cell, there might be some unparsed cell added to this._fCells
			//such as A1 = B2+SUM(C3), Math operator + will not be executed due to that C3 is the unparsed cell and throw 2001
			//but B2 has never add to _fCells until + is executed
			if(size > 0){
				this._isPartialCalcDone = false;
				if(endIndex == -1){
					this._bToggleCalc = !this._bToggleCalc;
					this._hasCalc = false;
				}
				// this._clearTimer();
				this._task = this._taskMgr.addTask(this, "_parse", [0], this._taskPriority);
				this._taskMgr.start();
//				this._parse();
				return;
			}
			//might getPartial when _partialCalc
			//which will make several cells unCalc due to the unload cells
			if(this._bTerminate)
				return;
			//check if all the unCalc cells have been calc
			var cells = this._unCalcCells;
			this._isPartialCalcDone = true;
			var bHasCRChecked = false;
			//record the circular cell which might not be calculate for one time
			var cellsCR = {};
			for(var id in cells) {
				if(bContinue || this._hasCalc ) {
					this._isPartialCalcDone = false;
					//endIndex == -1 means that all the formula in _unCalcCellsArr has been calculate for one time
					if(endIndex == -1){
						this._bToggleCalc = !this._bToggleCalc;
						this._hasCalc = false;
					}//else should still use the same order to calc formula in _unCalcCellsArr
					this._task = this._taskMgr.addTask(this, "_partialCalc", [endIndex], this._taskPriority);
					this._taskMgr.start();
					return;
				}else{
//					this._isPartialCalcDone = false;
//					this._taskMgr.addTask(this, "_partialCheckCR", [0], this._taskPriority);
//					this._taskMgr.start();
//					return;
					var cell = cells[id];
					cell.setCheckCR(true);
					cell._checkCR();//for deep parsing
					if (cell._isUnCalc) {
						// still not sure of the cell calc state, leave it alone
						cellsCR[id] = cell;
					} else {
						// cell ref to a CR cell, progressing
						bHasCRChecked = true;
						this._delUncalcCells(cell);
					}
				} 
			}
			
			for(var id in cellsCR){
//				console.log("partial calc ==> check CR for " + id);
				var cell = cellsCR[id];
				cell._calculate(true);
				if (!cell._isUnCalc) {
					this._delUncalcCells(cell);
				}
			}
			
			//Exception
			if (this._isPartialCalcDone) {
				// we thought calc is done, check if any cells left
				for (var id in cells) {
					// cells left, see if we are progressing in checking CR
					if (bHasCRChecked) {
						// progressing, continue to next partialCalc loop
						this._isPartialCalcDone = false;
						this._task = this._taskMgr.addTask(this, "_partialCalc", [endIndex], this._taskPriority);
						this._taskMgr.start();
						// var func = dojo.hitch(this, "_partialCalc");
						// this.calcTimeout = setTimeout(func, 0);
						break;
					} else {
						// too bad, after calc and checking for CR, we are not making any progress, something is wrong, we are in dead loop
//						console.warn("After calc and checking for CR, cells remaining but not progressing, force to stop, ", cells);
						var cell = cells[id];
						cell.setError(websheet.Constant.ERRORCODE["522"]);
						delete cell._isUnCalc;
						this._delUncalcCells(cell);
					}
				}
//				console.log("partial calc ==>done");
			}
		}catch(e){
			console.log("client side partial calc error");
			this._isPartialCalcDone = true;
		}finally{
			if(this._isPartialCalcDone)
				this._postCalc();
		}	
	},
	
	//no need for now
	_partialCheckCR:function(startIndex){
		
		var bHasCRChecked = false;
		var bContinue = false;
		//record the circular cell which might not be calculate for one time
		var cellsCR = {};
		//should also split the checkCR process if there are too many cells need to checkCR, otherwise stop script
		var count = 0;
		
		var length = this._unCalcCellsArr.length;
		var cellCount = websheet.Constant.PartialCalcCellCnt;
		
		for(var i=startIndex; i<length;i++){
			if(count >= cellCount){
				endIndex = i;
				bContinue = true;//means will setTimeout for _partialCalc anyway
				break;
			}
			var cell = this._unCalcCellsArr[i];
			if(cell){
				if(cell.isFormula() && (!cell.isParsed || cell._isUnCalc || cell._isDirty)){
					cell.setCheckCR(true);
					cell._checkCR();//for deep parsing
					count++;
					if(!cell._isUnCalc){
						this._unCalcCellsArr[i] = null;
						this._delUncalcCells(cell);
					}else
						cellsCR[cell._uniqueId] = cell;
				}else{
					this._unCalcCellsArr[i] = null;
					this._delUncalcCells(cell);
				}
			}
		}
		
		for(var id in cellsCR){
			var cell = cellsCR[id];
			cell._calculate(true);
			if (!cell._isUnCalc) {
				this._delUncalcCells(cell);
			}
		}
		//Exception
		// we thought calc is done, check if any cells left
		for (var id in this._unCalcCells) {
			// cells left, see if we are progressing in checking CR
			if (bHasCRChecked || bContinue) {
				// progressing, continue to next partialCalc loop
				this._isPartialCalcDone = false;
				this._task = this._taskMgr.addTask(this, "_partialCheckCR", [endIndex], this._taskPriority);
				this._taskMgr.start();
				break;
			} else {
				// too bad, after calc and checking for CR, we are not making any progress, something is wrong, we are in dead loop
//					console.log("After calc and checking for CR, cells remaining but not progressing, force to stop, ", cells);
				var cell = this._unCalcCells[id];
				cell.setError(websheet.Constant.ERRORCODE["522"]);
				delete cell._isUnCalc;
				this._delUncalcCells(cell);
			}
		}
		this._isPartialCalcDone = true;
		this._postCalc();
	},
	
	_postCalc:function(){
		// check all the sheet parsing status in client side
		if(this._bTerminate){
			return;
		}
		if(this._isPartialCalcDone)
		{
			this._startPostFunc();
			this._postRender();
			this.reset();
		}
	},
	//TODO: should setTimeout to do each postFunc?
	_startPostFunc:function(){
		if(this._postFuncs){
			var length = this._postFuncs.length;
			var reCalc = false;
			for(var i=this._startIndex; i<length; i++){
				var func = this._postFuncs[i];
				this._startIndex = i + 1;
				func();
				if (func.reCalc != false)
					reCalc = true;
			}
			//the post function might set dirty for the current visible cells
			//but the dirty cells might refer to the other uncalc cells in the other sheet
			//so when use postRender to render these dirty cells, 
			//in fact,they will be uncalc because they refer to uncalc cells
			//so should set timeout for calc visible formula again which does not contain any post functions
			if(reCalc) {
				this._taskMgr.addTask(this, "calcVisibleFormula", [], this._taskPriority);
				// setTimeout(dojo.hitch(this, "calcVisibleFormula"),200);
			}
			
			this._postFuncs = [];
			this._startIndex = 0;
		}
	}
});