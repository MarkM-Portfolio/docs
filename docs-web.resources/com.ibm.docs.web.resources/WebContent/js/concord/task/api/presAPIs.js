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
dojo.provide("concord.task.api.presAPIs");
dojo.require("concord.beans.TaskService");

/**
 * To edit an assignment for given slide
 * @param slideId, id of the slide element
 * @param newTitle, new Title info
 * @param newAssignee, new assignee id 
 * @param newReviewer, new reviewer id
 * @param newDescription, new description
 * @param newDuedate, new due date info, for example: new Date("Tue, 25 Aug 2013 16:00:00 GMT");	
 */
concord.task.api.presAPIs.apiEditTask = function(slideId, newTitle, newAssignee, newReviewer, newDescription, newDuedate){
	var taskBean = concord.task.api.presAPIs.getSlideAssignment(slideId);
	if(!taskBean) throw new Error("No assignment on the slide");
 	var actionType = concord.beans.TaskService.ACTION_EDIT;
	var changeset = {};
	if(newTitle){
		changeset.title = newTitle;
	}
	changeset.assignee = newAssignee;
	changeset.reviewer = newReviewer;
	if(newDescription){
		changeset.description = newDescription;
	}	
	if(newDuedate){
		changeset.duedate = newDuedate;
	}	
	concord.task.tests.test_helper.forgeUpdateTask(taskBean, actionType, changeset);
};
/**
 * To reopen assignments for given slides
 * @param id of the slide element
 */
concord.task.api.presAPIs.apiReopenTasks = function(slideIds){
	var taskBeans = concord.task.api.presAPIs.getSlideAssignments(slideIds);
	if(!taskBeans) throw new Error("No assignment on the slide");
	var enable = concord.task.api.presAPIs._canMultipleAction(taskBeans);
	if(!enable) throw new Error("Cannot do this action on the multiple assignments");
	
 	var actionType = concord.beans.TaskService.ACTION_REOPEN;
	var changeset = {}; 
	concord.task.tests.test_helper.forgeUpdateTasks(taskBeans, actionType, changeset);
};
/**
 * To reopen an assignment for given slide
 * @param id of the slide element
 */
concord.task.api.presAPIs.apiReopenTask = function(slideId){
	var taskBean = concord.task.api.presAPIs.getSlideAssignment(slideId);
	if(!taskBean) throw new Error("No assignment on the slide");
 	var actionType = concord.beans.TaskService.ACTION_REOPEN;
	var changeset = {}; 
	concord.task.tests.test_helper.forgeUpdateTask(taskBean, actionType, changeset);
};
/**
 * To reject assignments for given slides
 * @param id of the slide element
 */
concord.task.api.presAPIs.apiRejectTasks = function(slideIds){
	var taskBeans = concord.task.api.presAPIs.getSlideAssignments(slideIds);
	if(!taskBeans) throw new Error("No assignment on the slide");
	var enable = concord.task.api.presAPIs._canMultipleAction(taskBeans);
	if(!enable) throw new Error("Cannot do this action on the multiple assignments");
	
 	var actionType = concord.beans.TaskService.ACTION_REJECT;
	var changeset = {};
	concord.task.tests.test_helper.forgeUpdateTasks(taskBeans, actionType, changeset);
};
/**
 * To reject an assignment for given slide
 * @param id of the slide element
 */
concord.task.api.presAPIs.apiRejectTask = function(slideId){
	var taskBean = concord.task.api.presAPIs.getSlideAssignment(slideId);
	if(!taskBean) throw new Error("No assignment on the slide");
 	var actionType = concord.beans.TaskService.ACTION_REJECT;
	var changeset = {};
	concord.task.tests.test_helper.forgeUpdateTask(taskBean, actionType, changeset);
};

/**
 * To remove completed assignments
 */
concord.task.api.presAPIs.removeCompletedTasks = function(){
	var taskHdl = pe.scene.slideSorter.getTaskHdl();
	if(taskHdl){
		taskHdl.deleteTasks('complete'); 
	}else{   
		throw new Error("Cannot locate task handler");
	}
};
/**
 * To approve an assignment for given slide
 * @param id of the slide element
 */
