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

dojo.provide("concord.widgets.sidebar.SlideSorterPane");
dojo.require("dojo.i18n");
dojo.require("dijit.layout.ContentPane");
dojo.require("concord.util.events");
dojo.require("concord.task.TaskUtil");
dojo.require("dijit.Tooltip");
dojo.require("concord.widgets.sidebar.SideBarUtil");
dojo.require("concord.widgets.DocsProgressBar");
dojo.require("concord.util.BidiUtils");


dojo.requireLocalization("concord.widgets.sidebar","SlideSorterPane");
dojo.declare("concord.widgets.sidebar.SlideSorterPane", [dijit.layout.ContentPane], {
	nls: null,
	docEditor: null,
	slideSorterContainerId: "slideSorterContainer",
	id_slidesorter_pane: "sidebar_slidesorter_pane",
	id_slidesorter_menu : 'id_slidesorter_menu_context',
	id_slidesorter_tool_div: 'id_slidesorter_tool_div',
	id_top_ac: 'sidebar_top_accordion_container',
	css_pane_btn_img: 'commonsprites commonsprites-SectionMenu12',
	id_task_activity: 'id_task_activity_div',
	id_task_filter: 'id_task_filter',
	id_filter_task_editor: 'll_comment_filter_editor',
	taskActionContainerDivClass: 'll_task_action_container_div',
	id_progressbar: "id_progressbar",
	id_progressbar_container: "id_progressbar_container",	
	taskActionDivId: "taskActionDiv",
	taskAssignDivId: "taskAssignDiv",
	
	slideSorterToolDiv:null,
	connectArray:[], //jmt- reusing for D38660 
	actionMenu: null, // jmt - D38660
	actionBtn: null,
	pMenu: null,     //jmt - D38660
	
	toggleSlideAssignmentsMenuItem: null,
	toggleFilterToMyAssignmentsMenuItem:null,
	toggleSlideAssignmentsMenuItemState:true, //true means it is checked, false means it is unchecked, by default it is checked
	isShowAllAssignmentToBeOverriden: false,
	toggleFilterToMyAssignmentsMenuItem_isFromEditorSelection: false,

	postCreate: function(){ 
		concord.util.events.subscribe(concord.util.events.taskEvents_eventName_taskLoaded, this, 'handleTaskLoadedEvent');
		concord.util.events.subscribe(concord.util.events.taskEvents_eventName_taskUpdated, this, 'handleTaskUpdatedEvent');
		concord.util.events.subscribe(concord.util.events.taskEvents_eventName_taskAdded, this, 'handleTaskAddedEvent');
		concord.util.events.subscribe(concord.util.events.taskEvents_eventName_taskDeleted, this, 'deleteTasks');
		concord.util.events.subscribe(concord.util.events.sidebarEditorEvents_eventName_editorSelected, this, 'editorSelected');		
		concord.util.events.subscribe(concord.util.events.taskEvents_eventName_taskSelected, null, dojo.hitch(this,this.updateActionsState));
		concord.util.events.subscribe(concord.util.events.presAssignment_updateProgressbar, null, dojo.hitch(this,this.handleProgressbar));
		dojo.subscribe(concord.util.events.sideBarEvents, null, dojo.hitch(this,this.handleSideBarEvent));
        		
		this.inherited(arguments);
		this.nls = dojo.i18n.getLocalization("concord.widgets.sidebar","SlideSorterPane");
        this.docEditor = pe.scene;
		this._buildPane();
		
		//this._regEvent();
	},

  _buildPane: function()
  {
		if(window.pe.scene.bAssignment){
			this.slideSorterToolDiv = this.createSlideSorterToolDiv(this.nls.AssignSlides);
			this.createTaskFilter();
		}
		//TS: may just need to do innerHTml
		var slideSorterContainer = document.createElement('div');
		slideSorterContainer.id = this.slideSorterContainerId;
		this.domNode.appendChild(slideSorterContainer);
		this.domNode.style.padding = "0px 0px 0px 0px";
		return slideSorterContainer;
  },
  
  createSlideSorterToolDiv: function(title){
  	var sectionRoot = document.createElement( 'div' );
  	sectionRoot.id = this.id_slidesorter_tool_div;	
  	sectionRoot.style.display = 'block';	
  	sectionRoot.className =this.taskActionContainerDivClass;
		
  	var taskActionDiv = document.createElement('div');
  	taskActionDiv.id = this.taskActionDivId;
  	dojo.addClass(taskActionDiv, "ll_assign_slideActions concordBtnContainer");
  	dojo.style(taskActionDiv, "display", "none"); 
  	var actionBtn = this.createActionButton();
  	if(actionBtn!=null){
  		taskActionDiv.appendChild(actionBtn);
  	}
  	sectionRoot.appendChild(taskActionDiv);
 
  	var asignSecDiv = document.createElement('div');
  	dojo.addClass(asignSecDiv, "ll_assign_slideActions");
  	
  	var asignSpan =  dojo.create('span', null, asignSecDiv); 
  	asignSpan.id = this.taskAssignDivId;    
  	dojo.addClass(asignSpan, 'll_assign_a_section_cursor'); 
  	dojo.attr(asignSpan,'tabIndex','0');
  	dijit.setWaiRole(asignSpan,'button');       
  	asignSpan.innerHTML = this.nls.actionBtnAssign;
  	dojo.style(asignSpan, "display", "none");   		      
  	this.connectArray.push(dojo.connect(asignSpan, "onclick", concord.task.TaskUtil.publishAssignSlides));
  	this.connectArray.push(dojo.connect(asignSpan, "onkeypress", dojo.hitch(this, this._onKeyPress, asignSpan.className, null)));
  	
  	sectionRoot.appendChild(asignSecDiv);  	 	
  	this.domNode.appendChild(sectionRoot);
      
  	return sectionRoot;
  },
	//create task activity
  createTaskActivity: function(activityName, id){
      if (!activityName) 
          return;
      
        //validation code
    	var oldActivity = dojo.byId(this.id_task_activity);
    	if(oldActivity) return;
    	            
        var doc = dojo.doc; 
        
        var activityRoot = dojo.create('div', null,  this.domNode); 
        activityRoot.id = this.id_task_activity;	
        activityRoot.style.display = 'block';
        activityRoot.className = 'll_task_activity_div'; 
              
        var activityContainer =  dojo.create('div', null,  activityRoot);          
        var a1Div =  dojo.create('span', null,  activityContainer); 
        var textNode = doc.createTextNode(this.nls.Activity);
        a1Div.appendChild(textNode);
  
        var a2Div = dojo.create('span', null,  activityContainer); 
        a2Div.className = 'll_task_activity_content';
        var name = doc.createTextNode(activityName);
        a2Div.appendChild(name);
        dojo.attr(activityContainer,'tabIndex','0');   
      	//this.connectArray.push(dojo.connect(a2Div, "onclick", dojo.hitch(this, this.openDocumentActivity, id)));
      
      return activityRoot;
      
  },
    
  updateActionsState: function(data){
	var isSingleSelection = data.isSingleSelection;  	
  	var actions = dojo.byId(this.taskActionDivId);  	
  	var assigns = dojo.byId(this.taskAssignDivId);  	
   	if(data.isCreateAssignment){
  		dojo.style(actions, "display", "none");
  		dojo.style(assigns, "display", "");
  		assigns.innerHTML = isSingleSelection ? this.nls.actionBtnAssign : this.nls.actionBtnAssigns;
  		return;
  	}else{ 
  		dojo.style(actions, "display", "");
  		dojo.style(assigns, "display", "none");  		
  	}
  	 	
  	if(!data.isCreateAssignment && !data.isEditAssignment && !data.isReopenAssignmen
  		&& !data.isReassignAssignment && !data.isMarkAssignComplete && !data.isApproveSection
  		&& !data.isReturnSection && !data.isRemoveSectionAssign && !data.isAbout){
  		this.actionBtn.setDisabled(true);
  		return;
  	}else{
  		this.actionBtn.setDisabled(false);
  	} 	
  	
  	var menuItem = dijit.byId("P_ssp_AssignSlides");
  	if(menuItem){
  		//menuItem.setDisabled(!data.isCreateAssignment);
  		dojo.style(menuItem.domNode, "display", data.isCreateAssignment ? "":"none");
  		var _label = isSingleSelection ? this.nls.actionBtnAssign : this.nls.actionBtnAssigns;
  		menuItem.setLabel(_label);	
  	}
 	menuItem = dijit.byId("P_ssp_EditAssign");
  	if(menuItem){
  		//menuItem.setDisabled(!data.isEditAssignment);
  		dojo.style(menuItem.domNode, "display", data.isEditAssignment ? "":"none");
  	} 
  	menuItem = dijit.byId("P_ssp_ReopenAssign");
  	if(menuItem){
  		//menuItem.setDisabled(!data.isReopenAssignmen);
  		dojo.style(menuItem.domNode, "display", data.isReopenAssignmen ? "":"none");
  		var _label = isSingleSelection ? this.nls.actionBtnReopen : this.nls.actionBtnReopens;
  		menuItem.setLabel(_label);  		
  	} 
 	menuItem = dijit.byId("P_ssp_ReAssign");
  	if(menuItem){
  		//menuItem.setDisabled(!data.isReassignAssignment);
  		dojo.style(menuItem.domNode, "display", data.isReassignAssignment ? "":"none"); 
  		var _label = isSingleSelection ? this.nls.actionBtnReassign : this.nls.actionBtnReassigns;
  		menuItem.setLabel(_label);  		
  	} 
  	menuItem = dijit.byId("P_ssp_MarkSlidesDone");
  	if(menuItem){
  		//menuItem.setDisabled(!data.isMarkAssignComplete);
  		dojo.style(menuItem.domNode, "display", data.isMarkAssignComplete ? "":"none");
  		var _label = isSingleSelection ? this.nls.actionBtnMarkComplete : this.nls.actionBtnMarkCompletes;
  		menuItem.setLabel(_label);  		
  	}
 	menuItem = dijit.byId("P_ssp_ApproveSlides");
  	if(menuItem){
  		//menuItem.setDisabled(!data.isApproveSection);
  		dojo.style(menuItem.domNode, "display", data.isApproveSection ? "":"none");
  		var _label = isSingleSelection ? this.nls.actionBtnApprove : this.nls.actionBtnApproves;
  		menuItem.setLabel(_label);  		
  	} 
  	menuItem = dijit.byId("P_ssp_RejectSlides");
  	if(menuItem){
  		//menuItem.setDisabled(!data.isReturnSection);
  		dojo.style(menuItem.domNode, "display", data.isReturnSection ? "":"none");
  		var _label = isSingleSelection ? this.nls.actionBtnRework : this.nls.actionBtnReworks;
  		menuItem.setLabel(_label);  		
  	}
 	menuItem = dijit.byId("P_ssp_removeSlide");
  	if(menuItem){
  		//menuItem.setDisabled(!data.isRemoveSectionAssign);
  		dojo.style(menuItem.domNode, "display", data.isRemoveSectionAssign ? "":"none");
  	} 
  	menuItem = dijit.byId("P_ssp_AboutSlide");
  	if(menuItem){
  		//menuItem.setDisabled(!data.isAbout);
  		dojo.style(menuItem.domNode, "display", data.isAbout ? "":"none");
  	} 
  },
  
//  openDocumentActivity: function(id){
//      var theUrlPrefix = "${0}/service/html/mainpage#activitypage,${1}";
//      var theUrl = dojo.string.substitute(theUrlPrefix, [g_activitiesUrl, id]);
//      var win = window.open(theUrl);
//      win.focus();
//  },
  
  createActionButton:function(){
	  var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
	  var actionMenu = this.actionMenu = new dijit.Menu({dir: dirAttr});
	  dojo.addClass(actionMenu.domNode,"lotusActionMenu");
	  var menuItem= new dijit.MenuItem({
			id:"P_ssp_AssignSlides",
			label: this.nls.actionBtnAssign,
			dir: dirAttr,
			onClick: concord.task.TaskUtil.publishAssignSlides,
			disabled:false
		});
		actionMenu.addChild(menuItem);
		
	  	menuItem = new dijit.MenuItem({
			id:"P_ssp_EditAssign",
			label: this.nls.actionBtnEdit,
			dir: dirAttr,
			onClick: concord.task.TaskUtil.publishEditAssignSlide,
			disabled:false
		});
		actionMenu.addChild(menuItem);
		
	  	menuItem = new dijit.MenuItem({
			id:"P_ssp_ReopenAssign",
			label: this.nls.actionBtnReopen,
			dir: dirAttr,
			onClick: concord.task.TaskUtil.publishReopenAssignSlides,
			disabled:false
		});
		actionMenu.addChild(menuItem);	
			
	  	menuItem = new dijit.MenuItem({
			id:"P_ssp_ReAssign",
			label: this.nls.actionBtnReassign,
			dir: dirAttr,
			onClick: concord.task.TaskUtil.publishReassignSlides,
			disabled:false
		});
		actionMenu.addChild(menuItem);				

		menuItem = new dijit.MenuItem({
			id:"P_ssp_MarkSlidesDone",
			label: this.nls.actionBtnMarkComplete,
			dir: dirAttr,
			onClick: concord.task.TaskUtil.publishMarkDone,
			disabled:false
			
		});
		actionMenu.addChild(menuItem);

		menuItem = new dijit.MenuItem({
			id:"P_ssp_ApproveSlides",
			label: this.nls.actionBtnApprove,
			dir: dirAttr,
			onClick: concord.task.TaskUtil.publishApprove,
			disabled:false
			
		});
		actionMenu.addChild(menuItem);		
		
		actionMenu.addChild(new dijit.MenuSeparator());		
		
		menuItem = new dijit.MenuItem({
			id:"P_ssp_RejectSlides",
			label: this.nls.actionBtnRework,
			dir: dirAttr,
			onClick: concord.task.TaskUtil.publishReject,
			disabled:false
			
		});
		actionMenu.addChild(menuItem);
								
	  	menuItem = new dijit.MenuItem({
			id:"P_ssp_removeSlide",
			label: this.nls.actionBtnRemove,
			dir: dirAttr,
			onClick: concord.task.TaskUtil.publishUnassign,
			disabled:false
		});
		actionMenu.addChild(menuItem); 
				
//	  	menuItem = new dijit.MenuItem({
//			id:"P_ssp_RemoveCompletedSlides",
//			label: this.nls.actionBtnRemoveCompleted,
//			onClick: concord.task.TaskUtil.publishRemoveCompletedTask,
//			disabled:false
//		});
//		actionMenu.addChild(menuItem); 	
			
		actionMenu.addChild(new dijit.MenuSeparator());	
		
		menuItem = new dijit.MenuItem({
			id:"P_ssp_AboutSlide",
			label: this.nls.actionBtnAbout,
			dir: dirAttr,
			onClick: concord.task.TaskUtil.publishAboutSlideAssignment,
			disabled:false
		});
		actionMenu.addChild(menuItem);
	
//		this.selectActivityMenuItem = new dijit.MenuItem({
//			id:"P_ssp_actionbtn_selectActivity",
//			label: this.nls.SelectActivity,
//			disabled:false, //after activity is set, this menu is to be disabled (set to true) as activity can be set once only
//          	onClick:dojo.hitch(this, this.showActivityDialog)	
//      	});
//      	actionMenu.addChild(this.selectActivityMenuItem);
		
		actionMenu.domNode.style.display ='none';
		document.body.appendChild(actionMenu.domNode);
		
		this.actionBtn= new dijit.form.DropDownButton({
			label: this.nls.Actions,
			disabled: pe.scene.isViewMode() ? true: false,
			baseClass:"ll_thin_button",
			dropDown: actionMenu,
			dir: dirAttr
		});
	
		var actionBtnContainer = document.createElement('div');
		actionBtnContainer.appendChild(this.actionBtn.domNode);
		if(dojo.isIE)
			actionBtnContainer.style.styleFloat = BidiUtils.isGuiRtl() ? 'left' : 'right';
		else
			actionBtnContainer.style.cssFloat = BidiUtils.isGuiRtl() ? 'left' : 'right';
		
		return actionBtnContainer;
  },
  
//called by container as to add widgets on container button
  buildContextMenu: function(){
	  if(window.pe.scene.bAssignment == true){
	  	var paneBtn = document.getElementById(this.id_slidesorter_pane+'_button');
	  	if(paneBtn)
		{
	  		var paneBtnTitle = dojo.byId(this.id_slidesorter_pane+'_button_title');
	        
	  		var imgBtn = document.createElement('div');
	  		var btnId = 'll_pane_btn_img_tasks_id';
	  		imgBtn.id = btnId;
	  		imgBtn.className = this.css_pane_btn_img;
	  		imgBtn.title = this.nls.tipsSlideAssignmentMenu;
	  		dojo.attr(imgBtn,'tabindex','0');
	  		dijit.setWaiRole(imgBtn,'button');
	  		dijit.setWaiState(imgBtn,'label',this.nls.tipsSlideAssignmentMenu);
	  		dojo.attr(imgBtn,'alt',this.nls.tipsSlideAssignmentMenu);
	  		var altText = dojo.create('div',{innerHTML:"&#9660;"},imgBtn);
	  		dojo.addClass(altText,'ll_commmon_images_alttext');          
	  		dojo.place(imgBtn, paneBtnTitle.parentNode, "after");
	  		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
	  		var pMenu = this.pMenu = new dijit.Menu({
	  			targetNodeIds: [btnId],
	  			id: this.id_slidesorter_menu,
	  			leftClickToOpen: true,
	  			dir: dirAttr
	  		});
	  		this.connectArray.push(dojo.connect(pMenu, "onClose", dojo.hitch(this, function(){
	  			imgBtn.focus();
	  		})));            
	  		this.connectArray.push(dojo.connect(imgBtn, "onkeypress", dojo.hitch(this, function(e){
	  			if (e.altKey || e.ctrlKey || e.metaKey) return;
	  			if (e.keyCode != dojo.keys.ENTER && 
	  			e.keyCode != dojo.keys.RIGHT_ARROW && 
	  			e.keyCode != dojo.keys.DOWN_ARROW) return; 
                
	  			dijit.popup.open({around:imgBtn , popup:this.pMenu});
	  			this.pMenu.focusFirstChild();  
	  			dojo.stopEvent(e);          	
	  		})));
	  		this.connectArray.push(dojo.connect(this.pMenu.domNode, "onkeypress", dojo.hitch(this, function(e){
	  			if (e.altKey || e.ctrlKey || e.metaKey) return;
	  			if (e.keyCode != dojo.keys.ESCAPE) return; 
	  			dijit.popup.close(this.pMenu);
	  			dojo.stopEvent(e); 
	  			imgBtn.focus();         	
	  		})));        
	  		dojo.addClass(pMenu.domNode,"lotusActionMenu");    
	  		pMenu.domNode.style.display ='none';
	  		document.body.appendChild(pMenu.domNode);  
                      	  	  	
	  		//this.connectArray.push(dojo.connect(imgBtn, 'onclick', dojo.hitch(this,this.checkMyAssignmentStatus)));
	  	  	
	  		var _parent = this;
			  				  	  	
	  		this.toggleFilterToMyAssignmentsMenuItem = new dijit.CheckedMenuItem({
	  	  		id:"P_sspn_ctx_filterAssign",
	  	  		label: this.nls.FilterToMyAssignments,
	  	  		dir: dirAttr,
	  	  		onChange: function(checked){
	  	  			if(checked){ 
	  	  				_parent.filterToMyAssignments(); 
	  	  			}else {
	  	  				_parent.showAllSlides();
	  	  			}
	  	  			dijit.popup.close(_parent.pMenu);
	  	  		}
	  	  	});
	  	  	pMenu.addChild(this.toggleFilterToMyAssignmentsMenuItem);
	      	
	  		this.toggleSlideAssignmentsMenuItem = new dijit.CheckedMenuItem({
	  			id:"P_sspn_ctx_slideAssignIndictr",
	  			label: this.nls.HideSlideAssignments,
	  	  		dir: dirAttr,
	  			onChange: function(checked){
	  				if(checked){ 
	  					_parent.hideSlideAssignments(); 
	  				}else {
	  					_parent.showSlideAssignments();
	  				}
	  				dijit.popup.close(_parent.pMenu);
	  			}
	  		});
	  		pMenu.addChild(this.toggleSlideAssignmentsMenuItem);
	      	
	  		this.removeCompletedAssignmentsMenuItem = new dijit.MenuItem({
	  			id:"P_sspn_ctx_removeCompletedAssign",
	  			label: this.nls.RemoveCompletedAssignments,
	  	  		dir: dirAttr,
	  			disabled:false,
	  			onClick:dojo.hitch(this, this.removeCompletedAssignments)	
	  		});
	  		pMenu.addChild(this.removeCompletedAssignmentsMenuItem);
		
	  		pMenu.startup();       					
	  	}
	  }
  },
  _regEvent: function(){
	  /*
      concord.util.events.subscribe(this.TASK_ADDED_MESSAGE, this, 'addTask');
      concord.util.events.subscribe(this.TASK_UPDATED_MESSAGE, this, 'updateTask');
      concord.util.events.subscribe(this.TASK_DELETED_MESSAGE, this, 'deleteTasks');
      concord.util.events.subscribe(concord.util.events.sidebarEditorEvents_eventName_editorSelected, this, 'editorSelected');
      concord.util.events.subscribe(concord.util.events.activity_linked, this, 'setSelectedActivity');
      */
  },
  
  refresh: function()
  {
	  concord.util.resizer.performResizeActions();
  },
  
  hideSlideAssignments: function(){	
  	this.hideActionsDiv();
  	  	
  	this.hideActivityDiv();
  	//open the slidesorter pane 
  	this.openSlideSorterPane();
  		
  	var eventData = [{eventName: concord.util.events.sidebarEditorEvents_eventName_hideAllAssignments}];
  	concord.util.events.publish(concord.util.events.sideBarEvents, eventData);
		
  	this.toggleFilterToMyAssignmentsMenuItem_isFromEditorSelection = false;
  },
  
  showSlideAssignments: function(){	
    this.showActionsDiv();	
  	//show activity bar
  	this.showActivityDiv();
		
  	if(!this.toggleFilterToMyAssignmentsMenuItem_isFromEditorSelection){
  		this.openSlideSorterPane();
  	}
  	var eventData = [{eventName: concord.util.events.sidebarEditorEvents_eventName_showAllAssignments}];
  	concord.util.events.publish(concord.util.events.sideBarEvents, eventData);
		
  	this.toggleFilterToMyAssignmentsMenuItem_isFromEditorSelection = false;
  },
  
  showAllSlides: function(isFromMenu){  
  	var eventData = [{eventName: concord.util.events.sidebarEditorEvents_eventName_showAllSlides}];
  	concord.util.events.publish(concord.util.events.sideBarEvents, eventData);
		
  	//check if the current filter user is already set to current user, 
  	//if it does, meaning it comes from editorSelected already.
  	var data = {};
  	if(window.pe.scene.authUser!=null){
  		if (this.filterUser) {
  			if (this.filterUser.id != null) {
  				data.id = this.filterUser.id;
  				data.name = this.filterUser.name;
  				this.editorSelected(data, this.isShowAllAssignmentToBeOverriden);
  				if(this.isShowAllAssignmentToBeOverriden == true){
  					this.isShowAllAssignmentToBeOverriden = false;
  				}
  			}
  		}
  	}
			
  	this.toggleFilterToMyAssignmentsMenuItem_isFromEditorSelection = false;
	  
  },
  
  filterToMyAssignments: function(){	
  	if(this.toggleSlideAssignmentsMenuItem.checked){
  		this.simulateMenuClick(this.toggleFilterToMyAssignmentsMenuItem);
  		return;	 
  	}	 
  	//check if the current filter user is already set to current user, 
  	//if it does, meaning it comes from editorSelected already.
  	var data = {};
  	if(window.pe.scene.authUser){
  		if (!this.filterUser || (this.filterUser && this.filterUser.id != window.pe.scene.authUser.getId())) {
  			data.id = window.pe.scene.authUser.getId();
  			data.name = window.pe.scene.authUser.getName();
  			this.editorSelected(data, true);
  		}
  	}
  	if(!this.toggleFilterToMyAssignmentsMenuItem_isFromEditorSelection){
  		var hasFilter = true;
  		this.openSlideSorterPane(hasFilter);
  	}
  	this.toggleFilterToMyAssignmentsMenuItem_isFromEditorSelection = false;
		
  },
  
  openSlideSorterPane:function(hasFilter){
  	var ac = dijit.byId(this.id_top_ac);
  	//open slidesorter pane if it is not opened
  	if( ac!=null && this != ac.selectedChildWidget )
  	{
  		window.pe.scene.sidebar.openSlideSorterPane(hasFilter);
  	}
  },
  
  checkMyAssignmentStatus: function(){
  	if(this.docEditor.slideSorter!=null){
  		var mySlides = this.getUserAssignmentSlides(pe.authenticatedUser.getId());
  		if(mySlides!=null && mySlides.length>0){
  			this.toggleFilterToMyAssignmentsMenuItem.disabled = false;
  		}else {
  			//initially we want to prevent the user to get in MyAssignment view if there is no assignment for the user
  			//this.toggleFilterToMyAssignmentsMenuItem.disabled = true;				
  			//but looks like that is not a good approach.. when the user in My Assignment mode and delete the last assignment slide, then the 
  			//toggle button is disabled, no way back to show all slide with the button.
  		}			
  	}
  },
  
  handleSideBarEvent:function(data){
  	if(data.eventName== concord.util.events.sidebarEditorEvents_eventName_hideAllAssignments){
  		this.hideAllAssignments();
  	} else if (data.eventName== concord.util.events.sidebarEditorEvents_eventName_showAllAssignments){
  		this.showAllAssignments();
  	} else if(data.eventName==concord.util.events.sidebarEditorEvents_eventName_showMyAssignments){
  		this.showMyAssignments();
  	}  else if(data.eventName==concord.util.events.sidebarEditorEvents_eventName_showUserAssignments){
  		if(data.userId !=null){
  			this.showUserAssignments(data.userId);
  		}
  	}else if (data.eventName == concord.util.events.sidebarEditorEvents_eventName_refreshFilter){ 
  		this.refreshFilter();
  	}
  },
  
  hideAllAssignments:function(){
  	//hide the assignments
  	var slideManager = this.docEditor.slideSorter;
  	var taskContainers = dojo.query(".taskContainer", slideManager.editor.document.$);
  	if(taskContainers!=null){
  		for(var i=0; i<taskContainers.length; i++){
  			taskContainers[i].style.display = "none";
  			taskContainers[i].style.visibility = "hidden";
  		}
  		slideManager.selectSlide(slideManager.selectedSlide);
  	}
  },
  
  showAllAssignments:function(){
  	var slideManager = this.docEditor.slideSorter;
  	var taskContainers = dojo.query(".taskContainer", slideManager.editor.document.$);
  	if(taskContainers!=null){
  		for(var i=0; i<taskContainers.length; i++){
  			taskContainers[i].style.display = "block";
  			taskContainers[i].style.visibility = "visible";
  		}
  		slideManager.selectSlide(slideManager.selectedSlide);
  	}
  },
            
  getUserAssignmentSlides:function(userId){
  	var mySlides = new Array();
  	var slideManager = this.docEditor.slideSorter;
  	var allSlides = slideManager.getAllSlides();
  	var taskHdl = slideManager.getTaskHdl();
  	if(taskHdl && allSlides && allSlides.length>0){
  		for(var i=0; i<allSlides.length; i++){
  			var slideElem = allSlides[i];
  			var taskNode = dojo.query("[task_id]",slideElem.parentNode)[0];
  			if(taskNode){ 
  				var id = taskNode.getAttribute("task_id");
  				var task = taskHdl.getTaskBeanById(id);
  				if(userId == task.getOwner()){
  					mySlides.push(slideElem);
  				}
  			}           	  
  		}
  	}
  	return mySlides;
  },
  
  refreshFilter: function(){   
  	if(this.filterUser){
  		this.showUserAssignments(this.filterUser.id);
  	}	
  },
  
  showMyAssignments:function(){
  	this.showUserAssignments(pe.authenticatedUser.getId());
  },
    
  showUserAssignments:function(userId){
  	var mySlides = this.getUserAssignmentSlides(userId);
  	var slideManager = this.docEditor.slideSorter;
  	var allSlides = slideManager.getAllSlides();      
  	if(mySlides!=null && mySlides.length>0){            
  		if(allSlides!=null && allSlides.length>0){
  			for(var i=0; i<allSlides.length; i++){
  				var slideElem = allSlides[i];
  				//hide all the slides first
  				//mark the slide wrapper display:none
  				slideElem.parentNode.style.display="none";
  				slideManager.unloadSlideFromSorter(slideElem);
  			}
  		}
  		var isSelectedSlideInView = false;
  		//display mySlides
  		for(var i=0; i<mySlides.length; i++){
  			slideManager.loadSlideToSorter(mySlides[i]);
  			mySlides[i].parentNode.style.display="block";

  			//check if the selected slide is in the filtered slides
  			//for managing selected slide in the filtered view
  			if(mySlides[i].id == slideManager.selectedSlide.id){
  				isSelectedSlideInView = true;
  			}
  		}
  		if(isSelectedSlideInView !=true){
  			slideManager.simulateSlideClick(mySlides[0]);
  		}
        }else{
            if(allSlides!=null && allSlides.length>0){
  			for(var i=0; i<allSlides.length; i++){
  				var slideElem = allSlides[i];
  				//hide all the slides first
  				//mark the slide wrapper display:none
  				slideElem.parentNode.style.display="none";
  			}
  		}
  	}
  }, 
     
  checkCurrCompletedAssignmentStatus: function(){
	  var presTaskStore = this.docEditor.slideSorter.taskHandler.presTaskStore;
		if(presTaskStore!=null){
			var currCompletedTasks = presTaskStore.getAllPresTaskBeanWithState("complete");
			if(currCompletedTasks!=null && currCompletedTasks.length>0){
				//publish the taskcomplete event to update the removeCompletedTask menu item
				var eventData = [{eventName:concord.util.events.slideSorterEvents_eventName_taskMarkedComplete}];
				concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);
			}else{
				//publish the completedTaskRemove event to update the removeCompletedTask menu item
				var eventData = [{eventName:concord.util.events.slideSorterEvents_eventName_completedTaskRemoved}];
				concord.util.events.publish(concord.util.events.slideSorterEvents, eventData);
			}
		}
  },
  
  simulateMenuClick: function(menuItem){
	  if(menuItem!=null){
		var target = menuItem.domNode;
		if(target!=null){
			if(document.dispatchEvent) { // W3C
			    var oEvent = document.createEvent( "MouseEvents" );
			    oEvent.initMouseEvent("click", true, true,window, 1, 1, 1, 1, 1, false, false, false, false, 0, target);
			    target.dispatchEvent( oEvent );
			    }
			else if(document.fireEvent) { // IE
			    target.fireEvent("onclick");
			   }
		}
	  }
	},
	
	removeCompletedAssignments: function(){			    	
		var eventData = [{eventName:concord.util.events.presAssignment_eventName_RemoveCompletedTask}];
		concord.util.events.publish(concord.util.events.assignmentEvents, eventData);
	},
	
//	showActivityDialog:function (){
//		
//		//send showActivity dialog event to slidesorter to invoke slide sorter's showActivityDialog()
//		  var eventData = [{eventName: concord.util.events.sidebarEditorEvents_eventName_showActivityDialog}];
//			concord.util.events.publish(concord.util.events.sideBarEvents, eventData);					
//	},
	
	createActivityDiv: function(){
		var barContainer = null;
		var activityDiv = dojo.byId("id_task_activity_div");
		if(activityDiv){
			activityDiv.style.display = "block";
		}else {
			//create activity
			var activity = pe.scene.bean.getActivity();
			if (activity && g_activity) {
	            var title = activity.getTitle();
	            var id = activity.getId();
	            if (title) {
	                 barContainer = this.createTaskActivity(title, id);
	            }
			}	
		}
		this.createProgressbar(barContainer);
		this.hideActivityDiv();		
		concord.util.resizer.performResizeActions();		
	},
	
	createProgressbar: function(container){
		if(typeof container == 'undefined' || !container){
			container = dojo.create('div', null,  this.domNode); 
			container.id = this.id_task_activity;	
			container.style.display = 'block';
			container.className = 'll_task_activity_div';     		
		}
		//validation code
		var oldContainer = dojo.byId(this.id_progressbar_container);
		if(oldContainer) return;
    	
		var barRoot = dojo.create('div', {id: this.id_progressbar_container},  container); 
		barRoot.style.display = 'block';
		dijit.setWaiRole(barRoot,'application');
		dijit.setWaiState(barRoot,'label',this.nls.ProgressbarLabel); 
		var barDiv = dojo.create('div', null, barRoot); 			
		var theBar = new concord.widgets.DocsProgressBar({id: this.id_progressbar}, barDiv); 
		dijit.setWaiState(theBar.domNode,'label',this.nls.ProgressbarLabel); 
		dojo.attr(theBar.domNode,'tabIndex','0');    	
	},
	
	handleProgressbar: function(data){
		var total = 0;
		var completed = 0;
		var beans = data.beans;    	
		for(t in beans){
			var bean = beans[t];
			var owner = bean.owner;
			var state = bean.state;
			if(this.filterUser){
				if(owner == this.filterUser.id){
					total ++;
					if(state == "complete"){
						completed++;
					}
				}
			}else{
				total ++;
				if(state == "complete"){
					completed++;
				}    			 
			}    		
		}
		if(total != 0){
			this.showActivityDiv();
			this.updateProgressBar(total, completed);			
		}else{
			this.hideActivityDiv();
			this.refresh();
		}
	},
    
	updateProgressBar: function(total, completed){
		if(typeof total == 'undefined' || typeof completed == 'undefined' ){
			return;
		}		
		var progressbar = dijit.byId(this.id_progressbar);
		if(progressbar){
			var bar = dojo.byId(this.id_progressbar_container);
			if(bar){
				if(total == 0){//reset default value
					bar.style.display = 'none';
					return;
				}
 				bar.style.display = 'block';  
				concord.util.resizer.performResizeActions();       		      		
			}    	
			progressbar.update({maximum:total,progress:completed});
		}
	},
        	
	showActivityDiv: function(){
		if(this.filterUser){
			var filterSlides = this.getUserAssignmentSlides (this.filterUser.id); 
			if(!filterSlides || filterSlides.length == 0)
				return;
		}
		
		var activityDiv = dojo.byId("id_task_activity_div");
		if(activityDiv){
			activityDiv.style.display = "block";
			concord.util.resizer.performResizeActions();
		}
	},
	
	hideActivityDiv: function(){
		var activityDiv = dojo.byId("id_task_activity_div");
		if(activityDiv){
			activityDiv.style.display = "none";
			concord.util.resizer.performResizeActions();
		}
	},
	
	showActionsDiv: function(){
		
		if(this.filterUser) return;
		var actionsDiv = dojo.byId(this.id_slidesorter_tool_div);
		if(actionsDiv){
			actionsDiv.style.display = "block";
		}
	},
	
	hideActionsDiv: function(){
		var actionsDiv = dojo.byId(this.id_slidesorter_tool_div);
		if(actionsDiv!=null){
			actionsDiv.style.display = "none";
		}
	},
		
	handleTaskLoadedEvent: function(loaded){
		if(loaded > 0){
			this.createActivityDiv();
			this.updateSlideSorterUI();			
		}
	},
	
	handleTaskUpdatedEvent: function(){
		this.updateSlideSorterUI();	
	},
	
	handleTaskAddedEvent: function(){
		this.showActivityDiv();
		this.updateSlideSorterUI();
	},	
	
	updateSlideSorterUI: function(){
  		var slideManager = this.docEditor.slideSorter;
  		var taskHdl = slideManager.getTaskHdl();
  		if(!taskHdl) return;
  		var beans = taskHdl.store.getAllTaskBeans();		
		// notify the update of progressbar
		concord.task.TaskUtil.updateProgressbar(beans);	
		// notify to refresh filter
		concord.task.TaskUtil.publishRefreshTaskFilter();		
	},
	
	deleteTasks: function(){
  		var slideManager = this.docEditor.slideSorter;
  		var taskHdl = slideManager.getTaskHdl();
  		var beans = taskHdl.store.getAllTaskBeans();
  		if(!beans || beans.length == 0){
  			this.hideActivityDiv();
  		}
  		this.updateSlideSorterUI();
	},	
//	handleSubscriptionForActivityLinkedEvent:function(){
//		this.createActivityDiv();
//	},
	
	
	editorSelected: function(e, isFromFilterToMyAssignments){
		if(!window.pe.scene.bAssignment)return; 
		//var commentsPane = dijit.byId(this.id_comments_pane);
		//var ac = dijit.byId(this.id_top_ac);
		//if( this != ac.selectedChildWidget )
		//{ 
		  var name = e.name;
	      var id = e.id;
	      if (this.filterUser) {
	            if (this.filterUser.id == id && !isFromFilterToMyAssignments) {
	                this._toggleShowFilter(false, null, id, isFromFilterToMyAssignments);
	            }
	            else {
	                this._filterTasks(id, name, isFromFilterToMyAssignments);
	            }
	        }
	        else {
	            this._filterTasks(id, name, isFromFilterToMyAssignments);
	        }
			//window.pe.scene.sidebar.openSlideSorterPane();
			
	},
    _onKeyPress: function(nodeClass, param, e){
        e = e || window.event;
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.keyCode != dojo.keys.ENTER) return; 
		
        if(nodeClass == 'commonsprites commonsprites-filter_close'){				 
        	//close filter
        	this._closeFilter();  			
        }else if(nodeClass == 'll_assign_a_section_cursor'){
        	//create a task or mutiple tasks
        	concord.task.TaskUtil.publishAssignSlides();
        }else if(!nodeClass){
        	//help link
        	//this.openDocumentActivity(param);
        }
    }, 	
	//Task filter UI  
    createTaskFilter: function(){
    	var doc = dojo.doc;
        var filter = dojo.create('div', null,  this.domNode);
        filter.id = this.id_task_filter;
        filter.style.display = 'none';
        
        var editor = dojo.create('div', null,  filter); 
        editor.id = this.id_filter_task_editor;
        editor.className = this.id_filter_task_editor;
        
        var textNode = doc.createTextNode(this.nls.ForAssignee);
        editor.appendChild(textNode);

        var close = dojo.create('div', null,  editor);
        close.id = 'll_task_filter_close';
        close.className = 'commonsprites commonsprites-filter_close';     
        close.title = this.nls.tipsClose;
        dojo.attr(close,'tabindex','0');
        dojo.attr(close,'alt',this.nls.tipsClose);
        dijit.setWaiRole(close, 'button');
        dijit.setWaiState(close, 'label',this.nls.tipsClose);
        var altText = dojo.create('div',{innerHTML:"x"},close);
        dojo.addClass(altText,'ll_commmon_images_alttext');          
        this.connectArray.push(dojo.connect(close, "onclick", dojo.hitch(this, this._closeFilter)));
        this.connectArray.push(dojo.connect(close, "onkeypress", dojo.hitch(this, this._onKeyPress, close.className, null))); 
    },
    
    _filterTasks: function(id, name, isFromFilterToMyAssignments){
    	if(this.toggleSlideAssignmentsMenuItem && this.toggleSlideAssignmentsMenuItem.checked)
    		return;
        //record the filtering id
        this.filterUser = {id: id, name: name};
        //hide 'assign a section' part
        this._toggleShowAAection(false);
        //Show the filter div
        this._toggleShowFilter(true, name, id, isFromFilterToMyAssignments);
    },
    _toggleShowFilter: function(isShown, name, id, isFromFilterToMyAssignments){
        var filter = dojo.byId(this.id_task_filter);
        var filterText = dojo.byId(this.id_filter_task_editor);
        if (!filter || !filterText) 
            return;
        
        if (isShown) {
            filter.style.display = 'block';
            if (filterText) {
            	var displayName = name;
            	if (BidiUtils.isBidiOn())
            		displayName = BidiUtils.addEmbeddingUCC(name);
                var modifiedValue = dojo.string.substitute(this.nls.ForAssignee, [displayName]);
                filterText.firstChild.nodeValue = modifiedValue;
            }
          
  			
  			//update the filterTOMayAssignment if the user filter is the current User
  			if(window.pe.scene.authUser!=null){
				if(id == window.pe.scene.authUser.getId()){
					//if the current task filter user applied is the current user id, toggle filterToMyAssignment menuItem
					if(isFromFilterToMyAssignments!=true){
						this.toggleFilterToMyAssignmentsMenuItem_isFromEditorSelection = true;
						this.simulateMenuClick(this.toggleFilterToMyAssignmentsMenuItem);
					}else{
						//do nothing
					}
					
				}else{ //clear filterToMyAssignmentMenuItem if it is checked.
					if(this.toggleFilterToMyAssignmentsMenuItem.checked == true){
						this.isShowAllAssignmentToBeOverriden = true;
						this.toggleFilterToMyAssignmentsMenuItem_isFromEditorSelection = true;
		            	this.simulateMenuClick(this.toggleFilterToMyAssignmentsMenuItem); //will run showAllAssignments
		            	
		            }if(!this.toggleSlideAssignmentsMenuItemState){
		            	this.toggleFilterToMyAssignmentsMenuItem_isFromEditorSelection = true;
		          		  this.simulateMenuClick(this.toggleSlideAssignmentsMenuItem);
		          	 }
				}
			}
  			//send viewSlideAssignments event to slidesorter to invoke showUserAssignments()
    		  var eventData = [{eventName: concord.util.events.sidebarEditorEvents_eventName_showUserAssignments, userId:id}];
    			concord.util.events.publish(concord.util.events.sideBarEvents, eventData);
        }
        else {
            filter.style.display = 'none';
            this._toggleShowAAection(true);            
            //recover filter text
            if (filterText) {
                filterText.firstChild.nodeValue = this.nls.ForAssignee;
            }
            //finally reset filter editor's id
            this.filterUser = null;
            //this.showAllSlides();
            if(this.toggleFilterToMyAssignmentsMenuItem.checked == true){
            	this.toggleFilterToMyAssignmentsMenuItem_isFromEditorSelection = true;
            	this.simulateMenuClick(this.toggleFilterToMyAssignmentsMenuItem);
            }else{
            	this.toggleFilterToMyAssignmentsMenuItem_isFromEditorSelection = true;
            	this.showAllSlides();
            }
        }
    	this._updateFilteredProgressbar();
    },
    
    _updateFilteredProgressbar: function(){
    	var slideManager = this.docEditor.slideSorter;
    	var taskHdl = slideManager.getTaskHdl(); 
    	concord.task.TaskUtil.updateProgressbar(taskHdl.getAllTasks());   	
    },
    
    _toggleShowAAection: function(isShown){
        var sectionDiv = dojo.byId(this.id_slidesorter_tool_div);
        if (!sectionDiv) 
            return;
        sectionDiv.style.display = isShown ? 'block' : 'none';  
    },
    
    _closeFilter: function()
    {
       	this._toggleShowFilter(false, null); 
       	this.showAllSlides();
    },
    
	// For cleaning up nulls essential variables so nodes can be destroyed freely
	nullifyVariables: function(){
    	this.nls=null;
    	this.docEditor=null; 	
    	this.slideSorterToolDiv=null;
    	this.connectArray=null;   	
    	this.toggleSlideAssignmentsMenuItem=null;
    	this.toggleFilterToMyAssignmentsMenuItem=null;
    	this.toggleSlideAssignmentsMenuItemState=null;    	
    	this.actionMenu = null;
    	this.pMenu = null;
	},
	
	// Called when unloading application
    destroyPane: function(){
    	//1- remove dojo connections
		for(var i=0; i<this.connectArray.length; i++){
			dojo.disconnect(this.connectArray[i]);			
		}			
		//2- destroy objects
		if (this.actionMenu) {
			this.actionMenu.destroyRecursive(false);
		}
		if (this.pMenu) {
			this.pMenu.destroyRecursive(false);
		}
		
		//3- nullify variables
		this.nullifyVariables();
    }    
	
  
});

