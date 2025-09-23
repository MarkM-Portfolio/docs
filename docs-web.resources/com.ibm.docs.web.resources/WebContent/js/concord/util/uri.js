dojo.provide("concord.util.uri");

concord.util.uri.parseUri = function(uri) {
   if (!uri)
      return null;
   if (typeof uri != "string" && console.trace) {
      console.warn("parseUri called with a non string argument");
      console.trace();
   }
   uri = new dojo._Url(uri);
   uri.queryParameters = concord.util.uri.getRequestParameters(uri);
   return uri;
};

concord.util.uri.splitQuery = function(query) {
   var params = {};
   if (!query)
      return params;
   if (query.charAt(0) == "?")
      query = query.substring(1);

   var args = query.split("&");
   for (var i=0; i<args.length; i++)
      if (args[i].length > 0) {
         var separator = args[i].indexOf("=");
         if (separator == -1) {
            var key = decodeURIComponent(args[i]);
            var existing = params[key];
            if (dojo.isArray(existing))
               existing.push("");
            else if (existing)
               params[key] = [existing,""];
            else
               params[key] = "";
         } else if (separator > 0) {
            var key = decodeURIComponent(args[i].substring(0, separator));
            var value = decodeURIComponent(args[i].substring(separator+1));
            var existing = params[key];
            if (dojo.isArray(existing))
               existing.push(value);
            else if (existing)
               params[key] = [existing,value];
            else
               params[key] = value;
         }
      }
   return params;
};

concord.util.uri.stripRelativePathInfo = function(cssLink){
	
	if(cssLink){
		var lastIndex = -1;
		lastIndex = cssLink.lastIndexOf('../');
		
		if(lastIndex>=0){
			cssLink = cssLink.substring(lastIndex + 3);
		}
	}
	return cssLink;
};

concord.util.uri.getRequestParameters = function(uri) {
   var params = {};
   if (!uri)
      uri = window.location.href;
   if (typeof uri == "string")
      uri = new dojo._Url(uri);
   return concord.util.uri.splitQuery(uri.query);
};

/*
 * url for browser to open a document's page
 */
concord.util.uri.getDocPageUri = function(d) {
	var uri = concord.util.uri.getDocPageRoot(d) + "/content";
	return uri;
};

concord.util.uri.getDocPageRoot = function(d) {
	var uri;
	if (!d)
	{
		uri = contextPath + "/app/doc/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/edit";
	}
	else {
		uri = contextPath + "/app/doc/" + d.getRepository() + "/" + d.getUri() + "/edit";
	}
	return uri;
};

concord.util.uri.getDocPageUriById = function(id) {
	var uri = contextPath + "/app/doc/" + id + "/edit/content";
	return uri;
};

concord.util.uri.getDocPageUri = function(d) {
	var uri;
	if (!d)
	{
		uri = contextPath + "/app/doc/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/edit/content";
	}
	else {
		uri = contextPath + "/app/doc/" + d.getRepository() + "/" + d.getUri() + "/edit/content";
	}
	return uri;
	
};

concord.util.uri.getMentionUri = function() {
	return contextPath + "/api/atsvr/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri;
};

concord.util.uri.getFilesPeopleUri = function() {
	return  "/files/basic/api/people/feed?self=true";
};

concord.util.uri.getAtNotificationUri = function() {
	return window.g_atNotificationUri;
};

concord.util.uri.getAtUsersUri = function() {
	if(window.g_atUsersUri == undefined || window.g_atUsersUri == ""){
		return "";
	}
	return window.g_atUsersUri.replace("{fileid}", DOC_SCENE.uri);
};

concord.util.uri.getSTConfigUri = function() {
	return "/navbar/bannernext?rp=entitle&rp=gk";
};

concord.util.uri.getDocServiceRoot = function() {
	return (contextPath + "/api/docsvr");
};

concord.util.uri.getDocUri = function(d) {
	if (!d)
	{
		d = window['pe'].scene.bean;
	}

	if (!d)
	{
		return concord.util.uri.getDocServiceRoot() + "/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri;
	}
	else
	{
		return concord.util.uri.getDocServiceRoot() + "/" + d.getRepository() + "/" + d.getUri();
	}
};

