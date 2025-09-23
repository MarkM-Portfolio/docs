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

dojo.provide("concord.widgets.EncryptPwdValidatorDlg");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("concord.widgets.concordDialog");
dojo.require("dojox.form.PasswordValidator");
dojo.require("dijit.form.ValidationTextBox");
dojo.require("dijit.form.Form");

dojo.requireLocalization("concord.widgets", "EncryptPwdValidatorDlg");

dojo.declare("concord.widgets.EncryptPwdValidatorDlg", [concord.widgets.concordDialog], {
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
    DIALOG_TITLE: null,
    DNCRYPTED_INFO: null,    
    PASSWORD_LABEL: null,
    INVALID_MESSAGE: null,
    ERROR_MESSAGE: null,
    ERROR_FEEDBACK_MSG: null,
    SUBMIT_ErrMsg: null,
    MSG_PARENT_ID: "id_errormsg",
    MSG_ID: "id_errormsgbody",
    _scene: null,
    _form: null,
    formFailed: false,        
    connectArray : [],
    
    constructor: function(editor, title, okLabel, visible,params, formParams){
		this.closeVisible = false;
		this.inherited( arguments );
		
        this.editor = editor;
        var dialog = this.dialog;
        if(title){
        	this.DIALOG_TITLE = title;        	        	
        }else{
        	this.DIALOG_TITLE = this.nls.DIALOG_TITLE;
        }
		dialog.titleNode.innerHTML = this.DIALOG_TITLE;		
    },

    _setNLSStr: function(){
        this.nls = dojo.i18n.getLocalization("concord.widgets", "EncryptPwdValidatorDlg");
        if (this.nls) {
            this.DNCRYPTED_INFO = this.nls.DNCRYPTED_INFO;
            this.PASSWORD_LABEL = this.nls.PASSWORD_LABEL;
            this.INVALID_MESSAGE = this.nls.INVALID_MESSAGE;
            this.ERROR_MESSAGE =  this.nls.ERROR_MESSAGE;
            this.ERROR_FEEDBACK_MSG = this.nls.ERROR_FEEDBACK_MSG;
            this.SUBMIT_ErrMsg = this.nls.SUBMIT_ErrMsg;
        }
    },
    
	setDialogID: function() {
		this.dialogId = "C_d_EncryptPwdValidatorDialog";
	},
			
    createContent: function(contentDiv){
        this._setNLSStr(); 
        var tableDiv = dojo.create('div', null, contentDiv);
        var layoutTable = dojo.create('table', {
            width: '400px',
            align: 'center'
        }, tableDiv);
        var layoutTbody = dojo.create('tbody', null, layoutTable);
        
        //create waring message
        var row = dojo.create('tr', null, layoutTbody);
        var cell = dojo.create('td', {
            width: '100%'
        }, row);
        this.createErrorMsg(this.ERROR_MESSAGE,{id:this.MSG_PARENT_ID},cell);  
                
        row = dojo.create('tr', null, layoutTbody);
        cell = dojo.create('td', {
                width: '100%'
            }, row);          
        dojo.addClass(cell, 'concordEncryptedPwdSpacing');    
        this.createLabel(this.DNCRYPTED_INFO, cell);
  
        row = dojo.create('tr', null, layoutTbody);
        cell = dojo.create('td', {
                width: '100%'
            }, row);  
   		dojo.addClass(cell, 'concordEncryptedPwdSpacing');              
        this.createPwdValidator(cell);   
        
        
         this._form = dojo.byId('id_decryption_form');  
         var submitConn = dojo.connect(this._form, "onsubmit", dojo.hitch(this, function(e) {
         			e.preventDefault();
         			var pswd = dijit.byId('C_d_password');   	
    				if(!pswd || pswd.getValue() == '') {
    					this.errorShow();    		 			
    				}else{           			                                                                       
    					this.submitForm(); 
    				}
                }));    
         this.connectArray.push(submitConn);                                    
    },
    submitForm: function(){
    	//Stop the submit event since we want to control form submission.
        var parent = this;         
    	var xhrArgs = {
			form: dojo.byId("id_decryption_form"),
			handleAs: "json",
			sync: true,
			load: function(data) {                      	
				console.log(data);
				if(data.status == 'converting'){
					DOC_SCENE.jobId = data.jobid;
					console.log(DOC_SCENE.jobId);
					parent._scene.queryJob();
				}else if(data.status == 'success'){
					parent._scene.staged(true);
				}	
				parent.formFailed = false;			
			},
			error: function(error) {
				parent.formFailed = true;
				parent.errorReset();
			}
    	};                
    	var deferred = dojo.xhrPost(xhrArgs);
    },
    
    createPwdValidator: function(container){
    	
    	this.createPassword(this.PASSWORD_LABEL + ' ', { type: 'password', name:'docpwd', required: true, id:'C_d_password',intermediateChanges: false
    	 ,invalidMessage: '', missingMessage: '', trim: false, style:{'width': '15em'}}, container);     	 
  
    	dojo.create('input', {type: 'hidden', name:'repoid',value: DOC_SCENE.repository}, container);
    	dojo.create('input', {type: 'hidden', name:'docuri',value: DOC_SCENE.uri}, container);
    	if(DOC_SCENE.version != undefined){
    		dojo.create('input', {type: 'hidden', name:'version',value: DOC_SCENE.version}, container);
    	}
    },

	
	createPassword: function(pLabel, attributes, container){
		var labelDiv = this.createLabel(pLabel, container);
		dojo.attr(labelDiv,'for','C_d_password');
		var inputBox = new dijit.form.ValidationTextBox(attributes);
		if (attributes.style)
			dojo.attr(inputBox.domNode, attributes.style);
			
		var kpConn = dojo.connect(inputBox.textbox, "onkeypress", dojo.hitch(this, this.onKeyPress));
		var ocConn = dojo.connect(inputBox, "onChange", dojo.hitch( this, function(){
			dijit.setWaiState(inputBox.textbox, "invalid", false);
		}));
		this.connectArray.push(kpConn); 
		this.connectArray.push(ocConn); 
		 		
		inputBox.focus();
		labelDiv.appendChild(inputBox.domNode);	
		this.createErrorIcon(labelDiv); 
	},   
	
	createErrorIcon: function(container){
		var img = dojo.create('img', 
			{
				src: contextPath + window.staticRootPath + '/js/dojo/resources/blank.gif',
				alt: 'Error',
				id:'id_imageicon'
			}
			, container);
		img.style.display ='none';	
		dojo.addClass(img,'concordEncryptedPwdIcon2');
		dojo.addClass(img, 'yourProductSprite yourProductSprite-msgError16');		
	},
	
	createErrorMsg : function (content, msgDivId, container) {
		var parentDiv = dojo.create('div', msgDivId, container);
		dojo.attr(parentDiv, "contenteditable", "false");
		dojo.attr(parentDiv, "unselectable", "on");			
			
		dojo.addClass(parentDiv,'concordEncryptedPwdError');
		dojo.attr(parentDiv, 'role', 'status');
			
		var img = dojo.create('img', 
			{
				src: contextPath + window.staticRootPath + '/js/dojo/resources/blank.gif',
				alt: 'Error'
			}
			, parentDiv);
		dojo.addClass(img,'concordEncryptedPwdIcon');
		dojo.addClass(img, 'yourProductSprite yourProductSprite-msgError16'); 
			
		var bodyDiv = dojo.create('div', {id:this.MSG_ID}, parentDiv);
			
		dojo.attr(bodyDiv, "contenteditable", "false");
		dojo.attr(bodyDiv, "unselectable", "on");					
			
		dojo.addClass(bodyDiv, 'concordEncryptedPwdBody');
		bodyDiv.innerHTML = content;
		parentDiv.style.display = 'none';   		
	},   
	 
    createLabel: function(text, container){
        var label = dojo.create('label',null, container);
        label.appendChild(dojo.doc.createTextNode(text));
        return label;
    },	
    
    errorShowCallback: function(){
        var errorDiv = dojo.byId(this.MSG_PARENT_ID);
        if(errorDiv){
        	errorDiv.style.display = 'block';
        	var msg = dojo.byId(this.MSG_ID);
        	if(msg){
        		msg.innerHTML = this.formFailed ? this.SUBMIT_ErrMsg : this.ERROR_FEEDBACK_MSG;
        	}
    	}     	
        this.clearPassword();   	    	
    },
    
    errorShow: function(){
        var errorDiv = dojo.byId(this.MSG_PARENT_ID);
        if(errorDiv){
        	errorDiv.style.display = 'block';
        	var msg = dojo.byId(this.MSG_ID);
        	if(msg){
        		msg.innerHTML = this.ERROR_MESSAGE;
        	}
        }      	     	
        this.clearPassword();
    },
    
    clearPassword: function(){
    	dijit.byId("C_d_password").setValue('');    	
    	var hintIcon = dojo.byId('id_imageicon');
    	if(hintIcon){
    		hintIcon.style.display = '';
    	}    	
    },
    
	errorReset: function(){ 
		this.errorShowCallback();
		this.disabledButtons(false);
		this.hideProcessImg();
		this.setFocus();
	},
	
	setFocus: function(){
		var inputNode = dijit.byId("C_d_password");
		if(inputNode) {
			inputNode.focus();
		}	
	},
	
	setScene: function(scene){
		this._scene = scene;
	},
	
	disabledButtons: function(disabled){
		var okBtn = dijit.byId(this.OKButtonID);	
		okBtn && okBtn.setAttribute('disabled', disabled);	 		
	},
	
    onOk: function(editor){
    	var pswd = dijit.byId('C_d_password');
    	if(typeof pswd == 'undefined') return false;
    	
    	if(!pswd || pswd.getValue() == '') {
    		this.errorShow();
    		return false;
    	}    	  	
    	this.submitForm();	
    	if(!this.formFailed){
    		this.showProcessImg();
        	this.disabledButtons(true);    		
    	}
        return false;    
    },       
    
    onCancel: function(editor){ 
//      dojo.disconnect(this._textbox); 
//      dojo.disconnect(this._form); 
//		this._destroy();
//		return true;           
    },
    
	onKeyPress: function (e) {
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		if (e.keyCode == dojo.keys.ENTER){
			this.onOk(this.editor);	
		}
	},
	
	destory: function(){
        //Close this doc  
		for(var i=0; i<this.connectArray.length; i++){
			dojo.disconnect(this.connectArray[i]);			
		}  
		this.connectArray = null;  
		// override the hide function again to enable fadeOut feature
		// before destroy this dialog 		
		this.hide = this.inherited('hide',arguments);
		this._destroy();
	},
	
	show: function() {
		this.inherited(arguments);		
		// override the hide function to disable ESC key
		// for more detail, refer dijit.Dialog 
		this.dialog._hide_ = this.dialog.hide;
		this.dialog.hide = function() {
			// do nothing
		}
	},	
	
	hide: function() {
		if(this.dialog == null) return;		
		this.dialog._hide_();
	}
});
