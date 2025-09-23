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

dojo.provide("concord.tests.common.ut.js.ut_editor_model");
dojo.require("concord.tests.common.ut.js.providers.pe");

describe("concord.tests.common.ut.js.ut_edit_model", function()
{		
	window.pe = new concord.tests.common.ut.js.providers.pe();
	var editorsStore = pe.scene.getEditorStore();
	
	beforeEach(function()
	{
		;
	});

	afterEach(function()
	{
		;
	});
	
	it("editor test exist...", function()
	{
		var exist = editorsStore.exists("E66028A9-2177-DF19-8525-77D60072EFA1");
		expect(exist).toBe(true);
		var notexist = editorsStore.exists("E66028A9-2177-DF19-8525-77D60072EFA1111111");
		expect(notexist).toBe(false);
	});	
	
	it("editor test editors count...", function()
	{
		var count = editorsStore.getCount();
		expect(count).toBe(2);
	});
	
});
