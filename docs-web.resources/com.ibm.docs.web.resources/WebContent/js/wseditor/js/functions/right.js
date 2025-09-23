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

dojo.provide("websheet.functions.right");
dojo.require("websheet.functions.FormulaBase");

dojo.declare("websheet.functions.right", websheet.functions.left, {
	
	constructor: function() {
		this.bLeft = false;
		this.bRight = true;
		this.bRightB = false;
	}
});