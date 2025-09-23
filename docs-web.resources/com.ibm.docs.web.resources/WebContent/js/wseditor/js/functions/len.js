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

dojo.provide("websheet.functions.len");
dojo.require("websheet.functions.FormulaBase");
dojo.require("concord.i18n.utf");

dojo.declare("websheet.functions.len", websheet.functions.FormulaBase, {
	
	_isLenb: false,
	
	constructor: function() {
		this.maxNumOfArgs = 1;
	},
	
	/*int*/calc: function() {
		var value = this.args[0];
		var type = value.getType();
		var scalaResult = this.fetchScalaResult(value,false,true);
		// when choose formula return NONE_TOKEN, scalaResult will be null
		if(scalaResult == null)
			return 0;
		
		var stringValue = null;
		if(typeof scalaResult == "boolean")
			stringValue = Boolean(scalaResult)? "TRUE": "FALSE";
		else {
			stringValue=this.getValue(scalaResult, type);
			stringValue=websheet.BrowserHelper._composeByLocale(stringValue);
		}
		return this._calcLen(stringValue);
	},
	_calcLen: function(stringValue){
		var nlen = 0;
		for(var i=0;i<stringValue.length;i++)
        {
            var c = stringValue.charCodeAt(i);
            if(concord.i18n.utf.U16_IS_SURROGATE(c))
            {
                if(concord.i18n.utf.U16_IS_SURROGATE_LEAD(c))
                    continue; // ignore the first surrogate
                else
                	nlen += this._isLenb? 2:1;                		
            } else {
            	if(this._isLenb && concord.i18n.CharCategory.isCJK(c))
            		nlen += 2;
            	else
            		nlen++;
            }
        }
		return nlen;
	}
});