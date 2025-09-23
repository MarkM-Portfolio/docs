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
dojo.provide("websheet.parse.FormulaParser");
dojo.require("websheet.parse.TokenGenerator");
dojo.require("websheet.parse.FormulaParseHelper");
dojo.require("websheet.parse.FormulaLexer");

dojo.declare("websheet.parse.FormulaParser", null, {
	/*********************************************************************************************
	 * BNF, do not consider the operator priority in BNF, but in predictive analyze
	 * ---------------------------------------------------------------------------------
	 * E = (E) | number | string | logical | array | error | 
	 *     prefix E | E infix E | E postfix |
	 *     reference | name | F
	 * F = func "(" P ")"
	 * P = E R | missing R | empty
	 * R = "," P | empty 
	 * 								|	|
	 *								|	|
	 *							  __|	|__
	 *							  \  	  /
	 *							   \	 /
	 *								\	/
	 *								 \ /
	 *
	 * EBNF
	 * -----------------------------------------------------------------------------------
	 * E = T E'
	 * E' = infix E E' | post E' | empty
	 * T = (E) | number | string | logical | array | error |
	 * 	   prefix E | reference | name | F
	 * F = func "(" P ")"
	 * P = E R | missing R | empty
	 * R = "," P | empty 
	 * 								|	|
	 *								|	|
	 *							  __|	|__
	 *							  \  	  /
	 *							   \	 /
	 *								\	/
	 *								 \ /
	 *
	 * FIRST AND FOLLOWS
	 * ------------------------------------------------------------------------------------
	 * FIRST(E) = FIRST(T) = {'(', number, string, logical, error, array, prefix, reference, name, func }
	 * FIRST(F) = { func }
	 * FIRST(E') = { infix, postfix, empty}
	 * FIRST(P) = { empty, missing, '(', number, string, logical, error, array, prefix, reference, name, func }
	 * FIRST(R) = { ',', empty }
	 * 
	 * FOLLOW(P) = FOLLOW(R) = { ')' }
	 * FOLLOW(E) = FOLLOW(E') = FOLLOW(T) = FOLLOW(F) = { infix, postfix, $, ',', ')' }
	 * 
	 * 								|	|
	 *								|	|
	 *							  __|	|__
	 *							  \  	  /
	 *							   \	 /
	 *								\	/
	 *								 \ /
	 * PREDICTIVE ANALYSIS TABLE
	 * ---------------------------------------------------------------------------------------
	 *   STACK	'('			')'		number/string/logical/error/array/reference/name/prefix		infix				postfix						func		','			missing			$
	 *   E		E = TE'				E = TE'																										E=TE'
	 *   E'					E'=empty															E'=infix E E'		E'=postfix E'							E'=empty					E'=empty
	 *   T		T=(E)				T=num/string/log/err/arr/ref/name/prefix E																	T=F
	 *   F																																		F=func'('P')'
	 *   P		P=E R		P=empty	P=E R																										P=E R					P=missing R		P=empty
	 *   R					R=empty																															R = "," P  					R=empty
	 *   
	 */
	
	_GENERATOR	:	websheet.parse.TokenGenerator,
	_helper		:	websheet.parse.FormulaParseHelper,
	
	bMSFormat	: 	true,
	NONTERMINALS:
	{
		E  : "E",
		E_ : "E'",
		T  : "T",
		F  : "F",
		P  : "P",
		R  : "R"
	},
	
	TERMINALS:
	{
		PREFIX	: "prefix",
		INFIX	: "infix",
		POSTFIX : "postfix",
		OPEN	: "(",
		CLOSE	: ")",
		SEP		: ",",
		CONST	: "const",
		REFS	: "refs",
		FUNC	: "func",
		END		: "$",
		MISSING	: "miss"
	},
	
	EXPRESSION_TABLE:
	{
		E1  : ["E'", "T"],
		E_1 : [],
		E_2 : ["E'", "E", "infix"],
		E_3 : ["E'", "postfix"],
		T1	: [")", "E", "("],
		T2  : ["const"],
		T3	: ["refs"],
		T4	: ["E", "prefix"],
		T5	: ["F"],
		F1	: [")", "P", "(" , "func"],
		P1	: [ "R", "E"],
		P2  : ["R", "miss"],
		P3	: [],
		R1  : ["P", ","],
		R2  : []
	},
	
	_ip : 0,	//the pointer to lexeme arrays
	constructor : function()
	{
		this.ANALYZE_TABLE =
		{
			"E" : {
					"(" 	: this.EXPRESSION_TABLE.E1,
					"const" : this.EXPRESSION_TABLE.E1,
					"refs" 	: this.EXPRESSION_TABLE.E1,
					"prefix": this.EXPRESSION_TABLE.E1,
					"func"	: this.EXPRESSION_TABLE.E1
				  },
			"E'" :{
					")"		: this.EXPRESSION_TABLE.E_1,
					"infix" : this.EXPRESSION_TABLE.E_2,
					"postfix": this.EXPRESSION_TABLE.E_3,
					","		: this.EXPRESSION_TABLE.E_1,
					"$"		: this.EXPRESSION_TABLE.E_1
				  },
			"T" :{
					"("		: this.EXPRESSION_TABLE.T1,
					"const" : this.EXPRESSION_TABLE.T2,
					"refs" 	: this.EXPRESSION_TABLE.T3,
					"prefix": this.EXPRESSION_TABLE.T4,
					"func"	: this.EXPRESSION_TABLE.T5
				 },
			"F" :{
					"func"	: this.EXPRESSION_TABLE.F1
				 },
			"P" :{
					"("		: this.EXPRESSION_TABLE.P1,
					")"		: this.EXPRESSION_TABLE.P3,
					"const" : this.EXPRESSION_TABLE.P1,
					"refs" 	: this.EXPRESSION_TABLE.P1,
					"prefix": this.EXPRESSION_TABLE.P1,
					"func"	: this.EXPRESSION_TABLE.P1,
					"miss"	: this.EXPRESSION_TABLE.P2
				 },
			"R" :{
					"," 	: this.EXPRESSION_TABLE.R1,
					")"		: this.EXPRESSION_TABLE.R2
				 }
		};
		
		this.lexer = websheet.parse.FormulaParseHelper.getFormulaLexer();
		this._TOKEN_TYPE = this.lexer.TOKEN_TYPE,
		this._TOKEN_SUBTYPE = this.lexer.TOKEN_SUBTYPE,
		
		// store the predictive analysis expression
		this.syntax_stack = 
		{
				items : [],
				push : function ( exprs )
				{
					if(dojo.isArray(exprs))
					{
						var length = exprs.length;
						for(var i = 0; i < length; i++)
						{
							var item = exprs[i];
							this.items.push(item);
						}
					}else
					{
						this.items.push(exprs);
					}
				},
				
				peek : function()
				{
					if(this.items.length > 0)
						return this.items[this.items.length - 1];
					return null;
				},
				
				pop : function()
				{
					this.items.pop();
				},
				
				reset: function()
				{
					this.items = [];
				}
		};
		
		// func_stack is used to construct the function token tree
		this.func_stack = 
		{
				items : [],//array of functionWrapper
				// functionWrapper:{token: token, data_stack:[], operator_stack:[]}
				// data_stack is used to store the operand of operator
				// operator_stack is used to analyze the infix operator priority
				
				push : function( func )
				{
					this.items.push({
						token			: func,
						data_stack		:[],
						operator_stack	:[]
					});
				},
				
				pop : function()
				{
					var functionWrapper = this.items.pop();
					return functionWrapper.token;
				},
				
				peek : function()
				{
					if(this.items.length > 0){
						var functionWrapper = this.items[this.items.length - 1];
						return functionWrapper.token;
					}
					return null;
				},
				
				pushData : function( data )
				{
					if(this.items.length > 0){
						var functionWrapper = this.items[this.items.length - 1];
						functionWrapper.data_stack.push(data);;
					}
				},
				
				popData : function()
				{
					if(this.items.length > 0){
						var functionWrapper = this.items[this.items.length - 1];
						return functionWrapper.data_stack.pop();;
					}
					return null;
				},
				
				peekData : function()
				{
					if(this.items.length > 0){
						var functionWrapper = this.items[this.items.length - 1];
						var length = functionWrapper.data_stack.length;
						if(length > 0)
							return functionWrapper.data_stack[length - 1];
					}
					return null;
				},
				
				pushOperator : function( data )
				{
					if(this.items.length > 0){
						var functionWrapper = this.items[this.items.length - 1];
						functionWrapper.operator_stack.push(data);;
					}
				},
				
				popOperator : function()
				{
					if(this.items.length > 0){
						var functionWrapper = this.items[this.items.length - 1];
						return functionWrapper.operator_stack.pop();;
					}
					return null;	
				},
				
				peekOperator : function()
				{
					if(this.items.length > 0){
						var functionWrapper = this.items[this.items.length - 1];
						var length = functionWrapper.operator_stack.length;
						if(length > 0)
							return functionWrapper.operator_stack[length - 1];
					}
					return null;
				},
				reset : function()
				{
					this.items = [];
				}
		};
	},
	
	reset: function()
	{
		this.syntax_stack.reset();
		this.syntax_stack.push("E");// formula start expressions
		this.func_stack.reset();
		this._ip = 0;
		this.lexTokens = [];
		this.formula = "=";
		this.error = null;
		this.tokenArray = [];
	}, 
	
	parseFormula: function(formula, cell, bOnlyLex, bLocalSensitive){
		this.cell = cell;
		var lexemes;
		try{
			lexemes = this.lexer.parseToken(formula, false, null, bLocalSensitive);
		}catch(e){
		}
		var lexError = this.lexer.getError();
		if(lexError || bOnlyLex)
			return {formula: formula, tokenTree: null, error: lexError, lexemes: lexemes};
		var tokenTree = this.parse(lexemes);
		return {formula: this.formula, tokenTree: tokenTree, tokenArray: this.tokenArray, error: this.error};
	},
	
	parseLexemes: function(lexemes, cell){
		var tokenTree = this.parse(lexemes, cell);
		return {formula: this.formula, tokenTree: tokenTree, tokenArray: this.tokenArray, error: this.error};
	},
	
	/**
	 * construct the syntax token tree by the lexer output tokens
	 * @param lexemes	the lexeme array which is parsed by formula lexer
	 * @return syntax token tree
	 */
	parse: function( lexemes, cell )
	{
		if(!dojo.isArray(lexemes))
			return null;
		this.reset();
		if(cell)
			this.cell = cell;
		this.lexTokens = lexemes;
		this.lexTokensLength = lexemes.length;
		var topExpr = this.syntax_stack.peek();
		this.currentLexToken = this.lexTokens[0];
		var terminal = this._getTerminal(this.currentLexToken);
		this.func_stack.push({});// empty token to be a place holder
		
		while(topExpr)
		{
			if(topExpr == terminal)
			{
				this.action(this.currentLexToken);
				this.syntax_stack.pop();
				if(++this._ip < this.lexTokensLength){
					this.currentLexToken = this.lexTokens[this._ip];
					terminal = this._getTerminal(this.currentLexToken);
				} else {
					this.currentLexToken = null;
					terminal = this.TERMINALS.END;
				}
			}
			else
			{
				var analyzeExprs = this.getAnalyzeItem(topExpr, terminal);
				if(analyzeExprs == null){
					this.setError();
					break;
				}else
				{
					this.syntax_stack.pop();
					this.syntax_stack.push(analyzeExprs);
				}
			}
			topExpr = this.syntax_stack.peek();
		}
		if(!this.error){
			this._followE_();
			var tokenTree = this.func_stack.popData();
			return tokenTree;
		}
		return null;
	},
	
	//construct sub token tree for specific func or operator or leaf token
	action: function( lexeme )
	{
		if(lexeme.preWS){
			this.formula += lexeme.preWS;
		}
		var token;
		var text = lexeme.text;
		var subtype = lexeme.subType;
		switch(lexeme.type)
		{
		case this._TOKEN_TYPE.SEPERATOR_TYPE:
			var topFunc = this.func_stack.peek();
			switch(subtype)
			{
			case this._TOKEN_SUBTYPE.SEPERATOR_OPEN:
				if(lexeme.pre && lexeme.pre.type == this._TOKEN_TYPE.FUNCTION_TYPE)//it must be a function open seperator
				{
					//TODO: necessary?
//					this._GENERATOR.newFuncParamsToken(lexeme, topFunc);
				}else
				{
					token = this._GENERATOR.newBracketToken(lexeme);
					this.func_stack.push(token);
				}
				break;
			case this._TOKEN_SUBTYPE.SEPERATOR_CLOSE:
			case this._TOKEN_SUBTYPE.SEPERATOR_ARGUMENTS:
				//FOLLOW(E') = { infix, postfix, $, ',', ')' }
				this._followE_();
				var dataToken = this.func_stack.popData();
				this._GENERATOR.pushTokenList(dataToken, topFunc, lexeme.preWS);
				if(subtype == this._TOKEN_SUBTYPE.SEPERATOR_CLOSE)
				{
					var topToken = this.func_stack.pop();
					this.func_stack.pushData(topToken);
				} else {
					if(this.bMSFormat)
						text = ",";
					else
						text = ";";
				}
				break;
			}
			break;
		case this._TOKEN_TYPE.NUMBER_TYPE:
		case this._TOKEN_TYPE.LOGICAL_TYPE:
			token = this._GENERATOR.newToken(lexeme);
			this.func_stack.pushData(token);
			text = token.getName();
			break;
		case this._TOKEN_TYPE.ARRAY_TYPE:
			token = this._GENERATOR.newToken(lexeme);
			this.func_stack.pushData(token);
			text = token._serializeConstArray();
			break;
		case this._TOKEN_TYPE.STRING_TYPE:
		case this._TOKEN_TYPE.ERROR_TYPE:
		case this._TOKEN_TYPE.MISS_PARAM_TYPE:
			token = this._GENERATOR.newToken(lexeme);
			this.func_stack.pushData(token);
			break;
		case this._TOKEN_TYPE.REFERENCE_TYPE:
			var b3DRef = lexeme.value.is3D();
			// for 3D reference, such as 'Sheet1:Sheet2'!A1:B2, Sheet2 might not exist, so it is invalid 3D reference
			// but we should not split such 3D reference to ":" sub token tree, because of the single quote
			// so in FormulaParseHelper.pushRawRefToken will check the text contains single quote "'" or not
			text = b3DRef ? lexeme.text : lexeme.value.getAddress();
			
			token = this._GENERATOR.newRefToken(text, lexeme.value, this.cell);
			this.func_stack.pushData(token);
			//if it is invalid 3D reference,  return token is the ":" sub token tree
			if(b3DRef && (token instanceof websheet.parse.tokenList) ) {
				// 3D reference is invalid, and has been splited to two ref tokens
				var childs = token.getTokenList();
				var leftToken = childs[0];
				var rightToken = childs[1];
				leftToken._arrayIndex = this.tokenArray.length;
				var index = this.formula.length;
				leftToken.setIndex(index);
				this.tokenArray.push(leftToken);
				rightToken._arrayIndex = this.tokenArray.length;
				rightToken.setIndex(index + leftToken.getName().length + 1);
				this.tokenArray.push(rightToken);
				break;
			} else {
				//_arrayIndex is used for autofill pattern formulas
				token._arrayIndex = this.tokenArray.length;
				this.tokenArray.push(token);
				token.setIndex(this.formula.length);
			}
			break;
		case this._TOKEN_TYPE.NAME_TYPE:
			token = this._GENERATOR.newNameToken(lexeme.text, this.cell);
			this.func_stack.pushData(token);
			token._arrayIndex = this.tokenArray.length;
			this.tokenArray.push(token);
			token.setIndex(this.formula.length);
			break;
		case this._TOKEN_TYPE.OPERATOR_TYPE:
			var topOp = this.func_stack.peekOperator();
			if(topOp == null 
					|| lexeme.priority > topOp.priority
					|| (lexeme.priority == topOp.priority && lexeme.subType == this._TOKEN_SUBTYPE.OPERATOR_PREFIX))
				this.func_stack.pushOperator(lexeme);
			else
			{
				this._followE_(lexeme);
				this.func_stack.pushOperator(lexeme);
			}
			
			// for union/intersection
			switch(lexeme.id){
			case '!':
				if(this.bMSFormat){
					if(text.length > 1){
						// it means it is ms format intersection with more than one whitespace
						// lexeme.preWS will be used for operator token's pre whitespace
						lexeme.preWS = text.substring(1);
						text = " ";
					}
				} else {
					text = lexeme.id;
				}
				break;
			case '~':
				if(this.bMSFormat)
					text = ',';
				else
					text = lexeme.id;
				break;
			}
			break;
		case this._TOKEN_TYPE.FUNCTION_TYPE:
			token = this._GENERATOR.newFuncToken(lexeme, this.cell);
			this.func_stack.push(token);
			text = token.getName();
			break;
		}
		if(lexeme.preWS){
			if(token)
				token.preWS = lexeme.preWS;
		}
		this.formula += text;
	},
	
	/*
	 * When encountered the lexeme which is followed with E'
	 * we should the function stack
	 */
	_followE_ :function(lexeme)
	{
		var opToken = null;
		var topOp = this.func_stack.popOperator();
		while(topOp != null)
		{
			var data1,data2;
			data2 = this.func_stack.popData();
			if(topOp.subType != this._TOKEN_SUBTYPE.OPERATOR_POSTFIX
					&& topOp.subType != this._TOKEN_SUBTYPE.OPERATOR_PREFIX){
				data1 = this.func_stack.popData();
				this._checkRefOperator(topOp.id?topOp.id:topOp.text, data1, data2);
			} else {
				data1 = data2;
				data2 = null;
			}
			
			var opToken = this._GENERATOR.newOperatorToken(topOp, data1, data2);
			this.func_stack.pushData(opToken);
			
			topOp = this.func_stack.peekOperator();
			if(topOp){
				if(lexeme
						&& ( lexeme.priority > topOp.priority
							|| (lexeme.priority == topOp.priority && lexeme.subType == this._TOKEN_SUBTYPE.OPERATOR_PREFIX))){
					break;
				}
				this.func_stack.popOperator();
			} else
				break;
		}
	},
	
	// check operand of operator union/intersection/colon 
	// if they are all reference or function which can return ref
	_checkRefOperator: function(operator, /*websheet.parse.tokenBase*/left, /*websheet.parse.tokenBase*/right){
		if(operator == "!" || operator == "~" || operator == ":"){
			if( this._checkRefOperand(left) && this._checkRefOperand(right) )
				return true;
			// for ":", it might be 3D reference which might need replace this ":" operator subtree
//			if(operator == ":") {
//				this._mark3DReference(left, right);
//				return true;
//			}
			this.setError();
		}
		return false;
	},
	
	_mark3DReference: function(/*websheet.parse.tokenBase*/left, /*websheet.parse.tokenBase*/right) {
		var leftType = left.getTokenType();
		var rightType = right.getTokenType();
		if(leftType == this._GENERATOR.tokenType.NAME && rightType == this._GENERATOR.tokenType.RANGEREF_TOKEN){
			// try to concat left and right and check if it is 3D reference
			// only check 3D reference when push to cell, because formula parser do not know anything about document
			left.next3DRefPart = right;
			right.pre3DRefPart = left;
		}
		
	},
	
	_checkRefOperand: function(/*websheet.parse.tokenBase*/operand){
		var type = operand.getTokenType();
		switch(type){
		case this._GENERATOR.tokenType.RANGEREF_TOKEN:
		case this._GENERATOR.tokenType.NAME:
			return true;
		case this._GENERATOR.tokenType.FUNCTION_TOKEN:
			if( (websheet.functions.Util.getErrPropByName(operand.getName()) & websheet.Constant.CellErrProp.RETURN_REF) > 0)
				return true;
			break;
		case this._GENERATOR.tokenType.OPERATOR_TOKEN:
			var tokenList = operand.getTokenList();
			return this._checkRefOperator(operand.getName(), tokenList[0], tokenList[1]);
		case this._GENERATOR.tokenType.BRACKET_TOKEN:
			return this._checkRefOperand(operand.getTokenList()[0]);
		case this._GENERATOR.tokenType.ERROR_TOKEN:
			return (operand.getValue() == websheet.Constant.ERRORCODE["524"]);
		}
		return false;
	},
	
	_getOpPriority:function(/*operator text or id(for union/intersection)*/op, subType){
		var level = -1;
		switch(op){
		case '<':
		case '>':
		case '<=':
		case '>=':
		case '<>':
		case '=':
			level = 10;
			break;
		case '&':
			level = 38;
			break;			 
		case '+':
		case '-':
			if(subType == this._TOKEN_SUBTYPE.OPERATOR_PREFIX)
				level = 56;
			else
				level = 40;
			break;
		case '*':
		case '/':
			level = 50;
			break;
		case '^':
			level = 55;
			break;
		case '%':
			level = 60;
			break;
		case '~':
			level = 65;
			break;
		case '!':
			level = 70;
			break;
		case ':':
			level = 80;
			break;
		default:
			break;
		}
		return level;
	},
	
	_getTerminal : function( lexeme )
	{
		if(lexeme == null)
			return null;
		var subtype = lexeme.subType;
		switch(lexeme.type)
		{
		case this._TOKEN_TYPE.SEPERATOR_TYPE:
			switch(subtype)
			{
			case this._TOKEN_SUBTYPE.SEPERATOR_OPEN:
				return this.TERMINALS.OPEN;
			case this._TOKEN_SUBTYPE.SEPERATOR_CLOSE:
				return this.TERMINALS.CLOSE;
			case this._TOKEN_SUBTYPE.SEPERATOR_ARGUMENTS:
				return this.TERMINALS.SEP;
			}
			break;
		case this._TOKEN_TYPE.OPERATOR_TYPE:
			lexeme.priority = this._getOpPriority(lexeme.id?lexeme.id:lexeme.text, subtype);
			switch(subtype)
			{
			case this._TOKEN_SUBTYPE.OPERATOR_PREFIX:
				return this.TERMINALS.PREFIX;
			case this._TOKEN_SUBTYPE.OPERATOR_POSTFIX:
				return this.TERMINALS.POSTFIX;
			default:
				return this.TERMINALS.INFIX;
			}
			break;
		case this._TOKEN_TYPE.STRING_TYPE:
		case this._TOKEN_TYPE.NUMBER_TYPE:
		case this._TOKEN_TYPE.ERROR_TYPE:
		case this._TOKEN_TYPE.LOGICAL_TYPE:
		case this._TOKEN_TYPE.ARRAY_TYPE:
			return this.TERMINALS.CONST;
		case this._TOKEN_TYPE.REFERENCE_TYPE:
		case this._TOKEN_TYPE.NAME_TYPE:
			return this.TERMINALS.REFS;
		case this._TOKEN_TYPE.FUNCTION_TYPE:
			return this.TERMINALS.FUNC;
		case this._TOKEN_TYPE.WHITESPACE_IGNORE:
			var text = lexeme.text;
			// get the next lex token which is not whitespace
			if(++this._ip < this.lexTokensLength){
				this.currentLexToken = this.lexTokens[this._ip];
				// record the previous whitespace which is used to append the formula
				this.currentLexToken.preWS = text;
				return this._getTerminal(this.currentLexToken);
			} else {
				this.currentLexToken = null;
				return this.TERMINALS.END;
			}
		case this._TOKEN_TYPE.MISS_PARAM_TYPE:
			return this.TERMINALS.MISSING;
		}
		return null;
	},
	
	getAnalyzeItem : function( expr, terminal )
	{
		var table = this.ANALYZE_TABLE[expr];
		if(table == null) //expr is a terminal token
			return null;
		
		var resultExprs = table[terminal];
		return resultExprs;
	},
	
	setError : function()
	{
		//TODO: recover
		this.error = {
				errorToken: this.currentLexToken,
				code:"syntax error"};
	}
	
});
(function(){
	websheet.parse.FormulaParseHelper.formulaParser =  new websheet.parse.FormulaParser();
})();