concord.task.api.presAPIs.apiApproveTask = function(slideId){
	var taskBean = concord.task.api.presAPIs.getSlideAssignment(slideId);
	if(!taskBean) throw new Error("No assignment on the slide");
 	var actionType = concord.beans.TaskService.ACTION_APPROVE;
	var action = concord.beans.TaskService.util.buildUpdateAction(taskBean, actionType); 
	var taskHdl = pe.scene.slideSorter.getTaskHdl();
	if(taskHdl){
		taskHdl.updateTask(taskBean, action);
	}else{
		throw new Error("Cannot locate task handler");
	}
};
/**
 * To mark an assignment done for given slide
 * @param id of the slide element
 */
concord.task.api.presAPIs.apiMarkTaskDone = function(slideId){
	var taskBean = concord.task.api.presAPIs.getSlideAssignment(slideId);
	if(!taskBean) throw new Error("No assignment on the slide");
 	var actionType = concord.beans.TaskService.ACTION_WORKDONE;
	var action = concord.beans.TaskService.util.buildUpdateAction(taskBean, actionType); 
	var taskHdl = pe.scene.slideSorter.getTaskHdl();
	if(taskHdl){
		taskHdl.updateTask(taskBean, action);
	}else{
		throw new Error("Cannot locate task handler");
	}
};
/**
 * To get available assignment actions for given slide
 * @param id of the slide element
 * @return array of actions
 */
concord.task.api.presAPIs.getAvailableActions = function(slideId){
	var taskBean =  concord.task.api.presAPIs.getSlideAssignment(slideId);
	if(!taskBean) throw new Error("No assignment on the slide");
	var user =  pe.authenticatedUser;
	return concord.beans.TaskService.util.getAvailableActions(taskBean, user);
};
/**
 * To check whether the slide contains an assignment or not
 * @param id of the slide element
 * @return 
 */
concord.task.api.presAPIs.checkAssignmentOnSlide = function(slideId){
	var slide = concord.task.api.presAPIs._getSlideById(slideId); 
	var taskNode = dojo.query("[task_id]",slide.parentNode)[0];
	return taskNode ? true : false;	
};
/**
 * To obtain the task bean from given slide
 * @param id of the slide element
 * @return taskBean
 */
concord.task.api.presAPIs.getSlideAssignment = function(slideId){
	var slide = concord.task.api.presAPIs._getSlideById(slideId); 
	var taskNode = dojo.query("[task_id]",slide.parentNode)[0];
	if(taskNode){
		var id = taskNode.getAttribute("task_id");
		var taskHdl = pe.scene.slideSorter.getTaskHdl();
		if(taskHdl){
			return taskHdl.getTaskBeanById(id);	
		}		
	}
	return null;	
};

concord.task.api.presAPIs._canMultipleAction = function(beans){
	if(beans && beans.length >0){
		var owner = beans[0].getOwner();
		var assignee = beans[0].getAssignee();
		var reviewer = beans[0].getReviewer();
		var state = beans[0].getState();
		//duedate,title,content must be consistent
		var duedate = beans[0].getDuedate();
		var content = beans[0].getContent();
		var title = beans[0].getTitle();							
		for(var i=1; i<beans.length ; i++){
			var bean = beans[i];
			if(bean.getOwner() != owner || bean.getAssignee() != assignee 
			|| bean.getReviewer() != reviewer  || bean.getState() != state){
				return false;
			}
			if(title != bean.getTitle() ||
				duedate != bean.getDuedate() ||
				content != bean.getContent()){
				return false;
			}																
		}
		return true;
	}
	return false;	
};
 
concord.task.api.presAPIs.getSlideAssignments = function(slideIds){
	var taskHdl = pe.scene.slideSorter.getTaskHdl();
	if(!taskHdl) return null;
	
	var taskBeans = new Array();
	for(var i=0; i< slideIds.length; i++){
		var slide = concord.task.api.presAPIs._getSlideById(slideIds[i]); 
		var taskNode = dojo.query("[task_id]",slide.parentNode)[0];
		if(taskNode){
			var id = taskNode.getAttribute("task_id");
			taskBeans.push(taskHdl.getTaskBeanById(id));		
		}		
	}
	return taskBeans;	
};

concord.task.api.presAPIs._getSlideById = function(slideId){
	var doc = pe.scene.slideSorter.editor.document.$; 
	return doc.getElementById(slideId);
};
	