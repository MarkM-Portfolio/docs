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

dojo.provide("pres.clipboard.CutHandler");
dojo.require("pres.clipboard.BaseCopyCutHandler");
dojo.requireLocalization("concord.widgets", "CKResource");
dojo.declare("pres.clipboard.CutHandler", pres.clipboard.BaseCopyCutHandler, {

	handle: function(e)
	{
		if (e && (e.type == "keydown" || e.type == "beforecut" || e.type == "cut"))
		{
			try{
				this.onCutByKey();
			}catch(e){
				console.log("==onCutByKey:handle==error:"+e);
				delete pe.inCopyPasteAction;
				delete pe.copyPasteIssueCases;
			}
		}
		else
		{
			this.showNotSupportDialog("cut");
		}
	},

	onCutByKey: function(e)
	{
		this.copySelectedItems(true);
	}

});