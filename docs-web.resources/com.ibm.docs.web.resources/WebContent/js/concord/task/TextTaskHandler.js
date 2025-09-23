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

dojo.provide("concord.task.TextTaskHandler");

dojo.require("concord.task.AbstractTaskHandler");
dojo.require("concord.text.MsgUtil");
dojo.require("concord.task.CachedTask");
dojo.declare("concord.task.TextTaskHandler", [concord.task.AbstractTaskHandler], {
	
	FIELDSET_CLASS : ["concordWriteTaskBlock", "concordReviewTaskBlock", "concordLockTaskBlock", "concordWriteCompleteTaskBlock", "concordReviewCompleteTaskBlock", "concordCachedTaskBlock"],
	currentDlg: null, // a reference for an opened dialog
	focusTask: null,
	
	constructor: function ()
	{
		this.bStrict = false;
	},	
	
	showInfomationMessage: function(fieldsetId, title, content, interval) {
		//set fieldset border style
		var fieldset = this.getTaskFrame(fieldsetId);
		if (fieldset != null) {
			this.setTaskFieldStyle(fieldset, this.DISABLE_MODE);
		}		
		if (title != null) {
			this.showFieldsetTitle(fieldsetId, title);
		}
		if (content != null) {
			this.showFieldsetMsgDiv(fieldsetId, content, interval);
		}
	},
	
	showFieldsetTitle: function(fieldsetId, title) {
		var fieldset = this.getTaskFrame(fieldsetId);
		this.updateTaskLegend(fieldset, title);
	},
	
	updateTaskLegend: function(fieldset, title) {
		var legend = this.getLegendChild(fieldset); 
	    // firefox cannot refresh UI when legend's content update, so remove the legend and append it again 
	    legend.$.innerHTML = "";
	    legend.remove(false);
	    legend.$.innerHTML = title;
	    
	    legend.setAttribute('contentEditable', 'false');
	    legend.setAttribute('unselectable', "on");
	    
	    fieldset.append(legend, true);		
	},
	
	showFieldsetMsgDiv: function (fieldsetId, content, interval) {
		var fieldset = this.getTaskFrame(fieldsetId);
		var legend = this.getLegendChild(fieldset); 
		var actionDiv = this.getActionChild(fieldset);
		var msgInfoDivArr = dojo.query(".concordTaskLlotusWarning", fieldset.$);
		if(msgInfoDivArr[0]){
            var msgInfoBodyDivArr = dojo.query(".concordTaskLotusMessageBody", msgInfoDivArr[0]);
            msgInfoBodyDivArr[0].innerHTML = content;  
            dojo.style(msgInfoDivArr[0], 'display', '');       			
		}else{
            this.constructMsgInfoDiv(content, actionDiv.$);
		}
		
		if (interval) {
			window.setTimeout(
				dojo.hitch(this, function(){
					this.hideInformationMessage(fieldsetId);
				}),
				interval
			);	
		}	
	},	

	constructMsgInfoDiv : function (content, container) {
			var parentDiv = dojo.create('div', null, container);
			dojo.attr(parentDiv, "contenteditable", "false");
			dojo.attr(parentDiv, "unselectable", "on");
			
			//add class attr for querying
			dojo.addClass(parentDiv,'concordTaskLlotusWarning');
			dojo.attr(parentDiv, 'role', 'status');
			
			var img = dojo.create('img', 
				{
					src: contextPath + window.staticRootPath + '/js/dojo/resources/blank.gif',
					alt: 'Information'
				}
				, parentDiv);
			dojo.addClass(img,'concordTaskLotusIcon');
			dojo.addClass(img, 'yourProductSprite yourProductSprite-msgInfo16'); 
			
			var bodyDiv = dojo.create('div', null, parentDiv);
			dojo.addClass(bodyDiv, 'concordTaskLotusMessageBody');
			
			dojo.attr(bodyDiv, "contenteditable", "false");
			dojo.attr(bodyDiv, "unselectable", "on");				
						
			bodyDiv.innerHTML = content;
	},		
	
	hideInformationMessage: function(fieldsetId) {
		var fieldset = this.getTaskFrame(fieldsetId);
		//if error happened, won't update border style. so, add set original border style.
		if (fieldset != null) {
			var taskBean = this.getTaskBeanById(fieldsetId);
			if (taskBean != null) {
				var titleInfo = this.getTitleInfo(taskBean);
				if (titleInfo != null) {
					var titleMode = titleInfo.mode;
					//update border style
					this.setTaskFieldStyle(fieldset, titleMode);
					//update title content;
					var titleContent = titleInfo.title;
					this.showFieldsetTitle(fieldsetId, titleContent);
				}
			}
		}
		var msgInfoDivArr = dojo.query(".concordTaskLlotusWarning", fieldset.$);
		for (var i =0 ; i < msgInfoDivArr.length; i++) {
			dojo.style(msgInfoDivArr[i], 'display', 'none');
		}
	},
	
	disableTaskArea: function(fieldsetId, flag) {
		if (fieldsetId) {
			fieldset = this.getTaskFrame(fieldsetId);
			var actionDiv = dojo.query(".concordBtnContainer", fieldset.$)[0];	
			var widgets = dijit.findWidgets(actionDiv);
			if (widgets.length != 0){
				var actionBtn = widgets[0];
				if (actionBtn != null) {
					actionBtn.setDisabled(flag);
				}
			} 
			var taskBean = this.getTaskBeanById(fieldsetId);
			if (taskBean)
				taskBean.setbDisable(flag);
			var selectedTask = this.getSelectedTask();
			if (selectedTask && (selectedTask.getId() == fieldsetId))
				this.updateCommandState(taskBean);
		}
	},		
	
	showErrorMessage: function(fieldsetId, title, content, interval, bean) {
		if (title != null) {
			this.showFieldsetTitle(fieldsetId, title);
		} else {
			var taskBean = bean;
			if(typeof taskBean == 'undefined' || !taskBean)
				taskBean = this.getTaskBeanById(fieldsetId);
				
			var titleInfo = this.getTitleInfo(taskBean);
			var title = titleInfo.title;
			this.showFieldsetTitle(fieldsetId, title);
			this.showFieldsetErrorDiv(fieldsetId, content);
			if (interval) {
			window.setTimeout(
				dojo.hitch(this, function(){
					this.hideFieldsetErrorDiv(fieldsetId);//, content);
				}),
				interval
			);	
			} 
			
		}
	},	
	
	showFieldsetErrorDiv: function (fieldsetId, content) {
		var fieldset = this.getTaskFrame(fieldsetId);
		var legend = this.getLegendChild(fieldset); 
		var actionDiv = this.getActionChild(fieldset);	
		
		var msgErrorDivArr = dojo.query(".concordTaskLotusError", fieldset.$);
		if(msgErrorDivArr[0]){
			var msgErrorBodyDivArr = dojo.query(".concordTaskLotusMessageBody", msgErrorDivArr[0]);
			msgErrorBodyDivArr[0].innerHTML = content;	
			dojo.style(msgErrorDivArr[0], 'display', '');		
		}else{
            this.constructMsgErrorDiv(content, actionDiv.$);			
		}			
	},		
	
	hideFieldsetErrorDiv: function (fieldsetId) {
		var fieldset = this.getTaskFrame(fieldsetId);
		var msgErrorDivArr = dojo.query(".concordTaskLotusError", fieldset.$);	
		for (var i =0 ; i < msgErrorDivArr.length; i++) {
			dojo.style(msgErrorDivArr[i], 'display', 'none');
		}       
	},	

	constructMsgErrorDiv : function (content, container) {
			var parentDiv = dojo.create('div', null, container);
			dojo.attr(parentDiv, "contenteditable", "false");
			dojo.attr(parentDiv, "unselectable", "on");			
			
			dojo.addClass(parentDiv,'concordTaskLotusError');
			dojo.attr(parentDiv, 'role', 'status');
			
			var img = dojo.create('img', 
				{
					src: contextPath + window.staticRootPath + '/js/dojo/resources/blank.gif',
					alt: 'Error'
				}
				, parentDiv);
			dojo.addClass(img,'concordTaskLotusIcon');
			dojo.addClass(img, 'yourProductSprite yourProductSprite-msgError16'); 
			
			var bodyDiv = dojo.create('div', null, parentDiv);
			
			dojo.attr(bodyDiv, "contenteditable", "false");
			dojo.attr(bodyDiv, "unselectable", "on");					
			
			dojo.addClass(bodyDiv, 'concordTaskLotusMessageBody');
			bodyDiv.innerHTML = content;		
	},		

	assignTask : function(action){
		// createTask message may conflict with other and fieldset was removed to resolved conflict
		// so make sure field is still available here.
		var context = this.context;
		var fieldset = this.editor.document.getById(context.uuid);
		if ( fieldset == null)
		{
			pe.scene.showWarningMessage(this.nls.taskAlreadyRemoved, 10000);
			return;
		}	
		
		this.inherited(arguments);
		
	},
	
	postTaskCreate: function(taskBean, context, info){
		var taskNode = info.area;
		var uuid = context.uuid;
		var msgs = [];
		var act = SYNCMSG.createUpdateTaskAct(uuid, taskBean.getId(), this.getPublishCachedTaskObj(taskBean));
		var msg = SYNCMSG.createMessage(MSGUTIL.msgType.Task,[act]);
		msg.msg.disableRedo = true;
		msg.rMsg.disableUndo = true;	
		msgs.push(msg);
		
		SYNCMSG.beginRecord();
		this.fixTaskBlock(taskNode);
		msgs = msgs.concat(SYNCMSG.endRecord());
		msgs && SYNCMSG.sendMessage(msgs);
				
		// Send notification to users
		//			var assigner = pe.lotusEditor.user;
		// 			var assignee = getUserFullName(taskBean.getOwner());
		//			pe.scene.addNotificationTask(assigner, assignee, taskId);
				
		if (pe.scene.session.isSingleMode())					
		   	pe.scene.session.save(true);
		
		var selectedTask = this.getSelectedTask();
		if (selectedTask && selectedTask.getId()){
			if (selectedTask.getId() == taskBean.getId()){
				this.setTaskSelected(taskBean.getId());
			}
		}
		
	},
	
	setCommandState : function(commandList)
    {
		if(!commandList || commandList.length == 0)
    		return;
    	for(var i=0;i<commandList.length;i++){
    			this.editor.getCommand(commandList[i].name).setState(commandList[i].disableCondition?CKEDITOR.TRISTATE_DISABLED:CKEDITOR.TRISTATE_OFF);
    	}
    },
	
	updateCommandState : function(taskBean)
	{
		 if (!this.bSocial) return;         
         //var taskBean = editor.getTaskHdl().getSelectedTask();
		 var isGetSelectedTask = taskBean? true : false;
		 var toc = CKEDITOR.tools.getSelectedTOC && CKEDITOR.tools.getSelectedTOC( this.editor );
		 var canEnableCmds = this.isServiceReady() && this.bTMenusEnabled;
		 var isCreateAssignment =  canEnableCmds && !isGetSelectedTask && !toc;
         var isEditAssignment =false;
         var isReopenAssignmen = false;
         var isReassignAssignment = false
         var isMarkAssignComplete = false;
         var isWorkPrivate = false;
         var isCancelPrivate = false;
         var isApproveSection = false;
         var isReturnSection = false;
         var isRemoveSectionAssign = false;
         var isAbout = false;

         if(canEnableCmds && isGetSelectedTask){
         
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
         
         var commandList = [
 		   		           {name:'assignTask',disableCondition: !isCreateAssignment },
		   		           {name:'removeCompletedAssign', disableCondition: !canEnableCmds },         
		   		           {name:'editAssignment',disableCondition: !isEditAssignment},
		   		           {name:'markAssignComplete',disableCondition: !isMarkAssignComplete},
		   		           {name:'workPrivate',disableCondition: !isWorkPrivate},
		   		           {name:'cancelPrivate',disableCondition: !isCancelPrivate},
		   		           {name:'approveSection',disableCondition: !isApproveSection},
		   		           {name:'returnSection',disableCondition: !isReturnSection},
		   		           {name:'removeSectionAssign',disableCondition: !isRemoveSectionAssign},
		   		           {name:'reopenAssignment',disableCondition: !isReopenAssignmen},
		   		           {name:'reassignAssignment',disableCondition: !isReassignAssignment},
		   		           {name:'about',disableCondition: !isAbout}
		   		           ];
			
         this.setCommandState(commandList);
         dojo.publish(concord.util.events.taskEvents_eventName_taskCreateEnabled, [isCreateAssignment]);
		
	},
	
	setTaskSelected: function(taskId){
		if (taskId != this.focusTask){
			var taskEvent = null;
			if (taskId){
				taskEvent = [{taskId:taskId , selected:true}];
    				concord.util.events.publish(concord.util.events.taskEvents_eventName_taskSelected,taskEvent);
			}
						
			if (this.focusTask){
				taskEvent = [{taskId:this.focusTask , selected:false}];
    				concord.util.events.publish(concord.util.events.taskEvents_eventName_taskSelected,taskEvent);
			}
						
		} 
		this.focusTask = taskId;
		this.updateCommandState(this.getTaskBeanById(taskId));		
	},
	
	////////////////////////////////TextTaskHandler private function////////////
	updateFragment: function(fragId, fragDoc){
		var taskList = new Array();
		var sInx = fragDoc.indexOf('<body');
		var eInx = fragDoc.indexOf('</body>');	          
		sInx = fragDoc.indexOf('>',sInx);
		var content = fragDoc.substring(sInx+1, eInx);
		var selectedTask = this.getSelectedTask();
		var selection = this.editor.getSelection();
		content = content.replace(/[\r\n]/g,'');
		dojo.query('.reference[frag_id='+fragId+']', this.editor.document.$).forEach(dojo.hitch(this, function(node){
			var taskId = node.getAttribute('task_id');
			node.innerHTML = content;
			dojo.attr(node, "frag_id", "");
			taskList.push(taskId);
			contentNode = CKEDITOR.dom.node(node);
			if (selectedTask && taskId == selectedTask.getId()){
				while(contentNode.getFirst && contentNode.getFirst()){
					contentNode = contentNode.getFirst();
				}
				TASK.tools.cursor.moveToStart(contentNode, selection);
			}
			if(this.editor.spellchecker && this.editor.spellchecker.isAutoScaytEnabled())
				//setTimeout(dojo.hitch(this, function() {this.editor.spellchecker.checkNodes(node, node)}), 0);
				this.editor.spellchecker.checkNodes(node, node);
		}));	
		return taskList;
	},
	
	
	analyzeRange: function(range) {
		//var rangeStart = range.getTouchedStartNode();
		//var rangeEnd = range.getTouchedEndNode();
		var boundary = TASK.tools.range.getBoundary(range);
		//var boundary = range.getBoundaryNodes();
		var rangeStart = boundary.startNode;
		var rangeEnd = boundary.endNode;
		var result = {};
		var startInTask = TASK.tools.node.isInTask(rangeStart);
		var endInTask = rangeStart.equals(rangeEnd) ? startInTask : TASK.tools.node.isInTask(rangeEnd);
		var array = TASK.tools.range.getContainedTasks(rangeStart, rangeEnd);
		if (startInTask || endInTask || array.length > 0) {
			result.valid = false;
			return result;
		}
	
		var startPara = TASK.tools.node.findParentContainer(rangeStart);
		var startHeading = TASK.tools.node.findParentHeading(rangeStart);
		var endPara = TASK.tools.node.findParentContainer(rangeEnd);
		range.setStartBefore(startPara);
		range.setEndAfter(endPara);
		range.select();
		var parent = range.getCommonAncestor(false);
		while ( startPara.getParent().$ != parent.$ )
			startPara = startPara.getParent();
		while ( endPara.getParent().$ != parent.$ )
			endPara = endPara.getParent();
		var sections = new Array();
		var start = startPara;
		sections.push(start);
		while( start!=null && !start.equals(endPara)){
			start = start.getNext();
			sections.push(start);
		}
		var title = null;
		if (startHeading && startHeading.getText)
		{
			title = startHeading.getText();				
		}
		
		result = {
					valid: true,
					target: parent.getId(),
					index: startPara.getIndex(),
					offset: sections.length,
					title: title,
					sections: sections
				};		
		return result;
	},
	
	fixTaskBlock : function(task)
	{
		// before
		var msgs = [];
		var acts = [];
		var node = task.getPrevious();
		if (!node || TASK.tools.node.isTaskContainer(node))
		{
			var block = this.createEditBlock();
			block.insertBefore(task);
			var act = SYNCMSG.createInsertBlockElementAct( block );
			acts.push(act);
//			var blockId = block.getAttribute("id");
//			cmdList.push(LB_COM.createNodeInsertCmd(blockId))
		}
		var contentContainer = TASK.tools.task.getTaskContentContainer(task);
		if (contentContainer){
			node = contentContainer.getFirst();
			// inject empty paragraph for special blocks
			if(this.isSpecialEditBlock(node))
			{
				// none content
				var block = this.createEditBlock();
				block.insertBefore(node);
				var act = SYNCMSG.createInsertBlockElementAct( block );
				acts.push(act);
	//				var blockId = block.getAttribute("id");
	//				cmdList.push(LB_COM.createNodeInsertCmd(blockId));
			}
			node = contentContainer.getLast();
			if(this.isSpecialEditBlock(node))
			{
				// none content
				var block = this.createEditBlock();
				block.insertAfter(node);
				var act = SYNCMSG.createInsertBlockElementAct( block );
				acts.push(act);
	//			var blockId = block.getAttribute("id");
	//			cmdList.push(LB_COM.createNodeInsertCmd(blockId));
			}				
		}
		// after
		node = task.getNext();
		if (!node || TASK.tools.node.isTaskContainer(node))
		{
			var block = this.createEditBlock();
			block.insertAfter(task);
			var act = SYNCMSG.createInsertBlockElementAct( block );
			acts.push(act);
		}
		var msg = SYNCMSG.createMessage(MSGUTIL.msgType.Element,acts);
		msgs.push(msg);
		msgs.push(SYNCMSG.createMessage(MSGUTIL.msgType.Attribute,LISTUTIL.fixListInTask(task)));
		msgs && SYNCMSG.sendMessage(msgs);
	},

	createEditBlock : function()
	{
		var p = new CKEDITOR.dom.element('p', this.editor.document);
		p.setAttribute("id", MSGUTIL.getUUID());
		p.appendHtml("&nbsp;");
		return p;
	},
	
	// block only contains blocks like table
	isSpecialEditBlock : function(node)
	{
		if (TASK.tools.dom.is(node, "table"))
			return true;
		else
			return false;
	},
	
	createLegend : function(fieldset, id){
		var legend = fieldset.getDocument().createElement("legend");
		legend.setAttribute('id', 'legend_' + id);
		legend.setAttribute('contentEditable', 'false');
		legend.setAttribute('unselectable', "ON");
		legend.setAttribute('aria-live','assertive');
		legend.setAttribute('aria-relevant','all');
		legend.setAttribute('aria-atomic','true');
		legend.innerHTML="";
		legend.addClass("concordContainer");
		fieldset.append(legend, true);
		return legend;
	},
	
	getLegendChild : function(fieldset){		
		if(fieldset){
			var legend = dojo.query("legend", fieldset.$)[0];
			if(legend){
				return CKEDITOR.dom.node(legend);
			}else{
				return null;
			}
		}else
			return null;
	}, 
	
	getActionChild : function(fieldset){
		if(fieldset){
			var actionDiv = dojo.query(".concordBtnContainer", fieldset.$)[0];
			if(actionDiv)
				return CKEDITOR.dom.node(actionDiv);
			else
			    return null;
		}else
			return null;		
	},
	
	createActionArea : function(fieldset, id){
		var first = this.getLegendChild(fieldset);
		if (first == null || first.getName() !='legend') {// invalid
			return null;
		}else{
			var legend = first;
			var actionDiv = fieldset.getDocument().createElement("div");
			actionDiv.setAttribute("contentEditable", "false");
			actionDiv.setAttribute("unselectable", "ON");
			//actionDiv.setAttribute("align", "right");
			actionDiv.setAttribute("align", "left");
			actionDiv.setAttribute("id", "action_" + id);
			actionDiv.addClass("concordBtnContainer");
			actionDiv.insertAfter(legend);
			return actionDiv;
		}
	},

	createActionButton : function(taskBean, actionDiv, fieldset, disable){
		var actions = null;
		if (taskBean != null)
			actions = concord.beans.TaskService.util.getAvailableActions(taskBean, pe.authenticatedUser);
		var actionMenu = new dijit.Menu();
		dojo.addClass(actionMenu.domNode,"lotusActionMenu");
		if (typeof disable == 'undefined')
			disable = false;
		if (actions != null){
			dojo.forEach(actions, dojo.hitch(this, function(actionType){
				var menuItem = null;
				if (actionType == ""){
					menuItem = new dijit.MenuSeparator;
				}else {
					var menuLabel = '';
					var menuId = '';
					if (actionType == concord.beans.TaskService.ACTION_EDIT){
						menuLabel = this.nls.actionBtnEdit;
						menuId = 'D_p_'+taskBean.getId()+'_EditAssignment';
					}else if (actionType ==concord.beans.TaskService.ACTION_REMOVE){
						menuLabel = this.nls.actionBtnRemove;
						menuId = 'D_p_'+taskBean.getId()+'_RemoveAssignment';
					}else if (actionType ==concord.beans.TaskService.ACTION_WORKDONE){
						menuLabel = this.nls.actionBtnMarkComplete;
						menuId = 'D_p_'+taskBean.getId()+'_MarkComplete';
					}else if (actionType ==concord.beans.TaskService.ACTION_PRIVATE){
						menuLabel = this.nls.actionBtnWorkPrivately;
						menuId = 'D_p_'+taskBean.getId()+'_WorkPrivately';
					}else if (actionType == concord.beans.TaskService.ACTION_CANCEL_PRIVATE){
						menuLabel = this.nls.actionBtnCancelPrivate;
						menuId = 'D_p_'+taskBean.getId()+'_CancelPrivateWork';
					}else if (actionType == concord.beans.TaskService.ACTION_GOTO_PRIVATE){
						menuLabel = this.nls.actionBtnGotoPrivate;
						menuId = 'D_p_'+taskBean.getId()+'_GoToPrivateDocument';
					}else if (actionType ==concord.beans.TaskService.ACTION_APPROVE){
						menuLabel = this.nls.actionBtnApprove;
						menuId = 'D_p_'+taskBean.getId()+'_ApproveThisSection';
					}else if (actionType ==concord.beans.TaskService.ACTION_REJECT){
						menuLabel = this.nls.actionBtnRework;
						menuId = 'D_p_'+taskBean.getId()+'_ReworkRequired';
					}else if (actionType ==concord.beans.TaskService.ACTION_REOPEN){
						menuLabel = this.nls.actionBtnReopen;
						menuId = 'D_p_'+taskBean.getId()+'_ReopenAssignment';
					}else if (actionType ==concord.beans.TaskService.ACTION_REASSIGN){
						menuLabel = this.nls.actionBtnReassign;
						menuId = 'D_p_'+taskBean.getId()+'_ReassignSection';
					}else if (actionType ==concord.beans.TaskService.ACTION_ABOUT){
						menuLabel = this.nls.actionBtnAbout;
						menuId = 'D_p_'+taskBean.getId()+'_AboutThisSection';
					}
					menuItem = new dijit.MenuItem({
						label: menuLabel,
						id : menuId,
						onClick: function(evt){
//							pe.lotusEditor.getTaskHdl().doAction(taskBean, actionType, fieldset);
							pe.lotusEditor.getTaskHdl().doAction(taskBean, actionType);
						}
					});
				}
				actionMenu.addChild(menuItem);
			}));
		}

		var actionBtn= new dijit.form.DropDownButton({
							label: this.nls.actions,
							disabled: disable,
							style: this.bSocial ? "float: right;" : "display: none;",
							id: 'D_p_' + fieldset.getId()+'_Action',
							dropDown: actionMenu
							});
		
		if (this.editor.window.$ != dojo.window){
			// workaround
			// dojo._abs always considers the node is a child of dojo.window
			// in CKEditor, editor.window.$ is not dojo.window
			// here we have to move the dropdown menu positon according to the offset of editor.window
			actionBtn.openDropDown = function(){
//								var sel = pe.lotusEditor.getSelection();
//								if (sel){
//									console.log('lock selection');
//									sel.lock();
//								}
								if(actionBtn.dropDown){
									var children = actionBtn.dropDown.getChildren();
									for( var _item = 0; _item < children.length -1; _item ++){
										dojo.style(children[_item].domNode,'display', pe.scene.isViewMode() ? 'none' : '');
									}					
								}
								var retval = dijit.form.DropDownButton.prototype.openDropDown.apply(this, arguments);
								var offset = dojo.coords(pe.lotusEditor.window.$.frameElement);
								var menuFrame = this.dropDown.domNode.parentNode;
								var x = dojo.style(menuFrame, "left");
								var y = dojo.style(menuFrame, "top");
								//adjust the position
								dojo.style(menuFrame, "left", x + offset.x + "px");
								dojo.style(menuFrame, "top", y+offset.y + "px");
								return retval;
			};
			
//			actionBtn.closeDropDown = function(){
//				var retval = dijit.form.DropDownButton.prototype.closeDropDown.apply(this, arguments);
//				var editor = pe.lotusEditor;
//				var sel = editor.getSelection();
//				if (sel){
//					if (sel.isLocked){
//						console.log('sel is unlocked');
//						sel.unlock(true);
//					}
//				}
//				return retval;
//			}
			var _oldOnDropDownMouse = actionBtn._onDropDownMouseDown;
			// dijit._HasDropDown connect mouseup event on dojo.doc in _onDropDownMouse
			// Same as above issue, dojo.doc is not editor document
			// Here we disconnect the original event, and connect to the correct document.
			actionBtn._onDropDownMouseDown = function(e){
				_oldOnDropDownMouse.apply(this, [e]);				 
				if (this._docHandler)
					this.disconnect(this._docHandler);
					
				this._docHandler = this.connect(pe.lotusEditor.window.$.document, "onmouseup", "_onDropDownMouseUp");
			};
		}
		actionBtn.attr("task_id", fieldset.getId());
		actionDiv.setAttribute("align", "left");
		actionDiv.append(CKEDITOR.dom.node(actionBtn.domNode));
		return actionBtn;
	},
	
	setTaskFieldStyle: function(fieldset, mode){
		if(dojo.isFF && dojo.hasClass(dojo.body(), "dijit_a11y"))
			return;
		for (var index in this.FIELDSET_CLASS){
			if (mode == index){
				fieldset.addClass(this.FIELDSET_CLASS[index]);
			}else{
				fieldset.removeClass(this.FIELDSET_CLASS[index]);
			}
		}
	},
	//////////////////////////////////Abstract function//////////////////////
	initStore: function(){
		if (typeof this.editor.sections == 'undefined')
			this.editor.sections = {};
		this.store = new concord.task.TaskStoreProxy(this.editor.sections);
	},
	
	preLoadTask: function(){
		var document = this.editor.document.$;
		var selection = this.editor.getSelection();
		dojo.query('fieldset.concordNode', document).forEach( dojo.hitch(this,function (node) {
			var fieldset = CKEDITOR.dom.node(node);
			this.setTaskFieldStyle(fieldset, this.WRITE_COMPLETE_MODE);
			var legend = this.getLegendChild(fieldset);
			
		
			// firefox cannot refresh UI when legend's content update, so remove the lengend and append it again 
			legend.$innerHTML = "";
			legend.remove(false);
			legend.$.innerHTML = this.nls.loading;
			fieldset.append(legend, true);
				
			var actionDiv = this.getActionChild(fieldset);
			var widgets = dijit.findWidgets(actionDiv.$);
			if (widgets.length != 0){
				var actionBtn = widgets[0];
				if( ((actionBtn == null) || (typeof actionBtn == 'undefined')) || (actionBtn.attr("task_id")!= fieldset.getId())){
					actionDiv.$.innerHTML = '';
				}else{
					actionBtn.destroyRecursive();
					actionDiv.$.innerHTML = '';
				}
			}
			actionDiv.setStyle('display', '');
			this.createActionButton(null, actionDiv, fieldset, true);
			if (this.bShow)
				this.showTask(fieldset);
			else
				this.hideTask(fieldset);
			
		}));
	},
	
	applyCachedTasks: function(){
		console.log("applyCachedTasks");
		var document = this.editor.document.$;
		var bSocialWarning = true;
		dojo.query('fieldset.concordNode', document).forEach( dojo.hitch(this,function (node) {
			var id = node.getAttribute("id");
			var taskbean = new concord.task.CachedTask();
			var taskObj = this.getCachedTaskObj(id);
			taskObj.id = id; 
			
			dojo.mixin(taskbean, taskObj);
			this.updateTaskArea(id,taskbean);
			
			if(this.bSocial){
				this.showErrorMessage(id, null, this.nls.cannotLoadAssignment, 600000, taskbean);
			}else{
				if(bSocialWarning){
//					pe.scene.showWarningMessage(this.nls.cannotSupportSocialEdit, 30000);            		
				}
				bSocialWarning = false;            	
			}
		}));		
	},
	
	clearCachedTasks: function(){
		console.log("clearCachedTasks");
		var document = this.editor.document.$;
		dojo.query('fieldset.concordNode', document).forEach( dojo.hitch(this,function (node) {
			var id = node.getAttribute("id");
			if(id)
				this.removeTask(id);        
		}));                		
	},
	
	clearTasks: function(){
		if(!this.bSocial){
			if(this.getLoadStatus() < 0){
				//remove cached tasks within document
				this.clearCachedTasks();                
			}else{
				this.deleteTasks(null);             
			}
		}
	},
    
	parseTasks: function(){
		console.log("parseTasks");
		if (this.masterDoc && this.masterTask){
			// for a private document, disable insert header and footer
			pe.headerMenuItem.setDisabled(true);
			pe.footerMenuItem.setDisabled(true);
			
			this.editor.fire('updateWorkPrivateCmd', this );
		}
			
		var document = this.editor.document.$;
		var selection = this.editor.getSelection();
		dojo.query('fieldset.concordNode', document).forEach( dojo.hitch(this,function (node) {
			var id = node.getAttribute("id");
			var taskBean = this.getTaskBeanById(id);
			if (taskBean == null) {
				// wait 5 second to make sure this is a single mode or co-edit mode
				setTimeout( dojo.hitch(this, function(taskId) {
								console.log("section " + taskId +" is removed"); 
								if (pe.scene.session.isSingleMode())
									this.removeTask(taskId);
							}, id), 5000); 
			}else{
				this.updateSection(taskBean, {area: node});	
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
	},	
	
	removeEmptyDocidTasks : function(){
		var sections = this.store.getAllSections();
		if(!sections)return;
		
		for(var i in sections){
			var section = sections[i];
			var taskBean = section.bean;
			if(taskBean && !taskBean.getDocid()){
				var info = section.info;
				if(info == null || typeof info.area == 'undefined' || info.area == null ){
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
			if(info == null || typeof info.area == 'undefined' || info.area == null ){
				return false;
			}
			return true;
		}
		return false;		
	},
	
	showAllTasks: function(){
		var document = this.editor.document.$;
		dojo.query('fieldset.concordNode', document).forEach(dojo.hitch(this, function(node){
			var task = TASK.tools.node.getTaskContainer(CKEDITOR.dom.node(node));
			this.showTask(task);
		}));			
		
	},
	
	hideAllTasks: function(){
		var document = this.editor.document.$;
		dojo.query('fieldset.concordNode', document).forEach(dojo.hitch(this, function(node){
			var task = TASK.tools.node.getTaskContainer(CKEDITOR.dom.node(node));
			this.hideTask(task);
		}));			
		
	},
	
	cancelAssignment : function(){
		var uuid = this.context.uuid;
		this.removeTask(uuid);
		this.context = {};
	},
	
	changeMode : function(typeId){
		// if mode is null, then no style is changed
		if(typeId == "delegationsection"){
			this.setTaskFieldStyle(this.context.area, this.WRITE_MODE);
		}
		else if(typeId == "reviewsection"){
			this.setTaskFieldStyle(this.context.area, this.REVIEW_MODE);
		}
	},
	
	getFragId: function(taskId){
		var fieldset = this.getTaskFrame(taskId);
		var fragId = null;
		if (fieldset != null){
			dojo.query('.reference', fieldset.$).forEach(function(node){
				fragId = node.getAttribute('frag_id');
			});			
		}
		return fragId;
	},
	
	getCachedTaskObj: function(taskId){
		var fieldset = this.getTaskFrame(taskId);
		var taskObj = {};
		if (fieldset != null){
			dojo.query('.reference', fieldset.$).forEach(function(node){
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
			});			
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
	
	createTaskArea: function(range, nodeId){
		var target = range.target;
		var id = null;
		var index = range.index;
		var length = range.offset;
		if (dojo.isString(nodeId))
			id = nodeId;
		else if (dojo.isObject(nodeId))
			id = nodeId.taskId ? nodeId.taskId : nodeId.uuid;
			
		var editorDoc = this.editor.document;
		var parent = editorDoc.getById(target);
		if( parent.getName() == "fieldset")
			return;
		
		var fieldset = editorDoc.createElement('fieldset');
	    fieldset.setAttribute("id", id );
		fieldset.addClass("concordNode");
		fieldset.setAttribute("contentEditable", "false");

		var taskStartDiv = editorDoc.createElement('div');
		taskStartDiv.setAttribute("id", "start_"+ id);
		//taskStartDiv.setAttribute("task_id", taskId);
		taskStartDiv.setAttribute("contentEditable", "false");
		taskStartDiv.setAttribute("unselectable", "ON");
		taskStartDiv.addClass('concord_range_start hidden lock');
		taskStartDiv.setStyle("display" ,"none");
		
		var taskEndDiv = editorDoc.createElement('div');
		taskEndDiv.setAttribute("id", "end_"+ id);
		//taskEndDiv.setAttribute("task_id", taskId);
		taskEndDiv.setAttribute("contentEditable", "false");
		taskEndDiv.setAttribute("unselectable", "ON");
		taskEndDiv.addClass('concord_range_end hidden lock');
		taskEndDiv.setStyle("display" ,"none");
		
		
		//add a div as container of all selected contents
		var taskDiv = editorDoc.createElement('div');
		//taskDiv.setAttribute("task_id", taskId);
		taskDiv.setAttribute("frag_id","");	
		taskDiv.setAttribute("id", "reference_" + id);
		taskDiv.addClass('reference');
		taskDiv.setAttribute("contentEditable", "true");
		
		//#2585
		//The default body width is 615px, and the default div under fieldset width is 581px.
		//If the body width is redefined, so should the div do.
		//#2298
		//Some section (e.g. table) may has negtive margin style. So create corresponding padding style for div element.
		//If the width is larger than default, modify the width style also.
		var body = editorDoc.getBody();
		var sections = range.sections;
		if ( sections && sections.length )
		{
			var width 	= 	CKEDITOR.tools.toCmValue( body.getComputedStyle('width') ) - CKEDITOR.tools.toCmValue( '34px' );//34px is computed by default design, 34 = 615 - 581.
			var left 	= 	0;
			var right 	= 	0;
			var top 	= 	0;
			var bottom	=	0;
			
			for ( var i = 0; i < sections.length; i ++ )
			{
				var temp;
				temp = CKEDITOR.tools.toCmValue( sections[i].getComputedStyle('margin-left') );
				( temp < left ) && ( left = temp );
				temp = CKEDITOR.tools.toCmValue( sections[i].getComputedStyle('margin-right') );
				( temp < right ) && ( right = temp );
				temp = CKEDITOR.tools.toCmValue( sections[i].getComputedStyle('margin-top') );
				( temp < top ) && ( top = temp );
				temp = CKEDITOR.tools.toCmValue( sections[i].getComputedStyle('margin-bottom') );
				( temp < bottom ) && ( bottom = temp );
			}
			taskDiv.setStyle( 'width', width + 'cm' );
			
			//If sections contain negtive margin style, create padding style for div element.
			if ( left < 0 )
				taskDiv.setStyle( 'padding-left', (-left) + 'cm' );
			if ( right < 0 )
				taskDiv.setStyle( 'padding-right', (-right) + 'cm' );
			if ( top < 0 )
				taskDiv.setStyle( 'padding-top', (-top) + 'cm' );
			if ( bottom < 0 )
				taskDiv.setStyle( 'padding-bottom', (-bottom) + 'cm' );
		}
		
		this.createLegend(fieldset, id);
		this.createActionArea(fieldset, id);
		
		
		var start = MSGUTIL.getChildNode(parent, parseInt(index));
		fieldset.insertBefore(start);
		
		for(var i=0;i<length;i++){
			var next = start.getNext();
			start.move(taskDiv);
			start = next;
		}
		
		fieldset.append(taskStartDiv);
		fieldset.append(taskDiv);
		fieldset.append(taskEndDiv);
		return fieldset;
	},
	
	updateNewTaskArea: function (context, taskBean){
		var fieldset = context.area;
		var ids = {};
		ids.uuid = fieldset.getId();
		ids.taskId = taskBean.getId();
		return {area: this.updateTaskArea(ids, taskBean)};	
	},
	
	updateTaskArea: function(id, taskBean){
		var taskId = null;
		var uuid = null;
		if (dojo.isString(id))
			taskId = id;
		else if (dojo.isObject(id)){
			taskId = id.taskId;
			uuid = id.uuid;
		}
		var editorDoc = this.editor.document;
		
		var fieldset = null;
		if ( taskId != null )
			fieldset = editorDoc.getById(taskId);
		if (fieldset == null && uuid != null)
			fieldset = editorDoc.getById(uuid);
		if (fieldset == null )
			return;
		
		var taskBean = taskBean || this.store.getTaskBean(taskId);

		var titleInfo = this.getTitleInfo(taskBean);
		var mode = titleInfo.mode;
		var title = titleInfo.title;
		console.log("Set task tile in updateTaskArea:" + title);
	
		var cached = taskBean.isCached();	
		var invalid = taskBean.getbInvalid();
		// if mode is null, then no style is changed
		if(mode!=null && !cached){
			this.setTaskFieldStyle(fieldset, mode);
		}
		if(cached){
			this.setTaskFieldStyle(fieldset, this.CACHED_MODE);		
		}

		if ( taskId != null ) {
			if ( fieldset.getId() != taskId)
				fieldset.setAttribute('id', taskId);
		}

		var legend = this.getLegendChild(fieldset);
		
		// firefox cannot refresh UI when legend's content update, so remove the lengend and append it again 
		legend.$.innerHTML = "";
		legend.remove(false);
		legend.$.innerHTML = title;
		//if(dojo.isIE){
			var textBox = dojox.html.metrics.getTextBox(title, null, "concordContainer");
			var titleWidth = textBox.w; //unit:px     
			var legendWidth  = 581; //width of task in document(unit:px)
			//TODO - Apply ellipsis(...) to truncate title instead of displaying it in multi-lines 
            
			if(titleWidth > legendWidth){
			    if(dojo.hasClass(legend.$, "concordContainer")){
			        legend.addClass("concordContainer_ie_long_literal");
			    }					
			}else{
			    if(dojo.hasClass(legend.$, "concordContainer_ie_long_literal")){
			        legend.removeClass("concordContainer_ie_long_literal");
			    }					 
			}		
		//}		
		fieldset.append(legend, true);
				
		var actionDiv = this.getActionChild(fieldset); 
		var widgets = dijit.findWidgets(actionDiv.$);
		if (widgets.length != 0){
			var actionBtn = widgets[0];
			if( ((actionBtn == null) || (typeof actionBtn == 'undefined')) || (actionBtn.attr("task_id")!= fieldset.getId())){
				actionDiv.$.innerHTML = '';
			}else{
				var dropDown = actionBtn.dropDown;
				if (dropDown)
					dropDown.destroyRecursive();
				actionBtn.destroyRecursive();
				actionDiv.$.innerHTML = '';
			}
		}else{
			var actionBtn = dijit.byId('D_p_' + fieldset.getId()+'_Action');
			if (actionBtn)
				actionBtn.destroyRecursive();
		}

		actionDiv.setStyle('display', '');
		
		if(cached){	
			this.createActionButton(null, actionDiv, fieldset, true);		
		}else{
			this.createActionButton(taskBean, actionDiv, fieldset);	
		}
        
		var taskDiv = null;
		dojo.query('.reference', fieldset.$).forEach(function(node){
				//make taskDiv below the actionBtn.
				dojo.style(node, 'float', 'left');
				taskDiv = node;
		});
	
		if (taskId && taskDiv){
			if ( taskDiv.getAttribute("task_id") != taskId )
				taskDiv.setAttribute("task_id", taskId);
		}
			
	
		// if set title to blank, then remove the legend
		if(title == ""){
			legend.setStyle("display", "none");
			return;
		}else{
			legend.setStyle("display", "");
		}

		if ( taskDiv != null ) {
			this.setCachedTaskObj(taskDiv, taskBean);				 
		}
		
		fieldset.removeAttribute("style");
		
		if (this.bShow)
			this.showTask(fieldset);
		else
			this.hideTask(fieldset);
		
		if (cached)
			this.disableTaskArea(taskId, true);
		else
			this.disableTaskArea(taskId, false);
		
		return fieldset;		
	},
	
	deleteTaskArea: function(id){
		var editorDoc = this.editor.document;
		var fieldset = null;
		if ( id != null)
			fieldset = this.getTaskFrame(id);
		if ( fieldset == null)
			return;
		var actionDiv = dojo.query(".concordBtnContainer", fieldset.$)[0];
		var widgets = dijit.findWidgets(actionDiv);
		if (widgets.length != 0){
			var actionBtn = widgets[0];
			if( ((actionBtn == null) || (typeof actionBtn == 'undefined')) || (actionBtn.attr("task_id")!= fieldset.getId())){
				actionDiv.innerHTML = '';
			}else{
				actionBtn.destroyRecursive();
				actionDiv.innerHTML = '';
			}
		}
			
		var reference = dojo.query(".reference", fieldset.$)[0];
		if (reference){
			var node = CKEDITOR.dom.node(reference).getFirst();
			while(node)
			{
				var t = node.getNext();
				node.insertBefore(fieldset);
				node = t;
			} 
		}
		//fieldset.remove();
		dojo.destroy(fieldset.$);	
	},	

//	enableSubmitCmd: function(bEnable){
//		if (bEnable)
//			this.editor.getCommand("concordsubmit").setState(CKEDITOR.TRISTATE_OFF);
//		else
//			this.editor.getCommand("concordsubmit").setState(CKEDITOR.TRISTATE_DISABLED);
//	},

	enableTaskCmds: function(bEnable){
		 var selectedTask = null;
    	 this.bTMenusEnabled = bEnable; 
    	 if(bEnable && this.bServiceReady){	
    	 	// if service is not ready, no need to get selected task
    	    selectedTask = this.getSelectedTask();
    	 }
    	 this.updateCommandState(selectedTask); 	   	  
	},
		
	showTask: function(taskFrame){
		TASK.tools.task.show(taskFrame);
	},
	
	hideTask: function(taskFrame){
		TASK.tools.task.hide(taskFrame);
	},
	
	preTaskCreate: function(){
		var selection = this.editor.getSelection();
		if (selection) {
			var range = selection.getRanges()[0];
			if (!range){
				return;
			}
			var result = this.analyzeRange(range);
			if ( !result.valid ) {
				pe.scene.showErrorMessage( this.nls.assignmentAlreadyExist , 30000 );
				return;
			}
			//bug fix for 7101 , FF and Safari, select all and assign task
			if (!CKEDITOR.env.ie){
				range.shrink(CKEDITOR.SHRINK_ELEMENT,true);
			}
			
			selection.lock();
			
			var uuid = MSGUTIL.getUUID();
			var target = result.target;
			var index = result.index;
			var offset = result.offset;
			var title = result.title;
			var fieldset = this.createTaskArea(result, uuid);
			
			// co-edit
			var msgs = [];
			var act = SYNCMSG.createInsertTaskAct(target, index, offset, uuid);
			var msg = SYNCMSG.createMessage(MSGUTIL.msgType.Task,[act]);
			msg.msg.disableRedo = true;
			msg.rMsg.disableUndo = true;
			msgs.push(msg);
			
			//#2585
			//If the width of div.reference under fieldset is redefined, create the message.
			var reference = dojo.query('.reference', fieldset.$)[0];
			var styles = reference.getAttribute( 'style' );
			var newstyles = {};
			if ( styles != null )
				newstyles = MSGUTIL.getStyleParas( styles );
			var width = newstyles['width'];
			var left = newstyles['padding-left'];
			var right = newstyles['padding-right'];
			var top = newstyles['padding-top'];
			var bottom = newstyles['padding-bottom'];
			if ( width != '' || left != '' || right != '' || top != '' || bottom != '' )
			{ 
				var oldstyles = {};
				for ( var s in newstyles )
					if ( s != 'width' && s != 'padding-left' && s != 'padding-right' && s != 'padding-top' && s != 'padding-bottom' )
						oldstyles[s] = newstyles[s];
				act = SYNCMSG.createAttributeAct( reference.id,{},newstyles,{},oldstyles);	
				msg = SYNCMSG.createMessage( MSGUTIL.msgType.Attribute,[act] );
				msgs.push( msg );
			}
			
			msgs && SYNCMSG.sendMessage(msgs);
			
			var context = {};
			context.area = fieldset;
			context.uuid = uuid;
			context.title = title;

			selection.unlock(true);
			
			return context;
		}
		return null;
	},
	
	taskCreateFailed: function(context){	
		if(this.isSync) {
			this.removeTask(context.area.getId());			
		} else {
			window.setTimeout(
				dojo.hitch(this, function(){
					this.removeTask(context.area.getId());
				}),
				5000
			);	
		}
	},
	
	postSubmitTask: function(taskBean, submitted){
//		var body = this.editor.document.getBody();
//		var doc_id = taskBean.getDocid();		
//		dojo.removeAttr(body, "doc_id");	
		
		var opener = window.top.opener;
		var bOpenMasterDoc = false;
		var a = this.masterDoc.split("/", 2);
		var uri = concord.util.uri.getDocPageUriById(this.masterDoc);
		
		if (opener){
			if (opener.closed){
				// open master document
				bOpenMasterDoc = true;
			}else{
				// check if opener is master doc
				var openerUri = opener.location.pathname;
				if (openerUri != uri)
					bOpenMasterDoc = true;
				
			}
		}
		else
			bOpenMasterDoc = true;
			
		if (bOpenMasterDoc){
			var docUri = a[1];
			var name = docUri.replace(/[-\s.@]/g, '_');
			window.open(uri, name);
		}

		if (this.masterDoc && this.masterTask){
			pe.headerMenuItem.setDisabled(false);
			pe.footerMenuItem.setDisabled(false);
			
			this.editor.fire('updateWorkPrivateCmd', this );
		}
		if(submitted)
		  window.close();
		else
		  pe.scene.showErrorMessage(this.nls.cannotDeleteDraft, 10000);
		
	},
	
	getSelectedTask: function(selection){
		try{
			if (!selection){
				selection = this.editor.getSelection();
			}else if (selection.getSelection){
		    	  //to avoid defect, in case selection is editor.
		    	  selection = selection.getSelection();
		    }
			
		var taskContainer = null;
		if (selection){
			var ranges = selection.getRanges();
			if (ranges != null){
				var range = ranges[0];
				var boundary = TASK.tools.range.getBoundary(range);
				var startNode = boundary.startNode;
				var endNode = boundary.endNode;
				taskContainer = TASK.tools.node.getTaskContainer(startNode);
				
				if (taskContainer == null)
				{
					if (!range.collapsed)
					{
						taskContainer = TASK.tools.node.getTaskContainer(endNode);
						if (taskContainer == null)
						{
							var tasks = TASK.tools.range.getContainedTasks(startNode, endNode);
							if ((tasks != null) && (tasks.length != 0))
							{
								taskContainer = tasks[0];
							}
						}
					}
				}
			}
		}else{
			// IE, if focus is on sidebar, editor.getSelection return null
			// So use backup selection in editor
			var selectionPath = this.editor._.selectionPreviousPath;
			var elements = selectionPath.elements;
			var element = elements[0];
			taskContainer = TASK.tools.node.getTaskContainer(element);
		}
					
		if (taskContainer != null)
		{
			var taskId = taskContainer.getAttribute("id");
			return this.getTaskBeanById(taskId);
		}
		else
			return null;
		}catch(e){
			console.log('getSelectedTask' + e);
			return null;
		}
	},
	
	doAction : function(taskBean, actionType){
		if (taskBean == null) return;
		var task = this.getTaskFrame(taskBean.getId());
		if(task){       
			task.getWindow().focus(); 
		}  			    	        
		this.inherited( arguments );             	
	},
	
	selectTask: function(taskId){
    	if(taskId){
    		var task = this.getTaskFrame(taskId);
    		if(!task) return;
			
			var elementPosition = task.getDocumentPosition().y;
			var scrollPosition = task.getWindow().getScrollPosition().y;
			var winHeight = task.getWindow().getViewPaneSize().height;
			var elementHeight = task.$.offsetHeight || 0;
			task.getWindow().focus();
			if ((elementPosition <= scrollPosition) ||(elementPosition + elementHeight - scrollPosition >winHeight)){
				var offset = elementPosition - scrollPosition;
				task.getWindow().$.scrollBy( 0, offset );
			}
			var reference = TASK.tools.task.getTaskContentContainer(task);
			if (reference){
				// element.focus doesn't work in FF, so use range.select here
				var range = new CKEDITOR.dom.range(this.editor.document);
				range.setStart(reference.getFirst(), 0);
				range.collapse();
				range.select();
			}
			// for this case, no selection change event fired
			// I have to make the selected task updated
			this.setTaskSelected(taskId);
        }
	},
	
	onDialogShow: function(dlg){
		this.currentDlg = dlg;
		var selection = this.editor.getSelection();
		if (selection)
			selection.lock();
	},
	
	onDialogHide: function(){
		this.currentDlg = null;
		var selection = this.editor.getSelection();
		if (selection)
			selection.unlock(true);
	},
	
	onResetData: function(){
		if (this.currentDlg){
			if (this.currentDlg._destroy)
				this.currentDlg._destroy();
			else
				this.currentDlg.hide();
		}
		
		var sections = this.store ? this.store.sections : null;
		if (sections){
			for (var i in sections){
				var section = sections[i];
				if(section && section.info && section.info.area){
					var widgets = dijit.findWidgets(section.info.area);
					if (widgets.length != 0){
						var actionBtn = widgets[0];
						try{
							console.log('destroy actionBtn for ' + actionBtn.attr('id') );
							actionBtn.destroyRecursive(true); // don't destroy the domNode
							actionBtn.destroy(true);
						}catch(e){
							console.log(e);
						}
					}
				}
			}
		}
				
	},
	
	getTaskFrame: function(taskId){
		return this.editor.document.getById(taskId);
	},
	
	publishInsertTaskMsg: function(taskId, info){
		throw new Error("publishInsertTaskMsg not implememented");
	},
	
	publishUpdateTaskMsg: function(taskId, cachedTask){
		var msgs = [];
		var act = SYNCMSG.createUpdateTaskAct(null, taskId, cachedTask);
		var msg = SYNCMSG.createMessage(MSGUTIL.msgType.Task,[act]);
		msgs.push(msg);
		console.log("Sending update task message");
		msgs && SYNCMSG.sendMessage(msgs);			
	},
	
	publishDeleteTaskMsg: function(taskId){
		var fieldset = null;
		if ( taskId != null )
			fieldset = this.getTaskFrame(taskId);
		var uuid = null;
		if ( fieldset == null )
			return;
		var target = fieldset.getParent().getId();
		var reference = TASK.tools.task.getTaskContentContainer(fieldset);
		var refId = reference ? reference.getId() : null;
		var idx = fieldset.getIndex();
		var len = reference ? reference.getChildCount() : 0;

		var msgs = [];
		var act = SYNCMSG.createDeleteTaskAct(target, idx, len, uuid, taskId, refId);
		var msg = SYNCMSG.createMessage(MSGUTIL.msgType.Task,[act]);
		msg.msg.disableRedo = true;
		msg.rMsg.disableUndo = true;
		msgs.push(msg);
		msgs && SYNCMSG.sendMessage(msgs);

	},
	
	// =0, means task1 is the same as task2
	// >0, means task1 is after task2
	// <0, means task1 is before task2
	compare: function(task1, task2){
		var taskId1 = task1.getId();
		var taskId2 = task2.getId();
				
		if (taskId1 == taskId2)
			return 0;
		if (taskId1 == null)
			return 1;
		if (taskId2 == null)
			return -1;
		var taskArea1 = this.getTaskFrame(taskId1);
		var taskArea2 = this.getTaskFrame(taskId2);
		
		if ((taskArea1 == null) && (taskArea2 == null))
			return 0;
		
		if (taskArea1 == null)
			return 1;
		
		if (taskArea2 == null)
			return -1;
		
		if (taskArea1.getPosition( taskArea2 ) & CKEDITOR.POSITION_FOLLOWING ){
			return 1;
		}else
			return -1;
			
	},
	
	processMessage : function ( msgType, data ) {
		switch (msgType) {
				case MSGUTIL.actType.insertTask:
					var range = {};
					range.target = data.tid;
					range.index = data.idx;
					range.offset = data.len;
					var nodeId = {};
					nodeId.taskId = data.tsk;
					nodeId.uuid = data.uuid;
					this.createTaskArea(range, nodeId);
					break;
				case MSGUTIL.actType.deleteTask:
					var taskId = data.tsk || data.uuid;
					var selectedTask = this.getSelectedTask();
					if(selectedTask && selectedTask.getId() == taskId)
					{
						this.setTaskSelected(null);
					}
					this.deleteTaskArea(taskId);
					this.deleteSection(data.tsk);
					break;
				case MSGUTIL.actType.updateTask:
					if ( data.tsk != null ) {
						// try to get taskbean from server when we receive update message, and then save it to store.
						var taskBean = concord.beans.TaskService.getTask(this.docBean, data.tsk);
						var ids = {};
						ids.taskId = data.tsk;
						ids.uuid = data.uuid;
						ids.cachedTask = data.cachedTask;
						if ( taskBean != null ) {
							var bAdd = false;
							console.log("Receive update task message and get task bean, title: " + taskBean.getTitle());
							this.store.startBatchUpdate();
							
							if ( this.store.getTaskBean(data.tsk) == null ) {
								bAdd = true;
								this.addSection( taskBean, null);
							} else {
								this.updateSection(taskBean, null);
							}
							var fieldset = this.updateTaskArea(ids, taskBean);
							this.updateSection(taskBean, {area: fieldset.$});
							if (bAdd)
								this.store.endBatchUpdate(concord.util.events.taskEvents_eventName_taskAdded, [taskBean]);
							else
								this.store.endBatchUpdate(concord.util.events.taskEvents_eventName_taskUpdated, [taskBean]);
							if(taskBean == this.getSelectedTask())
							{
								this.setTaskSelected(taskBean.getId());
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
					break;
				case MSGUTIL.actType.updateFragment:
					{
					 
						var fragId = data.fragId;
						var fragDoc = data.data; 
						
						// update list when submit task, no need to send message here, because we will do same job on server.
						
						var updateLists = {};
						var updateTasks = [];
						var doc = this.editor.document;
						var containers = doc.$.querySelectorAll('.reference[frag_id="'+fragId+'"]');
						for (var i = 0; i < containers.length; i++)
						{
							var taskid = containers[i].getAttribute('task_id');
							var task = doc.getById(taskid);
							updateTasks.push(task);
							var selector = 'ol[class],ul[class]';
							var siblings = [];
							var rawLists = task.$.querySelectorAll(selector);
							for (var i = 0; i < rawLists.length; i++)
							{
								if (rawLists[i].parentNode.nodeName.toLowerCase() != "li")
								{
									var list = new CKEDITOR.dom.element(rawLists[i]);
									var listclass = LISTUTIL.getListClass(list);
									if (!updateLists[listclass])
										updateLists[listclass] = LISTUTIL.getWholeListInfo(list);
								}
							}
						}
						var taskList = this.updateFragment(fragId, fragDoc);
						for (var cls in updateLists)
						{
							var info = updateLists[cls];
							var createdListHeader = null;
							for (var i = 0; i < updateTasks.length; i++)
							{
								var node = updateTasks[i].$.querySelector('ul.'+cls + ',ol.'+cls);
								if (node)
								{
									createdListHeader = new CKEDITOR.dom.element(node);
									break;
								}	
							}
							LISTUTIL.updateBrokenList(info, createdListHeader);
						}
						
						
						
						for (var i = 0; i < taskList.length; i ++)
						{
							var taskId = taskList[i];
							var taskBean = concord.beans.TaskService.getTask(this.docBean, taskId);
							if ( taskBean != null) {
								var ids = {};
								ids.taskId = taskId;
								ids.uuid = null;
								ids.cachedTask = null;
								this.updateSection(taskBean, null);
								console.log("updateFragment3");  
								this.updateTaskArea(ids);
								if(taskBean == this.getSelectedTask())
								{
									this.setTaskSelected(taskBean.getId());
								}
								if (taskBean.getAssignee()){
									this.refreshEditorIfNeeded(taskBean.getAssignee());
								}
								if (taskBean.getReviewer()){
									this.refreshEditorIfNeeded(taskBean.getReviewer());
								}	
							}
						}
					}
					break;
				default:
					break;
			}
			return;
		}
});