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

dojo.provide("websheet.functions.type");

dojo.declare("websheet.functions.type", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
	},
	
	/*int*/calc: function() {
		var value = this.args[0];
		var type = value.getType();
		switch (type) {
			case this.tokenType.NONE_TOKEN:
				return 1;
			case this.tokenType.NUMBER_TOKEN:
			case this.tokenType.PERCENT_TOKEN:
				return 1;
			case this.tokenType.DOUBLEQUOT_STRING:
				return 2;
			case this.tokenType.BOOLEAN_TOKEN:
				return 4;
			case this.tokenType.SINGLEQUOT_STRING:
			case this.tokenType.ERROR_TOKEN:
				return 16;
			case this.tokenType.ARRAYFORMULA_TOKEN:
				return 64; 
			default:
				break;
		}
		
		if(value.getError())
		    return 16;
		
		if (this.Object.isFormulaTokenList(value)) {		
			var	result = this.analyzeToken(value);

			// return 64 for array
			if (dojo.isArray(result))
				return 64;
			else if (result.errorCode)
				return 16;
			else if(typeof result=="string")
				return 2;
			else if(typeof result=="boolean")
				return 4;
			else if(typeof result=="number")
				return 1;
		}

		try{
			value = this.fetchScalaResult(value);
		}catch(e){
			return 16;
		}
						
		if(
			type == this.tokenType.RANGEREF_TOKEN ||
			type == this.tokenType.NAME ||
			type == this.tokenType.OPERATOR_TOKEN ||
			type == this.tokenType.BRACKET_TOKEN){
			if(this.isNum(value)){
				try{
					if(this.fetchScalaBoolean(result))
						return 4;
					return 1;
				}catch(e){
					return 16;
				}
			}
			return 2;
		}			
		
		throw websheet.Constant.ERRORCODE["502"];
	}
});