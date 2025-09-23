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

dojo.provide("pres.model.Row");

dojo.require("pres.model.Cell");
dojo.require("pres.constants");

dojo.declare("pres.model.Row", [pres.model.Attrable, pres.model.Htmlable], {

	id: "",
	h: 0, // in cm
	parent: null,

	getIndex: function()
	{
		var parent = this.parent;
		var eles = parent.rows;
		for ( var i = 0, len = eles.length; i < len; i++)
		{
			var ele = eles[i];
			if (this.id == ele.id)
				return i;
		}
		return -1;
	},

	getCellById: function(id)
	{
		for ( var i = 0, len = this.cells.length; i < len; i++)
		{
			var cell = this.cells[i];
			if (id == cell.id)
				return cell;
		}
		return null;
	},

	setAsAlternate: function()
	{
		return this.addClass("alternateRow");
	},

	removeAlternate: function()
	{
		return this.removeClass("alternateRow");
	},

	isHeaderRow: function()
	{
		return this.hasClass("tableHeaderRow") || dojo.every(this.cells, function(c)
		{
			return c.isHeaderCell;
		});
	},

	removeHeader: function()
	{
		var changed = false;
		if (dojo.every(this.cells, function(c)
		{
			return c.isHeaderCell;
		}))
		{
			dojo.forEach(this.cells, function(c)
			{
				c.isHeaderCell = false;
			});
			changed = true;
		}
		if (this.hasClass("tableHeaderRow"))
		{
			this.removeClass("tableHeaderRow");
			changed = true;
		}
		return changed;
	},

	setAsHeader: function()
	{
		return this.addClass("tableHeaderRow");
	},

	setAsFooter: function()
	{
		return this.addClass("lastRow");
	},

	removeFooter: function()
	{
		return this.removeClass("lastRow");
	},

	getMaxRowSpan: function(cascade)
	{
		if (!this.parent)
			return 1;

		var maxRowSpan = 1;
		var len = this.parent.rows.length;
		var index = dojo.indexOf(this.parent.rows, this);
		dojo.forEach(this.cells, function(c)
		{
			maxRowSpan = Math.max(maxRowSpan, c.attr("rowSpan") || 1);
		});

		maxRowSpan = Math.min(len - index, maxRowSpan);

		if (maxRowSpan == len - index)
			return maxRowSpan;

		var origMaxRowSpan = maxRowSpan;
		if (cascade && origMaxRowSpan > 1)
		{
			for ( var i = 0; i < origMaxRowSpan; i++)
			{
				var nextRowIndex = index + i;
				if (nextRowIndex < len)
				{
					var nextRow = this.parent.rows[nextRowIndex];
					maxRowSpan = Math.max(maxRowSpan, nextRow.getMaxRowSpan(true));
				}
			}
		}

		return maxRowSpan;
	},

	clone: function()
	{
		var row = new pres.model.Row();
		row.id = this.id;
		row.attrs = dojo.clone(this.attrs);
		row.h = this.h;
		row.cells = [];
		dojo.forEach(this.cells, function(c)
		{
			var nc = c.clone();
			nc.parent = row;
			row.cells.push(nc);
		});
		return row;
	},

	parseDom: function(tr, w, h)
	{
		var self = this;
		dojo.forEach(tr.attributes, function(attr)
		{
			var name = attr.name;
			if (name == "id")
				self.id = attr.value;
			else
			{
				self.attrs[name] = attr.value;
			}
		});
		this.h = parseFloat(tr.style.height) * h / 100.0;
		var tds = dojo.query("td", tr);
		var isHeaderCell = false;
		if (tds.length == 0)
		{
			tds = dojo.query("th", tr);
			isHeaderCell = tds.length > 0;
		}

		dojo.forEach(tds, dojo.hitch(this, function(td)
		{
			var cell = new pres.model.Cell();
			cell.parseDom(td);
			cell.isHeaderCell = isHeaderCell;
			cell.parent = this;
			this.cells.push(cell);
		}));
	},

	toJson: function()
	{
		var _cellJson = [];
		for ( var i = 0, len = this.cells.length; i < len; i++)
		{
			_cellJson.push(this.cells[i].toJson());
		}

		return {
			id: this.id,
			h: this.h,
			attrs: dojo.clone(this.attrs),
			cells: _cellJson
		};
	},

	constructor: function(jsonRow)
	{
		this.attrs = {};
		this.cells = [];
		if (jsonRow)
		{
			this.id = jsonRow.id;
			this.h = parseFloat(jsonRow.h);
			this.attrs = jsonRow.attrs;
			this.cells = this.initCellModel(jsonRow.cells);
		}
	},

	initCellModel: function(jsonCells)
	{
		var cells = [];
		for ( var i = 0, len = jsonCells.length; i < len; i++)
		{
			var cell = new pres.model.Cell(jsonCells[i]);
			cell.parent = this;
			cells.push(cell);
		}
		return cells;
	},

	getHTML: function()
	{
		// update height with h.
		this._updateStyleHeight();
		var row = this._gartherAttrs(null, null, "tr");

		for ( var i = 0, len = this.cells.length; i < len; i++)
		{
			row += this.cells[i].getHTML();
		}
		row += '</tr>';
		return row;
	},

	_updateStyleHeight: function()
	{
		var tableH = this.parent.parent.h;
		var hPC = this.h * 100 / tableH;
		// rowHtml = rowHtml.replace(/height(\s*):(\s)*(\d)+(.\d+)?%/ig, "height: " + hPC + "%");

		var style = pres.utils.htmlHelper.extractStyle(this.attrs.style);
		var ret = "";
		for ( var s in style)
		{
			if (dojo.trim(s) == "height")
				ret += s + ": " + hPC + "%";
			else
				ret += s + ": " + style[s];
			ret += ";"
		}
		this.attrs.style = ret;
	},

	updateModelH: function(h)
	{
		if (h < 0 || h < pres.constants.ROW_MIN_HEIGHT_CM)
			return false;
		var oldH = this.h;
		var offset = parseFloat(h) - parseFloat(oldH);
		if (Math.abs(offset) > 0.01)
		{
			this.h = h;

			var element = this.parent.parent;
			element.h = element.h + offset;

			// 3, update drawframe style
			element.attr("style", element.getFinalStyle());

			// 4, update thumbnail and slideeditor
			dojo.publish("/table/row/resized", [element]);
			return true;
		}
	}
});