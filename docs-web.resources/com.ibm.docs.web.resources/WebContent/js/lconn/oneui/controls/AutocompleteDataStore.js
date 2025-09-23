(function() {
	dojo.provide("lconn.oneui.controls.AutocompleteDataStore");
	dojo.require("dojo.data.api.Read");
	
	function abort() {
		//console.log("abort("+this.query+")");
		var info = this._store = this._store || {};
		if (info.aborted)
			return;
		end(info);
		if (info.dfd)
			info.dfd.cancel();
	}
	
	function end(info) {
		//console.log("end()");
		info.aborted = true;
		if ("timer" in info)
			clearTimeout(info.timer);
		delete info.timer;
	}
	
	/**
	 * This data store provides a base implementation for making autocomplete style requests 
	 * to the server, where multiple requests may be made in close succession.  A configurable
	 * delay is inserted between when a call to fetch() is made and when an actual network
	 * request is made, which allows a client to invoke abort() if the previous fetch() result
	 * is no longer relevant (if a user enters more search input).  
	 * 
	 * The data store also provides a harness for combining two sets of results - a "local" set
	 * that can be used in multiple query contexts (for instance, the list of people a user
	 * frequently shares with), and a "remote" set that might need to access a server.  The two
	 * result sets can be displayed independently as the data becomes available, with the local
	 * results being displayed prior to the remote results.
	 * 
	 * This data store does NOT cache results unless a cache object is added as a member.  Cached
	 * results are kept indefinitely and it is the responsibility of the subclasser to manage
	 * that cache.
	 * 
	 * Subclasses should implement getQueryResults for remote style requests and getLocalResults
	 * for local style requests.  Both methods should return a deferred (or a DeferredList) where
	 * the callback value is an array of data store objects.  Like getQueryResults, getLocalResults
	 * is expected to return a filtered list of items.
	 * 
	 * TODO: Demonstrate "search directory"
	 * TODO: Verify delay settings against real world use
	 * TODO: Demonstrate subclasses that can handle unstable sort orders by fetching 2x / 4x results and subtracting differences
	 * TODO: Test error conditions
	 * TODO: handle auth checking
	 */
	dojo.declare("lconn.oneui.controls.AutocompleteDataStore", dojo.data.api.Read, {
		// requestDelay: number (milliseconds)
		//		Delay requests made to the server, to prevent excessive
		//		network requests.  If the request abort method is invoked
		//		before this period expires, no request will be sent to the 
		//		server.  Allows the data store to choose between rapidly
		//		displaying cached results vs. waiting to show results that
		//		must be retrieved from the server.  This value is ignored
		//		if the fetch request contains the queryOption "immediate"
		requestDelay: 200,
		
		// cachedRequestDelay: number (milliseconds)
		// 		If a fetch is requested and the result is in the local cache,
		//		wait this many milliseconds before displaying the results.
		//		Set to non-zero by default so that rapid key input won't
		//		generate multiple renders.
		cachedRequestDelay: 50,
		
		// maximumLocalResultsDelay: number (milliseconds)
		//		If the remote response returns before the local response returns, 
		//		wait at least this number of milliseconds before ignoring the
		//		local results.  For many datastores, this is only an issue for
		// 		the first request to the local results and subsequent results
		//		would return immediately.
		maximumLocalResultsDelay: 3000,
		
		// cache: object (optional)
		//		if set by a constructor, the data store will attempt to cache
		//		results from getQueryResults() into this object using the
		//		value of this.getCacheKey as the cache accessor.  If null,
		//		no caching will be performed
		cache: null,
		cachedResults: 0,
		
		// cache: object
		//		Contains the active features for this data store.
		features: {},

		/**
			Example of a local result filter, lowercases the query and then checks that the results match
			function(results, query, kwArgs) {
				query = query.toLowerCase();
				var filtered = [];
				for (var i=0,l=results.length; i<l; i++)
					if (results[i].<attr>.substr(0, query.length).toLowerCase() == query)
						filtered.push(results[i]);
				return filtered;
			}		
		 */
		
		/**
		 * Default implementation, treats attr as a member accessor on the item.
		 * If the object value is undefined, return default value instead.
		 */
		getValue: function(item, attr, defaultValue) {
			var value = item[attr];
			return (value === undefined) ? defaultValue : value;
		},
		
		fetch: function(kwArgs) {
			kwArgs.abort = abort;
			kwArgs._store = {timer: setTimeout(dojo.hitch(this, "dispatch", kwArgs), this.getDelay(kwArgs))};
			return kwArgs;
		},
		
		dispatch: function(kwArgs) {
			var dfd = this.getCachedResults(kwArgs) || this.getQueryResults(kwArgs);
			var dfdLocal = this.getLocalResults(kwArgs);
			var info = kwArgs._store;
			info.dfd = dfd;
			info.requests = (dfd ? 1 : 0) + (dfdLocal ? 1 : 0);
			
			var start = kwArgs.start || 0;
			info.skip = start;
			
			if (dfdLocal)
				dfdLocal.addCallback(this, "handle", kwArgs).addErrback(this, "error", kwArgs);
			if (dfd)
				dfd.addCallback(this, "store", kwArgs).addCallback(this, "wait", kwArgs).addErrback(this, "error", kwArgs);
			else if (!dfdLocal)
				this.handle(kwArgs, []);
		},

		wait: function(kwArgs, results) {
			var info = kwArgs._store;
			if (info.requests > 1) {
				info.requests--;
				info.pending = results;
				info.timer = setTimeout(dojo.hitch(this, "handle", kwArgs, []), this.maximumLocalResultsDelay);
			}
			else
				this.handle(kwArgs, results);
		},
		
		handle: function(kwArgs, results) {
			var info = kwArgs._store;
			if (info.aborted)
				return;

			var otherRequests = (--info.requests > 0);
			var previousResults = info.items;
			var pendingResults = info.pending;
			
			// If there are pending results (from a remote request), append them to the results
			// to ensure local requests are displayed first.
			var scope = kwArgs.scope || dojo.global();
			try {
				var items = this.notify(kwArgs, previousResults, results);
				if (pendingResults)
					items = this.notify(kwArgs, items, pendingResults);

				if (otherRequests)
					// Save this for the next request
					info.items = items;
				else {
					kwArgs.onComplete.call(scope, items, kwArgs);
					end(info); // the call is complete, timer should be terminated
				}
				
			} catch (e) {
				console.error("Unable to complete XHR", e);
			}
		},
		
		/**
		 * Notify the caller that an error has occurred.  Should only
		 * execute once, and should prevent subsequent calls.  Should
		 * not terminate executing deferreds, only prevent callbacks
		 * from being invoked.
		 */
		error: function(kwArgs, error) {
			var info = kwArgs._store;
			if (info.aborted)
				return;

			var scope = kwArgs.scope || dojo.global();
			
			// If an error occurs and multiple requests are inflight,
			// attempt to notify the caller
			var otherRequests = (--info.requests > 0);
			if (otherRequests && kwArgs.onIncrementalError) {
				if (!info.items) {
					kwArgs.onBegin.call(scope, -1, kwArgs);
					info.items = []; // subsequent calls to notify() will not invoke onBegin
				}
				kwArgs.onIncrementalError.call(scope, error, kwArgs);
				return;
			}
			end(info); // this should ensure we reach an end state
			kwArgs.onError.call(scope, error, kwArgs);
		},
		
		/**
		 * Invoke the appropriate methods on kwArgs based on whether
		 * we have existing results (have already invoked onBegin)
		 * and then return an array representing the set of items invoked.
		 * 
		 * TODO: count the number of results returned
		 * 
		 * @param previousResults The value from any previous notify() call
		 * @param results Any new results.
		 */
		notify: function(kwArgs, previousResults, results) {
			var scope = kwArgs.scope || dojo.global();
			var info = kwArgs._store;
			var skip = Math.max(0, info.skip - (results.start || 0));
			var pageSize = kwArgs.count;
			var lastIndex = results.length;
			
			// if a specific count of items was requested, determine how many results we should return
			if (pageSize > 0) {
				var remainingToFill = pageSize - (previousResults ? previousResults.length : 0);
				lastIndex = Math.min(lastIndex, Math.max(0, remainingToFill + skip));
			}
			
			if (!previousResults)
				kwArgs.onBegin.call(scope, -1, kwArgs);
			
			for (var i=skip; i<lastIndex; i++)
				kwArgs.onItem.call(scope, results[i], kwArgs);
			
			var addedItems = results.slice(skip, lastIndex);
			info.skip -= Math.min(skip, lastIndex);
			
			return (previousResults || []).concat(addedItems);
		},

		/**
		 * Return a dojo.Deferred based on the passed kwArgs.  If you need to filter the
		 * response, register a callback that transforms the result or throws an exception.
		 */
		getQueryResults: function(kwArgs) {
			/*
			 * return dojo.xhrGet({...}).addCallback(function(response) {
			 * 		// Do other transformations here
			 * 		return response.items;
			 * });
			 */
		},
		/**
		 * Return a dojo.Deferred for local results, or null if no local results are
		 * supported.  Generally, this method should save the local results and create
		 * a new Deferred object on each call.  This call must return results appropriate
		 * to the kwArgs passed to the call.
		 */
		getLocalResults: function(kwArgs) {
			/*
			 * var dfd = this._localDfd;
			 * if (!dfd)
			 * 		dfd = this._localDfd = dojo.xhrGet{{..}).addCallback(function(response) {
			 * 			// Do other transformations here
			 * 			return response.items;
			 * 		};
			 * return dfd;
			 */
		},
		
		/**
		 * Return different delay values depending on the state of the store
		 * or the query request.
		 */
		getDelay: function(kwArgs) {
			var options = kwArgs.queryOptions;
			if (options && options.immediate || kwArgs.query.length == 0)
				return 1;
			else if (this.cache && (typeof this.cache[this.getCacheKey(kwArgs)] == "object"))
				return this.cachedRequestDelay;
			return this.requestDelay;
		},
		
		/**
		 * For any given request, check whether the item is in the cache
		 * and if it is, return a Deferred object.  If cache is null then
		 * no caching will be performed.
		 */
		getCachedResults: function(kwArgs) {
			if (this.cache) {
				var key = this.getCacheKey(kwArgs);
				if (key === undefined)
					return;
				var value = this.cache[key];
				// Because some keywords match native methods (like 'sort') that
				// exist on Object.prototype, only results of type object are
				// considered valid cache results.  May need additional testing.
				if (typeof value == "object") {
					//console.log("getCachedResults("+key+")",value);
					var dfd = new dojo.Deferred();
					dfd.callback(value);
					return dfd;
				}
			}
		},
		
		/**
		 * Store the result of the response in the cache.
		 */
		store: function(kwArgs, results) {
			if (this.cache) {
				var key = this.getCacheKey(kwArgs);
				if (key === undefined)
					return;
				this.cachedResults++;
				//console.log("store("+key+")",results);
				this.cache[key] = results;
			}
		},
		
		/**
		 * Convert the kwArgs into a unique key that will be used to cache
		 * results from the getQueryResults function.
		 */
		getCacheKey: function(kwArgs) {
			return kwArgs.query.toLowerCase();
		},
		
		/**
		 * Determine whether the provided query is sufficiently complex.  Typically
		 * used to prevent very short queries to the server which would return uselessly
		 * broad result sets.  Because some languages such as Kanji and written Chinese convey
		 * more information per character, treat those characters as having a higher
		 * inherent complexity. 
		 * 
		 * For simplification purposes, all Unicode characters with a code value less than
		 * 3456 (the beginning of the Sinhala code page) are considered to have complexity
		 * 1, and all other characters are considered to have complexity 3.  This means some
		 * high code point values for extended Latin-1 characters may trigger a higher
		 * complexity value, but since they are uncommon in normal input the principal stands.
		 * 
		 * @return true if the provided query is sufficiently complex
		 */
		hasComplexity: function(kwArgs, requiredComplexity) {
			var query = kwArgs.query;
			var length = query.length;
			if (length >= requiredComplexity)
				return true;
			var complexity = 0;
			for (var i=0; i<length; i++) {
				var c = query.charCodeAt(i);
				if (c < 3456) // beginning of Sinhala code page
					complexity++;
				else
		            complexity += 3;
				if (complexity >= requiredComplexity)
					return true;
			}
			return false;
		},
		
		/**
		 * Implements the dojo.data.api.Read interface for getFeatures().  By default a
		 * data store has no features.
		 */
		getFeatures: function() {
			return this.features;
		}
	});
})();
