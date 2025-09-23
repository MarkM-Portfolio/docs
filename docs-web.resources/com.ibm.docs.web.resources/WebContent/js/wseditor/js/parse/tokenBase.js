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

dojo.provide("websheet.parse.tokenBase");
dojo.require("websheet.parse.tokenType");
dojo.require("websheet.Constant");
dojo.declare("websheet.parse.tokenBase", null, {
	_name: "",										//token text
	_tokenType: 0,									//token type
	_calculateValue:null,							//the token calculative value	
	_error:null,									//the error for token, such as cell token is #REF!
	_parent: null,
	tokenType: websheet.parse.tokenType,
	
	constructor: function(args) {
		dojo.mixin(this, args);
		this._recalcType = websheet.Constant.RecalcType.NORMAL;
	},
	
	getName:function(){
		return this._name;
	},
	
	setName:function(name){
		this._name = name;
	},
	
	setParent:function(parent){
		this._parent = parent;
	},
	
	getParent:function(){
		return this._parent;
	},
	
	/*object*/getValue: function() {
		return this._calculateValue;
	},
	
	/*void*/setValue: function(value) {
		this._calculateValue = value;
	},
	
	/*type*/getType: function() {
		return this.getTokenType();
	},

	setRecalcType:function(rt){
		this._recalcType = rt;
	},
	
	getRecalcType:function(){
		return this._recalcType;
	},
	
	/*error*/getError: function() {
		return this._error;
	},
	
	/*void*/setError: function(error) {
		this._error = error;
	},
	
	/**
	 *
	 * @param {String} paramCols
	 */
	setTokenType:function(paramTokenType){
		this._tokenType = paramTokenType;
	},
	getTokenType:function(){
		return this._tokenType;
	},
	
	serialize:function(cell, bLocaleSensitive, bMSFormat)
	{
		return {"rawValue" : this._name , "isError":false};
	},
	
	getFormat: function()
	{
		return null;
	},
	
	getReferenceToken:function()
	{
		return null;
	},
	
	getProps:function(){
		return this._props;
	},
	
	setProp:function(prop, bOverWrite){
		//do nothing
	},
	
	removeProp:function(prop){
		//do nothing
	},
	
	isUpdate:function()
	{
		if(this._bUpdate)
			return true;
		return false;
	},
	
	setUpdate:function(bUpdate)
	{
		if(bUpdate) {
			var RecalcType = websheet.Constant.RecalcType;
			switch(this._recalcType){
				case RecalcType.IGNORE:
					return;
				case RecalcType.ANCESTOR:
					this._bUpdate = true;
					var ancestor;
					if(this._parent){
						var parent = this._parent;
						if(this._parent.getType() == this.tokenType.FUNCTIONPARMAS_TOKEN)
							parent = parent._parent;
						if(parent && (ancestor = parent._parent)){
							ancestor.setUpdate(true);
						}
					}
					break;
				default: {
					this._bUpdate = true;
					if(this._parent)
						this._parent.setUpdate(true);
					break;
				}
			}
		} else {
			this._bUpdate = false;
		}
	},
	
	//the token might be shared by autofilled cells, so here need cellId to differentiate
	getUpdateRefTokenByParsedRef:function(ref/*or name string*/, cell) {
		if(!this._updateRefTokens)
			return null;
		var EQUAL = websheet.Constant.AreaRelation.EQUAL;
		var cellId = cell._uniqueId;
		var cellTokens = this._updateRefTokens[cellId];
		if(cellTokens){
			if( ref instanceof websheet.parse.ParsedRef) {
				for(var id in cellTokens){
					var list = cellTokens[id];
					for(var i = 0; i < list.length; i++){
						var refToken = list[i];
						var area = refToken.getValue();
						if(area.compare(ref) == EQUAL)
							return refToken;
					}
				}
			} else {
				//ref is name string
				var list = cellTokens[ref.toLowerCase()];
				if(list && list.length > 0)
					return list[0];
			}
		}
		return null;
	},
	
	addUpdateRefToken:function(updateRefToken, cell){
		if(!updateRefToken)
			return;
		if(!this._updateRefTokens){
			this._updateRefTokens = {};
		}
		var ref = updateRefToken.getValue();
		var id = ref.getId();
		var cellId = cell._uniqueId;
		var cellTokens = this._updateRefTokens[cellId];
		if(!cellTokens){
			cellTokens = {};
			this._updateRefTokens[cellId] = cellTokens;
		}
		var list = cellTokens[id];
		if(!list){
			list = [];
			cellTokens[id] = list;
		}
		list.push(updateRefToken);
	},
	
	removeUpdateRefToken:function(updateRefToken, cell){
		if(!updateRefToken)
			return;
		if(!this._updateRefTokens){
			return;
		}
		var cellId = cell._uniqueId;
		var cellTokens = this._updateRefTokens[cellId];
		if(!cellTokens){
			return;
		}
		var ref = updateRefToken.getValue();
		var id = ref.getId();
		var list = cellTokens[id];
		if(!list){
			return;
		}
		var i = list.indexOf(updateRefToken);
		list.remove(i, 1);
		cell.deleteRef(updateRefToken);
	},
	
	removeAllUpdateRefToken:function(cell){
		if(this._updateRefTokens){
			var cellId = cell._uniqueId;
			var cellTokens = this._updateRefTokens[cellId];
			for(var id in cellTokens){
				var list = cellTokens[id];
				for(var i = 0; i < list.length; i++){
					var token = list[i];
					cell.deleteRef(token);
				}
			}
			delete this._updateRefTokens[cellId];
		}
	}
	
});