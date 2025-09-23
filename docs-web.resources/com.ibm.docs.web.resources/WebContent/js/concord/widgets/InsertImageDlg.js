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

dojo.provide("concord.widgets.InsertImageDlg");

dojo.require("dojo.io.iframe");
dojo.require("dojo.string");
dojo.require("concord.widgets.TemplatedDialog");
dojo.require("dijit.form.TextBox");
dojo.require("concord.widgets.InsertImageDlgButton");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("concord.util.dialogs");
dojo.require("concord.widgets.LotusUploader");
dojo.require("dojox.encoding.digests.MD5");

dojo.requireLocalization("concord.widgets","InsertImageDlg");

(function()
{
var uploadImgTargetFrameId = "uploadImgTargetFrame";
var isCancel = true;
var firsttime = false;
var imageLoadingTimeOut = null;
dojo.declare("concord.widgets.InsertImageDlg", [concord.widgets.concordDialog], {
	_uploadUrl : null,
	_uploader : null,	
	_callback : null,
	nls : null,
	_lockManager: null,
	
	constructor: function(object, title, oklabel, visible, params, formParams) {
		firsttime = true;
		this._uploadUrl = params.uploadUrl;
	},
	
	createContent: function (contentDiv) {
		this.nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDlg"); 
		var uploaderDiv = dojo.create('div', null, contentDiv);
		this._uploader = new concord.widgets.LotusUploader({id:"docsUploaderId"},uploaderDiv);
		dojo.subscribe(concord.util.events.uploader_loaded,this,'validate');
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
	
	show: function(obj){
		concord.widgets.InsertImageDlg._ImgUploadResponse = function(){
//			clearTimeout(imageLoadingTimeOut);
			var loadingTimer = imageLoadingTimeOut;
			imageLoadingTimeOut = null;
//			pe.scene.hideErrorMessage();
			var fileUrlFromServer;
			var errorMessage;
			var targetFrame = dojo.byId(uploadImgTargetFrameId);
			var nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDlg");
			if(targetFrame) {
				dojo.attr(targetFrame,'title',nls.dlgIFrameTitle);
			}
			try{
				var doc = dojo.byId(uploadImgTargetFrameId).contentDocument;
				dojo.query("textarea", doc).some( function(item)
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
			}catch(e){}
			if(errorMessage)
			{
				if(errorMessage == 'insert_image_server_error')
				{
					var insertImageErrorMsg = nls.insertImageErrorP1 + '<br>' + nls.insertImageErrorP2
                                          + '<br>' + nls.insertImageErrorP3;
			    	pe.scene.showErrorMessage(insertImageErrorMsg,10000);			   
				}
           		else
            	{
                	pe.scene.showErrorMessage(dojo.string.substitute(nls.maxSize,[errorMessage]),2000);
            	}
		    	delete concord.widgets.InsertImageDlg._ImgUploadResponse;
				return; 
			}
			if( !fileUrlFromServer )
			{
				if(firsttime)
				{
					firsttime = false;
				}
				else
				{
					pe.scene.hideErrorMessage();
					var insertImageErrorMsg = nls.insertImageErrorP1 + '<br>' + nls.insertImageErrorP2 + '<br>' + nls.insertImageErrorP3;        	        	
			        setTimeout(function(){dojo.hitch(pe.scene,pe.scene.showWarningMessage(insertImageErrorMsg,5000));},600);
				}
				return;
			}
			//callback(fileUrlFromServer);
    		pe.scene.hideErrorMessage();
			obj._callback(fileUrlFromServer, loadingTimer);
			delete concord.widgets.InsertImageDlg._ImgUploadResponse;
		};
		var targetFrame = dojo.byId(uploadImgTargetFrameId);
		if( !targetFrame ){
			dojo.io.iframe.create(uploadImgTargetFrameId, "concord.widgets.InsertImageDlg._ImgUploadResponse()");
		}	
		this.inherited( arguments );
		this._lockManager = obj;
		this._lockManager.onshow_hdl();		
	},
	
	hide: function(){
		console.log('overwrite hide function in InsertImageDlg');
		isCancel = (pe.lotusEditor.insertImageButton != 'submit');
				
		this.inherited( arguments );
		if(this._isSubmit){
			this._isSubmit = false;
			this.execute();
		}else
			delete concord.widgets.InsertImageDlg._ImgUploadResponse;
		
		pe.lotusEditor.insertImageButton = null;
		if(this._lockManager)
			this._lockManager.onhide_hdl();	
	},
	
	onOk: function () {
		var inputfile = this._uploader.getInputBox();
		if(!inputfile.isEmpty() && this._uploader.isValid()){
			this._isSubmit = true;	
			return true;				
		}else{
			var nls = dojo.i18n.getLocalization("concord.widgets","LotusUploader"); 
			var msg = inputfile.isEmpty() ? nls.emptyImage : nls.unsupportedImage;
			var loadedStatus = {valid: false, errorMsg: msg};
			this.validate(loadedStatus);
			dojo.byId("InsertImageButtonId").focus();
			return false;
		}
	},
	
	getCsrfObject: function() {
		var ct = new Date().getTime().toString();
		var userId = window.pe.authenticatedUser.getId();
		var seed = userId + "@@" + ct.substring(4,ct.length-1) + "##";
		var token = dojox.encoding.digests.MD5(seed, dojox.encoding.digests.outputTypes.Hex);				
		var csrfHeader = {"X-Csrf-Token": token, "X-Timestamp": ct};
		return csrfHeader;
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
   			pe.scene.showErrorMessage(dojo.string.substitute(this.nls.maxSize,[g_maxImgSize]),2000);
   			return;
   		}
		var form = this.btnContainer.parentNode;
		var tokeNode = dojo.byId("formtoken_text_id");
		var csrfValue = JSON.stringify(this.getCsrfObject());
		if(tokeNode  == null){			
			dojo.create("input", {"type": "hidden","id":"formtoken_text_id","name": "csrf", "value": csrfValue}, form);
		}else {
			dojo.attr(tokeNode, "value", csrfValue);
		}
		form.action = this._uploadUrl;
		form.target = uploadImgTargetFrameId;
		form.submit();
		var msg = this.nls.loading;
		pe.scene.showWarningMessage(msg, 10000);		
		//imageLoadingTimeOut = setTimeout(function(){dojo.hitch(pe.scene,pe.scene.showWarningMessage(this.nls.loading,60000));},500);
		tokeNode && dojo.attr(tokeNode, "value", "");
	}
});
concord.widgets.InsertImageDlg.instance = null;
concord.widgets.InsertImageDlg.show = function(paramsObj){
	var nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDlg")
	var params = {
		uploadUrl: paramsObj._uploadUrl
	};
	var formParams = {
		"name":"uploadForm",
		"method":"POST",			
		"enctype":"multipart/form-data"	
	};	
	if(!concord.widgets.InsertImageDlg.instance) 
		concord.widgets.InsertImageDlg.instance = new concord.widgets.InsertImageDlg(this,nls.titleInsert,nls.insertImageBtn,null,params,formParams);	
	concord.widgets.InsertImageDlg.instance.show(paramsObj);	
};
})();
