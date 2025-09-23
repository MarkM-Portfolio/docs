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

dojo.provide("websheet.functions.rand");

dojo.declare("websheet.functions.rand", websheet.functions.FormulaBase, {
	
	constructor: function() {
		this.minNumOfArgs = 0;
	},
	
	/*number*/calc: function() {		
		return Math.random();
	}
});