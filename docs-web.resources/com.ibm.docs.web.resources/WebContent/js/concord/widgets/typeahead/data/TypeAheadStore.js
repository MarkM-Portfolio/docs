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

/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* OCO Source Materials                                              */
/*                                                                   */
/* Copyright IBM Corp. 2007, 2012                                    */
/*                                                                   */
/* The source code for this program is not published or otherwise    */
/* divested of its trade secrets, irrespective of what has been      */
/* deposited with the U.S. Copyright Office.                         */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.widgets.typeahead.data.TypeAheadStore");
dojo.require("concord.widgets.typeahead.data.LocalCacheStore");
dojo.require("concord.widgets.typeahead.data.XDomainFetcher");
dojo.require("concord.widgets.typeahead.data.HighlightFilter");
dojo.require("dojo.cookie");

/**
** Extend bhc.data.LocalCacheStore (includes base ItemFileWrite store functionality and caching)
** mixin bhc.data.XDomainFetcher to load json data via script
** mixin HighlightFilter to search and highlight hits
**/

dojo.declare("concord.widgets.typeahead.data.TypeAheadStore", 
	[concord.widgets.typeahead.data.LocalCacheStore, concord.widgets.typeahead.data.XDomainFetcher, concord.widgets.typeahead.data.HighlightFilter],
	{
	
	searchAttributes: ["f", "e", "c"],
	highlightAttributes: ["f", "e", "c"],
	sortBy: "f",
	
	token: "",
	strict: false,
	
	constructor: function(parms){		
		console.debug("TypeAheadStore.constructor()");
		this.token = parms.token;
		this.strict = parms.strict;
		
		if (!this.token){
			console.debug("no token was specified, check cookie");
			this.token = dojo.cookie("token");
		}		
		if (!this.token){
			console.error("you need a token to work with typeahead");
		}		
	},
	
	//for LocalCacheStore, ignore changes on highlight attributes
	isIgnoredAttribute: function(attr){
		return (dojo.indexOf(this.highlightAttributes, attr) > -1);
	}
});

