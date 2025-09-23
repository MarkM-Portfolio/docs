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

dojo.provide("pres.model.TableCellMixin");

dojo.declare("pres.model.TableCellMixin", null, {
	pasteCell: function(cells,element)
	{
		var hp = pres.utils.helper;
		var telement = this.parent;
		var tTable = telement.table;
		var startRowIndex = 0;
		var startColIndex = 0;
		var trl = tTable.rows.length;
		var tcl = tTable.colWidths.length;
		if(cells)
		{
			var sCell = cells[0];
			var eCell = cells[cells.length - 1];
			var startAbsIndex = tTable.getAbsCellIndex(sCell.id);
			var endAbsIndex = tTable.getAbsCellIndex(eCell.id);
			startRowIndex = Math.min(startAbsIndex.rowIndex, endAbsIndex.rowIndex);
			startColIndex = Math.min(startAbsIndex.colIndex, endAbsIndex.colIndex);
		}
		var table = element[0].table;
		if (table)
		{
			var rl = table.rows.length;
			var cl = table.colWidths.length;
			var rowCount = startRowIndex + rl - trl;
			var colCount = startColIndex + cl - tcl;
			
			
			if (startRowIndex + rl > pres.constants.MAX_ROW_COUNT)
			{
				// too many rows.
				return false;
			}
			if (startColIndex + cl > pres.constants.MAX_COL_COUNT)
			{
				// too many cols.
				return false;
			}
			console.log('startRowIndex:'+startRowIndex);
			console.log('startColIndex:'+startColIndex);
			console.log('rowCount:'+rowCount);
			console.log('colCount:'+colCount);
			if(rowCount >0)
			{
				tTable.insertRowForPaste(startRowIndex,rowCount);
			}
			if(colCount >0)
			{
				tTable.insertColForPaste(startColIndex,colCount);
			}
			var trows = table.rows;
			var ri = 0;
			dojo.forEach(trows, dojo.hitch(this, function(r)
			{
				var tcs = r.cells;
				var toRowIndex = startRowIndex + ri;
				var ci = 0;
				dojo.forEach(tcs, dojo.hitch(this, function(c)
				{
					var content = c.content;
					var toColIndex = startColIndex + ci;
					tTable.rows[toRowIndex].cells[toColIndex].content = content;
					ci++;
				}));
				ri++;
			}));		
			dojo.publish("/table/cell/pasted", [this.parent, {
				cellId: cells[0].id,
				rowId: cells[0].parent.id
			}]);
			return true;
		}
	},
	
	clearCell: function(cells)
	{
		var oldContent = "";
		if (cells && cells.length > 0)
		{
			var hp = pres.utils.helper;
			var element = this.parent;
			dojo.forEach(cells, dojo.hitch(this, function(c)
			{
				var emptyContent = this.getCellEmptyContent(c);
				var oldLiId = null;
				var newLiId = null;
				oldContent += c.content;
				if (emptyContent)
				{
					c.content = emptyContent;
				}
				else
				{
					c.generateDefaultContent();
				}
			}));

			dojo.publish("/table/cell/cleared", [this.parent, {
				cellId: cells[0].id,
				rowId: cells[0].parent.id
			}]);
			return true;
		}
	},

	colorCell: function(cells, color)
	{
		if (cells && cells.length > 0)
		{
			dojo.forEach(cells, function(c)
			{
				c.setColor(color);
			});
			dojo.publish("/table/cell/colored", [this.parent, {
				cellId: cells[0].id,
				rowId: cells[0].parent.id
			}]);
			return true;
		}
	},

	getCellEmptyContent: function(cell, idPlaceHolder)
	{
		var hp = pres.utils.helper;
		var cellDiv = dojo.create("div", {
			style: {
				"display": "none"
			}
		}, dojo.body());

		cellDiv.innerHTML = cell.content;
		var domtree = [];
		var span = dojo.query("span", cellDiv)[0];
		if (span)
		{
			domtree.unshift(span);
			var parent = span.parentNode;
			while (parent != cellDiv)
			{
				domtree.unshift(parent);
				parent = parent.parentNode;
			}
			cellDiv.innerHTML = "";
			var parent = null;
			for ( var i = 0; i < domtree.length; i++)
			{
				var dom = domtree[i];
				var tag = dom.tagName;
				var newDom = dojo.create(tag, {}, parent ? parent : cellDiv);
				var attrs = dom.attributes;
				dojo.forEach(attrs, function(attr)
				{
					var name = attr.name;
					var value = attr.value;
					var newValue = value;
					if (name == "id")
					{
						newValue = idPlaceHolder ? "{id}" : hp.getUUID();
					}
					newDom.setAttribute(name, newValue);
				});
				if (dom == span)
				{
					newDom.id = idPlaceHolder ? "{id}" : hp.getUUID();
					newDom.innerHTML = "&#8203;";
					dojo.create("br", {
						className: "hideInIE"
					}, newDom.parentNode);
				}
				parent = newDom;
			}

			return cellDiv.innerHTML;
		}
		return null;
	},

	gatherCells: function(cellId, cellId2)
	{
		var cells = [];
		var cell = this.getCellById(cellId);
		if (!cell)
			return;
		var cell2 = null;
		if (cellId2 && cellId2 != cellId)
		{
			cell2 = this.getCellById(cellId2);
			if (!cell2)
				return;
		}
		var cellIndex = cell.getIndex();
		var cellIndex2 = cellIndex;
		if (cell2)
			cellIndex2 = cell2.getIndex();

		var row = cell.parent;
		var rowIndex = row.getIndex();
		var row2 = row;
		var rowIndex2 = rowIndex;
		if (cell2)
		{
			row2 = cell2.parent;
			rowIndex2 = row2.getIndex();
		}

		var lowRowIndex = Math.min(rowIndex, rowIndex2);
		var highRowIndex = Math.max(rowIndex, rowIndex2);

		var upToDown = lowRowIndex == rowIndex;
		for ( var i = lowRowIndex; i <= highRowIndex; i++)
		{
			var row = this.rows[i];
			var minCellIndex = cellIndex;
			var maxCellIndex = cellIndex2;

			for ( var j = minCellIndex; j <= maxCellIndex; j++)
			{
				cells.push(row.cells[j]);
			}
		}
		return cells;
	}

});