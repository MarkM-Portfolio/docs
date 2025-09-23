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

dojo.provide("concord.widgets.sidebar.TaskPane");
dojo.require("dojo.i18n");
dojo.require("dijit.layout.ContentPane");
dojo.require("concord.util.events");
dojo.require("concord.beans.Task");
dojo.require("concord.widgets.sidebar.SideBarUtil");
dojo.require("concord.widgets.DocsProgressBar");
dojo.require("concord.util.date");
dojo.require("concord.util.BidiUtils");

dojo.requireLocalization("concord.widgets.sidebar", "TaskPane");
dojo.declare("concord.widgets.sidebar.TaskPane", [dijit.layout.ContentPane], {
    store: null,
    uistore: null,
    nls: null,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
    docEditor: null,
    docTitle: null,
    filterUser: null,
    selectTaskid:null,
    filterContext:{},//without coediting
    id_task: 'id_task_root_div',
    id_task_filter: 'id_task_filter',
    id_task_activity: 'id_task_activity_div',
    id_filter_task_editor: 'id_task_filter_editor',
    id_task_init: 'id_task_init_notification',
    id_task_existing_activity: 'id_task_existing_activity',
    id_task_error: 'id_task_error',
    id_task_default_info: 'id_task_default_info',
    id_task_feedabck_content: 'id_task_feedabck_content',
    id_assign_a_section: 'id_assign-a-section',
    id_progressbar :"id_progressbar",
    id_progressbar_container :"id_progressbar_container",
    att_task_status: 'taskStatus',
    css_pane_btn_img: 'commonsprites commonsprites-SectionMenu12',
    css_filter_task_editor: 'll_comment_filter_editor',
    css_broken_task_close:'commonsprites commonsprites-taskclose',
    //for story: 41763. Add 'name' attr on div.
    name_task_div: 'name_task_div',
    bReadOnly: false,
    lazyLoaded: false,
    

    MENU_STATUS_MESSAGE: "updateMenuStatus",
    MENU_HIDE_BROKENTASK: "hide_broken_task",
    MENU_DISABLE_BROKENTASK: "disable_broken_task",
    TASK_LOADED_STATUS: "taskLoadedStatus",
    id_assignment_pane: 'sidebar_assignment_pane',
    id_assignment_pane_img: 'id_assignment_menu_img',
    id_assignment_menu: 'id_assignment_menu_context',
    id_broken_task_hint: 'id_broken_task_hint',
    id_broken_task_help: 'id_broken_task_help',    
    pMenu: null,
    connectArray : [],
    _hasBrokenTask: false,
    isBidi: BidiUtils.isBidiOn(),
    
    postCreate: function(){
        this.inherited(arguments);
        this.nls = dojo.i18n.getLocalization("concord.widgets.sidebar", "TaskPane");
        this.docEditor = pe.scene;
        this._buildPane();
        this._regEvent();
    },
    
    _buildPane: function(){
        this._initAsyncPane();
        var taskHdl = this.docEditor.getTaskHdl();
        if ((taskHdl == null) || (taskHdl.store == null) || (typeof taskHdl.store == 'undefined')){
        	this._initPane(false);
        	if (window.pe.scene.docType == "sheet"){
        		this.lazyLoaded = true;
        		this._initLazyContentPane();        		
        	}
        }
        else
        	this._initPane(taskHdl.store.loaded);
    },
    
    _regEvent: function(){
        concord.util.events.subscribe(concord.util.events.taskEvents_eventName_taskAdded, this, 'addTask');
        concord.util.events.subscribe(concord.util.events.taskEvents_eventName_taskUpdated, this, 'updateTask');
        concord.util.events.subscribe(concord.util.events.taskEvents_eventName_taskDeleted, this, 'deleteTasks');
        concord.util.events.subscribe(concord.util.events.taskEvents_eventName_taskSelected, this, 'setTaskSelected');
        concord.util.events.subscribe(concord.util.events.taskEvents_eventName_taskCreateEnabled, this, 'enableCreateTask');
        concord.util.events.subscribe(concord.util.events.sidebarEditorEvents_eventName_editorSelected, this, 'editorSelected');
        concord.util.events.subscribe(concord.util.events.activity_linked, this, 'setSelectedActivity');
    },
    
    refresh: function(){
        //update content
        concord.widgets.sidebar.TaskPane.resizeTaskArea();
    },
    
    _initErrorPane: function(info){
        var initRootDiv = dojo.byId(this.id_task_error);
        if (initRootDiv) {
        	this._toggleErrorPane(true);
            return;    	
        }
    	var initRootDiv = dojo.create('div', {id: this.id_task_error},  this.domNode);
        initRootDiv.style.display = 'block';   
        var infoDiv = dojo.create('div', null,  initRootDiv);
        dojo.addClass(infoDiv, 'll_default-information-text');
        this.createLabel(info,infoDiv);	    	
    },
    
    _initAsyncPane: function(){
    	 var imgContainer = dojo.create('div', {id:this.id_task_init_imgid}, this.domNode);
    	 imgContainer.style.display = 'block';
    	 dojo.subscribe(this.TASK_LOADED_STATUS, imgContainer, function(e){
              imgContainer.style.display = 'none';
    	 }); 
    	 dojo.addClass(imgContainer,'ll_sidebar_asyncImg_container');	 
    	 var imgDiv = dojo.create('span', null, imgContainer);
    	 dojo.addClass(imgDiv,'ll_sidebar_asyncImg');   	 
    },
    
    _initLazyContentPane: function(){ 
    	 dojo.publish(this.TASK_LOADED_STATUS, [true]);     	   	   
    	 this._initCommonPart();
         this._initDataPart();  	   	
    },
    
    _initCommonPart: function(){
    	 //hide error message if it exists
    	 this._toggleErrorPane(false);
	            
    	 if (window.pe.scene.docType == "sheet")
        	this.createAssignASection(this.nls.AssignCells);
    	 else
        	this.createAssignASection(this.nls.AssignASection);
	            	
    	 this.createTaskFilter();
    	 //Create broken task hint information, when loading completes
    	 this.createBrokenTaskHint();   	
    },
    
    _initDataPart: function(){
    	 //dealing with activity
    	 var activity = pe.scene.bean.getActivity();
    	 //Get current doc's title
    	 this.docTitle = pe.scene.bean.getTitle(); 
    	 if (!activity && g_activity) {
    	 	if (window.pe.scene.docType == "sheet")
    	 		this.createInitInformation(this.nls.SelectAnActivityHintSheet, this.nls.SelectAnActivity);
    	 	else
    	 		this.createInitInformation(this.nls.SelectAnActivityHint, this.nls.SelectAnActivity);
    	 	if (this.docTitle) {
    	 		this.createActivityFeedback(false);
    	 	}
    	 }else {
    	 	if (this.docTitle) {
    	 		this.createActivityFeedback(true);
    	 	}
    	 }
    	 this._initActivityProgressbar(activity);     	      	
    },
    
    _fillContentPaneData: function(taskHdl){
    	 if (typeof taskHdl.getAllTasks == 'undefined') {
        	this._initErrorPane(this.nls.TaskSpreadsheetHint);
        	return;//if it's sheet, just return
    	 }    
    	 var tasks = taskHdl.getAllTasks();
    	 if (tasks && tasks.length) {
        	var actFeedback = dojo.byId(this.id_task_default_info);
        	if(actFeedback) {
        		this._toggleShowActivityFeedback(false);
        	}		
	        this.loadAllTasks(tasks);      	
        	window.setTimeout(dojo.hitch(this, function(){
        		this.updateProgressBar();
        	}),200);        	       	              	                
    	 }    	 	
    },
    
    _initContentPane: function(taskHdl){
    	 dojo.publish(this.TASK_LOADED_STATUS, [true]);     	
    	 //loading succeeds  	 
    	 if (typeof taskHdl.getAllTasks == 'undefined') {
        	this._initErrorPane(this.nls.TaskSpreadsheetHint);
        	return;//if it's sheet, just return
    	 }
    	 this._initCommonPart();
         	            
    	 var tasks = taskHdl.getAllTasks();
    	 if (tasks && tasks.length) {
    	 	//dealing with activity
    	 	var activity = pe.scene.bean.getActivity();
    	 	//Get current doc's title
    		this.docTitle = pe.scene.bean.getTitle();      	 	
        	if (this.docTitle) {
	            this.createActivityFeedback(false);
        	}
	        this.loadAllTasks(tasks); 
	        this._initActivityProgressbar(activity);       	
        	window.setTimeout(dojo.hitch(this, function(){
        		this.updateProgressBar();
        	}),200);         	        	         	       	              	                
    	 }else {	    	
	        this._initDataPart();//There is no assignment in Docs	   			    	
    	 }	            	
    }, 
    _initActivityProgressbar: function(activity){
    	var barContainer = null;        	
    	if (activity && g_activity) {
    		var title = activity.getTitle();
    		var id = activity.getId();
    		if (title) {
    			barContainer = this.createTaskActivity(title, id);
    			this.createBrokenTaskHelpLink(id);	                  
    		}
    	}        	
    	this.createProgressbar(barContainer);		
    },
    
    _initPane: function(loaded){
    	if (loaded > 0){	
	        var taskHdl = this.docEditor.getTaskHdl();
	        if (typeof taskHdl == 'undefined' || taskHdl == null || typeof taskHdl.store == 'undefined' || taskHdl.store == null) {
	        	  concord.util.events.subscribe(concord.util.events.taskEvents_eventName_taskLoaded, this, '_initPane');
	        }else{
	        	if (this.lazyLoaded){
	        		this._fillContentPaneData(taskHdl);
	        	}else{
	        		this._initContentPane(taskHdl);  
	        	}	                 
	            this._initReadOnlyMode();
	        }
    	}else if ((loaded == -1) || (loaded == 0)){// loading or not load
    		concord.util.events.subscribe(concord.util.events.taskEvents_eventName_taskLoaded, this, '_initPane');
    	}else{
    		//Even failed, task panel will also register the listener
    		concord.util.events.subscribe(concord.util.events.taskEvents_eventName_taskLoaded, this, '_initPane');
    		//Tasks in doc will be shown here in a grey style
	        dojo.publish(this.TASK_LOADED_STATUS, [false]);    
	        this._initErrorPane(this.nls.TaskLoadedFail);		
	        //this._initContentPane(false);   
    	}
    },
    //*********Following methods are for context menu of task pane*********
    
    // called by container as to add widgets on container button
    buildContextMenu: function(){
        var paneBtn = document.getElementById(this.id_assignment_pane + '_button');
        if (paneBtn) {
            var paneBtnTitle = dojo.byId(this.id_assignment_pane + '_button_title');
            
            var imgBtn = document.createElement('div');
            var btnId = 'll_pane_btn_img_tasks_id';
            imgBtn.id = btnId;
            imgBtn.className = this.css_pane_btn_img;
            imgBtn.title = this.nls.tipsTaskMenu;
            dojo.attr(imgBtn,'tabindex','0');
            dijit.setWaiRole(imgBtn,'button');
            dijit.setWaiState(imgBtn,'label',this.nls.tipsTaskMenu);
            dojo.attr(imgBtn,'alt',this.nls.tipsTaskMenu);
            var altText = dojo.create('div',{innerHTML:"&#9660;"},imgBtn);
            dojo.addClass(altText,'ll_commmon_images_alttext');           
            dojo.place(imgBtn, paneBtnTitle.parentNode, "after");
            var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
            var pMenu = this.pMenu = new dijit.Menu({
                targetNodeIds: [btnId],
                id: this.id_assignment_menu,
                leftClickToOpen: true,
                dir: dirAttr
            });
            this.connectArray.push(dojo.connect(pMenu, "onClose", dojo.hitch(this, function(){
            	imgBtn.focus();
            })));            
            this.connectArray.push(dojo.connect(imgBtn, "onkeydown", dojo.hitch(this, function(e){
                if (e.altKey || e.ctrlKey || e.metaKey) return;
                if (e.keyCode != dojo.keys.ENTER && 
                e.keyCode != dojo.keys.RIGHT_ARROW && 
                e.keyCode != dojo.keys.DOWN_ARROW) return; 
                
                dijit.popup.open({around:imgBtn , popup:this.pMenu});
                this.pMenu.focusFirstChild();  
                dojo.stopEvent(e);          	
            })));
            this.connectArray.push(dojo.connect(this.pMenu.domNode, "onkeydown", dojo.hitch(this, function(e){
            	if (e.altKey || e.ctrlKey || e.metaKey) return;
            	if (e.keyCode != dojo.keys.ESCAPE) return; 
            	dijit.popup.close(this.pMenu);
            	dojo.stopEvent(e); 
            	imgBtn.focus();         	
            })));        
            dojo.addClass(pMenu.domNode,"lotusActionMenu");    
            //D38660 JMT - memory leak fix
            pMenu.domNode.style.display ='none';
            document.body.appendChild(pMenu.domNode);
            
            var _parent = this;
            var _ctxMenuArray =  new Array();
            var viewTaskMenuItem = new dijit.CheckedMenuItem({
                label: this.nls.ViewMyAssignments,
                onChange: function(checked){
    	            if(checked){ 
                        _parent.viewMyAssignments(); 
                    }else {
                        _parent._closeFilter();
                    }
                    dijit.popup.close(_parent.pMenu);
               },
               dir: dirAttr
            });
            _ctxMenuArray.push(viewTaskMenuItem);
            
            dojo.subscribe(this.MENU_STATUS_MESSAGE, viewTaskMenuItem, function(e){
            	 viewTaskMenuItem.attr('checked',e);
            }); 
            
            pMenu.addChild(viewTaskMenuItem);
            
            var viewBTaskMenuItem = new dijit.CheckedMenuItem({
               label: this.nls.ViewBrokenAssignments,
               disabled: pe.scene.isDocViewMode() ? true : (this._hasBrokenTask ? false : true),
               onChange: function(checked){
                    _parent.hideBrokenAssignments(checked); 
                    _parent.filterContext.showBrokenTask = !checked;
                    dijit.popup.close(_parent.pMenu);
               },
               dir: dirAttr
            });
                      
            dojo.subscribe(this.MENU_HIDE_BROKENTASK, viewBTaskMenuItem, function(e){
            	 viewBTaskMenuItem.attr('checked',e);
            });
            
            dojo.subscribe(this.MENU_DISABLE_BROKENTASK, viewBTaskMenuItem, function(e){
            	 viewBTaskMenuItem.attr('disabled',e);
            });
              
            pMenu.addChild(viewBTaskMenuItem); 
            
            var removeCTaskMenuItem = new dijit.MenuItem({
                label: this.nls.RemoveCompletedAssignments,
                disabled: pe.scene.isDocViewMode() ? true: false,
                onClick: function(){
                	_parent.deleteCompletedTasks();
                	dijit.popup.close(_parent.pMenu);
                },
                dir: dirAttr
            });
            pMenu.addChild(removeCTaskMenuItem);
            _ctxMenuArray.push(removeCTaskMenuItem);
                   
            dojo.subscribe(concord.util.events.taskEvents_eventName_taskLoaded, _ctxMenuArray, function(loaded){
            	var disable = ( loaded > 0 ) ? false : true;
            	for( var _m =0; _m< _ctxMenuArray.length; _m++){
            		_ctxMenuArray[_m].attr('disabled',disable);
            	}
            });                     
            
            pMenu.startup();
        }
    },

    // handler of filtering by my assignments
    viewMyAssignments: function(){
        var id = pe.authenticatedUser.getId();
        var name = pe.authenticatedUser.getName();
        this._filterTasks(id, name);
        
        dojo.publish(concord.util.events.sidebar_user_selected, [id]);        
    },
    //hide broken tasks
    hideBrokenAssignments: function(bHide){
        var rootDiv = dojo.byId(this.id_task);
        if (rootDiv) {
            this._toggleShowBrokenTasks(!bHide);//close error message for broken tasks   
            dojo.publish(this.MENU_HIDE_BROKENTASK, [bHide]);                  	
            var childs = rootDiv.childNodes;
            for (var i = childs.length; i--; i>0) {
                var node = childs[i];
                var taskStatusValue = node.getAttribute(this.att_task_status); 
                if(taskStatusValue && taskStatusValue == 'broken'){                       
                	  this._toggleShowTask(node, !bHide);
                }
            }
            if(bHide){
            	if(!this.hasDisplayedTasks()){
            		this._toggleShowActivityFeedback(true);
            	}
            }else{
            	this._toggleShowActivityFeedback(false);
            }
        	//refresh task panel
        	this.refresh();            
            //refresh editor
        	if(this.filterUser){
        	 	this.refreshFilterList();
        	}            
        }    	
    },
    
    //Delete completed tasks. 
    deleteCompletedTasks: function(){
        var taskHdl = this.docEditor.getTaskHdl();
        if (typeof taskHdl != 'undefined') {
            taskHdl.deleteTasks('complete');
        }
    },
    
    //*********Following methods respond to task -load/add/delete/update events*********
    
    //load all tasks
    loadAllTasks: function(e){
        var store = new Array();
	    var uitask = null;
	    var bFlag = false;
	    for(var i= 0 ;i< e.length; i++){
	   	   uitask = new concord.widgets.sidebar.UITask();
	   	   dojo.mixin(uitask, e[i]);	   	   
	   	   if(!this.isTaskExisted(uitask.getId())){
	   	   	  uitask.setBroken(true);
	   	   	  bFlag = true;
	   	   }	   	 	   	   
	   	   store.push(uitask);
	    }
        if(bFlag){   
        	this._hasBrokenTask = true;	
        	dojo.publish(this.MENU_DISABLE_BROKENTASK, [false]); 
        	window.setTimeout(dojo.hitch(this, function(){
        		this._toggleShowBrokenTasks(true);
        	}),200);           	        		
        }	    
    	if(this.uistore == null)
    		this.uistore = new concord.widgets.sidebar.TaskUIStore(store);
    	  
        var context = this.docEditor.getTaskHdl();
        var compare = context.compare;       
        var taskList = this.uistore.getSortedTasks(context, compare);        
        //Create task ui based on ui model
        this.reloadTaskUI(taskList);
    },
    //add a task to UI 
    addTask: function(e){
        //remove init information
        var initDiv = dojo.byId(this.id_task_init);
        if (initDiv) {
            this._toggleShowActivityInit(false);
        }
        var initActivityFeedback = dojo.byId(this.id_task_default_info);
        if (initActivityFeedback) {
            this._toggleShowActivityFeedback(false);
        }
        var rootDiv = dojo.byId(this.id_task);
        if (!rootDiv) {
            rootDiv = this.createTaskRootDivUI();
        }
        var uitask = new concord.widgets.sidebar.UITask();
	   	dojo.mixin(uitask, e);
        //update ui store  
        if(this.uistore == null){
        	this.uistore = new concord.widgets.sidebar.TaskUIStore([uitask]);
        }else{   
        	var dupTask = this.uistore.isExistedTask(uitask);
        	if(dupTask){
        		//remove the duplicated task in assignment panel
        		this.uistore.removeTask(uitask.getId()); 
        		console.log("Duplicated task is removed.");             	 
        		this.updateBrokenTask(uitask);
        	}       
        	this.uistore.addTask(uitask);        	
        }
        
        var context = this.docEditor.getTaskHdl();
        var compare = context.compare;       
        var taskList = this.uistore.getSortedTasks(context, compare);        	
        //Create task ui based on ui model
        this.reloadTaskUI(taskList);
                                   
        if(this._hasBrokenTask && !this.filterContext.showBrokenTask){
        	this.hideBrokenAssignments(true);
        }
        if(this.filterUser){
        	 this.refreshFilterList();
        }else{
        	//update progressbar
        	this.updateProgressBar();        	
        }
    },
    //update a task by its taskId
    updateTask: function(e){
        var rootDiv = dojo.byId(this.id_task);
        if (rootDiv == null) 
            return;
        //update data in ui store   
        var uitask = new concord.widgets.sidebar.UITask();
	   	dojo.mixin(uitask, e); 
        this.uistore.updateTask(uitask); 
        this.updateTaskUI(uitask, rootDiv);
        //After modification, if no broken task, disable menu
        this.updateBrokenTask(uitask);
        if(this.filterUser){
        	 this.refreshFilterList();
        }else{
        	//update progressbar
        	this.updateProgressBar();
        }        
    },
    
    //delete a task or a few tasks
    deleteTasks: function(){
        var rootDiv = dojo.byId(this.id_task);
        if (!rootDiv) 
            return;
        var taskIds = arguments;
        for (var i = 0; i < taskIds.length; i++) {
            var taskId = taskIds[i];
            //delete task in ui store
            this.uistore.removeTask(taskId);
            
            var taskDiv = dojo.byId(taskId);
            if (taskDiv) {
                dojo.destroy(taskDiv); 
            } 
        }
        var existTask = this.hasDisplayedTasks();
        if (!existTask) {
            this._toggleShowActivityFeedback(true);
        }
        if(this.filterUser){
        	 this.refreshFilterList();
        }else{ 
        	//update progressbar
        	this.updateProgressBar(); 
        }      
    },
    
    enableCreateTask: function(bEnabled){
    	if(this.bReadOnly)
    		bEnabled = false;
    	
    	var sectionRoot = dojo.byId(this.id_assign_a_section);
    	if (sectionRoot){
    		if (bEnabled)
    			dojo.removeClass(sectionRoot, 'll_disable_assign_a_section');
    		else
    			dojo.addClass(sectionRoot, 'll_disable_assign_a_section');
    			
    		var section = dojo.byId("ll_assign_a_section_cursor");   
    		var assign = null;
    	 	if (window.pe.scene.docType == "sheet")
        		assign = this.nls.AssignCells;
    	 	else
    	 		assign = this.nls.AssignASection;         		  
        	var disabledAssign = dojo.string.substitute(this.nls.AssignmentButton, [assign]);				
    		dijit.setWaiState(section,'label', bEnabled ? '' : disabledAssign);
    	}
    	
    },
    
    enableExistingActivity: function(enable) {
    	if(this.bReadOnly)
    		enable = false;

    	var section = dojo.byId(this.id_task_existing_activity);
    	if (section){
    		if (enable)
    			dojo.addClass(section, 'll_using-existing-activity');
    		else
    			dojo.removeClass(section, 'll_using-existing-activity');
    	}
    },
    
    updateBrokenTask: function(task){  	
        if(this._hasBrokenTask){  
        	 if(!task.isBroken() && !this.uistore.hasBrokenTask()){   		          	
     		 	this._hasBrokenTask = false;              	   		          	
        	 	this._toggleShowBrokenTasks(false);
        	 	dojo.publish(this.MENU_DISABLE_BROKENTASK, [true]);       	 	
        	 }        	       
        }else{    	
        	if(task.isBroken()){
        		this._hasBrokenTask = true;
        	 	this._toggleShowBrokenTasks(true);
        	 	dojo.publish(this.MENU_DISABLE_BROKENTASK, [false]); 
        	}
        }
    },
    //Show selected activity 
    setSelectedActivity: function(){
        if (!g_activity) 
            return;
        
        var activityBean = pe.scene.bean.getActivity();
        var title = activityBean.getTitle();
        var id = activityBean.getId();
        if (title && this.docTitle) {
            this._toggleShowActivityInit(false);
            var afbDiv = dojo.byId(this.id_task_default_info);
            if (afbDiv) {
                var existTask = this.hasDisplayedTasks();
                if(!existTask){
                    this._toggleShowActivityFeedback(true);
                }
            }
            var activityDiv = dojo.byId(this.id_task_activity);
            if (activityDiv) {
                this._toggleShowActivity(true);
            }
            else {
                var barContainer = this.createTaskActivity(title, id);
                this.createProgressbar(barContainer);
                this.createBrokenTaskHelpLink(id);
            }
        }
    },
    
    //*********Following methods are for task pane UI*********
    
    createTaskUI: function(eTask, rootDiv, bBatch){
    	if(typeof eTask == 'undefined' || !eTask) return;
        var taskDiv = document.createElement('div');
        taskDiv.id = eTask.getId();
        taskDiv.className = 'll_task-row-style';
        //for story: 41763. Add 'name' attr on div.
        dojo.attr(taskDiv, 'name', this.name_task_div);
        dojo.attr(taskDiv,'tabIndex','0');		
        //Set task status in task div in order to delete it conveniently
        this.updateTaskUIStatus(eTask, taskDiv);
        
        this.connectArray.push(dojo.connect(taskDiv, "onclick", dojo.hitch(this, this.selectTask, taskDiv.id)));
        this.connectArray.push(dojo.connect(taskDiv, "dblclick", dojo.hitch(this, this.selectTask, taskDiv.id)));        
        this.connectArray.push(dojo.connect(taskDiv, "onkeydown", dojo.hitch(this, this._onKeyPress, taskDiv.className, taskDiv.id)));
        this.connectArray.push(dojo.connect(taskDiv, "onmouseover", dojo.hitch(this, this.mouseOverEffect, taskDiv)));
        this.connectArray.push(dojo.connect(taskDiv, "onmouseout", dojo.hitch(this, this.mouseOutEffect, taskDiv)));
        this.connectArray.push(dojo.connect(taskDiv, "onfocus", dojo.hitch(this, this.mouseOverEffect, taskDiv)));
        this.connectArray.push(dojo.connect(taskDiv, "onblur", dojo.hitch(this, this.mouseOutEffect, taskDiv))); 
               
        //append it to task root div
        rootDiv.appendChild(taskDiv);
        //refresh task panel
        if (!bBatch)
        	this.refresh();
        //Create sections of task
        this.createTaskSectionsUI(eTask, taskDiv);
    },
    openDocumentActivity: function(id){
        var theUrlPrefix = "${0}/service/html/mainpage#activitypage,${1}";
        var theUrl = dojo.string.substitute(theUrlPrefix, [g_activitiesUrl, id]);
        var win = window.open(theUrl);
        win.focus();
    },
    updateTaskUI: function(eTask){
        var updateDiv = dojo.byId(eTask.getId());
        if (updateDiv) {
            this.deleteChild(updateDiv);
            //update task status
            this.updateTaskUIStatus(eTask, updateDiv);
            //create new sections
            this.createTaskSectionsUI(eTask, updateDiv);
        }
    },
    //Update task status on task div, when create or update a task
    updateTaskUIStatus: function(eTask, taskDiv){
    	//Set task id in task div in order to filter tasks conveniently
        dojo.attr(taskDiv, 'taskOwnerId', eTask.getOwner());        	
    	if(eTask.isBroken()){
        	dojo.attr(taskDiv, this.att_task_status, "broken");   	
    		return;
    	}
        //update task status in task div
        if (eTask.getState() == 'complete') {
        	dojo.attr(taskDiv, this.att_task_status, "complete");
        } else {
        	dojo.attr(taskDiv, this.att_task_status, "new");        	
        } 

    },   
    
    //Select a task & setFocus to the task
    selectTask: function(taskId){
        var taskHdl = this.docEditor.getTaskHdl();
        if (typeof taskHdl != 'undefined') {
            taskHdl.selectTask(taskId);
            this.notifySelectionChanged(taskId);            
        }
    },
    
    notifySelectionChanged: function(taskId){
        var taskDiv = taskId ? dojo.byId(taskId) : null;
        if(taskDiv){
            var stateAttr =  taskDiv.getAttribute(this.att_task_status); 
            if(stateAttr && stateAttr == 'broken'){
                return;
            }
            dojo.addClass(taskDiv,'ll_task_selected_row_style');         
        }    	
        
        if(taskId != this.selectTaskid){
        	if (this.selectTaskid){
	        	var staskDiv = dojo.byId(this.selectTaskid);
	        	if(staskDiv){
	            	dojo.removeClass(staskDiv,'ll_task_selected_row_style');    	
	        	}
        	}
    	}
        this.selectTaskid = taskId;  
    },

    
    createActivity: function(){
    	if(this.bReadOnly)
    		return;
    		
        var editor = pe.lotusEditor;
        editor.execCommand('selectActivity');
    },
    // handler of the editor selected
    editorSelected: function(e){
        var name = e.name;
        var id = e.id;
        if (this.filterUser) {
            if (this.filterUser.id == id) {
                this._toggleShowFilter(false, null);
            }
            else {
                this._filterTasks(id, name);
            }
        }
        else {
            this._filterTasks(id, name);
        }
    },
    //Selected task in document triggers this method
    setTaskSelected: function(e){
    	var taskDiv = dojo.byId(e.taskId);
    	var selected = e.selected;
    	if(selected){
    		this.notifySelectionChanged(e.taskId);
    	}else{
    		if(e.taskId == this.selectTaskid){
			this.notifySelectionChanged(null);
    		}
    	}    	
    },
    //Assign a section
    createDocumentTask: function(){ 
    	if(this.bReadOnly)
    		return;
    		
        var editor = pe.lotusEditor;
        var sectionRoot = dojo.byId(this.id_assign_a_section);
        if (!dojo.hasClass(sectionRoot, 'll_disable_assign_a_section'))
        	editor.execCommand('assignTask');
    },
    //handler of task's mouse over event
    mouseOverEffect: function(taskDiv){
    	dojo.addClass(taskDiv,'ll_task_hovered_row_style');
    },
    //handler of task's mouse out event
    mouseOutEffect: function(taskDiv){
        dojo.removeClass(taskDiv,'ll_task_hovered_row_style');
    },
    
    //*********Following are utility methods *********    
    
    //Is the task existed in document?
    isTaskExisted: function(taskId){
        var taskHdl = this.docEditor.getTaskHdl();
        if (typeof taskHdl != 'undefined') {
           return taskHdl.isTaskExisted(taskId);
        }
        return false;
    }, 
    //When remove a task, we 'd know whether there is any displayed tasks in assignment pane.
    //If not, we will show hint information.   
        
    hasDisplayedTasks: function(){
        //show all related tasks
        var rootDiv = dojo.byId(this.id_task);
        if (rootDiv) {
            var childs = rootDiv.childNodes;
            if (!childs) { return false;}            
            var shownCount = 0;
            for (var i = childs.length; i--; i>0) {
                var node = childs[i];
                if(node.style.display != 'none'){
                    shownCount++;
                }
            }
            if(shownCount){ return true;}
            else {return false;}
        } 
        return false;  	
    },
    //Utility method in order to delete children dom nodes
    deleteChild: function(parent){
        var childs = parent.childNodes;
        for (var i = childs.length; i--; i>0) {
            dojo.destroy(childs[i]);
        }
    },
    
    getDecorateTaskTitle: function(eTask){
        var title = (!this.isBidi) ? eTask.getTitle() : BidiUtils.addEmbeddingUCC(eTask.getTitle());
        if (eTask.getTypeId() == "delegationsection") {
            if (eTask.getState() == "complete") {
                title = dojo.string.substitute(this.nls.writeDesc, [title]);
            }
            else 
                if (eTask.getState() == "rejected") {
                    title = dojo.string.substitute(this.nls.reworkDesc, [title]);
                }
                else {
                    title = dojo.string.substitute(this.nls.writeDesc, [title]);
                }
        }
        else 
            if (eTask.getTypeId() == "reviewsection") {
                title = dojo.string.substitute(this.nls.reviewDesc, [title]);
            }
        return title;
    },

    _onKeyPress: function(nodeClass, param, e){
        e = e || window.event;
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        if (e.keyCode != dojo.keys.ENTER) return; 
		
        if(nodeClass == 'll_task-row-style'){
        	this.selectTask(param);
        }else if(nodeClass == 'commonsprites commonsprites-filter_close'){				 
        	//close filter
        	this._closeFilter();  			
        }else if(nodeClass == 'll_assign_a_section_cursor'){
        	//create a task
        	this.createDocumentTask();
        }else if(nodeClass == this.css_broken_task_close){
        	//hide broken tasks
        	this.hideBrokenAssignments(param);			
        }else if(nodeClass == 'll_using-existing-activity'){
        	//create activity
        	this.createActivity();
        }else if(!nodeClass){
        	//help link
        	//this.openDocumentActivity(param);
        }
    }, 
    
    updateProgressBar: function(total, completed){
    	var progressbar = dijit.byId(this.id_progressbar);
        if(progressbar){
        	if(typeof total == 'undefined' || typeof completed == 'undefined' ){
        		if(!this.uistore) return;
        		total = this.uistore.getTotalCount();
        		completed = this.uistore.getCompletedCount();
        	}
        	var bar = dojo.byId(this.id_progressbar_container);
        	if(bar){
        		if(total == 0){//reset default value
        			bar.style.display = 'none';
        			return;
        		}
        		bar.style.display = 'block';  
        		concord.widgets.sidebar.TaskPane.resizeTaskArea();        		      		
        	}    	
        	progressbar.update({maximum:total,progress:completed});
        }
    },
    
    //*********Following methods are for filtering feature of task pane*********
    refreshFilterList: function(){
        this._filterTasks(this.filterUser.id, this.filterUser.name);
    },
    
    reloadTaskUI: function(taskList){
        var rootDiv = dojo.byId(this.id_task);
        if(rootDiv){
        	dojo.destroy(rootDiv);//remove all tasks in pane
        }
        rootDiv = this.createTaskRootDivUI();  
        dojo.style(rootDiv, 'display', 'none');      
        for (var i = 0; i < taskList.length; i++) {
            this.createTaskUI(taskList[i], rootDiv, true);
        }
        dojo.style(rootDiv, 'display', 'block');    
        this.refresh();	
        if (this.selectTaskid)
        	this.notifySelectionChanged(this.selectTaskid);

    },
    
    opened: function()
    {
    	this._closeFilter();
    	dojo.publish(concord.util.events.sidebar_user_deselected, null);
    },

    _filterTasks: function(id, name){
        //record the filtering id
        this.filterUser = {id: id, name: name};
        //hide 'assign a section' part
        this._toggleShowAAection(false);
        //Show the filter div
        this._toggleShowFilter(true, !this.isBidi ? name : BidiUtils.addEmbeddingUCC(name));

        //show all related tasks
        var rootDiv = dojo.byId(this.id_task);
        if (rootDiv) {
            var childs = rootDiv.childNodes;
            var shownCount = 0;
            var shownCompletedCount = 0;
            var showBTask = this.filterContext.showBrokenTask;
            
            for (var i = childs.length; i--; i>0) {
                var node = childs[i];
                if(!showBTask){
                	var stateAttr =  node.getAttribute(this.att_task_status); 
                	if(stateAttr && stateAttr == 'broken'){
                	  	this._toggleShowTask(node, false);
                	  	continue;
                	}                	
                }
                
                var taskOwner = node.getAttribute('taskOwnerId');
                if (taskOwner && taskOwner == id) {
                    this._toggleShowTask(node, true);
                    shownCount++;
                    var taskStatus = node.getAttribute('taskstatus');
                    if(taskStatus && taskStatus == 'complete')
                    	shownCompletedCount++;
                }
                else {
                    this._toggleShowTask(node, false);
                }
            }
            var dInfoDiv = dojo.byId(this.id_task_default_info);
            if(dInfoDiv){
            	 this._toggleShowActivityFeedback(!shownCount);
            }
            //update progressbar            
            if(shownCount != 0){
            	this.updateProgressBar(shownCount,shownCompletedCount); 
            }else{
            	this.updateProgressBar(0,0);
            }
        }else{
            var dInfoDiv = dojo.byId(this.id_task_default_info);
            if(dInfoDiv){
            	this._toggleShowActivityFeedback(true);        	 		
            }
        }
    },
    
    _closeFilter: function()
    {
       	var id = this.filterUser? this.filterUser.id : null;
    	dojo.publish(concord.util.events.sidebar_user_deselected, [id]);
       	this._toggleShowFilter(false, null);
    },
	    	
    _toggleShowFilter: function(isShown, name){
        var filter = dojo.byId(this.id_task_filter);
        var filterText = dojo.byId(this.id_filter_task_editor);
        if (!filter || !filterText) 
            return;
                	
        //udpate menu item
        if(this.filterUser){
            	var id = pe.authenticatedUser.getId();
            	if(this.filterUser.id == id){
            	    dojo.publish(this.MENU_STATUS_MESSAGE, [isShown]);
            	}else{
            		dojo.publish(this.MENU_STATUS_MESSAGE, [false]); 
            	}
        }    
        var rootDiv = dojo.byId(this.id_task);    
        if (isShown) {
            if (rootDiv) {
            	dijit.setWaiRole(rootDiv,'alert');
            }        		
            filter.style.display = 'block';
            if (filterText) {
                var modifiedValue = dojo.string.substitute(this.nls.ForAssignee, [name]);
                filterText.firstChild.nodeValue = modifiedValue;
            }
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
            if (rootDiv) {
            	dijit.setWaiRole(rootDiv,'application');            	
                var showBTask = this.filterContext.showBrokenTask;
                var childs = rootDiv.childNodes;
                for (var i = childs.length; i--; i>0) {
                    var node = childs[i];
                    if(!showBTask){
                		var stateAttr =  node.getAttribute(this.att_task_status); 
                		if(stateAttr && stateAttr == 'broken'){
                	  		this._toggleShowTask(node, false);
                	  		continue;
                		}                	
                	}
                    this._toggleShowTask(node, true);
                }
            }
            //update progressbar
            this.updateProgressBar();                     
            //toggle activity feedback UI
            var dInfoDiv = dojo.byId(this.id_task_default_info);
            if (dInfoDiv) {
            	  //if using an activity exists, don't show the activity ui feedback information
            	  var initDiv =  dojo.byId(this.id_task_init);
            	  var initExist = 0;
            	  if(initDiv){
            	  	 if(initDiv.style.display == 'block'){
            	  	 	  initExist = 1;
            	  	 }
            	  }
                if (this.hasDisplayedTasks() || initExist) {
                    this._toggleShowActivityFeedback(false);
                }
                else {
                    this._toggleShowActivityFeedback(true);
                }
            }
        }
    },
    
    _toggleErrorPane: function(isShown){
        var initRootDiv = dojo.byId(this.id_task_error);
        if (!initRootDiv) 
            return;
        initRootDiv.style.display = isShown ? 'block' : 'none';     	       	
    },    
    
    _toggleShowTask: function(taskDiv, isShown){
        if (!taskDiv) 
            return;
        taskDiv.style.display = isShown ? 'block' : 'none'; 
    },
    
    _toggleShowAAection: function(isShown){
        var sectionDiv = dojo.byId(this.id_assign_a_section);
        if (!sectionDiv) 
            return;
        sectionDiv.style.display = isShown ? 'block' : 'none';  
    },
    
    _toggleShowActivityInit: function(isShown){
        var iDiv = dojo.byId(this.id_task_init);
        if (!iDiv) 
            return;
        iDiv.style.display = isShown ? 'block' : 'none';           
    },
    
    _toggleShowActivityFeedback: function(isShown){
        var dInfoDiv = dojo.byId(this.id_task_default_info);
        if (!dInfoDiv) 
            return;
        dInfoDiv.style.display =  isShown ? 'block' : 'none';

        var content =  dojo.byId(this.id_task_feedabck_content);
        if(content){
            if(this.filterUser){
            	var userName = this.filterUser.name;
            	var docName = this.docTitle; 
            	if (this.isBidi){
            		userName = BidiUtils.addEmbeddingUCC(userName);
            		docName = BidiUtils.addEmbeddingUCC(docName);
            	}
                var modifiedValue = dojo.string.substitute(this.nls.ActivityFilterFeedbackInfo, [docName,userName]);
                content.firstChild.nodeValue = modifiedValue;          	       
            }else{
                var initValue = dojo.string.substitute(this.nls.ActivityFeedbackInfo, [this.docTitle]);
                content.firstChild.nodeValue = initValue;  
            }    	
        }
    },
    
    _toggleShowActivity: function(isShown){
        var activityDiv = dojo.byId(this.id_task_activity);
        if (!activityDiv) 
            return;
        activityDiv.style.display = isShown ? 'block' : 'none';
    },
    
    _toggleShowBrokenTasks: function(isShown){
        var bTaskDiv = dojo.byId(this.id_broken_task_hint);
        if (!bTaskDiv) 
            return;
        this.filterContext.showBrokenTask = isShown;
        bTaskDiv.style.display = isShown ? 'block' : 'none';   	
    },
    //*********Following methods are for actual generation of HTML stuffs of task pane*********
    
    /**
     * <div class="assign-a-section"><a href="http://www.sample.com">Assign a Section</a></div>
     */
    createAssignASection: function(title){
    	//validation code
    	var sectionRoot = dojo.byId(this.id_assign_a_section);
    	if(sectionRoot) return;	
    	var doc = dojo.doc;    	
        sectionRoot =  dojo.create('div', null,  this.domNode); 
        sectionRoot.id = this.id_assign_a_section;
        sectionRoot.style.display = 'block';
        
        var asignSecDiv =  dojo.create('div', null,  sectionRoot); 
        dojo.addClass(asignSecDiv, 'll_assign_a_section');
        var asignSpan =  dojo.create('span', {id:'ll_assign_a_section_cursor'},  asignSecDiv); 
        dojo.addClass(asignSpan, 'll_assign_a_section_cursor'); 
        dojo.attr(asignSpan,'tabIndex','0');
        dijit.setWaiRole(asignSpan,'button');       
        var content = doc.createTextNode(title);
        asignSpan.appendChild(content);
        this.connectArray.push(dojo.connect(asignSpan, "onclick", dojo.hitch(this, this.createDocumentTask)));
        this.connectArray.push(dojo.connect(asignSpan, "onkeydown", dojo.hitch(this, this._onKeyPress, asignSpan.className, null)));
         
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
//        this.connectArray.push(dojo.connect(a2Div, "onclick", dojo.hitch(this, this.openDocumentActivity, id)));
//        this.connectArray.push(dojo.connect(a2Div, "onkeydown", dojo.hitch(this, this._onKeyPress, a2Div.className, id)));
        return activityRoot;   
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
        barRoot.style.display = 'none';
        dijit.setWaiRole(barRoot,'application');
        dijit.setWaiState(barRoot,'label',this.nls.ProgressbarLabel); 
        var barDiv = dojo.create('div', null, barRoot); 			
        var theBar = new concord.widgets.DocsProgressBar({id: this.id_progressbar}, barDiv); 
        dijit.setWaiState(theBar.domNode,'label',this.nls.ProgressbarLabel); 
        dojo.attr(theBar.domNode,'tabIndex','0');    	
    },
    
    //Task filter UI  
    createTaskFilter: function(){
    	//validation code
    	var oldFilter = dojo.byId(this.id_task_filter);
    	if(oldFilter) return;
    		    	
    	var doc = dojo.doc;
    	
        var filter = dojo.create('div', null,  this.domNode);
        filter.id = this.id_task_filter;
        filter.style.display = 'none';
        
        var editor = dojo.create('div', null,  filter); 
        editor.id = this.id_filter_task_editor;
        editor.className = this.css_filter_task_editor;
        
        var textNode = doc.createTextNode(this.nls.ForAssignee);
        editor.appendChild(textNode);
        var close = dojo.create('div', null,  editor);
        close.id = 'll_task_filter_close';
        close.className = 'commonsprites commonsprites-filter_close';     
        close.title = this.nls.tipsClose;
        dojo.attr(close,'tabindex',0);
        dojo.attr(close,'alt',this.nls.tipsClose);
        dijit.setWaiRole(close, 'button');
        dijit.setWaiState(close, 'label',this.nls.tipsClose);
        var altText = dojo.create('div',{innerHTML:"x"},close);
        dojo.addClass(altText,'ll_commmon_images_alttext');          
        this.connectArray.push(dojo.connect(close, "onclick", dojo.hitch(this, this._closeFilter)));
        this.connectArray.push(dojo.connect(close, "onkeydown", dojo.hitch(this, this._onKeyPress, close.className, null)));
    },
    //Broken task hint information 
    createBrokenTaskHint: function(){
    	//validation code
    	var oldBrokenTaskHint = dojo.byId(this.id_broken_task_hint);
    	if(oldBrokenTaskHint) return;
    	    	
        var bTaskDiv = dojo.create('div', {id: this.id_broken_task_hint}, this.domNode);
        bTaskDiv.style.display = 'none';//by default, don't show it 
        this.filterContext.showBrokenTask = false;
        
        var close = dojo.create('div', null, bTaskDiv);
        dojo.attr(close,'tabIndex','0');   
        dojo.attr(close,'alt',this.nls.tipsClose);           
        dojo.addClass(close, this.css_broken_task_close);     
        dijit.setWaiRole(close,'button');
        dijit.setWaiState(close, 'label',this.nls.tipsClose); 
                
        this.connectArray.push(dojo.connect(close, "onclick", dojo.hitch(this, this.hideBrokenAssignments, true)));
        this.connectArray.push(dojo.connect(close, "onkeydown", dojo.hitch(this, this._onKeyPress, close.className, true)));
                
        var editor = dojo.create('div', null, bTaskDiv);
        dojo.addClass(editor, 'll_broken_task_editor');
        this.createLabel(this.nls.BrokenTaskHint, editor);
        
        var help = this.createLabel(this.nls.BrokenTaskHelp, editor);
        help.id = this.id_broken_task_help;
        help.title = this.nls.BrokenTaskTooltip;
        dojo.addClass(help, 'll_broken_task_help');
        
        dojo.attr(help,'tabIndex','0');               
        dijit.setWaiState(help,'label',this.nls.BrokenTaskTooltip);
    },
    //Broken task help link
    createBrokenTaskHelpLink: function(id){
    	var help = dojo.byId(this.id_broken_task_help);
    	if(!help) return;
    	//help link    
    	//this.connectArray.push(dojo.connect(help, "onclick", dojo.hitch(this, this.openDocumentActivity, id)));
    	//this.connectArray.push(dojo.connect(help, "onkeydown", dojo.hitch(this, this._onKeyPress, null,id))); 
    },
    //Initiative information UI
    createInitInformation: function(info1, title){
    	//validation code
    	var oldTaskHint = dojo.byId(this.id_task_init);
    	if(oldTaskHint) return;   
    	    	
    	var doc = dojo.doc;
    	
        var initRootDiv =dojo.create('div', null, this.domNode);
        initRootDiv.id = this.id_task_init;
        initRootDiv.style.display = 'block';
        
        var infoDiv = dojo.create('div', null, initRootDiv); 
        infoDiv.className = 'll_default-information-text';
        //Create first information
        var content = doc.createTextNode(info1);
        infoDiv.appendChild(content);
        //Create second information
        var spanDiv = dojo.create('span', null, infoDiv);
        dojo.attr(spanDiv,'tabIndex','0'); 
        spanDiv.className = 'll_using-existing-activity';
        spanDiv.id = this.id_task_existing_activity;
        var aHerfContent = doc.createTextNode(title);
        spanDiv.appendChild(aHerfContent);
        this.connectArray.push(dojo.connect(spanDiv, "onclick", dojo.hitch(this, this.createActivity)));
        this.connectArray.push(dojo.connect(spanDiv, "onkeydown", dojo.hitch(this, this._onKeyPress, spanDiv.className, null)));
    },
    /**
     * <code>
     * <div class="ll_default-information-text">Currently, there are no assignments in 'Greenwell_Initiative.'</div>
     * </code>
     */
    createActivityFeedback: function(isShown){
    	//validation code
    	var oldFeedback = dojo.byId(this.id_task_default_info);
    	if(oldFeedback) return;
    	    	
    	var doc = dojo.doc;
        var rootDInfo = dojo.create('div', null, this.domNode); 
        rootDInfo.id = this.id_task_default_info;
        dijit.setWaiRole(rootDInfo,'alert');
        dojo.attr(rootDInfo,'tabIndex','0');
        rootDInfo.style.display = isShown ? 'block' : 'none';
        
        var infoDiv = dojo.create('div', null, rootDInfo); 
        infoDiv.className = 'll_default-information-text';
        infoDiv.id = this.id_task_feedabck_content;
      
        //Create first information
        var actualInfo = dojo.string.substitute(this.nls.ActivityFeedbackInfo, [this.docTitle]);
        var content = doc.createTextNode(actualInfo);
        infoDiv.appendChild(content);
    },
    /**
     * <div class="assign-a-section"><a href="http://www.sample.com">Assign a Section</a></div>
     */
    createTaskRootDivUI: function(){
        var tasksDiv = dojo.create('div', null, this.domNode);
        tasksDiv.id = this.id_task;
        dijit.setWaiRole(tasksDiv,'application');
        dijit.setWaiState(tasksDiv,'label', this.nls.AssignmentList);
        dijit.setWaiState(tasksDiv,'live', 'polite');
        dijit.setWaiState(tasksDiv,'relevant', 'additions'); 
        var activityDiv = dojo.byId(this.id_task_activity);
        if(activityDiv){
        	dojo.place(tasksDiv,activityDiv,"before");
        }
        return tasksDiv;
    },
    
    createLabel: function(text, container){
        var label = dojo.create('label', null, container);
        label.appendChild(dojo.doc.createTextNode(text));
        return label;
    },    
    getUserFullName: function(id){
        var editor = pe.scene.getEditorStore().getEditorById(id);
        return editor ? editor.getName() : null;
    },    
    /**
     *<code>
     *<div class="task-row-style">
     * <div class="task-section1-style"> <span><img src="SectionAssignment12.png" class="task-img-style"/>
     *  </span><span class="task-title-style/task-title-complete-style">Review Introduction</span></div>
     * <div class="task-section2-style"><span class="assignee-style/assignee-complete-style">Dragon W Li</span><span> | </span><span>Due 06.06.2011</span></div>
     *</div>
     *</code>
     */
    createTaskSectionsUI: function(eTask, taskDiv){
    	//Is broken task
    	dijit.setWaiRole(taskDiv,'application');
    	var status = taskDiv.getAttribute(this.att_task_status);
    	var isBroken = false;
    	if(status && status == 'broken'){
    		isBroken = true;
    	}  	   	
        //create div for section 1
        var sec1Div = dojo.create('div', null, taskDiv);
        dojo.addClass(sec1Div, 'll_task_section1_style');
        //create image
        var imgDiv = dojo.create('div', null, sec1Div);
        dojo.addClass(imgDiv, 'll_task_img_style');
        if(isBroken){
        	  dojo.addClass(imgDiv, 'll_task_img_style_broken');
        }else{
        	  dojo.addClass(imgDiv, 'll_task_img_style_normal');        	
        }
        //create title span
        var titleSpan = dojo.create('span', null, sec1Div); 
        dojo.addClass(titleSpan, 'll_task_title');                   
        var completed = eTask.getState() == 'complete';
        if (completed) {
            dojo.addClass(titleSpan, 'll_task_title_complete');           	
        }else {
            dojo.addClass(titleSpan, 'll_task_title_normal'); 
        }
        if(isBroken){ //if it is broken class, apply broken task css
            dojo.addClass(titleSpan, 'll_broken_task_content');        	        	
        }
        var statusLiteral = isBroken ? this.nls.AssignmentBroken : (completed ? this.nls.AssignmentComplete : null);
        //create content of title span
        var title = this.getDecorateTaskTitle(eTask);
        this.createLabel(title,titleSpan);        
        
        //create div for section 2
        var sec2Div = dojo.create('div', null, taskDiv);  
        dojo.addClass(sec2Div, 'll_task_section2_style');
        if(isBroken){
            dojo.addClass(sec2Div, 'll_broken_task_content');        	        	
        }

        var assigneeDiv = dojo.create('span', null, sec2Div); 
        if (completed) {
            dojo.addClass(assigneeDiv, 'll_complete_style');         	
        }
        //create owner's name
        var name = (!this.isBidi) ? this.getUserFullName(eTask.getOwner()) : BidiUtils.addEmbeddingUCC(this.getUserFullName(eTask.getOwner()));
        this.createLabel(name, assigneeDiv);         
        
        if (eTask.getDuedate()) {
            var theDate = concord.util.date.parseDate(eTask.getDuedate());
            if (theDate) {
                var dividerSpan = dojo.create('span', null, sec2Div);            	
            	var dueContent = dojo.string.substitute("| ${0}", [this.nls.DuedateLiteral]);
            	var dividerContent = "| ";
                var divider = document.createTextNode(dividerContent);
                
                dividerSpan.appendChild(document.createTextNode(" "));
                dividerSpan.appendChild(divider);
                dividerSpan.appendChild(document.createTextNode(" "));
                
                var dueDateSpan = dojo.create('span', null, sec2Div); 
                
            	var beforeToday = false;
            	if (concord.util.date.isToday(theDate))
            		theDate = this.nls.today;
            	else if (concord.util.date.isYesterday(theDate)){
            		theDate = this.nls.yesterday;
            		beforeToday = true;
            	}else if (concord.util.date.beforeToday(eTask.getDuedate())){
            		beforeToday = true;
            	}else if (concord.util.date.isTomorrow(theDate)){
            		theDate = this.nls.tomorrow;
            	}
            	var dueContent = dojo.string.substitute(this.nls.DuedateLiteral, [(!this.isBidi) ? theDate : (BidiUtils.addEmbeddingUCC(theDate))]);
                //create duedate
                this.createLabel(dueContent, dueDateSpan);  
                
                var rowDesc = title + ' ' + name + ' ' + dueContent;
                if(statusLiteral)
                	rowDesc = rowDesc + ' ' + statusLiteral;
                dijit.setWaiState(taskDiv,'label', rowDesc);          	

            	if(completed){
            		dojo.addClass(dueDateSpan, 'll_complete_style');
            	} 
            	if (beforeToday){
            		if(isBroken){
             			dojo.addClass(dueDateSpan, 'll_broken_task_content');           			
            		}else{
            			dojo.addClass(dueDateSpan, 'll_duedate_expired_style');
            		}
            	}
            	
        	  }
        }
    },
    
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///// scene view/edit mode change ////////////////////////////////////////////////////////////////////////////////////
    _switchReadOnly: function(readonly) {
    	this.bReadOnly = readonly;
    	this.enableCreateTask(!readonly);
		this.enableExistingActivity(!readonly);
    },
    
    // called when initilized comments pane.
    _initReadOnlyMode: function() {
    	if(pe && pe.scene && pe.scene.isDocViewMode()) {
    		setTimeout(dojo.hitch(this, function(){
    			this._switchReadOnly(true);
              }),200); 	    		
    	}
    },
    
	switchToObserverMode: function() {
		this._switchReadOnly(true);
	},
	
	switchToViewMode: function() {
		this._switchReadOnly(true);
	},
	
	switchToEditMode: function() {
		this._switchReadOnly(false);
	},    
    
	nullifyVariables: function(){
    	this.store =null;
    	this.pMenu=null;
    	this.connectArray=null;    	  
	},
	
    destroyPane: function(){
    	//1- remove dojo connections
		for(var i=0; i<this.connectArray.length; i++){
			dojo.disconnect(this.connectArray[i]);			
		}			
		//2- destroy objects
		//this.destroyRecursive(); //do not hold on to doms
		if (this.pMenu) this.pMenu.destroyRecursive();
		
		//3- nullify variables
		this.nullifyVariables();
    }    
    
});
/**
 * Return the height of 'Assign a section'
 */
