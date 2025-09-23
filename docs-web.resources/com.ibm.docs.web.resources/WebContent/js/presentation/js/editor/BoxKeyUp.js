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

dojo.provide("pres.editor.BoxKeyUp");

dojo.declare("pres.editor.BoxKeyUp", null, {

	onKeyUp: function(e)
	{

	},
	readCursorText: function(e)
	{
		var cselection = this.editor.mContentModel.getSelection();
		var table = this.element.table;
		var readText = "";
		if (cselection)
		{
			if (cselection.bCollapsed)
			{
				var focusTxtCell = this.editor.mContentModel.getFocusTxtCell();
				if (focusTxtCell)
				{
					if (this.lastLineInex == undefined)
						this.lastLineInex = cselection.start.lineIndex;
					var paragraph = focusTxtCell.paragraphs[cselection.start.lineIndex];
					var allText = paragraph.strContent;
					if (this.lastLineInex == cselection.start.lineIndex)
					{
						readText = allText.charAt(cselection.start.lineTextOffset);
					}
					else
					{
						readText = allText;
						this.lastLineInex = cselection.start.lineIndex;
					}
				}
				readText = readText.replace(/\u200b/g, "").replace(/\u00a0/g, "").replace(" ", "");
				if (readText.length == 0)
					readText = pe.presStrs.acc_blank;
				pe.scene.slideEditor && pe.scene.slideEditor.announce(readText);
			}
			else
			{// selected text or cells.
				var focusTxtCell = this.editor.mContentModel.getFocusTxtCell();
				if (focusTxtCell)
				{
					var sparagraph = focusTxtCell.paragraphs[cselection.start.lineIndex];
					var sallText = sparagraph.strContent;
					if (cselection.start.lineIndex == cselection.end.lineIndex)
					{
						readText = sallText.substring(cselection.start.lineTextOffset, cselection.end.lineTextOffset);
					}
					else
					{
						var index = 0;
						dojo.forEach(focusTxtCell.paragraphs, dojo.hitch(this, function(paragraph)
						{
							var allText = paragraph.strContent;
							if (index == cselection.start.lineIndex)
							{
								readText = allText.substring(cselection.start.lineTextOffset, allText.length) + " ";
							}
							if (index > cselection.start.lineIndex && index < cselection.end.lineIndex)
							{
								readText += allText + " ";
							}
							if (index == cselection.end.lineIndex)
							{
								readText += allText.substring(0, cselection.end.lineTextOffset);
							}							
							index++;
						}));
					}
				}
				else
				{
					var sCells = cselection.cells;
					dojo.forEach(sCells, dojo.hitch(this, function(cell)
					{
						var domCell = dojo.byId(cell.id);
						if (domCell)
							readText += domCell.textContent + " ";
					}));
				}
				readText = readText.replace(/\u200b/g, "");
				if (readText.length == 0)
					readText = pe.presStrs.acc_blank;
				pe.scene.slideEditor && pe.scene.slideEditor.announce(readText + pe.presStrs.acc_selected);
			}
		}
	},
	impl_OnKeyUp: function(e)
	{
		if (pe.IMEWorking)
			return;
		if (this.status != 2)
			return;
		var bHandled = false;
		if (this.status == this.STATUS_EDITING)
		{
			if (e.keyCode == 16 || (e.keyCode >= 35 && e.keyCode <= 40))
			{
				// 35 end
				// 36 home
				// 37 left
				// 38 up
				// 39 right
				// 40 down
				this._updatingSelection = true;
				setTimeout(dojo.hitch(this, function()
				{
					if (e.keyCode == 16 && this.element.family == "table" && this._pendingRenderTableSelection)
					{
						this.editor.renderTableSelection();
						this._pendingRenderTableSelection = false;
					} else 
						this.editor.updateSelection();
					this._updatingSelection = false;
					this.flushKeyDownEvent();
					if (pe.onCellSelChange)
					{
						delete pe.onCellSelChange;
					}
					else
					{
						this.readCursorText();
					}
				}), 0);
			}
			bHandled = true;
			dojo.stopEvent(e);
		}
		return bHandled;
	}

});