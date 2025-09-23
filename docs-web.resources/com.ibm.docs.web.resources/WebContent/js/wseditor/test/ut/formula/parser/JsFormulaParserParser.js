// $ANTLR 3.2 Sep 23, 2009 12:02:23 C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g 2014-03-12 10:30:21




var JsFormulaParserParser = function(input, state) {
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

    JsFormulaParserParser.superclass.constructor.call(this, input, state);

    this.dfa9 = new JsFormulaParserParser.DFA9(this);
    this.dfa8 = new JsFormulaParserParser.DFA8(this);
    this.dfa37 = new JsFormulaParserParser.DFA37(this);
    this.dfa20 = new JsFormulaParserParser.DFA20(this);
    this.dfa36 = new JsFormulaParserParser.DFA36(this);
    this.dfa43 = new JsFormulaParserParser.DFA43(this);
    this.dfa50 = new JsFormulaParserParser.DFA50(this);
    this.dfa55 = new JsFormulaParserParser.DFA55(this);

        this.state.ruleMemo = {};
         
         

    /* @todo only create adaptor if output=AST */
    this.adaptor = new org.antlr.runtime.tree.CommonTreeAdaptor();

};

org.antlr.lang.augmentObject(JsFormulaParserParser, {
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
    T__56: 56,
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
    T__56= 56,
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
org.antlr.lang.extend(JsFormulaParserParser, org.antlr.runtime.Parser, {
        
    setTreeAdaptor: function(adaptor) {
        this.adaptor = adaptor;
    },
    getTreeAdaptor: function() {
        return this.adaptor;
    },

    getTokenNames: function() { return JsFormulaParserParser.tokenNames; },
    getGrammarFileName: function() { return "C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g"; }
});
org.antlr.lang.augmentObject(JsFormulaParserParser.prototype, {

    // inline static return class
    prog_return: (function() {
        JsFormulaParserParser.prog_return = function(){};
        org.antlr.lang.extend(JsFormulaParserParser.prog_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:71:2: prog returns [String value] : ( EQUAL ( INTERSECT )? ( expr )+ EOF | ARRAY_FORMULAR_START EQUAL ( expr )+ ARRAY_FORMULAR_END EOF );
    // $ANTLR start "prog"
    prog: function() {
        var retval = new JsFormulaParserParser.prog_return();
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
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:75:3: ( EQUAL ( INTERSECT )? ( expr )+ EOF | ARRAY_FORMULAR_START EQUAL ( expr )+ ARRAY_FORMULAR_END EOF )
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
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:75:5: EQUAL ( INTERSECT )? ( expr )+ EOF
                    root_0 = this.adaptor.nil();

                    EQUAL1=this.match(this.input,EQUAL,JsFormulaParserParser.FOLLOW_EQUAL_in_prog347); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    EQUAL1_tree = this.adaptor.create(EQUAL1);
                    this.adaptor.addChild(root_0, EQUAL1_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:75:11: ( INTERSECT )?
                    var alt1=2;
                    var LA1_0 = this.input.LA(1);

                    if ( (LA1_0==INTERSECT) ) {
                        alt1=1;
                    }
                    switch (alt1) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                            INTERSECT2=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_prog349); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT2_tree = this.adaptor.create(INTERSECT2);
                            this.adaptor.addChild(root_0, INTERSECT2_tree);
                            }


                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:75:22: ( expr )+
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
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: expr
                            this.pushFollow(JsFormulaParserParser.FOLLOW_expr_in_prog352);
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
                    EOF4=this.match(this.input,EOF,JsFormulaParserParser.FOLLOW_EOF_in_prog357); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    EOF4_tree = this.adaptor.create(EOF4);
                    this.adaptor.addChild(root_0, EOF4_tree);
                    }


                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:76:5: ARRAY_FORMULAR_START EQUAL ( expr )+ ARRAY_FORMULAR_END EOF
                    root_0 = this.adaptor.nil();

                    ARRAY_FORMULAR_START5=this.match(this.input,ARRAY_FORMULAR_START,JsFormulaParserParser.FOLLOW_ARRAY_FORMULAR_START_in_prog363); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    ARRAY_FORMULAR_START5_tree = this.adaptor.create(ARRAY_FORMULAR_START5);
                    this.adaptor.addChild(root_0, ARRAY_FORMULAR_START5_tree);
                    }
                    EQUAL6=this.match(this.input,EQUAL,JsFormulaParserParser.FOLLOW_EQUAL_in_prog365); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    EQUAL6_tree = this.adaptor.create(EQUAL6);
                    this.adaptor.addChild(root_0, EQUAL6_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                        		
                        	
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:80:4: ( expr )+
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
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: expr
                            this.pushFollow(JsFormulaParserParser.FOLLOW_expr_in_prog377);
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
                    ARRAY_FORMULAR_END8=this.match(this.input,ARRAY_FORMULAR_END,JsFormulaParserParser.FOLLOW_ARRAY_FORMULAR_END_in_prog382); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    ARRAY_FORMULAR_END8_tree = this.adaptor.create(ARRAY_FORMULAR_END8);
                    this.adaptor.addChild(root_0, ARRAY_FORMULAR_END8_tree);
                    }
                    EOF9=this.match(this.input,EOF,JsFormulaParserParser.FOLLOW_EOF_in_prog384); if (this.state.failed) return retval;
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
        JsFormulaParserParser.expr_return = function(){};
        org.antlr.lang.extend(JsFormulaParserParser.expr_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:83:1: expr returns [String value] : a= atom (sp= INTERSECT )? ( MODE )* ( (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr )* ;
    // $ANTLR start "expr"
    expr: function() {
        var retval = new JsFormulaParserParser.expr_return();
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
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:84:5: (a= atom (sp= INTERSECT )? ( MODE )* ( (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr )* )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:84:9: a= atom (sp= INTERSECT )? ( MODE )* ( (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr )*
            root_0 = this.adaptor.nil();

            this.pushFollow(JsFormulaParserParser.FOLLOW_atom_in_expr407);
            a=this.atom();

            this.state._fsp--;
            if (this.state.failed) return retval;
            if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, a.getTree());
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:85:6: (sp= INTERSECT )?
            var alt5=2;
            var LA5_0 = this.input.LA(1);

            if ( (LA5_0==INTERSECT) ) {
                var LA5_1 = this.input.LA(2);

                if ( (this.synpred5_JsFormulaParser()) ) {
                    alt5=1;
                }
            }
            switch (alt5) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:85:7: sp= INTERSECT
                    sp=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_expr417); if (this.state.failed) return retval;
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

            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:92:7: ( MODE )*
            loop6:
            do {
                var alt6=2;
                var LA6_0 = this.input.LA(1);

                if ( (LA6_0==MODE) ) {
                    alt6=1;
                }


                switch (alt6) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:92:8: MODE
                    MODE10=this.match(this.input,MODE,JsFormulaParserParser.FOLLOW_MODE_in_expr429); if (this.state.failed) return retval;
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

            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:98:3: ( (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr )*
            loop9:
            do {
                var alt9=2;
                alt9 = this.dfa9.predict(this.input);
                switch (alt9) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:98:4: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:98:4: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )?
                    var alt8=2;
                    alt8 = this.dfa8.predict(this.input);
                    switch (alt8) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:99:3: m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )?
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
                              					    if((m?m.getText():null) == this.sepChar){//";"
                              					       var left = this.tokenList[this.tokenList.length - 2];
                              					       if(left && (left._type == "range" || left._type == "cell" || left._type == "namerange" 
                              						 || (left._type == "reffunct" && (websheet.functions.Util.getErrPropByName(left.getChangedText()) & websheet.Constant.CellErrProp.RETURN_REF)))){
                              					           token.setChangedText("~");
                              					       }
                              					   }else if((m?m.getText():null) == ","){
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
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:137:6: ( INTERSECT )?
                            var alt7=2;
                            var LA7_0 = this.input.LA(1);

                            if ( (LA7_0==INTERSECT) ) {
                                alt7=1;
                            }
                            switch (alt7) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                                    INTERSECT11=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_expr512); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    INTERSECT11_tree = this.adaptor.create(INTERSECT11);
                                    this.adaptor.addChild(root_0, INTERSECT11_tree);
                                    }


                                    break;

                            }



                            break;

                    }

                    this.pushFollow(JsFormulaParserParser.FOLLOW_expr_in_expr525);
                    b=this.expr();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, b.getTree());
                    if ( this.state.backtracking===0 ) {

                      			if(m || sp || (this.inConstArray)){
                      				retval.value = (b!==null?b.value:null);
                      				if( sp && !m && !this.inConstArray){
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
        JsFormulaParserParser.atom_return = function(){};
        org.antlr.lang.extend(JsFormulaParserParser.atom_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:186:1: atom returns [String value] : ( '-' ( INTERSECT )? (b= atom ) | '+' ( INTERSECT )? (b= atom ) | (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )? x= LOCALE_NUMBER em= COLON endName= ( NAME | LOCALE_NUMBER ) | x= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )? (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )? | x= DOUBLEQUOT_STRING | (brace= P_OPEN ) ( ( INTERSECT )? expr ( INTERSECT )? ebrace= P_CLOSE ) | folded | (a= ARRAY_FORMULAR_START (wp1= INTERSECT )? ) ( (firToken= atom ) ( ( ( (wp2= INTERSECT )? sep= ( '.' | ARG_SEP ) (wp3= INTERSECT )? ) )? (token= atom ) )* )? ( (wp4= INTERSECT )? ARRAY_FORMULAR_END ) | name1= ( ERRORNAME | NAME | NAME1 ) (op= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME | LOCALE_NUMBER ) (wp3= INTERSECT )? )? (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )? );
    // $ANTLR start "atom"
    atom: function() {
        var retval = new JsFormulaParserParser.atom_return();
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
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:187:3: ( '-' ( INTERSECT )? (b= atom ) | '+' ( INTERSECT )? (b= atom ) | (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )? x= LOCALE_NUMBER em= COLON endName= ( NAME | LOCALE_NUMBER ) | x= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )? (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )? | x= DOUBLEQUOT_STRING | (brace= P_OPEN ) ( ( INTERSECT )? expr ( INTERSECT )? ebrace= P_CLOSE ) | folded | (a= ARRAY_FORMULAR_START (wp1= INTERSECT )? ) ( (firToken= atom ) ( ( ( (wp2= INTERSECT )? sep= ( '.' | ARG_SEP ) (wp3= INTERSECT )? ) )? (token= atom ) )* )? ( (wp4= INTERSECT )? ARRAY_FORMULAR_END ) | name1= ( ERRORNAME | NAME | NAME1 ) (op= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME | LOCALE_NUMBER ) (wp3= INTERSECT )? )? (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )? )
            var alt37=9;
            alt37 = this.dfa37.predict(this.input);
            switch (alt37) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:188:3: '-' ( INTERSECT )? (b= atom )
                    root_0 = this.adaptor.nil();

                    char_literal12=this.match(this.input,MINUS,JsFormulaParserParser.FOLLOW_MINUS_in_atom559); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    char_literal12_tree = this.adaptor.create(char_literal12);
                    this.adaptor.addChild(root_0, char_literal12_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:188:7: ( INTERSECT )?
                    var alt10=2;
                    var LA10_0 = this.input.LA(1);

                    if ( (LA10_0==INTERSECT) ) {
                        alt10=1;
                    }
                    switch (alt10) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                            INTERSECT13=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom561); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT13_tree = this.adaptor.create(INTERSECT13);
                            this.adaptor.addChild(root_0, INTERSECT13_tree);
                            }


                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:188:18: (b= atom )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:188:19: b= atom
                    this.pushFollow(JsFormulaParserParser.FOLLOW_atom_in_atom567);
                    b=this.atom();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, b.getTree());



                    if ( this.state.backtracking===0 ) {

                           
                        	
                    }


                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:191:4: '+' ( INTERSECT )? (b= atom )
                    root_0 = this.adaptor.nil();

                    char_literal14=this.match(this.input,PLUS,JsFormulaParserParser.FOLLOW_PLUS_in_atom574); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    char_literal14_tree = this.adaptor.create(char_literal14);
                    this.adaptor.addChild(root_0, char_literal14_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:191:8: ( INTERSECT )?
                    var alt11=2;
                    var LA11_0 = this.input.LA(1);

                    if ( (LA11_0==INTERSECT) ) {
                        alt11=1;
                    }
                    switch (alt11) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                            INTERSECT15=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom576); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT15_tree = this.adaptor.create(INTERSECT15);
                            this.adaptor.addChild(root_0, INTERSECT15_tree);
                            }


                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:191:19: (b= atom )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:191:20: b= atom
                    this.pushFollow(JsFormulaParserParser.FOLLOW_atom_in_atom582);
                    b=this.atom();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, b.getTree());



                    if ( this.state.backtracking===0 ) {

                           
                        	
                    }


                    break;
                case 3 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:197:5: (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )? x= LOCALE_NUMBER em= COLON endName= ( NAME | LOCALE_NUMBER )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:197:5: (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )?
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
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:197:6: sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )?
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

                            m=this.match(this.input,INTERSECT_ODS,JsFormulaParserParser.FOLLOW_INTERSECT_ODS_in_atom610); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            m_tree = this.adaptor.create(m);
                            this.adaptor.addChild(root_0, m_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:197:59: (wp2= INTERSECT )?
                            var alt12=2;
                            var LA12_0 = this.input.LA(1);

                            if ( (LA12_0==INTERSECT) ) {
                                alt12=1;
                            }
                            switch (alt12) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:197:60: wp2= INTERSECT
                                    wp2=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom615); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    wp2_tree = this.adaptor.create(wp2);
                                    this.adaptor.addChild(root_0, wp2_tree);
                                    }


                                    break;

                            }



                            break;

                    }

                    x=this.match(this.input,LOCALE_NUMBER,JsFormulaParserParser.FOLLOW_LOCALE_NUMBER_in_atom623); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    x_tree = this.adaptor.create(x);
                    this.adaptor.addChild(root_0, x_tree);
                    }
                    em=this.match(this.input,COLON,JsFormulaParserParser.FOLLOW_COLON_in_atom627); if (this.state.failed) return retval;
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
                      				if((sn?sn.getText():null)){
                      					token.setIndex(sn.getStartIndex());
                      				}else
                      					token.setIndex(x.getStartIndex());
                      				if(token.getType() == websheet.Constant.FormulaTokenType.SHEET_SEP)
                      				{
                      					this.errTokenList.push(token);
                      				}else
                      				{
                      					this.tokenList.push(token);
                      				}
                      			}
                      	    }
                      	  }
                          
                    }


                    break;
                case 4 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:7: x= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )? (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )?
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

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:43: (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )?
                    var alt16=2;
                    var LA16_0 = this.input.LA(1);

                    if ( (LA16_0==INTERSECT_ODS) ) {
                        alt16=1;
                    }
                    switch (alt16) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:45: m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )?
                            m=this.match(this.input,INTERSECT_ODS,JsFormulaParserParser.FOLLOW_INTERSECT_ODS_in_atom685); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            m_tree = this.adaptor.create(m);
                            this.adaptor.addChild(root_0, m_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:61: (wp2= INTERSECT )?
                            var alt14=2;
                            var LA14_0 = this.input.LA(1);

                            if ( (LA14_0==INTERSECT) ) {
                                alt14=1;
                            }
                            switch (alt14) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:62: wp2= INTERSECT
                                    wp2=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom690); if (this.state.failed) return retval;
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

                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:101: (wp3= INTERSECT )?
                            var alt15=2;
                            var LA15_0 = this.input.LA(1);

                            if ( (LA15_0==INTERSECT) ) {
                                var LA15_1 = this.input.LA(2);

                                if ( (this.synpred42_JsFormulaParser()) ) {
                                    alt15=1;
                                }
                            }
                            switch (alt15) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:102: wp3= INTERSECT
                                    wp3=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom705); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    wp3_tree = this.adaptor.create(wp3);
                                    this.adaptor.addChild(root_0, wp3_tree);
                                    }


                                    break;

                            }



                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:120: (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )?
                    var alt20=2;
                    alt20 = this.dfa20.predict(this.input);
                    switch (alt20) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:121: em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME )
                            em=this.match(this.input,COLON,JsFormulaParserParser.FOLLOW_COLON_in_atom714); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            em_tree = this.adaptor.create(em);
                            this.adaptor.addChild(root_0, em_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:130: ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )?
                            var alt19=2;
                            var LA19_0 = this.input.LA(1);

                            if ( (LA19_0==INTERSECT||(LA19_0>=SINGLEQUOT_STRING && LA19_0<=LOCALE_NUMBER)) ) {
                                alt19=1;
                            }
                            switch (alt19) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:131: (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )?
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:131: (wp4= INTERSECT )?
                                    var alt17=2;
                                    var LA17_0 = this.input.LA(1);

                                    if ( (LA17_0==INTERSECT) ) {
                                        alt17=1;
                                    }
                                    switch (alt17) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:132: wp4= INTERSECT
                                            wp4=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom720); if (this.state.failed) return retval;
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

                                    m2=this.match(this.input,INTERSECT_ODS,JsFormulaParserParser.FOLLOW_INTERSECT_ODS_in_atom734); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    m2_tree = this.adaptor.create(m2);
                                    this.adaptor.addChild(root_0, m2_tree);
                                    }
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:203: (wp6= INTERSECT )?
                                    var alt18=2;
                                    var LA18_0 = this.input.LA(1);

                                    if ( (LA18_0==INTERSECT) ) {
                                        alt18=1;
                                    }
                                    switch (alt18) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:204: wp6= INTERSECT
                                            wp6=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom740); if (this.state.failed) return retval;
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
                      	      		if (!this.inConstArray)
                      		      		this.errTokenList.push(token);
                      		      	else
                      		      		this.tokenList.push(token);
                      	      } else if (this.inConstArray) {
                      	      		this.tokenList.push(token);
                      	      }
                      	     }
                            }
                      	
                    }


                    break;
                case 5 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:352:5: x= DOUBLEQUOT_STRING
                    root_0 = this.adaptor.nil();

                    x=this.match(this.input,DOUBLEQUOT_STRING,JsFormulaParserParser.FOLLOW_DOUBLEQUOT_STRING_in_atom764); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    x_tree = this.adaptor.create(x);
                    this.adaptor.addChild(root_0, x_tree);
                    }
                    if ( this.state.backtracking===0 ) {

                           
                         
                            
                    }


                    break;
                case 6 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:356:5: (brace= P_OPEN ) ( ( INTERSECT )? expr ( INTERSECT )? ebrace= P_CLOSE )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:356:5: (brace= P_OPEN )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:356:6: brace= P_OPEN
                    brace=this.match(this.input,P_OPEN,JsFormulaParserParser.FOLLOW_P_OPEN_in_atom778); if (this.state.failed) return retval;
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
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:363:5: ( ( INTERSECT )? expr ( INTERSECT )? ebrace= P_CLOSE )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:364:6: ( INTERSECT )? expr ( INTERSECT )? ebrace= P_CLOSE
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:364:6: ( INTERSECT )?
                    var alt21=2;
                    var LA21_0 = this.input.LA(1);

                    if ( (LA21_0==INTERSECT) ) {
                        alt21=1;
                    }
                    switch (alt21) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                            INTERSECT16=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom794); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT16_tree = this.adaptor.create(INTERSECT16);
                            this.adaptor.addChild(root_0, INTERSECT16_tree);
                            }


                            break;

                    }

                    this.pushFollow(JsFormulaParserParser.FOLLOW_expr_in_atom803);
                    expr17=this.expr();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, expr17.getTree());
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:366:6: ( INTERSECT )?
                    var alt22=2;
                    var LA22_0 = this.input.LA(1);

                    if ( (LA22_0==INTERSECT) ) {
                        alt22=1;
                    }
                    switch (alt22) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                            INTERSECT18=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom810); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT18_tree = this.adaptor.create(INTERSECT18);
                            this.adaptor.addChild(root_0, INTERSECT18_tree);
                            }


                            break;

                    }

                    ebrace=this.match(this.input,P_CLOSE,JsFormulaParserParser.FOLLOW_P_CLOSE_in_atom817); if (this.state.failed) return retval;
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
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:408:5: folded
                    root_0 = this.adaptor.nil();

                    this.pushFollow(JsFormulaParserParser.FOLLOW_folded_in_atom827);
                    folded19=this.folded();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, folded19.getTree());
                    if ( this.state.backtracking===0 ) {
                    }


                    break;
                case 8 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:409:4: (a= ARRAY_FORMULAR_START (wp1= INTERSECT )? ) ( (firToken= atom ) ( ( ( (wp2= INTERSECT )? sep= ( '.' | ARG_SEP ) (wp3= INTERSECT )? ) )? (token= atom ) )* )? ( (wp4= INTERSECT )? ARRAY_FORMULAR_END )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:409:4: (a= ARRAY_FORMULAR_START (wp1= INTERSECT )? )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:409:5: a= ARRAY_FORMULAR_START (wp1= INTERSECT )?
                    a=this.match(this.input,ARRAY_FORMULAR_START,JsFormulaParserParser.FOLLOW_ARRAY_FORMULAR_START_in_atom839); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    a_tree = this.adaptor.create(a);
                    this.adaptor.addChild(root_0, a_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:409:30: (wp1= INTERSECT )?
                    var alt23=2;
                    var LA23_0 = this.input.LA(1);

                    if ( (LA23_0==INTERSECT) ) {
                        var LA23_1 = this.input.LA(2);

                        if ( (this.synpred56_JsFormulaParser()) ) {
                            alt23=1;
                        }
                    }
                    switch (alt23) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:409:31: wp1= INTERSECT
                            wp1=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom844); if (this.state.failed) return retval;
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
                      	// in german local, "." is as seprator of 1D constant array, at the same time, it can be a char of name
                      	// so, it is included in NAME(1.2.TRUE)/LOCALE_NUMBER(1.2), and we split it in js code
                      	// sepCount records the count of needed ".".  token "." and begin/end position of name/locale_number(sepCount = 1), else sepCount = -1
                      	// it is valid constant-array if sepCount=0/-1. when meet token ";" and init value, set 0 
                      	arrayInfo.sepCount = 0;
                      	arrayInfo.text = "{";
                      	arrayInfo.changedText = "{";
                        	if((wp1?wp1.getText():null))
                        		arrayInfo.text += (wp1?wp1.getText():null);
                        	
                        	var tokensCount = this.tokenList.length;
                         
                    }



                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:429:4: ( (firToken= atom ) ( ( ( (wp2= INTERSECT )? sep= ( '.' | ARG_SEP ) (wp3= INTERSECT )? ) )? (token= atom ) )* )?
                    var alt28=2;
                    var LA28_0 = this.input.LA(1);

                    if ( (LA28_0==PLUS||LA28_0==MINUS||LA28_0==P_OPEN||LA28_0==ARRAY_FORMULAR_START||(LA28_0>=SINGLEQUOT_STRING && LA28_0<=FUNC)) ) {
                        alt28=1;
                    }
                    switch (alt28) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:429:5: (firToken= atom ) ( ( ( (wp2= INTERSECT )? sep= ( '.' | ARG_SEP ) (wp3= INTERSECT )? ) )? (token= atom ) )*
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:429:5: (firToken= atom )
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:429:6: firToken= atom
                            this.pushFollow(JsFormulaParserParser.FOLLOW_atom_in_atom859);
                            firToken=this.atom();

                            this.state._fsp--;
                            if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, firToken.getTree());
                            if ( this.state.backtracking===0 ) {

                                 	var tokenSource = this.input.getTokenSource();
                              	var localeSep = websheet.event.FormulaHelper.getArraySepByLocale();
                              	var bArray = websheet.event.FormulaHelper.isConstArray(firToken, tokenSource, arrayInfo, localeSep);
                                 
                            }



                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:434:4: ( ( ( (wp2= INTERSECT )? sep= ( '.' | ARG_SEP ) (wp3= INTERSECT )? ) )? (token= atom ) )*
                            loop27:
                            do {
                                var alt27=2;
                                var LA27_0 = this.input.LA(1);

                                if ( (LA27_0==INTERSECT) ) {
                                    var LA27_1 = this.input.LA(2);

                                    if ( (LA27_1==ARG_SEP||LA27_1==56) ) {
                                        alt27=1;
                                    }


                                }
                                else if ( (LA27_0==PLUS||LA27_0==MINUS||LA27_0==P_OPEN||LA27_0==ARRAY_FORMULAR_START||(LA27_0>=ARG_SEP && LA27_0<=FUNC)||LA27_0==56) ) {
                                    alt27=1;
                                }


                                switch (alt27) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:434:5: ( ( (wp2= INTERSECT )? sep= ( '.' | ARG_SEP ) (wp3= INTERSECT )? ) )? (token= atom )
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:434:5: ( ( (wp2= INTERSECT )? sep= ( '.' | ARG_SEP ) (wp3= INTERSECT )? ) )?
                                    var alt26=2;
                                    var LA26_0 = this.input.LA(1);

                                    if ( ((LA26_0>=INTERSECT && LA26_0<=ARG_SEP)||LA26_0==56) ) {
                                        alt26=1;
                                    }
                                    switch (alt26) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:434:6: ( (wp2= INTERSECT )? sep= ( '.' | ARG_SEP ) (wp3= INTERSECT )? )
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:434:6: ( (wp2= INTERSECT )? sep= ( '.' | ARG_SEP ) (wp3= INTERSECT )? )
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:434:7: (wp2= INTERSECT )? sep= ( '.' | ARG_SEP ) (wp3= INTERSECT )?
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:434:7: (wp2= INTERSECT )?
                                            var alt24=2;
                                            var LA24_0 = this.input.LA(1);

                                            if ( (LA24_0==INTERSECT) ) {
                                                alt24=1;
                                            }
                                            switch (alt24) {
                                                case 1 :
                                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:434:8: wp2= INTERSECT
                                                    wp2=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom873); if (this.state.failed) return retval;
                                                    if ( this.state.backtracking===0 ) {
                                                    wp2_tree = this.adaptor.create(wp2);
                                                    this.adaptor.addChild(root_0, wp2_tree);
                                                    }


                                                    break;

                                            }

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

                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:434:42: (wp3= INTERSECT )?
                                            var alt25=2;
                                            var LA25_0 = this.input.LA(1);

                                            if ( (LA25_0==INTERSECT) ) {
                                                alt25=1;
                                            }
                                            switch (alt25) {
                                                case 1 :
                                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:434:43: wp3= INTERSECT
                                                    wp3=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom888); if (this.state.failed) return retval;
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
                                              	  	if (speText == ".") {
                                              			if (arrayInfo.rowLen == 0)
                                              				arrayInfo.firColLen++;
                                              			else
                                              				arrayInfo.colLen++;
                                              			arrayInfo.changedText += ";";
                                              			if (arrayInfo.sepCount = -1)
                                              				arrayInfo.sepCount = 1;
                                              			else
                                              				bArray = false;
                                              		} else if (speText == ";"){
                                              			if (arrayInfo.sepCount = -1)
                                              				arrayInfo.sepCount = 0;
                                              			else if (arrayInfo.sepCount)
                                              				bArray = false;
                                              			// column length of every row should be same
                                              			if (arrayInfo.rowLen && arrayInfo.colLen != arrayInfo.firColLen)
                                              				throw websheet.Constant.ERRORCODE["512"];
                                              			arrayInfo.colLen = 0;
                                              			arrayInfo.rowLen++;
                                              			arrayInfo.changedText += "|";
                                              		} else {
                                              			bArray = false;
                                              		}
                                              		if((wp3?wp3.getText():null)) {
                                                			arrayInfo.text += (wp3?wp3.getText():null);
                                                			wp3 = null;
                                                		}
                                              	}
                                                 
                                            }


                                            break;

                                    }

                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:472:4: (token= atom )
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:472:5: token= atom
                                    this.pushFollow(JsFormulaParserParser.FOLLOW_atom_in_atom905);
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
                                    break loop27;
                                }
                            } while (true);



                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:476:4: ( (wp4= INTERSECT )? ARRAY_FORMULAR_END )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:476:5: (wp4= INTERSECT )? ARRAY_FORMULAR_END
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:476:5: (wp4= INTERSECT )?
                    var alt29=2;
                    var LA29_0 = this.input.LA(1);

                    if ( (LA29_0==INTERSECT) ) {
                        alt29=1;
                    }
                    switch (alt29) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:476:6: wp4= INTERSECT
                            wp4=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom922); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            wp4_tree = this.adaptor.create(wp4);
                            this.adaptor.addChild(root_0, wp4_tree);
                            }


                            break;

                    }

                    ARRAY_FORMULAR_END20=this.match(this.input,ARRAY_FORMULAR_END,JsFormulaParserParser.FOLLOW_ARRAY_FORMULAR_END_in_atom926); if (this.state.failed) return retval;
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
                         	if (arrayInfo.rowLen && (arrayInfo.firColLen != arrayInfo.colLen) || (arrayInfo.sepCount !=0 && arrayInfo.sepCount != -1))
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
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:5: name1= ( ERRORNAME | NAME | NAME1 ) (op= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME | LOCALE_NUMBER ) (wp3= INTERSECT )? )? (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )?
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

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:34: (op= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME | LOCALE_NUMBER ) (wp3= INTERSECT )? )?
                    var alt32=2;
                    var LA32_0 = this.input.LA(1);

                    if ( (LA32_0==INTERSECT_ODS) ) {
                        alt32=1;
                    }
                    switch (alt32) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:35: op= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME | LOCALE_NUMBER ) (wp3= INTERSECT )?
                            op=this.match(this.input,INTERSECT_ODS,JsFormulaParserParser.FOLLOW_INTERSECT_ODS_in_atom980); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            op_tree = this.adaptor.create(op);
                            this.adaptor.addChild(root_0, op_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:52: (wp2= INTERSECT )?
                            var alt30=2;
                            var LA30_0 = this.input.LA(1);

                            if ( (LA30_0==INTERSECT) ) {
                                alt30=1;
                            }
                            switch (alt30) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:53: wp2= INTERSECT
                                    wp2=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom985); if (this.state.failed) return retval;
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

                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:106: (wp3= INTERSECT )?
                            var alt31=2;
                            var LA31_0 = this.input.LA(1);

                            if ( (LA31_0==INTERSECT) ) {
                                var LA31_1 = this.input.LA(2);

                                if ( (this.synpred70_JsFormulaParser()) ) {
                                    alt31=1;
                                }
                            }
                            switch (alt31) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:107: wp3= INTERSECT
                                    wp3=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom1002); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    wp3_tree = this.adaptor.create(wp3);
                                    this.adaptor.addChild(root_0, wp3_tree);
                                    }


                                    break;

                            }



                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:126: (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )?
                    var alt36=2;
                    alt36 = this.dfa36.predict(this.input);
                    switch (alt36) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:127: m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER )
                            m=this.match(this.input,COLON,JsFormulaParserParser.FOLLOW_COLON_in_atom1012); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            m_tree = this.adaptor.create(m);
                            this.adaptor.addChild(root_0, m_tree);
                            }
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:135: ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )?
                            var alt35=2;
                            var LA35_0 = this.input.LA(1);

                            if ( (LA35_0==INTERSECT||LA35_0==NAME1) ) {
                                alt35=1;
                            }
                            else if ( (LA35_0==NAME) ) {
                                var LA35_2 = this.input.LA(2);

                                if ( (LA35_2==INTERSECT_ODS) ) {
                                    alt35=1;
                                }
                            }
                            switch (alt35) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:136: (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )?
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:136: (wp4= INTERSECT )?
                                    var alt33=2;
                                    var LA33_0 = this.input.LA(1);

                                    if ( (LA33_0==INTERSECT) ) {
                                        alt33=1;
                                    }
                                    switch (alt33) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:137: wp4= INTERSECT
                                            wp4=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom1018); if (this.state.failed) return retval;
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

                                    op2=this.match(this.input,INTERSECT_ODS,JsFormulaParserParser.FOLLOW_INTERSECT_ODS_in_atom1032); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    op2_tree = this.adaptor.create(op2);
                                    this.adaptor.addChild(root_0, op2_tree);
                                    }
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:190: (wp6= INTERSECT )?
                                    var alt34=2;
                                    var LA34_0 = this.input.LA(1);

                                    if ( (LA34_0==INTERSECT) ) {
                                        alt34=1;
                                    }
                                    switch (alt34) {
                                        case 1 :
                                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:191: wp6= INTERSECT
                                            wp6=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom1037); if (this.state.failed) return retval;
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
        JsFormulaParserParser.atom_list_return = function(){};
        org.antlr.lang.extend(JsFormulaParserParser.atom_list_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:643:1: atom_list returns [String value] : a= atom_type ( ( ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type )* ) ;
    // $ANTLR start "atom_list"
    atom_list: function() {
        var retval = new JsFormulaParserParser.atom_list_return();
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
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:644:3: (a= atom_type ( ( ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type )* ) )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:644:5: a= atom_type ( ( ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type )* )
            root_0 = this.adaptor.nil();

            this.pushFollow(JsFormulaParserParser.FOLLOW_atom_type_in_atom_list1073);
            a=this.atom_type();

            this.state._fsp--;
            if (this.state.failed) return retval;
            if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, a.getTree());
            if ( this.state.backtracking===0 ) {

                
            }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:646:3: ( ( ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type )* )
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:646:4: ( ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type )*
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:646:4: ( ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type )*
            loop40:
            do {
                var alt40=2;
                var LA40_0 = this.input.LA(1);

                if ( (LA40_0==INTERSECT) ) {
                    var LA40_1 = this.input.LA(2);

                    if ( (LA40_1==ARG_SEP) ) {
                        alt40=1;
                    }


                }
                else if ( (LA40_0==ARG_SEP) ) {
                    alt40=1;
                }


                switch (alt40) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:646:5: ( INTERSECT )? sep= ARG_SEP ( INTERSECT )? n= atom_type
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:646:5: ( INTERSECT )?
                    var alt38=2;
                    var LA38_0 = this.input.LA(1);

                    if ( (LA38_0==INTERSECT) ) {
                        alt38=1;
                    }
                    switch (alt38) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                            INTERSECT21=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom_list1081); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT21_tree = this.adaptor.create(INTERSECT21);
                            this.adaptor.addChild(root_0, INTERSECT21_tree);
                            }


                            break;

                    }

                    sep=this.match(this.input,ARG_SEP,JsFormulaParserParser.FOLLOW_ARG_SEP_in_atom_list1086); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    sep_tree = this.adaptor.create(sep);
                    this.adaptor.addChild(root_0, sep_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:646:28: ( INTERSECT )?
                    var alt39=2;
                    var LA39_0 = this.input.LA(1);

                    if ( (LA39_0==INTERSECT) ) {
                        var LA39_1 = this.input.LA(2);

                        if ( (this.synpred80_JsFormulaParser()) ) {
                            alt39=1;
                        }
                    }
                    switch (alt39) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                            INTERSECT22=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom_list1088); if (this.state.failed) return retval;
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
                    this.pushFollow(JsFormulaParserParser.FOLLOW_atom_type_in_atom_list1095);
                    n=this.atom_type();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, n.getTree());
                    if ( this.state.backtracking===0 ) {
                    }


                    break;

                default :
                    break loop40;
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
        JsFormulaParserParser.atom_type_return = function(){};
        org.antlr.lang.extend(JsFormulaParserParser.atom_type_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:655:1: atom_type returns [String value] : (a= expr | ARRAY_FORMULAR_START ( INTERSECT )? (b= atom_list ( INTERSECT )? ARRAY_FORMULAR_END ) | );
    // $ANTLR start "atom_type"
    atom_type: function() {
        var retval = new JsFormulaParserParser.atom_type_return();
        retval.start = this.input.LT(1);
        var atom_type_StartIndex = this.input.index();
        var root_0 = null;

        var ARRAY_FORMULAR_START23 = null;
        var INTERSECT24 = null;
        var INTERSECT25 = null;
        var ARRAY_FORMULAR_END26 = null;
         var a = null;
         var b = null;

        var ARRAY_FORMULAR_START23_tree=null;
        var INTERSECT24_tree=null;
        var INTERSECT25_tree=null;
        var ARRAY_FORMULAR_END26_tree=null;

        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 5) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:656:3: (a= expr | ARRAY_FORMULAR_START ( INTERSECT )? (b= atom_list ( INTERSECT )? ARRAY_FORMULAR_END ) | )
            var alt43=3;
            alt43 = this.dfa43.predict(this.input);
            switch (alt43) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:656:5: a= expr
                    root_0 = this.adaptor.nil();

                    this.pushFollow(JsFormulaParserParser.FOLLOW_expr_in_atom_type1123);
                    a=this.expr();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, a.getTree());
                    if ( this.state.backtracking===0 ) {
                    }


                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:658:5: ARRAY_FORMULAR_START ( INTERSECT )? (b= atom_list ( INTERSECT )? ARRAY_FORMULAR_END )
                    root_0 = this.adaptor.nil();

                    ARRAY_FORMULAR_START23=this.match(this.input,ARRAY_FORMULAR_START,JsFormulaParserParser.FOLLOW_ARRAY_FORMULAR_START_in_atom_type1133); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    ARRAY_FORMULAR_START23_tree = this.adaptor.create(ARRAY_FORMULAR_START23);
                    this.adaptor.addChild(root_0, ARRAY_FORMULAR_START23_tree);
                    }
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:658:26: ( INTERSECT )?
                    var alt41=2;
                    var LA41_0 = this.input.LA(1);

                    if ( (LA41_0==INTERSECT) ) {
                        var LA41_1 = this.input.LA(2);

                        if ( (this.synpred83_JsFormulaParser()) ) {
                            alt41=1;
                        }
                    }
                    switch (alt41) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                            INTERSECT24=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom_type1135); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT24_tree = this.adaptor.create(INTERSECT24);
                            this.adaptor.addChild(root_0, INTERSECT24_tree);
                            }


                            break;

                    }

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:658:37: (b= atom_list ( INTERSECT )? ARRAY_FORMULAR_END )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:658:38: b= atom_list ( INTERSECT )? ARRAY_FORMULAR_END
                    this.pushFollow(JsFormulaParserParser.FOLLOW_atom_list_in_atom_type1141);
                    b=this.atom_list();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, b.getTree());
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:658:50: ( INTERSECT )?
                    var alt42=2;
                    var LA42_0 = this.input.LA(1);

                    if ( (LA42_0==INTERSECT) ) {
                        alt42=1;
                    }
                    switch (alt42) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                            INTERSECT25=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_atom_type1143); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT25_tree = this.adaptor.create(INTERSECT25);
                            this.adaptor.addChild(root_0, INTERSECT25_tree);
                            }


                            break;

                    }

                    ARRAY_FORMULAR_END26=this.match(this.input,ARRAY_FORMULAR_END,JsFormulaParserParser.FOLLOW_ARRAY_FORMULAR_END_in_atom_type1146); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    ARRAY_FORMULAR_END26_tree = this.adaptor.create(ARRAY_FORMULAR_END26);
                    this.adaptor.addChild(root_0, ARRAY_FORMULAR_END26_tree);
                    }
                    if ( this.state.backtracking===0 ) {
                    }





                    break;
                case 3 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:659:4: 
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
        JsFormulaParserParser.folded_return = function(){};
        org.antlr.lang.extend(JsFormulaParserParser.folded_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:663:1: folded returns [String value] : ( (f= FUNC | f= ( NAME | NAME1 ) b= '(' ) ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE ) | (f= FUNC | f= ( NAME | NAME1 ) ( INTERSECT )? b= '(' ) ( ')' ) );
    // $ANTLR start "folded"
    folded: function() {
        var retval = new JsFormulaParserParser.folded_return();
        retval.start = this.input.LT(1);
        var folded_StartIndex = this.input.index();
        var root_0 = null;

        var f = null;
        var b = null;
        var rBrace = null;
        var INTERSECT27 = null;
        var INTERSECT29 = null;
        var INTERSECT30 = null;
        var char_literal31 = null;
         var range28 = null;

        var f_tree=null;
        var b_tree=null;
        var rBrace_tree=null;
        var INTERSECT27_tree=null;
        var INTERSECT29_tree=null;
        var INTERSECT30_tree=null;
        var char_literal31_tree=null;

        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 6) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:665:4: ( (f= FUNC | f= ( NAME | NAME1 ) b= '(' ) ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE ) | (f= FUNC | f= ( NAME | NAME1 ) ( INTERSECT )? b= '(' ) ( ')' ) )
            var alt49=2;
            var LA49_0 = this.input.LA(1);

            if ( (LA49_0==FUNC) ) {
                var LA49_1 = this.input.LA(2);

                if ( (LA49_1==PLUS||LA49_1==MINUS||LA49_1==P_OPEN||LA49_1==ARRAY_FORMULAR_START||(LA49_1>=INTERSECT && LA49_1<=FUNC)) ) {
                    alt49=1;
                }
                else if ( (LA49_1==P_CLOSE) ) {
                    var LA49_4 = this.input.LA(3);

                    if ( (this.synpred90_JsFormulaParser()) ) {
                        alt49=1;
                    }
                    else if ( (true) ) {
                        alt49=2;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 49, 4, this.input);

                        throw nvae;
                    }
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                    var nvae =
                        new org.antlr.runtime.NoViableAltException("", 49, 1, this.input);

                    throw nvae;
                }
            }
            else if ( (LA49_0==NAME||LA49_0==NAME1) ) {
                var LA49_2 = this.input.LA(2);

                if ( (LA49_2==P_OPEN) ) {
                    var LA49_5 = this.input.LA(3);

                    if ( (LA49_5==P_CLOSE) ) {
                        var LA49_4 = this.input.LA(4);

                        if ( (this.synpred90_JsFormulaParser()) ) {
                            alt49=1;
                        }
                        else if ( (true) ) {
                            alt49=2;
                        }
                        else {
                            if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                            var nvae =
                                new org.antlr.runtime.NoViableAltException("", 49, 4, this.input);

                            throw nvae;
                        }
                    }
                    else if ( (LA49_5==PLUS||LA49_5==MINUS||LA49_5==P_OPEN||LA49_5==ARRAY_FORMULAR_START||(LA49_5>=INTERSECT && LA49_5<=FUNC)) ) {
                        alt49=1;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 49, 5, this.input);

                        throw nvae;
                    }
                }
                else if ( (LA49_2==INTERSECT) ) {
                    alt49=2;
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                    var nvae =
                        new org.antlr.runtime.NoViableAltException("", 49, 2, this.input);

                    throw nvae;
                }
            }
            else {
                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                var nvae =
                    new org.antlr.runtime.NoViableAltException("", 49, 0, this.input);

                throw nvae;
            }
            switch (alt49) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:665:6: (f= FUNC | f= ( NAME | NAME1 ) b= '(' ) ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:665:6: (f= FUNC | f= ( NAME | NAME1 ) b= '(' )
                    var alt44=2;
                    var LA44_0 = this.input.LA(1);

                    if ( (LA44_0==FUNC) ) {
                        alt44=1;
                    }
                    else if ( (LA44_0==NAME||LA44_0==NAME1) ) {
                        alt44=2;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 44, 0, this.input);

                        throw nvae;
                    }
                    switch (alt44) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:665:7: f= FUNC
                            f=this.match(this.input,FUNC,JsFormulaParserParser.FOLLOW_FUNC_in_folded1182); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            f_tree = this.adaptor.create(f);
                            this.adaptor.addChild(root_0, f_tree);
                            }


                            break;
                        case 2 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:665:18: f= ( NAME | NAME1 ) b= '('
                            f=this.input.LT(1);
                            if ( this.input.LA(1)==NAME||this.input.LA(1)==NAME1 ) {
                                this.input.consume();
                                if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(f));
                                this.state.errorRecovery=false;this.state.failed=false;
                            }
                            else {
                                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                throw mse;
                            }

                            b=this.match(this.input,P_OPEN,JsFormulaParserParser.FOLLOW_P_OPEN_in_folded1200); if (this.state.failed) return retval;
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
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:704:5: ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:705:6: ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:705:6: ( INTERSECT )?
                    var alt45=2;
                    var LA45_0 = this.input.LA(1);

                    if ( (LA45_0==INTERSECT) ) {
                        var LA45_1 = this.input.LA(2);

                        if ( (this.synpred88_JsFormulaParser()) ) {
                            alt45=1;
                        }
                    }
                    switch (alt45) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                            INTERSECT27=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_folded1215); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT27_tree = this.adaptor.create(INTERSECT27);
                            this.adaptor.addChild(root_0, INTERSECT27_tree);
                            }


                            break;

                    }

                    this.pushFollow(JsFormulaParserParser.FOLLOW_range_in_folded1223);
                    range28=this.range();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, range28.getTree());
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:707:6: ( INTERSECT )?
                    var alt46=2;
                    var LA46_0 = this.input.LA(1);

                    if ( (LA46_0==INTERSECT) ) {
                        alt46=1;
                    }
                    switch (alt46) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                            INTERSECT29=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_folded1231); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            INTERSECT29_tree = this.adaptor.create(INTERSECT29);
                            this.adaptor.addChild(root_0, INTERSECT29_tree);
                            }


                            break;

                    }

                    rBrace=this.match(this.input,P_CLOSE,JsFormulaParserParser.FOLLOW_P_CLOSE_in_folded1242); if (this.state.failed) return retval;
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
                      								}else
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
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:760:6: (f= FUNC | f= ( NAME | NAME1 ) ( INTERSECT )? b= '(' ) ( ')' )
                    root_0 = this.adaptor.nil();

                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:760:6: (f= FUNC | f= ( NAME | NAME1 ) ( INTERSECT )? b= '(' )
                    var alt48=2;
                    var LA48_0 = this.input.LA(1);

                    if ( (LA48_0==FUNC) ) {
                        alt48=1;
                    }
                    else if ( (LA48_0==NAME||LA48_0==NAME1) ) {
                        alt48=2;
                    }
                    else {
                        if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                        var nvae =
                            new org.antlr.runtime.NoViableAltException("", 48, 0, this.input);

                        throw nvae;
                    }
                    switch (alt48) {
                        case 1 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:760:7: f= FUNC
                            f=this.match(this.input,FUNC,JsFormulaParserParser.FOLLOW_FUNC_in_folded1256); if (this.state.failed) return retval;
                            if ( this.state.backtracking===0 ) {
                            f_tree = this.adaptor.create(f);
                            this.adaptor.addChild(root_0, f_tree);
                            }


                            break;
                        case 2 :
                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:760:18: f= ( NAME | NAME1 ) ( INTERSECT )? b= '('
                            f=this.input.LT(1);
                            if ( this.input.LA(1)==NAME||this.input.LA(1)==NAME1 ) {
                                this.input.consume();
                                if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, this.adaptor.create(f));
                                this.state.errorRecovery=false;this.state.failed=false;
                            }
                            else {
                                if (this.state.backtracking>0) {this.state.failed=true; return retval;}
                                var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                                throw mse;
                            }

                            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:760:35: ( INTERSECT )?
                            var alt47=2;
                            var LA47_0 = this.input.LA(1);

                            if ( (LA47_0==INTERSECT) ) {
                                alt47=1;
                            }
                            switch (alt47) {
                                case 1 :
                                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                                    INTERSECT30=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_folded1270); if (this.state.failed) return retval;
                                    if ( this.state.backtracking===0 ) {
                                    INTERSECT30_tree = this.adaptor.create(INTERSECT30);
                                    this.adaptor.addChild(root_0, INTERSECT30_tree);
                                    }


                                    break;

                            }

                            b=this.match(this.input,P_OPEN,JsFormulaParserParser.FOLLOW_P_OPEN_in_folded1275); if (this.state.failed) return retval;
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
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:790:6: ( ')' )
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:790:7: ')'
                    char_literal31=this.match(this.input,P_CLOSE,JsFormulaParserParser.FOLLOW_P_CLOSE_in_folded1280); if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) {
                    char_literal31_tree = this.adaptor.create(char_literal31);
                    this.adaptor.addChild(root_0, char_literal31_tree);
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
        JsFormulaParserParser.range_return = function(){};
        org.antlr.lang.extend(JsFormulaParserParser.range_return,
                          org.antlr.runtime.ParserRuleReturnScope,
        {
            getTree: function() { return this.tree; }
        });
        return;
    })(),

    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:793:1: range returns [String value] : (params= atom_list | funct= folded );
    // $ANTLR start "range"
    range: function() {
        var retval = new JsFormulaParserParser.range_return();
        retval.start = this.input.LT(1);
        var range_StartIndex = this.input.index();
        var root_0 = null;

         var params = null;
         var funct = null;


        try {
            if ( this.state.backtracking>0 && this.alreadyParsedRule(this.input, 7) ) { return retval; }
            // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:794:2: (params= atom_list | funct= folded )
            var alt50=2;
            alt50 = this.dfa50.predict(this.input);
            switch (alt50) {
                case 1 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:794:4: params= atom_list
                    root_0 = this.adaptor.nil();

                    this.pushFollow(JsFormulaParserParser.FOLLOW_atom_list_in_range1303);
                    params=this.atom_list();

                    this.state._fsp--;
                    if (this.state.failed) return retval;
                    if ( this.state.backtracking===0 ) this.adaptor.addChild(root_0, params.getTree());
                    if ( this.state.backtracking===0 ) {

                      		
                      	
                    }


                    break;
                case 2 :
                    // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:797:4: funct= folded
                    root_0 = this.adaptor.nil();

                    this.pushFollow(JsFormulaParserParser.FOLLOW_folded_in_range1314);
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

    // $ANTLR start "synpred5_JsFormulaParser"
    synpred5_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:85:7: (sp= INTERSECT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:85:7: sp= INTERSECT
        sp=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred5_JsFormulaParser417); if (this.state.failed) return ;


    },
    // $ANTLR end "synpred5_JsFormulaParser",

    // $ANTLR start "synpred28_JsFormulaParser"
    synpred28_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:99:3: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:99:3: m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )?
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

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:137:6: ( INTERSECT )?
        var alt53=2;
        var LA53_0 = this.input.LA(1);

        if ( (LA53_0==INTERSECT) ) {
            alt53=1;
        }
        switch (alt53) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred28_JsFormulaParser512); if (this.state.failed) return ;


                break;

        }



    },
    // $ANTLR end "synpred28_JsFormulaParser",

    // $ANTLR start "synpred29_JsFormulaParser"
    synpred29_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:98:4: ( (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:98:4: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:98:4: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )?
        var alt55=2;
        alt55 = this.dfa55.predict(this.input);
        switch (alt55) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:99:3: m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )?
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

                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:137:6: ( INTERSECT )?
                var alt54=2;
                var LA54_0 = this.input.LA(1);

                if ( (LA54_0==INTERSECT) ) {
                    alt54=1;
                }
                switch (alt54) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                        this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred29_JsFormulaParser512); if (this.state.failed) return ;


                        break;

                }



                break;

        }

        this.pushFollow(JsFormulaParserParser.FOLLOW_expr_in_synpred29_JsFormulaParser525);
        b=this.expr();

        this.state._fsp--;
        if (this.state.failed) return ;


    },
    // $ANTLR end "synpred29_JsFormulaParser",

    // $ANTLR start "synpred38_JsFormulaParser"
    synpred38_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:197:5: ( (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )? x= LOCALE_NUMBER em= COLON endName= ( NAME | LOCALE_NUMBER ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:197:5: (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )? x= LOCALE_NUMBER em= COLON endName= ( NAME | LOCALE_NUMBER )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:197:5: (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )?
        var alt60=2;
        var LA60_0 = this.input.LA(1);

        if ( (LA60_0==LOCALE_NUMBER) ) {
            var LA60_1 = this.input.LA(2);

            if ( (LA60_1==INTERSECT_ODS) ) {
                alt60=1;
            }
        }
        else if ( (LA60_0==SINGLEQUOT_STRING) ) {
            alt60=1;
        }
        switch (alt60) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:197:6: sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )?
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

                m=this.match(this.input,INTERSECT_ODS,JsFormulaParserParser.FOLLOW_INTERSECT_ODS_in_synpred38_JsFormulaParser610); if (this.state.failed) return ;
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:197:59: (wp2= INTERSECT )?
                var alt59=2;
                var LA59_0 = this.input.LA(1);

                if ( (LA59_0==INTERSECT) ) {
                    alt59=1;
                }
                switch (alt59) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:197:60: wp2= INTERSECT
                        wp2=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred38_JsFormulaParser615); if (this.state.failed) return ;


                        break;

                }



                break;

        }

        x=this.match(this.input,LOCALE_NUMBER,JsFormulaParserParser.FOLLOW_LOCALE_NUMBER_in_synpred38_JsFormulaParser623); if (this.state.failed) return ;
        em=this.match(this.input,COLON,JsFormulaParserParser.FOLLOW_COLON_in_synpred38_JsFormulaParser627); if (this.state.failed) return ;
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
    // $ANTLR end "synpred38_JsFormulaParser",

    // $ANTLR start "synpred42_JsFormulaParser"
    synpred42_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:102: (wp3= INTERSECT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:102: wp3= INTERSECT
        wp3=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred42_JsFormulaParser705); if (this.state.failed) return ;


    },
    // $ANTLR end "synpred42_JsFormulaParser",

    // $ANTLR start "synpred49_JsFormulaParser"
    synpred49_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:121: (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:121: em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME )
        em=this.match(this.input,COLON,JsFormulaParserParser.FOLLOW_COLON_in_synpred49_JsFormulaParser714); if (this.state.failed) return ;
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:130: ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )?
        var alt67=2;
        var LA67_0 = this.input.LA(1);

        if ( (LA67_0==INTERSECT||(LA67_0>=SINGLEQUOT_STRING && LA67_0<=LOCALE_NUMBER)) ) {
            alt67=1;
        }
        switch (alt67) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:131: (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )?
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:131: (wp4= INTERSECT )?
                var alt65=2;
                var LA65_0 = this.input.LA(1);

                if ( (LA65_0==INTERSECT) ) {
                    alt65=1;
                }
                switch (alt65) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:132: wp4= INTERSECT
                        wp4=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred49_JsFormulaParser720); if (this.state.failed) return ;


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

                m2=this.match(this.input,INTERSECT_ODS,JsFormulaParserParser.FOLLOW_INTERSECT_ODS_in_synpred49_JsFormulaParser734); if (this.state.failed) return ;
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:203: (wp6= INTERSECT )?
                var alt66=2;
                var LA66_0 = this.input.LA(1);

                if ( (LA66_0==INTERSECT) ) {
                    alt66=1;
                }
                switch (alt66) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:204: wp6= INTERSECT
                        wp6=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred49_JsFormulaParser740); if (this.state.failed) return ;


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
    // $ANTLR end "synpred49_JsFormulaParser",

    // $ANTLR start "synpred50_JsFormulaParser"
    synpred50_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:7: (x= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )? (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )? )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:7: x= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )? (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )?
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

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:43: (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )?
        var alt70=2;
        var LA70_0 = this.input.LA(1);

        if ( (LA70_0==INTERSECT_ODS) ) {
            alt70=1;
        }
        switch (alt70) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:45: m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )?
                m=this.match(this.input,INTERSECT_ODS,JsFormulaParserParser.FOLLOW_INTERSECT_ODS_in_synpred50_JsFormulaParser685); if (this.state.failed) return ;
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:61: (wp2= INTERSECT )?
                var alt68=2;
                var LA68_0 = this.input.LA(1);

                if ( (LA68_0==INTERSECT) ) {
                    alt68=1;
                }
                switch (alt68) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:62: wp2= INTERSECT
                        wp2=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred50_JsFormulaParser690); if (this.state.failed) return ;


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

                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:101: (wp3= INTERSECT )?
                var alt69=2;
                var LA69_0 = this.input.LA(1);

                if ( (LA69_0==INTERSECT) ) {
                    alt69=1;
                }
                switch (alt69) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:102: wp3= INTERSECT
                        wp3=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred50_JsFormulaParser705); if (this.state.failed) return ;


                        break;

                }



                break;

        }

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:120: (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )?
        var alt74=2;
        var LA74_0 = this.input.LA(1);

        if ( (LA74_0==COLON) ) {
            alt74=1;
        }
        switch (alt74) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:121: em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME )
                em=this.match(this.input,COLON,JsFormulaParserParser.FOLLOW_COLON_in_synpred50_JsFormulaParser714); if (this.state.failed) return ;
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:130: ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )?
                var alt73=2;
                var LA73_0 = this.input.LA(1);

                if ( (LA73_0==INTERSECT||(LA73_0>=SINGLEQUOT_STRING && LA73_0<=LOCALE_NUMBER)) ) {
                    alt73=1;
                }
                switch (alt73) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:131: (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )?
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:131: (wp4= INTERSECT )?
                        var alt71=2;
                        var LA71_0 = this.input.LA(1);

                        if ( (LA71_0==INTERSECT) ) {
                            alt71=1;
                        }
                        switch (alt71) {
                            case 1 :
                                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:132: wp4= INTERSECT
                                wp4=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred50_JsFormulaParser720); if (this.state.failed) return ;


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

                        m2=this.match(this.input,INTERSECT_ODS,JsFormulaParserParser.FOLLOW_INTERSECT_ODS_in_synpred50_JsFormulaParser734); if (this.state.failed) return ;
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:203: (wp6= INTERSECT )?
                        var alt72=2;
                        var LA72_0 = this.input.LA(1);

                        if ( (LA72_0==INTERSECT) ) {
                            alt72=1;
                        }
                        switch (alt72) {
                            case 1 :
                                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:245:204: wp6= INTERSECT
                                wp6=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred50_JsFormulaParser740); if (this.state.failed) return ;


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
    // $ANTLR end "synpred50_JsFormulaParser",

    // $ANTLR start "synpred55_JsFormulaParser"
    synpred55_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:408:5: ( folded )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:408:5: folded
        this.pushFollow(JsFormulaParserParser.FOLLOW_folded_in_synpred55_JsFormulaParser827);
        this.folded();

        this.state._fsp--;
        if (this.state.failed) return ;


    },
    // $ANTLR end "synpred55_JsFormulaParser",

    // $ANTLR start "synpred56_JsFormulaParser"
    synpred56_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:409:31: (wp1= INTERSECT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:409:31: wp1= INTERSECT
        wp1=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred56_JsFormulaParser844); if (this.state.failed) return ;


    },
    // $ANTLR end "synpred56_JsFormulaParser",

    // $ANTLR start "synpred70_JsFormulaParser"
    synpred70_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:107: (wp3= INTERSECT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:107: wp3= INTERSECT
        wp3=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred70_JsFormulaParser1002); if (this.state.failed) return ;


    },
    // $ANTLR end "synpred70_JsFormulaParser",

    // $ANTLR start "synpred78_JsFormulaParser"
    synpred78_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:127: (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:127: m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER )
        m=this.match(this.input,COLON,JsFormulaParserParser.FOLLOW_COLON_in_synpred78_JsFormulaParser1012); if (this.state.failed) return ;
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:135: ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )?
        var alt99=2;
        var LA99_0 = this.input.LA(1);

        if ( (LA99_0==INTERSECT||LA99_0==NAME1) ) {
            alt99=1;
        }
        else if ( (LA99_0==NAME) ) {
            var LA99_2 = this.input.LA(2);

            if ( (LA99_2==INTERSECT_ODS) ) {
                alt99=1;
            }
        }
        switch (alt99) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:136: (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )?
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:136: (wp4= INTERSECT )?
                var alt97=2;
                var LA97_0 = this.input.LA(1);

                if ( (LA97_0==INTERSECT) ) {
                    alt97=1;
                }
                switch (alt97) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:137: wp4= INTERSECT
                        wp4=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred78_JsFormulaParser1018); if (this.state.failed) return ;


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

                op2=this.match(this.input,INTERSECT_ODS,JsFormulaParserParser.FOLLOW_INTERSECT_ODS_in_synpred78_JsFormulaParser1032); if (this.state.failed) return ;
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:190: (wp6= INTERSECT )?
                var alt98=2;
                var LA98_0 = this.input.LA(1);

                if ( (LA98_0==INTERSECT) ) {
                    alt98=1;
                }
                switch (alt98) {
                    case 1 :
                        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:513:191: wp6= INTERSECT
                        wp6=this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred78_JsFormulaParser1037); if (this.state.failed) return ;


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
    // $ANTLR end "synpred78_JsFormulaParser",

    // $ANTLR start "synpred80_JsFormulaParser"
    synpred80_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:646:28: ( INTERSECT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:646:28: INTERSECT
        this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred80_JsFormulaParser1088); if (this.state.failed) return ;


    },
    // $ANTLR end "synpred80_JsFormulaParser",

    // $ANTLR start "synpred82_JsFormulaParser"
    synpred82_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:656:5: (a= expr )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:656:5: a= expr
        this.pushFollow(JsFormulaParserParser.FOLLOW_expr_in_synpred82_JsFormulaParser1123);
        a=this.expr();

        this.state._fsp--;
        if (this.state.failed) return ;


    },
    // $ANTLR end "synpred82_JsFormulaParser",

    // $ANTLR start "synpred83_JsFormulaParser"
    synpred83_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:658:26: ( INTERSECT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:658:26: INTERSECT
        this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred83_JsFormulaParser1135); if (this.state.failed) return ;


    },
    // $ANTLR end "synpred83_JsFormulaParser",

    // $ANTLR start "synpred85_JsFormulaParser"
    synpred85_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:658:5: ( ARRAY_FORMULAR_START ( INTERSECT )? (b= atom_list ( INTERSECT )? ARRAY_FORMULAR_END ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:658:5: ARRAY_FORMULAR_START ( INTERSECT )? (b= atom_list ( INTERSECT )? ARRAY_FORMULAR_END )
        this.match(this.input,ARRAY_FORMULAR_START,JsFormulaParserParser.FOLLOW_ARRAY_FORMULAR_START_in_synpred85_JsFormulaParser1133); if (this.state.failed) return ;
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:658:26: ( INTERSECT )?
        var alt102=2;
        var LA102_0 = this.input.LA(1);

        if ( (LA102_0==INTERSECT) ) {
            var LA102_1 = this.input.LA(2);

            if ( (this.synpred83_JsFormulaParser()) ) {
                alt102=1;
            }
        }
        switch (alt102) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred85_JsFormulaParser1135); if (this.state.failed) return ;


                break;

        }

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:658:37: (b= atom_list ( INTERSECT )? ARRAY_FORMULAR_END )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:658:38: b= atom_list ( INTERSECT )? ARRAY_FORMULAR_END
        this.pushFollow(JsFormulaParserParser.FOLLOW_atom_list_in_synpred85_JsFormulaParser1141);
        b=this.atom_list();

        this.state._fsp--;
        if (this.state.failed) return ;
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:658:50: ( INTERSECT )?
        var alt103=2;
        var LA103_0 = this.input.LA(1);

        if ( (LA103_0==INTERSECT) ) {
            alt103=1;
        }
        switch (alt103) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred85_JsFormulaParser1143); if (this.state.failed) return ;


                break;

        }

        this.match(this.input,ARRAY_FORMULAR_END,JsFormulaParserParser.FOLLOW_ARRAY_FORMULAR_END_in_synpred85_JsFormulaParser1146); if (this.state.failed) return ;





    },
    // $ANTLR end "synpred85_JsFormulaParser",

    // $ANTLR start "synpred88_JsFormulaParser"
    synpred88_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:705:6: ( INTERSECT )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:705:6: INTERSECT
        this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred88_JsFormulaParser1215); if (this.state.failed) return ;


    },
    // $ANTLR end "synpred88_JsFormulaParser",

    // $ANTLR start "synpred90_JsFormulaParser"
    synpred90_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:665:6: ( (f= FUNC | f= ( NAME | NAME1 ) b= '(' ) ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE ) )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:665:6: (f= FUNC | f= ( NAME | NAME1 ) b= '(' ) ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:665:6: (f= FUNC | f= ( NAME | NAME1 ) b= '(' )
        var alt104=2;
        var LA104_0 = this.input.LA(1);

        if ( (LA104_0==FUNC) ) {
            alt104=1;
        }
        else if ( (LA104_0==NAME||LA104_0==NAME1) ) {
            alt104=2;
        }
        else {
            if (this.state.backtracking>0) {this.state.failed=true; return ;}
            var nvae =
                new org.antlr.runtime.NoViableAltException("", 104, 0, this.input);

            throw nvae;
        }
        switch (alt104) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:665:7: f= FUNC
                f=this.match(this.input,FUNC,JsFormulaParserParser.FOLLOW_FUNC_in_synpred90_JsFormulaParser1182); if (this.state.failed) return ;


                break;
            case 2 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:665:18: f= ( NAME | NAME1 ) b= '('
                f=this.input.LT(1);
                if ( this.input.LA(1)==NAME||this.input.LA(1)==NAME1 ) {
                    this.input.consume();
                    this.state.errorRecovery=false;this.state.failed=false;
                }
                else {
                    if (this.state.backtracking>0) {this.state.failed=true; return ;}
                    var mse = new org.antlr.runtime.MismatchedSetException(null,this.input);
                    throw mse;
                }

                b=this.match(this.input,P_OPEN,JsFormulaParserParser.FOLLOW_P_OPEN_in_synpred90_JsFormulaParser1200); if (this.state.failed) return ;


                break;

        }

        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:704:5: ( ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:705:6: ( INTERSECT )? range ( INTERSECT )? rBrace= P_CLOSE
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:705:6: ( INTERSECT )?
        var alt105=2;
        var LA105_0 = this.input.LA(1);

        if ( (LA105_0==INTERSECT) ) {
            var LA105_1 = this.input.LA(2);

            if ( (this.synpred88_JsFormulaParser()) ) {
                alt105=1;
            }
        }
        switch (alt105) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred90_JsFormulaParser1215); if (this.state.failed) return ;


                break;

        }

        this.pushFollow(JsFormulaParserParser.FOLLOW_range_in_synpred90_JsFormulaParser1223);
        this.range();

        this.state._fsp--;
        if (this.state.failed) return ;
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:707:6: ( INTERSECT )?
        var alt106=2;
        var LA106_0 = this.input.LA(1);

        if ( (LA106_0==INTERSECT) ) {
            alt106=1;
        }
        switch (alt106) {
            case 1 :
                // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:0:0: INTERSECT
                this.match(this.input,INTERSECT,JsFormulaParserParser.FOLLOW_INTERSECT_in_synpred90_JsFormulaParser1231); if (this.state.failed) return ;


                break;

        }

        rBrace=this.match(this.input,P_CLOSE,JsFormulaParserParser.FOLLOW_P_CLOSE_in_synpred90_JsFormulaParser1242); if (this.state.failed) return ;





    },
    // $ANTLR end "synpred90_JsFormulaParser",

    // $ANTLR start "synpred94_JsFormulaParser"
    synpred94_JsFormulaParser_fragment: function() {
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:794:4: (params= atom_list )
        // C:\\IBMDoc\\DocsSoruceCode\\com.ibm.docs.web.resources\\WebContent\\js\\parser\\JsFormulaParser.g:794:4: params= atom_list
        this.pushFollow(JsFormulaParserParser.FOLLOW_atom_list_in_synpred94_JsFormulaParser1303);
        params=this.atom_list();

        this.state._fsp--;
        if (this.state.failed) return ;


    },
    // $ANTLR end "synpred94_JsFormulaParser"

    // Delegated rules



    synpred82_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred82_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred94_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred94_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred50_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred50_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred83_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred83_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred85_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred85_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred42_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred42_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred88_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred88_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred55_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred55_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred56_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred56_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred78_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred78_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred5_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred5_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred49_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred49_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred38_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred38_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred28_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred28_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred29_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred29_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred90_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred90_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred80_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred80_JsFormulaParser_fragment(); // can never throw exception
        } catch (re) {
            alert("impossible: "+re.toString());
        }
        var success = !this.state.failed;
        this.input.rewind(start);
        this.state.backtracking--;
        this.state.failed=false;
        return success;
    },
    synpred70_JsFormulaParser: function() {
        this.state.backtracking++;
        var start = this.input.mark();
        try {
            this.synpred70_JsFormulaParser_fragment(); // can never throw exception
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

org.antlr.lang.augmentObject(JsFormulaParserParser, {
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
            "\u0001\u000b\u0001\u0006\u0001\u0009\u0001\u0008",
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

org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA9_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA9_eotS),
    DFA9_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA9_eofS),
    DFA9_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA9_minS),
    DFA9_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA9_maxS),
    DFA9_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA9_acceptS),
    DFA9_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA9_specialS),
    DFA9_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaParserParser.DFA9_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA9_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaParserParser.DFA9 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 9;
    this.eot = JsFormulaParserParser.DFA9_eot;
    this.eof = JsFormulaParserParser.DFA9_eof;
    this.min = JsFormulaParserParser.DFA9_min;
    this.max = JsFormulaParserParser.DFA9_max;
    this.accept = JsFormulaParserParser.DFA9_accept;
    this.special = JsFormulaParserParser.DFA9_special;
    this.transition = JsFormulaParserParser.DFA9_transition;
};

