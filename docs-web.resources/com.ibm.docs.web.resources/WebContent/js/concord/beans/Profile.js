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

dojo.provide("concord.beans.Profile");
dojo.require("concord.util.acf");
dojo.declare("concord.beans.Profile", null, {
	
	constructor: function(entry) {
		this.e = entry;
	},
	
	getId: function() {
		return this.e.id;
	},
	
	getOrgId: function() {
		return this.e.org_id;
	},
	
	getOrgName: function() {
		if(this.e.org_name)
			return concord.util.acf.escapeXml(this.e.org_name,true);
		return this.e.org_name;
	},
	
	getCustomerId: function() {
		return this.e.cust_id;
	},
	
	getName: function() {
		if(this.e.disp_name)
			return concord.util.acf.escapeXml(this.e.disp_name,true);
		return this.e.disp_name;
	},
	
	getEmail: function() {
		if(this.e.email)
			return concord.util.acf.escapeXml(this.e.email,true);
		return this.e.email;
	},
	
	getDistinguishedName: function() {
		return this.e.dn;
	},

	getTelphone: function() {
		return this.e.tel;
	},

	getMobile: function() {
		return this.e.mobile;
	},
	
	getJobTitle: function() {
		if(this.e.job_title)
			return concord.util.acf.escapeXml(this.e.job_title,true);
		return this.e.job_title;
	},
	
	getAddress: function() {
		return this.e.addr;
	},
	
	getPhotoUrl: function(){
		return this.e.photo;
	}
});
