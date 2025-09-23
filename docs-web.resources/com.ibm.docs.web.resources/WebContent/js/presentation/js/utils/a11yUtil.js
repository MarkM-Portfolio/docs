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

dojo.provide("pres.utils.a11yUtil");

pres.utils.a11yUtil = {

	enabled: true,
	thumbnail_prefix: "_" + new Date().valueOf() + "_",

	addPrefixId: function(dom)
	{
		var p = this.thumbnail_prefix;
		
		if (!this.enabled)
			return dom;
		
		if (dom === null || dom === undefined)
			return dom;
		
		if (dom && dom.nodeType)
		{
			dojo.forEach(dojo.query("[id]", dom), function(node)
			{
				node.id = p + node.id;
			});
			var me = this;
			var attrs = ["clip-path", "fill", "stroke"];
			var svgs = dojo.query("svg", dom);
			dojo.forEach(svgs, function(svg){
				dojo.forEach(attrs, function(attr){
					var selector = "["+ attr +"]";
					dojo.forEach(dojo.query(selector, svg), function(node){
						var value = dojo.attr(node, attr);
						if (value)
						{
							value = value.replace(/[\"\']/g, "");
							if (value && (value.indexOf("url(#") == 0))
							{
								var newValue = me.correctSVGIdRef(value);
								dojo.attr(node, attr, newValue);
							}
						}
					});
				});
			});
			return dom;
		}
		else if (dojo.isString(dom))
		{
			return p + dom;
		}
		else
			return dom;
	},
	
	correctSVGIdRef: function(value)
	{
		var result = null;
		var start = value.indexOf('url(#');
		var end = value.indexOf(')');
		if (start >= 0 && end > 0)
		{
			value = this.thumbnail_prefix + value.slice(start + 5, end);
			result = "url(#" + value + ")";
		}
		else
		{
			result = value;
		}
		return result;
	}

};