dojo.provide("websheet.test.utils");

(function(runner) {
	var parseReqParams = function() {
		var ret = {};
		var qstr = window.location.search.substr(1);
		if(!qstr.length){
			return ret;
		}
		var qparts = qstr.split("&");
		for(var x=0; x<qparts.length; x++){
			var tp = qparts[x].split("="), name=tp[0], value=tp[1].replace(/[<>"':\(\)]/g, "");
			//Avoid URLs that use the same protocol but on other domains, for security reasons.
			if (value.indexOf("//") === 0 || value.indexOf("\\\\") === 0) {
				throw "Unsupported URL";
			}
			ret[name] = value;
		}
		return ret;
	};
	
	var getTestData = function(path, handleAs) {
		// summary: sync get test data, based on path /wseditor/js/test/data, return the data as string or JSON,
		//		depends on the parameter type. Default to string.
		//		Parameter handleAs can be: "json", "text", "xml", refer to dojo.xhrGet(), if handleAs not provided,
		//		this util will predict one from the path ext name, that is, if ext name is "json", then set handleAs as "json",
		//		"xml" for xml, others for text.
		var ret;
		
		if (handleAs == null) {
			if (path.lastIndexOf(".json") + 5 == path.length) {
				handleAs = "json";
			} else if (path.lastIndexOf(".xml") + 4 == path.length) {
				handleAs = "xml";
			} else {
				handleAs = "text";
			}
		}
		
		dojo.xhrGet({
				url: "../data/" + path,
				handleAs: handleAs,
				sync: true,
				load: function(resp) {
					ret = resp;
				},
				error: function(resp) {
					console.error("getTestData failed, ", resp);
					throw "getTestData failed";
				}
		});
		
		return ret;
	};
	
	var bindDocument = function(doc) {
		runner.builders.object([[ "app.pe.base._data._documentObj", doc ]], runner);
	};
	
	var unbindDocument = function() {
		var _d = runner.app.pe.base._data._documentObj;
		if (_d && _d.clear) {
			_d.clear();
		}
		runner.builders.object([[ "app.pe.base._data._documentObj", null ]], runner);
	};
	
	var FireworkDeferred = function (deferred) {
		// summary: returns a wrapped deferred, which behaves just like fireworks,
		//		which means it can be fired as expected the first time;
		//		any later ignition will be dismissed with no side- or counter-effect.
		if (!deferred) {
			return;
		}		
		
		var _callbacks = [];
		_callbacks.push(function(){
			//deferred is not fired yet
			if (deferred.fired === -1){
				deferred.callback();
			}
		});
		
		this.addCallback = function(f){
			_callbacks.push(f);
		};
		
		this.callback = function(){
			var len = _callbacks.length;
			for (var i=0; i<len; i++) {
				(_callbacks.pop())();
			}
		};
	};
	
	runner.utils = {
		parseReqParams: parseReqParams,
		
		// summary: sync get test data, based on path /wseditor/js/test/data, return the data as string or JSON,
		//		depends on the parameter type. Default to string.
		//		Parameter handleAs can be: "json", "text", "xml", refer to dojo.xhrGet(), if handleAs not provided,
		//		this util will predict one from the path ext name, that is, if ext name is "json", then set handleAs as "json",
		//		"xml" for xml, others for text.
		getTestData: getTestData, // (path, handleAs)
		
		bindDocument: bindDocument, // (doc)
		unbindDocument: unbindDocument,
		
		FireworkDeferred: FireworkDeferred,
		Firework: FireworkDeferred
	};
})(window);