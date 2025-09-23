
grammar Formula;

options {
    output=AST;
    ASTLabelType = CommonTree; // type of $stat.tree ref etc...
    k = 0;
    language=Java;
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
package com.ibm.symphony.conversion.spreadsheet.impl;

}

@header {

package com.ibm.symphony.conversion.spreadsheet.impl;
import java.util.ArrayList;
import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;

}

@lexer::members {
	public boolean _cellHasUnicode = false;
	
  	public void reportError(RecognitionException e){
  	// ignore report the error message
  	}
}

@members {
	List<ConversionUtil.Range> nameinstances = new ArrayList<ConversionUtil.Range>();
	ArrayList<ConversionUtil.FormulaToken> tokenList = new ArrayList<ConversionUtil.FormulaToken>();
	ArrayList<ConversionUtil.FormulaToken> tokenStack = new ArrayList<ConversionUtil.FormulaToken>();
	Exception error = null; // for parse error.
	public void reportError(RecognitionException e){
		error = e;
  	// ignore report the error message
  	}
}
/*------------------------------------------------------------------
 * PARSER RULES
 *------------------------------------------------------------------*/



prog returns [String value]
  : EQUAL expr	{} EOF
  | ARRAY_FORMULAR_START EQUAL 
  	{
  		
  	}	
  	expr {} ARRAY_FORMULAR_END EOF
  ;

expr returns [String value]
    :   a=atom {
	    	
    	}
    	(MODE{})*
        (m=(LESS|GREATER|LESSEQUAL|GREATEREQUAL
        |MODEQUAL|MULTEEQUAL|MINUSEQUAL|PLUSEQUAL|DIVEQUAL
        |NOTEQUAL|NOTEQUAL2|EQUAL
        |AND|MINUS|PLUS
        |MULT|DIV
        |POW
        |CONCATENATION
        |INTERSECT
        |COLON)
        
        b=expr {
	    	if(m !=null && $m.text.equals(":")){
				int size = tokenStack.size();
				if(size>1){
					ConversionUtil.FormulaToken right,left; 
					right = tokenStack.remove(size-1);
					left = tokenStack.remove(size-2);
					ConversionUtil.FormulaToken token = ConversionUtil.generateVirtualToken(tokenList,left,right);
					if(token != null)
					 {
						tokenList.add(token);
						tokenStack.add(token);
					 }	
				}else{
					tokenStack.clear();
				}
			}else if(m !=null && $m.text.equals("~")){
				// need remove the top 2 refTokens in tokenStack and calculate the covered 1 refToken put into tokenStack.
				int size = tokenStack.size();
				if(size>1){
					ConversionUtil.FormulaToken right,left;
					right = tokenStack.remove(size-1);
					left = tokenStack.remove(size-2);
					ConversionUtil.FormulaToken token = ConversionUtil.generateVirtualToken(tokenList,left,right);
					if(token != null)
					 {
					 	tokenList.add(token);
						tokenStack.add(token);
					 }	
				}else{ 
					tokenStack.clear();
				}
			}
        })*             
    ;    
