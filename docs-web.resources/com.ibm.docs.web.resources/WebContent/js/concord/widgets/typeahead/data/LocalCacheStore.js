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

/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright IBM Corp. 2007, 2012                                    */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.widgets.typeahead.data.LocalCacheStore");
dojo.require("dojo.data.ItemFileWriteStore");

/**
** Extend dojo.data.ItemFileWriteStore to allow for caching fetch results
** handles invalidating cache when an item in the store is changed
**/

dojo.declare("concord.widgets.typeahead.data.LocalCacheStore", 
	dojo.data.ItemFileWriteStore,
	{
	
	cache: [],	//a cache to store sorted query results
	
	constructor: function(){
		console.debug("LocalCacheStore.constructor()");
		try{
			dojo.connect(this, "onDelete", this, "_invalidate");
			dojo.connect(this, "onNew", this, "_invalidate");
			dojo.connect(this, "onSet", this, "_onSet");			
		}catch(e){
			console.debug(e);
		}
	},
	
	//something has changed in our data store
	//invalidate the cache
	_invalidate: function(){
		this.cache = [];
	},
	
	//when an item is updated, 
	//if the attribute was not a hit highlight
	//invalidate the cache
	_onSet: function(item, attribute){
		if (!this.isIgnoredAttribute(attribute)){
			this._invalidate();
		}
	},
	
	//by default don't ignore any changes
	//subclasses may override to enumerate attributes they wish to ignore
	//e.g. hit highlights
	isIgnoredAttribute: function(attribute){
		return false;
	},
		
	//search our cache for an entry by key
	getCacheEntry: function(key){
		for(var e=0; e<this.cache.length; e++){
			var entry = this.cache[e];
			//console.debug("checking", entry);
			if (entry.key == key){
				return entry;
			}
		}
		return null;
	},
	
	cacheEntry: function(key, items){
		this.cache.push({"key": key, "items": items});	
	}
});

