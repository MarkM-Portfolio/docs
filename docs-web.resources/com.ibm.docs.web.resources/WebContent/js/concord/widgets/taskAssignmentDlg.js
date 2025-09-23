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

dojo.provide("concord.widgets.taskAssignmentDlg");
dojo.require("dijit.Dialog");
dojo.require("concord.widgets.concordDialog");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.Select");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.DateTextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("dijit.form.RadioButton");
dojo.require("dijit.form.SimpleTextarea");
dojo.require("lconn.core.PeopleTypeAhead");
dojo.require("lconn.core.PeopleDataStore");
dojo.require("dojo.i18n");
dojo.require("concord.util.date");
dojo.require("dojox.date.buddhist.Date");
dojo.require("concord.beans.Task");
dojo.require("concord.beans.TaskService");
dojo.requireLocalization("concord.widgets","taskAssignmentDlg");
dojo.require("concord.util.BidiUtils");
dojo.declare("concord.widgets.taskAssignmentDlg", [concord.widgets.concordDialog], {
	nls: null,
	WRITE_MODE: null,
	REVIEW_MODE: null,
	LOCK_MODE: null,
	
//	TASK_CREATE_TITLE: null,
	TASK_EDIT_TITLE: null,
	TASK_REWORK_TITLE: null,
	TASK_CREATE_SECTION_TITLE: null,
	TASK_CREATE_OPTION_TITLE: null,
	TASK_CREATE_SECTION_MODE : null,
	TASK_CREATE_WRITE_SECTION: null,
	TASK_CREATE_REVIEW_SECTION: null,
	TASK_CREATE_WRITE_CELLS: null,
	TASK_CREATE_REVIEW_CELLS: null,
	TASK_CREATE_ASSIGNEE: null,
	TASK_CREATE_DUEDATE: null,
	TASK_CREATE_DESCRIPTION: null,
	TASK_CREATE_DESCRIPTION_WITH_LIMITATION: null,
	TASK_CREATE_DESCRIPTION_CONTENT: null,
	TASK_CREATE_NEED_REVIEW: null,
	TASK_CREATE_REVIEWER: null,
	TASK_CREATE_INVALID_MSG: null,
	TASK_CREATE_INVALID_MSG2: null, 
	TASK_CREATE_WARNING_MSG: null,
	TASK_CREATE_WARNING_EMPTYTITLE_MSG: null,
	TASK_CREATE_WARNING_INVALIDLENGTH_MSG: null,
	TASK_CREATE_WARNING_REVIEWER_MSG: null,
	TASK_SELECT_ACTIVITY_MESSAGE: null,
	TASK_SELECT_ACTIVITY: null,
	TASK_SELECT_TASK_DEFAULT: null,
	TASK_CREATE_WARNING_EMPACTIVITYID_MSG: null,
	TASK_CREATE_WARNING_EMPACTIVITYNAME_MSG: null,
	TASK_NEW_ACTIVITY: null,
	TASK_CREATE_ACTIVITY_NAME: null,
	TASK_DATEFORMAT_INVALID_MSG: null,
	TASK_DUEDATE_EXAMPLE: null,
	TASK_HINT_CLOSE: null,
	
	taskBean: null,
	taskConfig: {},
	actionType: null,
	width: 0,
	orgAssigneeValue: null,
	orgReviewerValue: null,
	optContentValue: null,
	constraints: null,
	format: null,
	peopleStore: null,
	maxDescLength: 500,

	constructor: function(object, title, oklabel, visible, params) {
	},

	setDialogID: function() {
		this.dialogId = "C_d_AssignASectionDialog";
	},	
	
	_setNLSStr:function()
	{
		this.nls = dojo.i18n.getLocalization("concord.widgets","taskAssignmentDlg");
		if(this.nls)
		{
			this.WRITE_MODE = this.nls.WRITE_MODE;
			this.REVIEW_MODE = this.nls.REVIEW_MODE;
			this.LOCK_MODE = this.nls.LOCK_MODE;			
			this.TASK_SELECT_ACTIVITY_MESSAGE = this.nls.TASK_SELECT_ACTIVITY_MESSAGE;
//			this.TASK_CREATE_TITLE= this.nls.TASK_CREATE_TITLE;
			 
			this.TASK_EDIT_TITLE = this.nls.TASK_EDIT_TITLE; 
			this.TASK_REWORK_TITLE = this.nls.TASK_REWORK_TITLE;
			this.TASK_CREATE_SECTION_TITLE=this.nls.TASK_CREATE_SECTION_TITLE;
			this.TASK_CREATE_OPTION_TITLE= this.nls.TASK_CREATE_OPTION_TITLE;
			this.TASK_CREATE_SECTION_MODE = this.nls.TASK_CREATE_SECTION_MODE;
			this.TASK_CREATE_WRITE_SECTION= this.nls.TASK_CREATE_WRITE_SECTION;
			this.TASK_CREATE_REVIEW_SECTION= this.nls.TASK_CREATE_REVIEW_SECTION;
			this.TASK_CREATE_WRITE_CELLS = this.nls.TASK_CREATE_WRITE_CELLS;
			this.TASK_CREATE_REVIEW_CELLS = this.nls.TASK_CREATE_REVIEW_CELLS;
			this.TASK_CREATE_WRITE_SECTION_PRES= this.nls.TASK_CREATE_WRITE_SECTION_PRES;
			this.TASK_CREATE_REVIEW_SECTION_PRES= this.nls.TASK_CREATE_REVIEW_SECTION_PRES;
			this.TASK_CREATE_ASSIGNEE= this.nls.TASK_CREATE_ASSIGNEE;
			this.TASK_CREATE_DUEDATE= this.nls.TASK_CREATE_DUEDATE;
			this.TASK_CREATE_DESCRIPTION= this.nls.TASK_CREATE_DESCRIPTION;
			this.TASK_CREATE_DESCRIPTION_WITH_LIMITATION = dojo.string.substitute(this.nls.TASK_CREATE_DESCRIPTION_WITH_LIMITATION, [this.maxDescLength]);
			this.TASK_CREATE_DESCRIPTION_CONTENT= this.nls.TASK_CREATE_DESCRIPTION_CONTENT;
			this.TASK_CREATE_NEED_REVIEW= this.nls.TASK_CREATE_NEED_REVIEW;
			this.TASK_CREATE_NEED_REVIEW_PRES= this.nls.TASK_CREATE_NEED_REVIEW_PRES;
			this.TASK_CREATE_REVIEWER= this.nls.TASK_CREATE_REVIEWER;
			this.TASK_CREATE_INVALID_MSG= this.nls.TASK_CREATE_INVALID_MSG;
			this.TASK_CREATE_INVALID_MSG2= this.nls.TASK_CREATE_INVALID_MSG2;
			this.TASK_CREATE_WARNING_MSG= this.nls.TASK_CREATE_WARNING_MSG;
			this.TASK_CREATE_WARNING_EMPTYTITLE_MSG= this.nls.TASK_CREATE_WARNING_EMPTYTITLE_MSG;
			this.TASK_CREATE_WARNING_INVALIDLENGTH_MSG= this.nls.TASK_CREATE_WARNING_INVALIDLENGTH_MSG;
			this.TASK_CREATE_WARNING_REVIEWER_MSG= this.nls.TASK_CREATE_WARNING_REVIEWER_MSG;
			this.TASK_CREATE_ACTIVITY_NAME = this.nls.TASK_CREATE_ACTIVITY_NAME;
			this.TASK_NEW_ACTIVITY = this.nls.TASK_NEW_ACTIVITY;
			this.TASK_SELECT_TASK_DEFAULT = this.nls.TASK_SELECT_TASK_DEFAULT;
			this.TASK_SELECT_ACTIVITY = this.nls.TASK_SELECT_ACTIVITY;
			this.TASK_CREATE_WARNING_EMPACTIVITYNAME_MSG = this.nls.TASK_CREATE_WARNING_EMPACTIVITYNAME_MSG;
			this.TASK_CREATE_WARNING_EMPACTIVITYID_MSG = this.nls.TASK_CREATE_WARNING_EMPACTIVITYID_MSG;
			this.TASK_DATEFORMAT_INVALID_MSG = this.nls.TASK_DATEFORMAT_INVALID_MSG;
			this.TASK_DUEDATE_EXAMPLE = this.nls.TASK_DUEDATE_EXAMPLE;
			this.TASK_HINT_CLOSE = this.nls.TASK_HINT_CLOSE;
		}	
		
		var locale = dojo.i18n.normalizeLocale(null);
		var bundle = dojo.date.locale._getGregorianBundle(locale);
		this.format = bundle["dateFormat-medium"];
		this.constraints = {formatLength: 'medium', selector: 'date'};

	},
	

	createContent: function (contentDiv) {		
		this._setNLSStr();
		this.peopleStore = new lconn.core.PeopleDataStore({
			queryParam: "name",
			url: concord.util.uri.getDocUri() + '?method=getUserList&permission=edit'
		});		
		this.width = this.preferredWidth(contentDiv);
		dojo.style( contentDiv, "width", this.width+"px" );
		var tableDiv = dojo.create('div', null, contentDiv);
		
		var descComputeDiv = dojo.create('div',{id:'id_task_desc_compute'},tableDiv);
		descComputeDiv.style.display = 'none'; 
		
		var layoutTable = dojo.create('table', {width: '100%', align: 'center',role: 'presentation'}, tableDiv);
		var layoutTbody = dojo.create('tbody', null, layoutTable);
		
		if ((pe.scene.bean.getActivity() == null) && (g_activity))
			this.createActivitySelectArea(layoutTbody);	
		
		var row, cell, label, titleText;
		row = dojo.create('tr', null , layoutTbody);
		cell = dojo.create('td', {width: '100%'}, row);
		if(window.pe.scene.docType == "pres"){
			label = this.createLabel(this.TASK_CREATE_OPTION_TITLE, cell);
		}else{
			label = this.createLabel(this.TASK_CREATE_SECTION_TITLE, cell);
		}
		
			
		row=dojo.create('tr', null, layoutTbody);
		cell=dojo.create('td', {width: '100%'}, row);
		//div = this.createDiv(null, cell);
		titleText = this.createTextBox({id:"C_d_AssignASectionDialogtaskTitle", style: dojo.isIE ? {'width': '100%','height':'1.5em','padding-top':'2px'} : {'width': '100%'}}, cell);
		dijit.setWaiState(titleText.textbox,'label',this.nls.TASK_A11Y_TITLE);
		row=dojo.create('tr', null, layoutTbody);
		cell = dojo.create('td', {width: '100%'}, row);
		//div = this.createDiv(null, cell);
		label = this.createLabel(this.TASK_CREATE_ASSIGNEE, cell);
		
		row=dojo.create('tr', null, layoutTbody);
		cell=dojo.create('td', {width: '100%'}, row);
		//div = dojo.create('div', null, cell);
		var assigneeBox = this.createPeopleTypeAhead({id:'C_d_AssignASectionDialogassignee', style:{'width': '99%'}, autoComplete: false}, cell);
		if (BidiUtils.isBidiOn()){
        	var textDir = BidiUtils.getTextDir();
        	if (textDir == "contextual"){
        		dojo.connect(assigneeBox.focusNode, 'onkeyup', dojo.hitch(this, function(){
        			dojo.style( assigneeBox.focusNode, "direction", BidiUtils.calculateDirForContextual(assigneeBox.focusNode.value) );
			    }));
        	} else
        		dojo.style( assigneeBox.focusNode, "direction", textDir);
        }
		dijit.setWaiState(assigneeBox.focusNode,'label',this.nls.TASK_A11Y_ASSIGNEE); 

		row=dojo.create('tr', null, layoutTbody);
		cell = dojo.create('td', {width: '100%'}, row);
		
		//div = this.createDiv(null, cell);
		var subtable = dojo.create('table', {width: '95%', role: 'presentation'}, cell);
		var subtbody = dojo.create('tbody', null, subtable);
		row = dojo.create('tr', null, subtbody);
		cell = dojo.create('td', null, row);
		var txtCreateWrite = (pe.scene.docType == "sheet") ? this.TASK_CREATE_WRITE_CELLS : this.TASK_CREATE_WRITE_SECTION;
		if(pe.scene.docType == "pres"){
			txtCreateWrite = this.TASK_CREATE_WRITE_SECTION_PRES;
		}
		var writeRadio = this.createRadio({
				id: "C_d_AssignASectionDialogwriteType",
				type: "radio",
				name: "taskMode",
				value: this.WRITE_MODE,
				checked: true,
				onClick: dojo.hitch(this, "changeMode", this.WRITE_MODE)
		}, txtCreateWrite, cell);

		cell = dojo.create('td', null, row);
		//div = this.createDiv(null, cell);
		var txtCreateReview = (pe.scene.docType == "sheet") ? this.TASK_CREATE_REVIEW_CELLS : this.TASK_CREATE_REVIEW_SECTION;
		if(pe.scene.docType == "pres"){
			txtCreateReview = this.TASK_CREATE_REVIEW_SECTION_PRES;
		}
		var reviewRadio = this.createRadio({
				id: "C_d_AssignASectionDialogreviewType",
				type: "radio",
				name: "taskMode",
				value: this.REVIEW_MODE,
				onClick: dojo.hitch(this, "changeMode", this.REVIEW_MODE)
		}, txtCreateReview, cell);

		row=dojo.create('tr', null, layoutTbody);
		cell=dojo.create('td', {width: '100%'}, row);
		//div = this.createDiv(null, cell);
		label = this.createLabel(this.TASK_CREATE_DUEDATE, cell);
	
		row=dojo.create('tr', null, layoutTbody);
		cell=dojo.create('td', {width: '100%'}, row);
		//div = this.createDiv(null, cell);
	
		var example = dojo.date.locale.format(new Date(), this.constraints);
		var exampleMsg = dojo.string.substitute(this.TASK_DUEDATE_EXAMPLE, [example]);
		var invalidMessage = dojo.string.substitute(this.TASK_DATEFORMAT_INVALID_MSG, [this.format]);
		var date  = new Date();	
		if(concord.util.date.isBuddistLocale()){
			date = new dojox.date.buddhist.Date(date);
		}		
		var duedateBox = this.createDatePicker({id:'C_d_AssignASectionDialogduedate',
												constraints: this.constraints,
												promptMessage: exampleMsg,
				 								invalidMessage: invalidMessage, value: date}, cell);
		row=dojo.create('tr', null, layoutTbody);
		cell=dojo.create('td', {width: '100%'}, row);
		//div = this.createDiv(null, cell);
		label = this.createLabel(this.TASK_CREATE_DESCRIPTION_WITH_LIMITATION, cell);
		dojo.attr(label,'for','C_d_AssignASectionDialogtaskDescription');	
		row=dojo.create('tr', null, layoutTbody);
		cell=dojo.create('td', {width: '100%'}, row);		
		//div = this.createDiv(null, cell);
		var descText = this.createTextArea({id:"C_d_AssignASectionDialogtaskDescription",rows:2, cols:50,style: "width: 100%;", maxLength: this.maxDescLength}, cell);

		row=dojo.create('tr', null, layoutTbody);
		cell=dojo.create('td', {width: '100%'}, row);
		//div = this.createDiv(null, cell);
		if(window.pe.scene.docType =="pres"){
			this.TASK_CREATE_NEED_REVIEW = this.TASK_CREATE_NEED_REVIEW_PRES;
		}
		var checkbox = this.createCheckbox({
			id: 'C_d_AssignASectionDialogneedReview',
			onChange: dojo.hitch(this, 'showReviewer')
			}, 
			this.TASK_CREATE_NEED_REVIEW, cell);
		
		row = dojo.create('tr', {id: 'C_d_AssignASectionDialogreviewerRow1'}, layoutTbody);
		cell=dojo.create('td', {width: '100%'}, row);
		//div = this.createDiv(null, cell);
		label = this.createLabel(this.TASK_CREATE_REVIEWER, cell);
		dojo.style(row, 'display', 'none');

		row = dojo.create('tr', {id: 'C_d_AssignASectionDialogreviewerRow2'}, layoutTbody);
		cell=dojo.create('td', {width: '100%'}, row);
		dojo.style(row, 'display', 'none');
		//div = this.createDiv(null, cell);
		var reviewerBox = this.createPeopleTypeAhead({id:'C_d_AssignASectionDialogreviewer', style:{'width': '99%'}, required: false, autoComplete: false}, cell);
		if (BidiUtils.isBidiOn()){
        	var textDir = BidiUtils.getTextDir();
        	if (textDir == "contextual"){
        		dojo.connect(reviewerBox.focusNode, 'onkeyup', dojo.hitch(this, function(){
        			reviewerBox.focusNode.dir = BidiUtils.calculateDirForContextual(reviewerBox.focusNode.value);
			    }));
        	} else
        		reviewerBox.focusNode.dir = textDir;
        }
		dijit.setWaiState(reviewerBox.focusNode,'label',this.nls.TASK_A11Y_REVIEWER);
		if (BidiUtils.isBidiOn()){
			var bidiDir = BidiUtils.getTextDir();
			if (!duedateBox)
				duedateBox = dijit.byId('C_d_AssignASectionDialogduedate');
			if (!descText)
				descText = dijit.byId('C_d_AssignASectionDialogtaskDescription');
			if (bidiDir != ""){
				if (bidiDir != "contextual"){
					dojo.attr(titleText.textbox, "dir", bidiDir);
					dojo.attr(duedateBox.domNode, "dir", bidiDir);
					dojo.attr(descText.textbox, "dir", bidiDir);
				} else {
					dojo.connect(titleText.textbox, 'onkeyup', dojo.hitch(this, function(){
						dojo.attr(titleText.textbox, "dir", BidiUtils.calculateDirForContextual(titleText.textbox.value));
					}));
					dojo.attr(duedateBox.domNode, "dir", BidiUtils.calculateDirForContextual(duedateBox.displayedValue));
					dojo.connect(descText.textbox, 'onkeyup', dojo.hitch(this, function(){
						dojo.attr(descText.textbox, "dir", BidiUtils.calculateDirForContextual(descText.textbox.value));
					}));
				}
			}
		}
	},

	showReviewer : function(bShow){
		var rowLabel = dojo.byId('C_d_AssignASectionDialogreviewerRow1');
		var rowReviewer = dojo.byId('C_d_AssignASectionDialogreviewerRow2');
		if (!bShow){
			dojo.style(rowLabel,'display', 'none');
			dojo.style(rowReviewer, 'display' , 'none');
		}else{
			dojo.style(rowLabel,'display', '');
			dojo.style(rowReviewer, 'display' , '');
		}
		
	},
	
	changeMode : function(mode){
		var type = "delegationsection";
		var needReviewCheck = dijit.byId('C_d_AssignASectionDialogneedReview');
		if(mode == this.REVIEW_MODE){
			type = "reviewsection";
			if(needReviewCheck!=null){
				//needReviewCheck.attr('checked', false);
				needReviewCheck.setDisabled(true);
				this.showReviewer(false);
			}
		}else{
			type = "delegationsection";
			if(needReviewCheck!=null){
				needReviewCheck.setDisabled(false);
				if (needReviewCheck.attr('checked'))
					this.showReviewer(true);
				else
					this.showReviewer(false);
			}
		}
		if (this.taskBean == null || this.actionType == concord.beans.TaskService.ACTION_CREATE){
			if (this.getHandler() && this.getHandler().changeMode){
				this.getHandler().changeMode(type);
			}
		}
		
	},
	
	reset: function () {
		var bCreate = ((this.taskBean == null)|| (this.actionType == concord.beans.TaskService.ACTION_CREATE));
//		var title = this.TASK_CREATE_TITLE;
//		if (!bCreate){
//			if (this.actionType == concord.beans.TaskService.ACTION_CREATE){
//				title = this.TASK_CREATE_TITLE;
//			}else if (this.actionType == concord.beans.TaskService.ACTION_EDIT){
//				title = this.TASK_EDIT_TITLE;
//			}else if (this.actionType == concord.beans.TaskService.ACTION_REJECT){
//				title = this.TASK_REWORK_TITLE;
//			}			
//		}else{
//			this.actionType = concord.beans.TaskService.ACTION_CREATE;
//		}
//		
//		var dialog = this.dialog;
//		dialog.titleNode.innerHTML = title;
			
		if (bCreate){
			if ((pe.scene.bean.getActivity() == null) && (g_activity)){
				var message = dojo.byId('C_d_AssignASectionDialogactselectinfo');
				if (message)
					dojo.style(message, 'display', '');
			}
		}
		var textTitle = dijit.byId('C_d_AssignASectionDialogtaskTitle');	
		if(textTitle!=null){		
			if (this.taskBean && this.taskBean.getTitle())
				textTitle.setValue(this.taskBean.getTitle());
			else
				textTitle.setValue('');			
				
			if (this.actionType == concord.beans.TaskService.ACTION_REJECT)
				textTitle.setDisabled(true);
			else
				textTitle.setDisabled(false);
		}

		var duedateBox = dijit.byId('C_d_AssignASectionDialogduedate');
		if(duedateBox!=null){			 
			if (this.taskBean.getDuedate()){
				var date = new Date(this.taskBean.getDuedate());
				if(concord.util.date.isBuddistLocale()){
					date = new dojox.date.buddhist.Date(date);
				}
				duedateBox.setValue(date);
			}
		}
		var writeTypeRadio = dijit.byId('C_d_AssignASectionDialogwriteType');
		var reviewTypeRadio = dijit.byId('C_d_AssignASectionDialogreviewType');
		var assigneeBox = dijit.byId('C_d_AssignASectionDialogassignee');
		var reviewerBox = dijit.byId('C_d_AssignASectionDialogreviewer');
		var needReviewCheck = dijit.byId('C_d_AssignASectionDialogneedReview');
		var mode = this.WRITE_MODE;
		if ((this.taskBean.getAssignee()==null) && (this.taskBean.getReviewer()!=null)){
			mode = this.REVIEW_MODE;
		}
			
		if (mode == this.WRITE_MODE){
			writeTypeRadio.attr('checked', true);
			reviewTypeRadio.attr('checked', false);
			//this.changeMode(this.REVIEW_MODE);
			if (this.taskBean.getAssignee()!=null){
				this.orgAssigneeValue = this.composeUserName(this.taskBean.getAssignee());
				this.setPeopleWidgetValue(assigneeBox, this.taskBean.getAssignee());
			}else{
				assigneeBox.attr('displayedValue', "");
			}
			if (this.taskBean.getReviewer()!=null){
				needReviewCheck.attr('checked', true);
				this.orgReviewerValue = this.composeUserName(this.taskBean.getReviewer());
				this.setPeopleWidgetValue(reviewerBox, this.taskBean.getReviewer());
			}else {
				needReviewCheck.attr('checked', false);
				if (bCreate){
					this.orgReviewerValue = this.composeUserName(pe.authenticatedUser.getId());
					this.setPeopleWidgetValue(reviewerBox, pe.authenticatedUser);
				}else
					reviewerBox.attr('displayedValue', "");
			}
		}
		else{
			reviewTypeRadio.attr('checked', true);
			writeTypeRadio.attr('checked', false);
			if (this.taskBean.getReviewer()!=null){
				this.orgReviewerValue = this.composeUserName(this.taskBean.getReviewer());
				this.setPeopleWidgetValue(assigneeBox, this.taskBean.getReviewer());
			}else{
				assigneeBox.attr('displayedValue', "");
			}
		}
		this.changeMode(mode);

		var descText = dijit.byId('C_d_AssignASectionDialogtaskDescription');
		if(descText!=null) {					
			var value= this.taskBean.getContent();
			if(value){
			   var tmpDiv = dojo.byId('id_task_desc_compute');
			   tmpDiv.innerHTML = value;	
			   if(dojo.isFF){
			   	   value = tmpDiv.textContent.substring(0,this.maxDescLength);		
			   }else{
			   	   value = tmpDiv.innerText.substring(0,this.maxDescLength);			   	   			   	
			   }
			   this.optContentValue = value;		  		  
			}else{
			   this.optContentValue = '';
			}		
			descText.setValue(value);			 
		}	
		if (BidiUtils.isBidiOn()){
			var bidiDir = BidiUtils.getTextDir();
			if (bidiDir != "" && bidiDir == "contextual"){
				dojo.attr(textTitle.textbox, "dir", BidiUtils.calculateDirForContextual(textTitle.textbox.value));
				dojo.attr(descText.textbox, "dir", BidiUtils.calculateDirForContextual(descText.textbox.value));
			}		
		}
	},	
	
	show: function(){
		if (this.getHandler() && this.getHandler().onDialogShow)
			this.getHandler().onDialogShow(this);
		
		this.inherited(arguments);
	},
	
	onShow:function(editor){		
		var eventData = [{'eventName': concord.util.events.crossComponentEvents_eventName_inFocus,'componentName':'dialogs', 'presModal':true}];
		setTimeout(dojo.hitch(this, concord.util.events.publish,concord.util.events.presentationFocus, eventData), 25);
	},
	
	hide: function(){
		this.inherited(arguments);
		
		if (this.getHandler()!=null && this.getHandler().onDialogHide)
			this.getHandler().onDialogHide(this);
	},
	
	onOk: function (editor) {		
		//error handling
		var activityId = null;
		var activityName = null;
		if (g_activity){ // activity select is enabled
			if (pe.scene.bean.getActivity()==null){
			
				var activitySelect = dijit.byId('C_d_AssignASectionDialogactSelect');
				if (activitySelect.getValue()=='-1'){
					activitySelect.focus();
					this.setWarningMsg(this.TASK_CREATE_WARNING_EMPACTIVITYID_MSG);
					return false;
				}
				
				if (activitySelect.getValue()=='0'){
					var activityTitleBox = dijit.byId('C_d_AssignASectionDialogactivityTitle');
					activityName = activityTitleBox.getValue();
					if (activityName==""){
						activityTitleBox.focus();
						this.setWarningMsg(this.TASK_CREATE_WARNING_EMPACTIVITYNAME_MSG);
						return false;
					}
				}else{
					activityId = activitySelect.getValue();
				}
			}
		}
		var titleBox = dijit.byId('C_d_AssignASectionDialogtaskTitle');
		if (typeof titleBox != 'undefined' && titleBox!=null){
			if( ((titleBox.getValue()==null) || (titleBox.getValue() == "")) && window.pe.scene.docType != "pres"){
				titleBox.focus();
				this.setWarningMsg(this.TASK_CREATE_WARNING_EMPTYTITLE_MSG);
				return false;
			}else if(!this.isValidLengthTitle(titleBox.getValue())){
				titleBox.focus();
				this.setWarningMsg(this.TASK_CREATE_WARNING_INVALIDLENGTH_MSG);
				return false;				
			}
		}

		var assigneeBox = dijit.byId("C_d_AssignASectionDialogassignee");
		if(assigneeBox.attr('displayedValue')=="") {
			assigneeBox.focus();
			//get Warn Message Label in create task dialog
			this.setWarningMsg(this.TASK_CREATE_WARNING_MSG);
			return false;      
		}else{
			if (!this.isUserValid(this.getSelectedPeople(assigneeBox))){
				assigneeBox.focus();
				this.setWarningMsg(this.TASK_CREATE_INVALID_MSG);	       	  
				return false;      
			}
		} 

		var duedateBox = dijit.byId('C_d_AssignASectionDialogduedate');
		
		if (duedateBox!=null && !duedateBox.isValid()){
			duedateBox.focus();
			this.setWarningMsg(duedateBox.invalidMessage);
			return false;
		}
		
		var needReviewCheck = dijit.byId('C_d_AssignASectionDialogneedReview');
		var reviewerBox = dijit.byId('C_d_AssignASectionDialogreviewer');
		var bNeedReview;
		if(needReviewCheck!=null && reviewerBox!=null){
			bNeedReview = (needReviewCheck.attr('checked')) && (!needReviewCheck.disabled);
			if ( bNeedReview){	
				if(reviewerBox.attr('displayedValue')==""){
					reviewerBox.focus();
					this.setWarningMsg(this.TASK_CREATE_WARNING_REVIEWER_MSG);
					return false;
				}else{
					if (reviewerBox.attr('displayedValue')!=assigneeBox.attr('displayedValue')){
						if(!this.isUserValid(this.getSelectedPeople(reviewerBox))){
							reviewerBox.focus();
							this.setWarningMsg(this.TASK_CREATE_INVALID_MSG); 
							return false;			   	
						}
					}
				}
			}
		}
		//author access priviledge
		if (!this.isUserValid(pe.authenticatedUser.getId())){
			this.getCancelBtn().focus();
			this.setWarningMsg(this.TASK_CREATE_INVALID_MSG2);	       	  
			return false;      
		}		

		var writeTypeRadio = dijit.byId('C_d_AssignASectionDialogwriteType');
		var reviewTypeRadio = dijit.byId('C_d_AssignASectionDialogreviewType');
		
		var mode = (reviewTypeRadio.attr( 'checked')) ? this.REVIEW_MODE : this.WRITE_MODE;
		var assignee = null;
		var reviewer = null;
		var assigneeName = null;
		var reviewerName = null;
		if (mode == this.REVIEW_MODE){
			reviewer = this.getSelectedPeople(assigneeBox);
			reviewerName = assigneeBox.attr('displayedValue');
		}else{
			assignee = this.getSelectedPeople(assigneeBox);
			assigneeName = assigneeBox.attr('displayedValue');
		}
		var title, description, duedate;
		if(typeof titleBox != 'undefined'&& titleBox!=null) {
			title = titleBox.getValue();
		}
		if(typeof dijit.byId("C_d_AssignASectionDialogtaskDescription") != 'undefined'&& dijit.byId("C_d_AssignASectionDialogtaskDescription")!=null  ){
			description = dijit.byId("C_d_AssignASectionDialogtaskDescription").getValue();
		}
		if(reviewerBox!=null){
			reviewer = (bNeedReview && (mode != this.REVIEW_MODE)) ? this.getSelectedPeople(reviewerBox) : reviewer;
			reviewerName = (bNeedReview && (mode != this.REVIEW_MODE)) ? reviewerBox.attr('displayedValue') : reviewerName;
		}
		if(duedateBox!=null){
			duedate = duedateBox.getValue();
			if(concord.util.date.isBuddistLocale()){
				var year = duedate.getFullYear()-543; 
				//refer to dojox.date.buddhist.Date line 299
				duedate = new Date(year, duedate.getMonth(), duedate.getDate(), duedate.getHours(), duedate.getMinutes(), duedate.getSeconds(), duedate.getMilliseconds()); // Date	  
			}			
		}
		
		this.setWarningMsg("");
		//this.hide();
		var doWork = false;
		var action = null;
		if (this.actionType == concord.beans.TaskService.ACTION_CREATE){//create
			doWork = this.getHandler() && this.getHandler().assignTask;
			
			action = concord.beans.TaskService.util.buildCreateAction(title, assignee, reviewer, description, duedate, activityId, activityName);
			doWork = doWork && (action!=null);
			if (doWork)
				this.createTask(action);
		}else{//edit
			var prop = {};
			var updatedFields = new Array();
			var taskNLS = concord.beans.TaskService.util.getNLS();
			if (title != this.taskBean.getTitle()){
				prop['tasktitle'] = title;
				updatedFields[updatedFields.length] = this.buildFieldUpdateString(taskNLS.fieldTitle, this.taskBean.getTitle(), title); 				
			}
			if (assignee != this.taskBean.getAssignee()){
				prop['assignee'] = assignee;
				updatedFields[updatedFields.length] = this.buildFieldUpdateString(taskNLS.fieldAssignee, this.orgAssigneeValue, assigneeName);
			}
			if (reviewer != this.taskBean.getReviewer()){
				prop['reviewer'] = reviewer;
				updatedFields[updatedFields.length] = this.buildFieldUpdateString(taskNLS.fieldReviewer, this.orgReviewerValue, reviewerName);
			}
			if (description != this.optContentValue){
				prop['taskdesc'] = description;
				updatedFields[updatedFields.length] = this.buildFieldUpdateString(taskNLS.fieldDescription, this.taskBean.getContent(), description);
			}
			var oldDuedate = null;
			if (this.taskBean.getDuedate()!=null) 
				oldDuedate = new Date(this.taskBean.getDuedate());
			if ((duedate == null && oldDuedate != null)
				|| (oldDuedate == null && duedate != null)
				|| (duedate != null && duedate.getTime()!=oldDuedate.getTime())){
				if (duedate != null)
					prop['duedate'] = duedate.toUTCString();
				else
					prop['duedate'] = null;
				updatedFields[updatedFields.length] = this.buildFieldUpdateString(taskNLS.fieldDuedate, oldDuedate, duedate);
			}
			doWork = this.getHandler() && this.getHandler().updateTask;
			if(doWork){
				action = null;
				if(typeof this.taskConfig.beans != 'undefined'){
					var taskBeans = this.taskConfig.beans;
					doWork = (action = concord.beans.TaskService.util.buildUpdateAction(taskBeans[0], this.actionType, prop, updatedFields.join('<br/>')));
					if(doWork){
						action = concord.beans.TaskService.util.getUnionAction(taskBeans, action);						
						this.updateTasks(taskBeans, action);
					}
				}else{				
					doWork = (action = concord.beans.TaskService.util.buildUpdateAction(this.taskBean, this.actionType, prop, updatedFields.join('<br/>')));
					if (doWork){
						this.updateTask(this.taskBean, action);
					}					
				}
			}			
		}
		this.taskBean = null;
		this.taskConfig = {};
		this._destroy();
		return true;
	},
	
	createTask: function(action){
		if (this.dialog && this.dialog.open){
			setTimeout(dojo.hitch(this, this.createTask, action), 500);
		}
		else{
			this.getHandler().assignTask(action);
			this.taskBean = null;
			this.taskConfig = {};					
		}
	},
	
	updateTasks: function(taskBeans, action){
		if (this.dialog && this.dialog.open){
			setTimeout(dojo.hitch(this, this.updateTasks, taskBeans, action), 500);
		}
		else{
			this.getHandler().updateTasks(taskBeans, action);
		}
	},
		
	updateTask: function(taskBean, action){
		if (this.dialog && this.dialog.open){
			setTimeout(dojo.hitch(this, this.updateTask, taskBean, action), 500);
		}
		else{
			this.getHandler().updateTask(taskBean, action);
		}
	},
	
	onCancel: function (editor) {
		// "cancelTask"
		if (this.actionType == concord.beans.TaskService.ACTION_CREATE){
			if (this.getHandler() && this.getHandler().cancelAssignment)
				this.getHandler().cancelAssignment();
		}
		this.taskBean = null;
		this.taskConfig = {};
		this._destroy();
		return true;
	},
	
	createActivitySelectArea: function(table){
		var row, cell;
		row = dojo.create('tr', {id: 'select_activity_message'} , table);
		cell = dojo.create('td', {width: '100%'}, row);

		this.createMessageDiv(this.TASK_SELECT_ACTIVITY_MESSAGE, cell);
		
		row = dojo.create('tr', null, table);
		cell = dojo.create('td', {width: '100%'}, row);
		var label = this.createLabel(this.TASK_SELECT_ACTIVITY, cell);
		
		row = dojo.create('tr', null, table);
		cell = dojo.create('td', {width: '100%'}, row);
		this.createActivitySelector(cell);
		
		row = dojo.create('tr', {id: 'C_d_AssignASectionDialognewActivityRow1'}, table);
		cell = dojo.create('td', {width: '100%'}, row);
		label = this.createLabel(this.TASK_CREATE_ACTIVITY_NAME, cell);
		dojo.style(row, 'display', 'none');	
		
		row = dojo.create('tr', {id: 'C_d_AssignASectionDialognewnewActivityRow2'}, table);
		cell = dojo.create('td', {width: '100%'}, row);
		textinput = this.createTextBox({id:"C_d_AssignASectionDialogactivityTitle", style:{'width': '100%'}}, cell);
		textinput.setValue(pe.scene.bean.getTitle());
		dojo.style(row, 'display', 'none');
		
		row = dojo.create('tr', null, table);
		cell = dojo.create('td', {width: '100%'}, row);
		var hr = dojo.create('hr', null, cell);
	},
	
	showActivityTitle: function(bShow){
		var rowLabel = dojo.byId('C_d_AssignASectionDialognewActivityRow1');
		var rowActivity = dojo.byId('C_d_AssignASectionDialognewnewActivityRow2');
		if (!bShow){
			dojo.style(rowLabel,'display', 'none');
			dojo.style(rowActivity, 'display' , 'none');
		}else{
			dojo.style(rowLabel,'display', '');
			dojo.style(rowActivity, 'display' , '');
		}
		
	},

	createMessageDiv: function (text, container){
		var parentDiv = dojo.create('div', null, container);
		dojo.addClass(parentDiv, 'lotusMessage2');
		dojo.addClass(parentDiv, 'lotusInfo');
		//dojo.style(parentDiv, 'position', 'relative');
		dojo.attr(parentDiv, "id", 'C_d_AssignASectionDialogactselectinfo');
		dojo.style(parentDiv, 'display', 'none');
		var img = dojo.create('img',
					{src: contextPath + window.staticRootPath + '/js/dojo/resources/blank.gif', 
					alt: 'Information'}, parentDiv);
		dojo.addClass(img, 'lotusIcon');
		dojo.addClass(img, 'yourProductSprite yourProductSprite-msgInfo16');
		
		var span = dojo.create('span',null, parentDiv);
		span.innerHTML='Information:';
		dojo.addClass(span, 'lotusAltText');
		
		var div = dojo.create('div', null, parentDiv);
		dojo.addClass(div, 'lotusMessageBody');
		div.innerHTML = text;
		
		var closeLink = dojo.create('a',  {role: 'button',
										 //  href: 'javascript:;',	
											title: this.TASK_HINT_CLOSE}
											, parentDiv);
		dojo.addClass(closeLink, 'lotusDelete');
	
		img = dojo.create('img',
				{
				 id: 'C_d_AssignASectionDialogHideMsg',
				 src: contextPath + window.staticRootPath + '/js/dojo/resources/blank.gif', 
				 alt: this.TASK_HINT_CLOSE,
				 onclick: function()
				 {
					var message = dojo.byId('C_d_AssignASectionDialogactselectinfo');
					dojo.style(message, 'display', 'none');		
					message = null;				 	
				 }
				}, 
				 closeLink);
		span = dojo.create('span',null, closeLink);
		span.innerHTML='X';
		dojo.addClass(span, 'lotusAltText');
		return parentDiv;
	},
		
	createActivitySelector: function(container){
		var activities = concord.beans.TaskService.getActivities();
		
		var options = new Array();
		
		options[0] = {
			label: this.TASK_SELECT_TASK_DEFAULT,
			value: '-1',
			selected: true
		};
		
		options[1] = {
			label: this.TASK_NEW_ACTIVITY,
			value: '0'
		};
		
		for (var i = 0; i < activities.length; i++)
		{
			var index = options.length;
			options[index]={
				label: activities[i].getTitle(),
				value: activities[i].getId()
			};
			
		}
		
		var actSelect = new dijit.form.Select({
            name: 'actSelect',
            id: 'C_d_AssignASectionDialogactSelect',
            options: options,
            style: {'width': '100%'},
            onChange: function(value){
				var rowLabel = dojo.byId('C_d_AssignASectionDialognewActivityRow1');
				var rowActivity = dojo.byId('C_d_AssignASectionDialognewnewActivityRow2');
				if (value!='0'){
					dojo.style(rowLabel,'display', 'none');
					dojo.style(rowActivity, 'display' , 'none');
				}else{
					dojo.style(rowLabel,'display', '');
					dojo.style(rowActivity, 'display' , '');
				}}
	    });
	    
	    options = null;
	    activities = null;
	    
        dojo.addClass(actSelect.domNode, 'activitySelectLabel');
        
        container.appendChild(actSelect.domNode);
	},
	
	createLabel: function(text, container){
		var label = dojo.create('label', null, container);
		label.appendChild(dojo.doc.createTextNode(text));
		//dojo.addClass (label, "concordTaskLabel");
		return label;
	},

	createCheckbox: function(attributes, text, container){
		var checkbox = new dijit.form.CheckBox(attributes);
		if (attributes.style)
			dojo.attr(checkbox.domNode, attributes.style);
		
		container.appendChild(checkbox.domNode);
		//dojo.addClass(checkbox.domNode, "concordTaskCheckBox");

		var label = this.createLabel(text, container);
		dojo.attr(label, "for", attributes.id);
		return checkbox;
	},

	createRadio: function(attributes, text, container){
		var radio = new dijit.form.RadioButton(attributes);
		if (attributes.style)
			dojo.attr(radio.domNode, attributes.style);
		container.appendChild(radio.domNode);
		//dojo.addClass(radio.domNode, "concordTaskRadio");
		var label = this.createLabel(text, container);
		dojo.attr(label, "for", attributes.id);
		return radio;
	},

	createTextArea: function(attributes, container){
		var textarea = new dijit.form.SimpleTextarea(attributes);
		if (attributes.style)
			dojo.attr(textarea.domNode, attributes.style);
        container.appendChild(textarea.domNode);
        	//dojo.addClass (textarea.domNode, "concordTaskDescText");
		return textarea;
	},

	createTextBox: function(attributes, container){
		var textbox = new dijit.form.TextBox(attributes);
		if (attributes.style)
			dojo.attr(textbox.domNode, attributes.style);
		dijit.setWaiState(textbox.textbox,'required','true');	
		dijit.setWaiState(textbox.textbox,'invalid','true');
		container.appendChild(textbox.domNode);
		dojo.connect(textbox, "onChange", dojo.hitch( this, function(){
			dijit.setWaiState(textbox.focusNode, "invalid", false);
		}));        
        	//dojo.addClass (textbox.domNode, "concordTaskDescText");
		return textbox;
	},

	createDiv: function(attribute, container){
		var div = dojo.create('div', attribute, container);
        	//dojo.addClass(div, "concordDialogDivMargin");
		return div;
	},

	createPeopleTypeAhead: function(attribute, container){
		var input = dojo.create('input', attribute, container);
		var w2 = new lconn.core.PeopleTypeAhead({
			token: " ", // FIXME: bug, shouldn't require a default token
			store: this.peopleStore,
			selectOnClick: true
		}, input);	
		dijit.setWaiState(w2.domNode,'required','true');
		dojo.style(w2.domNode, 'width', '99%');
		if(dojo.isIE){
			dojo.style(w2.domNode, 'height', '1.5em');
		}
		return w2;
	},

	createDatePicker: function(attribute, container){
		var dateBox = new dijit.form.DateTextBox(attribute);
		if(dojo.isIE){
			dojo.addClass(dateBox.domNode,"ie_task_input");			
		}
		dijit.setWaiState(dateBox.focusNode,'label',this.nls.TASK_A11Y_DUEDATE);
		dijit.setWaiState(dateBox.focusNode,'required','true');
		container.appendChild(dateBox.domNode);
		//dojo.addClass(dateBox.domNode, 'concordTaskDate');
	},

	getSelectedPeople: function(widget){
		if (!widget)
			return null;
		var item = widget.getItem();
		if (item){
			return item.userid;
		}
		else return null;
	},
	setPeopleWidgetValue: function(widget, userid){
		if (!widget)
			return;
		var isBidiOn = BidiUtils.isBidiOn();
		if (userid != null){
			var user = null
			if (dojo.isObject(userid)){
				user = userid;
				userid = user.getId();
			}else
				user = ProfilePool.getUserProfile(userid);
			var displayName = "";
			if (user != null){
				if(user.getEmail()){
				    displayName = (isBidiOn ? BidiUtils.addEmbeddingUCC(user.getName()) : user.getName()) + ' <' + user.getEmail() +'>';
				}else{
				    displayName = isBidiOn ? BidiUtils.addEmbeddingUCC(user.getName()) : user.getName();
				}
				widget.attr('displayedValue', displayName);
				widget.item={userid: userid, name: user.getName(), email: user.getEmail(), type: 0};
				return;
			}
		}
		// for other cases
		widget.attr('displayedValue', '');
		
	},
	getHandler: function(){
		if ((this.editor) && (this.editor.getTaskHdl))
			return this.editor.getTaskHdl();
		else if(window.pe.scene.docType == "pres"){
			return window.pe.scene.slideSorter.getTaskHdl();
		}else
			return null;
	},

	composeUserName: function(id){
		var user = ProfilePool.getUserProfile(id);
		if (user != null){
			if(user.getEmail()){
			    return user.getName() + ' <' + user.getEmail() +'>';
			}else{
			    return user.getName();
			}
		}else{
			return '';
		}
	},	
	
	preferredWidth: function(container){
		var testLabel = this.createLabel(this.TASK_CREATE_REVIEW_SECTION, container);
		var width = testLabel.offsetWidth;
		var preferredWidth = 400;
		if ((pe.scene.bean.getActivity() != null) || (!g_activity)){
			preferredWidth = (width+16)*2 + 60; // 16 radio width; 40 margin; 20 buffer
		}else{
			var len1 = this.TASK_CREATE_REVIEW_SECTION.length;
			var len2 = this.TASK_SELECT_ACTIVITY_MESSAGE.length;
			preferredWidth = (len2/len1)*width/3 + 80; // 80 margin; 3 lines
		}
		//in dialog.css , dijitSelectLabel is 370px;
		if(preferredWidth < 400) preferredWidth = 400;
		
		dojo.destroy(testLabel);
		return preferredWidth;
	},
	
	buildFieldUpdateString: function(field, oldValue, newValue){
		var taskNLS = concord.beans.TaskService.util.getNLS();
		var str1 = "";
		var str2 = "";
		if (oldValue != null){
			if (oldValue instanceof Date)
				str1 = dojo.date.locale.format(oldValue, this.constraints);
			else
				str1 = oldValue;
		}else{
			str1 = taskNLS.emptyFieldValue;
		}
		
		if (newValue != null){
			if (newValue instanceof Date)
				str2 = dojo.date.locale.format(newValue, this.constraints);
			else
				str2 = newValue;
		
		}else{
			str2 = taskNLS.emptyFieldValue;
		}
			
		return dojo.string.substitute(taskNLS.updatedFieldsDesc, [field, str1, str2]); 				
	},
	isValidLengthTitle: function(docName){
		// the MAX file name length limited by Connection Files(not includes extension name).
		var MAX_FILENAME_LENGTH = 248;
		if (!docName) {
			return true;
		}
		// compute bytes length in UTF-8.
		var byteslength = 0;
		for ( var i = 0; i < docName.length; i++) {
			var c = docName.charCodeAt(i);
			if (c <= 127) {
				byteslength++;
			} else if (c <= 2047) {
				byteslength += 2;
			} else if (c <= 65535) {
				byteslength += 3;
				if ((c >> 11) == 27) {
					byteslength++;
					i++;
				}
			} else {
				bytes += 4;
			}
		}
		return (byteslength <= MAX_FILENAME_LENGTH);
	},
		
	isUserValid: function(userid)
	{
		if (!userid)
			return false;
			
		var bValid = false;
		var theUrl = concord.util.uri.getDocUri() + '/permission?id=' + userid;
    	var response, ioArgs;
        dojo.xhrGet({
            url: theUrl,
            handle: function(r, io){
                response = r;
                ioArgs = io;
            },
            sync: true,
            handleAs: "json",
            preventCache: true
        });
        if (response instanceof Error) {
            bValid = false;
        }
        else if (response){
            var result = response.permission;
            if (result == "EDIT") {
                bValid = true;
            }
        }
        return bValid;
	}
});
