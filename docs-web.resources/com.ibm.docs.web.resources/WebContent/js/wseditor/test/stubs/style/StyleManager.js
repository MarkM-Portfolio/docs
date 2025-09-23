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

/****************************************************/
/* created by xie jinjing                           */
/*                                                  */
/* to store styles of a spreadsheet document	    */
/****************************************************/
dojo.provide("websheet.test.stubs.style.StyleManager");
dojo.provide("websheet.style.StyleManager");

dojo.declare("websheet.style.StyleManager", null, {
	
	constructor: function() {
		this.styleMap = {
				defaultcellstyle: {}
		};
		
		this._hashCodeIdMap = { };
	},
	
	getMapping: function(id) {
		// summary: dummy impl returns id
		return id;
	},
	
	addRefCount: function() {
		;
	},

	getStyleById: function(styleId)
	{
		return this.styleMap[styleId];
	}	
});