org.antlr.lang.extend(JsFormulaParserParser.DFA9, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "()* loopback of 98:3: ( (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )? b= expr )*";
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
                            if ( (this.synpred29_JsFormulaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_2);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA9_3 = input.LA(1);

                             
                            var index9_3 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_3);
                            if ( s>=0 ) return s;
                            break;
                        case 2 : 
                            var LA9_4 = input.LA(1);

                             
                            var index9_4 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_4);
                            if ( s>=0 ) return s;
                            break;
                        case 3 : 
                            var LA9_5 = input.LA(1);

                             
                            var index9_5 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_5);
                            if ( s>=0 ) return s;
                            break;
                        case 4 : 
                            var LA9_6 = input.LA(1);

                             
                            var index9_6 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_6);
                            if ( s>=0 ) return s;
                            break;
                        case 5 : 
                            var LA9_7 = input.LA(1);

                             
                            var index9_7 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_7);
                            if ( s>=0 ) return s;
                            break;
                        case 6 : 
                            var LA9_8 = input.LA(1);

                             
                            var index9_8 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_8);
                            if ( s>=0 ) return s;
                            break;
                        case 7 : 
                            var LA9_9 = input.LA(1);

                             
                            var index9_9 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_9);
                            if ( s>=0 ) return s;
                            break;
                        case 8 : 
                            var LA9_10 = input.LA(1);

                             
                            var index9_10 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_10);
                            if ( s>=0 ) return s;
                            break;
                        case 9 : 
                            var LA9_11 = input.LA(1);

                             
                            var index9_11 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_11);
                            if ( s>=0 ) return s;
                            break;
                        case 10 : 
                            var LA9_13 = input.LA(1);

                             
                            var index9_13 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaParser()) ) {s = 17;}

                            else if ( (true) ) {s = 1;}

                             
                            input.seek(index9_13);
                            if ( s>=0 ) return s;
                            break;
                        case 11 : 
                            var LA9_16 = input.LA(1);

                             
                            var index9_16 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred29_JsFormulaParser()) ) {s = 17;}

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
org.antlr.lang.augmentObject(JsFormulaParserParser, {
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

org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA8_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA8_eotS),
    DFA8_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA8_eofS),
    DFA8_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA8_minS),
    DFA8_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA8_maxS),
    DFA8_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA8_acceptS),
    DFA8_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA8_specialS),
    DFA8_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaParserParser.DFA8_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA8_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaParserParser.DFA8 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 8;
    this.eot = JsFormulaParserParser.DFA8_eot;
    this.eof = JsFormulaParserParser.DFA8_eof;
    this.min = JsFormulaParserParser.DFA8_min;
    this.max = JsFormulaParserParser.DFA8_max;
    this.accept = JsFormulaParserParser.DFA8_accept;
    this.special = JsFormulaParserParser.DFA8_special;
    this.transition = JsFormulaParserParser.DFA8_transition;
};

