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

dojo.provide("pres.model.ShapeProp");

dojo.require("pres.model.Attrable");
dojo.require("pres.model.Htmlable");
dojo.require("pres.utils.helper");

dojo.declare("pres.model.ShapeProp", [pres.model.Attrable, pres.model.Htmlable], {
	constructor: function(json, parent)
	{
		if (parent)
			this.parent = parent;
		this.attrs = {};
		if (json)
		{
			// linear gradient, radial gradient and pattern
			this.type = json.type;
			this.id = json.id;
			this.content = json.content;
			this.attrs = json.attrs;
		}
	},

	clone: function()
	{
		var obj = new pres.model.ShapeProp();
		obj.type = this.type;
		obj.id = this.id;
		obj.content = this.content;
		obj.attrs = dojo.clone(this.attrs);
		return obj;
	},

	toJson: function()
	{
		var json = {
			type: this.type,
			id: this.id,
			content: this.content,
			attrs: dojo.clone(this.attrs)
		};
		return json;
	},

	getHTML: function()
	{
		var html = this._gartherAttrs(null, null, this.type);
		html += this.content;
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
				me.attrs[name] = attr.value;
			}
		});

		this.content = elemDom.innerHTML;
	}
});