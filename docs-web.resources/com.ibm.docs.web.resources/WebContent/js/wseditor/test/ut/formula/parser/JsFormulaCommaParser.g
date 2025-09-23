grammar JsFormulaCommaParser;

options {
    output=AST;
    ASTLabelType=CommonTree; // type of $stat.tree ref etc...
    k = 0;
    language=JavaScript;
    backtrack=true;
    memoize=true;
}

tokens {
  COLON = ':';
  CONCATENATION = '~';
  INTERSECT_ODS = '!';
  AND = '&';
  PLUS  = '+' ;
  PLUSEQUAL='+=';
  MINUS = '-' ;
  MINUSEQUAL='-=';
  MULT  = '*' ; 
  MULTEEQUAL='*=';
  DIV = '/' ;
  DIVEQUAL='/=';
  P_OPEN = '(';
  P_CLOSE = ')';
  EQUAL='=';
  LESS='<';
  LESSEQUAL='<=';
  GREATER='>';
  GREATEREQUAL='>=';
  NOTEQUAL='<>';
  NOTEQUAL2='!=';
  AMPERSAND='&&';
  OR='||';
  POW='^';
  MODE='%';
  MODEQUAL='%=';
  ARRAY_FORMULAR_START = '{';
  ARRAY_FORMULAR_END = '}';
}
@lexer::header {

}
@header {

}
@lexer::members {
 	this.emitErrorMessage = function(e) {
        if(console) {
            console.warn(e);
        }
        throw ("#ERROR!");
    }; 
}

@members {
	this.tokenList = [];
	this.intersectionStack = [];
	this.emitErrorMessage = function(e) {
        if(console) {
            console.warn(e);
        }
        throw ("#ERROR!");
    };
}

/*------------------------------------------------------------------
 * PARSER RULES
 *------------------------------------------------------------------*/
 prog returns [String value]
  @init {
  	this.inConstArray = 0;
  }
  : EQUAL INTERSECT? expr+ {} EOF
  | ARRAY_FORMULAR_START EQUAL 
  	{
  		
  	}	
  	expr+ {} ARRAY_FORMULAR_END EOF
  ;

