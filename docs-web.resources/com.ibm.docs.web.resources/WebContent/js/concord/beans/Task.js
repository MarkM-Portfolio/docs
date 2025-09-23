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

// task bean

dojo.provide("concord.beans.Task");

//dojo.require("dojo.i18n");
//dojo.requireLocalization("concord.beans", "Task");

dojo.declare("concord.beans.Task", null, {
	id: null,
	title: null,
	content: null,
	assignee: null,
	reviewer: null,
	author: null,
	duedate: null,
	createDate: null,
	activity: null,
	owner: null,
	state: null,
	docid: null,
	fragid: null,
	postUpdateListeners: null,
	bDisable : null,
	bInvalid : null,
	
	constructor: function(id, title, content, assignee, reviewer, author, duedate, createDate, activity, owner, state, docid, fragid,bDisable) {
		if(arguments.length>0){
			this.id = id;
			this.title = title;
			this.content = content;
			this.assignee = assignee;
			this.reviewer = reviewer;
			this.author = author;
			this.duedate = duedate;
			this.createDate = createDate;
			this.activity = activity;
			this.owner = owner;
			this.state = state;
			this.docid = docid;
			this.fragid = fragid;
			this.postUpdateListeners = new Array();
			this.bDisable = bDisable;
		}
	},

	getId: function(){
		return this.id;
	},

	getTitle: function(){
		return this.title;
	},

	getContent: function(){
		return this.content;
	},

	getAssignee: function(){
		return this.assignee;
	},

	getReviewer: function(){
		return this.reviewer;
	},

	getAuthor: function(){
		return this.author;
	},

	getOwner: function(){
		return this.owner;
	},

	getState: function(){
		return this.state;
	},

	getDuedate: function(){
		return this.duedate;
	},

	getCreateDate: function(){
		return this.createDate;
	},

	getActivity: function(){
		return this.activity;
	},

	getDocid: function(){
		return this.docid;
	},

	getTypeId: function(){
		var bEmptyAssignee = (!this.assignee);
		var bEmptyReviewer = (!this.reviewer);
		if (this.state == 'waitingReview')
			return concord.beans.TaskService.REVIEW_TASK_TYPE;
		else if (this.state == 'complete'){
			if (bEmptyReviewer)
				return concord.beans.TaskService.WRITE_TASK_TYPE;
			else
				return concord.beans.TaskService.REVIEW_TASK_TYPE;
		}else if (bEmptyAssignee)
			return concord.beans.TaskService.REVIEW_TASK_TYPE;
		else
			return concord.beans.TaskService.WRITE_TASK_TYPE;

		return null;

	},

	getFragid: function(){
		return this.fragid;
	},
	
	getbDisable : function(){

		return this.bDisable;
	},
	
	setbDisable : function(value){ 
		this.bDisable = value;
	},
	
	setbInvalid: function(invalid){
		this.bInvalid = invalid;
	},
	
	setCreateDate: function(createDate){
		this.createDate = createDate;
	},
	
	getbInvalid: function(){
	    return this.bInvalid;
	},
	
	isCached: function(){
		return false;
	},
	
	notify: function(e){
		if(e.type=="PostUpdate"){
			for(var i=0;i<this.postUpdateListeners.length;i++){
				this.postUpdateListeners[i].onPostUpdate(e);
			}
		}
	},
	
	addPostUpdateListener: function(listener){
		this.postUpdateListeners.push(listener);
	},
	
	removePostUpdateListener: function(listener){
		this.postUpdateListeners.pop(listener);
	}
	
});
