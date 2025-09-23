grammar JSExpr;

options {
    output=AST;
    ASTLabelType = CommonTree; // type of $stat.tree ref etc...
    k = 0;
    language=JavaScript;
    backtrack=true;
    memoize=true;
}

tokens {
  COLON = ':';
  CONCATENATION = '~';
  INTERSECT= '!';
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
  ARG_SEP = ';';
  ARG_SEP_WRONG=',';
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
  dojo.provide("parser.JSExprLexer");
}

@header {
  dojo.provide("parser.JSExprParser");
}

@lexer::members {
   this.emitErrorMessage = function(e) {
        if(console) {
            console.warn(e);
        }
        throw websheet.Constant.ERRORCODE["1002"];
    };
}

@members {
    this.document = null;
    this.cell = null;
    this.sheetName = null;
    this.formula = null;
    this.bracketList = new Array();
    this.temp = new Array();
    //this.isArrayFormular = false;
    this.errMsg = null;
    this.tokenMgr = null;
    this.emitErrorMessage = function(e) {
        if(console) {
            console.warn(e);
        }
        throw websheet.Constant.ERRORCODE["1002"];
    };  
}
/*------------------------------------------------------------------
 * PARSER RULES
 * Please note that any rules changed, need to syn Formula.g in Sever side and Mobile Native side. 
 *------------------------------------------------------------------*/



prog returns [String value]
 @init {
  	this.inConstArray = 0;
  }
  : EQUAL {this.formula = "=";} 
    expr 
    {
        this.cell.setCellToken($expr.value);
        $value = $expr.value;
    } EOF
  | ARRAY_FORMULAR_START EQUAL 
    {
        //this.isArrayFormular = true;
        this.formula = "{=";
    }   
    expr {
    	var tokenList = this.tokenMgr.newArrayTokenList($expr.value,this.cell);
        this.cell.setCellToken(tokenList);
        $value = $expr.value;
        this.formula += "}";
    } ARRAY_FORMULAR_END EOF
  ;

expr returns [String value]
    :   a=atom {
          var tempValue = this.tokenMgr.calcOperator(this.temp,$a.value,this.errMsg,this.cell);
          if(tempValue._error){
	  		this.errMsg = tempValue._error;
  		  }
          $value = tempValue;
        }
       (MODE{
            var tokenList = this.tokenMgr.newModeTokenList(tempValue,$MODE.text,this.cell);
            if(tokenList._error){
	  			this.errMsg = tokenList._error;
  		  	}
            this.formula += tokenList.getToken();
		    $value = tempValue = tokenList;
         })*
        (m=(LESS|GREATER|LESSEQUAL|GREATEREQUAL
        |MODEQUAL|MULTEEQUAL|MINUSEQUAL|PLUSEQUAL|DIVEQUAL
        |NOTEQUAL|NOTEQUAL2|EQUAL
        |AND|MINUS|PLUS
        |MULT|DIV
        |POW
        |CONCATENATION
        |INTERSECT
        |COLON
        )
        { 
        	var tokenList = this.tokenMgr.newOperatorTokenList($m.text,this.cell);
        	this.formula += tokenList.getToken();
            this.temp.push($value);
            this.temp.push(tokenList);
        } 
        b=expr {
            $value = $b.value;
        })*             
    ;      
