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
dojo.provide("viewer.addViewerOnCommFiles");

dojo.subscribe("lconn/share/app/start", function() {
//	dojo.registerModulePath("viewer", "/viewerfilesext/js/viewer");
	dojo.require("viewer.global");
	if(!viewer.global.showViewEntry()) return;

	dojo.require("viewer.actionView");
	
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
				if ("com.ibm.viewer.lcext.CCDView" == sClassName )
				{
					bHasAdded = true;
					break;
				}
			}
			if (!bHasAdded)
			{
				actions.unshift(new com.ibm.viewer.lcext.CCDView(app, scene, opts));
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
	lconn.core.uiextensions.add("lconn/files/actions/comm/owned/file", this.addActions);
	
	/*
	 * Register our custom actions in file list widget of community files UI.
	 * 
	 */
	lconn.core.uiextensions.add("lconn/files/actions/comm/ref/file", this.addActions);
	/*
	 * Register our custom actions in file grid widget of community files UI.
	 * 
	 */
	lconn.core.uiextensions.add("lconn/files/actions/communityGrid",this.addActions);
});
