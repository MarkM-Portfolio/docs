dojo.provide("writer.tests.rangeIterator");
(function() {
	var p1 = {
		"fmt" : [ {
			"style" : {
				"font-weight" : "bold",
				"font-size" : "14.0pt",
				"rFonts" : {
					"ascii" : "Arial"
				}
			},
			"rt" : "rPr",
			"s" : 0,
			"l" : 61
		} ],
		"c" : "This is a very simple document for header/footer and section.",
		"t" : "p",
		"id" : "id_0041846763346500",
		"rPr" : {
			"font-weight" : "bold",
			"font-size" : "14.0pt",
			"rFonts" : {
				"ascii" : "Arial"
			}
		},
		"pPr" : {}
	};
	var p2 = {
		"fmt" : [ {
			"style" : {
				"font-weight" : "bold",
				"font-size" : "14.0pt",
				"rFonts" : {
					"ascii" : "Arial"
				}
			},
			"rt" : "rPr",
			"s" : 0,
			"l" : 35
		}, {
			"style" : {
				"color" : "#00CCFF",
				"font-weight" : "bold",
				"font-size" : "14.0pt",
				"rFonts" : {
					"ascii" : "Arial"
				}
			},
			"rt" : "rPr",
			"s" : 35,
			"l" : 19
		} ],
		"c" : "This page is the first normal page with header/footer.",
		"t" : "p",
		"id" : "id_9169572414789358",
		"rPr" : {
			"font-weight" : "bold",
			"font-size" : "14.0pt",
			"rFonts" : {
				"ascii" : "Arial"
			}
		},
		"pPr" : {}
	};
	
	dojo.require("writer.core.Range");
	doh.register("rangeIterator", [
	function testCollapse() {
		var range = createRangeFromParagraphs( [p1,p2], 0, 62, 0, 62);
		var it = new writer.common.RangeIterator( range );
		var c = null;
		var paragraphs = [];
		while ( c = it.nextBlock()) {
			paragraphs.push(c);
		}
		doh.assertEqual( 1, paragraphs.length)
	} ]);
})();