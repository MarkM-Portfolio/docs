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
dojo.provide("viewer.widgets.ProgressBar");
dojo.require("viewer.widgets.CommonDialog");

dojo.declare("viewer.widgets.ProgressBar", [viewer.widgets.CommonDialog], {
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function(object, title, oklabel, visible, params) {
		visible = true;
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
	},
	
	onCancel: function (editor) {
		this.params.callback(editor, false);
	}
});