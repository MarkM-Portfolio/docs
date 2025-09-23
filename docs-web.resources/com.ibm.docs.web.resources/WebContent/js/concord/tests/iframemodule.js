dojo.provide("concord.tests.iframemodule");

(function() {
	// get test ID information from URL query part, code copied from DOH 
	var qstr = window.location.search.substr(1);
	var group = null;
	var testFiles = null;
	var sampleMode = "slaveSwitchable";
	var repoId = "concord.storage";
	var perfTimes = 5;
	window.slaveWindow = null;
	if(qstr.length){
		var qparts = qstr.split("&");
		for(var x=0; x<qparts.length; x++){
			var tp = qparts[x].split("="), name=tp[0], value=tp[1].replace(/[<>"':\(\)]/g, "");	// replace() to avoid XSS attack
			//Avoid URLs that use the same protocol but on other domains, for security reasons.
			if (value.indexOf("//") === 0 || value.indexOf("\\\\") === 0) {
				throw "Insupported URL";
			}
			switch(name){
				case "group":
					group = value;
					break;
				case "testFiles":
					testFiles = value.split(",");
					break;
				case "sampleMode":
					// the mode that how the framework provide samples to the test code,
					// possible values:
					//		slaveSwitchable: open the first sample in main iframe as "master", open the 2nd sample in another window
					//			as slave. The slave window is switchable via global API switchSlave(). Slave window can be accessed
					//			by global property slaveWindow. This is the default value.
					//		sequential: samples are opened in main iframe one by one.
					//		perf: open the first sample several times, provide timer API to let test scripts measure operation durations.
					sampleMode = value;
					break;
				case "times":
					// special for perf test, determine how many times a test script is run, default to 5
					perfTimes = value;
					break;
				case "repoId":
					repoId = value;
					break;
				default:
					// ignore all others
			}
		}
	}
	
	switch (sampleMode) {
	case "sequential":
		for (var i = 0; i < testFiles.length; i++) {
			var f = testFiles[i];
			var url = ["/docs/app/doc/", repoId, "/", f, "/edit/content", "?group=", group].join("");
			doh.registerUrl(group, url, /* timeout 5min */ 5 * 60 * 1000);
		}
		break;
	case "perf":
		var url = ["/docs/app/doc/", repoId, "/", testFiles[0], "/edit/content", "?group=", group].join("");
		for (var i = 0; i < perfTimes; i++) {
			doh.registerUrl(group, url, /* longer timeout 30min */ 30 * 60 * 1000);
		}
		
		window.timers = {};
		
		window.startTimer = function(name) {
			var t = timers[name];
			if (t == null) {
				t = timers[name] = {};
			}
			
			if (t.start != null && t.start > 0) {
				// timer started but not stopped
				doh.debug("Automatically stop timer " + name + ".");
				window.stopTimer(name);
			}
			
			t.start = new Date().getTime();
		};
		
		window.stopTimer = function(name) {
			var t = timers[name];
			if (t == null) {
				doh.error("No opened timer named " + name + ".");
			}
			
			var dur = new Date().getTime() - t.start;
			doh.debug("Timer " + name + " stopped, duration(ms): " + dur);
			if (t.dur == null) {
				t.dur = [];
			}
			t.dur.push(dur);
			
			t.start = 0;
		};
		var __onEnd = doh._onEnd;
		doh._onEnd = function(){
			__onEnd.apply(doh, arguments);
			
			doh.debug("----------------- TIMER STATS -----------------");
			for (var p in window.timers) {
				var t = window.timers[p];
				doh.debug("Timer " + p + ":");
				var sum = 0;
				for (var i = 0; i < t.dur.length; i++) {
					doh.debug(t.dur[i]);
					sum += t.dur[i];
				}
				doh.debug("average: " + (sum / t.dur.length));
			}
		};

		break;
	case "slaveSwitchable":
	default:
		var url = ["/docs/app/doc/", repoId, "/", testFiles[0], "/edit/content", "?group=", group].join("");
		doh.registerUrl(group, url, /* timeout 5min */ 5 * 60 * 1000);
		window.switchSlave = function(index) {
			// summary: switch slave window for a sample. If first called, open a slave window with designate sample.
			//		A post function window._postOpenSlave() is called with the new opened window reference as the first parameter.
			//		Test cases need to override to implement correct behavior.
			// parameters: index of the provided sample file. 0 being the one opened in main iframe. So the number start from 1, pointing 
			//		to the 2nd sample provided
			var url = ["/docs/app/doc/", repoId, "/", testFiles[index], "/edit/content", "?group=", group, "&slave=true"].join("");
			if (window.slaveWindow == null) {
				window.slaveWindow = window.open(url);
			} else {
				window.slaveWindow.location.href = url;
			}
			window.postOpenSlave(slaveWindow);
		};
		
		window.postOpenSlave = function() {};
		break;
	}
})();