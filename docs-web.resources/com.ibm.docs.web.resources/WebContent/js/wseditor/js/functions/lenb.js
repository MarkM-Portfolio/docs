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

dojo.provide("websheet.functions.lenb");
dojo.require("websheet.functions.FormulaBase");
dojo.require("concord.i18n.CharCategory");

dojo.declare("websheet.functions.lenb", websheet.functions.len, {
	
	constructor: function() {
		this.maxNumOfArgs = 1;
		if(this._checkDBCS())
			this._isLenb = true;
	},
	_checkDBCS: function(){
		return this.isCJKLocale();
	}
});