org.antlr.lang.extend(JsFormulaParserParser.DFA8, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "98:4: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )?";
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
                            if ( (this.synpred28_JsFormulaParser()) ) {s = 3;}

                            else if ( (true) ) {s = 4;}

                             
                            input.seek(index8_1);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA8_2 = input.LA(1);

                             
                            var index8_2 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred28_JsFormulaParser()) ) {s = 3;}

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
org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA37_eotS:
        "\u000d\uffff",
    DFA37_eofS:
        "\u000d\uffff",
    DFA37_minS:
        "\u0001\u0008\u0002\uffff\u0002\u0000\u0003\uffff\u0001\u0000\u0004"+
    "\uffff",
    DFA37_maxS:
        "\u0001\u0028\u0002\uffff\u0002\u0000\u0003\uffff\u0001\u0000\u0004"+
    "\uffff",
    DFA37_acceptS:
        "\u0001\uffff\u0001\u0001\u0001\u0002\u0002\uffff\u0001\u0005\u0001"+
    "\u0006\u0001\u0007\u0001\uffff\u0001\u0008\u0001\u0009\u0001\u0003\u0001"+
    "\u0004",
    DFA37_specialS:
        "\u0003\uffff\u0001\u0000\u0001\u0001\u0003\uffff\u0001\u0002\u0004"+
    "\uffff}>",
    DFA37_transitionS: [
            "\u0001\u0002\u0001\uffff\u0001\u0001\u0005\uffff\u0001\u0006"+
            "\u000d\uffff\u0001\u0009\u0003\uffff\u0001\u0004\u0001\u0003"+
            "\u0001\u0008\u0001\u000a\u0001\u0005\u0001\u0008\u0001\u0007",
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

org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA37_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA37_eotS),
    DFA37_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA37_eofS),
    DFA37_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA37_minS),
    DFA37_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA37_maxS),
    DFA37_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA37_acceptS),
    DFA37_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA37_specialS),
    DFA37_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaParserParser.DFA37_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA37_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaParserParser.DFA37 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 37;
    this.eot = JsFormulaParserParser.DFA37_eot;
    this.eof = JsFormulaParserParser.DFA37_eof;
    this.min = JsFormulaParserParser.DFA37_min;
    this.max = JsFormulaParserParser.DFA37_max;
    this.accept = JsFormulaParserParser.DFA37_accept;
    this.special = JsFormulaParserParser.DFA37_special;
    this.transition = JsFormulaParserParser.DFA37_transition;
};

