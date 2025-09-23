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
	dojo.registerModulePath("concord", "/concordfilesext/js/concord");
	dojo.require("dojo.i18n");
	dojo.requireLocalization("concord", "ccdfilesext");
	dojo.require("lconn.share.widget.LotusDialog");
	dojo.require("concord.global");

	this.concordnls = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");
	
	dojo.provide("com.ibm.concord.lcext.CCDNewFrom");
	dojo.declare("com.ibm.concord.lcext.CCDNewFrom", [lconn.share.action.DeferredAction], {
	  name: this.concordnls.newFromName,
      tooltip: this.concordnls.newFromTooltip,
      dialog: null,
      //tooltipfixme: "Preview in Concord",//DON"T CHANGE, hachish code 
      isPrimary: true,
      

      isValid: function(file, opt) {
		var extension = file.getExtension();
	   	var new_from_format = {"ott":1, "ots":1};
	   	if (file.getPermissions().Edit && extension && new_from_format[extension.toLowerCase()]) {
	   		return true;
	   	}
	   	return false;
   	  },
      destroyDialog: function() {
          if (this.dialog) {
             this.dialog.cancel();
             this.dialog.hide();
             this.dialog.destroyRecursive();
             this.dialog = null;
          }
       },    	  
      execute: function(file, opt) {
        this.destroyDialog();

        this.concordnls = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");
        var ext = file.getExtension();
        var tpl_title_map = {"ott": this.concordnls.newFromDocTip, "ots": this.concordnls.newFromSheetTip};
        var prefill_name = {"ott": this.concordnls.newDocumentDialogInitialName, "ots": this.concordnls.newSheetDialogInitialName};
        var dialog = this.dialog = new lconn.share.widget.LotusDialog({
          title: tpl_title_map[ext],
          contentClass: "lotusDialogContent",
          //content: '<table cellpadding="0" class="lotusFormTable"><colgroup><col><col width="100%"><col></colgroup><tbody><tr class="_qkrErrorRow"><td colspan="1"></td><td colspan="2" class="lotusFormError" role="alert">Please select a person or community to share with.</td></tr></tbody></table>',
          content: '<div style="font-weight:bold;">' + this.concordnls.newDocumentDialogContent + '</div>',
          buttonOk: this.concordnls.newDocumentDialogBtnOK,
          buttonOkTitle: tpl_title_map[ext],
          buttonCancel: this.concordnls.newDocumentDialogBtnCancel,
          _size: function() {}, // Fixed dialog size
              onExecute: function(){
              this.concordnls = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");
              var extension = file.getExtension();
              var doc_type = {"ott": "text", "ots": "sheet"};
              var ext_type = {"ott": ".odt", "ots": ".ods"};

              var input_text = dojo.byId("concordnewfiledoc").value;
              if(dojo.trim(input_text) == ""){
                  dojo.byId("concordduplicatedoc").innerHTML = dojo.string.substitute(this.concordnls.newDocumentDialogIllegalErrMsg,[input_text]);
                  dialog.keepOpen();
                  return;
              }
              var ndname = dojo.byId("concordnewfiledoc").value || prefill_name[extension];
              var chkurl = null;
              if ("personalFiles" == file.getLibraryType()) {
                  chkurl = pe.baseUriPath + "form/cmis/repository/p!" + pe.authenticatedUser.id + "/objectp?p=/files/" + encodeURI(ndname + ext_type[extension]);
              } else {
                  var commContextPath = window.commContextPath;
                  commContextPath = commContextPath.replace('communities', 'files');
                  chkurl = commContextPath + "form/cmis/repository/co!" + opt.app.widgetId + "!" + opt.app.communityId + "/objectp?p=/files/" + encodeURI(ndname + ext_type[extension]);
              }
              var exists = true;
              var response, ioArgs;
              dojo.xhrGet({
                  url: chkurl,
                  //postData: sData,
                  //contentType: "text/plain; charset=UTF-8",
                  handleAs: "text",
                  preventCache: true,
                  handle: function(r, io) {
                      response = r;
                      ioArgs = io;
                  },
                  sync: true
              });
              if (response instanceof Error)
              {
                  if (ioArgs && ioArgs.xhr.status != 404) { // This contains error handle logic of 401/403/409/5XX, which are possible returns from LC side.
                      dojo.byId("concordduplicatedoc").innerHTML = dojo.string.substitute(this.concordnls.newDocumentDialogServerErrMsg2, [ndname]);
                      dialog.keepOpen(); //show();
                      return;
                  }
                  exists = false;
               }

   			if(exists) {
   				dojo.byId("concordduplicatedoc").innerHTML = this.concordnls.newDocumentDialogDupErrMsg;//style.display="block";//
   				dialog.keepOpen();//show();
   				//return;
   			}else {
   				if ("personalFiles" == file.getLibraryType()) {
   					var newfrom_url = glb_concord_url_wnd_open+"/app/newdoc?type=" +doc_type[extension]  + "&template_uri=" + file.getId() + "&doc_title=" + ndname;
   					window.open(newfrom_url, "_blank", "");
   				} else {
   					var newfrom_url = glb_concord_url_wnd_open+"/app/newdoc?type=" +doc_type[extension]  + "&template_uri=" + file.getId() + "&doc_title=" + ndname + "&community=" + file.getLibraryId();
   					window.open(newfrom_url, "_blank", "");
   				}
   			}
   		  }
   	      });
   		dialog.attr("style","width: 610px;");
   		//dialog.attr("style","height: 229px;");
   		dialog.show();

   	      var d = document;
   	            var table = d.createElement("table");
   	               table.className = "lotusFormTable";
   	               var tbody = d.createElement("tbody");

   	                  var tr = d.createElement("tr");
   	                     tr.className = "lotusFormFieldRow";
   	                     var td = d.createElement("td");
   	                        var label = d.createElement("label");
   							var namepre= this.concordnls.newDocumentDialogNamepre;
   	                           label.appendChild(d.createTextNode(namepre));
   	                        td.appendChild(label);
   	                     tr.appendChild(td);
   	                     var td = d.createElement("td");
   				var input = d.createElement("input");
   				    input.id="concordnewfiledoc";
   				    input.type = "text";
   				    input.value = prefill_name[ext];
   				    input.className = "lotusText";
   				    input.name = "_tagsdoc";
   	                        td.appendChild(input);
   	 

   	                        dojo.attr(label, "for", input.id);
   	                     tr.appendChild(td);
   	                  tbody.appendChild(tr);

   	               table.appendChild(tbody);
   	      dialog.containerNode.appendChild(table);
   	      var div = d.createElement("div");
   		div.id="concordduplicatedoc";
   		div.style.color="red";
   		div.style.fontWeight = "bold";
   	      dialog.containerNode.appendChild(div);
   	      input.select();
   	 
   	   
   		  
   		  
   	  }
	});

	dojo.provide("com.ibm.concord.lcext.CCDEdit");
	dojo.declare("com.ibm.concord.lcext.CCDEdit", [lconn.share.action.DeferredAction], {
      name: this.concordnls.editName,
      tooltip: this.concordnls.editTooltip,
      //tooltipfixme: "Preview in Concord",//DON"T CHANGE, hachish code 
      isPrimary: true,

	  isValid: function(file, opt) {
	      var extension = file.getExtension();
	      var edit_format = {"ppt":1, "otp":1, "odp":1, "ods":1, "ots":1,"xls":1,"txt":1, "docx":1,"doc":1,"odt":1,"ott":1, "pptx":1, "xlsx":1};
	      if (file.getPermissions().Edit && extension && edit_format[extension.toLowerCase()]) {
			return true;
	      }
		  return false;
	  },
      execute: function(file, opt) {
		  this.concordnls = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");
		  var extension = file.getExtension();
		  var fl_size = file.getSize();
		  var file_limit_format = {"docx":1,"doc":1,"odt":1};
		  var uri = file.getId();
		  var name = uri.replace(/[-\s.@]/g, '_');
		  window.open(glb_concord_url_wnd_open+"/app/doc/lcfiles/" + file.getId() + "/edit/content", name);
	  }
	});

	dojo.provide("com.ibm.concord.lcext.CCDView");
	dojo.declare("com.ibm.concord.lcext.CCDView", [lconn.share.action.DeferredAction], {
      name: this.concordnls.viewName,
      tooltip: this.concordnls.viewTooltip,
      //tooltipfixme: "Preview in Concord",//DON"T CHANGE, hachish code 
      isPrimary: true,

	  isValid: function(file, opt) {
	      var extension = file.getExtension();
	      var view_format = {"ppt":1, "otp":1, "odp":1, "ott":1, "docx":1,"doc":1,"odt":1, "ods":1, "ots":1, "xls":1, "xlsx":1};
	      if((opt.app && opt.app.authenticatedUser) || (opt.permissions && opt.permissions.isAuthenticated())) {
		      if (file.getPermissions().View && extension && view_format[extension.toLowerCase()]) {
				return true;
		      }
	      }
		  return false;
	  },
      execute: function(file, opt) {
		  window.open(glb_concord_url_wnd_open+"/app/doc/lcfiles/"+file.getId()+"/view/content", "_blank", "");
	  }
	});
   dojo.declare("com.ibm.concord.lcext.CCDPDFExport", [lconn.share.action.DeferredAction], {
      name: this.concordnls.downloadAsPDF, 
      tooltip: this.concordnls.downloadAsPDF, 
      //tooltipfixme: "Preview in Concord",//DON"T CHANGE, hachish code 
      isPrimary: false,

   isValid: function(file, opt) {
      var extension = file.getExtension();
      //48490 remvove PDF download for presentation files
      var pdf_format = {"ott":1, "docx":1,"doc":1,"odt":1, "ods":1, "ots":1, "xls":1, "xlsx":1, "odp":1, "ppt":1, "pptx":1};
      if((opt.app && opt.app.authenticatedUser) || (opt.permissions && opt.permissions.isAuthenticated())) {
	      if (file.getPermissions().View && extension && pdf_format[extension.toLowerCase()]) {
		return true;
	      }
      }
	return false;
   },
      execute: function(file, opt) {
    	  var windowOpenCommand = function() { window.open(glb_concord_url_wnd_open+"/app/doc/lcfiles/" + file.getId() + "/view/content?asFormat=pdf", "_blank", "")};
    	  var nonSavedDraftValidator = new com.ibm.concord.lcext.NonSavedDraftValidator( file, windowOpenCommand);
    	  nonSavedDraftValidator.execute();
      }
   });

   dojo.declare("com.ibm.concord.lcext.CCDMSFormatExport", [lconn.share.action.DeferredAction], {
	      name: this.concordnls.downloadAsMS, 
	      tooltip: this.concordnls.downloadAsMS, 
	      //tooltipfixme: "Preview in Concord",//DON"T CHANGE, hachish code 
	      isPrimary: false,

	   isValid: function(file, opt) {
	      var ext = file.getExtension();
	      // this object also used to open different url per the key/values
	      var msexp = {"ott":1, "odt":1, "ods":1, "ots":1, "odp":1};
	      if((opt.app && opt.app.authenticatedUser) || (opt.permissions && opt.permissions.isAuthenticated())) {
		      if (file.getPermissions().View && ext && msexp[ext.toLowerCase()]) {
		    	  return true;
		      }
	      }
		return false;
	   },
	      execute: function(file, opt) {
		   var ext = file.getExtension();
		   var msexp = {"ppt":"ppt", "otp":"ppt", "odp":"ppt", "pptx":"ppt", 
   		  		"ott":"doc", "docx":"doc","doc":"doc","odt":"doc", 
   		  		"ods":"xls", "ots":"xls", "xls":"xls", "xlsx":"xls"};  
	    	  var windowOpenCommand = function() { return window.open(glb_concord_url_wnd_open+"/app/doc/lcfiles/" + file.getId() + "/view/content?asFormat=" + msexp[ext.toLowerCase()], "_blank", "")};
	    	  var nonSavedDraftValidator = new com.ibm.concord.lcext.NonSavedDraftValidator( file, windowOpenCommand);
	    	  nonSavedDraftValidator.execute();
	      }
	   });  
   
   		dojo.provide("com.ibm.concord.lcext.NonSavedDraftValidator");
   		dojo.declare("com.ibm.concord.lcext.NonSavedDraftValidator", null, {
   			constructor: function(file, windowOpenCommand){
   				// save a reference to this object
   				var that = this;
   				this.file = file;
   				this.windowOpenCommand = windowOpenCommand;
   				this.concordnls = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");
   				if (file.getPermissions().Edit) {
   					this.dialogContent = this.concordnls.downloadWithUnsavedDraftDescription;
   					this.buttonOkLabel = this.concordnls.draft_save_action_label;
   				} else {
   					this.dialogContent = this.concordnls.downloadWithUnsavedDraftReadersDescription;
   					this.buttonOkLabel = this.concordnls.downloadWithUnsavedDraftReadersOkLabel;
   				}
   				this.url = glb_concord_url + "/api/docsvr/lcfiles/" + this.file.getId() + "/draft";
   				this.save_draft_url = glb_concord_url + "/api/docsvr/lcfiles/" + this.file.getId() + "/draft?respect_cache=true";
   				this.save_draft_func = function() {
   					dojo.xhrPost({
   						url: this.save_draft_url,
   						handleAs: "json",
   						postData: dojo.toJson({}),
   						headers: {
	    				  "Content-Type": "application/json"
   						},
   						handle: function(r, io) {
   							//remove draft message from page
   							var docs_indi =document.getElementById("draft_indicator_concord");
   							if (docs_indi != null) docs_indi.style.display = "none";
   							that.windowOpenCommand();
   						}
   					});
   				};
   			  
   				this.dialog = new lconn.share.widget.LotusDialog({
   					title: this.concordnls.downloadWithUnsavedDraftTitle,
   					contentClass: "lotusDialogContent",
   					content: '<div"><p>' + this.dialogContent + '</p><div>',
   					buttonOk: this.buttonOkLabel,
   					buttonOkTitle: this.buttonOkLabel,
   					buttonCancel: this.concordnls.newDocumentDialogBtnCancel,
   					_size: function() {}, // Fixed dialog size
   					onExecute: function(){
   						if (file.getPermissions().Edit){
   							that.save_draft_func();
   						} else {
   							that.windowOpenCommand();
   						}
   					},
   					onCancel: function(){
   						that.dialog.hide(); 
   						if (file.getPermissions().Edit){
   							that.windowOpenCommand();
   						}
   						that.dialog.destroy();
   					}
   				});
   				this.dialog.attr("style", "width: 460px;");
   			  
   				this.handler = function(r, io) {
   					if (r instanceof Error) 
					{
						that.windowOpenCommand();
						return false;
					}

   					var list = r.editors;
   					var dirty = r.dirty;

   					if ( dirty || list.length > 0) {	   	             
   						that.dialog.show();
   					} else {
   						that.windowOpenCommand();
   					}
   				};
   				
   				this.execute = function(){
   					dojo.xhrGet({
   						url: this.url,
   						handle: this.handler,
   						sync: false,
   						handleAs: "json",
   						preventCache: true
   					});
   				}
   			}
	   });
