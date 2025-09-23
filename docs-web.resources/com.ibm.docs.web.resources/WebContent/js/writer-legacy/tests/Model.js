dojo.provide("writer.tests.Model");

(function() {
	dojo.require("writer.tests.include");

	var json1 = [ {
		"t" : "p",
		"id" : "id_0041846763346500",
		"rPr" : {
			"rFonts" : {
				"ascii" : "Arial",
				"hAnsi" : "Arial",
				"cs" : "Arial"
			},
			"font-weight" : "bold",
			"font-size" : "14pt"
		},
		"c" : 'This is a very simple document for header footer and section.',
		"fmt" : [ {
			"rt" : "rPr",
			"style" : {
				"rFonts" : {
					"ascii" : "Arial",
					"hAnsi" : "Arial",
					"cs" : "Arial"
				},
				"font-weight" : "bold",
				"font-size" : "14pt"
			},
			"s" : "0",
			"l" : "61"
		} ]
	}, {
		"t" : "p",
		"id" : "id_5667629970359894",
		"rPr" : {
			"rFonts" : {
				"ascii" : "Arial",
				"hAnsi" : "Arial",
				"cs" : "Arial"
			},
			"font-size" : "14"
		},
		"c" : "Hello world",
		"fmt" : [ {
			"rt" : "rPr",
			"style" : {
				"rFonts" : {
					"ascii" : "Arial",
					"hAnsi" : "Arial",
					"cs" : "Arial"
				},
				"font-size" : "14pt",
				"background-color" : "#00FF00"
			},
			"s" : "0",
			"l" : "11"
		} ]
	} ];

	doh
			.register(
					"deleteTests",
					[
							function fromJson() {

								var doc = loadSampleDocument();
								var len = doc.container.length();
								doh.assertTrue(len == 161);
								var p1 = doc.container.getFirst();
								doh.assertEqual(p1.text,
										getString("Before a Tab\tAfter a Tab"));
								var p2 = doc.container.getLast();
								doh.assertEqual(p2.text, getString("fdsa"));
								return doc;
							},

							function mergeParagraph() {
								var doc = loadSampleDocument();
								var p1 = doc.container.getFirst();
								var p2 = doc.container.next(p1);
								p1 = writer.util.ModelTools.mergeParagraphs(p1,
										p2);
								doh
										.assertEqual(
												p1.text,
												getString("Before a Tab\tAfter a TabBefore\tAfter"));
								doh.assertEqual(p1.container.length(), 4);
								doh.assertEqual(p1.container.getFirst().start,
										0);
								doh.assertEqual(p1.container.getLast().start,
										24);
								var json = p1.toJson();
								var des = {
									"fmt" : [ {
										"style" : {
											"font-weight" : "bold",
											"font-style" : "italic",
											"font-size" : "14pt",
											"u" : { "val" :"single" },
											"rFonts" : {
												"ascii" : "Arial"
											}
										},
										"rt" : "rPr",
										"s" : 0,
										"l" : 12
									}, {
										"style" : {
											"font-style" : "italic",
											"font-size" : "14pt",
											"u" : { "val" :"single" },
											"rFonts" : {
												"ascii" : "Arial"
											}
										},
										"rt" : "rPr",
										"s" : 12,
										"l" : 1
									}, {
										"style" : {
											"font-weight" : "bold",
											"font-style" : "italic",
											"font-size" : "14pt",
											"u" : { "val" :"single" },
											"rFonts" : {
												"ascii" : "Arial"
											}
										},
										"rt" : "rPr",
										"s" : 13,
										"l" : 11
									}, {
										"style" : {
											"font-weight" : "bold",
											"font-style" : "italic",
											"font-size" : "14pt",
											"u" : { "val" :"single" },
											"rFonts" : {
												"ascii" : "Arial"
											}
										},
										"rt" : "rPr",
										"s" : 24,
										"l" : 12
									} ],
									"c" : "Before a Tab\tAfter a TabBefore\tAfter"
								};
								assertJSONEqual(des, json);
							},
							function deleteText() {
								var doc = loadTestDocument('simple');
								var p1 = doc.container.getFirst();
								p1.deleteText(14, 7);
								assertJSONEqual({
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
										"l" : 54
									} ],
									"c" : "This is a very document for header/footer and section.",
									"t" : "p",
									"id" : "id_0041846763346500",
									"rPr" : {
										"font-weight" : "bold",
										"font-size" : "14.0pt",
										"rFonts" : {
											"ascii" : "Arial"
										}
									}
								},p1.toJson(0, null,
										true));
							}

					]);
	dojo.require("writer.util.ModelTools");

	doh.register("modelToolsTests", [ function getChild() {
		var doc = loadSampleDocument();
		var p1 = doc.container.getFirst();
		var r1 = writer.util.ModelTools.firstChild(p1);

		doh.assertEqual(r1.modelType, "run.text");
		var json = r1.toJson();
		assertJSONEqual({
			"style" : {
				"font-weight" : "bold",
				"font-style" : "italic",
				"font-size" : "14pt",
				"u" : { "val" :"single" },
				"rFonts" : {
					"ascii" : "Arial"
				}
			},
			"rt" : "rPr",
			"s" : 0,
			"l" : 12
		}, json);
		// TODO: changed in future;
		// {"att":"tp","fonts":{"ascii":"Arial","hAnsi":"Arial","cs":"Arial"},"b":"1","size":"14","szCs":"14","s":"0","l":"61"}
		// ) );

		var r2 = writer.util.ModelTools.nextSibling(r1);
		assertJSONEqual({
			"style" : {
				"font-style" : "italic",
				"font-size" : "14pt",
				"u" : { "val" :"single" },
				"rFonts" : {
					"ascii" : "Arial"
				}
			},
			"rt" : "rPr",
			"s" : 12,
			"l" : 1
		}, r2.toJson());
	},

	function getNext() {
		var doc = loadDocument(json1);
		var p1 = doc.container.getFirst();
		var r1 = writer.util.ModelTools.firstChild(p1);
		var nextP = writer.util.ModelTools.getNext(r1, "paragraph");
		assertJSONEqual({
			"fmt" : [ {
				"style" : {
					"font-size" : "14pt",
					"background-color" : "#00FF00",
					"rFonts" : {
						"ascii" : "Arial"
					}
				},
				"rt" : "rPr",
				"s" : 0,
				"l" : 11
			} ],
			"c" : "Hello world"
		}, nextP.toJson());
	}

	]);
})();