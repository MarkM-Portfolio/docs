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
dojo.provide("viewer.widgets.MessageBox");
dojo.require("viewer.widgets.CommonDialog");

dojo.declare("viewer.widgets.MessageBox", [viewer.widgets.CommonDialog], {
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function(object, title, oklabel, visible, params ) {
		visible = false;
		this.describedInfoID="describedInfoId_"+(new Date()).getTime();
		this.inherited( arguments );
	},
	onOk: function (editor) {
		if( this.params.callback )
			this.params.callback(editor);
	}
});
