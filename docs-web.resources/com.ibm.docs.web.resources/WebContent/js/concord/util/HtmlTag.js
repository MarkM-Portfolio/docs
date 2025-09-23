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

dojo.provide("concord.util.HtmlTag");
dojo.provide("concord.util.HtmlTag.Attribute");

dojo.declare("concord.util.HtmlTag", null, {
	tagName: null,
	attributes: null,

	constructor: function()
	{
		this.tagName = "";
		this.attributes = new Array();
	},

	getTagName: function()
	{
		return this.tagName;
	},

	setTagName: function(t)
	{
		this.tagName = t;
	},

	getAttributes: function()
	{
		return this.attributes;
	},

	addAttribute: function(n, v)
	{
		var attr = new concord.util.HtmlTag.Attribute(n, v);
		this.attributes.push(attr);
	}
});

dojo.declare("concord.util.HtmlTag.Attribute", null, {
	name: null,
	value: null,
	constructor: function(n, v)
	{
		this.name = n;
		this.value = v;
	}
});
