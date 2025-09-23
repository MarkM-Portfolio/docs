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

// Header is a internal class of AbstractScene
dojo.provide("concord.scenes.Header");

dojo.require("concord.util.BidiUtils");
dojo.require("concord.util.uri");
dojo.require("dijit.form.Button");
dojo.require("dijit.Tooltip");
dojo.require("concord.widgets.LotusTextButton");
dojo.requireLocalization("concord.widgets.sidebar","SideBar");
dojo.requireLocalization("concord.widgets","menubar");
dojo.declare("concord.scenes.Header", null, {
	scene: null,
	nls: null,
	draftBadgeId: "doc_draft_badge",
	draftBadgeShown: false,
	publishId: "concord_publish",
	publishBtn: null,
	publishList: null,
	shareBtn: null,
    trackChangeId: "concord_track",
    trackChangeBtn: null,
    trackChangeLst: null,
	
	constructor: function(app, node, title, scene) {
		this.scene = scene;
		this.nls = scene.nls;
		this.nls2 = dojo.i18n.getLocalization("concord.widgets.sidebar","SideBar");
		this.nls3 = dojo.i18n.getLocalization("concord.widgets","menubar");
		this.draftBadgeShown = !this.scene.autoPublishSet();
		this._createContent(app, node, title);
	},
	
	_createContent: function(app, node, title) {
		var mainNode = node;
		dijit.setWaiRole(mainNode,'main');
		dijit.setWaiState(mainNode,'label',this.nls.mainDesc);			
		var headerDiv = document.createElement("div");
		headerDiv.setAttribute("id", "doc_header_outer");

		if(BidiUtils.isGuiRtl())
			headerDiv.setAttribute("dir", "rtl");

		dojo.addClass(headerDiv, "lotusTitleBar2");
		var innerDiv = document.createElement("div");
		dojo.addClass(innerDiv, "lotusInner");
		innerDiv.setAttribute("id", "doc_header");
		headerDiv.appendChild(innerDiv);
		
		//back to files button
		if(this.getFileDetailsURL()){
			dojo.addClass(innerDiv, "back_button_doc_header");
			var btnLabel;
			if(concord.util.uri.isCCMDocument())
			{
				btnLabel = this.nls.backtoLibrary;
				
			}
			else if(concord.util.uri.isECMDocument())
			{
				btnLabel = this.nls.backtoICN;
			}
			else if(concord.util.uri.isExternal())
			{
				btnLabel = this.nls.backtoRepository;
			}
			else if(concord.util.uri.isLCFilesDocument())
			{
				if(DOC_SCENE && DOC_SCENE.communityID && DOC_SCENE.communityID.length > 0)
				{
					btnLabel = this.nls.backtoCommFiles;
				}
				else
				{
					btnLabel = this.nls.backtoFiles;
				}				
			}
			else
			{
				btnLabel = this.nls.backtoFiles;				
			}
			var backtoFilesContent = dojo.create('a', {
				title: btnLabel,
				alt: btnLabel
			}, innerDiv);			
			dojo.addClass(backtoFilesContent, "back_button_div");
			dojo.attr(backtoFilesContent,'tabIndex','0');		
			//adapt css for back to files button in SC.
			//if(gIs_cloud){
			//	dojo.addClass(backtoFilesContent, "cloud_back_button_div");
			//}
			dojo.connect(backtoFilesContent,'onmouseover', dojo.hitch(this, function(backtoFilesContent){
				dojo.addClass(backtoFilesContent, "back_button_mouse_over_div");
			},backtoFilesContent));
			dojo.connect(backtoFilesContent,'onmouseout', dojo.hitch(this, function(backtoFilesContent){
				dojo.removeClass(backtoFilesContent, "back_button_mouse_over_div");
			},backtoFilesContent));	
			dojo.connect(backtoFilesContent, "onfocus", dojo.hitch(this, function(){
				dojo.addClass(backtoFilesContent,"streamBtnFocused");
				dijit.Tooltip.show(btnLabel,backtoFilesContent,["below"]);
			}));
			dojo.connect(backtoFilesContent, "onblur", dojo.hitch(this, function(){
				dojo.removeClass(backtoFilesContent,"streamBtnFocused");
				dijit.Tooltip.hide(backtoFilesContent);
			}));	
			dojo.connect(backtoFilesContent, "onclick", dojo.hitch(this, this.goBackToFiles, backtoFilesContent));
			dojo.connect(backtoFilesContent, "onkeydown", dojo.hitch(this, this._goBackToFilesKeyHanlder));			
			var backtoFilesImg = dojo.create('div', null, backtoFilesContent);
			dojo.addClass(backtoFilesImg, "commonsprites commonsprites-backFiles");
			var altText = dojo.create('div',{innerHTML:"<"},backtoFilesImg);
			dojo.addClass(altText,'ll_commmon_images_alttext');
		}	
		
		var titleBarContent = document.createElement("div");
		dojo.addClass(titleBarContent, "lotusTitleBarContent");
		var docTitle = document.createElement("h2");
		docTitle.setAttribute("id", "doc_title");
		dojo.addClass(docTitle, "lotusHeading");
		
		//adapt css for back to files button in SC.
		//if(gIs_cloud && this.getFileDetailsURL()){
		//	dojo.addClass(docTitle, "cloud_doc_title");
		//}
		
		var imageClass, savedImageClass;

		switch (app) {
		case this.nls.textdoc:
			savedImageClass = "commonsprites commonsprites-savedDoc";
			imageClass = "commonsprites commonsprites-doc16";//+ (gIs_cloud ? "commonsprites-doc24" : "commonsprites-doc32");
			break;
		case this.nls.presdoc:
			savedImageClass = "commonsprites commonsprites-savedPres";
			imageClass = "commonsprites commonsprites-pres16";//+ (gIs_cloud ? "commonsprites-pres24" : "commonsprites-pres32");
			break;
		case this.nls.sheetdoc:
			savedImageClass = "commonsprites commonsprites-savedSheet";
			imageClass = "commonsprites commonsprites-sheet16";//+ (gIs_cloud ? "commonsprites-sheet24" : "commonsprites-sheet32");
			break;
		default:
			break;
		}

		var titleText = "";
		if (title) {
			titleText = title;
		}
		var docTitleText = document.createElement("label");
		docTitleText.setAttribute("id", "doc_title_text");
		docTitleText.innerHTML = titleText;
		docTitle.appendChild(docTitleText);

		var img = document.createElement("div");
		dojo.addClass(img, imageClass);
		
		dojo.attr(img, 'alt', this.nls.altLotusIcon);
		dojo.addClass(img, "lotusIcon");
		docTitle.appendChild(img);

		titleBarContent.appendChild(docTitle);
		innerDiv.appendChild(titleBarContent);		
	
		var actions = document.createElement("ul");
		dojo.addClass(actions, "lotusInlinelist");
		var htmlView = this.scene.isHTMLViewMode();
		if (!htmlView) {		
			if (this.scene.showSetAutoPublishMenu())
			{
				// draft badge for auto publish
				var draftBadge = document.createElement("div");			
				var badgeLabel = document.createElement("label");
				draftBadge.setAttribute("id", this.draftBadgeId);
				badgeLabel.innerHTML = this.nls.draftBadge;
				draftBadge.appendChild(badgeLabel);		
				innerDiv.appendChild(draftBadge);
				dojo.addClass(draftBadge, "draft_badge_button_div");					
			}
			
			// sidebar button
			var sidebar = dojo.create("li", {id: "concord_sidebar"},actions);
			dojo.addClass(sidebar,"sidebarShowHide");
			dojo.connect(sidebar, "onclick", dojo.hitch(this, "_toggleSideBarCmd"));
			dojo.connect(sidebar, "onkeydown", dojo.hitch(this, this._toggleSidebarKeyHanlder));
			var sDiv = dojo.create("div", {id: "concord_sidebar_btn",'tabindex':'0'}, sidebar);
			dojo.addClass(sDiv, "commonsprites commonsprites-streamOBtn");
			dojo.connect(sDiv, "onfocus", dojo.hitch(this, function(){
				dojo.addClass(sDiv,"streamBtnFocused");
				dijit.Tooltip.show(sDiv.title,sDiv,["below"]);
			}));
			dojo.connect(sDiv, "onblur", dojo.hitch(this, function(){
				dojo.removeClass(sDiv,"streamBtnFocused");
				dijit.Tooltip.hide(sDiv);
			}));
			var aTitle = this.nls2.showComments;
			dojo.attr(sDiv,"title", aTitle);
			dojo.attr(sDiv,'alt', aTitle);
			dojo.attr(sDiv,"aria-label", dojo.string.substitute(this.nls2.jawsSideBarAriaLabel, [aTitle, aTitle]));
            
			var altText = dojo.create('div',{innerHTML: "Comments"},sDiv);
			dojo.addClass(altText,'common_btn_high_contrast'); 
			
			var unread = dojo.create("div", {id:"sidebar_unread_div"}, sidebar);
			dojo.addClass(unread, "badge");
			unread.innerHTML = "";
			dojo.style(unread,"display","none");
			pe.firstSidebarOpenClick = false;
			if(pe.settings){
				var bar = pe.settings.getSidebar();
				if(bar == pe.settings.SIDEBAR_COLLAPSE){
					pe.firstSidebarOpenClick = true;
				}
			}
                        
            if (DOC_SCENE && DOC_SCENE.type == "text");
            {
                var tcLi = document.createElement("li");
                this.trackChangeLst = tcLi;
				tcLi.setAttribute("id", this.trackChangeId);
				var trackChangeButton = dojo.create("div", {className: "track_change_header_button", id: "track_change_header_button", tabindex: "0"});
                var trackChangeButtonInner = dojo.create("div", {className: "track_change_header_button_inner"}, trackChangeButton);
                var altText = dojo.create('div',{innerHTML: "Track Changes"}, trackChangeButtonInner);
    			dojo.addClass(altText,'tc_btn_high_contrast'); 
            	var aTitle = this.nls2.showChanges;
    			dojo.attr(trackChangeButton,"title", aTitle);
            	dojo.attr(trackChangeButton,"aria-label", dojo.string.substitute(this.nls2.jawsSideBarAriaLabel, [aTitle, aTitle]));
    			dojo.attr(trackChangeButton, "toShowTitle", aTitle);
    			dojo.attr(trackChangeButton, "toHideTitle", this.nls2.hideChanges);
				this.trackChangeBtn = trackChangeButton;
				tcLi.appendChild(trackChangeButton);
				actions.appendChild(tcLi);
                dojo.connect(trackChangeButton, "onclick", this, dojo.hitch(this, function(e){
                    this.scene.toggleTrackChangePanel && this.scene.toggleTrackChangePanel();
                }));
                dojo.connect(trackChangeButton, "onkeydown", dojo.hitch(this, this._toggleTrackChangeKeyHanlder));
                dojo.connect(trackChangeButton, "onfocus", dojo.hitch(this, function(){
    				dojo.addClass(trackChangeButton,"streamBtnFocused");
    				dijit.Tooltip.show(trackChangeButton.title,trackChangeButton,["below"]);
    			}));
    			dojo.connect(trackChangeButton, "onblur", dojo.hitch(this, function(){
    				dojo.removeClass(trackChangeButton,"streamBtnFocused");
    				dijit.Tooltip.hide(trackChangeButton);
    			}));
                tcLi.style.display = "none";
                this.scene.showTrackButton = function(){
                    tcLi.style.display = "";
                };
                this.scene.hideTrackButton = function(){
                    tcLi.style.display = "none";
                };
                var unread = dojo.create("div", {id:"track_change_unread_div", tabindex:0}, tcLi);
    			dojo.addClass(unread, "badge");
    			unread.innerHTML = "";
    			dojo.style(unread,"display","none");
    			dojo.subscribe("/trackChange/new", function(hasNew){
    				dojo.style(unread,"display",hasNew > 0 ? "" : "none");
//    				unread.innerHTML = hasNew > 999 ? "999" : hasNew + "";
    				unread.innerHTML = BidiUtils.isArabicLocale() ? 
    					BidiUtils.convertArabicToHindi(hasNew + "") : hasNew + "";

    				unread.setAttribute("aria-label", hasNew + " changes");
    				if(hasNew > 99)
    					dojo.style(unread,"width","20px");
    			});
            }
			
			if (concord.util.uri.isLCFilesDocument() || concord.util.uri.isLocalDocument())
			{
				// share button
				var shareList = document.createElement("li");
				shareList.setAttribute("id", "concord_share");
				var shareBtn = new concord.widgets.LotusTextButton({label: this.nls.share, id: "concord_share_btn", onClick: dojo.hitch(this.scene, "shareWith")});
				shareList.appendChild(shareBtn.domNode);
				actions.appendChild(shareList);				
				this.shareBtn = shareBtn;
			}
				
			if (this.scene.showSetAutoPublishMenu())
			{				
				// publish button
				var publishList = document.createElement("li");
				publishList.setAttribute("id", this.publishId);
				this.publishList = publishList;
				var publishBtn;
				if(concord.util.uri.isExternalREST())
				{			
					publishBtn = new concord.widgets.LotusTextButton({label: this.nls.saveVersion, id: "concord_publish_btn", onClick: dojo.hitch(this.scene, "saveDraft")});
				}
				else
				{ 
					//var bMsg = window.gIs_conn ? this.nls.publishVersion: this.nls.saveVersion;
					var publishLabel = concord.util.uri.isICNDocument()? this.nls.checkInVersion:this.nls.publishVersion;					
					publishBtn = new concord.widgets.LotusTextButton({label: publishLabel, id: "concord_publish_btn", onClick: dojo.hitch(this.scene, "showPublishDialog")});
				}

				this.publishBtn = publishBtn;
				publishList.appendChild(publishBtn.domNode);
				actions.appendChild(publishList);
//				if(pe.scene.createTooltip)
//				{
//					pe.scene.createTooltip(publishBtn, this.nls.publishTips, ["below"], true);
//				}
			}
			else if ((concord.util.uri.isExternalCMIS() || concord.util.uri.isECMDocument()) && DOC_SCENE.isPublishable)
			{// for cmis/ecm document, we show the save button on header
				// publish button
				var publishList = document.createElement("li");
				publishList.setAttribute("id", this.publishId);
				this.publishList = publishList;
				var publishBtn = new concord.widgets.LotusTextButton({label: this.nls.saveVersion, id: "concord_publish_btn", onClick: dojo.hitch(this.scene, "saveDraft", null, true)});
				pe.scene.createTooltip(publishBtn, this.nls3.fileMenu_PublishVersion2, ["below"], true);
				this.publishBtn = publishBtn;
				publishList.appendChild(publishBtn.domNode);
				actions.appendChild(publishList);
			}
			
			// lotus_text_message		
			var saveList = document.createElement("li");	
			dojo.addClass(saveList, 'autosave');
			var saveDiv = dojo.create('div', null, saveList);
			dojo.addClass(saveDiv, gIs_cloud ? "scloudText cloud_text_message" : "onpremise_text_message");
			var saveSpan = dojo.create('span', null, saveDiv);
			saveSpan.setAttribute("id", "lotus_text_message");
			
			var savingImg = dojo.create('div', {id: "lotus_saving_image"}, saveDiv);
			dojo.addClass(savingImg, "commonsprites commonsprites-autosaveSaving");
			savingImg.style.display = "none";			
			var savedImg = dojo.create('div', {id: "lotus_saved_image"}, saveDiv);
			dojo.addClass(savedImg, savedImageClass);
			savedImg.style.display = "none";	
//			    dojo.attr(savingImg,'tabindex','0');
//			    dijit.setWaiRole(savedImg, 'button');	
//			    dojo.attr(savedImg,'tabindex','0');
//			    dijit.setWaiRole(savingImg, 'button');			    
//				dojo.connect(savingImg, "onclick", dojo.hitch(
//						this, this.saveDraft, null));	
//				dojo.connect(savedImg, "onclick", dojo.hitch(
//						this, this.saveDraft, null));	
//				dojo.connect(savingImg,'onkeypress',dojo.hitch(this, this.saveDraft));	
//				dojo.connect(savedImg,'onkeypress',dojo.hitch(this, this.saveDraft));
			
			actions.appendChild(saveList);					
		}else{
			
			//Edit button
			if(DOC_SCENE.isDocsEnabled=="true" && DOC_SCENE.isDocsSupportType=="true" && DOC_SCENE.isDocsEditor=="true")
			{
				var editList = document.createElement("li");
				editList.setAttribute("id", "html_edit");
				var shareBtn = new concord.widgets.LotusTextButton({label: this.nls.edit, disabled:true, id: "html_edit_btn", onClick: dojo.hitch(this.scene, "htmlviewEdit")});
				var lastchild = shareBtn.domNode.lastChild;
				if (lastchild && lastchild.nodeName.toLowerCase() == "input") {
					dijit.setWaiRole(lastchild, "button");
					lastchild.setAttribute("aria-label", this.nls.edit);
				}
				editList.appendChild(shareBtn.domNode);
				actions.appendChild(editList);
			}
			
			//approve, reject and stop review
			var reviewData = DOC_SCENE.reviewData;
			if( reviewData && 
					reviewData.globalApprovalProperties && 
					reviewData.globalApprovalProperties.approvalProcess == 'BasicApproval' &&
					reviewData.globalApprovalProperties.approvalState == 'pending') {
				var lockOwner = reviewData.lockOwner;
				var draftOwner = false;
				var approver = false;
				if (lockOwner.id == g_authUser.id){
					draftOwner = true;
				} 
				
				// tell if the user is the approver
				var approvers = reviewData.approvers;
				if (approvers) {
					for(var i = 0; i < approvers.length; i++){
						if(((approvers[i].approverId == g_authUser.id || 
								(approvers[i].approverSelf && approvers[i].approverSelf.toLowerCase() == 'true'))) &&
								approvers[i].approvalState == 'pending') {
							approver = true;
							break;
						}
					}
				}
				
				if(draftOwner || approver) {
					setTimeout( dojo.hitch(this.scene, "initCCMWidgets"), 100 );
					
					var stopReview = document.createElement("li");
					stopReview.setAttribute("id", "stop_review");
					var stopReviewBtn = new concord.widgets.LotusTextButton({label: this.nls.labelStopReview, disabled:false, id: "stop_review_btn", onClick: dojo.hitch(this.scene, "stopReview")});
					stopReview.appendChild(stopReviewBtn.domNode);
					actions.appendChild(stopReview);
											
					if(approver) {
						var reject = document.createElement("li");
						reject.setAttribute("id", "reject");
						var rejectBtn = new concord.widgets.LotusTextButton({label: this.nls.labelRejct, disabled:false, id: "reject_review_btn", onClick: dojo.hitch(this.scene, "rejectReview")});
						reject.appendChild(rejectBtn.domNode);
						actions.appendChild(reject);		
						
						var approve = document.createElement("li");
						approve.setAttribute("id", "approve");
						var approveBtn = new concord.widgets.LotusTextButton({label: this.nls.labelApprove, disabled:false, id: "approve_review_btn", onClick: dojo.hitch(this.scene, "approveReview")});
						approve.appendChild(approveBtn.domNode);
						actions.appendChild(approve);							
					}
					innerDiv.appendChild(actions);
				}
			}					
			
			this.scene.appendHtmlActions(actions);				
		}
		
		innerDiv.appendChild(actions);

		var clearDiv = document.createElement("div");
		clearDiv.setAttribute("id", "doc_clear");
		clearDiv.className = "clear";
		innerDiv.appendChild(clearDiv);

		var bannerNode = dojo.byId("banner");
		if(bannerNode){
			bannerNode.appendChild(headerDiv);
			dijit.setWaiState(bannerNode, 'labelledby','doc_title_text'); 
		}
		this.createMessageDiv('lotus_error_message');
		this.createMessageDiv('lotus_warning_message');
		
		var footerNode = dojo.byId("footer");
		if(footerNode){
			dojo.attr(footerNode,'title', this.nls.footerTitle);
			dojo.attr(footerNode,'aria-label', this.nls.footerTitle);
		}		

		concord.util.events.subscribe(concord.util.events.document_metadata_updated, this, 'updateTitleBar');
		if (!htmlView && this.scene.showSetAutoPublishMenu())
		{
			this.switchAutoPublish(pe.scene.autoPublishSet());
		}
	},
	
	createMessageDiv: function(id)
	{
		var headerDiv;
		if(this.scene.isHTMLViewMode()){
			headerDiv = dojo.byId('mainNode');
		}else{
			headerDiv = dojo.byId('doc_header_outer');
		}
		if (!headerDiv) return null;
		
		var errorMessageDiv = document.createElement("div");
		errorMessageDiv.id = id;
		errorMessageDiv.className = "lotusMessage";
		errorMessageDiv.style.display = "none";
		if(this.scene.isHTMLViewMode()&& BidiUtils.isGuiRtl()){
			errorMessageDiv.setAttribute("dir", "rtl");
		}
		var img = document.createElement("div");
		dojo.style(img, 'float', BidiUtils.isGuiRtl() ? 'right' : 'left');
		dojo.attr(img, 'alt', '');		
		errorMessageDiv.appendChild(img);
		var messageSpan = document.createElement("span");
		dojo.style(messageSpan, 'float', 'left');
		dojo.style(messageSpan, 'white-space', 'pre-wrap');
		dojo.style(messageSpan, 'marginTop', '6px');
		errorMessageDiv.appendChild(messageSpan);
		headerDiv.appendChild(errorMessageDiv);
		
		var link = document.createElement("a");
		dojo.style(link, 'float', BidiUtils.isGuiRtl() ? 'right' : 'left');
		dojo.style(link, 'display', 'none');
		link.className= 'lotusDelete';
		link.title='close';
		link.className='lotusDelete';
		var img = document.createElement("img");
		dojo.style(img, 'float', BidiUtils.isGuiRtl() ? 'right' : 'left');
		dojo.attr(img, 'alt', '');	
		dojo.attr(img, 'tabindex', '0');
		link.appendChild(img);
		errorMessageDiv.appendChild(link);
		return errorMessageDiv;
	},
	
	renderMessageDiv: function(msgNode)
	{
		var browserWidth = concord.util.browser.getBrowserWidth();
		var messageWidth = msgNode.clientWidth;
		// for too long message need line feed.
		if(messageWidth > 600){
			messageWidth = 600;
			var closeNode = msgNode.lastChild;
			//this node would be the really warning text node
			var node = closeNode.previousSibling;
			node.style.cssText ='float:left;margin-top:6px;width:577px;word-wrap:break-word';
		}
		var left = ( browserWidth - messageWidth ) / 2;	
		msgNode.style.cssText = 'left:' + left + 'px;top:0px;display:inline-block;position:absolute;z-index:1';	
		
	},
	
	resizeMessageDiv: function()
	{
		var headerDiv;
		if(this.scene.isHTMLViewMode()){
			headerDiv = dojo.byId('mainNode');
		}else{
			headerDiv = dojo.byId('doc_header_outer');
		}
		var msgNode = dojo.query('.lotusMessage',headerDiv)[0]; 
		if(msgNode && msgNode.style.display != "none"){
			this.renderMessageDiv(msgNode);
		}
		//resize new Feature tour
		concord.feature.FeatureController.resizeWidget();
	},
	
	subscribeHeaderResizeEvent: function()
	{
		var headerDiv = dojo.byId('doc_header');
		if(headerDiv)
		{	
			if(dojo.isIE)
			{// IE
				dojo.connect(headerDiv, "onresize", dojo.hitch(
						this, this.headerResized));		
			}
			else
			{// FF, Safari, Chrome
				dojo.connect(headerDiv, "onDOMSubtreeModified", dojo.hitch(
						this, this.headerResized));					
			}
		}		
	},
	
	headerResized: function(mutation)
	{
		var comment;
		if(mutation && (comment = dijit.byId("concord_comment_btn")))
		{
			//Don't care mutation on comment button, we disable it all the time when editor is editing,
			//broadcast this will make editors to do unnecessary and error prone resize.
			if(dojo.isDescendant(mutation.target, comment.domNode))
				return;
		}
		dojo.publish(concord.util.events.doc_header_dom_changed, [true]);
	},	
	
	createSubmitInHeader: function()
	{
		var headerDiv = dojo.byId('doc_header');
		var clearDiv = dojo.byId('doc_clear');
		
		var submitBtn = new dijit.form.Button({label: this.nls.submitFragment, id:"SubmitTaskInHeader"});
//		var buttonDiv = dojo.create('div', null, headerDiv);
//		buttonDiv.appendChild(submitBtn.domNode);
//		headerDiv.insertBefore(buttonDiv,clearDiv);
//		buttonDiv.style.position = "relative";
//		buttonDiv.style.float = "right";
		
		var bigDiv = dojo.create('div', null, headerDiv);
		bigDiv.style.textAlign = "right";
		var smallDiv = dojo.create('div', null, bigDiv);
		smallDiv.style.margin = "0px auto 0px auto";
		smallDiv.appendChild(submitBtn.domNode);
		headerDiv.insertBefore(bigDiv,clearDiv);
	},	
	
	/**
	 * type = 0, 1, 2 (info, warning, error)
	 */
	_showMessage : function(text, interval, type ,nojaws, key)
	{
		if (!key)
			id = 'lotus_error_message' ;
		else
			id = 'lotus_error_message_' + key;
		
		var imgClass, className; 
		switch (type) {
			case 0:
				imgClass = 'commonsprites commonsprites-success';
				className = 'lotusMessage lotusMessage2 lotusSuccess lotusMessageText';				
				break;
			case 1:
				imgClass = 'commonsprites commonsprites-warning';
				className = 'lotusMessage lotusWarning lotusMessageText';				
				break;
			case 3:
				imgClass = 'htmlviewerinfoicon';
				className = 'lotusMessage lotusInfo';				
				break;
			case 4:
				imgClass = 'warningPhoto lotusInfoClose';
				className = 'lotusMessage lotusInfoClose';
				break;
			case 2:				
			default:
				imgClass = 'commonsprites commonsprites-error';
				className = 'lotusMessage lotusMessageText';				
		}
		
		var errorMessageDiv = document.getElementById( id );
		if (!errorMessageDiv)
			errorMessageDiv = this.createMessageDiv(id);
		if (!errorMessageDiv) return;
		
		var imgNode = errorMessageDiv.firstChild;
		var closeNode=errorMessageDiv.lastChild;
		var msgNode=closeNode.previousSibling;
		errorMessageDiv.className = className;
		imgNode.className = imgClass;
		msgNode.innerHTML = text;	
		
		if(type==4){
			errorMessageDiv.style.cssText = 'left:10px;right:20px;top:0px;display:inline-block;position:absolute;z-index:1';
			msgNode.style.cssText='word-wrap:break-word; margin-top:15px';
			if(BidiUtils.isGuiRtl()){
				dojo.style(closeNode, {'display':'inline-block', 'left':'10px', 'right':'initial', 'top':'10px', 'position':'absolute'});
			}else{
				dojo.style(closeNode, {'display':'inline-block', 'right':'10px','top':'10px', 'position':'absolute'});
			}
			dojo.connect(closeNode,'onclick', dojo.hitch(this, this.hideErrorMessage,key));
			dojo.connect(closeNode,'onkeydown', dojo.hitch(this, this._onKeyPressed,key));
			setTimeout( dojo.hitch(this, this._setCloseFocus, id), 1000);
		}else{
			dojo.style(closeNode, 'display', 'none');
		}
		
		this._doA11yMessage(errorMessageDiv, nojaws);		
		
		if(type!=4){
			if (dojo.isIE<9){
				errorMessageDiv.style.display="inline-block"; 
			}else{
				errorMessageDiv.style.cssText = 'display:inline-block'; //trigger layout to calc clientWidth
			}
			this.renderMessageDiv(errorMessageDiv);	
			dojo.connect(window, "onresize", dojo.hitch(this,this.resizeMessageDiv) );
		}
		
		if( interval )
			setTimeout( dojo.hitch(this, this.hideErrorMessage, key), interval );
	},
	
	_setCloseFocus : function(id){
		var errorMessageDiv = document.getElementById( id );
		errorMessageDiv.lastElementChild.lastElementChild.focus();
	},
	_onKeyPressed: function(key, e){
		if (e.keyCode == dojo.keys.ENTER){        	
			this.hideErrorMessage(key);
		}	
	},
	
	// this function intend to call Concret scenes implementation for _showMessage
	_showMessage0 : function(text, interval, type ,nojaws, key)
	{
		pe.scene._showMessage(text, interval, type ,nojaws, key);
	},
	
	_doA11yMessage: function(messageDiv, nojaws){
		if(!nojaws){
			dijit.setWaiRole(messageDiv,'alert');			
		}else if(dojo.hasAttr(messageDiv,'role')){
			dojo.removeAttr(messageDiv,'role'); 		
		}		
	},
	
	hideErrorMessage: function(key) {
		if (!key)
			id = 'lotus_error_message' ;
		else
			id = 'lotus_error_message_' + key;

		var errorMessageDiv = document.getElementById( id );
		if(errorMessageDiv)
			errorMessageDiv.style.display = 'none';
		if (key) // destroy the temp error message div
			dojo.destroy(id);
		if(pe.scene.outofdate){
			pe.scene._showReloadWidget();
		}
	},
	
	showSaveMessage: function() {
		if(this.scene.isDraftSaved())
			this.showSavedMessage();
		else
			this.showSavingMessage();
	},
	
	showSavedMessage: function(interval) {
		var savedDiv = document.getElementById( 'lotus_text_message' );
		if (!savedDiv) return;
		savedDiv.style.display = "";
		savedDiv.innerHTML = this.nls.saved;		
		this.showSavedImg(true);
		//this.showSavingImg(false);
		this.scene.bSaved = true;
		if(interval === undefined) interval = 5000;
		if(interval){
			setTimeout( dojo.hitch(this, this.hideSavedMessage), interval );
		}
	},
	
	hideSavedMessage: function() {
		var savedDiv = document.getElementById( 'lotus_text_message' );
		if (!savedDiv) return;
		savedDiv.style.display = "none";
		this.showSavedImg(false);
		//this.showSavingImg(false);	
	},
	
	showSavingMessage: function() {
		//var savedDiv = document.getElementById( 'lotus_text_message' );
		//if (!savedDiv) return;
		//savedDiv.innerHTML = this.nls.saving;		
		//this.showSavedImg(false);
		//this.showSavingImg(true);
		this.scene.bSaved = false;
	},	
	
	showSavedImg: function(show) {
		var savedImg = document.getElementById( 'lotus_saved_image' );
		if (savedImg) savedImg.style.display = show ? "" : "none";	
	},
	
	showSavingImg: function(show) {
		var savingImg = document.getElementById( 'lotus_saving_image' );
		if (savingImg) savingImg.style.display = show ? "" : "none";
	},		
	
	showTextMessage: function(text, interval) {
		var autosaveDiv = document.getElementById( 'lotus_text_message' );
		autosaveDiv.style.display = "";
		autosaveDiv.innerHTML = text;
		
		this.showSavedImg(false);
		this.showSavingImg(false);		
		
		if(interval){
			setTimeout( dojo.hitch(this, this.showSaveMessage), interval );
		}	
	},
	
	hideTextMessage: function() {
		var msgDiv = document.getElementById( 'lotus_text_message' );
		if(msgDiv) {
			msgDiv.style.display = "none";
		}
		this.showSavedImg(false);
		this.showSavingImg(false);
		
		this.disableShareCommentButton(false);
		//html viewer
		if(pe.scene.outofdate){
			pe.scene._showReloadWidget();
		}
	},
	
	disableShareCommentButton: function(disable) {
		var comment = dijit.byId("concord_comment_btn");
		var share = dijit.byId("concord_share_btn");
		if(comment)
			comment.setAttribute('disabled', disable);;		
		if(share)
			share.setAttribute('disabled', disable);
		this.disablePublishButton(disable);
	},	
	
	disablePublishButton: function(disable)
	{
		var publish = dijit.byId("concord_publish_btn");
		if(publish)
			publish.setAttribute('disabled', disable);		
	},
	
	getFileDetailsURL: function(){
		return concord.util.uri.getFileDetailsURL();
	},	
	
	_getFilesOpenerWindow: function() {
		if(dojo.isChrome >= 37)
		{// work around for back to files on the chrome 37
			return null;
		}
		try{		
			if( window.top.opener && window.top.opener.location && window.top.opener.location.href)
			{
				if( window.top.opener.location.href.indexOf("/viewer/app") > -1 ) {
					return window.top.opener.opener; // return viewer's opener, it's the Files summary page
				}
				
				if( window.top.opener.location.href.indexOf("/docs/app") > -1 ) {
					this.fileDetailWin = null;
					return null; // return null, if it's opened by Docs page
				}					
			}
		}
		catch(e)
		{
			console.warn(e);
		}
		
		return window.top.opener;
	},
	
	_openFileDetailsPageInChild: function() {
		var url = this.getFileDetailsURL();
		var name = DOC_SCENE.repository + "_" + DOC_SCENE.uri;
        name = name.replace(/[-\s.@]/g, '_');	

		if(this.fileDetailWin) {// has opened a files page already?
			if(dojo.isFF) { // close it first for FF
				try{
					this.fileDetailWin.close();
				}
				catch(e) {
					console.warn(e);
				}
				this.fileDetailWin = window.open(url, name); // open the files page
			}			
			else {
				try{// try as the fileDetailWin may be closed
					this.fileDetailWin.name = name;	// the this.fileDetailWin.name may be empty or "" 
				}
				catch(e) {
					console.warn(e);
				}
				
				this.fileDetailWin = window.open(url, name);  // open the files page
			}
			
		}
		else{
			this.fileDetailWin = window.open(url, name);	
		}		
	},
	
	_toggleSideBarCmd: function()
	{
		var sDiv = dojo.byId("concord_sidebar_btn");
		if(!dojo.hasClass(sDiv, "sidebarBtn-disable"))
			this.scene.toggleSideBarCmd();
	},
	
	_toggleSidebarKeyHanlder: function(e){
		e = e || window.event;
		if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE){        	
			this._toggleSideBarCmd();
		}	
	},
	
	_toggleTrackChangeKeyHanlder: function(e){
		e = e || window.event;
		if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE){        	
			this.scene.toggleTrackChangePanel && this.scene.toggleTrackChangePanel();
		}	
	},
	
	_goBackToFilesKeyHanlder: function(e){
		e = e || window.event;
		if (e.keyCode == dojo.keys.ENTER || e.keyCode == dojo.keys.SPACE){        	
			this.goBackToFiles();
		}	
	},
		
	goBackToFiles: function(){
		var url = concord.util.uri.getFilesListURL();
		window.open(url, "_blank", "");	
	},	
	
	goBackToFileDetails: function(){
		setTimeout( dojo.hitch(pe.scene,pe.scene.setFocus), 0 );
		this._openFileDetailsPageInChild();
	},	
	
	applyOptimizedDocTitle: function(title)
	{
		//The title should ideally be less than 64 characters in length. Please refer to the content in www.w3.org/Provider/Style/TITLE.html                  
		var widthLimit = 64; 
		var titleTmp2 = title;               
		var length = titleTmp2.length;                
		if(length > widthLimit){			 
			titleTmp2 = titleTmp2.substring(0, widthLimit-3).concat("...");
		}			
		var docTitleText = document.getElementById("doc_title_text");
		if (!docTitleText) return;
		
		docTitleText.innerHTML = titleTmp2.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;"); 
		docTitleText.title = title;		
	},
	
	updateTitleBar: function(bean)
	{
		var oldText = document.title;  
		var newTitle = bean.getTitle();
		if (oldText != newTitle && newTitle)
		{
			this.applyOptimizedDocTitle(newTitle);
			document.title = newTitle;
		}
	},	
	
	update: function(user, docEntry) 
	{
		
	},
	
	switchAutoPublish: function(check)
	{
		g_autopublish_set = check;
		if(!DOC_SCENE.isPublishable) 
		{
			this.showDraftBadge(false);	
			this.showPublishBtn(false);
		} 
		else
		{
			this.showDraftBadge(!check);	
			this.showPublishBtn(!check);
		}
	},
	
	getPublishPosition: function()
	{
		if(this.publishBtn)
		{			
			var pos = dojo.position(this.publishBtn.domNode);
			var x = pos.x + pos.w/2 - 5;
			var y = pos.y + pos.h + 5;
			return {x: x, y: y};
		}		
		
		return null;
	},
	
	getSharePosition: function()
	{
		if(this.shareBtn)
		{			
			var pos = dojo.position(this.shareBtn.domNode);					
			if(BidiUtils.isGuiRtl())
			{
				var x = pos.x + pos.w/2 - 5;
				var y = pos.y + pos.h + 5;
				return {x: x, y: y, tr:true};
			}
			else
			{
				var x = pos.x - 251; // reduce width of the dialog
				var y = pos.y - 2;	
				return {x: x, y: y, r:true};
			}
		}		
		
		return null;
	},
	
	getCommentPosition: function()
	{
		var sDiv = dojo.byId("concord_sidebar_btn");
		if (sDiv)
		{
			var pos = dojo.position(sDiv);
			var x = pos.x + pos.w/2 - 5;
			var y = pos.y + pos.h + 5;
			return {x: x, y: y, tr: true};
		}

		return null;
	},
	
	isPublishBtnShown: function()
	{
		if(this.publishList == null || this.publishList.style.display == "none")
			return false;
		
		return true;
	},

	isTrackBtnShown: function()
	{
		if(this.trackChangeLst == null || this.trackChangeLst.style.display == "none")
			return false;

		return true;
	},

	showDraftBadge: function(show)
	{				
		this.draftBadgeShown = show;
		var badge = dojo.byId(this.draftBadgeId);
		if(badge)
		{	
			if(show)
				dojo.style(badge,"display","");
			else
				dojo.style(badge,"display","none");
		}								
	},
	
	showPublishBtn: function(show)
	{		
		var btn = dojo.byId(this.publishId);
		if(btn)
		{	
			if(show)
				dojo.style(btn,"display","");
			else
				dojo.style(btn,"display","none");
		}						
	},
	showProblemIDDiv : function(problem_id,key) 
	{
		if (!key)
			id = 'lotus_error_message';
		else
			id = 'lotus_error_message_' + key;
		concord.scenes.ErrorScene.showProblemID(problem_id, id);
	},
	showMsg : function()
	{
		concord.scenes.ErrorScene.showMsg();
	}
});