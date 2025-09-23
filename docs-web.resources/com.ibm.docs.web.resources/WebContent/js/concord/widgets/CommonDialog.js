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

dojo.provide("concord.widgets.CommonDialog");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.util.BidiUtils");
dojo.declare("concord.widgets.CommonDialog", [concord.widgets.concordDialog], {
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	titleMsg: null,	
	/**
	 * Any subclass of CommonDialog should assign a unique id to variable <code>this.describedInfoId </code> 
	 * , which is defined in concordDialog.js. Therefore, jaws is able to read the content when the dialog is open. 
	 */
	constructor: function(object, title, oklabel, visible, params) {
		//if (title) title += "#" + Math.random();
		this.inherited( arguments );
	},
	
	setDialogID: function() {
		//Set the dialog id as class name. 
		//  Because all commondialog and the inherited dialogs will be destoried when hide, 
		//  so to prevent id conflict, detect firstly, then append the dialog stack depth on the id.
		this.dialogId = "C_d_" + this.declaredClass.slice(this.declaredClass.lastIndexOf(".")+1);
		if (dojo.byId(this.dialogId))
		{
			//dojo1.6.1 upgrade : now the initial length of _dialogStack is 1, not 0.
			// to keep same id as before for automation
			this.dialogId = this.dialogId + (dijit.Dialog._dialogStack.length - 1);
		}
	},
	
	createContent: function (contentDiv) {
		dojo.addClass( contentDiv, "lotusui30_layout ");
		var content = contentDiv;
		if( this.params.imageclass )
		{
			content = dojo.create("div", null, contentDiv);
			dojo.addClass( content, " lotusErrorContent" );
			if(BidiUtils.isGuiRtl())
				dojo.attr(content, "dir", "rtl");
			
			if(this.params.errorContentStyle)
				content.style.cssText = this.params.errorContentStyle;
			
			var img = dojo.create("IMG", null, content);
			img.src = window.contextPath + window.staticRootPath + "/js/dojo/resources/blank.gif";
			dojo.addClass( img, this.params.imageclass + " lotusIcon");
			dojo.attr(img,'alt','');
		}

		var msgsDiv = dojo.create("div", null, content );
		if(this.describedInfoId)
			msgsDiv.id = this.describedInfoId;
		if( this.params.imageclass )
		{
			dojo.addClass( msgsDiv, "lotusErrorForm");
		}
		if( this.params.msgsDivStyle )
		{
			msgsDiv.style.cssText = this.params.msgsDivStyle;
		}
		
		this.fillMsgs(msgsDiv);
	},
	
	fillMsgs: function(msgsDiv) {
		var msg_lines = {};
		if( this.params.message ) msg_lines = this.params.message.split("\n");
		this.titleMsg = msg_lines[msg_lines.length-1];		
		for( var i=0; i<msg_lines.length; i++ )
		{
			var messageDiv  = dojo.create('div', null, msgsDiv);
			//for html viewer
			if(msg_lines[i].indexOf('<')!=-1 && msg_lines[i].indexOf('>')!=-1){
				messageDiv.innerHTML = msg_lines[i];
			}else{
				var textNode = document.createTextNode( msg_lines[i] );
				messageDiv.appendChild(textNode);
			}
			messageDiv.style.cssText = "display:inline-block";
			if( messageDiv.clientWidth > 400 )
				messageDiv.style.cssText = "width:400px;word-wrap:break-word";
			else
				messageDiv.style.cssText = "";
		}
		
		// append learn more here if need
		if(this.params && this.params.showLearnMore)
		{
			this.helpTopic = this.params.helpTopic;
			// TODO replace the nls later...
			dojo.requireLocalization("concord.widgets", "DraftConflictOptsDlg");
			var nlsExt = dojo.i18n.getLocalization("concord.widgets","DraftConflictOptsDlg");
			var para = dojo.create('p', {innerHTML : ""}, msgsDiv);
			var leanMore = dojo.create('span', {innerHTML : nlsExt.leanMore, 'class' : 'span-link'}, para);
	        dojo.attr(leanMore,'tabindex','0');
	        dijit.setWaiRole(leanMore,'button');		
			
			dojo.connect(leanMore, 'onclick', dojo.hitch(this, "_learnMore"));	
			dojo.connect(leanMore, 'onkeypress', dojo.hitch(this, "_onKeyPress", leanMore));
		}
	},
	
	_onKeyPress: function(btn, evt)
	{
		if(evt && evt.keyCode == dojo.keys.ENTER)
		{
			this._learnMore();
		}		
	},	
	
	_learnMore: function() 
	{
		var url = this._getHelpUrl();
		var helpWin = window.open( url, "helpWindow", "width=800, height=800" );
		helpWin.focus();			
	},
	
	_getHelpUrl: function()
	{
		return this.helpTopic;
	},	
	
	hide: function () {
		if(this.dialog._fadeInDeferred && !this.dialog._fadeInDeferred.isResolved())
		{
			this.dialog._fadeInDeferred.then(dojo.hitch(this, this._destroy));
		}
		else
		{
			this._destroy();//for common dialogs, their id are random, need to destroy every time hiding.
		}
	},
	
	calcWidth: function() {
		return "auto";
	}
});

