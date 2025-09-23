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

dojo.provide("concord.beans.TaskService");
dojo.require("concord.beans.Activity");
dojo.require("concord.beans.TaskAction");
dojo.require("concord.beans.Task");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.beans","TaskService");
(function() {

	var taskURLRoot = contextPath + "/api/tasksvr/";
	var actURLRoot = contextPath + "/api/actsvr/";
	concord.beans.TaskService.ACTION_CREATE = 'create';
	concord.beans.TaskService.ACTION_EDIT ='edit';
	concord.beans.TaskService.ACTION_REMOVE = 'remove';	
	concord.beans.TaskService.ACTION_WORKDONE = 'workdone';
	concord.beans.TaskService.ACTION_AUTOWORKDONE = 'autoworkdone'; ////to support presentation, for the system to set write to-do's next state to complete
	concord.beans.TaskService.ACTION_PRIVATE= 'working';
	concord.beans.TaskService.ACTION_CANCEL_PRIVATE = 'cancelprivate';
	concord.beans.TaskService.ACTION_SUBMIT_PRIVATE= 'submitprivate';
	concord.beans.TaskService.ACTION_APPROVE= 'approve';
	concord.beans.TaskService.ACTION_REJECT= 'reject';
	concord.beans.TaskService.ACTION_REVIEWDONE= 'reviewdone'; //to support presentation, for the system on behalf of the reviewer to set review to-do's next state to complete, regardless approved or rejected
	concord.beans.TaskService.ACTION_AUTOREVIEWDONE= 'autoreviewdone'; //to support presentation, for the system (regardless of userId/reviewer) to set review to-do's next state to complete, regardless approved or rejected
	concord.beans.TaskService.ACTION_REASSIGN = 'reassign';
	concord.beans.TaskService.ACTION_REOPEN = 'reopen';
	concord.beans.TaskService.ACTION_GOTO_PRIVATE='gotoprivate';
	concord.beans.TaskService.ACTION_ABOUT= 'about';
	concord.beans.TaskService.ACTION_RESTORE= 'restore';
	concord.beans.TaskService.WRITE_TASK_TYPE="delegationsection";
	concord.beans.TaskService.REVIEW_TASK_TYPE="reviewsection";
	
	ERROR_CREATE_ACTIVITY = 2000;
	ERROR_GET_ACTIVITY = 2001;
	ERROR_ADDPERSON = 2002;
	ERROR_DELETETODO = 2003;
	ERROR_CHANGETODO = 2004;
	ERROR_GETTODO = 2005;
	ERROR_CREATETODO = 2006;
	ERROR_ADDTODOHISTORY = 2007;
	ERROR_DOACTIONFAIL = 2008;
	ERROR_GETTITLE = 2009;
	ERROR_GETALLTODOS = 2010;
	
	//Only support async invokation
	concord.beans.TaskService.createTasks = function(docbean, action, handler){
		var url = null;
		if (dojo.isObject(docbean))
			url = taskURLRoot + docbean.getRepository() + "/" + docbean.getUri();
		else if (dojo.isString(docbean))
			url = taskURLRoot + docbean;
		else
			return null; 
		
		var sData = dojo.toJson(action);
		dojo.xhrPost({
			url: url,
			handleAs: "json",
			handle: handler,
			sync: false,
			contentType: "text/plain",
			postData: sData
		});
	};
	
	concord.beans.TaskService.createTask = function(docbean, action, handler){
		var url = null;
		if (dojo.isObject(docbean))
			url = taskURLRoot + docbean.getRepository() + "/" + docbean.getUri();
		else if (dojo.isString(docbean))
			url = taskURLRoot + docbean;
		else
			return null;
			
		var response, ioArgs;
		var isSync, callback;
		if(handler==null){
			isSync = true; callback = function(r, io) {response = r; ioArgs = io;};
		}
		else{
			isSync = false; callback = handler;
		}
		
		var sData = dojo.toJson(action);
		dojo.xhrPost({
			url: url,
			handleAs: "json",
			handle: callback,
			sync: isSync,
			contentType: "text/plain",
			postData: sData
		});
		
		if (isSync) {
			if (response instanceof Error) {
				console.info("error when create object");
				return null;
			}
			if( concord.beans.TaskService.checkErrors(response)){	
				console.info("error when create object");			
				return null;
			}					
			if (response){
				var taskObj = response.task;
				var actObj = response.activity;
				var task = null;
				var activity = null;
				if (taskObj != null){
					task = new concord.beans.Task();
					dojo.mixin(task, taskObj);
				}
				if (actObj != null){
					activity = new concord.beans.Activity(actObj.activityId, actObj.activityName);
				}
				var result = {
					activity: activity,
					task: task
				}
				return result;
			}
			return null;			
		}
	};
	
	concord.beans.TaskService.linkExistActivity = function(docbean, activityId, handler){
		var url = null;
		if (dojo.isObject(docbean))
			url = actURLRoot + docbean.getRepository() + "/" + docbean.getUri();
		else if (dojo.isString(docbean))
			url = actURLRoot + docbean;
		else
			return false;
			
		var response, ioArgs;
		var isSync, callback;
		if(handler==null){
			isSync = true; callback = function(r, io) {response = r; ioArgs = io;};
		}
		else{
			isSync = false; callback = handler;
		}
		
		var sData = dojo.toJson({activityId: activityId });
		dojo.xhrPost({
			url: url,
			handleAs: "json",
			handle: callback,
			sync: isSync,
			contentType: "text/plain",
			postData: sData
		});
		
		var activity = null;
		if (response instanceof Error) {
			console.info("error when create object");
			return null;
		}
		
		if( concord.beans.TaskService.checkErrors(response)){	
			console.info("error when create object");			
			return null;
		}		
		
		if (response){
			activity = new concord.beans.Activity(response.activityId, response.activityName);
			return activity;
		}
		
		return null;
	};
	
	concord.beans.TaskService.updateActLink = function(activityId, activityName) {
		var activity = new concord.beans.Activity(activityId, activityName);
		pe.scene.bean.setActivity(activity);
		
		concord.util.events.publish(concord.util.events.activity_linked, null);
	};
		
	concord.beans.TaskService.linkNewActivity = function(docbean, activityName, handler){
		var url = null;
		if (dojo.isObject(docbean))
			url = actURLRoot + docbean.getRepository() + "/" + docbean.getUri();
		else if (dojo.isString(docbean))
			url = actURLRoot + docbean;
		else
			return false;
			
		var response, ioArgs;
		var isSync, callback;
		if(handler==null){
			isSync = true; callback = function(r, io) {response = r; ioArgs = io;};
		}
		else{
			isSync = false; callback = handler;
		}
		
		var sData = dojo.toJson({activityName : activityName});
		
		dojo.xhrPut({
			url: url,
			handleAs: "json",
			handle: callback,
			sync: isSync,
			contentType: "text/plain",
			putData: sData
		});
			
		if (response instanceof Error) {
			console.info("error when create object");
			return null;
		}
		
		if( concord.beans.TaskService.checkErrors(response)){	
			console.info("error when create object");			
			return null;
		}			
		if (response){
			activity = new concord.beans.Activity(response.activityId, response.activityName);
			return activity;
		}
	};

	concord.beans.TaskService.getTask = function(docbean, id, handler){
		var url = null;
		if (dojo.isObject(docbean))
			url = taskURLRoot + docbean.getRepository() + "/" + docbean.getUri() + "/" + id;
		else if (dojo.isString(docbean))
			url = taskURLRoot + docbean + "/" + id;
		else
			return null;
		
		var response, ioArgs;
		var isSync, callback;
		if(handler==null){
			isSync = true; callback = function(r, io) {response = r; ioArgs = io;};
		}
		else{
			isSync = false; callback = handler;
		}
		
		dojo.xhrGet({
			url: url,
			handleAs: "json",
			handle: callback,
			sync: isSync,
			preventCache: true,
			noStatus: true
		});
			
		if (response instanceof Error) {
			return null;
		}
		if( concord.beans.TaskService.checkErrors(response)){	
			return null;
		}				
		if (response){
			task = new concord.beans.Task();
			dojo.mixin(task, response);
			return task;
		}
		
		return null;
	};
	//Only support async invokation
	concord.beans.TaskService.updateTasks = function(docbean, taskid, action, handler){
		var url = null;
		if (dojo.isObject(docbean))
			url = taskURLRoot + docbean.getRepository() + "/" + docbean.getUri() + "/" + taskid;
		else if (dojo.isString(docbean))
			url = taskURLRoot + docbean + "/" + taskid;
		else
			return null;
		
		var sData = dojo.toJson(action);
		dojo.xhrPost({
			url: url,
			handleAs: "json",
			handle: handler,
			sync: false,
			contentType: "text/plain",
			postData: sData
		});
	};
    
	concord.beans.TaskService.updateTask = function(docbean, taskid, action, handler){
		var url = null;
		if (dojo.isObject(docbean))
			url = taskURLRoot + docbean.getRepository() + "/" + docbean.getUri() + "/" + taskid;
		else if (dojo.isString(docbean))
			url = taskURLRoot + docbean + "/" + taskid;
		else
			return null;

		var response, ioArgs;
		var isSync, callback;
		if(handler==null){
			isSync = true; callback = function(r, io) {response = r; ioArgs = io;};
		}
		else{
			isSync = false; callback = handler;
		}
		
		var sData = dojo.toJson(action);
		dojo.xhrPost({
			url: url,
			handleAs: "json",
			handle: callback,
			sync: isSync,
			contentType: "text/plain",
			postData: sData
		});
		if (isSync) {
			if (response instanceof Error) {
				console.info("error when update object");
				return null;
			}
			if( concord.beans.TaskService.checkErrors(response)){	
				console.info("error when update object");
				return null;
			}					
			if (response){
				task = new concord.beans.Task();
				dojo.mixin(task, response);
				return task;
			}
			return null;			
		}	
	};

	concord.beans.TaskService.getTasks = function(docbean, bStrict, handler){
		
		var url = null;
		if (docbean !=null && dojo.isObject(docbean))
			url = taskURLRoot + docbean.getRepository() + "/" + docbean.getUri();
		else if (docbean !=null && dojo.isString(docbean))
			url = taskURLRoot + docbean;
		else
			return null;
		
		var response, ioArgs;
		var isSync, callback;
		if(handler==null){
			isSync = true; callback = function(r, io) {response = r; ioArgs = io;};
		}
		else{
			isSync = false; callback = handler;
		}
		var data ={bStrict : bStrict};
		dojo.xhrGet({
			url: url,
			handleAs: "json",
			handle: callback,
			sync: isSync,
			content: data,
			preventCache: true,
			noStatus: true
		});

		var result = {};
		
		if (response instanceof Error) {
			return result;
		}
		if( concord.beans.TaskService.checkErrors(response)){	
			return result;
		}			
		if (response){
//			var activityId = response.activityId;
//			var activityName = response.activityName;
//			result.activity = new concord.beans.Activity(activityId, activityName);
			var tasks = response.tasklist;
			var taskList = new Array();
			if ((tasks != null) && (tasks instanceof Array)){
				for (var i = 0; i < tasks.length; i++){
					task = new concord.beans.Task();
					dojo.mixin(task, tasks[i]);
					taskList[task.getId()] = task;
				}
			}
			result.tasks = taskList;
			return result;
		}
		
		return result;
	};
	
	concord.beans.TaskService.getActivities = function(handler){
		
		var url = actURLRoot + "myactivities";
		
		var response, ioArgs;
		var isSync, callback;
		if(handler==null){
			isSync = true; callback = function(r, io) {response = r; ioArgs = io;};
		}
		else{
			isSync = false; callback = handler;
		}
		
		dojo.xhrGet({
			url: url,
			handleAs: "json",
			handle: callback,
			sync: isSync,
			preventCache: true,
			noStatus: true
		});

		var list = new Array();
		
		if (response instanceof Error) {
			return list;
		}
		if( concord.beans.TaskService.checkErrors(response)){	
			return list;
		}			
		if (response){
			if (response instanceof Array){
			for (var i = 0; i < response.length; i++){
				var obj = response[i];
				activity = new concord.beans.Activity(obj.activityId, obj.activityName);
				list[i] = activity;
			}
				
			}
			return list;
		}
		
		return list;
	};



	concord.beans.TaskService.getTaskHistory = function(docbean, taskid, handler){
		var url = null;
		if (dojo.isObject(docbean))
			url = taskURLRoot + docbean.getRepository() + "/" + docbean.getUri() + "/" + taskid + "/history";
		else if (dojo.isString(docbean))
			url = taskURLRoot + docbean + "/" + taskid + "/history";
		else
			return null;
		
		var response, ioArgs;
		var isSync, callback;
		if(handler==null){
			isSync = true; callback = function(r, io) {response = r; ioArgs = io;};
		}
		else{
			isSync = false; callback = handler;
		}
		
		dojo.xhrGet({
			url: url,
			handleAs: "json",
			handle: callback,
			sync: isSync,
			preventCache: true,
			noStatus: true
		});

		var list = new Array();
		
		if (response instanceof Error) {
			return list;
		}
		if( concord.beans.TaskService.checkErrors(response)){	
			return list;
		}			
		if (response){
			if (response instanceof Array){
				for (var i = 0; i < response.length; i++){
					action = new concord.beans.TaskAction();
					dojo.mixin(action, response[i]);
					if(action.getProp())
						concord.beans.TaskService.util.buildTaskSummary(action);
					list.push(action);
				}
				
			}
			return list;
		}
		
		return list;
	};

	concord.beans.TaskService.deleteTask = function(docbean, taskid, handler){
		
		var url = taskURLRoot + docbean.getRepository() + "/" + docbean.getUri() + "/" + taskid;
		
		var response, ioArgs;
		var isSync, callback;
		if(handler==null){
			isSync = true; callback = function(r, io) {response = r; ioArgs = io;};
		}
		else{
			isSync = false; callback = handler;
		}
		
		dojo.xhrDelete({
			url: url,
			handleAs: "json",
			handle: callback,
			sync: isSync,
			noStatus: true
		});
		
		if (isSync) {
			
			if (!response)
				return true;

			if (response instanceof Error) {
				return false;
			}
				
			if( concord.beans.TaskService.checkErrors(response)){	
				return false;
			}			
			return true;			
		}
	};

	concord.beans.TaskService.deleteTasks = function(docbean, state, handler){
		
		var url = null;
		if (dojo.isObject(docbean))
			url = taskURLRoot + docbean.getRepository() + "/" + docbean.getUri();
		else if (dojo.isString(docbean))
			url = taskURLRoot + docbean;
		else
			return null;
		
		var response, ioArgs;
		var isSync, callback;
		if(handler==null){
			isSync = true; callback = function(r, io) {response = r; ioArgs = io;};
		}
		else{
			isSync = false; callback = handler;
		}
		
		var data = {state: state} 
		
		dojo.xhrDelete({
			url: url,
			handleAs: "json",
			handle: callback,
			sync: isSync,
			content: data,
			preventCache: true,
			noStatus: true
		});
		

		if (response instanceof Error) {
			return null;
		}
		if( concord.beans.TaskService.checkErrors(response)){	
			return null;
		}
		if (response){
			if (response instanceof Array)
				return response;
			else
				return new Array();
		}
		
		return null;
	};
		
	concord.beans.TaskService.checkErrors = function(response){
	    if(!response) return true;
		var error_code = response.error_code;
		if (error_code) {
			return true; //Error occurs during this request          
		}else{
			return false
		}    	 
	};

	concord.beans.TaskService.util = {
		nls : null,
		isBidi : BidiUtils.isBidiOn(),
		
		getUnionAction : function(taskBeans, action){
			var idsArray = new Array();
			for(var bean in taskBeans){
				var taskBean = taskBeans[bean];	
				idsArray.push(taskBean.getId());					
			}
			action.setIdsArray(idsArray);
			return action;
		},
					
		getAvailableActions: function(taskBean, user){
			var bAssignee = (user.getId() == taskBean.getAssignee());
			var bAssigner = (user.getId() == taskBean.getAuthor());
			var bReviewer = (user.getId() == taskBean.getReviewer());
			var bOwner = (user.getId() == taskBean.getOwner());
			var bDisable = taskBean.getbDisable();
			var bInvalid = taskBean.getbInvalid();

			var actions = new Array();
			if(pe.scene.isDocViewMode()){
				actions[actions.length] = concord.beans.TaskService.ACTION_ABOUT;
				return actions;				
			}
			
			if(!bDisable)
			{
			if(bInvalid){
					actions[actions.length] = concord.beans.TaskService.ACTION_REMOVE;	
			}else if ((taskBean.getState() == 'new') || (taskBean.getState() == 'rejected')){
				if (bAssignee){
					actions[actions.length]=concord.beans.TaskService.ACTION_WORKDONE;
					//Story 16462, drop work privately component
					//actions[actions.length]=concord.beans.TaskService.ACTION_PRIVATE;
					//actions[actions.length]='';
				}
				if (bReviewer && bOwner && !bAssignee){ // this is a review section
					actions[actions.length] = concord.beans.TaskService.ACTION_APPROVE;
					actions[actions.length] = concord.beans.TaskService.ACTION_REJECT;
					actions[actions.length]='';					
				}
				actions[actions.length] = concord.beans.TaskService.ACTION_EDIT;
				actions[actions.length] = concord.beans.TaskService.ACTION_REASSIGN;
				if (bAssigner){
					actions[actions.length] = concord.beans.TaskService.ACTION_REMOVE;
				}
			}else if (taskBean.getState() == 'working'){
				if (bAssignee){
					actions[actions.length]=concord.beans.TaskService.ACTION_WORKDONE;
					//actions[actions.length]=concord.beans.TaskService.ACTION_CANCEL_PRIVATE;
					//actions[actions.length]=concord.beans.TaskService.ACTION_GOTO_PRIVATE;
					//actions[actions.length]='';
				}
				if (bAssigner){
					actions[actions.length] = concord.beans.TaskService.ACTION_REASSIGN;
					actions[actions.length] = concord.beans.TaskService.ACTION_REMOVE;
				}
			}else if (taskBean.getState() == 'waitingReview'){
				if (bReviewer){
					actions[actions.length] = concord.beans.TaskService.ACTION_APPROVE;
					actions[actions.length] = concord.beans.TaskService.ACTION_REJECT;
					actions[actions.length]='';
				}
				actions[actions.length] = concord.beans.TaskService.ACTION_EDIT;
				actions[actions.length] = concord.beans.TaskService.ACTION_REASSIGN;
				if (bAssigner){
					actions[actions.length] = concord.beans.TaskService.ACTION_REMOVE;
				}			
			}else if (taskBean.getState() == 'complete'){
				actions[actions.length] = concord.beans.TaskService.ACTION_REOPEN;
				actions[actions.length] = concord.beans.TaskService.ACTION_REMOVE;
			}

			}	
			if(!bInvalid){
				if (actions.length)
					actions[actions.length]='';	
				actions[actions.length] = concord.beans.TaskService.ACTION_ABOUT;				
			}
			return actions;
		},
		
		buildTaskSummary: function(action){
			var actionType = action.getType();
			var summary = null;
			var fieldsArray = new Array();	
			var prop = action.getProp();	
			if (prop){
				if (typeof prop['tasktitle'] != 'undefined')
					fieldsArray[fieldsArray.length] = this.getNLS().fieldTitle;
				if (typeof prop['assignee'] != 'undefined')
					fieldsArray[fieldsArray.length] = this.getNLS().fieldAssignee;
				if (typeof prop['reviewer'] != 'undefined')
					fieldsArray[fieldsArray.length] = this.getNLS().fieldReviewer;
				if (typeof prop['taskdesc'] != 'undefined')
					fieldsArray[fieldsArray.length] = this.getNLS().fieldDescription;
				if (typeof prop['duedate'] != 'undefined')
					fieldsArray[fieldsArray.length] = this.getNLS().fieldDuedate;				
			}			
			var creatorName = pe.scene.getEditorStore().getEditorById(action.getCreator()).getName();
			if (this.isBidi)
				creatorName = BidiUtils.addEmbeddingUCC(creatorName);
			if(actionType == concord.beans.TaskService.ACTION_CREATE){
				summary = dojo.string.substitute(this.getNLS().createTaskSummary,[creatorName] );				
			}else if (actionType == concord.beans.TaskService.ACTION_EDIT){
				var formatStr = this.getNLS()['editTaskSummary'+fieldsArray.length];
				var parameters = new Array();
				parameters = parameters.concat(creatorName, fieldsArray);
				summary = dojo.string.substitute(formatStr, parameters);				
			}else if (actionType == concord.beans.TaskService.ACTION_REASSIGN){
				var newAssignee = prop['assignee'];
				var newReviewer = prop['reviewer'];
				var oldAssignee = prop['oldassignee'];
				var oldReviewer = prop['oldreviewer'] 
				var bAssigneeUpdated = (typeof newAssignee != 'undefined');
				var bReviewerUpdated = (typeof newReviewer != 'undefined');
				var newAssigneeName = null;
				var oldAssigneeName = null;
				var newReviewerName = null;
				var oldReviewerName = null;
				if (bAssigneeUpdated){
					newAssigneeName = newAssignee ? pe.scene.getEditorStore().getEditorById(newAssignee).getName() : this.getNLS().emptyFieldValue;
					oldAssigneeName = oldAssignee ? pe.scene.getEditorStore().getEditorById(oldAssignee).getName() : this.getNLS().emptyFieldValue;
				}
				if (bReviewerUpdated){
					newReviewerName = newReviewer ? pe.scene.getEditorStore().getEditorById(newReviewer).getName() : this.getNLS().emptyFieldValue;
					oldReviewerName = oldReviewer ? pe.scene.getEditorStore().getEditorById(oldReviewer).getName() : this.getNLS().emptyFieldValue;
				}
				if (bAssigneeUpdated && bReviewerUpdated){
					summary = dojo.string.substitute(this.getNLS().reassignTaskSummary2, [creatorName, oldAssigneeName, newAssigneeName, oldReviewerName, newReviewerName])
				}
				else if (bAssigneeUpdated){
					summary = dojo.string.substitute(this.getNLS().reassignTaskSummary, [creatorName, this.getNLS().fieldAssignee, oldAssigneeName, newAssigneeName]);
				}
				else if (bReviewerUpdated){
					summary = dojo.string.substitute(this.getNLS().reassignTaskSummary, [creatorName, this.getNLS().fieldReviewer, oldReviewerName, newReviewerName]);
				}else {// neither assignee nor reviewer updated
					var formatStr = this.getNLS()['editTaskSummary'+fieldsArray.length];
					var parameters = new Array();
					parameters = parameters.concat(creatorName, fieldsArray);
					summary = dojo.string.substitute(formatStr, parameters);
				}				
			}else if (actionType ==concord.beans.TaskService.ACTION_REMOVE){
				summary = dojo.string.substitute(this.getNLS().removeTaskSummary, [creatorName]);
			}else if (actionType ==concord.beans.TaskService.ACTION_WORKDONE || actionType ==concord.beans.TaskService.ACTION_AUTOWORKDONE){
				summary = dojo.string.substitute(this.getNLS().completeTaskSummary, [creatorName]);
			}else if (actionType ==concord.beans.TaskService.ACTION_PRIVATE){
				summary = dojo.string.substitute(this.getNLS().workPrivateSummary, [creatorName]);
			}else if (actionType ==concord.beans.TaskService.ACTION_APPROVE){
				summary = dojo.string.substitute(this.getNLS().approveTaskSummary, [creatorName]);
			}else if (actionType ==concord.beans.TaskService.ACTION_REJECT){
				var assignee = action.getProp()['assignee'];
				if (assignee){
					var assigneeName = pe.scene.getEditorStore().getEditorById(assignee).getName();
					summary = dojo.string.substitute(this.getNLS().rejectTaskSummary2, [creatorName, assigneeName]);
				}					
				else
					summary = dojo.string.substitute(this.getNLS().rejectTaskSummary, [creatorName]);
			}else if (actionType ==concord.beans.TaskService.ACTION_REVIEWDONE || actionType ==concord.beans.TaskService.ACTION_AUTOREVIEWDONE){
				summary = dojo.string.substitute(this.getNLS().completeTaskSummary, [creatorName]);
			}else if (actionType ==concord.beans.TaskService.ACTION_REOPEN){
				summary = dojo.string.substitute(this.getNLS().reopenTaskSummary, [creatorName]);
			}else if (actionType == concord.beans.TaskService.ACTION_SUBMIT_PRIVATE){
				summary = dojo.string.substitute(this.getNLS().submitTaskSummary, [creatorName]);
			}else if (actionType == concord.beans.TaskService.ACTION_CANCEL_PRIVATE){
				summary = dojo.string.substitute(this.getNLS().cancelPrivateSummary, [creatorName]);
			}else if (actionType == concord.beans.TaskService.ACTION_RESTORE){
				//summary = dojo.string.substitute(this.getNLS().restoreTaskSummary, [creatorName]);
			} 
			action.setSummary(summary);
		},
		
		buildCreateAction: function(title, assignee, reviewer, description, duedate, activityId, activityName){		
			var prop = {};
			if (title)
				prop['tasktitle'] = title;
			if (description)
				prop['taskdesc'] = description;
			if (assignee && (assignee!=''))
				prop['assignee'] = assignee;
			if (reviewer && (reviewer!=''))
				prop['reviewer'] = reviewer;
			if (duedate && (duedate!=''))
				prop['duedate'] = dojo.isString(duedate)? duedate : duedate.toUTCString();
			if (activityId && activityId != '')
				prop['activityId'] = activityId;
			else if (activityName && activityName != '')
				prop['activityName'] = activityName;
			var summary = dojo.string.substitute(this.getNLS().createTaskSummary, [pe.authenticatedUser.getName()]);
			var action = new concord.beans.TaskAction(null, pe.authenticatedUser.getId(), null, concord.beans.TaskService.ACTION_CREATE, summary, null, prop, null);
			return action;
		},

		buildWorkDoneAction: function(taskbean){
			var summary = dojo.string.substitute(this.getNLS().completeTaskSummary, [pe.authenticatedUser.getName()]);
			var action = new concord.beans.TaskAction(null, pe.authenticatedUser.getId(), taskbean.getId(), concord.beans.TaskService.ACTION_WORKDONE, summary, null, null, null);
			return action;
		},

		buildUpdateAction: function(taskbean, actionType, prop, description){
			var summary = null;

			if (typeof prop == 'undefined'){
				prop = null;
			}

			if (typeof description == 'undefined'){
				description = null;
			}
			
			if ((typeof actionType == 'undefined') || (actionType == null)){
				return null;
			}
			var fieldsArray = new Array();		
			if (prop){
				if (typeof prop['tasktitle'] != 'undefined')
					fieldsArray[fieldsArray.length] = this.getNLS().fieldTitle;
				if (typeof prop['assignee'] != 'undefined')
					fieldsArray[fieldsArray.length] = this.getNLS().fieldAssignee;
				if (typeof prop['reviewer'] != 'undefined')
					fieldsArray[fieldsArray.length] = this.getNLS().fieldReviewer;
				if (typeof prop['taskdesc'] != 'undefined')
					fieldsArray[fieldsArray.length] = this.getNLS().fieldDescription;
				if (typeof prop['duedate'] != 'undefined')
					fieldsArray[fieldsArray.length] = this.getNLS().fieldDuedate;				
			}
			
			if (actionType == concord.beans.TaskService.ACTION_EDIT){
				if (prop==null)
					return null;
				var formatStr = this.getNLS()['editTaskSummary'+fieldsArray.length];
				var parameters = new Array();
				parameters = parameters.concat(pe.authenticatedUser.getName(), fieldsArray);
				summary = dojo.string.substitute(formatStr, parameters);
			}else if (actionType == concord.beans.TaskService.ACTION_REASSIGN){
				if (prop == null)
					return null;
				var newAssignee = prop['assignee'];
				var newReviewer = prop['reviewer'];
				var oldAssignee = taskbean.getAssignee();
				var oldReviewer = taskbean.getReviewer(); 
				var bAssigneeUpdated = (typeof newAssignee != 'undefined');
				var bReviewerUpdated = (typeof newReviewer != 'undefined');
				var newAssigneeName = null;
				var oldAssigneeName = null;
				var newReviewerName = null;
				var oldReviewerName = null;
				if (bAssigneeUpdated){
					newAssigneeName = newAssignee ? pe.scene.getEditorStore().getEditorById(newAssignee).getName() : this.getNLS().emptyFieldValue;
					oldAssigneeName = oldAssignee ? pe.scene.getEditorStore().getEditorById(oldAssignee).getName() : this.getNLS().emptyFieldValue;
				}
				if (bReviewerUpdated){
					newReviewerName = newReviewer ? pe.scene.getEditorStore().getEditorById(newReviewer).getName() : this.getNLS().emptyFieldValue;
					oldReviewerName = oldReviewer ? pe.scene.getEditorStore().getEditorById(oldReviewer).getName() : this.getNLS().emptyFieldValue;
				}
				if (bAssigneeUpdated && bReviewerUpdated){
					summary = dojo.string.substitute(this.getNLS().reassignTaskSummary2, [pe.authenticatedUser.getName(), oldAssigneeName, newAssigneeName, oldReviewerName, newReviewerName])
				}
				else if (bAssigneeUpdated){
					summary = dojo.string.substitute(this.getNLS().reassignTaskSummary, [pe.authenticatedUser.getName(), this.getNLS().fieldAssignee, oldAssigneeName, newAssigneeName]);
				}
				else if (bReviewerUpdated){
					summary = dojo.string.substitute(this.getNLS().reassignTaskSummary, [pe.authenticatedUser.getName(), this.getNLS().fieldReviewer, oldReviewerName, newReviewerName]);
				}else {// neither assignee nor reviewer updated
					var formatStr = this.getNLS()['editTaskSummary'+fieldsArray.length];
					var parameters = new Array();
					parameters = parameters.concat(pe.authenticatedUser.getName(), fieldsArray);
					summary = dojo.string.substitute(formatStr, parameters);
				}
			}else if (actionType ==concord.beans.TaskService.ACTION_REMOVE){
				summary = dojo.string.substitute(this.getNLS().removeTaskSummary, [pe.authenticatedUser.getName()]);
			}else if (actionType ==concord.beans.TaskService.ACTION_WORKDONE || actionType ==concord.beans.TaskService.ACTION_AUTOWORKDONE){
				summary = dojo.string.substitute(this.getNLS().completeTaskSummary, [pe.authenticatedUser.getName()]);
			}else if (actionType ==concord.beans.TaskService.ACTION_PRIVATE){
				summary = dojo.string.substitute(this.getNLS().workPrivateSummary, [pe.authenticatedUser.getName()]);
			}else if (actionType ==concord.beans.TaskService.ACTION_APPROVE){
				summary = dojo.string.substitute(this.getNLS().approveTaskSummary, [pe.authenticatedUser.getName()]);
			}else if (actionType ==concord.beans.TaskService.ACTION_REJECT){
				var assignee = prop['assignee'];
				if (assignee){
					var assigneeName = pe.scene.getEditorStore().getEditorById(assignee).getName();
					summary = dojo.string.substitute(this.getNLS().rejectTaskSummary2, [pe.authenticatedUser.getName(), assigneeName]);
				}					
				else
					summary = dojo.string.substitute(this.getNLS().rejectTaskSummary, [pe.authenticatedUser.getName()]);
			}else if (actionType ==concord.beans.TaskService.ACTION_REVIEWDONE || actionType ==concord.beans.TaskService.ACTION_AUTOREVIEWDONE){
				summary = dojo.string.substitute(this.getNLS().completeTaskSummary, [pe.authenticatedUser.getName()]);
			}else if (actionType ==concord.beans.TaskService.ACTION_REOPEN){
				summary = dojo.string.substitute(this.getNLS().reopenTaskSummary, [pe.authenticatedUser.getName()]);
			}else if (actionType == concord.beans.TaskService.ACTION_SUBMIT_PRIVATE){
				summary = dojo.string.substitute(this.getNLS().submitTaskSummary, [pe.authenticatedUser.getName()]);
			}else if (actionType == concord.beans.TaskService.ACTION_CANCEL_PRIVATE){
				summary = dojo.string.substitute(this.getNLS().cancelPrivateSummary, [pe.authenticatedUser.getName()]);
			}else if (actionType == concord.beans.TaskService.ACTION_RESTORE){
				//summary = dojo.string.substitute(this.getNLS().restoreTaskSummary, [pe.authenticatedUser.getName()]);
			} 

			var action = new concord.beans.TaskAction(null, pe.authenticatedUser.getId(), taskbean.getId(), actionType, summary, description, prop, null);

			return action;
		},
		
	   getErrorMessageText:  function(error_code){
	   	    var taskNLS = this.getNLS();
	   	    var isActivity = (g_activitiesUrl != null);
	   	    switch(error_code){
	   	    	case ERROR_CREATE_ACTIVITY:
	   	    	case ERROR_GETTITLE:
	   	    		return isActivity ? taskNLS.errorCreateActivity : taskNLS.errorCreateActivity2;
	   	    	case ERROR_GETALLTODOS:            	
	   	    	case ERROR_GETTODO:            	
	   	    	case ERROR_GET_ACTIVITY: 
	   	    		return isActivity ? taskNLS.errorLoadActivity : taskNLS.errorLoadActivity2;
	   	    	case ERROR_ADDPERSON:
	   	    		return isActivity ? taskNLS.errorAddMember : taskNLS.errorAddMember2;
	   	    	case ERROR_DELETETODO:
	   	    		return isActivity ? taskNLS.errorDeleteAssignment : taskNLS.errorDeleteAssignment2;
	   	    	case ERROR_ADDTODOHISTORY:              	
	   	    	case ERROR_CHANGETODO:
	   	    		return isActivity ? taskNLS.errorupdateAssignment : taskNLS.errorupdateAssignment2;
	   	    	case ERROR_CREATETODO:
	   	    		return isActivity ? taskNLS.errorCreateAssignment : taskNLS.errorCreateAssignment2;
                     	
	   	    	case ERROR_DOACTIONFAIL:
	   	    		return taskNLS.errorSubmitAssignment;
	   	    	default:
	   	    		return null;           	    
	   	    	}		
		},	
		
		getNLS : function(){
			if (this.nls == null){
				this.nls = dojo.i18n.getLocalization("concord.beans","TaskService");
			}
			return this.nls;
		}
	};
})();
