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
dojo.provide("concord.tests.jasmine_startup");

/**
 * Load jasmine env and starts jasmine after:
 * 1) global._jasmineDeferred is called back if it presents
 * 2) dojo.addOnLoad()
 */

(function(global) {
	// inject a global flag for jasmine finish state
	global.bJasmineFinished = false;
	jasmine.finished = false;
	
	var _f = jasmine.Runner.prototype.finishCallback;
	jasmine.Runner.prototype.finishCallback = function() {
		_f.apply(this);
		
		global.bJasmineFinished = true;
	};

    var jasmineEnv = jasmine.getEnv();
    jasmineEnv.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();

    jasmineEnv.addReporter(htmlReporter);

    jasmineEnv.specFilter = function(spec) {
      return htmlReporter.specFilter(spec);
    };

    global.jasmineStarted = false;
    
    function execJasmine() {
    	global.jasmineStarted = true;
    	jasmine.finished = true;
    	jasmineEnv.testNode = dojo.place("<div></div>", dojo.body());
		jasmineEnv.execute();
	}
    
    if (window._jasmineDeferred) {
    	window._jasmineDeferred.addCallback(execJasmine);
    } else {
    	dojo.addOnLoad(execJasmine);
    }
})(window);