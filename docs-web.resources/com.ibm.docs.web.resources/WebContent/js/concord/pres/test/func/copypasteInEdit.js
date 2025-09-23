dojo.provide("concord.pres.test.func.copypasteInEdit");

/**
 * summary: copy and paste an object
 * cases: ctrlC/ctrlX then ctrlV
 * check points: 
 * ref defects: 
 */
window.testUtils.utils.deferrals.initialLoad().addCallback(function(){
	var _utils = window.testUtils.utils;
	var _actions = window.testUtils.actions;
	
	doh.register("test create a slide", [
		{
			name: "by menu(insert --> New Slide)",
			runTest: function(){
				//provide your run case here....
			}
		},
		{
			name: "by toolbar",
			runTest: function(){
			}
		},
		{
			name: "by hit enter",
			runTest: function(){
				
			}
		},
		{
			name: "by ctrlM",
			runTest: function(){
				
			}
		},
		{
			name: "by copypaste",
			runTest: function(){
				
			}
		}
			 
	], null);
	
	doh.run();
});