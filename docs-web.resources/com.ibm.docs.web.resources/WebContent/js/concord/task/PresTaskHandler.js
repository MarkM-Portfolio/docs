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

dojo.provide("concord.task.PresTaskHandler");

dojo.require("concord.task.AbstractTaskHandler");
dojo.require("dojo.i18n");
dojo.require("concord.pres.PresTaskFrame");
dojo.require("concord.task.TaskUtil");
dojo.require("concord.util.HtmlTagParser");
dojo.requireLocalization("concord.task","PresTaskHandler");
dojo.declare("concord.task.PresTaskHandler", [concord.task.AbstractTaskHandler], {
	dummyRanges: null,
	presFrame: null,
	
	constructor: function(editor, docBean, slidesorter) {	
		this.presFrame = new concord.pres.PresTaskFrame(slidesorter);
		dojo.subscribe(concord.util.events.coeditingEvents, null, dojo.hitch(this,this.handleCoeditingEvent));
		dojo.subscribe(concord.util.events.taskEvents_eventName_undoOTFailedTaskHolder, null, dojo.hitch(this,this.undoOTFailedTaskHolder));					
		dojo.mixin(this.nls, dojo.i18n.getLocalization("concord.task","PresTaskHandler"));
	},
	
	preLoadTask: function(){
		//console.log("TODO preLoadTask");
	},
		
	loadTasks: function(){
		if(this.bSocial){
			this.inherited( arguments );
		}else{
			if (this.store == null)
				this.initStore();        	
			this.store.loaded == this.store.LOADED;        	
		}
	},	
	//override parent's assignTask method
	assignTask: function(action) {
		if (this.context){		
			if (this.presFrame.isOverlapWithExistTask()){
				pe.scene.showErrorMessage(this.nls.STR_TASK_OVERLAP_ERROR, 30000)
				this.cancelAssignment();
				return;
			}else{
				this.inherited(arguments);
			}
		}
	},
	
	removeEmptyDocidTasks : function(){
		var sections = this.store.getAllSections();
		if(!sections)return;
		
		for(var i in sections){
			var section = sections[i];
			var taskBean = section.bean;
			if(taskBean && !taskBean.getDocid()){
				var info = section.info;
				if(info == null || typeof info.slide == 'undefined' || info.slide == null ){
					this.deleteSection(taskBean.getId());
				}						 
			}
		}
	},
	
	isTaskExisted: function(taskId){
		if (!this.store){
			return false;
		}
		var section = this.store.getSection(taskId);		
		if(section){
			var info = section.info;
			if(info == null || typeof info.slide == 'undefined' || info.slide == null ){
				return false;
			}
			return true;
		}
		return false;		
	},
	
	addSection: function(taskBean, info){
		//console.log("addSection " + taskBean.getId());
		if (info && info.slide != null){
			if (this.dummyRanges){
				this.removeDummySection(info);
			}
		}
		this.store.addSection(taskBean, info);
	},	
			
	addDummySection: function(range){
		if (range){
			if (this.dummyRanges == null)
				this.dummyRanges = {};
			this.dummyRanges[range.uuid]=range;
		}
	},
	
	removeDummySection: function(range){
		if(range && this.dummyRanges){
			if(range instanceof Array){
				for(var i=0; i< range.length; i++){
					if (range[i].uuid in this.dummyRanges){
						delete this.dummyRanges[range[i].uuid];
					}					
				}	
			}else{			
				if (range.uuid in this.dummyRanges){
					delete this.dummyRanges[range.uuid];
				}				
			}
		}
		return range;
	},
		
	getCachedTaskObj: function(taskId){
		var node = this.getTaskFrame(taskId);
		var taskObj = {};
		if (node != null){			
			taskObj.title = node.getAttribute('c_title') == null ? "" : node.getAttribute('c_title');
			taskObj.content = node.getAttribute('c_content') == null ? "" : node.getAttribute('c_content');
			taskObj.author = node.getAttribute('c_author') == null ? "" : node.getAttribute('c_author');
			taskObj.owner =  node.getAttribute('c_owner') == null ? "" : node.getAttribute('c_owner');
			taskObj.state = node.getAttribute('c_state') == null ? "" : node.getAttribute('c_state');
			taskObj.assignee = node.getAttribute('c_assignee') ==  null ? "" : node.getAttribute('c_assignee');
			taskObj.reviewer = node.getAttribute('c_reviewer') ==  null ? "" :  node.getAttribute('c_reviewer');
			taskObj.activity = node.getAttribute('c_activity') == null ? "" : node.getAttribute('c_activity');
			taskObj.duedate = node.getAttribute('c_duedate') == null ? "" : node.getAttribute('c_duedate');
			taskObj.createDate = node.getAttribute('c_createDate') == null ? "" : node.getAttribute('c_createDate');
			//taskObj.fragid =  node.getAttribute('frag_id') == null ? "" : node.getAttribute('frag_id');		 			
		}
		return taskObj;
	},
	/*
	 * Set cached task into attributes of reference node in document 
	 */
	setCachedTaskObj: function(taskDiv, taskBean){
		if(!taskDiv || !taskBean) return; 
		taskDiv.setAttribute("c_title", taskBean.getTitle() == null ? "" : taskBean.getTitle());
		taskDiv.setAttribute("c_content", taskBean.getContent() == null ? "" : taskBean.getContent());
		taskDiv.setAttribute("c_author", taskBean.getAuthor() == null ? "" : taskBean.getAuthor());
		taskDiv.setAttribute("c_owner", taskBean.getOwner() == null ? "" : taskBean.getOwner());
		taskDiv.setAttribute("c_state", taskBean.getState() == null ? "" : taskBean.getState());						
		taskDiv.setAttribute("c_assignee", taskBean.getAssignee() == null ? "" : taskBean.getAssignee());	 
		taskDiv.setAttribute("c_reviewer", taskBean.getReviewer() == null ? "" : taskBean.getReviewer());	
		taskDiv.setAttribute("c_activity", taskBean.getActivity() == null ? "" : taskBean.getActivity());
		taskDiv.setAttribute("c_duedate", taskBean.getDuedate() == null ? this.getCachedTaskObj(taskBean.getId()).duedate
	                               : this.parseDateToTime(taskBean.getDuedate())); 			     
		taskDiv.setAttribute("c_createDate", taskBean.getCreateDate() == null ? this.getCachedTaskObj(taskBean.getId()).createDate
	                               : this.parseDateToTime(taskBean.getCreateDate())); 		
		//taskDiv.setAttribute("frag_id", taskBean.getFragid() == null ? "" : taskBean.getFragid()); 					 
	},	

	isOverlapWithExistTask :function(slideIds, ignoreDummy){
		//if the tasks haven't been created, user can't select overlap area.
		if (!ignoreDummy && this.dummyRanges) {
			var rangeIds = new Array();
			for (var id in this.dummyRanges){
				var range = this.dummyRanges[id] 
				var rangeId = range.slide.id	
			 	rangeIds.push(rangeId); 
			}
			return this.isValueDuplicated(slideIds, rangeIds);
		}
		return this.presFrame.isOverlapWithExistTask();
	},
	
	isValueDuplicated: function(arrayA, arrayB){
		if(arrayA instanceof Array && arrayB instanceof Array){
			var aLength = arrayA.length;
			var bLength = arrayB.length;
			for(var i=0; i<aLength; i++){
				for(var j=0; j< bLength; j++){
					if(arrayA[i] === arrayB[j]){
						return true;
					}
				}
			}
		}
		return false;
	},
	
	enableMultipleSelection: function(){		
		if(this.presFrame.isSelectedSlidesWithFullTasks()){
			var beans = this.getSelectedTask();
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
		}	 
		return false;
	},
	
	disableSlidesDelete: function(){
 		if(!this.presFrame.isSelectedSlidesWithoutTasks()){
 			if(this.presFrame.isSingleSelection())
 				pe.scene.showErrorMessage(this.nls.STR_SLIDE_DELETE_ERROR, 10000); 
 			else
 				pe.scene.showErrorMessage(this.nls.STR_SLIDE_DELETE_ERRORS, 10000);			
 			return true;
 		} 
 		return false;
	},	 
	//////////////////////////////////inherited functions//////////////////////
	
	initStore: function(){
		if (typeof this.editor.sections == 'undefined')
			this.editor.sections = {};
		this.store = new concord.task.TaskStoreProxy(this.editor.sections);
	},
	
	parseTasks: function(){
		console.log("parseTasks");			
		var document = this.editor.document.$;
		var selection = this.editor.getSelection();
		dojo.query(".taskContainer", document).forEach( dojo.hitch(this,function (node) {
			
			var id = node.getAttribute("task_id"); 
			var taskBean = this.getTaskBeanById(id);
			var slideId = this.presFrame.getSlideIdByTask(node);			
			if (taskBean == null || slideId == null) {
				// wait 5 second to make sure this is a single mode or co-edit mode
				setTimeout( dojo.hitch(this, function(taskId) {
								console.log("section " + taskId +" is removed"); 
								if (pe.scene.session.isSingleMode())
									this.removeTask(taskId);
							}, id), 5000); 
			}else{
				this.updateSection(taskBean, {slide: {"id" : slideId}, uuid: slideId});	
				if(this.bSocial){
					var docid = taskBean.getDocid();
					var taskDamaged  = (docid == 'undefined' || docid == null);                 
					var valid = this.checkTask(taskBean);
					if(valid){
						if(!taskDamaged){
							this.updateTaskArea(id);
							this.checkAccessError(taskBean, true);  
						}
					}else{
						taskBean.setbInvalid(true);     
						this.updateTaskArea(taskBean.getId());                  
						this.showErrorMessage(taskBean.getId(), null, this.nls.notValidAssignment);                     
					}											
				}else{
					this.updateTaskArea(taskBean.getId()); //just update title information
				}											 							
			}		
		}));		
		this.removeEmptyDocidTasks();
		setTimeout( dojo.hitch(this, function() {
			this.updateCommandState(this.getSelectedTask());		
		}), 500); 		
	},
	
	cancelAssignment : function(){ // callback for task assignment dialog
		this.removeDummySection(this.context);
		if (this.context)
			delete this.context;
		this.context = null;
	},
		
	changeMode : function(mode){ // callback for task assignment dialog
		//do nothing
	},
	
	showAllTasks: function(){
		var document = this.editor.document.$;
		dojo.query('.taskContainer', document).forEach(dojo.hitch(this, function(task){
			this.showTask(task);
		}));
	},
	
	hideAllTasks: function(){
		var document = this.editor.document.$;
		dojo.query('.taskContainer', document).forEach(dojo.hitch(this, function(task){
			this.hideTask(task);
		}));
	},
	
	taskCreateFailed: function(context, taskBean){
		this.removeDummySection(context);
		setTimeout(dojo.hitch(this, function(){
			if (typeof taskBean != undefined && taskBean != null){
				console.log("taskCreatedFailed, remove task " + taskBean.getId());
				concord.beans.TaskService.deleteTask(this.docBean, taskBean.getId());
			}
		}), 0);
	},
	
	getFragId: function(taskId){
		//do nothing
	},
	
	createTaskArea: function(range, id){
		throw new Error("createTaskArea not implemented");
	},
    	
	getContextMenuParams: function(){
		var slide = this.presFrame.getSingleSelectedSlide();
		var params = {}; 	
		if(slide){  
			params.isEnabled = true;
			params.isTasked = this.presFrame.isTaskedSlide(slide);  			  		
		}else{    		
			params.isEnabled = false;
		}
		return params;
	},
    
	updateCommandState: function(taskBeans){
		if (!this.bSocial) return;
		if(this.store.loaded != this.store.LOADED) return;
		
		var isGetSelectedTask = (taskBeans && taskBeans.length > 0) ? true : false;
		var canEnableCmds = this.isServiceReady() && this.bTMenusEnabled;
		var isCreateAssignment = canEnableCmds && (!isGetSelectedTask || this.presFrame.isSelectedSlidesWithoutTasks());
		var isEditAssignment =false;
		var isReopenAssignmen = false;
		var isReassignAssignment = false
		var isMarkAssignComplete = false;
		var isApproveSection = false;
		var isReturnSection = false;
		var isRemoveSectionAssign = false;
		var isAbout = false;
		var isSingleSelection = this.presFrame.isSingleSelection();
        
		var isMultiEnabled = this.enableMultipleSelection();
		if(canEnableCmds && isGetSelectedTask && isMultiEnabled){
			
			var actions = concord.beans.TaskService.util.getAvailableActions(taskBeans[0], pe.authenticatedUser);
			var actionsLength = actions.length;
			if(actionsLength >0)
			{
				for(var i=0;i<actionsLength;i++){
        			
					switch(actions[i])
					{
						case concord.beans.TaskService.ACTION_EDIT:
							isEditAssignment = true;
							break;
						case concord.beans.TaskService.ACTION_REOPEN:
							isReopenAssignmen = true;
							break;
						case concord.beans.TaskService.ACTION_REASSIGN:
							isReassignAssignment = true;
							break;
						case concord.beans.TaskService.ACTION_WORKDONE:
							isMarkAssignComplete = true;
							break;
						case concord.beans.TaskService.ACTION_PRIVATE:
							isWorkPrivate = true;
							break;
						case concord.beans.TaskService.ACTION_CANCEL_PRIVATE:
							isCancelPrivate = true;
							break;
						case concord.beans.TaskService.ACTION_APPROVE:
							isApproveSection = true;
							break;
						case concord.beans.TaskService.ACTION_REJECT:
							isReturnSection = true;
							break;
						case concord.beans.TaskService.ACTION_REMOVE:
							isRemoveSectionAssign = true;
							break;
						case concord.beans.TaskService.ACTION_ABOUT:
							isAbout = true;
							break;
						default:
							break;
					}
				}
			} 
		}
		if(taskBeans && taskBeans.length > 1){
			isEditAssignment = false;
			isRemoveSectionAssign = false;
			isAbout = false;
		}
		var data = {};
		data.isCreateAssignment = isCreateAssignment;
		data.isEditAssignment = isEditAssignment;
		data.isReopenAssignmen = isReopenAssignmen;
		data.isReassignAssignment = isReassignAssignment;
		data.isMarkAssignComplete = isMarkAssignComplete;
		data.isApproveSection = isApproveSection; 
		data.isReturnSection = isReturnSection;
		data.isRemoveSectionAssign = isRemoveSectionAssign;
		data.isAbout = isAbout;
		data.isSingleSelection = isSingleSelection;

		dojo.publish(concord.util.events.taskEvents_eventName_taskSelected, [data]);
		dojo.publish(concord.util.events.taskEvents_eventName_taskCreateEnabled, [isCreateAssignment]);
		this.editor.getCommand("presCreateAssignment").setState(!isCreateAssignment ? CKEDITOR.TRISTATE_DISABLED : CKEDITOR.TRISTATE_OFF);
		//update context menu
		this.presFrame.updateContextTaskMenu();
	},//for team menu
	
	updateNewTaskArea: function (context, taskBean){
		var slideRange = context.slide;
		var slideId = slideRange.id;		
		var isOverlap = this.presFrame.isSlideTasked();
		if(isOverlap){
			throw this.nls.STR_TASK_OVERLAP_ERROR;
		}	
		var titleInfo = this.getTitleInfo(taskBean);
		var mode = titleInfo.mode;	
		this.presFrame.createSlideTask(mode, slideId, taskBean);
	
		return {slide: {"id" : slideId}, uuid: slideId};	
	},
	  	
	updateTaskArea: function(taskId){
		if(!taskId) return;
		
		var section = this.store.getSection(taskId); 
		if(!section) return;
		
		var taskBean = section.bean; 
		var slideId = section.info.slide.id;	//slide value is id 
		if(!taskBean || !slideId)	return; // bean or slide in section is null, return
		
		var taskContainer = this.presFrame.getTaskContainer(slideId); 
		if (!taskContainer){
			 this.deleteSection(taskId);	
			 return;// taskContainer is null, return
		}
		
		var taskBean = taskBean || this.store.getTaskBean(taskId);

		var titleInfo = this.getTitleInfo(taskBean);
		//if cached, apply write complete mode to show the task
		var cached = taskBean.isCached();
		var invalid =  taskBean.getbInvalid();
		var mode = (cached || invalid) ? this.CACHED_MODE : titleInfo.mode;
		var title = titleInfo.title;				
		console.log("Set task title in updateTaskArea:" + title);
		//var actions = concord.beans.TaskService.util.getAvailableActions(taskBean, pe.authenticatedUser);
		this.presFrame.updateSlideTask(taskContainer, taskBean, null, mode, cached);

		this.setCachedTaskObj(taskContainer, taskBean);
						 		
		if (this.bShow)
			this.showTask(taskContainer);
		else
			this.hideTask(taskContainer);
		
		return taskContainer;
	},
	
	deleteTaskArea: function(taskId, noSelect){
		var section = this.store.getSection(taskId);
		if(section){
			var range = section.info.slide;
			if(range){
				var slideId = range.id;
				var slide = this.presFrame.getSlideById(slideId);
				var msgPairList = this.presFrame.removeSlideTask(slide,taskId, null, noSelect); 
				if(msgPairList.length >0){
					var addToUndo = false;
					msgPairList[0] = SYNCMSG.addUndoFlag(msgPairList[0],addToUndo);
					SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
				}
				this.presFrame.deleteConnectsByTaskId(taskId);								
			}
		}
	},

	enableTaskCmds: function(bEnable){
//		var selectedTasks = null;
		this.bTMenusEnabled = bEnable; 
//		if(bEnable && this.bServiceReady){	
//			// if service is not ready, no need to get selected task
//			selectedTasks = this.getSelectedTask();
//		}
//		this.updateCommandState(selectedTasks); 
	},
	
	applyCachedTasks: function(){
		throw new Error("applyCachedTasks not implemented");		
	},
	
	showTask: function(taskFrame){
		if(this.bShow && taskFrame){
			taskFrame.style.display = "block";
			taskFrame.style.visibility = "visible";
		}
	},
	
	hideTask: function(taskFrame){
		if(taskFrame){
			taskFrame.style.display = "none";
			taskFrame.style.visibility = "hidden";
		}
	},
	
	preTaskCreate: function(){
		
		var ids = this.presFrame.getSelectedSlideIds();		
		var isOverlap = this.isOverlapWithExistTask(ids);
		if(isOverlap){
			pe.scene.showErrorMessage(this.nls.STR_TASK_OVERLAP_ERROR, 30000);
			return;
		}
		//In presentation, it's an array of context
		var contexts = new Array();
		for(var i=0; i< ids.length; i++){		
			var context = {};
			context.title = "";
			context.slide = {"id" : ids[i]};
			context.uuid = ids[i];
			//Add to dummy section
			this.addDummySection(context);
			contexts.push(context);			
		}			
		return contexts;	
	},
	
	postSubmitTask: function(taskBean){
		//do nothing
	},
	
	getSelectedTask: function(){
		//This may return many selected task
		var ids = this.presFrame.getSelectedSlideTaskIds();
		if(!ids) return null;
		
		var taskBeans = new Array();
		for(var taskId in ids){
			var bean = this.getTaskBeanById(ids[taskId])
			if(bean) taskBeans.push(bean);
		}
		return taskBeans;
	},
	
	selectTask: function(taskId){
		throw new Error("selectTask not implememented");
	},
	
	getTaskFrame: function(taskId){
		var document = this.editor.document.$;
		dojo.query("[task_id='"+taskId+"']", document).forEach( dojo.hitch(this,function (node) {
			 return node;			
		}));		
		return null;
	},
	
	// =0, means task1 is the same as task2
	// >0, means task1 is after task2
	// <0, means task1 is before task2
	compare: function(task1, task2){
		throw new Error("compare not implemented");
	},
	
	handleCoeditingEvent:function(data){
		if(data.eventName == concord.util.events.coeditingEvents_eventName_doAssignmentByOtherUser){
			if(data && data.msg && data.msg.slideId && data.msg.taskId && data.msg.type){
				var taskId = data.msg.taskId;
				var slideId = data.msg.slideId;
				var info = {slide: {"id" : slideId}, uuid: slideId};				
				if(data.msg.type == concord.task.TaskUtil.insertType){				
					var taskBean = concord.beans.TaskService.getTask(this.docBean, taskId);
					console.log("insertTaskById for taskId " + taskId);	
					if ( taskBean != null ){
						try{
							this.addSection(taskBean, info);
							this.updateTaskArea(taskId);							
							if (taskBean.getAssignee()){
								this.refreshEditorIfNeeded(taskBean.getAssignee());
							}
							if (taskBean.getReviewer()){
								this.refreshEditorIfNeeded(taskBean.getReviewer());
							}
						}catch(e){
							console.log("Error in insertTaskById: " + e);
						}
					} else {
						console.log("Error: cannot get taskbean from server.");
					}					
									
				}else if(data.msg.type == concord.task.TaskUtil.updateType){
					console.log("updateTaskById for taskId " + taskId);
					var taskBean = concord.beans.TaskService.getTask(this.docBean, taskId);
					if ( taskBean != null ){
						this.updateSection(taskBean, info);
				 		this.updateTaskArea(taskId);
						if (taskBean.getAssignee()){
							this.refreshEditorIfNeeded(taskBean.getAssignee());
						}
						if (taskBean.getReviewer()){
							this.refreshEditorIfNeeded(taskBean.getReviewer());
						}
					} else {
						console.log("Error: cannot get taskbean from server.");
					}					
				}else if(data.msg.type == concord.task.TaskUtil.deleteType){
					console.log("deleteTaskById for taskId " + taskId);
					this.deleteTaskArea(taskId, true);
					this.deleteSection(taskId);					
				}
				this.updateCommandState(this.getSelectedTask());			
			}
		}    	
	}, 
    	
	publishInsertTaskMsg: function(taskId, context){
		var slideId = context.slide.id;
		this.presFrame.sendMsgForAssignment(slideId, taskId, concord.task.TaskUtil.insertType);
	},
	
	publishUpdateTaskMsg: function(taskId){
		var section = this.store.getSection(taskId); 
		if(!section) return; 
		var slideId = section.info.slide.id;		
		this.presFrame.sendMsgForAssignment(slideId, taskId, concord.task.TaskUtil.updateType);
	},
	
	publishDeleteTaskMsg: function(taskId){
		var section = this.store.getSection(taskId); 
		if(!section) return; 
		var slideId = section.info.slide.id;		
		this.presFrame.sendMsgForAssignment(slideId, taskId, concord.task.TaskUtil.deleteType);
	},
	
    undoOTFailedTaskHolder: function(data){    	
    	var parentId = data.parentId;
    	var placeHolder = data.s;
    	var taskId = null;
        var parser = new concord.util.HtmlTagParser(placeHolder);
        try {
    		var tag = null;
    		while ((tag = parser.next()) != null)
    		{
    			var tagName = tag.getTagName();
    			if ("div" == (tagName ? tagName.toLowerCase():'')){
    				var attrs = tag.getAttributes();
    				for (var j = 0; j < attrs.length; j++)
    				{
    					var attr = attrs[j];
    					if(attr.name == "task_id"){
    						taskId = attr.value;
    						break;
    					}
    				}
    			}
    		}
    	}
    	catch (e)
    	{
    		console.log("exception when parsing html", e);
    		return;
    	}    	
    	var wrapper = this.presFrame.getSlideById(parentId);
    	if(wrapper){
    		var containers = dojo.query(".taskContainer",wrapper);
    		for(var i =0; i< containers.length; i++){
    			var id = containers[i].getAttribute("task_id");
    			if(id && taskId && id != taskId){              				
    				this.presFrame.deleteConnectsByTaskId(id);
    				dojo.destroy(containers[i]);                   	
    				this.deleteSection(id);	 				
    				setTimeout(dojo.hitch(this, function(){
    					console.log("remove conflict task, remove task " + id);
    					concord.beans.TaskService.deleteTask(this.docBean, id);   					
    				}), 0);    				                  	
    			}    			
    		}
        }
    },
	showInfomationMessage: function(id, title, content, interval) {
		//throw new Error("showInfomationMessage not implememented");
	},
	
	hideInformationMessage: function(id) {
		//throw new Error("hideInformationMessage not implememented");
	},
	
	showErrorMessage: function(id, title, content, interval) {
		//throw new Error("showErrorMessage not implememented");
	},
	
	disableTaskArea: function(id, flag) {
		//do nothing
	}	
});