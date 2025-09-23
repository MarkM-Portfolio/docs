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

dojo.provide("websheet.widget.AutoCompleteProvider");


// A simple FIFO cache to cache auto complete result/node
dojo.declare('websheet.widget.AutoCompleteCache', null, {
	
	count: 0,
	limit: 10,
	
	constructor: function()
	{
		this._items = {};
	},
	
	put: function(k, node, value){
		var item = {k : k, n: node, v: value, t: new Date()};
		if(!(k in this._items))
		{
			this.count ++;
		}
		this._items[k] = item;
		
		if(this.count > this.limit)
		{
			setTimeout(dojo.hitch(this, "_purge"), 100);
		}
	},
	
	contains: function(k)
	{
		return (k in this._items);
	},
	
	get: function(k){
		return this._items[k];
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
	
	_purge: function()
	{
		if(this.count < this.limit)
			return;
		
		var arr = [];
		for(var x in this._items)
		{
			arr.push(this._items[x]);
		}
		arr.sort(function(a, b){
			return a.t - b.t;
		});
		
		for(var i = 0; i < (arr.length * 0.75); i ++)
		{
			this.remove(arr[i].k);
		}
	}
	
});

dojo.declare('websheet.widget.AutoCompleteProvider', null, {
	_trieTree: null,
	_cachedMap: null,
    _treeLevelOffset: 3,
    _searchDelay: 150,
    _lastCandidate: "",
    
    reset: function()
    {
    	this._needData = true;
    	this._lastNoMatchQuery = "";
    	this._lastSearchedQuery = "";
    	this._candidates = [];
    	this._trieTree = {};
    	this._trieTreeStartChar = null;
    	this._maxLen = 0;
    	this._lastCandidate = "";
    	this._cachedResults.clear();
    },
    
    constructor: function()
    {
    	this._cachedResults = new websheet.widget.AutoCompleteCache();
    	this.reset();
    },
    
    setCandidates: function(items)
    {
    	this.reset();
    	this._candidates = items;
    },
    
    _expandTreeNode: function(rootNode, q){
    	q = q.toLocaleLowerCase();
    	dojo.forEach(rootNode._c, dojo.hitch(this, function(theIndex){
    		var prevNode = rootNode;
    		var item = this._candidates[theIndex];
    		var lowerCaseItem = item.toLocaleLowerCase();
    		var start = q.length;
    		var len = lowerCaseItem.length;
    		for(var i = start; i < len; i++)
    		{
    			var c = lowerCaseItem.charAt(i);
    			if(!prevNode[c])
    			{
    				prevNode[c] = {};
    			}
    			var node = prevNode[c];
    			prevNode = node;
    			
    			if(i == len - 1)
    			{
    				if(!node._v)
    				{
    					// for recording array index
    					node._v = [];
    				}
    				node._v.push(theIndex);
    			}
    			else if(i > start + this._treeLevelOffset)
    			{
    				// the 3rd level
    				// for saving space, to be expanded...
    				if(!node._c)
    				{
    					// for recording array index
    					node._c = [];
    				}
    				node._c.push(theIndex);
    				break;
    			}
    		}
    	}));
    	delete rootNode._c;
    },
    
    /* build tree with single characters, only expand 3 levels */
    buildTrieTree: function(items, startChar, rootNode)
    {
    	var trieTree = rootNode ? rootNode : {};
    	var lowerCaseStartChar = startChar.toLocaleLowerCase();
    	dojo.forEach(items, dojo.hitch(this, function(item, index){
    		var prevNode = trieTree;
    		var lowerCaseItem = item.toLocaleLowerCase();
    		var len = lowerCaseItem.length;
    		this._maxLen = Math.max(len, this._maxLen);
    		var start = 0;
    		for(var i = 0; i < len; i++)
    		{
    			var c = lowerCaseItem.charAt(i);
    			if(i == 0 && c != lowerCaseStartChar)
    			{
    				// do not count this item in.
    				return;
    			}
    			if(!prevNode[c])
    			{
    				prevNode[c] = {};
    			}
    			var node = prevNode[c];
    			prevNode = node;
    			
    			if(i == len - 1)
    			{
    				if(!node._v)
    				{
    					// for recording array index
    					node._v = [];
    				}
    				node._v.push(index);
    			}
    			else if(i > start + this._treeLevelOffset)
    			{
    				// the 3rd level
    				// for saving space, to be expanded...
    				if(!node._c)
    				{
    					// for recording collapsed item's array index
    					node._c = [];
    				}
    				node._c.push(index);
    				break;
    			}
    		}
    	}));
    	return trieTree;
    },
    
    _findNode: function(q)
    {
    	var stepIn = false;
    	if(this._lastSearchedQuery && q.indexOf(this._lastSearchedQuery) == 0)
    	{
    		stepIn = true;
    	}
    	
    	var prevNode = this._trieTree;
    	
    	if(stepIn)
    	{
    		// find next node based on prev node
    		if(this._cachedResults.contains(this._lastSearchedQuery))
    		{
    			var node = this._cachedResults.get(this._lastSearchedQuery).n;
    			// we did searched the node before.
    			if(!node)
    			{
    				// but, no node there.
    				return null;
    			}
    			else
    			{
    				prevNode = node;
    			}
    		}
    		else
    		{
    			stepIn = false;
    		}
    	}
    	
    	var lq = q.toLocaleLowerCase();
    	var len = lq.length;
    	
    	var ll = stepIn ? this._lastSearchedQuery.toLocaleLowerCase() : "";
    	for(var i = ll.length; i < len; i++)
    	{
    		var ch = lq.charAt(i);
    		if (prevNode._c)
    		{
    			// collased before.
    			this._expandTreeNode(prevNode, lq.substring(0, i));
    		}
    		prevNode = prevNode[ch];
    		if(!prevNode)
    		{
    			break;
    		}
    	}
    	return prevNode;
    },
    
    _cacheResult: function(q, node, candidates)
    {
    	// not to cache this kind of item, as it may take too much space.
    	if(!node && q.length > 20)
    		return;
    	
    	this._cachedResults.put(q, node, candidates);
    },
    
    _doSearch: function(q)
    {
    	if(!q)
    		return;
    	
    	if(!this._trieTree)
    		return;
    	
    	if(q.length >= this._maxLen)
    	{
    		// too long
    		return;
    	}
    	if(q.indexOf("=") == 0)
    	{
    		return;
    	}
    	
    	if(this._cachedResults.contains(q))
    	{
    		return this._cachedResults.get(q).v;
    	}
    	
    	if(this._lastNoMatchQuery && q.indexOf(this._lastNoMatchQuery) == 0)
    	{
    		return;
    	}
    	
    	var node = this._findNode(q);
    	
    	this._lastSearchedQuery = q;
    	
    	if(!node)
		{
        	this._lastNoMatchQuery = q;
    		// no this prefix
    		this._cacheResult(q, node, null);
			return;
		}
    	
    	if(node._v && node._v.length)
		{
    		// has the exactly same string (case insensitive)
    		this._cacheResult(q, node, null);
			return;
		}
    	
    	if(node._c)
		{
    		var _items = [];
    		for(var j = 0; j < node._c.length; j++)
			{
				var _cIndex = node._c[j];
				var item = this._candidates[_cIndex];
				if(this._isItemValid(item, _items))
				{
					_items.push(item);
				}
				else
				{
					this._cacheResult(q, node, null);
    				return;
				}
			}
    		
    		var candidate = this._candidates[node._c[0]];
    		this._cacheResult(q, node, candidate);
        	return candidate;
		}
    	
    	var items = [];

    	// items array should contains at least 1 candidate;
    	// if it contains 2 or more, these items should share one lowercase base, like "abc", "Abc", "ABC"
    	var ok = this._collectItems(q, node, items);
    	if (ok === false)
    		items = [];
    	
    	if(items.length > 0)
    	{
    		var candidate = items[0];
    		this._cacheResult(q, node, candidate);
    		return candidate;
    	}
    	else
    	{
    		this._cacheResult(q, node, null);
    	}
    },
    
    _isItemValid: function(item, items)
    {
    	var prevItem = null;
    	if(items.length > 0)
    	{
    		prevItem = items[items.length - 1];
    	}
    	if(prevItem && prevItem.toLocaleLowerCase() != item.toLocaleLowerCase())
    		return false;
    	else
    	{
    		return true;
    	}
    },
    
    _collectItems: function(q, prevNode, items, dup)
    {
    	for(var x in prevNode)
    	{
    		if(x != "_v" && x != "_c")
    		{
    			var node = prevNode[x];
    			var values = node._v;
    			if (values)
    			{
    				if(items.length > 0)
    					// contains items from above level, or sibling
    					return false;
    				
    				// has 1 or more items in this level;
    				for(var i = 0 ; i < values.length; i++)
    				{
    					var v = values[i];
    					var item = this._candidates[v];
    					
    					if(this._isItemValid(item, items, dup))
    					{
    						items.push(item);
    					}
    					else
    						return false;
    				}
    			}
    			
    			if(node._c)
    			{
    				if(values)
    				{
    					// has exactly match(case insensitive)
    					// and has further match
    					return false;
    				}
    				for(var j = 0; j < node._c.length; j++)
	    			{
    					var _cIndex = node._c[j];
    					var item = this._candidates[_cIndex];
    					if(this._isItemValid(item, items, dup))
    					{
    						items.push(item);
    					}
    					else
    						return false;
	    			}
    			}
    			
    			var result = this._collectItems(q, node, items, dup);
    			if(result === false)
    			{
    				return false;
    			}
    		}
    	}
    },
   
    startSearch: function ( /*String*/ key, callback)
    {
        if(!key)
        	return;
        
        this._lastQuery = key;
        
        this._abortQuery();
        
        // #5970: set _lastQuery, *then* start the timeout
        // otherwise, if the user types and the last query returns before the timeout,
        // _lastQuery won't be set and their input gets rewritten
        this.searchTimer = setTimeout(dojo.hitch(this, function ()
        {
            this.searchTimer = null;
            var startChar = this._lastQuery.charAt(0);
            if(!(this._trieTree && this._trieTreeStartChar == startChar))
            {
            	this._trieTreeStartChar = startChar;
            	this._trieTree = this.buildTrieTree(this._candidates, startChar);
            }
            var candidate = this._doSearch(this._lastQuery);
	        this._lastCandidate = candidate;    
            if(candidate && callback)
            	callback(candidate);
        }), this._searchDelay);
    },
    
    _abortQuery: function ()
    {
        // stop in-progress query
        if (this.searchTimer)
        {
            clearTimeout(this.searchTimer);
            this.searchTimer = null;
        }
    }

});