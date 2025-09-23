// $ANTLR 3.2 Sep 23, 2009 12:02:23 C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g 2014-03-11 11:41:34

  dojo.provide("parser.JSExprParser");


var JSExprParser = function(input, state) {
    if (!state) {
        state = new org.antlr.runtime.RecognizerSharedState();
    }

    (function(){

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

    }).call(this);

    JSExprParser.superclass.constructor.call(this, input, state);

    this.dfa18 = new JSExprParser.DFA18(this);
    this.dfa28 = new JSExprParser.DFA28(this);

        this.state.ruleMemo = {};
         
         

    /* @todo only create adaptor if output=AST */
    this.adaptor = new org.antlr.runtime.tree.CommonTreeAdaptor();

};

org.antlr.lang.augmentObject(JSExprParser, {
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
    ODF_PRELIST: 51,
    NONZERO_NUMBER: 43,
    ERRORNAME: 40,
    GREATEREQUAL: 24,
    WHITESPACE: 54,
    INTERSECT: 6
});

(function(){
// public class variables
var ODF_TABLE= 52,
    ARG_SEP_WRONG= 19,
    NAME1= 53,
    LT= 45,
    NAME= 36,
    DIGIT= 44,
    ARRAY_FORMULAR_END= 33,
    NOTEQUAL2= 26,
    EQUAL= 20,
    DOUBLEQUOT_STRING= 41,
    LESS= 21,
    PLUS= 8,
    LESSEQUAL= 22,
    MULTEEQUAL= 13,
    MODE= 30,
    PERCENT= 38,
    P_CLOSE= 17,
    KEYCHARACTER= 47,
    MULT= 12,
    ARG_SEP= 18,
    AND= 7,
    CONCATENATION= 5,
    POW= 29,
    PLUSEQUAL= 9,
    COLON= 4,
    SINGLEQUOT_STRING= 39,
    NOTEQUAL= 25,
    DIVEQUAL= 15,
    ODF_COLUMN= 48,
    MINUSEQUAL= 11,
    FUNC= 42,
    NUMBER= 37,
    INT= 34,
    ODF_COL_RANGE= 49,
    MINUS= 10,
    WHITESPACE1= 35,
    T__56= 56,
    AMPERSAND= 27,
    ARRAY_FORMULAR_START= 32,
    P_OPEN= 16,
    GREATER= 23,
    EOF= -1,
    ODF_PREWORD= 50,
    OR= 28,
    SPACE= 55,
    COMMAOrSPACE= 46,
    DIV= 14,
    MODEQUAL= 31,
    ODF_PRELIST= 51,
    NONZERO_NUMBER= 43,
    ERRORNAME= 40,
    GREATEREQUAL= 24,
    WHITESPACE= 54,
    INTERSECT= 6;

// public instance methods/vars
org.antlr.lang.extend(JSExprParser, org.antlr.runtime.Parser, {
        
    setTreeAdaptor: function(adaptor) {
        this.adaptor = adaptor;
    },
    getTreeAdaptor: function() {
        return this.adaptor;
    },

    getTokenNames: function() { return JSExprParser.tokenNames; },
    getGrammarFileName: function() { return "C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g"; }
});
org.antlr.lang.augmentObject(JSExprParser.prototype, {

    // inline static return class
    prog_return: (function() {
        JSExprParser.prog_return = function(){};
        org.antlr.lang.extend(JSExprParser.prog_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:86:1: prog returns [String value] : ( EQUAL expr EOF | ARRAY_FORMULAR_START EQUAL expr ARRAY_FORMULAR_END EOF );
    // $ANTLR start "prog"
    prog: function() {
        var retval = new JSExprParser.prog_return();
        retval.start = this.input.LT(1);
        var prog_StartIndex = this.input.index();
        var root_0 = null;

        var EQUAL1 = null;
        var EOF3 = null;
        var ARRAY_FORMULAR_START4 = null;
        var EQUAL5 = null;
        var ARRAY_FORMULAR_END7 = null;
        var EOF8 = null;
         var expr2 = null;
         var expr6 = null;

        var EQUAL1_tree=null;
        var EOF3_tree=null;
        var ARRAY_FORMULAR_START4_tree=null;
        var EQUAL5_tree=null;
        var ARRAY_FORMULAR_END7_tree=null;
        var EOF8_tree=null;


          	this.inConstArray = 0;
          
        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 1) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:90:3: ( EQUAL expr EOF | ARRAY_FORMULAR_START EQUAL expr ARRAY_FORMULAR_END EOF )
            var alt1=2;
            var LA1_0 = this.input.LA(1);

            if ( (LA1_0==EQUAL) ) {
                alt1=1;
            }
            else if ( (LA1_0==ARRAY_FORMULAR_START) ) {
                alt1=2;
            }
            else {
                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                var nvae =
                    new org.antlr.runtime.NoViableAltException("", 1, 0, this.input);

                throw nvae;
            }
            switch (alt1) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:90:5: EQUAL expr EOF
                    root_0 = this.adaptor.nil();

                    EQUAL1=this.match(this.input,EQUAL,JSExprParser.FOLLOW_EQUAL_in_prog367); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    EQUAL1_tree = this.adaptor.create(EQUAL1);
                    this.adaptor.addChild(root_0, EQUAL1_tree);
                    }
                    if ( this.state.backtracking===0 ) {
                      this.formula = "=";
                    }
                    this.pushFollow(JSExprParser.FOLLOW_expr_in_prog376);
                    expr2=this.expr();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, expr2.getTree());
                    if ( this.state.backtracking===0 ) {

                              this.cell.setCellToken((expr2!==null?expr2.value:null));
                              retval.value = (expr2!==null?expr2.value:null);
                          
                    }
                    EOF3=this.match(this.input,EOF,JSExprParser.FOLLOW_EOF_in_prog385); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    EOF3_tree = this.adaptor.create(EOF3);
                    this.adaptor.addChild(root_0, EOF3_tree);
                    }


                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:96:5: ARRAY_FORMULAR_START EQUAL expr ARRAY_FORMULAR_END EOF
                    root_0 = this.adaptor.nil();

                    ARRAY_FORMULAR_START4=this.match(this.input,ARRAY_FORMULAR_START,JSExprParser.FOLLOW_ARRAY_FORMULAR_START_in_prog391); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    ARRAY_FORMULAR_START4_tree = this.adaptor.create(ARRAY_FORMULAR_START4);
                    this.adaptor.addChild(root_0, ARRAY_FORMULAR_START4_tree);
                    }
                    EQUAL5=this.match(this.input,EQUAL,JSExprParser.FOLLOW_EQUAL_in_prog393); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    EQUAL5_tree = this.adaptor.create(EQUAL5);
                    this.adaptor.addChild(root_0, EQUAL5_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                              //this.isArrayFormular = true;
                              this.formula = "{=";
                          
                    }
                    this.pushFollow(JSExprParser.FOLLOW_expr_in_prog409);
                    expr6=this.expr();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, expr6.getTree());
                    if ( this.state.backtracking===0 ) {

                          	var tokenList = this.tokenMgr.newArrayTokenList((expr6!==null?expr6.value:null),this.cell);
                              this.cell.setCellToken(tokenList);
                              retval.value = (expr6!==null?expr6.value:null);
                              this.formula += "}";
                          
                    }
                    ARRAY_FORMULAR_END7=this.match(this.input,ARRAY_FORMULAR_END,JSExprParser.FOLLOW_ARRAY_FORMULAR_END_in_prog413); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    ARRAY_FORMULAR_END7_tree = this.adaptor.create(ARRAY_FORMULAR_END7);
                    this.adaptor.addChild(root_0, ARRAY_FORMULAR_END7_tree);
                    }
                    EOF8=this.match(this.input,EOF,JSExprParser.FOLLOW_EOF_in_prog415); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    EOF8_tree = this.adaptor.create(EOF8);
                    this.adaptor.addChild(root_0, EOF8_tree);
                    }


                    break;

            }
            retval.stop = this.input.LT(-1);

            if ( this.state.backtracking===0 ) {

            retval.tree = this.adaptor.rulePostProcessing(root_0);
            this.adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (re) {
            if (re instanceof org.antlr.runtime.RecognitionException) {
                this.reportError(re);
                this.recover(this.input,re);
                retval.tree = this.adaptor.errorNode(this.input, retval.start, this.input.LT(-1), re);
            } else {
                throw re;
            }
        }
        finally {
            if ( this.state.backtracking>0 ) { this.memoize(this.input, 1, prog_StartIndex); }
        }
        return retval;
    },

    // inline static return class
    expr_return: (function() {
        JSExprParser.expr_return = function(){};
        org.antlr.lang.extend(JSExprParser.expr_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:109:1: expr returns [String value] : a= atom ( MODE )* (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr )* ;
    // $ANTLR start "expr"
    expr: function() {
        var retval = new JSExprParser.expr_return();
        retval.start = this.input.LT(1);
        var expr_StartIndex = this.input.index();
        var root_0 = null;

        var m = null;
        var MODE9 = null;
         var a = null;
         var b = null;

        var m_tree=null;
        var MODE9_tree=null;

        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 2) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:110:5: (a= atom ( MODE )* (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr )* )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:110:9: a= atom ( MODE )* (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr )*
            root_0 = this.adaptor.nil();

            this.pushFollow(JSExprParser.FOLLOW_atom_in_expr438);
            a=this.atom();

            this.state._fsp--;
            if (this.state.failed) return retval;
            if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, a.getTree());
            if ( this.state.backtracking===0 ) {

                        var tempValue = this.tokenMgr.calcOperator(this.temp,(a!==null?a.value:null),this.errMsg,this.cell);
                        if(tempValue._error){
              	  		this.errMsg = tempValue._error;
                		  }
                        retval.value = tempValue;
                      
            }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:117:8: ( MODE )*
            loop2:
            do {
                var alt2=2;
                var LA2_0 = this.input.LA(1);

                if ( (LA2_0==MODE) ) {
                    alt2=1;
                }


                switch (alt2) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:117:9: MODE
                    MODE9=this.match(this.input,MODE,JSExprParser.FOLLOW_MODE_in_expr450); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    MODE9_tree = this.adaptor.create(MODE9);
                    this.adaptor.addChild(root_0, MODE9_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                                  var tokenList = this.tokenMgr.newModeTokenList(tempValue,(MODE9?MODE9.getText():null),this.cell);
                                  if(tokenList._error){
                      	  			this.errMsg = tokenList._error;
                        		  	}
                                  this.formula += tokenList.getToken();
                      		    retval.value = tempValue = tokenList;
                               
                    }


                    break;

                default :
                    break loop2;
                }
            } while (true);

            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:125:9: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr )*
            loop3:
            do {
                var alt3=2;
                var LA3_0 = this.input.LA(1);

                if ( ((LA3_0>=COLON && LA3_0<=DIVEQUAL)||(LA3_0>=EQUAL && LA3_0<=NOTEQUAL2)||LA3_0==POW||LA3_0==MODEQUAL) ) {
                    var LA3_2 = this.input.LA(2);

                    if ( (this.synpred23_JSExpr()) ) {
                        alt3=1;
                    }


                }


                switch (alt3) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:125:10: m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr
                    m=this.input.LT(1);
                    if ( (this.input.LA(1)>=COLON && this.input.LA(1)<=DIVEQUAL)||(this.input.LA(1)>=EQUAL && this.input.LA(1)<=NOTEQUAL2)||this.input.LA(1)==POW||this.input.LA(1)==MODEQUAL ) {
                        this.input.consume();
                        if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(m));
                        this.state.errorRecovery=false;this.state.failed=false;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                        throw mse;
                    }

                    if ( this.state.backtracking===0 ) {
                       
                              	var tokenList = this.tokenMgr.newOperatorTokenList((m?m.getText():null),this.cell);
                              	this.formula += tokenList.getToken();
                                  this.temp.push(retval.value);
                                  this.temp.push(tokenList);
                              
                    }
                    this.pushFollow(JSExprParser.FOLLOW_expr_in_expr612);
                    b=this.expr();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, b.getTree());
                    if ( this.state.backtracking===0 ) {

                                  retval.value = (b!==null?b.value:null);
                              
                    }


                    break;

                default :
                    break loop3;
                }
            } while (true);




            retval.stop = this.input.LT(-1);

            if ( this.state.backtracking===0 ) {

            retval.tree = this.adaptor.rulePostProcessing(root_0);
            this.adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (re) {
            if (re instanceof org.antlr.runtime.RecognitionException) {
                this.reportError(re);
                this.recover(this.input,re);
                retval.tree = this.adaptor.errorNode(this.input, retval.start, this.input.LT(-1), re);
            } else {
                throw re;
            }
        }
        finally {
            if ( this.state.backtracking>0 ) { this.memoize(this.input, 2, expr_StartIndex); }
        }
        return retval;
    },

    // inline static return class
    atom_return: (function() {
        JSExprParser.atom_return = function(){};
        org.antlr.lang.extend(JSExprParser.atom_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:145:1: atom returns [String value] : (n= ( '+' | '-' ) (b= atom ) | x1= INT ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? x2= ( INT | NAME ) )* | NUMBER | PERCENT | x= SINGLEQUOT_STRING (name= ( ERRORNAME | NAME ) )? ( ( WHITESPACE1 )? em= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( ERRORNAME | NAME | INT ) )* | DOUBLEQUOT_STRING | (brace= P_OPEN ) ( expr P_CLOSE ) | folded | ( ARRAY_FORMULAR_START ) (firToken= atom ) ( (sep= ( ARG_SEP | '|' ) ) (token= atom ) )* ( ARRAY_FORMULAR_END ) | (name= ( ERRORNAME | NAME ) (name1= ( ERRORNAME | NAME ) )? ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? name2= ( ERRORNAME | NAME | INT ) (name3= ( ERRORNAME | NAME ) )? )* ) );
    // $ANTLR start "atom"
    atom: function() {
        var retval = new JSExprParser.atom_return();
        retval.start = this.input.LT(1);
        var atom_StartIndex = this.input.index();
        var root_0 = null;

        var n = null;
        var x1 = null;
        var m = null;
        var x2 = null;
        var x = null;
        var name = null;
        var em = null;
        var endName = null;
        var brace = null;
        var sep = null;
        var name1 = null;
        var name2 = null;
        var name3 = null;
        var WHITESPACE110 = null;
        var WHITESPACE111 = null;
        var NUMBER12 = null;
        var PERCENT13 = null;
        var WHITESPACE114 = null;
        var WHITESPACE115 = null;
        var DOUBLEQUOT_STRING16 = null;
        var P_CLOSE18 = null;
        var ARRAY_FORMULAR_START20 = null;
        var ARRAY_FORMULAR_END21 = null;
        var WHITESPACE122 = null;
        var WHITESPACE123 = null;
         var b = null;
         var firToken = null;
         var token = null;
         var expr17 = null;
         var folded19 = null;

        var n_tree=null;
        var x1_tree=null;
        var m_tree=null;
        var x2_tree=null;
        var x_tree=null;
        var name_tree=null;
        var em_tree=null;
        var endName_tree=null;
        var brace_tree=null;
        var sep_tree=null;
        var name1_tree=null;
        var name2_tree=null;
        var name3_tree=null;
        var WHITESPACE110_tree=null;
        var WHITESPACE111_tree=null;
        var NUMBER12_tree=null;
        var PERCENT13_tree=null;
        var WHITESPACE114_tree=null;
        var WHITESPACE115_tree=null;
        var DOUBLEQUOT_STRING16_tree=null;
        var P_CLOSE18_tree=null;
        var ARRAY_FORMULAR_START20_tree=null;
        var ARRAY_FORMULAR_END21_tree=null;
        var WHITESPACE122_tree=null;
        var WHITESPACE123_tree=null;

        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 3) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:146:3: (n= ( '+' | '-' ) (b= atom ) | x1= INT ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? x2= ( INT | NAME ) )* | NUMBER | PERCENT | x= SINGLEQUOT_STRING (name= ( ERRORNAME | NAME ) )? ( ( WHITESPACE1 )? em= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( ERRORNAME | NAME | INT ) )* | DOUBLEQUOT_STRING | (brace= P_OPEN ) ( expr P_CLOSE ) | folded | ( ARRAY_FORMULAR_START ) (firToken= atom ) ( (sep= ( ARG_SEP | '|' ) ) (token= atom ) )* ( ARRAY_FORMULAR_END ) | (name= ( ERRORNAME | NAME ) (name1= ( ERRORNAME | NAME ) )? ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? name2= ( ERRORNAME | NAME | INT ) (name3= ( ERRORNAME | NAME ) )? )* ) )
            var alt18=10;
            alt18 = this.dfa18.predict(this.input);
            switch (alt18) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:146:5: n= ( '+' | '-' ) (b= atom )
                    root_0 = this.adaptor.nil();

                    n=this.input.LT(1);
                    if ( this.input.LA(1)==PLUS||this.input.LA(1)==MINUS ) {
                        this.input.consume();
                        if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(n));
                        this.state.errorRecovery=false;this.state.failed=false;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                        throw mse;
                    }

                    if ( this.state.backtracking===0 ) {
                      this.formula += (n?n.getText():null);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:146:42: (b= atom )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:146:43: b= atom
                    this.pushFollow(JSExprParser.FOLLOW_atom_in_atom664);
                    b=this.atom();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, b.getTree());



                    if ( this.state.backtracking===0 ) {

                        		var tokenList = this.tokenMgr.newPosNegtiveTokenList((b!==null?b.value:null),(n?n.getText():null),this.cell,this.errMsg);
                        		if(tokenList._error)this.errMsg = tokenList._error;
                        		retval.value = tokenList; 
                          
                    }


                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:154:5: x1= INT ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? x2= ( INT | NAME ) )*
                    root_0 = this.adaptor.nil();

                    x1=this.match(this.input,INT,JSExprParser.FOLLOW_INT_in_atom685); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    x1_tree = this.adaptor.create(x1);
                    this.adaptor.addChild(root_0, x1_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:154:14: ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? x2= ( INT | NAME ) )*
                    loop6:
                    do {
                        var alt6=2;
                        var LA6_0 = this.input.LA(1);

                        if ( (LA6_0==COLON) ) {
                            switch ( this.input.LA(2) ) {
                            case INT:
                                var LA6_4 = this.input.LA(3);

                                if ( (this.synpred29_JSExpr()) ) {
                                    alt6=1;
                                }


                                break;
                            case NAME:
                                var LA6_5 = this.input.LA(3);

                                if ( (this.synpred29_JSExpr()) ) {
                                    alt6=1;
                                }


                                break;
                            case WHITESPACE1:
                                alt6=1;
                                break;

                            }

                        }
                        else if ( (LA6_0==WHITESPACE1) ) {
                            alt6=1;
                        }


                        switch (alt6) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:154:15: ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? x2= ( INT | NAME )
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:154:15: ( WHITESPACE1 )?
                            var alt4=2;
                            var LA4_0 = this.input.LA(1);

                            if ( (LA4_0==WHITESPACE1) ) {
                                alt4=1;
                            }
                            switch (alt4) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                                    WHITESPACE110=this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_atom688); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    WHITESPACE110_tree = this.adaptor.create(WHITESPACE110);
                                    this.adaptor.addChild(root_0, WHITESPACE110_tree);
                                    }


                                    break;

                            }

                            m=this.match(this.input,COLON,JSExprParser.FOLLOW_COLON_in_atom693); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            m_tree = this.adaptor.create(m);
                            this.adaptor.addChild(root_0, m_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:154:36: ( WHITESPACE1 )?
                            var alt5=2;
                            var LA5_0 = this.input.LA(1);

                            if ( (LA5_0==WHITESPACE1) ) {
                                alt5=1;
                            }
                            switch (alt5) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                                    WHITESPACE111=this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_atom695); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    WHITESPACE111_tree = this.adaptor.create(WHITESPACE111);
                                    this.adaptor.addChild(root_0, WHITESPACE111_tree);
                                    }


                                    break;

                            }

                            x2=this.input.LT(1);
                            if ( this.input.LA(1)==INT||this.input.LA(1)==NAME ) {
                                this.input.consume();
                                if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(x2));
                                this.state.errorRecovery=false;this.state.failed=false;
                            }
                            else {
                                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                throw mse;
                            }

                            if ( this.state.backtracking===0 ) {

                              	if(!this._tmpText)
                                		this._tmpText = "";
                                	
                              	if((m?m.getText():null))
                              	      this._tmpText += (m?m.getText():null);
                              	if((x2?x2.getText():null))
                              	      this._tmpText += (x2?x2.getText():null);
                                	m = x2 = null;
                              	  
                            }


                            break;

                        default :
                            break loop6;
                        }
                    } while (true);

                    if ( this.state.backtracking===0 ) {

                        		if(this._tmpText){
                        			var text = (x1?x1.getText():null) + this._tmpText; 
                        			this._tmpText= "";
                        			var startIndex = x1.getCharPositionInLine();
                        			var token = this.tokenMgr.newRefToken(text,this.cell,this.sheetName,this.formula.length, startIndex);
                      		    this.formula += token.getToken();
                      		    if(token._error)this.errMsg = token._error;
                      		    retval.value = token;
                        		}else{
                        			var text = (x1?x1.getText():null);
                      	  		var token = this.tokenMgr.newIntToken(text);
                      	  		this.formula += token.getToken();
                      	  		retval.value = token;
                        		}
                          
                    }


                    break;
                case 3 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:179:5: NUMBER
                    root_0 = this.adaptor.nil();

                    NUMBER12=this.match(this.input,NUMBER,JSExprParser.FOLLOW_NUMBER_in_atom717); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    NUMBER12_tree = this.adaptor.create(NUMBER12);
                    this.adaptor.addChild(root_0, NUMBER12_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                            	var token = this.tokenMgr.newNumberToken((NUMBER12?NUMBER12.getText():null));
                            	this.formula += token.getToken();
                            	if(token._error)this.errMsg = token._error;
                            	retval.value = token;
                            
                    }


                    break;
                case 4 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:185:5: PERCENT
                    root_0 = this.adaptor.nil();

                    PERCENT13=this.match(this.input,PERCENT,JSExprParser.FOLLOW_PERCENT_in_atom726); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    PERCENT13_tree = this.adaptor.create(PERCENT13);
                    this.adaptor.addChild(root_0, PERCENT13_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                        		var tokenList = this.tokenMgr.newPercentTokenList((PERCENT13?PERCENT13.getText():null),this.cell);
                        		this.formula += tokenList.getToken();
                        		if(tokenList._error)this.errMsg = tokenList._error;
                            	retval.value = tokenList;
                            
                    }


                    break;
                case 5 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:5: x= SINGLEQUOT_STRING (name= ( ERRORNAME | NAME ) )? ( ( WHITESPACE1 )? em= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( ERRORNAME | NAME | INT ) )*
                    root_0 = this.adaptor.nil();

                    x=this.match(this.input,SINGLEQUOT_STRING,JSExprParser.FOLLOW_SINGLEQUOT_STRING_in_atom740); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    x_tree = this.adaptor.create(x);
                    this.adaptor.addChild(root_0, x_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:25: (name= ( ERRORNAME | NAME ) )?
                    var alt7=2;
                    var LA7_0 = this.input.LA(1);

                    if ( (LA7_0==NAME||LA7_0==ERRORNAME) ) {
                        alt7=1;
                    }
                    switch (alt7) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:26: name= ( ERRORNAME | NAME )
                            name=this.input.LT(1);
                            if ( this.input.LA(1)==NAME||this.input.LA(1)==ERRORNAME ) {
                                this.input.consume();
                                if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(name));
                                this.state.errorRecovery=false;this.state.failed=false;
                            }
                            else {
                                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                throw mse;
                            }



                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:52: ( ( WHITESPACE1 )? em= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( ERRORNAME | NAME | INT ) )*
                    loop11:
                    do {
                        var alt11=2;
                        var LA11_0 = this.input.LA(1);

                        if ( (LA11_0==COLON) ) {
                            switch ( this.input.LA(2) ) {
                            case INT:
                                var LA11_4 = this.input.LA(3);

                                if ( (this.synpred40_JSExpr()) ) {
                                    alt11=1;
                                }


                                break;
                            case SINGLEQUOT_STRING:
                                var LA11_5 = this.input.LA(3);

                                if ( (LA11_5==NAME||LA11_5==ERRORNAME) ) {
                                    var LA11_8 = this.input.LA(4);

                                    if ( (this.synpred40_JSExpr()) ) {
                                        alt11=1;
                                    }


                                }
                                else if ( (LA11_5==INT) ) {
                                    alt11=1;
                                }


                                break;
                            case NAME:
                                var LA11_6 = this.input.LA(3);

                                if ( (this.synpred40_JSExpr()) ) {
                                    alt11=1;
                                }


                                break;
                            case ERRORNAME:
                                var LA11_7 = this.input.LA(3);

                                if ( (this.synpred40_JSExpr()) ) {
                                    alt11=1;
                                }


                                break;
                            case WHITESPACE1:
                                alt11=1;
                                break;

                            }

                        }
                        else if ( (LA11_0==WHITESPACE1) ) {
                            alt11=1;
                        }


                        switch (alt11) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:53: ( WHITESPACE1 )? em= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( ERRORNAME | NAME | INT )
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:53: ( WHITESPACE1 )?
                            var alt8=2;
                            var LA8_0 = this.input.LA(1);

                            if ( (LA8_0==WHITESPACE1) ) {
                                alt8=1;
                            }
                            switch (alt8) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                                    WHITESPACE114=this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_atom756); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    WHITESPACE114_tree = this.adaptor.create(WHITESPACE114);
                                    this.adaptor.addChild(root_0, WHITESPACE114_tree);
                                    }


                                    break;

                            }

                            em=this.match(this.input,COLON,JSExprParser.FOLLOW_COLON_in_atom761); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            em_tree = this.adaptor.create(em);
                            this.adaptor.addChild(root_0, em_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:75: ( WHITESPACE1 )?
                            var alt9=2;
                            var LA9_0 = this.input.LA(1);

                            if ( (LA9_0==WHITESPACE1) ) {
                                alt9=1;
                            }
                            switch (alt9) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                                    WHITESPACE115=this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_atom763); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    WHITESPACE115_tree = this.adaptor.create(WHITESPACE115);
                                    this.adaptor.addChild(root_0, WHITESPACE115_tree);
                                    }


                                    break;

                            }

                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:88: (x2= SINGLEQUOT_STRING )?
                            var alt10=2;
                            var LA10_0 = this.input.LA(1);

                            if ( (LA10_0==SINGLEQUOT_STRING) ) {
                                alt10=1;
                            }
                            switch (alt10) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:89: x2= SINGLEQUOT_STRING
                                    x2=this.match(this.input,SINGLEQUOT_STRING,JSExprParser.FOLLOW_SINGLEQUOT_STRING_in_atom769); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    x2_tree = this.adaptor.create(x2);
                                    this.adaptor.addChild(root_0, x2_tree);
                                    }


                                    break;

                            }

                            endName=this.input.LT(1);
                            if ( this.input.LA(1)==INT||this.input.LA(1)==NAME||this.input.LA(1)==ERRORNAME ) {
                                this.input.consume();
                                if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(endName));
                                this.state.errorRecovery=false;this.state.failed=false;
                            }
                            else {
                                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                throw mse;
                            }

                            if ( this.state.backtracking===0 ) {

                                	if(!this._tmpText)
                                		this._tmpText = "";
                                	
                              	if((em?em.getText():null))
                              	      this._tmpText += (em?em.getText():null);
                              	if((x2?x2.getText():null))
                              	      this._tmpText += (x2?x2.getText():null);
                              	if((endName?endName.getText():null))
                              	      this._tmpText += (endName?endName.getText():null);
                                	em = x2 = endName = null;
                                	
                            }


                            break;

                        default :
                            break loop11;
                        }
                    } while (true);

                    if ( this.state.backtracking===0 ) {

                        	
                          	if((name?name.getText():null)){
                      	        var text = (x?x.getText():null) + (name?name.getText():null);
                      	        if(this._tmpText){   
                      		    text += this._tmpText;
                      		    this._tmpText = "";
                      		}
                      	        var startIndex = x.getCharPositionInLine();
                      	        var token = this.tokenMgr.newRefToken(text,this.cell,this.sheetName,this.formula.length, startIndex);
                      	        this.formula += token.getToken();
                      		if(token._error)
                      			this.errMsg = token._error;
                      		retval.value = token;
                      	}else{
                      		    var text =  (x?x.getText():null);
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
                         		    
                      		    retval.value = token;
                      		}
                          
                    }


                    break;
                case 6 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:234:5: DOUBLEQUOT_STRING
                    root_0 = this.adaptor.nil();

                    DOUBLEQUOT_STRING16=this.match(this.input,DOUBLEQUOT_STRING,JSExprParser.FOLLOW_DOUBLEQUOT_STRING_in_atom791); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    DOUBLEQUOT_STRING16_tree = this.adaptor.create(DOUBLEQUOT_STRING16);
                    this.adaptor.addChild(root_0, DOUBLEQUOT_STRING16_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                        		var token = this.tokenMgr.newDoubleQuoteStrToken((DOUBLEQUOT_STRING16?DOUBLEQUOT_STRING16.getText():null));
                        		this.formula += "\"" + token.getToken() + "\"";
                        		retval.value = token;
                          
                    }


                    break;
                case 7 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:239:5: (brace= P_OPEN ) ( expr P_CLOSE )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:239:5: (brace= P_OPEN )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:239:6: brace= P_OPEN
                    brace=this.match(this.input,P_OPEN,JSExprParser.FOLLOW_P_OPEN_in_atom812); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    brace_tree = this.adaptor.create(brace);
                    this.adaptor.addChild(root_0, brace_tree);
                    }



                    if ( this.state.backtracking===0 ) {
                       
                              this.temp.push("(");
                              var index = brace.getCharPositionInLine(); // what's the diff bt getBraceIndex and getCharPositionInLine?
                              var redundant = false;
                              for (var i = 0; i < this.bracketList.length; ++i) {
                                  if (this.bracketList[i] == index) {
                                      redundant = true;
                                      break;
                                  }
                              }
                              if (!redundant) this.formula += "(";  
                          
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:251:5: ( expr P_CLOSE )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:251:6: expr P_CLOSE
                    this.pushFollow(JSExprParser.FOLLOW_expr_in_atom822);
                    expr17=this.expr();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, expr17.getTree());
                    P_CLOSE18=this.match(this.input,P_CLOSE,JSExprParser.FOLLOW_P_CLOSE_in_atom824); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    P_CLOSE18_tree = this.adaptor.create(P_CLOSE18);
                    this.adaptor.addChild(root_0, P_CLOSE18_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                          	var tokenList = this.tokenMgr.newBracketTokenList((expr17!==null?expr17.value:null),brace.getStartIndex(),this.cell,this.errMsg,this.bracketList);
                          	if(tokenList._error)this.errMsg = tokenList._error; 
                        		retval.value = tokenList;
                              if(this.temp[this.temp.length - 1] == "("){
                                  this.temp.pop();
                           	}
                           	if (!tokenList.getRedundant()) this.formula += ")";
                           
                    }





                    break;
                case 8 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:260:5: folded
                    root_0 = this.adaptor.nil();

                    this.pushFollow(JSExprParser.FOLLOW_folded_in_atom833);
                    folded19=this.folded();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, folded19.getTree());
                    if ( this.state.backtracking===0 ) {
                      retval.value = (folded19!==null?folded19.value:null);
                    }


                    break;
                case 9 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:262:5: ( ARRAY_FORMULAR_START ) (firToken= atom ) ( (sep= ( ARG_SEP | '|' ) ) (token= atom ) )* ( ARRAY_FORMULAR_END )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:262:5: ( ARRAY_FORMULAR_START )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:262:6: ARRAY_FORMULAR_START
                    ARRAY_FORMULAR_START20=this.match(this.input,ARRAY_FORMULAR_START,JSExprParser.FOLLOW_ARRAY_FORMULAR_START_in_atom845); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    ARRAY_FORMULAR_START20_tree = this.adaptor.create(ARRAY_FORMULAR_START20);
                    this.adaptor.addChild(root_0, ARRAY_FORMULAR_START20_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                        	this.inConstArray++;
                        	var startpos = this.formula.length;
                        	this.formula += "{";   // left sign of constant-array formula
                         
                    }



                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:267:4: (firToken= atom )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:267:5: firToken= atom
                    this.pushFollow(JSExprParser.FOLLOW_atom_in_atom857);
                    firToken=this.atom();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, firToken.getTree());
                    if ( this.state.backtracking===0 ) {
                      	
                         	var tokenSource = this.input.getTokenSource();
                         	var object = this.tokenMgr.getConstantArrayObject(firToken, tokenSource);
                        	var array = [[object]];
                      	var firColLen = 0;
                        	var colLen = 0;
                        	var rowLen = 0;
                         
                    }



                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:275:4: ( (sep= ( ARG_SEP | '|' ) ) (token= atom ) )*
                    loop12:
                    do {
                        var alt12=2;
                        var LA12_0 = this.input.LA(1);

                        if ( (LA12_0==ARG_SEP||LA12_0==56) ) {
                            alt12=1;
                        }


                        switch (alt12) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:275:5: (sep= ( ARG_SEP | '|' ) ) (token= atom )
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:275:5: (sep= ( ARG_SEP | '|' ) )
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:275:6: sep= ( ARG_SEP | '|' )
                            sep=this.input.LT(1);
                            if ( this.input.LA(1)==ARG_SEP||this.input.LA(1)==56 ) {
                                this.input.consume();
                                if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(sep));
                                this.state.errorRecovery=false;this.state.failed=false;
                            }
                            else {
                                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                throw mse;
                            }

                            if ( this.state.backtracking===0 ) {
                              	
                                 	var speText = sep.getText();
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
                                 
                            }



                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:292:4: (token= atom )
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:292:5: token= atom
                            this.pushFollow(JSExprParser.FOLLOW_atom_in_atom888);
                            token=this.atom();

                            this.state._fsp--;
                            if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, token.getTree());
                            if ( this.state.backtracking===0 ) {

                              	object = this.tokenMgr.getConstantArrayObject(token, tokenSource);
                              	if (!array[rowLen])
                              		array[rowLen] = [];
                              	array[rowLen].push(object);
                                  
                            }





                            break;

                        default :
                            break loop12;
                        }
                    } while (true);

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:298:4: ( ARRAY_FORMULAR_END )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:298:5: ARRAY_FORMULAR_END
                    ARRAY_FORMULAR_END21=this.match(this.input,ARRAY_FORMULAR_END,JSExprParser.FOLLOW_ARRAY_FORMULAR_END_in_atom900); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    ARRAY_FORMULAR_END21_tree = this.adaptor.create(ARRAY_FORMULAR_END21);
                    this.adaptor.addChild(root_0, ARRAY_FORMULAR_END21_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                         	this.inConstArray--;
                         	if (array.length == 1)
                         		array = array[0];
                         	this.formula += "}";
                         	
                      	var text = this.formula.substr(startpos);
                         	var token = this.tokenMgr.newConstantArrayToken(array, text);
                        	retval.value = token;
                         
                    }





                    break;
                case 10 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:5: (name= ( ERRORNAME | NAME ) (name1= ( ERRORNAME | NAME ) )? ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? name2= ( ERRORNAME | NAME | INT ) (name3= ( ERRORNAME | NAME ) )? )* )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:5: (name= ( ERRORNAME | NAME ) (name1= ( ERRORNAME | NAME ) )? ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? name2= ( ERRORNAME | NAME | INT ) (name3= ( ERRORNAME | NAME ) )? )* )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:6: name= ( ERRORNAME | NAME ) (name1= ( ERRORNAME | NAME ) )? ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? name2= ( ERRORNAME | NAME | INT ) (name3= ( ERRORNAME | NAME ) )? )*
                    name=this.input.LT(1);
                    if ( this.input.LA(1)==NAME||this.input.LA(1)==ERRORNAME ) {
                        this.input.consume();
                        if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(name));
                        this.state.errorRecovery=false;this.state.failed=false;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                        throw mse;
                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:30: (name1= ( ERRORNAME | NAME ) )?
                    var alt13=2;
                    var LA13_0 = this.input.LA(1);

                    if ( (LA13_0==NAME||LA13_0==ERRORNAME) ) {
                        alt13=1;
                    }
                    switch (alt13) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:31: name1= ( ERRORNAME | NAME )
                            name1=this.input.LT(1);
                            if ( this.input.LA(1)==NAME||this.input.LA(1)==ERRORNAME ) {
                                this.input.consume();
                                if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(name1));
                                this.state.errorRecovery=false;this.state.failed=false;
                            }
                            else {
                                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                throw mse;
                            }



                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:58: ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? name2= ( ERRORNAME | NAME | INT ) (name3= ( ERRORNAME | NAME ) )? )*
                    loop17:
                    do {
                        var alt17=2;
                        var LA17_0 = this.input.LA(1);

                        if ( (LA17_0==COLON) ) {
                            switch ( this.input.LA(2) ) {
                            case INT:
                                var LA17_4 = this.input.LA(3);

                                if ( (this.synpred57_JSExpr()) ) {
                                    alt17=1;
                                }


                                break;
                            case NAME:
                                var LA17_5 = this.input.LA(3);

                                if ( (this.synpred57_JSExpr()) ) {
                                    alt17=1;
                                }


                                break;
                            case ERRORNAME:
                                var LA17_6 = this.input.LA(3);

                                if ( (this.synpred57_JSExpr()) ) {
                                    alt17=1;
                                }


                                break;
                            case WHITESPACE1:
                                alt17=1;
                                break;

                            }

                        }
                        else if ( (LA17_0==WHITESPACE1) ) {
                            alt17=1;
                        }


                        switch (alt17) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:59: ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? name2= ( ERRORNAME | NAME | INT ) (name3= ( ERRORNAME | NAME ) )?
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:59: ( WHITESPACE1 )?
                            var alt14=2;
                            var LA14_0 = this.input.LA(1);

                            if ( (LA14_0==WHITESPACE1) ) {
                                alt14=1;
                            }
                            switch (alt14) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                                    WHITESPACE122=this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_atom936); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    WHITESPACE122_tree = this.adaptor.create(WHITESPACE122);
                                    this.adaptor.addChild(root_0, WHITESPACE122_tree);
                                    }


                                    break;

                            }

                            m=this.match(this.input,COLON,JSExprParser.FOLLOW_COLON_in_atom941); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            m_tree = this.adaptor.create(m);
                            this.adaptor.addChild(root_0, m_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:80: ( WHITESPACE1 )?
                            var alt15=2;
                            var LA15_0 = this.input.LA(1);

                            if ( (LA15_0==WHITESPACE1) ) {
                                alt15=1;
                            }
                            switch (alt15) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                                    WHITESPACE123=this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_atom943); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    WHITESPACE123_tree = this.adaptor.create(WHITESPACE123);
                                    this.adaptor.addChild(root_0, WHITESPACE123_tree);
                                    }


                                    break;

                            }

                            name2=this.input.LT(1);
                            if ( this.input.LA(1)==INT||this.input.LA(1)==NAME||this.input.LA(1)==ERRORNAME ) {
                                this.input.consume();
                                if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(name2));
                                this.state.errorRecovery=false;this.state.failed=false;
                            }
                            else {
                                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                throw mse;
                            }

                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:122: (name3= ( ERRORNAME | NAME ) )?
                            var alt16=2;
                            var LA16_0 = this.input.LA(1);

                            if ( (LA16_0==NAME||LA16_0==ERRORNAME) ) {
                                alt16=1;
                            }
                            switch (alt16) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:123: name3= ( ERRORNAME | NAME )
                                    name3=this.input.LT(1);
                                    if ( this.input.LA(1)==NAME||this.input.LA(1)==ERRORNAME ) {
                                        this.input.consume();
                                        if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(name3));
                                        this.state.errorRecovery=false;this.state.failed=false;
                                    }
                                    else {
                                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                        throw mse;
                                    }



                                    break;

                            }

                            if ( this.state.backtracking===0 ) {

                                	if(!this._tmpText)
                                		this._tmpText = "";
                                	
                              	if((m?m.getText():null))
                              	      this._tmpText += (m?m.getText():null);
                              	if((name2?name2.getText():null))
                              	      this._tmpText += (name2?name2.getText():null);
                              	if((name3?name3.getText():null))
                              	      this._tmpText += (name3?name3.getText():null);
                                	m = name2 = name3 = null;
                                	
                            }


                            break;

                        default :
                            break loop17;
                        }
                    } while (true);




                    if ( this.state.backtracking===0 ) {

                          var text = (name?name.getText():null);
                          var startIndex = name.getCharPositionInLine();
                          if((name1?name1.getText():null))
                      	text += (name1?name1.getText():null);   
                          if(this._tmpText){   
                          	text += this._tmpText;
                          	this._tmpText = "";
                          }
                          var token = this.tokenMgr.newRefToken(text,this.cell,this.sheetName,this.formula.length, startIndex);
                          this.formula += token.getToken();
                          if(token._error && (this.inConstArray == 0))this.errMsg = token._error;
                          retval.value = token;
                        
                    }


                    break;

            }
            retval.stop = this.input.LT(-1);

            if ( this.state.backtracking===0 ) {

            retval.tree = this.adaptor.rulePostProcessing(root_0);
            this.adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (re) {
            if (re instanceof org.antlr.runtime.RecognitionException) {
                this.reportError(re);
                this.recover(this.input,re);
                retval.tree = this.adaptor.errorNode(this.input, retval.start, this.input.LT(-1), re);
            } else {
                throw re;
            }
        }
        finally {
            if ( this.state.backtracking>0 ) { this.memoize(this.input, 3, atom_StartIndex); }
        }
        return retval;
    },

    // inline static return class
    atom_list_return: (function() {
        JSExprParser.atom_list_return = function(){};
        org.antlr.lang.extend(JSExprParser.atom_list_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:336:1: atom_list returns [String value] : a= atom_type ( ( ARG_SEP n= atom_type )* | ( ARG_SEP_WRONG n= atom_type )* ) ;
    // $ANTLR start "atom_list"
    atom_list: function() {
        var retval = new JSExprParser.atom_list_return();
        retval.start = this.input.LT(1);
        var atom_list_StartIndex = this.input.index();
        var root_0 = null;

        var ARG_SEP24 = null;
        var ARG_SEP_WRONG25 = null;
         var a = null;
         var n = null;

        var ARG_SEP24_tree=null;
        var ARG_SEP_WRONG25_tree=null;

        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 4) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:337:2: (a= atom_type ( ( ARG_SEP n= atom_type )* | ( ARG_SEP_WRONG n= atom_type )* ) )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:337:4: a= atom_type ( ( ARG_SEP n= atom_type )* | ( ARG_SEP_WRONG n= atom_type )* )
            root_0 = this.adaptor.nil();

            this.pushFollow(JSExprParser.FOLLOW_atom_type_in_atom_list992);
            a=this.atom_type();

            this.state._fsp--;
            if (this.state.failed) return retval;
            if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, a.getTree());
            if ( this.state.backtracking===0 ) {

                	var atomList = this.tokenMgr.newFuncParamsTokenList((a!==null?a.value:null),this.cell);
                	retval.value = atomList;
                	this.funcArgIndex[this.funcArgIndex.length - 1]++;
                
            }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:341:4: ( ( ARG_SEP n= atom_type )* | ( ARG_SEP_WRONG n= atom_type )* )
            var alt21=2;
            switch ( this.input.LA(1) ) {
            case ARG_SEP:
                alt21=1;
                break;
            case P_CLOSE:
                var LA21_2 = this.input.LA(2);

                if ( (this.synpred59_JSExpr()) ) {
                    alt21=1;
                }
                else if ( (true) ) {
                    alt21=2;
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                    var nvae =
                        new org.antlr.runtime.NoViableAltException("", 21, 2, this.input);

                    throw nvae;
                }
                break;
            case EOF:
                var LA21_3 = this.input.LA(2);

                if ( (this.synpred59_JSExpr()) ) {
                    alt21=1;
                }
                else if ( (true) ) {
                    alt21=2;
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                    var nvae =
                        new org.antlr.runtime.NoViableAltException("", 21, 3, this.input);

                    throw nvae;
                }
                break;
            case ARG_SEP_WRONG:
                alt21=2;
                break;
            default:
                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                var nvae =
                    new org.antlr.runtime.NoViableAltException("", 21, 0, this.input);

                throw nvae;
            }

            switch (alt21) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:341:5: ( ARG_SEP n= atom_type )*
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:341:5: ( ARG_SEP n= atom_type )*
                    loop19:
                    do {
                        var alt19=2;
                        var LA19_0 = this.input.LA(1);

                        if ( (LA19_0==ARG_SEP) ) {
                            alt19=1;
                        }


                        switch (alt19) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:341:6: ARG_SEP n= atom_type
                            ARG_SEP24=this.match(this.input,ARG_SEP,JSExprParser.FOLLOW_ARG_SEP_in_atom_list997); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            ARG_SEP24_tree = this.adaptor.create(ARG_SEP24);
                            this.adaptor.addChild(root_0, ARG_SEP24_tree);
                            }
                            if ( this.state.backtracking===0 ) {
                               this.formula += ";";
                            }
                            this.pushFollow(JSExprParser.FOLLOW_atom_type_in_atom_list1003);
                            n=this.atom_type();

                            this.state._fsp--;
                            if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, n.getTree());
                            if ( this.state.backtracking===0 ) {

                                			atomList.push((n!==null?n.value:null));
                                			(n!==null?n.value:null).setParent(atomList);
                                			this.funcArgIndex[this.funcArgIndex.length - 1]++; 
                                      
                            }


                            break;

                        default :
                            break loop19;
                        }
                    } while (true);



                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:346:6: ( ARG_SEP_WRONG n= atom_type )*
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:346:6: ( ARG_SEP_WRONG n= atom_type )*
                    loop20:
                    do {
                        var alt20=2;
                        var LA20_0 = this.input.LA(1);

                        if ( (LA20_0==ARG_SEP_WRONG) ) {
                            alt20=1;
                        }


                        switch (alt20) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:346:7: ARG_SEP_WRONG n= atom_type
                            ARG_SEP_WRONG25=this.match(this.input,ARG_SEP_WRONG,JSExprParser.FOLLOW_ARG_SEP_WRONG_in_atom_list1015); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            ARG_SEP_WRONG25_tree = this.adaptor.create(ARG_SEP_WRONG25);
                            this.adaptor.addChild(root_0, ARG_SEP_WRONG25_tree);
                            }
                            if ( this.state.backtracking===0 ) {
                              this.formula = this.cell.getRawValue();
                            }
                            this.pushFollow(JSExprParser.FOLLOW_atom_type_in_atom_list1020);
                            n=this.atom_type();

                            this.state._fsp--;
                            if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, n.getTree());
                            if ( this.state.backtracking===0 ) {

                                			atomList.push((n!==null?n.value:null));
                                			(n!==null?n.value:null).setParent(atomList); 
                                			throw websheet.Constant.ERRORCODE["508"];
                                      
                            }


                            break;

                        default :
                            break loop20;
                        }
                    } while (true);



                    break;

            }




            retval.stop = this.input.LT(-1);

            if ( this.state.backtracking===0 ) {

            retval.tree = this.adaptor.rulePostProcessing(root_0);
            this.adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (re) {
            if (re instanceof org.antlr.runtime.RecognitionException) {
                this.reportError(re);
                this.recover(this.input,re);
                retval.tree = this.adaptor.errorNode(this.input, retval.start, this.input.LT(-1), re);
            } else {
                throw re;
            }
        }
        finally {
            if ( this.state.backtracking>0 ) { this.memoize(this.input, 4, atom_list_StartIndex); }
        }
        return retval;
    },

    // inline static return class
    atom_type_return: (function() {
        JSExprParser.atom_type_return = function(){};
        org.antlr.lang.extend(JSExprParser.atom_type_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:353:1: atom_type returns [String value] : ( expr | );
    // $ANTLR start "atom_type"
    atom_type: function() {
        var retval = new JSExprParser.atom_type_return();
        retval.start = this.input.LT(1);
        var atom_type_StartIndex = this.input.index();
        var root_0 = null;

         var expr26 = null;


        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 5) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:354:2: ( expr | )
            var alt22=2;
            var LA22_0 = this.input.LA(1);

            if ( (LA22_0==PLUS||LA22_0==MINUS||LA22_0==P_OPEN||LA22_0==ARRAY_FORMULAR_START||LA22_0==INT||(LA22_0>=NAME && LA22_0<=FUNC)) ) {
                alt22=1;
            }
            else if ( (LA22_0==EOF||(LA22_0>=P_CLOSE && LA22_0<=ARG_SEP_WRONG)) ) {
                alt22=2;
            }
            else {
                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                var nvae =
                    new org.antlr.runtime.NoViableAltException("", 22, 0, this.input);

                throw nvae;
            }
            switch (alt22) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:354:4: expr
                    root_0 = this.adaptor.nil();

                    this.pushFollow(JSExprParser.FOLLOW_expr_in_atom_type1043);
                    expr26=this.expr();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, expr26.getTree());
                    if ( this.state.backtracking===0 ) {
                      retval.value =(expr26!==null?expr26.value:null);
                    }


                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:355:4: 
                    root_0 = this.adaptor.nil();

                    if ( this.state.backtracking===0 ) {

                            //if(this.isIgnoreNoneParamsError){
                                var token = this.tokenMgr.newNoneToken();
                                retval.value = token;
                            //}else{
                            //  throw websheet.Constant.ERRORCODE["511"];   
                            //}
                        
                    }


                    break;

            }
            retval.stop = this.input.LT(-1);

            if ( this.state.backtracking===0 ) {

            retval.tree = this.adaptor.rulePostProcessing(root_0);
            this.adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (re) {
            if (re instanceof org.antlr.runtime.RecognitionException) {
                this.reportError(re);
                this.recover(this.input,re);
                retval.tree = this.adaptor.errorNode(this.input, retval.start, this.input.LT(-1), re);
            } else {
                throw re;
            }
        }
        finally {
            if ( this.state.backtracking>0 ) { this.memoize(this.input, 5, atom_type_StartIndex); }
        }
        return retval;
    },

    // inline static return class
    folded_return: (function() {
        JSExprParser.folded_return = function(){};
        org.antlr.lang.extend(JSExprParser.folded_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:375:1: folded returns [String value] : ( (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' ) ( ')' ) | (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' ) range ')' );
    // $ANTLR start "folded"
    folded: function() {
        var retval = new JSExprParser.folded_return();
        retval.start = this.input.LT(1);
        var folded_StartIndex = this.input.index();
        var root_0 = null;

        var f = null;
        var b = null;
        var WHITESPACE127 = null;
        var char_literal28 = null;
        var WHITESPACE129 = null;
        var char_literal31 = null;
         var range30 = null;

        var f_tree=null;
        var b_tree=null;
        var WHITESPACE127_tree=null;
        var char_literal28_tree=null;
        var WHITESPACE129_tree=null;
        var char_literal31_tree=null;

        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 6) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:3: ( (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' ) ( ')' ) | (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' ) range ')' )
            var alt27=2;
            var LA27_0 = this.input.LA(1);

            if ( (LA27_0==FUNC) ) {
                var LA27_1 = this.input.LA(2);

                if ( (LA27_1==P_CLOSE) ) {
                    var LA27_3 = this.input.LA(3);

                    if ( (this.synpred64_JSExpr()) ) {
                        alt27=1;
                    }
                    else if ( (true) ) {
                        alt27=2;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 27, 3, this.input);

                        throw nvae;
                    }
                }
                else if ( (LA27_1==PLUS||LA27_1==MINUS||LA27_1==P_OPEN||(LA27_1>=ARG_SEP && LA27_1<=ARG_SEP_WRONG)||LA27_1==ARRAY_FORMULAR_START||LA27_1==INT||(LA27_1>=NAME && LA27_1<=FUNC)) ) {
                    alt27=2;
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                    var nvae =
                        new org.antlr.runtime.NoViableAltException("", 27, 1, this.input);

                    throw nvae;
                }
            }
            else if ( (LA27_0==NAME) ) {
                var LA27_2 = this.input.LA(2);

                if ( (LA27_2==WHITESPACE1) ) {
                    var LA27_5 = this.input.LA(3);

                    if ( (LA27_5==P_OPEN) ) {
                        var LA27_6 = this.input.LA(4);

                        if ( (LA27_6==P_CLOSE) ) {
                            var LA27_3 = this.input.LA(5);

                            if ( (this.synpred64_JSExpr()) ) {
                                alt27=1;
                            }
                            else if ( (true) ) {
                                alt27=2;
                            }
                            else {
                                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var nvae =
                                    new org.antlr.runtime.NoViableAltException("", 27, 3, this.input);

                                throw nvae;
                            }
                        }
                        else if ( (LA27_6==PLUS||LA27_6==MINUS||LA27_6==P_OPEN||(LA27_6>=ARG_SEP && LA27_6<=ARG_SEP_WRONG)||LA27_6==ARRAY_FORMULAR_START||LA27_6==INT||(LA27_6>=NAME && LA27_6<=FUNC)) ) {
                            alt27=2;
                        }
                        else {
                            if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                            var nvae =
                                new org.antlr.runtime.NoViableAltException("", 27, 6, this.input);

                            throw nvae;
                        }
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 27, 5, this.input);

                        throw nvae;
                    }
                }
                else if ( (LA27_2==P_OPEN) ) {
                    var LA27_6 = this.input.LA(3);

                    if ( (LA27_6==P_CLOSE) ) {
                        var LA27_3 = this.input.LA(4);

                        if ( (this.synpred64_JSExpr()) ) {
                            alt27=1;
                        }
                        else if ( (true) ) {
                            alt27=2;
                        }
                        else {
                            if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                            var nvae =
                                new org.antlr.runtime.NoViableAltException("", 27, 3, this.input);

                            throw nvae;
                        }
                    }
                    else if ( (LA27_6==PLUS||LA27_6==MINUS||LA27_6==P_OPEN||(LA27_6>=ARG_SEP && LA27_6<=ARG_SEP_WRONG)||LA27_6==ARRAY_FORMULAR_START||LA27_6==INT||(LA27_6>=NAME && LA27_6<=FUNC)) ) {
                        alt27=2;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 27, 6, this.input);

                        throw nvae;
                    }
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                    var nvae =
                        new org.antlr.runtime.NoViableAltException("", 27, 2, this.input);

                    throw nvae;
                }
            }
            else {
                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                var nvae =
                    new org.antlr.runtime.NoViableAltException("", 27, 0, this.input);

                throw nvae;
            }
            switch (alt27) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:5: (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' ) ( ')' )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:5: (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' )
                    var alt24=2;
                    var LA24_0 = this.input.LA(1);

                    if ( (LA24_0==FUNC) ) {
                        alt24=1;
                    }
                    else if ( (LA24_0==NAME) ) {
                        alt24=2;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 24, 0, this.input);

                        throw nvae;
                    }
                    switch (alt24) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:6: f= FUNC
                            f=this.match(this.input,FUNC,JSExprParser.FOLLOW_FUNC_in_folded1077); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            f_tree = this.adaptor.create(f);
                            this.adaptor.addChild(root_0, f_tree);
                            }


                            break;
                        case 2 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:17: f= NAME ( WHITESPACE1 )? b= '('
                            f=this.match(this.input,NAME,JSExprParser.FOLLOW_NAME_in_folded1085); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            f_tree = this.adaptor.create(f);
                            this.adaptor.addChild(root_0, f_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:26: ( WHITESPACE1 )?
                            var alt23=2;
                            var LA23_0 = this.input.LA(1);

                            if ( (LA23_0==WHITESPACE1) ) {
                                alt23=1;
                            }
                            switch (alt23) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                                    WHITESPACE127=this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_folded1087); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    WHITESPACE127_tree = this.adaptor.create(WHITESPACE127);
                                    this.adaptor.addChild(root_0, WHITESPACE127_tree);
                                    }


                                    break;

                            }

                            b=this.match(this.input,P_OPEN,JSExprParser.FOLLOW_P_OPEN_in_folded1094); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            b_tree = this.adaptor.create(b);
                            this.adaptor.addChild(root_0, b_tree);
                            }


                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:49: ( ')' )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:50: ')'
                    char_literal28=this.match(this.input,P_CLOSE,JSExprParser.FOLLOW_P_CLOSE_in_folded1099); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    char_literal28_tree = this.adaptor.create(char_literal28);
                    this.adaptor.addChild(root_0, char_literal28_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                       				var text = f.getText();
                                      var importedFN;
                                 	 	if((b?b.getText():null))
                                       	importedFN = text.toUpperCase();
                                      else
                                      	importedFN = text.substring(0,text.length - 1).toUpperCase();
                                      var lName = websheet.functions.Util.FormulaPrefixS2LMap[importedFN] || importedFN;              
                                      this.formula += lName;
                                      var tokenList = this.tokenMgr.newFuncTokenList(undefined,importedFN,this.cell,this.errMsg);
                      		  		if(tokenList._error){
                      	  				this.errMsg = tokenList._error;
                      		  		}else if(tokenList._error == null)this.errMsg = null;
                                      retval.value = tokenList;
                                      this.formula += "()";
                                
                    }





                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:392:5: (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' ) range ')'
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:392:5: (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' )
                    var alt26=2;
                    var LA26_0 = this.input.LA(1);

                    if ( (LA26_0==FUNC) ) {
                        alt26=1;
                    }
                    else if ( (LA26_0==NAME) ) {
                        alt26=2;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 26, 0, this.input);

                        throw nvae;
                    }
                    switch (alt26) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:392:6: f= FUNC
                            f=this.match(this.input,FUNC,JSExprParser.FOLLOW_FUNC_in_folded1116); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            f_tree = this.adaptor.create(f);
                            this.adaptor.addChild(root_0, f_tree);
                            }


                            break;
                        case 2 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:392:17: f= NAME ( WHITESPACE1 )? b= '('
                            f=this.match(this.input,NAME,JSExprParser.FOLLOW_NAME_in_folded1124); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            f_tree = this.adaptor.create(f);
                            this.adaptor.addChild(root_0, f_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:392:26: ( WHITESPACE1 )?
                            var alt25=2;
                            var LA25_0 = this.input.LA(1);

                            if ( (LA25_0==WHITESPACE1) ) {
                                alt25=1;
                            }
                            switch (alt25) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                                    WHITESPACE129=this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_folded1126); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    WHITESPACE129_tree = this.adaptor.create(WHITESPACE129);
                                    this.adaptor.addChild(root_0, WHITESPACE129_tree);
                                    }


                                    break;

                            }

                            b=this.match(this.input,P_OPEN,JSExprParser.FOLLOW_P_OPEN_in_folded1133); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            b_tree = this.adaptor.create(b);
                            this.adaptor.addChild(root_0, b_tree);
                            }


                            break;

                    }

                    if ( this.state.backtracking===0 ) {

                                 	 	var text = f.getText();
                                 	 	var importedFN;
                                 	 	if((b?b.getText():null))
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
                    this.pushFollow(JSExprParser.FOLLOW_range_in_folded1164);
                    range30=this.range();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, range30.getTree());
                    char_literal31=this.match(this.input,P_CLOSE,JSExprParser.FOLLOW_P_CLOSE_in_folded1166); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    char_literal31_tree = this.adaptor.create(char_literal31);
                    this.adaptor.addChild(root_0, char_literal31_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                                      var tokenList = this.tokenMgr.newFuncTokenList((range30!==null?range30.value:null),importedFN,this.cell,this.errMsg);
                                      if(tokenList._error){
                                      	this.errMsg = tokenList._error;
                                      }else if(tokenList._error == null)this.errMsg = null;
                                      retval.value = tokenList;
                                      if(this.temp[this.temp.length - 1] == "("){
                                         this.temp.pop();
                                      }
                                      this.formula += ")";
                                      this.funcStack.pop();
                                      this.funcArgIndex.pop();
                                  
                    }


                    break;

            }
            retval.stop = this.input.LT(-1);

            if ( this.state.backtracking===0 ) {

            retval.tree = this.adaptor.rulePostProcessing(root_0);
            this.adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (re) {
            if (re instanceof org.antlr.runtime.RecognitionException) {
                this.reportError(re);
                this.recover(this.input,re);
                retval.tree = this.adaptor.errorNode(this.input, retval.start, this.input.LT(-1), re);
            } else {
                throw re;
            }
        }
        finally {
            if ( this.state.backtracking>0 ) { this.memoize(this.input, 6, folded_StartIndex); }
        }
        return retval;
    },

    // inline static return class
    range_return: (function() {
        JSExprParser.range_return = function(){};
        org.antlr.lang.extend(JSExprParser.range_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:426:1: range returns [String value] : (params= atom_list | funct= folded );
    // $ANTLR start "range"
    range: function() {
        var retval = new JSExprParser.range_return();
        retval.start = this.input.LT(1);
        var range_StartIndex = this.input.index();
        var root_0 = null;

         var params = null;
         var funct = null;


        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 7) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:427:5: (params= atom_list | funct= folded )
            var alt28=2;
            alt28 = this.dfa28.predict(this.input);
            switch (alt28) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:427:7: params= atom_list
                    root_0 = this.adaptor.nil();

                    this.pushFollow(JSExprParser.FOLLOW_atom_list_in_range1191);
                    params=this.atom_list();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, params.getTree());
                    if ( this.state.backtracking===0 ) {

                              retval.value = (params!==null?params.value:null);
                          
                    }


                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:430:7: funct= folded
                    root_0 = this.adaptor.nil();

                    this.pushFollow(JSExprParser.FOLLOW_folded_in_range1205);
                    funct=this.folded();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, funct.getTree());
                    if ( this.state.backtracking===0 ) {
                      retval.value = (funct!==null?funct.value:null);
                    }


                    break;

            }
            retval.stop = this.input.LT(-1);

            if ( this.state.backtracking===0 ) {

            retval.tree = this.adaptor.rulePostProcessing(root_0);
            this.adaptor.setTokenBoundaries(retval.tree, retval.start, retval.stop);
            }
        }
        catch (re) {
            if (re instanceof org.antlr.runtime.RecognitionException) {
                this.reportError(re);
                this.recover(this.input,re);
                retval.tree = this.adaptor.errorNode(this.input, retval.start, this.input.LT(-1), re);
            } else {
                throw re;
            }
        }
        finally {
            if ( this.state.backtracking>0 ) { this.memoize(this.input, 7, range_StartIndex); }
        }
        return retval;
    },

    // $ANTLR start "synpred23_JSExpr"
    synpred23_JSExpr_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:125:10: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:125:10: m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | POW | CONCATENATION | INTERSECT | COLON ) b= expr
        m=this.input.LT(1);
        if ( (this.input.LA(1)>=COLON && this.input.LA(1)<=DIVEQUAL)||(this.input.LA(1)>=EQUAL && this.input.LA(1)<=NOTEQUAL2)||this.input.LA(1)==POW||this.input.LA(1)==MODEQUAL ) {
            this.input.consume();
            this.state.errorRecovery=false;this.state.failed=false;
        }
        else {
            if (this.state.backtracking>0) {this.state.failed=true; return ;}
            var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
            throw mse;
        }

        this.pushFollow(JSExprParser.FOLLOW_expr_in_synpred23_JSExpr612);
        b=this.expr();

        this.state._fsp--;
        if (this.state.failed) return ;


    },
    // $ANTLR end "synpred23_JSExpr",

    // $ANTLR start "synpred29_JSExpr"
    synpred29_JSExpr_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:154:15: ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? x2= ( INT | NAME ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:154:15: ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? x2= ( INT | NAME )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:154:15: ( WHITESPACE1 )?
        var alt29=2;
        var LA29_0 = this.input.LA(1);

        if ( (LA29_0==WHITESPACE1) ) {
            alt29=1;
        }
        switch (alt29) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_synpred29_JSExpr688); if (this.state.failed) return ;


                break;

        }

        m=this.match(this.input,COLON,JSExprParser.FOLLOW_COLON_in_synpred29_JSExpr693); if (this.state.failed) return ;
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:154:36: ( WHITESPACE1 )?
        var alt30=2;
        var LA30_0 = this.input.LA(1);

        if ( (LA30_0==WHITESPACE1) ) {
            alt30=1;
        }
        switch (alt30) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_synpred29_JSExpr695); if (this.state.failed) return ;


                break;

        }

        x2=this.input.LT(1);
        if ( this.input.LA(1)==INT||this.input.LA(1)==NAME ) {
            this.input.consume();
            this.state.errorRecovery=false;this.state.failed=false;
        }
        else {
            if (this.state.backtracking>0) {this.state.failed=true; return ;}
            var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
            throw mse;
        }



    },
    // $ANTLR end "synpred29_JSExpr",

    // $ANTLR start "synpred40_JSExpr"
    synpred40_JSExpr_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:53: ( ( WHITESPACE1 )? em= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( ERRORNAME | NAME | INT ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:53: ( WHITESPACE1 )? em= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( ERRORNAME | NAME | INT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:53: ( WHITESPACE1 )?
        var alt34=2;
        var LA34_0 = this.input.LA(1);

        if ( (LA34_0==WHITESPACE1) ) {
            alt34=1;
        }
        switch (alt34) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_synpred40_JSExpr756); if (this.state.failed) return ;


                break;

        }

        em=this.match(this.input,COLON,JSExprParser.FOLLOW_COLON_in_synpred40_JSExpr761); if (this.state.failed) return ;
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:75: ( WHITESPACE1 )?
        var alt35=2;
        var LA35_0 = this.input.LA(1);

        if ( (LA35_0==WHITESPACE1) ) {
            alt35=1;
        }
        switch (alt35) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_synpred40_JSExpr763); if (this.state.failed) return ;


                break;

        }

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:88: (x2= SINGLEQUOT_STRING )?
        var alt36=2;
        var LA36_0 = this.input.LA(1);

        if ( (LA36_0==SINGLEQUOT_STRING) ) {
            alt36=1;
        }
        switch (alt36) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:192:89: x2= SINGLEQUOT_STRING
                x2=this.match(this.input,SINGLEQUOT_STRING,JSExprParser.FOLLOW_SINGLEQUOT_STRING_in_synpred40_JSExpr769); if (this.state.failed) return ;


                break;

        }

        endName=this.input.LT(1);
        if ( this.input.LA(1)==INT||this.input.LA(1)==NAME||this.input.LA(1)==ERRORNAME ) {
            this.input.consume();
            this.state.errorRecovery=false;this.state.failed=false;
        }
        else {
            if (this.state.backtracking>0) {this.state.failed=true; return ;}
            var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
            throw mse;
        }



    },
    // $ANTLR end "synpred40_JSExpr",

    // $ANTLR start "synpred57_JSExpr"
    synpred57_JSExpr_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:59: ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? name2= ( ERRORNAME | NAME | INT ) (name3= ( ERRORNAME | NAME ) )? )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:59: ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? name2= ( ERRORNAME | NAME | INT ) (name3= ( ERRORNAME | NAME ) )?
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:59: ( WHITESPACE1 )?
        var alt43=2;
        var LA43_0 = this.input.LA(1);

        if ( (LA43_0==WHITESPACE1) ) {
            alt43=1;
        }
        switch (alt43) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_synpred57_JSExpr936); if (this.state.failed) return ;


                break;

        }

        m=this.match(this.input,COLON,JSExprParser.FOLLOW_COLON_in_synpred57_JSExpr941); if (this.state.failed) return ;
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:80: ( WHITESPACE1 )?
        var alt44=2;
        var LA44_0 = this.input.LA(1);

        if ( (LA44_0==WHITESPACE1) ) {
            alt44=1;
        }
        switch (alt44) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_synpred57_JSExpr943); if (this.state.failed) return ;


                break;

        }

        name2=this.input.LT(1);
        if ( this.input.LA(1)==INT||this.input.LA(1)==NAME||this.input.LA(1)==ERRORNAME ) {
            this.input.consume();
            this.state.errorRecovery=false;this.state.failed=false;
        }
        else {
            if (this.state.backtracking>0) {this.state.failed=true; return ;}
            var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
            throw mse;
        }

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:122: (name3= ( ERRORNAME | NAME ) )?
        var alt45=2;
        var LA45_0 = this.input.LA(1);

        if ( (LA45_0==NAME||LA45_0==ERRORNAME) ) {
            alt45=1;
        }
        switch (alt45) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:309:123: name3= ( ERRORNAME | NAME )
                name3=this.input.LT(1);
                if ( this.input.LA(1)==NAME||this.input.LA(1)==ERRORNAME ) {
                    this.input.consume();
                    this.state.errorRecovery=false;this.state.failed=false;
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return ;}
                    var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                    throw mse;
                }



                break;

        }



    },
    // $ANTLR end "synpred57_JSExpr",

    // $ANTLR start "synpred59_JSExpr"
    synpred59_JSExpr_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:341:5: ( ( ARG_SEP n= atom_type )* )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:341:5: ( ARG_SEP n= atom_type )*
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:341:5: ( ARG_SEP n= atom_type )*
        loop46:
        do {
            var alt46=2;
            var LA46_0 = this.input.LA(1);

            if ( (LA46_0==ARG_SEP) ) {
                alt46=1;
            }


            switch (alt46) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:341:6: ARG_SEP n= atom_type
                this.match(this.input,ARG_SEP,JSExprParser.FOLLOW_ARG_SEP_in_synpred59_JSExpr997); if (this.state.failed) return ;
                this.pushFollow(JSExprParser.FOLLOW_atom_type_in_synpred59_JSExpr1003);
                n=this.atom_type();

                this.state._fsp--;
                if (this.state.failed) return ;


                break;

            default :
                break loop46;
            }
        } while (true);



    },
    // $ANTLR end "synpred59_JSExpr",

    // $ANTLR start "synpred64_JSExpr"
    synpred64_JSExpr_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:5: ( (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' ) ( ')' ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:5: (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' ) ( ')' )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:5: (f= FUNC | f= NAME ( WHITESPACE1 )? b= '(' )
        var alt48=2;
        var LA48_0 = this.input.LA(1);

        if ( (LA48_0==FUNC) ) {
            alt48=1;
        }
        else if ( (LA48_0==NAME) ) {
            alt48=2;
        }
        else {
            if (this.state.backtracking>0) {this.state.failed=true; return ;}
            var nvae =
                new org.antlr.runtime.NoViableAltException("", 48, 0, this.input);

            throw nvae;
        }
        switch (alt48) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:6: f= FUNC
                f=this.match(this.input,FUNC,JSExprParser.FOLLOW_FUNC_in_synpred64_JSExpr1077); if (this.state.failed) return ;


                break;
            case 2 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:17: f= NAME ( WHITESPACE1 )? b= '('
                f=this.match(this.input,NAME,JSExprParser.FOLLOW_NAME_in_synpred64_JSExpr1085); if (this.state.failed) return ;
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:26: ( WHITESPACE1 )?
                var alt47=2;
                var LA47_0 = this.input.LA(1);

                if ( (LA47_0==WHITESPACE1) ) {
                    alt47=1;
                }
                switch (alt47) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:0:0: WHITESPACE1
                        this.match(this.input,WHITESPACE1,JSExprParser.FOLLOW_WHITESPACE1_in_synpred64_JSExpr1087); if (this.state.failed) return ;


                        break;

                }

                b=this.match(this.input,P_OPEN,JSExprParser.FOLLOW_P_OPEN_in_synpred64_JSExpr1094); if (this.state.failed) return ;


                break;

        }

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:49: ( ')' )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:376:50: ')'
        this.match(this.input,P_CLOSE,JSExprParser.FOLLOW_P_CLOSE_in_synpred64_JSExpr1099); if (this.state.failed) return ;





    },
    // $ANTLR end "synpred64_JSExpr",

    // $ANTLR start "synpred67_JSExpr"
    synpred67_JSExpr_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:427:7: (params= atom_list )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JSExpr.g:427:7: params= atom_list
        this.pushFollow(JSExprParser.FOLLOW_atom_list_in_synpred67_JSExpr1191);
        params=this.atom_list();

        this.state._fsp--;
        if (this.state.failed) return ;


    },
    // $ANTLR end "synpred67_JSExpr"

    // Delegated rules



    synpred59_JSExpr: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred59_JSExpr_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred57_JSExpr: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred57_JSExpr_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred67_JSExpr: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred67_JSExpr_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred23_JSExpr: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred23_JSExpr_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred64_JSExpr: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred64_JSExpr_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred40_JSExpr: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred40_JSExpr_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred29_JSExpr: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred29_JSExpr_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    }

}, true); // important to pass true to overwrite default implementations

