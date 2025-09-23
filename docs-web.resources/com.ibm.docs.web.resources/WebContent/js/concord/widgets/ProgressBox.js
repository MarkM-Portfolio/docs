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

dojo.provide("concord.widgets.ProgressBox");
dojo.require("concord.widgets.CommonDialog");

dojo.declare("concord.widgets.ProgressBox", [concord.widgets.CommonDialog], {
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function(object, title, oklabel, visible, params) {
		visible = false;
		this.okVisible = false;
		this.closeVisible = false;
		this.inherited( arguments );
	},
	
	/**
	 * override commonDialog.fillMsgs
	 */
	fillMsgs: function(msgsDiv) {
		var msg = this.params.message;
		if(msg.subTitle) {
			var messageDiv = this._addLine(msgsDiv, msg.subTitle);
			dojo.addClass (messageDiv, "progressDialogLoading");
			
			var msg_lines;
			msg_lines = msg.content.split("\n");
			for(var i in msg_lines) {
				this._addLine(msgsDiv, msg_lines[i]);
			}
		} else {
			this.inherited( arguments );
		}
	},
	
	_addLine: function(msgsDiv, text) {
		var messageDiv = dojo.create('div', null, msgsDiv);
		var textNode = document.createTextNode( text );
		messageDiv.appendChild(textNode);
		messageDiv.style.cssText = "display:inline-block";
		if( messageDiv.clientWidth > 600 )
			messageDiv.style.cssText = "width:600px;word-wrap:break-word";
		else
			messageDiv.style.cssText = "";
		return messageDiv;
	}
});
