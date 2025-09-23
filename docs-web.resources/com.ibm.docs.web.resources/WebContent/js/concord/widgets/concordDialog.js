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

dojo.provide("concord.widgets.concordDialog");
dojo.require("concord.widgets.LotusTextButton");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("dojo.i18n");
dojo.require("dijit.form.Form");
dojo.require("concord.util.BidiUtils");
dojo.require("dojo.string");
dojo.require("concord.util.strings");
dojo.require("concord.util.browser");
dojo.requireLocalization("concord.widgets","concordDialog");
dojo.declare("concord.widgets.concordDialog", null, {
	params: null,
	warnMsgID: "ConcordWarnMsg",
	contentDivID: "ConcordContent",
	dialogId: "concordDialogId",
	describedInfoId: null,
	cancelLabel: null, 
	dialog: null,
	editor: null,
	OKButtonID: "OKButton",
	CancelButtonID: "CancelButton",
	NoButtonID: "NoButton",
	focusHdl: null,
	okBtn: null,
	cancelBtn: null,
	noBtn: null,
	btnContainer: null,
	procContainer: null,
	
	//defect 46959, lock for double click event
	dbc_lock: null,
	// customizable
	concordTitle: null,
	oKLabel: null,
	noLabel: null,
	betaMsg: null,	
	visible: true, // make Cancel button visible?
	okVisible: true, // make Ok button visible?
	noVisible: false, // make No button visible?
	closeVisible: true, // make close button visible?
	timeout: 0,  // if dialog isn't created from menu item, the timeout should be set
	hideWarnMsg: false,
	formParams: null,
	_dialogOnCancelBak: null,
	savedOnSelectStartHandler: null,
	isSTBuddyList:false,
	constructor: function(object, title, oklabel, visible, params, formParams) {
		if (params && params.isSTBuddyList)
		{
			this.isSTBuddyList = true;
			this.okVisible = false;
		}
		
		this.editorFocusback = !( params && params.editorFocusNotback );
			
		this.dbc_lock = false;
		var nls = dojo.i18n.getLocalization("concord.widgets","concordDialog");
		if (params != undefined)
		{
			this.params = params;
		}
		if(formParams != undefined){
			this.formParams = formParams;
		}	
		
		this.cancelLabel = nls.cancelLabel;
		this.oKLabel = nls.oKLabel;
		this.noLabel = nls.noLabel;
		this.betaMsg = nls.betaMsg;
		this.concordTitle = dojo.string.substitute(nls.productName, { 'productName' : concord.util.strings.getProdName() });
		this.editor = object;

		if ( title )
		{
			var title_id = title.split("#");
			this.concordTitle = title_id[0];
			this.dialogId = title_id[1] || this.concordTitle;
		}
		else
		{
			this.dialogId = this.concordTitle;
		}
			
		this.setDialogID();
		
		if (oklabel != undefined && oklabel != null && oklabel != '')
			this.oKLabel = oklabel;

		// true vs false
		if (visible != undefined)
			this.visible = visible;
		
		this.dialog = dijit.byId(this.dialogId);
		if( this.dialog )
			this._destroy();

		if (this.params != null && this.params.noLabel != undefined && this.params.noLabel != null && this.params.noLabel != '')
			this.setNoLabel(this.params.noLabel);

		this.dialog = this.createDialog();
		this.postCreate();
		// If document.onselectstart handler is set, text selection in the dialog will not work.
		// It is required that we save the old handler while the dialog is open, and restore it
		// to the previous value when the dialog closes.
		if ( window.g_presentationMode ){
			pe.scene.disableOnSelectStart();
		}
	},

	setNoLabel: function(noLabel) {
		this.noLabel = noLabel;
		this.noVisible = true;
	},

	createContent: function (contentDiv) {
		// Overridden
		return;
	},
	
	/**
	 * called after createContent
	 */
	postCreate: function()
	{
		//overridden
		return;
	},
	
	setDialogID: function() {
		// Overridden
		return;
	},
	
	// Must be invoked after dialogId is set
	_genButtonID: function(){
		this.OKButtonID = this.dialogId+"OKButton";
		this.CancelButtonID = this.dialogId+"CancelButton";
		this.NoButtonID = this.dialogId+"NoButton";
	},
	
	_createForm: function(attribute, container){
		var form = new dijit.form.Form(attribute);
		dojo.addClass(form.domNode,"concordDialogForm");		
		container.appendChild(form.domNode);
		return form.domNode;
	}, 
			
	createDialog: function () {
		var doc = dojo.doc;
		var dialogDiv = dojo.create('div', null, doc.body);
		var contentDiv = null;
		var footerDiv = null;
		
		if(this.formParams){
		    var _form =  this._createForm(this.formParams,dialogDiv);
		    contentDiv = dojo.create('div', null, _form);
		    footerDiv = dojo.create('div', null, _form);
		}else{ 	 		
		    contentDiv = dojo.create('div', null, dialogDiv);
		    footerDiv = dojo.create('div', null, dialogDiv);			
		}
		
		// UX oneui requirement for warning messages to be shown at the top of the dialog
		// Added before the actual content of the dialog (18952)
		dojo.attr(contentDiv, "id", this.contentDivID + (new Date()).getTime());
		var warnMsgDiv = dojo.create('div', null, contentDiv);
		var msgLabel = dojo.create('label', null, warnMsgDiv);
		dojo.attr(warnMsgDiv, "id", this.warnMsgID + this.dialogId);
		dojo.addClass (warnMsgDiv, "concordDialogWarningMsg");

		this.createContent (contentDiv);
		
		dojo.addClass(dialogDiv, "dijitDialogPaneContent");
		dojo.addClass(contentDiv, "dijitDialogPaneContentArea");
		// for process dialog hide the line.
		if(this.okVisible || this.noVisible || this.visible) {
			dojo.addClass(footerDiv, "dijitDialogPaneActionBar");
		} else {
			dojo.addClass(footerDiv, "dijitDialogPaneActionBarWithoutLine");
			if(this.params && !this.params.customizedBtnLabel) // focus on contentDiv only if no customized button
				dojo.attr(contentDiv, 'tabindex', '0');
		}
		
		// create a loading progress image
		var imgContainer = dojo.create('div', null, footerDiv);
		imgContainer.style.display = 'none';
		dojo.addClass(imgContainer,'dlg_processing2_container');
//		var imgDiv = dojo.create('span', null, imgContainer);
//		dojo.addClass(imgDiv,'dlg_processing2_img');
		// workaround for defect 17001
		// Background image is invisible in high contrast mode, so create image directly here.
		// This is just a workaround. 
		// The correct fix should be to add span to show the alt text in high contract mode.
		dojo.style(imgContainer, 'width','32px');
		dojo.style(imgContainer, 'height', '32px');
		var img = dojo.create('img', {src: contextPath + window.staticRootPath + '/styles/css/images/loading.gif',
									  alt: ''}, imgContainer);
		
		this.procContainer = imgContainer;

		this._genButtonID();

		var param1 = {label: this.oKLabel, title: this.oKLabel, id: this.OKButtonID,onClick: dojo.hitch(this, "_onOk", this.editor)};;
		var param2 = {label: this.cancelLabel, title: this.cancelLabel, id: this.CancelButtonID,onClick: dojo.hitch(this, "_onCancel", this.editor)};;
		var param3 = {label: this.noLabel, title: this.noLabel, id: this.NoButtonID,onClick: dojo.hitch(this, "_onNo", this.editor)};;
		if(this.params && this.params.numElements)
		{
			var tabindex1 = this.params.numElements + 1;
			param1 = {label: this.oKLabel, id: this.OKButtonID,tabIndex:tabindex1,onClick: dojo.hitch(this, "_onOk", this.editor)};
			var tabindex2 = this.params.numElements+2;
			param2 = {label: this.cancelLabel, id: this.CancelButtonID,tabIndex:tabindex2,onClick: dojo.hitch(this, "_onCancel", this.editor)};
			var tabindex3 = this.params.numElements+3;
			param3 = {label: this.noLabel, id: this.NoButtonID,tabIndex:tabindex3,onClick: dojo.hitch(this, "_onNo", this.editor)};
		}
		var button1 = new concord.widgets.LotusTextButton(param1);
		var button3 = new concord.widgets.LotusTextButton(param3);

		var button2 = new concord.widgets.LotusTextButton(param2);
		if (!this.okVisible)
			dojo.style(button1.domNode, {"display":"none"});
		if (!this.noVisible)
			dojo.style(button3.domNode, {"display":"none"});
		if (!this.visible)
			dojo.style(button2.domNode, {"display":"none"});
		// TODO
		//		dojo.addClass (button1, "dijitButton");
		//		dojo.addClass (button2, "dijitButton");
		footerDiv.appendChild(button1.domNode);
		footerDiv.appendChild(button3.domNode);
		footerDiv.appendChild(button2.domNode); 
		if(this.formParams){
			dojo.style(button1.domNode, 'type', 'submit');
		}
		this.okBtn = button1;
		this.cancelBtn = button2;
		this.noBtn = button3;
		this.btnContainer = footerDiv;
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		var dlgParams = {dir: dirAttr, title: this.concordTitle, id: this.dialogId, refocus : false};
		if (concord.util.browser.isMobileBrowser()) {
			dlgParams.resize = function() {
				// summary:
				//		Called when viewport scrolled or size changed.  Adjust Dialog as necessary to keep it visible.
				// tags:
				//		private
				if(this.domNode.style.display != "none"){
					this._size();
					// when viewport resize, also make the dialog position changed in mobile
					this._position();
				}
			}
		}
		var dg = new dijit.Dialog(dlgParams, dialogDiv);
		if(this.describedInfoId)
			dijit.setWaiState(dg.domNode,'describedby', this.describedInfoId);
			
		if(this.params && this.params.BETA){
			var btnId = this.dialogId + '_beta_id';
			var imgBtn = dojo.create('img',{id: btnId, title: this.betaMsg},dg.titleNode);
			dojo.attr(imgBtn,'alt',this.betaMsg);
			dojo.addClass(imgBtn,"concordBetaIcon");
			var imgPath = '/images/beta_icon.png';
			dojo.attr(imgBtn,'src',contextPath + window.staticRootPath + imgPath);           		
		}
		
		if(!this.closeVisible) {
			dojo.style(dg.closeButtonNode, {"display":"none"});
		}

		if(this.closeVisible) {
			// disable ESC
			// dg.onCancel is triggered by ESC key
			// use Widget.connect instead of dojo.connect to disconnect automatically when destroy.
			dg.connect(dg, "onCancel",dojo.hitch(this, "_onCancel", this.editor));
		}
		
		if (this.isSTBuddyList)
		{
			contentDiv.parentNode.style.padding = '0';
			contentDiv.parentNode.parentNode.style.padding = '0';
			
			contentDiv.parentNode.style.width = 'auto';
			contentDiv.parentNode.style.height = 'auto';
			
			footerDiv.style.padding = '0';
			footerDiv.style.margin = '0';
		}

		return dg;
	},
	
	createErrorIcon: function(container, iconId, title){
		if (!iconId) iconId = 'id_imageicon';
		var img = dojo.create('img', 
			{
				src: contextPath + window.staticRootPath + '/js/dojo/resources/blank.gif',
				alt: 'Error',
				id: iconId
			}
			, container);
		
		if (title) {
			dojo.attr(img, 'title', title);
			dijit.setWaiState(img,'label', title);
		}
		
		img.style.display ='none';	
		dojo.attr(img, 'tabindex', '0');
		dojo.addClass(img,'concordTaskLotusIcon');
		dojo.addClass(img, 'yourProductSprite yourProductSprite-msgError16');		
	},
	
	createInfoIcon: function(container, iconId, title){
		if (!iconId) iconId = 'id_imageicon';
		var img = dojo.create('img', 
			{
				src: contextPath + window.staticRootPath + '/js/dojo/resources/blank.gif',
				alt: 'Information',
				id: iconId
			}
			, container);
		
		if (title) {
			dojo.attr(img, 'title', title);
			dijit.setWaiState(img,'label', title);
		}

		dojo.attr(img, 'tabindex', '0');
		dojo.addClass(img,'concordTaskLotusIcon');
		dojo.addClass(img, 'yourProductSprite yourProductSprite-msgInfo16');		
	},

	_disableBtn: function(btn, disabled){
		btn.setAttribute('disabled', disabled);
	},

	disableOkBtn: function(disable)
	{
		this._disableBtn(this.okBtn, disable);
	},

	disableCancelBtn: function(disable)
	{
		this._disableBtn(this.cancelBtn, disable);
		if(disable){
			this._dialogOnCancelBak = this.dialog.onCancel;
			this.dialog.onCancel = function(){};
		}else{
			if(this._dialogOnCancelBak){
			    this.dialog.onCancel = this._dialogOnCancelBak;
			}
		}
	},
	
	disableNoBtn: function(disable)
	{
		this._disableBtn(this.noBtn, disable);
	},
	
	showOkBtn: function(show)
	{
		if(show === true)
		{
			dojo.style(this.okBtn.domNode, {"display":""});
		}
		else
		{
			dojo.style(this.okBtn.domNode, {"display":"none"});
		}		
	},
	
	showCancelBtn: function(show)
	{
		if(show === true)
		{
			dojo.style(this.cancelBtn.domNode, {"display":""});
		}
		else
		{
			dojo.style(this.cancelBtn.domNode, {"display":"none"});
		}		
	},
	
	showNoBtn: function(show)
	{
		if(show === true)
		{
			dojo.style(this.noBtn.domNode, {"display":""});
		}
		else
		{
			dojo.style(this.noBtn.domNode, {"display":"none"});
		}		
	},
	
	showProcessImg: function()
	{
		this.procContainer.style.display = 'block';
	},
	
	hideProcessImg: function()
	{
		this.procContainer.style.display = 'none';
	},
	
	/**
	 * used by inherit class, to set label etc. 
	 */
	getOkBtn: function()
	{
		return this.okBtn;
	},
	
	/**
	 * used by inherit class, to set label etc. 
	 */	
	getCancelBtn: function()
	{
		return this.cancelBtn;
	},
	
	getNoBtn: function()
	{
		return this.okBtn;
	},
	/**
	 * used by inherit class, to insert more buttons etc. 
	 */	
	getBtnContainer: function()
	{
		return this.btnContainer;
	},
	
	returnFocus : function(){
		if( this.editorFocusback && typeof pe != 'undefined'){
			setTimeout( dojo.hitch(pe.scene,pe.scene.setFocus), 0 );
		}
	},
	getEscapeMsg : function (msg){
		if(msg){
			msg = msg.replace(/</g, "&lt; ").replace(/>/g, "&gt; ");
			msg = msg.replace(/&lt;\s*br\s*\/\s*&gt;/gi,"<br />");  			
		}
		return msg;
	},
        
	setWarningMsg: function (msg) {
		if (msg == undefined ) return;

		// unique warning message ID in concord system
		var msgId = this.warnMsgID + this.dialogId;
		var msgNode = dojo.byId(msgId);
		dijit.setWaiRole(msgNode,'alert');
		msgNode.innerHTML = this.getEscapeMsg(msg);
		if (msg == "") {
			this.hideWarnMsg = true;
			dojo.removeAttr(msgNode,'role');
		}
		else this.hideWarnMsg = false;
	},
	
	setWarningIcon: function(id, enable) {
		if (id == undefined) return;
		
		var iconNode = dojo.byId(id);
		
		if (iconNode) {
			if (enable) {
				iconNode.style.display = 'block';
			} else {
				iconNode.style.display = 'none';
			}
		}
	},
	
	reset: function () {
		// Overridden
	},
	
	_reset: function () {
		this.setWarningMsg("");		
		this.reset();
	},
	
	show: function () {
		this.dbc_lock = false;
		if (this.dialog == null) return;
	
		this._reset();		
		

		//dojo1.6.1 upgrade : now the initial length of _dialogStack is 1, not 0.
		//In this situation: more than one dialog popped up and stacked.
		//dojo will manage the focus, or else returnFocus manually.
		if ((dijit.Dialog._dialogStack)&&(dijit.Dialog._dialogStack.length > 1))
		{
			this.dialog.refocus = true;
			if (this.focusHdl) 
			{
				this.dialog.disconnect(this.focusHdl);
				this.focusHdl = null;
			}
		}
		else
		{
			this.dialog.refocus = false;
			if (!this.focusHdl) 
			{
				this.focusHdl = this.dialog.connect(this.dialog, "onHide", dojo.hitch(this,this.returnFocus) );
			}
		}
		
		if(!this.closeVisible) {
	
			// override the hide function to disable ESC key
			// for more detail, refer dijit.Dialog 
			this.dialog._hide_ = this.dialog.hide;
			this.dialog.hide = function() {
				// do nothing
			};
		}
		
		if(typeof pe != "undefined" && pe != null && pe.scene)
			this.onShow(pe.scene.getEditor());

		return this.dialog.show();
	},
	onShow:function(editor){
		
	},
	hide: function () {
		if (this.dialog == null) return;
		
		if ( window.g_presentationMode ){
			pe.scene.restoreOnSelectStart();
		}
		if (this.dialog._hide_){
			this.dialog.hide = this.dialog._hide_;
		}
		return this.dialog.hide();
	},
	
	onKeyPress: function (e) {
		//you can only reliably get character codes in the keypress event
		e = e || window.event;
		var key = (e.keyCode ? e.keyCode : e.which);
		if(key == 115 && (e.ctrlKey || e.metaKey)){
			if (e.preventDefault) 
				e.preventDefault();
			return;
		}	
        	
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		if (e.keyCode == dojo.keys.ENTER)
			this._onOk(this.editor);
		else {
			if (!this.hideWarnMsg) this.setWarningMsg("");
		}
	},

	onNo: function (editor) {
		// Overridden
		return true;
	},

	_onNo: function (editor) {
		if (this.onNo(editor) == false) {
			// error handling here
			return;
		}
		
		this.hide();
	},

	onOk: function (editor) {
		// Overridden
		return true;
	},
	
	_onOk: function (editor) {
		//defect 46959, prevent double click 
		if (this.dbc_lock)
		{
			return;
		}else{
			this.dbc_lock = true;
		}
		
		if (this.onOk(editor) == false) {
			// error handling here
			//release this lock as the dialog is not hidden
			this.dbc_lock = false;
			return;
		}
		
		this.hide();
	},
	
	onCancel: function (editor) {
		// Overridden 
		return true;
	},
	
	_onCancel: function (editor) {
		if (this.onCancel(editor) == false) {
			// error handling here
			return;
		}
		
		this.hide();
	},
	
	calcWidth: function() {
		return "400px";//set dialog width as 400 pixels by default.
	},
	
	_clearAll: function()
	{
		var dialog = this.dialog, progress = dialog._fadeOutDeferred;
		if(!progress || progress.isResolved())
		{
			dialog.destroyRecursive();
		}
		else
			progress.then(dojo.hitch(dialog, dialog.destroyRecursive, false));
		delete this.dialog;
		this.dialog = null;
		this.focusHdl = null; //focusHdl[0] will refer to DOM node, here to break circular reference in IE
	},
	
	_destroy: function()
	{
		if (this.dialog!=null)
		{
			//call hide to remove the dialog from the dialog stack
			//if the dialog is already hidden, nothing will be done.
			//this is necessary. Don't remove the following line.
			this.dialog.hide();	
			// onHide does not called in hide() because the dialog is destroyed immediatelly. call onHide explicitly to return focus correctly.
			this.dialog.onHide();
			this._clearAll(); 
			// need call dialog's destroyRecursive() immediately after hide() for dojo 1.6
			// search 5285758 "dojo dijit.Dialog destroy underlay error" for details
		}
	}
});
