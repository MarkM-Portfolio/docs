/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("concord.task.TaskUtil");

concord.task.TaskUtil.insertType = "insertType";
concord.task.TaskUtil.updateType = "updateType";
concord.task.TaskUtil.deleteType = "deleteType";

concord.task.TaskUtil.updateProgressbar = function(taskBeans){ 
	var tArray = new Array();
	var pNotified = null;
	for(bean in taskBeans){
		var taskBean = taskBeans[bean];
		pNotified = {};
		pNotified.state = taskBean.getState();
		pNotified.owner = taskBean.getOwner();
		tArray.push(pNotified);
	}
	var eventData = [{beans : tArray}];     	
	concord.util.events.publish(concord.util.events.presAssignment_updateProgressbar, eventData);	
};
//assign assignments event
concord.task.TaskUtil.publishAssignSlides = function(){
	var eventData = [{eventName: concord.util.events.presAssignment_eventName_assignSlides,taskType:null}];
	concord.util.events.publish(concord.util.events.assignmentEvents, eventData);
};
//Edit an assignment event
concord.task.TaskUtil.publishEditAssignSlide = function(){
	var eventData = [{eventName: concord.util.events.presAssignment_eventName_editAssignSlide}];
	concord.util.events.publish(concord.util.events.assignmentEvents, eventData);
};
//Reopen assignments event
concord.task.TaskUtil.publishReopenAssignSlides = function(){
	var eventData = [{eventName: concord.util.events.presAssignment_eventName_reopenAssignSlides}];
	concord.util.events.publish(concord.util.events.assignmentEvents, eventData);
};	
//Reassign assignments event
concord.task.TaskUtil.publishReassignSlides = function(){
	var eventData = [{eventName: concord.util.events.presAssignment_eventName_reassignSlides}];
	concord.util.events.publish(concord.util.events.assignmentEvents, eventData);
};
			
concord.task.TaskUtil.publishUnassign = function(){
	var eventData = [{eventName:concord.util.events.presAssignment_eventName_unassignSlides}];
	concord.util.events.publish(concord.util.events.assignmentEvents, eventData);
};
//Mark assignments completed event
concord.task.TaskUtil.publishMarkDone = function(){
	var eventData = [{eventName: concord.util.events.presAssignment_eventName_markDoneSlides}];
	concord.util.events.publish(concord.util.events.assignmentEvents, eventData);		
};
//Approve assignments event
concord.task.TaskUtil.publishApprove = function(){
	var eventData = [{eventName: concord.util.events.presAssignment_eventName_approveSlides}];
	concord.util.events.publish(concord.util.events.assignmentEvents, eventData);	
};
//Reject assignments event
concord.task.TaskUtil.publishReject = function(){
	var eventData = [{eventName: concord.util.events.presAssignment_eventName_rejectSlides}];
	concord.util.events.publish(concord.util.events.assignmentEvents, eventData);	
};
//remove completed assignments event
concord.task.TaskUtil.publishRemoveCompletedTask = function(){			    	
	var eventData = [{eventName:concord.util.events.presAssignment_eventName_RemoveCompletedTask}];
	concord.util.events.publish(concord.util.events.assignmentEvents, eventData);
};
//About this assignment event
concord.task.TaskUtil.publishAboutSlideAssignment = function(){
	var eventData = [{eventName:concord.util.events.presAssignment_eventName_AboutSlideAssignment}];
	concord.util.events.publish(concord.util.events.assignmentEvents, eventData);
};
//show all assignments event
concord.task.TaskUtil.publishShowAllAssignments = function(){
	var eventData = [{eventName:concord.util.events.sidebarEditorEvents_eventName_showAllAssignments}];
	concord.util.events.publish(concord.util.events.sideBarEvents, eventData);
};
//Hide all assignments event
concord.task.TaskUtil.publishHideAllAssignments = function(){
	var eventData = [{eventName:concord.util.events.sidebarEditorEvents_eventName_hideAllAssignments}];
	concord.util.events.publish(concord.util.events.sideBarEvents, eventData);
};
//refresh filter if existed
concord.task.TaskUtil.publishRefreshTaskFilter = function(){
	var eventData = [{eventName:concord.util.events.sidebarEditorEvents_eventName_refreshFilter}];
	concord.util.events.publish(concord.util.events.sideBarEvents, eventData);
};
