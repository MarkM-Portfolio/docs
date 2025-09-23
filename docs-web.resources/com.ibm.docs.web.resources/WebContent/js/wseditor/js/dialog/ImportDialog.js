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
dojo.provide("websheet.dialog.ImportDialog");
dojo.require("concord.widgets.concordDialog");
dojo.require("websheet.datasource.ImportHelper");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("websheet.dialog","ImportDialog");

(function()
		{
		var uploadTextTargetFrameId = "uploadTextTargetFrame";
		var isCancel = true;
		var textFileLoadingTimeOut = null;
dojo.declare("websheet.dialog.ImportDialog", [concord.widgets.concordDialog], {
	nls:null,
	inputFileName: null,
	inputTextBox: null,
	_uploadUrl:null,
	_isSubmit: false,
	options:null,
	isHide: false,
	importHelper: null,
	separatorDivId: null,
	filepath: null,
	constructor: function(object, title, oklabel, visible, params, formParams) {
		this._uploadUrl = params.uploadUrl;
		this.setInputBoxHidden(params.isHidden);
	},
	
	setInputBoxHidden: function(isHidden)
	{
		this.isHide = isHidden;
	},
	
	createContent: function (contentDiv) {
		this.nls = dojo.i18n.getLocalization("websheet.dialog","ImportDialog"); 
		var dlgWidth = this.calcWidth();
		dojo.style(contentDiv,"width",dlgWidth);
		var inputDiv = dojo.create('div', {"id":this.inputDivId}, contentDiv);
		var lableText = dojo.create('label', null, inputDiv);
		var text = this.nls.btnUpload;
		if(BidiUtils.isGuiRtl() && g_locale.substr(0,2) == 'ar')
			text = text.replace(/\*/g, BidiUtils.LRE + "*" + BidiUtils.PDF);

		lableText.appendChild(document.createTextNode(text));

		dojo.attr(lableText,'for',this.inputBoxID);

    	var inputBox = new dijit.form.ValidationTextBox({type:"file",title:this.nls.browse,"id":this.inputBoxID,"name":"uploadInputFile"});
    	//upload button used to hidden inputBox because of multi-language translation.
    	inputBox.domNode.style.opacity = '0';
		dojo.attr(inputBox.textbox,'tabIndex','-1');
		
		var browseBtn = new concord.widgets.LotusTextButton({
   		 	 id: this.browseId,
   		 	 label: this.nls.browse,
   		 	 name: "uploadInputFile"			 
			 }); 
		dojo.style(browseBtn.domNode, {'position':'absolute'});
		
		var buttonContainer = dojo.create("div", null, inputDiv);
		buttonContainer.appendChild(browseBtn.domNode);
		dojo.connect(inputBox.domNode,"onchange",dojo.hitch(this,this._preClose));
		inputDiv.appendChild(inputBox.domNode);
		
		dijit.removeWaiState(inputBox.domNode, "labelledby");
		dijit.setWaiState(dojo.byId(this.inputBoxID), "required", true);
		
		dojo.addClass (inputBox.domNode, "concordInsertImage");
		dojo.style(inputBox.domNode,"width","16%");
		//hidden inputBox
		if(dojo.isFF)
			dojo.style(inputBox.domNode,"border","none");				
		if(dojo.isMac)
			dojo.attr(inputBox.textbox,{"size":38});
		else
			dojo.attr(inputBox.textbox,{"size":50});
    	this.filepath = dojo.create('div', null, browseBtn.domNode);
		dojo.addClass(this.filepath, "uploaderFilepath dijitButton");
		dojo.style(this.filepath, "display", "inline");
		
		var sepAreaDiv = dojo.create('div', null, contentDiv);
		dojo.style(sepAreaDiv,"paddingTop","30px");
		var mLabel;
		
		/*mLabel = this.createLabel(sepAreaDiv,this.nls.SepOptionsLabel);
		dijit.setWaiState(mLabel, "label", this.nls.SeparatorOptionLabel);
		dojo.addClass(mLabel,"importSCDivLabel");
		dojo.attr(mLabel,'for',this.separatorDivId);*/
		var options = dojo.create("span",null, sepAreaDiv);
		options.appendChild(dojo.doc.createTextNode(this.nls.SepOptionsLabel));
		dojo.addClass(options,"importSCDivLabel");
		
		dojo.create('br', null, sepDiv);
		var sepDiv = dojo.create('div', {"id":this.separatorDivId,"role":"region"}, sepAreaDiv);
		dijit.setWaiState(sepDiv, "label", this.nls.SepOptionsLabel);
		var statusOnChange = dojo.hitch(this,"statusOnChange");
		
		var comma = new dijit.form.RadioButton({id:this.commaOptionId,name: "SepOption",value:",",onChange:statusOnChange,checked:true},"commaOption");
		var _tmpDiv = dojo.create('div', {style : "display:inline-block"});
		_tmpDiv.appendChild(comma.domNode);
		sepDiv.appendChild(_tmpDiv);
		mLabel = this.createLabel(_tmpDiv,this.nls.Comma,this.commaOptionId);
		dojo.addClass(mLabel,"importSCOptionLabel");
		
		var semicolon = new dijit.form.RadioButton({id:this.semicolonOptionId,name: "SepOption",value:";",onChange:statusOnChange, onFocus:statusOnChange,checked:false},"semicolonOption");
		_tmpDiv = dojo.create('div', {style : "display:inline-block"});
		_tmpDiv.appendChild(semicolon.domNode);
		sepDiv.appendChild(_tmpDiv);
		mLabel = this.createLabel(_tmpDiv,this.nls.Semicolon, this.semicolonOptionId);
		dojo.addClass(mLabel,"importSCOptionLabel");
		
		var tab = new dijit.form.RadioButton({id:this.tabOptionId,name: "SepOption",value:"	",onChange:statusOnChange, onFocus:statusOnChange,checked:false},"tabOption");
		_tmpDiv = dojo.create('div', {style : "display:inline-block"});
		_tmpDiv.appendChild(tab.domNode);
		sepDiv.appendChild(_tmpDiv);
		mLabel = this.createLabel(_tmpDiv,this.nls.Tab, this.tabOptionId );
		dojo.addClass(mLabel,"importSCOptionLabel");
		
		var space = new dijit.form.RadioButton({id:this.spaceOptionId,name: "SepOption",value:" ",onChange:statusOnChange, onFocus:statusOnChange,checked:false},"spaceOption");
		_tmpDiv = dojo.create('div', {style : "display:inline-block"});
		_tmpDiv.appendChild(space.domNode);
		sepDiv.appendChild(_tmpDiv);		
		mLabel = this.createLabel(_tmpDiv,this.nls.Space, this.spaceOptionId);
		dojo.addClass(mLabel,"importSCOptionLabel");
		
		var inputId = this.otherInputId;
		var other = new dijit.form.RadioButton({id:this.otherOptionId,name: "SepOption",value:",",onChange:statusOnChange, onFocus:statusOnChange,checked:false},"otherOption");
		_tmpDiv = dojo.create('div', {style : "display:inline-block"});
		_tmpDiv.appendChild(other.domNode);
		sepDiv.appendChild(_tmpDiv);
		mLabel = this.createLabel(_tmpDiv,this.nls.Other, this.otherOptionId);
		dojo.addClass(mLabel,"importSCInputLabel");
        var textbox = new dijit.form.TextBox({
        	id:inputId,
            name: "chs",
            value: "" /* no or empty value! */,
            onKeyPress: dojo.hitch(this, this._otherOnChange),
            maxLength: 1
        }, "inputchs");
        dojo.style(textbox.domNode,"width","20px");
        dijit.setWaiState(textbox.focusNode, "label", this.nls.InputSeparatorLabel);
        _tmpDiv.appendChild(textbox.domNode);
        
        _tmpDiv = null;
        
		this.inputFileName = inputBox;	
		this.inputTextBox = textbox;
		this.onload_hdl();
		this._removeInvalidState();
	},
	
	_otherOnChange: function(){
		dijit.setWaiState(this.inputTextBox.focusNode, "invalid", false);
    	this.setWarningMsg("");
	},
	
	calcWidth: function() {
		return "430px";
	},
	
	statusOnChange:function()
	{
		this.setWarningMsg('');
		this._removeInvalidState();
	},

	getSeperatorOptions: function()
	{
		var options = [];
		var comma = dojo.byId(this.commaOptionId);
		if(comma && comma.checked)
			options.push(comma.value);
		var semicolonOption = dojo.byId(this.semicolonOptionId);
		if(semicolonOption && semicolonOption.checked)
			options.push(semicolonOption.value);
		var tabOption = dojo.byId(this.tabOptionId);
		if(tabOption && tabOption.checked)
			options.push(tabOption.value);
		var spaceOption = dojo.byId(this.spaceOptionId);
		if(spaceOption && spaceOption.checked)
			options.push(spaceOption.value);
		var other = dojo.byId(this.otherOptionId);
		if(other && other.checked)
		{
			var input = dojo.byId(this.otherInputId);
			if(input.value != null && input.value != "" )
		    {
				var v = input.value;
				
				options.push(v);
		    }
			  
		}
		return options;
	},
	
	getSelectedOption: function()
	{
		var comma = dojo.byId(this.commaOptionId);
		if(comma && comma.checked)
			return comma;
		var semicolonOption = dojo.byId(this.semicolonOptionId);
		if(semicolonOption && semicolonOption.checked)
			return semicolonOption;
		var tabOption = dojo.byId(this.tabOptionId);
		if(tabOption && tabOption.checked)
			return tabOption;
		var spaceOption = dojo.byId(this.spaceOptionId);
		if(spaceOption && spaceOption.checked)
			return spaceOption;
		var other = dojo.byId(this.otherOptionId);
		if(other && other.checked)
			return other;
		return null;
	},
	
	createLabel: function(parentNode,textValue,id)
	{
		var temp=dojo.create('label',null,parentNode);
		temp.appendChild(dojo.doc.createTextNode(textValue));
		if(id)
			dojo.attr(temp,'for',id);
		return temp;
	},
	
	setDialogID: function() {
		this.dialogId = "S_d_ImportText";
		this.inputBoxID = "S_d_InsertTextFile";
		this.commaOptionId = "commaOption";
		this.semicolonOptionId = "semicolonOption";
		this.tabOptionId = "tabOption";
		this.spaceOptionId = "spaceOption";
		this.otherOptionId = "otherOption";
		this.otherInputId = "inputchs";
		this.inputDivId = "S_d_InsertTextFileArea";
		this.separatorDivId = "separatorOptionsSelection";
		this.browseId = "ImportTextId";
	},
	
	onload_hdl : function()
	{		
		this.inputFileName.invalidMessage = this.nls.unsupportedFile;
		this.inputFileName.regExp = this.supportTextFileTypesRegExp();
		this.inputFileName.isTrySubmitted= false; // if clicked the 'ok' button try to submit, if tried, the empty value is invalid, else empty value is valid
		this.inputFileName.tooltipPosition = ['below','after'];
		this.inputFileName.validator = function(value, constraints){
			return (new RegExp("^(?:" + this.regExpGen(constraints) + ")"+(this.required?"":"?")+"$",'i')).test(value) &&
				(!this.required || !this._isEmpty(value)) &&
				(this._isEmpty(value) || this.parse(value, constraints) !== undefined); // Boolean
		};
		this.inputFileName.isEmpty = function(){
			return this._isEmpty(this.textbox.value);
		};
		this.inputFileName.validate = function( isFocused){
			var message = "";
			var isValid = this.disabled || this.isValid(isFocused);
			if(isValid){ this._maskValidSubsetError = true; }
			var isValidSubset = !isValid && isFocused && this._isValidSubset();
			var isEmpty = this._isEmpty(this.textbox.value);
			if(isEmpty){ this._maskValidSubsetError = true; }
			this.state = (isValid || (!this._hasBeenBlurred && isEmpty) || isValidSubset) ? "" : "Error";
			if(this.state == "Error"){ this._maskValidSubsetError = false; }
			this._setStateClass();
			if(this.isTrySubmitted)
				dijit.setWaiState(this.focusNode, "invalid", (isEmpty||!isValid) ? "true" : "false");
			else
				dijit.setWaiState(this.focusNode, "invalid", !isValid ? "true" : "false");
			if(isFocused){
				if(isEmpty){
					message = this.getPromptMessage(true);
				}
				if(!message && (this.state == "Error" || (isValidSubset && !this._maskValidSubsetError))){
					message = this.getErrorMessage(true);
				}
			}
			return isValid;
		};	
			
	    textFileLoadingTimeOut = null;
	    uploadTextTargetFrameId = "uploadTextTargetFrame";	
	    this.sheetName = this.editor.getCurrentGrid().getSheetName();
	},
	
	show: function(){
		var inputDiv = dojo.byId(this.inputDivId);
		if(this.isHide)
		{
			inputDiv.style.display = "none";
//			var focusOption = this.getSelectedOption();
//			var div = dojo.byId(this.separatorDivId);
////			if(focusOption)
////			{
//////				focusOption.focus();
////				setTimeout(function(){dojo.hitch(dijit,"focus",focusOption);},5000);
////			}	
//			
//			if(div)
//			{
//				setTimeout(function(){console.log("start set focus for import dialog");dojo.hitch(dijit,"focus",div);},5000);
//			}
			
				
			this.disableCancelBtn(true);
		}
		else
		{
			inputDiv.style.display = "block";
			this.disableCancelBtn(false);
		}
		this.inherited( arguments );
	},
	
	disableCancelBtn: function(bDisable) {
		this.inherited(arguments);
		var dg = this.dialog;
		if (bDisable) {
			dojo.style(dg.closeButtonNode, {"display":"none"});
			dojo.style(this.cancelBtn.domNode, {"display":"none"});
		} else {
			dojo.style(dg.closeButtonNode, {"display":""});
			dojo.style(this.cancelBtn.domNode, {"display":""});
		}
	},
	
	hide: function(){
			this.inherited( arguments );
			if(this._isSubmit){
				this._isSubmit = false;
				this.execute();
			}else
				delete websheet.dialog.ImportDialog._FileUploadResponse;
	},  
	  
	supportTextFileTypesRegExp : function ()
	{
		var support = "";
		var types = websheet.config.config.supportedTextFileEx;
		for(var ext in types)
		{
			support += types[ext]+'|';
		}
		support = support.substring(0,support.length-1) || "txt|csv";
		var regExp = ".*\\.{1}(" + support + ")";
		return regExp;
	},	
	postCreate: function()
	{
		var form = this.btnContainer.parentNode;
		dojo.attr(form,{
			"enctype":"multipart/form-data"			
		});
	},
	onCancel: function (editor) {
		// Overridden 
		return true;
	},
	
	execute: function() {
		if (window.FileReader != null) {
			// detect FileAPI, true for browsers having FileAPI, detect file size
			// file form node
			var fn = dojo.byId('S_d_InsertTextFile');
			if (fn.files && fn.files[0]) {
				if (parseInt(fn.files[0].size) > g_maxTextSize * 1024) {
					// size exceeded
		   			this.editor.scene.showErrorMessage(dojo.string.substitute(this.editor.nls.maxTextFileSize, [g_maxTextSize]), 2000);
		   			return;
				}
				// else, file size ok
			}
			// else, something wrong with the file node
		}
		// else, no FileAPI support
   		
		var form = this.btnContainer.parentNode;
		var tokeNode = dojo.byId("formtoken_import_id");
		var csrfValue = JSON.stringify(concord.main.App.getCsrfObject());
		if(tokeNode  == null){			
			dojo.create("input", {"type": "hidden","id":"formtoken_import_id","name": "csrf", "value": csrfValue}, form);
		}else {
			dojo.attr(tokeNode, "value", csrfValue);
		}
//		var data = dijit.byNode(form).getValues();
//		if(!data.uploadInputFile && !this.isHide)
//		{
//			return;
//		}
		var url = this._uploadUrl + "?separator=" + encodeURIComponent(this.options);
		if(this.isHide)
			url = url + "&repo=true";
		form.action = url;
		//form.target = uploadTextTargetFrameId;
		var maxRow = this.editor.getMaxRow;
		var oocmsg = dojo.string.substitute(this.nls.outOfCapacityTruncated, [maxRow, websheet.Constant.MaxColumnIndex]);
		var shname = this.sheetName;
		var nls = this.nls;
		var inFromEdit = this.isHide;
		this.editor.scene.showWarningMessage(this.nls.loading);
		
		var editor = this.editor;
		dojo.io.iframe.send({
			form: form,
			handleAs: "json",
			load: function(response, ioArgs)
			{
				if (response.msg != null && response.msg == "insert_file_server_error") {
					editor.scene.showWarningMessage(nls.insertFileErrorP1, 4000);
					return response;
				} else if (response.msg != null && response.msg == "size_exceeded") {
		   			editor.scene.showErrorMessage(dojo.string.substitute(editor.nls.maxTextFileSize,[g_maxTextSize]),2000);
		   			return response;
				} else if(response != "") {
			   		var sheetName = shname;
			   		if(null == sheetName)
			   		{
			   			editor.scene.showWarningMessage(nls.WORKSHEET_NOTEXIST_WARNING, 4000);
			   		}
			   		else
			   		{
			   			if(this.importHelper == null)
							this.importHelper = new websheet.datasource.ImportHelper(editor);
						var ooc = this.importHelper.importData(inFromEdit,response);
						if(ooc)
						{
							editor.scene.showWarningMessage(oocmsg, 4000);
						}
			   		}
				}
				return response;
			},
			error: function(response, ioArgs){
		        return response;
		    }
		});
		this._removeCsrf();
	},
	
	_removeCsrf: function(){
		var tokenNode = dojo.byId("formtoken_import_id");
		if(tokenNode != null){	
			dojo.attr(tokenNode, "value", "");
		}
	},
	
	focus:function(){
		this.dialog._getFocusItems(this.dialog.domNode);
		dijit.focus(this.dialog._firstFocusItem);
	},
	
	setFocus: function(){
		if(this.isHide)
			setTimeout( dojo.hitch(this, function(){ 
				console.log("start set focus for import dialog");
				var focusOption = this.getSelectedOption();
				if(focusOption){
					focusOption.focus();
				} 
			}), 2000);
	},
	
	onOk: function () {
		this.inputFileName.isTrySubmitted = true;		
		this.options = this.getSeperatorOptions();
		var isOptEmpty = this.options && this.options.length == 0;
		var isEmpty = this.inputFileName.isEmpty();
		var isValid = this.inputFileName.validate();
		var isSepInputValid = true;
		var other = dojo.byId(this.otherOptionId);
		if(this.isHide ){
			isValid = true;	
			isEmpty = false;
		}
		
		if(!isEmpty && isValid &&!isOptEmpty){
			this._preClose();	
			this._isSubmit = true;
			return true;
		}
		else{
			console.log("start set focus for File");
			this.inputFileName.focus();
			var grid = this.editor.getCurrentGrid();
			if(isOptEmpty)
			{
				this.setWarningMsg(this.nls.checkSeparatorErrorP1);
				grid.announce(this.nls.checkSeparatorErrorP1);
			}

			if(other && other.checked)
			{
				var input = dojo.byId(this.otherInputId);
				if(input.value == null || input.value == "" )
				{
					isSepInputValid = false;
					this.setWarningMsg(this.nls.checkSeparatorErrorP2);
					grid.announce(this.nls.checkSeparatorErrorP2);
				}
			}
			if(isEmpty)
			{
//				dojo.style(this.inputFileName.domNode,"width","101%");
				var msg = this.nls.emptyFile;
				if(BidiUtils.isGuiRtl())
					msg = "<div dir='rtl'>" + msg.replace(/\*/g, BidiUtils.LRE + "*" + BidiUtils.PDF) + "</div>"

				this.inputFileName.displayMessage(msg);
				grid.announce(this.nls.emptyFile);
			}
			else if(!isValid)
			{
				dojo.style(this.inputFileName.domNode,"width","101%");
				var msg = this.nls.unsupportedFile;
				if(BidiUtils.isGuiRtl())
					msg = "<div dir='rtl'>" + msg.replace(/\./g, BidiUtils.LRE + "." + BidiUtils.PDF) + "</div>"

				this.inputFileName.displayMessage(msg);
				grid.announce(this.nls.unsupportedFile);
			}
			dijit.setWaiState(this.inputTextBox.focusNode, "invalid",isSepInputValid?"false":"true" );
			var input = this.inputFileName.textbox;
			var width = input.parentNode.parentNode.offsetWidth;
			var tooltip = window.document.body.querySelector('div.dijitTooltipContainer');
			if(tooltip)
				tooltip.style.width = width + 'px';
			return false;
		}
	},
	/**
	 * For RPT compliance, dojo tab role do not have aria-pressed state(this is for buttons).
	 */
	_removeInvalidState: function(){
		dojo.forEach(dojo.query("input",dojo.byId("separatorOptionsSelection")), function(input, index){
			dijit.removeWaiState(input, "pressed");
		});
	},
		
	_getUploadedFileName: function(path){
		var p1 =path.lastIndexOf('/');
		var p2 =path.lastIndexOf('\\');
		var pos = Math.max(p1,p2);
		if(pos < 0) return path;
		else return path.substring(pos+1); 	
	},
	
	_preClose : function(){
		dojo.style(this.inputFileName.domNode,"width","16%");
		this.inputFileName.displayMessage('');//hide the tooltip
		this.setWarningMsg('');
		var tooltip = window.document.body.querySelector('div.dijitTooltipContainer');
		if(tooltip)
			tooltip.style.width = '';
        //show file name
		var value = this.inputFileName.textbox.value;
		//value and title
		value = this._getUploadedFileName(value);
		this.filepath.title = value;
		this.filepath.innerHTML = value;
		if (BidiUtils.isBidiOn())
			dojo.attr(this.filepath, "dir","ltr");				
	}
});
})();