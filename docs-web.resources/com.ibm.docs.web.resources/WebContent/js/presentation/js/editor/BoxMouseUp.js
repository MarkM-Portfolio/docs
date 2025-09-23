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

dojo.provide("pres.editor.BoxMouseUp");
dojo.require("pres.utils.tableResizeUtil");

dojo.declare("pres.editor.BoxMouseUp", null, {

	popupContextMenu: function(e)
	{
		this._pendingContextMenu = false;
		var slideEditor = this.getParent();
		slideEditor.popupContextMenu(e, true);
	},

	onMouseUp: function(e)
	{
		//not allow user do select object & input text action while in partial load.
		if(!pe.scene.isLoadFinished()) {
			e.stopPropagation();
			dojo.stopEvent(e);
			return;
		}
		//for touch zoom
		if((e.touches && e.touches.length != 0)||pe.scene.slideEditor._touchZoom) {
			this._mouseMoved = false;
			this._mouseDown = false;
			setTimeout(function(){
				pe.scene.slideEditor._touchZoom = false;
			}, 500);
			return;
		}
		//for touch move, select box after touch up
		if (e.touches && e.touches.length == 0 && !pe.scene.slideEditor._touchMove) {
			this._ImplMouseClick(e);
		}
		setTimeout(function(){
			pe.scene.slideEditor._touchZoom = false;
			pe.scene.slideEditor._touchMove = false;
		}, 500);
		if (this.element.family == "table" && e.shiftKey)
		{
			this._pendingRenderTableSelection = true;
			if(dojo.isMac && dojo.isSafari)
				this._pendingShiftRenderTableSelection = true;
		}
		dojo.query('a', this.domNode).forEach(function(_node)
		{
			var hyperLink = EditorUtil.getAttribute(_node,"xhref");
			if(hyperLink)
			{
				EditorUtil.removeAttribute(_node,"xhref");
				EditorUtil.setAttribute(_node,"href",hyperLink);
			}
		});
		
		var mouseMoved = this._mouseMoved;
		
		dojo.disconnect(this._bodyMouseUp);
		this._mouseDown = false;
		this._mouseMoved = false;
		
		var upEventTrigger = false;
		if (this.mouseUpEventTicket)
		{
			upEventTrigger = true;
			this.mouseUpEventTicket = false;
		}

		if (!(pe.scene.isHTMLViewMode() || pe.scene.isMobile))
			pe.scene.hub.focusMgr.checkFocusOutOnMouseUp();
		
		if (pe.scene.locker.isLockedByOther(this.element.id))
			return;

		var rightMouse = e.type == "mouseup" && e.which == 3;
		dojo.disconnect(this.waitingFocusEvent);

		var tblUtil = pres.utils.tableResizeUtil;
		if (tblUtil.resizeStart)
			return;
		if (dojo.hasClass(e.target, 'imgcomment'))
			return;

		if (this.mouseDownTime && ((new Date() - this.mouseDownTime < 250) || !mouseMoved))
		{
			var target = e.target;
			var clickOnText = target && target.tagName.toLowerCase() == "span";
			var clickOnPlaceHolder = this.element.family != "graphic" && dojo.hasClass(this.domNode.firstElementChild, "layoutClassSS");
			if (this._mouseClickTimes > 1 || clickOnText || clickOnPlaceHolder)
			{
				this.clickOnContent(e, clickOnText && this._mouseClickTimes == 1);
			}
		}

		if (this.status != this.STATUS_EDITING)
		{
			if (rightMouse)
				this.popupContextMenu(e);
			return;
		}

		if (upEventTrigger)
		{
			clearTimeout(this._checkMouseupUpdateTimer);
			this._checkMouseupUpdateTimer = setTimeout(dojo.hitch(this, function()
			{
				if (rightMouse)
				{
					if (this.element.family == "table")
					{
						var cells = this.editor.getSelectedTableCells();
						var hasCell = cells && cells.length > 1;
						if (!hasCell)
						{
							this.editor.updateSelection();
						}
					}
					else
					{
						this.editor.updateSelection();
					}
					this.editor.renderSelection();
				}
				else
				{
					if(this._pendingShiftRenderTableSelection){
						var ccells=this.editor.mSelection.getSelectedTableCells();
						this.editor.updateSelection(null,ccells);
						this._pendingShiftRenderTableSelection = false;
					} else 
						this.editor.updateSelection();
					if (this._mouseClickTimes == 1 || !this._mouseClickTimes)
						if(!this.editor.renderTableSelection())
							this.editor.renderSelection();
					else
						this.editor.renderSelection();
					var formatpainterStyles = pe.scene.hub.formatpainterStyles;
					if (formatpainterStyles) {
						this.copyFormattingToEditor(this.editor, formatpainterStyles);
					}
				}
				if (rightMouse)
					this.toShowPopup(e);
			}), 10);
			
			clearTimeout(this._hpTimer);
			this._hpTimer = setTimeout(dojo.hitch(this, function()
			{
			
				if (!rightMouse && this.status == this.STATUS_EDITING 
						&& this._mouseClickTimes == 1
						&& ((new Date() - this.mouseDownTime )> 500)
					)
				{
					if (this.editor.getCurHyperLink(true))
					{
						var slideEditor = this.getParent();
						slideEditor.createLink(true);
					}
				}
			}), 100);
			
		}
		else if (rightMouse)
		{
			if (this.editor)
			{
				if (this.element.family == "table")
				{
					var cells = this.editor.getSelectedTableCells();
					var hasCell = cells && cells.length > 1;
					if (!hasCell)
					{
						this.editor.updateSelection();
					}
				}
				else
				{
					this.editor.updateSelection();
				}
			}
			this.toShowPopup(e);
		}
	},

	applyTextStyles: function(target, formatpainterStyles, nodesNode)
	{
		target.setTextStyle("bold", formatpainterStyles.bold);
		target.setTextStyle("italic", formatpainterStyles.italic);
		target.setTextStyle("underline", formatpainterStyles.underline);
		target.setTextStyle("strikethrough", formatpainterStyles.strikeThrough);
		if (!nodesNode) {
			target.setTextStyle("font_name", formatpainterStyles.fontFamily);
			target.setTextStyle("font_size", formatpainterStyles.fontSize);
			target.setTextStyle("font_color", formatpainterStyles.fontColor);
			if (formatpainterStyles.superSubScript == 'sub') {
				target.setTextStyle("subscript", true);
			} else if (formatpainterStyles.superSubScript == 'super') {
				target.setTextStyle("superscript", true);
			} else {
				target.setTextStyle("superscript", false);
			}
		}
	},
	applyParagraphStyles: function(para, formatpainterStyles, isNumber, isPlaceholder)
	{
		// follow are paragraph styles: list related: number,bullet,level
		para.level = formatpainterStyles.level;
		para.textAligment = formatpainterStyles.textAligment;
		var listType = formatpainterStyles.listClass[0];
		if (formatpainterStyles.list == "bullet" && !isPlaceholder) {
			listType = listType?listType:"lst-c";
		}
		para.setCustomList(listType, isNumber, isPlaceholder);
		if (isNumber) {
			para.listType = formatpainterStyles.numbertype;
		}
		if (!isPlaceholder) {
			para.indent = formatpainterStyles.abs_indent;
			para.marginLeft = formatpainterStyles.abs_tabs_marginLeft;
		}
		para.renderDirty = true;
	},
	applyParagraphStylesInCell: function(tcell, startLineIndex, endLineIndex, formatpainterStyles, isNumber, isPlaceholder)
	{
		for (var i=startLineIndex;i<=endLineIndex;i++) {
			var para = tcell.paragraphs[i];
			this.applyParagraphStyles(para, formatpainterStyles, isNumber, isPlaceholder);
		}
	},
	
	copyFormattingToParagraph: function(para, formatpainterStyles, nodesNode, isNumber, isPlaceholder)
	{
		// apply style to whole paragraph							
		para.setTextStyleForAll("bold", formatpainterStyles.bold);
		para.setTextStyleForAll("italic", formatpainterStyles.italic);
		para.setTextStyleForAll("underline", formatpainterStyles.underline);
		para.setTextStyleForAll("strikethrough", formatpainterStyles.strikeThrough);
		if (!nodesNode) {
			para.setTextStyleForAll("font_name", formatpainterStyles.fontFamily);
			para.setTextStyleForAll("font_size", formatpainterStyles.fontSize);
			para.setTextStyleForAll("font_color", formatpainterStyles.fontColor);
			if (formatpainterStyles.superSubScript == 'sub') {
				para.setTextStyleForAll("subscript", true);
			} else if (formatpainterStyles.superSubScript == 'super') {
				para.setTextStyleForAll("superscript", true);
			} else {
				para.setTextStyleForAll("superscript", false);
			}
			// follow are paragraph styles: list related: number,bullet,level
			this.applyParagraphStyles(para, formatpainterStyles, isNumber, isPlaceholder);
		}
		para.renderDirty = true;
	},
	
	copyFormattingToCell: function(editor, formatpainterStyles)
	{
		var nodesNode = editor.boxOwner.getNotesNode();
		var mConetenModel = editor.mContentModel;
		var tcell = mConetenModel.mTxtCells[0];
		var startLineIndex = mConetenModel.mSelection.start.lineIndex;
		var isNumber = formatpainterStyles.list=="bullet"?false:true;
		var isPlaceholder = tcell.txtBoxInfo.isPlaceholder && tcell.txtBoxInfo.placeholderType == 'outline';		 
		var range = editor.mSelection.getRange();
		if (range.collapsed) {
			var para = tcell.paragraphs[startLineIndex];
			this.copyFormattingToParagraph(para, formatpainterStyles, nodesNode, isNumber, isPlaceholder);
		} else {
			this.applyTextStyles(tcell, formatpainterStyles, nodesNode);
			if (!nodesNode) {
				var endLineIndex = mConetenModel.mSelection.end.lineIndex;
				if (startLineIndex != endLineIndex) {
					this.applyParagraphStylesInCell(tcell, startLineIndex, endLineIndex, formatpainterStyles, isNumber, isPlaceholder);
				}
			}
		}
		tcell.renderDirty = true;
	},
	copyFormattingToTable: function(editor, formatpainterStyles)
	{
		var mConetenModel = editor.mContentModel;
		var mSelectTxtCells = mConetenModel.mSelectTxtCells;
		var isNumber = formatpainterStyles.list=="bullet"?false:true;
		var range = editor.mSelection.getRange();
		if (mSelectTxtCells.length ==1) {
			var tcell = mSelectTxtCells[0];
			if (range.collapsed) {
				var startLineIndex = tcell.selection.start.lineIndex;
				var para = tcell.paragraphs[startLineIndex];
				this.copyFormattingToParagraph(para, formatpainterStyles, false, isNumber, false);
			} else {
				this.applyTextStyles(tcell, formatpainterStyles, false);
				var startLineIndex = tcell.selection.start.lineIndex;
				var endLineIndex = tcell.selection.end.lineIndex;
				if (startLineIndex != endLineIndex) {
					this.applyParagraphStylesInCell(tcell, startLineIndex, endLineIndex, formatpainterStyles, isNumber, false);
				}
			}
			tcell.renderDirty = true;
		} else {
			var boxUp = this;
			dojo.forEach(mSelectTxtCells, function(tcell)
			{
				tcell.renderDirty = true;
				dojo.forEach(tcell.paragraphs, function(para)
				{
					boxUp.copyFormattingToParagraph(para, formatpainterStyles, false, isNumber, false);
				});
			});
		}
	},
	copyFormattingToEditor: function(editor, formatpainterStyles)
	{
		var nodesNode = editor.boxOwner.getNotesNode();
		var mConetenModel = editor.mContentModel;
		var mSelectTxtCells = mConetenModel.mSelectTxtCells;
		var cell = null;
		var startLineIndex = 0;
		var endLineIndex = 0;
		if (mSelectTxtCells.length == 0) {
			// textbox,shape
			this.copyFormattingToCell(editor, formatpainterStyles);
		} else {
			// table
			this.copyFormattingToTable(editor, formatpainterStyles);
		}
		if (!formatpainterStyles.onDblClick) {
			pe.scene.slideEditor.cleanFormatPainter();
		}
		editor.updateView();
		editor.boxOwner.notifyUpdate();
	},

	toShowPopup: function(e)
	{
		if (this.waitingFocus)
		{
			this._pendingContextMenuEvent = e;
			this._pendingContextMenu = true;
		}
		else
		{
			this.popupContextMenu(e);
		}
	}

});