atom returns [String value]
  : '-'(b=atom){
     
  	}
  |'+'(b=atom){
     
  	}
 //| x1 = INT (WHITESPACE1? m=COLON WHITESPACE1? x2 = (INT|NAME))?{
  // doc shouldn't contain spaces.
  | x1 = INT (m=COLON x2 = (INT|NAME))?{
      	if($m != null){
      		String text = $x1.text;
      		text += $m.text + $x2.text;
  			 ConversionUtil.FormulaToken token = ConversionUtil.generateFormulaToken(text, nameinstances);
		    if(token.getRef() != null || !($x2 != null && $m.text.equals(":")))
		    {
			     token.setIndex($x1.getCharPositionInLine());
			     //token.setOnlyText(textWithWp);
			     tokenList.add(token);
			     tokenStack.add(token);
		    }
      	}
      }
  | NUMBER{
      
      }
    | x=SINGLEQUOT_STRING ((name=NAME (WHITESPACE1? m=COLON WHITESPACE1? (x2=SINGLEQUOT_STRING)? endName=(NAME|INT))?{
            String text = $SINGLEQUOT_STRING.text + $name.text;
            String textWithWp = text;
            if($endName != null){
            	text += $m.text;
           		for(int i=$m.getTokenIndex()-$name.getTokenIndex();i>1;i--)
            		textWithWp+=" ";
            	textWithWp += $m.text;
            	if($x2 != null){
					for(int i=$x2.getTokenIndex()-$m.getTokenIndex();i>1;i--)
	            		textWithWp+=" ";
	            	text += $x2.text;
	            	textWithWp += $x2.text;
            	}else{
	            	for(int i=$endName.getTokenIndex()-$m.getTokenIndex();i>1;i--)
	            		textWithWp+=" ";
            	}
            	text += $endName.text;
            	textWithWp += $endName.text;
            }
            ConversionUtil.FormulaToken token = ConversionUtil.generateFormulaToken(text, nameinstances);
            if(token.getRef() != null || !($endName != null && $m.text.equals(":")))
            {
	            token.setIndex($SINGLEQUOT_STRING.getCharPositionInLine());
	            token.setOnlyText(textWithWp);
	            tokenList.add(token);
	            tokenStack.add(token);
		    }
		     else  if($x2 == null)
		    {
		    	String text1 = $SINGLEQUOT_STRING.text + $NAME.text;
		    	String text2 = $endName.text;
		    	String textWithWp1 = text1;
		    	for(int i=$m.getTokenIndex()-$name.getTokenIndex();i>1;i--)
	            	textWithWp1 +=" ";
		    	
      	    	String textWithWp2 = "";
      	    	for(int i=$endName.getTokenIndex()-$m.getTokenIndex();i>1;i--)
            		textWithWp2 +=" ";
      	    	textWithWp2 += text2;
		    	ConversionUtil.FormulaToken token1 = ConversionUtil.generateFormulaToken(text1, nameinstances);
				ConversionUtil.FormulaToken token2 = ConversionUtil.generateFormulaToken(text2, nameinstances);
				if(token1 != null)
				{
				    token1.setIndex($SINGLEQUOT_STRING.getCharPositionInLine());
			            token1.setOnlyText(textWithWp1);
				    tokenList.add(token1);
				}
				if(token2 != null)
				{
				    token2.setIndex($endName.getCharPositionInLine());
			            token2.setOnlyText(textWithWp2);
				    tokenList.add(token2);
				}
				if(token1 != null && token2 !=null)
				{
					ConversionUtil.FormulaToken vToken = ConversionUtil.generateVirtualToken(tokenList,token1,token2);
					if(vToken != null)
					 {
						tokenList.add(vToken);
						tokenStack.add(vToken);
					 }	
				}
		    }
          })
    | ({})
    )
  | x=DOUBLEQUOT_STRING {
      }
  | (brace=P_OPEN){  } 
    (expr P_CLOSE {
    })
  | folded {}
  | ARRAY_FORMULAR_START atom ((ARG_SEP|'|') atom)* ARRAY_FORMULAR_END {}
  | name=(NAME1|ERRORNAME|NAME) (WHITESPACE1? m=COLON WHITESPACE1? endName=(NAME1|NAME|INT))?
   {
      String text = $name.text;
      String textWithWp = text;
      if($endName != null){
	    	text += $m.text + $endName.text;
	    	for(int i=$m.getTokenIndex()-$name.getTokenIndex();i>1;i--)
            	textWithWp+=" ";
	    	textWithWp += $m.text;
	    	for(int i=$endName.getTokenIndex()-$m.getTokenIndex();i>1;i--)
            	textWithWp+=" ";
	    	textWithWp += $endName.text;
      }
      ConversionUtil.FormulaToken token = ConversionUtil.generateFormulaToken(text, nameinstances);
      if(token.getRef() != null || !($endName != null && $m.text.equals(":")))
      {
	     token.setIndex($name.getCharPositionInLine());
	     token.setOnlyText(textWithWp);
	     tokenList.add(token);
	     tokenStack.add(token);
      }
      else
      {
      	     
      	     String text1 = $name.text;
      	     String text2 = $endName.text;
      	     String textWithWp1 = text1;
      	     for(int i=$m.getTokenIndex()-$name.getTokenIndex();i>1;i--)
            	textWithWp1 +=" ";
      	     
      	     String textWithWp2 = "";
      	     for(int i=$endName.getTokenIndex()-$m.getTokenIndex();i>1;i--)
            	textWithWp2 +=" ";
      	     textWithWp2 += text2;
      	     ConversionUtil.FormulaToken token1 = ConversionUtil.generateFormulaToken(text1, nameinstances);
	     ConversionUtil.FormulaToken token2 = ConversionUtil.generateFormulaToken(text2, nameinstances);
		if(token1 != null)
		{
		    token1.setIndex($name.getCharPositionInLine());
	            token1.setOnlyText(textWithWp1);
		    tokenList.add(token1);
		}
		if(token2 != null)
		{
		    token2.setIndex($endName.getCharPositionInLine());
	            token2.setOnlyText(textWithWp2);
		    tokenList.add(token2);
		}
		if(token1 != null && token2 !=null)
		{
			ConversionUtil.FormulaToken vToken = ConversionUtil.generateVirtualToken(tokenList,token1,token2);
			if(vToken != null)
			 {
				tokenList.add(vToken);
				tokenStack.add(vToken);
			 }	
		}		
      }
      
    }
  ;
  
