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

dojo.provide("concord.widgets.CommentsManager");
//dojo.require("concord.widgets.CommentsBar");
//dojo.require("concord.widgets.PresCommentsBar");

dojo.declare("concord.widgets.CommentsManager", null, {
	
	commentsBar: null,
	constructor: function(commentsBar){
		this.setCommentsBar(commentsBar);
		dojo.subscribe(concord.util.events.commenttingEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
	},
	
	init: function(){
		this.subscribeToEvents();
	},
	//
	// List of events slide sorter is listening to
	//
	subscribeToEvents: function(){
		dojo.subscribe(concord.util.events.commenttingEvents, null, dojo.hitch(this,this.handleSubscriptionEvents));
	},
	
	//
	// Handle events from pub/sub model
	//
	handleSubscriptionEvents: function(data){
		if (data.eventName=='createComment'){			
			this.createCommentEvent();
		}else if(data.eventName == concord.util.events.commenttingEvents_eventName_expandComments){
			
			this.expandCommentEvent(data.commentsId);
		}else if(data.eventName == concord.util.events.commenttingEvents_eventName_DeleteComments){	
			this.deleteCommentsEvent(data.commentsId);
		}
	},	
	
	createCommentEvent: function(){
		this.commentsBar.createCommentsCmd();
	},
	
	expandCommentEvent: function(commentsId){
		var commentsArray = commentsId.split(' ');
		var commentsBar = this.commentsBar;
		commentsBar.expandComments(commentsId);
//		dojo.forEach(commentsArray,function(el){		
//	
//			
//		});
	},
	
	deleteCommentsEvent: function(commentsId){
		var commentsArray = commentsId.split(' ');
		var commentsBar = this.commentsBar;
		dojo.forEach(commentsArray,function(el){			
			commentsBar.deleteComments(el);		
		});
	},
	setCommentsBar: function(commentsBar){
		this.commentsBar = commentsBar;
	}	
});