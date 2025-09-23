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

dojo.provide("concord.widgets.EndSessionDlg");
dojo.require("dijit.Dialog");
dojo.require("concord.util.uri");
dojo.require("concord.widgets.concordDialog");

dojo.declare("concord.widgets.EndSessionDlg", [concord.widgets.concordDialog],{
	
	nls:null,
	noticeId: "EndSessionDlgNoticeMsg",
	
	constructor: function() {		
		
	},
	
	setDialogID: function() {
		this.dialogId = "C_d_EndSessionDlg";
	},	
	
	createContent: function (contentDiv) {		
		dojo.attr(contentDiv, {"style": "width: 450px;"});
		dojo.addClass(contentDiv, 'option-content');
		
		var noticeDiv = dojo.create('div', {id: this.noticeId, 'class': 'option-notice'}, contentDiv);
		this.describedInfoId = noticeDiv.id;
				  	
		noticeDiv.innerHTML = this.params.message;
	},
	
	onOk: function()
	{
		if(concord.util.uri.isECMDocument() || concord.util.uri.isExternalCMIS())
		{
			pe.scene.closeOrRedirectToSummaryPage();
		}		
	}
});