org.antlr.lang.augmentObject(JSExprParser, {
    DFA18_eotS:
        "\u000d\uffff",
    DFA18_eofS:
        "\u0009\uffff\u0001\u000b\u0003\uffff",
    DFA18_minS:
        "\u0001\u0008\u0008\uffff\u0001\u0004\u0002\uffff\u0001\u0004",
    DFA18_maxS:
        "\u0001\u002a\u0008\uffff\u0001\u0038\u0002\uffff\u0001\u0010",
    DFA18_acceptS:
        "\u0001\uffff\u0001\u0001\u0001\u0002\u0001\u0003\u0001\u0004\u0001"+
    "\u0005\u0001\u0006\u0001\u0007\u0001\u0008\u0001\uffff\u0001\u0009\u0001"+
    "\u000a\u0001\uffff",
    DFA18_specialS:
        "\u000d\uffff}>",
    DFA18_transitionS: [
            "\u0001\u0001\u0001\uffff\u0001\u0001\u0005\uffff\u0001\u0007"+
            "\u000f\uffff\u0001\u000a\u0001\uffff\u0001\u0002\u0001\uffff"+
            "\u0001\u0009\u0001\u0003\u0001\u0004\u0001\u0005\u0001\u000b"+
            "\u0001\u0006\u0001\u0008",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "\u000c\u000b\u0001\u0008\u000a\u000b\u0002\uffff\u0003\u000b"+
            "\u0001\uffff\u0001\u000b\u0001\uffff\u0001\u000c\u0001\u000b"+
            "\u0003\uffff\u0001\u000b\u000f\uffff\u0001\u000b",
            "",
            "",
            "\u0001\u000b\u000b\uffff\u0001\u0008"
    ]
});

