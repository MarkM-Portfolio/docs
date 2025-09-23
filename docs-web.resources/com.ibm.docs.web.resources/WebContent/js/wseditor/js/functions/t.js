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

dojo.provide("websheet.functions.t");
dojo.declare("websheet.functions.t",websheet.functions.FormulaBase, {
		constructor: function() {
			this.maxNumOfArgs = 1;
			this.inherited(arguments);
		},
	    calc: function() {
			var value = this.args[0];
			var type = value.getTokenType();
			var myValue = this.fetchScalaResult(value,false);		 
			if(typeof myValue == "number"||typeof myValue == "boolean") {
				return "";
			}
			myValue = this.getValue(myValue,type);
			return myValue;
	    }
});