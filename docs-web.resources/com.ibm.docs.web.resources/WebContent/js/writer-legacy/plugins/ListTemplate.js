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
dojo.provide("writer.plugins.ListTemplate");

dojo.declare("writer.plugins.ListTemplate", null, {
	
	getTemplate: function()
	{
		var ret = {};
		ret.defaultNumberings = {
				                 "decimal" 		: '"numFmt":{"val":"decimal"},"lvlText":{"val":"%1."}',
				                 "decimalB" 	: '"numFmt":{"val":"decimal"},"lvlText":{"val":"%1b"}',
				                 "decimalParenthesis" 	: '"numFmt":{"val":"decimal"},"lvlText":{"val":"%1)"}',
				                 "lowerLetter"	: '"numFmt":{"val":"lowerLetter"},"lvlText":{"val":"%1."}',
				                 "lowerLetterParenthesis" : '"numFmt":{"val":"lowerLetter"},"lvlText":{"val":"%1)"}',
				                 "upperLetter" 	: '"numFmt":{"val":"upperLetter"},"lvlText":{"val":"%1."}',
				                 "upperRoman" 	: '"numFmt":{"val":"upperRoman"},"lvlText":{"val":"%1."},"lvlJc":{"val":"right"}',
				                 "lowerRoman" 	: '"numFmt":{"val":"lowerRoman"},"lvlText":{"val":"%1."},"lvlJc":{"val":"right"}'
								};
		ret.defaultBullets = {
		                      	 "circle" 		: '"numFmt":{"val":"bullet"},"lvlText":{"val":"●"},"rPr":{"rFonts":{"ascii":"Arial"}}',
				                 "diamond" 		: '"numFmt":{"val":"bullet"},"lvlText":{"val":"♦"},"rPr":{"rFonts":{"ascii":"Arial"}}',
				                 "square" 		: '"numFmt":{"val":"bullet"},"lvlText":{"val":"■"},"rPr":{"rFonts":{"ascii":"Arial"}}',
				                 "plus" 		: '"numFmt":{"val":"bullet"},"lvlText":{"val":"+"},"rPr":{"rFonts":{"ascii":"Arial"}}',
				                 "fourDiamond"	: '"numFmt":{"val":"bullet"},"lvlText":{"val":"\uF076"},"rPr":{"rFonts":{"ascii":"wingdings"}}',
				                 "rightArrow" 	: '"numFmt":{"val":"bullet"},"lvlText":{"val":"►"},"rPr":{"rFonts":{"ascii":"Arial"}}',
				                 "checkMark" 	: '"numFmt":{"val":"bullet"},"lvlText":{"val":"✔"},"rPr":{"rFonts":{"ascii":"Arial"}}',
				                 "thinArrow" 	: '"numFmt":{"val":"bullet"},"lvlText":{"val":"➔"},"rPr":{"rFonts":{"ascii":"Arial"}}'
				               };
		
		ret.mulNum1 = '{"multiLevelType":{"val":"multilevel"},"lvl":[' 
		            + '{"ilvl":"0","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"21.0pt","hanging":"21.0pt"}}},'
		            + '{"ilvl":"1","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"49.0pt","hanging":"28.0pt"}}},'
		            + '{"ilvl":"2","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"70.0pt","hanging":"28.0pt"}}},'
		            + '{"ilvl":"3","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3.%4"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"98.0pt","hanging":"35.0pt"}}},'
		            + '{"ilvl":"4","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3.%4.%5"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"126.0pt","hanging":"42.0pt"}}},'
		            + '{"ilvl":"5","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3.%4.%5.%6"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"161.0pt","hanging":"56.0pt"}}},'
		            + '{"ilvl":"6","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3.%4.%5.%6.%7"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"189.0pt","hanging":"63.0pt"}}},'
		            + '{"ilvl":"7","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3.%4.%5.%6.%7.%8"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"217.0pt","hanging":"70.0pt"}}},'
		            + '{"ilvl":"8","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3.%4.%5.%6.%7.%8.%9"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"253.0pt","hanging":"85.0pt"}}}'
		            + "]}";
		
		ret.mulNum2 = '{"multiLevelType":{"val":"multilevel"},"lvl":[' 
		            + '{"ilvl":"0","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"21.250pt","hanging":"21.250pt"}}},'
		            + '{"ilvl":"1","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"28.350pt","hanging":"28.350pt"}}},'
		            + '{"ilvl":"2","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"35.450pt","hanging":"35.450pt"}}},'
		            + '{"ilvl":"3","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3.%4."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"42.550pt","hanging":"42.550pt"}}},'
		            + '{"ilvl":"4","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3.%4.%5."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"49.60pt","hanging":"49.60pt"}}},'
		            + '{"ilvl":"5","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3.%4.%5.%6."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"56.70pt","hanging":"56.70pt"}}},'
		            + '{"ilvl":"6","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3.%4.%5.%6.%7."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"63.80pt","hanging":"63.80pt"}}},'
		            + '{"ilvl":"7","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3.%4.%5.%6.%7.%8."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"70.90pt","hanging":"70.90pt"}}},'
		            + '{"ilvl":"8","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%1.%2.%3.%4.%5.%6.%7.%8.%9."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"77.950pt","hanging":"77.950pt"}}}'
		            + "]}";

		ret.upperRoman = '{"multiLevelType":{"val":"multilevel"},"lvl":['
					+ '{"ilvl":"0","t":"lvl","start":{"val":"1"},"numFmt":{"val":"upperRoman"},"lvlText":{"val":"%1."},"lvlJc":{"val":"right"},"pPr":{"indent":{"left":"21.0pt","hanging":"21.0pt"}}},'
					+ '{"ilvl":"1","t":"lvl","start":{"val":"1"},"numFmt":{"val":"upperLetter"},"lvlText":{"val":"%2."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"42.0pt","hanging":"21.0pt"}}},'
					+ '{"ilvl":"2","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%3."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"63.0pt","hanging":"21.0pt"}}},'
					+ '{"ilvl":"3","t":"lvl","start":{"val":"1"},"numFmt":{"val":"lowerLetter"},"lvlText":{"val":"%4."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"77.0pt","hanging":"14.0pt"}}},'
					+ '{"ilvl":"4","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"lvlText":{"val":"%5."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"98.0pt","hanging":"21.0pt"}}},'
					+ '{"ilvl":"5","t":"lvl","start":{"val":"1"},"numFmt":{"val":"lowerLetter"},"lvlText":{"val":"%6."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"119.0pt","hanging":"21.0pt"}}},'
					+ '{"ilvl":"6","t":"lvl","start":{"val":"1"},"numFmt":{"val":"lowerRoman"},"lvlText":{"val":"%7."},"lvlJc":{"val":"right"},"pPr":{"indent":{"left":"140.0pt","hanging":"21.0pt"}}},'
					+ '{"ilvl":"7","t":"lvl","start":{"val":"1"},"numFmt":{"val":"lowerLetter"},"lvlText":{"val":"%8."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"161.0pt","hanging":"21.0pt"}}},'
					+ '{"ilvl":"8","t":"lvl","start":{"val":"1"},"numFmt":{"val":"lowerRoman"},"lvlText":{"val":"%9."},"lvlJc":{"val":"right"},"pPr":{"indent":{"left":"182.0pt","hanging":"21.0pt"}}}'
					+ "]}";

		ret.romanHeading = '{"multiLevelType":{"val":"multilevel"},"lvl":['  
					+ '{"ilvl":"0","t":"lvl","start":{"val":"1"},"numFmt":{"val":"upperRoman"},"styleId":"Heading1","lvlText":{"val":"%1."},"lvlJc":{"val":"right"},"pPr":{"indent":{"left":"0.0pt","firstLine":"0.0pt"}}},'
					+ '{"ilvl":"1","t":"lvl","start":{"val":"1"},"numFmt":{"val":"upperLetter"},"styleId":"Heading2","lvlText":{"val":"%2."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"42.0pt","firstLine":"0.0pt"}}},'
					+ '{"ilvl":"2","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"styleId":"Heading3","lvlText":{"val":"%3."},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"84.0pt","firstLine":"0.0pt"}}},'
					+ '{"ilvl":"3","t":"lvl","start":{"val":"1"},"numFmt":{"val":"lowerLetter"},"styleId":"Heading4","lvlText":{"val":"%4)"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"126.0pt","firstLine":"0.0pt"}}},'
					+ '{"ilvl":"4","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"styleId":"Heading5","lvlText":{"val":"(%5)"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"168.0pt","firstLine":"0.0pt"}}},'
					+ '{"ilvl":"5","t":"lvl","start":{"val":"1"},"numFmt":{"val":"lowerLetter"},"styleId":"Heading6","lvlText":{"val":"(%6)"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"210.0pt","firstLine":"0.0pt"}}},'
					+ '{"ilvl":"6","t":"lvl","start":{"val":"1"},"numFmt":{"val":"lowerRoman"},"styleId":"Heading7","lvlText":{"val":"(%7)"},"lvlJc":{"val":"right"},"pPr":{"indent":{"left":"252.0pt","firstLine":"0.0pt"}}},'
					+ '{"ilvl":"7","t":"lvl","start":{"val":"1"},"numFmt":{"val":"lowerLetter"},"styleId":"Heading8","lvlText":{"val":"(%8)"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"296.0pt","firstLine":"0.0pt"}}},'
					+ '{"ilvl":"8","t":"lvl","start":{"val":"1"},"numFmt":{"val":"lowerRoman"},"styleId":"Heading9","lvlText":{"val":"(%9)"},"lvlJc":{"val":"right"},"pPr":{"indent":{"left":"338.0pt","firstLine":"0.0pt"}}}'
					+ "]}";

		ret.numHeading = '{"multiLevelType":{"val":"multilevel"},"lvl":[' 
		            + '{"ilvl":"0","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"styleId":"Heading1","lvlText":{"val":"%1"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"21.0pt","hanging":"21.0pt"}}},'
		            + '{"ilvl":"1","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"styleId":"Heading2","lvlText":{"val":"%1.%2"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"28.80pt","hanging":"28.80pt"}}},'
		            + '{"ilvl":"2","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"styleId":"Heading3","lvlText":{"val":"%1.%2.%3"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"36.0pt","hanging":"36.0pt"}}},'
		            + '{"ilvl":"3","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"styleId":"Heading4","lvlText":{"val":"%1.%2.%3.%4"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"43.20pt","hanging":"43.20pt"}}},'
		            + '{"ilvl":"4","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"styleId":"Heading5","lvlText":{"val":"%1.%2.%3.%4.%5"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"50.40pt","hanging":"50.40pt"}}},'
		            + '{"ilvl":"5","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"styleId":"Heading6","lvlText":{"val":"%1.%2.%3.%4.%5.%6"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"57.60pt","hanging":"57.60pt"}}},'
		            + '{"ilvl":"6","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"styleId":"Heading7","lvlText":{"val":"%1.%2.%3.%4.%5.%6.%7"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"64.80pt","hanging":"64.80pt"}}},'
		            + '{"ilvl":"7","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"styleId":"Heading8","lvlText":{"val":"%1.%2.%3.%4.%5.%6.%7.%8"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"72.0pt","hanging":"72.0pt"}}},'
		            + '{"ilvl":"8","t":"lvl","start":{"val":"1"},"numFmt":{"val":"decimal"},"styleId":"Heading9","lvlText":{"val":"%1.%2.%3.%4.%5.%6.%7.%8.%9"},"lvlJc":{"val":"left"},"pPr":{"indent":{"left":"79.20pt","hanging":"79.20pt"}}}'
		            + "]}";
		
		
		ret.templateNumLevel = ['"numFmt":{"val":"decimal"},"lvlText":{"val":"%1."}',
		                         '"numFmt":{"val":"lowerLetter"},"lvlText":{"val":"%2."}',
		                         '"numFmt":{"val":"lowerRoman"},"lvlText":{"val":"%3."},"lvlJc":{"val":"right"}',
		                         '"numFmt":{"val":"decimal"},"lvlText":{"val":"%4."}',
		                         '"numFmt":{"val":"lowerLetter"},"lvlText":{"val":"%5."}',
		                         '"numFmt":{"val":"lowerRoman"},"lvlText":{"val":"%6."},"lvlJc":{"val":"right"}',
		                         '"numFmt":{"val":"decimal"},"lvlText":{"val":"%7."}',
		                         '"numFmt":{"val":"lowerLetter"},"lvlText":{"val":"%8."}',
		                         '"numFmt":{"val":"lowerRoman"},"lvlText":{"val":"%9."},"lvlJc":{"val":"right"}'
		                        ];
		
		ret.templateBulletLevel = ['"numFmt":{"val":"bullet"},"rPr":{"rFonts":{"ascii":"Arial"}},"lvlText":{"val":"●"}',
		                            '"numFmt":{"val":"bullet"},"rPr":{"rFonts":{"ascii":"Arial"}},"lvlText":{"val":"■"}',
		                            '"numFmt":{"val":"bullet"},"rPr":{"rFonts":{"ascii":"Arial"}},"lvlText":{"val":"♦"}',
		                            '"numFmt":{"val":"bullet"},"rPr":{"rFonts":{"ascii":"Arial"}},"lvlText":{"val":"●"}',
		                            '"numFmt":{"val":"bullet"},"rPr":{"rFonts":{"ascii":"Arial"}},"lvlText":{"val":"■"}',
		                            '"numFmt":{"val":"bullet"},"rPr":{"rFonts":{"ascii":"Arial"}},"lvlText":{"val":"♦"}',
		                            '"numFmt":{"val":"bullet"},"rPr":{"rFonts":{"ascii":"Arial"}},"lvlText":{"val":"●"}',
		                            '"numFmt":{"val":"bullet"},"rPr":{"rFonts":{"ascii":"Arial"}},"lvlText":{"val":"■"}',
		                            '"numFmt":{"val":"bullet"},"rPr":{"rFonts":{"ascii":"Arial"}},"lvlText":{"val":"♦"}'
		                            ];
		
		ret.templateIndent = [ '"start":{"val":"1"},"pPr":{"indent":{"left":"21.0pt","hanging":"21.0pt"}}}',
	                            '"start":{"val":"1"},"pPr":{"indent":{"left":"42.0pt","hanging":"21.0pt"}}}',
	                            '"start":{"val":"1"},"pPr":{"indent":{"left":"63.0pt","hanging":"21.0pt"}}}',
	                            '"start":{"val":"1"},"pPr":{"indent":{"left":"84.0pt","hanging":"21.0pt"}}}',
	                            '"start":{"val":"1"},"pPr":{"indent":{"left":"105.0pt","hanging":"21.0pt"}}}',
	                            '"start":{"val":"1"},"pPr":{"indent":{"left":"126.0pt","hanging":"21.0pt"}}}',
	                            '"start":{"val":"1"},"pPr":{"indent":{"left":"147.0pt","hanging":"21.0pt"}}}',
	                            '"start":{"val":"1"},"pPr":{"indent":{"left":"168.0pt","hanging":"21.0pt"}}}',
	                            '"start":{"val":"1"},"pPr":{"indent":{"left":"189.0pt","hanging":"21.0pt"}}}'
		                       ];
		return ret;
	}
	
});