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

dojo.provide("concord.widgets.LoginDialog");
dojo.require("concord.widgets.CommonDialog");
dojo.requireLocalization("concord.scenes", "LoginScene");

dojo.declare("concord.widgets.LoginDialog", [concord.widgets.CommonDialog], {
	inputText: "",
	pwdText: "",
	auth_cllbk: null,
	retry_cllbk: null,
	auth_times: 1,

	nls: null,
	msgDiv: null,

	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function(object, title, oklabel, visible, params) {
		visible = true;
		this.inputText = params.defvalue;
		this.auth_cllbk = params.auth_callback;
		this.retry_cllbk = params.retry_callback;
		this.auth_times = params.auth_times;
		this.nls = dojo.i18n.getLocalization("concord.scenes", "LoginScene");
		this.inherited( arguments );
	},

	createContent: function (contentDiv) {
		this.inherited( arguments );
		var inputDiv = dojo.create('div', null, contentDiv);

		this.msgDiv = dojo.create('div', { style: { "width": "400px", "word-wrap": "break-word" }}, inputDiv);
		dojo.addClass(this.msgDiv, "lotusFormError");
		var msgNode = document.createTextNode(this.nls.login_session_timeout);
		this.msgDiv.appendChild(msgNode);

		var userP = dojo.create('p', null, inputDiv);
		dojo.addClass(userP, "lotusFormField");

		var usernameText = document.createTextNode(this.nls.login_label_username);
		userP.appendChild(usernameText);

		var userP1 = dojo.create('p', null, inputDiv);
		var inputBox = new dijit.form.TextBox({value:this.inputText, intermediateChanges:true, id:this.dialogId+"InputArea"});
		dojo.connect(inputBox.textbox, "onkeypress", dojo.hitch(this, this.onKeyPress));
		dojo.connect(inputBox, "onChange", dojo.hitch( this, function(){this.inputText = inputBox.attr("value");}));
		dojo.addClass (inputBox.domNode, "lotusText");
		userP1.appendChild(inputBox.domNode);
		inputBox.attr("onFocus", function() { inputBox.focusNode.select(); });

		var pwdP = dojo.create('p', null, inputDiv);
		dojo.addClass(pwdP, "lotusFormField");
		
		var pwdText = document.createTextNode(this.nls.login_label_password);
		pwdP.appendChild(pwdText);

		var pwdP1 = dojo.create('p', null, inputDiv);
		var pwdBox = new dijit.form.TextBox({value:this.pwdText, intermediateChanges:true, id:this.dialogId+"PwdInputArea", type:"password"});
		dojo.connect(pwdBox.textbox, "onkeypress", dojo.hitch(this, this.onKeyPress));
		dojo.connect(pwdBox, "onChange", dojo.hitch( this, function(){this.pwdText = pwdBox.attr("value");}));
		dojo.addClass (pwdBox.domNode, "lotusText");
		pwdP1.appendChild(pwdBox.domNode);
	},

	onOk: function (editor) {
		var passed = this.auth_cllbk(this.inputText, this.pwdText);
		this.auth_times--;

		if (passed)
		{
			this.msgDiv.innerHTML = "";
			this.retry_cllbk();
			return true;
		}
		else
		{
			if (this.auth_times > 0)
			{
				this.msgDiv.innerHTML = this.nls.login_error;
				return false;
			}
			else
			{
				this.msgDiv.innerHTML = this.nls.login_error;
				this.retry_cllbk();
				return true;
			}
		}
	},

	onCancel: function (editor) {
		this.retry_cllbk();
		return true;
	}
});
