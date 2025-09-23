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

dojo.provide("concord.widgets.CommentsEventListener");

dojo.declare("concord.widgets.CommentsEventListener", null, {
	/*
	 * called when a comments is created.
	 * editor implementation should associate this commentsId to document model,
	 * on current focused selection element
	 * @param commentsId, the id
	 */
	commentsCreated: function (commentsId)
	{
	throw new Error("not implemented");
	},

	/*
	 * called when a comments is deleted.
	 * editor implementation should de-associate this commentsId from document model
	 * @param commentsId, the id to be deleted
	 */
	commentsDeleted: function (commentsId)
	{
		throw new Error("not implemented");
	},
	
	/*
	 * called when a comments is appended.
	 * editor implementation should de-associate this commentsId from document model
	 * @param commentsId, the id to be appended
	 * @param item, the item to be appended
	 */	
	commentsAppended: function (commentsId, item)
	{
		throw new Error("not implemented");
	},	

	/*
	 * called when a comments is selected in comments side bar.
	 * editor implementation should scroll and focus to where the comments is located in document
	 * @param commentsId, the id
	 */
	commentsSelected: function (commentsId)
	{
		throw new Error("not implemented");
	},

	/*
	 * called when a comments is selected in comments side bar.
	 * editor implementation should display the comments as un-selected state
	 * @param commentsId, the id
	 */
	commentsUnSelected: function (commentsId)
	{
		throw new Error("not implemented");
	},

	/*
	 * called when the side bar is displayed
	 * editor implementation may need to adjust page layout if necessary
	 */
	sidebarShown: function ()
	{
		throw new Error("not implemented");
	}
//	,

	/*
	 * called when the side bar is hidden
	 * editor implementation may need to adjust page layout if necessary
	 */
//	sidebarHidden: function ()
//	{
//		throw new Error("not implemented");
//	}
});
