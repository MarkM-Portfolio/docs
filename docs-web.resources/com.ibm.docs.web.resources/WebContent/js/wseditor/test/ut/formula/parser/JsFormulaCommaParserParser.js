// $ANTLR 3.2 Sep 23, 2009 12:02:23 C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g 2014-03-12 10:31:06




var JsFormulaCommaParserParser = function(input, state) {
    if (!state) {
        state = new org.antlr.runtime.RecognizerSharedState();
    }

    (function(){

        	this.tokenList = [];
        	this.intersectionStack = [];
        	this.emitErrorMessage = function(e) {
                if(console) {
                    console.warn(e);
                }
                throw ("#ERROR!");
            };

    }).call(this);

    JsFormulaCommaParserParser.superclass.constructor.call(this, input, state);

    this.dfa9 = new JsFormulaCommaParserParser.DFA9(this);
    this.dfa8 = new JsFormulaCommaParserParser.DFA8(this);
    this.dfa36 = new JsFormulaCommaParserParser.DFA36(this);
    this.dfa20 = new JsFormulaCommaParserParser.DFA20(this);
    this.dfa35 = new JsFormulaCommaParserParser.DFA35(this);
    this.dfa47 = new JsFormulaCommaParserParser.DFA47(this);
    this.dfa52 = new JsFormulaCommaParserParser.DFA52(this);

        this.state.ruleMemo = {};
         
         

    /* @todo only create adaptor if output=AST */
    this.adaptor = new org.antlr.runtime.tree.CommonTreeAdaptor();

};

org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    ODF_TABLE: 53,
    NAME1: 39,
    LT: 46,
    SPACE1: 44,
    NAME: 36,
    DIGIT: 42,
    ARRAY_FORMULAR_END: 31,
    NOTEQUAL2: 24,
    EQUAL: 18,
    DOUBLEQUOT_STRING: 38,
    NUMSEP: 45,
    LESS: 19,
    PLUS: 8,
    LESSEQUAL: 20,
    MULTEEQUAL: 13,
    MODE: 28,
    P_CLOSE: 17,
    KEYCHARACTER: 48,
    MULT: 12,
    ARG_SEP: 33,
    AND: 7,
    CONCATENATION: 5,
    POW: 27,
    PLUSEQUAL: 9,
    COLON: 4,
    SINGLEQUOT_STRING: 34,
    NOTEQUAL: 23,
    DIVEQUAL: 15,
    ODF_COLUMN: 49,
    MINUSEQUAL: 11,
    FUNC: 40,
    LOCALE_NUMBER: 35,
    INT: 43,
    ODF_COL_RANGE: 50,
    MINUS: 10,
    AMPERSAND: 25,
    ARRAY_FORMULAR_START: 30,
    P_OPEN: 16,
    GREATER: 21,
    EOF: -1,
    INTERSECT_ODS: 6,
    ODF_PREWORD: 51,
    OR: 26,
    SPACE: 55,
    COMMAOrSPACE: 47,
    DIV: 14,
    MODEQUAL: 29,
    ODF_PRELIST: 52,
    ERRORNAME: 37,
    NONZERO_NUMBER: 41,
    GREATEREQUAL: 22,
    WHITESPACE: 54,
    INTERSECT: 32
});

