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

dojo.provide("websheet.collaboration.TaskHandler");

dojo["require"]("dijit.Dialog");
dojo.require("websheet.collaboration.TaskFrame");
dojo["require"]("dojo.i18n");
dojo["require"]("dojo.string");
dojo["require"]("concord.beans.EditorStore");
dojo["require"]("concord.beans.EditorItem");
dojo["require"]("concord.task.AbstractTaskHandler");
dojo["require"]("concord.beans.TaskService");
dojo.require("concord.task.CachedTask");
dojo.requireLocalization("websheet.collaboration","TaskHandler");
dojo.declare("websheet.collaboration.TaskHandler", [websheet.listener.Listener, concord.task.AbstractTaskHandler], {

	editor : null,
	_doc: null,
	//Task Show Mode
	SHOW_ALL : "all",	//show all the task
	SHOW_ASSIGNEE : "assignee",	//only show the task that is assigned to me
	SHOW_ASSIGNER : "assigner",	//only show the task that i have assigned.
	//TODO: extract all the string constant for dialog.
	TASK_CREATE_TITLE: null,	    
	TASK_ASSIGN_BTN : null,
	//error message
	STR_DELETE_NOT_ALLOWED : null,
	STR_TASK_OVERLAP_ERROR: null,
	STR_TASK_CREATE_ERROR : null,
	STR_TASK_DELETE_ERROR : null,
	STR_SHEET_NOT_EXIST : null,
	STR_TASK_DELETE_NOSELECTION : null,
	STR_TASK_NO_SELECTIOIN : null,
	STR_TASK_NOT_FRAGDOC : null,
	STR_CREATE_FRAGMENT_ERROR : null,
	//Show/Hide Assignments menu item status
	SHOW_STATUS : true,
	assignTaskDlg : null,
	dummyTaskFrames: null,
	dummyRanges: null,
	focusTask: null,
	_maxIndex:	0,	//for range id
	taskList: {},
	
	constructor: function ()
	{
		dojo.mixin(this.nls, dojo.i18n.getLocalization("websheet.collaboration","TaskHandler"));
		this.TASK_CREATE_TITLE= this.nls.TASK_CREATE_TITLE;	    
		this.TASK_ASSIGN_BTN = this.nls.TASK_ASSIGN_BTN;
		this.STR_DELETE_NOT_ALLOWED = this.nls.STR_DELETE_NOT_ALLOWED;
		this.STR_TASK_OVERLAP_ERROR= this.nls.STR_TASK_OVERLAP_ERROR;
		this.STR_TASK_CREATE_ERROR = this.nls.STR_TASK_CREATE_ERROR;
		this.STR_TASK_DELETE_ERROR = this.nls.STR_TASK_DELETE_ERROR;
		this.STR_SHEET_NOT_EXIST = this.nls.STR_SHEET_NOT_EXIST;
		this.STR_TASK_DELETE_NOSELECTION = this.nls.STR_TASK_DELETE_NOSELECTION;
		this.STR_TASK_NO_SELECTIOIN = this.nls.STR_TASK_NO_SELECTIOIN;
		this.STR_TASK_NOT_FRAGDOC = this.nls.STR_TASK_NOT_FRAGDOC;
		this.STR_CREATE_FRAGMENT_ERROR = this.nls.STR_CREATE_FRAGMENT_ERROR;
		this.bStrict = false;
		this._doc = this.editor.getDocumentObj();
	},
	
	preTaskCreate: function(){

		var controller = this.editor.getController();
		var grid = this.editor.getCurrentGrid();
		var selectRect = grid.selection.selector();
		var rangeAddress = selectRect.getSelectedRangeAddress();
		var selectRangeInfo = selectRect.getRangeInfo();
		//TODO: check if the selected range is overlap with other unnamed range or only task range
		var isOverlap = this.IsOverlapWithExistTask(selectRangeInfo);
		if(isOverlap){
			this.editor.scene.showErrorMessage(this.STR_TASK_OVERLAP_ERROR, 30000);
			return;
		}
		if(!rangeAddress){
			var rowIndex = store.inRowIndex ;
			//rangeAddress = grid.getSheetName() + "." + store.inCell.field + (rowIndex + 1) ;
			rangeAddress = websheet.Helper.getCellAddr(grid.getSheetName(), (store.inRowIndex + 1), websheet.Helper.getColNum(store.inCell.field));
		}
		if(rangeAddress){
			var id = this.generateId();
			controller.insertRange(id, rangeAddress, {usage: websheet.Constant.RangeUsage.TASK, data: {}});
			var area = this._doc.getAreaManager().getRangeByUsage(id, websheet.Constant.RangeUsage.TASK);
			if (area) this.addDummySection(area);
			return area;
		}else{
			this.editor.scene.showTextMessage( this.STR_TASK_NO_SELECTIOIN, 30000);
			return null;
		}
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
    
	showInfomationMessage: function(rangeId, title, content, interval) {
        this.hideErrorMessage(rangeId);
        
		var existedTaskFrame = this.getTaskFrame(rangeId);
		if (existedTaskFrame) {
			existedTaskFrame.updateTitleContent(title);
			//set border style
			existedTaskFrame.setBorderStyle(this.DISABLE_MODE);
		} else {
			var taskFrame = this.constructAssignTaskFrame(rangeId);
			if(taskFrame)
				taskFrame.updateTitleContent(title);
		}

	},
	
	constructAssignTaskFrame: function (rangeId) {
		var range = this.getRange(rangeId);
		var taskFrame = this.getOrCreateTaskFrame(range);
		if (this.dummyTaskFrames == null) {
			this.dummyTaskFrames = {};
		}
		this.dummyTaskFrames[rangeId] = taskFrame;
		return taskFrame;	
	},
	
	disableTaskArea: function (taskId, flag) {
		var taskFrame = this.getTaskFrame(taskId); 
		var actionBtn = taskFrame.getDropDownButton();
		if(actionBtn)
			actionBtn.setDisabled(flag);
		var taskBean = this.getTaskBeanById(taskId);
		if (taskBean)
			taskBean.setbDisable(flag);
		var selectedTask = this.getSelectedTask();
		if (selectedTask && (selectedTask.getId() == taskId))
			this.updateCommandState(taskBean);
		return actionBtn;
	},		

	showErrorMessage: function(rangeId, title, content, interval, isTruncated) {
		var range = this.getRange(rangeId);
		if(range){
			var existedTaskFrame = this.getTaskFrame(rangeId);
			if (existedTaskFrame) {
				existedTaskFrame.updateTitleContent(content, isTruncated);
				existedTaskFrame.updateTitleCss('concordTaskErrorTitle', true);
				if (interval) {
					window.setTimeout(
						dojo.hitch(this, function(){
							this.hideErrorMessage(rangeId);
						}),
						interval
					);	
				} 
			}	
		} else {
			//assigntask
			var taskFrame = this.constructAssignTaskFrame(rangeId);
			if(taskFrame){
				taskFrame.updateTitleContent(title);
				taskFrame.updateTitleCss('concordTaskErrorTitle', true);
				window.setTimeout(
					dojo.hitch(this, function(){
						this.deleteTaskFrame(taskFrame);
						this.removeDummyTaskFrames(rangeId);
					}),
					5000
				);					
			}else{
				this.removeDummyTaskFrames(rangeId);						 					 				
			}
		}			

	},		
	
	removeDummyTaskFrames: function (rangeId) {
		if (rangeId != null) {
				if (rangeId in this.dummyTaskFrames) {
					var taskFrame = this.dummyTaskFrames[rangeId];
					if (taskFrame != null) {
						this.deleteTaskFrame(taskFrame);
						delete this.dummyTaskFrames[rangeId];	
						return;				
					}
				}			
		}
	},	

	hideInformationMessage: function (rangeId) {
		var taskBean = this.getTaskBeanById(rangeId);
		if (taskBean == null) {
			this.removeDummyTaskFrames(rangeId);
		} else {
			var taskFrame = this.getTaskFrame(rangeId);
			if (taskFrame != null) {
				var titleInfo = this.getTitleInfo(taskBean);
				var mode = titleInfo.mode;
				//update border style
				taskFrame.setBorderStyle(mode);
				
				//update title content;
				var titleContent = titleInfo.title;
				taskFrame.updateTitleContent(titleContent, true);		
			}
		}
	},		
	
	hideErrorMessage: function(rangeId) {
		var taskBean = this.getTaskBeanById(rangeId);
		if(taskBean == null) return;
		var taskFrame = this.getTaskFrame(rangeId);
		if(taskFrame != null){
			var titleInfo = this.getTitleInfo(taskBean);
			var title = titleInfo.title;			
			taskFrame.updateTitleContent(title, true);
			taskFrame.updateTitleCss('concordTaskErrorTitle', false);			
		}
	},
	
	assignTask: function(action) {
		if (this.context){
			var range = this.context;
			var rangeId = range.getId();
			if(!range.isValid()){
				this.editor.scene.showWarningMessage(this.nls.STR_TASK_RANGE_INVALID, 10000);
				this.cancelAssignment();
				return;
			}else if (this.IsOverlapWithExistTask(range._getRangeInfo(), rangeId)){
				this.editor.scene.showErrorMessage(this.STR_TASK_OVERLAP_ERROR, 30000);
				this.cancelAssignment();
				return;
			}
			else{
				this.inherited(arguments);
			}
		}
	},
	
	showAllTasks:function(bShow){
		var taskList = this.store.getAllSections();
		for(var taskId in taskList){
			var section = taskList[taskId];
			if(section){
				var taskFrame = section.info.area;
				if(taskFrame){
					this.showTask(taskFrame);
				}
			}
		}
	},
	
	hideAllTasks: function(){
		var taskList = this.store.getAllSections();
		for(var taskId in taskList){
			var section = taskList[taskId];
			if(section){
				var taskFrame = section.info.area;
				if(taskFrame){
					this.hideTask(taskFrame);
				}
			}
		}		
	},
	
	// handler to assign a task
	updateNewTaskArea: function(range, taskBean){
		if (this.IsOverlapWithExistTask(range._getRangeInfo(), range.getId(), true)){// check if the range is overlapped with other task range
			throw this.nls.STR_TASK_OVERLAP_ERROR;
		}	
		var taskFrame = this.getOrCreateTaskFrame(range);
		if (taskFrame != null) {
			taskFrame.hideRangeArea();
		}
		this.updateTaskArea(null, range, taskFrame, taskBean);
       	
		return {area: taskFrame, range: range};
	},
	
	taskCreateFailed : function(range, taskBean){
		this.removeDummySection(range);
		setTimeout(dojo.hitch(this, function(){
			if (typeof taskBean != undefined && taskBean != null){
				console.log("taskCreatedFailed, remove task " + taskBean.getId());
				concord.beans.TaskService.deleteTask(this.docBean, taskBean.getId());
			}
		}), 0);
	},
	
	postTaskCreate: function(taskBean, context, info){
		this.inherited(arguments);
		if (!info || !info.range || !info.area )
			return;
		// check if this task is intersected with focus cell
		if (this.isFocusInRange(info.range)){
			this.setTaskSelected(taskBean.getId());
		}
	},
	
	isFocusInRange: function(range){
		var grid = this.editor.getCurrentGrid();
		var selectRect = grid.selection.selector();
		//only need the start cell position
		var focusCellInfo = selectRect.getRangeInfo();
		focusCellInfo.endRow = focusCellInfo.startRow;
		focusCellInfo.endCol = focusCellInfo.startCol;
		var value = websheet.Helper.compareRange(range._getRangeInfo(), focusCellInfo);
		if(value > websheet.Constant.RangeRelation.INTERSECTION){
			return true;
		}
		return false;
	},
	
	//update team menu item state
	updateCommandState : function(taskBean){
		if (!this.bSocial) return;
		
		var isGetSelectedTask = taskBean? true : false;
		var canEnableCmds = this.isServiceReady() && this.bTMenusEnabled;
		var isCreateAssignment = canEnableCmds && !isGetSelectedTask;
        var isEditAssignment =false;
	    var isReopenAssignmen = false;
	    var isReassignAssignment = false;
        var isMarkAssignComplete = false;
        var isApproveSection = false;
        var isReturnSection = false;
        var isRemoveSectionAssign = false;
        var isAbout = false;
      
        if(canEnableCmds && isGetSelectedTask)
        {
        	var actions = concord.beans.TaskService.util.getAvailableActions(taskBean, pe.authenticatedUser);
        	var actionsLength = actions.length;
        	if(actionsLength>0)
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
        if(pe.assignCellsMenuItem)
        	pe.menuItemDisabled(pe.assignCellsMenuItem,!isCreateAssignment);
        var toolbar = this.editor.getToolbar();
        if (toolbar) toolbar.disableToolbarById("S_t_CreateAssignment", !isCreateAssignment);
        dojo.publish(concord.util.events.taskEvents_eventName_taskCreateEnabled, [isCreateAssignment]);
        if(pe.removeCompletedAssignmentMenuItem)
        	pe.menuItemDisabled(pe.removeCompletedAssignmentMenuItem,!canEnableCmds);        	
        if(pe.editAssignmentMenuItem)
        	pe.menuItemDisabled(pe.editAssignmentMenuItem,!isEditAssignment);
        if(pe.reopenAssignmentMenuItem)
        	pe.menuItemDisabled(pe.reopenAssignmentMenuItem,!isReopenAssignmen);
        if(pe.reassignAssignmentMenuItem)
        	pe.menuItemDisabled(pe.reassignAssignmentMenuItem,!isReassignAssignment);
        if(pe.markAssignmentCompleteMenuItem)
        	pe.menuItemDisabled(pe.markAssignmentCompleteMenuItem,!isMarkAssignComplete );
        if(pe.approveAssignmentMenuItem)
        	pe.menuItemDisabled(pe.approveAssignmentMenuItem,!isApproveSection );
        if(pe.returnAssignmentMenuItem)
        	pe.menuItemDisabled(pe.returnAssignmentMenuItem,!isReturnSection );
        if(pe.removeCellAssignmentMenuItem)
        	pe.menuItemDisabled(pe.removeCellAssignmentMenuItem,!isRemoveSectionAssign );
        if(pe.aboutAssignmentMenuItem)
        	pe.menuItemDisabled(pe.aboutAssignmentMenuItem,!isAbout );
	},
	
	//create the border frame of the selected task range
	//The returned frame has the default style (black border)
	//note: only create frame at the current grid
	//because other invisible grid can not get the valid cell position
	getOrCreateTaskFrame: function(range){
		if(!range) {
			console.log("The range is not found in documentModel");			
			return null;
		}
		
		if(!range.isValid()){
			
			throw this.nls.STR_TASK_RANGE_INVALID;
		}
//		else if (this.IsOverlapWithExistTask(range._getRangeInfo(), range.getId())){// check if the range is overlapped with other task range
//			throw this.nls.STR_TASK_OVERLAP_ERROR;
//		}
		
		try{
			var controller = this.editor.getController();
			var sheetModel = this._doc.getSheet(range.getSheetName());
			if(sheetModel){	
				var grid = controller.getGrid(sheetModel.getSheetName());
				var selectRect = grid.selection.selector();
				var result = range._getRangeInfo() ;
				var expandRange = websheet.Utils.getExpandRangeInfo(result);
				var currentGrid = this.editor.getCurrentGrid();
				
				var taskFrame = new websheet.collaboration.TaskFrame({grid: grid, borderWidth:"3px"});
				taskFrame.select(expandRange);
				return taskFrame;								
			}else{
				console.log("Sheet Model is undefined");
			}
			
		}catch(e){
			//if e == #REF!, means that the sheet has been deleted
			if( e == websheet.Constant.INVALID_REF ){
				//this.editor.scene.showErrorMessage(this.STR_SHEET_NOT_EXIST, 30000);
				throw this.STR_SHEET_NOT_EXIST;
			}
		}
		return null;
	},
	
	/*
	 * generate range id
	 */
	generateId: function()
	{
		return websheet.Constant.IDPrefix.RANGE + "-task-" + this._maxIndex++;
	},

	enableSubmitCmd: function(bEnable){
//		console.log("enableSubmitCmd");
//		if (!bEnable)
//			this.editor.getToolbar().disableSubmitToolBar();
//		this.editor.getToolbar().disableToolbarById("S_t_Submit", !bEnable);
		var submitBtn = dijit.byId("SubmitTaskInHeader");
		submitBtn.setDisabled(!bEnable);
	},
	
	enableTaskCmds: function(bEnable){
 		 var selectedTask = null;
    	 this.bTMenusEnabled = bEnable; 
    	 if(bEnable && this.bServiceReady){	
    	 	// if service is not ready, no need to get selected task
    	    selectedTask = this.getSelectedTask();
    	 }
    	 this.updateCommandState(selectedTask); 	
	},
	
	postSubmitTask: function(taskBean){
		//console.log('postSubmitTask');	
		this._doc.masterDoc = null;
		this._doc.fragSectionId = null;
		var refValue = this.docBean.getRepository() + '/' + this.docBean.getUri();
		var attrs = { "status": "done" };
		var event = new websheet.event.SetFragment(refValue, attrs);
		this.editor.sendMessage(event);
		
	},
	
	getTaskIdByFragId:function(fragId){
		var sections = this.store.getAllSections();
		for(var taskId in sections){
			var section = sections[taskId];
			if(section){
				var range = section.info.range;
				if(range && range.fragDocId){
					if(range.fragDocId == fragId)
						return taskId;
				}
			}
		}
		return null;
	},
	
	//delete the task frame 
	deleteTaskFrame : function(taskFrame, isTooltip){
		if(taskFrame){
			taskFrame.destroy();
			delete taskFrame;
			taskFrame = null;
		}
	},
	
	
	//hide the border frame with taskId
	hideTaskFrame : function(taskId){
		
	},
	
	updateTaskArea : function( taskId, range, taskFrame, taskBean){
		//SHOW_ALL, SHOW_TASK_UNDONE is default
		var bShow = true;
		var section = null; 
		var fragId = null;
		if (taskId != null){
			if (dojo.isObject(taskId)){
				fragId = taskId.fragId;
				taskId = taskId.taskId;
			}	
			section = this.store.getSection(taskId);
		}
		else {
			section ={bean: taskBean, info : {area: taskFrame, range: range}};
		}
					
		var taskBean = section.bean; 
		taskId = taskBean.getId();
		
		
		var range = section.info.range;
		var taskFrame = section.info.area;
		var assignee = taskBean.getAssignee();
		var titleInfo = this.getTitleInfo(taskBean);
		//if cached, apply write complete mode to show the task
		var cached = taskBean.isCached();
		var invalid =  taskBean.getbInvalid();
		var mode = (cached || invalid) ? this.CACHED_MODE : titleInfo.mode;
		var title = titleInfo.title;
		
		var state = taskBean.getState();
		
		this.setCachedTaskObj(range, taskBean);
		if(taskFrame ){
		//set id as node id
			if(taskId != null){
				
			}
			if(mode!=null){
				taskFrame.setBorderStyle(mode);
			}
			//add title for taskFrame if it has
			if(title != null){
				var actions = concord.beans.TaskService.util.getAvailableActions(taskBean, pe.authenticatedUser);
				taskFrame.addTitle(title, mode, actions, taskId, cached);

			}
			if (this.bShow)
				this.showTask(taskFrame);
			else
				this.hideTask(taskFrame);
			
		}
		return taskFrame;
	},
	
	deleteTaskArea: function(taskId){
		var section = this.store.getSection(taskId);
		if(section){
			var taskFrame = section.info.area;
			var range = section.info.range;
			this.deleteTaskFrame(taskFrame);
			if (taskId == this.focusTask)
				this.setTaskSelected(null);
		}
	},
	
	//called when apply the insert range message
	insertTaskById :function(taskId){
		var range = this.getRange(taskId);
		if (range == null){
			console.log("[insertTaskById] range cannot be found");
			return;
		}
		var taskBean = concord.beans.TaskService.getTask(this.docBean, taskId);
		console.log("insertTaskById for taskId " + taskId);
		if ( taskBean != null ){
			try{
				var info = this.updateNewTaskArea(range, taskBean);
				this.addSection(taskBean, info);
				if (this.isFocusInRange(info.range)){
					this.setTaskSelected(taskBean.getId());
				}
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
			console.log("Error: cannot get taskbean from activity server.");
		}
		
	},
	
	//called when apply the set range message
	updateTaskById: function(taskId, data){
		if (this.getTaskFrame(taskId) == null)
			this.insertTaskById(taskId);
		else{
			console.log("updateTaskById for taskId " + taskId);
			var taskBean = concord.beans.TaskService.getTask(this.docBean, taskId);
			if ( taskBean != null ){
				this.updateSection(taskBean, null, data);
				var ids = {};
				ids.taskId = taskId;
				ids.fragId = data.fragid;
				this.hideErrorMessage(taskId);
				this.updateTaskArea(ids, null, null,taskBean);
				if (this.focusTask == taskId){
					this.updateCommandState(taskBean);
				}
				if (taskBean.getAssignee()){
					this.refreshEditorIfNeeded(taskBean.getAssignee());
				}
				if (taskBean.getReviewer()){
					this.refreshEditorIfNeeded(taskBean.getReviewer());
				}
			} else {
				console.log("Error: cannot get taskbean from activity server.");
			}
		}
	},
	
	//called when apply the delete range message
	deleteTaskById :function(taskId){
		console.log("updateTaskById for taskId " + taskId);
		this.deleteTaskArea(taskId);
		this.deleteSection(taskId);
		if (this.focusTask == taskId){
			this.setTaskSelected(null);
		}
		
	},
	
	getFragId: function(taskId){
		var range = this.getRange(taskId);
		if (range!=null){
			return range.fragDocId;
		}
		else
			return null;
	},
	
	addDummySection: function(range){
		if (range){
			if (this.dummyRanges == null)
				this.dummyRanges = {};
			this.dummyRanges[range.getId()]=range;
		}
	},
	
	removeDummySection: function(range){
		if (range && this.dummyRanges){
			if (range.getId() in this.dummyRanges){
				var controller = this.editor.getController();
				controller.deleteRange(range.getId(), websheet.Constant.RangeUsage.TASK);
				delete this.dummyRanges[range.getId()];
			}
		}
		return range;
	},
	
	deleteSection: function (taskId){
		var range = this.getRange(taskId);
		if (range != null){
			var controller = this.editor.getController();
			controller.deleteRange(range.getId(), websheet.Constant.RangeUsage.TASK);
		}
		this.store.deleteSection(taskId);
	},	
	
	addSection: function(taskBean, info){
		//console.log("addSection " + taskBean.getId());
		if (info && info.range != null){
			var range = info.range;
			if (this.dummyRanges){
				// delete dummy Section
				this.removeDummySection(range);
			}
			var areaMgr = this._doc.getAreaManager();
			var controller = this.editor.getController();
			range.setId(taskBean.getId());
			if (areaMgr.getRangeByUsage(range.getId(), websheet.Constant.RangeUsage.TASK)==null)
				controller.insertRange(range.getId(), range.getParsedRef().getAddress(), {usage:websheet.Constant.RangeUsage.TASK, data: range.data});
		}
		this.store.addSection(taskBean, info);
	},
	
	updateSection: function(taskBean, info){
		this.store.updateSection(taskBean, info);
	},
	
	rollbackAddedTask : function(taskId){
		console.log('rollbackAddedTask: ' + taskId);
		concord.beans.TaskService.deleteTask(this.docBean, taskId);
		this.deleteTaskById(taskId);
	},
	
	//send the insert unnamed range msg
	publishInsertTaskMsg : function(taskId ){
		console.log("publishInsertTaskMsg for " + taskId);
		var range = this.getRange(taskId);
        var refValue = range.getParsedRef().getAddress();
        var attrs = {};
        //attrs.fragid = range.fragDocId;
        attrs.usage = websheet.Constant.RangeUsage.TASK;
        attrs.rangeid = taskId; 
        
        var data = {}; 
        var cachedTask = range.data; // cachedTask;
        data.c_title = cachedTask.c_title;
        data.c_content = cachedTask.c_content;
        data.c_author = cachedTask.c_author;        
        data.c_owner = cachedTask.c_owner;
        data.c_state = cachedTask.c_state;
        data.c_assignee = cachedTask.c_assignee; 
        data.c_reviewer = cachedTask.c_reviewer;
        data.c_activity = cachedTask.c_activity;
        data.c_duedate = cachedTask.c_duedate;
        data.c_createDate =  cachedTask.c_createDate;        
        
        attrs.data = data;
                    
        var event = new websheet.event.InsertUnnameRange(refValue,attrs);
		this.editor.sendMessage(event);
	},
	
	//send the delete unamed range msg
	publishDeleteTaskMsg : function( taskId ){
		console.log("publishDeleteTaskMsg for " + taskId);
		var range = this.getRange(taskId);
		if (range){
	        var refValue = range.getParsedRef().getAddress();
	        var attrs = {};
	        attrs.usage = websheet.Constant.RangeUsage.TASK;
	        attrs.rangeid = taskId;
	        var event = new websheet.event.DeleteUnnameRange(refValue,attrs);
			this.editor.sendMessage(event);
		}
	},
	
	//set the update unnamed range msg, include keep the relationship between taskid and fragment id, set the task status to working
	publishUpdateTaskMsg : function(taskId, cachedTask){
		console.log("publishUpdateTaskMsg for taskId " + taskId);
		var range = this.getRange(taskId);
        var refValue = range.getParsedRef().getAddress();
        var attrs = {};
        //attrs.fragid = range.fragDocId;
        attrs.usage = websheet.Constant.RangeUsage.TASK;
        attrs.rangeid = taskId;
        
        var data = {};  
        data.c_title = cachedTask.c_title;
        data.c_content = cachedTask.c_content;
        data.c_author = cachedTask.c_author;        
        data.c_owner = cachedTask.c_owner;
        data.c_state = cachedTask.c_state;
        data.c_assignee = cachedTask.c_assignee; 
        data.c_reviewer = cachedTask.c_reviewer;
        data.c_activity = cachedTask.c_activity;
        data.c_duedate = cachedTask.c_duedate;
        data.c_createDate =  cachedTask.c_createDate;
        
        attrs.data = data;
                                               
        var event = new websheet.event.SetUnnameRange(refValue,attrs);
		this.editor.sendMessage(event);
	},
	
	_validateTask: function(taskBean){
		var valid = this.checkTask(taskBean);
		var docid = taskBean.getDocid();
		var taskDamaged  = (docid == 'undefined' || docid == null);								
		if(valid){
			if(!taskDamaged){
				this.updateTaskArea(taskBean.getId());										
				this.checkAccessError(taskBean, true);	
			}							
		}else {
			taskBean.setbInvalid(true); 	
			this.updateTaskArea(taskBean.getId());					
			this.showErrorMessage(taskBean.getId(), null, this.nls.notValidAssignment);	
		}    	
	},
	//called when new user join
	parseTasks :function(){
		//iterate task id get task bean and show task
		var ranges = this._doc.getAreaManager().getRangesByUsage(websheet.Constant.RangeUsage.TASK);
		for(var i=0; i<ranges.length; i++){
			var range = ranges[i];
			var id = range.getId();
			var taskBean = this.getTaskBeanById(id);
			//no error occurred when get task meta
			if(taskBean != null){
				var taskFrame = null;
					try{
						taskFrame = this.getOrCreateTaskFrame( range);
						this.updateSection(taskBean, {area: taskFrame, range: range},null);
						if(taskFrame){
							this._validateTask(taskBean);
						}
					}catch (e){
						console.log("Error in parseTasks: " + e);
						this.removeTask(id);
					}
			}else{
				setTimeout( dojo.hitch(this, function(taskId) {
								console.log("task " + taskId +" is removed");
								if (this.editor.scene.session.isSingleMode())
									this.removeTask(taskId);
							}, id), 5000);
			}
		}
		var selectedTask = this.getSelectedTask();
		if (selectedTask){
			this.setTaskSelected(selectedTask.getId());
		}
		this.removeEmptyDocidTasks();
	},
	
	applyCachedTasks: function(){
		//iterate task id get cached tasks and show task 
		var ranges = this._doc.getAreaManager().getRangesByUsage(websheet.Constant.RangeUsage.TASK);
		for(var i=0; i<ranges.length; i++){
			var range = ranges[i];
			var id = range.getId();
			var taskbean = new concord.task.CachedTask();
			var taskObj = this.getCachedTaskObj(range);
			taskObj.id = id;
			dojo.mixin(taskbean, taskObj);

			var taskFrame = null;
			try{
				taskFrame = this.getOrCreateTaskFrame( range);
				this.addSection(taskbean, {area: taskFrame, range: range});
				this.updateTaskArea( id ,range, taskFrame, taskbean);
			}catch (e){
				console.log("Error in applyCachedTasks: " + e);
			}
		}		
		var selectedTask = this.getSelectedTask();
		if (selectedTask){
			this.setTaskSelected(selectedTask.getId());
		}
	},
	
	getCachedTaskObj: function(taskRef){//parameter may be taskid or range
		var range = null;
		if(dojo.isString(taskRef)){
			range = this.getRange(taskRef);
		}else{
			range = taskRef;
		}
		var taskObj = {};
		if(!range) return taskObj;
		
		var cachedTask = range.data; // cachedTask;
		taskObj.title = (cachedTask.c_title == null) ? "" : cachedTask.c_title;
		taskObj.content = (cachedTask.c_content == null) ? "" : cachedTask.c_content;
		taskObj.author = (cachedTask.c_author == null) ? "" : cachedTask.c_author;
		taskObj.owner =  (cachedTask.c_owner == null) ? "" : cachedTask.c_owner;
		taskObj.state = (cachedTask.c_state == null) ? "" : cachedTask.c_state;
		taskObj.assignee = (cachedTask.c_assignee == null) ? "" : cachedTask.c_assignee;
		taskObj.reviewer = (cachedTask.c_reviewer == null) ? "" : cachedTask.c_reviewer;
		taskObj.activity = (cachedTask.c_activity == null) ? "" : cachedTask.c_activity;
		taskObj.duedate = (cachedTask.c_duedate == null) ? "" : cachedTask.c_duedate;
		taskObj.createDate = (cachedTask.c_createDate == null) ? "" : cachedTask.c_createDate;
		//taskObj.fragid =  (range.fragDocId == null) ? "" : range.fragDocId;	
		return taskObj;
	},
	
	setCachedTaskObj: function(range, taskBean){
		//Cache task in range	
		var cachedTask = range.data; // cachedTask;
		cachedTask.c_title = taskBean.getTitle() == null ? "" : taskBean.getTitle();
		cachedTask.c_content = taskBean.getContent() == null ? "" : taskBean.getContent();
		cachedTask.c_author = taskBean.getAuthor() == null? "": taskBean.getAuthor();
		cachedTask.c_owner = taskBean.getOwner() == null ? "" : taskBean.getOwner();
		cachedTask.c_state = taskBean.getState() == null ? "" : taskBean.getState();
		cachedTask.c_assignee = taskBean.getAssignee() == null ? "" : taskBean.getAssignee();	
		cachedTask.c_reviewer = taskBean.getAssignee() == null ? "" : taskBean.getAssignee();
		cachedTask.c_activity = taskBean.getActivity() == null? "": taskBean.getActivity();	
		cachedTask.c_duedate = taskBean.getDuedate() == null ? this.getCachedTaskObj(range).duedate 
		                          : this.parseDateToTime(taskBean.getDuedate());
		cachedTask.c_createDate = taskBean.getCreateDate() == null ? this.getCachedTaskObj(range).createDate 
		                          : this.parseDateToTime(taskBean.getCreateDate());
		
		//range.fragDocId = taskBean.getFragid() == null ? "" : taskBean.getFragid(); 			
	},
	
	preLoadTask: function(){
		//console.log("TODO preLoadTask");
	},
	
	initStore: function(){
		this.store = new concord.task.TaskStoreProxy(this.taskList);
	},
	
	getRange: function(taskId){
		var section = this.store.getSection(taskId);
		var range = null;
		if (section!= null && typeof section.info.range != 'undefined' && section.info.range != null)
			range = section.info.range;
		else
		{
			var ranges = this._doc.getAreaManager().getRangesByUsage(websheet.Constant.RangeUsage.TASK);
			for(var i=0; i<ranges.length; i++){
				var r = ranges[i];
				var id = r.getId();
				if (id == taskId){
					range = r;
					break;
				}
			}
		}
		return range;
	},
	
	//called when
	//1)lazy loading
	//that is build row/select child for grid, then call this function to redraw the undrawed task in the same sheet
	//2)all the UpdateUI event happens, such as merge/split cells, show/hide rows
	redrawTask : function(sheetName){
		if (!this.bSocial) return;
		if (!this.store || this.store.getLoadStatus()!=this.store.LOADED)
			return;
		var currentGrid = this.editor.getCurrentGrid();
		var sheetModel = this._doc.getSheet(sheetName);
		if(sheetModel)
		{
			for(var taskId in this.taskList){
				var section = this.taskList[taskId];
				if(section){
					var range = section.info.range;
					var taskFrame = section.info.area;
					var taskBean = section.bean;
					if(range && taskBean){
						if(range.getSheetName() == sheetName){
						if( taskFrame == null || taskFrame == undefined){
							try{
								taskFrame = this.getOrCreateTaskFrame( range);
								section.info.area = taskFrame;
								if(taskFrame){
									this._validateTask(taskBean);
								}
							 
							}catch(e){
								console.log("Error in redrawTask: " + e);
								this.removeTask(taskId);
							}
						}else{
							//should not redraw those in-visible task frames
							var rangeInfo = taskFrame.getRangeInfo();		
							var rpSIndex = rangeInfo.startRow < rangeInfo.endRow ? rangeInfo.startRow : rangeInfo.endRow;
							var rpEIndex =  rangeInfo.startRow < rangeInfo.endRow ? rangeInfo.endRow : rangeInfo.startRow;
							var bShow = !((rpEIndex < (currentGrid.scroller.firstVisibleRow + 1) || rpSIndex > (currentGrid.scroller.lastVisibleRow + 1)) && currentGrid.freezeRow < rpSIndex);
							if(bShow)
							{
								taskFrame.renderMultiSelect(false, true, true);
							}else{
								taskFrame.hide();
							}
						}
						}
					}
				}
			}
			var selectedTask = this.getSelectedTask();
			if (selectedTask){
				this.setTaskSelected(selectedTask.getId());
		}
			
		}
	},
	
	//update task according to the modification of the range address which attached to one task
	updateTaskRange: function(range, newRangeInfo){
		var currentGrid = this.editor.getCurrentGrid();
		var section = this.taskList[range.getId()];
		if (section){
			var taskFrame = section.info.area;
			if(taskFrame){
				var selectInfo = taskFrame.getRangeInfo();
				var origSheetName = selectInfo.sheetName;
				var sheetName = newRangeInfo.sheetName;
				var startRowIndex = newRangeInfo.startRow;
				var startColIndex = newRangeInfo.startCol;
				var endRowIndex = newRangeInfo.endRow;
				var endColIndex = newRangeInfo.endCol;
				if(origSheetName == sheetName){
					var cells = currentGrid.getVisibleCell(newRangeInfo);	
					var startCell = cells.start;
					var endCell = cells.end;
					if(startCell && endCell){
						taskFrame.selectRangeArea(startCell, endCell, true, true);
					}else{
						taskFrame = null;
					}
				}
				
				if(taskFrame){
					taskFrame.setSelectedSheet(sheetName);
					taskFrame.setSelectedStartCell(--startRowIndex,startColIndex);
					taskFrame.setSelectedEndCell(--endRowIndex,endColIndex);
				}
			}
		}
	},
		
	//deleteType == 0, deleteIndex is the rowIndex
	//deleteType == 1, deleteIndex is the column field character.
	//deleteType == 2, deleteIndex is null
	//to support multi-rows select,add args deleteEndIndex 
	//
	//TODO: deleteIndex are int, not String
	preDeleteRange:function(deleteType, sheetName, deleteIndex, deleteEndIndex){
		var sheetModel = this._doc.getSheet(sheetName);
		if (!sheetModel) return true;
		
		var rangeInfo;
		if (deleteType == 0) { // row
			rangeInfo = {sheetName: sheetName, startRow: deleteIndex, endRow: deleteEndIndex, startCol: 1, endCol: websheet.Constant.MaxColumnIndex};
		} else if (deleteType == 1) { // column
			rangeInfo = {sheetName: sheetName, startRow: 1, endRow: websheet.Constant.MaxRowNum, startCol: deleteIndex, endCol: deleteEndIndex};
		}
		
		for(var taskId in this.taskList){
			var section = this.taskList[taskId];
			if(section){
				var range = section.info.range;
				var taskBean = section.bean;
				if(taskBean && range){
					if( (deleteType == 0) || (deleteType == 1)){
						if( websheet.Helper.compareRange(range._getRangeInfo(), rangeInfo) > websheet.Constant.RangeRelation.NOINTERSECTION ){
							this.editor.scene.showErrorMessage(this.STR_DELETE_NOT_ALLOWED, 10000);
							return false;
						}
					}else if(deleteType == 2){
						if(range.getSheetName() == sheetName){
							this.editor.scene.showErrorMessage(this.STR_DELETE_NOT_ALLOWED, 10000);
							return false;
						}
					}
				}
			}
		}
		if (this.dummyRanges){
			for (var rangeId in this.dummyRanges){
					var range = this.dummyRanges[rangeId];
					if( (deleteType == 0) || (deleteType == 1)){
						if( websheet.Helper.compareRange(range._getRangeInfo(), rangeInfo) > websheet.Constant.RangeRelation.NOINTERSECTION ){
							this.editor.scene.showErrorMessage(this.STR_DELETE_NOT_ALLOWED, 10000);
							return false;
						}
					}else if(deleteType == 2){
						if(range.getSheetName() == sheetName){
							this.editor.scene.showErrorMessage(this.STR_DELETE_NOT_ALLOWED, 10000);
							return false;
						}
					}
			}
		}
		return true;
	},
	
	//check if the mouse down cell node is in any task frame or not
	showRangeAreaByCellPos: function(cellAddress){
		if (!this.bSocial) return;
		//menu bar status for show/hide all the tasks
		if(this.SHOW_STATUS){
			if (cellAddress){
				var selectedTask = this.getTaskIdByCellPos(cellAddress);
				this.setTaskSelected(selectedTask);
			}
			else{
				this.setTaskSelected(null);
			}
//			var taskList = this.editor.getController().taskList;
//			if(taskList){
//				for(var taskId in taskList){
//					var section = taskList[taskId];
//					if(section){
//						var range = section.info.range;
//						var bFocus = false;
//						if(range){
//							if(cellAddress){
//								var value = range.compare(cellAddress);
//								if(value > websheet.Constant.RangeRelation.NOINTERSECTION){
//									bFocus = true;
//								}							
//						    } 
////							var taskFrame = section.info.area;
////							if(taskFrame){
////								 taskFrame.focused(bFocus);
////							}
//							this.setTaskSelected(section.bean.getId());
//	
//						}
//					}
//				}
//			}
		}
		this.updateCommandState(this.editor.getTaskHdl().getSelectedTask());
	},
	
	getTaskIdByCellPos :function(cellAddress){
		var ref = websheet.Helper.parseRef(cellAddress);
		var cellInfo = {sheetName: ref.sheetName, startRow: ref.startRow, endRow: ref.endRow, startCol: ref.startCol, endCol: ref.endCol};
		if(this.taskList){
			for(var taskId in this.taskList){
				var section = this.taskList[taskId];
				if(section){
					var range = section.info.range;
					if(range){
						if(cellAddress){
							var value = websheet.Helper.compareRange(range._getRangeInfo(), cellInfo);
							if(value > websheet.Constant.RangeRelation.INTERSECTION){
								return taskId;
							}
						}
					}
				}
			}
		}
		return null;	
	},
	
	IsOverlapWithExistTask :function(rangeInfo, rangeId, ignoreDummy){
		//if the tasks haven't been created, user can't select overlap area.
		if (!ignoreDummy && this.dummyRanges) {
			for (var id in this.dummyRanges){
				if (id != rangeId) {
				var value = websheet.Helper.compareRange(this.dummyRanges[id]._getRangeInfo, rangeInfo);
				if(value > websheet.Constant.RangeRelation.NOINTERSECTION) {
						return true;
					}					
				}
			}
		}
		//the taskList can't contain the overlap area.
		if(this.taskList){
			for(var taskId in this.taskList){
				var section = this.taskList[taskId];
				if(section){
					var range = section.info.range;
					if (range && (!rangeId || (rangeId && range.getId()!= rangeId))){
						var taskBean = section.bean;
						var value = websheet.Helper.compareRange(range._getRangeInfo(), rangeInfo);
						if(value > websheet.Constant.RangeRelation.NOINTERSECTION)
							return true;
					}
				}
			}
		}
		return false;
	},
	
	removeEmptyDocidTasks : function(){
		var sections = this.store.getAllSections();
		if(!sections)return;
		
		for(var i in sections){
			var section = sections[i];
			var taskBean = section.bean;
			if(taskBean && !taskBean.getDocid()){
				var info = section.info;
				if(info == null || typeof info.range == 'undefined' || info.range == null ){
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
            var range = section.info.range;		
            if(range){	
            	return true;
            }		 
		}
		return false;			
	},
	
	setTaskSelected: function(taskId){
		if (this.focusTask != taskId){
			var taskFrameOld = null;
			var taskFrameNew = null;
			if (this.focusTask)
				taskFrameOld = this.getTaskFrame(this.focusTask);
			if (taskId)
				taskFrameNew = this.getTaskFrame(taskId);
			if (taskFrameOld)
				taskFrameOld.focused(false);
			if (taskFrameNew)
				taskFrameNew.focused(true);
			this.updateCommandState(this.getTaskBeanById(taskId));
			if(taskFrameNew)
			    this.focusTask = taskId;
			else
			    this.focusTask = null;
		}
	},
	
	selectTask: function(taskId){
		var range = this.getRange(taskId);
		if (range){
	    	var refValue = range.getParsedRef().getAddress(); 
	    	this.editor.setFocus(refValue);
		}
	},
	
	getSelectedTask : function(){
		var grid = this.editor.getCurrentGrid();
		var selectRect = grid.selection.selector();
		//only need the start cell position
		var focusCellInfo = selectRect.getRangeInfo();
		focusCellInfo.endRow = focusCellInfo.startRow;
		focusCellInfo.endCol = focusCellInfo.startCol;
		var taskId = this.getTaskIdByCellPos(focusCellInfo);
		if (taskId){
			return this.getTaskBeanById(taskId);
		}
		else
			return null;
	},
	
	showTask : function(taskFrame){
		//TODO, 
//		taskFrame.renderMultiSelect(false, true, true);
//		taskFrame.showRangeArea();
	},
	
	hideTask: function(taskFrame){
		//TODO, please refer to new task frame interface.
//		taskFrame.hide();
//		taskFrame.hideRangeArea();
	},
	
	getTaskFrame: function(taskId){
		var section = this.store.getSection(taskId);
		if ((section == null) || (section.info == null))
			return null;
		else
			return section.info.area;
	},
		
	compare: function(task1, task2){
		var taskId1 = task1.getId();
		var taskId2 = task2.getId();
		
		if (taskId1 == taskId2)
			return 0;
		if (taskId1 == null)
			return 1;
		if (taskId2 == null)
			return -1;
		
		var range1 = this.getRange(taskId1);
		var range2 = this.getRange(taskId2);
		
		if ((range1 == null) && (range2 == null))
			return 0;
		
		if (range1 == null)
			return 1;
		
		if (range2 == null)
			return -1;
		var rangeInfo1 = range1._getRangeInfo();
		var rangeInfo2 = range2._getRangeInfo();
		var sheetName1 = rangeInfo1.sheetName;
		var sheetName2 = rangeInfo2.sheetName;		
		var sheet1 = this._doc.getSheet(sheetName1);
		var sheet2 = this._doc.getSheet(sheetName2);	
		
		if ((sheet1 == null)&&(sheet2==null))
			return 0;
		if (sheet1 == null)
			return 1;
		if (sheet2 == null)
			return -1;
		var iSheet1 = sheet1.getIndex();
		var iSheet2 = sheet2.getIndex();
		if (iSheet1 != iSheet2)
			return 	(iSheet1 - iSheet2);
		
		// sheet1 == sheet2
		if (rangeInfo1.startRow != rangeInfo2.startRow)
			return (rangeInfo1.startRow - rangeInfo2.startRow);
		
		// startRow1 == startRow2
		return rangeInfo1.startCol - rangeInfo2.startCol;
	},
	
	changeMode:function(mode){
		// do nothing
	},
	
	cancelAssignment: function(){
		this.removeDummySection(this.context);
		if (this.context)
			delete this.context;
		this.context = null;
	},
	
	/*************************Listener***************************/
	notify: function(area, event)
	{
		if(event)
		{
			if(event._type == websheet.Constant.EventType.DataChange)
			{
				var s = event._source;
				var data = s.data;
				if (s.refType == websheet.Constant.OPType.AREA) {
					if (s.action == websheet.Constant.DataChange.INSERT) {
						area.data = {};
						for(var attr in data) {
							area.data[attr] = data[attr];
						}
					}
				}
				
				if(s.action == websheet.Constant.DataChange.PREDELETE
						|| s.action == websheet.Constant.DataChange.PREINSERT  ||
						(s.action == websheet.Constant.DataChange.SET && s.refType == websheet.Constant.OPType.SHEET)) {
					var parsedRef = s.refValue;
					var rangeInfo = area._getRangeInfo();
					var delta = 0;
					if (s.action == websheet.Constant.DataChange.PREDELETE) {
						if (s.refType == websheet.Constant.OPType.COLUMN) {
							delta = parsedRef.endCol - parsedRef.startCol + 1;
							if (rangeInfo.startCol >= parsedRef.startCol)
								rangeInfo.startCol -= delta;
							rangeInfo.endCol -= delta;
						} else {
							delta = parsedRef.endRow - parsedRef.startRow + 1;
							if (rangeInfo.startRow >= parsedRef.startRow)
								rangeInfo.startRow -= delta;
							rangeInfo.endRow -= delta;
						}
					} else if (s.action == websheet.Constant.DataChange.PREINSERT){ // insert
						if (s.refType == websheet.Constant.OPType.COLUMN) {
							delta = parsedRef.endCol - parsedRef.startCol + 1;
							if (rangeInfo.startCol >= parsedRef.startCol)
								rangeInfo.startCol += delta;
								
							rangeInfo.endCol += delta;
						} else {
							delta = parsedRef.endRow - parsedRef.startRow + 1;
							if (rangeInfo.startRow >= parsedRef.startRow)
								rangeInfo.startRow += delta;
								
							rangeInfo.endRow += delta;
						}
					} else { // rename sheet
						rangeInfo.sheetName = s.newSheetName;
					}
					
					this.updateTaskRange(area, rangeInfo);
				}
			}
		}
	}
});