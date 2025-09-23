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

dojo.provide("concord.widgets.FileDeepDetectDialog");
dojo.require("concord.widgets.CommonDialog");

dojo.declare("concord.widgets.FileDeepDetectDialog", [concord.widgets.CommonDialog], {
	response : {},
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function(object, title, oklabel, visible, params) {
		visible = true;
		this.okVisible = true;
		this.response = params.response;
		this.describedInfoId = "fileDeepDetectInfoId_" + (new Date()).getTime();
		this.inherited( arguments );
	},
	
	onOk: function (editor) {
		this.params.callback(this.response, false);
	},

	onCancel: function (editor) {
		this.params.callback(this.response, true);
	}

});
