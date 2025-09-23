/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.widgets.FloatBox");
dojo.require("viewer.widgets.CommonDialog");

// This dialog is a modal dialog, which cannot be closed by user action
// There's no ok/cancel/close button on it.
// User cannot close the dialog by ESC either.
// It can be used as progress bar, or loading dialog ...
dojo.declare("viewer.widgets.FloatBox", [viewer.widgets.CommonDialog], {
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function(object, title, oklabel, visible, params) {
		visible = false;
		this.okVisible = false;
		this.closeVisible = false;
		this.inherited( arguments );
	},
	
	show: function() {
		this.inherited(arguments);
		
		// override the hide function to disable ESC key
		// for more detail, refer dijit.Dialog 
		this.dialog._hide_ = this.dialog.hide;
		this.dialog.hide = function() {
			// do nothing
		}
	},
	
	hide: function() {
		if(this.dialog == null) return;
		
		this.dialog._hide_();
	}
});
