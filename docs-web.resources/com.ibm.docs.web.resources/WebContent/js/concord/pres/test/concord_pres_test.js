dojo.provide("concord.pres.test.concord_pres_test");
dojo.registerModulePath("concord", "../concord");

window.testUtils = {};

dojo.require("concord.tests.aspect");


// for dojo1.9 import all.
dojo.require("concord.task.tests.gLoaded");
dojo.require("concord.task.tests.gOperation"); 

dojo.require("concord.pres.test.func.copypasteInEdit");
dojo.require("concord.pres.test.func.copypasteObject");

dojo.require("concord.pres.test.func.createSlide");
dojo.require("concord.pres.test.func.cursorDelete");

dojo.require("concord.pres.test.func.indentTest");
dojo.require("concord.pres.test.func.inputTextInTextbox");

dojo.require("concord.pres.test.func.newTable");
dojo.require("concord.pres.test.func.newTextbox");

dojo.require("concord.pres.test.func.rangeDelete");
dojo.require("concord.pres.test.func.setStyleForCells");
dojo.require("concord.pres.test.func.setStyleInTextBox");

(function(){
	
	// misc utils defs
	var _getReqParams = function() {
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
	
	var _taskGroups = {
		"gLoaded": 1,
		"gOperation": 1
	};
	
	var params = _getReqParams();
	var group = params['group'];
	
	if(!group){
		alert("Please provide test group and try again.");
	}else{
		if(group in _taskGroups){
			dojo.require("concord.task.tests.utils");
		}else{
			dojo.require("concord.pres.test.utils");
			dojo.require("concord.pres.test.actions");
		}
	}
})();
