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

dojo.provide("concord.widgets.sidebar.PopupCommentsCacher");
dojo.require("concord.widgets.sidebar.PopupComments");

(function()
{
	var cachedPopupComments = new Array();
	var cachedMentionList = new Array();
	var cached = true;
	var statusCached = {};
	//TODO need a more accurate algorithm to cache PopupComments widgets
	concord.widgets.sidebar.PopupCommentsCacher.getCachedPComments = function(comments) {
		if(cachedPopupComments.length === 0){	
			var widgetObj = concord.widgets.sidebar.PopupCommentsCacher.createWidget(comments);
			return widgetObj;
		}else{
			cachedPopupComments[0].cached = true;
			return cachedPopupComments[0];
		}
	};
	
	concord.widgets.sidebar.PopupCommentsCacher.createWidget = function(comments){
		var mainNode = dojo.byId("mainNode");
		var tmpNode = dojo.create("div", null, mainNode);
		var readOnly =  pe.scene.isViewMode(true);
		var widget = new concord.widgets.sidebar.PopupComments({id:"pComment_"+ dojox.uuid.generateRandomUuid(), comments: comments, readOnly: readOnly},tmpNode);
		var widgetObj = {};
		widgetObj.cached = false;
		widgetObj.widget = widget;
		cachedPopupComments.push(widgetObj);
		return widgetObj;
	};
	
	concord.widgets.sidebar.PopupCommentsCacher.getCachedPCommentsArray = function(commentsArray){
		var cachedNum = cachedPopupComments.length;
		var actualNum = commentsArray.length;
		
		var widgetArray = new Array();
		if(cachedNum >= actualNum){
			for(var i=0; i< actualNum; i++){
				cachedPopupComments[i].cached = true;
				cachedPopupComments[i].comments = commentsArray[i];
				widgetArray.push(cachedPopupComments[i]);
			}
			return widgetArray;
		}else{
			for(var j=0; j< cachedNum; j++){
				cachedPopupComments[j].cached = true;
				cachedPopupComments[j].comments = commentsArray[j];
				widgetArray.push(cachedPopupComments[j]);				
			}
			for(var k=0; k< (actualNum -cachedNum); k++){
				var widgetObj = concord.widgets.sidebar.PopupCommentsCacher.createWidget(commentsArray[cachedNum + k]);
				widgetArray.push(widgetObj);	
			}
			return widgetArray;
		}
	};
	
	concord.widgets.sidebar.PopupCommentsCacher.getCachedWidget = function(){
		if (cachedPopupComments.length > 0)
			return cachedPopupComments[0].widget;
		else
			return null;
	};
	
	concord.widgets.sidebar.PopupCommentsCacher.getCachedWidgets = function(){
		var widgetArray = new Array();
		for(var i=0; i< cachedPopupComments.length; i++){
			widgetArray.push(cachedPopupComments[i].widget);
		}		
		return widgetArray;
	};
	
	concord.widgets.sidebar.PopupCommentsCacher.getCachedSpecificWidget = function(commentsId){
		for(var i=0; i< cachedPopupComments.length; i++){			
			if(cachedPopupComments[i].widget.comments && commentsId == cachedPopupComments[i].widget.comments.getId()){
				return cachedPopupComments[i].widget;
			}
		}		
		return null;
	};	
	
	concord.widgets.sidebar.PopupCommentsCacher.setCachedStatus = function(commentsId, status){
		if(!statusCached[commentsId]){
			statusCached[commentsId] = {};
		};	
		statusCached[commentsId].status = status;
	};
	
	concord.widgets.sidebar.PopupCommentsCacher.getCachedStatus = function(commentsId){
		return statusCached[commentsId] ?  statusCached[commentsId].status : null;
	};
	
	concord.widgets.sidebar.PopupCommentsCacher.setCachedMention = function(mention){
		if(cachedMentionList[mention.userid] == undefined){
			cachedMentionList[mention.userid] = mention;
		} 
	};
	
	concord.widgets.sidebar.PopupCommentsCacher.getCachedMention = function(){
		var result = [];
		for(var m in cachedMentionList){
			result.push(cachedMentionList[m]);
		}
		return result;
	};
	
})();
