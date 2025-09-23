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

dojo.provide("concord.scenes.TextDocRevScene");

dojo.require("concord.scenes.TextDocScene");
dojo.require("concord.net.RevSession");
dojo.declare("concord.scenes.TextDocRevScene", [concord.scenes.TextDocScene], {
	
	constructor: function(app, sceneInfo) {
    	this.setContenType(this.CONTENT_TYPE_REVISION);
    	this.setRev(this.sceneInfo.revision);
	},
	
	setRev: function(rev) {
		this.rev = rev;
	},    
	
	begin: function(oldScene) {
		this.nls = dojo.i18n.getLocalization("concord.scenes","Scene");
		this.authUser=this.app.authenticatedUser;
		if(this.authUser==null){// may never come to this statement
			console.info("null user");
		}
		else{
			this.session = new concord.net.RevSession(this, this.sceneInfo.repository, this.sceneInfo.uri, this.getRev());			
			this.editors = new concord.beans.EditorStore(null, null, null);		      
			this.show();
		}
	},
	
	applySidebarSettings: function()
	{		
	}
});

