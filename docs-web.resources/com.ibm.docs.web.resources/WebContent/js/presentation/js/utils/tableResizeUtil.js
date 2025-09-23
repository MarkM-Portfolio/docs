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

dojo.provide("pres.utils.tableResizeUtil");
dojo.require("pres.constants");
dojo.require("pres.utils.tableUtil");
dojo.require("pres.utils.helper");

/*
 * The row height, if enlarged by its text, we need to remember its old height, to restore it, when text deleted, or column resized to make it has space. So when the table inited (if the table model is not touched before), we need to calculate its real height, and set to it.
 */

pres.utils.tableResizeUtil = {

	currentBox: null,
	currentTableNode: null,

	resizeStart: false,
	boundaries: {
		minX: -1,
		maxX: -1,
		minY: -1,
		maxY: -1
	},
	startY: 0,
	rowPillar: {}, // {rowId: "", resizer: dom}

	startX: 0,
	colPillar: {},// {cellIndex: 0, resizer: dom}

	// --------------------------row resize-------------------------------------- //
	initPillars: function(e, box)
	{
		this.resizeStart = false;
		// 1, get the touched cell
		var touchedCell = this.getTouchedNode(e);
		if (!touchedCell)
			return false;
		this.currentBox = box;

		if (!box || !this.currentBox.domNode)
		{
			return false;
		}

		var tableNode = dojo.query("table", box.domNode)[0];
		if (!tableNode)
			return;

		var slideEditor = pe.scene.slideEditor;

		this.currentTableNode = tableNode;
		this.slideEditorDom = box.getParent().domNode;

		// 2, create resizers
		var rowPillar = this.rowPillar;
		var rowResizer = rowPillar.resizer;
		if (!rowResizer)
		{
			rowResizer = dojo.create("div", {
				id: "resizer_row",
				contenteditable: "false",
				unselectable: "on",
				className: "row-resize",
				tabindex: "-1"
			}, slideEditor.mainNode);
			rowResizer.innerHTML = "<div></div>";
			dojo.connect(rowResizer, "onclick", function(e)
			{
				dojo.stopEvent(e);
				return false;
			});
			dojo.connect(rowResizer, "ondragstart", function(e)
			{
				dojo.stopEvent(e);
				return false;
			});
			rowPillar.resizer = rowResizer;
		}

		dojo.place(rowResizer, pe.scene.slideEditor.mainNode);

		dojo.style(rowResizer, "opacity", "0");
		dojo.style(rowResizer, "display", "none");

		var colPillar = this.colPillar;
		var colResizer = colPillar.resizer;
		if (!colResizer)
		{
			colResizer = dojo.create("div", {
				id: "resizer_col",
				contenteditable: "false",
				unselectable: "on",
				className: "col-resize",
				style: "",
				tabindex: "-1"
			}, slideEditor.mainNode);
			colResizer.innerHTML = "<div></div>";
			colPillar.resizer = colResizer;

			dojo.connect(colResizer, "onclick", function(e)
			{
				dojo.stopEvent(e);
				return false;
			});
			dojo.connect(colResizer, "ondragstart", function(e)
			{
				dojo.stopEvent(e);
				return false;
			});
		}
		dojo.style(colResizer, "opacity", "0");
		dojo.style(colResizer, "display", "none");
		dojo.place(colResizer, pe.scene.slideEditor.mainNode);

		if (!this.moveConnection)
		{
			this.moveConnection = dojo.connect(pe.scene.slideEditor, "beforeClean", function()
			{
				colResizer.parentNode && colResizer.parentNode.removeChild(colResizer);
				rowResizer.parentNode && rowResizer.parentNode.removeChild(rowResizer);
			});
		}

		var tblPos = dojo.coords(tableNode.parentNode);

		// 2, init row pillar
		var touchedRow = touchedCell.parentNode;
		var rId = touchedRow.id;
		var pos = dojo.coords(touchedRow);

		if (e.clientY > pos.y + pos.h / 2)
		{
			if (touchedRow.nextSibling)
			{
				touchedRow = touchedRow.nextSibling;
				rId = touchedRow.id;
				pos = dojo.coords(touchedRow);
			}
		}

		if (!rowPillar.rowId || rowPillar.rowId != rId)
		{
			// attach the row index to pillar, attach resizer to pillar
			rowPillar.rowId = rId;
			rowPillar.row = touchedRow;
			var resizerTop = pos.t + tblPos.t - 3 + "px";
			if (!touchedRow.previousSibling)
				resizerTop = 0;

			dojo.style(rowResizer, {
				opacity: "0",
				left: tblPos.l + "px",
				width: tblPos.w + "px",
				top: resizerTop
			});

			dojo.disconnect(this.rowresizeMouseDown);
			this.rowresizeMouseDown = dojo.connect(rowResizer, "onmousedown", this, this.onMouseDownRowResizer);
		}

		// 3, init col pillar
		var cellIndex = this._getAbsCellIndex(touchedCell);
		this.adjustColPillar(cellIndex, e);

		dojo.style(colResizer, "display", "");
		dojo.style(rowResizer, "display", "");
	},

	adjustColPillar: function(cellIndex, e)
	{
		var tableNode = this.currentTableNode;
		var total = 0, widths = pres.utils.helper.getColWidthsFromDOM(tableNode);
		for ( var i = 0; i < cellIndex; i++)
		{
			total += widths[i];
		}
		var tblPos = dojo.coords(tableNode.parentNode);
		var editorPos = dojo.coords(this.slideEditorDom);
		var offset = 14;

		if (cellIndex !== 0 && e.clientX < tblPos.x + total + widths[cellIndex - 1] / 3)
		{
			// console.info("i need to adjust to previous cell index");
			total -= widths[cellIndex - 1];
			cellIndex = cellIndex - 1;
		}

		if (this.colPillar.colIndex === cellIndex)
			return;

		this.boundaries.minX = tblPos.x + total + offset + 8;
		this.boundaries.maxX = this.boundaries.minX + widths[cellIndex + 1] + widths[cellIndex] - offset * 2;
		var colResizer = this.colPillar.resizer;

		var left = tblPos.l + total + widths[cellIndex] - 1 + "px";
		if (cellIndex == widths.length - 1)
		{
			// the last one
			left = "-10000px";
		}

		dojo.style(colResizer, {
			opacity: "0",
			top: tblPos.t + "px",
			height: tblPos.h + "px",
			left: left
		});

		dojo.disconnect(this.colresizeMouseDown);
		this.colresizeMouseDown = dojo.connect(colResizer, "onmousedown", this, this.onMouseDownColResizer);

		this.colPillar.cellIndex = cellIndex;
		this._setColResizerBoundaries(tableNode, cellIndex);
		dojo.disconnect(this.dragStart);
		this.dragStart = dojo.connect(document.body, "ondragstart", function(e)
		{
			dojo.stopEvent(e);
			return false;
		});
	},

	_getAbsCellIndex: function(touchedCell)
	{
		var tableModel = this.currentBox.element.table;
		var cellIndexObj = tableModel.getAbsCellIndex(touchedCell.id);
		if (cellIndex == tableModel.getAbsColNum() - 1)
		{
			touchedCell = touchedCell.previousSibling;
			cellIndexObj = tableModel.getAbsCellIndex(touchedCell.id);
		}
		var cellIndex = cellIndexObj.colIndex;
		var rowSpan = touchedCell.colSpan - 1;
		cellIndex = cellIndex + rowSpan;

		return cellIndex;
	},

	_setColResizerBoundaries: function(tableNode, cellIndex)
	{
		var total = 0, widths = pres.utils.helper.getColWidthsFromDOM(tableNode);
		for ( var i = 0; i < cellIndex; i++)
		{
			total += widths[i];
		}
		var tblPos = dojo.coords(tableNode.parentNode);
		var editorPos = dojo.coords(this.slideEditorDom);
		var offset = 14;
		this.boundaries.minX = tblPos.x + total + offset + 8;
		this.boundaries.maxX = this.boundaries.minX + widths[cellIndex + 1] + widths[cellIndex] - offset * 2;
	},

	onMouseDownRowResizer: function(e)
	{
		dojo.stopEvent(e);
		this.resizeStart = true;
		this.startY = e.clientY;
		this.attachResizer(true);

		var pos = dojo.position(this.rowPillar.row);
		var resizer = this.getResizer(true);
		var pos2 = dojo.position(resizer);

		if (pos2.y < pos.y)
		{
			var currentRow = this.rowPillar.row;
			var rowBefore = currentRow.previousSibling;
			if (rowBefore)
			{
				this.rowPillar.row = rowBefore;
				this.rowPillar.rowId = rowBefore.id;
			}
		}

		this.startTop = parseFloat(dojo.style(resizer, "top"));
		var currentRow = this.rowPillar.row;
		var height = currentRow.style.height;
		currentRow.style.height = "1px";

		var tr = dojo.create("tr", {
			style: {
				height: "100%"
			}
		}, currentRow.parentNode);

		var h = currentRow.offsetHeight;

		currentRow.style.height = height;
		dojo.destroy(tr);

		var pos = dojo.coords(currentRow);
		this.boundaries.minY = pos.y + h;
	},

	onMouseMoveRowResizer: function(e)
	{
		dojo.stopEvent(e);
		if (!this.resizeStart)
			return false;
		var shift = e.clientY - this.startY;
		if (Math.abs(shift) < 3)
			return false;
		var resizer = this.rowPillar.resizer;
		if (e.clientY > this.boundaries.minY)
			dojo.style(resizer, "top", this.startTop + shift + "px");
	},

	onMouseUpRowResizer: function(e)
	{
		var resizer = this.rowPillar.resizer;
		this.endTop = parseFloat(dojo.style(resizer, "top"));
		this.detachResizer();
		if (!this.resizeStart)
			return;
		dojo.stopEvent(e);
		this.resizeStart = false;

		var shift = this.endTop - this.startTop;
		if (Math.abs(shift) < 3)
			return false;

		var cm = pres.utils.helper.px2cm(shift);
		console.warn("I resized row large with " + cm + " cm");
		dojo.publish("/table/to/resize/row", [this.rowPillar.rowId, cm]);
		this.resetResizer();
	},

	// --------------------------col resize-------------------------------------- //
	onMouseDownColResizer: function(e)
	{
		dojo.stopEvent(e);
		this.resizeStart = true;
		this.startX = e.clientX;
		this.attachResizer();
		var resizer = this.colPillar.resizer;
		this.startLeft = parseFloat(dojo.style(resizer, "left")) || 0;
	},

	onMouseMoveColResizer: function(e)
	{
		dojo.stopEvent(e);
		if (!this.resizeStart)
			return false;
		var shift = e.clientX - this.startX;
		if (Math.abs(shift) < 3)
			return false;
		var resizer = this.colPillar.resizer;
		if (e.clientX > this.boundaries.minX && e.clientX < this.boundaries.maxX)
			dojo.style(resizer, "left", this.startLeft + shift + "px");
	},

	onMouseUpColResizer: function(e)
	{
		var resizer = this.colPillar.resizer;
		this.endLeft = parseFloat(dojo.style(resizer, "left"));
		this.detachResizer();
		if (!this.resizeStart)
			return;
		dojo.stopEvent(e);
		this.resizeStart = false;

		var shift = this.endLeft - this.startLeft;
		if (Math.abs(shift) < 3)
			return false;

		var cm = pres.utils.helper.px2cm(shift);
		console.warn("I resized col large with " + cm + " cm");
		dojo.publish("/table/to/resize/col", [this.colPillar.cellIndex, cm]);
		this.resetResizer();
	},

	// --------------------------common util-------------------------------------- //

	getTouchedNode: function(e, rowWanted)
	{
		var touchedNode = e.target;
		var compare = rowWanted ? "TR" : "THTD";
		while ((compare.indexOf(touchedNode.nodeName) < 0) && touchedNode.nodeName != "BODY")
		{
			touchedNode = touchedNode.parentNode;
		}
		if (compare.indexOf(touchedNode.nodeName) < 0)
			return null;
		return touchedNode;
	},

	getResizer: function(isRow)
	{
		var resizerName = isRow ? "row" : "col";
		return dojo.byId("resizer_" + resizerName);
	},

	attachResizer: function(isRow)
	{
		var resizer = this.getResizer(isRow);
		resizer.style.opacity = "0.5"; // show resizer

		dojo.disconnect(this.colresizeMouseMove);
		dojo.disconnect(this.colresizeMouseUp);
		dojo.disconnect(this.rowresizeMouseMove);
		dojo.disconnect(this.rowresizeMouseUp);

		if (isRow)
		{
			this.rowresizeMouseMove = dojo.connect(document.body, "onmousemove", this, this.onMouseMoveRowResizer);
			this.rowresizeMouseUp = dojo.connect(document.body, "onmouseup", this, this.onMouseUpRowResizer);
		}
		else
		{
			this.colresizeMouseMove = dojo.connect(document.body, "onmousemove", this, this.onMouseMoveColResizer);
			this.colresizeMouseUp = dojo.connect(document.body, "onmouseup", this, this.onMouseUpColResizer);
		}
	},

	hideResizer: function()
	{
		if (this.rowPillar && this.rowPillar.resizer)
			dojo.style(this.rowPillar.resizer, {
				display: "none",
				left: "",
				top: ""
			});
		if (this.colPillar && this.colPillar.resizer)
			dojo.style(this.colPillar.resizer, {
				display: "none",
				left: "",
				top: ""
			});
	},

	resetResizer: function()
	{
		if (this.rowPillar)
			delete this.rowPillar.rowId;
		if (this.colPillar)
			delete this.colPillar.cellIndex;
	},

	detachResizer: function()
	{
		this.hideResizer();
		dojo.disconnect(this.dragStart);
		dojo.disconnect(this.rowresizeMouseDown);
		dojo.disconnect(this.rowresizeMouseMove);
		dojo.disconnect(this.rowresizeMouseUp);
		dojo.disconnect(this.colresizeMouseMove);
		dojo.disconnect(this.colresizeMouseUp);
	}
};