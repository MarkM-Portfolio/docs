/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("concord.widgets.sidebar.WidgetStore");
dojo.require("concord.widgets.sidebar.Comments");

dojo.declare("concord.widgets.sidebar.WidgetStore", null, {
	sections : null,
	bBatchUpdate: false,
	
	constructor: function(sections) {
		this.sections = sections;
	},
	
	startBatchUpdate: function(){
		this.bBatchUpdate = true;
	},
	
	endBatchUpdate: function(message, args){
		this.bBatchUpdate = false;
		if (typeof message != 'undefined'){
			if (typeof args != 'undefined')
				dojo.publish(message,args);
			else
				dojo.publish(message);
		}
	}, 
	
	
	addSection : function(widget, info){
		if (widget == null)
			return;
		var widgetId = widget.getId();
		if (typeof this.sections == 'undefined')
		{
			this.sections = {};
		}
		
		if (this.sections[widgetId] == null){
			this.sections[widgetId] = {};
		} 
		
		if (typeof info != 'undefined')
			this.sections[widgetId].info = info;
		else
			this.sections[widgetId].info = {};
		
		this.sections[widgetId].widget = widget;
//		if (!this.bBatchUpdate){
//			dojo.publish(concord.util.events.widgetEvents_eventName_wigetAdded, [widget]);
//		}		
	},
	
	updateSection : function(widget, info, action){
		if (widget == null)
			return;
		if (typeof this.sections == 'undefined')
		{
			return; // the section has not been initialized
		}
		var widgetId = widget.getId();
		
		if (this.sections[widgetId] == null){
			return; // the task is not found
		}
		if (typeof info != 'undefined' && info != null)
			this.sections[widgetId].info = info;

		this.sections[widgetId].widget = widget;
//		if (!this.bBatchUpdate){
//			dojo.publish(concord.util.events.widgetEvents_eventName_wigetUpdated, [widget,action]);
//		}		
	},	
	
	deleteSection : function(widgetId){
		if (typeof this.sections == 'undefined'){
			return;
		}
		
		if (widgetId == null)
			return;
					
		if (widgetId in this.sections){
			delete this.sections[widgetId];
//			if (!this.bBatchUpdate){
//				dojo.publish(concord.util.events.widgetEvents_eventName_wigetDeleted, [widgetId]);
//			}
		}
		
	},
	
	getSection: function(widgetId){		
		if (typeof this.sections == 'undefined'){
			return null;
		}
		
		var section = this.sections[widgetId];
		return section;
	},
	
	getWidget: function(widgetId){
		var section = this.getSection(widgetId);
		if (section)
			return section.widget;
		else
			return null;
	},
	
	getAllWidgets: function()
	{
		if (typeof this.sections == 'undefined')
			return [];
		
		var widgets = new Array();
		for (var i in this.sections){
			var section = this.sections[i];
			if(section){
				widgets.push(section.widget);
			}
		}			
		return widgets;
	},
	updateUIbySortResult: function(){
		var streamNode = null;
		var widgets = this.getAllWidgets();
		var sortWigets = this._sortByLastTime(widgets,'des');
		var cCount = sortWigets.length;
		for ( var i = 0; i <cCount; i++)
		{ //10 -> 1
			var widget = sortWigets[i];
			var domNode = widget.domNode;
			if(!streamNode) streamNode = domNode.parentElement;
			streamNode.appendChild(domNode);
		}
	},
	_sortByLastTime: function(widgets,dir){
		dir = dir || 'asc'; 
		if (widgets.length == 0)
			return [];

		var left = [];
		var right = [];
		var widget = widgets[0];
		var pivot = widget.comments.getLastTimestamp();

		if (dir === 'asc')
		{// ascending order 1 -> 10
			for ( var i = 1; i < widgets.length; i++)
			{
				widgets[i].comments.getLastTimestamp() < pivot ? left.push(widgets[i]) : right.push(widgets[i]);
			}
		}
		else
		{// descending order   10 - >1
			for ( var i = 1; i < widgets.length; i++)
			{
				widgets[i].comments.getLastTimestamp() > pivot ? left.push(widgets[i]) : right.push(widgets[i]);
			}
		}
		return this._sortByLastTime(left,dir).concat(widget,this._sortByLastTime(right,dir));
	},
	
	
	destroy: function(){
		var widgets = this.getAllWidgets();
		for(var i=0; i<widgets.length; i++){
			widgets[i].destroy();
		}
		this.sections = undefined;
	}
});