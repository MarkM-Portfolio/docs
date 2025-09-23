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

dojo.provide("concord.actionEdit");

dojo.require("lconn.share.action.DeferredAction");
dojo.require("lconn.share.widget.LotusDialog");
dojo.require("concord.global");
dojo.require("concord.customDownloadAction");
dojo.require("concord.customEditAction");
dojo.require("lconn.share.util.validation");
dojo.require("concord.pageSetup");
dojo.require["lconn.core.config.features"];
dojo.requireLocalization("lconn.files", "action");

dojo.provide("com.ibm.concord.lcext.CCDNewFrom");
dojo.declare("com.ibm.concord.lcext.CCDNewFrom", [ lconn.share.action.DeferredAction ], {
	dialog : null,
	bytesForName : null,
	//tooltipfixme: "Preview in Concord",//DON"T CHANGE, hachish code 
	isPrimary : true,
	defaultIsExternal : false,
	connectArray : [],
	
	constructor : function(app, opts) {
		this.inherited(arguments);
		this.app = app;
		this.opts = opts;
		this.name = concord.global.nls.newFromName;
		this._isExternalSupported = !!dojo.getObject("lconn.share.config.features.sharingIntent");		
		this.tooltip = concord.global.nls.newFromTooltip;
		this.filesnls = dojo.i18n.getLocalization("lconn.files", "action").UPLOAD_FILE;
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
	isValid : function(file, opt) {
		var extension = file.getExtension();
		var new_from_format = {
			"ott" : 1,
			"ots" : 1,
            "otp" : 1,
            "dot" : 1,
            "xlt" : 1,
            "pot" : 1,
            "dotx" : 1,
            "xltx" : 1,
            "potx" : 1
		};
		if ((!file.isEncrypted()) && extension && new_from_format[extension.toLowerCase()]) {
			var ext = file.getExtension();
		    var tpl_tip_map = {
			   "ott" : concord.global.nls.newFromDocTip,
			   "ots" : concord.global.nls.newFromSheetTip,
               "otp" : concord.global.nls.newFromPresTip,
               "dot" : concord.global.nls.newFromDocTip,
               "xlt" : concord.global.nls.newFromSheetTip,
               "pot" : concord.global.nls.newFromPresTip,
               "dotx" : concord.global.nls.newFromDocTip,
               "xltx" : concord.global.nls.newFromSheetTip,
               "potx" : concord.global.nls.newFromPresTip
		    };
		    this.tooltip=tpl_tip_map[ext];
			return true;
		}
		return false;
	},
	
	isExternal : function(dialog) {
		if (!this._isExternalSupported || !(this.app.declaredClass === 'lconn.files.PersonalFiles'))
			return false;
		if (concord.global.shouldShowExternal(this.app) && dialog && dialog.extChkBox)
			return dialog.extChkBox.checked;
		else
			return this.defaultIsExternal;
	},
	
	getDocContext : function() {
		//    app.getContext(itemType, action, checkPermission) - itemType: file; action: create; checkpermission: true    
		//    return possible values:    
		//    {type: "pinnedfiles", value: true}
		//    {type: "pinnedfolders", value: true}
		//    {type: "folder", value:  collectionId, collectionType: "personal"}
		//	  {type: "folder", value:  collectionId, collectionType: "community"};
		//    {type: "sync", value:  true}
		//    null
		return this.app.getContext ? this.app.getContext("file", "create", true) : null;	
	},
	
	isCommEditor : function() {
		if (this.app.declaredClass === "lconn.files.comm.ReferentialWidget") {
			var user = this.app.getAuthenticatedUser();
			return user && user.permissions && this.app.getLibrary(true) && user.permissions.canUploadToCommunity();
		}
		return false;
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
	_trimName : function() {
		if (this.dialog) {
			var input_text = dojo.byId("concordnewfromtemplatedoc").value;
			var i = lconn.share.util.text.getCharIndexForUtf8Index(input_text, this.bytesForName);
			if (i != -1){
				dojo.byId("concordnewfromtemplatedoc").value = input_text.substring(0, i);
			}
			dojo.byId("concordduplicatetemplate").innerHTML = "";
		}
	},
	execute : function(file, opt) {
		this.destroyDialog();
		if(concord.global.isNeedDocsSAML() && !concord.global.haveDocsLTPA())
		{// try to new a document but did not sign in yet. do SSO here as post can not be handled by TFIM.
			concord.global.doDocsSSO();
		}		
		var ext = file.getExtension();
		var tpl_title_map = {
			"ott" : concord.global.nls.newFromDocTip,
			"ots" : concord.global.nls.newFromSheetTip,
            "otp" : concord.global.nls.newFromPresTip,
            "dot" : concord.global.nls.newFromDocTip,
            "xlt" : concord.global.nls.newFromSheetTip,
            "pot" : concord.global.nls.newFromPresTip,
            "dotx" : concord.global.nls.newFromDocTip,
            "xltx" : concord.global.nls.newFromSheetTip,
            "potx" : concord.global.nls.newFromPresTip
		};

		var prefill_name = {
			"ott" : concord.global.nls.newDocumentDialogInitialName,
			"ots" : concord.global.nls.newSheetDialogInitialName,
            "otp" : concord.global.nls.newPresDialogInitialName,
            "dot" : concord.global.nls.newDocumentDialogInitialName,
            "xlt" : concord.global.nls.newSheetDialogInitialName,
            "pot" : concord.global.nls.newPresDialogInitialName,
            "dotx" : concord.global.nls.newDocumentDialogInitialName,
            "xltx" : concord.global.nls.newSheetDialogInitialName,
            "potx" : concord.global.nls.newPresDialogInitialName

		};
		var dialog = this.dialog = new lconn.share.widget.LotusDialog({
			contextBase : this,
			title : concord.global.nls.newFromDialogName,
			contentClass : "lotusDialogContent",
			//content: '<table cellpadding="0" class="lotusFormTable"><colgroup><col><col width="100%"><col></colgroup><tbody><tr class="_qkrErrorRow"><td colspan="1"></td><td colspan="2" class="lotusFormError" role="alert">Please select a person or community to share with.</td></tr></tbody></table>',
			buttonOk : concord.global.nls.newDocumentDialogBtnOK,
			buttonOkTitle : concord.global.nls.newFromDialogName,
			buttonCancel : concord.global.nls.newDocumentDialogBtnCancel,
			_size : function() {
			}, // Fixed dialog size
			onExecute : function() {
				var extension = file.getExtension();
				var doc_type = {
					"ott" : "text",
					"ots" : "sheet",
                    "otp" : "pres",
                    "dot" : "text",
                    "xlt" : "sheet",
                    "pot" : "pres",
                    "dotx" : "text",
                    "xltx" : "sheet",
                    "potx" : "pres"
				};
				var ext_type = {
					"ott" : ".odt",
					"ots" : ".ods",
                    "otp" : ".odp",
                    "dot" : ".doc",
                    "xlt" : ".xls",
                    "pot" : ".ppt",
                    "dotx" : ".docx",
                    "xltx" : ".xlsx",
                    "potx" : ".pptx"
				};
				dojo.byId("concordduplicatetemplate").innerHTML = "";
				var input_text = dojo.byId("concordnewfromtemplatedoc").value;
				if (dojo.trim(input_text) == "") {
					dojo.byId("concordduplicatetemplate").innerHTML = concord.global.nls.newDocumentDialogNoNameErrMsg;
					dialog.keepOpen();
					return;
				}
				if (!/^([^\\\/\:\*\?\"\<\>\|]+)$/.test(input_text)) {
					var msg = dojo.string.substitute(concord.global.nls.newDocumentDialogIllegalErrMsg, [ input_text ]);
					msg = msg.replace(/</g, "&lt; ").replace(/>/g, "&gt; ");
					dojo.byId("concordduplicatetemplate").innerHTML = msg;
					dialog.keepOpen();
					return;
				}
				var bytesExt = lconn.share.util.text.lengthUtf8(ext_type[extension]);
				this.contextBase.bytesForName = lconn.share.util.validation.FILENAME_LENGTH - bytesExt;
				if (!lconn.share.util.validation.validateTextLength(input_text, this.contextBase.bytesForName)){
					var d = document;
					var errorContainer = dojo.byId("concordduplicatetemplate");
					errorContainer.appendChild(d.createTextNode(concord.global.nls.newDocumentDialog_WARN_LONG_DOCUMENTNAME));
					errorContainer.appendChild(d.createTextNode(" "));
				    var a = d.createElement("a");
				    a.href = "javascript:;";
				    dijit.setWaiRole(a, "button");
				    dojo.connect(a, "onclick", this.contextBase, "_trimName");
				    a.appendChild(d.createTextNode(concord.global.nls.newDocumentDialog_TRIM_LONG_DOCUMENTNAME));
				    errorContainer.appendChild(a);
				    dialog.keepOpen();
				    return;
				}
				
				var bTargetCommunity = false;
				if (this.contextBase.app.declaredClass === "lconn.files.comm.ReferentialWidget") {
					if(this.contextBase.isCommEditor() && dojo.byId("targetcommunity") && dojo.byId("targetcommunity").checked)
						bTargetCommunity = true;
					else if(dojo.byId("targetmyfile") && dojo.byId("targetmyfile").checked)
						bTargetCommunity = false;
				}
				
				var ndname = dojo.byId("concordnewfromtemplatedoc").value || prefill_name[extension];
				var chkurl = null;
				if (!bTargetCommunity) {
					// /files/form/api/userlibrary/{person-id}/document/{document-label}/entry?identifier=label
					// /files/form/api/communitylibrary/{communityId}/document/{document-label}/entry?identifier=label
					chkurl = lconn.share.config.baseUri+"form/api/userlibrary/" + this.contextBase.app.authenticatedUser.id + "/document/"
							+ encodeURI(ndname + ext_type[extension]) +"/entry?identifier=label";
				} else {
					var commContextPath = window.commContextPath;
					var index = commContextPath.lastIndexOf('communities');
					commContextPath = commContextPath.substring(0, index);
					chkurl = commContextPath + "files/form/api/communitylibrary/"
							+ this.contextBase.app.communityId + "/document/" + encodeURI(ndname + ext_type[extension])
							+ "/entry?identifier=label";
				}

				var exists = true;
				var response, ioArgs;
				this.contextBase.app.net.headXml({
					url : chkurl,
					noStatus : true,
					auth : {},
					preventCache : true,
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
					dojo.byId("concordduplicatetemplate").innerHTML = concord.global.nls.newDocumentDialogDupErrMsg;//style.display="block";//
					dialog.keepOpen();//show();
					//return;
				}else if(ioArgs && ioArgs.xhr.status == 404){
					// 3. 404 means not found, we can go ahead to create files via xhrPost request
					var isExternal = false;
					var contextType = "";
					var contextValue = "";
					var contextFolder = "";
					var context = this.contextBase.getDocContext();
					if(context){
						contextType = context.type;
						contextValue = context.value;
						if(contextType == "folder"){
							contextFolder = context.collectionType;
						}
					}
					if(contextType == undefined) contextType = "";
					if(contextValue == undefined) contextValue = "";
					if(contextFolder == undefined) contextFolder = "";
					if(this.extChkBox && this.extChkBox.id){						
						var chkbox = dojo.byId(this.extChkBox.id);				
						if(chkbox){
							isExternal = dojo.byId(this.extChkBox.id).checked;
						}
					}
					
					if(this.contextBase.app.declaredClass === "lconn.files.comm.ReferentialWidget" && contextType == "folder" && contextFolder == "personal") {
						// For defect 57486, need to handle the case of personal folder shared to community specially.
						// For this special case, the personal folder shared to community actually belongs to 'My Files'. 
						// So if the new file target is 'My Files', it should be saved to the folder and My Files.
						// If the new file target is 'This Community', it should be saved to the community but will not be put into the folder.
						if (!bTargetCommunity) {
							this.contextBase.app.getLibrary(true);
							var isExt = this.contextBase.isExternal(dialog);
							if(context && context.isExternal){ //on SmartCloud isExternal=true, on OnPremise isExternal=false
								isExt = true;
							}
							
							var newfrom_url = glb_concord_url_wnd_open + "/app/newdoc?type=" + doc_type[extension] + "&template_uri="
								+ file.getId() + "&doc_title=" + ndname + "&community=" + this.contextBase.app.library.getId() +"&isExternal="+isExt
								+ "&contextType=" + contextType + "&contextValue="+ contextValue+ "&contextFolder="+ contextFolder;
							window.open(newfrom_url, "_blank", "");
						} else {
							this.contextBase.app.getLibrary(true);
							var newfrom_url = glb_concord_url_wnd_open + "/app/newdoc?type=" + doc_type[extension] + "&template_uri="
								+ file.getId() + "&doc_title=" + ndname + "&community=" + this.contextBase.app.library.getId() +"&isExternal="+isExternal
								+ "&contextType=&contextValue=&contextFolder=";
							window.open(newfrom_url, "_blank", "");
						}
					}
					else {
						// The normal case:
						// If the new file target is 'My Files', it will be saved into My Files.
						// if the new file target is 'This Community', it will be saved into the community.(If the template is in a community folder, the new file will also be put into the folder.)
						if (!bTargetCommunity) {
							var newfrom_url = glb_concord_url_wnd_open + "/app/newdoc?type=" + doc_type[extension] + "&template_uri="
								+ file.getId() + "&doc_title=" + ndname +"&isExternal="+isExternal + "&contextType=" + contextType
								+ "&contextValue="+ contextValue + "&contextFolder="+ contextFolder;
							window.open(newfrom_url, "_blank", "");
						} else {
							this.contextBase.app.getLibrary(true);
							var newfrom_url = glb_concord_url_wnd_open + "/app/newdoc?type=" + doc_type[extension] + "&template_uri="
								+ file.getId() + "&doc_title=" + ndname + "&community=" + this.contextBase.app.library.getId() +"&isExternal="+isExternal
								+ "&contextType=" + contextType + "&contextValue="+ contextValue+ "&contextFolder="+ contextFolder;							
							window.open(newfrom_url, "_blank", "");
						}
					}
				
				}else {
					//4. Connection server access errors
                    dojo.byId("concordduplicatetemplate").innerHTML = dojo.string.substitute(concord.global.nls.newDocumentDialogServerErrMsg2,
                            [ ndname ]);
                    dialog.keepOpen(); //show();
                    return;
				}
			}
		});
		dialog.attr("style", "width: 500px;");
		dijit.setWaiState(dialog.domNode,'describedby', 'create_from_template_in_ibm_docs_dec_div');
		//dialog.attr("style","height: 229px;");
		dialog.show();

		var d = document;
		var table = d.createElement("table");
		table.className = "lotusFormTable";
		dijit.setWaiRole(table, "presentation");
		var colgroup = d.createElement("colgroup");
		colgroup.appendChild(d.createElement("col"));
		var col = d.createElement("col");
		col.width = "100%";
		colgroup.appendChild(col);
		table.appendChild(colgroup);		
		var tbody = d.createElement("tbody");
		
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
		//description tr
		var trdec = d.createElement("tr");
		var tddec = trdec.appendChild(d.createElement("td"));
		tddec.colSpan = 2;
		var divdec = d.createElement("div");
		divdec.id = "create_from_template_in_ibm_docs_dec_div";		
		var pdec1 = d.createElement("p");
		pdec1.innerHTML = tpl_title_map[ext];
		divdec.appendChild(pdec1);
		var pdec2 = d.createElement("p");
		pdec2.style.fontWeight = "bold";
		pdec2.innerHTML = concord.global.nls.newDocumentDialogContent;
		divdec.appendChild(pdec2);		
		tddec.appendChild(divdec);
		tbody.appendChild(trdec);
		
		var tr = d.createElement("tr");
		tr.className = "lotusFormFieldRow";
		var td = d.createElement("td");
		td.className = "lotusFormLabel lotusNowrap";
		var label = d.createElement("label");
		var namepre = concord.global.nls.newDocumentDialogNamepre;
		label.appendChild(d.createTextNode(namepre));
		td.appendChild(label);
		tr.appendChild(td);
		var td = d.createElement("td");
		var input = d.createElement("input");
		input.id = "concordnewfromtemplatedoc";
		input.type = "text";
		input.value = prefill_name[ext];
		input.className = "lotusText";
		input.name = "_tagsdoc";
		dijit.setWaiState(input, "required", "true");
		td.appendChild(input);

		dojo.attr(label, "for", input.id);
		tr.appendChild(td);
		tbody.appendChild(tr);
		
		if (this.app.declaredClass === "lconn.files.comm.ReferentialWidget") {
			var trTarget = d.createElement("tr");
			trTarget.className = "lotusFormFieldRow";
			var tdTargetPre = d.createElement("td");
			tdTargetPre.className = "lotusFormLabel lotusNowrap";
			var labelTargetPre = d.createElement("label");
			var textTargetPre = concord.global.nls.newDocumentDialogTargetPre;
			labelTargetPre.appendChild(d.createTextNode(textTargetPre));
			tdTargetPre.appendChild(labelTargetPre);
			trTarget.appendChild(tdTargetPre);
			var tdTargetInput = d.createElement("td");
			var fieldset = d.createElement("fieldset");
			
			if (this.isCommEditor()) {
				var input = d.createElement("input");
				input.id = "targetcommunity";
				input.type = "radio";
				input.value = "community";
				input.className = "lotusFormLabel";
				input.name = "_targetdoc";
				input.checked = "checked";
				dijit.setWaiState(input, "required", "true");
				fieldset.appendChild(input);
				var label = d.createElement("label");
				label.className = "lotusFormLabel";
				label.appendChild(d.createTextNode(concord.global.nls.newDocumentDialogTargetCommunity));
				dojo.attr(label, "for", input.id);
				fieldset.appendChild(label);
			}
			
			var input = d.createElement("input");
			input.id = "targetmyfile";
			input.type = "radio";
			input.value = "myfiles";
			input.className = "lotusFormLabel";
			input.name = "_targetdoc";
			if (!this.isCommEditor()) {
				input.checked = "checked";
			}
			dijit.setWaiState(input, "required", "true");
			fieldset.appendChild(input);
			var label = d.createElement("label");
			label.className = "lotusFormLabel";
			label.appendChild(d.createTextNode(concord.global.nls.newDocumentDialogTargetMyFiles));
			dojo.attr(label, "for", input.id);
			fieldset.appendChild(label);

			tdTargetInput.appendChild(fieldset);
			trTarget.appendChild(tdTargetInput);
			tbody.appendChild(trTarget);
		}
		
		if(concord.global.shouldShowExternal(this.app)){
			var tr2 = d.createElement("tr");
			tr2.className = "lotusFormFieldRow";
			var td1 = tr2.appendChild(d.createElement("td"));
			td1.className = "lotusFormLabel";
			var td2 = tr2.appendChild(d.createElement("td"));
			var extdiv = concord.global.getExternalWidget(dialog, this.app, this.filesnls.SHARING_INTENT, td2, true);
			if(extdiv){
				tbody.appendChild(tr2);
				this.connectArray.push(dojo.connect(extdiv, "onclick", dojo.hitch(this, function(evt) {
					this.updateInternalWarning(dialog);
				})));
			}			
		}
		
		table.appendChild(tbody);
		dialog.containerNode.appendChild(table);
			
		var div = d.createElement("div");
		div.id = "concordduplicatetemplate";
		div.style.color = "red";
		div.style.fontWeight = "bold";
		dijit.setWaiRole(div, "alert");
		dialog.containerNode.appendChild(div);
		input.select();

	}
});

dojo.provide("com.ibm.concord.lcext.CCDEdit");
dojo.declare("com.ibm.concord.lcext.CCDEdit", [ lconn.share.action.DeferredAction ], {
	//tooltipfixme: "Preview in Concord",//DON"T CHANGE, hachish code 
	isPrimary : true,
	constructor : function(app, opts) {
		this.inherited(arguments);
		this.app = app;
		this.name = concord.global.nls.editName;
		this.tooltip = concord.global.nls.editTooltip;
		this.parentId = "lconn_files_action_EditGroup";
	},
	isValid : function(file, opt) {
		var extension = file.getExtension();
		var edit_format = {
			"ppt" : 1,
			"odp" : 1,
			"ods" : 1,
			"xls" : 1,
			"txt" : 1,
			"csv" : 1,
			"docx" : 1,
			"doc" : 1,
			"odt" : 1,
			"pptx" : 1,
			"xlsx" : 1,
			"xlsm" : 1
		};
		if ((!file.isEncrypted()) && extension && edit_format[extension.toLowerCase()]) {	
			// IBM Docs doesn't support edit 0 size csv and txt.
			extension = extension.toLowerCase();
			if ((("csv" == extension) || ("txt" == extension)) && (0 == file.getSize())) {
				return false;
			}
			if (concord.global.isEditor(file)) {
				if (concord.global.isIBMDocFile(file)) {
					return true;
				} else {
					return (concord.global.isOwner(file, this.app) || concord.global.isUploadNewVersionEnabled());
				}
			}
		}
		return false;
	},

	execute : function(file, opt) {
		if (concord.global.isIBMDocFile(file) || concord.global.isUploadNewVersionEnabled()) {
			var fid = file.getId();
			window.open(concord.global.getDocEditURL(fid), concord.global.hashWinNameFromId(fid));
		} else {
			new concord.customEditAction(this.app, null, {
				hideCancel : false,
				editWithDocsDialogTitle : concord.global.nls.editWithDocsDialogTitle,
				OkTitle : concord.global.nls.editWithDocsDialogBtnOKTitle,
				OK : concord.global.nls.editWithDocsDialogBtnOKTitle,
				sentence1 : concord.global.nls.editWithDocsDialogContent1,
				sentence2 : concord.global.nls.editWithDocsDialogContent2
			}).execute(file);
		}
	}
});

dojo.provide("com.ibm.concord.lcext.CCDViewDetail");
dojo.declare("com.ibm.concord.lcext.CCDViewDetail", [ lconn.share.action.DeferredAction ], {
	//tooltipfixme: "Preview in Concord",//DON"T CHANGE, hachish code 
	isPrimary : true,

	constructor : function(app, opts) {
		this.inherited(arguments);
		this.app = app;
		this.name = concord.global.nls.VIEW_FILE_DETAILS_LINK;
		this.tooltip = concord.global.nls.VIEW_FILE_DETAILS_LINK;
	},

	isValid : function(file, opt) {
		if (lconn.core.config && lconn.core.config.features && lconn.core.config.features("fileviewer-detailspage")) {
			   return false;
		}
		
		if (!concord.global.isIBMDocFile(file))
			return false;

		var sceneName = null;
		this.app && this.app.scene && (sceneName = this.app.scene.declaredClass);
		if (sceneName && (sceneName != "lconn.files.comm.scenes.owned.CommunityFileSummary")
				&& (sceneName != "lconn.files.scenes.FileSummary"))
			return true;

		return false;
	},

	execute : function(file, opt) {
		window.open(file.getUrlVia(), "_self");
	}
});

dojo.declare("com.ibm.concord.lcext.CCDPDFExport", [ lconn.share.action.DeferredAction ], {
	//tooltipfixme: "Preview in Concord",//DON"T CHANGE, hachish code 
	isPrimary : false,
	dialog : null,
	
	destroyDialog : function() {
		if (this.dialog) {
			this.dialog.cancel();
			this.dialog.destroyRecursive();
			this.dialog = null;
		}
	},
	destroy : function() {
		this.inherited(arguments);
		this.destroyDialog();
	},
	
	constructor : function(app, opts) {
		this.inherited(arguments);
		this.app = app;
		this.name = concord.global.nls.downloadAsPDF;
		this.tooltip = concord.global.nls.downloadAsPDF;
	},
	isValid : function(file, opt) {
		var isValidIBMDocs = concord.global.showConcordEntry() && concord.global.isIBMDocFile(file);
		if (isValidIBMDocs) {
			var extension = file.getExtension();
			// 48490 remvove PDF download for presentation files
			var pdf_format = {
				"docx" : 1,
				"doc" : 1,
				"odt" : 1,
				"ods" : 1,
				"xls" : 1,
				"xlsx" : 1,
				"xlsm" : 1,
				"odp" : 1,
				"ppt" : 1,
				"pptx" : 1
			};
			if ((this.app && this.app.authenticatedUser) || (opt.permissions && opt.permissions.isAuthenticated())) {
				if (concord.global.isReader(file) && (!file.isEncrypted()) && extension && pdf_format[extension.toLowerCase()]) {
					return true;
				}
			}
		}
		return false;
	},

	execute : function(file, opt) {
		var context = this;
		var windowOpenCommand = function() {			
//			//if(bConvert)
//			{	
//				context.destroyDialog();
//				var dialog = context.dialog = new concord.pageSetup(this.app, null, {
//					hideCancel : false,
//					OK : concord.global.nls.PAGE_SETUP_BTN_OK,	
//					OkTitle : concord.global.nls.PAGE_SETUP_BTN_OK,
//					pageSetupDialogTitle : concord.global.nls.PAGE_SETUP_TITLE,
//					ORIENTATION_LABEL: concord.global.nls.ORIENTATION_LABEL,
//					PORTRAIT: concord.global.nls.PORTRAIT,
//					LANDSCAPE: concord.global.nls.LANDSCAPE,	
//					MARGINS_LABEL: concord.global.nls.MARGINS_LABEL,
//					TOP: concord.global.nls.TOP,
//					BOTTOM: concord.global.nls.BOTTOM,
//					LEFT: concord.global.nls.LEFT,
//					RIGHT: concord.global.nls.RIGHT,
//					TOP_DESC: concord.global.nls.TOP_DESC,
//					TOP_DESC2: concord.global.nls.TOP_DESC2,
//					BOTTOM_DESC: concord.global.nls.BOTTOM_DESC,
//					BOTTOM_DESC2: concord.global.nls.BOTTOM_DESC2,
//					LEFT_DESC: concord.global.nls.LEFT_DESC,
//					LEFT_DESC2: concord.global.nls.LEFT_DESC2,
//					RIGHT_DESC: concord.global.nls.RIGHT_DESC,
//					RIGHT_DESC2: concord.global.nls.RIGHT_DESC2,			
//					PAPER_FORMAT_LABEL: concord.global.nls.PAPER_FORMAT_LABEL,
//					PAPER_SIZE_LABEL: concord.global.nls.PAPER_SIZE_LABEL,
//					HEIGHT: concord.global.nls.HEIGHT,					
//					HEIGHT_DESC: concord.global.nls.HEIGHT_DESC,
//					HEIGHT_DESC2: concord.global.nls.HEIGHT_DESC2,
//					WIDTH: concord.global.nls.WIDTH,
//					WIDTH_DESC: concord.global.nls.WIDTH_DESC,
//					WIDTH_DESC2: concord.global.nls.WIDTH_DESC2,	
//					CM_LABEL: concord.global.nls.CM_LABEL,
//					LETTER: concord.global.nls.LETTER,
//					LEGAL: concord.global.nls.LEGAL,
//					TABLOID: concord.global.nls.TABLOID,
//					USER: concord.global.nls.USER,
//					SIZE1: concord.global.nls.SIZE1,
//					SIZE2: concord.global.nls.SIZE2,
//					SIZE3: concord.global.nls.SIZE3,
//					SIZE4: concord.global.nls.SIZE4,
//					SIZE5: concord.global.nls.SIZE5,
//					SIZE6: concord.global.nls.SIZE6,
//					SIZE7: concord.global.nls.SIZE7,
//					SIZE8: concord.global.nls.SIZE8,
//					SIZE9: concord.global.nls.SIZE9,
//					DISPLAY_OPTION_LABEL: concord.global.nls.DISPLAY_OPTION_LABEL,
//					HEADER: concord.global.nls.HEADER,					
//					HEADER_DESC: concord.global.nls.HEADER_DESC,
//					FOOTER: concord.global.nls.FOOTER,
//					FOOTER_DESC: concord.global.nls.FOOTER_DESC,
//					GRIDLINE: concord.global.nls.GRIDLINE,
//					TAGGED_PDF: concord.global.nls.TAGGED_PDF,
//					PAGE_LABEL: concord.global.nls.PAGE_LABEL,
//					PAGE_TYPE1: concord.global.nls.PAGE_TYPE1,
//					PAGE_TYPE2: concord.global.nls.PAGE_TYPE2,
//					PAGE_SETUP_INVALID_MSG: concord.global.nls.PAGE_SETUP_INVALID_MSG
//				});
//				context.dialog.execute(file);
//			}
			window.open(concord.global.getDocViewURL(file.getId(), "pdf"), "_blank", "");
		};
		var nonSavedDraftValidator = new com.ibm.concord.lcext.NonSavedDraftValidator(file, this.app, windowOpenCommand);
		nonSavedDraftValidator.execute();
	}
});

dojo.provide("com.ibm.concord.lcext.NonSavedDraftValidator");
dojo.declare("com.ibm.concord.lcext.NonSavedDraftValidator", null, {
	constructor : function(file, app, windowOpenCommand) {
		// save a reference to this object
		this.app = app;
		this.file = file;
		this.windowOpenCommand = windowOpenCommand;

		this.execute = function() {
			var concordnls = concord.global.nls;
			this.latestFileUpdate = null;
			this.latestDraftUpdate = null;
			this.isDirty = null;
			this.isSameVersion = null;
			if (this._isEmpty()) {
				if (concord.global.isEditor(file) || concord.global.isOwner(file, app)) {
					new concord.customDownloadAction(this.app, null, {
						hideCancel : true,
						DOWNLOAD_TITLE : concordnls.DOWNLOAD_EMPTY_TITLE,
						OkTitle : concordnls.DOWNLOAD_EMPTY_OK,
						OK : concordnls.DOWNLOAD_EMPTY_OK,
						sentence1 : concordnls.DOWNLOAD_EMPTY_CONTENT1,
						sentence2 : concordnls.DOWNLOAD_EMPTY_CONTENT2
					}).execute(this.file);
				} else if (concord.global.isReader(file)) {
					new concord.customDownloadAction(this.app, null, {
						hideCancel : true,
						DOWNLOAD_TITLE : concordnls.DOWNLOAD_EMPTYVIEW_TITLE,
						OkTitle : concordnls.DOWNLOAD_EMPTYVIEW_OK,
						OK : concordnls.DOWNLOAD_EMPTYVIEW_OK,
						sentence1 : concordnls.DOWNLOAD_EMPTYVIEW_CONTENT1,
						sentence2 : concordnls.DOWNLOAD_EMPTYVIEW_CONTENT2
					}).execute(this.file);
				} else {
					//do nothing
				}
			} else if (this._isPromptNewDraft()) {
				var draftStrings = concordnls.DOWNLOAD_NEWDRAFT_CONTENT1;
				var df1 = new lconn.share.util.DateFormat(this.latestDraftUpdate);
				var formated_draft_content = df1.formatByAge(draftStrings);
				var versionStrings = concordnls.DOWNLOAD_NEWDRAFT_CONTENT2;
				var df2 = new lconn.share.util.DateFormat(this.latestFileUpdate);
				var formated_version_content = df2.formatByAge(versionStrings);

				new concord.customDownloadAction(this.app, null, {
					hideCancel : false,
					DOWNLOAD_TITLE : concordnls.DOWNLOAD_NEWDRAFT_TITLE,
					OkTitle : concordnls.DOWNLOAD_NEWDRAFT_OK,
					OK : concordnls.DOWNLOAD_NEWDRAFT_OK,
					sentence1 : formated_draft_content,
					sentence2 : formated_version_content
				}).execute(this.file, {
					windowOpenCommand : this.windowOpenCommand
				});
			} else {
				this.windowOpenCommand();
			}
		};

		this._isEmpty = function() {
			return 0 == this.file.getSize();
		};

		this._isPromptNewDraft = function() {
			this._getUpdateTime();
			var isNewer = this.latestDraftUpdate && this.latestFileUpdate && this.isDirty && this.isSameVersion;
			return isNewer && (concord.global.isEditor(this.file) || concord.global.isOwner(this.file, this.app));
		};

		this._getUpdateTime = function() {
			// get publish date
			this.latestFileUpdate = this.file.getUpdated();
			var userID = this.app.getAuthenticatedUserId();
			var chkurl = concord.global.getDocDraftURL(this.file);
			// get draft save date
			var resp, ioArgs;
			concord.global.xhrGet({
				url : chkurl,
				filesUserId : userID,
				handleAs : "json",
				preventCache : true,
				handle : function(r, io) {
					resp = r;
					ioArgs = io;
				},
				sync : true
			});
			if (resp instanceof Error) {
				//do nothing, keep old data.
				return;
			}
			this.latestDraftUpdate = lconn.share.util.misc.date.convertAtomDate(resp.modified);			
			this.isDirty = resp.dirty;
			this.isSameVersion = (resp.base_version == this.file.getVersionLabel());
			// fix the clock doesn't syn issue
			if(this.isDirty && (dojo.date.compare(this.latestDraftUpdate, this.latestFileUpdate) < 0)){
				this.latestDraftUpdate = this.latestFileUpdate;
			}
		};
	}
});
