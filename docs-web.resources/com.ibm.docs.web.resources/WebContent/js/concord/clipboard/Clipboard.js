/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("concord.clipboard.Clipboard");
dojo.require("concord.clipboard.CopyMixin");
dojo.require("concord.clipboard.PasteMixin");

dojo.declare('concord.clipboard.Clipboard', [concord.clipboard.CopyMixin,concord.clipboard.PasteMixin], {
    constructor: function(){
		
	},
    
	/**
	 * handle copy event in view mode
	 */
	copy: function(params) {
		if(params)
		{
			this.pushSysClipboard(params);
		}	
	},   
	
	/**
	 * handle paste event in view mode
	 */
	paste: function(event) {
		if(event)
		{
			this.preparePaste(event);
		}	
	}
	
});