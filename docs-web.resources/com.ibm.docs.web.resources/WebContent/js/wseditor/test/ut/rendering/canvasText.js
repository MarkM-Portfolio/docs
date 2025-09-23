dojo.provide("websheet.test.ut.rendering.textlayout");

/**
 * UT suite covering functions in _TextLayout.js
 */

describe("Ut for canvas text layout engine", function() {
//	//give a stub to construct the default cell style
	websheet.style.DefaultStyleCode = builders.style().defaultStyle().finish();
	websheet.Constant.init();
	//
	var engine = websheet.grid.LayoutEngine.getInstance().state();
	pe = {
			scene : {
				getLocale : function () {
					return "en-us";
				}
			}
	};
	beforeEach(function() {
	});
	
	afterEach(function() {
	});
	
	
	it("Basic, measure test", function() {
		var 
			test = "Hello",
			width = engine.measureWidth(test);
		expect(width).toBeTruthy();
		expect(engine.measureWidth("Hell")).not.toBeGreaterThan(width);
	});
	
	it("Basic, text width precision test", function() {
		var 
			singleW = "W",
			singleWidth = engine.measureWidth(singleW),
			fiveWs = engine.measureWidth("WWWWW");
		expect(fiveWs).toBe(singleWidth * 5);
	});
	
	it("Basic, no wrap with default state", function() {
		var 
			teststr = "A simple test",
			lines = engine.state().fragmentText(teststr, 200).lines;
		expect(lines.length).toBe(1);
		expect(lines[0]).toBe(teststr);
	});
	
	it("Basic, clip text test", function() {
		var 
			teststr = "Another test for clip text",
			substr = teststr.substring(0, 10),
			width = engine.measureWidth(substr),
			result = engine.clipText(teststr, width);
		expect(result.text).toBe(substr);
	});
	
	it("Basic, clip text lower boundary test", function() {
		var
			test = "Some string",
			result = engine.clipText(test, -1);
		expect(result.position).toBe(0);
		expect(result.text).toBe("");
	});
	
	it("Basic, clip text upper boundary test", function() {
		var
			test = "Some string",
			result = engine.clipText(test, 300);
		expect(result.position).toBe(test.length);
		expect(result.text).toBe(test);
	});
	
	it("Full test, wrap text with a limited width, exactly matched", function() {
		var
			test = "word word word word word",
			single = "word",
			space = " ",
			total = engine.measureWidth(test),
			single_width = engine.measureWidth(single),
			space_width = engine.measureWidth(space),
			wrapped_lines;
		wrapped_lines = engine.fragmentText(test, single_width + space_width).lines;
		expect(wrapped_lines.length).toBe(5);
		expect(wrapped_lines[0]).toBe("word ");
		expect(wrapped_lines[4]).toBe("word");
	});
	
	it("Full test, wrap text with a limited width, need to break a long word", function() {
		var
			test = "short shortshortshortshort short",
			single = "short",
			space = " ",
			total = engine.measureWidth(test),
			single_width = engine.measureWidth(single),
			long_width = engine.measureWidth("shortshortshortshort"),
			space_width = engine.measureWidth(space),
			wrapped_lines;
		wrapped_lines = engine.fragmentText(test, long_width - space_width).lines;
		expect(wrapped_lines.length).toBe(3);
		expect(wrapped_lines[0]).toBe("short ");
		expect(wrapped_lines[1].indexOf("shortshortshor")).toBe(0);
	});
	
	it("Full test,wrap text with punctuation", function () {
		var
			test = "hello, what are you doing?",
			first = engine.measureWidth("hello, wh"),
			wrap_1 = engine.fragmentText(test, first).lines;
		expect(wrap_1[0]).toBe("hello, ");
		expect(wrap_1[1].indexOf("what")).toBe(0);
		var
			second = engine.measureWidth("hello, what are you doing"),
			wrap_2 = engine.fragmentText(test, second).lines;
		expect(wrap_2[0]).toBe("hello, what are you ");
		expect(wrap_2[1]).toBe("doing?");
			
	});
	
	xit("Match test[ENGLISH], some sample sentences, compare result with real HTML wrap result", function (){
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var
			test = "Hello, my name is LiLei, what's your name?",
			wrap = engine.fragmentText(test, 80).lines;
		expect(wrap.length).toBe(4);
		expect(wrap[0]).toBe("Hello, my ");
		expect(wrap[1]).toBe("name is LiLei, ");
		expect(wrap[2]).toBe("what's your ");
		expect(wrap[3]).toBe("name?");
	});
	
	xit("Match test[CHINESE], some sample sentences, compare result with real HTML wrap result", function (){
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var
			test = "对于企业而言，O2O的深层价值来自于它带给企业更多的是O2O背后的深层变革。这个似乎要刨根问底追溯企业的灵魂了。",
			wrap = engine.fragmentText(test, 80).lines;
		expect(wrap[0]).toBe("对于企业而");
		expect(wrap[1]).toBe("言，O2O的深");
		expect(wrap[2]).toBe("层价值来自于");
		expect(wrap[3]).toBe("它带给企业更");
		expect(wrap[4]).toBe("多的是O2O背");
		expect(wrap[5]).toBe("后的深层变");
		expect(wrap[6]).toBe("革。这个似乎");
		expect(wrap[7]).toBe("要刨根问底追");
		expect(wrap[8]).toBe("溯企业的灵魂");
		expect(wrap[9]).toBe("了。");
		
	});
	
	xit("Match test[JAPANESE], some sample sentences, compare result with real HTML wrap result", function (){
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var
			test = "毎週日曜日に放送される「ＮＨＫスペシャル」のエッセンスを５分間に凝縮し、その見どころを放送前日に一足早く紹介します。これを見ると翌日のＮＨＫスペシャルが見たくなること間違いなしです。",
			wrap = engine.fragmentText(test, 200).lines;
		expect(wrap[0]).toBe("毎週日曜日に放送される「ＮＨＫスペ");
		expect(wrap[1]).toBe("シャル」のエッセンスを５分間に凝縮");
		expect(wrap[2]).toBe("し、その見どころを放送前日に一足早く");
		expect(wrap[3]).toBe("紹介します。これを見ると翌日のＮＨ");
		expect(wrap[4]).toBe("Ｋスペシャルが見たくなること間違いな");
		expect(wrap[5]).toBe("しです。");
		
	});
	
	it("Give enough space, '1.23457E+11' should be rounded to '1.23457E+11'", function (){
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var number = '1.23457E+11';
		var expected = "1.23457E+11";
		var width = engine.measureWidth(expected);
		var result = engine.roundNumber(number, width);
		expect(result).toBe(expected);
	});
	
	it("Can not fully displayed, '1.23457E+11' should be rounded to '1.2346E+11' ", function () {
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var number = '1.23457E+11';
		var expected = "1.2346E+11";
		var width = engine.measureWidth(expected) + 1;
		var result = engine.roundNumber(number, width);
		expect(result).toBe(expected);
	});
	
	it("Can not fully displayed, fraction part will be rounded, '123456789.1' should be rounded to '123456789' ", function () {
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var number = "123456789.1";
		var expected = "123456789";
		var width = engine.measureWidth(expected) + 1;
		var result = engine.roundNumber(number, width);
		expect(result).toBe(expected);
	});
	
	it("Can not fully displayed, fraction part will be rounded, '123456789.9' should be rounded to '123456790' ", function () {
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var number = "123456789.9";
		var expected = "123456790";
		var width = engine.measureWidth(expected);
		var result = engine.roundNumber(number, width);
		expect(result).toBe(expected);
	});
	
	it("Can not fully display integral part, convert to exponential notation, '123456789.9' should be rounded to '1.23E+08' ", function () {
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var number = "123456789.9";
		var expected = "1.23E+08";
		var width = engine.measureWidth(expected);
		var result = engine.roundNumber(number, width);
		expect(result).toBe(expected);
	});
	
	it("Can not fully display integral part, convert to exponential notation, negative value, '123456789.9' should be rounded to '-1.2E+08' ", function () {
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var number = "123456789.9";
		var expected = "1.23E+08";
		var width = engine.measureWidth(expected);
		var result = engine.roundNumber(number, width);
		expect(result).toBe(expected);
	});
	
	it("Not enough sapce for any meaning full result, '123456789.9' should be rounded to '####' ", function () {
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var number = "123456789.9";
		var expected = "####";
		var width = engine.measureWidth(expected);
		var result = engine.roundNumber(number, width);
		expect(result).toBe(expected);
	});
	
	it("Not enough sapce for any meaning full result, exponential notation value, '1.23457E+22' should be rounded to '##' ", function () {
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var number = "123456789.9";
		var expected = "##";
		var width = engine.measureWidth(expected);
		var result = engine.roundNumber(number, width);
		expect(result).toBe(expected);
	});
	
	it("Round number, tests, 123.000001 = > 123", function (){
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var number = "123.000001";
		var expected = "123.000";
		var width = engine.measureWidth(expected);
		var result = engine.roundNumber(number, width);
		expect(result).toBe("123");
	});
	
	it("Round number, tests, cell width too small, return empty string", function (){
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var number = "123.000001";
		var expected = "";
		var width = 1;
		var result = engine.roundNumber(number, width);
		expect(result).toBe(expected);
	});
	
	it("Round number, tests, round number with leading zeros in fraction part", function (){
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var number = "123.00123";
		var expected = "123.001";
		var width = engine.measureWidth(expected);
		var result = engine.roundNumber(number, width);
		expect(result).toBe(expected);
	});
	
	it("Round number, tests, round number with leading zeros in fraction part, not enough sapce for fraction part, will rounded to integer", function (){
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var number = "123.00123";
		var expected = "123.0";
		var width = engine.measureWidth(expected);
		var result = engine.roundNumber(number, width);
		expect(result).toBe("123");
	});
	
	it("Round number, tests, round number with minus sign, the minus sign will take some place and affect the round result", function (){
		engine.state({
			fontSize : "12px",
			fontFamily: "Arial"
		});
		var number = "-12345.67";
		var expected = "-12346";
		var width = engine.measureWidth(expected);
		var result = engine.roundNumber(number, width + 5);
		expect(result).toBe(expected);
	});
	
});