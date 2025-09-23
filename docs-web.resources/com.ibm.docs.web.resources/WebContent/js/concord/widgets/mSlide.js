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

/*
 * @mSlideComments.js IBM Lotus Project Concord component
 * U.S. Government Users Restricted Rights: Use, duplication or disclosure restricted by GSA ADP Schedule Contract with IBM Corp.
 */

dojo.provide("concord.widgets.mSlide");

dojo.declare("concord.widgets.mSlide", null, {
	id: null,
	draft: null,
	draftNote: null,
	comments: null,	// array of CommentItem
	undo: null, // array of canvas base64 data

	constructor: function(id, draft, draftNote, comments, undo) {
		if (id)
			this.id = id;
		
		if (draft)
			this.draft = draft;		

		if (draftNote)
			this.draftNote = draftNote;		

		if (comments)
			this.comments = comments;
		
		if (undo)
			this.undo = undo;
	},

	getId: function() {
		return this.id;
	},
	
	setId: function(id) {
		this.id = id;
	},
	
	getDraft: function() {
		return this.draft;
	},
	
	setDraft: function(draft) {
		this.draft = draft;
	},
	
	getDraftNote: function() {
		return this.draftNote;
	},
	
	setDraftNote: function(draftNote) {
		this.draftNote = draftNote;
	},
	
	getComments: function() {
		return this.comments;
	},
	
	setComments: function(comments) {
		this.comments = comments;
	},

	getUndo: function() {
		return this.undo;
	},
	
	setUndo: function(undo) {
		this.undo = undo;
	}
});