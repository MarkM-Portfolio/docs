/*
 * Log function to generate test cases dojo.require("writer.tests.Util");
 * attachMsgLog();
 */
function attachMsgLog() {
	dojo.connect(WRITER.MSG, WRITER.MSG.createDeleteTextAct, null, function(
			index, length, target) {
		console.log('test dojo.connect ');
		console.log(JSON.stringify(target.toJson(0, null, true)));
	});
}

function assertParagraphEqual(p1, p2) {
	assertJSONEqual(p1.toJson(0, null, true), p2.toJson(0, null, true));
}

function assertJSONEqual( m1, m2) {
	
	function assertObjs( obj1, obj2 ){
		  var s1 = JSON.stringify(obj1);
		  var s2 = JSON.stringify(obj2);
		  doh.assertEqual(getString(s1), getString(s2));
	}
	
	function skipProp( prop ){
		return prop == "asciiTheme" || prop == "eastAsiaTheme" || prop == "hAnsiTheme" || prop == "cstheme"
			|| prop == "pos" || prop == "unit"|| prop == "webHidden" || prop == "rFonts" || prop == "preserve";
	}
	
	function checkNullObj( obj1, obj2 )
	{
		if( obj1 == null  )
		{
			if( dojo.isObject(obj2) )
				obj1 = {};
			else if(dojo.isArray(obj2))
				obj1 = [];
			else if( dojo.isString( obj2 ))
				obj1 = "";
		}
		return obj1;
	}
	
	function isEqual( obj1, obj2 )
	{
		if( obj1 == null && obj2 == null )
			return true;
		
		obj1 = checkNullObj( obj1, obj2 );
		obj2 = checkNullObj( obj2, obj1 );
		
		if( dojo.isString( obj1 ) )
			return obj1 == ("" + obj2 );
		
		if( dojo.isString( obj2 ) )
			return obj2 == ("" + obj1 );
		
		if( obj1 == obj2 )
			return true;
		else if ( dojo.isArray(obj1) && dojo.isArray(obj2))
		{
		   for ( var i = 0; i < obj1.length ; i++ )
		   {
			   if( !isEqual( obj1[i],obj2[i]))
			   {
				   assertObjs( obj1[i],obj2[i]);
				   return false;
			   }
		   }
		   
		   for ( var i = 0; i < obj2.length ; i++ )
		   {
			   if( !isEqual( obj2[i],obj1[i]))
				{
				    assertObjs( obj1[i],obj2[i]);
					return false;
				}
		   }
		}
		else if ( dojo.isObject(obj1) && dojo.isObject(obj2))
		{
			var prop;
			for( prop in obj1 )
			{
				if( skipProp( prop ))
					continue;
				if( !isEqual( obj1[prop], obj2[prop] ) )
				{
					assertObjs( obj1[prop],obj2[prop]);
					return false;
				}
					
			}
			
			for( prop in obj2 )
			{
				if( skipProp( prop ))
					continue;
				if( !isEqual( obj1[prop], obj2[prop] ) )
				{
					assertObjs( obj1[prop],obj2[prop]);
					return false;
				}
			}
		}
		else
			return false;
		return true;
	}
	
	isEqual( m1, m2 );
	if( !bEqual )
	{
		var s1 = JSON.stringify(obj1);
		var s2 = JSON.stringify(obj2);
		doh.assertEqual(getString(s1), getString(s2));
	}
};
function createRangeFromParagraphs(paragraphs, start, index1, end, index2) {
	var doc = loadDocument(paragraphs);
	return createRange(doc, start, index1, end, index2);
}
function createRange(doc, start, index1, end, index2) {
	dojo.require("writer.core.Range");
	writer.core.Range.prototype._modelToView = function() {
	};

	var startP = doc.container.getByIndex(start);
	var endP = doc.container.getByIndex(end);
	return new writer.core.Range({
		'obj' : startP,
		'index' : index1
	}, {
		'obj' : endP,
		'index' : index2
	}, doc);
}
function getString(s) {
	return s;
	// return s.replace(/[ ]/g, "\u00a0");
}