(function(){
// public class variables
var ODF_TABLE= 53,
    NAME1= 39,
    LT= 46,
    SPACE1= 44,
    NAME= 36,
    DIGIT= 42,
    ARRAY_FORMULAR_END= 31,
    NOTEQUAL2= 24,
    EQUAL= 18,
    DOUBLEQUOT_STRING= 38,
    NUMSEP= 45,
    LESS= 19,
    PLUS= 8,
    LESSEQUAL= 20,
    MULTEEQUAL= 13,
    MODE= 28,
    P_CLOSE= 17,
    KEYCHARACTER= 48,
    MULT= 12,
    ARG_SEP= 33,
    AND= 7,
    CONCATENATION= 5,
    POW= 27,
    PLUSEQUAL= 9,
    COLON= 4,
    SINGLEQUOT_STRING= 34,
    NOTEQUAL= 23,
    DIVEQUAL= 15,
    ODF_COLUMN= 49,
    MINUSEQUAL= 11,
    FUNC= 40,
    LOCALE_NUMBER= 35,
    INT= 43,
    ODF_COL_RANGE= 50,
    MINUS= 10,
    AMPERSAND= 25,
    ARRAY_FORMULAR_START= 30,
    P_OPEN= 16,
    GREATER= 21,
    EOF= -1,
    INTERSECT_ODS= 6,
    ODF_PREWORD= 51,
    OR= 26,
    SPACE= 55,
    COMMAOrSPACE= 47,
    DIV= 14,
    MODEQUAL= 29,
    ODF_PRELIST= 52,
    ERRORNAME= 37,
    NONZERO_NUMBER= 41,
    GREATEREQUAL= 22,
    WHITESPACE= 54,
    INTERSECT= 32;

// public instance methods/vars
org.antlr.lang.extend(JsFormulaCommaParserParser, org.antlr.runtime.Parser, {
        
    setTreeAdaptor: function(adaptor) {
        this.adaptor = adaptor;
    },
    getTreeAdaptor: function() {
        return this.adaptor;
    },

    getTokenNames: function() { return JsFormulaCommaParserParser.tokenNames; },
    getGrammarFileName: function() { return "C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g"; }
});
org.antlr.lang.augmentObject(JsFormulaCommaParserParser.prototype, {

    // inline static return class
    prog_return: (function() {
        JsFormulaCommaParserParser.prog_return = function(){};
        org.antlr.lang.extend(JsFormulaCommaParserParser.prog_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:71:2: prog returns [String value] : ( EQUAL ( INTERSECT )? ( expr )+ EOF | ARRAY_FORMULAR_START EQUAL ( expr )+ ARRAY_FORMULAR_END EOF );
    // $ANTLR start "prog"
    prog: function() {
        var retval = new JsFormulaCommaParserParser.prog_return();
        retval.start = this.input.LT(1);
        var prog_StartIndex = this.input.index();
        var root_0 = null;

        var EQUAL1 = null;
        var INTERSECT2 = null;
        var EOF4 = null;
        var ARRAY_FORMULAR_START5 = null;
        var EQUAL6 = null;
        var ARRAY_FORMULAR_END8 = null;
        var EOF9 = null;
         var expr3 = null;
         var expr7 = null;

        var EQUAL1_tree=null;
        var INTERSECT2_tree=null;
        var EOF4_tree=null;
        var ARRAY_FORMULAR_START5_tree=null;
        var EQUAL6_tree=null;
        var ARRAY_FORMULAR_END8_tree=null;
        var EOF9_tree=null;


          	this.inConstArray = 0;
          
        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 1) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:75:3: ( EQUAL ( INTERSECT )? ( expr )+ EOF | ARRAY_FORMULAR_START EQUAL ( expr )+ ARRAY_FORMULAR_END EOF )
            var alt4=2;
            var LA4_0 = this.input.LA(1);

            if ( (LA4_0==EQUAL) ) {
                alt4=1;
            }
            else if ( (LA4_0==ARRAY_FORMULAR_START) ) {
                alt4=2;
            }
            else {
                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                var nvae =
                    new org.antlr.runtime.NoViableAltException("", 4, 0, this.input);

                throw nvae;
            }
            switch (alt4) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:75:5: EQUAL ( INTERSECT )? ( expr )+ EOF
                    root_0 = this.adaptor.nil();

                    EQUAL1=this.match(this.input,EQUAL,JsFormulaCommaParserParser.FOLLOW_EQUAL_in_prog347); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    EQUAL1_tree = this.adaptor.create(EQUAL1);
                    this.adaptor.addChild(root_0, EQUAL1_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:75:11: ( INTERSECT )?
                    var alt1=2;
                    var LA1_0 = this.input.LA(1);

                    if ( (LA1_0==INTERSECT) ) {
                        alt1=1;
                    }
                    switch (alt1) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                            INTERSECT2=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_prog349); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT2_tree = this.adaptor.create(INTERSECT2);
                            this.adaptor.addChild(root_0, INTERSECT2_tree);
                            }


                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:75:22: ( expr )+
                    var cnt2=0;
                    loop2:
                    do {
                        var alt2=2;
                        var LA2_0 = this.input.LA(1);

                        if ( (LA2_0==PLUS||LA2_0==MINUS||LA2_0==P_OPEN||LA2_0==ARRAY_FORMULAR_START||(LA2_0>=SINGLEQUOT_STRING && LA2_0<=FUNC)) ) {
                            alt2=1;
                        }


                        switch (alt2) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: expr
                            this.pushFollow(JsFormulaCommaParserParser.FOLLOW_expr_in_prog352);
                            expr3=this.expr();

                            this.state._fsp--;
                            if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, expr3.getTree());


                            break;

                        default :
                            if ( cnt2 >= 1 ) {
                                break loop2;
                            }
                            if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var eee = new org.antlr.runtime.EarlyExitException(2, this.input);
                                throw eee;
                        }
                        cnt2++;
                    } while (true);

                    if ( this.state.backtracking===0 ) {
                    }
                    EOF4=this.match(this.input,EOF,JsFormulaCommaParserParser.FOLLOW_EOF_in_prog357); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    EOF4_tree = this.adaptor.create(EOF4);
                    this.adaptor.addChild(root_0, EOF4_tree);
                    }


                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:76:5: ARRAY_FORMULAR_START EQUAL ( expr )+ ARRAY_FORMULAR_END EOF
                    root_0 = this.adaptor.nil();

                    ARRAY_FORMULAR_START5=this.match(this.input,ARRAY_FORMULAR_START,JsFormulaCommaParserParser.FOLLOW_ARRAY_FORMULAR_START_in_prog363); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    ARRAY_FORMULAR_START5_tree = this.adaptor.create(ARRAY_FORMULAR_START5);
                    this.adaptor.addChild(root_0, ARRAY_FORMULAR_START5_tree);
                    }
                    EQUAL6=this.match(this.input,EQUAL,JsFormulaCommaParserParser.FOLLOW_EQUAL_in_prog365); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    EQUAL6_tree = this.adaptor.create(EQUAL6);
                    this.adaptor.addChild(root_0, EQUAL6_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                        		
                        	
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:80:4: ( expr )+
                    var cnt3=0;
                    loop3:
                    do {
                        var alt3=2;
                        var LA3_0 = this.input.LA(1);

                        if ( (LA3_0==PLUS||LA3_0==MINUS||LA3_0==P_OPEN||LA3_0==ARRAY_FORMULAR_START||(LA3_0>=SINGLEQUOT_STRING && LA3_0<=FUNC)) ) {
                            alt3=1;
                        }


                        switch (alt3) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: expr
                            this.pushFollow(JsFormulaCommaParserParser.FOLLOW_expr_in_prog377);
                            expr7=this.expr();

                            this.state._fsp--;
                            if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, expr7.getTree());


                            break;

                        default :
                            if ( cnt3 >= 1 ) {
                                break loop3;
                            }
                            if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var eee = new org.antlr.runtime.EarlyExitException(3, this.input);
                                throw eee;
                        }
                        cnt3++;
                    } while (true);

                    if ( this.state.backtracking===0 ) {
                    }
                    ARRAY_FORMULAR_END8=this.match(this.input,ARRAY_FORMULAR_END,JsFormulaCommaParserParser.FOLLOW_ARRAY_FORMULAR_END_in_prog382); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    ARRAY_FORMULAR_END8_tree = this.adaptor.create(ARRAY_FORMULAR_END8);
                    this.adaptor.addChild(root_0, ARRAY_FORMULAR_END8_tree);
                    }
                    EOF9=this.match(this.input,EOF,JsFormulaCommaParserParser.FOLLOW_EOF_in_prog384); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    EOF9_tree = this.adaptor.create(EOF9);
                    this.adaptor.addChild(root_0, EOF9_tree);
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
        JsFormulaCommaParserParser.expr_return = function(){};
        org.antlr.lang.extend(JsFormulaCommaParserParser.expr_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:83:1: expr returns [String value] : a= atom (sp= INTERSECT )? ( MODE )* ( (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr )* ;
    // $ANTLR start "expr"
    expr: function() {
        var retval = new JsFormulaCommaParserParser.expr_return();
        retval.start = this.input.LT(1);
        var expr_StartIndex = this.input.index();
        var root_0 = null;

        var sp = null;
        var m = null;
        var MODE10 = null;
        var INTERSECT11 = null;
         var a = null;
         var b = null;

        var sp_tree=null;
        var m_tree=null;
        var MODE10_tree=null;
        var INTERSECT11_tree=null;

        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 2) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:84:5: (a= atom (sp= INTERSECT )? ( MODE )* ( (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr )* )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:84:9: a= atom (sp= INTERSECT )? ( MODE )* ( (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr )*
            root_0 = this.adaptor.nil();

            this.pushFollow(JsFormulaCommaParserParser.FOLLOW_atom_in_expr407);
            a=this.atom();

            this.state._fsp--;
            if (this.state.failed) return retval;
            if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, a.getTree());
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:86:6: (sp= INTERSECT )?
            var alt5=2;
            var LA5_0 = this.input.LA(1);

            if ( (LA5_0==INTERSECT) ) {
                var LA5_1 = this.input.LA(2);

                if ( (this.synpred5_JsFormulaCommaParser()) ) {
                    alt5=1;
                }
            }
            switch (alt5) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:86:7: sp= INTERSECT
                    sp=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_expr423); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    sp_tree = this.adaptor.create(sp);
                    this.adaptor.addChild(root_0, sp_tree);
                    }
                    if ( this.state.backtracking===0 ) {
                       // match "=A1 B1" and "=A1 +B1"
                          		if(this.bLocaleSensitive){
                      	    	    var token = new websheet.parse.referenceToken((sp?sp.getText():null),sp.getStartIndex());
                      		    this.tokenList.push(token);
                      		    this.intersectionStack.push(this.tokenList.length - 1);
                      			}
                          	 
                    }


                    break;

            }

            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:93:6: ( MODE )*
            loop6:
            do {
                var alt6=2;
                var LA6_0 = this.input.LA(1);

                if ( (LA6_0==MODE) ) {
                    alt6=1;
                }


                switch (alt6) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:93:8: MODE
                    MODE10=this.match(this.input,MODE,JsFormulaCommaParserParser.FOLLOW_MODE_in_expr435); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    MODE10_tree = this.adaptor.create(MODE10);
                    this.adaptor.addChild(root_0, MODE10_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                          	 	if(this.bLocaleSensitive){
                          	 		var token = new websheet.parse.referenceToken((MODE10?MODE10.getText():null),MODE10.getStartIndex());
                      				this.tokenList.push(token);
                          	 	}
                               
                    }


                    break;

                default :
                    break loop6;
                }
            } while (true);

            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:99:3: ( (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr )*
            loop9:
            do {
                var alt9=2;
                alt9 = this.dfa9.predict(this.input);
                switch (alt9) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:99:4: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:99:4: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )?
                    var alt8=2;
                    alt8 = this.dfa8.predict(this.input);
                    switch (alt8) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:100:3: m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )?
                            m=this.input.LT(1);
                            if ( (this.input.LA(1)>=COLON && this.input.LA(1)<=CONCATENATION)||(this.input.LA(1)>=AND && this.input.LA(1)<=DIVEQUAL)||(this.input.LA(1)>=EQUAL && this.input.LA(1)<=NOTEQUAL2)||this.input.LA(1)==POW||this.input.LA(1)==MODEQUAL||this.input.LA(1)==ARG_SEP ) {
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
                               // match "=A1!A1" "=A1!A1!A1" "=A1~A1~A1"
                              				if(this.bLocaleSensitive){
                              					var token = new websheet.parse.referenceToken((m?m.getText():null),m.getStartIndex());
                              					this.tokenList.push(token);
                              					if(this.bMS){
                              					  if((m?m.getText():null) == "~")
                              					    this.errTokenList.push(token);
                              					  else if(this.inFunc === 0){//if it is in function, there are logic set change text from "," to ";"
                              					  			//but here if not in fucntion, we should treat "," as union operator "~"
                              					    //formula like =A1:B2,C3:D4 which not have the function name and bracket
                              					    //should treate ARG_SEP as union operator (~)
                              					    if((m?m.getText():null) == this.sepChar){//","
                              					       var left = this.tokenList[this.tokenList.length - 2];
                              					       if(left && (left._type == "range" || left._type == "cell" || left._type == "namerange" 
                              						 || (left._type == "reffunct" && (websheet.functions.Util.getErrPropByName(left.getChangedText()) & websheet.Constant.CellErrProp.RETURN_REF)))){
                              					           token.setChangedText("~");
                              					       }
                              					    	
                              					    }else if((m?m.getText():null) == ";" && this.inConstArray === 0) {
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
                              			
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:137:6: ( INTERSECT )?
                            var alt7=2;
                            var LA7_0 = this.input.LA(1);

                            if ( (LA7_0==INTERSECT) ) {
                                alt7=1;
                            }
                            switch (alt7) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                                    INTERSECT11=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_expr518); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    INTERSECT11_tree = this.adaptor.create(INTERSECT11);
                                    this.adaptor.addChild(root_0, INTERSECT11_tree);
                                    }


                                    break;

                            }



                            break;

                    }

                    this.pushFollow(JsFormulaCommaParserParser.FOLLOW_expr_in_expr531);
                    b=this.expr();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, b.getTree());
                    if ( this.state.backtracking===0 ) {

                      			if(m || sp){
                      				retval.value = (b!==null?b.value:null);
                      				
                      				if( sp && !m){
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
                      		
                    }


                    break;

                default :
                    break loop9;
                }
            } while (true);

            if ( this.state.backtracking===0 ) {

              		if( sp)
              		 this.intersectionStack.pop();
              		
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
            if ( this.state.backtracking>0 ) { this.memoize(this.input, 2, expr_StartIndex); }
        }
        return retval;
    },

    // inline static return class
    atom_return: (function() {
        JsFormulaCommaParserParser.atom_return = function(){};
        org.antlr.lang.extend(JsFormulaCommaParserParser.atom_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:187:1: atom returns [String value] : ( '-' ( INTERSECT )? (b= atom ) | '+' ( INTERSECT )? (b= atom ) | (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )? x= LOCALE_NUMBER em= COLON endName= ( NAME | LOCALE_NUMBER ) | x= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )? (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )? | x= DOUBLEQUOT_STRING | (brace= P_OPEN ) ( ( INTERSECT )? expr ( INTERSECT )? ebrace= P_CLOSE ) | folded | (a= ARRAY_FORMULAR_START (wp1= INTERSECT )? ) ( (firToken= atom ) ( ( ( (wp2= INTERSECT )? sep= ARG_SEP (wp3= INTERSECT )? ) ) (token= atom ) )* )? ( (wp4= INTERSECT )? ARRAY_FORMULAR_END ) | name1= ( ERRORNAME | NAME | NAME1 ) (op= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME | LOCALE_NUMBER ) (wp3= INTERSECT )? )? (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )? );
    // $ANTLR start "atom"
    atom: function() {
        var retval = new JsFormulaCommaParserParser.atom_return();
        retval.start = this.input.LT(1);
        var atom_StartIndex = this.input.index();
        var root_0 = null;

        var sn = null;
        var m = null;
        var wp2 = null;
        var x = null;
        var em = null;
        var endName = null;
        var ename = null;
        var wp3 = null;
        var wp4 = null;
        var x2 = null;
        var m2 = null;
        var wp6 = null;
        var brace = null;
        var ebrace = null;
        var a = null;
        var wp1 = null;
        var sep = null;
        var name1 = null;
        var op = null;
        var name2 = null;
        var op2 = null;
        var char_literal12 = null;
        var INTERSECT13 = null;
        var char_literal14 = null;
        var INTERSECT15 = null;
        var INTERSECT16 = null;
        var INTERSECT18 = null;
        var ARRAY_FORMULAR_END20 = null;
         var b = null;
         var firToken = null;
         var token = null;
         var expr17 = null;
         var folded19 = null;

        var sn_tree=null;
        var m_tree=null;
        var wp2_tree=null;
        var x_tree=null;
        var em_tree=null;
        var endName_tree=null;
        var ename_tree=null;
        var wp3_tree=null;
        var wp4_tree=null;
        var x2_tree=null;
        var m2_tree=null;
        var wp6_tree=null;
        var brace_tree=null;
        var ebrace_tree=null;
        var a_tree=null;
        var wp1_tree=null;
        var sep_tree=null;
        var name1_tree=null;
        var op_tree=null;
        var name2_tree=null;
        var op2_tree=null;
        var char_literal12_tree=null;
        var INTERSECT13_tree=null;
        var char_literal14_tree=null;
        var INTERSECT15_tree=null;
        var INTERSECT16_tree=null;
        var INTERSECT18_tree=null;
        var ARRAY_FORMULAR_END20_tree=null;

        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 3) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:188:3: ( '-' ( INTERSECT )? (b= atom ) | '+' ( INTERSECT )? (b= atom ) | (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )? x= LOCALE_NUMBER em= COLON endName= ( NAME | LOCALE_NUMBER ) | x= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )? (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )? | x= DOUBLEQUOT_STRING | (brace= P_OPEN ) ( ( INTERSECT )? expr ( INTERSECT )? ebrace= P_CLOSE ) | folded | (a= ARRAY_FORMULAR_START (wp1= INTERSECT )? ) ( (firToken= atom ) ( ( ( (wp2= INTERSECT )? sep= ARG_SEP (wp3= INTERSECT )? ) ) (token= atom ) )* )? ( (wp4= INTERSECT )? ARRAY_FORMULAR_END ) | name1= ( ERRORNAME | NAME | NAME1 ) (op= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME | LOCALE_NUMBER ) (wp3= INTERSECT )? )? (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )? )
            var alt36=9;
            alt36 = this.dfa36.predict(this.input);
            switch (alt36) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:189:3: '-' ( INTERSECT )? (b= atom )
                    root_0 = this.adaptor.nil();

                    char_literal12=this.match(this.input,MINUS,JsFormulaCommaParserParser.FOLLOW_MINUS_in_atom561); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    char_literal12_tree = this.adaptor.create(char_literal12);
                    this.adaptor.addChild(root_0, char_literal12_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:189:7: ( INTERSECT )?
                    var alt10=2;
                    var LA10_0 = this.input.LA(1);

                    if ( (LA10_0==INTERSECT) ) {
                        alt10=1;
                    }
                    switch (alt10) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                            INTERSECT13=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom563); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT13_tree = this.adaptor.create(INTERSECT13);
                            this.adaptor.addChild(root_0, INTERSECT13_tree);
                            }


                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:189:18: (b= atom )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:189:19: b= atom
                    this.pushFollow(JsFormulaCommaParserParser.FOLLOW_atom_in_atom569);
                    b=this.atom();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, b.getTree());



                    if ( this.state.backtracking===0 ) {

                           
                        	
                    }


                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:192:4: '+' ( INTERSECT )? (b= atom )
                    root_0 = this.adaptor.nil();

                    char_literal14=this.match(this.input,PLUS,JsFormulaCommaParserParser.FOLLOW_PLUS_in_atom576); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    char_literal14_tree = this.adaptor.create(char_literal14);
                    this.adaptor.addChild(root_0, char_literal14_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:192:8: ( INTERSECT )?
                    var alt11=2;
                    var LA11_0 = this.input.LA(1);

                    if ( (LA11_0==INTERSECT) ) {
                        alt11=1;
                    }
                    switch (alt11) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                            INTERSECT15=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom578); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT15_tree = this.adaptor.create(INTERSECT15);
                            this.adaptor.addChild(root_0, INTERSECT15_tree);
                            }


                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:192:19: (b= atom )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:192:20: b= atom
                    this.pushFollow(JsFormulaCommaParserParser.FOLLOW_atom_in_atom584);
                    b=this.atom();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, b.getTree());



                    if ( this.state.backtracking===0 ) {

                           
                        	
                    }


                    break;
                case 3 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:198:5: (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )? x= LOCALE_NUMBER em= COLON endName= ( NAME | LOCALE_NUMBER )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:198:5: (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )?
                    var alt13=2;
                    var LA13_0 = this.input.LA(1);

                    if ( (LA13_0==LOCALE_NUMBER) ) {
                        var LA13_1 = this.input.LA(2);

                        if ( (LA13_1==INTERSECT_ODS) ) {
                            alt13=1;
                        }
                    }
                    else if ( (LA13_0==SINGLEQUOT_STRING) ) {
                        alt13=1;
                    }
                    switch (alt13) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:198:6: sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )?
                            sn=this.input.LT(1);
                            if ( (this.input.LA(1)>=SINGLEQUOT_STRING && this.input.LA(1)<=LOCALE_NUMBER) ) {
                                this.input.consume();
                                if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(sn));
                                this.state.errorRecovery=false;this.state.failed=false;
                            }
                            else {
                                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                throw mse;
                            }

                            m=this.match(this.input,INTERSECT_ODS,JsFormulaCommaParserParser.FOLLOW_INTERSECT_ODS_in_atom612); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            m_tree = this.adaptor.create(m);
                            this.adaptor.addChild(root_0, m_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:198:59: (wp2= INTERSECT )?
                            var alt12=2;
                            var LA12_0 = this.input.LA(1);

                            if ( (LA12_0==INTERSECT) ) {
                                alt12=1;
                            }
                            switch (alt12) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:198:60: wp2= INTERSECT
                                    wp2=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom617); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    wp2_tree = this.adaptor.create(wp2);
                                    this.adaptor.addChild(root_0, wp2_tree);
                                    }


                                    break;

                            }



                            break;

                    }

                    x=this.match(this.input,LOCALE_NUMBER,JsFormulaCommaParserParser.FOLLOW_LOCALE_NUMBER_in_atom625); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    x_tree = this.adaptor.create(x);
                    this.adaptor.addChild(root_0, x_tree);
                    }
                    em=this.match(this.input,COLON,JsFormulaCommaParserParser.FOLLOW_COLON_in_atom629); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    em_tree = this.adaptor.create(em);
                    this.adaptor.addChild(root_0, em_tree);
                    }
                    endName=this.input.LT(1);
                    if ( (this.input.LA(1)>=LOCALE_NUMBER && this.input.LA(1)<=NAME) ) {
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

                        {
                          	if(!this.bNotParseRef) // 123!a1 or 1:2
                      	    {
                      	    	var text = "";
                      	    	var textWithWp = "";
                      	    	if((sn?sn.getText():null)){
                      	    		text += (sn?sn.getText():null);
                      	    		textWithWp += (sn?sn.getText():null);
                      	   	 	text += (m?m.getText():null);
                      	   	 	textWithWp += (m?m.getText():null);
                      	   	 	if((wp2?wp2.getText():null))
                      	    			textWithWp += (wp2?wp2.getText():null);
                      	   	}
                      	        text += x.getText().trim(); // the number can be '3.2  ' with spaces
                      	        textWithWp += x.getText(); 
                      	        text += (em?em.getText():null);
                      	        textWithWp += (em?em.getText():null);
                      	        text += (endName?endName.getText():null).trim();
                      	        textWithWp += (endName?endName.getText():null);
                              	//TODO:need to support =sum(3.2!a1:'3.2'!a4)
                      			var token = websheet.event.FormulaHelper.generateToken(text, this.bMS, this.bAutoCorrect,this.errTokenList);
                      			if(token)
                      			{
                      				if((sn?sn.getText():null))
                      					token.setIndex(sn.getStartIndex());
                      				else
                      					token.setIndex(x.getStartIndex());
                      					
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


                    break;
                case 4 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:7: x= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )? (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )?
                    root_0 = this.adaptor.nil();

                    x=this.input.LT(1);
                    if ( (this.input.LA(1)>=SINGLEQUOT_STRING && this.input.LA(1)<=LOCALE_NUMBER) ) {
                        this.input.consume();
                        if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(x));
                        this.state.errorRecovery=false;this.state.failed=false;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                        throw mse;
                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:43: (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )?
                    var alt16=2;
                    var LA16_0 = this.input.LA(1);

                    if ( (LA16_0==INTERSECT_ODS) ) {
                        alt16=1;
                    }
                    switch (alt16) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:45: m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )?
                            m=this.match(this.input,INTERSECT_ODS,JsFormulaCommaParserParser.FOLLOW_INTERSECT_ODS_in_atom690); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            m_tree = this.adaptor.create(m);
                            this.adaptor.addChild(root_0, m_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:61: (wp2= INTERSECT )?
                            var alt14=2;
                            var LA14_0 = this.input.LA(1);

                            if ( (LA14_0==INTERSECT) ) {
                                alt14=1;
                            }
                            switch (alt14) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:62: wp2= INTERSECT
                                    wp2=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom695); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    wp2_tree = this.adaptor.create(wp2);
                                    this.adaptor.addChild(root_0, wp2_tree);
                                    }


                                    break;

                            }

                            ename=this.input.LT(1);
                            if ( (this.input.LA(1)>=NAME && this.input.LA(1)<=ERRORNAME) ) {
                                this.input.consume();
                                if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(ename));
                                this.state.errorRecovery=false;this.state.failed=false;
                            }
                            else {
                                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                throw mse;
                            }

                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:101: (wp3= INTERSECT )?
                            var alt15=2;
                            var LA15_0 = this.input.LA(1);

                            if ( (LA15_0==INTERSECT) ) {
                                var LA15_1 = this.input.LA(2);

                                if ( (this.synpred42_JsFormulaCommaParser()) ) {
                                    alt15=1;
                                }
                            }
                            switch (alt15) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:102: wp3= INTERSECT
                                    wp3=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom710); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    wp3_tree = this.adaptor.create(wp3);
                                    this.adaptor.addChild(root_0, wp3_tree);
                                    }


                                    break;

                            }



                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:120: (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )?
                    var alt20=2;
                    alt20 = this.dfa20.predict(this.input);
                    switch (alt20) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:122: em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME )
                            em=this.match(this.input,COLON,JsFormulaCommaParserParser.FOLLOW_COLON_in_atom720); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            em_tree = this.adaptor.create(em);
                            this.adaptor.addChild(root_0, em_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:131: ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )?
                            var alt19=2;
                            var LA19_0 = this.input.LA(1);

                            if ( (LA19_0==INTERSECT||(LA19_0>=SINGLEQUOT_STRING && LA19_0<=LOCALE_NUMBER)) ) {
                                alt19=1;
                            }
                            switch (alt19) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:132: (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )?
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:132: (wp4= INTERSECT )?
                                    var alt17=2;
                                    var LA17_0 = this.input.LA(1);

                                    if ( (LA17_0==INTERSECT) ) {
                                        alt17=1;
                                    }
                                    switch (alt17) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:133: wp4= INTERSECT
                                            wp4=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom726); if (this.state.failed) return retval;
                                            if ( this.state.backtracking===0 ) {
                                            wp4_tree = this.adaptor.create(wp4);
                                            this.adaptor.addChild(root_0, wp4_tree);
                                            }


                                            break;

                                    }

                                    x2=this.input.LT(1);
                                    if ( (this.input.LA(1)>=SINGLEQUOT_STRING && this.input.LA(1)<=LOCALE_NUMBER) ) {
                                        this.input.consume();
                                        if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(x2));
                                        this.state.errorRecovery=false;this.state.failed=false;
                                    }
                                    else {
                                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                        throw mse;
                                    }

                                    m2=this.match(this.input,INTERSECT_ODS,JsFormulaCommaParserParser.FOLLOW_INTERSECT_ODS_in_atom740); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    m2_tree = this.adaptor.create(m2);
                                    this.adaptor.addChild(root_0, m2_tree);
                                    }
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:203: (wp6= INTERSECT )?
                                    var alt18=2;
                                    var LA18_0 = this.input.LA(1);

                                    if ( (LA18_0==INTERSECT) ) {
                                        alt18=1;
                                    }
                                    switch (alt18) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:204: wp6= INTERSECT
                                            wp6=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom745); if (this.state.failed) return retval;
                                            if ( this.state.backtracking===0 ) {
                                            wp6_tree = this.adaptor.create(wp6);
                                            this.adaptor.addChild(root_0, wp6_tree);
                                            }


                                            break;

                                    }



                                    break;

                            }

                            endName=this.input.LT(1);
                            if ( (this.input.LA(1)>=NAME && this.input.LA(1)<=ERRORNAME) ) {
                                this.input.consume();
                                if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(endName));
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

                      	{
                      		if(!this.bNotParseRef && (m?m.getText():null))
                      	    {
                      	        var text = x.getText();
                      	        var textWithWp = text;
                      	        if((m?m.getText():null)){
                      	        	text += (m?m.getText():null);
                      	        	textWithWp += (m?m.getText():null);
                      	        	if((wp2?wp2.getText():null))
                      	        		textWithWp +=(wp2?wp2.getText():null);
                      	        	text += (ename?ename.getText():null);
                      	        	textWithWp += (ename?ename.getText():null);
                      	        	if((wp3?wp3.getText():null))
                      	        		textWithWp +=(wp3?wp3.getText():null);
                      	        }
                      	
                      	        if((em?em.getText():null)){
                              		
                      	        	text += (em?em.getText():null);
                      		        textWithWp += (em?em.getText():null);
                      		        if((wp4?wp4.getText():null))
                      	        		textWithWp +=(wp4?wp4.getText():null);
                      		        if((m2?m2.getText():null)){
                      		       		text += (x2?x2.getText():null).trim();
                      		        	textWithWp += (x2?x2.getText():null);
                      		        	text += (m2?m2.getText():null);
                      		        	textWithWp += (m2?m2.getText():null);
                      		        	if((wp6?wp6.getText():null))
                      	        			textWithWp +=(wp6?wp6.getText():null);
                      		        }
                      		        text += (endName?endName.getText():null).trim();
                      		       	textWithWp += (endName?endName.getText():null);
                              	}else{
                              		//TODO: Sheet!1 , Sheet!a				
                              	}
                      			var token = websheet.event.FormulaHelper.generateToken(text, this.bMS, this.bAutoCorrect,this.errTokenList);
                      			if(token)
                      			{
                      				if(token.getType() == websheet.Constant.FormulaTokenType.SHEET_SEP)
                      				{
                      					token.setIndex(m.getStartIndex());
                      					this.errTokenList.push(token);
                      				}else
                      				{
                      					token.setIndex(x.getStartIndex());
                      					token.setTextOnly(textWithWp);
                      					this.tokenList.push(token);
                      				}
                      			}
                      	    }else  if(this.bLocaleSensitive)
                      	     {
                      	      var text = x.getText();
                      	      var token = new websheet.parse.referenceToken(text,x.getStartIndex(),"number");
                      	       
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


                    break;
                case 5 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:352:5: x= DOUBLEQUOT_STRING
                    root_0 = this.adaptor.nil();

                    x=this.match(this.input,DOUBLEQUOT_STRING,JsFormulaCommaParserParser.FOLLOW_DOUBLEQUOT_STRING_in_atom769); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    x_tree = this.adaptor.create(x);
                    this.adaptor.addChild(root_0, x_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                           
                         
                            
                    }


                    break;
                case 6 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:356:5: (brace= P_OPEN ) ( ( INTERSECT )? expr ( INTERSECT )? ebrace= P_CLOSE )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:356:5: (brace= P_OPEN )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:356:6: brace= P_OPEN
                    brace=this.match(this.input,P_OPEN,JsFormulaCommaParserParser.FOLLOW_P_OPEN_in_atom783); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    brace_tree = this.adaptor.create(brace);
                    this.adaptor.addChild(root_0, brace_tree);
                    }



                    if ( this.state.backtracking===0 ) {

                        		if(this.bLocaleSensitive){
                        			//TODO: remove index?
                      			var token = new websheet.parse.referenceToken("leftbrace",brace.getStartIndex());
                      			this.tokenList.push(token);
                      		}
                      	
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:363:5: ( ( INTERSECT )? expr ( INTERSECT )? ebrace= P_CLOSE )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:364:6: ( INTERSECT )? expr ( INTERSECT )? ebrace= P_CLOSE
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:364:6: ( INTERSECT )?
                    var alt21=2;
                    var LA21_0 = this.input.LA(1);

                    if ( (LA21_0==INTERSECT) ) {
                        alt21=1;
                    }
                    switch (alt21) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                            INTERSECT16=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom799); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT16_tree = this.adaptor.create(INTERSECT16);
                            this.adaptor.addChild(root_0, INTERSECT16_tree);
                            }


                            break;

                    }

                    this.pushFollow(JsFormulaCommaParserParser.FOLLOW_expr_in_atom808);
                    expr17=this.expr();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, expr17.getTree());
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:366:6: ( INTERSECT )?
                    var alt22=2;
                    var LA22_0 = this.input.LA(1);

                    if ( (LA22_0==INTERSECT) ) {
                        alt22=1;
                    }
                    switch (alt22) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                            INTERSECT18=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom815); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT18_tree = this.adaptor.create(INTERSECT18);
                            this.adaptor.addChild(root_0, INTERSECT18_tree);
                            }


                            break;

                    }

                    ebrace=this.match(this.input,P_CLOSE,JsFormulaCommaParserParser.FOLLOW_P_CLOSE_in_atom822); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    ebrace_tree = this.adaptor.create(ebrace);
                    this.adaptor.addChild(root_0, ebrace_tree);
                    }
                    if ( this.state.backtracking===0 ) {

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
                          
                    }





                    break;
                case 7 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:408:5: folded
                    root_0 = this.adaptor.nil();

                    this.pushFollow(JsFormulaCommaParserParser.FOLLOW_folded_in_atom832);
                    folded19=this.folded();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, folded19.getTree());
                    if ( this.state.backtracking===0 ) {
                    }


                    break;
                case 8 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:446:5: (a= ARRAY_FORMULAR_START (wp1= INTERSECT )? ) ( (firToken= atom ) ( ( ( (wp2= INTERSECT )? sep= ARG_SEP (wp3= INTERSECT )? ) ) (token= atom ) )* )? ( (wp4= INTERSECT )? ARRAY_FORMULAR_END )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:446:5: (a= ARRAY_FORMULAR_START (wp1= INTERSECT )? )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:446:6: a= ARRAY_FORMULAR_START (wp1= INTERSECT )?
                    a=this.match(this.input,ARRAY_FORMULAR_START,JsFormulaCommaParserParser.FOLLOW_ARRAY_FORMULAR_START_in_atom858); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    a_tree = this.adaptor.create(a);
                    this.adaptor.addChild(root_0, a_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:446:31: (wp1= INTERSECT )?
                    var alt23=2;
                    var LA23_0 = this.input.LA(1);

                    if ( (LA23_0==INTERSECT) ) {
                        var LA23_1 = this.input.LA(2);

                        if ( (this.synpred56_JsFormulaCommaParser()) ) {
                            alt23=1;
                        }
                    }
                    switch (alt23) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:446:32: wp1= INTERSECT
                            wp1=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom863); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            wp1_tree = this.adaptor.create(wp1);
                            this.adaptor.addChild(root_0, wp1_tree);
                            }


                            break;

                    }

                    if ( this.state.backtracking===0 ) {

                        	this.inConstArray++;	    	
                         	var arrayInfo = {};
                      	arrayInfo.firColLen = 0; 
                      	arrayInfo.colLen = 0;
                      	// 2D constant array, rowlen > 0
                      	arrayInfo.rowLen = 0;
                      	arrayInfo.text = "{";
                      	arrayInfo.changedText = "{";
                      	if((wp1?wp1.getText():null))
                        		arrayInfo.text += (wp1?wp1.getText():null);
                        	
                        	var tokensCount = this.tokenList.length;
                         
                    }



                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:460:4: ( (firToken= atom ) ( ( ( (wp2= INTERSECT )? sep= ARG_SEP (wp3= INTERSECT )? ) ) (token= atom ) )* )?
                    var alt27=2;
                    var LA27_0 = this.input.LA(1);

                    if ( (LA27_0==PLUS||LA27_0==MINUS||LA27_0==P_OPEN||LA27_0==ARRAY_FORMULAR_START||(LA27_0>=SINGLEQUOT_STRING && LA27_0<=FUNC)) ) {
                        alt27=1;
                    }
                    switch (alt27) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:460:5: (firToken= atom ) ( ( ( (wp2= INTERSECT )? sep= ARG_SEP (wp3= INTERSECT )? ) ) (token= atom ) )*
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:460:5: (firToken= atom )
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:460:6: firToken= atom
                            this.pushFollow(JsFormulaCommaParserParser.FOLLOW_atom_in_atom878);
                            firToken=this.atom();

                            this.state._fsp--;
                            if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, firToken.getTree());
                            if ( this.state.backtracking===0 ) {
                              	
                                   	var tokenSource = this.input.getTokenSource();
                              	var localeSep = websheet.event.FormulaHelper.getArraySepByLocale();
                              	var bArray = websheet.event.FormulaHelper.isConstArray(firToken, tokenSource, arrayInfo, localeSep);
                                 
                            }



                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:465:4: ( ( ( (wp2= INTERSECT )? sep= ARG_SEP (wp3= INTERSECT )? ) ) (token= atom ) )*
                            loop26:
                            do {
                                var alt26=2;
                                var LA26_0 = this.input.LA(1);

                                if ( (LA26_0==INTERSECT) ) {
                                    var LA26_1 = this.input.LA(2);

                                    if ( (LA26_1==ARG_SEP) ) {
                                        alt26=1;
                                    }


                                }
                                else if ( (LA26_0==ARG_SEP) ) {
                                    alt26=1;
                                }


                                switch (alt26) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:465:5: ( ( (wp2= INTERSECT )? sep= ARG_SEP (wp3= INTERSECT )? ) ) (token= atom )
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:465:5: ( ( (wp2= INTERSECT )? sep= ARG_SEP (wp3= INTERSECT )? ) )
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:465:6: ( (wp2= INTERSECT )? sep= ARG_SEP (wp3= INTERSECT )? )
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:465:6: ( (wp2= INTERSECT )? sep= ARG_SEP (wp3= INTERSECT )? )
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:465:7: (wp2= INTERSECT )? sep= ARG_SEP (wp3= INTERSECT )?
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:465:7: (wp2= INTERSECT )?
                                    var alt24=2;
                                    var LA24_0 = this.input.LA(1);

                                    if ( (LA24_0==INTERSECT) ) {
                                        alt24=1;
                                    }
                                    switch (alt24) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:465:8: wp2= INTERSECT
                                            wp2=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom894); if (this.state.failed) return retval;
                                            if ( this.state.backtracking===0 ) {
                                            wp2_tree = this.adaptor.create(wp2);
                                            this.adaptor.addChild(root_0, wp2_tree);
                                            }


                                            break;

                                    }

                                    sep=this.match(this.input,ARG_SEP,JsFormulaCommaParserParser.FOLLOW_ARG_SEP_in_atom900); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    sep_tree = this.adaptor.create(sep);
                                    this.adaptor.addChild(root_0, sep_tree);
                                    }
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:465:36: (wp3= INTERSECT )?
                                    var alt25=2;
                                    var LA25_0 = this.input.LA(1);

                                    if ( (LA25_0==INTERSECT) ) {
                                        alt25=1;
                                    }
                                    switch (alt25) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:465:37: wp3= INTERSECT
                                            wp3=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom905); if (this.state.failed) return retval;
                                            if ( this.state.backtracking===0 ) {
                                            wp3_tree = this.adaptor.create(wp3);
                                            this.adaptor.addChild(root_0, wp3_tree);
                                            }


                                            break;

                                    }




                                    if ( this.state.backtracking===0 ) {

                                         	if (bArray) {
                                         		if((wp2?wp2.getText():null)) {
                                        			arrayInfo.text += (wp2?wp2.getText():null);
                                        			wp2 = null;
                                        		}
                                      	   	var speText = sep.getText();
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
                                      		if((wp3?wp3.getText():null)) {
                                        			arrayInfo.text += (wp3?wp3.getText():null);
                                        			wp3 = null;
                                        		}
                                      	}
                                         
                                    }



                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:493:4: (token= atom )
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:493:5: token= atom
                                    this.pushFollow(JsFormulaCommaParserParser.FOLLOW_atom_in_atom921);
                                    token=this.atom();

                                    this.state._fsp--;
                                    if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, token.getTree());
                                    if ( this.state.backtracking===0 ) {

                                         	if (bArray)
                                      		bArray = websheet.event.FormulaHelper.isConstArray(token, tokenSource, arrayInfo, localeSep);
                                          
                                    }





                                    break;

                                default :
                                    break loop26;
                                }
                            } while (true);



                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:497:4: ( (wp4= INTERSECT )? ARRAY_FORMULAR_END )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:497:5: (wp4= INTERSECT )? ARRAY_FORMULAR_END
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:497:5: (wp4= INTERSECT )?
                    var alt28=2;
                    var LA28_0 = this.input.LA(1);

                    if ( (LA28_0==INTERSECT) ) {
                        alt28=1;
                    }
                    switch (alt28) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:497:6: wp4= INTERSECT
                            wp4=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom938); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            wp4_tree = this.adaptor.create(wp4);
                            this.adaptor.addChild(root_0, wp4_tree);
                            }


                            break;

                    }

                    ARRAY_FORMULAR_END20=this.match(this.input,ARRAY_FORMULAR_END,JsFormulaCommaParserParser.FOLLOW_ARRAY_FORMULAR_END_in_atom942); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    ARRAY_FORMULAR_END20_tree = this.adaptor.create(ARRAY_FORMULAR_END20);
                    this.adaptor.addChild(root_0, ARRAY_FORMULAR_END20_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                         	// when match atom, some tokens(number/boolean/errorname) has been inserted in tokenlist, remove them
                         	var curTokensCount = this.tokenList.length;
                         	for (var i = tokensCount; i < curTokensCount; i++)
                         		this.tokenList.pop();
                         
                         	if((wp4?wp4.getText():null))
                        		arrayInfo.text += (wp4?wp4.getText():null);
                         	this.inConstArray--;
                         	// {1,2;3} should return false
                         	if (arrayInfo.rowLen && (arrayInfo.firColLen != arrayInfo.colLen))
                      		bArray = false;
                          	var startIndex = a.getStartIndex();
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
                         
                    }





                    break;
                case 9 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:5: name1= ( ERRORNAME | NAME | NAME1 ) (op= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME | LOCALE_NUMBER ) (wp3= INTERSECT )? )? (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )?
                    root_0 = this.adaptor.nil();

                    name1=this.input.LT(1);
                    if ( (this.input.LA(1)>=NAME && this.input.LA(1)<=ERRORNAME)||this.input.LA(1)==NAME1 ) {
                        this.input.consume();
                        if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(name1));
                        this.state.errorRecovery=false;this.state.failed=false;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                        throw mse;
                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:34: (op= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME | LOCALE_NUMBER ) (wp3= INTERSECT )? )?
                    var alt31=2;
                    var LA31_0 = this.input.LA(1);

                    if ( (LA31_0==INTERSECT_ODS) ) {
                        alt31=1;
                    }
                    switch (alt31) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:36: op= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME | LOCALE_NUMBER ) (wp3= INTERSECT )?
                            op=this.match(this.input,INTERSECT_ODS,JsFormulaCommaParserParser.FOLLOW_INTERSECT_ODS_in_atom997); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            op_tree = this.adaptor.create(op);
                            this.adaptor.addChild(root_0, op_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:53: (wp2= INTERSECT )?
                            var alt29=2;
                            var LA29_0 = this.input.LA(1);

                            if ( (LA29_0==INTERSECT) ) {
                                alt29=1;
                            }
                            switch (alt29) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:54: wp2= INTERSECT
                                    wp2=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom1002); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    wp2_tree = this.adaptor.create(wp2);
                                    this.adaptor.addChild(root_0, wp2_tree);
                                    }


                                    break;

                            }

                            ename=this.input.LT(1);
                            if ( (this.input.LA(1)>=LOCALE_NUMBER && this.input.LA(1)<=ERRORNAME) ) {
                                this.input.consume();
                                if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(ename));
                                this.state.errorRecovery=false;this.state.failed=false;
                            }
                            else {
                                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                throw mse;
                            }

                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:107: (wp3= INTERSECT )?
                            var alt30=2;
                            var LA30_0 = this.input.LA(1);

                            if ( (LA30_0==INTERSECT) ) {
                                var LA30_1 = this.input.LA(2);

                                if ( (this.synpred68_JsFormulaCommaParser()) ) {
                                    alt30=1;
                                }
                            }
                            switch (alt30) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:108: wp3= INTERSECT
                                    wp3=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom1019); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    wp3_tree = this.adaptor.create(wp3);
                                    this.adaptor.addChild(root_0, wp3_tree);
                                    }


                                    break;

                            }



                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:126: (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )?
                    var alt35=2;
                    alt35 = this.dfa35.predict(this.input);
                    switch (alt35) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:128: m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER )
                            m=this.match(this.input,COLON,JsFormulaCommaParserParser.FOLLOW_COLON_in_atom1029); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            m_tree = this.adaptor.create(m);
                            this.adaptor.addChild(root_0, m_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:136: ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )?
                            var alt34=2;
                            var LA34_0 = this.input.LA(1);

                            if ( (LA34_0==INTERSECT||LA34_0==NAME1) ) {
                                alt34=1;
                            }
                            else if ( (LA34_0==NAME) ) {
                                var LA34_2 = this.input.LA(2);

                                if ( (LA34_2==INTERSECT_ODS) ) {
                                    alt34=1;
                                }
                            }
                            switch (alt34) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:137: (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )?
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:137: (wp4= INTERSECT )?
                                    var alt32=2;
                                    var LA32_0 = this.input.LA(1);

                                    if ( (LA32_0==INTERSECT) ) {
                                        alt32=1;
                                    }
                                    switch (alt32) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:138: wp4= INTERSECT
                                            wp4=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom1035); if (this.state.failed) return retval;
                                            if ( this.state.backtracking===0 ) {
                                            wp4_tree = this.adaptor.create(wp4);
                                            this.adaptor.addChild(root_0, wp4_tree);
                                            }


                                            break;

                                    }

                                    name2=this.input.LT(1);
                                    if ( this.input.LA(1)==NAME||this.input.LA(1)==NAME1 ) {
                                        this.input.consume();
                                        if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(name2));
                                        this.state.errorRecovery=false;this.state.failed=false;
                                    }
                                    else {
                                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                        var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                        throw mse;
                                    }

                                    op2=this.match(this.input,INTERSECT_ODS,JsFormulaCommaParserParser.FOLLOW_INTERSECT_ODS_in_atom1049); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    op2_tree = this.adaptor.create(op2);
                                    this.adaptor.addChild(root_0, op2_tree);
                                    }
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:191: (wp6= INTERSECT )?
                                    var alt33=2;
                                    var LA33_0 = this.input.LA(1);

                                    if ( (LA33_0==INTERSECT) ) {
                                        alt33=1;
                                    }
                                    switch (alt33) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:192: wp6= INTERSECT
                                            wp6=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom1054); if (this.state.failed) return retval;
                                            if ( this.state.backtracking===0 ) {
                                            wp6_tree = this.adaptor.create(wp6);
                                            this.adaptor.addChild(root_0, wp6_tree);
                                            }


                                            break;

                                    }



                                    break;

                            }

                            endName=this.input.LT(1);
                            if ( (this.input.LA(1)>=LOCALE_NUMBER && this.input.LA(1)<=ERRORNAME) ) {
                                this.input.consume();
                                if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(endName));
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

                      	
                      		if(this.bMS && !this.bNotParseRef){
                      			var text = (name1?name1.getText():null); //"=Sheet1!A1" should merge to one name token.
                      			var textWithWp = text;
                      			if((ename?ename.getText():null)){
                      				text += '!';
                      				textWithWp += '!';
                      				if((wp2?wp2.getText():null))
                      					textWithWp += (wp2?wp2.getText():null)
                      				text += (ename?ename.getText():null);
                      				textWithWp += (ename?ename.getText():null);
                      				if((wp3?wp3.getText():null))
                      					textWithWp += (wp3?wp3.getText():null);
                      			}
                      			if((m?m.getText():null)){
                      				text += (m?m.getText():null);
                      				textWithWp += (m?m.getText():null);
                      				if((op2?op2.getText():null)){
                      					if((wp4?wp4.getText():null))
                      						textWithWp += (wp4?wp4.getText():null);
                      					text += (name2?name2.getText():null);
                      					textWithWp += (name2?name2.getText():null);
                      					text += (op2?op2.getText():null);
                      					textWithWp += (op2?op2.getText():null);
                      					if((wp6?wp6.getText():null))
                      						textWithWp += (wp6?wp6.getText():null);
                      				}
                      				text += (endName?endName.getText():null);
                      				textWithWp += (endName?endName.getText():null);
                      			}else{
                              		//TODO: Sheet!1 , Sheet!a
                              		
                              	}
                      			var token = websheet.event.FormulaHelper.generateToken(text, this.bMS, this.bAutoCorrect,this.errTokenList);
                      			if(token)
                      			{
                      				if(token.getType() == websheet.Constant.FormulaTokenType.SHEET_SEP)
                      				{
                      					var index = text.split(":")[0].lastIndexOf(token.getText());
                      					token.setIndex(name1.getStartIndex() + index);
                      					this.errTokenList.push(token);
                      				}else
                      				{
                      					var tmp = name1.getStartIndex();
                      					token.setTextOnly(textWithWp);
                      					token.setIndex(tmp);
                      				    this.tokenList.push(token);
                      				}
                      				
                      			}
                      		}
                      		else{ // ODF format
                      			
                      			var text = (name1?name1.getText():null);
                      			var textWithWp = text;
                      			var token,index;
                      			if(!this.bNotParseRef){
                      				token = websheet.event.FormulaHelper.generateToken((name1?name1.getText():null), this.bMS, this.bAutoCorrect,this.errTokenList);
                      				if(token){
                      					token.setIndex(name1.getStartIndex());
                      					this.tokenList.push(token);
                      				}
                      			}
                      			if((op?op.getText():null)){
                      				if(this.bLocaleSensitive){
                      				
                      					token = new websheet.parse.referenceToken((op?op.getText():null),op.getStartIndex());
                      					this.tokenList.push(token);
                      				}
                      				if(!this.bNotParseRef){
                      					token = websheet.event.FormulaHelper.generateToken((ename?ename.getText():null), this.bMS, this.bAutoCorrect,this.errTokenList);
                      					if(token){
                      						token.setIndex(ename.getStartIndex());
                      						this.tokenList.push(token);
                      					}
                      				}
                      			}
                      			
                      			if((m?m.getText():null)){ // generate range
                      				if(!this.bNotParseRef)
                      					this.tokenList.pop();
                      				if((op?op.getText():null)){ // the range starts from ename
                      					text = (ename?ename.getText():null);
                      					textWithWp = (ename?ename.getText():null);
                      					index = ename.getStartIndex();
                      				}else{	// the range starts from name1
                      					text = (name1?name1.getText():null);
                      					textWithWp = (name1?name1.getText():null);
                      					index = name1.getStartIndex();
                      				}

                      				if((wp3?wp3.getText():null))
                      					textWithWp += (wp3?wp3.getText():null);
                      				text += (m?m.getText():null);
                      				textWithWp += (m?m.getText():null);				
                      				if((op2?op2.getText():null)){
                      					if((wp4?wp4.getText():null))
                      						textWithWp += (wp4?wp4.getText():null);
                      					text += (name2?name2.getText():null);
                      					textWithWp += (name2?name2.getText():null);
                      					if(!this.bNotParseRef){
                      						token = websheet.event.FormulaHelper.generateToken(text, this.bMS, this.bAutoCorrect,this.errTokenList);
                      						if(token){
                      							token.setIndex(index);
                      							token.setTextOnly(textWithWp);
                      							this.tokenList.push(token);
                      						}
                      					}
                      					if(this.bLocaleSensitive){
                      						token = new websheet.parse.referenceToken((op2?op2.getText():null),op2.getStartIndex());
                      						this.tokenList.push(token);
                      					}
                      				}else{
                      					if((wp6?wp6.getText():null))
                      						textWithWp += (wp6?wp6.getText():null);
                      					text += (endName?endName.getText():null);
                      					textWithWp += (endName?endName.getText():null);
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
        JsFormulaCommaParserParser.atom_list_return = function(){};
        org.antlr.lang.extend(JsFormulaCommaParserParser.atom_list_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:664:1: atom_list returns [String value] : a= atom_type ( ( ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type )* ) ;
    // $ANTLR start "atom_list"
    atom_list: function() {
        var retval = new JsFormulaCommaParserParser.atom_list_return();
        retval.start = this.input.LT(1);
        var atom_list_StartIndex = this.input.index();
        var root_0 = null;

        var sep = null;
        var INTERSECT21 = null;
        var INTERSECT22 = null;
         var a = null;
         var n = null;

        var sep_tree=null;
        var INTERSECT21_tree=null;
        var INTERSECT22_tree=null;

        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 4) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:665:3: (a= atom_type ( ( ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type )* ) )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:665:5: a= atom_type ( ( ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type )* )
            root_0 = this.adaptor.nil();

            this.pushFollow(JsFormulaCommaParserParser.FOLLOW_atom_type_in_atom_list1091);
            a=this.atom_type();

            this.state._fsp--;
            if (this.state.failed) return retval;
            if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, a.getTree());
            if ( this.state.backtracking===0 ) {

                
            }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:667:3: ( ( ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type )* )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:667:4: ( ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type )*
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:667:4: ( ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type )*
            loop39:
            do {
                var alt39=2;
                var LA39_0 = this.input.LA(1);

                if ( (LA39_0==INTERSECT) ) {
                    var LA39_1 = this.input.LA(2);

                    if ( (LA39_1==ARG_SEP) ) {
                        alt39=1;
                    }


                }
                else if ( (LA39_0==ARG_SEP) ) {
                    alt39=1;
                }


                switch (alt39) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:667:5: ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:667:5: ( INTERSECT )?
                    var alt37=2;
                    var LA37_0 = this.input.LA(1);

                    if ( (LA37_0==INTERSECT) ) {
                        alt37=1;
                    }
                    switch (alt37) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                            INTERSECT21=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom_list1099); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT21_tree = this.adaptor.create(INTERSECT21);
                            this.adaptor.addChild(root_0, INTERSECT21_tree);
                            }


                            break;

                    }

                    sep=this.match(this.input,ARG_SEP,JsFormulaCommaParserParser.FOLLOW_ARG_SEP_in_atom_list1104); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    sep_tree = this.adaptor.create(sep);
                    this.adaptor.addChild(root_0, sep_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:667:28: ( INTERSECT )?
                    var alt38=2;
                    var LA38_0 = this.input.LA(1);

                    if ( (LA38_0==INTERSECT) ) {
                        var LA38_1 = this.input.LA(2);

                        if ( (this.synpred78_JsFormulaCommaParser()) ) {
                            alt38=1;
                        }
                    }
                    switch (alt38) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                            INTERSECT22=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_atom_list1106); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT22_tree = this.adaptor.create(INTERSECT22);
                            this.adaptor.addChild(root_0, INTERSECT22_tree);
                            }


                            break;

                    }

                    if ( this.state.backtracking===0 ) {

                      		if(this.bMS && this.bLocaleSensitive)
                      		{
                      			var token = new websheet.parse.referenceToken((sep?sep.getText():null),sep.getStartIndex());
                      			this.tokenList.push(token);
                      		}
                          
                    }
                    this.pushFollow(JsFormulaCommaParserParser.FOLLOW_atom_type_in_atom_list1113);
                    n=this.atom_type();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, n.getTree());
                    if ( this.state.backtracking===0 ) {
                    }


                    break;

                default :
                    break loop39;
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
            if ( this.state.backtracking>0 ) { this.memoize(this.input, 4, atom_list_StartIndex); }
        }
        return retval;
    },

    // inline static return class
    atom_type_return: (function() {
        JsFormulaCommaParserParser.atom_type_return = function(){};
        org.antlr.lang.extend(JsFormulaCommaParserParser.atom_type_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:676:1: atom_type returns [String value] : (a= expr | );
    // $ANTLR start "atom_type"
    atom_type: function() {
        var retval = new JsFormulaCommaParserParser.atom_type_return();
        retval.start = this.input.LT(1);
        var atom_type_StartIndex = this.input.index();
        var root_0 = null;

         var a = null;


        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 5) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:677:3: (a= expr | )
            var alt40=2;
            var LA40_0 = this.input.LA(1);

            if ( (LA40_0==PLUS||LA40_0==MINUS||LA40_0==P_OPEN||LA40_0==ARRAY_FORMULAR_START||(LA40_0>=SINGLEQUOT_STRING && LA40_0<=FUNC)) ) {
                alt40=1;
            }
            else if ( (LA40_0==EOF||LA40_0==P_CLOSE||(LA40_0>=INTERSECT && LA40_0<=ARG_SEP)) ) {
                alt40=2;
            }
            else {
                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                var nvae =
                    new org.antlr.runtime.NoViableAltException("", 40, 0, this.input);

                throw nvae;
            }
            switch (alt40) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:677:5: a= expr
                    root_0 = this.adaptor.nil();

                    this.pushFollow(JsFormulaCommaParserParser.FOLLOW_expr_in_atom_type1141);
                    a=this.expr();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, a.getTree());
                    if ( this.state.backtracking===0 ) {
                    }


                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:680:4: 
                    root_0 = this.adaptor.nil();

                    if ( this.state.backtracking===0 ) {
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
        JsFormulaCommaParserParser.folded_return = function(){};
        org.antlr.lang.extend(JsFormulaCommaParserParser.folded_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:684:1: folded returns [String value] : ( (f= FUNC | f= NAME b= '(' ) ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE ) | (f= FUNC | f= NAME ( INTERSECT )? b= '(' ) ( ')' ) );
    // $ANTLR start "folded"
    folded: function() {
        var retval = new JsFormulaCommaParserParser.folded_return();
        retval.start = this.input.LT(1);
        var folded_StartIndex = this.input.index();
        var root_0 = null;

        var f = null;
        var b = null;
        var rBrace = null;
        var INTERSECT23 = null;
        var INTERSECT25 = null;
        var INTERSECT26 = null;
        var char_literal27 = null;
         var range24 = null;

        var f_tree=null;
        var b_tree=null;
        var rBrace_tree=null;
        var INTERSECT23_tree=null;
        var INTERSECT25_tree=null;
        var INTERSECT26_tree=null;
        var char_literal27_tree=null;

        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 6) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:686:4: ( (f= FUNC | f= NAME b= '(' ) ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE ) | (f= FUNC | f= NAME ( INTERSECT )? b= '(' ) ( ')' ) )
            var alt46=2;
            var LA46_0 = this.input.LA(1);

            if ( (LA46_0==FUNC) ) {
                var LA46_1 = this.input.LA(2);

                if ( (LA46_1==P_CLOSE) ) {
                    var LA46_3 = this.input.LA(3);

                    if ( (this.synpred84_JsFormulaCommaParser()) ) {
                        alt46=1;
                    }
                    else if ( (true) ) {
                        alt46=2;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 46, 3, this.input);

                        throw nvae;
                    }
                }
                else if ( (LA46_1==PLUS||LA46_1==MINUS||LA46_1==P_OPEN||LA46_1==ARRAY_FORMULAR_START||(LA46_1>=INTERSECT && LA46_1<=FUNC)) ) {
                    alt46=1;
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                    var nvae =
                        new org.antlr.runtime.NoViableAltException("", 46, 1, this.input);

                    throw nvae;
                }
            }
            else if ( (LA46_0==NAME) ) {
                var LA46_2 = this.input.LA(2);

                if ( (LA46_2==P_OPEN) ) {
                    var LA46_5 = this.input.LA(3);

                    if ( (LA46_5==PLUS||LA46_5==MINUS||LA46_5==P_OPEN||LA46_5==ARRAY_FORMULAR_START||(LA46_5>=INTERSECT && LA46_5<=FUNC)) ) {
                        alt46=1;
                    }
                    else if ( (LA46_5==P_CLOSE) ) {
                        var LA46_3 = this.input.LA(4);

                        if ( (this.synpred84_JsFormulaCommaParser()) ) {
                            alt46=1;
                        }
                        else if ( (true) ) {
                            alt46=2;
                        }
                        else {
                            if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                            var nvae =
                                new org.antlr.runtime.NoViableAltException("", 46, 3, this.input);

                            throw nvae;
                        }
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 46, 5, this.input);

                        throw nvae;
                    }
                }
                else if ( (LA46_2==INTERSECT) ) {
                    alt46=2;
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                    var nvae =
                        new org.antlr.runtime.NoViableAltException("", 46, 2, this.input);

                    throw nvae;
                }
            }
            else {
                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                var nvae =
                    new org.antlr.runtime.NoViableAltException("", 46, 0, this.input);

                throw nvae;
            }
            switch (alt46) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:686:6: (f= FUNC | f= NAME b= '(' ) ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:686:6: (f= FUNC | f= NAME b= '(' )
                    var alt41=2;
                    var LA41_0 = this.input.LA(1);

                    if ( (LA41_0==FUNC) ) {
                        alt41=1;
                    }
                    else if ( (LA41_0==NAME) ) {
                        alt41=2;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 41, 0, this.input);

                        throw nvae;
                    }
                    switch (alt41) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:686:7: f= FUNC
                            f=this.match(this.input,FUNC,JsFormulaCommaParserParser.FOLLOW_FUNC_in_folded1182); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            f_tree = this.adaptor.create(f);
                            this.adaptor.addChild(root_0, f_tree);
                            }


                            break;
                        case 2 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:686:18: f= NAME b= '('
                            f=this.match(this.input,NAME,JsFormulaCommaParserParser.FOLLOW_NAME_in_folded1190); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            f_tree = this.adaptor.create(f);
                            this.adaptor.addChild(root_0, f_tree);
                            }
                            b=this.match(this.input,P_OPEN,JsFormulaCommaParserParser.FOLLOW_P_OPEN_in_folded1196); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            b_tree = this.adaptor.create(b);
                            this.adaptor.addChild(root_0, b_tree);
                            }


                            break;

                    }

                    if ( this.state.backtracking===0 ) {

                         		this.inFunc++;
                         		if(this.bLocaleSensitive){
                         			var text = (f?f.getText():null);
                         			//TODO: remove index?
                         			var brcIdx;
                         			var oldName;
                         			if((b?b.getText():null)){
                         				oldName = text.toUpperCase();
                         				brcIdx = b.getStartIndex();
                         			}else{
                         				oldName = text.substring(0,text.length - 1).toUpperCase();
                         				brcIdx = f.getStartIndex()+oldName.length;
                         			}
                      	   	    
                      			var token = new websheet.parse.referenceToken(oldName,f.getStartIndex(),"reffunct");
                      	
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
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:724:5: ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:725:6: ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:725:6: ( INTERSECT )?
                    var alt42=2;
                    var LA42_0 = this.input.LA(1);

                    if ( (LA42_0==INTERSECT) ) {
                        var LA42_1 = this.input.LA(2);

                        if ( (this.synpred82_JsFormulaCommaParser()) ) {
                            alt42=1;
                        }
                    }
                    switch (alt42) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                            INTERSECT23=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_folded1212); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT23_tree = this.adaptor.create(INTERSECT23);
                            this.adaptor.addChild(root_0, INTERSECT23_tree);
                            }


                            break;

                    }

                    this.pushFollow(JsFormulaCommaParserParser.FOLLOW_range_in_folded1220);
                    range24=this.range();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, range24.getTree());
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:727:6: ( INTERSECT )?
                    var alt43=2;
                    var LA43_0 = this.input.LA(1);

                    if ( (LA43_0==INTERSECT) ) {
                        alt43=1;
                    }
                    switch (alt43) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                            INTERSECT25=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_folded1228); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT25_tree = this.adaptor.create(INTERSECT25);
                            this.adaptor.addChild(root_0, INTERSECT25_tree);
                            }


                            break;

                    }

                    rBrace=this.match(this.input,P_CLOSE,JsFormulaCommaParserParser.FOLLOW_P_CLOSE_in_folded1239); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    rBrace_tree = this.adaptor.create(rBrace);
                    this.adaptor.addChild(root_0, rBrace_tree);
                    }
                    if ( this.state.backtracking===0 ) {

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
                      			
                    }





                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:780:6: (f= FUNC | f= NAME ( INTERSECT )? b= '(' ) ( ')' )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:780:6: (f= FUNC | f= NAME ( INTERSECT )? b= '(' )
                    var alt45=2;
                    var LA45_0 = this.input.LA(1);

                    if ( (LA45_0==FUNC) ) {
                        alt45=1;
                    }
                    else if ( (LA45_0==NAME) ) {
                        alt45=2;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 45, 0, this.input);

                        throw nvae;
                    }
                    switch (alt45) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:780:7: f= FUNC
                            f=this.match(this.input,FUNC,JsFormulaCommaParserParser.FOLLOW_FUNC_in_folded1253); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            f_tree = this.adaptor.create(f);
                            this.adaptor.addChild(root_0, f_tree);
                            }


                            break;
                        case 2 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:780:18: f= NAME ( INTERSECT )? b= '('
                            f=this.match(this.input,NAME,JsFormulaCommaParserParser.FOLLOW_NAME_in_folded1262); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            f_tree = this.adaptor.create(f);
                            this.adaptor.addChild(root_0, f_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:780:28: ( INTERSECT )?
                            var alt44=2;
                            var LA44_0 = this.input.LA(1);

                            if ( (LA44_0==INTERSECT) ) {
                                alt44=1;
                            }
                            switch (alt44) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                                    INTERSECT26=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_folded1264); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    INTERSECT26_tree = this.adaptor.create(INTERSECT26);
                                    this.adaptor.addChild(root_0, INTERSECT26_tree);
                                    }


                                    break;

                            }

                            b=this.match(this.input,P_OPEN,JsFormulaCommaParserParser.FOLLOW_P_OPEN_in_folded1269); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            b_tree = this.adaptor.create(b);
                            this.adaptor.addChild(root_0, b_tree);
                            }


                            break;

                    }

                    if ( this.state.backtracking===0 ) {

                         		if(this.bLocaleSensitive){
                         		   	var text = (f?f.getText():null);
                         			var oldName;
                         			if((b?b.getText():null))
                         				oldName = text.toUpperCase();
                         			else
                      				oldName = text.substring(0,text.length - 1).toUpperCase();	   	    	
                      	   	    	
                      			var token = new websheet.parse.referenceToken(oldName,f.getStartIndex(),"reffunct");
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
                         
                         
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:809:6: ( ')' )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:809:7: ')'
                    char_literal27=this.match(this.input,P_CLOSE,JsFormulaCommaParserParser.FOLLOW_P_CLOSE_in_folded1274); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    char_literal27_tree = this.adaptor.create(char_literal27);
                    this.adaptor.addChild(root_0, char_literal27_tree);
                    }
                    if ( this.state.backtracking===0 ) {
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
        JsFormulaCommaParserParser.range_return = function(){};
        org.antlr.lang.extend(JsFormulaCommaParserParser.range_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:812:1: range returns [String value] : (params= atom_list | funct= folded );
    // $ANTLR start "range"
    range: function() {
        var retval = new JsFormulaCommaParserParser.range_return();
        retval.start = this.input.LT(1);
        var range_StartIndex = this.input.index();
        var root_0 = null;

         var params = null;
         var funct = null;


        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 7) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:813:2: (params= atom_list | funct= folded )
            var alt47=2;
            alt47 = this.dfa47.predict(this.input);
            switch (alt47) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:813:4: params= atom_list
                    root_0 = this.adaptor.nil();

                    this.pushFollow(JsFormulaCommaParserParser.FOLLOW_atom_list_in_range1297);
                    params=this.atom_list();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, params.getTree());
                    if ( this.state.backtracking===0 ) {

                      		
                      	
                    }


                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:816:4: funct= folded
                    root_0 = this.adaptor.nil();

                    this.pushFollow(JsFormulaCommaParserParser.FOLLOW_folded_in_range1308);
                    funct=this.folded();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, funct.getTree());
                    if ( this.state.backtracking===0 ) {
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

    // $ANTLR start "synpred5_JsFormulaCommaParser"
    synpred5_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:86:7: (sp= INTERSECT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:86:7: sp= INTERSECT
        sp=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred5_JsFormulaCommaParser423); if (this.state.failed) return ;


    },
    // $ANTLR end "synpred5_JsFormulaCommaParser",

    // $ANTLR start "synpred28_JsFormulaCommaParser"
    synpred28_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:100:3: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:100:3: m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )?
        m=this.input.LT(1);
        if ( (this.input.LA(1)>=COLON && this.input.LA(1)<=CONCATENATION)||(this.input.LA(1)>=AND && this.input.LA(1)<=DIVEQUAL)||(this.input.LA(1)>=EQUAL && this.input.LA(1)<=NOTEQUAL2)||this.input.LA(1)==POW||this.input.LA(1)==MODEQUAL||this.input.LA(1)==ARG_SEP ) {
            this.input.consume();
            this.state.errorRecovery=false;this.state.failed=false;
        }
        else {
            if (this.state.backtracking>0) {this.state.failed=true; return ;}
            var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
            throw mse;
        }

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:137:6: ( INTERSECT )?
        var alt50=2;
        var LA50_0 = this.input.LA(1);

        if ( (LA50_0==INTERSECT) ) {
            alt50=1;
        }
        switch (alt50) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred28_JsFormulaCommaParser518); if (this.state.failed) return ;


                break;

        }



    },
    // $ANTLR end "synpred28_JsFormulaCommaParser",

    // $ANTLR start "synpred29_JsFormulaCommaParser"
    synpred29_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:99:4: ( (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:99:4: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:99:4: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )?
        var alt52=2;
        alt52 = this.dfa52.predict(this.input);
        switch (alt52) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:100:3: m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )?
                m=this.input.LT(1);
                if ( (this.input.LA(1)>=COLON && this.input.LA(1)<=CONCATENATION)||(this.input.LA(1)>=AND && this.input.LA(1)<=DIVEQUAL)||(this.input.LA(1)>=EQUAL && this.input.LA(1)<=NOTEQUAL2)||this.input.LA(1)==POW||this.input.LA(1)==MODEQUAL||this.input.LA(1)==ARG_SEP ) {
                    this.input.consume();
                    this.state.errorRecovery=false;this.state.failed=false;
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return ;}
                    var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                    throw mse;
                }

                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:137:6: ( INTERSECT )?
                var alt51=2;
                var LA51_0 = this.input.LA(1);

                if ( (LA51_0==INTERSECT) ) {
                    alt51=1;
                }
                switch (alt51) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                        this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred29_JsFormulaCommaParser518); if (this.state.failed) return ;


                        break;

                }



                break;

        }

        this.pushFollow(JsFormulaCommaParserParser.FOLLOW_expr_in_synpred29_JsFormulaCommaParser531);
        b=this.expr();

        this.state._fsp--;
        if (this.state.failed) return ;


    },
    // $ANTLR end "synpred29_JsFormulaCommaParser",

    // $ANTLR start "synpred38_JsFormulaCommaParser"
    synpred38_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:198:5: ( (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )? x= LOCALE_NUMBER em= COLON endName= ( NAME | LOCALE_NUMBER ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:198:5: (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )? x= LOCALE_NUMBER em= COLON endName= ( NAME | LOCALE_NUMBER )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:198:5: (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )?
        var alt57=2;
        var LA57_0 = this.input.LA(1);

        if ( (LA57_0==LOCALE_NUMBER) ) {
            var LA57_1 = this.input.LA(2);

            if ( (LA57_1==INTERSECT_ODS) ) {
                alt57=1;
            }
        }
        else if ( (LA57_0==SINGLEQUOT_STRING) ) {
            alt57=1;
        }
        switch (alt57) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:198:6: sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )?
                sn=this.input.LT(1);
                if ( (this.input.LA(1)>=SINGLEQUOT_STRING && this.input.LA(1)<=LOCALE_NUMBER) ) {
                    this.input.consume();
                    this.state.errorRecovery=false;this.state.failed=false;
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return ;}
                    var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                    throw mse;
                }

                m=this.match(this.input,INTERSECT_ODS,JsFormulaCommaParserParser.FOLLOW_INTERSECT_ODS_in_synpred38_JsFormulaCommaParser612); if (this.state.failed) return ;
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:198:59: (wp2= INTERSECT )?
                var alt56=2;
                var LA56_0 = this.input.LA(1);

                if ( (LA56_0==INTERSECT) ) {
                    alt56=1;
                }
                switch (alt56) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:198:60: wp2= INTERSECT
                        wp2=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred38_JsFormulaCommaParser617); if (this.state.failed) return ;


                        break;

                }



                break;

        }

        x=this.match(this.input,LOCALE_NUMBER,JsFormulaCommaParserParser.FOLLOW_LOCALE_NUMBER_in_synpred38_JsFormulaCommaParser625); if (this.state.failed) return ;
        em=this.match(this.input,COLON,JsFormulaCommaParserParser.FOLLOW_COLON_in_synpred38_JsFormulaCommaParser629); if (this.state.failed) return ;
        endName=this.input.LT(1);
        if ( (this.input.LA(1)>=LOCALE_NUMBER && this.input.LA(1)<=NAME) ) {
            this.input.consume();
            this.state.errorRecovery=false;this.state.failed=false;
        }
        else {
            if (this.state.backtracking>0) {this.state.failed=true; return ;}
            var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
            throw mse;
        }



    },
    // $ANTLR end "synpred38_JsFormulaCommaParser",

    // $ANTLR start "synpred42_JsFormulaCommaParser"
    synpred42_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:102: (wp3= INTERSECT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:102: wp3= INTERSECT
        wp3=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred42_JsFormulaCommaParser710); if (this.state.failed) return ;


    },
    // $ANTLR end "synpred42_JsFormulaCommaParser",

    // $ANTLR start "synpred49_JsFormulaCommaParser"
    synpred49_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:122: (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:122: em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME )
        em=this.match(this.input,COLON,JsFormulaCommaParserParser.FOLLOW_COLON_in_synpred49_JsFormulaCommaParser720); if (this.state.failed) return ;
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:131: ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )?
        var alt64=2;
        var LA64_0 = this.input.LA(1);

        if ( (LA64_0==INTERSECT||(LA64_0>=SINGLEQUOT_STRING && LA64_0<=LOCALE_NUMBER)) ) {
            alt64=1;
        }
        switch (alt64) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:132: (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )?
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:132: (wp4= INTERSECT )?
                var alt62=2;
                var LA62_0 = this.input.LA(1);

                if ( (LA62_0==INTERSECT) ) {
                    alt62=1;
                }
                switch (alt62) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:133: wp4= INTERSECT
                        wp4=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred49_JsFormulaCommaParser726); if (this.state.failed) return ;


                        break;

                }

                x2=this.input.LT(1);
                if ( (this.input.LA(1)>=SINGLEQUOT_STRING && this.input.LA(1)<=LOCALE_NUMBER) ) {
                    this.input.consume();
                    this.state.errorRecovery=false;this.state.failed=false;
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return ;}
                    var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                    throw mse;
                }

                m2=this.match(this.input,INTERSECT_ODS,JsFormulaCommaParserParser.FOLLOW_INTERSECT_ODS_in_synpred49_JsFormulaCommaParser740); if (this.state.failed) return ;
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:203: (wp6= INTERSECT )?
                var alt63=2;
                var LA63_0 = this.input.LA(1);

                if ( (LA63_0==INTERSECT) ) {
                    alt63=1;
                }
                switch (alt63) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:204: wp6= INTERSECT
                        wp6=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred49_JsFormulaCommaParser745); if (this.state.failed) return ;


                        break;

                }



                break;

        }

        endName=this.input.LT(1);
        if ( (this.input.LA(1)>=NAME && this.input.LA(1)<=ERRORNAME) ) {
            this.input.consume();
            this.state.errorRecovery=false;this.state.failed=false;
        }
        else {
            if (this.state.backtracking>0) {this.state.failed=true; return ;}
            var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
            throw mse;
        }



    },
    // $ANTLR end "synpred49_JsFormulaCommaParser",

    // $ANTLR start "synpred50_JsFormulaCommaParser"
    synpred50_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:7: (x= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )? (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )? )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:7: x= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )? (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )?
        x=this.input.LT(1);
        if ( (this.input.LA(1)>=SINGLEQUOT_STRING && this.input.LA(1)<=LOCALE_NUMBER) ) {
            this.input.consume();
            this.state.errorRecovery=false;this.state.failed=false;
        }
        else {
            if (this.state.backtracking>0) {this.state.failed=true; return ;}
            var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
            throw mse;
        }

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:43: (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )?
        var alt67=2;
        var LA67_0 = this.input.LA(1);

        if ( (LA67_0==INTERSECT_ODS) ) {
            alt67=1;
        }
        switch (alt67) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:45: m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )?
                m=this.match(this.input,INTERSECT_ODS,JsFormulaCommaParserParser.FOLLOW_INTERSECT_ODS_in_synpred50_JsFormulaCommaParser690); if (this.state.failed) return ;
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:61: (wp2= INTERSECT )?
                var alt65=2;
                var LA65_0 = this.input.LA(1);

                if ( (LA65_0==INTERSECT) ) {
                    alt65=1;
                }
                switch (alt65) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:62: wp2= INTERSECT
                        wp2=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred50_JsFormulaCommaParser695); if (this.state.failed) return ;


                        break;

                }

                ename=this.input.LT(1);
                if ( (this.input.LA(1)>=NAME && this.input.LA(1)<=ERRORNAME) ) {
                    this.input.consume();
                    this.state.errorRecovery=false;this.state.failed=false;
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return ;}
                    var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                    throw mse;
                }

                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:101: (wp3= INTERSECT )?
                var alt66=2;
                var LA66_0 = this.input.LA(1);

                if ( (LA66_0==INTERSECT) ) {
                    alt66=1;
                }
                switch (alt66) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:102: wp3= INTERSECT
                        wp3=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred50_JsFormulaCommaParser710); if (this.state.failed) return ;


                        break;

                }



                break;

        }

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:120: (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )?
        var alt71=2;
        var LA71_0 = this.input.LA(1);

        if ( (LA71_0==COLON) ) {
            alt71=1;
        }
        switch (alt71) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:122: em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME )
                em=this.match(this.input,COLON,JsFormulaCommaParserParser.FOLLOW_COLON_in_synpred50_JsFormulaCommaParser720); if (this.state.failed) return ;
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:131: ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )?
                var alt70=2;
                var LA70_0 = this.input.LA(1);

                if ( (LA70_0==INTERSECT||(LA70_0>=SINGLEQUOT_STRING && LA70_0<=LOCALE_NUMBER)) ) {
                    alt70=1;
                }
                switch (alt70) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:132: (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )?
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:132: (wp4= INTERSECT )?
                        var alt68=2;
                        var LA68_0 = this.input.LA(1);

                        if ( (LA68_0==INTERSECT) ) {
                            alt68=1;
                        }
                        switch (alt68) {
                            case 1 :
                                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:133: wp4= INTERSECT
                                wp4=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred50_JsFormulaCommaParser726); if (this.state.failed) return ;


                                break;

                        }

                        x2=this.input.LT(1);
                        if ( (this.input.LA(1)>=SINGLEQUOT_STRING && this.input.LA(1)<=LOCALE_NUMBER) ) {
                            this.input.consume();
                            this.state.errorRecovery=false;this.state.failed=false;
                        }
                        else {
                            if (this.state.backtracking>0) {this.state.failed=true; return ;}
                            var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                            throw mse;
                        }

                        m2=this.match(this.input,INTERSECT_ODS,JsFormulaCommaParserParser.FOLLOW_INTERSECT_ODS_in_synpred50_JsFormulaCommaParser740); if (this.state.failed) return ;
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:203: (wp6= INTERSECT )?
                        var alt69=2;
                        var LA69_0 = this.input.LA(1);

                        if ( (LA69_0==INTERSECT) ) {
                            alt69=1;
                        }
                        switch (alt69) {
                            case 1 :
                                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:250:204: wp6= INTERSECT
                                wp6=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred50_JsFormulaCommaParser745); if (this.state.failed) return ;


                                break;

                        }



                        break;

                }

                endName=this.input.LT(1);
                if ( (this.input.LA(1)>=NAME && this.input.LA(1)<=ERRORNAME) ) {
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
    // $ANTLR end "synpred50_JsFormulaCommaParser",

    // $ANTLR start "synpred55_JsFormulaCommaParser"
    synpred55_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:408:5: ( folded )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:408:5: folded
        this.pushFollow(JsFormulaCommaParserParser.FOLLOW_folded_in_synpred55_JsFormulaCommaParser832);
        this.folded();

        this.state._fsp--;
        if (this.state.failed) return ;


    },
    // $ANTLR end "synpred55_JsFormulaCommaParser",

    // $ANTLR start "synpred56_JsFormulaCommaParser"
    synpred56_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:446:32: (wp1= INTERSECT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:446:32: wp1= INTERSECT
        wp1=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred56_JsFormulaCommaParser863); if (this.state.failed) return ;


    },
    // $ANTLR end "synpred56_JsFormulaCommaParser",

    // $ANTLR start "synpred68_JsFormulaCommaParser"
    synpred68_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:108: (wp3= INTERSECT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:108: wp3= INTERSECT
        wp3=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred68_JsFormulaCommaParser1019); if (this.state.failed) return ;


    },
    // $ANTLR end "synpred68_JsFormulaCommaParser",

    // $ANTLR start "synpred76_JsFormulaCommaParser"
    synpred76_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:128: (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:128: m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER )
        m=this.match(this.input,COLON,JsFormulaCommaParserParser.FOLLOW_COLON_in_synpred76_JsFormulaCommaParser1029); if (this.state.failed) return ;
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:136: ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )?
        var alt91=2;
        var LA91_0 = this.input.LA(1);

        if ( (LA91_0==INTERSECT||LA91_0==NAME1) ) {
            alt91=1;
        }
        else if ( (LA91_0==NAME) ) {
            var LA91_2 = this.input.LA(2);

            if ( (LA91_2==INTERSECT_ODS) ) {
                alt91=1;
            }
        }
        switch (alt91) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:137: (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )?
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:137: (wp4= INTERSECT )?
                var alt89=2;
                var LA89_0 = this.input.LA(1);

                if ( (LA89_0==INTERSECT) ) {
                    alt89=1;
                }
                switch (alt89) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:138: wp4= INTERSECT
                        wp4=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred76_JsFormulaCommaParser1035); if (this.state.failed) return ;


                        break;

                }

                name2=this.input.LT(1);
                if ( this.input.LA(1)==NAME||this.input.LA(1)==NAME1 ) {
                    this.input.consume();
                    this.state.errorRecovery=false;this.state.failed=false;
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return ;}
                    var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                    throw mse;
                }

                op2=this.match(this.input,INTERSECT_ODS,JsFormulaCommaParserParser.FOLLOW_INTERSECT_ODS_in_synpred76_JsFormulaCommaParser1049); if (this.state.failed) return ;
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:191: (wp6= INTERSECT )?
                var alt90=2;
                var LA90_0 = this.input.LA(1);

                if ( (LA90_0==INTERSECT) ) {
                    alt90=1;
                }
                switch (alt90) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:533:192: wp6= INTERSECT
                        wp6=this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred76_JsFormulaCommaParser1054); if (this.state.failed) return ;


                        break;

                }



                break;

        }

        endName=this.input.LT(1);
        if ( (this.input.LA(1)>=LOCALE_NUMBER && this.input.LA(1)<=ERRORNAME) ) {
            this.input.consume();
            this.state.errorRecovery=false;this.state.failed=false;
        }
        else {
            if (this.state.backtracking>0) {this.state.failed=true; return ;}
            var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
            throw mse;
        }



    },
    // $ANTLR end "synpred76_JsFormulaCommaParser",

    // $ANTLR start "synpred78_JsFormulaCommaParser"
    synpred78_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:667:28: ( INTERSECT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:667:28: INTERSECT
        this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred78_JsFormulaCommaParser1106); if (this.state.failed) return ;


    },
    // $ANTLR end "synpred78_JsFormulaCommaParser",

    // $ANTLR start "synpred82_JsFormulaCommaParser"
    synpred82_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:725:6: ( INTERSECT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:725:6: INTERSECT
        this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred82_JsFormulaCommaParser1212); if (this.state.failed) return ;


    },
    // $ANTLR end "synpred82_JsFormulaCommaParser",

    // $ANTLR start "synpred84_JsFormulaCommaParser"
    synpred84_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:686:6: ( (f= FUNC | f= NAME b= '(' ) ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:686:6: (f= FUNC | f= NAME b= '(' ) ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:686:6: (f= FUNC | f= NAME b= '(' )
        var alt94=2;
        var LA94_0 = this.input.LA(1);

        if ( (LA94_0==FUNC) ) {
            alt94=1;
        }
        else if ( (LA94_0==NAME) ) {
            alt94=2;
        }
        else {
            if (this.state.backtracking>0) {this.state.failed=true; return ;}
            var nvae =
                new org.antlr.runtime.NoViableAltException("", 94, 0, this.input);

            throw nvae;
        }
        switch (alt94) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:686:7: f= FUNC
                f=this.match(this.input,FUNC,JsFormulaCommaParserParser.FOLLOW_FUNC_in_synpred84_JsFormulaCommaParser1182); if (this.state.failed) return ;


                break;
            case 2 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:686:18: f= NAME b= '('
                f=this.match(this.input,NAME,JsFormulaCommaParserParser.FOLLOW_NAME_in_synpred84_JsFormulaCommaParser1190); if (this.state.failed) return ;
                b=this.match(this.input,P_OPEN,JsFormulaCommaParserParser.FOLLOW_P_OPEN_in_synpred84_JsFormulaCommaParser1196); if (this.state.failed) return ;


                break;

        }

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:724:5: ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:725:6: ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:725:6: ( INTERSECT )?
        var alt95=2;
        var LA95_0 = this.input.LA(1);

        if ( (LA95_0==INTERSECT) ) {
            var LA95_1 = this.input.LA(2);

            if ( (this.synpred82_JsFormulaCommaParser()) ) {
                alt95=1;
            }
        }
        switch (alt95) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred84_JsFormulaCommaParser1212); if (this.state.failed) return ;


                break;

        }

        this.pushFollow(JsFormulaCommaParserParser.FOLLOW_range_in_synpred84_JsFormulaCommaParser1220);
        this.range();

        this.state._fsp--;
        if (this.state.failed) return ;
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:727:6: ( INTERSECT )?
        var alt96=2;
        var LA96_0 = this.input.LA(1);

        if ( (LA96_0==INTERSECT) ) {
            alt96=1;
        }
        switch (alt96) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:0:0: INTERSECT
                this.match(this.input,INTERSECT,JsFormulaCommaParserParser.FOLLOW_INTERSECT_in_synpred84_JsFormulaCommaParser1228); if (this.state.failed) return ;


                break;

        }

        rBrace=this.match(this.input,P_CLOSE,JsFormulaCommaParserParser.FOLLOW_P_CLOSE_in_synpred84_JsFormulaCommaParser1239); if (this.state.failed) return ;





    },
    // $ANTLR end "synpred84_JsFormulaCommaParser",

    // $ANTLR start "synpred87_JsFormulaCommaParser"
    synpred87_JsFormulaCommaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:813:4: (params= atom_list )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaCommaParser.g:813:4: params= atom_list
        this.pushFollow(JsFormulaCommaParserParser.FOLLOW_atom_list_in_synpred87_JsFormulaCommaParser1297);
        params=this.atom_list();

        this.state._fsp--;
        if (this.state.failed) return ;


    },
    // $ANTLR end "synpred87_JsFormulaCommaParser"

    // Delegated rules



    synpred29_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred29_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred28_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred28_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred49_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred49_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred38_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred38_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred5_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred5_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred68_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred68_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred56_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred56_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred78_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred78_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred55_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred55_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred87_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred87_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred76_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred76_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred42_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred42_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred84_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred84_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred50_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred50_JsFormulaCommaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred82_JsFormulaCommaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred82_JsFormulaCommaParser_fragment(); // can never throw exception
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

