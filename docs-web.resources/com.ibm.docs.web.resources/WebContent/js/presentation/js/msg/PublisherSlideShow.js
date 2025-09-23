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

dojo.provide("pres.msg.PublisherSlideShow");
dojo.require("concord.pres.MsgUtil");
dojo.require("concord.text.StyleMsg");

dojo.declare("pres.msg.PublisherSlideShow", null, {

	createSlideShowCoviewMsg: function(slideDoc, curSlide)
	{
		var msgPair = this.createMessage(MSGUTIL.msgType.slideShowCoview, [], null, null, true);
		msgPair.msg.curSlide = curSlide;
		msgPair.msg.totalSlides = slideDoc.slides.length;
		// task 32762 remove slide content for better performance
		// msgPair.msg.slideContent = slideContent;
		return msgPair;
	},

	createSlideShowCoviewStartMsg: function(slideDoc, curSlide, userIdArr)
	{
		var msgPair = this.createMessage(MSGUTIL.msgType.slideShowCoviewStart, [], null, null, true);
		msgPair.msg.inviteeList = userIdArr.toString();
		msgPair.msg.curSlide = curSlide;
		msgPair.msg.totalSlides = slideDoc.slides.length;
		// task 32762 remove slide content for better performance
		// msgPair.msg.slideContent = slideContent;

		return msgPair;
	},

	createSlideShowCoviewEndMsg: function()
	{
		var msgPair = this.createMessage(MSGUTIL.msgType.slideShowCoviewEnd, [], null, null, true);
		return msgPair;
	},

	createSlideShowCoviewJoinMsg: function(userHostId)
	{
		var msgPair = this.createMessage(MSGUTIL.msgType.slideShowCoviewJoin, [], null, null, true);
		msgPair.msg.userHostId = userHostId;
		return msgPair;
	},

	createSlideShowCoviewLeftMsg: function()
	{
		var msgPair = this.createMessage(MSGUTIL.msgType.slideShowCoviewLeft, [], null, null, true);
		return msgPair;
	}

});