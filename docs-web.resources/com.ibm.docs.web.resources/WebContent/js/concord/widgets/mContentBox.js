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

/*
 * @mContentBox.js IBM Lotus Project Concord component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.mContentBox");
dojo.require("concord.widgets.contentBox");
dojo.require("concord.util.mobileUtil");

dojo.declare("concord.widgets.mContentBox", [concord.widgets.contentBox], {
	
	groupContentBox : null,
	focusLsr : null,
	blurLsr : null,
	publishBoxEditModeFlag : false,
	
	attachEventToContentBox: function()
	{
		this.connectArray = [];
	},
	
	makeResizeable: function()
	{
		// do nothing for mobile.
	},
	
	adjustPositionForBorder: function(aNode,onExit,topLeft){
		// do nothing for mobile.
		return aNode;
	},
	
	addLockedIcon: function(user){
		this.inherited(arguments);
		if(this.mainNode)
			concord.util.mobileUtil.presObject.processMessage(this.mainNode.id,"lock");
	},
	
	deleteLockedIcon: function(){
		this.inherited(arguments);
		if(this.mainNode)
			concord.util.mobileUtil.presObject.processMessage(this.mainNode.id,"unlock");
	},
	
	refreshPositionFromSorter: function(){
		// do nothing for mobile.
	},
	
	addCommentIcon: function(currentCommentsId)
	{
		//adding image icon on top right
		var ic = document.createElement('img');
		ic.id = 'ic_'+currentCommentsId;
		dojo.addClass(ic,'imgcomment');
		//ic.src=window.contextPath + window.staticRootPath + '/styles/css/images/comment16.png';
		var a11yStrings = dojo.i18n.getLocalization("concord.util", "a11y");
		dojo.attr(ic,'alt', a11yStrings.aria_comments_icon);
		this.mainNode.appendChild(ic);
		var commentIconSize = PresConstants.COMMENT_ICON_SIZE;
	    window.pe.scene.slideEditor.currentCommentIconSize = commentIconSize;
		dojo.style(ic,{
			'display':'none',
			'position':'absolute',
			'width':commentIconSize + "px",
			'height':commentIconSize + "px",
			'border':'none',
			'cursor':'pointer',
			'display':concord.util.mobileUtil.disablePresEditing?'none':''
		});
		//this.connectArray.push(dojo.connect(ic,'ontouchend', dojo.hitch(this,this._expandComments,ic.id,false)));
		this.updateCommentIconPosition();		
		var events = [];
		var params = {};
		var mainNodeId = dojo.attr(this.mainNode, 'commentsId')||'';
		if(this.commentsId.length > mainNodeId.length) {
			params['commentsId'] = this.commentsId;				
		} else {
			params['commentsId'] = mainNodeId;
		}
		params['contentBoxId'] = this.mainNode.id;
		events.push({"name":"commentChange", "params":params});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);	
	},
	
	deleteCommentIcon: function(commentId){
		this.inherited(arguments);
		var events = [];
		var params = {};
		var updatedIds = "";
		if(this.commentsId) {
			var cid = dojo.trim(dojo.attr(this.mainNode, 'commentsId'));
			updatedIds = dojo.trim(cid.replace(commentId, ""));
		}
		params['commentsId'] = updatedIds;
		params['contentBoxId'] = this.mainNode.id;
		events.push({"name":"commentChange", "params":params});
		concord.util.mobileUtil.jsObjCBridge.postEvents(events);
	},
	addContextMenu: function(){
		// do nothing for mobile
	},
	/**
	 * Update the table dimenstions on resize.  This will update the 
	 * content box, the internal table and the handles
	 */
	_updateTableOnEditResize: function(){
		this.inherited(arguments);
		concord.util.mobileUtil.presObject.processMessage(this.mainNode.id, MSGUTIL.actType.setAttributes);
	},
	
	updateContentBoxLockedIconPosition: function()
	{
		//the whole slideEditor is hidden on iPad during slideshow.
		//this causes the offsetWidth is 0...
		//let show slideEditor and hide it before this fucntion returns.
		//defect 30846.
		if (concord.util.browser.isMobile() && window.pe.scene.slideShowObj ) {
			var mainNode = dojo.byId("mainNode");
			mainNode.style.display = 'block';
		}
		this.inherited(arguments);
		//defect 30846.
		//hide slideEditor again.
		if (concord.util.browser.isMobile() && window.pe.scene.slideShowObj ) {
			var mainNode = dojo.byId("mainNode");
			mainNode.style.display = 'none';
		}
	},
	
	updateCommentIconPosition: function()
	{
		var ic = this.getCommentIconNodes();
		if(ic && ic.length>0) {			
			var icSize = PresConstants.COMMENT_ICON_SIZE;
			var borderSize = dojo.style(this.mainNode,'borderTopWidth');
			var handleAdjust = icSize/2;
			for(var i=0;i<ic.length;i++) {
				if(borderSize <= 0)
					var topPos = i * icSize;
				else
					var topPos = i * icSize - borderSize;
				
				dojo.style(ic[i],{
					'display':'none',
					'position':'absolute',
					'top': (topPos+2)+"px",
					'left': (this.mainNode.offsetWidth-borderSize)+"px",
					'width': icSize + "px",
	    			'height':icSize + "px"
				});
			}
		}				
		ic = null;
	},
	
	getMainNodeHeightBasedOnDataContent: function(){
		var heightVal = null;
		if(this.contentBoxType == PresConstants.CONTENTBOX_TABLE_TYPE)
		{
			var ckBody = this.editor && this.editor.document && this.editor.document.getBody();
			heightVal = ckBody && ckBody.$.offsetHeight;
		}
		if(heightVal)
			return heightVal;
		return this.inherited(arguments);
	},
	
	handleCursorOnEdit : function(){
		if(this.editor && this.editor.document)
		{
			this.focusLsr && dojo.disconnect(this.focusLsr);
			this.blurLsr && dojo.disconnect(this.blurLsr);
			this.focusLsr = dojo.connect(this.editor.document.getBody().$,'onfocus',dojo.hitch(this,this.onFocus));
			this.blurLsr = dojo.connect(this.editor.document.getBody().$,'onblur',dojo.hitch(this,this.onBlur));
		}
	},
	
	onFocus : function()
	{
		this.processEditorOpen();
		var contentBox = !!this.groupContentBox ? this.groupContentBox : this;
		contentBox.publishBoxEditModeFlag = true;
		contentBox.editModeOn = true;
		contentBox.publishBoxEditMode();
		contentBox.publishBoxEditModeFlag = false;
	},
	
	onBlur : function()
	{
		var node = PresCKUtil.getDFCNode(this.editor);
		if(node.querySelector('b, i, u, strike'))
		{
			var ckNode = new CKEDITOR.dom.element(node);
			concord.util.mobileUtil.normalizeElements(ckNode,ckNode);
			PresCKUtil.adjustToolBar(["BOLD", "ITALIC", "UNDERLINE", "LINETHROUGH"]);
		}
		PresCKUtil.doesNodeContainText(node) && this.synchAllData(node);
					
		this.processEditorClose();
		var contentBox = !!this.groupContentBox ? this.groupContentBox : this;
		contentBox.publishBoxEditModeFlag = true;
		contentBox.editModeOn = false;
		contentBox.publishBoxEditMode();
		contentBox.publishBoxEditModeFlag = false;
	},
	
	resetCKContentAndSynchForDefaultText: function(msgPairsList, addToUndoAndMerge)
	{
		this.inherited(arguments);
		// copy canvas default text to CK.
		if(this.editor && this.editor.document)
		{
			var ckBody = this.editor.document.$.body;
			ckBody.innerHTML = this.contentBoxDataNode.innerHTML;
		}
	},
	
	publishBoxEditMode: function(){
		if(!this.publishBoxEditModeFlag)
			return;
		this.inherited(arguments);
	},

	addTempMoveResizeDiv : function()
	{
		// do nothing for mobile.
	},
	
	removeTempMoveResizeDiv : function()
	{
		// do nothing for mobile.
	},
	
	disableMenuItemsOnDeSelect: function()
	{
		if ( !pe.scene.slideEditor.isVerticalAlignButtonEnabled() && this.editor)
		{
			this.editor.getCommand('verticalAlignTop').setState(CKEDITOR.TRISTATE_DISABLED);
			this.editor.getCommand('verticalAlignMiddle').setState(CKEDITOR.TRISTATE_DISABLED);
			this.editor.getCommand('verticalAlignBottom').setState(CKEDITOR.TRISTATE_DISABLED);
		}
		this.inherited(arguments);
	}
});
