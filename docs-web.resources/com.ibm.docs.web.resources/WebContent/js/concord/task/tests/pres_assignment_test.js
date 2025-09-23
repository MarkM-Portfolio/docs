/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.require("concord.tests.aspect");
dojo.require("concord.task.tests.utils");
dojo.require("concord.task.tests.gLoaded");
dojo.require("concord.task.tests.gOperation");

dojo.provide("concord.task.tests.pres_assignment_test");

//window.testUtils = {};
//(function() {
//	var utils = window.testUtils.utils;
//	
//	var params = utils.getReqParams();
//	var group = params["group"];
//	
//	if (group == null) {
//		console.error("no test group provided, nothing to do.");
//	} else {
//		dojo.require("concord.task.tests." + group);
//	}
//})();