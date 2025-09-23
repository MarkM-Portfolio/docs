// $ANTLR 3.2 Sep 23, 2009 12:02:23 C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g 2014-03-11 11:41:34

  dojo.provide("parser.JSExprLexer");


var JSExprLexer = function(input, state) {
// alternate constructor @todo
// public JSExprLexer(CharStream input)
// public JSExprLexer(CharStream input, RecognizerSharedState state) {
    if (!state) {
        state = new org.antlr.runtime.RecognizerSharedState();
    }

    (function(){

           this.emitErrorMessage = function(e) {
                if(console) {
                    console.warn(e);
                }
                throw websheet.Constant.ERRORCODE["1002"];
            };

    }).call(this);

    this.dfa20 = new JSExprLexer.DFA20(this);
    this.dfa30 = new JSExprLexer.DFA30(this);
    JSExprLexer.superclass.constructor.call(this, input, state);


};

org.antlr.lang.augmentObject(JSExprLexer, {
    ODF_TABLE: 52,
    ARG_SEP_WRONG: 19,
    NAME1: 53,
    LT: 45,
    NAME: 36,
    DIGIT: 44,
    ARRAY_FORMULAR_END: 33,
    NOTEQUAL2: 26,
    EQUAL: 20,
    DOUBLEQUOT_STRING: 41,
    LESS: 21,
    PLUS: 8,
    LESSEQUAL: 22,
    MULTEEQUAL: 13,
    MODE: 30,
    PERCENT: 38,
    P_CLOSE: 17,
    KEYCHARACTER: 47,
    MULT: 12,
    ARG_SEP: 18,
    AND: 7,
    CONCATENATION: 5,
    POW: 29,
    PLUSEQUAL: 9,
    COLON: 4,
    SINGLEQUOT_STRING: 39,
    NOTEQUAL: 25,
    DIVEQUAL: 15,
    ODF_COLUMN: 48,
    MINUSEQUAL: 11,
    FUNC: 42,
    NUMBER: 37,
    INT: 34,
    ODF_COL_RANGE: 49,
    MINUS: 10,
    WHITESPACE1: 35,
    T__56: 56,
    AMPERSAND: 27,
    ARRAY_FORMULAR_START: 32,
    P_OPEN: 16,
    GREATER: 23,
    EOF: -1,
    ODF_PREWORD: 50,
    OR: 28,
    SPACE: 55,
    COMMAOrSPACE: 46,
    DIV: 14,
    MODEQUAL: 31,
    ERRORNAME: 40,
    NONZERO_NUMBER: 43,
    ODF_PRELIST: 51,
    GREATEREQUAL: 24,
    WHITESPACE: 54,
    INTERSECT: 6
});

