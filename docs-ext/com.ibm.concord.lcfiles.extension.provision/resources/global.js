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

dojo.provide("concord.global");

dojo.require("dojo.cookie");
dojo.require("dojo.i18n");
dojo.require("dojox.encoding.base64");  
dojo.require("dojox.encoding.digests.MD5");

dojo.require("lconn.core.uiextensions");
dojo.require("lconn.share.bean.File");
dojo.require("lconn.share.bean.Version");

dojo.require("concord.SAMLFrameLogin");
dojo.require("concord.DocsPreload");
dojo.requireLocalization("concord", "ccdfilesext");

/**
 * For some deployment ENV, we need the hardcoded url like below,
 * when IC3 and IBM Docs are not sharing the same hostname
 * glb_concord_url = "/ajaxProxy/proxy/http/w3.tap.ibm.com/docs";
 * glb_concord_url_wnd_open = "http://w3.tap.ibm.com/docs";
 **/
glb_concord_url = "/docs";
glb_concord_url_wnd_open = "/docs";

//@deprecated
EntitlementCheck = false;

concord.global = {};

// copied from dojo.i18n of dojo 1.9 and overwrote the locale
concord.global._getLocalization = function(pack, name, locale) {
	var base = pack + ".nls." + name;
	var localization, bundle = dojo.getObject(base), elements = locale.split('-');
	for(var i = elements.length; i > 0; i--){
		var loc = elements.slice(0, i).join('_');
		if (dojo.exists(loc, bundle)) {
			localization = bundle[loc];
			break;
		}
	}
	if (!localization && bundle && bundle.ROOT)
		localization = bundle.ROOT;
	return localization; 
};

concord.global.lang = dojo.locale.toLowerCase();
if((concord.global.lang.indexOf("en")==0)||(concord.global.lang==="zh-cn")||(concord.global.lang==="zh-tw")||(concord.global.lang==="pt-br")||
   ((concord.global.lang.split("-").length == 1)&&(concord.global.lang != "zh")&&(concord.global.lang != "nn")
		   &&(concord.global.lang != "nb") && (concord.global.lang != "in")&& (concord.global.lang != "id-id")&& (concord.global.lang != "in-id"))){
	concord.global.nls = dojo.i18n.getLocalization("concord", "ccdfilesext");
} else { //fall back locale
	if(dojo.version.major == 1 && dojo.version.minor < 7)
	{
		concord.global._locMap = {
				  "zh-hk": "zh-tw",
				  "zh-mo": "zh-tw",
				  "zh-sg": "zh-cn",
				  "zh": "zh-cn",
				  "nb": "no",
				  "nb-no": "no",
				  "nn-no": "no",
				  "nn": "no",
				  "in": "id",
				  "id-id": "id",
				  "in-id": "id"
				};
				if(concord.global._locMap[concord.global.lang]){
					concord.global.lang = concord.global._locMap[concord.global.lang];
				} else {
					concord.global.lang = concord.global.lang.split("-")[0];
				}
				dojo._loadedModules["concord.nls.ccdfilesext"]._built=false;
				dojo.requireLocalization("concord", "ccdfilesext", concord.global.lang);
				concord.global.nls = dojo.i18n.getLocalization("concord", "ccdfilesext", concord.global.lang);		
	}
	else 
	{
		concord.global._locMap = {
				  "zh-hk": "zh-tw",
				  "zh-mo": "zh-tw",
				  "zh-sg": "zh-cn",
				  "zh": "zh-cn",
				  "nb": "nb",
				  "nb-no": "nb",
				  "nn-no": "nb",
				  "nn": "nb",
				  "no": "nb",
				  "id-id": "id",
				  "in-id": "id"
				};
				var useLocMap = true;
				if(dojo.isIE && concord.global.lang == "id-id"){
					useLocMap = false;			
				}
				if(concord.global._locMap[concord.global.lang] && useLocMap){
					concord.global.lang = concord.global._locMap[concord.global.lang];
				} 
				concord.global.nls = concord.global._getLocalization("concord", "ccdfilesext", concord.global.lang);				
	}	
}