atom returns [String value]
  : n=('+'|'-'){this.formula += $n.text;}(b=atom){
  		var tokenList = this.tokenMgr.newPosNegtiveTokenList($b.value,$n.text,this.cell,this.errMsg);
  		if(tokenList._error)this.errMsg = tokenList._error;
  		$value = tokenList; 
    }
  // INT
  // INT:INT
  // INT:NAME
  | x1 = INT (WHITESPACE1? m=COLON WHITESPACE1? x2 = (INT|NAME){
	if(!this._tmpText)
  		this._tmpText = "";
  	
	if($m.text)
	      this._tmpText += $m.text;
	if($x2.text)
	      this._tmpText += $x2.text;
  	m = x2 = null;
	  })* {
  		if(this._tmpText){
  			var text = $x1.text + this._tmpText; 
  			this._tmpText= "";
  			var startIndex = $x1.getCharPositionInLine();
  			var token = this.tokenMgr.newRefToken(text,this.cell,this.sheetName,this.formula.length, startIndex);
		    this.formula += token.getToken();
		    if(token._error)this.errMsg = token._error;
		    $value = token;
  		}else{
  			var text = $x1.text;
	  		var token = this.tokenMgr.newIntToken(text);
	  		this.formula += token.getToken();
	  		$value = token;
  		}
    }
  | NUMBER {
      	var token = this.tokenMgr.newNumberToken($NUMBER.text);
      	this.formula += token.getToken();
      	if(token._error)this.errMsg = token._error;
      	$value = token;
      } 
  | PERCENT {
  		var tokenList = this.tokenMgr.newPercentTokenList($PERCENT.text,this.cell);
  		this.formula += tokenList.getToken();
  		if(tokenList._error)this.errMsg = tokenList._error;
      	$value = tokenList;
      } 
  // 'Sheet 1'.1:2
  | x=SINGLEQUOT_STRING (name = (ERRORNAME|NAME))? (WHITESPACE1? em=COLON WHITESPACE1? (x2=SINGLEQUOT_STRING)? endName=(ERRORNAME|NAME|INT){
  	if(!this._tmpText)
  		this._tmpText = "";
  	
	if($em.text)
	      this._tmpText += $em.text;
	if($x2.text)
	      this._tmpText += $x2.text;
	if($endName.text)
	      this._tmpText += $endName.text;
  	em = x2 = endName = null;
  	})*{
  	
    	if($name.text){
	        var text = $x.text + $name.text;
	        if(this._tmpText){   
		    text += this._tmpText;
		    this._tmpText = "";
		}
	        var startIndex = $x.getCharPositionInLine();
	        var token = this.tokenMgr.newRefToken(text,this.cell,this.sheetName,this.formula.length, startIndex);
	        this.formula += token.getToken();
		if(token._error)
			this.errMsg = token._error;
		$value = token;
	}else{
		    var text =  $x.text;
		    var token;
		    if(text.indexOf('$') != 0)
		    {
		        token = this.tokenMgr.newSingleQuoteStrToken(text);
		        this.formula += "'" + token.getToken() + "'";
		    }else
		    {   
		       token = this.tokenMgr.newNameRangeToken(text,this.cell);
		       if(token._error)this.errMsg = token._error;
		       this.formula += token.getToken();
		    }
   		    
		    $value = token;
		}
    }
  | DOUBLEQUOT_STRING {
  		var token = this.tokenMgr.newDoubleQuoteStrToken($DOUBLEQUOT_STRING.text);
  		this.formula += "\"" + token.getToken() + "\"";
  		$value = token;
    }          
  | (brace=P_OPEN){ 
        this.temp.push("(");
        var index = $brace.getCharPositionInLine(); // what's the diff bt getBraceIndex and getCharPositionInLine?
        var redundant = false;
        for (var i = 0; i < this.bracketList.length; ++i) {
            if (this.bracketList[i] == index) {
                redundant = true;
                break;
            }
        }
        if (!redundant) this.formula += "(";  
    } 
    (expr P_CLOSE {
    	var tokenList = this.tokenMgr.newBracketTokenList($expr.value,$brace.getStartIndex(),this.cell,this.errMsg,this.bracketList);
    	if(tokenList._error)this.errMsg = tokenList._error; 
  		$value = tokenList;
        if(this.temp[this.temp.length - 1] == "("){
            this.temp.pop();
     	}
     	if (!tokenList.getRedundant()) this.formula += ")";
     })
  | folded {$value = $folded.value;}
  //value of token is a array(1D or 2D), every element can be float(number), string(string), errorObject(error name), boolean(true/false)
  | (ARRAY_FORMULAR_START {
  	this.inConstArray++;
  	var startpos = this.formula.length;
  	this.formula += "{";   // left sign of constant-array formula
   })
   (firToken= atom   {	
   	var tokenSource = this.input.getTokenSource();
   	var object = this.tokenMgr.getConstantArrayObject(firToken, tokenSource);
  	var array = [[object]];
	var firColLen = 0;
  	var colLen = 0;
  	var rowLen = 0;
   })
   ((sep=(ARG_SEP|'|') {	
   	var speText = $sep.getText();
  	if (speText == ";") {
		if (rowLen == 0)
			firColLen++;
		else
			colLen++;
	} else {
		// | is sperator of row
		// column length of every row should be same
        	if (rowLen && colLen != firColLen)
        		throw websheet.Constant.ERRORCODE["512"];
        	colLen = 0;
	  	rowLen++;
	}
	this.formula +=	speText;
   })
   (token = atom {
	object = this.tokenMgr.getConstantArrayObject(token, tokenSource);
	if (!array[rowLen])
		array[rowLen] = [];
	array[rowLen].push(object);
    }))* 
   (ARRAY_FORMULAR_END{
   	this.inConstArray--;
   	if (array.length == 1)
   		array = array[0];
   	this.formula += "}";
   	
	var text = this.formula.substr(startpos);
   	var token = this.tokenMgr.newConstantArrayToken(array, text);
  	$value = token;
   })
  // #REF!.A1:#REF!.A2,#REF!#REF!:#REF!#REF!,Sheet.1:2,Sheet.1:a,Sheet.1:name1
  | (name = (ERRORNAME|NAME) (name1 = (ERRORNAME|NAME))? (WHITESPACE1? m=COLON WHITESPACE1? name2 = (ERRORNAME|NAME|INT) (name3 = (ERRORNAME|NAME))?{
  	if(!this._tmpText)
  		this._tmpText = "";
  	
	if($m.text)
	      this._tmpText += $m.text;
	if($name2.text)
	      this._tmpText += $name2.text;
	if($name3.text)
	      this._tmpText += $name3.text;
  	m = name2 = name3 = null;
  	})*)
  {
    var text = $name.text;
    var startIndex = $name.getCharPositionInLine();
    if($name1.text)
	text += $name1.text;   
    if(this._tmpText){   
    	text += this._tmpText;
    	this._tmpText = "";
    }
    var token = this.tokenMgr.newRefToken(text,this.cell,this.sheetName,this.formula.length, startIndex);
    this.formula += token.getToken();
    if(token._error && (this.inConstArray == 0))this.errMsg = token._error;
    $value = token;
  };