org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA9_eotS:
        "\u0012\uffff",
    DFA9_eofS:
        "\u0001\u0001\u0011\uffff",
    DFA9_minS:
        "\u0001\u0004\u0001\uffff\u000a\u0000\u0001\uffff\u0001\u0000\u0002"+
    "\uffff\u0001\u0000\u0001\uffff",
    DFA9_maxS:
        "\u0001\u0028\u0001\uffff\u000a\u0000\u0001\uffff\u0001\u0000\u0002"+
    "\uffff\u0001\u0000\u0001\uffff",
    DFA9_acceptS:
        "\u0001\uffff\u0001\u0002\u000f\uffff\u0001\u0001",
    DFA9_specialS:
        "\u0002\uffff\u0001\u0000\u0001\u0001\u0001\u0002\u0001\u0003\u0001"+
    "\u0004\u0001\u0005\u0001\u0006\u0001\u0007\u0001\u0008\u0001\u0009\u0001"+
    "\uffff\u0001\u000a\u0002\uffff\u0001\u000b\u0001\uffff}>",
    DFA9_transitionS: [
            "\u0002\u0010\u0001\uffff\u0001\u0010\u0001\u0003\u0001\u0010"+
            "\u0001\u0002\u0005\u0010\u0001\u0007\u0001\u0001\u0007\u0010"+
            "\u0002\uffff\u0001\u0010\u0001\uffff\u0001\u0010\u0001\u000a"+
            "\u0002\u0001\u0001\u000d\u0001\u0005\u0001\u0004\u0001\u0009"+
            "\u0001\u000b\u0001\u0006\u0001\u000b\u0001\u0008",
            "",
            "\u0001\uffff",
            "\u0001\uffff",
            "\u0001\uffff",
            "\u0001\uffff",
            "\u0001\uffff",
            "\u0001\uffff",
            "\u0001\uffff",
            "\u0001\uffff",
            "\u0001\uffff",
            "\u0001\uffff",
            "",
            "\u0001\uffff",
            "",
            "",
            "\u0001\uffff",
            ""
    ]
});

