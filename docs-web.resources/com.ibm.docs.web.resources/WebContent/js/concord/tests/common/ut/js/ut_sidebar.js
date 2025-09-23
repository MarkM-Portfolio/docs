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

dojo.provide("concord.tests.common.ut.js.ut_sidebar");
dojo.require("concord.tests.common.ut.js.providers.pe");
dojo.require("concord.tests.common.ut.js.providers.TestCommentsProxy");
dojo.require("concord.xcomments.CommentsStore");
dojo.require("concord.widgets.sidebar.UnifiedEditorToken");
dojo.require("concord.widgets.sidebar.SideBar");

describe("concord.tests.common.ut.js.ut_sidebar", function()
{	
	window.pe = new concord.tests.common.ut.js.providers.pe();
	
	beforeEach(function()
	{
		;
	});

	afterEach(function()
	{
		;
	});
	
	it("sidebar test create...", function()
	{
		var tmpNode = document.createElement("div");
		var sidebar =  new concord.widgets.sidebar.SideBar(tmpNode, window.pe.scene);
		expect(sidebar).not.toBe(null);
	});	

	
});