org.antlr.lang.augmentObject(JSExprParser, {
    DFA18_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprParser.DFA18_eotS),
    DFA18_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprParser.DFA18_eofS),
    DFA18_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JSExprParser.DFA18_minS),
    DFA18_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JSExprParser.DFA18_maxS),
    DFA18_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprParser.DFA18_acceptS),
    DFA18_special:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprParser.DFA18_specialS),
    DFA18_transition: (function() {
        var a = [],
            i,
            numStates = JSExprParser.DFA18_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JSExprParser.DFA18_transitionS[i]));
        }
        return a;
    })()
});

JSExprParser.DFA18 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 18;
    this.eot = JSExprParser.DFA18_eot;
    this.eof = JSExprParser.DFA18_eof;
    this.min = JSExprParser.DFA18_min;
    this.max = JSExprParser.DFA18_max;
    this.accept = JSExprParser.DFA18_accept;
    this.special = JSExprParser.DFA18_special;
    this.transition = JSExprParser.DFA18_transition;
};

org.antlr.lang.extend(JSExprParser.DFA18, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "145:1: atom returns [String value] : (n= ( '+' | '-' ) (b= atom ) | x1= INT ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? x2= ( INT | NAME ) )* | NUMBER | PERCENT | x= SINGLEQUOT_STRING (name= ( ERRORNAME | NAME ) )? ( ( WHITESPACE1 )? em= COLON ( WHITESPACE1 )? (x2= SINGLEQUOT_STRING )? endName= ( ERRORNAME | NAME | INT ) )* | DOUBLEQUOT_STRING | (brace= P_OPEN ) ( expr P_CLOSE ) | folded | ( ARRAY_FORMULAR_START ) (firToken= atom ) ( (sep= ( ARG_SEP | '|' ) ) (token= atom ) )* ( ARRAY_FORMULAR_END ) | (name= ( ERRORNAME | NAME ) (name1= ( ERRORNAME | NAME ) )? ( ( WHITESPACE1 )? m= COLON ( WHITESPACE1 )? name2= ( ERRORNAME | NAME | INT ) (name3= ( ERRORNAME | NAME ) )? )* ) );";
    },
    dummy: null
});
org.antlr.lang.augmentObject(JSExprParser, {
    DFA28_eotS:
        "\u0010\uffff",
    DFA28_eofS:
        "\u0010\uffff",
    DFA28_minS:
        "\u0001\u0008\u0007\uffff\u0002\u0000\u0006\uffff",
    DFA28_maxS:
        "\u0001\u002a\u0007\uffff\u0002\u0000\u0006\uffff",
    DFA28_acceptS:
        "\u0001\uffff\u0001\u0001\u000d\uffff\u0001\u0002",
    DFA28_specialS:
        "\u0008\uffff\u0001\u0000\u0001\u0001\u0006\uffff}>",
    DFA28_transitionS: [
            "\u0001\u0001\u0001\uffff\u0001\u0001\u0005\uffff\u0004\u0001"+
            "\u000c\uffff\u0001\u0001\u0001\uffff\u0001\u0001\u0001\uffff"+
            "\u0001\u0009\u0005\u0001\u0001\u0008",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "\u0001\uffff",
            "\u0001\uffff",
            "",
            "",
            "",
            "",
            "",
            ""
    ]
});

