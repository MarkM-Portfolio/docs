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

dojo.provide("concord.xcomments.TextCommentsProxy");

// doPost is obsolete in this class, rather, the post was taken place under document message
// and handled by DocumentMessageHandler, rather than DocumentCommentsHandler...
dojo.declare("concord.xcomments.TextCommentsProxy", [concord.xcomments.CommentsProxy], {
	getAll: function ()
	{	
		var comments = pe.lotusEditor.relations.commentService.initCommentsStore();
		this.callback.handleStore(comments);
	}
});