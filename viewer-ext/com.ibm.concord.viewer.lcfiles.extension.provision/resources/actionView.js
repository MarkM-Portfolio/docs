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
dojo.provide("viewer.actionView");
dojo.require("viewer.customViewAction");
dojo.subscribe("lconn/share/app/start", function() {
    dojo.require("lconn.share.action.DeferredAction");
//    dojo.registerModulePath("viewer", "/viewerfilesext/js/viewer");
    dojo.require("viewer.global");
    
//    dojo.requireLocalization("viewer", "ccdfilesext", viewer.global.getLocale());
    
    dojo.provide("com.ibm.viewer.lcext.CCDView");
    dojo.declare("com.ibm.viewer.lcext.CCDView", [lconn.share.action.DeferredAction], {
        name: viewer.global.nls.viewName,
        tooltip: viewer.global.nls.viewTooltip,
        //tooltipfixme: "Preview in view",//DON"T CHANGE, hachish code 
        isPrimary: true,
    	constructor : function(app, opts) {
    		this.inherited(arguments);
    		this.app = app;
    	},
        isValid: function(file, opt) {
            var extension = file.getExtension();
            var view_format = {
            	"doc": 1,
            	"ppt": 1,
            	"xls": 1,
            	"docx": 1,
            	"pptx": 1,            	
            	"xlsx": 1,
            	"xlsm": 1,
            	"odt": 1,
            	"odp": 1,
            	"ods": 1,
            	"pdf": 1,
            	"ott": 1,
            	"otp": 1,
            	"ots": 1,
            	"dot": 1,
            	"pot": 1,
            	"xlt": 1,
            	"dotx": 1,
            	"potx": 1,
            	"xltx": 1,
            	"rtf": 1,
            	"txt": 1
            };
            if ((opt.app && opt.app.authenticatedUser) || (opt.permissions && opt.permissions.isAuthenticated())) {
                if ((!file.isEncrypted()) && extension && view_format[extension.toLowerCase()]) {
                    return true;
                }
            }
            return false;
        },
        
        
        viewernls : viewer.global.nls,
        
        execute: function(file, opt) {
          // remove isEmpty check because of story
          // 36864: Allow the user to view un-published document when Viewer is using snapshot
       	  window.open(glb_viewer_url_wnd_open + "/app/lcfiles/" + file.getId() + "/content", "_blank", "");
        },
        _isEmpty : function(file)
        {
          return 0 == file.getSize();
        },
        _isReader : function(file)
        {
          return !!file.getPermissions().View;
        }
    });
   
    this.addActions = function(actions, id, app, scene, opts)
	{
    	if (!viewer.global.showViewEntry()) return;
    	
		try
		{
			var bHasAdded = false;
			// In community files widget, the actions may be added more than one time, so check if the actions exist or not firstly.
			// See detail in OCS 161089.
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
	
    lconn.core.uiextensions.add("lconn/files/actions/file", this.addActions);

    lconn.core.uiextensions.add("lconn/files/actions/grid", this.addActions);
});