expr returns [String value]
    :   a=atom 
    
    	(sp=INTERSECT{ // match "=A1 B1" and "=A1 +B1"
    		if(this.bLocaleSensitive){
	    	    var token = new websheet.parse.referenceToken($sp.text,$sp.getStartIndex());
		    this.tokenList.push(token);
		    this.intersectionStack.push(this.tokenList.length - 1);
			}
    	 })?
  	 	( MODE{
    	 	if(this.bLocaleSensitive){
    	 		var token = new websheet.parse.referenceToken($MODE.text,$MODE.getStartIndex());
				this.tokenList.push(token);
    	 	}
         })*
		((
		m=(LESS|GREATER|LESSEQUAL|GREATEREQUAL
			|MODEQUAL|MULTEEQUAL|MINUSEQUAL|PLUSEQUAL|DIVEQUAL
			|NOTEQUAL|NOTEQUAL2|EQUAL
			|AND|MINUS|PLUS
			|MULT|DIV
			|COLON
			|POW|ARG_SEP|CONCATENATION){ // match "=A1!A1" "=A1!A1!A1" "=A1~A1~A1"
				if(this.bLocaleSensitive){
					var token = new websheet.parse.referenceToken($m.text,$m.getStartIndex());
					this.tokenList.push(token);
					if(this.bMS){
					  if($m.text == "~")
					    this.errTokenList.push(token);
					  else if(this.inFunc === 0){//if it is in function, there are logic set change text from "," to ";"
					  			//but here if not in fucntion, we should treat "," as union operator "~"
					    //formula like =A1:B2,C3:D4 which not have the function name and bracket
					    //should treate ARG_SEP as union operator (~)
					    if($m.text == this.sepChar){//","
					       var left = this.tokenList[this.tokenList.length - 2];
					       if(left && (left._type == "range" || left._type == "cell" || left._type == "namerange" 
						 || (left._type == "reffunct" && (websheet.functions.Util.getErrPropByName(left.getChangedText()) & websheet.Constant.CellErrProp.RETURN_REF)))){
					           token.setChangedText("~");
					       }
					    	
					    }else if($m.text == ";" && this.inConstArray === 0) {
					    // if use ARG_SEP which is not equal with sepChar, should remind user
					    	if(this.bAutoCorrect)
						{
						  token.setType(websheet.Constant.FormulaTokenType.ARG_SEP);
						  token.setChangedText(this.sepChar);
						  this.errTokenList.push(token);
						}else
						  throw "separator error!";
					    }
					  }
					}
				}
			} INTERSECT? )?  // match "=A1+ B1"
			b=expr {
			if($m || $sp){
				$value = $b.value;
				
				if( $sp && !$m){
					var length = this.tokenList.length;
					var index = this.intersectionStack[this.intersectionStack.length - 1];
		    			if(length > 1 && this.bLocaleSensitive && index){			
					
						var operator = this.tokenList[index];
				       	 	
		    				if( operator && operator.getText().replace(/[ ]+/ig, " ") == " "){ // intersection operator in XLS is " " but "~" in ODS        			    		
				    			//check left type, indirect & offset with the type "reffunct"
				    			var isLeftOK = false;
				    			var left = this.tokenList[index-1]; 
				           		if(left && (left._type == "range" || left._type == "cell" || left._type == "namerange" 
								|| (left._type == "reffunct" && (websheet.functions.Util.getErrPropByName(left.getChangedText()) & websheet.Constant.CellErrProp.RETURN_REF)))){
				           			isLeftOK = true;
				           		}
				    		
				    			//check right type
				    			var isRightOK = false;
				    			var right = this.tokenList[index+1];
				    			if(right && (right._text == "leftbrace") || (right._text == "leftfuncbrace") ){
				    				right = this.tokenList[index+2];
				    			}
				    			
				           		if(right && (right._type == "range" || right._type == "cell" || right._type == "namerange" 
								|| (right._type == "reffunct" && (websheet.functions.Util.getErrPropByName(right.getChangedText()) & websheet.Constant.CellErrProp.RETURN_REF)))){
				           			isRightOK = true;
				            		}
				    		
				    			//check if operator is a valid INTERSECT
				    			if(isLeftOK && isRightOK){
					        		operator.setType(websheet.parse.tokenType.OPERATOR_TOKEN);
								operator.setChangedText("!"); // " " ==> "!"
				    			}else{
				    				this.errTokenList.push(operator);
				    			}
			    			}
		    			}
				}
			}else
				throw "Error Syntax";
		})*   {
		if( $sp)
		 this.intersectionStack.pop();
		}
    ;  
