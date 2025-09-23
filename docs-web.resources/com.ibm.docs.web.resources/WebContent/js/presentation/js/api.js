/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2016. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */
dojo.provide("pres.api");
dojo.require("concord/util/ApiEngine");
pres.api = {
	getDocType: function() {
		var docType = "pres";
		return this._genResult(docType);
	}		
}

dojo.mixin(pres.api, concord.util.ApiEngine.prototype);
pres.api.configure();
pres.api.startListener();