org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA9_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA9_eotS),
    DFA9_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA9_eofS),
    DFA9_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA9_minS),
    DFA9_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA9_maxS),
    DFA9_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA9_acceptS),
    DFA9_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA9_specialS),
    DFA9_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaCommaParserParser.DFA9_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA9_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaCommaParserParser.DFA9 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 9;
    this.eot = JsFormulaCommaParserParser.DFA9_eot;
    this.eof = JsFormulaCommaParserParser.DFA9_eof;
    this.min = JsFormulaCommaParserParser.DFA9_min;
    this.max = JsFormulaCommaParserParser.DFA9_max;
    this.accept = JsFormulaCommaParserParser.DFA9_accept;
    this.special = JsFormulaCommaParserParser.DFA9_special;
    this.transition = JsFormulaCommaParserParser.DFA9_transition;
};

org.antlr.lang.extend(JsFormulaCommaParserParser.DFA9, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "()* loopback of 99:3: ( (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr )*";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA9_2 = input.LA(1);

                             
                            var index9_2 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaCommaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_2);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA9_3 = input.LA(1);

                             
                            var index9_3 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaCommaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_3);
                            if ( s>=0 ) return s;
                            break;
                        case 2 : 
                            var LA9_4 = input.LA(1);

                             
                            var index9_4 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaCommaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_4);
                            if ( s>=0 ) return s;
                            break;
                        case 3 : 
                            var LA9_5 = input.LA(1);

                             
                            var index9_5 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaCommaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_5);
                            if ( s>=0 ) return s;
                            break;
                        case 4 : 
                            var LA9_6 = input.LA(1);

                             
                            var index9_6 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaCommaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_6);
                            if ( s>=0 ) return s;
                            break;
                        case 5 : 
                            var LA9_7 = input.LA(1);

                             
                            var index9_7 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaCommaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_7);
                            if ( s>=0 ) return s;
                            break;
                        case 6 : 
                            var LA9_8 = input.LA(1);

                             
                            var index9_8 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaCommaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_8);
                            if ( s>=0 ) return s;
                            break;
                        case 7 : 
                            var LA9_9 = input.LA(1);

                             
                            var index9_9 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaCommaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_9);
                            if ( s>=0 ) return s;
                            break;
                        case 8 : 
                            var LA9_10 = input.LA(1);

                             
                            var index9_10 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaCommaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_10);
                            if ( s>=0 ) return s;
                            break;
                        case 9 : 
                            var LA9_11 = input.LA(1);

                             
                            var index9_11 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaCommaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_11);
                            if ( s>=0 ) return s;
                            break;
                        case 10 : 
                            var LA9_13 = input.LA(1);

                             
                            var index9_13 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaCommaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_13);
                            if ( s>=0 ) return s;
                            break;
                        case 11 : 
                            var LA9_16 = input.LA(1);

                             
                            var index9_16 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaCommaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_16);
                            if ( s>=0 ) return s;
                            break;
            }
        }).call(this.recognizer, s, input);
        if (!org.antlr.lang.isUndefined(retval)) {
            return retval;
        }
        if (this.recognizer.state.backtracking>0) {this.recognizer.state.failed=true; return -1;}
        var nvae =
            new org.antlr.runtime.NoViableAltException(this.getDescription(), 9, _s, input);
        this.error(nvae);
        throw nvae;
    },
    dummy: null
});
org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA8_eotS:
        "\u000c\uffff",
    DFA8_eofS:
        "\u000c\uffff",
    DFA8_minS:
        "\u0001\u0004\u0002\u0000\u0009\uffff",
    DFA8_maxS:
        "\u0001\u0028\u0002\u0000\u0009\uffff",
    DFA8_acceptS:
        "\u0003\uffff\u0001\u0001\u0001\u0002\u0007\uffff",
    DFA8_specialS:
        "\u0001\uffff\u0001\u0000\u0001\u0001\u0009\uffff}>",
    DFA8_transitionS: [
            "\u0002\u0003\u0001\uffff\u0001\u0003\u0001\u0002\u0001\u0003"+
            "\u0001\u0001\u0005\u0003\u0001\u0004\u0001\uffff\u0007\u0003"+
            "\u0002\uffff\u0001\u0003\u0001\uffff\u0001\u0003\u0001\u0004"+
            "\u0002\uffff\u0001\u0003\u0007\u0004",
            "\u0001\uffff",
            "\u0001\uffff",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
    ]
});

