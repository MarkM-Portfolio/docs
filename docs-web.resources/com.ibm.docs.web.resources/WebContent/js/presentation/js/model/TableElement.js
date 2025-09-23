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

dojo.provide("pres.model.TableElement");

dojo.require("pres.model.Table");
dojo.require("pres.utils.helper");
/**
 * stands for table draw frame node
 */
dojo.declare("pres.model.TableElement", [pres.model.Element], {
	table: null,

	toJson: function()
	{
		var result = this.inherited(arguments);
		result.table = this.table.toJson();
		return result;
	},

	constructor: function(json)
	{
		if (json)
		{
			this.table = new pres.model.Table(json.table);
			this.table.parent = this;
			this.table.normalize();
		}
	},

	clone: function()
	{
		var element = new pres.model.TableElement();
		element.attrs = dojo.clone(this.attrs);
		element.family = this.family;
		element.w = this.w;
		element.h = this.h;
		element.t = this.t;
		element.l = this.l;
		element.z = this.z;
		element.isNotes = this.isNotes;

		element.id = this.id;
		element.parent = this.parent;
		element.table = this.table.clone();
		element.table.parent = element;
		return element;
	},

	attachParent: function()
	{
		if (this.table.rows)
		{
			dojo.forEach(this.table.rows, dojo.hitch(this, function(row)
			{
				if (row.cells)
				{
					dojo.forEach(row.cells, function(cell)
					{
						cell.parent = row;
					});
				}
				row.parent = this.table;
			}));
		}
		this.table.parent = this;
	},

	// output drawframe.outerHTML
	getHTML: function()
	{
		var slide = this.parent;
		var div = this._gartherAttrs(this.getPositionStyle());
		div += this.table.getHTML(slide.h, slide.w);
		div += '</div>';
		return div;
	}
});