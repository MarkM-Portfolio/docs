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

//author wangxum@cn.ibm.com
dojo.provide("concord.widgets.notifyTool");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.widgets","notifyTool");

dojo.declare("concord.widgets.notifyTool", null, {
slidesorter:null,
currentScene:null,
editslidelist :{},

constructor: function(slidesorter,currentScene){
	this.slidesorter = slidesorter;
	this.currentScene = currentScene;
	this.STRINGS = dojo.i18n.getLocalization("concord.widgets","notifyTool");
},

createMsgStringfromSlidelist:function( slides ){
	var msg="";
	if( slides ){
		if( dojo.isArray(slides) ) {	
			for (var i =0;i< slides.length; i++){
				var slideElem= slides[i];
				var slideNumber= this.slidesorter.getSlideNumber(slideElem);
				if( slideNumber && slideNumber != -1 )
				{
					if( i == 0 )
							msg += ( slides.length > 1 ) ? this.STRINGS.slides+" ":this.STRINGS.slide+" ";
					else
							msg += ( i==  slides.length-1) ? " "+this.STRINGS.and+" " : this.STRINGS.comma;
				
					msg += '<a href="#" slideid='+slideElem.id +' >'+slideNumber+"</a>"; //TODO:NLS;
					
				}
			}
		}
		else if ( dojo.isString(slides) ){
			msg = slides;
		}
		else { //one slide
			var slideNumber= this.slidesorter.getSlideNumber(slides);
			if( slideNumber && slideNumber != -1 )
					msg +=this.STRINGS.slide+" "+ '<a href="#" slideid='+slides.id +' >'+slideNumber+"</a>"; //TODO:NLS;
		}
	}
	return msg;
},

addInsertedSlidesNotifyMsg: function(slidelist){	
	var msg = this.createMsgStringfromSlidelist(slidelist);
	if( msg != "" ){
		var crtmsg = this.STRINGS.createMsg;
		//msg = this.slidesorter.authUser.getName() + ' created ' + msg + " in the document";	
		crtmsg = dojo.string.substitute(crtmsg,[this.slidesorter.authUser.getName(), msg]);
		if(this.currentScene.notifyBar!=null)
			this.currentScene.notifyBar.addNotification(crtmsg);
	}	
},

addDeletedSlidesNotifyMsg : function( slidelist){
	var msg = this.createMsgStringfromSlidelist( slidelist);
	if( msg && msg != "" ){
		var delmsg = this.STRINGS.deleteMsg;
		//msg = this.slidesorter.authUser.getName() + ' deleted ' + msg + " in the document";	
		delmsg = dojo.string.substitute(delmsg,[this.slidesorter.authUser.getName(), msg]);
		if(this.currentScene.notifyBar!=null)
			this.currentScene.notifyBar.addNotification(delmsg);
		
	}
},

addEditSlideNotifyMsg:function(slidelist){
	
	if( dojo.isArray(slidelist) ) {	
		for (var i =0;i< slidelist.length; i++){
			var slideElem= slidelist[i];
			if( this.editslidelist[slideElem.id] )
				continue;
			this.editslidelist[slideElem.id] = true;
		}
	}
	else if( slidelist.id && this.editslidelist[slidelist.id] )
			return;
	else if( slidelist.id )
		this.editslidelist[slidelist.id] = true;

	var msg = this.createMsgStringfromSlidelist( slidelist);
	if( msg && msg != "") {
		//msg = this.slidesorter.authUser.getName() + ' edited ' + msg ;	
		var editmsg = this.STRINGS.editMsg;
		editmsg = dojo.string.substitute(editmsg,[this.slidesorter.authUser.getName(), msg]);
		if(this.currentScene.notifyBar!=null)
			this.currentScene.notifyBar.addNotification(editmsg);
	}
},

addAssignmentNotifyMsg:function( user,assignee,slidelist){
	if( slidelist.length>0 ) {
		var msg= this.createMsgStringfromSlidelist(slidelist);
		//var message = user.getName() + ' assigned ' + msg + ' to ' + this.slidesorter.getUserFullName(	assignee); //TODO: NLS
		var message = this.STRINGS.assignMsg;
		message = dojo.string.substitute(message,[user.getName(), msg, this.slidesorter.getUserFullName(	assignee)]);
		if(this.currentScene.notifyBar!=null)
			this.currentScene.notifyBar.addNotification(message);
	}
},
handleSubscriptionEvents : function(data){
	if(data!=null){
		if( data.eventName==concord.util.events.notificationEvents_eventName_slideContentChanged) {
			this.handleSlideContentChanged(data);
		}
		if(data.eventName == concord.util.events.notificationEvents_eventName_updateNotifyMsg){
			this.handleUpdateNotifyMsg(data);
		}
//		if(data.eventName == concord.util.events.slideSorterEvents_eventName_currentSlideNumberList){
//			var selectedSlideId = this.selectedSlide.id;
//			var slideNumbers = data.slideNumbers;
//			if(slideNumbers !=null){
//				var selectedSlideNumber = slideNumbers[selectedSlideId];
//				alert("selected slide number:"+ selectedSlideNumber);
//			}
//		}
//		if(data.eventName == concord.util.events.notificationEvents_eventName_showSlide){
//			var slideIdToShow = data.slideId;
//			if(slideIdToShow != null){
//				var slideToShow = this.editor.document.$.getElementById(slideIdToShow);
//				this.simulateSlideClick(slideToShow);
//			}
//		}
	
	}
},
handleSlideContentChanged:function(data){
	var slideElem = this.slidesorter.selectedSlide;
	if(data!=null && data.slideId!=null) {
		slideElem = this.slidesorter.getSlideElementById(data.slideId)||slideElem;
	}
	this.addEditSlideNotifyMsg( slideElem );
},
handleUpdateNotifyMsg:function( data ){
	var notificationWrapper = data.messageNode;
	
	var slidelinks = dojo.query('a',notificationWrapper);
	for( var i = 0; i< slidelinks.length;i++) {
		var slideId =slidelinks[i].getAttribute("slideid");
		var slideElem = this.slidesorter.getSlideElementById(slideId);
		if( slideElem && slideId ) {
			var slideNumber= this.slidesorter.getSlideNumber(slideElem);
			slidelinks[i].innerHTML = slideNumber;
			slidelinks[i].setAttribute("href","#");
			dojo.connect(slidelinks[i], "onclick", dojo.hitch(this.slidesorter, this.slidesorter.showSlide, slideId));
		}
		else {//remove link
			slidelinks[i].removeAttribute("href");
		}
	}
}
});

