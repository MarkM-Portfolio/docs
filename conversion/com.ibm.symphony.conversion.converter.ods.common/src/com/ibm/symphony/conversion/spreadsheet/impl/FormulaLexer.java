// $ANTLR 3.2 Sep 23, 2009 12:02:23 D:\\Work\\antlr\\conversion\\Formula.g 2014-04-28 16:05:45

package com.ibm.symphony.conversion.spreadsheet.impl;



import org.antlr.runtime.*;
import java.util.Stack;
import java.util.List;
import java.util.ArrayList;

public class FormulaLexer extends Lexer {
    public static final int LT=46;
    public static final int ERRORNAME=41;
    public static final int SINGLEQUOT_STRING=37;
    public static final int NONZERO_NUMBER=43;
    public static final int KEYCHARACTER=48;
    public static final int GREATEREQUAL=24;
    public static final int ARG_SEP=18;
    public static final int ARRAY_FORMULAR_END=33;
    public static final int AND=7;
    public static final int SPACE=55;
    public static final int EOF=-1;
    public static final int DIVEQUAL=15;
    public static final int ARRAY_FORMULAR_START=32;
    public static final int PLUSEQUAL=9;
    public static final int NOTEQUAL=25;
    public static final int T__56=56;
    public static final int MINUSEQUAL=11;
    public static final int NAME=35;
    public static final int GREATER=23;
    public static final int POW=29;
    public static final int MODEQUAL=31;
    public static final int EQUAL=20;
    public static final int LESS=21;
    public static final int PLUS=8;
    public static final int COMMAOrSPACE=47;
    public static final int DIGIT=44;
    public static final int MODE=30;
    public static final int ARG_SEP_WRONG=19;
    public static final int PERCENT=45;
    public static final int WHITESPACE1=38;
    public static final int MULTEEQUAL=13;
    public static final int NUMBER=36;
    public static final int AMPERSAND=27;
    public static final int WHITESPACE=54;
    public static final int CONCATENATION=5;
    public static final int ODF_PREWORD=51;
    public static final int INT=34;
    public static final int ODF_TABLE=53;
    public static final int MULT=12;
    public static final int MINUS=10;
    public static final int COLON=4;
    public static final int P_OPEN=16;
    public static final int INTERSECT=6;
    public static final int ODF_PRELIST=52;
    public static final int P_CLOSE=17;
    public static final int DOUBLEQUOT_STRING=39;
    public static final int FUNC=42;
    public static final int OR=28;
    public static final int ODF_COLUMN=49;
    public static final int NAME1=40;
    public static final int NOTEQUAL2=26;
    public static final int DIV=14;
    public static final int LESSEQUAL=22;
    public static final int ODF_COL_RANGE=50;

    	public boolean _cellHasUnicode = false;
    	
      	public void reportError(RecognitionException e){
      	// ignore report the error message
      	}


    // delegates
    // delegators

    public FormulaLexer() {;} 
    public FormulaLexer(CharStream input) {
        this(input, new RecognizerSharedState());
    }
    public FormulaLexer(CharStream input, RecognizerSharedState state) {
        super(input,state);

    }
    public String getGrammarFileName() { return "D:\\Work\\antlr\\conversion\\Formula.g"; }

