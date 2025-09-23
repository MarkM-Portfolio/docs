dojo.provide("websheet.tests.ut.formula.ut_formulaParser");
/**
 * UT suite, function for areaManager to store,remove area, every event notification
 */

describe("websheet.test.ut.formula.ut_formulaParser", function() {
	
	var locale = "en-us";
	dojo.setObject("pe.scene.getLocale", function(){
		return locale;
	});
	
	dojo.setObject("websheet.Main.scene", pe.scene);
	
	dojo.setObject("pe.scene.setLocale", function(value){
		if(locale != value){
			locale = value;
		}
	});
	
	var _document = new websheet.model.Document();
	websheet.Constant.init();
	
	websheet.functions.Formulas.init();
	
	var parser = new websheet.parse.FormulaParser();
	beforeEach(function() {
		utils.bindDocument(_document);
		parser.bMSFormat = true;
	});
	
	afterEach(function() {
		utils.unbindDocument();
	});
	
	var serializeTokenTree = function(tokenTree, cell){
		var formula = tokenTree.serialize(cell, true).rawValue;
		return "=" + formula;
	};
	
	var preOrder = function(tokenTree, array){
		var text = tokenTree.getName();
		array.push(text);
		if(tokenTree instanceof  websheet.parse.tokenList){
			var tokenList = tokenTree.getTokenList();
			if(tokenList){
				for(var i = 0; i < tokenList.length; i++){
					preOrder(tokenList[i], array);
				}
			}
		}
	};
	
	var checkPriority = function(tokenTree, expectArray){
		var array = [];
		preOrder(tokenTree, array);
		expect(array.length == expectArray.length);
		for(var i = 0; i < array.length; i++){
			var text = array[i];
			expect(text).toBe(expectArray[i]);
		}
	};
	
	it("test formula syntax", function(){
		var formula, result, tokenTree, genFormula,
		cell = _document.getOrCreateValueCell("Sheet1",1,1,formula, true );
		formula = "=sum(1.2 ,abc, true,#NAME?,  \"ddd\", Sheet1!a2:B1, {1 ,\"a\"\"b\" ; true,#DIV/0!}, A1, )";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(tokenTree.getTokenType()).toBe(websheet.parse.tokenType.FUNCTION_TOKEN);
		expect(parser.error == null).toBe(true);
		expect(genFormula == "=SUM(1.2 ,abc, TRUE,#NAME?,  \"ddd\", Sheet1!A1:B2, {1,\"a\"\"b\";TRUE,#DIV/0!}, A1, )").toBe(true);
		//ms format
		expect(serializeTokenTree(tokenTree, cell)).toBe(genFormula);
		pe.scene.setLocale("de-de");
		// ms de format
		expect(serializeTokenTree(tokenTree, cell)).toBe("=SUMME(1,2 ;abc; TRUE;#NAME?;  \"ddd\"; Sheet1!A1:B2; {1.\"a\"\"b\";TRUE.#DIV/0!}; A1; )");
		
		pe.scene.setLocale("en-us");
		
		var arr = cell.serializeTokenArray(true);
		expect(arr.length).toBe(3);
		expect(genFormula.substring(arr[0][0], arr[0][1])).toBe("abc");
		expect(genFormula.substring(arr[1][0], arr[1][1])).toBe("Sheet1!A1:B2");
		expect(genFormula.substring(arr[2][0], arr[2][1])).toBe("A1");
		//no param
		formula = "=now() + today(   )";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(tokenTree.getTokenType()).toBe(websheet.parse.tokenType.OPERATOR_TOKEN);
		expect(parser.error == null).toBe(true);
		expect(genFormula == "=NOW() + TODAY(   )").toBe(true);
		
		formula = "=SUM( 1  + 2, \"d\", (   2 -  3      ) , if(A1,)    )";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(tokenTree.getTokenType()).toBe(websheet.parse.tokenType.FUNCTION_TOKEN);
		expect(parser.error == null).toBe(true);
		expect(genFormula == "=SUM( 1  + 2, \"d\", (   2 -  3      ) , IF(A1,)    )").toBe(true);
		expect(serializeTokenTree(tokenTree, cell)).toBe(genFormula);
	});
	
	it("test operator syntax", function(){
		var formula, result, tokenTree, genFormula,
		cell = _document.getOrCreateValueCell("Sheet1",1,1,formula, true );
		// union
		formula = "= (A1 , 'Sheet 3'!B2:C3 )";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		expect(tokenTree.getTokenType()).toBe(websheet.parse.tokenType.BRACKET_TOKEN);
		expect(tokenTree.getTokenList().length).toBe(1);
		var operator = tokenTree.getTokenList()[0];
		expect(operator.getName()).toBe("~");
		expect(genFormula).toBe("= (A1 , 'Sheet 3'!B2:C3 )");
		expect(serializeTokenTree(tokenTree, cell)).toBe(genFormula);
		
		var arr = cell.serializeTokenArray(true);
		expect(arr.length).toBe(2);
		expect(genFormula.substring(arr[0][0], arr[0][1])).toBe("A1");
		expect(genFormula.substring(arr[1][0], arr[1][1])).toBe("'Sheet 3'!B2:C3");
		
		// intersection
		formula = "=A1    B1";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		expect(tokenTree.getTokenType()).toBe(websheet.parse.tokenType.OPERATOR_TOKEN);
		expect(tokenTree.getName()).toBe("!");
		expect(serializeTokenTree(tokenTree, cell)).toBe("=A1    B1");
		
		// +,-
		formula = "=-A1";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		expect(tokenTree.getTokenType()).toBe(websheet.parse.tokenType.NEGATIVE_TOKEN);
		expect(tokenTree.getName()).toBe("-");
		expect(tokenTree.getTokenList().length).toBe(1);
		var refToken = tokenTree.getTokenList()[0];
		expect(refToken.getTokenType()).toBe(websheet.parse.tokenType.RANGEREF_TOKEN);
		expect(refToken.getValue().getStartRow()).toBe(1);
		expect(refToken.getValue().getEndRow()).toBe(1);
		expect(refToken.getValue().getStartCol()).toBe(1);
		expect(refToken.getValue().getEndCol()).toBe(1);
		expect(refToken.getValue().getParsedRef().refMask).toBe(websheet.Constant.DEFAULT_CELL_MASK);
		expect(serializeTokenTree(tokenTree, cell)).toBe(genFormula);
		
		formula = "= +  -+2";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		expect(tokenTree.getTokenType()).toBe(websheet.parse.tokenType.POSITIVE_TOKEN);
		expect(tokenTree.getName()).toBe("+");
		expect(tokenTree.getTokenList().length).toBe(1);
		var opToken = tokenTree.getTokenList()[0];
		expect(opToken.getName()).toBe("-");
		expect(opToken.getTokenList().length).toBe(1);
		opToken = opToken.getTokenList()[0];
		expect(opToken.getName()).toBe("+");
		expect(opToken.getTokenList().length).toBe(1);
		var token = opToken.getTokenList()[0];
		expect(token.getTokenType()).toBe(websheet.parse.tokenType.NUMBER_TOKEN);
		expect(serializeTokenTree(tokenTree, cell)).toBe(genFormula);
		
		// %
		formula = "=sum(1 %)%";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		expect(tokenTree.getTokenType()).toBe(websheet.parse.tokenType.PERCENT_TOKEN);
		expect(tokenTree.getName()).toBe("%");
		expect(tokenTree.getTokenList().length).toBe(1);
		var funcToken = tokenTree.getTokenList()[0];
		expect(funcToken.getTokenType()).toBe(websheet.parse.tokenType.FUNCTION_TOKEN);
		token = funcToken.getTokenList()[0];
		expect(token.getTokenType()).toBe(websheet.parse.tokenType.PERCENT_TOKEN);
		expect(serializeTokenTree(tokenTree, cell)).toBe(genFormula);
		
		// :
		cell.clearRefs();
		formula = "=A1:test:1:1";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		expect(tokenTree.getTokenType()).toBe(websheet.parse.tokenType.OPERATOR_TOKEN);
		expect(tokenTree.getName()).toBe(":");
		expect(tokenTree.getTokenList().length).toBe(2);
		var leftToken = tokenTree.getTokenList()[0];
		var rightToken = tokenTree.getTokenList()[1];
		expect(leftToken.getTokenType()).toBe(websheet.parse.tokenType.OPERATOR_TOKEN);
		expect(leftToken.getName()).toBe(":");
		
		expect(rightToken.getTokenType()).toBe(websheet.parse.tokenType.RANGEREF_TOKEN);
		expect(rightToken._arrayIndex).toBe(2);//used for autofill formula
		expect(rightToken.getAddress()).toBe("1:1");
		rightToken = leftToken.getTokenList()[1];
		leftToken = leftToken.getTokenList()[0];
		expect(leftToken._arrayIndex).toBe(0);//used for autofill formula
		expect(leftToken.getAddress()).toBe("A1");
		
		expect(rightToken.getTokenType()).toBe(websheet.parse.tokenType.NAME);
		expect(rightToken._arrayIndex).toBe(1);//used for autofill formula
		expect(rightToken.getAddress()).toBe("test");
		
		expect(serializeTokenTree(tokenTree, cell)).toBe(genFormula);
		
	});
	
	it("test operator priority", function(){
		var formula, result, tokenTree, genFormula,
		cell = _document.getOrCreateValueCell("Sheet1",1,1,formula, true );
		parser.bMSFormat = false;
		
		formula = "=2+3*SUM(a)+3";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["+","+",2,"*",3,"SUM","a",3]);
		expect(genFormula).toBe(formula);
		
		formula = "=+A1%+2";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["+","+","%","A1", 2]);
		expect(genFormula).toBe(formula);
		
		formula = "=1<-2";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["<",1, "-", 2]);
		expect(genFormula).toBe(formula);
		
		formula = "= ----3*4"; //-> (----3*4)
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["*", "-","-", "-", "-", 3, 4]);
		expect(genFormula).toBe(formula);
		
		formula = "= -A1:A2:A3 ";//-> =-(a1:a2:a3)
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["-", ":", "A1:A2", "A3"]);
		expect(genFormula).toBe("= -A1:A2:A3");
		
		formula = "=-A1 A2"; //=> =-(A1!A2)
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["-", "!","A1", "A2"]);
		expect(genFormula).toBe("=-A1!A2");
		
		formula = "=-1^-+2/0.5*-4";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, [ "*", "/", "^", "-", 1, "-", "+", 2, 0.5, "-", 4]);
		expect(genFormula).toBe(formula);
		
		formula = "=-A1:B1^2";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["^", "-", "A1:B1",2]);
		expect(genFormula).toBe(formula);
		
		formula = "=1---sheet1!A1:2:3";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["-",1, "-", "-", ":","sheet1!A1", "2:3"]);
		expect(genFormula).toBe("=1---sheet1!A1:2:3");
		
		formula = "=1+---1^2";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["+", 1, "^", "-","-", "-",  1, 2]);
		expect(genFormula).toBe(formula);
		
		formula = "=-1^2"; // -> =(-1^2)
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["^", "-", 1, 2]);
		expect(genFormula).toBe(formula);
		
		formula = "=8/--2*2"; //or =8/--2^2  --> =(8/--2*2)
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["*", "/", 8, "-","-", 2, 2]);
		expect(genFormula).toBe(formula);
		
		formula = "=A1%*-100*1"; //    --> =a1%*(-100*1)
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["*", "*", "%","A1", "-", 100, 1]);
		expect(genFormula).toBe(formula);
		
		formula = "=-1*----3"; // -> =(-1*----3)
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["*", "-", 1, "-","-","-","-",3]);
		expect(genFormula).toBe(formula);
		
		formula = "=-A1%%%*-10";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["*", "-", "%", "%", "%", "A1", "-", 10]);
		expect(genFormula).toBe(formula);
		
		formula = "=1+A1%+A1%";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["+", "+", 1,"%", "A1","%", "A1"]);
		expect(genFormula).toBe(formula);
		
		formula = "=A1*((1+A2))^A3";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		checkPriority(tokenTree, ["*", "A1", "^", "", "", "+", 1, "A2", "A3"]);
		expect(genFormula).toBe(formula);
			
	});
	it("test ref function 1", function(){
		var formula, result, tokenTree, genFormula,
		cell = _document.getOrCreateValueCell("Sheet1",1,1,formula, true );
		
		formula = "=A1+(A2*A3-A4/A5)^A6-A7";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		expect(genFormula).toBe(formula);
	});
	
	it("test ref function", function(){
		var formula, result, tokenTree, genFormula,
		cell = _document.getOrCreateValueCell("Sheet1",1,1,formula, true );
		
		formula = "=INDIRECT(A1),OFFSET(A1,1,1)";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		expect(genFormula).toBe(formula);
		
		formula = "=IF(TRUE,A1):C3";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		expect(genFormula).toBe(formula);
		
		formula = "=(A1,B2):C3";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		expect(genFormula).toBe(formula);
		
		formula = "=C3:(A1+OFFSET(A1,1,1))";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error != null).toBe(true);
		
		formula = "=SUM(A1) B2";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error != null).toBe(true);
		
	});
	
	it("test error formula syntax", function(){
		// invalid name
		var formula, result, tokenTree, genFormula,
		cell = _document.getOrCreateValueCell("Sheet1",1,1,formula, true );
		
		formula = "=abc(A1,1,1)";
		result = parser.parseFormula(formula, cell);
		tokenTree = result.tokenTree;
		genFormula = result.formula;
		expect(parser.error == null).toBe(true);
		expect(genFormula).toBe(formula);
		expect(tokenTree.getError() == websheet.Constant.ERRORCODE["525"]).toBe(true);
		
		formula = "=2A";
		result = parser.parseFormula(formula, cell);
		expect(parser.error != null).toBe(true);
		
	});
