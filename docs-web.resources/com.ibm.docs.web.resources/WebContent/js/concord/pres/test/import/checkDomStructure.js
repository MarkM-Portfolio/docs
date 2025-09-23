dojo.provide("concord.pres.test.import.checkDomStructure");

/**
 * summary: check dom node structure of each slide for imported files
 * cases:
 * 		1,
 * 		2, 
 * check point: 
 * 		1, dom strcture,
 *  	2, page backgroud color
 *  	3, check toolbar status
 */
window.testUtils.utils.deferrals.initialLoad().addCallback(function(){
	var _utils = window.testUtils.utils;
	var _actions = window.testUtils.actions;
	
	doh.register("check imported pptx draft", [
		{
			name: "check imported pptx draft",
			runTest: function(){
				
			}
		},
		{
			name: "check imported ppt draft",
			runTest: function(){
				 
			}
		},
		{
			name: "check imported odp draft",
			runTest: function(){
				 
			}
		}
			 
	], null);
	
	doh.run();
});