org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA8_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA8_eotS),
    DFA8_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA8_eofS),
    DFA8_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA8_minS),
    DFA8_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA8_maxS),
    DFA8_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA8_acceptS),
    DFA8_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA8_specialS),
    DFA8_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaCommaParserParser.DFA8_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA8_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaCommaParserParser.DFA8 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 8;
    this.eot = JsFormulaCommaParserParser.DFA8_eot;
    this.eof = JsFormulaCommaParserParser.DFA8_eof;
    this.min = JsFormulaCommaParserParser.DFA8_min;
    this.max = JsFormulaCommaParserParser.DFA8_max;
    this.accept = JsFormulaCommaParserParser.DFA8_accept;
    this.special = JsFormulaCommaParserParser.DFA8_special;
    this.transition = JsFormulaCommaParserParser.DFA8_transition;
};

org.antlr.lang.extend(JsFormulaCommaParserParser.DFA8, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "99:4: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )?";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA8_1 = input.LA(1);

                             
                            var index8_1 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred28_JsFormulaCommaParser()) ) {s = 3;}

                            else if ( (true) ) {s = 4;}

                             
                            input.seek(index8_1);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA8_2 = input.LA(1);

                             
                            var index8_2 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred28_JsFormulaCommaParser()) ) {s = 3;}

                            else if ( (true) ) {s = 4;}

                             
                            input.seek(index8_2);
                            if ( s>=0 ) return s;
                            break;
            }
        }).call(this.recognizer, s, input);
        if (!org.antlr.lang.isUndefined(retval)) {
            return retval;
        }
        if (this.recognizer.state.backtracking>0) {this.recognizer.state.failed=true; return -1;}
        var nvae =
            new org.antlr.runtime.NoViableAltException(this.getDescription(), 8, _s, input);
        this.error(nvae);
        throw nvae;
    },
    dummy: null
});
org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA36_eotS:
        "\u000d\uffff",
    DFA36_eofS:
        "\u000d\uffff",
    DFA36_minS:
        "\u0001\u0008\u0002\uffff\u0002\u0000\u0003\uffff\u0001\u0000\u0004"+
    "\uffff",
    DFA36_maxS:
        "\u0001\u0028\u0002\uffff\u0002\u0000\u0003\uffff\u0001\u0000\u0004"+
    "\uffff",
    DFA36_acceptS:
        "\u0001\uffff\u0001\u0001\u0001\u0002\u0002\uffff\u0001\u0005\u0001"+
    "\u0006\u0001\u0007\u0001\uffff\u0001\u0008\u0001\u0009\u0001\u0003\u0001"+
    "\u0004",
    DFA36_specialS:
        "\u0003\uffff\u0001\u0000\u0001\u0001\u0003\uffff\u0001\u0002\u0004"+
    "\uffff}>",
    DFA36_transitionS: [
            "\u0001\u0002\u0001\uffff\u0001\u0001\u0005\uffff\u0001\u0006"+
            "\u000d\uffff\u0001\u0009\u0003\uffff\u0001\u0004\u0001\u0003"+
            "\u0001\u0008\u0001\u000a\u0001\u0005\u0001\u000a\u0001\u0007",
            "",
            "",
            "\u0001\uffff",
            "\u0001\uffff",
            "",
            "",
            "",
            "\u0001\uffff",
            "",
            "",
            "",
            ""
    ]
});

