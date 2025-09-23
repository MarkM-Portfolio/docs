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

dojo.provide("concord.widgets.LotusUploader");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojox.NodeList.delegate");
dojo.require("concord.widgets.LotusTextButton");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.widgets","LotusUploader");

dojo.declare('concord.widgets.LotusUploader', [dijit._Widget,dijit._Templated], {
	typeImgPath : '/images/ftGraphic16.png',
	inputBoxId : "S_d_InsertImageInputFile",//hidden textbox
	browseId: "InsertImageButtonId",
	nls:null,	
	inputFile:null,	
	fileDiv:null,
	filepath:null,
	
	templateString:"<table class='uploaderTable' dojoAttachPoint='uploaderRootNode' cellpadding='0' role='presentation'>" +
			"<tbody><tr><td class='uploaderLabel'><label dojoAttachPoint='labelNode'></label></td><td class='uploaderButton'><div dojoAttachPoint='uploaderNode'></div></td></tr></tbody></table>",
	
	postCreate: function(){	
		this.inherited(arguments);
		this._initUploader();
		this._createContent();	
		this._onload_hdl(); 
	},
	
	_initUploader: function(){
		this.nls = dojo.i18n.getLocalization("concord.widgets","LotusUploader");
		this.labelNode.innerHTML = this.nls.btnUpload;
	},

	_createContent: function(){
		var uploaderDiv = dojo.create('div', null, this.uploaderNode);	
		
		var fileDiv = dojo.create('div', null, uploaderDiv);
		dojo.addClass(fileDiv, "uploaderFile");
		dojo.style(fileDiv,"display","none");
		//image type icon
		var typeImg = dojo.create('img', null, fileDiv);
		typeImg.setAttribute("src", contextPath + window.staticRootPath + this.typeImgPath);
		dojo.addClass(typeImg, "uploaderTypeImg");
		dojo.attr(typeImg, 'alt', '');
		//image filepath or name
		this.filepath = dojo.create('div', null, fileDiv);
		dojo.addClass(this.filepath, "uploaderFilepath");	
		
		this.fileDiv = fileDiv;
		
		var inputDiv = dojo.create('div', null, uploaderDiv);		
		//Hidden textbox, used to store image's filepath or filename  	 			
		var inputBox = new dijit.form.ValidationTextBox({
    		type: "file",
    		title: this.nls.browse,
    		id: this.inputBoxId,
    		name: "uploadInputFile"}); 
			
		inputBox.domNode.style.opacity = '0';
		dojo.attr(inputBox.textbox,'tabIndex','-1');
		dojo.attr(inputBox.textbox, 'accept', 'image/*');		
		dojo.connect(inputBox.domNode,"onchange",dojo.hitch(this, this._upload));
		//upload button
		var browseBtn = new concord.widgets.LotusTextButton({
   		 	 id: this.browseId,
   		 	 label: this.nls.browse,
   		 	 name: "uploadInputFile"			 
			 }); 
		dojo.style(browseBtn.domNode, {'position':'absolute'});	
		dijit.setWaiState(browseBtn.focusNode, 'label',this.nls.tipsBrowse);
		dojo.connect(browseBtn.domNode, "onkeydown", dojo.hitch(this, this._onKeyPress, this.browseId));
   	      	        	    
		inputDiv.appendChild(browseBtn.domNode); 	 	
		inputDiv.appendChild(inputBox.domNode);  
		setTimeout(function() { 
			var width =	(browseBtn.domNode.clientWidth -4) +'px';
			var height = browseBtn.domNode.clientHeight+ 'px'; 	
			if(dojo.isIE){
				var node = browseBtn.titleNode.parentNode;
				width =  node.clientWidth +'px';
			}
			dojo.style( inputBox.domNode,  {'width': width,'height': height });	
			dojo.style(inputBox.textbox,{'height': height});
		}, 0); 
    		
		this.inputFile = inputBox;	
	},
	
	_onload_hdl: function(){
		this.inputFile.isEmpty = function(){
			return this._isEmpty(this.textbox.value);
		};		
	},
			
	_onKeyPress: function(id, e){
		e = e || window.event;
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		if (e.keyCode != dojo.keys.ENTER) return; 
        
		if(id == this.browseId){
			if(!dojo.isIE){	
				dojo.byId(this.inputBoxId).click(); 
			}
		}
		dojo.stopEvent(e); 
	},
	
	_getUploadedFileName: function(path){
		var p1 =path.lastIndexOf('/');
		var p2 =path.lastIndexOf('\\');
		var pos = Math.max(p1,p2);
		if(pos < 0) return path;
		else return path.substring(pos+1); 	
	},
	
	_getFileExtension: function(filename){
		var pos =filename.lastIndexOf('.');
		if(pos < 0) return filename;
		else return filename.substring(pos+1);
	},
	
	trim : (function(){
		// We are not using \s because we don't want "non-breaking spaces" to be caught.
		var trimRegex = /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g;
		return function( str )
		{
			return str.replace( trimRegex, '' ) ;
		};
	})(),
		
	_upload: function(){
		var loadedStatus = null;
		var value = this.inputFile.textbox.value;
		if(!value || this.trim(value) == '')
		{
			 dojo.style(this.fileDiv,"display","none");
			 loadedStatus = [{valid: false, errorMsg: this.nls.emptyImage}];
			 dojo.publish(concord.util.events.uploader_loaded, loadedStatus);
			 var bNode = dojo.byId(this.browseId);
			 if(bNode) bNode.focus();			 
			 return;
		}
		dojo.style(this.fileDiv,"display","block");
		//value and title
		this.filepath.title = value;
		value = this._getUploadedFileName(value);
		this.filepath.innerHTML = value;
		if (BidiUtils.isBidiOn())
			dojo.attr(this.filepath, "dir","ltr");
		if (BidiUtils.isGuiRtl())
			dojo.attr(this.filepath, "align",'right');
		//publish event
		var msg = this.nls.unsupportedImage;
		if(BidiUtils.isGuiRtl() && g_locale.substr(0,2) == 'ar')
			msg = msg.replace(/\./g, BidiUtils.LRE + "." + BidiUtils.PDF);

		loadedStatus = [{valid: this._isValidImageType(value), errorMsg: msg }];
		dojo.publish(concord.util.events.uploader_loaded, loadedStatus);
		//focus
		var bNode = dojo.byId(this.browseId);
		if(bNode) bNode.focus();				
	},	
	
	_isValidImageType: function(value){
		var ext = this._getFileExtension(value.toLowerCase());
		var regExp = /^(jpg|jpeg|gif|png|bmp)$/
		return ext.match(regExp);
	},
	
	getInputBox: function(){
		return this.inputFile;
	},
	
	isValid: function(){
		var value = this.inputFile.textbox.value;
		if(!value || this.trim(value) == '') return false;
		value = this._getUploadedFileName(value);
		return this._isValidImageType(value);
	},
	//unit em
	setCustomWidth: function(wNum){
		if(!wNum){
			return;
		}
		var pos = wNum.indexOf("em");
		if(pos > -1){
			wNum = wNum.substring(0,pos);
		}
		var pos2 = wNum.indexOf("pt");
		if(pos2 > -1){
			wNum = 30;
		}					
		if(wNum <30) wNum = 30;
		dojo.style(this.uploaderRootNode,'width',wNum +"em");
		//image filepath or name
		dojo.style(this.filepath,'width',(wNum-10) +"em");
				
	}
});