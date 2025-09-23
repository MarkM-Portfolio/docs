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

dojo.provide("concord.main.App");
dojo.require("concord.beans.User");
dojo.require("concord.util.uri");
dojo.require("concord.main.Settings");
dojo.require("concord.scenes.ErrorScene");
dojo.require("concord.util.dialogs");
dojo.require("concord.util.browser");
dojo.require("dojox.encoding.digests.MD5");
dojo.requireLocalization("concord.widgets","PublishDialog");

dojo.declare("concord.main.App", null, {

	TEXTDOC_SCENE: 			"concord.scenes.TextDocScene",
	TEXTDOC_REV_SCENE:		"concord.scenes.TextDocRevScene",
	TEXTDOC_MOBILE_SCENE:	"concord.scenes.TextDocScene.mobile",	
	SHEETDOC_SCENE: 		"concord.scenes.SheetDocScene",
	SHEETDOC_REV_SCENE:		"concord.scenes.SheetDocRevScene",
	PRESDOC_SCENE:			"concord.scenes.PresDocScene",
	PRESDOC_REV_SCENE:		"concord.scenes.PresDocRevScene",
	PRESDOC_MOBILE_SCENE:	"concord.scenes.PresDocScene.mobile",
	MOBILE_SURFIX:			"Mobile",
	
	authenticatedUser:null,
	scene:null,
	lotusEditor:null,
	settings: null,
	//cached width of browser
	g_browserWidth: 0,
	constructor: function constructor() {},
	//homePage: g_files, // the home page of file repository
	
	init: function(document) {
	
		this.document = this.d = document;
		this.scene = null;
		this.settings = new concord.main.Settings();
		this.overrideXhr();
		return true;
	},
	
	overrideXhr: function() {
		/*
		 * in HTML viewer, add document version and document snapshot ID to requests, if find
		 */
		function addViewToken(args) {
			if (DOC_SCENE) {
				var snapId = DOC_SCENE.snapshotId;
				var version = DOC_SCENE.version;
				if (args.content == null) {
					args.content = {};
				}
				
				if (snapId && snapId != "null") {
					args.content["sid"] = snapId;
				}
				
				if (version) {
					args.content["version"] = version;
				}
			}
		}
		
		function addMobileRequiredAppHeaders(args) {
			if ( concord.util.browser.isMobile() ){
				var mobileHeaders = concord.util.mobileUtil.requiredAppHeaders();

				if(typeof args.headers == "undefined") {
					args.headers = {};
				}
				dojo.mixin(args.headers, mobileHeaders);
			}
		}

		/*
		 * This authentication process is a standard J2EE form authentication, which is compatible with any J2EE servers.
		 * 
		 * For LotusLive or any other custom authentication scheme, below function MAY NOT work as well as the "login.jsp".
		 */
		function authenticate(username, password) {
			var result = false;
			var callback =  function(response, ioargs)
				{
					if (response && response.dojoType == "timeout")
					{
						result = false;
						return;
					}

					var status = ioargs.xhr.status;
					if (status == 200)
					{
						result = true;
					}
					else
					{
						result = false;
					}
				}
			dojo.xhr("POST", {
				url: loginUri,
				sync: true,
				contentType: "application/x-www-form-urlencoded",
				postData: "j_username=" + username + "&j_password=" + password,
				handle: callback
			}, true);
			return result;
		}

		function retry(method, args, load, error, handle) {
			concord.main.App.addCsrfToken(args);
			addMobileRequiredAppHeaders(args);
			args.load = load;
			args.error = error;
			args.handle = handle;
			return dojo.xhr(method, args);
		}

		function prompt(method, args, load, error, handle) {
			var auth_cllbk = dojo.hitch(this, authenticate);
			var retry_cllbk = dojo.hitch(this, retry, method, args, load, error, handle);
			concord.util.dialogs.showLoginDlg(3, auth_cllbk, retry_cllbk);
		}

		function prompt_offline() {
			//in view mode, has no session
			if(pe.scene && pe.scene.isHTMLViewMode())
				pe.scene.offline();
			else
				pe.scene.session.makeOffline();
		}

		function _handle(args, method, load, error, handle, response, ioargs) {
			if (response && response.dojoType != "timeout" && ioargs.xhr.status == 401)
			{
				if (login_retry == "true")
				{
					if (args.sync)
					{
						setTimeout(dojo.hitch(this, prompt, method, args, load, error, handle), 0);
					}
					else
					{
						prompt(method, args, load, error, handle);
						return;
					}
				}
				else
				{
					if (args.sync)
					{
						setTimeout(dojo.hitch(this, prompt_offline), 0);
					}
					else
					{
						prompt_offline();
						return;
					}
				}
			}
			
			if (pe.scene && pe.scene.isHTMLViewMode()) {
				// viewer specific code
				if (pe.scene._checkSnapshotStatus) {
					pe.scene._checkSnapshotStatus(response, ioargs);
				} else {
					if (ioargs.xhr.status == 507) {
						// snapshot expired, need to refresh browser
						setTimeout(window.location.reload(), 1000);
						// stop the handler
						return;
					}
				}
			}

			if (response instanceof Error)
			{
				if (error)
				{
					error(response, ioargs);
				}
			}
			else
			{
				if (load)
				{
					load(response, ioargs);
				}
			}

			if (handle)
			{
				handle(response, ioargs);
			}
		}

		dojo.xhrGet = function(args){
			concord.main.App.addCsrfToken(args);
			addMobileRequiredAppHeaders(args);
			if (pe.scene && pe.scene.isHTMLViewMode()) {
				addViewToken(args);
			}
			args.handle = dojo.hitch(this, _handle, args, "GET", args.load, args.error, args.handle);
			args.load = args.error = null;
			return dojo.xhr("GET", args);
		}
		
		dojo.rawXhrPost = dojo.xhrPost = function(args){
			concord.main.App.addCsrfToken(args);
			addMobileRequiredAppHeaders(args);
			args.handle = dojo.hitch(this, _handle, args, "POST", args.load, args.error, args.handle);
			args.load = args.error = null;
			return dojo.xhr("POST", args, true);
		}
		
		dojo.rawXhrPut = dojo.xhrPut = function(args){
			concord.main.App.addCsrfToken(args);
			addMobileRequiredAppHeaders(args);
			args.handle = dojo.hitch(this, _handle, args, "PUT", args.load, args.error, args.handle);
			args.load = args.error = null;
			return dojo.xhr("PUT", args, true);
		}
	
		dojo.xhrDelete = function(args){
			concord.main.App.addCsrfToken(args);
			addMobileRequiredAppHeaders(args);
			args.handle = dojo.hitch(this, _handle, args, "DELETE", args.load, args.error, args.handle);
			args.load = args.error = null;
			return dojo.xhr("DELETE", args);
		}
	},

	start: function(url) {
		// check if this document has already been opened by this browser client
		if (this.checkExists())
		{
			window.name = "";
			concord.scenes.ErrorScene.renderError(3001);
			return;
		}
		
		// check if there are so many active document opened actively
		if (this.checkOpenedLimit())
		{
			concord.scenes.ErrorScene.renderError(3002);
			return;
		}
		
		if (!concord.util.browser.isMobileBrowser())
			this.registerOpenDocs();
		
		// #46049 focus myself back
		if(DOC_SCENE.focusWindow){
			window.focus();
		}
		
		this.authenticatedUser = this.loadAuthentication();
		var uri = this.resolveUri(url);
		this.load(uri);
	},

	getWindowName: function() {
		var winName = DOC_SCENE.uri.replace(/[-\s.@]/g, '_');
		return winName;
	},
	
	checkExists: function() {
		if (DOC_SCENE.mode == "edit")
		{
			var opened = this.getOpenedDocs();
			var winName = this.getWindowName();
			if (!opened[winName])
			{
				return false;
			}
			
			// really exists?
			// we are using cookies to find out what documents have been opened
			// however, if browser crashes then reopen, the cookie is still there.
			// so we need to try to open the document to detect if the window is really there
			// limited by chrome security rule, chrome doesn't support this check.
			if(!dojo.isChrome){
				var win = window.open("", winName);
				if (!win)
					return false;
				
				if (win.location.href === "about:blank" || win.location.href === "_blank")
				{
					// open another window, which means doesn't exists
					// close the empty one
					win.close();
					// clear the cookie
					this.unregisterOpenDocs();
					return false;
				}
				else if (win === window.self)
				{	// pointing to myself
					// do nothing
					return false;
				}
				else {
					win.focus();
				}
			}			
			return true;
		}
		return false;
	},

	checkOpenedLimit: function() {
		if (DOC_SCENE.mode == "edit")
		{
			var opened = this.getOpenedDocs();
			var count = 0;
			for (var k in opened) {
				var b = opened[k];
				if (!!b)
				{
					// try to locate it
					var win = window.open("", k);
					if (!win)
						return false;
					
					if (win.location.href === "about:blank" || win.location.href === "_blank")
					{
						// actually not exist
						win.close();
						this.unregisterOpenDocs(k);
					}
					else {
						count++;
					}
				}
			}
			
//			console.log("currently active:" + count);
			if (count >= 5)
			{
				return true;
			}
			
			return false;
		}
	},
	
	getOpenedDocs: function() {
		var s = dojo.cookie("IBMDocsOpenedDocs");
		var opened = {};
		if (s != null && s.length != 0)
		{
			opened = dojo.fromJson(s);
		}
		return opened;
	},
	
	registerOpenDocs: function() {
		if (DOC_SCENE.mode != "edit")
			return;
		
		// update window name
		var winName = this.getWindowName();
		window.name = winName;
		
		// register in cookie
		var cookieProps = {"path":contextPath, "secure": true};
		var opened = this.getOpenedDocs();
		opened[winName] = true;
		var s = dojo.toJson(opened);
		dojo.cookie("IBMDocsOpenedDocs", s, cookieProps);
	},
	
	unregisterOpenDocs: function(name) {
		if (DOC_SCENE.mode != "edit")
			return;
		
		var cookieProps = {"path":contextPath, "secure": true};
		var opened = this.getOpenedDocs();
		if (!name)
		{
			var winName = this.getWindowName();
			opened[winName] = false;
		}
		else {
			opened[name] = false;
		}
		var s = dojo.toJson(opened);
		dojo.cookie("IBMDocsOpenedDocs", s, cookieProps);
		
		if (!name)
		{
			window.name = "";
		}
	},
	
	load: function(uri) {
		var sceneInfo = this.decodeState(uri);
		
		// post appOnload message
//		if(window.self != window.parent) {
//			var instance = sceneInfo.parameters["instance"];
//			var message = {
//					eventType: "appOnload",
//					source: "com.ibm.docs",
//			};
//			if (instance)
//				message.instance = instance;
//			//access window.parent.location.origin might be blocked because the different origin
//			window.parent.postMessage(JSON.stringify(message), window.parent.location.origin);
//		}
		// post end
		
		if( this.settings	)
		  this.settings.setDocType(sceneInfo.type);
		  
		var id = sceneInfo.id;
//		console.log("app.js.load","scene id is:" + id);
		if (!id)
			throw "No scene identifier from decodeState()";
		var dj = dojo;
		dj.require(id);
		var constructor = dojo.getObject(id);
		if (!id)
			throw "No object defined for '"+id+"'";

		var scene = new constructor(this, sceneInfo);
		var oldScene = this.scene;
		if (oldScene)
			oldScene.end(scene);
		this.scene = scene;
		scene.begin(oldScene);
	},
	
	decodeState: function(uri) {
		DOC_SCENE.parameters = uri.queryParameters;		
		if(DOC_SCENE.parameters && DOC_SCENE.parameters['rev']) {
			DOC_SCENE.revision = DOC_SCENE.parameters['rev'];
		}
			
		if (DOC_SCENE.type == "text") {					
			if(DOC_SCENE.revision && DOC_SCENE.revision.length > 0) {
				DOC_SCENE.id = this.TEXTDOC_REV_SCENE;
			}
			else {
				DOC_SCENE.id = this.TEXTDOC_SCENE;
			}			
		}
		else if (DOC_SCENE.type == "sheet") {			
			if(DOC_SCENE.revision && DOC_SCENE.revision.length > 0) {
				DOC_SCENE.id = this.SHEETDOC_REV_SCENE;
			}
			else {
				DOC_SCENE.id = this.SHEETDOC_SCENE;
			}			
		}
		else if (DOC_SCENE.type == "pres") {
			if(DOC_SCENE.revision && DOC_SCENE.revision.length > 0) {
				DOC_SCENE.id = this.PRESDOC_REV_SCENE;
			}		
			else {
				DOC_SCENE.id = this.PRESDOC_SCENE;
			}			
		}
		else {
			throw "unsupported";
		}
		if(concord.util.browser.isMobile())
			DOC_SCENE.id += this.MOBILE_SURFIX;
		return DOC_SCENE;
	},
	
	resolveUri: function(url) {
      var uri;
      if (typeof url == "string") {
         uri = concord.util.uri.parseUri(url);
      }
      else if (url instanceof dojo._Url)
         uri = url;
      else
         throw "resolveUri requires a string or dojo._Url";
      return uri;		
	},
	
	loadAuthentication: function() {
		if(!g_authUser)
			console.warn("Author User is undefined.");
		var user = new concord.beans.User(g_authUser);
		user.setEntitlements(window.g_EntitlementsStr);
		user.setGatekeeperFeatures(window.g_GatekeeperFeatures);
		return user;
	},
	
	leave: function() {
		if (this.scene.session != undefined)
		{
			this.scene.session.leave();
		}
	},

	isPublishNeeded: function() {
		var response, ioArgs;
		var callback = function(r, io) {response = r; ioArgs = io;}
		dojo.xhrGet({
			url: concord.util.uri.getDocUri() + '?method=getIsPublished',
			handleAs: "json",
			handle: callback,
			sync: true,
			preventCache:true,
			noStatus: true
		});
		if(response!=null && ioArgs!=null){
			if (ioArgs.xhr.status == 200) {
	    		//console.log ("access API success");
	    		return !response.isPublished;
	    	} else {
	    		console.log (ioArgs.xhr.status);
	    		return null;
	    	}
		}
		return null;
	}
});

