(function() {
	
dojo.provide("lconn.core.widget.autocomplete.PeopleDataStore");
dojo.require("lconn.oneui.controls.AutocompleteDataStore");

function quoteRegExp(str) {
    return str.replace(/([.?*+^$[\]\\(){}-])/g, "\\$1");
};

dojo.declare("lconn.core.widget.autocomplete.PeopleDataStore", lconn.oneui.controls.AutocompleteDataStore, {
	
	constructor: function() {
//		var people = dojo.getObject("lconn.social.layout.people");
//		if (people && people.isImageEnabled())
//			this.getPhotoUrl = this.getConnectionsPhotoUrl;
	},
	
	// handleAs: string
	// 		Passed to dojo.xhrGet.
	handleAs: "json-comment-optional",
	supportsDirectorySearch: false,
	minimumComplexity: 2,
	
	// convertResponse: function(response) (optional)
	//		Convert the response object into an Array with child objects such that:
	//			1) The array represents the set of items for the current query
	//			2) If more results are available, the hasMore member of the array is set to true
	//			3) If a total size of results is available, the total member of the array is set to the number of items
	//			4) If this is a paged result, the start member of the array is set to the index of the first item in the 
	//				overall listing
	//			6) Each item is an object which obeys the constraints defined on lconn.core.widget.autocomplete.person
	//		This member may be set to null to imply that no transformation must be done of the response.
	//		The default implementation assumes the response is an array object.
	convert: function(kwArgs, response) {
		var items = response.items || [];
		items.hasMore = response.hasMore;
		var start = (kwArgs.start || 0)
		
		// Directory searches do not have stable sort orders, so we load a large page of results
		// and then internally page them
		if (!kwArgs.queryOptions.directory)
			items.start = start;
		if (response.totalSize >= 0) {
			items.total = response.totalSize;
			if (items.hasMore === undefined)
				items.hasMore = (response.totalSize - items.length - start > 0);
		}
		return items;
	},
	
	filter: function(kwArgs, results) {
		var query = kwArgs.query.toLowerCase();
		var filtered = [];
		var re = new RegExp("\\b"+quoteRegExp(query), "i");
		for (var i=0,l=results.length; i<l; i++) {
			var item = results[i];
			if (re.test(item.name) || re.test(item.email) || re.test(item.title))
				filtered.push(results[i]);
		}
		return filtered;
	},

	getValue: function(item, attr, defaultValue) {
		if (attr == "photo")
			return this.getPhotoUrl(item, defaultValue);
		var value = item[attr];
		return (value === undefined) ? defaultValue : value;
	},
		
	getQueryResults: function(kwArgs) {
		var hasComplexity = this.hasComplexity(kwArgs, this.minimumComplexity); 
		if (hasComplexity) {
			var deferred = dojo.xhrGet({url: this.getUrl(kwArgs), handleAs: this.handleAs});
			deferred.addCallback(this, "convert", kwArgs);
			return deferred;
		}
	},
	
	getPhotoUrl: function(item, defaultValue) {
		return null;
	},
	
//	getConnectionsPhotoUrl: function(item, defaultValue) {
//		var userid = this.getValue(item, "id");
//		return lconn.social.layout.people.getImageUrl({userid: userid}, 32);
//	},
	
	getFeatures: function() {
		return dojo.mixin({
			"lconn.core.widget.autocomplete.directorysearch": this.supportsDirectorySearch,
			'lconn.core.widget.autocomplete.complexity': this.minimumComplexity
		}, this.inherited(arguments));
	},
	
	getCacheKey: function(kwArgs) {
		var s = kwArgs.queryOptions.directory 
			? ("d_")
			: ("f_" + (kwArgs.start || 0) + "_" + kwArgs.count + "_");
		s +=  kwArgs.query.toLowerCase();
		return s;
	}
	
	/* 
	getUrl: function(kwArgs) {
		return url;
	}
	*/
});

})();
