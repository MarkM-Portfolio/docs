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

dojo.provide("pres.test.ut.model.ut_htmlhelper");

describe("pres.test.ut.model.ut_htmlhelper", function()
{

	var g_html1 = "$123&amp;&nbsp;\"'";
	var g_html11 = "$123&amp;&nbsp;&quot;'";
	var g_plain1 = "$123& \"'";

	var g_html2 = "&lt;a&gt;Hello&nbsp;&amp;you!&lt;/a&gt;";
	var g_plain2 = "<a>Hello &you!</a>";

	beforeEach(function()
	{
		;
	});

	afterEach(function()
	{
		;
	});

	it("from HTML", function()
	{
		var plain = pres.utils.htmlHelper.fromHTML(g_html1);
		var plain2 = pres.utils.htmlHelper.fromHTML(g_html11);
		expect(plain).toBe(g_plain1);
		expect(plain2).toBe(g_plain1);
		var plain3 = pres.utils.htmlHelper.fromHTML(g_html2);
		expect(plain3).toBe(g_plain2);
	});

	it("to HTML", function()
	{
		var html = pres.utils.htmlHelper.toHTML(g_plain1);
		expect(html).toBe(g_html11);
		var html2 = pres.utils.htmlHelper.toHTML(g_plain2);
		expect(html2).toBe(g_html2);
	});

	it("extract style", function()
	{
		var str = "width:110px;float:left;";
		var style = pres.utils.htmlHelper.extractStyle(str);
		expect(style.width).toBe("110px");
		expect(style.float).toBe("left");
		expect(style.left).toBe(undefined);
		var str = "; width : 110 px ; float : left ;  ";
		var style = pres.utils.htmlHelper.extractStyle(str);
		expect(style.width).toBe("110 px");
		expect(style.float).toBe("left");
		expect(style.left).toBe(undefined);
	});

	it("block/load ContentImage", function()
	{
				var str = "222<img id=\"SHAPE_id_150b65c2e41\" style=\"position:relative;left:0%;top:0%;width:100%;height:100%;\" src=\"Pictures/svgid_150be1acfab.png\" class=\"draw_image\">222";
				var bstr = pres.utils.htmlHelper.blockContentImage(str);
				var sfalse = bstr.indexOf("data-") >0 ;
				expect(sfalse).toBe(true);
				var lstr = pres.utils.htmlHelper.loadContentImage(bstr);
				expect(lstr).toBe(str);
	});
});
