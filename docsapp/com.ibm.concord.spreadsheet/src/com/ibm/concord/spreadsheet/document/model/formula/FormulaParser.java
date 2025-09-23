// $ANTLR 3.2 Sep 23, 2009 12:02:23 C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g 2014-03-12 10:32:27

package com.ibm.concord.spreadsheet.document.model.formula;

import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.FormulaToken;
import com.ibm.concord.spreadsheet.document.model.formula.FormulaUtil.ReferenceToken;
import com.ibm.concord.spreadsheet.document.model.impl.FormulaCell;
//package com.ibm.symphony.conversion.spreadsheet.impl;
//import java.util.ArrayList;
//import com.ibm.symphony.conversion.spreadsheet.impl.ConversionUtil;



import org.antlr.runtime.*;
import java.util.Stack;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;

import org.antlr.runtime.tree.*;

public class FormulaParser extends Parser {
    public static final String[] tokenNames = new String[] {
        "<invalid>", "<EOR>", "<DOWN>", "<UP>", "COLON", "CONCATENATION", "INTERSECT", "AND", "PLUS", "PLUSEQUAL", "MINUS", "MINUSEQUAL", "MULT", "MULTEEQUAL", "DIV", "DIVEQUAL", "P_OPEN", "P_CLOSE", "ARG_SEP", "ARG_SEP_WRONG", "EQUAL", "LESS", "LESSEQUAL", "GREATER", "GREATEREQUAL", "NOTEQUAL", "NOTEQUAL2", "AMPERSAND", "OR", "POW", "MODE", "MODEQUAL", "ARRAY_FORMULAR_START", "ARRAY_FORMULAR_END", "INT", "NAME", "NUMBER", "SINGLEQUOT_STRING", "WHITESPACE1", "DOUBLEQUOT_STRING", "NAME1", "ERRORNAME", "FUNC", "NONZERO_NUMBER", "DIGIT", "PERCENT", "LT", "COMMAOrSPACE", "KEYCHARACTER", "ODF_COLUMN", "ODF_COL_RANGE", "ODF_PREWORD", "ODF_PRELIST", "ODF_TABLE", "WHITESPACE", "SPACE", "'|'"
    };
    public static final int ODF_TABLE=53;
    public static final int ARG_SEP_WRONG=19;
    public static final int NAME1=40;
    public static final int LT=46;
    public static final int NAME=35;
    public static final int DIGIT=44;
    public static final int ARRAY_FORMULAR_END=33;
    public static final int NOTEQUAL2=26;
    public static final int EQUAL=20;
    public static final int DOUBLEQUOT_STRING=39;
    public static final int LESS=21;
    public static final int PLUS=8;
    public static final int LESSEQUAL=22;
    public static final int MULTEEQUAL=13;
    public static final int MODE=30;
    public static final int PERCENT=45;
    public static final int P_CLOSE=17;
    public static final int KEYCHARACTER=48;
    public static final int MULT=12;
    public static final int ARG_SEP=18;
    public static final int AND=7;
    public static final int CONCATENATION=5;
    public static final int POW=29;
    public static final int PLUSEQUAL=9;
    public static final int COLON=4;
    public static final int SINGLEQUOT_STRING=37;
    public static final int NOTEQUAL=25;
    public static final int DIVEQUAL=15;
    public static final int ODF_COLUMN=49;
    public static final int MINUSEQUAL=11;
    public static final int FUNC=42;
    public static final int NUMBER=36;
    public static final int INT=34;
    public static final int ODF_COL_RANGE=50;
    public static final int MINUS=10;
    public static final int WHITESPACE1=38;
    public static final int T__56=56;
    public static final int AMPERSAND=27;
    public static final int ARRAY_FORMULAR_START=32;
    public static final int P_OPEN=16;
    public static final int GREATER=23;
    public static final int EOF=-1;
    public static final int ODF_PREWORD=51;
    public static final int OR=28;
    public static final int SPACE=55;
    public static final int COMMAOrSPACE=47;
    public static final int DIV=14;
    public static final int MODEQUAL=31;
    public static final int ODF_PRELIST=52;
    public static final int NONZERO_NUMBER=43;
    public static final int ERRORNAME=41;
    public static final int GREATEREQUAL=24;
    public static final int WHITESPACE=54;
    public static final int INTERSECT=6;

    // delegates
    // delegators


        public FormulaParser(TokenStream input) {
            this(input, new RecognizerSharedState());
        }
        public FormulaParser(TokenStream input, RecognizerSharedState state) {
            super(input, state);
            this.state.ruleMemo = new HashMap[64+1];
             
             
        }
        
    protected TreeAdaptor adaptor = new CommonTreeAdaptor();

    public void setTreeAdaptor(TreeAdaptor adaptor) {
        this.adaptor = adaptor;
    }
    public TreeAdaptor getTreeAdaptor() {
        return adaptor;
    }

    public String[] getTokenNames() { return FormulaParser.tokenNames; }
    public String getGrammarFileName() { return "C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g"; }


    	FormulaCell cell = null;
    	ArrayList<FormulaToken> tokenList = new ArrayList<FormulaToken>();
    	ArrayList<FormulaToken> tokenStack = new ArrayList<FormulaToken>();
    	Exception error = null; // for parse error.
     	public void reportError(RecognitionException e){
     		error = e;
      	// ignore report the error message
      	}


    public static class prog_return extends ParserRuleReturnScope {
        public String value;
        CommonTree tree;
        public Object getTree() { return tree; }
    };

