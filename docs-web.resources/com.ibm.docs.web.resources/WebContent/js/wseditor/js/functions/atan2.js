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

dojo.provide("websheet.functions.atan2");

dojo.declare("websheet.functions.atan2", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
		this.inherited(arguments);
	},
	
	/*number*/calc: function(){
		var values = this.args; 
		//if(values[0].getType()==this.tokenType.NONE_TOKEN||values[1].getType()==this.tokenType.NONE_TOKEN)
		//	throw websheet.Constant.ERRORCODE["511"];//Missing variable
		var parm1 = this.getNumValue(values[0]);
		var parm2 = this.getNumValue(values[1]);
		if(parm1==0 && parm2==0)
			throw websheet.Constant.ERRORCODE["532"];
		return Math.atan2(parm2,parm1);
	}
	
	
});