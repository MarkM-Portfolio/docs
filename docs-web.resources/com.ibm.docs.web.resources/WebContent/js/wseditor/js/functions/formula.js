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

dojo.provide("websheet.functions.formula");

dojo.declare("websheet.functions.formula", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		this.inherited(arguments);
	},
	
	/*string*/calc: function() {
		var value = this.args[0];
		var result = this.analyzeToken(value);
		if(this.isRangeObj(result)){
			var cell = this.getScalaCell(result, true,value);// should ignore the formula error		 			
			if(cell && cell.isFormula())
				return cell.getEditValue();
			else
				throw websheet.Constant.ERRORCODE["7"];				
		}else{
			if (value.getType() == this.tokenType.SINGLEQUOT_STRING)
				throw websheet.Constant.ERRORCODE["525"]; //"#NAME?"
			else				
				throw websheet.Constant.ERRORCODE["7"];
		}
	}
});