org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA36_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA36_eotS),
    DFA36_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA36_eofS),
    DFA36_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA36_minS),
    DFA36_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA36_maxS),
    DFA36_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA36_acceptS),
    DFA36_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA36_specialS),
    DFA36_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaCommaParserParser.DFA36_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA36_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaCommaParserParser.DFA36 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 36;
    this.eot = JsFormulaCommaParserParser.DFA36_eot;
    this.eof = JsFormulaCommaParserParser.DFA36_eof;
    this.min = JsFormulaCommaParserParser.DFA36_min;
    this.max = JsFormulaCommaParserParser.DFA36_max;
    this.accept = JsFormulaCommaParserParser.DFA36_accept;
    this.special = JsFormulaCommaParserParser.DFA36_special;
    this.transition = JsFormulaCommaParserParser.DFA36_transition;
};

org.antlr.lang.extend(JsFormulaCommaParserParser.DFA36, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "187:1: atom returns [String value] : ( '-' ( INTERSECT )? (b= atom ) | '+' ( INTERSECT )? (b= atom ) | (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )? x= LOCALE_NUMBER em= COLON endName= ( NAME | LOCALE_NUMBER ) | x= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )? (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )? | x= DOUBLEQUOT_STRING | (brace= P_OPEN ) ( ( INTERSECT )? expr ( INTERSECT )? ebrace= P_CLOSE ) | folded | (a= ARRAY_FORMULAR_START (wp1= INTERSECT )? ) ( (firToken= atom ) ( ( ( (wp2= INTERSECT )? sep= ARG_SEP (wp3= INTERSECT )? ) ) (token= atom ) )* )? ( (wp4= INTERSECT )? ARRAY_FORMULAR_END ) | name1= ( ERRORNAME | NAME | NAME1 ) (op= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME | LOCALE_NUMBER ) (wp3= INTERSECT )? )? (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )? );";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA36_3 = input.LA(1);

                             
                            var index36_3 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred38_JsFormulaCommaParser()) ) {s = 11;}

                            else if ( (this.synpred50_JsFormulaCommaParser()) ) {s = 12;}

                             
                            input.seek(index36_3);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA36_4 = input.LA(1);

                             
                            var index36_4 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred38_JsFormulaCommaParser()) ) {s = 11;}

                            else if ( (this.synpred50_JsFormulaCommaParser()) ) {s = 12;}

                             
                            input.seek(index36_4);
                            if ( s>=0 ) return s;
                            break;
                        case 2 : 
                            var LA36_8 = input.LA(1);

                             
                            var index36_8 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred55_JsFormulaCommaParser()) ) {s = 7;}

                            else if ( (true) ) {s = 10;}

                             
                            input.seek(index36_8);
                            if ( s>=0 ) return s;
                            break;
            }
        }).call(this.recognizer, s, input);
        if (!org.antlr.lang.isUndefined(retval)) {
            return retval;
        }
        if (this.recognizer.state.backtracking>0) {this.recognizer.state.failed=true; return -1;}
        var nvae =
            new org.antlr.runtime.NoViableAltException(this.getDescription(), 36, _s, input);
        this.error(nvae);
        throw nvae;
    },
    dummy: null
});
org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA20_eotS:
        "\u000c\uffff",
    DFA20_eofS:
        "\u0001\u0002\u0003\uffff\u0002\u0002\u0006\uffff",
    DFA20_minS:
        "\u0001\u0004\u0001\u0008\u0001\uffff\u0001\u0008\u0002\u0004\u0002"+
    "\u0000\u0001\u0020\u0001\uffff\u0001\u0023\u0001\u0000",
    DFA20_maxS:
        "\u0002\u0028\u0001\uffff\u0003\u0028\u0002\u0000\u0001\u0025\u0001"+
    "\uffff\u0001\u0025\u0001\u0000",
    DFA20_acceptS:
        "\u0002\uffff\u0001\u0002\u0006\uffff\u0001\u0001\u0002\uffff",
    DFA20_specialS:
        "\u0006\uffff\u0001\u0002\u0001\u0001\u0003\uffff\u0001\u0000}>",
    DFA20_transitionS: [
            "\u0001\u0001\u0001\u0002\u0001\uffff\u0012\u0002\u0002\uffff"+
            "\u000e\u0002",
            "\u0001\u0002\u0001\uffff\u0001\u0002\u0005\uffff\u0001\u0002"+
            "\u000d\uffff\u0001\u0002\u0001\uffff\u0001\u0003\u0001\uffff"+
            "\u0001\u0005\u0001\u0004\u0001\u0006\u0001\u0007\u0003\u0002",
            "",
            "\u0001\u0002\u0001\uffff\u0001\u0002\u0005\uffff\u0001\u0002"+
            "\u000d\uffff\u0001\u0002\u0003\uffff\u0001\u0005\u0001\u0004"+
            "\u0005\u0002",
            "\u0002\u0002\u0001\u0008\u0012\u0002\u0002\uffff\u000e\u0002",
            "\u0002\u0002\u0001\u0008\u0012\u0002\u0002\uffff\u000e\u0002",
            "\u0001\uffff",
            "\u0001\uffff",
            "\u0001\u000a\u0002\uffff\u0001\u0002\u0002\u000b",
            "",
            "\u0001\u0002\u0002\u000b",
            "\u0001\uffff"
    ]
});

