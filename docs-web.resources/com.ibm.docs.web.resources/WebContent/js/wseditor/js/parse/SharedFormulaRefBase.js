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

/***
 *  Describe the shared formulas position
 */
dojo.provide("websheet.parse.SharedFormulaRefBase");
dojo.require("websheet.parse.Reference");
dojo.declare("websheet.parse.SharedFormulaRefBase",[websheet.parse.Reference, websheet.listener.Listener],{
	_refTokens: null,
	_tokenTree: null,
	_dirty: false,
	_isUpdateFormula: false,
	_deltaChanges: null,
	_sharedRefTokens: null,
	prevTrack : null,
	nextTrack : null,
	
	constructor: function(/*parsedRef*/range, id){
		this.usage = websheet.Constant.RangeUsage.SHARED_FORMULAS;
		if(id && id.indexOf("sr") == 0){
			var n = Number(id.slice(2));
			if(!isNaN(n) &&  (this.constructor.prototype._idCount == undefined || this.constructor.prototype._idCount <= n))
				this.constructor.prototype._idCount = ++n;
		}
	},
	
	_generateId:function() {
		if (this.constructor.prototype._idCount == undefined)//static variable used to generate unique id for unique area
			this.constructor.prototype._idCount = 1;
		this._id = "sr" + this.constructor.prototype._idCount++; // it won't conflict with name range id
	},
	
	/*boolean*/update: function(range, /*int*/rowDelta, /*int*/colDelta, event){
		var rowSize = this.getEndRow() - this.getStartRow() + 1 ;
		var colSize = this.getEndCol() - this.getStartCol() + 1;
		var deltaChange = websheet.Helper.getRefChangeDeltas(range, this._parsedRef, rowDelta, colDelta, rowSize, colSize);
		if(deltaChange)
			this.pushInOrder(deltaChange);
		
		// for row/col event, always push it to track list, because even it does not need to split
        // but the address might need to update
		this._doc.getAreaManager().appendToSharedFormulaTrack(this);
		
		return true;
	},
	
	_generateId4Split: function()
	{
		return null;
	},
	
	createSharedReference: function(updateRange, dsr, dsc, der, dec, rowDelta, colDelta, returnSharedRefTokens, doc){
		var bUpdate = false;
	    var sizeChanged = false;
	    //for shared formula reference
	    var osr = this.getStartRow() + dsr;
	    var oer = this.getStartRow() + der;
	    var osc = this.getStartCol() + dsc;
	    var oec = this.getStartCol() + dec;
	    var nsr = osr;
	    var ner = oer;
	    var nsc = osc;
	    var nec = oec;
	    
	    if(this.getSheetName() == updateRange.sheetName){
		    if(rowDelta != 0){
		    	var updateResult = websheet.Helper.updateArea(updateRange.startRow, osr, oer, rowDelta, websheet.Constant.MaxRowNum);
				sizeChanged = updateResult.sizeChanged;
				bUpdate = updateResult.positionChanged;
				nsr = updateResult.newStart;
				ner = updateResult.newEnd;
		    }else if(colDelta != 0){
		    	var updateResult = websheet.Helper.updateArea(updateRange.startCol, osc, oec, colDelta, websheet.Constant.MaxColumnIndex);
				sizeChanged = updateResult.sizeChanged;
				bUpdate = updateResult.positionChanged;
				nsc = updateResult.newStart;
				nec = updateResult.newEnd;
		    }
	    }
	    var newSharedFormulaPos = new websheet.parse.ParsedRef(this.getSheetName(), nsr, nsc, ner, nec, websheet.Constant.RANGE_MASK);
	    if (!newSharedFormulaPos.isValid())
	    	return;
	    var newSharedFormulaRef = this.constructor.apply(null,[newSharedFormulaPos, this._generateId4Split()]);
	    returnSharedRefTokens.push(newSharedFormulaRef);
	    var len = this._refTokens ? this._refTokens.length : 0;
	    for(var i = 0; i < len; i++){
	    	var refToken = this._refTokens[i];
	    	var ref = refToken.getValue();
	    	if(ref.usage == websheet.Constant.RangeUsage.SHARED_REFS){
	    		var refMask = refToken.getRefMask();
	    		osr = ref.getStartRow();
	            oer = osr + ref._rowSize - 1;
	            osc = ref.getStartCol();
	            oec = osc + ref._colSize - 1;
	            
	            var nsr = osr;
	            var ner = oer;
	            var nsc = osc;
	            var nec = oec;
	            
	            if((refMask & websheet.Constant.RefAddressType.ROW) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_ROW) == 0)
            	{
	            	nsr = osr += dsr;
	            	ner = oer += der;
	            	if (rowDelta != 0 && ref.getSheetName() == updateRange.sheetName) {
		            	var updateResult = websheet.Helper.updateArea(updateRange.startRow, osr, oer, rowDelta, websheet.Constant.MaxRowNum);
		    			sizeChanged = sizeChanged || updateResult.sizeChanged;
		    			bUpdate = bUpdate || updateResult.positionChanged;
		    			nsr = updateResult.newStart;
		    			ner = updateResult.newEnd;
	    			}
            	}
	            if((refMask & websheet.Constant.RefAddressType.COLUMN) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_COLUMN) == 0)
            	{
	            	nsc = osc += dsc;
	            	nec = oec += dec;
	            	if(colDelta != 0 && ref.getSheetName() == updateRange.sheetName) {
		            	var updateResult = websheet.Helper.updateArea(updateRange.startCol, osc, oec, colDelta, websheet.Constant.MaxColumnIndex);
		    			sizeChanged = sizeChanged || updateResult.sizeChanged;
		    			bUpdate = bUpdate || updateResult.positionChanged;
		    			nsc = updateResult.newStart;
		    			nec = updateResult.newEnd;
	    			}
            	}
            	
	            var parsedRef = new websheet.parse.ParsedRef(ref.getSheetName(), nsr, nsc, ner, nec, refToken.getRefMask());
	            var newSharedReference = new websheet.parse.SharedReferenceRef(parsedRef, ref._rowSize, ref._colSize);
	            returnSharedRefTokens.push(newSharedReference);
	             
	            var newSharedRefToken = new websheet.parse.RefToken();
	            dojo.mixin(newSharedRefToken, refToken);
	            newSharedRefToken.setValue(newSharedReference);
	            if(!newSharedReference.isValid())
	            	newSharedRefToken._error = websheet.Constant.ERRORCODE["524"];
	    		else if(newSharedRefToken._error == websheet.Constant.ERRORCODE["524"])
	    			delete newSharedRefToken._error;
	            
	            newSharedFormulaRef.pushRefToken(newSharedRefToken, true);
	            newSharedReference.addListener(newSharedFormulaRef);
	            this._setUpdateWhenCreate(newSharedFormulaRef, newSharedRefToken, newSharedReference, newSharedFormulaPos, bUpdate, sizeChanged);	            
	    	}else{
	    		websheet.parse.FormulaParseHelper.generateRefTokenByCopyToken(refToken, null, newSharedFormulaRef, true);
	    	}
	    }
//	    newSharedFormulaRef.addListener(newSharedFormulaRef);//add its self as listeners to listen for the set range event
	    this._createSharedReference(newSharedFormulaRef, dsr, dsc, der, dec, doc);
	},
	
	_createSharedReference: function(newSharedFormulaRef, dsr, dsc, der, dec, doc){
		 newSharedFormulaRef._tokenTree = this._tokenTree;	  
	    if (newSharedFormulaRef._dirty) {
	        // set range to dirty and broadcast set range event later
	        doc.getAreaManager().appendToRangeDataTrack(newSharedFormulaRef);
	    }
	    // iterate the cells in the original position of newSharedFormulaRef
	    var rangeInfo = {sheetName: this.getSheetName(), startRow: this.getStartRow() + dsr, startCol: this.getStartCol() + dsc, endRow: this.getStartRow() + der, endCol: this.getStartCol() + dec};
	    var iterator = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.OPTIMIZEVALUE);
	    iterator.iterate(dojo.hitch(this, function(obj, row, col) {
	    	var cell = obj && obj.cell;
	    	if (!cell || cell.isNull())
				return true;
	    	cell.setDirty(true);
	    		return ture;
	    }));
	},
	
	_setUpdateWhenCreate: function(newSharedFormulaRef, newSharedRefToken, newSharedReference, newSharedFormulaPos, bUpdate, sizeChanged){
		if(bUpdate){
        	newSharedFormulaRef._isUpdateFormula = true;
        	if(sizeChanged || ((newSharedRefToken.getProps() & websheet.Constant.RefType.CAREPOSITION) > 0)
        		// or if the formula position is overlap with reference, such as A2:A10 refer to A1:A9
        		|| newSharedReference.intersect(newSharedFormulaPos)){
        		 newSharedFormulaRef._dirty = true;
                 newSharedRefToken.setUpdate(true);
        	}
        }
	},
	
	createFormulaCells: function(dsr, dsc, der, dec, updateRange, rowDelta, colDelta, doc){
		var edgeChanged = false;
	    //for shared formula reference
	    var osr = this.getStartRow() + dsr;
	    var oer = this.getStartRow() + der;
	    var osc = this.getStartCol() + dsc;
	    var oec = this.getStartCol() + dec;
	    
	    var nsr = osr;
	    var ner = oer;
	    var nsc = osc;
	    var nec = oec;
	    
	    if(this.getSheetName() == updateRange.sheetName){
		    if (rowDelta != 0) {
		    	var updateResult = websheet.Helper.updateArea(updateRange.startRow, osr, oer, rowDelta, websheet.Constant.MaxRowNum);
				edgeChanged = updateResult.edgeChanged;
				nsr = updateResult.newStart;
				ner = updateResult.newEnd;
			} else if(colDelta != 0) {
				var updateResult = websheet.Helper.updateArea(updateRange.startCol, osc, oec, colDelta, websheet.Constant.MaxColumnIndex);
				edgeChanged = updateResult.edgeChanged;
				nsc = updateResult.newStart;
				nec = updateResult.newEnd;
			}
	    }
//	    if (edgeChanged) {
//	        //TODO: how/when to collect cell value for deleterow undo event, must before areaManager broadcast
//	        //because here will change the cell's sharedFormulaRef
//	        //edgeChanged means that the formula cells will be deleted, so do not need to create formula related thing for this cell
//	        return;
//	    }
	    
	    var dirty = this._createFormulaCells(dsr, dsc, der, dec, updateRange, rowDelta, colDelta, doc);
	  //will broadcast set range(which contains dirty formula cells) event later
	    if (dirty) {
	    	var parsedRef = new websheet.parse.ParsedRef(this.getSheetName(), nsr, nsc, ner, nec);
	        var dirtyArea = new websheet.parse.Reference(parsedRef);
	        areaManager.appendToRangeDataTrack(dirtyArea);
	    }
	},
	
	_createFormulaCells: function(dsr, dsc, der, dec, updateRange, rowDelta, colDelta, doc){
		// for the following case, there must be at least one cell referred reference edge have changed,
	    // so we need set cell dirty and collect impact cells for delete undo and broadcast set range event
	    var formulaStartRow = this.getStartRow();
	    var formulaStartCol = this.getStartCol();
	    var sharedTokenTree = this._tokenTree;
	    var refTokens = this._refTokens;
	    var areaManager = doc.getAreaManager();
	    var dirty = false;
	    
	    var rangeInfo = {sheetName: this.getSheetName(), startRow: formulaStartRow + dsr, startCol: formulaStartCol + dsc, endRow: formulaStartRow + der, endCol: formulaStartCol + dec};
	    var iterator = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.OPTIMIZEVALUE);
	    iterator.iterate(dojo.hitch(this, function(obj, row, col) {
	    	var cell = obj && obj.cell;
	    	if (!cell || cell.isNull())
				return true;
	    	// push reference and set token tree by token template
	        // collect impact cells for delete event
	    	var refTokensArray = [];
	    	var len = refTokens ? refTokens.length : 0;
	    	for(var i = 0; i < len; i++){
	    		var refToken = refTokens[i];
	    		var ref = refToken.getValue();
	    		if(ref.usage == websheet.Constant.RangeUsage.SHARED_REFS){
	    			 var bUpdate = false;
	                 //generate reference for each cell
	                 var deltaR = row - formulaStartRow;
	                 var osr = ref.getStartRow() + deltaR;
	                 var oer = osr + ref._rowSize - 1;
	                 var deltaC = col - formulaStartCol;
	                 var osc = ref.getStartCol() + deltaC;
	                 var oec = osc + ref._colSize - 1;
	                 var nsr = osr;
	                 var ner = oer;
	                 var nsc = osc;
	                 var nec = oec;
	                 
	                 if(ref.getSheetName() == updateRange.sheetName){
		                 if (rowDelta != 0) {
		                	var updateResult = websheet.Helper.updateArea(updateRange.startRow, osr, oer, rowDelta, websheet.Constant.MaxRowNum);
		         			bUpdate = updateResult.positionChanged;
		         			nsr = updateResult.newStart;
		         			ner = updateResult.newEnd;
		                 }else if(colDelta != 0) {
		                	var updateResult = websheet.Helper.updateArea(updateRange.startCol, osc, oec, colDelta, websheet.Constant.MaxColumnIndex);
		         			bUpdate = updateResult.positionChanged;
		         			nsc = updateResult.newStart;
		         			nec = updateResult.newEnd;
		                 }
	                 }
	                 
	                 var newRef = new websheet.parse.ParsedRef(this.getSheetName(), nsr, nsc, ner, nec, refToken.getRefMask());
	                 var newToken = websheet.parse.FormulaParseHelper.generateRefTokenByCopyToken(refToken, newRef, cell, true);
	                 refTokensArray.push(newToken);
	                //TODO: the cell pos is changed even reference is not changed, so formula cell should also has property
	                 //such as carepostion, notify always which is the same as the formula properties??
	                 if (bUpdate) {
	                     cell._isUpdateFormula = true;
	                     if (sizeChanged || ((newToken.getProps() & websheet.Constant.RefType.CAREPOSITION) > 0)) {//TODO: & !ignoreSet?
	                         cell.setDirty(true);
	                         newToken.setUpdate(true);
	                         dirty = true;
	                     }
	                     if (edgeChanged) {
	                    	 areaManager._addCell4DeleteUndo(cell);
	                     }
	                 }
	    		}else{
	    			var newToken = websheet.parse.FormulaParseHelper.generateRefTokenByCopyToken(refToken, null, cell, true);
	    			 refTokensArray.push(newToken);
	    		}
	    	}
	    	var newTokenTree = new websheet.parse.tokenList();
	    	dojo.mixin(newTokenTree, sharedTokenTree);
	    	cell.setCellToken(newTokenTree);
	    	 //remove this cell from shared formula
	        //cell.formulaDelegate.sharedFormulaRef = nil;
	    	return true;
	    }));
	    return dirty;
	},
	
	pushInOrder: function(deltas, needUpdate, bRow){
		if(deltas){
			if(needUpdate){
				var size = 0;
				if(bRow)
					size = this.getEndRow() - this.getStartRow() + 1;
				else
					size = this.getEndCol() - this.getStartCol() + 1;
				if(deltas[1] >= size)
					deltas[1] = size - 1;
			}
			
			if(!this._deltaChanges)
				this._deltaChanges = [];
			if(this._deltaChanges.length == 0){
				this._deltaChanges.push(deltas);
				return;
			}
			var deltaStart = deltas[0];
			var deltaEnd = deltas[1];
			var count = this._deltaChanges.length;
			var i = 0;
			for(; i < count; i++){
				var array = this._deltaChanges[i];
				var start = array[0];
				var end = array[1];
				if ((deltaStart < start) || (deltaStart == start && deltaEnd <= end) ){
					this._deltaChanges.splice(i, 1, deltas);
					break;
				}
			}
			if(i == count)
				this._deltaChanges.push(deltas);
		}
	},	
	
	getUndoInfo: function()
	{
		var info = {};
		info.refValue = this._parsedRef.getAddress();
		info.data = this._undoData();
		info.usage = this.usage;
		info.rangeid = this._id;
		info.sharedRange = this;
		return info;
	},
	
	_undoData: function()
	{
		
	},
	
	splitSharedReferences: function(updateRange, rowDelta, colDelta, doc){
	    if(!this._deltaChanges || this._deltaChanges.length == 0) {
	        //check if the sharedreference address need to udpate
	        this.updateAddress(updateRange, rowDelta, colDelta, doc);
	    } else {
	    	if(rowDelta < 0 || colDelta < 0){// only collection undo for delete
		    	var areaManager = doc.getAreaManager();
		    	areaManager.addSharedRef4DeleteUndo(this);
	    	}
	    	this._splitSharedReferences(updateRange, rowDelta, colDelta, doc);
	    }
	},
	
	_splitSharedReferences: function(updateRange, rowDelta, colDelta, doc){
		var lastEnd = 0;
	    var newSharedRefTokens = [];
	    var dsr = 0;
	    var der = this.getEndRow() - this.getStartRow();
	    var dsc = 0;
	    var dec = this.getEndCol() - this.getStartCol();
	    var delta = 0;
    	for(var i = 0; i < this._deltaChanges.length; i++){
    		var change = this._deltaChanges[i];
    		var start = change[0];
    		if(start < lastEnd)
    			start = lastEnd;
    		var end = change[1];
            if (colDelta != 0) {
                dsc = lastEnd;
                dec = end - 1;
                delta = dec - dsc;
            } else {
                dsr = lastEnd;
                der = end - 1;
                delta = der - dsr;
            }
            
            this._createSharedReferences(delta, updateRange, dsr, dsc, der, dec, rowDelta, colDelta, newSharedRefTokens, doc);
            
            lastEnd = lastEnd > end ? lastEnd : end;
            if (updateRange) {
                if (colDelta != 0){
                    dsc = lastEnd;
                    dec = end;
                } else {
                    dsr = lastEnd;
                    der = end;
                }
                this.createFormulaCells(dsr, dsc, der, dec, updateRange, rowDelta, colDelta, doc);
            }
    	}
    	if (colDelta != 0) {
            dsc = lastEnd + 1;
            dec = this.getEndCol() - this.getStartCol();
            delta = dec - dsc;
        } else {
            dsr = lastEnd + 1;
            der = this.getEndRow() - this.getStartRow();
            delta = der - dsr;
        }
    	
         this._createSharedReferences(delta, updateRange, dsr, dsc, der, dec, rowDelta, colDelta, newSharedRefTokens, doc);
         
    	//remove the original shared reference
        this.clearRefTokens();
        var areaManager = doc.getAreaManager();
        //add the new splited shared reference
        for(var i = 0; i < newSharedRefTokens.length; i++){
        	var ref = newSharedRefTokens[i];
        	areaManager.startListeningArea(ref._parsedRef, null, ref);
        }
        this._deltaChanges.length = 0;
	},
	
	
	_createSharedReferences: function(delta, updateRange, dsr, dsc, der, dec, rowDelta, colDelta, newSharedRefTokens, doc){
		if ( delta > 1 ){
         	this.createSharedReference(updateRange, dsr, dsc, der, dec, rowDelta, colDelta, newSharedRefTokens, doc);
         }else if(delta >= 0){
         	this.createFormulaCells(dsr, dsc, der, dec, updateRange, rowDelta, colDelta, doc);
         }
	},
	
	updateAddress: function(updateRange, rowDelta, colDelta, doc, bAppend){
		if(!updateRange)
			return;
		var bRow = rowDelta ? true : false;
		var AreaUpdateInfo = websheet.Constant.AreaUpdateInfo;
		var bUpdate = false;
	    var sizeChanged = false;
	    var osr, oer, osc, oec;
	    var nsr, ner, nsc, nec;
	    var formulaUpdate = false;
	    var formulaDirty = false;
	    var areaManager = doc.getAreaManager();
	    
	    var allUpdate = true;
	    var update = false;
	    
	    var len = this._sharedRefTokens ? this._sharedRefTokens.length : 0;
	    for(var i = 0; i < len; i++){
	    	var refToken = this._sharedRefTokens[i];
	    	var ref = refToken.getValue();
	    	 bUpdate = false;
	    	 if(ref.getSheetName() == updateRange.sheetName){
		         sizeChanged = false;
		         osr = ref.getStartRow();
		         oer = ref.getEndRow();
		         osc = ref.getStartCol();
		         oec = ref.getEndCol();
		         nsr = osr;
		         ner = oer;
		         nsc = osc;
		         nec = oec;
		         if (rowDelta != 0) {
		        	if(ref.isAbsolute(true))
		        		continue;
		 			if (bAppend) {
					    bUpdate = true;
					    sizeChanged = true;
					    ner = ner + rowDelta;
					} else {
			        	var updateResult = websheet.Helper.updateArea(updateRange.startRow, osr, oer, rowDelta, websheet.Constant.MaxRowNum);
			 			sizeChanged = updateResult.sizeChanged;
			 			bUpdate = updateResult.positionChanged;
			 			nsr = updateResult.newStart;
			 			ner = updateResult.newEnd;
					}
		 		 } else if (colDelta != 0) {
		 			if(ref.isAbsolute())
		        		continue;
					if (bAppend) {
						bUpdate = true;
						sizeChanged = true;
						nec = nec + colDelta;
					} else {
			 			var updateResult = websheet.Helper.updateArea(updateRange.startCol, osc, oec, colDelta, websheet.Constant.MaxColumnIndex);
						sizeChanged = updateResult.sizeChanged;
						bUpdate = updateResult.positionChanged;
						nsc = updateResult.newStart;
						nec = updateResult.newEnd;
					}
				}
	    	 }
	         if(bUpdate){
	        	 update = true;
	        	 formulaUpdate = true;
	        	 this.endListeningSharedArea(areaManager, ref, this);
	             var parsedRef = ref.getParsedRef();
	             parsedRef.startRow = nsr;
	             parsedRef.startCol = nsc;
	             parsedRef.endRow = ner;
	             parsedRef.endCol = nec;
	             ref._parsedRef = parsedRef;
	             ref.updateStatus = AreaUpdateInfo.NONE;
	             areaManager.startListeningArea(parsedRef, this, ref);
	             
	             if (sizeChanged || (refToken.getProps() & websheet.Constant.RefType.CAREPOSITION) > 0 ) {
	                 formulaDirty = this._FormulaDirtyValue(ref, formulaDirty);
	                 refToken.setUpdate(true);
	             }
	         }else
	        	 allUpdate = false;
	    }
	    bUpdate = false;
	    if(this.getSheetName() == updateRange.sheetName){
		    osr = this.getStartRow();
		    oer = this.getEndRow();
		    osc = this.getStartCol();
		    oec = this.getEndCol();
		    nsr = osr;
		    ner = oer;
		    nsc = osc;
		    nec = oec;
		    
		    if (rowDelta != 0) {
	 			if (bAppend) {
	 				bUpdate = true;
		    		ner = ner + rowDelta;
	 			} else {
			    	var updateResult = websheet.Helper.updateArea(updateRange.startRow, osr, oer, rowDelta, websheet.Constant.MaxRowNum);
		 			bUpdate = updateResult.positionChanged;
		 			nsr = updateResult.newStart;
		 			ner = updateResult.newEnd;
	 			}
	 		} else if (colDelta != 0) {
	 			if (bAppend) {
	 				bUpdate = true;
		    		nec = nec + colDelta;
	 			} else {
		 			var updateResult = websheet.Helper.updateArea(updateRange.startCol, osc, oec, colDelta, websheet.Constant.MaxColumnIndex);
					bUpdate = updateResult.positionChanged;
					nsc = updateResult.newStart;
					nec = updateResult.newEnd;
	 			}
			}
	    }
	    if (bUpdate) {
	    	update = true;
	    	this.endListeningSharedArea(areaManager, this, this);
	        var parsedRef = this.getParsedRef();
	        parsedRef.startRow = nsr;
	        parsedRef.startCol = nsc;
	        parsedRef.endRow = ner;
	        parsedRef.endCol = nec;
	        this._parsedRef = parsedRef;
	        this.updateStatus = AreaUpdateInfo.NONE;
	        areaManager.startListeningArea(parsedRef, this, this);
	        //TODO: datavalidation clear cache
	    }else
	    	allUpdate = false;
	    
	    if (formulaUpdate) {
	    	 var rangeInfo = {sheetName: this.getSheetName(), startRow: osr, startCol: osc, endRow: oer, endCol: oec};
	    	 this.setDirtyAndUpdate(formulaDirty, formulaUpdate, rangeInfo);
	    }

	    if(update)
	    	this._splitFromParent(doc, allUpdate);
	},
	
	_splitFromParent: function(doc, allUpdate)
	{
		
	},
	
	_FormulaDirtyValue: function(ref){
		return true;
	},
	
	setRangeNotify: function(sender, range, manager){
		var size = sender.getEndRow()- sender.getStartRow();
	    var dsr = range.startRow - sender.getStartRow();
	    var der = range.endRow - sender.getStartRow();
	    dsr = dsr - sender._rowSize + 1;
	    if (dsr < 0) {
	        dsr = 0;
	    }
	    if (der > size) {
	        der = size;
	    }
	    var rangeInfo = {sheetName: this.getSheetName(), startRow: this.getStartRow() + dsr, startCol: this.getStartCol(), endRow: this.getStartRow() + der, endCol: this.getEndCol()};
	    var iterator = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.OPTIMIZEVALUE);
	    iterator.iterate(dojo.hitch(this, function(obj, row, col) {
	    	var cell = obj && obj.cell;
	    	if (!cell || cell.isNull())
				return true;
	    	cell.setDirty(true);
	    }));
	    var parsedRef = new websheet.parse.ParsedRef(this.getSheetName(),this.getStartRow() + dsr, this.getStartCol(), this.getStartRow() + der, this.getEndCol());
	    var dirtyArea = new websheet.parse.Reference(parsedRef);
	    manager.appendToRangeDataTrack(dirtyArea);
	},
	
	iterateRefTokens: function(refId, ref, callBack){
		var length = this._refTokens ? this._refTokens.length : 0;
		for(var i = 0; i < length; i++){
			var token = this._refTokens[i];
			if(!ref || token.getValue() == ref){
				if (callBack(token, true)){
					return;
				}
			}
		}
		/*
		//2. iterate updateRefTokens
		if (areaId) {
			var tokenList = this._updateRefTokens[areaId];
			if(tokenList){
				for(var i in tokenList) {
					var token = tokenList[i];
					if (!area || (token.getValue() == area)){
						if (callback(token)){
							return;
						}
					}
				}
			}
		} else {
			var stop = false;
			//iterate every token
			for(var id in this._updateRefTokens){
				var tokenList = this._updateRefTokens[id];
				for (var i in tokenList){
					var token = tokenList[i];
					stop = callback(token);
					if(stop)
						return;
				}
			}
		}
		*/
	},
	
	endListeningSharedArea: function(areaManager, sharedRef, listener){
		if(!areaManager.endListeningSharedArea(sharedRef, listener))
			areaManager.endListeningArea(sharedRef, listener);
	},
	
	pushRef: function(refToken, bInTokenTree){
		this.pushRefToken(refToken, bInTokenTree);
	},
	
	getRefTokens: function()
	{
		return this._refTokens;
	},	
	
	//TODO: what about the generated update reference, they might not be continuous for shared formula
	// such as the vlookup result, it should be store in each formula cell
	pushRefToken: function(refToken, bInTokenTree){
		if (bInTokenTree) {
	        if (this._sharedRefTokens == null) {
	        	this._sharedRefTokens = [];
	        }
	        if (this._refTokens == null) {
	        	this._refTokens = [];
	        }
	        this._refTokens.push(refToken);
	        
	        var ref = refToken.getValue();
	        if(ref.usage == websheet.Constant.RangeUsage.SHARED_REFS){
	        	this._sharedRefTokens.push(refToken);
	        }
	    }
	},
	
	deleteRefToken: function(refToken, bInTokenTree){
		var areaManager = this._doc.getAreaManager();
		
		var ref = refToken.getValue();
		this.endListeningSharedArea(areaManager, ref, this);
		
		if(bInTokenTree){
			var len = this._refTokens ? this._refTokens.length : 0;
			for(var i=0;i<len; i++)
			{
				if(this._refTokens[i] == refToken)
				{
					this._refTokens.splice(i,1);
					break;
				}
			}
			
			len = this._sharedRefTokens ? this._sharedRefTokens.length : 0;
			for(var i=0;i<len; i++)
			{
				if(this._sharedRefTokens[i] == refToken)
				{
					this._sharedRefTokens.splice(i,1);
					break;
				}
			}
		}
	},
	
	clearRefTokens: function(){
		if(!this._refTokens)
			return;
		var areaManager = this._doc.getAreaManager();
		for(var i=0;i<this._refTokens.length; i++)
		{
			var token = this._refTokens[i];
			var ref = token.getValue();
			this.endListeningSharedArea(areaManager, ref, this);
		}
		this._refTokens.length = 0;
		if(this._sharedRefTokens)
			this._sharedRefTokens.length = 0;
		this._tokenTree = null;
	},
	
	setCurrRangeNotify: function(data, area, refValue){
		// user change the value in shared formulas, we should split it
		if(data && data.main){
			var range = websheet.Helper.parseRef(refValue);
			var size = area.getEndRow() - area.getStartRow();
			var dsr = range.startRow - area.getStartRow();
			var der = range.endRow - area.getStartRow();
			if (dsr < 0) {
                dsr = 0;
            }
            if (der > size) {
                der = size;
            }
            
            var deltas = [dsr, der];
            this.pushInOrder(deltas);
            this._doc.getAreaManager().appendToSharedFormulaTrack(this);
		}
	},
	
	setDirtyAndUpdate: function(isDirty, isUpdate, rangeInfo){
		if(!rangeInfo)
			rangeInfo = this._getRangeInfo();
		var iterator = new websheet.model.RangeIterator(rangeInfo, websheet.Constant.RangeIterType.OPTIMIZEVALUE);
	    iterator.iterate(dojo.hitch(this, function(obj, row, col) {
	    	var cell = obj && obj.cell;
	    	if (!cell || cell.isNull())
				return true;
	    	if(isDirty)
	    		cell.setDirty(true);
	    	if(isUpdate)
	    		cell._bUpdateFormula = true;
	    }));
	},
	
	_range2Show: function()
	{
		
	},
	
	/*void*/notify: function(/*broadcaster*/area, event) {
		var source = event._source;
		var data = source.data;
		var deltas = null;
		if(data)
			deltas = data.shared_ref_delta;
		var manager = this._doc.getAreaManager();
		var constant = websheet.Constant;
		var refType = source.refType;
		
		if (deltas) {
	        this.pushInOrder(deltas, true, refType == constant.OPType.ROW);
	        manager.appendToSharedFormulaTrack(this);
	        delete data.shared_ref_delta;
	        return;
	    }		
		
		var action = source.action;
		var refValue = source.refValue;
		var isDirty = false;
		var isUpdateFormula = false;
		if (action == constant.DataChange.SET && refType == constant.OPType.RANGE){
			if(area == this ){
				this.setCurrRangeNotify(data, area, refValue);
				return;
			}
			if(!(area instanceof websheet.parse.SharedReferenceRef))
				// other reference referred by shared formula, such as name ref or absolute ref
				isDirty = this._FormulaDirtyValue(area);
			else{
				refMask = area._parsedRef.refMask;
				if((refMask & websheet.Constant.RefAddressType.ABS_COLUMN) > 0 || (refMask & websheet.Constant.RefAddressType.ABS_COLUMN) > 0
						||(refMask & websheet.Constant.RefAddressType.ABS_ROW)> 0 || (refMask & websheet.Constant.RefAddressType.ABS_END_ROW) > 0)
					isDirty = this._FormulaDirtyValue(area);
				else{
					this.iterateRefTokens(area.getId().toLowerCase(), area, function(refToken){
						// if the refToken is ignore set, such as operand of intersection
						var props = refToken.getProps();
						if((props & websheet.Constant.RefType.IGNORESET) == 0){
							//refToken.setUpdate(true);
							isDirty = true;
						}
					});
					if(isDirty){
						var range = websheet.Helper.parseRef(refValue);
						this.setRangeNotify(area, range, manager);
					}
					return;
				}
			}
		}else if (action == constant.DataChange.CUT ){
			var compareResult = websheet.Helper.compareRange(this._getRangeInfo(), websheet.Helper.parseRef(refValue));
			var rangeRelation = websheet.Constant.RangeRelation;
			var inCutArea =  (compareResult == rangeRelation.EQUAL || compareResult == rangeRelation.SUBSET);
			//Only collect the cell to cut update if it is not in cut area.
			if(!inCutArea && area.cutRef)
				manager.addSharedRef4DeleteUndo(this);
			
			//TODO: split sharedFormulaRef if area.cutRef is false but there is whole ref for one cell is cutted.
			var self = this;
			var sheetDelta = data.sheetDelta;
			this.iterateRefTokens(area.getId().toLowerCase(), area, function(refToken){
				var props = refToken.getProps();
				if(!area.cutRef || (props & websheet.Constant.RefType.CAREPOSITION) > 0){
					isDirty = true;
				}
				
				if(refToken.getTokenType() != websheet.parse.tokenType.NAME){
					if(area.cutRef && !self._dirtyCut)
						self._dirtyCut = inCutArea;
				}
				
				if(sheetDelta && ((inCutArea && !area.cutRef) || (!inCutArea && area.cutRef)))
					refToken._refMask |= websheet.Constant.RefAddressType.SHEET;
				
				isUpdateFormula = true;
			});
			if (isDirty)
				isDirty = this._FormulaDirtyValue(area);
		} else if (action === constant.DataChange.FILTER) {
			this.iterateRefTokens(area.getId().toLowerCase(), area, function(refToken){
				var props = refToken.getProps();
				if((props & websheet.Constant.RefType.CAREFILTER) > 0){
					isDirty = true;
				}
			});
			if(isDirty){
				if(area instanceof websheet.parse.SharedReferenceRef){
					var range = websheet.Helper.parseRef(refValue);
					this.setRangeNotify(area, range, manager);
					return;
				}
				isDirty = this._FormulaDirtyValue(area);
			}else if(area == this)
				this.setCurrRangeNotify(data, area, refValue);
			else return;
		} else if((refType == constant.OPType.ROW || refType == constant.OPType.COLUMN)){
			switch (action) {
				case constant.DataChange.PREINSERT:
				case constant.DataChange.PREDELETE:
				{
					if(area instanceof websheet.parse.SharedReferenceRef && (!data || (!data.collectUndo && !data.sizeChanged))){
						// for row/col event, always push it to track list, because even it does not need to split
	                    // but the address might need to update
						manager.appendToSharedFormulaTrack(this);
						return;
					}else{
						if(action == constant.DataChange.PREDELETE){
							if(data && data.collectUndo)
								manager.addSharedRef4DeleteUndo(this);
							else
								manager.prepareSharedRef4DeleteUndo(this);
						}
					}
					
					// other reference referred by shared formula, such as name ref or absolute ref
					var sizeChanged = data && data.sizeChanged;
					var self = this;
					this.iterateRefTokens(area.getId().toLowerCase(), area, function(refToken){
						// if the refToken is ignore set, such as operand of intersection
						var props = refToken.getProps();
						if(sizeChanged || (props & websheet.Constant.RefType.CAREPOSITION) > 0){
							//refToken.setUpdate(true);
							isDirty =  self._FormulaDirtyValue(area);
						}
						if(refToken.getType() !=  websheet.parse.tokenType.NAME)
							isUpdateFormula = true;
					});
					
					break;
				}
				case constant.DataChange.SHOW:
				case constant.DataChange.HIDE:
				{
					this.iterateRefTokens(area.getId().toLowerCase(), area, function(refToken){
						var props = refToken.getProps();
						if((props & websheet.Constant.RefType.CARESHOWHIDE) > 0){
							//refToken.setUpdate(true);
							isDirty =  true;
						}
					});
					if(isDirty){
						if(area instanceof websheet.parse.SharedReferenceRef){
							var range = websheet.Helper.parseRef(refValue);
							this.setRangeNotify(area, range, manager);
							return;
						}
						isDirty = this._FormulaDirtyValue(area);
						//else should not return, it is other reference referred by shared formula, such as name ref or absolute ref
					}
					else if(action == constant.DataChange.SHOW && area == this) 
						this.setCurrRangeNotify(data, area, refValue);
					break;
				}
				default:
					return;
			}
		}else if(refType == constant.OPType.AREA){//name range
			switch(action){
				case constant.DataChange.INSERT:
				case constant.DataChange.DELETE:
				{
					isDirty =  this._FormulaDirtyValue(area);
					var oldArea = area;
					var newArea = refValue;
					var bEnableName = false;
					//var mask = websheet.Constant.RANGE_MASK;
					if(action == constant.DataChange.INSERT){
						//mask = newArea.getMask();
						bEnableName = true;
					}
					var id = newArea.getId().toLowerCase();
					this.iterateRefTokens(id, oldArea, function(refToken){
						refToken.setValue(newArea);
						refToken.setUpdate(true, {enableNameRange:bEnableName});
						if(action == constant.DataChange.INSERT){
							delete refToken._error;
							if(!newArea.isValid())
								refToken.setError(websheet.Constant.ERRORCODE["524"]);
						} else {
							//delete
							refToken.setError(websheet.Constant.ERRORCODE["525"]);
						}
					});
					break;
				}
				case constant.DataChange.SET:
				{
					isDirty =  this._FormulaDirtyValue(area);
					var isValid = area.isValid();
					this.iterateRefTokens(area.getId().toLowerCase(), area, function(refToken){
						//refToken.setUpdate(true);
						if(!isValid)
							refToken.setError(websheet.Constant.ERRORCODE["524"]);
						else
							delete refToken._error;
						refToken.setRefMask(refValue.refMask);
					});
					break;
				}
				default:
					break;
			}
		}else if(refType == constant.OPType.SHEET){
			switch(action){
				case constant.DataChange.PREDELETE:
				{
					var sheetName = refValue;
					if(sheetName != this.getSheetName()){
						manager.addSharedRef4DeleteUndo(this);
						isUpdateFormula = true;
						var self = this;
						this.iterateRefTokens(area.getId().toLowerCase(), area, function(refToken){
							refToken.setRefMask(constant.RefAddressType.INVALID_SHEET, true);
							//refToken.setUpdate(true);
							isDirty =  self._FormulaDirtyValue(area);
						});
					}
					break;
				}
				case constant.DataChange.INSERT:
				{
					var sheetName = websheet.Helper.handleRefValue(refValue,websheet.Constant.Event.SCOPE_SHEET);
					if(sheetName != this.getSheetName()){
						isUpdateFormula = true;
						var self = this;
						this.iterateRefTokens(area.getId().toLowerCase(), area, function(refToken){
							var refMask = (refToken.getRefMask())^ constant.RefAddressType.INVALID_SHEET;
							refToken.setRefMask(refMask);
							//refToken.setUpdate(true);
							isDirty =  self._FormulaDirtyValue(area);
						});
					}
					break;
				}
				case constant.DataChange.SET:
				{
					if(area != this)
						isUpdateFormula = true;
					break;
				}
				default:
	                break;
			}
		}else if(action == constant.DataChange.PRESPLIT){
			if(area == this ){
				this._range2Show();
				return;
			}
		}
		if(isDirty || isUpdateFormula){
			//TODO: for shared formula is dirty, then the cells need to calc all the token tree, because we can not find the chance to set the shared reference token dirty to NO
			this.setDirtyAndUpdate(isDirty, isUpdateFormula);			
		}
	}
});