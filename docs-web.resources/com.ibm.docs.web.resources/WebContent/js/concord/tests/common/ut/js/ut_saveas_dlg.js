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

dojo.provide("concord.tests.common.ut.js.ut_saveas_dlg");
dojo.require("concord.tests.common.ut.js.providers.pe");
dojo.require("concord.widgets.SaveAsDialog");
dojo.require("concord.util.uri");

describe("concord.tests.common.ut.js.ut_saveas_dlg", function()
{	
	window.pe = new concord.tests.common.ut.js.providers.pe();
	DOC_SCENE = {};
	DOC_SCENE.repository = "lcfiles";
	
	concord.util.uri.getFilesPeopleUri = function()
	{
		return "../data/json/ic_people.json";
	};
	
	beforeEach(function()
	{
		;
	});

	afterEach(function()
	{
		;
	});
	
	it("saveas dialog test cases in community files...", function()
	{
		DOC_SCENE.communityID = "abcde";
		var dlg = new concord.widgets.SaveAsDialog(pe.lotusEditor, true);
		expect(dlg.showExternal).toBe(false);
		
		var checkBox = dojo.byId("S_d_externalShare");
		expect(!checkBox).toBe(true);
	});	
	
	it("saveas dialog test cases in personal files...", function()
	{
		DOC_SCENE.communityID = "";
		var dlg = new concord.widgets.SaveAsDialog(pe.lotusEditor, true);
		expect(dlg.showExternal).toBe(true);
		
		var checkBox = dojo.byId("S_d_externalShare");
		expect(checkBox).not.toBe(null);
		expect(checkBox).not.toBe(undefined);
	});	
});
