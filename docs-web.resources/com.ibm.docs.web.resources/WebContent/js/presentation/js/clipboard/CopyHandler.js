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

dojo.provide("pres.clipboard.CopyHandler");
dojo.require("pres.clipboard.BaseCopyCutHandler");

dojo.declare("pres.clipboard.CopyHandler", pres.clipboard.BaseCopyCutHandler, {

	handle: function(e)
	{
		if (e && (e.type == "keydown" || e.type == "beforecopy" || e.type == "copy"))
		{
			try{
				this.onCopyByKey();
			}catch(e){
				console.log("==onCopyByKey:handle==error:"+e);
				delete pe.inCopyPasteAction;
				delete pe.copyPasteIssueCases;
			}
		}
		else
		{
			this.showNotSupportDialog("copy");
		}
	},

	onCopyByKey: function()
	{
		this.copySelectedItems();
	}

});