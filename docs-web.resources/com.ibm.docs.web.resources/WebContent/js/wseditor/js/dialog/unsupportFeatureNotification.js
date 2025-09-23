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

dojo.provide("websheet.dialog.unsupportFeatureNotification");
dojo.require("dijit.Dialog");
dojo.require("dojo.i18n");
dojo.requireLocalization("websheet.dialog","unsupportFeatureNotification");

dojo.declare("websheet.dialog.unsupportFeatureNotification", [concord.widgets.concordDialog], {
	
	unsupFeatureList: null,
	"-chains-": {
		constructor: "manual"//prevent from calling super class constructor
	},
	
	constructor: function(object, title, oklabel, visible, list) {
		this.unsupFeatureList = list;
		if (title) title += "#" + Math.random();
		this.inherited( arguments );
	},
	
	createContent: function (contentDiv) {
		
		var nls = dojo.i18n.getLocalization("websheet.dialog","unsupportFeatureNotification");
		dojo.addClass( contentDiv, "lotusui30_layout ");
		var content = contentDiv;
		var msgsDiv = dojo.create("div", null, content );
		dojo.create('div', {innerHTML:nls.convertNotifyMsg}, msgsDiv);
		
		for(var i = 0; i < this.unsupFeatureList.length; i++)
		{
			var feature = dojo.trim(this.unsupFeatureList[i].toUpperCase());
			var str = (i+1) + ")  "  + nls[feature];
			var item = dojo.create('div', {innerHTML:str}, msgsDiv);
			dojo.addClass(item,"unsupportFeature");
		}
	}
});