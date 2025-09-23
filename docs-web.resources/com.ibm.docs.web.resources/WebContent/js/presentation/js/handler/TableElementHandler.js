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

dojo.provide("pres.handler.TableElementHandler");
dojo.require("pres.utils.helper");
dojo.require("pres.utils.htmlHelper");

dojo.declare("pres.handler.TableElementHandler", null, {

	_startRNTable: function(actPair, element)
	{
		var box = pe.scene.slideEditor.getBoxByElementId(element.id);
		if (!box)
			return;

		var selection = null;
		if (box.editor)
			selection = box.editor.getSelectInfo();
		
		var msgPub = pe.scene.msgPublisher;
		var index = element.getIndex();
		actPair.push(msgPub.createDeleteElementAct(element, index));
		return {index : index, selection: selection};
	},

	_endRNTable: function(actPair, element, index, extra)
	{
		// hey, it is a hack, the box's size may changed, we need to use UI to re-calculate the element.
		// we assume the box ui is updated by our internal event system before _endRNTable
		var box = pe.scene.slideEditor.getBoxByElementId(element.id);
		if (!box)
			return;

		var helper = pres.utils.helper;
		var type = null;
		if (extra)
			type = extra.type;
		if (type == "rowResize" || type == "colResize")
			box.unfixBoxHeight();

		var tableNode = dojo.query("table", box.domNode)[0];
		var tbodyNode = dojo.query("tbody", tableNode)[0] || tableNode;
		var tableModel = element.table;
		var colWidths = tableModel.colWidths;

		var rows = tableModel.rows;

		var offset = 3;

		var colWidthChanged = false;
		var rowHeightChanged = false;
		var totalWidthChanged = false;
		
		if (type == "colResize" || type == "insertCol" || type == "deleteCol" || type == "moveCol")
		{
			PresCKUtil.updateRelativeValue(tableNode, [PresConstants.ABS_STYLES.TEXTINDENT, PresConstants.ABS_STYLES.MARGINLEFT]);
			if (box && box.status == 2 && box.editor)
			{
				box.editor.renderModel(null,true);
			}
		}
		
		if (type == "updateTemplateName" || type == "colResize" || type == "setHeaderCol" || type == "removeHeaderCol"
			|| type == "insertCol" || type == "deleteCol" || type == "moveCol")
		{
			var widths = helper.getColWidthsFromDOM(tableNode);
			tableModel.colWidths = dojo.map(widths, function(w)
			{
				return pres.utils.helper.px2cm(w);
			});
			colWidthChanged = true;
			totalWidthChanged = (type != "colResize" && type != "moveCol");
		}

		var heightChanged = false;
		var trs = dojo.query("tr", box.domNode);
		dojo.forEach(trs, function(tr, i)
		{
			var rowModel = element.table.rows[i];
			var h = Math.ceil(tr.offsetHeight);
			var hcm = pres.utils.helper.px2cm(h);

			if (type == "updateContent" || type == "colResize" || type == "insertCol" || type == "deleteCol" || type == "moveCol")
			{
				dojo.forEach(tr.children, function(td, tdIndex)
				{
					var currCell = rowModel.cells[tdIndex];
					var va = td.style.verticalAlign;
					if (va)
					{
						var style = pres.utils.htmlHelper.extractStyle(currCell.attr("style") || "");
						style["vertical-align"] = va;
						var value = pres.utils.htmlHelper.stringStyle(style);
						currCell.attr("style", value);
					}
					currCell.content = td.innerHTML;
				});
			}

			if (h !== rowModel.attr("currh"))
			{
				rowModel.h = hcm;
				heightChanged = true;
			}

			if (type == "rowResize")
			{
				// row resize
				if (extra.rowId == tr.id)
				{
					rowModel.removeAttr("origh");
				}
			}
		});

		if (heightChanged || totalWidthChanged)
		{
			var currentBoxDomBox = dojo.contentBox(box.domNode);
			element.updateWH(totalWidthChanged ? helper.px2cm(currentBoxDomBox.w) : element.w, heightChanged ? helper
				.px2cm(currentBoxDomBox.h) : element.h);
		}
		if (heightChanged)
		{
			dojo.forEach(element.table.rows, function(r)
			{
				r._updateStyleHeight();
			});
		}

		if (type == "rowResize" || type == "colResize" || heightChanged || colWidthChanged)
			box.fixBoxHeight();
		
		pres.utils.tableResizeUtil.resetResizer();

		var msgPub = pe.scene.msgPublisher;
		actPair.push(msgPub.createInsertElementAct(element, index));
		var msg = [msgPub.createMessage(MSGUTIL.msgType.ReplaceNode, actPair)];
		msgPub.addPending("/box/content/changed", msg, [element]);
		dojo.publish("/table/content/updated", [element]);
		
		if (extra.selection)
		{
			var box = pe.scene.slideEditor.getBoxByElementId(element.id);
			if (box && box.status == 2 && box.editor)
			{
				box.editor.restoreSelectInfo(extra.selection);
				box.editor.renderSelection();
			}
		}
	},

	_templatedAction: function(name, args)
	{
		if (!args[0] || !args[1])
			return;

		var element = args[0];
		var newArgs = [];
		for ( var i = 1; i < args.length; i++)
			newArgs.push(args[i]);

		var actPair = [];
		var obj = this._startRNTable(actPair, element);

		var tableEle = element.table;

		var extra = {
			"type": name,
			"selection" : obj.selection
		};

		if (tableEle[name].apply(tableEle, newArgs))
			this._endRNTable(actPair, element, obj.index, extra);
	},

	tableToUpdateContent: function(elem)
	{
		var actPair = [];
		var msgPub = pe.scene.msgPublisher;
		var index = elem.getIndex();
		actPair.push(msgPub.createDeleteElementAct(elem, index));
		var extra = {
			"type": "updateContent"
		};
		this._endRNTable(actPair, elem, index, extra);
		dojo.publish("/table/content/updated", [elem]);
	},

	tableToUpdateTemplate: function(element, name, cells)
	{
		this._templatedAction("updateTemplateName", arguments);
	},
	
	tableToDelete: function(element)
	{
		var msgActs = [];
		var me = this;
		var slide = element.parent;
		var msgPub = pe.scene.msgPublisher;
		
		var oldIndex = dojo.indexOf(slide.elements, element);
		var deleteAct = msgPub.createDeleteElementAct(element, oldIndex);
		msgActs.push(deleteAct);

		if (msgActs.length > 0)
		{
			var msgPairList = [msgPub.createMessage(MSGUTIL.msgType.Element, msgActs)];
			msgPub.sendMessage(msgPairList);
		}

		slide.deleteElement(element, null);
	},

	rowToSetHeader: function(element, rowId)
	{
		this._templatedAction("setHeaderRow", arguments);
	},

	rowToRemoveHeader: function(element, rowId)
	{
		this._templatedAction("removeHeaderRow", arguments);
	},

	rowToMove: function(element, rowId, rowId2, up)
	{
		this._templatedAction("moveRow", arguments);
	},

	rowToInsert: function(element, rowId, rowId2, up)
	{
		this._templatedAction("insertRow", arguments);
	},

	rowToDelete: function(element, cells)
	{
		var fromCell = cells[0];
		var toCell = cells[cells.length - 1];
		var row = fromCell.parent;
		var row2 = toCell.parent;

		var index = row.getIndex();
		var index2 = row2.getIndex();

		var lowIndex = Math.min(index, index2);
		var highIndex = Math.max(index, index2);

		var removeCount = highIndex - lowIndex + 1;
		
		if (removeCount == element.table.rows.length)
			this.tableToDelete(element);
		else
			this._templatedAction("deleteRow", arguments);
	},

	colToSetHeader: function(element, cellId)
	{
		this._templatedAction("setHeaderCol", arguments);
	},

	colToRemoveHeader: function(element, cellId)
	{
		this._templatedAction("removeHeaderCol", arguments);
	},

	colToMove: function(element, cellId, cellId2, left)
	{
		this._templatedAction("moveCol", arguments);
	},

	colToInsert: function(element, cellId, cellId2, left)
	{
		this._templatedAction("insertCol", arguments);
	},

	colToDelete: function(element, cells)
	{
		var cell = cells[0];
		var cell2 = cells[cells.length - 1];
		var index = cell.getIndex();
		var index2 = cell2.getIndex();

		var lowIndex = Math.min(index, index2);
		var highIndex = Math.max(index, index2);
		var len = element.table.rows[0].cells.length;
		var removeCount = highIndex - lowIndex + 1;
		
		if(removeCount == len)
			this.tableToDelete(element);
		else
			this._templatedAction("deleteCol", arguments);
	},

	cellToClear: function(element, cellId, cellId2)
	{
		this._templatedAction("clearCell", arguments);
	},
	
	tableToCell: function(element,cells,telement)
	{
		this._templatedAction("pasteCell", arguments);
	},
	
	cellToColor: function(element, cellId, cellId2, value)
	{
		this._templatedAction("colorCell", arguments);
	},

	rowToResize: function(rowId, /* in cm */cmShift)
	{
		if (!rowId || isNaN(cmShift))
		{
			console.error("resizer row failed.");
			return;
		}
		var slideEditor = pe.scene.slideEditor;
		var box = slideEditor.getSelectedBoxes();
		if (box.length != 1)
			return;

		box = box[0];

		var elem = box.element;
		var tableEle = elem.table, rowEles = tableEle.rows;
		var touchedRowEle = tableEle.getRowById(rowId);

		if (!touchedRowEle)
		{
			console.error("No target row found.");
			return;
		}

		// update row.h
		var hp = pres.utils.helper;

		var index = elem.getIndex();
		if (index < 0)
		{
			console.error("Failed to get element index");
			return;
		}

		var actPair = [];
		var obj = this._startRNTable(actPair, elem);

		// 1, update model and send event
		var goOn = touchedRowEle.updateModelH(touchedRowEle.h + cmShift);
		if (!goOn)
			return;

		touchedRowEle.removeAttr("origh");

		var extra = {
			"type": "rowResize",
			"rowId": rowId,
			"increase": cmShift > 0,
			"selection" : obj.selection
		};

		var box = pe.scene.slideEditor.getBoxByElementId(elem.id);
		this._endRNTable(actPair, elem, index, extra);
	},

	colToResize: function(/* integer */cellIndex, /* in cm */cmShift)
	{
		if (isNaN(cellIndex) || isNaN(cmShift))
		{
			console.error("resizer col failed.");
			return;
		}

		var slideEditor = pe.scene.slideEditor;
		var box = slideEditor.getSelectedBoxes();
		if (box.length != 1)
			return;

		box = box[0];
		var elem = box.element;
		var tableEle = elem.table, colWidthList = tableEle.colWidths;

		if (cellIndex < 0 || cellIndex >= colWidthList.length)
		{
			console.error("No target column found.");
			return;
		}

		var index = elem.getIndex();
		if (index < 0)
		{
			console.error("Failed to get element index");
			return;
		}

		var actPair = [];
		var obj = this._startRNTable(actPair, elem);

		// 1, update model and send event
		var goOn = tableEle.updateModelW(cellIndex, colWidthList[cellIndex] + cmShift);
		if (!goOn)
			return;

		var extra = {
			"type": "colResize",
			"selection" : obj.selection
		};

		var box = pe.scene.slideEditor.getBoxByElementId(elem.id);
		this._endRNTable(actPair, elem, index, extra);
	}

});