org.antlr.lang.extend(JsFormulaParserParser.DFA37, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "186:1: atom returns [String value] : ( '-' ( INTERSECT )? (b= atom ) | '+' ( INTERSECT )? (b= atom ) | (sn= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m= INTERSECT_ODS (wp2= INTERSECT )? )? x= LOCALE_NUMBER em= COLON endName= ( NAME | LOCALE_NUMBER ) | x= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) (m= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME ) (wp3= INTERSECT )? )? (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )? | x= DOUBLEQUOT_STRING | (brace= P_OPEN ) ( ( INTERSECT )? expr ( INTERSECT )? ebrace= P_CLOSE ) | folded | (a= ARRAY_FORMULAR_START (wp1= INTERSECT )? ) ( (firToken= atom ) ( ( ( (wp2= INTERSECT )? sep= ( '.' | ARG_SEP ) (wp3= INTERSECT )? ) )? (token= atom ) )* )? ( (wp4= INTERSECT )? ARRAY_FORMULAR_END ) | name1= ( ERRORNAME | NAME | NAME1 ) (op= INTERSECT_ODS (wp2= INTERSECT )? ename= ( ERRORNAME | NAME | LOCALE_NUMBER ) (wp3= INTERSECT )? )? (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )? );";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA37_3 = input.LA(1);

                             
                            var index37_3 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred38_JsFormulaParser()) ) {s = 11;}

                            else if ( (this.synpred50_JsFormulaParser()) ) {s = 12;}

                             
                            input.seek(index37_3);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA37_4 = input.LA(1);

                             
                            var index37_4 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred38_JsFormulaParser()) ) {s = 11;}

                            else if ( (this.synpred50_JsFormulaParser()) ) {s = 12;}

                             
                            input.seek(index37_4);
                            if ( s>=0 ) return s;
                            break;
                        case 2 : 
                            var LA37_8 = input.LA(1);

                             
                            var index37_8 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred55_JsFormulaParser()) ) {s = 7;}

                            else if ( (true) ) {s = 10;}

                             
                            input.seek(index37_8);
                            if ( s>=0 ) return s;
                            break;
            }
        }).call(this.recognizer, s, input);
        if (!org.antlr.lang.isUndefined(retval)) {
            return retval;
        }
        if (this.recognizer.state.backtracking>0) {this.recognizer.state.failed=true; return -1;}
        var nvae =
            new org.antlr.runtime.NoViableAltException(this.getDescription(), 37, _s, input);
        this.error(nvae);
        throw nvae;
    },
    dummy: null
});
org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA20_eotS:
        "\u000c\uffff",
    DFA20_eofS:
        "\u0001\u0002\u0003\uffff\u0002\u0002\u0006\uffff",
    DFA20_minS:
        "\u0001\u0004\u0001\u0008\u0001\uffff\u0001\u0008\u0002\u0004\u0002"+
    "\u0000\u0001\u0020\u0001\uffff\u0001\u0023\u0001\u0000",
    DFA20_maxS:
        "\u0001\u0038\u0001\u0028\u0001\uffff\u0003\u0028\u0002\u0000\u0001"+
    "\u0025\u0001\uffff\u0001\u0025\u0001\u0000",
    DFA20_acceptS:
        "\u0002\uffff\u0001\u0002\u0006\uffff\u0001\u0001\u0002\uffff",
    DFA20_specialS:
        "\u0006\uffff\u0001\u0002\u0001\u0000\u0003\uffff\u0001\u0001}>",
    DFA20_transitionS: [
            "\u0001\u0001\u0001\u0002\u0001\uffff\u0012\u0002\u0002\uffff"+
            "\u000e\u0002\u000f\uffff\u0001\u0002",
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

org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA20_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA20_eotS),
    DFA20_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA20_eofS),
    DFA20_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA20_minS),
    DFA20_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA20_maxS),
    DFA20_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA20_acceptS),
    DFA20_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA20_specialS),
    DFA20_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaParserParser.DFA20_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA20_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaParserParser.DFA20 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 20;
    this.eot = JsFormulaParserParser.DFA20_eot;
    this.eof = JsFormulaParserParser.DFA20_eof;
    this.min = JsFormulaParserParser.DFA20_min;
    this.max = JsFormulaParserParser.DFA20_max;
    this.accept = JsFormulaParserParser.DFA20_accept;
    this.special = JsFormulaParserParser.DFA20_special;
    this.transition = JsFormulaParserParser.DFA20_transition;
};

