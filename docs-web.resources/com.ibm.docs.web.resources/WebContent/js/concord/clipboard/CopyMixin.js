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

dojo.provide("concord.clipboard.CopyMixin");
dojo.require("concord.clipboard.AbstractClipboard");

dojo.declare("concord.clipboard.CopyMixin", [concord.clipboard.AbstractClipboard],
{
	constructor: function(){
    }, 

    /**
     * PUSH the content into System Clipboard according to the other parameters
     * @param params can be json format 
     */

    pushSysClipboard : function(params){
    	console.log("====Enter pushSysClipboard");
    	if(!params)
    		params = {};
    	var copyContainer = this.prepareClipboardContainer();
    	//need and nbsp in here for safari.
    	var id = this.genIdByType(params.docId,params.type);
    	if(params.content)
    	{	
    		copyContainer.innerHTML = params.content;
    		//defect31969
    		dojo.query('[id]',copyContainer).forEach(function(node){
    			node.id = '';				
    		});		
    		
    		var lastChild = copyContainer.lastChild;
    		if(lastChild && lastChild.nodeType == CKEDITOR.NODE_TEXT)
    		{
    			var span = dojo.create("span",null,copyContainer);
    			span.appendChild(lastChild);
    		}
    		dojo.attr(copyContainer.lastChild,'_clipboard_id',id);
    		/**
    		 * CHROME/SAFARI limitation
    		 * The full dom data won't be pushed into system clipboard if copyContainer one child
    		 * add abundant space in this case to push the complete data. 
    		 */
    		if(dojo.isWebKit)
    		{
    			var tmp = dojo.create("div",null,copyContainer);
    			tmp.innerHTML = '&nbsp;';
    			dojo.attr(tmp,'_copy_nondata','true');
    			dojo.attr(tmp,'_clipboard_id',id);
    		}
    	}
    	else
    	{
    		copyContainer.innerHTML = '<p _clipboard_id="'+ id + '">&nbsp;</p>';
    		dojo.attr(copyContainer.lastChild,'_clipboard_id',id);
    		if(dojo.isWebKit)
    		{
    			var tmp = dojo.create("div",null,copyContainer);
    			tmp.innerHTML = '&nbsp;';
    			dojo.attr(tmp,'_copy_nondata','true');
    			dojo.attr(tmp,'_clipboard_id',id);
    		}
    		
    	}
    	
    	// New created connector shape cannot be copied in IE
    	// Change focus way as paste
    	if(dojo.isSafari || document.activeElement != copyContainer)
    	{
    		copyContainer.blur();
    		copyContainer.focus();
    	}
    	
    	this.selectClipboardContainer(copyContainer);
    },
    
    genIdByType: function(docId,type)
    {
    	var aid ='';
    	if(type && docId)
    		aid = "docs_pres_"+ type +"_"+ docId + "_" +MSGUTIL.getUUID();
    	else
    		aid = "docs_pres_" + MSGUTIL.getUUID();
    	return aid;
    }
});    
