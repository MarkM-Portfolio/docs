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

dojo.provide("websheet.functions.trim");

dojo.declare("websheet.functions.trim", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.maxNumOfArgs = 1;
	},
	
	/*string*/calc: function(){
		var value = this.args[0];
		var parm = this.fetchScalaResult(value,false,true); 
		var type = value.getType();
		parm = this.getValue(parm, type);
		
		return parm.replace(/(^\s+)|(\s+$)/g, "").replace(/(\s)+/g, " ");
	}
});