//	
//	it("compare parser performance", function(){
//		var FormulaHelper = websheet.event.FormulaHelper;
//		var formula = "=IF(IF(Service!$K$261=1,'01'!A7,IF(Service!$K$261=2,'02'!A7,IF(Service!$K$261=3,'03'!A7,IF(Service!$K$261=4,'04'!A7,IF(Service!$K$261=5,'05'!A7,IF(Service!$K$261=6,'06'!A7,IF(Service!$K$261=7,'07'!A7,0)))))))=0,+IF(Service!$K$261=8,'08'!A7,+IF(Service!$K$261=9,'09'!A7,IF(Service!$K$261=10,'10'!A7,IF(Service!$K$261=11,'11'!A7,IF(Service!$K$261=12,'12'!A7,IF(Service!$K$261=13,VJ!A7,0)))))),+IF(Service!$K$261=1,'01'!A7,IF(Service!$K$261=2,'02'!A7,IF(Service!$K$261=3,'03'!A7,IF(Service!$K$261=4,'04'!A7,IF(Service!$K$261=5,'05'!A7,IF(Service!$K$261=6,'06'!A7,IF(Service!$K$261=7,'07'!A7,0))))))))";
////		var formula = "=A1*B2+C3/Sheet2!D5^2  - (C3 A3)";
//		var start = new Date();
//		for(var i = 0; i < 100; i++){
//			var tokens = FormulaHelper.parseWithAutoCorrect(formula, true, false, true);
//		}
//		var end = new Date();
//		console.log("antlr cost:" + (end - start));
//		
//		var lexer = new websheet.parse.FormulaLexer();
//		start = new Date();
//		for(var i = 0; i < 100; i++){
////			var tokens = lexer.parseToken(formula, true);
//			var result =  parser.parseFormula(formula);
//		}
//		end = new Date();
//		console.log("new lexer cost:" + (end - start));
//	});
	
});