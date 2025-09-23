dojo.provide("writer.tests.UTcases.utils.fontTools");
dojo.require("writer.util.FontTools");
describe("writer.tests.UTcases.utils.fontTools", function() {

	var ft = writer.util.FontTools;
	function contains(a, v) {
		return a.indexOf(v) >= 0;
	}

	it("check simple fonts", function() {
		var font = "times new roman";
		expect(ft.fallbackFonts(font)).toEqual(font);

		var font = "Arial";
		expect(ft.fallbackFonts(font)).toEqual(font);

		var font = "arial";
		expect(ft.fallbackFonts(font)).toEqual(font);

		var font = "Helvetica";
		expect(ft.fallbackFonts(font)).toEqual(font);
	});
	
	it("calibri", function() {
		var font = "calibri";
		var ff = ft.fallbackFonts(font)
		expect(contains(ff, "Arial")).toBeTruthy();
	});
	
	it("Calibri Light", function() {
		var font = "Calibri Light";
		var ff = ft.fallbackFonts(font)
		expect(contains(ff, "Arial")).toBeTruthy();
		
		var font = "'Calibri Light'";
		var ff = ft.fallbackFonts(font)
		expect(contains(ff, "Arial")).toBeTruthy();
	});

	it("check Helvetica Neue with common fonts", function() {
		var font = "Helvetica Neue, arial";
		expect(ft.fallbackFonts(font)).toEqual(font);

		var font = "'Helvetica Neue', 'Arial'";
		expect(ft.fallbackFonts(font)).toEqual(font);

		var font = "'Helvetica Neue', Tahoma";
		expect(ft.fallbackFonts(font)).toEqual(font);
	});

	it("check Helvetica Neue Light with common fonts", function() {
		var font = "Helvetica Neue Light, arial";
		expect(ft.fallbackFonts(font)).toEqual(font);

		var font = "'Helvetica Neue Light', 'Arial'";
		expect(ft.fallbackFonts(font)).toEqual(font);

		var font = "'Helvetica Neue Light', Tahoma";
		expect(ft.fallbackFonts(font)).toEqual(font);
	});

	it("check Helvetica Neue Light", function() {
		var font = "Helvetica Neue Light";
		var ff = ft.fallbackFonts(font)
		expect(contains(ff, "HelveticaNeueLight")).toBeTruthy();
		expect(contains(ff, "Arial")).toBeTruthy();
	});

	it("check Helvetica Neue Heavy", function() {
		var font = "Helvetica Neue Heavy";
		var ff = ft.fallbackFonts(font)
		expect(contains(ff, "HelveticaNeueHeavy")).toBeTruthy();
		expect(contains(ff, "Arial")).toBeTruthy();
	});

	it("check Helvetica Neue Bold", function() {
		var font = "Helvetica Neue Bold";
		var ff = ft.fallbackFonts(font)
		expect(contains(ff, "HelveticaNeueBold")).toBeTruthy();
		expect(contains(ff, "Arial")).toBeTruthy();
	});

	it("check Helvetica Neue Bold Condensed", function() {
		var font = "Helvetica Neue Bold Condensed";
		var ff = ft.fallbackFonts(font)
		expect(contains(ff, "HelveticaNeueBoldCondensed")).toBeTruthy();
		expect(contains(ff, "Arial")).toBeTruthy();
	});

	it("check Helvetica Neue Medium", function() {
		var font = "Helvetica Neue Medium";
		var ff = ft.fallbackFonts(font)
		expect(contains(ff, "HelveticaNeueMedium")).toBeTruthy();
		expect(contains(ff, "Arial")).toBeTruthy();
	});

	it("check Helvetica Neue Thin", function() {
		var font = "Helvetica Neue Thin";
		var ff = ft.fallbackFonts(font)
		expect(contains(ff, "HelveticaNeueThin")).toBeTruthy();
		expect(contains(ff, "Arial")).toBeTruthy();
	});

	it("check Helvetica Neue Black Condensed", function() {
		var font = "Helvetica Neue Black Condensed";
		var ff = ft.fallbackFonts(font)
		expect(contains(ff, "HelveticaNeueBlackCondensed")).toBeTruthy();
		expect(contains(ff, "Arial")).toBeTruthy();
	});

	it("check Helvetica Neue Black", function() {
		var font = "Helvetica Neue Black";
		var ff = ft.fallbackFonts(font)
		expect(contains(ff, "HelveticaNeueBlack")).toBeTruthy();
		expect(contains(ff, "HelveticaNeueBlackCondensed")).toBeFalsy();
		expect(contains(ff, "Arial")).toBeTruthy();
	});

	it("check Helvetica Neue UltraLight", function() {
		var font = "Helvetica Neue UltraLight";
		var ff = ft.fallbackFonts(font);
		expect(contains(ff, "HelveticaNeueUltraLight")).toBeTruthy();
		expect(contains(ff, "Arial")).toBeTruthy();
	});
	
	it("check Helvetica Neue", function() {
		var font = "Helvetica Neue";
		var ff = ft.fallbackFonts(font)
		expect(contains(ff, "HelveticaNeue")).toBeTruthy();
		expect(contains(ff, "Arial")).toBeTruthy();
	});
	
	it("check css", function(){
		var css1 = ".SC1{font-family:Helvetica Neue}.SC2{font-family:'Helvetica Neue'}"
		var css2 = ".SC1{font-family:'Helvetica Neue';font-size:12px;}.SC2{font-family:'Helvetica Neue Light'}"
		var css3 = ".SC1{font-family:'Helvetica Neue Light', arial}"
		var css4 = ".SC1{font-family:'Helvetica Neue Light', 'Helvetica Neue'}"
		var css5 = ".SC1{font-family:'Helvetica Neue Light', 'Helvetica Neue Black', 'Helvetica Neue'}.SC2{font-family:'Helvetica Neue';font-size:12px}"
		var css6 = ".SC1{font-family:'Helvetica'}.SC2{font-family:'Arial';font-size:12px}"
		var css7 = ".SC1{font-size:12px}"
		var css8 = ""
		var css9 = ".SC1{font-family:calibri}"
				
		var css1new = ft.fallbackFontsInCss(css1);
		var css2new = ft.fallbackFontsInCss(css2);
		var css3new = ft.fallbackFontsInCss(css3);
		var css4new = ft.fallbackFontsInCss(css4);
		var css5new = ft.fallbackFontsInCss(css5);
		var css6new = ft.fallbackFontsInCss(css6);
		var css7new = ft.fallbackFontsInCss(css7);
		var css8new = ft.fallbackFontsInCss(css8);
		var css9new = ft.fallbackFontsInCss(css9);
		
		expect(contains(css1new, "HelveticaNeue")).toBeTruthy();
		expect(contains(css1new, "HelveticaKKKNeue")).toBeFalsy();
		expect(contains(css1new, "Arial")).toBeTruthy();
		
		expect(contains(css2new, "font-size")).toBeTruthy();
		expect(contains(css2new, "HelveticaNeue")).toBeTruthy();
		expect(contains(css2new, "HelveticaKKKNeue")).toBeFalsy();
		expect(contains(css2new, "Arial")).toBeTruthy();

		expect(contains(css3new, "HelveticaNeue")).toBeTruthy();
		expect(contains(css3new, "HelveticaKKKNeue")).toBeFalsy();
		expect(contains(css3new, "Arial")).toBeTruthy();
		
		expect(contains(css4new, "HelveticaNeue")).toBeTruthy();
		expect(contains(css4new, "HelveticaKKKNeue")).toBeFalsy();
		expect(contains(css4new, "Arial")).toBeTruthy();
		
		expect(contains(css5new, "HelveticaNeue")).toBeTruthy();
		expect(contains(css5new, "HelveticaKKKNeue")).toBeFalsy();
		expect(contains(css5new, "Arial")).toBeTruthy();
		expect(contains(css5new, "font-size")).toBeTruthy();
		
		expect(contains(css9new, "Arial")).toBeTruthy();
		
		expect(css6).toEqual(css6new);
		expect(css7).toEqual(css7new);
		expect(css8).toEqual(css8new);
		
	});

});
