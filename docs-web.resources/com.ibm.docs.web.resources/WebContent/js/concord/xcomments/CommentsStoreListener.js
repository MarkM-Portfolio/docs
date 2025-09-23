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
dojo.provide("concord.xcomments.CommentsStoreListener");

dojo.declare("concord.xcomments.CommentsStoreListener", null, {
	
	commentsAdded: function (comments)
	{
		throw new Error("not implemented");
	},
	
	commentItemAppended: function (commentsId, item)
	{
		throw new Error("not implemented");
	},
	
	commentItemUpdated: function (commentsId, index, item)
	{
		throw new Error("not implemented");
	},

	commentsRemoved: function (commentsId)
	{
		throw new Error("not implemented");
	}
});