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

dojo.provide("websheet.view.Settings");
dojo.require("dojo.cookie");
dojo.declare("websheet.view.Settings", concord.main.Settings, {
	
	// override concord.main.settings and set extend contents in cell in cookie instead.	
	constructor: function() {
	},
		
	/*boolean*/getShowUnsupportedFeature: function() {
		// never show unsupported diloag
		return false;
	},
	
	/*boolean*/getShowWelcome: function() {
		// never show welcome dlg in view
		return false;
	},

	getSidebar: function() {
		return this.SIDEBAR_COLLAPSE;
	},

	setSidebar: function() {
		return;
	}
});