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

dojo.provide("concord.task.tests.test_helper");
dojo.require("concord.beans.TaskService");
dojo.require("concord.task.api.presAPIs");

concord.task.tests.test_helper.forgeContexts = function(){
	//In presentation, it's an array of context
	var ids = concord.task.tests.test_helper._getSelectedSlideIds();
	var contexts = new Array();
	for(var i=0; i< ids.length; i++){	
		var context = {};
		context.title = "";
		context.slide = {"id" : ids[i]};
		context.uuid = ids[i];
		if(!concord.task.api.presAPIs.checkAssignmentOnSlide(ids[i])){	
			contexts.push(context);
		}						
	}
	return (contexts.length !=  0) ? contexts : null;	
};

concord.task.tests.test_helper.forgeCreateTask = function(isReview/*dohDeferred*/){
	var taskHdl = pe.scene.slideSorter.getTaskHdl();
	if(taskHdl){	
		taskHdl.context = concord.task.tests.test_helper.forgeContexts();
		if(!taskHdl.context) return;
		var action = concord.task.tests.test_helper.forgeCreateAction(isReview);
		taskHdl.assignTask(action);
	}
//	var _a = window.aspect;
//	var signal = _a.after(taskHdl, "addSection", function() {
//		signal.remove();
//		dohDeferred.callback();
//	}, true);		
//	return dohDeferred;	
};

concord.task.tests.test_helper.forgeUpdateTasks = function(taskBeans, actionType, changeset){
	var taskHdl = pe.scene.slideSorter.getTaskHdl();
	if(taskHdl){	
		var action = concord.task.tests.test_helper.forgeUpdateAction(taskBeans[0], actionType, changeset);
		action = concord.beans.TaskService.util.getUnionAction(taskBeans, action);	
		taskHdl.updateTasks(taskBeans, action);
	}
};

concord.task.tests.test_helper.forgeUpdateTask = function(taskBean, actionType, changeset){
	var taskHdl = pe.scene.slideSorter.getTaskHdl();
	if(taskHdl){	
		var action = concord.task.tests.test_helper.forgeUpdateAction(taskBean, actionType, changeset);
		taskHdl.updateTask(taskBean, action);
	}
};

concord.task.tests.test_helper.forgeUpdateAction = function(taskBean, actionType, changeset){
		var prop = {};
		var updatedFields = new Array();
		if (changeset.title && changeset.title != taskBean.getTitle()){
			prop['tasktitle'] = changeset.title;				
		}
		if(actionType == concord.beans.TaskService.ACTION_EDIT){
			if (changeset.assignee != taskBean.getAssignee()){
				prop['assignee'] = changeset.assignee;
			}
			if (changeset.reviewer != taskBean.getReviewer()){
				prop['reviewer'] = changeset.reviewer;
			}
		}else{
			if (changeset.assignee && changeset.assignee != taskBean.getAssignee()){
				prop['assignee'] = changeset.assignee;
			}
			if (changeset.reviewer && changeset.reviewer != taskBean.getReviewer()){
				prop['reviewer'] = changeset.reviewer;
			}			
		}
		if(changeset.description && changeset.description != taskBean.getContent())	
			prop['taskdesc'] = changeset.description;
		var oldDuedate = null;
		if (taskBean.getDuedate()!=null) 
			oldDuedate = new Date(taskBean.getDuedate());
		if ((changeset.duedate == null && oldDuedate != null)
			|| (oldDuedate == null && changeset.duedate != null)
			|| (changeset.duedate != null && changeset.duedate.getTime()!=oldDuedate.getTime())){
			if (changeset.duedate != null)
				prop['duedate'] = changeset.duedate.toUTCString();
			else
				prop['duedate'] = null;
		}	
		var action = concord.beans.TaskService.util.buildUpdateAction(taskBean, actionType, prop, updatedFields.join('<br/>'));
		return action;
};

