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

dojo.provide("pres.test.runner.deferreds");

(function(runner, app) {
	var _deferreds = runner.deferreds = {};
	
	var onceWrapper = function(method) {
		return function(target, cut, f, args) {
			var signal;
			var f2 = function() {
				if (signal && signal.remove) {
					signal.remove();
				}
				f();
			};
			signal = method(target, cut, f2, args);
			return signal;
		};
	};
	aspect.afterOnce = onceWrapper(aspect.after);
	aspect.beforeOnce = onceWrapper(aspect.before);
	
	_deferreds.awaitTaskManager = function(deferred, priority, interval) {
		deferred = deferred || new dojo.Deferred();
		interval = interval || 0;
		setTimeout(function() {
			app.pe.taskMan.waitForComplete(deferred, priority);
		}, interval);
		return deferred;
	};
	
	_deferreds.initialize = function(deferred) {
		// summary: calls before application begins, will resolve the deferred after first sheet finishes loading
		// concord loading call path is
		// concord.main.App.onLoad (after: window.pe hook on app object)
		//		-> pe.start
		//		-> pe.load 				(after: pe.scene is constructed)
		//		-> pe.scene.begin 		(after: pe.taskMan initialized)
		//		-> pe.scene.render 		(after: pe.base is initialized)
		//		-> pe.scene.stage		
		//	After stage, scene is querying job, could be
		//		-> pe.scene.staging
		//	OR
		//		-> pe.scene.staged		(after: criteria is ready)
		//		-> pe.scene.join -> pe.scene.session.join		(after: join (load document) request is sent)
		//	After join() is called, scene is waiting for document content, after content is responded,
		//		-> pe.scene.loadState
		// Follow on concord initialize code path to create "extension point" for test code		
		deferred = deferred || new dojo.Deferred();
		
		var waitForApp = setInterval(function() {
			if (app.pe && app.pe.scene && app.pe.scene.bLoadFinished && !app.concord.net.Beater._stopped) {
				clearInterval(waitForApp);
				deferred.callback();
				
			}
		}, 0);
		
		return deferred;
	};
		

	
	
})(window, window.app);