    // $ANTLR start "COLON"
    public final void mCOLON() throws RecognitionException {
        try {
            int _type = COLON;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:19:7: ( ':' )
            // D:\\Work\\antlr\\conversion\\Formula.g:19:9: ':'
            {
            match(':'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "COLON"

    // $ANTLR start "CONCATENATION"
    public final void mCONCATENATION() throws RecognitionException {
        try {
            int _type = CONCATENATION;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:20:15: ( '~' )
            // D:\\Work\\antlr\\conversion\\Formula.g:20:17: '~'
            {
            match('~'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "CONCATENATION"

    // $ANTLR start "INTERSECT"
    public final void mINTERSECT() throws RecognitionException {
        try {
            int _type = INTERSECT;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:21:11: ( '!' )
            // D:\\Work\\antlr\\conversion\\Formula.g:21:13: '!'
            {
            match('!'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "INTERSECT"

    // $ANTLR start "AND"
    public final void mAND() throws RecognitionException {
        try {
            int _type = AND;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:22:5: ( '&' )
            // D:\\Work\\antlr\\conversion\\Formula.g:22:7: '&'
            {
            match('&'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "AND"

    // $ANTLR start "PLUS"
    public final void mPLUS() throws RecognitionException {
        try {
            int _type = PLUS;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:23:6: ( '+' )
            // D:\\Work\\antlr\\conversion\\Formula.g:23:8: '+'
            {
            match('+'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "PLUS"

    // $ANTLR start "PLUSEQUAL"
    public final void mPLUSEQUAL() throws RecognitionException {
        try {
            int _type = PLUSEQUAL;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:24:11: ( '+=' )
            // D:\\Work\\antlr\\conversion\\Formula.g:24:13: '+='
            {
            match("+="); 


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "PLUSEQUAL"

    // $ANTLR start "MINUS"
    public final void mMINUS() throws RecognitionException {
        try {
            int _type = MINUS;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:25:7: ( '-' )
            // D:\\Work\\antlr\\conversion\\Formula.g:25:9: '-'
            {
            match('-'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "MINUS"

    // $ANTLR start "MINUSEQUAL"
    public final void mMINUSEQUAL() throws RecognitionException {
        try {
            int _type = MINUSEQUAL;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:26:12: ( '-=' )
            // D:\\Work\\antlr\\conversion\\Formula.g:26:14: '-='
            {
            match("-="); 


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "MINUSEQUAL"

    // $ANTLR start "MULT"
    public final void mMULT() throws RecognitionException {
        try {
            int _type = MULT;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:27:6: ( '*' )
            // D:\\Work\\antlr\\conversion\\Formula.g:27:8: '*'
            {
            match('*'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "MULT"

    // $ANTLR start "MULTEEQUAL"
    public final void mMULTEEQUAL() throws RecognitionException {
        try {
            int _type = MULTEEQUAL;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:28:12: ( '*=' )
            // D:\\Work\\antlr\\conversion\\Formula.g:28:14: '*='
            {
            match("*="); 


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "MULTEEQUAL"

    // $ANTLR start "DIV"
    public final void mDIV() throws RecognitionException {
        try {
            int _type = DIV;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:29:5: ( '/' )
            // D:\\Work\\antlr\\conversion\\Formula.g:29:7: '/'
            {
            match('/'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "DIV"

    // $ANTLR start "DIVEQUAL"
    public final void mDIVEQUAL() throws RecognitionException {
        try {
            int _type = DIVEQUAL;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:30:10: ( '/=' )
            // D:\\Work\\antlr\\conversion\\Formula.g:30:12: '/='
            {
            match("/="); 


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "DIVEQUAL"

    // $ANTLR start "P_OPEN"
    public final void mP_OPEN() throws RecognitionException {
        try {
            int _type = P_OPEN;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:31:8: ( '(' )
            // D:\\Work\\antlr\\conversion\\Formula.g:31:10: '('
            {
            match('('); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "P_OPEN"

    // $ANTLR start "P_CLOSE"
    public final void mP_CLOSE() throws RecognitionException {
        try {
            int _type = P_CLOSE;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:32:9: ( ')' )
            // D:\\Work\\antlr\\conversion\\Formula.g:32:11: ')'
            {
            match(')'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "P_CLOSE"

    // $ANTLR start "ARG_SEP"
    public final void mARG_SEP() throws RecognitionException {
        try {
            int _type = ARG_SEP;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:33:9: ( ';' )
            // D:\\Work\\antlr\\conversion\\Formula.g:33:11: ';'
            {
            match(';'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "ARG_SEP"

    // $ANTLR start "ARG_SEP_WRONG"
    public final void mARG_SEP_WRONG() throws RecognitionException {
        try {
            int _type = ARG_SEP_WRONG;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:34:15: ( ',' )
            // D:\\Work\\antlr\\conversion\\Formula.g:34:17: ','
            {
            match(','); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "ARG_SEP_WRONG"

    // $ANTLR start "EQUAL"
    public final void mEQUAL() throws RecognitionException {
        try {
            int _type = EQUAL;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:35:7: ( '=' )
            // D:\\Work\\antlr\\conversion\\Formula.g:35:9: '='
            {
            match('='); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "EQUAL"

    // $ANTLR start "LESS"
    public final void mLESS() throws RecognitionException {
        try {
            int _type = LESS;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:36:6: ( '<' )
            // D:\\Work\\antlr\\conversion\\Formula.g:36:8: '<'
            {
            match('<'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "LESS"

    // $ANTLR start "LESSEQUAL"
    public final void mLESSEQUAL() throws RecognitionException {
        try {
            int _type = LESSEQUAL;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:37:11: ( '<=' )
            // D:\\Work\\antlr\\conversion\\Formula.g:37:13: '<='
            {
            match("<="); 


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "LESSEQUAL"

    // $ANTLR start "GREATER"
    public final void mGREATER() throws RecognitionException {
        try {
            int _type = GREATER;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:38:9: ( '>' )
            // D:\\Work\\antlr\\conversion\\Formula.g:38:11: '>'
            {
            match('>'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "GREATER"

    // $ANTLR start "GREATEREQUAL"
    public final void mGREATEREQUAL() throws RecognitionException {
        try {
            int _type = GREATEREQUAL;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:39:14: ( '>=' )
            // D:\\Work\\antlr\\conversion\\Formula.g:39:16: '>='
            {
            match(">="); 


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "GREATEREQUAL"

    // $ANTLR start "NOTEQUAL"
    public final void mNOTEQUAL() throws RecognitionException {
        try {
            int _type = NOTEQUAL;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:40:10: ( '<>' )
            // D:\\Work\\antlr\\conversion\\Formula.g:40:12: '<>'
            {
            match("<>"); 


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "NOTEQUAL"

    // $ANTLR start "NOTEQUAL2"
    public final void mNOTEQUAL2() throws RecognitionException {
        try {
            int _type = NOTEQUAL2;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:41:11: ( '!=' )
            // D:\\Work\\antlr\\conversion\\Formula.g:41:13: '!='
            {
            match("!="); 


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "NOTEQUAL2"

    // $ANTLR start "AMPERSAND"
    public final void mAMPERSAND() throws RecognitionException {
        try {
            int _type = AMPERSAND;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:42:11: ( '&&' )
            // D:\\Work\\antlr\\conversion\\Formula.g:42:13: '&&'
            {
            match("&&"); 


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "AMPERSAND"

    // $ANTLR start "OR"
    public final void mOR() throws RecognitionException {
        try {
            int _type = OR;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:43:4: ( '||' )
            // D:\\Work\\antlr\\conversion\\Formula.g:43:6: '||'
            {
            match("||"); 


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "OR"

    // $ANTLR start "POW"
    public final void mPOW() throws RecognitionException {
        try {
            int _type = POW;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:44:5: ( '^' )
            // D:\\Work\\antlr\\conversion\\Formula.g:44:7: '^'
            {
            match('^'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "POW"

    // $ANTLR start "MODE"
    public final void mMODE() throws RecognitionException {
        try {
            int _type = MODE;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:45:6: ( '%' )
            // D:\\Work\\antlr\\conversion\\Formula.g:45:8: '%'
            {
            match('%'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "MODE"

    // $ANTLR start "MODEQUAL"
    public final void mMODEQUAL() throws RecognitionException {
        try {
            int _type = MODEQUAL;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:46:10: ( '%=' )
            // D:\\Work\\antlr\\conversion\\Formula.g:46:12: '%='
            {
            match("%="); 


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "MODEQUAL"

    // $ANTLR start "ARRAY_FORMULAR_START"
    public final void mARRAY_FORMULAR_START() throws RecognitionException {
        try {
            int _type = ARRAY_FORMULAR_START;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:47:22: ( '{' )
            // D:\\Work\\antlr\\conversion\\Formula.g:47:24: '{'
            {
            match('{'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "ARRAY_FORMULAR_START"

    // $ANTLR start "ARRAY_FORMULAR_END"
    public final void mARRAY_FORMULAR_END() throws RecognitionException {
        try {
            int _type = ARRAY_FORMULAR_END;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:48:20: ( '}' )
            // D:\\Work\\antlr\\conversion\\Formula.g:48:22: '}'
            {
            match('}'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "ARRAY_FORMULAR_END"

    // $ANTLR start "T__56"
    public final void mT__56() throws RecognitionException {
        try {
            int _type = T__56;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:49:7: ( '|' )
            // D:\\Work\\antlr\\conversion\\Formula.g:49:9: '|'
            {
            match('|'); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "T__56"

    // $ANTLR start "NONZERO_NUMBER"
    public final void mNONZERO_NUMBER() throws RecognitionException {
        try {
            // D:\\Work\\antlr\\conversion\\Formula.g:342:25: ( ( '1' .. '9' )+ )
            // D:\\Work\\antlr\\conversion\\Formula.g:342:27: ( '1' .. '9' )+
            {
            // D:\\Work\\antlr\\conversion\\Formula.g:342:27: ( '1' .. '9' )+
            int cnt1=0;
            loop1:
            do {
                int alt1=2;
                int LA1_0 = input.LA(1);

                if ( ((LA1_0>='1' && LA1_0<='9')) ) {
                    alt1=1;
                }


                switch (alt1) {
            	case 1 :
            	    // D:\\Work\\antlr\\conversion\\Formula.g:342:28: '1' .. '9'
            	    {
            	    matchRange('1','9'); 

            	    }
            	    break;

            	default :
            	    if ( cnt1 >= 1 ) break loop1;
                        EarlyExitException eee =
                            new EarlyExitException(1, input);
                        throw eee;
                }
                cnt1++;
            } while (true);


            }

        }
        finally {
        }
    }
    // $ANTLR end "NONZERO_NUMBER"

    // $ANTLR start "INT"
    public final void mINT() throws RecognitionException {
        try {
            int _type = INT;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:343:5: ( ( DIGIT )+ )
            // D:\\Work\\antlr\\conversion\\Formula.g:343:7: ( DIGIT )+
            {
            // D:\\Work\\antlr\\conversion\\Formula.g:343:7: ( DIGIT )+
            int cnt2=0;
            loop2:
            do {
                int alt2=2;
                int LA2_0 = input.LA(1);

                if ( ((LA2_0>='0' && LA2_0<='9')) ) {
                    alt2=1;
                }


                switch (alt2) {
            	case 1 :
            	    // D:\\Work\\antlr\\conversion\\Formula.g:343:8: DIGIT
            	    {
            	    mDIGIT(); 

            	    }
            	    break;

            	default :
            	    if ( cnt2 >= 1 ) break loop2;
                        EarlyExitException eee =
                            new EarlyExitException(2, input);
                        throw eee;
                }
                cnt2++;
            } while (true);


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "INT"

    // $ANTLR start "NUMBER"
    public final void mNUMBER() throws RecognitionException {
        try {
            int _type = NUMBER;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:344:9: ( INT ( '.' INT )? ( ( 'e' | 'E' ) ( '-' | '+' )? INT )? )
            // D:\\Work\\antlr\\conversion\\Formula.g:344:11: INT ( '.' INT )? ( ( 'e' | 'E' ) ( '-' | '+' )? INT )?
            {
            mINT(); 
            // D:\\Work\\antlr\\conversion\\Formula.g:344:15: ( '.' INT )?
            int alt3=2;
            int LA3_0 = input.LA(1);

            if ( (LA3_0=='.') ) {
                alt3=1;
            }
            switch (alt3) {
                case 1 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:344:16: '.' INT
                    {
                    match('.'); 
                    mINT(); 

                    }
                    break;

            }

            // D:\\Work\\antlr\\conversion\\Formula.g:344:26: ( ( 'e' | 'E' ) ( '-' | '+' )? INT )?
            int alt5=2;
            int LA5_0 = input.LA(1);

            if ( (LA5_0=='E'||LA5_0=='e') ) {
                alt5=1;
            }
            switch (alt5) {
                case 1 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:344:27: ( 'e' | 'E' ) ( '-' | '+' )? INT
                    {
                    if ( input.LA(1)=='E'||input.LA(1)=='e' ) {
                        input.consume();

                    }
                    else {
                        MismatchedSetException mse = new MismatchedSetException(null,input);
                        recover(mse);
                        throw mse;}

                    // D:\\Work\\antlr\\conversion\\Formula.g:344:36: ( '-' | '+' )?
                    int alt4=2;
                    int LA4_0 = input.LA(1);

                    if ( (LA4_0=='+'||LA4_0=='-') ) {
                        alt4=1;
                    }
                    switch (alt4) {
                        case 1 :
                            // D:\\Work\\antlr\\conversion\\Formula.g:
                            {
                            if ( input.LA(1)=='+'||input.LA(1)=='-' ) {
                                input.consume();

                            }
                            else {
                                MismatchedSetException mse = new MismatchedSetException(null,input);
                                recover(mse);
                                throw mse;}


                            }
                            break;

                    }

                    mINT(); 

                    }
                    break;

            }


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "NUMBER"

    // $ANTLR start "PERCENT"
    public final void mPERCENT() throws RecognitionException {
        try {
            int _type = PERCENT;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:346:10: ( NUMBER ( '%' )+ )
            // D:\\Work\\antlr\\conversion\\Formula.g:346:12: NUMBER ( '%' )+
            {
            mNUMBER(); 
            // D:\\Work\\antlr\\conversion\\Formula.g:346:19: ( '%' )+
            int cnt6=0;
            loop6:
            do {
                int alt6=2;
                int LA6_0 = input.LA(1);

                if ( (LA6_0=='%') ) {
                    alt6=1;
                }


                switch (alt6) {
            	case 1 :
            	    // D:\\Work\\antlr\\conversion\\Formula.g:346:19: '%'
            	    {
            	    match('%'); 

            	    }
            	    break;

            	default :
            	    if ( cnt6 >= 1 ) break loop6;
                        EarlyExitException eee =
                            new EarlyExitException(6, input);
                        throw eee;
                }
                cnt6++;
            } while (true);


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "PERCENT"

    // $ANTLR start "SINGLEQUOT_STRING"
    public final void mSINGLEQUOT_STRING() throws RecognitionException {
        try {
            int _type = SINGLEQUOT_STRING;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:347:19: ( ( '$' )? ( '\\'' (~ ( '\\'' | LT ) )* '\\'' )+ )
            // D:\\Work\\antlr\\conversion\\Formula.g:347:21: ( '$' )? ( '\\'' (~ ( '\\'' | LT ) )* '\\'' )+
            {
            // D:\\Work\\antlr\\conversion\\Formula.g:347:21: ( '$' )?
            int alt7=2;
            int LA7_0 = input.LA(1);

            if ( (LA7_0=='$') ) {
                alt7=1;
            }
            switch (alt7) {
                case 1 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:347:22: '$'
                    {
                    match('$'); 

                    }
                    break;

            }

            // D:\\Work\\antlr\\conversion\\Formula.g:347:27: ( '\\'' (~ ( '\\'' | LT ) )* '\\'' )+
            int cnt9=0;
            loop9:
            do {
                int alt9=2;
                int LA9_0 = input.LA(1);

                if ( (LA9_0=='\'') ) {
                    alt9=1;
                }


                switch (alt9) {
            	case 1 :
            	    // D:\\Work\\antlr\\conversion\\Formula.g:347:28: '\\'' (~ ( '\\'' | LT ) )* '\\''
            	    {
            	    match('\''); 
            	    // D:\\Work\\antlr\\conversion\\Formula.g:347:33: (~ ( '\\'' | LT ) )*
            	    loop8:
            	    do {
            	        int alt8=2;
            	        int LA8_0 = input.LA(1);

            	        if ( ((LA8_0>='\u0000' && LA8_0<='\f')||(LA8_0>='\u000E' && LA8_0<='&')||(LA8_0>='(' && LA8_0<='\u2027')||(LA8_0>='\u202A' && LA8_0<='\uFFFF')) ) {
            	            alt8=1;
            	        }


            	        switch (alt8) {
            	    	case 1 :
            	    	    // D:\\Work\\antlr\\conversion\\Formula.g:347:34: ~ ( '\\'' | LT )
            	    	    {
            	    	    if ( (input.LA(1)>='\u0000' && input.LA(1)<='\f')||(input.LA(1)>='\u000E' && input.LA(1)<='&')||(input.LA(1)>='(' && input.LA(1)<='\u2027')||(input.LA(1)>='\u202A' && input.LA(1)<='\uFFFF') ) {
            	    	        input.consume();

            	    	    }
            	    	    else {
            	    	        MismatchedSetException mse = new MismatchedSetException(null,input);
            	    	        recover(mse);
            	    	        throw mse;}


            	    	    }
            	    	    break;

            	    	default :
            	    	    break loop8;
            	        }
            	    } while (true);

            	    match('\''); 

            	    }
            	    break;

            	default :
            	    if ( cnt9 >= 1 ) break loop9;
                        EarlyExitException eee =
                            new EarlyExitException(9, input);
                        throw eee;
                }
                cnt9++;
            } while (true);


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "SINGLEQUOT_STRING"

    // $ANTLR start "DOUBLEQUOT_STRING"
    public final void mDOUBLEQUOT_STRING() throws RecognitionException {
        try {
            int _type = DOUBLEQUOT_STRING;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:348:19: ( ( '\"' (~ ( '\"' | LT ) )* '\"' )+ )
            // D:\\Work\\antlr\\conversion\\Formula.g:348:21: ( '\"' (~ ( '\"' | LT ) )* '\"' )+
            {
            // D:\\Work\\antlr\\conversion\\Formula.g:348:21: ( '\"' (~ ( '\"' | LT ) )* '\"' )+
            int cnt11=0;
            loop11:
            do {
                int alt11=2;
                int LA11_0 = input.LA(1);

                if ( (LA11_0=='\"') ) {
                    alt11=1;
                }


                switch (alt11) {
            	case 1 :
            	    // D:\\Work\\antlr\\conversion\\Formula.g:348:22: '\"' (~ ( '\"' | LT ) )* '\"'
            	    {
            	    match('\"'); 
            	    // D:\\Work\\antlr\\conversion\\Formula.g:348:26: (~ ( '\"' | LT ) )*
            	    loop10:
            	    do {
            	        int alt10=2;
            	        int LA10_0 = input.LA(1);

            	        if ( ((LA10_0>='\u0000' && LA10_0<='\f')||(LA10_0>='\u000E' && LA10_0<='!')||(LA10_0>='#' && LA10_0<='\u2027')||(LA10_0>='\u202A' && LA10_0<='\uFFFF')) ) {
            	            alt10=1;
            	        }


            	        switch (alt10) {
            	    	case 1 :
            	    	    // D:\\Work\\antlr\\conversion\\Formula.g:348:27: ~ ( '\"' | LT )
            	    	    {
            	    	    if ( (input.LA(1)>='\u0000' && input.LA(1)<='\f')||(input.LA(1)>='\u000E' && input.LA(1)<='!')||(input.LA(1)>='#' && input.LA(1)<='\u2027')||(input.LA(1)>='\u202A' && input.LA(1)<='\uFFFF') ) {
            	    	        input.consume();

            	    	    }
            	    	    else {
            	    	        MismatchedSetException mse = new MismatchedSetException(null,input);
            	    	        recover(mse);
            	    	        throw mse;}


            	    	    }
            	    	    break;

            	    	default :
            	    	    break loop10;
            	        }
            	    } while (true);

            	    match('\"'); 

            	    }
            	    break;

            	default :
            	    if ( cnt11 >= 1 ) break loop11;
                        EarlyExitException eee =
                            new EarlyExitException(11, input);
                        throw eee;
                }
                cnt11++;
            } while (true);


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "DOUBLEQUOT_STRING"

    // $ANTLR start "ERRORNAME"
    public final void mERRORNAME() throws RecognitionException {
        try {
            int _type = ERRORNAME;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:352:2: ( '#' ( ( ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!' ) | 'N/A' | 'NAME?' ) )
            // D:\\Work\\antlr\\conversion\\Formula.g:352:4: '#' ( ( ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!' ) | 'N/A' | 'NAME?' )
            {
            match('#'); 
            // D:\\Work\\antlr\\conversion\\Formula.g:352:8: ( ( ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!' ) | 'N/A' | 'NAME?' )
            int alt13=3;
            int LA13_0 = input.LA(1);

            if ( (LA13_0=='D'||LA13_0=='R'||LA13_0=='V') ) {
                alt13=1;
            }
            else if ( (LA13_0=='N') ) {
                switch ( input.LA(2) ) {
                case 'U':
                    {
                    alt13=1;
                    }
                    break;
                case '/':
                    {
                    alt13=2;
                    }
                    break;
                case 'A':
                    {
                    alt13=3;
                    }
                    break;
                default:
                    NoViableAltException nvae =
                        new NoViableAltException("", 13, 2, input);

                    throw nvae;
                }

            }
            else {
                NoViableAltException nvae =
                    new NoViableAltException("", 13, 0, input);

                throw nvae;
            }
            switch (alt13) {
                case 1 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:352:9: ( ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!' )
                    {
                    // D:\\Work\\antlr\\conversion\\Formula.g:352:9: ( ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!' )
                    // D:\\Work\\antlr\\conversion\\Formula.g:352:10: ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!'
                    {
                    // D:\\Work\\antlr\\conversion\\Formula.g:352:10: ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' )
                    int alt12=5;
                    switch ( input.LA(1) ) {
                    case 'V':
                        {
                        alt12=1;
                        }
                        break;
                    case 'N':
                        {
                        int LA12_2 = input.LA(2);

                        if ( (LA12_2=='U') ) {
                            int LA12_5 = input.LA(3);

                            if ( (LA12_5=='M') ) {
                                alt12=2;
                            }
                            else if ( (LA12_5=='L') ) {
                                alt12=5;
                            }
                            else {
                                NoViableAltException nvae =
                                    new NoViableAltException("", 12, 5, input);

                                throw nvae;
                            }
                        }
                        else {
                            NoViableAltException nvae =
                                new NoViableAltException("", 12, 2, input);

                            throw nvae;
                        }
                        }
                        break;
                    case 'R':
                        {
                        alt12=3;
                        }
                        break;
                    case 'D':
                        {
                        alt12=4;
                        }
                        break;
                    default:
                        NoViableAltException nvae =
                            new NoViableAltException("", 12, 0, input);

                        throw nvae;
                    }

                    switch (alt12) {
                        case 1 :
                            // D:\\Work\\antlr\\conversion\\Formula.g:352:11: 'VALUE'
                            {
                            match("VALUE"); 


                            }
                            break;
                        case 2 :
                            // D:\\Work\\antlr\\conversion\\Formula.g:352:21: 'NUM'
                            {
                            match("NUM"); 


                            }
                            break;
                        case 3 :
                            // D:\\Work\\antlr\\conversion\\Formula.g:352:29: 'REF'
                            {
                            match("REF"); 


                            }
                            break;
                        case 4 :
                            // D:\\Work\\antlr\\conversion\\Formula.g:352:37: 'DIV/0'
                            {
                            match("DIV/0"); 


                            }
                            break;
                        case 5 :
                            // D:\\Work\\antlr\\conversion\\Formula.g:352:47: 'NULL'
                            {
                            match("NULL"); 


                            }
                            break;

                    }

                    match('!'); 

                    }


                    }
                    break;
                case 2 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:352:63: 'N/A'
                    {
                    match("N/A"); 


                    }
                    break;
                case 3 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:352:71: 'NAME?'
                    {
                    match("NAME?"); 


                    }
                    break;

            }


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "ERRORNAME"

    // $ANTLR start "NAME"
    public final void mNAME() throws RecognitionException {
        try {
            int _type = NAME;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:353:6: ( ( '0' .. '9' | 'a' .. 'z' | 'A' .. 'Z' | '?' | '_' | '$' | '\\'' | '.' | '\\\\' )+ ( '#REF!' )? )
            // D:\\Work\\antlr\\conversion\\Formula.g:353:8: ( '0' .. '9' | 'a' .. 'z' | 'A' .. 'Z' | '?' | '_' | '$' | '\\'' | '.' | '\\\\' )+ ( '#REF!' )?
            {
            // D:\\Work\\antlr\\conversion\\Formula.g:353:8: ( '0' .. '9' | 'a' .. 'z' | 'A' .. 'Z' | '?' | '_' | '$' | '\\'' | '.' | '\\\\' )+
            int cnt14=0;
            loop14:
            do {
                int alt14=2;
                int LA14_0 = input.LA(1);

                if ( (LA14_0=='$'||LA14_0=='\''||LA14_0=='.'||(LA14_0>='0' && LA14_0<='9')||LA14_0=='?'||(LA14_0>='A' && LA14_0<='Z')||LA14_0=='\\'||LA14_0=='_'||(LA14_0>='a' && LA14_0<='z')) ) {
                    alt14=1;
                }


                switch (alt14) {
            	case 1 :
            	    // D:\\Work\\antlr\\conversion\\Formula.g:
            	    {
            	    if ( input.LA(1)=='$'||input.LA(1)=='\''||input.LA(1)=='.'||(input.LA(1)>='0' && input.LA(1)<='9')||input.LA(1)=='?'||(input.LA(1)>='A' && input.LA(1)<='Z')||input.LA(1)=='\\'||input.LA(1)=='_'||(input.LA(1)>='a' && input.LA(1)<='z') ) {
            	        input.consume();

            	    }
            	    else {
            	        MismatchedSetException mse = new MismatchedSetException(null,input);
            	        recover(mse);
            	        throw mse;}


            	    }
            	    break;

            	default :
            	    if ( cnt14 >= 1 ) break loop14;
                        EarlyExitException eee =
                            new EarlyExitException(14, input);
                        throw eee;
                }
                cnt14++;
            } while (true);

            // D:\\Work\\antlr\\conversion\\Formula.g:353:64: ( '#REF!' )?
            int alt15=2;
            int LA15_0 = input.LA(1);

            if ( (LA15_0=='#') ) {
                alt15=1;
            }
            switch (alt15) {
                case 1 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:353:65: '#REF!'
                    {
                    match("#REF!"); 


                    }
                    break;

            }


            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "NAME"

    // $ANTLR start "NAME1"
    public final void mNAME1() throws RecognitionException {
        try {
            int _type = NAME1;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:354:7: ( (~ ( '[' | ']' | '\\'' | ':' | '?' | '/' | '\\\\' | '*' | '!' | ' ' | '~' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | ')' | '|' | '{' | '}' | '-' | '+' | '=' | ';' | '<' | '>' | '.' | ',' | '`' | '\\\"' | '\\t' | '\\r' | '\\n' | '\\u000C' ) )+ )
            // D:\\Work\\antlr\\conversion\\Formula.g:354:8: (~ ( '[' | ']' | '\\'' | ':' | '?' | '/' | '\\\\' | '*' | '!' | ' ' | '~' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | ')' | '|' | '{' | '}' | '-' | '+' | '=' | ';' | '<' | '>' | '.' | ',' | '`' | '\\\"' | '\\t' | '\\r' | '\\n' | '\\u000C' ) )+
            {
            // D:\\Work\\antlr\\conversion\\Formula.g:354:8: (~ ( '[' | ']' | '\\'' | ':' | '?' | '/' | '\\\\' | '*' | '!' | ' ' | '~' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | ')' | '|' | '{' | '}' | '-' | '+' | '=' | ';' | '<' | '>' | '.' | ',' | '`' | '\\\"' | '\\t' | '\\r' | '\\n' | '\\u000C' ) )+
            int cnt16=0;
            loop16:
            do {
                int alt16=2;
                int LA16_0 = input.LA(1);

                if ( ((LA16_0>='\u0000' && LA16_0<='\b')||LA16_0=='\u000B'||(LA16_0>='\u000E' && LA16_0<='\u001F')||(LA16_0>='0' && LA16_0<='9')||(LA16_0>='A' && LA16_0<='Z')||LA16_0=='_'||(LA16_0>='a' && LA16_0<='z')||(LA16_0>='\u007F' && LA16_0<='\uFFFF')) ) {
                    alt16=1;
                }


                switch (alt16) {
            	case 1 :
            	    // D:\\Work\\antlr\\conversion\\Formula.g:354:8: ~ ( '[' | ']' | '\\'' | ':' | '?' | '/' | '\\\\' | '*' | '!' | ' ' | '~' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | ')' | '|' | '{' | '}' | '-' | '+' | '=' | ';' | '<' | '>' | '.' | ',' | '`' | '\\\"' | '\\t' | '\\r' | '\\n' | '\\u000C' )
            	    {
            	    if ( (input.LA(1)>='\u0000' && input.LA(1)<='\b')||input.LA(1)=='\u000B'||(input.LA(1)>='\u000E' && input.LA(1)<='\u001F')||(input.LA(1)>='0' && input.LA(1)<='9')||(input.LA(1)>='A' && input.LA(1)<='Z')||input.LA(1)=='_'||(input.LA(1)>='a' && input.LA(1)<='z')||(input.LA(1)>='\u007F' && input.LA(1)<='\uFFFF') ) {
            	        input.consume();

            	    }
            	    else {
            	        MismatchedSetException mse = new MismatchedSetException(null,input);
            	        recover(mse);
            	        throw mse;}


            	    }
            	    break;

            	default :
            	    if ( cnt16 >= 1 ) break loop16;
                        EarlyExitException eee =
                            new EarlyExitException(16, input);
                        throw eee;
                }
                cnt16++;
            } while (true);

             this._cellHasUnicode = true; 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "NAME1"

    // $ANTLR start "COMMAOrSPACE"
    public final void mCOMMAOrSPACE() throws RecognitionException {
        try {
            // D:\\Work\\antlr\\conversion\\Formula.g:360:23: ( ',' ( ' ' )? )
            // D:\\Work\\antlr\\conversion\\Formula.g:360:25: ',' ( ' ' )?
            {
            match(','); 
            // D:\\Work\\antlr\\conversion\\Formula.g:360:29: ( ' ' )?
            int alt17=2;
            int LA17_0 = input.LA(1);

            if ( (LA17_0==' ') ) {
                alt17=1;
            }
            switch (alt17) {
                case 1 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:360:30: ' '
                    {
                    match(' '); 

                    }
                    break;

            }


            }

        }
        finally {
        }
    }
    // $ANTLR end "COMMAOrSPACE"

    // $ANTLR start "KEYCHARACTER"
    public final void mKEYCHARACTER() throws RecognitionException {
        try {
            // D:\\Work\\antlr\\conversion\\Formula.g:361:23: ( '\\'' | '#' | '[' | ']' | '@' )
            // D:\\Work\\antlr\\conversion\\Formula.g:
            {
            if ( input.LA(1)=='#'||input.LA(1)=='\''||input.LA(1)=='@'||input.LA(1)=='['||input.LA(1)==']' ) {
                input.consume();

            }
            else {
                MismatchedSetException mse = new MismatchedSetException(null,input);
                recover(mse);
                throw mse;}


            }

        }
        finally {
        }
    }
    // $ANTLR end "KEYCHARACTER"

    // $ANTLR start "ODF_COLUMN"
    public final void mODF_COLUMN() throws RecognitionException {
        try {
            // D:\\Work\\antlr\\conversion\\Formula.g:362:21: ( '[' (~ ( KEYCHARACTER ) | ( '\\'' KEYCHARACTER ) )+ ']' )
            // D:\\Work\\antlr\\conversion\\Formula.g:362:23: '[' (~ ( KEYCHARACTER ) | ( '\\'' KEYCHARACTER ) )+ ']'
            {
            match('['); 
            // D:\\Work\\antlr\\conversion\\Formula.g:362:27: (~ ( KEYCHARACTER ) | ( '\\'' KEYCHARACTER ) )+
            int cnt18=0;
            loop18:
            do {
                int alt18=3;
                int LA18_0 = input.LA(1);

                if ( ((LA18_0>='\u0000' && LA18_0<='\"')||(LA18_0>='$' && LA18_0<='&')||(LA18_0>='(' && LA18_0<='?')||(LA18_0>='A' && LA18_0<='Z')||LA18_0=='\\'||(LA18_0>='^' && LA18_0<='\uFFFF')) ) {
                    alt18=1;
                }
                else if ( (LA18_0=='\'') ) {
                    alt18=2;
                }


                switch (alt18) {
            	case 1 :
            	    // D:\\Work\\antlr\\conversion\\Formula.g:362:29: ~ ( KEYCHARACTER )
            	    {
            	    if ( (input.LA(1)>='\u0000' && input.LA(1)<='\"')||(input.LA(1)>='$' && input.LA(1)<='&')||(input.LA(1)>='(' && input.LA(1)<='?')||(input.LA(1)>='A' && input.LA(1)<='Z')||input.LA(1)=='\\'||(input.LA(1)>='^' && input.LA(1)<='\uFFFF') ) {
            	        input.consume();

            	    }
            	    else {
            	        MismatchedSetException mse = new MismatchedSetException(null,input);
            	        recover(mse);
            	        throw mse;}


            	    }
            	    break;
            	case 2 :
            	    // D:\\Work\\antlr\\conversion\\Formula.g:362:47: ( '\\'' KEYCHARACTER )
            	    {
            	    // D:\\Work\\antlr\\conversion\\Formula.g:362:47: ( '\\'' KEYCHARACTER )
            	    // D:\\Work\\antlr\\conversion\\Formula.g:362:48: '\\'' KEYCHARACTER
            	    {
            	    match('\''); 
            	    mKEYCHARACTER(); 

            	    }


            	    }
            	    break;

            	default :
            	    if ( cnt18 >= 1 ) break loop18;
                        EarlyExitException eee =
                            new EarlyExitException(18, input);
                        throw eee;
                }
                cnt18++;
            } while (true);

            match(']'); 

            }

        }
        finally {
        }
    }
    // $ANTLR end "ODF_COLUMN"

    // $ANTLR start "ODF_COL_RANGE"
    public final void mODF_COL_RANGE() throws RecognitionException {
        try {
            // D:\\Work\\antlr\\conversion\\Formula.g:363:24: ( ODF_COLUMN ( ':' ODF_COLUMN )? )
            // D:\\Work\\antlr\\conversion\\Formula.g:363:26: ODF_COLUMN ( ':' ODF_COLUMN )?
            {
            mODF_COLUMN(); 
            // D:\\Work\\antlr\\conversion\\Formula.g:363:37: ( ':' ODF_COLUMN )?
            int alt19=2;
            int LA19_0 = input.LA(1);

            if ( (LA19_0==':') ) {
                alt19=1;
            }
            switch (alt19) {
                case 1 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:363:38: ':' ODF_COLUMN
                    {
                    match(':'); 
                    mODF_COLUMN(); 

                    }
                    break;

            }


            }

        }
        finally {
        }
    }
    // $ANTLR end "ODF_COL_RANGE"

    // $ANTLR start "ODF_PREWORD"
    public final void mODF_PREWORD() throws RecognitionException {
        try {
            // D:\\Work\\antlr\\conversion\\Formula.g:364:23: ( '[' ( '#This Row' | '#All' | '#Headers' | '#Totals' | '#Data' ) ']' )
            // D:\\Work\\antlr\\conversion\\Formula.g:364:25: '[' ( '#This Row' | '#All' | '#Headers' | '#Totals' | '#Data' ) ']'
            {
            match('['); 
            // D:\\Work\\antlr\\conversion\\Formula.g:364:29: ( '#This Row' | '#All' | '#Headers' | '#Totals' | '#Data' )
            int alt20=5;
            int LA20_0 = input.LA(1);

            if ( (LA20_0=='#') ) {
                switch ( input.LA(2) ) {
                case 'T':
                    {
                    int LA20_2 = input.LA(3);

                    if ( (LA20_2=='h') ) {
                        alt20=1;
                    }
                    else if ( (LA20_2=='o') ) {
                        alt20=4;
                    }
                    else {
                        NoViableAltException nvae =
                            new NoViableAltException("", 20, 2, input);

                        throw nvae;
                    }
                    }
                    break;
                case 'A':
                    {
                    alt20=2;
                    }
                    break;
                case 'H':
                    {
                    alt20=3;
                    }
                    break;
                case 'D':
                    {
                    alt20=5;
                    }
                    break;
                default:
                    NoViableAltException nvae =
                        new NoViableAltException("", 20, 1, input);

                    throw nvae;
                }

            }
            else {
                NoViableAltException nvae =
                    new NoViableAltException("", 20, 0, input);

                throw nvae;
            }
            switch (alt20) {
                case 1 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:364:31: '#This Row'
                    {
                    match("#This Row"); 


                    }
                    break;
                case 2 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:364:45: '#All'
                    {
                    match("#All"); 


                    }
                    break;
                case 3 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:364:54: '#Headers'
                    {
                    match("#Headers"); 


                    }
                    break;
                case 4 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:364:67: '#Totals'
                    {
                    match("#Totals"); 


                    }
                    break;
                case 5 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:364:79: '#Data'
                    {
                    match("#Data"); 


                    }
                    break;

            }

            match(']'); 

            }

        }
        finally {
        }
    }
    // $ANTLR end "ODF_PREWORD"

    // $ANTLR start "ODF_PRELIST"
    public final void mODF_PRELIST() throws RecognitionException {
        try {
            // D:\\Work\\antlr\\conversion\\Formula.g:365:22: ( ( '[#Headers]' COMMAOrSPACE '[#Data]' ) | ( '[#Data]' COMMAOrSPACE '[#Totals]' ) | ODF_PREWORD )
            int alt21=3;
            alt21 = dfa21.predict(input);
            switch (alt21) {
                case 1 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:365:24: ( '[#Headers]' COMMAOrSPACE '[#Data]' )
                    {
                    // D:\\Work\\antlr\\conversion\\Formula.g:365:24: ( '[#Headers]' COMMAOrSPACE '[#Data]' )
                    // D:\\Work\\antlr\\conversion\\Formula.g:365:25: '[#Headers]' COMMAOrSPACE '[#Data]'
                    {
                    match("[#Headers]"); 

                    mCOMMAOrSPACE(); 
                    match("[#Data]"); 


                    }


                    }
                    break;
                case 2 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:365:64: ( '[#Data]' COMMAOrSPACE '[#Totals]' )
                    {
                    // D:\\Work\\antlr\\conversion\\Formula.g:365:64: ( '[#Data]' COMMAOrSPACE '[#Totals]' )
                    // D:\\Work\\antlr\\conversion\\Formula.g:365:65: '[#Data]' COMMAOrSPACE '[#Totals]'
                    {
                    match("[#Data]"); 

                    mCOMMAOrSPACE(); 
                    match("[#Totals]"); 


                    }


                    }
                    break;
                case 3 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:365:103: ODF_PREWORD
                    {
                    mODF_PREWORD(); 

                    }
                    break;

            }
        }
        finally {
        }
    }
    // $ANTLR end "ODF_PRELIST"

    // $ANTLR start "ODF_TABLE"
    public final void mODF_TABLE() throws RecognitionException {
        try {
            int _type = ODF_TABLE;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:366:12: ( ( '[' ( ' ' )? ( ODF_PRELIST ( COMMAOrSPACE ODF_COL_RANGE )? | ODF_COL_RANGE ) ( ' ' )? ']' | ODF_PREWORD | ODF_COLUMN ) )
            // D:\\Work\\antlr\\conversion\\Formula.g:366:20: ( '[' ( ' ' )? ( ODF_PRELIST ( COMMAOrSPACE ODF_COL_RANGE )? | ODF_COL_RANGE ) ( ' ' )? ']' | ODF_PREWORD | ODF_COLUMN )
            {
            // D:\\Work\\antlr\\conversion\\Formula.g:366:20: ( '[' ( ' ' )? ( ODF_PRELIST ( COMMAOrSPACE ODF_COL_RANGE )? | ODF_COL_RANGE ) ( ' ' )? ']' | ODF_PREWORD | ODF_COLUMN )
            int alt26=3;
            int LA26_0 = input.LA(1);

            if ( (LA26_0=='[') ) {
                int LA26_1 = input.LA(2);

                if ( (LA26_1=='#') ) {
                    alt26=2;
                }
                else if ( (LA26_1==' ') ) {
                    int LA26_3 = input.LA(3);

                    if ( (LA26_3=='[') ) {
                        alt26=1;
                    }
                    else if ( ((LA26_3>='\u0000' && LA26_3<='\"')||(LA26_3>='$' && LA26_3<='?')||(LA26_3>='A' && LA26_3<='Z')||(LA26_3>='\\' && LA26_3<='\uFFFF')) ) {
                        alt26=3;
                    }
                    else {
                        NoViableAltException nvae =
                            new NoViableAltException("", 26, 3, input);

                        throw nvae;
                    }
                }
                else if ( (LA26_1=='[') ) {
                    alt26=1;
                }
                else if ( ((LA26_1>='\u0000' && LA26_1<='\u001F')||(LA26_1>='!' && LA26_1<='\"')||(LA26_1>='$' && LA26_1<='?')||(LA26_1>='A' && LA26_1<='Z')||LA26_1=='\\'||(LA26_1>='^' && LA26_1<='\uFFFF')) ) {
                    alt26=3;
                }
                else {
                    NoViableAltException nvae =
                        new NoViableAltException("", 26, 1, input);

                    throw nvae;
                }
            }
            else {
                NoViableAltException nvae =
                    new NoViableAltException("", 26, 0, input);

                throw nvae;
            }
            switch (alt26) {
                case 1 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:366:22: '[' ( ' ' )? ( ODF_PRELIST ( COMMAOrSPACE ODF_COL_RANGE )? | ODF_COL_RANGE ) ( ' ' )? ']'
                    {
                    match('['); 
                    // D:\\Work\\antlr\\conversion\\Formula.g:366:26: ( ' ' )?
                    int alt22=2;
                    int LA22_0 = input.LA(1);

                    if ( (LA22_0==' ') ) {
                        alt22=1;
                    }
                    switch (alt22) {
                        case 1 :
                            // D:\\Work\\antlr\\conversion\\Formula.g:366:27: ' '
                            {
                            match(' '); 

                            }
                            break;

                    }

                    // D:\\Work\\antlr\\conversion\\Formula.g:366:33: ( ODF_PRELIST ( COMMAOrSPACE ODF_COL_RANGE )? | ODF_COL_RANGE )
                    int alt24=2;
                    int LA24_0 = input.LA(1);

                    if ( (LA24_0=='[') ) {
                        int LA24_1 = input.LA(2);

                        if ( (LA24_1=='#') ) {
                            alt24=1;
                        }
                        else if ( ((LA24_1>='\u0000' && LA24_1<='\"')||(LA24_1>='$' && LA24_1<='?')||(LA24_1>='A' && LA24_1<='Z')||LA24_1=='\\'||(LA24_1>='^' && LA24_1<='\uFFFF')) ) {
                            alt24=2;
                        }
                        else {
                            NoViableAltException nvae =
                                new NoViableAltException("", 24, 1, input);

                            throw nvae;
                        }
                    }
                    else {
                        NoViableAltException nvae =
                            new NoViableAltException("", 24, 0, input);

                        throw nvae;
                    }
                    switch (alt24) {
                        case 1 :
                            // D:\\Work\\antlr\\conversion\\Formula.g:366:35: ODF_PRELIST ( COMMAOrSPACE ODF_COL_RANGE )?
                            {
                            mODF_PRELIST(); 
                            // D:\\Work\\antlr\\conversion\\Formula.g:366:47: ( COMMAOrSPACE ODF_COL_RANGE )?
                            int alt23=2;
                            int LA23_0 = input.LA(1);

                            if ( (LA23_0==',') ) {
                                alt23=1;
                            }
                            switch (alt23) {
                                case 1 :
                                    // D:\\Work\\antlr\\conversion\\Formula.g:366:48: COMMAOrSPACE ODF_COL_RANGE
                                    {
                                    mCOMMAOrSPACE(); 
                                    mODF_COL_RANGE(); 

                                    }
                                    break;

                            }


                            }
                            break;
                        case 2 :
                            // D:\\Work\\antlr\\conversion\\Formula.g:366:79: ODF_COL_RANGE
                            {
                            mODF_COL_RANGE(); 

                            }
                            break;

                    }

                    // D:\\Work\\antlr\\conversion\\Formula.g:366:95: ( ' ' )?
                    int alt25=2;
                    int LA25_0 = input.LA(1);

                    if ( (LA25_0==' ') ) {
                        alt25=1;
                    }
                    switch (alt25) {
                        case 1 :
                            // D:\\Work\\antlr\\conversion\\Formula.g:366:96: ' '
                            {
                            match(' '); 

                            }
                            break;

                    }

                    match(']'); 

                    }
                    break;
                case 2 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:366:108: ODF_PREWORD
                    {
                    mODF_PREWORD(); 

                    }
                    break;
                case 3 :
                    // D:\\Work\\antlr\\conversion\\Formula.g:366:122: ODF_COLUMN
                    {
                    mODF_COLUMN(); 

                    }
                    break;

            }

             this._cellHasUnicode = true; 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "ODF_TABLE"

    // $ANTLR start "FUNC"
    public final void mFUNC() throws RecognitionException {
        try {
            int _type = FUNC;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:371:5: ( ( '0' .. '9' | 'a' .. 'z' | 'A' .. 'Z' | '_' )+ '(' )
            // D:\\Work\\antlr\\conversion\\Formula.g:371:7: ( '0' .. '9' | 'a' .. 'z' | 'A' .. 'Z' | '_' )+ '('
            {
            // D:\\Work\\antlr\\conversion\\Formula.g:371:7: ( '0' .. '9' | 'a' .. 'z' | 'A' .. 'Z' | '_' )+
            int cnt27=0;
            loop27:
            do {
                int alt27=2;
                int LA27_0 = input.LA(1);

                if ( ((LA27_0>='0' && LA27_0<='9')||(LA27_0>='A' && LA27_0<='Z')||LA27_0=='_'||(LA27_0>='a' && LA27_0<='z')) ) {
                    alt27=1;
                }


                switch (alt27) {
            	case 1 :
            	    // D:\\Work\\antlr\\conversion\\Formula.g:
            	    {
            	    if ( (input.LA(1)>='0' && input.LA(1)<='9')||(input.LA(1)>='A' && input.LA(1)<='Z')||input.LA(1)=='_'||(input.LA(1)>='a' && input.LA(1)<='z') ) {
            	        input.consume();

            	    }
            	    else {
            	        MismatchedSetException mse = new MismatchedSetException(null,input);
            	        recover(mse);
            	        throw mse;}


            	    }
            	    break;

            	default :
            	    if ( cnt27 >= 1 ) break loop27;
                        EarlyExitException eee =
                            new EarlyExitException(27, input);
                        throw eee;
                }
                cnt27++;
            } while (true);

            match('('); 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "FUNC"

    // $ANTLR start "WHITESPACE1"
    public final void mWHITESPACE1() throws RecognitionException {
        try {
            int _type = WHITESPACE1;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:373:13: ( ( ' ' )+ )
            // D:\\Work\\antlr\\conversion\\Formula.g:373:15: ( ' ' )+
            {
            // D:\\Work\\antlr\\conversion\\Formula.g:373:15: ( ' ' )+
            int cnt28=0;
            loop28:
            do {
                int alt28=2;
                int LA28_0 = input.LA(1);

                if ( (LA28_0==' ') ) {
                    alt28=1;
                }


                switch (alt28) {
            	case 1 :
            	    // D:\\Work\\antlr\\conversion\\Formula.g:373:15: ' '
            	    {
            	    match(' '); 

            	    }
            	    break;

            	default :
            	    if ( cnt28 >= 1 ) break loop28;
                        EarlyExitException eee =
                            new EarlyExitException(28, input);
                        throw eee;
                }
                cnt28++;
            } while (true);

             _channel = HIDDEN; 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "WHITESPACE1"

    // $ANTLR start "WHITESPACE"
    public final void mWHITESPACE() throws RecognitionException {
        try {
            int _type = WHITESPACE;
            int _channel = DEFAULT_TOKEN_CHANNEL;
            // D:\\Work\\antlr\\conversion\\Formula.g:374:12: ( ( '\\t' | ' ' | '\\r' | '\\n' | '\\u000C' )+ )
            // D:\\Work\\antlr\\conversion\\Formula.g:374:14: ( '\\t' | ' ' | '\\r' | '\\n' | '\\u000C' )+
            {
            // D:\\Work\\antlr\\conversion\\Formula.g:374:14: ( '\\t' | ' ' | '\\r' | '\\n' | '\\u000C' )+
            int cnt29=0;
            loop29:
            do {
                int alt29=2;
                int LA29_0 = input.LA(1);

                if ( ((LA29_0>='\t' && LA29_0<='\n')||(LA29_0>='\f' && LA29_0<='\r')||LA29_0==' ') ) {
                    alt29=1;
                }


                switch (alt29) {
            	case 1 :
            	    // D:\\Work\\antlr\\conversion\\Formula.g:
            	    {
            	    if ( (input.LA(1)>='\t' && input.LA(1)<='\n')||(input.LA(1)>='\f' && input.LA(1)<='\r')||input.LA(1)==' ' ) {
            	        input.consume();

            	    }
            	    else {
            	        MismatchedSetException mse = new MismatchedSetException(null,input);
            	        recover(mse);
            	        throw mse;}


            	    }
            	    break;

            	default :
            	    if ( cnt29 >= 1 ) break loop29;
                        EarlyExitException eee =
                            new EarlyExitException(29, input);
                        throw eee;
                }
                cnt29++;
            } while (true);

             _channel = HIDDEN; 

            }

            state.type = _type;
            state.channel = _channel;
        }
        finally {
        }
    }
    // $ANTLR end "WHITESPACE"

    // $ANTLR start "SPACE"
    public final void mSPACE() throws RecognitionException {
        try {
            // D:\\Work\\antlr\\conversion\\Formula.g:375:16: ( '\\t' | ' ' | '\\r' | '\\n' | '\\u000C' )
            // D:\\Work\\antlr\\conversion\\Formula.g:
            {
            if ( (input.LA(1)>='\t' && input.LA(1)<='\n')||(input.LA(1)>='\f' && input.LA(1)<='\r')||input.LA(1)==' ' ) {
                input.consume();

            }
            else {
                MismatchedSetException mse = new MismatchedSetException(null,input);
                recover(mse);
                throw mse;}


            }

        }
        finally {
        }
    }
    // $ANTLR end "SPACE"

    // $ANTLR start "LT"
    public final void mLT() throws RecognitionException {
        try {
            // D:\\Work\\antlr\\conversion\\Formula.g:377:3: ( '\\r' | '\\u2028' | '\\u2029' )
            // D:\\Work\\antlr\\conversion\\Formula.g:
            {
            if ( input.LA(1)=='\r'||(input.LA(1)>='\u2028' && input.LA(1)<='\u2029') ) {
                input.consume();

            }
            else {
                MismatchedSetException mse = new MismatchedSetException(null,input);
                recover(mse);
                throw mse;}


            }

        }
        finally {
        }
    }
    // $ANTLR end "LT"

    // $ANTLR start "DIGIT"
    public final void mDIGIT() throws RecognitionException {
        try {
            // D:\\Work\\antlr\\conversion\\Formula.g:382:17: ( '0' .. '9' )
            // D:\\Work\\antlr\\conversion\\Formula.g:382:19: '0' .. '9'
            {
            matchRange('0','9'); 

            }

        }
        finally {
        }
    }
    // $ANTLR end "DIGIT"

    public void mTokens() throws RecognitionException {
        // D:\\Work\\antlr\\conversion\\Formula.g:1:8: ( COLON | CONCATENATION | INTERSECT | AND | PLUS | PLUSEQUAL | MINUS | MINUSEQUAL | MULT | MULTEEQUAL | DIV | DIVEQUAL | P_OPEN | P_CLOSE | ARG_SEP | ARG_SEP_WRONG | EQUAL | LESS | LESSEQUAL | GREATER | GREATEREQUAL | NOTEQUAL | NOTEQUAL2 | AMPERSAND | OR | POW | MODE | MODEQUAL | ARRAY_FORMULAR_START | ARRAY_FORMULAR_END | T__56 | INT | NUMBER | PERCENT | SINGLEQUOT_STRING | DOUBLEQUOT_STRING | ERRORNAME | NAME | NAME1 | ODF_TABLE | FUNC | WHITESPACE1 | WHITESPACE )
        int alt30=43;
        alt30 = dfa30.predict(input);
        switch (alt30) {
            case 1 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:10: COLON
                {
                mCOLON(); 

                }
                break;
            case 2 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:16: CONCATENATION
                {
                mCONCATENATION(); 

                }
                break;
            case 3 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:30: INTERSECT
                {
                mINTERSECT(); 

                }
                break;
            case 4 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:40: AND
                {
                mAND(); 

                }
                break;
            case 5 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:44: PLUS
                {
                mPLUS(); 

                }
                break;
            case 6 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:49: PLUSEQUAL
                {
                mPLUSEQUAL(); 

                }
                break;
            case 7 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:59: MINUS
                {
                mMINUS(); 

                }
                break;
            case 8 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:65: MINUSEQUAL
                {
                mMINUSEQUAL(); 

                }
                break;
            case 9 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:76: MULT
                {
                mMULT(); 

                }
                break;
            case 10 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:81: MULTEEQUAL
                {
                mMULTEEQUAL(); 

                }
                break;
            case 11 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:92: DIV
                {
                mDIV(); 

                }
                break;
            case 12 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:96: DIVEQUAL
                {
                mDIVEQUAL(); 

                }
                break;
            case 13 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:105: P_OPEN
                {
                mP_OPEN(); 

                }
                break;
            case 14 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:112: P_CLOSE
                {
                mP_CLOSE(); 

                }
                break;
            case 15 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:120: ARG_SEP
                {
                mARG_SEP(); 

                }
                break;
            case 16 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:128: ARG_SEP_WRONG
                {
                mARG_SEP_WRONG(); 

                }
                break;
            case 17 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:142: EQUAL
                {
                mEQUAL(); 

                }
                break;
            case 18 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:148: LESS
                {
                mLESS(); 

                }
                break;
            case 19 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:153: LESSEQUAL
                {
                mLESSEQUAL(); 

                }
                break;
            case 20 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:163: GREATER
                {
                mGREATER(); 

                }
                break;
            case 21 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:171: GREATEREQUAL
                {
                mGREATEREQUAL(); 

                }
                break;
            case 22 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:184: NOTEQUAL
                {
                mNOTEQUAL(); 

                }
                break;
            case 23 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:193: NOTEQUAL2
                {
                mNOTEQUAL2(); 

                }
                break;
            case 24 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:203: AMPERSAND
                {
                mAMPERSAND(); 

                }
                break;
            case 25 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:213: OR
                {
                mOR(); 

                }
                break;
            case 26 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:216: POW
                {
                mPOW(); 

                }
                break;
            case 27 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:220: MODE
                {
                mMODE(); 

                }
                break;
            case 28 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:225: MODEQUAL
                {
                mMODEQUAL(); 

                }
                break;
            case 29 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:234: ARRAY_FORMULAR_START
                {
                mARRAY_FORMULAR_START(); 

                }
                break;
            case 30 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:255: ARRAY_FORMULAR_END
                {
                mARRAY_FORMULAR_END(); 

                }
                break;
            case 31 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:274: T__56
                {
                mT__56(); 

                }
                break;
            case 32 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:280: INT
                {
                mINT(); 

                }
                break;
            case 33 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:284: NUMBER
                {
                mNUMBER(); 

                }
                break;
            case 34 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:291: PERCENT
                {
                mPERCENT(); 

                }
                break;
            case 35 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:299: SINGLEQUOT_STRING
                {
                mSINGLEQUOT_STRING(); 

                }
                break;
            case 36 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:317: DOUBLEQUOT_STRING
                {
                mDOUBLEQUOT_STRING(); 

                }
                break;
            case 37 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:335: ERRORNAME
                {
                mERRORNAME(); 

                }
                break;
            case 38 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:345: NAME
                {
                mNAME(); 

                }
                break;
            case 39 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:350: NAME1
                {
                mNAME1(); 

                }
                break;
            case 40 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:356: ODF_TABLE
                {
                mODF_TABLE(); 

                }
                break;
            case 41 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:366: FUNC
                {
                mFUNC(); 

                }
                break;
            case 42 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:371: WHITESPACE1
                {
                mWHITESPACE1(); 

                }
                break;
            case 43 :
                // D:\\Work\\antlr\\conversion\\Formula.g:1:383: WHITESPACE
                {
                mWHITESPACE(); 

                }
                break;

        }

    }


    protected DFA21 dfa21 = new DFA21(this);
    protected DFA30 dfa30 = new DFA30(this);
    static final String DFA21_eotS =
        "\15\uffff\1\5\3\uffff\1\5\1\uffff";
    static final String DFA21_eofS =
        "\23\uffff";
    static final String DFA21_minS =
        "\1\133\1\43\1\101\1\145\1\141\1\uffff\1\141\1\164\1\144\1\141\1"+
        "\145\1\135\1\162\1\54\1\163\1\uffff\1\135\1\54\1\uffff";
    static final String DFA21_maxS =
        "\1\133\1\43\1\124\1\145\1\141\1\uffff\1\141\1\164\1\144\1\141\1"+
        "\145\1\135\1\162\1\54\1\163\1\uffff\1\135\1\54\1\uffff";
    static final String DFA21_acceptS =
        "\5\uffff\1\3\11\uffff\1\2\2\uffff\1\1";
    static final String DFA21_specialS =
        "\23\uffff}>";
    static final String[] DFA21_transitionS = {
            "\1\1",
            "\1\2",
            "\1\5\2\uffff\1\4\3\uffff\1\3\13\uffff\1\5",
            "\1\6",
            "\1\7",
            "",
            "\1\10",
            "\1\11",
            "\1\12",
            "\1\13",
            "\1\14",
            "\1\15",
            "\1\16",
            "\1\17",
            "\1\20",
            "",
            "\1\21",
            "\1\22",
            ""
    };

    static final short[] DFA21_eot = DFA.unpackEncodedString(DFA21_eotS);
    static final short[] DFA21_eof = DFA.unpackEncodedString(DFA21_eofS);
    static final char[] DFA21_min = DFA.unpackEncodedStringToUnsignedChars(DFA21_minS);
    static final char[] DFA21_max = DFA.unpackEncodedStringToUnsignedChars(DFA21_maxS);
    static final short[] DFA21_accept = DFA.unpackEncodedString(DFA21_acceptS);
    static final short[] DFA21_special = DFA.unpackEncodedString(DFA21_specialS);
    static final short[][] DFA21_transition;

    static {
        int numStates = DFA21_transitionS.length;
        DFA21_transition = new short[numStates][];
        for (int i=0; i<numStates; i++) {
            DFA21_transition[i] = DFA.unpackEncodedString(DFA21_transitionS[i]);
        }
    }

    class DFA21 extends DFA {

        public DFA21(BaseRecognizer recognizer) {
            this.recognizer = recognizer;
            this.decisionNumber = 21;
            this.eot = DFA21_eot;
            this.eof = DFA21_eof;
            this.min = DFA21_min;
            this.max = DFA21_max;
            this.accept = DFA21_accept;
            this.special = DFA21_special;
            this.transition = DFA21_transition;
        }
        public String getDescription() {
            return "365:10: fragment ODF_PRELIST : ( ( '[#Headers]' COMMAOrSPACE '[#Data]' ) | ( '[#Data]' COMMAOrSPACE '[#Totals]' ) | ODF_PREWORD );";
        }
    }
    static final String DFA30_eotS =
        "\3\uffff\1\41\1\43\1\45\1\47\1\51\1\53\5\uffff\1\56\1\60\1\62\1"+
        "\uffff\1\64\2\uffff\1\65\2\33\2\uffff\1\33\3\uffff\1\76\27\uffff"+
        "\2\33\3\uffff\1\33\1\75\2\uffff\2\103\3\uffff\1\33\1\103\1\uffff"+
        "\1\103\1\uffff\1\33";
    static final String DFA30_eofS =
        "\112\uffff";
    static final String DFA30_minS =
        "\1\0\2\uffff\1\75\1\46\4\75\5\uffff\2\75\1\174\1\uffff\1\75\2\uffff"+
        "\1\0\1\47\1\0\2\uffff\1\0\3\uffff\1\11\27\uffff\1\60\1\0\2\uffff"+
        "\2\0\1\43\2\uffff\1\43\1\0\1\60\1\0\1\uffff\1\53\1\45\1\0\1\43\2"+
        "\0";
    static final String DFA30_maxS =
        "\1\uffff\2\uffff\1\75\1\46\4\75\5\uffff\1\76\1\75\1\174\1\uffff"+
        "\1\75\2\uffff\1\uffff\1\47\1\uffff\2\uffff\1\uffff\3\uffff\1\40"+
        "\27\uffff\1\71\1\uffff\2\uffff\2\uffff\1\172\2\uffff\1\172\1\uffff"+
        "\1\71\1\uffff\1\uffff\2\71\1\uffff\1\172\2\uffff";
    static final String DFA30_acceptS =
        "\1\uffff\1\1\1\2\6\uffff\1\15\1\16\1\17\1\20\1\21\3\uffff\1\32"+
        "\1\uffff\1\35\1\36\3\uffff\1\44\1\45\1\uffff\1\46\1\47\1\50\1\uffff"+
        "\1\53\1\27\1\3\1\30\1\4\1\6\1\5\1\10\1\7\1\12\1\11\1\14\1\13\1\23"+
        "\1\26\1\22\1\25\1\24\1\31\1\37\1\34\1\33\1\40\2\uffff\1\42\1\51"+
        "\3\uffff\1\43\1\52\4\uffff\1\41\6\uffff";
    static final String DFA30_specialS =
        "\1\6\24\uffff\1\0\1\uffff\1\1\2\uffff\1\3\34\uffff\1\2\2\uffff"+
        "\1\12\1\13\4\uffff\1\5\1\uffff\1\11\3\uffff\1\10\1\uffff\1\7\1\4}>";
    static final String[] DFA30_transitionS = {
            "\11\34\2\37\1\34\2\37\22\34\1\36\1\3\1\30\1\31\1\26\1\22\1"+
            "\4\1\27\1\11\1\12\1\7\1\5\1\14\1\6\1\33\1\10\12\25\1\1\1\13"+
            "\1\16\1\15\1\17\1\33\1\uffff\32\32\1\35\1\33\1\uffff\1\21\1"+
            "\32\1\uffff\32\32\1\23\1\20\1\24\1\2\uff81\34",
            "",
            "",
            "\1\40",
            "\1\42",
            "\1\44",
            "\1\46",
            "\1\50",
            "\1\52",
            "",
            "",
            "",
            "",
            "",
            "\1\54\1\55",
            "\1\57",
            "\1\61",
            "",
            "\1\63",
            "",
            "",
            "\11\34\2\uffff\1\34\2\uffff\22\34\3\uffff\2\33\1\70\1\uffff"+
            "\1\33\1\71\5\uffff\1\66\1\uffff\12\25\5\uffff\1\33\1\uffff\4"+
            "\32\1\67\25\32\1\uffff\1\33\2\uffff\1\32\1\uffff\4\32\1\67\25"+
            "\32\4\uffff\uff81\34",
            "\1\27",
            "\15\75\1\uffff\25\75\1\72\1\73\2\75\1\74\6\75\1\73\1\75\12"+
            "\73\5\75\1\73\1\75\32\73\1\75\1\73\2\75\1\73\1\75\32\73\u1fad"+
            "\75\2\uffff\udfd6\75",
            "",
            "",
            "\11\34\2\uffff\1\34\2\uffff\22\34\10\uffff\1\71\7\uffff\12"+
            "\32\7\uffff\32\32\4\uffff\1\32\1\uffff\32\32\4\uffff\uff81\34",
            "",
            "",
            "",
            "\2\37\1\uffff\2\37\22\uffff\1\36",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "\12\77",
            "\11\34\2\uffff\1\34\2\uffff\22\34\10\uffff\1\71\2\uffff\1"+
            "\101\1\uffff\1\101\2\uffff\12\100\7\uffff\32\32\4\uffff\1\32"+
            "\1\uffff\32\32\4\uffff\uff81\34",
            "",
            "",
            "\15\75\1\uffff\104\75\1\102\u1fd5\75\2\uffff\udfd6\75",
            "\15\75\1\uffff\25\75\1\72\1\73\2\75\1\74\6\75\1\73\1\75\12"+
            "\73\5\75\1\73\1\75\32\73\1\75\1\73\2\75\1\73\1\75\32\73\u1fad"+
            "\75\2\uffff\udfd6\75",
            "\2\33\2\uffff\1\27\6\uffff\1\33\1\uffff\12\33\5\uffff\1\33"+
            "\1\uffff\32\33\1\uffff\1\33\2\uffff\1\33\1\uffff\32\33",
            "",
            "",
            "\2\33\1\70\1\uffff\1\33\6\uffff\1\33\1\uffff\12\77\5\uffff"+
            "\1\33\1\uffff\4\33\1\104\25\33\1\uffff\1\33\2\uffff\1\33\1\uffff"+
            "\4\33\1\104\25\33",
            "\11\34\2\uffff\1\34\2\uffff\22\34\3\uffff\2\33\1\70\1\uffff"+
            "\1\33\1\71\5\uffff\1\33\1\uffff\12\100\5\uffff\1\33\1\uffff"+
            "\32\32\1\uffff\1\33\2\uffff\1\32\1\uffff\32\32\4\uffff\uff81"+
            "\34",
            "\12\105",
            "\15\75\1\uffff\67\75\1\106\u1fe2\75\2\uffff\udfd6\75",
            "",
            "\1\101\1\uffff\1\101\2\uffff\12\107",
            "\1\70\12\uffff\12\105",
            "\15\75\1\uffff\70\75\1\110\u1fe1\75\2\uffff\udfd6\75",
            "\2\33\1\70\1\uffff\1\33\6\uffff\1\33\1\uffff\12\107\5\uffff"+
            "\1\33\1\uffff\32\33\1\uffff\1\33\2\uffff\1\33\1\uffff\32\33",
            "\15\75\1\uffff\23\75\1\111\u2006\75\2\uffff\udfd6\75",
            "\15\75\1\uffff\u201a\75\2\uffff\udfd6\75"
    };

    static final short[] DFA30_eot = DFA.unpackEncodedString(DFA30_eotS);
    static final short[] DFA30_eof = DFA.unpackEncodedString(DFA30_eofS);
    static final char[] DFA30_min = DFA.unpackEncodedStringToUnsignedChars(DFA30_minS);
    static final char[] DFA30_max = DFA.unpackEncodedStringToUnsignedChars(DFA30_maxS);
    static final short[] DFA30_accept = DFA.unpackEncodedString(DFA30_acceptS);
    static final short[] DFA30_special = DFA.unpackEncodedString(DFA30_specialS);
    static final short[][] DFA30_transition;

    static {
        int numStates = DFA30_transitionS.length;
        DFA30_transition = new short[numStates][];
        for (int i=0; i<numStates; i++) {
            DFA30_transition[i] = DFA.unpackEncodedString(DFA30_transitionS[i]);
        }
    }

    class DFA30 extends DFA {

        public DFA30(BaseRecognizer recognizer) {
            this.recognizer = recognizer;
            this.decisionNumber = 30;
            this.eot = DFA30_eot;
            this.eof = DFA30_eof;
            this.min = DFA30_min;
            this.max = DFA30_max;
            this.accept = DFA30_accept;
            this.special = DFA30_special;
            this.transition = DFA30_transition;
        }
        public String getDescription() {
            return "1:1: Tokens : ( COLON | CONCATENATION | INTERSECT | AND | PLUS | PLUSEQUAL | MINUS | MINUSEQUAL | MULT | MULTEEQUAL | DIV | DIVEQUAL | P_OPEN | P_CLOSE | ARG_SEP | ARG_SEP_WRONG | EQUAL | LESS | LESSEQUAL | GREATER | GREATEREQUAL | NOTEQUAL | NOTEQUAL2 | AMPERSAND | OR | POW | MODE | MODEQUAL | ARRAY_FORMULAR_START | ARRAY_FORMULAR_END | T__56 | INT | NUMBER | PERCENT | SINGLEQUOT_STRING | DOUBLEQUOT_STRING | ERRORNAME | NAME | NAME1 | ODF_TABLE | FUNC | WHITESPACE1 | WHITESPACE );";
        }
        public int specialStateTransition(int s, IntStream _input) throws NoViableAltException {
            IntStream input = _input;
        	int _s = s;
            switch ( s ) {
                    case 0 : 
                        int LA30_21 = input.LA(1);

                        s = -1;
                        if ( ((LA30_21>='#' && LA30_21<='$')||LA30_21=='\''||LA30_21=='?'||LA30_21=='\\') ) {s = 27;}

                        else if ( (LA30_21=='.') ) {s = 54;}

                        else if ( (LA30_21=='E'||LA30_21=='e') ) {s = 55;}

                        else if ( ((LA30_21>='0' && LA30_21<='9')) ) {s = 21;}

                        else if ( (LA30_21=='%') ) {s = 56;}

                        else if ( ((LA30_21>='A' && LA30_21<='D')||(LA30_21>='F' && LA30_21<='Z')||LA30_21=='_'||(LA30_21>='a' && LA30_21<='d')||(LA30_21>='f' && LA30_21<='z')) ) {s = 26;}

                        else if ( ((LA30_21>='\u0000' && LA30_21<='\b')||LA30_21=='\u000B'||(LA30_21>='\u000E' && LA30_21<='\u001F')||(LA30_21>='\u007F' && LA30_21<='\uFFFF')) ) {s = 28;}

                        else if ( (LA30_21=='(') ) {s = 57;}

                        else s = 53;

                        if ( s>=0 ) return s;
                        break;
                    case 1 : 
                        int LA30_23 = input.LA(1);

                        s = -1;
                        if ( (LA30_23=='#') ) {s = 58;}

                        else if ( (LA30_23=='$'||LA30_23=='.'||(LA30_23>='0' && LA30_23<='9')||LA30_23=='?'||(LA30_23>='A' && LA30_23<='Z')||LA30_23=='\\'||LA30_23=='_'||(LA30_23>='a' && LA30_23<='z')) ) {s = 59;}

                        else if ( (LA30_23=='\'') ) {s = 60;}

                        else if ( ((LA30_23>='\u0000' && LA30_23<='\f')||(LA30_23>='\u000E' && LA30_23<='\"')||(LA30_23>='%' && LA30_23<='&')||(LA30_23>='(' && LA30_23<='-')||LA30_23=='/'||(LA30_23>=':' && LA30_23<='>')||LA30_23=='@'||LA30_23=='['||(LA30_23>=']' && LA30_23<='^')||LA30_23=='`'||(LA30_23>='{' && LA30_23<='\u2027')||(LA30_23>='\u202A' && LA30_23<='\uFFFF')) ) {s = 61;}

                        else s = 27;

                        if ( s>=0 ) return s;
                        break;
                    case 2 : 
                        int LA30_55 = input.LA(1);

                        s = -1;
                        if ( ((LA30_55>='0' && LA30_55<='9')) ) {s = 64;}

                        else if ( (LA30_55=='+'||LA30_55=='-') ) {s = 65;}

                        else if ( ((LA30_55>='A' && LA30_55<='Z')||LA30_55=='_'||(LA30_55>='a' && LA30_55<='z')) ) {s = 26;}

                        else if ( ((LA30_55>='\u0000' && LA30_55<='\b')||LA30_55=='\u000B'||(LA30_55>='\u000E' && LA30_55<='\u001F')||(LA30_55>='\u007F' && LA30_55<='\uFFFF')) ) {s = 28;}

                        else if ( (LA30_55=='(') ) {s = 57;}

                        else s = 27;

                        if ( s>=0 ) return s;
                        break;
                    case 3 : 
                        int LA30_26 = input.LA(1);

                        s = -1;
                        if ( ((LA30_26>='0' && LA30_26<='9')||(LA30_26>='A' && LA30_26<='Z')||LA30_26=='_'||(LA30_26>='a' && LA30_26<='z')) ) {s = 26;}

                        else if ( ((LA30_26>='\u0000' && LA30_26<='\b')||LA30_26=='\u000B'||(LA30_26>='\u000E' && LA30_26<='\u001F')||(LA30_26>='\u007F' && LA30_26<='\uFFFF')) ) {s = 28;}

                        else if ( (LA30_26=='(') ) {s = 57;}

                        else s = 27;

                        if ( s>=0 ) return s;
                        break;
                    case 4 : 
                        int LA30_73 = input.LA(1);

                        s = -1;
                        if ( ((LA30_73>='\u0000' && LA30_73<='\f')||(LA30_73>='\u000E' && LA30_73<='\u2027')||(LA30_73>='\u202A' && LA30_73<='\uFFFF')) ) {s = 61;}

                        else s = 27;

                        if ( s>=0 ) return s;
                        break;
                    case 5 : 
                        int LA30_64 = input.LA(1);

                        s = -1;
                        if ( ((LA30_64>='#' && LA30_64<='$')||LA30_64=='\''||LA30_64=='.'||LA30_64=='?'||LA30_64=='\\') ) {s = 27;}

                        else if ( ((LA30_64>='0' && LA30_64<='9')) ) {s = 64;}

                        else if ( ((LA30_64>='\u0000' && LA30_64<='\b')||LA30_64=='\u000B'||(LA30_64>='\u000E' && LA30_64<='\u001F')||(LA30_64>='\u007F' && LA30_64<='\uFFFF')) ) {s = 28;}

                        else if ( (LA30_64=='%') ) {s = 56;}

                        else if ( ((LA30_64>='A' && LA30_64<='Z')||LA30_64=='_'||(LA30_64>='a' && LA30_64<='z')) ) {s = 26;}

                        else if ( (LA30_64=='(') ) {s = 57;}

                        else s = 67;

                        if ( s>=0 ) return s;
                        break;
                    case 6 : 
                        int LA30_0 = input.LA(1);

                        s = -1;
                        if ( (LA30_0==':') ) {s = 1;}

                        else if ( (LA30_0=='~') ) {s = 2;}

                        else if ( (LA30_0=='!') ) {s = 3;}

                        else if ( (LA30_0=='&') ) {s = 4;}

                        else if ( (LA30_0=='+') ) {s = 5;}

                        else if ( (LA30_0=='-') ) {s = 6;}

                        else if ( (LA30_0=='*') ) {s = 7;}

                        else if ( (LA30_0=='/') ) {s = 8;}

                        else if ( (LA30_0=='(') ) {s = 9;}

                        else if ( (LA30_0==')') ) {s = 10;}

                        else if ( (LA30_0==';') ) {s = 11;}

                        else if ( (LA30_0==',') ) {s = 12;}

                        else if ( (LA30_0=='=') ) {s = 13;}

                        else if ( (LA30_0=='<') ) {s = 14;}

                        else if ( (LA30_0=='>') ) {s = 15;}

                        else if ( (LA30_0=='|') ) {s = 16;}

                        else if ( (LA30_0=='^') ) {s = 17;}

                        else if ( (LA30_0=='%') ) {s = 18;}

                        else if ( (LA30_0=='{') ) {s = 19;}

                        else if ( (LA30_0=='}') ) {s = 20;}

                        else if ( ((LA30_0>='0' && LA30_0<='9')) ) {s = 21;}

                        else if ( (LA30_0=='$') ) {s = 22;}

                        else if ( (LA30_0=='\'') ) {s = 23;}

                        else if ( (LA30_0=='\"') ) {s = 24;}

                        else if ( (LA30_0=='#') ) {s = 25;}

                        else if ( ((LA30_0>='A' && LA30_0<='Z')||LA30_0=='_'||(LA30_0>='a' && LA30_0<='z')) ) {s = 26;}

                        else if ( (LA30_0=='.'||LA30_0=='?'||LA30_0=='\\') ) {s = 27;}

                        else if ( ((LA30_0>='\u0000' && LA30_0<='\b')||LA30_0=='\u000B'||(LA30_0>='\u000E' && LA30_0<='\u001F')||(LA30_0>='\u007F' && LA30_0<='\uFFFF')) ) {s = 28;}

                        else if ( (LA30_0=='[') ) {s = 29;}

                        else if ( (LA30_0==' ') ) {s = 30;}

                        else if ( ((LA30_0>='\t' && LA30_0<='\n')||(LA30_0>='\f' && LA30_0<='\r')) ) {s = 31;}

                        if ( s>=0 ) return s;
                        break;
                    case 7 : 
                        int LA30_72 = input.LA(1);

                        s = -1;
                        if ( (LA30_72=='!') ) {s = 73;}

                        else if ( ((LA30_72>='\u0000' && LA30_72<='\f')||(LA30_72>='\u000E' && LA30_72<=' ')||(LA30_72>='\"' && LA30_72<='\u2027')||(LA30_72>='\u202A' && LA30_72<='\uFFFF')) ) {s = 61;}

                        if ( s>=0 ) return s;
                        break;
                    case 8 : 
                        int LA30_70 = input.LA(1);

                        s = -1;
                        if ( (LA30_70=='F') ) {s = 72;}

                        else if ( ((LA30_70>='\u0000' && LA30_70<='\f')||(LA30_70>='\u000E' && LA30_70<='E')||(LA30_70>='G' && LA30_70<='\u2027')||(LA30_70>='\u202A' && LA30_70<='\uFFFF')) ) {s = 61;}

                        if ( s>=0 ) return s;
                        break;
                    case 9 : 
                        int LA30_66 = input.LA(1);

                        s = -1;
                        if ( (LA30_66=='E') ) {s = 70;}

                        else if ( ((LA30_66>='\u0000' && LA30_66<='\f')||(LA30_66>='\u000E' && LA30_66<='D')||(LA30_66>='F' && LA30_66<='\u2027')||(LA30_66>='\u202A' && LA30_66<='\uFFFF')) ) {s = 61;}

                        if ( s>=0 ) return s;
                        break;
                    case 10 : 
                        int LA30_58 = input.LA(1);

                        s = -1;
                        if ( (LA30_58=='R') ) {s = 66;}

                        else if ( ((LA30_58>='\u0000' && LA30_58<='\f')||(LA30_58>='\u000E' && LA30_58<='Q')||(LA30_58>='S' && LA30_58<='\u2027')||(LA30_58>='\u202A' && LA30_58<='\uFFFF')) ) {s = 61;}

                        if ( s>=0 ) return s;
                        break;
                    case 11 : 
                        int LA30_59 = input.LA(1);

                        s = -1;
                        if ( (LA30_59=='#') ) {s = 58;}

                        else if ( (LA30_59=='\'') ) {s = 60;}

                        else if ( (LA30_59=='$'||LA30_59=='.'||(LA30_59>='0' && LA30_59<='9')||LA30_59=='?'||(LA30_59>='A' && LA30_59<='Z')||LA30_59=='\\'||LA30_59=='_'||(LA30_59>='a' && LA30_59<='z')) ) {s = 59;}

                        else if ( ((LA30_59>='\u0000' && LA30_59<='\f')||(LA30_59>='\u000E' && LA30_59<='\"')||(LA30_59>='%' && LA30_59<='&')||(LA30_59>='(' && LA30_59<='-')||LA30_59=='/'||(LA30_59>=':' && LA30_59<='>')||LA30_59=='@'||LA30_59=='['||(LA30_59>=']' && LA30_59<='^')||LA30_59=='`'||(LA30_59>='{' && LA30_59<='\u2027')||(LA30_59>='\u202A' && LA30_59<='\uFFFF')) ) {s = 61;}

                        else s = 27;

                        if ( s>=0 ) return s;
                        break;
            }
            NoViableAltException nvae =
                new NoViableAltException(getDescription(), 30, _s, input);
            error(nvae);
            throw nvae;
        }
    }
 

}