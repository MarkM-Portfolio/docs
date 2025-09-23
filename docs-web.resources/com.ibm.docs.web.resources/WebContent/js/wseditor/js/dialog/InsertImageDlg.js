/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("websheet.dialog.InsertImageDlg");
dojo.require("concord.widgets.concordDialog");
dojo.require("concord.widgets.LotusUploader");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("websheet.dialog","InsertImageDlg");
dojo.requireLocalization("concord.widgets","LotusUploader"); 

dojo.declare("websheet.dialog.InsertImageDlg", [concord.widgets.concordDialog], {
	nls: null,
	_uploadUrl: null,
	_uploader: null,
	_isSubmit: false,
	constructor: function(object, title, oklabel, visible, params, formParams) {
		this._uploadUrl = params.uploadUrl;
	},
	
	createContent: function (contentDiv) {
		this.nls = dojo.i18n.getLocalization("websheet.dialog","InsertImageDlg"); 
		var uploaderDiv = dojo.create('div', null, contentDiv);
		this._uploader = new concord.widgets.LotusUploader({id:"docsUploaderId"},uploaderDiv);
		dojo.subscribe(concord.util.events.uploader_loaded,this,'validate');
		//this.editor.uploadImgTargetFrameId = "uploadImgTargetFrame"; 
	},
	
	setDialogID: function() {
		this.dialogId = "S_d_InsertImage";
	},
	
	reset: function()
	{
		//insert button reset
		var okBtn = this.getOkBtn();
		okBtn.setAttribute('disabled', false);
	},

	validate : function(loadedStatus){
		var okBtn = this.getOkBtn();
		if(loadedStatus.valid){
			this.setWarningMsg("");
			okBtn.setAttribute('disabled', false);
		}else{	
			this.setWarningMsg(loadedStatus.errorMsg);
			okBtn.setAttribute('disabled', true);			
		}
	},
	
	setWarningMsg: function(msg) {
		// unique warning message ID in concord system
		var msgId = this.warnMsgID + this.dialogId;
		var msgDiv = dojo.byId(msgId);
		if (msgDiv)
		{
			msgDiv.style.cssText = "width:30em;word-wrap:break-word";
		}
		
		this.inherited( arguments );
	},

	postCreate: function()
	{
		var form = this.btnContainer.parentNode;
		dojo.attr(form,{
			"enctype":"multipart/form-data"			
		});
	},
	
	show: function(){
//		websheet.dialog.InsertImageDlg._ImgUploadResponse = function(){
//			this.editor.scene.hideErrorMessage();
//			var fileUrlFromServer;
//			var errorMessage;
//			var targetFrame = dojo.byId(this.editor.uploadImgTargetFrameId);
//			if(targetFrame) {
//				var nls = dojo.i18n.getLocalization("websheet.dialog","InsertImageDlg");
//				dojo.attr(targetFrame,'title',nls.dlgIFrameTitle);
//			}			
//			var doc = dojo.byId(this.editor.uploadImgTargetFrameId).contentDocument;
//			dojo.query("textarea", doc).some( function(item)
//					{
//						var json = dojo.fromJson(item.innerHTML);
//						if(json.attachments && json.attachments.length>0)
//						{
//							fileUrlFromServer = json.attachments[0].url;
//							errorMessage = json.attachments[0].msg;
//						}
//						
//						return true;
//					}
//				);
//			if(errorMessage)
//			{
//				if(errorMessage == 'insert_image_server_error')
//				{
//					nls = dojo.i18n.getLocalization("websheet.dialog","InsertImageDlg");
//		        	var insertImageErrorMsg = nls.insertImageErrorP1 + '<br>' +nls.insertImageErrorP2 
//		                                      + '<br>' + nls.insertImageErrorP3 ;		        
//		        	this.editor.scene.showErrorMessage(insertImageErrorMsg,10000);	
//				}
//				else
//				{
//					this.editor.scene.showErrorMessage(dojo.string.substitute(this.editor.nls.maxImgSize,[errorMessage]),2000);
//				}
//				delete websheet.dialog.InsertImageDlg._ImgUploadResponse;
//				return;
//			}
//			if( !fileUrlFromServer )
//				return;
//			this.editor.getImageHdl().insertImage(fileUrlFromServer);
//			delete websheet.dialog.InsertImageDlg._ImgUploadResponse;
//		};
//		var targetFrame = dojo.byId(this.editor.uploadImgTargetFrameId);
//		if(!targetFrame)			
//	   		dojo.io.iframe.create(this.editor.uploadImgTargetFrameId);				
		this.inherited( arguments );
	},
	
	hide: function(){
		this.inherited( arguments );
		if(this._isSubmit){
			this._isSubmit = false;
			this.execute();
		}
	},
	
	onOk: function () {
		var inputfile = this._uploader.getInputBox();
		if(!inputfile.isEmpty() && this._uploader.isValid()){
			this._isSubmit = true;	
			return true;				
		}else{
			var nls = dojo.i18n.getLocalization("concord.widgets","LotusUploader"); 
			var text = nls.unsupportedImage;
			if(BidiUtils.isGuiRtl() && g_locale.substr(0,2) == 'ar')
				text = text.replace(/\./g, BidiUtils.LRE + "." + BidiUtils.PDF);

			var msg = inputfile.isEmpty() ? nls.emptyImage : text;
			var loadedStatus = {valid: false, errorMsg: msg};
			this.validate(loadedStatus);
			return false;
		}
	},
	
	onCancel: function () {
		return true;
	},
	
	execute : function() {
		//get file size
		function getFileSize(obj){  
			if( obj.files && obj.files[0])
				return parseInt(obj.files[0].size );
			return -1;  
   		}  
   		
   		var imgsize = getFileSize(dojo.byId('S_d_InsertImageInputFile'));
   		if( imgsize > g_maxImgSize*1024)
   		{
   			this.editor.scene.showErrorMessage(dojo.string.substitute(this.editor.nls.maxImgSize,[g_maxImgSize]),2000);
   			return;
   		}
   		
		var form = this.btnContainer.parentNode;
		var tokenNode = dojo.byId("formtoken_sheet_id");
		var csrfValue = JSON.stringify(concord.main.App.getCsrfObject());
		if(tokenNode  == null){			
			dojo.create("input", {"type": "hidden","id":"formtoken_sheet_id","name": "csrf", "value": csrfValue}, form);
		}else {
			dojo.attr(tokenNode, "value", csrfValue);
		}
//		var data = dijit.byNode(form).getValues();
//		if(!data.uploadInputFile)
//		{
//			return;
//		}
		form.action = this._uploadUrl;
		//form.target = this.editor.uploadImgTargetFrameId;
		//form.submit();		
		var dfd = dojo.io.iframe.send({form:form, handleAs: "html", timeout: 30000});
		dfd.addCallback(dojo.hitch(this, function(data){
			this.editor.scene.hideErrorMessage();
			var fileUrlFromServer;
			var errorMessage;
			
			dojo.query("textarea", data).some( function(item)
				{
					var json = dojo.fromJson(item.innerHTML);
					if(json.attachments && json.attachments.length>0)
					{
						fileUrlFromServer = json.attachments[0].url;
						errorMessage = json.attachments[0].msg;
					}
					
					return true;
				}
			);
			if(errorMessage)
			{
				if(errorMessage == 'insert_image_server_error')
				{
					var nls = dojo.i18n.getLocalization("websheet.dialog","InsertImageDlg");
		        	var insertImageErrorMsg = nls.insertImageErrorP1 + '<br>' +nls.insertImageErrorP2 
		                                      + '<br>' + nls.insertImageErrorP3 ;		        
		        	this.editor.scene.showErrorMessage(insertImageErrorMsg,10000);	
				}
				else
				{
					this.editor.scene.showErrorMessage(dojo.string.substitute(this.editor.nls.maxImgSize,[errorMessage]),2000);
				}
				return;
			}
			if( !fileUrlFromServer ){
				var nls = dojo.i18n.getLocalization("websheet.dialog","InsertImageDlg");
	        	var insertImageErrorMsg = nls.insertImageErrorP1 + '<br>' +nls.insertImageErrorP2 
	                                      + '<br>' + nls.insertImageErrorP3 ;		        
	        	this.editor.scene.showErrorMessage(insertImageErrorMsg,10000);
				return;
			}
			this.editor.getImageHdl().insertImage(fileUrlFromServer);
		}));
		dfd.addErrback(function(){
			this.editor.scene.hideErrorMessage();
			var nls = dojo.i18n.getLocalization("websheet.dialog","InsertImageDlg");
        	var insertImageErrorMsg = nls.insertImageErrorP1 + '<br>' +nls.insertImageErrorP2 
                                      + '<br>' + nls.insertImageErrorP3 ;		        
        	this.editor.scene.showErrorMessage(insertImageErrorMsg,10000);	
		});
		var msg = this.nls.loading;
		this.editor.scene.showWarningMessage(msg);
		this._removeCsrf();
	},
	
	_removeCsrf: function(){
		var tokenNode = dojo.byId("formtoken_sheet_id");
		if(tokenNode != null){	
			dojo.attr(tokenNode, "value", "");
		}
	}
});
