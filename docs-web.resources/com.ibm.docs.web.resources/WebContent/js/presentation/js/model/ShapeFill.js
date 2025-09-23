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

dojo.provide("pres.model.ShapeFill");

dojo.require("pres.model.Attrable");
dojo.require("pres.model.Htmlable");
dojo.require("pres.utils.helper");

dojo.declare("pres.model.ShapeFill", [pres.model.Attrable, pres.model.Htmlable], {
	constructor: function(json, parent)
	{
		if (parent)
			this.parent = parent;
		this.attrs = {};
		if (json)
		{
			this.id = json.id;
			// circle or rect
			this.type = json.type;
			this.attrs = json.attrs;
		}
	},

	clone: function()
	{
		var obj = new pres.model.ShapeFill();
		obj.id = this.id;
		obj.type = this.type;
		obj.attrs = dojo.clone(this.attrs);
		return obj;
	},

	toJson: function()
	{
		var json = {
			id: this.id,
			type: this.type,
			attrs: dojo.clone(this.attrs)
		};
		return json;
	},

	getHTML: function()
	{
		var html = this._gartherAttrs(null, null, this.type);
		html += '</' + this.type + '>';

		return html;
	},

	parseDom: function(elemDom)
	{
		this.type = elemDom.nodeName;

		var me = this;
		dojo.forEach(elemDom.attributes, function(attr)
		{
			var name = attr.name;
			if (name == "id")
				me.id = attr.value;
			else
			{
				var v = attr.value ? attr.value.replace(/\"/g, "") : attr.value;
				me.attrs[name] = v;
			}
		});
	}
});