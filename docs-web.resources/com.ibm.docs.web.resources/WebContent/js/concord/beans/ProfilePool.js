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

dojo.provide("concord.beans.ProfilePool");
dojo.require("concord.beans.Profile");

dojo.declare("concord.beans.ProfilePool", null, {
	
	constructor : function(){
		this.profiles = {};
	},

	loadProfile: function(id) {
		var url = contextPath + "/api/people?method=getProfileInfo&id=" + id;
		var response, ioArgs;
		dojo.xhrGet({
			url: url,
			handleAs: "json",
			handle: function(r, io) {response = r; ioArgs = io;},
			sync: true
		});
		
		if(response && response instanceof Error) 
			return null;
		
		return response;
	},
	loadProfileByDN: function(DN) {
		var url = contextPath + "/api/people?method=getProfileInfoByDN&dn=" + DN;
		var response, ioArgs;
		dojo.xhrGet({
			url: url,
			handleAs: "json",
			handle: function(r, io) {response = r; ioArgs = io;},
			sync: true
		});
		return response;
	},
	loadProfileByEmail: function(Email) {
		var url = contextPath + "/api/people?method=getProfileInfoByEmail&email=" + Email;
		var response, ioArgs;
		dojo.xhrGet({
			url: url,
			handleAs: "json",
			handle: function(r, io) {response = r; ioArgs = io;},
			sync: true
		});
		
		return response;
	},
	
	getUserProfile: function(id){
		var p = this.profiles[id];
		if (p == null || p == 'undefined')
		{
			var e = this.loadProfile(id);
			if(e){
				p = new concord.beans.Profile(e);
				this.profiles[id] = p;
			}
		}
		return p;
	},
	
	getUserProfileByDN: function(DN){
		var p = this.profiles[DN];
		if (p == null || p == 'undefined')
		{
			var e = this.loadProfileByDN(DN);
			p = new concord.beans.Profile(e);
			this.profiles[DN] = p;
		}
		return p;
	},
	
	getUserProfileByEmail: function(Email){
		var p = this.profiles[Email];
		if (p == null || p == 'undefined')
		{
			var e = this.loadProfileByEmail(Email);
			p = new concord.beans.Profile(e);
			this.profiles[Email] = p;
		}
		return p;
	}
});

