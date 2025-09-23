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

dojo.provide("websheet.parse.tokenList");
dojo.require("websheet.parse.tokenBase");
dojo.require("websheet.functions.FormulaTranslate");
dojo.declare("websheet.parse.tokenList", websheet.parse.tokenBase, {
	cell:null,
	tokenList:null,							//its children
	/*array*/getList: function() {
		return this.getTokenList();
	},
	
	setCell:function(cell) {
		this.cell = cell;
	},
	
	setTokenList:function(tokenList){
		this.tokenList = tokenList;
	},
	
	getTokenList:function(){
		if(!this.tokenList){
			this.tokenList = new Array();
		}
		return this.tokenList;
	},
	
	push:function(token){
		this.getTokenList().push(token);
		if(token && token._error)
			this._error = token._error;
	},
	
	setUpdate:function(bUpdate, params)
	{
		if(bUpdate) {
			if(!this.func && this.getType() != this.tokenType.BRACKET_TOKEN){
				// unsupport or name
				if(params && (params.enableNameRange != undefined)){
					if(this._parent)
						this._parent.setUpdate(true);
				}
				return;
			}
		}
		this.inherited(arguments);
	},
	
	/**
	 * construct the formula string
	 */
	serialize:function(cell, bLocaleSensitive){
		var sepChar = ",";
		if(bLocaleSensitive)
			sepChar = websheet.parse.FormulaParseHelper.getArgSepByLocale();
		this.isSerializeErr = false;
		var formula = "";
		var isArray = false;//if it is array formula
		var tokenType = this.getTokenType();
		var preWS = this.preWS;
		if(!preWS)
			preWS = "";
		var sepWSList = this.childrenSepWS;
		if(!sepWSList)
			sepWSList = [];
		if(tokenType == this.tokenType.FUNCTION_TOKEN){
			//TODO: if the formula is #NAME input by Gemarny locale
			// De: SUMME TO SUMME,SUM TO SUMME,ABC TO null
			// En: SUMME TO null,SUM to SUM,ABC to null
			var func_name;
			if(bLocaleSensitive && this._error != websheet.Constant.ERRORCODE["525"])
				func_name = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(this.getName());
			if(!func_name)
				func_name = this.getName();
			formula += preWS + func_name + "(";
			formula += dojo.hitch(this,"recursiveList")(cell, this.getTokenList(), sepWSList, bLocaleSensitive, sepChar, formula.length); 
			formula += ")";
			// if the formula is ignore #REF error,
			// we need to reset the err_flag to notify calculate in cell's regenerate formula.
			var errProp = websheet.functions.Util.getErrPropByName(this.getName());
			if(errProp & websheet.Constant.CellErrProp.IGNORE_ERR_REF){
				this.isSerializeErr = null; // reset the error
			}
		}else if(tokenType == this.tokenType.OPERATOR_TOKEN){
			var name = this.getName();
			if(name == "~"){
				if(sepChar == websheet.Constant.TokenStr.ODF.ARG_SEP)
					name = websheet.Constant.TokenStr.ODF.ARG_SEP;
				else
					name = websheet.Constant.TokenStr.XLS.ARG_SEP;
			}
			else if(name == "!")
				name = " ";
			formula +=dojo.hitch(this,"recursiveList")(cell, this.getTokenList()[0], [], bLocaleSensitive,sepChar, formula.length);
			formula += preWS + name;
			formula += dojo.hitch(this,"recursiveList")(cell, this.getTokenList()[1], [], bLocaleSensitive,sepChar, formula.length);
		}else if(tokenType == this.tokenType.ARRAY_TOKEN){
			formula +=dojo.hitch(this,"recursiveList")(cell, this.getTokenList()[0], [], bLocaleSensitive,sepChar, formula.length);
			isArray = true;
		}else if(tokenType == this.tokenType.NEGATIVE_TOKEN){
			formula += preWS + "-";
			formula += dojo.hitch(this,"recursiveList")(cell, this.getTokenList()[0],sepWSList, bLocaleSensitive, sepChar, formula.length);
        }else if(tokenType == this.tokenType.POSITIVE_TOKEN){
			formula += preWS + "+";
			formula += dojo.hitch(this,"recursiveList")(cell, this.getTokenList()[0],sepWSList, bLocaleSensitive, sepChar, formula.length);
        }else if(tokenType == this.tokenType.BRACKET_TOKEN){
        	formula += preWS + "("; 
			formula += dojo.hitch(this,"recursiveList")(cell, this.getTokenList(),sepWSList, bLocaleSensitive, sepChar, formula.length);
        	formula += ")";
		}else if(tokenType == this.tokenType.PERCENT_TOKEN){
			formula += dojo.hitch(this,"recursiveList")(cell, this.getTokenList(),sepWSList, bLocaleSensitive, sepChar, formula.length) + preWS + '%';
        }
		else{
			formula +=dojo.hitch(this,"recursiveList")(cell, this.getTokenList(),sepWSList, bLocaleSensitive,sepChar, formula.length);
		}
		return {"rawValue":formula,"isError":this.isSerializeErr,"isArray":isArray};
	},
	
	/**
	 * recursive the token tree
	 * @param {object}tokenList		token tree
	 * @return {Node|String}		token serialize or html node
	 */
	recursiveList:function(cell, tokenList, sepWSlist, bLocaleSensitive, sepChar, length){
		//indent with blank
		var formula = "";
		var tempList = tokenList;
		if(!dojo.isArray(tokenList)){
			tempList = new Array();
			tempList.push(tokenList);
		}
		dojo.forEach(tempList,function(item, index){
			var sepWS = sepWSlist[index];
			if(!sepWS)
				sepWS = "";
			var preWS = item.preWS;
			if(!preWS)
				preWS = "";
			
			var itemSepWSList = item.childrenSepWS;
			if(!itemSepWSList)
				itemSepWSList = [];
			if(dojo.isArray(item)){
				formula += preWS + "{" ;
				
				formula += dojo.hitch(this,"recursiveList")(cell, item, itemSepWSList, bLocaleSensitive,sepChar, length + formula.length);
				formula += "}" + sepWS + sepChar;
			} else if (websheet.functions.Object.isFormulaTokenList(item)) {
				var tokenType = item.getTokenType();
				if(tokenType == this.tokenType.FUNCTION_TOKEN){
					var func_name;
					if(bLocaleSensitive)
						func_name = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(item.getName());
					if(!func_name)
						func_name = item.getName();
					formula += preWS + func_name + "(";
					formula += dojo.hitch(this,"recursiveList")(cell, item.getTokenList(),itemSepWSList, bLocaleSensitive, sepChar, length + formula.length); 
					formula += ")" + sepWS + sepChar;
					// if the formula is ignore #REF error,
					// we need to reset the err_flag to notify calculate in cell's regenerate formula.
					var errProp = websheet.functions.Util.getErrPropByName(item.getName());
					if(errProp & websheet.Constant.CellErrProp.IGNORE_ERR_REF){
						this.isSerializeErr = null; // reset the error
					}
				}else if(tokenType == this.tokenType.OPERATOR_TOKEN){
					var name = item.getName();
					if(name == "~"){
						if(sepChar == websheet.Constant.TokenStr.ODF.ARG_SEP)
							name = websheet.Constant.TokenStr.ODF.ARG_SEP;
						else
							name = websheet.Constant.TokenStr.XLS.ARG_SEP;
					}
					else if(name == "!")
						name = " ";
					formula +=dojo.hitch(this,"recursiveList")(cell, item.getTokenList()[0], [], bLocaleSensitive, sepChar, length + formula.length)
					formula += preWS + name;
					formula += dojo.hitch(this,"recursiveList")(cell, item.getTokenList()[1], [], bLocaleSensitive, sepChar, length + formula.length);
					formula += sepWS + sepChar;
				}else if(tokenType == this.tokenType.BRACKET_TOKEN){
					formula += preWS + "(";
					formula += dojo.hitch(this,"recursiveList")(cell, item.getTokenList(), itemSepWSList, bLocaleSensitive, sepChar, length + formula.length);
					formula += ")";
					formula += sepWS + sepChar;
				}else if(tokenType == this.tokenType.NEGATIVE_TOKEN){
					formula += preWS + "-";
					formula += dojo.hitch(this,"recursiveList")(cell, item.getTokenList(),itemSepWSList, bLocaleSensitive, sepChar, length + formula.length);
					formula += sepWS + sepChar;
				}else if(tokenType == this.tokenType.POSITIVE_TOKEN){
					formula += preWS + "+";
					formula += dojo.hitch(this,"recursiveList")(cell, item.getTokenList(),itemSepWSList, bLocaleSensitive, sepChar, length + formula.length);
					formula += sepWS + sepChar;
				}else if(tokenType== this.tokenType.ARRAYFORMULA_TOKEN){
					formula += "{";
					formula += dojo.hitch(this,"recursiveList")(cell, item.getTokenList(),itemSepWSList, bLocaleSensitive, sepChar, length + formula.length);
					formula+="}"+ sepWS + sepChar;
				}else if(tokenType== this.tokenType.PERCENT_TOKEN){
					formula += dojo.hitch(this,"recursiveList")(cell, item.getTokenList(),itemSepWSList, bLocaleSensitive, sepChar, length + formula.length);
					formula += preWS + "%"+ sepWS + sepChar;
				}
				else{
					formula +=dojo.hitch(this,"recursiveList")(cell, item.getTokenList(),itemSepWSList, bLocaleSensitive, sepChar, length + formula.length);
				}
			}else if (websheet.functions.Object.isFormulaToken(item)) {	
					var result = item.serialize(cell, bLocaleSensitive);
					formula += preWS;
					var tokenType = item.getTokenType();
					if((tokenType == this.tokenType.RANGEREF_TOKEN || tokenType == this.tokenType.NAME)
						&&!bLocaleSensitive){
						var tt = item;
						if(cell._bAfPat){
							tt = cell._tokenArray[tt._arrayIndex];
							if(tt == undefined){
								tt = item;
								console.log("WARNING: regenerate formula for autofill pattern cells");
							}
						}
						tt.setIndex(length + formula.length + 1);//formula do not contains '=', so here need +1
					}
					formula += result.rawValue;
					if(result.isError){
						this.isSerializeErr = true;
					}
					formula += sepWS + sepChar;
			}
		},this);
		formula = this._removeSepChar(formula, sepChar);
		if(sepWSlist.length > 0 && tempList.length == 0){
			// for no param function, but it contains whitespace in bracket, =today(  ), 
			var ws = sepWSlist[0];
			if(ws)
				formula += ws;
		}
		return formula;
	},
	
	_removeSepChar:function(formula, sepChar)
	{
		if(formula.length > 1 && formula.charAt(formula.length - 1) == sepChar){
			formula = formula.substring(0, formula.length - 1);
		}
		
		return formula;
	},
	
	getFormat: function() {
		var token;
		var list = this.getTokenList();
		var tokenType = this.getTokenType();
		var type;
		var format = null;
		
		// if this token is dynamically created by using CONCATENATION or INTERSECT operators,
		// return its format directly. don't iterate through the tokenList
		var cv = this.getValue();
		if(dojo.isArray(cv)){
			cv = cv[0];
			if((websheet.functions.Object.isReference(cv)) && cv.isValid()) {
				return websheet.Helper.getTokenFormat(cv);
			}
		}
		
		if(tokenType == this.tokenType.PERCENT_TOKEN && this.cell)
			this.cell._isPercent = true;
		if (tokenType == this.tokenType.FUNCTION_TOKEN) {
			type = websheet.functions.Util.getFormatTypeByName(this.getName());
			if(list instanceof websheet.parse.tokenList)
				list = list.getTokenList();
		} else if (tokenType == this.tokenType.OPERATOR_TOKEN ||
				   tokenType == this.tokenType.BRACKET_TOKEN) {
		    if(this._name == ":")
		    	return null;
			type = websheet.Constant.FormatType["GENERAL"];
		}else if(tokenType == this.tokenType.ARRAY_TOKEN){
			// one workaround is to put top-level token into array_token
			// in order to put cell reference to array_token in scenario like '=A1'
			type = websheet.Constant.FormatType["GENERAL"];
		}
		
		if (type) {
			if (type != websheet.Constant.FormatType["GENERAL"])
				return websheet.i18n.Number.getDefaultFormatForShowValue(type);
			else {
				var len = list.length;
				//get a format from tokenlist using depth first
				for(var i = 0; i< len; i++){
					format = list[i].getFormat();
					if (format) break;
				}
			}
		}
		return format;
	},
	
	//return the reference tokens of this token
	getReferenceToken:function() {
		var tokens = [];
		var pToken = this;
		while(pToken.getType() == this.tokenType.BRACKET_TOKEN){
			pToken = pToken.getList()[0];
		}
		var result = pToken.getValue();
		while (websheet.functions.Object.isToken(result)) {
			pToken = result;
			result = pToken.getValue();
		}
		if(websheet.parse.FormulaParseHelper.isRangeObj(result)){
			if(websheet.functions.Object.isFormulaToken(pToken)){
				tokens.push(pToken);
			}else{
				console.log("the reference should be contained in token");
			}
		} else if(dojo.isArray(result) && websheet.parse.FormulaParseHelper.isRangeObj(result[0])){
			var length = result.length;
			for(var i=0; i<length; i++){
				var t = result[i];
				if(websheet.functions.Object.isToken(t)){
					tokens.push(t);
				}else{
					console.log("the reference should be contained in token");
				}
			}
		}
		return tokens;
	},
	
	//return the array of reference tokens which have been set prop;
	setProp:function(prop, bOverWrite){
		var tokens = this.getReferenceToken();
		for(var i = 0; i < tokens.length; i++) {
			var token = tokens[i];
			token.setProp(prop, bOverWrite);
		}
	},
	
	removeProp:function(prop){
		var tokens = this.getReferenceToken();
		for(var i = 0; i < tokens.length; i++) {
			var token = tokens[i];
			token.removeProp(prop);
		}
	}

});