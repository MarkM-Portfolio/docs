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

dojo.provide("concord.addEditsOnCommGridFiles");

dojo.require("concord.global");
dojo.require("concord.actionEdit");

(function() {
	// add actions to the communities grid Files UI, including file list and file
	// summary widget.It is for IBM SmartCloud 2014 April and IBM Connections 2014 June.
	var addActions = function(actions, id, app, scene, opts) {
		if (concord.global.showConcordEntry()) {
			try {
				var bHasAdded = false;
				// in community files widget, the actions may be added more than one
				// time, so check if the actions exist or not firstly, please see
				// detail in defect 45730.
				var len = (typeof actions != 'undefined') ? actions.length : 0;
				for ( var index = 0; index < len; index++) {
					var sClassName = actions[index].declaredClass;
					if ("com.ibm.concord.lcext.CCDEdit" == sClassName  || "com.ibm.concord.lcext.CCDNewFrom" == sClassName) {
						bHasAdded = true;
						break;
					}
				}
				if (!bHasAdded) {
					actions.push(new com.ibm.concord.lcext.CCDEdit(app, scene, opts));
					actions.push(new com.ibm.concord.lcext.CCDNewFrom(app, scene, opts));
				}
			} catch (e) {
				console.log("Error happens when adding actions to communities grid files UI: ", e);
			}
		}
	};
	// register custom actions in file grid widget of community files UI.
	lconn.core.uiextensions.add("lconn/files/actions/communityGrid", addActions);
})();
