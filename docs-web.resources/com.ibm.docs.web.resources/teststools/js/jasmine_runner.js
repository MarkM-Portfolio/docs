// configurations
var system = require("system");

var SERVER_ROOT = null;
if (system.args[2] != null) {
	SERVER_ROOT = system.args[2];
} else {
	SERVER_ROOT = "http://localhost:8080/";
}

var TEST_LIST_URL = system.args[1];

if (TEST_LIST_URL == null) {
	console.error("!!!!! Need to provide test list JSON url.");
	phantom.exit(-1);
}

TEST_LIST_URL = SERVER_ROOT + TEST_LIST_URL;

var apiPage = require('webpage');

// phantomjs example 

/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 6 sec is used.
 */
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 6001, //< Default Max Timeout is 6s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("!!!!! 'waitFor()' timeout");
                    clearInterval(interval); //< Stop this interval
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log(">>>>> 'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 100); //< repeat check every 100ms
};
var suiteIndex = null;

var suiteList = null;

var listPage = apiPage.create();

// at least one suite failed
var bFailed = false;

function runCase() {
	var page = apiPage.create();
	// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
	page.onConsoleMessage = function(msg) {
	    console.log(msg);
	};
	
	page.onPageCreated = function(newPage) {
		newPage.onConsoleMessage = function(msg) {
		    console.log(msg);
		};
	};
	
	var url = suiteList[suiteIndex]["suite-url"];
	// all other properties as url query
	var bFirst = true;
	for (var p in suiteList[suiteIndex]) {
		if (p != "suite-url") {
			if (bFirst) {
				bFirst = false;
				url += "?" + p + "=" + suiteList[suiteIndex][p];
			} else {
				url += "&" + p + "=" + suiteList[suiteIndex][p];
			}
		}
	}
	console.log("");
	console.log("");
	console.log(">>>>> running test from url ", url);
	
	page.open(SERVER_ROOT + url, function(status){
		console.info("URL opened " + status);
	    if (status !== "success") {
	        console.log("!!!!! Unable to access network, case ", url, " failed.");
	    } else {
	        waitFor(function(){
	            return page.evaluate(function(){
	                return jasmine.finished;
	            });
	        }, function() {
	            bFailed = page.evaluate(function() {
            		var bPageFailed = false;
	            	function logReport(reportEl) {
	            		// summary: log jasmine report start from element el to console log
	            		var list = reportEl.querySelectorAll('.results > #details > .specDetail.failed');
	            	    
	            	    if (list && list.length > 0) {
	            	      bPageFailed = true;
	            	      console.log("!!!!! " + list.length + ' test(s) FAILED:');
	            	      for (var i = 0; i < list.length; ++i) {
	            	          var el = list[i],
	            	              desc = el.querySelector('.description'),
	            	              msg = el.querySelector('.resultMessage.fail');
	            	          console.log('');
	            	          console.log(desc.innerText);
	            	          console.log(msg.innerText);
	            	          console.log('');
	            	      }
	            	    } else {
	            	      var dom =  reportEl.querySelector('.alert > .passingAlert.bar')
	            	      if (dom != null)
	            	      	console.log(">>>>> " + dom.innerText);
	            	      var summaryNode = reportEl.querySelector('.results > .summary');
	            	      if (summaryNode != null) {
	            	    	  console.log(">>>>> Cases summary section start >>>>>");
	            	    	  console.log(summaryNode.innerText);
	            	    	  console.log(">>>>> Cases summary section end >>>>>");
	            	      }
	            	    }
	            	};	            	
	            	
	            	var runningWindowResults = document.body.querySelector("div#RunningWindowResults");
	            	if (runningWindowResults != null) {
	            		console.log(">>>>> Has API test results report");
	            		console.log(">>>>> Main runner window report start >>>>>");
	            		var mainWindow = document.body.querySelector("div#HTMLReporter");
	            		logReport(mainWindow);
	            		console.log(">>>>> Main runner window report end >>>>>");
	            		console.log(">>>>> Running window report start >>>>>");
	            		logReport(runningWindowResults);
	            		console.log(">>>>> Running window report end >>>>>");
	            	} else {
	            		logReport(document.body);
	            	}
	            	
	            	if (window.jscoverage_report) {
		            	// output coverage information
	        			console.log(">>>>> generating jscover report");
	    				jscoverage_report();
	            	}
	            	
	            	return bPageFailed;
	            }) || bFailed;
	            
	            suiteIndex++;
	            if (suiteIndex == suiteList.length) {
	            	if (bFailed) {
	            		console.log("UNIT TEST FAILED");
	            		phantom.exit(-1);
	            	} else {
	            		console.log("UNIT TEST PASSED");
	            		phantom.exit(0);
	            	}
	            } else {
	            	runCase();
	            }
	        }, system.args[3]);
	    }
	});

};

listPage.open(TEST_LIST_URL, function() {
	try
	{
		var jsonListSource = listPage.plainText;
		console.log(">>>>> fetch test list JSON source, ", jsonListSource);
		suiteList = JSON.parse(jsonListSource);
		suiteIndex = 0;
		
		runCase();
	}
	catch (e)
	{
		console.error("!!!!! PhantomJS runner error, ", e);
		phantom.exit(-1);
	}
});

