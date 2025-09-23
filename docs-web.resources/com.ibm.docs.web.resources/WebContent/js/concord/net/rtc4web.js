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

/*
	Copyright (c) 2004-2010, The Dojo Foundation All Rights Reserved.
	Available via Academic Free License >= 2.1 OR the modified BSD license.
	see: http://dojotoolkit.org/license for details
*/

/*
	This is an optimized version of Dojo, built for deployment and not for
	development. To get sources and documentation, please visit:

		http://dojotoolkit.org
*/

dojo.provide("concord.net.rtc4web");
if(!dojo._hasResource["dojox.collections._base"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.collections._base"] = true;
dojo.provide("dojox.collections._base");

dojox.collections.DictionaryEntry=function(/* string */k, /* object */v){
	//	summary
	//	return an object of type dojox.collections.DictionaryEntry
	this.key=k;
	this.value=v;
	this.valueOf=function(){ 
		return this.value; 	//	object
	};
	this.toString=function(){ 
		return String(this.value);	//	string 
	};
}

/*	Iterators
 *	The collections.Iterators (Iterator and DictionaryIterator) are built to
 *	work with the Collections included in this module.  However, they *can*
 *	be used with arrays and objects, respectively, should one choose to do so.
 */
dojox.collections.Iterator=function(/* array */arr){
	//	summary
	//	return an object of type dojox.collections.Iterator
	var a=arr;
	var position=0;
	this.element=a[position]||null;
	this.atEnd=function(){
		//	summary
		//	Test to see if the internal cursor has reached the end of the internal collection.
		return (position>=a.length);	//	bool
	};
	this.get=function(){
		//	summary
		//	Get the next member in the collection.
		if(this.atEnd()){
			return null;		//	object
		}
		this.element=a[position++];
		return this.element;	//	object
	};
	this.map=function(/* function */fn, /* object? */scope){
		//	summary
		//	Functional iteration with optional scope.
		return dojo.map(a, fn, scope);
	};
	this.reset=function(){
		//	summary
		//	reset the internal cursor.
		position=0;
		this.element=a[position];
	};
}

/*	Notes:
 *	The DictionaryIterator no longer supports a key and value property;
 *	the reality is that you can use this to iterate over a JS object
 *	being used as a hashtable.
 */
dojox.collections.DictionaryIterator=function(/* object */obj){
	//	summary
	//	return an object of type dojox.collections.DictionaryIterator
	var a=[];	//	Create an indexing array
	var testObject={};
	for(var p in obj){
		if(!testObject[p]){
			a.push(obj[p]);	//	fill it up
		}
	}
	var position=0;
	this.element=a[position]||null;
	this.atEnd=function(){
		//	summary
		//	Test to see if the internal cursor has reached the end of the internal collection.
		return (position>=a.length);	//	bool
	};
	this.get=function(){
		//	summary
		//	Get the next member in the collection.
		if(this.atEnd()){
			return null;		//	object
		}
		this.element=a[position++];
		return this.element;	//	object
	};
	this.map=function(/* function */fn, /* object? */scope){
		//	summary
		//	Functional iteration with optional scope.
		return dojo.map(a, fn, scope);
	};
	this.reset=function() { 
		//	summary
		//	reset the internal cursor.
		position=0; 
		this.element=a[position];
	};
};

}

if(!dojo._hasResource["dojox.collections.Dictionary"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.collections.Dictionary"] = true;
dojo.provide("dojox.collections.Dictionary");


dojox.collections.Dictionary=function(/* dojox.collections.Dictionary? */dictionary){
	//	summary
	//	Returns an object of type dojox.collections.Dictionary
	var items={};
	this.count=0;

	//	comparator for property addition and access.
	var testObject={};

	this.add=function(/* string */k, /* object */v){
		//	summary
		//	Add a new item to the Dictionary.
		var b=(k in items);
		items[k]=new dojox.collections.DictionaryEntry(k,v);
		if(!b){
			this.count++;
		}
	};
	this.clear=function(){
		//	summary
		//	Clears the internal dictionary.
		items={};
		this.count=0;
	};
	this.clone=function(){
		//	summary
		//	Returns a new instance of dojox.collections.Dictionary; note the the dictionary is a clone but items might not be.
		return new dojox.collections.Dictionary(this);	//	dojox.collections.Dictionary
	};
	this.contains=this.containsKey=function(/* string */k){
		//	summary
		//	Check to see if the dictionary has an entry at key "k".
		if(testObject[k]){
			return false;			// bool
		}
		return (items[k]!=null);	//	bool
	};
	this.containsValue=function(/* object */v){
		//	summary
		//	Check to see if the dictionary has an entry with value "v".
		var e=this.getIterator();
		while(e.get()){
			if(e.element.value==v){
				return true;	//	bool
			}
		}
		return false;	//	bool
	};
	this.entry=function(/* string */k){
		//	summary
		//	Accessor method; similar to dojox.collections.Dictionary.item but returns the actual Entry object.
		return items[k];	//	dojox.collections.DictionaryEntry
	};
	this.forEach=function(/* function */ fn, /* object? */ scope){
		//	summary
		//	functional iterator, following the mozilla spec.
		var a=[];	//	Create an indexing array
		for(var p in items) {
			if(!testObject[p]){
				a.push(items[p]);	//	fill it up
			}
		}
		dojo.forEach(a, fn, scope);
	};
	this.getKeyList=function(){
		//	summary
		//	Returns an array of the keys in the dictionary.
		return (this.getIterator()).map(function(entry){ 
			return entry.key; 
		});	//	array
	};
	this.getValueList=function(){
		//	summary
		//	Returns an array of the values in the dictionary.
		return (this.getIterator()).map(function(entry){ 
			return entry.value; 
		});	//	array
	};
	this.item=function(/* string */k){
		//	summary
		//	Accessor method.
		if(k in items){
			return items[k].valueOf();	//	object
		}
		return undefined;	//	object
	};
	this.getIterator=function(){
		//	summary
		//	Gets a dojox.collections.DictionaryIterator for iteration purposes.
		return new dojox.collections.DictionaryIterator(items);	//	dojox.collections.DictionaryIterator
	};
	this.remove=function(/* string */k){
		//	summary
		//	Removes the item at k from the internal collection.
		if(k in items && !testObject[k]){
			delete items[k];
			this.count--;
			return true;	//	bool
		}
		return false;	//	bool
	};

	if (dictionary){
		var e=dictionary.getIterator();
		while(e.get()) {
			 this.add(e.element.key, e.element.value);
		}
	}
};

}

if(!dojo._hasResource["dojox.collections.ArrayList"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojox.collections.ArrayList"] = true;
dojo.provide("dojox.collections.ArrayList");


dojox.collections.ArrayList=function(/* array? */arr){
	//	summary
	//	Returns a new object of type dojox.collections.ArrayList
	var items=[];
	if(arr) items=items.concat(arr);
	this.count=items.length;
	this.add=function(/* object */obj){
		//	summary
		//	Add an element to the collection.
		items.push(obj);
		this.count=items.length;
	};
	this.addRange=function(/* array */a){
		//	summary
		//	Add a range of objects to the ArrayList
		if(a.getIterator){
			var e=a.getIterator();
			while(!e.atEnd()){
				this.add(e.get());
			}
			this.count=items.length;
		}else{
			for(var i=0; i<a.length; i++){
				items.push(a[i]);
			}
			this.count=items.length;
		}
	};
	this.clear=function(){
		//	summary
		//	Clear all elements out of the collection, and reset the count.
		items.splice(0, items.length);
		this.count=0;
	};
	this.clone=function(){
		//	summary
		//	Clone the array list
		return new dojox.collections.ArrayList(items);	//	dojox.collections.ArrayList
	};
	this.contains=function(/* object */obj){
		//	summary
		//	Check to see if the passed object is a member in the ArrayList
		for(var i=0; i < items.length; i++){
			if(items[i] == obj) {
				return true;	//	bool
			}
		}
		return false;	//	bool
	};
	this.forEach=function(/* function */ fn, /* object? */ scope){
		//	summary
		//	functional iterator, following the mozilla spec.
		dojo.forEach(items, fn, scope);
	};
	this.getIterator=function(){
		//	summary
		//	Get an Iterator for this object
		return new dojox.collections.Iterator(items);	//	dojox.collections.Iterator
	};
	this.indexOf=function(/* object */obj){
		//	summary
		//	Return the numeric index of the passed object; will return -1 if not found.
		for(var i=0; i < items.length; i++){
			if(items[i] == obj) {
				return i;	//	int
			}
		}
		return -1;	// int
	};
	this.insert=function(/* int */ i, /* object */ obj){
		//	summary
		//	Insert the passed object at index i
		items.splice(i,0,obj);
		this.count=items.length;
	};
	this.item=function(/* int */ i){
		//	summary
		//	return the element at index i
		return items[i];	//	object
	};
	this.remove=function(/* object */obj){
		//	summary
		//	Look for the passed object, and if found, remove it from the internal array.
		var i=this.indexOf(obj);
		if(i >=0) {
			items.splice(i,1);
		}
		this.count=items.length;
	};
	this.removeAt=function(/* int */ i){
		//	summary
		//	return an array with function applied to all elements
		items.splice(i,1);
		this.count=items.length;
	};
	this.reverse=function(){
		//	summary
		//	Reverse the internal array
		items.reverse();
	};
	this.sort=function(/* function? */ fn){
		//	summary
		//	sort the internal array
		if(fn){
			items.sort(fn);
		}else{
			items.sort();
		}
	};
	this.setByIndex=function(/* int */ i, /* object */ obj){
		//	summary
		//	Set an element in the array by the passed index.
		items[i]=obj;
		this.count=items.length;
	};
	this.toArray=function(){
		//	summary
		//	Return a new array with all of the items of the internal array concatenated.
		return [].concat(items);
	}
	this.toString=function(/* string */ delim){
		//	summary
		//	implementation of toString, follows [].toString();
		return items.join((delim||","));
	};
};

}

if(!dojo._hasResource["rtc4web.core.RTCCollection"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["rtc4web.core.RTCCollection"] = true;
// TODO: remove old mjp code

dojo.provide("rtc4web.core.RTCCollection");




rtc4web.core.RTCCollection = function(/*RTSession*/session, /*String*/name){

	//collection types (static'ish)
	this.RTC_UNKNOWN = "unknown";
	this.RTC_LIST = "list";
	this.RTC_MAP = "map";
	this.RTC_CHANNEL = "channel";

	this.session = session;	//the session this collection lives in
	this.name = name;		//the name of the collection
	this.collection = null; //don't construct until we know type
//	this.mjp = null;		//method join points wired to our handler
	this.connectionHandle = null; // Connection handler with the method "handle"
	this.errorListener = null; // rtc4web long poller error handler
	this.type = this.RTC_UNKNOWN;//what type of collection is this

	this.getType = function(){
		return this.type;
	}
	
	this.setType = function(/*String*/type){
		if (this.type == this.RTC_UNKNOWN){
			this.type = type;
			if (this.type == this.RTC_MAP){
				this.collection = new dojox.collections.Dictionary();
			}else if (this.type == this.RTC_LIST){
				this.collection = new dojox.collections.ArrayList();
			}else{
				dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCCollection", "setType", "unknown type, defaulting to RTC_CHANNEL"]);
				this.type = this.RTC_CHANNEL;
			}
		}else if (this.type != type){
			dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCCollection", "setType", "can't change type of this collection: " + this.name + " already set to " + this.type]);
		}
	}
	
	//handle incoming changes from RTCUpdator
	this.handle = function(/*Object*/evt){
		//set our type based on an inbound event's type
		this.setType(evt.type);
		
		if (this.type == this.RTC_MAP){
			//treat as map
			if (evt.op == "add" || evt.op == "change"){
				this.collection.add(evt.key, evt.value);
			}else if (evt.op == "remove"){
				this.collection.remove(evt.key);
			}
		}else if (this.type == this.RTC_LIST){
			//treat as list
			if (evt.op == "add"){
				this.collection.add(evt.value);
			}else if (evt.op == "change"){
				var idx = this.collection.indexOf(evt.oldValue);
				if (idx > -1){
					this.collection.setByIndex(idx, evt.value);
				}else{
					this.collection.add(evt.value);
				}
			}else if (evt.op == "remove"){
				this.collection.remove(evt.value);
			}
		}
	}

	//add a listener to this RTCCollection
	//at connect time the listener will receive add callbacks for all items currently in collection
	this.addListener = function(/*Object*/thisObject, /*String|Function*/method, /*String|Function*/errorHandle, /*Boolean*/futureOnly){
		//check current length so we know if we connected or not
//		var len = this.mjp ? this.mjp.after.length : 0;

		//connect the advice callback to our internal handler
//		this.mjp = dojo.connect(this, "handle", thisObject, method);
		this.connectionHandle = dojo.connect(this, "handle", thisObject, method);
		
		// Subscribe the topic "/concord/rtc/error", so that can handle rtc4web error.
		if (errorHandle)
		{
			this.errorListener = dojo.subscribe("/concord/rtc/error", errorHandle);
		}

//		//if a join point was added and the user hasn't requested futureOnly
		//if the user hasn't requested futureOnly
//		if (this.mjp.after.length > len && !futureOnly){
		if (!futureOnly){
			if (this.collection){
				var fcn = (dojo.isString(method) ? thisObject[method] : method) || function(){};
				var it = this.collection.getIterator();
	
				while(it.get()){
					var upd = null;
					switch (this.type){
						case this.RTC_MAP:
							upd = { op: "change", key: it.element.key, value: it.element.value };
							break;
						case this.RTC_LIST:
							upd = { op: "add", value: it.element };
							break;
					}
					fcn.apply(thisObject, [upd]);
				}
			}else{
				dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCCollection", "addListener", "no pending collection for: " + this.name]);
			}
		}else{
			dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCCollection", "addListener", "ignoring connect request, futureOnly"]);
		}
		
		return this.connectionHandle;
	}
	 
//	//remove a listener, thisObject and method must match addListener
//	this.removeListener = function(thisObject, method){
	this.removeListener = function(/*Handle*/handle){
		//disconnect the callback
//		dojo.disconnect(this.mjp);
		if (this.connectionHandle)
		{
			dojo.disconnect(this.connectionHandle);
		}
		// Unsubscribe the topic "/concord/rtc/error".
		if (this.errorListener)
		{
			dojo.unsubscribe(this.errorListener);
		}
		dojo.disconnect(handle);
	}

	//put in map
	//this is a helper that makes the rtc call to put the key/value in the map
	//the map is not directly modified and instead will be updated when callback runs
	this.put = function(/*String*/key, /*String|Number|Object|Anything?*/value){
		var deferred = null;
		
		if (dojo.isObject(value)) value = dojo.toJson(value);
		if (arguments.length == 1 && this.type != this.RTC_MAP){
			//assuming you meant add
			deferred = this.add(key);
		}else{
			this.setType(this.RTC_MAP);
			deferred = this.session.putInMap(this.name, key, value);
		}
		
		return deferred;
	}
	
	//add to list
	//this is a helper that makes the rtc call to put the value in the list
	//the value does not go directly into the list and instead will be added when callback runs
	this.add = function(/*String|Number|Object|Anything?*/value){
		var deferred = null;
		
		if (dojo.isObject(value)) value = dojo.toJson(value);
		if (arguments.length == 2 && this.type != this.RTC_LIST){
			//assuming you meant put
			deferred = this.put(value, arguments[1]);
		}else{
			this.setType(this.RTC_LIST);
			deferred = this.session.putInList(this.name, value);
		}
		
		return deferred;
	}

	//remove an item from the collection
	//this is a helper that makes the rtc call to remove the item
	//the value is not directly removed and instead will be removed when callback runs
	//must know type before calling remove()
	this.remove = function(/*String|Number|Object|Anything?*/key){
		var deferred = null;
		
		if (this.type == this.RTC_LIST){
			deferred = this.session.removeFromList(this.name, key);
			//alert('list remove helper not implemented');
		}else if (this.type == this.RTC_MAP){
			deferred = this.session.removeFromMap(this.name, key);
		}
		
		return deferred;
	}

	//return a clone of the internal collection
	this.getCollection = function(){
		return this.collection ? this.collection.clone() : null;
	}
	
	//return an iterator on our collection
	this.getIterator = function(){
		return this.collection ? this.collection.getIterator() : null;
	}
}

}

if(!dojo._hasResource["dojo.regexp"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.regexp"] = true;
dojo.provide("dojo.regexp");

/*=====
dojo.regexp = {
	// summary: Regular expressions and Builder resources
};
=====*/

dojo.regexp.escapeString = function(/*String*/str, /*String?*/except){
	//	summary:
	//		Adds escape sequences for special characters in regular expressions
	// except:
	//		a String with special characters to be left unescaped

	return str.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, function(ch){
		if(except && except.indexOf(ch) != -1){
			return ch;
		}
		return "\\" + ch;
	}); // String
}

dojo.regexp.buildGroupRE = function(/*Object|Array*/arr, /*Function*/re, /*Boolean?*/nonCapture){
	//	summary:
	//		Builds a regular expression that groups subexpressions
	//	description:
	//		A utility function used by some of the RE generators. The
	//		subexpressions are constructed by the function, re, in the second
	//		parameter.  re builds one subexpression for each elem in the array
	//		a, in the first parameter. Returns a string for a regular
	//		expression that groups all the subexpressions.
	// arr:
	//		A single value or an array of values.
	// re:
	//		A function. Takes one parameter and converts it to a regular
	//		expression. 
	// nonCapture:
	//		If true, uses non-capturing match, otherwise matches are retained
	//		by regular expression. Defaults to false

	// case 1: a is a single value.
	if(!(arr instanceof Array)){
		return re(arr); // String
	}

	// case 2: a is an array
	var b = [];
	for(var i = 0; i < arr.length; i++){
		// convert each elem to a RE
		b.push(re(arr[i]));
	}

	 // join the REs as alternatives in a RE group.
	return dojo.regexp.group(b.join("|"), nonCapture); // String
}

dojo.regexp.group = function(/*String*/expression, /*Boolean?*/nonCapture){
	// summary:
	//		adds group match to expression
	// nonCapture:
	//		If true, uses non-capturing match, otherwise matches are retained
	//		by regular expression. 
	return "(" + (nonCapture ? "?:":"") + expression + ")"; // String
}

}

if(!dojo._hasResource["dojo.cookie"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["dojo.cookie"] = true;
dojo.provide("dojo.cookie");



/*=====
dojo.__cookieProps = function(){
	//	expires: Date|String|Number?
	//		If a number, the number of days from today at which the cookie
	//		will expire. If a date, the date past which the cookie will expire.
	//		If expires is in the past, the cookie will be deleted.
	//		If expires is omitted or is 0, the cookie will expire when the browser closes. << FIXME: 0 seems to disappear right away? FF3.
	//	path: String?
	//		The path to use for the cookie.
	//	domain: String?
	//		The domain to use for the cookie.
	//	secure: Boolean?
	//		Whether to only send the cookie on secure connections
	this.expires = expires;
	this.path = path;
	this.domain = domain;
	this.secure = secure;
}
=====*/


dojo.cookie = function(/*String*/name, /*String?*/value, /*dojo.__cookieProps?*/props){
	//	summary: 
	//		Get or set a cookie.
	//	description:
	// 		If one argument is passed, returns the value of the cookie
	// 		For two or more arguments, acts as a setter.
	//	name:
	//		Name of the cookie
	//	value:
	//		Value for the cookie
	//	props: 
	//		Properties for the cookie
	//	example:
	//		set a cookie with the JSON-serialized contents of an object which
	//		will expire 5 days from now:
	//	|	dojo.cookie("configObj", dojo.toJson(config), { expires: 5 });
	//	
	//	example:
	//		de-serialize a cookie back into a JavaScript object:
	//	|	var config = dojo.fromJson(dojo.cookie("configObj"));
	//	
	//	example:
	//		delete a cookie:
	//	|	dojo.cookie("configObj", null, {expires: -1});
	var c = document.cookie;
	if(arguments.length == 1){
		var matches = c.match(new RegExp("(?:^|; )" + dojo.regexp.escapeString(name) + "=([^;]*)"));
		return matches ? decodeURIComponent(matches[1]) : undefined; // String or undefined
	}else{
		props = props || {};
// FIXME: expires=0 seems to disappear right away, not on close? (FF3)  Change docs?
		var exp = props.expires;
		if(typeof exp == "number"){ 
			var d = new Date();
			d.setTime(d.getTime() + exp*24*60*60*1000);
			exp = props.expires = d;
		}
		if(exp && exp.toUTCString){ props.expires = exp.toUTCString(); }

		value = encodeURIComponent(value);
		var updatedCookie = name + "=" + value, propName;
		for(propName in props){
			updatedCookie += "; " + propName;
			var propValue = props[propName];
			if(propValue !== true){ updatedCookie += "=" + propValue; }
		}
		document.cookie = updatedCookie;
	}
};

dojo.cookie.isSupported = function(){
	//	summary:
	//		Use to determine if the current browser supports cookies or not.
	//		
	//		Returns true if user allows cookies.
	//		Returns false if user doesn't allow cookies.

	if(!("cookieEnabled" in navigator)){
		this("__djCookieTest__", "CookiesAllowed");
		navigator.cookieEnabled = this("__djCookieTest__") == "CookiesAllowed";
		if(navigator.cookieEnabled){
			this("__djCookieTest__", "", {expires: -1});
		}
	}
	return navigator.cookieEnabled;
};

}

if(!dojo._hasResource["rtc4web.core.RTCUpdater"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["rtc4web.core.RTCUpdater"] = true;
// TODO: make updateState & headUpdaterWindowName into static vars?

dojo.provide("rtc4web.core.RTCUpdater");




/*
* new function(){}();
* This syntax creates a singleton class that we can call methods on without calling new.
*/
rtc4web.core.RTCUpdater = new function()
{
	this.isSharedMode = false;
	this.sid = "";
	this.docSession = null;
	
	//updateState can be STARTED/STOPPED/PAUSED

	this.updateState = "STOPPED";
	this.servletUrl = "/docs/rtc/RTCServlet"; // TODO: should be static?
	
	// TODO: Some of this headUpdater/updatee code probably needs to be reorganized
	this.headUpdater;
	this.updatees;
	this.isHeadUpdater = false;
	this.errorCount = 0;
	
	this.setContextPath = function(/*String*/contextPath)
	{
		this.servletUrl = (contextPath == undefined) ? this.servletUrl : (contextPath + "/RTCServlet");
	};
	
	this.getUpdateUri = function()
	{
		return this.servletUrl + "/" + this.sid + "?format=json&repository=" + this.docSession.bean.getRepository() + "&uri=" + this.docSession.bean.getUri();
	};
	
	// Resets the updater to its initial state
	this.clear = function()
	{
		this.updateState = "STOPPED";
		this.headUpdater = null;
		this.updatees = null;
		this.isHeadUpdater = false;
		var cookieProps = {"path":window.contextPath, "expires":"-1"};
		dojo.cookie("headUpdaterWindowName", "", cookieProps);
		//dojo.cookie("headUpdaterWindowName", "-deleted-", { expires: -10 });
	};
	
	this.assumeHeadUpdatership = function(/*dojox.collections.Dictionary*/newUpdatees)
	{
		// Clone the new updatees
		this.updatees = new dojox.collections.Dictionary();
		var keys = newUpdatees.getKeyList();
		for (var i = 0; i < keys.length; i++)
		{
			this.updatees.add(keys[i], newUpdatees.item(keys[i]));
		}
		
		this.isHeadUpdater = true;
		
		if (this.isSharedMode)
		{
			// Establish our name as the headUpdater window
			// TODO: window.name might need to be url encoded (encodeURI()) if it is DBCS
			var cookieProps = {"path":window.contextPath};
			dojo.cookie("headUpdaterWindowName", window.name, cookieProps);
			
			// Tell all the updatees who the headUpdater is
			for (var i = 0; i < this.updatees.length; i++)
			{
				this.updatees[i].headUpdater = self;
			}
		}
		
		// Start getting updates
		this.updateState = "STARTED";
		setTimeout(dojo.hitch(this, "getUpdate"), 100);
	};
	
	this.addUpdatee = function(/*String*/sessionId, /*Window?*/updatee)
	{
		// TODO: safeguard against adding a updatee to a non-headUpdater?
		this.updatees.add(sessionId, updatee);
	};
	
	this.removeUpdatee = function(/*String*/sessionId)
	{
		this.updatees.remove(sessionId);
	};
	
	this.getUpdate = function()
	{
		var deferred = null;
		
		if (this.updateState == "STARTED") 
		{
			deferred = dojo.xhrGet(
			{
			    url: this.getUpdateUri(),
			    headers: { "Rtc4web-Nonce": this.nonce }, // This only works for a single session
			    load: dojo.hitch(this, "handleResponse"),
			    error: dojo.hitch(this, "handleErrorResponse")
			});
		}
		
		return deferred;
	};

	/**
	 * Publish the error to topic "/concord/rtc/error".
	 */
	this.publishError = function(error)
	{
		dojo.publish("/concord/rtc/error", error/*[ioArgs.xhr.status, responseTextObject.status, responseTextObject.reason]*/);
	};
	
	this.handleErrorResponse = function(/*Object*/data, /*Object*/ioArgs)
	{
		if (ioArgs == null || ioArgs.xhr == null)
		{
			dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCUpdater", "handleErrorResponse", "ioArgs or ioArgs.xhr is null"]);
			return;
		}
		var responseTextObject;
		var targetUpdatee;
		if (data && data.responseText)
		{
			try
			{
				responseTextObject = dojo.fromJson(data.responseText);
			}
			catch(e)
			{
				responseTextObject = null;
			}
		}
		
		if (ioArgs.xhr.status === 401)
		{
			this.stopUpdates();
			this.errorCount=0;
		}
		else if (ioArgs.xhr.status === 400 && responseTextObject && responseTextObject.status == 67)
		{
			// User is ejected, same user joined from a different instance.
			if (this.isSharedMode && this.isHeadUpdater && responseTextObject.sessionId !== this.sid)
			{
				var updateeId = responseTextObject.sessionId.replace(/[-\s.@]/g, '_');
				var targetUpdatee = this.updatees.item(updateeId);
				this.removeUpdatee(updateeId);
				setTimeout(dojo.hitch(this, "getUpdate"), 100);
				this.errorCount = 0;
			}
			else
			{
				this.stopUpdates();
				this.errorCount = 0;
			}
		}
		else if (this.errorCount <= 5)
		{
			this.errorCount++;
			setTimeout(dojo.hitch(this, "getUpdate"), 2000);
		}
		else if (this.errorCount > 5)
		{
			this.stopUpdates();
			//this.errorCount = 0;
		}
		
		var errorParams = new Array();
		errorParams.push(ioArgs.xhr.status);
		
		if (responseTextObject)
		{
			errorParams.push(responseTextObject.status);
			errorParams.push(responseTextObject.reason);
		}

		dojo.publish(loggerConfig.topic, ["warn", "rtc4web.core.RTCUpdater", "handleErrorResponse", "data[", data, "] errorCount[", this.errorCount, " ] publishing to topic[/concord/rtc/error]"]);
		if (this.isSharedMode && this.isHeadUpdater && responseTextObject.sessionId !== this.sid)
		{
			if (targetUpdatee && targetUpdatee.rtcUpdater)
			{
				targetUpdatee.rtcUpdater.publishError(errorParams);
			}
		}
		else
		{	
			this.publishError(errorParams);
		}
	};
	
	this.handleResponse = function(/*Object*/data)
	{
		if (data !== "")
		{
			try
			{
				var rtcData = dojo.fromJson(data);
				
				// Check the error count and reset if needed
				if(this.errorCount!=0)
				{
					this.errorCount = 0;
				}
				
				for (var i = 0; i < rtcData.update.length; i++)
				{
					try
					{
						var update = rtcData.update[i];
						
						if (this.isSharedMode)
						{
							// Need to convert the object 'update' to a JSON format string, so that handler can clone it in IE.
							var dataStr = dojo.toJson(update);
							
							if (window.name === update.sid.replace(/[-\s.@]/g, '_'))
							{
								this.handleUpdate(dataStr);
							}
							else
							{
								// This update goes to another window
								var targetUpdatee = this.updatees.item(update.sid.replace(/[-\s.@]/g, '_'));
								if (targetUpdatee != null)
								{
									targetUpdatee.rtcUpdater.handleUpdate(dataStr);
								}
								else
								{
									// TODO
									dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCUpdater", "handleResponse", "no target for update"]);
								}
							}
						}
						else
						{
							this.handleUpdate(update);
						}
					}
					catch (e)
					{
						dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCUpdater", "handleResponse", "Exception: data[" + data + "] error[" +  e + "]"]);
					}
				}
			}
			catch (e)
			{
				dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCUpdater", "handleResponse", "Exception: " + e]);
			}
		}
		else
		{
			dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCUpdater", "handleResponse", "[]"]);
		}
		
		if (this.updateState != "STOPPED")
		{
			setTimeout(dojo.hitch(this, "getUpdate"), 100);
		}
		dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCUpdater", "handleResponse", this.updateState]);
	};
	
	this.handleUpdate = function(/*Object*/data)
	{
		var update = (typeof data == 'string') ? dojo.fromJson(data) : data;
		
		// dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCUpdater", "handleUpdate", dojo.toJson(update)]);
		
		// If the RTSession does not exist, I think do not need to process the data.
		if (rtc4web.core.sessionArray.contains(update.sid))
		{
			//make sure we have a map with this name in the session
			rtc4web.core.getSession(update.sid).getCollection(update.cn);
		
			dojo.publish("/rtc4web/" + update.sid + "/" + update.cn, [update]);
			// dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCUpdater", "handleUpdate", "published update to [/rtc4web/" + update.sid + "/" + update.cn + "]"]);
		}
		else
		{
			// dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCUpdater", "handleUpdate", "the RTSession for [" + update.sid + "] does not exist"]);
		}
	};
	
	this.startUpdates = function()
	{
		dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCUpdater", "startUpdates", null]);
		
		// TODO: Some of this headUpdater/updatee code probably needs to be reorganized
		
		if (this.isSharedMode)
		{
			window.name = this.sid.replace(/[-\s.@]/g, '_');
			
			// Check to see if there is a global rtcUpdater variable first
			if (window.rtcUpdater == null)
			{
				window.rtcUpdater = this;
			}
			
			if (this.updateState != "STARTED")
			{
				var headUpdaterName = dojo.cookie("headUpdaterWindowName");
				
				if (headUpdaterName == null || headUpdaterName.length == 0 || headUpdaterName === window.name)
				{
					// Become the headUpdater
					this.assumeHeadUpdatership(new dojox.collections.Dictionary()); // assume that no headUpdater means no updatees
				}
				else
				{
					// Become a updatee
					this.headUpdater = window.open("", headUpdaterName);
					this.headUpdater.rtcUpdater.addUpdatee(window.name, self);
				}
			}
		}
		else
		{
			this.assumeHeadUpdatership(new dojox.collections.Dictionary());
		}
	};
	
	this.stopUpdates = function()
	{
		dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core.RTCUpdater", "stopUpdates", null]);
		
		// TODO: Some of this headUpdater/updatee code probably needs to be reorganized
		if (this.isSharedMode)
		{
			if (this.isHeadUpdater)
			{
				if (this.updatees.getKeyList().length > 0)
				{
					// Pass on headUpdatership to the first updatee
					var keys = this.updatees.getKeyList();
					var newHeadUpdater = this.updatees.item(keys[0]);
					this.updatees.remove(keys[0]);
					newHeadUpdater.rtcUpdater.assumeHeadUpdatership(this.updatees);
				}
				else
				{
					// Delete the headUpdater window cookie
					var cookieProps = {"path":window.contextPath, "expires":"-1"};
					dojo.cookie("headUpdaterWindowName", "", cookieProps);
					//dojo.cookie("headUpdaterWindowName", "-deleted-", { expires: -10 });
				}
			}
			else
			{
				this.headUpdater.rtcUpdater.removeUpdatee(self.name);
			}
		}
		
		this.updateState = "STOPPED";
	};
}();

}

if(!dojo._hasResource["rtc4web.core.RTSession"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["rtc4web.core.RTSession"] = true;
dojo.provide("rtc4web.core.RTSession");





dojo.declare("rtc4web.core.RTSession", null,
{
	constructor: function(/*String*/sid, /*String*/serverUrl, /*Object*/docSession, /*Boolean*/sharedMode) {
		this.useSync = false;
		this.isJoined = false;
		this.sid = sid;
		this.isSharedMode = sharedMode;
		this.docSession = docSession;
		
		this.collections = {};
		
		// if we get called with a context, we use it, else default to /rtc
		this.contextRoot = (serverUrl == undefined) ? ("/docs/rtc") : serverUrl;
		this.servletName = "RTCServlet";
		this.mapServletName = "map";
		this.channelServletName = "channel";
		
		this.servletUrl = this.contextRoot + "/" + this.servletName + "/" + sid;
		this.mapServlet = this.contextRoot + "/" + this.mapServletName + "/" + sid;
		this.channelServlet = this.contextRoot + "/" + this.channelServletName + "/" + sid;
		
		this.nonce = ""; // Needed on every rtc4web request for security
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "constructor", "RTSession sid["+this.sid+"] servletUrl["+this.servletUrl+"] mapServlet["+this.mapServlet+"] channelServlet["+this.channelServlet+"]"]);
	},
	
	setContextRoot: function(/*String*/serverUrl)
	{
		this.contextRoot = (serverUrl == undefined) ? this.contextRoot : serverUrl;
		this.servletUrl = this.contextRoot + "/" + this.servletName + "/" + this.sid;
		this.mapServlet = this.contextRoot + "/" + this.mapServletName + "/" + this.sid;
		this.channelServlet = this.contextRoot + "/" + this.channelServletName + "/" + this.sid;
	},
	
	setDocSession: function(/*Object*/docSession)
	{
		this.docSession = docSession;
	},
	
	setSharedMode: function(/*Boolean*/sharedMode)
	{
		this.isSharedMode = sharedMode;
	},
	
	getUpdateMode: function()
	{
		return this.isSharedMode ? "unified" : "individual";
	},
	
	getDocRepositoryUri: function()
	{
		return "repository=" + this.docSession.bean.getRepository() + "&uri=" + this.docSession.bean.getUri();
	},
	
	getJoinUri: function()
	{
		return this.servletUrl + "/user?updateMode=" + this.getUpdateMode() + "&" + this.getDocRepositoryUri() + "&dojo.preventCache=" + new Date().valueOf();
	},
	
	join: function(/*String*/user, /*Object*/userInfo, /*String*/password){
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "join", "RTSession joinSession("+user+")"]);
		var deferred = null;
		var argObj = {};

		if (typeof(password) != 'undefined' && password != null)
		{
			argObj["password"]= password;
		}
		
		if (typeof(userInfo) == 'undefined' || userInfo == null)
		{
			userInfo = {};
		}
		userInfo.clientType = "web";
		argObj["userInfo"]= dojo.toJson(userInfo);
		
		if (this.isJoined === false)
		{
			this.user = user;
			argObj["userName"]= this.user;
			argObj["method"]= "put";
			
			deferred = dojo.xhrPost({
		    	url: this.getJoinUri(),
		    	sync: true,
				content: argObj,
			    load: dojo.hitch(this, function(data, ioArgs){
					dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "join", "data["+ dojo.toJson(data) + "] ioArgs["+ ioArgs+ "]"]);
					
					this.isJoined = true;
					
					var dataObject = dojo.fromJson(data);
					this.nonce = dataObject["Rtc4web-Nonce"];
					rtc4web.core.RTCUpdater.sid = this.sid;
					rtc4web.core.RTCUpdater.docSession = this.docSession;
					rtc4web.core.RTCUpdater.isSharedMode = this.isSharedMode;
					rtc4web.core.RTCUpdater.setContextPath(this.contextRoot);
					rtc4web.core.RTCUpdater.nonce = this.nonce;
					dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "join", "nonce[" + this.nonce + "]"]);
					
					return data;
				}),
			    error: function(error, ioArgs){
					var errorParams = new Array();
					errorParams.push(ioArgs.xhr.status);
					
					if (error && error.responseText)
					{
						var responseTextObject = dojo.fromJson(error.responseText);
						errorParams.push(responseTextObject.status);
						errorParams.push(responseTextObject.reason);
					}
					
					dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "join", "error["+ dojo.toJson(error)+ "] ioArgs["+ ioArgs+ "]"]);
					dojo.publish("/concord/rtc/error", errorParams);
					return error;
			    }
			});
		}
		
		return deferred;
	},

	leave: function(/*String*/user, /*?*/sendBroadcast){
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "leave", "sid["+this.sid+"] user["+this.user+"]"]);
		var deferred = null;
		var argObj = {};

		if (typeof(sendBroadcast) != 'undefined' && sendBroadcast != null)
		{
			argObj["broadcast"] = sendBroadcast;
		}
		
		if (this.isJoined === true)
		{
			// stop updates if necessary
			// TODO: this temp fix will for updates to stop even if another session still exists on the page
			//if (rtc4web.core.sessionArray.count === 0)
			//{
				rtc4web.core.RTCUpdater.stopUpdates();	
			//}
			
			this.isJoined = false;
			
			if (this.sid) rtc4web.core.sessionArray.remove(this.sid);
		}
		
		dojo.xhrPut({
	    	url: this.servletUrl + "/endUpdate?" + this.getDocRepositoryUri() + "&dojo.preventCache=" + new Date().valueOf(),
	    	headers: { "Rtc4web-Nonce": this.nonce },
	    	sync: true,
		    load: function(data){
			    dojo.publish(loggerConfig.topic, ["debug", "RTSession leave() dojo.xhrPut ", "load", "["+data+"] endUpdate sent"]);
		    },
		    error: function(error){ 
			    dojo.publish(loggerConfig.topic, ["debug", "RTSession leave dojo.xhrPut ", "error", "("+this.user+"): url["+url+"]"]);
		    }
		});
		
		argObj["userName"] = this.user;
		argObj["repository"]= this.docSession.bean.getRepository();
		argObj["uri"]= this.docSession.bean.getUri();
		deferred = dojo.xhrDelete({
	    	url: this.servletUrl + "/user" + "?dojo.preventCache=" + new Date().valueOf(),
	    	headers: { "Rtc4web-Nonce": this.nonce },
	    	sync: true,
			content: argObj,
		    load: function(data){
			    dojo.publish(loggerConfig.topic, ["debug", "RTSession leave() dojo.xhrDelete ", "load", "["+data+"] session left"]);
		    },
		    error: function(error){ 
			    dojo.publish(loggerConfig.topic, ["debug", "RTSession leave() dojo.xhrDelete ", "error", "("+this.user+"): url["+url+"]"]);
		    }
		});
		
		return deferred;
	},
	
	ejectUser: function(/*String*/ejectId, /*String*/excludeId){
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "ejectUser", "ejectId["+ejectId+"] excludeId["+excludeId+"]"]);
		
		var deferred = null;
		var argObj = {};
		
		argObj["repository"] = this.docSession.bean.getRepository();
		argObj["uri"] = this.docSession.bean.getUri();
		
		argObj["eject"] = ejectId;
		argObj["method"] = "delete";
		if (excludeId != null && typeof(excludeId) != 'undefined')
			argObj["exclude"] = excludeId;
			
		deferred = dojo.xhrPost({
	    	url: this.servletUrl + "/eject" + "?dojo.preventCache=" + new Date().valueOf(),
	    	headers: { "Rtc4web-Nonce": this.nonce},
	    	sync: true,
			content: argObj,
		    load: function(data){
			    dojo.publish(loggerConfig.topic, ["debug", "RTSession ejectUser() dojo.xhrDelete ", "load", "["+data+"] user ejected"]);
		    },
		    error: function(error){ 
			    dojo.publish(loggerConfig.topic, ["debug", "RTSession ejectUser() dojo.xhrDelete ", "error", "("+ejectId+"): url["+url+"]"]);
		    }
		});
		
		return deferred;
	},
	
	startUpdates: function(){
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "startUpdates", "sid["+this.sid+"] user["+this.user+"]"]);
		if (this.isJoined === true)
		{
			rtc4web.core.RTCUpdater.startUpdates();
		}
	},
	
	sendMessage: function(/*String*/channelName, /*String*/message){
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "sendMessage", "channelName["+channelName+"] message["+message+"]"]);
		var argObj = {
			value: message
		}
		
		argObj["method"]="put";
		argObj["repository"] = this.docSession.bean.getRepository();
		argObj["uri"] = this.docSession.bean.getUri();
		var deferred = dojo.xhrPost({
			url: this.channelServlet + "/" + channelName + "?dojo.preventCache=" + new Date().valueOf(),
			content: argObj,
	    	headers: { "Rtc4web-Nonce": this.nonce }
	    });
	    return deferred;
	},
	
	changeAttribute: function(/*String*/key, /*String?|Number?*/value){
		return this.putInMap("SA", key, value);	
	},
	
	setCurrentUserAttribute: function(/*String*/key, /*String?|Number?*/value) {
		return this.putInMap("UserMap", this.user + "." + key, value);	
	},
	
	setUserAttribute: function(/*String*/user, /*String*/key, /*String?|Number?*/value) {
		return this.putInMap("UserMap", user + "." + key, value);	
	},	
	
	createMap: function(/*String*/mapName){
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "createMap", "mapName["+mapName+"]"]);
		
		var argObj = {};
		argObj["repository"] = this.docSession.bean.getRepository();
		argObj["uri"] = this.docSession.bean.getUri();
		var deferred = dojo.xhrPost({
	    	url: this.mapServlet + "/" + mapName + "?dojo.preventCache=" + new Date().valueOf(),
	    	content: argObj,
	    	headers: { "Rtc4web-Nonce": this.nonce },
	    	sync: this.useSync
	    });
	    return deferred;
	},
	
	deleteMap: function(/*String*/mapName){
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "deleteMap", "mapName["+mapName+"]"]);
		
		var argObj = {};
		argObj["repository"] = this.docSession.bean.getRepository();
		argObj["uri"] = this.docSession.bean.getUri();
		var deferred = dojo.xhrDelete({
	    	url: this.mapServlet + "/" + mapName + "?dojo.preventCache=" + new Date().valueOf(),
	    	content: argObj,
	    	headers: { "Rtc4web-Nonce": this.nonce },
	    	sync: this.useSync
	    });
	    return deferred;
	},
	
	putInMap: function(/*String*/mapName, /*String*/key, /*String?|Number?*/value, /*?*/broadcast){
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "putInMap", "mapName["+mapName+"] key["+key+"] value["+value+"]"]);
		var url = this.mapServlet + "/" + mapName + "?dojo.preventCache=" + new Date().valueOf();
		var argObj = {
			key: key,
			value: value		
		}
		if (broadcast != null && typeof(broadcast) != 'undefined')
			argObj["broadcast"] = "true";

		argObj["method"]="put";			
		argObj["repository"] = this.docSession.bean.getRepository();
		argObj["uri"] = this.docSession.bean.getUri();
		var deferred = dojo.xhrPost({
	    	url: url,
	    	content: argObj,
	    	headers: { "Rtc4web-Nonce": this.nonce },
			sync: this.useSync
	    });
	    return deferred;
	},
	
	removeFromMap: function(/*String*/mapName, /*String*/key, /*?*/broadcast){
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "removeFromMap", "mapName["+mapName+"] key["+key+"]"]);
		var url = this.mapServlet + "/" + mapName + "?dojo.preventCache=" + new Date().valueOf();
		var argObj = {
			key: key	
		}
		
		if (broadcast != null && typeof(broadcast) != 'undefined')
			argObj["broadcast"] = "true";
		argObj["repository"] = this.docSession.bean.getRepository();
		argObj["uri"] = this.docSession.bean.getUri();
		var deferred = dojo.xhrDelete({
	    	url: url,
			content: argObj,
	    	headers: { "Rtc4web-Nonce": this.nonce },
	    	sync: true
	    });
	    return deferred;
	},
	
	removeFromMapByPrefix: function(/*String*/mapName, /*String*/prefix){
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "removeFromMapByPrefix", "mapName["+mapName+"] prefix["+prefix+"]"]);
		var url = this.mapServlet + "/" + mapName + "?dojo.preventCache=" + new Date().valueOf();
		var argObj = {
			keyPrefix: prefix	
		}
		argObj["repository"] = this.docSession.bean.getRepository();
		argObj["uri"] = this.docSession.bean.getUri();
		var deferred = dojo.xhrDelete({
	    	url: url,
			content: argObj,
	    	headers: { "Rtc4web-Nonce": this.nonce },
	    	sync: true
	    });
	    return deferred;
	},
	
	putInList: function(/*String*/listName, /*String?|Number?*/value){
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "putInList", "listName["+listName+"] value["+value+"]"]);
		
		var argObj = {
			value: value		
		}
		argObj["method"]="put";
		argObj["repository"] = this.docSession.bean.getRepository();
		argObj["uri"] = this.docSession.bean.getUri();
		argObj["dojo.preventCache"]= new Date().valueOf();
		var deferred = dojo.xhrPost({
	    	url: this.servletUrl + "/list/" + listName + "?dojo.preventCache=" + new Date().valueOf(),
	    	content: argObj,
	    	headers: { "Rtc4web-Nonce": this.nonce },
	    	sync: this.useSync
	    });
	    return deferred;
	},
	
	removeFromList: function(/*String*/listName, /*String?|Number?*/value){
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "removeFromList", "listName["+listName+"] value["+value+"]"]);
		var argObj = { value: value };
		argObj["repository"] = this.docSession.bean.getRepository();
		argObj["uri"] = this.docSession.bean.getUri();
		argObj["dojo.preventCache"]= new Date().valueOf();
		var deferred = dojo.xhrDelete({
	    	url: this.servletUrl + "/list/" + listName + "?dojo.preventCache=" + new Date().valueOf(),
	    	sync: this.useSync,
	    	headers: { "Rtc4web-Nonce": this.nonce },
	    	content: argObj
	    });
	    return deferred;
	},
	
	subscribe: function(/*String*/container, /*Object*/object, /*Function|String*/handler){
		var topic="/rtc4web/" + this.sid + "/" + container;
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "subscribe", "container["+container+"] topic["+topic+"]"]);
		return dojo.subscribe(topic, object, handler);
	},
	
	unsubscribe: function(/*Handle*/handle){
		dojo.publish(loggerConfig.topic, ["debug", this.declaredClass, "unsubscribe", "handle["+handle+"]"]);
		dojo.unsubscribe(handle);
	},
		
	getCollection: function(/*String*/name){
		var collection = this.collections[name];	
		if (!collection){
			collection = new rtc4web.core.RTCCollection(this, name);
			this.subscribe(name, collection, "handle");
			this.collections[name] = collection;
		}
		return collection;
	}
});