concord.global._isNeedDocsSAML = null;
concord.global._isEntitlementChecked = null;
concord.global._isUploadNewVersionEnabled = null;
concord.global.IBMDOCID2 = "00000000-00000-0000-0001-00000000000000"; // This ID is provided in XML and wrong, but will be corrected by the java.util.UUID.fromString when import to Files DB
concord.global.IBMDOCID = "00000000-0000-0000-0001-000000000000"; // This is correct UUID


concord.global.xhrGetRetry = function(args){
	var _handle = function(args, handle, response, ioargs){
		if (response instanceof Error){
			args.handle = handle;
			dojo.xhrGet(args);
		}
		else{
			handle(response, ioargs);
		}
	}
	args.handle = dojo.hitch(this, _handle, args, args.handle);
	return dojo.xhrGet(args);
};

concord.global.isNeedDocsSAML = function() {
		if(concord.global._isNeedDocsSAML === null) {
			concord.global.showConcordEntry()
		}
		return concord.global._isNeedDocsSAML;
};
	
concord.global.showConcordEntry = function() {
		concord.global._isNeedDocsSAML = false;
		//if current domain contains a cookie called "entitlements" means this is a SC env, need to determine whether show Docs or not.
		var entitlementInfo = dojo.cookie("entitlements");
		if(entitlementInfo){
			var encodeStrs = entitlementInfo.split("-");
			var eStr = encodeStrs[1];
			if(eStr){
				var dByteArray = dojox.encoding.base64.decode(eStr);
				var s = [];  
				dojo.forEach(dByteArray, function(c){ s.push(String.fromCharCode(c)); });  
				var dStr = s.join(""); 
				if(dStr.indexOf("bh_docs")>-1){
					concord.global._isNeedDocsSAML = true;
					return true;
				}
			}
			return false;
		}
		else{
			if (concord.global._isEntitlementChecked != null){
				return concord.global._isEntitlementChecked;
			}
			
			if(lconn.core.auth.isAuthenticated())
			{
				var url = glb_concord_url + "/api/entitlement";
				var response = null;
				concord.global.xhrGetRetry({
					url: url,
					handleAs: "json",
					timeout: 30000,
					sync: true,
					preventCache: true,
					handle: function(r, io){
						response = r;
					}
				});
				if (response instanceof Error){
					concord.global._isEntitlementChecked = false;
					return false;
				}
				else {
					concord.global._isEntitlementChecked = response.entitlement_allowed;
					return response.entitlement_allowed;
				}
			}
			else {
				return false;
			}
		}
};

concord.global.isIBMDocFile = function(file) {
		// two ids caused by bug of Files API.
		var curTypeID = "";
		if (file.declaredClass == "lconn.share.bean.File" || file.declaredClass == "lconn.share.bean.Version") {
			curTypeID = file.getObjectTypeId();
		}
		return (curTypeID == concord.global.IBMDOCID2) || (curTypeID == concord.global.IBMDOCID);
};

concord.global.isOwner = function(file, app) {
		var id1 = app.getAuthenticatedUserId();
		var id2 = file.getAuthor().id;
		return id1 == id2;
};

concord.global.createHelpLink = function(app, el, msg, opt) {
	if (dojo.getObject("lconn.files.scenehelper.createHelpLink"))
		return lconn.files.scenehelper.createHelpLink(app, el, msg, opt);
	else
		return null;
};

concord.global.shouldShowExternal = function(app) {
		if(!app) return false; 
		if(!(app.declaredClass === 'lconn.files.PersonalFiles')){
			return false;
		}
		
		var showExternal = true; // Ignored in on-premise mode
//		var isExternalSupported = !!dojo.getObject("lconn.share.config.features.sharingIntent");
//		if (!isExternalSupported || !app.getUserPermissions().canShareInternal() || !(app.declaredClass === 'lconn.files.PersonalFiles'))
//			return false;	
		try{
			if(!app.authenticatedUser.policy.capabilities.canCreate.files.external){
				showExternal = false;
			}
		}catch(e){
			showExternal = false;
		}		
		return showExternal;
};

