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

dojo.provide("concord.addEditsOnGridFiles");

dojo.require("concord.global");
dojo.require("concord.actionEdit");

(function() {
	//Register custom actions in file grid widget of personal files UI.
	//It is for IBM SmartCloud 2014 April and IBM Connections 2014 June.
	lconn.core.uiextensions.add("lconn/files/actions/grid", function(actions, id, app, scene, opts) {
		if (concord.global.showConcordEntry()) {
			actions.push(new com.ibm.concord.lcext.CCDEdit(app, scene, opts));
			actions.push(new com.ibm.concord.lcext.CCDNewFrom(app, scene, opts));
		}
	});
})();
