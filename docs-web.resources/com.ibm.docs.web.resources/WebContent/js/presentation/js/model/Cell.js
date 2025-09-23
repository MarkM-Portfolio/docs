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

dojo.provide("pres.model.Cell");

dojo.require("pres.utils.helper");

dojo.declare("pres.model.Cell", [pres.model.Attrable, pres.model.Htmlable], {

	id: "",
	content: "",
	isHeaderCell: false,

	// return width as cm.
	getWidth: function(real)
	{
		var cellIndex = this.getIndex();
		var row = this.parent;
		var table = row.parent;
		if (real)
		{
			var colIndex = 0;//calculate the col index,which depend on the colSpan
			for(var i=0;i<cellIndex;i++)
			{
				var cell = row.cells[i];
				var colspan = cell.attr("colSpan");
				if (colspan > 1)
				{
					colIndex+=colspan;
				}
				else
					colIndex+=1;
			}
			
			// merge width
			var colspan = this.attr("colSpan");
			if (colspan > 1)
			{
				var colWidth = table.colWidths[colIndex];
				for(var i = 1 ; i < colspan; i ++)
				{
					colWidth += table.colWidths[colIndex + i];
				}
				return colWidth;
			}
			else
			{
				var colWidth = table.colWidths[colIndex];
				return colWidth;
			}
		}
		else
		{
			var colWidth = table.colWidths[index];
			return colWidth;
		}
	},

	generateDefaultContent: function()
	{
		var content = '<p id="{id}"><span id="{id}" style="font-size: 1em;">&#8203;</span><br class="hideInIE" /></p>'
		var hp = pres.utils.helper;
		this.content = content.replace(new RegExp("{id}", "gi"), function(item)
		{
			return hp.getUUID();
		});
	},

	setColor: function(color)
	{
		var style = this.attr("style");
		var styleArr = [];
		if (style)
		{
			styleArr = this.str2array(style, ";");
			var len = styleArr.length;
			for ( var i = 0; i < len; i++)
			{
				var sa = dojo.trim(styleArr[i]);
				if (!sa)
				{
					styleArr.splice(i, 1);
					i--;
					len--;
				}
				if (sa.indexOf("background") >= 0)
				{
					styleArr.splice(i, 1);
					i--;
					len--;
				}
			}
		}
		
		if (!color)
		{
			// default
			this.removeAttr("docsbackgroundfill");
		}
		else
		{
			styleArr.push("background-image:none");
			styleArr.push("background-color:" + color);
			this.attr("docsbackgroundfill", "true");
		}
		this.attr("style", this.array2str(styleArr, ";"));
	},

	isColHeader: function()
	{
		return this.hasClass("tableHeaderCol");
	},

	setAsHeader: function()
	{
		return this.addClass("tableHeaderCol");
	},

	removeHeader: function()
	{
		return this.removeClass("tableHeaderCol");
	},

	removeFirst: function()
	{
		return this.removeClass("firstColumn");
	},

	removeLast: function()
	{
		return this.removeClass("lastColumn");
	},

	setAsFirst: function()
	{
		return this.addClass("firstColumn");
	},

	setAsLast: function()
	{
		return this.addClass("lastColumn");
	},

	getIndex: function()
	{
		var parent = this.parent;
		var eles = parent.cells;
		for ( var i = 0, len = eles.length; i < len; i++)
		{
			var ele = eles[i];
			if (this.id == ele.id)
				return i;
		}
		return -1;
	},

	clone: function()
	{
		var cell = new pres.model.Cell(this.toJson());
		cell.id = this.id;
		cell.content = this.content;
		cell.attrs = dojo.clone(this.attrs);
		cell.isHeaderCell = this.isHeaderCell;
		return cell;
	},

	parseDom: function(td)
	{
		var self = this;
		dojo.forEach(td.attributes, function(attr)
		{
			var name = attr.name;
			if (name == "id")
				self.id = attr.value;
			else
			{
				self.attrs[name] = attr.value;
			}
		});
		this.content = td.innerHTML;
	},

	toJson: function()
	{
		return {
			id: this.id,
			isHeaderCell: this.isHeaderCell,
			attrs: dojo.clone(this.attrs),
			content: this.content
		};
	},

	constructor: function(jsonCell)
	{
		this.attrs = {};
		if (jsonCell)
		{
			this.id = jsonCell.id;
			this.attrs = jsonCell.attrs;
			this.content = jsonCell.content;
			this.isHeaderCell = jsonCell.isHeaderCell;
		}
		// normalize
		if (this.attrs.rowspan)
		{
			this.attrs.rowSpan = this.attrs.rowspan;
			delete this.attrs.rowspan;
		}
		if (this.attrs.colspan)
		{
			this.attrs.colSpan = this.attrs.colspan;
			delete this.attrs.colspan;
		}
	},

	getHTML: function()
	{
		var tagName = this.isHeaderCell ? "th" : "td";
		var cell = this._gartherAttrs(null, null, tagName);
		cell += this.content;
		cell += '</' + tagName + '>';

		return cell;
	}

});