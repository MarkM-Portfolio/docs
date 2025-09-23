dojo.provide("writer.tests.enterKeyTest.enterKeyTest");
dojo.require("writer.tests.Model");
dojo.require("writer.model.Document");
dojo.require("writer.model.Model");

doh.register("enterKeyTest", [ 
	function enterInMiddle() {
		
		var doc = loadTestDocument("enterKeyTest");
		// Test first paragraph
		var testPara = doc.container.getByIndex(0);
		var newPara = testPara.split('1');
		doh.assertEqual( newPara.text, getString( "ample" ) );
		doh.assertEqual( testPara.text, getString( "S" ) );
		doh.assertTrue(testPara.parent.container.length() == "3");
		testPara.parent.insertAfter(newPara,testPara);
		doh.assertTrue(testPara.parent.container.length() == "4");
	},
	function enterInBegin() {
		
		var doc = loadTestDocument("enterKeyTest");
		// Test first paragraph
		var testPara = doc.container.getByIndex(0);
		var newPara = testPara.split('0');
		doh.assertEqual( newPara.text, getString( "" ) );
		doh.assertEqual( testPara.text, getString( "Sample" ) );
		doh.assertTrue(testPara.parent.container.length() == "3");
		testPara.parent.insertBefore(newPara,testPara);
		doh.assertTrue(testPara.parent.container.length() == "4");
	},
	function enterInEnd() {
		
		var doc = loadTestDocument("enterKeyTest");
		// Test first paragraph
		var testPara = doc.container.getByIndex(0);
		var newPara = testPara.split('6');
		doh.assertEqual( newPara.text, getString( "" ) );
		doh.assertEqual( testPara.text, getString( "Sample" ) );
		doh.assertTrue(testPara.parent.container.length() == "3");
		testPara.parent.insertAfter(newPara,testPara);
		doh.assertTrue(testPara.parent.container.length() == "4");
	},
	function enterInList() {
		var doc = loadTestDocument("enterKeyTest");
		// Test the second paragraph
		var testPara = doc.container.getByIndex(1);
		var newPara = testPara.split('2');
		doh.assertEqual( newPara.text, getString( "st" ) );
		doh.assertEqual( testPara.text, getString( "Li" ) );
		doh.assertTrue(testPara.parent.container.length() == "3");
		testPara.parent.insertAfter(newPara,testPara);
		doh.assertTrue(testPara.parent.container.length() == "4");
		doh.assertEqual( newPara.source.pPr.numPr.ilvl.val, testPara.source.pPr.numPr.ilvl.val );
	},
	function enterInTheEndOfHeading() {
		var doc = loadTestDocument("enterKeyTest");
		// Test the second paragraph
		var testPara = doc.container.getByIndex(2);
		var newPara = testPara.split('7');
		doh.assertEqual( newPara.text, getString( "" ) );
		doh.assertEqual( testPara.text, getString( "Heading" ) );
		doh.assertEqual( newPara.source.pPr.styleId,testPara.parent.getRefStyle(testPara.styleId).next );
		doh.assertTrue(testPara.parent.container.length() == "3");
		testPara.parent.insertAfter(newPara,testPara);
		doh.assertTrue(testPara.parent.container.length() == "4");
	},
	function enterInTheMiddleOfHeading() {
		var doc = loadTestDocument("enterKeyTest");
		// Test the second paragraph
		var testPara = doc.container.getByIndex(2);
		var newPara = testPara.split('4');
		doh.assertEqual( newPara.text, getString( "ing" ) );
		doh.assertEqual( testPara.text, getString( "Head" ) );
		doh.assertTrue( newPara.source.pPr );
		doh.assertTrue(testPara.parent.container.length() == "3");
		testPara.parent.insertAfter(newPara,testPara);
		doh.assertTrue(testPara.parent.container.length() == "4");
	}
	
]);