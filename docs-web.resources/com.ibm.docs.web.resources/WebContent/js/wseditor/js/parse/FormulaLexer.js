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
dojo.provide("websheet.parse.FormulaLexer");
dojo.require("websheet.i18n.Number");
dojo.declare("websheet.parse.FormulaLexer", null, {

					// test plan
					// Sheet1!A1(dd) function name is reference, it return #REf!
					// Sheet1!A:A(E12), Sheet1!A(1E12)
					// SUM([1]Sheet1!$A$1)
					// all error code
					// =Sheet1!A1:(E12):D4 Sheet1!A1:A:A Sheet1!1:1 D:D, defect
					// for row/column reference, and test:A1:A2
					// a:1 a:1:1 1:a:a Sheet1!A:a:a Sheet1!A:1:1 a:a#ef
					// a!A1! a!!A1
					// Sheet1!A if A is the name range defined in sheet1, it is
					// valid, of cource Sheet1!A:A is prior than Sheet1!A
					// int
					// 3D reference =SUM(Sheet1:Sheet3!A1:A2), it is different
					// with =SUM(Sheet1!A1:Sheet3!A2) which return #VALUE!
					// =a:B!A:B if a and b is not the sheet name, then treat it
					// as (a):(B!A:B)
					// if a1 and b1 is sheet name , a1:b1!a1:b1, then it is not
					// 3D, but (a1):(b1!A1:b1)
					// only limited formula suppport 3D reference
					// TODO: not set a!A1 to #REF!A1( not #REF!.A1), check xlsx
					// what it stores in draft
					// indirect(A1:B2):A1:B2
					// C : C
					// avergeifs(A1) , abc(A1), A:A(A1) A1(A1) true(A1)
					// SUM(A1,) params missing =index(A1:C3 , , 2) =now( ),
					// =now() and check the functiontoken.nPar and array token
					// size
					// hightlight ()A1 )A1, {A1, (A1, ,A1
					// sum(index({1,2},2):2), 39125
					// operator priority, % and unary - /
					// other syntax error, =SUM((A1, -A1)), for union operator ,
					// it can not between two params which are not range,
					// otherwise it will pop up error
					// union operator, =sum((1,2,3)) will throw error, test
					// =SUM((1:1,A2)), =SUM((1),A1)
					// =SUMPRODUCT((A1,B1 + 1))
					// TODO: set error if the left or right is not the range
					// when operator is whitespace or , in syntax check
					// TODO: Sheet1!A1:Sheet1!B1, should be two tokens rather
					// than one reference, so need to refactor parsedRef, when
					// delete columnA, change to Sheet1!#REF!:Sheet1!A1
					/**
					 * TODO: 1) table formula [] and external link with [],
					 * <f>SUM([1]Sheet1!$A$1)</f> 2) ODS allow $Sheet1!A1, but
					 * MS do not allow $ as before sheet name, need checkods
					 * syntax 3) ods sepeator for ; ~ ! . 4) recover error
					 */

	/*********************** NFA Transition Table **************
	 * ==================================================================//
	 * START STATE					| CHART 						| END STATE 	| TOKEN TYPE
	 * ------------------------------------------------------------------//
	 * START 						| (){} comma(depend on locale)	| STOP			| SEPERATOR,?? 
	 * 								| +-/*^&= % space : 			| STOP 			| OPERATOR 
	 * 								| " 							| STRING 		| STRING 
	 * 								| < > 							| OPERATOR 		| -- 
	 * 								| Letter,_ ,\,otherunicode,$	| NAME 			| -- 
	 * 								| Digit, Decimal Sep 			| NUM 			| -- 
	 * 								| # 							| ERROR 		| -- 
	 * 								| ' 							| SHEET_SPECIAL | 
	 * 								| [ 							| SHEET_SPECIAL //TODO: it is start of  work book name
	 * ------------------------------------------------------------------//
	 * OPERATOR 					| = 							| STOP 			| OPERATOR 
	 * 								| other 						| STOP 			| OPERATOR // and back
	 * ------------------------------------------------------------------//
	 * STRING 						| " 							| lookahead(1) if not ", STOP, | STRING 
	 * 								| other							| STRING 		| --
	 * ------------------------------------------------------------------//
	 * NAME 						| Letter,_, 					| ., Digit, other unicode | NAME
	 * 								| !, (:, $ exist after !) 		| REFERENCE 
	 * 								| separator 					| STOP 			|
	 * NAME OR REFERENCE OR LOGICAL | [] 							| TODO: R1C1 or Table, formula Table1[Header 1]
	 * ------------------------------------------------------------------//
	 * ERROR 						| NUM!, etc 					| 				| ERROR
	 * ------------------------------------------------------------------//
	 * NUM 							| Digit %,decimal sep, e,E,+- digit(no decimal step)| NUM 
	 * 								| other 						| STOP 			| NUMBER
	 * ------------------------------------------------------------------//
	 * SHEET_SPECIAL 				| ' 							| SAME with STRING rule, if [] exists, they must be matched
	 * ==================================================================
	 */

	STATE : {
		STATE_START : 1,
		STATE_STRING : 2,
		STATE_NUM : 3,
		STATE_NAME : 4,
		STATE_ERROR : 5,
		STATE_SHEET_SPECIAL : 6,
		STATE_OPERATOR : 7,
		STATE_WHITESPACE : 8,
		STATE_STOP : 9
	},
	
	TOKEN_TYPE : {
		SEPERATOR_TYPE : 1,
		OPERATOR_TYPE : 2,
		STRING_TYPE : 3,
		NUMBER_TYPE : 4,
		ERROR_TYPE : 5,
		REFERENCE_TYPE : 6,
		NAME_TYPE : 7,
		LOGICAL_TYPE : 8,
		ARRAY_TYPE : 9,
		FUNCTION_TYPE : 10,
		WHITESPACE_IGNORE : 11,
		MISS_PARAM_TYPE : 12
	},

	TOKEN_SUBTYPE : {
		SEPERATOR_ARGUMENTS : 1, // , or ; depend on locale
		SEPERATOR_OPEN : 2, // (
		SEPERATOR_CLOSE : 3, // )
		SEPERATOR_ARRAY_OPEN : 4, // {
		SEPERATOR_ARRAY_CLOSE : 5, // }
		SEPERATOR_ARRAY_ROW : 6, // ;
		SEPERATOR_ARRAY_COL : 7, // , or .
		OPERATOR_PREFIX : 8, // no subtype for operator is
		// infix
		OPERATOR_POSTFIX : 9, // %
		OPERATOR_INTERSECTION : 10, 
		OPERATOR_UNION : 11, 
		NAME_INVALID : 12,
		SHEET_SPECIAL : 13
		// the name we can not be recognized, they might not conform
		// with the MS name definition,
		// it might be R1C1 or table formula which we do not support
		// now
	},

	ERROR_TOKEN_TYPE : {
		UNMATCHED_BRACE : 1,
		UNMATCHED_ARRAY : 2,
		CONST_ARRAY_TYPE : 3,
		CONST_ARRAY_NUM : 4,
		INVALID_NAME : 5,
		INVALID_SHEET_NAME : 6,
		INCORRECT_SEPARATOR : 7,
		ERROR_STRING : 8, // unmatched string
		PARAM_NUM	 : 9,
		LOCALE_FUNCNAME_ERROR : 10, // suppose to input the locale formula name
		OTHER_ERROR  : 11
	},

	// formula string under parse
	formula : null,
	// indexes
	offset : -1,
	length : -1,
	// inner structure
	_tokens : null,
	_token_stack : null,
	error : null,	// lexer error
	// Helper class
	_NUMBERHELPER : websheet.i18n.Number,
	_HELPER : websheet.Helper,
	_MODELHELPER : websheet.model.ModelHelper,
	_INVALID_PARSEREF: null,
	// pause stack for editing formula 
	pauseStack : null,

//	_whitespaceReg : /^( )*$/,

	constructor : function() {
		// the token list
		this._tokens = {
			parser : this,
			items : [],
			index : 0,
			push : function(token) {
				this.items.push(token);
				this.index += 1;
				if (this.index > 1) {
					var preToken = this.items[this.index - 2];
					preToken.next = token;
					token.pre = preToken;
				}
			},

			peek : function() {
				if (this.index > 0)
					return this.items[this.index - 1];
				return null;
			},

			get : function(i) {
				return this.items[i];
			},
			
			indexOf: function(item) {
				return this.items.indexOf(item);
			},

			reset : function() {
				this.items = [];
				this.index = 0;
			},

			deleteFrom : function(/* number */f, t) {
				if (t == null)
					t = this.index;
				this.items.splice(f, t - f);
				var lastItem = this.items[this.items.length - 1];
				lastItem && (lastItem.next = null);
				this.index -= t - f;
			},

			size : function() {
				return this.index;
			}

		};
			// token stack
		this._token_stack = {
			parser : this,
			items : [],
			push : function(token) {
				this.items.push(token);
			},

			pop : function() {
				var token = this.items.pop();
			},

			peek : function() {
				return (this.items.length > 0 ? this.items[this.items.length - 1]: null);
			},

			type : function() {
				var token = this.peek();
				return token ? token.type : "";
			},

			subType : function() {
				var token = this.peek();
				return (token ? token.subType : "");
			},

			reset : function() {
				this.items = [];
			}
		};
		
		this._INVALID_PARSEREF = websheet.Helper.parseRef("#REF!");
	},

	/**
	 * parse the formula string at the beginning and generate lex tokens in order
	 * it can: 
	 * 1) get referred reference, name range tokens
	 * 2) discover lex errors
	 *  2.1) unmatched brackets 
	 *  2.2) array constant size( same column number for each row) and type error( only int, string, error, logical is permitted)
	 *  2.3) function params number errors 2.4) invalid name
	 * @param str
	 *            formula string
	 * @param isEditing
	 *            user is editing now, not commit the formula yet
	 * @returns {Array} formula lex tokens array
	 */
	parseToken: function(formula, isEditing, stopCursor, bLocalSensitive) {
		this.reset(formula);
		if (this.length <= 0)
			return [];
		this.isEditing = !!isEditing;
		this.bLocalSensitive = !!bLocalSensitive;
		
		if(isEditing && stopCursor > 0){
			// not 
			stopCursor -= this._trimOffset;
			if(stopCursor < this.length)
				this.length = stopCursor;
		}
		
		this.nBrackets = 0;
		this.bInArray = false;
		
		return this._parse();

		// TODO: iter tokens to check if there are invalid name,
		// if yes, set error(INVALID_NAME)
		// and params count suggestion
		// get highlight, if there is error, then break
		// if formula not start with permitted token, set error
		// array constant set to array_type tokens
	},
	
	/**
	 * Resume parse the formula string with the last paused stack
	 * if stopCursor is specified, stop parse at this position
	 * @param formula
	 * @param isEditing
	 * @param stopCursor
	 * @returns
	 */
	resumeParseToken: function(formula, isEditing, stopCursor){
		if(this._pauseStack) {
			this._trimFormula(formula);
			this.length = this.formula.length;
			this.isEditing = !!isEditing;
			if(isEditing && stopCursor > 0){
				// not 
				stopCursor -= this._trimOffset;
				if(stopCursor < this.length)
					this.length = stopCursor;
			}
			this.nBrackets = this._pauseStack.nBrackets;
			this.bInArray = this._pauseStack.bInArray;
			this.offset = this._pauseStack.offset;
			this.error = this._pauseStack.error;
			
			this.lastToken = this._pauseStack.lastToken;
			// lastState is null means the state is not finished, we need continue append content to lastToken
			if(this.lastToken) {
				this.lastState = this._pauseStack.lastState;
				
				// resume last token with the user input
				var token = this.nextToken();
				this._mergeAndAdaptToken(token);
				// lastToken is null means the last token is completely parsed, we need start to parse the next new token
				if(this.lastToken == null) 
					return this._parse();
				else {
					this._pauseStack = this.savePauseStack();
					// in case lastToken is the name type and we need to check if it is a reference
					this._mergeAndAdaptToken(null);
				}
				
				return this._tokens.items;
			} else {
				return this._parse();
			}
		}
		
		return null;
	},

	_parse: function() {
		
		var curToken, preToken;
		// 1)get the function params count
		// 2)make sure the array constant is valid  which must contains the valid type and the same columns for each row
		while (curToken = this.nextToken()) {
			// get the top stack token and add the params count
			var stackToken = this._token_stack.peek();
			var _funcToken = stackToken && stackToken.pre;
			var bInFunc = false;
			if (_funcToken && _funcToken.type == this.TOKEN_TYPE.FUNCTION_TYPE)
				bInFunc = true;
			var type = curToken.type;
			var subType = curToken.subType;
			var text = curToken.text;
			if (type == this.TOKEN_TYPE.SEPERATOR_TYPE) {
				switch (subType) {
					case this.TOKEN_SUBTYPE.SEPERATOR_OPEN:
						this.nBrackets++;
						this._token_stack.push(curToken);
						curToken.nPar = 0; // init number of function/expression params
						break;
					case this.TOKEN_SUBTYPE.SEPERATOR_CLOSE:
						this.nBrackets--;
						if (this.nBrackets < 0)
							this.setError(curToken, this.ERROR_TOKEN_TYPE.UNMATCHED_BRACE);
						else {
							if (bInFunc) {
								stackToken.nPar++;
								if (preToken == stackToken && stackToken.nPar == 1)
									stackToken.nPar = 0;
								stackToken.pair = curToken;
								curToken.pair = stackToken;
								var funcObj = _funcToken.value;
								if (funcObj) {
									if ((stackToken.nPar < funcObj.minNumOfArgs)
										|| (funcObj.oddNumOfArgs != null && funcObj.oddNumOfArgs != (stackToken.nPar & 1))) {
										this.setError(curToken, this.ERROR_TOKEN_TYPE.PARAM_NUM);
									}
								}
							}
						}
						this._token_stack.pop();
						break;
					case this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_OPEN:
						if (this.bInArray)
							this.setError(curToken, this.ERROR_TOKEN_TYPE.UNMATCHED_ARRAY);
						this.bInArray = true;
						this._token_stack.push(curToken);
						break;
					case this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_CLOSE:
						if (!this.bInArray)
							this.setError(curToken, this.ERROR_TOKEN_TYPE.UNMATCHED_ARRAY);
						this.bInArray = false;
						this._mergeAndBuildArrayToken(curToken);
						this._token_stack.pop();
						break;
					case this.TOKEN_SUBTYPE.SEPERATOR_ARGUMENTS:
						if (bInFunc){
							curToken.pos = ++stackToken.nPar;
							curToken.parent = stackToken;
							var funcObj = _funcToken.value;
							if(funcObj && curToken.pos == funcObj.maxNumOfArgs){
								this.setError(curToken, this.ERROR_TOKEN_TYPE.PARAM_NUM);
							}
						}
						else {
							type = this.TOKEN_TYPE.OPERATOR_TYPE;
							subType = this.TOKEN_SUBTYPE.OPERATOR_UNION;
							curToken.type = type;
							curToken.subType = subType;
							curToken.id = "~";// union operator represented by odf format which is locale insensitive
						} 
						break;
					default:
						break;
				}
				if(preToken) {
					var preSubType = preToken.subType;
					if( !(preSubType == this.TOKEN_SUBTYPE.SEPERATOR_OPEN && subType == this.TOKEN_SUBTYPE.SEPERATOR_CLOSE) 
						&& (preSubType == this.TOKEN_SUBTYPE.SEPERATOR_ARGUMENTS
							|| preSubType == this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_COL || preSubType == this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_ROW 
							|| preSubType == this.TOKEN_SUBTYPE.SEPERATOR_OPEN)
						&& (subType == this.TOKEN_SUBTYPE.SEPERATOR_ARGUMENTS
								|| subType == this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_COL || subType == this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_ROW
								|| subType == this.TOKEN_SUBTYPE.SEPERATOR_CLOSE)
							) {
						var t = this._generateToken("", this.TOKEN_TYPE.MISS_PARAM_TYPE);
						this._tokens.push(t);
						if (this.bInArray) {
							this.setError(stackToken, this.ERROR_TOKEN_TYPE.CONST_ARRAY_NUM); // array item miss error
						}
					}
				}
			} // end if (type == this.TOKEN_TYPE.SEPERATOR_TYPE) 
			else {
				if (type == this.TOKEN_TYPE.NAME_TYPE) {
					if(subType != this.TOKEN_SUBTYPE.SHEET_SPECIAL) {
						var value, changeType;
						var boolValue = this._isLogical(text);
						if (boolValue != null) {
							curToken.type = this.TOKEN_TYPE.LOGICAL_TYPE;
							curToken.value = boolValue;
						} 
					}
				} else if(type == this.TOKEN_TYPE.ERROR_TYPE) {
					var ec = this._MODELHELPER.toErrCode(text, this.bLocalSensitive);
					if (ec != null) {
						curToken.value = ec;
						if(ec == websheet.Constant.ERRORCODE["524"] && !this.bInArray){
							curToken.type = this.TOKEN_TYPE.REFERENCE_TYPE;
							curToken.value = this._INVALID_PARSEREF;
						}
					} else {
						curToken.type = this.TOKEN_TYPE.NAME_TYPE;
						curToken.subType = this.TOKEN_SUBTYPE.NAME_INVALID;
						this.setError(curToken, this.ERROR_TOKEN_TYPE.INVALID_NAME);
					}
				}
			}
			
			
			if(subType != this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_CLOSE){
				this._tokens.push(curToken);
				this._mergeAndAdaptToken(curToken);
			}
			preToken = curToken;
			while (preToken
					&& preToken.type == this.TOKEN_TYPE.WHITESPACE_IGNORE){
				preToken = preToken.pre;
			}
		}

		this._mergeAndAdaptToken(null);
		if (!this.isEditing) {
			if(this.error)
				throw this.error;
			if (this.nBrackets != 0) {
				this.setError(null, this.ERROR_TOKEN_TYPE.UNMATCHED_BRACE);
			}
			if (this.bInArray) {
				this.setError(null, this.ERROR_TOKEN_TYPE.UNMATCHED_ARRAY);
			}
			this._pauseStack = null;
		} else {
			// record the pause stack when user is editing
			this._pauseStack = this.savePauseStack();
			
		}
		
		return this._tokens.items;
	},
	
	savePauseStack: function() {
		var pauseStack = {
				nBrackets: this.nBrackets,
				bInArray : this.bInArray,
				offset	 : this.offset,
				error	 : this.error,
				lastToken: this.lastToken,
				lastState: this.lastState
		};
		return pauseStack;
	},
	
	/**
	 * Need to reset bundle if user reset LOCALE-SETTINGS.
	 */
	resetBundle : function() {
		this._bundle = null;
	},

	// ****************************************************************************Private field*******************************************************************//

	// when read the current char, the pointer will move to the next char
	_current : function() {
		return this.formula.charAt(this.offset);
	},

	_currentAndMoveCursor: function() {
		if(this._eof())
			return 0;
		return this.formula.charAt(this.offset++);
	},
	
	_decimal: function() {
		if(this.bLocalSensitive){
			if (!this._bundle) {
				var editor = websheet.model.ModelHelper.getEditor();
				this._bundle = dojo.i18n.getLocalization("dojo.cldr", "number", editor.scene.getLocale());
			}
			return this._bundle["decimal"] || ".";
		} else
			return ".";
	},

	_eof: function() {
		return this.offset >= this.length;
	},

	_generateToken: function(text, type, subType) {
		// give the token object,
		var token =  {
			text : text,
			type : type,
			start : this.offset - text.length + this._trimOffset,
			end : this.offset + this._trimOffset,
			pre : null,
			next : null
		};
		if(subType)
			token.subType = subType;
		return token;
	},

	_lookahead: function(howmany) {
		return this.formula.substr(this.offset, howmany);
	},

	_backward: function(howmany) {
		this.offset = this.offset - howmany;
		this.offset = this.offset < 0 ? 0 : this.offset;
	},

	reset: function(formula) {
		this._trimFormula(formula);
		this.offset = 0;
		this.length = this.formula.length;
		this.bInArray = false;
		this.nBrackets = 0;
		this._tokens.reset();
		this._token_stack.reset();
		this.error = null;
		this._pauseStack = null;
		this.lastState = this.STATE.STATE_START;
		this.lastToken = null;
	},

	_seperator: function() {
		if(this.bLocalSensitive){
			if (!this._bundle) {
				var editor = websheet.model.ModelHelper.getEditor();
				var locale = editor.scene.getLocale();
				this._bundle = dojo.i18n.getLocalization( "dojo.cldr", "number", locale);
			}
			return (this._bundle["decimal"] == ",") ? ";" : ",";
		} else 
			return ",";
	},

	// the column separator for array constant
	_seperatorCol: function() {
		if(this.bLocalSensitive) {
			if (!this._bundle) {
				var editor = websheet.model.ModelHelper.getEditor();
				var locale = editor.scene.getLocale();
				this._bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
			}
			return (this._bundle["decimal"] == ",") ? "." : ",";
		} else
			return ",";
	},

	// the column separator for array constant
	_seperatorRow: function() {
		return ";";
	},

	_isDigit: function(c) {
		return c >= '0' && c <= '9';
	},

	_isLetter: function(c) {
		return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
	},

	_isLogical: function(text) {
		var uText = text.toUpperCase();
		if(this.bLocalSensitive) {
			var nls = this._NUMBERHELPER.getNLS();
			if (uText == nls.TRUE)
				return true;
			else if (uText == nls.FALSE)
				return false;
		} else {
			if (uText == "TRUE")
				return true;
			else if(uText == "FALSE")
				return false;
		}
		return null;
	},

	_setFuncToken: function(token) {
		try {
			var text =  websheet.functions.Util.getFormulaL2S(token.text) || token.text;
			text = this.bLocalSensitive ? websheet.functions.FormulaTranslate.transFuncNameLocale2En(text) : 
					  websheet.functions.FormulaTranslate.isSupportedFormula(text);
			token.type = this.TOKEN_TYPE.FUNCTION_TYPE;
			if(text){
				token.id = text;
				var value = websheet.functions.Formulas.getFuncObj(text);
				token.value = value;
			} else {
				if(this.bLocalSensitive && websheet.functions.FormulaTranslate.isSupportedFormula(token.text)){
					this.setError(token, this.ERROR_TOKEN_TYPE.LOCALE_FUNCNAME_ERROR);
				}
				token.funcError = websheet.Constant.ERRORCODE["525"];
			}
			
		} catch (e) {
			// it can be unsupport error or #NAME?
			token.funcError = e;
		}
		
	},

	_trimFormula: function(formula) {
		if (formula) {
			if (formula.indexOf('=') == 0) {
				formula = formula.substr(1);
				this._trimOffset = 1;
			} else {
				this._trimOffset = 0;
			}
		}
		return (this.formula = formula || "");
	},

	_mergeAndBuildArrayToken: function(arrayEndToken) {
		var arrayStartToken = this._token_stack.peek();
		var index = this._tokens.indexOf(arrayStartToken);
		if(index != -1) {
			var array = [];
			array.push([]);
			var size = this._tokens.size();
			var colNum = expectColNum = 0;
			var bOp = false;
			for(var i = index + 1; i < size; i++) {
				var token = this._tokens.get(i);
				switch(token.type) {
					case this.TOKEN_TYPE.SEPERATOR_TYPE: {
						if(!bOp){
							this.setError(token, this.ERROR_TOKEN_TYPE.CONST_ARRAY_TYPE);
							break;
						}
						if(token.subType == this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_COL){
							//skip this
						} else if(token.subType == this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_ROW){
							if(expectColNum == 0)
								expectColNum = colNum;
							else if(expectColNum != colNum)
								this.setError(token, this.ERROR_TOKEN_TYPE.CONST_ARRAY_NUM);
							colNum = 0;
							array.push([]);
						} else {
							this.setError(token, this.ERROR_TOKEN_TYPE.UNMATCHED_ARRAY);
						}
						bOp = false;
						break;
					}
					case this.TOKEN_TYPE.NUMBER_TYPE:
					case this.TOKEN_TYPE.ERROR_TYPE:
					case this.TOKEN_TYPE.STRING_TYPE:
					case this.TOKEN_TYPE.LOGICAL_TYPE: {
						if(bOp) {
							this.setError(token, this.ERROR_TOKEN_TYPE.CONST_ARRAY_TYPE);
							break;
						}
						array[array.length - 1].push(token.value);
						colNum++;
						bOp = true;
						break;
					}
					case this.TOKEN_TYPE.OPERATOR_TYPE:{
						if(token.subType == this.TOKEN_SUBTYPE.OPERATOR_PREFIX){
							// get next token, if it is number type, continue,
							// else set error, ----2 with continous prefix operator is not allowed
							i++;
							var nextToken = this._tokens.get(i);
							if(nextToken.type == this.TOKEN_TYPE.NUMBER_TYPE & !bOp){
								var value = nextToken.value;
								if(token.text == "-"){
									nextToken.value = -value;
								}
								nextToken.text = token.text + nextToken.text;
								nextToken.start = token.start;
								array[array.length - 1].push(nextToken.value);
								colNum++;
								bOp = true;
								break;
							}  
						} 
						this.setError(token, this.ERROR_TOKEN_TYPE.CONST_ARRAY_TYPE);
						break;
					}
					case this.TOKEN_TYPE.WHITESPACE_IGNORE:
						//ignore
						break;
					default:{
						this.setError(token, this.ERROR_TOKEN_TYPE.CONST_ARRAY_TYPE);
					}
				}
			}
			if(array.size == 0)
				this.setError(arrayStartToken, this.ERROR_TOKEN_TYPE.CONST_ARRAY_NUM);
			if((expectColNum != 0 && expectColNum != colNum) // different column number
					|| !bOp ) // end with operator
				this.setError(token, this.ERROR_TOKEN_TYPE.CONST_ARRAY_NUM);
			var text = this.formula.substring(arrayStartToken.start - this._trimOffset, arrayEndToken.end - this._trimOffset);
			var arrayToken = this._generateToken(text, this.TOKEN_TYPE.ARRAY_TYPE);
			//this.offset now is "}", so we need modify start/end
			arrayToken.start = arrayStartToken.start;
			arrayToken.end = arrayEndToken.end;
			arrayToken.value = array;
			this._tokens.deleteFrom(index);
			this._tokens.push(arrayToken);
		}
	},
	
	/**
	 * check if name token is a reference token or function
	 * token and check consecutive ":" combination
	 */
	_mergeAndAdaptToken : function(token) {
		var index = this._tokens.size();
		var preToken = null;
		if (token != null) {
			preToken = token.pre;
			if (token.type == this.TOKEN_TYPE.OPERATOR_TYPE 
					&& (token.subType == this.TOKEN_SUBTYPE.OPERATOR_INTERSECTION || token.subType == this.TOKEN_SUBTYPE.OPERATOR_UNION) ) {
				if (!preToken || ( preToken.type != this.TOKEN_TYPE.NAME_TYPE 
						&& preToken.type != this.TOKEN_TYPE.REFERENCE_TYPE
						&& preToken.subType != this.TOKEN_SUBTYPE.SEPERATOR_CLOSE
						&& preToken.subType != this.TOKEN_SUBTYPE.OPERATOR_INTERSECTION)) {
					if(token.subType == this.TOKEN_SUBTYPE.OPERATOR_INTERSECTION){
						token.type = this.TOKEN_TYPE.WHITESPACE_IGNORE;
						delete token.subType;
						delete token.id;
						delete token.priority;
					} else {// for OPERATOR_UNION
						if(!(token == null && this.length != this.formula.length))//do not set error when parseToken with intermediate stop cursor
							this.setError(token, this.ERROR_TOKEN_TYPE.INCORRECT_SEPARATOR);
					}
				}
			}
			index--;
		} else {
			preToken = this._tokens.peek();
		}
		var hasWS = false;
		while (preToken && preToken.type == this.TOKEN_TYPE.WHITESPACE_IGNORE) {
			preToken = preToken.pre;
			index--;
			hasWS = true;
		}
		
		if (preToken) {
			var preType = preToken.type;
			var preText = preToken.text;
			var preSubType = preToken.subType;
				
			if (preType == this.TOKEN_TYPE.NAME_TYPE) {
				
				if(token && token.subType == this.TOKEN_SUBTYPE.SEPERATOR_OPEN && preSubType != this.TOKEN_SUBTYPE.SHEET_SPECIAL ) {//'('
					this._setFuncToken(preToken);
					return;
				}
				//TODO: performance
				var ref = this._HELPER.parseRef(preText);
				if (ref) {
					// absolute sheet is not allowed only for user input
					// and should compatible with the previous draft
					if(this.bLocalSensitive && (ref.refMask & websheet.Constant.RefAddressType.ABS_SHEET) > 0 )
						this.setError(preToken, this.ERROR_TOKEN_TYPE.INVALID_SHEET_NAME);
					// for #REF!A1 which sheet has been deleted, should not highlight A1
					// and if user input =#REF!A1 is not valid
					var preToken2 = preToken.pre;
					if(preToken2 && preToken2.type == this.TOKEN_TYPE.REFERENCE_TYPE && preToken2.value == this._INVALID_PARSEREF){
						this.setError(preToken2, this.ERROR_TOKEN_TYPE.OTHER_ERROR);
					} else {
						preToken.type = this.TOKEN_TYPE.REFERENCE_TYPE;
						preToken.value = ref;
						delete preToken.subType;
					}
					return;
				}

				if (preSubType != this.TOKEN_SUBTYPE.SHEET_SPECIAL && this._HELPER.isValidName(preText) != websheet.Constant.NameValidationResult.VALID) {
					preToken.subType = this.TOKEN_SUBTYPE.NAME_INVALID;
					this.setError(preToken, this.ERROR_TOKEN_TYPE.INVALID_NAME, true);
				}
				return;
			} else if (preType == this.TOKEN_TYPE.OPERATOR_TYPE) {
				if (preSubType == this.TOKEN_SUBTYPE.OPERATOR_INTERSECTION || preSubType == this.TOKEN_SUBTYPE.OPERATOR_UNION){
					if (token == null || token.type == this.TOKEN_TYPE.OPERATOR_TYPE || 
							(token.type == this.TOKEN_TYPE.SEPERATOR_TYPE 
									&& token.subType != this.TOKEN_SUBTYPE.SEPERATOR_OPEN 
									&& token.subType != this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_OPEN)) {
						if (preSubType == this.TOKEN_SUBTYPE.OPERATOR_INTERSECTION){
							// A1 +B1, the whitespace should be ignored
							preToken.type = this.TOKEN_TYPE.WHITESPACE_IGNORE;
							delete preToken.subType;
							delete preToken.id;
							delete preToken.priority;
							return;
						} else { // for OPERATOR_UNION
							if(!(token == null && this.length != this.formula.length))//do not set error when parseToken with intermediate stop cursor
								this.setError(preToken, this.ERROR_TOKEN_TYPE.INCORRECT_SEPARATOR);
						}
					}
				}
				var preToken2 = preToken.pre;
				index--;
//				// pass the white space ignore token
				while (preToken2
						&& preToken2.type == this.TOKEN_TYPE.WHITESPACE_IGNORE) {
					preToken2 = preToken2.pre;
					index--;
					hasWS = true;
				}
				if (preText == ":" && token && preToken2) {
					if( (token.type == this.TOKEN_TYPE.NAME_TYPE && preToken2.type == this.TOKEN_TYPE.REFERENCE_TYPE && preToken2.value.getType() == websheet.Constant.RangeType.CELL) // A1:B2, A1 : B2, Sheet1!A1:B2
							||	((token.type == this.TOKEN_TYPE.NAME_TYPE || token.type == this.TOKEN_TYPE.NUMBER_TYPE )
									&& ( preToken2.type == this.TOKEN_TYPE.NAME_TYPE || preToken2.type == this.TOKEN_TYPE.NUMBER_TYPE)
									&& !hasWS) )// A:B, 1:1, Sheet1!1:2 , the inner whitespace is not allowed
					{
						var text = preToken2.text;
						var firstColonIndex = text.indexOf(":");
						// preToken2 should not be a range reference and allow 3D reference which contain ":" only in sheet part(disabled 3D reference check when user editing
						if (firstColonIndex == -1 
								// for case Sheet1:Sheet2!A1:B2
								|| ((text.indexOf("!") > firstColonIndex) && (text.lastIndexOf(":") == firstColonIndex)) ) {
							text += ":";
							text += token.text;
							var ref = this._HELPER.parseRef( text);
							if (ref) {
								// absolute sheet is not allowed only for user input
								// and should compatible with the previous draft
								if(this.bLocalSensitive && (ref.refMask & websheet.Constant.RefAddressType.ABS_SHEET) > 0 )
									this.setError(preToken2, this.ERROR_TOKEN_TYPE.INVALID_SHEET_NAME);
								preToken2.type = this.TOKEN_TYPE.REFERENCE_TYPE;
								preToken2.value = ref;
								preToken2.text = text;
								preToken2.end = token.end;
								this._tokens.deleteFrom(index);
								if(preToken2.subType == this.TOKEN_SUBTYPE.NAME_INVALID){
									if( this.error && (this.error.errorToken == preToken2)){
										this.error = null;
										delete preToken2.error;
									}
									delete preToken2.subType;
								}
								// for case Sheet1:Sheet2!A:B:A1, Sheet1:Sheet2!A is not a reference, so they will not be merged
								// when parse to :B, it will only merge Sheet2!A:B
								// should merge with previous token to check if it is 3D reference
								if(ref.sheetName != null && !ref.is3D()) {
									var colonToken = preToken2.pre;
									if(colonToken && colonToken.text == ":") {
										index--;
										var nameToken = colonToken.pre;
										if(nameToken && nameToken.type == this.TOKEN_TYPE.NAME_TYPE) {
											index--;
											var text = nameToken.text + ":" + preToken2.text;
											var ref = this._HELPER.parseRef( text);
											if (ref) {
												// absolute sheet is not allowed only for user input
												// and should compatible with the previous draft
												if(this.bLocalSensitive && (ref.refMask & websheet.Constant.RefAddressType.ABS_SHEET) > 0 )
													this.setError(preToken2, this.ERROR_TOKEN_TYPE.INVALID_SHEET_NAME);
												nameToken.type = this.TOKEN_TYPE.REFERENCE_TYPE;
												nameToken.value = ref;
												nameToken.text = text;
												nameToken.end = token.end;
												if( this.error && (this.error.errorToken == nameToken)){
													this.error = null;
													delete nameToken.error;
												}
												delete nameToken.subType;
												this._tokens.deleteFrom(index);
												preToken2 = nameToken;
											}
										}
									}
								}
								
								if(this.lastToken == token){
									this.lastToken = preToken2;
									this.lastState = this.STATE.STATE_NAME;
								}
							}
						}
					}
				} else if (preText == '-' || preText == '+') {
					if (preToken2 == null){
						preToken.subType = this.TOKEN_SUBTYPE.OPERATOR_PREFIX;
					}
					else {
						if( (preToken2.type == this.TOKEN_TYPE.OPERATOR_TYPE && preToken2.subType != this.TOKEN_SUBTYPE.OPERATOR_POSTFIX )
								|| (preToken2.type == this.TOKEN_TYPE.SEPERATOR_TYPE && (preToken2.subType != this.TOKEN_SUBTYPE.SEPERATOR_CLOSE && preToken2.subType != this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_CLOSE)))
						{
							preToken.subType = this.TOKEN_SUBTYPE.OPERATOR_PREFIX;
						}
					}
				}
			} else if (preType == this.TOKEN_TYPE.LOGICAL_TYPE) {
				if(token && token.subType == this.TOKEN_SUBTYPE.SEPERATOR_OPEN) {
					this._setFuncToken(preToken);
					return;
				}
			}
		}
	},

	nextToken: function() {
		
		var state = this.lastState;
		var _token = null;
		
		var sepChar = this._seperator();
		var decChar = this._decimal();
		while (!this._eof() && state != this.STATE.STATE_STOP) {
			switch (state) {
				case this.STATE.STATE_START: {
					var current_char = this._currentAndMoveCursor();
					switch (current_char) {
					case '(':
						_token = this._generateToken(current_char, this.TOKEN_TYPE.SEPERATOR_TYPE, this.TOKEN_SUBTYPE.SEPERATOR_OPEN);
						break;
					case ')':
						_token = this._generateToken(current_char, this.TOKEN_TYPE.SEPERATOR_TYPE, this.TOKEN_SUBTYPE.SEPERATOR_CLOSE);
						break;
					case '{':
						_token = this._generateToken(current_char, this.TOKEN_TYPE.SEPERATOR_TYPE, this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_OPEN);
						break;
					case '}':
						_token = this._generateToken(current_char, this.TOKEN_TYPE.SEPERATOR_TYPE, this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_CLOSE);
						break;
					case ',':
					case ';':
						if (decChar == current_char) {
							this._backward(1);
							state = this.STATE.STATE_NUM;
						} else if (this.bInArray) {
							if (current_char == this._seperatorRow()) {
								_token = this._generateToken(current_char, this.TOKEN_TYPE.SEPERATOR_TYPE, this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_ROW);
							} else if (current_char == this._seperatorCol()) {
								_token = this._generateToken(current_char, this.TOKEN_TYPE.SEPERATOR_TYPE, this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_COL);
							}
						} else if (sepChar == current_char) {
							_token = this._generateToken(current_char, this.TOKEN_TYPE.SEPERATOR_TYPE, this.TOKEN_SUBTYPE.SEPERATOR_ARGUMENTS);
						} else {
							_token = this._generateToken(current_char, this.TOKEN_TYPE.SEPERATOR_TYPE, 0);
							this.setError(_token, this.ERROR_TOKEN_TYPE.INCORRECT_SEPARATOR);
						}
						break;
					case '.':
						if (decChar == current_char) {
							this._backward(1);
							state = this.STATE.STATE_NUM;
						} else if (this.bInArray && (current_char == this._seperatorCol())) {
							_token = this._generateToken(current_char, this.TOKEN_TYPE.SEPERATOR_TYPE, this.TOKEN_SUBTYPE.SEPERATOR_ARRAY_COL);
						}
						break;
					case '+':
					case '-':
					case '*':
					case '/':
					case '^':
					case '&':
					case '=':
						_token = this._generateToken(current_char, this.TOKEN_TYPE.OPERATOR_TYPE);
						break;
					case '%':
						_token = this._generateToken(current_char, this.TOKEN_TYPE.OPERATOR_TYPE, this.TOKEN_SUBTYPE.OPERATOR_POSTFIX);
						break;
					case ' ':
					case '\U00A0':
					case '\U3000': 
					case '\n': {
						this._backward(1);
						state = this.STATE.STATE_WHITESPACE;
						break;
					}
					case '>':
					case '<':{
						this._backward(1);
						state = this.STATE.STATE_OPERATOR;
						break;
					}
					case '"':
						state = this.STATE.STATE_STRING;
						break;
					 case "'": // special sheet name
					 case "[": // follow with work book name
						 this._backward(1);
						 state = this.STATE.STATE_SHEET_SPECIAL;
						 break;
					case ':':
						_token = this._generateToken(current_char, this.TOKEN_TYPE.OPERATOR_TYPE);
						break;
					case '#':
						this._backward(1);
						state = this.STATE.STATE_ERROR;
						break;
				}
				//name or number
				if (_token == null) {
					if (state == this.STATE.STATE_START) {
						this._backward(1);
						if (this._isDigit(current_char))
							state = this.STATE.STATE_NUM;
						else
							state = this.STATE.STATE_NAME;
					}
				} else
					state = this.STATE.STATE_STOP;
				break;
			}
			case this.STATE.STATE_STRING: {
				_token = this._readString();
				state = this.lastState;
				break;
			}
			case this.STATE.STATE_NUM: {
				_token = this._readNumber();
				state = this.lastState;
				break;
			}
			case this.STATE.STATE_NAME: 
			case this.STATE.STATE_ERROR:{
				_token = this._readNameOrError(state);
				state = this.lastState;
				break;
			}
			case this.STATE.STATE_SHEET_SPECIAL:{
				_token = this._readSpecialSheet();
				 state = this.lastState;
				 break;
			}
			case this.STATE.STATE_OPERATOR:{
				_token = this._readOperator();
				state = this.lastState;
				break;
			}
			case this.STATE.STATE_WHITESPACE:{
				_token = this._readWhiteSpace();
				state = this.lastState;
				break;
			}
		}
		}
	
		if(this.isEditing && this._eof() && (state != this.STATE.STATE_START && state != this.STATE.STATE_STOP)){
			//backup 
			this.lastState = state;
			if(_token)
				this.lastToken = _token;
		} else {
			this.lastState = this.STATE.STATE_START;
			this.lastToken = null;
		}
		
		return _token;
	},
	
	_readOperator: function(){
		var start = this.offset;
		if(!this.lastToken)
			this._currentAndMoveCursor();
		
		if(this._eof()){
			this.lastState = this.STATE.STATE_OPERATOR;
			return this._generateOrUpdateToken(this.lastToken, start, this.offset, this.TOKEN_TYPE.OPERATOR_TYPE);
		}
		var opChar = this.formula.charAt(this.offset - 1);
		var nextChar = this._currentAndMoveCursor();
		if (nextChar != '=' && !(opChar == '<' && nextChar == '>')) {
			this._backward(1);
		} 
		this.lastState = this.STATE.STATE_STOP;
		return this._generateOrUpdateToken(this.lastToken, start, this.offset, this.TOKEN_TYPE.OPERATOR_TYPE);
	},
	
	_readWhiteSpace: function(){
		var start = this.offset;
		
		var type = this.TOKEN_TYPE.OPERATOR_TYPE;
		var subType = this.TOKEN_SUBTYPE.OPERATOR_INTERSECTION;
		
		if(this._eof()){
			if(this.isEditing)
				this.lastState = this.STATE.STATE_WHITESPACE;
			else
				this.lastState = this.STATE.STATE_STOP;
			var token = this._generateOrUpdateToken(this.lastToken, start, this.offset, type, subType);
			token.id = "!";
			return token;
		}
		
		while(!this._eof()){
			var nextChar = this._currentAndMoveCursor();
			if (nextChar == ' ' || nextChar == '\U00A0' || nextChar == '\U3000' || nextChar == '\n') {
			} else{
				this.lastState = this.STATE.STATE_STOP;
				this._backward(1);
				break;
			}
		}
		if(this._eof()){
			if(this.isEditing)
				this.lastState = this.STATE.STATE_WHITESPACE;
			else
				this.lastState = this.STATE.STATE_STOP;
		}
		var token = this._generateOrUpdateToken(this.lastToken, start, this.offset, type, subType);
		token.id = "!";
		return token;
	},
	
	_readNameOrError: function(state) {
		var start = this.offset;
		
		var type = this.TOKEN_TYPE.NAME_TYPE;
		if(state == this.STATE.STATE_ERROR)
			type = this.TOKEN_TYPE.ERROR_TYPE;
		
		while (!this._eof()) {
			var current_char = this._currentAndMoveCursor();
			switch (current_char) {
				case "'" : { 
					if(this.offset == start + 2 && this.formula.charAt(start) == '$') {// for string start with "$'", it is absolute sheet name start
						// =$'Sheet 3'!A1, etc.
						this._backward(1);
						var t = this._readSpecialSheet();
						t.start--;// make the token with '$'
					}
					break;
				}
				case '(':
				case ')':
				case '{':
				case '}':
				case ',':
				case ';':
				case '+':
				case '-':
				case '*':
				case '^':
				case '&':
				case '=':
				case '%':
				case ' ':
				case '\U00A0':
				case '\U3000':
				case '\n':
				case '>':
				case '<':
				case ':':
				case '.':
				case '/':
				case '!':
					var back = 1;
					if( (current_char == '/' && state == this.STATE.STATE_ERROR) //#DIV/0! , #N/A is accept
							|| (current_char == '.' && state != this.STATE.STATE_ERROR) )//ERROR.TYPE is accept
						break;
					
					if (current_char == '!') { 
						if(state == this.STATE.STATE_ERROR) { //=DIV/0!/1, stop at '!'
							// do not backward
							back = 0;
						} else
							break;// name token accept '!' and treat it as the sheet name separator
					} 
					this._backward(back);
					this.lastState = this.STATE.STATE_STOP;
					return this._generateOrUpdateToken(this.lastToken, start, this.offset, type);
					break;
				default:
					break;
			}
		}
		
		this.lastState = state;
		return this._generateOrUpdateToken(this.lastToken, start, this.offset, type);
	},
	
	_readSpecialSheet:function() {
		var start = this.offset;
		var startChar;
		if(this.lastToken){
			// resume the previous stack
			if( this._stringStack ) {
				startChar = this._stringStack.startChar;
			}
		} else {
			startChar = this._currentAndMoveCursor();
		}
		var token;
		if(startChar == "'") {
			token = this._parseString(start, true);
		} else {
			//'['
			var bFinish = false;
			while(!this._eof()) {
				var current_char = this._currentAndMoveCursor();
				if (current_char == ']') {
					bFinish = true;
					break;
				} 
			}
			if(bFinish) {
				this.lastState = this.STATE.STATE_STOP;
			} else {
				this.lastState = this.STATE.STATE_SHEET_SPECIAL;
				this._stringStack = {startChar: '['};
			}
			token = this._generateOrUpdateToken(this.lastToken, start, this.offset, this.TOKEN_TYPE.NAME_TYPE, this.TOKEN_SUBTYPE.SHEET_SPECIAL);
		} 
		if(this.lastState == this.STATE.STATE_STOP) {
			// after read special sheet, we should continue to read the latter chars and combine them to name token
			this.lastState = this.STATE.STATE_NAME;
			this.lastToken = token;
			return this._readNameOrError(this.STATE.STATE_NAME);
		}
		
		return token;
	},
	
	_readString: function() {
		var start = this.offset - 1;// 1 is the first "
		return this._parseString(start);
	},
	
	_parseString: function(start, bSingleQuote){
		var qCount = 1;
		var _text = "";//_text is the string content which does not contain the first "
		
		if(this.lastToken){
			// resume the previous stack
			if( this._stringStack ) {
				qCount = this._stringStack.qCount;
				_text = this._stringStack._text;
			}
		}
		
		var ch = '"';
		var type, subType, state, error;
		if(bSingleQuote) {
			ch = "'";
			type = this.TOKEN_TYPE.NAME_TYPE;
			subType = this.TOKEN_SUBTYPE.SHEET_SPECIAL;
			state = this.STATE.STATE_SHEET_SPECIAL;
			error = this.ERROR_TOKEN_TYPE.INVALID_NAME;
		} else {
			type = this.TOKEN_TYPE.STRING_TYPE;
			subType = null;
			state = this.STATE.STATE_STRING;
			error = this.ERROR_TOKEN_TYPE.ERROR_STRING;
		}
		//start parse string
		while (!this._eof()) {
			var current_char = this._currentAndMoveCursor();
			if (current_char == ch) {
				var bEnd = this._eof();
				var nextChar = this._currentAndMoveCursor();
				if (nextChar == ch && !bEnd) {
					_text += ch;
				} else {
					if(!bEnd)
						this._backward(1);
					qCount--;
					break;
				}
			} else
				_text += current_char;
		}
		//end parse string
		
		var _token = this._generateOrUpdateToken(this.lastToken, start, this.offset, type, subType);
		_token.value = _text;
		
		this.lastState = this.STATE.STATE_STOP;
		if(qCount != 0) {
			if(this.isEditing) {
				this.lastState = state;
				// backup string info for resumeParseToken
				this._stringStack = {qCount: qCount, _text: _text, startChar:ch};
				return _token;
			} else
				this.setError(_token, error);
		}
		
		return _token;
		
	},
	
	/**
	 * numerical-constant = 
	 * 	whole-number-part(1) ,[full-stop](2),[exponent-part](4) | 
	 *  full-stop(2), fractional-part(3), [exponent-part](4) |
	 * whole-number-part(1), full-stop(2), fractional-part(3) [exponent-part](4)
	 */
	_readNumber: function() {
		// when call this function, it must in the STATE_NUM  state
		var start = this.offset;
		var c;
		var state = 1;
		var decChar = this._decimal();
		if(this.lastToken) {
			if(this._numberStack){
				state = this._numberStack.state;
			}
		}
		
		//start parse number
		while (c = this._currentAndMoveCursor()) {
			switch (state) {
				case 1:// whole-number-part
					if (this._isDigit(c))
						state = 1;
					else if (c == decChar)
						state = 2;
					else if (c == 'e' || c == 'E')
						state = 4;
					else
						state = 0;
					break;
				case 2:// full-stop
					if (this._isDigit(c))
						state = 3;
					else if (c == 'e' || c == 'E')
						state = 4;
					else
						state = 0;
					break;
				case 3:// fractional-part
					if (this._isDigit(c))
						state = 3;
					else if (c == 'e' || c == 'E')
						state = 4;
					else
						state = 0;
					break;
				case 4:// exponent-part
					if (c == '+' || c == '-')
						state = 5;
					else if (this._isDigit(c))
						state = 6;
					else
						state = -1;// error
					break;
				case 5:
					if (this._isDigit(c))
						state = 6;
					else
						state = -1;// error
					break;
				case 6:
					if (this._isDigit(c))
						state = 6;
					else
						state = 0;
					break;
			}
			if (state <= 0)
				break;
		}
		//end parse number
		
		var error = null;
		if(state == 0) {
			this._backward(1);
			this.lastState = this.STATE.STATE_STOP;
		} else {
			if (this._eof()){
				this.lastState = this.STATE.STATE_NUM;
				if(!this.isEditing && (state == 4 || state == 5 || state == -1))
					error = this.ERROR_TOKEN_TYPE.ERROR_NUMBER;
			}else {
				this._backward(1);
				// backward to before number state
				this.offset = start; 
				this.lastState = this.STATE.STATE_NAME;
				this.lastToken = null;
				return null;
			}
		}
		var _token = this._generateOrUpdateToken(this.lastToken, start, this.offset, this.TOKEN_TYPE.NUMBER_TYPE);
		if(error)
			this.setError(_token, error);
		else{
			//number value now might be wrong value when isEditing, such as "12E", because user has not finished input yet
			var text = _token.text;
			if(decChar != ".") {
				text = text.replace(decChar, ".");
			}
			_token.value = parseFloat(text);
		}
		//backup number stack for resumeParseToken
		this._numberStack = {state:state};
		
		return _token;
	},

	_generateOrUpdateToken:function(updateToken, start, end, type, subType){
		if(updateToken)
			start = updateToken.start - this._trimOffset;
		var text = this.formula.substring(start, end);
		if(!updateToken){
			return this._generateToken(text, type, subType);
		} else {
			updateToken.end = end + this._trimOffset;
			updateToken.text = text;
			// type and subType might also need be update
			if(type)
				updateToken.type = type;
			if(subType)
				updateToken.subType = subType;
		}
		return updateToken;
	},
	
	// bNotThrow means just record the error, and do not throw directly even it is not in editing
	// because this error might be eliminated such as NAME_INVALID error for Sheet1!A:A
	setError: function(token, error, bNotThrow) {
		if (token != null && error != null) {
			token.error = error;
			// TODO: if bAutoCorrect, or if user commit the
			// input, should throw error to pop up dialog
		}
		if(error && !this.error){
			this.error = {
					code: error,
					errorToken: token
			};
		}
		if(!this.isEditing && !bNotThrow)
			throw this.error;
	},
	
	getError: function(){
		return this.error;
	}
});