dojo.provide("websheet.test.ut.rendering.number");

/**
 * UT suite covering functions in Number.js
 */
dojo.require("concord.util.date");
dojo.require('dojo.currency');
describe("Ut for general number format in Number.js", function() {
	//
	var Number = websheet.i18n.Number;
	Number.getLocale = function () {
		return 'en-us';
	};
	beforeEach(function() {
	});
	
	afterEach(function() {
	});
	
	it("1.23456789e+15 should be converted to 1.23457E+15", function() {
		var 
			test = 1.23456789e+15,
			result = Number.generalFormatNumber(test),
			expected = '1.23457E+15';
		expect(result).toBeTruthy();
		expect(expected).toBe(result);
	});
	
	it("0.000014567890123 should be converted to 1.45679E-05", function() {
		var 
			test = 0.000014567890123,
			result = Number.generalFormatNumber(test),
			expected = '1.45679E-05';
		expect(result).toBeTruthy();
		expect(expected).toBe(result);
	});
	
	it("0.0000123456789 should be converted to 1.23457E-05", function() {
		var 
			test = 0.0000123456789,
			result = Number.generalFormatNumber(test),
			expected = '1.23457E-05';
		expect(result).toBeTruthy();
		expect(expected).toBe(result);
	});
	
	it("0.000123456789 should be converted to 0.000123457", function() {
		var 
			test = "1.23456789e+15",
			result = Number.generalFormatNumber(test),
			expected = '1.23457E+15';
		expect(result).toBeTruthy();
		expect(expected).toBe(result);
	});
	
	it("123456789.123456 should be converted to 123456789.1", function() {
		var 
			test = 123456789.123456,
			result = Number.generalFormatNumber(test),
			expected = '123456789.1';
		expect(result).toBeTruthy();
		expect(expected).toBe(result);
	});
	
	it("123456789123456000 should be converted to 1.23457E+17", function() {
		var 
			test = 123456789123456000,
			result = Number.generalFormatNumber(test),
			expected = '1.23457E+17';
		expect(result).toBeTruthy();
		expect(expected).toBe(result);
	});
	
	it("40.0000000000001 (fraction part + integral part is more then 11) should be converted to 40", function() {
		var 
			test = 40.0000000000001,
			result = Number.generalFormatNumber(test),
			expected = '40';
		expect(result).toBeTruthy();
		expect(expected).toBe(result);
	});
	
	it("40.00000001 should (exactly 11, MAX_NUMBER_RULE, ) remain as 40.00000001", function() {
		var 
			test = 40.00000001,
			result = Number.generalFormatNumber(test),
			expected = '40.00000001';
		expect(result).toBeTruthy();
		expect(expected).toBe(result);
	});
	
	it("4000 should remain (tail 0 will not be removed for integer for sure) as 4000", function() {
		var 
			test = 4000,
			result = Number.generalFormatNumber(test),
			expected = '4000';
		expect(result).toBeTruthy();
		expect(expected).toBe(result);
	});
});


