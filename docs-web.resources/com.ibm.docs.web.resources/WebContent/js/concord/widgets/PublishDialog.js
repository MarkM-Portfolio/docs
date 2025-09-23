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

dojo.provide("concord.widgets.PublishDialog");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.SimpleTextarea");
dojo.require("dojo.i18n");
dojo.require("concord.scenes.ErrorScene");
dojo.require("concord.util.dialogs");
dojo.requireLocalization("concord.widgets","PublishDialog");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.beans.ProfilePool");
dojo.require("concord.util.user");
dojo.require("concord.util.uri");
dojo.declare("concord.widgets.PublishDialog", [concord.widgets.concordDialog], {

	versionDescriptionTextAreaID: "C_d_PublishDialogVersionTextArea",
	formatChangeDiv: "C_d_FormatChangeMsgContainer",
	formatChangeMsgDiv: "formatChangeMsgDiv",
	//conflictAreaDiv: "conflictAreaDiv",
	//conflictMsgDiv: "conflictMsgDiv",
	conflictModifier: "conflictModifierId",
	summaryMsgDiv: "publishSummaryMsgDiv",
	notificationMsgDiv: "publishNotificationMsgDiv",
	clzReminder: "reminder",
	width: "450px",
	ccmCheckSucceed: false,
	
	maxDescLength: 500,
	nls: null,
	bidiDir: "",
	
	constructor: function() {
		// dialog has been created
	},
	
	setDialogID: function() {
		this.dialogId = "C_d_PublishDialog";
	},	
	
	createContent: function (contentDiv) {
		this.describedInfoId = contentDiv.id;
		this.nls = dojo.i18n.getLocalization("concord.widgets","PublishDialog");
		this.publishSummaryMsg = this.nls.publishSummaryMsg;
		
		var doc = dojo.doc;
		
		// create format change warning div
		var changeInfoDiv = dojo.create('div', {id: this.formatChangeDiv, 'class': 'lotusMessage2 lotusWarning'}, contentDiv);
		dojo.style(changeInfoDiv, "width", this.width );
		var img = dojo.create('img',
				{
					src: contextPath + window.staticRootPath + '/js/dojo/resources/blank.gif', 
					alt: 'Information',
					'class': "lotusIcon yourProductSprite yourProductSprite-msgWarning16"
				}, changeInfoDiv);
		var span = dojo.create('span',{innerHTML: 'Information:', 'class': 'lotusAltText'}, changeInfoDiv);
		var div = dojo.create('div', {id: this.formatChangeMsgDiv, 'class': 'lotusMessageBody'}, changeInfoDiv);
		
		if(concord.util.uri.isECMDocument() || concord.util.uri.isExternalCMIS())		
		{			
			// summary
			var summaryDiv = dojo.create('div', {id: "publishCCMSummary", 'class': "option-notice"}, contentDiv);
			this.describedInfoId = summaryDiv.id;
			dojo.style(summaryDiv, "width", this.width );			
			this._formatCCMSummary(summaryDiv);
		}
		else 
		{		
//			// Conflict warning
//			var conflictDiv = dojo.create('div', {id: this.conflictAreaDiv, 'class': 'lotusMessage2 lotusWarning'}, contentDiv);
//			dojo.style(conflictDiv, "width", this.width );
//			var img = dojo.create('img',
//					{
//						src: concord.util.uri.getDefaultPhotoUri(), 
//						alt: 'Photo',
//						'class': 'profile-pic',
//						id: this.conflictModifier
//					}, conflictDiv);
//			var confMsgDiv = dojo.create('div', {id: this.conflictMsgDiv, 'class': 'lotusMessageBody'}, conflictDiv);					
					
			// description			
			var mainDescDiv = dojo.create('div', {id: this.notificationMsgDiv, 'class': 'reminder concordDialogPaddingTop'}, contentDiv);
			dojo.style(mainDescDiv, "width", this.width );
			var str = pe.scene.isPPTOrODP() ? this.nls.publishMainDescWithoutCMT : this.nls.publishMainDesc;
			textNode = doc.createTextNode(str);
			mainDescDiv.appendChild(textNode);			
			var notificationDiv = dojo.create('div', {id: this.notificationMsgDiv, 'class': 'reminder concordDialogPaddingTop'}, contentDiv);
			dojo.style(notificationDiv, "width", this.width );
			textNode = doc.createTextNode(this.nls.publishNotificationMsg);
			notificationDiv.appendChild(textNode);
			
			// summary
			var summaryDiv = dojo.create('div', {id: this.summaryMsgDiv, 'class': "concordDialogBold concordDialogPaddingTop"}, contentDiv);
			dojo.style(summaryDiv, "width", this.width );
			var textNode = doc.createTextNode(this.nls.publishSummaryMsg);
			summaryDiv.appendChild(textNode);
			var textDiv = dojo.create('div', {'class': "concordDialogPaddingTop"}, contentDiv);
			dojo.style(textDiv, "width", this.width );
			this.createTextArea({id:this.versionDescriptionTextAreaID,rows:4, cols:50,style: "width: 99%;", maxLength: this.maxDescLength, hints: this.nls.summaryHint}, textDiv);			
		}
	},
	
	reset: function()
	{
		if(concord.util.uri.isECMDocument() || concord.util.uri.isExternalCMIS())
		{
			this._updateFormatChangeArea();
			this.hideProcessImg();
			this.showOkBtn(true);
			this.disableCancelBtn(false);
			var btn = dijit.byId(this.CancelButtonID);
			if(btn)
			{
				btn.set('label', this.cancelLabel);
				btn.set('title', this.cancelLabel);
				this.ccmCheckSucceed = false;
			}			
			var content = dojo.byId("publishCCMSummary");
			if(content)
			{
				this._formatCCMSummary(content);
			}
		}
		else
		{
			this._updateFormatChangeArea();
			//this._updateConflictArea();
			var textarea = dijit.byId(this.versionDescriptionTextAreaID);
			if (textarea) {
				this.dialog.connect(textarea, "onkeypress", dojo.hitch(this, this._onKeyPress));
				textarea.setValue('');
				textarea.setAttribute('disabled', false);
			}				
			this._clearPublishingStatus();
		}
	},
	
	createTextArea: function(attributes, container){
		var textarea = new dijit.form.SimpleTextarea(attributes);
		if (BidiUtils.isBidiOn()){
			this.bidiDir = BidiUtils.getTextDir();
			if (this.bidiDir != ""){
				if (this.bidiDir != "contextual")
					dojo.attr(textarea, "dir", this.bidiDir);
			}
		}
		if (attributes.style)
			dojo.attr(textarea.domNode, attributes.style);
		if (attributes.hints)
			dojo.attr(textarea.domNode, 'placeholder', attributes.hints);		
		dojo.connect(textarea, "onKeyUp", dojo.hitch( this, function(){
			var content = textarea.attr("value");
			if(content.length == this.maxDescLength){
				this.setWarningMsg(this.nls.publishDescMsg);	
				setTimeout(dojo.hitch(this, function(){
 					this.setWarningMsg('');
				}), 5000);				
			}
			if (this.bidiDir == "contextual")
				dojo.attr(textarea, "dir", BidiUtils.calculateDirForContextual(content));
		}));			
		container.appendChild(textarea.domNode);       
		return textarea;
	},
	_onKeyPress: function(event)
	{
		event = event || window.event;
		var key = (event.keyCode ? event.keyCode : event.which);
		if(key == 115 && (event.ctrlKey || event.metaKey)){
			if (event.preventDefault) 
				event.preventDefault();
		}
	},
	setWarningMsg: function(msg)
	{
		// unique warning message ID in concord system
		var msgId = this.warnMsgID + this.dialogId;
		var msgDiv = dojo.byId(msgId);
		if (msgDiv)
		{
			msgDiv.style.cssText = "width:" + this.width + ";word-wrap:break-word";
		}
		
		this.inherited( arguments );
	},
	
	onCancel: function (editor) {
		if(pe.scene.showCheckinMenu() && this.ccmCheckSucceed)
		{// back to files detail page/close the window only when this.ccmCheckSucceed == true
			pe.scene.closeOrRedirectToSummaryPage()
		}		
		return !this.cancelBtn.disabled;
	},

	onOk: function (editor) {
		var data = {"changeSummary" : ""};
		if(pe.scene.showCheckinMenu())
		{
			editor.publish(data);		
			this.showProcessImg();
			this.showOkBtn(false);
			this.disableCancelBtn(false);
			var btn = dijit.byId(this.CancelButtonID);
			if(btn)
			{
				dojo.requireLocalization("concord.scenes","Scene");
				var sceneNLS = dojo.i18n.getLocalization("concord.scenes","Scene");	
				if(concord.util.uri.isCCMDocument())
				{
					btn.set('label', sceneNLS.backtoLibrary);
					btn.set('title', sceneNLS.backtoLibrary);
				}
				else if(concord.util.uri.isECMDocument())
				{
					btn.set('label', sceneNLS.backtoICN);
					btn.set('title', sceneNLS.backtoICN);
				}
				this.ccmCheckSucceed = true;
			}	
			return false;
		}
		else	
		{
			var descriptionArea = dijit.byId(this.versionDescriptionTextAreaID);
			var descText = descriptionArea.getValue();	
			data = {"changeSummary" : descText};
			this.setWarningMsg("");
			editor.publish(data);
			return true;
		}		
	},
	
	handleResult: function(msg, succeed)
	{		
		if(pe.scene.showCheckinMenu())
		{
			this.hideProcessImg();
			this.disableCancelBtn(false);
			
			this.ccmCheckSucceed = succeed;
			var content = dojo.byId("publishCCMSummary");
			if(content)
			{
				dojo.empty(content);
				var textNode = document.createTextNode( msg );
				content.appendChild(textNode);				
			}
			if(succeed)
			{
				pe.scene.session.stop();
			}
			var btn = dijit.byId(this.CancelButtonID);
			if(btn)
			{
				if(this.ccmCheckSucceed)
				{
					dojo.requireLocalization("concord.scenes","Scene");
					var sceneNLS = dojo.i18n.getLocalization("concord.scenes","Scene");	
					var closeDocs = dojo.string.substitute(sceneNLS.closeDocs, { 'productName' : concord.util.strings.getProdName() });
					btn.set('label', closeDocs);
					btn.set('title', closeDocs);
				}
				else
				{
					btn.set('label', this.nls.closeLabel);
					btn.set('title', this.nls.closeLabel);
				}			
				setTimeout(function() {
							btn.focus();
				}, 500);
			}
		}		
	},
	
	_isCoediting: function() {
		if( pe && pe.scene && pe.scene.session)
		{
			var pList = pe.scene.session.getParticipantList(true);
			return pList && pList.length > 1;
		}
		
		return false;
	},
	
	_formatCCMSummary: function(summaryDiv)
	{
		dojo.empty(summaryDiv);
		var pList = null;
		if( pe && pe.scene && pe.scene.session)
		{
			pList = pe.scene.session.getParticipantList();
		}		
		if(pList && pList.length > 1)
		{
			var textNode = document.createTextNode( this.nls.coeditingMsg );
			summaryDiv.appendChild(textNode);
			this._addCoeditorsNames(summaryDiv, pList); 
		}
		var textNode = document.createTextNode( this.nls.ccmPublishMsg );
		summaryDiv.appendChild(textNode);
	},
	
	_addCoeditorsNames: function(div, pList) {
		var isBidi = BidiUtils.isBidiOn();
	  	for (var i = 0; i < pList.length; i++)
	  	{
	  		var user = pList[i].getUserBean();
	  		if(pe.authenticatedUser.getId() != user.getId())
	  		{ 
				var editorDiv = dojo.create("div", null, div );
				var userName =  user.getName();
                if (isBidi)
                    userName = BidiUtils.addEmbeddingUCC(userName);
                var textNode = document.createTextNode(userName);
				editorDiv.appendChild(textNode);
	  		}
	  	}
	},
	
	_clearPublishingStatus: function(){
		this.hideProcessImg();
		this.disableOkBtn(false);
		this.disableCancelBtn(false);
		var btn = dijit.byId(this.CancelButtonID);
		if(btn)
		{
			btn.set('label', this.cancelLabel);
			btn.set('title', this.cancelLabel);
			this.ccmCheckSucceed = false;
		}			
		var descriptionArea = dijit.byId(this.versionDescriptionTextAreaID);
		descriptionArea.setAttribute('disabled', false);
	},
	
	_updateFormatChangeArea: function(){
		var bCsv = (pe.scene.bean.getMimeType()=="text/csv");
		var bTxt = (pe.scene.bean.getMimeType()=="text/plain");
		var msg, container = dojo.byId(this.formatChangeDiv);
		if (bCsv || bTxt){
			dojo.style(container, 'display', '');
			var msgDiv = dojo.byId(this.formatChangeMsgDiv);
			var currentFileFormat = pe.settings.getFileFormat();
			if(currentFileFormat == "ms"){
				if (bTxt)
					msg = this.nls.publishTxtFormatChangeMsg;
				else if (bCsv)
					msg = this.nls.publishCsvFormatChangeMsg;
			} 
			else if(currentFileFormat == "odf")
			{
				if (bTxt)
					msg = this.nls.publishTxtFormatChangeMsg2;
				else if (bCsv)
					msg = this.nls.publishCsvFormatChangeMsg2;
			}
			if(msg) {
				if(BidiUtils.isGuiRtl())
					msg = BidiUtils.removeUCC(msg).replace(")",BidiUtils.LRE + ")");

				msgDiv.innerHTML = msg;
			}
		}
		else
        {
			dojo.style(container, 'display', 'none');
        }
	}
	
//	_updateConflictArea: function() {				
//			var resp = concord.util.uri.getDraftStatus();
//			var showConflict = false;
//			var modified = null;
//			var modifier = null;
//			if(resp && !resp.valid)
//			{
//				showConflict = true;
//				modified = resp.latest_version_modified;	
//				modifier = resp.latest_version_modifier;
//			}
//			var container = dojo.byId(this.conflictAreaDiv);
//			if(showConflict && modifier && modified)
//			{
//				var msgDiv = dojo.byId(this.conflictMsgDiv);		
//		    	var user = ProfilePool.getUserProfile(modifier);
//		    	if(user)
//		    	{
//			    	var picImg = dojo.byId(this.conflictModifier);
//			    	var photoUrl = user.getPhotoUrl();
//			    	if(picImg && photoUrl && photoUrl.length > 0)
//			    	{
//			    		picImg.src = photoUrl;
//			    	}	    		
//		    	}
//		    		    	
//		    	var conflictMsg = concord.util.dialogs.formatStrings4Modifier(this.nls.conflictMsg, modifier, modified);			
//				msgDiv.innerHTML = conflictMsg;	
//				container.style.display = '';
//			}
//			else
//			{
//				container.style.display = 'none';
//			}	
//		}
//	}
});
