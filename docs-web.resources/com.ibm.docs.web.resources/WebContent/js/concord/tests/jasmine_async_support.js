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

dojo.provide("concord.tests.jasmine_async_support");

/**
 * This script injects asyncIt to create a special jasmine spec. The spec returns a defer, will block until the defer is called back.
 */
(function(global) {
	var asyncIt = global.asyncIt = function(desc, func, timeout) {
		return jasmine.getEnv().asyncIt(desc, func, timeout);
	};
	if (isCommonJS) exports.asyncIt = asyncIt;
	
	var xasyncIt = global.xasyncIt = xit;
	if (isCommonJS) exports.xasyncIt = xasyncIt;
	
	it.asyncly = function(desc, f, timeout){
		return jasmine.getEnv().asyncIt(desc, f, timeout);
	};
	
	xit.asyncly = xasyncIt;
	
	jasmine.Env.prototype.asyncIt = function(description, func, timeout) {
		timeout = timeout || 10000;
		
		var f = function() {
			var d = func();
			if (d != null && d.addCallback) {
				var flag = false;
				d.addCallback(function() {
					flag = true;
				});
				waitsFor(function() {
					return flag;
				}, "async spec running timeout", timeout);
			}
			// else no deferred returned, do nothing
		};
		
		return this.it(description, f);
	};
	
})(window);
