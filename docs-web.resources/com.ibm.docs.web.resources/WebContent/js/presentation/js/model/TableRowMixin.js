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

dojo.provide("pres.model.TableRowMixin");

dojo.declare("pres.model.TableRowMixin", null, {

	moveRow: function(cells, up)
	{
		var fromCell = cells[0];
		var toCell = cells[cells.length - 1];
		var row = fromCell.parent;
		var row2 = toCell.parent;
		var cellIndex = fromCell.getIndex();

		var index = row.getIndex();
		var index2 = row2.getIndex();

		var lowIndex = Math.min(index, index2);
		var highIndex = Math.max(index, index2);
		var prevRowIndex = lowIndex - 1;
		var len = this.rows.length;

		if (lowIndex == 0 && up)
			return;

		if (highIndex == len - 1 && !up)
			return;

		if (lowIndex == 0 && !up && this.rows[lowIndex].isHeaderRow())
		{
			console.info("my row is header row, can not move down");
			return;
		}

		if (prevRowIndex >= 0 && up)
		{
			if (this.rows[prevRowIndex].isHeaderRow())
			{
				console.info("prev row is headerrow, , can not move up");
				return;
			}
		}

		var nextRow = this.rows[lowIndex];
		var nextRowId = nextRow.id;
		var nextRowCellId = nextRow.cells[cellIndex].id;

		var toSwapRowIndex = up ? lowIndex - 1 : highIndex + 1;
		var swappedRow = this.rows[toSwapRowIndex];
		this.rows.splice(toSwapRowIndex, 1);
		this.rows.splice(up ? highIndex : lowIndex, 0, swappedRow);

		this.normalizeRows();
		this.updateTableMap();

		dojo.publish("/table/row/moved", [this.parent, {
			rowId: nextRow,
			cellId: nextRowCellId
		}]);

		return true;
	},
	insertRowForPaste: function(index,rowCount)
	{
		var cellCount = this.colWidths.length;
		var refHeaderRow = index == 0 && this.rows[0].isHeaderRow() && rowCount == 1;
		var useRow = this.rows[index];
		var rowHeight = useRow.h;
		var origh = useRow.attr("origh");
		if (origh)
			rowHeight = useRow.attr("origh");
		var totalH = rowHeight * rowCount;
		useRow = refHeaderRow && this.rows.length > 1 ? this.rows[1] : useRow;
		var container = dojo.create("div", {
			style: {
				"display": "none"
			}
		}, dojo.body());
		var cellContents = [];
		var hp = pres.utils.helper;
		dojo.forEach(useRow.cells, dojo.hitch(this, function(cell)
		{
			var emptyContent = this.getCellEmptyContent(cell, true);
			if (emptyContent)
			{
				cellContents.push(emptyContent);
				hasExistContent = true;
			}
			if (!hasExistContent)
				cellContents.push(null);
		}));
		dojo.destroy(container);
		var newRowId = null;
		var newCellId = null;
		for ( var i = 0; i < rowCount; i++)
		{
			var row = new pres.model.Row();
			// copy style and class
			row.attr("style", useRow.attr("style"));
			row.attr("class", useRow.attr("class"));
			row.id = pres.utils.helper.getUUID("tr_id_");
			row.h = rowHeight;
			row.parent = this;
			if (i == 0)
				newRowId = row.id;

			var cells = useRow.cells;
			for ( var j = 0; j < cellCount; j++)
			{
				var cell = new pres.model.Cell();
				cell.isHeaderCell = false;
				if (j == 0)
				{
					if (this.rows.length == 1)
					{
						if (this.rows[0].cells[0].isHeaderCell)
							cell.isHeaderCell = true;
					}
					else
					{
						// use a row not the first header row
						if (this.rows[this.rows.length - 1].cells[0].isHeaderCell)
							cell.isHeaderCell = true;
					}
				}
				cell.id = pres.utils.helper.getUUID("td_id_");

				if (newRowId && j == 0)
					newCellId = cell.id;

				// copy style and class
				cell.attr("style", cells[j].attr("style"));
				cell.attr("class", cells[j].attr("class"));
				var cellContent = cellContents[j];
				if (cellContent)
					cell.content = cellContent.replace(new RegExp("{id}", "gi"), function(item)
					{
						return hp.getUUID();
					});
				else
					cell.generateDefaultContent();
				cell.parent = row;
				row.cells.push(cell);
			}
			this.rows.splice(index + 1, 0, row);
			row._updateStyleHeight();
		}
		this.normalizeRows();
		this.updateTableMap();
		this.parent.updateWH(this.parent.w, this.parent.h + totalH);
		return true;
	},
	insertRow: function(cells, up)
	{
		var fromCell = cells[0];
		var toCell = cells[cells.length - 1];
		var row = fromCell.parent;
		var row2 = toCell.parent;

		var index = row.getIndex();
		var index2 = row2.getIndex();

		var lowIndex = Math.min(index, index2);
		var highIndex = Math.max(index, index2);
		var rowCount = highIndex - lowIndex + 1;
		var cellCount = this.colWidths.length;
		var len = this.rows.length;

		if (this.rows.length + rowCount > pres.constants.MAX_ROW_COUNT)
		{
			// too many rows.
			return;
		}
		if (lowIndex == 0 && up && this.rows[0].isHeaderRow())
		{
			// can not insert row above first header row.
			return;
		}

		var refHeaderRow = lowIndex == 0 && this.rows[0].isHeaderRow() && !up && rowCount == 1;

		var useRow = up ? this.rows[lowIndex] : this.rows[highIndex];
		var rowHeight = useRow.h;
		var origh = useRow.attr("origh");
		if (origh)
			rowHeight = useRow.attr("origh");
		var totalH = rowHeight * rowCount;

		useRow = refHeaderRow && this.rows.length > 1 ? this.rows[1] : useRow;

		var container = dojo.create("div", {
			style: {
				"display": "none"
			}
		}, dojo.body());

		var cellContents = [];
		var hp = pres.utils.helper;
		dojo.forEach(useRow.cells, dojo.hitch(this, function(cell)
		{
			var emptyContent = this.getCellEmptyContent(cell);
			if (emptyContent)
			{
				cellContents.push(emptyContent);
				hasExistContent = true;
			}
			if (!hasExistContent)
				cellContents.push(null);
		}));

		dojo.destroy(container);
		var newRowId = null;
		var newCellId = null;
		for ( var i = 0; i < rowCount; i++)
		{
			var row = new pres.model.Row();
			// copy style and class
			row.attr("style", useRow.attr("style"));
			row.attr("class", useRow.attr("class"));
			row.id = pres.utils.helper.getUUID("tr_id_");
			row.h = rowHeight;
			row.parent = this;

			if (!up)
			{
				if (i == 0)
					newRowId = row.id;
			}
			else if (i == rowCount - 1)
				newRowId = row.id;

			var cells = useRow.cells;
			for ( var j = 0; j < cellCount; j++)
			{
				var cell = new pres.model.Cell();
				cell.isHeaderCell = false;
				if (j == 0)
				{
					if (this.rows.length == 1)
					{
						if (this.rows[0].cells[0].isHeaderCell)
							cell.isHeaderCell = true;
					}
					else
					{
						// use a row not the first header row
						if (this.rows[this.rows.length - 1].cells[0].isHeaderCell)
							cell.isHeaderCell = true;
					}
				}
				cell.id = pres.utils.helper.getUUID("td_id_");

				if (newRowId && j == 0)
					newCellId = cell.id;

				// copy style and class
				cell.attr("style", cells[j].attr("style"));
				cell.attr("class", cells[j].attr("class"));
				var cellContent = cellContents[j];
				if (cellContent)
					cell.content = cellContent;
				else
					cell.generateDefaultContent();
				cell.parent = row;
				row.cells.push(cell);
			}
			this.rows.splice(up ? lowIndex : highIndex + 1, 0, row);
			row._updateStyleHeight();
		}

		this.normalizeRows();
		this.updateTableMap();
		this.parent.updateWH(this.parent.w, this.parent.h + totalH);
		dojo.publish("/table/row/inserted", [this.parent, {
			rowId: newRowId,
			cellId: newCellId
		}]);

		return true;
	},

	deleteRow: function(cells)
	{
		var fromCell = cells[0];
		var toCell = cells[cells.length - 1];
		var row = fromCell.parent;
		var row2 = toCell.parent;

		var index = row.getIndex();
		var index2 = row2.getIndex();

		// TODO, extractCustomTableStyle && applyCustomTableStyle

		var hasHeaderRow = this.rows[0].isHeaderRow();

		var h = row.h;

		var lowIndex = Math.min(index, index2);
		var highIndex = Math.max(index, index2);

		var nextRow = highIndex == this.rows.length - 1 ? this.rows[lowIndex - 1] : this.rows[highIndex + 1];

		var removeCount = highIndex - lowIndex + 1;
		var totalH = 0;

		if (removeCount >= this.rows.length)
			return;

		var html = "<table>";
		while (removeCount > 0)
		{
			var row = this.rows[lowIndex];
			this.rows.splice(lowIndex, 1);
			totalH += row.h;
			removeCount--;
			html += row.getHTML();
		}

		html += "</table>";

		this.normalizeRows();
		this.updateTableMap();

		var element = this.parent;

		element.updateWH(this.parent.w, this.parent.h - totalH);

		var rowId = nextRow.id;
		var cellId = nextRow.cells[0].id;

		dojo.publish("/table/row/deleted", [this.parent, {
			rowId: rowId,
			cellId: cellId
		}]);

		return true;
	},

	setHeaderRow: function(cells)
	{
		var fromCell = cells[0];
		var row = fromCell.parent;

		var set = false;
		var index = row.getIndex();
		if (index == 0)
			row.addClass("tableHeaderRow");

		if (row.cells[0].hasClass("tableHeaderCol"))
		{
			row.cells[0].attr("role", "rowheader");
		}

		// D23693
		if (this.attr("table_use-last-column-styles") == "true")
		{
			row.cells[row.cells.length - 1].attr("role", "gridcell");
		}

		var tableClassesString = this.attr("class");
		var tableClassesArr = this.str2array(tableClassesString);
		for ( var j = 0; j < tableClassesArr.length; j++)
		{
			if (tableClassesArr[j].match(/^st_border/))
			{
				if (dojo.indexOf(tableClassesArr, 'st_border_top_header') == -1)
				{
					tableClassesArr.push("st_border_top_header");
					var index = dojo.indexOf(tableClassesArr, 'st_border_plain');
					if (index > -1)
						tableClassesArr.splice(index, 1);
				}
				break;
			}
		}

		this.attr("class", this.array2str(tableClassesArr));

		// old stream did this, but seems it has some bug, the attribute change does not persistent in old stream.
		this.attr("table_use-first-row-styles", "true");
		this.fixupCustomHeaderStyles(row, true);
		this.normalizeRows();
		dojo.publish("/table/row/set/header", [this.parent, {
			rowId: row.id,
			cellId: fromCell.id
		}]);
		return true;
	},

	removeHeaderRow: function(cells)
	{
		var fromCell = cells[0];
		var row = fromCell.parent;
		var index = row.getIndex();
		if (index != 0)
			return;
		row.removeClass("tableHeaderRow");
		var tableClassesString = this.attr("class");
		var tableClassesArr = this.str2array(tableClassesString);
		var index = dojo.indexOf(tableClassesArr, 'st_border_top_header');
		if (index > -1)
		{
			tableClassesArr.splice(index, 1);

			var found = false;
			for ( var j = 0; j < tableClassesArr.length && !found; j++)
			{
				if (tableClassesArr[j].match(/^st_border/))
				{
					found = true;
				}
			}
			if (!found)
			{
				tableClassesArr.push('st_border_plain');
			}

			this.attr("class", this.array2str(tableClassesArr));
		}
		// old stream did this, but seems it has some bug, the attribute change does not persistent in old stream.
		this.attr("table_use-first-row-styles", "false");
		this.fixupCustomHeaderStyles(row, false);
		this.normalizeRows();
		dojo.publish("/table/row/remove/header", [this.parent, {
			rowId: row.id,
			cellId: fromCell.id
		}]);
		return true;
	},

	fixupCustomHeaderStyles: function(row, addStyle)
	{
		// D10745
		var tableClassesString = this.attr("class");
		var tableClassesArr = this.str2array(tableClassesString);
		var rowAttribute = "";
		for ( var i = 0; i < tableClassesArr.length; i++)
		{
			// Check if this is a custom table signified by st_border_* classes
			if (tableClassesArr[i].match(/^st_border/))
			{
				if (addStyle)
				{ // If adding the rows style then check for header color
					rowAttribute = 'table_header_color';
				}
				else
				{ // If removing a rows style then check for alt color
					rowAttribute = 'table_alt_color';
				}

				// A custom table will contain this attributes at the table element
				// If exists at table element, update the row background-color

				var headerColor = this.attr(rowAttribute);
				if (headerColor)
				{
					var style = pres.utils.htmlHelper.extractStyle(row.attr("style"));
					style["background-color"] = headerColor;
					var value = pres.utils.htmlHelper.stringStyle(style);
					row.attr("style", value);
				}
				break;
			}
		}
	},

	normalizeRows: function()
	{
		var len = this.rows.length;

		var bandedRows = this.attr("table_use-banding-rows-styles") == "true";
		var lastRow = this.attr("table_use-last-row-styles") == "true";
		var headerRow = this.attr("table_use-first-row-styles") == "true";

		dojo.forEach(this.rows, dojo.hitch(this, function(r, index)
		{
			r.removeClass("lastRow");
			r.removeClass("tableHeaderRow");
			r.removeClass("alternateRow");

			// headerRow && alternativeRow
			if (index == 0)
			{
				if (headerRow)
				{
					r.addClass("tableHeaderRow");
					r.removeClass("alternateRow");
				}
				else
				{
					r.addClass("alternateRow");
					r.removeClass("tableAlternateRow");
				}
			}
			else if (index % 2 == 0)
			{
				r.addClass("alternateRow");
				r.removeClass("tableAlternateRow");
			}
			else
			{
				r.removeClass("alternateRow");
				if (!this.hasClass('ibmdocsTable') && bandedRows)
				{
					r.addClass('tableAlternateRow');
				}
				else
				{
					r.removeClass("tableAlternateRow");
				}
			}

			// lastRow
			if (index == len - 1)
			{
				r.addClass("lastRow");

				if (!this.hasClass('ibmdocsTable') && lastRow)
				{
					r.addClass('tableTotalRow');
				}
				else
				{
					r.removeClass('tableTotalRow');
				}
			}
			else
			{
				r.removeClass("tableTotalRow");
			}
		}));
	}

});
