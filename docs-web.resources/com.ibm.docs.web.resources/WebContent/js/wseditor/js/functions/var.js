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

dojo.provide("websheet.functions.var");
dojo.require("websheet.functions.stdev");

dojo.declare("websheet.functions.var",websheet.functions.stdev, {
	
	constructor: function() {
		this.maxNumOfArgs = 255;
		this.minNumOfArgs = 1;
		this.bVAR = true;
	}
});