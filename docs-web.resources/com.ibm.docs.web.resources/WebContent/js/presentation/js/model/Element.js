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

dojo.provide("pres.model.Element");
dojo.require("pres.model.Attrable");
dojo.require("pres.model.Htmlable");
dojo.require("pres.utils.helper");

dojo.declare("pres.model.Element", [pres.model.Attrable, pres.model.Htmlable], {

	id: "",
	content: "",
	isNotes: false,

	w: 0,
	h: 0,
	t: 0,
	l: 0,
	z: 0,

	family: "",
	parent: null,

	isValid: function()
	{
		return this.id && this.parent && this.w >= 0 && this.h >= 0 && this.z >= 0;
	},

	toJson: function()
	{
		var result = {
			id: this.id,
			type: "element",
			content: this.content,
			isNotes: this.isNotes,
			attrs: dojo.clone(this.attrs),
			w: this.w,
			h: this.h,
			t: this.t || 0,
			l: this.l || 0,
			z: this.z,
			family: this.family
		};

		if (this.parent)
		{
			result.slideH = this.parent.h;
			result.slideW = this.parent.w;
		}
		return result;
	},

	constructor: function(json)
	{
		this.attrs = {};

		if (json)
		{
			this.content = json.content;
			this.attrs = json.attrs;
			this.id = json.id;
			this.w = json.w;
			this.h = json.h;
			this.t = json.t || 0;
			this.l = json.l || 0;
			this.z = json.z;
			this.isNotes = json.isNotes || false;
			this.family = json.family;
			this.table = json.table;
		}
	},

	clone: function()
	{
		var element = new pres.model.Element();
		element.attrs = dojo.clone(this.attrs);
		element.family = this.family;
		element.content = this.content;
		element.w = this.w;
		element.h = this.h;
		element.t = this.t || 0;
		element.l = this.l || 0;
		element.z = this.z;
		element.isNotes = this.isNotes;

		element.id = this.id;

		return element;
	},

	getIndex: function()
	{
		var slide = this.parent;
		var eles = slide.elements;
		for ( var i = 0, len = eles.length; i < len; i++)
		{
			var ele = eles[i];
			if (this.id == ele.id)
				return i;
		}
		return -1;
	},

	getFamily: function()
	{
		return this.family;
	},

	getParent: function()
	{
		return this.parent;
	},

	hasComment: function(commentId)
	{
		if (!commentId)
		{
			return false;
		}
		var commentsid = this.attr("commentsid");
		if (commentsid)
		{
			commentsid = dojo.trim(commentsid);
			if (commentsid.indexOf(commentId) >= 0)
			{
				return true;
			}
		}
		return false;
	},
	nextSibling: function()
	{
		if (this.parent)
		{
			var eles = this.parent.elements;
			var index = dojo.indexOf(eles, this);
			if (index > -1 && index < eles.length - 1)
				return eles[index + 1];
		}
		return null;
	},

	getHTML: function()
	{
		var div = this._gartherAttrs(this.getPositionStyle());
		div += this.content;
		div += "</div>";
		return div;
	},

	setContent: function(html, eventSource)
	{
		this.content = html;
		if (this.parent && this.parent instanceof pres.model.Element)
			dojo.publish("/element/content/changed", [this.parent, eventSource]);
		else
			dojo.publish("/element/content/changed", [this, eventSource]);
	},

	updateWH: function(w, h, eventSource)
	{
		this.w = w;
		this.h = h;
		this.attr("style", this.getFinalStyle());
		dojo.publish("/element/style/changed", [this, eventSource]);
	},

	updatePosAttr: function(w, h, t, l, z, eventSource)
	{
		this.w = w;
		this.h = h;
		this.t = t;
		this.l = l;
		this.z = z;
		this.attr("style", this.getFinalStyle());
		dojo.publish("/element/style/changed", [this, eventSource]);
	},
	
	updateTransform: function(box)
	{
		var value = box.domNode.style.transform;
		var styles = pres.utils.htmlHelper.extractStyle(this.attrs.style);
		if(value)
		{
			styles["transform"] = value;
			styles["-webkit-transform"] = value;
			styles["-ms-transform"] = value;
			styles["-moz-transform"] = value;
		}
		else
		{
			delete styles["transform"];
			delete styles["-webkit-transform"];
			delete styles["-ms-transform"];
			delete styles["-moz-transform"];
		}
		
		this.attrs.style = pres.utils.htmlHelper.stringStyle(styles);
		
		if (this.family == "group")
		{		
			if (this.txtBox)
				this.txtBox.setContent(box.getSubContent());
		}
		else if (this.family == "text")
		{
			this.setContent(box.getContent());
		}
		
		dojo.publish("/element/style/changed", [this, null]);
	},

	getFinalStyle: function()
	{
		var positionStyle = this.getPositionStyle();
		var oStyle = this.attr("style") || "";
		var value = oStyle + ";" + positionStyle;
		var style = pres.utils.htmlHelper.extractStyle(value);
		value = "";
		for ( var s in style)
		{
			if (value)
				value += ";";
			value += s + ":" + style[s];
		}
		return value;
	},

	getPositionStyle: function()
	{
		var slide = this.parent;
		var w = (this.w * 100 / slide.w) + "%";
		var l = (this.l * 100 / slide.w) + "%";
		var t = (this.t * 100 / slide.h) + "%";
		var h = (this.h * 100 / slide.h) + "%";
		var str = "position:absolute;top:" + t + ";width:" + w + ";left:" + l + ";height:" + h + ";z-index:" + this.z;
		return str;
	},

	attachParent: function()
	{

	}

});
