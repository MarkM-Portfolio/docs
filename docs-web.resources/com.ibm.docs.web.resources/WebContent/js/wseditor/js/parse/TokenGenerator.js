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

dojo.provide("websheet.parse.TokenGenerator");

// tokenType.ARRAYFORMULA_TOKEN change to ARRAYCONSTANT_TOKEn
// SINGLEQUOT_STRING, and CELLREF_TOEKN useless
websheet.parse.TokenGenerator = {
	_LEX_TYPE : websheet.parse.FormulaLexer.prototype.TOKEN_TYPE,
	_LEX_SUBTYPE: websheet.parse.FormulaLexer.prototype.TOKEN_SUBTYPE,
	tokenType: websheet.parse.tokenType,
	newFuncToken : function(lexeme, cell)
	{
		var funcName = lexeme.id;//locale insensitive name
		var tokenList = new websheet.parse.tokenList();
		if(cell && funcName)
		{
			var errProp = websheet.functions.Util.getErrPropByName(funcName);
	        cell.setErrProp(errProp);
	        tokenList.setCell(cell);
		}
		tokenList.func = lexeme.value;
		if(!funcName)
			funcName = lexeme.text;
	    tokenList.setName(funcName);
	    tokenList.setTokenType(this.tokenType.FUNCTION_TOKEN);
	    if(lexeme.funcError){
	    	// it can either be unsupport formula error or #NAME? error
	    	tokenList._error = lexeme.funcError;
	    	// when children token list set update, do not need to escalate to this function token's parent
	    	tokenList.setRecalcType(websheet.Constant.RecalcType.IGNORE);
	    	if(cell){
		    	if(tokenList._error == websheet.Constant.ERRORCODE["525"]){
		    		var updateNameToken = websheet.parse.FormulaParseHelper.generateNameToken(funcName, cell);
		    		updateNameToken.setUpdateToken(tokenList);
		    		updateNameToken.setProp(websheet.Constant.RefType.CARE_NAMEDEFINITION);
		    		tokenList.addUpdateRefToken(updateNameToken, cell);
		    	}
	    	}
	    }
	    return tokenList;
	},
	
	
	newBracketToken : function(lexeme)
	{
		var tokenList = new websheet.parse.tokenList();
        tokenList.setTokenType(this.tokenType.BRACKET_TOKEN);
        return tokenList;
	},
	
	newOperatorToken : function(lexeme, leftToken, rightToken)
	{
		var tokenList = new websheet.parse.tokenList();
		//formulaLexer,set id which is locale insensitive, and _math will use this id
		// such as union/intersection operator
		var text = lexeme.id;
		if(!text)
			text = lexeme.text;
		tokenList.setName(text);
		var type = this.tokenType.OPERATOR_TOKEN;
		
		tokenList.func = websheet.functions.FormulaList._math;
		
		if(lexeme.subType == this._LEX_SUBTYPE.OPERATOR_POSTFIX){
			if( text == "%"){
				tokenList.func = websheet.functions.FormulaList._percent;
				type = this.tokenType.PERCENT_TOKEN;
			}
		} else if(lexeme.subType == this._LEX_SUBTYPE.OPERATOR_PREFIX){
			if ( text == "+")
				type = this.tokenType.POSITIVE_TOKEN;
			else
				type = this.tokenType.NEGATIVE_TOKEN;
		}
		tokenList.setTokenType(type);
		if(leftToken)
		{
			tokenList.push(leftToken);
			leftToken.setParent(tokenList);
		}
		if(rightToken)
		{
			tokenList.push(rightToken);
			rightToken.setParent(tokenList);
		}
		if(lexeme.preWS)
			tokenList.preWS = lexeme.preWS;
		return tokenList;
	},
	
	pushTokenList : function( token, parentToken, preWhitespace)
	{
		if(parentToken)
		{
			if(token){
				parentToken.getTokenList().push(token);
				token.setParent(parentToken);
			}
			if(!parentToken.childrenSepWS)
				parentToken.childrenSepWS = [];
			// preWhitespace is the whitespace before the parameter separator or close bracket
			parentToken.childrenSepWS.push(preWhitespace);
		}
	},
	
	newToken : function(lexeme)
	{
		var token = new websheet.parse.token();
		var text = lexeme.text, 
			type = lexeme.type,
			value = lexeme.value, 
			tokenType;
		switch(type)
		{
		case this._LEX_TYPE.STRING_TYPE:
			tokenType = this.tokenType.DOUBLEQUOT_STRING;
			break;
		case this._LEX_TYPE.NUMBER_TYPE:
			tokenType = this.tokenType.NUMBER_TOKEN;
			text = value;
			break;
		case this._LEX_TYPE.ERROR_TYPE:
			token._error = value;
			tokenType = this.tokenType.ERROR_TOKEN;
			break;
		case this._LEX_TYPE.LOGICAL_TYPE:
			tokenType = this.tokenType.BOOLEAN_TOKEN;
			if(value)
				text = "TRUE";
			else
				 text = "FALSE";
			break;
		case this._LEX_TYPE.ARRAY_TYPE:
			tokenType = this.tokenType.ARRAYFORMULA_TOKEN;
			break;
		case this._LEX_TYPE.MISS_PARAM_TYPE:
			value = null;
			tokenType = this.tokenType.NONE_TOKEN;
			break;
		}
      	token.setTokenType(tokenType);
      	token.setValue(value);
      	if(tokenType == this.tokenType.ARRAYFORMULA_TOKEN){
      		//change the text to locale insenstive
      		text = token._serializeConstArray();
      	}
      	token.setName(text);
      	return token;
	},
	
	newRefToken: function(text, parsedRef, cell){
		if(cell)
			return websheet.parse.FormulaParseHelper.generateRefToken(text, parsedRef, cell, true);// check if 3D reference is valid
		else {
			var token = new websheet.parse.RefToken();
			token.setName(text);
			token.setValue(parsedRef);
			token.setRefMask(parsedRef.refMask);
			return token;
		}
	},
	
	newNameToken: function(text, cell){
		if(cell)
			return websheet.parse.FormulaParseHelper.generateNameToken(text, cell);
		else {
			var token = new websheet.parse.RefToken();
			token.setName(text);
			token.setTokenType(this.tokenType.NAME);	
			return token;
		}
	}
	
}