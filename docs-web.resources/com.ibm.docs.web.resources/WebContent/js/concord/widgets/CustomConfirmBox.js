/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.widgets.CustomConfirmBox");
dojo.require("concord.widgets.CommonDialog");

dojo.declare("concord.widgets.CustomConfirmBox", [concord.widgets.CommonDialog], {
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function(object, title, oklabel, visible, params ) {
		visible = true;
		this.describedInfoId = "describedConfirmInfoId_" + (new Date()).getTime();
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
	},
	/*
	 * User is able to custom the return focus
	 */
	returnFocus : function(){
    	  
	}	
});