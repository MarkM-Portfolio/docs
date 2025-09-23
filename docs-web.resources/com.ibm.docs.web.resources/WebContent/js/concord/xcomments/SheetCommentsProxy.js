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

dojo.provide("concord.xcomments.SheetCommentsProxy");

// doPost is obsolete in this class, rather, the post was taken place under spreadsheet message
// and handled by spreadsheet, rather than DocumentCommentsHandler...
dojo.declare("concord.xcomments.SheetCommentsProxy", [concord.xcomments.CommentsProxy], {
	getAll: function ()
	{	
		var comments = pe.scene.editor.getCommentsHdl().initCommentsStore();
		this.callback.handleStore(comments);
	}
});