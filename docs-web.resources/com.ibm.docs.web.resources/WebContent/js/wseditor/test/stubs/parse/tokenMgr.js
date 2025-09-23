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
 * This token manager administer all formula tokens generation used for JS Parser and Native Parser. 
 */
dojo.provide("websheet.test.stubs.parse.tokenMgr");
dojo.provide("websheet.parse.tokenMgr");

dojo.declare("websheet.parse.tokenMgr", null, {
	
	tokenType: websheet.parse.tokenType,
	/**
	 * Generate the token tree to calculate using an tokenJson structure by Native parser engine.
	 * Native parser engine only parse syntax tree without any business logic so that client side 
	 * need to care about token's _error and so on.
	 * original value: 1-2*3
	 * input value: 1-(2*3)
	 * @param tokenJson  : structure :
	 * {_token:"-",_type:2,tokenList:
	 * 			[
	 * 				{_token:"()",_type:11,tokenList:
	 * 					[{
	 * 						_token:"*",_type:2,tokenList:
	 * 							[
	 * 							{_token:"2",_type:9},
	 * 							{_token:"3",_type:9}
	 * 							]
	 * 					}]},
	 * 				{_token:"1",_type:9}
	 * 			 ]}
	 * 
	 * {_token:"-",_type:2,tokenList:[{_token:"()",_type:11,tokenList:[{_token:"*",_type:2,tokenList:[{_token:"2",_type:9},{_token:"3",_type:9}]}]},{_token:"1",_type:9}]}
	 * @param cell
	 * @param sheetName
	 * @param result
	 * @returns
	 */
	generateTokenTree:function(tokenJson,cell,sheetName,result,bracketList){
		var node;
		// normally it's tokenList with tList
		if(tokenJson.tList != null){
			var tList = tokenJson.tList;
			var tokens = [];
			for(var i=0,tl;tl=tList[i];i++){
				tokens[i] = this.generateTokenTree(tl,cell,sheetName,result,bracketList);
			}
			node = this._generateTokenList(tokenJson, tokens, cell, result, bracketList);
		}else{ // token and Percent tokenList
			node = this._generateToken(tokenJson, cell, sheetName, result);
		}
		return node;
	},
	
	/**
	 * generate each token(one percent tokenList) instance and set the calculation.
	 * Validation: set the token's _error on client side but not native side 
	 * @param tokenJson
	 * @param cell
	 * @param sheetName
	 * @returns
	 */
	_generateToken:function(tokenJson,cell,sheetName,result){
		var item;
		var str = tokenJson._token;
		switch (tokenJson._type){
		case this.tokenType.INT_TOKEN:
			item = this.newIntToken(str);
			break;
		case this.tokenType.NUMBER_TOKEN:
			item = this.newNumberToken(str);
			if(item._error)
				result.errMsg = item._error;
			break;
		case this.tokenType.PERCENT_TOKEN:
			item = this.newPercentTokenList(str, cell);
			if(item._error)
				result.errMsg = item._error;
			break;
		case this.tokenType.DOUBLEQUOT_STRING:
			item = this.newDoubleQuoteStrToken(str);
			break;
		case this.tokenType.SINGLEQUOT_STRING:
			item = this.newSingleQuoteStrToken(str);
			break;
		case this.tokenType.RANGEREF_TOKEN:
			item = this.newRefToken(str, cell, sheetName);
			if(item._error)
				result.errMsg = item._error;
			break;
		case this.tokenType.NAME:
			item = this.newNameRangeToken(str, cell);
			if(item._error)
				result.errMsg = item._error;
			break;
		case websheet.parse.tokenType.NONE_TOKEN:
			item = this.newNoneToken();
			break;
		default:
			item = new websheet.parse.token();
			item._error = websheet.Constant.ERRORCODE["1002"]; // #ERROR , unknown tokenType,pls check the Parser.
			if(item._error)
				result.errMsg = item._error;
			break;
		}
		return item;
	},
	
	_generateTokenList:function(tokenJson,tokens,cell,result,bracketList){
		var item;
		var errMsg = result.errMsg;
		var str = tokenJson._token;
		switch (tokenJson._type){
		case this.tokenType.ARRAY_TOKEN:
			item = this.newArrayTokenList(tokens[0],cell);
			break;
		case this.tokenType.PERCENT_TOKEN:
			item = this.newModeTokenList(tokens[0],str,cell);
			break;
		case this.tokenType.OPERATOR_TOKEN:
			item = this.newOperatorTokenList(str, cell, tokens, errMsg);
			if(item._error)
				result.errMsg = item._error;
			break;
		case this.tokenType.POSITIVE_TOKEN:
		case this.tokenType.NEGATIVE_TOKEN:
			item = this.newPosNegtiveTokenList(tokens[0], str, cell, errMsg);
			if(item._error)
				result.errMsg = item._error;
			break;
		case this.tokenType.BRACKET_TOKEN:
			item = this.newBracketTokenList(tokens[0], tokenJson.idx, cell, errMsg, bracketList);
			if(item._error)
				result.errMsg = item._error;
			break;
		case this.tokenType.FUNCTIONPARMAS_TOKEN:
			item = this.newFuncParamsTokenList(tokens,cell);
			break;
		case this.tokenType.ARRAYFORMULA_TOKEN:
			item = this.newArrayFormulaTokenList(tokens[0], cell, errMsg);
			if(item._error)
				result.errMsg = item._error;
			break;
		case this.tokenType.FUNCTION_TOKEN:
			item = this.newFuncTokenList(tokens[0], str, cell, errMsg);
			if(item._error){
				result.errMsg = item._error;
            }else if(item._error == null) // reset the errMsg for some formula which need to ignore error
            	result.errMsg = null;
			break;
		}
		
		return item;
	},
	
	/**
	 * basic operator calculation
	 */
	/*tokenList*/calcOperator:function(tempToken,rightToken,errMsg,cell){
	  var result = rightToken;
	  var errProp = cell.getErrProp();
	  var isIgnoreErrorFormula = (errProp & websheet.Constant.CellErrProp.IGNORE_ERR)>0;
	  if(tempToken.length != 0){
          var len = tempToken.length;
          if(tempToken[len - 1] != "("){
        	  var opName = tempToken[len - 1].getName();
              if (opName == "<" || opName == ">" || opName == "<=" || opName == ">="
            	  ||opName == "%=" || opName == "*=" || opName == "/=" || opName == "+=" || opName == "-="
            	  ||opName == "!=" || opName == "<>" || opName == "="
            	  ||opName == "+" || opName == "-" || opName == "&"
            	  ||opName == "*" || opName == "/" || opName == ":"
            	  ||opName == "^" ||opName == "~" ||opName == "!"){
                  var operator = tempToken.pop();
                  var leftToken = tempToken.pop();
                  operator.getList().push(leftToken);
                  leftToken.setParent(operator);
                  operator.getList().push(rightToken);
                  rightToken.setParent(operator);
                  //if(!(errMsg && errMsg.errorCode == 2001))
                  {
                	  var bUnParse = (errMsg && errMsg.errorCode == 2001);
                      if(!errMsg || (isIgnoreErrorFormula) || bUnParse){
                    	  try{
                              operator.setValue(websheet.parse.parseHelper.getMathResult(cell, operator,leftToken,rightToken, isIgnoreErrorFormula));
                              operator._error = null;
                          }catch(e){
                              //errMsg = e;
                              //if(!(errMsg && errMsg.errorCode == 2001))
                                  operator._error = e;
                          }
                      }else{
                    	  if(!bUnParse)
                        	operator._error = errMsg;
                      }
                  }
                  result = operator;
              }
          }
      }
	  
	  return result;
	},
	
	/**
	 * | INT
	 * @param str
	 * @returns {websheet.parse.token}
	 */
	/*token*/newIntToken:function(str){
		var token = new websheet.parse.token();
		token.setName(str);
		token.setTokenType(this.tokenType.INT_TOKEN);
		token.setValue(parseFloat(str));
		return token;
	},
	
	/**
	 * | NUMBER
	 * @param str
	 */
	/*token*/newNumberToken:function(str){
      	if(str)
      		str = str.replace(/[ ]+/ig,"");
      	var token = new websheet.parse.token();
      	token.setName(str);
      	token.setTokenType(this.tokenType.NUMBER_TOKEN);
      	// set #VALUE if string contains any unnormal space
      	if(str.indexOf('\u00A0') != -1 || str.indexOf('\u3000') != -1){
      		token._error = websheet.Constant.ERRORCODE["519"]; //#VALUE
      		token.setValue(str);
      	}else{
      		token.setValue(parseFloat(str));
      	}
      	
      	return token;
	},
	
	/**
	 * n=('+'|'-'){this.formula += $n.text;}(b=atom)
	 * @param token
	 * @param str
	 * @param cell
	 * @param errMsg
	 * @returns {___tokenList1}
	 */
	/*tokenList*/newPosNegtiveTokenList:function(token,str,cell,errMsg){
	    var tokenList = new websheet.parse.tokenList();
		tokenList.setCell(cell);
		tokenList.setName(str);
		tokenList.setName(str);
		if(str == '+')
			tokenList.setTokenType(this.tokenType.POSITIVE_TOKEN);
		else
			tokenList.setTokenType(this.tokenType.NEGATIVE_TOKEN);
		token.setParent(tokenList);
		tokenList.push(token);
			
		var errProp = cell.getErrProp();
		var isIgnoreErrorFormula = (errProp & websheet.Constant.CellErrProp.IGNORE_ERR) > 0;
		var bUnParse = (errMsg && errMsg.errorCode == 2001);
        if(!errMsg || (isIgnoreErrorFormula) || bUnParse){
            try{
            	if (str === "+")
            		tokenList.setValue(token.getValue());
            	else
            		tokenList.setValue( websheet.parse.parseHelper.getMathResult(cell, tokenList,null,token, isIgnoreErrorFormula));
            }catch(e){
               	tokenList._error = e;
            }
        } else {
            if(!bUnParse)
            	tokenList._error = errMsg;
        }
		 
	    return tokenList;		
	},
	

	/**
	 * MODE
	 * generate PERCENT tokenlist with token like A1%,(1+3)%%
	 * @param token
	 * @param str
	 * @param cell
	 * @returns
	 */
	/*tokenList*/newModeTokenList:function(token,str,cell){
		var tokenList = new websheet.parse.tokenList();
		try{
		tokenList.setCell(cell);
    	tokenList.setName(str);
    	tokenList.setName(str);
    	tokenList.setTokenType(this.tokenType.PERCENT_TOKEN);
    	tokenList.push(token);
    	token.setParent(tokenList);
    	
    	var rawValue = websheet.functions.Formulas.getFunc("_percent")([token]);
    	
    	tokenList.setValue(rawValue);
		}catch(e){
            tokenList._error = e;
//          if(!(this.errMsg && this.errMsg.errorCode == 2001))
//         	 tokenList._error = e;
       }
    	return tokenList;
	},
	
	/**
	 * | PERCENT
	 * generate PERCENT tokenlist with INT/NUMBER like 3.2%,10%
	 * @param str
	 * @param cell
	 * @returns {___modeToken1}
	 */
	/*tokenList*/newPercentTokenList:function(str,cell){
		var regexp=/%+/;
	    var matcher = str.match(regexp);
	    var idx=str.indexOf('%');
	    var value=str.substring(0,idx);
	    value = value && value.replace(/[ ]+/ig,"");
	    var token = new websheet.parse.token();
	    var tokenList;
	    token.setName(value);
	    // set #VALUE if string contains any unnormal space
	    if(value.indexOf('\u00A0') != -1 || value.indexOf('\u3000') != -1){
	      	token._error = websheet.Constant.ERRORCODE["519"]; //#VALUE
	      	token.setValue(value);
	    }else{
	    	token.setValue(parseFloat(value));
	    }
	    token.setTokenType(this.tokenType.NUMBER_TOKEN);
	    if(matcher && matcher[0]){
			var num=matcher[0].length; 
			for(var i=0;i<num;i++){
				tokenList = new websheet.parse.tokenList();
				tokenList.setCell(cell);
	      		tokenList.setName('%');
	      		tokenList.setName(str);
	      		tokenList.setTokenType(this.tokenType.PERCENT_TOKEN);
	      		if(token._error){
	      			tokenList.setValue(value);
	      			tokenList._error = token._error; // set the % operator tokenlist error
	      		}else{
		      		var rawValue = parseFloat(token.getValue() + '%');     
	    	  		tokenList.setValue(websheet.Math.div(rawValue, 100));
	      		}
	      		tokenList.getList().push(token);
	      		token = tokenList;     		
			}
	    }
	    
	    return tokenList;
	},
	
	/**
	 * | DOUBLEQUOT_STRING
	 * @param str
	 * @returns {websheet.parse.token}
	 */
	/*token*/newDoubleQuoteStrToken:function(str){
	    var token = new websheet.parse.token();
	    var text = str.substring(1,str.length-1);
	    token.setName(text);
	    token.setTokenType(this.tokenType.DOUBLEQUOT_STRING);
	    var calValue = text;
	    calValue = calValue.replace(/""/g,"\"");
	    token.setValue(calValue);
	    return token;
	},
	
	/**
	 * SINGLEQUOT_STRING
	 * @param str
	 * @returns {websheet.parse.token}
	 */
	/*token*/newSingleQuoteStrToken:function(str){
		var token = new websheet.parse.token();
		var value = str.substring(1,str.length-1);
        token.setName(value);
        token.setTokenType(this.tokenType.SINGLEQUOT_STRING);
        token.setValue(value);
        return token;
	},
	
	/**
	 * P_OPEN P_CLOSE
	 * @param token
	 * @param sIndex
	 * @param cell
	 * @param errMsg
	 * @param bracketList
	 * @returns {___tokenList3}
	 */
	/*tokenList*/newBracketTokenList:function(token,sIndex,cell,errMsg,bracketList){
		var tokenList = new websheet.parse.tokenList();
		tokenList.setCell(cell);
        tokenList.push(token);
        token.setParent(tokenList);
        tokenList.setTokenType(this.tokenType.BRACKET_TOKEN);
        for (var i = 0,v; v = bracketList[i]; i++) {
        	if (v == sIndex) {
        		tokenList.setRedundant(true);
        		break;
        	}
        }
        var errProp = cell.getErrProp();
        var isIgnoreErrorFormula = (errProp & websheet.Constant.CellErrProp.IGNORE_ERR) > 0;
        //if(!(errMsg && errMsg.errorCode == 2001))
        {
            var bUnParse = (errMsg && errMsg.errorCode == 2001);
        	if(!errMsg || bUnParse || isIgnoreErrorFormula){
        		try{
        			tokenList.setValue(websheet.Helper.analyzeResult(token));
        		}catch(e){
        			tokenList._error = e; //it must be 2001 unparse error
        		}
        }else{
        	if(!bUnParse)
        		tokenList._error = errMsg;
        }
        }
        return tokenList;
	},
	
	/**
	 * 
	 * @param token
	 * @param cell
	 * @returns
	 */
	/*tokenList*/newArrayTokenList:function(token,cell){
		var tokenList = new websheet.parse.tokenList();
		tokenList.setCell(cell);
      	tokenList.setTokenType(this.tokenType.ARRAY_TOKEN);
      	token.setParent(tokenList);
      	tokenList.setValue(token.getValue());
      	tokenList.push(token);
      	
      	return tokenList;
	},
	
	/**
	 * 
	 * @param str
	 * @param cell
	 * @returns
	 */
	/*tokenList*/newOperatorTokenList:function(str,cell,token,errMsg){
		var tokenList = new websheet.parse.tokenList();
		tokenList.setCell(cell);
		 tokenList.setName(str);
		 tokenList.setName(str);
		 tokenList.setTokenType(this.tokenType.OPERATOR_TOKEN);
		 if(token){ // Native parser
			for(var i=0,v;v=token[i];i++){
				tokenList.push(v);
				v.setParent(tokenList);
			}
			/**
			 * Native parser only create the json tree for operator but don't calculate so that
			 * it need to setCalculate here for operator like the JS Parser.
			 */
			var errProp = cell.getErrProp();
			var isIgnoreErrorFormula = (errProp & websheet.Constant.CellErrProp.IGNORE_ERR) > 0;
			var bUnParse = (errMsg && errMsg.errorCode == 2001);
            if(!errMsg || (isIgnoreErrorFormula) || bUnParse){
                try{
                	tokenList.setValue( websheet.parse.parseHelper.getMathResult(cell, tokenList,token[0],token[1], isIgnoreErrorFormula));
                }catch(e){
                	tokenList._error = e;
                }
            }else{
            	if(!bUnParse)
            		tokenList._error = errMsg;
            }
		 }
		 
		 return tokenList;
	},
	
	/**
	 * 
	 * @returns {websheet.parse.token}
	 */
	/*token*/newNoneToken:function(){
		 var token = new websheet.parse.token();
         token.setTokenType(this.tokenType.NONE_TOKEN);
         token.setName(" ");
         return token;
	},
	
	/**
	 *  : a=atom_type
	 * @param token
	 * @param cell
	 * @returns
	 */
	/*tokenList*/newFuncParamsTokenList:function(token,cell){
		var tokenList = new websheet.parse.tokenList();
		tokenList.setCell(cell);
		tokenList.setTokenType(this.tokenType.FUNCTIONPARMAS_TOKEN);
		tokenList.setValue(tokenList.getList());
		if (dojo.isArray(token)){
			for(var i=0,v;v=token[i];i++){
			 tokenList.push(v);
			 v.setParent(tokenList);
		 }
		}else{ // for js parser
			 tokenList.push(token);
			 token.setParent(tokenList);
		}
		return tokenList;
	},
	
	// convert element of constant array
	getConstantArrayObject: function(tokenList, sourceToken) {
		var tokenCount = tokenList.getTree().getChildCount();
		var token;
		var value;
		if (!tokenCount) {
			token = tokenList.getTree().getName();
			value = token.getText();
		} else if (tokenCount == 2){
			//+/- number (+1, -1.5), not ++1, --1.5 or 1+2
			var tokens = tokenList.getTree().getChildren();
			var opeToken = tokens[0].getName();
			token = tokens[1].getName();
			if ((opeToken.type == sourceToken.MINUS || opeToken.type == sourceToken.PLUS)
					&& (token.type == sourceToken.INT || sourceToken.NUMBER)) {
				value = opeToken.getText() + token.getText();
			} else {
				throw websheet.Constant.ERRORCODE["512"];
			}
		} else {
			throw websheet.Constant.ERRORCODE["512"];
		}
		
		switch (token.type) {
			case sourceToken.INT:
			case sourceToken.NUMBER:
				value = parseFloat(value);
				break;
			case sourceToken.NAME:
				var text = value.toUpperCase();
				// just for imported from ods, {abc,1} can't be input by MS-office and docs edit
				if (text == "TRUE")
					value = true;
				else if (text == "FALSE")
					value = false;
				else
					throw websheet.Constant.ERRORCODE["512"];
				break;
			case sourceToken.ERRORNAME:
				var text = value.toUpperCase();
				value = websheet.parse.parseHelper.getErrorObj(text);
				break;
			case sourceToken.DOUBLEQUOT_STRING:
				// ""4"" -> "4", "" in string should be replaced by "
				var text = value.substring(1, value.length-1);
				value = text.replace(/""/g,"\"");
				break;
			default:
				throw websheet.Constant.ERRORCODE["512"];
		}
		return value;
	},
	
	/**
	 * CONATANT_ARRAY
	 * @param firToken		: the first token of constant-array
	 * @param sep	  		: seperate token 1D(";") or 2D("|")
	 * @param token	  		: other token
	 * @param sourceToken	: source token list which generated by .g
	 * @returns {websheet.parse.token}
	 * value of token is a array(1D or 2D), it can be float(number), string(string), errorObject(error name), boolean(true/false)
	 */	  	
	/*token*/newConstantArrayToken:function(array, text){
		var token = new websheet.parse.token();
		token.setTokenType(this.tokenType.ARRAYFORMULA_TOKEN);
		token.setName(text);
        token.setValue(array);
        return token;
	},
	
	/**
	 * ARRAY_FORMULAR_START ARRAY_FORMULAR_END
	 * @param token  FUNCTIONPARMAS_TOKEN token contains all items
	 * @param cell
	 * @param errMsg
	 * @returns {___tokenList4}
	 */
	/*tokenList*/newArrayFormulaTokenList:function(token,cell,gErrMsg){
		var tokenList = new websheet.parse.tokenList();
		tokenList.setCell(cell);
		tokenList.push(token);
		tokenList.setTokenType(this.tokenType.ARRAYFORMULA_TOKEN);
		token.setParent(tokenList);
        /**
         * validate the item in the formula array, size and item type
         */ 
        var items = token.getList();
        var errMsg = null;
		if(items.length > websheet.Constant.MaxArrayFormula){
        	errMsg = tokenList._error = token._error = websheet.Constant.ERRORCODE["519"]; //#VALUE
        }else{
            for(var i=0,v;v=items[i];i++){
         	   var tokenType = v.getType();
                if(tokenType != this.tokenType.POSITIVE_TOKEN && tokenType != this.tokenType.NEGATIVE_TOKEN
                	&& tokenType != this.tokenType.INT_TOKEN && tokenType != this.tokenType.NUMBER_TOKEN
                	&& tokenType != this.tokenType.DOUBLEQUOT_STRING && tokenType != this.tokenType.BOOLEAN_TOKEN){
                	errMsg = tokenList._error = token._error = v._error = websheet.Constant.ERRORCODE["519"]; //#VALUE
                	break;
                }
            }
        }
        
        //if(!(errMsg && errMsg.errorCode == 2001))
        {
            var bUnParse = (errMsg && errMsg.errorCode == 2001);
            if(!errMsg || bUnParse){
            	try{
            		tokenList.setValue(websheet.Helper.analyzeResult(token));
            	}catch(e){
            		tokenList._error = e; //it must be 2001 unparse error
            	}
            }else{
            	if(!bUnParse)
            		tokenList._error = errMsg;
            }
        }
        
        return tokenList;
	},
	
	/**
	 * 
	 * @param str
	 * @param cell
	 * @param sheetName
	 * @param formula
	 * @param idx	the token index of the new update formula
	 * @param oriIndex the token index of the original formula which might contains unnecessary whitespace
	 * @returns
	 */
	
	/*token*/newRefToken:function(str,cell,sheetName,idx, oriIndex){
	    var token = websheet.parse.parseHelper.generateToken(str, sheetName, cell);
	    var type = token.getType();
	    if (type == this.tokenType.RANGEREF_TOKEN || type == this.tokenType.NAME){
	    	//TODO: how to get the ref's index on Native Side?
	    	// token index used to update the rawValue of cell when the cell haven't parse and runtime autofill.
	    	if(idx){
	    		token.setIndex(idx);
	    		if(oriIndex != undefined && idx != oriIndex )
	    			token._oriIndex = oriIndex;//used by autofill pattern predict
	    		token._arrayIndex = cell._tokenArray.length;//_arrayIndex is used for autofill pattern formulas
	   			cell._tokenArray.push(token);
	    	}
	    }else {//Test:B1, A1:Test:B1
	    	this._colonRefIdx = idx;
	    	this._pushColonRefs(token, cell);
	    	delete this._colonRefIdx;
	    }
	    return token;
	},
	
	_pushColonRefs:function(token,cell){
		var type = token.getType();
		if(type == this.tokenType.OPERATOR_TOKEN && token.getName() == ":"){//Test:B1, A1:Test:B1
	    	var tokenList = token.tokenList;
	    	var len = tokenList?tokenList.length:0;
	    	if(len != 2){
	    		console.warn("the operator token \":\" should only has two child tokens for token " + token.getName());
	    		return token;
	    	}
	    	for(var i = 0; i < len; i++){
	    		var tk = tokenList[i];
	    		var type = tk.getType();
	    	    if (type == this.tokenType.RANGEREF_TOKEN || type == this.tokenType.NAME){
	    	    	if(this._colonRefIdx){
	    	    		tk.setIndex(this._colonRefIdx);
	    	    		this._colonRefIdx = this._colonRefIdx + tk.getName().length + 1;//":".length = 1
	    	    		tk._arrayIndex = cell._tokenArray.length;//_arrayIndex is used for autofill pattern formulas
	    	    		cell._tokenArray.push(tk);
	    	    	}
	    	    }else
	    	    	this._pushColonRefs(tk, cell);
	    	}
	    }
	},
	/**
	 * 
	 * @param token
	 * @param str
	 * @param cell
	 * @param errMsg
	 * @returns {___tokenList5}
	 */
	/*token*/newFuncTokenList:function(token,str,cell,errMsg){
		//TODO: remove _xlfn prefix for formula name
		 var sName = websheet.functions.Util.getFormulaL2S(str) || str;
         var errProp = websheet.functions.Util.getErrPropByName(sName);
         cell.setErrProp(errProp);
         var errPropAll = cell.getErrProp();
 		 var tokenList = new websheet.parse.tokenList();
		 tokenList.setCell(cell);
	     tokenList.setName(sName);
	     tokenList.setName(sName);
	     tokenList.setTokenType(this.tokenType.FUNCTION_TOKEN);
         if(token){
        	 tokenList.setTokenList(token);
        	 token.setParent(tokenList);
         }
         //if(!(errMsg && errMsg.errorCode == 2001))
         {
           var bUnParse = (errMsg && errMsg.errorCode == 2001); 
           if(!errMsg ||( errPropAll & websheet.Constant.CellErrProp.IGNORE_ERR )||bUnParse){ // for all children of function token need to calculate even error happened.
             try{
            	 var context = {currentToken: tokenList, currentCell:cell};
            	 if(token)
            		 tokenList.setValue(websheet.functions.Formulas.getFunc(sName, context)(websheet.Helper.analyzeResult(token)));
            	 else
            		 tokenList.setValue(websheet.functions.Formulas.getFunc(sName, context)());
            	 tokenList._error = null;
             }catch(e){
                 tokenList._error = e;
//                 if(!(this.errMsg && this.errMsg.errorCode == 2001))
//                	 tokenList._error = e;
             }
           }else{
        	   if(!bUnParse)
        		   tokenList._error = errMsg;
           }
         }
         
         return tokenList;
	},
	
	/**
	 * 
	 * @param str
	 * @param cell
	 * @returns {websheet.parse.token}
	 */
	/*token*/newNameRangeToken:function(str,cell){
	   var token = new websheet.parse.RefToken();
	   token.setName(str);
       token.setTokenType(this.tokenType.NAME);
       var doc = websheet.functions.Object.getDocument();
       var areaMgr = doc.getAreaManager();
       var ref = areaMgr.getRangeByUsage(str,websheet.Constant.RangeUsage.NAME);
       if(ref){
	        token.setName(ref.getId());
	        token.setValue(ref);
	        if(!ref.isValid())
	             token._error = websheet.Constant.ERRORCODE["524"];
	        cell.pushRef(token, true);
       }else{
             token.setValue(str);
             token._error = websheet.Constant.ERRORCODE["525"];
       }
       
       return token;
	}
});