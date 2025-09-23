dojo.provide("concord.pres.test.func.createSlide");

/**
 * summary: create a slide with a layout in different ways
 * cases: create a slide from menu(new slide, duplicate slide), tool bar, enter key, ctrlM, copy paste
 * check points: place holder text color, font size, background color from slide editor
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
			name: "by menu(insert --> Duplicate Slide)",
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