/*******************************************************************************
 * Licensed Materials - Property of IBM
 * (c) Copyright IBM Corporation 2005, 2010. All Rights Reserved.
 * 
 * Note to U.S. Government Users Restricted Rights:
 * Use, duplication or disclosure restricted by GSA ADP Schedule
 * Contract with IBM Corp.
 *******************************************************************************/
(function() {
dojo.provide("lconn.oneui.util.xhr");

//
// Module state
//

var _method = dojo.xhr;

/**
 * Calls any request interceptors, calls dojo.xhr, and then calls any response
 * interceptors. 
 * 
 * @param {Object} args the dojo.__xhrArgs object
 * @return {dojo.Deferred} a dojo.Deferred object that will be called when the
 *  remote request returns
 * @since 0.7
 */
var f = lconn.oneui.util.xhr = function xhr(/*String*/method, /*dojo.__XhrArgs*/ args, /*Boolean?*/ hasBody){
	/*if(dojo.isIE && method === "GET" && args.preventCache === undefined) {
		// if caller has not explicitly set args.preventCache, default to 'true'
		// to prevent IE from being over aggressive with GET XHR caching
		//console.warn("Adding cache-busting request param for IE " + dojo.isIE + " GET request");
		args.preventCache = true;
	}*/
	var request = createRequest(method, args, hasBody);
	return handleRequest(request);
};

/** Public API */

/**
 * Calls any request interceptors, calls dojo.xhrGet, and then calls any
 * response interceptors. 
 * 
 * @param {Object} args the dojo.__xhrArgs object
 * @return {dojo.Deferred} a dojo.Deferred object that will be called when the
 *  remote request returns
 * @since 0.7
 */
f.get = function(/*dojo.__xhrArgs*/ args) {
	return xhr("GET", args); // dojo.Deferred
}
	
/**
 * Calls any request interceptors, calls dojo.xhrHead, and then calls any
 * response interceptors. 
 * 
 * @param {Object} args the dojo.__xhrArgs object
 * @return {dojo.Deferred} a dojo.Deferred object that will be called when the
 *  remote request returns
 * @since 0.7
 */
f.head = function(/*dojo.__xhrArgs*/ args) {
	return xhr("HEAD", args); // dojo.Deferred
}

/**
 * Calls any request interceptors, calls dojo.xhrPost, and then calls any
 * response interceptors. 
 * 
 * @param {Object} args the dojo.__xhrArgs object
 * @return {dojo.Deferred} a dojo.Deferred object that will be called when the
 *  remote request returns
 * @since 0.7
 */
f.rawPost = f.post = function(/*dojo.__xhrArgs*/ args) {
	return xhr("POST", args, true); // dojo.Deferred
}

/**
 * Calls any request interceptors, calls dojo.xhrPut, and then calls any
 * response interceptors. 
 * 
 * @param {Object} args the dojo.__xhrArgs object
 * @return {dojo.Deferred} a dojo.Deferred object that will be called when the
 *  remote request returns
 * @since 0.7
 */
f.rawPut = f.put = function(/*dojo.__xhrArgs*/ args) {
	return xhr("PUT", args, true); // dojo.Deferred
}

/**
 * Calls any request interceptors, calls dojo.xhrDelete, and then calls any
 * response interceptors. 
 * 
 * @param {Object} args the dojo.__xhrArgs object
 * @return {dojo.Deferred} a dojo.Deferred object that will be called when the
 *  remote request returns
 * @since 0.7
 */
f.rawDelete = f["delete"] = function(/*dojo.__xhrArgs*/ args) {
	return xhr("DELETE", args); // dojo.Deferred
}

/**
 * Adds a request interceptor that will be executed before requests are sent
 * to the server. If more than one interceptor is specified, they are called
 * in the order in which they were added.
 * 
 * @param {Function} Function interceptor
 */
f.addRequestInterceptor = function(/*Function(request)*/interceptor) {
	requestInterceptors.push(interceptor);
}


/**
 * Adds a response interceptor that will be executed after responses return from
 * the server but before any callbacks are called. If more than one interceptor
 * is specified, they are called in the order in which they were added.
 * 
 * @param {Function} Function interceptor
 */
f.addResponseInterceptor = function(/*Function(request,response)*/interceptor) {
	responseInterceptors.push(interceptor);
}

f.setMethod = function(f) {
	_method = f;
}

/** End Public API */


/**
 * Responsible for sending requests and handling request state.
 */
var reqMgr = {};

/**
 * Whether or not incoming requests should be pended or sent
 */
var pendRequests = false;

/**
 * The set of pending requests
 */
var pendingRequestQueue = [];

/**
 * The set of request interceptors
 */
var requestInterceptors = [];

/**
 * Append the request interceptor to the set of registered request
 * interceptors.
 * 
 * @param {Function} interceptor the request inteceptor
 */
function addRequestInterceptor(interceptor) {
	requestInterceptors.push(interceptor);
};

/**
 * The set of response interceptors
 */
var responseInterceptors = [];

/**
 * Cancels the request. If the request manager has already sent the request,
 * it will abort the remote request; if the request manager has not yet sent
 * the request (i.e. the request is pending), the request manager will
 * remove the request from the pending queue. 
 * 
 * @param {Object} request the request to cancel
 */
function cancelRequest(request) {
	if(request.remoteDeferred) {
		// cancel the remote request. this will also result in the error
		// callback to the clientDeferred
		request.remoteDeferred.cancel();
	}else{
		for(var i=0; i<pendingRequestQueue.length; i++) {
			if(pendingRequestQueue[i].equals(request)){
				pendingRequestQueue[i].splice(i, 1);
				cancelPendingRequest(request);
				return;
			}
		}
	}
};

/**
 * Cancels all pending requests in the queue.
 */
function cancelPendingRequests() {
	pendRequests = false;
	while(pendingRequestQueue.length > 0) {
		// cancel the first element in the array
		cancelPendingRequest(pendingRequestQueue.shift());
	}
};

/**
 * Creates and returns a new {Request} object for the specified arguments.
 * 
 * @param {Object} method the HTTP method
 * @param {Object} args the dojo.__xhrArgs object
 * @param {Object} hasBody whether or not the request has a body
 */
function createRequest(method, args, hasBody) {
	return new Request(method, args, hasBody, reqMgr);
};

/**
 * Sends a request regardless of whether the request manager is in a pending
 * state. Generally clients should not use this method (preferring
 * RequestManager#handleRequest), unless they need to perform a remote action
 * to leave the pending state (e.g. send an* authentication request).
 * 
 * @param {Object} request the HTTP request to send
 * @return {dojo.Deferred} a dojo.Deferred object that will be called when the
 *  remote request returns
 */
function forceRequest(request) {
	processRequest(request);
	return request.clientDeferred;
}

/**
 * If the request manager is in a pending state, pend the request, otherwise
 * process it.
 * 
 * @param {Object} request the HTTP Request to handle
 * @return {dojo.Deferred} a dojo.Deferred object that will be called when the
 *  remote request returns
 */
function handleRequest(request) {
	if(pendRequests) {
		pendRequest(request);
	} else {
		processRequest(request);
	}
	return request.clientDeferred;
}

/**
 * Pends the request and all future requests that are sent until someone
 * calls RequestManager#sendPendingRequests
 * 
 * @param {Object} request the request to pend
 */
function pendRequest(request) {
	//console.warn("xhr: Pending request to " + request.args.url);
	pendRequests = true;
	pendingRequestQueue.push(request);
}

/**
 * Sends all pending requests in the queue. Note, if one of the pending
 * requests results in a pending state, this method will halt sending
 * remote requests until it is called again.
 */
function sendPendingRequests() {
	pendRequests = false;
	while(pendingRequestQueue.length > 0) {
		if(pendRequests) {
			break;
		}else{
			// send pending requests in FIFO order
			var request = pendingRequestQueue.shift();
			//console.warn("xhr: Sending pended request " + request.args.url);
			processRequest(request);
		}
	}
}

/**
 * Cancels a single pending request. Note, this method does not remove the
 * pending request from the queue.
 * 
 * @param {Object} request the request to cancel.
 */
function cancelPendingRequest(request) {
	var err = new Error("Request cancelled.");
	err.dojoType="cancel";
	request.clientDeferred.errback(err);
}

/**
 * Internal method that processes the request by running preprocessors,
 * sending the request to the remote server, and on return, running
 * postprocessors.
 * 
 * @param {Object} request the request to process
 * @param {Object} the request manager instance
 */
var processRequest = function(request) {
	for(var i=0; i<requestInterceptors.length; i++) {
		requestInterceptors[i](request);
	}
	
	request.args.failOk = true;
	
	// if present, temporarily strip out 'load', 'error', and 'handle' callback
	// arguments to make sure that the underlying dojo.xhrFOO request doesn't
	// callback directly to the client without going through our interceptors
	var cbCache = {};
	// the order of these matter (see dojo.xhr)
	var argFunctionNames = ["load", "error", "handle"];
	dojo.forEach(argFunctionNames, function(cbName) {
		if(!request.args || !request.args[cbName]){
			return;
		}
		cbCache[cbName] = request.args[cbName];
		request.args[cbName] = null;
	});
	
	// execute remote method
	request.remoteDeferred = _method(request.method, request.args, request.hasBody);
	
	// for 'load', 'error', and 'handle' arguments, register the appropriate
	// deferred callback and restore the function to the args object
	dojo.forEach(argFunctionNames, function(cbName) {
		var func = cbCache[cbName];
		if(!func) {
			return;
		}
		// restore the reference to the function in the args object
		request.args[cbName] = func;
		if(!request.oldMethods[cbName]) {
			// keep track of the fact that we've already created a deferred
			// object for this old method so that we don't create additional
			// deferreds in replay scenarios (e.g. log in)
			request.oldMethods[cbName] = true;
			// add the appropriate deferred callback and run function in the
			// scope of the argument object, as per dojo.xhr
			var dfdMethod = cbName === "load" ? "addCallback" : cbName === "error" ? "addErrback" : "addBoth";
			request.clientDeferred[dfdMethod](function(dojoResponse) {
				return func.call(request.args, dojoResponse, request.remoteDeferred.ioArgs)
			});
		}
	});
	
	// copy a reference of the Dojo ioArgs
	request.clientDeferred.ioArgs = request.remoteDeferred.ioArgs;
	
	// attach our single response processor to the remote response
	request.remoteDeferred.addBoth(function(dojoResponse) {
		var response = new Response(request.remoteDeferred.ioArgs.xhr, dojoResponse);
		var cancel = false;
		for(var i=0; i<responseInterceptors.length; i++) {
			cancel = responseInterceptors[i](request, response, reqMgr);
			if(cancel) {
				return; // early return
			}
		}
		if(response.dojoResponse instanceof Error) {
			request.clientDeferred.errback(response.dojoResponse);
		} else {
			request.clientDeferred.callback(response.dojoResponse);
		}
		return response.dojoResponse;
	});
};

// used to uniquely identify Request objects
var requestIdCounter = 1;

/**
 * An abstraction of the request to send. Holds all of the request state
 * (method, args, hasBody) as well as a reference to the dojo.Deferred object
 * returned from dojo.xhr as well as a reference to the dojo.Deferred object
 * returned to the calling client.
 * 
 * Using this method we can hold references to Requests across asyncronous
 * events and resend requests (e.g. in the case of an authentication challenge).
 * 
 * @param {Object} method the HTTP method
 * @param {Object} args the dojo.__xhrArgs object
 * @param {Object} hasBody whether or not the request has the body
 * @param {Object} context the calling RequestManager
 */
function Request(method, args, hasBody, context) {
	var id = requestIdCounter++;
	
	this.getID = function() {
		return id;
	}
	
	this.method = method;
	this.args = args;
	this.hasBody = hasBody;
	this.context = context;
	this.oldMethods = {};
	
	var self = this;
	
	function cancel(clientDeferred) {
		cancelRequest(self);
	}
	
	function equals(request){
		return request && dojo.isFunction(request.getID) && request.getID() === self.id;
	}
	
	this.clientDeferred = new dojo.Deferred(cancel);
	this.remoteDeferred = null; // to be filled in by remote call
}

/**
 * A thin abstraction of the response. Currently only contains the methods
 * needed by the AuthenticationInterceptor function.
 * 
 * @param {Object} xhrObj the XHR object associated with a remote request
 */
function Response(xhrObj, dojoResponse) {
	var xhr = xhrObj;
	
	this.dojoResponse = dojoResponse;
	
	this.getHeader = function(headerName) {
		if (xhr.readyState > 1)
			return xhr.getResponseHeader(headerName);
	}
	
	this.getStatusCode = function() {
		return xhr.status;
	}
}

})();
