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

dojo.provide("concord.addEditsOnFiles");

dojo.require("concord.global");
dojo.require("concord.actionEdit");

(function() {
	// register custom actions in file summary widget of personal files UI.
	lconn.core.uiextensions.add("lconn/files/actions/file", function(actions, id, app, scene, opts) {
		if (concord.global.showConcordEntry()) {
			actions.unshift(new com.ibm.concord.lcext.CCDEdit(app, scene, opts));
			actions.unshift(new com.ibm.concord.lcext.CCDNewFrom(app, scene, opts));
			actions.unshift(new com.ibm.concord.lcext.CCDViewDetail(app, scene, opts));
			actions.push(new com.ibm.concord.lcext.CCDPDFExport(app, scene, opts));
		}
	});
})();
