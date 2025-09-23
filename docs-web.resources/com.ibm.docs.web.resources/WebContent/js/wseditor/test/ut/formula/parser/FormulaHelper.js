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
dojo.provide("websheet.test.ut.formula.parser.FormulaHelper");
dojo.provide("websheet.event.FormulaHelper");
dojo.requireLocalization("websheet.event","FormulaHelper");
/**
 * UT Formula Helper, moved from old formula parser
 */

websheet.event.FormulaHelper ={
	
	
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
	
	
	isFormula: function(str)
	{
		return websheet.Helper.formulaPattern.test(str + "");
	},
	/*
	 * get the token list in the formula
	 * @param formula: the formula string
	 * @param bLocaleSensitive: if parse the locale number
	 * @param bNotParseRef: parse the cell/range reference or not, 
	 * 						if only care about the locale number, then does not need to parse ref
	 */
	parse: function(formula, bLocaleSensitive, bNotParseRef)
	{
		var tokenList = null;
		if(this.isCacheEnabled())
			tokenList = this._cachedTokens[formula];
		if(tokenList)
			return tokenList;
		
		var tokenList = new Array();
		try {
			websheet.parse.parseHelper._cellHasUnicode = false;
			var input = new org.antlr.runtime.ANTLRStringStream(formula);
	    	var lexer = new JsFormulaParserLexer(input);
	    	var tokens = new org.antlr.runtime.CommonTokenStream(lexer);
	    	tokens.LT(0); // 0 means to fill tokens buffer the same with fillbuffer,but fillbuffer is protected function.
	    	if(tokens.tokens.length>websheet.Constant.MaxFormulaTokens)
					throw websheet.Constant.ERRORCODE["519"];
	    	if(websheet.parse.parseHelper._cellHasUnicode)
		    	websheet.parse.parseHelper._normalizeTokens(tokens);
	    	var parser = new JsFormulaParserParser(tokens);
	    	parser.bLocaleSensitive = bLocaleSensitive;
	    	parser.bNotParseRef = bNotParseRef;
	    	parser.tokenList = tokenList;
	    	parser.prog();
		}catch(e)
		{
			tokenList = [];
		}
		finally{
			//remove leftbrace and leftfuncbrace
			var tmpList = new Array();
	    	var len = tokenList.length;
			for(var i = 0; i < len; i++){
				var token = tokenList[i];
				if((token._text == "leftbrace") || (token._text == "leftfuncbrace"))
					continue;
				tmpList.push(token);
			}
			tokenList = tmpList;
			
			if (this.isCacheEnabled() && len > 0 ) {
					this._cachedTokens[formula] = tokenList;
			} 
			
			return tokenList;
		}
	},
	
	/*
	 * parse the formula with auto correction if it contains seperator errors
	 * @param formula: the formula string
	 * @param bLocaleSensitive: if parse the locale number
	 * @param bNotParseRef: parse the cell/range reference or not, 
	 * 						if only care about the locale number, then does not need to parse ref
	 * @param bMS: the formula is in XLS or ODS format
	 */
	parseWithAutoCorrect: function(formula, bLocaleSensitive, bNotParseRef, bMS, bShowDlg)
	{
		var tokenList = new Array();
		var errTokenList = new Array();
		var bAutoCorrect = true;
		var sep = websheet.Constant.TokenStr.ODF.ARG_SEP;
		if(bMS)
			sep = this.getArgSepByLocale();
		try {
			var input = new org.antlr.runtime.ANTLRStringStream(formula);
			var parser;
			websheet.parse.parseHelper._cellHasUnicode = false;
			if(sep == websheet.Constant.TokenStr.ODF.ARG_SEP)
			{
		    	var lexer = new JsFormulaParserLexer(input);
		    	var tokens = new org.antlr.runtime.CommonTokenStream(lexer);
		    	tokens.LT(0); // 0 means to fill tokens buffer the same with fillbuffer,but fillbuffer is protected function.
		    	if(tokens.tokens.length>websheet.Constant.MaxFormulaTokens){
		    		bAutoCorrect = false;
					throw websheet.Constant.ERRORCODE["519"];
		    	}
		    	if(websheet.parse.parseHelper._cellHasUnicode)
		    		websheet.parse.parseHelper._normalizeTokens(tokens);
		    	parser = new JsFormulaParserParser(tokens);
			}else
			{
				var lexer = new JsFormulaCommaParserLexer(input);
		    	var tokens = new org.antlr.runtime.CommonTokenStream(lexer);
		    	tokens.LT(0); // 0 means to fill tokens buffer the same with fillbuffer,but fillbuffer is protected function.
		    	if(tokens.tokens.length>websheet.Constant.MaxFormulaTokens){
		    		bAutoCorrect = false;
					throw websheet.Constant.ERRORCODE["519"];
		    	}
		    	if(websheet.parse.parseHelper._cellHasUnicode)
		    		websheet.parse.parseHelper._normalizeTokens(tokens);
		    	parser = new JsFormulaCommaParserParser(tokens);
			}
			parser.bLocaleSensitive = bLocaleSensitive;
	    	parser.bNotParseRef = bNotParseRef;
	    	parser.bMS = bMS;
	    	parser.inFunc = 0;
	    	parser.bAutoCorrect = bAutoCorrect;
	    	parser.sepChar = sep;
	    	parser.bSepToken = bMS;//if return the seperator token
	    	parser.errTokenList = errTokenList;//contain the wrong token for MS/ODS formula format
	    	parser.tokenList = tokenList;
	    	parser.locale = pe.scene.getLocale();
	    	parser.prog();
	    	
	    }catch(e)
		{
	    	if(bAutoCorrect)
	    	{
	    		if(bShowDlg)
	    			this._showErrorDlg(formula, sep, errTokenList, tokenList);
	    		throw "error formula";
	    	}
	    	tokenList = [];
		}
	    if(bAutoCorrect && (errTokenList.length>0))
    	{
	    	if(bShowDlg)
	    		this._showErrorDlg(formula, sep, errTokenList, tokenList);
	    	throw "error formula";
    	}
    	//remove leftbrace and leftfuncbrace
		var tmpList = new Array();
    	var len = tokenList.length;
		for(var i = 0; i < len; i++){
			var token = tokenList[i];
			if((token._text == "leftbrace") || (token._text == "leftfuncbrace") )
				continue;
			tmpList.push(token);
		}
		tokenList = tmpList;	
		return tokenList;	
	},
	_showErrorDlg:function(formula, sepChar, errTokenList, tokenList)
	{
		var nls = dojo.i18n.getLocalization("websheet.event","FormulaHelper");
		var msg = "";
		var errorType = -1;

		for(var i=0; i<errTokenList.length; i++)
		{
			var token = errTokenList[i];
			var type = token.getType();
			if(type == "boolean"){
				errorType = 4;
				break;
			}else if(type == "number"){
				errorType = 3;
				break;
			}else if(type == "reffunct"){
				errorType = 2;
				break;
			}else if(type == websheet.Constant.FormulaTokenType.ARG_SEP || type == websheet.Constant.FormulaTokenType.SHEET_SEP){
				errorType = 1;
				break;
			}else {
				errorType = 0;
				break;
			}
			
		}
		if(errTokenList.length == 0)
			errorType = 0;
			
		switch(errorType){
			case 0:
				msg = dojo.string.substitute(nls.COMMON_ERROR_INFO);
				break;
			case 1:
				var eSepChar = sepChar;
				if(sepChar == websheet.Constant.TokenStr.ODF.ARG_SEP)
					eSepChar = websheet.Constant.TokenStr.XLS.ARG_SEP;
				else
					eSepChar = websheet.Constant.TokenStr.ODF.ARG_SEP;
				msg = dojo.string.substitute(nls.SEP_ERROR_INFO,[sepChar, eSepChar]);
				break;
			case 2:
				var errName = token.getText();
				var rightName = token.getChangedText();
				msg = dojo.string.substitute(nls.FORMULA_ERROR_INFO,[rightName, errName]);
				break;
			case 3:
				msg = nls.NUM_ERROR_INFO;
				break;
			case 4:
				var errName = token.getText();
				var rightName = token.getChangedText();
				msg = dojo.string.substitute(nls.BOOOL_ERROR_INFO,[rightName, errName]);
				break;
		}
		var callbk = this._setInputFocus;
		var dlg = new concord.widgets.MessageBox(null, nls.TITLE, nls.OK_LABEL, false, {message:msg, callback:callbk});
		dlg.show();
	},
	
	_setInputFocus:function(editor)
	{
		var grid = websheet.Main.getCurrentGrid();
//		var sheetName = grid.getSheetName();
//		var store =  data.getStore(sheetName);
	    var rowIndex = grid.selection.getFocusedRow();
	    
	    if( (rowIndex >= grid.scroller.firstVisibleRow)
	    		&& (rowIndex <= grid.scroller.lastVisibleRow)){
	    	var inlineEditor = grid.getInlineEditor();
			if (inlineEditor && inlineEditor.isEditing()){
				setTimeout(dojo.hitch(inlineEditor, "focus"), 400);
			}
	    }
	    else{
	    	var formulaBar = websheet.Main.getFormulaBar();
	    	if (formulaBar) formulaBar.formulaInputLineNode.focus();
	    }
	},
	/**
	 * According to the current locale, return the parameter separators, which should be "," or ";"
	 */
	getArgSepByLocale:function()
	{
		var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", pe.scene.getLocale());
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
		var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", pe.scene.getLocale());
		var decimal = bundle["decimal"];
		if(decimal == ",")
			return ".";
		else
			return ",";
	},
	//generate reference token
	//bMS = true, means that the text is the MS cell/range/namerange format, which use "!" as the sheet name separator
	generateToken:function(text, bMS, bAutoCorrect,errTokenList)
	{
		var token;
		var type = this.isSpecialNameValue(text);
		if(type != -1){
			token = this.specialNameDeal(text,type,errTokenList);
		}else{ // normal name
			//TODO: support 'Sheet1'!a1:Sheet1!a5
			var parsedRef = websheet.Helper.parseRef(text);
			if(parsedRef)
			{
				var tokenType ="range";
				if(parsedRef.getType() == websheet.Constant.RangeType.CELL)
					tokenType = "cell";
					
				token =  new websheet.parse.referenceToken();
				token.setType(tokenType);
				token.setText(text);
				token.setChangedText(parsedRef.toString());//always use "." as the sheet name separator
				token.setRef(parsedRef);
				return token;
			}
				
			else if(bAutoCorrect)
			{
				//if the range/cell/namerange address is the !bMS format, then set it to error token list
				parsedRef = websheet.Helper.parseRef(text, true);
				if(parsedRef)
				{
					if(parsedRef.isValid())
					{
						token =  new websheet.parse.referenceToken();
						token.setType(websheet.Constant.FormulaTokenType.SHEET_SEP);
						if(bMS)
						{
							token.setText(websheet.Constant.TokenStr.ODF.SHEET_SEP);
							token.setChangedText(websheet.Constant.TokenStr.XLS.SHEET_SEP);
						}else
						{
							token.setText(websheet.Constant.TokenStr.XLS.SHEET_SEP);
							token.setChangedText(websheet.Constant.TokenStr.ODF.SHEET_SEP);
						}
						return token;
					}				
				}				
			}		
			//generate name range reference token
			var colonI = text.indexOf(":");
       	 	if(colonI != -1){
	       	 	var text1 = text.substring(0,colonI);
	       	 	var text2 = text.substring(colonI+1);
	       	 	var token1 = this.generateToken(text1, bMS, bAutoCorrect,errTokenList);
	       	 	var token2 = this.generateToken(text2, bMS, bAutoCorrect,errTokenList);
	       	 	var ct1 = token1.getChangedText();
	       	 	var ct2 = token2.getChangedText();
	       	 	if(token1 && token1.getType() != "namerange"){
		       		token = token1;
	       	 	}else if(token2 && token2.getType() != "namerange"){
		       		token = token2;
	       	 	}
	       	 	if(token != null){
		       	 	//combine the result of these two token
		       	 	token.setText(text);
		       	 	token.setChangedText(ct1 + ":" + ct2);
		       	 	return token;
	       	 	}
       	 	}
			var tokenType = "namerange";
			token =  new websheet.parse.referenceToken();
			token.setType(tokenType);
			token.setText(text);
			//token.setRef(parsedRef);
		}
		return token;	
	},
	
	/**
	 * process special name value such as boolean 
	 * 
	 * @param name
	 * @returns 1:bool
	 */
	isSpecialNameValue:function(name){
		if(typeof name !="string")
	   		return false;
		
		var isSpecialType = -1;
		var upperName = name.toUpperCase();
		var recognizer = websheet.i18n.numberRecognizer;
		// Boolean
		if(recognizer.isBoolValue(upperName, true)){
			var locale = pe.scene.getLocale();
//			var nls = websheet.i18n.Number.getNLS();
//			/**
//			 * Not only ignore English locale but also ignore the boolean value is TRUE or FALSE.
//			 */
//			if(locale.indexOf("en") != -1 || (nls.TRUE == "TRUE" && nls.FALSE == "FALSE")){
//				isSpecialType = 0;
//			}else{
//				isSpecialType = 1;
//				// others
//			}			
			isSpecialType = 0;
		}else{
			// others
		}

		return isSpecialType;
	},
	/**
	 * process special name such as boolean 
	 * @param name
	 * @param type
	 * @param errList
	 * @returns {websheet.parse.referenceToken}
	 */
	specialNameDeal:function(name,type,errTokenList){
		var token = null;
		var upperName = name.toUpperCase();
		var recognizer = websheet.i18n.numberRecognizer;
	    switch(type){
		    case 0:
		    	break; // no need to create Token.
	   		case 1:
	   			token = new websheet.parse.referenceToken();
	   			/**
	   		    * De or others: TRUE,FALSE need to popup error dialog
	   		    */
	   			if(upperName == "TRUE" || upperName == "FALSE"){
	   			   token.setChangedText(recognizer.transBoolEn2Locale(upperName));
	   			   errTokenList.push(token);
	   			}else{
	   		   	   token.setChangedText(recognizer.transBoolLocale2En(upperName));
	   			}
	   			token.setType("boolean");
	   			token.setTextOnly(name);	   			
	   			break;
	   		default:
	   			break;
	    }
	    return token;
	},

	/*
	 * normalize the locale-sensitive "number" in the given number token or
	 * format with default number format the locale-independent "number" if 
	 * bEditValue == true  
	 * @param tokenList		number token List that would contain locale-sensitive "number"
	 * @bEditValue			true if need to format with default number format
	 */
	/*void*/normalize: function(/*tokenList*/tokenList, bEditValue)
	{
		for (var i = 0; i < tokenList.length; i++) {
			var token = tokenList[i];
			if (token.getType() == "number") {
				var formatType = websheet.Constant.FormatType["NUMBER"];
				var fValue;
				if (bEditValue) {
					fValue = token.getText();
					var format = websheet.i18n.Number.getDefaultFormatForEditValue(formatType);
					fValue = websheet.i18n.Number.format(fValue, format);
				} else {
					var parseResult = websheet.i18n.numberRecognizer.parse(token.getText(), true);
					if (parseResult.isNumber) {
						if (parseResult.formatType == websheet.Constant.FormatType["BOOLEAN"]) {
							var format = websheet.i18n.Number.getDefaultFormatForEditValue(parseResult.formatType);
							fValue = websheet.i18n.Number.format(fValue, format);
						} else
							fValue = parseResult.fValue;
					}
				}

				if (fValue) token.setChangedText(fValue);
			}
		}
	},
	
	/*
	 * regenerate tokens according to the changed text in  refence tokens
	 */
	regenerateTokens: function(tokens)
	{
		if(!tokens) return null;
		var newTokens = new  Array();
		var inclen = 0;
		for(var i = 0; i < tokens.length; i++)
		{
			var token = tokens[i];
			var newToken = new websheet.parse.referenceToken();
			newToken.clone(token);
			// with enabling the cached formula token when autofill or paste one range,
			// the index in the formula token would be incorrect, so we must set it correctly
			if(inclen != 0)
				newToken.setIndex(token.getIndex() + inclen); // re-position the index;
			var newText = token.getChangedText();
			var oldText = token.getText();
			inclen+= newText.length - oldText.length; // the variable is not null?
//			var ref = websheet.Helper.parseRef(newText);
			newToken.setText(newText);
			
//			newToken.setRef(ref);
			newTokens.push(newToken);
		}
		return newTokens;
	},
	/**
	 * update formula and token array according to tokenList changed text
	 * @param formula original formula
	 * @param tokenList have the changed text for each token
	 * @param tarr	original formula
	 * @returns new formula, and overwrite tarr with the new token array
	 */
	updateFormula: function(formula, tokenList, tarr)
	{
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
        if(this.isCacheEnabled())
        {
        	var newTokens = this.regenerateTokens(tokenList);
        	this._cachedTokens[newFormula] = newTokens;
        }
        	
        return newFormula;
	},
	
	// The mal-formed formula doesn't have token, when display the formula string in formula bar
	// or inline-editor, need to convert the internal formula representation in ODF format to
	// external formula representation in MS office format
	/*string*/convertToMSFormat:function(/*string*/formula){
		var msFormula = "";
		try {
			var input = new org.antlr.runtime.ANTLRStringStream(formula); 
			var lexer = new JSExprLexer(input);
			var tokens = new org.antlr.runtime.CommonTokenStream(lexer);
			tokens.LT(0); // 0 means to fill tokens buffer the same with fillbuffer,but fillbuffer is protected function.
			if(websheet.parse.parseHelper._cellHasUnicode)
				websheet.parse.parseHelper._normalizeTokens(tokens);
			if(tokens)
			{
				var tokenList = tokens.getTokens();
				var source = tokens.getTokenSource();
				var length = tokenList.length;
				var prevToken;
				var ft = websheet.functions.FormulaTranslate;
				var nr = websheet.i18n.numberRecognizer;
				for(var i=0 ; i<length; i++){
					var token = tokenList[i];
					var text = "";
					switch(token.type)
					{
						case source.ARG_SEP: 
							text = this.getArgSepByLocale();
							prevToken = token;
							break;
						case source.CONCATENATION:
							text = ",";
							prevToken = token;
							break;// ~
						case source.INTERSECT:
							text = " ";
							prevToken = token;
							break;// !
						case source.P_OPEN:				
							var prevText = prevToken.getText();
							if(prevToken.type == source.RANGE_FUNC){
								text = ft.transFuncNameEn2Locale(prevText) || prevText;
								//reset the msFormula
								var index = msFormula.lastIndexOf(prevText);
								msFormula = msFormula.substring(0,index);
							}
							text += token.getText();
							prevToken = token;
							break;
						case source.NAME:// . -> !
							var tokenText = token.getText();
							if(websheet.Helper.parseRef(tokenText)){
								text = tokenText.replace(/('?.+'?)(\.)(.+)/, "$1!$3");
							}else{
								text = tokenText;
							}
							prevToken = token;
							break;
						case source.WHITESPACE1:
							// do nothing
							text = token.getText();
							break;
						case source.RANGE_FUNC:
							/**
							 * TRUE or FALSE 
							 */
							var text = token.getText();
							if(nr.isBoolValue(text,true)){
								text = nr.transBoolEn2Locale(text);
							}
							prevToken = token;
							break;
						default:
							prevToken = token;
							text = token.getText();
							break;
					}
					msFormula+=text;
				}
			}
		}catch(e){
			msFormula = formula;
		}finally{
			return msFormula;
		}
	},
	
	/* referenceToken[] */ getTokenList: function(formula, tarr) {
		// summary: Get all reference token from formula text. In case returning other parts of the formula, handy for
		// 		formula transformation. All values returned by parameter
		// parameters:
		//		formula: formula text
		//		tarr: 2-dim token array returned by cellModel
		// returns:
		//		tokenList: empty array, can't be null, token list returned from this array
		var tokenList = [];
		for (var i = 0; i < tarr.length; i++) {
			var arrToken = tarr[i];
			var from = arrToken[0];
			var to = arrToken[1];
			var strToken = formula.substring(from, to);
			var token = this.generateToken(strToken);
			//must do it, otherwise setCelLEvent.transformData2Id will set change text to #REF!.A1 if delete the referenced sheet
			token.setText(strToken);
			token.setIndex(from);
			tokenList.push(token);
		}
		return tokenList;
	},
	isNumber:function(str){
		var tmpValue = parseFloat(str);			
		if(!isNaN(tmpValue) && isFinite(tmpValue)) 
			return true;
		else
			return false;
	},
	
	// in Germany Local, . is matched as one token of name/number(antlr parser).  test1.abc(name), 1.2,3(number)
	// Other side, it's a seprator in constant array   {1.2,3;TRUE."ABC"} 2D array
	_parseCommaConstArray: function (text, arrayInfo) {
		var array = text.split(".");
		var len = array.length;
		for (var i = 0; i < len; i++) {
			var value = array[i].toUpperCase();
			var subArray = value.split(",");
			// convert 1,2 to 1.2(, can be existed in a number)
			if (subArray.length > 2) {
				return false;
			} else if (subArray.length == 2){
				// =,5, should be 0.5 and 5, to 5
				if (subArray[0].length == 0)
					subArray[0] = 0;
				if (subArray[1].length == 0)
					subArray[1] = 0;
				value = subArray.join(".");
				array[i] = parseFloat(value);
			}
			
			if (value.length == 0) {
				// .1.2. the first and last ".", set sepCount = 1
				if ((i == 0 || i == len - 1) && (arrayInfo.sepCount == -1))
					arrayInfo.sepCount = 1;
				else
					return false;
			} else {
				// .1.2. token "1" and "2", set sepCount = -1
				arrayInfo.sepCount = -1;
				// every token should be boolean(TRUE/FALSE), ERROR(#VALUE!...), NUMBER
				var type = this.isSpecialNameValue(value);
				// convert WAHR/FALSCH to TRUE/FALSE
				if (type != -1)
					array[i] = websheet.i18n.numberRecognizer.transBoolLocale2En(value);
				else if ((value == websheet.parse.parseHelper.getErrorObj(value))
						&& !this.isNumber(value))
					return false;
			}
		}
		
		if (!arrayInfo.rowLen)
			arrayInfo.firColLen += len - 1;
		else
			arrayInfo.colLen += len - 1;
		arrayInfo.changedText += array.join(";");
		return true;
	},
	
	// number(+1, 1.5, 1.2E+3), string(doublequot string), error(error name), boolean(true/false)
	// sep, 1D seprator of constant array "," or "." (German) and 2D seprator ";"
	isConstArrayToken: function(tokens, index, sourceToken, arrayInfo, sep) {
		//.1. or .1.true.
		if (sep == "." && (arrayInfo.sepCount > 1 || arrayInfo.sepCount < -1))
			return false;
			
		var bToken = false;
		var token;
		if (index < 0)
			token = tokens;
		else
			token = tokens[index].getName();
		var text = token.getText();
		arrayInfo.text += text;
		
		if (token) {
			switch (token.type) {
				case sourceToken.LOCALE_NUMBER:
					if (sep == ".") {
						bToken = this._parseCommaConstArray(text, arrayInfo);
					} else if(websheet.i18n.numberRecognizer.parse(text, true).isNumber){
						bToken = true;
						arrayInfo.changedText += parseFloat(text);
					}
					break;
				case sourceToken.ERRORNAME:
				case sourceToken.DOUBLEQUOT_STRING:
					bToken = true;
					arrayInfo.changedText += text;
					if (sep == ".") {
						// previous token should be "."(sepCount =1) or null(sepCount=0)
						if (arrayInfo.sepCount == 0 || arrayInfo.sepCount == 1)
							arrayInfo.sepCount = -1;
						else
							bToken = false;
					}
					break;
				case sourceToken.NAME:
					// TRUE/FALSE is parsed as name now
					if (sep == ",") {
						var text = text.toUpperCase();
						arrayInfo.changedText += text;
						if (text == "TRUE" || text == "FALSE")
							bToken = true;
					} else {
						bToken = this._parseCommaConstArray(text, arrayInfo);
					}
					break;
				case sourceToken.MINUS:
				case sourceToken.PLUS:
					arrayInfo.changedText += text;
					//+/- number (+1, -1.5), not ++1, --1.5 or 1+2
					if (index >= 0 && (index + 1 < tokens.length)) {
						if (index > 0) {
							var lastToken = tokens[index - 1].getName();
							if (lastToken.type != sourceToken.ARG_SEP)
								break;
						}
						// it should be a number
						var nextToken = tokens[index + 1].getName();
						if (nextToken.type == sourceToken.LOCALE_NUMBER) {
							bToken = true;
						} else if ((sep == ".") && (nextToken.type == sourceToken.NAME)) {
							// . can be existed in names, so 1.2.TRUE be matched as NAME,
							// but in constant array, i should be 3 tokens ,and seprate by "."
							var nextText = nextToken.getText();
							var index = nextText.indexOf(".");
							if (index > 0) {
								var res = nextText.substr(0, index);
								res = parseFloat(temp);
								if (v || v == 0)
									bToken = true;
							}
						}
					}
					break;
			}
		}
		return bToken;
	},
	
	// float(number), string(doublequot string), error(error name), boolean(true/false)
	isConstArray: function(curToken, sourceToken, arrayInfo, sep) {
		var tokenCount = curToken.getTree().getChildCount();
		var bToken = false;
		var token;
		var text;
		if (!tokenCount) {
			token = curToken.getTree().getName();
			bToken = this.isConstArrayToken(token, -1, sourceToken, arrayInfo, sep);
		} else {
			var tokens = curToken.getTree().getChildren();
			for (var i = 0; i < tokenCount; i++) {
				bToken = this.isConstArrayToken(tokens, i, sourceToken, arrayInfo, sep);
				if (!bToken)
					break;
			}	
		}
		return bToken;
	}
};