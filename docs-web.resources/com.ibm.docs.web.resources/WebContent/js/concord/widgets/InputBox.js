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

dojo.provide("concord.widgets.InputBox");
dojo.require("concord.widgets.CommonDialog");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.CheckBox");
dojo.require("concord.util.uri");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.util","dialogs");

dojo.declare("concord.widgets.InputBox", [concord.widgets.CommonDialog], {
	inputText: "",
	externalShareID: "S_d_externalShare",	
	showExternal: false,
	
	constructor: function(object, title, oklabel, visible, params ) {
		visible = true;
		this.inputText = params.defvalue;
		params.msgsDivStyle = "width:24em;word-wrap:break-word";
		this.showExternal = params.showExternal;
		this.isBidiBTDDisabled = !BidiUtils.isBidiOn() || (BidiUtils.isBidiOn() && params.disableBTD);
		this.inherited( arguments );
	},
	createContent: function (contentDiv) {
		this.inherited( arguments );
		var inputDiv = dojo.create('div', null, contentDiv);
		var inputBox = new dijit.form.TextBox({value:this.inputText, intermediateChanges:true, id:this.dialogId+"InputArea", title: this.titleMsg ? this.titleMsg:''});
		this.inputBox = inputBox;
		if (!this.isBidiBTDDisabled){
			dojo.attr(this.inputBox.focusNode, "dir",BidiUtils.getTextDir());
			if (dojo.attr(this.inputBox.focusNode, "dir") == "contextual") {
				var calculatedDir = BidiUtils.calculateDirForContextual(this.inputText);
				if (calculatedDir != "")
					dojo.attr(this.inputBox.focusNode, "dir",calculatedDir);
				else
					dojo.removeAttr(this.inputBox.focusNode, "dir");
				dojo.connect(this.inputBox.focusNode, 'onkeyup', dojo.hitch(this, function(){
					var bidiDir = BidiUtils.calculateDirForContextual(this.inputBox.focusNode.value);
					if (bidiDir != "")
						dojo.attr(this.inputBox.focusNode, "dir", bidiDir);
				}));
				
			}
		}
		dijit.setWaiState(inputBox.textbox,'required','true');
		dojo.connect(inputBox.textbox, "onkeypress", dojo.hitch(this, this.onKeyPress));
		dojo.connect(inputBox, "onChange", dojo.hitch( this, function(){
			this.inputText = inputBox.attr("value");
			if(this.inputBox.focusNode)
				dijit.setWaiState(this.inputBox.focusNode, "invalid", false);
			}));
		dojo.addClass (inputBox.domNode, "inputBox");
		inputDiv.appendChild(inputBox.domNode);
		inputBox.attr("onFocus", function() { 
			setTimeout(inputBox.focusNode.select()) });
		if(this.showExternal && "lcfiles" == DOC_SCENE.repository){
			var showFlag = true;
			var isExternal = false;
			var isCheckedDefault = false;
			var url = concord.util.uri.getFilesPeopleUri();
			var response, ioArgs;
			var callback = function(r, io) {response = r; ioArgs = io;};			
			dojo.xhrGet({
				url: url,
				timeout: 5000,
				handleAs: "json",
				handle: callback,
				sync: true,
				preventCache: true,
				noStatus: true
			});				
			if (response instanceof Error) {
				showFlag = false; //Don't display 'Share externally' option
			}				
			if (response){
				var items = response.items;
				if(items && items[0]){
					try{		
						isExternal = items[0].isExternal;
						if(!items[0].policy.capabilities.canCreate.files.external){
							showFlag = false;
						}
						if(items[0].policy.isExternalDefault){
							isCheckedDefault = true;
						}
					}catch(e){
						showFlag = false;
					}
				}
			}
			
			if(showFlag){				
				var externalDiv = dojo.create('div', null, contentDiv);
				dojo.addClass(externalDiv,"externalDiv");
				var objchecked = isCheckedDefault;
				var objdisabled = false;
				if(isExternal){
					objchecked = true;
					objdisabled = true;
				}
				this.createSelect(externalDiv, "externalShare", this.externalShareID, null, objchecked, objdisabled);
				var nls = dojo.i18n.getLocalization("concord.util","dialogs");	
				this.createDivLabel(externalDiv, nls.externalLabelMsg);
				var checkNode = dojo.byId(this.externalShareID);
				dijit.setWaiState(checkNode, 'label', nls.externalLabelMsg);		
			}
		}
	},
	
	createSelect: function(parentNode,objname,objid,objvalue,objchecked, objdisabled){
		var attr ={name : objname, id : objid};
		if( objvalue )
			attr.value = objvalue;
		if( objchecked )
			attr.checked = objchecked;
		if( objdisabled )
			attr.disabled = objdisabled;
	 	var ret = new dijit.form.CheckBox(attr);	 		
		parentNode.appendChild(ret.domNode);
		dojo.addClass(ret.domNode,"externalCheckbox");		
	 	return ret.domNode;
	},
	
	createDivLabel: function(parentNode,textValue){
		var temp=dojo.create('label',null,parentNode);
		temp.appendChild(dojo.doc.createTextNode(textValue));
		return temp;
	},
		
	setWarningMsg: function(msg) {
		// unique warning message ID in concord system
		var msgId = this.warnMsgID + this.dialogId;
		var msgDiv = dojo.byId(msgId);
		if (msgDiv)
		{
			msgDiv.style.cssText = "width:24em;word-wrap:break-word";
		}
		
		this.inherited( arguments );
	},	
	onOk: function (editor) {
		if( this.params.validator )
		{
			var errMsg = this.params.validator(editor, this.inputText);
			if( errMsg )
			{
				this.setWarningMsg( errMsg );
				dijit.setWaiState(this.inputBox.focusNode, "invalid", true);
				return false;
			}
		}
		if( this.params.callback )
		{
			var externalNode = dijit.byId(this.externalShareID);
			var isExternal = false;
			if(externalNode){
				isExternal = externalNode.checked;
			}			
			this.params.callback(editor, this.inputText, isExternal);
		}
		dijit.setWaiState(this.inputBox.focusNode, "invalid", false);
		return true;
	}, 
	
	onCancel: function(editor) {
		if( this.params.cancelCallback )
			this.params.cancelCallback(editor);
			
		return true;
	}
});