org.antlr.lang.extend(JsFormulaParserParser.DFA20, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "245:120: (em= COLON ( (wp4= INTERSECT )? x2= ( SINGLEQUOT_STRING | LOCALE_NUMBER ) m2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME ) )?";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA20_7 = input.LA(1);

                             
                            var index20_7 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred49_JsFormulaParser()) ) {s = 9;}

                            else if ( (true) ) {s = 2;}

                             
                            input.seek(index20_7);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA20_11 = input.LA(1);

                             
                            var index20_11 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred49_JsFormulaParser()) ) {s = 9;}

                            else if ( (true) ) {s = 2;}

                             
                            input.seek(index20_11);
                            if ( s>=0 ) return s;
                            break;
                        case 2 : 
                            var LA20_6 = input.LA(1);

                             
                            var index20_6 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred49_JsFormulaParser()) ) {s = 9;}

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
org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA36_eotS:
        "\u000c\uffff",
    DFA36_eofS:
        "\u0001\u0002\u0004\uffff\u0001\u0002\u0006\uffff",
    DFA36_minS:
        "\u0001\u0004\u0001\u0008\u0001\uffff\u0001\u0008\u0001\u0000\u0001"+
    "\u0004\u0002\u0000\u0001\uffff\u0001\u0020\u0001\u0023\u0001\u0000",
    DFA36_maxS:
        "\u0001\u0038\u0001\u0028\u0001\uffff\u0001\u0028\u0001\u0000\u0001"+
    "\u0028\u0002\u0000\u0001\uffff\u0002\u0025\u0001\u0000",
    DFA36_acceptS:
        "\u0002\uffff\u0001\u0002\u0005\uffff\u0001\u0001\u0003\uffff",
    DFA36_specialS:
        "\u0004\uffff\u0001\u0003\u0001\uffff\u0001\u0000\u0001\u0002\u0003"+
    "\uffff\u0001\u0001}>",
    DFA36_transitionS: [
            "\u0001\u0001\u0001\u0002\u0001\uffff\u0012\u0002\u0002\uffff"+
            "\u000e\u0002\u000f\uffff\u0001\u0002",
            "\u0001\u0002\u0001\uffff\u0001\u0002\u0005\uffff\u0001\u0002"+
            "\u000d\uffff\u0001\u0002\u0001\uffff\u0001\u0003\u0001\uffff"+
            "\u0001\u0002\u0001\u0006\u0001\u0004\u0001\u0007\u0001\u0002"+
            "\u0001\u0005\u0001\u0002",
            "",
            "\u0001\u0002\u0001\uffff\u0001\u0002\u0005\uffff\u0001\u0002"+
            "\u000d\uffff\u0001\u0002\u0003\uffff\u0002\u0002\u0001\u0005"+
            "\u0002\u0002\u0001\u0005\u0001\u0002",
            "\u0001\uffff",
            "\u0002\u0002\u0001\u0009\u0012\u0002\u0002\uffff\u000e\u0002",
            "\u0001\uffff",
            "\u0001\uffff",
            "",
            "\u0001\u000a\u0002\uffff\u0003\u000b",
            "\u0003\u000b",
            "\u0001\uffff"
    ]
});