concord.main.App.addCsrfToken = function(args) {
	if (pe.scene && pe.scene.isHTMLViewMode()) {
		// html viewer doesn't need csrf token
		return;
	} else {							 			
		var csrfHeader = concord.main.App.getCsrfObject();
		
		if(typeof args.headers == "undefined") {
			args.headers = {};
		}
		
		dojo.mixin(args.headers, csrfHeader);
						
		if(DOC_SCENE && DOC_SCENE.repository)
		{
			var repoHeader = {"X-DOCS-REPOID": DOC_SCENE.repository};
			dojo.mixin(args.headers, repoHeader);
		}		
	}
};

concord.main.App.getCsrfObject = function(){
	var ct = new Date().getTime().toString();
	var userId = window.pe.authenticatedUser.getId();
	var seed = userId + "@@" + ct.substring(4,ct.length-1) + "##";
	var token = dojox.encoding.digests.MD5(seed, dojox.encoding.digests.outputTypes.Hex);				
	var csrfHeader = {"X-Csrf-Token": token, "X-Timestamp": ct};
	return csrfHeader;
};

concord.main.App.onLoad = function(window, app) {
	
	var dj = window['dojo'];
	
	try {
		dj.require(app);
		var appConstructor = dj.getObject(app);
		
		var app = new appConstructor();
		if (!window['pe'])
			window.pe = app;
		
		if (!app.init(document))
			return;
		setTimeout(function() {app.start(window.location.href);},0);
	} catch (e) {
		console.log("unable to load application");
		throw e;
	}
};

