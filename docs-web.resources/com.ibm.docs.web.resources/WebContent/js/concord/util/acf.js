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

dojo.provide("concord.util.acf");
dojo.require("concord.util.HtmlTagParser");
dojo.require("dojox.xmpp.util");
dojo.require("dojox.encoding.base64");

/*
 * provide utility functions to detect malicious content in html fragment and attributes
 * criteria see concord-acf-config.xml
 */
//attribute names which are not allowed
concord.util.acf.REGEXP_ATTR_NAME_FILTER = /^(on.+|\$\{.+|fscommand.*|seeksegmenttime.*)/;
//attribute names that need to check value
concord.util.acf.REGEXP_ATTR_NAME_NEEDCHECK = /^(src|href|style|value|background|dynsrc|lowsrc|flashvars|pluginspage|data|action|method|formaction)$/;
//attribute value that should not contain
concord.util.acf.REGEXP_ATTR_VALUE_FILTER = /javascript\:(?!void)|vbscript\:|livescript\:|data\:\s*?text\/html/;

concord.util.acf.REGEXP_FOR_TAG = /<\s*(?:(?:\/([^>]+)>)|(?:!--([\S|\s]*?)-->)|(?:([^\s>]+)\s*((?:(?:[^"'>]+)|(?:"[^"]*")|(?:\'[^']*'))*)\/?>))/g;
concord.util.acf.REGEXP_FOR_ATTR = /([\w\-:.]+)(?:(?:\s*=\s*(?:(?:"([^"]*)")|(?:'([^']*)')|([^\s>]+)))|(?=\s|$))/g;
concord.util.acf.REGEXP_SCRIPTTAG = /^<\s*script.*/;
concord.util.acf.REGEXP_ENCODED_VALUE_FILTER = /;base64,/;

concord.util.acf.suspiciousAttribute = function(name, value)
{
	var acf = concord.util.acf;

	var n = name.toLowerCase();
	if (acf.REGEXP_ATTR_NAME_FILTER.exec(n))
	{
		return true;
	}
	if (!value) return false;
	//value may be int here
	if (value.toString){
		value = value.toString();
	}
	var v = value.toLowerCase();
	if (acf.REGEXP_ATTR_NAME_NEEDCHECK.exec(n))
	{
		if (v.match(acf.REGEXP_ATTR_VALUE_FILTER))
			return true;
	}
	if(acf.REGEXP_ENCODED_VALUE_FILTER.exec(value))
	{
		var index = value.indexOf(';base64,');
		var encodedStr = value.substring(index+8).replace(/\s+/g,"");
		encodedStr = dojox.xmpp.util.Base64.decode(encodedStr); 
		if(encodedStr)
			return acf.suspiciousHtml(encodedStr);
	}
	
	return false;
};

/*
 * check if html fragment contains suspicious scripts
 * return: true means suspicious
 */
concord.util.acf.suspiciousHtml = function(html)
{
	if (!window.g_noimprove) return false;
	
	var parser = new concord.util.HtmlTagParser(html);
	try {
		var tag = null;
		while ((tag = parser.next()) != null)
		{
			var tagName = tag.getTagName();
			if ("script" == (tagName ? tagName.toLowerCase():''))
				return true;

			var attrs = tag.getAttributes();
			for (var j = 0; j < attrs.length; j++)
			{
				var attr = attrs[j];
				if (attr.name == null)
					continue;

				if (concord.util.acf.suspiciousAttribute(attr.name, attr.value))
					return true;
			}
		}
	}
	catch (e)
	{
		console.log("exception when parsing html", e);
	}
	return false;
};

concord.util.acf.escapeXml = function(str, noSingleQuotes, ignoreIE) {
	//summary:
	//	Adds escape sequences for special characters in XML: &<>"'
	//  Optionally skips escapes for single quotes
	str = str.replace(/&/gm, "&amp;").replace(/</gm, "&lt;").replace(/>/gm, "&gt;").replace(/"/gm, "&quot;");
//	str = str.replace(/\ /g,"&nbsp;");
	if (!noSingleQuotes) {
		str = str.replace(/'/gm, "&#39;");
	}		
		
	if((!ignoreIE) && dojo.isIE){
		str = str.replace(/ {2,}/gm, " ").replace(/ {0,}\n/gm, "<br/>");
	}else
		str = str.replace(/\n/gm, "<br/>");
		
	return str; // string
};
//@Deperated
concord.util.acf.suspiciousHtmlRegex = function(html)
{
	var acf = concord.util.acf;
	
	var h = html.toLowerCase();
	var tags = h.match(acf.REGEXP_FOR_TAG);
	if (tags)
	{
		for (var i=0; i < tags.length; i++)
		{
			var tag = tags[i];
			// check if it's a script tag
			if (tag.match(acf.REGEXP_SCRIPTTAG))
			{
				return true;
			}
			
			// check for attribute
			var attrs = tag.match(acf.REGEXP_FOR_ATTR);
			if (attrs)
			{
				for (var j = 0; j < attrs.length; j++)
				{
					var attr = attrs[j];
					var pair = attr.split("=", 2);
					if (!pair || pair.length < 2)
					{
						continue;
					}
					if (acf.suspiciousAttribute(pair[0], pair[1]))
					{
						return true;
					}
				}
			}
		}
	}
	return false;
};


