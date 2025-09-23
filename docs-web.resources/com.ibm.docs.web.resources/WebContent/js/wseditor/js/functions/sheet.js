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

dojo.provide("websheet.functions.sheet");

dojo.declare("websheet.functions.sheet", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 0;
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	/*int*/calc: function(context) {
		var values = this.args;
		var sheetName = null;
		if(values == undefined || values == null){
			//TODO: should be the sheet contains this formula, rather than current sheet
			var cell = context.currentCell;
			sheetName = cell.getSheetName();
		} else {		
			var result = this.analyzeToken(values[0]);
			if (dojo.isArray(result)) {
				var res = this.analyzeToken(result[0]);
				if (this.isRangeObj(res)) {
					if (result.length == 1)
						result = res;		
				} else
					throw  websheet.Constant.ERRORCODE["7"];//#N/A  sheet({1,2})
			}
			if(this.isRangeObj(result)){
				sheetName = result.getSheetName();
				if(sheetName == null){
					var cell = context.currentCell;
					sheetName = cell.getSheetName();
				}
			}else if(typeof result == "string"){
				sheetName = result;
			}
			
			if(dojo.isArray(result))
				throw websheet.Constant.ERRORCODE["519"];
		}

		if(sheetName != null){
			var curSheet = this.Object.getSheet(sheetName);
			if(curSheet){
				var sheetIndex = curSheet.getIndex();
				if(sheetIndex > 0)
					return sheetIndex;
			}
		}
		
		throw websheet.Constant.ERRORCODE["502"];
	}
});