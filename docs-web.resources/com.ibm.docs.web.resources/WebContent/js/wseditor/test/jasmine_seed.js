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
//dojo.provide("concord.tests.jasmine_seed");
dojo.provide("websheet.test.jasmine_seed");

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
		if (jasmine.afterAll && typeof jasmine.afterAll) {
			jasmine.afterAll();
		}
		jasmine.finished = true;
	};
	
	jasmine.HtmlReporterHelpers.createDom = function(type, attrs, childrenVarArgs) {
		  var el = document.createElement(type);

		  if (attrs && attrs.href && global.utils.parseReqParams) {
				var req = global.utils.parseReqParams();
				var href = "";
				for (var key in req) {
					if (key != "spec" && key != "catch")
					{
						href += "&" + key + "=" + req[key];
					}
				}
				if (attrs.href.substring(1))
					href += "&" + attrs.href.substring(1);
				attrs.href = "?" + href.substring(1);
			}
		  
		  for (var i = 2; i < arguments.length; i++) {
		    var child = arguments[i];

		    if (typeof child === 'string') {
		      el.appendChild(document.createTextNode(child));
		    } else {
		      if (child) {
		        el.appendChild(child);
		      }
		    }
		  }

		  for (var attr in attrs) {
		    if (attr == "className") {
		      el[attr] = attrs[attr];
		    } else {
		      el.setAttribute(attr, attrs[attr]);
		    }
		  }

		  return el;
	};
	
	jasmine.HtmlReporterHelpers.addHelpers(jasmine.HtmlReporter);
	jasmine.HtmlReporterHelpers.addHelpers(jasmine.HtmlReporter.ReporterView);
	jasmine.HtmlReporterHelpers.addHelpers(jasmine.HtmlReporter.SpecView);
	jasmine.HtmlReporterHelpers.addHelpers(jasmine.HtmlReporter.SuiteView);
	
	var je = jasmine.getEnv();
    je.updateInterval = 1000;

    var htmlReporter = new jasmine.HtmlReporter();
    je.addReporter(htmlReporter);
    je.specFilter = function(spec) {
      return htmlReporter.specFilter(spec);
    };

})(window);