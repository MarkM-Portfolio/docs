/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2012. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("pres.def.prstShapes");
/**
 * This file is generated from presetShapeDefinitions.xml.
 * To make calculation easily, do some optimization from structure.
 * 1. Generally xml attrs will be transformed as json child and
 *  its key is xml node name except for avLst and gdLst node
 * 2. Ensure path element(moveto, lineto...) sequence.
 * Most of convertor will merge elements with the same node name into an array.
 * Incorrect result will be caused.
 * So need write a convertor to meet above requirements
 */
pres.def.prstShapes = {
	"accentBorderCallout1": {
		"avLst": {
			"adj1": "val 18750",
			"adj2": "val -8333",
			"adj3": "val 112500",
			"adj4": "val -38333"
		},
		"gdLst": {
			"y1": "*/ h adj1 100000",
			"x1": "*/ w adj2 100000",
			"y2": "*/ h adj3 100000",
			"x2": "*/ w adj4 100000"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj2",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj1",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj3",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}]
			}]
		}
	},
	"accentBorderCallout2": {
		"avLst": {
			"adj1": "val 18750",
			"adj2": "val -8333",
			"adj3": "val 18750",
			"adj4": "val -16667",
			"adj5": "val 112500",
			"adj6": "val -46667"
		},
		"gdLst": {
			"y1": "*/ h adj1 100000",
			"x1": "*/ w adj2 100000",
			"y2": "*/ h adj3 100000",
			"x2": "*/ w adj4 100000",
			"y3": "*/ h adj5 100000",
			"x3": "*/ w adj6 100000"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj2",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj1",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj3",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"gdRefX": "adj6",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj5",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x3",
					"y": "y3"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}]
			}]
		}
	},
	"accentBorderCallout3": {
		"avLst": {
			"adj1": "val 18750",
			"adj2": "val -8333",
			"adj3": "val 18750",
			"adj4": "val -16667",
			"adj5": "val 100000",
			"adj6": "val -16667",
			"adj7": "val 112963",
			"adj8": "val -8333"
		},
		"gdLst": {
			"y1": "*/ h adj1 100000",
			"x1": "*/ w adj2 100000",
			"y2": "*/ h adj3 100000",
			"x2": "*/ w adj4 100000",
			"y3": "*/ h adj5 100000",
			"x3": "*/ w adj6 100000",
			"y4": "*/ h adj7 100000",
			"x4": "*/ w adj8 100000"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj2",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj1",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj3",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"gdRefX": "adj6",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj5",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x3",
					"y": "y3"
				}
			}, {
				"gdRefX": "adj8",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj7",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x4",
					"y": "y4"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y4"
						}]
					}
				}]
			}]
		}
	},
	"accentCallout1": {
		"avLst": {
			"adj1": "val 18750",
			"adj2": "val -8333",
			"adj3": "val 112500",
			"adj4": "val -38333"
		},
		"gdLst": {
			"y1": "*/ h adj1 100000",
			"x1": "*/ w adj2 100000",
			"y2": "*/ h adj3 100000",
			"x2": "*/ w adj4 100000"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj2",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj1",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj3",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}]
			}]
		}
	},
	"accentCallout2": {
		"avLst": {
			"adj1": "val 18750",
			"adj2": "val -8333",
			"adj3": "val 18750",
			"adj4": "val -16667",
			"adj5": "val 112500",
			"adj6": "val -46667"
		},
		"gdLst": {
			"y1": "*/ h adj1 100000",
			"x1": "*/ w adj2 100000",
			"y2": "*/ h adj3 100000",
			"x2": "*/ w adj4 100000",
			"y3": "*/ h adj5 100000",
			"x3": "*/ w adj6 100000"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj2",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj1",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj3",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"gdRefX": "adj6",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj5",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x3",
					"y": "y3"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}]
			}]
		}
	},
	"accentCallout3": {
		"avLst": {
			"adj1": "val 18750",
			"adj2": "val -8333",
			"adj3": "val 18750",
			"adj4": "val -16667",
			"adj5": "val 100000",
			"adj6": "val -16667",
			"adj7": "val 112963",
			"adj8": "val -8333"
		},
		"gdLst": {
			"y1": "*/ h adj1 100000",
			"x1": "*/ w adj2 100000",
			"y2": "*/ h adj3 100000",
			"x2": "*/ w adj4 100000",
			"y3": "*/ h adj5 100000",
			"x3": "*/ w adj6 100000",
			"y4": "*/ h adj7 100000",
			"x4": "*/ w adj8 100000"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj2",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj1",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj3",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"gdRefX": "adj6",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj5",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x3",
					"y": "y3"
				}
			}, {
				"gdRefX": "adj8",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj7",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x4",
					"y": "y4"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y4"
						}]
					}
				}]
			}]
		}
	},
	"actionButtonBackPrevious": {
		"gdLst": {
			"dx2": "*/ ss 3 8",
			"g9": "+- vc 0 dx2",
			"g10": "+- vc dx2 0",
			"g11": "+- hc 0 dx2",
			"g12": "+- hc dx2 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darken",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"actionButtonBeginning": {
		"gdLst": {
			"dx2": "*/ ss 3 8",
			"g9": "+- vc 0 dx2",
			"g10": "+- vc dx2 0",
			"g11": "+- hc 0 dx2",
			"g12": "+- hc dx2 0",
			"g13": "*/ ss 3 4",
			"g14": "*/ g13 1 8",
			"g15": "*/ g13 1 4",
			"g16": "+- g11 g14 0",
			"g17": "+- g11 g15 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g17",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g16",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g16",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darken",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g17",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g16",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g16",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g17",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g16",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g16",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g9"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"actionButtonBlank": {
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"actionButtonDocument": {
		"gdLst": {
			"dx2": "*/ ss 3 8",
			"g9": "+- vc 0 dx2",
			"g10": "+- vc dx2 0",
			"dx1": "*/ ss 9 32",
			"g11": "+- hc 0 dx1",
			"g12": "+- hc dx1 0",
			"g13": "*/ ss 3 16",
			"g14": "+- g12 0 g13",
			"g15": "+- g9 g13 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g14",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g15"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darkenLess",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g14",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g14",
							"y": "g15"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g15"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darken",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g14",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g14",
							"y": "g15"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g15"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g14",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g15"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g15"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g14",
							"y": "g15"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g14",
							"y": "g9"
						}]
					}
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"actionButtonEnd": {
		"gdLst": {
			"dx2": "*/ ss 3 8",
			"g9": "+- vc 0 dx2",
			"g10": "+- vc dx2 0",
			"g11": "+- hc 0 dx2",
			"g12": "+- hc dx2 0",
			"g13": "*/ ss 3 4",
			"g14": "*/ g13 3 4",
			"g15": "*/ g13 7 8",
			"g16": "+- g11 g14 0",
			"g17": "+- g11 g15 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g16",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g17",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g17",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darken",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g16",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g17",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g17",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g16",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g9"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g17",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g17",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"actionButtonForwardNext": {
		"gdLst": {
			"dx2": "*/ ss 3 8",
			"g9": "+- vc 0 dx2",
			"g10": "+- vc dx2 0",
			"g11": "+- hc 0 dx2",
			"g12": "+- hc dx2 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darken",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g9"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"actionButtonHelp": {
		"gdLst": {
			"dx2": "*/ ss 3 8",
			"g9": "+- vc 0 dx2",
			"g11": "+- hc 0 dx2",
			"g13": "*/ ss 3 4",
			"g14": "*/ g13 1 7",
			"g15": "*/ g13 3 14",
			"g16": "*/ g13 2 7",
			"g19": "*/ g13 3 7",
			"g20": "*/ g13 4 7",
			"g21": "*/ g13 17 28",
			"g23": "*/ g13 21 28",
			"g24": "*/ g13 11 14",
			"g27": "+- g9 g16 0",
			"g29": "+- g9 g21 0",
			"g30": "+- g9 g23 0",
			"g31": "+- g9 g24 0",
			"g33": "+- g11 g15 0",
			"g36": "+- g11 g19 0",
			"g37": "+- g11 g20 0",
			"g41": "*/ g13 1 14",
			"g42": "*/ g13 3 28"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "g27"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g16",
						"hR": "g16",
						"stAng": "cd2",
						"swAng": "cd2"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g14",
						"hR": "g15",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g41",
						"hR": "g42",
						"stAng": "3cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g37",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g36",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g36",
							"y": "g29"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g14",
						"hR": "g15",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g41",
						"hR": "g42",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g14",
						"hR": "g14",
						"stAng": "0",
						"swAng": "-10800000"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g31"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g42",
						"hR": "g42",
						"stAng": "3cd4",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darken",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "g27"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g16",
						"hR": "g16",
						"stAng": "cd2",
						"swAng": "cd2"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g14",
						"hR": "g15",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g41",
						"hR": "g42",
						"stAng": "3cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g37",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g36",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g36",
							"y": "g29"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g14",
						"hR": "g15",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g41",
						"hR": "g42",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g14",
						"hR": "g14",
						"stAng": "0",
						"swAng": "-10800000"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g31"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g42",
						"hR": "g42",
						"stAng": "3cd4",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "g27"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g16",
						"hR": "g16",
						"stAng": "cd2",
						"swAng": "cd2"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g14",
						"hR": "g15",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g41",
						"hR": "g42",
						"stAng": "3cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g37",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g36",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g36",
							"y": "g29"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g14",
						"hR": "g15",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g41",
						"hR": "g42",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g14",
						"hR": "g14",
						"stAng": "0",
						"swAng": "-10800000"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g31"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g42",
						"hR": "g42",
						"stAng": "3cd4",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"actionButtonHome": {
		"gdLst": {
			"dx2": "*/ ss 3 8",
			"g9": "+- vc 0 dx2",
			"g10": "+- vc dx2 0",
			"g11": "+- hc 0 dx2",
			"g12": "+- hc dx2 0",
			"g13": "*/ ss 3 4",
			"g14": "*/ g13 1 16",
			"g15": "*/ g13 1 8",
			"g16": "*/ g13 3 16",
			"g17": "*/ g13 5 16",
			"g18": "*/ g13 7 16",
			"g19": "*/ g13 9 16",
			"g20": "*/ g13 11 16",
			"g21": "*/ g13 3 4",
			"g22": "*/ g13 13 16",
			"g23": "*/ g13 7 8",
			"g24": "+- g9 g14 0",
			"g25": "+- g9 g16 0",
			"g26": "+- g9 g17 0",
			"g27": "+- g9 g21 0",
			"g28": "+- g11 g15 0",
			"g29": "+- g11 g18 0",
			"g30": "+- g11 g19 0",
			"g31": "+- g11 g20 0",
			"g32": "+- g11 g22 0",
			"g33": "+- g11 g23 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g28",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g28",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g26"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g24"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g31",
							"y": "g24"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g31",
							"y": "g25"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darkenLess",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g26"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g24"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g31",
							"y": "g24"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g31",
							"y": "g25"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g28",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g28",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g29",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g29",
							"y": "g27"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g30",
							"y": "g27"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g30",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "vc"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darken",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "vc"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g29",
							"y": "g27"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g30",
							"y": "g27"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g30",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g29",
							"y": "g10"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g31",
							"y": "g25"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g31",
							"y": "g24"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g24"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g26"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g28",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g28",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "vc"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g31",
							"y": "g25"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g26"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g28",
							"y": "vc"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g29",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g29",
							"y": "g27"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g30",
							"y": "g27"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g30",
							"y": "g10"
						}]
					}
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"actionButtonInformation": {
		"gdLst": {
			"dx2": "*/ ss 3 8",
			"g9": "+- vc 0 dx2",
			"g11": "+- hc 0 dx2",
			"g13": "*/ ss 3 4",
			"g14": "*/ g13 1 32",
			"g17": "*/ g13 5 16",
			"g18": "*/ g13 3 8",
			"g19": "*/ g13 13 32",
			"g20": "*/ g13 19 32",
			"g22": "*/ g13 11 16",
			"g23": "*/ g13 13 16",
			"g24": "*/ g13 7 8",
			"g25": "+- g9 g14 0",
			"g28": "+- g9 g17 0",
			"g29": "+- g9 g18 0",
			"g30": "+- g9 g23 0",
			"g31": "+- g9 g24 0",
			"g32": "+- g11 g17 0",
			"g34": "+- g11 g19 0",
			"g35": "+- g11 g20 0",
			"g37": "+- g11 g22 0",
			"g38": "*/ g13 3 32"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g9"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "dx2",
						"hR": "dx2",
						"stAng": "3cd4",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darken",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g9"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "dx2",
						"hR": "dx2",
						"stAng": "3cd4",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g25"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g38",
						"hR": "g38",
						"stAng": "3cd4",
						"swAng": "21600000"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g28"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g29"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g34",
							"y": "g29"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g34",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g31"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g37",
							"y": "g31"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g37",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g28"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "lighten",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g25"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g38",
						"hR": "g38",
						"stAng": "3cd4",
						"swAng": "21600000"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g28"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g28"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g37",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g37",
							"y": "g31"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g31"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g34",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g34",
							"y": "g29"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g29"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g9"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "dx2",
						"hR": "dx2",
						"stAng": "3cd4",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g25"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g38",
						"hR": "g38",
						"stAng": "3cd4",
						"swAng": "21600000"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g28"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g28"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g37",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g37",
							"y": "g31"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g31"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g34",
							"y": "g30"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g34",
							"y": "g29"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g29"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"actionButtonMovie": {
		"gdLst": {
			"dx2": "*/ ss 3 8",
			"g9": "+- vc 0 dx2",
			"g10": "+- vc dx2 0",
			"g11": "+- hc 0 dx2",
			"g12": "+- hc dx2 0",
			"g13": "*/ ss 3 4",
			"g14": "*/ g13 1455 21600",
			"g15": "*/ g13 1905 21600",
			"g16": "*/ g13 2325 21600",
			"g17": "*/ g13 16155 21600",
			"g18": "*/ g13 17010 21600",
			"g19": "*/ g13 19335 21600",
			"g20": "*/ g13 19725 21600",
			"g21": "*/ g13 20595 21600",
			"g22": "*/ g13 5280 21600",
			"g23": "*/ g13 5730 21600",
			"g24": "*/ g13 6630 21600",
			"g25": "*/ g13 7492 21600",
			"g26": "*/ g13 9067 21600",
			"g27": "*/ g13 9555 21600",
			"g28": "*/ g13 13342 21600",
			"g29": "*/ g13 14580 21600",
			"g30": "*/ g13 15592 21600",
			"g31": "+- g11 g14 0",
			"g32": "+- g11 g15 0",
			"g33": "+- g11 g16 0",
			"g34": "+- g11 g17 0",
			"g35": "+- g11 g18 0",
			"g36": "+- g11 g19 0",
			"g37": "+- g11 g20 0",
			"g38": "+- g11 g21 0",
			"g39": "+- g9 g22 0",
			"g40": "+- g9 g23 0",
			"g41": "+- g9 g24 0",
			"g42": "+- g9 g25 0",
			"g43": "+- g9 g26 0",
			"g44": "+- g9 g27 0",
			"g45": "+- g9 g28 0",
			"g46": "+- g9 g29 0",
			"g47": "+- g9 g30 0",
			"g48": "+- g9 g31 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g39"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g44"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g31",
							"y": "g44"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g43"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "g43"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "g47"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g47"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g45"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g36",
							"y": "g45"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g38",
							"y": "g46"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g46"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g41"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g38",
							"y": "g41"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g37",
							"y": "g42"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g42"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g41"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g34",
							"y": "g40"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g40"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g31",
							"y": "g39"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darken",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g39"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g44"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g31",
							"y": "g44"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g43"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "g43"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "g47"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g47"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g45"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g36",
							"y": "g45"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g38",
							"y": "g46"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g46"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g41"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g38",
							"y": "g41"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g37",
							"y": "g42"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g42"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g41"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g34",
							"y": "g40"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g40"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g31",
							"y": "g39"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g39"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g31",
							"y": "g39"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g40"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g34",
							"y": "g40"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g41"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g42"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g37",
							"y": "g42"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g38",
							"y": "g41"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g41"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g46"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g38",
							"y": "g46"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g36",
							"y": "g45"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g45"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g35",
							"y": "g47"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "g47"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g33",
							"y": "g43"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g32",
							"y": "g43"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g31",
							"y": "g44"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g44"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"actionButtonReturn": {
		"gdLst": {
			"dx2": "*/ ss 3 8",
			"g9": "+- vc 0 dx2",
			"g10": "+- vc dx2 0",
			"g11": "+- hc 0 dx2",
			"g12": "+- hc dx2 0",
			"g13": "*/ ss 3 4",
			"g14": "*/ g13 7 8",
			"g15": "*/ g13 3 4",
			"g16": "*/ g13 5 8",
			"g17": "*/ g13 3 8",
			"g18": "*/ g13 1 4",
			"g19": "+- g9 g15 0",
			"g20": "+- g9 g16 0",
			"g21": "+- g9 g18 0",
			"g22": "+- g11 g14 0",
			"g23": "+- g11 g15 0",
			"g24": "+- g11 g16 0",
			"g25": "+- g11 g17 0",
			"g26": "+- g11 g18 0",
			"g27": "*/ g13 1 8"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g23",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g24",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g24",
							"y": "g20"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g27",
						"hR": "g27",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g25",
							"y": "g19"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g27",
						"hR": "g27",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g26",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g20"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g17",
						"hR": "g17",
						"stAng": "cd2",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g10"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g17",
						"hR": "g17",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g22",
							"y": "g21"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darken",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g23",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g24",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g24",
							"y": "g20"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g27",
						"hR": "g27",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g25",
							"y": "g19"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g27",
						"hR": "g27",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g26",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g20"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g17",
						"hR": "g17",
						"stAng": "cd2",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g10"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g17",
						"hR": "g17",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g22",
							"y": "g21"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g22",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g22",
							"y": "g20"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g17",
						"hR": "g17",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g25",
							"y": "g10"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g17",
						"hR": "g17",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g26",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g26",
							"y": "g20"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g27",
						"hR": "g27",
						"stAng": "cd2",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g19"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g27",
						"hR": "g27",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g24",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g23",
							"y": "g9"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"actionButtonSound": {
		"gdLst": {
			"dx2": "*/ ss 3 8",
			"g9": "+- vc 0 dx2",
			"g10": "+- vc dx2 0",
			"g11": "+- hc 0 dx2",
			"g12": "+- hc dx2 0",
			"g13": "*/ ss 3 4",
			"g14": "*/ g13 1 8",
			"g15": "*/ g13 5 16",
			"g16": "*/ g13 5 8",
			"g17": "*/ g13 11 16",
			"g18": "*/ g13 3 4",
			"g19": "*/ g13 7 8",
			"g20": "+- g9 g14 0",
			"g21": "+- g9 g15 0",
			"g22": "+- g9 g17 0",
			"g23": "+- g9 g19 0",
			"g24": "+- g11 g15 0",
			"g25": "+- g11 g16 0",
			"g26": "+- g11 g18 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g22"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g24",
							"y": "g22"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g25",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g25",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g24",
							"y": "g21"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darken",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g22"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g24",
							"y": "g22"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g25",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g25",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g24",
							"y": "g21"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g24",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g25",
							"y": "g9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g25",
							"y": "g10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g24",
							"y": "g22"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g11",
							"y": "g22"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g26",
							"y": "g21"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g20"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g26",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "vc"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "g26",
							"y": "g22"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "g12",
							"y": "g23"
						}]
					}
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"arc": {
		"avLst": {
			"adj1": "val 16200000",
			"adj2": "val 0"
		},
		"gdLst": {
			"stAng": "pin 0 adj1 21599999",
			"enAng": "pin 0 adj2 21599999",
			"sw11": "+- enAng 0 stAng",
			"sw12": "+- sw11 21600000 0",
			"swAng": "?: sw11 sw11 sw12",
			"wt1": "sin wd2 stAng",
			"ht1": "cos hd2 stAng",
			"dx1": "cat2 wd2 ht1 wt1",
			"dy1": "sat2 hd2 ht1 wt1",
			"wt2": "sin wd2 enAng",
			"ht2": "cos hd2 enAng",
			"dx2": "cat2 wd2 ht2 wt2",
			"dy2": "sat2 hd2 ht2 wt2",
			"x1": "+- hc dx1 0",
			"y1": "+- vc dy1 0",
			"x2": "+- hc dx2 0",
			"y2": "+- vc dy2 0",
			"sw0": "+- 21600000 0 stAng",
			"da1": "+- swAng 0 sw0",
			"g1": "max x1 x2",
			"ir": "?: da1 r g1",
			"sw1": "+- cd4 0 stAng",
			"sw2": "+- 27000000 0 stAng",
			"sw3": "?: sw1 sw1 sw2",
			"da2": "+- swAng 0 sw3",
			"g5": "max y1 y2",
			"ib": "?: da2 b g5",
			"sw4": "+- cd2 0 stAng",
			"sw5": "+- 32400000 0 stAng",
			"sw6": "?: sw4 sw4 sw5",
			"da3": "+- swAng 0 sw6",
			"g9": "min x1 x2",
			"il": "?: da3 l g9",
			"sw7": "+- 3cd4 0 stAng",
			"sw8": "+- 37800000 0 stAng",
			"sw9": "?: sw7 sw7 sw8",
			"da4": "+- swAng 0 sw9",
			"g13": "min y1 y2",
			"it": "?: da4 t g13",
			"cang1": "+- stAng 0 cd4",
			"cang2": "+- enAng cd4 0",
			"cang3": "+/ cang1 cang2 2"
		},
		"ahLst": {
			"ahPolar": [{
				"gdRefAng": "adj1",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefAng": "adj2",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cang1",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"ang": "cang3",
				"pos": {
					"x": "hc",
					"y": "vc"
				}
			}, {
				"ang": "cang2",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "stAng",
						"swAng": "swAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "vc"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "stAng",
						"swAng": "swAng"
					}
				}]
			}]
		}
	},
	"bentArrow": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 25000",
			"adj3": "val 25000",
			"adj4": "val 43750"
		},
		"gdLst": {
			"a2": "pin 0 adj2 50000",
			"maxAdj1": "*/ a2 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"a3": "pin 0 adj3 50000",
			"th": "*/ ss a1 100000",
			"aw2": "*/ ss a2 100000",
			"th2": "*/ th 1 2",
			"dh2": "+- aw2 0 th2",
			"ah": "*/ ss a3 100000",
			"bw": "+- r 0 ah",
			"bh": "+- b 0 dh2",
			"bs": "min bw bh",
			"maxAdj4": "*/ 100000 bs ss",
			"a4": "pin 0 adj4 maxAdj4",
			"bd": "*/ ss a4 100000",
			"bd3": "+- bd 0 th",
			"bd2": "max bd3 0",
			"x3": "+- th bd2 0",
			"x4": "+- r 0 ah",
			"y3": "+- dh2 th 0",
			"y4": "+- y3 dh2 0",
			"y5": "+- dh2 bd 0",
			"y6": "+- y3 bd2 0"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "maxAdj1",
				"pos": {
					"x": "th",
					"y": "b"
				}
			}, {
/*				"gdRefY": "adj2",
				"minY": "0",
				"maxY": "50000",
				"pos": {
					"x": "r",
					"y": "y4"
				}
			}, {
				"gdRefX": "adj3",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x4",
					"y": "t"
				}
			}, {*/
				"gdRefX": "adj4",
				"minX": "0",
				"maxX": "maxAdj4",
				"pos": {
					"x": "bd",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x4",
					"y": "t"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x4",
					"y": "y4"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "th2",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "aw2"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y5"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "bd",
						"hR": "bd",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "dh2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "aw2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "bd2",
						"hR": "bd2",
						"stAng": "3cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "th",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"bentConnector2": {
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}]
			}
		}
	},
	"bentConnector3": {
		"avLst": {
			"adj1": "val 50000"
		},
		"gdLst": {
			"x1": "*/ w adj1 100000"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj1",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}]
			}
		}
	},
	"bentConnector4": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000"
		},
		"gdLst": {
			"x1": "*/ w adj1 100000",
			"x2": "+/ x1 r 2",
			"y2": "*/ h adj2 100000",
			"y1": "+/ t y2 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}]
			}
		}
	},
	"bentConnector5": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000",
			"adj3": "val 50000"
		},
		"gdLst": {
			"x1": "*/ w adj1 100000",
			"x3": "*/ w adj3 100000",
			"x2": "+/ x1 x3 2",
			"y2": "*/ h adj2 100000",
			"y1": "+/ t y2 2",
			"y3": "+/ b y2 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"gdRefX": "adj3",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"pos": {
					"x": "x3",
					"y": "y3"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}]
			}
		}
	},
	"bentUpArrow": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 25000",
			"adj3": "val 25000"
		},
		"gdLst": {
			"a1": "pin 0 adj1 50000",
			"a2": "pin 0 adj2 50000",
			"a3": "pin 0 adj3 50000",
			"y1": "*/ ss a3 100000",
			"dx1": "*/ ss a2 50000",
			"x1": "+- r 0 dx1",
			"dx3": "*/ ss a2 100000",
			"x3": "+- r 0 dx3",
			"dx2": "*/ ss a1 200000",
			"x2": "+- x3 0 dx2",
			"x4": "+- x3 dx2 0",
			"dy2": "*/ ss a1 100000",
			"y2": "+- b 0 dy2",
			"x0": "*/ x4 1 2",
			"y3": "+/ y2 b 2",
			"y15": "+/ y1 b 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "50000",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"gdRefY": "adj3",
				"minY": "0",
				"maxY": "50000",
				"pos": {
					"x": "x2",
					"y": "y1"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x3",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y3"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x0",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "y15"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "y2",
			"r": "x4",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"bevel": {
		"avLst": {
			"adj": "val 12500"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"x1": "*/ ss a 100000",
			"x2": "+- r 0 x1",
			"y2": "+- b 0 x1"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x2",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "y2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "x1"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "x1",
			"r": "x2",
			"b": "y2"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "lightenLess",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "x1"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darkenLess",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "lighten",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darken",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "x1"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "x1"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "x1"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}]
			}]
		}
	},
	"blockArc": {
		"avLst": {
			"adj1": "val 10800000",
			"adj2": "val 0",
			"adj3": "val 25000"
		},
		"gdLst": {
			"stAng": "pin 0 adj1 21599999",
			"istAng": "pin 0 adj2 21599999",
			"a3": "pin 0 adj3 50000",
			"sw11": "+- istAng 0 stAng",
			"sw12": "+- sw11 21600000 0",
			"swAng": "?: sw11 sw11 sw12",
			"iswAng": "+- 0 0 swAng",
			"wt1": "sin wd2 stAng",
			"ht1": "cos hd2 stAng",
			"wt3": "sin wd2 istAng",
			"ht3": "cos hd2 istAng",
			"dx1": "cat2 wd2 ht1 wt1",
			"dy1": "sat2 hd2 ht1 wt1",
			"dx3": "cat2 wd2 ht3 wt3",
			"dy3": "sat2 hd2 ht3 wt3",
			"x1": "+- hc dx1 0",
			"y1": "+- vc dy1 0",
			"x3": "+- hc dx3 0",
			"y3": "+- vc dy3 0",
			"dr": "*/ ss a3 100000",
			"iwd2": "+- wd2 0 dr",
			"ihd2": "+- hd2 0 dr",
			"wt2": "sin iwd2 istAng",
			"ht2": "cos ihd2 istAng",
			"wt4": "sin iwd2 stAng",
			"ht4": "cos ihd2 stAng",
			"dx2": "cat2 iwd2 ht2 wt2",
			"dy2": "sat2 ihd2 ht2 wt2",
			"dx4": "cat2 iwd2 ht4 wt4",
			"dy4": "sat2 ihd2 ht4 wt4",
			"x2": "+- hc dx2 0",
			"y2": "+- vc dy2 0",
			"x4": "+- hc dx4 0",
			"y4": "+- vc dy4 0",
			"sw0": "+- 21600000 0 stAng",
			"da1": "+- swAng 0 sw0",
			"g1": "max x1 x2",
			"g2": "max x3 x4",
			"g3": "max g1 g2",
			"ir": "?: da1 r g3",
			"sw1": "+- cd4 0 stAng",
			"sw2": "+- 27000000 0 stAng",
			"sw3": "?: sw1 sw1 sw2",
			"da2": "+- swAng 0 sw3",
			"g5": "max y1 y2",
			"g6": "max y3 y4",
			"g7": "max g5 g6",
			"ib": "?: da2 b g7",
			"sw4": "+- cd2 0 stAng",
			"sw5": "+- 32400000 0 stAng",
			"sw6": "?: sw4 sw4 sw5",
			"da3": "+- swAng 0 sw6",
			"g9": "min x1 x2",
			"g10": "min x3 x4",
			"g11": "min g9 g10",
			"il": "?: da3 l g11",
			"sw7": "+- 3cd4 0 stAng",
			"sw8": "+- 37800000 0 stAng",
			"sw9": "?: sw7 sw7 sw8",
			"da4": "+- swAng 0 sw9",
			"g13": "min y1 y2",
			"g14": "min y3 y4",
			"g15": "min g13 g14",
			"it": "?: da4 t g15",
			"x5": "+/ x1 x4 2",
			"y5": "+/ y1 y4 2",
			"x6": "+/ x3 x2 2",
			"y6": "+/ y3 y2 2",
			"cang1": "+- stAng 0 cd4",
			"cang2": "+- istAng cd4 0",
			"cang3": "+/ cang1 cang2 2"
		},
		"ahLst": {
			"ahPolar": [{
				"gdRefAng": "adj1",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefR": "adj3",
				"minR": "0",
				"maxR": "50000",
				"gdRefAng": "adj2",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cang1",
				"pos": {
					"x": "x5",
					"y": "y5"
				}
			}, {
				"ang": "cang2",
				"pos": {
					"x": "x6",
					"y": "y6"
				}
			}, {
				"ang": "cang3",
				"pos": {
					"x": "hc",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "stAng",
						"swAng": "swAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "iwd2",
						"hR": "ihd2",
						"stAng": "istAng",
						"swAng": "iswAng"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"borderCallout1": {
		"avLst": {
			"adj1": "val 18750",
			"adj2": "val -8333",
			"adj3": "val 112500",
			"adj4": "val -38333"
		},
		"gdLst": {
			"y1": "*/ h adj1 100000",
			"x1": "*/ w adj2 100000",
			"y2": "*/ h adj3 100000",
			"x2": "*/ w adj4 100000"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj2",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj1",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj3",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}]
			}]
		}
	},
	"borderCallout2": {
		"avLst": {
			"adj1": "val 18750",
			"adj2": "val -8333",
			"adj3": "val 18750",
			"adj4": "val -16667",
			"adj5": "val 112500",
			"adj6": "val -46667"
		},
		"gdLst": {
			"y1": "*/ h adj1 100000",
			"x1": "*/ w adj2 100000",
			"y2": "*/ h adj3 100000",
			"x2": "*/ w adj4 100000",
			"y3": "*/ h adj5 100000",
			"x3": "*/ w adj6 100000"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj2",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj1",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj3",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"gdRefX": "adj6",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj5",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x3",
					"y": "y3"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}]
			}]
		}
	},
	"borderCallout3": {
		"avLst": {
			"adj1": "val 18750",
			"adj2": "val -8333",
			"adj3": "val 18750",
			"adj4": "val -16667",
			"adj5": "val 100000",
			"adj6": "val -16667",
			"adj7": "val 112963",
			"adj8": "val -8333"
		},
		"gdLst": {
			"y1": "*/ h adj1 100000",
			"x1": "*/ w adj2 100000",
			"y2": "*/ h adj3 100000",
			"x2": "*/ w adj4 100000",
			"y3": "*/ h adj5 100000",
			"x3": "*/ w adj6 100000",
			"y4": "*/ h adj7 100000",
			"x4": "*/ w adj8 100000"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj2",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj1",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj3",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"gdRefX": "adj6",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj5",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x3",
					"y": "y3"
				}
			}, {
				"gdRefX": "adj8",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj7",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x4",
					"y": "y4"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y4"
						}]
					}
				}]
			}]
		}
	},
	"bracePair": {
		"avLst": {
			"adj": "val 8333"
		},
		"gdLst": {
			"a": "pin 0 adj 25000",
			"x1": "*/ ss a 100000",
			"x2": "*/ ss a 50000",
			"x3": "+- r 0 x2",
			"x4": "+- r 0 x1",
			"y2": "+- vc 0 x1",
			"y3": "+- vc x1 0",
			"y4": "+- b 0 x1",
			"it": "*/ x1 29289 100000",
			"il": "+- x1 it 0",
			"ir": "+- r 0 il",
			"ib": "+- b 0 it"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "25000",
				"pos": {
					"x": "l",
					"y": "x1"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "il",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "0",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "x1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd2",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "3cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "0",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "x1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd2",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "3cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "0",
						"swAng": "cd4"
					}
				}]
			}]
		}
	},
	"bracketPair": {
		"avLst": {
			"adj": "val 16667"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"x1": "*/ ss a 100000",
			"x2": "+- r 0 x1",
			"y2": "+- b 0 x1",
			"il": "*/ x1 29289 100000",
			"ir": "+- r 0 il",
			"ib": "+- b 0 il"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "50000",
				"pos": {
					"x": "l",
					"y": "x1"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "il",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "x1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "x1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "0",
						"swAng": "cd4"
					}
				}]
			}]
		}
	},
	"callout1": {
		"avLst": {
			"adj1": "val 18750",
			"adj2": "val -8333",
			"adj3": "val 112500",
			"adj4": "val -38333"
		},
		"gdLst": {
			"y1": "*/ h adj1 100000",
			"x1": "*/ w adj2 100000",
			"y2": "*/ h adj3 100000",
			"x2": "*/ w adj4 100000"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj2",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj1",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj3",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}]
			}]
		}
	},
	"callout2": {
		"avLst": {
			"adj1": "val 18750",
			"adj2": "val -8333",
			"adj3": "val 18750",
			"adj4": "val -16667",
			"adj5": "val 112500",
			"adj6": "val -46667"
		},
		"gdLst": {
			"y1": "*/ h adj1 100000",
			"x1": "*/ w adj2 100000",
			"y2": "*/ h adj3 100000",
			"x2": "*/ w adj4 100000",
			"y3": "*/ h adj5 100000",
			"x3": "*/ w adj6 100000"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj2",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj1",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj3",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"gdRefX": "adj6",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj5",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x3",
					"y": "y3"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}]
			}]
		}
	},
	"callout3": {
		"avLst": {
			"adj1": "val 18750",
			"adj2": "val -8333",
			"adj3": "val 18750",
			"adj4": "val -16667",
			"adj5": "val 100000",
			"adj6": "val -16667",
			"adj7": "val 112963",
			"adj8": "val -8333"
		},
		"gdLst": {
			"y1": "*/ h adj1 100000",
			"x1": "*/ w adj2 100000",
			"y2": "*/ h adj3 100000",
			"x2": "*/ w adj4 100000",
			"y3": "*/ h adj5 100000",
			"x3": "*/ w adj6 100000",
			"y4": "*/ h adj7 100000",
			"x4": "*/ w adj8 100000"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj2",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj1",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj3",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"gdRefX": "adj6",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj5",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x3",
					"y": "y3"
				}
			}, {
				"gdRefX": "adj8",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj7",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x4",
					"y": "y4"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y4"
						}]
					}
				}]
			}]
		}
	},
	"can": {
		"avLst": {
			"adj": "val 25000"
		},
		"gdLst": {
			"maxAdj": "*/ 50000 h ss",
			"a": "pin 0 adj maxAdj",
			"y1": "*/ ss a 200000",
			"y2": "+- y1 y1 0",
			"y3": "+- b 0 y1"
		},
/*		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "maxAdj",
				"pos": {
					"x": "hc",
					"y": "y2"
				}
			}
		},*/
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "y2"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "y2",
			"r": "r",
			"b": "y3"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "cd2",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "0",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "lighten",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "cd2",
						"swAng": "cd2"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "0",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "0",
						"swAng": "cd2"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "cd2",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "0",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}]
			}]
		}
	},
	"chartPlus": {
		"pathLst": {
			"path": [{
				"w": "10",
				"h": "10",
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "10"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "5"
						}]
					}
				}]
			}, {
				"w": "10",
				"h": "10",
				"stroke": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "0"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"chartStar": {
		"pathLst": {
			"path": [{
				"w": "10",
				"h": "10",
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "10"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "0"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "10"
						}]
					}
				}]
			}, {
				"w": "10",
				"h": "10",
				"stroke": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "0"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"chartX": {
		"pathLst": {
			"path": [{
				"w": "10",
				"h": "10",
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "10"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "0"
						}]
					}
				}]
			}, {
				"w": "10",
				"h": "10",
				"stroke": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "0"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"chevron": {
		"avLst": {
			"adj": "val 50000"
		},
		"gdLst": {
			"maxAdj": "*/ 100000 w ss",
			"a": "pin 0 adj maxAdj",
			"x1": "*/ ss a 100000",
			"x2": "+- r 0 x1",
			"x3": "*/ x2 1 2",
			"dx": "+- x2 0 x1",
			"il": "?: dx x1 l",
			"ir": "?: dx x2 r"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "maxAdj",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x3",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "t",
			"r": "ir",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "vc"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"chord": {
		"avLst": {
			"adj1": "val 2700000",
			"adj2": "val 16200000"
		},
		"gdLst": {
			"stAng": "pin 0 adj1 21599999",
			"enAng": "pin 0 adj2 21599999",
			"sw1": "+- enAng 0 stAng",
			"sw2": "+- sw1 21600000 0",
			"swAng": "?: sw1 sw1 sw2",
			"wt1": "sin wd2 stAng",
			"ht1": "cos hd2 stAng",
			"dx1": "cat2 wd2 ht1 wt1",
			"dy1": "sat2 hd2 ht1 wt1",
			"wt2": "sin wd2 enAng",
			"ht2": "cos hd2 enAng",
			"dx2": "cat2 wd2 ht2 wt2",
			"dy2": "sat2 hd2 ht2 wt2",
			"x1": "+- hc dx1 0",
			"y1": "+- vc dy1 0",
			"x2": "+- hc dx2 0",
			"y2": "+- vc dy2 0",
			"x3": "+/ x1 x2 2",
			"y3": "+/ y1 y2 2",
			"midAng0": "*/ swAng 1 2",
			"midAng": "+- stAng midAng0 cd2",
			"idx": "cos wd2 2700000",
			"idy": "sin hd2 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"ahLst": {
			"ahPolar": [{
				"gdRefAng": "adj1",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefAng": "adj2",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "stAng",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"ang": "enAng",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"ang": "midAng",
				"pos": {
					"x": "x3",
					"y": "y3"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "stAng",
						"swAng": "swAng"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"circularArrow": {
		"avLst": {
			"adj1": "val 12500",
			"adj2": "val 1142319",
			"adj3": "val 20457681",
			"adj4": "val 10800000",
			"adj5": "val 12500"
		},
		"gdLst": {
			"a5": "pin 0 adj5 25000",
			"maxAdj1": "*/ a5 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"enAng": "pin 1 adj3 21599999",
			"stAng": "pin 0 adj4 21599999",
			"th": "*/ ss a1 100000",
			"thh": "*/ ss a5 100000",
			"th2": "*/ th 1 2",
			"rw1": "+- wd2 th2 thh",
			"rh1": "+- hd2 th2 thh",
			"rw2": "+- rw1 0 th",
			"rh2": "+- rh1 0 th",
			"rw3": "+- rw2 th2 0",
			"rh3": "+- rh2 th2 0",
			"wtH": "sin rw3 enAng",
			"htH": "cos rh3 enAng",
			"dxH": "cat2 rw3 htH wtH",
			"dyH": "sat2 rh3 htH wtH",
			"xH": "+- hc dxH 0",
			"yH": "+- vc dyH 0",
			"rI": "min rw2 rh2",
			"u1": "*/ dxH dxH 1",
			"u2": "*/ dyH dyH 1",
			"u3": "*/ rI rI 1",
			"u4": "+- u1 0 u3",
			"u5": "+- u2 0 u3",
			"u6": "*/ u4 u5 u1",
			"u7": "*/ u6 1 u2",
			"u8": "+- 1 0 u7",
			"u9": "sqrt u8",
			"u10": "*/ u4 1 dxH",
			"u11": "*/ u10 1 dyH",
			"u12": "+/ 1 u9 u11",
			"u13": "at2 1 u12",
			"u14": "+- u13 21600000 0",
			"u15": "?: u13 u13 u14",
			"u16": "+- u15 0 enAng",
			"u17": "+- u16 21600000 0",
			"u18": "?: u16 u16 u17",
			"u19": "+- u18 0 cd2",
			"u20": "+- u18 0 21600000",
			"u21": "?: u19 u20 u18",
			"maxAng": "abs u21",
			"aAng": "pin 0 adj2 maxAng",
			"ptAng": "+- enAng aAng 0",
			"wtA": "sin rw3 ptAng",
			"htA": "cos rh3 ptAng",
			"dxA": "cat2 rw3 htA wtA",
			"dyA": "sat2 rh3 htA wtA",
			"xA": "+- hc dxA 0",
			"yA": "+- vc dyA 0",
			"wtE": "sin rw1 stAng",
			"htE": "cos rh1 stAng",
			"dxE": "cat2 rw1 htE wtE",
			"dyE": "sat2 rh1 htE wtE",
			"xE": "+- hc dxE 0",
			"yE": "+- vc dyE 0",
			"dxG": "cos thh ptAng",
			"dyG": "sin thh ptAng",
			"xG": "+- xH dxG 0",
			"yG": "+- yH dyG 0",
			"dxB": "cos thh ptAng",
			"dyB": "sin thh ptAng",
			"xB": "+- xH 0 dxB 0",
			"yB": "+- yH 0 dyB 0",
			"sx1": "+- xB 0 hc",
			"sy1": "+- yB 0 vc",
			"sx2": "+- xG 0 hc",
			"sy2": "+- yG 0 vc",
			"rO": "min rw1 rh1",
			"x1O": "*/ sx1 rO rw1",
			"y1O": "*/ sy1 rO rh1",
			"x2O": "*/ sx2 rO rw1",
			"y2O": "*/ sy2 rO rh1",
			"dxO": "+- x2O 0 x1O",
			"dyO": "+- y2O 0 y1O",
			"dO": "mod dxO dyO 0",
			"q1": "*/ x1O y2O 1",
			"q2": "*/ x2O y1O 1",
			"DO": "+- q1 0 q2",
			"q3": "*/ rO rO 1",
			"q4": "*/ dO dO 1",
			"q5": "*/ q3 q4 1",
			"q6": "*/ DO DO 1",
			"q7": "+- q5 0 q6",
			"q8": "max q7 0",
			"sdelO": "sqrt q8",
			"ndyO": "*/ dyO -1 1",
			"sdyO": "?: ndyO -1 1",
			"q9": "*/ sdyO dxO 1",
			"q10": "*/ q9 sdelO 1",
			"q11": "*/ DO dyO 1",
			"dxF1": "+/ q11 q10 q4",
			"q12": "+- q11 0 q10",
			"dxF2": "*/ q12 1 q4",
			"adyO": "abs dyO",
			"q13": "*/ adyO sdelO 1",
			"q14": "*/ DO dxO -1",
			"dyF1": "+/ q14 q13 q4",
			"q15": "+- q14 0 q13",
			"dyF2": "*/ q15 1 q4",
			"q16": "+- x2O 0 dxF1",
			"q17": "+- x2O 0 dxF2",
			"q18": "+- y2O 0 dyF1",
			"q19": "+- y2O 0 dyF2",
			"q20": "mod q16 q18 0",
			"q21": "mod q17 q19 0",
			"q22": "+- q21 0 q20",
			"dxF": "?: q22 dxF1 dxF2",
			"dyF": "?: q22 dyF1 dyF2",
			"sdxF": "*/ dxF rw1 rO",
			"sdyF": "*/ dyF rh1 rO",
			"xF": "+- hc sdxF 0",
			"yF": "+- vc sdyF 0",
			"x1I": "*/ sx1 rI rw2",
			"y1I": "*/ sy1 rI rh2",
			"x2I": "*/ sx2 rI rw2",
			"y2I": "*/ sy2 rI rh2",
			"dxI": "+- x2I 0 x1I",
			"dyI": "+- y2I 0 y1I",
			"dI": "mod dxI dyI 0",
			"v1": "*/ x1I y2I 1",
			"v2": "*/ x2I y1I 1",
			"DI": "+- v1 0 v2",
			"v3": "*/ rI rI 1",
			"v4": "*/ dI dI 1",
			"v5": "*/ v3 v4 1",
			"v6": "*/ DI DI 1",
			"v7": "+- v5 0 v6",
			"v8": "max v7 0",
			"sdelI": "sqrt v8",
			"v9": "*/ sdyO dxI 1",
			"v10": "*/ v9 sdelI 1",
			"v11": "*/ DI dyI 1",
			"dxC1": "+/ v11 v10 v4",
			"v12": "+- v11 0 v10",
			"dxC2": "*/ v12 1 v4",
			"adyI": "abs dyI",
			"v13": "*/ adyI sdelI 1",
			"v14": "*/ DI dxI -1",
			"dyC1": "+/ v14 v13 v4",
			"v15": "+- v14 0 v13",
			"dyC2": "*/ v15 1 v4",
			"v16": "+- x1I 0 dxC1",
			"v17": "+- x1I 0 dxC2",
			"v18": "+- y1I 0 dyC1",
			"v19": "+- y1I 0 dyC2",
			"v20": "mod v16 v18 0",
			"v21": "mod v17 v19 0",
			"v22": "+- v21 0 v20",
			"dxC": "?: v22 dxC1 dxC2",
			"dyC": "?: v22 dyC1 dyC2",
			"sdxC": "*/ dxC rw2 rI",
			"sdyC": "*/ dyC rh2 rI",
			"xC": "+- hc sdxC 0",
			"yC": "+- vc sdyC 0",
			"ist0": "at2 sdxC sdyC",
			"ist1": "+- ist0 21600000 0",
			"istAng": "?: ist0 ist0 ist1",
			"isw1": "+- stAng 0 istAng",
			"isw2": "+- isw1 0 21600000",
			"iswAng": "?: isw1 isw2 isw1",
			"p1": "+- xF 0 xC",
			"p2": "+- yF 0 yC",
			"p3": "mod p1 p2 0",
			"p4": "*/ p3 1 2",
			"p5": "+- p4 0 thh",
			"xGp": "?: p5 xF xG",
			"yGp": "?: p5 yF yG",
			"xBp": "?: p5 xC xB",
			"yBp": "?: p5 yC yB",
			"en0": "at2 sdxF sdyF",
			"en1": "+- en0 21600000 0",
			"en2": "?: en0 en0 en1",
			"sw0": "+- en2 0 stAng",
			"sw1": "+- sw0 21600000 0",
			"swAng": "?: sw0 sw0 sw1",
			"wtI": "sin rw3 stAng",
			"htI": "cos rh3 stAng",
			"newdxI": "cat2 rw3 htI wtI",
			"newdyI": "sat2 rh3 htI wtI",
			"xI": "+- hc newdxI 0",
			"yI": "+- vc newdyI 0",
			"aI": "+- stAng 0 cd4",
			"aA": "+- ptAng cd4 0",
			"aB": "+- ptAng cd2 0",
			"idx": "cos rw1 2700000",
			"idy": "sin rh1 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"ahLst": {
			"ahPolar": [{
				"gdRefAng": "adj2",
				"minAng": "0",
				"maxAng": "maxAng",
				"pos": {
					"x": "xA",
					"y": "yA"
				}
			}, {
				"gdRefAng": "adj4",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "xE",
					"y": "yE"
				}
			}, {
				"gdRefR": "adj1",
				"minR": "0",
				"maxR": "maxAdj1",
				"gdRefAng": "adj3",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "xF",
					"y": "yF"
				}
/*			}, {
				"gdRefR": "adj5",
				"minR": "0",
				"maxR": "25000",
				"pos": {
					"x": "xB",
					"y": "yB"
				}*/
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "aI",
				"pos": {
					"x": "xI",
					"y": "yI"
				}
			}, {
				"ang": "ptAng",
				"pos": {
					"x": "xGp",
					"y": "yGp"
				}
			}, {
				"ang": "aA",
				"pos": {
					"x": "xA",
					"y": "yA"
				}
			}, {
				"ang": "aB",
				"pos": {
					"x": "xBp",
					"y": "yBp"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "xE",
							"y": "yE"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "rw1",
						"hR": "rh1",
						"stAng": "stAng",
						"swAng": "swAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xGp",
							"y": "yGp"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xA",
							"y": "yA"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xBp",
							"y": "yBp"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC",
							"y": "yC"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "rw2",
						"hR": "rh2",
						"stAng": "istAng",
						"swAng": "iswAng"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"cloud": {
		"gdLst": {
			"il": "*/ w 2977 21600",
			"it": "*/ h 3262 21600",
			"ir": "*/ w 17087 21600",
			"ib": "*/ h 17337 21600",
			"g27": "*/ w 67 21600",
			"g28": "*/ h 21577 21600",
			"g29": "*/ w 21582 21600",
			"g30": "*/ h 1235 21600"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "g29",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "g28"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "g27",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "g30"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": [{
				"w": "43200",
				"h": "43200",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "3900",
							"y": "14370"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6753",
						"hR": "9190",
						"stAng": "-11429249",
						"swAng": "7426832"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5333",
						"hR": "7267",
						"stAng": "-8646143",
						"swAng": "5396714"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4365",
						"hR": "5945",
						"stAng": "-8748475",
						"swAng": "5983381"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4857",
						"hR": "6595",
						"stAng": "-7859164",
						"swAng": "7034504"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5333",
						"hR": "7273",
						"stAng": "-4722533",
						"swAng": "6541615"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6775",
						"hR": "9220",
						"stAng": "-2776035",
						"swAng": "7816140"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5785",
						"hR": "7867",
						"stAng": "37501",
						"swAng": "6842000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6752",
						"hR": "9215",
						"stAng": "1347096",
						"swAng": "6910353"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "7720",
						"hR": "10543",
						"stAng": "3974558",
						"swAng": "4542661"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4360",
						"hR": "5918",
						"stAng": "-16496525",
						"swAng": "8804134"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4345",
						"hR": "5945",
						"stAng": "-14809710",
						"swAng": "9151131"
					}
				}, {
					"op": "close"
				}]
			}, {
				"w": "43200",
				"h": "43200",
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "4693",
							"y": "26177"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4345",
						"hR": "5945",
						"stAng": "5204520",
						"swAng": "1585770"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "6928",
							"y": "34899"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4360",
						"hR": "5918",
						"stAng": "4416628",
						"swAng": "686848"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "16478",
							"y": "39090"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6752",
						"hR": "9215",
						"stAng": "8257449",
						"swAng": "844866"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "28827",
							"y": "34751"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6752",
						"hR": "9215",
						"stAng": "387196",
						"swAng": "959901"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "34129",
							"y": "22954"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5785",
						"hR": "7867",
						"stAng": "-4217541",
						"swAng": "4255042"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "41798",
							"y": "15354"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5333",
						"hR": "7273",
						"stAng": "1819082",
						"swAng": "1665090"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "38324",
							"y": "5426"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4857",
						"hR": "6595",
						"stAng": "-824660",
						"swAng": "891534"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "29078",
							"y": "3952"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4857",
						"hR": "6595",
						"stAng": "-8950887",
						"swAng": "1091722"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "22141",
							"y": "4720"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4365",
						"hR": "5945",
						"stAng": "-9809656",
						"swAng": "1061181"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "14000",
							"y": "5192"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6753",
						"hR": "9190",
						"stAng": "-4002417",
						"swAng": "739161"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "4127",
							"y": "15789"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6753",
						"hR": "9190",
						"stAng": "9459261",
						"swAng": "711490"
					}
				}]
			}]
		}
	},
	"cloudCallout": {
		"avLst": {
			"adj1": "val -20833",
			"adj2": "val 62500"
		},
		"gdLst": {
			"dxPos": "*/ w adj1 100000",
			"dyPos": "*/ h adj2 100000",
			"xPos": "+- hc dxPos 0",
			"yPos": "+- vc dyPos 0",
			"ht": "cat2 hd2 dxPos dyPos",
			"wt": "sat2 wd2 dxPos dyPos",
			"g2": "cat2 wd2 ht wt",
			"g3": "sat2 hd2 ht wt",
			"g4": "+- hc g2 0",
			"g5": "+- vc g3 0",
			"g6": "+- g4 0 xPos",
			"g7": "+- g5 0 yPos",
			"g8": "mod g6 g7 0",
			"g9": "*/ ss 6600 21600",
			"g10": "+- g8 0 g9",
			"g11": "*/ g10 1 3",
			"g12": "*/ ss 1800 21600",
			"g13": "+- g11 g12 0",
			"g14": "*/ g13 g6 g8",
			"g15": "*/ g13 g7 g8",
			"g16": "+- g14 xPos 0",
			"g17": "+- g15 yPos 0",
			"g18": "*/ ss 4800 21600",
			"g19": "*/ g11 2 1",
			"g20": "+- g18 g19 0",
			"g21": "*/ g20 g6 g8",
			"g22": "*/ g20 g7 g8",
			"g23": "+- g21 xPos 0",
			"g24": "+- g22 yPos 0",
			"g25": "*/ ss 1200 21600",
			"g26": "*/ ss 600 21600",
			"x23": "+- xPos g26 0",
			"x24": "+- g16 g25 0",
			"x25": "+- g23 g12 0",
			"il": "*/ w 2977 21600",
			"it": "*/ h 3262 21600",
			"ir": "*/ w 17087 21600",
			"ib": "*/ h 17337 21600",
			"g27": "*/ w 67 21600",
			"g28": "*/ h 21577 21600",
			"g29": "*/ w 21582 21600",
			"g30": "*/ h 1235 21600",
			"pang": "at2 dxPos dyPos"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj1",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj2",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "xPos",
					"y": "yPos"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd2",
				"pos": {
					"x": "g27",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "g28"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "g29",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "g30"
				}
			}, {
				"ang": "pang",
				"pos": {
					"x": "xPos",
					"y": "yPos"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": [{
				"w": "43200",
				"h": "43200",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "3900",
							"y": "14370"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6753",
						"hR": "9190",
						"stAng": "-11429249",
						"swAng": "7426832"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5333",
						"hR": "7267",
						"stAng": "-8646143",
						"swAng": "5396714"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4365",
						"hR": "5945",
						"stAng": "-8748475",
						"swAng": "5983381"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4857",
						"hR": "6595",
						"stAng": "-7859164",
						"swAng": "7034504"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5333",
						"hR": "7273",
						"stAng": "-4722533",
						"swAng": "6541615"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6775",
						"hR": "9220",
						"stAng": "-2776035",
						"swAng": "7816140"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5785",
						"hR": "7867",
						"stAng": "37501",
						"swAng": "6842000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6752",
						"hR": "9215",
						"stAng": "1347096",
						"swAng": "6910353"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "7720",
						"hR": "10543",
						"stAng": "3974558",
						"swAng": "4542661"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4360",
						"hR": "5918",
						"stAng": "-16496525",
						"swAng": "8804134"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4345",
						"hR": "5945",
						"stAng": "-14809710",
						"swAng": "9151131"
					}
				}, {
					"op": "close"
				}]
			}, {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x23",
							"y": "yPos"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g26",
						"hR": "g26",
						"stAng": "0",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}]
			}, {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x24",
							"y": "g17"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g25",
						"hR": "g25",
						"stAng": "0",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}]
			}, {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x25",
							"y": "g24"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g12",
						"hR": "g12",
						"stAng": "0",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}]
			}, {
				"w": "43200",
				"h": "43200",
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "4693",
							"y": "26177"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4345",
						"hR": "5945",
						"stAng": "5204520",
						"swAng": "1585770"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "6928",
							"y": "34899"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4360",
						"hR": "5918",
						"stAng": "4416628",
						"swAng": "686848"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "16478",
							"y": "39090"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6752",
						"hR": "9215",
						"stAng": "8257449",
						"swAng": "844866"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "28827",
							"y": "34751"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6752",
						"hR": "9215",
						"stAng": "387196",
						"swAng": "959901"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "34129",
							"y": "22954"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5785",
						"hR": "7867",
						"stAng": "-4217541",
						"swAng": "4255042"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "41798",
							"y": "15354"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5333",
						"hR": "7273",
						"stAng": "1819082",
						"swAng": "1665090"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "38324",
							"y": "5426"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4857",
						"hR": "6595",
						"stAng": "-824660",
						"swAng": "891534"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "29078",
							"y": "3952"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4857",
						"hR": "6595",
						"stAng": "-8950887",
						"swAng": "1091722"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "22141",
							"y": "4720"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "4365",
						"hR": "5945",
						"stAng": "-9809656",
						"swAng": "1061181"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "14000",
							"y": "5192"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6753",
						"hR": "9190",
						"stAng": "-4002417",
						"swAng": "739161"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "4127",
							"y": "15789"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "6753",
						"hR": "9190",
						"stAng": "9459261",
						"swAng": "711490"
					}
				}]
			}]
		}
	},
	"corner": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000"
		},
		"gdLst": {
			"maxAdj1": "*/ 100000 h ss",
			"maxAdj2": "*/ 100000 w ss",
			"a1": "pin 0 adj1 maxAdj1",
			"a2": "pin 0 adj2 maxAdj2",
			"x1": "*/ ss a2 100000",
			"dy1": "*/ ss a1 100000",
			"y1": "+- b 0 dy1",
			"cx1": "*/ x1 1 2",
			"cy1": "+/ y1 b 2",
			"d": "+- w 0 h",
			"it": "?: d y1 t",
			"ir": "?: d r x1"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "maxAdj1",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "cy1"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "cx1",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "it",
			"r": "ir",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"cornerTabs": {
		"gdLst": {
			"md": "mod w h 0",
			"dx": "*/ 1 md 20",
			"y1": "+- 0 b dx",
			"x1": "+- 0 r dx"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "dx"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "b"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "dx",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "dx",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x1",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "t"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "dx"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "b"
				}
			}]
		},
		"rect": {
			"l": "dx",
			"t": "dx",
			"r": "x1",
			"b": "y1"
		},
		"pathLst": {
			"path": [{
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "dx",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "dx"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "dx",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "dx"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"cube": {
		"avLst": {
			"adj": "val 25000"
		},
		"gdLst": {
			"a": "pin 0 adj 100000",
			"y1": "*/ ss a 100000",
			"y4": "+- b 0 y1",
			"y2": "*/ y4 1 2",
			"y3": "+/ y1 b 2",
			"x4": "+- r 0 y1",
			"x2": "*/ x4 1 2",
			"x3": "+/ y1 r 2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "100000",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x3",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x2",
					"y": "y1"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y3"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x2",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "y3"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y2"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "y1",
			"r": "x4",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darkenLess",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "lightenLess",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "y1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "y1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "b"
						}]
					}
				}]
			}]
		}
	},
	"curvedConnector2": {
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "wd2",
							"y": "t"
						}, {
							"x": "r",
							"y": "hd2"
						}, {
							"x": "r",
							"y": "b"
						}]
					}
				}]
			}
		}
	},
	"curvedConnector3": {
		"avLst": {
			"adj1": "val 50000"
		},
		"gdLst": {
			"x2": "*/ w adj1 100000",
			"x1": "+/ l x2 2",
			"x3": "+/ r x2 2",
			"y3": "*/ h 3 4"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj1",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"pos": {
					"x": "x2",
					"y": "vc"
				}
			}
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}, {
							"x": "x2",
							"y": "hd4"
						}, {
							"x": "x2",
							"y": "vc"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}, {
							"x": "x3",
							"y": "b"
						}, {
							"x": "r",
							"y": "b"
						}]
					}
				}]
			}
		}
	},
	"curvedConnector4": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000"
		},
		"gdLst": {
			"x2": "*/ w adj1 100000",
			"x1": "+/ l x2 2",
			"x3": "+/ r x2 2",
			"x4": "+/ x2 x3 2",
			"x5": "+/ x3 r 2",
			"y4": "*/ h adj2 100000",
			"y1": "+/ t y4 2",
			"y2": "+/ t y1 2",
			"y3": "+/ y1 y4 2",
			"y5": "+/ b y4 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"pos": {
					"x": "x2",
					"y": "y1"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x3",
					"y": "y4"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}, {
							"x": "x2",
							"y": "y2"
						}, {
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}, {
							"x": "x4",
							"y": "y4"
						}, {
							"x": "x3",
							"y": "y4"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y4"
						}, {
							"x": "r",
							"y": "y5"
						}, {
							"x": "r",
							"y": "b"
						}]
					}
				}]
			}
		}
	},
	"curvedConnector5": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000",
			"adj3": "val 50000"
		},
		"gdLst": {
			"x3": "*/ w adj1 100000",
			"x6": "*/ w adj3 100000",
			"x1": "+/ x3 x6 2",
			"x2": "+/ l x3 2",
			"x4": "+/ x3 x1 2",
			"x5": "+/ x6 x1 2",
			"x7": "+/ x6 r 2",
			"y4": "*/ h adj2 100000",
			"y1": "+/ t y4 2",
			"y2": "+/ t y1 2",
			"y3": "+/ y1 y4 2",
			"y5": "+/ b y4 2",
			"y6": "+/ y5 y4 2",
			"y7": "+/ y5 b 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"pos": {
					"x": "x3",
					"y": "y1"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "x1",
					"y": "y4"
				}
			}, {
				"gdRefX": "adj3",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"pos": {
					"x": "x6",
					"y": "y5"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}, {
							"x": "x3",
							"y": "y2"
						}, {
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}, {
							"x": "x4",
							"y": "y4"
						}, {
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y4"
						}, {
							"x": "x6",
							"y": "y6"
						}, {
							"x": "x6",
							"y": "y5"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y7"
						}, {
							"x": "x7",
							"y": "b"
						}, {
							"x": "r",
							"y": "b"
						}]
					}
				}]
			}
		}
	},
	"curvedDownArrow": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 50000",
			"adj3": "val 25000"
		},
		"gdLst": {
			"maxAdj2": "*/ 50000 w ss",
			"a2": "pin 0 adj2 maxAdj2",
			"a1": "pin 0 adj1 100000",
			"th": "*/ ss a1 100000",
			"aw": "*/ ss a2 100000",
			"q1": "+/ th aw 4",
			"wR": "+- wd2 0 q1",
			"q7": "*/ wR 2 1",
			"q8": "*/ q7 q7 1",
			"q9": "*/ th th 1",
			"q10": "+- q8 0 q9",
			"q11": "sqrt q10",
			"idy": "*/ q11 h q7",
			"maxAdj3": "*/ 100000 idy ss",
			"a3": "pin 0 adj3 maxAdj3",
			"ah": "*/ ss adj3 100000",
			"x3": "+- wR th 0",
			"q2": "*/ h h 1",
			"q3": "*/ ah ah 1",
			"q4": "+- q2 0 q3",
			"q5": "sqrt q4",
			"dx": "*/ q5 wR h",
			"x5": "+- wR dx 0",
			"x7": "+- x3 dx 0",
			"q6": "+- aw 0 th",
			"dh": "*/ q6 1 2",
			"x4": "+- x5 0 dh",
			"x8": "+- x7 dh 0",
			"aw2": "*/ aw 1 2",
			"x6": "+- r 0 aw2",
			"y1": "+- b 0 ah",
			"swAng": "at2 ah dx",
			"mswAng": "+- 0 0 swAng",
			"iy": "+- b 0 idy",
			"ix": "+/ wR x3 2",
			"q12": "*/ th 1 2",
			"dang2": "at2 idy q12",
			"stAng": "+- 3cd4 swAng 0",
			"stAng2": "+- 3cd4 0 dang2",
			"swAng2": "+- dang2 0 cd4",
			"swAng3": "+- cd4 dang2 0"
		},
		"ahLst": {
			"ahXY": [{
/*				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "adj2",
				"pos": {
					"x": "x7",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "x4",
					"y": "b"
				}
			}, {*/
				"gdRefY": "adj3",
				"minY": "0",
				"maxY": "maxAdj3",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "ix",
					"y": "t"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "q12",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x4",
					"y": "y1"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x6",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x8",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "stAng",
						"swAng": "mswAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "3cd4",
						"swAng": "swAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y1"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "darkenLess",
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ix",
							"y": "iy"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "stAng2",
						"swAng": "swAng2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "cd2",
						"swAng": "swAng3"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ix",
							"y": "iy"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "stAng2",
						"swAng": "swAng2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "3cd4",
						"swAng": "swAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "stAng",
						"swAng": "mswAng"
					}
				}]
			}]
		}
	},
	"curvedLeftArrow": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 50000",
			"adj3": "val 25000"
		},
		"gdLst": {
			"maxAdj2": "*/ 50000 h ss",
			"a2": "pin 0 adj2 maxAdj2",
			"a1": "pin 0 adj1 a2",
			"th": "*/ ss a1 100000",
			"aw": "*/ ss a2 100000",
			"q1": "+/ th aw 4",
			"hR": "+- hd2 0 q1",
			"q7": "*/ hR 2 1",
			"q8": "*/ q7 q7 1",
			"q9": "*/ th th 1",
			"q10": "+- q8 0 q9",
			"q11": "sqrt q10",
			"idx": "*/ q11 w q7",
			"maxAdj3": "*/ 100000 idx ss",
			"a3": "pin 0 adj3 maxAdj3",
			"ah": "*/ ss a3 100000",
			"y3": "+- hR th 0",
			"q2": "*/ w w 1",
			"q3": "*/ ah ah 1",
			"q4": "+- q2 0 q3",
			"q5": "sqrt q4",
			"dy": "*/ q5 hR w",
			"y5": "+- hR dy 0",
			"y7": "+- y3 dy 0",
			"q6": "+- aw 0 th",
			"dh": "*/ q6 1 2",
			"y4": "+- y5 0 dh",
			"y8": "+- y7 dh 0",
			"aw2": "*/ aw 1 2",
			"y6": "+- b 0 aw2",
			"x1": "+- l ah 0",
			"swAng": "at2 ah dy",
			"mswAng": "+- 0 0 swAng",
			"ix": "+- l idx 0",
			"iy": "+/ hR y3 2",
			"q12": "*/ th 1 2",
			"dang2": "at2 idx q12",
			"swAng2": "+- dang2 0 swAng",
			"swAng3": "+- swAng dang2 0",
			"stAng3": "+- 0 0 dang2"
		},
		"ahLst": {
			"ahXY": [{
/*				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "a2",
				"pos": {
					"x": "x1",
					"y": "y5"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "0",
				"maxY": "maxAdj2",
				"pos": {
					"x": "r",
					"y": "y4"
				}
			}, {*/
				"gdRefX": "adj3",
				"minX": "0",
				"maxX": "maxAdj3",
				"pos": {
					"x": "x1",
					"y": "b"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "q12"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y4"
				}
			}, {
				"ang": "cd3",
				"pos": {
					"x": "l",
					"y": "y6"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x1",
					"y": "y8"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "iy"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y5"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "swAng",
						"swAng": "swAng2"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "stAng3",
						"swAng": "swAng3"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y8"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "darkenLess",
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "0",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "0",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "0",
						"swAng": "swAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y5"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "swAng",
						"swAng": "swAng2"
					}
				}]
			}]
		}
	},
	"curvedRightArrow": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 50000",
			"adj3": "val 25000"
		},
		"gdLst": {
			"maxAdj2": "*/ 50000 h ss",
			"a2": "pin 0 adj2 maxAdj2",
			"a1": "pin 0 adj1 a2",
			"th": "*/ ss a1 100000",
			"aw": "*/ ss a2 100000",
			"q1": "+/ th aw 4",
			"hR": "+- hd2 0 q1",
			"q7": "*/ hR 2 1",
			"q8": "*/ q7 q7 1",
			"q9": "*/ th th 1",
			"q10": "+- q8 0 q9",
			"q11": "sqrt q10",
			"idx": "*/ q11 w q7",
			"maxAdj3": "*/ 100000 idx ss",
			"a3": "pin 0 adj3 maxAdj3",
			"ah": "*/ ss a3 100000",
			"y3": "+- hR th 0",
			"q2": "*/ w w 1",
			"q3": "*/ ah ah 1",
			"q4": "+- q2 0 q3",
			"q5": "sqrt q4",
			"dy": "*/ q5 hR w",
			"y5": "+- hR dy 0",
			"y7": "+- y3 dy 0",
			"q6": "+- aw 0 th",
			"dh": "*/ q6 1 2",
			"y4": "+- y5 0 dh",
			"y8": "+- y7 dh 0",
			"aw2": "*/ aw 1 2",
			"y6": "+- b 0 aw2",
			"x1": "+- r 0 ah",
			"swAng": "at2 ah dy",
			"stAng": "+- cd2 0 swAng",
			"mswAng": "+- 0 0 swAng",
			"ix": "+- r 0 idx",
			"iy": "+/ hR y3 2",
			"q12": "*/ th 1 2",
			"dang2": "at2 idx q12",
			"swAng2": "+- dang2 0 cd4",
			"swAng3": "+- cd4 dang2 0",
			"stAng3": "+- cd2 0 dang2"
		},
		"ahLst": {
			"ahXY": [{
/*				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "a2",
				"pos": {
					"x": "x1",
					"y": "y5"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "0",
				"maxY": "maxAdj2",
				"pos": {
					"x": "r",
					"y": "y4"
				}
			}, {*/
				"gdRefX": "adj3",
				"minX": "0",
				"maxX": "maxAdj3",
				"pos": {
					"x": "x1",
					"y": "b"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "iy"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x1",
					"y": "y8"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y6"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x1",
					"y": "y4"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "q12"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "hR"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "cd2",
						"swAng": "mswAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y7"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "stAng",
						"swAng": "swAng"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "darkenLess",
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "th"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "swAng2"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "stAng3",
						"swAng": "swAng3"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "hR"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "cd2",
						"swAng": "mswAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y7"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "stAng",
						"swAng": "swAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "hR"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "th"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "swAng2"
					}
				}]
			}]
		}
	},
	"curvedUpArrow": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 50000",
			"adj3": "val 25000"
		},
		"gdLst": {
			"maxAdj2": "*/ 50000 w ss",
			"a2": "pin 0 adj2 maxAdj2",
			"a1": "pin 0 adj1 100000",
			"th": "*/ ss a1 100000",
			"aw": "*/ ss a2 100000",
			"q1": "+/ th aw 4",
			"wR": "+- wd2 0 q1",
			"q7": "*/ wR 2 1",
			"q8": "*/ q7 q7 1",
			"q9": "*/ th th 1",
			"q10": "+- q8 0 q9",
			"q11": "sqrt q10",
			"idy": "*/ q11 h q7",
			"maxAdj3": "*/ 100000 idy ss",
			"a3": "pin 0 adj3 maxAdj3",
			"ah": "*/ ss adj3 100000",
			"x3": "+- wR th 0",
			"q2": "*/ h h 1",
			"q3": "*/ ah ah 1",
			"q4": "+- q2 0 q3",
			"q5": "sqrt q4",
			"dx": "*/ q5 wR h",
			"x5": "+- wR dx 0",
			"x7": "+- x3 dx 0",
			"q6": "+- aw 0 th",
			"dh": "*/ q6 1 2",
			"x4": "+- x5 0 dh",
			"x8": "+- x7 dh 0",
			"aw2": "*/ aw 1 2",
			"x6": "+- r 0 aw2",
			"y1": "+- t ah 0",
			"swAng": "at2 ah dx",
			"mswAng": "+- 0 0 swAng",
			"iy": "+- t idy 0",
			"ix": "+/ wR x3 2",
			"q12": "*/ th 1 2",
			"dang2": "at2 idy q12",
			"swAng2": "+- dang2 0 swAng",
			"mswAng2": "+- 0 0 swAng2",
			"stAng3": "+- cd4 0 swAng",
			"swAng3": "+- swAng dang2 0",
			"stAng2": "+- cd4 0 dang2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "a2",
				"pos": {
					"x": "x7",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "x4",
					"y": "t"
				}
			}, {
				"gdRefY": "adj3",
				"minY": "0",
				"maxY": "maxAdj3",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x6",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x4",
					"y": "y1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "q12",
					"y": "t"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "ix",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x8",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "stAng3",
						"swAng": "swAng3"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "stAng2",
						"swAng": "swAng2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "darkenLess",
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "wR",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "th",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "cd2",
						"swAng": "-5400000"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ix",
							"y": "iy"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "stAng2",
						"swAng": "swAng2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "stAng3",
						"swAng": "swAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "wR",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "th",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "h",
						"stAng": "cd2",
						"swAng": "-5400000"
					}
				}]
			}]
		}
	},
	"decagon": {
		"avLst": {
			"vf": "val 105146"
		},
		"gdLst": {
			"shd2": "*/ hd2 vf 100000",
			"dx1": "cos wd2 2160000",
			"dx2": "cos wd2 4320000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc dx2 0",
			"x4": "+- hc dx1 0",
			"dy1": "sin shd2 4320000",
			"dy2": "sin shd2 2160000",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc 0 dy2",
			"y3": "+- vc dy2 0",
			"y4": "+- vc dy1 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "y2"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "y3"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "y4"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x2",
					"y": "y4"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y3"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y2"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x2",
					"y": "y1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x3",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "y2",
			"r": "x4",
			"b": "y3"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"diagStripe": {
		"avLst": {
			"adj": "val 50000"
		},
		"gdLst": {
			"a": "pin 0 adj 100000",
			"x2": "*/ w a 100000",
			"x1": "*/ x2 1 2",
			"x3": "+/ x2 r 2",
			"y2": "*/ h a 100000",
			"y1": "*/ y2 1 2",
			"y3": "+/ y2 b 2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "100000",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "hc",
					"y": "vc"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y3"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x3",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "x3",
			"b": "y3"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"diamond": {
		"gdLst": {
			"ir": "*/ w 3 4",
			"ib": "*/ h 3 4"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd4",
			"t": "hd4",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"dodecagon": {
		"gdLst": {
			"x1": "*/ w 2894 21600",
			"x2": "*/ w 7906 21600",
			"x3": "*/ w 13694 21600",
			"x4": "*/ w 18706 21600",
			"y1": "*/ h 2894 21600",
			"y2": "*/ h 7906 21600",
			"y3": "*/ h 13694 21600",
			"y4": "*/ h 18706 21600"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "y1"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y2"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y3"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "y4"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x2",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y4"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y3"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x3",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "y1",
			"r": "x4",
			"b": "y4"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y3"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"donut": {
		"avLst": {
			"adj": "val 25000"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"dr": "*/ ss a 100000",
			"iwd2": "+- wd2 0 dr",
			"ihd2": "+- hd2 0 dr",
			"idx": "cos wd2 2700000",
			"idy": "sin hd2 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"ahLst": {
			"ahPolar": {
				"gdRefR": "adj",
				"minR": "0",
				"maxR": "50000",
				"pos": {
					"x": "dr",
					"y": "vc"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "il",
					"y": "it"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "il",
					"y": "ib"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "ir",
					"y": "ib"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "ir",
					"y": "it"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "dr",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "iwd2",
						"hR": "ihd2",
						"stAng": "cd2",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "iwd2",
						"hR": "ihd2",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "iwd2",
						"hR": "ihd2",
						"stAng": "0",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "iwd2",
						"hR": "ihd2",
						"stAng": "3cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"doubleWave": {
		"avLst": {
			"adj1": "val 6250",
			"adj2": "val 0"
		},
		"gdLst": {
			"a1": "pin 0 adj1 12500",
			"a2": "pin -10000 adj2 10000",
			"y1": "*/ h a1 100000",
			"dy2": "*/ y1 10 3",
			"y2": "+- y1 0 dy2",
			"y3": "+- y1 dy2 0",
			"y4": "+- b 0 y1",
			"y5": "+- y4 0 dy2",
			"y6": "+- y4 dy2 0",
			"dx1": "*/ w a2 100000",
			"of2": "*/ w a2 50000",
			"x1": "abs dx1",
			"dx2": "?: of2 0 of2",
			"x2": "+- l 0 dx2",
			"dx8": "?: of2 of2 0",
			"x8": "+- r 0 dx8",
			"dx3": "+/ dx2 x8 6",
			"x3": "+- x2 dx3 0",
			"dx4": "+/ dx2 x8 3",
			"x4": "+- x2 dx4 0",
			"x5": "+/ x2 x8 2",
			"x6": "+- x5 dx3 0",
			"x7": "+/ x6 x8 2",
			"x9": "+- l dx8 0",
			"x15": "+- r dx2 0",
			"x10": "+- x9 dx3 0",
			"x11": "+- x9 dx4 0",
			"x12": "+/ x9 x15 2",
			"x13": "+- x12 dx3 0",
			"x14": "+/ x13 x15 2",
			"x16": "+- r 0 x1",
			"xAdj": "+- hc dx1 0",
			"il": "max x2 x9",
			"ir": "min x8 x15",
			"it": "*/ h a1 50000",
			"ib": "+- b 0 it"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "12500",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "-10000",
				"maxX": "10000",
				"pos": {
					"x": "xAdj",
					"y": "b"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd4",
				"pos": {
					"x": "x12",
					"y": "y1"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x5",
					"y": "y4"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x16",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}, {
							"x": "x4",
							"y": "y3"
						}, {
							"x": "x5",
							"y": "y1"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}, {
							"x": "x7",
							"y": "y3"
						}, {
							"x": "x8",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x15",
							"y": "y4"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x14",
							"y": "y6"
						}, {
							"x": "x13",
							"y": "y5"
						}, {
							"x": "x12",
							"y": "y4"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x11",
							"y": "y6"
						}, {
							"x": "x10",
							"y": "y5"
						}, {
							"x": "x9",
							"y": "y4"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"downArrow": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000"
		},
		"gdLst": {
			"maxAdj2": "*/ 100000 h ss",
			"a1": "pin 0 adj1 100000",
			"a2": "pin 0 adj2 maxAdj2",
			"dy1": "*/ ss a2 100000",
			"y1": "+- b 0 dy1",
			"dx1": "*/ w a1 200000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc dx1 0",
			"dy2": "*/ x1 dy1 wd2",
			"y2": "+- y1 dy2 0"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "100000",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "0",
				"maxY": "maxAdj2",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "t",
			"r": "x2",
			"b": "y2"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"downArrowCallout": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 25000",
			"adj3": "val 25000",
			"adj4": "val 64977"
		},
		"gdLst": {
			"maxAdj2": "*/ 50000 w ss",
			"a2": "pin 0 adj2 maxAdj2",
			"maxAdj1": "*/ a2 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"maxAdj3": "*/ 100000 h ss",
			"a3": "pin 0 adj3 maxAdj3",
			"q2": "*/ a3 ss h",
			"maxAdj4": "+- 100000 0 q2",
			"a4": "pin 0 adj4 maxAdj4",
			"dx1": "*/ ss a2 100000",
			"dx2": "*/ ss a1 200000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc dx2 0",
			"x4": "+- hc dx1 0",
			"dy3": "*/ ss a3 100000",
			"y3": "+- b 0 dy3",
			"y2": "*/ h a4 100000",
			"y1": "*/ y2 1 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "maxAdj1",
				"pos": {
					"x": "x2",
					"y": "y3"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "x1",
					"y": "b"
				}
			}, {
				"gdRefY": "adj3",
				"minY": "0",
				"maxY": "maxAdj3",
				"pos": {
					"x": "r",
					"y": "y3"
				}
			}, {
				"gdRefY": "adj4",
				"minY": "0",
				"maxY": "maxAdj4",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "y2"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"ellipse": {
		"gdLst": {
			"idx": "cos wd2 2700000",
			"idy": "sin hd2 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "il",
					"y": "it"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "il",
					"y": "ib"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "ir",
					"y": "ib"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "ir",
					"y": "it"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"ellipseRibbon": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 50000",
			"adj3": "val 12500"
		},
		"gdLst": {
			"a1": "pin 0 adj1 100000",
			"a2": "pin 25000 adj2 75000",
			"q10": "+- 100000 0 a1",
			"q11": "*/ q10 1 2",
			"q12": "+- a1 0 q11",
			"minAdj3": "max 0 q12",
			"a3": "pin minAdj3 adj3 a1",
			"dx2": "*/ w a2 200000",
			"x2": "+- hc 0 dx2",
			"x3": "+- x2 wd8 0",
			"x4": "+- r 0 x3",
			"x5": "+- r 0 x2",
			"x6": "+- r 0 wd8",
			"dy1": "*/ h a3 100000",
			"f1": "*/ 4 dy1 w",
			"q1": "*/ x3 x3 w",
			"q2": "+- x3 0 q1",
			"y1": "*/ f1 q2 1",
			"cx1": "*/ x3 1 2",
			"cy1": "*/ f1 cx1 1",
			"cx2": "+- r 0 cx1",
			"newq1": "*/ h a1 100000",
			"dy3": "+- newq1 0 dy1",
			"q3": "*/ x2 x2 w",
			"q4": "+- x2 0 q3",
			"q5": "*/ f1 q4 1",
			"y3": "+- q5 dy3 0",
			"q6": "+- dy1 dy3 y3",
			"q7": "+- q6 dy1 0",
			"cy3": "+- q7 dy3 0",
			"rh": "+- b 0 newq1",
			"q8": "*/ dy1 14 16",
			"y2": "+/ q8 rh 2",
			"y5": "+- q5 rh 0",
			"y6": "+- y3 rh 0",
			"cx4": "*/ x2 1 2",
			"q9": "*/ f1 cx4 1",
			"cy4": "+- q9 rh 0",
			"cx5": "+- r 0 cx4",
			"cy6": "+- cy3 rh 0",
			"y7": "+- y1 dy3 0",
			"cy7": "+- newq1 newq1 y7",
			"y8": "+- b 0 dy1"
		},
		"ahLst": {
			"ahXY": [{
/*				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "100000",
				"pos": {
					"x": "hc",
					"y": "q1"
				}
			}, {*/
				"gdRefX": "adj2",
				"minX": "25000",
				"maxX": "75000",
				"pos": {
					"x": "x2",
					"y": "b"
				}
			}, {
				"gdRefY": "adj3",
				"minY": "minAdj3",
				"maxY": "a1",
				"pos": {
					"x": "l",
					"y": "y8"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "q1"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "wd8",
					"y": "y2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x6",
					"y": "y2"
				}
			}]
		},
		"rect": {
			"l": "x2",
			"t": "q1",
			"r": "x5",
			"b": "y6"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx1",
							"y": "cy1"
						}, {
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "cy3"
						}, {
							"x": "x5",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx2",
							"y": "cy1"
						}, {
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "rh"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx5",
							"y": "cy4"
						}, {
							"x": "x5",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y6"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "cy6"
						}, {
							"x": "x2",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y5"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx4",
							"y": "cy4"
						}, {
							"x": "l",
							"y": "rh"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "wd8",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "darkenLess",
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "cy3"
						}, {
							"x": "x5",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y7"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "cy7"
						}, {
							"x": "x3",
							"y": "y7"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx1",
							"y": "cy1"
						}, {
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "cy3"
						}, {
							"x": "x5",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx2",
							"y": "cy1"
						}, {
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "rh"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx5",
							"y": "cy4"
						}, {
							"x": "x5",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y6"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "cy6"
						}, {
							"x": "x2",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y5"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx4",
							"y": "cy4"
						}, {
							"x": "l",
							"y": "rh"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "wd8",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y5"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y7"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}]
			}]
		}
	},
	"ellipseRibbon2": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 50000",
			"adj3": "val 12500"
		},
		"gdLst": {
			"a1": "pin 0 adj1 100000",
			"a2": "pin 25000 adj2 75000",
			"q10": "+- 100000 0 a1",
			"q11": "*/ q10 1 2",
			"q12": "+- a1 0 q11",
			"minAdj3": "max 0 q12",
			"a3": "pin minAdj3 adj3 a1",
			"dx2": "*/ w a2 200000",
			"x2": "+- hc 0 dx2",
			"x3": "+- x2 wd8 0",
			"x4": "+- r 0 x3",
			"x5": "+- r 0 x2",
			"x6": "+- r 0 wd8",
			"dy1": "*/ h a3 100000",
			"f1": "*/ 4 dy1 w",
			"q1": "*/ x3 x3 w",
			"q2": "+- x3 0 q1",
			"u1": "*/ f1 q2 1",
			"y1": "+- b 0 u1",
			"cx1": "*/ x3 1 2",
			"cu1": "*/ f1 cx1 1",
			"cy1": "+- b 0 cu1",
			"cx2": "+- r 0 cx1",
			"newq1": "*/ h a1 100000",
			"dy3": "+- newq1 0 dy1",
			"q3": "*/ x2 x2 w",
			"q4": "+- x2 0 q3",
			"q5": "*/ f1 q4 1",
			"u3": "+- q5 dy3 0",
			"y3": "+- b 0 u3",
			"q6": "+- dy1 dy3 u3",
			"q7": "+- q6 dy1 0",
			"cu3": "+- q7 dy3 0",
			"cy3": "+- b 0 cu3",
			"rh": "+- b 0 newq1",
			"q8": "*/ dy1 14 16",
			"u2": "+/ q8 rh 2",
			"y2": "+- b 0 u2",
			"u5": "+- q5 rh 0",
			"y5": "+- b 0 u5",
			"u6": "+- u3 rh 0",
			"y6": "+- b 0 u6",
			"cx4": "*/ x2 1 2",
			"q9": "*/ f1 cx4 1",
			"cu4": "+- q9 rh 0",
			"cy4": "+- b 0 cu4",
			"cx5": "+- r 0 cx4",
			"cu6": "+- cu3 rh 0",
			"cy6": "+- b 0 cu6",
			"u7": "+- u1 dy3 0",
			"y7": "+- b 0 u7",
			"cu7": "+- newq1 newq1 u7",
			"cy7": "+- b 0 cu7"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "100000",
				"pos": {
					"x": "hc",
					"y": "rh"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "25000",
				"maxX": "100000",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}, {
				"gdRefY": "adj3",
				"minY": "minAdj3",
				"maxY": "a1",
				"pos": {
					"x": "l",
					"y": "dy1"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "wd8",
					"y": "y2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "rh"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x6",
					"y": "y2"
				}
			}]
		},
		"rect": {
			"l": "x2",
			"t": "y6",
			"r": "x5",
			"b": "rh"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx1",
							"y": "cy1"
						}, {
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "cy3"
						}, {
							"x": "x5",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx2",
							"y": "cy1"
						}, {
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "newq1"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx5",
							"y": "cy4"
						}, {
							"x": "x5",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y6"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "cy6"
						}, {
							"x": "x2",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y5"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx4",
							"y": "cy4"
						}, {
							"x": "l",
							"y": "newq1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "wd8",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "darkenLess",
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "cy3"
						}, {
							"x": "x5",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y7"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "cy7"
						}, {
							"x": "x3",
							"y": "y7"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "wd8",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "newq1"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx4",
							"y": "cy4"
						}, {
							"x": "x2",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y6"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "cy6"
						}, {
							"x": "x5",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y5"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx5",
							"y": "cy4"
						}, {
							"x": "r",
							"y": "newq1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx2",
							"y": "cy1"
						}, {
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y3"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "cy3"
						}, {
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "cx1",
							"y": "cy1"
						}, {
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y5"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y3"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y7"
						}]
					}
				}]
			}]
		}
	},
	"flowChartAlternateProcess": {
		"gdLst": {
			"x2": "+- r 0 ssd6",
			"y2": "+- b 0 ssd6",
			"il": "*/ ssd6 29289 100000",
			"ir": "+- r 0 il",
			"ib": "+- b 0 il"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "il",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "ssd6"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ssd6",
						"hR": "ssd6",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ssd6",
						"hR": "ssd6",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ssd6",
						"hR": "ssd6",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ssd6",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ssd6",
						"hR": "ssd6",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartCollate": {
		"gdLst": {
			"ir": "*/ w 3 4",
			"ib": "*/ h 3 4"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}]
		},
		"rect": {
			"l": "wd4",
			"t": "hd4",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"w": "2",
				"h": "2",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2",
							"y": "2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "1"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartConnector": {
		"gdLst": {
			"idx": "cos wd2 2700000",
			"idy": "sin hd2 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "il",
					"y": "it"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "il",
					"y": "ib"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "ir",
					"y": "ib"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "ir",
					"y": "it"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartDecision": {
		"gdLst": {
			"ir": "*/ w 3 4",
			"ib": "*/ h 3 4"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd4",
			"t": "hd4",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"w": "2",
				"h": "2",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartDelay": {
		"gdLst": {
			"idx": "cos wd2 2700000",
			"idy": "sin hd2 2700000",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartDisplay": {
		"gdLst": {
			"x2": "*/ w 5 6"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd6",
			"t": "t",
			"r": "x2",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"w": "6",
				"h": "6",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "0"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "1",
						"hR": "3",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "6"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartDocument": {
		"gdLst": {
			"y1": "*/ h 17322 21600",
			"y2": "*/ h 20172 21600"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "y2"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "y1"
		},
		"pathLst": {
			"path": {
				"w": "21600",
				"h": "21600",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "21600",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "21600",
							"y": "17322"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "10800",
							"y": "17322"
						}, {
							"x": "10800",
							"y": "23922"
						}, {
							"x": "0",
							"y": "20172"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartExtract": {
		"gdLst": {
			"x2": "*/ w 3 4"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "wd4",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x2",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd4",
			"t": "vc",
			"r": "x2",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"w": "2",
				"h": "2",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2",
							"y": "2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartInputOutput": {
		"gdLst": {
			"x3": "*/ w 2 5",
			"x4": "*/ w 3 5",
			"x5": "*/ w 4 5",
			"x6": "*/ w 9 10"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x4",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "wd10",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x6",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd5",
			"t": "t",
			"r": "x5",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"w": "5",
				"h": "5",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "4",
							"y": "5"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartInternalStorage": {
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd8",
			"t": "hd8",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"w": "1",
				"h": "1",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"w": "8",
				"h": "8",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "8"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "8",
							"y": "1"
						}]
					}
				}]
			}, {
				"fill": "none",
				"w": "1",
				"h": "1",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"flowChartMagneticDisk": {
		"gdLst": {
			"y3": "*/ h 5 6"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "hd3"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "hd3",
			"r": "r",
			"b": "y3"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"w": "6",
				"h": "6",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "3",
						"hR": "1",
						"stAng": "cd2",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "6",
							"y": "5"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "3",
						"hR": "1",
						"stAng": "0",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"w": "6",
				"h": "6",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "6",
							"y": "1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "3",
						"hR": "1",
						"stAng": "0",
						"swAng": "cd2"
					}
				}]
			}, {
				"fill": "none",
				"w": "6",
				"h": "6",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "3",
						"hR": "1",
						"stAng": "cd2",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "6",
							"y": "5"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "3",
						"hR": "1",
						"stAng": "0",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"flowChartMagneticDrum": {
		"gdLst": {
			"x2": "*/ w 2 3"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x2",
					"y": "vc"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd6",
			"t": "t",
			"r": "x2",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"w": "6",
				"h": "6",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "0"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "1",
						"hR": "3",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "6"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "1",
						"hR": "3",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"w": "6",
				"h": "6",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "6"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "1",
						"hR": "3",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}]
			}, {
				"fill": "none",
				"w": "6",
				"h": "6",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "0"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "1",
						"hR": "3",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "6"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "1",
						"hR": "3",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"flowChartMagneticTape": {
		"gdLst": {
			"idx": "cos wd2 2700000",
			"idy": "sin hd2 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0",
			"ang1": "at2 w h"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "0",
						"swAng": "ang1"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "ib"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartManualInput": {
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "hd10"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "hd5",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"w": "5",
				"h": "5",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "5"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartManualOperation": {
		"gdLst": {
			"x3": "*/ w 4 5",
			"x4": "*/ w 9 10"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "wd10",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd5",
			"t": "t",
			"r": "x3",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"w": "5",
				"h": "5",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "4",
							"y": "5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "5"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartMerge": {
		"gdLst": {
			"x2": "*/ w 3 4"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "wd4",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x2",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd4",
			"t": "t",
			"r": "x2",
			"b": "vc"
		},
		"pathLst": {
			"path": {
				"w": "2",
				"h": "2",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartMultidocument": {
		"gdLst": {
			"y2": "*/ h 3675 21600",
			"y8": "*/ h 20782 21600",
			"x3": "*/ w 9298 21600",
			"x4": "*/ w 12286 21600",
			"x5": "*/ w 18595 21600"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x4",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "y8"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "y2",
			"r": "x5",
			"b": "y8"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"w": "21600",
				"h": "21600",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "20782"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "9298",
							"y": "23542"
						}, {
							"x": "9298",
							"y": "18022"
						}, {
							"x": "18595",
							"y": "18022"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "18595",
							"y": "3675"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "3675"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "1532",
							"y": "3675"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1532",
							"y": "1815"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "20000",
							"y": "1815"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "20000",
							"y": "16252"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "19298",
							"y": "16252"
						}, {
							"x": "18595",
							"y": "16352"
						}, {
							"x": "18595",
							"y": "16352"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "18595",
							"y": "3675"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "2972",
							"y": "1815"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2972",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "21600",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "21600",
							"y": "14392"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "20800",
							"y": "14392"
						}, {
							"x": "20000",
							"y": "14467"
						}, {
							"x": "20000",
							"y": "14467"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "20000",
							"y": "1815"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"w": "21600",
				"h": "21600",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "3675"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "18595",
							"y": "3675"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "18595",
							"y": "18022"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "9298",
							"y": "18022"
						}, {
							"x": "9298",
							"y": "23542"
						}, {
							"x": "0",
							"y": "20782"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "1532",
							"y": "3675"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1532",
							"y": "1815"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "20000",
							"y": "1815"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "20000",
							"y": "16252"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "19298",
							"y": "16252"
						}, {
							"x": "18595",
							"y": "16352"
						}, {
							"x": "18595",
							"y": "16352"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "2972",
							"y": "1815"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2972",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "21600",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "21600",
							"y": "14392"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "20800",
							"y": "14392"
						}, {
							"x": "20000",
							"y": "14467"
						}, {
							"x": "20000",
							"y": "14467"
						}]
					}
				}]
			}, {
				"stroke": "false",
				"fill": "none",
				"w": "21600",
				"h": "21600",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "20782"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "9298",
							"y": "23542"
						}, {
							"x": "9298",
							"y": "18022"
						}, {
							"x": "18595",
							"y": "18022"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "18595",
							"y": "16352"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "18595",
							"y": "16352"
						}, {
							"x": "19298",
							"y": "16252"
						}, {
							"x": "20000",
							"y": "16252"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "20000",
							"y": "14467"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "20000",
							"y": "14467"
						}, {
							"x": "20800",
							"y": "14392"
						}, {
							"x": "21600",
							"y": "14392"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "21600",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2972",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2972",
							"y": "1815"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1532",
							"y": "1815"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1532",
							"y": "3675"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "3675"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"flowChartOfflineStorage": {
		"gdLst": {
			"x4": "*/ w 3 4"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "wd4",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "wd4",
			"t": "t",
			"r": "x4",
			"b": "vc"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"w": "2",
				"h": "2",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "2"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"w": "5",
				"h": "5",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "2",
							"y": "4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "3",
							"y": "4"
						}]
					}
				}]
			}, {
				"fill": "none",
				"extrusionOk": "true",
				"w": "2",
				"h": "2",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "2"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"flowChartOffpageConnector": {
		"gdLst": {
			"y1": "*/ h 4 5"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "y1"
		},
		"pathLst": {
			"path": {
				"w": "10",
				"h": "10",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "8"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartOnlineStorage": {
		"gdLst": {
			"x2": "*/ w 5 6"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x2",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd6",
			"t": "t",
			"r": "x2",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"w": "6",
				"h": "6",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "6",
							"y": "0"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "1",
						"hR": "3",
						"stAng": "3cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "6"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "1",
						"hR": "3",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartOr": {
		"gdLst": {
			"idx": "cos wd2 2700000",
			"idy": "sin hd2 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "il",
					"y": "it"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "il",
					"y": "ib"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "ir",
					"y": "ib"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "ir",
					"y": "it"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"flowChartPredefinedProcess": {
		"gdLst": {
			"x2": "*/ w 7 8"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd8",
			"t": "t",
			"r": "x2",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"w": "1",
				"h": "1",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"w": "8",
				"h": "8",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "8"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "7",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "7",
							"y": "8"
						}]
					}
				}]
			}, {
				"fill": "none",
				"w": "1",
				"h": "1",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"flowChartPreparation": {
		"gdLst": {
			"x2": "*/ w 4 5"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd5",
			"t": "t",
			"r": "x2",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"w": "10",
				"h": "10",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "8",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10",
							"y": "5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "8",
							"y": "10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2",
							"y": "10"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartProcess": {
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"w": "1",
				"h": "1",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartPunchedCard": {
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "hd5",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"w": "5",
				"h": "5",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5",
							"y": "5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "5"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartPunchedTape": {
		"gdLst": {
			"y2": "*/ h 9 10",
			"ib": "*/ h 4 5"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "hd10"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "y2"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "hd5",
			"r": "r",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"w": "20",
				"h": "20",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5",
						"hR": "2",
						"stAng": "cd2",
						"swAng": "-10800000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5",
						"hR": "2",
						"stAng": "cd2",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "20",
							"y": "18"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5",
						"hR": "2",
						"stAng": "0",
						"swAng": "-10800000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "5",
						"hR": "2",
						"stAng": "0",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"flowChartSort": {
		"gdLst": {
			"ir": "*/ w 3 4",
			"ib": "*/ h 3 4"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd4",
			"t": "hd4",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"w": "2",
				"h": "2",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "2"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"w": "2",
				"h": "2",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2",
							"y": "1"
						}]
					}
				}]
			}, {
				"fill": "none",
				"w": "2",
				"h": "2",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "2",
							"y": "1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1",
							"y": "2"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"flowChartSummingJunction": {
		"gdLst": {
			"idx": "cos wd2 2700000",
			"idy": "sin hd2 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "il",
					"y": "it"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "il",
					"y": "ib"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "ir",
					"y": "ib"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "ir",
					"y": "it"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "il",
							"y": "it"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ir",
							"y": "ib"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ir",
							"y": "it"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "il",
							"y": "ib"
						}]
					}
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"flowChartTerminator": {
		"gdLst": {
			"il": "*/ w 1018 21600",
			"ir": "*/ w 20582 21600",
			"it": "*/ h 3163 21600",
			"ib": "*/ h 18437 21600"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"w": "21600",
				"h": "21600",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "3475",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "18125",
							"y": "0"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "3475",
						"hR": "10800",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "3475",
							"y": "21600"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "3475",
						"hR": "10800",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"foldedCorner": {
		"avLst": {
			"adj": "val 16667"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"dy2": "*/ ss a 100000",
			"dy1": "*/ dy2 1 5",
			"x1": "+- r 0 dy2",
			"x2": "+- x1 dy1 0",
			"y2": "+- b 0 dy2",
			"y1": "+- y2 dy1 0"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x1",
					"y": "b"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "y2"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darkenLess",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}]
			}]
		}
	},
	"frame": {
		"avLst": {
			"adj1": "val 12500"
		},
		"gdLst": {
			"a1": "pin 0 adj1 50000",
			"x1": "*/ ss a1 100000",
			"x4": "+- r 0 x1",
			"y4": "+- b 0 x1"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "x1",
			"r": "x4",
			"b": "y4"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "x1"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"funnel": {
		"gdLst": {
			"d": "*/ ss 1 20",
			"rw2": "+- wd2 0 d",
			"rh2": "+- hd4 0 d",
			"t1": "cos wd2 480000",
			"t2": "sin hd4 480000",
			"da": "at2 t1 t2",
			"2da": "*/ da 2 1",
			"stAng1": "+- cd2 0 da",
			"swAng1": "+- cd2 2da 0",
			"swAng3": "+- cd2 0 2da",
			"rw3": "*/ wd2 1 4",
			"rh3": "*/ hd4 1 4",
			"ct1": "cos hd4 stAng1",
			"st1": "sin wd2 stAng1",
			"m1": "mod ct1 st1 0",
			"n1": "*/ wd2 hd4 m1",
			"dx1": "cos n1 stAng1",
			"dy1": "sin n1 stAng1",
			"x1": "+- hc dx1 0",
			"y1": "+- hd4 dy1 0",
			"ct3": "cos rh3 da",
			"st3": "sin rw3 da",
			"m3": "mod ct3 st3 0",
			"n3": "*/ rw3 rh3 m3",
			"dx3": "cos n3 da",
			"dy3": "sin n3 da",
			"x3": "+- hc dx3 0",
			"vc3": "+- b 0 rh3",
			"y2": "+- vc3 dy3 0",
			"x2": "+- wd2 0 rw2",
			"cd": "*/ cd2 2 1"
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "hd4",
						"wR": "wd2",
						"stAng": "stAng1",
						"swAng": "swAng1"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh3",
						"wR": "rw3",
						"stAng": "da",
						"swAng": "swAng3"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "hd4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh2",
						"wR": "rw2",
						"stAng": "cd2",
						"swAng": "-21600000"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"gear6": {
		"avLst": {
			"adj1": "val 15000",
			"adj2": "val 3526"
		},
		"gdLst": {
			"a1": "pin 0 adj1 20000",
			"a2": "pin 0 adj2 5358",
			"th": "*/ ss a1 100000",
			"lFD": "*/ ss a2 100000",
			"th2": "*/ th 1 2",
			"l2": "*/ lFD 1 2",
			"l3": "+- th2 l2 0",
			"rh": "+- hd2 0 th",
			"rw": "+- wd2 0 th",
			"dr": "+- rw 0 rh",
			"maxr": "?: dr rh rw",
			"ha": "at2 maxr l3",
			"aA1": "+- 19800000 0 ha",
			"aD1": "+- 19800000 ha 0",
			"ta11": "cos rw aA1",
			"ta12": "sin rh aA1",
			"bA1": "at2 ta11 ta12",
			"cta1": "cos rh bA1",
			"sta1": "sin rw bA1",
			"ma1": "mod cta1 sta1 0",
			"na1": "*/ rw rh ma1",
			"dxa1": "cos na1 bA1",
			"dya1": "sin na1 bA1",
			"xA1": "+- hc dxa1 0",
			"yA1": "+- vc dya1 0",
			"td11": "cos rw aD1",
			"td12": "sin rh aD1",
			"bD1": "at2 td11 td12",
			"ctd1": "cos rh bD1",
			"std1": "sin rw bD1",
			"md1": "mod ctd1 std1 0",
			"nd1": "*/ rw rh md1",
			"dxd1": "cos nd1 bD1",
			"dyd1": "sin nd1 bD1",
			"xD1": "+- hc dxd1 0",
			"yD1": "+- vc dyd1 0",
			"xAD1": "+- xA1 0 xD1",
			"yAD1": "+- yA1 0 yD1",
			"lAD1": "mod xAD1 yAD1 0",
			"newa1": "at2 yAD1 xAD1",
			"dxF1": "sin lFD newa1",
			"dyF1": "cos lFD newa1",
			"xF1": "+- xD1 dxF1 0",
			"yF1": "+- yD1 dyF1 0",
			"xE1": "+- xA1 0 dxF1",
			"yE1": "+- yA1 0 dyF1",
			"yC1t": "sin th newa1",
			"xC1t": "cos th newa1",
			"yC1": "+- yF1 yC1t 0",
			"xC1": "+- xF1 0 xC1t",
			"yB1": "+- yE1 yC1t 0",
			"xB1": "+- xE1 0 xC1t",
			"aD6": "+- 3cd4 ha 0",
			"td61": "cos rw aD6",
			"td62": "sin rh aD6",
			"bD6": "at2 td61 td62",
			"ctd6": "cos rh bD6",
			"std6": "sin rw bD6",
			"md6": "mod ctd6 std6 0",
			"nd6": "*/ rw rh md6",
			"dxd6": "cos nd6 bD6",
			"dyd6": "sin nd6 bD6",
			"xD6": "+- hc dxd6 0",
			"yD6": "+- vc dyd6 0",
			"xA6": "+- hc 0 dxd6",
			"xF6": "+- xD6 0 lFD",
			"xE6": "+- xA6 lFD 0",
			"yC6": "+- yD6 0 th",
			"swAng1": "+- bA1 0 bD6",
			"aA2": "+- 1800000 0 ha",
			"aD2": "+- 1800000 ha 0",
			"ta21": "cos rw aA2",
			"ta22": "sin rh aA2",
			"bA2": "at2 ta21 ta22",
			"yA2": "+- h 0 yD1",
			"td21": "cos rw aD2",
			"td22": "sin rh aD2",
			"bD2": "at2 td21 td22",
			"yD2": "+- h 0 yA1",
			"yC2": "+- h 0 yB1",
			"yB2": "+- h 0 yC1",
			"xB2": "val xC1",
			"swAng2": "+- bA2 0 bD1",
			"aD3": "+- cd4 ha 0",
			"td31": "cos rw aD3",
			"td32": "sin rh aD3",
			"bD3": "at2 td31 td32",
			"yD3": "+- h 0 yD6",
			"yB3": "+- h 0 yC6",
			"aD4": "+- 9000000 ha 0",
			"td41": "cos rw aD4",
			"td42": "sin rh aD4",
			"bD4": "at2 td41 td42",
			"xD4": "+- w 0 xD1",
			"xC4": "+- w 0 xC1",
			"xB4": "+- w 0 xB1",
			"aD5": "+- 12600000 ha 0",
			"td51": "cos rw aD5",
			"td52": "sin rh aD5",
			"bD5": "at2 td51 td52",
			"xD5": "+- w 0 xA1",
			"xC5": "+- w 0 xB1",
			"xB5": "+- w 0 xC1",
			"xCxn1": "+/ xB1 xC1 2",
			"yCxn1": "+/ yB1 yC1 2",
			"yCxn2": "+- b 0 yCxn1",
			"xCxn4": "+/ r 0 xCxn1"
		},
/*		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "20000",
				"pos": {
					"x": "xD6",
					"y": "yD6"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "5358",
				"pos": {
					"x": "xA6",
					"y": "yD6"
				}
			}]
		},*/
		"cxnLst": {
			"cxn": [{
				"ang": "19800000",
				"pos": {
					"x": "xCxn1",
					"y": "yCxn1"
				}
			}, {
				"ang": "1800000",
				"pos": {
					"x": "xCxn1",
					"y": "yCxn2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "yB3"
				}
			}, {
				"ang": "9000000",
				"pos": {
					"x": "xCxn4",
					"y": "yCxn2"
				}
			}, {
				"ang": "12600000",
				"pos": {
					"x": "xCxn4",
					"y": "yCxn1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "yC6"
				}
			}]
		},
		"rect": {
			"l": "xD5",
			"t": "yA1",
			"r": "xA1",
			"b": "yD2"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "xA1",
							"y": "yA1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB1",
							"y": "yB1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC1",
							"y": "yC1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD1",
							"y": "yD1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD1",
						"swAng": "swAng2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC1",
							"y": "yB2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB1",
							"y": "yC2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xA1",
							"y": "yD2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD2",
						"swAng": "swAng1"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xF6",
							"y": "yB3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xE6",
							"y": "yB3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xA6",
							"y": "yD3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD3",
						"swAng": "swAng1"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB4",
							"y": "yC2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC4",
							"y": "yB2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD4",
							"y": "yA2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD4",
						"swAng": "swAng2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB5",
							"y": "yC1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC5",
							"y": "yB1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD5",
							"y": "yA1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD5",
						"swAng": "swAng1"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xE6",
							"y": "yC6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xF6",
							"y": "yC6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD6",
							"y": "yD6"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD6",
						"swAng": "swAng1"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"gear9": {
		"avLst": {
			"adj1": "val 10000",
			"adj2": "val 1763"
		},
		"gdLst": {
			"a1": "pin 0 adj1 20000",
			"a2": "pin 0 adj2 2679",
			"th": "*/ ss a1 100000",
			"lFD": "*/ ss a2 100000",
			"th2": "*/ th 1 2",
			"l2": "*/ lFD 1 2",
			"l3": "+- th2 l2 0",
			"rh": "+- hd2 0 th",
			"rw": "+- wd2 0 th",
			"dr": "+- rw 0 rh",
			"maxr": "?: dr rh rw",
			"ha": "at2 maxr l3",
			"aA1": "+- 18600000 0 ha",
			"aD1": "+- 18600000 ha 0",
			"ta11": "cos rw aA1",
			"ta12": "sin rh aA1",
			"bA1": "at2 ta11 ta12",
			"cta1": "cos rh bA1",
			"sta1": "sin rw bA1",
			"ma1": "mod cta1 sta1 0",
			"na1": "*/ rw rh ma1",
			"dxa1": "cos na1 bA1",
			"dya1": "sin na1 bA1",
			"xA1": "+- hc dxa1 0",
			"yA1": "+- vc dya1 0",
			"td11": "cos rw aD1",
			"td12": "sin rh aD1",
			"bD1": "at2 td11 td12",
			"ctd1": "cos rh bD1",
			"std1": "sin rw bD1",
			"md1": "mod ctd1 std1 0",
			"nd1": "*/ rw rh md1",
			"dxd1": "cos nd1 bD1",
			"dyd1": "sin nd1 bD1",
			"xD1": "+- hc dxd1 0",
			"yD1": "+- vc dyd1 0",
			"xAD1": "+- xA1 0 xD1",
			"yAD1": "+- yA1 0 yD1",
			"lAD1": "mod xAD1 yAD1 0",
			"newa1": "at2 yAD1 xAD1",
			"dxF1": "sin lFD newa1",
			"dyF1": "cos lFD newa1",
			"xF1": "+- xD1 dxF1 0",
			"yF1": "+- yD1 dyF1 0",
			"xE1": "+- xA1 0 dxF1",
			"yE1": "+- yA1 0 dyF1",
			"yC1t": "sin th newa1",
			"xC1t": "cos th newa1",
			"yC1": "+- yF1 yC1t 0",
			"xC1": "+- xF1 0 xC1t",
			"yB1": "+- yE1 yC1t 0",
			"xB1": "+- xE1 0 xC1t",
			"aA2": "+- 21000000 0 ha",
			"aD2": "+- 21000000 ha 0",
			"ta21": "cos rw aA2",
			"ta22": "sin rh aA2",
			"bA2": "at2 ta21 ta22",
			"cta2": "cos rh bA2",
			"sta2": "sin rw bA2",
			"ma2": "mod cta2 sta2 0",
			"na2": "*/ rw rh ma2",
			"dxa2": "cos na2 bA2",
			"dya2": "sin na2 bA2",
			"xA2": "+- hc dxa2 0",
			"yA2": "+- vc dya2 0",
			"td21": "cos rw aD2",
			"td22": "sin rh aD2",
			"bD2": "at2 td21 td22",
			"ctd2": "cos rh bD2",
			"std2": "sin rw bD2",
			"md2": "mod ctd2 std2 0",
			"nd2": "*/ rw rh md2",
			"dxd2": "cos nd2 bD2",
			"dyd2": "sin nd2 bD2",
			"xD2": "+- hc dxd2 0",
			"yD2": "+- vc dyd2 0",
			"xAD2": "+- xA2 0 xD2",
			"yAD2": "+- yA2 0 yD2",
			"lAD2": "mod xAD2 yAD2 0",
			"newa2": "at2 yAD2 xAD2",
			"dxF2": "sin lFD newa2",
			"dyF2": "cos lFD newa2",
			"xF2": "+- xD2 dxF2 0",
			"yF2": "+- yD2 dyF2 0",
			"xE2": "+- xA2 0 dxF2",
			"yE2": "+- yA2 0 dyF2",
			"yC2t": "sin th newa2",
			"xC2t": "cos th newa2",
			"yC2": "+- yF2 yC2t 0",
			"xC2": "+- xF2 0 xC2t",
			"yB2": "+- yE2 yC2t 0",
			"xB2": "+- xE2 0 xC2t",
			"swAng1": "+- bA2 0 bD1",
			"aA3": "+- 1800000 0 ha",
			"aD3": "+- 1800000 ha 0",
			"ta31": "cos rw aA3",
			"ta32": "sin rh aA3",
			"bA3": "at2 ta31 ta32",
			"cta3": "cos rh bA3",
			"sta3": "sin rw bA3",
			"ma3": "mod cta3 sta3 0",
			"na3": "*/ rw rh ma3",
			"dxa3": "cos na3 bA3",
			"dya3": "sin na3 bA3",
			"xA3": "+- hc dxa3 0",
			"yA3": "+- vc dya3 0",
			"td31": "cos rw aD3",
			"td32": "sin rh aD3",
			"bD3": "at2 td31 td32",
			"ctd3": "cos rh bD3",
			"std3": "sin rw bD3",
			"md3": "mod ctd3 std3 0",
			"nd3": "*/ rw rh md3",
			"dxd3": "cos nd3 bD3",
			"dyd3": "sin nd3 bD3",
			"xD3": "+- hc dxd3 0",
			"yD3": "+- vc dyd3 0",
			"xAD3": "+- xA3 0 xD3",
			"yAD3": "+- yA3 0 yD3",
			"lAD3": "mod xAD3 yAD3 0",
			"a3": "at2 yAD3 xAD3",
			"dxF3": "sin lFD a3",
			"dyF3": "cos lFD a3",
			"xF3": "+- xD3 dxF3 0",
			"yF3": "+- yD3 dyF3 0",
			"xE3": "+- xA3 0 dxF3",
			"yE3": "+- yA3 0 dyF3",
			"yC3t": "sin th a3",
			"xC3t": "cos th a3",
			"yC3": "+- yF3 yC3t 0",
			"xC3": "+- xF3 0 xC3t",
			"yB3": "+- yE3 yC3t 0",
			"xB3": "+- xE3 0 xC3t",
			"swAng2": "+- bA3 0 bD2",
			"aA4": "+- 4200000 0 ha",
			"aD4": "+- 4200000 ha 0",
			"ta41": "cos rw aA4",
			"ta42": "sin rh aA4",
			"bA4": "at2 ta41 ta42",
			"cta4": "cos rh bA4",
			"sta4": "sin rw bA4",
			"ma4": "mod cta4 sta4 0",
			"na4": "*/ rw rh ma4",
			"dxa4": "cos na4 bA4",
			"dya4": "sin na4 bA4",
			"xA4": "+- hc dxa4 0",
			"yA4": "+- vc dya4 0",
			"td41": "cos rw aD4",
			"td42": "sin rh aD4",
			"bD4": "at2 td41 td42",
			"ctd4": "cos rh bD4",
			"std4": "sin rw bD4",
			"md4": "mod ctd4 std4 0",
			"nd4": "*/ rw rh md4",
			"dxd4": "cos nd4 bD4",
			"dyd4": "sin nd4 bD4",
			"xD4": "+- hc dxd4 0",
			"yD4": "+- vc dyd4 0",
			"xAD4": "+- xA4 0 xD4",
			"yAD4": "+- yA4 0 yD4",
			"lAD4": "mod xAD4 yAD4 0",
			"a4": "at2 yAD4 xAD4",
			"dxF4": "sin lFD a4",
			"dyF4": "cos lFD a4",
			"xF4": "+- xD4 dxF4 0",
			"yF4": "+- yD4 dyF4 0",
			"xE4": "+- xA4 0 dxF4",
			"yE4": "+- yA4 0 dyF4",
			"yC4t": "sin th a4",
			"xC4t": "cos th a4",
			"yC4": "+- yF4 yC4t 0",
			"xC4": "+- xF4 0 xC4t",
			"yB4": "+- yE4 yC4t 0",
			"xB4": "+- xE4 0 xC4t",
			"swAng3": "+- bA4 0 bD3",
			"aA5": "+- 6600000 0 ha",
			"aD5": "+- 6600000 ha 0",
			"ta51": "cos rw aA5",
			"ta52": "sin rh aA5",
			"bA5": "at2 ta51 ta52",
			"td51": "cos rw aD5",
			"td52": "sin rh aD5",
			"bD5": "at2 td51 td52",
			"xD5": "+- w 0 xA4",
			"xC5": "+- w 0 xB4",
			"xB5": "+- w 0 xC4",
			"swAng4": "+- bA5 0 bD4",
			"aD6": "+- 9000000 ha 0",
			"td61": "cos rw aD6",
			"td62": "sin rh aD6",
			"bD6": "at2 td61 td62",
			"xD6": "+- w 0 xA3",
			"xC6": "+- w 0 xB3",
			"xB6": "+- w 0 xC3",
			"aD7": "+- 11400000 ha 0",
			"td71": "cos rw aD7",
			"td72": "sin rh aD7",
			"bD7": "at2 td71 td72",
			"xD7": "+- w 0 xA2",
			"xC7": "+- w 0 xB2",
			"xB7": "+- w 0 xC2",
			"aD8": "+- 13800000 ha 0",
			"td81": "cos rw aD8",
			"td82": "sin rh aD8",
			"bD8": "at2 td81 td82",
			"xA8": "+- w 0 xD1",
			"xD8": "+- w 0 xA1",
			"xC8": "+- w 0 xB1",
			"xB8": "+- w 0 xC1",
			"aA9": "+- 3cd4 0 ha",
			"aD9": "+- 3cd4 ha 0",
			"td91": "cos rw aD9",
			"td92": "sin rh aD9",
			"bD9": "at2 td91 td92",
			"ctd9": "cos rh bD9",
			"std9": "sin rw bD9",
			"md9": "mod ctd9 std9 0",
			"nd9": "*/ rw rh md9",
			"dxd9": "cos nd9 bD9",
			"dyd9": "sin nd9 bD9",
			"xD9": "+- hc dxd9 0",
			"yD9": "+- vc dyd9 0",
			"ta91": "cos rw aA9",
			"ta92": "sin rh aA9",
			"bA9": "at2 ta91 ta92",
			"xA9": "+- hc 0 dxd9",
			"xF9": "+- xD9 0 lFD",
			"xE9": "+- xA9 lFD 0",
			"yC9": "+- yD9 0 th",
			"swAng5": "+- bA9 0 bD8",
			"xCxn1": "+/ xB1 xC1 2",
			"yCxn1": "+/ yB1 yC1 2",
			"xCxn2": "+/ xB2 xC2 2",
			"yCxn2": "+/ yB2 yC2 2",
			"xCxn3": "+/ xB3 xC3 2",
			"yCxn3": "+/ yB3 yC3 2",
			"xCxn4": "+/ xB4 xC4 2",
			"yCxn4": "+/ yB4 yC4 2",
			"xCxn5": "+/ r 0 xCxn4",
			"xCxn6": "+/ r 0 xCxn3",
			"xCxn7": "+/ r 0 xCxn2",
			"xCxn8": "+/ r 0 xCxn1"
		},
/*		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "20000",
				"pos": {
					"x": "xD9",
					"y": "yD9"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "2679",
				"pos": {
					"x": "xA9",
					"y": "yD9"
				}
			}]
		},*/
		"cxnLst": {
			"cxn": [{
				"ang": "18600000",
				"pos": {
					"x": "xCxn1",
					"y": "yCxn1"
				}
			}, {
				"ang": "21000000",
				"pos": {
					"x": "xCxn2",
					"y": "yCxn2"
				}
			}, {
				"ang": "1800000",
				"pos": {
					"x": "xCxn3",
					"y": "yCxn3"
				}
			}, {
				"ang": "4200000",
				"pos": {
					"x": "xCxn4",
					"y": "yCxn4"
				}
			}, {
				"ang": "6600000",
				"pos": {
					"x": "xCxn5",
					"y": "yCxn4"
				}
			}, {
				"ang": "9000000",
				"pos": {
					"x": "xCxn6",
					"y": "yCxn3"
				}
			}, {
				"ang": "11400000",
				"pos": {
					"x": "xCxn7",
					"y": "yCxn2"
				}
			}, {
				"ang": "13800000",
				"pos": {
					"x": "xCxn8",
					"y": "yCxn1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "yC9"
				}
			}]
		},
		"rect": {
			"l": "xA8",
			"t": "yD1",
			"r": "xD1",
			"b": "yD3"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "xA1",
							"y": "yA1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB1",
							"y": "yB1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC1",
							"y": "yC1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD1",
							"y": "yD1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD1",
						"swAng": "swAng1"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB2",
							"y": "yB2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC2",
							"y": "yC2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD2",
							"y": "yD2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD2",
						"swAng": "swAng2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB3",
							"y": "yB3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC3",
							"y": "yC3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD3",
							"y": "yD3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD3",
						"swAng": "swAng3"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB4",
							"y": "yB4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC4",
							"y": "yC4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD4",
							"y": "yD4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD4",
						"swAng": "swAng4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB5",
							"y": "yC4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC5",
							"y": "yB4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD5",
							"y": "yA4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD5",
						"swAng": "swAng3"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB6",
							"y": "yC3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC6",
							"y": "yB3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD6",
							"y": "yA3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD6",
						"swAng": "swAng2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB7",
							"y": "yC2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC7",
							"y": "yB2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD7",
							"y": "yA2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD7",
						"swAng": "swAng1"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB8",
							"y": "yC1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC8",
							"y": "yB1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD8",
							"y": "yA1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD8",
						"swAng": "swAng5"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xE9",
							"y": "yC9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xF9",
							"y": "yC9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD9",
							"y": "yD9"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rh",
						"wR": "rw",
						"stAng": "bD9",
						"swAng": "swAng5"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"halfFrame": {
		"avLst": {
			"adj1": "val 33333",
			"adj2": "val 33333"
		},
		"gdLst": {
			"maxAdj2": "*/ 100000 w ss",
			"a2": "pin 0 adj2 maxAdj2",
			"x1": "*/ ss a2 100000",
			"g1": "*/ h x1 w",
			"g2": "+- h 0 g1",
			"maxAdj1": "*/ 100000 g2 ss",
			"a1": "pin 0 adj1 maxAdj1",
			"y1": "*/ ss a1 100000",
			"dx2": "*/ y1 w h",
			"x2": "+- r 0 dx2",
			"dy2": "*/ x1 h w",
			"y2": "+- b 0 dy2",
			"cx1": "*/ x1 1 2",
			"cy1": "+/ y2 b 2",
			"cx2": "+/ x2 r 2",
			"cy2": "*/ y1 1 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "maxAdj1",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "cx2",
					"y": "cy2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "cx1",
					"y": "cy1"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"heart": {
		"gdLst": {
			"dx1": "*/ w 49 48",
			"dx2": "*/ w 10 48",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc dx2 0",
			"x4": "+- hc dx1 0",
			"y1": "+- t 0 hd3",
			"il": "*/ w 1 6",
			"ir": "*/ w 5 6",
			"ib": "*/ h 2 3"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "hd4"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "hd4",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "hd4"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}, {
							"x": "x4",
							"y": "hd4"
						}, {
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "hd4"
						}, {
							"x": "x2",
							"y": "y1"
						}, {
							"x": "hc",
							"y": "hd4"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"heptagon": {
		"avLst": {
			"hf": "val 102572",
			"vf": "val 105210"
		},
		"gdLst": {
			"swd2": "*/ wd2 hf 100000",
			"shd2": "*/ hd2 vf 100000",
			"svc": "*/ vc vf 100000",
			"dx1": "*/ swd2 97493 100000",
			"dx2": "*/ swd2 78183 100000",
			"dx3": "*/ swd2 43388 100000",
			"dy1": "*/ shd2 62349 100000",
			"dy2": "*/ shd2 22252 100000",
			"dy3": "*/ shd2 90097 100000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc 0 dx3",
			"x4": "+- hc dx3 0",
			"x5": "+- hc dx2 0",
			"x6": "+- hc dx1 0",
			"y1": "+- svc 0 dy1",
			"y2": "+- svc dy2 0",
			"y3": "+- svc dy3 0",
			"ib": "+- b 0 y1"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x5",
					"y": "y1"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x6",
					"y": "y2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x4",
					"y": "y3"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "y3"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x2",
					"y": "y1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "x2",
			"t": "y1",
			"r": "x5",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"hexagon": {
		"avLst": {
			"adj": "val 25000",
			"vf": "val 115470"
		},
		"gdLst": {
			"maxAdj": "*/ 50000 w ss",
			"a": "pin 0 adj maxAdj",
			"shd2": "*/ hd2 vf 100000",
			"x1": "*/ ss a 100000",
			"x2": "+- r 0 x1",
			"dy1": "sin shd2 3600000",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc dy1 0",
			"q1": "*/ maxAdj -1 2",
			"q2": "+- a q1 0",
			"q3": "?: q2 4 2",
			"q4": "?: q2 3 2",
			"q5": "?: q2 q1 0",
			"q6": "+/ a q5 q1",
			"q7": "*/ q6 q4 -1",
			"q8": "+- q3 q7 0",
			"il": "*/ w q8 24",
			"it": "*/ h q8 24",
			"ir": "+- r 0 il",
			"ib": "+- b 0 it"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "maxAdj",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x1",
					"y": "y2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x2",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"homePlate": {
		"avLst": {
			"adj": "val 50000"
		},
		"gdLst": {
			"maxAdj": "*/ 100000 w ss",
			"a": "pin 0 adj maxAdj",
			"dx1": "*/ ss a 100000",
			"x1": "+- r 0 dx1",
			"ir": "+/ x1 r 2",
			"x2": "*/ x1 1 2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "maxAdj",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x1",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "ir",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"horizontalScroll": {
		"avLst": {
			"adj": "val 12500"
		},
		"gdLst": {
			"a": "pin 0 adj 25000",
			"ch": "*/ ss a 100000",
			"ch2": "*/ ch 1 2",
			"ch4": "*/ ch 1 4",
			"y3": "+- ch ch2 0",
			"y4": "+- ch ch 0",
			"y6": "+- b 0 ch",
			"y7": "+- b 0 ch2",
			"y5": "+- y6 0 ch2",
			"x3": "+- r 0 ch",
			"x4": "+- r 0 ch2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "25000",
				"pos": {
					"x": "ch",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "ch"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "y6"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "ch",
			"t": "ch",
			"r": "x4",
			"b": "y6"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "ch2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ch2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch4",
						"hR": "ch4",
						"stAng": "0",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "ch"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ch2",
							"y": "ch"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "3cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y7"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "cd2",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ch",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y6"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ch2",
							"y": "y4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch4",
						"hR": "ch4",
						"stAng": "0",
						"swAng": "-10800000"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "darkenLess",
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ch2",
							"y": "y4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch4",
						"hR": "ch4",
						"stAng": "0",
						"swAng": "-10800000"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ch"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "cd4",
						"swAng": "-16200000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch4",
						"hR": "ch4",
						"stAng": "cd2",
						"swAng": "-10800000"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "ch"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "ch2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "cd2",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y5"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ch",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ch",
							"y": "y7"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "0",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "ch"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ch"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ch"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ch2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch4",
						"hR": "ch4",
						"stAng": "0",
						"swAng": "cd2"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ch2",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ch2",
							"y": "y3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch4",
						"hR": "ch4",
						"stAng": "cd2",
						"swAng": "cd2"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "0",
						"swAng": "cd2"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ch",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ch",
							"y": "y6"
						}]
					}
				}]
			}]
		}
	},
	"irregularSeal1": {
		"gdLst": {
			"x5": "*/ w 4627 21600",
			"x12": "*/ w 8485 21600",
			"x21": "*/ w 16702 21600",
			"x24": "*/ w 14522 21600",
			"y3": "*/ h 6320 21600",
			"y6": "*/ h 8615 21600",
			"y9": "*/ h 13937 21600",
			"y18": "*/ h 13290 21600"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x24",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y6"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x12",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y18"
				}
			}]
		},
		"rect": {
			"l": "x5",
			"t": "y3",
			"r": "x21",
			"b": "y9"
		},
		"pathLst": {
			"path": {
				"w": "21600",
				"h": "21600",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "10800",
							"y": "5800"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "14522",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "14155",
							"y": "5325"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "18380",
							"y": "4457"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "16702",
							"y": "7315"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "21097",
							"y": "8137"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "17607",
							"y": "10475"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "21600",
							"y": "13290"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "16837",
							"y": "12942"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "18145",
							"y": "18095"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "14020",
							"y": "14457"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "13247",
							"y": "19737"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10532",
							"y": "14935"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "8485",
							"y": "21600"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "7715",
							"y": "15627"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "4762",
							"y": "17617"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5667",
							"y": "13937"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "135",
							"y": "14587"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "3722",
							"y": "11775"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "8615"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "4627",
							"y": "7617"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "370",
							"y": "2295"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "7312",
							"y": "6320"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "8352",
							"y": "2295"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"irregularSeal2": {
		"gdLst": {
			"x2": "*/ w 9722 21600",
			"x5": "*/ w 5372 21600",
			"x16": "*/ w 11612 21600",
			"x19": "*/ w 14640 21600",
			"y2": "*/ h 1887 21600",
			"y3": "*/ h 6382 21600",
			"y8": "*/ h 12877 21600",
			"y14": "*/ h 19712 21600",
			"y16": "*/ h 18842 21600",
			"y17": "*/ h 15935 21600",
			"y24": "*/ h 6645 21600"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y8"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x16",
					"y": "y16"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y24"
				}
			}]
		},
		"rect": {
			"l": "x5",
			"t": "y3",
			"r": "x19",
			"b": "y17"
		},
		"pathLst": {
			"path": {
				"w": "21600",
				"h": "21600",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "11462",
							"y": "4342"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "14790",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "14525",
							"y": "5777"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "18007",
							"y": "3172"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "16380",
							"y": "6532"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "21600",
							"y": "6645"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "16985",
							"y": "9402"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "18270",
							"y": "11290"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "16380",
							"y": "12310"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "18877",
							"y": "15632"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "14640",
							"y": "14350"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "14942",
							"y": "17370"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "12180",
							"y": "15935"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "11612",
							"y": "18842"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "9872",
							"y": "17370"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "8700",
							"y": "19712"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "7527",
							"y": "18125"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "4917",
							"y": "21600"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "4805",
							"y": "18240"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1285",
							"y": "17825"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "3330",
							"y": "15370"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "12877"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "3935",
							"y": "11592"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "1172",
							"y": "8270"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5372",
							"y": "7817"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "4502",
							"y": "3625"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "8550",
							"y": "6382"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "9722",
							"y": "1887"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"leftArrow": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000"
		},
		"gdLst": {
			"maxAdj2": "*/ 100000 w ss",
			"a1": "pin 0 adj1 100000",
			"a2": "pin 0 adj2 maxAdj2",
			"dx2": "*/ ss a2 100000",
			"x2": "+- l dx2 0",
			"dy1": "*/ h a1 200000",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc dy1 0",
			"dx1": "*/ y1 dx2 hd2",
			"x1": "+- x2 0 dx1"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "100000",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x2",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "y1",
			"r": "r",
			"b": "y2"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"leftArrowCallout": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 25000",
			"adj3": "val 25000",
			"adj4": "val 64977"
		},
		"gdLst": {
			"maxAdj2": "*/ 50000 h ss",
			"a2": "pin 0 adj2 maxAdj2",
			"maxAdj1": "*/ a2 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"maxAdj3": "*/ 100000 w ss",
			"a3": "pin 0 adj3 maxAdj3",
			"q2": "*/ a3 ss w",
			"maxAdj4": "+- 100000 0 q2",
			"a4": "pin 0 adj4 maxAdj4",
			"dy1": "*/ ss a2 100000",
			"dy2": "*/ ss a1 200000",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc 0 dy2",
			"y3": "+- vc dy2 0",
			"y4": "+- vc dy1 0",
			"x1": "*/ ss a3 100000",
			"dx2": "*/ w a4 100000",
			"x2": "+- r 0 dx2",
			"x3": "+/ x2 r 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "maxAdj1",
				"pos": {
					"x": "x1",
					"y": "y2"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "0",
				"maxY": "maxAdj2",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj3",
				"minX": "0",
				"maxX": "maxAdj3",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "0",
				"maxX": "maxAdj4",
				"pos": {
					"x": "x2",
					"y": "b"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x3",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "x2",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"leftBrace": {
		"avLst": {
			"adj1": "val 8333",
			"adj2": "val 50000"
		},
		"gdLst": {
			"a2": "pin 0 adj2 100000",
			"q1": "+- 100000 0 a2",
			"q2": "min q1 a2",
			"q3": "*/ q2 1 2",
			"maxAdj1": "*/ q3 h ss",
			"a1": "pin 0 adj1 maxAdj1",
			"y1": "*/ ss a1 100000",
			"y3": "*/ h a2 100000",
			"y4": "+- y3 y1 0",
			"dx1": "cos wd2 2700000",
			"dy1": "sin y1 2700000",
			"il": "+- r 0 dx1",
			"it": "+- y1 0 dy1",
			"ib": "+- b dy1 y1"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "maxAdj1",
				"pos": {
					"x": "hc",
					"y": "y1"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "0",
				"maxY": "100000",
				"pos": {
					"x": "l",
					"y": "y3"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd4",
				"pos": {
					"x": "r",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y3"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "r",
					"y": "b"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "r",
			"b": "ib"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "y4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "0",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "y4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "0",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}]
			}]
		}
	},
	"leftBracket": {
		"avLst": {
			"adj": "val 8333"
		},
		"gdLst": {
			"maxAdj": "*/ 50000 h ss",
			"a": "pin 0 adj maxAdj",
			"y1": "*/ ss a 100000",
			"y2": "+- b 0 y1",
			"dx1": "cos w 2700000",
			"dy1": "sin y1 2700000",
			"il": "+- r 0 dx1",
			"it": "+- y1 0 dy1",
			"ib": "+- b dy1 y1"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "maxAdj",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd4",
				"pos": {
					"x": "r",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "r",
					"y": "b"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "r",
			"b": "ib"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "y1",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "y1",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "y1",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "y1",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}]
			}]
		}
	},
	"leftCircularArrow": {
		"avLst": {
			"adj1": "val 12500",
			"adj2": "val -1142319",
			"adj3": "val 1142319",
			"adj4": "val 10800000",
			"adj5": "val 12500"
		},
		"gdLst": {
			"a5": "pin 0 adj5 25000",
			"maxAdj1": "*/ a5 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"enAng": "pin 1 adj3 21599999",
			"stAng": "pin 0 adj4 21599999",
			"th": "*/ ss a1 100000",
			"thh": "*/ ss a5 100000",
			"th2": "*/ th 1 2",
			"rw1": "+- wd2 th2 thh",
			"rh1": "+- hd2 th2 thh",
			"rw2": "+- rw1 0 th",
			"rh2": "+- rh1 0 th",
			"rw3": "+- rw2 th2 0",
			"rh3": "+- rh2 th2 0",
			"wtH": "sin rw3 enAng",
			"htH": "cos rh3 enAng",
			"dxH": "cat2 rw3 htH wtH",
			"dyH": "sat2 rh3 htH wtH",
			"xH": "+- hc dxH 0",
			"yH": "+- vc dyH 0",
			"rI": "min rw2 rh2",
			"u1": "*/ dxH dxH 1",
			"u2": "*/ dyH dyH 1",
			"u3": "*/ rI rI 1",
			"u4": "+- u1 0 u3",
			"u5": "+- u2 0 u3",
			"u6": "*/ u4 u5 u1",
			"u7": "*/ u6 1 u2",
			"u8": "+- 1 0 u7",
			"u9": "sqrt u8",
			"u10": "*/ u4 1 dxH",
			"u11": "*/ u10 1 dyH",
			"u12": "+/ 1 u9 u11",
			"u13": "at2 1 u12",
			"u14": "+- u13 21600000 0",
			"u15": "?: u13 u13 u14",
			"u16": "+- u15 0 enAng",
			"u17": "+- u16 21600000 0",
			"u18": "?: u16 u16 u17",
			"u19": "+- u18 0 cd2",
			"u20": "+- u18 0 21600000",
			"u21": "?: u19 u20 u18",
			"u22": "abs u21",
			"minAng": "*/ u22 -1 1",
			"u23": "abs adj2",
			"a2": "*/ u23 -1 1",
			"aAng": "pin minAng a2 0",
			"ptAng": "+- enAng aAng 0",
			"wtA": "sin rw3 ptAng",
			"htA": "cos rh3 ptAng",
			"dxA": "cat2 rw3 htA wtA",
			"dyA": "sat2 rh3 htA wtA",
			"xA": "+- hc dxA 0",
			"yA": "+- vc dyA 0",
			"wtE": "sin rw1 stAng",
			"htE": "cos rh1 stAng",
			"dxE": "cat2 rw1 htE wtE",
			"dyE": "sat2 rh1 htE wtE",
			"xE": "+- hc dxE 0",
			"yE": "+- vc dyE 0",
			"wtD": "sin rw2 stAng",
			"htD": "cos rh2 stAng",
			"dxD": "cat2 rw2 htD wtD",
			"dyD": "sat2 rh2 htD wtD",
			"xD": "+- hc dxD 0",
			"yD": "+- vc dyD 0",
			"dxG": "cos thh ptAng",
			"dyG": "sin thh ptAng",
			"xG": "+- xH dxG 0",
			"yG": "+- yH dyG 0",
			"dxB": "cos thh ptAng",
			"dyB": "sin thh ptAng",
			"xB": "+- xH 0 dxB 0",
			"yB": "+- yH 0 dyB 0",
			"sx1": "+- xB 0 hc",
			"sy1": "+- yB 0 vc",
			"sx2": "+- xG 0 hc",
			"sy2": "+- yG 0 vc",
			"rO": "min rw1 rh1",
			"x1O": "*/ sx1 rO rw1",
			"y1O": "*/ sy1 rO rh1",
			"x2O": "*/ sx2 rO rw1",
			"y2O": "*/ sy2 rO rh1",
			"dxO": "+- x2O 0 x1O",
			"dyO": "+- y2O 0 y1O",
			"dO": "mod dxO dyO 0",
			"q1": "*/ x1O y2O 1",
			"q2": "*/ x2O y1O 1",
			"DO": "+- q1 0 q2",
			"q3": "*/ rO rO 1",
			"q4": "*/ dO dO 1",
			"q5": "*/ q3 q4 1",
			"q6": "*/ DO DO 1",
			"q7": "+- q5 0 q6",
			"q8": "max q7 0",
			"sdelO": "sqrt q8",
			"ndyO": "*/ dyO -1 1",
			"sdyO": "?: ndyO -1 1",
			"q9": "*/ sdyO dxO 1",
			"q10": "*/ q9 sdelO 1",
			"q11": "*/ DO dyO 1",
			"dxF1": "+/ q11 q10 q4",
			"q12": "+- q11 0 q10",
			"dxF2": "*/ q12 1 q4",
			"adyO": "abs dyO",
			"q13": "*/ adyO sdelO 1",
			"q14": "*/ DO dxO -1",
			"dyF1": "+/ q14 q13 q4",
			"q15": "+- q14 0 q13",
			"dyF2": "*/ q15 1 q4",
			"q16": "+- x2O 0 dxF1",
			"q17": "+- x2O 0 dxF2",
			"q18": "+- y2O 0 dyF1",
			"q19": "+- y2O 0 dyF2",
			"q20": "mod q16 q18 0",
			"q21": "mod q17 q19 0",
			"q22": "+- q21 0 q20",
			"dxF": "?: q22 dxF1 dxF2",
			"dyF": "?: q22 dyF1 dyF2",
			"sdxF": "*/ dxF rw1 rO",
			"sdyF": "*/ dyF rh1 rO",
			"xF": "+- hc sdxF 0",
			"yF": "+- vc sdyF 0",
			"x1I": "*/ sx1 rI rw2",
			"y1I": "*/ sy1 rI rh2",
			"x2I": "*/ sx2 rI rw2",
			"y2I": "*/ sy2 rI rh2",
			"dxI": "+- x2I 0 x1I",
			"dyI": "+- y2I 0 y1I",
			"dI": "mod dxI dyI 0",
			"v1": "*/ x1I y2I 1",
			"v2": "*/ x2I y1I 1",
			"DI": "+- v1 0 v2",
			"v3": "*/ rI rI 1",
			"v4": "*/ dI dI 1",
			"v5": "*/ v3 v4 1",
			"v6": "*/ DI DI 1",
			"v7": "+- v5 0 v6",
			"v8": "max v7 0",
			"sdelI": "sqrt v8",
			"v9": "*/ sdyO dxI 1",
			"v10": "*/ v9 sdelI 1",
			"v11": "*/ DI dyI 1",
			"dxC1": "+/ v11 v10 v4",
			"v12": "+- v11 0 v10",
			"dxC2": "*/ v12 1 v4",
			"adyI": "abs dyI",
			"v13": "*/ adyI sdelI 1",
			"v14": "*/ DI dxI -1",
			"dyC1": "+/ v14 v13 v4",
			"v15": "+- v14 0 v13",
			"dyC2": "*/ v15 1 v4",
			"v16": "+- x1I 0 dxC1",
			"v17": "+- x1I 0 dxC2",
			"v18": "+- y1I 0 dyC1",
			"v19": "+- y1I 0 dyC2",
			"v20": "mod v16 v18 0",
			"v21": "mod v17 v19 0",
			"v22": "+- v21 0 v20",
			"dxC": "?: v22 dxC1 dxC2",
			"dyC": "?: v22 dyC1 dyC2",
			"sdxC": "*/ dxC rw2 rI",
			"sdyC": "*/ dyC rh2 rI",
			"xC": "+- hc sdxC 0",
			"yC": "+- vc sdyC 0",
			"ist0": "at2 sdxC sdyC",
			"ist1": "+- ist0 21600000 0",
			"istAng0": "?: ist0 ist0 ist1",
			"isw1": "+- stAng 0 istAng0",
			"isw2": "+- isw1 21600000 0",
			"iswAng0": "?: isw1 isw1 isw2",
			"istAng": "+- istAng0 iswAng0 0",
			"iswAng": "+- 0 0 iswAng0",
			"p1": "+- xF 0 xC",
			"p2": "+- yF 0 yC",
			"p3": "mod p1 p2 0",
			"p4": "*/ p3 1 2",
			"p5": "+- p4 0 thh",
			"xGp": "?: p5 xF xG",
			"yGp": "?: p5 yF yG",
			"xBp": "?: p5 xC xB",
			"yBp": "?: p5 yC yB",
			"en0": "at2 sdxF sdyF",
			"en1": "+- en0 21600000 0",
			"en2": "?: en0 en0 en1",
			"sw0": "+- en2 0 stAng",
			"sw1": "+- sw0 0 21600000",
			"swAng": "?: sw0 sw1 sw0",
			"stAng0": "+- stAng swAng 0",
			"swAng0": "+- 0 0 swAng",
			"wtI": "sin rw3 stAng",
			"htI": "cos rh3 stAng",
			"newdxI": "cat2 rw3 htI wtI",
			"newdyI": "sat2 rh3 htI wtI",
			"xI": "+- hc newdxI 0",
			"yI": "+- vc newdyI 0",
			"aI": "+- stAng cd4 0",
			"aA": "+- ptAng 0 cd4",
			"aB": "+- ptAng cd2 0",
			"idx": "cos rw1 2700000",
			"idy": "sin rh1 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"ahLst": {
			"ahPolar": [{
/*				"gdRefAng": "adj2",
				"minAng": "minAng",
				"maxAng": "0",
				"pos": {
					"x": "xA",
					"y": "yA"
				}
			}, {*/
				"gdRefAng": "adj4",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "xE",
					"y": "yE"
				}
			}, {
				"gdRefR": "adj1",
				"minR": "0",
				"maxR": "maxAdj1",
				"gdRefAng": "adj3",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "xF",
					"y": "yF"
				}
/*			}, {
				"gdRefR": "adj5",
				"minR": "0",
				"maxR": "25000",
				"pos": {
					"x": "xB",
					"y": "yB"
				}*/
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "aI",
				"pos": {
					"x": "xI",
					"y": "yI"
				}
			}, {
				"ang": "ptAng",
				"pos": {
					"x": "xGp",
					"y": "yGp"
				}
			}, {
				"ang": "aA",
				"pos": {
					"x": "xA",
					"y": "yA"
				}
			}, {
				"ang": "aB",
				"pos": {
					"x": "xBp",
					"y": "yBp"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "xE",
							"y": "yE"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD",
							"y": "yD"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "rw2",
						"hR": "rh2",
						"stAng": "istAng",
						"swAng": "iswAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xBp",
							"y": "yBp"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xA",
							"y": "yA"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xGp",
							"y": "yGp"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xF",
							"y": "yF"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "rw1",
						"hR": "rh1",
						"stAng": "stAng0",
						"swAng": "swAng0"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"leftRightArrow": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000"
		},
		"gdLst": {
			"maxAdj2": "*/ 50000 w ss",
			"a1": "pin 0 adj1 100000",
			"a2": "pin 0 adj2 maxAdj2",
			"x2": "*/ ss a2 100000",
			"x3": "+- r 0 x2",
			"dy": "*/ h a1 200000",
			"y1": "+- vc 0 dy",
			"y2": "+- vc dy 0",
			"dx1": "*/ y1 x2 hd2",
			"x1": "+- x2 0 dx1",
			"x4": "+- x3 dx1 0"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "100000",
				"pos": {
					"x": "x3",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x2",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x3",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "y1",
			"r": "x4",
			"b": "y2"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"leftRightArrowCallout": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 25000",
			"adj3": "val 25000",
			"adj4": "val 48123"
		},
		"gdLst": {
			"maxAdj2": "*/ 50000 h ss",
			"a2": "pin 0 adj2 maxAdj2",
			"maxAdj1": "*/ a2 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"maxAdj3": "*/ 50000 w ss",
			"a3": "pin 0 adj3 maxAdj3",
			"q2": "*/ a3 ss wd2",
			"maxAdj4": "+- 100000 0 q2",
			"a4": "pin 0 adj4 maxAdj4",
			"dy1": "*/ ss a2 100000",
			"dy2": "*/ ss a1 200000",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc 0 dy2",
			"y3": "+- vc dy2 0",
			"y4": "+- vc dy1 0",
			"x1": "*/ ss a3 100000",
			"x4": "+- r 0 x1",
			"dx2": "*/ w a4 200000",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc dx2 0"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "maxAdj1",
				"pos": {
					"x": "x1",
					"y": "y2"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "0",
				"maxY": "maxAdj2",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj3",
				"minX": "0",
				"maxX": "maxAdj3",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "0",
				"maxX": "maxAdj4",
				"pos": {
					"x": "x2",
					"y": "b"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "x2",
			"t": "t",
			"r": "x3",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"leftRightCircularArrow": {
		"avLst": {
			"adj1": "val 12500",
			"adj2": "val 1142319",
			"adj3": "val 20457681",
			"adj4": "val 11942319",
			"adj5": "val 12500"
		},
		"gdLst": {
			"a5": "pin 0 adj5 25000",
			"maxAdj1": "*/ a5 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"enAng": "pin 1 adj3 21599999",
			"stAng": "pin 0 adj4 21599999",
			"th": "*/ ss a1 100000",
			"thh": "*/ ss a5 100000",
			"th2": "*/ th 1 2",
			"rw1": "+- wd2 th2 thh",
			"rh1": "+- hd2 th2 thh",
			"rw2": "+- rw1 0 th",
			"rh2": "+- rh1 0 th",
			"rw3": "+- rw2 th2 0",
			"rh3": "+- rh2 th2 0",
			"wtH": "sin rw3 enAng",
			"htH": "cos rh3 enAng",
			"dxH": "cat2 rw3 htH wtH",
			"dyH": "sat2 rh3 htH wtH",
			"xH": "+- hc dxH 0",
			"yH": "+- vc dyH 0",
			"rI": "min rw2 rh2",
			"u1": "*/ dxH dxH 1",
			"u2": "*/ dyH dyH 1",
			"u3": "*/ rI rI 1",
			"u4": "+- u1 0 u3",
			"u5": "+- u2 0 u3",
			"u6": "*/ u4 u5 u1",
			"u7": "*/ u6 1 u2",
			"u8": "+- 1 0 u7",
			"u9": "sqrt u8",
			"u10": "*/ u4 1 dxH",
			"u11": "*/ u10 1 dyH",
			"u12": "+/ 1 u9 u11",
			"u13": "at2 1 u12",
			"u14": "+- u13 21600000 0",
			"u15": "?: u13 u13 u14",
			"u16": "+- u15 0 enAng",
			"u17": "+- u16 21600000 0",
			"u18": "?: u16 u16 u17",
			"u19": "+- u18 0 cd2",
			"u20": "+- u18 0 21600000",
			"u21": "?: u19 u20 u18",
			"maxAng": "abs u21",
			"aAng": "pin 0 adj2 maxAng",
			"ptAng": "+- enAng aAng 0",
			"wtA": "sin rw3 ptAng",
			"htA": "cos rh3 ptAng",
			"dxA": "cat2 rw3 htA wtA",
			"dyA": "sat2 rh3 htA wtA",
			"xA": "+- hc dxA 0",
			"yA": "+- vc dyA 0",
			"dxG": "cos thh ptAng",
			"dyG": "sin thh ptAng",
			"xG": "+- xH dxG 0",
			"yG": "+- yH dyG 0",
			"dxB": "cos thh ptAng",
			"dyB": "sin thh ptAng",
			"xB": "+- xH 0 dxB 0",
			"yB": "+- yH 0 dyB 0",
			"sx1": "+- xB 0 hc",
			"sy1": "+- yB 0 vc",
			"sx2": "+- xG 0 hc",
			"sy2": "+- yG 0 vc",
			"rO": "min rw1 rh1",
			"x1O": "*/ sx1 rO rw1",
			"y1O": "*/ sy1 rO rh1",
			"x2O": "*/ sx2 rO rw1",
			"y2O": "*/ sy2 rO rh1",
			"dxO": "+- x2O 0 x1O",
			"dyO": "+- y2O 0 y1O",
			"dO": "mod dxO dyO 0",
			"q1": "*/ x1O y2O 1",
			"q2": "*/ x2O y1O 1",
			"DO": "+- q1 0 q2",
			"q3": "*/ rO rO 1",
			"q4": "*/ dO dO 1",
			"q5": "*/ q3 q4 1",
			"q6": "*/ DO DO 1",
			"q7": "+- q5 0 q6",
			"q8": "max q7 0",
			"sdelO": "sqrt q8",
			"ndyO": "*/ dyO -1 1",
			"sdyO": "?: ndyO -1 1",
			"q9": "*/ sdyO dxO 1",
			"q10": "*/ q9 sdelO 1",
			"q11": "*/ DO dyO 1",
			"dxF1": "+/ q11 q10 q4",
			"q12": "+- q11 0 q10",
			"dxF2": "*/ q12 1 q4",
			"adyO": "abs dyO",
			"q13": "*/ adyO sdelO 1",
			"q14": "*/ DO dxO -1",
			"dyF1": "+/ q14 q13 q4",
			"q15": "+- q14 0 q13",
			"dyF2": "*/ q15 1 q4",
			"q16": "+- x2O 0 dxF1",
			"q17": "+- x2O 0 dxF2",
			"q18": "+- y2O 0 dyF1",
			"q19": "+- y2O 0 dyF2",
			"q20": "mod q16 q18 0",
			"q21": "mod q17 q19 0",
			"q22": "+- q21 0 q20",
			"dxF": "?: q22 dxF1 dxF2",
			"dyF": "?: q22 dyF1 dyF2",
			"sdxF": "*/ dxF rw1 rO",
			"sdyF": "*/ dyF rh1 rO",
			"xF": "+- hc sdxF 0",
			"yF": "+- vc sdyF 0",
			"x1I": "*/ sx1 rI rw2",
			"y1I": "*/ sy1 rI rh2",
			"x2I": "*/ sx2 rI rw2",
			"y2I": "*/ sy2 rI rh2",
			"dxI": "cat2 rw3 htI wtI",
			"dyI": "sat2 rh3 htI wtI",
			"dI": "mod dxI dyI 0",
			"v1": "*/ x1I y2I 1",
			"v2": "*/ x2I y1I 1",
			"DI": "+- v1 0 v2",
			"v3": "*/ rI rI 1",
			"v4": "*/ dI dI 1",
			"v5": "*/ v3 v4 1",
			"v6": "*/ DI DI 1",
			"v7": "+- v5 0 v6",
			"v8": "max v7 0",
			"sdelI": "sqrt v8",
			"v9": "*/ sdyO dxI 1",
			"v10": "*/ v9 sdelI 1",
			"v11": "*/ DI dyI 1",
			"dxC1": "+/ v11 v10 v4",
			"v12": "+- v11 0 v10",
			"dxC2": "*/ v12 1 v4",
			"adyI": "abs dyI",
			"v13": "*/ adyI sdelI 1",
			"v14": "*/ DI dxI -1",
			"dyC1": "+/ v14 v13 v4",
			"v15": "+- v14 0 v13",
			"dyC2": "*/ v15 1 v4",
			"v16": "+- x1I 0 dxC1",
			"v17": "+- x1I 0 dxC2",
			"v18": "+- y1I 0 dyC1",
			"v19": "+- y1I 0 dyC2",
			"v20": "mod v16 v18 0",
			"v21": "mod v17 v19 0",
			"v22": "+- v21 0 v20",
			"dxC": "?: v22 dxC1 dxC2",
			"dyC": "?: v22 dyC1 dyC2",
			"sdxC": "*/ dxC rw2 rI",
			"sdyC": "*/ dyC rh2 rI",
			"xC": "+- hc sdxC 0",
			"yC": "+- vc sdyC 0",
			"wtI": "sin rw3 stAng",
			"htI": "cos rh3 stAng",
			"xI": "+- hc dxI 0",
			"yI": "+- vc dyI 0",
			"lptAng": "+- stAng 0 aAng",
			"wtL": "sin rw3 lptAng",
			"htL": "cos rh3 lptAng",
			"dxL": "cat2 rw3 htL wtL",
			"dyL": "sat2 rh3 htL wtL",
			"xL": "+- hc dxL 0",
			"yL": "+- vc dyL 0",
			"dxK": "cos thh lptAng",
			"dyK": "sin thh lptAng",
			"xK": "+- xI dxK 0",
			"yK": "+- yI dyK 0",
			"dxJ": "cos thh lptAng",
			"dyJ": "sin thh lptAng",
			"xJ": "+- xI 0 dxJ 0",
			"yJ": "+- yI 0 dyJ 0",
			"p1": "+- xF 0 xC",
			"p2": "+- yF 0 yC",
			"p3": "mod p1 p2 0",
			"p4": "*/ p3 1 2",
			"p5": "+- p4 0 thh",
			"xGp": "?: p5 xF xG",
			"yGp": "?: p5 yF yG",
			"xBp": "?: p5 xC xB",
			"yBp": "?: p5 yC yB",
			"en0": "at2 sdxF sdyF",
			"en1": "+- en0 21600000 0",
			"en2": "?: en0 en0 en1",
			"od0": "+- en2 0 enAng",
			"od1": "+- od0 21600000 0",
			"od2": "?: od0 od0 od1",
			"st0": "+- stAng 0 od2",
			"st1": "+- st0 21600000 0",
			"st2": "?: st0 st0 st1",
			"sw0": "+- en2 0 st2",
			"sw1": "+- sw0 21600000 0",
			"swAng": "?: sw0 sw0 sw1",
			"ist0": "at2 sdxC sdyC",
			"ist1": "+- ist0 21600000 0",
			"istAng": "?: ist0 ist0 ist1",
			"id0": "+- istAng 0 enAng",
			"id1": "+- id0 0 21600000",
			"id2": "?: id0 id1 id0",
			"ien0": "+- stAng 0 id2",
			"ien1": "+- ien0 0 21600000",
			"ien2": "?: ien1 ien1 ien0",
			"isw1": "+- ien2 0 istAng",
			"isw2": "+- isw1 0 21600000",
			"iswAng": "?: isw1 isw2 isw1",
			"wtE": "sin rw1 st2",
			"htE": "cos rh1 st2",
			"dxE": "cat2 rw1 htE wtE",
			"dyE": "sat2 rh1 htE wtE",
			"xE": "+- hc dxE 0",
			"yE": "+- vc dyE 0",
			"wtD": "sin rw2 ien2",
			"htD": "cos rh2 ien2",
			"dxD": "cat2 rw2 htD wtD",
			"dyD": "sat2 rh2 htD wtD",
			"xD": "+- hc dxD 0",
			"yD": "+- vc dyD 0",
			"xKp": "?: p5 xE xK",
			"yKp": "?: p5 yE yK",
			"xJp": "?: p5 xD xJ",
			"yJp": "?: p5 yD yJ",
			"aL": "+- lptAng 0 cd4",
			"aA": "+- ptAng cd4 0",
			"aB": "+- ptAng cd2 0",
			"aJ": "+- lptAng cd2 0",
			"idx": "cos rw1 2700000",
			"idy": "sin rh1 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"ahLst": {
			"ahPolar": [{
				"gdRefAng": "adj2",
				"minAng": "0",
				"maxAng": "maxAng",
				"pos": {
					"x": "xA",
					"y": "yA"
				}
			}, {
				"gdRefAng": "adj4",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "xE",
					"y": "yE"
				}
			}, {
				"gdRefR": "adj1",
				"minR": "0",
				"maxR": "maxAdj1",
				"gdRefAng": "adj3",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "xF",
					"y": "yF"
				}
/*			}, {
				"gdRefR": "adj5",
				"minR": "0",
				"maxR": "25000",
				"pos": {
					"x": "xB",
					"y": "yB"
				}*/
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "aL",
				"pos": {
					"x": "xL",
					"y": "yL"
				}
			}, {
				"ang": "lptAng",
				"pos": {
					"x": "xKp",
					"y": "yKp"
				}
			}, {
				"ang": "ptAng",
				"pos": {
					"x": "xGp",
					"y": "yGp"
				}
			}, {
				"ang": "aA",
				"pos": {
					"x": "xA",
					"y": "yA"
				}
			}, {
				"ang": "aB",
				"pos": {
					"x": "xBp",
					"y": "yBp"
				}
			}, {
				"ang": "aJ",
				"pos": {
					"x": "xJp",
					"y": "yJp"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "xL",
							"y": "yL"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xKp",
							"y": "yKp"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xE",
							"y": "yE"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "rw1",
						"hR": "rh1",
						"stAng": "st2",
						"swAng": "swAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xGp",
							"y": "yGp"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xA",
							"y": "yA"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xBp",
							"y": "yBp"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC",
							"y": "yC"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "rw2",
						"hR": "rh2",
						"stAng": "istAng",
						"swAng": "iswAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xJp",
							"y": "yJp"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"leftRightRibbon": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000",
			"adj3": "val 16667"
		},
		"gdLst": {
			"a3": "pin 0 adj3 33333",
			"maxAdj1": "+- 100000 0 a3",
			"a1": "pin 0 adj1 maxAdj1",
			"w1": "+- wd2 0 wd32",
			"maxAdj2": "*/ 100000 w1 ss",
			"a2": "pin 0 adj2 maxAdj2",
			"x1": "*/ ss a2 100000",
			"x4": "+- r 0 x1",
			"dy1": "*/ h a1 200000",
			"dy2": "*/ h a3 -200000",
			"ly1": "+- vc dy2 dy1",
			"ry4": "+- vc dy1 dy2",
			"ly2": "+- ly1 dy1 0",
			"ry3": "+- b 0 ly2",
			"ly4": "*/ ly2 2 1",
			"ry1": "+- b 0 ly4",
			"ly3": "+- ly4 0 ly1",
			"ry2": "+- b 0 ly3",
			"hR": "*/ a3 ss 400000",
			"x2": "+- hc 0 wd32",
			"x3": "+- hc wd32 0",
			"y1": "+- ly1 hR 0",
			"y2": "+- ry2 0 hR"
		},
		"ahLst": {
			"ahXY": [{
/*				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "maxAdj1",
				"pos": {
					"x": "x4",
					"y": "ry2"
				}
			}, {*/
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "x1",
					"y": "t"
				}
/*			}, {
				"gdRefY": "adj3",
				"minY": "0",
				"maxY": "33333",
				"pos": {
					"x": "x3",
					"y": "ry2"
				}*/
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "ry3"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x4",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x1",
					"y": "ly4"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "ly2"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x4",
					"y": "ry1"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "ly1",
			"r": "x4",
			"b": "ry4"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "ly2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "ly1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "ly1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ry2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ry1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "ry3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ry4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "ry4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "ly3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "ly3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "ly4"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darkenLess",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "ry2"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "ly2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "ly1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "ly1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ry2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ry1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "ry3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ry4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "ry4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "ly3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "ly3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "ly4"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "ry2"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "ly3"
						}]
					}
				}]
			}]
		}
	},
	"leftRightUpArrow": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 25000",
			"adj3": "val 25000"
		},
		"gdLst": {
			"a2": "pin 0 adj2 50000",
			"maxAdj1": "*/ a2 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"q1": "+- 100000 0 maxAdj1",
			"maxAdj3": "*/ q1 1 2",
			"a3": "pin 0 adj3 maxAdj3",
			"x1": "*/ ss a3 100000",
			"dx2": "*/ ss a2 100000",
			"x2": "+- hc 0 dx2",
			"x5": "+- hc dx2 0",
			"dx3": "*/ ss a1 200000",
			"x3": "+- hc 0 dx3",
			"x4": "+- hc dx3 0",
			"x6": "+- r 0 x1",
			"dy2": "*/ ss a2 50000",
			"y2": "+- b 0 dy2",
			"y4": "+- b 0 dx2",
			"y3": "+- y4 0 dx3",
			"y5": "+- y4 dx3 0",
			"il": "*/ dx3 x1 dx2",
			"ir": "+- r 0 il"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "maxAdj1",
				"pos": {
					"x": "x3",
					"y": "x1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}, {
				"gdRefY": "adj3",
				"minY": "0",
				"maxY": "maxAdj3",
				"pos": {
					"x": "r",
					"y": "x1"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y4"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "y5"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y4"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "y3",
			"r": "ir",
			"b": "y5"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"upArrow": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000"
		},
		"gdLst": {
			"maxAdj2": "*/ 100000 h ss",
			"a1": "pin 0 adj1 100000",
			"a2": "pin 0 adj2 maxAdj2",
			"dy2": "*/ ss a2 100000",
			"y2": "+- t dy2 0",
			"dx1": "*/ w a1 200000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc dx1 0",
			"dy1": "*/ x1 dy2 wd2",
			"y1": "+- y2 0 dy1"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "100000",
				"pos": {
					"x": "x1",
					"y": "b"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "0",
				"maxY": "maxAdj2",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y2"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "y1",
			"r": "x2",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"leftUpArrow": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 25000",
			"adj3": "val 25000"
		},
		"gdLst": {
			"a2": "pin 0 adj2 50000",
			"maxAdj1": "*/ a2 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"maxAdj3": "+- 100000 0 maxAdj1",
			"a3": "pin 0 adj3 maxAdj3",
			"x1": "*/ ss a3 100000",
			"dx2": "*/ ss a2 50000",
			"x2": "+- r 0 dx2",
			"y2": "+- b 0 dx2",
			"dx4": "*/ ss a2 100000",
			"x4": "+- r 0 dx4",
			"y4": "+- b 0 dx4",
			"dx3": "*/ ss a1 200000",
			"x3": "+- x4 0 dx3",
			"x5": "+- x4 dx3 0",
			"y3": "+- y4 0 dx3",
			"y5": "+- y4 dx3 0",
			"il": "*/ dx3 x1 dx4",
			"cx1": "+/ x1 x5 2",
			"cy1": "+/ x1 y5 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "maxAdj1",
				"pos": {
					"x": "x3",
					"y": "y3"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}, {
				"gdRefY": "adj3",
				"minY": "0",
				"maxY": "maxAdj3",
				"pos": {
					"x": "x3",
					"y": "x1"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x4",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x2",
					"y": "x1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x1",
					"y": "y2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y4"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x1",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "cx1",
					"y": "y5"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x5",
					"y": "cy1"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "x1"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "y3",
			"r": "x4",
			"b": "y5"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"lightningBolt": {
		"gdLst": {
			"x1": "*/ w 5022 21600",
			"x3": "*/ w 8472 21600",
			"x4": "*/ w 8757 21600",
			"x5": "*/ w 10012 21600",
			"x8": "*/ w 12860 21600",
			"x9": "*/ w 13917 21600",
			"x11": "*/ w 16577 21600",
			"y1": "*/ h 3890 21600",
			"y2": "*/ h 6080 21600",
			"y4": "*/ h 7437 21600",
			"y6": "*/ h 9705 21600",
			"y7": "*/ h 12007 21600",
			"y10": "*/ h 14277 21600",
			"y11": "*/ h 14915 21600"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x3",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y6"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x5",
					"y": "y11"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "r",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x11",
					"y": "y7"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x8",
					"y": "y2"
				}
			}]
		},
		"rect": {
			"l": "x4",
			"t": "y4",
			"r": "x9",
			"b": "y10"
		},
		"pathLst": {
			"path": {
				"w": "21600",
				"h": "21600",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "8472",
							"y": "0"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "12860",
							"y": "6080"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "11050",
							"y": "6797"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "16577",
							"y": "12007"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "14767",
							"y": "12877"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "21600",
							"y": "21600"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "10012",
							"y": "14915"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "12222",
							"y": "13987"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "5022",
							"y": "9705"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "7602",
							"y": "8382"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "0",
							"y": "3890"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"line": {
		"cxnLst": {
			"cxn": [{
				"ang": "cd4",
				"pos": {
					"x": "l",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "r",
					"y": "b"
				}
			}]
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}]
			}
		}
	},
	"lineInv": {
		"cxnLst": {
			"cxn": [{
				"ang": "cd4",
				"pos": {
					"x": "l",
					"y": "b"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "r",
					"y": "t"
				}
			}]
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}]
			}
		}
	},
	"mathDivide": {
		"avLst": {
			"adj1": "val 23520",
			"adj2": "val 5880",
			"adj3": "val 11760"
		},
		"gdLst": {
			"a1": "pin 1000 adj1 36745",
			"ma1": "+- 0 0 a1",
			"ma3h": "+/ 73490 ma1 4",
			"ma3w": "*/ 36745 w h",
			"maxAdj3": "min ma3h ma3w",
			"a3": "pin 1000 adj3 maxAdj3",
			"m4a3": "*/ -4 a3 1",
			"maxAdj2": "+- 73490 m4a3 a1",
			"a2": "pin 0 adj2 maxAdj2",
			"dy1": "*/ h a1 200000",
			"yg": "*/ h a2 100000",
			"rad": "*/ h a3 100000",
			"dx1": "*/ w 73490 200000",
			"y3": "+- vc 0 dy1",
			"y4": "+- vc dy1 0",
			"a": "+- yg rad 0",
			"y2": "+- y3 0 a",
			"y1": "+- y2 0 rad",
			"y5": "+- b 0 y1",
			"x1": "+- hc 0 dx1",
			"x3": "+- hc dx1 0",
			"x2": "+- hc 0 rad"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "1000",
				"maxY": "36745",
				"pos": {
					"x": "l",
					"y": "y3"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "0",
				"maxY": "maxAdj2",
				"pos": {
					"x": "r",
					"y": "y2"
				}
			}, {
				"gdRefX": "adj3",
				"minX": "1000",
				"maxX": "maxAdj3",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x3",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "y5"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "y3",
			"r": "x3",
			"b": "y4"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rad",
						"wR": "rad",
						"stAng": "3cd4",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "y5"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"hR": "rad",
						"wR": "rad",
						"stAng": "cd4",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"mathEqual": {
		"avLst": {
			"adj1": "val 23520",
			"adj2": "val 11760"
		},
		"gdLst": {
			"a1": "pin 0 adj1 36745",
			"2a1": "*/ a1 2 1",
			"mAdj2": "+- 100000 0 2a1",
			"a2": "pin 0 adj2 mAdj2",
			"dy1": "*/ h a1 100000",
			"dy2": "*/ h a2 200000",
			"dx1": "*/ w 73490 200000",
			"y2": "+- vc 0 dy2",
			"y3": "+- vc dy2 0",
			"y1": "+- y2 0 dy1",
			"y4": "+- y3 dy1 0",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc dx1 0",
			"yC1": "+/ y1 y2 2",
			"yC2": "+/ y3 y4 2"
		},
		"ahLst": {
			"ahXY": [{
/*				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "36745",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {*/
				"gdRefY": "adj2",
				"minY": "0",
				"maxY": "mAdj2",
				"pos": {
					"x": "r",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x2",
					"y": "yC1"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x2",
					"y": "yC2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "y4"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "yC1"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "yC2"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "y1",
			"r": "x2",
			"b": "y4"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"mathMinus": {
		"avLst": {
			"adj1": "val 23520"
		},
		"gdLst": {
			"a1": "pin 0 adj1 100000",
			"dy1": "*/ h a1 200000",
			"dx1": "*/ w 73490 200000",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc dy1 0",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc dx1 0"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "100000",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x2",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "y2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "y1",
			"r": "x2",
			"b": "y2"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"mathMultiply": {
		"avLst": {
			"adj1": "val 23520"
		},
		"gdLst": {
			"a1": "pin 0 adj1 51965",
			"th": "*/ ss a1 100000",
			"a": "at2 w h",
			"sa": "sin 1 a",
			"ca": "cos 1 a",
			"ta": "tan 1 a",
			"dl": "mod w h 0",
			"rw": "*/ dl 51965 100000",
			"lM": "+- dl 0 rw",
			"xM": "*/ ca lM 2",
			"yM": "*/ sa lM 2",
			"dxAM": "*/ sa th 2",
			"dyAM": "*/ ca th 2",
			"xA": "+- xM 0 dxAM",
			"yA": "+- yM dyAM 0",
			"xB": "+- xM dxAM 0",
			"yB": "+- yM 0 dyAM",
			"xBC": "+- hc 0 xB",
			"yBC": "*/ xBC ta 1",
			"yC": "+- yBC yB 0",
			"xD": "+- r 0 xB",
			"xE": "+- r 0 xA",
			"yFE": "+- vc 0 yA",
			"xFE": "*/ yFE 1 ta",
			"xF": "+- xE 0 xFE",
			"xL": "+- xA xFE 0",
			"yG": "+- b 0 yA",
			"yH": "+- b 0 yB",
			"yI": "+- b 0 yC",
			"xC2": "+- r 0 xM",
			"yC3": "+- b 0 yM"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "51965",
				"pos": {
					"x": "l",
					"y": "th"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd2",
				"pos": {
					"x": "xM",
					"y": "yM"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "xC2",
					"y": "yM"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "xC2",
					"y": "yC3"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "xM",
					"y": "yC3"
				}
			}]
		},
		"rect": {
			"l": "xA",
			"t": "yB",
			"r": "xE",
			"b": "yH"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "xA",
							"y": "yA"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB",
							"y": "yB"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "yC"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD",
							"y": "yB"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xE",
							"y": "yA"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xF",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xE",
							"y": "yG"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xD",
							"y": "yH"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "yI"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xB",
							"y": "yH"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xA",
							"y": "yG"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xL",
							"y": "vc"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"mathNotEqual": {
		"avLst": {
			"adj1": "val 23520",
			"adj2": "val 6600000",
			"adj3": "val 11760"
		},
		"gdLst": {
			"a1": "pin 0 adj1 50000",
			"crAng": "pin 4200000 adj2 6600000",
			"2a1": "*/ a1 2 1",
			"maxAdj3": "+- 100000 0 2a1",
			"a3": "pin 0 adj3 maxAdj3",
			"dy1": "*/ h a1 100000",
			"dy2": "*/ h a3 200000",
			"dx1": "*/ w 73490 200000",
			"x1": "+- hc 0 dx1",
			"x8": "+- hc dx1 0",
			"y2": "+- vc 0 dy2",
			"y3": "+- vc dy2 0",
			"y1": "+- y2 0 dy1",
			"y4": "+- y3 dy1 0",
			"cadj2": "+- crAng 0 cd4",
			"xadj2": "tan hd2 cadj2",
			"len": "mod xadj2 hd2 0",
			"bhw": "*/ len dy1 hd2",
			"bhw2": "*/ bhw 1 2",
			"x7": "+- hc xadj2 bhw2",
			"dx67": "*/ xadj2 y1 hd2",
			"x6": "+- x7 0 dx67",
			"dx57": "*/ xadj2 y2 hd2",
			"x5": "+- x7 0 dx57",
			"dx47": "*/ xadj2 y3 hd2",
			"x4": "+- x7 0 dx47",
			"dx37": "*/ xadj2 y4 hd2",
			"x3": "+- x7 0 dx37",
			"dx27": "*/ xadj2 2 1",
			"x2": "+- x7 0 dx27",
			"rx7": "+- x7 bhw 0",
			"rx6": "+- x6 bhw 0",
			"rx5": "+- x5 bhw 0",
			"rx4": "+- x4 bhw 0",
			"rx3": "+- x3 bhw 0",
			"rx2": "+- x2 bhw 0",
			"dx7": "*/ dy1 hd2 len",
			"rxt": "+- x7 dx7 0",
			"lxt": "+- rx7 0 dx7",
			"rx": "?: cadj2 rxt rx7",
			"lx": "?: cadj2 x7 lxt",
			"dy3": "*/ dy1 xadj2 len",
			"dy4": "+- 0 0 dy3",
			"ry": "?: cadj2 dy3 t",
			"ly": "?: cadj2 t dy4",
			"dlx": "+- w 0 rx",
			"drx": "+- w 0 lx",
			"dly": "+- h 0 ry",
			"dry": "+- h 0 ly",
			"xC1": "+/ rx lx 2",
			"xC2": "+/ drx dlx 2",
			"yC1": "+/ ry ly 2",
			"yC2": "+/ y1 y2 2",
			"yC3": "+/ y3 y4 2",
			"yC4": "+/ dry dly 2"
		},
		"ahLst": {
			"ahXY": [{
/*				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "50000",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {*/
				"gdRefY": "adj3",
				"minY": "0",
				"maxY": "maxAdj3",
				"pos": {
					"x": "r",
					"y": "y2"
				}
			}]/*,
			"ahPolar": {
				"gdRefAng": "adj2",
				"minAng": "4200000",
				"maxAng": "6600000",
				"pos": {
					"x": "lx",
					"y": "t"
				}
			}*/
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x8",
					"y": "yC2"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x8",
					"y": "yC3"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "xC2",
					"y": "yC4"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "yC2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "yC3"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "xC1",
					"y": "yC1"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "y1",
			"r": "x8",
			"b": "y4"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "lx",
							"y": "ly"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "rx",
							"y": "ry"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "rx6",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "rx5",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "rx4",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "rx3",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "drx",
							"y": "dry"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "dlx",
							"y": "dly"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"mathPlus": {
		"avLst": {
			"adj1": "val 23520"
		},
		"gdLst": {
			"a1": "pin 0 adj1 73490",
			"dx1": "*/ w 73490 200000",
			"dy1": "*/ h 73490 200000",
			"dx2": "*/ ss a1 200000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc dx2 0",
			"x4": "+- hc dx1 0",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc 0 dx2",
			"y3": "+- vc dx2 0",
			"y4": "+- vc dy1 0"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "73490",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "y4"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "y2",
			"r": "x4",
			"b": "y3"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"moon": {
		"avLst": {
			"adj": "val 50000"
		},
		"gdLst": {
			"a": "pin 0 adj 87500",
			"g0": "*/ ss a 100000",
			"g0w": "*/ g0 w ss",
			"g1": "+- ss 0 g0",
			"g2": "*/ g0 g0 g1",
			"g3": "*/ ss ss g1",
			"g4": "*/ g3 2 1",
			"g5": "+- g4 0 g2",
			"g6": "+- g5 0 g0",
			"g6w": "*/ g6 w ss",
			"g7": "*/ g5 1 2",
			"g8": "+- g7 0 g0",
			"dy1": "*/ g8 hd2 ss",
			"g10h": "+- vc 0 dy1",
			"g11h": "+- vc dy1 0",
			"g12": "*/ g0 9598 32768",
			"g12w": "*/ g12 w ss",
			"g13": "+- ss 0 g12",
			"q1": "*/ ss ss 1",
			"q2": "*/ g13 g13 1",
			"q3": "+- q1 0 q2",
			"q4": "sqrt q3",
			"dy4": "*/ q4 hd2 ss",
			"g15h": "+- vc 0 dy4",
			"g16h": "+- vc dy4 0",
			"g17w": "+- g6w 0 g0w",
			"g18w": "*/ g17w 1 2",
			"dx2p": "+- g0w g18w w",
			"dx2": "*/ dx2p -1 1",
			"dy2": "*/ hd2 -1 1",
			"stAng1": "at2 dx2 dy2",
			"enAngp1": "at2 dx2 hd2",
			"enAng1": "+- enAngp1 0 21600000",
			"swAng1": "+- enAng1 0 stAng1"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "87500",
				"pos": {
					"x": "g0w",
					"y": "vc"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "r",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "r",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "g0w",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "g12w",
			"t": "g15h",
			"r": "g0w",
			"b": "g16h"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "hd2",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "g18w",
						"hR": "dy1",
						"stAng": "stAng1",
						"swAng": "swAng1"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"nonIsoscelesTrapezoid": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 25000"
		},
		"gdLst": {
			"maxAdj": "*/ 50000 w ss",
			"a1": "pin 0 adj1 maxAdj",
			"a2": "pin 0 adj2 maxAdj",
			"x1": "*/ ss a1 200000",
			"x2": "*/ ss a1 100000",
			"dx3": "*/ ss a2 100000",
			"x3": "+- r 0 dx3",
			"x4": "+/ r x3 2",
			"il": "*/ wd3 a1 maxAdj",
			"adjm": "max a1 a2",
			"it": "*/ hd3 adjm maxAdj",
			"irt": "*/ wd3 a2 maxAdj",
			"ir": "+- r 0 irt"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "maxAdj",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj",
				"pos": {
					"x": "x3",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"noSmoking": {
		"avLst": {
			"adj": "val 18750"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"dr": "*/ ss a 100000",
			"iwd2": "+- wd2 0 dr",
			"ihd2": "+- hd2 0 dr",
			"ang": "at2 w h",
			"ct": "cos ihd2 ang",
			"st": "sin iwd2 ang",
			"m": "mod ct st 0",
			"n": "*/ iwd2 ihd2 m",
			"drd2": "*/ dr 1 2",
			"dang": "at2 n drd2",
			"2dang": "*/ dang 2 1",
			"swAng": "+- -10800000 2dang 0",
			"t3": "at2 w h",
			"stAng1": "+- t3 0 dang",
			"stAng2": "+- stAng1 0 cd2",
			"ct1": "cos ihd2 stAng1",
			"st1": "sin iwd2 stAng1",
			"m1": "mod ct1 st1 0",
			"n1": "*/ iwd2 ihd2 m1",
			"dx1": "cos n1 stAng1",
			"dy1": "sin n1 stAng1",
			"x1": "+- hc dx1 0",
			"y1": "+- vc dy1 0",
			"x2": "+- hc 0 dx1",
			"y2": "+- vc 0 dy1",
			"idx": "cos wd2 2700000",
			"idy": "sin hd2 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"ahLst": {
			"ahPolar": {
				"gdRefR": "adj",
				"minR": "0",
				"maxR": "50000",
				"pos": {
					"x": "dr",
					"y": "vc"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "il",
					"y": "it"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "il",
					"y": "ib"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "ir",
					"y": "ib"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "ir",
					"y": "it"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "iwd2",
						"hR": "ihd2",
						"stAng": "stAng1",
						"swAng": "swAng"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "iwd2",
						"hR": "ihd2",
						"stAng": "stAng2",
						"swAng": "swAng"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"notchedRightArrow": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000"
		},
		"gdLst": {
			"maxAdj2": "*/ 100000 w ss",
			"a1": "pin 0 adj1 100000",
			"a2": "pin 0 adj2 maxAdj2",
			"dx2": "*/ ss a2 100000",
			"x2": "+- r 0 dx2",
			"dy1": "*/ h a1 200000",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc dy1 0",
			"x1": "*/ dy1 dx2 hd2",
			"x3": "+- r 0 x1"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "100000",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x2",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "y1",
			"r": "x3",
			"b": "y2"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "vc"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"octagon": {
		"avLst": {
			"adj": "val 29289"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"x1": "*/ ss a 100000",
			"x2": "+- r 0 x1",
			"y2": "+- b 0 x1",
			"il": "*/ x1 1 2",
			"ir": "+- r 0 il",
			"ib": "+- b 0 il"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "x1"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x2",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x1",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "x1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "il",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"parallelogram": {
		"avLst": {
			"adj": "val 25000"
		},
		"gdLst": {
			"maxAdj": "*/ 100000 w ss",
			"a": "pin 0 adj maxAdj",
			"x1": "*/ ss a 200000",
			"x2": "*/ ss a 100000",
			"x6": "+- r 0 x1",
			"x5": "+- r 0 x2",
			"x3": "*/ x5 1 2",
			"x4": "+- r 0 x3",
			"il": "*/ q2 w 1",
			"q1": "*/ 5 a maxAdj",
			"q2": "+/ 1 q1 12",
			"it": "*/ q2 h 1",
			"ir": "+- r 0 il",
			"ib": "+- b 0 it",
			"q3": "*/ h hc x2",
			"y1": "pin 0 q3 h",
			"y2": "+- b 0 y1"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "maxAdj",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "y2"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x4",
					"y": "t"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x6",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "y1"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"pentagon": {
		"avLst": {
			"hf": "val 105146",
			"vf": "val 110557"
		},
		"gdLst": {
			"swd2": "*/ wd2 hf 100000",
			"shd2": "*/ hd2 vf 100000",
			"svc": "*/ vc vf 100000",
			"dx1": "cos swd2 1080000",
			"dx2": "cos swd2 18360000",
			"dy1": "sin shd2 1080000",
			"dy2": "sin shd2 18360000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc dx2 0",
			"x4": "+- hc dx1 0",
			"y1": "+- svc 0 dy1",
			"y2": "+- svc 0 dy2",
			"it": "*/ y1 dx2 dx1"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "y2"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "x2",
			"t": "it",
			"r": "x3",
			"b": "y2"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"pie": {
		"avLst": {
			"adj1": "val 0",
			"adj2": "val 16200000"
		},
		"gdLst": {
			"stAng": "pin 0 adj1 21599999",
			"enAng": "pin 0 adj2 21599999",
			"sw1": "+- enAng 0 stAng",
			"sw2": "+- sw1 21600000 0",
			"swAng": "?: sw1 sw1 sw2",
			"wt1": "sin wd2 stAng",
			"ht1": "cos hd2 stAng",
			"dx1": "cat2 wd2 ht1 wt1",
			"dy1": "sat2 hd2 ht1 wt1",
			"x1": "+- hc dx1 0",
			"y1": "+- vc dy1 0",
			"wt2": "sin wd2 enAng",
			"ht2": "cos hd2 enAng",
			"dx2": "cat2 wd2 ht2 wt2",
			"dy2": "sat2 hd2 ht2 wt2",
			"x2": "+- hc dx2 0",
			"y2": "+- vc dy2 0",
			"idx": "cos wd2 2700000",
			"idy": "sin hd2 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"ahLst": {
			"ahPolar": [{
				"gdRefAng": "adj1",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"gdRefAng": "adj2",
				"minAng": "0",
				"maxAng": "21599999",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "stAng",
						"swAng": "swAng"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "vc"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"pieWedge": {
		"gdLst": {
			"g1": "cos w 13500000",
			"g2": "sin h 13500000",
			"x1": "+- r g1 0",
			"y1": "+- b g2 0"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "y1",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "h",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"plaque": {
		"avLst": {
			"adj": "val 16667"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"x1": "*/ ss a 100000",
			"x2": "+- r 0 x1",
			"y2": "+- b 0 x1",
			"il": "*/ x1 70711 100000",
			"ir": "+- r 0 il",
			"ib": "+- b 0 il"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "il",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "x1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd2",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "3cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "0",
						"swAng": "-5400000"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"plaqueTabs": {
		"gdLst": {
			"md": "mod w h 0",
			"dx": "*/ 1 md 20",
			"y1": "+- 0 b dx",
			"x1": "+- 0 r dx"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "dx"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "b"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "dx",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "dx",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x1",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "t"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "dx"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "b"
				}
			}]
		},
		"rect": {
			"l": "dx",
			"t": "dx",
			"r": "x1",
			"b": "y1"
		},
		"pathLst": {
			"path": [{
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "dx",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "dx",
						"hR": "dx",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}, {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "dx",
						"hR": "dx",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "dx"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "dx",
						"hR": "dx",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}, {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "dx",
						"hR": "dx",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"plus": {
		"avLst": {
			"adj": "val 25000"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"x1": "*/ ss a 100000",
			"x2": "+- r 0 x1",
			"y2": "+- b 0 x1",
			"d": "+- w 0 h",
			"il": "?: d l x1",
			"ir": "?: d r x2",
			"it": "?: d x1 t",
			"ib": "?: d y2 b"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"quadArrow": {
		"avLst": {
			"adj1": "val 22500",
			"adj2": "val 22500",
			"adj3": "val 22500"
		},
		"gdLst": {
			"a2": "pin 0 adj2 50000",
			"maxAdj1": "*/ a2 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"q1": "+- 100000 0 maxAdj1",
			"maxAdj3": "*/ q1 1 2",
			"a3": "pin 0 adj3 maxAdj3",
			"x1": "*/ ss a3 100000",
			"dx2": "*/ ss a2 100000",
			"x2": "+- hc 0 dx2",
			"x5": "+- hc dx2 0",
			"dx3": "*/ ss a1 200000",
			"x3": "+- hc 0 dx3",
			"x4": "+- hc dx3 0",
			"x6": "+- r 0 x1",
			"y2": "+- vc 0 dx2",
			"y5": "+- vc dx2 0",
			"y3": "+- vc 0 dx3",
			"y4": "+- vc dx3 0",
			"y6": "+- b 0 x1",
			"il": "*/ dx3 x1 dx2",
			"ir": "+- r 0 il"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "maxAdj1",
				"pos": {
					"x": "x3",
					"y": "x1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}, {
				"gdRefY": "adj3",
				"minY": "0",
				"maxY": "maxAdj3",
				"pos": {
					"x": "r",
					"y": "x1"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "y3",
			"r": "ir",
			"b": "y4"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "x1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y5"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"quadArrowCallout": {
		"avLst": {
			"adj1": "val 18515",
			"adj2": "val 18515",
			"adj3": "val 18515",
			"adj4": "val 48123"
		},
		"gdLst": {
			"a2": "pin 0 adj2 50000",
			"maxAdj1": "*/ a2 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"maxAdj3": "+- 50000 0 a2",
			"a3": "pin 0 adj3 maxAdj3",
			"q2": "*/ a3 2 1",
			"maxAdj4": "+- 100000 0 q2",
			"a4": "pin a1 adj4 maxAdj4",
			"dx2": "*/ ss a2 100000",
			"dx3": "*/ ss a1 200000",
			"ah": "*/ ss a3 100000",
			"dx1": "*/ w a4 200000",
			"dy1": "*/ h a4 200000",
			"x8": "+- r 0 ah",
			"x2": "+- hc 0 dx1",
			"x7": "+- hc dx1 0",
			"x3": "+- hc 0 dx2",
			"x6": "+- hc dx2 0",
			"x4": "+- hc 0 dx3",
			"x5": "+- hc dx3 0",
			"y8": "+- b 0 ah",
			"y2": "+- vc 0 dy1",
			"y7": "+- vc dy1 0",
			"y3": "+- vc 0 dx2",
			"y6": "+- vc dx2 0",
			"y4": "+- vc 0 dx3",
			"y5": "+- vc dx3 0"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "maxAdj1",
				"pos": {
					"x": "x4",
					"y": "ah"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x3",
					"y": "t"
				}
			}, {
				"gdRefY": "adj3",
				"minY": "0",
				"maxY": "maxAdj3",
				"pos": {
					"x": "r",
					"y": "ah"
				}
			}, {
				"gdRefY": "adj4",
				"minY": "a1",
				"maxY": "maxAdj4",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "x2",
			"t": "y2",
			"r": "x7",
			"b": "y7"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ah",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ah",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ah"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "ah"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "ah"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "ah"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ah",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ah",
							"y": "y6"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"rect": {
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"ribbon": {
		"avLst": {
			"adj1": "val 16667",
			"adj2": "val 50000"
		},
		"gdLst": {
			"a1": "pin 0 adj1 33333",
			"a2": "pin 25000 adj2 75000",
			"x10": "+- r 0 wd8",
			"dx2": "*/ w a2 200000",
			"x2": "+- hc 0 dx2",
			"x9": "+- hc dx2 0",
			"x3": "+- x2 wd32 0",
			"x8": "+- x9 0 wd32",
			"x5": "+- x2 wd8 0",
			"x6": "+- x9 0 wd8",
			"x4": "+- x5 0 wd32",
			"x7": "+- x6 wd32 0",
			"y1": "*/ h a1 200000",
			"y2": "*/ h a1 100000",
			"y4": "+- b 0 y2",
			"y3": "*/ y4 1 2",
			"hR": "*/ h a1 400000",
			"y5": "+- b 0 hR",
			"y6": "+- y2 0 hR"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "33333",
				"pos": {
					"x": "hc",
					"y": "y2"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "25000",
				"maxX": "75000",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "y2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "wd8",
					"y": "y3"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x10",
					"y": "y3"
				}
			}]
		},
		"rect": {
			"l": "x2",
			"t": "y2",
			"r": "x9",
			"b": "b"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x10",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y5"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "wd8",
							"y": "y3"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darkenLess",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "hR"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "hR"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd2",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x10",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y5"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "wd8",
							"y": "y3"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "hR"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y2"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "hR"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y6"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y4"
						}]
					}
				}]
			}]
		}
	},
	"ribbon2": {
		"avLst": {
			"adj1": "val 16667",
			"adj2": "val 50000"
		},
		"gdLst": {
			"a1": "pin 0 adj1 33333",
			"a2": "pin 25000 adj2 75000",
			"x10": "+- r 0 wd8",
			"dx2": "*/ w a2 200000",
			"x2": "+- hc 0 dx2",
			"x9": "+- hc dx2 0",
			"x3": "+- x2 wd32 0",
			"x8": "+- x9 0 wd32",
			"x5": "+- x2 wd8 0",
			"x6": "+- x9 0 wd8",
			"x4": "+- x5 0 wd32",
			"x7": "+- x6 wd32 0",
			"dy1": "*/ h a1 200000",
			"y1": "+- b 0 dy1",
			"dy2": "*/ h a1 100000",
			"y2": "+- b 0 dy2",
			"y4": "+- t dy2 0",
			"y3": "+/ y4 b 2",
			"hR": "*/ h a1 400000",
			"y6": "+- b 0 hR",
			"y7": "+- y1 0 hR"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "33333",
				"pos": {
					"x": "hc",
					"y": "y2"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "25000",
				"maxX": "75000",
				"pos": {
					"x": "x2",
					"y": "b"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "wd8",
					"y": "y3"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "y2"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x10",
					"y": "y3"
				}
			}]
		},
		"rect": {
			"l": "x2",
			"t": "t",
			"r": "x9",
			"b": "y2"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x10",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "hR"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "0",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "wd8",
							"y": "y3"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"stroke": "false",
				"fill": "darkenLess",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y6"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "0",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y6"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "wd8",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "hR"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x10",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd32",
						"hR": "hR",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y6"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y4"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y7"
						}]
					}
				}]
			}]
		}
	},
	"rightArrow": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000"
		},
		"gdLst": {
			"maxAdj2": "*/ 100000 w ss",
			"a1": "pin 0 adj1 100000",
			"a2": "pin 0 adj2 maxAdj2",
			"dx1": "*/ ss a2 100000",
			"x1": "+- r 0 dx1",
			"dy1": "*/ h a1 200000",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc dy1 0",
			"dx2": "*/ y1 dx1 hd2",
			"x2": "+- x1 dx2 0"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "100000",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x1",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "y1",
			"r": "x2",
			"b": "y2"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"rightArrowCallout": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 25000",
			"adj3": "val 25000",
			"adj4": "val 64977"
		},
		"gdLst": {
			"maxAdj2": "*/ 50000 h ss",
			"a2": "pin 0 adj2 maxAdj2",
			"maxAdj1": "*/ a2 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"maxAdj3": "*/ 100000 w ss",
			"a3": "pin 0 adj3 maxAdj3",
			"q2": "*/ a3 ss w",
			"maxAdj4": "+- 100000 0 q2",
			"a4": "pin 0 adj4 maxAdj4",
			"dy1": "*/ ss a2 100000",
			"dy2": "*/ ss a1 200000",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc 0 dy2",
			"y3": "+- vc dy2 0",
			"y4": "+- vc dy1 0",
			"dx3": "*/ ss a3 100000",
			"x3": "+- r 0 dx3",
			"x2": "*/ w a4 100000",
			"x1": "*/ x2 1 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "maxAdj1",
				"pos": {
					"x": "x3",
					"y": "y2"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "0",
				"maxY": "maxAdj2",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj3",
				"minX": "0",
				"maxX": "maxAdj3",
				"pos": {
					"x": "x3",
					"y": "t"
				}
			}, {
				"gdRefX": "adj4",
				"minX": "0",
				"maxX": "maxAdj4",
				"pos": {
					"x": "x2",
					"y": "b"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x1",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "x2",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"rightBrace": {
		"avLst": {
			"adj1": "val 8333",
			"adj2": "val 50000"
		},
		"gdLst": {
			"a2": "pin 0 adj2 100000",
			"q1": "+- 100000 0 a2",
			"q2": "min q1 a2",
			"q3": "*/ q2 1 2",
			"maxAdj1": "*/ q3 h ss",
			"a1": "pin 0 adj1 maxAdj1",
			"y1": "*/ ss a1 100000",
			"y3": "*/ h a2 100000",
			"y2": "+- y3 0 y1",
			"y4": "+- b 0 y1",
			"dx1": "cos wd2 2700000",
			"dy1": "sin y1 2700000",
			"ir": "+- l dx1 0",
			"it": "+- y1 0 dy1",
			"ib": "+- b dy1 y1"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "maxAdj1",
				"pos": {
					"x": "hc",
					"y": "y1"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "0",
				"maxY": "100000",
				"pos": {
					"x": "r",
					"y": "y3"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd4",
				"pos": {
					"x": "l",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "r",
					"y": "y3"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "l",
					"y": "b"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "cd2",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "3cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "y4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "cd2",
						"swAng": "-5400000"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "3cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "y4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "y1",
						"stAng": "0",
						"swAng": "cd4"
					}
				}]
			}]
		}
	},
	"rightBracket": {
		"avLst": {
			"adj": "val 8333"
		},
		"gdLst": {
			"maxAdj": "*/ 50000 h ss",
			"a": "pin 0 adj maxAdj",
			"y1": "*/ ss a 100000",
			"y2": "+- b 0 y1",
			"dx1": "cos w 2700000",
			"dy1": "sin y1 2700000",
			"ir": "+- l dx1 0",
			"it": "+- y1 0 dy1",
			"ib": "+- b dy1 y1"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "maxAdj",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd4",
				"pos": {
					"x": "l",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "l",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "y1",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "y1",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "y1",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "w",
						"hR": "y1",
						"stAng": "0",
						"swAng": "cd4"
					}
				}]
			}]
		}
	},
	"round1Rect": {
		"avLst": {
			"adj": "val 16667"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"dx1": "*/ ss a 100000",
			"x1": "+- r 0 dx1",
			"idx": "*/ dx1 29289 100000",
			"ir": "+- r 0 idx"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "ir",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "dx1",
						"hR": "dx1",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"round2DiagRect": {
		"avLst": {
			"adj1": "val 16667",
			"adj2": "val 0"
		},
		"gdLst": {
			"a1": "pin 0 adj1 50000",
			"a2": "pin 0 adj2 50000",
			"x1": "*/ ss a1 100000",
			"y1": "+- b 0 x1",
			"a": "*/ ss a2 100000",
			"x2": "+- r 0 a",
			"y2": "+- b 0 a",
			"dx1": "*/ x1 29289 100000",
			"dx2": "*/ a 29289 100000",
			"d": "+- dx1 0 dx2",
			"dx": "?: d dx1 dx2",
			"ir": "+- r 0 dx",
			"ib": "+- b 0 dx"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "dx",
			"t": "dx",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "a",
						"hR": "a",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "a",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "a",
						"hR": "a",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "x1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"round2SameRect": {
		"avLst": {
			"adj1": "val 16667",
			"adj2": "val 0"
		},
		"gdLst": {
			"a1": "pin 0 adj1 50000",
			"a2": "pin 0 adj2 50000",
			"tx1": "*/ ss a1 100000",
			"tx2": "+- r 0 tx1",
			"bx1": "*/ ss a2 100000",
			"bx2": "+- r 0 bx1",
			"by1": "+- b 0 bx1",
			"d": "+- tx1 0 bx1",
			"tdx": "*/ tx1 29289 100000",
			"bdx": "*/ bx1 29289 100000",
			"il": "?: d tdx bdx",
			"ir": "+- r 0 il",
			"ib": "+- b 0 bdx"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "tx2",
					"y": "t"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "bx1",
					"y": "b"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "tdx",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "tx1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "tx2",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "tx1",
						"hR": "tx1",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "by1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "bx1",
						"hR": "bx1",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "bx1",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "bx1",
						"hR": "bx1",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "tx1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "tx1",
						"hR": "tx1",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"roundRect": {
		"avLst": {
			"adj": "val 16667"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"x1": "*/ ss a 100000",
			"x2": "+- r 0 x1",
			"y2": "+- b 0 x1",
			"il": "*/ x1 29289 100000",
			"ir": "+- r 0 il",
			"ib": "+- b 0 il"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "il",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "x1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"rtTriangle": {
		"gdLst": {
			"it": "*/ h 7 12",
			"ir": "*/ w 7 12",
			"ib": "*/ h 11 12"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "l",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "l",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "r",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "hc",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "wd12",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"smileyFace": {
		"avLst": {
			"adj": "val 4653"
		},
		"gdLst": {
			"a": "pin -4653 adj 4653",
			"x1": "*/ w 4969 21699",
			"x2": "*/ w 6215 21600",
			"x3": "*/ w 13135 21600",
			"x4": "*/ w 16640 21600",
			"y1": "*/ h 7570 21600",
			"y3": "*/ h 16515 21600",
			"dy2": "*/ h a 100000",
			"y2": "+- y3 0 dy2",
			"y4": "+- y3 dy2 0",
			"dy3": "*/ h a 50000",
			"y5": "+- y4 dy3 0",
			"idx": "cos wd2 2700000",
			"idy": "sin hd2 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0",
			"wR": "*/ w 1125 21600",
			"hR": "*/ h 1125 21600"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "-4653",
				"maxY": "4653",
				"pos": {
					"x": "hc",
					"y": "y4"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "il",
					"y": "it"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "il",
					"y": "ib"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "ir",
					"y": "ib"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "ir",
					"y": "it"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd2",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "darkenLess",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "hR",
						"stAng": "cd2",
						"swAng": "21600000"
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "hR",
						"stAng": "cd2",
						"swAng": "21600000"
					}
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "y5"
						}, {
							"x": "x4",
							"y": "y2"
						}]
					}
				}]
			}, {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd2",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"snip1Rect": {
		"avLst": {
			"adj": "val 16667"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"dx1": "*/ ss a 100000",
			"x1": "+- r 0 dx1",
			"it": "*/ dx1 1 2",
			"ir": "+/ x1 r 2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "it",
			"r": "ir",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "dx1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"snip2DiagRect": {
		"avLst": {
			"adj1": "val 0",
			"adj2": "val 16667"
		},
		"gdLst": {
			"a1": "pin 0 adj1 50000",
			"a2": "pin 0 adj2 50000",
			"lx1": "*/ ss a1 100000",
			"lx2": "+- r 0 lx1",
			"ly1": "+- b 0 lx1",
			"rx1": "*/ ss a2 100000",
			"rx2": "+- r 0 rx1",
			"ry1": "+- b 0 rx1",
			"d": "+- lx1 0 rx1",
			"dx": "?: d lx1 rx1",
			"il": "*/ dx 1 2",
			"ir": "+- r 0 il",
			"ib": "+- b 0 il"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "lx1",
					"y": "t"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "rx2",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "il",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "lx1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "rx2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "rx1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "ly1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "lx2",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "rx1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "ry1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "lx1"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"snip2SameRect": {
		"avLst": {
			"adj1": "val 16667",
			"adj2": "val 0"
		},
		"gdLst": {
			"a1": "pin 0 adj1 50000",
			"a2": "pin 0 adj2 50000",
			"tx1": "*/ ss a1 100000",
			"tx2": "+- r 0 tx1",
			"bx1": "*/ ss a2 100000",
			"bx2": "+- r 0 bx1",
			"by1": "+- b 0 bx1",
			"d": "+- tx1 0 bx1",
			"dx": "?: d tx1 bx1",
			"il": "*/ dx 1 2",
			"ir": "+- r 0 il",
			"it": "*/ tx1 1 2",
			"ib": "+/ by1 b 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "tx2",
					"y": "t"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "bx1",
					"y": "b"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "tx1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "tx2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "tx1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "by1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "bx2",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "bx1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "by1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "tx1"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"snipRoundRect": {
		"avLst": {
			"adj1": "val 16667",
			"adj2": "val 16667"
		},
		"gdLst": {
			"a1": "pin 0 adj1 50000",
			"a2": "pin 0 adj2 50000",
			"x1": "*/ ss a1 100000",
			"dx2": "*/ ss a2 100000",
			"x2": "+- r 0 dx2",
			"il": "*/ x1 29289 100000",
			"ir": "+/ x2 r 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "50000",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "il",
			"r": "ir",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "dx2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "x1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "x1",
						"hR": "x1",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"squareTabs": {
		"gdLst": {
			"md": "mod w h 0",
			"dx": "*/ 1 md 20",
			"y1": "+- 0 b dx",
			"x1": "+- 0 r dx"
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "dx"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "dx",
					"y": "dx"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "dx",
					"y": "x1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "dx",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "dx",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x1",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "t"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "dx"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x1",
					"y": "dx"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "dx",
			"t": "dx",
			"r": "x1",
			"b": "y1"
		},
		"pathLst": {
			"path": [{
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "dx",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "dx",
							"y": "dx"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "dx"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "dx",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "dx",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "dx"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "dx"
						}]
					}
				}, {
					"op": "close"
				}]
			}, {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}]
		}
	},
	"star10": {
		"avLst": {
			"adj": "val 42533",
			"hf": "val 105146"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"swd2": "*/ wd2 hf 100000",
			"dx1": "*/ swd2 95106 100000",
			"dx2": "*/ swd2 58779 100000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc dx2 0",
			"x4": "+- hc dx1 0",
			"dy1": "*/ hd2 80902 100000",
			"dy2": "*/ hd2 30902 100000",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc 0 dy2",
			"y3": "+- vc dy2 0",
			"y4": "+- vc dy1 0",
			"iwd2": "*/ swd2 a 50000",
			"ihd2": "*/ hd2 a 50000",
			"sdx1": "*/ iwd2 80902 100000",
			"sdx2": "*/ iwd2 30902 100000",
			"sdy1": "*/ ihd2 95106 100000",
			"sdy2": "*/ ihd2 58779 100000",
			"sx1": "+- hc 0 iwd2",
			"sx2": "+- hc 0 sdx1",
			"sx3": "+- hc 0 sdx2",
			"sx4": "+- hc sdx2 0",
			"sx5": "+- hc sdx1 0",
			"sx6": "+- hc iwd2 0",
			"sy1": "+- vc 0 sdy1",
			"sy2": "+- vc 0 sdy2",
			"sy3": "+- vc sdy2 0",
			"sy4": "+- vc sdy1 0",
			"yAdj": "+- vc 0 ihd2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "50000",
				"pos": {
					"x": "hc",
					"y": "yAdj"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "y2"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "y3"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "y4"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x2",
					"y": "y4"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y3"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y2"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x2",
					"y": "y1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x3",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "sx2",
			"t": "sy2",
			"r": "sx5",
			"b": "sy3"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx5",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx6",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx5",
							"y": "sy3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "vc"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"star12": {
		"avLst": {
			"adj": "val 37500"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"dx1": "cos wd2 1800000",
			"dy1": "sin hd2 3600000",
			"x1": "+- hc 0 dx1",
			"x3": "*/ w 3 4",
			"x4": "+- hc dx1 0",
			"y1": "+- vc 0 dy1",
			"y3": "*/ h 3 4",
			"y4": "+- vc dy1 0",
			"iwd2": "*/ wd2 a 50000",
			"ihd2": "*/ hd2 a 50000",
			"sdx1": "cos iwd2 900000",
			"sdx2": "cos iwd2 2700000",
			"sdx3": "cos iwd2 4500000",
			"sdy1": "sin ihd2 4500000",
			"sdy2": "sin ihd2 2700000",
			"sdy3": "sin ihd2 900000",
			"sx1": "+- hc 0 sdx1",
			"sx2": "+- hc 0 sdx2",
			"sx3": "+- hc 0 sdx3",
			"sx4": "+- hc sdx3 0",
			"sx5": "+- hc sdx2 0",
			"sx6": "+- hc sdx1 0",
			"sy1": "+- vc 0 sdy1",
			"sy2": "+- vc 0 sdy2",
			"sy3": "+- vc 0 sdy3",
			"sy4": "+- vc sdy3 0",
			"sy5": "+- vc sdy2 0",
			"sy6": "+- vc sdy1 0",
			"yAdj": "+- vc 0 ihd2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "50000",
				"pos": {
					"x": "hc",
					"y": "yAdj"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "hd4"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "y3"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "y4"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "wd4",
					"y": "y4"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y3"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "hd4"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "wd4",
					"y": "y1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x3",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "sx2",
			"t": "sy2",
			"r": "sx5",
			"b": "sy5"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "hd4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "wd4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx5",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "hd4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx6",
							"y": "sy3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx6",
							"y": "sy4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx5",
							"y": "sy5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "wd4",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy4"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"star16": {
		"avLst": {
			"adj": "val 37500"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"dx1": "*/ wd2 92388 100000",
			"dx2": "*/ wd2 70711 100000",
			"dx3": "*/ wd2 38268 100000",
			"dy1": "*/ hd2 92388 100000",
			"dy2": "*/ hd2 70711 100000",
			"dy3": "*/ hd2 38268 100000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc 0 dx3",
			"x4": "+- hc dx3 0",
			"x5": "+- hc dx2 0",
			"x6": "+- hc dx1 0",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc 0 dy2",
			"y3": "+- vc 0 dy3",
			"y4": "+- vc dy3 0",
			"y5": "+- vc dy2 0",
			"y6": "+- vc dy1 0",
			"iwd2": "*/ wd2 a 50000",
			"ihd2": "*/ hd2 a 50000",
			"sdx1": "*/ iwd2 98079 100000",
			"sdx2": "*/ iwd2 83147 100000",
			"sdx3": "*/ iwd2 55557 100000",
			"sdx4": "*/ iwd2 19509 100000",
			"sdy1": "*/ ihd2 98079 100000",
			"sdy2": "*/ ihd2 83147 100000",
			"sdy3": "*/ ihd2 55557 100000",
			"sdy4": "*/ ihd2 19509 100000",
			"sx1": "+- hc 0 sdx1",
			"sx2": "+- hc 0 sdx2",
			"sx3": "+- hc 0 sdx3",
			"sx4": "+- hc 0 sdx4",
			"sx5": "+- hc sdx4 0",
			"sx6": "+- hc sdx3 0",
			"sx7": "+- hc sdx2 0",
			"sx8": "+- hc sdx1 0",
			"sy1": "+- vc 0 sdy1",
			"sy2": "+- vc 0 sdy2",
			"sy3": "+- vc 0 sdy3",
			"sy4": "+- vc 0 sdy4",
			"sy5": "+- vc sdy4 0",
			"sy6": "+- vc sdy3 0",
			"sy7": "+- vc sdy2 0",
			"sy8": "+- vc sdy1 0",
			"idx": "cos iwd2 2700000",
			"idy": "sin ihd2 2700000",
			"il": "+- hc 0 idx",
			"it": "+- vc 0 idy",
			"ir": "+- hc idx 0",
			"ib": "+- vc idy 0",
			"yAdj": "+- vc 0 ihd2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "50000",
				"pos": {
					"x": "hc",
					"y": "yAdj"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x5",
					"y": "y2"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x6",
					"y": "y3"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x6",
					"y": "y4"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x5",
					"y": "y5"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x4",
					"y": "y6"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "y6"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x2",
					"y": "y5"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y4"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y3"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x3",
					"y": "y1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x4",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx5",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx6",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx7",
							"y": "sy3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx8",
							"y": "sy4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx8",
							"y": "sy5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx7",
							"y": "sy6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx6",
							"y": "sy7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx5",
							"y": "sy8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy5"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"star24": {
		"avLst": {
			"adj": "val 37500"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"dx1": "cos wd2 900000",
			"dx2": "cos wd2 1800000",
			"dx3": "cos wd2 2700000",
			"dx4": "val wd4",
			"dx5": "cos wd2 4500000",
			"dy1": "sin hd2 4500000",
			"dy2": "sin hd2 3600000",
			"dy3": "sin hd2 2700000",
			"dy4": "val hd4",
			"dy5": "sin hd2 900000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc 0 dx3",
			"x4": "+- hc 0 dx4",
			"x5": "+- hc 0 dx5",
			"x6": "+- hc dx5 0",
			"x7": "+- hc dx4 0",
			"x8": "+- hc dx3 0",
			"x9": "+- hc dx2 0",
			"x10": "+- hc dx1 0",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc 0 dy2",
			"y3": "+- vc 0 dy3",
			"y4": "+- vc 0 dy4",
			"y5": "+- vc 0 dy5",
			"y6": "+- vc dy5 0",
			"y7": "+- vc dy4 0",
			"y8": "+- vc dy3 0",
			"y9": "+- vc dy2 0",
			"y10": "+- vc dy1 0",
			"iwd2": "*/ wd2 a 50000",
			"ihd2": "*/ hd2 a 50000",
			"sdx1": "*/ iwd2 99144 100000",
			"sdx2": "*/ iwd2 92388 100000",
			"sdx3": "*/ iwd2 79335 100000",
			"sdx4": "*/ iwd2 60876 100000",
			"sdx5": "*/ iwd2 38268 100000",
			"sdx6": "*/ iwd2 13053 100000",
			"sdy1": "*/ ihd2 99144 100000",
			"sdy2": "*/ ihd2 92388 100000",
			"sdy3": "*/ ihd2 79335 100000",
			"sdy4": "*/ ihd2 60876 100000",
			"sdy5": "*/ ihd2 38268 100000",
			"sdy6": "*/ ihd2 13053 100000",
			"sx1": "+- hc 0 sdx1",
			"sx2": "+- hc 0 sdx2",
			"sx3": "+- hc 0 sdx3",
			"sx4": "+- hc 0 sdx4",
			"sx5": "+- hc 0 sdx5",
			"sx6": "+- hc 0 sdx6",
			"sx7": "+- hc sdx6 0",
			"sx8": "+- hc sdx5 0",
			"sx9": "+- hc sdx4 0",
			"sx10": "+- hc sdx3 0",
			"sx11": "+- hc sdx2 0",
			"sx12": "+- hc sdx1 0",
			"sy1": "+- vc 0 sdy1",
			"sy2": "+- vc 0 sdy2",
			"sy3": "+- vc 0 sdy3",
			"sy4": "+- vc 0 sdy4",
			"sy5": "+- vc 0 sdy5",
			"sy6": "+- vc 0 sdy6",
			"sy7": "+- vc sdy6 0",
			"sy8": "+- vc sdy5 0",
			"sy9": "+- vc sdy4 0",
			"sy10": "+- vc sdy3 0",
			"sy11": "+- vc sdy2 0",
			"sy12": "+- vc sdy1 0",
			"idx": "cos iwd2 2700000",
			"idy": "sin ihd2 2700000",
			"il": "+- hc 0 idx",
			"it": "+- vc 0 idy",
			"ir": "+- hc idx 0",
			"ib": "+- vc idy 0",
			"yAdj": "+- vc 0 ihd2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "ssd2",
				"pos": {
					"x": "hc",
					"y": "yAdj"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx5",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx6",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx7",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx8",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx9",
							"y": "sy3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx10",
							"y": "sy4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx11",
							"y": "sy5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x10",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx12",
							"y": "sy6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx12",
							"y": "sy7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x10",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx11",
							"y": "sy8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx10",
							"y": "sy9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx9",
							"y": "sy10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx8",
							"y": "sy11"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx7",
							"y": "sy12"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx6",
							"y": "sy12"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx5",
							"y": "sy11"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy7"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"star32": {
		"avLst": {
			"adj": "val 37500"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"dx1": "*/ wd2 98079 100000",
			"dx2": "*/ wd2 92388 100000",
			"dx3": "*/ wd2 83147 100000",
			"dx4": "cos wd2 2700000",
			"dx5": "*/ wd2 55557 100000",
			"dx6": "*/ wd2 38268 100000",
			"dx7": "*/ wd2 19509 100000",
			"dy1": "*/ hd2 98079 100000",
			"dy2": "*/ hd2 92388 100000",
			"dy3": "*/ hd2 83147 100000",
			"dy4": "sin hd2 2700000",
			"dy5": "*/ hd2 55557 100000",
			"dy6": "*/ hd2 38268 100000",
			"dy7": "*/ hd2 19509 100000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc 0 dx3",
			"x4": "+- hc 0 dx4",
			"x5": "+- hc 0 dx5",
			"x6": "+- hc 0 dx6",
			"x7": "+- hc 0 dx7",
			"x8": "+- hc dx7 0",
			"x9": "+- hc dx6 0",
			"x10": "+- hc dx5 0",
			"x11": "+- hc dx4 0",
			"x12": "+- hc dx3 0",
			"x13": "+- hc dx2 0",
			"x14": "+- hc dx1 0",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc 0 dy2",
			"y3": "+- vc 0 dy3",
			"y4": "+- vc 0 dy4",
			"y5": "+- vc 0 dy5",
			"y6": "+- vc 0 dy6",
			"y7": "+- vc 0 dy7",
			"y8": "+- vc dy7 0",
			"y9": "+- vc dy6 0",
			"y10": "+- vc dy5 0",
			"y11": "+- vc dy4 0",
			"y12": "+- vc dy3 0",
			"y13": "+- vc dy2 0",
			"y14": "+- vc dy1 0",
			"iwd2": "*/ wd2 a 50000",
			"ihd2": "*/ hd2 a 50000",
			"sdx1": "*/ iwd2 99518 100000",
			"sdx2": "*/ iwd2 95694 100000",
			"sdx3": "*/ iwd2 88192 100000",
			"sdx4": "*/ iwd2 77301 100000",
			"sdx5": "*/ iwd2 63439 100000",
			"sdx6": "*/ iwd2 47140 100000",
			"sdx7": "*/ iwd2 29028 100000",
			"sdx8": "*/ iwd2 9802 100000",
			"sdy1": "*/ ihd2 99518 100000",
			"sdy2": "*/ ihd2 95694 100000",
			"sdy3": "*/ ihd2 88192 100000",
			"sdy4": "*/ ihd2 77301 100000",
			"sdy5": "*/ ihd2 63439 100000",
			"sdy6": "*/ ihd2 47140 100000",
			"sdy7": "*/ ihd2 29028 100000",
			"sdy8": "*/ ihd2 9802 100000",
			"sx1": "+- hc 0 sdx1",
			"sx2": "+- hc 0 sdx2",
			"sx3": "+- hc 0 sdx3",
			"sx4": "+- hc 0 sdx4",
			"sx5": "+- hc 0 sdx5",
			"sx6": "+- hc 0 sdx6",
			"sx7": "+- hc 0 sdx7",
			"sx8": "+- hc 0 sdx8",
			"sx9": "+- hc sdx8 0",
			"sx10": "+- hc sdx7 0",
			"sx11": "+- hc sdx6 0",
			"sx12": "+- hc sdx5 0",
			"sx13": "+- hc sdx4 0",
			"sx14": "+- hc sdx3 0",
			"sx15": "+- hc sdx2 0",
			"sx16": "+- hc sdx1 0",
			"sy1": "+- vc 0 sdy1",
			"sy2": "+- vc 0 sdy2",
			"sy3": "+- vc 0 sdy3",
			"sy4": "+- vc 0 sdy4",
			"sy5": "+- vc 0 sdy5",
			"sy6": "+- vc 0 sdy6",
			"sy7": "+- vc 0 sdy7",
			"sy8": "+- vc 0 sdy8",
			"sy9": "+- vc sdy8 0",
			"sy10": "+- vc sdy7 0",
			"sy11": "+- vc sdy6 0",
			"sy12": "+- vc sdy5 0",
			"sy13": "+- vc sdy4 0",
			"sy14": "+- vc sdy3 0",
			"sy15": "+- vc sdy2 0",
			"sy16": "+- vc sdy1 0",
			"idx": "cos iwd2 2700000",
			"idy": "sin ihd2 2700000",
			"il": "+- hc 0 idx",
			"it": "+- vc 0 idy",
			"ir": "+- hc idx 0",
			"ib": "+- vc idy 0",
			"yAdj": "+- vc 0 ihd2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "ssd2",
				"pos": {
					"x": "hc",
					"y": "yAdj"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx5",
							"y": "sy4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx6",
							"y": "sy3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx7",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx8",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx9",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx10",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx11",
							"y": "sy3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x10",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx12",
							"y": "sy4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x11",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx13",
							"y": "sy5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x12",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx14",
							"y": "sy6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x13",
							"y": "y6"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx15",
							"y": "sy7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x14",
							"y": "y7"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx16",
							"y": "sy8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx16",
							"y": "sy9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x14",
							"y": "y8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx15",
							"y": "sy10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x13",
							"y": "y9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx14",
							"y": "sy11"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x12",
							"y": "y10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx13",
							"y": "sy12"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x11",
							"y": "y11"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx12",
							"y": "sy13"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x10",
							"y": "y12"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx11",
							"y": "sy14"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y13"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx10",
							"y": "sy15"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y14"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx9",
							"y": "sy16"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx8",
							"y": "sy16"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y14"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx7",
							"y": "sy15"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y13"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx6",
							"y": "sy14"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y12"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx5",
							"y": "sy13"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y11"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy12"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy11"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y9"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y8"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy9"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"star4": {
		"avLst": {
			"adj": "val 12500"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"iwd2": "*/ wd2 a 50000",
			"ihd2": "*/ hd2 a 50000",
			"sdx": "cos iwd2 2700000",
			"sdy": "sin ihd2 2700000",
			"sx1": "+- hc 0 sdx",
			"sx2": "+- hc sdx 0",
			"sy1": "+- vc 0 sdy",
			"sy2": "+- vc sdy 0",
			"yAdj": "+- vc 0 ihd2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "50000",
				"pos": {
					"x": "hc",
					"y": "yAdj"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "sx1",
			"t": "sy1",
			"r": "sx2",
			"b": "sy2"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"star5": {
		"avLst": {
			"adj": "val 19098",
			"hf": "val 105146",
			"vf": "val 110557"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"swd2": "*/ wd2 hf 100000",
			"shd2": "*/ hd2 vf 100000",
			"svc": "*/ vc vf 100000",
			"dx1": "cos swd2 1080000",
			"dx2": "cos swd2 18360000",
			"dy1": "sin shd2 1080000",
			"dy2": "sin shd2 18360000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc dx2 0",
			"x4": "+- hc dx1 0",
			"y1": "+- svc 0 dy1",
			"y2": "+- svc 0 dy2",
			"iwd2": "*/ swd2 a 50000",
			"ihd2": "*/ shd2 a 50000",
			"sdx1": "cos iwd2 20520000",
			"sdx2": "cos iwd2 3240000",
			"sdy1": "sin ihd2 3240000",
			"sdy2": "sin ihd2 20520000",
			"sx1": "+- hc 0 sdx1",
			"sx2": "+- hc 0 sdx2",
			"sx3": "+- hc sdx2 0",
			"sx4": "+- hc sdx1 0",
			"sy1": "+- svc 0 sdy1",
			"sy2": "+- svc 0 sdy2",
			"sy3": "+- svc ihd2 0",
			"yAdj": "+- svc 0 ihd2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "50000",
				"pos": {
					"x": "hc",
					"y": "yAdj"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "y2"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "sx1",
			"t": "sy1",
			"r": "sx4",
			"b": "sy3"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "sy3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"star6": {
		"avLst": {
			"adj": "val 28868",
			"hf": "val 115470"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"swd2": "*/ wd2 hf 100000",
			"dx1": "cos swd2 1800000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc dx1 0",
			"y2": "+- vc hd4 0",
			"iwd2": "*/ swd2 a 50000",
			"ihd2": "*/ hd2 a 50000",
			"sdx2": "*/ iwd2 1 2",
			"sx1": "+- hc 0 iwd2",
			"sx2": "+- hc 0 sdx2",
			"sx3": "+- hc sdx2 0",
			"sx4": "+- hc iwd2 0",
			"sdy1": "sin ihd2 3600000",
			"sy1": "+- vc 0 sdy1",
			"sy2": "+- vc sdy1 0",
			"yAdj": "+- vc 0 ihd2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "50000",
				"pos": {
					"x": "hc",
					"y": "yAdj"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x2",
					"y": "hd4"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "hd4"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "sx1",
			"t": "sy1",
			"r": "sx4",
			"b": "sy2"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "hd4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "hd4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "vc"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"star7": {
		"avLst": {
			"adj": "val 34601",
			"hf": "val 102572",
			"vf": "val 105210"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"swd2": "*/ wd2 hf 100000",
			"shd2": "*/ hd2 vf 100000",
			"svc": "*/ vc vf 100000",
			"dx1": "*/ swd2 97493 100000",
			"dx2": "*/ swd2 78183 100000",
			"dx3": "*/ swd2 43388 100000",
			"dy1": "*/ shd2 62349 100000",
			"dy2": "*/ shd2 22252 100000",
			"dy3": "*/ shd2 90097 100000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc 0 dx3",
			"x4": "+- hc dx3 0",
			"x5": "+- hc dx2 0",
			"x6": "+- hc dx1 0",
			"y1": "+- svc 0 dy1",
			"y2": "+- svc dy2 0",
			"y3": "+- svc dy3 0",
			"iwd2": "*/ swd2 a 50000",
			"ihd2": "*/ shd2 a 50000",
			"sdx1": "*/ iwd2 97493 100000",
			"sdx2": "*/ iwd2 78183 100000",
			"sdx3": "*/ iwd2 43388 100000",
			"sx1": "+- hc 0 sdx1",
			"sx2": "+- hc 0 sdx2",
			"sx3": "+- hc 0 sdx3",
			"sx4": "+- hc sdx3 0",
			"sx5": "+- hc sdx2 0",
			"sx6": "+- hc sdx1 0",
			"sdy1": "*/ ihd2 90097 100000",
			"sdy2": "*/ ihd2 22252 100000",
			"sdy3": "*/ ihd2 62349 100000",
			"sy1": "+- svc 0 sdy1",
			"sy2": "+- svc 0 sdy2",
			"sy3": "+- svc sdy3 0",
			"sy4": "+- svc ihd2 0",
			"yAdj": "+- svc 0 ihd2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "50000",
				"pos": {
					"x": "hc",
					"y": "yAdj"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "x5",
					"y": "y1"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x6",
					"y": "y2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x4",
					"y": "y3"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x3",
					"y": "y3"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "y2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x2",
					"y": "y1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}]
		},
		"rect": {
			"l": "sx2",
			"t": "sy1",
			"r": "sx5",
			"b": "sy3"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx6",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx5",
							"y": "sy3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "sy4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy3"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"star8": {
		"avLst": {
			"adj": "val 37500"
		},
		"gdLst": {
			"a": "pin 0 adj 50000",
			"dx1": "cos wd2 2700000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc dx1 0",
			"dy1": "sin hd2 2700000",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc dy1 0",
			"iwd2": "*/ wd2 a 50000",
			"ihd2": "*/ hd2 a 50000",
			"sdx1": "*/ iwd2 92388 100000",
			"sdx2": "*/ iwd2 38268 100000",
			"sdy1": "*/ ihd2 92388 100000",
			"sdy2": "*/ ihd2 38268 100000",
			"sx1": "+- hc 0 sdx1",
			"sx2": "+- hc 0 sdx2",
			"sx3": "+- hc sdx2 0",
			"sx4": "+- hc sdx1 0",
			"sy1": "+- vc 0 sdy1",
			"sy2": "+- vc 0 sdy2",
			"sy3": "+- vc sdy2 0",
			"sy4": "+- vc sdy1 0",
			"yAdj": "+- vc 0 ihd2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "50000",
				"pos": {
					"x": "hc",
					"y": "yAdj"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x2",
					"y": "y2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x1",
					"y": "y2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x2",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "sx1",
			"t": "sy1",
			"r": "sx4",
			"b": "sy4"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx4",
							"y": "sy3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx3",
							"y": "sy4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx2",
							"y": "sy4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "sx1",
							"y": "sy3"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"straightConnector1": {
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"fill": "none",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}]
			}
		}
	},
	"stripedRightArrow": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000"
		},
		"gdLst": {
			"maxAdj2": "*/ 84375 w ss",
			"a1": "pin 0 adj1 100000",
			"a2": "pin 0 adj2 maxAdj2",
			"x4": "*/ ss 5 32",
			"dx5": "*/ ss a2 100000",
			"x5": "+- r 0 dx5",
			"dy1": "*/ h a1 200000",
			"y1": "+- vc 0 dy1",
			"y2": "+- vc dy1 0",
			"dx6": "*/ dy1 dx5 hd2",
			"x6": "+- r 0 dx6"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "100000",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "x5",
					"y": "t"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x5",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x5",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "x4",
			"t": "y1",
			"r": "x6",
			"b": "y2"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ssd32",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ssd32",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ssd16",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ssd8",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ssd8",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ssd16",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x5",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"sun": {
		"avLst": {
			"adj": "val 25000"
		},
		"gdLst": {
			"a": "pin 12500 adj 46875",
			"g0": "+- 50000 0 a",
			"g1": "*/ g0 30274 32768",
			"g2": "*/ g0 12540 32768",
			"g3": "+- g1 50000 0",
			"g4": "+- g2 50000 0",
			"g5": "+- 50000 0 g1",
			"g6": "+- 50000 0 g2",
			"g7": "*/ g0 23170 32768",
			"g8": "+- 50000 g7 0",
			"g9": "+- 50000 0 g7",
			"g10": "*/ g5 3 4",
			"g11": "*/ g6 3 4",
			"g12": "+- g10 3662 0",
			"g13": "+- g11 3662 0",
			"g14": "+- g11 12500 0",
			"g15": "+- 100000 0 g10",
			"g16": "+- 100000 0 g12",
			"g17": "+- 100000 0 g13",
			"g18": "+- 100000 0 g14",
			"ox1": "*/ w 18436 21600",
			"oy1": "*/ h 3163 21600",
			"ox2": "*/ w 3163 21600",
			"oy2": "*/ h 18436 21600",
			"x8": "*/ w g8 100000",
			"x9": "*/ w g9 100000",
			"x10": "*/ w g10 100000",
			"x12": "*/ w g12 100000",
			"x13": "*/ w g13 100000",
			"x14": "*/ w g14 100000",
			"x15": "*/ w g15 100000",
			"x16": "*/ w g16 100000",
			"x17": "*/ w g17 100000",
			"x18": "*/ w g18 100000",
			"x19": "*/ w a 100000",
			"wR": "*/ w g0 100000",
			"hR": "*/ h g0 100000",
			"y8": "*/ h g8 100000",
			"y9": "*/ h g9 100000",
			"y10": "*/ h g10 100000",
			"y12": "*/ h g12 100000",
			"y13": "*/ h g13 100000",
			"y14": "*/ h g14 100000",
			"y15": "*/ h g15 100000",
			"y16": "*/ h g16 100000",
			"y17": "*/ h g17 100000",
			"y18": "*/ h g18 100000"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "12500",
				"maxX": "46875",
				"pos": {
					"x": "x19",
					"y": "vc"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "x9",
			"t": "y9",
			"r": "x8",
			"b": "y8"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x15",
							"y": "y18"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x15",
							"y": "y14"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ox1",
							"y": "oy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x16",
							"y": "y13"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x17",
							"y": "y12"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x18",
							"y": "y10"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x14",
							"y": "y10"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ox2",
							"y": "oy1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x13",
							"y": "y12"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x12",
							"y": "y13"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x10",
							"y": "y14"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x10",
							"y": "y18"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ox2",
							"y": "oy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x12",
							"y": "y17"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x13",
							"y": "y16"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x14",
							"y": "y15"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x18",
							"y": "y15"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ox1",
							"y": "oy2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x17",
							"y": "y16"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x16",
							"y": "y17"
						}]
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x19",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wR",
						"hR": "hR",
						"stAng": "cd2",
						"swAng": "21600000"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"swooshArrow": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 16667"
		},
		"gdLst": {
			"a1": "pin 1 adj1 75000",
			"maxAdj2": "*/ 70000 w ss",
			"a2": "pin 0 adj2 maxAdj2",
			"ad1": "*/ h a1 100000",
			"ad2": "*/ ss a2 100000",
			"xB": "+- r 0 ad2",
			"yB": "+- t ssd8 0",
			"alfa": "*/ cd4 1 14",
			"dx0": "tan ssd8 alfa",
			"xC": "+- xB 0 dx0",
			"dx1": "tan ad1 alfa",
			"yF": "+- yB ad1 0",
			"xF": "+- xB dx1 0",
			"xE": "+- xF dx0 0",
			"yE": "+- yF ssd8 0",
			"dy2": "+- yE 0 t",
			"dy22": "*/ dy2 1 2",
			"dy3": "*/ h 1 20",
			"yD": "+- t dy22 dy3",
			"dy4": "*/ hd6 1 1",
			"yP1": "+- hd6 dy4 0",
			"xP1": "val wd6",
			"dy5": "*/ hd6 1 2",
			"yP2": "+- yF dy5 0",
			"xP2": "val wd4"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "1",
				"maxY": "75000",
				"pos": {
					"x": "xF",
					"y": "yF"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "xB",
					"y": "yB"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd4",
				"pos": {
					"x": "l",
					"y": "b"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "xC",
					"y": "t"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "yD"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "xE",
					"y": "yE"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "xP1",
							"y": "yP1"
						}, {
							"x": "xB",
							"y": "yB"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xC",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "yD"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xE",
							"y": "yE"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xF",
							"y": "yF"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "xP2",
							"y": "yP2"
						}, {
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"teardrop": {
		"avLst": {
			"adj": "val 100000"
		},
		"gdLst": {
			"a": "pin 0 adj 200000",
			"r2": "sqrt 2",
			"tw": "*/ wd2 r2 1",
			"th": "*/ hd2 r2 1",
			"sw": "*/ tw a 100000",
			"sh": "*/ th a 100000",
			"dx1": "cos sw 2700000",
			"dy1": "sin sh 2700000",
			"x1": "+- hc dx1 0",
			"y1": "+- vc 0 dy1",
			"x2": "+/ hc x1 2",
			"y2": "+/ vc y1 2",
			"idx": "cos wd2 2700000",
			"idy": "sin hd2 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "200000",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "ir",
					"y": "ib"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "il",
					"y": "ib"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "il",
					"y": "it"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "x1",
					"y": "y1"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}, {
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "quadBezTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}, {
							"x": "r",
							"y": "vc"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"trapezoid": {
		"avLst": {
			"adj": "val 25000"
		},
		"gdLst": {
			"maxAdj": "*/ 50000 w ss",
			"a": "pin 0 adj maxAdj",
			"x1": "*/ ss a 200000",
			"x2": "*/ ss a 100000",
			"x3": "+- r 0 x2",
			"x4": "+- r 0 x1",
			"il": "*/ wd3 a maxAdj",
			"it": "*/ hd3 a maxAdj",
			"ir": "+- r 0 il"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "maxAdj",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x4",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"triangle": {
		"avLst": {
			"adj": "val 50000"
		},
		"gdLst": {
			"a": "pin 0 adj 100000",
			"x1": "*/ w a 200000",
			"x2": "*/ w a 100000",
			"x3": "+- x1 wd2 0"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj",
				"minX": "0",
				"maxX": "100000",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "x2",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "l",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x2",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "r",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x3",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "vc",
			"r": "x3",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"upArrowCallout": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 25000",
			"adj3": "val 25000",
			"adj4": "val 64977"
		},
		"gdLst": {
			"maxAdj2": "*/ 50000 w ss",
			"a2": "pin 0 adj2 maxAdj2",
			"maxAdj1": "*/ a2 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"maxAdj3": "*/ 100000 h ss",
			"a3": "pin 0 adj3 maxAdj3",
			"q2": "*/ a3 ss h",
			"maxAdj4": "+- 100000 0 q2",
			"a4": "pin 0 adj4 maxAdj4",
			"dx1": "*/ ss a2 100000",
			"dx2": "*/ ss a1 200000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc dx2 0",
			"x4": "+- hc dx1 0",
			"y1": "*/ ss a3 100000",
			"dy2": "*/ h a4 100000",
			"y2": "+- b 0 dy2",
			"y3": "+/ y2 b 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "maxAdj1",
				"pos": {
					"x": "x2",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"gdRefY": "adj3",
				"minY": "0",
				"maxY": "maxAdj3",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}, {
				"gdRefY": "adj4",
				"minY": "0",
				"maxY": "maxAdj4",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y2"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "y2",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"upDownArrow": {
		"avLst": {
			"adj1": "val 50000",
			"adj2": "val 50000"
		},
		"gdLst": {
			"maxAdj2": "*/ 50000 h ss",
			"a1": "pin 0 adj1 100000",
			"a2": "pin 0 adj2 maxAdj2",
			"y2": "*/ ss a2 100000",
			"y3": "+- b 0 y2",
			"dx1": "*/ w a1 200000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc dx1 0",
			"dy1": "*/ x1 y2 wd2",
			"y1": "+- y2 0 dy1",
			"y4": "+- y3 dy1 0"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "100000",
				"pos": {
					"x": "x1",
					"y": "y3"
				}
			}, {
				"gdRefY": "adj2",
				"minY": "0",
				"maxY": "maxAdj2",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "y3"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y3"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x2",
					"y": "vc"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y2"
				}
			}]
		},
		"rect": {
			"l": "x1",
			"t": "y1",
			"r": "x2",
			"b": "y4"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y2"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"upDownArrowCallout": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 25000",
			"adj3": "val 25000",
			"adj4": "val 48123"
		},
		"gdLst": {
			"maxAdj2": "*/ 50000 w ss",
			"a2": "pin 0 adj2 maxAdj2",
			"maxAdj1": "*/ a2 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"maxAdj3": "*/ 50000 h ss",
			"a3": "pin 0 adj3 maxAdj3",
			"q2": "*/ a3 ss hd2",
			"maxAdj4": "+- 100000 0 q2",
			"a4": "pin 0 adj4 maxAdj4",
			"dx1": "*/ ss a2 100000",
			"dx2": "*/ ss a1 200000",
			"x1": "+- hc 0 dx1",
			"x2": "+- hc 0 dx2",
			"x3": "+- hc dx2 0",
			"x4": "+- hc dx1 0",
			"y1": "*/ ss a3 100000",
			"y4": "+- b 0 y1",
			"dy2": "*/ h a4 200000",
			"y2": "+- vc 0 dy2",
			"y3": "+- vc dy2 0"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "maxAdj1",
				"pos": {
					"x": "x2",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "maxAdj2",
				"pos": {
					"x": "x1",
					"y": "t"
				}
			}, {
				"gdRefY": "adj3",
				"minY": "0",
				"maxY": "maxAdj3",
				"pos": {
					"x": "r",
					"y": "y1"
				}
			}, {
				"gdRefY": "adj4",
				"minY": "0",
				"maxY": "maxAdj4",
				"pos": {
					"x": "l",
					"y": "y2"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "y2",
			"r": "r",
			"b": "y3"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "hc",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y3"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"uturnArrow": {
		"avLst": {
			"adj1": "val 25000",
			"adj2": "val 25000",
			"adj3": "val 25000",
			"adj4": "val 43750",
			"adj5": "val 75000"
		},
		"gdLst": {
			"a2": "pin 0 adj2 25000",
			"maxAdj1": "*/ a2 2 1",
			"a1": "pin 0 adj1 maxAdj1",
			"q2": "*/ a1 ss h",
			"q3": "+- 100000 0 q2",
			"maxAdj3": "*/ q3 h ss",
			"a3": "pin 0 adj3 maxAdj3",
			"q1": "+- a3 a1 0",
			"minAdj5": "*/ q1 ss h",
			"a5": "pin minAdj5 adj5 100000",
			"th": "*/ ss a1 100000",
			"aw2": "*/ ss a2 100000",
			"th2": "*/ th 1 2",
			"dh2": "+- aw2 0 th2",
			"y5": "*/ h a5 100000",
			"ah": "*/ ss a3 100000",
			"y4": "+- y5 0 ah",
			"x9": "+- r 0 dh2",
			"bw": "*/ x9 1 2",
			"bs": "min bw y4",
			"maxAdj4": "*/ bs 100000 ss",
			"a4": "pin 0 adj4 maxAdj4",
			"bd": "*/ ss a4 100000",
			"bd3": "+- bd 0 th",
			"bd2": "max bd3 0",
			"x3": "+- th bd2 0",
			"x8": "+- r 0 aw2",
			"x6": "+- x8 0 aw2",
			"x7": "+- x6 dh2 0",
			"x4": "+- x9 0 bd",
			"x5": "+- x7 0 bd2",
			"cx": "+/ th x7 2"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefX": "adj1",
				"minX": "0",
				"maxX": "maxAdj1",
				"pos": {
					"x": "th",
					"y": "b"
				}
/*			}, {
				"gdRefX": "adj2",
				"minX": "0",
				"maxX": "25000",
				"pos": {
					"x": "x6",
					"y": "b"
				}
			}, {
				"gdRefY": "adj3",
				"minY": "0",
				"maxY": "maxAdj3",
				"pos": {
					"x": "x6",
					"y": "y4"
				}*/
			}, {
				"gdRefX": "adj4",
				"minX": "0",
				"maxX": "maxAdj4",
				"pos": {
					"x": "bd",
					"y": "t"
				}
			}, {
				"gdRefY": "adj5",
				"minY": "minAdj5",
				"maxY": "100000",
				"pos": {
					"x": "r",
					"y": "y5"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd4",
				"pos": {
					"x": "x6",
					"y": "y4"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "x8",
					"y": "y5"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "y4"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "cx",
					"y": "t"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "th2",
					"y": "b"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "bd"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "bd",
						"hR": "bd",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "bd",
						"hR": "bd",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x9",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y5"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "y4"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "x3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "bd2",
						"hR": "bd2",
						"stAng": "0",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "th"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "bd2",
						"hR": "bd2",
						"stAng": "3cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "th",
							"y": "b"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"verticalScroll": {
		"avLst": {
			"adj": "val 12500"
		},
		"gdLst": {
			"a": "pin 0 adj 25000",
			"ch": "*/ ss a 100000",
			"ch2": "*/ ch 1 2",
			"ch4": "*/ ch 1 4",
			"x3": "+- ch ch2 0",
			"x4": "+- ch ch 0",
			"x6": "+- r 0 ch",
			"x7": "+- r 0 ch2",
			"x5": "+- x6 0 ch2",
			"y3": "+- b 0 ch",
			"y4": "+- b 0 ch2"
		},
		"ahLst": {
			"ahXY": {
				"gdRefY": "adj",
				"minY": "0",
				"maxY": "25000",
				"pos": {
					"x": "l",
					"y": "ch"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "ch",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x6",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "ch",
			"t": "ch",
			"r": "x6",
			"b": "y4"
		},
		"pathLst": {
			"path": [{
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ch2",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ch2",
							"y": "y4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch4",
						"hR": "ch4",
						"stAng": "cd4",
						"swAng": "-10800000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ch",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ch",
							"y": "ch2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "ch"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ch2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch4",
						"hR": "ch4",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "darkenLess",
				"stroke": "false",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ch2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch4",
						"hR": "ch4",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ch",
							"y": "y4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "0",
						"swAng": "3cd4"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch4",
						"hR": "ch4",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}]
			}, {
				"fill": "none",
				"extrusionOk": "false",
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ch",
							"y": "y3"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ch",
							"y": "ch2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x7",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "ch"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "y4"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ch2",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "close"
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch4",
						"hR": "ch4",
						"stAng": "cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x4",
							"y": "ch2"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x6",
							"y": "ch"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "ch"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ch2",
							"y": "y3"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch4",
						"hR": "ch4",
						"stAng": "3cd4",
						"swAng": "cd2"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ch",
							"y": "y4"
						}]
					}
				}, {
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "ch2",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "ch2",
						"hR": "ch2",
						"stAng": "cd4",
						"swAng": "-5400000"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "ch",
							"y": "y3"
						}]
					}
				}]
			}]
		}
	},
	"wave": {
		"avLst": {
			"adj1": "val 12500",
			"adj2": "val 0"
		},
		"gdLst": {
			"a1": "pin 0 adj1 20000",
			"a2": "pin -10000 adj2 10000",
			"y1": "*/ h a1 100000",
			"dy2": "*/ y1 10 3",
			"y2": "+- y1 0 dy2",
			"y3": "+- y1 dy2 0",
			"y4": "+- b 0 y1",
			"y5": "+- y4 0 dy2",
			"y6": "+- y4 dy2 0",
			"dx1": "*/ w a2 100000",
			"of2": "*/ w a2 50000",
			"x1": "abs dx1",
			"dx2": "?: of2 0 of2",
			"x2": "+- l 0 dx2",
			"dx5": "?: of2 of2 0",
			"x5": "+- r 0 dx5",
			"dx3": "+/ dx2 x5 3",
			"x3": "+- x2 dx3 0",
			"x4": "+/ x3 x5 2",
			"x6": "+- l dx5 0",
			"x10": "+- r dx2 0",
			"x7": "+- x6 dx3 0",
			"x8": "+/ x7 x10 2",
			"x9": "+- r 0 x1",
			"xAdj": "+- hc dx1 0",
			"xAdj2": "+- hc 0 dx1",
			"il": "max x2 x6",
			"ir": "min x5 x10",
			"it": "*/ h a1 50000",
			"ib": "+- b 0 it"
		},
		"ahLst": {
			"ahXY": [{
				"gdRefY": "adj1",
				"minY": "0",
				"maxY": "20000",
				"pos": {
					"x": "l",
					"y": "y1"
				}
			}, {
				"gdRefX": "adj2",
				"minX": "-10000",
				"maxX": "10000",
				"pos": {
					"x": "xAdj",
					"y": "b"
				}
			}]
		},
		"cxnLst": {
			"cxn": [{
				"ang": "cd4",
				"pos": {
					"x": "xAdj2",
					"y": "y1"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "x1",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "xAdj",
					"y": "y4"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "x9",
					"y": "vc"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "y1"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x3",
							"y": "y2"
						}, {
							"x": "x4",
							"y": "y3"
						}, {
							"x": "x5",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x10",
							"y": "y4"
						}]
					}
				}, {
					"op": "cubicBezTo",
					"params": {
						"pt": [{
							"x": "x8",
							"y": "y6"
						}, {
							"x": "x7",
							"y": "y5"
						}, {
							"x": "x6",
							"y": "y4"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"wedgeEllipseCallout": {
		"avLst": {
			"adj1": "val -20833",
			"adj2": "val 62500"
		},
		"gdLst": {
			"dxPos": "*/ w adj1 100000",
			"dyPos": "*/ h adj2 100000",
			"xPos": "+- hc dxPos 0",
			"yPos": "+- vc dyPos 0",
			"sdx": "*/ dxPos h 1",
			"sdy": "*/ dyPos w 1",
			"pang": "at2 sdx sdy",
			"stAng": "+- pang 660000 0",
			"enAng": "+- pang 0 660000",
			"dx1": "cos wd2 stAng",
			"dy1": "sin hd2 stAng",
			"x1": "+- hc dx1 0",
			"y1": "+- vc dy1 0",
			"dx2": "cos wd2 enAng",
			"dy2": "sin hd2 enAng",
			"x2": "+- hc dx2 0",
			"y2": "+- vc dy2 0",
			"stAng1": "at2 dx1 dy1",
			"enAng1": "at2 dx2 dy2",
			"swAng1": "+- enAng1 0 stAng1",
			"swAng2": "+- swAng1 21600000 0",
			"swAng": "?: swAng1 swAng1 swAng2",
			"idx": "cos wd2 2700000",
			"idy": "sin hd2 2700000",
			"il": "+- hc 0 idx",
			"ir": "+- hc idx 0",
			"it": "+- vc 0 idy",
			"ib": "+- vc idy 0"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj1",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj2",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "xPos",
					"y": "yPos"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "il",
					"y": "it"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "il",
					"y": "ib"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "ir",
					"y": "ib"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "3cd4",
				"pos": {
					"x": "ir",
					"y": "it"
				}
			}, {
				"ang": "pang",
				"pos": {
					"x": "xPos",
					"y": "yPos"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "it",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "xPos",
							"y": "yPos"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "y1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "wd2",
						"hR": "hd2",
						"stAng": "stAng1",
						"swAng": "swAng"
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"wedgeRectCallout": {
		"avLst": {
			"adj1": "val -20833",
			"adj2": "val 62500"
		},
		"gdLst": {
			"dxPos": "*/ w adj1 100000",
			"dyPos": "*/ h adj2 100000",
			"xPos": "+- hc dxPos 0",
			"yPos": "+- vc dyPos 0",
			"dx": "+- xPos 0 hc",
			"dy": "+- yPos 0 vc",
			"dq": "*/ dxPos h w",
			"ady": "abs dyPos",
			"adq": "abs dq",
			"dz": "+- ady 0 adq",
			"xg1": "?: dxPos 7 2",
			"xg2": "?: dxPos 10 5",
			"x1": "*/ w xg1 12",
			"x2": "*/ w xg2 12",
			"yg1": "?: dyPos 7 2",
			"yg2": "?: dyPos 10 5",
			"y1": "*/ h yg1 12",
			"y2": "*/ h yg2 12",
			"t1": "?: dxPos l xPos",
			"xl": "?: dz l t1",
			"t2": "?: dyPos x1 xPos",
			"xt": "?: dz t2 x1",
			"t3": "?: dxPos xPos r",
			"xr": "?: dz r t3",
			"t4": "?: dyPos xPos x1",
			"xb": "?: dz t4 x1",
			"t5": "?: dxPos y1 yPos",
			"yl": "?: dz y1 t5",
			"t6": "?: dyPos t yPos",
			"yt": "?: dz t6 t",
			"t7": "?: dxPos yPos y1",
			"yr": "?: dz y1 t7",
			"t8": "?: dyPos yPos b",
			"yb": "?: dz t8 b"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj1",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj2",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "xPos",
					"y": "yPos"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "xPos",
					"y": "yPos"
				}
			}]
		},
		"rect": {
			"l": "l",
			"t": "t",
			"r": "r",
			"b": "b"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xt",
							"y": "yt"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xr",
							"y": "yr"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xb",
							"y": "yb"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xl",
							"y": "yl"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	},
	"wedgeRoundRectCallout": {
		"avLst": {
			"adj1": "val -20833",
			"adj2": "val 62500",
			"adj3": "val 16667"
		},
		"gdLst": {
			"dxPos": "*/ w adj1 100000",
			"dyPos": "*/ h adj2 100000",
			"xPos": "+- hc dxPos 0",
			"yPos": "+- vc dyPos 0",
			"dq": "*/ dxPos h w",
			"ady": "abs dyPos",
			"adq": "abs dq",
			"dz": "+- ady 0 adq",
			"xg1": "?: dxPos 7 2",
			"xg2": "?: dxPos 10 5",
			"x1": "*/ w xg1 12",
			"x2": "*/ w xg2 12",
			"yg1": "?: dyPos 7 2",
			"yg2": "?: dyPos 10 5",
			"y1": "*/ h yg1 12",
			"y2": "*/ h yg2 12",
			"t1": "?: dxPos l xPos",
			"xl": "?: dz l t1",
			"t2": "?: dyPos x1 xPos",
			"xt": "?: dz t2 x1",
			"t3": "?: dxPos xPos r",
			"xr": "?: dz r t3",
			"t4": "?: dyPos xPos x1",
			"xb": "?: dz t4 x1",
			"t5": "?: dxPos y1 yPos",
			"yl": "?: dz y1 t5",
			"t6": "?: dyPos t yPos",
			"yt": "?: dz t6 t",
			"t7": "?: dxPos yPos y1",
			"yr": "?: dz y1 t7",
			"t8": "?: dyPos yPos b",
			"yb": "?: dz t8 b",
			"u1": "*/ ss adj3 100000",
			"u2": "+- r 0 u1",
			"v2": "+- b 0 u1",
			"il": "*/ u1 29289 100000",
			"ir": "+- r 0 il",
			"ib": "+- b 0 il"
		},
		"ahLst": {
			"ahXY": {
				"gdRefX": "adj1",
				"minX": "-2147483647",
				"maxX": "2147483647",
				"gdRefY": "adj2",
				"minY": "-2147483647",
				"maxY": "2147483647",
				"pos": {
					"x": "xPos",
					"y": "yPos"
				}
			}
		},
		"cxnLst": {
			"cxn": [{
				"ang": "3cd4",
				"pos": {
					"x": "hc",
					"y": "t"
				}
			}, {
				"ang": "cd2",
				"pos": {
					"x": "l",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "hc",
					"y": "b"
				}
			}, {
				"ang": "0",
				"pos": {
					"x": "r",
					"y": "vc"
				}
			}, {
				"ang": "cd4",
				"pos": {
					"x": "xPos",
					"y": "yPos"
				}
			}]
		},
		"rect": {
			"l": "il",
			"t": "il",
			"r": "ir",
			"b": "ib"
		},
		"pathLst": {
			"path": {
				"cmd": [{
					"op": "moveTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "u1"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "u1",
						"hR": "u1",
						"stAng": "cd2",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xt",
							"y": "yt"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "t"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "u2",
							"y": "t"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "u1",
						"hR": "u1",
						"stAng": "3cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y1"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xr",
							"y": "yr"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "r",
							"y": "v2"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "u1",
						"hR": "u1",
						"stAng": "0",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x2",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xb",
							"y": "yb"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "x1",
							"y": "b"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "u1",
							"y": "b"
						}]
					}
				}, {
					"op": "arcTo",
					"params": {
						"wR": "u1",
						"hR": "u1",
						"stAng": "cd4",
						"swAng": "cd4"
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y2"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "xl",
							"y": "yl"
						}]
					}
				}, {
					"op": "lnTo",
					"params": {
						"pt": [{
							"x": "l",
							"y": "y1"
						}]
					}
				}, {
					"op": "close"
				}]
			}
		}
	}
};