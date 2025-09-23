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

dojo.provide("websheet.clipboard.CopyIEMenuMixin");
dojo.declare("websheet.clipboard.CopyIEMenuMixin", null, {
    
	_IECopyTime: 0,
	_IEMenuCopyRequestTime: 0,
	
	constructor: function()
	{
		dojo.connect(document.documentElement, "oncopy", this, function(e){
			this._IECopyTime = new Date().valueOf();
		});
	},
	
	_selectIEDom: function(dom){
		dom.tabIndex = 0;
    	dom.focus();
    	document.execCommand('SelectAll');
	},
	
    _onCopyFromIEMenu: function(dom, data, copyResult, callback)
    {
    	var currentFocusItem = dijit._curFocus;
    	
    	this._selectIEDom(dom);
		
		var range = document.selection.createRange();

		this._IEMenuCopyRequestTime = new Date().valueOf();
		
		range.execCommand("Copy", false, null);
		
		setTimeout(dojo.hitch(this, function(){
			// to check if the copy really occured, (permission granted)
			if(this._IECopyTime >= this._IEMenuCopyRequestTime)
			{
				this._showCopyMsg(copyResult);
    			if(callback)
    				callback(data);
    			else
    				this._storage.setData(data);
			}
			else
			{
				this.exitSelect();
			}
		}), 100);
		
		this.editor.focus2Grid();
    }
    
});