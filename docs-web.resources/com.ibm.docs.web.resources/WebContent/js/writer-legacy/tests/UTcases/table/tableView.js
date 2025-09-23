dojo.provide("writer.tests.UTcases.table.tableView");
dojo.require("writer.ui.widget.ColorPalette");
dojo.require("writer.controller.UpdateManager");
dojo.require("writer.plugins.UndoManager");
describe("writer.tests.UTcases.table.tableView", function() {
	common.MeasureText.init();
	common.tools.getDPI();
	writer.view.Run.prototype.getCSSStr = function() {
		return "font-family:Calibri;font-size:11pt;";
	};

	var loadTestData = function() {
		var jsonData = {
			"body": [{
				"t": "p",
				"id": "id_001",
				"c": "hello",
				"fmt": [{
					"rt": "rPr",
					"s": "0",
					"l": "5"
				}]
			}]
		};

		pe.lotusEditor.relations = new writer.model.Relations({});
		pe.lotusEditor.number = new writer.model.Numbering({});
		// pe.lotusEditor.styles = new writer.model.style.Styles({});
		// pe.lotusEditor.styles.createCSSStyle();
		pe.lotusEditor.setting = new writer.model.Settings({});
		pe.lotusEditor.relations.loadContent();
		pe.lotusEditor.document = new writer.model.Document(jsonData, pe.lotusEditor.layoutEngine);
		return pe.lotusEditor.document;
	};

	var loadTableModel = function() {
		var jsonData = {
			"body": [{
				"t": "tbl",
				"tblPr": {
					"tblBorders": {
						"top": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"left": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"bottom": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"right": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"insideH": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"insideV": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						}
					}
				},
				"trs": [{
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "240F4D6E",
					"trPr": {
						"trHeight": "23.4500pt",
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "4110",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_9244004849861994",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "4A7A0FCD",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "3"
							}],
							"c": "aaa"
						}],
						"id": "id_9649031431249401"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "4110",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_3956971328745585",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "52A7390F",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_2328564807336421"
					}],
					"id": "id_00101"
				}, {
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "02A25276",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "4110",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_2340922825099634",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "34865421",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_8409440124601429"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "4110",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_6480828360510672",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "349A6341",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_7675224109095684"
					}],
					"id": "id_0266029214753878"
				}, {
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "7D4C3A97",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "4110",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_0029360640633220",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "281C584C",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_8262183786600540"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "4110",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_0962626002048329",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "62AE2325",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_3577242098424062"
					}],
					"id": "id_9476046512177512"
				}, {
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "719B0A95",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "4110",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_9774427950527935",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "56C60048",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_6494096736964926"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "4110",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_4101716495114180",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "1F325F17",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_6755454781584906"
					}],
					"id": "id_0350357868091653"
				}],
				"id": "id_001",
				"tblGrid": [{
					"t": "gridCol",
					"w": "205.5000pt"
				}, {
					"t": "gridCol",
					"w": "205.5000pt"
				}]
			}, {
				"t": "p",
				"id": "id_7522451094078848",
				"attr_pre": {
					"paraId": "w14"
				},
				"paraId": "77C66AD8",
				"pPr": {
					"t": "pPr",
					"keepLines": {
						"val": "0"
					}
				},
				"fmt": [{
					"t": "r",
					"rt": "rPr",
					"s": "0",
					"l": "0"
				}],
				"c": ""
			}]
		};

		common.tools.DPI.x = 96;
		pe.lotusEditor.relations = new writer.model.Relations({});
		pe.lotusEditor.number = new writer.model.Numbering({});
		pe.lotusEditor.styles = new writer.model.style.Styles({});
		pe.lotusEditor.styles.createCSSStyle();
		pe.lotusEditor.setting = new writer.model.Settings({});
		var edit = {
			editor: pe.lotusEditor
		};
		var undoManager = new writer.plugins.UndoManager(edit);
		undoManager.init();
		pe.lotusEditor.updateManager = new writer.controller.UpdateManager();
		pe.lotusEditor.relations.loadContent();

		pe.scene = {
			coedit: false,
			cursorDecEnabled: false,
			session: {
				createMessage: concord.net.Session.prototype.createMessage,
				sendMessage: function(test, test2) {
					//console.log(test);
				},
				isSingleMode: function() {
					return true;
				},
				waitingList: [],
				updateHeaderFooter: function() {}
			}
		};
		pe.lotusEditor.document = new writer.model.Document(jsonData.body, pe.lotusEditor.layoutEngine);
		return pe.lotusEditor.document.byId('id_001');
	};
	var loadTableModel2 = function() {
		var jsonData = {
			"body": [{
				"t": "tbl",
				"tblPr": {
					"tblBorders": {
						"top": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"left": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"bottom": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"right": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"insideH": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"insideV": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						}
					}
				},
				"trs": [{
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "398F0BE0",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_8657128422360269",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "4FB60645",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_2798382674836414"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_8058146827315772",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "05126730",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_0122175557532476"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_2926008783561616",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "13760C38",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_3726089817787323"
					}],
					"id": "id_0227083542559059"
				}, {
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "08E67EF1",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_0217902928244168",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "35BE6EF8",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_5299830558954403"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_5792010627844050",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "71144D52",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_6861019958355476"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_3403213430271600",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "0D161BC5",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_8658300703500507"
					}],
					"id": "id_3797914354222121"
				}, {
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "63745821",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_6504303010000659",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "43DC5EF4",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "324"
							}],
							"c": "expect(tableView.getRepeatHeader().length).toEqual(2);expect(tableView.getRepeatHeader().length).toEqual(2);expect(tableView.getRepeatHeader().length).toEqual(2);expect(tableView.getRepeatHeader().length).toEqual(2);expect(tableView.getRepeatHeader().length).toEqual(2);expect(tableView.getRepeatHeader().length).toEqual(2);"
						}, {
							"t": "p",
							"id": "id_2576724358428314",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "621E6A88",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_6427471845304331"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_6032309419890020",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "02D87733",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_0519095637102790"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_2555816057110203",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "2C6B3758",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_8815129181887753"
					}],
					"id": "id_3904152573260744"
				}, {
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "32875A07",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_8873594369185217",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "11913542",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_1404064361313224"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_0304115538132299",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "2DED10A6",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_8806958473792907"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_9777523655949258",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "5A815E4A",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_1141073765183877"
					}],
					"id": "id_9278379545667925"
				}, {
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "48901BCD",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_5140402032912289",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "531624AD",
							"c": "",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}]
						}],
						"id": "id_3774291174265750"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_2453016780034153",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "6A46484E",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_4890192817682428"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_2715919827376783",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "47EA4969",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_2306098203115529"
					}],
					"id": "id_4334913713602008"
				}],
				"id": "id_002",
				"tblGrid": [{
					"t": "gridCol",
					"w": "142.5000pt"
				}, {
					"t": "gridCol",
					"w": "142.5000pt"
				}, {
					"t": "gridCol",
					"w": "142.5000pt"
				}]
			}, {
				"t": "p",
				"id": "id_0843543650854107",
				"attr_pre": {
					"paraId": "w14"
				},
				"paraId": "7BA65208",
				"rsidP": "000A00EB",
				"rsidR": "00473155",
				"rsidRPr": "00473155",
				"rsidRDefault": "00473155",
				"pPr": {
					"t": "pPr",
					"keepLines": {}
				},
				"fmt": [{
					"t": "r",
					"rt": "rPr",
					"s": "0",
					"l": "0"
				}],
				"c": ""
			}]
		};

		common.tools.DPI.x = 96;
		pe.lotusEditor.relations = new writer.model.Relations({});
		pe.lotusEditor.number = new writer.model.Numbering({});
		pe.lotusEditor.styles = new writer.model.style.Styles({});
		pe.lotusEditor.styles.createCSSStyle();
		pe.lotusEditor.setting = new writer.model.Settings({});
		var edit = {
			editor: pe.lotusEditor
		};
		var undoManager = new writer.plugins.UndoManager(edit);
		undoManager.init();
		pe.lotusEditor.updateManager = new writer.controller.UpdateManager();
		pe.lotusEditor.relations.loadContent();

		pe.scene = {
			coedit: false,
			cursorDecEnabled: false,
			session: {
				createMessage: concord.net.Session.prototype.createMessage,
				sendMessage: function(test, test2) {
					console.log(test);
				},
				isSingleMode: function() {
					return true;
				},
				waitingList: [],
				updateHeaderFooter: function() {}
			}
		};
		pe.lotusEditor.document = new writer.model.Document(jsonData.body, pe.lotusEditor.layoutEngine);
		return pe.lotusEditor.document.byId('id_002');
	};
	var loadTableModel3 = function() {
		var jsonData = {
			"body": [{
				"t": "tbl",
				"tblPr": {
					"tblBorders": {
						"top": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"left": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"bottom": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"right": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"insideH": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						},
						"insideV": {
							"val": "single",
							"color": "000000",
							"sz": "1pt"
						}
					}
				},
				"trs": [{
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "398F0BE0",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_0851525338716191",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "4FB60645",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_0144838118995366"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_8262873416422604",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "05126730",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_0775253494468265"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_2217830134166019",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "13760C38",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_7233663291982540"
					}],
					"id": "id_3025676739845135"
				}, {
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "08E67EF1",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_8048076978439516",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "35BE6EF8",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_8073003829579135"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_0999883896908136",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "71144D52",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_6607847217593942"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_8366894155975413",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "0D161BC5",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_8213849455607482"
					}],
					"id": "id_4354281979136060"
				}, {
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "63745821",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							},
							"vMerge": {
								"val": "restart"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_8561322129286902",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "43DC5EF4",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "324"
							}],
							"c": "expect(tableView.getRepeatHeader().length).toEqual(2);expect(tableView.getRepeatHeader().length).toEqual(2);expect(tableView.getRepeatHeader().length).toEqual(2);expect(tableView.getRepeatHeader().length).toEqual(2);expect(tableView.getRepeatHeader().length).toEqual(2);expect(tableView.getRepeatHeader().length).toEqual(2);"
						}, {
							"t": "p",
							"id": "id_4066829403661130",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "621E6A88",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_2237673642588184"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_4659751639706911",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "02D87733",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_4983566813090931"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							},
							"vMerge": {
								"val": "restart"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_3134143412635152",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "2C6B3758",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_6418889127564030"
					}],
					"id": "id_7821070287045685"
				}, {
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "1C2411E9",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							},
							"vMerge": {},
							"tcBorder": {
								"top": "",
								"left": "",
								"bottom": "",
								"right": ""
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_8772176195992467",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "5C4A4C4B",
							"c": "",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}]
						}],
						"id": "id_7761557491123148"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_2262785012235649",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "584D03E7",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_2383499967169492"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							},
							"vMerge": {},
							"tcBorder": {
								"top": "",
								"left": "",
								"bottom": "",
								"right": ""
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_9255645817742411",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "27274C6C",
							"c": "",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}]
						}],
						"id": "id_8445194333157827"
					}],
					"id": "id_0601745193160294"
				}, {
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "32875A07",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_1930451587659728",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "11913542",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_0754866771872143"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_0852010697854505",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "2DED10A6",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_1228679624208483"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_9808193558706399",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "5A815E4A",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_9446896208242933"
					}],
					"id": "id_7142076301316501"
				}, {
					"t": "tr",
					"attr_pre": {
						"paraId": "w14"
					},
					"paraId": "48901BCD",
					"trPr": {
						"trHeight": "23.4500pt"
					},
					"tcs": [{
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_5921412036002779",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "531624AD",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_7058408923261988"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_7459559667736417",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "6A46484E",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_8371944878977930"
					}, {
						"t": "tc",
						"tcPr": {
							"t": "tcPr",
							"tcW": {
								"w": "2850",
								"type": "dxa"
							}
						},
						"ps": [{
							"t": "p",
							"id": "id_3608727815375509",
							"attr_pre": {
								"paraId": "w14"
							},
							"paraId": "47EA4969",
							"fmt": [{
								"t": "r",
								"rt": "rPr",
								"s": "0",
								"l": "0"
							}],
							"c": ""
						}],
						"id": "id_9280457236484711"
					}],
					"id": "id_2508221257163385"
				}],
				"id": "id_003",
				"tblGrid": [{
					"t": "gridCol",
					"w": "142.5000pt"
				}, {
					"t": "gridCol",
					"w": "142.5000pt"
				}, {
					"t": "gridCol",
					"w": "142.5000pt"
				}]
			}, {
				"t": "p",
				"id": "id_1698252118560933",
				"attr_pre": {
					"paraId": "w14"
				},
				"paraId": "7BA65208",
				"rsidP": "000A00EB",
				"rsidR": "00473155",
				"rsidRPr": "00473155",
				"rsidRDefault": "00473155",
				"pPr": {
					"t": "pPr",
					"keepLines": {}
				},
				"fmt": [{
					"t": "r",
					"rt": "rPr",
					"s": "0",
					"l": "0"
				}],
				"c": ""
			}]
		}

		common.tools.DPI.x = 96;
		pe.lotusEditor.relations = new writer.model.Relations({});
		pe.lotusEditor.number = new writer.model.Numbering({});
		pe.lotusEditor.styles = new writer.model.style.Styles({});
		pe.lotusEditor.styles.createCSSStyle();
		pe.lotusEditor.setting = new writer.model.Settings({});
		var edit = {
			editor: pe.lotusEditor
		};
		var undoManager = new writer.plugins.UndoManager(edit);
		undoManager.init();
		pe.lotusEditor.updateManager = new writer.controller.UpdateManager();
		pe.lotusEditor.relations.loadContent();

		pe.scene = {
			coedit: false,
			cursorDecEnabled: false,
			session: {
				createMessage: concord.net.Session.prototype.createMessage,
				sendMessage: function(test, test2) {
					console.log(test);
				},
				isSingleMode: function() {
					return true;
				},
				waitingList: [],
				updateHeaderFooter: function() {}
			}
		};
		pe.lotusEditor.document = new writer.model.Document(jsonData.body, pe.lotusEditor.layoutEngine);
		return pe.lotusEditor.document.byId('id_003');
	};

	var loadTableView = function(paramodel) {
		var view = paramodel.preLayout("rootView");
		var space = new common.Space(624, 864);
		var textArea = new writer.view.text.TextArea({}, space.clone(), null);
		spyOn(view, "calculateMarginTop").andCallFake(function() {
			return 0;
		});
		view.layout(textArea);
		return view;
	};

	beforeEach(function() {
		loadTableModel();
		spyOn(pe.scene.session, "sendMessage").andCallFake(function(msgList) {
			console.log("@test@->", msgList);
		});
		spyOn(pe.lotusEditor.updateManager, "_updateAllBlockImpl").andCallFake(function() {
			console.log("updateAll");
		});
		// loadParaFourLine();
		// loadParaThreeLine();
		// loadParaFiveLine();
		// loadView();
	});

	afterEach(function() {

	});

	it("layout correct", function() {
		var model = loadTableModel();
		var paraView = loadTableView(model);
		expect(paraView.model).toEqual(model);

	});

	it("getRepeatHeader firstPage", function() {
		var model = loadTableModel();
		var row = model.container.getFirst();
		spyOn(row.rowProperty, "setTblHeaderRepeat").andCallThrough();
		spyOn(row, "markHeadRepeat").andCallThrough();
		spyOn(row.parent, "update").andCallFake(function() {
			//console.log("the update function of row's parent is called")
		});
		model.rows.forEach(function(row) {
			row.setTblHeaderRepeat(true);
			if (row.getRowIdx() == 3)
				return false;
		});
		var tableView = loadTableView(model);
		expect(tableView.getRepeatHeader()).toEqual([]);
		expect(tableView.repeatViewH()).toEqual(0);;
		tableView.repeatHeadDisabled = true;
		expect(tableView.getRepeatHeader()).toEqual([])

	});

	it("getRepeatHeader tablesplited", function() {
		var model = loadTableModel();
		var row = model.container.getFirst();
		spyOn(row.rowProperty, "setTblHeaderRepeat").andCallThrough();
		spyOn(row, "markHeadRepeat").andCallThrough();
		spyOn(row.parent, "update").andCallFake(function() {
			//console.log("the update function of row's parent is called")
		});
		model.rows.forEach(function(row) {
			row.setTblHeaderRepeat(true);
			if (row.getRowIdx() == 1)
				return false;
		});
		var tableView = loadTableView(model);
		var h = 0;
		var repeatH = 0;
		tableView.rows.forEach(function(row) {
			h += row.getBoxHeight();
			if (row.getRowIdx() < 2)
				repeatH += row.getBoxHeight();
			if (row.getRowIdx() == 2)
				return false;
		});
		tableView = tableView.split(548, h);
		expect(tableView.getRepeatHeader().length).toEqual(2);
		expect(tableView.repeatViewH()).toEqual(repeatH);
		var model2 = loadTableModel2();
		var row = model2.container.getFirst();
		spyOn(row.rowProperty, "setTblHeaderRepeat").andCallThrough();
		spyOn(row, "markHeadRepeat").andCallThrough();
		spyOn(row.parent, "update").andCallFake(function() {
			//console.log("the update function of row's parent is called")
		});
		model2.rows.forEach(function(row) {
			row.setTblHeaderRepeat(true);
			if (row.getRowIdx() == 2)
				return false;
		});
		var tableview2 = loadTableView(model2);
		tableview2 = tableview2.split(548, 96, null);
		expect(tableview2.getRepeatHeader()).toEqual([]);

		var model3 = loadTableModel3();
		var row = model3.container.getFirst();
		spyOn(row.rowProperty, "setTblHeaderRepeat").andCallThrough();
		spyOn(row, "markHeadRepeat").andCallThrough();
		spyOn(row.parent, "update").andCallFake(function() {
			//console.log("the update function of row's parent is called")
		});
		model3.rows.forEach(function(row) {
			row.setTblHeaderRepeat(true);
			if (row.getRowIdx() == 2)
				return false;
		});
		var tableview3 = loadTableView(model3);
		tableview3 = tableview3.split(548, 96, null);
		expect(tableview3.getRepeatHeader()).toEqual([]);
	});

	it("Row markHeadRepeat", function() {
		var model = loadTableModel();
		var tableView = loadTableView(model);
		var row = model.container.getFirst();
		row.parent = {
			update: function() {
				console.log("table.update");
			}
		};
		expect(row.isTblHeaderRepeat()).toEqual("none");
		row.setTblHeaderRepeat(true);
		expect(row.markHeadRepeat()).toEqual(true);
	});

	it("canSplit ", function() {
		var model = loadTableModel();
		var row = model.container.getFirst();
		var tableView = loadTableView(model);
		expect(tableView.canSplit(0, 0)).toEqual(true);
		spyOn(row.rowProperty, "setTblHeaderRepeat").andCallThrough();
		spyOn(row, "markHeadRepeat").andCallThrough();
		spyOn(row.parent, "update").andCallFake(function() {
			//console.log("the update function of row's parent is called")
		});
		model.rows.forEach(function(row) {
			row.setTblHeaderRepeat(true);
			if (row.getRowIdx() == 1)
				return false;
		});
		tableView = loadTableView(model);
		var h = 0;
		var reserveHeight = 0;
		var repeatH = 0;
		tableView.rows.forEach(function(row) {
			h += row.getBoxHeight();
			if (row.getRowIdx() < 2)
				repeatH += row.getBoxHeight();
			if (row.getRowIdx() < 3)
				reserveHeight += row.getBoxHeight();
		});
		var body = {
			getHeight: function() {
				return repeatH + 10;
			}
		};
		expect(tableView.canSplit(0, h, body)).toEqual(true);
		var body = {
			getHeight: function() {
				return 100;
			}
		}
		expect(tableView.canSplit(0, repeatH, body)).toEqual(false);
		expect(tableView.canSplit(0, repeatH + 20, body)).toEqual(false);
	});

	it("render  ", function() {
		var model = loadTableModel();

		var row = model.container.getFirst();
		spyOn(row.rowProperty, "setTblHeaderRepeat").andCallThrough();
		spyOn(row, "markHeadRepeat").andCallThrough();
		spyOn(row.parent, "update").andCallFake(function() {
			//console.log("the update function of row's parent is called")
		});
		model.rows.forEach(function(row) {
			row.setTblHeaderRepeat(true);
			if (row.getRowIdx() == 1)
				return false;
		});
		var tableView = loadTableView(model);
		expect(tableView.repeatViewH()).toEqual(0);
		tableView1 = tableView.split(548, 70);
		//spyOn(tableView,"render").andCallThrough();	
		// var secondView = tableView.rows.getFirst();
		expect(tableView1.repeatViewH()).toEqual(0);
		var tableView = loadTableView(model);
		tableView.rows.forEach(function(row) {
			spyOn(row, "render").andCallFake(function() {
				//console.log("row " + this.model.getRowIdx() + " has been rendered")
				var domNode = dojo.create("tr", {
					"class": "row "
				});
				return domNode;
			});
		});
		var firstView = tableView.rows.getFirst();
		tableView2 = tableView.split(548, 100);
		expect(tableView1.repeatViewH()).toEqual(64);
		//expect(secondView).not.toEqual(firstView);
		tableView2.render();
		expect(firstView.render).toHaveBeenCalled();
	});

	it("tableView Update  ", function() {
		var model = loadTableModel();
		var tableView = loadTableView(model);
		var rowModel = model.rows.getFirst();
		var row = tableView.rows.getFirst();
		var parent = tableView.getParent();
		spyOn(rowModel.rowProperty, "setTblHeaderRepeat").andCallThrough();
		spyOn(rowModel, "markHeadRepeat").andCallThrough()
		spyOn(rowModel.parent, "update").andCallFake(function() {
			//console.log("the update function of row's parent is called")
		});
		spyOn(parent, "update").andCallFake(function() {
			//console.log("the update function of table's parent is called")
		});
		tableView.rows.forEach(function(row) {
			spyOn(row, "update").andCallFake(function() {
				//console.log("the update function of row is called")
			});
		});
		spyOn(parent, "notifyUpdate").andCallFake(function() {
			//console.log("notify table's parent")
		});
		tableView.update();
		expect(parent.notifyUpdate).not.toHaveBeenCalled();
		tableView.addChangedView(row);
		tableView._dirtyDOM = false;
		tableView.update();
		expect(parent.notifyUpdate).not.toHaveBeenCalled();
		rowModel.setTblHeaderRepeat(true);
		tableView.update();
		expect(parent.notifyUpdate).toHaveBeenCalled();

	});

	it("Table Tools get Rows in Range  ", function() {
		var model = loadTableModel();
		var first = model.rows.getFirst();
		var last = model.rows.getLast();
		var rows = writer.util.TableTools.getRowsInRange(first, last);
		expect(rows[0]).toEqual(first);
		expect(rows[rows.length - 1]).toEqual(last);
		rows = writer.util.TableTools.getRowsInRange(last, first);
		expect(rows[0]).toEqual(first);
		expect(rows[rows.length - 1]).toEqual(last);

	});

	it("Table plugins getStateBySel not with Repeat ", function() {
		var model = loadTableModel();
		var tableView = loadTableView(model);
		var run = tableView.rows.getFirst().cells.getFirst().container.getFirst().lines.getFirst().container.getFirst();
		var index = 0;
		var row = model.rows.getFirst();
		spyOn(row.rowProperty, "setTblHeaderRepeat").andCallThrough();
		spyOn(row, "markHeadRepeat").andCallThrough()
		spyOn(model, "update").andCallFake(function() {
			//console.log("the update function of row's parent is called")
		});
		spyOn(model, "updateConditonStyle");
		spyOn(row, "setTblHeaderRepeat");
		pe.lotusEditor.getSelection = function() {
			return {
				store: function() {},
				restore: function() {},
				updateHeaderFooter: function() {},
				updateSelection: function() {},
				getRanges: function() {
					var start = {
						'obj': run,
						'index': index
					};
					var end = {
						'obj': run,
						'index': index
					};
					return [
						new writer.core.Range(start, end)
					];
				},
				selectRangesBeforeUpdate: function() {},
				restoreBeforeUpdate: function() {},
			};
		}
		var edit = {
			editor: pe.lotusEditor
		};
		var tablePlugins = new writer.plugins.Table(edit);
		var selection = pe.lotusEditor.getSelection();
		var result = tablePlugins.getStateBySel(selection);
		expect(result.canTable).toEqual(true);
		expect(result.canRepeat).toEqual(true);
		expect(result.repeat).toBeUndefined();
		tablePlugins.repeatHeader([row]);
		expect(model.updateConditonStyle).toHaveBeenCalled();
		expect(row.setTblHeaderRepeat).toHaveBeenCalledWith(true);

	});
	it("Table plugins getStateBySel with Repeat  ", function() {
		var model = loadTableModel();
		var row = model.rows.getFirst();
		spyOn(row.parent, "update").andCallFake(function() {
			//console.log("the update function of row's parent is called")
		});
		model.rows.forEach(function(row) {
			spyOn(row.rowProperty, "setTblHeaderRepeat").andCallThrough();
			spyOn(row, "markHeadRepeat").andCallThrough()
			row.setTblHeaderRepeat(true);
			if (row.getRowIdx == 1)
				return false;
		});
		var tableView = loadTableView(model);
		var run = tableView.rows.getFirst().cells.getFirst().container.getFirst().lines.getFirst().container.getFirst();
		var index = 0;
		pe.lotusEditor.getSelection = function() {
			return {
				store: function() {},
				restore: function() {},
				updateHeaderFooter: function() {},
				updateSelection: function() {},
				getRanges: function() {
					var start = {
						'obj': run,
						'index': index
					};
					var end = {
						'obj': run,
						'index': index
					};
					return [
						new writer.core.Range(start, end)
					];
				},
				selectRangesBeforeUpdate: function() {},
				restoreBeforeUpdate: function() {}
			};
		};
		var edit = {
			editor: pe.lotusEditor
		};
		var tablePlugins = new writer.plugins.Table(edit);
		var selection = pe.lotusEditor.getSelection();
		var result = tablePlugins.getStateBySel(selection);
		expect(result.canTable).toEqual(true);
		expect(result.canRepeat).toEqual(true);
		expect(result.repeat).toEqual(true);

	});

	it("Table plugins repeatHeader", function() {
		var model = loadTableModel();
		var row = model.rows.getFirst();
		var tableView = loadTableView(model);
		var run = tableView.rows.getFirst().cells.getFirst().container.getFirst().lines.getFirst().container.getFirst();
		var index = 0;
		spyOn(model, "update").andCallFake(function() {
			//console.log("the update function of row's parent is called")
		});
		pe.lotusEditor.getShell = function() {

			return {
				getSelection: function() {
					return {
						store: function() {},
						restore: function() {},
						updateSelection: function() {},
						getRanges: function() {
							var start = {
								'obj': run,
								'index': index
							};
							var end = {
								'obj': run,
								'index': index
							};
							return [
								new writer.core.Range(start, end)
							];
						},
						selectRangesBeforeUpdate: function() {},
						updateHeaderFooter: function() {},
						restoreBeforeUpdate: function() {}
					};
				}
			}

		};
		pe.lotusEditor.getSelection = function() {

			return {
				store: function() {},
				restore: function() {},
				updateHeaderFooter: function() {},
				updateSelection: function() {},
				getRanges: function() {
					var start = {
						'obj': run,
						'index': index
					};
					var end = {
						'obj': run,
						'index': index
					};
					return [
						new writer.core.Range(start, end)
					];
				},
				selectRangesBeforeUpdate: function() {},
				restoreBeforeUpdate: function() {}
			};
		};
		pe.lotusEditor.addCommand = function(commandName, commandDef) {
			if (commandName == "repeatHeader")
				pe.lotusEditor._commands[commandName] = new writer.core.Command(pe.lotusEditor, commandDef, commandName);
		};
		var edit = {
			editor: pe.lotusEditor
		};
		var tablePlugins = new writer.plugins.Table(edit);
		//var selection = pe.lotusEditor.getSelection();
		spyOn(tablePlugins, "bindSubMenu").andCallFake(function() {});
		spyOn(tablePlugins, "repeatHeader");
		tablePlugins.init();
		var command = pe.lotusEditor._commands["repeatHeader"];
		command.execute();
		expect(tablePlugins.repeatHeader).toHaveBeenCalled();
	});

});