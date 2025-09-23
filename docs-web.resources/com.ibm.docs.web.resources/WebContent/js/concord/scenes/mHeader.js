/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2014. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

// Header is a internal class of AbstractScene
dojo.provide("concord.scenes.mHeader");

dojo.require("concord.scenes.Header");
dojo.declare("concord.scenes.mHeader", [concord.scenes.Header], {
	_createContent: function(app, node, title) {
		// do nothing for mobile.
	},

	disableShareCommentButton: function(disable) {
		// do nothing for mobile.
	},	
	
	/**
	 * type = 0, 1, 2 (info, warning, error)
	 */
	_showMessage : function(text, interval, type ,nojaws, key)
	{
		concord.util.mobileUtil.showMessage(text);
	},
	
	hideErrorMessage: function(key) {
		// do nothing in mobile
	},
	
	showSavedMessage: function() {
		this.scene.bSaved = true;
	},
	
	showSavingMessage: function() {
		this.scene.bSaved = false;
	},	
	
	showSavedImg: function(show) {
		// do nothing in mobile	
	},
	
	showSavingImg: function(show) {
		// do nothing in mobile
	},		
	
	showTextMessage: function(text, interval) {
		concord.util.mobileUtil.showMessage(text);	
	},
	showProblemIDDiv: function(problem_id,nls,key){
		// do nothing in mobile	
	}
});