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

dojo.provide("concord.tests.jasmine_seed");
dojo.provide("pres.test.jasmine_seed");

(function(global) {
	it.asyncly = function(description, func, timeout) {
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
				}, "asynchronous spec", timeout);
			}
		};
		
		return it(description, f);
	};
	xit.asyncly = xit;
	jasmine.finished = false;
	_finishCallback = jasmine.Runner.prototype.finishCallback;
	jasmine.Runner.prototype.finishCallback = function() {
		_finishCallback.apply(this);
		
		jasmine.finished = true;
	};
	
	var je = jasmine.getEnv();
    je.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();
    je.addReporter(htmlReporter);
    je.specFilter = function(spec) {
      return htmlReporter.specFilter(spec);
    };

})(window);