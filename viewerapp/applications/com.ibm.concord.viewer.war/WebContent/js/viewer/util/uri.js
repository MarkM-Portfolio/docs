/* ***************************************************************** */
/*                                                                   */
/* Licensed Materials - Property of IBM.                             */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* Copyright IBM Corporation 2012. All Rights Reserved.              */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("viewer.util.uri");

viewer.util.uri.parseUri = function(uri) {
   if (!uri)
      return null;
   if (typeof uri != "string" && console.trace) {
      console.warn("parseUri called with a non string argument");
      console.trace();
   }
   uri = new dojo._Url(uri);
   uri.queryParameters = viewer.util.uri.getRequestParameters(uri);
   return uri;
};

viewer.util.uri.splitQuery = function(query) {
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

viewer.util.uri.getRequestParameters = function(uri) {
   var params = {};
   if (!uri)
      uri = window.location.href;
   if (typeof uri == "string")
      uri = new dojo._Url(uri);
   return viewer.util.uri.splitQuery(uri.query);
};

/*
 * url for browser to open a document's page
 */
viewer.util.uri.getDocPageUri = function(d) {
	var uri = viewer.util.uri.getDocPageRoot(d) + "/content";
	return uri;
};

viewer.util.uri.getDocPageRoot = function(d) {
	var uri;
	if (!d)
	{
		uri = contextPath + "/app/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri;
		if (DOC_SCENE.version)
			uri = uri + "/" + DOC_SCENE.version;
	}
	else {
		uri = contextPath + "/app/" + d.getRepository() + "/" + d.getUri();
		if (d.getVersion())
			uri = uri + "/" + d.getVersion();
	}
	return uri;
};

viewer.util.uri.getDocPageUriById = function(id) {
	var uri = contextPath + "/app/" + id + "/content";
	return uri;
};


viewer.util.uri.getDocServiceRoot = function() {
	return (contextPath + "/api/docsvr");
};

viewer.util.uri.getDocUri = function(d) {
	if (!d)
	{
		d = window['pe'].scene.bean;
	}

	if (!d)
	{
		return viewer.util.uri.getDocServiceRoot() + "/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri;
	}
	else
	{
		return viewer.util.uri.getDocServiceRoot() + "/" + d.getRepository() + "/" + d.getUri();
	}
};

viewer.util.uri.getThumbnailRootUri = function(doc){
	return viewer.util.uri.getDocPageRoot(doc) + "/thumbnails";
};

viewer.util.uri.getHtmlRoot = function(d) {
	var uri;
	if (!d)
		uri = contextPath + "/app/" + DOC_SCENE.repository + "/" + DOC_SCENE.uri;
	else
		uri = contextPath + "/app/" + d.getRepository() + "/" + d.getUri();
	return uri;
};

viewer.util.uri.getHTMLRootUri=function(doc)
{
	return viewer.util.uri.getDocPageRoot(doc) + "/pictures";
};

viewer.util.uri.injectCSS = function(domDoc,cssFileName,loadFromAttachment){
		if ((domDoc) && (cssFileName)){  
			var href = null;
			var isExist = false;
			if(loadFromAttachment == false){
				href = cssFileName;
			}else{
				href=viewer.util.uri.getEditAttUri(cssFileName);
			}
			//check if the link is already available
			var links = dojo.query("link", domDoc);
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
					}
					
				}
			}
			if(!isExist){
				//if the link is not available, create it
				var link = domDoc.createElement("link");
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
					throw new Error("viewer.util.uri.injectCSS: Error injecting CSS "+cssFileName+" in document.");
					return;
				}
			}
			
		} else {
			throw new Error("viewer.util.uri.injectCSS: Error injecting CSS "+cssFileName+" in document.");
			return;
		}
};
viewer.util.uri.removeCSS = function(domDoc,cssFileName){
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

viewer.util.uri.moveCSS2End = function(domDoc,cssFileName){
	if ((domDoc) && (cssFileName)){ 
		var links = dojo.query("link", domDoc);
		for(var i=links.length-1; i>=0; i--){
			if(links[i].href.indexOf( cssFileName)>=0){
				//dojo.destroy(links[i]);
				var headTag = domDoc.getElementsByTagName("head")[0];
				if (headTag){
					headTag.appendChild(links[i]);
				}
				break;
			}
		}
	}
};
//
// Get CSS info. href needs to be a a css path
//
viewer.util.uri.injectCssStyle = function(domDoc,cssFileName,loadFromAttachment){
	if ((domDoc) && (cssFileName)){  
		var href = null;
		var isExist = false;
		if(loadFromAttachment == false){
			href = cssFileName;
		}else{
			href=viewer.util.uri.getEditAttUri(cssFileName);
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
						console.log('viewer.util.uri.injectCssStyle -> data received');
						responseData = viewer.util.uri.addSidToStyleImage(data);
				},
				
				sync: true,
				preventCache: true,
				error: function(error)
				{
						console.log('viewer.util.uri.injectCssStyle -> Error received while getting css');
						console.log(error);
						if(error.status==507)
						{
							setTimeout(window.location.reload(), 2000);
						}
				}
			};		
		try{
			console.log('viewer.util.uri.injectCssStyle -> Sending request to get css');	
			var xhrCall = dojo.xhrGet(xhrArgs);		
			if(responseData){
				var style = domDoc.createElement("style");
				dojo.attr(style,'styleName',cssFileName);
				dojo.attr(style,'type','text/css');		
				var rules = domDoc.createTextNode(responseData);
					
				if (style.styleSheet) 
					style.styleSheet.cssText = rules.nodeValue;
		        else 
		        	style.appendChild(rules);				
		
				var headTag = domDoc.getElementsByTagName("head")[0];
				if (headTag){
					headTag.appendChild(style);
					return style;
				}
			}
		}
		catch(e)
		{
				console.log('viewer.util.uri.injectCssStyle -> Error while getting CSS');
				console.log(e);
		}
	}
};
viewer.util.uri.getContext= function(myUrl){
	var context = "";
	if(myUrl!=null && myUrl.length>0){
		var idxFirstSlash = myUrl.indexOf("/", 8); //first slash after "http://" or "https://"
		context = myUrl.substring(idxFirstSlash+1, myUrl.indexOf("/", idxFirstSlash+1));
	}
	return context;
};

