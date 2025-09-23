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

// web-based clipboard

dojo.provide("concord.beans.WebClipboard");

//dojo.require("concord.util.dialogs");
dojo.require("dojo.i18n");
dojo.requireLocalization("concord.beans", "WebClipboard");

dojo.declare("concord.beans.WebClipboard", null, {
	_cache: null,	
	_MAX_L: 20480,	
	_src: null,
	_date: "",
	_app: "",
	_item_key: "",
	_id_doc: "doc",
	_id_pres: "pres",
	_id_ws: "ws",
	bServer: false,	
	
	constructor: function(paras) {
		if(paras && paras.app) {
		  this._app = paras.app;
		}
		if(paras && paras.bServer) {
		  this.bServer = paras.bServer;  
		}
		// Separate clipboard for editors in R1
		this._src = dojo.i18n.getLocalization("concord.beans", "WebClipboard");
		this._setItemKey();  
		// Enlarge(reset) the clipbaord MAX_LENGTH if use local storage
		if(this.isWebStorage())
		{
		  this._MAX_L = 1024*1024*5; // 5MB, since FF default localStorage quota is 5MB (5120 K characters)
		}
	},	
	
	_isValid: function(d) {
		var str = d; 
		if(typeof str != "string")
		{
			console.log(this._src.invalid);
			return false;
		}
		if(str.length >= this._MAX_L)		
		{
			dojo["require"]("concord.util.dialogs");
			concord.util.dialogs.alert(this._src.exceed);
			return false;
		}
		this._cache = str;
		
		return true;
	},
		
	_setItemKey: function()	{
	  this._item_key = "_concord_clipboard_data_" + this._app;
	  this._item_timestamp_key = "_concord_clipboard_data_timestamp_" + this._app;
	},
	
	setData: function(d) {		
		// check if valid data
		var isDataValid = this._isValid(d); //jmt- 41913
		if ( isDataValid ) { // check d's validation and assign it to this.cache.data if it's true
			if( this.isWebStorage() )
			{
				try {
				window.localStorage.setItem(this._item_key, this._cache);
				window.localStorage.setItem(this._item_timestamp_key, new Date().valueOf());
				} catch (e) { console.log(e); }
 			}
		}
		return isDataValid;
	},
	
	getDataTimestamp: function() {
		if( this.isWebStorage() )
		{
			return window.localStorage.getItem(this._item_timestamp_key);
		}
		else
		{		
			return 0;
		}
	},
	
	getData: function() {
		if( this.isWebStorage() )
		{
			return window.localStorage.getItem(this._item_key);
		}
	},
	
	emptyClipboard: function()	{
		if( this.isWebStorage() )
		{
			window.localStorage.removeItem(this._item_key);
		}
	},
	
	setForceServer: function(bServer) {
		this.bServer = bServer;
	},
	
	isServer: function() {
		return this.bServer;
	},
	
	isWebStorage: function() {
		return true;
//		if( window.localStorage && !this.isServer() )
//		{
//			return true;
//		}
//		else
//		{
//			return false;
//		}
	},
	
	// this could not be changed as which is related table record
	getMaxLength: function() {
		return this._MAX_L;
	},
	
	setApp: function(app) {
		this._app = app;
		this._setItemKey();
	},
	
	getApp: function() {
		return this._app;
	}
	
});
