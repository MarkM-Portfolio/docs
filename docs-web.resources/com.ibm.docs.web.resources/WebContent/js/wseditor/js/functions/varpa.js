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
dojo.provide("websheet.functions.varpa");
dojo.require("websheet.functions.stdevpa");
dojo.declare("websheet.functions.varpa", websheet.functions.stdevpa, {
	constructor: function() {
		this.maxNumOfArgs = 255;
		this.minNumOfArgs = 1;
		this.bVAR = true;
	}

//    actionWhenErr:function(obj,value, bNumber, bBoolean){ // the value is number.
//    	if(!bNumber){
//    		if(!value){ // value is not equal to empty string
//    			obj.errMsg = websheet.Constant.ERRORCODE["532"];
//    			obj.errCount += 1;
//    		}else{
//    			obj.calculateCount += 1;
//    		}
//    		return true;
//    	}
//    	return false;
//    } 
});