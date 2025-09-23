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

dojo.provide("websheet.functions.indirect");

dojo.declare("websheet.functions.indirect", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 1;
		this.maxNumOfArgs = 2;			
	},
	
	/*int*/calc: function(context) {
		//clear all the update tokens
		context.currentToken.removeAllUpdateRefToken(context.currentCell);
		
		var values = this.args;
		var A1=true;
		if(values.length==2){
			type = values[1].getType();			
			A1= this.fetchScalaResult(values[1]);
			if(type == this.tokenType.SINGLEQUOT_STRING ){
				throw websheet.Constant.ERRORCODE["525"];
			}
			if(type == this.tokenType.DOUBLEQUOT_STRING){
				var parseResult = this.NumberRecognizer.parse(A1,false,true);
				if(!parseResult.isNumber)						
					throw websheet.Constant.ERRORCODE["519"];
				else {
					A1=parseResult.fValue;						
				}
			}else
				A1=this.getValue(A1,type,this.LOCALE_NUM);
			
			//TODO we do not support R1C1 style now
			if(!A1)
				throw websheet.Constant.ERRORCODE["519"];
		}
		
		var type = values[0].getType();
		if(type == this.tokenType.SINGLEQUOT_STRING ){
			throw websheet.Constant.ERRORCODE["525"];
		}
		if(type == this.tokenType.NONE_TOKEN ){
			throw websheet.Constant.ERRORCODE["524"]; //#ref!
		}
					
		return this.parseRef(values[0], context);
	},
	
	 parseRef: function(token, context){     
		var refText = String(this.fetchScalaResult(token,true,true)); 
		var pRef = websheet.Helper.parseRef(refText);
		
		var cell = context.currentCell;
		var sheetName = cell._getSheet().getSheetName();
		
		if(!pRef){
			if(websheet.Helper.isValidName(refText) == websheet.Constant.NameValidationResult.VALID){
				updateToken = this.generateUpdateToken(context.currentToken, refText, sheetName, cell);
			} else 
				throw websheet.Constant.ERRORCODE["524"]; 
		} else {
			if (!pRef.sheetName) {
				pRef.setSheetName(sheetName);
			} 
			updateToken = this.generateUpdateToken(context.currentToken, pRef, sheetName, cell);
		}
		
		var updateArea = updateToken.getValue();
		var usage = updateArea.getUsage();
		if(usage != websheet.Constant.RangeUsage.UNDEFINEDNAME) {
			
			updateToken.setProp(websheet.Constant.RefType.CAREPOSITION);
			
			var parsedRef = updateArea.getParsedRef();
			if(parsedRef.sheetName != sheetName){
				//need get partial if sheet is not loaded
				var doc = this.Object.getDocument();
				var controller = doc.controller;
				if(controller){
					var bPartial = controller.getPartial(parsedRef.sheetName);
					if(bPartial){
						var row = cell.getRow();
						var col = cell.getCol();
						var parsedRef = new websheet.parse.ParsedRef(sheetName,row, col, row, col, websheet.Constant.RANGE_MASK);
//						var range = new websheet.parse.Reference(parsedRef, "dummyId");
						
						controller._addNotify(parsedRef);
						throw websheet.Constant.ERRORCODE["2001"];
					}
				}
			}
			
			return updateToken;
		} 

		throw websheet.Constant.ERRORCODE["524"]; 
	}
});