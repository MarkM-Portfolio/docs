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

dojo.provide("websheet.collaboration.TaskFrame");
dojo.require("websheet.widget._Rectangle");
dojo.require("dojo.i18n");
dojo.requireLocalization("websheet.collaboration","TaskFrame");
dojo.declare('websheet.collaboration.TaskFrame', [websheet.widget._Rectangle], {
	
	
	//TODO, This class need to be refactered, since the base class has changed.
	nls: null,
	_DropDownBtn : null,
	_actionMenu: null,
	_titleSpan: null,
	_ddBtnDiv: null,
	taskTitle : null,
	taskId : null,
	appendix: null,
	bFocus : false,
	dropDownBtnHandler: null,
	bActionsBuilt : false,
	STYLE : ["concordTaskWriteBorder", "concordTaskReviewBorder", "concordTaskLockBorder", "concordTaskWriteCompleteBorder", "concordTaskReviewCompleteBorder", "concordCachedTaskBlockBorder"],
	
	postCreate:function(){
		this.inherited(arguments);
		//create cover node without connect event in selectRect.js
		this._createCover(true);
		var coverNode = this._getCoverNode();
		this.connect(coverNode, 'click', 'doClick');
		this.connect(coverNode, 'onmouseup', 'doMouseUpEvent');
		this.connect(coverNode, 'onmousemove', 'doMouseMoveEvent');
		this.nls = dojo.i18n.getLocalization("websheet.collaboration","TaskFrame");
		this.TASK_DONE_BTN = this.nls.TASK_DONE_BTN;
		this.TASK_WORK_BTN = this.nls.TASK_WORK_BTN;
		this.TASK_GOTO_BTN = this.nls.TASK_GOTO_BTN;
	},
    //styleName is null means setting the default style
    setBorderStyle:function(mode){
    	var bFound = false;
		for (var index in this.STYLE){
			var styleName = this.STYLE[index];
			if (mode == index){
		    	dojo.addClass(this._leftNode, styleName + "Left");
		    	dojo.addClass(this._rightNode, styleName + "Right");
		    	dojo.addClass(this._topNode, styleName + "Top");
		    	dojo.addClass(this._bottomNode, styleName + "Bottom");
		    	bFound = true;
 			}else{
		    	dojo.removeClass(this._leftNode, styleName + "Left");
		    	dojo.removeClass(this._rightNode, styleName + "Right");
		    	dojo.removeClass(this._topNode, styleName + "Top");
		    	dojo.removeClass(this._bottomNode, styleName + "Bottom");
 			}
		}
    	if (!bFound){
    		this._leftNode.className = this.className + " selectLeft";
    		this._rightNode.className = this.className + " selectRight";
    		this._topNode.className = this.className + " selectTop";
    		this._bottomNode.className = this.className + " selectBottom";    		
    	}

    },
    
    toggleTaskInfo: function(show){
    	if(this._titleSpan){
    	    if(show){
    	    	 this._titleSpan.style.display ="";
    	    }else{
    	    	 this._titleSpan.style.display ="none";
    	    }
    	}
    	if(this._ddBtnDiv){
    		 if(show){
    	    	 this._ddBtnDiv.style.display ="";    		 	
    	    }else{
    	    	 this._ddBtnDiv.style.display ="none";
    	    }
    	}
    },
    doMouseHoverIn: function(e){
    	if(this.bFocus)return;
    	this.toggleTaskInfo(true);
    },
  
    doMouseHoverOut: function(e){
        if(this.bFocus) return;
        this.toggleTaskInfo(false);
    },
    
    updateTitle: function(title, width){
        var truncTitle = this.getTruncatedTitle(title,width);
        this._titleSpan.innerHTML = truncTitle;
        this._titleSpan.title = title;
        this.taskTitle = title;    	
    },
    
    isTopCell: function() {
    	var isTopCell = false;
    	var rangeInfo = this.getRangeInfo();
    	if (rangeInfo != null) {
    		isTopCell = rangeInfo.startRow == '1';
    	}
    	
    	return isTopCell;
    },
    //flag = true means need to trancate the title.
    updateTitleContent: function(title, isTruncated) {
    	var titleFrame = this._topNode;
    	if (!this._titleSpan) {
    		this._titleSpan = dojo.create('span', null, titleFrame);	
    	}
    	//whether it's top cell
    	var isTopCell = this.isTopCell();
    	if (isTopCell) {
    		dojo.addClass(this._titleSpan, "concordTaskTitle_toprow");
    	}
		dojo.addClass(this._titleSpan, "concordTaskTitle");    	
		//whether needs to truncate
		if (isTruncated) {
			var widthLimit = dojo.style(this._topNode,"width");
			title = this.getTruncatedTitle(title,widthLimit);
		}

    	this._titleSpan.innerHTML = title;
    	this._titleSpan.title = title;
    },

    //true means add css, false means remove css
    updateTitleCss: function(cssName, flag) {
    	if (flag) {
    		dojo.addClass(this._titleSpan, cssName);
    	} else {
    		dojo.removeClass(this._titleSpan, cssName);
    	}   	
    },

    /*
     * Get truncated title due to fixed width
     */
    getTruncatedTitle: function(title, widthLimit){
    	//Minus dropdown button's width 20px
    	widthLimit = widthLimit - 20;
    	if(widthLimit <= 0) return title;
    	
    	var textBox = dojox.html.metrics.getTextBox(title, null, "concordTaskTitle");
    	var width = textBox.w;
    	if(width <= widthLimit) return title;
    	//Truncate title
    	var length = title.length;
    	
    	if(!this.appendix){
      	    this.appendix = dojox.html.metrics.getTextBox("...", null);  		
    	}
    	widthLimit = widthLimit - this.appendix.w;
    	
    	var truncLength = length * widthLimit/width -3;
    	return websheet.Utils.truncateStrWithEllipsis(title,truncLength);
    },
    
    publishTaskSelectedEvent: function(selected){
    	var taskEvent = [{taskId:this.taskId , selected:selected}];
    	concord.util.events.publish(concord.util.events.taskEvents_eventName_taskSelected,taskEvent)
	},
	
    addTitle : function(title, mode, actions, taskId, disable){
    	var coverFrame =  this._getCoverNode();
    	if(!coverFrame) return;
    	dojo.addClass(coverFrame, "concordTaskFrame");
    	this.connect(coverFrame, "onmouseover", dojo.hitch(this, this.doMouseHoverIn)); 
    	this.connect(coverFrame, "onmouseout", dojo.hitch(this, this.doMouseHoverOut));  		
    	//record the taskId
    	this.taskId = taskId; 
    	 
    	var titleFrame = this._topNode;
		  if(titleFrame){
			var style = titleFrame.getAttribute('style'); 
			//var rangeInfo = this.getRangeInfo();
			//var isTop = rangeInfo.startRow == '1';	
			
			var isTop = this.isTopCell();

			for (var index in this.STYLE){
				if (mode == index){
					dojo.addClass(coverFrame, this.STYLE[index]);
				}else{
					dojo.removeClass(coverFrame, this.STYLE[index]);
				}
			}
			if (this._titleSpan == null){
			    this._titleSpan = dojo.create('span', {role:'status'}, titleFrame);		    
			    dojo.addClass(this._titleSpan, "concordTaskTitle");
			    if(isTop){//task at the top of spreadsheet case
			    	  dojo.addClass(this._titleSpan, "concordTaskTitle_toprow");
			    }
			    this.connect(this._titleSpan, "onmouseover", dojo.hitch(this, this.doMouseHoverIn)); 
			    this.connect(this._titleSpan, "onmouseout", dojo.hitch(this, this.doMouseHoverOut)); 
			}
			var widthLimit = dojo.style(this._topNode,"width");
			this.updateTitle(title, widthLimit);
			
			var actionMenu = null; 
			if (this._ddBtnDiv == null){
				this._ddBtnDiv = dojo.create('span', null, titleFrame);					
				dojo.addClass(this._ddBtnDiv, "concordTaskDropDownBtn");
				if(isTop){//task at the top of spreadsheet case
					  dojo.addClass(this._ddBtnDiv, "concordTaskDropDownBtn_toprow");					  
				}
				this.connect(this._ddBtnDiv, "onmouseover", dojo.hitch(this, this.doMouseHoverIn)); 
				this.connect(this._ddBtnDiv, "onmouseout", dojo.hitch(this, this.doMouseHoverOut)); 	
			}
//			var _focus = this.isCellFocused();   
//			if(_focus){
//				this.bFocus = _focus;
//			}
//			if(this.bFocus){
//				this.hideRangeArea();
//			}else{
//				this.showRangeArea();    		              	
//			}
			this.toggleTaskInfo(this.bFocus);  				
			if (typeof disable == 'undefined')
				disable = false;	
            
			this.destroyDropDownBtn();
			
			if (actions != null && !disable){
				actionMenu = new dijit.Menu();
				dojo.addClass(actionMenu.domNode,"lotusActionMenu");
				this.bActionsBuilt = false;
			}
			var _parent = this;
			this._actionMenu = actionMenu;
			this._DropDownBtn = new dijit.form.DropDownButton({ disabled: disable,dropDown: this._actionMenu, value: "Actions"});
			this.dropDownBtnHandler = dojo.connect(this._DropDownBtn.focusNode, 'focus', dojo.hitch(this,function(){
				if(!this.bFocus)
					pe.scene.getTaskHdl().selectTask(this.taskId);
			}));			
			
			// lazy load action menus
			this._DropDownBtn.openDropDown = function(e){
				if (actionMenu && !_parent.bActionsBuilt){
					dojo.forEach(actions, dojo.hitch(_parent, function(actionType){
						var menuItem = null;
						if (actionType == ""){
							menuItem = new dijit.MenuSeparator;
						}else {
							var menuLabel = '';
							if (actionType == concord.beans.TaskService.ACTION_EDIT){
								menuLabel = this.nls.actionBtnEdit;
							}else if (actionType ==concord.beans.TaskService.ACTION_REMOVE){
								menuLabel = this.nls.actionBtnRemove;
							}else if (actionType ==concord.beans.TaskService.ACTION_WORKDONE){
								menuLabel = this.nls.actionBtnMarkComplete;
	//						}else if (actionType ==concord.beans.TaskService.ACTION_PRIVATE){
	//							menuLabel = this.nls.actionBtnWorkPrivately;
	//						}else if (actionType == concord.beans.TaskService.ACTION_GOTO_PRIVATE){
	//							menuLabel = this.nls.actionBtnGotoPrivate;
							}else if (actionType ==concord.beans.TaskService.ACTION_APPROVE){
								menuLabel = this.nls.actionBtnApprove;
							}else if (actionType ==concord.beans.TaskService.ACTION_REJECT){
								menuLabel = this.nls.actionBtnRework;
							}else if (actionType ==concord.beans.TaskService.ACTION_REOPEN){
								menuLabel = this.nls.actionBtnReopen;
							}else if (actionType ==concord.beans.TaskService.ACTION_REASSIGN){
								menuLabel = this.nls.actionBtnReassign;
							}else if (actionType ==concord.beans.TaskService.ACTION_ABOUT){
								menuLabel = this.nls.actionBtnAbout;
							}
							if (menuLabel){
								menuItem = new dijit.MenuItem({
									label: menuLabel,
									onClick: function(evt){
										pe.lotusEditor.getTaskHdl().doAction(taskId, actionType);
									},
									onMouseOver: function(evt){
										_parent.doMouseHoverIn();
									},
									onMouseOut: function(evt){
										_parent.doMouseHoverOut();
									}							
								});
							}
						}
						if (menuItem)
							actionMenu.addChild(menuItem);
					}));			
					_parent.bActionsBuilt = true;		
				}
				if(actionMenu){
					var children = actionMenu.getChildren();
					for( var _item = 0; _item < children.length -1; _item ++){
						dojo.style(children[_item].domNode,'display', pe.scene.isDocViewMode() ? 'none' : '');
					}					
				}
				this.inherited("openDropDown",arguments);	
			};
			this._ddBtnDiv.appendChild(this._DropDownBtn.domNode); 
		}
    },
    
    getDropDownButton : function(){
    	return this._DropDownBtn;
    },
    doClick: function(e){
    	if(this._DropDownBtn && (e.target == this._DropDownBtn.focusNode))
    		return;
		this.hideRangeArea();
		this.focusCellByRange(e);
		//then get the focus cell to set the other task cover node display status
		var editor = this.grid.base;
		var grid = editor.getCurrentGrid();
		var focusCellAddress = websheet.Helper.getCellAddr(grid.getSheetName(), (store.inRowIndex + 1), websheet.Helper.getColNum(store.inCell.field));
		editor.getTaskHdl().showRangeAreaByCellPos(focusCellAddress);
    },
    
    focused: function(bFocus){
    	if(this.bFocus == bFocus)return;
    	
    	this.bFocus = bFocus;
    	if(pe.scene.getTaskHdl().bShow && bFocus){
    		this.hideRangeArea();
    		this.toggleTaskInfo(true);
    	}else{
    		this.showRangeArea(); 
    		this.toggleTaskInfo(false);
    	}       
    	
    	this.publishTaskSelectedEvent(this.bFocus);
    },
    //Get to know whether the focused cell belongs to this taskframe
    isCellFocused: function(){
        var editor = this.grid.base;
		var grid = editor.getCurrentGrid();
		//var focusCellAddress = grid.getSheetName() + "." + store.inCell.field + (store.inRowIndex + 1) ;
		var focusCellAddress = websheet.Helper.getAddressByIndex(grid.getSheetName(), (store.inRowIndex + 1),
				websheet.Helper.getColNum(store.inCell.field), null, null, null, {refMask: websheet.Constant.CELL_MASK});
		var id = editor.getTaskHdl().getTaskIdByCellPos(focusCellAddress);
		if(id && id == this.taskId){
			return true;
		}
		var rangeAddress = this.getSelectedRangeAddress();
		var startAddress = rangeAddress.split(":")[0];
		if(focusCellAddress == startAddress){
			return true;
		}
		return false;
    },
    
    show: function(){
    	if (pe.scene.getTaskHdl().bShow)
    		this.inherited(arguments);
    },
    
    adjustWidth: function(width){
    	var oldWidth = this.getWidth();
      	this.inherited(arguments);
      	if(!this.taskTitle) return;
      	if (this.getWidth()!=oldWidth)
      		this.updateTitle(this.taskTitle, width);
    },
    
    destroyDropDownBtn: function(){
    	if (this._DropDownBtn != null){
      		if(this.dropDownBtnHandler!= null)
				dojo.disconnect(this.dropDownBtnHandler);
      		this._DropDownBtn.destroyRecursive();
      		this._DropDownBtn = null;
      		this._actionMenu = null;
      		this.bActionsBuilt = false;	
    	}
    },
    
     destroy: function()
    {
    	this.inherited(arguments);
    	this.destroyDropDownBtn();
    	if (this._titleSpan )
    	{
      		dojo.destroy(this._titleSpan);	
      		delete this._titleSpan;	    	
      		this._titleSpan = null;
    	}  
    	if (this._ddBtnDiv )
	    {
      		dojo.destroy(this._ddBtnDiv);	
      		delete this._ddBtnDiv;	 
      		this._ddBtnDiv = null;	
    	} 	      	
    }
});