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

dojo.provide("concord.widgets.LoadingBox");
dojo.require("concord.widgets.CommonDialog");

dojo.declare("concord.widgets.LoadingBox", [concord.widgets.CommonDialog], {
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function(object, title, oklabel, visible, params) {
		visible = false;
		this.okVisible = false;
		this.closeVisible = false;
		this.inherited( arguments );
	}
});