rtc4web.core.sessionArray = new dojox.collections.Dictionary();

rtc4web.core.getSession = function(/*String*/sid, /*String*/serverUrl)
{
	dojo.publish(loggerConfig.topic, ["entering", "rtc4web.core", "getSession", "("+sid+") TOP"]);
	var session = null;
	if (rtc4web.core.sessionArray.contains(sid))
	{
		session = rtc4web.core.sessionArray.item(sid);
		dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core", "getSession", "("+session.sid+") .. fetched session"]);
	}
	else
	{
		session = new rtc4web.core.RTSession(sid, serverUrl);
		rtc4web.core.sessionArray.add(sid, session);
		dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core", "getSession", "("+session.sid+") .. created session"]);
	}
	dojo.publish(loggerConfig.topic, ["exiting", "rtc4web.core", "getSession", "("+session.sid+") BOTTOM"]);
	return session;
};

rtc4web.core.joinSession = function(/*String*/sid, /*String*/user, /*Object*/userInfo, /*String*/password)
{
	dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core", "joinSession", "("+sid+","+user+")"]);
	
	var deferred = rtc4web.core.getSession(sid).join(user, userInfo, password);
	deferred.addCallback(function(response)
	{
		dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core", "deferred.addCallback", "response["+ dojo.toJson(response) +"]"]);
		
		// Used by the updater to distinguish headUpdater and updatees
		rtc4web.core.RTCUpdater.startUpdates();
		
		return response;
	});
	deferred.addErrback(function(response)
	{
		dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core", "deferred.addErrback", "response["+ dojo.toJson(response)+ "]"]);
		
		return response;
	});
	
	return deferred;
};
	
