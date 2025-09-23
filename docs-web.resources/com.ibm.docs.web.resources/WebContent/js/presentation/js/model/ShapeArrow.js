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

dojo.provide("pres.model.ShapeArrow");

dojo.require("pres.model.Attrable");
dojo.require("pres.model.Htmlable");
dojo.require("pres.utils.helper");

dojo.declare("pres.model.ShapeArrow", [pres.model.Attrable, pres.model.Htmlable], {
	constructor: function(json, parent)
	{
		if (parent)
			this.parent = parent;
		this.attrs = {};
		if (json)
		{
			// type will be used when calculate path
			this.type = json.type;
			this.id = json.id;
			// triangle, arrow, stealth, diamond, oval
			// oval will be presented with a "circle"
			// Others will be presented with "path"
			if (json.path)
				this.path = json.path;
			else if (json.circle)
				this.circle = json.circle;
			this.attrs = json.attrs;
		}
	},

	clone: function()
	{
		var obj = new pres.model.ShapeArrow();
		obj.type = this.type;
		obj.id = this.id;
		if (this.path)
			obj.path = this.path;
		else if (this.circle)
			obj.circle = this.circle;
		obj.attrs = dojo.clone(this.attrs);
		return obj;
	},

	toJson: function()
	{
		var json = {
			type: this.type,
			id: this.id,
			attrs: dojo.clone(this.attrs)
		};

		if (this.path)
			json.path = this.path;
		else if (this.circle)
			json.circle = this.circle;

		return json;
	},

	getAttrsMap: function(scaleProps, forEdit)
	{
		var map = this.inherited(arguments);
		// Add path attribute
		if (this.path)
			map['d'] = this.path;
		return map;
	},

	getHTML: function()
	{
		var tag = 'path';
		if (this.circle == 1)
			tag = 'circle';
		var html = this._gartherAttrs(null, null, tag);
		html += '</' + tag + '>';

		return html;
	},

	updateShapePath: function(xRatio, yRatio)
	{
		if (xRatio != 1 || yRatio != 1)
		{
			// Scale all points in path
			if (this.path)
				this.path = pres.utils.shapeUtil.scaleCustomPath(this.path, xRatio, yRatio);
			else if (this.circle)
			{
				this.attr('cx', (this.attr('cx') * xRatio).toFixed(2));
				this.attr('cy', (this.attr('cy') * yRatio).toFixed(2));
				this.attr('r', (this.attr('r') * ((xRatio + yRatio) / 2)).toFixed(2));
			}
		}
	},

	calcPathFromGuide: function(headTailBasePoint, hasLargeCap, lineWidth, viewBox)
	{
		var path = pres.utils.shapeUtil.calcArrowPathFromGuide(headTailBasePoint, hasLargeCap, lineWidth, this.type, this.attr('kind'), viewBox);
		if (path)
		{
			if (this.path)
				this.path = path;
			if (this.circle)
			{
				this.attr('cx', path.cx);
				this.attr('cy', path.cy);
				this.attr('r', path.r);
			}
		}
	},

	parseDom: function(elemDom)
	{
		var id = elemDom.id;
		if (id.indexOf("head") >= 0)
			this.type = "head";
		else if (id.indexOf("tail") >= 0)
			this.type = "tail";

		var tagName = elemDom.nodeName;
		if (tagName.toLowerCase() == "path")
			this.path = dojo.attr(elemDom, "d");
		else if (tagName.toLowerCase() == "circle")
			this.circle = 1;

		var me = this;
		dojo.forEach(elemDom.attributes, function(attr)
		{
			var name = attr.name;
			if (name == "id")
				me.id = attr.value;
			else if (name == "d")
				;
			else
			{
				me.attrs[name] = attr.value;
			}
		});
	}
});