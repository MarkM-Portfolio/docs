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

dojo.provide("concord.SAMLFrameLogin");

dojo.declare("concord.SAMLFrameLogin", null, {
	isLoggedIn : false,
	src: "/docs/app/doc",
	samlFrame: null,

	login : function(delay) {
		window.setTimeout(dojo.hitch(this, this.initSamlFrame), 1000 * delay);
		// preemptive saml check every 25 minutes
		window.setInterval(dojo.hitch(this, this.kickSamlCheck), 1000 * 60 * 25);
	},
	
	initSamlFrame: function() {
		//console.log("Docs SAML Login executing...");
		var samlFrame = document.createElement("IFRAME");
		samlFrame.name = samlFrame.id = "preemptiveSamlFrame";
		samlFrame.style.top = "-9999px";
		samlFrame.style.width = samlFrame.style.height = "1px";
		samlFrame.style.display = "none";
		samlFrame.src = this.src;
		samlFrame.onload = dojo.hitch(this, this._onload);
		document.body.appendChild(samlFrame);
		this.samlFrame = samlFrame;			
	},

	kickSamlCheck : function() {
		this.samlFrame.src = this.src;
		if(concord.global.haveDocsLTPA()){
			// delete immediate saml iframe if there is any
			this.removeImmediateSAMLFrame();
		}
	},
	
	removeImmediateSAMLFrame : function() {
		var node = dojo.byId("ImmediateSamlFrame");
		if(node)
		{
			document.body.removeChild(node);
		}
	},

	_onload : function() {

	}
});