    // $ANTLR start "prog"
    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:98:1: prog returns [String value] : ( EQUAL expr EOF | ARRAY_FORMULAR_START EQUAL expr ARRAY_FORMULAR_END EOF );
    public final FormulaParser.prog_return prog() throws RecognitionException {
        FormulaParser.prog_return retval = new FormulaParser.prog_return();
        retval.start = input.LT(1);
        int prog_StartIndex = input.index();
        CommonTree root_0 = null;

        Token EQUAL1=null;
        Token EOF3=null;
        Token ARRAY_FORMULAR_START4=null;
        Token EQUAL5=null;
        Token ARRAY_FORMULAR_END7=null;
        Token EOF8=null;
        FormulaParser.expr_return expr2 = null;

        FormulaParser.expr_return expr6 = null;


        CommonTree EQUAL1_tree=null;
        CommonTree EOF3_tree=null;
        CommonTree ARRAY_FORMULAR_START4_tree=null;
        CommonTree EQUAL5_tree=null;
        CommonTree ARRAY_FORMULAR_END7_tree=null;
        CommonTree EOF8_tree=null;

        try {
            if ( state.backtracking>0 && alreadyParsedRule(input, 1) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:99:3: ( EQUAL expr EOF | ARRAY_FORMULAR_START EQUAL expr ARRAY_FORMULAR_END EOF )
            int alt1=2;
            int LA1_0 = input.LA(1);

            if ( (LA1_0==EQUAL) ) {
                alt1=1;
            }
            else if ( (LA1_0==ARRAY_FORMULAR_START) ) {
                alt1=2;
            }
            else {
                if (state.backtracking>0) {state.failed=true; return retval;}
                NoViableAltException nvae =
                    new NoViableAltException("", 1, 0, input);

                throw nvae;
            }
            switch (alt1) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:99:5: EQUAL expr EOF
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    EQUAL1=(Token)match(input,EQUAL,FOLLOW_EQUAL_in_prog364); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    EQUAL1_tree = (CommonTree)adaptor.create(EQUAL1);
                    adaptor.addChild(root_0, EQUAL1_tree);
                    }
                    pushFollow(FOLLOW_expr_in_prog366);
                    expr2=expr();

                    state._fsp--;
                    if (state.failed) return retval;
                    if ( state.backtracking==0 ) adaptor.addChild(root_0, expr2.getTree());
                    if ( state.backtracking==0 ) {
                    }
                    EOF3=(Token)match(input,EOF,FOLLOW_EOF_in_prog370); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    EOF3_tree = (CommonTree)adaptor.create(EOF3);
                    adaptor.addChild(root_0, EOF3_tree);
                    }

                    }
                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:100:5: ARRAY_FORMULAR_START EQUAL expr ARRAY_FORMULAR_END EOF
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    ARRAY_FORMULAR_START4=(Token)match(input,ARRAY_FORMULAR_START,FOLLOW_ARRAY_FORMULAR_START_in_prog376); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    ARRAY_FORMULAR_START4_tree = (CommonTree)adaptor.create(ARRAY_FORMULAR_START4);
                    adaptor.addChild(root_0, ARRAY_FORMULAR_START4_tree);
                    }
                    EQUAL5=(Token)match(input,EQUAL,FOLLOW_EQUAL_in_prog378); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    EQUAL5_tree = (CommonTree)adaptor.create(EQUAL5);
                    adaptor.addChild(root_0, EQUAL5_tree);
                    }
                    if ( state.backtracking==0 ) {

                        		
                        	
                    }
                    pushFollow(FOLLOW_expr_in_prog390);
                    expr6=expr();

                    state._fsp--;
                    if (state.failed) return retval;
                    if ( state.backtracking==0 ) adaptor.addChild(root_0, expr6.getTree());
                    if ( state.backtracking==0 ) {
                    }
                    ARRAY_FORMULAR_END7=(Token)match(input,ARRAY_FORMULAR_END,FOLLOW_ARRAY_FORMULAR_END_in_prog394); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    ARRAY_FORMULAR_END7_tree = (CommonTree)adaptor.create(ARRAY_FORMULAR_END7);
                    adaptor.addChild(root_0, ARRAY_FORMULAR_END7_tree);
                    }
                    EOF8=(Token)match(input,EOF,FOLLOW_EOF_in_prog396); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    EOF8_tree = (CommonTree)adaptor.create(EOF8);
                    adaptor.addChild(root_0, EOF8_tree);
                    }

                    }
                    break;

            }
            retval.stop = input.LT(-1);

            if ( state.backtracking==0 ) {

            retval.tree = (CommonTree)adaptor.rulePostProcessing(root_0);
            adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (RecognitionException re) {
            reportError(re);
            recover(input,re);
    	retval.tree = (CommonTree)adaptor.errorNode(input, retval.start, input.LT(-1), re);

        }
        finally {
            if ( state.backtracking>0 ) { memoize(input, 1, prog_StartIndex); }
        }
        return retval;
    }
    // $ANTLR end "prog"

    public static class expr_return extends ParserRuleReturnScope {
        public String value;
        CommonTree tree;
        public Object getTree() { return tree; }
    };

    // $ANTLR start "expr"
    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:107:1: expr returns [String value] : a= atom ( MODE )* (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr )* ;
    public final FormulaParser.expr_return expr() throws RecognitionException {
        FormulaParser.expr_return retval = new FormulaParser.expr_return();
        retval.start = input.LT(1);
        int expr_StartIndex = input.index();
        CommonTree root_0 = null;

        Token m=null;
        Token MODE9=null;
        FormulaParser.atom_return a = null;

        FormulaParser.expr_return b = null;


        CommonTree m_tree=null;
        CommonTree MODE9_tree=null;

        try {
            if ( state.backtracking>0 && alreadyParsedRule(input, 2) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:108:5: (a= atom ( MODE )* (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr )* )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:108:9: a= atom ( MODE )* (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr )*
            {
            root_0 = (CommonTree)adaptor.nil();

            pushFollow(FOLLOW_atom_in_expr419);
            a=atom();

            state._fsp--;
            if (state.failed) return retval;
            if ( state.backtracking==0 ) adaptor.addChild(root_0, a.getTree());
            if ( state.backtracking==0 ) {

                  	
            }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:110:6: ( MODE )*
            loop2:
            do {
                int alt2=2;
                int LA2_0 = input.LA(1);

                if ( (LA2_0==MODE) ) {
                    alt2=1;
                }


                switch (alt2) {
            	case 1 :
            	    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:110:7: MODE
            	    {
            	    MODE9=(Token)match(input,MODE,FOLLOW_MODE_in_expr429); if (state.failed) return retval;
            	    if ( state.backtracking==0 ) {
            	    MODE9_tree = (CommonTree)adaptor.create(MODE9);
            	    adaptor.addChild(root_0, MODE9_tree);
            	    }
            	    if ( state.backtracking==0 ) {
            	    }

            	    }
            	    break;

            	default :
            	    break loop2;
                }
            } while (true);

            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:111:9: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr )*
            loop3:
            do {
                int alt3=2;
                int LA3_0 = input.LA(1);

                if ( ((LA3_0>=COLON && LA3_0<=DIVEQUAL)||(LA3_0>=EQUAL && LA3_0<=NOTEQUAL2)||LA3_0==POW||LA3_0==MODEQUAL) ) {
                    int LA3_2 = input.LA(2);

                    if ( (synpred23_Formula()) ) {
                        alt3=1;
                    }


                }


                switch (alt3) {
            	case 1 :
            	    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:111:10: m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr
            	    {
            	    m=(Token)input.LT(1);
            	    if ( (input.LA(1)>=COLON && input.LA(1)<=DIVEQUAL)||(input.LA(1)>=EQUAL && input.LA(1)<=NOTEQUAL2)||input.LA(1)==POW||input.LA(1)==MODEQUAL ) {
            	        input.consume();
            	        if ( state.backtracking==0 ) adaptor.addChild(root_0, (CommonTree)adaptor.create(m));
            	        state.errorRecovery=false;state.failed=false;
            	    }
            	    else {
            	        if (state.backtracking>0) {state.failed=true; return retval;}
            	        MismatchedSetException mse = new MismatchedSetException(null,input);
            	        throw mse;
            	    }

            	    pushFollow(FOLLOW_expr_in_expr578);
            	    b=expr();

            	    state._fsp--;
            	    if (state.failed) return retval;
            	    if ( state.backtracking==0 ) adaptor.addChild(root_0, b.getTree());
            	    if ( state.backtracking==0 ) {

            	              	
            	              	if(m !=null && (m!=null?m.getText():null).equals(":")){
            	      				int size = tokenStack.size();
            	      				if(size>1){
            	      					FormulaToken right,left;
            	      					right = tokenStack.remove(size-1);
            	      					left = tokenStack.remove(size-2);
            	      					FormulaToken token = FormulaUtil.generateVirtualToken(left,right,cell,false);
            	      					if(token != null)
            	      					 {
            	      						tokenList.add(token);
            	      						tokenStack.add(token);
            	      					 }	

            	      				}else{ 
            	      					tokenStack.clear();
            	      				}
            	      			}else if(m !=null && (m!=null?m.getText():null).equals("~")){
            	      				// need remove the top 2 refTokens in tokenStack and calculate the covered 1 refToken put into tokenStack.
            	      				int size = tokenStack.size();
            	      				if(size>1){
            	      					FormulaToken right,left;
            	      					right = tokenStack.remove(size-1);
            	      					left = tokenStack.remove(size-2);
            	      					FormulaToken token = FormulaUtil.generateVirtualToken(left,right,cell,false);
            	      					if(token != null)
            	      					 {
            	      					 	tokenList.add(token);
            	      						tokenStack.add(token);
            	      					 }	

            	      				}else{ 
            	      					tokenStack.clear();
            	      				}
            	      			}
            	      			
            	              
            	    }

            	    }
            	    break;

            	default :
            	    break loop3;
                }
            } while (true);


            }

            retval.stop = input.LT(-1);

            if ( state.backtracking==0 ) {

            retval.tree = (CommonTree)adaptor.rulePostProcessing(root_0);
            adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (RecognitionException re) {
            reportError(re);
            recover(input,re);
    	retval.tree = (CommonTree)adaptor.errorNode(input, retval.start, input.LT(-1), re);

        }
        finally {
            if ( state.backtracking>0 ) { memoize(input, 2, expr_StartIndex); }
        }
        return retval;
    }
    // $ANTLR end "expr"

    public static class atom_return extends ParserRuleReturnScope {
        public String value;
        CommonTree tree;
        public Object getTree() { return tree; }
    };

    // $ANTLR start "atom"
    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:160:1: atom returns [String value] : ( '-' (b= atom ) | '+' (b= atom ) | x1= INT (m= COLON x2= ( INT | NAME ) )? | NUMBER | x= SINGLEQUOT_STRING ( (name= NAME ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( NAME | INT ) )? ) | () ) | x= DOUBLEQUOT_STRING | (brace= P_OPEN ) ( expr P_CLOSE ) | folded | ARRAY_FORMULAR_START atom ( ( ARG_SEP | '|' ) atom )* ARRAY_FORMULAR_END | name= ( NAME1 | ERRORNAME | NAME ) ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? endName= ( NAME1 | NAME | INT ) )? );
    public final FormulaParser.atom_return atom() throws RecognitionException {
        FormulaParser.atom_return retval = new FormulaParser.atom_return();
        retval.start = input.LT(1);
        int atom_StartIndex = input.index();
        CommonTree root_0 = null;

        Token x1=null;
        Token m=null;
        Token x2=null;
        Token x=null;
        Token name=null;
        Token endName=null;
        Token brace=null;
        Token char_literal10=null;
        Token char_literal11=null;
        Token NUMBER12=null;
        Token WHITESPACE113=null;
        Token WHITESPACE114=null;
        Token P_CLOSE16=null;
        Token ARRAY_FORMULAR_START18=null;
        Token set20=null;
        Token ARRAY_FORMULAR_END22=null;
        Token WHITESPACE123=null;
        Token WHITESPACE124=null;
        FormulaParser.atom_return b = null;

        FormulaParser.expr_return expr15 = null;

        FormulaParser.folded_return folded17 = null;

        FormulaParser.atom_return atom19 = null;

        FormulaParser.atom_return atom21 = null;


        CommonTree x1_tree=null;
        CommonTree m_tree=null;
        CommonTree x2_tree=null;
        CommonTree x_tree=null;
        CommonTree name_tree=null;
        CommonTree endName_tree=null;
        CommonTree brace_tree=null;
        CommonTree char_literal10_tree=null;
        CommonTree char_literal11_tree=null;
        CommonTree NUMBER12_tree=null;
        CommonTree WHITESPACE113_tree=null;
        CommonTree WHITESPACE114_tree=null;
        CommonTree P_CLOSE16_tree=null;
        CommonTree ARRAY_FORMULAR_START18_tree=null;
        CommonTree set20_tree=null;
        CommonTree ARRAY_FORMULAR_END22_tree=null;
        CommonTree WHITESPACE123_tree=null;
        CommonTree WHITESPACE124_tree=null;

        try {
            if ( state.backtracking>0 && alreadyParsedRule(input, 3) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:161:3: ( '-' (b= atom ) | '+' (b= atom ) | x1= INT (m= COLON x2= ( INT | NAME ) )? | NUMBER | x= SINGLEQUOT_STRING ( (name= NAME ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( NAME | INT ) )? ) | () ) | x= DOUBLEQUOT_STRING | (brace= P_OPEN ) ( expr P_CLOSE ) | folded | ARRAY_FORMULAR_START atom ( ( ARG_SEP | '|' ) atom )* ARRAY_FORMULAR_END | name= ( NAME1 | ERRORNAME | NAME ) ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? endName= ( NAME1 | NAME | INT ) )? )
            int alt14=10;
            alt14 = dfa14.predict(input);
            switch (alt14) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:161:5: '-' (b= atom )
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    char_literal10=(Token)match(input,MINUS,FOLLOW_MINUS_in_atom619); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    char_literal10_tree = (CommonTree)adaptor.create(char_literal10);
                    adaptor.addChild(root_0, char_literal10_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:161:8: (b= atom )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:161:9: b= atom
                    {
                    pushFollow(FOLLOW_atom_in_atom623);
                    b=atom();

                    state._fsp--;
                    if (state.failed) return retval;
                    if ( state.backtracking==0 ) adaptor.addChild(root_0, b.getTree());

                    }

                    if ( state.backtracking==0 ) {

                           
                        	
                    }

                    }
                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:164:4: '+' (b= atom )
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    char_literal11=(Token)match(input,PLUS,FOLLOW_PLUS_in_atom630); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    char_literal11_tree = (CommonTree)adaptor.create(char_literal11);
                    adaptor.addChild(root_0, char_literal11_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:164:7: (b= atom )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:164:8: b= atom
                    {
                    pushFollow(FOLLOW_atom_in_atom634);
                    b=atom();

                    state._fsp--;
                    if (state.failed) return retval;
                    if ( state.backtracking==0 ) adaptor.addChild(root_0, b.getTree());

                    }

                    if ( state.backtracking==0 ) {

                           
                        	
                    }

                    }
                    break;
                case 3 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:169:5: x1= INT (m= COLON x2= ( INT | NAME ) )?
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    x1=(Token)match(input,INT,FOLLOW_INT_in_atom652); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    x1_tree = (CommonTree)adaptor.create(x1);
                    adaptor.addChild(root_0, x1_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:169:14: (m= COLON x2= ( INT | NAME ) )?
                    int alt4=2;
                    int LA4_0 = input.LA(1);

                    if ( (LA4_0==COLON) ) {
                        int LA4_1 = input.LA(2);

                        if ( (LA4_1==INT) ) {
                            int LA4_3 = input.LA(3);

                            if ( (synpred27_Formula()) ) {
                                alt4=1;
                            }
                        }
                        else if ( (LA4_1==NAME) ) {
                            int LA4_4 = input.LA(3);

                            if ( (synpred27_Formula()) ) {
                                alt4=1;
                            }
                        }
                    }
                    switch (alt4) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:169:15: m= COLON x2= ( INT | NAME )
                            {
                            m=(Token)match(input,COLON,FOLLOW_COLON_in_atom657); if (state.failed) return retval;
                            if ( state.backtracking==0 ) {
                            m_tree = (CommonTree)adaptor.create(m);
                            adaptor.addChild(root_0, m_tree);
                            }
                            x2=(Token)input.LT(1);
                            if ( (input.LA(1)>=INT && input.LA(1)<=NAME) ) {
                                input.consume();
                                if ( state.backtracking==0 ) adaptor.addChild(root_0, (CommonTree)adaptor.create(x2));
                                state.errorRecovery=false;state.failed=false;
                            }
                            else {
                                if (state.backtracking>0) {state.failed=true; return retval;}
                                MismatchedSetException mse = new MismatchedSetException(null,input);
                                throw mse;
                            }


                            }
                            break;

                    }

                    if ( state.backtracking==0 ) {

                            	if(m != null){
                            		String text = (x1!=null?x1.getText():null);
                            		text += (m!=null?m.getText():null) + (x2!=null?x2.getText():null);
                        			ReferenceToken token = FormulaUtil.generateToken(text, cell,false);
                      		    if(token.getArea() != null || !(x2 != null && (m!=null?m.getText():null).equals(":")))
                      		    {
                      			     token.setIndex(x1.getCharPositionInLine());
                      			     //token.setOnlyText(textWithWp);
                      			     tokenList.add(token);
                      			     tokenStack.add(token);
                      		    }
                            	}
                            
                    }

                    }
                    break;
                case 4 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:183:5: NUMBER
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    NUMBER12=(Token)match(input,NUMBER,FOLLOW_NUMBER_in_atom676); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    NUMBER12_tree = (CommonTree)adaptor.create(NUMBER12);
                    adaptor.addChild(root_0, NUMBER12_tree);
                    }
                    if ( state.backtracking==0 ) {

                            
                            
                    }

                    }
                    break;
                case 5 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:7: x= SINGLEQUOT_STRING ( (name= NAME ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( NAME | INT ) )? ) | () )
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    x=(Token)match(input,SINGLEQUOT_STRING,FOLLOW_SINGLEQUOT_STRING_in_atom687); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    x_tree = (CommonTree)adaptor.create(x);
                    adaptor.addChild(root_0, x_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:27: ( (name= NAME ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( NAME | INT ) )? ) | () )
                    int alt9=2;
                    int LA9_0 = input.LA(1);

                    if ( (LA9_0==NAME) ) {
                        alt9=1;
                    }
                    else if ( (LA9_0==EOF||(LA9_0>=COLON && LA9_0<=DIVEQUAL)||(LA9_0>=P_CLOSE && LA9_0<=NOTEQUAL2)||(LA9_0>=POW && LA9_0<=MODEQUAL)||LA9_0==ARRAY_FORMULAR_END||LA9_0==56) ) {
                        alt9=2;
                    }
                    else {
                        if (state.backtracking>0) {state.failed=true; return retval;}
                        NoViableAltException nvae =
                            new NoViableAltException("", 9, 0, input);

                        throw nvae;
                    }
                    switch (alt9) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:28: (name= NAME ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( NAME | INT ) )? )
                            {
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:28: (name= NAME ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( NAME | INT ) )? )
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:29: name= NAME ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( NAME | INT ) )?
                            {
                            name=(Token)match(input,NAME,FOLLOW_NAME_in_atom693); if (state.failed) return retval;
                            if ( state.backtracking==0 ) {
                            name_tree = (CommonTree)adaptor.create(name);
                            adaptor.addChild(root_0, name_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:39: ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( NAME | INT ) )?
                            int alt8=2;
                            int LA8_0 = input.LA(1);

                            if ( (LA8_0==WHITESPACE1) ) {
                                alt8=1;
                            }
                            else if ( (LA8_0==COLON) ) {
                                switch ( input.LA(2) ) {
                                    case WHITESPACE1:
                                        {
                                        alt8=1;
                                        }
                                        break;
                                    case SINGLEQUOT_STRING:
                                        {
                                        int LA8_4 = input.LA(3);

                                        if ( (LA8_4==NAME) ) {
                                            int LA8_7 = input.LA(4);

                                            if ( (synpred34_Formula()) ) {
                                                alt8=1;
                                            }
                                        }
                                        else if ( (LA8_4==INT) ) {
                                            alt8=1;
                                        }
                                        }
                                        break;
                                    case INT:
                                        {
                                        int LA8_5 = input.LA(3);

                                        if ( (synpred34_Formula()) ) {
                                            alt8=1;
                                        }
                                        }
                                        break;
                                    case NAME:
                                        {
                                        int LA8_6 = input.LA(3);

                                        if ( (synpred34_Formula()) ) {
                                            alt8=1;
                                        }
                                        }
                                        break;
                                }

                            }
                            switch (alt8) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:40: ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( NAME | INT )
                                    {
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:40: ( WHITESPACE1 )?
                                    int alt5=2;
                                    int LA5_0 = input.LA(1);

                                    if ( (LA5_0==WHITESPACE1) ) {
                                        alt5=1;
                                    }
                                    switch (alt5) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:0:0: WHITESPACE1
                                            {
                                            WHITESPACE113=(Token)match(input,WHITESPACE1,FOLLOW_WHITESPACE1_in_atom696); if (state.failed) return retval;
                                            if ( state.backtracking==0 ) {
                                            WHITESPACE113_tree = (CommonTree)adaptor.create(WHITESPACE113);
                                            adaptor.addChild(root_0, WHITESPACE113_tree);
                                            }

                                            }
                                            break;

                                    }

                                    m=(Token)match(input,COLON,FOLLOW_COLON_in_atom701); if (state.failed) return retval;
                                    if ( state.backtracking==0 ) {
                                    m_tree = (CommonTree)adaptor.create(m);
                                    adaptor.addChild(root_0, m_tree);
                                    }
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:61: ( WHITESPACE1 )?
                                    int alt6=2;
                                    int LA6_0 = input.LA(1);

                                    if ( (LA6_0==WHITESPACE1) ) {
                                        alt6=1;
                                    }
                                    switch (alt6) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:0:0: WHITESPACE1
                                            {
                                            WHITESPACE114=(Token)match(input,WHITESPACE1,FOLLOW_WHITESPACE1_in_atom703); if (state.failed) return retval;
                                            if ( state.backtracking==0 ) {
                                            WHITESPACE114_tree = (CommonTree)adaptor.create(WHITESPACE114);
                                            adaptor.addChild(root_0, WHITESPACE114_tree);
                                            }

                                            }
                                            break;

                                    }

                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:74: (x2= SINGLEQUOT_STRING )?
                                    int alt7=2;
                                    int LA7_0 = input.LA(1);

                                    if ( (LA7_0==SINGLEQUOT_STRING) ) {
                                        alt7=1;
                                    }
                                    switch (alt7) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:75: x2= SINGLEQUOT_STRING
                                            {
                                            x2=(Token)match(input,SINGLEQUOT_STRING,FOLLOW_SINGLEQUOT_STRING_in_atom709); if (state.failed) return retval;
                                            if ( state.backtracking==0 ) {
                                            x2_tree = (CommonTree)adaptor.create(x2);
                                            adaptor.addChild(root_0, x2_tree);
                                            }

                                            }
                                            break;

                                    }

                                    endName=(Token)input.LT(1);
                                    if ( (input.LA(1)>=INT && input.LA(1)<=NAME) ) {
                                        input.consume();
                                        if ( state.backtracking==0 ) adaptor.addChild(root_0, (CommonTree)adaptor.create(endName));
                                        state.errorRecovery=false;state.failed=false;
                                    }
                                    else {
                                        if (state.backtracking>0) {state.failed=true; return retval;}
                                        MismatchedSetException mse = new MismatchedSetException(null,input);
                                        throw mse;
                                    }


                                    }
                                    break;

                            }

                            if ( state.backtracking==0 ) {

                                          String text = (x!=null?x.getText():null) + (name!=null?name.getText():null);
                                          String textWithWp = text;
                                          if(endName != null){
                                          	text += (m!=null?m.getText():null);
                                          	for(int i=m.getTokenIndex()-name.getTokenIndex();i>1;i--)
                                          		textWithWp+=" ";
                                          	textWithWp += (m!=null?m.getText():null);
                                          	if(x2 != null){
                              					for(int i=x2.getTokenIndex()-m.getTokenIndex();i>1;i--)
                              	            		textWithWp+=" ";
                              	            	text += (x2!=null?x2.getText():null);
                              	            	textWithWp += (x2!=null?x2.getText():null);
                                          	}else{
                              	            	for(int i=endName.getTokenIndex()-m.getTokenIndex();i>1;i--)
                              	            		textWithWp+=" ";
                                          	}
                                          	text += (endName!=null?endName.getText():null);
                                          	textWithWp += (endName!=null?endName.getText():null);
                                          }
                                          ReferenceToken token = FormulaUtil.generateToken(text, cell,false);
                                          if(token.getArea() != null || !(endName != null && (m!=null?m.getText():null).equals(":")))
                                          {
                              	            token.setIndex(x.getCharPositionInLine());
                              	            token.setOnlyText(textWithWp);
                              	            tokenList.add(token);
                              	            tokenStack.add(token);
                              	    	} 
                              		    else if(x2 == null)
                              		    {
                              		    	String text1 = (x!=null?x.getText():null) + (name!=null?name.getText():null);
                              		    	String text2 = (endName!=null?endName.getText():null);
                              		    	String textWithWp1 = text1;
                              		    	for(int i=m.getTokenIndex()-name.getTokenIndex();i>1;i--)
                                          		textWithWp1 +=" ";
                              		    	
                              	      	   	String textWithWp2 = "";
                                    	    	for(int i=endName.getTokenIndex()-m.getTokenIndex();i>1;i--)
                                          		textWithWp2 +=" ";
                                    	    	textWithWp2 += text2;
                              		    	ReferenceToken token1 = FormulaUtil.generateToken(text1, cell,false);
                              				ReferenceToken token2 = FormulaUtil.generateToken(text2, cell,false);
                              				if(token1 != null)
                              				{
                              				    token1.setIndex(x.getCharPositionInLine());
                              			            token1.setOnlyText(textWithWp1);
                              				    tokenList.add(token1);
                              				}
                              				if(token2 != null)
                              				{
                              				    token2.setIndex(endName.getCharPositionInLine());
                              			            token2.setOnlyText(textWithWp2);
                              				    tokenList.add(token2);
                              				}
                              				
                              				if(token1 != null && token2 !=null)
                              				{
                              					FormulaToken vToken = FormulaUtil.generateVirtualToken(token1,token2,cell,false);
                              					if(vToken != null)
                              					 {
                              						tokenList.add(vToken);
                              						tokenStack.add(vToken);
                              					 }	
                              				}
                              				
                              			}
                                        
                            }

                            }


                            }
                            break;
                        case 2 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:253:7: ()
                            {
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:253:7: ()
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:253:8: 
                            {
                            if ( state.backtracking==0 ) {
                            }

                            }


                            }
                            break;

                    }


                    }
                    break;
                case 6 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:255:5: x= DOUBLEQUOT_STRING
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    x=(Token)match(input,DOUBLEQUOT_STRING,FOLLOW_DOUBLEQUOT_STRING_in_atom747); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    x_tree = (CommonTree)adaptor.create(x);
                    adaptor.addChild(root_0, x_tree);
                    }
                    if ( state.backtracking==0 ) {

                            
                    }

                    }
                    break;
                case 7 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:257:5: (brace= P_OPEN ) ( expr P_CLOSE )
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:257:5: (brace= P_OPEN )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:257:6: brace= P_OPEN
                    {
                    brace=(Token)match(input,P_OPEN,FOLLOW_P_OPEN_in_atom758); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    brace_tree = (CommonTree)adaptor.create(brace);
                    adaptor.addChild(root_0, brace_tree);
                    }

                    }

                    if ( state.backtracking==0 ) {
                        
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:258:5: ( expr P_CLOSE )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:258:6: expr P_CLOSE
                    {
                    pushFollow(FOLLOW_expr_in_atom768);
                    expr15=expr();

                    state._fsp--;
                    if (state.failed) return retval;
                    if ( state.backtracking==0 ) adaptor.addChild(root_0, expr15.getTree());
                    P_CLOSE16=(Token)match(input,P_CLOSE,FOLLOW_P_CLOSE_in_atom770); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    P_CLOSE16_tree = (CommonTree)adaptor.create(P_CLOSE16);
                    adaptor.addChild(root_0, P_CLOSE16_tree);
                    }
                    if ( state.backtracking==0 ) {

                          
                    }

                    }


                    }
                    break;
                case 8 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:260:5: folded
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    pushFollow(FOLLOW_folded_in_atom779);
                    folded17=folded();

                    state._fsp--;
                    if (state.failed) return retval;
                    if ( state.backtracking==0 ) adaptor.addChild(root_0, folded17.getTree());
                    if ( state.backtracking==0 ) {
                    }

                    }
                    break;
                case 9 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:261:5: ARRAY_FORMULAR_START atom ( ( ARG_SEP | '|' ) atom )* ARRAY_FORMULAR_END
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    ARRAY_FORMULAR_START18=(Token)match(input,ARRAY_FORMULAR_START,FOLLOW_ARRAY_FORMULAR_START_in_atom787); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    ARRAY_FORMULAR_START18_tree = (CommonTree)adaptor.create(ARRAY_FORMULAR_START18);
                    adaptor.addChild(root_0, ARRAY_FORMULAR_START18_tree);
                    }
                    pushFollow(FOLLOW_atom_in_atom789);
                    atom19=atom();

                    state._fsp--;
                    if (state.failed) return retval;
                    if ( state.backtracking==0 ) adaptor.addChild(root_0, atom19.getTree());
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:261:31: ( ( ARG_SEP | '|' ) atom )*
                    loop10:
                    do {
                        int alt10=2;
                        int LA10_0 = input.LA(1);

                        if ( (LA10_0==ARG_SEP||LA10_0==56) ) {
                            alt10=1;
                        }


                        switch (alt10) {
                    	case 1 :
                    	    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:261:32: ( ARG_SEP | '|' ) atom
                    	    {
                    	    set20=(Token)input.LT(1);
                    	    if ( input.LA(1)==ARG_SEP||input.LA(1)==56 ) {
                    	        input.consume();
                    	        if ( state.backtracking==0 ) adaptor.addChild(root_0, (CommonTree)adaptor.create(set20));
                    	        state.errorRecovery=false;state.failed=false;
                    	    }
                    	    else {
                    	        if (state.backtracking>0) {state.failed=true; return retval;}
                    	        MismatchedSetException mse = new MismatchedSetException(null,input);
                    	        throw mse;
                    	    }

                    	    pushFollow(FOLLOW_atom_in_atom798);
                    	    atom21=atom();

                    	    state._fsp--;
                    	    if (state.failed) return retval;
                    	    if ( state.backtracking==0 ) adaptor.addChild(root_0, atom21.getTree());

                    	    }
                    	    break;

                    	default :
                    	    break loop10;
                        }
                    } while (true);

                    ARRAY_FORMULAR_END22=(Token)match(input,ARRAY_FORMULAR_END,FOLLOW_ARRAY_FORMULAR_END_in_atom802); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    ARRAY_FORMULAR_END22_tree = (CommonTree)adaptor.create(ARRAY_FORMULAR_END22);
                    adaptor.addChild(root_0, ARRAY_FORMULAR_END22_tree);
                    }
                    if ( state.backtracking==0 ) {
                    }

                    }
                    break;
                case 10 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:262:5: name= ( NAME1 | ERRORNAME | NAME ) ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? endName= ( NAME1 | NAME | INT ) )?
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    name=(Token)input.LT(1);
                    if ( input.LA(1)==NAME||(input.LA(1)>=NAME1 && input.LA(1)<=ERRORNAME) ) {
                        input.consume();
                        if ( state.backtracking==0 ) adaptor.addChild(root_0, (CommonTree)adaptor.create(name));
                        state.errorRecovery=false;state.failed=false;
                    }
                    else {
                        if (state.backtracking>0) {state.failed=true; return retval;}
                        MismatchedSetException mse = new MismatchedSetException(null,input);
                        throw mse;
                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:262:33: ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? endName= ( NAME1 | NAME | INT ) )?
                    int alt13=2;
                    int LA13_0 = input.LA(1);

                    if ( (LA13_0==WHITESPACE1) ) {
                        alt13=1;
                    }
                    else if ( (LA13_0==COLON) ) {
                        switch ( input.LA(2) ) {
                            case WHITESPACE1:
                                {
                                alt13=1;
                                }
                                break;
                            case INT:
                                {
                                int LA13_4 = input.LA(3);

                                if ( (synpred49_Formula()) ) {
                                    alt13=1;
                                }
                                }
                                break;
                            case NAME:
                                {
                                int LA13_5 = input.LA(3);

                                if ( (synpred49_Formula()) ) {
                                    alt13=1;
                                }
                                }
                                break;
                            case NAME1:
                                {
                                int LA13_6 = input.LA(3);

                                if ( (synpred49_Formula()) ) {
                                    alt13=1;
                                }
                                }
                                break;
                        }

                    }
                    switch (alt13) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:262:34: ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? endName= ( NAME1 | NAME | INT )
                            {
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:262:34: ( WHITESPACE1 )?
                            int alt11=2;
                            int LA11_0 = input.LA(1);

                            if ( (LA11_0==WHITESPACE1) ) {
                                alt11=1;
                            }
                            switch (alt11) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:0:0: WHITESPACE1
                                    {
                                    WHITESPACE123=(Token)match(input,WHITESPACE1,FOLLOW_WHITESPACE1_in_atom821); if (state.failed) return retval;
                                    if ( state.backtracking==0 ) {
                                    WHITESPACE123_tree = (CommonTree)adaptor.create(WHITESPACE123);
                                    adaptor.addChild(root_0, WHITESPACE123_tree);
                                    }

                                    }
                                    break;

                            }

                            m=(Token)match(input,COLON,FOLLOW_COLON_in_atom826); if (state.failed) return retval;
                            if ( state.backtracking==0 ) {
                            m_tree = (CommonTree)adaptor.create(m);
                            adaptor.addChild(root_0, m_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:262:55: ( WHITESPACE1 )?
                            int alt12=2;
                            int LA12_0 = input.LA(1);

                            if ( (LA12_0==WHITESPACE1) ) {
                                alt12=1;
                            }
                            switch (alt12) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:0:0: WHITESPACE1
                                    {
                                    WHITESPACE124=(Token)match(input,WHITESPACE1,FOLLOW_WHITESPACE1_in_atom828); if (state.failed) return retval;
                                    if ( state.backtracking==0 ) {
                                    WHITESPACE124_tree = (CommonTree)adaptor.create(WHITESPACE124);
                                    adaptor.addChild(root_0, WHITESPACE124_tree);
                                    }

                                    }
                                    break;

                            }

                            endName=(Token)input.LT(1);
                            if ( (input.LA(1)>=INT && input.LA(1)<=NAME)||input.LA(1)==NAME1 ) {
                                input.consume();
                                if ( state.backtracking==0 ) adaptor.addChild(root_0, (CommonTree)adaptor.create(endName));
                                state.errorRecovery=false;state.failed=false;
                            }
                            else {
                                if (state.backtracking>0) {state.failed=true; return retval;}
                                MismatchedSetException mse = new MismatchedSetException(null,input);
                                throw mse;
                            }


                            }
                            break;

                    }

                    if ( state.backtracking==0 ) {

                            String text = (name!=null?name.getText():null);
                            String textWithWp = text;
                            if(endName != null){
                      	    	text += (m!=null?m.getText():null) + (endName!=null?endName.getText():null);
                      	    	for(int i=m.getTokenIndex()-name.getTokenIndex();i>1;i--)
                                  	textWithWp+=" ";
                      	    	textWithWp += (m!=null?m.getText():null);
                      	    	for(int i=endName.getTokenIndex()-m.getTokenIndex();i>1;i--)
                                  	textWithWp+=" ";
                      	    	textWithWp += (endName!=null?endName.getText():null);
                            }
                            ReferenceToken token = FormulaUtil.generateToken(text, cell,false);
                            if(token.getArea() != null || !(endName != null && (m!=null?m.getText():null).equals(":")))
                            {
                      	     token.setIndex(name.getCharPositionInLine());
                      	     token.setOnlyText(textWithWp);
                      	     tokenList.add(token);
                      	     tokenStack.add(token);
                            }
                            else
                            {
                            	     String text1 = (name!=null?name.getText():null);
                            	     String text2 = (endName!=null?endName.getText():null);
                            	     String textWithWp1 = text1;
                            	     for(int i=m.getTokenIndex()-name.getTokenIndex();i>1;i--)
                                  	textWithWp1 +=" ";
                            	     
                            	     String textWithWp2 = "";
                            	     for(int i=endName.getTokenIndex()-m.getTokenIndex();i>1;i--)
                                  	textWithWp2 +=" ";
                            	     textWithWp2 += text2;
                            	     ReferenceToken token1 = FormulaUtil.generateToken(text1, cell,false);
                      	     ReferenceToken token2 = FormulaUtil.generateToken(text2, cell,false);
                      		if(token1 != null)
                      		{
                      		    token1.setIndex(name.getCharPositionInLine());
                      	            token1.setOnlyText(textWithWp1);
                      		    tokenList.add(token1);
                      		}
                      		if(token2 != null)
                      		{
                      		    token2.setIndex(endName.getCharPositionInLine());
                      	            token2.setOnlyText(textWithWp2);
                      		    tokenList.add(token2);
                      		}
                      		
                      		if(token1 != null && token2 !=null)
                      		{
                      			FormulaToken vToken = FormulaUtil.generateVirtualToken(token1,token2, cell,false);
                      			if(vToken != null)
                      			 {
                      				tokenList.add(vToken);
                      				tokenStack.add(vToken);
                      			 }	
                      		}	
                      		
                            }
                          
                    }

                    }
                    break;

            }
            retval.stop = input.LT(-1);

            if ( state.backtracking==0 ) {

            retval.tree = (CommonTree)adaptor.rulePostProcessing(root_0);
            adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (RecognitionException re) {
            reportError(re);
            recover(input,re);
    	retval.tree = (CommonTree)adaptor.errorNode(input, retval.start, input.LT(-1), re);

        }
        finally {
            if ( state.backtracking>0 ) { memoize(input, 3, atom_StartIndex); }
        }
        return retval;
    }
    // $ANTLR end "atom"

    public static class atom_list_return extends ParserRuleReturnScope {
        public String value;
        CommonTree tree;
        public Object getTree() { return tree; }
    };

    // $ANTLR start "atom_list"
    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:324:1: atom_list returns [String value] : a= atom_type ( ( ARG_SEP n= atom_type )* | ( ARG_SEP_WRONG )* ) ;
    public final FormulaParser.atom_list_return atom_list() throws RecognitionException {
        FormulaParser.atom_list_return retval = new FormulaParser.atom_list_return();
        retval.start = input.LT(1);
        int atom_list_StartIndex = input.index();
        CommonTree root_0 = null;

        Token ARG_SEP25=null;
        Token ARG_SEP_WRONG26=null;
        FormulaParser.atom_type_return a = null;

        FormulaParser.atom_type_return n = null;


        CommonTree ARG_SEP25_tree=null;
        CommonTree ARG_SEP_WRONG26_tree=null;

        try {
            if ( state.backtracking>0 && alreadyParsedRule(input, 4) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:325:3: (a= atom_type ( ( ARG_SEP n= atom_type )* | ( ARG_SEP_WRONG )* ) )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:325:5: a= atom_type ( ( ARG_SEP n= atom_type )* | ( ARG_SEP_WRONG )* )
            {
            root_0 = (CommonTree)adaptor.nil();

            pushFollow(FOLLOW_atom_type_in_atom_list867);
            a=atom_type();

            state._fsp--;
            if (state.failed) return retval;
            if ( state.backtracking==0 ) adaptor.addChild(root_0, a.getTree());
            if ( state.backtracking==0 ) {

                
            }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:326:4: ( ( ARG_SEP n= atom_type )* | ( ARG_SEP_WRONG )* )
            int alt17=2;
            switch ( input.LA(1) ) {
            case ARG_SEP:
                {
                alt17=1;
                }
                break;
            case P_CLOSE:
                {
                int LA17_2 = input.LA(2);

                if ( (synpred51_Formula()) ) {
                    alt17=1;
                }
                else if ( (true) ) {
                    alt17=2;
                }
                else {
                    if (state.backtracking>0) {state.failed=true; return retval;}
                    NoViableAltException nvae =
                        new NoViableAltException("", 17, 2, input);

                    throw nvae;
                }
                }
                break;
            case EOF:
                {
                int LA17_3 = input.LA(2);

                if ( (synpred51_Formula()) ) {
                    alt17=1;
                }
                else if ( (true) ) {
                    alt17=2;
                }
                else {
                    if (state.backtracking>0) {state.failed=true; return retval;}
                    NoViableAltException nvae =
                        new NoViableAltException("", 17, 3, input);

                    throw nvae;
                }
                }
                break;
            case ARG_SEP_WRONG:
                {
                alt17=2;
                }
                break;
            default:
                if (state.backtracking>0) {state.failed=true; return retval;}
                NoViableAltException nvae =
                    new NoViableAltException("", 17, 0, input);

                throw nvae;
            }

            switch (alt17) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:326:5: ( ARG_SEP n= atom_type )*
                    {
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:326:5: ( ARG_SEP n= atom_type )*
                    loop15:
                    do {
                        int alt15=2;
                        int LA15_0 = input.LA(1);

                        if ( (LA15_0==ARG_SEP) ) {
                            alt15=1;
                        }


                        switch (alt15) {
                    	case 1 :
                    	    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:326:6: ARG_SEP n= atom_type
                    	    {
                    	    ARG_SEP25=(Token)match(input,ARG_SEP,FOLLOW_ARG_SEP_in_atom_list872); if (state.failed) return retval;
                    	    if ( state.backtracking==0 ) {
                    	    ARG_SEP25_tree = (CommonTree)adaptor.create(ARG_SEP25);
                    	    adaptor.addChild(root_0, ARG_SEP25_tree);
                    	    }
                    	    pushFollow(FOLLOW_atom_type_in_atom_list876);
                    	    n=atom_type();

                    	    state._fsp--;
                    	    if (state.failed) return retval;
                    	    if ( state.backtracking==0 ) adaptor.addChild(root_0, n.getTree());
                    	    if ( state.backtracking==0 ) {

                    	       			tokenStack.clear();
                    	              
                    	    }

                    	    }
                    	    break;

                    	default :
                    	    break loop15;
                        }
                    } while (true);


                    }
                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:329:6: ( ARG_SEP_WRONG )*
                    {
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:329:6: ( ARG_SEP_WRONG )*
                    loop16:
                    do {
                        int alt16=2;
                        int LA16_0 = input.LA(1);

                        if ( (LA16_0==ARG_SEP_WRONG) ) {
                            alt16=1;
                        }


                        switch (alt16) {
                    	case 1 :
                    	    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:329:7: ARG_SEP_WRONG
                    	    {
                    	    ARG_SEP_WRONG26=(Token)match(input,ARG_SEP_WRONG,FOLLOW_ARG_SEP_WRONG_in_atom_list888); if (state.failed) return retval;
                    	    if ( state.backtracking==0 ) {
                    	    ARG_SEP_WRONG26_tree = (CommonTree)adaptor.create(ARG_SEP_WRONG26);
                    	    adaptor.addChild(root_0, ARG_SEP_WRONG26_tree);
                    	    }
                    	    if ( state.backtracking==0 ) {

                    	        	
                    	              
                    	    }

                    	    }
                    	    break;

                    	default :
                    	    break loop16;
                        }
                    } while (true);


                    }
                    break;

            }


            }

            retval.stop = input.LT(-1);

            if ( state.backtracking==0 ) {

            retval.tree = (CommonTree)adaptor.rulePostProcessing(root_0);
            adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (RecognitionException re) {
            reportError(re);
            recover(input,re);
    	retval.tree = (CommonTree)adaptor.errorNode(input, retval.start, input.LT(-1), re);

        }
        finally {
            if ( state.backtracking>0 ) { memoize(input, 4, atom_list_StartIndex); }
        }
        return retval;
    }
    // $ANTLR end "atom_list"

    public static class atom_type_return extends ParserRuleReturnScope {
        public String value;
        CommonTree tree;
        public Object getTree() { return tree; }
    };

    // $ANTLR start "atom_type"
    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:334:1: atom_type returns [String value] : (a= expr | );
    public final FormulaParser.atom_type_return atom_type() throws RecognitionException {
        FormulaParser.atom_type_return retval = new FormulaParser.atom_type_return();
        retval.start = input.LT(1);
        int atom_type_StartIndex = input.index();
        CommonTree root_0 = null;

        FormulaParser.expr_return a = null;



        try {
            if ( state.backtracking>0 && alreadyParsedRule(input, 5) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:335:3: (a= expr | )
            int alt18=2;
            int LA18_0 = input.LA(1);

            if ( (LA18_0==PLUS||LA18_0==MINUS||LA18_0==P_OPEN||LA18_0==ARRAY_FORMULAR_START||(LA18_0>=INT && LA18_0<=SINGLEQUOT_STRING)||(LA18_0>=DOUBLEQUOT_STRING && LA18_0<=FUNC)) ) {
                alt18=1;
            }
            else if ( (LA18_0==EOF||(LA18_0>=P_CLOSE && LA18_0<=ARG_SEP_WRONG)) ) {
                alt18=2;
            }
            else {
                if (state.backtracking>0) {state.failed=true; return retval;}
                NoViableAltException nvae =
                    new NoViableAltException("", 18, 0, input);

                throw nvae;
            }
            switch (alt18) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:335:5: a= expr
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    pushFollow(FOLLOW_expr_in_atom_type913);
                    a=expr();

                    state._fsp--;
                    if (state.failed) return retval;
                    if ( state.backtracking==0 ) adaptor.addChild(root_0, a.getTree());
                    if ( state.backtracking==0 ) {
                    }

                    }
                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:337:4: 
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    if ( state.backtracking==0 ) {
                    }

                    }
                    break;

            }
            retval.stop = input.LT(-1);

            if ( state.backtracking==0 ) {

            retval.tree = (CommonTree)adaptor.rulePostProcessing(root_0);
            adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (RecognitionException re) {
            reportError(re);
            recover(input,re);
    	retval.tree = (CommonTree)adaptor.errorNode(input, retval.start, input.LT(-1), re);

        }
        finally {
            if ( state.backtracking>0 ) { memoize(input, 5, atom_type_StartIndex); }
        }
        return retval;
    }
    // $ANTLR end "atom_type"

    public static class folded_return extends ParserRuleReturnScope {
        public String value;
        CommonTree tree;
        public Object getTree() { return tree; }
    };

    // $ANTLR start "folded"
    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:340:1: folded returns [String value] : (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' ) ( ( ')' ) | ( range ')' ) ) ;
    public final FormulaParser.folded_return folded() throws RecognitionException {
        FormulaParser.folded_return retval = new FormulaParser.folded_return();
        retval.start = input.LT(1);
        int folded_StartIndex = input.index();
        CommonTree root_0 = null;

        Token f=null;
        Token b=null;
        Token WHITESPACE127=null;
        Token char_literal28=null;
        Token char_literal30=null;
        FormulaParser.range_return range29 = null;


        CommonTree f_tree=null;
        CommonTree b_tree=null;
        CommonTree WHITESPACE127_tree=null;
        CommonTree char_literal28_tree=null;
        CommonTree char_literal30_tree=null;

        try {
            if ( state.backtracking>0 && alreadyParsedRule(input, 6) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:341:4: ( (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' ) ( ( ')' ) | ( range ')' ) ) )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:341:6: (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' ) ( ( ')' ) | ( range ')' ) )
            {
            root_0 = (CommonTree)adaptor.nil();

            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:341:6: (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' )
            int alt20=2;
            int LA20_0 = input.LA(1);

            if ( (LA20_0==FUNC) ) {
                alt20=1;
            }
            else if ( (LA20_0==NAME) ) {
                alt20=2;
            }
            else {
                if (state.backtracking>0) {state.failed=true; return retval;}
                NoViableAltException nvae =
                    new NoViableAltException("", 20, 0, input);

                throw nvae;
            }
            switch (alt20) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:341:7: f= FUNC
                    {
                    f=(Token)match(input,FUNC,FOLLOW_FUNC_in_folded947); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    f_tree = (CommonTree)adaptor.create(f);
                    adaptor.addChild(root_0, f_tree);
                    }

                    }
                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:341:18: f= NAME ( WHITESPACE1 )? b= '('
                    {
                    f=(Token)match(input,NAME,FOLLOW_NAME_in_folded955); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    f_tree = (CommonTree)adaptor.create(f);
                    adaptor.addChild(root_0, f_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:341:27: ( WHITESPACE1 )?
                    int alt19=2;
                    int LA19_0 = input.LA(1);

                    if ( (LA19_0==WHITESPACE1) ) {
                        alt19=1;
                    }
                    switch (alt19) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:0:0: WHITESPACE1
                            {
                            WHITESPACE127=(Token)match(input,WHITESPACE1,FOLLOW_WHITESPACE1_in_folded957); if (state.failed) return retval;
                            if ( state.backtracking==0 ) {
                            WHITESPACE127_tree = (CommonTree)adaptor.create(WHITESPACE127);
                            adaptor.addChild(root_0, WHITESPACE127_tree);
                            }

                            }
                            break;

                    }

                    b=(Token)match(input,P_OPEN,FOLLOW_P_OPEN_in_folded964); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    b_tree = (CommonTree)adaptor.create(b);
                    adaptor.addChild(root_0, b_tree);
                    }

                    }
                    break;

            }

            if ( state.backtracking==0 ) {


                        
            }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:344:4: ( ( ')' ) | ( range ')' ) )
            int alt21=2;
            int LA21_0 = input.LA(1);

            if ( (LA21_0==P_CLOSE) ) {
                int LA21_1 = input.LA(2);

                if ( (synpred56_Formula()) ) {
                    alt21=1;
                }
                else if ( (true) ) {
                    alt21=2;
                }
                else {
                    if (state.backtracking>0) {state.failed=true; return retval;}
                    NoViableAltException nvae =
                        new NoViableAltException("", 21, 1, input);

                    throw nvae;
                }
            }
            else if ( (LA21_0==PLUS||LA21_0==MINUS||LA21_0==P_OPEN||(LA21_0>=ARG_SEP && LA21_0<=ARG_SEP_WRONG)||LA21_0==ARRAY_FORMULAR_START||(LA21_0>=INT && LA21_0<=SINGLEQUOT_STRING)||(LA21_0>=DOUBLEQUOT_STRING && LA21_0<=FUNC)) ) {
                alt21=2;
            }
            else {
                if (state.backtracking>0) {state.failed=true; return retval;}
                NoViableAltException nvae =
                    new NoViableAltException("", 21, 0, input);

                throw nvae;
            }
            switch (alt21) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:345:11: ( ')' )
                    {
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:345:11: ( ')' )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:345:12: ')'
                    {
                    char_literal28=(Token)match(input,P_CLOSE,FOLLOW_P_CLOSE_in_folded985); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    char_literal28_tree = (CommonTree)adaptor.create(char_literal28);
                    adaptor.addChild(root_0, char_literal28_tree);
                    }
                    if ( state.backtracking==0 ) {

                      			FormulaUtil.setErrPropByFuncName((f!=null?f.getText():null), cell);
                                
                    }

                    }


                    }
                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:348:12: ( range ')' )
                    {
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:348:12: ( range ')' )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:348:13: range ')'
                    {
                    pushFollow(FOLLOW_range_in_folded1001);
                    range29=range();

                    state._fsp--;
                    if (state.failed) return retval;
                    if ( state.backtracking==0 ) adaptor.addChild(root_0, range29.getTree());
                    char_literal30=(Token)match(input,P_CLOSE,FOLLOW_P_CLOSE_in_folded1003); if (state.failed) return retval;
                    if ( state.backtracking==0 ) {
                    char_literal30_tree = (CommonTree)adaptor.create(char_literal30);
                    adaptor.addChild(root_0, char_literal30_tree);
                    }
                    if ( state.backtracking==0 ) {

                                FormulaUtil.setErrPropByFuncName((f!=null?f.getText():null), cell);
                                
                    }

                    }


                    }
                    break;

            }


            }

            retval.stop = input.LT(-1);

            if ( state.backtracking==0 ) {

            retval.tree = (CommonTree)adaptor.rulePostProcessing(root_0);
            adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (RecognitionException re) {
            reportError(re);
            recover(input,re);
    	retval.tree = (CommonTree)adaptor.errorNode(input, retval.start, input.LT(-1), re);

        }
        finally {
            if ( state.backtracking>0 ) { memoize(input, 6, folded_StartIndex); }
        }
        return retval;
    }
    // $ANTLR end "folded"

    public static class range_return extends ParserRuleReturnScope {
        public String value;
        CommonTree tree;
        public Object getTree() { return tree; }
    };

    // $ANTLR start "range"
    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:354:1: range returns [String value] : (params= atom_list | funct= folded );
    public final FormulaParser.range_return range() throws RecognitionException {
        FormulaParser.range_return retval = new FormulaParser.range_return();
        retval.start = input.LT(1);
        int range_StartIndex = input.index();
        CommonTree root_0 = null;

        FormulaParser.atom_list_return params = null;

        FormulaParser.folded_return funct = null;



        try {
            if ( state.backtracking>0 && alreadyParsedRule(input, 7) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:355:2: (params= atom_list | funct= folded )
            int alt22=2;
            alt22 = dfa22.predict(input);
            switch (alt22) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:355:4: params= atom_list
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    pushFollow(FOLLOW_atom_list_in_range1035);
                    params=atom_list();

                    state._fsp--;
                    if (state.failed) return retval;
                    if ( state.backtracking==0 ) adaptor.addChild(root_0, params.getTree());
                    if ( state.backtracking==0 ) {

                      		
                      	
                    }

                    }
                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:358:4: funct= folded
                    {
                    root_0 = (CommonTree)adaptor.nil();

                    pushFollow(FOLLOW_folded_in_range1046);
                    funct=folded();

                    state._fsp--;
                    if (state.failed) return retval;
                    if ( state.backtracking==0 ) adaptor.addChild(root_0, funct.getTree());
                    if ( state.backtracking==0 ) {
                    }

                    }
                    break;

            }
            retval.stop = input.LT(-1);

            if ( state.backtracking==0 ) {

            retval.tree = (CommonTree)adaptor.rulePostProcessing(root_0);
            adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (RecognitionException re) {
            reportError(re);
            recover(input,re);
    	retval.tree = (CommonTree)adaptor.errorNode(input, retval.start, input.LT(-1), re);

        }
        finally {
            if ( state.backtracking>0 ) { memoize(input, 7, range_StartIndex); }
        }
        return retval;
    }
    // $ANTLR end "range"

    // $ANTLR start synpred23_Formula
    public final void synpred23_Formula_fragment() throws RecognitionException {   
        Token m=null;
        FormulaParser.expr_return b = null;


        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:111:10: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:111:10: m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr
        {
        m=(Token)input.LT(1);
        if ( (input.LA(1)>=COLON && input.LA(1)<=DIVEQUAL)||(input.LA(1)>=EQUAL && input.LA(1)<=NOTEQUAL2)||input.LA(1)==POW||input.LA(1)==MODEQUAL ) {
            input.consume();
            state.errorRecovery=false;state.failed=false;
        }
        else {
            if (state.backtracking>0) {state.failed=true; return ;}
            MismatchedSetException mse = new MismatchedSetException(null,input);
            throw mse;
        }

        pushFollow(FOLLOW_expr_in_synpred23_Formula578);
        b=expr();

        state._fsp--;
        if (state.failed) return ;

        }
    }
    // $ANTLR end synpred23_Formula

    // $ANTLR start synpred27_Formula
    public final void synpred27_Formula_fragment() throws RecognitionException {   
        Token m=null;
        Token x2=null;

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:169:15: (m= COLON x2= ( INT | NAME ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:169:15: m= COLON x2= ( INT | NAME )
        {
        m=(Token)match(input,COLON,FOLLOW_COLON_in_synpred27_Formula657); if (state.failed) return ;
        x2=(Token)input.LT(1);
        if ( (input.LA(1)>=INT && input.LA(1)<=NAME) ) {
            input.consume();
            state.errorRecovery=false;state.failed=false;
        }
        else {
            if (state.backtracking>0) {state.failed=true; return ;}
            MismatchedSetException mse = new MismatchedSetException(null,input);
            throw mse;
        }


        }
    }
    // $ANTLR end synpred27_Formula

    // $ANTLR start synpred34_Formula
    public final void synpred34_Formula_fragment() throws RecognitionException {   
        Token m=null;
        Token x2=null;
        Token endName=null;

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:40: ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( NAME | INT ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:40: ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( NAME | INT )
        {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:40: ( WHITESPACE1 )?
        int alt24=2;
        int LA24_0 = input.LA(1);

        if ( (LA24_0==WHITESPACE1) ) {
            alt24=1;
        }
        switch (alt24) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:0:0: WHITESPACE1
                {
                match(input,WHITESPACE1,FOLLOW_WHITESPACE1_in_synpred34_Formula696); if (state.failed) return ;

                }
                break;

        }

        m=(Token)match(input,COLON,FOLLOW_COLON_in_synpred34_Formula701); if (state.failed) return ;
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:61: ( WHITESPACE1 )?
        int alt25=2;
        int LA25_0 = input.LA(1);

        if ( (LA25_0==WHITESPACE1) ) {
            alt25=1;
        }
        switch (alt25) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:0:0: WHITESPACE1
                {
                match(input,WHITESPACE1,FOLLOW_WHITESPACE1_in_synpred34_Formula703); if (state.failed) return ;

                }
                break;

        }

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:74: (x2= SINGLEQUOT_STRING )?
        int alt26=2;
        int LA26_0 = input.LA(1);

        if ( (LA26_0==SINGLEQUOT_STRING) ) {
            alt26=1;
        }
        switch (alt26) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:186:75: x2= SINGLEQUOT_STRING
                {
                x2=(Token)match(input,SINGLEQUOT_STRING,FOLLOW_SINGLEQUOT_STRING_in_synpred34_Formula709); if (state.failed) return ;

                }
                break;

        }

        endName=(Token)input.LT(1);
        if ( (input.LA(1)>=INT && input.LA(1)<=NAME) ) {
            input.consume();
            state.errorRecovery=false;state.failed=false;
        }
        else {
            if (state.backtracking>0) {state.failed=true; return ;}
            MismatchedSetException mse = new MismatchedSetException(null,input);
            throw mse;
        }


        }
    }
    // $ANTLR end synpred34_Formula

    // $ANTLR start synpred49_Formula
    public final void synpred49_Formula_fragment() throws RecognitionException {   
        Token m=null;
        Token endName=null;

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:262:34: ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? endName= ( NAME1 | NAME | INT ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:262:34: ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? endName= ( NAME1 | NAME | INT )
        {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:262:34: ( WHITESPACE1 )?
        int alt37=2;
        int LA37_0 = input.LA(1);

        if ( (LA37_0==WHITESPACE1) ) {
            alt37=1;
        }
        switch (alt37) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:0:0: WHITESPACE1
                {
                match(input,WHITESPACE1,FOLLOW_WHITESPACE1_in_synpred49_Formula821); if (state.failed) return ;

                }
                break;

        }

        m=(Token)match(input,COLON,FOLLOW_COLON_in_synpred49_Formula826); if (state.failed) return ;
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:262:55: ( WHITESPACE1 )?
        int alt38=2;
        int LA38_0 = input.LA(1);

        if ( (LA38_0==WHITESPACE1) ) {
            alt38=1;
        }
        switch (alt38) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:0:0: WHITESPACE1
                {
                match(input,WHITESPACE1,FOLLOW_WHITESPACE1_in_synpred49_Formula828); if (state.failed) return ;

                }
                break;

        }

        endName=(Token)input.LT(1);
        if ( (input.LA(1)>=INT && input.LA(1)<=NAME)||input.LA(1)==NAME1 ) {
            input.consume();
            state.errorRecovery=false;state.failed=false;
        }
        else {
            if (state.backtracking>0) {state.failed=true; return ;}
            MismatchedSetException mse = new MismatchedSetException(null,input);
            throw mse;
        }


        }
    }
    // $ANTLR end synpred49_Formula

    // $ANTLR start synpred51_Formula
    public final void synpred51_Formula_fragment() throws RecognitionException {   
        FormulaParser.atom_type_return n = null;


        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:326:5: ( ( ARG_SEP n= atom_type )* )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:326:5: ( ARG_SEP n= atom_type )*
        {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:326:5: ( ARG_SEP n= atom_type )*
        loop39:
        do {
            int alt39=2;
            int LA39_0 = input.LA(1);

            if ( (LA39_0==ARG_SEP) ) {
                alt39=1;
            }


            switch (alt39) {
        	case 1 :
        	    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:326:6: ARG_SEP n= atom_type
        	    {
        	    match(input,ARG_SEP,FOLLOW_ARG_SEP_in_synpred51_Formula872); if (state.failed) return ;
        	    pushFollow(FOLLOW_atom_type_in_synpred51_Formula876);
        	    n=atom_type();

        	    state._fsp--;
        	    if (state.failed) return ;

        	    }
        	    break;

        	default :
        	    break loop39;
            }
        } while (true);


        }
    }
    // $ANTLR end synpred51_Formula

    // $ANTLR start synpred56_Formula
    public final void synpred56_Formula_fragment() throws RecognitionException {   
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:345:11: ( ( ')' ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:345:11: ( ')' )
        {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:345:11: ( ')' )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:345:12: ')'
        {
        match(input,P_CLOSE,FOLLOW_P_CLOSE_in_synpred56_Formula985); if (state.failed) return ;

        }


        }
    }
    // $ANTLR end synpred56_Formula

    // $ANTLR start synpred57_Formula
    public final void synpred57_Formula_fragment() throws RecognitionException {   
        FormulaParser.atom_list_return params = null;


        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:355:4: (params= atom_list )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.concord.spreadsheet\\src\\com\\ibm\\concord\\spreadsheet\\document\\model\\formula\\Formula.g:355:4: params= atom_list
        {
        pushFollow(FOLLOW_atom_list_in_synpred57_Formula1035);
        params=atom_list();

        state._fsp--;
        if (state.failed) return ;

        }
    }
    // $ANTLR end synpred57_Formula

    // Delegated rules

    public final boolean synpred56_Formula() {
        state.backtracking++;
        int start = input.mark();
        try {
            synpred56_Formula_fragment(); // can never throw exception
        } catch (RecognitionException re) {
            System.err.println("impossible: "+re);
        }
        boolean success = !state.failed;
        input.rewind(start);
        state.backtracking--;
        state.failed=false;
        return success;
    }
    public final boolean synpred34_Formula() {
        state.backtracking++;
        int start = input.mark();
        try {
            synpred34_Formula_fragment(); // can never throw exception
        } catch (RecognitionException re) {
            System.err.println("impossible: "+re);
        }
        boolean success = !state.failed;
        input.rewind(start);
        state.backtracking--;
        state.failed=false;
        return success;
    }
    public final boolean synpred23_Formula() {
        state.backtracking++;
        int start = input.mark();
        try {
            synpred23_Formula_fragment(); // can never throw exception
        } catch (RecognitionException re) {
            System.err.println("impossible: "+re);
        }
        boolean success = !state.failed;
        input.rewind(start);
        state.backtracking--;
        state.failed=false;
        return success;
    }
    public final boolean synpred57_Formula() {
        state.backtracking++;
        int start = input.mark();
        try {
            synpred57_Formula_fragment(); // can never throw exception
        } catch (RecognitionException re) {
            System.err.println("impossible: "+re);
        }
        boolean success = !state.failed;
        input.rewind(start);
        state.backtracking--;
        state.failed=false;
        return success;
    }
    public final boolean synpred49_Formula() {
        state.backtracking++;
        int start = input.mark();
        try {
            synpred49_Formula_fragment(); // can never throw exception
        } catch (RecognitionException re) {
            System.err.println("impossible: "+re);
        }
        boolean success = !state.failed;
        input.rewind(start);
        state.backtracking--;
        state.failed=false;
        return success;
    }
    public final boolean synpred27_Formula() {
        state.backtracking++;
        int start = input.mark();
        try {
            synpred27_Formula_fragment(); // can never throw exception
        } catch (RecognitionException re) {
            System.err.println("impossible: "+re);
        }
        boolean success = !state.failed;
        input.rewind(start);
        state.backtracking--;
        state.failed=false;
        return success;
    }
    public final boolean synpred51_Formula() {
        state.backtracking++;
        int start = input.mark();
        try {
            synpred51_Formula_fragment(); // can never throw exception
        } catch (RecognitionException re) {
            System.err.println("impossible: "+re);
        }
        boolean success = !state.failed;
        input.rewind(start);
        state.backtracking--;
        state.failed=false;
        return success;
    }


    protected DFA14 dfa14 = new DFA14(this);
    protected DFA22 dfa22 = new DFA22(this);
    static final String DFA14_eotS =
        "\15\uffff";
    static final String DFA14_eofS =
        "\11\uffff\1\13\3\uffff";
    static final String DFA14_minS =
        "\1\10\10\uffff\1\4\2\uffff\1\4";
    static final String DFA14_maxS =
        "\1\52\10\uffff\1\70\2\uffff\1\20";
    static final String DFA14_acceptS =
        "\1\uffff\1\1\1\2\1\3\1\4\1\5\1\6\1\7\1\10\1\uffff\1\11\1\12\1\uffff";
    static final String DFA14_specialS =
        "\15\uffff}>";
    static final String[] DFA14_transitionS = {
            "\1\2\1\uffff\1\1\5\uffff\1\7\17\uffff\1\12\1\uffff\1\3\1\11"+
            "\1\4\1\5\1\uffff\1\6\2\13\1\10",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "\14\13\1\10\12\13\2\uffff\3\13\1\uffff\1\13\4\uffff\1\14\21"+
            "\uffff\1\13",
            "",
            "",
            "\1\13\13\uffff\1\10"
    };

    static final short[] DFA14_eot = DFA.unpackEncodedString(DFA14_eotS);
    static final short[] DFA14_eof = DFA.unpackEncodedString(DFA14_eofS);
    static final char[] DFA14_min = DFA.unpackEncodedStringToUnsignedChars(DFA14_minS);
    static final char[] DFA14_max = DFA.unpackEncodedStringToUnsignedChars(DFA14_maxS);
    static final short[] DFA14_accept = DFA.unpackEncodedString(DFA14_acceptS);
    static final short[] DFA14_special = DFA.unpackEncodedString(DFA14_specialS);
    static final short[][] DFA14_transition;

    static {
        int numStates = DFA14_transitionS.length;
        DFA14_transition = new short[numStates][];
        for (int i=0; i<numStates; i++) {
            DFA14_transition[i] = DFA.unpackEncodedString(DFA14_transitionS[i]);
        }
    }

    class DFA14 extends DFA {

        public DFA14(BaseRecognizer recognizer) {
            this.recognizer = recognizer;
            this.decisionNumber = 14;
            this.eot = DFA14_eot;
            this.eof = DFA14_eof;
            this.min = DFA14_min;
            this.max = DFA14_max;
            this.accept = DFA14_accept;
            this.special = DFA14_special;
            this.transition = DFA14_transition;
        }
        public String getDescription() {
            return "160:1: atom returns [String value] : ( '-' (b= atom ) | '+' (b= atom ) | x1= INT (m= COLON x2= ( INT | NAME ) )? | NUMBER | x= SINGLEQUOT_STRING ( (name= NAME ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( NAME | INT ) )? ) | () ) | x= DOUBLEQUOT_STRING | (brace= P_OPEN ) ( expr P_CLOSE ) | folded | ARRAY_FORMULAR_START atom ( ( ARG_SEP | '|' ) atom )* ARRAY_FORMULAR_END | name= ( NAME1 | ERRORNAME | NAME ) ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? endName= ( NAME1 | NAME | INT ) )? );";
        }
    }
    static final String DFA22_eotS =
        "\20\uffff";
    static final String DFA22_eofS =
        "\20\uffff";
    static final String DFA22_minS =
        "\1\10\7\uffff\2\0\6\uffff";
    static final String DFA22_maxS =
        "\1\52\7\uffff\2\0\6\uffff";
    static final String DFA22_acceptS =
        "\1\uffff\1\1\15\uffff\1\2";
    static final String DFA22_specialS =
        "\10\uffff\1\0\1\1\6\uffff}>";
    static final String[] DFA22_transitionS = {
            "\1\1\1\uffff\1\1\5\uffff\4\1\14\uffff\1\1\1\uffff\1\1\1\11"+
            "\2\1\1\uffff\3\1\1\10",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "\1\uffff",
            "\1\uffff",
            "",
            "",
            "",
            "",
            "",
            ""
    };

    static final short[] DFA22_eot = DFA.unpackEncodedString(DFA22_eotS);
    static final short[] DFA22_eof = DFA.unpackEncodedString(DFA22_eofS);
    static final char[] DFA22_min = DFA.unpackEncodedStringToUnsignedChars(DFA22_minS);
    static final char[] DFA22_max = DFA.unpackEncodedStringToUnsignedChars(DFA22_maxS);
    static final short[] DFA22_accept = DFA.unpackEncodedString(DFA22_acceptS);
    static final short[] DFA22_special = DFA.unpackEncodedString(DFA22_specialS);
    static final short[][] DFA22_transition;

    static {
        int numStates = DFA22_transitionS.length;
        DFA22_transition = new short[numStates][];
        for (int i=0; i<numStates; i++) {
            DFA22_transition[i] = DFA.unpackEncodedString(DFA22_transitionS[i]);
        }
    }

    class DFA22 extends DFA {

        public DFA22(BaseRecognizer recognizer) {
            this.recognizer = recognizer;
            this.decisionNumber = 22;
            this.eot = DFA22_eot;
            this.eof = DFA22_eof;
            this.min = DFA22_min;
            this.max = DFA22_max;
            this.accept = DFA22_accept;
            this.special = DFA22_special;
            this.transition = DFA22_transition;
        }
        public String getDescription() {
            return "354:1: range returns [String value] : (params= atom_list | funct= folded );";
        }
        public int specialStateTransition(int s, IntStream _input) throws NoViableAltException {
            TokenStream input = (TokenStream)_input;
        	int _s = s;
            switch ( s ) {
                    case 0 : 
                        int LA22_8 = input.LA(1);

                         
                        int index22_8 = input.index();
                        input.rewind();
                        s = -1;
                        if ( (synpred57_Formula()) ) {s = 1;}

                        else if ( (true) ) {s = 15;}

                         
                        input.seek(index22_8);
                        if ( s>=0 ) return s;
                        break;
                    case 1 : 
                        int LA22_9 = input.LA(1);

                         
                        int index22_9 = input.index();
                        input.rewind();
                        s = -1;
                        if ( (synpred57_Formula()) ) {s = 1;}

                        else if ( (true) ) {s = 15;}

                         
                        input.seek(index22_9);
                        if ( s>=0 ) return s;
                        break;
            }
            if (state.backtracking>0) {state.failed=true; return -1;}
            NoViableAltException nvae =
                new NoViableAltException(getDescription(), 22, _s, input);
            error(nvae);
            throw nvae;
        }
    }
 

    public static final BitSet FOLLOW_EQUAL_in_prog364 = new BitSet(new long[]{0x000007BD00010500L});
    public static final BitSet FOLLOW_expr_in_prog366 = new BitSet(new long[]{0x0000000000000000L});
    public static final BitSet FOLLOW_EOF_in_prog370 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_ARRAY_FORMULAR_START_in_prog376 = new BitSet(new long[]{0x0000000000100000L});
    public static final BitSet FOLLOW_EQUAL_in_prog378 = new BitSet(new long[]{0x000007BD00010500L});
    public static final BitSet FOLLOW_expr_in_prog390 = new BitSet(new long[]{0x0000000200000000L});
    public static final BitSet FOLLOW_ARRAY_FORMULAR_END_in_prog394 = new BitSet(new long[]{0x0000000000000000L});
    public static final BitSet FOLLOW_EOF_in_prog396 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_atom_in_expr419 = new BitSet(new long[]{0x00000000E7F0FFF2L});
    public static final BitSet FOLLOW_MODE_in_expr429 = new BitSet(new long[]{0x00000000E7F0FFF2L});
    public static final BitSet FOLLOW_set_in_expr445 = new BitSet(new long[]{0x000007BD00010500L});
    public static final BitSet FOLLOW_expr_in_expr578 = new BitSet(new long[]{0x00000000A7F0FFF2L});
    public static final BitSet FOLLOW_MINUS_in_atom619 = new BitSet(new long[]{0x000007BD00010500L});
    public static final BitSet FOLLOW_atom_in_atom623 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_PLUS_in_atom630 = new BitSet(new long[]{0x000007BD00010500L});
    public static final BitSet FOLLOW_atom_in_atom634 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_INT_in_atom652 = new BitSet(new long[]{0x0000000000000012L});
    public static final BitSet FOLLOW_COLON_in_atom657 = new BitSet(new long[]{0x0000000C00000000L});
    public static final BitSet FOLLOW_set_in_atom663 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_NUMBER_in_atom676 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_SINGLEQUOT_STRING_in_atom687 = new BitSet(new long[]{0x0000000800000002L});
    public static final BitSet FOLLOW_NAME_in_atom693 = new BitSet(new long[]{0x0000004000000012L});
    public static final BitSet FOLLOW_WHITESPACE1_in_atom696 = new BitSet(new long[]{0x0000000000000010L});
    public static final BitSet FOLLOW_COLON_in_atom701 = new BitSet(new long[]{0x0000006C00000000L});
    public static final BitSet FOLLOW_WHITESPACE1_in_atom703 = new BitSet(new long[]{0x0000002C00000000L});
    public static final BitSet FOLLOW_SINGLEQUOT_STRING_in_atom709 = new BitSet(new long[]{0x0000000C00000000L});
    public static final BitSet FOLLOW_set_in_atom715 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_DOUBLEQUOT_STRING_in_atom747 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_P_OPEN_in_atom758 = new BitSet(new long[]{0x000007BD00010500L});
    public static final BitSet FOLLOW_expr_in_atom768 = new BitSet(new long[]{0x0000000000020000L});
    public static final BitSet FOLLOW_P_CLOSE_in_atom770 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_folded_in_atom779 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_ARRAY_FORMULAR_START_in_atom787 = new BitSet(new long[]{0x000007BD00010500L});
    public static final BitSet FOLLOW_atom_in_atom789 = new BitSet(new long[]{0x0100000200040000L});
    public static final BitSet FOLLOW_set_in_atom792 = new BitSet(new long[]{0x000007BD00010500L});
    public static final BitSet FOLLOW_atom_in_atom798 = new BitSet(new long[]{0x0100000200040000L});
    public static final BitSet FOLLOW_ARRAY_FORMULAR_END_in_atom802 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_set_in_atom812 = new BitSet(new long[]{0x0000004000000012L});
    public static final BitSet FOLLOW_WHITESPACE1_in_atom821 = new BitSet(new long[]{0x0000000000000010L});
    public static final BitSet FOLLOW_COLON_in_atom826 = new BitSet(new long[]{0x0000014C00000000L});
    public static final BitSet FOLLOW_WHITESPACE1_in_atom828 = new BitSet(new long[]{0x0000010C00000000L});
    public static final BitSet FOLLOW_set_in_atom833 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_atom_type_in_atom_list867 = new BitSet(new long[]{0x00000000000C0002L});
    public static final BitSet FOLLOW_ARG_SEP_in_atom_list872 = new BitSet(new long[]{0x000007BD00050500L});
    public static final BitSet FOLLOW_atom_type_in_atom_list876 = new BitSet(new long[]{0x0000000000040002L});
    public static final BitSet FOLLOW_ARG_SEP_WRONG_in_atom_list888 = new BitSet(new long[]{0x0000000000080002L});
    public static final BitSet FOLLOW_expr_in_atom_type913 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_FUNC_in_folded947 = new BitSet(new long[]{0x000007BD000F0500L});
    public static final BitSet FOLLOW_NAME_in_folded955 = new BitSet(new long[]{0x0000004000010000L});
    public static final BitSet FOLLOW_WHITESPACE1_in_folded957 = new BitSet(new long[]{0x0000000000010000L});
    public static final BitSet FOLLOW_P_OPEN_in_folded964 = new BitSet(new long[]{0x000007BD000F0500L});
    public static final BitSet FOLLOW_P_CLOSE_in_folded985 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_range_in_folded1001 = new BitSet(new long[]{0x0000000000020000L});
    public static final BitSet FOLLOW_P_CLOSE_in_folded1003 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_atom_list_in_range1035 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_folded_in_range1046 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_set_in_synpred23_Formula445 = new BitSet(new long[]{0x000007BD00010500L});
    public static final BitSet FOLLOW_expr_in_synpred23_Formula578 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_COLON_in_synpred27_Formula657 = new BitSet(new long[]{0x0000000C00000000L});
    public static final BitSet FOLLOW_set_in_synpred27_Formula663 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_WHITESPACE1_in_synpred34_Formula696 = new BitSet(new long[]{0x0000000000000010L});
    public static final BitSet FOLLOW_COLON_in_synpred34_Formula701 = new BitSet(new long[]{0x0000006C00000000L});
    public static final BitSet FOLLOW_WHITESPACE1_in_synpred34_Formula703 = new BitSet(new long[]{0x0000002C00000000L});
    public static final BitSet FOLLOW_SINGLEQUOT_STRING_in_synpred34_Formula709 = new BitSet(new long[]{0x0000000C00000000L});
    public static final BitSet FOLLOW_set_in_synpred34_Formula715 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_WHITESPACE1_in_synpred49_Formula821 = new BitSet(new long[]{0x0000000000000010L});
    public static final BitSet FOLLOW_COLON_in_synpred49_Formula826 = new BitSet(new long[]{0x0000014C00000000L});
    public static final BitSet FOLLOW_WHITESPACE1_in_synpred49_Formula828 = new BitSet(new long[]{0x0000010C00000000L});
    public static final BitSet FOLLOW_set_in_synpred49_Formula833 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_ARG_SEP_in_synpred51_Formula872 = new BitSet(new long[]{0x000007BD00050500L});
    public static final BitSet FOLLOW_atom_type_in_synpred51_Formula876 = new BitSet(new long[]{0x0000000000040002L});
    public static final BitSet FOLLOW_P_CLOSE_in_synpred56_Formula985 = new BitSet(new long[]{0x0000000000000002L});
    public static final BitSet FOLLOW_atom_list_in_synpred57_Formula1035 = new BitSet(new long[]{0x0000000000000002L});

}