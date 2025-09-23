dojo.provide("concord.pres.test.func.newTextbox");


/**
 * summary:  text box operations
 * cases:
 * check points:
 * ref defects:
 */
window.testUtils.utils.deferrals.initialLoad().addCallback(function(){
	var _utils = window.testUtils.utils;
	var _actions = window.testUtils.actions;
	
	doh.register("test new delete over new textbox", [
		{
			name: "testNewTextBoxFromMenu",
			runTest: function(){
				
				//editor.execCommand("AddTextBox");
				
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