org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA20_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA20_eotS),
    DFA20_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA20_eofS),
    DFA20_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA20_minS),
    DFA20_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA20_maxS),
    DFA20_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA20_acceptS),
    DFA20_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA20_specialS),
    DFA20_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaCommaParserParser.DFA20_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA20_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaCommaParserParser.DFA20 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 20;
    this.eot = JsFormulaCommaParserParser.DFA20_eot;
    this.eof = JsFormulaCommaParserParser.DFA20_eof;
    this.min = JsFormulaCommaParserParser.DFA20_min;
    this.max = JsFormulaCommaParserParser.DFA20_max;
    this.accept = JsFormulaCommaParserParser.DFA20_accept;
    this.special = JsFormulaCommaParserParser.DFA20_special;
    this.transition = JsFormulaCommaParserParser.DFA20_transition;
};

org.antlr.lang.extend(JsFormulaCommaParserParser.DFA20, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "250:120: (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )?";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA20_11 = input.LA(1);

                             
                            var index20_11 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred49_JsFormulaCommaParser()) ) {s = 9;}

                            else if ( (true) ) {s = 2;}

                             
                            input.seek(index20_11);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA20_7 = input.LA(1);

                             
                            var index20_7 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred49_JsFormulaCommaParser()) ) {s = 9;}

                            else if ( (true) ) {s = 2;}

                             
                            input.seek(index20_7);
                            if ( s>=0 ) return s;
                            break;
                        case 2 : 
                            var LA20_6 = input.LA(1);

                             
                            var index20_6 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred49_JsFormulaCommaParser()) ) {s = 9;}

                            else if ( (true) ) {s = 2;}

                             
                            input.seek(index20_6);
                            if ( s>=0 ) return s;
                            break;
            }
        }).call(this.recognizer, s, input);
        if (!org.antlr.lang.isUndefined(retval)) {
            return retval;
        }
        if (this.recognizer.state.backtracking>0) {this.recognizer.state.failed=true; return -1;}
        var nvae =
            new org.antlr.runtime.NoViableAltException(this.getDescription(), 20, _s, input);
        this.error(nvae);
        throw nvae;
    },
    dummy: null
});
org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA35_eotS:
        "\u000d\uffff",
    DFA35_eofS:
        "\u0001\u0002\u0004\uffff\u0001\u0002\u0002\uffff\u0001\u0002\u0004"+
    "\uffff",
    DFA35_minS:
        "\u0001\u0004\u0001\u0008\u0001\uffff\u0001\u0008\u0001\u0000\u0001"+
    "\u0004\u0002\u0000\u0001\u0004\u0001\uffff\u0001\u0020\u0001\u0023\u0001"+
    "\u0000",
    DFA35_maxS:
        "\u0002\u0028\u0001\uffff\u0001\u0028\u0001\u0000\u0001\u0028\u0002"+
    "\u0000\u0001\u0028\u0001\uffff\u0002\u0025\u0001\u0000",
    DFA35_acceptS:
        "\u0002\uffff\u0001\u0002\u0006\uffff\u0001\u0001\u0003\uffff",
    DFA35_specialS:
        "\u0004\uffff\u0001\u0000\u0001\uffff\u0001\u0001\u0001\u0003\u0004"+
    "\uffff\u0001\u0002}>",
    DFA35_transitionS: [
            "\u0001\u0001\u0001\u0002\u0001\uffff\u0012\u0002\u0002\uffff"+
            "\u000e\u0002",
            "\u0001\u0002\u0001\uffff\u0001\u0002\u0005\uffff\u0001\u0002"+
            "\u000d\uffff\u0001\u0002\u0001\uffff\u0001\u0003\u0001\uffff"+
            "\u0001\u0002\u0001\u0006\u0001\u0004\u0001\u0007\u0001\u0002"+
            "\u0001\u0005\u0001\u0002",
            "",
            "\u0001\u0002\u0001\uffff\u0001\u0002\u0005\uffff\u0001\u0002"+
            "\u000d\uffff\u0001\u0002\u0003\uffff\u0002\u0002\u0001\u0008"+
            "\u0002\u0002\u0001\u0005\u0001\u0002",
            "\u0001\uffff",
            "\u0002\u0002\u0001\u000a\u0012\u0002\u0002\uffff\u000e\u0002",
            "\u0001\uffff",
            "\u0001\uffff",
            "\u0002\u0002\u0001\u000a\u0012\u0002\u0002\uffff\u000e\u0002",
            "",
            "\u0001\u000b\u0002\uffff\u0003\u000c",
            "\u0003\u000c",
            "\u0001\uffff"
    ]
});

org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA35_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA35_eotS),
    DFA35_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA35_eofS),
    DFA35_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA35_minS),
    DFA35_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA35_maxS),
    DFA35_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA35_acceptS),
    DFA35_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA35_specialS),
    DFA35_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaCommaParserParser.DFA35_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA35_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaCommaParserParser.DFA35 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 35;
    this.eot = JsFormulaCommaParserParser.DFA35_eot;
    this.eof = JsFormulaCommaParserParser.DFA35_eof;
    this.min = JsFormulaCommaParserParser.DFA35_min;
    this.max = JsFormulaCommaParserParser.DFA35_max;
    this.accept = JsFormulaCommaParserParser.DFA35_accept;
    this.special = JsFormulaCommaParserParser.DFA35_special;
    this.transition = JsFormulaCommaParserParser.DFA35_transition;
};

org.antlr.lang.extend(JsFormulaCommaParserParser.DFA35, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "533:126: (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )?";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA35_4 = input.LA(1);

                             
                            var index35_4 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred76_JsFormulaCommaParser()) ) {s = 9;}

                            else if ( (true) ) {s = 2;}

                             
                            input.seek(index35_4);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA35_6 = input.LA(1);

                             
                            var index35_6 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred76_JsFormulaCommaParser()) ) {s = 9;}

                            else if ( (true) ) {s = 2;}

                             
                            input.seek(index35_6);
                            if ( s>=0 ) return s;
                            break;
                        case 2 : 
                            var LA35_12 = input.LA(1);

                             
                            var index35_12 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred76_JsFormulaCommaParser()) ) {s = 9;}

                            else if ( (true) ) {s = 2;}

                             
                            input.seek(index35_12);
                            if ( s>=0 ) return s;
                            break;
                        case 3 : 
                            var LA35_7 = input.LA(1);

                             
                            var index35_7 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred76_JsFormulaCommaParser()) ) {s = 9;}

                            else if ( (true) ) {s = 2;}

                             
                            input.seek(index35_7);
                            if ( s>=0 ) return s;
                            break;
            }
        }).call(this.recognizer, s, input);
        if (!org.antlr.lang.isUndefined(retval)) {
            return retval;
        }
        if (this.recognizer.state.backtracking>0) {this.recognizer.state.failed=true; return -1;}
        var nvae =
            new org.antlr.runtime.NoViableAltException(this.getDescription(), 35, _s, input);
        this.error(nvae);
        throw nvae;
    },
    dummy: null
});
org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA47_eotS:
        "\u000f\uffff",
    DFA47_eofS:
        "\u000f\uffff",
    DFA47_minS:
        "\u0001\u0008\u0006\uffff\u0002\u0000\u0006\uffff",
    DFA47_maxS:
        "\u0001\u0028\u0006\uffff\u0002\u0000\u0006\uffff",
    DFA47_acceptS:
        "\u0001\uffff\u0001\u0001\u000c\uffff\u0001\u0002",
    DFA47_specialS:
        "\u0007\uffff\u0001\u0000\u0001\u0001\u0006\uffff}>",
    DFA47_transitionS: [
            "\u0001\u0001\u0001\uffff\u0001\u0001\u0005\uffff\u0002\u0001"+
            "\u000c\uffff\u0001\u0001\u0001\uffff\u0004\u0001\u0001\u0008"+
            "\u0003\u0001\u0001\u0007",
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

org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA47_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA47_eotS),
    DFA47_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA47_eofS),
    DFA47_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA47_minS),
    DFA47_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA47_maxS),
    DFA47_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA47_acceptS),
    DFA47_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA47_specialS),
    DFA47_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaCommaParserParser.DFA47_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA47_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaCommaParserParser.DFA47 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 47;
    this.eot = JsFormulaCommaParserParser.DFA47_eot;
    this.eof = JsFormulaCommaParserParser.DFA47_eof;
    this.min = JsFormulaCommaParserParser.DFA47_min;
    this.max = JsFormulaCommaParserParser.DFA47_max;
    this.accept = JsFormulaCommaParserParser.DFA47_accept;
    this.special = JsFormulaCommaParserParser.DFA47_special;
    this.transition = JsFormulaCommaParserParser.DFA47_transition;
};