concord.global.getExternalWidget = function(dialog, app, SHARING_INTENT, parentNode, isFromTemplate) {
		if(!app) return null;
		
		var isExternalDefault = dojo.getObject("policy.isExternalDefault", false, app.authenticatedUser) != false;
		var d = document;	
		var div_ext = d.createElement("div");
		var inputExt = dialog.extChkBox = d.createElement("input");
		inputExt.type = "checkbox";
		inputExt.id = dialog.id + "_setExt";
		inputExt.className = "lotusCheckbox";
		inputExt.name = "_setExt";
		inputExt.value = "true";
		inputExt.checked = inputExt.defaultChecked = isExternalDefault;
		div_ext.appendChild(inputExt);
		//isExternal folder
		var disabled = false;
		var context = app.getContext ? app.getContext("file", "create", true) : null;
		if(context && context.type == "folder" && context.isExternal){
			if(isFromTemplate){
				disabled = false;
			}else{				
				disabled = true;
			}
		}		
		if((app.authenticatedUser && app.authenticatedUser.isExternal) || disabled){
			inputExt.checked = true;
			inputExt.disabled = true;
		}
		var label_ext = d.createElement("label");
		label_ext.className = "lotusCheckbox";		
		label_ext.appendChild(d.createTextNode(SHARING_INTENT));		
		dojo.attr(label_ext, "for", inputExt.id);
		div_ext.appendChild(label_ext);

		div_ext.appendChild(d.createTextNode("\u00a0"));
		concord.global.createHelpLink(app, div_ext, "upload.external", {
			inline : true
		});	
		parentNode.appendChild(div_ext);
		
		return inputExt;
};

concord.global.isEditor = function(file) {
		return !!file.getPermissions().Edit;
};

concord.global.isReader = function(file) {
		return !!file.getPermissions().View;
};

concord.global.getDocDraftURL = function(file, respectCache) {
		var url = glb_concord_url + "/api/docsvr/lcfiles/" + file.getId() + "/draft";
		if (respectCache) {
			url = url + "?respect_cache=true";
		}
		return url;
};

concord.global.getDocEditURL = function(fileId, repoId) {
		// 'lcfiles' is used as the default repoId.
		if (!repoId) {
			repoId = "lcfiles";
		}
		return glb_concord_url_wnd_open + "/app/doc/" + repoId + "/" + fileId + "/edit/content";
};

concord.global.getDocSettingsUri = function(fileId, repoId) {
	if (!repoId) {
		repoId = "lcfiles";
	}
	return glb_concord_url_wnd_open + "/api/docsvr/" + repoId + "/" + fileId + "/edit/settings";
};

concord.global.getDocViewURL = function(fileId, format) {
		// 'lcfiles' is used as the default repoId.
		var url = glb_concord_url_wnd_open + "/app/doc/lcfiles/" + fileId + "/view/content";
		if (format) {
			url = url + "?asFormat=" + format;
		}
		return url;
};
	
concord.global.getPublishJobQueryURL = function(file, jobId) {
		var url = glb_concord_url + "/api/job/lcfiles/" + file.getId() + "/" +jobId;
		return url;
};

concord.global.getIconBaseURL = function() {
	var webresources = lconn.core.config.services.webresources;
	var url = webresources.url + "/web/com.ibm.lconn.core.styles/sprite/";
	url = url.replace(/^https?:/i, window.location.protocol);
	return url;
};

concord.global.hashWinNameFromId = function(fid) {
		return fid.replace(/[-\s.@]/g, '_');
};
	