function loadDocument(json) {
	var setting = {
		"zoom" : {
			"percent" : "100"
		},
		"proofState" : {
			"grammar" : "clean"
		},
		"dts" : "36.0pt",
		"characterSpacingControl" : {
			"val" : "doNotCompress"
		},
		"compat" : {
			"compatSetting" : {
				"name" : "compatibilityMode",
				"uri" : "http://schemas.microsoft.com/office/word",
				"val" : "14"
			},
			"compatSetting" : {
				"name" : "overrideTableStyleFontSizeAndJustification",
				"uri" : "http://schemas.microsoft.com/office/word",
				"val" : "1"
			},
			"compatSetting" : {
				"name" : "enableOpenTypeFeatures",
				"uri" : "http://schemas.microsoft.com/office/word",
				"val" : "1"
			},
			"compatSetting" : {
				"name" : "doNotFlipMirrorIndents",
				"uri" : "http://schemas.microsoft.com/office/word",
				"val" : "1"
			}
		},
		"mathPr" : {
			"mathFont" : {
				"val" : "Cambria Math"
			},
			"brkBin" : {
				"val" : "before"
			},
			"brkBinSub" : {
				"val" : "--"
			},
			"smallFrac" : {
				"val" : "0"
			},
			"dispDef" : {},
			"lMargin" : {
				"val" : "0"
			},
			"rMargin" : {
				"val" : "0"
			},
			"defJc" : {
				"val" : "centerGroup"
			},
			"wrapIndent" : {
				"val" : "1440"
			},
			"intLim" : {
				"val" : "subSup"
			},
			"naryLim" : {
				"val" : "undOvr"
			}
		},
		"themeFontLang" : {
			"val" : "en-US",
			"eastAsia" : "zh-CN"
		},
		"clrSchemeMapping" : {
			"bg1" : "light1",
			"t1" : "dark1",
			"bg2" : "light2",
			"t2" : "dark2",
			"accent1" : "accent1",
			"accent2" : "accent2",
			"accent3" : "accent3",
			"accent4" : "accent4",
			"accent5" : "accent5",
			"accent6" : "accent6",
			"hyperlink" : "hyperlink",
			"followedHyperlink" : "followedHyperlink"
		},
		"decimalSymbol" : {
			"val" : "."
		},
		"listSeparator" : {
			"val" : ","
		},
		"sects" : [ {
			"id" : "defalut",
			"rsidR" : "001F3EE8",
			"pgSz" : {
				"w" : "612.0pt",
				"h" : "792.0pt"
			},
			"pgMar" : {
				"top" : "72.0pt",
				"right" : "72.0pt",
				"bottom" : "72.0pt",
				"left" : "72.0pt",
				"header" : "36.0pt",
				"footer" : "36.0pt",
				"gutter" : "0.0pt"
			},
			"cols" : {
				"space" : "36.0pt"
			},
			"docGrid" : {
				"linePitch" : "360"
			}
		} ]
	};
	var styles = {
		"docDefaults" : {
			"rPr" : {
				"rFonts" : {
					"asciiTheme" : "majorHAnsi",
					"eastAsiaTheme" : "majorEastAsia",
					"hAnsiTheme" : "majorHAnsi",
					"cstheme" : "majorBidi"
				},
				"font-size" : "11.0pt",
				"preserve" : {
					"szCs" : "11.0pt",
					"lang" : {
						"val" : "en-US",
						"eastAsia" : "zh-CN",
						"bidi" : "ar-SA"
					}
				}
			},
			"pPr" : {
				"space" : {
					"after" : "10.0pt",
					"lineRule" : "auto",
					"line" : "1.150"
				}
			}
		},
		"Normal" : {
			"type" : "paragraph",
			"default" : "1",
			"name" : "Normal",
			"qFormat" : "1",
			"rsid" : "006A0CA5"
		},
		"Heading1" : {
			"type" : "paragraph",
			"name" : "heading 1",
			"basedOn" : "Normal",
			"next" : "Normal",
			"link" : "Heading1Char",
			"uiPriority" : "9",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"space" : {
					"before" : "24.0pt",
					"after" : "0.0pt"
				},
				"contextualSpacing" : {},
				"outlineLvl" : {
					"val" : "0"
				}
			},
			"rPr" : {
				"text-transform" : {},
				"space" : {
					"val" : "0.250pt"
				},
				"font-size" : "18.0pt",
				"preserve" : {
					"szCs" : "18.0pt"
				}
			}
		},
		"Heading2" : {
			"type" : "paragraph",
			"name" : "heading 2",
			"basedOn" : "Normal",
			"next" : "Normal",
			"link" : "Heading2Char",
			"uiPriority" : "9",
			"unhideWhenUsed" : "1",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"space" : {
					"before" : "10.0pt",
					"after" : "0.0pt",
					"lineRule" : "auto",
					"line" : "1.12920"
				},
				"outlineLvl" : {
					"val" : "1"
				}
			},
			"rPr" : {
				"text-transform" : {},
				"font-size" : "14.0pt",
				"preserve" : {
					"szCs" : "14.0pt"
				}
			}
		},
		"Heading3" : {
			"type" : "paragraph",
			"name" : "heading 3",
			"basedOn" : "Normal",
			"next" : "Normal",
			"link" : "Heading3Char",
			"uiPriority" : "9",
			"unhideWhenUsed" : "1",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"space" : {
					"before" : "10.0pt",
					"after" : "0.0pt",
					"lineRule" : "auto",
					"line" : "1.12920"
				},
				"outlineLvl" : {
					"val" : "2"
				}
			},
			"rPr" : {
				"font-style" : "italic",
				"preserve" : {
					"iCs" : "italic",
					"szCs" : "13.0pt"
				},
				"text-transform" : {},
				"space" : {
					"val" : "0.250pt"
				},
				"font-size" : "13.0pt"
			}
		},
		"Heading4" : {
			"type" : "paragraph",
			"name" : "heading 4",
			"basedOn" : "Normal",
			"next" : "Normal",
			"link" : "Heading4Char",
			"uiPriority" : "9",
			"semiHidden" : "1",
			"unhideWhenUsed" : "1",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"space" : {
					"after" : "0.0pt",
					"lineRule" : "auto",
					"line" : "1.12920"
				},
				"outlineLvl" : {
					"val" : "3"
				}
			},
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold",
					"szCs" : "12.0pt"
				},
				"space" : {
					"val" : "0.250pt"
				},
				"font-size" : "12.0pt"
			}
		},
		"Heading5" : {
			"type" : "paragraph",
			"name" : "heading 5",
			"basedOn" : "Normal",
			"next" : "Normal",
			"link" : "Heading5Char",
			"uiPriority" : "9",
			"semiHidden" : "1",
			"unhideWhenUsed" : "1",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"space" : {
					"after" : "0.0pt",
					"lineRule" : "auto",
					"line" : "1.12920"
				},
				"outlineLvl" : {
					"val" : "4"
				}
			},
			"rPr" : {
				"font-style" : "italic",
				"preserve" : {
					"iCs" : "italic",
					"szCs" : "12.0pt"
				},
				"font-size" : "12.0pt"
			}
		},
		"Heading6" : {
			"type" : "paragraph",
			"name" : "heading 6",
			"basedOn" : "Normal",
			"next" : "Normal",
			"link" : "Heading6Char",
			"uiPriority" : "9",
			"semiHidden" : "1",
			"unhideWhenUsed" : "1",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"shd" : {
					"val" : "clear",
					"color" : "auto",
					"fill" : "FFFFFF",
					"themeFill" : "background1"
				},
				"space" : {
					"after" : "0.0pt",
					"lineRule" : "auto",
					"line" : "1.12920"
				},
				"outlineLvl" : {
					"val" : "5"
				}
			},
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold"
				},
				"color" : "#595959",
				"space" : {
					"val" : "0.250pt"
				}
			}
		},
		"Heading7" : {
			"type" : "paragraph",
			"name" : "heading 7",
			"basedOn" : "Normal",
			"next" : "Normal",
			"link" : "Heading7Char",
			"uiPriority" : "9",
			"semiHidden" : "1",
			"unhideWhenUsed" : "1",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"space" : {
					"after" : "0.0pt"
				},
				"outlineLvl" : {
					"val" : "6"
				}
			},
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold",
					"iCs" : "italic",
					"szCs" : "10.0pt"
				},
				"font-style" : "italic",
				"color" : "#5A5A5A",
				"font-size" : "10.0pt"
			}
		},
		"Heading8" : {
			"type" : "paragraph",
			"name" : "heading 8",
			"basedOn" : "Normal",
			"next" : "Normal",
			"link" : "Heading8Char",
			"uiPriority" : "9",
			"semiHidden" : "1",
			"unhideWhenUsed" : "1",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"space" : {
					"after" : "0.0pt"
				},
				"outlineLvl" : {
					"val" : "7"
				}
			},
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold",
					"szCs" : "10.0pt"
				},
				"color" : "#7F7F7F",
				"font-size" : "10.0pt"
			}
		},
		"Heading9" : {
			"type" : "paragraph",
			"name" : "heading 9",
			"basedOn" : "Normal",
			"next" : "Normal",
			"link" : "Heading9Char",
			"uiPriority" : "9",
			"semiHidden" : "1",
			"unhideWhenUsed" : "1",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"space" : {
					"after" : "0.0pt",
					"lineRule" : "auto",
					"line" : "1.12920"
				},
				"outlineLvl" : {
					"val" : "8"
				}
			},
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold",
					"iCs" : "italic",
					"szCs" : "9.0pt"
				},
				"font-style" : "italic",
				"color" : "#7F7F7F",
				"font-size" : "9.0pt"
			}
		},
		"DefaultParagraphFont" : {
			"type" : "character",
			"default" : "1",
			"name" : "Default Paragraph Font",
			"uiPriority" : "1",
			"semiHidden" : "1",
			"unhideWhenUsed" : "1"
		},
		"TableNormal" : {
			"type" : "table",
			"default" : "1",
			"name" : "Normal Table",
			"uiPriority" : "99",
			"semiHidden" : "1",
			"unhideWhenUsed" : "1",
			"tblPr" : {
				"tblInd" : {
					"w" : "0",
					"type" : "dxa"
				},
				"tblCellMar" : {
					"top" : {
						"w" : "0",
						"type" : "dxa"
					},
					"left" : {
						"w" : "108",
						"type" : "dxa"
					},
					"bottom" : {
						"w" : "0",
						"type" : "dxa"
					},
					"right" : {
						"w" : "108",
						"type" : "dxa"
					}
				}
			}
		},
		"NoList" : {
			"type" : "numbering",
			"default" : "1",
			"name" : "No List",
			"uiPriority" : "99",
			"semiHidden" : "1",
			"unhideWhenUsed" : "1"
		},
		"Heading1Char" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "Heading 1 Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "Heading1",
			"uiPriority" : "9",
			"rsid" : "006A0CA5",
			"rPr" : {
				"text-transform" : {},
				"space" : {
					"val" : "0.250pt"
				},
				"font-size" : "18.0pt",
				"preserve" : {
					"szCs" : "18.0pt"
				}
			}
		},
		"Heading2Char" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "Heading 2 Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "Heading2",
			"uiPriority" : "9",
			"rsid" : "006A0CA5",
			"rPr" : {
				"text-transform" : {},
				"font-size" : "14.0pt",
				"preserve" : {
					"szCs" : "14.0pt"
				}
			}
		},
		"Heading3Char" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "Heading 3 Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "Heading3",
			"uiPriority" : "9",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-style" : "italic",
				"preserve" : {
					"iCs" : "italic",
					"szCs" : "13.0pt"
				},
				"text-transform" : {},
				"space" : {
					"val" : "0.250pt"
				},
				"font-size" : "13.0pt"
			}
		},
		"Heading4Char" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "Heading 4 Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "Heading4",
			"uiPriority" : "9",
			"semiHidden" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold",
					"szCs" : "12.0pt"
				},
				"space" : {
					"val" : "0.250pt"
				},
				"font-size" : "12.0pt"
			}
		},
		"Heading5Char" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "Heading 5 Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "Heading5",
			"uiPriority" : "9",
			"semiHidden" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-style" : "italic",
				"preserve" : {
					"iCs" : "italic",
					"szCs" : "12.0pt"
				},
				"font-size" : "12.0pt"
			}
		},
		"Heading6Char" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "Heading 6 Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "Heading6",
			"uiPriority" : "9",
			"semiHidden" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold",
					"shd" : {
						"val" : "clear",
						"color" : "auto",
						"fill" : "FFFFFF",
						"themeFill" : "background1"
					}
				},
				"color" : "#595959",
				"space" : {
					"val" : "0.250pt"
				}
			}
		},
		"Heading7Char" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "Heading 7 Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "Heading7",
			"uiPriority" : "9",
			"semiHidden" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold",
					"iCs" : "italic",
					"szCs" : "10.0pt"
				},
				"font-style" : "italic",
				"color" : "#5A5A5A",
				"font-size" : "10.0pt"
			}
		},
		"Heading8Char" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "Heading 8 Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "Heading8",
			"uiPriority" : "9",
			"semiHidden" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold",
					"szCs" : "10.0pt"
				},
				"color" : "#7F7F7F",
				"font-size" : "10.0pt"
			}
		},
		"Heading9Char" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "Heading 9 Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "Heading9",
			"uiPriority" : "9",
			"semiHidden" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold",
					"iCs" : "italic",
					"szCs" : "9.0pt"
				},
				"font-style" : "italic",
				"color" : "#7F7F7F",
				"font-size" : "9.0pt"
			}
		},
		"TOC1" : {
			"type" : "paragraph",
			"name" : "toc 1",
			"basedOn" : "Normal",
			"next" : "Normal",
			"autoRedefine" : "1",
			"uiPriority" : "39",
			"unhideWhenUsed" : "1",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"space" : {
					"after" : "5.0pt"
				}
			},
			"rPr" : {
				"rFonts" : {
					"ascii" : "Calibri",
					"eastAsia" : "宋体",
					"hAnsi" : "Calibri",
					"cs" : "Times New Roman"
				}
			}
		},
		"TOC2" : {
			"type" : "paragraph",
			"name" : "toc 2",
			"basedOn" : "Normal",
			"next" : "Normal",
			"autoRedefine" : "1",
			"uiPriority" : "39",
			"unhideWhenUsed" : "1",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"space" : {
					"after" : "5.0pt"
				},
				"indent" : {
					"left" : "11.0pt"
				}
			},
			"rPr" : {
				"rFonts" : {
					"ascii" : "Calibri",
					"eastAsia" : "宋体",
					"hAnsi" : "Calibri",
					"cs" : "Times New Roman"
				}
			}
		},
		"TOC3" : {
			"type" : "paragraph",
			"name" : "toc 3",
			"basedOn" : "Normal",
			"next" : "Normal",
			"autoRedefine" : "1",
			"uiPriority" : "39",
			"unhideWhenUsed" : "1",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"space" : {
					"after" : "5.0pt"
				},
				"indent" : {
					"left" : "22.0pt"
				}
			},
			"rPr" : {
				"rFonts" : {
					"ascii" : "Calibri",
					"eastAsia" : "宋体",
					"hAnsi" : "Calibri",
					"cs" : "Times New Roman"
				}
			}
		},
		"Title" : {
			"type" : "paragraph",
			"name" : "Title",
			"basedOn" : "Normal",
			"next" : "Normal",
			"link" : "TitleChar",
			"uiPriority" : "10",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"space" : {
					"after" : "15.0pt",
					"lineRule" : "auto",
					"line" : "1.0"
				},
				"contextualSpacing" : {}
			},
			"rPr" : {
				"text-transform" : {},
				"font-size" : "26.0pt",
				"preserve" : {
					"szCs" : "26.0pt"
				}
			}
		},
		"TitleChar" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "Title Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "Title",
			"uiPriority" : "10",
			"rsid" : "006A0CA5",
			"rPr" : {
				"text-transform" : {},
				"font-size" : "26.0pt",
				"preserve" : {
					"szCs" : "26.0pt"
				}
			}
		},
		"Subtitle" : {
			"type" : "paragraph",
			"name" : "Subtitle",
			"basedOn" : "Normal",
			"next" : "Normal",
			"link" : "SubtitleChar",
			"uiPriority" : "11",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-style" : "italic",
				"preserve" : {
					"iCs" : "italic",
					"szCs" : "14.0pt"
				},
				"text-transform" : {},
				"space" : {
					"val" : "0.50pt"
				},
				"font-size" : "14.0pt"
			}
		},
		"SubtitleChar" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "Subtitle Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "Subtitle",
			"uiPriority" : "11",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-style" : "italic",
				"preserve" : {
					"iCs" : "italic",
					"szCs" : "14.0pt"
				},
				"text-transform" : {},
				"space" : {
					"val" : "0.50pt"
				},
				"font-size" : "14.0pt"
			}
		},
		"Strong" : {
			"type" : "character",
			"name" : "Strong",
			"uiPriority" : "22",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold"
				}
			}
		},
		"Emphasis" : {
			"type" : "character",
			"name" : "Emphasis",
			"uiPriority" : "20",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold",
					"iCs" : "italic"
				},
				"font-style" : "italic",
				"space" : {
					"val" : "0.50pt"
				}
			}
		},
		"NoSpacing" : {
			"type" : "paragraph",
			"name" : "No Spacing",
			"basedOn" : "Normal",
			"link" : "NoSpacingChar",
			"uiPriority" : "1",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"space" : {
					"after" : "0.0pt",
					"lineRule" : "auto",
					"line" : "1.0"
				}
			}
		},
		"NoSpacingChar" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "No Spacing Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "NoSpacing",
			"uiPriority" : "1",
			"rsid" : "006A0CA5"
		},
		"ListParagraph" : {
			"type" : "paragraph",
			"name" : "List Paragraph",
			"basedOn" : "Normal",
			"uiPriority" : "34",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"indent" : {
					"left" : "36.0pt"
				},
				"contextualSpacing" : {}
			}
		},
		"Quote" : {
			"type" : "paragraph",
			"name" : "Quote",
			"basedOn" : "Normal",
			"next" : "Normal",
			"link" : "QuoteChar",
			"uiPriority" : "29",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-style" : "italic",
				"preserve" : {
					"iCs" : "italic"
				}
			}
		},
		"QuoteChar" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "Quote Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "Quote",
			"uiPriority" : "29",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-style" : "italic",
				"preserve" : {
					"iCs" : "italic"
				}
			}
		},
		"IntenseQuote" : {
			"type" : "paragraph",
			"name" : "Intense Quote",
			"basedOn" : "Normal",
			"next" : "Normal",
			"link" : "IntenseQuoteChar",
			"uiPriority" : "30",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"pBdr" : {
					"top" : {
						"val" : "single",
						"sz" : "4",
						"space" : "10",
						"color" : "auto"
					},
					"bottom" : {
						"val" : "single",
						"sz" : "4",
						"space" : "10",
						"color" : "auto"
					}
				},
				"space" : {
					"before" : "12.0pt",
					"after" : "12.0pt",
					"lineRule" : "auto",
					"line" : "1.250"
				},
				"indent" : {
					"left" : "57.60pt",
					"right" : "57.60pt"
				},
				"align" : "both"
			},
			"rPr" : {
				"font-style" : "italic",
				"preserve" : {
					"iCs" : "italic"
				}
			}
		},
		"IntenseQuoteChar" : {
			"type" : "character",
			"customStyle" : "1",
			"name" : "Intense Quote Char",
			"basedOn" : "DefaultParagraphFont",
			"link" : "IntenseQuote",
			"uiPriority" : "30",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-style" : "italic",
				"preserve" : {
					"iCs" : "italic"
				}
			}
		},
		"SubtleEmphasis" : {
			"type" : "character",
			"name" : "Subtle Emphasis",
			"uiPriority" : "19",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-style" : "italic",
				"preserve" : {
					"iCs" : "italic"
				}
			}
		},
		"IntenseEmphasis" : {
			"type" : "character",
			"name" : "Intense Emphasis",
			"uiPriority" : "21",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold",
					"iCs" : "italic"
				},
				"font-style" : "italic"
			}
		},
		"SubtleReference" : {
			"type" : "character",
			"name" : "Subtle Reference",
			"basedOn" : "DefaultParagraphFont",
			"uiPriority" : "31",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"text-transform" : {}
			}
		},
		"IntenseReference" : {
			"type" : "character",
			"name" : "Intense Reference",
			"uiPriority" : "32",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-weight" : "bold",
				"preserve" : {
					"bCs" : "bold"
				},
				"text-transform" : {}
			}
		},
		"BookTitle" : {
			"type" : "character",
			"name" : "Book Title",
			"basedOn" : "DefaultParagraphFont",
			"uiPriority" : "33",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"rPr" : {
				"font-style" : "italic",
				"preserve" : {
					"iCs" : "italic"
				},
				"text-transform" : {},
				"space" : {
					"val" : "0.250pt"
				}
			}
		},
		"TOCHeading" : {
			"type" : "paragraph",
			"name" : "TOC Heading",
			"basedOn" : "Heading1",
			"next" : "Normal",
			"uiPriority" : "39",
			"semiHidden" : "1",
			"unhideWhenUsed" : "1",
			"qFormat" : "1",
			"rsid" : "006A0CA5",
			"pPr" : {
				"outlineLvl" : {
					"val" : "9"
				}
			},
			"rPr" : {
				"preserve" : {
					"lang" : {
						"bidi" : "en-US"
					}
				}
			}
		},
		"Hyperlink" : {
			"type" : "character",
			"name" : "Hyperlink",
			"basedOn" : "DefaultParagraphFont",
			"uiPriority" : "99",
			"unhideWhenUsed" : "1",
			"rsid" : "00065FDA",
			"rPr" : {
				"color" : "#0000FF",
				"u" : {
					"val" : "single"
				}
			}
		}
	};

	var numbering = {
		"abstractNum0" : {
			"nsid" : {
				"val" : "2F447718"
			},
			"multiLevelType" : {
				"val" : "hybridMultilevel"
			},
			"tmpl" : {
				"val" : "4086AE04"
			},
			"lvl" : [ {
				"ilvl" : "0",
				"tplc" : "04090001",
				"start" : {
					"val" : "1"
				},
				"numFmt" : {
					"val" : "bullet"
				},
				"lvlText" : {
					"val" : ""
				},
				"lvlJc" : {
					"val" : "left"
				},
				"pPr" : {
					"tabs" : [ {
						"val" : "num",
						"pos" : "36.0pt"
					} ],
					"indent" : {
						"left" : "36.0pt",
						"hanging" : "18.0pt"
					}
				},
				"rPr" : {
					"rFonts" : {
						"ascii" : "Symbol",
						"hAnsi" : "Symbol",
						"hint" : "default"
					}
				}
			}, {
				"ilvl" : "1",
				"tplc" : "04090003",
				"tentative" : "1",
				"start" : {
					"val" : "1"
				},
				"numFmt" : {
					"val" : "bullet"
				},
				"lvlText" : {
					"val" : "o"
				},
				"lvlJc" : {
					"val" : "left"
				},
				"pPr" : {
					"tabs" : [ {
						"val" : "num",
						"pos" : "72.0pt"
					} ],
					"indent" : {
						"left" : "72.0pt",
						"hanging" : "18.0pt"
					}
				},
				"rPr" : {
					"rFonts" : {
						"ascii" : "Courier New",
						"hAnsi" : "Courier New",
						"hint" : "default"
					}
				}
			}, {
				"ilvl" : "2",
				"tplc" : "04090005",
				"tentative" : "1",
				"start" : {
					"val" : "1"
				},
				"numFmt" : {
					"val" : "bullet"
				},
				"lvlText" : {
					"val" : ""
				},
				"lvlJc" : {
					"val" : "left"
				},
				"pPr" : {
					"tabs" : [ {
						"val" : "num",
						"pos" : "108.0pt"
					} ],
					"indent" : {
						"left" : "108.0pt",
						"hanging" : "18.0pt"
					}
				},
				"rPr" : {
					"rFonts" : {
						"ascii" : "Wingdings",
						"hAnsi" : "Wingdings",
						"hint" : "default"
					}
				}
			}, {
				"ilvl" : "3",
				"tplc" : "04090001",
				"tentative" : "1",
				"start" : {
					"val" : "1"
				},
				"numFmt" : {
					"val" : "bullet"
				},
				"lvlText" : {
					"val" : ""
				},
				"lvlJc" : {
					"val" : "left"
				},
				"pPr" : {
					"tabs" : [ {
						"val" : "num",
						"pos" : "144.0pt"
					} ],
					"indent" : {
						"left" : "144.0pt",
						"hanging" : "18.0pt"
					}
				},
				"rPr" : {
					"rFonts" : {
						"ascii" : "Symbol",
						"hAnsi" : "Symbol",
						"hint" : "default"
					}
				}
			}, {
				"ilvl" : "4",
				"tplc" : "04090003",
				"tentative" : "1",
				"start" : {
					"val" : "1"
				},
				"numFmt" : {
					"val" : "bullet"
				},
				"lvlText" : {
					"val" : "o"
				},
				"lvlJc" : {
					"val" : "left"
				},
				"pPr" : {
					"tabs" : [ {
						"val" : "num",
						"pos" : "180.0pt"
					} ],
					"indent" : {
						"left" : "180.0pt",
						"hanging" : "18.0pt"
					}
				},
				"rPr" : {
					"rFonts" : {
						"ascii" : "Courier New",
						"hAnsi" : "Courier New",
						"hint" : "default"
					}
				}
			}, {
				"ilvl" : "5",
				"tplc" : "04090005",
				"tentative" : "1",
				"start" : {
					"val" : "1"
				},
				"numFmt" : {
					"val" : "bullet"
				},
				"lvlText" : {
					"val" : ""
				},
				"lvlJc" : {
					"val" : "left"
				},
				"pPr" : {
					"tabs" : [ {
						"val" : "num",
						"pos" : "216.0pt"
					} ],
					"indent" : {
						"left" : "216.0pt",
						"hanging" : "18.0pt"
					}
				},
				"rPr" : {
					"rFonts" : {
						"ascii" : "Wingdings",
						"hAnsi" : "Wingdings",
						"hint" : "default"
					}
				}
			}, {
				"ilvl" : "6",
				"tplc" : "04090001",
				"tentative" : "1",
				"start" : {
					"val" : "1"
				},
				"numFmt" : {
					"val" : "bullet"
				},
				"lvlText" : {
					"val" : ""
				},
				"lvlJc" : {
					"val" : "left"
				},
				"pPr" : {
					"tabs" : [ {
						"val" : "num",
						"pos" : "252.0pt"
					} ],
					"indent" : {
						"left" : "252.0pt",
						"hanging" : "18.0pt"
					}
				},
				"rPr" : {
					"rFonts" : {
						"ascii" : "Symbol",
						"hAnsi" : "Symbol",
						"hint" : "default"
					}
				}
			}, {
				"ilvl" : "7",
				"tplc" : "04090003",
				"tentative" : "1",
				"start" : {
					"val" : "1"
				},
				"numFmt" : {
					"val" : "bullet"
				},
				"lvlText" : {
					"val" : "o"
				},
				"lvlJc" : {
					"val" : "left"
				},
				"pPr" : {
					"tabs" : [ {
						"val" : "num",
						"pos" : "288.0pt"
					} ],
					"indent" : {
						"left" : "288.0pt",
						"hanging" : "18.0pt"
					}
				},
				"rPr" : {
					"rFonts" : {
						"ascii" : "Courier New",
						"hAnsi" : "Courier New",
						"hint" : "default"
					}
				}
			}, {
				"ilvl" : "8",
				"tplc" : "04090005",
				"tentative" : "1",
				"start" : {
					"val" : "1"
				},
				"numFmt" : {
					"val" : "bullet"
				},
				"lvlText" : {
					"val" : ""
				},
				"lvlJc" : {
					"val" : "left"
				},
				"pPr" : {
					"tabs" : [ {
						"val" : "num",
						"pos" : "324.0pt"
					} ],
					"indent" : {
						"left" : "324.0pt",
						"hanging" : "18.0pt"
					}
				},
				"rPr" : {
					"rFonts" : {
						"ascii" : "Wingdings",
						"hAnsi" : "Wingdings",
						"hint" : "default"
					}
				}
			} ]
		},
		"num1" : {
			"abstractNumId" : "0"
		}
	};
	var stylesObj = new writer.model.style.Styles(styles);
	stylesObj.createCSSStyle();
	return new writer.model.Document(dojo.clone(json), stylesObj,  numbering , new writer.model.Settings(setting));
}
function ModelfromJson(json) {
	var doc = loadDocument([ json ]);
	return doc.container.getFirst();
}
