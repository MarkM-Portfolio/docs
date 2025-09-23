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

dojo.provide("concord.tests.common.ut.js.ut_comments_model");

dojo.require("concord.tests.common.ut.js.providers.TestCommentsProxy");
dojo.require("concord.xcomments.CommentsStore");

describe("concord.tests.common.ut.js.ut_comments_model", function()
{	
	window.g_locale = "en_US";
	var commentsProxy = new concord.tests.common.ut.js.providers.TestCommentsProxy("../data/json/comments_writer_data.json");
	//var state = commentsProxy.getAll();
	var commentsStore = new concord.xcomments.CommentsStore(null, null, commentsProxy, null);	
	commentsStore.registerListener(commentsProxy);
	
	beforeEach(function()
	{
		;
	});

	afterEach(function()
	{
		;
	});
	
	it("comments test exist...", function()
	{
		var exist = commentsStore.exists("2ac2f5de-8075-4f22-841d-eae8d182ae45");
		expect(exist).toBe(true);
		var notexist = commentsStore.exists("2ac2f5de-8075-4f22-841d-eae8d182ae45---");
		expect(notexist).toBe(false);
	});	
	
	it("comments test get count...", function()
	{
		var count = commentsStore.getCount();
		expect(count).toBe(2);
	});
	
	it("comments test get...", function()
	{
		var comment1 = commentsStore.get("2ac2f5de-8075-4f22-841d-eae8d182ae45");
		var comment2 = commentsStore.getFromIndex(0);
		expect(comment1.id).toBe(comment2.id);
	});	
		
	it("comments test add...", function()
	{
		var xcomment_item = new concord.xcomments.CommentItem;
		xcomment_item.content = "content";
		xcomment_item.name = "author";
		xcomment_item.time = new Date().getTime();
		xcomment_item.resolved = false;
		xcomment_item.org = "ibm"; 
		xcomment_item.uid = "1";
		xcomment_item.assigneeOrg = "ibm";
		xcomment_item.assigneeId = "1";
		xcomment_item.assignee = "test1";
		xcomment_item.mentions = null; 

		commentsStore.add(xcomment_item);

		var count = commentsStore.getCount();
		expect(count).toBe(3);
		
		// co-edit add
		xcomment_item = new concord.xcomments.CommentItem;
		xcomment_item.content = "content";
		xcomment_item.name = "author";
		xcomment_item.time = new Date().getTime();
		xcomment_item.resolved = false;
		xcomment_item.org = "ibm"; 
		xcomment_item.uid = "1";
		xcomment_item.assigneeOrg = "ibm";
		xcomment_item.assigneeId = "1";
		xcomment_item.assignee = "test1";
		xcomment_item.mentions = null; 
		commentsStore.added(xcomment_item);
		
		count = commentsStore.getCount();
		expect(count).toBe(4);

	});

	it("comments test append...", function()
	{
		var xcomment_item = new concord.xcomments.CommentItem;
		xcomment_item.content = "content";
		xcomment_item.name = "author";
		xcomment_item.time = new Date().getTime();
		xcomment_item.resolved = false;
		xcomment_item.org = "ibm"; 
		xcomment_item.uid = "1";
		xcomment_item.assigneeOrg = "ibm";
		xcomment_item.assigneeId = "1";
		xcomment_item.assignee = "test1";
		xcomment_item.mentions = null; 

		var count = commentsStore.get("2ac2f5de-8075-4f22-841d-eae8d182ae45").getItemCount();
		expect(count).toBe(1);
		commentsStore.appendItem("2ac2f5de-8075-4f22-841d-eae8d182ae45", xcomment_item);
		count = commentsStore.get("2ac2f5de-8075-4f22-841d-eae8d182ae45").getItemCount();
		expect(count).toBe(2);
		
		// co-edit append
		xcomment_item = new concord.xcomments.CommentItem;
		xcomment_item.content = "content";
		xcomment_item.name = "author";
		xcomment_item.time = new Date().getTime();
		xcomment_item.resolved = false;
		xcomment_item.org = "ibm"; 
		xcomment_item.uid = "1";
		xcomment_item.assigneeOrg = "ibm";
		xcomment_item.assigneeId = "1";
		xcomment_item.assignee = "test1";
		xcomment_item.mentions = null; 
		
		commentsStore.itemAppended("2ac2f5de-8075-4f22-841d-eae8d182ae45", xcomment_item);
		count = commentsStore.get("2ac2f5de-8075-4f22-841d-eae8d182ae45").getItemCount();
		expect(count).toBe(3);

	});
	
	it("comments test remove...", function()
	{
		var comment = commentsStore.get("2ac2f5de-8075-4f22-841d-eae8d182ae45");
		expect(comment.id).toBe("2ac2f5de-8075-4f22-841d-eae8d182ae45");
		var removed = commentsStore.remove("2ac2f5de-8075-4f22-841d-eae8d182ae45");
		expect(removed).toBe(true);
		var removeFail = commentsStore.remove("2ac2f5de-8075-4f22-841d-eae8d182ae45---");
		expect(removeFail).toBe(false);
		var comment1 = commentsStore.get("2ac2f5de-8075-4f22-841d-eae8d182ae45");
		expect(comment1.id).toBe("2ac2f5de-8075-4f22-841d-eae8d182ae45"); // get from store
		
		// co-edit remove
		commentsStore.removed("2ac2f5de-8075-4f22-841d-eae8d182ae45");
	});
});