viewer.util.uri.hasContext= function(context, myUrl){
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
viewer.util.uri.getUploadedAttachmentURL= function(oldAttachUrl, serverUrl, attachmentId){
	var newURL = null;
	var imgId = null;
	if(serverUrl==null){
		serverUrl = viewer.util.uri.getPasteAttachmentURL();
		//serverUrl = viewer.util.uri.getGalleryAttachmentURL();
	}
	if(oldAttachUrl!=null && oldAttachUrl.length>0 && serverUrl!=null && serverUrl.length>0){
		var contextPath = window.contextPath;
		//get the url starting from the contextPath
		//the paste service fails if we give src uri that include "http://localhost", somehow it expects only starts with "/viewer/"
		//at this point the oldAttachUrl should contains the context (the check is made in the caller function)
		var contextIdx = oldAttachUrl.indexOf(contextPath+"/");
		oldAttachUrl = oldAttachUrl.substring(contextIdx);
		var obj = new Object();
		obj.imgId= attachmentId;
		obj.uri = oldAttachUrl;
		var sData = dojo.toJson(obj);
		if(window.g_viewerInDebugMode)
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
			if(window.g_viewerInDebugMode)
					console.log('paste plugin.js: received response from server: imageId:'+imgId+' url:'+newUri);
			}, 						
			sync: true, 
			contentType: "text/plain",
			postData: sData
		});
	}
	return newURL;
};

viewer.util.uri.createStyleNode = function(node,styleText,domDoc){		
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
		
	if (style.styleSheet) 
		style.styleSheet.cssText = rules.nodeValue;
	else 
		style.appendChild(rules);				
	
	var headTag = domDoc.getElementsByTagName("head")[0];
	if (headTag){
		headTag.appendChild(style);		
	}			
};
viewer.util.uri.addSidToStyleImage = function(str){
	var temStr=str;
	var sidRegxp=/url\(['"]Pictures\/(.*?)['"]/ig;
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
		temStr=temStr.replace(imgText,newimgText);
		sidRegxp.lastIndex=img.index+img[0].length;
		img=sidRegxp.exec(temStr);
	}
	return temStr;
};
viewer.util.uri.addSidToContentImage = function(str){
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
			//fix some image url contain parameters.
			var imgAttrStr=imgAttr[0];
			var sid_tag='?sid=';
			if(imgAttrStr.indexOf('?')!=-1)
				sid_tag='&sid=';
			imgAttrStr=imgAttrStr.substring(0,imgAttrStr.length-1)+ sid_tag +DOC_SCENE.snapshotId+imgAttrStr.substring(imgAttrStr.length-1)+' onerror="pe.scene.monitorSnapshotStatus(this)"';
			imgAttrStr=imgAttrStr.replace('src="Pictures','src="'+DOC_SCENE.version+'\/Pictures');
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
viewer.util.uri.injectStyle = function(domDoc,styleText){		
	var style = domDoc.createElement("style");
	dojo.attr(style,'type','text/css');	
	var rules = domDoc.createTextNode(styleText);
		
	if (style.styleSheet) 
		style.styleSheet.cssText = rules.nodeValue;
	else 
		style.appendChild(rules);				
	
	var headTag = domDoc.getElementsByTagName("head")[0];
	if (headTag){
		headTag.appendChild(style);		
	}			
};
viewer.util.uri.getHTMLDocPageRoot = function() {
	var uri = contextPath + "/app/" + DOC_SCENE.repoUri + "/" + DOC_SCENE.docUri;
	if (DOC_SCENE.version)
		uri = uri + "/" + DOC_SCENE.version + "/";
	return uri;
};
viewer.util.uri.addSnapshotID = function(node) {
	var imgs = dojo.query(".draw_image", node);
	  for (var i=0; i<imgs.length; i++){
		  imgs[i].src = imgs[i].src + '?sid=' + DOC_SCENE.snapshotId;
	  }
};