concord.global.getErrorMessage = function(errorCode){
		var errorMsg = concord.global.nls.service_unavailable_content;	
		if (errorCode == 1001) {
			//RepositoryAccessException.EC_REPO_NOVIEWPERMISSION
			errorMsg = concord.global.nls.viewaccess_denied_content;
		} else if (errorCode == 1002) {
			// RepositoryAccessException.EC_REPO_NOEDITPERMISSION
			errorMsg = concord.global.nls.publishErrMsg_NoPermission;
		} else if (errorCode == 1003) {
			// RepositoryAccessException.EC_REPO_NOTFOUNDDOC
			errorMsg = concord.global.nls.doc_notfound_content;
		} else if (errorCode == 1004) {
			// RepositoryAccessException.EC_REPO_CANNOT_FILES
			errorMsg = concord.global.nls.fileconnect_denied_content;
		} else if (errorCode == 1005) {
			// RepositoryAccessException.EC_REPO_OUT_OF_SPACE
			errorMsg = concord.global.nls.repository_out_of_space_content;
		} else if (errorCode == 1200) {
			// ConversionException.EC_CONV_SERVICE_UNAVAILABLE
			errorMsg = concord.global.nls.convservice_unavailable_content;
		} else if (errorCode == 1201 || errorCode == 1500) {
			// ConversionException.EC_CONV_DOC_TOOLARGE
			// ||
			// OutOfCapacityException.EC_OUTOF_CAPACITY
			errorMsg = concord.global.nls.doc_toolarge_content;
		} else if (errorCode == 1202) {
			// ConversionException.EC_CONV_CONVERT_TIMEOUT
			errorMsg = concord.global.nls.conversion_timeout_content;
		} else if (errorCode == 1208) {
			errorMsg = concord.global.nls.server_busy_content;
		} else if (errorCode == 1601 || errorCode == 1602) {
			// DraftDataAccessException.EC_DRAFTDATA_ACCESS_ERROR
			// ||
			// DraftStorageAccessException.EC_DRAFTSTORAGE_ACCESS_ERROR
			errorMsg = concord.global.nls.storageserver_error_content;
		} else if (errorCode == 1706) {
			// DocumentServiceException.EC_DOCUMENT_LOCKED_PUBLISH_ERROR
			errorMsg = concord.global.nls.publish_locked_file;
		}
		return errorMsg;
};
	
concord.global.haveDocsLTPA = function() {
		var ltpaflag = dojo.cookie("LTPADocsFlag");
		if(ltpaflag){
			return true;
		}
		return false;
};	
	
concord.global.doDocsSSO = function() {
		// must use an iframe to handle TFIM post and add Docs cookies, will remove it afterSSO.
		var node = dojo.byId("ImmediateSamlFrame");
		if(!node)
		{
			var samlFrame = document.createElement("IFRAME");
			samlFrame.name = samlFrame.id = "ImmediateSamlFrame";
			samlFrame.style.top = "-9999px";
			samlFrame.style.width = samlFrame.style.height = "1px";
			samlFrame.style.display = "none";
			samlFrame.src = "/docs/app/doc";		
			document.body.appendChild(samlFrame);
		}
};
	
concord.global.getDocsPreferences = function(docType, userID) {
		var url = glb_concord_url + "/api/people?method=getPreferenceInfo";
		if(docType){
			url = url + "&docType=" + docType;
		}
		var response = null;
		concord.global.xhrGet({
			url: url,
			filesUserId : userID,
			handleAs: "json",
			timeout: 30000,
			sync: true,
			preventCache: true,
			handle: function(r, io){
				response = r;
			}
		});
		if (response instanceof Error) {
			return null;
		}
		return response;
};

concord.global.getFilesVersion = function() {
		 if(window._lconn_files_config){
			 var versionStr = window._lconn_files_config.releaseVersion;
			 if (versionStr) {
				var versionValues = versionStr.split('.');
				if (versionValues[0] && versionValues[1]) {
					return versionValues[0] * 1 + versionValues[1] * 0.1;
				}
			 }
		 }
		 return null;
};

