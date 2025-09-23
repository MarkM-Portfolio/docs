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

dojo.provide("concord.beans.Participant");
dojo.require("concord.beans.User");

dojo.declare("concord.beans.Participant", null, {
	
	constructor: function(e, clientId,joinTime) {
		this.user = new concord.beans.User(e);
		this.cid = clientId;
		this.joinTime = -1;
		if (joinTime)
			this.joinTime = joinTime;
	},

	getClientId: function() {
		return this.cid;
	},
	
	getUserBean: function() {
		return this.user;
	},
	getJoinTime: function() {
		return this.joinTime;
	}
});
