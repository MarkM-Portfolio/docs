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

dojo.provide("websheet.dialog.newName");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("concord.widgets.CommonDialog");
dojo.requireLocalization("websheet.dialog","newName");
dojo.require("concord.util.BidiUtils");

dojo.declare("websheet.dialog.newName", [concord.widgets.CommonDialog], {
	inputText: "",
	nameText:"",
	nameHdl:null,
	
	referHelp:null,
	
	nameBox: null,
	inputBox: null,
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	constructor: function (object, title, oklabel, visible, refValue) {		
        this.inputText = refValue;
        this.inherited( arguments );
	},
	
	createContent: function (contentDiv) {
        this.nameHdl = this.editor.getNameRangeHdl();
		var nls = dojo.i18n.getLocalization("websheet.dialog","newName");
		var namePane = dojo.create('div', null, contentDiv);		
		var nameLabel = dojo.create('label', null, namePane);
		nameLabel.appendChild(document.createTextNode(nls.LABEL_NAME));
		dojo.attr(nameLabel,'for',this.dialogId+"Name");	
		dojo.addClass(namePane,"namesListLabel");
		
		var nameInput = dojo.create('div', null, contentDiv);
		var inputBox = new dijit.form.TextBox({value:this.nameText, intermediateChanges:true, id:this.dialogId+"Name", style:{'width': '375px'},onChange: dojo.hitch(this,"_onNameChange", this.nameHdl)});

		if (BidiUtils.getTextDir() != "")
			dojo.attr(inputBox.focusNode, "dir",BidiUtils.getTextDir());
		if (dojo.attr(inputBox.focusNode, "dir") == "contextual")
				    dojo.connect(inputBox.focusNode, 'onkeyup', dojo.hitch(this, function(){
				    	this.nameBox.focusNode.dir = BidiUtils.calculateDirForContextual(this.nameBox.focusNode.value);
			    }));

		dojo.connect(inputBox.textbox, "onkeypress", dojo.hitch(this, this.onKeyPress));
		dojo.connect(inputBox.textbox, "onkeypress", function(){
			dijit.setWaiState(this, "invalid", false);
		});
		dojo.addClass (inputBox.domNode, "namesInputBox");//how to set its width
		nameInput.appendChild(inputBox.domNode);
		dijit.setWaiState(dojo.byId(this.dialogId+"Name"), "required", true);
		this.nameBox = inputBox;
		
		var referlabel = dojo.create('div', null, contentDiv);
	
		var referText = dojo.create('label', null, referlabel);
		referText.appendChild(document.createTextNode(nls.LABEL_REFERSTO));
		dojo.attr(referText,'for',this.dialogId+"Input");
		
		dojo.addClass(referlabel,"namesListLabel");
		dojo.addClass(referlabel,"referLabel");
		
		var inputDiv = dojo.create('div', null, contentDiv);
		var inputBox = new dijit.form.TextBox({value:this.inputText, intermediateChanges:true, id:this.dialogId+"Input",style:{'width': '375px'}, onChange: dojo.hitch(this,"_onRefChange", this.nameHdl)});
		dojo.connect(inputBox.textbox, "onkeypress", dojo.hitch(this, this.onKeyPress));
		dojo.connect(inputBox.textbox, "onkeypress", function(){
			dijit.setWaiState(this, "invalid", false);
		});
		dojo.addClass (inputBox.domNode, "namesInputBox");//how to set its width
		inputDiv.appendChild(inputBox.domNode);
		dijit.setWaiState(dojo.byId(this.dialogId+"Input"), "required", true);
		this.inputBox = inputBox;	
		
		var referHelp = dojo.create('div', null, contentDiv);
		var helpText = document.createTextNode(nls.REFERS_HELP);
		referHelp.appendChild(helpText);	
		this.referHelp = referHelp;
	},
	postCreate: function()
	{
		var msgId = this.warnMsgID + this.dialogId;
		dojo.addClass(dojo.byId(msgId),"helpLabel");
	},
	_onRefChange:function(){
		this.inputText = this.inputBox.get("value");
		this.nameHdl.onRefChange(this.inputText);
		this._reset();
	},
	_onNameChange: function(){
		this._reset();
	},
	updateAddress: function(address){
		this.inputText = address;
		this.inputBox.set("value",address);
		this._reset();
	},
	setWarningMsg: function (msg) 
	{
	    if (msg == undefined ) 
	        return;
        var msgId = this.warnMsgID + this.dialogId;
        var msgDiv = dojo.byId(msgId);
        dijit.setWaiRole(msgDiv,'alert');
	    if (msg == "")
	    {
	        msgDiv.innerHTML = "";
	        this.hideWarnMsg = true;
	        dojo.removeAttr(msgDiv,'role');
	    }
        else
        {
            var msgList = msg.split("<br>");
            for(var i=0;i<msgList.length;i++)
            {
                var item = this.getEscapeMsg(msgList[i]);
                if(item.length>0)
                    dojo.create('p', {innerHTML:item}, msgDiv);
            }
            this.hideWarnMsg = false; 
        }
		if(this.hideWarnMsg)
			this.referHelp.style.display = '';
		else
			this.referHelp.style.display = 'none';
	},
	
	onOk: function (editor)
	{				
		this.setWarningMsg("");
		var nls = dojo.i18n.getLocalization("websheet.dialog","newName");
		var name = dojo.trim(this.nameBox.get("value"));

		if(this.nameHdl.isRangeExist(name))
		{
			this.setWarningMsg(nls.LABEL_EXISTEDNAME);
			dijit.setWaiState(this.nameBox.textbox, "invalid", true);
			return false;
		}

		var result = websheet.Helper.isValidName(name);
		if(result){
			if(result == websheet.Constant.NameValidationResult.INVALID_EMPTY){
				dijit.setWaiState(this.nameBox.textbox, "invalid", true);
				this.setWarningMsg(nls.LABEL_EMPTYNAME);
			}else if(result == websheet.Constant.NameValidationResult.INVALID_RC){
				this.setWarningMsg(nls.LABEL_RCNAME);
				dijit.setWaiState(this.nameBox.textbox, "invalid", true);
			}else if(result == websheet.Constant.NameValidationResult.INVALID_KEYWORDS){
				var msg = dojo.string.substitute(nls.LABEL_KEYWORDS,[name.toLocaleLowerCase()]);
				this.setWarningMsg(msg);
				dijit.setWaiState(this.nameBox.textbox, "invalid", true);
			}else{
				this.setWarningMsg(nls.LABEL_INVALIDNAME);
		    	dijit.setWaiState(this.nameBox.textbox, "invalid", true);
			}
			return false;
		}

		var tmp = name.toLocaleLowerCase();
		var numFmt = websheet.i18n.Number;
		var locTrue = numFmt.formatBoolean(1);
		var locFalse = numFmt.formatBoolean(0);
		if(tmp == locTrue.toLocaleLowerCase() || tmp == locFalse.toLocaleLowerCase()){
			var msg = dojo.string.substitute(nls.LABEL_KEYWORDS,[tmp]);
			this.setWarningMsg(msg);
			dijit.setWaiState(this.nameBox.textbox, "invalid", true);
			return false;
		}
		
	    dijit.setWaiState(this.nameBox.textbox, "invalid", false);
	    
	    var refValue = dojo.trim(this.inputBox.get("value"));
	    if(!refValue){	    	
	    	this.setWarningMsg(nls.LABEL_EMPTYREF);
	    	dijit.setWaiState(this.inputBox.textbox, "invalid", true);
			return false;
	    }
	    var isValidRef = this.nameHdl._addressSerialize(refValue);
	    if(!isValidRef){
	    	this.setWarningMsg( nls.LABEL_INVALIDADDRESS );
	    	dijit.setWaiState(this.inputBox.textbox, "invalid", true);
			return false;
	    }
	   var newRange = this.nameHdl.insertNameRange(name);
	   this._preClose(newRange);
	},
	
	onKeyPress: function(e) {
		var dk = dojo.keys;
		if (document.activeElement == this.inputBox.focusNode)
		{
			var key = e.keyCode;
			if (key == 0 && e.charOrCode == " " && (e.shiftKey || e.ctrlKey || e.metaKey))
			{
				key = dk.SPACE;
			}
			switch(key)
			{
				case dk.LEFT_ARROW:
				case dk.RIGHT_ARROW:
				case dk.UP_ARROW:
				case dk.DOWN_ARROW:
				case dk.PAGE_UP:
				case dk.SPACE:
				case dk.PAGE_DOWN:
					if(e.keyChar == "" || (e.charOrCode == " " && e.shiftKey || e.ctrlKey || e.metaKey))
					{
						var grid = this.editor.getCurrentGrid();
						grid.selection.moveRangePicker(e);
						this.nameHdl._addressSerialize();
						this.nameHdl.highLightAddr(this.nameHdl.currAddress);
						dojo.stopEvent(e);
						return;
					}
				default:
					break;
			}
		}
		this.inherited(arguments);
	},
	
	setDialogID: function() {
		this.dialogId = "S_d_newName";
	},	
	
	show: function () {
		if (!this.modal_wrapper) {
			dijit.DialogUnderlay.show();
			dijit.DialogUnderlay.hide();
			var self = this;
			self.modal_wrapper = dojo.aspect.after(dijit._underlay, "layout", function () {
				if (self.dialog.open) {
					dijit._underlay.domNode.style.display = 'none';
				}
			});
		}
		dojo.publish("RangePickingStart", [{grid : this.editor.getCurrentGrid()}]);
		this.inherited(arguments);
	},
	
	hide: function () {
	},
	
	_preClose: function(newRange){
		if (this.modal_wrapper) {
			this.modal_wrapper.remove();
			this.modal_wrapper = null;
		}
		this.dialog.hide();
		setTimeout(dojo.hitch(this, this._clearAll), this.dialog.duration+200);
		var grid = this.editor.getCurrentGrid();
		var picker = grid.selection.picker();
		if (picker && picker.isShow()) {
			picker.hide();
		}
		dojo.publish("RangePickingComplete", [{grid : grid}]);
		this.nameHdl.closeNewDlg(newRange);
		this.editor.setFocusFlag(true);
		if(!this.nameHdl.isDlgShow){			
			this.editor.focus2Grid();
		}
	},
	onCancel: function (editor) {	
		 this._preClose();
	}
});	