atom_list returns [String value]
 : a=atom_type {
  	var atomList = this.tokenMgr.newFuncParamsTokenList($a.value,this.cell);
  	$value = atomList;
  	this.funcArgIndex[this.funcArgIndex.length - 1]++;
  }((ARG_SEP { this.formula += ";";} n=atom_type {
  			atomList.push($n.value);
  			$n.value.setParent(atomList);
  			this.funcArgIndex[this.funcArgIndex.length - 1]++; 
        })*
    |(ARG_SEP_WRONG{this.formula = this.cell.getRawValue();} n=atom_type {
  			atomList.push($n.value);
  			$n.value.setParent(atomList); 
  			throw websheet.Constant.ERRORCODE["508"];
        })*)
  ;
  
atom_type returns [String value]
 : expr{$value=$expr.value;}
  |{
      //if(this.isIgnoreNoneParamsError){
          var token = this.tokenMgr.newNoneToken();
          $value = token;
      //}else{
      //  throw websheet.Constant.ERRORCODE["511"];   
      //}
  }
  /*| ARRAY_FORMULAR_START { 
	    this.formula += "{";
    }
    (a=atom_list ARRAY_FORMULAR_END{
        var tokenList = this.tokenMgr.newArrayFormulaTokenList($atom_list.value,this.cell,this.errMsg);
        if(tokenList._error)this.errMsg = tokenList._error; 
        this.formula += "}";
        $value = tokenList;
        }
    )*/
  ;
  
