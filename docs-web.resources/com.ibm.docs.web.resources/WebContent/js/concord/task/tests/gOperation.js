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
dojo.provide("concord.task.tests.gOperation");
dojo.require("concord.task.tests.test_helper");
dojo.require("concord.task.api.presAPIs");

 
window.testUtils.utils.deferrals.presInitialLoad().addCallback(function() {
 	
	doh.register("test operation on assignments", [
	{
		// create an assignment on the first slide
		name: "case 1: testCreateAssignment",
		timeout: 4000,
		runTest: function() {
			var d = new doh.Deferred();
			concord.task.tests.test_helper.forgeCreateTask();
						
			setTimeout(d.getTestCallback(function(){
				concord.task.tests.test_helper.verifyViaTaskNumber();			
			}), 1000);

			return d;		
		}
	},
	{
		// cannot create assignments on all slides because of the first assiged slide
		name: "case 2: testCreateFullAssignments",
		timeout: 4000,
		runTest: function() {
			var d = new doh.Deferred();
			pe.scene.slideSorter.selectAllSlides();
			concord.task.tests.test_helper.forgeCreateTask();
						
			setTimeout(d.getTestCallback(function(){
				concord.task.tests.test_helper.verifyViaTaskNumber();			
			}), 1000);

			return d;		
		}
	},
	{
		// create remained assignments on all slides except the first assigned one
		name: "case 3: testCreateMultipleAssignments",
		timeout: 4000,
		runTest: function() {
			var d = new doh.Deferred();
			pe.scene.slideSorter.deselectMultiSlides(0,0);
			var numbers = pe.scene.slideSorter.getAllSlideNumbers();
			pe.scene.slideSorter.selectMultiSlides(1,numbers -1);
			concord.task.tests.test_helper.forgeCreateTask();
						
			setTimeout(d.getTestCallback(function(){
				concord.task.tests.test_helper.verifyViaTaskNumber();				
			}), 1000);

			return d;		
		}
	},
	{
		// Mark assignment as completed
		name: "case 4: testApiMarkTaskDone",
		timeout: 10000,
		runTest: function() {
			  
			var d = new doh.Deferred();
			var selectedIds = concord.task.tests.test_helper._getSelectedSlideIds();
			for(var i=0; i<selectedIds.length; i++){ 
				concord.task.api.presAPIs.apiMarkTaskDone(selectedIds[i]);
			}				
			setTimeout(d.getTestCallback(function(){
				var number = concord.task.tests.test_helper.getTaskedSlideNumber();	
				concord.task.tests.test_helper.verifyViaProgressbar((number-1)/number);							
			}), 2000);

			return d;				
		}
	},
	{
		// Remove completed assignments
		name: "case 5: testApiRemoveCompletedTasks",
		timeout: 4000,
		runTest: function() {
			  
			var d = new doh.Deferred();
			concord.task.api.presAPIs.removeCompletedTasks();						
			setTimeout(d.getTestCallback(function(){
				concord.task.tests.test_helper.verifyViaProgressbar();								
			}), 2000);
			return d;				
		}
	},
	{
		// create review assignments on all slides except the first assigned one
		name: "case 6: testCreateReviewAssignments",
		timeout: 4000,
		runTest: function() {
			var d = new doh.Deferred();
			var numbers = pe.scene.slideSorter.getAllSlideNumbers();
			pe.scene.slideSorter.selectMultiSlides(1,numbers -1);
			concord.task.tests.test_helper.forgeCreateTask(true);
						
			setTimeout(d.getTestCallback(function(){
				concord.task.tests.test_helper.verifyViaTaskNumber();				
			}), 1000);

			return d;		
		}
	},
	{
		// approve assignments
		name: "case 7: testApiApproveTask",
		timeout: 4000,
		runTest: function() {
			  
			var d = new doh.Deferred();
			var selectedIds = concord.task.tests.test_helper._getSelectedSlideIds();
			for(var i=0; i<selectedIds.length; i++){ 
				concord.task.api.presAPIs.apiApproveTask(selectedIds[i]);
			}						
			setTimeout(d.getTestCallback(function(){	
				var number = concord.task.tests.test_helper.getTaskedSlideNumber();			
				concord.task.tests.test_helper.verifyViaProgressbar((number-1)/number);
			}), 2000);

			return d;				
		}
	},
	{
		// Reopen assignments
		name: "case 8: testApiReopenTasks",
		timeout: 4000,
		runTest: function() {
			  
			var d = new doh.Deferred();
			var selectedIds = concord.task.tests.test_helper._getSelectedSlideIds();
			concord.task.api.presAPIs.apiReopenTasks(selectedIds);
									
			setTimeout(d.getTestCallback(function(){	
				concord.task.tests.test_helper.verifyViaProgressbar();	
			}), 2000);

			return d;				
		}
	},
	{
		// Reject assignments
		name: "case 9: testApiRejectTasks",
		timeout: 4000,
		runTest: function() {
			  
			var d = new doh.Deferred();
			var selectedIds = concord.task.tests.test_helper._getSelectedSlideIds();
			concord.task.api.presAPIs.apiRejectTasks (selectedIds);
									
			setTimeout(d.getTestCallback(function(){	
				var number = concord.task.tests.test_helper.getTaskedSlideNumber();			
				concord.task.tests.test_helper.verifyViaProgressbar((number-1)/number);	
			}), 2000);
			return d;				
		}
	},	
	{
		// Edit the first assignment
		name: "case 10: testApiEditTask",
		timeout: 4000,
		runTest: function() {
			  
			var d = new doh.Deferred();
			//Only select the first slide
			var number = concord.task.tests.test_helper.getTaskedSlideNumber();
			pe.scene.slideSorter.deselectMultiSlides(1,number -1);
			pe.scene.slideSorter.selectFirstSlide();
			
			var selectedIds = concord.task.tests.test_helper._getSelectedSlideIds();
			var newTitle = "New DOH Test Title_"+ (new Date()).getTime();
			var newAssignee = null;
			var newReviewer = "1";
			var newDescription = "new descrption for dummy assignment";
			var newDuedate = new Date("Tue, 25 Aug 2013 16:00:00 GMT");				
			concord.task.api.presAPIs.apiEditTask(selectedIds[0], newTitle, newAssignee, newReviewer, newDescription, newDuedate);
									
			setTimeout(d.getTestCallback(function(){	
				concord.task.tests.test_helper.verifyViaTasksUI();
			}), 2000);
			return d;				
		}
	},		
	],	 /* type */ null);				
	setTimeout(function() {doh.run();}, 500); 
});

	
