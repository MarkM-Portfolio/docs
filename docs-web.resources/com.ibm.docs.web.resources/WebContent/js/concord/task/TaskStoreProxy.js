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

dojo.provide("concord.task.TaskStoreProxy");
dojo.require("concord.beans.Activity");
dojo.require("concord.beans.Task");
dojo.require("concord.util.events");

dojo.declare("concord.task.TaskStoreProxy", null, {

	sections: null,
	
	bBatchUpdate : false,
	NOT_LOADED: 0,
	LOADING: -1,
	LOADED: 1,
	LOAD_FAIL: -2,
	
	loaded: 0,
	
	constructor: function(sections) {
		this.sections = sections;
	},

	loadTasks: function(docBean, callback, bStrict){
		this.loaded = this.LOADING;// loading
		concord.beans.TaskService.getTasks(docBean, bStrict, dojo.hitch(this, function(response, ioArgs){
			var result = {};
			result.loaded = this.LOADED;
			
			if (response instanceof Error) {
				result.loaded = this.LOAD_FAIL;
			}
			if(response){
				var error_code = response.error_code;
				if(error_code){  
					result.loaded = this.LOAD_FAIL;
					response = null;
				}	
			}
			if (response){
				var activityId = response.activityId;
				var activityName = response.activityName;
				result.masterDoc = response.masterDoc;
				result.masterTask = response.masterTask;
//				if (activityId)
//					result.activity = new concord.beans.Activity(activityId, activityName);
				
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
			}
			
//			result.loaded = this.loaded;
			this.startBatchUpdate();
			callback(result);
			
			this.loaded = result.loaded;
			console.log("task load completed");
			this.endBatchUpdate(concord.util.events.taskEvents_eventName_taskLoaded, [this.loaded]);		
			
		}));
	},

	startBatchUpdate: function()
	{
		this.bBatchUpdate = true;
	},	
	
	endBatchUpdate: function(message, args)
	{
		this.bBatchUpdate = false;
		if (typeof message != 'undefined'){
			if (typeof args != 'undefined')
				dojo.publish(message,args);
			else
				dojo.publish(message);
		}
	},
		
	addSection : function(bean, info)
	{
		if (bean == null)
			return;
		var taskId = bean.getId();
		if (typeof this.sections == 'undefined')
		{
			this.sections = {};
		}
		
		if (this.sections[taskId] == null){
			this.sections[taskId] = {};
		} 
		
		if (typeof info != 'undefined')
			this.sections[taskId].info = info;
		else
			this.sections[taskId].info = {};
		
		this.sections[taskId].bean = bean;
		
		if (!this.bBatchUpdate){
			dojo.publish(concord.util.events.taskEvents_eventName_taskAdded, [bean]);
		}
	},
		
	updateSection : function(bean, info, action)
	{
		if (bean == null)
			return;
		if (typeof this.sections == 'undefined')
		{
			return; // the section has not been initialized
		}
		var taskId = bean.getId();
		
		if (this.sections[taskId] == null){
			return; // the task is not found
		}
		if (typeof info != 'undefined' && info != null)
			this.sections[taskId].info = info;

		this.sections[taskId].bean = bean;
		
		if (!this.bBatchUpdate){
			dojo.publish(concord.util.events.taskEvents_eventName_taskUpdated, [bean,action]);
		}	
	},
	
	deleteSection : function(taskId)
	{
		if (typeof this.sections == 'undefined')
		{
			return;
		}
		
		if (taskId == null)
			return;
					
		if (taskId in this.sections){
			delete this.sections[taskId];
			if (!this.bBatchUpdate){
				dojo.publish(concord.util.events.taskEvents_eventName_taskDeleted, [taskId]);
			}
		}
		
	},
	
	getSection: function(taskId)
	{		
		if (typeof this.sections == 'undefined')
		{
			return null;
		}
		
		var section = this.sections[taskId];
		return section;
	},
	
	getTaskBean: function(taskId)
	{
		var section = this.getSection(taskId);
		if (section)
			return section.bean;
		else
			return null;
	},
	
	getAllTaskBeans: function()
	{
		if (typeof this.sections == 'undefined')
			return null;
		
		var tasks = new Array();
		for (var i in this.sections){
			var section = this.sections[i];
			if(section){
				tasks.push(section.bean);
			}
		}			
		return tasks;
	},
	
	getAllSections: function()
	{
		return this.sections;
	},
	
	getLoadStatus: function()
	{
		return this.loaded;
	}
		
});