folded returns [String value]
  : (f = FUNC | f = NAME WHITESPACE1? b = '(' ) (')'{
 				var text = $f.getText();
                var importedFN;
           	 	if($b.text)
                 	importedFN = text.toUpperCase();
                else
                	importedFN = text.substring(0,text.length - 1).toUpperCase();
                var lName = websheet.functions.Util.FormulaPrefixS2LMap[importedFN] || importedFN;              
                this.formula += lName;
                var tokenList = this.tokenMgr.newFuncTokenList(undefined,importedFN,this.cell,this.errMsg);
		  		if(tokenList._error){
	  				this.errMsg = tokenList._error;
		  		}else if(tokenList._error == null)this.errMsg = null;
                $value = tokenList;
                this.formula += "()";
          })    
 |  (f = FUNC | f = NAME WHITESPACE1? b = '(') // for =sum  (...) and so on
           	 {
           	 	var text = $f.getText();
           	 	var importedFN;
           	 	if($b.text)
                 	importedFN = text.toUpperCase();
                else
                	importedFN = text.substring(0,text.length - 1).toUpperCase();
                var lName = websheet.functions.Util.FormulaPrefixS2LMap[importedFN] || importedFN;
                this.formula += lName;
                this.funcStack.push(importedFN);
                this.temp.push("("); 
                this.formula += "(";
				//should set error property at the beginning, rather than after ')' is parsed                
		        var errProp = websheet.functions.Util.getErrPropByName(importedFN);
		        this.cell.setErrProp(errProp);
		// reset as 0 when meet new function 
		this.funcArgIndex.push(0);
             }
            range ')'{
                var tokenList = this.tokenMgr.newFuncTokenList($range.value,importedFN,this.cell,this.errMsg);
                if(tokenList._error){
                	this.errMsg = tokenList._error;
                }else if(tokenList._error == null)this.errMsg = null;
                $value = tokenList;
                if(this.temp[this.temp.length - 1] == "("){
                   this.temp.pop();
                }
                this.formula += ")";
                this.funcStack.pop();
                this.funcArgIndex.pop();
            }   
  ;

range returns [String value]
    : params=atom_list {
        $value = $params.value;
    }
    | funct = folded {$value = $funct.value;}
  ;

/*------------------------------------------------------------------
 * LEXER RULES
 *------------------------------------------------------------------*/


/**
** Please note that any token changed, need to syn Formula.g in Sever side and Mobile Native side.
*  Also need to check priority algorithm
*/
fragment NONZERO_NUMBER : ('1'..'9')+;
INT : (DIGIT)+;
NUMBER	: INT ('.' INT)? ('E'('-'|'+')? INT)?;    

PERCENT  : NUMBER '%'+;
SINGLEQUOT_STRING : ('$')?('\'' (~('\'' | LT))* '\'')+;
DOUBLEQUOT_STRING : ('"' (~('"' | LT))* '"')+;

//ERRORNAME : ('0'..'9'|'a'..'z'|'A'..'Z'|'?'|'_'|'$'|'\''|'#'|'.'|'\\')* '#' NAME ('/' '0')? '!' (INT)?;
ERRORNAME 
	:	'#' ((('VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!') | 'N/A' | 'NAME?' );
NAME : ('0'..'9'|'A'..'Z'|'?'|'_'|'$'|'\''|'.'|'\\')+ ('#REF!')?;

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
 
// can't define space here due to antlr can't recognize the HIDDEN channel token, case: 1+3*SUM  + 3
// FUNC: ('0'..'9'|'a'..'z'|'A'..'Z'|'_')+ ' '* '(';
// define FUNC due to recognize case A1:INDIRECT(...) and so on
FUNC: ('0'..'9'|'A'..'Z'|'_')+ '(';
//NAME1   :   ~( LT | '~' | '!' | '&' | '+' | '+=' | '-' | '-='|'*'|'*=' |'/' | '/=' | '(' | ')' | ';' | ',' | '=' | '<' | '<=' | '>' | '>=' |'<>' | '!=' | '&&' | '||' | '^' | '%' | '%=' | '{' | '}' | SPACE) {websheet.parse.parseHelper._cellHasUnicode = true;};
NAME1	:~('[' | ']' | '\'' | ':' | '?' | '/' | '\\' | '*' | '!' | ' ' | '~' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | ')' | '|' | '{' | '}' | '-' | '+' | '=' | ';' | '<' | '>' | '.' | ',' | '`' | '\"' | '\t' | '\r' | '\n'| '\u000C')+{websheet.parse.parseHelper._cellHasUnicode = true;};

WHITESPACE1 :	(' ' | '\u00A0' | '\u3000')+ { $channel = HIDDEN; } ;
WHITESPACE : ( '\t' | ' ' | '\r' | '\n'| '\u000C' )+  { $channel = HIDDEN; } ;
fragment SPACE  :   '\t' | ' ' | '\r' | '\n'| '\u000C';
fragment LT
  : 
  '\r'    // Carriage return.
  | '\u2028'  // Line separator.
  | '\u2029'  // Paragraph separator.
  ;

fragment DIGIT  : '0'..'9' ;