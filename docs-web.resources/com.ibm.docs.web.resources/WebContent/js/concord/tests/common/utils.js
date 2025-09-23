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

dojo.provide("concord.tests.common.utils");

/**
 * General test utilities used in both UT and API test cases. Exposes several functions to window: getReqParams: function() getTestData: function(path, handleAs) asyncTest: function() stubBase: function()
 */
(function()
{
	var getReqParams = window.getReqParams = function()
	{
		// summary: returns a map containing all request parameters with key as parameter key and value as parameter value
		// code copied from doh
		var qstr = window.location.search.substr(1);
		var group;
		var ret = {};
		if (qstr.length)
		{
			var qparts = qstr.split("&");
			for ( var x = 0; x < qparts.length; x++)
			{
				var tp = qparts[x].split("="), name = tp[0], value = tp[1].replace(/[<>"':\(\)]/g, ""); // replace() to avoid XSS attack
				// Avoid URLs that use the same protocol but on other domains, for security reasons.
				if (value.indexOf("//") === 0 || value.indexOf("\\\\") === 0)
				{
					throw "Unsupported URL";
				}
				ret[name] = value;
			}
		}

		return ret;
	};

	var getTestData = window.getTestData = function(path, handleAs)
	{
		// summary: sync get test data, based on path /wseditor/js/test/testData, return the data as string or JSON,
		// depends on the parameter type. Default to string.
		// Parameter handleAs can be: "json", "text", "xml", refer to dojo.xhrGet(), if handleAs not provided,
		// this util will predict one from the path ext name, that is, if ext name is "json", then set handleAs as "json",
		// "xml" for xml, others for text.
		var ret;

		if (handleAs == null)
		{
			if (path.lastIndexOf(".json") + 5 == path.length)
			{
				handleAs = "json";
			}
			else if (path.lastIndexOf(".xml") + 4 == path.length)
			{
				handleAs = "xml";
			}
			else
			{
				handleAs = "text";
			}
		}

		dojo.xhrGet({
			url: path,
			handleAs: handleAs,
			sync: true,
			load: function(resp)
			{
				ret = resp;
			},
			error: function(resp)
			{
				console.error("getTestData failed, ", resp);
				throw "getTestData failed";
			}
		});

		return ret;
	};
	
	var apiTest = window.apiTest = function(f) {
		// summary: to formulate API test of single editor;
		//			it also binds act() to window to ease the eyes in reading.
		//		In effect, act() is another name for asyncTest();
		//			step() for doTest(). (Pinkies would thank the no-uppercase API.)
		window.act = function(){	
			var ret = asyncTest();
			ret.step = ret.doTest;
			return ret;
		};
		
		var wrap = function(){
			f();
			window._jasmineDeferred.callback();	
		};
		
		var name = "api_" + new Date().valueOf();
		window[name] = dojo.subscribe("/app/ready", function(){
			dojo.unsubscribe(window[name]);
			wrap();
		});
	};
	
	function FireworkDeferred(deferred) {
		// summary: returns a wrapped deferred, which behaves just like fireworks,
		//		which means it can be fired as expected the first time;
		//		any later ignition will be dismissed with no side- or counter-effect.
		if (!deferred) {
			return ;
		}		
		var _fired = false;
		
		var _callbacks = [];
		_callbacks.push(function(){
			//deferred is not fired yet
			if (deferred.fired === -1){
				deferred.callback();
			}
		});
		
		this.fired = function() {
			return _fired;
		};
		
		this.addCallback = function(f){
			_callbacks.push(f);
			_fired = false;
		};
		
		this.callback = function(){
			if (_fired) {
				return ;
			}
			
			_fired = true;
			var len = _callbacks.length;
			for (var i=0; i<len; i++) {
				(_callbacks.pop())();
			}
		};
	};
	
	var asyncTest = window.asyncTest = function() {
		// summary: helper for async test, users can write
		// 		asyncTest().doTest( ... ).
		//			doTest( ... ).
		//			repeatUntil( ... );
		//		to perform a DOH async test.
		//		Test calls need to finish with an end() or a repeatUntil(). Both functions return a doh.Deferred() for DOH to check 
		//			whole test results.
		var deferred = new dojo.Deferred();
		
		var doList = [];
		
		var index = 0;
		
		var fRepeat = null;
		
		var _call = function() {
			if (doList.length === 0) {
				deferred.callback(true);
				return ;
			}

			var f = doList[index++];
			var interval = doList[index];
			if (interval != null && typeof(interval) == "number") {
				index++;
			} else {
				interval = null;
			}
			var d = new dojo.Deferred();
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
							// finishes the test
							deferred.callback(true);
						} else {
							// repeats
							index = 0;
							_call();
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
					var def = new FireworkDeferred(d);
					//deferreds.updateUI(def);
					//deferreds.scroll(def);
					//deferreds.updateSheet(def);
					//deferreds.hideSheet(def);
					//deferreds.documentLoad(def);
					
					f(def);
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
	
	var softReload = window.softReload = function(f)
	{
		var dfd = new dojo.Deferred();
		pe.scene.session.save();
		concord.net.Sender.send();
		setTimeout(function(){
			pe.scene.session.reload();
			var name = "api_" + new Date().valueOf();
			window[name] = dojo.subscribe("/app/ready", function(){
				dojo.unsubscribe(window[name]);
				f();
				dfd.resolve();
			});
		}, 2000);
		return dfd;
	};

	var compareDom = window.compareDom = function(dom, dom2)
	{
		if (dom == dom2)
			return true;
		var attrs = dom.attributes;
		var attrs2 = dom2.attributes;
		if (attrs.length != attrs2.length)
			return false;
		for ( var i = 0; i < attrs.length; i++)
		{
			var attr = attrs[i];
			var name = attr.name;
			if (name != "style" && name != "class" && dom2.getAttribute(name) !== attr.value)
			{
				// style, class is not compared, TODO
				return false;
			}
		}
		var children = dom.children;
		var children2 = dom2.children;
		if (children.length != children2.length)
			return false;
		for ( var i = 0; i < children.length; i++)
		{
			var child = children[i];
			var child2 = children2[i];
			if (!compareDom(child, child2))
				return false;
		}
		return true;

	};
	
	var compareDOMwithChecklist = window.compareDOMwithChecklist = function(dom, refDom, checkName, checkIndex)
	{
		dojo.require("pres.test.ut_checkpoints");
		
        if (dom == refDom)
            return true;
        if (!dom || !refDom)
            return false;
        
        var checklist =  pres.test.ut_checkpoints;
        var cl = checklist[checkName][checkIndex];
        if (dom.nodeName != cl.nodetype || refDom.nodeName != cl.nodetype)
            return false;
        
        var df_cls = cl.classes;
        for ( var i = 0, len = df_cls.length; i < len; i++)
        {
            if (!dom.classList.contains(df_cls[i]) || !refDom.classList.contains(df_cls[i]))
                return false;
        }
        
        var attrlist = cl.attrs;
        for ( var attr in attrlist)
        {
            if (!attrlist.hasOwnProperty(attr))
                continue;
            if (dom.getAttribute(attr) !== refDom.getAttribute(attr))
                return false;
        }
        
        var inlineStyle = cl.inline_style;
        for ( var item in inlineStyle)
        {
            if (!inlineStyle.hasOwnProperty(item))
                continue;
            if (dom.style[item] !== refDom.style[item])
                return false;
        }

        var subs = dom.childNodes;
        var refSubs = refDom.childNodes;
        
        for(var i = 0, len = refSubs.length; i < len; i++)
        {
            if(subs[i].nodeName == "#text")
                continue;
            if(!this.compareDOMwithChecklist(subs[i], refSubs[i], checkName, ++checkIndex))
                return false;
        }
        
        return true;

    };
	
})();