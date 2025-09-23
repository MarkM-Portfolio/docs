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

dojo.provide("concord.actionNewDoc");
dojo.require("com.ibm.social.layout.DeferredAction");
dojo.require("lconn.share.widget.LotusDialog");
dojo.require("lconn.share.util.validation");
dojo.require("lconn.share.util.configUtil");
dojo.requireLocalization("lconn.files", "action");

dojo.provide("com.ibm.concord.lcext.NewConcordBase");
dojo.declare("com.ibm.concord.lcext.NewConcordBase", com.ibm.social.layout.DeferredAction, {
	actionClass : "com.ibm.concord.lcext.NewConcordBase",
	defaultIsExternal : false,
	showShare : true,
	connectArray : [],
	 
	constructor : function(app, opts) {
		this.filesnls = dojo.i18n.getLocalization("lconn.files", "action").UPLOAD_FILE;
		//		if (opts.nls) 
		//			dojo.mixin(this.filesnls, opts.nls);
		this.setTypeString();
		this.setNlsString();
		this.app = app;
		this.name = this.nls_Name;
		this._isExternalSupported = !!dojo.getObject("lconn.share.config.features.sharingIntent");
		this.tooltip = this.nls_Tooltip;
		this.dialog = null;
		//tooltipfixme : "Create a new Concord Document"; //DON"T CHANGE, hachish code  for showing concord icon
	},

	//Will be overrided by subclass
	setTypeString : function() {
		this.typestr = '';
		this.typeurl = '';
		this.typeext = '';
	},
	
	getTypeExt : function() {
		var typeext = this._getTypeExt();
		if(typeext){
			this.typeext = typeext;
		}
		return this.typeext;
	},

	//Will be overrided by subclass	
	setNlsString : function() {
		this.nls_Name = '';
		this.nls_Tooltip = '';
		this.nls_DialogTitle = '';
		this.nls_DialogContent = '';
		this.nls_DialogBtnOK = '';
		this.nls_DialogBtnOKTitle = '';
		this.nls_DialogBtnCancel = '';
		this.nls_DialogIllegalErrMsg = '';
		this.nls_DialogNoNameErrMsg = '';
		this.nls_DialogDupErrMsg = '';
		this.nls_DialogInitialName = '';
		this.nls_DialogNoPermissionErrMsg = '';
		this.nls_DialogServerErrMsg = '';
		this.nls_DialogServerErrMsg2 = '';
		this.nls_DialogNamepre = '';
		this.nls_DialogProblemidErrMsg = '';
		this.nls_DialogProblemidErrMsgShow = '';
		this.nls_DialogProblemidErrMsgHide = '';
	},

	//Will be overrided by subclass		
	createEmptyDoc : function(newname, isExternal, propagate, context) {
		return {};
	},
	
	getDocContext : function() {
		//    app.getContext(itemType, action, checkPermission) - itemType: file; action: create; checkpermission: true    
		//    return possible values:    
		//    {type: "pinnedfiles", value: true}
		//    {type: "pinnedfolders", value: true}
		//    {type: "folder", value: "88361d34-601b-4714-84fc-2d2a0a7bc33b", collectionType: "personal", visibility: "public", isExternal: false}
		//    {type: "folder", value:  collectionId, collectionType: "community"};
		//    {type: "sync", value:  true}
		//    null
		return this.app.getContext ? this.app.getContext("file", "create", true) : null;	
	},

	isVisible : function(selection, context) {

		if (this.app.declaredClass === "lconn.files.comm.ReferentialWidget") {
			var user = this.app.getAuthenticatedUser();
			return user && user.permissions && this.app.getLibrary(true) && user.permissions.canUploadToCommunity();
		} else {
			return (this.app.authenticatedUser && selection[0].id == this.app.authenticatedUser.id);
		}

	},
	destroyDialog : function() {
		if (this.dialog) {
			this.dialog.cancel();
			this.dialog.hide();
			this.dialog.destroyRecursive();
			this.dialog = null;
			this.clearResources();
		}
	},
	clearResources: function() {
		this.internalWarningMsg = null;
		//remove dojo connections
		for(var i=0; i<this.connectArray.length; i++){
			dojo.disconnect(this.connectArray[i]);			
		}			
	},	
	destroy : function() {
		this.inherited(arguments);
		this.destroyDialog();
	},

	isExternal : function(dialog) {
		if (!this._isExternalSupported || !(this.app.declaredClass === 'lconn.files.PersonalFiles'))
			return false;
		if (concord.global.shouldShowExternal(this.app) && dialog && dialog.extChkBox)
			return dialog.extChkBox.checked;
		else
			return this.defaultIsExternal;
	},

	isPropagateEnabled : function(dialog) {
		var isReshareable = lconn.share.util.configUtil.getResharingDefault(this.app.authenticatedUser);
		return (dialog && dialog.shareFilePropagate) ? dialog.shareFilePropagate.checked : isReshareable;
	},
	
	updateInternalWarning : function(dialog) {
		if (concord.global.shouldShowExternal(this.app)) {
			var setExternal = this.isExternal(dialog);

			if (!setExternal && !this.internalWarningMsg) {
				var msg = this.internalWarningMsg = {};
				msg.warning = true;
				msg.message = concord.global.nls.WARN_INTERNAL;
				dialog.msgContainer.add(msg);
			} else {
				if (this.internalWarningMsg) {
					dialog.msgContainer.remove(this.internalWarningMsg);
					this.internalWarningMsg = null;
				}
			}
		}
	},
	
	trimName : function() {
		if (this.dialog && this.dialog.nameNode) {
			var el = this.dialog.nameNode;
			var input_text = el.value;
			input_text = lconn.share.util.text.trim(input_text);
			var bytesExt = lconn.share.util.text.lengthUtf8(this.typeext);
			var bytesForName = lconn.share.util.validation.FILENAME_LENGTH - bytesExt;
			var i = lconn.share.util.text.getCharIndexForUtf8Index(input_text, bytesForName);
			if (i != -1){
				el.value = input_text.substring(0, i);
			}
			var errorContainer = dojo.byId("concordduplicate" + this.typestr);
			errorContainer.innerHTML = "";
			var errorContainerTr = dojo.byId("concordduplicate" + this.typestr + "tr");
	        errorContainerTr.style.display="none";
		}
	},
	showMsg : function(){
		var node = dojo.byId("problem_id");
		var nodeDisplay = dojo.style(node, "display");
		console.log( nodeDisplay  );
		if(nodeDisplay && nodeDisplay == "none")
		{
			dojo.style(node, "display", "block");
			dojo.byId("problem_toggle").innerHTML = this.nls_DialogProblemidErrMsgHide ;
		}
		else
		{
			dojo.style(node, "display", "none");
			dojo.byId("problem_toggle").innerHTML = this.nls_DialogProblemidErrMsgShow ;
		}
	},
	showProblemID : function(errorContainer,problem_id){
		var doc = document;
		var div = doc.createElement("div");
		div.appendChild(doc.createTextNode(this.nls_DialogProblemidErrMsg));
		var a = doc.createElement("a");
		a.href = "javascript:;";
		a.id = 'problem_toggle';
		dojo.style(a, 'text-decoration', 'none');
		dijit.setWaiRole(a, "button");
		a.appendChild(doc.createTextNode(this.nls_DialogProblemidErrMsgShow));
		dojo.connect(a, "onclick", this, "showMsg");
		var span = doc.createElement("span");
		span.id = 'problem_id';
		dojo.style(span, 'word-break', 'break-all');
		dojo.style(span, 'word-wrap', 'break-word');
		dojo.style(span, 'color', '#222222 !important');
		dojo.style(span, 'font-weight', 'lighter');
		dojo.style(span, 'display', 'none');
		span.appendChild(doc.createTextNode(problem_id));
		div.appendChild(a);
		div.appendChild(span);
		errorContainer.appendChild(div);
	},
	
	getFormatSetting : function(docType) {
		 var settings = concord.global.getDocsPreferences(docType, this.app.getAuthenticatedUserId());
		 if(settings && settings["file_format"]){
			  return settings["file_format"];
		 }
		 return null; 
	},
	
	execute : function(item, opt) {
		this.destroyDialog();
		if(concord.global.isNeedDocsSAML() && !concord.global.haveDocsLTPA())
		{// try to new a document but did not sign in yet. do SSO here as post can not be handled by TFIM.
			concord.global.doDocsSSO();
		}
		var dialog = this.dialog = new lconn.share.widget.LotusDialog({
			contextBase : this,
			title : this.nls_DialogTitle,
			contentClass : "lotusDialogContent",
			buttonOk : this.nls_DialogBtnOK,
			buttonOkTitle : this.nls_DialogBtnOKTitle,
			buttonCancel : this.nls_DialogBtnCancel,
			_size : function() {
			},
			// Fixed dialog size
			onExecute : function() {
				var el = this.nameNode;
				var input_text = el.value;		
				var errorContainer = dojo.byId("concordduplicate" + this.contextBase.typestr);
				errorContainer.innerHTML = "";
				var errorContainerTr = dojo.byId("concordduplicate" + this.contextBase.typestr + "tr");
		        errorContainerTr.style.display="none";
				if (dojo.trim(input_text) == "") {
					errorContainer.innerHTML = this.contextBase.nls_DialogNoNameErrMsg;
					errorContainerTr.style.display="";
					dialog.keepOpen();
					return;
				}
				if (!/^([^\\\/\:\*\?\"\<\>\|]+)$/.test(input_text)) {
					var msg = dojo.string.substitute(this.contextBase.nls_DialogIllegalErrMsg, [ input_text ]);
					msg = msg.replace(/</g, "&lt; ").replace(/>/g, "&gt; ");
					errorContainer.innerHTML = msg;
					errorContainerTr.style.display="";
					dialog.keepOpen();
					return;
				}
				var typeExt = this.contextBase.getTypeExt();
				var bytesExt = lconn.share.util.text.lengthUtf8(typeExt);
				var bytesForName = lconn.share.util.validation.FILENAME_LENGTH - bytesExt;
				if (!lconn.share.util.validation.validateTextLength(input_text, bytesForName)){
					var d = document;
					errorContainer.appendChild(d.createTextNode(concord.global.nls.newDocumentDialog_WARN_LONG_DOCUMENTNAME));
					errorContainer.appendChild(d.createTextNode(" "));
				    var a = d.createElement("a");
				    a.href = "javascript:;";
				    dijit.setWaiRole(a, "button");
				    dojo.connect(a, "onclick", this.contextBase, "trimName");
				    a.appendChild(d.createTextNode(concord.global.nls.newDocumentDialog_TRIM_LONG_DOCUMENTNAME));
				    errorContainer.appendChild(a);
				    errorContainerTr.style.display="";
				    dialog.keepOpen();
				    return;
				}
				
				var ndname = dojo.byId("concordnewfile" + this.contextBase.typestr).value || this.contextBase.nls_DialogInitialName;
				var chkurl = null;
				if (this.contextBase.app.declaredClass === 'lconn.files.PersonalFiles') {
					// /files/form/api/userlibrary/{person-id}/document/{document-label}/entry?identifier=label
					// /files/form/api/communitylibrary/{communityId}/document/{document-label}/entry?identifier=label
					chkurl = pe.baseUriPath + "form/api/userlibrary/" + pe.authenticatedUser.id + "/document/"
							+ encodeURI(ndname + typeExt) +"/entry?identifier=label";
				} else {
					var commContextPath = window.commContextPath;
					var index = commContextPath.lastIndexOf('communities');
					commContextPath = commContextPath.substring(0, index);
					chkurl = commContextPath + "files/form/api/communitylibrary/"
							+ this.contextBase.app.communityId + "/document/" + encodeURI(ndname + typeExt)
							+ "/entry?identifier=label";
				}
				var exists = true;
				var response, ioArgs;
				this.contextBase.app.net.headXml({
					url : chkurl,
					noStatus : true,
					auth : {},
					handle : function(r, io) {
						response = r;
						ioArgs = io;
						var status;
						try {
							status = io.xhr.status;
						} catch (e) {
						}
						return (status == 200);
					},
					sync : true
				});
				if (ioArgs && ioArgs.xhr.status == 401) { 
					// 1. there should be error message of "session timeout, but no PII strings so do nothing"
					// Files will trigger Confirm login dialog automatical
					;
				}else if (ioArgs && ioArgs.xhr.status == 200){
					// 2. 200 means duplicated document entry found, prompt errors
					errorContainer.innerHTML = this.contextBase.nls_DialogDupErrMsg; 
					errorContainerTr.style.display="";
					dialog.keepOpen(); //show();
					//return;					
				}else if(ioArgs && ioArgs.xhr.status == 404){
					// 3. 404 means not found, we can go ahead to create files via xhrPost request
					var servletUrl = null;
					if (this.contextBase.app.declaredClass === 'lconn.files.PersonalFiles') {
						servletUrl = glb_concord_url + "/api/docsvr/" + this.contextBase.typeurl;
					} else {
						this.contextBase.app.getLibrary(true);
						servletUrl = glb_concord_url + "/api/docsvr/" + this.contextBase.typeurl + "?community="
								+ this.contextBase.app.library.getId();
					}

					var isExt = this.contextBase.isExternal(dialog);
					var isPro = this.contextBase.isPropagateEnabled(dialog);
					var context = this.contextBase.getDocContext();	
					if(this.contextBase.app.declaredClass === 'lconn.files.comm.ReferentialWidget' && context && context.type == "folder" && context.isExternal){
						isExt = true;
					}
					var sData = dojo.toJson(this.contextBase.createEmptyDoc(ndname, isExt, isPro, context));
					//var sData = JSON.stringify(emptyDoc, null);
					concord.global.xhrPost({
						url : servletUrl,
						filesUserId : this.contextBase.app.getAuthenticatedUserId(),
						handleAs : "json",
						handle : function(r, io) {
							response = r;
							ioArgs = io;
							if (response instanceof Error) {
								return;
							}				
							if(context && context.type == "pinnedfiles"){								
								dojo.publish("lconn/files/files/myfavorites/add", response.doc_uri);
							} 
							// Files 4.0 has bug when deal with this event.  
							if(concord.global.getFilesVersion() > 4.0){
								dojo.publish("lconn/share/action/completed", [ {fileChange : true}, null ]);
							} else {
								dojo.publish("lconn/share/action/completed", [ {}, null ]);
							}
							window.open(concord.global.getDocEditURL(response.doc_uri, response.repo_id), concord.global.hashWinNameFromId(response.doc_uri));
						},
						sync : true,
						contentType : "text/plain",
						postData : sData
					});

					var problem_id = null ;
					try
					{
						problem_id = response.data.problem_id;
					}
					catch (ex)
					{
						console.log("Error happens while get problem id from response.data .", ex);
					}
					if(problem_id == null || problem_id == "")
					{
						problem_id = ioArgs.xhr.getResponseHeader("problem_id");
					}
					var errorMsg ;
					if (ioArgs && ioArgs.xhr.status == 403) { //you do not have the permission to create new file.
						errorMsg  = this.contextBase.nls_DialogNoPermissionErrMsg;
						errorContainer.innerHTML = errorMsg ;
						errorContainerTr.style.display="";
						if(problem_id && problem_id != "")
						{
							this.contextBase.showProblemID(errorContainer,problem_id);
						}
						dialog.keepOpen();
					} else if (ioArgs && ioArgs.xhr.status > 403) { //any type of server request error include 4xx or 5xx
						errorMsg  = dojo.string.substitute(this.contextBase.nls_DialogServerErrMsg, [ ndname ]);
						errorContainer.innerHTML = errorMsg ;
						errorContainerTr.style.display="";
						if(problem_id && problem_id != "")
						{
							this.contextBase.showProblemID(errorContainer,problem_id);
						}
						dialog.keepOpen();
					} else if (response instanceof Error) {
						errorMsg  = dojo.string.substitute(this.contextBase.nls_DialogServerErrMsg, [ ndname ]);
						errorContainer.innerHTML = errorMsg ;
						errorContainerTr.style.display="";
						if(problem_id && problem_id != "")
						{
							this.contextBase.showProblemID(errorContainer,problem_id);
						}
						dialog.keepOpen();
					} else {
						dialog.hide();
						dialog.destroy();
					}
				
				}else {
					//4. Connection server access errors
					errorContainer.innerHTML = dojo.string.substitute(this.contextBase.nls_DialogServerErrMsg2, [ ndname ]);
					errorContainerTr.style.display="";
					dialog.keepOpen(); //shown();
					return;
				}

			}
		});
		dialog.attr("style", "width: 510px;");
		dijit.setWaiState(dialog.domNode,'describedby', 'create_'+ this.typestr +'_in_ibm_docs_dec_div');
		//dialog.attr("style","height: 229px;");
		dialog.show();

		var d = document;
		var table = d.createElement("table");
		table.className = "lotusFormTable";
		table.cellPadding = 0;
		dijit.setWaiRole(table, "presentation");

		var colgroup = d.createElement("colgroup");
		colgroup.appendChild(d.createElement("col"));
		var col = d.createElement("col");
		col.width = "100%";
		colgroup.appendChild(col);
		table.appendChild(colgroup);

		var tbody = d.createElement("tbody");
		var trdec = d.createElement("tr");
		var tddec = trdec.appendChild(d.createElement("td"));
		tddec.colSpan = 2;
		var divdec = d.createElement("div");
		divdec.id = "create_"+ this.typestr +"_in_ibm_docs_dec_div";
		divdec.style.fontWeight = "bold";
		divdec.innerHTML = this.nls_DialogContent;
		tddec.appendChild(divdec);
		tbody.appendChild(trdec);
		
		var trmsg = d.createElement("tr");
		var tdmsg = trmsg.appendChild(d.createElement("td"));
		tdmsg.colSpan = 2;
		var divmsg = d.createElement("div");
		dijit.setWaiRole(divmsg, "alert");
		tdmsg.appendChild(divmsg);
		this.dialog.msgContainer = new lconn.share.widget.MessageContainer({
			nls : this.app.nls
		}, divmsg);
		tbody.appendChild(trmsg);
		
		var tr = d.createElement("tr");
		tr.className = "lotusFormFieldRow";
		var td = d.createElement("td");
		td.className = "lotusFormLabel lotusNowrap";
		var label = d.createElement("label");
		var namepre = this.nls_DialogNamepre;
		label.appendChild(d.createTextNode(namepre));
		td.appendChild(label);
		tr.appendChild(td);
		var td = d.createElement("td");
		var input = dialog.nameNode = d.createElement("input");
		input.id = "concordnewfile" + this.typestr;
		input.type = "text";
		input.value = this.nls_DialogInitialName;
		input.className = "lotusText";
		input.name = "_tags" + this.typestr;
		dijit.setWaiState(input, "required", "true");
		td.appendChild(input);

		dojo.attr(label, "for", input.id);
		tr.appendChild(td);
		tbody.appendChild(tr);
        
        var errorContainerTr = d.createElement("tr");
        errorContainerTr.id = "concordduplicate" + this.typestr + "tr";
        errorContainerTr.style.display = "none";
		var td11 = d.createElement("td");
		errorContainerTr.appendChild(td11);
		var td12 = d.createElement("td");
		var errorContainer = d.createElement("div");
		errorContainer.id = "concordduplicate" + this.typestr;
		errorContainer.style.color = "red";
		errorContainer.style.fontWeight = "bold";
		dijit.setWaiRole(errorContainer, "alert");
		td12.appendChild(errorContainer);

		errorContainerTr.appendChild(td12);
		tbody.appendChild(errorContainerTr);

		var tr2 = d.createElement("tr");
		tr2.className = "lotusFormFieldRow";
		var td1 = tr2.appendChild(d.createElement("td"));
		td1.className = "lotusFormLabel";
		var td2 = tr2.appendChild(d.createElement("td"));

		if (this.app.declaredClass === 'lconn.files.PersonalFiles') {
			var div_propagate = d.createElement("div");
			var input_p = dialog.shareFilePropagate = d.createElement("input");
			input_p.type = "checkbox";
			input_p.id = dialog.id + "_shareFilePropagate";
			input_p.className = "lotusCheckbox";
			input_p.name = "_shareFilePropagate";
			input_p.value = "true";
			input_p.checked = input_p.defaultChecked = lconn.share.util.configUtil.getResharingDefault(this.app.authenticatedUser);			
			div_propagate.appendChild(input_p);
			var label_p = d.createElement("label");
			label_p.className = "lotusCheckbox";
			label_p.appendChild(d.createTextNode(this.filesnls.PROPAGATE_LABEL));
			dojo.attr(label_p, "for", input_p.id);
			div_propagate.appendChild(label_p);
	
			div_propagate.appendChild(d.createTextNode("\u00a0"));
			concord.global.createHelpLink(this.app, div_propagate, "upload.propagate", {
				inline : true
			});
	
			td2.appendChild(div_propagate);
		}
		
		if (concord.global.shouldShowExternal(this.app)) {
			var inputExt = concord.global.getExternalWidget(dialog, this.app, this.filesnls.SHARING_INTENT, td2, false); 
			if(inputExt){
				this.connectArray.push(dojo.connect(inputExt, "onclick", dojo.hitch(this, function(evt) {
					this.updateInternalWarning(dialog);
				})));
			}
		}

		tbody.appendChild(tr2);
		table.appendChild(tbody);
		/*        var divcomminf = d.createElement("div");
		 dialog.containerNode.insertBefore(divcomminf,dialog.containerNode.firstChild);
		 this.dialog.commInfoContainer = new lconn.share.widget.MessageContainer({nls: this.app.nls}, divcomminf);	
		 this.dialog.commInfoContainer.update([{info:true,message:concord.global.nls.newCommunityInfo}]); */
		dialog.containerNode.appendChild(table);
		input.select();
	}
});

dojo.provide("com.ibm.concord.lcext.NewConcordDoc");
dojo.declare("com.ibm.concord.lcext.NewConcordDoc", com.ibm.concord.lcext.NewConcordBase, {
	actionClass : "com.ibm.concord.lcext.NewConcordDoc",
	formatMap : {"ms":".docx", "odf":".odt"},

	//override
	setTypeString : function() {
		this.typestr = 'doc';
		this.typeurl = 'text';
		this.typeext = '.docx';
	},
	
	_getTypeExt : function() {
		return this.formatMap[this.getFormatSetting("text")];
	},

	//override
	setNlsString : function() {
		this.nls_Name = concord.global.nls.newDocumentName;
		this.nls_Tooltip = concord.global.nls.newDocumentTooltip;
		this.nls_DialogTitle = concord.global.nls.newDocumentDialogTitle;
		this.nls_DialogContent = concord.global.nls.newDocumentDialogContent;
		this.nls_DialogBtnOK = concord.global.nls.newDocumentDialogBtnOK;
		this.nls_DialogBtnOKTitle = concord.global.nls.newDocumentDialogBtnOKTitle;
		this.nls_DialogBtnCancel = concord.global.nls.newDocumentDialogBtnCancel;
		this.nls_DialogIllegalErrMsg = concord.global.nls.newDocumentDialogIllegalErrMsg;
		this.nls_DialogNoNameErrMsg = concord.global.nls.newDocumentDialogNoNameErrMsg;
		this.nls_DialogDupErrMsg = concord.global.nls.newDocumentDialogDupErrMsg;
		this.nls_DialogInitialName = concord.global.nls.newDocumentDialogInitialName;
		this.nls_DialogNoPermissionErrMsg = concord.global.nls.newDocumentDialogNoPermissionErrMsg;
		this.nls_DialogServerErrMsg = concord.global.nls.newDocumentDialogServerErrMsg;
		this.nls_DialogServerErrMsg2 = concord.global.nls.newDocumentDialogServerErrMsg2;
		this.nls_DialogNamepre = concord.global.nls.newDocumentDialogNamepre;
		this.nls_DialogProblemidErrMsg = concord.global.nls.newDialogProblemidErrMsg;
		this.nls_DialogProblemidErrMsgShow = concord.global.nls.newDialogProblemidErrMsgShow;
		this.nls_DialogProblemidErrMsgHide = concord.global.nls.newDialogProblemidErrMsgHide;
	},

	//override
	createEmptyDoc : function(newname, isExternal, propagate, context) {
		var emptyDoc = {};
		// need an empty
		emptyDoc.title = newname; // "Untitled Draft";
		emptyDoc.newTitle = newname; // "Untitled Draft";
		emptyDoc.isExternal = isExternal;
		emptyDoc.propagate = propagate;
		if(context)
			emptyDoc.context = context;
		//No need to set content here, using default value in single place:TextDocumentService.EMPTY_TEXT_TEMPLATE
		//emptyDoc.content = "<html><head></head><body class='concord_Doc_Style_1'><p><br class='hideInIE'></p></body></html>";

		return emptyDoc;
	}

});

dojo.provide("com.ibm.concord.lcext.NewConcordSheet");
dojo.declare("com.ibm.concord.lcext.NewConcordSheet", com.ibm.concord.lcext.NewConcordBase, {
	actionClass : "com.ibm.concord.lcext.NewConcordSheet",
	formatMap : {"ms":".xlsx", "odf":".ods"},

	//override
	setTypeString : function() {
		this.typestr = 'sheet';
		this.typeurl = 'sheet';
		this.typeext = '.xlsx';
	},
	
	_getTypeExt : function() {
		return this.formatMap[this.getFormatSetting("sheet")];
	},

	//override
	setNlsString : function() {
		this.nls_Name = concord.global.nls.newSheetName;
		this.nls_Tooltip = concord.global.nls.newSheetTooltip;
		this.nls_DialogTitle = concord.global.nls.newSheetDialogTitle;
		this.nls_DialogContent = concord.global.nls.newDocumentDialogContent;
		this.nls_DialogBtnOK = concord.global.nls.newDocumentDialogBtnOK;
		this.nls_DialogBtnOKTitle = concord.global.nls.newSheetDialogBtnOKTitle;
		this.nls_DialogBtnCancel = concord.global.nls.newDocumentDialogBtnCancel;
		this.nls_DialogIllegalErrMsg = concord.global.nls.newDocumentDialogIllegalErrMsg;
		this.nls_DialogNoNameErrMsg = concord.global.nls.newDocumentDialogNoNameErrMsg;
		this.nls_DialogDupErrMsg = concord.global.nls.newDocumentDialogDupErrMsg;
		this.nls_DialogInitialName = concord.global.nls.newSheetDialogInitialName;
		this.nls_DialogNoPermissionErrMsg = concord.global.nls.newDocumentDialogNoPermissionErrMsg;
		this.nls_DialogServerErrMsg = concord.global.nls.newDocumentDialogServerErrMsg;
		this.nls_DialogServerErrMsg2 = concord.global.nls.newDocumentDialogServerErrMsg2;
		this.nls_DialogNamepre = concord.global.nls.newDocumentDialogNamepre;
		this.nls_DialogProblemidErrMsg = concord.global.nls.newDialogProblemidErrMsg;
		this.nls_DialogProblemidErrMsgShow = concord.global.nls.newDialogProblemidErrMsgShow;
		this.nls_DialogProblemidErrMsgHide = concord.global.nls.newDialogProblemidErrMsgHide;
	},

	//override
	createEmptyDoc : function(newname, isExternal, propagate, context) {
		var emptyDoc = {};
		// the supported default font list per locale, it should be same to PopularFonts.js
		var defaultFonts = {
							"ja":		"MS PMinchao",
							"ko":		"Gulim",
							"zh-cn": 	"宋体"
							};
		// need an empty
		//emptyDoc.title = newname; // "Untitled Draft";
		emptyDoc.newTitle = newname; // "Untitled Draft";
		emptyDoc.isExternal = isExternal;
		emptyDoc.propagate = propagate;
		if(context)
			emptyDoc.context = context;
		emptyDoc["st0"] = concord.global.nls.sheetTitle0;
		emptyDoc["st1"] = concord.global.nls.sheetTitle1;
		emptyDoc["st2"] = concord.global.nls.sheetTitle2;
		var language = this.app.language;
		emptyDoc["locale"] = language;
		
		// add default font 
		var font = null;
		var shortLang = language.substr(0, 2).toLowerCase();
		var region = language.substr(3, 2).toLowerCase();
		var longLang = null;
		if (region) longLang = shortLang + "-" + region;
		for (var id in defaultFonts) {
			if (shortLang == id || (longLang && longLang == id)) {
				font = defaultFonts[id];
				break;
			}
		}
		if (font) emptyDoc["font"] = font;
		
		return emptyDoc;
	}

});

dojo.provide("com.ibm.concord.lcext.NewConcordPres");
dojo.declare("com.ibm.concord.lcext.NewConcordPres", com.ibm.concord.lcext.NewConcordBase, {
	actionClass : "com.ibm.concord.lcext.NewConcordPres",
	formatMap : {"ms":".pptx", "odf":".odp"},

	//override
	setTypeString : function() {
		this.typestr = 'pres';
		this.typeurl = 'pres';
		this.typeext = '.pptx';
	},
	
	_getTypeExt : function() {
		return this.formatMap[this.getFormatSetting("pres")];
	},
	
	//override
	setNlsString : function() {
		this.nls_Name = concord.global.nls.newPresName;
		this.nls_Tooltip = concord.global.nls.newPresTooltip;
		this.nls_DialogTitle = concord.global.nls.newPresDialogTitle;
		this.nls_DialogContent = concord.global.nls.newDocumentDialogContent;
		this.nls_DialogBtnOK = concord.global.nls.newDocumentDialogBtnOK;
		this.nls_DialogBtnOKTitle = concord.global.nls.newPresDialogBtnOKTitle;
		this.nls_DialogBtnCancel = concord.global.nls.newDocumentDialogBtnCancel;
		this.nls_DialogIllegalErrMsg = concord.global.nls.newDocumentDialogIllegalErrMsg;
		this.nls_DialogNoNameErrMsg = concord.global.nls.newDocumentDialogNoNameErrMsg;
		this.nls_DialogDupErrMsg = concord.global.nls.newDocumentDialogDupErrMsg;
		this.nls_DialogInitialName = concord.global.nls.newPresDialogInitialName;
		this.nls_DialogNoPermissionErrMsg = concord.global.nls.newDocumentDialogNoPermissionErrMsg;
		this.nls_DialogServerErrMsg = concord.global.nls.newDocumentDialogServerErrMsg;
		this.nls_DialogServerErrMsg2 = concord.global.nls.newDocumentDialogServerErrMsg2;
		this.nls_DialogNamepre = concord.global.nls.newDocumentDialogNamepre;
		this.nls_DialogProblemidErrMsg = concord.global.nls.newDialogProblemidErrMsg;
		this.nls_DialogProblemidErrMsgShow = concord.global.nls.newDialogProblemidErrMsgShow;
		this.nls_DialogProblemidErrMsgHide = concord.global.nls.newDialogProblemidErrMsgHide;
	},

	//override
	createEmptyDoc : function(newname, isExternal, propagate, context) {
		var emptyDoc = {};
		// need an empty
		emptyDoc.title = newname; // "Untitled Draft";
		emptyDoc.newTitle = newname; // "Untitled Draft";
		emptyDoc.isExternal = isExternal;
		emptyDoc.propagate = propagate;
		if(context)
			emptyDoc.context = context;  
		emptyDoc.template = "default"; // "Untitled Draft";
		emptyDoc.content = "<html><head></head><body><p>&nbsp;</p></body></html>";
		return emptyDoc;
	}

});
