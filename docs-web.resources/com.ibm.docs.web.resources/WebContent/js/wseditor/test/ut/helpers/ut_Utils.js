dojo.provide("websheet.test.ut.Utils");

/**
 * UT suite, function for Utils.
 */

describe("websheet.test.ut.Utils", function() {
	var _document = new websheet.model.Document();
	pe.scene.getDocBean().setUri("test.ods");
	
	beforeEach(function() {
		utils.bindDocument(_document);		
	});
	
	afterEach(function() {	
		utils.unbindDocument();
	});
	
	it("Utils, parseLink", function(){
		var parsedLink = websheet.Utils.parseLink("[file]a1");
		doh.is(2,parsedLink.type);
		
		parsedLink = websheet.Utils.parseLink(3);
		doh.is(1,parsedLink.type);
		
		parsedLink = websheet.Utils.parseLink("3");
		doh.is(1,parsedLink.type);
		
		parsedLink = websheet.Utils.parseLink("#a1");
		doh.is(null,parsedLink.type);
		
		parsedLink = websheet.Utils.parseLink("##a1");
		doh.is(null,parsedLink.type);
		
		parsedLink = websheet.Utils.parseLink("##[test.ods]a1");
		doh.is(0,parsedLink.type);
		
		parsedLink = websheet.Utils.parseLink("##ab");
		doh.is(0,parsedLink.type);
		
		parsedLink = websheet.Utils.parseLink("##Sheetab!a:a");
		doh.is(0,parsedLink.type);
	});
});