(function(){
var HIDDEN = org.antlr.runtime.Token.HIDDEN_CHANNEL,
    EOF = org.antlr.runtime.Token.EOF;
org.antlr.lang.extend(JSExprLexer, org.antlr.runtime.Lexer, {
    ODF_TABLE : 52,
    ARG_SEP_WRONG : 19,
    NAME1 : 53,
    LT : 45,
    NAME : 36,
    DIGIT : 44,
    ARRAY_FORMULAR_END : 33,
    NOTEQUAL2 : 26,
    EQUAL : 20,
    DOUBLEQUOT_STRING : 41,
    LESS : 21,
    PLUS : 8,
    LESSEQUAL : 22,
    MULTEEQUAL : 13,
    MODE : 30,
    PERCENT : 38,
    P_CLOSE : 17,
    KEYCHARACTER : 47,
    MULT : 12,
    ARG_SEP : 18,
    AND : 7,
    CONCATENATION : 5,
    POW : 29,
    PLUSEQUAL : 9,
    COLON : 4,
    SINGLEQUOT_STRING : 39,
    NOTEQUAL : 25,
    DIVEQUAL : 15,
    ODF_COLUMN : 48,
    MINUSEQUAL : 11,
    FUNC : 42,
    NUMBER : 37,
    INT : 34,
    ODF_COL_RANGE : 49,
    MINUS : 10,
    WHITESPACE1 : 35,
    T__56 : 56,
    AMPERSAND : 27,
    ARRAY_FORMULAR_START : 32,
    P_OPEN : 16,
    GREATER : 23,
    EOF : -1,
    ODF_PREWORD : 50,
    OR : 28,
    SPACE : 55,
    COMMAOrSPACE : 46,
    DIV : 14,
    MODEQUAL : 31,
    ERRORNAME : 40,
    NONZERO_NUMBER : 43,
    ODF_PRELIST : 51,
    GREATEREQUAL : 24,
    WHITESPACE : 54,
    INTERSECT : 6,
    getGrammarFileName: function() { return "C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g"; }
});
org.antlr.lang.augmentObject(JSExprLexer.prototype, {
    // $ANTLR start COLON
    mCOLON: function()  {
        try {
            var _type = this.COLON;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:19:7: ( ':' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:19:9: ':'
            this.match(':'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "COLON",

    // $ANTLR start CONCATENATION
    mCONCATENATION: function()  {
        try {
            var _type = this.CONCATENATION;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:20:15: ( '~' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:20:17: '~'
            this.match('~'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "CONCATENATION",

    // $ANTLR start INTERSECT
    mINTERSECT: function()  {
        try {
            var _type = this.INTERSECT;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:21:11: ( '!' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:21:13: '!'
            this.match('!'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "INTERSECT",

    // $ANTLR start AND
    mAND: function()  {
        try {
            var _type = this.AND;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:22:5: ( '&' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:22:7: '&'
            this.match('&'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "AND",

    // $ANTLR start PLUS
    mPLUS: function()  {
        try {
            var _type = this.PLUS;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:23:6: ( '+' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:23:8: '+'
            this.match('+'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "PLUS",

    // $ANTLR start PLUSEQUAL
    mPLUSEQUAL: function()  {
        try {
            var _type = this.PLUSEQUAL;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:24:11: ( '+=' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:24:13: '+='
            this.match("+="); 




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "PLUSEQUAL",

    // $ANTLR start MINUS
    mMINUS: function()  {
        try {
            var _type = this.MINUS;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:25:7: ( '-' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:25:9: '-'
            this.match('-'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "MINUS",

    // $ANTLR start MINUSEQUAL
    mMINUSEQUAL: function()  {
        try {
            var _type = this.MINUSEQUAL;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:26:12: ( '-=' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:26:14: '-='
            this.match("-="); 




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "MINUSEQUAL",

    // $ANTLR start MULT
    mMULT: function()  {
        try {
            var _type = this.MULT;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:27:6: ( '*' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:27:8: '*'
            this.match('*'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "MULT",

    // $ANTLR start MULTEEQUAL
    mMULTEEQUAL: function()  {
        try {
            var _type = this.MULTEEQUAL;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:28:12: ( '*=' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:28:14: '*='
            this.match("*="); 




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "MULTEEQUAL",

    // $ANTLR start DIV
    mDIV: function()  {
        try {
            var _type = this.DIV;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:29:5: ( '/' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:29:7: '/'
            this.match('/'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "DIV",

    // $ANTLR start DIVEQUAL
    mDIVEQUAL: function()  {
        try {
            var _type = this.DIVEQUAL;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:30:10: ( '/=' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:30:12: '/='
            this.match("/="); 




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "DIVEQUAL",

    // $ANTLR start P_OPEN
    mP_OPEN: function()  {
        try {
            var _type = this.P_OPEN;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:31:8: ( '(' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:31:10: '('
            this.match('('); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "P_OPEN",

    // $ANTLR start P_CLOSE
    mP_CLOSE: function()  {
        try {
            var _type = this.P_CLOSE;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:32:9: ( ')' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:32:11: ')'
            this.match(')'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "P_CLOSE",

    // $ANTLR start ARG_SEP
    mARG_SEP: function()  {
        try {
            var _type = this.ARG_SEP;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:33:9: ( ';' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:33:11: ';'
            this.match(';'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "ARG_SEP",

    // $ANTLR start ARG_SEP_WRONG
    mARG_SEP_WRONG: function()  {
        try {
            var _type = this.ARG_SEP_WRONG;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:34:15: ( ',' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:34:17: ','
            this.match(','); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "ARG_SEP_WRONG",

    // $ANTLR start EQUAL
    mEQUAL: function()  {
        try {
            var _type = this.EQUAL;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:35:7: ( '=' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:35:9: '='
            this.match('='); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "EQUAL",

    // $ANTLR start LESS
    mLESS: function()  {
        try {
            var _type = this.LESS;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:36:6: ( '<' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:36:8: '<'
            this.match('<'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "LESS",

    // $ANTLR start LESSEQUAL
    mLESSEQUAL: function()  {
        try {
            var _type = this.LESSEQUAL;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:37:11: ( '<=' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:37:13: '<='
            this.match("<="); 




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "LESSEQUAL",

    // $ANTLR start GREATER
    mGREATER: function()  {
        try {
            var _type = this.GREATER;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:38:9: ( '>' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:38:11: '>'
            this.match('>'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "GREATER",

    // $ANTLR start GREATEREQUAL
    mGREATEREQUAL: function()  {
        try {
            var _type = this.GREATEREQUAL;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:39:14: ( '>=' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:39:16: '>='
            this.match(">="); 




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "GREATEREQUAL",

    // $ANTLR start NOTEQUAL
    mNOTEQUAL: function()  {
        try {
            var _type = this.NOTEQUAL;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:40:10: ( '<>' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:40:12: '<>'
            this.match("<>"); 




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "NOTEQUAL",

    // $ANTLR start NOTEQUAL2
    mNOTEQUAL2: function()  {
        try {
            var _type = this.NOTEQUAL2;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:41:11: ( '!=' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:41:13: '!='
            this.match("!="); 




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "NOTEQUAL2",

    // $ANTLR start AMPERSAND
    mAMPERSAND: function()  {
        try {
            var _type = this.AMPERSAND;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:42:11: ( '&&' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:42:13: '&&'
            this.match("&&"); 




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "AMPERSAND",

    // $ANTLR start OR
    mOR: function()  {
        try {
            var _type = this.OR;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:43:4: ( '||' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:43:6: '||'
            this.match("||"); 




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "OR",

    // $ANTLR start POW
    mPOW: function()  {
        try {
            var _type = this.POW;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:44:5: ( '^' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:44:7: '^'
            this.match('^'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "POW",

    // $ANTLR start MODE
    mMODE: function()  {
        try {
            var _type = this.MODE;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:45:6: ( '%' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:45:8: '%'
            this.match('%'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "MODE",

    // $ANTLR start MODEQUAL
    mMODEQUAL: function()  {
        try {
            var _type = this.MODEQUAL;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:46:10: ( '%=' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:46:12: '%='
            this.match("%="); 




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "MODEQUAL",

    // $ANTLR start ARRAY_FORMULAR_START
    mARRAY_FORMULAR_START: function()  {
        try {
            var _type = this.ARRAY_FORMULAR_START;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:47:22: ( '{' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:47:24: '{'
            this.match('{'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "ARRAY_FORMULAR_START",

    // $ANTLR start ARRAY_FORMULAR_END
    mARRAY_FORMULAR_END: function()  {
        try {
            var _type = this.ARRAY_FORMULAR_END;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:48:20: ( '}' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:48:22: '}'
            this.match('}'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "ARRAY_FORMULAR_END",

    // $ANTLR start T__56
    mT__56: function()  {
        try {
            var _type = this.T__56;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:49:7: ( '|' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:49:9: '|'
            this.match('|'); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "T__56",

    // $ANTLR start NONZERO_NUMBER
    mNONZERO_NUMBER: function()  {
        try {
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:442:25: ( ( '1' .. '9' )+ )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:442:27: ( '1' .. '9' )+
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:442:27: ( '1' .. '9' )+
            var cnt1=0;
            loop1:
            do {
                var alt1=2;
                var LA1_0 = this.input.LA(1);

                if ( ((LA1_0>='1' && LA1_0<='9')) ) {
                    alt1=1;
                }


                switch (alt1) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:442:28: '1' .. '9'
                    this.matchRange('1','9'); 


                    break;

                default :
                    if ( cnt1 >= 1 ) {
                        break loop1;
                    }
                        var eee = new org.antlr.runtime.EarlyExitException(1, this.input);
                        throw eee;
                }
                cnt1++;
            } while (true);




        }
        finally {
        }
    },
    // $ANTLR end "NONZERO_NUMBER",

    // $ANTLR start INT
    mINT: function()  {
        try {
            var _type = this.INT;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:443:5: ( ( DIGIT )+ )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:443:7: ( DIGIT )+
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:443:7: ( DIGIT )+
            var cnt2=0;
            loop2:
            do {
                var alt2=2;
                var LA2_0 = this.input.LA(1);

                if ( ((LA2_0>='0' && LA2_0<='9')) ) {
                    alt2=1;
                }


                switch (alt2) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:443:8: DIGIT
                    this.mDIGIT(); 


                    break;

                default :
                    if ( cnt2 >= 1 ) {
                        break loop2;
                    }
                        var eee = new org.antlr.runtime.EarlyExitException(2, this.input);
                        throw eee;
                }
                cnt2++;
            } while (true);




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "INT",

    // $ANTLR start NUMBER
    mNUMBER: function()  {
        try {
            var _type = this.NUMBER;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:444:8: ( INT ( '.' INT )? ( 'E' ( '-' | '+' )? INT )? )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:444:10: INT ( '.' INT )? ( 'E' ( '-' | '+' )? INT )?
            this.mINT(); 
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:444:14: ( '.' INT )?
            var alt3=2;
            var LA3_0 = this.input.LA(1);

            if ( (LA3_0=='.') ) {
                alt3=1;
            }
            switch (alt3) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:444:15: '.' INT
                    this.match('.'); 
                    this.mINT(); 


                    break;

            }

            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:444:25: ( 'E' ( '-' | '+' )? INT )?
            var alt5=2;
            var LA5_0 = this.input.LA(1);

            if ( (LA5_0=='E') ) {
                alt5=1;
            }
            switch (alt5) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:444:26: 'E' ( '-' | '+' )? INT
                    this.match('E'); 
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:444:29: ( '-' | '+' )?
                    var alt4=2;
                    var LA4_0 = this.input.LA(1);

                    if ( (LA4_0=='+'||LA4_0=='-') ) {
                        alt4=1;
                    }
                    switch (alt4) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:
                            if ( this.input.LA(1)=='+'||this.input.LA(1)=='-' ) {
                                this.input.consume();

                            }
                            else {
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                this.recover(mse);
                                throw mse;}



                            break;

                    }

                    this.mINT(); 


                    break;

            }




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "NUMBER",

    // $ANTLR start PERCENT
    mPERCENT: function()  {
        try {
            var _type = this.PERCENT;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:446:10: ( NUMBER ( '%' )+ )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:446:12: NUMBER ( '%' )+
            this.mNUMBER(); 
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:446:19: ( '%' )+
            var cnt6=0;
            loop6:
            do {
                var alt6=2;
                var LA6_0 = this.input.LA(1);

                if ( (LA6_0=='%') ) {
                    alt6=1;
                }


                switch (alt6) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:446:19: '%'
                    this.match('%'); 


                    break;

                default :
                    if ( cnt6 >= 1 ) {
                        break loop6;
                    }
                        var eee = new org.antlr.runtime.EarlyExitException(6, this.input);
                        throw eee;
                }
                cnt6++;
            } while (true);




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "PERCENT",

    // $ANTLR start SINGLEQUOT_STRING
    mSINGLEQUOT_STRING: function()  {
        try {
            var _type = this.SINGLEQUOT_STRING;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:447:19: ( ( '$' )? ( '\\'' (~ ( '\\'' | LT ) )* '\\'' )+ )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:447:21: ( '$' )? ( '\\'' (~ ( '\\'' | LT ) )* '\\'' )+
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:447:21: ( '$' )?
            var alt7=2;
            var LA7_0 = this.input.LA(1);

            if ( (LA7_0=='$') ) {
                alt7=1;
            }
            switch (alt7) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:447:22: '$'
                    this.match('$'); 


                    break;

            }

            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:447:27: ( '\\'' (~ ( '\\'' | LT ) )* '\\'' )+
            var cnt9=0;
            loop9:
            do {
                var alt9=2;
                var LA9_0 = this.input.LA(1);

                if ( (LA9_0=='\'') ) {
                    alt9=1;
                }


                switch (alt9) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:447:28: '\\'' (~ ( '\\'' | LT ) )* '\\''
                    this.match('\''); 
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:447:33: (~ ( '\\'' | LT ) )*
                    loop8:
                    do {
                        var alt8=2;
                        var LA8_0 = this.input.LA(1);

                        if ( ((LA8_0>='\u0000' && LA8_0<='\f')||(LA8_0>='\u000E' && LA8_0<='&')||(LA8_0>='(' && LA8_0<='\u2027')||(LA8_0>='\u202A' && LA8_0<='\uFFFF')) ) {
                            alt8=1;
                        }


                        switch (alt8) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:447:34: ~ ( '\\'' | LT )
                            if ( (this.input.LA(1)>='\u0000' && this.input.LA(1)<='\f')||(this.input.LA(1)>='\u000E' && this.input.LA(1)<='&')||(this.input.LA(1)>='(' && this.input.LA(1)<='\u2027')||(this.input.LA(1)>='\u202A' && this.input.LA(1)<='\uFFFF') ) {
                                this.input.consume();

                            }
                            else {
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                this.recover(mse);
                                throw mse;}



                            break;

                        default :
                            break loop8;
                        }
                    } while (true);

                    this.match('\''); 


                    break;

                default :
                    if ( cnt9 >= 1 ) {
                        break loop9;
                    }
                        var eee = new org.antlr.runtime.EarlyExitException(9, this.input);
                        throw eee;
                }
                cnt9++;
            } while (true);




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "SINGLEQUOT_STRING",

    // $ANTLR start DOUBLEQUOT_STRING
    mDOUBLEQUOT_STRING: function()  {
        try {
            var _type = this.DOUBLEQUOT_STRING;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:448:19: ( ( '\"' (~ ( '\"' | LT ) )* '\"' )+ )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:448:21: ( '\"' (~ ( '\"' | LT ) )* '\"' )+
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:448:21: ( '\"' (~ ( '\"' | LT ) )* '\"' )+
            var cnt11=0;
            loop11:
            do {
                var alt11=2;
                var LA11_0 = this.input.LA(1);

                if ( (LA11_0=='\"') ) {
                    alt11=1;
                }


                switch (alt11) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:448:22: '\"' (~ ( '\"' | LT ) )* '\"'
                    this.match('\"'); 
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:448:26: (~ ( '\"' | LT ) )*
                    loop10:
                    do {
                        var alt10=2;
                        var LA10_0 = this.input.LA(1);

                        if ( ((LA10_0>='\u0000' && LA10_0<='\f')||(LA10_0>='\u000E' && LA10_0<='!')||(LA10_0>='#' && LA10_0<='\u2027')||(LA10_0>='\u202A' && LA10_0<='\uFFFF')) ) {
                            alt10=1;
                        }


                        switch (alt10) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:448:27: ~ ( '\"' | LT )
                            if ( (this.input.LA(1)>='\u0000' && this.input.LA(1)<='\f')||(this.input.LA(1)>='\u000E' && this.input.LA(1)<='!')||(this.input.LA(1)>='#' && this.input.LA(1)<='\u2027')||(this.input.LA(1)>='\u202A' && this.input.LA(1)<='\uFFFF') ) {
                                this.input.consume();

                            }
                            else {
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                this.recover(mse);
                                throw mse;}



                            break;

                        default :
                            break loop10;
                        }
                    } while (true);

                    this.match('\"'); 


                    break;

                default :
                    if ( cnt11 >= 1 ) {
                        break loop11;
                    }
                        var eee = new org.antlr.runtime.EarlyExitException(11, this.input);
                        throw eee;
                }
                cnt11++;
            } while (true);




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "DOUBLEQUOT_STRING",

    // $ANTLR start ERRORNAME
    mERRORNAME: function()  {
        try {
            var _type = this.ERRORNAME;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:2: ( '#' ( ( ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!' ) | 'N/A' | 'NAME?' ) )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:4: '#' ( ( ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!' ) | 'N/A' | 'NAME?' )
            this.match('#'); 
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:8: ( ( ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!' ) | 'N/A' | 'NAME?' )
            var alt13=3;
            var LA13_0 = this.input.LA(1);

            if ( (LA13_0=='D'||LA13_0=='R'||LA13_0=='V') ) {
                alt13=1;
            }
            else if ( (LA13_0=='N') ) {
                switch ( this.input.LA(2) ) {
                case 'U':
                    alt13=1;
                    break;
                case '/':
                    alt13=2;
                    break;
                case 'A':
                    alt13=3;
                    break;
                default:
                    var nvae =
                        new org.antlr.runtime.NoViableAltException("", 13, 2, this.input);

                    throw nvae;
                }

            }
            else {
                var nvae =
                    new org.antlr.runtime.NoViableAltException("", 13, 0, this.input);

                throw nvae;
            }
            switch (alt13) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:9: ( ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!' )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:9: ( ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!' )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:10: ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' ) '!'
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:10: ( 'VALUE' | 'NUM' | 'REF' | 'DIV/0' | 'NULL' )
                    var alt12=5;
                    switch ( this.input.LA(1) ) {
                    case 'V':
                        alt12=1;
                        break;
                    case 'N':
                        var LA12_2 = this.input.LA(2);

                        if ( (LA12_2=='U') ) {
                            var LA12_5 = this.input.LA(3);

                            if ( (LA12_5=='M') ) {
                                alt12=2;
                            }
                            else if ( (LA12_5=='L') ) {
                                alt12=5;
                            }
                            else {
                                var nvae =
                                    new org.antlr.runtime.NoViableAltException("", 12, 5, this.input);

                                throw nvae;
                            }
                        }
                        else {
                            var nvae =
                                new org.antlr.runtime.NoViableAltException("", 12, 2, this.input);

                            throw nvae;
                        }
                        break;
                    case 'R':
                        alt12=3;
                        break;
                    case 'D':
                        alt12=4;
                        break;
                    default:
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 12, 0, this.input);

                        throw nvae;
                    }

                    switch (alt12) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:11: 'VALUE'
                            this.match("VALUE"); 



                            break;
                        case 2 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:21: 'NUM'
                            this.match("NUM"); 



                            break;
                        case 3 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:29: 'REF'
                            this.match("REF"); 



                            break;
                        case 4 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:37: 'DIV/0'
                            this.match("DIV/0"); 



                            break;
                        case 5 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:47: 'NULL'
                            this.match("NULL"); 



                            break;

                    }

                    this.match('!'); 





                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:63: 'N/A'
                    this.match("N/A"); 



                    break;
                case 3 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:452:71: 'NAME?'
                    this.match("NAME?"); 



                    break;

            }




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "ERRORNAME",

    // $ANTLR start NAME
    mNAME: function()  {
        try {
            var _type = this.NAME;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:453:6: ( ( '0' .. '9' | 'A' .. 'Z' | '?' | '_' | '$' | '\\'' | '.' | '\\\\' )+ ( '#REF!' )? )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:453:8: ( '0' .. '9' | 'A' .. 'Z' | '?' | '_' | '$' | '\\'' | '.' | '\\\\' )+ ( '#REF!' )?
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:453:8: ( '0' .. '9' | 'A' .. 'Z' | '?' | '_' | '$' | '\\'' | '.' | '\\\\' )+
            var cnt14=0;
            loop14:
            do {
                var alt14=2;
                var LA14_0 = this.input.LA(1);

                if ( (LA14_0=='$'||LA14_0=='\''||LA14_0=='.'||(LA14_0>='0' && LA14_0<='9')||LA14_0=='?'||(LA14_0>='A' && LA14_0<='Z')||LA14_0=='\\'||LA14_0=='_') ) {
                    alt14=1;
                }


                switch (alt14) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:
                    if ( this.input.LA(1)=='$'||this.input.LA(1)=='\''||this.input.LA(1)=='.'||(this.input.LA(1)>='0' && this.input.LA(1)<='9')||this.input.LA(1)=='?'||(this.input.LA(1)>='A' && this.input.LA(1)<='Z')||this.input.LA(1)=='\\'||this.input.LA(1)=='_' ) {
                        this.input.consume();

                    }
                    else {
                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                        this.recover(mse);
                        throw mse;}



                    break;

                default :
                    if ( cnt14 >= 1 ) {
                        break loop14;
                    }
                        var eee = new org.antlr.runtime.EarlyExitException(14, this.input);
                        throw eee;
                }
                cnt14++;
            } while (true);

            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:453:55: ( '#REF!' )?
            var alt15=2;
            var LA15_0 = this.input.LA(1);

            if ( (LA15_0=='#') ) {
                alt15=1;
            }
            switch (alt15) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:453:56: '#REF!'
                    this.match("#REF!"); 



                    break;

            }




            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "NAME",

    // $ANTLR start COMMAOrSPACE
    mCOMMAOrSPACE: function()  {
        try {
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:459:23: ( ',' ( ' ' )? )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:459:25: ',' ( ' ' )?
            this.match(','); 
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:459:29: ( ' ' )?
            var alt16=2;
            var LA16_0 = this.input.LA(1);

            if ( (LA16_0==' ') ) {
                alt16=1;
            }
            switch (alt16) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:459:30: ' '
                    this.match(' '); 


                    break;

            }




        }
        finally {
        }
    },
    // $ANTLR end "COMMAOrSPACE",

    // $ANTLR start KEYCHARACTER
    mKEYCHARACTER: function()  {
        try {
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:460:23: ( '\\'' | '#' | '[' | ']' | '@' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:
            if ( this.input.LA(1)=='#'||this.input.LA(1)=='\''||this.input.LA(1)=='@'||this.input.LA(1)=='['||this.input.LA(1)==']' ) {
                this.input.consume();

            }
            else {
                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                this.recover(mse);
                throw mse;}




        }
        finally {
        }
    },
    // $ANTLR end "KEYCHARACTER",

    // $ANTLR start ODF_COLUMN
    mODF_COLUMN: function()  {
        try {
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:461:21: ( '[' (~ ( KEYCHARACTER ) | ( '\\'' KEYCHARACTER ) )+ ']' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:461:23: '[' (~ ( KEYCHARACTER ) | ( '\\'' KEYCHARACTER ) )+ ']'
            this.match('['); 
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:461:27: (~ ( KEYCHARACTER ) | ( '\\'' KEYCHARACTER ) )+
            var cnt17=0;
            loop17:
            do {
                var alt17=3;
                var LA17_0 = this.input.LA(1);

                if ( ((LA17_0>='\u0000' && LA17_0<='\"')||(LA17_0>='$' && LA17_0<='&')||(LA17_0>='(' && LA17_0<='?')||(LA17_0>='A' && LA17_0<='Z')||LA17_0=='\\'||(LA17_0>='^' && LA17_0<='\uFFFF')) ) {
                    alt17=1;
                }
                else if ( (LA17_0=='\'') ) {
                    alt17=2;
                }


                switch (alt17) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:461:29: ~ ( KEYCHARACTER )
                    if ( (this.input.LA(1)>='\u0000' && this.input.LA(1)<='\"')||(this.input.LA(1)>='$' && this.input.LA(1)<='&')||(this.input.LA(1)>='(' && this.input.LA(1)<='?')||(this.input.LA(1)>='A' && this.input.LA(1)<='Z')||this.input.LA(1)=='\\'||(this.input.LA(1)>='^' && this.input.LA(1)<='\uFFFF') ) {
                        this.input.consume();

                    }
                    else {
                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                        this.recover(mse);
                        throw mse;}



                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:461:47: ( '\\'' KEYCHARACTER )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:461:47: ( '\\'' KEYCHARACTER )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:461:48: '\\'' KEYCHARACTER
                    this.match('\''); 
                    this.mKEYCHARACTER(); 





                    break;

                default :
                    if ( cnt17 >= 1 ) {
                        break loop17;
                    }
                        var eee = new org.antlr.runtime.EarlyExitException(17, this.input);
                        throw eee;
                }
                cnt17++;
            } while (true);

            this.match(']'); 



        }
        finally {
        }
    },
    // $ANTLR end "ODF_COLUMN",

    // $ANTLR start ODF_COL_RANGE
    mODF_COL_RANGE: function()  {
        try {
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:462:24: ( ODF_COLUMN ( ':' ODF_COLUMN )? )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:462:26: ODF_COLUMN ( ':' ODF_COLUMN )?
            this.mODF_COLUMN(); 
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:462:37: ( ':' ODF_COLUMN )?
            var alt18=2;
            var LA18_0 = this.input.LA(1);

            if ( (LA18_0==':') ) {
                alt18=1;
            }
            switch (alt18) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:462:38: ':' ODF_COLUMN
                    this.match(':'); 
                    this.mODF_COLUMN(); 


                    break;

            }




        }
        finally {
        }
    },
    // $ANTLR end "ODF_COL_RANGE",

    // $ANTLR start ODF_PREWORD
    mODF_PREWORD: function()  {
        try {
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:463:23: ( '[' ( '#THIS ROW' | '#ALL' | '#HEADERS' | '#TOTALS' | '#DATA' ) ']' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:463:25: '[' ( '#THIS ROW' | '#ALL' | '#HEADERS' | '#TOTALS' | '#DATA' ) ']'
            this.match('['); 
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:463:29: ( '#THIS ROW' | '#ALL' | '#HEADERS' | '#TOTALS' | '#DATA' )
            var alt19=5;
            var LA19_0 = this.input.LA(1);

            if ( (LA19_0=='#') ) {
                switch ( this.input.LA(2) ) {
                case 'T':
                    var LA19_2 = this.input.LA(3);

                    if ( (LA19_2=='H') ) {
                        alt19=1;
                    }
                    else if ( (LA19_2=='O') ) {
                        alt19=4;
                    }
                    else {
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 19, 2, this.input);

                        throw nvae;
                    }
                    break;
                case 'A':
                    alt19=2;
                    break;
                case 'H':
                    alt19=3;
                    break;
                case 'D':
                    alt19=5;
                    break;
                default:
                    var nvae =
                        new org.antlr.runtime.NoViableAltException("", 19, 1, this.input);

                    throw nvae;
                }

            }
            else {
                var nvae =
                    new org.antlr.runtime.NoViableAltException("", 19, 0, this.input);

                throw nvae;
            }
            switch (alt19) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:463:31: '#THIS ROW'
                    this.match("#THIS ROW"); 



                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:463:45: '#ALL'
                    this.match("#ALL"); 



                    break;
                case 3 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:463:54: '#HEADERS'
                    this.match("#HEADERS"); 



                    break;
                case 4 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:463:67: '#TOTALS'
                    this.match("#TOTALS"); 



                    break;
                case 5 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:463:79: '#DATA'
                    this.match("#DATA"); 



                    break;

            }

            this.match(']'); 



        }
        finally {
        }
    },
    // $ANTLR end "ODF_PREWORD",

    // $ANTLR start ODF_PRELIST
    mODF_PRELIST: function()  {
        try {
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:464:22: ( ( '[#HEADERS]' COMMAOrSPACE '[#DATA]' ) | ( '[#DATA]' COMMAOrSPACE '[#TOTALS]' ) | ODF_PREWORD )
            var alt20=3;
            alt20 = this.dfa20.predict(this.input);
            switch (alt20) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:464:24: ( '[#HEADERS]' COMMAOrSPACE '[#DATA]' )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:464:24: ( '[#HEADERS]' COMMAOrSPACE '[#DATA]' )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:464:25: '[#HEADERS]' COMMAOrSPACE '[#DATA]'
                    this.match("[#HEADERS]"); 

                    this.mCOMMAOrSPACE(); 
                    this.match("[#DATA]"); 






                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:464:64: ( '[#DATA]' COMMAOrSPACE '[#TOTALS]' )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:464:64: ( '[#DATA]' COMMAOrSPACE '[#TOTALS]' )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:464:65: '[#DATA]' COMMAOrSPACE '[#TOTALS]'
                    this.match("[#DATA]"); 

                    this.mCOMMAOrSPACE(); 
                    this.match("[#TOTALS]"); 






                    break;
                case 3 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:464:103: ODF_PREWORD
                    this.mODF_PREWORD(); 


                    break;

            }
        }
        finally {
        }
    },
    // $ANTLR end "ODF_PRELIST",

    // $ANTLR start ODF_TABLE
    mODF_TABLE: function()  {
        try {
            var _type = this.ODF_TABLE;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:12: ( ( '[' ( ' ' )? ( ODF_PRELIST ( COMMAOrSPACE ODF_COL_RANGE )? | ODF_COL_RANGE ) ( ' ' )? ']' | ODF_PREWORD | ODF_COLUMN ) )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:20: ( '[' ( ' ' )? ( ODF_PRELIST ( COMMAOrSPACE ODF_COL_RANGE )? | ODF_COL_RANGE ) ( ' ' )? ']' | ODF_PREWORD | ODF_COLUMN )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:20: ( '[' ( ' ' )? ( ODF_PRELIST ( COMMAOrSPACE ODF_COL_RANGE )? | ODF_COL_RANGE ) ( ' ' )? ']' | ODF_PREWORD | ODF_COLUMN )
            var alt25=3;
            var LA25_0 = this.input.LA(1);

            if ( (LA25_0=='[') ) {
                var LA25_1 = this.input.LA(2);

                if ( (LA25_1==' ') ) {
                    var LA25_2 = this.input.LA(3);

                    if ( (LA25_2=='[') ) {
                        alt25=1;
                    }
                    else if ( ((LA25_2>='\u0000' && LA25_2<='\"')||(LA25_2>='$' && LA25_2<='?')||(LA25_2>='A' && LA25_2<='Z')||(LA25_2>='\\' && LA25_2<='\uFFFF')) ) {
                        alt25=3;
                    }
                    else {
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 25, 2, this.input);

                        throw nvae;
                    }
                }
                else if ( ((LA25_1>='\u0000' && LA25_1<='\u001F')||(LA25_1>='!' && LA25_1<='\"')||(LA25_1>='$' && LA25_1<='?')||(LA25_1>='A' && LA25_1<='Z')||LA25_1=='\\'||(LA25_1>='^' && LA25_1<='\uFFFF')) ) {
                    alt25=3;
                }
                else if ( (LA25_1=='[') ) {
                    alt25=1;
                }
                else if ( (LA25_1=='#') ) {
                    alt25=2;
                }
                else {
                    var nvae =
                        new org.antlr.runtime.NoViableAltException("", 25, 1, this.input);

                    throw nvae;
                }
            }
            else {
                var nvae =
                    new org.antlr.runtime.NoViableAltException("", 25, 0, this.input);

                throw nvae;
            }
            switch (alt25) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:22: '[' ( ' ' )? ( ODF_PRELIST ( COMMAOrSPACE ODF_COL_RANGE )? | ODF_COL_RANGE ) ( ' ' )? ']'
                    this.match('['); 
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:26: ( ' ' )?
                    var alt21=2;
                    var LA21_0 = this.input.LA(1);

                    if ( (LA21_0==' ') ) {
                        alt21=1;
                    }
                    switch (alt21) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:27: ' '
                            this.match(' '); 


                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:33: ( ODF_PRELIST ( COMMAOrSPACE ODF_COL_RANGE )? | ODF_COL_RANGE )
                    var alt23=2;
                    var LA23_0 = this.input.LA(1);

                    if ( (LA23_0=='[') ) {
                        var LA23_1 = this.input.LA(2);

                        if ( (LA23_1=='#') ) {
                            alt23=1;
                        }
                        else if ( ((LA23_1>='\u0000' && LA23_1<='\"')||(LA23_1>='$' && LA23_1<='?')||(LA23_1>='A' && LA23_1<='Z')||LA23_1=='\\'||(LA23_1>='^' && LA23_1<='\uFFFF')) ) {
                            alt23=2;
                        }
                        else {
                            var nvae =
                                new org.antlr.runtime.NoViableAltException("", 23, 1, this.input);

                            throw nvae;
                        }
                    }
                    else {
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 23, 0, this.input);

                        throw nvae;
                    }
                    switch (alt23) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:35: ODF_PRELIST ( COMMAOrSPACE ODF_COL_RANGE )?
                            this.mODF_PRELIST(); 
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:47: ( COMMAOrSPACE ODF_COL_RANGE )?
                            var alt22=2;
                            var LA22_0 = this.input.LA(1);

                            if ( (LA22_0==',') ) {
                                alt22=1;
                            }
                            switch (alt22) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:48: COMMAOrSPACE ODF_COL_RANGE
                                    this.mCOMMAOrSPACE(); 
                                    this.mODF_COL_RANGE(); 


                                    break;

                            }



                            break;
                        case 2 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:79: ODF_COL_RANGE
                            this.mODF_COL_RANGE(); 


                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:95: ( ' ' )?
                    var alt24=2;
                    var LA24_0 = this.input.LA(1);

                    if ( (LA24_0==' ') ) {
                        alt24=1;
                    }
                    switch (alt24) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:96: ' '
                            this.match(' '); 


                            break;

                    }

                    this.match(']'); 


                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:108: ODF_PREWORD
                    this.mODF_PREWORD(); 


                    break;
                case 3 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:465:122: ODF_COLUMN
                    this.mODF_COLUMN(); 


                    break;

            }

            websheet.parse.parseHelper._cellHasUnicode = true;



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "ODF_TABLE",

    // $ANTLR start FUNC
    mFUNC: function()  {
        try {
            var _type = this.FUNC;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:470:5: ( ( '0' .. '9' | 'A' .. 'Z' | '_' )+ '(' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:470:7: ( '0' .. '9' | 'A' .. 'Z' | '_' )+ '('
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:470:7: ( '0' .. '9' | 'A' .. 'Z' | '_' )+
            var cnt26=0;
            loop26:
            do {
                var alt26=2;
                var LA26_0 = this.input.LA(1);

                if ( ((LA26_0>='0' && LA26_0<='9')||(LA26_0>='A' && LA26_0<='Z')||LA26_0=='_') ) {
                    alt26=1;
                }


                switch (alt26) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:
                    if ( (this.input.LA(1)>='0' && this.input.LA(1)<='9')||(this.input.LA(1)>='A' && this.input.LA(1)<='Z')||this.input.LA(1)=='_' ) {
                        this.input.consume();

                    }
                    else {
                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                        this.recover(mse);
                        throw mse;}



                    break;

                default :
                    if ( cnt26 >= 1 ) {
                        break loop26;
                    }
                        var eee = new org.antlr.runtime.EarlyExitException(26, this.input);
                        throw eee;
                }
                cnt26++;
            } while (true);

            this.match('('); 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "FUNC",

    // $ANTLR start NAME1
    mNAME1: function()  {
        try {
            var _type = this.NAME1;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:472:7: ( (~ ( '[' | ']' | '\\'' | ':' | '?' | '/' | '\\\\' | '*' | '!' | ' ' | '~' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | ')' | '|' | '{' | '}' | '-' | '+' | '=' | ';' | '<' | '>' | '.' | ',' | '`' | '\\\"' | '\\t' | '\\r' | '\\n' | '\\u000C' ) )+ )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:472:8: (~ ( '[' | ']' | '\\'' | ':' | '?' | '/' | '\\\\' | '*' | '!' | ' ' | '~' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | ')' | '|' | '{' | '}' | '-' | '+' | '=' | ';' | '<' | '>' | '.' | ',' | '`' | '\\\"' | '\\t' | '\\r' | '\\n' | '\\u000C' ) )+
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:472:8: (~ ( '[' | ']' | '\\'' | ':' | '?' | '/' | '\\\\' | '*' | '!' | ' ' | '~' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | ')' | '|' | '{' | '}' | '-' | '+' | '=' | ';' | '<' | '>' | '.' | ',' | '`' | '\\\"' | '\\t' | '\\r' | '\\n' | '\\u000C' ) )+
            var cnt27=0;
            loop27:
            do {
                var alt27=2;
                var LA27_0 = this.input.LA(1);

                if ( ((LA27_0>='\u0000' && LA27_0<='\b')||LA27_0=='\u000B'||(LA27_0>='\u000E' && LA27_0<='\u001F')||(LA27_0>='0' && LA27_0<='9')||(LA27_0>='A' && LA27_0<='Z')||LA27_0=='_'||(LA27_0>='a' && LA27_0<='z')||(LA27_0>='\u007F' && LA27_0<='\uFFFF')) ) {
                    alt27=1;
                }


                switch (alt27) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:472:8: ~ ( '[' | ']' | '\\'' | ':' | '?' | '/' | '\\\\' | '*' | '!' | ' ' | '~' | '@' | '#' | '$' | '%' | '^' | '&' | '(' | ')' | '|' | '{' | '}' | '-' | '+' | '=' | ';' | '<' | '>' | '.' | ',' | '`' | '\\\"' | '\\t' | '\\r' | '\\n' | '\\u000C' )
                    if ( (this.input.LA(1)>='\u0000' && this.input.LA(1)<='\b')||this.input.LA(1)=='\u000B'||(this.input.LA(1)>='\u000E' && this.input.LA(1)<='\u001F')||(this.input.LA(1)>='0' && this.input.LA(1)<='9')||(this.input.LA(1)>='A' && this.input.LA(1)<='Z')||this.input.LA(1)=='_'||(this.input.LA(1)>='a' && this.input.LA(1)<='z')||(this.input.LA(1)>='\u007F' && this.input.LA(1)<='\uFFFF') ) {
                        this.input.consume();

                    }
                    else {
                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                        this.recover(mse);
                        throw mse;}



                    break;

                default :
                    if ( cnt27 >= 1 ) {
                        break loop27;
                    }
                        var eee = new org.antlr.runtime.EarlyExitException(27, this.input);
                        throw eee;
                }
                cnt27++;
            } while (true);

            websheet.parse.parseHelper._cellHasUnicode = true;



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "NAME1",

    // $ANTLR start WHITESPACE1
    mWHITESPACE1: function()  {
        try {
            var _type = this.WHITESPACE1;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:474:13: ( ( ' ' | '\\u00A0' | '\\u3000' )+ )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:474:15: ( ' ' | '\\u00A0' | '\\u3000' )+
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:474:15: ( ' ' | '\\u00A0' | '\\u3000' )+
            var cnt28=0;
            loop28:
            do {
                var alt28=2;
                var LA28_0 = this.input.LA(1);

                if ( (LA28_0==' '||LA28_0=='\u00A0'||LA28_0=='\u3000') ) {
                    alt28=1;
                }


                switch (alt28) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:
                    if ( this.input.LA(1)==' '||this.input.LA(1)=='\u00A0'||this.input.LA(1)=='\u3000' ) {
                        this.input.consume();

                    }
                    else {
                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                        this.recover(mse);
                        throw mse;}



                    break;

                default :
                    if ( cnt28 >= 1 ) {
                        break loop28;
                    }
                        var eee = new org.antlr.runtime.EarlyExitException(28, this.input);
                        throw eee;
                }
                cnt28++;
            } while (true);

             _channel = HIDDEN; 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "WHITESPACE1",

    // $ANTLR start WHITESPACE
    mWHITESPACE: function()  {
        try {
            var _type = this.WHITESPACE;
            var _channel = org.antlr.runtime.BaseRecognizer.DEFAULT_TOKEN_CHANNEL;
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:475:12: ( ( '\\t' | ' ' | '\\r' | '\\n' | '\\u000C' )+ )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:475:14: ( '\\t' | ' ' | '\\r' | '\\n' | '\\u000C' )+
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:475:14: ( '\\t' | ' ' | '\\r' | '\\n' | '\\u000C' )+
            var cnt29=0;
            loop29:
            do {
                var alt29=2;
                var LA29_0 = this.input.LA(1);

                if ( ((LA29_0>='\t' && LA29_0<='\n')||(LA29_0>='\f' && LA29_0<='\r')||LA29_0==' ') ) {
                    alt29=1;
                }


                switch (alt29) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:
                    if ( (this.input.LA(1)>='\t' && this.input.LA(1)<='\n')||(this.input.LA(1)>='\f' && this.input.LA(1)<='\r')||this.input.LA(1)==' ' ) {
                        this.input.consume();

                    }
                    else {
                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                        this.recover(mse);
                        throw mse;}



                    break;

                default :
                    if ( cnt29 >= 1 ) {
                        break loop29;
                    }
                        var eee = new org.antlr.runtime.EarlyExitException(29, this.input);
                        throw eee;
                }
                cnt29++;
            } while (true);

             _channel = HIDDEN; 



            this.state.type = _type;
            this.state.channel = _channel;
        }
        finally {
        }
    },
    // $ANTLR end "WHITESPACE",

    // $ANTLR start SPACE
    mSPACE: function()  {
        try {
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:476:17: ( '\\t' | ' ' | '\\r' | '\\n' | '\\u000C' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:
            if ( (this.input.LA(1)>='\t' && this.input.LA(1)<='\n')||(this.input.LA(1)>='\f' && this.input.LA(1)<='\r')||this.input.LA(1)==' ' ) {
                this.input.consume();

            }
            else {
                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                this.recover(mse);
                throw mse;}




        }
        finally {
        }
    },
    // $ANTLR end "SPACE",

    // $ANTLR start LT
    mLT: function()  {
        try {
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:478:3: ( '\\r' | '\\u2028' | '\\u2029' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:
            if ( this.input.LA(1)=='\r'||(this.input.LA(1)>='\u2028' && this.input.LA(1)<='\u2029') ) {
                this.input.consume();

            }
            else {
                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                this.recover(mse);
                throw mse;}




        }
        finally {
        }
    },
    // $ANTLR end "LT",

    // $ANTLR start DIGIT
    mDIGIT: function()  {
        try {
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:484:17: ( '0' .. '9' )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:484:19: '0' .. '9'
            this.matchRange('0','9'); 



        }
        finally {
        }
    },
    // $ANTLR end "DIGIT",

    mTokens: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:8: ( COLON | CONCATENATION | INTERSECT | AND | PLUS | PLUSEQUAL | MINUS | MINUSEQUAL | MULT | MULTEEQUAL | DIV | DIVEQUAL | P_OPEN | P_CLOSE | ARG_SEP | ARG_SEP_WRONG | EQUAL | LESS | LESSEQUAL | GREATER | GREATEREQUAL | NOTEQUAL | NOTEQUAL2 | AMPERSAND | OR | POW | MODE | MODEQUAL | ARRAY_FORMULAR_START | ARRAY_FORMULAR_END | T__56 | INT | NUMBER | PERCENT | SINGLEQUOT_STRING | DOUBLEQUOT_STRING | ERRORNAME | NAME | ODF_TABLE | FUNC | NAME1 | WHITESPACE1 | WHITESPACE )
        var alt30=43;
        alt30 = this.dfa30.predict(this.input);
        switch (alt30) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:10: COLON
                this.mCOLON(); 


                break;
            case 2 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:16: CONCATENATION
                this.mCONCATENATION(); 


                break;
            case 3 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:30: INTERSECT
                this.mINTERSECT(); 


                break;
            case 4 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:40: AND
                this.mAND(); 


                break;
            case 5 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:44: PLUS
                this.mPLUS(); 


                break;
            case 6 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:49: PLUSEQUAL
                this.mPLUSEQUAL(); 


                break;
            case 7 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:59: MINUS
                this.mMINUS(); 


                break;
            case 8 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:65: MINUSEQUAL
                this.mMINUSEQUAL(); 


                break;
            case 9 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:76: MULT
                this.mMULT(); 


                break;
            case 10 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:81: MULTEEQUAL
                this.mMULTEEQUAL(); 


                break;
            case 11 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:92: DIV
                this.mDIV(); 


                break;
            case 12 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:96: DIVEQUAL
                this.mDIVEQUAL(); 


                break;
            case 13 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:105: P_OPEN
                this.mP_OPEN(); 


                break;
            case 14 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:112: P_CLOSE
                this.mP_CLOSE(); 


                break;
            case 15 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:120: ARG_SEP
                this.mARG_SEP(); 


                break;
            case 16 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:128: ARG_SEP_WRONG
                this.mARG_SEP_WRONG(); 


                break;
            case 17 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:142: EQUAL
                this.mEQUAL(); 


                break;
            case 18 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:148: LESS
                this.mLESS(); 


                break;
            case 19 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:153: LESSEQUAL
                this.mLESSEQUAL(); 


                break;
            case 20 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:163: GREATER
                this.mGREATER(); 


                break;
            case 21 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:171: GREATEREQUAL
                this.mGREATEREQUAL(); 


                break;
            case 22 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:184: NOTEQUAL
                this.mNOTEQUAL(); 


                break;
            case 23 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:193: NOTEQUAL2
                this.mNOTEQUAL2(); 


                break;
            case 24 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:203: AMPERSAND
                this.mAMPERSAND(); 


                break;
            case 25 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:213: OR
                this.mOR(); 


                break;
            case 26 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:216: POW
                this.mPOW(); 


                break;
            case 27 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:220: MODE
                this.mMODE(); 


                break;
            case 28 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:225: MODEQUAL
                this.mMODEQUAL(); 


                break;
            case 29 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:234: ARRAY_FORMULAR_START
                this.mARRAY_FORMULAR_START(); 


                break;
            case 30 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:255: ARRAY_FORMULAR_END
                this.mARRAY_FORMULAR_END(); 


                break;
            case 31 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:274: T__56
                this.mT__56(); 


                break;
            case 32 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:280: INT
                this.mINT(); 


                break;
            case 33 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:284: NUMBER
                this.mNUMBER(); 


                break;
            case 34 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:291: PERCENT
                this.mPERCENT(); 


                break;
            case 35 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:299: SINGLEQUOT_STRING
                this.mSINGLEQUOT_STRING(); 


                break;
            case 36 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:317: DOUBLEQUOT_STRING
                this.mDOUBLEQUOT_STRING(); 


                break;
            case 37 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:335: ERRORNAME
                this.mERRORNAME(); 


                break;
            case 38 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:345: NAME
                this.mNAME(); 


                break;
            case 39 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:350: ODF_TABLE
                this.mODF_TABLE(); 


                break;
            case 40 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:360: FUNC
                this.mFUNC(); 


                break;
            case 41 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:365: NAME1
                this.mNAME1(); 


                break;
            case 42 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:371: WHITESPACE1
                this.mWHITESPACE1(); 


                break;
            case 43 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:1:383: WHITESPACE
                this.mWHITESPACE(); 


                break;

        }

    }

}, true); // important to pass true to overwrite default implementations

org.antlr.lang.augmentObject(JSExprLexer, {
    DFA20_eotS:
        "\u000d\uffff\u0001\u0005\u0003\uffff\u0001\u0005\u0001\uffff",
    DFA20_eofS:
        "\u0013\uffff",
    DFA20_minS:
        "\u0001\u005b\u0001\u0023\u0001\u0041\u0001\u0045\u0001\u0041\u0001"+
    "\uffff\u0001\u0041\u0001\u0054\u0001\u0044\u0001\u0041\u0001\u0045\u0001"+
    "\u005d\u0001\u0052\u0001\u002c\u0001\u0053\u0001\uffff\u0001\u005d\u0001"+
    "\u002c\u0001\uffff",
    DFA20_maxS:
        "\u0001\u005b\u0001\u0023\u0001\u0054\u0001\u0045\u0001\u0041\u0001"+
    "\uffff\u0001\u0041\u0001\u0054\u0001\u0044\u0001\u0041\u0001\u0045\u0001"+
    "\u005d\u0001\u0052\u0001\u002c\u0001\u0053\u0001\uffff\u0001\u005d\u0001"+
    "\u002c\u0001\uffff",
    DFA20_acceptS:
        "\u0005\uffff\u0001\u0003\u0009\uffff\u0001\u0002\u0002\uffff\u0001"+
    "\u0001",
    DFA20_specialS:
        "\u0013\uffff}>",
    DFA20_transitionS: [
            "\u0001\u0001",
            "\u0001\u0002",
            "\u0001\u0005\u0002\uffff\u0001\u0004\u0003\uffff\u0001\u0003"+
            "\u000b\uffff\u0001\u0005",
            "\u0001\u0006",
            "\u0001\u0007",
            "",
            "\u0001\u0008",
            "\u0001\u0009",
            "\u0001\u000a",
            "\u0001\u000b",
            "\u0001\u000c",
            "\u0001\u000d",
            "\u0001\u000e",
            "\u0001\u000f",
            "\u0001\u0010",
            "",
            "\u0001\u0011",
            "\u0001\u0012",
            ""
    ]
});

org.antlr.lang.augmentObject(JSExprLexer, {
    DFA20_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprLexer.DFA20_eotS),
    DFA20_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprLexer.DFA20_eofS),
    DFA20_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JSExprLexer.DFA20_minS),
    DFA20_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JSExprLexer.DFA20_maxS),
    DFA20_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprLexer.DFA20_acceptS),
    DFA20_special:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprLexer.DFA20_specialS),
    DFA20_transition: (function() {
        var a = [],
            i,
            numStates = JSExprLexer.DFA20_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JSExprLexer.DFA20_transitionS[i]));
        }
        return a;
    })()
});

JSExprLexer.DFA20 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 20;
    this.eot = JSExprLexer.DFA20_eot;
    this.eof = JSExprLexer.DFA20_eof;
    this.min = JSExprLexer.DFA20_min;
    this.max = JSExprLexer.DFA20_max;
    this.accept = JSExprLexer.DFA20_accept;
    this.special = JSExprLexer.DFA20_special;
    this.transition = JSExprLexer.DFA20_transition;
};

org.antlr.lang.extend(JSExprLexer.DFA20, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "464:10: fragment ODF_PRELIST : ( ( '[#HEADERS]' COMMAOrSPACE '[#DATA]' ) | ( '[#DATA]' COMMAOrSPACE '[#TOTALS]' ) | ODF_PREWORD );";
    },
    dummy: null
});
org.antlr.lang.augmentObject(JSExprLexer, {
    DFA30_eotS:
        "\u0003\uffff\u0001\u0022\u0001\u0024\u0001\u0026\u0001\u0028\u0001"+
    "\u002a\u0001\u002c\u0005\uffff\u0001\u002f\u0001\u0031\u0001\u0033\u0001"+
    "\uffff\u0001\u0035\u0002\uffff\u0001\u0036\u0002\u001c\u0002\uffff\u0001"+
    "\u001c\u0002\uffff\u0001\u001e\u0001\uffff\u0001\u003f\u0017\uffff\u0002"+
    "\u001c\u0003\uffff\u0001\u001c\u0001\u003e\u0002\uffff\u0001\u0044\u0001"+
    "\uffff\u0001\u0044\u0002\uffff\u0001\u001c\u0001\u0044\u0001\uffff\u0001"+
    "\u0044\u0001\uffff\u0001\u001c",
    DFA30_eofS:
        "\u004b\uffff",
    DFA30_minS:
        "\u0001\u0000\u0002\uffff\u0001\u003d\u0001\u0026\u0004\u003d\u0005"+
    "\uffff\u0002\u003d\u0001\u007c\u0001\uffff\u0001\u003d\u0002\uffff\u0001"+
    "\u0000\u0001\u0027\u0001\u0000\u0002\uffff\u0001\u0000\u0002\uffff\u0001"+
    "\u0020\u0001\uffff\u0001\u0009\u0017\uffff\u0001\u0030\u0001\u0000\u0002"+
    "\uffff\u0002\u0000\u0001\u0023\u0002\uffff\u0001\u0023\u0001\u0030\u0002"+
    "\u0000\u0001\uffff\u0001\u002b\u0001\u0025\u0001\u0000\u0001\u0023\u0002"+
    "\u0000",
    DFA30_maxS:
        "\u0001\uffff\u0002\uffff\u0001\u003d\u0001\u0026\u0004\u003d\u0005"+
    "\uffff\u0001\u003e\u0001\u003d\u0001\u007c\u0001\uffff\u0001\u003d\u0002"+
    "\uffff\u0001\uffff\u0001\u0027\u0001\uffff\u0002\uffff\u0001\uffff\u0002"+
    "\uffff\u0001\u3000\u0001\uffff\u0001\u0020\u0017\uffff\u0001\u0039\u0001"+
    "\uffff\u0002\uffff\u0002\uffff\u0001\u005f\u0002\uffff\u0001\u005f\u0001"+
    "\u0039\u0002\uffff\u0001\uffff\u0002\u0039\u0001\uffff\u0001\u005f\u0002"+
    "\uffff",
    DFA30_acceptS:
        "\u0001\uffff\u0001\u0001\u0001\u0002\u0006\uffff\u0001\u000d\u0001"+
    "\u000e\u0001\u000f\u0001\u0010\u0001\u0011\u0003\uffff\u0001\u001a\u0001"+
    "\uffff\u0001\u001d\u0001\u001e\u0003\uffff\u0001\u0024\u0001\u0025\u0001"+
    "\uffff\u0001\u0027\u0001\u0026\u0001\uffff\u0001\u0029\u0001\uffff\u0001"+
    "\u002b\u0001\u0017\u0001\u0003\u0001\u0018\u0001\u0004\u0001\u0006\u0001"+
    "\u0005\u0001\u0008\u0001\u0007\u0001\u000a\u0001\u0009\u0001\u000c\u0001"+
    "\u000b\u0001\u0013\u0001\u0016\u0001\u0012\u0001\u0015\u0001\u0014\u0001"+
    "\u0019\u0001\u001f\u0001\u001c\u0001\u001b\u0001\u0020\u0002\uffff\u0001"+
    "\u0022\u0001\u0028\u0003\uffff\u0001\u0023\u0001\u002a\u0004\uffff\u0001"+
    "\u0021\u0006\uffff",
    DFA30_specialS:
        "\u0001\u000a\u0014\uffff\u0001\u0008\u0001\uffff\u0001\u0000\u0002"+
    "\uffff\u0001\u0001\u001d\uffff\u0001\u0009\u0002\uffff\u0001\u0003\u0001"+
    "\u0005\u0005\uffff\u0001\u000b\u0001\u0004\u0003\uffff\u0001\u0006\u0001"+
    "\uffff\u0001\u0007\u0001\u0002}>",
    DFA30_transitionS: [
            "\u0009\u001e\u0002\u0020\u0001\u001e\u0002\u0020\u0012\u001e"+
            "\u0001\u001f\u0001\u0003\u0001\u0018\u0001\u0019\u0001\u0016"+
            "\u0001\u0012\u0001\u0004\u0001\u0017\u0001\u0009\u0001\u000a"+
            "\u0001\u0007\u0001\u0005\u0001\u000c\u0001\u0006\u0001\u001c"+
            "\u0001\u0008\u000a\u0015\u0001\u0001\u0001\u000b\u0001\u000e"+
            "\u0001\u000d\u0001\u000f\u0001\u001c\u0001\uffff\u001a\u001a"+
            "\u0001\u001b\u0001\u001c\u0001\uffff\u0001\u0011\u0001\u001a"+
            "\u0001\uffff\u001a\u001e\u0001\u0013\u0001\u0010\u0001\u0014"+
            "\u0001\u0002\u0021\u001e\u0001\u001d\u2f5f\u001e\u0001\u001d"+
            "\ucfff\u001e",
            "",
            "",
            "\u0001\u0021",
            "\u0001\u0023",
            "\u0001\u0025",
            "\u0001\u0027",
            "\u0001\u0029",
            "\u0001\u002b",
            "",
            "",
            "",
            "",
            "",
            "\u0001\u002d\u0001\u002e",
            "\u0001\u0030",
            "\u0001\u0032",
            "",
            "\u0001\u0034",
            "",
            "",
            "\u0009\u001e\u0002\uffff\u0001\u001e\u0002\uffff\u0012\u001e"+
            "\u0003\uffff\u0002\u001c\u0001\u0039\u0001\uffff\u0001\u001c"+
            "\u0001\u003a\u0005\uffff\u0001\u0037\u0001\uffff\u000a\u0015"+
            "\u0005\uffff\u0001\u001c\u0001\uffff\u0004\u001a\u0001\u0038"+
            "\u0015\u001a\u0001\uffff\u0001\u001c\u0002\uffff\u0001\u001a"+
            "\u0001\uffff\u001a\u001e\u0004\uffff\uff81\u001e",
            "\u0001\u0017",
            "\u000d\u003e\u0001\uffff\u0015\u003e\u0001\u003b\u0001\u003c"+
            "\u0002\u003e\u0001\u003d\u0006\u003e\u0001\u003c\u0001\u003e"+
            "\u000a\u003c\u0005\u003e\u0001\u003c\u0001\u003e\u001a\u003c"+
            "\u0001\u003e\u0001\u003c\u0002\u003e\u0001\u003c\u1fc8\u003e"+
            "\u0002\uffff\udfd6\u003e",
            "",
            "",
            "\u0009\u001e\u0002\uffff\u0001\u001e\u0002\uffff\u0012\u001e"+
            "\u0008\uffff\u0001\u003a\u0007\uffff\u000a\u001a\u0007\uffff"+
            "\u001a\u001a\u0004\uffff\u0001\u001a\u0001\uffff\u001a\u001e"+
            "\u0004\uffff\uff81\u001e",
            "",
            "",
            "\u0001\u003f\u007f\uffff\u0001\u001d\u2f5f\uffff\u0001\u001d",
            "",
            "\u0002\u0020\u0001\uffff\u0002\u0020\u0012\uffff\u0001\u001f",
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
            "\u000a\u0040",
            "\u0009\u001e\u0002\uffff\u0001\u001e\u0002\uffff\u0012\u001e"+
            "\u0008\uffff\u0001\u003a\u0002\uffff\u0001\u0041\u0001\uffff"+
            "\u0001\u0041\u0002\uffff\u000a\u0042\u0007\uffff\u001a\u001a"+
            "\u0004\uffff\u0001\u001a\u0001\uffff\u001a\u001e\u0004\uffff"+
            "\uff81\u001e",
            "",
            "",
            "\u000d\u003e\u0001\uffff\u0044\u003e\u0001\u0043\u1fd5\u003e"+
            "\u0002\uffff\udfd6\u003e",
            "\u000d\u003e\u0001\uffff\u0015\u003e\u0001\u003b\u0001\u003c"+
            "\u0002\u003e\u0001\u003d\u0006\u003e\u0001\u003c\u0001\u003e"+
            "\u000a\u003c\u0005\u003e\u0001\u003c\u0001\u003e\u001a\u003c"+
            "\u0001\u003e\u0001\u003c\u0002\u003e\u0001\u003c\u1fc8\u003e"+
            "\u0002\uffff\udfd6\u003e",
            "\u0002\u001c\u0002\uffff\u0001\u0017\u0006\uffff\u0001\u001c"+
            "\u0001\uffff\u000a\u001c\u0005\uffff\u0001\u001c\u0001\uffff"+
            "\u001a\u001c\u0001\uffff\u0001\u001c\u0002\uffff\u0001\u001c",
            "",
            "",
            "\u0002\u001c\u0001\u0039\u0001\uffff\u0001\u001c\u0006\uffff"+
            "\u0001\u001c\u0001\uffff\u000a\u0040\u0005\uffff\u0001\u001c"+
            "\u0001\uffff\u0004\u001c\u0001\u0045\u0015\u001c\u0001\uffff"+
            "\u0001\u001c\u0002\uffff\u0001\u001c",
            "\u000a\u0046",
            "\u0009\u001e\u0002\uffff\u0001\u001e\u0002\uffff\u0012\u001e"+
            "\u0003\uffff\u0002\u001c\u0001\u0039\u0001\uffff\u0001\u001c"+
            "\u0001\u003a\u0005\uffff\u0001\u001c\u0001\uffff\u000a\u0042"+
            "\u0005\uffff\u0001\u001c\u0001\uffff\u001a\u001a\u0001\uffff"+
            "\u0001\u001c\u0002\uffff\u0001\u001a\u0001\uffff\u001a\u001e"+
            "\u0004\uffff\uff81\u001e",
            "\u000d\u003e\u0001\uffff\u0037\u003e\u0001\u0047\u1fe2\u003e"+
            "\u0002\uffff\udfd6\u003e",
            "",
            "\u0001\u0041\u0001\uffff\u0001\u0041\u0002\uffff\u000a\u0048",
            "\u0001\u0039\u000a\uffff\u000a\u0046",
            "\u000d\u003e\u0001\uffff\u0038\u003e\u0001\u0049\u1fe1\u003e"+
            "\u0002\uffff\udfd6\u003e",
            "\u0002\u001c\u0001\u0039\u0001\uffff\u0001\u001c\u0006\uffff"+
            "\u0001\u001c\u0001\uffff\u000a\u0048\u0005\uffff\u0001\u001c"+
            "\u0001\uffff\u001a\u001c\u0001\uffff\u0001\u001c\u0002\uffff"+
            "\u0001\u001c",
            "\u000d\u003e\u0001\uffff\u0013\u003e\u0001\u004a\u2006\u003e"+
            "\u0002\uffff\udfd6\u003e",
            "\u000d\u003e\u0001\uffff\u201a\u003e\u0002\uffff\udfd6\u003e"
    ]
});

org.antlr.lang.augmentObject(JSExprLexer, {
    DFA30_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprLexer.DFA30_eotS),
    DFA30_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprLexer.DFA30_eofS),
    DFA30_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JSExprLexer.DFA30_minS),
    DFA30_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JSExprLexer.DFA30_maxS),
    DFA30_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprLexer.DFA30_acceptS),
    DFA30_special:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprLexer.DFA30_specialS),
    DFA30_transition: (function() {
        var a = [],
            i,
            numStates = JSExprLexer.DFA30_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JSExprLexer.DFA30_transitionS[i]));
        }
        return a;
    })()
});

JSExprLexer.DFA30 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 30;
    this.eot = JSExprLexer.DFA30_eot;
    this.eof = JSExprLexer.DFA30_eof;
    this.min = JSExprLexer.DFA30_min;
    this.max = JSExprLexer.DFA30_max;
    this.accept = JSExprLexer.DFA30_accept;
    this.special = JSExprLexer.DFA30_special;
    this.transition = JSExprLexer.DFA30_transition;
};

org.antlr.lang.extend(JSExprLexer.DFA30, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "1:1: Tokens : ( COLON | CONCATENATION | INTERSECT | AND | PLUS | PLUSEQUAL | MINUS | MINUSEQUAL | MULT | MULTEEQUAL | DIV | DIVEQUAL | P_OPEN | P_CLOSE | ARG_SEP | ARG_SEP_WRONG | EQUAL | LESS | LESSEQUAL | GREATER | GREATEREQUAL | NOTEQUAL | NOTEQUAL2 | AMPERSAND | OR | POW | MODE | MODEQUAL | ARRAY_FORMULAR_START | ARRAY_FORMULAR_END | T__56 | INT | NUMBER | PERCENT | SINGLEQUOT_STRING | DOUBLEQUOT_STRING | ERRORNAME | NAME | ODF_TABLE | FUNC | NAME1 | WHITESPACE1 | WHITESPACE );";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA30_23 = input.LA(1);

                            s = -1;
                            if ( (LA30_23=='#') ) {s = 59;}

                            else if ( (LA30_23=='$'||LA30_23=='.'||(LA30_23>='0' && LA30_23<='9')||LA30_23=='?'||(LA30_23>='A' && LA30_23<='Z')||LA30_23=='\\'||LA30_23=='_') ) {s = 60;}

                            else if ( (LA30_23=='\'') ) {s = 61;}

                            else if ( ((LA30_23>='\u0000' && LA30_23<='\f')||(LA30_23>='\u000E' && LA30_23<='\"')||(LA30_23>='%' && LA30_23<='&')||(LA30_23>='(' && LA30_23<='-')||LA30_23=='/'||(LA30_23>=':' && LA30_23<='>')||LA30_23=='@'||LA30_23=='['||(LA30_23>=']' && LA30_23<='^')||(LA30_23>='`' && LA30_23<='\u2027')||(LA30_23>='\u202A' && LA30_23<='\uFFFF')) ) {s = 62;}

                            else s = 28;

                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA30_26 = input.LA(1);

                            s = -1;
                            if ( ((LA30_26>='0' && LA30_26<='9')||(LA30_26>='A' && LA30_26<='Z')||LA30_26=='_') ) {s = 26;}

                            else if ( ((LA30_26>='\u0000' && LA30_26<='\b')||LA30_26=='\u000B'||(LA30_26>='\u000E' && LA30_26<='\u001F')||(LA30_26>='a' && LA30_26<='z')||(LA30_26>='\u007F' && LA30_26<='\uFFFF')) ) {s = 30;}

                            else if ( (LA30_26=='(') ) {s = 58;}

                            else s = 28;

                            if ( s>=0 ) return s;
                            break;
                        case 2 : 
                            var LA30_74 = input.LA(1);

                            s = -1;
                            if ( ((LA30_74>='\u0000' && LA30_74<='\f')||(LA30_74>='\u000E' && LA30_74<='\u2027')||(LA30_74>='\u202A' && LA30_74<='\uFFFF')) ) {s = 62;}

                            else s = 28;

                            if ( s>=0 ) return s;
                            break;
                        case 3 : 
                            var LA30_59 = input.LA(1);

                            s = -1;
                            if ( (LA30_59=='R') ) {s = 67;}

                            else if ( ((LA30_59>='\u0000' && LA30_59<='\f')||(LA30_59>='\u000E' && LA30_59<='Q')||(LA30_59>='S' && LA30_59<='\u2027')||(LA30_59>='\u202A' && LA30_59<='\uFFFF')) ) {s = 62;}

                            if ( s>=0 ) return s;
                            break;
                        case 4 : 
                            var LA30_67 = input.LA(1);

                            s = -1;
                            if ( (LA30_67=='E') ) {s = 71;}

                            else if ( ((LA30_67>='\u0000' && LA30_67<='\f')||(LA30_67>='\u000E' && LA30_67<='D')||(LA30_67>='F' && LA30_67<='\u2027')||(LA30_67>='\u202A' && LA30_67<='\uFFFF')) ) {s = 62;}

                            if ( s>=0 ) return s;
                            break;
                        case 5 : 
                            var LA30_60 = input.LA(1);

                            s = -1;
                            if ( (LA30_60=='\'') ) {s = 61;}

                            else if ( (LA30_60=='#') ) {s = 59;}

                            else if ( (LA30_60=='$'||LA30_60=='.'||(LA30_60>='0' && LA30_60<='9')||LA30_60=='?'||(LA30_60>='A' && LA30_60<='Z')||LA30_60=='\\'||LA30_60=='_') ) {s = 60;}

                            else if ( ((LA30_60>='\u0000' && LA30_60<='\f')||(LA30_60>='\u000E' && LA30_60<='\"')||(LA30_60>='%' && LA30_60<='&')||(LA30_60>='(' && LA30_60<='-')||LA30_60=='/'||(LA30_60>=':' && LA30_60<='>')||LA30_60=='@'||LA30_60=='['||(LA30_60>=']' && LA30_60<='^')||(LA30_60>='`' && LA30_60<='\u2027')||(LA30_60>='\u202A' && LA30_60<='\uFFFF')) ) {s = 62;}

                            else s = 28;

                            if ( s>=0 ) return s;
                            break;
                        case 6 : 
                            var LA30_71 = input.LA(1);

                            s = -1;
                            if ( (LA30_71=='F') ) {s = 73;}

                            else if ( ((LA30_71>='\u0000' && LA30_71<='\f')||(LA30_71>='\u000E' && LA30_71<='E')||(LA30_71>='G' && LA30_71<='\u2027')||(LA30_71>='\u202A' && LA30_71<='\uFFFF')) ) {s = 62;}

                            if ( s>=0 ) return s;
                            break;
                        case 7 : 
                            var LA30_73 = input.LA(1);

                            s = -1;
                            if ( (LA30_73=='!') ) {s = 74;}

                            else if ( ((LA30_73>='\u0000' && LA30_73<='\f')||(LA30_73>='\u000E' && LA30_73<=' ')||(LA30_73>='\"' && LA30_73<='\u2027')||(LA30_73>='\u202A' && LA30_73<='\uFFFF')) ) {s = 62;}

                            if ( s>=0 ) return s;
                            break;
                        case 8 : 
                            var LA30_21 = input.LA(1);

                            s = -1;
                            if ( (LA30_21=='.') ) {s = 55;}

                            else if ( (LA30_21=='E') ) {s = 56;}

                            else if ( (LA30_21=='%') ) {s = 57;}

                            else if ( ((LA30_21>='0' && LA30_21<='9')) ) {s = 21;}

                            else if ( ((LA30_21>='#' && LA30_21<='$')||LA30_21=='\''||LA30_21=='?'||LA30_21=='\\') ) {s = 28;}

                            else if ( ((LA30_21>='A' && LA30_21<='D')||(LA30_21>='F' && LA30_21<='Z')||LA30_21=='_') ) {s = 26;}

                            else if ( ((LA30_21>='\u0000' && LA30_21<='\b')||LA30_21=='\u000B'||(LA30_21>='\u000E' && LA30_21<='\u001F')||(LA30_21>='a' && LA30_21<='z')||(LA30_21>='\u007F' && LA30_21<='\uFFFF')) ) {s = 30;}

                            else if ( (LA30_21=='(') ) {s = 58;}

                            else s = 54;

                            if ( s>=0 ) return s;
                            break;
                        case 9 : 
                            var LA30_56 = input.LA(1);

                            s = -1;
                            if ( (LA30_56=='+'||LA30_56=='-') ) {s = 65;}

                            else if ( ((LA30_56>='0' && LA30_56<='9')) ) {s = 66;}

                            else if ( ((LA30_56>='A' && LA30_56<='Z')||LA30_56=='_') ) {s = 26;}

                            else if ( ((LA30_56>='\u0000' && LA30_56<='\b')||LA30_56=='\u000B'||(LA30_56>='\u000E' && LA30_56<='\u001F')||(LA30_56>='a' && LA30_56<='z')||(LA30_56>='\u007F' && LA30_56<='\uFFFF')) ) {s = 30;}

                            else if ( (LA30_56=='(') ) {s = 58;}

                            else s = 28;

                            if ( s>=0 ) return s;
                            break;
                        case 10 : 
                            var LA30_0 = input.LA(1);

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

                            else if ( ((LA30_0>='A' && LA30_0<='Z')||LA30_0=='_') ) {s = 26;}

                            else if ( (LA30_0=='[') ) {s = 27;}

                            else if ( (LA30_0=='.'||LA30_0=='?'||LA30_0=='\\') ) {s = 28;}

                            else if ( (LA30_0=='\u00A0'||LA30_0=='\u3000') ) {s = 29;}

                            else if ( ((LA30_0>='\u0000' && LA30_0<='\b')||LA30_0=='\u000B'||(LA30_0>='\u000E' && LA30_0<='\u001F')||(LA30_0>='a' && LA30_0<='z')||(LA30_0>='\u007F' && LA30_0<='\u009F')||(LA30_0>='\u00A1' && LA30_0<='\u2FFF')||(LA30_0>='\u3001' && LA30_0<='\uFFFF')) ) {s = 30;}

                            else if ( (LA30_0==' ') ) {s = 31;}

                            else if ( ((LA30_0>='\t' && LA30_0<='\n')||(LA30_0>='\f' && LA30_0<='\r')) ) {s = 32;}

                            if ( s>=0 ) return s;
                            break;
                        case 11 : 
                            var LA30_66 = input.LA(1);

                            s = -1;
                            if ( (LA30_66=='%') ) {s = 57;}

                            else if ( ((LA30_66>='0' && LA30_66<='9')) ) {s = 66;}

                            else if ( ((LA30_66>='#' && LA30_66<='$')||LA30_66=='\''||LA30_66=='.'||LA30_66=='?'||LA30_66=='\\') ) {s = 28;}

                            else if ( ((LA30_66>='A' && LA30_66<='Z')||LA30_66=='_') ) {s = 26;}

                            else if ( ((LA30_66>='\u0000' && LA30_66<='\b')||LA30_66=='\u000B'||(LA30_66>='\u000E' && LA30_66<='\u001F')||(LA30_66>='a' && LA30_66<='z')||(LA30_66>='\u007F' && LA30_66<='\uFFFF')) ) {s = 30;}

                            else if ( (LA30_66=='(') ) {s = 58;}

                            else s = 68;

                            if ( s>=0 ) return s;
                            break;
            }
        }).call(this.recognizer, s, input);
        if (!org.antlr.lang.isUndefined(retval)) {
            return retval;
        }
        var nvae =
            new org.antlr.runtime.NoViableAltException(this.getDescription(), 30, _s, input);
        this.error(nvae);
        throw nvae;
    },
    dummy: null
});
 
})();