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
dojo.provide("viewer.widgets.ConfirmBox");
dojo.require("viewer.widgets.CommonDialog");

dojo.declare("viewer.widgets.ConfirmBox", [viewer.widgets.CommonDialog], {
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function(object, title, oklabel, visible, params ) {
		visible = true;
		this.inherited( arguments );
	},

	onOk: function (editor) {
		this.params.callback(editor, true, true);
	},

	onNo: function (editor) {
		this.params.callback(editor, true, false);
	},

	onCancel: function (editor) {
		this.params.callback(editor, false);
	}
	
});
