dojo.provide("concord.pres.test.func.copypasteObject");

/**
 * summary: copy and paste an object
 * cases: ctrlC/ctrlX then ctrlV
 * 		1, paste to same slide as object
 * 		2, paste to a different slide as object
 * 		3, paste in edit mode (place holder[title, subtitle, outline]/textbox/table)
 * check points: 
 * 		1, style: numbering, bullet, indent/outdent, font size, font color, line space, table height, 
 * 		2, node exist in sorter
 * 		3, object size
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
				//mock range
				//call ctrlC
				//call ctrlV
				//assertions
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