concord.widgets.sidebar.TaskPane.getASectionHeight = function(){
    var aSectionDiv = document.getElementById('id_assign-a-section');
    var aSectionHeight = 23;//By default, we give it 23px;
    var aSectionHPading = 7;
    if (aSectionDiv) {
        aSectionHeight = aSectionDiv.clientHeight + aSectionHPading;
    }
    var filter = document.getElementById('id_task_filter');
    if(filter){
    	if(filter.style.display == 'block'){
    	    aSectionHeight = filter.clientHeight+ aSectionHPading;
    	}
    }
    var brokenTaskDiv = dojo.byId('id_broken_task_hint');
    if(brokenTaskDiv){
    	if(brokenTaskDiv.style.display != 'none'){
    		aSectionHeight += brokenTaskDiv.clientHeight;
    	}
    }
    return aSectionHeight;
};
/**
 * Return the height of  'Show an activity'
 */
concord.widgets.sidebar.TaskPane.getActivityHeight = function(){
      
    var activityDiv = document.getElementById('id_task_activity_div');
    var activityHeight = 36;//By default, we assume it contains two line
    if (activityDiv) {
        activityHeight = activityDiv.clientHeight;
    }
    return activityHeight;
};
/**
 * Resize tasks in task pane
 */
concord.widgets.sidebar.TaskPane.resizeTaskArea = function(){
    var taskPane = dijit.byId('sidebar_assignment_pane');
    if (taskPane) {
        var node = taskPane.containerNode;
        var style = node.getAttribute('style');
     
        var pureHeight = node.offsetHeight - 1;
        var actualHeight = pureHeight -  concord.widgets.sidebar.TaskPane.getASectionHeight()
                         - concord.widgets.sidebar.TaskPane.getActivityHeight();
        if(actualHeight < 0) actualHeight = 0;
        var height = actualHeight + "px;";
        var width = node.scrollWidth + "px";
 
        var styleValue = "height:" + height + "width:" + width + "position:absolute;overflow:auto;";
        if (styleValue) {       	
            var activityDiv = dojo.byId('id_task_activity_div');
            var activityFDDiv = dojo.byId('id_task_default_info'); 
                      	
            var tasksDiv = dojo.byId('id_task_root_div');
            if (tasksDiv) {
                tasksDiv.style.cssText = styleValue;   
                var secActivityHeight = concord.widgets.sidebar.TaskPane.getActivityHeight()+
                    concord.widgets.sidebar.TaskPane.getASectionHeight();
                if(taskPane.hasDisplayedTasks()){ 
                    dojo.style(node, "overflow", "hidden");
                    if(pureHeight <= secActivityHeight) {
                    	  tasksDiv.style.display = 'none';
                    	  if(activityDiv)
                    	  	  activityDiv.className = 'll_task_activity_smallheight_div';	
                    }else{
                    	  tasksDiv.style.display = 'block';
                    	  if(activityDiv)
                    	      activityDiv.className = 'll_task_activity_div';
                    }
                    if(!activityDiv) return;
                    if(pureHeight <= concord.widgets.sidebar.TaskPane.getASectionHeight()){
                    	  activityDiv.style.display = 'none';
                    }else{
                    	  activityDiv.style.display = 'block';
                    }
                }else{
                    if (!activityDiv || !activityFDDiv) 
                        return;                
                    if(pureHeight < secActivityHeight + activityFDDiv.clientHeight){
                         activityDiv.className = 'll_task_activity_smallheight_div';		                                       	   
                    }else{
                         activityDiv.className = 'll_task_activity_div';	                	
                    }                 	
                }                 	              	
            }else{          
                if (!activityDiv || !activityFDDiv) 
                    return;                
                if(pureHeight<secActivityHeight + activityFDDiv.clientHeight){
                     activityDiv.className = 'll_task_activity_smallheight_div';		                                       	   
                }else{
                     activityDiv.className = 'll_task_activity_div';	                	
                }             	
            }            	    
        }
    }
};

