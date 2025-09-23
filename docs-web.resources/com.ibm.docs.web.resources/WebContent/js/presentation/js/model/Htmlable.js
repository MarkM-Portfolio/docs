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

dojo.provide("pres.model.Htmlable");
dojo.declare("pres.model.Htmlable", null, {

	getHTML: function()
	{
		return "";
	},

	toDom: function(parent)
	{
		var html = this.getHTML.apply(this, arguments);
		return dojo.create("div", {
			style: {
				display: "none"
			},
			innerHTML: this.getHTML(arguments)
		}, parent);
	},

	getAttrsMap: function(scaleProps, forEdit)
	{
		var map = {
			id: this.id
		};
		var hasStyle = false;
		var isSlide = this instanceof pres.model.Slide;
		var defaultSlideStyle = "width:100%;height:100%;font-size:100%;top:0;left:0;position:relative";
		for ( var x in this.attrs)
		{
			if (x)
			{
				var value = this.attrs[x];
				if (x == "style")
					hasStyle = true;
				if (x == "style" && forEdit)
				{
					value = defaultSlideStyle;
				}
				else if (x == "style" && scaleProps)
				{
					var isString = dojo.isString(scaleProps);
					if (isString)
						value += ";" + scaleProps;
					var style = pres.utils.htmlHelper.extractStyle(value);
					if (!isString)
						dojo.mixin(style, scaleProps);
					value = "";
					for ( var s in style)
					{
						if (value)
							value += ";";
						value += s + ":" + style[s];
					}
				}
				map[x] = value;
			}
		}
		if (isSlide && !hasStyle)
			map["style"] = defaultSlideStyle;
		return map;
	},

	_gartherAttrs: function(scaleProps, forEdit, tagName)
	{
		var str = tagName ? ("<" + tagName) : "<div";
		var map = this.getAttrsMap(scaleProps, forEdit);
		for ( var x in map)
		{
			//IE added "" for <uri> in attribute when parse HTML. e.g. clip-path="url("#svg_clippath_fill_id_7039def35817")"
			//remove the unnecessay "" to normalize the html code
			var v = map[x] + "";
			v = v.replace(/\"/g, "");
			var span = " " + x + "=\"" + v + "\"";
			str += span;
		}
		str += ">";
		return str;
	}
});