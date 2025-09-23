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

dojo.subscribe("lconn/share/app/start", function() {
	dojo.registerModulePath("concord", "/concordfilesext/js/concord");
	dojo.require("concord.global");
	if(!concord.global.showConcordEntry()) return;

	dojo.require("concord.actionEdit");
	
	/**
	 * Add actions to the communities Files UI, including file list and file summary widget.
	 */
	this.addActions = function(actions, id, app, scene, opts)
	{
		try
		{
			var bHasAdded = false;
			// In community files widget, the actions may be added more than one time, so check if the actions exist or not firstly, please see detail in defect 45730.
			var len = (typeof actions != 'undefined') ? actions.length : 0;
			for (var index = 0; index < len; index++)
			{
				var sClassName = actions[index].declaredClass;
				if ("com.ibm.concord.lcext.CCDEdit" == sClassName || "com.ibm.concord.lcext.CCDMSFormatExport" == sClassName || "com.ibm.concord.lcext.CCDPDFExport" == sClassName || "com.ibm.concord.lcext.CCDNewFrom" == sClassName)
				{
					bHasAdded = true;
					break;
				}
			}
			if (!bHasAdded)
			{
				//actions.unshift(new com.ibm.concord.lcext.CCDView(app, scene, opts));
				actions.unshift(new com.ibm.concord.lcext.CCDEdit(app, scene, opts));
				actions.unshift(new com.ibm.concord.lcext.CCDNewFrom(app, scene, opts));
				actions.push(new com.ibm.concord.lcext.CCDMSFormatExport(app, scene, opts));
				actions.push(new com.ibm.concord.lcext.CCDPDFExport(app, scene, opts));
			}
		}
		catch (e)
		{
			console.log("Error happens when adding actions to communities files UI: ", e);
		}
	};
	
	/*
	 * Register our custom actions in file summary widget of community files UI.
	 * 
	 */
	lconn.core.uiextensions.add("lconn/files/actions/comm/owned/filesummary", this.addActions);
	
	/*
	 * Register our custom actions in file list widget of community files UI.
	 * 
	 */
	lconn.core.uiextensions.add("lconn/files/actions/comm/ref/file", this.addActions);
});
