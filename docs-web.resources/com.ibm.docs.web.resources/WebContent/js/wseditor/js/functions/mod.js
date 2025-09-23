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

dojo.provide("websheet.functions.mod");

dojo.declare("websheet.functions.mod", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
	},
	
	/*number*/calc: function(){//mod(m, divisor)
		var values= this.args; 
		var parmM = this.getNumValue(values[0]);
		var divisor = this.getNumValue(values[1]);
		if(divisor == 0)
			throw websheet.Constant.ERRORCODE["532"];// Division by zero
			
		//=MOD(M,N)=M - N * INT(M/N)
		var tmp = Math.floor(websheet.Math.div(parmM, divisor));
		if(!isFinite(tmp))
			throw websheet.Constant.ERRORCODE["504"]; //#NUM
			
		var remainder = websheet.Math.sub(parmM, websheet.Math.mul(divisor, tmp)); 
			
		return remainder;
	}
});