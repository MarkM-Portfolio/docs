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

dojo.provide("writer.plugins.Task");
dojo.require("writer.plugins.Plugin");
dojo.require("writer.collaboration.TaskHandler");
dojo.declare( "writer.plugins.Task",
[writer.plugins.Plugin], {	  
	  init: function() {
		  
		  return;
		  
		//init the task plug-in
		  var editor = this.editor;
		  var createTaskHdl = function() {
				if (typeof editor.taskHandler == 'undefined' || editor.taskHandler == null ){
					var taskHandler = new writer.collaboration.TaskHandler(editor);
					editor.taskHandler = taskHandler;
					editor.getTaskHdl = function(){
						return this.taskHandler;
					};
				}
				
				editor.getTaskHdl().loadTasks();
			};
			var editModeChangeHandler = function() {
				if(pe.lotusEditor.isContentEditing()) {
					editor.getTaskHdl().enableTaskCmds(true);
				}else{
					editor.getTaskHdl().enableTaskCmds(false);
				}				
			};			
			//register selection change event
			var selectionChangeHandler = function(){
				var selection = pe.lotusEditor.getSelection();
				var ranges = selection.getRanges();
				if(ranges.length>1)
					return;
				var range = ranges[0];
				if(range.isCollapsed()) {
					editor.getTaskHdl().selectionChange(range);
				}
			};
			dojo.subscribe(writer.EVENT.BEFORE_LOAD, this, createTaskHdl);
			dojo.subscribe(writer.EVENT.EDITAREACHANGED, this, editModeChangeHandler);
			dojo.subscribe(writer.EVENT.SELECTION_CHANGE, this, selectionChangeHandler);
			
			var assignTaskCommand = 
			{
				exec: function(obj){
					editor.getTaskHdl().createTask();
				}
			};
			editor.addCommand("assignTask", assignTaskCommand);
			
			//for team menu command
			
			editor.addCommand('editAssignment', {
				exec : function(){
					editor.getTaskHdl().doAction(editor.getTaskHdl().getSelectedTask(),
						concord.beans.TaskService.ACTION_EDIT);
				}
			});
		
			editor.addCommand('reopenAssignment', {
				exec : function(){
					editor.getTaskHdl().doAction(editor.getTaskHdl().getSelectedTask(),
						concord.beans.TaskService.ACTION_REOPEN);
				}
			});
		
			editor.addCommand('reassignAssignment', {
				exec : function(){
					editor.getTaskHdl().doAction(editor.getTaskHdl().getSelectedTask(),
					concord.beans.TaskService.ACTION_REASSIGN);
				}
			});
		
			editor.addCommand('markAssignComplete', {
				exec : function(){
					editor.getTaskHdl().doAction(editor.getTaskHdl().getSelectedTask(),
						concord.beans.TaskService.ACTION_WORKDONE);
				}
			});
		
			editor.addCommand('approveSection', {
				exec : function(){
					editor.getTaskHdl().doAction(editor.getTaskHdl().getSelectedTask(),
						concord.beans.TaskService.ACTION_APPROVE);
				}
			});
		
			editor.addCommand('returnSection', {
				exec : function(){
					editor.getTaskHdl().doAction(editor.getTaskHdl().getSelectedTask(),
						concord.beans.TaskService.ACTION_REJECT);
				}
			});
		
			editor.addCommand('removeSectionAssign',{
				exec : function(){
					editor.getTaskHdl().doAction(editor.getTaskHdl().getSelectedTask(),
						concord.beans.TaskService.ACTION_REMOVE);
				}
			});
		
			editor.addCommand('removeCompletedAssign',{
				exec : function(){        
					var taskHdl = pe.lotusEditor.getTaskHdl();
					if (typeof taskHdl != 'undefined') {
						taskHdl.deleteTasks('complete');
					}
				}
			});
		
			editor.addCommand('about', {
				exec : function(){
					editor.getTaskHdl().doAction(pe.lotusEditor.getTaskHdl().getSelectedTask(),
						concord.beans.TaskService.ACTION_ABOUT);
				}
			});

	  }
});