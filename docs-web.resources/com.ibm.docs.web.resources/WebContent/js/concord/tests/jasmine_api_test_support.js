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

dojo.provide("concord.tests.jasmine_api_test_support");

dojo.require("concord.tests.jasmine_async_support");

/**
 * This script runs Jasmine tests on a running Docs product by opening one or more window containing the product,
 * while being inspected and controlled by Jasmine.
 */
(function(global) {
	var windowIt = global.windowIt = function(url, timeout) {
		return jasmine.getEnv().windowIt(url, timeout);
	};
	if (isCommonJS) exports.windowIt = windowIt;

	jasmine.Env.prototype.windowIt = function(url, timeout) {
		timeout = timeout || global.timeout || (5 * 60 * 1000);
		var f = function() {
			if (global._win){
				global._win.location.href = url;
			}else{
				global._win = window.open(url);
			}
			var _d = global._windowJasmineDeferred = new dojo.Deferred();
			_d.addCallback(function(res) {
				if (res != null) {
					var el = dojo.byId("RunningWindowResults");
					if (el == null) {
						el = dojo.create("div", { "id": "RunningWindowResults" }, dojo.body());
					}
					// creates a div and clone res content to new div
					var resDiv = dojo.create("div", {}, el);
					resDiv.innerHTML = res.innerHTML;
					if (dojo.hasClass(res, "showDetails")) {
						dojo.addClass(el, "showDetails");
					}
				}
			});
			return _d;
		};
		
		return this.asyncIt("opens window from " + url, f, timeout);
	};
	
	if (window.opener && window.opener.jasmine) {
		// it is a window opened from parent jasmine, route current window's jasmine report to opener
		window.jasmineWindow = window.opener;
		var _f = jasmine.Runner.prototype.finishCallback;
		jasmine.Runner.prototype.finishCallback = function() {
			_f.apply(this);
			
			if (window.jasmineWindow && window.jasmineWindow._windowJasmineDeferred) {
				window.jasmineWindow._windowJasmineDeferred.callback(dojo.byId("HTMLReporter"));
			}
		};
	}
})(window);
