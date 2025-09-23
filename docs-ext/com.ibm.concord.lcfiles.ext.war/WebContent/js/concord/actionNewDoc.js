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

dojo.subscribe("lconn/share/app/start", function() {
    dojo.registerModulePath("concord", "/concordfilesext/js/concord");
    dojo.require("concord.global");

    if(!concord.global.showConcordEntry()) {
        return;
    }

    dojo.require("dojo.i18n");
    dojo.requireLocalization("concord", "ccdfilesext");
    dojo.require("lconn.share.action.Action");
    dojo.require("lconn.share.widget.FileRendererMenu");
    dojo.require("lconn.share.widget.LotusDialog");

    dojo.provide("com.ibm.concord.lcext.NewConcord");
    dojo.declare("com.ibm.concord.lcext.NewConcord", lconn.share.action.DeferredAction, {
        constructor: function(app, opts) {
            this.concordnls = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");
            this.app = app;
            //var nls = app.nls.UPLOAD_FILE;
            this.name = this.concordnls.newName;
            this.tooltip = this.concordnls.newTooltip;
            this.concordlabel = true; //DON"T CHANGE, hachish code
        },

        isValid: function(item, opt) {
            if (item === undefined || item == null) {
            	var user = this.app.getAuthenticatedUser();
            	return this.app.features && this.app.features.personalFileSharing && user && user.permissions && this.app.getCollection() && user.permissions.canShareWithCommunity();
            } else {
                return (this.app.authenticatedUser && item.id == this.app.authenticatedUser.id);
            }
        },

        execute: function(item, opt) {
            ;
        }
    });

    dojo.provide("com.ibm.concord.lcext.NewConcordDoc");
    dojo.declare("com.ibm.concord.lcext.NewConcordDoc", lconn.share.action.Action, {
        constructor: function(app, opts) {
            this.concordnls = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");
            this.app = app;
            this.name = this.concordnls.newDocumentName;
            this.dialog = null;
            this.tooltip = this.concordnls.newDocumentTooltip;
            //tooltipfixme : "Create a new Concord Document"; //DON"T CHANGE, hachish code  for showing concord icon
        },

        isValid: function(item, opt) {
            if (item === undefined || item == null) {
                return this.app.authenticatedUser;
            } else {
                return (this.app.authenticatedUser && item.id == this.app.authenticatedUser.id);
            }
        },
        destroyDialog: function() {
            if (this.dialog) {
               this.dialog.cancel();
               this.dialog.hide();
               this.dialog.destroyRecursive();
               this.dialog = null;
            }
         },    
        execute: function(item, opt) {
        	this.destroyDialog();
            var dialog = this.dialog = new lconn.share.widget.LotusDialog({
                title: this.concordnls.newDocumentDialogTitle,
                contentClass: "lotusDialogContent",
                //content: '<table cellpadding="0" class="lotusFormTable"><colgroup><col><col width="100%"><col></colgroup><tbody><tr class="_qkrErrorRow"><td colspan="1"></td><td colspan="2" class="lotusFormError" role="alert">Please select a person or community to share with.</td></tr></tbody></table>',
                content: '<div style="font-weight:bold;">' + this.concordnls.newDocumentDialogContent + '</div>',
                buttonOk: this.concordnls.newDocumentDialogBtnOK,
                buttonOkTitle: this.concordnls.newDocumentDialogBtnOKTitle,
                buttonCancel: this.concordnls.newDocumentDialogBtnCancel,
                _size: function() {},
                // Fixed dialog size
                onExecute: function() {
                    var concordnls = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");
                    var input_text = dojo.byId("concordnewfiledoc").value;
                    if (dojo.trim(input_text) == "") {
                        dojo.byId("concordduplicatedoc").innerHTML = dojo.string.substitute(concordnls.newDocumentDialogIllegalErrMsg, [input_text]);
                        dialog.keepOpen();
                        return;
                    }

                    var ndname = dojo.byId("concordnewfiledoc").value || concordnls.newDocumentDialogInitialName;
                    var chkurl = null;
                    if (typeof opt.app === 'undefined') {
                        chkurl = pe.baseUriPath + "form/cmis/repository/p!" + pe.authenticatedUser.id + "/objectp?p=/files/" + encodeURI(ndname + ".odt");
                    } else {
                        var commContextPath = window.commContextPath;
                        commContextPath = commContextPath.replace('communities', 'files');
                        chkurl = commContextPath + "form/cmis/repository/co!" + opt.app.widgetId + "!" + opt.app.communityId + "/objectp?p=/files/" + encodeURI(ndname + ".odt");
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
                    if (response instanceof Error) {
			if (ioArgs && ioArgs.xhr.status != 404) { // This contains error handle logic of 401/403/409/5XX, which are possible returns from LC side.
                            dojo.byId("concordduplicatedoc").innerHTML = dojo.string.substitute(concordnls.newDocumentDialogServerErrMsg2, [ndname]);
                            dialog.keepOpen(); //show();
			    return;
			}
                        exists = false;
                    }
                    //else if (response == "true")
                    //{
                    //        exists = true;
                    //}*/
                    if (exists) {
                        dojo.byId("concordduplicatedoc").innerHTML = concordnls.newDocumentDialogDupErrMsg; //style.display="block";//
                        dialog.keepOpen(); //show();
                        //return;
                    } else {
                    	var servletUrl = null;
                    	if (typeof opt.app === 'undefined') {
                            servletUrl = glb_concord_url + "/api/docsvr/text";
                    	} else {
                            opt.app.getLibrary(true);
                            servletUrl = glb_concord_url + "/api/docsvr/text?community=" + opt.app.library.getId();
                    	}

                        var emptyDoc = {};
                        // need an empty
                        emptyDoc.title = ndname; // "Untitled Draft";
                        emptyDoc.newTitle = ndname; // "Untitled Draft";
                        //emptyDoc.content = "<html><head></head><body><p>&nbsp;</p></body></html>";
                        emptyDoc.content = "<html><head></head><body class='concord_Doc_Style_1'><p><br class='hideInIE'></p></body></html>";
                        var sData = dojo.toJson(emptyDoc);
                        //var sData = JSON.stringify(emptyDoc, null);
                        dojo.xhrPost({
                            url: servletUrl,
                            handleAs: "json",
                            handle: function(r, io) {
                                response = r;
                                ioArgs = io;
                                if (response instanceof Error) {
                                    return;
                                }
                                var newUri = glb_concord_url_wnd_open + "/app/doc/" + response.repo_id + "/" + response.doc_uri + "/edit/content";
                                var uni_name = response.doc_uri.replace(/[-\s.@]/g, '_');
                                window.open(newUri, uni_name);
                            },
                            sync: true,
                            contentType: "text/plain",
                            postData: sData
                        });

                        if (ioArgs && ioArgs.xhr.status >= 404) { //any type of server request error include 4xx or 5xx
                            dojo.byId("concordduplicatedoc").innerHTML = dojo.string.substitute(concordnls.newDocumentDialogServerErrMsg, [ndname]);
                            dialog.keepOpen();
                        }else if (response instanceof Error) {
                            //dojo.byId("concordduplicatedoc").innerHTML = ndname + dojo.i18n.getLocalization("concord","ccdfilesext").newDocumentDialogIllegalErrMsg;
                            dojo.byId("concordduplicatedoc").innerHTML = dojo.string.substitute(concordnls.newDocumentDialogIllegalErrMsg, [ndname]);
                            dialog.keepOpen();
                        } else {
                            dialog.hide();
                            dialog.destroy();
                        }
                    }
                }
            });
            dialog.attr("style", "width: 510px;");
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
            var namepre = this.concordnls.newDocumentDialogNamepre;
            label.appendChild(d.createTextNode(namepre));
            td.appendChild(label);
            tr.appendChild(td);
            var td = d.createElement("td");
            var input = d.createElement("input");
            input.id = "concordnewfiledoc";
            input.type = "text";
            input.value = this.concordnls.newDocumentDialogInitialName;
            input.className = "lotusText";
            input.name = "_tagsdoc";
            td.appendChild(input);

            dojo.attr(label, "for", input.id);
            tr.appendChild(td);
            tbody.appendChild(tr);

            table.appendChild(tbody);
            dialog.containerNode.appendChild(table);
            var div = d.createElement("div");
            div.id = "concordduplicatedoc";
            div.style.color = "red";
            div.style.fontWeight = "bold";
            dialog.containerNode.appendChild(div);
            input.select();
        }
    });

    dojo.provide("com.ibm.concord.lcext.NewConcordSheet");
    dojo.declare("com.ibm.concord.lcext.NewConcordSheet", lconn.share.action.Action, {
        constructor: function(app, opts) {
            this.concordnls = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");
            this.app = app;
            this.name = this.concordnls.newSheetName;
            this.dialog = null;
            this.tooltip = this.concordnls.newSheetTooltip;
            //tooltipfixme : "Create a new Concord Document"; //DON"T CHANGE, hachish code  for showing concord icon
        },

        isValid: function(item, opt) {
            if (item === undefined || item == null) {
                return this.app.authenticatedUser;
            } else {
                return (this.app.authenticatedUser && item.id == this.app.authenticatedUser.id);
            }
        },
        destroyDialog: function() {
            if (this.dialog) {
               this.dialog.cancel();
               this.dialog.hide();
               this.dialog.destroyRecursive();
               this.dialog = null;
            }
         }, 
        execute: function(item, opt) {
        	this.destroyDialog();
            var dialog = this.dialog = new lconn.share.widget.LotusDialog({
                title: this.concordnls.newSheetDialogTitle,
                contentClass: "lotusDialogContent",
                //content: '<table cellpadding="0" class="lotusFormTable"><colgroup><col><col width="100%"><col></colgroup><tbody><tr class="_qkrErrorRow"><td colspan="1"></td><td colspan="2" class="lotusFormError" role="alert">Please select a person or community to share with.</td></tr></tbody></table>',
                content: '<div style="font-weight:bold;">' + this.concordnls.newDocumentDialogContent + '</div>',
                buttonOk: this.concordnls.newDocumentDialogBtnOK,
                buttonOkTitle: this.concordnls.newSheetDialogBtnOKTitle,
                buttonCancel: this.concordnls.newDocumentDialogBtnCancel,
                _size: function() {},
                // Fixed dialog size
                onExecute: function() {
                    var concordnls = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");
                    var input_text = dojo.byId("concordnewfilesheet").value;
                    if (dojo.trim(input_text) == "") {
                        dojo.byId("concordduplicatesheet").innerHTML = dojo.string.substitute(concordnls.newDocumentDialogIllegalErrMsg, [input_text]);
                        dialog.keepOpen();
                        return;
                    }

                    var ndname = dojo.byId("concordnewfilesheet").value || concordnls.newSheetDialogInitialName;
                    var chkurl = null;
                    if (typeof opt.app === 'undefined') {
                        chkurl = pe.baseUriPath + "form/cmis/repository/p!" + pe.authenticatedUser.id + "/objectp?p=/files/" + encodeURI(ndname + ".ods");
                    } else {
                        var commContextPath = window.commContextPath;
                        commContextPath = commContextPath.replace('communities', 'files');
                        chkurl = commContextPath + "form/cmis/repository/co!" + opt.app.widgetId + "!" + opt.app.communityId + "/objectp?p=/files/" + encodeURI(ndname + ".ods");
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
                    if (response instanceof Error) {
                        if (ioArgs && ioArgs.xhr.status != 404) { // This contains error handle logic of 401/403/409/5XX, which are possible returns from LC side.
                            dojo.byId("concordduplicatesheet").innerHTML = dojo.string.substitute(concordnls.newDocumentDialogServerErrMsg2, [ndname]);
                            dialog.keepOpen(); //show();
			    return;
			}
                        exists = false;
                    }
                    //else if (response == "true")
                    //{
                    //        exists = true;
                    //}*/
                    if (exists) {
                        dojo.byId("concordduplicatesheet").innerHTML = concordnls.newDocumentDialogDupErrMsg; //style.display="block";//
                        dialog.keepOpen(); //show();
                        //return;
                    } else {
                    	var servletUrl = null;
                    	if (opt.app == undefined) {
                            servletUrl = glb_concord_url + "/api/docsvr/sheet";
                    	} else {
                            opt.app.getLibrary(true);
                            servletUrl = glb_concord_url + "/api/docsvr/sheet?community=" + opt.app.library.getId();
                    	}

                        var emptyDoc = {};
                        // need an empty
                        //emptyDoc.title = ndname;// "Untitled Draft";
                        emptyDoc["newTitle"] = ndname; // "Untitled Draft";
                        emptyDoc["st0"] = concordnls.sheetTitle0;
                        emptyDoc["st1"] = concordnls.sheetTitle1;
                        emptyDoc["st2"] = concordnls.sheetTitle2;
                        //emptyDoc.content = "<html><head></head><body><p>&nbsp;</p></body></html>";
                        var sData = dojo.toJson(emptyDoc);
                        //var sData = JSON.stringify(emptyDoc, null);
                        dojo.xhrPost({
                            url: servletUrl,
                            handleAs: "json",
                            handle: function(r, io) {
                                response = r;
                                ioArgs = io;
                                if (response instanceof Error) {
                                    return;
                                }
                                var newUri = glb_concord_url_wnd_open + "/app/doc/" + response.repo_id + "/" + response.doc_uri + "/edit/content";
                                var uni_name = response.doc_uri.replace(/[-\s.@]/g, '_');
                                window.open(newUri, uni_name);
                            },
                            sync: true,
                            contentType: "text/plain",
                            postData: sData
                        });

                        if (ioArgs && ioArgs.xhr.status >= 404) { //any type of server request error include 4xx or 5xx
                            dojo.byId("concordduplicatesheet").innerHTML = dojo.string.substitute(concordnls.newDocumentDialogServerErrMsg, [ndname]);
                            dialog.keepOpen();
                        }else if (response instanceof Error) {
                            //dojo.byId("concordduplicatesheet").innerHTML = ndname + dojo.i18n.getLocalization("concord","ccdfilesext").newDocumentDialogIllegalErrMsg;
                            dojo.byId("concordduplicatesheet").innerHTML = dojo.string.substitute(concordnls.newDocumentDialogIllegalErrMsg, [ndname]);
                            dialog.keepOpen();
                        } else {
                            dialog.hide();
                            dialog.destroy();
                        }
                    }
                }
            });
            dialog.attr("style", "width: 510px;");
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
            var namepre = this.concordnls.newDocumentDialogNamepre;
            label.appendChild(d.createTextNode(namepre));
            td.appendChild(label);
            tr.appendChild(td);
            var td = d.createElement("td");
            var input = d.createElement("input");
            input.id = "concordnewfilesheet";
            input.type = "text";
            input.value = this.concordnls.newSheetDialogInitialName;
            input.className = "lotusText";
            input.name = "_tagssheet";
            td.appendChild(input);

            dojo.attr(label, "for", input.id);
            tr.appendChild(td);
            tbody.appendChild(tr);

            table.appendChild(tbody);
            dialog.containerNode.appendChild(table);
            var div = d.createElement("div");
            div.id = "concordduplicatesheet";
            div.style.color = "red";
            div.style.fontWeight = "bold";
            dialog.containerNode.appendChild(div);
            input.select();
        }
    });

    dojo.provide("com.ibm.concord.lcext.NewConcordPres");
    dojo.declare("com.ibm.concord.lcext.NewConcordPres", lconn.share.action.Action, {
        constructor: function(app, opts) {
            this.concordnls = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");
            this.app = app;
            this.name = this.concordnls.newPresName;
            this.dialog = null;
            this.tooltip = this.concordnls.newPresTooltip;
            //tooltipfixme : "Create a new Concord Document"; //DON"T CHANGE, hachish code  for showing concord icon
        },

        isValid: function(item, opt) {
            if (item === undefined || item == null) {
                return this.app.authenticatedUser;
            } else {
                return (this.app.authenticatedUser && item.id == this.app.authenticatedUser.id);
            }
        },
        destroyDialog: function() {
            if (this.dialog) {
               this.dialog.cancel();
               this.dialog.hide();
               this.dialog.destroyRecursive();
               this.dialog = null;
            }
         }, 
        execute: function(item, opt) {
        	this.destroyDialog();
            var dialog = this.dialog = new lconn.share.widget.LotusDialog({
                title: this.concordnls.newPresDialogTitle,
                contentClass: "lotusDialogContent",
                //content: '<table cellpadding="0" class="lotusFormTable"><colgroup><col><col width="100%"><col></colgroup><tbody><tr class="_qkrErrorRow"><td colspan="1"></td><td colspan="2" class="lotusFormError" role="alert">Please select a person or community to share with.</td></tr></tbody></table>',
                content: '<div style="font-weight:bold;">' + this.concordnls.newDocumentDialogContent + '</div>',
                buttonOk: this.concordnls.newDocumentDialogBtnOK,
                buttonOkTitle: this.concordnls.newPresDialogBtnOKTitle,
                buttonCancel: this.concordnls.newDocumentDialogBtnCancel,
                _size: function() {},
                // Fixed dialog size
                onExecute: function() {
                    var concordnls = lconn.core.i18nOverrider.originalFunction ? lconn.core.i18nOverrider.originalFunction("concord","ccdfilesext") : dojo.i18n.getLocalization("concord","ccdfilesext");
                    var input_text = dojo.byId("concordnewfilepres").value;
                    if (dojo.trim(input_text) == "") {
                        dojo.byId("concordduplicatepres").innerHTML = dojo.string.substitute(concordnls.newDocumentDialogIllegalErrMsg, [input_text]);
                        dialog.keepOpen();
                        return;
                    }

                    var ndname = dojo.byId("concordnewfilepres").value || concordnls.newPresDialogInitialName;
                    var chkurl = null;
                    if (opt.app == undefined) {
                        chkurl = pe.baseUriPath + "form/cmis/repository/p!" + pe.authenticatedUser.id + "/objectp?p=/files/" + encodeURI(ndname + ".odp");
                    } else {
                        var commContextPath = window.commContextPath;
                        commContextPath = commContextPath.replace('communities', 'files');
                        chkurl = commContextPath + "form/cmis/repository/co!" + opt.app.widgetId + "!" + opt.app.communityId + "/objectp?p=/files/" + encodeURI(ndname + ".odp");
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
                    if (response instanceof Error) {
                        if (ioArgs && ioArgs.xhr.status != 404) { // This contains error handle logic of 401/403/409/5XX, which are possible returns from LC side.
                            dojo.byId("concordduplicatepres").innerHTML = dojo.string.substitute(concordnls.newDocumentDialogServerErrMsg2, [ndname]);
                            dialog.keepOpen(); //show();
			    return;
			}
                        exists = false;
                    }
                    //else if (response == "true")
                    //{
                    //        exists = true;
                    //}*/
                    if (exists) {
                        dojo.byId("concordduplicatepres").innerHTML = concordnls.newDocumentDialogDupErrMsg; //style.display="block";//
                        dialog.keepOpen(); //show();
                        //return;
                    } else {
                        var servletUrl = null;
                    	if (typeof opt.app === 'undefined') {
                            servletUrl = glb_concord_url + "/api/docsvr/pres";
                    	} else {
                           opt.app.getLibrary(true);
                           servletUrl = glb_concord_url + "/api/docsvr/pres?community=" + opt.app.library.getId();
                    	}

                        var emptyDoc = {};
                        // need an empty
                        emptyDoc.title = ndname; // "Untitled Draft";
                        emptyDoc.newTitle = ndname; // "Untitled Draft";
                        emptyDoc.template = "default"; // "Untitled Draft";
                        emptyDoc.content = "<html><head></head><body><p>&nbsp;</p></body></html>";
                        var sData = dojo.toJson(emptyDoc);
                        //var sData = JSON.stringify(emptyDoc, null);
                        dojo.xhrPost({
                            url: servletUrl,
                            handleAs: "json",
                            handle: function(r, io) {
                                response = r;
                                ioArgs = io;
                                if (response instanceof Error) {
                                    return;
                                }
                                var newUri = glb_concord_url_wnd_open + "/app/doc/" + response.repo_id + "/" + response.doc_uri + "/edit/content";
                                var uni_name = response.doc_uri.replace(/[-\s.@]/g, '_');
                                window.open(newUri, uni_name);
                            },
                            sync: true,
                            contentType: "text/plain",
                            postData: sData
                        });

                        if (ioArgs && ioArgs.xhr.status >= 404) { //any type of server request error include 4xx or 5xx
                            dojo.byId("concordduplicatepres").innerHTML = dojo.string.substitute(concordnls.newDocumentDialogServerErrMsg, [ndname]);
                            dialog.keepOpen();
                        }else if (response instanceof Error) {
                            //dojo.byId("concordduplicatepres").innerHTML = ndname + dojo.i18n.getLocalization("concord","ccdfilesext").newDocumentDialogIllegalErrMsg;
                            dojo.byId("concordduplicatepres").innerHTML = dojo.string.substitute(concordnls.newDocumentDialogIllegalErrMsg, [ndname]);
                            dialog.keepOpen();
                        } else {
                            dialog.hide();
                            dialog.destroy();
                        }
                    }

                }
            });
            dialog.attr("style", "width: 510px;");
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
            var namepre = this.concordnls.newDocumentDialogNamepre;
            label.appendChild(d.createTextNode(namepre));
            td.appendChild(label);
            tr.appendChild(td);
            var td = d.createElement("td");
            var input = d.createElement("input");
            input.id = "concordnewfilepres";
            input.type = "text";
            input.value = this.concordnls.newPresDialogInitialName;
            input.className = "lotusText";
            input.name = "_tagsdoc";
            td.appendChild(input);

            dojo.attr(label, "for", input.id);
            tr.appendChild(td);
            tbody.appendChild(tr);

            table.appendChild(tbody);
            dialog.containerNode.appendChild(table);
            var div = d.createElement("div");
            div.id = "concordduplicatepres";
            div.style.color = "red";
            div.style.fontWeight = "bold";
            dialog.containerNode.appendChild(div);
            input.select();
        }
    });

    lconn.core.uiextensions.add("lconn/files/actions/comm/ref/create", function(actions, s, app, scene, opts) {
        //actions.unshift(new com.ibm.concord.lcext.NewConcordSheet(app, opts));
        //actions.unshift(new com.ibm.concord.lcext.NewConcordPres(app, opts));
        //actions.unshift(new com.ibm.concord.lcext.NewConcordDoc(app, opts));
    	
    	// In community files widget, the actions may be added more than one time, so check if the actions exist or not firstly, please see detail in defect 45730.
    	var bHasAdded = false;
    	var len = (actions != null && typeof(actions) != 'undefined') ? actions.length : 0;
    	for (var index = 0; index < len; index++)
        {
            if (actions[index] != null && "com.ibm.concord.lcext.NewConcord" == actions[index].declaredClass)
            {
                bHasAdded = true;
                break;
            }
        }
        if (!bHasAdded)
        {
            actions.unshift(new com.ibm.concord.lcext.NewConcord(app, opts));
        }
    });

    lconn.share.scenes.actions.ccd_render = lconn.share.scenes.actions._render;
    lconn.share.scenes.actions._render = function (d, container, fWrap, item, actions, msgLoading, msgMoreActions, opt) {
        opt = opt || {};
        var visibleActions = opt.visibleActions || 3;
        var validActions = dojo.filter(actions, function(action) {return action.isValid(item,opt);});
     
        if (validActions.length == 0 && opt.msgEmpty) {
           var msgNode = d.createTextNode(opt.msgEmpty);
           var wrapper = fWrap(d, msgNode, !container.firstChild);
           container.appendChild(wrapper); 
           return;
        }
        
        var moreActions = [];
        var primaryActions = [];
        for (var i=0,a; a=validActions[i]; i++) {
           var f = a.isPrimary;
           if ((typeof f == "function") ? a.isPrimary() : !!f)
              primaryActions.push(a);
           else
              moreActions.push(a);
        };
        while (primaryActions.length < visibleActions && moreActions.length > 0)
           primaryActions.push(moreActions.shift());
        if (moreActions.length == 1)
           primaryActions.push(moreActions.shift());
        
        for (var i=0,action; action=primaryActions[i]; i++) {
           if (action.concordlabel) {
        	   var a = d.createElement("a");
               a.href = "javascript:;";
               a.appendChild(d.createTextNode(action.name));
               a.title = action.name;
               dijit.setWaiRole(a, "button");
               dijit.setWaiState(a, "haspopup", true);

               a.appendChild(d.createTextNode(" "));

               var img = d.createElement("img");
               img.alt = "";
               img.className = "lotusArrow lotusDropDownSprite";
               img.src = dijit._Widget.prototype._blankGif;
               a.appendChild(img);

               var altSpan = d.createElement("span");
               altSpan.className = "lotusAltText";
               altSpan.appendChild(d.createTextNode("\u25BC"));
               a.appendChild(altSpan);

               var wrapper = fWrap(d, a, !container.firstChild, true);
               container.appendChild(wrapper);

               var menu = new dijit.Menu();
               dojo.addClass(menu.domNode, "lotusActionMenu");
               dojo.addClass(menu.domNode, "lotusPlain");

               var newActions = [new com.ibm.concord.lcext.NewConcordDoc(opt.app, null), new com.ibm.concord.lcext.NewConcordSheet(opt.app, null), new com.ibm.concord.lcext.NewConcordPres(opt.app, null)];
               for (var j=0,action; action=newActions[j]; j++) {
                  var actionOpt = {}; dojo.mixin(actionOpt, opt);
                  menu.addChild(new dijit.MenuItem({
                     label: action.getName(item, actionOpt),
                     title: action.getTooltip(item, actionOpt),
                     onClick: dojo.hitch(action, action.execute, item, actionOpt)
                  }));
               }
               lconn.core.MenuUtility.attachListeners(menu, a);
               var span = container.appendChild(d.createElement("span"));
               span.style.display = "none";
               span.setAttribute("widgetid", menu.id);
           } else {
               var a = d.createElement("a");
               var actionOpt = {}; dojo.mixin(actionOpt, opt);
               var url = action.getUrlResource(item, actionOpt);
               a.href = url || "javascript:;";
               dojo.connect(a, "onclick", dojo.hitch(action, action.execute, item, actionOpt));
               var name = action.getName(item, opt);
               /* Callers that return a deferred must set an errback handler to prevent "loading..." from displaying forever */
               if (name instanceof dojo.Deferred) {
                  a.appendChild(d.createTextNode(msgLoading));
                  var lssa = lconn.share.scenes.actions;
                  name.addCallback(dojo.partial(lssa._deferredName, a));
               }
               else
                  a.appendChild(d.createTextNode(name));
               a.title = action.getTooltip(item, actionOpt);
               dijit.setWaiRole(a, "button");
               if (action.addExtra)
                  action.addExtra(item, a);
               var wrapper = fWrap(d, a, !container.firstChild);
               container.appendChild(wrapper);
           }
        }

        if (moreActions.length > 0) {
            var a = d.createElement("a");
            a.href = "javascript:;";
            a.appendChild(d.createTextNode(msgMoreActions));
            a.title = msgMoreActions;
            dijit.setWaiRole(a, "button");
            dijit.setWaiState(a, "haspopup", true);

            a.appendChild(d.createTextNode(" "));

            var img = d.createElement("img");
            img.alt = "";
            img.className = "lotusArrow lotusDropDownSprite";
            img.src = dijit._Widget.prototype._blankGif;
            a.appendChild(img);

            var altSpan = d.createElement("span");
            altSpan.className = "lotusAltText";
            altSpan.appendChild(d.createTextNode("\u25BC"));
            a.appendChild(altSpan);

            var wrapper = fWrap(d, a, !container.firstChild, true);
            container.appendChild(wrapper);

            var menu = new dijit.Menu();
            dojo.addClass(menu.domNode, "lotusActionMenu");
            dojo.addClass(menu.domNode, "lotusPlain");

            for (var i=0,action; action=moreActions[i]; i++) {
               var actionOpt = {}; dojo.mixin(actionOpt, opt);
               menu.addChild(new dijit.MenuItem({
                  label: action.getName(item, actionOpt),
                  title: action.getTooltip(item, actionOpt),
                  onClick: dojo.hitch(action, action.execute, item, actionOpt)
               }));
            }
            lconn.core.MenuUtility.attachListeners(menu, a);
            var span = container.appendChild(d.createElement("span"));
            span.style.display = "none";
            span.setAttribute("widgetid", menu.id);
        }
    };

    lconn.core.uiextensions.add("lconn/files/actions/create", function(actions, s, app, opts) {
        actions.splice(2, 1, new com.ibm.concord.lcext.NewConcord(app, opts));
    });

    //Hack for Edit button is no more required, symphony icon is removed for latest UX Design
    //lconn.share.scenes.actions.ccd_render=lconn.share.scenes.actions._render;
    //lconn.share.scenes.actions._render = function(d, container, fWrap, item, actions, msgLoading, msgMoreActions, opt) {};
    //Hack for Edit button is no more required, symphony icon is removed for latest UX Design
    //lconn.share.widget.FileRendererMenu.prototype.ccd_completeMenuLoad=lconn.share.widget.FileRendererMenu.prototype.completeMenuLoad;
    //lconn.share.widget.FileRendererMenu.prototype.completeMenuLoad=function(stream, data, item, position, response, ioArgs) {};
    //Hack for New (group) is required, because we still need to change original New (folder) to New Menu with 4 pop-menus
    lconn.files.scenehelper.ccd_applyPlaceBar = lconn.files.scenehelper.applyPlaceBar;
    lconn.files.scenehelper.applyPlaceBar = function(d, el, app) {

        var authenticatedUser = app.authenticatedUser;
        var scene = app.scene;

        var hasPlace = authenticatedUser && authenticatedUser.hasPersonalPlace == true;

        el.style.display = "";

        var divr = d.createElement("div");
        divr.className = "lotusRightCorner";

        var divi = d.createElement("div");
        divi.className = "lotusInner";
        dijit.setWaiRole(divi, "toolbar");
        dijit.setWaiState(divi, "label", app.nls.CONTENT.GLOBAL_ACTIONS);

        var globalActions = app.getGlobalActions();
        if (globalActions.length > 0) {
            var btnContainer = d.createElement("div");
            btnContainer.className = "lotusBtnContainer lotusLeft";

            for (var i = 0; i < globalActions.length; i++) {
                var action = globalActions[i];
                if (action.isValid(authenticatedUser, {})) {
                    var span = d.createElement("SPAN");
                    span.id = "placeAction" + i;
                    span.className = "lotusBtn lotusBtnAction";
                    var a = d.createElement("A");
                    a.href = action.getUrlResource(authenticatedUser, {}) || "javascript:;";
                    dojo.connect(a, "onclick", dojo.hitch(action, action.execute, authenticatedUser, {}));
                    a.appendChild(d.createTextNode(action.getName(authenticatedUser, {})));
                    a.title = action.getTooltip(authenticatedUser, {});
                    dijit.setWaiRole(a, "button");
                    if (action.concordlabel) {
                        var img = d.createElement("img"); //reverse triangle icon for New group
                        a.appendChild(d.createTextNode(" "));
                        img.alt = "";
                        img.className = "lotusArrow lotusDropDownSprite";
                        img.src = dijit._Widget.prototype._blankGif;
                        a.appendChild(img);

                        var altSpan = d.createElement("span");
                        altSpan.className = "lotusAltText";
                        altSpan.appendChild(d.createTextNode("\u25BC"));
                        a.appendChild(altSpan);

                        //The following code is to add pop-menu
                        var menu = new dijit.Menu();
                        dojo.addClass(menu.domNode, "lotusActionMenu");
                        dojo.addClass(menu.domNode, "lotusPlain");
                        var actionCC = new lconn.files.action.CreateCollection(app, null);
                        var actionOpt = {};
                        dojo.mixin(actionOpt, null);
                        menu.addChild(new dijit.MenuItem({
                            label: actionCC.getName(null, actionOpt),
                            title: actionCC.getTooltip(null, actionOpt),
                            onClick: dojo.hitch(actionCC, actionCC.execute, null, actionOpt)
                        }));
                        menu.addChild(new dijit.MenuSeparator());

                        var moreActions = [new com.ibm.concord.lcext.NewConcordDoc(app, null), new com.ibm.concord.lcext.NewConcordSheet(app, null), new com.ibm.concord.lcext.NewConcordPres(app, null)];
                        for (var ii = 0, action1; action1 = moreActions[ii]; ii++) {
                            var actionOpt = {};
                            dojo.mixin(actionOpt, null);
                            var mi = new dijit.MenuItem({
                                label: action1.getName(null, actionOpt),
                                title: action1.getTooltip(null, actionOpt),
                                onClick: dojo.hitch(action1, action1.execute, null, actionOpt)
/*label: action1["name"],
				       title: action1["title"],
				       onClick: dojo.hitch(action1, action1["click"], null, null)*/
                            });
                            menu.addChild(mi);
                        }
                        lconn.core.MenuUtility.attachListeners(menu, a);
                        var hspan = btnContainer.appendChild(d.createElement("span"));
                        hspan.style.display = "none";
                        hspan.setAttribute("widgetid", menu.id);

                    }
                    span.appendChild(a);
                    btnContainer.appendChild(span);
                }
            }

            divi.appendChild(btnContainer);
        }

        var divq = d.createElement("div");
        divq.className = "qkrQuota";

        if (authenticatedUser) {
            var a = d.createElement("a");
            a.href = "javascript:;";
            a.style.marginLeft = a.style.marginRight = "10px";
            a.appendChild(d.createTextNode(app.nls.RECENT_SHARES.ALT));
            dijit.setWaiRole(a, "button");
            divq.appendChild(a);
            new lconn.files.widget.RecentPeopleLauncher({
                app: app
            }, a);
        }

        divi.appendChild(divq);
        divr.appendChild(divi);

        el.appendChild(divr);
    };
});
