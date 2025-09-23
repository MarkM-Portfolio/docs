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

dojo.provide("concord.scenes.SheetDocRevScene");

dojo.require("concord.scenes.SheetDocScene");
dojo.require("concord.net.RevSession");
dojo.declare("concord.scenes.SheetDocRevScene", [concord.scenes.SheetDocScene], {
    
    constructor: function(app, sceneInfo){
    	this.setContenType(this.CONTENT_TYPE_REVISION);
    	this.setRev(this.sceneInfo.revision);
    },
    
	setRev: function(rev) {
		this.rev = rev;
	},    

    //	DOC_TYPE : "sheet",
    
    begin: function(oldScene){
    	dojo.requireLocalization("concord.scenes","Scene");
        this.nls = dojo.i18n.getLocalization("concord.scenes","Scene");
        this.authUser = this.app.authenticatedUser;
        
        if (this.authUser == null) {// may never come to this statement
            console.info("null user");
        }
        else {// use RevSession rather than session
            this.session = new concord.net.RevSession(this, this.sceneInfo.repository, this.sceneInfo.uri, this.getRev());
            this.editors = new concord.beans.EditorStore(null, null, null);
            window["pe"].taskMan = websheet.TaskManager;
            this.show();
        }             
    },
    
	applySidebarSettings: function()
	{		
	}    
});