concord.main.App.onUnload = function(window) {
	try {
		var app = window.pe;
		//check publish status.(drop this feature due to browser limited)
		//if(app.isPublishNeeded()){
			//var nls = dojo.i18n.getLocalization("concord.widgets","PublishDialog");
			//var e = concord.util.events.getEvent();
			//for ie and firefox
			//e.returnValue = nls.publishReminderMsg;
			//for safari and chrome
			//return nls.publishReminderMsg; 
		//}
		
		app.unregisterOpenDocs();
		if(!app.scene.isViewMode(true)){
			app.scene.beforeLeave();
			app.scene.leave();
		}
		//notify Files update status after docs tab closed
		if (window.top.opener) {
			var odojo = window.top.opener.dojo;
			if (odojo) {
				if(concord.util.uri.isECMDocument())
				{
					var repoName = window.DOC_SCENE.uri.substr(window.DOC_SCENE.uri.indexOf("@")+1);
					odojo.publish("concord/ccm/action/closed", [ {fileID : window.DOC_SCENE.docId, repositoryName : repoName} ]);
				}
				else
				{
					var apEnabled = app.scene.autoPublishSet();
					if(pe.scene.encryptedDocument ) 
					{
					  apEnabled = false;
					}
					odojo.publish("lconn/share/action/completed", [ {fileChange : false, autoPublish : apEnabled, fileID : window.DOC_SCENE.docId}, null ]);
				}				
			}	
		}
	} catch (e) {
		console.log("unable to unload application");
	}
};

