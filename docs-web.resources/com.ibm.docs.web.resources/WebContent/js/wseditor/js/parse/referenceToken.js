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

dojo.provide("websheet.parse.referenceToken");
dojo.declare("websheet.parse.referenceToken", null, {

	_text: null,          // original value
	_changedText:null,    // changed value
	_index: null,
	_type:null,
	_ref:null,			//will be set for type =="range" or "cell"
	constructor: function(text,index,type) {
		this._text = text;
		this._changedText = text;
		this._type = type;
		this._index = index;
	},
	
	clone: function(token)
	{
		if(!token) return;
		this._text = token.getText();
		this._changedText = token.getChangedText();
		this._index = token.getIndex();
		this._type = token.getType();
		this._ref = token.getRef();
	},
	/**
	 *
	 * @param {String} paramCols
	 */
	setText:function(text)
	{
	    this._text = text;
	    this._changedText = text;
	},
	setTextOnly:function(text)
	{
		this._text = text;	
	},
	getText:function()
	{
	   return this._text;
	},
	setChangedText:function(text)
	{
	    this._changedText = text;
	    this._ref = null;
	},
	
	getChangedText:function()
	{
		if(this._changedText != undefined )
			return this._changedText;
		else
			return this._text;
	},
	
	setIndex:function(index)
	{
	    this._index = index;
	},
	
	getIndex:function()
	{
	   return this._index;
	},
	
	setType:function(type)
	{
	    this._type = type;
	},
	
	getType:function()
	{
	   return this._type;
	},
	
	setRef:function(ref)
	{
	    this._ref = ref;
	},
	
	getRef:function()
	{
	   return this._ref;
	}
});