concord.task.tests.test_helper.forgeCreateAction = function(isReview){
	var title = "DOH Test Title_"+ (new Date()).getTime();
	var assignee = "1";// assignee's id 
	var reviewer = null;	
	if(typeof isReview != 'undefined' && isReview){
		reviewer = "1"// reviewer's id
		assignee = null;
	}
	var description = "description for dummy assignment";
	var duedate = "Tue, 13 Aug 2013 16:00:00 GMT";
	var action = concord.beans.TaskService.util.buildCreateAction(title, assignee, reviewer, description, duedate, null, null);
	return action;
};

concord.task.tests.test_helper._getSelectedSlideIds = function(){
    var ids = new Array();
    var selectedSlides = pe.scene.slideSorter.multiSelectedSlides;
    if(selectedSlides){
    	for(var k=0; k<selectedSlides.length; k++){
    		 var id = dojo.attr(selectedSlides[k], "id");
            if(id || dojo.trim(id) != ""){  
            	ids.push(id);
            } 		 	
    	}
    }
    return ids;	
},

concord.task.tests.test_helper.getSlideByTaskId = function(taskId){
	var doc = pe.scene.slideSorter.editor.document.$; 
	var taskNode = null;
	dojo.query("[task_id]", doc).forEach( dojo.hitch(this,function (node) {
		if(node){
			var id = node.getAttribute("task_id");
			if(id == taskId){
				taskNode = node;
			}
		}		
	}));
	return taskNode;	 
};

concord.task.tests.test_helper.getTaskedSlideNumber = function(){
	var doc = pe.scene.slideSorter.editor.document.$; 
	var counter = 0;
	dojo.query("[task_id]", doc).forEach( dojo.hitch(this,function (node) {
		if(node){
			counter ++;
		}		
	}));
	return counter;	 
};

concord.task.tests.test_helper.verifyViaTaskNumber = function(){
	var taskHdl = pe.scene.slideSorter.getTaskHdl();
	var tasks = taskHdl.getAllTasks();
	var number = concord.task.tests.test_helper.getTaskedSlideNumber();
	doh.t(number == tasks.length);
};

concord.task.tests.test_helper.verifyViaProgressbar = function(targetValue){
 	var div = dojo.byId("id_progressbar_label");
 	if(div){	
		var rawValue = div.innerHTML;
		var pos = rawValue.indexOf('%');
		var value = rawValue.substring(0,pos)* 0.01; // percent
		if(typeof targetValue == 'undefined'){
			targetValue = 0;
		}
		var target = dojo.number.format(targetValue,{ pattern: "#.00",locale: g_locale });
		doh.t(value == target);
 	}else{
 		doh.t(false);
 	}	  
};

concord.task.tests.test_helper.verifyViaTasksUI = function(){
	var slidesorter = pe.scene.slideSorter;
	var taskHdl = slidesorter.getTaskHdl();
	if(taskHdl){
		var tasks = taskHdl.getAllTasks();
		for(t in tasks){
		    concord.task.tests.test_helper.verifyViaTaskUI(tasks[t]);	
		}
	} 	  
};

concord.task.tests.test_helper.verifyViaTaskUI = function(taskBean){
	var slidesorter = pe.scene.slideSorter;
	var taskHdl = slidesorter.getTaskHdl();
	var owner = taskHdl.getUserFullName(taskBean.getOwner());					
	var id = taskBean.getId();
	//1)verfiy owner in the slide
	var taskNode = concord.task.tests.test_helper.getSlideByTaskId(id);	
 	var ownerNode =  dojo.query(".taskEntryTxt",taskNode)[0];
	doh.t(owner == ownerNode.innerHTML);
	//2)verify assignment type in the slide 			    	
	var titleInfo = taskHdl.getTitleInfo(taskBean);
	var mode = titleInfo.mode;
	if(mode == taskHdl.WRITE_MODE){                  
 		var typeWNode =  dojo.query(".taskEntryWriteImg",taskNode)[0];
 		doh.t(typeWNode != undefined);
	}else if(mode == taskHdl.REVIEW_MODE){ 	
 		var typeRNode =  dojo.query(".taskEntryReviewImg",taskNode)[0];
 		doh.t(typeRNode != undefined);						
	}	  
};