dojo.declare("concord.widgets.sidebar.UITask", [concord.beans.Task], {	
	broken: false,
	constructor: function ()
	{	 
	}, 
	 
	isBroken: function ()
	{
	   return this.broken;
	},
		
	setBroken: function(broken){
		this.broken = broken;
	}
	
});

dojo.declare("concord.widgets.sidebar.TaskUIStore", null, {
	
	store: null, //it stores ui tasks
	constructor: function (beans)
	{
		//if beans is undefined, null or not instanceof array , throw error
	   if(typeof beans =='undefined' || !beans || !beans instanceof Array)
	       throw new Error("TaskUIStore is not initiated successfully");
       this.store = beans;
	}, 
	 
	addTask: function (bean)
	{
		if(!bean) return;			
		this.store.push(bean); 
	},
	
	hasBrokenTask: function(){
		for(var index in this.store){
			var task =  this.store[index];
			if(task.isBroken()){
				return true; 
			}
		}
		return false;		
	},
	
	getCompletedCount: function (){	
		var count = 0;
		for(var index in this.store){
			var task =  this.store[index];
			if(task.getState() == 'complete'){
				count++;
			}
		}
		return count; 		
	},
	
	getTotalCount: function (){	
		var count = 0;
		for(var index in this.store){
			count++;		 
		}
		return count;		
	},
		
	 // User A is assigning a task to User B, while userB is joining coediting. 
	isExistedTask: function (bean){
		var taskid = bean.getId();	
		for(var index in this.store){
			var task =  this.store[index];
			if(task.getId() == taskid){
				return true; 
			}
		}
		return false; 		
	},
 
	removeTask: function (taskid)
	{
		if(!taskid) return;
		for(var index in this.store){
			var task =  this.store[index];
			if(task.getId() == taskid){
				delete this.store[index];
				return;
			}
		} 
	},
	
	updateTask: function(bean){
		if(!bean) return;
		var taskid = bean.getId();
		for(var index in this.store){
			var task =  this.store[index];
			if(task.getId() == taskid){
				var temp = this.store[index];
				this.store[index] = bean;
				delete temp;
				return;
			}
		}		
	},
	
	getSortedTasks: function(context, compare){
		if(typeof context =='undefined'){
			context = null;
		}
		if(typeof compare == 'undefined'){
			compare = null;
		}		
		if(context && compare){	
			this.store.sort(dojo.hitch(context,compare));				
		}else if(compare){
			this.store.sort(compare);
		}		
		return this.store;
	}
});