dojo.provide("writer.tests.range_delete");

(function() {
	dojo.require("writer.core.Range");
	function assertResult(result) {
		doh.assertEqual(4, result.length);
		console.log(JSON.stringify(result[0]));
		console.log(JSON.stringify(result[1]));
		console.log(JSON.stringify(result[2]));
		console.log(JSON.stringify(result[3]));

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
				"s" : 2,
				"l" : 59
			} ],
			"c" : "is is a very simple document for header/footer and section."
		}, result[0]);

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
				"l" : 35
			}, {
				"style" : {
					"font-weight" : "bold",
					"color" : "#00CCFF",
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
			}
		}, result[1]);
		assertJSONEqual({
			"fmt" : [],
			"c" : "",
			"t" : "p",
			"id" : "id_3281682799610491",
			"rPr" : {
				"font-size" : "14.0pt",
				"rFonts" : {
					"ascii" : "Arial"
				}
			}
		}, result[2]);

		assertJSONEqual({
			"fmt" : [ {
				"style" : {
					"color" : "#FF0000",
					"font-size" : "14.0pt",
					"rFonts" : {
						"ascii" : "Arial"
					}
				},
				"rt" : "rPr",
				"s" : 0,
				"l" : 6
			} ],
			"c" : "Hello "
		}, result[3]);
	}
	;
	function assertMsgsResult(result) {
		doh.assertEqual(4, result.length);
		console.log(JSON.stringify(result[0]));
		console.log(JSON.stringify(result[1]));
		console.log(JSON.stringify(result[2]));
		console.log(JSON.stringify(result[3]));
	}
	function createRange1() {
		var doc = loadTestDocument('simple');
		var p1 = doc.container.getFirst();
		var p2 = doc.container.next(p1);
		var p3 = doc.container.next(p2);
		var p4 = doc.container.next(p3);
		doh
				.assertEqual(
						getString("This is a very simple document for header/footer and section."),
						p1.text);
		doh
				.assertEqual(
						getString("This page is the first normal page with header/footer."),
						p2.text);

		doh.assertEqual("", p3.text);

		doh.assertEqual(getString("Hello world"), p4.text);

		return new writer.core.Range({
			'obj' : p1,
			'index' : 2
		}, {
			'obj' : p4,
			'index' : 6
		}, doc);
	}
	;

	function createRange2() {
		var doc = loadTestDocument('simple');
		var p1 = doc.container.getFirst();
		var p2 = doc.container.next(p1);
		var p3 = doc.container.next(p2);
		var p4 = doc.container.next(p3);
		return new writer.core.Range({
			'obj' : p1.firstChild(),
			'index' : 2
		}, {
			'obj' : p4.firstChild(),
			'index' : 6
		}, doc);
	}
	;

	function createRange3() {
		var doc = loadTestDocument('simple');
		var p1 = doc.container.getFirst();
		return new writer.core.Range({
			'obj' : p1.firstChild(),
			'index' : 2
		}, {
			'obj' : p1.firstChild(),
			'index' : 3
		}, doc);

	}
	;

	doh
			.register(
					"range_delete",
					[
							function deleteContents() {

								assertResult(createRange1().deleteContents());
								assertResult(createRange2().deleteContents());
								assertMsgsResult(createRange1().deleteContents(
										true));
								assertMsgsResult(createRange2().deleteContents(
										true));
							},

							function deleteInSameParagraph() {
								var range = createRange3();
								var result = range.deleteContents();
								doh.assertEqual(1, result.length);
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
										"s" : 2,
										"l" : 1
									} ],
									"c" : "i"
								}, result[0]);
								doh.assertTrue(range.isCollapsed());
								// doh.assertEqual( "Ths is a very simple
								// document for header/footer and
								// section.",p1.text)
							},

							function deleteMsg() {
								var doc = loadTestDocument('simple');
								var p1 = doc.container.getFirst();
								var p2 = doc.container.next(p1);
								var p3 = doc.container.next(p2);
								var p4 = doc.container.next(p3);

								var actPair = WRITER.MSG
										.createDeleteElementAct(p4);
								var result = {
									"act" : {
										"tid" : "id_2995194248275436",
										"t" : "de"
									},
									"rAct" : {
										"tid" : "body",
										"idx" : 3,
										"cnt" : {
											"fmt" : [ {
												"style" : {
													"color" : "#FF0000",
													"font-size" : "14.0pt",
													"rFonts" : {
														"ascii" : "Arial"
													}
												},
												"rt" : "rPr",
												"s" : 0,
												"l" : 11
											} ],
											"c" : "Hello world",
											"t" : "p",
											"id" : "id_2995194248275436",
											"rPr" : {
												"color" : "#FF0000",
												"font-size" : "14.0pt",
												"rFonts" : {
													"ascii" : "Arial"
												}
											}
										},
										"t":"ie"
									}
								};
								assertJSONEqual(result, actPair);
							},

							function deleteMsg2() {
								var p = {
									"fmt" : [
											{
												"style" : {
													"color" : "#000000",
													"font-weight" : "bold",
													"font-size" : "10.0pt",
													"rFonts" : {
														"ascii" : "    Arial"
													}
												},
												"rt" : "rPr",
												"s" : 0,
												"l" : 14
											},
											{
												"style" : {
													"color" : "#000000",
													"font-style" : "italic",
													"font-weight" : "bold",
													"font-size" : "12.0pt",
													"rFonts" : {
														"ascii" : "    Arial"
													}
												},
												"rt" : "rPr",
												"s" : 14,
												"l" : 15
											},
											{
												"style" : {},
												"rt" : "img",
												"s" : 29,
												"l" : 1,
												"inline" : {
													"distL" : "0emu",
													"distR" : "0emu",
													"distT" : "0emu",
													"distB" : "0emu",
													"effectExtent" : {
														"l" : "0emu",
														"r" : "0emu",
														"t" : "0emu",
														"b" : "0emu"
													},
													"extent" : {
														"cx" : "1485900emu",
														"cy" : "1485900emu"
													},
													"docPr" : {
														"descr" : "John E. Kelly, III in Africa"
													},
													"graphicData" : {
														"pic" : {
															"src" : "image1.gif",
															"spPr" : {
																"ln" : {
																	"w" : "0emu",
																	"solidFill" : "#f00"
																}
															}
														}
													}
												}
											}, {
												"style" : {
													"color" : "#000000",
													"font-style" : "italic",
													"font-weight" : "bold",
													"font-size" : "12.0pt",
													"rFonts" : {
														"ascii" : "    Arial"
													}
												},
												"rt" : "rPr",
												"s" : 30,
												"l" : 28
											}, {
												"style" : {
													"color" : "#000000",
													"font-weight" : "bold",
													"font-size" : "12.0pt",
													"rFonts" : {
														"ascii" : "    Arial"
													}
												},
												"rt" : "rPr",
												"s" : 58,
												"l" : 1
											}, {
												"style" : {
													"color" : "#000000",
													"font-weight" : "bold",
													"font-size" : "10.0pt",
													"rFonts" : {
														"ascii" : "    Arial"
													}
												},
												"rt" : "rPr",
												"s" : 59,
												"l" : 136
											}, {
												"style" : {
													"color" : "#000000",
													"font-weight" : "bold",
													"font-size" : "10.0pt",
													"rFonts" : {
														"ascii" : "    Arial"
													}
												},
												"rt" : "rPr",
												"s" : 195,
												"l" : 11
											} ],
									"c" : "In accordance with government\u0001 recent announcement on 2013 public holidays in the People's Republic of China, we are sending you the following 2013 Public Holidays and IBM China Designated Holiday schedule.",
									"t" : "p",
									"id" : "id_3281682799610491",
									"rPr" : {
										"font-weight" : "bold"
									},
									"pPr" : {}
								};
								var json = p;
								var doc = loadDocument([p]);
								p =  doc.container.getFirst();
								
								var range = new writer.core.Range({
									'obj' : p,
									'index' : 39
								}, {
									'obj' : p,
									'index' : 82
								}, doc);
								var text1 = p.text;
								var result = range.deleteContents( true );
								var text2 = p.text;
								
								var msghandler = new writer.msg.MessageHandler();
								var ract = result[0].rMsg.updates[0];
								msghandler.insertText(p, ract);
								assertJSONEqual( p.toJson(0,null,true), json );

							},

							function insertTextMsgApply() {
								var tar2 = {
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
										"l" : 15
									}, {
										"style" : {
											"font-weight" : "bold",
											"font-size" : "14.0pt",
											"rFonts" : {
												"ascii" : "Arial"
											}
										},
										"rt" : "rPr",
										"s" : 15,
										"l" : 40
									} ],
									"c" : "This is a very  document for header/footer and section.",
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
								var act = {
									"tid" : "id_0041846763346500",
									"idx" : 14,
									"len" : 7,
									"t" : "it",
									"cnt" : {
										"fmt" : [ {
											"style" : {
												"font-weight" : "bold",
												"font-size" : "14.0pt",
												"rFonts" : {
													"ascii" : "Arial"
												}
											},
											"rt" : "rPr",
											"s" : 14,
											"l" : 7
										} ],
										"c" : " simple"
									}
								};
								var msghandler = new writer.msg.MessageHandler();
								var target = ModelfromJson(tar2);
								msghandler.insertText(target, act);

							},

							function insertTextMsgApply2() {
								var before = {
									"fmt" : [ {
										"style" : {
											"color" : "#FF0000",
											"font-size" : "14.0pt",
											"rFonts" : {
												"ascii" : "Arial"
											}
										},
										"rt" : "rPr",
										"s" : 0,
										"l" : 48
									} ],
									"c" : "adsfadsfadf soft-br before\rsoft-br after adsfdsaf",
									"t" : "p",
									"id" : "id_2391460439020153",
									"rPr" : {
										"color" : "#FF0000",
										"font-size" : "14.0pt",
										"rFonts" : {
											"ascii" : "Arial"
										}
									}
								};

								var after = {
									"fmt" : [ {
										"style" : {
											"color" : "#FF0000",
											"font-size" : "14.0pt",
											"rFonts" : {
												"ascii" : "Arial"
											}
										},
										"rt" : "rPr",
										"s" : 0,
										"l" : 49
									} ],
									"c" : "adsfadsfasdf soft-br before\rsoft-br after adsfdsaf",
									"t" : "p",
									"id" : "id_2391460439020153",
									"rPr" : {
										"color" : "#FF0000",
										"font-size" : "14.0pt",
										"rFonts" : {
											"ascii" : "Arial"
										}
									}
								};

								var act = {
									"tid" : "id_2391460439020153",
									"idx" : 9,
									"len" : 1,
									"t" : "it",
									"cnt" : {
										"fmt" : [ {
											"style" : {
												"color" : "#FF0000",
												"font-size" : "14.0pt",
												"rFonts" : {
													"ascii" : "Arial"
												}
											},
											"rt" : "rPr",
											"s" : 0,
											"l" : 1
										} ],
										"c" : "s"
									}
								};

								var msghandler = new writer.msg.MessageHandler();
								var target = ModelfromJson(before);
								msghandler.insertText(target, act);
								var p = ModelfromJson(after);
								assertParagraphEqual(p, target);
							} ]);

	function insertDeleteTextMsg() {
		var a1 = {
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
		var msg = {
			"msg" : {
				"type" : "t",
				"mc" : "c",
				"updates" : [ {
					"tid" : "id_0041846763346500",
					"t" : "dt",
					"idx" : 15,
					"len" : 6
				} ]
			},
			"rMsg" : {
				"type" : "t",
				"mc" : "c",
				"updates" : [ {
					"tid" : "id_0041846763346500",
					"idx" : 15,
					"len" : 6,
					"t" : "it",
					"cnt" : {
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
							"l" : 6
						} ],
						"c" : "simple"
					}
				} ]
			}
		};

		var a2 = {
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
				"l" : 55
			} ],
			"c" : "This is a very  document for header/footer and section.",
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
		var p1 = ModelfromJson(a1);
		var p2 = ModelfromJson(a2);
		var act = msg.msg.updates[0];
		var ract = msg.rMsg.updates[0];
		msghandler.insertText(p2, ract);
		assertParagraphEqual(p1, p2);
	}

})();