org.antlr.lang.augmentObject(JSExprParser, {
    DFA28_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprParser.DFA28_eotS),
    DFA28_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprParser.DFA28_eofS),
    DFA28_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JSExprParser.DFA28_minS),
    DFA28_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JSExprParser.DFA28_maxS),
    DFA28_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprParser.DFA28_acceptS),
    DFA28_special:
        org.antlr.runtime.DFA.unpackEncodedString(JSExprParser.DFA28_specialS),
    DFA28_transition: (function() {
        var a = [],
            i,
            numStates = JSExprParser.DFA28_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JSExprParser.DFA28_transitionS[i]));
        }
        return a;
    })()
});

JSExprParser.DFA28 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 28;
    this.eot = JSExprParser.DFA28_eot;
    this.eof = JSExprParser.DFA28_eof;
    this.min = JSExprParser.DFA28_min;
    this.max = JSExprParser.DFA28_max;
    this.accept = JSExprParser.DFA28_accept;
    this.special = JSExprParser.DFA28_special;
    this.transition = JSExprParser.DFA28_transition;
};

org.antlr.lang.extend(JSExprParser.DFA28, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "426:1: range returns [String value] : (params= atom_list | funct= folded );";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA28_8 = input.LA(1);

                             
                            var index28_8 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred67_JSExpr()) ) {s = 1;}

                            else if ( (true) ) {s = 15;}

                             
                            input.seek(index28_8);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA28_9 = input.LA(1);

                             
                            var index28_9 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred67_JSExpr()) ) {s = 1;}

                            else if ( (true) ) {s = 15;}

                             
                            input.seek(index28_9);
                            if ( s>=0 ) return s;
                            break;
            }
        }).call(this.recognizer, s, input);
        if (!org.antlr.lang.isUndefined(retval)) {
            return retval;
        }
        if (this.recognizer.state.backtracking>0) {this.recognizer.state.failed=true; return -1;}
        var nvae =
            new org.antlr.runtime.NoViableAltException(this.getDescription(), 28, _s, input);
        this.error(nvae);
        throw nvae;
    },
    dummy: null
});
 

