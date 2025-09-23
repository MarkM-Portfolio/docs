dojo.provide("writer.tests.link");

(function() {
	var linkeParagraph = {

		"fmt" : [ {
			"style" : {},
			"rt" : "rPr",
			"s" : 0,
			"l" : 5
		}, {
			"fmt" : [ {
				"style" : {
					"styleId" : "Hyperlink"
				},
				"rt" : "rPr",
				"s" : 5,
				"l" : 4
			} ],
			"id" : "2",
			"rt" : "hyperlink",
			"src" : "http://www.ibm.com"
		}, {
			"style" : {},
			"rt" : "rPr",
			"s" : 9,
			"l" : 1
		}, {
			"style" : {
				"font-weight" : "bold"
			},
			"rt" : "rPr",
			"s" : 10,
			"l" : 7
		} ],
		"c" : "Test Link element",
		"t" : "p",
		"id" : "1"
	};

	var linkeParagraph2 = {

		"fmt" : [ {
			"style" : {},
			"rt" : "rPr",
			"s" : 0,
			"l" : 5
		}, {
			"fmt" : [ {
				"style" : {
					"styleId" : "Hyperlink"
				},
				"rt" : "rPr",
				"s" : 5,
				"l" : 5
			} ],
			"id" : "2",
			"rt" : "hyperlink",
			"src" : "http://www.ibm.com"
		}, {
			"style" : {},
			"rt" : "rPr",
			"s" : 10,
			"l" : 1
		}, {
			"style" : {
				"font-weight" : "bold"
			},
			"rt" : "rPr",
			"s" : 11,
			"l" : 7
		} ],
		"c" : "Test Liank element",
		"t" : "p",
		"id" : "1"
	};

	doh.register("Link", [ function testLinkLoad() {
		var doc = loadDocument([ linkeParagraph ]);
		var p = doc.byId("1");
		console.log(JSON.stringify(p.toJson(0, null, true)))
		assertJSONEqual(linkeParagraph, p.toJson(0, null, true));
		var m = doc.byId("2");
		doh.assertTrue(m);
	},

	function testInsertText() {
		var doc = loadDocument([ linkeParagraph ]);
		var p = doc.byId("1");
		var linkRun = doc.byId("2").firstChild();

		dojo.require("writer.core.Range");
		writer.core.Range.prototype._modelToView = function() {
		};
		var obj = {
			'obj' : linkRun,
			"index" : 2
		};
		var range = new writer.core.Range(obj, obj, doc);
		var start = range.getStartParaPos();

		doh.assertEqual("paragraph", start.obj.modelType);
		doh.assertTrue(start.obj.insertText);
		var para = start.obj;
		var index = start.index;
		para.insertText("a", index);

		console.log(JSON.stringify(para.toJson(0, null, true)));
		assertJSONEqual(linkeParagraph2, para.toJson(0, null, true));
	},
	
	function testDeleteText(){
		var doc = loadDocument([ linkeParagraph ]);
		var p = doc.byId("1");
		p.deleteText( 7, 1 );
		console.log(JSON.stringify(p.toJson(0, null, true)));
		
		var result =  {

				"fmt" : [ {
					"style" : {},
					"rt" : "rPr",
					"s" : 0,
					"l" : 5
				}, {
					"fmt" : [ {
						"style" : {
							"styleId" : "Hyperlink"
						},
						"rt" : "rPr",
						"s" : 5,
						"l" : 3
					} ],
					"id" : "2",
					"rt" : "hyperlink",
					"src" : "http://www.ibm.com"
				}, {
					"style" : {},
					"rt" : "rPr",
					"s" : 8,
					"l" : 1
				}, {
					"style" : {
						"font-weight" : "bold"
					},
					"rt" : "rPr",
					"s" : 9,
					"l" : 7
				} ],
				"c" : "Test Lik element",
				"t" : "p",
				"id" : "1"
			};
		assertJSONEqual(result, p.toJson(0, null, true));
	},

	function testSetLink() {
		var para = {
			"fmt" : [ {
				"style" : {
					"font-weight" : "bold"
				},
				"rt" : "rPr",
				"s" : 0,
				"l" : 10
			} ],
			"c" : "paragraph1",
			"t" : "p",
			"id" : "1",
			"rPr" : "",
			"pPr" : ""
		};

		var result = {
			"fmt" : [ {
				"style" : {
					"font-weight" : "bold"
				},
				"rt" : "rPr",
				"s" : 0,
				"l" : 4
			}, {
				"fmt" : [ {
					"style" : {
						"font-weight" : "bold"
					},
					"rt" : "rPr",
					"s" : 4,
					"l" : 5
				} ],
				"id" : "2",
				"rt" : "hyperlink",
				"src" : "http://www.ibm.com"
			}, {
				"style" : {
					"font-weight" : "bold"
				},
				"rt" : "rPr",
				"s" : 9,
				"l" : 1
			} ],
			"c" : "paragraph1",
			"t" : "p",
			"id" : "1",
			"rPr" : "",
			"pPr" : ""
		};
		var doc = loadDocument([ para ]);
		var p = doc.byId("1");

		var json = p.toJson(4, 5);
		p.deleteText(4, 5);

		var linkJson = {};
		linkJson.fmt = json.fmt;
		linkJson.src = "http://www.ibm.com";
		linkJson.id = "2";
		linkJson.c = json.c;
		linkJson.rt = "hyperlink";
		p.insertRichText(linkJson, 4);
		//console.log(JSON.stringify(p.toJson(0, null, true)));
		assertJSONEqual(result, p.toJson(0, null, true));
	} ]);

})();