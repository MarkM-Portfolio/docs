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
dojo.provide("concord.clipboard.AbstractClipboard");
dojo.require("concord.clipboard.ClipboardUtil");

dojo.declare('concord.clipboard.AbstractClipboard', null, {
    _pastebin:null,
    constructor: function(){
    	
    },
    
    prepareClipboardContainer: function(){
    	this._pastebin = dojo.byId("presClipboardDiv");
    	
    	if (dojo.isWebKit)
        {
            // for Mac Safari/Chrome
            var dom = dojo.body();
            dojo.connect(dom, "onbeforecopy", dojo.hitch(this, "_selectDummyCopyCutContainer"));
            dojo.connect(dom, "onbeforecut", dojo.hitch(this, "_selectDummyCopyCutContainer"));
        }
    	if(!this._pastebin) {
    		this._pastebin = this._createClipboardContainer(dojo.body());		
    		
    		//This will listen for the paste event on the hidden div and call the code for processing the
    		//system clipboard data.  If no table is found then we will publish the CTRL_V event as usual.
    		//We can also listen for other data types in the future (not just tables)
    		var pstEvtName = "onpaste";
    		dojo.connect(this._pastebin, pstEvtName, this, "_onPaste");
    	}	
    	this._pastebin.contentEditable = true;
    	return this._pastebin;

    },
	/**
	 * _selectDummyCopyCutContainer is the handler for onbeforecopy & onbeforecut
	 * for performance consideration, never call this.selectClipboardContainer(pc) here
	 * because this function is frequently called.
	 */
    _selectDummyCopyCutContainer: function(e)
    {
    	if(dojo.isSafari){
    		var pc = this._pastebin;
    		if(!pc)
    			pc = this.prepareClipboardContainer();
    		pc.focus();
    	}

    },
    
    focusClipboardContainer: function(){
    	var pc = this.prepareClipboardContainer();
    	pc.innerHTML = "&nbsp;";
    	if(dojo.isSafari)
    	{
    		this.selectClipboardContainer(pc);
    	}	
    },
    
    selectClipboardContainer: function(node)
    {
    	if(dojo.isSafari)
    		node.focus();
    	else if(document.activeElement)
    		document.activeElement.blur();
        if (document.createRange && window.getSelection)
        {
            var sel = window.getSelection();
            try
            {
                sel.removeAllRanges();
            }
            catch (e)
            {}
            var range = document.createRange();
            try
            {
                range.selectNodeContents(node);
            }
            catch (e)
            {
                range.selectNode(node);
            }
            sel.addRange(range);
        }
        else if (document.body.createTextRange)
        {
            var range = document.body.createTextRange();
            range.moveToElementText(node);
            range.select();
        }
    },
    
    _onPaste: function(e){
    	concord.clipboard.ClipboardUtil.handlePaste(e);
    },
    
    _createClipboardContainer: function(parentNode){
    	return this._pastebin = dojo.create("div",
        		{				
        			title: "copy&cut&paste",
        			id : "presClipboardDiv",
        			style : {
        				position: 'absolute',
        				position: 'absolute',
        				top: '-50010px',
        				left: '-50010px',
        				width: '50000px',
        				height: '50000px',
        				overflow: 'hidden'
        			}
        		}, parentNode);
    }
});