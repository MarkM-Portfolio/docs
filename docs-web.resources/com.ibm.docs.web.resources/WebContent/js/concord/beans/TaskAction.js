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

dojo.provide("concord.beans.TaskAction");

//dojo.require("dojo.i18n");
//dojo.requireLocalization("concord.beans", "Task");

dojo.declare("concord.beans.TaskAction", null, {
	id: null,
	creator: null,
	taskid: null,
	type: null,
	summary: null,
	description: null,
	prop: null,
	datetime: null,
	
	multiple: null,
	idsArray: null,
	
	constructor: function(id, creator, taskid, type, summary, description, prop, datetime){
		this.id = id;
		this.taskid = taskid;
		this.creator = creator;
		this.type = type;
		this.summary = summary;
		this.description = description;
		this.prop = prop;
		this.datetime = datetime;
	},

	getId: function(){
		return this.id;
	},

	getCreator: function(){
		return this.creator;
	},

	setCreator: function(creator){
		this.creator = creator;
	},
	
	getTaskid: function(){
		return this.taskid;
	},

	setTaskid: function(taskid){
		this.taskid = taskid;
	},

	getType: function(){
		return this.type;
	},

	setType: function(type){
		this.type = type
	},

	getSummary: function(){
		return this.summary;
	},

	setSummary: function(summary){
		this.summary = summary;
	},

	getDescription: function(){
		return this.description;
	},

	setDescription: function(desc){
		this.description = description;
	},

	getProp: function(){
		return this.prop;
	},

	setProp: function(prop){
		this.prop = prop;
	},
	
	getDateTime: function(){
		return this.datetime;
	},
	
	setMultiple: function(number){
		this.multiple =  number;
	},
	
	getMultiple: function(){
		return this.multiple;
	},

	setIdsArray: function(idsArray){
		this.idsArray =  idsArray;
	},
	
	getIdsArray: function(){
		return this.idsArray;
	}		
	
});

