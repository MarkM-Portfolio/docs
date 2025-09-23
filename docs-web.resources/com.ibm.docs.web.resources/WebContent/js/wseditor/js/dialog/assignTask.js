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

/**
 * this dialog is out of use.
 */
dojo.provide("websheet.dialog.assignTask");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.requireLocalization("websheet.dialog","assignTask");
dojo.declare("websheet.dialog.assignTask", [concord.widgets.concordDialog], {
	nls: null,
	WRITE_MODE: null,
	REVIEW_MODE: null,
	LOCK_MODE: null,
	
	TASK_CREATE_TITLE: null,
	TASK_CREATE_SECTION_MODE : null,
	TASK_CREATE_WRITE_SECTION: null,
	TASK_CREATE_REVIEW_SECTION: null,
	TASK_CREATE_ASSIGNEE: null,
	TASK_CREATE_DESCRIPTION: null,
	TASK_CREATE_DESCRIPTION_CONTENT: null,
	TASK_CREATE_INVALID_MSG: null,
	TASK_CREATE_WARNING_MSG: null,
	
	
	constructor: function() {
		//	this.inherited(editor, "Assign a Section", "Confirm");
		this._setNLSStr();
	},
	setDialogID: function() {
		// Overridden
		this.dialogId="S_d_assignTask";
		this.taskTypeReviewRadioID="S_d_assignReviewType";
		this.taskTypeWriteRadioID="S_d_assignWriteType";
		return;
	},
	_setNLSStr:function()
	{
		this.nls = dojo.i18n.getLocalization("websheet.dialog","assignTask");
		if(this.nls)
		{
			this.WRITE_MODE = this.nls.WRITE_MODE;
			this.REVIEW_MODE = this.nls.REVIEW_MODE;
			this.LOCK_MODE = this.nls.LOCK_MODE;
			
			this.TASK_CREATE_TITLE= this.nls.TASK_CREATE_TITLE;   
			this.TASK_CREATE_SECTION_MODE = this.nls.TASK_CREATE_SECTION_MODE;
			this.TASK_CREATE_WRITE_SECTION= this.nls.TASK_CREATE_WRITE_SECTION;
			this.TASK_CREATE_REVIEW_SECTION= this.nls.TASK_CREATE_REVIEW_SECTION;
			this.TASK_CREATE_ASSIGNEE= this.nls.TASK_CREATE_ASSIGNEE;
			this.TASK_CREATE_DESCRIPTION= this.nls.TASK_CREATE_DESCRIPTION;
			this.TASK_CREATE_DESCRIPTION_CONTENT= this.nls.TASK_CREATE_DESCRIPTION_CONTENT;
			this.TASK_CREATE_INVALID_MSG= this.nls.TASK_CREATE_INVALID_MSG;
			this.TASK_CREATE_WARNING_MSG= this.nls.TASK_CREATE_WARNING_MSG;
		}	
	},
	
//	createContent: function (contentDiv) {		
//		this._setNLSStr();	
//		// assignee
//		var nameDiv = dojo.create('div', null, contentDiv);
//		var nameLabel = dojo.create('label', null, nameDiv);
//		nameLabel.appendChild(dojo.doc.createTextNode(this.TASK_CREATE_ASSIGNEE));
//		dojo.addClass (nameLabel, "concordTaskLabel");
//		
//		var assigneeBox = new concord.widgets.PeopleTypeAhead({id:"assignee"});    	
//		nameDiv.appendChild(assigneeBox.domNode);
//		dojo.style(assigneeBox.domNode, {"width":"250px"});
//		dojo.addClass (assigneeBox.domNode, "concordLiveName");
//		
//		var assignDiv = dojo.create('div', null, contentDiv);
//		var assignLabel = dojo.create('label', null, assignDiv);
//		assignLabel.appendChild(dojo.doc.createTextNode(this.TASK_CREATE_SECTION_MODE));
//		dojo.addClass (assignLabel, "concordTaskName");
//		dojo.addClass (nameDiv, "concordTaskHead");
//		
//		var radio2 = null;
//		if(dojo.isIE){
//			radio2 = dojo.create("<input name='taskType2' type='radio'/>", null, assignDiv);
//			radio2.id = "type2";
//			radio2.value = this.WRITE_MODE;
//			radio2.checked = true;
//		}else{
//			radio2 = dojo.create('input', null, assignDiv);
//			dojo.attr(radio2, {
//				id: "type2",
//				type: "radio",
//				name: "taskType2",
//				checked: "checked",
//				value: this.WRITE_MODE
//			});
//		}
//		
//		var label2 = dojo.create('label', null, assignDiv);
//		dojo.attr(label2, "for", "type2");
//		label2.appendChild(dojo.doc.createTextNode(this.TASK_CREATE_WRITE_SECTION));
//		
//		//assgine mode
//		var radio1 = null;
//		if(dojo.isIE){
//			radio1 = dojo.create("<input name='taskType1' type='radio'/>", null, assignDiv);
//			radio1.id = "type1";
//			radio1.value = this.REVIEW_MODE;
//		}else{
//			radio1 = dojo.create('input', null, assignDiv);
//			dojo.attr(radio1, {	
//				id: "type1",
//				type: "radio",
//				name: "taskType1",
//				value: this.REVIEW_MODE
//			});
//		}
//		
//		var label1 = dojo.create('label', null, assignDiv);
//		dojo.attr(label1, "for", "type1");
//		label1.appendChild(dojo.doc.createTextNode(this.TASK_CREATE_REVIEW_SECTION));
//		dojo.addClass (radio1, "concordDialogRadio");
//		dojo.addClass (radio2, "concordDialogRadio");
//		dojo.addClass(assignDiv, "saveDocumentDescText");
//
//		// description label
//		var descLabelDiv = dojo.create('div', null, contentDiv);
//		var descLabel = dojo.create('label', null, descLabelDiv);
//		descLabel.appendChild(dojo.doc.createTextNode(this.TASK_CREATE_DESCRIPTION));
//		dojo.addClass (descLabel, "concordTaskDescLabel");
//		
//		var descText = new dijit.form.SimpleTextarea({id:"taskDescption",rows:2, cols:40});
//		descText.setValue(this.TASK_CREATE_WRITE_SECTION);
//        descLabelDiv.appendChild(descText.domNode);
//        dojo.addClass (descText.domNode, "concordTaskDescText");
//        dojo.addClass(descLabelDiv, "concordDialogDivMargin");
//
//		dojo.connect(radio1, 'onclick', dojo.hitch(this, "changeDescription", this.REVIEW_MODE));
//		dojo.connect(radio2, 'onclick', dojo.hitch(this, "changeDescription", this.WRITE_MODE));
//		
//		assigneeBox.focus();
//	},

	createContent: function (contentDiv) {		
		this._setNLSStr();	
		// assignee
		var layoutTable = dojo.create('table', null, contentDiv);
		var layoutTbody = dojo.create('tbody', null, layoutTable);
		var row1=dojo.create('tr', null, layoutTbody);
		var row2=dojo.create('tr', null, layoutTbody);
		var row3=dojo.create('tr', null, layoutTbody);
		var nameLTD=dojo.create('td', null, row1);
		var nameRTD=dojo.create('td', null, row1);
		var nameLabel = dojo.create('label', null, nameLTD);
		nameLabel.appendChild(dojo.doc.createTextNode(this.TASK_CREATE_ASSIGNEE));
		dojo.addClass (nameLabel, "concordTaskLabel");
		
		var nameDiv = dojo.create('label', null, nameRTD);
		var assigneeBox = new concord.widgets.PeopleTypeAhead({id:"assignee"});    	
		nameDiv.appendChild(assigneeBox.domNode);
		dojo.style(assigneeBox.domNode, {"width":"250px"});
		dojo.addClass (assigneeBox.domNode, "concordLiveName");
		
		var modeLTD=dojo.create('td', null, row2);
		var modeRTD=dojo.create('td', null, row2);
		
		var assignLabel = dojo.create('label', null, modeLTD);
		assignLabel.appendChild(dojo.doc.createTextNode(this.TASK_CREATE_SECTION_MODE));
		dojo.addClass (assignLabel, "concordTaskName");
		dojo.addClass (nameDiv, "concordTaskHead");
		
		var writeDiv = dojo.create('div', null, modeRTD);
		var radio2 = null;
		if(dojo.isIE){
			radio2 = dojo.create("<input name='taskType2' type='radio'/>", null, writeDiv);
			radio2.value = this.WRITE_MODE;
			radio2.id=this.taskTypeWriteRadioID;
			radio2.checked = true;
		}else{
			radio2 = dojo.create('input', null, writeDiv);
			dojo.attr(radio2, {
				id: taskTypeWriteRadioID,
				type: "radio",
				name: "taskType2",
				checked: "checked",
				value: this.WRITE_MODE
			});
		}
		
		var label2 = dojo.create('label', null, writeDiv);
		dojo.attr(label2, "for", this.taskTypeWriteRadioID);
		label2.appendChild(dojo.doc.createTextNode(this.TASK_CREATE_WRITE_SECTION));
		dojo.addClass(writeDiv, "concordTaskRadio");
		//assgine mode
		var reviewDiv = dojo.create('div', null, modeRTD);
		var radio1 = null;
		if(dojo.isIE){
			radio1 = dojo.create("<input name='taskType1' type='radio'/>", null, reviewDiv);
			radio1.id = this.taskTypeReviewRadioID;
			radio1.value = this.REVIEW_MODE;
		}else{
			radio1 = dojo.create('input', null, reviewDiv);
			dojo.attr(radio1, {	
				id: taskTypeReviewRadioID,
				type: "radio",
				name: "taskType1",
				value: this.REVIEW_MODE
			});
		}
		
		var label1 = dojo.create('label', null, reviewDiv);
		dojo.attr(label1, "for", this.taskTypeReviewRadioID);
		label1.appendChild(dojo.doc.createTextNode(this.TASK_CREATE_REVIEW_SECTION));
		dojo.addClass (radio1, "concordDialogRadio");
		dojo.addClass (radio2, "concordDialogRadio");
		dojo.addClass(reviewDiv, "concordTaskRadio");
		
		// description label
		var descLTD=dojo.create('td', null, row3);
		var descRTD=dojo.create('td', null, row3);
		var descLabel = dojo.create('label', null, descLTD);
		descLabel.appendChild(dojo.doc.createTextNode(this.TASK_CREATE_DESCRIPTION));
		dojo.addClass (descLabel, "concordTaskDescLabel");
		
		var descLabelDiv = dojo.create('div', null, descRTD);
		var descText = new dijit.form.SimpleTextarea({id:"taskDescption",rows:2, cols:40, style:{width:'100%'}});
		descText.setValue(this.TASK_CREATE_DESCRIPTION_CONTENT);
        descLabelDiv.appendChild(descText.domNode);
        dojo.addClass (descText.domNode, "concordTaskDescText");
        dojo.addClass(descLabelDiv, "concordDialogDivMargin");

		dojo.connect(radio1, 'onclick', dojo.hitch(this, "changeDescription", this.REVIEW_MODE));
		dojo.connect(radio2, 'onclick', dojo.hitch(this, "changeDescription", this.WRITE_MODE));
		
		//assigneeBox.focus();
	},
	changeDescription : function(mode){
		if(mode == this.WRITE_MODE){
			var reviewRadio = dojo.byId(this.taskTypeReviewRadioID);
			reviewRadio.checked = false;
		}else if(mode == this.REVIEW_MODE){
			var writeRadio = dojo.byId(this.taskTypeWriteRadioID);
			writeRadio.checked = false;
		}
//		var descTextBox = dijit.byId("taskDescption");
//		if (descTextBox != null)
//		{
//			var desc = descTextBox.getValue();
//			if(desc == this.TASK_CREATE_WRITE_SECTION
//					|| desc == this.TASK_CREATE_REVIEW_SECTION)
//			{
//				if(mode == this.WRITE_MODE){
//					desc = this.TASK_CREATE_WRITE_SECTION;
//				}else if(mode == this.REVIEW_MODE){
//					desc = this.TASK_CREATE_REVIEW_SECTION;
//				}
//				descTextBox.setValue(desc);
//			}
//		}
	},
	
	reset: function () {
		var reviewRadio = dojo.byId(this.taskTypeReviewRadioID);
		reviewRadio.checked = false;
		var writeRadio = dojo.byId(this.taskTypeWriteRadioID);
		writeRadio.checked = true;
		var assigneeBox = dijit.byId('assignee');
//		assigneeBox.textbox.value = "";
		assigneeBox.attr('displayedValue', "");
		//assigneeBox.onFirstLoad();
		var descText = dijit.byId('taskDescption');
		descText.setValue(this.TASK_CREATE_DESCRIPTION_CONTENT);
	},
	
	onOk: function (editor) {		
		// "assignTask"
		//error handling
		var assigneeBox = dijit.byId("assignee");
		if (!assigneeBox.isValid()) {
			//get Warn Message Label in create task dialog
	        this.setWarningMsg(this.TASK_CREATE_WARNING_MSG);
	        return false;
		}
		editor.getTaskHdl().assignTask(null, dijit.byId("assignee"), dojo.byId(this.taskTypeReviewRadioID), dojo.byId(this.taskTypeWriteRadioID), dijit.byId("taskDescption"));
		return true;
	},
	
	onCancel: function (editor) {
		// "cancelTask"
		return true;
	}
	
	
});
