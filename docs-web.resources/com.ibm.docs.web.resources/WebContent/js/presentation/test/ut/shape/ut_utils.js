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

dojo.provide("pres.test.ut.shape.ut_utils");

describe("pres.test.ut.shape.ut_utils", function()
{
	beforeEach(function()
	{

	});

	afterEach(function()
	{
		;
	});

	it("calculate shape hexagon gdLst", function()
	{
		var frm = {l: 1000000, t: 2000000, w: 10000000, h: 20000000};
		var customAv = null;
		var type = "hexagon";
		var result = pres.utils.shapeUtil.calcGdLstValuesFromShapeFrame(frm, customAv, type);
		expect(result).toEqual(jasmine.objectContaining({
			maxAdj: 50000,
			a: 25000,
			shd2: 11547000,
			x1: 2500000,
			x2: 7500000,
			dy1: 9999995.337498913,
			y1: 4.662501087412238,
			y2: 19999995.33749891,
			q1: -25000,
			q2: 0,
			q3: 2,
			q4: 2,
			q5: 0,
			q6: -1,
			q7: 2,
			q8: 4,
			il: 1666666.6666666667,
			it: 3333333.3333333335,
			ir: 8333333.333333333,
			ib: 16666666.666666666
		}));
	});

	it("calculate shape wedgeEllipseCallout gdLst with customize avLst", function()
	{
		var frm = {
			l: 1000000,
			t: 2000000,
			w: 10000000,
			h: 20000000
		};
		var customAv = {adj1: "val 100000", adj2: "val -30000"};
		var type = "wedgeEllipseCallout";
		var result = pres.utils.shapeUtil.calcGdLstValuesFromShapeFrame(frm, customAv, type);
		expect(result).toEqual(jasmine.objectContaining({
			dxPos: 10000000,
			dyPos: -6000000,
			xPos: 15000000,
			yPos: 4000000,
			sdx: 200000000000000,
			sdy: -60000000000000,
			pang: -1001954.6540396174,
			stAng: -341954.6540396174,
			enAng: -1661954.6540396174,
			dx1: 4975284.399811332,
			dy1: -993066.2434983755,
			x1: 9975284.399811331,
			y1: 9006933.756501624,
			dx2: 4426998.786126445,
			dy2: -4648303.668064291,
			x2: 9426998.786126446,
			y2: 5351696.331935709,
			stAng1: -677273.2891613472,
			enAng1: -2783814.2199830813,
			swAng1: -2106540.930821734,
			swAng2: 19493459.069178265,
			swAng: 19493459.069178265,
			idx: 3535533.905932738,
			idy: 7071067.811865475,
			il: 1464466.094067262,
			ir: 8535533.905932738,
			it: 2928932.188134525,
			ib: 17071067.811865475
		}));
	});
	
	it("calculate avLst from adjust handler", function()
	{
		var frm = {
			l: 1000000,
			t: 2000000,
			w: 10000000,
			h: 20000000
		};
		var customAv = {
			adj1: "val 100000",
			adj2: "val -30000"
		};
		var type = "wedgeEllipseCallout";
		var ahIndex = 0;
		var posX = 3000000;
		var posY = 1500000;
		var result = pres.utils.shapeUtil.invertCalcAvLstFromGuideWithAh(frm, customAv, type, ahIndex, posX, posY);		
		expect(result).toEqual({adj1: -20000, adj2: -42500});
		
		var frm = {
			l: 1000000,
			t: 2000000,
			w: 10000000,
			h: 20000000
		};
		var customAv = {
			adj1: "val 100000",
			adj2: "val -30000"
		};
		var type = "arc";
		var ahIndex = 0;
		var posX = 3000000;
		var posY = 1500000;
		var result = pres.utils.shapeUtil.invertCalcAvLstFromGuideWithAh(frm, customAv, type, ahIndex, posX, posY);		
		expect(result.adj1.toFixed(1)).toEqual("15405568.8");
	});
	
	it("calculate shape path", function()
	{
		var frm = {
			l: 1000000,
			t: 2000000,
			w: 20000000,
			h: 30000000
		};
		var customAv = {
			adj: "val 30000"
		};
		var type = "star5";
		var result = pres.utils.shapeUtil.calcPathFromGuide(frm, customAv, type);
		expect(result.path).toEqual("M 0.00 902.28 L 495.42 671.95 L 787.40 0.00 L 1079.39 671.95 L 1574.80 902.28 L 1259.84 1547.90 L 1274.04 2362.20 L 787.40 2089.27 L 300.76 2362.20 L 314.96 1547.90 Z");
				
		var frm = {
			l: 1000000,
			t: 2000000,
			w: 20000000,
			h: 30000000
		};
		var customAv = {
			adj2: "val 30000"
		};
		var type = "arc";
		var result = pres.utils.shapeUtil.calcPathFromGuide(frm, customAv, type);
		expect(result.path).toEqual("M 787.40 0.00 a 787.40 1181.10 0.00 0 1 787.39 1187.97");
	});

	it("parse and regenerate transform style", function()
	{
		var style = "rotate(48deg) scale(-1, -1)";
		var result = pres.utils.shapeUtil.parseTransformStyle(style);
		expect(result).toEqual({
			rot: 48,
			scaleX: -1,
			scaleY: -1
		});
		
		var newStyle = pres.utils.shapeUtil.getTransformStyle(result);
		expect(newStyle).toEqual(style.replace(/\s/g, ""));
	});
});
