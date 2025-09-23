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

dojo.provide("websheet.clipboard.SelectionRectMixin");
dojo.declare("websheet.clipboard.SelectionRectMixin", null,
{
	
	// All SpreadSheet instances in one browsers shares a COPY-CUT dash border instance.
	
    _selecting: false,
    _selectionKey: "SpreadSheet_COPY_CUT_SELECTION",
    
	constructor: function ()
    {
		dojo.connect(window, "onfocus", this, "_onWindowFocus");
    },
    
    setSelect: function(select)
    {
    	var changed = false;
    	if(select && !this._selecting)
    	{
    		this._selecting = true;
    		changed = true;
    	}
    	
    	if(this._selecting && !select)
    	{
    		this._selecting = false;
    		changed = true;
    	}
    	
		if(!changed)
			return;
    	
		if(!window.localStorage)
			return;
		
		if(this._selecting)
		{
			localStorage.setItem(this._selectionKey, this._id);
		}
		else
		{
			var item = localStorage.getItem(this._selectionKey);
			if (item == this._id)
				localStorage.removeItem(this._selectionKey);
		}
    },
    
    exitSelect: function(invalidData)
	{
    	if(!this._selecting)
    		return;
    	this._cutting = false;
		
		this.setSelect(false);
    	
		if(invalidData)
		{
			var data = this._storage.getData();
			if(data)
			{
				data._invalid = true;
				this._storage.setData(data);
			}
		}
		
		if(this._cutRect && !this._cutRect._destroyed)
		{
			this._cutRect.hide().hibernate();
		}
	},
	
	_showSelection: function()
	{
    	this.getCutRect().render();
	},

	_onWindowFocus: function()
	{
		if(this._selecting)
		{
			if(window.localStorage && localStorage.getItem(this._selectionKey) != this._id)
			{
				// other place cutted or copied...
				this.exitSelect();
			}
		}
	}

});