org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA36_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA36_eotS),
    DFA36_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA36_eofS),
    DFA36_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA36_minS),
    DFA36_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA36_maxS),
    DFA36_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA36_acceptS),
    DFA36_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA36_specialS),
    DFA36_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaParserParser.DFA36_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA36_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaParserParser.DFA36 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 36;
    this.eot = JsFormulaParserParser.DFA36_eot;
    this.eof = JsFormulaParserParser.DFA36_eof;
    this.min = JsFormulaParserParser.DFA36_min;
    this.max = JsFormulaParserParser.DFA36_max;
    this.accept = JsFormulaParserParser.DFA36_accept;
    this.special = JsFormulaParserParser.DFA36_special;
    this.transition = JsFormulaParserParser.DFA36_transition;
};

org.antlr.lang.extend(JsFormulaParserParser.DFA36, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "513:126: (m= COLON ( (wp4= INTERSECT )? name2= ( NAME | NAME1 ) op2= INTERSECT_ODS (wp6= INTERSECT )? )? endName= ( ERRORNAME | NAME | LOCALE_NUMBER ) )?";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA36_6 = input.LA(1);

                             
                            var index36_6 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred78_JsFormulaParser()) ) {s = 8;}

                            else if ( (true) ) {s = 2;}

                             
                            input.seek(index36_6);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA36_11 = input.LA(1);

                             
                            var index36_11 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred78_JsFormulaParser()) ) {s = 8;}

                            else if ( (true) ) {s = 2;}

                             
                            input.seek(index36_11);
                            if ( s>=0 ) return s;
                            break;
                        case 2 : 
                            var LA36_7 = input.LA(1);

                             
                            var index36_7 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred78_JsFormulaParser()) ) {s = 8;}

                            else if ( (true) ) {s = 2;}

                             
                            input.seek(index36_7);
                            if ( s>=0 ) return s;
                            break;
                        case 3 : 
                            var LA36_4 = input.LA(1);

                             
                            var index36_4 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred78_JsFormulaParser()) ) {s = 8;}

                            else if ( (true) ) {s = 2;}

                             
                            input.seek(index36_4);
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
org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA43_eotS:
        "\u0011\uffff",
    DFA43_eofS:
        "\u0001\u000b\u0010\uffff",
    DFA43_minS:
        "\u0001\u0008\u0008\uffff\u0001\u0000\u0007\uffff",
    DFA43_maxS:
        "\u0001\u0028\u0008\uffff\u0001\u0000\u0007\uffff",
    DFA43_acceptS:
        "\u0001\uffff\u0001\u0001\u0009\uffff\u0001\u0003\u0004\uffff\u0001"+
    "\u0002",
    DFA43_specialS:
        "\u0009\uffff\u0001\u0000\u0007\uffff}>",
    DFA43_transitionS: [
            "\u0001\u0001\u0001\uffff\u0001\u0001\u0005\uffff\u0001\u0001"+
            "\u0001\u000b\u000c\uffff\u0001\u0009\u0003\u000b\u0007\u0001",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "\u0001\uffff",
            "",
            "",
            "",
            "",
            "",
            "",
            ""
    ]
});

