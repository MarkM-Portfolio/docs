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

dojo.provide("pres.clipboard.ClipboardHandler");
dojo.require("pres.clipboard.Storage");
dojo.require("pres.clipboard.CopyPasteUtil");
dojo.requireLocalization("concord.widgets", "CKResource");

dojo.declare("pres.clipboard.ClipboardHandler", null, {
	
	storage: new pres.clipboard.Storage(),
	copypasteutil: new pres.clipboard.CopyPasteUtil(),
	
	parser: pres.model.parser,
	hp: pres.utils.helper,
	
	showNotSupportDialog: function(type)
	{
		var nls = dojo.i18n.getLocalization("concord.widgets", "CKResource");
		var os = dojo.isMac ? 'OnMac' : '';
		setTimeout(function()
		{
			// set timeout to make the menu disappear first.
			alert(nls.clipboard[type + 'Error' + os]); // Show cutError or copyError.
		}, 0);
	},
	showPasteTextErrorDialog: function(msg)
	{
		dojo.require("concord.util.dialogs");
		concord.util.dialogs.alert(msg);
	}
});