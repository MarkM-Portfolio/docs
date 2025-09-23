dojo.provide("websheet.tests.ut.formula.ut_formulaLexer");
/**
 * UT suite, function for areaManager to store,remove area, every event notification
 */

describe("websheet.test.ut.formula.ut_formulaLexer", function() {
	
	dojo.setObject("pe.scene.getLocale", function(){
		return "en-us";
	});
	websheet.functions.Formulas.init();
	
	var lexer = new websheet.parse.FormulaLexer();
	beforeEach(function() {
		lexer.reset("");
		
	});
	
	it("parse number", function(){
		var tokens = lexer.parseToken("=1");
		expect(tokens.length).toBe(1);
		var token = tokens[0];
		expect(token.type).toBe(lexer.TOKEN_TYPE.NUMBER_TYPE);
		expect(token.text).toBe("1");
		expect(token.value).toBe(1);
		expect(token.start).toBe(1);
		expect(token.end).toBe(2);
		
	});
	
	it("parse string", function(){
		var tokens = lexer.parseToken("=\"ab@*c\"");
		expect(tokens.length).toBe(1);
		var token = tokens[0];
		expect(token.type).toBe(lexer.TOKEN_TYPE.STRING_TYPE);
		expect(token.text).toBe("\"ab@*c\"");
		expect(token.value).toBe("ab@*c");
		expect(token.start).toBe(1);
		expect(token.end).toBe(8);
	});
	
	it("parse function", function(){
		var formula = "=SUM(12.23,  \"ab\"\"\" ,abs(-2))";
		var tokens = lexer.parseToken(formula);
		var expectTokens = [ ["SUM", null, lexer.TOKEN_TYPE.FUNCTION_TYPE],
		                     ["(", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_OPEN],
		                     ["12.23", 12.23, lexer.TOKEN_TYPE.NUMBER_TYPE],
		                     [",", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_ARGUMENTS],
		                     ["  ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                     ["\"ab\"\"\"", "ab\"",lexer.TOKEN_TYPE.STRING_TYPE],
		                     [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                     [",", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_ARGUMENTS],
		                     ["abs", null, lexer.TOKEN_TYPE.FUNCTION_TYPE],
		                     ["(", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_OPEN],
		                     ["-", null, lexer.TOKEN_TYPE.OPERATOR_TYPE, lexer.TOKEN_SUBTYPE.OPERATOR_PREFIX],
		                     ["2", 2, lexer.TOKEN_TYPE.NUMBER_TYPE],
		                     [")", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_CLOSE],
		                     [")", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_CLOSE]];
		checkTokens(formula, tokens, expectTokens);
		
	});
	
	it("parse referece", function(){
		var formula = "=Sheet1!A1+sum('1a'!B3:C4,B:B)/1:1";
		var tokens = lexer.parseToken(formula);
		var expectTokens = [ ["Sheet1!A1", new websheet.parse.ParsedRef("Sheet1",1,1,1,1,websheet.Constant.CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                     ["+", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["sum", null, lexer.TOKEN_TYPE.FUNCTION_TYPE],
		                     ["(", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_OPEN],
		                     ["'1a'!B3:C4", new websheet.parse.ParsedRef("1a",3,2,4,3,websheet.Constant.RANGE_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                     [",", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_ARGUMENTS],
		                     ["B:B", new websheet.parse.ParsedRef(null,1,2,1048576,2,websheet.Constant.DEFAULT_COLS_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                     [")", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_CLOSE],
		                     ["/", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["1:1", new websheet.parse.ParsedRef(null,1,1,1,1024,websheet.Constant.DEFAULT_ROWS_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		
		checkTokens(formula, tokens, expectTokens);
		
	});
	
	it("parse array", function(){
		var formula = "={1,2,\"a\";True,#DIV/0!,-3;2,\"\"\"\", 4}";
		var tokens = lexer.parseToken(formula);
		var expectTokens = [["{1,2,\"a\";True,#DIV/0!,-3;2,\"\"\"\", 4}",
		                      [[1,2,"a"],[true,websheet.Constant.ERRORCODE["532"],-3],[2,"\"",4]], lexer.TOKEN_TYPE.ARRAY_TYPE]
		                      ];
		
		checkTokens(formula, tokens, expectTokens);
		
		formula = "={--2}";
		tokens = lexer.parseToken(formula, true);
		expect(lexer.getError() != null).toBe(true);
		
	});
	
	it("parse virtual reference", function(){
		var formula = "=sum(Sheet1!A1:B2:C3)";
		var tokens = lexer.parseToken(formula);
		var expectTokens =  [["sum", null, lexer.TOKEN_TYPE.FUNCTION_TYPE],
		                     ["(", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_OPEN],
		                     ["Sheet1!A1:B2", new websheet.parse.ParsedRef("Sheet1",1,1,2,2,websheet.Constant.RANGE_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                     [":", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["C3", new websheet.parse.ParsedRef(null,3,3,3,3,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                     [")", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_CLOSE]];
		checkTokens(formula, tokens, expectTokens);
		                     
		formula = "=A:A:D3";
		tokens = lexer.parseToken(formula);
		expectTokens =  [["A:A", new websheet.parse.ParsedRef(null,1,1,1048576,1,websheet.Constant.DEFAULT_COLS_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                     [":", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["D3", new websheet.parse.ParsedRef(null,3,4,3,4,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "A1:1:1";
		tokens = lexer.parseToken(formula);
		expectTokens =  [["A1", new websheet.parse.ParsedRef(null,1,1,1,1,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                     [":", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["1:1", new websheet.parse.ParsedRef(null,1,1,1,1024,websheet.Constant.DEFAULT_ROWS_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "Sheet1!1:2:test";
		tokens = lexer.parseToken(formula);
		expectTokens =  [["Sheet1!1:2", new websheet.parse.ParsedRef("Sheet1",1,1,2,1024,websheet.Constant.ROWS_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                     [":", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["test", null, lexer.TOKEN_TYPE.NAME_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "abc:def:B:B";
		tokens = lexer.parseToken(formula);
		expectTokens =  [["abc", null, lexer.TOKEN_TYPE.NAME_TYPE],
		                     [":", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["def", null, lexer.TOKEN_TYPE.NAME_TYPE],
		                     [":", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["B:B", new websheet.parse.ParsedRef(null,1,2,1048576,2,websheet.Constant.DEFAULT_COLS_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "A1:C:D:B3";
		tokens = lexer.parseToken(formula);
		expectTokens =  [["A1", new websheet.parse.ParsedRef(null,1,1,1,1,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                     [":", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["C:D", new websheet.parse.ParsedRef(null,1,3,1048576,4,websheet.Constant.DEFAULT_COLS_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                     [":", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["B3", new websheet.parse.ParsedRef(null,3,2,3,2,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
	});
	
	it("parse editing number", function() {
		var tokens = lexer.parseToken("=1", true);//isEditing = true
		tokens = lexer.resumeParseToken("=1.2E", true);
		expect(tokens.length).toBe(1);
		var token = tokens[0];
		expect(token.type).toBe(lexer.TOKEN_TYPE.NUMBER_TYPE);
		expect(token.text).toBe("1.2E");
		expect(token.value).toBe(1.2);// error for now
		expect(token.start).toBe(1);
		expect(token.end).toBe(5);
		var tokenBack = token;
		
		tokens = lexer.resumeParseToken("=1.2E+", true); 
		// just update token
		expect(token == tokenBack).toBe(true);
		
		var formula = "=1.2E+10+S";
		tokens = lexer.resumeParseToken(formula, true); 
		var expectTokens = [ ["1.2E+10", 12000000000, lexer.TOKEN_TYPE.NUMBER_TYPE],
		                     ["+", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["S", null, lexer.TOKEN_TYPE.NAME_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=1.2E+10+SU";
		tokens = lexer.resumeParseToken(formula, true); 
		expectTokens = [ ["1.2E+10", 12000000000, lexer.TOKEN_TYPE.NUMBER_TYPE],
		                     ["+", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["SU", null, lexer.TOKEN_TYPE.NAME_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=1.2E+10+SUM";
		tokens = lexer.resumeParseToken(formula, true); 
		expectTokens = [ ["1.2E+10", 12000000000, lexer.TOKEN_TYPE.NUMBER_TYPE],
		                     ["+", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["SUM", null, lexer.TOKEN_TYPE.NAME_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=1.2E+10+SUM(";
		tokens = lexer.resumeParseToken(formula, true); 
		expectTokens = [ ["1.2E+10", 12000000000, lexer.TOKEN_TYPE.NUMBER_TYPE],
		                     ["+", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["SUM", null, lexer.TOKEN_TYPE.FUNCTION_TYPE],
		                     ["(", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_OPEN]];
		checkTokens(formula, tokens, expectTokens);
	});
	
	it("parse editing string", function() {
		var formula = "=sum(\"";
		var tokens = lexer.parseToken(formula, true);//isEditing = true
		
		var expectTokens = [ ["sum", null, lexer.TOKEN_TYPE.FUNCTION_TYPE],
		                     ["(", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_OPEN]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=sum(\"abc\"";
		tokens = lexer.resumeParseToken(formula, true);
		expectTokens = [ ["sum", null, lexer.TOKEN_TYPE.FUNCTION_TYPE],
	                     ["(", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_OPEN],
	                     ["\"abc\"", "abc", lexer.TOKEN_TYPE.STRING_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=sum(\"abc\"\"";
		tokens = lexer.resumeParseToken(formula, true);
		expectTokens = [ ["sum", null, lexer.TOKEN_TYPE.FUNCTION_TYPE],
	                     ["(", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_OPEN],
	                     //suppose to be wrong, because these adjancent string token should merge together, but it is ok in editing mode
	                     ["\"abc\"", "abc", lexer.TOKEN_TYPE.STRING_TYPE]];  
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=sum(\"abc\"\"+\", a";
		tokens = lexer.resumeParseToken(formula, true);
		expectTokens = [ ["sum", null, lexer.TOKEN_TYPE.FUNCTION_TYPE],
	                     ["(", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_OPEN],
	                     ["\"abc\"", "abc", lexer.TOKEN_TYPE.STRING_TYPE],
	                     ["\"+\"", "+", lexer.TOKEN_TYPE.STRING_TYPE],
	                     [",", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_ARGUMENTS],
	                     ["a", null, lexer.TOKEN_TYPE.NAME_TYPE]];
		
		formula = "=sum(\"abc\"\"+\", a)";
		tokens = lexer.resumeParseToken(formula, true);
		expectTokens = [ ["sum", null, lexer.TOKEN_TYPE.FUNCTION_TYPE],
	                     ["(", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_OPEN],
	                     ["\"abc\"", "abc", lexer.TOKEN_TYPE.STRING_TYPE],
	                     ["\"+\"", "+", lexer.TOKEN_TYPE.STRING_TYPE],
	                     [",", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_ARGUMENTS],
	                     [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
	                     ["a", null, lexer.TOKEN_TYPE.NAME_TYPE],
	                     [")", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_CLOSE]];
		checkTokens(formula, tokens, expectTokens);
	});
	
	it("parse editing number failed", function() {
		var formula = "=2";
		var tokens = lexer.parseToken(formula, true);//isEditing = true
		
		var expectTokens = [ ["2", 2, lexer.TOKEN_TYPE.NUMBER_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=2a";
		tokens = lexer.resumeParseToken(formula, true);
		//TODO: need formula parser to do syntax check to find error
		expectTokens = [["2", 2, lexer.TOKEN_TYPE.NUMBER_TYPE],
		                ["a", null, lexer.TOKEN_TYPE.NAME_TYPE]];
		checkTokens(formula, tokens, expectTokens);
	});
	
	it("parse editing reference", function() {
		var formula = "='Sh";
		var tokens = lexer.parseToken(formula, true);//isEditing = true
		
		var expectTokens = [ ["'Sh", null, lexer.TOKEN_TYPE.NAME_TYPE, lexer.TOKEN_SUBTYPE.SHEET_SPECIAL]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "='Sh eet'";
		tokens = lexer.resumeParseToken(formula, true);
		expectTokens = [ ["'Sh eet'", null, lexer.TOKEN_TYPE.NAME_TYPE, lexer.TOKEN_SUBTYPE.SHEET_SPECIAL]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "='Sh eet'!";
		tokens = lexer.resumeParseToken(formula, true);
		expectTokens = [ ["'Sh eet'!", null, lexer.TOKEN_TYPE.NAME_TYPE, lexer.TOKEN_SUBTYPE.SHEET_SPECIAL]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "='Sh eet'!A";
		tokens = lexer.resumeParseToken(formula, true);
		expectTokens = [ ["'Sh eet'!A", null, lexer.TOKEN_TYPE.NAME_TYPE, lexer.TOKEN_SUBTYPE.SHEET_SPECIAL]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "='Sh eet'!A1";
		tokens = lexer.resumeParseToken(formula, true);
		expectTokens = [ ["'Sh eet'!A1", new websheet.parse.ParsedRef("Sh eet",1,1,1,1,websheet.Constant.CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "='Sh eet'!A1:";
		tokens = lexer.resumeParseToken(formula, true);
		expectTokens = [ ["'Sh eet'!A1", new websheet.parse.ParsedRef("Sh eet",1,1,1,1,websheet.Constant.CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                 [":", null, lexer.TOKEN_TYPE.OPERATOR_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "='Sh eet'!A1:$B3";
		tokens = lexer.resumeParseToken(formula, true);
		expectTokens = [ ["'Sh eet'!A1:$B3", new websheet.parse.ParsedRef("Sh eet",1,1,3,2,websheet.Constant.RANGE_MASK|websheet.Constant.RefAddressType.ABS_END_COLUMN), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
	});
	
	it("parse editing operator contains more than one char", function(){
		// whitespace
		var formula = "= ";
		var tokens = lexer.parseToken(formula, true);//isEditing = true
		var expectTokens = [[" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=  ";
		tokens = lexer.resumeParseToken(formula, true);//isEditing = true
		expectTokens = [["  ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE]];
		checkTokens(formula, tokens, expectTokens);
		
		// '>' '<'
		formula = "=   1 >";
		tokens = lexer.resumeParseToken(formula, true);//isEditing = true
		expectTokens = [ ["   ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                 ["1", 1, lexer.TOKEN_TYPE.NUMBER_TYPE],
		                 [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                     [">", null, lexer.TOKEN_TYPE.OPERATOR_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=   1 >=";
		tokens = lexer.resumeParseToken(formula, true);//isEditing = true
		expectTokens = [ ["   ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                 ["1", 1, lexer.TOKEN_TYPE.NUMBER_TYPE],
		                 [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                 [">=", null, lexer.TOKEN_TYPE.OPERATOR_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=   1 >= ";
		tokens = lexer.resumeParseToken(formula, true);//isEditing = true
		expectTokens = [ ["   ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                 ["1", 1, lexer.TOKEN_TYPE.NUMBER_TYPE],
		                 [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                 [">=", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                 [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=   1 >= 2";
		tokens = lexer.resumeParseToken(formula, true);//isEditing = true
		expectTokens = [ ["   ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                 ["1", 1, lexer.TOKEN_TYPE.NUMBER_TYPE],
		                 [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                 [">=", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                 [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                 ["2", 2, lexer.TOKEN_TYPE.NUMBER_TYPE]];
		checkTokens(formula, tokens, expectTokens);
	});
	
	it("parse long formula", function(){
		var formula = "=IF(IF(Service!$K$261=1,'01'!A7,IF(Service!$K$261=2,'02'!A7,IF(Service!$K$261=3,'03'!A7,IF(Service!$K$261=4,'04'!A7,IF(Service!$K$261=5,'05'!A7,IF(Service!$K$261=6,'06'!A7,IF(Service!$K$261=7,'07'!A7,0)))))))=0,+IF(Service!$K$261=8,'08'!A7,+IF(Service!$K$261=9,'09'!A7,IF(Service!$K$261=10,'10'!A7,IF(Service!$K$261=11,'11'!A7,IF(Service!$K$261=12,'12'!A7,IF(Service!$K$261=13,VJ!A7,0)))))),+IF(Service!$K$261=1,'01'!A7,IF(Service!$K$261=2,'02'!A7,IF(Service!$K$261=3,'03'!A7,IF(Service!$K$261=4,'04'!A7,IF(Service!$K$261=5,'05'!A7,IF(Service!$K$261=6,'06'!A7,IF(Service!$K$261=7,'07'!A7,0))))))))";
		var start = new Date();
		for(var i = 0; i < 1000; i++){
			var tokens = lexer.parseToken(formula, true);//isEditing = true
		}
		var end = new Date();
		console.log("repeate parse long formula cost:" + (end - start));
		
		start = new Date();
		for(var i = 0; i < 1000; i++){
			var tokens = lexer.parseToken("=A1*B2+C3/Sheet2!D5^2  - (C3 A3)", true);//isEditing = true
		}
		var end = new Date();
		console.log("repeate parse common formula cost:" + (end - start));
		
		start = new Date();
		formula = "=IF(IF(Service!$K$261=1,'01'!A7,IF(Service!$K$261=2,'02'!A7,IF(Service!$K$261=3,'03'!A7,IF(Service!$K$261=4,'04'!A7,IF(Service!$K$261=5,'05'!A7,IF(Service!$K$261=6,'06'!A7,IF(Service!$K$261=7,'07'!A7,0)))))))=0,+IF(Service!$K$261=8,'08'!A7,+IF(Service!$K$261=9,'09'!A7,IF(Service!$K$261=10,'10'!A7,IF(Service!$K$261=11,'11'!A7,IF(Service!$K$261=12,'12'!A7,IF(Service!$K$261=13,VJ!A7,0)))))),+IF(Service!$K$261=1,'01'!A7,IF(Service!$K$261=2,'02'!A7,IF(Service!$K$261=3,'03'!A7,IF(Service!$K$261=4,'04'!A7,IF(Service!$K$261=5,'05'!A7,IF(Service!$K$261=6,'06'!A7,IF(Service!$K$261=7,'07'!A7,0))))))))";
		tokens = lexer.parseToken(formula);
		var formula2 = //"=A2*B3+C4/Sheet2!D5^2  - (C4 A4)";
			"=IF(IF(Service!$K$261=1,'01'!A7,IF(Service!$K$261=2,'02'!A7,IF(Service!$K$261=3,'03'!A7,IF(Service!$K$261=4,'04'!A7,IF(Service!$K$261=5,'05'!A7,IF(Service!$K$261=6,'06'!A7,IF(Service!$K$261=7,'07'!A7,0)))))))=0,+IF(Service!$K$261=8,'08'!A7,+IF(Service!$K$261=9,'09'!A7,IF(Service!$K$261=10,'10'!A7,IF(Service!$K$261=11,'11'!A7,IF(Service!$K$261=12,'12'!A7,IF(Service!$K$261=13,VJ!A7,0)))))),+IF(Service!$K$261=1,'01'!A7,IF(Service!$K$261=2,'02'!A7,IF(Service!$K$261=3,'03'!A7,IF(Service!$K$261=4,'04'!A7,IF(Service!$K$261=5,'05'!A7,IF(Service!$K$261=6,'06'!A7,IF(Service!$K$261=7,'07'!A7,0))))))))";
		for(var n = 0; n < 1000; n++){
			var preRefToken = null;
			var refTokenIndex = 1;
			var bAutofill = true;
			var refTokens = [];
			
			for(var i = 0; i < tokens.length; i++){
				var token = tokens[i];
				if(token.type != lexer.TOKEN_TYPE.REFERENCE_TYPE){
					
					var index = formula2.indexOf(token.text, token.start);
					if(index != token.start){
						bAutofill = false;
						break;
					}
					if(token.type == lexer.TOKEN_TYPE.NAME_TYPE){
						refTokens.push(token.text);
					}
					if(preRefToken){
						var refText = formula2.substring(refTokenIndex, index);
						var ref = websheet.Helper.parseRef(refText);
						refTokens.push(ref);
						
					}
					refTokenIndex = index + token.end - token.start;
					preRefToken = null;
				} else {
					preRefToken = token;
				}
			}
			if(bAutofill){
				//last reference
				if(preRefToken){
					var refText = formula2.substring(refTokenIndex);
					var ref = websheet.Helper.parseRef(refText);
					refTokens.push(ref);
				}
			}
		}
		var end = new Date();
		console.log("predict formula cost:" + (end - start));
	});
	
	it("resume reference token", function(){
//		var formula = "=A1:B2";
//		var tokens = lexer.parseToken(formula, true);//isEditing = true
//		var expectTokens = [ ["A1:B2", new websheet.parse.ParsedRef(null,1,1,2,2,websheet.Constant.DEFAULT_RANGE_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
//		checkTokens(formula, tokens, expectTokens);
//		
		// can not pass because defect 46491 which is allow "." in name
//		formula = "=A1:B2.4";
//		tokens = lexer.resumeParseToken(formula, true);
//		expectTokens = [ ["A1:B2", new websheet.parse.ParsedRef(null,1,1,2,2,websheet.Constant.DEFAULT_RANGE_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
//		                 [".4", 0.4, lexer.TOKEN_TYPE.NUMBER_TYPE]];
//		checkTokens(formula, tokens, expectTokens);
		
		formula = "=A1:B2";
		tokens = lexer.parseToken(formula, true, 5);// cursor is locate after "B"
		expectTokens = [ ["A1", new websheet.parse.ParsedRef(null,1,1,1,1,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                 [":", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                 ["B", null, lexer.TOKEN_TYPE.NAME_TYPE]];
		
		checkTokens(formula, tokens, expectTokens);
		
		tokens = lexer.resumeParseToken(formula, true);
		expectTokens = [ ["A1:B2", new websheet.parse.ParsedRef(null,1,1,2,2,websheet.Constant.DEFAULT_RANGE_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=A8:C39";
		tokens = lexer.parseToken(formula, true, 6); // cursor is locate after "3"
		expectTokens = [ ["A8:C3", new websheet.parse.ParsedRef(null,3,1,8,3,websheet.Constant.DEFAULT_RANGE_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		tokens = lexer.resumeParseToken(formula, true);
		expectTokens = [ ["A8:C39", new websheet.parse.ParsedRef(null,8,1,39,3,websheet.Constant.DEFAULT_RANGE_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
	});
	
	it("test whitespace", function(){
		var formula, tokens, expectTokens;
		var formula = "=A1 +B1";
		var tokens = lexer.parseToken(formula, true);//isEditing = true
		var expectTokens = [ ["A1", new websheet.parse.ParsedRef(null,1,1,1,1,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                     [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                     ["+", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                     ["B1", new websheet.parse.ParsedRef(null,1,2,1,2,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=A1   B1";
		tokens = lexer.parseToken(formula, true);//isEditing = true
		expectTokens = [ ["A1", new websheet.parse.ParsedRef(null,1,1,1,1,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                     ["   ", null, lexer.TOKEN_TYPE.OPERATOR_TYPE, lexer.TOKEN_SUBTYPE.OPERATOR_INTERSECTION],
		                     ["B1", new websheet.parse.ParsedRef(null,1,2,1,2,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=(A1,B1)";
		tokens = lexer.parseToken(formula, true);//isEditing = true
		expectTokens = [ ["(", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_OPEN],
		                 ["A1", new websheet.parse.ParsedRef(null,1,1,1,1,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                 [",", null, lexer.TOKEN_TYPE.OPERATOR_TYPE, lexer.TOKEN_SUBTYPE.OPERATOR_UNION],
		                 ["B1", new websheet.parse.ParsedRef(null,1,2,1,2,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                 [")", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_CLOSE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "= A1 , B1 ";
		tokens = lexer.parseToken(formula, true);//isEditing = true
		expectTokens = [ [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                 ["A1", new websheet.parse.ParsedRef(null,1,1,1,1,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                 [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                 [",", null, lexer.TOKEN_TYPE.OPERATOR_TYPE, lexer.TOKEN_SUBTYPE.OPERATOR_UNION],
		                 [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                 ["B1", new websheet.parse.ParsedRef(null,1,2,1,2,websheet.Constant.DEFAULT_CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                 [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=sum(   A1 : B2 )";
		tokens = lexer.parseToken(formula, true);//isEditing = true
		expectTokens = [ ["sum", null, lexer.TOKEN_TYPE.FUNCTION_TYPE],
		                     ["(", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_OPEN],
		                     ["   ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                     ["A1:B2", new websheet.parse.ParsedRef(null,1,1,2,2,websheet.Constant.RANGE_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                     [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                     [")", null, lexer.TOKEN_TYPE.SEPERATOR_TYPE, lexer.TOKEN_SUBTYPE.SEPERATOR_CLOSE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "= - A1";
		tokens = lexer.parseToken(formula, true);//isEditing = true
		expectTokens = [  [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                  ["-", null, lexer.TOKEN_TYPE.OPERATOR_TYPE, lexer.TOKEN_SUBTYPE.OPERATOR_PREFIX],
		                  [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                  ["A1", new websheet.parse.ParsedRef(null,1,1,1,1,websheet.Constant.CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "= Sheet1!1:1";
		tokens = lexer.parseToken(formula, true);//isEditing = true
		expectTokens = [  [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                  ["Sheet1!1:1", new websheet.parse.ParsedRef("Sheet1",1,1,1,1024,websheet.Constant.ROWS_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "= 1 :1";
		tokens = lexer.parseToken(formula, true);//isEditing = true
		expectTokens = [  [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                  ["1", 1, lexer.TOKEN_TYPE.NUMBER_TYPE],
		                  [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                  [":", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                  ["1", 1, lexer.TOKEN_TYPE.NUMBER_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=A1: test";
		tokens = lexer.parseToken(formula, true);//isEditing = true
		expectTokens = [  ["A1", new websheet.parse.ParsedRef(null,1,1,1,1,websheet.Constant.CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                  [":", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                  [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                  ["test", null, lexer.TOKEN_TYPE.NAME_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "=A1:B2: C3";
		tokens = lexer.parseToken(formula, true);//isEditing = true
		expectTokens = [  ["A1:B2", new websheet.parse.ParsedRef(null,1,1,2,2,websheet.Constant.RANGE_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE],
		                  [":", null, lexer.TOKEN_TYPE.OPERATOR_TYPE],
		                  [" ", null, lexer.TOKEN_TYPE.WHITESPACE_IGNORE],
		                  ["C3", new websheet.parse.ParsedRef(null,3,3,3,3,websheet.Constant.CELL_MASK), lexer.TOKEN_TYPE.REFERENCE_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		formula = "={1,+2,  3}";
		tokens = lexer.parseToken(formula, true);//isEditing = true
		expectTokens = [["{1,+2,  3}",
	                      [[1,2,3]], lexer.TOKEN_TYPE.ARRAY_TYPE]];
		checkTokens(formula, tokens, expectTokens);
		
		
	});
	var checkTokens = function(formula, tokens, expectTokens){
		expect(tokens.length).toBe(expectTokens.length);
		for( var i = 0; i < tokens.length; i++) {
			var token = tokens[i];
			var eToken = expectTokens[i];
			expect(token.text).toBe(eToken[0]);
			if(token.type != lexer.TOKEN_TYPE.REFERENCE_TYPE){// REFERENCE might contains whitespace
				var text = formula.substring(token.start, token.end);
				expect(text).toBe(token.text);
			}
			
			expect(token.type).toBe(eToken[2]);
			expect(token.subType == eToken[3]).toBe(true);
			var value = eToken[1];
			
			switch(token.type){
				case lexer.TOKEN_TYPE.OPERATOR_TYPE:
					if(/^( )*$/.test(token.text) ){
						expect(token.id).toBe("!");
						expect(token.subType).toBe(lexer.TOKEN_SUBTYPE.OPERATOR_INTERSECTION);
					}
					else if(token.subType == lexer.TOKEN_SUBTYPE.OPERATOR_UNION)
						expect(token.id).toBe("~");
						
					break;
				case lexer.TOKEN_TYPE.WHITESPACE_IGNORE:
					expect(token.id == null).toBe(true);
					break;
				case lexer.TOKEN_TYPE.NUMBER_TYPE:
				case lexer.TOKEN_TYPE.STRING_TYPE:
					expect(token.value).toBe(value);
					break;
				case lexer.TOKEN_TYPE.REFERENCE_TYPE:
					expect(websheet.Helper.compareRange(token.value, value)).toBe(websheet.Constant.RangeRelation.EQUAL);
					break;
				case lexer.TOKEN_TYPE.ARRAY_TYPE:
					var length = token.value.length;
					expect(value.length).toBe(length);
					for(var m = 0; m < length; m++){
						var item = token.value[m];
						if(dojo.isArray(item)){
							var l2 = item.length;
							expect(value[m].length).toBe(l2);
							for(var n = 0; n < l2; n++){
								var item2 = item[n];
								expect(item2 == value[m][n]).toBe(true);
							}
						} else {
							expect(item == value[m]).toBe(true);
						}
					}
					break;
			}
			
			if(token.id == "!"){
				expect(token.subType).toBe(lexer.TOKEN_SUBTYPE.OPERATOR_INTERSECTION);
				expect(token.type).toBe(lexer.TOKEN_TYPE.OPERATOR_TYPE);
			} else if(token.id == "~"){
				expect(token.subType).toBe(lexer.TOKEN_SUBTYPE.OPERATOR_UNION);
				expect(token.type).toBe(lexer.TOKEN_TYPE.OPERATOR_TYPE);
			}
		}
		
	}
});