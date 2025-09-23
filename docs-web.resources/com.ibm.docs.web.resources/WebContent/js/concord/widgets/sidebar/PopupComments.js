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

dojo.provide("concord.widgets.sidebar.PopupComments");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("concord.util.BidiUtils");
dojo.require("concord.util.date");
dojo.require("concord.util.uri");
dojo.require("concord.widgets.sidebar.Mentions");
dojo.require("dojox.uuid");
dojo.require("concord.widgets.sidebar.PopupCommentsCacher");
dojo.require("concord.editor.CharEquivalence");
dojo.require("concord.widgets.CustomConfirmBox");
dojo.requireLocalization("concord.widgets.sidebar","Comments");

dojo.declare('concord.widgets.sidebar.PopupComments', [dijit._Widget,dijit._Templated], {
	nls: null,
	isBidi: false,
	bReadOnly: false,
	isOrphan: false,
	isWarning: false,
	comments: null,
	
	charEQ: null,
	CJK_map: null,
	lang: null,	
	maxcomments: 500,
	
	commentProfile: null, 
	ownerProfile: null,
	replyProfile: null,
	warningProfile: null,
	
	commentAtWidget: null,
	replyAtWidget: null,
	overlapIndex: -1,
	zIndex : 102,
	isWriting: true,
	isNoOrg: false,
	
	jawContent: null,
	jawStatus: null,
	jawComment: null,	
    
	templateString: dojo.cache("concord", "templates/PopupComments.html"),
	
	constructor: function(args){
		this.comments = args.comments;	
		this.readOnly = args.readOnly;
		//Unicode normalization before search and sorting
		this.lang = g_locale || navigator.userLanguage || navigator.language;
		this.charEQ = new concord.editor.CharEquivalence;
		if(this.lang.indexOf('zh') != -1 || this.lang.indexOf('ko') != -1 || this.lang.indexOf('ja') != -1){
			this.CJK_map = new concord.editor.CJKWidthCharMap;
		}		
	},
	
	postCreate: function(){	
		this.inherited(arguments);
		this._initComments();
		this._createContent();	
	},	
	
	_initComments: function(){
		this.nls = dojo.i18n.getLocalization("concord.widgets.sidebar","Comments");
		this.isBidi = BidiUtils.isBidiOn();
		this._initButtons();
		this._accHandler();
	},
	
	_createContent: function(){
		if(this.comments){// open an existing comment			
			this._showUI4Edit();
		}else{ 
			this._showUI4Writing();
		}
		this.isWriting = this.comments ? false : true;
	},
	
	_initButtons: function(){	
		this.resolveNode.innerHTML = this.nls.resolveBtn;
		this.replyNode.innerHTML = this.nls.replyBtn;
		this.commentNode.innerHTML = this.nls.saveBtn;
		this.deleteNode.innerHTML = this.nls.deleteBtn;
		this.cancelNode.innerHTML = this.nls.cancelBtn;
		this.reopenNode.innerHTML = this.nls.reopenBtn;
		dojo.attr(this.inputNode, "placeholder", this.nls.placeholderMsg);
		if(dojo.isFF){			
			dojo.attr(this.textareaNode,"rows","2");
			dojo.attr(this.inputNode,"rows","2");		
		}
	},
	
	_accHandler: function(){
		dojo.attr(this.textareaNode,"title", this.nls.tipsCommentField);
		dojo.attr(this.inputNode,"title", this.nls.tipsRespondField);
	},
	
	_createViewButton: function(replyNum){
		if(replyNum > 1 ){ 
			dojo.removeClass(this.separatorNode,"hidden");
		}else{
			if(!dojo.hasClass(this.separatorNode,"hidden")){dojo.addClass(this.separatorNode,"hidden");};	
		}
		this.viewNode.innerHTML = dojo.string.substitute( this.nls.viewCollapsedBtn, [replyNum -1]);
		dijit.setWaiState(this.viewNode,'expanded', 'false');
	},
	
	_showUI4Edit: function(){
		var replyNum =  this.comments.getItemCount() -1;
		var resolved = false;
		for (var commentIndex = 0; commentIndex < this.comments.getItemCount(); commentIndex++) {
			var commentItem = this.comments.getItem(commentIndex);  
			
			var authorname = commentItem.getCreatorName();
			if(authorname == null || authorname == undefined) authorname = "";
			authorname = !this.isBidi ? authorname : BidiUtils.addEmbeddingUCC(authorname);
			authorname = concord.util.acf.escapeXml(authorname, true);
			var timestamp = concord.widgets.sidebar.Comments.parseDateTime(commentItem.getTimestamp());
			timestamp = !BidiUtils.isGuiRtl ? timestamp : BidiUtils.formatDateTime(timestamp);
			var content = commentItem.getContent();
		
			if(commentIndex === 0){
				resolved = commentItem.isResolved();
				this.isOrphan = commentItem.getOrphaned();
				this.isNoOrg = (commentItem.getOrg() == undefined || commentItem.getOrg() == null || commentItem.getOrg() == "");				
				this._updateResolved(resolved);
				this.isWarning = commentItem.getWarning();
				if(this.isWarning) {
					authorname = this.nls.warningCommentName;
				}
				//Show warning comments icon instead
				if(this.isWarning){
					if(!this.warningProfile){
						this.warningProfile = document.createElement('div');
						dojo.addClass(this.warningProfile,"resolvedContainer");
						var photoNode = dojo.create('div', null, this.warningProfile);
						dojo.addClass(photoNode, "warningPhoto");
						dojo.attr(photoNode,'alt','');
						dojo.attr(photoNode,'title','');
						dojo.place(this.warningProfile, this.cNameNode, "before"); 					
					}else {
						dojo.style(this.warningProfile,"display","block");
					}					
				}else{	
					if(this.warningProfile){
						dojo.style(this.warningProfile,"display","none");
					}
					if(window.conditionRenderer){
						this.commentProfile = window.conditionRenderer.getUserTokenByUUID(commentItem.getCreatorId());
						dojo.place(this.commentProfile, this.cNameNode, "before");            		
					}				
				}
				this.cNameNode.innerHTML = authorname;
				this.cTimeNode.innerHTML = timestamp;
				this.cContentNode.innerHTML = concord.widgets.sidebar.Comments.parseContent(content,commentItem.getMentions());
				
				this.jawContent = dojo.string.substitute(this.nls.jawsContentHint, {'content': this.cContentNode.innerHTML});
				this.jawStatus = dojo.string.substitute(this.nls.jawsCommentStatusHint, {'status': resolved 
					? this.nls.menuresolved : this.nls.menuactive});
				this.jawComment = dojo.string.substitute(this.nls.jawsCommentHint, {'authorname': authorname, 'timestamp': timestamp});
				dijit.setWaiState(this.PopupNode,'label', this.jawComment +"\n"+ this.jawContent +"\n"+  this.jawStatus);
            	
				if(!dojo.hasClass(this.textareaNode,"hidden")){dojo.addClass(this.textareaNode,"hidden");};	
				this._createViewButton(replyNum);
			} else { 
				var isHidden = (replyNum == 1 || (replyNum > 1 && commentIndex === replyNum))? false: true ;
				this._createReply(commentItem, isHidden);
			}			
		}
		
		var cached = concord.widgets.sidebar.PopupCommentsCacher.getCachedStatus(this.comments.getId());
		if(cached && cached.showReply && !resolved){				
			this._showUI4Replying();
			this.inputNode.value = cached.responseContent;
			this.showNode(this.replyDivNode);
			if(this.replyAtWidget){
				this.replyAtWidget.show();
			}
			this.showNode(this.labelNode);			
			this._updateRemainLabel(this.inputNode.value);
		}else{
			this.hideNode(this.replyDivNode);
			this.hideNode(this.labelNode);
		}	
		//hide btns in read-only mode
		this._showUI4EditBtns(resolved, this.readOnly);	
	},
	
	_showUI4Writing: function(){	
		var user = {
				uid: pe.authenticatedUser.getId(),
				org: pe.authenticatedUser.getOrgId(),
				name: pe.authenticatedUser.getName()
		};
		if(this.warningProfile){
			dojo.style(this.warningProfile,"display","none");
		}
			
		if(window.conditionRenderer){   			
			this.ownerProfile = window.conditionRenderer.getUserTokenByUUID(user.uid);
			dojo.place(this.ownerProfile, this.cNameNode, "before");            		
		} 		
		var authorname = !this.isBidi ? user.name : BidiUtils.addEmbeddingUCC(user.name);
		this.cNameNode.innerHTML = authorname;	
		var timestamp = concord.util.date.parseDateTime((new Date()).getTime());
		if(BidiUtils.isGuiRtl)
			timestamp = BidiUtils.formatDateTime(timestamp);
			
		this.cTimeNode.innerHTML = timestamp;	
		if(!this.commentAtWidget) {
			var tmpDiv = dojo.create("div", null, this.headerNode);
			if (this.isBidi){
				var textDir = BidiUtils.getTextDir();
				if (textDir != "contextual")
					dojo.attr(this.textareaNode, "dir", textDir);
				else
					dojo.connect(this.textareaNode, 'onkeyup', dojo.hitch(this, function(){
        				this.textareaNode.dir = BidiUtils.calculateDirForContextual(this.textareaNode.value);
				    }));
			}
			this.commentAtWidget = new concord.widgets.sidebar.Mentions({id:"metion_"+dojox.uuid.generateRandomUuid(),textarea: this.textareaNode, widget: this}, tmpDiv);
		}
		dijit.setWaiState(this.PopupNode,'label', this.nls.tipsCommentField);
		this._updateRemainLabel(this.textareaNode.value);
		this._showUI4WritingBtns(); 
		concord.util.events.publish(concord.util.events.commenting_addCommentPopupDlg, [true]);		
	},
	
	_showUI4Replying: function(){
		var user = {
				uid: pe.authenticatedUser.getId(),
				org: pe.authenticatedUser.getOrgId(),
				name: pe.authenticatedUser.getName()
		};
		if(window.conditionRenderer){
			if(!this.replyProfile){    			
				this.replyProfile = window.conditionRenderer.getUserTokenByUUID(user.uid);
				dojo.place(this.replyProfile, this.rNameNode, "before");            		
			}
		}		
		var authorname = !this.isBidi ? user.name : BidiUtils.addEmbeddingUCC(user.name);
		this.rNameNode.innerHTML = authorname;	
		var timestamp = concord.widgets.sidebar.Comments.parseDateTime((new Date()).getTime());
		if (BidiUtils.isGuiRtl)
			timestamp = BidiUtils.formatDateTime(timestamp);

		this.rTimeNode.innerHTML = timestamp; //TODO ,ONLY TIME
		if(!this.replyAtWidget) {
			var tmpDiv = dojo.create("div", null, this.replyDivNode);
			if (this.isBidi){
				var textDir = BidiUtils.getTextDir();
				if (textDir != "contextual")
					dojo.attr(this.inputNode, "dir", textDir);
				else
					dojo.connect(this.inputNode, 'onkeyup', dojo.hitch(this, function(){
        				this.inputNode.dir = BidiUtils.calculateDirForContextual(this.inputNode.value);
				    }));
			}
			this.replyAtWidget = new concord.widgets.sidebar.Mentions({id:"metion_"+dojox.uuid.generateRandomUuid(),textarea: this.inputNode, widget: this}, tmpDiv);
		}		
		this._showUI4ReplyBtns();
	},
	
	_createReply: function(responceItem, isHidden){
		dojo.removeClass(this.repliesNode,"hidden");
		var tmpDiv = dojo.create("div", null, this.repliesNode);
		var id = "reply_"+dojox.uuid.generateRandomUuid();
		new concord.widgets.sidebar.Reply({id:id, reply: responceItem, forPopup: true}, tmpDiv);	
		if(isHidden){this.hideNode(dojo.byId(id));}
	},
	
	_showUI4Replied: function(responceItem){
		this._createReply(responceItem);
		this.inputNode.value = "";
		this._updateRemainLabel(this.inputNode.value);
		this._showUI4RepliedBtns();
	},
	
	isDeleteEnabled: function(){
		return true;
//		if(!this.comments) return true;
//		var userId = pe.authenticatedUser.getId();
//		var commentsOwnerId = this.comments.getItem(0).getCreatorId();
//		return userId === commentsOwnerId;
	},
	
	_handleDelete: function(forcedHide, resolved){
		if(this.isDeleteEnabled() && !forcedHide){
			this.showNode(this.deleteNode);
			if(!resolved){				
				dojo.removeClass(this.deleteNode,"reopen");	
				dojo.style(this.deleteNode,"float","");	
			}else{
				if (BidiUtils.isGuiRtl()){
					dojo.style(this.deleteNode,"float","left");
				}else{					
					dojo.style(this.deleteNode,"float","right");
				}
				if(!dojo.hasClass(this.deleteNode, "reopen"))
					dojo.addClass(this.deleteNode,"reopen");								
			}
		}else{
			this.hideNode(this.deleteNode);
		}		
	},
	
	hideNode: function(node){
		if(node && !dojo.hasClass(node,"hidden")){dojo.addClass(node,"hidden");};
	},
	
	showNode: function(node){
		dojo.removeClass(node,"hidden");
	},
	
	isShown: function(){
		return !dojo.hasClass(this.PopupNode,"hidden");
	},
	/*
	 * @param noAnimation, if noAnimation is true, don't show animation effect 
	 */
	show: function(noAnimation){
		window.setTimeout(
			dojo.hitch(this, function(){
				dojo.removeClass(this.PopupNode,"hidden");
				if(this.comments){
					if(this.isOrphan)
						dojo.addClass(this.PopupNode,"orphan");
				}
				if(noAnimation){
					if(!dojo.hasClass(this.PopupNode,"expand2"))dojo.addClass(this.PopupNode,"expand2");
				}else{					
					if(!dojo.hasClass(this.PopupNode,"expand"))dojo.addClass(this.PopupNode,"expand");
				}
				this._locate();
				this._initFocus();
			}),
			200
		);			
	},
	
	_initFocus: function(){
		if(window.pe.scene.docType == "pres"){
			window.pe.scene.setFocusComponent('dialogs');
		}
		if(this.isWriting){ 
			this._setFocus(this.textareaNode);
		}else{			
			this._setFocus(this.inputNode);
		}
		if(dojo.hasClass(this.textareaNode,"hidden") && !this._isReplyInputShown()){					
			this._setFocus(this.resolveNode);
			if(this._isResolved()){
				this._setFocus(this.reopenNode);
			}
			if(this.isNoOrg){
				this._setFocus(this.replyNode);
			}
			if(this.isOrphan || this.isWarning){
				this._setFocus(this.deleteNode);
			}
		}
		this.blockMouseOutEvent = false;
	},
	
	//The param noFocus is for spreadsheet, if it is true, comments box is hide by mouse out.
	hide: function(noFocus, noPublish){
		if(this.commentAtWidget)
			this.commentAtWidget.hide();
		if(this.replyAtWidget)
			this.replyAtWidget.hide();
		this.hideNode(this.PopupNode);
		dojo.removeClass(this.PopupNode,"expand");
		dojo.removeClass(this.PopupNode,"expand2");
		dojo.removeClass(this.PopupNode,"over");
		this._doCache();
		this.overlapIndex = -1;
		if(!noFocus && !noPublish)
			setTimeout( dojo.hitch(pe.scene,pe.scene.setFocus), 0 );
		if(this.isWriting && !noPublish){
			concord.util.events.publish(concord.util.events.commenting_addCommentPopupDlg, [false]);
		}
	},
	
	_scrollHide: function(){
		this.hide(false, true);
	},
	
	setOverlapIndex: function(index){
		this.overlapIndex = index;
	},
	
	setStickyZIndex: function(index){
		dojo.style(this.PopupNode, "zIndex", index);
	},
	
	getStickyZIndex: function(){
		return dojo.style(this.PopupNode, "zIndex");
	},
	
	_setFocus: function(node){
		window.setTimeout(
			dojo.hitch(this, function(){
				if(node) {
					if(window.pe.scene.docType == "sheet" && dijit.popup._stack && dijit.popup._stack.length > 0)
						return;
					node.focus();
					if(node == this.textareaNode || node == this.inputNode){						
						var len = node.value.length;
						if (document.selection) {
							var sel = node.createTextRange();
							sel.moveStart('character',len);
							sel.collapse();
							sel.select();
						} else if (typeof node.selectionStart == 'number' && typeof node.selectionEnd == 'number') {
							node.selectionStart = node.selectionEnd = len;
						}
					}
				}
			}),500
		);		
	},
	
	clean: function(refreshed){
		this._cleanProfiles();
		//destroy replies in commenting dialog
		dojo.empty(this.repliesNode);
		this.hideNode(this.repliesNode);
		this._doCache();
		if(this.replyAtWidget)
			this.replyAtWidget.hide();		
		//clean sticky status
		this._updateResolved(false);
		this.replyNode.innerHTML = this.nls.replyBtn;
		dojo.removeClass(this.PopupNode,"expand");
		this.setStickyZIndex(101);
		this.isNoOrg = false;
		this._cleanOrphan();
		this._cleanWarning();
		dojo.removeClass(this.resolveNode, "msoffice");
		if(!refreshed){			
			this._cleanArrow();
			this.hideNode(this.PopupNode);
		}
		if (this.isBidi && BidiUtils.isGuiRtl()) {
			dojo.style(this.reopenDivNode, "display", "block" );
			dojo.style(this.actionsDivNode, "display", "block" );
		}
		this.hideNode(this.reopenDivNode);
		//clean inputNode
		this.inputNode.value = "";

		var maxCommentsStr = BidiUtils.isArabicLocale() ?
			BidiUtils.convertArabicToHindi(this.maxcomments + "") : this.maxcomments;

		this.labelNode.innerHTML = maxCommentsStr; 
	},
	
	_cleanOrphan: function(){
		this.isOrphan = false;
		dojo.removeClass(this.PopupNode,"orphan");
		dojo.attr(this.PopupNode, "title", "");
	},
	
	_cleanWarning: function(){
		this.isWarning = false;
	},
	
	
	_cleanArrow: function(){
		dojo.removeClass(this.arrowNode,"arrowdown");
		dojo.removeClass(this.arrowNode,"arrowup");
	},
	
	_cleanProfiles: function(){
		//destroy cached profiles
		if(window.conditionRenderer){
			if(this.commentProfile){				
				window.conditionRenderer.unbindUserTokenBeforeDesctroy(this.commentProfile);          		
				dojo.destroy(this.commentProfile);
				this.commentProfile = null;
			}
			if(this.ownerProfile){
				window.conditionRenderer.unbindUserTokenBeforeDesctroy(this.ownerProfile);          		
				dojo.destroy(this.ownerProfile);    
				this.ownerProfile = null;
			}
			dojo.query(".unified_editor", this.repliesNode).forEach(dojo.hitch(this, function(node){
				window.conditionRenderer.unbindUserTokenBeforeDesctroy(node);                
			}));			
		} 								
	},
	
	isMouseHovered: function(commentId){
		if(!this.isShown()) return false;
		if(commentId == this.comments.getId() && dojo.hasClass(this.PopupNode,"over")){
			return true;
		}
		return false;
	},
	
	updateComments: function(comments, refreshed){
		this.blockMouseOutEvent = true;
		this.isWriting = comments ? false : true;
		this.clean(refreshed);
		this.comments = comments;
		if(comments){
			this._showUI4Edit();
		}else{
			this._showUI4Writing();
			if(window.pe.scene.docType == "sheet")
				pe.scene.editor.getCommentsHdl().scrollIntoView();
		}
		//refreshed is true, then, it has no animation
		this.show(refreshed);
		this.mouseOutTimer && clearTimeout(this.mouseOutTimer);
	},
	
	reLocate: function(){
		this._locate();
		this._initFocus();
	},
	
	/**
	 * Calculate the popup dialog's position
	 * @param rectified, which is for reply action
	 */
	_locate: function(rectified){
		var bHeight = concord.util.browser.getBrowserHeight();
		var bWidth = concord.util.browser.getBrowserWidth();
		var sidebar = pe.scene.sidebar;
		if(sidebar && !sidebar.isCollapsed() && !BidiUtils.isGuiRtl()){
			//bWidth is the width of content editor in IBM Docs
			bWidth = bWidth - sidebar.getMaxWidth();
		}
		var boxHeight = this.PopupNode.clientHeight;
		var boxWidth = dojo.style(this.PopupNode,"width");	
		if(this.isOrphan || this.isWarning){
			var left = bWidth - boxWidth - 25;
			var top =  bHeight - boxHeight - 100;
			dojo.style(this.PopupNode,"left",left +"px");
			dojo.style(this.PopupNode,"top",top +"px");	
			this._locateArrow(true, 0, false, false);
			return;
		}
		
		var commentsId = this.comments ? this.comments.id : null;
		var pos = concord.widgets.sidebar.PopupComments.getPosition(commentsId);
		if(!pos) return; 
		var x = pos.x;
		var y = pos.y;
		var w = pos.w;
		var h = pos.h;
		if(x + w < 0 || y < 0){
			this._scrollHide();
			return;
		}
		else if(!this.isShown())
			this.show(true);
		
		var xPos = x;
		var yPos = y;
		var deltaH = 0;
		var scrollbarW = 25; //scrollbar width
		var editor;
		//optimized in three editors
		if(window.pe.scene.docType == "pres"){
			xPos += 5;
		}else if(window.pe.scene.docType == "sheet"){
			editor = pe.scene.editor;
			if (!editor.getCurrentGrid().isMirrored)
				xPos += w; // w is the cell's width
			else {
				xPos += scrollbarW;
			}
			bWidth = bWidth - scrollbarW; // In sheet, minus the scrollbar's width  
			if (BidiUtils.isGuiRtl() && sidebar && !sidebar.isCollapsed())
				xPos += sidebar.getMaxWidth();
		}else if(window.pe.scene.docType == "text"){
			deltaH = 5; // half of the height of arrow
			xPos += 5;
			if (BidiUtils.isGuiRtl()) {
				if ((sidebar && !sidebar.isCollapsed()) ||
					(pe.settings && (pe.settings.getSidebar() == pe.settings.SIDEBAR_TC))) {
					xPos += sidebar.getMaxWidth();
				}
			}
		}		
	 	
		var arrowup = false; //by default
		var iconDx = 10; //revise value
		var iconDy = 10; //revise value
		var leftIconPos = (boxWidth / 2- iconDx) +"px";//by default, half of popup width 
		var left = xPos - boxWidth/2 - 5;

		if(left < 0) { // Part of the popup dialog is sheltered in the left of IBM Docs
			left = 0; //Try to show the whole popup dialog
			if(window.pe.scene.docType == "sheet"){
				xPos -= editor.getRowHeaderWidth(); // To remove the row header's width
				left = editor.getRowHeaderWidth() + 1 ; 
			}
			//5px is the distance from the right-top corner to the yellow triangle icon
			leftIconPos = (xPos - iconDx - 5) +"px" ;				
		}else if(window.pe.scene.docType == "sheet" && left < editor.getRowHeaderWidth()){
			left = editor.getRowHeaderWidth() + 1 ; 
			xPos -= editor.getRowHeaderWidth(); // To remove the row header's width
			leftIconPos = (xPos - iconDx - 5) +"px" ;			
		}
		
		if(xPos +  boxWidth/2 > bWidth){// Part of the popup dialog may be sheltered in the right of IBM Docs
			if(xPos > bWidth){	// Part of the cell may be sheltered in the right of IBM Docs		
				leftIconPos = (boxWidth - iconDx) +"px";	
			}else{
				leftIconPos = (boxWidth - bWidth + xPos -5) +"px";			
			}
			left = bWidth - boxWidth - iconDx + 1 ;
		}
		//for mirrored sheet -> Part of the popup dialog may be sheltered in the slidebar area
		if (BidiUtils.isGuiRtl() &&
			sidebar && !sidebar.isCollapsed() &&
			window.pe.scene.docType == "sheet" &&
			((xPos -  boxWidth/2) < (sidebar.getMaxWidth() + scrollbarW))){

			left = sidebar.getMaxWidth() + scrollbarW - 4;
			leftIconPos = (xPos - sidebar.getMaxWidth() - scrollbarW - iconDx - 3) +"px";
		}
		if(window.pe.scene.docType == "text" && this.overlapIndex > 0){
			left += this.overlapIndex*20; //for multiple popup dialogs, the position is calculated.
		}
		//boxHeight ->maxHeight is 392px;
		//var top = this.isWriting ? (yPos- boxHeight - deltaH) :(yPos- 392 - deltaH);
		var isShown = true;
		var top = yPos- 412 - deltaH;
		if(top <60){  // 60px is about the height of banner
			arrowup = true;
			top = yPos +h + 5;
			if(top + boxHeight > bHeight){
				top = bHeight - boxHeight - iconDy;
				isShown = false;
			} 
		} else{
			top = yPos- boxHeight - deltaH;
			if(dojo.isFF){				
				top += 5;
			}else if(dojo.isChrome || dojo.isSafari){
				top -= iconDy;
			}	
			if(window.pe.scene.docType == "pres"){
				top += 10;
			}
		}
		
		dojo.style(this.PopupNode,"left",left +"px");
		dojo.style(this.PopupNode,"top",top +"px");	
		this._locateArrow(arrowup, leftIconPos, rectified, isShown);
	},
	
	_locateArrow: function(arrowup, leftPos, rectified, isShown){
		dojo.attr(this.arrowNode,"src",contextPath + window.staticRootPath + '/images/blank.gif');
		dojo.removeAttr(this.arrowNode,"style");
		dojo.removeAttr(this.arrowNode,"class");
		dojo.removeAttr(this.allyArrowNode,"style");
		if(arrowup){
			dojo.addClass(this.arrowNode,"arrowup");
			dojo.style(this.arrowNode,"top","-9px");			
			this.allyArrowNode.innerHTML = (this.isOrphan || this.isWarning) ? "" : "&#9650;";
			dojo.style(this.allyArrowNode,"top","-15px");
		}else{
			dojo.addClass(this.arrowNode,"arrowdown");
			dojo.style(this.arrowNode,"bottom","-9px");			
			this.allyArrowNode.innerHTML = (this.isOrphan || this.isWarning) ? "" : "&#9660;";
			dojo.style(this.allyArrowNode,"bottom","-15px");
			
			var top = dojo.style(this.PopupNode,"top");
			if(rectified){ 
				if(dojo.isFF){				
					top -= 14;
				}else if(dojo.isChrome || dojo.isSafari){
					top -= 1;
				}
			}
			else{
				if(dojo.isFF){				
					top -= 13;
				}				
			}
			dojo.style(this.PopupNode,"top",top +"px");	
		}
		dojo.attr(this.arrowNode,'alt','');
		dojo.style(this.arrowNode,"left",leftPos);
		dojo.style(this.allyArrowNode,"left",leftPos);
		dojo.style(this.arrowNode,"display",isShown ? "block" :"none");
	},
	
	_checkHover: function(e, target) {  
	    if (this._getEvent(e).type == "mouseover") {  
	        return !this._contains(target, this._getEvent(e).relatedTarget  
	                || this._getEvent(e).fromElement)  
	                && !((this._getEvent(e).relatedTarget || this._getEvent(e).fromElement) === target);  
	    } else {  
	        return !this._contains(target, this._getEvent(e).relatedTarget  
	                || this._getEvent(e).toElement)  
	                && !((this._getEvent(e).relatedTarget || this._getEvent(e).toElement) === target);  
	    }  
	},  
	  
	_contains: function(parentNode, childNode) {  
	    if (parentNode.contains) {  
	        return parentNode != childNode && parentNode.contains(childNode);  
	    } else {  
	        return !!(parentNode.compareDocumentPosition(childNode) & 16);  
	    }  
	},
	
	_getEvent: function(e) {  
	    return e || window.event;  
	},
	
	_mouseOverHandler: function(event){
		if(this._isOverlapCommentsFocused()) {
			//Text Overlap case
			dojo.stopEvent(event);
			return;
		}
		var key = event.keyCode || event.charCode;      
		var target = event.currentTarget;
		if (target == null) 
			target = event.srcElement; 
		if(target == this.PopupNode || target == this.arrowNode){			
			if(this._checkHover(event,target)){
				if(!dojo.hasClass(this.PopupNode,"over")) dojo.addClass(this.PopupNode,"over");
				concord.util.events.publish(concord.util.events.commenting_popupDlg_mouseOver, [true]);
				if(this.isOrphan){					
					dojo.attr(this.PopupNode, "title", this.nls.orphanCommentTip);
				}
			}
		}
	},
	
	_mouseOutHandler: function(event){
		if(this._isOverlapCommentsFocused()) {
			//Text Overlap case
			dojo.stopEvent(event);
			return;
		}
		if(this.blockMouseOutEvent)
			return;
		var key = event.keyCode || event.charCode;        
		var target = event.currentTarget;
		if (target == null) 
			target = event.srcElement;
		if(target == this.PopupNode){			
			if(this._checkHover(event,target)){
				if(dojo.hasClass(this.PopupNode,"over")){
					this.mouseOutTimer = setTimeout(dojo.hitch(this, function(){
							concord.util.events.publish(concord.util.events.commenting_popupDlg_mouseOut, [true]);
							dojo.removeClass(this.PopupNode,"over");
							this.mouseOutTimer = null;
					}), 500);					
				}
			}
		}		
	},
	
	_isOverlapCommentsFocused: function(){
		if(this.overlapIndex != -1){
			var widgets = concord.widgets.sidebar.PopupCommentsCacher.getCachedWidgets();
			for(var i=0; i<widgets.length; i++){
				if(widgets[i].isShown()){
					if(widgets[i].getStickyZIndex() == this.zIndex){
						return true;
					}					
				}
			}
		}
		return false;		
	},
	
	_onStickyclick: function(e){		
		if(this.commentAtWidget){
			this.commentAtWidget.hideMentionDlg();
		}
		if(this.replyAtWidget){
			this.replyAtWidget.hideMentionDlg();
		}
		concord.util.events.publish(concord.util.events.commenting_popupDlg_click, [true]);
		if(this.overlapIndex != -1){
			var widgets = concord.widgets.sidebar.PopupCommentsCacher.getCachedWidgets();
			for(var i=0; i<widgets.length; i++){
				if(widgets[i].isShown()){
					widgets[i].setStickyZIndex(101);
				}
			}
			this.setStickyZIndex(this.zIndex);
		}		
	},
	
	_onStickyKeyDown: function(e){
		e = e || window.event;		
		var target = e.srcElement||e.target;
		var keyCode = e.keyCode;		
		if(dojo.keys.TAB == keyCode){
			if(this._isResolved()){
				var preBtnNode = this.PopupNode;
				var replies = dojo.query(".replies",this.PopupNode);
				if(replies && replies.length >0){
					preBtnNode = replies[replies.length -1];
				}
				if(e.shiftKey){
					if(target == this.deleteNode){
						dojo.stopEvent(e);
						this._setFocus(this.reopenNode);
					}else if(target == this.PopupNode){
						dojo.stopEvent(e);					
						this._setFocus(this.deleteNode);
					}else if(target == this.reopenNode){
						dojo.stopEvent(e);
						this._setFocus(preBtnNode);
					}				
				}else{
					if(target == this.deleteNode){
						dojo.stopEvent(e);					
						this._setFocus(this.PopupNode);
					}else if(target == this.reopenNode){
						dojo.stopEvent(e);
						this._setFocus(this.deleteNode);
					}else if(target == preBtnNode){
						dojo.stopEvent(e);
						this._setFocus(this.reopenNode);						
					}					
				}				
			}else{				
				if(e.shiftKey){
					if(target == this.PopupNode){
						dojo.stopEvent(e);					
						this._setFocus(this.deleteNode);
						this._setFocus(this.cancelNode);
					}
				}else{				
					if(target == this.cancelNode || target == this.deleteNode){
						dojo.stopEvent(e);					
						this._setFocus(this.PopupNode);
					}
				}
			}
		}else if(dojo.keys.ESCAPE == keyCode){
			this.hide();
			this.publishClosed();
		}		
	},
	
	_tabKeyHandler: function(event){
		var key = event.keyCode || event.charCode;
		if(key != dojo.keys.TAB) return;		
		dojo.stopEvent(event); 
		window.setTimeout(
			dojo.hitch(this, function(){
				if(this.isWriting){						
					if(event.shiftKey){
						this._setFocus(this.PopupNode);
					}else{
						this._setFocus(this.commentNode);
					} 					
				}else{
					if(event.shiftKey){
						var preBtnNode = this.PopupNode;
						var replies = dojo.query(".replies",this.PopupNode);
						if(replies && replies.length >0){
							preBtnNode = replies[replies.length -1];
						}
						this._setFocus(preBtnNode);
					}else{
						this._setFocus(this.replyNode);
					} 					
				}
		}),150);			
			
	},
    
	_onKeyDown: function(e){
		e = e || window.event;
		var key = (e.keyCode ? e.keyCode : e.which);
		if(key == 115 && (e.ctrlKey || e.metaKey)){
			if (e.preventDefault) 
				e.preventDefault();
			return;
		}            
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		if (e.keyCode != dojo.keys.ENTER && e.keyCode != dojo.keys.SPACE) return;   
		this._onclick(e);
	},
	
	_onclick: function(event){
		var key = event.keyCode || event.charCode;
        
		var target = event.target;
		if (target == null) 
			target = event.srcElement; 	
		if(target == this.cancelNode){  
			if(this._isReplyInputShown()){        		
				this.inputNode.value = "";
				this.hideNode(this.replyDivNode);
				this._showUI4RepliedBtns();
				this._updateRemainLabel(this.inputNode.value);
				this._locate(true);				
			}else{
				this.textareaNode.value = "";
				this.hide();
			}   				
		}else if(target == this.commentNode){
			this._doCommentAction();
			this.textareaNode.value = "";
			this.hide();
		}else if(target == this.resolveNode){
			this._doResolveAction();
			this.hide();
			this.publishClosed();
		}else if(target == this.replyNode){
			if(!this._isReplyInputShown()){        		
				this._showUI4Replying();
				this._setFocus(this.inputNode);
			}else{
				var responseItem = this._doReplyAction();
				if(responseItem){        			
					this._showUI4Replied(responseItem);
				}else{
					this._setFocus(this.inputNode);
				}
			} 
			this._locate(true);
		}else if(target == this.reopenNode){
			this._doReopenAction();
		}else if(target == this.viewNode){
			this._doExpandReplies();
			this._locate(true);
		}else if(target == this.deleteNode){
			this._doDeleteAction();
		}
	},
	
	_getOrphanFileType: function(){
		return "."+ DOC_SCENE.extension;
	},
	
	_doWarningComment: function(){
		var content = dojo.string.substitute(this.nls.warningCommentMsg, [this._getOrphanFileType()]);
		var user = {
				uid: "system_id_"+ (new Date()).getTime(),
				org: pe.authenticatedUser.getOrgId(),
				name: this.nls.warningCommentName 
			};		
		var e = concord.xcomments.CommentItem.createItem(content, user, /*assignee*/ null, /*img*/null, null);
		e.setWarning(true);	
		this.publishAddComment(e);		
	},
	
	_doCommentAction: function(){
		var content = dojo.trim(this.textareaNode.value);
		if (content === "")return;		
		var user = {
			uid: pe.authenticatedUser.getId(),
			org: pe.authenticatedUser.getOrgId(),
			name: pe.authenticatedUser.getName()
		};
		if (this.isBidi)
			content = BidiUtils.removeUCC(content);
		var mentions = this._doMentions(content, this.commentAtWidget);		
		var e = concord.xcomments.CommentItem.createItem(content, user, /*assignee*/ null, /*img*/null, mentions);
		this.publishAddComment(e);
		var isCommentExternal = window.g_isCommentExternal;
		if(!isCommentExternal){
			this._sendMentionRequest(mentions, user.uid, content);	
		}
		if(pe.scene.isPPTOrODP()){			
			this._doWarningComment();
		}
	},
	
	_doReplyAction: function(){
		var content = dojo.trim(this.inputNode.value);
		if (content === "")return;		
		var user = {
			uid: pe.authenticatedUser.getId(),
			org: pe.authenticatedUser.getOrgId(),
			name: pe.authenticatedUser.getName()
		};
		if (this.isBidi)
			content = BidiUtils.removeUCC(content);
		var mentions = this._doMentions(content, this.replyAtWidget);		
		var e = concord.xcomments.CommentItem.createItem(content, user, /*assignee*/ null, /*img*/null, mentions);
		this.publishAddReply(e);		
		var isCommentExternal = window.g_isCommentExternal;
		if(isCommentExternal){
			this._send3rdMentionRequest(mentions, user.uid, content);	
		}else{
			this._sendMentionRequest(mentions, user.uid, content);	
		}		
		return e;
	},
	
	//Send ajax request to server and trigger email notification & activitystream-@mention in Connections
	_sendMentionRequest: function(mentions, userid, content){
		if(!mentions || mentions.length == 0 ) return;					
		setTimeout(dojo.hitch(this, function(){	
			var idArray = new Array();
			for(var i=0; i< mentions.length; i++){
				var id = mentions[i].userid;
				if(id != userid){//Filter owner
					var obj ={};
					obj.id = id;
					idArray.push(obj);
				}
			}
			if(idArray.length == 0 ) return;			
			var url = concord.util.uri.getMentionUri();
			var link = window.location.href;
			var sData = dojo.toJson({"userIds":idArray, "commentId":dojox.uuid.generateRandomUuid(), "link": link, "content": content});			
			var response, ioArgs;
			dojo.xhrPost({
				url: url,
				handleAs: "json",
				handle: function(r, io) {response = r; ioArgs = io;},
				sync: false,
				contentType: "text/plain",
				postData: sData
			});			
		}), 500);		
	},	
	
	//Send ajax request to server and trigger email notification & activitystream-@mention in Connections
	//dealing with third party integration case
	_send3rdMentionRequest: function(mentions, userid, content){
		setTimeout(dojo.hitch(this, function(){	
			var url = concord.util.uri.getAtNotificationUri();
			if(url == undefined || url == "" ) return; //problem happened on 3rd setting in concord-config.json			
			var idArray = new Array();
			for(var i=0; i< mentions.length; i++){
				var id = mentions[i].userid;
				idArray.push(id);
			}
				
			var data = {};
			data.type = "reply";
			data.author = userid;
			if(idArray.length != 0){
				data.mentionList = idArray;
			}
			if(this.comments) {
				data.owner = this.comments.getItem(0).getCreatorId();
				data.commentsid = this.comments.getId();
			}
			data.link = window.location.href;
			data.content = content;	
			data.fileid = DOC_SCENE.uri;
			data.filename = DOC_SCENE.title;
			var sData = dojo.toJson(data);
			var response, ioArgs;
			dojo.xhrPost({
				url: url,
				handleAs: "json",
				handle: function(r, io) {response = r; ioArgs = io;},
				sync: false,
				contentType: "text/plain",
				postData: sData
			});			
		}), 500);		
	},
	
	_doMentions :  function(content, mWidget){
		var mentioned = new Array();
		if(content && mWidget){
			try {						
				//Fetch mention candidate from cache instread of from mWidget.getMentionList();
				var list = concord.widgets.sidebar.PopupCommentsCacher.getCachedMention();
				if (list && list.length > 0)
				{
					var editorArray = concord.widgets.sidebar.Comments.getPrefixEditors(list);
					for (var i=0; i<list.length;i++) {
						var name = list[i].name;
						var matchedName = null;
						
						if(editorArray.length != 0){
							for(var k =0 ; k<editorArray.length; k++){
								if(name === editorArray[k].shortName){									
									matchedName = editorArray[k].longName;
									break;
								}									
							}
							if(matchedName){								
								var mention = concord.widgets.sidebar.Comments.isMentioned(content, name, matchedName);
								if(mention){
									mentioned.push(list[i]);	
									continue;									
								}
							}
						}						
						if(!matchedName){//cover 99% user cases						
							var key ="@"+name+" ";
							if(content.indexOf(key) != -1){
								mentioned.push(list[i]);	
								continue;
							}
						}
						//Deal with the last mentioned
						var key = "@"+name;
						var lIndex = content.lastIndexOf(key);
						if(content.substring(lIndex,content.length) == key){
							mentioned.push(list[i]);
						}
					}
				}  
			} catch(e) {
				console.log('PopupComments.js: Cannnot get mention user list.');
			}
		}
		return mentioned;
	},
	
	_updateResolved: function(resolved){
		if(resolved){
			if(!dojo.hasClass(this.PopupNode,"resolved"))dojo.addClass(this.PopupNode,"resolved");
		}else{
			dojo.removeClass(this.PopupNode,"resolved");
		}
		//To update aria-label information of the popup dialog
		this.jawStatus = dojo.string.substitute(this.nls.jawsCommentStatusHint, {'status': resolved 
			? this.nls.menuresolved : this.nls.menuactive});		
		dijit.setWaiState(this.PopupNode,'label', this.jawComment +"\n"+ this.jawContent +"\n"+  this.jawStatus);
	},
	
	_isResolved: function(){
		return dojo.hasClass(this.PopupNode,"resolved");
	},
	
	_isReplyInputShown: function(){
		return !dojo.hasClass(this.replyDivNode,"hidden");		
	},
	
	_doResolveAction: function(){
		this._updateResolved(true);
		this._showUI4ResolvedBtns();
		this.publishResolved();
	},
	
	_doReopenAction: function(){
		this._updateResolved(false);
		this._showUI4ReopenBtns();
		this.publishReopened();
	},
	
	_doExpandReplies: function(){
		dojo.query(".hidden", this.repliesNode).forEach(dojo.hitch(this, function(node){
			this.showNode(node);                
		}));	
		this.hideNode(this.separatorNode);
		//set focus
		if(this._isResolved()){
			this._setFocus(this.reopenNode);
		}else if(this._isReplyInputShown()){
			this._setFocus(this.replyNode);
		}else{
			this._setFocus(this.resolveNode);
		}
	},
	
	_doDeleteAction: function(){
		if(this.bReadOnly)
			return;
    	
		// user can not delete comment in read-only mode
		var tempScene = window.pe.scene;
		if ((tempScene.docType == "pres") && (tempScene.bInReadOnlyMode ||
			tempScene.isViewDraftMode()))
			return;
		
		var eventData = [{eventName: concord.util.events.genericEvents_eventName_blockKeyPress}];
		concord.util.events.publish(concord.util.events.genericEvents, eventData);
		
		var msg = this.nls.sure;
		var cllbk = dojo.hitch(this, function(editor, answer){
			var eventData = [{eventName: concord.util.events.genericEvents_eventName_unblockKeyPress}];
			concord.util.events.publish(concord.util.events.genericEvents, eventData);			
			if(answer){
				setTimeout(dojo.hitch(this, function(){
					var item = this.comments.getItem(0);
					if (item) {
						var warning = item.getWarning();
						if(warning){ item.setVisible(-1); } 
						var prestate = item.getVisible();
						// dont try to permanently delete a comment when 
						// it has already been deleted in coedit environment.
						if (prestate != -1 && prestate != -2)
							this.publishRemoveComment();
						
						if(warning){
							concord.widgets.sidebar.CommentsController.publishHideEvent(this.comments.getId());
						}
					}
					this.hide();
				}), 0);
			}else{
				setTimeout(dojo.hitch(this, function(){	
					this._setFocus(this.deleteNode);
				}), 0);				
			}
		});
		var dlg = new concord.widgets.CustomConfirmBox( null, null, null, true, { message:msg,callback:cllbk} );
		dlg.show();        		
	},
	
	_doCache: function(){
		if(this.comments){
			var content = dojo.trim(this.inputNode.value);
			var status = {};
			status.showReply = this._isReplyInputShown() && content != "";
			status.responseContent = content;			
			concord.widgets.sidebar.PopupCommentsCacher.setCachedStatus(this.comments.getId(), status);	 
		}
	},
	
	_showUI4ReplyBtns: function(){
		this.replyNode.innerHTML = this.nls.saveBtn;
		this.showNode(this.replyDivNode);
		this.showNode(this.replyNode);
		if(this.replyAtWidget)
			this.replyAtWidget.show();		
		this.showNode(this.cancelNode);
		this.showNode(this.labelNode);
		this.hideNode(this.resolveNode);
		this.hideNode(this.commentNode);
		this._handleDelete(true);
	},
	
	_showUI4RepliedBtns: function(){
		this.showNode(this.resolveNode);
		this._setFocus(this.resolveNode);
		this.replyNode.innerHTML = this.nls.replyBtn;
		this.showNode(this.replyNode);
		this.hideNode(this.labelNode);
		this.hideNode(this.replyDivNode);
		if(this.replyAtWidget)
			this.replyAtWidget.hide();		
		this.hideNode(this.cancelNode);
		this.hideNode(this.commentNode);
		this._handleDelete();
	},	

	_showUI4EditBtns: function(resolved, forcedHide){	
		//Only show: resolve, reply and comment's content
		if(this.isNoOrg){
			dojo.addClass(this.resolveNode, "msoffice");
		}
		if(resolved){
			this._showUI4ResolvedBtns();
			return;
		}
		if(this._isReplyInputShown()){
			this._showUI4ReplyBtns();
		}else{	
			if(this.isOrphan || this.isWarning){
				this.hideNode(this.resolveNode);
				this.hideNode(this.replyNode);				
			}else{
				if(!forcedHide) {
				 	this.showNode(this.resolveNode);
				 	this.showNode(this.replyNode);
				}
			}
			this.showNode(this.cContentNode);
			this.hideNode(this.textareaNode);
			if(this.commentAtWidget)
				this.commentAtWidget.hide();
			
			this.hideNode(this.cancelNode);
			this.hideNode(this.commentNode);
			this._handleDelete(forcedHide);
		}
	},

	_showUI4WritingBtns: function(){
		//Only show: commenting textarea, comment and cancel
		this.showNode(this.textareaNode);
		if(this.commentAtWidget)
			this.commentAtWidget.show();
		
		this.showNode(this.cancelNode);
		this.showNode(this.commentNode);
		this.showNode(this.labelNode);
		
		this.hideNode(this.separatorNode);
		this.hideNode(this.replyDivNode);
		this.hideNode(this.resolveNode);
		this.hideNode(this.replyNode);
		this.hideNode(this.cContentNode); 
		
		this._handleDelete(true);
	},
	
	_showUI4ResolvedBtns: function(){
		//If resolved comment, show comment content firstly
		this.showNode(this.cContentNode);
		this.hideNode(this.resolveNode);
		this.hideNode(this.replyNode);
		this.hideNode(this.commentNode);
		this.hideNode(this.cancelNode);
		this.hideNode(this.deleteNode);
		if (this.isBidi && BidiUtils.isGuiRtl()) {
			dojo.style(this.reopenDivNode, "display", "inline" );
			dojo.style(this.actionsDivNode, "display", "inline" );
		}
		//Not orphaned comment, show reopen button
		if(!this.isOrphan && !this.isWarning){
			this.showNode(this.reopenDivNode);
		}	
		//Not orphaned and Is Warning comment, hide delete button			
		this._handleDelete(false, true);

	},	
	
	_showUI4ReopenBtns: function(){
		this.showNode(this.resolveNode);
		this._setFocus(this.resolveNode);			
		this.showNode(this.replyNode);	
		if (this.isBidi && BidiUtils.isGuiRtl()) {
			dojo.style(this.reopenDivNode, "display", "block" );
			dojo.style(this.actionsDivNode, "display", "block" );
		}		
		this.hideNode(this.reopenDivNode);		
		this._handleDelete();	
	},
	
	handleContent: function(event){
		var key = event.keyCode || event.charCode;
		if (key == dojo.keys.ENTER) 
			dojo.stopEvent(event);
        
		var inputarea = event.target;
		if (inputarea == null) 
			inputarea = event.srcElement; 
        
		this.updateRemainLabel(inputarea);
	},
	
	updateRemainLabel: function(inputarea){
		var content = inputarea.value;		
		var count = this.charEQ.GetLength_latin(content);
		if(this.maxcomments - count < 0){
			content = content.substring(0,this.maxcomments);
			inputarea.value = content;              
		}            
//		if(dojo.isIE){
//			var text = inputarea.innerText;
//			if(text.indexOf("\n") >= 0){
//				var contentIE = inputarea.innerText.replace(/[\n\r]/g," ");
//				inputarea.value = contentIE;
//			}
//		}else{
//			var content = (inputarea.value).replace(/\n/g, " ");
//			inputarea.value = content;  
//		}         
		this._updateRemainLabel(inputarea.value);
	},
    
	_updateRemainLabel: function(text){
		var count = text.length;
		count = this.charEQ.GetLength_latin(text);
		count = this.maxcomments - count;
		count = count > 0 ? count : 0;      
		var label = this.labelNode;
		if(count == 0){
			dijit.setWaiState(label,'live', 'assertive');
			dijit.setWaiState(label,'atomic', 'true');
			dijit.setWaiState(label,'label',this.nls.remainLabelHint);
			dijit.setWaiRole(label,'alert');
		}else{
			dijit.removeWaiState(label,'live');
			dijit.removeWaiState(label,'label');
			dijit.removeWaiState(label,'atomic');
			dojo.removeAttr(label,'role');    	
		}
		if (BidiUtils.isArabicLocale())
			count = BidiUtils.convertArabicToHindi(count + "");

		label.innerHTML = count;
	},
    
	_isExceedPermitKeys: function(event){
		if(event.ctrlKey || event.metaKey)
			return true;
		var key = event.keyCode || event.charCode;
		switch (key) {
			case dojo.keys.DELETE:
			case dojo.keys.BACKSPACE:
			case dojo.keys.ENTER:
			case dojo.keys.LEFT_ARROW:
			case dojo.keys.RIGHT_ARROW:
			case dojo.keys.UP_ARROW:
			case dojo.keys.DOWN_ARROW:	
			case dojo.keys.SELECT:
			case dojo.keys.TAB:
				return true;
			default:
				return false;
		}
		return false;
	},
    
	_hasCommentsSelection: function(e){
		if(dojo.isIE){    		
			if(document.selection){
				var sel = document.selection.createRange();
				if(sel && sel.text.length >0){
					return true;
				}
			}    	    
		}else{
			if(e.selectionStart != undefined && e.selectionEnd != undefined){
				var start = e.selectionStart;
				var end = e.selectionEnd;
				if(start != end)
					return true;
			}    		
		}
		return false;
	},
    
	_keyDownHandler: function(event){
		if(this.bReadOnly)
			return;
    	
		var key = event.keyCode || event.charCode;
		if(key == dojo.keys.TAB){
			this._tabKeyHandler(event);			
			return;
		}
		var inputarea = null;
		if (event.target) 
			inputarea = event.target;
		else 
			inputarea = event.srcElement;
        
		var content = inputarea.value;    
		var txtLeng = content.length;
		txtLeng = this.charEQ.GetLength_latin(content);
        //Shift + Enter to add comment/reply directly
		if (key == dojo.keys.ENTER && event.shiftKey){      
			dojo.stopEvent(event);              
			if (txtLeng == 0 || dojo.trim(content).length == 0) {
				return;
			}
			this.handleContent(event);
			if (inputarea == this.textareaNode){
				this._doCommentAction();
				this.textareaNode.value = "";
				this.hide();                
			}else{
				var responseItem = this._doReplyAction();
				if(responseItem){        			
					this._showUI4Replied(responseItem);
				}else{
					this._setFocus(this.inputNode);
				}
				this._locate(true);
			}
		}else if (txtLeng >= this.maxcomments && !this._isExceedPermitKeys(event)) {
			if(this._hasCommentsSelection(inputarea)){
				return;
			}
			if (event.preventDefault) 
				event.preventDefault();
			else 
				event.returnValue = false;
		}
	},
    
	_keyUpHandler: function(event) {
		this.handleContent(event);
	},
    
	_pasteHandler: function(event){
		if(this.bReadOnly)
			return;   	
		setTimeout(dojo.hitch(this, function(){	
			var comment = null;
			if (event.target) 
				comment = event.target;
			else 
				comment = event.srcElement;    		
			this.updateRemainLabel(comment);
		}), 0);
	},    
    	
	//add comment event
	publishAddComment : function(data){
		var eventData = [{eventName: concord.util.events.commenting_addComment, commentingData:data}];
		concord.util.events.publish(concord.util.events.commentingEvents, eventData);
	},
	//remove comment event
	publishRemoveComment : function(){
		var eventData = [{eventName: concord.util.events.commenting_removeComment, widgetId: this.comments.getId()}];
		concord.util.events.publish(concord.util.events.commentingEvents, eventData);
	},
	//update comment event
	publishUpdateComment : function(data){
		var eventData = [{eventName: concord.util.events.commenting_updateComment, commentingData:data}];
		concord.util.events.publish(concord.util.events.commentingEvents, eventData);
	},
	//add replay event
	publishAddReply : function(data){
		var eventData = [{eventName: concord.util.events.commenting_addReply, commentingData:data, widgetId: this.comments.getId()}];
		concord.util.events.publish(concord.util.events.commentingEvents, eventData);
	},
	//add resolved event
	publishResolved : function(){
		var eventData = [{eventName: concord.util.events.commenting_resolved, widgetId: this.comments.getId()}];
		concord.util.events.publish(concord.util.events.commentingEvents, eventData);
	},
	//add reopened event
	publishReopened: function(){
		var eventData = [{eventName: concord.util.events.commenting_reopen, widgetId: this.comments.getId()}];
		concord.util.events.publish(concord.util.events.commentingEvents, eventData);
	},
	//Dialog is closed & need to send notification to listners
	publishClosed: function(){		
		concord.util.events.publish(concord.util.events.commenting_closeCommentPopupDlg, null);
	}
});

concord.widgets.sidebar.PopupComments.getPosition = function(commentsId){
	if(window.pe.scene.docType == "pres"){
		var pos = {eventName: concord.util.events.comments_queryposition,id:commentsId};
		concord.util.events.publish(concord.util.events.comments_queryposition, [pos]);
		if (pos.filled)
			return pos;
		else 
			return null;
	}else if(window.pe.scene.docType == "sheet"){
		return pe.scene.editor.getCommentsHdl().getPosition(commentsId);
	}else if(window.pe.scene.docType == "text"){
		var pos = {eventname: concord.util.events.comments_queryposition, filled:false};
		concord.util.events.publish(concord.util.events.comments_queryposition, [pos]);
		if (pos.filled)
			return pos;
		else 
			return null;
	}
	return null;
};
