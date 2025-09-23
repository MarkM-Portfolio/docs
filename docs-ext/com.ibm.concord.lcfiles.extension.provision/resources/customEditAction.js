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

dojo.provide("concord.customEditAction");
dojo.require("lconn.files.action.impl.PromptAction");

dojo.declare("concord.customEditAction", [ lconn.files.action.impl.PromptAction ], {

	//opt for NLS strings.
	constructor : function(app, scene, opt) {
		this.inherited(arguments);
		this.app = app;
		//getNls call before in 'inherited', then mixin more here.
		this.nls = dojo.mixin(this.nls, {
			OK : opt.OK,
			OkTitle : opt.OkTitle,
			editWithDocsDialogTitle : opt.editWithDocsDialogTitle
		});
	},

	getNls : function(app) {
		return concord.global.nls;
	},

	//opt for other options.
	createDialog : function(item, opt, dialog) {
		opt = dojo.mixin(opt, {
			title : this.nls.editWithDocsDialogTitle
		});
		this.dialog = dialog;
		dijit.setWaiState(dialog.domNode,'describedby', 'edit_in_ibm_docs_dec_div');
		//this.dialog.attr("style","width: 505px;");
		if (typeof (item) != "undefined" && item != null) {
			this.file = item;
		}
		this.inherited(arguments);
	},

	renderQuestion : function(d, el, item, opt) {
		var div = d.createElement("div");
		dojo.attr(div, "class", "lotusFormField");
		dojo.attr(div, "id", "edit_in_ibm_docs_dec_div");
		el.appendChild(div);
		dojo.create('p', {
			innerHTML : this.sentence1
		}, div);
		dojo.create('p', {
			innerHTML : this.sentence2
		}, div);
	},

	onSuccess : function() {
		var fid = this.file.getId();
		window.open(concord.global.getDocEditURL(fid), concord.global.hashWinNameFromId(fid));
	}
});
