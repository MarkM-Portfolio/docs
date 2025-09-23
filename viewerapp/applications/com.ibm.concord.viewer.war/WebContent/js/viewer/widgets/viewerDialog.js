/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.widgets.viewerDialog");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.require("dojo.i18n");
dojo.require("dijit.form.Form");
dojo.require("viewer.widgets.LotusTextButton");
dojo.require("dojo.string");
dojo.requireLocalization("viewer.widgets","viewerDialog");
dojo.declare("viewer.widgets.viewerDialog", null, {
	params: null,
	warnMsgID: "ViewerWarnMsg",
	contentDivID: "ViewerContent",
	dialogId: "viewerDialogId",
	cancelLabel: null, 
	dialog: null,
	editor: null,
	OKButtonID: "OKButton",
	CancelButtonID: "CancelButton",
	NoButtonID: "NoButton",
	focusHdl: null,
	okBtn: null,
	cancelBtn: null,
	btnContainer: null,
	describedInfoID:null,
	//defect 46959, lock for double click event
	dbc_lock: null,
	// customizable
	viewerTitle: null,
	oKLabel: null,
       	noLabel: null,	
	visible: true, // make Cancel button visible?
	okVisible: true, // make Ok button visible?
	noVisible: false, // make No button visible?
	closeVisible: true, // make close button visible?
	timeout: 0,  // if dialog isn't created from menu item, the timeout should be set
	hideWarnMsg: false,
	formParams: null,
	
	constructor: function(object, title, oklabel, visible, params, formParams) {
		this.dbc_lock = false;
		var nls = dojo.i18n.getLocalization("viewer.widgets","viewerDialog");
		this.viewerTitle = dojo.string.substitute(nls.productName, { 'productName' : window.g_prodName });
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
		this.editor = object;

		if ( title )
		{
			var title_id = title.split("#");
			this.viewerTitle = title_id[0];
			this.dialogId = title_id[1] || this.viewerTitle;
		}
		else
		{
			this.dialogId = this.viewerTitle;
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
		
		this.createContent (contentDiv);
		
		dojo.attr(contentDiv, "id", this.contentDivID + (new Date()).getTime());
		var warnMsgDiv = dojo.create('div', null, contentDiv);
		var msgLabel = dojo.create('label', null, warnMsgDiv);
		dojo.attr(warnMsgDiv, "id", this.warnMsgID + this.dialogId);
		dojo.addClass (warnMsgDiv, "viewerDialogWarningMsg");

		dojo.addClass(dialogDiv, "dijitDialogPaneContent");
		dojo.addClass(contentDiv, "dijitDialogPaneContentArea");
		
		
		
		this._genButtonID();

		var button1 = new viewer.widgets.LotusTextButton({label: this.oKLabel, id: this.OKButtonID, onClick: dojo.hitch(this, "_onOk", this.editor)});
		var button3 = new viewer.widgets.LotusTextButton({label: this.noLabel, id: this.NoButtonID, onClick: dojo.hitch(this, "_onNo", this.editor)});
		var button2 = new viewer.widgets.LotusTextButton({label: this.cancelLabel, id: this.CancelButtonID, onClick: dojo.hitch(this, "_onCancel", this.editor)});

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
		
		if (!this.okVisible && !this.noVisible && !this.visible) // no button visible
			dojo.addClass(footerDiv, "dijitDialogPaneActionBarWithoutAction");
		else
			dojo.addClass(footerDiv, "dijitDialogPaneActionBar");			
			
		if(this.formParams){
			dojo.style(button1.domNode, 'type', 'submit');
		}
		this.okBtn = button1;
		this.cancelBtn = button2;
		this.btnContainer = footerDiv;
		
		var dg = new dijit.Dialog({title: this.viewerTitle, id: this.dialogId, refocus : false}, dialogDiv);
		if(this.describedInfoID)
			dijit.setWaiState(dg.domNode,'describedby',this.describedInfoID);
		if(!this.closeVisible) {
			dojo.style(dg.closeButtonNode, {"display":"none"});
		}

		if(this.closeVisible) {
			// disable ESC
			// dg.onCancel is triggered by ESC key
			// use Widget.connect instead of dojo.connect to disconnect automatically when destroy.
			dg.connect(dg, "onCancel",dojo.hitch(this, "_onCancel", this.editor));
		}

		return dg;
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
	
	/**
	 * used by inherit class, to insert more buttons etc. 
	 */	
	getBtnContainer: function()
	{
		return this.btnContainer;
	},
	
	_returnFocus : function(){
		if(typeof pe != 'undefined'){
			setTimeout( dojo.hitch(pe.scene,pe.scene.setFocus), 0 );
		}	
	},
	setWarningMsg: function (msg) {
		if (msg == undefined ) return;

		// unique warning message ID in viewer system
		var msgId = this.warnMsgID + this.dialogId;
		dojo.byId(msgId).innerHTML = msg;
		if (msg == "") this.hideWarnMsg = true;
		else this.hideWarnMsg = false;
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

		//In this situation: more than one dialog popped up and stacked.
		//dojo will manage the focus, or else _returnFocus manually.
		if ((dijit.Dialog._dialogStack)&&(dijit.Dialog._dialogStack.length > 0))
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
				this.focusHdl = this.dialog.connect(this.dialog, "onHide", dojo.hitch(this,this._returnFocus) );
			}
		}
		
		this.onShow();
		
		this.dialog.show();
	},
	onShow:function(){
		
	},
	
	hide: function () {
		if (this.dialog == null) return;
		
		this.dialog.hide();
	},
	
	onKeyPress: function (e) {
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
		this.dialog.destroyRecursive();
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
			
			//In this situation: more than one dialog popped up and stacked.
			//must postpone the destroyRecursive until fadeout in 'hide' finished
			//or else destroyRecursive will break fadeout and delete the underlay,
			//making the lower dialog not modal any more.
			
			//dojo1.6.1 upgrade : now the initial length of _dialogStack is 1, not 0.
			if ((dijit.Dialog._dialogStack)&&(dijit.Dialog._dialogStack.length > 1))
			{			
				setTimeout(dojo.hitch(this, this._clearAll), this.dialog.duration+200);
			}
			else
			{
				this._clearAll();
			}
		}
	}
});