org.antlr.lang.extend(JsFormulaCommaParserParser.DFA47, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "812:1: range returns [String value] : (params= atom_list | funct= folded );";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA47_7 = input.LA(1);

                             
                            var index47_7 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred87_JsFormulaCommaParser()) ) {s = 1;}

                            else if ( (true) ) {s = 14;}

                             
                            input.seek(index47_7);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA47_8 = input.LA(1);

                             
                            var index47_8 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred87_JsFormulaCommaParser()) ) {s = 1;}

                            else if ( (true) ) {s = 14;}

                             
                            input.seek(index47_8);
                            if ( s>=0 ) return s;
                            break;
            }
        }).call(this.recognizer, s, input);
        if (!org.antlr.lang.isUndefined(retval)) {
            return retval;
        }
        if (this.recognizer.state.backtracking>0) {this.recognizer.state.failed=true; return -1;}
        var nvae =
            new org.antlr.runtime.NoViableAltException(this.getDescription(), 47, _s, input);
        this.error(nvae);
        throw nvae;
    },
    dummy: null
});
org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA52_eotS:
        "\u000c\uffff",
    DFA52_eofS:
        "\u000c\uffff",
    DFA52_minS:
        "\u0001\u0004\u0002\u0000\u0009\uffff",
    DFA52_maxS:
        "\u0001\u0028\u0002\u0000\u0009\uffff",
    DFA52_acceptS:
        "\u0003\uffff\u0001\u0001\u0001\u0002\u0007\uffff",
    DFA52_specialS:
        "\u0001\uffff\u0001\u0000\u0001\u0001\u0009\uffff}>",
    DFA52_transitionS: [
            "\u0002\u0003\u0001\uffff\u0001\u0003\u0001\u0002\u0001\u0003"+
            "\u0001\u0001\u0005\u0003\u0001\u0004\u0001\uffff\u0007\u0003"+
            "\u0002\uffff\u0001\u0003\u0001\uffff\u0001\u0003\u0001\u0004"+
            "\u0002\uffff\u0001\u0003\u0007\u0004",
            "\u0001\uffff",
            "\u0001\uffff",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
    ]
});

org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    DFA52_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA52_eotS),
    DFA52_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA52_eofS),
    DFA52_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA52_minS),
    DFA52_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaCommaParserParser.DFA52_maxS),
    DFA52_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA52_acceptS),
    DFA52_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA52_specialS),
    DFA52_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaCommaParserParser.DFA52_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaCommaParserParser.DFA52_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaCommaParserParser.DFA52 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 52;
    this.eot = JsFormulaCommaParserParser.DFA52_eot;
    this.eof = JsFormulaCommaParserParser.DFA52_eof;
    this.min = JsFormulaCommaParserParser.DFA52_min;
    this.max = JsFormulaCommaParserParser.DFA52_max;
    this.accept = JsFormulaCommaParserParser.DFA52_accept;
    this.special = JsFormulaCommaParserParser.DFA52_special;
    this.transition = JsFormulaCommaParserParser.DFA52_transition;
};

org.antlr.lang.extend(JsFormulaCommaParserParser.DFA52, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "99:4: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )?";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA52_1 = input.LA(1);

                             
                            var index52_1 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred28_JsFormulaCommaParser()) ) {s = 3;}

                            else if ( (true) ) {s = 4;}

                             
                            input.seek(index52_1);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA52_2 = input.LA(1);

                             
                            var index52_2 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred28_JsFormulaCommaParser()) ) {s = 3;}

                            else if ( (true) ) {s = 4;}

                             
                            input.seek(index52_2);
                            if ( s>=0 ) return s;
                            break;
            }
        }).call(this.recognizer, s, input);
        if (!org.antlr.lang.isUndefined(retval)) {
            return retval;
        }
        if (this.recognizer.state.backtracking>0) {this.recognizer.state.failed=true; return -1;}
        var nvae =
            new org.antlr.runtime.NoViableAltException(this.getDescription(), 52, _s, input);
        this.error(nvae);
        throw nvae;
    },
    dummy: null
});
 

// public class variables
org.antlr.lang.augmentObject(JsFormulaCommaParserParser, {
    tokenNames: ["<invalid>", "<EOR>", "<DOWN>", "<UP>", "COLON", "CONCATENATION", "INTERSECT_ODS", "AND", "PLUS", "PLUSEQUAL", "MINUS", "MINUSEQUAL", "MULT", "MULTEEQUAL", "DIV", "DIVEQUAL", "P_OPEN", "P_CLOSE", "EQUAL", "LESS", "LESSEQUAL", "GREATER", "GREATEREQUAL", "NOTEQUAL", "NOTEQUAL2", "AMPERSAND", "OR", "POW", "MODE", "MODEQUAL", "ARRAY_FORMULAR_START", "ARRAY_FORMULAR_END", "INTERSECT", "ARG_SEP", "SINGLEQUOT_STRING", "LOCALE_NUMBER", "NAME", "ERRORNAME", "DOUBLEQUOT_STRING", "NAME1", "FUNC", "NONZERO_NUMBER", "DIGIT", "INT", "SPACE1", "NUMSEP", "LT", "COMMAOrSPACE", "KEYCHARACTER", "ODF_COLUMN", "ODF_COL_RANGE", "ODF_PREWORD", "ODF_PRELIST", "ODF_TABLE", "WHITESPACE", "SPACE"],
    FOLLOW_EQUAL_in_prog347: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_prog349: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_expr_in_prog352: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_EOF_in_prog357: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_ARRAY_FORMULAR_START_in_prog363: new org.antlr.runtime.BitSet([0x00040000, 0x00000000]),
    FOLLOW_EQUAL_in_prog365: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_expr_in_prog377: new org.antlr.runtime.BitSet([0xC0010500, 0x000001FD]),
    FOLLOW_ARRAY_FORMULAR_END_in_prog382: new org.antlr.runtime.BitSet([0x00000000, 0x00000000]),
    FOLLOW_EOF_in_prog384: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_atom_in_expr407: new org.antlr.runtime.BitSet([0x79FDFFB2, 0x000001FF]),
    FOLLOW_INTERSECT_in_expr423: new org.antlr.runtime.BitSet([0x79FDFFB2, 0x000001FF]),
    FOLLOW_MODE_in_expr435: new org.antlr.runtime.BitSet([0x79FDFFB2, 0x000001FF]),
    FOLLOW_set_in_expr449: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_expr518: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_expr_in_expr531: new org.antlr.runtime.BitSet([0x69FDFFB2, 0x000001FF]),
    FOLLOW_MINUS_in_atom561: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_atom563: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_atom_in_atom569: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_PLUS_in_atom576: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_atom578: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_atom_in_atom584: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_atom604: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_atom612: new org.antlr.runtime.BitSet([0x00000000, 0x00000009]),
    FOLLOW_INTERSECT_in_atom617: new org.antlr.runtime.BitSet([0x00000000, 0x00000008]),
    FOLLOW_LOCALE_NUMBER_in_atom625: new org.antlr.runtime.BitSet([0x00000010, 0x00000000]),
    FOLLOW_COLON_in_atom629: new org.antlr.runtime.BitSet([0x00000000, 0x00000018]),
    FOLLOW_set_in_atom634: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_atom680: new org.antlr.runtime.BitSet([0x00000052, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_atom690: new org.antlr.runtime.BitSet([0x00000000, 0x00000031]),
    FOLLOW_INTERSECT_in_atom695: new org.antlr.runtime.BitSet([0x00000000, 0x00000030]),
    FOLLOW_set_in_atom701: new org.antlr.runtime.BitSet([0x00000012, 0x00000001]),
    FOLLOW_INTERSECT_in_atom710: new org.antlr.runtime.BitSet([0x00000012, 0x00000000]),
    FOLLOW_COLON_in_atom720: new org.antlr.runtime.BitSet([0x00000000, 0x0000003D]),
    FOLLOW_INTERSECT_in_atom726: new org.antlr.runtime.BitSet([0x00000000, 0x0000000C]),
    FOLLOW_set_in_atom732: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_atom740: new org.antlr.runtime.BitSet([0x00000000, 0x00000031]),
    FOLLOW_INTERSECT_in_atom745: new org.antlr.runtime.BitSet([0x00000000, 0x00000030]),
    FOLLOW_set_in_atom753: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_DOUBLEQUOT_STRING_in_atom769: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_P_OPEN_in_atom783: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_atom799: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_expr_in_atom808: new org.antlr.runtime.BitSet([0x00020000, 0x00000001]),
    FOLLOW_INTERSECT_in_atom815: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_P_CLOSE_in_atom822: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_folded_in_atom832: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_ARRAY_FORMULAR_START_in_atom858: new org.antlr.runtime.BitSet([0xC0010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_atom863: new org.antlr.runtime.BitSet([0xC0010500, 0x000001FD]),
    FOLLOW_atom_in_atom878: new org.antlr.runtime.BitSet([0x80000000, 0x00000003]),
    FOLLOW_INTERSECT_in_atom894: new org.antlr.runtime.BitSet([0x00000000, 0x00000002]),
    FOLLOW_ARG_SEP_in_atom900: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_atom905: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_atom_in_atom921: new org.antlr.runtime.BitSet([0x80000000, 0x00000003]),
    FOLLOW_INTERSECT_in_atom938: new org.antlr.runtime.BitSet([0x80000000, 0x00000000]),
    FOLLOW_ARRAY_FORMULAR_END_in_atom942: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_atom985: new org.antlr.runtime.BitSet([0x00000052, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_atom997: new org.antlr.runtime.BitSet([0x00000000, 0x00000039]),
    FOLLOW_INTERSECT_in_atom1002: new org.antlr.runtime.BitSet([0x00000000, 0x00000038]),
    FOLLOW_set_in_atom1008: new org.antlr.runtime.BitSet([0x00000012, 0x00000001]),
    FOLLOW_INTERSECT_in_atom1019: new org.antlr.runtime.BitSet([0x00000012, 0x00000000]),
    FOLLOW_COLON_in_atom1029: new org.antlr.runtime.BitSet([0x00000000, 0x000000B9]),
    FOLLOW_INTERSECT_in_atom1035: new org.antlr.runtime.BitSet([0x00000000, 0x00000090]),
    FOLLOW_set_in_atom1041: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_atom1049: new org.antlr.runtime.BitSet([0x00000000, 0x00000039]),
    FOLLOW_INTERSECT_in_atom1054: new org.antlr.runtime.BitSet([0x00000000, 0x00000038]),
    FOLLOW_set_in_atom1063: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_atom_type_in_atom_list1091: new org.antlr.runtime.BitSet([0x00000002, 0x00000003]),
    FOLLOW_INTERSECT_in_atom_list1099: new org.antlr.runtime.BitSet([0x00000000, 0x00000002]),
    FOLLOW_ARG_SEP_in_atom_list1104: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_INTERSECT_in_atom_list1106: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_atom_type_in_atom_list1113: new org.antlr.runtime.BitSet([0x00000002, 0x00000003]),
    FOLLOW_expr_in_atom_type1141: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_FUNC_in_folded1182: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_NAME_in_folded1190: new org.antlr.runtime.BitSet([0x00010000, 0x00000000]),
    FOLLOW_P_OPEN_in_folded1196: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_INTERSECT_in_folded1212: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_range_in_folded1220: new org.antlr.runtime.BitSet([0x00020000, 0x00000001]),
    FOLLOW_INTERSECT_in_folded1228: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_P_CLOSE_in_folded1239: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_FUNC_in_folded1253: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_NAME_in_folded1262: new org.antlr.runtime.BitSet([0x00010000, 0x00000001]),
    FOLLOW_INTERSECT_in_folded1264: new org.antlr.runtime.BitSet([0x00010000, 0x00000000]),
    FOLLOW_P_OPEN_in_folded1269: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_P_CLOSE_in_folded1274: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_atom_list_in_range1297: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_folded_in_range1308: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INTERSECT_in_synpred5_JsFormulaCommaParser423: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_synpred28_JsFormulaCommaParser449: new org.antlr.runtime.BitSet([0x00000002, 0x00000001]),
    FOLLOW_INTERSECT_in_synpred28_JsFormulaCommaParser518: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_synpred29_JsFormulaCommaParser449: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_synpred29_JsFormulaCommaParser518: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_expr_in_synpred29_JsFormulaCommaParser531: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_synpred38_JsFormulaCommaParser604: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_synpred38_JsFormulaCommaParser612: new org.antlr.runtime.BitSet([0x00000000, 0x00000009]),
    FOLLOW_INTERSECT_in_synpred38_JsFormulaCommaParser617: new org.antlr.runtime.BitSet([0x00000000, 0x00000008]),
    FOLLOW_LOCALE_NUMBER_in_synpred38_JsFormulaCommaParser625: new org.antlr.runtime.BitSet([0x00000010, 0x00000000]),
    FOLLOW_COLON_in_synpred38_JsFormulaCommaParser629: new org.antlr.runtime.BitSet([0x00000000, 0x00000018]),
    FOLLOW_set_in_synpred38_JsFormulaCommaParser634: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INTERSECT_in_synpred42_JsFormulaCommaParser710: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_COLON_in_synpred49_JsFormulaCommaParser720: new org.antlr.runtime.BitSet([0x00000000, 0x0000003D]),
    FOLLOW_INTERSECT_in_synpred49_JsFormulaCommaParser726: new org.antlr.runtime.BitSet([0x00000000, 0x0000000C]),
    FOLLOW_set_in_synpred49_JsFormulaCommaParser732: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_synpred49_JsFormulaCommaParser740: new org.antlr.runtime.BitSet([0x00000000, 0x00000031]),
    FOLLOW_INTERSECT_in_synpred49_JsFormulaCommaParser745: new org.antlr.runtime.BitSet([0x00000000, 0x00000030]),
    FOLLOW_set_in_synpred49_JsFormulaCommaParser753: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_synpred50_JsFormulaCommaParser680: new org.antlr.runtime.BitSet([0x00000052, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_synpred50_JsFormulaCommaParser690: new org.antlr.runtime.BitSet([0x00000000, 0x00000031]),
    FOLLOW_INTERSECT_in_synpred50_JsFormulaCommaParser695: new org.antlr.runtime.BitSet([0x00000000, 0x00000030]),
    FOLLOW_set_in_synpred50_JsFormulaCommaParser701: new org.antlr.runtime.BitSet([0x00000012, 0x00000001]),
    FOLLOW_INTERSECT_in_synpred50_JsFormulaCommaParser710: new org.antlr.runtime.BitSet([0x00000012, 0x00000000]),
    FOLLOW_COLON_in_synpred50_JsFormulaCommaParser720: new org.antlr.runtime.BitSet([0x00000000, 0x0000003D]),
    FOLLOW_INTERSECT_in_synpred50_JsFormulaCommaParser726: new org.antlr.runtime.BitSet([0x00000000, 0x0000000C]),
    FOLLOW_set_in_synpred50_JsFormulaCommaParser732: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_synpred50_JsFormulaCommaParser740: new org.antlr.runtime.BitSet([0x00000000, 0x00000031]),
    FOLLOW_INTERSECT_in_synpred50_JsFormulaCommaParser745: new org.antlr.runtime.BitSet([0x00000000, 0x00000030]),
    FOLLOW_set_in_synpred50_JsFormulaCommaParser753: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_folded_in_synpred55_JsFormulaCommaParser832: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INTERSECT_in_synpred56_JsFormulaCommaParser863: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INTERSECT_in_synpred68_JsFormulaCommaParser1019: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_COLON_in_synpred76_JsFormulaCommaParser1029: new org.antlr.runtime.BitSet([0x00000000, 0x000000B9]),
    FOLLOW_INTERSECT_in_synpred76_JsFormulaCommaParser1035: new org.antlr.runtime.BitSet([0x00000000, 0x00000090]),
    FOLLOW_set_in_synpred76_JsFormulaCommaParser1041: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_synpred76_JsFormulaCommaParser1049: new org.antlr.runtime.BitSet([0x00000000, 0x00000039]),
    FOLLOW_INTERSECT_in_synpred76_JsFormulaCommaParser1054: new org.antlr.runtime.BitSet([0x00000000, 0x00000038]),
    FOLLOW_set_in_synpred76_JsFormulaCommaParser1063: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INTERSECT_in_synpred78_JsFormulaCommaParser1106: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INTERSECT_in_synpred82_JsFormulaCommaParser1212: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_FUNC_in_synpred84_JsFormulaCommaParser1182: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_NAME_in_synpred84_JsFormulaCommaParser1190: new org.antlr.runtime.BitSet([0x00010000, 0x00000000]),
    FOLLOW_P_OPEN_in_synpred84_JsFormulaCommaParser1196: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_INTERSECT_in_synpred84_JsFormulaCommaParser1212: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_range_in_synpred84_JsFormulaCommaParser1220: new org.antlr.runtime.BitSet([0x00020000, 0x00000001]),
    FOLLOW_INTERSECT_in_synpred84_JsFormulaCommaParser1228: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_P_CLOSE_in_synpred84_JsFormulaCommaParser1239: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_atom_list_in_synpred87_JsFormulaCommaParser1297: new org.antlr.runtime.BitSet([0x00000002, 0x00000000])
});

})();