concord.main.App.onWindowUnload = function(window) {
	if (concord.util.browser.isMobile()){
		concord.main.App.onUnload(window);
	}
	// clean for memory leak
	window.divQueue = null;
	window._docArray = null;
	window.concord = null;
	window.websheet = null;
	window.RDOMeditor = null;
	window.pe = null;
};

concord.main.App.executeRegex = function(regex, path, results) {
   results.splice(0, results.length);
   var r = regex.exec(path);
   if (r) {
      for (var i=0; i<r.length; i++)
         results.push(r[i]);
      return true;
   }
   return false;
};
concord.main.App.appendSecureToken=function(url){
	return url;
	
	var uri;
	if (typeof url == "string"){
		uri = new dojo._Url(url);
	}else{
		return null;
	}
	var query= uri.query;
	if(query==null){
		url=url+"?secureToken="+secureToken;
	}else{
		url=url+"&secureToken="+secureToken;
	}
	return url;
};

concord.main.App.getHelpLocale = function(){
    var helpLocale = g_locale;
    var locale_array = helpLocale.split('-');
    if(helpLocale == "pt-br" || helpLocale == "zh-cn" || helpLocale =="zh-tw"){
        helpLocale =locale_array[0] +"_"+locale_array[1].toUpperCase();
    }
    else{
        helpLocale = locale_array[0];
    }
    return helpLocale;
};

