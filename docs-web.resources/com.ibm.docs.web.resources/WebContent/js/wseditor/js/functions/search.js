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

dojo.provide("websheet.functions.search");
dojo.declare("websheet.functions.search", websheet.functions.FormulaBase, {
	
	charEQ: null,
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 3;
		this.inherited(arguments);
	},
	
	/*string*/calc: function() {
		// not case sensitive
		var values = this.args;
		var find_text;
		var text;
		var type0 = values[0].getType();
		var type1 = values[1].getType();
		if(type0 == this.tokenType.SINGLEQUOT_STRING)
			throw websheet.Constant.ERRORCODE["525"];
			
		if(type1 == this.tokenType.SINGLEQUOT_STRING || type1 == this.tokenType.NONE_TOKEN)
			throw websheet.Constant.ERRORCODE["525"];

		var start = 1;
		if (values.length == 3){
			var type2 = values[2].getType();
			if(type2 == this.tokenType.NONE_TOKEN)
				throw websheet.Constant.ERRORCODE["519"];
			
			start = parseInt(this.getValue(this.fetchScalaResult(values[2]),type2, this.LOCALE_NUM));
		}
	
		if(type0==this.tokenType.NONE_TOKEN)
			return 1;
		
		var v = this.fetchScalaResult(values[1],false,true);
		if(typeof v == "string")
		{
			if(v.length==0)
				throw websheet.Constant.ERRORCODE["519"];
			text=websheet.BrowserHelper._composeByLocale(v);
		}
		else
			text = v + "";
			
		if (start < 1) 
			throw websheet.Constant.ERRORCODE["519"];
		if (start > text.length)
			throw websheet.Constant.ERRORCODE["519"]; // 525 instead?
		
		if (start != 1)
		{
			// dojo string's index starts with 0
			text = text.substr(start-1);
			if(text.length==0)
				throw websheet.Constant.ERRORCODE["519"];
		}
			
		v = this.fetchScalaResult(values[0],false,true);
		if(typeof v == "string")
		{
			if(v.length==0)
			{
				return start;
			}
			else
			{
				find_text=websheet.BrowserHelper._composeByLocale(v);
				find_text = this.wildcardMapping(find_text);
			}
		}
		else
			find_text = v + "";
		
		var pos = -1;
		var reg = new RegExp(find_text,"i");
		pos = text.search(reg);
			
		if (pos == -1) 
			throw websheet.Constant.ERRORCODE["519"];
		
		return start + pos;
	}
});