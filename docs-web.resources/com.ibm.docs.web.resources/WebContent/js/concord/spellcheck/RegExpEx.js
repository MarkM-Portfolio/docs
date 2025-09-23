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

/**
 * 
 */
dojo.provide("concord.spellcheck.RegExpEx");

dojo.declare("concord.spellcheck.RegExpEx", null, {
	_reg: null,
	_bMatchWord: false,
	
	constructor: function(regStr, opt, bMatchWord){
		this._bMatchWord = bMatchWord;
		this._reg = new RegExp(regStr, opt);
	},
	
	_isMatchWordBoundary: function()
	{
		return this._bMatchWord;
	},
	
	_execWordBoundary: function(text)
	{
		var match = this._reg.exec(text);
		while(match)
		{
			var pre = match.index - 1;
			var post = match.index + match[0].length;
			if( spellcheckerManager.isSeparator(text, pre) && spellcheckerManager.isSeparator(text, post))
				return match;
			// get next match if this is not a boundary word.
			match = this._reg.exec(text);
		}
		
		return match;
	},
	
	exec: function(text)
	{
		if( this._isMatchWordBoundary() )
			return this._execWordBoundary(text);
		else
			return this._reg.exec(text);
	}	
	
});