rtc4web.core.leaveSession = function(/*String*/sid, /*String*/user, /*?*/sendBroadcast)
{
	dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core", "leaveSession", "("+sid+","+user+")"]);
	
	// get the session object & leave
	if (rtc4web.core.sessionArray.contains(sid))
	{
		rtc4web.core.getSession(sid).leave(user, sendBroadcast);
	}
	else
	{
		dojo.publish(loggerConfig.topic, ["debug", "rtc4web.core", "leaveSession", "the RTSession for [" + sid + "] does not exist"]);
	}
};

rtc4web.core.addCollectionListener = function(/*String*/sessionId, /*String*/collectionName, /*Object*/scope, /*Function|String*/method, /*Object*/errorHandle, /*Boolean*/futureOnly){
	var session = rtc4web.core.getSession(sessionId);
	var collection = session.getCollection(collectionName);
	// add listener after a brief delay, allow collection to return to caller first
	setTimeout(dojo.hitch(collection, "addListener", scope, method, errorHandle, futureOnly), 100);
	return collection;
};

rtc4web.core.removeCollectionListener = function(/*String*/sessionId, /*String*/collectionName){
	var session = rtc4web.core.getSession(sessionId);
	var collection = session.getCollection(collectionName);
	// remove connection listener after a brief delay.
	setTimeout(dojo.hitch(collection, "removeListener"), 100);
};

}

