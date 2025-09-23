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

dojo.provide("websheet.clipboard.Storage");
dojo.require("concord.beans.WebClipboard");
dojo.declare("websheet.clipboard.Storage", null, {
	
	TYPE: "SpreadSheet",
	
	constructor: function()
	{
		this._webClipboard = new concord.beans.WebClipboard();
		this._memClipboard = null;
	},
	
    clear: function()
    {
    	this._webClipboard.emptyClipboard();
    	this._memClipboard = null;
    },
    
    getData: function()
    {
    	var m = this._memClipboard;
    	var w = this._webClipboard;
    	
    	if(this._forceUseMem)
    		return m;
    	
    	if(w.isWebStorage())
    	{
	    	var t = w.getDataTimestamp();
	    	if(!t)
	    	{
	    		// no data stored before..
	    		return m;
	    	}
	    	
	    	else if(m)
	    	{
	    		// ours is newer.
	    		if(m._timestamp && m._timestamp >= t)
	    			return m;
	    	}
    	}
    	
    	var json = w.getData();
    	var data = dojo.fromJson(json);
    	
    	if(data._type !== this.TYPE)
    		return m;
    	
    	if(!m)
    		return data;
    	
    	else
    	{
    		if(data._timestamp && m._timestamp)
    		{
    			if(data._timestamp < m._timestamp)
    				return m;
    		}
    	}
    	
    	return data;
    },
    
    _cleanData: function(data)
    {
    	if(!data)
    		return;
    	delete data._limited;
    	var d = data.data;
    	if(!d)
    		return;
		if(d.cell)
		{
			delete d.cell.showValue;
			delete d.cell.cv;
			delete d.cell.model;
			delete d.cell._styleCode;
		}
		else if(d.rows)
		{
			for(var x in d.rows)
			{
				if(d.rows[x].cells)
				{
    				for(var y in d.rows[x].cells)
    				{
    					var c = d.rows[x].cells[y];
    					delete c.showValue;
    					delete c.cv;
    					delete c.model;
    					delete c._styleCode;
    				}
				}
			}
		}
    },
    
    toJson: function(data)
    {
    	return JSON.stringify(data);
    },  
    
    setData: function(data)
    {
    	if(!data)
    		return;
    	this._cleanData(data);
    	
    	data._type = this.TYPE;
    	data._timestamp = new Date().valueOf();
    	
    	this._memClipboard = data;
    	this._forceUseMem = true;
    	
    	setTimeout(dojo.hitch(this, function(){
    		// hold 2 seconds for performance, 2 seconds sounds reasonable for user switch to other browser page to paste.
    		var json = this.toJson(data);
        	if(json && json.length <= this._webClipboard.getMaxLength())
        	{
        		this._webClipboard.setData(json);
        	}

        	// make sure local mem clipboard is newer
        	data._timestamp = new Date().valueOf();
        	
        	this._forceUseMem = false;
        	
    	}, 2000));
    
    }
});