concord.global.isUploadNewVersionEnabled = function() {
	return !!concord.global._isUploadNewVersionEnabled;
};

concord.global.addCsrfToken = function(args){
	var ct = new Date().getTime().toString();
	var seed = args.filesUserId + "@@" + ct.substring(4,ct.length-1) + "##";
	var token = dojox.encoding.digests.MD5(seed, dojox.encoding.digests.outputTypes.Hex);	
	var csrfHeader = {"X-Csrf-Token": token, "X-Timestamp": ct};
	
	if(typeof args.headers == "undefined") {
		args.headers = {};
	}
	dojo.mixin(args.headers, csrfHeader);
	var repoHeader = {"X-DOCS-REPOID": "lcfiles"};
	dojo.mixin(args.headers, repoHeader);
	
};

if(concord.global.isNeedDocsSAML()){
	concord.global.xhrGet = function(args){
		concord.global.addCsrfToken(args);
		if(concord.global.haveDocsLTPA()){
			return dojo.xhrGet(args);
		}
		else
		{
			concord.global.doDocsSSO();
			setTimeout(dojo.hitch(this, concord.global.xhrGet, args), 1000);
		}
	};
}
else 
{
	concord.global.xhrGet = function(args){
		concord.global.addCsrfToken(args);
		return dojo.xhrGet(args);
	};
}

concord.global.xhrPost = function(args){
	concord.global.addCsrfToken(args);
	return dojo.xhrPost(args);
};

concord.global.showMsg = function(){
	var node = dojo.byId("problem_id");
	var nodeDisplay = dojo.style(node, "display");
	console.log( nodeDisplay  );
	if(nodeDisplay && nodeDisplay == "none")
	{
		dojo.style(node, "display", "block");
		dojo.byId("problem_toggle").innerHTML = concord.global.nls.newDialogProblemidErrMsgHide ;
	}
	else
	{
		dojo.style(node, "display", "none");
		dojo.byId("problem_toggle").innerHTML = concord.global.nls.newDialogProblemidErrMsgShow ;
	}
};

(function() {

	var docConfig = {
		// openInNewTab : true,
		disableRevert : true,
		disableGenericEdit : true,
		// hideCreated: true,
		// hideListTime: true,
		hideUpdateTime : true,
		disableOpenInline:true
	}			
	
	lconn.core.uiextensions.add("lconn/files/config/file", function(file, opt) {
		if (concord.global.showConcordEntry()){
			docConfig.disableDownload = true;
		}
		// you can also make change to docConfig according to the current
		// file properties
		var lcConfig = dojo.getObject("lconn.share.config");
		var uploadNewVersionEnabled = false;				
		var restoreVersionEnabled = false;				
		if(lcConfig && lcConfig.actionConfig && lcConfig.actionConfig.isActionAllowed)
		{
			uploadNewVersionEnabled = lcConfig.actionConfig.isActionAllowed(concord.global.IBMDOCID, null, "uploadNewVersion");
			restoreVersionEnabled = lcConfig.actionConfig.isActionAllowed(concord.global.IBMDOCID, null, "restoreVersion");
			concord.global._isUploadNewVersionEnabled = uploadNewVersionEnabled;
		}
		if (concord.global.isIBMDocFile(file)) {
			docConfig.disableGenericEdit = !uploadNewVersionEnabled;
			docConfig.disableRevert = !restoreVersionEnabled;
			return docConfig;
		}
	});
})();

dojo.addOnLoad( function() {
	if(concord.global.isNeedDocsSAML()) {
	    // iFrame to do SAML SSO, will also do 
		var glb_docsLoginFrm = new concord.SAMLFrameLogin();
		glb_docsLoginFrm.login(0);		
	}
	window.setTimeout(function(){
		if(concord.global.showConcordEntry()) {
			var glb_docsPreloadFrm = new concord.DocsPreload();
			glb_docsPreloadFrm.preload(0);
		}
	}, 5000);
});
