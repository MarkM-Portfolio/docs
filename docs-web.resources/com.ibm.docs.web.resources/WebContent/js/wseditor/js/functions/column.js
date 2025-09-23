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
dojo.provide("websheet.functions.column");
dojo.declare("websheet.functions.column", websheet.functions.FormulaBase, {	
	constructor: function() {
		this.minNumOfArgs = 0;
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	/*int*/calc: function(context) {
		//clear all the update tokens
		var cell = context.currentCell;
		context.currentToken.removeAllUpdateRefToken(cell);
		var values = this.args;
		if(values == undefined || ((values.length == 1) && this._isNoneToken(values[0]))){
			// Need to establish the cell reference relationship between this cell and 
			// one range token in this sheet, otherwise the cell can't be treated as
			// one impacted cell when insert/delete row or column
			var sheetName = cell.getSheetName();
			var c = cell.getCol();
			var r = cell.getRow();
			var pRef = new websheet.parse.ParsedRef(sheetName, r, c, r, c, websheet.Constant.RANGE_MASK);
			var updateToken = this.generateUpdateToken(context.currentToken, pRef, sheetName, cell);
       		updateToken.setProp(websheet.Constant.RefType.IGNORESET | websheet.Constant.RefType.CAREPOSITION);
			return c;
       	}
		
		var value = values[0];
		if(value && value.getError())
			this._throwError(value.getError(), value);
		var c = this.analyzeToken(value);
		if(dojo.isArray(c)) {
			if(c.length == 1)
				c = this.analyzeToken(c[0]);
			else
				throw websheet.Constant.ERRORCODE["524"];
		}
				
		if(this.isRangeObj(c)){
			value.setProp(websheet.Constant.RefType.IGNORESET | websheet.Constant.RefType.CAREPOSITION);
			var a = c._getRangeInfo();
			return a.startCol;
		}else{
			throw websheet.Constant.ERRORCODE["502"];
		}
	}
});