describe("Ut for websheet.i18n.Number.format", function() {
	var Number = websheet.i18n.Number;
	websheet.baseDateStr = websheet.Constant.baseDateStr;
	Number.getLocale = function () {
		return 'en-us';
	};
	
	var Helper = websheet.Helper;
	
	it("Format a number <0 or >2958465 as date/time, it should return the raw value for the edit value and an error for the show value", function() {
		// date - edit
		var formatType = websheet.Constant.FormatType['DATE'];
		var format = Number.getDefaultFormatForEditValue(formatType, -1);
		expect(Number.format(-1, format, 0, true)).toBe('-1');
		expect(Number.format(0, format, 0, true)).toBe('12/30/1899');
		expect(Number.format(2958465, format, 0, true)).toBe('12/31/9999');
		expect(Number.format(2958466, format, 0, true)).toBe('2958466');
		// date - show
		format = Number.getDefaultFormatForShowValue(formatType, -1);
		expect(Number.format(-1, format, 0)).toBe(websheet.Constant.ERRORCODE['1004']);
		expect(Number.format(0, format, 0)).toBe('12/30/1899');
		expect(Number.format(2958465, format, 0)).toBe('12/31/9999');
		expect(Number.format(2958466, format, 0)).toBe(websheet.Constant.ERRORCODE['1004']);
		
		// time - edit
		formatType = websheet.Constant.FormatType['TIME'];
		format = Number.getDefaultFormatForEditValue(formatType, 1.1);
		expect(Number.format(10000000.125, format, 0, true)).toBe('10000000.125');
		expect(Number.format(1.25E+11, format, 0, true)).toBe('125000000000');
		// time - show
		format = Number.getDefaultFormatForShowValue(formatType, 1.1);
		expect(Number.format(10000000.125, format, 0)).toBe(websheet.Constant.ERRORCODE['1004']);
		expect(Number.format(1.25E+11, format, 0)).toBe(websheet.Constant.ERRORCODE['1004']);
	});
	
	it("Format a decimal number > 1 as time, it should return 'date time' for the edit value. Otherwise, it returns a time only", function() {
		// 0 ~ 1
		var formatType = websheet.Constant.FormatType['TIME'];
		var format = Number.getDefaultFormatForEditValue(formatType, 0.1);
		expect(Number.format(0.125, format, 0, true)).toBe('3:00:00 AM');
		expect(Number.format(1.25E-10, format, 0, true)).toBe('12:00:00 AM');
		
		format = Number.getDefaultFormatForShowValue(formatType, 0.1);
		expect(Number.format(0.125, format, 0)).toBe('3:00 AM');
		expect(Number.format(1.25E-10, format, 0)).toBe('12:00 AM');
		
		// >1
		format = Number.getDefaultFormatForEditValue(formatType, 1.1);
		expect(Number.format(1.125, format, 0, true)).toBe('12/31/1899, 3:00:00 AM');
		expect(Number.format(42903.125, format, 0, true)).toBe('6/17/2017, 3:00:00 AM');
		
		format = Number.getDefaultFormatForShowValue(formatType, 1.1);
		expect(Number.format(1.125, format, 0)).toBe('3:00 AM');
		expect(Number.format(42903.125, format, 0)).toBe('3:00 AM');
	});
	
	it("A quote should be remove in customer format", function(){
		var format = {
			cat: "number;number;number;text", 
			code: '"¥" #,##0.00;"¥" (-#,##0.00);"¥" -;"CN"@', 
			cur: ";;;"
		};
		expect(Number.format(-12345.12345, format, 0)).toBe('¥ (-12,345.12)');
		expect(Number.format(12345.12345, format, 0)).toBe('¥ 12,345.12');
		expect(Number.format(0, format, 0)).toBe('¥ -');
		expect(Number.format('Y', format, 1)).toBe('CNY');
		expect(Number.format(1e-10, format, 0)).toBe('¥ 0.00');
		expect(Number.format(1e+11, format, 0)).toBe('¥ 100,000,000,000.00');
	});
	
	it("Use scientific notation for the edit value when a number is >=1e+21 or last significant digit <1e-19 ", function(){
		var values = [1e+21, /*1e+20*/100000000000000000000, /*1e+16*/10000000000000000, 1234567890, 123456789,  
		              -1234567890, /*-1e+20*/ -100000000000000000000, -1e+21,                                    
		              0, 0.000001, 1e-7, 1e-10, 0.000012345678, 0.00000000000000012345, 1e-19, 1e-20]; 
		            
		var expected = ['1E+21', /*1e+20*/'100000000000000000000', '10000000000000000', '1234567890', '123456789',
		                '-1234567890', '-100000000000000000000', '-1E+21',
		               '0', '0.000001', /*1e-7*/'0.0000001', /*1e-10*/'0.0000000001', '0.000012345678',
		               '1.2345E-16', '0.0000000000000000001', '1E-20'];
		var len = values.length;
		for (var i = 0; i < len; i++){
			var formatType = websheet.Constant.FormatType['NUMBER'];
			if (Helper.isSciNum4EditValue(values[i]))
				formatType = websheet.Constant.FormatType['SCIENTIFIC'];
			var format = Number.getDefaultFormatForEditValue(formatType, values[i]);
			expect(Number.format(values[i], format, 1, true)).toBe(expected[i]);
		}
	});
	
	it("Use scientific notation for the show value when a number is >=1e+11 or last significant digit <1e-9 ", function(){
		var values = [1e+21, /*1e+20*/100000000000000000000, 123456789012, 100000000000, 1234567890,
		              -1234567890, -10000000000, -100000000000,
		              0, 0.000001, 1e-7, 1e-9, 1e-10, 
		              0.00012345678, 0.000012345678];
		var expected = ['1E+21', '1E+20', '1.23457E+11', '1E+11', '1234567890',
		                '-1234567890', '-10000000000', '-1E+11', 
		                '0', '0.000001', /*1e-7*/'0.0000001', /*1e-9*/'0.000000001', '1E-10',
		                '0.000123457', '1.23457E-05'];
		var len = values.length;
		for (var i = 0; i < len; i++){
			expect(Number.generalFormatNumber(values[i])).toBe(expected[i]);
		}
	});

	it("Format a scientific number to a certain format", function(){
		var value1 = 1e-10, value2 = 1e+11;
		//Number
		var format = {cat: "number", code: "#,##0.00"};
		expect(Number.format(value1, format, 0)).toBe('0.00');
		expect(Number.format(value2, format, 0)).toBe('100,000,000,000.00');
		//Currency
	    format = {cat: "currency", code: "#,##0.00", cur: "USD"};
	    expect(Number.format(value1, format, 0)).toBe('$0.00');
		expect(Number.format(value2, format, 0)).toBe('$100,000,000,000.00');
		//Percent
	    format = {cat: "percent", code: "0.00%"};
	    expect(Number.format(value1, format, 0)).toBe('0.00%');
		expect(Number.format(value2, format, 0)).toBe('10000000000000.00%');
		//Frac
	    format = {cat: "fraction", code: "# ?/?"};
	    expect(Number.format(value1, format, 0)).toBe('0    ');
		expect(Number.format(value2, format, 0)).toBe('100000000000    ');
		//Text
	    format = {cat: "text", code: "@"};
	    expect(Number.format(value1, format, 0)).toBe('1E-10');
		expect(Number.format(value2, format, 0)).toBe('1E+11');
	});
	
});

