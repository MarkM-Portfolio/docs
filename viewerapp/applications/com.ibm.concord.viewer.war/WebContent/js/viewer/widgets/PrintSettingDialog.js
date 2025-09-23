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
dojo.provide("viewer.widgets.PrintSettingDialog");
dojo.require("viewer.widgets.MessageBox");

dojo.declare("viewer.widgets.PrintSettingDialog", [viewer.widgets.MessageBox],{
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	constructor: function(){
		this.inherited( arguments );
	},
	/**
	 * override commonDialog.fillMsgs
	 */
	fillMsgs: function(msgsDiv) {
		dojo.addClass (msgsDiv, "viewerDialogBold");
		var message = this.params.message;
		var msg1 = message.msg1;
		var msg2 = message.msg2;
		var configs = message.configs;
		this._addLine(msgsDiv, msg1);
		this._addEmptyLine(msgsDiv);
		for (var i in configs)
			this._addIndentLine(msgsDiv, configs[i]);
		this._addEmptyLine(msgsDiv);
		this._addLine(msgsDiv, msg2);
	},
	
	_addLine: function(msgsDiv, text) {
		var messageDiv = dojo.create('div', null, msgsDiv);
		var textNode = document.createTextNode( text );
		messageDiv.appendChild(textNode);
		messageDiv.style.cssText = "display:inline-block";
		if( messageDiv.clientWidth > 400 )
			messageDiv.style.cssText = "width:400px;word-wrap:break-word";
		else
			messageDiv.style.cssText = "";
		return messageDiv;
	},

	_addEmptyLine: function(msgsDiv, text){
		return this._addLine(msgsDiv, '\u00a0');
	},
	
	_addIndentLine: function(msgsDiv, text, indentNum){
		if (!indentNum)
			indentNum = 1;
		if (dojo.isArray(text)){
			for (var i in text)
				this._addIndentLine(msgsDiv, text[i], indentNum+1);			
		}
		else{
			var messageDiv = this._addLine(msgsDiv, text);
			dojo.style(messageDiv, 'marginLeft', (indentNum * 20) + 'px');
		}
	},
	
	onOk: function (object) {
		setTimeout(dojo.hitch(this, function(){
			if( this.params.callback )
				this.params.callback(object);
		}), this.dialog.duration + 200);

	}
	
});