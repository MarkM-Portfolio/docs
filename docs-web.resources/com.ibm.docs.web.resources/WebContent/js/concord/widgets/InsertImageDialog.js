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

dojo.provide("concord.widgets.InsertImageDialog");

dojo.require("concord.editor.SpecialStyle");
dojo.require("dojo.io.iframe");
dojo.require("dojo.string");
dojo.require("concord.widgets.TemplatedDialog");
dojo.require("dijit.form.TextBox");
dojo.require("concord.widgets.InsertImageDlgButton");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("concord.util.dialogs");
dojo.require("concord.config.config");
dojo.require("concord.widgets.LotusUploader");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.widgets","InsertImageDialog");
(function()
{
	var uploadImgTargetFrameId = "uploadImgTargetFrame";
	var isCancel = true;
	var imageLoadingTimeOut = null;
	var firsttime = false;
	var isGallery = false;
dojo.declare("concord.widgets.InsertImageDialog", [concord.widgets.concordDialog], {
	nls:null,
	_callback : null,
	_focusCallback: null,
	_isSubmit: null,
	_uploader: null,
	imageGalleryTab:null,
	uploadDesktop:null,
	imageGalleryObj: null,
	tabContainer : null,
    CLIPART_TAB_ID : "P_d_ClipArt_ContentDiv_tablist_P_d_ClipArt_galleryTab",
    FILE_TAB_ID : "P_d_ClipArt_ContentDiv_tablist_P_d_ClipArt_uploadTab",
    
    SEARCHBOX_ID: "searchBox_clipper_SearchBoxID_addImageDlg",
    RESULT_BOX: "clipPickerDialogResultBox",
    IMAGE_DIALOG_TABCONTAINER_IE : '672',
    
	constructor: function(object, title, oklabel, visible, params, formParams) {
		firsttime = true;
		this._uploadUrl = params.uploadUrl;
		this._callback = params.callback;
		this._focusCallback = params.focusCallBack;
		this.isGallery=false;
	},
	
	setDialogID: function() {
		this.dialogId = "P_d_ClipArt";
		this.inputBoxID = "InsertImageButtonId";
	},
	
	createContent: function (contentDiv) {
		this.nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDialog");
		
		var mainDiv = dojo.create('div', {"id":"P_d_ClipArt_MainDiv"}, contentDiv);

        var mainTabContainer = dojo.create('div', {"id":"P_d_ClipArt_ContentDiv"}, mainDiv);
        
        var uploadTab = dojo.create('div', {"id":"P_d_ClipArt_uploadTab"}, mainTabContainer);
        dojo.style(uploadTab,'height','245px');
        
        var galleryTab = dojo.create('div', {"id":"P_d_ClipArt_galleryTab"}, mainTabContainer);
        //Load imageGallery TAB 
        this.imageGalleryObj = new concord.widgets.imageGallery({'mainDiv':galleryTab,'onSelectCallback': dojo.hitch(this, this.handleImageDialogSelecitonChange),'STRINGS':this.nls.concordGallery,'onDblClick':dojo.hitch(this,this.onDblImageGallery)}); //D14753 
//      this.newImageDialogObj.toolTipObjs = imageGalleryObj.toolTipObjs;
        // Ensure that tall non-latin characters fit into the text box
        if (dojo.isIE)
        	dojo.style(this.imageGalleryObj.searchBoxObj.domNode, 'height', '18px');
                  

        //applying Japanese font or Korean font to correctly present '\' according to respective locale.
        var style = ' ' + concord.editor.SpecialStyle.special_stl();
           		
    	var inputDiv = dojo.create('div', null, uploadTab);
    	dojo.style(inputDiv,"paddingBottom","80px");
    	this._uploader = new concord.widgets.LotusUploader({id:"docsUploaderId"}, inputDiv);
    	dojo.subscribe(concord.util.events.uploader_loaded,this,'validate'); 
  			
    	this._uploader.setCustomWidth('55em');//55 em
    	dojo.style(galleryTab,'width','55em');
    	
        var dialogWidth = (dojo.isIE)? this.IMAGE_DIALOG_TABCONTAINER_IE +"px" :"100%";
        var dirValue = BidiUtils.isGuiRtl() ? 'rtl' : 'ltr';
        var langValue = this.params.lang?this.params.lang:"en";
        var tc = new dijit.layout.TabContainer(
                   {style:"width:"+dialogWidth +";height:100%;", dir:dirValue, lang:langValue, selected:true, isLayoutContainer:true,doLayout:false},
                   mainTabContainer.id
                 );
        this.tabContainer = tc;
        
        this.uploadDesktop = new dijit.layout.ContentPane(
                   { title:this.nls.imageDialog.uploadAnImageFile},
                   uploadTab.id
                 );
        dojo.attr(this.uploadDesktop,'dir',dirValue);
        dojo.attr(this.uploadDesktop,'lang',langValue);
                 
        
        this.imageGalleryTab = new dijit.layout.ContentPane(
                   { title:this.nls.imageDialog.imageGallery, preload:true},
                   galleryTab.id
                 );
        dojo.attr(this.imageGalleryTab,'dir',dirValue);
        dojo.attr(this.imageGalleryTab,'lang',langValue);
                
                
             
        tc.addChild(this.uploadDesktop);
        tc.addChild(this.imageGalleryTab);       
                 
                 
        this.uploadDesktop.onShow = dojo.hitch(this, this.handleImageDialogSelecitonChange);
        this.imageGalleryTab.onShow = dojo.hitch(this, this.handleImageDialogSelecitonChange);
                 
        this.uploadDesktop.startup();
        this.imageGalleryTab.startup();
                 
                 
        tc.startup();  
                 
           var tabbutton = dojo.byId(this.FILE_TAB_ID);
           if (tabbutton) {
        	   dojo.attr(tabbutton,"tabindex","1");
           }
                 
                 //hide buttons
           var tabStripButtonsArray = dojo.query('.tabStripButton');
           for (var i=0; i<tabStripButtonsArray.length;i++ ){
        	   dojo.style(tabStripButtonsArray[i],{
                        'display':'none' 
                     });
           }
                 
        dojo.removeClass(this.uploadDesktop.domNode,'dijitHidden');
        
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
			msgDiv.style.cssText = "width:50em;word-wrap:break-word";
		}
		
		this.inherited( arguments );
	},
			
	getMaxZindex: function(){
		var dialogs = dojo.ById(this.dialogId);
		var max=0;
		for (var i=0; i<dialogs.length; i++){
			var zValue = parseInt(dialogs[i].style.zIndex);
			if (max <=zValue){
				max = zValue;
			}
		}
		return parseInt(max)+1;
	},
	
    handleImageDialogSelecitonChange: function(selectedItems) {
    	var selectedImages = selectedItems;
    	if (this.imageGalleryTab.selected) {
    		//clear error message
    		this.setWarningMsg("");
    		// get selected images when switching to the gallery tab
    		if (!selectedImages)
    			selectedImages = this.imageGalleryObj.getAllSelected();
    		var isSelected = selectedImages.length <= 0;
    		this.okBtn.setDisabled(isSelected);

    		var tabbutton = dojo.byId(this.CLIPART_TAB_ID);
            if (tabbutton) {
           	 dojo.attr(tabbutton,"tabindex","1");
            }
    	}
    	else if ( this.uploadDesktop.selected) {
    		var inputfile = this._uploader.getInputBox();
    		if(inputfile.isEmpty() || !this._uploader.isValid()){
    			//empty
    			if(inputfile.isEmpty()){
    				this.okBtn.setDisabled(false);
    			}else{
    				var nls = dojo.i18n.getLocalization("concord.widgets","LotusUploader"); 
    				var msg = nls.unsupportedImage;    				
    				var loadedStatus = {valid: false, errorMsg: msg};
    				this.validate(loadedStatus);    				
    			}
    		}else{
    			this.okBtn.setDisabled(false);
    		}
    	}
    	else
    		this.okBtn.setDisabled(true);
    },
    
    handleUploadDesktopSelection: function(){
		//get file size
		function getFileSize(obj){  
			if( obj.files && obj.files[0])
				return parseInt(obj.files[0].size );
			return -1;  
   		}  
   		
   		var imgsize = getFileSize(dojo.byId('S_d_InsertImageInputFile'));
   		if( imgsize > g_maxImgSize*1024)
   		{
   			pe.scene.showErrorMessage(dojo.string.substitute(this.nls.imageDialog.maxImgSize,[g_maxImgSize]),2000);
   			return;
   		}
   		
		var form = this.btnContainer.parentNode;
		var inputFile = dojo.query("input[type='file'][name='uploadInputFile']", form)[0];
		if(!inputFile.value)
		{
			return;
		}
		var tokeNode = dojo.byId("formtoken_pres_id");
		var csrfValue = JSON.stringify(concord.main.App.getCsrfObject());
		if(tokeNode  == null){			
			dojo.create("input", {"type": "hidden","id":"formtoken_pres_id","name": "csrf", "value": csrfValue}, form);
		}else {
			dojo.attr(tokeNode, "value", csrfValue);
		}
		form.action = this._uploadUrl;
		form.target = uploadImgTargetFrameId;
		form.submit();
		var msg = this.nls.imageDialog.loading;
		imageLoadingTimeOut = setTimeout(function(){dojo.hitch(pe.scene,pe.scene.showWarningMessage(msg,3000));},500);
//        this.newImageDialogObj.opts.destroyOnClose = false;
		tokeNode && dojo.attr(tokeNode, "value", "");
    },   
    
    closeDialog: function()
    {
    	
    },
	hide: function(){
		//D24375 [Image][Regression] Previous selection remains in Add an Image dialog
		this.imageGalleryObj.deSelectAll(null);
		//D24606 [Regression]There is no response after click ok on insert image dialog
		this.tabContainer.selectChild(this.uploadDesktop);
		
		this.inherited( arguments );
		if(this._isSubmit){
			this._isSubmit = false;
			 if (!this.isGallery){
				this.handleUploadDesktopSelection();			 	
			 }
		}
		else
			delete concord.widgets.InsertImageDialog._ImgUploadResponse;
    },  
    //
    // Handles openImageDialog imageGalleryTab selection
    //
    handleImageGallerySelection: function(){
        var imageChosenArray = this.imageGalleryObj.getAllSelected();
        var servletUrl = concord.util.uri.getGalleryAttachmentURL();
        var arrayObj = [];                
        for(var i=0; i<imageChosenArray.length; i++){
            var attUrl = imageChosenArray[i].source.substring(imageChosenArray[i].source.indexOf("js/"));
            var obj = {};
            obj.type = "uri";
            obj.data = attUrl;
            obj.name = imageChosenArray[i].name;
            arrayObj.push(obj);
        }
        
        var sData = dojo.toJson(arrayObj);  
        var response, ioArgs;
        var arrayAtt = new Array();
        if (arrayObj.length>0){ //For 34516 prevent call when there array is empty
            dojo.xhrPost({
                url: servletUrl,
                handleAs: "json",
                handle: function(r, io)
                {
                	response = r;
                	//D28590: <BHT6>Insert image from gallery  failed without any alert when the presentation is doing failover
                	if(response.name){
                		pe.scene.hideErrorMessage();
                		nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDialog");
                		var insertImageErrorMsg = nls.imageDialog.insertImageErrorP1 + '<br>' +nls.imageDialog.insertImageErrorP2 
                		+ '<br>' + nls.imageDialog.insertImageErrorP3 ;		        	        	
                		setTimeout(function(){dojo.hitch(pe.scene,pe.scene.showWarningMessage(insertImageErrorMsg,5000));},600);
                	}
                	ioArgs = io;
                	for(var i=0; i<response.length; i++) 
                		arrayAtt.push(response[i].url); 
                },                         
                sync: true, 
                contentType: "text/plain",
                postData: sData
            });
        }
    	if(this._callback){
    		this._callback(arrayAtt, null, arrayObj[0].name, true);
    	}
    },
    
    onOk: function (editor) {
    	this.isGallery = false;
        if (this.uploadDesktop.selected){
    		var inputfile = this._uploader.getInputBox();
    		if(!inputfile.isEmpty() && this._uploader.isValid()){            					
    			this._isSubmit = true;	
    			return true;				
    		}else{
    			var nls = dojo.i18n.getLocalization("concord.widgets","LotusUploader"); 
    			var msg = inputfile.isEmpty() ? nls.emptyImage : nls.unsupportedImage;
    			var loadedStatus = {valid: false, errorMsg: msg};
    			this.validate(loadedStatus);
    			return false;
    		}
        } else if(this.imageGalleryTab.selected){
            this.handleImageGallerySelection();
            this.isGallery = true;
            this._isSubmit = true;
            return true;
        } 
        return false;
	},

	onDblImageGallery: function()
	{
		this.onOk();
		this.hide();
	},
	
	show:function()
	{
		 var tabbutton = dojo.byId(this.FILE_TAB_ID);
         if (tabbutton) {
      	   dojo.attr(tabbutton,"tabindex","1");
         }
		
		var callbackshow = this._callback;
		var dlg = this.dialog;
		dojo.addClass(this.dialog.domNode,'presentationNonModalDialog');
        dojo.style(this.dialog.domNode,{
            'cursor':'auto'
        });
        
		// summary: Show the FloatingPane
		var anim = dojo.fadeIn({node:this.dialog.domNode, duration:this.dialog.duration,
			beforeBegin: dojo.hitch(this,function(){
				this.dialog.domNode.style.display = "";
				this.dialog.domNode.style.visibility = "visible";
				if (this.dialog.dockTo && this.dialog.dockable) { this.dialog.dockTo._positionDock(null); }
				if (typeof callback == "function") { callback(); }
				this.dialog._isDocked = false;
				if (this.dialog._dockNode) {
					this.dialog._dockNode.destroy();
					this.dialog._dockNode = null;
				}
			}),
			onEnd: dojo.hitch(this, function(){
				this.dialog._getFocusItems(this.dialog.domNode);
				if(this._focusCallback){
					this._focusCallback();
				}
			})
		}).play();
        
		concord.widgets.InsertImageDialog._ImgUploadResponse = function(){
			var loadingTimer = imageLoadingTimeOut;
			imageLoadingTimeOut = null;
			pe.scene.hideErrorMessage();
			var fileUrlFromServer;
			var errorMessage;
			
			try{
				var targetFrame = dojo.byId(uploadImgTargetFrameId);
				if(targetFrame) {
					var nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDialog");
					dojo.attr(targetFrame,'title',nls.imageDialog.dlgIFrameTitle);
					dojo.attr(targetFrame,"tabindex","-1");
					var doc = targetFrame.contentDocument;
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
				}
			}catch(e){
				console.log('InsertImageDialog._ImgUploadResponse e:'+e);
			}

			if(errorMessage)
			{
				if(errorMessage == 'insert_image_server_error')
				{
					nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDialog");
		        	var insertImageErrorMsg = nls.imageDialog.insertImageErrorP1 + '<br>' +nls.imageDialog.insertImageErrorP2 
		                                      + '<br>' + nls.imageDialog.insertImageErrorP3 ;		        
		        	pe.scene.showErrorMessage(insertImageErrorMsg,10000);	
				}
				else
				{
					pe.scene.showErrorMessage(dojo.string.substitute(nls.imageDialog,maxImgSize,[errorMessage]),2000);
				}
				delete concord.widgets.InsertImageDialog._ImgUploadResponse;
				return;
			}
			
			if( !fileUrlFromServer )
			{
				//D27431: <BHT6>Insert image failed when the presentation is doing failover
				if(firsttime){
					firsttime = false;
				}else
				{
					clearTimeout(imageLoadingTimeOut);
					pe.scene.hideErrorMessage();
					nls = dojo.i18n.getLocalization("concord.widgets","InsertImageDialog");
		        	var insertImageErrorMsg = nls.imageDialog.insertImageErrorP1 + '<br>' +nls.imageDialog.insertImageErrorP2 
		                                      + '<br>' + nls.imageDialog.insertImageErrorP3 ;		        	        	
		        	setTimeout(function(){dojo.hitch(pe.scene,pe.scene.showWarningMessage(insertImageErrorMsg,5000));},600);
				}
				return;
			}
				
	    	if(callbackshow){
	    		clearTimeout(imageLoadingTimeOut);
	    		pe.scene.hideErrorMessage();
	    		callbackshow([fileUrlFromServer]);
	    	}
			delete concord.widgets.InsertImageDialog._ImgUploadResponse;
		};
		var targetFrame = dojo.byId(uploadImgTargetFrameId);
		if(!targetFrame){
	   		dojo.io.iframe.create(uploadImgTargetFrameId, "concord.widgets.InsertImageDialog._ImgUploadResponse()");
		}
   		if(targetFrame)
   		{
   			dojo.attr(targetFrame,"tabindex","-1");
   		}
		dojo.connect(this.dialog.domNode, "onclick", this, "setFocusHere");
		//D29365: [IE10]Restore Down IE, the length of tab control exceed the insert image dialog's frame.
		if(dojo.isIE){
			var formv = dojo.query('form',this.dialog.domNode)[0];
	    	var dialogWidth = this.IMAGE_DIALOG_TABCONTAINER_IE +"px";
	        if(formv){
	        	dojo.style(formv,'width',dialogWidth);
	        }  
	     }
		this.inherited( arguments );
	},
	
	setFocusHere: function(e){
		if (this.dialog.domNode.style.display != 'none') {
			dijit.focus(((e) && (e.target))? e.target :this.domNode);
			if(this._focusCallback){
				this._focusCallback();
			}
		}
	},
	
	postCreate: function(){
		var dlgId = this.dialogId;
		var fileTabId = this.FILE_TAB_ID;
		var clipartTabId = this.CLIPART_TAB_ID;
		var cancelId = this.CancelButtonID;
		var searchBoxId = this.SEARCHBOX_ID;
		var inputBoxId = this.inputBoxID;
		var okButtonId = this.OKButtonID;
		
		var w = dijit.byId(inputBoxId);
		if (w)
			w.domNode.tabIndex = 2;
		
		var okBtn = dojo.byId(okButtonId);
		if(okBtn)
			okBtn.title = this.oKLabel;
		
		var cancelBtn = dojo.byId(cancelId);
		if(cancelBtn)
			cancelBtn.title = this.cancelLabel;
		
		if(this.dialog.closeButtonNode)
			this.dialog.closeButtonNode.title = this.cancelLabel;
//		this.dialog._getFocusItems = function(domNode){
//			// The tab order is seeminling incorrectly calculated by the dojo code.
//			// Force the first/last order if necessary.
////			this.dialog.inherited(arguments);
//			if (dlgId == 'P_d_ClipArt') {
//				var tabWidget = dijit.byId("P_d_ClipArt_uploadTab");
//				if (tabWidget.selected) {
//					this._firstFocusItem = dojo.byId(fileTabId);
//				}
//				else {
//					this._firstFocusItem = dojo.byId(clipartTabId);
//				}
//				this._lastFocusItem = dojo.byId(cancelId);
//			}
//		};
		
//		this.dialog.setNextGalleryFocusElement = function(node,reverse) {
//			var box = dojo.byId(searchBoxId);
//			if (node == this._firstFocusItem && !reverse) {
//				box.focus();
//				return true;
//			}
//			else if (node == box && reverse) {
//				this._firstFocusItem.focus();
//				return true;
//			}
//			else{
//				var tabindex = dojo.attr(node,'tabindex');
//				if (!tabindex || tabindex == '-1'){
//					if (dojo.hasClass(node.parentNode,this.RESULT_BOX)){
//						// When we are focused on one of the items in the gallery, put the first child of the results 
//						// in focus (the one that has tabindex), so tabbing to the "OK" or "Cancel" button will work as expected
//						node.parentNode.firstChild.focus();  
//						return false;  // we do want to return false - since we want the tab to focus on the NEXT node, not what we just put focus on
//					}
//				}
//			}
//			return false;
//		};
//		
//		this.dialog.setNextFiletabFocusElement = function(node,reverse) {
//			var browseButton = dojo.byId(inputBoxId);
//			var okBtn = dojo.byId(okButtonId);
//			if (node == this._firstFocusItem && !reverse) {
//				browseButton.focus();
//				return true;
//			}
//			else if (node == browseButton && reverse) {
//				this._firstFocusItem.focus();
//				return true;
//			}else if(node == browseButton && !reverse){
//				okBtn.focus();
//				return true;
//			}else if(node == okBtn && reverse){
//				browseButton.focus();
//				return true;
//			}
//			return false;
//		};
//		
//		this.dialog.setNextFocusElement = function(node,reverse) {
//			// The brower tabbing doesn't work for some elements. This routine
//			// corrects that by forcing the focus in certain situations.
//
//			if (dlgId == 'P_d_ClipArt') {
//				var tabWidget = dijit.byId("P_d_ClipArt_uploadTab");
//				if (!tabWidget.selected) {
//					return this.setNextGalleryFocusElement(node,reverse);
//				}
//				else {
//					return this.setNextFiletabFocusElement(node,reverse);
//				}
//			}
//			return false;
//		};
	}
});

})();