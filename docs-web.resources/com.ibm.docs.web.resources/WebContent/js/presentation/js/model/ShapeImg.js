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

dojo.provide("pres.model.ShapeImg");

dojo.require("pres.model.Attrable");
dojo.require("pres.model.Htmlable");
dojo.require("pres.utils.helper");

dojo.declare("pres.model.ShapeImg", [pres.model.Attrable, pres.model.Htmlable], {
	constructor: function(json, parent)
	{
		if (parent)
			this.parent = parent;
		this.attrs = {};
		if (json)
		{
			this.id = json.id; // img node id
			this.divId = json.divId; // group frame id
			this.attrs = json.attrs;
		}
	},

	isValid: function()
	{
		return this.id && this.divId;
	},

	clone: function()
	{
		var obj = new pres.model.ShapeImg();
		obj.id = this.id;
		obj.divId = this.divId;
		obj.attrs = dojo.clone(this.attrs);
		return obj;
	},

	toJson: function()
	{
		var json = {
			id: this.id,
			divId: this.divId,
			attrs: dojo.clone(this.attrs)
		};
		return json;
	},

	getHTML: function(others)
	{
		var html = '<div';
		html += ' id="' + this.divId + '"';
		// TODO: maybe boxId need be added
		html += ' class="g_draw_frame bc" style="position:absolute;left:0%;top:0%;width:100%;height:100%;" presentation_class="graphic" text_anchor-type="paragraph" draw_layer="layout" tabindex="0"';
		html += '>';
		
		var tag = 'img';
		html += this._gartherAttrs(null, null, tag);
		html += '</' + tag + '>';
		
		if(others)
		{
			dojo.forEach(others, function(ot){
				
				var tagName = ot.tagName;
				
				var str = tagName ? ("<" + tagName) : "<div";
				var map = ot.attrs;
				for ( var x in map)
				{
					var span = " " + x + "=\"" + map[x] + "\"";
					str += span;
				}
				str += ">";
				str += ot.content || "";
				
				str += tagName ? ("</" + tagName) : "</div";
				str += ">";
				
				html+=str;
			});
		}
		
		html+='</div>';

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
			else
			{
				me.attrs[name] = attr.value;
			}
		});
	}
});