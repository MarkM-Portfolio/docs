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

dojo.provide("concord.widgets.shareDocument");
dojo.require("concord.util.emailParser");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.require("dojo.string");
dojo.require("concord.widgets.typeahead.DocsSearchAdapter");
dojo.require("concord.widgets.typeahead.url");
dojo.require("concord.widgets.typeahead.services");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.widgets","shareDoc");
dojo.declare("concord.widgets.shareDocument", [concord.widgets.concordDialog], {
	
	titleShareDocument: null, 
	linkMsg: null, 
	shareMsg: null, 
	tipForShare: null ,
	successShareMsg: null,
	errorShareMsg: null,
	errorAcrossOrgMsg: null,
	errorCommunityShareMsg: null,
	sharetoauthorMsg: null,
	notTheAuthor: null,
	invalidInput: null,
	
	constructor: function() {
	},
	
	setDialogID: function() {
		this.dialogId = "C_d_ShareDocumentDialog";
	},	
	
	createContent: function (contentDiv) {
		var shareDoc = dojo.i18n.getLocalization("concord.widgets","shareDoc");
		this.titleShareDocument = shareDoc.titleShareDocument; 
		this.linkMsg = shareDoc.linkMsg;
		this.shareMsg = shareDoc.shareMsg;
		this.tipForShare = shareDoc.tipForShare;
		this.successShareMsg = shareDoc.successShareMsg;
		this.errorShareMsg = shareDoc.errorShareMsg;
		this.errorAcrossOrgMsg = shareDoc.errorAcrossOrgMsg;
		this.errorCommunityShareMsg = shareDoc.errorCommunityShareMsg;
		this.communityWarning = shareDoc.communityShareMsg;
		this.notTheAuthor = shareDoc.notTheAuthor;
		this.invalidInput = shareDoc.notFoundErrorMsg;
		this.sharetoauthorMsg = shareDoc.sharetoauthorMsg;
		if(pe.scene.bean.getIsExternal()){
			this.isExternalMsg = shareDoc.sharingOutsideOrgMsg;
		} else {
			this.isExternalMsg = shareDoc.notSharingOutsideOrgMsg;
		}
		this.sharingForVisitor = shareDoc.sharingForVisitor;
		var doc = dojo.doc;
		//Create layout table
		if(!pe.scene.bean.getIsCommunityFile()){
			var isExternal = false;
			if(!gIs_cloud && "lcfiles" == DOC_SCENE.repository){				
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
				if (response){
					var items = response.items;
					if(items && items[0]){					
						isExternal = items[0].isExternal;
					}
				}			
			}
			var layoutTable = dojo.create('table', {role:'presentation'}, contentDiv);
			var layoutTbody = dojo.create('tbody', null, layoutTable);
			var layoutTR1 = dojo.create('tr', null, layoutTbody);
			var layoutTR1TD = dojo.create('td', {colspan:'2'}, layoutTR1);
			dojo.addClass(layoutTR1TD, "shareDocumentLabelTD");
			var isExternalLabel = dojo.create('div', {id: 'sharedocInfoId_' + (new Date()).getTime(), style:'width: 35em; word-wrap: break-word;'}, layoutTR1TD);
			this.describedInfoId = isExternalLabel.id;
			isExternalLabel.appendChild(doc.createTextNode(isExternal ? this.sharingForVisitor: this.isExternalMsg));
			//var layoutTR1 = dojo.create('tr', null, layoutTbody);
			var layoutTR2 = dojo.create('tr', null, layoutTbody);
			//var layoutTR1TD1 = dojo.create('td', null, layoutTR1);
			//var layoutTR1TD2 = dojo.create('td', null, layoutTR1);
			var layoutTR2TD1 = dojo.create('td', null, layoutTR2);
			var layoutTR2TD2 = dojo.create('td', null, layoutTR2);
			//Set style to label
			//dojo.addClass(layoutTR1TD1, "shareDocumentLabelTD");
			dojo.addClass(layoutTR2TD1, "shareDocumentLabelTD");
		
			//Copy Link
			/*
			var nameLinkLabel = dojo.create('label', null, layoutTR1TD1);
			nameLinkLabel.appendChild(doc.createTextNode(this.linkMsg));
			dojo.addClass(nameLinkLabel, "concordDialogBold");
			//Link URL
			//var linkText = new dijit.form.SimpleTextarea({id: "C_d_ShareDocumentDialogdocumentLink", rows: 1});
			var linkText = new dijit.form.TextBox({id: "C_d_ShareDocumentDialogdocumentLink",style: dojo.isIE ? {'width': '100%','height':'14px'} : {'width': '100%'}});
			var currentLinkText = window.location.toString();
			linkText.setValue(currentLinkText);
			linkText.attr('disabled', true);
			dojo.addClass(linkText.domNode, "shareDocumentInputArea");
			layoutTR1TD2.appendChild(linkText.domNode);
			*/
			//Share With
			var emailLabel = dojo.create('label', null, layoutTR2TD1);
			emailLabel.appendChild(doc.createTextNode(this.shareMsg));
			dojo.addClass(emailLabel, "concordDialogBold");
			dojo.attr(emailLabel, 'for', 'C_d_ShareDocumentDialogemailAddress');
			//Email addresses
			if(gIs_cloud){
				var bssUrl = concord.widgets.typeahead.url.getServiceUrl(concord.widgets.typeahead.services.bss);
				var contactsUrl = "/contacts";
				contactsUrl = (bssUrl ? bssUrl + "/.." + contactsUrl : contactsUrl);
				var contactsTypeaheadUrl = contactsUrl + "/typeahead/people";			
				var adapter = new concord.widgets.typeahead.DocsSearchAdapter(contactsTypeaheadUrl);
				var opt = {
					_strings: null,
					noUpdateOnSelect: false,
					id: "C_d_ShareDocumentDialogemailAddress",
					//orient: dojo._isBodyLtr() ? {'BR':'TR', 'TR':'BR'} : {'BL':'TL', 'TL':'BL'},
					store: null,
					hintText: ""
				};
            
				var typeaheadDiv = dojo.create('div', null, layoutTR2TD2);
				var combo  = adapter.createTypeAhead(typeaheadDiv, opt);
				if (BidiUtils.isBidiOn()){
		        	var textDir = BidiUtils.getTextDir();
		        	if (textDir == "contextual"){
		        		dojo.connect(combo.domNode, 'onkeyup', dojo.hitch(this, function(){
		        			combo.domNode.dir = BidiUtils.calculateDirForContextual(combo.domNode.value);
					    }));
		        	} else
		        		combo.domNode.dir = textDir;
		        }
				dijit.setWaiState(combo.domNode,'required','true');
				dojo.addClass(combo.domNode, "shareDocumentInputArea");					
			}else{
				dojo["require"]("concord.widgets.ProfileTypeAhead");
				var emailText = new concord.widgets.ProfileTypeAhead({id: "C_d_ShareDocumentDialogemailAddress",isExternal: isExternal});
				dojo.addClass(emailText.domNode, "shareDocumentInputArea");
				layoutTR2TD2.appendChild(emailText.domNode);
				//make sure the attribute display of the input is set to "inline"
				dojo.byId("C_d_ShareDocumentDialogemailAddress").style.display = 'inline';
				if (BidiUtils.isBidiOn()){
		        	var textDir = BidiUtils.getTextDir();
		        	if (textDir == "contextual"){
		        		dojo.connect(emailText.textbox, 'onkeyup', dojo.hitch(this, function(){
		        			emailText.textbox.dir = BidiUtils.calculateDirForContextual(emailText.textbox.value);
					    }));
		        	} else
		        		emailText.textbox.dir = textDir;
		        }

				dijit.setWaiState(emailText.textbox,'required','true');
				dojo.connect(emailText.textbox, "onkeypress", dojo.hitch(this, this.onKeyPress));			
			}		
//			var tipShareWithDiv = dojo.create('div', null, contentDiv);
//			var textNode = doc.createTextNode(this.tipForShare);
//			tipShareWithDiv.appendChild(textNode);
//			dojo.addClass(tipShareWithDiv, "shareDocumentTipShareWith");
		}else{
			var communityLabel = dojo.create('label', {id: "sharedocInfoId_" + (new Date()).getTime() }, contentDiv);			
			this.describedInfoId = communityLabel.id;
			communityLabel.innerHTML = dojo.string.substitute(this.communityWarning, {title:pe.scene.bean.getTitle()});
			this.visible = false;
		}  
		
	},
	
	reset: function () {
//		dijit.byId("C_d_ShareDocumentDialogdocumentLink").setValue(window.location.toString());
		var address = dijit.byId("C_d_ShareDocumentDialogemailAddress");
		if(address)
			address.setValue('');
		//Check share priviledge, if user is not the owner of the document, can't share this doc to other editors
		var owner = pe.scene.bean.getOwner();
		var user = pe.authenticatedUser.getId();
		if ((owner != user) && (!pe.scene.bean.getIsCommunityFile())) {
			this.setWarningMsg(this.notTheAuthor);
			var msgId = this.warnMsgID + this.dialogId;
			var msgNode = dojo.byId(msgId);
			if(msgNode){
				dojo.removeAttr(msgNode,'role');
				dijit.setWaiState(this.dialog.domNode,'describedby', msgId);
			}						
			
			if(address)
				address.setAttribute('disabled', true);
			var okBtn = dijit.byId(this.OKButtonID);    
			okBtn.setAttribute('disabled', true);               
		}
	},
	
	onOk: function (editor) {		
		// TODO: we should also support user to input a email address directly, instead of selecting one from type ahead result
//		var owner = pe.scene.bean.getOwner();;
//		var user = pe.authenticatedUser.getId();
//		if (owner != user) {
//			this.setWarningMsg(this.notTheAuthor);
//			return false;
//		}
		
		if(window.g_presentationMode){
			window.pe.scene.validResize = true;
		}
		
		if(pe.scene.bean.getIsCommunityFile()){
			return true;
		}
		var typeAhead = dijit.byId("C_d_ShareDocumentDialogemailAddress");
	  
		var shareto = new Array();
		var userId = "";  
		var invalid = gIs_cloud ? (!typeAhead.selectedItem || !typeAhead.selectedItem.i)
	                                          : (!typeAhead.item || !typeAhead.item.i || !typeAhead.item.i.value); 
		var showWarning = true;
		if(invalid){
			if(!gIs_cloud){		
				var reMail = /^(?:[a-z\d]+[_\-\+\.]?)*[a-z\d]+@(?:([a-z\d]+\-?)*[a-z\d]+\.)+([a-z]{2,})+$/i;		
				var p = typeAhead.getValue();
				if(p){			
					p = p.replace(/^\s*/, "").replace(/\s*$/, "");
					if (reMail.test(p)) {
						var url = "/files/form/api/people/feed?format=json";
						dojo.xhrPost({
							url: url,
							headers: { 'X-Method-Override': 'GET'},
							handleAs: "json",
							sync: true,						
							postData: dojo.objectToQuery({ 'email': [p]}),
							handle: function(response, ioArgs) {
								if (response && dojo.isArray(response.items) && response.items.length > 0) {
									for(var i = 0; i < response.items.length; i++){
										//1. email is hidden (returned as "") if the email owner and current user are not in the same organization
										//2. services ensure that they will return results with exactly the same sequence we requested
										//3. returned item will not have id if the email is not yet part of the system
										var item = response.items[i];
										if (item.id){
											var isVisitor = item.isExternal;
											if(isVisitor && !pe.scene.bean.getIsExternal()){
												showWarning = true;
											}else{												
												var temp = {
														"id": item.id,
														"role": "CONTRIBUTOR"
												};
												shareto.push(temp);
												showWarning = false;											
											}
										}
									}
								}
							}
						});						
					}
				}
			}
        	
			if(showWarning){
				this.setWarningMsg(this.invalidInput);
				dijit.setWaiState(typeAhead.focusNode, "invalid", true);
				return false;                   		
			}
		}else{       	
			if(gIs_cloud){
				if(typeAhead.selectedItem){
					var person = typeAhead.selectedItem.i;
					if(person) {
						// Hack to remove "u_" prefix from LotusLive ids
						var id = person.i;
						if(id && id.indexOf("u_") == 0)
							id = id.substring(2);
						// contacts do not have a directory id, so e-mail is used instead
						else if(id && id.indexOf("c_") == 0)
							id = "";
						userId = id;
					}
				}
			}else{
				userId = typeAhead.item.i.value; 
			}
        	
			var temp = {
				"id": userId,
				"role": "CONTRIBUTOR"
			};
			shareto.push(temp);
		}
        
		var bean = pe.scene.bean;
		var data = {
			"shareTo": shareto
		};
		
		var url = concord.util.uri.getDocUri() + '?method=share';

		var sData = dojo.toJson(data);
		if(shareto.length == 0){
			pe.scene.showTextMessage(this.successShareMsg,15000);
		}else if(userId == pe.authenticatedUser.getId())
		{
			this.setWarningMsg(this.sharetoauthorMsg);
			return false;                       			
		}else if (shareto.length > 0) {
            var response, ioArgs;
            dojo.xhrPost({
                url: url,
                handleAs: "json",
                handle: function(r, io){
                    response = r;
                    ioArgs = io;
                },
                sync: true,
                contentType: "text/plain",
                postData: sData
            });
            if (ioArgs == undefined || ioArgs.xhr.status != 200) {
    	    	var owner = pe.scene.bean.getOwner();
    	        var user = pe.authenticatedUser.getId();
    	        if ((owner != user) && (!pe.scene.bean.getIsCommunityFile())) {
    	            this.setWarningMsg(this.notTheAuthor);
    	            return false;
    	        }      	
            	this.setWarningMsg(this.errorShareMsg);
                return false;
            }
            else{
            	if(response){
            		var error_code = response.error_code;
            		if (error_code && error_code == 1008) {
            			this.setWarningMsg(this.errorCommunityShareMsg);
            			return false;                       
            		}else if(error_code && error_code == 1009){
            			this.setWarningMsg(this.errorAcrossOrgMsg);
            			return false;  
            		}
            	}				
            	pe.scene.showTextMessage(this.successShareMsg,15000);
            	var newUserInfo = ioArgs.query;
            	this.publishShareSuccess(newUserInfo);
            }
        }
		
		return true;
	},
	
	show: function () {
		this.inherited(arguments);
		var setFocus = function(){
			var addressDomNode = dojo.byId("C_d_ShareDocumentDialogemailAddress");
			if(addressDomNode)
				dijit.selectInputText(addressDomNode);
		};
		setTimeout(setFocus,300);
	},
	
	calcWidth: function() {
		return "450px";//share with dialog needs more size
	},
	
	onCancel: function (editor) {
  		if(window.g_presentationMode){
  			window.pe.scene.validResize = true;
  		}
		return true;
	},
	publishShareSuccess: function(userInfo){
		var eventData = [{eventName:concord.util.events.presDocSceneEvents_eventName_docShare,newUserInfo:userInfo}];
		concord.util.events.publish(concord.util.events.presSceneEvents, eventData);
	}

});
