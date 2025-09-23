/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("concord.task.tests.gLoaded");
dojo.require("concord.task.tests.test_helper");
 
window.testUtils.utils.deferrals.presInitialLoad().addCallback(function() {
 
	doh.register("test loaded/parsed assignments", [
	{
		name: "testGetAllTasks",
		runTest: function() {
			concord.task.tests.test_helper.verifyViaTaskNumber();
		}
	},
	{
		name: "testProgressbar",
		runTest: function() {
			var taskHdl = pe.scene.slideSorter.getTaskHdl();
			var total = 0;
			var completed = 0;
			if(taskHdl){
				var tasks = taskHdl.getAllTasks();
				for(t in tasks){
					var bean = tasks[t];
					var owner = bean.owner;
					var state = bean.state;
					total ++;
					if(state == "complete"){
						completed ++;
					}    			    		
				}
				if(total != 0){
					concord.task.tests.test_helper.verifyViaProgressbar(completed/total);					
				}									
			}
		}
	},
	{
		name: "testAssignmentsInSlides",
		runTest: function() {
			concord.task.tests.test_helper.verifyViaTasksUI();
		}
	}
	],	 /* type */ null);				
	setTimeout(function() {doh.run();}, 500); 
});

	
