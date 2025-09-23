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

dojo.provide("concord.widgets.ModelDialog");
dojo.require("concord.widgets.CommonDialog");
dojo.declare("concord.widgets.ModelDialog", [concord.widgets.CommonDialog], {

	constructor: function(object, title, oklabel, visible, params) {
		visible = false;
		
		// Make all buttons invisible in some cases where custom html content has its own buttons 
		if (params.okVisible === false)
			this.okVisible = false;
		
		var sceneStrs = dojo.i18n.getLocalization("concord.scenes","Scene");
		oklabel = sceneStrs.close;
		
		this.inherited(arguments);
	},

	createContent: function (contentDiv) {
		// TODO add sandBoxFrame here
		
		var content = this.params.content ? this.params.content : "";
		dojo.create('div', {innerHTML: content}, contentDiv);
	},
	
	postCreate: function() {
		dojo.style(this.dialog.domNode, "width", this.calcWidth());
	},
	
	calcWidth: function() {
		var width = this.params.width ? this.params.width : 400;
		return width + "px";
	}
});