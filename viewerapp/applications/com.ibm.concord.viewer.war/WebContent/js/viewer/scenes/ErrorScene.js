/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.scenes.ErrorScene");

dojo.require("dojo.i18n");
dojo.require("dojo.string");
dojo.require("dijit.form.Button");

dojo.requireLocalization("viewer.scenes", "ErrorScene");

viewer.scenes.ErrorScene.getErrorMessage = function(nStatusCode) {
	var nls = dojo.i18n.getLocalization("viewer.scenes", "ErrorScene");
	var error = new Object();
	
	error.title = nls.service_unavailable_title;
	error.message = dojo.string.substitute(nls.service_unavailable_content, { 'productName' : window.g_prodName });
	
	if (nStatusCode == 1001) //RepositoryAccessException.EC_REPO_NOVIEWPERMISSION
	{
		error.title = nls.access_denied_title;
		error.message = nls.viewaccess_denied_content;
	}
	else if (nStatusCode == 1002) //RepositoryAccessException.EC_REPO_NOEDITPERMISSION
	{
		error.title = nls.access_denied_title;
		error.message = nls.editaccess_denied_content;
	}
	else if (nStatusCode == 1003) //RepositoryAccessException.EC_REPO_NOTFOUNDDOC
	{
		error.title = dojo.string.substitute(nls.doc_notfound_title, { 'productName' : window.g_prodName });
		error.message = dojo.string.substitute(nls.doc_notfound_content, { 'productName' : window.g_prodName });
	}
	else if (nStatusCode == 1004) //RepositoryAccessException.EC_REPO_CANNOT_FILES
	{
		error.title = nls.fileconnect_denied_title;
		error.message = dojo.string.substitute(nls.fileconnect_denied_content, { 'productName' : window.g_prodName });
	}
	else if (nStatusCode == 1005) //RepositoryAccessException.EC_REPO_OUT_OF_SPACE
	{
		error.title = nls.repository_out_of_space_title;
		error.message = nls.repository_out_of_space_content;
		if( DOC_SCENE != null )
		{
			var docType = DOC_SCENE.type;
			if( docType === "sheet" )
			{
				error.message  = dojo.string.substitute(nls.repository_out_of_space_content, ["spreadsheet"]);
			}
			else if (docType === "text")
			{
				error.message  = dojo.string.substitute(nls.repository_out_of_space_content, ["document"]);
			}
			else if (docType === "pres")
			{
				error.message  = dojo.string.substitute(nls.repository_out_of_space_content, ["presentation"]);
			}
		}
	}
	else if (nStatusCode == 1007) //RepositoryAccessException.EC_REPO_CANNOT_EDIT_LOCKED_DOC
	{
		error.title = nls.access_denied_title;
		error.message = nls.edit_locked_file;
	}
	else if (nStatusCode == 1011) //RepositoryAccessException.EC_REPO_UNPUBLISHED_FILE
	{
		error.title = nls.unpublished_document_title;
		error.message = nls.unpublished_document_content;
	}
	else if (nStatusCode == 1013) //RepositoryAccessException.EC_REPO_UNSCANNED_FILE
	{
		error.title = nls.unscanned_document_title;
		error.message = nls.unscanned_document_content;
	}
	else if (nStatusCode == 1014) //RepositoryAccessException.EC_REPO_MALICIOUS_FILE
	{
		error.title = nls.malicious_document_title;
		error.message = nls.malicious_document_content;
	}	
	else if (nStatusCode == 1100) //AccessException.EC_DOCUMENT_ENCRYPT
	{
		error.title = nls.document_encrypt_title;
		error.message = nls.document_encrypt_content;
	}
	else if (nStatusCode == 1200) //ConversionException.EC_CONV_SERVICE_UNAVAILABLE
	{
		error.title = nls.convservice_unavailable_title;
		error.message = nls.convservice_unavailable_content;
	}
	else if (nStatusCode == 1201) //ConversionException.EC_CONV_DOC_TOOLARGE
	{  /* Here only for viewer size pre-check, does not detail limit*/
		error.title = nls.doc_toolarge_title;
		error.message = nls.doc_toolarge_content5;
/*		try
		{
			if (viewerConfig != null && DOC_SCENE != null)
			{
				var limit = null;
				var max_mime_size = null;
				if (DOC_SCENE.type === "sheet" && viewerConfig["sheet"] != null)
				{
					limit = viewerConfig["sheet"];
				}
				else if (DOC_SCENE.type === "text" && viewerConfig["text"] != null)
				{
					limit = viewerConfig["text"];
					if (DOC_SCENE.extension != "" && DOC_SCENE.extension != null)
					{
						var max_size_template = "max-${0}-size";
						var max_mime_str = dojo.string.substitute(max_size_template, [DOC_SCENE.extension]);
						if (limit[max_mime_str] != null && limit[max_mime_str] != "")
						{
							max_mime_size = limit[max_mime_str];
						}
					}
				}
				else if (DOC_SCENE.type === "pres" && viewerConfig["pres"] != null)
				{
					limit = viewerConfig["pres"];
				}
				else if (DOC_SCENE.type === "pdf" && viewerConfig["pdf"] != null) {
					limit = viewerConfig["pdf"];
				}
				if (limit)
				{
					if (max_mime_size)
					{
						var doc_toolarge_content_str = null;
						if (DOC_SCENE.extension != null && (DOC_SCENE.extension === "rtf" || DOC_SCENE.extension === "txt") )
						{
							doc_toolarge_content_str = nls.doc_toolarge_content4 ;
							error.message = dojo.string.substitute(doc_toolarge_content_str, ["."+DOC_SCENE.extension, max_mime_size]);
						}
						else 
						{
							doc_toolarge_content_str = nls.doc_toolarge_content3 ;
							error.message = dojo.string.substitute(doc_toolarge_content_str, [max_mime_size]);
						}
					}
					else
					{
						error.message = dojo.string.substitute(nls.doc_toolarge_content3, [limit["max-size"]]);
					}
				}	
				else
					error.message = nls.doc_toolarge_content;
			}	
		}
		catch (ex)
		{
			console.log("Error happens while showing the limitations of opening file.", ex);
		}  **/
	}
	else if (nStatusCode == 1202) //ConversionException.EC_CONV_CONVERT_TIMEOUT
	{
		error.title = nls.conversion_timeout_title;
		error.message = nls.conversion_timeout_content;
	}
	else if (nStatusCode == 1203 || nStatusCode == 1209) //ConversionException.EC_CONV_INVALID_FORMAT
	{
		error.title = nls.invalid_docformat_title;
		error.message = nls.invalid_docformat_content;
	}	
	else if (nStatusCode == 1204 || nStatusCode == 1300) //ConversionException.EC_CONV_UNSUPPORTED_FORMAT || UnsupportedMimeTypeException.EC_MIME_UNSUPPORTED_TYPE
	{
		error.title = nls.invalid_doctype_title;
		error.message = dojo.string.substitute(nls.invalid_doctype_content, { 'productName' : window.g_prodName });
	}
	else if (nStatusCode == 1213 || nStatusCode == 1214 || nStatusCode == 1210 || nStatusCode == 1260) //ConversionException.EC_CONV_UNEXPECIFIED_ERROR
	{
		error.title = nls.unexpecified_conversion_error_title;
		error.message = nls.unexpecified_conversion_error_content;
	}
	else if (nStatusCode == 1206) //ConversionException.EC_CON_ENCRPTED_ERROR
	{
		error.title = nls.encrypted_conversion_error_title;
		error.message = dojo.string.substitute(nls.encrypted_conversion_error_content, { 'productName' : window.g_prodName });
	}
	else if (nStatusCode == 1207) //ConversionException.EC_CONV_SYSTEM_BUSY
	{
		error.title = nls.service_busy_title;
		error.message = nls.service_busy_content;
	}
	else if (nStatusCode == 1211) //ConversionException.EC_CONV_EMPTY_FILE_ERROR
	{
		error.title = nls.empty_doc_title;
		error.message = nls.empty_doc_content;
	}
	else if (nStatusCode == 1212) //ConversionException.EC_CONV_CORRUPTED_FILE_ERROR
	{
		error.title = nls.corrupted_doc_title;
		error.message = nls.corrupted_doc_content;
	}
	else if (nStatusCode == 1400) //MalformedRequestException.EC_MALFORMED_INVALID_REQUEST
	{
		error.title = nls.malformed_request_title;
		error.message = nls.malformed_request_content;
	}
	else if (nStatusCode == 1401) //MalformedRequestException.EC_FULLVIEWER_INVALID_REQUEST
	{
		error.title = nls.fullviewer_notsupport_title;
		error.message = nls.fullviewer_notsupport_content;
	}
	else if (nStatusCode == 1601 || nStatusCode == 1602) //CacheDataAccessException.EC_CACHEDATA_ACCESS_ERROR || CacheStorageAccessException.EC_CACHESTORAGE_ACCESS_ERROR
	{
		error.title = nls.storageserver_error_title;
		error.message = nls.storageserver_error_content;
	}
	else if (nStatusCode == 1603)  //No content.js in draft
	{
		error.title = nls.draft_storage_error_title;
		error.message = nls.draft_storage_error_content;
	} 
	else if ( nStatusCode == 1700)
	{
		error.title = nls.unexpected_code_title;
		error.message = dojo.string.substitute(nls.unexpected_code_content, { 'docsProductName' : window.g_docsProdName });
	}
	else if (nStatusCode == 400) // handle 400 error, HttpServletResponse.SC_BAD_REQUEST
	{
		error.title = nls.incorrect_web_address_title;
		error.message = nls.incorrect_web_address_content;		
	}
	else if(nStatusCode == 3333)
	{
		error.title = nls.pdf_error_title;
		error.message = nls.pdf_error_content;
	}
	else if (nStatusCode == 0 || nStatusCode == 2001) // handle 404 error in web.xml
	{
		error.title = nls.unexpecified_conversion_error_title;
		error.message = nls.unexpecified_conversion_error_content;
	}
	
	// post error message to parent window
	var map = {
		1001: "unauthorized",
		1002: "unauthorized",
		1003: "not-found",
		1004: "request-timeout",
		1005: "bad-request",
		1007: "unauthorized",
		1011: "bad-request",
		1100: "bad-request",
		1200: "request-timeout",
		1201: "file-too-large",
		1202: "request-timeout",
		1203: "bad-file",
		1209: "bad-file",
		1204: "bad-file",
		1300: "bad-file",
		1213: "bad-request",
		1214: "bad-request",
		1210: "bad-request",
		1260: "bad-request",
		1206: "bad-request",
		1207: "request-timeout",
		1211: "bad-file",
		1212: "bad-file",
		1400: "bad-request",
		1401: "not-found",
		1601: "request-timeout",
		1602: "request-timeout",
		1700: "request-timeout",
		400: "bad-request",
		3333: "bad-file",
		0: "bad-request",
		2001: "bad-request",
	}
	
	if(window.self != window.parent) {
		var message = {
				eventType: "IDOCS.EVENT.error",
				errorCode: map[nStatusCode],
				errorMessage: error.title,
				errorDescription: error.message
		};
		window.parent.postMessage(JSON.stringify(message), window.parent.location.origin);
	}

	return error;
}

