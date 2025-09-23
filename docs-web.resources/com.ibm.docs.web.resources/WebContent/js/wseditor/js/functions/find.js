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

dojo.provide("websheet.functions.find");

dojo.declare("websheet.functions.find", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 3;
		this.inherited(arguments);
	},
	
	/*int*/calc: function() {
		// case sensitive
		var values = this.args;
		var type0 = values[0].getType();
		var type1 = values[1].getType();
		if(type0 == this.tokenType.SINGLEQUOT_STRING)
			throw websheet.Constant.ERRORCODE["525"];  //#NAME?
			
		if(type1 == this.tokenType.SINGLEQUOT_STRING)
			throw websheet.Constant.ERRORCODE["525"];

		var start = 1;
		if (values.length == 3){
			var type2 = values[2].getType();
			if(type2==this.tokenType.NONE_TOKEN)
				throw websheet.Constant.ERRORCODE["519"]; //#VALUE!
			start = parseInt(this.getValue(this.fetchScalaResult(values[2]),type2, this.LOCALE_NUM));
		}
	
		var find_text = this._fetchText(type0, values[0]);
		var text = this._fetchText(type1, values[1]);
		
		if (start < 1) 
			throw websheet.Constant.ERRORCODE["519"];
		if (start - 1 > text.length)
			throw websheet.Constant.ERRORCODE["519"]; // 525 instead?
		
		if (start > 1)
		{
			// dojo string's index starts with 0
			text = text.substr(start-1);
			if(text.length==0)
				throw websheet.Constant.ERRORCODE["519"];
		}
		
		var pos = text.indexOf(find_text);
		if (pos == -1) 
			throw websheet.Constant.ERRORCODE["519"];
		
		return start + pos;
	},
	_fetchText: function(type, value){
		var text;
		if(type==this.tokenType.NONE_TOKEN){
			return "";
		}
		
		var v = this.fetchScalaResult(value,true,true);
		var vType = typeof v;
		if(vType == "string")
		{
			// compose text by locale. decompose may cause increase of find index.
			text = websheet.BrowserHelper._composeByLocale(v);
		} else if( vType == "boolean"){
			text = (v + "").toUpperCase();
		}
		else {
			text = v + "";
		}
		return text;
	}
});