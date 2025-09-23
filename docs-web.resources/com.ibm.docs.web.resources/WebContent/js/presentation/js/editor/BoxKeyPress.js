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

dojo.provide("pres.editor.BoxKeyPress");

dojo.declare("pres.editor.BoxKeyPress", null, {

	onKeyPress: function(e)
	{},

	impl_OnKeyPress : function(e)
	{
		if(pe.IMEWorking)
			return;
		var bHandled = false;
		if(pe.inCopyPasteAction || pe.copyPasteIssueCases || pe.inUndoRedo)
		{
			return true;
		}
		
		var visibleKeyCode = e.which ? e.which : (e.keyCode ? e.keyCode : (e.charCode ? e.charCode : 0));
		
		// in [Polish] IME, right "alt" key will also enable "e.ctrlkey"
		if ((e.ctrlKey || (dojo.isMac && e.metaKey))&&!e.altKey && e.keyCode == 65)
		{
			if (this.status == this.STATUS_EDITING)
			{
				dojo.stopEvent(e);
			}
			else
			{

			}
		}
		else if (e.keyCode == 13)
		{
			// enter
			if (this.status == this.STATUS_EDITING)
			{
				dojo.stopEvent(e);
			}
		}
		else if (e.keyCode == 8 // backspace key
				|| (e.keyCode == 46)&&(e.keyChar.length == 0)// delete key
				|| (visibleKeyCode == 32))//space key
		{
			if (this.status == this.STATUS_EDITING)
			{
				dojo.stopEvent(e);
			}
		}
		else
		{
			if (dojo.isMac && e.metaKey) {
				return false;
			}
			
			var inputStr = EditorUtil.keyCodeEventToVisibleChar(e);
			if (inputStr) {
				clearInterval(pe.scene.editor._IMEPendingInputTimer);
				if (this.editor.pendingInput && this.editor.pendingInput.length > 0) {
					this.editor.inputString(this.editor.pendingInput, 'keyPress', true);
					this.editor.pendingInput = null;
					this.editor.compositionendEventinputString = '';
				}
				this.editor.inputString(inputStr);
				bHandled = true;
			}
			
		}
		
		if (bHandled)
		{
			e.stopPropagation();
			clearTimeout(this._checkKeyDownUpdateTimer);
			this._hasUpdate = true;
			this._checkKeyDownUpdateTimer = setTimeout(dojo.hitch(this, function()
			{
				this.notifyUpdate();
				this._hasUpdate = false;
			}), 300);
			dojo.stopEvent(e);
			// if have input to textbox then clean FormatPainter Style
			pe.scene.slideEditor.cleanFormatPainter();
		}
		
		return bHandled;
	}

});