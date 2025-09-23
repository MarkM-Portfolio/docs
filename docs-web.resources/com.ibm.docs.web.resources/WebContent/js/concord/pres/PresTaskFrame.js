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

dojo.provide("concord.pres.PresTaskFrame");
dojo.require("concord.util.events");
dojo.require("dijit.TooltipDialog");
dojo.require("concord.util.date");
dojo.require("concord.util.BidiUtils");
dojo.declare("concord.pres.PresTaskFrame", null, {
    slideManager: null,
    connectArray : null, 
    assignTooltip: null,    
    nls: null,
		
    constructor: function(slideManager) {
    	this.slideManager = slideManager;
    	this._regEvent();
    	this.nls = dojo.i18n.getLocalization("concord.task","PresTaskHandler");
    	this.isBidi = BidiUtils.isBidiOn();
    },	
	
    _regEvent: function(){
    	dojo.subscribe(concord.util.events.assignmentEvents, null, dojo.hitch(this,this.handleAssignmentEvent));
    },
    
    handleAssignmentEvent: function(data){   	
    	var taskHdl = this.slideManager.getTaskHdl();
    	if (!taskHdl) return;
    	
    	var taskBeans = taskHdl.getSelectedTask(); 
    	if(!taskBeans) return;
 	   	
        if(data.eventName == concord.util.events.presAssignment_eventName_assignSlides){
			taskHdl.createTask();
        } else if(data.eventName == concord.util.events.presAssignment_eventName_editAssignSlide){
			taskHdl.doActions(taskBeans, concord.beans.TaskService.ACTION_EDIT);
        } else if(data.eventName == concord.util.events.presAssignment_eventName_reopenAssignSlides){
        	taskHdl.doActions(taskBeans, concord.beans.TaskService.ACTION_REOPEN);
        } else if(data.eventName == concord.util.events.presAssignment_eventName_reassignSlides){
        	taskHdl.doActions(taskBeans, concord.beans.TaskService.ACTION_REASSIGN);
        } else if(data.eventName == concord.util.events.presAssignment_eventName_unassignSlides){
        	taskHdl.doActions(taskBeans, concord.beans.TaskService.ACTION_REMOVE);
        } else if(data.eventName == concord.util.events.presAssignment_eventName_markDoneSlides){
        	taskHdl.doActions(taskBeans, concord.beans.TaskService.ACTION_WORKDONE);
        } else if(data.eventName == concord.util.events.presAssignment_eventName_approveSlides){
        	taskHdl.doActions(taskBeans, concord.beans.TaskService.ACTION_APPROVE);
        } else if(data.eventName == concord.util.events.presAssignment_eventName_rejectSlides){
        	taskHdl.doActions(taskBeans, concord.beans.TaskService.ACTION_REJECT);
        } else if(data.eventName == concord.util.events.presAssignment_eventName_RemoveCompletedTask){
            taskHdl.deleteTasks('complete');       	 
        } else if(data.eventName == concord.util.events.presAssignment_eventName_AboutSlideAssignment){
        	taskHdl.doActions(taskBeans, concord.beans.TaskService.ACTION_ABOUT);
        }
    },
    
	//Check whether slides has already been assigned a task
    isOverlapWithExistTask: function(){
    	var selectedSlides = this.slideManager.multiSelectedSlides;
    	if(selectedSlides){
    		for(var i=0; i< selectedSlides.length; i++){
    			var slideElem = selectedSlides[i];
    			var tasked = this.isTaskedSlide(slideElem);
    			if(tasked){
    				return true;
    			}
            }
    	}
    	return false;
    },
    
    getSingleSelectedSlide: function(){
    	var selectedSlides = this.slideManager.multiSelectedSlides;
    	if(selectedSlides){
    		if(selectedSlides.length == 1) return selectedSlides[0];
    	}
    	return null;    	
    },
    
    isSingleSelection: function(){
    	var selectedSlides = this.slideManager.multiSelectedSlides;
    	if(selectedSlides){
    		if(selectedSlides.length == 1) return true;
    	}
    	return false;      	
    },
    
    isSlideTasked: function(slideId){
    	var slideElem = this.getSlideById(slideId);
    	return this.isTaskedSlide(slideElem);
    },
    
	//Is the slide assigned a task?
    isTaskedSlide: function(slideElem){
        if(slideElem){
            var taskNode = dojo.query("[task_id]",slideElem.parentNode)[0];
            return taskNode ? true : false;
        }
        return false;
    },	
    
    getSelectedSlideIds: function(){
    	var ids = new Array();
    	var selectedSlides = this.slideManager.multiSelectedSlides;
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
    
    getSelectedSlideTaskIds: function(){
    	var ids = new Array();
    	var selectedSlides = this.slideManager.multiSelectedSlides;
    	if(selectedSlides){
    		 for(var k=0; k<selectedSlides.length; k++){
				var taskNode = dojo.query("[task_id]",selectedSlides[k].parentNode)[0];
				if(taskNode){
                	var id = taskNode.getAttribute("task_id");
                	if(id){
                   		ids.push(id);
                	}						
				}	
    		 }
    	}
    	return ids;	
    },

    //Are all slides without tasks?
    isSelectedSlidesWithoutTasks: function(){
    	var noTasked = true;
    	var selectedSlides = this.slideManager.multiSelectedSlides;
    	if(selectedSlides){
    		for(var k=0; k<selectedSlides.length; k++){
    			var taskNode = dojo.query("[task_id]",selectedSlides[k].parentNode)[0];
    			if(taskNode){
    				noTasked = false; 
    				break;						
    			}	
    		}
    	}		
    	return noTasked;
    },
    //Are all slides with tasks?
    isSelectedSlidesWithFullTasks: function(){
    	var fullTasked = true;
    	var selectedSlides = this.slideManager.multiSelectedSlides;
    	if(selectedSlides){
    		for(var k=0; k<selectedSlides.length; k++){
    			var taskNode = dojo.query("[task_id]",selectedSlides[k].parentNode)[0];
    			if(!taskNode){
    				fullTasked = false; 
    				break;						
    			}	
    		}
    	}		
    	return fullTasked;		
    },
		 
    getSorterDocument: function(){
        return this.slideManager.editor.document.$;
    },
    
    getSlideIdByTask: function(taskNode){
    	var slide = dojo.query(".draw_page",taskNode.parentNode)[0];
    	if(slide){
    		return  slide.getAttribute("id"); 
    	}
    	return null;	
    },
    
    getSlideById:function(slideId){
        if(this.getSorterDocument()){
            return this.getSorterDocument().getElementById(slideId);
        }
        return null;
    },
    
    getTaskContainer: function(slideId){
    	var slideElem = this.getSlideById(slideId);
        if(slideElem){
            return dojo.query(".taskContainer",slideElem.parentNode)[0];
        }    	
    },
                
    removeSlideTask: function(slide, taskId, msgPairList, noSelect){
        if(msgPairList == null){
            msgPairList = new Array();
        }
        //removeTaskDiv in slide
        var taskContainer = dojo.query("[task_id='"+taskId+"']", slide.parentNode)[0];
        if(taskContainer){                     	
        	var taskIdToDelete = taskContainer.id;
        	var elem = this.getSorterDocument().getElementById(taskIdToDelete);
        	msgPairList =SYNCMSG.createDeleteNodeMsgPair(new CKEDITOR.dom.node(elem), msgPairList);                
        	dojo.destroy(taskContainer);
        	//run selectSlide again to fix the selectSlide classes 
        	if(!noSelect)
        		this.slideManager.selectSlide(slide);                        
        }
        return msgPairList;
    }, 
         
    createTaskContainer: function(slideId, taskBean, msgPairList){  
        if(msgPairList == null){
            msgPairList = [];
        }
        var container =  this._createContainerDiv(slideId, taskBean.getId());
        if(container){
             msgPairList = SYNCMSG.createInsertNodeMsgPair(container, msgPairList);
        }
        return msgPairList;	
    },
    
    //Create task element based upon the given slide
    _createContainerDiv: function(slideId, taskId){
    	var slideElem = this.getSlideById(slideId);
        if(slideElem){
            var div = dojo.query(dojo.create("div", null, slideElem, "after")).addClass("taskContainer");
            if(div && div.length > 0){
                concord.util.HtmlContent.injectRdomIdsForElement(div[0]);
                dojo.attr(div[0],"task_id",taskId);
            }
            return div[0];
        }
        return null;
    },
    
    updateContextTaskMenu: function(){ 
    	this.slideManager.publishSlideSelectedTaskMenu();
    },
    
    sendMsgForAssignment: function(slideId, taskId, type){
        if(slideId && taskId && type){
            //send co-edit message here
            var msg = SYNCMSG.createAssignmentMsg(slideId, taskId, type);
            var msgPairsList = [];
            msgPairsList.push(msg);
            var addToUndo = false;
            msgPairsList[0] = SYNCMSG.addUndoFlag(msgPairsList[0],addToUndo);

            SYNCMSG.sendMessage(msgPairsList, SYNCMSG.NO_LOCAL_SYNC);
        }
    },
    
    addConnectsArray: function(taskId, connObj){
    	if (connObj){
    		if (this.connectArray == null)
    			this.connectArray = [];
    		var object = {};
    		object[taskId] =  connObj;	
    		this.connectArray.push(object);
    	}
    },
	
    deleteConnectsByTaskId: function(taskId){
    	if (taskId){
    		for(var i=0; i< this.connectArray.length; i++){
    			var object = this.connectArray[i];
    			if(taskId in object){
    				dojo.disconnect(object[taskId]);			
    			}			 					
    		}
    	}
    },
		    
    createSlideTask: function(mode, slideId, taskBean){
    	var msgPairList = null;
    	if(slideId && taskBean){
    		msgPairList = this.createTaskContainer(slideId, taskBean); 
    		var container = this.getTaskContainer(slideId); 				      	
    		var taskId = taskBean.getId();
    		if(taskId){
    			var taskHdl = this.slideManager.getTaskHdl();				
    			var div = dojo.create("div", null, container);
    			this.registerEvents(div, taskId);
    			if(mode == taskHdl.WRITE_MODE){                  
    				dojo.addClass(div, "taskEntryWrite");                    
    				var imgDiv = dojo.query(dojo.create("div",{innerHTML:"&nbsp;"}, div))
    				.addClass("taskEntryImg taskEntryWriteImg");
    				var assigneeFullName = "";
    				var assignee = taskBean.getAssignee()
    				if(assignee){
    					assigneeFullName = taskHdl.getUserFullName(assignee);                	
    				} 				
    				var txtDiv = dojo.query(dojo.create("div",{innerHTML: (this.isBidi ?  BidiUtils.addEmbeddingUCC(assigneeFullName) : assigneeFullName)}, div)).addClass("taskEntryTxt");				
    			}
    			else if(mode == taskHdl.REVIEW_MODE){
    				dojo.addClass(div, "taskEntryReview");
    				var imgDiv = dojo.query(dojo.create("div",{innerHTML:"&nbsp;"}, div))
    				.addClass("taskEntryImg taskEntryReviewImg");
    				var reviewerFullName = "";
    				var reviewer = taskBean.getReviewer();
    				if(reviewer){
    					reviewerFullName =taskHdl.getUserFullName(reviewer);                 	
    				}					
    				var txtDiv = dojo.query(dojo.create("div",{innerHTML:(this.isBidi ?  BidiUtils.addEmbeddingUCC(reviewerFullName) : reviewerFullName)}, div))
    				.addClass("taskEntryTxt");					
    			}				
    		}
    	}
    	if(msgPairList.length > 0){
    		var addToUndo = false;
    		msgPairList[0] = SYNCMSG.addUndoFlag(msgPairList[0],addToUndo);
    		SYNCMSG.sendMessage(msgPairList, SYNCMSG.NO_LOCAL_SYNC);
    	}
    },
	    
    registerEvents: function(taskDiv, taskId){	
    	this.addConnectsArray(taskId, dojo.connect(taskDiv, 'onmouseover', dojo.hitch(this, "showAssignmentTooltip",taskId, taskDiv)));
    	this.addConnectsArray(taskId, dojo.connect(taskDiv, 'onmouseout', dojo.hitch(this, "hideAssignmentTooltip", taskDiv)));
    	this.addConnectsArray(taskId, dojo.connect(taskDiv, 'onfocus', dojo.hitch(this, "showAssignmentTooltip",taskId, taskDiv)));
    	this.addConnectsArray(taskId, dojo.connect(taskDiv, 'onblur', dojo.hitch(this, "hideAssignmentTooltip", taskDiv)));	    	
    },
    
    showAssignmentTooltip: function(taskId, container, event){
    	var taskHdl = this.slideManager.getTaskHdl();
    	var taskBean =  taskHdl.store.getTaskBean(taskId);
    	var titleInfo = taskHdl.getTitleInfo(taskBean);
    	var title = titleInfo.title;	
    	var duedate = this.getDueDate(taskBean); 
    	this.assignTooltip =  new dijit.TooltipDialog({
    		style:"width: auto",
    		content:"<p>"+ title +"</p>"+ "<p>"+ duedate +"</p>",
    		onMouseLeave: function(){
    			dijit.popup.close(this.assignTooltip);
    		}
    	});	
    	dijit.popup.open({
    		popup: this.assignTooltip,
    		x: BidiUtils.isGuiRtl() ? (dojo.byId('presEditor').offsetWidth-event.clientX) : event.clientX, 
    		y: event.clientY + 100			
    	});
    },
	
    hideAssignmentTooltip:function(container)
    {
    	if(this.assignTooltip){
    		dijit.popup.close(this.assignTooltip);
    		this.assignTooltip.destroyRecursive();   		
    	}
    },
	
    getDueDate: function(taskBean){
    	if (taskBean.getDuedate()) {
    		var theDate = concord.util.date.parseDate(taskBean.getDuedate());
    		if (theDate) {      	                             	     	                                               
    			var beforeToday = false;
    			if (concord.util.date.isToday(theDate))
    				theDate = this.nls.today;
    			else if (concord.util.date.isYesterday(theDate)){
    				theDate = this.nls.yesterday;
    				beforeToday = true;
    			}else if (concord.util.date.beforeToday(taskBean.getDuedate())){
    				beforeToday = true;
    			}else if (concord.util.date.isTomorrow(theDate)){
    				theDate = this.nls.tomorrow;
    			}
    			if (this.isBidi)
    				theDate = BidiUtils.addEmbeddingUCC(theDate);
    			return dojo.string.substitute(this.nls.DuedateLiteral, [theDate]); 				           	
    		}
    	}		
    },
	
    updateSlideTask: function(taskContainer, taskBean, actions, mode, cached){
    	var msgPairList = [];
    	if(taskContainer && taskBean){
    		var taskDiv = null;
    		var taskImgDiv = dojo.query(".taskEntryImg", taskContainer)[0];
    		var taskTxtDiv = dojo.query(".taskEntryTxt",taskContainer)[0];			
    		if(taskImgDiv){
    			taskDiv = taskImgDiv.parentNode; 
    			dojo.removeClass(taskImgDiv,"taskEntryWriteImg taskEntryReviewImg taskEntryRejectImg taskEntryApproveImg taskEntryCompleteImg");
    			dojo.removeClass(taskDiv,"taskEntryWrite taskEntryReview");
    			dojo.removeClass(taskTxtDiv, "taskEntryCompleteTxt");					
    		}else{
    			taskDiv = dojo.create("div", null, taskContainer);				
    			taskImgDiv = dojo.create("div",{innerHTML:"&nbsp;"}, taskDiv);
    			taskTxtDiv = dojo.create("div",null, taskDiv);
				
    			dojo.addClass(taskImgDiv,"taskEntryImg");									
    			dojo.addClass(taskTxtDiv,"taskEntryTxt"); 
    			this.registerEvents(taskDiv, taskBean.getId());										
    		};
			var taskHdl = this.slideManager.getTaskHdl();
    		var owner = taskBean.getOwner()
    		if(owner){
    			var ownerFullName =taskHdl.getUserFullName(owner);
    			if(ownerFullName!= null){
    				if (!this.isBidi)
    					taskTxtDiv.innerHTML = ownerFullName;
    				else {
    					taskTxtDiv.innerHTML = BidiUtils.addEmbeddingUCC(ownerFullName.toString());
    				}
    			}                 	
    		}    
    		       
    		if(mode == taskHdl.WRITE_MODE){
    			dojo.addClass(taskDiv, "taskEntryWrite");
    			dojo.addClass(taskImgDiv, "taskEntryWriteImg");  			                           
    		}else if(mode == taskHdl.REVIEW_MODE){
    			dojo.addClass(taskDiv, "taskEntryReview");
    			dojo.addClass(taskImgDiv, "taskEntryReviewImg"); 				              
    		}else if(mode == taskHdl.WRITE_COMPLETE_MODE){
    			dojo.addClass(taskDiv, "taskEntryWrite");
    			dojo.addClass(taskImgDiv, "taskEntryWriteImg taskEntryCompleteImg");
    			dojo.addClass(taskTxtDiv, "taskEntryCompleteTxt");
    		}else if(mode == taskHdl.REVIEW_COMPLETE_MODE){
    			dojo.addClass(taskDiv, "taskEntryReview");
    			dojo.addClass(taskImgDiv, "taskEntryReviewImg taskEntryApproveImg");
    			dojo.addClass(taskTxtDiv, "taskEntryCompleteTxt");
    		}            
    		if(taskBean.getState() == "rejected"){
    			dojo.addClass(taskDiv, "taskEntryReview");
    			dojo.addClass(taskImgDiv, "taskEntryRejectImg");
    		} 
    		//this.updateDueDate(taskBean, taskDiv); 

//    		var taskDivClone = taskDiv.cloneNode(true);
//    		msgPairList = SYNCMSG.createDeleteNodeMsgPair(new CKEDITOR.dom.node(taskDiv),msgPairList);
//    		dojo.destroy(taskDiv);
//
//    		taskContainer.appendChild(taskDivClone);
//    		msgPairList = SYNCMSG.createInsertNodeMsgPair(taskDivClone,msgPairList);              		           
    	}
    	return  msgPairList; 
    }           
});