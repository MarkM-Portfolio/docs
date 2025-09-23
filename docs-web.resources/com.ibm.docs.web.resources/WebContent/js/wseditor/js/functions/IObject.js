/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.functions.Object");
websheet.functions.Object = {
	JS: true,  // change it to false in Node.js
	calculator: null, //set it to calculator when in Node.js
	
	/*boolean*/isCell: function(obj) {
		return obj instanceof websheet.functions.Cell;
	},
		
	/*boolean*/isArea: function(obj) {
		return obj instanceof websheet.parse.Area;
	},
	
	/*boolean*/isReference: function(obj) {
		// can not use generic reference here because websheet.parse.Reference isn't its subclass 
		// return obj instanceof websheet.functions.Reference;
		if (this.JS) {
			return obj instanceof websheet.parse.Reference;
		} else {
			return obj instanceof websheet.functions.Reference;
		}
	},
	
	/*boolean*/isToken: function(obj) {
		return obj instanceof websheet.parse.tokenBase;  
	},
	
	/*boolean*/isFormulaToken: function(obj) {
		return obj instanceof websheet.parse.token;
	},
	
	/*boolean*/isFormulaTokenList: function(obj) {
		return obj instanceof websheet.parse.tokenList;
	},

	/*array*/getRows: function(sheetName, startRow, endRow, followStyle) {
		if (this.JS) {
			var rangeInfo = {sheetName: sheetName, startRow: startRow, endRow: endRow};
			var rows = websheet.model.ModelHelper.getRows(rangeInfo, true, followStyle);
			return rows ? rows.data : null;
		} else {
			// to be implemented in Node.js
			console.log("need to implement getRows function");
		}
	},
	
	/*document*/getDocument: function() {
		if (this.JS)
			return websheet.model.ModelHelper.getDocumentObj();
		else {
			return this.calculator.getDocument();
		}
	},
	
	/*sheet*/getSheet: function(sheetName) {
		return this.getDocument().getSheet(sheetName);
	},
	
	/*idmanger*/getIDManager: function() {
		if (this.JS)
			return this.getDocument()._getIDManager();
		else {
			return this.calculator.getIDManager();
		}
	},
	
	newReference: function(address, sheetName) {
		if(this.JS){
			return new websheet.parse.Reference(address, sheetName);
		}else{
			return this.calculator.newReference(address, sheetName);
		}
	},
	
	setCalculator: function(cal) {
		this.calculator = cal;
	}
};

dojo.provide("websheet.functions.IObject");
dojo.declare("websheet.functions.IObject", null, {
	/*object*/getValue: function() {
	}
});

dojo.provide("websheet.functions.Cell");
dojo.declare("websheet.functions.Cell", websheet.functions.IObject, {
	// cell's raw Value
	getValue: function() {
	},

	// cell's calculated value	
	getComputeValue: function() {
	},
	
	// cell's formula string with correct priorization
	getFormulaValue: function() { 	
	},
	
	// is if formula cell?
	/*boolean*/isFormula: function() {
	},
	
	// cell value is number?
	/*boolean*/isNumber: function() {
	},
	
	/*boolean*/isBoolean: function() {
	},
	
	/*boolean*/isString: function() {
	},
	
	/*boolean*/isError: function() {
	},
	
	/*error*/getError: function() {
	},
	
	/*string*/getSheetName: function() {
	},
	
	/*int*/getRow: function() {
	},
	
	getRowId: function() {
	},
	
	/*int*/getCol: function() {
	},
	
	getColId: function() {
	},
	
	getAddress:function() {
	},
	
	/*row*/_getParent: function() {
	},
	
	/*sheet*/_getSheet: function() {
	},
	
	/*document*/_getDocument: function() {
	},
	
	/*void*/setLink: function(link) {
	},
	
	/*void*/setErrProp: function(errProp) {
	},
	
	/*string*/getEditValue: function() {
	},
	
	/*void*/setError: function(error) {	
	},
	
	/*prop*/getErrProp: function() {
	},
	
	/*void*/setComputeValue: function(value) {
	},
	
	/*Area*/getArea: function(id) {
	},
	
	/*void*/pushRef: function(ref) {
	},
	
	/*void*/deleteRef: function(ref) {
	},
	
	/*void*/clearRefs: function() {
	},
	
	/*websheet.parse.tokenList*/newTokenList: function() {
	},
	
	setCellToken:function(tokens){
	},
	
	/*websheet.parse.tokenList*/getCellToken:function(){
	},
	
	/*void*/clearCellToken: function() {
	}
});

dojo.provide("websheet.functions.Row");
dojo.declare("websheet.functions.Row", websheet.functions.IObject, {
	////////////////////////////////////////////
	/*boolean*/isFiltered: function() {
	},
	
	/*boolean*/isVisible: function() {
	}
});

dojo.provide("websheet.functions.Sheet");
dojo.declare("websheet.functions.Sheet", websheet.functions.IObject, {
	/*int*/getIndex: function() {
	}
});

dojo.provide("websheet.functions.Document");
dojo.declare("websheet.functions.Document", websheet.functions.IObject, {
	/*AreaManager*/getAreaManager: function() {
	},
	
	/*boolean*/isSheetExist: function(sheetName, bSheetId) {
	}
});

dojo.provide("websheet.functions.IDManager");
dojo.declare("websheet.functions.IDManager", websheet.functions.IObject, {
	/*string*/getSheetNameById: function(/*string*/id) {
	},
	
	/*int*/getRowIndexById: function(/*string*/id) {
	},
	
	/*int*/getColIndexById: function(/*string*/id) {
	}
});

dojo.provide("websheet.functions.Reference");
dojo.declare("websheet.functions.Reference", null, {
	///////////////////////////////////////////////////////////
	
	_getRangeInfo: function() {
	},
	
	/*string*/getSheetName: function() {
	},
	
	/*boolean*/isSingleCell: function() {
	},

	/*boolean*/isValid: function() {
	},

	/*string*/getId: function() {	
	},
	
	/*type*/getType: function() {
	},
	
	/*Cell*/getCell:function(rowIndex, colIndex, bModel, bIgnoreError) {
	}
	
//	/*array*/getCells: function(bModel, bIgnoreError) {
//	},
	
//	/*array*/getCols: function(bModel, bOptimize, bIgnoreError) {
//	},
//	
//	/*array*/getRows: function(bModel, bOptimize, bIgnoreError) {
//	}
});