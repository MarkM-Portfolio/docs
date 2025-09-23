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

dojo.provide("concord.widgets.deleteTaskDlg");
dojo.require("dijit.Dialog");
dojo.require("concord.widgets.concordDialog");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets","deleteTaskDlg");
dojo.declare("concord.widgets.deleteTaskDlg", [concord.widgets.concordDialog], {
	taskId: null,
	constructor: function(object, title, oklabel, visible, taskId) {
		this.taskId = taskId;
	},
	
	createContent: function (contentDiv) {
		var doc = dojo.doc;
		var msgsDiv = dojo.create('div', null, contentDiv);
		msgsDiv.id = "DeleteTaskDlgId_" + (new Date()).getTime();		
		this.describedInfoId = msgsDiv.id ;  
		
		var questionDiv = dojo.create('div', null, msgsDiv);
		var textNode = doc.createTextNode(dojo.i18n.getLocalization("concord.widgets","deleteTaskDlg").confirmMsg1);
		questionDiv.appendChild(textNode);
		dojo.addClass (questionDiv, "concordDialogBold");

		questionDiv = dojo.create('div', null, msgsDiv);
		textNode = doc.createTextNode(dojo.i18n.getLocalization("concord.widgets","deleteTaskDlg").confirmMsg2);
		questionDiv.appendChild(textNode);
		dojo.addClass (questionDiv, "concordDialogBold");
		
	},
	
	setDialogID: function() {
		this.dialogId = "C_d_DeleteTaskDialog";
	},	
	
	onOk: function (editor) {
		
		if (this.getHandler() && this.getHandler().taskDelete){
			this.deleteTask(this.taskId);
		}
		return true;
	},
	
	onCancel: function (editor) {
		return true;
	},

	getHandler: function(){
		if ((this.editor) && (this.editor.getTaskHdl))
			return this.editor.getTaskHdl();
		else if(window.pe.scene.docType == "pres"){
			return window.pe.scene.slideSorter.getTaskHdl();
		}
		else
			return null;
	},
	
	deleteTask: function(taskId){
		if (this.dialog.open){
			setTimeout(dojo.hitch(this, this.deleteTask, taskId), 500);
		}
		else{
			this.getHandler().taskDelete(taskId);
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
		
		if (this.getHandler() && this.getHandler().onDialogHide)
			this.getHandler().onDialogHide(this);
	},
	returnFocusForPres: function(){
		pe.scene.setFocus();
	}
});
