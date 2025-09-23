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

dojo.provide("websheet.event.undo.SetCellEvent4UndoDelete");
dojo.require("websheet.Constant");
dojo.require("websheet.event.undo.Event");

/**
 * 1) Summary
 * A SetCellEvent only for delete undo attachments, mainly to restore "#REF!" tokens. This is used for performance boost during delete
 * undo action ID <-> index transform.
 * This event implementation is only used when Message is construct after a INSERT of SHEET, ROW and COLUMN, i.e. the attachments of UNDO DELETE
 * these elements. Also, it is only used when the Message is construct for undo stack, i.e. Message._bTransSendoutMsg is false. For Transformer
 * sendout list building, old SetCell event is used.
 * 
 * 2) Details
 * When undo action is transformed in Message.toJson(), for the case that message is in undo stack, (Message._bTransSendoutMsg is false),
 * if the message is for undo action (otherwise for OT), i.e. Message.this._bTransform is false, then SetCell message transformed value is
 * abandoned and replaced by old value (before transformation, "as it is" when it first pushed into undo stack.
 * If the message is in undo stack and is for OT, Message._bTransform is true, the SetCell message's transformed value is used. But consider
 * the scenario of OT, for the client that does OT, define e as the incoming action, below is what happens,
 * 1, DEL action
 *  -- OT begins --
 * 2, UNDO DEL action
 * 3, APPLY e
 * 4, REDO DEL action
 * Between step 1 and 2, there's no incoming action, so the action transformed would only get the same result "as it is" when it first pushed into
 * undo stack.
 * After all, if the message is in undo stack, no matter the message is being transformed for undo action, or for OT, the result is either abandoned,
 * or must be the same before transformation. So in this case, we don't need to transform the action -> index. One step further, we don't need to
 * transform the action -> ID either.
 * Based on above reasons, we have this special implemtation of SetCell event, it does nothing for ID <-> transformation. For toJson implemtation,
 * no clone is called for data part, only reference is cloned and safe to change.
 */
dojo.declare("websheet.event.undo.SetCellEvent4UndoDelete", websheet.event.undo.Event, {
	// same as SetCellEvent
	_checkRelated: function(token)
	{
		if(token.type == websheet.Constant.Event.SCOPE_ROW)
		{
			var srIndex = token.getStartRowIndex();
			var erIndex = token.getEndRowIndex();
			if(erIndex == -1) erIndex = srIndex;
			var rIndex = this.refTokenId.token.getStartRowIndex();
			if(rIndex <= 0) return true;
			if(rIndex >= srIndex && rIndex <= erIndex) return true;
			else return false;
		}else if(token.type == websheet.Constant.Event.SCOPE_COLUMN)
		{
			var scIndex = token.getStartColIndex();
			var ecIndex = token.getEndColIndex();
			if(ecIndex == -1) ecIndex = scIndex;
			var cIndex = this.refTokenId.token.getStartColIndex();
			if(cIndex <= 0) return true;
			if(cIndex >= scIndex && cIndex <= ecIndex) return true;
			else return false;
		}
	},	
	
	toJson: function()
	{
		var e = this.jsonEvent;
		var ref = e.reference;
		this.transformRef2Index();
		var refValue = this.refTokenId.token.toString();
		if (refValue.indexOf("#REF") != -1) {
			// has #REF
			console.warn("invalide refValue : " + refValue + " event is : " + e);
			return null;
		}
		
		return {
			action: e.action,
			data: e.data,
			reference: {
				refType: ref.refType,
				refValue: refValue
			}
		};
	}
});