viewer.scenes.ErrorScene.renderError = function(nStatusCode, supported_browser_msg, data) {
	var mainNode = dojo.body();
	
	try {
		var head = document.getElementsByTagName("head")[0];
		var stylesheet = document.createElement("link");
		stylesheet.rel = "stylesheet";
		stylesheet.type = "text/css";
		stylesheet.href = staticResPath + '/js/viewer/css/error.css';
		head.appendChild(stylesheet);
	} catch (e) {
	
	}
	
	dojo.addClass(mainNode,'lotusui');
	
	var error = this.getErrorMessage(nStatusCode);

	var str = '<div id="lotusFrame" class="lotusFrame" role="main">';
	str += '<div class="lotusErrorBox lotusError">';
	str += '<div class="lotusErrorContent">';
	str += '<img src="' + staticResPath + '/images/iconWarningLarge.gif" role="presentation" alt="">';
	str += '<div class="lotusErrorForm">';
	str += '<h1 id="scene-title">' + error.title + '</h1>';
	str += '<p>' + error.message + '</p>';
	if (supported_browser_msg && (supported_browser_msg.length > 0)) {
		str += supported_browser_msg;
	}
	str += '</div>';
	str += '</div>';
	str += '</div>';
	str += '</div>';
	
	mainNode.innerHTML = str;
	
	var problem_id = null;
	if (data != null && data.problem_id != null) {
		problem_id = data.problem_id;
	}

	if(problem_id != null && problem_id != "")
	{
		var nls = dojo.i18n.getLocalization("viewer.scenes", "ErrorScene");
		var formDiv = dojo.query(".lotusErrorForm")[0];
		var problemDiv = dojo.create("div", {innerHTML:nls.problem_id_msg_title}, formDiv);
		var aMsg = dojo.create("a", {innerHTML:nls.problem_id_msg_show}, problemDiv);
		dojo.attr(aMsg,'id','problem_toggle');
		dojo.attr(aMsg,'href','javascript:;');
		dojo.style(aMsg, 'text-decoration', 'none');
		dijit.setWaiRole(aMsg, "button");
		dojo.connect(aMsg, "onclick", viewer.scenes.ErrorScene.showMsg);
		var spanMsg = dojo.create("span", {innerHTML:problem_id}, problemDiv);
		dojo.attr(spanMsg,'id','problem_id');
		dojo.style(spanMsg, 'word-break', 'break-all');
		dojo.style(spanMsg, 'word-wrap', 'break-word');
		dojo.style(spanMsg, 'color', '#222222 !important');
		dojo.style(spanMsg, 'font-weight', 'lighter');
		dojo.style(spanMsg, 'display', 'none');
	}

	
	if(g_featureConfig && g_featureConfig.VIEWER_POSTMESSAGE_FEATURE)
	{
		var viewerEvent = new Object();
		viewerEvent.event = "ic-fileviewer/previewFailed";
		viewerEvent.errorCode = nStatusCode ;
		if(error.title.lastIndexOf(".")!=-1 && error.title.lastIndexOf(".")==error.title.length-1)
			viewerEvent.errorMessage = error.title + " " + error.message;
		else
			viewerEvent.errorMessage = error.title + ". " + error.message;
		window.parent.postMessage(JSON.stringify(viewerEvent), '*');
		console.log(JSON.stringify(viewerEvent));
	}
}

