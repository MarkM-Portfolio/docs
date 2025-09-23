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

dojo.provide("concord.widgets.typeahead.data.HighlightFilter");
dojo.require("dojo.regexp");
/**
** HighlightFilter defines a reusable _filter method
** which can be mixed in to other stores to provide _filter
** which also highlights hits in search results
**/

dojo.declare("concord.widgets.typeahead.data.HighlightFilter", 
	null,
	{
	
	searchAttributes: null,		//an array of attributes to search against
	highlightAttributes: null,	//an array of attributes to highlight
	sortBy: "",					//an attribute to sort results by
	oEscapedMap : {"(" : 1, "[": 1, "\\": 1}, // escaped chars when creating regexps
	
	constructor: function(parms){
		console.debug("HighlightFilter.constructor()");
		console.debug("searchAttr", this.searchAttributes);
		
		//since these aren't primitives we need(?) to mixin in constructor
		if (parms && parms.searchAttributes) this.searchAttributes = parms.searchAttributes;
		if (parms && parms.highlightAttributes) this.highlightAttributes = parms.highlightAttributes;
	},
		
	_filter: function(requestArgs, arrayOfItems, findCallback){
		console.debug("HighlightFilter._filter");
		var items = [];
		var searchStr = "";
		
		try{
			searchStr = requestArgs.query[this.searchAttributes[0]];
			searchStr = searchStr.replace("*", "");
			searchStr = searchStr.replace(",", " ");
			searchStr = dojo.string.trim(searchStr);
			searchStr = searchStr.toLowerCase();
		}catch(e){
			searchStr = "";
		}
		
		//console.debug("check for cached results under key", searchStr);

		var entry = this.getCacheEntry(searchStr);
		
		if(entry){
			console.debug("found a cached entry for", searchStr);
			findCallback(entry.items, requestArgs);
			return;			
		}
					
		//console.debug("no cached results found, build");

		if (searchStr != ""){
			//console.debug("have a query string, search items=", searchStr);			
			//var ignoreCase = requestArgs.queryOptions ? requestArgs.queryOptions.ignoreCase : false;
			
			var tokens = searchStr.split(" ");
			var expressions = [];
			
			//build a regular expression from each token
			for (var i=0; i<tokens.length; i++){
				if (dojo.string.trim(tokens[i]) == "") continue;
				var re = new RegExp("((^|\\s)" + dojo.regexp.escapeString(tokens[i])  + ")", "i");
				expressions.push(re);
			}

			for(var i = 0; i < arrayOfItems.length; ++i){
				var match = true;
				var candidateItem = arrayOfItems[i];
				if(candidateItem === null){
					match = false;
				}else{	
					//test each expression
					//must match at least one search attribute in candidate item
					for (var e = 0; e<expressions.length; e++){
						var expression = expressions[e];
						var tokenMatch = false;
						for (var s=0; s<this.searchAttributes.length; s++){
							var attr = this.searchAttributes[s];
							var val = this.getValue(candidateItem, attr, "");
							if (!val) val = "";
							tokenMatch = val.match(expression);
							if (tokenMatch) break;
						}
						if (!tokenMatch){
							match = false;
							break;	
						}
					}
				}
				if(match){
					//we've got a match, highlight hit areas			
					for (var s=0; s<this.highlightAttributes.length; s++){
						var attr = this.highlightAttributes[s];
						var val = this.getValue(candidateItem, attr, "");
						if (!val) val = "";
						for (var e = 0; e<expressions.length; e++){
						    val = val.replace(/</g, "&lt;").replace(expressions[e], "<b>$1</b>");
						}
						this.setValue(candidateItem, attr + "H", val);
					}
					
					items.push(candidateItem);
				}
			}
		}else{
			// We want a copy to pass back in case the parent wishes to sort the array. 
			// We shouldn't allow resort of the internal list, so that multiple callers 
			// can get lists and sort without affecting each other.  We also need to
			// filter out any null values that have been left as a result of deleteItem()
			// calls in ItemFileWriteStore.
			
			//console.debug("no query, push all items into result");
			
			for(var i = 0; i < arrayOfItems.length; ++i){
				var item = arrayOfItems[i];
				if(item !== null){
					//copy an empty hit highlight for each
					//FIXME: this is a bit wasteful, but if we're caching we're only doing it once				
					for (var s=0; s<this.highlightAttributes.length; s++){
						var attr = this.highlightAttributes[s];
						var val = this.getValue(item, attr, "");
						if (!val) val = "";
						this.setValue(item, attr + "H", this.getValue(item, attr, ""));
					}
					
					items.push(item);
				}
			}
		}

		if (this.sortBy){
			console.debug("sort items by", this.sortBy, new Date().getTime(), items.length);
			//perform a case insensitive search on the items
			var k = this.sortBy;
			items = items.sort(function(a, b){
				var af = a[k][0].toLowerCase();
				var bf = b[k][0].toLowerCase();
				if (af < bf) return -1;
				if (af > bf) return 1;
				return 0;
			});
			console.debug("sorted", new Date().getTime());
		}
		
		//console.debug("cache sorted items with key=", searchStr, "length", items.length);			
		this.cacheEntry(searchStr, items);
		
		//console.debug("findCallback", items);

		findCallback(items, requestArgs);		
	}
});

