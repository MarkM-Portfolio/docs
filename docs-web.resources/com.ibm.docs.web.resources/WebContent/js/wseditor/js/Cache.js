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


dojo.provide("websheet.Cache");

dojo.declare('websheet.Cache', null, {
	
	limit: 1000,
	max_key_len: 50,
	policy: 0, 
		
	POLICY_FIFO: 0,
	POLICY_LRU: 1,
	
	count: 0,
	
	constructor: function(limit, policy)
	{
		this._items = {};
		if (policy == 1)
			this.policy = 1;
		if (limit && limit > 0)
			this.limit = limit;
	},
	
	put: function(k, v){
		if(k && k.length && k.length > this.max_key_len)
		{
			return false;
		}
		var item = {k : k, v: v, t: new Date(), c:1};
		if(!(k in this._items))
		{
			this.count ++;
		}
		this._items[k] = item;
		
		if(this.count > this.limit)
		{
			setTimeout(dojo.hitch(this, "_purge"), 100);
		}
		
		return true;
	},
	
	contains: function(k)
	{
		return (k in this._items);
	},
	
	get: function(k){
		var item = this._items[k];
		if(item)
		{
			item.c ++;
			return item.v;
		}
	},
	
	remove: function(k)
	{
		if(k in this._items)
		{
			delete this._items[k];
			this.count--;
		}
	},
	
	clear: function()
	{
		this.count = 0;
		this._items = {};
	},
	
	_fifoSort: function(a, b)
	{
		if(a.t > b.t)
			return 1;
		else if(a.t < b.t)
			return -1;
		else
			return 0;
	},
	
	_lruSort: function(a, b)
	{
		if(a.c > b.c)
			return 1;
		else if(a.c < b.c)
			return -1;
		else
			return 0;
	},
	
	_purge: function()
	{
		if(this.count < this.limit)
			return;
		
		var arr = [];
		for(var x in this._items)
		{
			arr.push(this._items[x]);
		}
		
		arr.sort(this.policy = this.POLICY_FIFO ? this._fifoSort : this._lruSort);
		
		for(var i = 0; i < (arr.length * 0.75); i ++)
		{
			this.remove(arr[i].k);
		}
	}
	
});
