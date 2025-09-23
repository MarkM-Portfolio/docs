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
define([
        "dojo/_base/lang",
        "dojox/encoding/digests/MD5",
        'writer/constants',
        'writer/htmlEditor',
		'concord/scenes/TextDocSceneRteOnline'], 
		function(lang, MD5, constants, htmlEditor, TextDocSceneRteOnline) {

    	var editor = lang.mixin(lang.getObject("writer.htmlEditor", true), {

		    init: function(param) {
		    	this.setEnv(param);
				this.app = window.pe = {};
				this.app.authenticatedUser = this.loadAuthentication();
				this.overrideXhr();
				this.scene = window.pe.scene = new TextDocSceneRteOnline(this, window.DOC_SCENE);
				if (this.scene.isNote()) {
					var me = this;
					me._noteSub = dojo.subscribe(constants.EVENT.LOAD_READY, function() {
						dojo.connect(window, "onresize", me, "_resizeNote");
						dojo.unsubscribe(me._noteSub);
					});
			    }
		    },

		    render: function() {
				this.scene.begin();
		    },

			exit: function() {
				this.scene.leave();
			},
			
			loadAuthentication: function() {
				if(!g_authUser)
					console.warn("Author User is undefined.");
				var user = new concord.beans.User(g_authUser);
				user.setEntitlements(window.g_EntitlementsStr);
				user.setGatekeeperFeatures(window.g_GatekeeperFeatures);
				
				return user;
			},
			
			// Copy this from App.js to avoid loading the whole file
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
					addCsrfToken(args);
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
				
				 function addCsrfToken(args) {
					if (pe.scene && pe.scene.isHTMLViewMode()) {
						// html viewer doesn't need csrf token
						return;
					} else {							
						var ct = new Date().getTime().toString();
						var userId = window.pe.authenticatedUser.getId();
						var seed = userId + "@@" + ct.substring(4,ct.length-1) + "##";
						var token = MD5(seed, dojox.encoding.digests.outputTypes.Hex);				
						var csrfHeader = {"X-Csrf-Token": token, "X-Timestamp": ct};
						
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

				dojo.xhrGet = function(args){
					addCsrfToken(args);
					addMobileRequiredAppHeaders(args);
					if (pe.scene && pe.scene.isHTMLViewMode()) {
						addViewToken(args);
					}
					args.handle = dojo.hitch(this, _handle, args, "GET", args.load, args.error, args.handle);
					args.load = args.error = null;
					return dojo.xhr("GET", args);
				};
				
				dojo.rawXhrPost = dojo.xhrPost = function(args){
					addCsrfToken(args);
					addMobileRequiredAppHeaders(args);
					args.handle = dojo.hitch(this, _handle, args, "POST", args.load, args.error, args.handle);
					args.load = args.error = null;
					return dojo.xhr("POST", args, true);
				};
				
				dojo.rawXhrPut = dojo.xhrPut = function(args){
					addCsrfToken(args);
					addMobileRequiredAppHeaders(args);
					args.handle = dojo.hitch(this, _handle, args, "PUT", args.load, args.error, args.handle);
					args.load = args.error = null;
					return dojo.xhr("PUT", args, true);
				};
			
				dojo.xhrDelete = function(args){
					addCsrfToken(args);
					addMobileRequiredAppHeaders(args);
					args.handle = dojo.hitch(this, _handle, args, "DELETE", args.load, args.error, args.handle);
					args.load = args.error = null;
					return dojo.xhr("DELETE", args);
				};
			}
    	});

    	return editor;
});