org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA43_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA43_eotS),
    DFA43_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA43_eofS),
    DFA43_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA43_minS),
    DFA43_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA43_maxS),
    DFA43_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA43_acceptS),
    DFA43_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA43_specialS),
    DFA43_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaParserParser.DFA43_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA43_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaParserParser.DFA43 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 43;
    this.eot = JsFormulaParserParser.DFA43_eot;
    this.eof = JsFormulaParserParser.DFA43_eof;
    this.min = JsFormulaParserParser.DFA43_min;
    this.max = JsFormulaParserParser.DFA43_max;
    this.accept = JsFormulaParserParser.DFA43_accept;
    this.special = JsFormulaParserParser.DFA43_special;
    this.transition = JsFormulaParserParser.DFA43_transition;
};

org.antlr.lang.extend(JsFormulaParserParser.DFA43, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "655:1: atom_type returns [String value] : (a= expr | ARRAY_FORMULAR_START ( INTERSECT )? (b= atom_list ( INTERSECT )? ARRAY_FORMULAR_END ) | );";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA43_9 = input.LA(1);

                             
                            var index43_9 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred82_JsFormulaParser()) ) {s = 1;}

                            else if ( (this.synpred85_JsFormulaParser()) ) {s = 16;}

                             
                            input.seek(index43_9);
                            if ( s>=0 ) return s;
                            break;
            }
        }).call(this.recognizer, s, input);
        if (!org.antlr.lang.isUndefined(retval)) {
            return retval;
        }
        if (this.recognizer.state.backtracking>0) {this.recognizer.state.failed=true; return -1;}
        var nvae =
            new org.antlr.runtime.NoViableAltException(this.getDescription(), 43, _s, input);
        this.error(nvae);
        throw nvae;
    },
    dummy: null
});
org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA50_eotS:
        "\u000f\uffff",
    DFA50_eofS:
        "\u000f\uffff",
    DFA50_minS:
        "\u0001\u0008\u0006\uffff\u0002\u0000\u0006\uffff",
    DFA50_maxS:
        "\u0001\u0028\u0006\uffff\u0002\u0000\u0006\uffff",
    DFA50_acceptS:
        "\u0001\uffff\u0001\u0001\u000c\uffff\u0001\u0002",
    DFA50_specialS:
        "\u0007\uffff\u0001\u0000\u0001\u0001\u0006\uffff}>",
    DFA50_transitionS: [
            "\u0001\u0001\u0001\uffff\u0001\u0001\u0005\uffff\u0002\u0001"+
            "\u000c\uffff\u0001\u0001\u0001\uffff\u0004\u0001\u0001\u0008"+
            "\u0002\u0001\u0001\u0008\u0001\u0007",
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

org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA50_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA50_eotS),
    DFA50_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA50_eofS),
    DFA50_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA50_minS),
    DFA50_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA50_maxS),
    DFA50_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA50_acceptS),
    DFA50_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA50_specialS),
    DFA50_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaParserParser.DFA50_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA50_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaParserParser.DFA50 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 50;
    this.eot = JsFormulaParserParser.DFA50_eot;
    this.eof = JsFormulaParserParser.DFA50_eof;
    this.min = JsFormulaParserParser.DFA50_min;
    this.max = JsFormulaParserParser.DFA50_max;
    this.accept = JsFormulaParserParser.DFA50_accept;
    this.special = JsFormulaParserParser.DFA50_special;
    this.transition = JsFormulaParserParser.DFA50_transition;
};

org.antlr.lang.extend(JsFormulaParserParser.DFA50, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "793:1: range returns [String value] : (params= atom_list | funct= folded );";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA50_7 = input.LA(1);

                             
                            var index50_7 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred94_JsFormulaParser()) ) {s = 1;}

                            else if ( (true) ) {s = 14;}

                             
                            input.seek(index50_7);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA50_8 = input.LA(1);

                             
                            var index50_8 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred94_JsFormulaParser()) ) {s = 1;}

                            else if ( (true) ) {s = 14;}

                             
                            input.seek(index50_8);
                            if ( s>=0 ) return s;
                            break;
            }
        }).call(this.recognizer, s, input);
        if (!org.antlr.lang.isUndefined(retval)) {
            return retval;
        }
        if (this.recognizer.state.backtracking>0) {this.recognizer.state.failed=true; return -1;}
        var nvae =
            new org.antlr.runtime.NoViableAltException(this.getDescription(), 50, _s, input);
        this.error(nvae);
        throw nvae;
    },
    dummy: null
});
org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA55_eotS:
        "\u000c\uffff",
    DFA55_eofS:
        "\u000c\uffff",
    DFA55_minS:
        "\u0001\u0004\u0002\u0000\u0009\uffff",
    DFA55_maxS:
        "\u0001\u0028\u0002\u0000\u0009\uffff",
    DFA55_acceptS:
        "\u0003\uffff\u0001\u0001\u0001\u0002\u0007\uffff",
    DFA55_specialS:
        "\u0001\uffff\u0001\u0000\u0001\u0001\u0009\uffff}>",
    DFA55_transitionS: [
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

org.antlr.lang.augmentObject(JsFormulaParserParser, {
    DFA55_eot:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA55_eotS),
    DFA55_eof:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA55_eofS),
    DFA55_min:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA55_minS),
    DFA55_max:
        org.antlr.runtime.DFA.unpackEncodedStringToUnsignedChars(JsFormulaParserParser.DFA55_maxS),
    DFA55_accept:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA55_acceptS),
    DFA55_special:
        org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA55_specialS),
    DFA55_transition: (function() {
        var a = [],
            i,
            numStates = JsFormulaParserParser.DFA55_transitionS.length;
        for (i=0; i<numStates; i++) {
            a.push(org.antlr.runtime.DFA.unpackEncodedString(JsFormulaParserParser.DFA55_transitionS[i]));
        }
        return a;
    })()
});

JsFormulaParserParser.DFA55 = function(recognizer) {
    this.recognizer = recognizer;
    this.decisionNumber = 55;
    this.eot = JsFormulaParserParser.DFA55_eot;
    this.eof = JsFormulaParserParser.DFA55_eof;
    this.min = JsFormulaParserParser.DFA55_min;
    this.max = JsFormulaParserParser.DFA55_max;
    this.accept = JsFormulaParserParser.DFA55_accept;
    this.special = JsFormulaParserParser.DFA55_special;
    this.transition = JsFormulaParserParser.DFA55_transition;
};

org.antlr.lang.extend(JsFormulaParserParser.DFA55, org.antlr.runtime.DFA, {
    getDescription: function() {
        return "98:4: (m= ( LESS | GREATER | LESSEQUAL | GREATEREQUAL | MODEQUAL | MULTEEQUAL | MINUSEQUAL | PLUSEQUAL | DIVEQUAL | NOTEQUAL | NOTEQUAL2 | EQUAL | AND | MINUS | PLUS | MULT | DIV | COLON | POW | ARG_SEP | CONCATENATION ) ( INTERSECT )? )?";
    },
    specialStateTransition: function(s, input) {
        var _s = s;
        /* bind to recognizer so semantic predicates can be evaluated */
        var retval = (function(s, input) {
            switch ( s ) {
                        case 0 : 
                            var LA55_1 = input.LA(1);

                             
                            var index55_1 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred28_JsFormulaParser()) ) {s = 3;}

                            else if ( (true) ) {s = 4;}

                             
                            input.seek(index55_1);
                            if ( s>=0 ) return s;
                            break;
                        case 1 : 
                            var LA55_2 = input.LA(1);

                             
                            var index55_2 = input.index();
                            input.rewind();
                            s = -1;
                            if ( (this.synpred28_JsFormulaParser()) ) {s = 3;}

                            else if ( (true) ) {s = 4;}

                             
                            input.seek(index55_2);
                            if ( s>=0 ) return s;
                            break;
            }
        }).call(this.recognizer, s, input);
        if (!org.antlr.lang.isUndefined(retval)) {
            return retval;
        }
        if (this.recognizer.state.backtracking>0) {this.recognizer.state.failed=true; return -1;}
        var nvae =
            new org.antlr.runtime.NoViableAltException(this.getDescription(), 55, _s, input);
        this.error(nvae);
        throw nvae;
    },
    dummy: null
});
 