if(!dojo._hasResource["rtc4web.core"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["rtc4web.core"] = true;
dojo.provide("rtc4web.core");





}

if(!dojo._hasResource["sametime.meetings.Logger"]){ //_hasResource checks added by build. Do not use _hasResource directly in your code.
dojo._hasResource["sametime.meetings.Logger"] = true;
dojo.provide("sametime.meetings.Logger");

dojo.declare("sametime.meetings.Logger", null,
{
	LEVEL:
	{
		"none": -1,
		"error": 0,
		"warn": 1,
		"info": 2,
		"debug": 3,
		"entering": 3,
		"exiting": 3
	},
	
	SCOPE_DELIMITER: ",",
	
	logWindow: null,
	
	constructor: function()
	{
		this.subscribe();
	},
	
	subscribe: function()
	{
		dojo.subscribe(loggerConfig.topic, this, this.handleMessage);
	},
	
	inGlobalScope: function(scope)
	{
		var inGlobalScopeBool = true;
		if (loggerConfig.scope == "all")
		{
			inGlobalScopeBool = true;
		}
		else if (loggerConfig.scope.indexOf(this.SCOPE_DELIMITER) > 0)
		{
			var scopeArray = loggerConfig.scope.split(this.SCOPE_DELIMITER);
 			if (dojo.some(scopeArray, function(item) {
	            return (scope.indexOf(item) >= 0);
	        })) {
	            inGlobalScopeBool = true;
	        } else {
	            inGlobalScopeBool = false;
	        }
		}
		else
		{
			inGlobalScopeBool = (scope.indexOf(loggerConfig.scope) > -1);
		}
		return inGlobalScopeBool;
	},
	
	inGlobalLevel: function(level)
	{
		var localLevel = this.LEVEL[level];
		var globalLevel = this.LEVEL[loggerConfig.level];
		return (localLevel <= globalLevel);
	},

	handleMessage: function(level, scope, fn, message)
	{
		if (this.inGlobalScope(scope) && this.inGlobalLevel(level))
		{
			this.printMessage(level, scope, fn, message);
		}
	},

	encodeHtmlTags: function(uString)
	{
		// replaces html tags in strings that allow for xss vulnerabilities in the web page
		// call this function to modify strings that a user enters on in the client and will be added to the html page ui
		// without first being retrieved by a call to get the data from the server
		var encodedString = "";
		
		for (var i=0; i<uString.length; ++i)
		{
			switch (uString.charAt(i))
			{
				case '<':
					encodedString += "&lt;";
					break;
				case '>':
					encodedString += "&gt;";
					break;
				case '"':
					encodedString += "&quot;";
					break;
				case '\'':
					encodedString += "&#39;";
					break;
				case '%':
					encodedString += "&#37;";
					break;
				case ';':
					encodedString += "&#59;";
					break;
				case '(':
					encodedString += "&#40;";
					break;
				case ')':
					encodedString += "&#41;";
					break;
				case '&':
					encodedString += "&amp;";
					break;
				case '+':
					encodedString += "&#43;";
					break;
				default:
					encodedString += uString.charAt(i);
					break;
			}
		}
		
		return encodedString;
	},
	
	printMessage: function(level, scope, fn, message)
	{
		var scopedMessage = scope;
		if (fn !== null)
		{
			scopedMessage += "." + fn + "()";
		}
		scopedMessage += ":";
		if (level == "entering")
		{
			level = "debug";
			scopedMessage += ">ENTRY";
		}
		else if (level == "exiting")
		{
			level = "debug";
			scopedMessage += "<RETURN";
		}
		if (message)
		{
			scopedMessage += " " + message;
		}
		var encodedMessage = this.encodeHtmlTags(scopedMessage);
		
		// The following "if" statement not only checks to see if a log window was created to begin
		// with, but also to see if the log window still exists (hasn't been closed). The order of
		// the conditions within this conditional statement is important, as some browsers would
		// otherwise throw errors (e.g. IE would throw an "Access denied" error if the condition
		// "this.logWindow.document !== null" came before "typeof this.logWindow.document..."). As
		// such, if changes are made to this conditional statement, please test the results in all
		// supported browsers, including making sure that functionality is not broken after the log
		// window is closed.
		if (this.logWindow !== null && typeof this.logWindow === "object" && typeof this.logWindow.document === "object" && this.logWindow.document !== null)
		{
			this.logWindow.document.writeln("<div>" + encodedMessage + "</div>");
		}
		else if (typeof console !== "undefined" && console.firebug)
		{
			console[level](scopedMessage);
		}
	},
	
	changeGlobalScope: function(scope)
	{
		loggerConfig.scope = scope;
	},
	
	changeGlobalLevel: function(level)
	{
		loggerConfig.level = level;
		
		if (loggerConfig.level !== "none" && (typeof console === "undefined" || (typeof console !== "undefined" && !console.firebug)))
		{
			this.logWindow = window.open("", "STLogConsole");
			this.logWindow.document.writeln("<style>html,body { border: 0 none; margin: 0; padding: 0; } div { border-bottom: 1px solid #d7d7d7; font-family: Monaco,monospace; font-size: 11px; padding: 2px 6px; }</style>");
		}
	}
});

}

