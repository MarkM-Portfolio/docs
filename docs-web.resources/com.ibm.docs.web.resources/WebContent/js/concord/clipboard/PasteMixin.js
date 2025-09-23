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

dojo.provide("concord.clipboard.PasteMixin");

dojo.declare("concord.clipboard.PasteMixin", concord.clipboard.AbstractClipboard,
{
	constructor: function(){
    },
    
    preparePaste: function(event){
    	var ctn = this.prepareClipboardContainer();
    	ctn.innerHTML = "";
    	if(dojo.isSafari || document.activeElement != ctn)
    	{
    		ctn.blur();
    		ctn.focus();
    	}	
    },
       
    /**
     * handle paste system clipboard contents
     * This should be called from handler for CTRL_V keypress to intercept paste event.
     */
    _onPaste: function (e){
    	concord.clipboard.ClipboardUtil.handlePaste(e);				
    }
    		
});