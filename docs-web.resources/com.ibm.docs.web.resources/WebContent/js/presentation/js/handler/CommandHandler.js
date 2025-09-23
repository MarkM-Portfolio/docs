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

dojo.provide("pres.handler.CommandHandler");
dojo.require("pres.msg.UndoManager");
dojo.require("pres.constants");
dojo.require("concord.widgets.presContentBoxPropDlg");
dojo.require("pres.handler.ImagePropertyHandler");
dojo.require("pres.handler.BasicOptHandler");
dojo.require("pres.clipboard.PasteHandler");
dojo.require("pres.clipboard.CopyHandler");
dojo.require("pres.clipboard.CutHandler");
dojo.require("concord.util.BidiUtils");
dojo.requireLocalization("concord.widgets", "toolbar");
dojo.requireLocalization("pres", "pres");

dojo.declare("pres.handler.CommandHandler", [pres.handler.BasicOptHandler], {

	activeCommand: null,
	activeCommandValue: null,
	valueforLinespace : null,
	
	constructor: function()
	{
		var d = dojo;

		d.subscribe("/command/exec", dojo.hitch(this, this.execCommand));
		d.subscribe("/sorter/selection/changed", dojo.hitch(this, this.checkSlideCommands));
		d.subscribe("/sorter/order/changed", dojo.hitch(this, this.checkSlideCommands));
		d.subscribe("/box/enter/selection", dojo.hitch(this, this.checkBoxCommands));
		d.subscribe("/box/exit/selection", dojo.hitch(this, this.checkBoxCommands));
		d.subscribe("/box/enter/edit", dojo.hitch(this, this.checkEditCommands));
		d.subscribe("/box/exit/edit", dojo.hitch(this, this.checkEditCommands));
		d.subscribe("/slideshow/on", dojo.hitch(this, this.checkSlideShowCommands));
		d.subscribe("/slideshow/off", dojo.hitch(this, this.checkSlideShowCommands));
		d.subscribe("/drag/create/mode", dojo.hitch(this, this.checkDragCommand));
		d.subscribe("/content/selection/changed", dojo.hitch(this, this.checkEditCommands));
		d.subscribe("/box/content/updated", dojo.hitch(this, this.checkEditCommands));

		d.subscribe("/data/loaded", dojo.hitch(this, this.init));

		this.pasteHandler = new pres.clipboard.PasteHandler();
		this.copyHandler = new pres.clipboard.CopyHandler();
		this.cutHandler = new pres.clipboard.CutHandler();
	},

	init: function()
	{
		var c = pres.constants;
		var undoManager = pe.scene.undoManager;
		var commandsModel = pe.scene.hub.commandsModel;
		commandsModel.setEnabled(c.CMD_UNDO, undoManager.hasUndo());
		commandsModel.setEnabled(c.CMD_REDO, undoManager.hasRedo());

		dojo.connect(undoManager, "onChange", this, function()
		{
			commandsModel.setEnabled(c.CMD_UNDO, undoManager.hasUndo());
			commandsModel.setEnabled(c.CMD_REDO, undoManager.hasRedo());
		});
		
		dojo.subscribe("/scene/coedit/started", this, this.onCoeditStarted);
		dojo.subscribe("/scene/coedit/stopped", this, this.onCoeditStopped);

		this._checkEditCommands();
		this._checkBoxCommands();
	},
	
	onCoeditStarted: function()
	{
		var commandsModel = pe.scene.hub.commandsModel;
		commandsModel.setEnabled(pres.constants.CMD_DISCARDDRAFT, false);	
	},
	
	onCoeditStopped: function()
	{
		var commandsModel = pe.scene.hub.commandsModel;
		commandsModel.setEnabled(pres.constants.CMD_DISCARDDRAFT, true);	
	},
	
	exitActiveCommand: function()
	{
		if (this.activeCommand)
		{
			this.execCommand(this.activeCommand, false);
		}
		this.activeCommandValue = null;
	},

	checkDragCommand: function(on, shapeCreateType)
	{
		var c = pres.constants;
		var commandsModel = pe.scene.hub.commandsModel;
		if (!shapeCreateType)
			commandsModel.setChecked(c.CMD_TEXTBOX_DRAG_CREATE, on);
		if (!on && (this.activeCommand == c.CMD_TEXTBOX_DRAG_CREATE || this.activeCommand == c.CMD_SHAPE_DRAG_CREATE))
			this.exitActiveCommand();
	},

	checkSlideShowCommands: function(onOff, slideShowSlideIndex)
	{
		var c = pres.constants;
		var commandsModel = pe.scene.hub.commandsModel;
		var isSlideShowing = pe.scene.slideShowInProgress();
		commandsModel.setEnabled(c.CMD_SLIDE_SHOW, !isSlideShowing);
		commandsModel.setEnabled(c.CMD_SLIDE_SHOW_FROM_CURRENT, !isSlideShowing);
		commandsModel.setEnabled(c.CMD_SLIDE_SHOW_WITH_COVIEW, !isSlideShowing);
		
		if (!isSlideShowing)
		{
			var length = pe.scene.doc.slides.length;
			if (slideShowSlideIndex >= length)
				slideShowSlideIndex = length - 1;
			if (slideShowSlideIndex <= 0)
				slideShowSlideIndex = 0;
			
			pe.scene.slideSorter.selectItems(slideShowSlideIndex, slideShowSlideIndex, slideShowSlideIndex);
		}
		
	},

	checkTableCommands: function()
	{
		clearTimeout(this._checkTableCommandsTimer);
		this._checkTableCommandsTimer = setTimeout(dojo.hitch(this, function()
		{
			this._checkTableCommands();
		}), 100);
	},

	_checkTableCommands: function()
	{
		var slideEditor = pe.scene.slideEditor;
		var commandsModel = pe.scene.hub.commandsModel;
		var c = pres.constants;
		var editingBox = slideEditor.getEditingBox();

		var tableCommands = [c.CMD_TABLE_UPDATE_TEMPLATE];
		var tableRowCommands = [c.CMD_TABLE_ROW, c.CMD_TABLE_INSERT_ROW_BELOW, c.CMD_TABLE_INSERT_ROW_ABOVE, c.CMD_TABLE_MOVE_ROW_UP, c.CMD_TABLE_MOVE_ROW_DOWN, c.CMD_TABLE_DELETE_ROW, c.CMD_TABLE_SET_ROW_HEADER, c.CMD_TABLE_REMOVE_ROW_HEADER];
		var tableColumnCommands = [c.CMD_TABLE_COLUMN, c.CMD_TABLE_INSERT_COLUMN_BEFORE, c.CMD_TABLE_INSERT_COLUMN_AFTER, c.CMD_TABLE_MOVE_COLUMN_LEFT, c.CMD_TABLE_MOVE_COLUMN_RIGHT, c.CMD_TABLE_DELETE_COLUMN, c.CMD_TABLE_SET_COLUMN_HEADER, c.CMD_TABLE_REMOVE_COLUMN_HEADER];
		var tableCellCommands = [c.CMD_TABLE_CELL, c.CMD_TABLE_CLEAR_CELL, c.CMD_TABLE_COLOR_CELL, c.CMD_TABLE_CELL_PROPERTIES];

		if (!editingBox)
		{
			commandsModel.setEnabled(tableCommands, false);
			commandsModel.setEnabled(tableRowCommands, false);
			commandsModel.setEnabled(tableColumnCommands, false);
			commandsModel.setEnabled(tableCellCommands, false);
			var boxes = slideEditor.getSelectedBoxes();
			if (boxes.length == 1 && boxes[0].element.family == "table")
			{
				var tableModel = boxes[0].element.table;
				var hasMerge = tableModel.hasMerge();
				if (!hasMerge)
					commandsModel.setEnabled(tableCommands, true);
			}
		}
		else if (editingBox && editingBox.element.family == "table")
		{
			var tableModel = editingBox.element.table;
			var cells = editingBox.editor.getSelectedTableCells();
			var hasMerge = tableModel.hasMerge();
			var hasCell = cells && cells.length > 0;

			if (hasMerge || !hasCell)
			{
				commandsModel.setEnabled(tableCommands, !hasMerge);
				commandsModel.setEnabled(tableRowCommands, false);
				commandsModel.setEnabled(tableColumnCommands, false);
				commandsModel.setEnabled(tableCellCommands, false);
			}
			else
			{
				commandsModel.setEnabled(tableCommands, true);
			}

			if (!hasCell)
				commandsModel.setEnabled(tableCellCommands, false);
			else
				commandsModel.setEnabled(tableCellCommands, true);

			if (!hasMerge)
			{
				commandsModel.setEnabled(tableRowCommands, hasCell);
				commandsModel.setEnabled(tableColumnCommands, hasCell);

				var hasFirstRow = dojo.some(cells, function(c)
				{
					return c.parent.getIndex() == 0;
				});
				var hasLastRow = dojo.some(cells, function(c)
				{
					return c.parent.getIndex() == c.parent.parent.rows.length - 1;
				});
				var hasFirstColumn = dojo.some(cells, function(c)
				{
					return c.getIndex() == 0;
				});
				var hasLastColumn = dojo.some(cells, function(c)
				{
					return c.getIndex() == c.parent.cells.length - 1;
				});

				var colIndexs = [];
				var rows = [];
				var lowRowIndex = -1;
				var lowColIndex = -1;
				dojo.forEach(cells, function(c)
				{
					var row = c.parent;
					if (dojo.indexOf(rows, row) == -1)
						rows.push(row);
					var rowIndex = row.getIndex();
					if (lowRowIndex == -1)
						lowRowIndex = rowIndex;
					else
						lowRowIndex = Math.min(lowRowIndex, rowIndex);
					var index = c.getIndex();
					if (dojo.indexOf(colIndexs, index) == -1)
						colIndexs.push(index);
					if (lowColIndex == -1)
						lowColIndex = index;
					else
						lowColIndex = Math.min(lowColIndex, index);
				});

				var firstRowHeader = tableModel.rows[0].isHeaderRow();
				var hasMultipleRows = rows.length > 1;
				var hasAllRows = rows.length == tableModel.rows.length;
				var hasMultipleCols = colIndexs.length > 1;
				var hasAllCols = colIndexs.length == tableModel.colWidths.length;

				if (hasFirstRow && firstRowHeader)
					commandsModel.setEnabled(c.CMD_TABLE_INSERT_ROW_ABOVE, false);
				else
					commandsModel.setEnabled(c.CMD_TABLE_INSERT_ROW_ABOVE, true);

				if (!hasFirstRow && ((!firstRowHeader) || lowRowIndex - 1 > 0))
					commandsModel.setEnabled(c.CMD_TABLE_MOVE_ROW_UP, true);
				else
					commandsModel.setEnabled(c.CMD_TABLE_MOVE_ROW_UP, false);

				if (!hasLastRow && ((!firstRowHeader) || lowRowIndex > 0))
					commandsModel.setEnabled(c.CMD_TABLE_MOVE_ROW_DOWN, true);
				else
					commandsModel.setEnabled(c.CMD_TABLE_MOVE_ROW_DOWN, false);

				commandsModel.setEnabled(c.CMD_TABLE_DELETE_ROW, true);
				commandsModel.setEnabled(c.CMD_TABLE_SET_ROW_HEADER, !hasMultipleRows && hasFirstRow && !cells[0].parent.isHeaderRow());
				commandsModel.setEnabled(c.CMD_TABLE_REMOVE_ROW_HEADER, !hasMultipleRows && hasFirstRow && cells[0].parent.isHeaderRow());

				var firstColHeaer = tableModel.rows[0].cells[0].isColHeader();

				if (hasFirstColumn && firstColHeaer)
					commandsModel.setEnabled(c.CMD_TABLE_INSERT_COLUMN_BEFORE, false);
				else
					commandsModel.setEnabled(c.CMD_TABLE_INSERT_COLUMN_BEFORE, true);

				var isRtlTable = (dojo.getStyle(editingBox.domNode, 'direction') == 'rtl');
				if (!hasFirstColumn && ((!firstColHeaer) || lowColIndex - 1 > 0))
					commandsModel.setEnabled(c.CMD_TABLE_MOVE_COLUMN_LEFT, isRtlTable ? false : true);
				else
					commandsModel.setEnabled(c.CMD_TABLE_MOVE_COLUMN_LEFT, isRtlTable ? true : false);

				if (!hasLastColumn && ((!firstColHeaer) || lowColIndex > 0))
					commandsModel.setEnabled(c.CMD_TABLE_MOVE_COLUMN_RIGHT, isRtlTable ? false : true);
				else
					commandsModel.setEnabled(c.CMD_TABLE_MOVE_COLUMN_RIGHT, isRtlTable ? true : false);

				commandsModel.setEnabled(c.CMD_TABLE_DELETE_COLUMN, true);
				commandsModel.setEnabled(c.CMD_TABLE_SET_COLUMN_HEADER, !hasMultipleCols && hasFirstColumn && !cells[0].isColHeader());
				commandsModel.setEnabled(c.CMD_TABLE_REMOVE_COLUMN_HEADER, !hasMultipleCols && hasFirstColumn && cells[0].isColHeader());
			}
		}
	},

	checkEditCommands: function()
	{
		clearTimeout(this._checkEditCommandsTimer);
		this._checkEditCommandsTimer = setTimeout(dojo.hitch(this, function()
		{
			this._checkEditCommands();
		}), 150);
	},

	_checkEditCommands: function()
	{
		var slideEditor = pe.scene.slideEditor;
		var notesEditor = pe.scene.notesEditor;
		var cm = pe.scene.hub.commandsModel;
		var c = pres.constants;
		var editingBox = slideEditor.getEditingBox() || notesEditor.getEditingBox();
		var isEditing = editingBox != null;
		var isNotesEditing = notesEditor.getEditingBox() != null;

		var editingCommands = [c.CMD_LINK_ADD, c.CMD_FONT_NAME, c.CMD_FONT_SIZE, c.CMD_FONT_COLOR, c.CMD_INDENT, c.CMD_OUTDENT, c.CMD_NUMBERING, c.CMD_BULLET, c.CMD_BOLD, c.CMD_ITALIC, c.CMD_UNDERLINE, c.CMD_STRIKETHROUGH, c.CMD_FONT_SIZE, c.CMD_ALIGN_V, c.CMD_ALIGN_H, c.CMD_ALIGN_ALL, c.CMD_ALIGN_LEFT, c.CMD_ALIGN_RIGHT, c.CMD_ALIGN_CENTER, c.CMD_ALIGN_TOP, c.CMD_ALIGN_BOTTOM, c.CMD_ALIGN_MIDDLE, c.CMD_SUPERSCRIPT, c.CMD_SUBSCRIPT, c.CMD_FONT_SIZE_INCREASE, c.CMD_FONT_SIZE_DECREASE, c.CMD_CLEAR_FORMAT, c.CMD_DIRECTION, c.CMD_DIRECTION_LTR,c.CMD_DIRECTION_RTL,c.CMD_LINESPACING, c.CMD_FORMATPAINTER];
		var toolbarStrs = dojo.i18n.getLocalization("concord.widgets", "toolbar");

		cm.setEnabled(editingCommands, isEditing);
		// if already click formatPainter button styles not null, then always enable this button when no box in editing
		if (pe.scene.hub.formatpainterStyles) {
			cm.setEnabled(c.CMD_FORMATPAINTER, true);
		}
		var editingCommands2 = [c.CMD_LINK_ADD, c.CMD_FONT_NAME, c.CMD_FONT_SIZE, c.CMD_FONT_COLOR, c.CMD_FONT_SIZE_DECREASE, c.CMD_FONT_SIZE_INCREASE, c.CMD_SUPERSCRIPT, c.CMD_SUBSCRIPT,c.CMD_LINESPACING];
		if (isNotesEditing)
		{
			cm.setEnabled(editingCommands2, false);
		}

		cm.setValue(c.CMD_BOLD, false);
		cm.setValue(c.CMD_ITALIC, false);
		cm.setValue(c.CMD_UNDERLINE, false);
		cm.setValue(c.CMD_STRIKETHROUGH, false);
		cm.setValue(c.CMD_SUPERSCRIPT, false);
		cm.setValue(c.CMD_SUBSCRIPT, false);
		cm.setValue(c.CMD_FONT_NAME, "");
		cm.setValue(c.CMD_FONT_SIZE, "");
		cm.setValue(c.CMD_FONT_COLOR, "");
		cm.setValue(c.CMD_NUMBERING, "");
		cm.setValue(c.CMD_BULLET, "");
		cm.setValue(c.CMD_LINESPACING, "");

		cm.setIconLabel(c.CMD_ALIGN_H, "alignLeftIcon", toolbarStrs.leftAlignTip);
		cm.setIconLabel(c.CMD_ALIGN_V, "alignTopIcon", toolbarStrs.topAlignTip);

		if (isEditing)
		{
			try
			{
				var styles = editingBox.editor._gatherSelectionStyles();
				cm.setValue(c.CMD_BOLD, styles.bold);
				cm.setValue(c.CMD_ITALIC, styles.italic);
				cm.setValue(c.CMD_STRIKETHROUGH, styles.strikeThrough);
				cm.setValue(c.CMD_UNDERLINE, styles.underline);

				cm.setValue(c.CMD_FONT_NAME, styles.fontFamily);
				cm.setValue(c.CMD_FONT_SIZE, styles.fontSize);
				cm.setValue(c.CMD_FONT_COLOR, styles.fontColor);

				cm.setValue(c.CMD_LINESPACING, styles.lineHeight);
				valueforLinespace = styles.lineHeight;
				
				cm.setValue(c.CMD_SUPERSCRIPT, styles.superSubScript == "super");
				cm.setValue(c.CMD_SUBSCRIPT, styles.superSubScript == "sub");

				cm.setValue(c.CMD_ALIGN_LEFT, styles.horizontalAlign == "left");
				cm.setValue(c.CMD_ALIGN_RIGHT, styles.horizontalAlign == "right");
				cm.setValue(c.CMD_ALIGN_CENTER, styles.horizontalAlign == "center");

				cm.setValue(c.CMD_DIRECTION_LTR, styles.textDirection == "ltr");
				cm.setValue(c.CMD_DIRECTION_RTL, styles.textDirection == "rtl");

				cm.setValue(c.CMD_ALIGN_TOP, styles.verticalAlign == "top");
				cm.setValue(c.CMD_ALIGN_MIDDLE, styles.verticalAlign == "middle");
				cm.setValue(c.CMD_ALIGN_BOTTOM, styles.verticalAlign == "bottom");

				cm.setEnabled([c.CMD_INDENT], styles.indent);
				cm.setEnabled([c.CMD_OUTDENT], styles.outdent);

				if (styles.listClass && styles.listClass.length == 0)
					styles.listClass = ["unknown"];
				
				if (styles.list == "numbering")
					cm.setValue(c.CMD_NUMBERING, styles.listClass);
				else 
					cm.setValue(c.CMD_NUMBERING, ["none"]);
			
				if (styles.list == "bullet")
					cm.setValue(c.CMD_BULLET, styles.listClass);
				else 
					cm.setValue(c.CMD_BULLET, ["none"]);

				if (styles.horizontalAlign)
				{
					if (styles.horizontalAlign == "left")
						cm.setIconLabel(c.CMD_ALIGN_H, "alignLeftIcon", toolbarStrs.leftAlignTip);
					else if (styles.horizontalAlign == "center")
						cm.setIconLabel(c.CMD_ALIGN_H, "alignCenterIcon", toolbarStrs.centerTip);
					else if (styles.horizontalAlign == "right")
						cm.setIconLabel(c.CMD_ALIGN_H, "alignRightIcon", toolbarStrs.rightAlignTip);
				}

				if (styles.verticalAlign)
				{
					if (styles.verticalAlign == "top")
						cm.setIconLabel(c.CMD_ALIGN_V, "alignTopIcon", toolbarStrs.topAlignTip);
					else if (styles.verticalAlign == "middle")
						cm.setIconLabel(c.CMD_ALIGN_V, "alignMiddleIcon", toolbarStrs.middleAlignTip);
					else if (styles.verticalAlign == "bottom")
						cm.setIconLabel(c.CMD_ALIGN_V, "alignBottomIcon", toolbarStrs.bottomAlignTip);
				}

				if (BidiUtils.isBidiOn() && styles.textDirection)
				{
					var isRtlPara = dijit.byId('toolbar_direction').iconClass.indexOf('textDirRtlIcon') != -1;
					if (isRtlPara && styles.textDirection == "ltr") {
						cm.setIconLabel(c.CMD_DIRECTION, "textDirLtrIcon", toolbarStrs.ltrDirectionTip);

						dojo.place(dijit.byId('toolbar_outdent').domNode, dijit.byId('toolbar_indent').domNode, BidiUtils.isGuiRtl() ? "before" : "after");
						cm.setIconLabel(c.CMD_INDENT, "indentIcon", toolbarStrs.indentTip);
						cm.setIconLabel(c.CMD_OUTDENT, "outdentIcon", toolbarStrs.decreaseIndentTip);

						dojo.removeClass(dijit.byId('toolbar_numbering').domNode, 'rtl');
						dojo.removeClass(dijit.byId('toolbar_bullet').domNode, 'rtl');
					} else if (!isRtlPara && styles.textDirection == "rtl") {
						cm.setIconLabel(c.CMD_DIRECTION, "textDirRtlIcon", toolbarStrs.rtlDirectionTip);

						dojo.place(dijit.byId('toolbar_outdent').domNode, dijit.byId('toolbar_indent').domNode, BidiUtils.isGuiRtl() ? "after" : "before");
						cm.setIconLabel(c.CMD_INDENT, "outdentIcon", toolbarStrs.indentTip);
						cm.setIconLabel(c.CMD_OUTDENT, "indentIcon", toolbarStrs.decreaseIndentTip);

						dojo.addClass(dijit.byId('toolbar_numbering').domNode, 'rtl');
						dojo.addClass(dijit.byId('toolbar_bullet').domNode, 'rtl');
					}
				}
			}
			catch (e)
			{
			}

		}
		//after check opacity and linestyle value into command model, call widget's setValue() in colorPalette.js
		this._checkOpacityCommands();
		this._checkLineStyleCommands();
		this._checkTableCommands();
		this._checkBGBDCommands();
		this._checkRotateCommands();
	},
	_checkRotateCommands: function()
	{
		var c = pres.constants;
		var rotateCommands = [c.CMD_ROTATE, c.CMD_ROTATE_RIGHT, c.CMD_ROTATE_LEFT, c.CMD_FLIP_X, c.CMD_FLIP_Y];
		var slideEditor = pe.scene.slideEditor;
		var commandsModel = pe.scene.hub.commandsModel;
		var selectedBoxes = slideEditor.getSelectedBoxes();
		if(selectedBoxes.length > 0)
		{
			commandsModel.setEnabled(rotateCommands, function()
			{
				for(var i=0, l=selectedBoxes.length; i<l; i++)
					if(!selectedBoxes[i].isEnableRotate())
						return false;
				
				return true;
			}());
		}
		else
		{
			commandsModel.setEnabled(rotateCommands, false);
		}
	},
	_checkBGBDCommands: function()
	{
		if(dojo.isIE && pe.scene.slideEditor.opcityPanelShow)
			return;
		var slideEditor = pe.scene.slideEditor;
		var commandsModel = pe.scene.hub.commandsModel;
		var c = pres.constants;
		var selectedBox = slideEditor.getSelectedBoxes();
		var editingBox = slideEditor.getEditingBox();
		var isEditing = editingBox != null;
		
		commandsModel.setEnabled(c.CMD_BG_COLOR, false);
		commandsModel.setEnabled(c.CMD_BORDER_COLOR, false);
		
		commandsModel.setValue(c.CMD_BG_COLOR, "");
		commandsModel.setValue(c.CMD_BORDER_COLOR, "");
		commandsModel.setValue(c.CMD_TABLE_COLOR_CELL, "");
		
		if (selectedBox.length == 1)
		{
			if (selectedBox[0].element.family == "group")
			{
				// shape
				var e = selectedBox[0].element;
				// ODP & PPT is e.img, no svg tag
				if (e.svg)
				{
					commandsModel.setAttrs(c.CMD_BG_COLOR, {forNoFill: true});
					commandsModel.setAttrs(c.CMD_BORDER_COLOR, {forNoFill: true});
					
					var fill = e.svg.fill;
					var line = e.svg.line;
					if (fill)
					{
						commandsModel.setValue(c.CMD_BG_COLOR, fill.attrs.fill);
						commandsModel.setEnabled(c.CMD_BG_COLOR, true);
					}
					if (line && !(line.attrs.stroke && line.attrs.stroke == 'none'))
					{
						commandsModel.setEnabled(c.CMD_BORDER_COLOR, true);
						commandsModel.setValue(c.CMD_BORDER_COLOR, line.attrs.stroke);
					}
				}

			}
			else
			{
				// text, table, image
				var box = selectedBox[0];
				var color = '';
				if (isEditing)
				{
					var styles = box.editor._gatherSelectionStyles();
					color = styles.backgroundColor;
				}
				if (box.element.family == "text")
				{
					var boxEditNode = box.getEditNode();
					var bgColor = box.getEditNode().style.backgroundColor;
					var bgImg = boxEditNode.style.backgroundImage;
					if (!bgColor)
						color = "transparent";
					else
						color = EditorUtil.convertToHexColor(EditorUtil.getRGBFromRGBA(box.getEditNode().style.backgroundColor));
				}
				else if (box.element.family == "table" && color)
				{
					var color2 = dojo.Color.fromString(dojo.trim(color));
					if (color2 && color2.a === 0)
						color = "";
					else
						color = color2 ? color2.toHex() : "";
					commandsModel.setValue(c.CMD_TABLE_COLOR_CELL, color);
				}
				
				commandsModel.setEnabled(c.CMD_BG_COLOR, box.element.family != "graphic");
				commandsModel.setAttrs(c.CMD_BG_COLOR, {forNoFill: box.element.family != "table"});
				commandsModel.setAttrs(c.CMD_TABLE_COLOR_CELL, {forNoFill: box.element.family != "table"});
				
				commandsModel.setValue(c.CMD_BG_COLOR, color);
			}
		}
	},
	
	_checkOpacityCommands: function()
	{
		if(dojo.isIE && pe.scene.slideEditor.opcityPanelShow)
			return;
		var slideEditor = pe.scene.slideEditor;
		var commandsModel = pe.scene.hub.commandsModel;
		var c = pres.constants;
		var selectedBox = slideEditor.getSelectedBoxes();
		var box = selectedBox[0];
		var transparency ;
		var canBeAdjusted = false;
		var editingBox = slideEditor.getEditingBox();
		var isEditing = editingBox != null;
		
		commandsModel.setEnabled(c.CMD_OBJECT_OPACITY, canBeAdjusted);
		commandsModel.setValue(c.CMD_OBJECT_OPACITY, "");
		commandsModel.setEnabled(c.CMD_TRANSPARENCY_DIALOG_OPEN, false);
		commandsModel.setValue(c.CMD_TRANSPARENCY_DIALOG_OPEN, "");	
		if (selectedBox.length == 1)
		{
			if (selectedBox[0].element.family == "group")
			{
				// shape
				var e = selectedBox[0].element;
				if (e.svg)
				{
					var svgfill = e.svg.fill;
					if (svgfill)
					{
						if (/.*?url.*?/.test(svgfill.attrs.fill))
						{
							//shape gradient fill and pic fill has fill(#url)
							try 
							{
								transparency = 100 * parseFloat(EditorUtil.checkShapeUrlFillOpacity(svgfill));
							}
							catch(e)
							{
								transparency = c.DEFAULT_OPACITY;
							}
							canBeAdjusted = false;
						}
						else
						{
							//shape with solid fill
							transparency = 100 * parseFloat(svgfill.attr('fill-opacity'));
							canBeAdjusted = true;
						}
						if (isNaN(transparency))
							transparency = c.DEFAULT_OPACITY;
					}
				}
				else//pptx image
				{
					e.img && (transparency = parseFloat(e.img.attr("opacity")));
					if (isNaN(transparency))
						transparency = c.DEFAULT_OPACITY;
					else 
						transparency = 100 * transparency;
					canBeAdjusted = true;
					// set image opacity dialog default value
					commandsModel.setEnabled(c.CMD_TRANSPARENCY_DIALOG_OPEN, true);
					commandsModel.setValue(c.CMD_TRANSPARENCY_DIALOG_OPEN, transparency);
				}
			}
			else
			{
				// text, table, image
				if (isEditing)
				{
					var styles = box.editor._gatherSelectionStyles();
					color = styles.backgroundColor;
					transparency = (isNaN(parseFloat(styles.opacity ))?1:(styles.opacity))*100;
				}
				if (box.element.family == "text")
				{
					var boxEditNode = box.getEditNode();
					var styleList =  boxEditNode.style;
					var bgColor = styleList.backgroundColor;
					var bgOp = parseFloat(styleList.opacity);
					if (!bgColor)
					{
						if (!isNaN(bgOp))
						{
							//import textbox fill with pic 
							transparency = 100* bgOp;
							canBeAdjusted = false;
						}
						else if (/MSO_TEXTBOX_GRAPHIC/.test(boxEditNode.className))
						{
							//import textbox fill with transparent solid or gradient
							try
							{	
								var result = EditorUtil.getTransparencyOfTextBox(boxEditNode);
								canBeAdjusted = result[1];
								transparency = result[0];
							}
							catch(e)
							{
								transparency = c.DEFAULT_OPACITY;
								canBeAdjusted = false;
							}
							canBeAdjusted = false;
						}
						else
						{
							// docs textbox with no fill
							transparency = c.DEFAULT_OPACITY;
							canBeAdjusted = true;
						}
					}
					else if (bgColor != 'transparent')
					{
						transparency = 100 * EditorUtil.getOpacityFromColor(bgColor);
						canBeAdjusted = true;
					}
					else
					{
						transparency = c.DEFAULT_OPACITY;
						canBeAdjusted = true;
					}
				}
				else if (box.element.family == "graphic")
				{
					transparency = parseFloat(box.element.attr('opacity'));
					if (isNaN(transparency))
						transparency = c.DEFAULT_OPACITY;
					else
						transparency = 100 * transparency;
					canBeAdjusted = true;
					//set transparency dialog default value 
					commandsModel.setEnabled(c.CMD_TRANSPARENCY_DIALOG_OPEN, true);
					commandsModel.setValue(c.CMD_TRANSPARENCY_DIALOG_OPEN, transparency);
				}
				else if (box.element.family == "table")
				{
					transparency = c.DEFAULT_OPACITY;
					canBeAdjusted = false;
				}
			}
			commandsModel.setValue(c.CMD_OBJECT_OPACITY, transparency);
			commandsModel.getModel(c.CMD_OBJECT_OPACITY).disabled = !canBeAdjusted;
		}
	},
	
	//line decoration(linejoin and linecap) not include in story 50345. preserve codes for future reference.
	_checkLineStyleCommands: function()
	{
		var commandsModel = pe.scene.hub.commandsModel;
		var slideEditor = pe.scene.slideEditor;
		var c = pres.constants;
		var selectedBox = slideEditor.getSelectedBoxes();
		var editingBox = slideEditor.getEditingBox();				
		commandsModel.setEnabled(c.CMD_LINE_WIDTH, false);
		commandsModel.setEnabled(c.CMD_LINE_JOIN, false);
		commandsModel.setEnabled(c.CMD_LINE_CAP, false);
		commandsModel.setEnabled(c.CMD_LINE_DASHTYPE, false);
		commandsModel.setEnabled(c.CMD_ARROW_TYPE, false);
		//default value for line style.
		commandsModel.setValue(c.CMD_LINE_WIDTH, "1");
		commandsModel.setValue(c.CMD_LINE_DASHTYPE, "none");
		commandsModel.setValue(c.CMD_ARROW_TYPE, "head_none-tail_none");
		commandsModel.setValue(c.CMD_LINE_CAP, "flat");
		commandsModel.setValue(c.CMD_LINE_JOIN, "miter");	

		if (selectedBox.length == 1)
		{
			if (selectedBox[0].element.family == "group")
			{
				var e = selectedBox[0].element;
				if (e.svg)
				{
					var line = e.svg.line;
					var fill = e.svg.fill;
					var arrows = e.svg.arrows;
					commandsModel.setEnabled(c.CMD_LINE_DASHTYPE, true);
					commandsModel.setEnabled(c.CMD_LINE_JOIN, true);
					commandsModel.setEnabled(c.CMD_LINE_CAP, true);
					//shape have closed path , will have 'Z' in its path. Disabled customShapeType's line style setting
					if(e.attr("draw_type") != "customShapeType")
					{
						if((/Z/.test(e.svg.path) || e.svg.circle) && e.attr("draw_type") != "customShapeType")
						{
							commandsModel.setEnabled(c.CMD_LINE_WIDTH, true);
						}
						else if(e.attr("draw_type") != "customShapeType")
						{
							commandsModel.setEnabled(c.CMD_LINE_WIDTH, true);
							commandsModel.setEnabled(c.CMD_ARROW_TYPE, true);
						}
					}
					if(line)
					{									
						if(arrows && arrows.length)
						{
							var arrowStr = "";
							if(arrows.length == 1)
							{
								arrowStr = arrows[0].type + "_" + arrows[0].attrs["kind"] + (arrows[0].type == "head"?"-tail":"-head") + "_none";
							}
							else if(arrows.length == 2)
							{
								arrowStr = arrows[0].type + "_" + arrows[0].attrs["kind"] + "-" + arrows[1].type + "_" + arrows[1].attrs["kind"];
							}
							if(!/^head/.test(arrowStr))
							{
								var reverStr = arrowStr.split("-");
								arrowStr = reverStr[1] + "-" + reverStr[0];
							}
						}

						arrowStr && commandsModel.setValue(c.CMD_ARROW_TYPE, arrowStr);
						line.attr("stroke-width") && commandsModel.setValue(c.CMD_LINE_WIDTH, line.attr("stroke-width"));	
						line.attr("stroke-dasharray") && commandsModel.setValue(c.CMD_LINE_DASHTYPE, line.attr("dasharray-name") || line.attr("stroke-dasharray"));	
						line.attr("stroke-linejoin") && commandsModel.setValue(c.CMD_LINE_JOIN, line.attr("stroke-linejoin"));
						line.attr("stroke-linecap") && commandsModel.setValue(c.CMD_LINE_CAP, line.attr("stroke-linecap"));
					}
				}
			}
		}
	},
	
	checkBoxCommands: function()
	{
		clearTimeout(this._checkBoxCommandsTimer);
		this._checkBoxCommandsTimer = setTimeout(dojo.hitch(this, function()
		{
			this._checkBoxCommands();
		}), 0);
	},

	_checkBoxCommands: function()
	{
		var slideEditor = pe.scene.slideEditor;
		var commandsModel = pe.scene.hub.commandsModel;
		var c = pres.constants;
		var selectedBox = slideEditor.getSelectedBoxes();
		var editingBox = pe.scene.editor.getEditingBox();
		commandsModel.setEnabled(c.CMD_SHOW_PROPERTIES, selectedBox.length == 1);
		commandsModel.setEnabled(c.CMD_BRING_FRONT, selectedBox.length == 1 || editingBox);
		commandsModel.setEnabled(c.CMD_SEND_BACK, selectedBox.length == 1 || editingBox);
		commandsModel.setEnabled(c.CMD_ORDER, selectedBox.length == 1 || editingBox);
		commandsModel.setEnabled(c.CMD_TABLE_UPDATE_TEMPLATE, false);
		if ((editingBox && editingBox.element.family == "table") || (selectedBox.length == 1 && selectedBox[0].element.family == "table"))
		{
			var tableModel = editingBox ? editingBox.element.table : selectedBox[0].element.table;
			var hasMerge = tableModel.hasMerge();
			if (!hasMerge)
				commandsModel.setEnabled(c.CMD_TABLE_UPDATE_TEMPLATE, true);
		}
		
		var alignCommands = [c.CMD_BOX_ALIGN_ALL, c.CMD_BOX_ALIGN_LEFT, c.CMD_BOX_ALIGN_CENTER, c.CMD_BOX_ALIGN_RIGHT, c.CMD_BOX_ALIGN_TOP, c.CMD_BOX_ALIGN_MIDDLE, c.CMD_BOX_ALIGN_BOTTOM];
		commandsModel.setEnabled(alignCommands, selectedBox.length > 0);
		var presStrs = dojo.i18n.getLocalization("pres", "pres");
		commandsModel.setLabel(c.CMD_BOX_ALIGN_ALL, selectedBox.length > 1 ? presStrs.align_objects : presStrs.align_slide);
		
		var distributeCommands = [c.CMD_DISTRIBUTE, c.CMD_DISTRIBUTE_V, c.CMD_DISTRIBUTE.H];
		commandsModel.setEnabled(distributeCommands, selectedBox.length > 2);
		// Check Background/Border fill for selected box
		this._checkLineStyleCommands();
		this._checkOpacityCommands();
		this._checkBGBDCommands();
		this._checkRotateCommands();
	},

	checkSlideCommands: function(selectedThumbs)
	{
		clearTimeout(this._checkSlideCommandsTimer);
		this._checkSlideCommandsTimer = setTimeout(dojo.hitch(this, function()
		{
			this._checkSlideCommands();
		}), 0);
	},

	_checkSlideCommands: function()
	{
		var c = pres.constants;
		var commandsModel = pe.scene.hub.commandsModel;
		var sorter = pe.scene.slideSorter;
		var selectedThumbs = sorter.selectedThumbs;
		var thumbs = sorter.getChildren();
		var length = thumbs.length;
		var selectedLength = selectedThumbs.length;
		if (selectedLength == 0)
			selectedLength = 1;

		var index = 0;
		if (selectedLength == 1)
			index = dojo.indexOf(thumbs, selectedThumbs[0]);

		commandsModel.setEnabled(c.CMD_SLIDE_DELETE, selectedLength < length);
		commandsModel.setEnabled(c.CMD_SLIDE_MOVE_UP, selectedLength == 1 && index > 0);
		commandsModel.setEnabled(c.CMD_SLIDE_MOVE_DOWN, selectedLength == 1 && index < length - 1);
	},

	execCommand: function(cmd)
	{
		//not allow user do select object & input text action while in partial load.
		if(!pe.scene.isLoadFinished()) {
			return;
		}
		var c = pres.constants;
		var s = pe.scene;

		var focusMgr = pe.scene.hub.focusMgr;
		var sorter = pe.scene.slideSorter;
		var app = pe.scene.presApp;
		var slideEditor = pe.scene.slideEditor;
		var notesEditor = pe.scene.notesEditor;
		var currentEditor = slideEditor;
		var notesBox = notesEditor.getEditingBox();
		if (notesBox)
			currentEditor = notesEditor;
		var value = arguments[1];
		var currentBoxs = currentEditor.getSelectedBoxes();
		var editingBox = pe.scene.editor.getEditingBox();

		// if formatpainterStyles has values, clean it
		if (cmd == c.CMD_FORMATPAINTER && pe.scene.hub.formatpainterStyles) {
			pe.scene.slideEditor.cleanFormatPainter();
		}
		
		if (cmd != this.activeCommand)
		{
			this.exitActiveCommand();
		}
		else if (value == this.activeCommandValue)
		{
			return;
		}
		if (cmd == c.CMD_ZOOM)
		{
			app.zoom(value);
		}
		else if (cmd == c.CMD_ZOOM_FIT)
		{
			app.zoomFit();
		}
		else if(cmd == c.CMD_OBJECT_OPACITY)
		{
			slideEditor.setOpacity(value);
		}
		else if(cmd == c.CMD_TRANSPARENCY_DIALOG_OPEN)
		{
			var cmModel = pe.scene.hub.commandsModel;
			var opValue = cmModel.getModel(c.CMD_TRANSPARENCY_DIALOG_OPEN).value;
			slideEditor.openTransparencyDialog(opValue);
		}
		else if (cmd == c.CMD_UNDO)
		{
			s.undoManager.undo();
		}
		else if (cmd == c.CMD_REDO)
		{
			s.undoManager.redo();
		}
		else if (cmd == c.CMD_SHOWSORTER)
		{
			s.hub.toggleSorter(value);
		}
		else if (cmd == c.CMD_COPY)
		{
			this.copyHandler.handle(arguments[1]);
		}
		else if (cmd == c.CMD_CUT)
		{
			this.cutHandler.handle(arguments[1]);
		}
		else if (cmd == c.CMD_PASTE)
		{
			this.pasteHandler.handle(arguments[1], arguments[2], arguments[3], arguments[4]);
		}
		else if (cmd == c.CMD_SHARE)
		{
			s.shareWith();
		}
		else if (cmd == c.CMD_NEW_DOCUMENT)
		{
			s.createTextDoc(null, false);
			s.setFocusToDialog();
		}
		else if (cmd == c.CMD_NEW_PRESENTATION)
		{
			s.createPresDoc();
			s.setFocusToDialog();
		}
		else if (cmd == c.CMD_NEW_SPREADSHEET)
		{
			s.createSheetDoc();
		}
		else if (cmd == c.CMD_SAVE)
		{
			s.saveDraft();
		}
		else if (cmd == c.CMD_SAVEVERSION)
		{
			s.saveDraft(null, true);
		}
		else if (cmd == c.CMD_SAVE_AS)
		{
			s.saveAsPresentation();
		}
		else if (cmd == c.CMD_DISCARDDRAFT)
		{
			concord.util.dialogs.showDiscardDlg();
		}
		else if (cmd == c.CMD_VIEWFILEDETAILS)
		{
			s.goBackToFileDetails();
		}
		else if (cmd == c.CMD_SHOWREVISION)
		{
			s.viewRevision();
		}
		else if (cmd == c.CMD_AUTOPUBLISH)
		{ 
			pe.scene.switchAutoPublish(value);
			pe.scene.setFocus();
		}
		else if (cmd == c.CMD_PUBLISH)
		{
			slideEditor.domNode.focus();
			this.publishPres();
		}	
		else if (cmd == c.CMD_SFRDIALOG)
		{
			slideEditor.domNode.focus();
			pe.scene.submitForReview();
		}			
		else if (cmd == c.CMD_PRINT_PDF)
		{
			slideEditor.domNode.focus();
			pe.scene.printPresPDF();
		}
		else if (cmd == c.CMD_PRINT)
		{
			slideEditor.domNode.focus();
			this.printPresHtml();
		}
		else if (cmd == c.CMD_HELP)
		{
			slideEditor.domNode.focus();
			var helpWin = window.open(concord.main.App.PRES_HELP_URL, "helpWindow", "width=800, height=800");
			helpWin.focus();
		}
		else if (cmd == c.CMD_HELP_ABOUT)
		{
			slideEditor.domNode.focus();
			s.aboutConcord();
		}
		else if (cmd == c.CMD_HELP_NEWFEATURES)
		{
			pe.scene.showNewFeatures();
		}
		else if (cmd == c.CMD_HELP_USERTOUR)
		{
			pe.scene.showNewUserTour();
		}
		else if (cmd == c.CMD_TOGGLE_TOOLBAR)
		{
			pe.settings && pe.settings.setToolbar(value ? 1 : 0);
			s.hub.toggleToolbar(value);
			pe.scene.setFocus();
		}
		else if (cmd == c.CMD_TOGGLE_SIDEBAR)
		{
			s.toggleSideBar();
			pe.scene.setFocus();
		}
		else if (cmd == c.CMD_ADD_COMMENT)
		{
			s.toggleCommentsCmd();
		}
		else if (cmd == c.CMD_TOGGLE_SORTER)
		{
			s.hub.toggleSorter(value);
			pe.scene.setFocus();
		}
		else if (cmd == c.CMD_TOGGLE_NOTES)
		{
			s.hub.toggleNotes(value);
			slideEditor.domNode.focus();
		}
		else if (cmd == c.CMD_TOGGLE_COEDIT_COLOR)
		{
			s.toggleCoEditIndicator();
			pe.scene.setFocus();
		}
		else if (cmd == c.CMD_TOGGLE_SHOW_UNSUPPORT_WARNING)
		{
			pe.settings.setShowUnsupportedFeature(value);
			pe.scene.setFocus();
		}
		else if (cmd == c.CMD_SLIDE_SHOW)
		{
			slideEditor.domNode.focus();
			s.launchSlideShow();
		}
		else if (cmd == c.CMD_SLIDE_SHOW_FROM_CURRENT)
		{
			slideEditor.domNode.focus();
			s.launchSlideShow(true);
		}
		else if (cmd == c.CMD_SLIDE_SHOW_WITH_COVIEW)
		{
			slideEditor.domNode.focus();
			s.openSlideShowCoviewSelectUsersDialog();
		}
		else if (cmd == c.CMD_SLIDE_CREATE)
		{
			sorter.createSlide();
		}
		else if (cmd == c.CMD_SLIDE_DUPLICATE)
		{
			sorter.duplicateSlides();
		}
		else if (cmd == c.CMD_SLIDE_DELETE)
		{
			sorter.deleteSlides();
		}
		else if (cmd == c.CMD_SLIDE_MOVE_UP)
		{
			sorter.moveSlidesDir(true);
		}
		else if (cmd == c.CMD_SLIDE_MOVE_DOWN)
		{
			sorter.moveSlidesDir(false);
		}
		else if (cmd == c.CMD_SLIDE_TRANSITION)
		{
			sorter.transitionSlide();
		}
		else if (cmd == c.CMD_SLIDE_LAYOUT)
		{
			sorter.layoutSlide();
		}
		else if (cmd == c.CMD_SPELLCHECK_IGNORE)
		{
			if (editingBox)
				editingBox.ignore();
		}
		else if (cmd == c.CMD_SPELLCHECK_SKIP_ALL)
		{
			if (editingBox)
				editingBox.ignore(true);
		}
		else if (cmd == c.CMD_SPELLCHECK_REPLACE)
		{
			if (editingBox && value)
				editingBox.replaceWithSuggestion(value);
		}
		else if (cmd == c.CMD_SPELLCHECK_REPLACE_ALL)
		{
			if (editingBox && value)
				editingBox.replaceWithSuggestion(value, true);
		}
		else if (cmd == c.CMD_SELECT_ALL)
		{
			if (focusMgr.isFocusInSorter())
				sorter.selectAll();
			else if (currentEditor == slideEditor)
				slideEditor.selectAll();
		}
		else if (cmd == c.CMD_DELETE_BOX)
		{
			if (currentEditor == slideEditor)
				slideEditor.deleteBox();
		}
		else if (cmd == c.CMD_TEXTBOX_DRAG_CREATE || cmd == c.CMD_SHAPE_DRAG_CREATE)
		{
			if (value)
			{
				this.activeCommand = cmd;
				this.activeCommandValue = value;
				slideEditor.domNode.focus();
			}
			else
			{
				this.activeCommand = null;
				this.activeCommandValue = null;
			}
			
			if(value && notesEditor)
				notesEditor.deSelectAll();
			
			slideEditor.toggleDragCreateMode(value);
		}
		else if (cmd == c.CMD_TEXTBOX_CREATE)
		{
			slideEditor.createBox("textbox", value);
		}
		else if (cmd == c.CMD_TABLE_CREATE)
		{
			if(value && notesEditor)
				notesEditor.deSelectAll();
			slideEditor.createBox("table", value);
		}
		else if (cmd == c.CMD_SHAPE_CREATE)
		{
			slideEditor.createBox("shape", value);
		}
		else if (cmd == c.CMD_IMAGE_CREATE_DIALOG)
		{
			slideEditor.openCreateImageDialog(true, slideEditor.createImageBox);
		}
		else if (cmd == c.CMD_LINK_ADD || cmd == c.CMD_LINK_EDIT)
		{
			slideEditor.createLink();
		}
		else if (cmd == c.CMD_LINK_OPEN)
		{
			EditorUtil.openURLLink(value);
		}
		else if (cmd == c.CMD_LINK_REMOVE)
		{
			slideEditor.removeLink();
		}
		else if (cmd == c.CMD_SELECT_ALL_BOX)
		{
			if (currentEditor == slideEditor)
				slideEditor.selectAll();
		}
		else if (cmd == c.CMD_BRING_FRONT)
		{
			if (currentEditor == slideEditor)
				slideEditor.bringToFront();
		}
		else if (cmd == c.CMD_SEND_BACK)
		{
			if (currentEditor == slideEditor)
				slideEditor.sendToBack();
		}
		else if (cmd == c.CMD_ROTATE_RIGHT)
		{
			if (currentEditor == slideEditor)
				slideEditor.rotate(90);
		}
		else if (cmd == c.CMD_ROTATE_LEFT)
		{
			if (currentEditor == slideEditor)
				slideEditor.rotate(-90);
		}
		else if (cmd == c.CMD_FLIP_X)
		{
			if (currentEditor == slideEditor)
				slideEditor.flip(-1, 1);
		}
		else if (cmd == c.CMD_FLIP_Y)
		{
			if (currentEditor == slideEditor)
				slideEditor.flip(1, -1);
		}
		else if (cmd == c.CMD_DISTRIBUTE_H)
		{
			if (currentEditor == slideEditor)
				slideEditor.boxDistribute(false);
		}
		else if (cmd == c.CMD_DISTRIBUTE_V)
		{
			if (currentEditor == slideEditor)
				slideEditor.boxDistribute(true);
		}
		else if (cmd == c.CMD_BOX_ALIGN_LEFT)
		{
			if (currentEditor == slideEditor)
				slideEditor.boxAlign("left");
		}
		else if (cmd == c.CMD_BOX_ALIGN_RIGHT)
		{
			if (currentEditor == slideEditor)
				slideEditor.boxAlign("right");
		}
		else if (cmd == c.CMD_BOX_ALIGN_MIDDLE)
		{
			if (currentEditor == slideEditor)
				slideEditor.boxAlign("middle");
		}
		else if (cmd == c.CMD_BOX_ALIGN_TOP)
		{
			if (currentEditor == slideEditor)
				slideEditor.boxAlign("top");
		}
		else if (cmd == c.CMD_ARROW_TYPE || cmd == c.CMD_LINE_WIDTH || cmd == c.CMD_LINE_DECORATION || cmd == c.CMD_LINE_DASHTYPE )
		{
			slideEditor.setLineStyle(value, cmd);
		}
		else if (cmd == c.CMD_BOX_ALIGN_BOTTOM)
		{
			if (currentEditor == slideEditor)
				slideEditor.boxAlign("bottom");
		}
		else if (cmd == c.CMD_BOX_ALIGN_CENTER)
		{
			if (currentEditor == slideEditor)
				slideEditor.boxAlign("center");
		}
		else if (cmd == c.CMD_SHOW_PROPERTIES)
		{
			if (currentBoxs.length > 1)
				return;
			var currentBox = currentBoxs[0];
			var family = currentBox.element.family;
			if (family == "graphic")
			{
				if (!this._imagePropHdl)
				{
					this._imagePropHdl = new pres.handler.ImagePropertyHandler(currentBox);
				}
				else
					this._imagePropHdl.setSelectedBox(currentBox);
				this._imagePropHdl.showDlg();
			}
		}
		/* table start */
		else if (cmd == c.CMD_TABLE_UPDATE_TEMPLATE)
		{
			slideEditor.execTable(cmd, value);
		}
		/* row start */
		else if (cmd == c.CMD_TABLE_SET_ROW_HEADER || cmd == c.CMD_TABLE_REMOVE_ROW_HEADER)
		{
			slideEditor.execTable(cmd, value);
		}
		else if (cmd == c.CMD_TABLE_DELETE_ROW || cmd == c.CMD_TABLE_MOVE_ROW_UP || cmd == c.CMD_TABLE_MOVE_ROW_DOWN || cmd == c.CMD_TABLE_INSERT_ROW_ABOVE || cmd == c.CMD_TABLE_INSERT_ROW_BELOW)
		{
			slideEditor.execTable(cmd, value);
		}
		/* row end */
		/* column start */
		else if (cmd == c.CMD_TABLE_SET_COLUMN_HEADER || cmd == c.CMD_TABLE_REMOVE_COLUMN_HEADER)
		{
			slideEditor.execTable(cmd, value);
		}
		else if (cmd == c.CMD_TABLE_DELETE_COLUMN || cmd == c.CMD_TABLE_MOVE_COLUMN_LEFT || cmd == c.CMD_TABLE_MOVE_COLUMN_RIGHT || cmd == c.CMD_TABLE_INSERT_COLUMN_BEFORE || cmd == c.CMD_TABLE_INSERT_COLUMN_AFTER)
		{
			slideEditor.execTable(cmd, value);
		}
		/* column end */
		/* cell start */
		else if (cmd == c.CMD_TABLE_CLEAR_CELL || cmd == c.CMD_TABLE_COLOR_CELL)
		{
			slideEditor.execTable(cmd, value);
		}
		/* cell end */
		/* table end */
		else if (cmd == c.CMD_TOGGLE_SPELL_CHECK)
		{
			if (window.spellcheckerManager)
				spellcheckerManager.enableAutoScayt(value);
			pe.settings && pe.settings.setAutoSpellCheck(value);
			
			var box = pe.scene.editor.getEditingBox();
			if (box)
				box.exitEdit();

			if (box && box.element.isNotes)
			{
				pe.scene.notesEditor.domNode.focus();
			}
			else
			{
				pe.scene.slideEditor.domNode.focus();
			}
			
			pe.scene.editor.resetSpellChecker();
			pe.scene.slideEditor.spellCheck();
		}
		else if (cmd == c.CMD_SELECT_DICT)
		{
			if (window.spellcheckerManager)
			{
				
				if (spellcheckerManager.setLanguage(value))
				{
					var box = pe.scene.editor.getEditingBox();
					if (box)
						box.exitEdit();
					
					if (box && box.element.isNotes)
					{
						pe.scene.notesEditor.domNode.focus();
					}
					else
					{
						pe.scene.slideEditor.domNode.focus();
					}
				}
				
				pe.scene.editor.resetSpellChecker();
				pe.scene.slideEditor.spellCheck();
			}
		}
		else if (cmd == c.CMD_PREFERENCES)
		{
			s.showPreferencesDailog();
		}
		else if (cmd == c.CMD_BG_COLOR)
		{
			slideEditor.setBgColor(value);
		}
		else if (cmd == c.CMD_BORDER_COLOR)
		{
			slideEditor.setBorderColor(value);
		}
		else if ((currentBoxs.length == 1) && currentBoxs[0].isEditing())
		{
			var currentBox = currentBoxs[0];

			setTimeout(function()
			{
				currentBox.focus();
				// setTimeout(function(){
				var bSuccess = false;
				if (cmd == c.CMD_NUMBERING)
				{
					bSuccess = currentBox.editor.toggleListStyle(value, 'ol');
				}
				else if (cmd == c.CMD_BULLET)
				{
					bSuccess = currentBox.editor.toggleListStyle(value, 'ul');
				}
				else if (cmd == c.CMD_INDENT)
				{
					bSuccess = currentBox.editor.indentList(true);
				}
				else if (cmd == c.CMD_OUTDENT)
				{
					bSuccess = currentBox.editor.indentList(false);
				}
				else if (cmd == c.CMD_DIRECTION_LTR)
				{
					bSuccess = currentBox.editor.setParagraphDirection('ltr');
				}
				else if (cmd == c.CMD_DIRECTION_RTL)
				{
					bSuccess = currentBox.editor.setParagraphDirection('rtl');
				}
				else if (cmd == c.CMD_ALIGN_LEFT)
				{
					bSuccess = currentBox.editor.setParagraphAlignment('left', true);
				}
				else if (cmd == c.CMD_ALIGN_RIGHT)
				{
					bSuccess = currentBox.editor.setParagraphAlignment('right', true);
				}
				else if (cmd == c.CMD_ALIGN_CENTER)
				{
					bSuccess = currentBox.editor.setParagraphAlignment('center', true);
				}
				else if (cmd == c.CMD_ALIGN_TOP)
				{
					bSuccess = currentBox.editor.setParagraphAlignment('top', false);
				}
				else if (cmd == c.CMD_ALIGN_MIDDLE)
				{
					bSuccess = currentBox.editor.setParagraphAlignment('middle', false);
				}
				else if (cmd == c.CMD_ALIGN_BOTTOM)
				{
					bSuccess = currentBox.editor.setParagraphAlignment('bottom', false);
				}
				else if(cmd == c.CMD_LINESPACING)
				{
					if(value == c.LINESPACE_CUSTOM_OPTION)
					{
						currentEditor.inputSpaceValue(valueforLinespace || "");
					}
					else if(value != null && value != "" && value != undefined && !isNaN(value))
					{
						bSuccess = currentBox.editor.setLineSpacing(value);	
					}
				}
				else if ((cmd == c.CMD_FONT_NAME) || (cmd == c.CMD_FONT_SIZE) || (cmd == c.CMD_BOLD) || (cmd == c.CMD_ITALIC) || (cmd == c.CMD_UNDERLINE) || (cmd == c.CMD_STRIKETHROUGH) || (cmd == c.CMD_FONT_COLOR) || (cmd == c.CMD_FONT_SIZE_INCREASE) || (cmd == c.CMD_FONT_SIZE_DECREASE) || (cmd == c.CMD_SUPERSCRIPT) || (cmd == c.CMD_SUBSCRIPT))
				{
					
					var bCollapsed = false;
					var range = currentBox.editor.getRange();
					if ((range && range.collapsed) || !range)
						bCollapsed = true;

					if (BidiUtils.isArabicLocale() && (cmd == c.CMD_FONT_SIZE))
						value = BidiUtils.convertHindiToArabic(value + "");
					
					bSuccess = currentBox.editor.setTextStyle(cmd, value);
					
					if (bCollapsed && (cmd == c.CMD_FONT_SIZE_INCREASE || cmd == c.CMD_FONT_SIZE_DECREASE))
					{
						var cm = pe.scene.hub.commandsModel;
						var model = cm.getModel(c.CMD_FONT_SIZE);
						var oldValue = model.value;
						var newValue = pres.utils.fontSizeUtil[cmd == c.CMD_FONT_SIZE_INCREASE ? "getNext" : "getPrev"](oldValue);
						model.set("value", newValue);
					}
				} else if (cmd == c.CMD_FORMATPAINTER) {
					// only get first styles from span, paragraph style from first paragraph if length >1, box style from first box if box length >1
					var styles = editingBox.editor._gatherSelectionStyles(true);
					var range = editingBox.editor.mSelection.getRange();
					styles.collapsed = range.collapsed;
					styles.onDblClick = false;
					var hub = pe.scene.hub;
					if (value == "onDblClick") {
						styles.onDblClick = true;
						hub.toolbarModel.setChecked(c.CMD_FORMATPAINTER,true);
					}
					if (value == false) {
						// if the button be un-toggled then clean styles
						pe.scene.slideEditor.cleanFormatPainter();
					} else {
						pe.scene.hub.formatpainterStyles = styles;
						pe.scene.slideEditor.setStyleCursor();
					}
				}

				if (bSuccess)
				{
					currentBox.notifyUpdate();
				}
			}, 50);

		}

	}

});