viewer.scenes.ErrorScene.showProblemID = function (problem_id, id) {
	var nls = dojo.i18n.getLocalization("viewer.scenes", "ErrorScene");
	var errorDiv = document.getElementById(id);
	console.log(errorDiv.firstChild.nodeName);
	var nodes = errorDiv.childNodes;
	var errorContainer ;
	if(nodes.length != 0){
		errorContainer = errorDiv.childNodes.item(0);
	}
	for (var x = 0; x < nodes.length; x++) {
		console.log(nodes[x].nodeName);
		if (nodes[x].nodeName == "SPAN") {
			errorContainer = nodes[x];
			break;
		}
	}
	if(typeof errorContainer == 'undefined'){
		errorContainer = errorDiv ;
	}
	var doc = document;
	var div = doc.createElement("div");
	div.appendChild(doc.createTextNode(nls.problem_id_msg_title));
	var a = doc.createElement("a");
	a.href = "javascript:;";
	a.id = 'problem_toggle';
	dojo.style(a, 'text-decoration', 'none');
	dijit.setWaiRole(a, "button");
	a.appendChild(doc.createTextNode(nls.problem_id_msg_show));
	dojo.connect(a, "onclick", concord.scenes.ErrorScene.showMsg);
	var span = doc.createElement("div");
	span.id = 'problem_id';
	span.appendChild(doc.createTextNode(problem_id));
	dojo.style(span, 'word-break', 'break-all');
	dojo.style(span, 'word-wrap', 'break-word');
	dojo.style(span, 'color', '#222222 !important');
	dojo.style(span, 'font-weight', 'lighter');
	dojo.style(span, 'display', 'none');
	div.appendChild(a);
	div.appendChild(span);
	dojo.style(div, 'padding-top', '5px');
	errorContainer.appendChild(div);
};

viewer.scenes.ErrorScene.showMsg = function () {
	var nls = dojo.i18n.getLocalization("viewer.scenes", "ErrorScene");
	var node = dojo.byId("problem_id");
	var nodeDisplay = dojo.style(node, "display");
	console.log(nodeDisplay);
	if (nodeDisplay && nodeDisplay == "none") {
		dojo.style(node, "display", "block");
		dojo.byId("problem_toggle").innerHTML = nls.problem_id_msg_hide;
	} else {
		dojo.style(node, "display", "none");
		dojo.byId("problem_toggle").innerHTML = nls.problem_id_msg_show;
	}
};