// public class variables
org.antlr.lang.augmentObject(JsFormulaParserParser, {
    tokenNames: ["<invalid>", "<EOR>", "<DOWN>", "<UP>", "COLON", "CONCATENATION", "INTERSECT_ODS", "AND", "PLUS", "PLUSEQUAL", "MINUS", "MINUSEQUAL", "MULT", "MULTEEQUAL", "DIV", "DIVEQUAL", "P_OPEN", "P_CLOSE", "EQUAL", "LESS", "LESSEQUAL", "GREATER", "GREATEREQUAL", "NOTEQUAL", "NOTEQUAL2", "AMPERSAND", "OR", "POW", "MODE", "MODEQUAL", "ARRAY_FORMULAR_START", "ARRAY_FORMULAR_END", "INTERSECT", "ARG_SEP", "SINGLEQUOT_STRING", "LOCALE_NUMBER", "NAME", "ERRORNAME", "DOUBLEQUOT_STRING", "NAME1", "FUNC", "NONZERO_NUMBER", "DIGIT", "INT", "SPACE1", "NUMSEP", "LT", "COMMAOrSPACE", "KEYCHARACTER", "ODF_COLUMN", "ODF_COL_RANGE", "ODF_PREWORD", "ODF_PRELIST", "ODF_TABLE", "WHITESPACE", "SPACE", "'.'"],
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
    FOLLOW_INTERSECT_in_expr417: new org.antlr.runtime.BitSet([0x79FDFFB2, 0x000001FF]),
    FOLLOW_MODE_in_expr429: new org.antlr.runtime.BitSet([0x79FDFFB2, 0x000001FF]),
    FOLLOW_set_in_expr443: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_expr512: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_expr_in_expr525: new org.antlr.runtime.BitSet([0x69FDFFB2, 0x000001FF]),
    FOLLOW_MINUS_in_atom559: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_atom561: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_atom_in_atom567: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_PLUS_in_atom574: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_atom576: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_atom_in_atom582: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_atom602: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_atom610: new org.antlr.runtime.BitSet([0x00000000, 0x00000009]),
    FOLLOW_INTERSECT_in_atom615: new org.antlr.runtime.BitSet([0x00000000, 0x00000008]),
    FOLLOW_LOCALE_NUMBER_in_atom623: new org.antlr.runtime.BitSet([0x00000010, 0x00000000]),
    FOLLOW_COLON_in_atom627: new org.antlr.runtime.BitSet([0x00000000, 0x00000018]),
    FOLLOW_set_in_atom632: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_atom675: new org.antlr.runtime.BitSet([0x00000052, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_atom685: new org.antlr.runtime.BitSet([0x00000000, 0x00000031]),
    FOLLOW_INTERSECT_in_atom690: new org.antlr.runtime.BitSet([0x00000000, 0x00000030]),
    FOLLOW_set_in_atom696: new org.antlr.runtime.BitSet([0x00000012, 0x00000001]),
    FOLLOW_INTERSECT_in_atom705: new org.antlr.runtime.BitSet([0x00000012, 0x00000000]),
    FOLLOW_COLON_in_atom714: new org.antlr.runtime.BitSet([0x00000000, 0x0000003D]),
    FOLLOW_INTERSECT_in_atom720: new org.antlr.runtime.BitSet([0x00000000, 0x0000000C]),
    FOLLOW_set_in_atom726: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_atom734: new org.antlr.runtime.BitSet([0x00000000, 0x00000031]),
    FOLLOW_INTERSECT_in_atom740: new org.antlr.runtime.BitSet([0x00000000, 0x00000030]),
    FOLLOW_set_in_atom748: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_DOUBLEQUOT_STRING_in_atom764: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_P_OPEN_in_atom778: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_atom794: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_expr_in_atom803: new org.antlr.runtime.BitSet([0x00020000, 0x00000001]),
    FOLLOW_INTERSECT_in_atom810: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_P_CLOSE_in_atom817: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_folded_in_atom827: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_ARRAY_FORMULAR_START_in_atom839: new org.antlr.runtime.BitSet([0xC0010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_atom844: new org.antlr.runtime.BitSet([0xC0010500, 0x000001FD]),
    FOLLOW_atom_in_atom859: new org.antlr.runtime.BitSet([0xC0010500, 0x010001FF]),
    FOLLOW_INTERSECT_in_atom873: new org.antlr.runtime.BitSet([0x00000000, 0x01000002]),
    FOLLOW_set_in_atom879: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_atom888: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_atom_in_atom905: new org.antlr.runtime.BitSet([0xC0010500, 0x010001FF]),
    FOLLOW_INTERSECT_in_atom922: new org.antlr.runtime.BitSet([0x80000000, 0x00000000]),
    FOLLOW_ARRAY_FORMULAR_END_in_atom926: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_atom969: new org.antlr.runtime.BitSet([0x00000052, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_atom980: new org.antlr.runtime.BitSet([0x00000000, 0x00000039]),
    FOLLOW_INTERSECT_in_atom985: new org.antlr.runtime.BitSet([0x00000000, 0x00000038]),
    FOLLOW_set_in_atom991: new org.antlr.runtime.BitSet([0x00000012, 0x00000001]),
    FOLLOW_INTERSECT_in_atom1002: new org.antlr.runtime.BitSet([0x00000012, 0x00000000]),
    FOLLOW_COLON_in_atom1012: new org.antlr.runtime.BitSet([0x00000000, 0x000000B9]),
    FOLLOW_INTERSECT_in_atom1018: new org.antlr.runtime.BitSet([0x00000000, 0x00000090]),
    FOLLOW_set_in_atom1024: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_atom1032: new org.antlr.runtime.BitSet([0x00000000, 0x00000039]),
    FOLLOW_INTERSECT_in_atom1037: new org.antlr.runtime.BitSet([0x00000000, 0x00000038]),
    FOLLOW_set_in_atom1045: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_atom_type_in_atom_list1073: new org.antlr.runtime.BitSet([0x00000002, 0x00000003]),
    FOLLOW_INTERSECT_in_atom_list1081: new org.antlr.runtime.BitSet([0x00000000, 0x00000002]),
    FOLLOW_ARG_SEP_in_atom_list1086: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_INTERSECT_in_atom_list1088: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_atom_type_in_atom_list1095: new org.antlr.runtime.BitSet([0x00000002, 0x00000003]),
    FOLLOW_expr_in_atom_type1123: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_ARRAY_FORMULAR_START_in_atom_type1133: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_INTERSECT_in_atom_type1135: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_atom_list_in_atom_type1141: new org.antlr.runtime.BitSet([0x80000000, 0x00000001]),
    FOLLOW_INTERSECT_in_atom_type1143: new org.antlr.runtime.BitSet([0x80000000, 0x00000000]),
    FOLLOW_ARRAY_FORMULAR_END_in_atom_type1146: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_FUNC_in_folded1182: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_set_in_folded1190: new org.antlr.runtime.BitSet([0x00010000, 0x00000000]),
    FOLLOW_P_OPEN_in_folded1200: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_INTERSECT_in_folded1215: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_range_in_folded1223: new org.antlr.runtime.BitSet([0x00020000, 0x00000001]),
    FOLLOW_INTERSECT_in_folded1231: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_P_CLOSE_in_folded1242: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_FUNC_in_folded1256: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_set_in_folded1264: new org.antlr.runtime.BitSet([0x00010000, 0x00000001]),
    FOLLOW_INTERSECT_in_folded1270: new org.antlr.runtime.BitSet([0x00010000, 0x00000000]),
    FOLLOW_P_OPEN_in_folded1275: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_P_CLOSE_in_folded1280: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_atom_list_in_range1303: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_folded_in_range1314: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INTERSECT_in_synpred5_JsFormulaParser417: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_synpred28_JsFormulaParser443: new org.antlr.runtime.BitSet([0x00000002, 0x00000001]),
    FOLLOW_INTERSECT_in_synpred28_JsFormulaParser512: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_synpred29_JsFormulaParser443: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_INTERSECT_in_synpred29_JsFormulaParser512: new org.antlr.runtime.BitSet([0x40010500, 0x000001FD]),
    FOLLOW_expr_in_synpred29_JsFormulaParser525: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_synpred38_JsFormulaParser602: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_synpred38_JsFormulaParser610: new org.antlr.runtime.BitSet([0x00000000, 0x00000009]),
    FOLLOW_INTERSECT_in_synpred38_JsFormulaParser615: new org.antlr.runtime.BitSet([0x00000000, 0x00000008]),
    FOLLOW_LOCALE_NUMBER_in_synpred38_JsFormulaParser623: new org.antlr.runtime.BitSet([0x00000010, 0x00000000]),
    FOLLOW_COLON_in_synpred38_JsFormulaParser627: new org.antlr.runtime.BitSet([0x00000000, 0x00000018]),
    FOLLOW_set_in_synpred38_JsFormulaParser632: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INTERSECT_in_synpred42_JsFormulaParser705: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_COLON_in_synpred49_JsFormulaParser714: new org.antlr.runtime.BitSet([0x00000000, 0x0000003D]),
    FOLLOW_INTERSECT_in_synpred49_JsFormulaParser720: new org.antlr.runtime.BitSet([0x00000000, 0x0000000C]),
    FOLLOW_set_in_synpred49_JsFormulaParser726: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_synpred49_JsFormulaParser734: new org.antlr.runtime.BitSet([0x00000000, 0x00000031]),
    FOLLOW_INTERSECT_in_synpred49_JsFormulaParser740: new org.antlr.runtime.BitSet([0x00000000, 0x00000030]),
    FOLLOW_set_in_synpred49_JsFormulaParser748: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_set_in_synpred50_JsFormulaParser675: new org.antlr.runtime.BitSet([0x00000052, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_synpred50_JsFormulaParser685: new org.antlr.runtime.BitSet([0x00000000, 0x00000031]),
    FOLLOW_INTERSECT_in_synpred50_JsFormulaParser690: new org.antlr.runtime.BitSet([0x00000000, 0x00000030]),
    FOLLOW_set_in_synpred50_JsFormulaParser696: new org.antlr.runtime.BitSet([0x00000012, 0x00000001]),
    FOLLOW_INTERSECT_in_synpred50_JsFormulaParser705: new org.antlr.runtime.BitSet([0x00000012, 0x00000000]),
    FOLLOW_COLON_in_synpred50_JsFormulaParser714: new org.antlr.runtime.BitSet([0x00000000, 0x0000003D]),
    FOLLOW_INTERSECT_in_synpred50_JsFormulaParser720: new org.antlr.runtime.BitSet([0x00000000, 0x0000000C]),
    FOLLOW_set_in_synpred50_JsFormulaParser726: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_synpred50_JsFormulaParser734: new org.antlr.runtime.BitSet([0x00000000, 0x00000031]),
    FOLLOW_INTERSECT_in_synpred50_JsFormulaParser740: new org.antlr.runtime.BitSet([0x00000000, 0x00000030]),
    FOLLOW_set_in_synpred50_JsFormulaParser748: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_folded_in_synpred55_JsFormulaParser827: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INTERSECT_in_synpred56_JsFormulaParser844: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INTERSECT_in_synpred70_JsFormulaParser1002: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_COLON_in_synpred78_JsFormulaParser1012: new org.antlr.runtime.BitSet([0x00000000, 0x000000B9]),
    FOLLOW_INTERSECT_in_synpred78_JsFormulaParser1018: new org.antlr.runtime.BitSet([0x00000000, 0x00000090]),
    FOLLOW_set_in_synpred78_JsFormulaParser1024: new org.antlr.runtime.BitSet([0x00000040, 0x00000000]),
    FOLLOW_INTERSECT_ODS_in_synpred78_JsFormulaParser1032: new org.antlr.runtime.BitSet([0x00000000, 0x00000039]),
    FOLLOW_INTERSECT_in_synpred78_JsFormulaParser1037: new org.antlr.runtime.BitSet([0x00000000, 0x00000038]),
    FOLLOW_set_in_synpred78_JsFormulaParser1045: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INTERSECT_in_synpred80_JsFormulaParser1088: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_expr_in_synpred82_JsFormulaParser1123: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INTERSECT_in_synpred83_JsFormulaParser1135: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_ARRAY_FORMULAR_START_in_synpred85_JsFormulaParser1133: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_INTERSECT_in_synpred85_JsFormulaParser1135: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_atom_list_in_synpred85_JsFormulaParser1141: new org.antlr.runtime.BitSet([0x80000000, 0x00000001]),
    FOLLOW_INTERSECT_in_synpred85_JsFormulaParser1143: new org.antlr.runtime.BitSet([0x80000000, 0x00000000]),
    FOLLOW_ARRAY_FORMULAR_END_in_synpred85_JsFormulaParser1146: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_INTERSECT_in_synpred88_JsFormulaParser1215: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_FUNC_in_synpred90_JsFormulaParser1182: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_set_in_synpred90_JsFormulaParser1190: new org.antlr.runtime.BitSet([0x00010000, 0x00000000]),
    FOLLOW_P_OPEN_in_synpred90_JsFormulaParser1200: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_INTERSECT_in_synpred90_JsFormulaParser1215: new org.antlr.runtime.BitSet([0x40010500, 0x000001FF]),
    FOLLOW_range_in_synpred90_JsFormulaParser1223: new org.antlr.runtime.BitSet([0x00020000, 0x00000001]),
    FOLLOW_INTERSECT_in_synpred90_JsFormulaParser1231: new org.antlr.runtime.BitSet([0x00020000, 0x00000000]),
    FOLLOW_P_CLOSE_in_synpred90_JsFormulaParser1242: new org.antlr.runtime.BitSet([0x00000002, 0x00000000]),
    FOLLOW_atom_list_in_synpred94_JsFormulaParser1303: new org.antlr.runtime.BitSet([0x00000002, 0x00000000])
});

})();