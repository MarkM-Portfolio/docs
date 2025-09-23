dojo.provide("concord.pres.test.func.cursorDelete");

/**
 * summary: With cursor in different location, hit delete/backspace
 * cases:
 * 		1, cursor at the beginning/end of text box/table, then delete/backspace
 * 		2,
 * 		3,
 * check points:
 * 		1, table got deleted
 * 		2,
 * ref defects:
 */
window.testUtils.utils.deferrals.initialLoad().addCallback(function(){
	var _utils = window.testUtils.utils;
	var _actions = window.testUtils.actions;
	
	doh.register("test new delete with cursor", [
		{
			name: "",
			runTest: function(){
				//provide your run case here....
			}
		},
		{
			name: "",
			runTest: function(){
			}
		},
		{
			name: "",
			runTest: function(){
				
			}
		}
			 
	], null);
	
	doh.run();
});