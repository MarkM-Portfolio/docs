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

/*
 * This file demonstrates how to register new tabs into the Files UI. This file will be evaluated after the core Dojo libraries have 
 * been loaded, so most Dojo methods are available.  The Files application will not be completely started.
 */
dojo.subscribe("lconn/share/app/start", function() {

dojo.require("lconn.share.action.DeferredAction");

alert("Register our custom action for a community file begin");

dojo.provide("com.ibm.concord.lcext.test.CommEdit");
dojo.declare("com.ibm.concord.lcext.test.CommEdit", [lconn.share.action.DeferredAction], {
  name: "Edit",
  tooltip: "Edit",
  isPrimary: true,

  isValid: function(file, opt) {
	return true;
  },
  
  execute: function(file, opt) {
	alert("Execute");
  }
});

dojo.provide("com.ibm.concord.lcext.test.CommView");
dojo.declare("com.ibm.concord.lcext.test.CommView", [lconn.share.action.DeferredAction], {
  name: "View",
  tooltip: "View",
  isPrimary: true,

  isValid: function(file, opt) {
	return true;
  },
  
  execute: function(file, opt) {
	alert("Execute");
  }
});

dojo.provide("com.ibm.concord.lcext.test.CommNew");
dojo.declare("com.ibm.concord.lcext.test.CommNew", [lconn.share.action.DeferredAction], {
  name: "NewCommunity",
  tooltip: "NewCommunity",
  isPrimary: true,

  isValid: function(file, opt) {
	return true;
  },
  
  execute: function(file, opt) {
	alert("Execute");
  }
});

/*
 * 
 * Register our custom action for a file
 */
lconn.core.uiextensions.add("lconn/files/actions/comm/owned/filesummary", function(actions, id, app, scene, opts) {
	alert("lconn/files/actions/comm/owned/filesummary");
	actions.unshift(new com.ibm.concord.lcext.test.CommView(app, scene, opts));
	actions.unshift(new com.ibm.concord.lcext.test.CommEdit(app, scene, opts));
 }
);

/*
 * 
 * Register our custom action for a file
 */
lconn.core.uiextensions.add("lconn/files/actions/comm/ref/file", function(actions, id, app, scene, opts) {
	alert("lconn/files/actions/comm/ref/file");
	actions.unshift(new com.ibm.concord.lcext.test.CommView(app, scene, opts));
	actions.unshift(new com.ibm.concord.lcext.test.CommEdit(app, scene, opts));
 }
);

/*
 * 
 * Register our custom action for a file
 */
lconn.core.uiextensions.add("lconn/files/actions/comm/ref/create", function(actions, id, app, scene, opts) {
	alert("lconn/files/actions/comm/ref/create");
	actions.push(new com.ibm.concord.lcext.test.CommNew(app, scene, opts));
});

});