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

dojo.provide("concord.task.AbstractTaskHandler");

dojo.require("concord.beans.TaskService");
dojo.require("concord.task.TaskStoreProxy");
//dojo.require("concord.widgets.selectActivityDialog");
//dojo.require("concord.widgets.taskAssignmentDlg");
//dojo.require("concord.widgets.taskHistoryDlg");
//dojo.require("concord.widgets.deleteTaskDlg");
dojo.require("concord.util.events");
dojo.require("concord.util.beta");
dojo.require("dojo.i18n");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.task","AbstractTaskHandler");


dojo.declare("concord.task.AbstractTaskHandler", null, {

	editor: null,
	docBean: null,
	store: null,
	context: {},
	isSync: false,
	bStrict: true,
	bTMenusEnabled: false,
	masterDoc: null,
	masterTask: null,
	WRITE_MODE : 0,
	REVIEW_MODE : 1,
	LOCK_MODE : 2,
	WRITE_COMPLETE_MODE: 3,
	REVIEW_COMPLETE_MODE : 4,
	DISABLE_MODE: 5,
	CACHED_MODE: 5, 
	idTable: null,
	bServiceReady: false,
	
	bShow: true,
	activityDialog: null,
	bSocial: true,
	bActivity: false,
	params: null,
	nls: null,
	featureName: 'assignment',
	
	constructor: function(editor, docBean) {
		this.editor = editor;
		if (!docBean)
			docBean = pe.scene.bean;
		this.docBean = docBean;
		var session = pe.scene.getSession();
		session && session.registerTaskService(concord.beans.TaskService);
		var entitlements = pe.authenticatedUser.getEntitlements();   
		this.bSocial = entitlements.assignment.booleanValue;
		this.bActivity = g_activity; //(g_activitiesUrl != "null");
		this.params = {BETA : concord.util.beta.isBetaFeature(this.featureName)};	
		this.nls = dojo.i18n.getLocalization("concord.task", "AbstractTaskHandler");
	},	
	
	loadTasks: function(){
		var show = pe.settings? pe.settings.getAssignment() : true;
		this.bShow = show;
		
		if (this.store == null)// not Loaded
			this.initStore();
		if (this.store.loaded == this.store.LOADED){
			console.log("task store has been loaded, parseTasks");
			this.parseTasks();
		}
		else if (this.store.loaded == this.store.NOT_LOADED){
			console.log("task store has not been loaded, loading");
			this.bServiceReady = false;
			this.enableTaskCmds(true);	
			
			this.preLoadTask();
			this.store.loadTasks(this.docBean, dojo.hitch(this, this.postLoadTask), this.bStrict);
		}
		else {
			console.log("task store is being loaded or load fail, loaded = " + this.store.loaded);
			//Try to connect to activity server every 10*60*1000 (10 minutes)
			this.doTaskLoadFailed(600000); 
		}
	},
	
	doTaskLoadFailed: function(time){
		//Disable task related menus	
		this.bServiceReady = false;
		this.enableTaskCmds(this.bTMenusEnabled);	
		setTimeout(dojo.hitch(this, function(){
			this.store.loadTasks(this.docBean, dojo.hitch(this, this.postLoadTask), this.bStrict);				
		}), time);
	},
	
	getLoadStatus: function(){
		if (this.store == null)
			return 0;
		else
			return this.store.getLoadStatus();
	},
	
	preLoadTask: function(){
		
	},
	
	postLoadTask: function(tasksInServer){
		if (tasksInServer.loaded < 0){
			if(this.bSocial){
			    var warningMsg = this.bActivity ? this.nls.cannotLoadActivity: this.nls.cannotLoadActivity2;
			    pe.scene.showWarningMessage(warningMsg, 10000);
			    //Try to connect to activity server every 10*60*1000 (10 minutes)
			    this.doTaskLoadFailed(600000); 
			}								
			//Apply cached tasks in doc
			this.applyCachedTasks();
		}
		else{
			//Enable task related menus
			this.bServiceReady = true;
			// enableTaskCmds may be called during loading tasks
			this.enableTaskCmds(this.bTMenusEnabled);
//			var activity = tasksInServer.activity;
//			if (activity != null)
//				concord.beans.TaskService.updateActLink(activity.getId(), activity.getTitle());
			
			this.masterTask = tasksInServer.masterTask;
			this.masterDoc = tasksInServer.masterDoc;

//			if (this.masterTask && this.masterDoc){
//				this.enableSubmitCmd(true);
//			}
			
			var tasks = tasksInServer.tasks;
			if (tasks == null)
				tasks = new Array();
           
			var bshowFlag = false;
			for (var i in tasks){
				this.addSection(tasks[i]);
				bshowFlag = true;
			}

			if(!this.bSocial && bshowFlag){
//				pe.scene.showWarningMessage(this.nls.cannotSupportSocialEdit, 30000);
			}
                            
			this.parseTasks();			
		}
		
	},
	
	isServiceReady: function(){
		return this.bServiceReady;
	},
	
	createTask: function(){
		this.context = this.preTaskCreate();
		if (this.context){
			var title = this.context.title || null;
			var taskBean = new concord.beans.Task(null, title, null, null, null, pe.authenticatedUser.getId(), null, null, null, "new", null, null);
			var createTitle = this.nls.dlgTaskCreateTitle;
			dojo["require"]("concord.widgets.taskAssignmentDlg");
			var dialog = new concord.widgets.taskAssignmentDlg(this.editor, createTitle, null, true, this.params);
			dialog.taskBean = taskBean;
			dialog.actionType = concord.beans.TaskService.ACTION_CREATE;
			dialog.show();
		}
		
	},
	
	deleteTask: function(id){
		var taskBean = null;
		if (id != null){
			if (dojo.isString(id)){
				taskBean = this.getTaskBeanById(id);
			}
			else if (dojo.isObject(id)){
				taskBean = id;
			}
		}
		
		if (taskBean == null){
			taskBean = this.getSelectedTask();
		}
		
		if (taskBean == null)
			return;
		
		var taskId = taskBean.getId();
		
		var canDelete =  (taskBean != null) && (taskBean.getState()=="complete");
		if (!canDelete){
			if (taskBean.getAuthor() != pe.authenticatedUser.getId()){
				pe.scene.showErrorMessage( this.nls.onlyAssignerDeleteTask , 30000 );
				return;
			}
			else{
				dojo["require"]("concord.widgets.deleteTaskDlg");
				var warningDlg = new concord.widgets.deleteTaskDlg(this.editor, this.nls.dlgTaskDeleteTitle, this.nls.dlgTaskDeleteBtn);
				warningDlg.taskId = taskBean.getId();
				warningDlg.show();
			}
		}
		else{
			this.taskDelete(taskId);
		}		
	},
	

	
	taskDelete: function(taskId){
		var updatingMsg = this.bActivity ? this.nls.updatingTask : this.nls.updatingTask2;
		var errorMsg = this.bActivity ? this.nls.cannotAccessActivity : this.nls.cannotAccessActivity2;
		if (this.isSync) {
			pe.scene.showWarningMessage(updatingMsg, 30000);
			setTimeout( dojo.hitch(this, function(){
					// remove task from database
				var succ = concord.beans.TaskService.deleteTask(this.docBean, taskId);
				pe.scene.hideErrorMessage();
						
				if(!succ)
				{
					pe.scene.showErrorMessage( errorMsg, 1000 );
					return;
				} else {
					// remove task from content first
					this.removeTask(taskId);
		
							// Send notification to users
		//				var assigner = pe.lotusEditor.user;
		//	 			var assignee = getUserFullName(taskBean.getAssignee());
		//	 			pe.scene.addNotificationTaskDelete(assigner, assignee, taskBean.getId());	
					if (pe.scene.session.isSingleMode())
						pe.scene.session.save(true);
				}
			}), 0);	
		} else {
			
			this.showInfomationMessage(taskId, this.nls.deleting, updatingMsg, null);
			this.disableTaskArea(taskId, true);
		
			concord.beans.TaskService.deleteTask(this.docBean, taskId, dojo.hitch(this, function(response, ioArgs){
				this.hideInformationMessage(taskId);
				this.disableTaskArea(taskId, false);

				if (response instanceof Error) {
					this.showErrorMessage(taskId, null, errorMsg, 5000);
					//offline
//				   if (pe.isOffline()) {
//				   		this.disableTaskArea(taskId, true);
//				   }
					return;
				}
				if(response){					
					var error_code = response.error_code;
					if(error_code){	
					    var error_info = concord.beans.TaskService.util.getErrorMessageText(error_code);
					    if(error_info) {
					        this.showErrorMessage(taskId, null, error_info, 5000);								
						}
						return;
					}
				} else {	
					// remove task from content first
					this.removeTask(taskId);
							// Send notification to users
		//				var assigner = pe.lotusEditor.user;
		//	 			var assignee = getUserFullName(taskBean.getAssignee());
		//	 			pe.scene.addNotificationTaskDelete(assigner, assignee, taskBean.getId());	
					if (pe.scene.session.isSingleMode())
						pe.scene.session.save(true);				
				}		
			}));
		}

	},
			
	updateTask : function(taskBean, action)	{
		var taskId = taskBean.getId();
		var updatingMsg = this.bActivity ? this.nls.updatingTask : this.nls.updatingTask2;
		var errorMsg = this.bActivity ? this.nls.cannotAccessActivity : this.nls.cannotAccessActivity2;
		if (this.isSync) {
			pe.scene.showWarningMessage(updatingMsg, 30000);
			setTimeout( dojo.hitch(this, function(){
				var taskBean = concord.beans.TaskService.updateTask(this.docBean, taskId, action);
				pe.scene.hideErrorMessage();
					
				if(taskBean == null)
				{
					pe.scene.showErrorMessage( errorMsg, 1000 );
					return;
				}
				console.log("Get taskBean in updateTask, title:" + taskBean.getTitle() );
						//var section = editor.sections[taskBean.getId()];
				this.taskUpdateResonpseHandler(taskBean, action); 
				}), 0 );
		} else {
			this.showInfomationMessage(taskId, this.nls.updating, updatingMsg, null);
			this.disableTaskArea(taskId, true);
			concord.beans.TaskService.updateTask(this.docBean, taskId, action, dojo.hitch(this, function(response, ioArgs){
				this.hideInformationMessage(taskId);
				this.disableTaskArea(taskId, false);	
				if (!response || response instanceof Error) {
				   this.showErrorMessage(taskId, null, errorMsg, 5000);		
					//offline
//				   if (pe.isOffline()) {
//				   		this.disableTaskArea(taskId, true);
//				   }
					return;					
				}
				var error_code = response.error_code;
				if(error_code){ 
					var error_info = concord.beans.TaskService.util.getErrorMessageText(error_code);
					if(error_info)
						this.showErrorMessage(taskId, null, error_info, 5000);													
					return;
				}				
					
				if (response){
					var task = new concord.beans.Task();
					dojo.mixin(task, response);
					if(task == null)
					{
						this.showErrorMessage(taskId, null, errorMsg, 5000);
						return;		
					}					
					this.taskUpdateResonpseHandler(task, action);									
				}		
				
			}));
		}
		
	},
	
	updateTasks : function(taskBeans, action)	{
		var taskId = taskBeans[0].getId();
		var updatingMsg = this.bActivity ? this.nls.updatingTask : this.nls.updatingTask3;
		var errorMsg = this.bActivity ? this.nls.cannotAccessActivity : this.nls.cannotAccessActivity2;
		pe.scene.showWarningMessage(updatingMsg, 30000);
		concord.beans.TaskService.updateTasks(this.docBean, taskId, action, dojo.hitch(this, function(response, ioArgs){
			pe.scene.hideErrorMessage();	
			if (!response || response instanceof Error) {
				pe.scene.showErrorMessage( errorMsg, 1000 );		
				return;					
			}
			var error_code = response.error_code;
			if(error_code){ 
				var error_info = concord.beans.TaskService.util.getErrorMessageText(error_code);
				if(error_info)
					pe.scene.showErrorMessage( error_info, 1000 );													
				return;
			}										
			if (response){
				var tasksObj = response.tasks;
				if(tasksObj == null)
				{
					pe.scene.showErrorMessage( errorMsg, 5000 );
					return;		
				}
				var taskBeans = new Array();
				for(var i=0 ;i< tasksObj.length; i++){
					var task = new concord.beans.Task();
					dojo.mixin(task, tasksObj[i]);
					taskBeans.push(task);							
				}
				this.taskUpdatesResonpseHandler(taskBeans, action);															
			}		
		}));	
	},
	
	taskUpdatesResonpseHandler: function(taskBeans, action)
	{	
		for(var i=0; i<taskBeans.length; i++){
			var taskBean = taskBeans[i];
			var taskId = taskBean.getId();
			
			this.updateSection(taskBean, null,action);
				
			if (taskBean.getAssignee()){
				this.addEditor(taskBean.getAssignee());
			}					
			if (taskBean.getReviewer()){
				this.addEditor(taskBean.getReviewer());
			}				
			this.updateTaskArea(taskId); 	
			this.publishUpdateTaskMsg(taskId, this.getPublishCachedTaskObj(taskBean));										
		}
		if (pe.scene.session.isSingleMode())					
			pe.scene.session.save(true);	
					
		this.updateCommandState(this.getSelectedTask());		
	},
	
	taskUpdateResonpseHandler: function(taskBean, action){
	
		var taskId = taskBean.getId();

			//var section = editor.sections[taskBean.getId()];
		var fragId = null;
		if (action.fragId)
			fragId = action.fragId;
		else if (taskBean.getState()!="working")
			fragId = "";
		
		this.updateSection(taskBean, null,action);
				
		if (taskBean.getAssignee()){
			this.addEditor(taskBean.getAssignee());
		}
					
		if (taskBean.getReviewer()){
			this.addEditor(taskBean.getReviewer());
		}
					
		this.updateTaskArea(taskId); 	
					
		if (action.fragId)
			this.gotoFragment(action.fragId);
					
		if(this.getTaskBeanById(taskId)== this.getSelectedTask())
		{
			this.updateCommandState(this.getTaskBeanById(taskId));	
		}
		this.publishUpdateTaskMsg(taskId, this.getPublishCachedTaskObj(taskBean));				
		if (pe.scene.session.isSingleMode())					
			pe.scene.session.save(true);				
		
	},		
	/*
	 * Get task as json format and ready to store it in document
	 */
	getPublishCachedTaskObj: function(taskBean){	
		var cachedTask = {};
	    cachedTask.c_title = taskBean.getTitle() == null ? "" : taskBean.getTitle();
	    cachedTask.c_content = taskBean.getContent() == null? "" : taskBean.getContent();
	    cachedTask.c_author = taskBean.getAuthor() == null? "" : taskBean.getAuthor();
	    cachedTask.c_owner = taskBean.getOwner() == null ? "" : taskBean.getOwner();
	    cachedTask.c_state = taskBean.getState() == null ? "" : taskBean.getState();
	    cachedTask.c_assignee = taskBean.getAssignee() == null ? "" : taskBean.getAssignee();
	    cachedTask.c_reviewer = taskBean.getReviewer() == null ? "" : taskBean.getReviewer();	
	    cachedTask.c_activity = taskBean.getActivity() == null ? "" : taskBean.getActivity();	
	    cachedTask.c_duedate = taskBean.getDuedate() == null ? this.getCachedTaskObj(taskBean.getId()).duedate 
		                          : this.parseDateToTime(taskBean.getDuedate());	        
	    cachedTask.c_createDate =  taskBean.getCreateDate() == null ? this.getCachedTaskObj(taskBean.getId()).createDate
	                               : this.parseDateToTime(taskBean.getCreateDate());
		return cachedTask;
	},
	
	checkTask: function(taskBean){
		//check state, if it's invalid, can't restore
		var state = taskBean.getState();
		if(typeof state == 'undefined' || state == null) return false;
		if(state != 'new' &&  state != 'working' && 
		   state != 'rejected' && state != 'waitingReview' && state != 'complete'){
			return false;
		}
    	/*
    	 * State: New 	 Working  Rejected waitingReview complete
         * owner: Assignee Assignee Assignee Reviewer	 Reviewer||Assignee    	  
    	 */
    	var state = taskBean.getState();
    	var owner = taskBean.getOwner();
    	var assignee =  taskBean.getAssignee();
    	var reviewer = taskBean.getReviewer();    	
    	var bAssignee = owner == assignee;
    	var bReviewer = owner == reviewer;
    	var fragId = taskBean.getFragid();
    	
    	if(state == 'new'){
    		if(!bAssignee){
    			return false;
    		}
    	}else if(state == 'rejected'){
    		//Reviewer may be null in task's reject status
     		if(!bAssignee){
    			return false;
    		}   		
    	}else if(state == 'working'){
    		if(!bAssignee || !fragId){
    			return false;
    		}
    		   		
    	}else if(state == 'waitingReview'){
    		if(!bReviewer){
    			return false;
    		}
    	}else if(state == 'complete'){
    		if(reviewer && !bReviewer){
    			return false;
    		}else if(!reviewer && !bAssignee){
    			return false;
    		}
    	}     	
        var docid = taskBean.getDocid();
        if(typeof docid == 'undefined' || docid == null){
        	//apply cached docid, stored fragid and createDate to hack the defect in connection activity
             this.restoreTaskInServer(taskBean);           
        } 
        return true;
    },
    
    parseDateToTime: function(createDate){
    	var theDate = new Date(createDate);
    	return String(theDate.getTime());
    },
    
    parseTimeToDate: function(createDate){    	
    	var newCreateDate = new Date(parseInt(createDate));
    	return newCreateDate.toUTCString();
    },
    
    restoreTaskInServer: function(taskBean){
    	//if restoring task fails to connect to activity server, delete it in doc
    	var taskid = taskBean.getId();
    	var cachedtaskObj = this.getCachedTaskObj(taskid);
    	var createDate =  new Date(parseInt(cachedtaskObj.createDate));
    	taskBean.setCreateDate(createDate);
    	
    	var prop = {};	
		prop['createDate']= this.parseTimeToDate(cachedtaskObj.createDate);
		
		var action = concord.beans.TaskService.util.buildUpdateAction(taskBean, concord.beans.TaskService.ACTION_RESTORE, prop);
		this.showInfomationMessage(taskid, this.nls.restoring, this.nls.restoringTask, null);
		this.disableTaskArea(taskid, true);				
    	concord.beans.TaskService.updateTask( this.docBean, taskid, action, dojo.hitch(this, function(response, ioArgs){
			this.hideInformationMessage(taskid);
			var bFailRestore =  false;
			this.disableTaskArea(taskid, false);
			if (!response || response instanceof Error) {
				console.log("error when restore object");
				bFailRestore = true;
			}else if(response){
				var error_code = response.error_code;
				if(error_code){ 
					console.log("error when restore object");
					bFailRestore = true;												
				}				
			}
			if(bFailRestore){
				taskBean.setbInvalid(true); 	
				this.updateTaskArea(taskBean.getId());					
				this.showErrorMessage(taskBean.getId(), null, this.nls.notValidAssignment);	
				return;				
			} 
			if(response){
				var task = new concord.beans.Task();
				dojo.mixin(task, response);
				this.taskUpdateResonpseHandler(task, action);
				console.log("restore docid successfully");
				this.checkAccessError(task, true);				
			}
																	
		}));    	
        },
	/**
	 * @param taskBean, the task to be verified
	 * @param checkCached, check cached id table 
	 */
	checkAccessError: function(taskBean, checkCached){
		var assignee = taskBean.getAssignee();
		var reviewer = taskBean.getReviewer();
		var canAEdit = true;
		var canREdit = true;
		if(assignee){
			canAEdit = this.checkAccessPriviledge(assignee, checkCached);			 
		}
		if(reviewer && canAEdit){
			canREdit = this.checkAccessPriviledge(reviewer, checkCached);		
		}
		if(!canAEdit || !canREdit){
			this.showErrorMessage(taskBean.getId(), null, this.nls.notAllowedEditPaticipant);			
		} 
	},
			
	/**
	 * This method is applied to verify assignee & reviewer's right to Edit the task.
	 * @param userId, the unique id of a participant
	 * @param checkCached, check cached id table 
	 */
	checkAccessPriviledge : function(userId, checkCached){
		 
		if(!this.idTable) 
		{
			this.idTable = new Array();
		}
	    //check cached id table			
		if(checkCached){
			for(var i in this.idTable){
				if(this.idTable[i].id == userId){
					return this.idTable[i].canEdit;
				}
			}		
		} 

		var permissionUrl = concord.util.uri.getDocUri()+ '/permission?id=' + userId;
		var canEdit = false;
		var response, ioArgs;
		dojo.xhrGet({
		    url: permissionUrl,
		    handle: function(r, io){
		        response = r;
		        ioArgs = io;
		    },
		    sync: true,
		    handleAs: "json",
		    preventCache: true
		 });
		if (response instanceof Error) {
		    canEdit = false;
		} else {
		    var result = response.permission;
		    if (typeof result == 'undefined') 
		    {
		        var error_code = response.error_code;
		        if (error_code) 
		            canEdit = false;
		    }else if (result == "EDIT") {
		            canEdit = true;
		    }
		}
		
		var containedIndex = -1;
		for(var i in this.idTable){
			if(this.idTable[i].id == userId){
				containedIndex = i;
			}
		}	
		if(containedIndex != -1){ 			
			delete this.idTable[containedIndex]			
		}			
		this.idTable.push({id: userId, canEdit: canEdit});
		
		return canEdit;				
	},
	
	handleSpecificCharacters : function(title){
		title = title.replace(new RegExp('([\\\\\/\:\*\?\"\<\>\|]+)','g'), ' ');
		return title;
	},
		
	workonTask: function(id){
		var taskBean = null;
		var taskId = null;
		if (dojo.isString(id)){
			taskBean = this.getTaskBeanById(id);
			taskId = id;
		}
		else {
			taskBean = id;
			taskId = taskBean.id;
		}
			
		
		if (pe.scene.session.isSingleMode())
			pe.scene.session.save(true);
		//1 create a new document with current content
		//url pattern : /docs/api/frgsvr/{repo-id}/{doc-uri}/fragment?type=text
		var servletUrl = concord.util.uri.getDocFragmentUri();
		var newTitle = this.docBean.getTitle()+"_" + this.handleSpecificCharacters(taskBean.getTitle());
		var newTitle = encodeURI(newTitle);
		servletUrl = servletUrl + "?type=" + pe.scene.docType + "&section=" + taskBean.getId() +"&newTitle=" + newTitle;
		var fragDocBean;

		if (this.isSync) {
			pe.scene.showWarningMessage(this.nls.creatingFragment, 30000);
			setTimeout( dojo.hitch(this, function(){
				dojo.xhrPost({
					url: servletUrl,
					handleAs: "json",
					handle: function(r, io) {
						response = r; 
						ioArgs = io;
						fragDocBean = new concord.beans.Document(response);
					},
					sync: true,
					contentType: "text/plain"
				});
				var fragId = fragDocBean.getRepository() + '/' + fragDocBean.getUri();			
				pe.scene.hideErrorMessage();
				if (fragId != null){
					taskBean.fragid = fragId;
					var prop = {};
					prop['fragid'] = fragId;
					var action = concord.beans.TaskService.util.buildUpdateAction(taskBean, concord.beans.TaskService.ACTION_PRIVATE, prop);
					if (action != null){					
						action.fragId = fragId;
						this.updateTask(taskBean, action);		
					}
				}
			}), 0);			
			
		} else {
			
			this.showInfomationMessage(taskId, this.nls.updating, this.nls.creatingFragment, null);
			this.disableTaskArea(taskId, true);
			var thisObj = this;
			setTimeout( dojo.hitch(this, function(){
				dojo.xhrPost({
						url: servletUrl,
						handleAs: "json",
						handle: function(r, io) {
							response = r; 
							ioArgs = io;
							fragDocBean = new concord.beans.Document(response);
							
							thisObj.hideInformationMessage(taskId);
							
							var fragId = fragDocBean.getRepository() + '/' + fragDocBean.getUri();							
							if (fragId != null){
								taskBean.fragid = fragId;
								var prop = {};
								prop['fragid'] = fragId;
								var action = concord.beans.TaskService.util.buildUpdateAction(taskBean, concord.beans.TaskService.ACTION_PRIVATE, prop);
								if (action != null){					
									action.fragId = fragId;
									thisObj.updateTask(taskBean, action);		
								}
							}		
											
						},
						sync: false,
						contentType: "text/plain"
					});		
			}), 0);			
			
		}

				
	},
	
	submitTask: function(data, parentDocId, taskId){
		if (!parentDocId || !taskId){
			parentDocId = this.masterDoc;
			taskId = this.masterTask;
		}
			
		var taskBean = concord.beans.TaskService.getTask(parentDocId, taskId);
					
		if (!taskBean){
			pe.scene.showWarningMessage( this.nls.taskAlreadyRemoved , 10000 );
			this.masterDoc = null;
			this.masterTask = null;
//			this.enableSubmitCmd(false);
		}
		else if (taskBean.getAssignee()!=pe.authenticatedUser.getId()){
			pe.scene.showWarningMessage( this.nls.taskAlreadyReassigned, 10000);
			this.masterDoc = null;
			this.masterTask = null;
//			this.enableSubmitCmd(false);
		}
		else if (taskBean.getState()!='working'){
			pe.scene.showWarningMessage( this.nls.taskAlreadyCompleted, 10000);
			this.masterDoc = null;
			this.masterTask = null;
//			this.enableSubmitCmd(false);
		} 
		else if (taskBean.getFragid() != (this.docBean.getRepository() + '/' + this.docBean.getUri())){
			pe.scene.showWarningMessage( this.nls.taskAlreadyCompleted, 10000);
			this.masterDoc = null;
			this.masterTask = null;
//			this.enableSubmitCmd(false);
		}
        else{
			pe.scene.showWarningMessage( this.nls.updatingMaster , 30000 );
			setTimeout( dojo.hitch(this, function(){
		        var permissionUrl = concord.util.uri.getDocServiceRoot() + '/' + parentDocId + '/permission?id=' + pe.authenticatedUser.getId();
		        var canEdit = false;
		        var response, ioArgs;
		        dojo.xhrGet({
		            url: permissionUrl,
		            handle: function(r, io){
		                response = r;
		                ioArgs = io;
		            },
		            sync: true,
		            handleAs: "json",
		            preventCache: true
		        });
		        if (response instanceof Error) {
					canEdit = false;
		        }
		        else {
		            var result = response.permission;
		            if (typeof result == 'undefined') {
		                var error_code = response.error_code;
		                if (error_code) 
		                  	canEdit = false;
		            }
		            else if (result == "EDIT") {
		                canEdit = true;
		            }
		        }
		            
		        if (!canEdit){
		         	pe.scene.hideErrorMessage();
		           	pe.scene.showErrorMessage(this.nls.notAllowedEditMaster, 10000);
		        }				
		        else{
				var prop = {};
				prop['fragid']=null;
				var action = concord.beans.TaskService.util.buildUpdateAction(taskBean, concord.beans.TaskService.ACTION_SUBMIT_PRIVATE, prop);
				taskBean = concord.beans.TaskService.updateTask(taskBean.getDocid(), taskBean.getId(), action);
				if (!taskBean){
					var errorMsg = this.bActivity ? this.nls.cannotAccessActivity : this.nls.cannotAccessActivity2;
					pe.scene.showWarningMessage( errorMsg, 10000 );
				}
				else{
					var result = pe.scene.submit(data);
					pe.scene.hideErrorMessage();
					this.postSubmitTask(taskBean, result);
							this.masterDoc = null;
							this.masterTask = null;
//					this.enableSubmitCmd(false);
				}
					
	        	}
        	}), 500);
		}
							
	},
	
	deleteTasks : function(state)
	{
		pe.scene.showWarningMessage(this.bActivity ? this.nls.updatingTask : this.nls.updatingTask2, 30000);
		setTimeout( dojo.hitch(this, function(){
			var deletionList = concord.beans.TaskService.deleteTasks(this.docBean, state)
			pe.scene.hideErrorMessage();
				
			if (deletionList == null && this.bSocial){
				var errorMsg = this.bActivity ? this.nls.cannotAccessActivity : this.nls.cannotAccessActivity2;
				pe.scene.showErrorMessage( errorMsg, 1000 );
			}else{
				this.store.startBatchUpdate();
				for (var i in deletionList){
					if (i != null){
						var taskId = deletionList[i];
						this.removeTask(taskId);
					}
				}
				this.store.endBatchUpdate(concord.util.events.taskEvents_eventName_taskDeleted, deletionList);
				// Send notification to users
				//	var assigner = pe.lotusEditor.user;
				//	var assignee = getUserFullName(taskBean.getAssignee());
				//	pe.scene.addNotificationTaskDelete(assigner, assignee, taskBean.getId());	
					if (pe.scene.session.isSingleMode())
						pe.scene.session.save(true);
	
				}
			}), 0 );
			
	},
			
	gotoFragment: function(fragId){	
		// IE do not allow "-", " " in window name
		var a = fragId.split("/", 2);
		var docUri = a[1];
		var name = docUri.replace(/[-\s.@]/g, '_');
		var uri = concord.util.uri.getDocPageUriById(fragId);
		var privateDoc = window.open(uri, name);
		if(privateDoc && privateDoc.top){
			//do nothing
		}else{
			alert(this.nls.disableBlockerMsg);
		} 
	},
	
	selectActivity: function(){
		if (!this.activityDialog) {
			dojo["require"]("concord.widgets.selectActivityDialog");
			this.activityDialog = new concord.widgets.selectActivityDialog(this.editor);
		}
		this.activityDialog.show();		
	},
	
	doActions: function(taskBeans, actionType){
		if (taskBeans == null || taskBeans.length == 0)
			return;	
		//complete or approve	
		if (actionType == concord.beans.TaskService.ACTION_WORKDONE 
			|| actionType == concord.beans.TaskService.ACTION_APPROVE){
			var taskBean = taskBeans[0];
			var action = concord.beans.TaskService.util.buildUpdateAction(taskBean, actionType);
			if (action != null){
				action = concord.beans.TaskService.util.getUnionAction(taskBeans, action);				
				this.updateTasks(taskBeans, action);
			}			
		}else if ((actionType == concord.beans.TaskService.ACTION_REJECT) // reject, reassign and reopen 
			|| (actionType == concord.beans.TaskService.ACTION_REASSIGN) || (actionType == concord.beans.TaskService.ACTION_REOPEN)){
			
			var dialog = null;
			dojo["require"]("concord.widgets.taskAssignmentDlg");
			if (actionType == concord.beans.TaskService.ACTION_REJECT)
				dialog = new concord.widgets.taskAssignmentDlg(this.editor, this.nls.dlgTaskRewordTitle, null, true, this.params);
			else if (actionType == concord.beans.TaskService.ACTION_REOPEN)
				dialog = new concord.widgets.taskAssignmentDlg(this.editor, this.nls.dlgTaskReopenTitle, null, true, this.params);
			else if (actionType == concord.beans.TaskService.ACTION_REASSIGN)
				dialog = new concord.widgets.taskAssignmentDlg(this.editor, this.nls.dlgTaskReassignTitle, null, true, this.params);				
						
			dojo["require"]("concord.task.TaskUtil");
			dialog.taskBean = taskBeans[0];	
			var taskConfig = {};
			taskConfig.beans = taskBeans;
			dialog.taskConfig = taskConfig;
			dialog.actionType = actionType;
			dialog.show();						
		}else if (taskBeans.length == 1){				
			this.doAction(taskBeans[0], actionType);		
		}
	},
	
	doAction : function(taskBean, actionType){
		//console.log(actionType);
//		this.context.area = area;
		if (taskBean == null)
			return;

		if (dojo.isString(taskBean)){
			taskBean = this.getTaskBeanById(taskBean);
		}
		
		var action = null;
		if (actionType ==concord.beans.TaskService.ACTION_ABOUT){
			dojo["require"]("concord.widgets.taskHistoryDlg");		
			var hDlg = new concord.widgets.taskHistoryDlg(this.editor, this.nls.dlgTaskHistoryTitle, null, false, this.params);
			hDlg.renderContent(taskBean);
			hDlg.show();			
		}else if (actionType == concord.beans.TaskService.ACTION_REMOVE){//delete
			
			// open confirm dialog			
			this.deleteTask(taskBean);			
			
		}else if (actionType == concord.beans.TaskService.ACTION_GOTO_PRIVATE){
			//var fragId = this.getFragid(taskBean.getId());
			var fragId = taskBean.getFragid();

			if (fragId){
				this.gotoFragment(fragId);
			}

		}
		else if ((actionType == concord.beans.TaskService.ACTION_EDIT) || (actionType == concord.beans.TaskService.ACTION_REJECT) 
				|| (actionType == concord.beans.TaskService.ACTION_REASSIGN) || (actionType == concord.beans.TaskService.ACTION_REOPEN)) {
				// open taskassignment dialog
				var dialog = null;
				dojo["require"]("concord.widgets.taskAssignmentDlg");
				if (actionType == concord.beans.TaskService.ACTION_EDIT)
					dialog = new concord.widgets.taskAssignmentDlg(this.editor, this.nls.dlgTaskEditTitle, null, true, this.params);
				else if (actionType == concord.beans.TaskService.ACTION_REJECT)
					dialog = new concord.widgets.taskAssignmentDlg(this.editor, this.nls.dlgTaskRewordTitle, null, true, this.params);
				else if (actionType == concord.beans.TaskService.ACTION_REOPEN)
					dialog = new concord.widgets.taskAssignmentDlg(this.editor, this.nls.dlgTaskReopenTitle, null, true, this.params);
				else if (actionType == concord.beans.TaskService.ACTION_REASSIGN)
					dialog = new concord.widgets.taskAssignmentDlg(this.editor, this.nls.dlgTaskReassignTitle, null, true, this.params);				
				
				dialog.taskBean = taskBean;
				dialog.actionType = actionType;
				dialog.show();
			}
		else if (actionType == concord.beans.TaskService.ACTION_PRIVATE){// edit
			this.workonTask(taskBean);
		}else if (actionType == concord.beans.TaskService.ACTION_WORKDONE 
			|| actionType == concord.beans.TaskService.ACTION_APPROVE
			|| actionType == concord.beans.TaskService.ACTION_CANCEL_PRIVATE){//complete or approve	or cancel private
			action = concord.beans.TaskService.util.buildUpdateAction(taskBean, actionType);
			if (action != null){
				this.updateTask(taskBean, action);
			}
		}
	},
	
	getTaskBeanById: function(taskId){
		if (!taskId)
			return null;
		return this.store.getTaskBean(taskId);
	},
	
	// Get all tasks
    getAllTasks : function(){
    	if (this.store)
    		return this.store.getAllTaskBeans();
    	else
    		return null;
    },
	// Is the task existed in document?
    isTaskExisted: function(taskId){
    	return (this.getTaskBeanById(taskId)) ? true : false;	
	},
	
	getESCTitle : function (title){
		if(title){
			title = title.replace(/</g, "&lt; ").replace(/>/g, "&gt; ");
		}
		return title;
	},
			
	getTitleInfo : function(taskBean){
		var mode = null;
		var title = null;
		var assignee = taskBean.getOwner();
		
		var invalid = taskBean.getbInvalid();
		if(invalid){
			title = taskBean.getTitle();
			mode = this.CACHED_MODE;	
			return {title: this.getESCTitle(title), mode: mode};						
		}		
		var taskBean_title = taskBean.getTitle();
		var userFullName = this.getUserFullName(assignee);
		if (BidiUtils.isBidiOn()) {
			taskBean_title = BidiUtils.addEmbeddingUCC(taskBean_title);
			userFullName = BidiUtils.addEmbeddingUCC(userFullName.toString());
		}
		if(taskBean.getTypeId()=="delegationsection"){
			mode = this.WRITE_MODE;
			if (taskBean.getState() == "complete"){
				title = dojo.string.substitute(this.nls.writeCompleteDesc, [taskBean_title, userFullName]);
				mode = this.WRITE_COMPLETE_MODE;
			}else if (taskBean.getState() == "rejected"){
				title = dojo.string.substitute(this.nls.reworkDesc, [taskBean_title, userFullName]);
			}else if (taskBean.getState() == "working"){ 
				title = dojo.string.substitute(this.nls.workingPrivateDesc, [taskBean_title, userFullName]);
			}
			else {
				title = dojo.string.substitute(this.nls.writeDesc, [taskBean_title, userFullName]);
			}
		}
		else if(taskBean.getTypeId()=="reviewsection"){
			mode = this.REVIEW_MODE;
			if (taskBean.getState() == "complete"){
				mode = this.REVIEW_COMPLETE_MODE;
				title = dojo.string.substitute(this.nls.reviewCompleteDesc, [taskBean_title, userFullName]);
			}else {
				title = dojo.string.substitute(this.nls.reviewDesc, [taskBean_title, userFullName]);
			}
		}

		if (taskBean.getState()=="working"){
			mode = this.LOCK_MODE;
		}
		return {title: this.getESCTitle(title), mode: mode};
	},
	
	assignTask : function(action)
	{	
		var localContext = this.context;
		this.context = {};	
		var id = null;	
								
		if(localContext instanceof Array){
			var length = localContext.length;
			if(length > 0){
				action.setMultiple(length);
				this._assignAsyncTasks(localContext, action);									
			}
		}else {				
			if (localContext.area) {
				//fieldset id
				id = localContext.area.$.id; 
			}else {
				//range id
				id = localContext._id;
			}
			if(this.isSync){
				this._assignSyncTask(localContext, action, id);
			}else{
				this._assignAsyncTask(localContext, action, id);						
			}
		}
	},

	_assignSyncTask: function(localContext, action, id){
		var creatingMsg = this.bActivity ? this.nls.creatingTaskAsTODO: this.nls.creatingTaskAsTODO2;
		var errorMsg = this.bActivity ?	this.nls.cannotAccessActivity: this.nls.cannotAccessActivity2;		
		pe.scene.showWarningMessage(creatingMsg, 30000);
		setTimeout( dojo.hitch(this, function(){
			var result = concord.beans.TaskService.createTask(this.docBean, action);
			pe.scene.hideErrorMessage();					
			if((result == null)||  (result.task == null) || (result.activity == null))
			{
				pe.scene.showErrorMessage( errorMsg, 30000 );
				this.taskCreateFailed(localContext);
				localContext = {};
				return;
			}						
			var taskBean = result.task;
			var activity = result.activity;					
			if ((this.docBean.getActivity()== null) || (activity.getId()!= this.docBean.getActivity().getId()))
			{
				concord.beans.TaskService.updateActLink(activity.getId(), activity.getTitle());
			}					
			var taskId = taskBean.getId();
			try{
				var info = this.updateNewTaskArea(localContext, taskBean);					
				if (info){
					
					this.addSection(taskBean, info);			
							
					if (taskBean.getAssignee()){
						this.addEditor(taskBean.getAssignee());
					}				
					if (taskBean.getReviewer()){
						this.addEditor(taskBean.getReviewer());
					}			
					this.postTaskCreate(taskBean, localContext, info);
				}
			}catch(e){
				pe.scene.showErrorMessage( e, 10000 );
				this.taskCreateFailed(localContext, taskBean);
			}	
		}), 0);		
	},
	
	_assignAsyncTask: function(localContext, action, id){
		var creatingMsg = this.bActivity ? this.nls.creatingTaskAsTODO: this.nls.creatingTaskAsTODO2;
		var errorMsg = this.bActivity ?	this.nls.cannotAccessActivity: this.nls.cannotAccessActivity2;	
				
		this.showInfomationMessage(id, this.nls.creating, creatingMsg, null);
		concord.beans.TaskService.createTask(this.docBean, action, dojo.hitch(this, function(response, ioArgs){				
			this.hideInformationMessage(id);
			if (!response || response instanceof Error) {
				console.info("error when create object");
				this.showErrorMessage(id, errorMsg, null, null);
				this.taskCreateFailed(localContext);
				localContext = {};
				return;
			}
			var error_code = response.error_code;
			if(error_code){
				var error_info = concord.beans.TaskService.util.getErrorMessageText(error_code);
				if(error_info)
					this.showErrorMessage(id, error_info, null, null);
				this.taskCreateFailed(localContext); 				
				return;
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
				if((result == null)||  (result.task == null) || (result.activity == null))
				{
					this.showErrorMessage(id, errorMsg, null, null);
					this.taskCreateFailed(localContext);
					return;					
				}							
				var taskBean = result.task;
				var activity = result.activity;	
					
				if ((this.docBean.getActivity()== null) || (activity.getId()!= this.docBean.getActivity().getId()))
				{
					concord.beans.TaskService.updateActLink(activity.getId(), activity.getTitle());
				}						
				var taskId = taskBean.getId();
				try{
					var info = this.updateNewTaskArea(localContext, taskBean);
						
					if (info){
						
						this.addSection(taskBean, info);			
								
						if (taskBean.getAssignee()){
							this.addEditor(taskBean.getAssignee());
						}
					
						if (taskBean.getReviewer()){
							this.addEditor(taskBean.getReviewer());
						}
						this.postTaskCreate(taskBean, localContext, info);
					}
				}catch(e){
					console.log("Error to update new task area");
					this.showErrorMessage(id, e, null, null);
					this.taskCreateFailed(localContext, taskBean);
					return;
				}
			} 
		}));		
	},
	
	_assignAsyncTasks: function(localContext, action){
		var msg = (action.getMultiple() == 1) ? this.nls.creatingTaskAsTODO2 : this.nls.creatingTaskAsTODO3;
		var creatingMsg = this.bActivity ? this.nls.creatingTaskAsTODO : msg;
		var errorMsg = this.bActivity ?	this.nls.cannotAccessActivity: this.nls.cannotAccessActivity2;		
		pe.scene.showWarningMessage(creatingMsg, 30000);
		
		concord.beans.TaskService.createTasks(this.docBean, action, dojo.hitch(this, function(response, ioArgs){				
			pe.scene.hideErrorMessage();
			if (!response || response instanceof Error) {
				console.info("error when create object");
				pe.scene.showErrorMessage( errorMsg, 30000 );
				this.taskCreateFailed(localContext);
				localContext = {};
				return;
			}
			var error_code = response.error_code;
			if(error_code){
				var error_info = concord.beans.TaskService.util.getErrorMessageText(error_code);
				if(error_info)
					pe.scene.showErrorMessage( error_info, 30000 );
				this.taskCreateFailed(localContext); 				
				return;
			}								
			if (response){
				var tasksObj = response.tasks;
				var taskBeans = [];
				if (tasksObj != null){
					for(var i=0 ;i< tasksObj.length;i++){
						var task = new concord.beans.Task();
						dojo.mixin(task, tasksObj[i]);
						taskBeans.push(task);						
					}
				}	
				var activity = null;
				var actObj = response.activity;
				if (actObj != null){
					activity = new concord.beans.Activity(actObj.activityId, actObj.activityName);
				}
				var result = {
					activity: activity,
					tasks: taskBeans
				}					
				if((result == null)||  (result.tasks.length == 0) || (result.activity == null))
				{
					pe.scene.showErrorMessage( errorMsg, 30000 );
					this.taskCreateFailed(localContext);
					return;					
				}
				var activity = result.activity;						
				if ((this.docBean.getActivity()== null) || (activity.getId()!= this.docBean.getActivity().getId()))
				{
					concord.beans.TaskService.updateActLink(activity.getId(), activity.getTitle());
				}
				for(var i=0; i< taskBeans.length; i++){		
					var taskBean = taskBeans[i];
					var taskId = taskBean.getId();
					var slideContext = localContext[i];
					try{
						var info = this.updateNewTaskArea(slideContext, taskBean);						
						if (info){						
							this.addSection(taskBean, info);											
							if (taskBean.getAssignee()){
								this.addEditor(taskBean.getAssignee());
							}					
							if (taskBean.getReviewer()){
								this.addEditor(taskBean.getReviewer());
							}
							this.postTaskCreate(taskBean, slideContext, info);
						}
					}catch(e){
						console.log("Error to update new task area");
						this.showErrorMessage( e, 30000);
						this.taskCreateFailed(slideContext, taskBean);
						continue;
					}					
				}
				this.updateCommandState(this.getSelectedTask());				
			} 
		}));		
	},		
	postTaskCreate: function(taskBean, context, info){
		this.publishInsertTaskMsg(taskBean.getId(), context, info);
		if (pe.scene.session.isSingleMode())					
		   	pe.scene.session.save(true);	
	},

	
	removeTask : function(taskId){
		var selectedTask = this.getSelectedTask();
		
		this.publishDeleteTaskMsg(taskId);
		this.deleteTaskArea(taskId);
		this.deleteSection(taskId);		
		// check if it is the selected task		
		if(selectedTask instanceof Array){
			//multiple assignments case
			this.updateCommandState(selectedTask);
		}else{
			var bSelected = selectedTask ? (taskId == selectedTask.getId()) : false;
			// if it is selected task, updateCommandState(null)
			if(bSelected){
				this.updateCommandState(null);
			}			
		}
		if (pe.scene.session.isSingleMode())					
		   	pe.scene.session.save(true);
		return;
	},
	
	addSection : function(taskBean, info){
		this.store.addSection(taskBean, info);
	},
	
	updateSection: function(taskBean, info, action){
		this.store.updateSection(taskBean, info, action);
	},
	
	deleteSection: function (taskId){
		this.store.deleteSection(taskId);
	},
	
	setShow : function (show){
		this.bShow = show;
		if (show)
			this.showAllTasks();
		else
			this.hideAllTasks();
		
		if(pe.settings) pe.settings.setAssignment(this.bShow);	
	},
	
	toggleShow: function (){
		this.setShow(!this.bShow);
	},	
	
	addEditor: function(editorId){
		if (!pe.scene.getEditorStore().exists(editorId)){
			var editor = {};
			var userBean = ProfilePool.getUserProfile(editorId);
			editor.userId = userBean.getId();
			editor.orgId = userBean.getOrgId();
			editor.displayName = userBean.getName();
					
			pe.scene.getEditorStore().add(new concord.beans.EditorItem(editor));
		}
		
	},
	
	refreshEditorIfNeeded: function(editorId){
		if (!pe.scene.getEditorStore().exists(editorId)){
			pe.scene.getEditorStore().refresh();
		}
	},
	
	getUserFullName: function(id) {
		var editor = pe.scene.getEditorStore().getEditorById(id);		
		return editor ? editor.getName() : null;	
	},
	
	//////////////////////////////////Abstract function//////////////////////
	initStore: function(){
		throw new Error("initStore not implemented");
	},
	
	parseTasks: function(tasks){
		throw new Error("parseTasks not implemented");
	},
	
	cancelAssignment : function(){ // callback for task assignment dialog
		throw new Error("cancelAssignment not implemented");
	},
	
	changeMode : function(mode){ // callback for task assignment dialog
		throw new Error("changeMode not implemented");
	},
	
	showAllTasks: function(){
		throw new Error("showAllTask not implemented");
	},
	
	hideAllTasks: function(){
		throw new Error("hideAllTasks not implemented");
	},	
	
	taskCreateFailed: function(context){
		throw new Error("taskCreateFailed not implemented");
	},
	
	getFragId: function(taskId){
		throw new Error("getFragId not implemented");
	},
	
	createTaskArea: function(range, id){
		throw new Error("createTaskArea not implemented");
	},

	updateCommandState: function(taskBean){
		throw new Error("updateCommandState not implemented");
	},//for team menu
	
	updateNewTaskArea: function (context, taskBean){
		throw new Error("updateNewTaskArea not implemented");
	},
	
	updateTaskArea: function(id){
		throw new Error("updateTaskArea not implemented");
	},
	
	deleteTaskArea: function(taskId){
		throw new Error("deleteTaskArea not implemented");
	},
	
	enableTaskCmds: function(bEnable){
		throw new Error("enableTaskCmds not implemented");
	},
	
	applyCachedTasks: function(){
		throw new Error("applyCachedTasks not implemented");		
	},
	
	showTask: function(taskFrame){
		throw new Error("showTask not implememented");
	},
	
	hideTask: function(taskFrame){
		throw new Error("hideTask not implememented");
	},
	
	preTaskCreate: function(){
		throw new Error("preTaskCreate not implememented");
	},
	
	postSubmitTask: function(taskBean){
		throw new Error("postSubmitTask not implememented");
	},
	
	getSelectedTask: function(){
		throw new Error("getSelectedTask not implememented");
	},
	
	selectTask: function(taskId){
		throw new Error("selectTask not implememented");
	},
	
	getTaskFrame: function(taskId){
		throw new Error("getTaskFrame not implememented");
	},
	
	// =0, means task1 is the same as task2
	// >0, means task1 is after task2
	// <0, means task1 is before task2
	compare: function(task1, task2){
		throw new Error("compare not implemented");
	},
	
	publishInsertTaskMsg: function(taskId, object){
		throw new Error("publishInsertTaskMsg not implememented");
	},
	
	publishUpdateTaskMsg: function(taskId){
		throw new Error("publishUpdateTaskMsg not implememented");
	},
	
	publishDeleteTaskMsg: function(taskId){
		throw new Error("publishDeleteTaskMsg not implememented");
	},

	showInfomationMessage: function(id, title, content, interval) {
		throw new Error("showInfomationMessage not implememented");
	},
	
	hideInformationMessage: function(id) {
		throw new Error("hideInformationMessage not implememented");
	},
	
	showErrorMessage: function(id, title, content, interval) {
		throw new Error("showErrorMessage not implememented");
	},
	
	disableTaskArea: function(id, flag) {
		throw new Error("disableTaskArea not implememented");
	}
	
});