concord.util.uri.getPrintPDFUri = function(repository, docUri, isDraft) {
	var uri = concord.util.uri.getViewModeUri(repository, docUri, isDraft) + "?asFormat=pdf";
	return uri;
};

/*
 * return the uri for the currently editing document
 */
concord.util.uri.getDocEditUri = function(d) {
	return (concord.util.uri.getDocUri(d) + "/edit");
};

concord.util.uri.getEditAttRootUri = function(d) {
	var uri = concord.util.uri.getDocEditUri(d) + "/att";
	return uri;
};

concord.util.uri.getDocSettingsUri = function(d) {
	var uri = concord.util.uri.getDocEditUri(d) + "/settings";
	return uri;
};

/*
 * return the uri for accessing the draft, for publish or save as
 */
concord.util.uri.getDocDraftAccUri = function(d) {
	return (concord.util.uri.getDocUri(d) + "/draft");
};

/*
 * return an attachment's uri by it's attachment name.
 */
concord.util.uri.getEditAttUri = function(att, d) {
	var uri = concord.util.uri.getEditAttRootUri(d) + "/" + att;
	return uri;
};

concord.util.uri.getPasteAttachmentURL= function(d) {
	var uri = concord.util.uri.getEditAttRootUri(d) + "?method=paste";
	return uri;
};

concord.util.uri.getGalleryAttachmentURL= function(d){
	var uri = concord.util.uri.getEditAttRootUri(d) + "?method=gallery";
	return uri;
};

/*
 * document reference (fragment)
 */
concord.util.uri.getDocFragmentUri = function(d) {
	if (!d)
	{
		d = window['pe'].scene.bean;
	}
	var uri = contextPath + "/api/frgsvr/" + d.getRepository() + "/" + d.getUri() + "/fragment";
	return uri;
};

/*
 * revision
 */
concord.util.uri.getDocRevUri = function(scene) {
	if (!scene)
	{
		scene = window['pe'].scene;
	}	
	var uri = contextPath + "/api/revsvr/" + scene.sceneInfo.repository + "/" + scene.sceneInfo.uri;
	return uri;
};
/*
 * get draft url
 */
concord.util.uri.getDocDraftUri = function(scene, isDraft){
	var uri;
	if(scene!=null && scene.sceneInfo!=null)
	{
		if (isDraft == undefined || isDraft == null)
		{
			isDraft = "true";
		}
	
		if (isDraft == "true")
		{
			uri = contextPath + "/app/doc/" + scene.sceneInfo.repository + "/" + scene.sceneInfo.uri + "/view/draft/content.html";
		}
		else
		{
			uri = contextPath + "/app/doc/" + scene.sceneInfo.repository + "/" + scene.sceneInfo.uri + "/view/content.html";
		}
	}
	return uri;
};
/*
 * get draft url
 */
concord.util.uri.getDocViewModeUri = function(d, isDraft){
	if (!d)
	{
		d = window['pe'].scene.bean;
	}

	if (isDraft == undefined || isDraft == null)
	{
		isDraft = "true";
	}

	var uri;
	if (isDraft == "true")
	{
		uri = contextPath + "/app/doc/" + d.getRepository() + "/" + d.getUri()+"/view/draft/content";
	}
	else
	{
		uri = contextPath + "/app/doc/" + d.getRepository() + "/" + d.getUri()+"/view/content";
	}
	return uri;
};
concord.util.uri.getViewModeUri = function(repoId, docUri, isDraft){
	if (isDraft == undefined || isDraft == null)
	{
		isDraft = "true";
	}

	var uri;
	if (isDraft == "true")
	{
		uri = contextPath + "/app/doc/" + repoId + "/" + docUri +"/view/draft/content";
	}
	else
	{
		uri = contextPath + "/app/doc/" + repoId + "/" + docUri +"/view/content";
	}
	return uri;
};

concord.util.uri.getUploadNewVersionUri = function(){
	return contextPath + "/api/docsvr/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/uploadversion";
};