// public class variables
org.antlr.lang.augmentObject(JSExprParser, {
    tokenNames: ["<invalid>", "<EOR>", "<DOWN>", "<UP>", "COLON", "CONCATENATION", "INTERSECT", "AND", "PLUS", "PLUSEQUAL", "MINUS", "MINUSEQUAL", "MULT", "MULTEEQUAL", "DIV", "DIVEQUAL", "P_OPEN", "P_CLOSE", "ARG_SEP", "ARG_SEP_WRONG", "EQUAL", "LESS", "LESSEQUAL", "GREATER", "GREATEREQUAL", "NOTEQUAL", "NOTEQUAL2", "AMPERSAND", "OR", "POW", "MODE", "MODEQUAL", "ARRAY_FORMULAR_START", "ARRAY_FORMULAR_END", "INT", "WHITESPACE1", "NAME", "NUMBER", "PERCENT", "SINGLEQUOT_STRING", "ERRORNAME", "DOUBLEQUOT_STRING", "FUNC", "NONZERO_NUMBER", "DIGIT", "LT", "COMMAOrSPACE", "KEYCHARACTER", "ODF_COLUMN", "ODF_COL_RANGE", "ODF_PREWORD", "ODF_PRELIST", "ODF_TABLE", "NAME1", "WHITESPACE", "SPACE", "'|'"],
    FOLLOW_EQUAL_in_prog367: new org.antlr.runtime.BitSet([0x00010500, 0x000007F5]),
    FOLLOW_expr_in_prog376: new org.antlr.runtime.BitSet([0x00000000, 0x00000000]),
    FOLLOW_EOF_in_prog385: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_ARRAY_FORMULAR_START_in_prog391: new org.antlr.runtime.BitSet([0x00100000, 0x00000000]),
    FOLLOW_EQUAL_in_prog393: new org.antlr.runtime.BitSet([0x00010500, 0x000007F5]),
    FOLLOW_expr_in_prog409: new org.antlr.runtime.BitSet([0x00000000, 0x00000002]),
    FOLLOW_ARRAY_FORMULAR_END_in_prog413: new org.antlr.runtime.BitSet([0x00000000, 0x00000000]),
    FOLLOW_EOF_in_prog415: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_atom_in_expr438: new org.antlr.runtime.BitSet([0xE7F0FFF2, 0x00000000]),
    FOLLOW_MODE_in_expr450: new org.antlr.runtime.BitSet([0xE7F0FFF2, 0x00000000]),
    FOLLOW_set_in_expr466: new org.antlr.runtime.BitSet([0x00010500, 0x000007F5]),
    FOLLOW_expr_in_expr612: new org.antlr.runtime.BitSet([0xA7F0FFF2, 0x00000000]),
    FOLLOW_set_in_atom655: new org.antlr.runtime.BitSet([0x00010500, 0x000007F5]),
    FOLLOW_atom_in_atom664: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INT_in_atom685: new org.antlr.runtime.BitSet([0x00000012, 0x00000008]),
    FOLLOW_WHITESPACE1_in_atom688: new org.antlr.runtime.BitSet([0x00000010, 0x00000000]),
    FOLLOW_COLON_in_atom693: new org.antlr.runtime.BitSet([0x00000000, 0x0000001C]),
    FOLLOW_WHITESPACE1_in_atom695: new org.antlr.runtime.BitSet([0x00000000, 0x00000014]),
    FOLLOW_set_in_atom702: new org.antlr.runtime.BitSet([0x00000012, 0x00000008]),
    FOLLOW_NUMBER_in_atom717: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_PERCENT_in_atom726: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_SINGLEQUOT_STRING_in_atom740: new org.antlr.runtime.BitSet([0x00000012, 0x00000118]),
    FOLLOW_set_in_atom747: new org.antlr.runtime.BitSet([0x00000012, 0x00000008]),
    FOLLOW_WHITESPACE1_in_atom756: new org.antlr.runtime.BitSet([0x00000010, 0x00000000]),
    FOLLOW_COLON_in_atom761: new org.antlr.runtime.BitSet([0x00000000, 0x0000019C]),
    FOLLOW_WHITESPACE1_in_atom763: new org.antlr.runtime.BitSet([0x00000000, 0x00000194]),
    FOLLOW_SINGLEQUOT_STRING_in_atom769: new org.antlr.runtime.BitSet([0x00000000, 0x00000114]),
    FOLLOW_set_in_atom775: new org.antlr.runtime.BitSet([0x00000012, 0x00000008]),
    FOLLOW_DOUBLEQUOT_STRING_in_atom791: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_P_OPEN_in_atom812: new org.antlr.runtime.BitSet([0x00010500, 0x000007F5]),
    FOLLOW_expr_in_atom822: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_P_CLOSE_in_atom824: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_folded_in_atom833: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_ARRAY_FORMULAR_START_in_atom845: new org.antlr.runtime.BitSet([0x00010500, 0x000007F5]),
    FOLLOW_atom_in_atom857: new org.antlr.runtime.BitSet([0x00040000, 0x01000002]),
    FOLLOW_set_in_atom871: new org.antlr.runtime.BitSet([0x00010500, 0x000007F5]),
    FOLLOW_atom_in_atom888: new org.antlr.runtime.BitSet([0x00040000, 0x01000002]),
    FOLLOW_ARRAY_FORMULAR_END_in_atom900: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_atom916: new org.antlr.runtime.BitSet([0x00000012, 0x00000118]),
    FOLLOW_set_in_atom927: new org.antlr.runtime.BitSet([0x00000012, 0x00000008]),
    FOLLOW_WHITESPACE1_in_atom936: new org.antlr.runtime.BitSet([0x00000010, 0x00000000]),
    FOLLOW_COLON_in_atom941: new org.antlr.runtime.BitSet([0x00000000, 0x0000011C]),
    FOLLOW_WHITESPACE1_in_atom943: new org.antlr.runtime.BitSet([0x00000000, 0x00000114]),
    FOLLOW_set_in_atom950: new org.antlr.runtime.BitSet([0x00000012, 0x00000118]),
    FOLLOW_set_in_atom963: new org.antlr.runtime.BitSet([0x00000012, 0x00000008]),
    FOLLOW_atom_type_in_atom_list992: new org.antlr.runtime.BitSet([0x000C0002, 0x00000000]),
    FOLLOW_ARG_SEP_in_atom_list997: new org.antlr.runtime.BitSet([0x00050500, 0x000007F5]),
    FOLLOW_atom_type_in_atom_list1003: new org.antlr.runtime.BitSet([0x00040002, 0x00000000]),
    FOLLOW_ARG_SEP_WRONG_in_atom_list1015: new org.antlr.runtime.BitSet([0x00090500, 0x000007F5]),
    FOLLOW_atom_type_in_atom_list1020: new org.antlr.runtime.BitSet([0x00080002, 0x00000000]),
    FOLLOW_expr_in_atom_type1043: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_FUNC_in_folded1077: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_NAME_in_folded1085: new org.antlr.runtime.BitSet([0x00010000, 0x00000008]),
    FOLLOW_WHITESPACE1_in_folded1087: new org.antlr.runtime.BitSet([0x00010000, 0x00000000]),
    FOLLOW_P_OPEN_in_folded1094: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_P_CLOSE_in_folded1099: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_FUNC_in_folded1116: new org.antlr.runtime.BitSet([0x000D0500, 0x000007F5]),
    FOLLOW_NAME_in_folded1124: new org.antlr.runtime.BitSet([0x00010000, 0x00000008]),
    FOLLOW_WHITESPACE1_in_folded1126: new org.antlr.runtime.BitSet([0x00010000, 0x00000000]),
    FOLLOW_P_OPEN_in_folded1133: new org.antlr.runtime.BitSet([0x000D0500, 0x000007F5]),
    FOLLOW_range_in_folded1164: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_P_CLOSE_in_folded1166: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_atom_list_in_range1191: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_folded_in_range1205: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_synpred23_JSExpr466: new org.antlr.runtime.BitSet([0x00010500, 0x000007F5]),
    FOLLOW_expr_in_synpred23_JSExpr612: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_WHITESPACE1_in_synpred29_JSExpr688: new org.antlr.runtime.BitSet([0x00000010, 0x00000000]),
    FOLLOW_COLON_in_synpred29_JSExpr693: new org.antlr.runtime.BitSet([0x00000000, 0x0000001C]),
    FOLLOW_WHITESPACE1_in_synpred29_JSExpr695: new org.antlr.runtime.BitSet([0x00000000, 0x00000014]),
    FOLLOW_set_in_synpred29_JSExpr702: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_WHITESPACE1_in_synpred40_JSExpr756: new org.antlr.runtime.BitSet([0x00000010, 0x00000000]),
    FOLLOW_COLON_in_synpred40_JSExpr761: new org.antlr.runtime.BitSet([0x00000000, 0x0000019C]),
    FOLLOW_WHITESPACE1_in_synpred40_JSExpr763: new org.antlr.runtime.BitSet([0x00000000, 0x00000194]),
    FOLLOW_SINGLEQUOT_STRING_in_synpred40_JSExpr769: new org.antlr.runtime.BitSet([0x00000000, 0x00000114]),
    FOLLOW_set_in_synpred40_JSExpr775: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_WHITESPACE1_in_synpred57_JSExpr936: new org.antlr.runtime.BitSet([0x00000010, 0x00000000]),
    FOLLOW_COLON_in_synpred57_JSExpr941: new org.antlr.runtime.BitSet([0x00000000, 0x0000011C]),
    FOLLOW_WHITESPACE1_in_synpred57_JSExpr943: new org.antlr.runtime.BitSet([0x00000000, 0x00000114]),
    FOLLOW_set_in_synpred57_JSExpr950: new org.antlr.runtime.BitSet([0x00000002, 0x00000110]),
    FOLLOW_set_in_synpred57_JSExpr963: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_ARG_SEP_in_synpred59_JSExpr997: new org.antlr.runtime.BitSet([0x00050500, 0x000007F5]),
    FOLLOW_atom_type_in_synpred59_JSExpr1003: new org.antlr.runtime.BitSet([0x00040002, 0x00000000]),
    FOLLOW_FUNC_in_synpred64_JSExpr1077: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_NAME_in_synpred64_JSExpr1085: new org.antlr.runtime.BitSet([0x00010000, 0x00000008]),
    FOLLOW_WHITESPACE1_in_synpred64_JSExpr1087: new org.antlr.runtime.BitSet([0x00010000, 0x00000000]),
    FOLLOW_P_OPEN_in_synpred64_JSExpr1094: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_P_CLOSE_in_synpred64_JSExpr1099: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_atom_list_in_synpred67_JSExpr1191: new org.antlr.runtime.BitSet([0x00000002, 0x00000000])
});

})();