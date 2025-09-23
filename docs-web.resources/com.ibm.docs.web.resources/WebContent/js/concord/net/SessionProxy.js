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

/**
 *@author: gaowwei@cn.ibm.com
 */
dojo.provide("concord.net.SessionProxy");

concord.net.SessionProxy = new function()
{
	/**
	 * post something to a session channel, provide common handling mechanism
	 * for session related requests
	 * @param	url
	 * 			url of destination
	 * @param	c
	 * 			a JSON object data for posting
	 * @param	successHdl(data)
	 * 			a callback handler if request succeeds, the callback contains one parameter, the response as JSON object
	 * @param	errorHdl(response, ioArgs)
	 * 			a callback handler if request fails, see dojo.xhr for the parameter for detail
	 * @param	sync
	 * 			if this request need to be synchronized or not
	 * @return	
	 * 			deferral object handle of this request
	 */
	this.post = function(url, c, successHdl, errorHdl, sync)
	{
		var sData = pe.scene.docType == "sheet" ? dojo.toJson(c) :  this._toJson(c);
		var deferred = dojo.xhrPost({
			url: url,
			postData: sData,
			contentType: "text/plain; charset=UTF-8",
			handle: dojo.hitch(this, this._handle, successHdl, errorHdl),
			preventCache: true,
			sync: sync,
			timeout: g_hbTimeout
		});
		return deferred;
	};
	
	//copy from dojo.toJson in json.js, but filter all undifined and null to empty string ""
	this._toJson = function(/*Object*/ it, /*Boolean?*/ prettyPrint, /*String?*/ _indentStr){
			//	summary:
			//		Returns a [JSON](http://json.org) serialization of an object.
			//	description:
			//		Returns a [JSON](http://json.org) serialization of an object.
			//		Note that this doesn't check for infinite recursion, so don't do that!
			//	it:
			//		an object to be serialized. Objects may define their own
			//		serialization via a special "__json__" or "json" function
			//		property. If a specialized serializer has been defined, it will
			//		be used as a fallback.
			//	prettyPrint:
			//		if true, we indent objects and arrays to make the output prettier.
			//		The variable `dojo.toJsonIndentStr` is used as the indent string --
			//		to use something other than the default (tab), change that variable
			//		before calling dojo.toJson().
			//	_indentStr:
			//		private variable for recursive calls when pretty printing, do not use.
			//	example:
			//		simple serialization of a trivial object
			//		|	var jsonStr = dojo.toJson({ howdy: "stranger!", isStrange: true });
			//		|	doh.is('{"howdy":"stranger!","isStrange":true}', jsonStr);
			//	example:
			//		a custom serializer for an objects of a particular class:
			//		|	dojo.declare("Furby", null, {
			//		|		furbies: "are strange",
			//		|		furbyCount: 10,
			//		|		__json__: function(){
			//		|		},
			//		|	});
			var empty="\"\"";
			if(it === undefined){
				return (empty);
			}
			var objtype = typeof it;
			if(objtype == "number" || objtype == "boolean"){
				return it + "";
			}
			if(it === null){
				return empty;
			}
			if(dojo.isString(it)){
				return dojo._escapeString(it);
			}
			// recurse
			var recurse = arguments.callee;
			// short-circuit for objects that support "json" serialization
			// if they return "self" then just pass-through...
			var newObj;
			_indentStr = _indentStr || "";
			var nextIndent = prettyPrint ? _indentStr + dojo.toJsonIndentStr : "";
			var tf = it.__json__||it.json;
			if(dojo.isFunction(tf)){
				newObj = tf.call(it);
				if(it !== newObj){
					return recurse(newObj, prettyPrint, nextIndent);
				}
			}
			if(it.nodeType && it.cloneNode){ // isNode
				// we can't seriailize DOM nodes as regular objects because they have cycles
				// DOM nodes could be serialized with something like outerHTML, but
				// that can be provided by users in the form of .json or .__json__ function.
				throw new Error("Can't serialize DOM nodes");
			}

			var sep = prettyPrint ? " " : "";
			var newLine = prettyPrint ? "\n" : "";

			// array
			if(dojo.isArray(it)){
				var res = dojo.map(it, function(obj){
					var val = recurse(obj, prettyPrint, nextIndent);
					if(typeof val != "string"){
						val = "undefined";
					}
					return newLine + nextIndent + val;
				});
				return "[" + res.join("," + sep) + newLine + _indentStr + "]";
			}
			/*
			// look in the registry
			try {
				window.o = it;
				newObj = dojo.json.jsonRegistry.match(it);
				return recurse(newObj, prettyPrint, nextIndent);
			}catch(e){
				// console.log(e);
			}
			// it's a function with no adapter, skip it
			*/
			if(objtype == "function"){
				return null; // null
			}
			// generic object code path
			var output = [], key;
			for(key in it){
				var keyStr, val;
				if(typeof key == "number"){
					keyStr = '"' + key + '"';
				}else if(typeof key == "string"){
					keyStr = dojo._escapeString(key);
				}else{
					// skip non-string or number keys
					continue;
				}
				val = recurse(it[key], prettyPrint, nextIndent);
				if(typeof val != "string"){
					// skip non-serializable values
					continue;
				}
				// FIXME: use += on Moz!!
				//	 MOW NOTE: using += is a pain because you have to account for the dangling comma...
				output.push(newLine + nextIndent + keyStr + ":" + sep + val);
			}
			return "{" + output.join("," + sep) + newLine + _indentStr + "}"; // String


	};
	/**
	 * get something from a session channel, provide common handling mechanism
	 * for session related requests
	 * @param	url
	 * 			url of destination
	 * @param	parameter
	 * 			parameter appended in url
	 * @param	successHdl(data)
	 * 			a callback handler if request succeeds, the callback contains one parameter, the response as JSON object
	 * @param	errorHdl(response, ioArgs)
	 * 			a callback handler if request fails, see dojo.xhr for the parameter for detail
	 * @param	sync
	 * 			if this request need to be synchronized or not
	 * @return	
	 * 			deferral object handle of this request
	 */		
	this.get = function(url, parameter, successHdl, errorHdl, sync)
	{
		var deferred = dojo.xhrGet({
			url: url,
			content: parameter,
			handle: dojo.hitch(this, this._handle, successHdl, errorHdl),
			preventCache: true,
			sync: sync,
			timeout: g_hbTimeout
		});
		return deferred;
	};
	
	this._handle = function(successHdl, errorHdl, resp, ioArgs)
	{
		if (resp instanceof Error)
		{
			if (resp.dojoType == "cancel")
			{
				if (ioArgs.args.sync == true)
				{
					if (errorHdl)
					{
						errorHdl(resp, ioArgs);
					}
					return;
				}
				
				// who cancel it, who process it
				// do nothing here
				return;
			}
			
//			var respJson = dojo.fromJson(resp.responseText);
//			if (respJson && respJson.error_code === 1709)
//			{
//				// Docs server is in inactivating status, and draft format has been changed a lot
//				// we have to ask user to reload document so that active doc server will serve for it
//				// TODO: show reload dialog
//				if(respJson.reload)
//				{
//					console.log("reload for docs upgrade with big change");
//					return;
//				}
//			}

			if (errorHdl)
			{
				errorHdl(resp, ioArgs);
			}
		}
		else {
			// response returned as plain text
			// evaluate it to JSON object
			var data = null;
			try {
				data = JSON.parse(resp);
			}
			catch (err)
			{
				// cannot evaluate the response to a JSON object, possible reason:
				// 1. response just contains part of data
				// 2. session timeout, redirected to a login page
				// treat as an error response
				if (errorHdl)
				{
					errorHdl(resp, ioArgs);
				}
				return;
			}
			
			// call success callback
			if (successHdl)
			{
				successHdl(data);
			}
		}
	};
}();

