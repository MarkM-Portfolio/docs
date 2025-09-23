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

dojo.provide("websheet.functions.rightb");
dojo.require("websheet.functions.FormulaBase");

dojo.declare("websheet.functions.rightb", websheet.functions.left, {
	
	constructor: function() {
		this.bLeft = false;
		this.bRight = false;
		this.bRightB = true;
	}
});