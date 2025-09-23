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

dojo.provide("websheet.parse.RefToken");
dojo.require("websheet.parse.token");
dojo.require("websheet.functions.IObject");
dojo.declare("websheet.parse.RefToken", websheet.parse.token, {
	_index:null,									// the index of this token in the formula string, now only used for range/cell/name
	_props:0,										//websheet.Constant.RefType, here only support ignoreset
	
	_refMask : 0,           						// RefAddressType
	
	Object: websheet.functions.Object,
	
	constructor:function(){
		this._tokenType = this.tokenType.RANGEREF_TOKEN;
		//should explicitly setTokenType if it is NAME token
	},
	
	/*type*/getRefMask: function() {
		return this._refMask;
	},
	
	/*type*/setRefMask: function(refMask, bAdd) {
		if (bAdd)
			this._refMask |= refMask;
		else
			this._refMask = refMask;
	},
	
	getUpdateToken:function(){
		return this._updateToken;
	},
	
	setUpdateToken:function(token){
		this._updateToken = token;
	},
	
	setIndex:function(index){
		this._index = index;
	},
	//now the _index is only workable for range/cell/name token
	getIndex:function(){
		return this._index;
	},

	//get the address of the reference or name token, otherwise return the string representation of other tokens
	//params.bMSFormat to specify the address format
	getAddress:function(params){
		var range = this.getValue();
		params = params || {};
		if (this._tokenType == this.tokenType.NAME) {
			if (range.getUsage() == websheet.Constant.RangeUsage.NAME)
				params.refMask = range.getMask();
		} else {
			params.refMask = this._refMask;
		}
		if (!(this.Object.isReference(range)))
			return this.getName();
		return range.getParsedRef().getAddress(params);
	},
	
	serialize:function(cell, bLocaleSensitive, bMSFormat)
	{
		var isError = false;
		var type = this.getTokenType();
		var name = this.getName();
		
		var tt = this;
		if(cell._bAfPat){
			tt = cell._tokenArray[tt._arrayIndex];
			if(tt == undefined){
				tt = this;
				console.log("WARNING: regenerate formula for autofill pattern cells");
			}else{
				name = tt.getName();
			}
		}
		var range = tt.getValue();
		if(!(this.Object.isReference(range)))
			return {"rawValue" : name , "isError":isError};
		if(!range.isValid())
			isError = true;
		/**
		 * because for now token will never be cleared anymore
		 * so need to set the error to other formula or operator's calculation.  
		 */
		if(isError)
			tt._error = websheet.Constant.ERRORCODE["524"];
		else{
			//it might inherit from the autofill pattern cells
			//clear the error if it is not the #REF! error 
			if(tt._error == websheet.Constant.ERRORCODE["524"])
				delete tt._error;
		}
		if(type == this.tokenType.NAME){
			if(!isError)
				delete this._error;
		}else {//for non name range
			name = tt.getAddress();
			if(!bMSFormat){
				tt.setName(name);
			}
		}
		
		return {"rawValue" : name , "isError":isError};
	},
	
	getFormat: function()
	{
		var ref = this.getValue();
		return websheet.Helper.getTokenFormat(ref);
	},
	
	getProps:function(){
		return this._props;
	},
	
	getReferenceToken:function(){
		var value = this.getValue();
		if(websheet.parse.FormulaParseHelper.isRangeObj(value))
			return [this];
		return []; 
	},
	
	setProp:function(prop, bOverWrite){
		if(bOverWrite)
			this._props = prop;
		else
			this._props = this._props | prop;
	},
	
	removeProp:function(prop){
		this._props &= ~prop;
	}
});
