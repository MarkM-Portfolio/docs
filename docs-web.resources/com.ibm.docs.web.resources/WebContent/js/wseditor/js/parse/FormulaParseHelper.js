/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("websheet.parse.FormulaParseHelper");
dojo.require("websheet.Helper");
dojo.require("websheet.Math");
dojo.require("websheet.parse.token");
dojo.require("websheet.parse.tokenList");
dojo.require("websheet.parse.referenceToken");
dojo.require("websheet.parse.FormulaLexer");
dojo.requireLocalization("websheet.parse","FormulaParseHelper");
websheet.parse.FormulaParseHelper = {
		
		Object: websheet.functions.Object,
		tokenType: websheet.parse.tokenType,
		
		getFormulaLexer: function() {
			if(!this.lexer)
				this.lexer = new websheet.parse.FormulaLexer();
			return this.lexer;
		},
		
		getFormulaParser: function() {
			if(!this.formulaParser)
				this.formulaParser = new websheet.parse.FormulaParser();
			return this.formulaParser;
		},
		
		resetLocale: function() {
			var lexer = this.getFormulaLexer();
			lexer.resetBundle();
		},
		
		/**
		 * parse formula or lexeme tokens which is depend on the param bLexTokens
		 * @param input : formula or lexeme tokens
		 * @param bLexTokens: true means input is lexeme tokens, false means input is formula string
		 * @param cell: parse formula for cell
		 */
		parseFormula: function(input, bLexTokens, cell, bLocalSensitive){
			var formulaParser = this.getFormulaParser();
			var result;
			if(bLexTokens)
				result = formulaParser.parseLexemes(input, cell);
			else
				result = formulaParser.parseFormula(input, cell, false, bLocalSensitive);
			if(result.error)
				return result;
			if(cell){
				//tokenArray is already set to cell by formula parser
				var tokenTree = result.tokenTree;
				cell.setCellToken(tokenTree);
				cell._rawValue = result.formula;
			}
			return result;
		},
		
		/**
		 * calculate the formula cell with the given token tree
		 * @param cell
		 * @param tokenList
		 * @param bUpdateAll traverse and calculate every token/tokenList, no matter themselves has update flag or not
		 */
		calcFormula:function(cell, tokenList, calcParams, bCalcUpToBottom){
			if(!tokenList){
				var result = this.parseFormula(cell.getValue(), false, cell);
				if(result.error){
					cell.isParsed = true;
					delete cell._isUnCalc;
					var error = websheet.Constant.ERRORCODE["1002"];//"#ERROR!" user input formula which contains syntax error in the old version
					return {error: error, value: error.message};
				}
				tokenList = result.tokenTree;
			}
			this.currentCell = cell;
			var funcStack = [];
			var argIndexStack = [];
			if(tokenList instanceof websheet.parse.tokenList){
				try{
					if(bCalcUpToBottom)
						 this.calcUpToBottom(tokenList, cell, calcParams, funcStack, argIndexStack);
					else
						 this.calcBottomToUp(tokenList, cell, calcParams, funcStack, argIndexStack);
				} catch(e) {
					// it should be internal error for "too much recursion" in FF, or "stack overflow" in IE
					// we can not calculate such formulas due to the formula token tree's depth is too large
					// and set the calculate value to #VALUE!
					var error = websheet.Constant.ERRORCODE["519"];
					tokenList._error = error;
					tokenList.setValue(error);
					tokenList.setUpdate(false);
					return {error: error, value: error.message};
				}
			}
			var result = this.getFormulaResult(cell, tokenList, true);
			this.currentCell = null;
			return result;
		},

		calcBottomToUp:function(tokenList, cell, calcParams, funcStack, argIndexStack){
			if(tokenList.isUpdate() || tokenList.getValue() == null || calcParams.bUpdateAll){
				var name = tokenList.getName();
				var errProp = websheet.functions.Util.getErrPropByName(name);
				var bIgnoreErr = ((errProp & websheet.Constant.CellErrProp.IGNORE_ERR) > 0);
				
				var tokenListType = tokenList.getType();
				if(tokenListType == this.tokenType.FUNCTION_TOKEN){
					if(tokenList.cell != cell) {
						tokenList.setCell(cell);
						cell.setErrProp(errProp);
					}
			        if(!tokenList.func){
						if(tokenList._error != websheet.Constant.ERRORCODE["1001"]){//name as function name
							var updateNameToken = tokenList.getUpdateRefTokenByParsedRef(name, cell);
							if(!updateNameToken){
								// this is happened when func name is a name, rather than the formula(no matter it is support formula or not
					        	// and the cell is not given when parse formula
								updateNameToken = websheet.parse.FormulaParseHelper.generateNameToken(name, cell);
					    		updateNameToken.setUpdateToken(tokenList);
					    		updateNameToken.setProp(websheet.Constant.RefType.CARE_NAMEDEFINITION);
					    		tokenList.addUpdateRefToken(updateNameToken, cell);
							}
							if(updateNameToken){
								if(updateNameToken.getError() == websheet.Constant.ERRORCODE["525"]){
									tokenList._error = websheet.Constant.ERRORCODE["525"];
								} else
									tokenList._error = websheet.Constant.ERRORCODE["524"];
							}
						}
						tokenList.setValue(tokenList._error);
						return;
			        }
			        funcStack.push(tokenList);
			        argIndexStack.push(0);
				}
				// Iterate children tokens
				var childTokens = tokenList.getTokenList();
				var length = childTokens.length;
				var childUnparseErr = null;
				for(var i = 0; i < length; i++){
					if(tokenListType == this.tokenType.FUNCTION_TOKEN){
						argIndexStack[argIndexStack.length - 1] = i;
					}
					var token = childTokens[i];
					var type = token.getType();
					if(token instanceof websheet.parse.tokenList){
						this.calcBottomToUp(token, cell, calcParams, funcStack, argIndexStack);
					} else {
						// for reference token and name token's error, such as #REF! or #NAME? 
						// is already set when cell.notify
						if((type == this.tokenType.RANGEREF_TOKEN || type == this.tokenType.NAME)
								&& calcParams.bAutofill){
							//autofill cell need use tokenArray of cell to replace the that of the template token tree
							if(token._arrayIndex == undefined){
								console.log("WARNING: autofill formula token should has _arrayIndex");
							}else{
								var tokenArray = calcParams.tokenArray;
								token = childTokens[i] = tokenArray[token._arrayIndex];
							}
						}
						token.setUpdate(false);
					}
					if(token._error){
						if(token._error == websheet.Constant.ERRORCODE["2001"]){
							childUnparseErr = websheet.Constant.ERRORCODE["2001"];
						} else {
							if(!bIgnoreErr){
								tokenList._error = token._error;
								tokenList.setValue(token._error);
								return;
							}
						}
					}
				}
				
				if(tokenListType == this.tokenType.FUNCTION_TOKEN){
					funcStack.pop();
					argIndexStack.pop();
				}
				
				if(tokenListType == this.tokenType.BRACKET_TOKEN){
					if(length == 1){
						tokenList.setValue(childTokens[0].getValue());
						tokenList._error = childTokens[0]._error;
					} else {
						tokenList.setValue(childTokens);
						tokenList._error = websheet.Constant.ERRORCODE["519"];
					}
				} else if(tokenListType == this.tokenType.FUNCTION_TOKEN || tokenListType == this.tokenType.OPERATOR_TOKEN
						|| tokenListType == this.tokenType.NEGATIVE_TOKEN || tokenListType == this.tokenType.POSITIVE_TOKEN
						|| tokenListType == this.tokenType.PERCENT_TOKEN){
					if(childUnparseErr) {
						tokenList._error = childUnparseErr;
						return;
					}
					// here it must be operator or function token list
					var funcObj = tokenList.func;
					if(funcObj){
						var context = {currentToken: tokenList, currentCell:cell, funcStack:funcStack, argIndexStack: argIndexStack};
						var func = dojo.hitch(funcObj, funcObj._calc, context);
						try{
							var result;
							//TODO test func, _math, percent, prefix/postfix operator
							if(length == 0)
								result = func();
							else
								result = func(childTokens);
							tokenList.setValue(result);
							if(result instanceof websheet.parse.tokenBase)
								tokenList._error = result._error;
							else
								tokenList._error = null;
							tokenList.setUpdate(false);
						}catch(e){
							tokenList._error = e;
							if(e != websheet.Constant.ERRORCODE["2001"])
								tokenList.setValue(e);
						}
					}
				}else {
					// 
					console.warn("tokenList for " + tokenList.getName() + "with type " + tokenListType + " have not been calculated");
				}
			}
		},
		
		calcUpToBottom:function(tokenList, cell, calcParams, funcStack, argIndexStack){
			//TODO: need implement token.getValue to recursivly get value
		},
		
		getCurrentParseCell:function(){
			return this.currentCell;
		},
		
		generateTokenByAddress: function(addr, cell){
			var parsedRef = websheet.Helper.parseRef(addr);
			if(parsedRef)
				return this.generateRefToken(addr, parsedRef, cell);
			else {
				return this.generateNameToken(addr, cell);
			}
			return null;
		},
		
		generateRefToken:function(text, parsedRef, cell, bCheck3DRef){
			var token = new websheet.parse.RefToken();
			token.setName(text);
			if(!parsedRef)
				parsedRef = websheet.Helper.parseRef(text);
			token.setValue(parsedRef);
			return this.pushRawRefToken(token, cell, bCheck3DRef);
		},
		
		// bCheck3DRef = true means check the start/end sheet name of 3D reference
		// if they are not valid, use ":" operator sub token tree
		pushRawRefToken:function(token, cell, bCheck3DRef){
			var doc = this.Object.getDocument();
			var areaMgr = doc.getAreaManager();
			var area;
			var parsedRef = token.getValue();
			if (!parsedRef.sheetName) {
				if (cell){
					var sheetName = cell.getSheetName();
					parsedRef.setSheetName(sheetName);
				}
			} else if(parsedRef.endSheetName != null) {
				//check the start/end sheet order
				var startSheet = doc.getSheet(parsedRef.sheetName);
				var endSheet = doc.getSheet(parsedRef.endSheetName);
				if(startSheet && endSheet) {
					if(startSheet.getIndex() > endSheet.getIndex()) {
						var sn = parsedRef.sheetName;
						parsedRef.sheetName = parsedRef.endSheetName;
						parsedRef.endSheetName = sn;
					}
				} else {
					var text = token.getName();
					var sheetPart = text.substring(0, text.lastIndexOf("!"));
					if(/^\'.*\'$/.test(sheetPart)) {
						// if 3D reference contains "'", and sheet name is not exist
						// such as 'Sheet1:Sheet 2'!A1, but Sheet1 or Sheet 2 do not exist
						// we should not split them into two ref
						token.setValue(null);
						token._error = websheet.Constant.ERRORCODE["524"];//#REF!
						return token;
					}
					// invalid 3D reference
					// split 3D reference and create ":" subtree
					if(bCheck3DRef)
						return this._splitInvalid3DReference(token, cell);
				}
			}
			
			var bQuickFormula = (cell == null);
			if (!bQuickFormula)
				area = areaMgr.startListeningArea(parsedRef, cell);
			else {
				area = new websheet.parse.Reference(parsedRef, "dummyId");
			}
			token.setValue(area);
			token.setRefMask(parsedRef.refMask);
				
			if(!area || !area.isValid()){
				if(area && (area.getParsedRef().refMask & websheet.Constant.RefAddressType.INVALID_SHEET) > 0)
					token.setRefMask(websheet.Constant.RefAddressType.INVALID_SHEET, true);
				token._error = websheet.Constant.ERRORCODE["524"];//#REF!
			} else if (!bQuickFormula) {
				cell.pushRef(token, true);
			}
			return token;
		},
		
		_splitInvalid3DReference: function(token, cell) {
			var parsedRef = token.getValue();
			var name = parsedRef.sheetName;
			parsedRef.sheetName = parsedRef.endSheetName;
			parsedRef.endSheetName = null;
			var leftToken = websheet.parse.TokenGenerator.newNameToken(name, cell);
			var text = token.getName().slice(name.length + 1);
			var rightToken = websheet.parse.TokenGenerator.newRefToken(text, parsedRef, cell);
			var tokenIndex = token.getIndex();
			if(tokenIndex != null) {
				leftToken.setIndex(tokenIndex);
				rightToken.setIndex(tokenIndex + name.length + 1);// 1 for ":" length
			}
			
			var operatorLexeme = {text: ":",
								type:websheet.parse.FormulaLexer.prototype.TOKEN_TYPE.OPERATOR_TYPE};
			var operatorToken = websheet.parse.TokenGenerator.newOperatorToken(operatorLexeme, leftToken, rightToken);
			if(cell && !cell.getCellToken()) {
				// cell don't have token tree yet, it means the cell is predicting autofill pattern
				return operatorToken;
			}
			// if cell has token tree, we should udpate the token tree
			var pToken = token.getParent();
			if(pToken) {
				var childTokens = pToken.getTokenList();
				var length = childTokens.length;
				var childUnparseErr = null;
				for(var i = 0; i < length; i++){
					var child = childTokens[i];
					if(child == token){
						childTokens[i] = operatorToken;
						operatorToken.setParent(pToken);
						return operatorToken;
					}
				}
			} else if (cell){
				//check if cell =3DReference, if so should change the cell's root token tree
				if (cell.getCellToken() == token) {
					cell.setCellToken(operatorToken);
					return operatorToken;
				}
			}
			return token;
		},
		
		generateNameToken: function(name, cell) {
			var token = new websheet.parse.RefToken();
			token.setName(name);
			token.setTokenType(this.tokenType.NAME);
			if(cell)
				this.pushRawNameToken(token, cell);
			return token;
		},
		
		pushRawNameToken:function(token, cell){
			var doc = this.Object.getDocument();
			var areaMgr = doc.getAreaManager();
			var name = token.getName();
			var area = areaMgr.startListeningNameArea(name, cell);
	        if(area){
				token.setValue(area);
				token.setName(area.getId());
				if (area.getUsage() == websheet.Constant.RangeUsage.NAME) {
					if(!area.isValid())
						token._error = websheet.Constant.ERRORCODE["524"];
				} else {
					 token.setValue(area);
	           		 token._error = websheet.Constant.ERRORCODE["525"];//#NAME!
				}
				cell.pushRef(token, true);
	        }
	        return token;
		},
		
		generateRefTokenByCopyToken: function(token, newRef, cell, fromTokenTree){
			var newToken = new websheet.parse.RefToken();
			dojo.mixin(newToken, token);
			if(token.getTokenType() == websheet.parse.tokenType.NAME){
				var area = newToken.getValue();
				area.addListener(cell);
			}else{
				var ref = null;
				if(newRef == null){
					ref = token.getValue();
					newRef = ref.getParsedRef();
				}
				var doc = this.Object.getDocument();
				var areaMgr = doc.getAreaManager();
				ref = areaMgr.startListeningArea(newRef, cell, ref);
				
				newToken.setValue(ref);
			}
			cell.pushRef(newToken, fromTokenTree);
			return newToken;
		},
		
		/**
		 * Generate the update token for the given token with updateAddress
		 * delete the old update token and push this new update token to current cell
		 * if the update token address is not changed, do nothing
		 * @param token
		 * @param updateParsedRef parsedRef type or string for name
		 * @param sheetName
		 * @param currentCell
		 */
		/*websheet.parse.UpdateRefToken*/generateUpdateToken:function(token, updateParsedRef, sheetName, cell, bCheckExist)
		{
			if(!token || !updateParsedRef)
				return null;
			
			var updateRefToken;
			
			if(bCheckExist){
				if ( updateRefToken = token.getUpdateRefTokenByParsedRef(updateParsedRef, cell) )
					return updateRefToken;
			}
			
			var doc = this.Object.getDocument();
			var areaMgr = doc.getAreaManager();
			updateRefToken = new websheet.parse.UpdateRefToken();
			var area;
			// for name
			if(dojo.isString(updateParsedRef)){
				var name = updateParsedRef;
				area = areaMgr.startListeningNameArea(name, cell);
			} else {
				// for parsedRef
				if (!updateParsedRef.sheetName) {
					if (!sheetName) {
						if (cell && cell instanceof websheet.model.Cell)
							sheetName = cell._getSheet().getSheetName();
					}
					updateParsedRef.setSheetName(sheetName);
				}
				
				area = areaMgr.startListeningArea(updateParsedRef, cell);
				updateRefToken.setRefMask(updateParsedRef.refMask);
			}
			
			updateRefToken.setValue(area);
			
			cell.pushRef(updateRefToken, false);//not in token tree
			
			updateRefToken.setUpdateToken(token);
			token.addUpdateRefToken(updateRefToken, cell);
			return updateRefToken;
		},
		

		/**
		 * Get the formula value according to the tokenTree's value and error
		 */
		getFormulaResult:function(cell, tokenList, bCheckPartialLoading)
		{
			var error, value;
			if(tokenList._error){
				error = tokenList._error;
			}else
			{
				try{
					value = this.fetchScalaResult(tokenList, true, false, cell);
					if(value && value.errorCode)
						error = value;
					// fetchScalaResult return null when cell content is =choose(1, )
					if(value == null) value = 0;
				}catch(e){
					error = e;
				}
			}
			if(error && !value)
				value = error.message;
			
			if(this.Object.JS && cell){
				var doc = cell._doc;
				var mhelper = websheet.model.ModelHelper;
				var pcm = mhelper.getPartialCalcManager();
				var tm = doc._taskMgr;
				var cm = doc._calcManager;
				if(!doc.isDeepParsing)
				{
					if(error &&error.errorCode == 2001)
					{
						cell._isUnCalc = true;//note that isParsed still be true
						var calcManInstance = null;
						var sId = null;
						if(tm._current){
							var scope = tm._current.scope;
							if(scope && scope._addF){
								calcManInstance = scope;
								sId = tm._current.args[0];
							}
						}
						if(!calcManInstance)
							calcManInstance = pcm;
						calcManInstance._addF(cell, sId);
						
						value = cell.getValue();
						return {error: null, value: value};
					}
				}
				delete cell._isUnCalc;
				doc.getAreaManager().removeFromFormulaTrack(cell);//incase it is called by getCalculateValue for formula show value
			}
			return {error: error, value: value};
		},		
		
		/**
		 * Throw error if the given value contains error(value._error)
		 * It is different with anaylzeResult which will not throw error
		 * @param bNonZero True  means not treat empty cell as 0
		 *			If you do not want treat the value as number, should set bNonZero=true
		 * @param ignoreIntersect  used for set the status which control whether the function will ignore the effect of "the Intersection of currentCell and its rangeCell"
		 */
		fetchScalaResult:function(/*websheett.functions.Token*/value, singleCell,bNonZero, currentParsedCell, parentToken,ignoreIntersect){
			if (this.Object.isToken(value)) {
				parentToken = value;
				if (value.getType() == this.tokenType.NAME) {
					var error = value.getError();
					if (error) 
						throw error;
				}
			}
			var result = this.analyzeResult(value);
			
			if(singleCell == undefined)
			   singleCell = false;
			
			if (this.isRangeObj(result)) {
				if(!result.isValid()) {
					value._error = websheet.Constant.ERRORCODE["524"];
					throw value._error;
				} else if(value._error == websheet.Constant.ERRORCODE["524"]) {
					delete value._error;
				}
				var result = this.getScalaCell(result,false,parentToken,ignoreIntersect);	
				//if the cell is error, throw it directly, otherwise get the calculate value
				if(result) {
					if(result == currentParsedCell && this.Object.JS)//in A1 set "=A1"
					{
						var doc = currentParsedCell._doc;
//						if(doc.isLoading && !doc.isDeepParsing)//in this senaria, cell._checkCR will not be excecute
						if(!doc.isDeepParsing)
							throw websheet.Constant.ERRORCODE["522"];
					}
					// check if whether the cell is dirty
					var v = result.getComputeValue();
					var err = result.getError();
					if (err) {
						if (err.errorType == websheet.Constant.ErrorType.UNSUPPORTFORMULA)
							throw websheet.Constant.ERRORCODE["1003"];
						else
							throw err;
					}
					
					var bNumber = result.isNumber();
					if (bNumber && this.isNum(v))
						v = parseFloat(v);
					else if(!v){//v == ""
						//only for the empty cell, do this
						//otherwise, no matter bNonZero=true or not, still set v=""
						//for example, value is the formula cell with "" as calculate value
						v = "";
						if(!bNonZero && (result.getValue() === ""))
							v = 0;
					}
					if(result.isBoolean())
						result = Boolean(v);
					else
						result = v;
				} else{
					if(value._error)
						throw value._error;
					if(bNonZero)
						result = "";	
					else
						result=0;
				}
			} else if (dojo.isArray(result)) {
				if(ignoreIntersect){
					if (result.length >= 1)
						result= this.fetchScalaResult(result[0],singleCell,bNonZero,null,value,ignoreIntersect);
				}else{
					if (this.isRangeObj(result[0])) {
						if (result.length == 1)
							result= this.fetchScalaResult(result[0],singleCell,bNonZero,null,value,ignoreIntersect);	
						else if (singleCell)
							throw websheet.Constant.ERRORCODE["519"];
					} else {
						result = result[0];
						if (dojo.isArray(result))
							result = result[0];
					}
				}
			}
			
			else if(value != null){
				//always throw error if token._error is null when fetchScalaResult
				//but never throw error in analyzeResult because some ignore error formula
				//also use analyzeResult to get the calculate value and need to deal with the token._error in formula implementation
				var err = value._error;
				if (err && err.errorCode != 2001) {
					//here the value must not be the reference
					//so even it is unsupport error, throw it directly, rather than throw #VALUE!
					//because it must be a function which using the unsupport formula name
					throw err;
				}
			}
			// result may be an error object in const-array or error in ingore error function(if)
			if (result && result.errorCode != undefined)
				throw result;
			return result;
		},
		
		/**
		 * Get the corresponding cell for a formula calculate 
		 * If reference is single cell, return the cell
		 * If reference is single column range, return the cell having the same rowid with current cell
		 * If reference is single row range, return the cell having the same colid with current cell
		 * If sheet name of reference and current cell are not the same, if they have only one cell intersection
		 * otherwise, throw error
		 * @param area
		 * @param bIgnoreError
		 * @param token
		 * @param ignoreIntersect
		 * @returns
		 */
		getScalaCell:function(/*websheet.functions.Reference*/area,bIgnoreError, token,ignoreIntersect){
			if(!this.Object.isArea(area))	
				return null;
			if( area.is3DArea()) {
				throw websheet.Constant.ERRORCODE["524"];
			} 
			var curCell = this.getCurrentParseCell();
			if(area.isSingleCell() || curCell instanceof websheet.model.RulesObject.DummyFormulaCell)
				return area.getCell(0,0,true,bIgnoreError);
			
		    var curColIndex = curCell.getCol();
		    var curRowIndex = curCell.getRow();
		    
		    var rangeInfo = area._getRangeInfo();
		    var startCol = rangeInfo.startCol;
		    var endCol = rangeInfo.endCol;
		    var startRow = rangeInfo.startRow;
		    var endRow = rangeInfo.endRow;
		    var rangeSheetName = rangeInfo.sheetName;
		    if(ignoreIntersect)
	    	    return area.getCell(0,0, true,bIgnoreError);  
		    var returnCell = null;
		    var bNotSameSheet = false;
		    var curSheetName = curCell.getSheetName();

		    if(curSheetName != rangeSheetName)
		    	bNotSameSheet = true;
		    var bMatch = false;
		    if (startCol == endCol && curRowIndex >= startRow && curRowIndex <= endRow){
		    	bMatch = true;
		    	returnCell = area.getCell(curRowIndex - startRow , 0 , true,bIgnoreError);
		    	curColIndex = startCol;
		    }else if (startRow == endRow && curColIndex >= startCol && curColIndex <= endCol){
		    	bMatch = true;
		    	returnCell = area.getCell(0 , curColIndex - startCol , true,bIgnoreError);
		    	curRowIndex = startRow;
		    }else if(startCol <= curColIndex && endCol >= curColIndex 
	    			&& startRow <= curRowIndex && endRow >= curRowIndex){
	    		if(bNotSameSheet){
		    		bMatch = true;
		    		returnCell = area.getCell(curRowIndex - startRow , curColIndex - startCol , true,bIgnoreError);
		    	}else{
		    		//in the same sheet should return #Err522! first,rather than #VALUE!
		    		if( (curCell.getErrProp() & websheet.Constant.CellErrProp.IGNORE_RECURSIVE) == 0)
		    			throw websheet.Constant.ERRORCODE["522"];
		    	}
		    }
		    
		    if(this.Object.isToken(token)){
		    	var parsedRef;
		    	if(bNotSameSheet){
		    		// the current cell position
					parsedRef = new websheet.parse.ParsedRef(curSheetName, curRowIndex, curColIndex, curRowIndex, curColIndex, websheet.Constant.RANGE_MASK);
					var updateToken = this.generateUpdateToken(token,parsedRef,sheetName, curCell, true);
					updateToken.setProp(websheet.Constant.RefType.CAREPOSITION);
				}
		    	
		    	if(bMatch){
					//generate update token for the scala cell
					var sheetName = bNotSameSheet ? rangeSheetName : curSheetName;
					parsedRef = new websheet.parse.ParsedRef(sheetName, curRowIndex, curColIndex, curRowIndex, curColIndex, websheet.Constant.RANGE_MASK);
					var updateRefToken = this.generateUpdateToken(token,parsedRef,sheetName, curCell, true);
					token.setProp(websheet.Constant.RefType.IGNORESET);
					
					//even the current cell position changed, it can be triggered to recalc for scala cell which reference is not in the same sheet with current cell
					if(bNotSameSheet){
						updateRefToken.setProp(websheet.Constant.RefType.CAREPOSITION);
					}
				} else {
					if(bNotSameSheet){
						//return #VALUE!, but when the current cell position change or referred reference position change, the cell need to recalc
						token.setProp(websheet.Constant.RefType.CAREPOSITION);
					}
				}		
			}
		    if(bMatch){//even returnCell is null
		    	return returnCell;
		    }
		    throw websheet.Constant.ERRORCODE["519"];
		},
		
		/**
		 * Tell if the object is either range model, cell reference token or range reference token
		 */
		/*boolean*/isRangeObj: function(object){
			if (!object) return false;
			
			if (this.Object.isArea(object))
				return true;

			if (this.Object.isFormulaToken(object)) {
			   var type = object.getType();
			   if (type == this.tokenType.RANGEREF_TOKEN || 
				    type == this.tokenType.NAME && !object.getError())   
					return true;
			}
			
			return false;
		},

		/**
		 * Tell if 'value' is number or not,
		 * use number recognizer to determine it if it is one locale sensitive number
		 * @params	bLocaleNumString		true if 'value' is one locale sensitive number
		 */
		/*boolean*/isNum: function(/*websheet.functions.Cell*/value, bLocaleNumString){
			//if value is the cell object
			if (this.Object.isCell(value))
				return value.isNumber();
			
			if(bLocaleNumString) {
				var parseResult = websheet.i18n.numberRecognizer.parse(value);
				return parseResult.isNumber;
			}
	        if(typeof value == "number")
	        	return true;
			
			if(websheet.Helper.numeric.test(value)) {
				var tmpValue = parseFloat(value);			
				if(!isNaN(tmpValue) && isFinite(tmpValue)) 
					return true;
				return false;
			}
			
			return false;
		},
		
		/**
		 * get and return CalculateValue which is not token or tokenlist
		 */
		_getInnerCalculateValue: function(result) {
			while (websheet.functions.Object.isToken(result)) {
				result = result.getValue();
			}
			return result;
		},

		/**
		 * analyze result the parser get,then return the real result.Maybe it is a
		 * websheet.parse.tokenList,or some other type, we only want to get the
		 * calculative result to join the next calculation.
		 * 
		 * @param {Object}
		 *            result
		 */
		analyzeResult: function(/*websheet.functions.Token*/result, bThrowError) {
			if (websheet.functions.Object.isToken(result)) {
				var err = result._error;
				if(err){
					if(err.errorCode == 2001 || bThrowError)
						throw err;
				}
				return this._getInnerCalculateValue(result);
				
				return calculateValue;
			}
			return result;
		},
		
		containFunction: function(funcName, token) {
			if(this.Object.isFormulaTokenList(token)){
				var name = token.getName();
				if(name.toUpperCase() == funcName)
					return true;
				var list = token.getList();
				return this.containFunction(funcName, list);
			} else if(dojo.isArray(token)){
				for(var i = 0; i < token.length; i++){
					var t = token[i];
					var bContain = this.containFunction(funcName, t);
					if(bContain)
						return true;
				}
			}
			return false;
		},
		
		/**
		 * According to the current locale, return the parameter separators, which should be "," or ";"
		 */
		getArgSepByLocale:function()
		{
			var editor = websheet.model.ModelHelper.getEditor();
			var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", editor.scene.getLocale());
			var decimal = bundle["decimal"];
			if(decimal == ",")
			{
				return websheet.Constant.TokenStr.ODF.ARG_SEP;
			}else
				return websheet.Constant.TokenStr.XLS.ARG_SEP;
		},
		
		/**
		 * According to the current locale, return the parameter separators of constant-array, which should be "." or ","
		 */
		getArraySepByLocale:function()
		{
			var editor = websheet.model.ModelHelper.getEditor();
			var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", editor.scene.getLocale());
			var decimal = bundle["decimal"];
			if(decimal == ",")
				return ".";
			else
				return ",";
		},
		
		isFormula: function(str)
		{
			return (str && str.length > 1 && (str.indexOf("=") == 0));
		},
		
		_cachedTokens: null, // the cached formula text and its corresponding formula token
		
		enableCache: function ()
		{
			this._cachedTokens = {};
		},
		
		disableCache: function ()
		{
			delete this._cachedTokens;
			this._cachedTokens = null;
		},
		
		isCacheEnabled: function ()
		{
			return this._cachedTokens != null;
		},
		
		/**
		 * return ReferenceToken  list of formula
		 * Different with RefToken, the value is parsedRef, not area/Reference
		 */
		parseTokenList: function(formula){
			var lexer = this.getFormulaLexer();
			if(this.isCacheEnabled()){
				var tokenList = this._cachedTokens[formula];
				if(tokenList)
					return tokenList;
			}
			var tokenList = [];
			var lexTokens = lexer.parseToken(formula);
			for(var idx = 0; idx < lexTokens.length; idx ++)
			{
				var lexToken = lexTokens[idx];
				
				if(lexToken.type == lexer.TOKEN_TYPE.REFERENCE_TYPE){
					var parsedRef = lexToken.value;
					if(parsedRef){
						var tokenType ="range";
						if(parsedRef.getType() == websheet.Constant.RangeType.CELL)
							tokenType = "cell";
							
						var token =  new websheet.parse.referenceToken();
						token.setType(tokenType);
						token.setText(lexToken.text);
						token.setChangedText(parsedRef.getAddress());//TODO: MS format or ods format
						token.setRef(parsedRef);
						token.setIndex(lexToken.start);
						tokenList.push(token);
					}
				}
			}
			if (this.isCacheEnabled()) {
				this._cachedTokens[formula] = tokenList;
			} 
			return tokenList;
		},
		
		/** 
		 * Extract the substring from formula according to token index arr and instantiate them as refToken list
		 */
		getTokenList: function(formula, tarr){
			var tokenList = [];
			for (var i = 0; i < tarr.length; i++) {
				var arrToken = tarr[i];
				var from = arrToken[0];
				var to = arrToken[1];
				var text = formula.substring(from, to);
				var parsedRef = websheet.Helper.parseRef(text);
				if(parsedRef)
				{
					var tokenType ="range";
					if(parsedRef.getType() == websheet.Constant.RangeType.CELL)
						tokenType = "cell";
						
					var token =  new websheet.parse.referenceToken();
					token.setType(tokenType);
					token.setText(text);
					token.setChangedText(parsedRef.getAddress());//TODO: MS format or ods format
					token.setRef(parsedRef);
					token.setIndex(from);
					tokenList.push(token);
				}
			}
			return tokenList;
		},
		
		/**
		 * return the updated formula according to the refTokenList changes
		 * @param formula
		 * @param refTokenList
		 * @param tokenarr
		 */
		updateFormula: function(formula, tokenList, tarr){
			if(!tokenList || tokenList.length == 0) return formula;
			var result = [];
			var start = 0;
			
			if(tarr == null){
				for(var i = 0; i < tokenList.length; i++)
				{
					var token = tokenList[i];
					var end = token.getIndex();
		            var length =  token.getText().length;
		        	var tmpStr = formula.substring(start,end);
		        	result.push(tmpStr);
		        	result.push(token.getChangedText());
		        	start = end + length;
				}
			}else{
				var size = 0;
				for(var i = 0; i < tokenList.length; i++)
				{
					var token = tokenList[i];
					var end = token.getIndex();
		            var length =  token.getText().length;
		        	var tmpStr = formula.substring(start,end);
		        	result.push(tmpStr);
		        	size += tmpStr.length;
		        	var ts = size;
		        	var changedText = token.getChangedText();
		        	result.push(changedText);
		        	size += changedText.length;
		        	var te = size;
		        	var t = [ts, te];
		        	tarr[i] = t;
		        	start = end + length;
				}
				tarr.splice(tokenList.length);
			}
			var lastStr = formula.substring(start,formula.length);
	        result.push(lastStr);
	        
	        var newFormula = result.join("");
	        return newFormula;
		},
		
		showErrorDlg:function(lexError, parseError)
		{
			var nls = dojo.i18n.getLocalization("websheet.parse","FormulaParseHelper");
			var msg = dojo.string.substitute(nls.COMMON_ERROR_INFO);
			var start = end = 0;
			if(lexError){
				var errorToken = lexError.errorToken;
				if(errorToken){
					start = errorToken.start;
					end = errorToken.end;
				}
			}
			//TODO: give user error hint for different error code
//			if(lexError){
//				var errorCode = lexError.error;
//				switch(errCode){
//				}
//			}
			var callbk = dojo.hitch(this, "_setInputFocus", start, end);
			var dlg = new concord.widgets.MessageBox(null, nls.TITLE, nls.OK_LABEL, false, {message:msg, callback:callbk});
			dlg.show();
		},
		
		_setInputFocus:function(start, end)
		{
			var editor = websheet.model.ModelHelper.getEditor();
			var grid = editor.getCurrentGrid();
			var inlineEditor = editor.getController().getInlineEditor();
			if (inlineEditor && inlineEditor.isEditing()){
				setTimeout(function(){
					inlineEditor.focus();
					inlineEditor.setSelectionRange(start, end);
				}, 400);
			}
		},
		

		//////////////////////////////////////////////////////////////////
		/////////////AUTOFILL FORMULA PREDICTION//////////////////////////
		/**
		 * check if the current formula
		 */
		/*Boolean*/predictFormula:function(cell, af){
			if(!cell || !af){
				return null;
			}
			if(!af.col)
				af.col = {};
			
			var STATUS = websheet.Constant.FormulaPredictStatus;
			var colstatus = STATUS.NONE;
			var colResult, collexemes;
			var rowstatus = STATUS.NONE;
			var rowResult, rowlexemes;
			var bFormula = cell.isFormula();
			if(bFormula){
				colResult = this._predictPattern(cell, null, af, false);
				colstatus = colResult.status;
				collexemes = colResult.lexemes;
				
				rowResult = this._predictPattern(cell, colResult, af, true);
				rowstatus = rowResult.status;
				rowlexemes = rowResult.lexemes;
			}
			this._updateCellStatus(cell, af, colstatus, collexemes, false);
			this._updateCellStatus(cell, af, rowstatus, rowlexemes, true);
			return {lexemes: collexemes || rowlexemes, error: colResult.error || rowResult.error};
		},
		
		/*websheet.Constant.FormulaPredictStatus*/_predictPattern:function(cell, cellParseResult, af, bRow){
			var STATUS = websheet.Constant.FormulaPredictStatus;
			var status = STATUS.NONE;
			var preCell = null;
			var preCellLexemes, lexemes;
			if(bRow) {
				var row = af.row;
				if(row){
					status = row.status;
					preCell = row.cell;
					preCellLexemes = row.lexemes;
				}
			} else {
				var col = af.col[cell.getColId()];
				if(col){
					status = col.status;
					preCell = col.cell;
					preCellLexemes = col.lexemes;
				}
			}
			
			switch(status){
			case STATUS.NONE:
			case STATUS.PARSE:
				var parseResult = null;
				if(cellParseResult && (cellParseResult.lexemes || cellParseResult.error) ){
					parseResult = cellParseResult;
				} else {
					var formulaParser = this.getFormulaParser();
					parseResult = formulaParser.parseFormula(cell.getValue(), null, true);
				}
				if(parseResult.error){
					return {status: STATUS.NONE, lexemes: null, error: parseResult.error};
				}
				lexemes = parseResult.lexemes;
				if(status == STATUS.NONE){
					status = STATUS.PARSE;
				} else {
					// predict if these adjacent cell has the same lexeme
					if(lexemes && preCellLexemes && (lexemes.length == preCellLexemes.length)){
						status = STATUS.PREDICT;
					} else
						status = STATUS.PARSE;
				}
				return {status: status, lexemes: lexemes};
			case STATUS.PREDICT:
				var preCell = this._isPreFCell(cell, preCell, bRow);//bSameCol or same row
				if(preCell){
					var autofillResult = this.matchLexemes(cell._rawValue, preCellLexemes);
					if(autofillResult.autofill){
						cell.clearRefs();
						var lexemeRefs = autofillResult.lexemeRefs;
						var tokenArray = [];
						for(var i = 0; i < lexemeRefs.length; i++){
							var token;
							var lexemeRef = lexemeRefs[i];
							var refText = lexemeRef[0];
							var ref = lexemeRef[1];
							var index = lexemeRef[2];
							if(ref) {// it is reference 
								// while it might be 3D reference, should check 3D reference is valid or not
								var b3D = ref.is3D();
								token = this.generateRefToken(refText, ref, cell, true);
								if(b3D && (token instanceof websheet.parse.tokenList) ) {
									// 3D reference is invalid, and has been splited to two ref tokens
									var childs = token.getTokenList();
									var leftToken = childs[0];
									var rightToken = childs[1];
									leftToken._arrayIndex = tokenArray.length;
									leftToken.setIndex(index);
									tokenArray.push(leftToken);
									rightToken._arrayIndex = tokenArray.length;
									rightToken.setIndex(index + leftToken.getName().length + 1);
									tokenArray.push(rightToken);
									continue;
								}
							} else { //name
								token = this.generateNameToken(refText, cell);
							}
							token._arrayIndex = tokenArray.length;
							token.setIndex(index);
							tokenArray.push(token);
						}
						
						cell._tokenArray = tokenArray;
						preCell._bAfPat = true;//incase the token tree has been modified when regerate formula
						var tokenTree = preCell.getCellToken();
						//for formula =A1, the token tree is a token, rather than a tokenList, so they do not need to share the same token tree
						if(tokenArray.length == 1 && (tokenTree instanceof websheet.parse.token)){
							cell.setCellToken(tokenArray[0]);
						}else
							cell.setCellToken(tokenTree);//share the same token tree
						cell._bAfPat = true;//it should replace all the range tokens
						cell.isParsed = true;
						cell._isUnCalc = true;
						cell.setErrProp(preCell.getErrProp());
						lexemes = preCellLexemes;
						cell._rawValue = "=" + tokenTree.serialize(cell).rawValue;
						status = STATUS.PREDICT;
					} else
						status = STATUS.NONE;
				}
				return {status: status, lexemes: lexemes};
			}
			return {status: STATUS.NONE, lexemes: null};
		},
		
		matchLexemes:function(formula, lexemes){
			var preRefToken = null;
			var refTokenIndex = 1;
			var bAutofill = true;
			var refTokens = [];
			var lexer = this.getFormulaLexer();
			if (lexemes.length > 0 && lexemes[lexemes.length-1].end != formula.length)
			{
				// 50010, if first cell is =+Daten!X40, following cell is =+Daten!X41+Daten!X43
				// there will be error. so ignore length not equal ones.
				return {autofill:false, lexemeRefs: refTokens};
			}
			for(var i = 0; i < lexemes.length; i++){
				var lexeme = lexemes[i];
				if(lexeme.type != lexer.TOKEN_TYPE.REFERENCE_TYPE){
					var index = formula.indexOf(lexeme.text, lexeme.start);
					if(index != lexeme.start){
						bAutofill = false;
						break;
					}
					if(lexeme.type == lexer.TOKEN_TYPE.NAME_TYPE){
						refTokens.push([lexeme.text, null, index]);
					}
					if(preRefToken){
						var refText = formula.substring(refTokenIndex, index);
						var ref = websheet.Helper.parseRef(refText);
						// such as preCell is =ISERR(TEXT!A1) , and current cell =ISERROR(1==2), they are not the same pattern
						if(ref == null){
							bAutofill = false;
							break;
						}
						refTokens.push([refText, ref, refTokenIndex]);
					}
					refTokenIndex = index + lexeme.end - lexeme.start;
					preRefToken = null;
				} else {
					preRefToken = lexeme;
				}
			}
			if(bAutofill){
				//last reference
				if(preRefToken){
					var refText = formula.substring(refTokenIndex);
					var ref = websheet.Helper.parseRef(refText);
					if(ref)
						refTokens.push([refText,ref, refTokenIndex]);
					else
						bAutofill = false;
				}
			}
			return {autofill:bAutofill, lexemeRefs: refTokens};
		},
		
		_updateCellStatus:function(cell, af, status, lexemes, bRow){
			var STATUS = websheet.Constant.FormulaPredictStatus;
			if(status == undefined)
				status == STATUS.NONE;
			if(bRow){
				if(lexemes)
					af.row = {status: status, cell: cell, lexemes: lexemes};
				else
					delete af.row;
			} else {
				var colId = cell.getColId();
				if(lexemes)
					af.col[colId] = {status: status, cell: cell, lexemes: lexemes};
				else
					delete af.col[colId];
			}
				
		},
		
		_isPreFCell:function(cell, preCell, bRow){
			if(bRow){
				if(preCell && preCell.getRowId() == cell.getRowId()){//same row
					if((preCell.getCol() + 1) == cell.getCol()){//adjacent column
						return preCell;
					}
				}
			}else{
				if(preCell && preCell.getColId() == cell.getColId()){//same col
					if((preCell.getRow() + 1) == cell.getRow()){//adjacent column
						return preCell;
					}
				}
			}
			return null;
		}
		/////////////////////////////////////////////////////////////////////////
		/////////////END OF AUTOFILL FORMULA PREDICTION//////////////////////////
		
};
