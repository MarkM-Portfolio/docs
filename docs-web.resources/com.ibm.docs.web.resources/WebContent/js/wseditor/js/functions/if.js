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

dojo.provide("websheet.functions.if");
dojo.require("websheet.functions.choose");
dojo.declare("websheet.functions.if", websheet.functions.choose, {
	
	constructor: function() {
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 3;
		this._bIf = true;
	}
});