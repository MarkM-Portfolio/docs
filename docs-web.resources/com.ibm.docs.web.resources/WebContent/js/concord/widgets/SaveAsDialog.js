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

dojo.provide("concord.widgets.SaveAsDialog");
dojo.require("concord.widgets.InputBox");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.util","dialogs");

dojo.declare("concord.widgets.SaveAsDialog", [concord.widgets.InputBox], {
	isOverride: false,
	
	constructor: function(app, override) {
		visible = true;
		this.isOverride = override;
		var nls = dojo.i18n.getLocalization("concord.util","dialogs");
		var docName = pe.scene.getDocTitle();
		var isInCommunity = (DOC_SCENE.communityID && DOC_SCENE.communityID.length > 0);
		var params = {};
		params.defvalue = docName;
		params.message = dojo.string.substitute( nls.saveAsMsg, {'saveAsTarget' : isInCommunity ? nls.saveAsTargetToCommunity : nls.saveAsTargetToFiles} );
		params.showExternal = isInCommunity ? false : true;
		if (BidiUtils.isBidiOn())
			params.disableBTD = true;
		var args = [app, nls.saveAs, null, true, params];
		args.callee = arguments.callee;
		this.inherited(args);
	},
	createContent: function (contentDiv) {
		this.inherited( arguments );
		if(!this.inputArea) this.inputArea = dojo.byId(this.dialogId + "InputArea");
    	dijit.setWaiState(this.inputArea, "invalid", false);
	},
	isValidDocName: function(docName) { 
		var valid = /^([^\\\/\:\*\?\"\<\>\|]+)$/.test(docName);
		return valid;
	},
	
	isValidLengthName: function(docName){
		// the MAX file name length limited by Connection Files(not includes extension name).
		var MAX_FILENAME_LENGTH = 248;
		if (!docName) {
			return true;
		}
		// compute bytes length in UTF-8.
		var byteslength = 0;
		for ( var i = 0; i < docName.length; i++) {
			var c = docName.charCodeAt(i);
			if (c <= 127) {
				byteslength++;
			} else if (c <= 2047) {
				byteslength += 2;
			} else if (c <= 65535) {
				byteslength += 3;
				if ((c >> 11) == 27) {
					byteslength++;
					i++;
				}
			} else {
				bytes += 4;
			}
		}
		return (byteslength <= MAX_FILENAME_LENGTH);
	},

	onCancel: function (editor) {
		return !this.cancelBtn.disabled;
	},

	inProgress: function(start) {
		if (start)
		{
			this.showProcessImg();
			this.disableOkBtn(true);
			this.disableCancelBtn(true);
			var inputArea = dijit.byId(this.dialogId+"InputArea");
			inputArea.setAttribute('disabled', true);
		}
		else {
			this.hideProcessImg();
			this.disableOkBtn(false);
			this.disableCancelBtn(false);
			var inputArea = dijit.byId(this.dialogId+"InputArea");
			inputArea.setAttribute('disabled', false);
		}
	},
	
	onOk: function (editor) {
		this.setWarningMsg("");
		this.inProgress(true);
		
		var nls = dojo.i18n.getLocalization("concord.util","dialogs");
		var title = dojo.trim(this.inputText);
		var docName = pe.scene.getDocTitle();
		var errMsg = null;
		if(!this.inputArea) this.inputArea = dojo.byId(this.dialogId + "InputArea");
		if (!title || title == nls.emptyDoc || title == docName) {
			errMsg = nls.dulDocName;
		} else if (!this.isValidDocName(title)) {
			errMsg = nls.invalidDocName;
		} else if (!this.isValidLengthName(title)) {
			errMsg = nls.invalidLengthName;
		}
		if (errMsg)
		{
			this.inProgress(false);
			this.setWarningMsg(errMsg);
			dijit.setWaiState(this.inputArea, "invalid", true);
			this.inputArea.focus();
			return false;
		}
		
		var externalNode = dijit.byId(this.externalShareID);
		var isExternal = false;
		if(externalNode){
			isExternal = externalNode.checked;
		}
		
		var data = {};
		data["newTitle"] = title;
		data["isExternal"] = isExternal;
		pe.scene.saveAs(data);
		dijit.setWaiState(this.inputArea, "invalid", false);
		return true;
	}
});