//no help menu in html viewer
if(window.DOC_SCENE && DOC_SCENE.mode && DOC_SCENE.mode != "html"){
	if(concord.util.uri.isExternal())
	{
		concord.main.App.RVERT_TOLAST_HELP_URL = gText_help_URL;
		concord.main.App.UPLOAD_NEWVERSION_HELP_URL = gText_help_URL;
		concord.main.App.TEXT_HELP_URL = gText_help_URL;
		concord.main.App.SHEET_HELP_URL = gSheet_help_URL;
		concord.main.App.PRES_HELP_URL = gPres_help_URL;	
		
	}
	else if(concord.util.uri.isICNDocument())
	{
		var helpRoot = gECM_help_root; //"http://win-ik3jn373u5h.cn.ibm.com:9090/kc/SSFHJY_1.0.7/";
		concord.main.App.RVERT_TOLAST_HELP_URL = helpRoot + "/com.ibm.usingdocs.doc/text/overview/reverting_to_last_version.dita";
		concord.main.App.UPLOAD_NEWVERSION_HELP_URL = helpRoot + "/com.ibm.usingdocs.doc/text/overview/upload_new_version.dita";
		concord.main.App.TEXT_HELP_URL = helpRoot  + "/com.ibm.usingdocs.doc/text/document/documents_frame.dita";
		concord.main.App.SHEET_HELP_URL = helpRoot + "/com.ibm.usingdocs.doc/text/spreadsheet/spreadsheets_frame.dita";
		concord.main.App.PRES_HELP_URL = helpRoot + "/com.ibm.usingdocs.doc/text/presentation/presentations_frame.dita";	
	}
	else
	{	
		concord.main.App.RVERT_TOLAST_HELP_URL = window.location.protocol+'//'+window.location.host + "/help/index.jsp?topic=/com.ibm.help.ibmdocs.doc/text/overview/reverting_to_last_version.html&lang=" + concord.main.App.getHelpLocale();
		concord.main.App.UPLOAD_NEWVERSION_HELP_URL = window.location.protocol+'//'+window.location.host + "/help/index.jsp?topic=/com.ibm.help.ibmdocs.doc/text/overview/upload_new_version.html&lang=" + concord.main.App.getHelpLocale();
		var regEx = new RegExp("^((https|http|)?:\/\/)[^\s]+");
		if(regEx.test(gText_help_URL)){
			concord.main.App.TEXT_HELP_URL = gText_help_URL ;
		}
		else{
			var symbol = gText_help_URL.indexOf('?') == -1 ? '?':'&' ;		
			concord.main.App.TEXT_HELP_URL = window.location.protocol+'//'+window.location.host  + gText_help_URL + symbol + 'lang=' + concord.main.App.getHelpLocale();
		}
		if(regEx.test(gSheet_help_URL)){
			concord.main.App.SHEET_HELP_URL = gSheet_help_URL ;
		}
		else{
			var symbol = gSheet_help_URL.indexOf('?') == -1 ? '?':'&' ;
			concord.main.App.SHEET_HELP_URL = window.location.protocol+'//'+window.location.host + gSheet_help_URL + symbol + 'lang=' + concord.main.App.getHelpLocale();
		}
		if(regEx.test(gPres_help_URL)){
			concord.main.App.PRES_HELP_URL = gPres_help_URL ;
		}
		else{
			var symbol = gPres_help_URL.indexOf('?') == -1 ? '?':'&' ;	
			concord.main.App.PRES_HELP_URL = window.location.protocol+'//'+window.location.host + gPres_help_URL + symbol + 'lang=' + concord.main.App.getHelpLocale();	
		}
	}
}