dojo.provide("concord.pres.test.func.inputTextInTextbox");

/**
 * summary: Input text in text box
 * cases: 
 * 		1, cursor in line end, hit enter key, then input a char;
 * 		2, input a char, delete, input a char again;
 * 		3, type over a range;
 * 		4, bullet line end, hit enter;
 * check points: 
 * 		1,
 * 		2,
 * 		3,
 * 		4, new line with a different bullet size.
 * ref defects:
 */
window.testUtils.utils.deferrals.initialLoad().addCallback(function(){
	var _utils = window.testUtils.utils;
	var _actions = window.testUtils.actions;
	
	doh.register("test input in text box", [
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