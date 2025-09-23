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

dojo.provide("pres.editor.BoxKeyDown");
dojo.require("pres.editor.EditorUtil");
dojo.declare("pres.editor.BoxKeyDown", null, {
	onKeyDown: function(e)
	{

	},

	flushKeyDownEvent : function()
	{
		if(!this.keyDownEventPool)
			return;
		for(var i=0;i<this.keyDownEventPool.length;i++)
		{
			var keyEvent = this.keyDownEventPool[i];
			keyEvent.func(this,keyEvent.data);
		}
			
		this.keyDownEventPool = [];
	},
	
	impl_OnKeyDown: function(e)
	{
		if(pe.IMEWorking)
			return;
		if(!this.keyDownEventPool)
			this.keyDownEventPool = [];
		/*
		 * TODO
		 * every editor function like /HandleEnter/ should return true or false to indicate if model was actually dirty 
		 * */
		var textUpdate = false;

		if (this.status == this.STATUS_EDITING)
		{
			//var bHandled = false;
			var keys = dojo.keys;
			var keyCode = e.keyCode;
			var keyEvent = 	{
						func : null,
						data : null};
			keyEvent.data = {shiftKey : e.shiftKey,
					keyCode : e.keyCode};
			
			// Enter
			if (keyCode == 13)
			{
				keyEvent.func = function(_this,eData)
				{
					_this.editor.HandleEnter(eData.shiftKey);
				};
				textUpdate = true;
			}
			else if (keyCode == 27)
			{
				// escape
				var slideEditor = pe.scene.slideEditor;
				var notesEditor = pe.scene.notesEditor;
				var inNotes = false;

				if (slideEditor.linkPanelShow)
				{
					dojo.stopEvent(e);
					slideEditor.closeLink();
					return;
				}
				
				dojo.forEach(slideEditor.getChildren(), function(b)
				{
					if (b.status > 1)
						b.exitEdit();
					else if (b.status > 0)
						b.exitSelection();
				});
				dojo.forEach(notesEditor.getChildren(), function(b)
				{
					if (b.status > 1)
					{
						inNotes = true;
						b.exitEdit();
					}
				});
				if (slideEditor.inDragCreateMode)
					slideEditor.toggleDragCreateMode();
				inNotes ? notesEditor.domNode.focus() : slideEditor.domNode.focus();
				dojo.stopEvent(e);
			}
			else if (keyCode == 8 // backspace key
					|| keyCode == 46)// delete key
			{
				keyEvent.func = function(_this,eData)
				{
					_this.editor.HandleDelete(eData.keyCode == 8);
				};
				textUpdate = true;
			}
			// Ctrl + A select all
			// in [Polish] IME, right "alt" key will also enable "e.ctrlkey"
			else if ((e.ctrlKey || (dojo.isMac && e.metaKey))&&!e.altKey && keyCode == 65)
			{
				keyEvent.func = function(_this,eData)
				{
					_this.editor.selectAll();
				};
			}
			// Ctrl + B/I/U set style
			else if ((e.ctrlKey || (dojo.isMac && e.metaKey)&&!e.altKey) 
					&& (
							(keyCode == 66) //B
							|| (keyCode == 73) //I
							|| (keyCode == 85) //U
							)
					)
			{
				keyEvent.func = function(_this,eData)
				{
					var c = pres.constants;
					var cmd = null;
					var cm = pe.scene.hub.commandsModel;
					switch(eData.keyCode)
					{
						case 66:cmd = c.CMD_BOLD;break;//Bold
						case 73:cmd = c.CMD_ITALIC;break;//Italic
						case 85:cmd = c.CMD_UNDERLINE;break;//Underline
					}
					if(cmd)
					{
						var item = cm.getModel(cmd);
						var value = !item.checked;
						_this.editor.setTextStyle(cmd, value);
					}
				};
				textUpdate = true;
			}
			else if (keyCode == 9)// tab key
			{
				if (this.element.family == "table")
				{
					e.stopPropagation();
					if (this.cellNavigate(keyCode, e.shiftKey))
					{
						this.editor.updateSelection();
						dojo.stopEvent(e);
					}
				}
				else
				{
					keyEvent.func = function(_this,eData)
					{
						_this.editor.handleTabKey(eData.shiftKey);
					};
					textUpdate = true;
				}
			}
			else if (keyCode == 32)// 'space' key
			{
				keyEvent.func = function(_this,eData)
				{
					_this.editor.handleSpaceKey();
				};
				textUpdate = true;
			}
			else if (keyCode == 45)// 'insert' key
			{
				dojo.stopEvent(e);
			}
			else if (keyCode == keys.UP_ARROW
					|| keyCode == keys.DOWN_ARROW
					|| keyCode == keys.LEFT_ARROW
					|| keyCode == keys.RIGHT_ARROW
					|| keyCode == keys.HOME
					|| keyCode == keys.END)
			{
				this._updatingSelection = true;
				this.focus();
				if (this.element.family == "table" && this.cellNavigate(keyCode, e.shiftKey))
				{
					this.editor.updateSelection();
					e.stopPropagation();
					dojo.stopEvent(e);
				}
				else if (this.element.family == "table" && e.shiftKey)
				{
					this._pendingRenderTableSelection = true;
				}
				else 
				{
					var keyboardStatus = {shiftKey:e.shiftKey};
					if (this.editor.updateSelectionByNaviKey(keyCode,keyboardStatus))
					{
						e.stopPropagation();
						dojo.stopEvent(e);
						this.editor.renderSelection();
					}
				}					
			}

			if (keyEvent.func)
			{
				e.stopPropagation();
				dojo.stopEvent(e);
				if (textUpdate) {
					clearInterval(pe.scene.editor._IMEPendingInputTimer);
					if (this.editor.pendingInput && this.editor.pendingInput.length > 0) {
						this.editor.inputString(this.editor.pendingInput, 'keyDown', true);
						this.editor.pendingInput = null;
						this.editor.compositionendEventinputString = '';
					}
				}
				if(this._updatingSelection)
				{
					this.keyDownEventPool.push(keyEvent);
				}
				else
					keyEvent.func(this,keyEvent.data);

				if (textUpdate)
				{
					clearTimeout(this._checkKeyDownUpdateTimer);
					this._hasUpdate = true;
					this._checkKeyDownUpdateTimer = setTimeout(dojo.hitch(this, function()
					{
						this.focus();
						this.notifyUpdate();
						this._hasUpdate = false;
					}), 300);
				}
				else
				{
					// operation key events, like ctrl+a to select all, 
					// at this moment, send text update event out.
					if (this._hasUpdate)
					{
						this.notifyUpdate({sync:true});
					}
					
					var msgPub = pe.scene.msgPublisher;
					msgPub.sendPending();
				}
			}
			return !(keyEvent.func == null);
		}
	},

	cellNavigate: function(key, shift)
	{
		var range = this.editor.mSelection.getRange();

		var touchENode = range.endContainer;
		var touchSNode = range.startContainer;
		var startOffset = range.startOffset;
		var endOffset = range.endOffset;

		var fromCell = EditorUtil.getAscendant(touchSNode, 'th') || EditorUtil.getAscendant(touchSNode, 'td');
		if (fromCell == null)
			return;
		var toCell;

		if (key == 9)
		{
			if (!shift)
			{
				toCell = fromCell.nextSibling;
				if (!toCell)
				{
					var nextRow = fromCell.parentNode.nextSibling;
					if (nextRow)
					{
						toCell = nextRow.firstChild;
					}
				}
			}
			else
			{
				toCell = fromCell.previousSibling;
				if (!toCell)
				{
					var nextRow = fromCell.parentNode.previousSibling;
					if (nextRow)
					{
						toCell = nextRow.lastChild;
					}
				}
			}
			if (!toCell && !shift && !this.element.table.hasMerge())
			{
				// to create row below
				this.editor.updateSelection();
				this.editor.renderSelection();
				var slideEditor = this.getParent();
				slideEditor.execTable(pres.constants.CMD_TABLE_INSERT_ROW_BELOW);
				var box = slideEditor.getBoxByElementId(this.element.id);
				if (box)
					toCell = dojo.query("tr:last-child", box.domNode)[0].firstElementChild;
			}
			if (toCell)
			{
				var lastSpan = pres.utils.tableUtil.getFristOrLastSpanFromNode(toCell, true);
				if (lastSpan)
				{
					range.moveToPosition(lastSpan, EditorUtil.POSITION_BEFORE_END);
					range.select();
				}
			}
			return true;

		}
		else if (shift)
			return false;
		else if (key === 39)
		{   // arrow right
			var rBoundary = pres.utils.tableUtil.checkBoundaryOfTD(touchENode, endOffset, true); // check current position is the end of current td
			if (rBoundary)
			{
				if (fromCell)
				{
					toCell = fromCell.nextSibling;
					if (!toCell)
					{
						var nextRow = fromCell.parentNode.nextSibling;
						if (nextRow)
						{
							toCell = nextRow.firstChild;
						}
					}
					if (toCell)
					{
						var firstSpan = pres.utils.tableUtil.getFristOrLastSpanFromNode(toCell);
						if (firstSpan)
						{
							range.moveToPosition(firstSpan, EditorUtil.POSITION_AFTER_START);
							range.select();
						}
					}
				}
				return true;
			}
		}
		else if (key === 37)
		{ // arrow left
			var lBoundary = pres.utils.tableUtil.checkBoundaryOfTD(touchSNode, startOffset);
			if (lBoundary)
			{
				if (fromCell)
				{
					toCell = fromCell.previousSibling;
					if (!toCell)
					{
						var nextRow = fromCell.parentNode.previousSibling;
						if (nextRow)
						{
							toCell = nextRow.lastChild;
						}
					}
					if (toCell)
					{
						var lastSpan = pres.utils.tableUtil.getFristOrLastSpanFromNode(toCell, true);
						if (lastSpan)
						{
							range.moveToPosition(lastSpan, EditorUtil.POSITION_BEFORE_END);
							range.select();
						}
					}
				}

				return true;
			}
		}
		else if (key === 38)
		{ // arrow up
			var scEle = touchSNode;

			if (scEle.nodeType == 3)
				scEle = scEle.parentNode;

			var firstSpan = pres.utils.tableUtil.getFristOrLastPLIFromNode(fromCell);
			var isFirstSpan = scEle == firstSpan || dojo.isDescendant(scEle, firstSpan);

			if (isFirstSpan)
			{
				var fromCellIndex = EditorUtil.getIndex(fromCell);
				var prevRow = fromCell.parentNode.previousSibling;
				var toCell = prevRow && prevRow.children[fromCellIndex];

				if (toCell)
				{
					var lastSpan = pres.utils.tableUtil.getFristOrLastSpanFromNode(toCell, true);
					if (lastSpan)
					{
						range.moveToPosition(lastSpan, EditorUtil.POSITION_BEFORE_END);
						range.select();
					}
				}
				return true;
			}

		}
		else if (key === 40)
		{ // arrow down

			var scEle = touchSNode;
			if (scEle.nodeType == 3)
				scEle = scEle.parentNode;

			var lastSpan = pres.utils.tableUtil.getFristOrLastPLIFromNode(fromCell, true);
			var isLastSpan = scEle == lastSpan || dojo.isDescendant(scEle, lastSpan);

			if (isLastSpan)
			{
				var fromCellIndex = EditorUtil.getIndex(fromCell);
				var nextRow = fromCell.parentNode.nextSibling;
				var toCell = nextRow && nextRow.children[fromCellIndex];

				if (toCell)
				{
					var firstSpan = pres.utils.tableUtil.getFristOrLastSpanFromNode(toCell);
					if (firstSpan)
					{
						range.moveToPosition(firstSpan, EditorUtil.POSITION_AFTER_START);
						range.select();
					}
				}

				return true;
			}
		}
	}
});