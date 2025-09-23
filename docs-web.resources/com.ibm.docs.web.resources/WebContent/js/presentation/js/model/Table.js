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

dojo.provide("pres.model.Table");

dojo.require("pres.model.Attrable");
dojo.require("pres.model.Htmlable");

dojo.require("pres.model.Row");
dojo.require("pres.model.Cell");
dojo.require("pres.utils.tableUtil");
dojo.require("pres.constants");

dojo.require("pres.model.TableRowMixin");
dojo.require("pres.model.TableColMixin");
dojo.require("pres.model.TableCellMixin");

dojo.declare("pres.model.Table", [pres.model.Attrable, pres.model.Htmlable, pres.model.TableRowMixin, pres.model.TableColMixin,
		pres.model.TableCellMixin], {

	id: "",
	parent: null,

	normalize: function()
	{
		// TODO, make all things (row height and col width) not exceed 100%
	},

	hasMerge: function()
	{
		return dojo.some(this.rows, function(row)
		{
			return dojo.some(row.cells, function(c)
			{
				return c.attr("rowSpan") > 1 || c.attr("colSpan") > 1;
			});
		});
	},

	clone: function()
	{
		var table = new pres.model.Table();
		table.id = this.id;
		table.attrs = dojo.clone(this.attrs);
		table.colWidths = dojo.clone(this.colWidths);
		table.rows = [];
		dojo.forEach(this.rows, function(r)
		{
			var nr = r.clone();
			nr.parent = table;
			table.rows.push(nr);
		});
		return table;
	},

	parseDom: function(tableDom, w, h)
	{
		var self = this;
		dojo.forEach(tableDom.attributes, function(attr)
		{
			var name = attr.name;
			if (name == "id")
				self.id = attr.value;
			else
			{
				self.attrs[name] = attr.value;
			}
		});
		var colgroup = dojo.query("colgroup", tableDom)[0];
		var cols = dojo.query("col", colgroup);
		dojo.forEach(cols, dojo.hitch(this, function(col)
		{
			this.colWidths.push(parseFloat(col.style.width) * w / 100.0);
		}));
		var rows = dojo.query("tr", tableDom);
		dojo.forEach(rows, dojo.hitch(this, function(rowDom)
		{
			var rowModel = new pres.model.Row();
			rowModel.parseDom(rowDom, w, h);
			rowModel.parent = this;
			this.rows.push(rowModel);
		}));
		this.normalize();
	},

	toJson: function()
	{
		var _rowJson = [];

		for ( var i = 0, len = this.rows.length; i < len; i++)
		{
			_rowJson.push(this.rows[i].toJson());
		}

		return {
			id: this.id,
			type: "table",
			attrs: dojo.clone(this.attrs),
			colWidths: dojo.clone(this.colWidths),
			rows: _rowJson
		};
	},

	constructor: function(jsonTable)
	{
		this.attrs = {};
		this.colWidths = [];
		this.rows = [];
		this.map = [];
		if (jsonTable)
		{
			this.id = jsonTable.id;
			this.attrs = jsonTable.attrs;
			this.colWidths = jsonTable.colWidths; // in cm
			this.rows = this.initRowModel(jsonTable.rows);
			for ( var i = 0, len = this.rows.length; i < len; i++)
			{
				this.rows[i].parent = this;
			}
			this.map = this.getMap();
		}
	},

	initRowModel: function(jsonRows)
	{
		var rows = [];
		for ( var i = 0, len = jsonRows.length; i < len; i++)
		{
			var row = new pres.model.Row(jsonRows[i]);
			rows.push(row);
		}
		return rows;
	},

	getRowById: function(id)
	{
		for ( var i = 0, len = this.rows.length; i < len; i++)
		{
			var row = this.rows[i];
			if (id == row.id)
				return row;
		}
		return null;
	},

	updateModelW: function(colIndex, newW)
	{
		if (isNaN(colIndex) || isNaN(newW))
			return false;

		newW = (newW < pres.constants.COL_MIN_WIDTH_CM) ? pres.constants.COL_MIN_WIDTH_CM : newW;

		var oldW = this.colWidths[colIndex];
		var offset = newW - oldW;
		var nextW = this.colWidths[colIndex + 1] - offset;
		if (nextW < pres.constants.COL_MIN_WIDTH_CM)
			return false;

		// 1, update colgroup
		this.colWidths[colIndex] = newW;
		this.colWidths[colIndex + 1] = nextW;

		// 2, update thumbnail and slideeditor
		dojo.publish("/table/col/resized", [this.parent]);

		return true;
	},

	_removeBackground: function(r)
	{
		var htmlHelper = pres.utils.htmlHelper;
		var style = r.attr("style");
		if (style)
		{
			style = htmlHelper.extractStyle(style);
			delete style["background"];
			delete style["background-image"];
			delete style["background-color"];
			r.attr("style", htmlHelper.stringStyle(style));
		}
	},

	updateTemplateName: function(name, cells)
	{
		var utils = pres.utils.tableUtil;
		var attrmap = utils[name] || utils.st_default;
		dojo.forEach(utils.attrs, dojo.hitch(this, function(attr, index)
		{
			this.attr(attr, attrmap[index] + "");
		}));

		var tableClassesString = this.attr("class");
		var tableClassesArr = this.str2array(tableClassesString);
		var len = tableClassesArr.length;

		var map = {};
		dojo.forEach(utils.styles, function(s)
		{
			map[s] = 1;
		});
		dojo.forEach(utils.smartTableStyles, function(s)
		{
			map[s] = 1;
		});
		map["SymDefault"] = 1;
		
		var tableTemplateName = this.attr('table_template-name') || "";
		var templateNameRegex = new RegExp(tableTemplateName, "gi");
		
		for ( var j = 0; j < len; j++)
		{
			var clazz = tableClassesArr[j];
			if (clazz)
			{
				if (clazz.match(/^st_border/) || map[clazz] == 1 || (tableTemplateName && clazz.match(templateNameRegex)))
				{
					tableClassesArr.splice(j, 1);
					j--;
					len--;
				}
			}
		}

		tableClassesArr.push(name);

		this.attr("class", this.array2str(tableClassesArr));
		this.attr("table_template-name", name);
		this._removeBackground(this);
		// this.removeAttr("style");

		dojo.forEach(this.rows, dojo.hitch(this, function(r)
		{
			dojo.forEach(r.cells, dojo.hitch(this, function(c)
			{
				c.attr("class", "table_table-cell");
				c.removeAttr("docsbackgroundfill");
				this._removeBackground(c);
			}));

			r.attr("class", "table_table-row");
			this._removeBackground(r);
		}));

		this.normalizeRows();
		this.normalizeCols();
		if (cells && cells.length)
		{
			var c = cells[0];
			var r = c.parent;
			dojo.publish("/table/style/updated", [this.parent, {
				cellId: c.id,
				rowId: r.id
			}]);
		}
		else
			dojo.publish("/table/style/updated", [this.parent]);
		return true;
	},

	getHTML: function(slideH, slideW)
	{
		var table = this._gartherAttrs(null, null, "table");
		table += this.getColgroupHTML(slideW);
		table += "<tbody>" + this.getRowsHTML() + "</tbody>";
		table += "</table>";
		return table;
	},

	getColgroupHTML: function(slideW)
	{
		var clgrp = "<colgroup>";

		for ( var i = 0, len = this.colWidths.length; i < len; i++)
		{
			var percWidth = this.colWidths[i] * 100 / this.parent.w;
			clgrp += '<col style="width: ' + percWidth + '%"/>';
		}
		clgrp += "</colgroup>";
		return clgrp;
	},

	getRowsHTML: function()
	{
		var rowsHtml = "";
		for ( var i = 0, len = this.rows.length; i < len; i++)
		{
			rowsHtml += this.rows[i].getHTML();
		}
		return rowsHtml;
	},

	updateTableMap: function()
	{
		this.map = this.buildTableMap();
	},

	getMap: function()
	{
		if (!this.map || this.map.length == 0)
			this.map = this.buildTableMap();
		return this.map;
	},

	getAbsRowNum: function()
	{
		if (!this.map || this.map.length == 0)
			this.map = this.buildTableMap();
		return this.map.length;
	},

	getAbsColNum: function()
	{
		if (!this.map || this.map.length == 0)
			this.map = this.buildTableMap();

		if (this.map.length <= 0)
			return 0;
		else
			return this.map[0].length;
	},

	/**
	 * starts from 0
	 * 
	 * @param cellId
	 * @returns
	 */
	getAbsCellIndex: function(cellId)
	{
		if (!cellId || !this.map)
			return -1;

		var ret = {
			rowIndex: -1,
			colIndex: -1
		};
		for ( var i = 0, len = this.getAbsRowNum(); i < len; i++)
		{
			var row = this.map[i];
			for ( var j = 0, lenC = row.length; j < lenC; j++)
			{
				if (row[j] == cellId)
				{
					ret.rowIndex = i;
					ret.colIndex = j;
					return ret;
				}
			}
		}
		return ret;
	},

	getCellIDByAbsIndex: function(rowIndex, colIndex)
	{
		if (isNaN(rowIndex) || isNaN(colIndex))
			return null;

		var rowCnt = this.getAbsRowNum(), colCnt = this.getAbsColNum();
		if (rowIndex > rowCnt - 1 || colIndex > colCnt - 1)
			return null;

		return this.getMap()[rowIndex][colIndex];
	},

	buildTableMap: function()
	{
		var rows = this.rows;

		// Row and Column counters.
		var r = -1, aMap = [];

		for ( var i = 0, len = rows.length; i < len; i++)
		{
			r++;
			!aMap[r] && (aMap[r] = []);
			var c = -1;

			for ( var j = 0, lenC = rows[i].cells.length; j < lenC; j++)
			{
				var oCell = rows[i].cells[j];
				c++;

				while (aMap[r][c])
					c++;

				var rowspanCell = oCell.attrs.rowSpan || 1;
				var colspanCell = oCell.attrs.colSpan || 1;
				for ( var rs = 0; rs < rowspanCell; rs++)
				{
					if (!aMap[r + rs])
						aMap[r + rs] = [];

					for ( var cs = 0; cs < colspanCell; cs++)
					{
						aMap[r + rs][c + cs] = rows[i].cells[j].id;
					}
				}

				c += colspanCell - 1;
			}
		}
		return aMap;
	},

	getCellById: function(id)
	{
		for ( var i = 0; i < this.rows.length; i++)
		{
			var r = this.rows[i];
			var c = r.getCellById(id);
			if (c)
			{
				return c;
			}
		}
		return null;
	}

});