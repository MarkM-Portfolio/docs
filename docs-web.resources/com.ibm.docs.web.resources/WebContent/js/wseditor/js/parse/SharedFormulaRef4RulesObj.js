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

dojo.provide("websheet.parse.SharedFormulaRef4RulesObj");
dojo.require("websheet.parse.SharedFormulaRefBase");
dojo.declare("websheet.parse.SharedFormulaRef4RulesObj",websheet.parse.SharedFormulaRefBase,{
	
	
	removPartialRange: function(interRange, doc)
	{
		 var sheetName = this.getSheetName();
		 var osr = this.getStartRow();
		 var osc = this.getStartCol();
		 var oer = this.getEndRow();
		 var oec = this.getEndCol();
		 var srDelta = interRange.startRow - osr;
		 var scDelta = interRange.startCol - osc;
		 var erDelta = oer - interRange.endRow;
		 var ecDelta = oec - interRange.endCol;
		 if(srDelta > 0){
			 var parsedRef = new websheet.parse.ParsedRef(sheetName, osr, osc ,interRange.startRow - 1, oec, websheet.Constant.RANGE_MASK);
			 this._createNewRulesObj(parsedRef, doc);
		 }
		 
		 if(scDelta > 0){
			 var sr = srDelta > 0 ? interRange.startRow : osr;
			 var er = erDelta > 0 ? interRange.endRow : oer;
			 var parsedRef = new websheet.parse.ParsedRef(sheetName, sr, osc ,er, interRange.startCol - 1, websheet.Constant.RANGE_MASK);
			 this._createNewRulesObj(parsedRef, doc);
		 }
		 
		 if(erDelta > 0){
			 var parsedRef = new websheet.parse.ParsedRef(sheetName, interRange.endRow + 1, osc ,oer, oec, websheet.Constant.RANGE_MASK);
			 this._createNewRulesObj(parsedRef, doc);
		 }
		 
		 
		 if(ecDelta > 0){
			 var sr = srDelta > 0 ? interRange.startRow : osr;
			 var er = erDelta > 0 ? interRange.endRow : oer;
			 var parsedRef = new websheet.parse.ParsedRef(sheetName, sr, interRange.endCol + 1 ,er, oec, websheet.Constant.RANGE_MASK);
			 this._createNewRulesObj(parsedRef, doc);
		 }
		 var rulesObj = this.data;
		 this.clearRefTokens();//remove the original shared reference
		 rulesObj.removeRange(this);
		 var areaManager = doc.getAreaManager();
		 this.endListeningSharedArea(areaManager, this, this);
		 areaManager.deleteAreaInUsageMap(this);
	},
	
	_createNewRulesObj: function(parsedRef, doc)
	{
		var areaManager = doc.getAreaManager();
		var newSharedFormulaRef = this.constructor.apply(null,[parsedRef]);
		areaManager.startListeningArea(parsedRef, newSharedFormulaRef, newSharedFormulaRef);
		areaManager.addAreaInUsageMap(newSharedFormulaRef);	
		var rDelta = parsedRef.startRow - this.getStartRow();
		var cDelta = parsedRef.startCol - this.getStartCol();
		var len = this._refTokens ? this._refTokens.length : 0;
		 for(var i = 0; i < len; i++){
	    	var refToken = this._refTokens[i];
	    	var ref = refToken.getValue();
	    	if(ref.usage == websheet.Constant.RangeUsage.SHARED_REFS){
	    		var mask = refToken.getRefMask();
	    		var sr = ref.getStartRow();
	    		var sc = ref.getStartCol();
	    		var er = sr + ref._rowSize - 1;
	    		var ec = sc + ref._colSize - 1;
	    		if((mask & websheet.Constant.RefAddressType.ROW) > 0 && (mask & websheet.Constant.RefAddressType.ABS_ROW) == 0){
	    			sr += rDelta;
	            	er += rDelta;
	            	er += parsedRef.endRow - parsedRef.startRow + 1;
	    		}
	    		
	    		if((mask & websheet.Constant.RefAddressType.COLUMN) > 0 && (mask & websheet.Constant.RefAddressType.ABS_COLUMN) == 0){
	    			sc += cDelta;
	            	ec += cDelta;
	            	ec += parsedRef.endCol - parsedRef.startCol + 1;
	    		}
	    		
	    		var newParsedRef = new websheet.parse.ParsedRef(ref.getSheetName(), sr, sc, er, ec, mask);
			    var newSharedReference = new websheet.parse.SharedReferenceRef(newParsedRef, ref._rowSize, ref._colSize);
			    var newSharedRefToken = new websheet.parse.RefToken();
	            dojo.mixin(newSharedRefToken, refToken);
	            newSharedRefToken.setValue(newSharedReference);
	            if(!newSharedReference.isValid())
	            	newSharedRefToken._error = websheet.Constant.ERRORCODE["524"];
	    		else if(newSharedRefToken._error == websheet.Constant.ERRORCODE["524"])
	    			delete newSharedRefToken._error;
	            
	            newSharedFormulaRef.pushRefToken(newSharedRefToken, true);
	            areaManager.startListeningArea(newParsedRef, newSharedFormulaRef, newSharedReference);
	    	}
	    	else{
	    		websheet.parse.FormulaParseHelper.generateRefTokenByCopyToken(refToken, null, newSharedFormulaRef, true);
	    	}
		 }
		 var rulesObj = this.data;
		 newSharedFormulaRef.data = rulesObj;
		 rulesObj.addRange(newSharedFormulaRef);
	},	
	
	_setUpdateWhenCreate: function(newSharedFormulaRef, newSharedRefToken, newSharedReference, newSharedFormulaPos, bUpdate, sizeChanged){
		
	},
	
	_splitSharedReferences: function(updateRange, rowDelta, colDelta, doc){
		this.inherited(arguments);
		var rulesObj = this.data;
		rulesObj.removeRange(this);
		var areaManager = doc.getAreaManager();
		this.endListeningSharedArea(areaManager, this, this);
		areaManager.deleteAreaInUsageMap(this);
	},
	
	_splitFromParent: function(doc, allUpdate)
	{
		var rulesObj = this.data;
		if (!this._parsedRef.isValid()){
			rulesObj.removeRange(this);
		} else if(!allUpdate && rulesObj.rangeNum() > 1){
			rulesObj.removeRange(this);
			this._createRulesObj(this, doc);
		}
	},
	
	_createRulesObj:function(newSharedFormulaRef, doc){
		 var rulesObj = this.data;
		 var newRulesObj = rulesObj.createNewInstance(newSharedFormulaRef);
		 newSharedFormulaRef.data = newRulesObj;
		 doc.getAreaManager().addAreaInUsageMap(newSharedFormulaRef);
		 doc.addRulesObjByUsage(newRulesObj, this.usage);
	},
	
	_createSharedReferences: function(delta, updateRange, dsr, dsc, der, dec, rowDelta, colDelta, newSharedRefTokens, doc){
		if ( delta >= 0 ){
         	this.createSharedReference(updateRange, dsr, dsc, der, dec, rowDelta, colDelta, newSharedRefTokens, doc);
         }
	},
	
	_createSharedReference: function(newSharedFormulaRef, dsr, dsc, der, dec, doc){
		//create new rulesObj with the tokenarray.
		newSharedFormulaRef.addListener(newSharedFormulaRef);
		this._createRulesObj(newSharedFormulaRef, doc);
	},
	
	_createFormulaCells: function(dsr, dsc, der, dec, updateRange, rowDelta, colDelta, doc){
		 var formulaStartRow = this.getStartRow();
	     var formulaStartCol = this.getStartCol();
	     var sheetName = this.getSheetName();
	     var refTokens = this._refTokens;
	 	 var areaManager = doc.getAreaManager();
	 	 var start = end = 0;
	 	 var bRow = true;
	 	 if(rowDelta != 0){
	 		  start = formulaStartRow + dsr;
	 		  end = formulaStartRow + der;
	 	 }else if(colDelta != 0){
	 		 start = formulaStartCol + dsc;
	 		 end = formulaStartCol + dec;
	 		 bRow = false;
	 	 }
	 	 
	 	 for(var i = start; i <= end; i ++){
	 		 var sr = bRow ? i : formulaStartRow;
	 		 var er = bRow ? i : this.getEndRow();
	 		 var sc = !bRow ? i :formulaStartCol;
	 		 var ec = !bRow ? i :this.getEndCol();
	 		 var deltaR = 0;
	 		 var deltaC = 0;
	 		if (rowDelta != 0) {
	 			deltaR = sr - formulaStartRow;
	 			if(this.getSheetName() == updateRange.sheetName){
	            	var updateResult = websheet.Helper.updateArea(updateRange.startRow, sr, er, rowDelta, websheet.Constant.MaxRowNum);
	     			sr = er = updateResult.newStart;
	 			}else
	 				er = sr;
    			if(sr == -1)
    				continue;
            }else if(colDelta != 0) {
           	deltaC = sc - formulaStartCol;
           	if(this.getSheetName() == updateRange.sheetName){
	            	var updateResult = websheet.Helper.updateArea(updateRange.startCol, sc, ec, colDelta, websheet.Constant.MaxColumnIndex);
	     			sc = ec = updateResult.newStart;
           	}else
           		ec = sc;
    			if(sc == -1)
    				continue;
            }
	 		
		 	var newSharedFormulaPos = new websheet.parse.ParsedRef(sheetName, sr, sc, er, ec, websheet.Constant.RANGE_MASK);
	   		var newSharedFormulaRef = this.constructor.apply(null,[newSharedFormulaPos, this._generateId4Split()]);
	   		areaManager.startListeningArea(newSharedFormulaPos, newSharedFormulaRef, newSharedFormulaRef);
	   		var refTokensArray = [];
	   		var len = refTokens ? refTokens.length : 0;
	   		for(var k = 0; k < len; k++){
	   			var refToken = refTokens[k];
	    		var ref = refToken.getValue();
	    		if(ref.usage == websheet.Constant.RangeUsage.SHARED_REFS){
	    			var refMask = refToken.getRefMask();
	    			var rowSize = ref._rowSize;
	                var colSize = ref._colSize;
	    			var osr = ref.getStartRow();
	    			var nsr = osr;
	    			var oer = osr + rowSize - 1;
	    			var ner = oer;
	    			var osc = ref.getStartCol();
	    			var nsc = osc;
	    			var oec = osc + colSize - 1;
	    			var nec = oec;
	                
	    			if((refMask & websheet.Constant.RefAddressType.ROW) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_ROW) == 0)
	    			{
	    				 nsr = osr += deltaR;
	    				 ner = oer += deltaR;
	    				 if (rowDelta != 0 && ref.getSheetName() == updateRange.sheetName) {
	    					var updateResult = websheet.Helper.updateArea(updateRange.startRow, osr, oer, rowDelta, websheet.Constant.MaxRowNum);
	 	         			nsr = updateResult.newStart;
	 	         			ner = updateResult.newEnd;
		                	rowSize = ner - nsr + 1;
	    				 }else
	 	                	ner += er - sr; 
	    			}
	    			if((refMask & websheet.Constant.RefAddressType.COLUMN) > 0 && (refMask & websheet.Constant.RefAddressType.ABS_COLUMN) == 0)
	    			{
	    				nsc = osc += deltaC;
	    				nec = oec += deltaC;
	    				if(colDelta != 0 && ref.getSheetName() == updateRange.sheetName) {
	    					var updateResult = websheet.Helper.updateArea(updateRange.startCol, osc, oec, colDelta, websheet.Constant.MaxColumnIndex);
		         			nsc = updateResult.newStart;
		         			nec = updateResult.newEnd;
		 	    	        colSize = nec - nsc + 1;
		                 }else
			                nec += ec - sc;
	    			}
	    			
	                 var newRef = new websheet.parse.ParsedRef(ref.getSheetName(), nsr, nsc, ner, nec, refToken.getRefMask());
	                 var newSharedReference = new websheet.parse.SharedReferenceRef(newRef, rowSize, colSize);
	                 var newSharedRefToken = new websheet.parse.RefToken();
	                 dojo.mixin(newSharedRefToken, refToken);
	 	             newSharedRefToken.setValue(newSharedReference);
	 	            if(!newSharedReference.isValid())
		            	newSharedRefToken._error = websheet.Constant.ERRORCODE["524"];
		    		else if(newSharedRefToken._error == websheet.Constant.ERRORCODE["524"])
		    			delete newSharedRefToken._error;
	                
	                 refTokensArray.push(newSharedRefToken);
	                 newSharedFormulaRef.pushRefToken(newSharedRefToken, true);
	                 areaManager.startListeningArea(newRef, newSharedFormulaRef, newSharedReference);
	    		}else{
	    			var newToken = websheet.parse.FormulaParseHelper.generateRefTokenByCopyToken(refToken, null, newSharedFormulaRef, true);
	    			refTokensArray.push(newToken);
	    		}
	   		}
	   		//create new ruelsObj with the tokenarray.
	   		this._createRulesObj(newSharedFormulaRef, doc);
	 	 }
	},
	
	_undoData: function()
	{
		var rulesObj = this.data;
		var json = rulesObj.getJSON4Range(this._getRangeInfo(), this);
		return json;
	},
	
	/*
	 * set dirty to cached data and cached result
	*/
	_FormulaDirtyValue: function(ref, dirtyFlag){
		var rulesObj = this.data;
		dirtyFlag = rulesObj.getTokenIdxs(ref, this._refTokens, dirtyFlag);
		return dirtyFlag;
	},
	
	//Clear all cached data
	setDirtyAndUpdate: function(dirtyFlag, isUpdate, rangeInfo){
		 var rulesObj = this.data;
		 if(isUpdate)
			 this._isUpdate = true;
		 rulesObj.clearAllData(this._id, dirtyFlag);
	},
	
	updateTokens: function()
	{
		if(!this._isUpdate)
			return;
		delete this._isUpdate;
		if(!this._refTokens)
			return;
		for(var i=0;i<this._refTokens.length; i++)
		{
			var token = this._refTokens[i];
			var ref = token.getValue();
			if((ref instanceof websheet.parse.Reference) && !ref.isValid())
				token._error = websheet.Constant.ERRORCODE["524"];
			else if(token._error == websheet.Constant.ERRORCODE["524"])
				delete token._error;
		}
	},
	
	setRangeNotify: function(sender, range, manager){
		var size = sender.getEndRow() - sender.getStartRow();
	    var dsr = range.startRow - sender.getStartRow();
	    var der = range.endRow - sender.getStartRow();
	    dsr = dsr - sender._rowSize + 1;
	    if (dsr < 0) {
	        dsr = 0;
	    }
	    if (der > size) {
	        der = size;
	    }
	    
	    size = sender.getEndCol() - sender.getStartCol();
	    var dsc = range.startCol - sender.getStartCol();
	    var dec = range.endCol - sender.getStartCol();
	    dsc = dsc - sender._colSize + 1;
	    if (dsc < 0) {
	        dsc = 0;
	    }
	    if (dec > size) {
	        dec = size;
	    }
	    
	    var rulesObj = this.data;
	    var dirtyFlag =  rulesObj.getTokenIdxs(sender, this._refTokens);
	   
	    rulesObj.clearData4Cell(this._id, dsr, dsc, der, dec, dirtyFlag);
	    this._clearResult(dsr, dsc, der, dec);
	},
	
	//do nothing
	_clearResult: function(dsr, dsc, der, dec){
	
	},
	//do nothing
	setCurrRangeNotify: function(data, area, refValue){
		
	},
	
	_optOnEdgeRanges: function(updateRange, rowDelta, colDelta)
	{
		if (rowDelta < 0) {
			var startRow = updateRange.startRow + rowDelta;
			var endRow = updateRange.startRow - 1;
			if ((startRow <= this._parsedRef.startRow && endRow >= this._parsedRef.startRow)
				||(startRow <= this._parsedRef.endRow && endRow >= this._parsedRef.endRow)) {
				return true;
			}
		}
		if (colDelta < 0) {
			var startCol = updateRange.startCol + colDelta;
			var endCol = updateRange.startCol - 1;
			if ((startCol <= this._parsedRef.startCol && endCol >= this._parsedRef.startCol)
				||(startCol <= this._parsedRef.endCol && endCol >= this._parsedRef.endCol)	) {
				return true;
			}
		}
		return false;
	},
	
	splitSharedReferences: function(updateRange, rowDelta, colDelta, doc)
	{
		var areaManager = doc.getAreaManager();	
		var bRow = rowDelta ? true : false;
		if (this.data.isSplitable(bRow)) {
			areaManager.addSharedRef4InsertUndo(this);
			this.inherited(arguments);
		}
		else {						
			this.data.clearAll(this._id);
			if (rowDelta < 0 || colDelta < 0) {
				if (this._optOnEdgeRanges(updateRange, rowDelta, colDelta)) {
					areaManager.addSharedRef4DeleteUndo(this);
				}
			}
	        this.updateAddress(updateRange, rowDelta, colDelta, doc);
	        this.setDirtyAndUpdate(true, true);
		}
	}
});