atom_list returns [String value]
  : a=atom_type {
  }((ARG_SEP n=atom_type {
  		tokenStack.clear();
    	})*
    |(ARG_SEP_WRONG{
  	
        })*)
  ;
  
atom_type returns [String value]
  : a=expr{}
  //| ARRAY_FORMULAR_START (b=atom_list ARRAY_FORMULAR_END{})
  |{}
  ;
  
folded returns [String value]
   : (f = FUNC | f = NAME WHITESPACE1? b = '(') {

          }
          (
          (')'{})
          |(range ')'{})
          )
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
INT : (DIGIT)+;
NUMBER  : INT ('.' INT)? (('e'|'E')('-'|'+')? INT)?;

PERCENT  : NUMBER '%'+;
SINGLEQUOT_STRING : ('$')?('\'' (~('\'' | LT))* '\'')+;
DOUBLEQUOT_STRING : ('"' (~('"' | LT))* '"')+;

//NAME : ('0'..'9'|'a'..'z'|'A'..'Z'|'?'|'_'|'$'|'\''|'#'|'!')(('a'..'z'|'A'..'Z'|'?'|'_'|'$'|'.'|'0'..'9'|'\''|':'|'#'|'!')*);
ERRORNAME 
	:	'#' ((('VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!') | 'N/A' | 'NAME?' );
NAME : ('0'..'9'|'a'..'z'|'A'..'Z'|'?'|'_'|'$'|'\''|'.'|'\\')+ ('#REF!')?;
NAME1	:~('[' | ']' | '\'' | ':' | '?' | '/' | '\\' | '*' | '!' | ' ' | '~' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | ')' | '|' | '{' | '}' | '-' | '+' | '=' | ';' | '<' | '>' | '.' | ',' | '`' | '\"' | '\t' | '\r' | '\n'| '\u000C')+ { this._cellHasUnicode = true; };

// sheet name, define(table) name
//fragment ODF_NORMAL_CHAR	:	~('[' | ']' | '\'' | ':' | '?' | '/' | '\\' | '*' | '!' | ' ' | '~' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | ')' | '|' | '{' | '}' | '-' | '+' | '=' | ';' | '<' | '>' | '.' | ',' | '`' | '\"' | '\t' | '\r' | '\n'| '\u000C')+;
//ODF_DEFINE_NAME		:	(ODF_NORMAL_CHAR | '\\') (ODF_NORMAL_CHAR | '\\' | '?' | '.')*; 
// for table formula
fragment COMMAOrSPACE	:	',' (' ')?;
fragment KEYCHARACTER	:       '\'' | '#' | '[' | ']' | '@' ;	
fragment ODF_COLUMN	:	'[' ( ~(KEYCHARACTER) | ('\'' KEYCHARACTER))+ ']';           // any char can be existed in column name
fragment ODF_COL_RANGE	:	ODF_COLUMN (':' ODF_COLUMN)?;
fragment ODF_PREWORD 	:	'[' ( '#This Row' | '#All' | '#Headers' | '#Totals' | '#Data' ) ']';
fragment ODF_PRELIST	:	('[#Headers]' COMMAOrSPACE '[#Data]') | ('[#Data]' COMMAOrSPACE '[#Totals]') | ODF_PREWORD;	
ODF_TABLE		:      	( '[' (' ')? ( ODF_PRELIST (COMMAOrSPACE ODF_COL_RANGE)? | ODF_COL_RANGE ) (' ')? ']' | ODF_PREWORD | ODF_COLUMN) { this._cellHasUnicode = true; };
 
// can't define space here due to antlr can't recognize the HIDDEN channel token, case: 1+3*SUM  + 3
// FUNC: ('0'..'9'|'a'..'z'|'A'..'Z'|'_')+ ' '* '(';
// define FUNC due to recognize case A1:INDIRECT(...) and so on
FUNC: ('0'..'9'|'a'..'z'|'A'..'Z'|'_')+ '(';
//NAME1	:	~( LT |'&' | '+' | '+=' | '-' | '-='|'*'|'*=' |'/' | '/=' | '(' | ')' | ';' | ',' | '=' | '<' | '<=' | '>' | '>=' |'<>' | '!=' | '&&' | '||' | '^' | '%' | '%=' | '{' | '}' | SPACE) { this._cellHasUnicode = true; };
WHITESPACE1 : ' '+ { $channel = HIDDEN; };
WHITESPACE : ( '\t' | ' ' | '\r' | '\n'| '\u000C' )+  { $channel = HIDDEN; } ;
fragment SPACE	:	'\t' | ' ' | '\r' | '\n'| '\u000C';
fragment LT
  :'\r'    // Carriage return.
  | '\u2028'  // Line separator.
  | '\u2029'  // Paragraph separator.
  ;

fragment DIGIT  : '0'..'9' ;