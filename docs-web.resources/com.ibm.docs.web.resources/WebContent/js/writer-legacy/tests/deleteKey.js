dojo.provide("writer.tests.deleteKey");
(function() {
	doh.register("deleteKey", [ 
	  function testDeleteEmptyParagraph() {
		var p1 = {
			"fmt" : [],
			"c" : "abcdefgh",
			"t" : "p",
			"id" : "1",
			"rPr" : {
				"font-size" : "14.0pt",
				"rFonts" : {
					"ascii" : "Arial"
				}
			},
			"pPr" : {}
		};
		var emptyP = {
			"fmt" : [],
			"c" : "",
			"t" : "p",
			"id" : "2",
			"rPr" : {
				"font-size" : "14.0pt",
				"rFonts" : {
					"ascii" : "Arial"
				}
			},
			"pPr" : {}
		};
		//case 1
		//<p>abcdefgh</p>
		//[cursor]<p></p>
		//
		var range = createRangeFromParagraphs( [p1,emptyP],1,0,1,0 );
		doh.assertEqual( 2, range.doc.container.length());
		range.deleteAtCursor();
		var p = range.getStartModel().obj;
		doh.assertEqual( 1, range.doc.container.length() );
		doh.assertEqual( 8, range.getStartModel().index );
		//case 2
		//<p>abcdefgh</p>
		//[cursor]<p></p>
		//
		var range = createRangeFromParagraphs( [p1,emptyP],1,0,1,0 );
		doh.assertEqual( 2, range.doc.container.length());
		range.deleteAtCursor(true);
		var p = range.getStartModel().obj;
		doh.assertEqual( 1, range.doc.container.length() );
		doh.assertEqual( 8, range.getStartModel().index );
		//case 3
		//[cursor]<p></p>
		//<p>abcdefgh</p>
		//
		var range =  createRangeFromParagraphs( [emptyP,p1],0,0,0,0 );
		doh.assertEqual( 2, range.doc.container.length() );
		range.deleteAtCursor();
		var p = range.getStartModel().obj;
		doh.assertEqual( 1, range.doc.container.length() );
		doh.assertEqual( 0, range.getStartModel().index );
		//case 4
		//[cursor]<p></p>
		//
		var range =  createRangeFromParagraphs( [emptyP],0,0,0,0 );
		doh.assertEqual( 1, range.doc.container.length() );
		range.deleteAtCursor();
		var p = range.getStartModel().obj;
		doh.assertEqual( 1, range.doc.container.length() );
		doh.assertEqual( 0, range.getStartModel().index );
		console.log(JSON.stringify( range.doc.firstChild().toJson(0,null,true) ));
		doh.assertTrue( writer.util.ModelTools.isEmptyParagraph(range.getStartModel().obj ));
	},

	  function testDeleteParagraph() {
			var p1 = {
				"fmt" : [],
				"c" : "abcdefgh",
				"t" : "p",
				"id" : "1",
				"rPr" : {
					"font-size" : "14.0pt",
					"rFonts" : {
						"ascii" : "Arial"
					}
				},
				"pPr" : {}
			};
			var p2 = {
				"fmt" : [],
				"c" : "a",
				"t" : "p",
				"id" : "2",
				"rPr" : {
					"font-size" : "14.0pt",
					"rFonts" : {
						"ascii" : "Arial"
					}
				},
				"pPr" : {}
			};
			//case 1
			//<p>abcdefgh</p>
			//[cursor]<p></p>
			//
			var range = createRangeFromParagraphs( [p1,p2],1,1,1,1 );
			doh.assertEqual( 2, range.doc.container.length());
			range.deleteAtCursor(true);
			var p = range.getStartModel().obj;
			doh.assertEqual( 2, range.doc.container.length() );
			doh.assertEqual( 0, range.getStartModel().index );
			doh.assertTrue( writer.util.ModelTools.isEmptyParagraph(range.getStartModel().obj ));
			
			var range = createRangeFromParagraphs( [p1,p2],1,1,1,1 );
			doh.assertEqual( 2, range.doc.container.length());
			range.deleteAtCursor(false);
			var p = range.getStartModel().obj;
			doh.assertEqual( 2, range.doc.container.length() );
			doh.assertEqual( 1, range.getStartModel().index );
		} 
	  
	  ]);
	
})();