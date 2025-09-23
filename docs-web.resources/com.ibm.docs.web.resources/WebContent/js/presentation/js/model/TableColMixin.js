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

dojo.provide("pres.model.TableColMixin");

dojo.declare("pres.model.TableColMixin", null, {

	normalizeCols: function()
	{
		var len = this.rows.length;

		var bandedCols = this.attr("table_use-banding-columns-styles") == "true";
		var lastCol = this.attr("table_use-last-column-styles") == "true";
		var headerCol = this.attr("table_use-first-column-styles") == "true";

		dojo.forEach(this.rows, dojo.hitch(this, function(r, index)
		{
			var firstC = r.cells[0];
			var lastC = r.cells[r.cells.length - 1];
			dojo.forEach(r.cells, function(c, j)
			{
				if (c != firstC && c != lastC)
				{
					c.attr("role", "gridcell");
				}
				if (c != firstC)
				{
					c.removeClass('firstColumn');
					c.removeClass('tableHeaderCol');
				}
				if (c != lastC)
				{
					c.removeClass('lastColumn');
					c.removeClass('tableTotalCol');
				}
			});

			// firstColumn
			firstC.addClass("firstColumn");
			if (headerCol)
			{
				firstC.addClass("tableHeaderCol");
				firstC.attr("role", "rowheader");
			}
			else if (firstC.hasClass('tableHeaderCol'))
			{
				firstC.removeClass('tableHeaderCol');
				if (index == 0 && row.hasClass('tableHeaderRow'))
				{
					firstC.attr("role", "columnheader");
				}
				else
				{
					firstC.attr("role", "gridcell");
				}
			}

			lastC.addClass("lastColumn");
			if (!this.hasClass("ibmdocsTable"))
			{
				// lastColumn
				if (lastCol)
				{
					lastC.addClass('tableTotalCol');
				}
				else
				{
					lastC.removeClass('tableTotalCol');
				}
				lastC.attr("role", "gridcell");

				// alternateCol
				dojo.forEach(r.cells, function(c, j)
				{
					if (j % 2 == 0)
					{
						c.removeClass('tableAlternateCol');
					}
					else
					{
						if (bandedCols && (!lastCol || j != r.cells.length - 1))
						{
							c.addClass("tableAlternateCol");
						}
						else
						{
							c.removeClass('tableAlternateCol');
						}
					}
				});
			}
		}));
	},

	setHeaderCol: function(cells)
	{
		var cell = cells[0];
		var row = cell.parent;
		var index = cell.getIndex();
		if (index != 0)
			return;

		dojo.forEach(this.rows, dojo.hitch(this, function(r)
		{
			var c = r.cells[0];
			c.addClass("tableHeaderCol");
			c.attr("role", "rowheader");
			this.fixupCustomHeaderColumnStyles(r, true);
		}));
		var tableClassesString = this.attr("class");
		var tableClassesArr = this.str2array(tableClassesString);
		for ( var j = 0; j < tableClassesArr.length; j++)
		{
			if (tableClassesArr[j].match(/^st_border/))
			{
				if (dojo.indexOf(tableClassesArr, 'st_border_first_column_header') == -1)
				{
					tableClassesArr.push("st_border_first_column_header");
					var index = dojo.indexOf(tableClassesArr, 'st_border_plain');
					if (index > -1)
						tableClassesArr.splice(index, 1);
				}
				break;
			}
		}

		this.attr("class", this.array2str(tableClassesArr));
		this.attr("table_use-first-column-styles", "true");
		this.normalizeCols();
		dojo.publish("/table/col/set/header", [this.parent, {
			rowId: row.id,
			cellId: cell.id
		}]);
		return true;
	},

	removeHeaderCol: function(cells)
	{
		var cell = cells[0];
		var row = cell.parent;
		var index = cell.getIndex();
		if (index != 0)
			return;
		dojo.forEach(this.rows, dojo.hitch(this, function(r, i)
		{
			var c = r.cells[0];
			c.removeClass("tableHeaderCol");

			if (i == 0 && r.hasClass('tableHeaderRow'))
			{
				c.attr("role", "columnheader");
			}
			else
			{
				c.attr("role", "gridcell");
			}
			this.fixupCustomHeaderColumnStyles(r, false);
		}));
		var tableClassesString = this.attr("class");
		var tableClassesArr = this.str2array(tableClassesString);
		var index = dojo.indexOf(tableClassesArr, 'st_border_first_column_header');
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
		this.attr("table_use-first-column-styles", "false");
		this.normalizeCols();
		dojo.publish("/table/col/remove/header", [this.parent, {
			rowId: row.id,
			cellId: cell.id
		}]);
		return true;
	},

	fixupCustomHeaderColumnStyles: function(currRow, addStyle)
	{
		var tableClassesString = this.attr("class");
		var tableClassesArr = this.str2array(tableClassesString);

		for ( var i = 0; i < tableClassesArr.length; i++)
		{
			// Check if this is a custom table signified by st_border_* classes
			if (tableClassesArr[i].match(/^st_border/))
			{
				var headerColor = this.attr("table_header_color");

				// If removing a header column cell, use alt or banding color
				if (!addStyle)
				{
					if (headerColor)
					{
						var currCell = currRow.cells[0];
						var style = pres.utils.htmlHelper.extractStyle(currCell.attr("style"));
						var old = style['background-color'] || "";

						var headerColorVal = PresCKUtil.normalizeColorValue(headerColor);
						var oldColorVal = PresCKUtil.normalizeColorValue(old);
						if (headerColorVal == oldColorVal)
						{
							// don't put a background color on the first cell unless
							// it is a different color (user manually set color)
							// TODO check 15323.
							delete style['background-color'];
						}
					}
				}
				else
				{
					if (headerColor)
					{
						var currCell = currRow.cells[0];
						var style = pres.utils.htmlHelper.extractStyle(currCell.attr("style"));
						var old = style['background-color'] || "";
						if (!old || old == "")
						{
							style['background-color'] = headerColor;
							var value = pres.utils.htmlHelper.stringStyle(style);
							currCell.attr("style", value);
						}
					}
				}
				break;
			}
		}
	},

	moveCol: function(cells, left)
	{
		var cell = cells[0];
		var row = cell.parent;
		var cell2 = cells[cells.length - 1];
		var index = cell.getIndex();
		var index2 = cell2.getIndex();

		var lowIndex = Math.min(index, index2);
		var highIndex = Math.max(index, index2);
		var len = this.rows[0].cells.length;

		if (lowIndex == 0 && left)
			return;

		if (highIndex == len - 1 && !left)
			return;

		var toSwapCellIndex = left ? lowIndex - 1 : highIndex + 1;

		dojo.forEach(this.rows, function(row)
		{
			var cells = row.cells;
			var swappedCell = cells[toSwapCellIndex];
			cells.splice(toSwapCellIndex, 1);
			cells.splice(left ? highIndex : lowIndex, 0, swappedCell);
		});

		var swappedCol = this.colWidths[toSwapCellIndex];
		this.colWidths.splice(toSwapCellIndex, 1);
		this.colWidths.splice(left ? highIndex : lowIndex, 0, swappedCol);

		this.normalizeCols();
		this.updateTableMap();

		dojo.publish("/table/col/moved", [this.parent, {
			rowId: row.id,
			cellId: cell.id
		}]);

		return true;
	},

	deleteCol: function(cells)
	{
		var cell = cells[0];
		var row = cell.parent;
		var cell2 = cells[cells.length - 1];
		var index = cell.getIndex();
		var index2 = cell2.getIndex();

		var lowIndex = Math.min(index, index2);
		var highIndex = Math.max(index, index2);
		var len = this.rows[0].cells.length;

		var removeCount = highIndex - lowIndex + 1;
		var totalW = 0;

		if (removeCount >= len)
			return;

		var nextCell = highIndex == row.cells.length - 1 ? row.cells[lowIndex - 1] : row.cells[highIndex + 1];

		var content = "";

		while (removeCount > 0)
		{
			dojo.forEach(this.rows, function(r)
			{
				var cell = r.cells.splice(lowIndex, 1);
				content += cell.content;
			});

			var colWidth = this.colWidths[lowIndex];
			this.colWidths.splice(lowIndex, 1);
			totalW += colWidth;

			removeCount--;
		}

		// spare cut width evenly to remaining cols
		var len = this.colWidths.length;
		var buf = totalW / len;
		for ( var i = 0; i < len; i++)
		{
			this.colWidths[i] = this.colWidths[i] + buf;
		}

		this.normalizeCols();
		this.updateTableMap();

		dojo.publish("/table/col/deleted", [this.parent, {
			rowId: row.id,
			cellId: nextCell.id
		}]);

		return true;
	},

	insertCol: function(cells, left)
	{
		var cell = cells[0];
		var fromRow = cell.parent;
		var cell2 = cells[cells.length - 1];
		var index = cell.getIndex();
		var index2 = cell2.getIndex();

		var lowIndex = Math.min(index, index2);
		var highIndex = Math.max(index, index2);
		var len = this.rows[0].cells.length;

		var count = highIndex - lowIndex + 1;

		if (len + count > pres.constants.MAX_COL_COUNT)
		{
			// too many cols.
			return;
		}

		if (left && lowIndex == 0 && dojo.every(this.rows, dojo.hitch(this, function(r)
		{
			var c = r.cells[0];
			return c.hasClass("tableHeaderCol");
		})))
		{
			return;
		}

		var isRefHeaderCol = false;
		if (!left && lowIndex == 0 && count == 1)
		{
			if (dojo.every(this.rows, dojo.hitch(this, function(r)
			{
				var c = r.cells[0];
				return c.hasClass("tableHeaderCol");
			})))
			{
				isRefHeaderCol = true;
			}
		}

		var cellWidth = left ? this.colWidths[lowIndex] : this.colWidths[highIndex];
		var oldTotalCellWidth = 0;
		dojo.forEach(this.colWidths, function(w){
			oldTotalCellWidth += w;
		});
		var totalW = cellWidth * count;

		var hp = pres.utils.helper;
		var cellContents = [];
		var nextCellId = null;
		dojo.forEach(this.rows, dojo.hitch(this, function(row, rowIndex)
		{
			var matchCell = row.cells[left ? lowIndex : highIndex];
			var emptyContent = this.getCellEmptyContent(matchCell, true);
			if (emptyContent)
			{
				cellContents.push(emptyContent);
				hasExistContent = true;
			}
			if (!hasExistContent)
				cellContents.push(null);
		}));

		for ( var i = 0; i < count; i++)
		{
			dojo.forEach(this.rows, function(row, j)
			{
				var cell = new pres.model.Cell();
				var matchCell = row.cells[left ? lowIndex : highIndex];

				if (isRefHeaderCol && len > 1)
					matchCell = row.cells[lowIndex + 1];

				cell.parent = row;

				if (j == 0 && dojo.every(row.cells, function(c)
				{
					return c.isHeaderCell;
				}))
				{
					cell.isHeaderCell = true;
				}
				else
					cell.isHeaderCell = false;
				cell.id = pres.utils.helper.getUUID("td_id_");

				var cellContent = cellContents[j];
				if (cellContent)
					cell.content = cellContent.replace(new RegExp("{id}", "gi"), function(item)
					{
						return hp.getUUID();
					});
				else
					cell.generateDefaultContent();

				cell.attr("style", matchCell.attr("style"));
				cell.attr("class", matchCell.attr("class"));
				row.cells.splice(left ? lowIndex : highIndex + 1, 0, cell);

				if (row == fromRow)
				{
					if (i == count - 1)
						nextCellId = cell.id;
				}

			});

			this.colWidths.splice(left ? lowIndex : highIndex + 1, 0, cellWidth);
		}
		
		var newTotalCellWidth = 0;
		dojo.forEach(this.colWidths, function(w){
			newTotalCellWidth += w;
		});
		
		this.colWidths = dojo.map(this.colWidths, function(w){
			return w/newTotalCellWidth * oldTotalCellWidth;
		});

		this.normalizeCols();
		this.updateTableMap();

		dojo.publish("/table/col/inserted", [this.parent, {
			rowId: fromRow.id,
			cellId: nextCellId
		}]);

		return true;
	},
	
	insertColForPaste: function(index,count)
	{
		var isRefHeaderCol = false;
		if (index == 0 && count == 1)
		{
			if (dojo.every(this.rows, dojo.hitch(this, function(r)
			{
				var c = r.cells[0];
				return c.hasClass("tableHeaderCol");
			})))
			{
				isRefHeaderCol = true;
			}
		}
		var cellWidth = this.colWidths[index];
		var totalW = cellWidth * count;
		var hp = pres.utils.helper;
		var cellContents = [];
		var nextCellId = null;
		dojo.forEach(this.rows, dojo.hitch(this, function(row, rowIndex)
		{
			var matchCell = row.cells[index];
			var emptyContent = this.getCellEmptyContent(matchCell);
			if (emptyContent)
			{
				cellContents.push(emptyContent);
				hasExistContent = true;
			}
			if (!hasExistContent)
				cellContents.push(null);
		}));
		for ( var i = 0; i < count; i++)
		{
			dojo.forEach(this.rows, function(row, j)
			{
				var cell = new pres.model.Cell();
				var matchCell = row.cells[index];

				if (isRefHeaderCol && len > 1)
					matchCell = row.cells[index + 1];
				cell.parent = row;
				if (j == 0 && dojo.every(row.cells, function(c)
				{
					return c.isHeaderCell;
				}))
				{
					cell.isHeaderCell = true;
				}
				else
					cell.isHeaderCell = false;
				cell.id = pres.utils.helper.getUUID("td_id_");

				var cellContent = cellContents[j];

				if (cellContent)
					cell.content = cellContent;
				else
					cell.generateDefaultContent();

				cell.attr("style", matchCell.attr("style"));
				cell.attr("class", matchCell.attr("class"));
				row.cells.splice(index + 1, 0, cell);
			});
			this.colWidths.splice(index + 1, 0, cellWidth);
		}
		var w = this.parent.w;
		var len = this.colWidths.length;
		var offsetEach = totalW / len;
		for ( var i = 0; i < len; i++)
		{
			this.colWidths[i] = this.colWidths[i] - offsetEach;
		}
		this.normalizeCols();
		this.updateTableMap();
		return true;
	}
});
