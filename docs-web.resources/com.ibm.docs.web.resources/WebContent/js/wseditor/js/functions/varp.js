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
dojo.provide("websheet.functions.varp");
dojo.require("websheet.functions.stdevp");
dojo.declare("websheet.functions.varp", websheet.functions.stdevp, {
	constructor: function() {
		this.maxNumOfArgs = 255;
		this.minNumOfArgs = 1;
		this.bVAR = true;
	}
//    varStrategy : function(obj){
//    	if(obj.calculateCount != 0){
//    		var result = websheet.Math.div(obj.sum ,obj.calculateCount,true);
//    		return result;
//    	}
//    }
});