atom returns [String value]
  :
  '-' INTERSECT? (b=atom){
     
  	}
  |'+' INTERSECT? (b=atom){
     
  	}
  // INT:INT
  // INT!INT:INT
  // SINGLEQUOTE!INT:INT
  | (sn=(SINGLEQUOT_STRING|LOCALE_NUMBER) m=INTERSECT_ODS (wp2=INTERSECT)?)? x=LOCALE_NUMBER em=COLON  endName=(NAME|LOCALE_NUMBER) {
  {
    	if(!this.bNotParseRef) // 123!a1 or 1:2
	    {
	    	var text = "";
	    	var textWithWp = "";
	    	if($sn.text){
	    		text += $sn.text;
	    		textWithWp += $sn.text;
	   	 	text += $m.text;
	   	 	textWithWp += $m.text;
	   	 	if($wp2.text)
	    			textWithWp += $wp2.text;
	   	}
	        text += $x.getText().trim(); // the number can be '3.2  ' with spaces
	        textWithWp += $x.getText(); 
	        text += $em.text;
	        textWithWp += $em.text;
	        text += $endName.text.trim();
	        textWithWp += $endName.text;
        	//TODO:need to support =sum(3.2!a1:'3.2'!a4)
			var token = websheet.event.FormulaHelper.generateToken(text, this.bMS, this.bAutoCorrect,this.errTokenList);
			if(token)
			{
				if($sn.text)
					token.setIndex($sn.getStartIndex());
				else
					token.setIndex($x.getStartIndex());
					
				if(token.getType() == websheet.Constant.FormulaTokenType.SHEET_SEP)
				{
					this.errTokenList.push(token);
				}else
				{
					token.setTextOnly(textWithWp);
					this.tokenList.push(token);
				}
			}
	    }
	   
	    } // end of else if
    }
  // NUMBER
  // SINGLEQUOT_STRING
  // SHEET!INT
  // SHEET!NAME
  // SHEET!INT:INT
  // SHEET!NAME:NAME
  // SHEET!INT:NAME
  // SHEET!INT:SHEET!INT
  // SHEET!NAME:SHEET!NAME
  // SHEET!NAME:SHEET!INT
    | x=(SINGLEQUOT_STRING|LOCALE_NUMBER) ( m=INTERSECT_ODS (wp2=INTERSECT)? ename=(ERRORNAME|NAME) (wp3=INTERSECT)?)? ( em=COLON ((wp4=INTERSECT)? x2=(SINGLEQUOT_STRING|LOCALE_NUMBER) m2=INTERSECT_ODS (wp6=INTERSECT)?)? endName=(ERRORNAME|NAME))? {
	{
		if(!this.bNotParseRef && $m.text)
	    {
	        var text = $x.getText();
	        var textWithWp = text;
	        if($m.text){
	        	text += $m.text;
	        	textWithWp += $m.text;
	        	if($wp2.text)
	        		textWithWp +=$wp2.text;
	        	text += $ename.text;
	        	textWithWp += $ename.text;
	        	if($wp3.text)
	        		textWithWp +=$wp3.text;
	        }
	
	        if($em.text){
        		
	        	text += $em.text;
		        textWithWp += $em.text;
		        if($wp4.text)
	        		textWithWp +=$wp4.text;
		        if($m2.text){
		       		text += $x2.text.trim();
		        	textWithWp += $x2.text;
		        	text += $m2.text;
		        	textWithWp += $m2.text;
		        	if($wp6.text)
	        			textWithWp +=$wp6.text;
		        }
		        text += $endName.text.trim();
		       	textWithWp += $endName.text;
        	}else{
        		//TODO: Sheet!1 , Sheet!a				
        	}
			var token = websheet.event.FormulaHelper.generateToken(text, this.bMS, this.bAutoCorrect,this.errTokenList);
			if(token)
			{
				if(token.getType() == websheet.Constant.FormulaTokenType.SHEET_SEP)
				{
					token.setIndex($m.getStartIndex());
					this.errTokenList.push(token);
				}else
				{
					token.setIndex($x.getStartIndex());
					token.setTextOnly(textWithWp);
					this.tokenList.push(token);
				}
			}
	    }else  if(this.bLocaleSensitive)
	     {
	      var text = $x.getText();
	      var token = new websheet.parse.referenceToken(text,$x.getStartIndex(),"number");
	       
	      var parseResult = websheet.i18n.numberRecognizer.parse(token.getText(), true);
	      if (parseResult.isNumber) {
	      	if (parseResult.formatType == websheet.Constant.FormatType["NUMBER"]
	      	|| parseResult.formatType == websheet.Constant.FormatType["PERCENT"]
	      	|| parseResult.formatType == websheet.Constant.FormatType["SCIENTIFIC"]) {
				fValue = parseResult.fValue;
				if(this.bMS)
				{
					//if text contains group separator, should put it into error token list
					//to suggest user that put it in ""
					if(!this.group)
					{
						var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", this.locale);
						this.group = bundle["group"];
					}
					if(text.indexOf(this.group) > -1)
					{
						//error token list with number if param separator is ","
						this.errTokenList.push(token);
					}else{
					  if (parseResult.formatType == websheet.Constant.FormatType["NUMBER"]
					  || parseResult.formatType == websheet.Constant.FormatType["SCIENTIFIC"])
					  	token.setChangedText(fValue);
					  else{
	        				var idx=parseResult.percentageNum;
	        				var changeText=websheet.Math.mul(fValue,websheet.Math.pow(100,idx));
	        				for(var i=0;i<idx;i++)
	        					changeText=changeText+'%';
	        				token.setChangedText(changeText);
	                    		      }
					  this.tokenList.push(token);
					}
				}else{
				  if (parseResult.formatType == websheet.Constant.FormatType["NUMBER"]
				  || parseResult.formatType == websheet.Constant.FormatType["SCIENTIFIC"])
						token.setChangedText(fValue);
					  else
						token.setChangedText(websheet.Math.mul(fValue,100)+'%');
					 	this.tokenList.push(token);
				}
			}
	      }else if(websheet.Helper.isNumeric(text) || websheet.Helper.isPercent(text)){
		      	this.errTokenList.push(token);
	      }
	     }
      }
	}
  | x=DOUBLEQUOT_STRING {
     
   
      }   
  | (brace=P_OPEN){
  		if(this.bLocaleSensitive){
  			//TODO: remove index?
			var token = new websheet.parse.referenceToken("leftbrace",$brace.getStartIndex());
			this.tokenList.push(token);
		}
	} 
    (
    	INTERSECT? // match =sum((  a1  , a2 ))
    	expr
    	INTERSECT? // match =sum((  a1  , a2 ))
	ebrace=P_CLOSE
	{
		if(this.bLocaleSensitive){
			//concatenation operator is "," in XLS but "~" in ODS
			var length = this.tokenList.length;
			if(length > 0){
			    var index=length-1;
			    var temp=this.tokenList[index];
			    if(temp.getText().replace(/[ ]+/ig, " ")==" "){ //to match (A1,A2 ) (A1,A2) and ignore the whitespace before '('
			      	this.tokenList.pop();
			    }
			}
			if(length > 1){
				var anch = length - 2; //the first "," from the right
				var operator = this.tokenList[anch];
				var op;
				while(operator){
					op = anch >= 0 ? operator.getText() : null;
					if(op == "leftbrace"){
						this.tokenList.splice(anch,1);
						break;
					}		
				
					op = operator.getText().replace(/[ ]+/ig, " ");
					if(op != "," || operator._changedText == ";"){
						anch--;
						operator = this.tokenList[anch];
						op = anch > 0 ? operator.getText() : null;
						continue;
					}
		
					operator.setType(websheet.parse.tokenType.OPERATOR_TOKEN);
					operator.setChangedText("~");  // "," ==> "~"
						
					anch--;
					operator = this.tokenList[anch];
					op = anch > 0 ? operator.getText() : null;					
				}
			}
		}
    })
  | folded {}
  // {1,2,3;4,5,6}, {1,"AB",2;3,4,"DEF"}
  // {1,2;3} error
  // for 2D
  /*| (a = ARRAY_FORMULAR_START {
  	this.inConstArray++;	
  }) 
  (tokenList = expr {
    	var tokenSource = this.input.getTokenSource();	    	
   	var arrayInfo = {};
	arrayInfo.firColLen = 0; 
	arrayInfo.colLen = 0;
	// 2D constant array, rowlen > 0
	arrayInfo.rowLen = 0;
	arrayInfo.text = "{";
	arrayInfo.newText = "{";
    	var bArray = websheet.event.FormulaHelper.isConstArray(tokenList, tokenSource, arrayInfo);
    })?
  ( ARRAY_FORMULAR_END{
  	this.inConstArray--;  	
    	var startIndex = $a.getStartIndex();
	if (bArray) {
		// pop up the tokens
		this.tokenList.pop();    	
    		var tokenCount = tokenList.getTree().getChildCount();
    		for (var i = tokenCount - 2; i >= 0; i--)
   			this.tokenList.pop();
   		// generate a new constant-array token
	   	var token = new websheet.parse.referenceToken(arrayInfo.text, startIndex);
	  	token.setChangedText(arrayInfo.newText);
	  	token.setType(websheet.Constant.FormulaTokenType.ARG_SEP);
	  	this.tokenList.push(token); 
	} else {
		// notify user it's an invalid const array, need check and re-input
		var errorToken = new websheet.parse.referenceToken("error constant", startIndex);
		this.errTokenList.push(errorToken);
	}
    })*/
   |(a = ARRAY_FORMULAR_START (wp1=INTERSECT)? {
  	this.inConstArray++;	    	
   	var arrayInfo = {};
	arrayInfo.firColLen = 0; 
	arrayInfo.colLen = 0;
	// 2D constant array, rowlen > 0
	arrayInfo.rowLen = 0;
	arrayInfo.text = "{";
	arrayInfo.changedText = "{";
	if($wp1.text)
  		arrayInfo.text += $wp1.text;
  	
  	var tokensCount = this.tokenList.length;
   })
   ((firToken= atom   {	
     	var tokenSource = this.input.getTokenSource();
	var localeSep = websheet.event.FormulaHelper.getArraySepByLocale();
	var bArray = websheet.event.FormulaHelper.isConstArray(firToken, tokenSource, arrayInfo, localeSep);
   })
   ((((wp2=INTERSECT)? sep=ARG_SEP (wp3=INTERSECT)?) {
   	if (bArray) {
   		if($wp2.text) {
  			arrayInfo.text += $wp2.text;
  			$wp2 = null;
  		}
	   	var speText = $sep.getText();
	   	arrayInfo.text += speText;
	  	if (speText == ",") {
			if (arrayInfo.rowLen == 0)
				arrayInfo.firColLen++;
			else
				arrayInfo.colLen++;
			arrayInfo.changedText += ";";
		} else {
			// column length of every row should be same
			if (arrayInfo.rowLen && arrayInfo.colLen != arrayInfo.firColLen)
				throw websheet.Constant.ERRORCODE["512"];
			arrayInfo.colLen = 0;
			arrayInfo.rowLen++;
			arrayInfo.changedText += "|";
		}
		if($wp3.text) {
  			arrayInfo.text += $wp3.text;
  			$wp3 = null;
  		}
	}
   })
   (token = atom {
   	if (bArray)
		bArray = websheet.event.FormulaHelper.isConstArray(token, tokenSource, arrayInfo, localeSep);
    }))*)? 
   ((wp4=INTERSECT)? ARRAY_FORMULAR_END{
   	// when match atom, some tokens(number/boolean/errorname) has been inserted in tokenlist, remove them
   	var curTokensCount = this.tokenList.length;
   	for (var i = tokensCount; i < curTokensCount; i++)
   		this.tokenList.pop();
   
   	if($wp4.text)
  		arrayInfo.text += $wp4.text;
   	this.inConstArray--;
   	// {1,2;3} should return false
   	if (arrayInfo.rowLen && (arrayInfo.firColLen != arrayInfo.colLen))
		bArray = false;
    	var startIndex = $a.getStartIndex();
	if (bArray) {
   		// generate a new constant-array token
	   	var token = new websheet.parse.referenceToken(arrayInfo.text, startIndex);
	  	token.setChangedText(arrayInfo.changedText);
	  	token.setType(websheet.Constant.FormulaTokenType.ARG_SEP);
	  	this.tokenList.push(token); 
	} else {
		// notify user it's an invalid const array, need check and re-input
		var errorToken = new websheet.parse.referenceToken("error constant", startIndex);
		this.errTokenList.push(errorToken);
	}
   })
  // NAME
  // NAME:NAME
  // NAME:INT
  // SHEET!INT
  // SHEET!NAME
  // SHEET!INT:INT
  // SHEET!NAME:NAME
  // SHEET!INT:NAME
  // SHEET!INT:SHEET!INT
  // SHEET!NAME:SHEET!NAME
  // SHEET!NAME:SHEET!INT
  | name1=(ERRORNAME|NAME|NAME1) ( op=INTERSECT_ODS (wp2=INTERSECT)? ename=(ERRORNAME|NAME|LOCALE_NUMBER) (wp3=INTERSECT)?)? ( m=COLON ((wp4=INTERSECT)? name2=(NAME|NAME1) op2=INTERSECT_ODS (wp6=INTERSECT)?)?  endName=(ERRORNAME|NAME|LOCALE_NUMBER))? {
	
		if(this.bMS && !this.bNotParseRef){
			var text = $name1.text; //"=Sheet1!A1" should merge to one name token.
			var textWithWp = text;
			if($ename.text){
				text += '!';
				textWithWp += '!';
				if($wp2.text)
					textWithWp += $wp2.text
				text += $ename.text;
				textWithWp += $ename.text;
				if($wp3.text)
					textWithWp += $wp3.text;
			}
			if($m.text){
				text += $m.text;
				textWithWp += $m.text;
				if($op2.text){
					if($wp4.text)
						textWithWp += $wp4.text;
					text += $name2.text;
					textWithWp += $name2.text;
					text += $op2.text;
					textWithWp += $op2.text;
					if($wp6.text)
						textWithWp += $wp6.text;
				}
				text += $endName.text;
				textWithWp += $endName.text;
			}else{
        		//TODO: Sheet!1 , Sheet!a
        		
        	}
			var token = websheet.event.FormulaHelper.generateToken(text, this.bMS, this.bAutoCorrect,this.errTokenList);
			if(token)
			{
				if(token.getType() == websheet.Constant.FormulaTokenType.SHEET_SEP)
				{
					var index = text.split(":")[0].lastIndexOf(token.getText());
					token.setIndex($name1.getStartIndex() + index);
					this.errTokenList.push(token);
				}else
				{
					var tmp = $name1.getStartIndex();
					token.setTextOnly(textWithWp);
					token.setIndex(tmp);
				    this.tokenList.push(token);
				}
				
			}
		}
		else{ // ODF format
			
			var text = $name1.text;
			var textWithWp = text;
			var token,index;
			if(!this.bNotParseRef){
				token = websheet.event.FormulaHelper.generateToken($name1.text, this.bMS, this.bAutoCorrect,this.errTokenList);
				if(token){
					token.setIndex($name1.getStartIndex());
					this.tokenList.push(token);
				}
			}
			if($op.text){
				if(this.bLocaleSensitive){
				
					token = new websheet.parse.referenceToken($op.text,$op.getStartIndex());
					this.tokenList.push(token);
				}
				if(!this.bNotParseRef){
					token = websheet.event.FormulaHelper.generateToken($ename.text, this.bMS, this.bAutoCorrect,this.errTokenList);
					if(token){
						token.setIndex($ename.getStartIndex());
						this.tokenList.push(token);
					}
				}
			}
			
			if($m.text){ // generate range
				if(!this.bNotParseRef)
					this.tokenList.pop();
				if($op.text){ // the range starts from ename
					text = $ename.text;
					textWithWp = $ename.text;
					index = $ename.getStartIndex();
				}else{	// the range starts from name1
					text = $name1.text;
					textWithWp = $name1.text;
					index = $name1.getStartIndex();
				}

				if($wp3.text)
					textWithWp += $wp3.text;
				text += $m.text;
				textWithWp += $m.text;				
				if($op2.text){
					if($wp4.text)
						textWithWp += $wp4.text;
					text += $name2.text;
					textWithWp += $name2.text;
					if(!this.bNotParseRef){
						token = websheet.event.FormulaHelper.generateToken(text, this.bMS, this.bAutoCorrect,this.errTokenList);
						if(token){
							token.setIndex(index);
							token.setTextOnly(textWithWp);
							this.tokenList.push(token);
						}
					}
					if(this.bLocaleSensitive){
						token = new websheet.parse.referenceToken($op2.text,$op2.getStartIndex());
						this.tokenList.push(token);
					}
				}else{
					if($wp6.text)
						textWithWp += $wp6.text;
					text += $endName.text;
					textWithWp += $endName.text;
					if(!this.bNotParseRef){
						token = websheet.event.FormulaHelper.generateToken(text, this.bMS, this.bAutoCorrect,this.errTokenList);
						if(token){
							token.setIndex(index);
							token.setTextOnly(textWithWp);
							this.tokenList.push(token);
						}
					}
				}
			}
		}
	}
  ;
