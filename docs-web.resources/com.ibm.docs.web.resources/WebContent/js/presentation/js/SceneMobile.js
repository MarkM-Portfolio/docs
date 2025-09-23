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

dojo.provide("pres.SceneMobile");
dojo.require("pres.Scene");
dojo.require("pres.mobile.SlideShow");
dojo.require("pres.mobile.mobileUtilAdapter");

dojo.declare("pres.SceneMobile", pres.Scene, {

	bNetworkIssue:false,
	bOffline:false,
	// generate slide show content and populate the slide show div
	// native ios will expand full screen
	buildSlideShow : function(slideWidth,slideHeight,projectorMode, fromCurrSlide) {
		this.destroySlideShow();
		
		var slideShowDiv = dojo.doc.createElement('div');
		slideShowDiv.id = 'slideShowContainer';
		dojo.doc.body.appendChild(slideShowDiv);

		var slideShow;
		slideShow = this.ssObject = new pres.mobile.SlideShow();
		if (slideWidth){
			this.ssObject.slideWidth = slideWidth;
		}
		if (slideHeight){
			this.ssObject.slideHeight = slideHeight;
		}
		if (fromCurrSlide) {
			this.ssObject.fromCurrSlide = true;
		}
		if( projectorMode )
			this.ssObject.projectorMode = true;
		slideShow.configEvents();

		//hide slidesort to improve slide show performance on mobile.
		var header = dojo.byId("header");
		header.style.display = 'none';
		var mainNode = dojo.byId("mainNode");
		mainNode.style.display = 'none';

	},
	
	destroySlideShow: function()
	{
		if (this.ssObject) 
			this.ssObject.destroy();
		var slideShowDiv = dojo.byId('slideShowContainer');
		slideShowDiv && dojo.destroy(slideShowDiv);
	},

	// close the slide show div
	closeSlideShow : function() {
		var header = dojo.byId("header");
		header.style.display = 'block';
		var mainNode = dojo.byId("mainNode");
		mainNode.style.display = 'block';
		var currSlideId = null;
		if (this.ssObject) {
			if( this.ssObject.currSlide >=0 && this.ssObject.currSlide < this.ssObject.slides.length )
			{
				currSlideId = this.ssObject.slides[this.ssObject.currSlide].id;
			}
		}
		this.destroySlideShow();
	},

	// post event to iOS JS bridge and tells it to exit slide show and relayout presentation
	exitSlideShow: function() {
		var events = [];
		var params = [];
		events.push({"name":"exitSlideShow", "params":params});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
		this.destroySlideShow();
	},

	// track online or offline status
	offline: false,

	isOffline: function() {
		if (this.offline != null && this.offline == true)
			return true;
		else
			return false;
	},

	// called by iOS JS bridge to set offline/ online mode
	setOffline: function(isOffline) {
		this.offline = isOffline;

		// TODO: remove debug
		if (isOffline) {
			console.log("##### GO OFFLINE");
		} else {
			console.log("##### GO ONLINE");
		}
	},

	// post event to iOS JS bridge and tells it the setOffline function is ready
	// and can be called anytime online/ offline status changes
	setOfflineMode: function() {
		var events = [];
		var params = [];
		events.push({"name":"setOfflineMode", "params":params});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	},

	_showMessage : function(text, interval, type) {
		concord.util.mobileUtil.showMessage(text);
	},

	showBigFileErrorMsg: function(){
		concord.util.mobileUtil.showMessage(this.nls.bigFileErrMsg);
	},

	showVersionPublishedMessage: function() {
		this.inherited(arguments);
		concord.util.mobileUtil.versionPublished();
	},
	showVersionPublishedFailedMessage: function(msg){
		concord.util.mobileUtil.showPublishFailedDialog(msg);
	},

	showLocalVersionPublishedMessage: function(userName) {
		var isConn = concord.util.uri.isLCFilesDocument();
		var theMsg = isConn ? this.nls.versionpublished: this.nls.versionpublished2;
		concord.util.mobileUtil.showMessage(dojo.string.substitute(theMsg, [userName, concord.util.date.getTime()]));
	},

	// MOBILE: disable welcome and unsupported dialogs in pres mobile editor
	showWelcomeOrUnsupportDialog: function()
	{
		// do nothing.
	},

	showFileFormatNotMatchDialog: function( params )
	{
		concord.util.mobileUtil.fileFormatNotMatchParams = params;
		// we post event and pop up dialog from the native code
		var events = [];
		events.push({"name":"fileFormatNotMatch"});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	},

	// network issue
	_showLockBox: function(errorCode) {
		if (errorCode == 1002) // no permission
		{
			concord.util.mobileUtil.postError(errorCode);
		}else{ // network issue
			//if(!this.bNetworkIssue){
			this.bNetworkIssue = true;
			concord.util.mobileUtil.networkIssue();				
			//}
		}
	},

	_hideLockBox: function() {
		this.bNetworkIssue = false;
	},

	_showKickOutBox: function() {
		if (this._kickOutBox)
		{
			return;
		}
		dojo.requireLocalization("concord.scenes", "ErrorScene");
		var msgNls = dojo.i18n.getLocalization("concord.scenes", "ErrorScene");
		concord.util.mobileUtil.postError(-1,"",msgNls.kickout_user_content);
	},

	// override
	showPasteImgErrorDialog: function(msg,interval){
		concord.util.mobileUtil.showErrorMessage(msg);
	},
	// override
	showPasteTextErrorDialog: function(msg){
		concord.util.mobileUtil.showErrorMessage(msg);
	},
	_showOfflineDialog: function() {
		this.bOffline = true;
		concord.util.mobileUtil.networkIssue();
	},

	//do not show any staging and loading box on mobile.
	staging: function()
	{
		return;
	},
	_showLoadingBox: function()
	{
		return;
	},
	_hideLoadingBox: function()
	{
		return;
	},
	sssEndedDialog: function() {
		//'title': this.nls.slideShowCoviewEnded,
		//'content':  "<div id='"+contentId+"'>"+this.nls.slideShowCoviewEndMessage+"</div>",
		concord.util.mobileUtil.showErrorMessageWithJSON( { 
			title: this.nls.slideShowCoviewEnded,
			message: this.nls.slideShowCoviewEndMessage,
			action: "endSharedSlideShow"
		} );
	}
});