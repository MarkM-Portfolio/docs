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

dojo.provide("concord.beans.User");
dojo.require("concord.util.acf");
dojo.require("concord.util.browser");

dojo.declare("concord.beans.User", null, {
	entitlements: null,
	gatekeeperFeatures: null,
	role_owner: "Owner",
	role_contributor: "Contributor",
	role_editor: "Editor",
	role_reviewer: "Reviewer",
	role_reader: "Reader",
	
	constructor: function(entry) {
		this.e = entry;
	},
	
	getId: function() {
		return this.e.id;
	},
	
	getOrgId: function() {
		return this.e.org_id;
	},	
	
	getName: function() {
		return concord.util.acf.escapeXml(this.e.disp_name,true);
	},
	
	getEmail: function() {
		return this.e.email;
	},
	
	getPreference: function() {
		return this.e.preference;
	},
	
	getPhotoUrl: function(){
		return this.e.photo;
	},
	
	getRoleId: function() {
		return this.e.role_id;
	},
	
	getRoleName: function() {
		if(this.e.role_name && this.e.role_name.length > 0)
			return concord.util.acf.escapeXml(this.e.role_name,true);
		
		return this.role_editor;
	},	
	
	isOwner: function() {
		return this.getRoleName() == this.role_owner;
	},
	
	isContributor: function() {
		return this.getRoleName() == this.role_contributor;
	},
	
	isReader: function() {
		return this.getRoleName() == this.role_reader;
	},
	
	isReviewer: function() {
		return this.getRoleName() == this.role_reviewer;		
	},
	
	getEntitlements: function() {
		return this.entitlements;
	},
	
	getGatekeeperFeatures: function() {
		return this.gatekeeperFeatures;
	},
	
	setGatekeeperFeatures: function(gatekeeperFeatures) {
		this.gatekeeperFeatures = gatekeeperFeatures;
	},
	
	setEntitlements: function(entitleJsonStr) {
		this.entitlements = {};
		try
		{
			var entitleArray = JSON.parse(entitleJsonStr);
			var length = entitleArray != null ? entitleArray.length : 0;
			for (var index = 0; index < length; index++)
			{
				var item = entitleArray[index];
				if (item != null && item.name != null)
				{
					if(concord.util.browser.isMobile())
					{
						if(item.name == "assignment")
						{
							item.booleanValue = false;
						}
					}
					this.entitlements[item.name] = item;
				}
			}
		}
		catch (e)
		{
			console.log("Error happens while setting entitlements." , e);
		}
	}
});