atom_list returns [String value]
  : a=atom_type {
  }
  ((INTERSECT? sep=ARG_SEP INTERSECT? {
		if(this.bMS && this.bLocaleSensitive)
		{
			var token = new websheet.parse.referenceToken($sep.text,$sep.getStartIndex());
			this.tokenList.push(token);
		}
    } n=atom_type {}
    )*)
  ;
atom_type returns [String value]
  : a=expr{}
  // case : =SUM({[space]1,2,3})
  //| ARRAY_FORMULAR_START INTERSECT? (b=atom_list INTERSECT? ARRAY_FORMULAR_END{})
  |{}
  ;
  
  
folded returns [String value]
//TODO: can't define NAME INTERSECT? here due to case: =func(a1 (a1,b2)) but it can't support =SUM   (...
   : (f = FUNC | f = NAME b = '(') {
   		this.inFunc++;
   		if(this.bLocaleSensitive){
   			var text = $f.text;
   			//TODO: remove index?
   			var brcIdx;
   			var oldName;
   			if($b.text){
   				oldName = text.toUpperCase();
   				brcIdx = $b.getStartIndex();
   			}else{
   				oldName = text.substring(0,text.length - 1).toUpperCase();
   				brcIdx = $f.getStartIndex()+oldName.length;
   			}
	   	    
			var token = new websheet.parse.referenceToken(oldName,$f.getStartIndex(),"reffunct");
	
				// De: SUM to null,SUMME to SUM,ABC to null
				// En: SUM to SUM,SUMME to null,ABC to null
				// CH: SUM to SUM,SUMME to null,ABC to null
			var	newName = websheet.functions.FormulaTranslate.transFuncNameLocale2En(oldName);
			if(!newName){
				if (websheet.functions.FormulaTranslate.isSupportedFormula(oldName)) {
					newName = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(oldName);
					if(newName){
						if(this.errTokenList){
							this.errTokenList.push(token);
						}
					}
				}
			}
			if(newName)
				token.setChangedText(newName);
			this.tokenList.push(token);
			var token = new websheet.parse.referenceToken("leftfuncbrace",brcIdx);
			this.tokenList.push(token);
		}
   	}
    (
		   INTERSECT?
		   range 
		   INTERSECT? 
		   rBrace=P_CLOSE{
		   this.inFunc--;
				// seperator replacement
				if(this.bLocaleSensitive){
					var length = this.tokenList.length;
					if(length > 1){
						var anch = length - 1; 
						var seperator = this.tokenList[anch];
						var op;
						while(seperator){
							op = anch >= 0 ? seperator.getText() : null;
							if(op == "leftfuncbrace"){
								this.tokenList.splice(anch,1);
								break;
							}
							
							// "," should be replaced to ";"
							// per current local, ";" should throw exception
							if((op != "," && op != ";") || (seperator._changedText == "~")){ 
								anch--;
								seperator = this.tokenList[anch];
								op = (anch >= 0) ? seperator.getText() : null;
								continue;
							}
							
							if(this.bMS)
							{
								seperator.setType(websheet.Constant.FormulaTokenType.ARG_SEP);
								if(op == this.sepChar) //this.sepChar == ","
								{
									if(this.bSepToken)
									{
										seperator.setChangedText(websheet.Constant.TokenStr.ODF.ARG_SEP)//change to odf format
									}
								}else if (this.inConstArray === 0)
								{
									if(this.bAutoCorrect)
									{
										seperator.setChangedText(this.sepChar);
										this.errTokenList.push(seperator);
									}else
										throw "separator error!";
								}
							}
							
							anch--;
							seperator = this.tokenList[anch];
							op = anch > 0 ? seperator.getText() : null;
						}
					}
				}
			})
   | (f = FUNC | f =  NAME INTERSECT? b='('){
   		if(this.bLocaleSensitive){
   		   	var text = $f.text;
   			var oldName;
   			if($b.text)
   				oldName = text.toUpperCase();
   			else
				oldName = text.substring(0,text.length - 1).toUpperCase();	   	    	
	   	    	
			var token = new websheet.parse.referenceToken(oldName,$f.getStartIndex(),"reffunct");
				// De: SUM to null,SUMME to SUM,ABC to null
				// En: SUM to SUM,SUMME to null,ABC to null
				// CH: SUM to SUM,SUMME to null,ABC to null
			var	newName = websheet.functions.FormulaTranslate.transFuncNameLocale2En(oldName);
			if(!newName){
				if (websheet.functions.FormulaTranslate.isSupportedFormula(oldName)) {
					newName = websheet.functions.FormulaTranslate.transFuncNameEn2Locale(oldName);
					if(newName){
						if(this.errTokenList){
							this.errTokenList.push(token);
						}
					}
				}
			}
			if(newName)
				token.setChangedText(newName);
			this.tokenList.push(token);
		}
   
   } (')'{})
   ;
  
