/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("concord.task.tests.utils");

// gathers all utility functions and builder functions used for tests
(function(){
	var _utils = window.testUtils.utils = {};
	
	// misc utils defs
	_utils.getReqParams = function() {
		// summary: returns a map containing all request parameters with key as parameter key and value as parameter value
		//		code copied from doh
		var qstr = window.location.search.substr(1);
		var group;
		var ret = {};
		if(qstr.length){
			var qparts = qstr.split("&");
			for(var x=0; x<qparts.length; x++){
				var tp = qparts[x].split("="), name=tp[0], value=tp[1].replace(/[<>"':\(\)]/g, "");	// replace() to avoid XSS attack
				//Avoid URLs that use the same protocol but on other domains, for security reasons.
				if (value.indexOf("//") === 0 || value.indexOf("\\\\") === 0) {
					throw "Insupported URL";
				}
				ret[name] = value;
			}
		}
		
		return ret;
	};
	
	_utils.asyncTest = function() {
		// summary: helper for async test, users can write
		// 		asyncTest().doTest( ... ).
		//			doTest( ... ).
		//			repeatUntil( ... );
		//		to perform a DOH async test.
		//		Test calls need to finish with an end() or a repeatUntil(). Both functions return a doh.Deferred() for DOH to check 
		//			whole test results.
		var deferred = new doh.Deferred();
		
		var doList = [];
		
		var index = 0;
		
		var fRepeat = null;
		
		var _call = function() {
			var f = doList[index++];
			var interval = doList[index];
			if (interval != null && typeof(interval) == "number") {
				index++;
			} else {
				interval = null;
			}
			var d = new doh.Deferred();
			d.addCallback(function() {
				if (index < doList.length) {
					// test function finishes, try to call next
					_call();
				} else {
					// the chain finishes, check if need to repeat
					if (fRepeat == null) {
						// no repeat, callback main deferred to finishes the test
						deferred.callback(true);
					} else {
						// check if need to repeat
						if (fRepeat()) {
							// repeats
							index = 0;
							_call();
						} else {
							// finishes the test
							deferred.callback(true);
						}
					}
				}
			});
			d.addErrback(function(err) {
				// pass err to main deferred, end the test
				deferred.errback(err);
			});
			setTimeout(function () {
				try {
					f(d, doh);
				} catch (e) {
					d.errback(e);
				}
			}, interval);
		};
		
		var _self = {
			doTest: function(f, interval) {
				// summary: perform a test in function f after provided interval. Interval default to 0.
				//		f is called in arguments:
				//			deferred: the deferred for the test to report its result
				//			doh: the global doh object
				//		f is called in a setTimeout() timer, f must report its test result by the provided deferred, use callback() for pass,
				//			errback() for failure, also f can just throw any exceptions including assert exceptions. The exceptions will be marked
				//			as errback() for the provided deferred
				doList.push(f);
				if (interval != null) {
					doList.push(interval);
				}
				
				return _self;
			},
				
			end: function() {
				// summary: perform all tests that mentioned in previous doTest(), returns a deferred as the whole test's result
				_call();
				return deferred;
			},
			
			repeatUntil: function(f) {
				// summary: perform all tests that mentioned in previous doTest(), check provided f, if f retuns true, repeat the whole test,
				//		finishes the test otherwise. returns a deferred as the whole test's result
				fRepeat = f;
				_call();
				return deferred;
			}
		};
		
		return _self;
	};
		
	
	// deferrals defs
	// defines doh.Deferred for various async spreadsheet procedures. all functions take one parameter of a doh.Deferred instance,
	// if set to null, create a new one and return. otherwise returns the parameter.
	var _deferrals = _utils.deferrals = {};
	var _d = window.doh;
	var _a = window.aspect;
	_deferrals.presInitialLoad = function(deferred) {
		// summary: calls before application begins, will resolve the deferred after first sheet finishes loading
		// concord loading call path is
		// concord.main.App.onLoad (after: window.pe hook on app object)
		//		-> pe.start
		//		-> pe.load 				(after: pe.scene is constructed)
		//		-> pe.scene.begin 		(after: pe.taskMan initialized)
		//		-> pe.scene.render 		(after: pe.base is initialized)
		//		-> pe.scene.stage		
		//	After stage, scene is querying job, could be
		//		-> pe.scene.staging
		//	OR
		//		-> pe.scene.staged		(after: criteria is ready)
		//		-> pe.scene.join -> pe.scene.session.join		(after: join (load document) request is sent)
		//	After join() is called, scene is waiting for document content, after content is responded,
		//		-> pe.scene.loadState
		// Follow on concord initialize code path to create "extension point" for test code		
		deferred = deferred || new _d.Deferred();
		
		_a.after(concord.main.App, "onLoad", function() {
			_a.after(pe, "load", function() {
				var scene = pe.scene;
				_a.after(scene, "loaded", function(){
					_deferrals.presDocumentLoad(deferred);					
				}, true);
			}, true);
		}, true);
		
		return deferred;
	};
	_deferrals.presDocumentLoad = function(deferred) {
		var slidesorter = pe.scene.slideSorter;
		if(slidesorter){
			 _a.after(slidesorter, "processForTask", function() {				 
				_deferrals.presTaskLoaded(deferred);		 
			}, true);			
		}else{
			setTimeout(function() {_deferrals.presDocumentLoad(deferred);}, 1000);
		}
	};	
	_deferrals.presTaskLoaded = function(deferred) {
		var hdl = pe.scene.slideSorter.getTaskHdl();
		if(hdl){
			var signal = _a.after(hdl, "parseTasks", function() {				 
				signal.remove();
				setTimeout(function() {
					deferred.callback();
				}, 0);		 
			}, true);			
		}
	};		
	// builders defs
	// builders help to build various spreadsheet objects
	var _builders = _utils.builders = {};

	_builders.jsonObject = function() {
		// summary: helper to build a JSON object
		var o = {};
		var _self = {
			getObject: function(){
				return o;
			},
			put: function(key, value) {
				o[key] = value;
				return _self;
			}
		};
		return _self;
	};

})();