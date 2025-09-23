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

dojo.provide("concord.customDownloadAction");
dojo.require("lconn.files.action.impl.PromptAction");

dojo.declare("concord.customDownloadAction", [ lconn.files.action.impl.PromptAction ], {
	showProgressBar : false,
	isContinueDownload : true,

	// opt for NLS strings.
	constructor : function(app, scene, opt) {
		this.inherited(arguments);
		// getNls call before in 'inherited', then mixin more here.
		this.nls = dojo.mixin(this.nls, {
			OK : opt.OK,
			OkTitle : opt.OkTitle,
			DOWNLOAD_TITLE : opt.DOWNLOAD_TITLE
		});
	},

	getNls : function(app) {
		return concord.global.nls;
	},

	// opt for other options.
	createDialog : function(item, opt, dialog) {
		opt = dojo.mixin(opt, {
			title : this.nls.DOWNLOAD_TITLE,
			showProgressBar : this.showProgressBar
		});
		this.dialog = dialog;
		dijit.setWaiState(dialog.domNode,'describedby', 'download_in_ibm_docs_dec_div');
		if (typeof (item) != "undefined" && item != null) {
			this.file = item;
		}
		this.windowOpenCommand = opt.windowOpenCommand;
		this.inherited(arguments);
	},

	renderQuestion : function(d, el, item, opt) {
		var div = d.createElement("div");
		dojo.attr(div, "class", "lotusFormField");
		dojo.attr(div, "id", "download_in_ibm_docs_dec_div");
		el.appendChild(div);
		dojo.create('p', {
			innerHTML : this.sentence1
		}, div);
		dojo.create('p', {
			innerHTML : this.sentence2
		}, div);
	},

	onSuccess : function() {
		if (typeof (this.windowOpenCommand) != "undefined" && this.windowOpenCommand != null) {
			this.windowOpenCommand();
		}
	}
});