range returns [String value]
	: params=atom_list {
		
	}
	| funct = folded {}
  ;


/*------------------------------------------------------------------
 * LEXER RULES
 *------------------------------------------------------------------*/

fragment NONZERO_NUMBER : ('1'..'9')+;
fragment INT : (DIGIT)+;
fragment SPACE1 : (' ' | '\u00A0' | '\u3000' );
fragment NUMSEP:	('.')*;
LOCALE_NUMBER 
	:	(NUMSEP INT ('.'|'\'')*)+('E'('-'|'+')?INT)?;

SINGLEQUOT_STRING : ('$')?('\'' (~('\'' | LT))* '\'')+;
DOUBLEQUOT_STRING : ('"' (~('"' | LT))* '"')+;
ARG_SEP	:	';'|',';
// define FUNC due to recognize case A1:INDIRECT(...) and =SUM(Sheet1!A1:INDIRECT(A5)) so on
FUNC: ('0'..'9'|'A'..'Z'|'_')+ '(';
ERRORNAME 
	:	'#' ((('VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!') | 'N/A' | 'NAME?' );

NAME : ('0'..'9'|'a'..'z'|'A'..'Z'|'?'|'_'|'$'|'\''|'.'|'\\')+ ('#REF!')?;
//NAME1	:	~( LT |'&' | '+' | '+=' | '-' | '-='|'*'|'*=' |'/' | '/=' | '(' | ')' | ';' | ',' | '=' | '<' | '<=' | '>' | '>=' |'<>' | '!=' | '&&' | '!' | '||' | '^' | '%' | '%=' | '{' | '}' | SPACE){websheet.parse.parseHelper._cellHasUnicode = true;};
NAME1	:~('[' | ']' | '\'' | ':' | '?' | '/' | '\\' | '*' | '!' | ' ' | '~' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | ')' | '|' | '{' | '}' | '-' | '+' | '=' | ';' | '<' | '>' | '.' | ',' | '`' | '\"' | '\t' | '\r' | '\n'| '\u000C')+ {websheet.parse.parseHelper._cellHasUnicode = true;};
// sheet name, define(table) name
//fragment ODF_NORMAL_CHAR	:	~('[' | ']' | '\'' | ':' | '?' | '/' | '\\' | '*' | '!' | ' ' | '~' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | ')' | '|' | '{' | '}' | '-' | '+' | '=' | ';' | '<' | '>' | '.' | ',' | '`' | '\"' | '\t' | '\r' | '\n'| '\u000C')+;
//ODF_DEFINE_NAME		:	(ODF_NORMAL_CHAR | '\\') (ODF_NORMAL_CHAR | '\\' | '?' | '.')*; 
// for table formula
fragment COMMAOrSPACE	:	',' (' ')?;
fragment KEYCHARACTER	:       '\'' | '#' | '[' | ']' | '@' ;	
fragment ODF_COLUMN	:	'[' ( ~(KEYCHARACTER) | ('\'' KEYCHARACTER))+ ']';           // any char can be existed in column name
fragment ODF_COL_RANGE	:	ODF_COLUMN (':' ODF_COLUMN)?;	
fragment ODF_PREWORD 	:	'[' ( '#THIS ROW' | '#ALL' | '#HEADERS' | '#TOTALS' | '#DATA' ) ']';
fragment ODF_PRELIST	:	('[#HEADERS]' COMMAOrSPACE '[#DATA]') | ('[#DATA]' COMMAOrSPACE '[#TOTALS]') | ODF_PREWORD;	

ODF_TABLE		:      	( '[' (' ')? ( ODF_PRELIST (COMMAOrSPACE ODF_COL_RANGE)? | ODF_COL_RANGE ) (' ')? ']' | ODF_PREWORD | ODF_COLUMN){websheet.parse.parseHelper._cellHasUnicode = true;};

INTERSECT : SPACE1+;
WHITESPACE : ( '\t' | ' ' | '\r' | '\n'| '\u000C' )+  { $channel = HIDDEN; } ;

fragment SPACE	:	'\t' | ' ' | '\r' | '\n'| '\u000C';
fragment LT
  : '\r'    // Carriage return.
  | '\u2028'  // Line separator.
  | '\u2029'  // Paragraph separator.
  ;

fragment DIGIT  : '0'..'9' ;