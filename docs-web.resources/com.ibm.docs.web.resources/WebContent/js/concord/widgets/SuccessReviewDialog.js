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

dojo.provide("concord.widgets.SuccessReviewDialog");
dojo.requireLocalization("concord.util","dialogs");

dojo.declare("concord.widgets.SuccessReviewDialog", [concord.widgets.concordDialog], {
	isOverride: false,
	
	constructor: function(app, override) {
		this.dialog.titleNode.innerHTML = this.nls.title;
	},
	createContent: function (contentDiv) {
		var nls = dojo.i18n.getLocalization("concord.widgets","SuccessReviewDialog");
		this.nls = nls;		
		this.oKLabel = nls.okLabel;
		
		var noticeDiv = dojo.create('div', null, contentDiv);
		var time = concord.util.date.getTime();
		var notice = dojo.string.substitute(nls.notice, {'0': time});
		dojo.create('p', {innerHTML : notice}, noticeDiv);
	},

	onCancel: function (editor) {
		pe.scene.closeOrRedirectToSummaryPage();
	},

	onOk: function (editor) {
		pe.scene.closeOrRedirectToSummaryPage();
	}
});
