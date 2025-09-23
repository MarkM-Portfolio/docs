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

dojo.provide("websheet.functions.sign");

dojo.declare("websheet.functions.sign", websheet.functions.FormulaBase, {

	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	/*int*/calc: function(){
		var parm = this.getNumValue(this.args[0]);
		
		if(parm > 0)
			return 1;
		else if(parm < 0)
			return -1;
		else 
			return 0;
	}
	
});