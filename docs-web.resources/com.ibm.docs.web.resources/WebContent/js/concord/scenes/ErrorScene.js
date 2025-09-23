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

dojo.provide("concord.scenes.ErrorScene");

dojo.require("dojo.i18n");
dojo.require("dojo.string");
dojo.require("concord.util.strings");
dojo.require("concord.util.uri");
dojo.require("concord.widgets.LotusTextButton");

dojo.requireLocalization("concord.scenes", "ErrorScene");
dojo.require("concord.util.browser");

concord.scenes.ErrorScene.getErrorMessage = function(nStatusCode, data) {
	var nls = dojo.i18n.getLocalization("concord.scenes", "ErrorScene");
	var error = new Object();
	
	error.title = nls.service_unavailable_title;
	error.message = dojo.string.substitute(nls.service_unavailable_content, { 'productName' : concord.util.strings.getProdName() });
	error.type = "warning";
	error.hasBtn = false;
	
	if (nStatusCode == 1001) //RepositoryAccessException.EC_REPO_NOVIEWPERMISSION
	{
		error.title = nls.access_denied_title;
		error.message = nls.viewaccess_denied_content;
	}
	else if (nStatusCode == 1002) //RepositoryAccessException.EC_REPO_NOEDITPERMISSION
	{
		error.title = nls.access_denied_title;
		error.message = dojo.string.substitute(nls.editaccess_denied_content, { 'productName' : concord.util.strings.getProdName() });
	}
	else if (nStatusCode == 1003) //RepositoryAccessException.EC_REPO_NOTFOUNDDOC
	{
		error.title = nls.doc_notfound_title;
		error.message = nls.doc_notfound_content;
	}
	else if (nStatusCode == 1004) //RepositoryAccessException.EC_REPO_CANNOT_FILES
	{
		error.title = nls.fileconnect_denied_title;
		error.message = dojo.string.substitute(nls.fileconnect_denied_content, { 'productName' : concord.util.strings.getProdName() });
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
	     error.message = dojo.string.substitute(nls.document_encrypt_content, { 'productName' : concord.util.strings.getProdName() });
	}
	else if (nStatusCode == 1200) //ConversionException.EC_CONV_SERVICE_UNAVAILABLE
	{
		error.title = nls.convservice_unavailable_title;
		error.message = dojo.string.substitute(nls.convservice_unavailable_content, { 'productName' : concord.util.strings.getProdName() });
	}
	else if (nStatusCode == 1201) //ConversionException.EC_CONV_DOC_TOOLARGE
	{
		error.title = nls.doc_toolarge_title;
		error.message = nls.doc_toolarge_content;
		try
		{
			if (data != null && data.limits != null && DOC_SCENE != null)
			{
				var docType = DOC_SCENE.type;
				if (docType === "sheet" && data.limits["sheet"] != null)
				{
					var limit = data.limits["sheet"];
					if (DOC_SCENE.docSizeLimit != null && limit["max-sheet-rows"] != null)
					{
						var native_err_code = data.conv_err_code;
						if (native_err_code && native_err_code!=null && 
							native_err_code >= 530 && native_err_code <= 534) 
						{
							error.message = "<p style='margin-bottom: 2px;'>" + nls.doc_toolarge_content2 + "</p>";
							error.message += "<ul style='padding-left: 15px;margin: 0 0 0 15px;'>";
							if (native_err_code == 530)
							{
								error.message += "<li style='line-height: 1.5em;'>" + dojo.string.substitute(nls.sheet_toolarge_content, [DOC_SCENE.docSizeLimit]) + "</li>";
							}
							else if (native_err_code == 531)
							{
								error.message += "<li style='line-height: 1.5em;'>" + dojo.string.substitute(nls.sheet_toolarge_content3, [limit["cell-max-num"]]) + "</li>";
							}
							else if (native_err_code == 532)
							{
								error.message += "<li style='line-height: 1.5em;'>" + dojo.string.substitute(nls.sheet_toolarge_content2, [limit["max-sheet-rows"]]) + "</li>";
							}
							else if (native_err_code == 533)
							{
								error.message += "<li style='line-height: 1.5em;'>" + dojo.string.substitute(nls.sheet_toolarge_content5, [limit["max-sheet-columns"]]) + "</li>";
							}
							else if (native_err_code == 534)
							{
								error.message += "<li style='line-height: 1.5em;'>" + dojo.string.substitute(nls.sheet_toolarge_content4, [limit["formula-cell-max-num"]]) + "</li>";
							}
							error.message += "</ul>";
						}
						else
						{
							error.message = "<p style='margin-bottom: 2px;'>" + nls.doc_toolarge_content2 + "</p>";
							error.message += "<ul style='padding-left: 15px;margin: 0 0 0 15px;'>";
							error.message += "<li style='line-height: 1.5em;'>" + dojo.string.substitute(nls.sheet_toolarge_content, [DOC_SCENE.docSizeLimit]) + "</li>";
							error.message += "</ul>";
						}
					}
				}
				else if (docType === "text" && data.limits["text"] != null)
				{
					var limit = data.limits["text"];
					var native_err_code = data.conv_err_code;
					var mLimit = {};
					error.message = "<p style='margin-bottom: 2px;'>" + nls.doc_toolarge_content2 + "</p>";
					error.message += "<ul style='padding-left: 15px;margin: 0 0 0 15px;'>";
					if(native_err_code && native_err_code == 535)
					{
						error.message += "<li style='line-height: 1.5em;'>" + dojo.string.substitute(nls.text_toolarge_content2, [limit["max-page-count"]]) + "</li>";
						mLimit["max-page-count"] = limit["max-page-count"];
					}
					else if(native_err_code && native_err_code == 536)
					{
						error.message += "<li style='line-height: 1.5em;'>" + dojo.string.substitute(nls.text_toolarge_content3, [limit["max-pure-text-size"]]) + "</li>";
					}
					else
					{
						error.message += "<li style='line-height: 1.5em;'>" + dojo.string.substitute(nls.text_toolarge_content, [DOC_SCENE.docSizeLimit]) + "</li>";
						mLimit["max-file-size"] = parseInt(DOC_SCENE.docSizeLimit);
					}
					error.message += "</ul>";
					data["mobile-limit"] = mLimit;
				}
				else if (docType === "pres" && data.limits["pres"] != null)
				{
					if (DOC_SCENE.docSizeLimit != null)
					{
						var limit = data.limits["pres"];
						var native_err_code = data.conv_err_code;
						if(native_err_code && native_err_code == 537){
							error.message = "<p style='margin-bottom: 2px;'>" + dojo.string.substitute(nls.pres_toolarge_content2, [limit["max-pages"]]) + "</p>";
						}
						else if(native_err_code && native_err_code == 538)
						{
							error.message = "<p style='margin-bottom: 2px;'>" + dojo.string.substitute(nls.pres_toolarge_content3, [limit["max-graphics"]]) + "</p>";
						}
						else if(native_err_code && native_err_code == 539)
						{
							error.message = "<p style='margin-bottom: 2px;'>" + dojo.string.substitute(nls.doc_toolarge_content) + "</p>";
						}
						else 
						{
							error.message = "<p style='margin-bottom: 2px;'>" + dojo.string.substitute(nls.pres_toolarge_content, [DOC_SCENE.docSizeLimit]) + "</p>";
						}
					}
				}
			}	
		}
		catch (ex)
		{
			console.log("Error happens while showing the limitations of opening file.", ex);
		}
	}
	else if (nStatusCode == 1500) //OutOfCapacityException.EC_OUTOF_CAPACITY
	{
		error.title = nls.doc_toolarge_title;
		if (data != null && data.sizeLimit != null)
		{
			error.message = dojo.string.substitute(nls.doc_toolarge_content3, [data.sizeLimit]);	
		}
		else
		{
			error.message = nls.doc_toolarge_content;
		}
	}
	else if (nStatusCode == 1501) // OutOfCapacityException.EC_OUTOF_CAPACITY_File_Size_Mobile
	{
		error.title = nls.doc_toolarge_title;
		if (data != null && data.mobileErrorMessage != null)
		{
			data["mobile-limit"] = {"max-file-size":parseInt(data.mobileErrorMessage)};
			error.message = dojo.string.substitute(nls.doc_toolarge_content_mobile, [data.mobileErrorMessage]);
		}
		else if (data.error_message != null)
		{
			error.message = dojo.string.substitute(nls.doc_toolarge_content_mobile, [data.error_message]);
		}
		else
		{
			error.message = nls.doc_toolarge_content;
		}
		
	}
	else if (nStatusCode == 1502) // OutOfCapacityException.EC_OUTOF_CAPACITY_Page_Count_Mobile
	{
		error.title = nls.doc_toolarge_title;
		if (data != null && data.mobileErrorMessage != null)
		{
			data["mobile-limit"] = {"max-page-count":parseInt(data.mobileErrorMessage)};
			error.message = dojo.string.substitute(nls.pres_toolarge_content2_mobile, [data.mobileErrorMessage]);
		}
		else if (data.error_message != null)
		{
			error.message = dojo.string.substitute(nls.pres_toolarge_content2_mobile, [data.error_message]);
		}
		else
		{
			error.message = nls.doc_toolarge_content;
		}
	}
	else if (nStatusCode == 1503) // OutOfCapacityException.EC_OUTOF_CAPACITY_Image_Count_Mobile
	{
		error.title = nls.doc_toolarge_title;
		if (data != null && data.mobileErrorMessage != null)
		{
			error.message = dojo.string.substitute(nls.pres_toolarge_content3_mobile, [data.mobileErrorMessage]);
		}
		else if (data.error_message != null)
		{
			error.message = dojo.string.substitute(nls.pres_toolarge_content3_mobile, [data.error_message]);
		}
		else
		{
			error.message = nls.doc_toolarge_content;
		}
	}
	else if (nStatusCode == 1511) // OutOfCapacityException.EC_OUTOF_CAPACITY_Sheet_View_ROWCOL_Mobile
	{
		error.title = nls.doc_toolarge_title;
		if (data.error_message != null)
		{
			var errorObj = (new Function( "return " + data.error_message ))();
			if(errorObj['max-sheet-rows'] != null && errorObj['max-sheet-cols'] != null ){
				error.message = dojo.string.substitute(nls.sheet_view_toolarge_content3_mobile, [errorObj['max-sheet-rows'],errorObj['max-sheet-cols']]);
			}else if(errorObj['max-sheet-cols'] != null){
				error.message = dojo.string.substitute(nls.sheet_view_toolarge_content2_mobile, [errorObj['max-sheet-cols']]);
			}else if(errorObj['max-sheet-rows'] != null){
				error.message = dojo.string.substitute(nls.sheet_view_toolarge_content1_mobile, [errorObj['max-sheet-rows']]);
			}
		}
		else
		{
			error.message = nls.doc_toolarge_content;
		}
	}
	else if (nStatusCode == 1202) //ConversionException.EC_CONV_CONVERT_TIMEOUT
	{
		error.title = nls.conversion_timeout_title;
		error.message = nls.conversion_timeout_content;
	}
	else if (nStatusCode == 1203) //ConversionException.EC_CONV_INVALID_FORMAT
	{
		error.title = dojo.string.substitute(nls.invalid_docformat_title2, { 'productName' : concord.util.strings.getProdName() });
		error.message = dojo.string.substitute(nls.invalid_docformat_content2, { 'productName' : concord.util.strings.getProdName() });
		if (data != null && data.mode == "view")
		{
			error.title = nls.invalid_docformat_title;
			error.message = nls.invalid_docformat_content;				
		}
	}
	else if (nStatusCode == 1204 || nStatusCode == 1300) //ConversionException.EC_CONV_UNSUPPORTED_FORMAT || UnsupportedMimeTypeException.EC_MIME_UNSUPPORTED_TYPE
	{
		error.title = nls.invalid_doctype_title;
		error.message = dojo.string.substitute(nls.invalid_doctype_content, { 'productName' : concord.util.strings.getProdName() });
	}
	else if(nStatusCode == 1205 || nStatusCode == 1206){ //ConversionException.EC_CONV_INVALID_PASSWORD || ConversionException.EC_CONV_UNSUPPORTED_ENCRYPTION
		error.title = nls.encrypted_pptdoc_title;
		error.message = dojo.string.substitute(nls.encrypted_pptdoc_content, { 'productName' : concord.util.strings.getProdName() });		
	}

	else if(nStatusCode == 1207){
		error.title = nls.no_need_to_convert_title;
		error.message = nls.no_need_to_convert_content;
	}
	else if(nStatusCode == 1208){
		error.title = nls.server_busy_title;
		error.message = nls.server_busy_content;
	}
	else if (nStatusCode == 1209) //ConversionException.EC_CONV_EXT_CONTENT_MISMATCH
	{
		error.title = nls.invalid_docformat_title;
		if (data != null && data.correct_format != null)
		{
			error.message = dojo.string.substitute(nls.template_extension_conent_mismatch, [data.correct_format]);
		}
		else
		{
			error.message = nls.invalid_docformat_content;
		}
	}
	else if (nStatusCode == 1211) //ConversionException.EC_CONV_EMPTY_FILE_ERROR
	{
		error.title = nls.empty_doc_title;
		error.message = nls.empty_doc_content;
	}
	else if (nStatusCode == 1400) //MalformedRequestException.EC_MALFORMED_INVALID_REQUEST
	{
		error.title = nls.malformed_request_title;
		error.message = nls.malformed_request_content;
	}
	else if (nStatusCode == 1601 || nStatusCode == 1602) //DraftDataAccessException.EC_DRAFTDATA_ACCESS_ERROR || DraftStorageAccessException.EC_DRAFTSTORAGE_ACCESS_ERROR
	{
		error.title = nls.storageserver_error_title;
		error.message = nls.storageserver_error_content;
	}
	else if (nStatusCode == 1603) //No content.js in draft.
	{
		error.title = nls.draft_storage_error_title;
		error.message = nls.draft_storage_error_content;
	}	
	else if (nStatusCode == 1701) // max document session exceeded
	{
		error.title = nls.document_max_session_exceeded_title;
		error.message = nls.document_max_session_exceeded_content;		
	}
	else if (nStatusCode == 1702) // max users per session exceeded
	{
		error.title = nls.toomany_coeditors_title;
		error.message = nls.toomany_coeditors_content;
		error.message = error.message.replace("{0}", SESSION_CONFIG.max_users_per_session);
	}
	else if (nStatusCode == 1704) // DocumentServiceException.EC_DOCUMENT_LOCKED_EDIT_ERROR
	{
		error.title = nls.access_denied_title;
		error.message = nls.edit_locked_file;
	}
	else if (nStatusCode == 1705) // DocumentServiceException.EC_DOCUMENT_JOIN_LOCKED_SESSION_ERROR
	{
		error.title = nls.cannotedit_noentitled_title;
		error.message = nls.join_locked_file_session;
	}
	else if (nStatusCode == 1706) // DocumentServiceException.EC_DOCUMENT_LOCKED_PUBLISH_ERROR
	{
		// this error is not rendered in error scene
		error.title = "no such title";
		error.message = nls.publish_locked_file;
	}
	else if (nStatusCode == 1707) // DocumentServiceException.EC_DOCUMENT_ASYNC_RESPONSE_TIME_OUT
	{
		// this error is not rendered in error scene
		error.title = nls.request_time_out_title;
		error.message = nls.request_time_out_content;
	}
	else if (nStatusCode == 1708) // DocumentServiceException.EC_DOCUMENT_ASYNC_MAX_REQUEST_ERROR
	{
		// this error is not rendered in error scene
		error.title = nls.document_max_session_exceeded_title;
		error.message = nls.document_max_session_exceeded_content;
	}
	else if (nStatusCode == 3001) // from client, cannot open one document twice in same browser
	{
		error.title = nls.document_already_open;
		error.message = nls.kickout_user_content;		
		error.type = "info";
		error.hasBtn = true;
		error.btnUrl = concord.scenes.ErrorScene.getFileDetailsURL();//"http://localhost:9080/docs/version.txt";
	}
	else if (nStatusCode == 3002) // from client, cannot open too many documents in same browser
	{
		error.title = nls.toomany_documents_opened_inone_browser_title;
		error.message = dojo.string.substitute(nls.toomany_documents_opened_inone_browser_content, { 'productName' : concord.util.strings.getProdName() });		
	}
	else if (nStatusCode == 3101 || nStatusCode == 3102) // DocumentSessionException.ERR_PT_NOENTITLED_COEDIT || DocumentSessionException.ERR_PT_NOENTITLED_COEDIT2
	{
		var content1 = nStatusCode == 3101 ? nls.cannotedit_noentitled_content1 : nls.cannotedit_noentitled_content3;
		var content2 = nStatusCode == 3101 ? nls.cannotedit_noentitled_content2 : nls.cannotedit_noentitled_content4;
		var number = 0;
		var array = new Array();
		var length = data != null ? data.length : 0;
		for (var index = 0; index < length; index++)
		{
			if (data[index] != null && data[index].disp_name != null)
			{
				array[number++] = data[index].disp_name;
			}
		}
		if (concord.util.browser.isMobile()) {
			content1 = array.length > 0 ? (content1 + " " + array.join(", ") + ". ") : "";
		} else {
			content1 = array.length > 0 ? (content1 + "<br>&nbsp&nbsp " + array.join(", ") + " <br>") : "";
		}
		error.title = nls.cannotedit_noentitled_title;
		error.message = content1 + content2;
	}
	else if(nStatusCode == 9999) //content.json is too large
	{
		error.title = nls.doc_toolarge_title;
		error.message = nls.doc_toolarge_content;
	}
	//If it is in HTML mode, replace docs error message with viewer's
	if(typeof(DOC_SCENE)!='undefined'&&DOC_SCENE.mode&&DOC_SCENE.mode=='html')
	{
		if (nStatusCode == 1210 || nStatusCode == 1213 || nStatusCode == 1214 ) //ConversionException.EC_CONV_UNEXPECIFIED_ERROR
		{
			error.title = nls.unexpecified_conversion_error_title;
			error.message = nls.unexpecified_conversion_error_content;
		}
		else if (nStatusCode == 1206) //ConversionException.EC_CON_ENCRPTED_ERROR
		{
			error.title = nls.encrypted_conversion_error_title;
			error.message = nls.encrypted_conversion_error_content;
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
		else if (nStatusCode == 1212) //ConversionException.EC_CONV_EMPTY_FILE_ERROR
		{
			error.title = nls.corrupted_doc_title;
			error.message = nls.corrupted_doc_content;
		}
		else if ( nStatusCode == 1700)
		{
			error.title = dojo.string.substitute(nls.unexpected_code_title, { 'productName' : concord.util.strings.getProdName() });
			error.message = dojo.string.substitute(nls.unexpected_code_content, { 'productName' : concord.util.strings.getProdName() });
		}
		else if (nStatusCode == 400) // handle 400 error, HttpServletResponse.SC_BAD_REQUEST
		{
			error.title = nls.incorrect_web_address_title;
			error.message = nls.incorrect_web_address_content;		
		}
		else if (nStatusCode == 0 || nStatusCode == 2001) // handle 404 error in web.xml
		{
			error.title = nls.unexpecified_conversion_error_title;
			error.message = nls.unexpecified_conversion_error_content;
		}
	}
	return error;
};

concord.scenes.ErrorScene.renderError = function(nStatusCode, data,errMsg) {
	// when error page shown, shouldn't be counted as opened document
	if (!!window['pe']) {
		pe.unregisterOpenDocs();
	}
	
	var mainNode = dojo.body();
	
	try {
		var head = document.getElementsByTagName("head")[0];
		var stylesheet = document.createElement("link");
		stylesheet.rel = "stylesheet";
		stylesheet.type = "text/css";
		stylesheet.href = contextPath + window.staticRootPath + '/styles/css/concord/error.css';
		head.appendChild(stylesheet);
	} catch (e) {
	
	}
	
	dojo.addClass(mainNode,'lotusui');
	dojo.attr(mainNode,'role','alert');

	var error = this.getErrorMessage(nStatusCode, data);
	var nls = dojo.i18n.getLocalization("concord.scenes", "ErrorScene");
	
	if(window.g_featureConfig && g_featureConfig.VIEWER_POSTMESSAGE_FEATURE)
	{
		var viewerEvent = new Object();
		viewerEvent.event = "ic-fileviewer/previewFailed";
		viewerEvent.errorCode = nStatusCode ;
		if(nStatusCode == 1201)
		{
			var str = error.message.replace(/<\/?[^>]*>/g,'');
			str = str.replace(/[ | ]*\n/g,'\n');
			str = str.replace(/\n[\s| | ]*\r/g,'\n');
			viewerEvent.errorMessage = error.title + " " + str;
		}
		else
		{
			if(error.title.lastIndexOf(".")!=-1 && error.title.lastIndexOf(".")==error.title.length-1)
				viewerEvent.errorMessage = error.title + " " + error.message;
			else
				viewerEvent.errorMessage = error.title + ". " + error.message;
		}
		window.parent.postMessage(JSON.stringify(viewerEvent), '*');
		console.log(JSON.stringify(viewerEvent));
	}
	
	if ( concord.util.browser.isMobile())
	{
		str = "";
		concord.util.mobileUtil.postError(nStatusCode, error.title, error.message ,data);
		mainNode.innerHTML = str;
	}
	else {
		mainNode.innerHTML = ""; // Clear the nodes in mainNode first.
		var frameDiv = dojo.create("div", {id:"lotusFrame", "class":"lotusFrame"}, mainNode);
		dojo.attr(frameDiv,'role','main');
		var boxDiv = dojo.create("div", {"class":"lotusErrorBox lotusError"}, frameDiv);
		var contentDiv = dojo.create("div", {"class":"lotusErrorContent"}, boxDiv);
		if(	(dojo.locale.substr(0,2) == 'he') || 
			(dojo.locale.substr(0,2) == 'iw') || 
			(dojo.locale.substr(0,2) == 'ar'))
			dojo.attr(contentDiv, "dir", "rtl");
		var formDiv = dojo.create("div", {"class":"lotusErrorForm"}, contentDiv);
		var imgSrc = ""; 
		if(error.type == "info")
			imgSrc = contextPath + window.staticRootPath + "/images/msgInfo48.png";
		else 
			imgSrc = contextPath + window.staticRootPath + "/images/msgWarning48.png";		
		
		var msgImg = dojo.create("img", {src:imgSrc, alt:nls.warning_icon, title:nls.warning_icon}, contentDiv);
		var msgTitle = dojo.create("h1", {id:"scene-title", innerHTML:error.title}, formDiv);
		var msgContent = dojo.create("p", {innerHTML:error.message}, formDiv);
		
		var problem_id = null ;
		try
		{
			problem_id = data.problem_id;
		}
		catch (ex)
		{
			console.log("Error happens while get problem id from data .", ex);
		}
		if(problem_id != null && problem_id != "")
		{
			var problemDiv = dojo.create("div", {innerHTML:nls.problem_id_msg_title}, formDiv);
			var aMsg = dojo.create("a", {innerHTML:nls.problem_id_msg_show}, problemDiv);
			dojo.attr(aMsg,'id','problem_toggle');
			dojo.attr(aMsg,'href','javascript:;');
			dojo.style(aMsg, 'text-decoration', 'none');
			dijit.setWaiRole(aMsg, "button");
			dojo.connect(aMsg, "onclick", concord.scenes.ErrorScene.showMsg);
			var spanMsg = dojo.create("span", {innerHTML:problem_id}, problemDiv);
			dojo.attr(spanMsg,'id','problem_id');
			dojo.style(spanMsg, 'word-break', 'break-all');
			dojo.style(spanMsg, 'word-wrap', 'break-word');
			dojo.style(spanMsg, 'color', '#222222 !important');
			dojo.style(spanMsg, 'font-weight', 'lighter');
			dojo.style(spanMsg, 'display', 'none');
		}
		
		//if (errMsg)
		//{
		//	var contentDiv2 = dojo.create("div", {"class":"lotusErrorContent"}, boxDiv);
		//	var formDiv2 = dojo.create("div", {"class":"lotusErrorForm"}, contentDiv2);
		//	var msgContent2 = dojo.create("p", {innerHTML:errMsg}, formDiv2);
		//}
				
		if(error.hasBtn && error.btnUrl) {
			var btnLabel;
			if(concord.util.uri.isCCMDocument())
			{
				btnLabel = nls.return_to_library;
				
			}
			else if(concord.util.uri.isECMDocument())
			{
				btnLabel = nls.return_to_icn;
			}
			else
			{
				btnLabel = nls.return_to_files;
			}			
			var param = {label: btnLabel, id: "btn_return_to_files",onClick: dojo.hitch(this, concord.scenes.ErrorScene.onBtnClick, error.btnUrl)};;
			var button = new concord.widgets.LotusTextButton(param);
			
			var btnDiv = dojo.create("div", null, formDiv);			
			btnDiv.appendChild(button.domNode);			
		}				
	}
	
};

/**
 * this is a copy from AbstractScene:getFileDetailsURL
 */
concord.scenes.ErrorScene.getFileDetailsURL = function(){
	return concord.util.uri.getFileDetailsURL();
};

concord.scenes.ErrorScene.onBtnClick = function(url) {
	window.location = url;
};

concord.scenes.ErrorScene.showProblemID = function (problem_id, id) {
	var nls = dojo.i18n.getLocalization("concord.scenes", "ErrorScene");
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

concord.scenes.ErrorScene.showMsg = function () {
	var nls = dojo.i18n.getLocalization("concord.scenes", "ErrorScene");
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
