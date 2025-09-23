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

dojo.provide("concord.widgets.DraftConflictOptsDlg");
dojo.require("concord.main.App");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.beans.ProfilePool");
dojo.require("concord.util.user");
dojo.require("concord.util.date");
dojo.require("concord.util.uri");
dojo.require("concord.util.dialogs");

dojo.requireLocalization("concord.widgets", "DraftConflictOptsDlg");

dojo.declare("concord.widgets.DraftConflictOptsDlg", [concord.widgets.concordDialog],{
//	"-chains-": {
//		constructor: "manual"//prevent from calling super class constructor
//	},
	
	nls:null,
	noticeId: "conflictDlgNoticeMsg",
	
	constructor: function() {		
		this.dialog.titleNode.innerHTML = this.nls.title;		
	},
	
	setDialogID: function() {
		this.dialogId = "C_d_DraftConflictOptsDlg";
	},	
	
	createContent: function (contentDiv) {
		var nls = dojo.i18n.getLocalization("concord.widgets","DraftConflictOptsDlg");
		this.nls = nls;
		
		this.oKLabel = nls.openNewVersion;
		
		dojo.attr(contentDiv, {"style": "width: 450px;"});
		dojo.addClass(contentDiv, 'option-content');
		
		var doc = dojo.doc;
		var noticeDiv = dojo.create('div', {id: this.noticeId, 'class': 'option-notice'}, contentDiv);
		this.describedInfoId = noticeDiv.id;

		var photoUrl = concord.util.uri.getDefaultPhotoUri();
    	var user = ProfilePool.getUserProfile(DOC_SCENE.repoModifier);	    	
    	if(user)
    	{
		   	photoUrl = user.getPhotoUrl();
	    }			    		    									
		var imgPic = dojo.create('img', 
				{
					src: photoUrl,
					alt: 'Photo',
					'class': 'profile-pic'
				}
				, noticeDiv);	
		
		var notice = concord.util.dialogs.formatStrings4Modifier(nls.notice, DOC_SCENE.repoModifier, DOC_SCENE.repoModified);
		dojo.create('p', {innerHTML : notice}, noticeDiv);
		var para = dojo.create('p', {innerHTML : nls.confirm}, noticeDiv);
		/*var leanMore = dojo.create('span', {innerHTML : nls.leanMore, 'class' : 'span-link'}, para);
        dojo.attr(leanMore,'tabindex','0');
        dijit.setWaiRole(leanMore,'button');		
		
		dojo.connect(leanMore, 'onclick', dojo.hitch(this, "_learnMore"));	
		dojo.connect(leanMore, 'onkeypress', dojo.hitch(this, "_onKeyPress", leanMore));
		
		leanMore.focus();*/
	},
	
	_onKeyPress: function(btn, evt)
	{
		if(evt && evt.keyCode == dojo.keys.ENTER)
		{
			this._learnMore();
		}		
	},	
	 	
	_learnMore: function() 
	{
		var url = this.getHelpUrl();
		var helpWin = window.open( url, "helpWindow", "width=800, height=800" );
		helpWin.focus();			
	},
	
	getHelpUrl: function()
	{
		return concord.main.App.UPLOAD_NEWVERSION_HELP_URL;
	},
	
	commitOption: function(syncdraft)
	{	
		setTimeout(function(){
			pe.scene.handleDraftConflict(syncdraft);
		}, 0);		
	},
	
	onOk: function () 
	{		
		this.commitOption(true);
		return true;
	},
		
	onCancel: function (editor) {	
		this.commitOption(false);
		return true;
	}
});