concord.util.uri.getAutoPublishUri = function(){
	return contextPath + "/api/docsvr/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/autopublish";
};

concord.util.uri.getCCMSubmitForReview = function(){
	return contextPath + "/api/docsvr/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri + "/ccmsubmitforreview";
};

concord.util.uri.getFileDetailsURL = function(){
	var fileURL = DOC_SCENE.fileDetailsURL=="null"?null:DOC_SCENE.fileDetailsURL;
	if(fileURL){
		if(mt_enabled && concord.util.uri.isLCFilesDocument())
		{
			fileURL = "/" + fileURL.replace(/^(?:\/\/|[^\/]+)*\//, "");
		}
		else
		{
			fileURL = fileURL.replace(/^https?:/i, window.location.protocol);
		}
	}
	return fileURL;
};

concord.util.uri.getFilesListURL = function(){
	var fileURL = DOC_SCENE.filesListURL=="null"?null:DOC_SCENE.filesListURL;
	if(fileURL){
		if(mt_enabled && concord.util.uri.isLCFilesDocument())
		{
			fileURL = "/" + fileURL.replace(/^(?:\/\/|[^\/]+)*\//, "");
		}
		else
		{				
			fileURL = fileURL.replace(/^https?:/i, window.location.protocol);
			if(concord.util.uri.isICNDocument())
			{
				var params = concord.util.uri.getRequestParameters();
				if( params.desktop ) 
				{
					if(fileURL.indexOf("?") == -1)
					{
						fileURL += '?desktop=' + params.desktop;
					} 
					else 
					{
						fileURL += '&desktop=' + params.desktop;
					}
				}
			}
		}
	}
	return fileURL;
};

concord.util.uri.getFncsRootFeedURL = function(){
	var url = DOC_SCENE.fncsServerUrl + "/atom/library/" + DOC_SCENE.libraryID + "/feed";
	return url.replace(/^https?:/i, window.location.protocol);
};

concord.util.uri.getFncsDocEntryURL = function(){
	var docId = DOC_SCENE.docId.replace(/^idd_/i, "");
	var url = DOC_SCENE.fncsServerUrl + "/atom/library/" + DOC_SCENE.libraryID + "/draft/{" + docId + "}/entry";
	var parameter = '?acls=true&includeRecommendation=true&includeTags=true&includeNotification=true&includeDownloadInfo=true&includeCurrentVersion=true&includeSecurityInheritance=true&includeLocked=true&includeLockOwner=true&includeWorkingDraftInfo=true&includeApprovers=true';
	url += parameter;
	return url.replace(/^https?:/i, window.location.protocol);
};


concord.util.uri.isExternal = function() {
	if(concord.util.uri.isExternalCMIS() || concord.util.uri.isExternalREST())
		return true;
	return false;
};

concord.util.uri.isExternalCMIS = function() {
	if(DOC_SCENE.repository)
		return DOC_SCENE.repository.toLowerCase() == "external.cmis";
	return false;
};

concord.util.uri.isExternalREST = function() {
	
	if(DOC_SCENE.repository && DOC_SCENE.repository.toLowerCase() == "external.rest")
		return true;
	
	if(DOC_SCENE.repositoryType && DOC_SCENE.repositoryType.toLowerCase() == "external.rest")
		return true;

	return false;
};

concord.util.uri.isECMDocument = function() {
	if(DOC_SCENE.repository)
		return DOC_SCENE.repository.toLowerCase() == "ecm";
	return false;
};

concord.util.uri.isICNDocument = function() {
	if(concord.util.uri.isECMDocument())
	{
		if(DOC_SCENE.communityID && DOC_SCENE.communityID.length > 0)
			return false;
		else
			return true;
	}
	return false;
};

concord.util.uri.isCCMDocument = function() {	
	if(concord.util.uri.isECMDocument())
	{
		if(DOC_SCENE.communityID && DOC_SCENE.communityID.length > 0)
			return true;
	}
	
	return false;
};

concord.util.uri.isLCFilesDocument = function() {
	if(DOC_SCENE.repository)
		return DOC_SCENE.repository.toLowerCase() == "lcfiles";
	
	return false;
};

concord.util.uri.isLocalDocument = function() {
	if(DOC_SCENE.repository)
		return DOC_SCENE.repository.toLowerCase() == "concord.storage";
	
	return false;	
};

concord.util.uri.getDraftStatus = function()
{
	var chkurl = concord.util.uri.getDocDraftAccUri();
	var resp, ioArgs;
	dojo.xhrGet({
		url : chkurl,
		handleAs : "json",
		preventCache : true,
		handle : function(r, io) {
			resp = r;
			ioArgs = io;
		},
		sync : true
	});
	if (resp instanceof Error) {
		return null;
	}
	return resp;
};


/////////////////////////////////////////////////////////////////////////////////////////////
///  should not be in uri                        ////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////

concord.util.uri.injectCSS = function(domDoc,cssFileName,loadFromAttachment, saveBackgroundImgs){
		if ((domDoc) && (cssFileName)){  
			var href = null;
			var isExist = false;
			if(loadFromAttachment == false){
				href = cssFileName;
			}else{
				href=concord.util.uri.getEditAttUri(cssFileName);
			}
			//check if the link is already available
			var links = dojo.query("link", domDoc),
			    link = null;
			if(links!=null && links.length>0){
				for(var i=0; i < links.length; i++){
					var hrefLink = links[i].getAttribute("href");
					var srcLink = links[i].getAttribute("src");
					var idx, idx2;
					if(hrefLink!=null){
						idx = hrefLink.indexOf(href);
					}else if(srcLink!=null){
						idx = srcLink.indexOf(href);
					}
					if(href!=null && hrefLink!=null){
						idx2 = href.indexOf(hrefLink);
					}else if(href!=null && srcLink!=null){
						idx2 = href.indexOf(srcLink);
					}
					if(idx >=0 || idx2 >=0){
					    isExist = true;
					    link = links[i];
					}
				}
			}
			if(!isExist){
				//if the link is not available, create it
				link = domDoc.createElement("link");
				link.rel='stylesheet';
				link.href = href;
		
				var headTag = domDoc.getElementsByTagName("head")[0];
				if (headTag)
					//if (domDoc.createStyleSheet){
					//	domDoc.createStyleSheet(link.href)
					//}else{
						headTag.appendChild(link);
					//}
				else{
					throw new Error("concord.util.uri.injectCSS: Error injecting CSS "+cssFileName+" in document.");
					return;
				}
			}
		} else {
			throw new Error("concord.util.uri.injectCSS: Error injecting CSS "+cssFileName+" in document.");
			return;
		}
};
concord.util.uri.removeCSS = function(domDoc,cssFileName){
	if ((domDoc) && (cssFileName)){ 
		var links = dojo.query("link", domDoc);
		for(var i=links.length-1; i>=0; i--){
			if(links[i].href.indexOf( cssFileName)>=0){
				dojo.destroy(links[i]);
				break;
			}
		}
		var styles = dojo.query("style", domDoc);
		for(var i=styles.length-1; i>=0; i--){
			var styleName = styles[i].getAttribute("styleName");			
			var idx = (styleName!=null) ? styleName.indexOf(cssFileName): -1;				
			if(idx >=0){
				dojo.destroy(styles[i]);
			break;
			}
		}
	}

};
//
// Get CSS info. href needs to be a a css path
//
concord.util.uri.injectCssStyle = function(domDoc,cssFileName,loadFromAttachment){
	if ((domDoc) && (cssFileName)){  
		var href = null;
		var isExist = false;
		if(loadFromAttachment == false){
			href = cssFileName;
		}else{
			href=concord.util.uri.getEditAttUri(cssFileName);
		}
		//check if the style node is already available
		var styles = dojo.query("style", domDoc);
		if(styles!=null && styles.length>0){
			for(var i=0; i < styles.length; i++){
				var styleName = styles[i].getAttribute("styleName");			
				var idx = (styleName!=null) ? styleName.indexOf(cssFileName): -1;				
				if(idx >=0){
					isExist = true;
					return styles[i];
				}
			}
		}
		var url = href;
		var responseData = null;
		var xhrArgs =
			{				
				url: url,
				handleAs: 'text',
				
				load: function(data,io) {					
						console.log('concord.util.uri.getCSS -> data received');
						responseData = data;
				},
				
				sync: true,
				preventCache: true,
				error: function(error)
				{
						console.log('concord.util.uri.getCSS -> Error received while getting css');
						console.log(error);
				}
			};		
		try{
			console.log('concord.util.uri.getCSS -> Sending request to get css',url);	
			var xhrCall = dojo.xhrGet(xhrArgs);		
			if(responseData){
				var style = domDoc.createElement("style");
				dojo.attr(style,'styleName',cssFileName);
				dojo.attr(style,'type','text/css');		
				var rules = domDoc.createTextNode(responseData);

				// defect 7469 appending the style node to headTag early to prevent known ie issue with cssText
				// you must first append the element to the document before you can set cssText
				// http://msdn.microsoft.com/en-us/library/ie/ms533698(v=vs.85).aspx
				var headTag = domDoc.getElementsByTagName("head")[0];
				if (headTag){
				    //the 2 css must be placed before style of 'text/css'
				     if( cssFileName.indexOf('office_styles.css')!=-1 || cssFileName.indexOf('office_automatic_styles.css')!=-1){
				         var styles = domDoc.getElementsByTagName("style");
				         if (styles && styles.length > 0) 
				             headTag.insertBefore(style,styles[0]);
				         else 
	                         headTag.appendChild(style);
				     }
				     else
					headTag.appendChild(style);
				}
				
				if (style.styleSheet) 
				{
					style.styleSheet.cssText = rules.nodeValue;
					style.appendChild(rules);
				}
		        else 
		        	style.appendChild(rules);
				
				return style;
			}
		}
		catch(e)
		{
				console.log('concord.util.uri.getCSS -> Error while getting CSS');
				console.log(e);
		}
	}
};
concord.util.uri.getContext= function(myUrl){
	var context = "";
	if(myUrl!=null && myUrl.length>0){
		var idxFirstSlash = myUrl.indexOf("/", 8); //first slash after "http://" or "https://"
		context = myUrl.substring(idxFirstSlash+1, myUrl.indexOf("/", idxFirstSlash+1));
	}
	return context;
};

concord.util.uri.hasContext= function(context, myUrl){
	var retVal = false;
	if(context!=null && context.length>0){
		if(myUrl==null){ //if url is not specified, use the browser window url
			myUrl = window.location.toString();
		}
		var idxFirstSlash = -1; 
		if(myUrl.indexOf("http")>=0){
			idxFirstSlash = myUrl.indexOf("/", 8); //first slash after "http://" or "https://"
		}else if(myUrl.indexOf("/")==0){ //start with "/"
			idxFirstSlash =0;
		}
		var urlContext = myUrl.substring(idxFirstSlash+1, myUrl.indexOf("/", idxFirstSlash+1));
		if(context ==urlContext){
			retVal = true;
		}
	}
	return retVal;
};
//
// Update attachment or Image URL. When pasting we want the url to belong to the target document
//
concord.util.uri.getUploadedAttachmentURL= function(oldAttachUrl, serverUrl, attachmentId){
	var newURL = null;
	var imgId = null;
	if(serverUrl==null){
		serverUrl = concord.util.uri.getPasteAttachmentURL();
		//serverUrl = concord.util.uri.getGalleryAttachmentURL();
	}
	if(oldAttachUrl!=null && oldAttachUrl.length>0 && serverUrl!=null && serverUrl.length>0){
		var contextPath = window.contextPath;
		//the paste service expects src uri that includes "http://localhost"
		//at this point the oldAttachUrl should contains the correct uri (the check is made in the caller function)
		var obj = new Object();
		obj.imgId= attachmentId;
		obj.uri = oldAttachUrl;
		var sData = dojo.toJson(obj);
		if(window.g_concordInDebugMode)
			console.log('getuploadedAttachmentUrl uri.js : submitting paste image upload request to server...');
	
		var response, ioArgs;
		
		dojo.xhrPost({
			url: serverUrl,
			handleAs: "json",
			handle: function(r, io)
			{ response = r; 
			ioArgs = io;
			newURL = response.uri;
			imgId = response.imgId;
			if(window.g_concordInDebugMode)
					console.log('paste plugin.js: received response from server: imageId:'+imgId+' url:'+newUri);
			}, 						
			sync: true, 
			contentType: "text/plain",
			postData: sData
		});
	}
	return newURL;
};

concord.util.uri.prependStyleNode = function(node,styleText,domDoc){		
	var rulestext = '';	
	var style = domDoc.createElement("style");

	dojo.attr(style,'type','text/css');	

	if (node){
		dojo.attr(style,'styleName',dojo.attr(node,'styleName'));
		rulesText = (node.styleSheet) ? node.styleSheet.cssText : node.innerHTML;
	} else {
		rulesText = styleText;
	}

	var rules = domDoc.createTextNode(rulesText);

	// defect 7469 appending the style node to headTag early to prevent known ie issue with cssText
	// you must first append the element to the document before you can set cssText
	// http://msdn.microsoft.com/en-us/library/ie/ms533698(v=vs.85).aspx
	var headTag = domDoc.getElementsByTagName("head")[0];
	if (headTag){
		var firstStyleNode = domDoc.getElementsByTagName("style")[0];
		firstStyleNode && headTag.insertBefore(style, firstStyleNode); // prepend to first child
	}

	if (style.styleSheet)
		style.styleSheet.cssText = rules.nodeValue;
	else 
		style.appendChild(rules);			
};

concord.util.uri.createStyleNode = function(node,styleText,domDoc){		
	var rulestext = '';	
	var style = domDoc.createElement("style");
	
	dojo.attr(style,'type','text/css');	

	if (node){
		dojo.attr(style,'styleName',dojo.attr(node,'styleName'));
		rulesText = (node.styleSheet) ? node.styleSheet.cssText : node.innerHTML;
	} else {
		rulesText = styleText;
	}

	var rules = domDoc.createTextNode(rulesText);

	// defect 7469 appending the style node to headTag early to prevent known ie issue with cssText
	// you must first append the element to the document before you can set cssText
	// http://msdn.microsoft.com/en-us/library/ie/ms533698(v=vs.85).aspx
	var headTag = domDoc.getElementsByTagName("head")[0];
	if (headTag){
		headTag.appendChild(style);		
	}

	if (style.styleSheet) 
		style.styleSheet.cssText = rules.nodeValue;
	else 
		style.appendChild(rules);			
};

concord.util.uri.createScriptNode = function(domDoc){			
	var scr = domDoc.createElement("script");
	dojo.attr(scr,"type","text/javascript");
	dojo.attr(scr,"src",window.contextPath + window.staticRootPath+"/js/dojo/dojo.js");
	
	var headTag = domDoc.getElementsByTagName("head")[0];
	if (headTag){
		headTag.appendChild(scr);		
	}		
};

concord.util.uri.getDefaultPhotoUri = function() {
	return window.contextPath + window.staticRootPath + '/images/NoPhoto_Person_48.png';
};
concord.util.uri.addSidToStyleImage = function(str){
	var temStr=str;
	var sidRegxp=/url\(['"]?Pictures\/(.*?)\)/ig;
	var img=sidRegxp.exec(temStr);
	sidRegxp.lastIndex=0;
	while(img!=null)
	{
		var imgText=img[0];
		var newimgText=imgText.replace('Pictures',DOC_SCENE.version+'\/Pictures');
		if(DOC_SCENE.snapshotId!='null')
		{
			var sid_tag='?sid=';
			if(imgText.indexOf('?')!=-1)
				sid_tag='&sid=';
			newimgText=newimgText.trim();
			newimgText=newimgText.substring(0,newimgText.length-1)+ sid_tag +DOC_SCENE.snapshotId+newimgText.substring(newimgText.length-1);
		}
		newimgText = newimgText.replace(/\"|\'/g, "");
		temStr=temStr.replace(imgText,newimgText);
		sidRegxp.lastIndex=img.index+img[0].length;
		img=sidRegxp.exec(temStr);
	}
	return temStr;
};
concord.util.uri.addSidToContentImage = function(str){
	var temStr=str;
	var sidRegxp=/<img(.*?)src=['"]Pictures\/(.*?)>/ig;
	var img=sidRegxp.exec(temStr);
	sidRegxp.lastIndex=0;
	while(img!=null)
	{
		var imgNode=img[0];
		var imgAttrReg=/src=['"]Pictures\/(.*?)['"]/ig;
		var imgAttr=imgAttrReg.exec(imgNode);
		imgAttrReg.lastIndex=0;
		while(imgAttr!=null){
			var imgAttrStr=imgAttr[0];
			var sid_tag='?sid=';
			if(imgAttrStr.indexOf('?')!=-1)
				sid_tag='&sid=';
			imgAttrStr=imgAttrStr.substring(0,imgAttrStr.length-1)+ sid_tag +DOC_SCENE.snapshotId+imgAttrStr.substring(imgAttrStr.length-1)+' onerror="window.parent.pe.scene.monitorSnapshotStatus(this)"';
			imgAttrStr=imgAttrStr.replace('src="Pictures','src="'+DOC_SCENE.version+'\/Pictures');
			imgNode=imgNode.replace(imgAttr[0],imgAttrStr);
			imgAttrReg.lastIndex=imgAttr.index+imgAttr[0].length;
			imgAttr=imgAttrReg.exec(imgNode);
		}
		temStr=temStr.replace(img[0],imgNode);
		sidRegxp.lastIndex=img.index+img[0].length;
		img=sidRegxp.exec(temStr);
	}
	
	// for svg
	var sidRegxp=/<image(.*?)href=['"]Pictures\/(.*?)>/ig;
	var img=sidRegxp.exec(temStr);
	sidRegxp.lastIndex=0;
	while(img!=null)
	{
		var imgNode=img[0];
		var imgAttrReg=/href=['"]Pictures\/(.*?)['"]/ig;
		var imgAttr=imgAttrReg.exec(imgNode);
		imgAttrReg.lastIndex=0;
		while(imgAttr!=null){
			var imgAttrStr=imgAttr[0];
			var sid_tag='?sid=';
			if(imgAttrStr.indexOf('?')!=-1)
				sid_tag='&sid=';
			imgAttrStr=imgAttrStr.substring(0,imgAttrStr.length-1)+ sid_tag +DOC_SCENE.snapshotId+imgAttrStr.substring(imgAttrStr.length-1)+' onerror="window.parent.pe.scene.monitorSnapshotStatus(this)"';
			imgAttrStr=imgAttrStr.replace('href="Pictures','href="'+DOC_SCENE.version+'\/Pictures');
			imgNode=imgNode.replace(imgAttr[0],imgAttrStr);
			imgAttrReg.lastIndex=imgAttr.index+imgAttr[0].length;
			imgAttr=imgAttrReg.exec(imgNode);
		}
		temStr=temStr.replace(img[0],imgNode);
		sidRegxp.lastIndex=img.index+img[0].length;
		img=sidRegxp.exec(temStr);
	}
	
	return temStr;
};
concord.util.uri.handleHeader = function(str){
	var content=str;
	if(content.indexOf('href="style.css?')!=-1)
	{
		content=content.replace('href="style.css?','href="'+DOC_SCENE.version+'/style.css?sid='+DOC_SCENE.snapshotId+'&&');
	}else{
		content=content.replace('href="style.css','href="'+DOC_SCENE.version+'/style.css?sid='+DOC_SCENE.snapshotId);
	}
	//handle inner css
	var styleRegexp=/<style.*?>(.*?)<\/style>/ig;
	styleRegexp.lastIndex=0;
	var match=styleRegexp.exec(content);
	while(match!=null)
	{
		var styleText=match[0].replace(/<style.*?>/ig,'').replace(/<\/style>/ig,'');
		var newStyleText=concord.util.uri.addSidToStyleImage(styleText);
		content=content.replace(styleText,newStyleText);
		styleRegexp.lastIndex=match.index+match[0].length;
		match=styleRegexp.exec(content);
	}
	return content;
};
