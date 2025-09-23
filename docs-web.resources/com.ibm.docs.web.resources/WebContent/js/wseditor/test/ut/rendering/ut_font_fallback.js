dojo.provide("websheet.test.ut.rendering.renderTree");


/**
 * UT suite covering functions in Number.js
 */

describe("Ut for Font fall back, module websheet.Utils.fontFallback", function() {
	var utils;
	beforeEach(function() {
		 utils = websheet.Utils;
	});
	
	afterEach(function() {
	});
	
	it("Normal font, should directly return", function() {
		var input = "Arial";
		var output = input;
		expect(utils.fontFallback(input)).toBe(output);
	});
	
	it("Helvetica Neue Light", function () {
		var input = "Helvetica Neue Light";
		var output = "'Helvetica Neue Light','HelveticaNeueLight','HelveticaNeue-Light','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif";
		expect(utils.fontFallback(input)).toBe(output);
	});
	
	it("Helvetica Neue Black Condensed", function () {
		var input = "Helvetica Neue Black Condensed";
		var output = "'Helvetica Neue Black Condensed','HelveticaNeueBlackCondensed','HelveticaNeue-Black-Condensed','HelveticaNeueBlack','HelveticaNeue-Black','Helvetica Neue Black','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif";
		expect(utils.fontFallback(input)).toBe(output);
	});
	
	it("Helvetica Neue Black", function () {
		var input = "Helvetica Neue Black";
		var output = "'Helvetica Neue Black','HelveticaNeueBlack','HelveticaNeue-Black','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif";
		expect(utils.fontFallback(input)).toBe(output);
	});
	
	it("Helvetica Neue Heavy", function () {
		var input = "Helvetica Neue Heavy";
		var output = "'Helvetica Neue Heavy','HelveticaNeueHeavy','HelveticaNeue-Heavy','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif";
		expect(utils.fontFallback(input)).toBe(output);
	});
	
	it("Helvetica Neue Bold Condensed", function () {
		var input = "Helvetica Neue Bold Condensed";
		var output = "'Helvetica Neue Bold Condensed', 'HelveticaNeueBoldCondensed', 'HelveticaNeue-Bold-Condensed', 'HelveticaNeueBold', 'HelveticaNeue-Bold', 'Helvetica Neue Bold', 'Helvetica Neue','HelveticaNeue', Helvetica,Roboto,Arial,sans-serif";
		expect(utils.fontFallback(input)).toBe(output);
	});
	
	it("Helvetica Neue Bold", function () {
		var input = "Helvetica Neue Bold";
		var output = "'Helvetica Neue Bold','HelveticaNeueBold','HelveticaNeue-Bold','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif";
		expect(utils.fontFallback(input)).toBe(output);
	});
	
	it("Helvetica Neue Medium", function () {
		var input = "Helvetica Neue Medium";
		var output = "'Helvetica Neue Medium','HelveticaNeueMedium','HelveticaNeue-Medium','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif";
		expect(utils.fontFallback(input)).toBe(output);
	});
	
	it("Helvetica Neue Thin", function () {
		var input = "Helvetica Neue Thin";
		var output = "'Helvetica Neue Thin','HelveticaNeueThin','HelveticaNeue-Thin','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif";
		expect(utils.fontFallback(input)).toBe(output);
	});
	
	it("Helvetica Neue UltraLight", function () {
		var input = "Helvetica Neue UltraLight";
		var output = "'Helvetica Neue UltraLight','HelveticaNeueUltraLight','HelveticaNeue-UltraLight','Helvetica Neue','HelveticaNeue',Helvetica,Roboto,Arial,sans-serif";
		expect(utils.fontFallback(input)).toBe(output);
	});
	
	it("Helvetica Neue", function () {
		var input = "Helvetica Neue";
		var output = "'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif";
		expect(utils.fontFallback(input)).toBe(output);
	});
	it("Calibri", function () {
		var input = "Calibri";
		var output = "Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif";
		expect(utils.fontFallback(input)).toBe(output);
	});
	it("Calibri Light", function () {
		var input = "Calibri Light";
		var output = "'Calibri Light',Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif";
		expect(utils.fontFallback(input)).toBe(output);
	});
});