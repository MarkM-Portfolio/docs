/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.parse.NameArea");
dojo.require("websheet.listener.BroadCaster");
dojo.require("websheet.parse.Reference");
dojo.declare("websheet.parse.NameArea", websheet.parse.Reference,{

	_refMask : websheet.Constant.RefAddressType.NONE,
	
	constructor: function(){
		this._refMask = this._parsedRef.refMask;
		this.usage = websheet.Constant.RangeUsage.NAME;
	},
	
	getMask : function() {
		return this._refMask;
	},
	
	setMask : function(mask, bOR) {
		if (bOR)
			this._refMask |= mask;
		else
			this._refMask = mask;
	}
	
});

dojo.declare("websheet.parse.UndefinedNameArea", websheet.listener.BroadCaster,{
	_id: null,
	constructor:function(name){
		this._list = [];//initialize the broadcast list
		this._id = name;
		this.usage = websheet.Constant.RangeUsage.UNDEFINEDNAME;
	},
	
	getId:function(){
		return this._id;
	},
	
	getUsage:function(){
		return this.usage;
	}
});

