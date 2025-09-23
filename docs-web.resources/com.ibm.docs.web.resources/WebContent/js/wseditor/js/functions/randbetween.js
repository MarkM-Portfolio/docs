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

dojo.provide("websheet.functions.randbetween");

dojo.declare("websheet.functions.randbetween", websheet.functions.floor, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
	},
	
	/*int*/calc: function() {
		var ret=0.0;
		var values = this.args;
		var bottom = this.fetchScalaResult(values[0],true); 
		var type = values[0].getType();
		if(type==this.tokenType.NONE_TOKEN)
			throw websheet.Constant.ERRORCODE["7"];
		
		bottom = this.getValue(bottom, type, this.LOCALE_NUM);
		bottom=Math.ceil(bottom);
		
		var top=this.fetchScalaResult(values[1],true); 
		type = values[1].getType();
		if(type==this.tokenType.NONE_TOKEN)
			throw websheet.Constant.ERRORCODE["7"];
		
		top = this.getValue(top, type, this.LOCALE_NUM);
		top=Math.ceil(top);
		if(top<bottom)
			throw websheet.Constant.ERRORCODE["502"];
		
		// make range as [bot, top + 1)
		ret = (Math.random()) * (top - bottom + 1) + bottom;
		// floor range to [bot, top]
		ret = Math.floor(ret);
		return ret;
	}
});