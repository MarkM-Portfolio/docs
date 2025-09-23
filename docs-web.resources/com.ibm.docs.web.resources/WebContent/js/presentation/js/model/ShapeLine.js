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

dojo.provide("pres.model.ShapeLine");

dojo.require("pres.model.Attrable");
dojo.require("pres.model.Htmlable");
dojo.require("pres.utils.helper");

dojo.declare("pres.model.ShapeLine", [pres.model.Attrable, pres.model.Htmlable], {
	constructor: function(json, parent)
	{
		if (parent)
			this.parent = parent;
		this.attrs = {};
		if (json)
		{
			this.id = json.id;
			this.attrs = json.attrs;
		}
	},

	clone: function()
	{
		var obj = new pres.model.ShapeLine();
		obj.id = this.id;
		obj.attrs = dojo.clone(this.attrs);
		return obj;
	},

	toJson: function()
	{
		var json = {
			id: this.id,
			attrs: dojo.clone(this.attrs)
		};
		return json;
	},

	getAttrsMap: function(scaleProps, forEdit)
	{
		var map = this.inherited(arguments);
		// Path is not saved for shape components
		// It is saved in Shape class
		map['d'] = this.parent.path;
		return map;
	},

	getHTML: function()
	{
		var tag = 'path';
		var html = this._gartherAttrs(null, null, tag);
		html += '</' + tag + '>';

		return html;
	},

	parseDom: function(elemDom)
	{
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