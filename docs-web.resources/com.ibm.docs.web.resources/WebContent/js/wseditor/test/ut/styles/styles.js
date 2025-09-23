dojo.provide("websheet.test.ut.styles.styles");

/**
 * UT suite covering style and styleManager basic algorithms such as style adding, hashing and changing.
 */

describe("websheet.test.ut.styles.ut_styles", function() {
	var styleManager = new websheet.style.StyleManager();

	// dummy default cell style
	styleManager._dcs 
		= websheet.style.DefaultStyleCode
		= styleManager.styleMap[websheet.Constant.Style.DEFAULT_CELL_STYLE]
		= builders.style().defaultStyle().finish();

	websheet.Constant.init();
	
	beforeEach(function() {
		;
	});
	
	afterEach(function() {
		styleManager._hashCodeIdMap = {};
		styleManager.styleMap = {};
	});
	
	it("shows valign correctly in style css string", function() {
		var styleCode = builders.style().valign("middle").finish();
		doh.is(true, expect.css().hasStyle(styleCode.toCssString(), "vertical-align", "middle"), "shows valign correctly in style css string");
	});

	it("can add one style code object to style manager", function() {
		var styleCode = builders.style().valign("middle").finish();
		var sid = styleManager.addStyle(styleCode, true);
		doh.isNot(null, sid, "returns valid style id");
		doh.is(styleCode, styleManager.getStyleById(sid), "style code is stored in style manager correctly.");
	});
	
	it("is about defect 37349, style json hash collision", function() {
		var style1 = { "align": "left", "indent": 9 };
		var style2 = { "align": "right", "indent": 9 };
		
		var hash1 = styleManager._styleJsonHashCode(style1);
		var hash2 = styleManager._styleJsonHashCode(style2);
		
		doh.isNot(hash1, hash2, "no hash collision");
	});
});