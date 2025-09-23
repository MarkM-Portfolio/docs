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

dojo.provide("websheet.CalcManager");
dojo.require("websheet.TaskManager");

dojo.declare("websheet.CalcManager",null,{
	_fCellsMap: null,					//all the formulas in the whole document
	_fCells: null,						//store all the formulas by sheet in array, it can be increased when parse
	_unCalcCells: null,					//store all the formulas by sheet in map
	_unCalcCellsArr: null,				//store all the formulas by sheet in array, it can not be increased when calc
	_afFormulas:null,					//autofill formulas for predicting if the adjacent cells contains the formula with the same pattern
	
	_unCalcCFs: null,
	_cfTasks: null,
	_updateRows4CF: null,
	
	_hasCalc: null,						//used in partialCalc, check if all the cells in _unCalcCellsArr has been calculate once
	_bToggleCalc: null,					//used in partialCalc to toggle the calculation order for each time
	_pidxs: null,						// the start index in the _fCells for partialParse task
	_cidxs: null,						// the start index in the _unCalcCellsArr for partialCalc task
	_inTask: null,						//check if sheet calculation task is in task manager
	_doc: null,
	_tm: null,							//taskManager
	_hasHighPriority: false,
	_parseCount: {},
	_calcCount: {},
	_timeThres: 600,
	_timeDeltaThres: 200,
	_parseInc: 100,
	_calcInc: 400,
	_completeCells: null,				//the cell list that has been calculated for this round of partial parse and partial calc
	_updateRows: null,					// the rows need to be updated for the formula cells
	/*void*/constructor: function(args) {
		this._tm = websheet.TaskManager;
		this.isDeepParsing = websheet.Constant.isDeepParsing;
		this._fCellsMap = {};
		this._fCells = {};
		this._unCalcCells = {};
		this._unCalcCellsArr = {};
		this._afFormulas = {};
		this._hasCalc = {};
		this._bToggleCalc = {};
		this._pidxs = {};
		this._cidxs = {};
		this._inTask = {};
		this._hasHighPriority = false;
		this._completeCells = {};
		this._updateRows = {};
		
		this._unCalcCFs = {};
		this._cfTasks = {};
		this._updateRows4CF = {};
		
		dojo.mixin(this, args); 			  // controller, a.k.a dataConcentrator
	},
	
	_getDocumentObj:function() {
		// tricky here, calc manager construction is called in the constructor of Document
		if (!this._doc) this._doc = websheet.model.ModelHelper.getDocumentObj();
		return this._doc;
	},
	
	getAutofillFormulas:function(sheetId){
		return this._afFormulas[sheetId];
	},
	
	//when load or create
	addUnCalcCF: function(cfRange)
	{
		var sheetId = cfRange._doc.getSheetId(cfRange._parsedRef.sheetName);
		var sheetMap = this._unCalcCFs[sheetId];
		if(!sheetMap){
			this._unCalcCFs[sheetId] = {};
			sheetMap = this._unCalcCFs[sheetId];
		}
		sheetMap[cfRange._id] = cfRange;
	},
	
	//when delete cf range
	//when claculated?
	removeCF: function(cfRange)
	{
		var sheetId = cfRange._doc.getSheetId(cfRange._parsedRef.sheetName);
		var sheetMap = this._unCalcCFs[sheetId];
		if(sheetMap)
			delete sheetMap[cfRange._id];
	},
	
	/**
	 * Add formula cell to partial Calc Manager, which is used to parse&calc formula cells 
	 */
	/*void*/_addFormulaCell:function(cell){
		var sheetId = cell._getSheet()._id;
		var rowId = cell._parent._id;
		var colId = cell._id;
		var sheetMap = this._fCellsMap[sheetId];
		if(!sheetMap){
			this._fCellsMap[sheetId] = {};
			sheetMap = this._fCellsMap[sheetId];
		}
		var rowMap = sheetMap[rowId];
		if(!rowMap){
			sheetMap[rowId] = {};
			rowMap = sheetMap[rowId];
		}
		rowMap[colId] = cell;
		
		this._addF(cell, sheetId);
		
	},
	/**
	 * Add formula cell to partial Calc Manager, which is used to parse&calc formula cells 
	 */
	_removeFormulaCell:function(cell){
		var sheetId = cell._getSheet()._id;
		var rowId = cell._parent._id;
		var colId = cell._id;
		var sheetMap = this._fCellsMap[sheetId];
		if(sheetMap){
			var rowMap = sheetMap[rowId];
			if(rowMap){
				delete rowMap[colId];
			}
		}
		var unCalcCells = this._unCalcCells[sheetId];
		this._delUncalcCells(unCalcCells, cell);
	},
	
	_delUncalcCells: function(unCalcCells, cell){
		if (unCalcCells) {
			delete unCalcCells[cell._uniqueId];
			this._getDocumentObj().getAreaManager().removeFromFormulaTrack(cell);
		}
	},
	
	/**
	 * update formula cell to partial Calc Manager,
	 * if the original value is non formula, and now is formula, then add to partial calc Manager
	 * else if the original value is formula, now is non formula, remove it
	 */
	/*void*/updateFormulaCell:function(cell, bFormula){
		if(bFormula)
			this._addFormulaCell(cell);
		else{
			this._removeFormulaCell(cell);
		}
	},
	
	_addF:function(cell, sId){
		if(cell){
			if(!sId)
				sId = cell._getSheet()._id;
			var unCalcCells = this._unCalcCells[sId];
			if(!unCalcCells){
				unCalcCells = {};
				this._unCalcCells[sId] = unCalcCells;
			}
			var fCells = this._fCells[sId];
			if(!fCells){
				fCells = [];
				this._fCells[sId] = fCells;
			}
			
			var unCalcCellsArr = this._unCalcCellsArr[sId];
			if(!unCalcCellsArr){
				unCalcCellsArr = [];
				this._unCalcCellsArr[sId] = unCalcCellsArr;
			}
			
			if(!unCalcCells[cell._uniqueId]){
				unCalcCells[cell._uniqueId] = cell;
				fCells.push(cell);
			}
			this._inTask[sId] = true;
		}
	},
	//Resume the paused task
	//And add the task for the other sheet which might been set range by coediting user
	startTasks:function(){
		var docObj = this._getDocumentObj();
		// only caller is PCM._postRender, which will call startTasks() in a managed task, with priority VisibleFormulaCalculation, or LoadDocument
		if(docObj.isLoading || docObj.getPartialLoading()){
			return;
		}

		this._isPaused = false;
		this._tm.resume(this._tm.Priority.HighFormulaCalculation, this._tm.Priority.CFCalculation);
		//get the task between these two priority
		var taskIDArr = {};
		var cfTaskIDArr = {};
		var tasks = this._tm.getTasksByPriority(this._tm.Priority.HighFormulaCalculation, this._tm.Priority.CFCalculation);
		if(tasks){
			var size = tasks.length;
			for(var i=0; i<size; i++){
				var task = tasks[i];
				var id = task.args[0];
				if (!docObj.isSheetExist(id, true)) //if sheet is deleted, remove task
					task.remove();
				else{
					if(task.priority == this._tm.Priority.CFCalculation){
						if(!cfTaskIDArr[id])
							cfTaskIDArr[id] = {};
						cfTaskIDArr[id][task.args[1]._id] = true;
					}else{
						taskIDArr[id] = task;
						task.setPriority(this._tm.Priority.FormulaCalculation);
					}
				}
			}
		}
		//start the new task which is not in the task manager
		var sheets = docObj.getSheets();
		if (sheets) {
			var size = sheets.length;
			for(var i=0; i<size; i++){
				var id = sheets[i].getId();
				if(!taskIDArr[id]){
					var task = this._startTask(id);
					if(task)
						taskIDArr[id] = task;
				}
				this._startCFTask(id, cfTaskIDArr[id]);
//				if(!cfTaskIDArr[id]){
//					var tasks = 
//					if(tasks)						
//						cfTaskIDArr[id] = tasks;
//				}
			}
		}
		//set high calculate priority for the current sheet
		//only when it is not the first sheet load
		if(this._hasHighPriority && this.controller){
			var grid = websheet.model.ModelHelper.getEditor().getCurrentGrid();
			if(grid){
				var sheetName = grid.getSheetName();
				var id = docObj.getSheetId(sheetName);
				if(id){
					var task = taskIDArr[id];
					if(task){
						task.setPriority(this._tm.Priority.HighFormulaCalculation);
					}
				}
			}
		}
		//1. taskIDArr is empty, means nothing need to calc, so should call cacheManager.notify(this._completeCells, true) 
		//pls notice that this._completeCells need clear after cahce has been updated
		if(this._isTasksEmpty(taskIDArr))
		{
			// console.log("no calc task!!");
			this.checkCalcComplete();
		}	
			
		this._tm.start();
	},
	
	_isTasksEmpty: function(taskIDArr)
	{
		var count = 0;
		for(var id in taskIDArr)
			count++;
		return count == 0 ? true : false;
	},
	
	pauseTasks:function(){
		this._isPaused = true;
		this._tm.pause(this._tm.Priority.HighFormulaCalculation, this._tm.Priority.CFCalculation);
	},
	
	_startCFTask: function(sId, tasksInSheet){
		var unCalcCFs = this._unCalcCFs[sId];
		if(!unCalcCFs || Object.keys(unCalcCFs).length === 0)
			return;
		var partialMgr = websheet.model.ModelHelper.getEditor().getPartialManager();
		if (!partialMgr.isComplete(sId))//Do not calculate conditional format until sheet is loaded complete.
			return;

		for(var id in unCalcCFs){
			var range = unCalcCFs[id];
			if(!range.dirty){
				delete unCalcCFs[id];//Add it's range to updaterows?
				continue;
			}
			if(tasksInSheet && tasksInSheet[id])
				continue;
			
			this._tm.addTask(this, "_calcCF", [sId, range], this._tm.Priority.CFCalculation);
			if(!this._cfTasks[sId])
				this._cfTasks[sId] = {};
			this._cfTasks[sId][range._id] = true;
		}
	},
	
	_calcCF: function(sId, range){
		var priority = this._tm._current.priority;
		if(this._isPaused){
			var task = this._tm.addTaskWithDeltaLevel(this, "_calcCF", [sId, range], priority, 0);
			task.isPaused = true;
			return;
		}
		var cf = range.data;
		cf.calculate(range, dojo.hitch(this, "_postCFCalc", range));
	},
	
	_postCFCalc: function(range){
		delete range.dirty;
		
		var rangeInfo = range._getRangeInfo();
		var sheetName = rangeInfo.sheetName;
		var sheetId = this._getDocumentObj().getSheetId(sheetName);
		if(this._unCalcCFs[sheetId])
			delete this._unCalcCFs[sheetId][range._id];
		
		this._collectRows4Range(rangeInfo);
		delete this._cfTasks[sheetId][range._id];
		
		if(Object.keys(this._cfTasks[sheetId]).length == 0){
			this.controller.notifyCalcComplete(this._updateRows);
		}
	},
	
	_collectRows4Range: function(rangeInfo){
		var startRow = rangeInfo.startRow;
		var endRow = rangeInfo.endRow;
		var sheet = this._getDocumentObj().getSheet(rangeInfo.sheetName);
		var sheetId = sheet.getId();
		
		var sheetMap = this._updateRows[sheetId];
		if(!sheetMap){
			this._updateRows[sheetId] = {};
			sheetMap = this._updateRows[sheetId];
		}
		
		for(var i = startRow; i <= endRow; i++)
			sheetMap[i] = true;
	},
	
	_startTask: function(sId){
		var unCalcCells = this._unCalcCells[sId];
		if(!unCalcCells){
			return;
		}
		//reset fCells according to unCalcCells
		this._fCells[sId] = [];
		this._unCalcCellsArr[sId] = [];
		for(var id in unCalcCells){
			var cell = unCalcCells[id];
			if(cell && cell.isFormula() && (!cell.isParsed || cell._isUnCalc || cell._isDirty) && !cell._bPR){
				this._fCells[sId].push(cell);
			}else{
				this._delUncalcCells(unCalcCells, cell);
				this._addCompleteCells(cell);
			}
		}
		this._hasCalc[sId] = false;
		this._bToggleCalc[sId] = true;
		this._pidxs[sId] = 0;
		this._cidxs[sId] = 0;
		this._parseCount[sId] = websheet.Constant.PartialParseCellCnt;
		this._calcCount[sId] = websheet.Constant.PartialCalcCellCnt;
		
		if(this._fCells[sId].length > 0){
			this._inTask[sId] = true;
			return this._tm.addTask(this, "_partialParse", [sId], this._tm.Priority.FormulaCalculation);
		}else
			this._inTask[sId] = false;
		return null;
	},
	
	_partialParse: function(sId){
		var startTime = new Date();
		var priority = this._tm._current.priority;
		if(this._isPaused){
			var task = this._tm.addTaskWithDeltaLevel(this, "_partialParse", [sId], priority, 0);
			task.isPaused = true;
			return;
		}
		var unCalcCells = this._unCalcCells[sId];
		var fCells = this._fCells[sId];
		var unCalcCellsArr = this._unCalcCellsArr[sId];
		var startIndex = this._pidxs[sId];
		var endIndex = fCells.length;
		var parseCount = this._parseCount[sId];
		try{
			if(!startIndex)
				startIndex = 0;
			if(startIndex == 0)
				this._afFormulas[sId] = {};
			//_fCells can be enlarged when calculate cell which refer other unparsed formula cell
			//refer to Reference.getCells
//			var endIndex = startIndex + websheet.Constant.PartialParseCellCnt;//TODO
//			if(endIndex < startIndex)
//				endIndex = fCells.length;
			//console.log("***parse ==> from " + sId + ":" + startIndex + " with total length " + fCells.length);
			var count = 0;
			for(var i=startIndex; i<fCells.length; i++){
				if(count >= parseCount){
					endIndex = i;
					this._pidxs[sId] = i;
					break;
				}
				var cell = fCells[i];
				if(cell){
					if(cell.isFormula() && (!cell.isParsed || cell._isUnCalc || cell._isDirty)){
						count++;
						cell._calculate(cell.isParsed);
					}
					if(cell._isUnCalc || !cell.isParsed)
						unCalcCellsArr.push(cell);
					else{
						//incase cell has already been calculated
						//for example the cell with #REF! which has no tokens
						//so return #REF! directly
						this._delUncalcCells(unCalcCells, cell);
						this._addCompleteCells(cell);
					}
				}
			}
			
			if(endIndex < fCells.length ){
				var diff = new Date() - startTime;
				this._parseCount[sId] = this._adjustCount(diff, parseCount, this._parseInc);
				this._tm.addTaskWithDeltaLevel(this, "_partialParse", [sId], priority, 0);
			}else{
				this._pidxs[sId] = 0;
				this._fCells[sId] = [];
				//if there is any uncalc cells, then start partialCalc task
				for(var id in unCalcCells){
					this._tm.addTaskWithDeltaLevel(this, "_partialCalc", [sId], priority, 0);
					return;
				}
				//else there is no task for sId
				this._inTask[sId] = false;
				this.checkCalcComplete();
			}
		}catch(e){
			console.log("client side  parse all formula error");
			this._fCells[sId] = [];
			this._pidxs[sId] = 0;
		}	
	
	},
	
	_partialCalc: function(sId){
		var startTime = new Date();
		var priority = this._tm._current.priority;
		if(this._isPaused){
			var task = this._tm.addTaskWithDeltaLevel(this, "_partialCalc", [sId], priority, 0);
			task.isPaused = true;
			return;
		}
		var unCalcCells = this._unCalcCells[sId];
		var unCalcCellsArr = this._unCalcCellsArr[sId];
		var startIndex = this._cidxs[sId];
		try{
			//after loop the uncalc cells, if this._hasCalc=true, means that some cell has been calculate
			//if this._hasCalc=false, it means that the cells in _unCalcCells has dependency, they might be recursive cells
			//should check by cell._checkCR
			
			//bContinue means that one loop for calc formula cells has been split to several time slot
			var bContinue = false;
			var endIndex = -1;
			//console.log("****calc ==>from " + sId + ":" + startIndex + " with total length " + unCalcCellsArr.length + " and order is " + this._bToggleCalc[sId]);
			if(unCalcCellsArr){
				if(!startIndex || startIndex < 0)
					startIndex = 0;
				var cellCount = this._calcCount[sId];
				var length = unCalcCellsArr.length;
				var count = 0;//the number of the cells which has been calculate this time
				//in this time, _unCalcCells must be the whole set of unCalc/isDrity formula cells
				//Almost end cells need calc first, so that the previous cell can get the value from the later cells
				//_bToggleCalc is used to decide tranverse this._unCalcCellsArr from start to end or from end to start
				if(this._bToggleCalc[sId]){
					//calc from end to start
					//because sometimes end cell should be calc first which might be referred by start ones
					for(var i=length-1-startIndex; i>=0;i--){
						if(count >= cellCount){
							endIndex = length - 1 - i;
							bContinue = true;//means will setTimeout for _partialCalc anyway
							break;
						}
						var cell = unCalcCellsArr[i];
						if(cell){
							if(cell.isFormula() && (!cell.isParsed || cell._isUnCalc || cell._isDirty)){
								count++;
								cell._calculate(cell.isParsed);
								if(!cell._isUnCalc){
									unCalcCellsArr[i] = null;
									//because the cells in _unCalcCellsArray calculation has been split to several time slot
									//so at least one cell has been calculated done in one time slot
									//hasCalc should set to true in order to start another timeout for  _partialCalc
									this._hasCalc[sId] = true;
									this._delUncalcCells(unCalcCells, cell);
									this._addCompleteCells(cell);
								}
							}else{
								unCalcCellsArr[i] = null;
								this._delUncalcCells(unCalcCells, cell);
								this._addCompleteCells(cell);
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
						var cell = unCalcCellsArr[i];
						if(cell){
							if(cell.isFormula() && (!cell.isParsed || cell._isUnCalc || cell._isDirty)){
								count++;
								cell._calculate(cell.isParsed);
								if(!cell._isUnCalc){
									unCalcCellsArr[i] = null;
									this._hasCalc[sId] = true;
									this._delUncalcCells(unCalcCells, cell);
									this._addCompleteCells(cell);
								}
							}else{
								unCalcCellsArr[i] = null;
								this._delUncalcCells(unCalcCells, cell);
								this._addCompleteCells(cell);
							}
						}
					}
				}
			}
			//console.log("***calc==> with " + count + " formula calculted");
			this._cidxs[sId] = endIndex;
			
			var fCells = this._fCells[sId];
			var size = fCells.length;
			//when calculate formula cell, there might be some unparsed cell added to this._fCells
			//such as A1 = B2+SUM(C3), Math operator + will not be executed due to that C3 is the unparsed cell and throw 2001
			//but B2 has never add to _fCells until + is executed
			if(size > 0){
				if(endIndex == -1){
					this._bToggleCalc[sId] = !this._bToggleCalc[sId];
					this._hasCalc[sId] = false;
				}
				this._tm.addTaskWithDeltaLevel(this, "_partialParse", [sId], priority, 0);
				return;
			}
			
			//might getPartial when _partialCalc
			//which will make several cells unCalc due to the unload cells
			if(this._isPaused){
				var task = this._tm.addTaskWithDeltaLevel(this, "_partialCalc", [sId], priority, 0);
				task.isPaused = true;
				return;
			}
			//record the circular cell which might not be calculate for one time
			var cellsCR = {};
			//check if all the unCalc cells have been calc
			for(var id in unCalcCells) {
				if(bContinue || this._hasCalc[sId] ) {
					//endIndex == -1 means that all the formula in _unCalcCellsArr has been calculate for one time
					if(endIndex == -1){
						this._bToggleCalc[sId] = !this._bToggleCalc[sId];
						this._hasCalc[sId] = false;
					}//else should still use the same order to calc formula in _unCalcCellsArr
					this._cidxs[sId] = endIndex;
					this._tm.addTaskWithDeltaLevel(this, "_partialCalc", [sId], priority, 0);
					return;
				}else{
					this._tm.addTask(this, "_partialCheckCR", [sId], priority);
					this._cidxs[sId] = 0;
					return;
				}
			}
			this._inTask[sId] = false;
			this.checkCalcComplete();
			//console.log("***calc ==> done for " + sId);
		}catch(e){
			console.error("client side calc all formula error, ", e);
		}
	},
	
	_partialCheckCR:function(sId){
		//console.log("***calc ==> check CR ");
		var priority = this._tm._current.priority;
		if(this._isPaused){
			var task = this._tm.addTask(this, "_partialCheckCR", [sId], priority);
			task.isPaused = true;
			return;
		}
		var unCalcCells = this._unCalcCells[sId];
		var unCalcCellsArr = this._unCalcCellsArr[sId];
		var startIndex = this._cidxs[sId];
		//console.log("_partialCheckCR from " + startIndex);
		var bContinue = false;
		//record the circular cell which might not be calculate for one time
		var cellsCR = {};
		//should also split the checkCR process if there are too many cells need to checkCR, otherwise stop script
		var count = 0;
		
		var length = unCalcCellsArr.length;
		var cellCount = 50;//websheet.Constant.PartialParseCellCnt;
		
		for(var i=startIndex; i<length;i++){
			if(count >= cellCount){
				this._cidxs[sId] = i;
				bContinue = true;//means will setTimeout for _partialCalc anyway
				break;
			}
			var cell = unCalcCellsArr[i];
			if(cell){
				if(cell.isFormula() && (!cell.isParsed || cell._isUnCalc || cell._isDirty) && unCalcCells[cell._uniqueId]){
					cell.setCheckCR(true);
					cell._checkCR();//for deep parsing
					count++;
					if(!cell._isUnCalc){
						unCalcCellsArr[i] = null;
						this._delUncalcCells(unCalcCells, cell);
						this._addCompleteCells(cell);
					}else
						cellsCR[cell._uniqueId] = cell;
				}else{
					unCalcCellsArr[i] = null;
					this._delUncalcCells(unCalcCells, cell);
					this._addCompleteCells(cell);
				}
			}
		}
		
		if(!bContinue)
			cellsCR = unCalcCells;
		for(var id in cellsCR){
			var cell = cellsCR[id];
			if(cell.isParsed &&  !cell._isUnCalc && !cell._isDirty){
				this._delUncalcCells(unCalcCells,cell);
			} else {
				cell._calculate(true);
				if (!cell._isUnCalc) {
					this._delUncalcCells(unCalcCells, cell);
					this._addCompleteCells(cell);
				}
			}
		}
		//Exception
		// we thought calc is done, check if any cells left
		for (var id in unCalcCells) {
			// cells left, see if we are progressing in checking CR
			if (bContinue) {
				this._tm.addTask(this, "_partialCheckCR", [sId], priority);
				break;
			} else {
				// too bad, after calc and checking for CR, we are not making any progress, something is wrong, we are in dead loop
				var cell = unCalcCells[id];
				cell.setError(websheet.Constant.ERRORCODE["522"]);
				delete cell._isUnCalc;
				this._delUncalcCells(unCalcCells, cell);
			}
//			console.log("After calc and checking for CR, cells remaining but not progressing, force to stop, ", unCalcCells);
		}
		this._inTask[sId] = false;
		this.checkCalcComplete();
	},
	
	_addCompleteCells: function(cell)
	{
		if(!cell) return;
//		this._completeCells[cell._uniqueId] = cell;
		var sId = cell._getSheet()._id;
		var rows = this._updateRows[sId];
		if(!rows)
		{
			rows = this._updateRows[sId] = {};
		}	
		var rIndex = cell._parent.getIndex()-1;
		rows[rIndex] = true;
//		rows[cell._parent._id] = true;
	},
	
	resetCompleteCells: function(sheetId)
	{
		if(sheetId)
		{
			delete this._completeCells[sheetId];
			delete this._updateRows[sheetId];
		}	
		else
		{
			this._completeCells = {};
			this._updateRows = {};
		}	
	},
	
	/**
	 * for the collectted complete cells, find these between srIndex and erIndex
	 * return the corresponding rows Index ,and remove from the _updateRows
	 * @returns {Array}
	 */
	removeCompleteCells: function(sheetId,srIndex,erIndex)
	{
		var rows = [];
		
		if(!srIndex)
			srIndex = 0;
		var doc = this._getDocumentObj();
		if(!erIndex)
			erIndex = doc.maxSheetRows;
		
		var updateRows = this._updateRows[sheetId];
		if(updateRows)
		{
			for(var rIndex in updateRows)
			{
				rIndex = parseInt(rIndex);
				if(rIndex >= srIndex && rIndex <= erIndex)
					rows.push(rIndex);
			}	

			var length = rows.length;
			for(var i = 0; i < length; i++)
			{
				delete updateRows[rows[i]];
			}	
		}
		
//		var cfUpdateRows = this._updateRows4CF[sheetId];
//		var cfRows = [];
//		if(cfUpdateRows){
//			for(var rIndex in cfUpdateRows)
//			{
//				if(!updateRows || !updateRows[rIndex]){
//					rIndex = parseInt(rIndex);
//					if(rIndex >= srIndex && rIndex <= erIndex){
//						rows.push(rIndex);
//						cfRows.push(r)
//					}
//				}
//			}
//		}
		return rows;
	},
	//TODO: use controller to notify
	checkCalcComplete: function()
	{
//		var bComplete = true;
//		for(var id in this._inTask)
//		{
//			if(this._inTask[id])
//			{
//				bComplete = false;
//				break;
//			}
//		}
		// console.log("in checkCalcComplete :" + bComplete);
		this.controller.notifyCalcComplete(this._updateRows);
	},
	
	_adjustCount: function(diff, count, inc) {
		var d = diff - this._timeThres;
		if (d > this._timeDeltaThres) {
			// spent time longer then expected, decrease count
			return Math.round(this._timeThres / diff * count);
		} else if (d < -this._timeDeltaThres) {
			// spent time shorter than expected, increase count
			return count + inc;
		} else {
			// spent time within expectation
			return count;
		}
	}
});