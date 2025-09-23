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

dojo.provide("concord.FileInlineRenderer");

dojo.require("lconn.files.util.HtmlMessage");
dojo.require("lconn.share.util.DateFormat");
dojo.require("lconn.share.widget.MessageContainer");
dojo.require("concord.global");

(function() {
	lconn.core.uiextensions.add("lconn/files/renderers/file/inline", function(s, d, parentNode, file, app, scene) {
		// var app = opt.app;
		var routes = app.routes;
		// var scene = opt.scene;
		var user = scene.user;
		var extension = file.getExtension();
		// nls
		var nls = concord.global.nls;
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
			// check whether this is a IBM Docs File.
			if (!concord.global.isIBMDocFile(file)) {
				return false;
			}
		} else {
			return false;
		}
		// IBM Docs entitlement check
		if (concord.global.showConcordEntry()) {
			var url = concord.global.getDocDraftURL(file);
			var handler = function(r, io) {
				// add IBM Docs document status summary.
				var div = parentNode.lastChild;
				var table = div.firstChild;
				table.style.tableLayout = "fixed";
				table.style.width = "100%";
				var tbody = table.firstChild;
				var tr = tbody.firstChild;
				var tdSummary = tr.lastChild;
				var divDes = tdSummary.firstChild;
				var divMeta = d.createElement("div");
				dojo.attr(divMeta, "class", "lotusChunk lotusMeta");
				tdSummary.insertBefore(divMeta, divDes);
				var ulMeta = d.createElement("ul");
				dojo.attr(ulMeta, "class", "lotusInlinelist");
				divMeta.appendChild(ulMeta);
				// publish info
				var liPublished = d.createElement("li");
				// format publish time
				var permissions = app.getUserPermissions();
				var isChanged = (file.getUpdated().getTime() != file.getPublished().getTime());
				var modifier = isChanged ? file.getModifier() : file.getAuthor();
				var byMe = permissions.isAuthenticated() ? permissions.isAuthenticated(modifier.id) : false;
				var dateStrings = isChanged ? (byMe ? nls.LABEL_PUBLISHED : nls.LABEL_PUBLISHED_OTHER) : (byMe ? nls.LABEL_CREATED
						: nls.LABEL_CREATED_OTHER);
				var df = new lconn.share.util.DateFormat(file.getUpdated());
				var formatedDateText = df.formatByAge(dateStrings);
				lconn.share.util.html.substitute(d, liPublished, formatedDateText, {
					user : function() {
						var a = d.createElement("a");
						a.className = "lotusPerson";
						a.appendChild(d.createTextNode(modifier.name));
						lconn.files.scenehelper.generateUserLink(app, app.routes, modifier, a);
						return a;
					}
				}, null, this);
				liPublished.title = df.format(dateStrings.FULL);
				// for other users that is not an EDITOR, return
				if (!concord.global.isEditor(file)) {
					dojo.attr(liPublished, "class", "lotusFirst");
					ulMeta.appendChild(liPublished);
					return true;
				} else {
					// add IBM Docs indicator text.
					if(!concord.global.isUploadNewVersionEnabled())
					{
						var divDocs = d.createElement("div");
						dojo.attr(divDocs, "class", "lotusChunk lotusMeta");
						divDocs.innerHTML = nls.docs_indicator_text;
						tdSummary.insertBefore(divDocs, divMeta);						
					}

					if (r instanceof Error) {
						dojo.attr(liPublished, "class", "lotusFirst");
						ulMeta.appendChild(liPublished);
						return false;
					}

					ulMeta.appendChild(liPublished);

					// draft info
					var liDraft = d.createElement("li");
					// format draft time
					var dftCreated = r.created;
					var convertDftCreated = lconn.share.util.misc.date.convertAtomDate(dftCreated);
					var dftLastedit = r.modified;
					var convertDftLastedit = lconn.share.util.misc.date.convertAtomDate(dftLastedit);
					isChanged = (convertDftLastedit.getTime() != convertDftCreated.getTime());
					dateStrings = isChanged ? nls.LABEL_DRAFT_MODIFIED : nls.LABEL_DRAFT_CREATED;
					df = new lconn.share.util.DateFormat(convertDftLastedit);
					formatedDateText = df.formatByAge(dateStrings);
					liDraft.appendChild(d.createTextNode(formatedDateText));
					liDraft.title = df.format(dateStrings.FULL);
					dojo.attr(liDraft, "class", "lotusFirst");
					ulMeta.insertBefore(liDraft, liPublished);

					// add IBM Docs draft status tip.
					var list = r.editors;
					var dirty = r.dirty;
					if (!dirty && list.length <= 0)
						return false;

					// IBM Docs message container.
					var docsMsgDiv = dojo.place(d.createElement('div'), app.scene.headerNode, "after");
					dojo.attr(docsMsgDiv, "role", "alert");
					var docsMsgContainer = new lconn.share.widget.MessageContainer({
						nls : app.nls
					}, docsMsgDiv);
					if (list.length <= 0) {	
						// no online editors
						var publishMsg = new lconn.files.util.HtmlMessage(nls.draft_unpublished_tip, app, { 
						    warning: true, 
						    canClose: true, 
						    publish_action: function(){
						        var aWn = d.createElement("a");
								aWn.href = "javascript:";
								aWn.appendChild(d.createTextNode(nls.draft_save_action_label));
								
								var showErrorMsg = function(msg) {
									var publishErrorMsg = new lconn.files.util.HtmlMessage(msg, app, { 
										error: true, 
									    canClose: true
									});
									docsMsgContainer.add(publishErrorMsg);
								};
							    
								var publishDraftHandler = function() {
									docsMsgContainer.remove(publishMsg);
									// submit a publish request
									var jobPostHandler = function(jPRes, jPIoArgs) {
										// handle job result
									    var jobResultHandler = function(jRRes, jRIoArgs) {
									    	var problem_id = null ;
									    	try
											{
												problem_id = jRRes.data.problem_id;
											}
											catch (ex)
											{
												console.log("Error happens while get problem id from response.data .", ex);
											}
											if(problem_id == null || problem_id == "")
											{
												problem_id = jRIoArgs.xhr.getResponseHeader("problem_id");
											}
											if (jRRes && jRRes.dojoType == "timeout") {
												//do nothing here.
											} else if (jRIoArgs.xhr.status == 200) {
												if (jRRes.status == 'complete') {
													dojo.publish("lconn/share/action/completed", [ {fileChange : true}, null ]);
													return;
												} else {
													if (jRRes.status == 'error') {
														var msg;
														if (jRRes.error_code == 1200) {
															//conversion is not available
															msg = nls.publishErrMsg;
														}
														else{	
															msg = concord.global.getErrorMessage(jRRes.error_code);
														}
														showErrorMsg(msg);
														if(problem_id && problem_id != ""){
															showProblemErrorMsg(problem_id);
														}
														return;
													}
												}
											} else if (jRIoArgs.xhr.status == 410) {
												// document cannot be found in repository
												showErrorMsg(nls.publishErrMsg_NoFile);
												return;
											} else if (jRIoArgs.xhr.status == 403) {
												try {
													var respJson = dojo.fromJson(jRRes.responseText);
													var errorCode = respJson != null ? respJson.error_code : -1;
													var msg = concord.global.getErrorMessage(errorCode);
													showErrorMsg(msg);
													if(problem_id && problem_id != ""){
														showProblemErrorMsg(problem_id);
													}
													return;
												} catch (e) {
												}
											}
											// general error message
											showErrorMsg(nls.publishErrMsg);
										};	
										// query job status
									    var jobQueryHandler = function(jQId) {
									    	 // handle job status
											var jobStatusHandler = function(jSId, jSRes, jSIoArgs) {
												if (jSRes instanceof Error) {
													if (jSRes.dojoType == "timeout") {
														jobResultHandler(jSRes, jSIoArgs);
														return;
													} else {
														// check again
														setTimeout(dojo.hitch(this, jobQueryHandler, jSId), 1000);
														return;
													}
												}
												var ret = false;
												if (jSRes.status == "complete") {
													ret = true;
												} else if (jSRes.status == "broken") {
													ret = true;
												} else if (jSRes.status == "error") {
													ret = true;
												} else if (jSRes.status == "pending") {
													setTimeout(dojo.hitch(this, jobQueryHandler, jSId), 1000);
													return;
												} else {
													console.info("unknown publish job status: "	+ jSRes.status);
													// check again
													setTimeout(dojo.hitch(this, jobQueryHandler, jSId), 1000);
												}
												if (ret == true) {
													jobResultHandler(jSRes, jSIoArgs);
												}
											};
									    	var jobQueryUrl = concord.global.getPublishJobQueryURL(file, jQId);
									    	dojo.xhrGet({
									    		url: jobQueryUrl,
									    		handleAs: "json",
									    		handle: dojo.hitch(this, jobStatusHandler, jQId),
									    		sync: false,
									    		preventCache: true,
									    		timeout: 30000
									    	});
									    };
		
									    var showProblemErrorMsg = function (problem_id) {
									        var showProblemMsg = new lconn.files.util.HtmlMessage(nls.newDialogProblemidErrMsg_tip, app, {
									                warning : true,
									                canClose : true,
									                shown_action : function () {
									                    var tSpan = d.createElement("span");
									                    var aMsg = d.createElement("a");
									                    aMsg.href = "javascript:";
									                    aMsg.id = 'problem_toggle';
									                    dojo.style(aMsg, 'text-decoration', 'none');
									                    aMsg.appendChild(d.createTextNode(nls.newDialogProblemidErrMsgShow));
									                    var span = d.createElement("span");
									                    span.id = 'problem_id';
									                    dojo.style(span, 'word-break', 'break-all');
									                    dojo.style(span, 'word-wrap', 'break-word');
									                    dojo.style(span, 'color', '#222222 !important');
									                    dojo.style(span, 'font-weight', 'lighter');
									                    dojo.style(span, 'display', 'none');
									                    span.appendChild(d.createTextNode(problem_id));
									                    var showMsg = function () {
									                        var node = dojo.byId("problem_id");
									                        var nodeDisplay = dojo.style(node, "display");
									                        console.log(nodeDisplay);
									                        if (nodeDisplay && nodeDisplay == "none") {
									                            dojo.style(node, "display", "block");
									                            dojo.byId("problem_toggle").innerHTML = nls.newDialogProblemidErrMsgHide;
									                        } else {
									                            dojo.style(node, "display", "none");
									                            dojo.byId("problem_toggle").innerHTML = nls.newDialogProblemidErrMsgShow;
									                        }
									                    };
									                    dojo.connect(aMsg, "onclick", showMsg);
									                    tSpan.appendChild(aMsg);
									                    tSpan.appendChild(span);
									                    return tSpan;
									                }
									            });
									        docsMsgContainer.add(showProblemMsg);
									    };
										
								    	if (jPRes instanceof Error) {
								    		jobResultHandler(jPRes, jPIoArgs);
								    		return;
								    	}
								    	if (jPRes.status == "pending") {
								    		jobQueryHandler(jPRes.id);
								    	} else {
								    		jobResultHandler(jPRes, jPIoArgs);
								    	}
								    };
									var publishDraftUrl = concord.global.getDocDraftURL(file, true);
									concord.global.xhrPost({
										url : publishDraftUrl,
										filesUserId : app.getAuthenticatedUserId(),
										handleAs : "json",
										postData : dojo.toJson({}),
										sync : false,
										timeout : 30000,
										headers : {
											"Content-Type" : "application/json"
										},
										handle : jobPostHandler
									});
								};
								dojo.connect(aWn, "onclick", publishDraftHandler);
								return aWn;
						    }
						});
						docsMsgContainer.add(publishMsg);
					} else {			
						// online editors
						var editorMsg = new lconn.files.util.HtmlMessage(nls.draft_beiing_edited, app, {
						    warning: true, 
						    canClose: true, 
						    user : function() {
								var spanWn = d.createElement("span");
								spanWn.style.display = "inline";
								spanWn.style.marginLeft = "2px";
								spanWn.style.marginRight = "0";
								for ( var i = 0, len = list.length; i < len; i++) {
									var editor_a = d.createElement("a");
									editor_a.appendChild(d.createTextNode(list[i].displayName));
									list[i].name = list[i].displayName;
									lconn.files.scenehelper.generateUserLink(app, routes, list[i], editor_a);
									spanWn.appendChild(editor_a);
									if (len != 1 && i != len - 1) {
										spanWn.appendChild(d.createTextNode(",\u00A0\u00A0"));
									}
								}
								return spanWn;
							}
						});
						docsMsgContainer.add(editorMsg);
					}
				 }
			}
			
			var tried = 0;
			var prepareHandle = function(r, io) {
				tried++;				
				if(r && r.status == "471" && tried < 4)
				{// deal with session affinity and possible failover
					concord.global.xhrGet({
						url : url,
						filesUserId : app.getAuthenticatedUserId(),
						handle : prepareHandle,					
						sync : false,
						handleAs : "json",
						preventCache : true
					});					
				}
				else
				{
					handler(r, io);
				}
			};
			
			concord.global.xhrGet({
				url : url,
				filesUserId : app.getAuthenticatedUserId(),
				handle : prepareHandle,
				sync : false,
				handleAs : "json",
				preventCache : true
			});
		} else {
			//temp solution for Files defect.
			setTimeout(function(){
				// add IBM Docs document status summary.
				var div = parentNode.lastChild;
				var table = div.firstChild;
				table.style.tableLayout = "fixed";
				table.style.width = "100%";
				var tbody = table.firstChild;
				var tr = tbody.firstChild;
				var tdSummary = tr.lastChild;
				var divDes = tdSummary.firstChild;
				// add IBM Docs indicator text.
				var divDocs = d.createElement("div");
				dojo.attr(divDocs, "class", "lotusChunk lotusMeta");
				divDocs.innerHTML = nls.nonentitlement_docs_indicator_text;
				tdSummary.insertBefore(divDocs, divDes);
			}, 0);
		}
	});
})();