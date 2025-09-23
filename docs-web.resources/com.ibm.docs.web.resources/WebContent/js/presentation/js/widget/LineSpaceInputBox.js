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

dojo.provide("pres.widget.LineSpaceInputBox");
dojo.require("concord.widgets.CommonDialog");
dojo.require("dijit.form.TextBox");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("pres", "pres");

dojo.declare("pres.widget.LineSpaceInputBox", [concord.widgets.CommonDialog], {
	inputText: "",
	noticeStrs : null,
	originalValue : "",

	constructor: function(object, title, oklabel, visible, params )
	{
		this.noticeStrs = dojo.i18n.getLocalization("pres", "pres");
		this.inputText = params.defvalue;
		this.originalValue = params.defvalue;
		params.msgsDivStyle = "font-weight:bold;width:23em;height:30px";
		params.message = this.noticeStrs.linespacenoticeContent;
		this.inherited( arguments );
	},
	
	validator : function(valueTobeValidated)
	{
		var warningStr = dojo.i18n.getLocalization("pres", "pres");
		if(isNaN(valueTobeValidated) || parseFloat(valueTobeValidated)<0 || parseFloat(valueTobeValidated)>10)
		{
			this.setWarningMsg(warningStr.lineSpaceWarning);
			this.inputText = this.originalValue;
			return false;
		}
		else if(valueTobeValidated === undefined || valueTobeValidated === "" || valueTobeValidated === null )
		{
			this.setWarningMsg(" ");
			this.inputText = valueTobeValidated;
			return false;	
		}else{
			this.setWarningMsg(" ");
			this.inputText = valueTobeValidated;
			return true;	
		}
	},	
	
	createDialog: function () {
		var doc = dojo.doc;
		var dialogDiv = dojo.create('div', null, doc.body);
	    var contentDiv = dojo.create('div', null, dialogDiv);
	    var footerDiv = dojo.create('div', null, dialogDiv);
	    dojo.attr(contentDiv, "id", this.contentDivID + (new Date()).getTime());
		this.createContent (contentDiv);		
		dojo.addClass(dialogDiv, "dijitDialogPaneContent");
		dojo.addClass(contentDiv, "dijitDialogPaneContentArea");
		dojo.addClass(footerDiv, "dijitDialogPaneActionBar");
		
		var param1 = {label: this.oKLabel, title: this.oKLabel, id: this.OKButtonID,onClick: dojo.hitch(this, "_onOk", this.editor)};;
		var param2 = {label: this.cancelLabel, title: this.cancelLabel, id: this.CancelButtonID,onClick: dojo.hitch(this, "_onCancel", this.editor)};
		var button1 = new concord.widgets.LotusTextButton(param1);
		var button2 = new concord.widgets.LotusTextButton(param2);
		footerDiv.appendChild(button1.domNode);
		footerDiv.appendChild(button2.domNode); 		
		this.okBtn = button1;
		this.cancelBtn = button2;
		this.btnContainer = footerDiv;
		var dirAttr = BidiUtils.isGuiRtl() ? 'rtl' : '';
		var dg = new dijit.Dialog({dir: dirAttr, title: this.concordTitle, id: this.dialogId, refocus : false}, dialogDiv);			
		if(this.originalValue == "" || this.originalValue == null || this.originalValue == undefined)
		{
			this.disableOkBtn(true);
		}		
		dg.connect(dg, "onCancel",dojo.hitch(this, "_onCancel", this.editor));
		return dg;
	},
	
	createContent: function (contentDiv) 
	{
		this.inherited( arguments );
		this.concordTitle = this.noticeStrs.linespaceboxTitle;
		dojo.style(contentDiv,{height:'60px'});
		var inputDiv = dojo.create('div', {'style':{'position': 'relative','left':'5px'}}, contentDiv);
		var lineTitleContent = this.noticeStrs.linespacelineTitle;
		var floatVal = (BidiUtils.isGuiRtl()) ? 'right' : 'left';
		var spanDiv=dojo.create('div', {'style':{'float':floatVal,'width':'122px'}}, inputDiv);
	    dojo.create('span',{innerHTML:lineTitleContent},spanDiv);

		var inputValue = this.inputText;
		if (BidiUtils.isArabicLocale())
			inputValue = BidiUtils.convertArabicToHindi(inputValue + "");

		var inputBox = new dijit.form.TextBox({value:inputValue, intermediateChanges:true, id:this.dialogId+"InputArea"});
		this.inputBox = inputBox;
		dojo.connect(inputBox.textbox, "onkeypress" , dojo.hitch(this, function( e ){
			e = e || window.event;
			if(e.keyCode == dojo.keys.ENTER&&!(this.okBtn.attr('disabled')))
			{
				this._onOk();
			}
		}));		
		dojo.connect(inputBox, "onChange", dojo.hitch( this, function(){
			var tempValue = inputBox.attr("value");
			if (BidiUtils.isArabicLocale()) {
				tempValue = BidiUtils.convertHindiToArabic(tempValue + "");
				inputBox.set("value", BidiUtils.convertArabicToHindi(tempValue + ""));
			}
			this.disableOkBtn(!(this.validator(tempValue)));
			if(this.inputBox.focusNode)
				dijit.setWaiState(this.inputBox.focusNode, "invalid", false);
			}));		
		dojo.addClass(inputBox.domNode, "inputBox");
		dojo.style(inputBox.domNode,{height:'1.5em',width:'80px'});	
		inputDiv.appendChild(inputBox.domNode);

		var warningDiv = dojo.create('div',null, contentDiv);
		var blankdiv=dojo.create('div',null,warningDiv);
	    dojo.style(blankdiv,{'float':'left','width':'127px','height':'1px'});
		var warnMsgDiv = dojo.create('div', null, warningDiv);
	    dojo.attr(warnMsgDiv, "id", this.warnMsgID + this.dialogId);
		dojo.addClass (warnMsgDiv, "concordDialogWarningMsg");
		warnMsgDiv.style.cssText = "float:left;width:auto;";
		inputBox.attr("onFocus", function() { 
			inputBox.focusNode.select(); 			
		});
	},
	
	onOk: function () {
		if( this.params.callback)
		{	
			this.params.callback(this.inputText);
		}
		dijit.setWaiState(this.inputBox.focusNode, "invalid", false);
		return true;
	},
	
	onCancel:function(){
		if( this.params.callback)
		{	
			this.params.callback(this.originalValue);
		}		
	}
});
