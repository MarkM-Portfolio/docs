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
dojo.provide("html.main.App");
dojo.require("dojo.cookie");
dojo.require("viewer.util.uri");
dojo.require("viewer.util.BidiUtils");


dojo.declare("html.main.App", null, {

	TEXTDOC_SCENE: 			"html.scenes.TextDocScene",
	PRESDOC_SCENE:			"html.scenes.PresDocScene",
	
	authenticatedUser:null,
	scene:null,
	constructor: function constructor() {},
	//homePage: g_files, // the home page of file repository
	
	init: function(document) {
	
		this.document = this.d = document;
		this.scene = null;
		return true;
	},
	
	start: function(url) {
		// check if this document has already been opened by this browser client
		if (this.checkExists())
		{
			window.name = "";
			viewer.scenes.ErrorScene.renderError(3001);
			return;
		}
		
//		// check if there are so many active document opened actively
//		if (this.checkOpenedLimit())
//		{
//			html.scenes.ErrorScene.renderError(3002);
//			return;
//		}
		
		this.registerOpenDocs();
		
		// #46049 focus myself back
		window.focus();
		
//		this.authenticatedUser = this.loadAuthentication();
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
			
			return true;
		}
		return false;
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
			opened[window.name] = false;
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
		  
		var id = sceneInfo.id;
		console.log("app.js.load","scene id is:" + id);
		if (!id)
			throw "No scene identifier from decodeState()";
		var dj = dojo;
		if(dj.isIE == 7) {
			return;
		}
		else {
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
		}
	},
	
	decodeState: function(uri) {
		DOC_SCENE.parameters = uri.queryParameters;
		if (DOC_SCENE.type == "text") {
			DOC_SCENE.id = this.TEXTDOC_SCENE;
		}
		else if (DOC_SCENE.type == "pres") {			
			DOC_SCENE.id = this.PRESDOC_SCENE;
		}
		else {
			throw "unsupported";
		}
		
		return DOC_SCENE;
	},
	
	resolveUri: function(url) {
      var uri;
      if (typeof url == "string") {
         uri = viewer.util.uri.parseUri(url);
      }
      else if (url instanceof dojo._Url)
         uri = url;
      else
         throw "resolveUri requires a string or dojo._Url";
      return uri;		
	},
	
	leave: function() {
		if (this.scene.session != undefined)
		{
			this.scene.session.leave();
		}
	}
});

html.main.App.onLoad = function(window, app) {
	
	var dj = window['dojo'];
	if (BidiUtils.isGuiRtl()){
		dojo.query("body").addClass("dijitRtl");
		if (DOC_SCENE.type == 'pres')
			document.documentElement.dir = 'rtl';
	}	
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
}

html.main.App.onUnload = function(window) {
	try {
		var app = window.pe;
		app.unregisterOpenDocs();
	} catch (e) {
		console.log("unable to unload application");
	}
}

html.main.App.onWindowUnload = function(window) {
	// clean for memory leak
	window.divQueue = null;
	window._docArray = null;
	window.html = null;
	window.websheet = null;
	window.RDOMeditor = null;
	window.pe = null;
}

html.main.App.executeRegex = function(regex, path, results) {
   results.splice(0, results.length);
   var r = regex.exec(path);
   if (r) {
      for (var i=0; i<r.length; i++)
         results.push(r[i]);
      return true;
   }
   return false;
}
