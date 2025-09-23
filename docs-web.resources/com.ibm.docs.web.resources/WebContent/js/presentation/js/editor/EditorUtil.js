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

dojo.provide("pres.editor.EditorUtil");
dojo.require("pres.editor.EditorUtilNumber");
dojo.require("pres.editor.EditorUtilList");

dojo.require("pres.utils.tableUtil");

dojo.declare("pres.editor.EditorUtil", [pres.editor.EditorUtilNumber, pres.editor.EditorUtilList], {


	backgroudColorCssMap : [
        {r:240,g:248,b:255,css:"selcover_aliceblue"},
        {r:250,g:235,b:215,css:"selcover_antiquewhite"},
        {r:0,g:255,b:255,css:"selcover_aqua"},
        {r:127,g:255,b:212,css:"selcover_aquamarine"},
        {r:240,g:255,b:255,css:"selcover_azure"},
        {r:245,g:245,b:220,css:"selcover_beige"},
        {r:255,g:228,b:196,css:"selcover_bisque"},
        {r:0,g:0,b:0,css:"selcover_black"},
        {r:255,g:235,b:205,css:"selcover_blanchedalmond"},
        {r:0,g:0,b:255,css:"selcover_blue"},
        {r:138,g:43,b:226,css:"selcover_blueviolet"},
        {r:165,g:42,b:42,css:"selcover_brown"},
        {r:222,g:184,b:135,css:"selcover_burlywood"},
        {r:95,g:158,b:160,css:"selcover_cadetblue"},
        {r:127,g:255,b:0,css:"selcover_chartreuse"},
        {r:210,g:105,b:30,css:"selcover_chocolate"},
        {r:255,g:127,b:80,css:"selcover_coral"},
        {r:100,g:149,b:237,css:"selcover_cornflowerblue"},
        {r:255,g:248,b:220,css:"selcover_cornsilk"},
        {r:220,g:20,b:60,css:"selcover_crimson"},
        {r:0,g:255,b:255,css:"selcover_cyan"},
        {r:0,g:0,b:139,css:"selcover_darkblue"},
        {r:0,g:139,b:139,css:"selcover_darkcyan"},
        {r:184,g:134,b:11,css:"selcover_darkgoldenrod"},
        {r:169,g:169,b:169,css:"selcover_darkgray"},
        {r:0,g:100,b:0,css:"selcover_darkgreen"},
        {r:189,g:183,b:107,css:"selcover_darkkhaki"},
        {r:139,g:0,b:139,css:"selcover_darkmagenta"},
        {r:85,g:107,b:47,css:"selcover_darkolivegreen"},
        {r:255,g:140,b:0,css:"selcover_darkorange"},
        {r:153,g:50,b:204,css:"selcover_darkorchid"},
        {r:139,g:0,b:0,css:"selcover_darkred"},
        {r:233,g:150,b:122,css:"selcover_darksalmon"},
        {r:143,g:188,b:143,css:"selcover_darkseagreen"},
        {r:72,g:61,b:139,css:"selcover_darkslateblue"},
        {r:47,g:79,b:79,css:"selcover_darkslategray"},
        {r:0,g:206,b:209,css:"selcover_darkturquoise"},
        {r:148,g:0,b:211,css:"selcover_darkviolet"},
        {r:255,g:20,b:147,css:"selcover_deeppink"},
        {r:0,g:191,b:255,css:"selcover_deepskyblue"},
        {r:105,g:105,b:105,css:"selcover_dimgray"},
        {r:30,g:144,b:255,css:"selcover_dodgerblue"},
        {r:209,g:146,b:117,css:"selcover_feldspar"},
        {r:178,g:34,b:34,css:"selcover_firebrick"},
        {r:255,g:250,b:240,css:"selcover_floralwhite"},
        {r:34,g:139,b:34,css:"selcover_forestgreen"},
        {r:255,g:0,b:255,css:"selcover_fuchsia"},
        {r:220,g:220,b:220,css:"selcover_gainsboro"},
        {r:248,g:248,b:255,css:"selcover_ghostwhite"},
        {r:255,g:215,b:0,css:"selcover_gold"},
        {r:218,g:165,b:32,css:"selcover_goldenrod"},
        {r:128,g:128,b:128,css:"selcover_gray"},
        {r:0,g:128,b:0,css:"selcover_green"},
        {r:173,g:255,b:47,css:"selcover_greenyellow"},
        {r:240,g:255,b:240,css:"selcover_honeydew"},
        {r:255,g:105,b:180,css:"selcover_hotpink"},
        {r:205,g:92,b:92,css:"selcover_indianred "},
        {r:75,g:0,b:130,css:"selcover_indigo"},
        {r:255,g:255,b:240,css:"selcover_ivory"},
        {r:240,g:230,b:140,css:"selcover_khaki"},
        {r:230,g:230,b:250,css:"selcover_lavender"},
        {r:255,g:240,b:245,css:"selcover_lavenderblush"},
        {r:124,g:252,b:0,css:"selcover_lawngreen"},
        {r:255,g:250,b:205,css:"selcover_lemonchiffon"},
        {r:173,g:216,b:230,css:"selcover_lightblue"},
        {r:240,g:128,b:128,css:"selcover_lightcoral"},
        {r:224,g:255,b:255,css:"selcover_lightcyan"},
        {r:250,g:250,b:210,css:"selcover_lightgoldenrodyellow"},
        {r:211,g:211,b:211,css:"selcover_lightgrey"},
        {r:144,g:238,b:144,css:"selcover_lightgreen"},
        {r:255,g:182,b:193,css:"selcover_lightpink"},
        {r:255,g:160,b:122,css:"selcover_lightsalmon"},
        {r:32,g:178,b:170,css:"selcover_lightseagreen"},
        {r:135,g:206,b:250,css:"selcover_lightskyblue"},
        {r:132,g:112,b:255,css:"selcover_lightslateblue"},
        {r:119,g:136,b:153,css:"selcover_lightslategray"},
        {r:176,g:196,b:222,css:"selcover_lightsteelblue"},
        {r:255,g:255,b:224,css:"selcover_lightyellow"},
        {r:0,g:255,b:0,css:"selcover_lime"},
        {r:50,g:205,b:50,css:"selcover_limegreen"},
        {r:250,g:240,b:230,css:"selcover_linen"},
        {r:255,g:0,b:255,css:"selcover_magenta"},
        {r:128,g:0,b:0,css:"selcover_maroon"},
        {r:102,g:205,b:170,css:"selcover_mediumaquamarine"},
        {r:0,g:0,b:205,css:"selcover_mediumblue"},
        {r:186,g:85,b:211,css:"selcover_mediumorchid"},
        {r:147,g:112,b:216,css:"selcover_mediumpurple"},
        {r:60,g:179,b:113,css:"selcover_mediumseagreen"},
        {r:123,g:104,b:238,css:"selcover_mediumslateblue"},
        {r:0,g:250,b:154,css:"selcover_mediumspringgreen"},
        {r:72,g:209,b:204,css:"selcover_mediumturquoise"},
        {r:199,g:21,b:133,css:"selcover_mediumvioletred"},
        {r:25,g:25,b:112,css:"selcover_midnightblue"},
        {r:245,g:255,b:250,css:"selcover_mintcream"},
        {r:255,g:228,b:225,css:"selcover_mistyrose"},
        {r:255,g:228,b:181,css:"selcover_moccasin"},
        {r:255,g:222,b:173,css:"selcover_navajowhite"},
        {r:0,g:0,b:128,css:"selcover_navy"},
        {r:253,g:245,b:230,css:"selcover_oldlace"},
        {r:128,g:128,b:0,css:"selcover_olive"},
        {r:107,g:142,b:35,css:"selcover_olivedrab"},
        {r:255,g:165,b:0,css:"selcover_orange"},
        {r:255,g:69,b:0,css:"selcover_orangered"},
        {r:218,g:112,b:214,css:"selcover_orchid"},
        {r:238,g:232,b:170,css:"selcover_palegoldenrod"},
        {r:152,g:251,b:152,css:"selcover_palegreen"},
        {r:175,g:238,b:238,css:"selcover_paleturquoise"},
        {r:216,g:112,b:147,css:"selcover_palevioletred"},
        {r:255,g:239,b:213,css:"selcover_papayawhip"},
        {r:255,g:218,b:185,css:"selcover_peachpuff"},
        {r:205,g:133,b:63,css:"selcover_peru"},
        {r:255,g:192,b:203,css:"selcover_pink"},
        {r:221,g:160,b:221,css:"selcover_plum"},
        {r:176,g:224,b:230,css:"selcover_powderblue"},
        {r:128,g:0,b:128,css:"selcover_purple"},
        {r:255,g:0,b:0,css:"selcover_red"},
        {r:188,g:143,b:143,css:"selcover_rosybrown"},
        {r:65,g:105,b:225,css:"selcover_royalblue"},
        {r:139,g:69,b:19,css:"selcover_saddlebrown"},
        {r:250,g:128,b:114,css:"selcover_salmon"},
        {r:244,g:164,b:96,css:"selcover_sandybrown"},
        {r:46,g:139,b:87,css:"selcover_seagreen"},
        {r:255,g:245,b:238,css:"selcover_seashell"},
        {r:160,g:82,b:45,css:"selcover_sienna"},
        {r:192,g:192,b:192,css:"selcover_silver"},
        {r:135,g:206,b:235,css:"selcover_skyblue"},
        {r:106,g:90,b:205,css:"selcover_slateblue"},
        {r:112,g:128,b:144,css:"selcover_slategray"},
        {r:255,g:250,b:250,css:"selcover_snow"},
        {r:0,g:255,b:127,css:"selcover_springgreen"},
        {r:70,g:130,b:180,css:"selcover_steelblue"},
        {r:210,g:180,b:140,css:"selcover_tan"},
        {r:0,g:128,b:128,css:"selcover_teal"},
        {r:216,g:191,b:216,css:"selcover_thistle"},
        {r:255,g:99,b:71,css:"selcover_tomato"},
        {r:64,g:224,b:208,css:"selcover_turquoise"},
        {r:238,g:130,b:238,css:"selcover_violet"},
        {r:208,g:32,b:144,css:"selcover_violetred"},
        {r:245,g:222,b:179,css:"selcover_wheat"},
        {r:255,g:255,b:255,css:"selcover_white"},
        {r:245,g:245,b:245,css:"selcover_whitesmoke"},
        {r:255,g:255,b:0,css:"selcover_yellow"},
        {r:154,g:205,b:50,css:"selcover_yellowgreen"}
	],
	
	STR_XLINK : "xh@",
	
	mTableUtil: pres.utils.tableUtil,

	extractEmailLinkInfo : function(strHyperLink)
	{
		var strMailTo = "mailto:";
		var strSubject= "?subject=";
		if(strHyperLink.indexOf(strMailTo) != 0)
			return null;
		var offsetSubject = strHyperLink.indexOf(strSubject);
		if(offsetSubject<0)
			offsetSubject = strHyperLink.length;
		//href="mailto:qwe@cn.com?subject=aavv"
		var info = {address:null,subject:null}
		info.address = strHyperLink.substr(strMailTo.length,offsetSubject-strMailTo.length);
		info.subject = "";
		if(strHyperLink.indexOf(strSubject)>0)
			info.subject = strHyperLink.substr(strHyperLink.indexOf(strSubject)+strSubject.length);
		return info;
	},

	_percentToFloat: function(str)
	{
		var ndx = str.indexOf('%');
		if (ndx >= 0)
		{
			var re = str.substring(0, ndx);
			re = parseFloat(re) / 100.0;
			return re;
		}
		return NaN;
	},
	// ////////////////////////////////////////////////////////////////

	// Presentation use get list class
	// return is object,contain list class inline class and masgter class
	// node is li,ou,ol,p
	getLineClass: function(liNode)
	{
		var regx = [/^IL_/g, /^lst-/g, /^MP_/g, /^ML_/g, /^MT_/g];
		var regxLst_MR = /^lst-MR-/g;
		var listClass = [];
		var listMRClass = [];
		for ( var r = 0; r < regx.length; r++)
		{
			var tl = [];
			listClass[r] = tl;
		}

		if (!liNode)
			return "";

		if (!this.is(liNode, 'li', 'ol', 'ul', 'p'))
		{
			// debugger;
			return "";
		}
		var target = this.is(liNode, 'li', 'p') ? liNode : liNode.firstChild;

		var cls = this.getAttribute(target, 'class');

		if (cls == undefined || cls == null)
		{
			cls = " ";
		}
		var listClasses = cls.split(' ');
		for ( var j = 0; j < listClasses.length; j++)
		{
			if (listClasses[j].match(regxLst_MR))
			{
				listMRClass.push(listClasses[j]);
			}
			else
			{
				for ( var r = 0; r < regx.length; r++)
					if (listClasses[j].match(regx[r]) && !(listClasses[j].match(regxLst_MR)))
					{
						listClass[r].push(listClasses[j]);
					}
			}
		}

		return {
			inlineClass: listClass[0],// /^IL_/g,
			listClass: listClass[1],// /^lst-/g,
			listMRClass: listMRClass,// /^lst-MR/g
			masterParagraphClass: listClass[2],// /^MP_/g,
			masterListClass: listClass[3],// ^ML_/g,
			masterTextClass: listClass[4]
		// ^MT_/g
		};
	},

	// Input a cursor container node, return the line node contain the node
	// return result must be "p/li/ol/ul"
	getBlock: function(cursorNode)
	{
		while (cursorNode && ((cursorNode.nodeType === EditorUtil.NODE_TEXT) || this.is(cursorNode, 'span', 'a')))
			cursorNode = cursorNode.parentNode;

		return cursorNode;
	},

	getLineInfo: function(liNode)
	{
		if (!liNode || !this.is(liNode, 'ol', 'ul', 'p', 'li'))
		{
			return null;
		}
		var aline = liNode;
		var alineItem = null;
		if (this.is(liNode, 'li'))
		{
			alineItem = liNode;
			aline = liNode.parentNode;
			if (!this.is(aline, 'ol', 'ul'))
			{
				return null;
			}
		}
		else if (this.is(liNode, 'p'))
		{
			aline = liNode;
			alineItem = liNode;
		}
		else if (this.is(liNode, 'ol', 'ul'))
		{
			aline = liNode;
			alineItem = liNode.firstChild;
			if (!this.is(alineItem, 'li'))
			{
				// Error!
				// debugger;
				return null;
			}
		}

		return {
			line: aline, // <P><ol><ul>
			lineItem: alineItem, // <P><li>
			index: this.getIndex(aline)
		};
	},

	// /////////////////////////////////////////////////////////////////////////////////////////////////////
	// Utility functions
	is: function(node, strName)
	{
		if (!node || !strName)
			return false;
		var nodeName = node.nodeName.toLowerCase();
		if (node.nodeType === EditorUtil.NODE_ELEMENT)
		{
			var args = Array.prototype.slice.call(arguments, 1);
			for ( var i = 0, len = args.length; i < len; i++)
			{
				if (!args[i])
					continue;
				var tmp = args[i].toLowerCase();
				if (nodeName == tmp)
					return true;
			}
		}
		else
		{// text node
			var args = Array.prototype.slice.call(arguments, 1);
			for ( var i = 0, len = args.length; i < len; i++)
			{
				if (!args[i])
					continue;
				var tmp = args[i].toLowerCase();
				if (tmp.toLowerCase() === "#text")
					return true;
			}
		}
		return false;
	},

	clone: function(srcNode, includeChildren, cloneId)
	{
		var $clone = srcNode.cloneNode(includeChildren);

		var removeIds = function(node)
		{
			if (node.nodeType != EditorUtil.NODE_ELEMENT)
				return;

			if (!cloneId)
				node.removeAttribute('id', false);

			if (includeChildren)
			{
				var childs = node.childNodes;
				for ( var i = 0; i < childs.length; i++)
					removeIds(childs[i]);
			}
		};

		// The "id" attribute should never be cloned to avoid duplication.
		removeIds($clone);

		return $clone;
	},

	getText: function(node)
	{
		var retString;
		if (dojo.isIE)
		{
			retString = node.innerText || node.nodeValue || node.textContent;
		}
		else
		{
			retString = node.textContent;
		}

		if (node.nodeType == EditorUtil.NODE_ELEMENT)
		{
			// NOTE:current string will change all '&nbsp;' to ' '
			// so we need correct them both for display and word break
			var strTwoWhiteSpace = ' ' + String.fromCharCode(160);
			// You should not use ' &nbsp;', since '&nbsp;' will be handle as string with length 6!
			retString = retString.replace(/  /g, strTwoWhiteSpace);

			// For the frist node, the first character should not be ' ', it must be '&nbsp;'
			// 32 is ' ',160 is '&nbsp;'
			if ((this.getIndex(node) == 0) && (retString.charCodeAt(0) == 32))
			{
				retString = String.fromCharCode(160) + retString.substring(1, retString.length);
			}
		}
		// remove 8203 & 65279
		retString = retString.replace(/\uFEFF/g, '');// 65279
		retString = retString.replace(/\u200B/g, '');// 8203
		if ((retString.length == 1) && ((retString.charCodeAt(0) == 8203) || (retString.charCodeAt(0) == 65279)))
			retString = "";
		return retString;
	},

	setText: function(node, text)
	{
		return (node.innerText != undefined) ? node.innerText = text : node.textContent = text;
	},

	getStyle: function(node, name)
	{
		return node.style[this.cssStyleToDomStyle(name)];
	},

	getIndex: function(node)
	{
		var current = node, index = 0;
		while (current && (current = current.previousSibling))
			index++;

		return index;
	},

	// <nodeA><nodeB>
	insertBefore: function(nodeA, nodeB)
	{
		nodeB.parentNode.insertBefore(nodeA, nodeB);
	},

	// <nodeB><nodeA>
	insertAfter: function(nodeA, nodeB)
	{
		nodeB.parentNode.insertBefore(nodeA, nodeB.nextSibling);
	},

	// move all child under source to under target
	moveChildren: function(source, target)
	{
		var $ = source;
		target = target;

		if ($ == target)
			return;

		var child;
		while ((child = $.firstChild))
			target.appendChild($.removeChild(child));
	},

	// check whether nodeA contains nodeB
	contains: dojo.isIE || dojo.isWebKit ? function(nodeA, nodeB)
	{
		//var $ = nodeA;
		var re = false;
		if(nodeB.nodeType != EditorUtil.NODE_ELEMENT)
		{
			re = nodeA.contains(nodeB.parentNode);
		}
		else if(nodeA != nodeB)
		{
			re = nodeA.contains(nodeB);
		}

		return re;
	} : function(nodeA, nodeB)
	{
		return !!(nodeA.compareDocumentPosition(nodeB) & 16);
	},

	getCommonAncestor: function(nodeA, nodeB)
	{
		if (nodeA === nodeB)
			return this;

		if (this.contains(nodeB, nodeA))
			return nodeB;

		var start = nodeA.nodeType == EditorUtil.NODE_ELEMENT ? nodeA : nodeA.parentNode;

		do
		{
			if (this.contains(start, nodeB))
				return start;
		}
		while ((start = start.parentNode));

		return null;
	},

	getAscendant: function(node, reference)
	{
		while (node)
		{
			if (this.is(node, reference))
				return node;
			node = node.parentNode;
		}
		return null;
	},

	hasAttribute: function(node, attrName)
	{
		function standard(node, name)
		{
			var $attr = node.attributes.getNamedItem(name);
			return !!($attr && $attr.specified);
		}

		return (dojo.isIE && dojo.isIE < 8) ? function(node, attrName)
		{
			// On IE < 8 the name attribute cannot be retrieved
			// right after the element creation and setting the
			// name with setAttribute.
			if (attrName == 'name')
				return !!node.name;

			return standard(node, attrName);
		} : standard(node, attrName);
	},

	replace: function(newNode, nodeToReplace)
	{
		this.insertBefore(newNode, nodeToReplace);
		dojo.destroy(nodeToReplace);
	},

	cssStyleToDomStyle: (function()
	{
		var test = document.createElement('div').style;

		var cssFloat = (typeof test.cssFloat != 'undefined') ? 'cssFloat' : (typeof test.styleFloat != 'undefined') ? 'styleFloat' : 'float';

		return function(cssName)
		{
			if (cssName == 'float')
				return cssFloat;
			else
			{
				return cssName.replace(/-./g, function(match)
				{
					return match.substr(1).toUpperCase();
				});
			}
		};
	})(),

	setStyle: function(node, name, value)
	{
		node.style[this.cssStyleToDomStyle(name)] = value;
		return this;
	},

	removeStyle: function(node, name)
	{
		this.setStyle(node, name, '');
		if (node.style.removeAttribute)
			node.style.removeAttribute(this.cssStyleToDomStyle(name));

		if (!node.style.cssText)
			this.removeAttribute(node, 'style');
	},

	getAttribute: function(node, name)
	{
		return node.getAttribute(name, 2);
	},

	setAttribute: function(node, name, value)
	{
		node.setAttribute(name, value);
	},

	/**
	 * Copy all the attributes from source node to dest node skipAttributes is an object with the attributes that must NOT be copied.
	 */
	copyAttributes: function(source, dest, skipAttributes)
	{
		var attributes = source.attributes;
		skipAttributes = skipAttributes || {};

		for ( var n = 0; n < attributes.length; n++)
		{
			var attribute = attributes[n];

			// Lowercase attribute name hard rule is broken for
			// some attribute on IE, e.g. CHECKED.
			var attrName = attribute.nodeName.toLowerCase(), attrValue;

			// We can set the type only once, so do it with the proper value, not copying it.
			if (attrName in skipAttributes)
				continue;

			if (attrName == 'checked' && (attrValue = this.getAttribute(source, attrName)))
				dest.setAttribute(attrName, attrValue);
			// IE BUG: value attribute is never specified even if it exists.
			else if (attribute.specified || (dojo.isIE && attribute.nodeValue && attrName == 'value'))
			{
				attrValue = this.getAttribute(source, attrName);
				if (attrValue === null)
					attrValue = attribute.nodeValue;

				dest.setAttribute(attrName, attrValue);
			}
		}

		// The style:
		if (source.style.cssText !== '')
			dest.style.cssText = source.style.cssText;
	},

	/**
	 * Removes an attribute from the element.
	 */
	removeAttribute: function(node, name)
	{
		node.removeAttribute(name);
	},

	removeAttributes: function(node, attributes)
	{
		if (attributes instanceof Array)
		{
			for ( var i = 0; i < attributes.length; i++)
				this.removeAttribute(node, attributes[i]);
		}
		else
		{
			for ( var attr in attributes)
				attributes.hasOwnProperty(attr) && this.removeAttribute(node, attr);
		}
	},

	/**
	 * Below funtion is to convert px to cm under 96dpi
	 * 
	 * @param px
	 * @return cm
	 */
	PxToCm: function(px)
	{
		return pres.utils.helper.px2cm(px);
		// var pt = px * 0.75;
		// var inch = pt / 72;
		// var cm = inch * 2.54;
		// return cm;
	},
	/**
	 * Convert em to cm
	 * 
	 * @param em
	 * @return cm
	 */
	EmToCm: function(em)
	{
		return em * 2.54 / 6;
	},
	/**
	 * Convert pt to cm
	 * 
	 * @param pt
	 * @return cm
	 */
	PtToCm: function(pt)
	{
		return pt * 2.54 / 72;
	},
	/**
	 * Convert pc to cm
	 * 
	 * @param pc
	 * @return cm
	 */
	PcToCm: function(pc)
	{
		return pc * 2.54 / 6;
	},
	/**
	 * convert a string to cm unit number for example: toCmValue('1.4cm' ) , result is 1.4 toCmValue( '10px' )
	 * 
	 * @param string
	 * @return float
	 */
	toCmValue: function(string)
	{
		var r = string.toLowerCase().match(/^(-?[\d|\.]*)(pc|px|pt|em|cm|in|mm)$/i);
		if (r && r.length == 3)
		{
			switch (r[2])
			{
				case 'px':
					return this.PxToCm(parseFloat(r[1]));
					break;
				case 'em':
					return this.EmToCm(parseFloat(r[1]));
					break;
				case 'pt':
					return this.PtToCm(parseFloat(r[1]));
					break;
				case 'pc':
					return this.PcToCm(parseFloat(r[1]));
					break;
				case 'in':
					return parseFloat(r[1]) * 2.54;
					break;
				case 'mm':
					return parseFloat(r[1]) / 10;
					break;
				case 'cm':
					return parseFloat(r[1]);
			}
		}
		return NaN;
	},

	injectRdomIdsForElement: function(element)
	{
		if (this.is(element, "br") && !dojo.hasClass(element, "hideInIE") && !dojo.hasClass(element, "text_line-break") && element.parentNode != null)
		{
			element.parentNode.removeChild(element);
		}
		// alert("elemntName:"+elementName);

		// do a setTimeout when calling MSGUTIL.getUUID()
		// to work around the issue of having the same UUID for consecutive elements
		// somehow there's a timing issue that creates same element id twice
		var idValue = this.getUUID();
		element.setAttribute("id", idValue);
		return idValue;
	},

	getUUID: function()
	{
		// if (this.mainId == '')
		// {
		// var id = pe.scene.CKEditor.document.getBody().getId();
		// if (id != null)
		// this.mainId = id;
		// }
		var seedA = Math.random().toString(16);
		var seedB = Math.random().toString(16);
		var uuid = seedA + seedB;
		uuid = uuid.replace(/0\./g, "");
		// return this.mainId + uuid.substring(0, 12);
		return "uuid_" + uuid.substring(0, 12);
	},

	isBlock: function(node)
	{
		if (!node)
			return false;

		var nodeName;
		if (typeof node == "string")
			nodeName = node.toLowerCase();
		else if (node.type == EditorUtil.NODE_ELEMENT)
			nodeName = node.nodeName;
		else if (node.type == EditorUtil.NODE_TEXT)
			return false;
		else
			return false;

		if (nodeName == 'div' && node.parentNode && this.is(node.parentNode, 'li'))
			return false;

		// var dtd = CKEDITOR.dtd;
		var isBlock = !this.is(node.parentNode, 'span', 'br', '#text');
		// dtd.$block[nodeName]
		// || dtd.$blockLimit[nodeName]
		// || dtd.$listItem[nodeName]
		// || dtd.$list[nodeName]
		// || dtd.$tableContent[nodeName];
		isBlock = isBlock || nodeName == 'html';

		return isBlock;
	},

	generateID: function(node, ids, force)
	{
		var isNeedIdNode = false;
		if (node.type == EditorUtil.NODE_TEXT || node.nodeName == "#comment" || node.nodeName == 'br')
			return isNeedIdNode;

		var id;
		ids = ids || {};

		id = node.id;
		var hasId = true;
		if (id == null)
		{
			hasId = false;
			isNeedIdNode = this.isBlock(node) || EditorUtil.is(node, 'img', 'a');
		}
		else if (id in ids)
			isNeedIdNode = true; // Duplicated ID, should be removed
		else
			ids[id] = 1; // Record the ID
		if (isNeedIdNode || (force && hasId))
		{
			id = this.getUUID();
			EditorUtil.setAttribute(node, 'id', id);
			ids[id] = 1;
		}

		for ( var i = 0; i < node.childNodes.length; i++)
			isNeedIdNode = this.generateID(node.childNodes[i], ids, force) || isNeedIdNode;

		return isNeedIdNode;
	},

	//
	// get CSS styles from CSS Styles
	// @ruleNames ['default-style','standard','xxx','xxx',........]
	// return array of css rules
	// using PresCKUtil.getCSSRules(['default-style','standard']);
	//
	getCSSRules: function(ruleNames, curDoc)
	{
		function isSearchedRule(cssRule, ruleNames,result)
		{
			if (cssRule.type == CSSRule.STYLE_RULE)
			{
				var curRuleName = cssRule.selectorText.toLowerCase();
				// remove ".concord ." of rule name
				var cRegex = /\s*.concord\s*./g;
				var match = curRuleName.match(cRegex);
				if (match && match.length > 0)
				{
					match = match[0];
					var n = curRuleName.indexOf(match);
					curRuleName = curRuleName.substring(n + match.length - 1);
				}

				for ( var i = 0; i < ruleNames.length; i++)
				{
					if (ruleNames[i] 
					&& (curRuleName.indexOf(ruleNames[i].toLowerCase())>=0)
							)
					{
						return true;
					}
				}
			}
			else if(cssRule.styleSheet)
			{
				parseStyleSheet(cssRule.styleSheet,result);
			}
			return false;
		}
		;

		function parseStyleSheet(styleSheet,result)
		{

			var ii = 0;
			var cssRule;
			do
			{
				try
				{
					if (styleSheet.cssRules)
						cssRule = styleSheet.cssRules[ii];
					else
						cssRule = styleSheet.rules[ii];
					if (cssRule && isSearchedRule(cssRule, ruleNames,result))
					{
						result.push({
							cssRule: cssRule,
							index: ii,
							styleSheet: styleSheet
						});
					}
				}
				catch (e)
				{

				}

				ii++;
			}
			while (cssRule);
		
		}
		
		function getMatchedRules()
		{
			var result = [];
			var allStyleSheets = curDoc ? curDoc.styleSheets : null;
			if (allStyleSheets)
			{


				for ( var i = 0; i < allStyleSheets.length; i++)
				{
					var styleSheet = allStyleSheets[i];
					if (styleSheet)
					{
						parseStyleSheet(styleSheet,result);
					}
				}
			
			
			}
			return result;
		}
		;

		if (!curDoc)
			curDoc = document;

		var result = getMatchedRules();
		return result;
	},

	// Check whether a node is an text empty node
	// Parameter:
	// node could be null
	// if could be <span>/<br>/<p>/<li>/<ol>/<ul>/<div>
	// Return [null] :something error
	// [true] :the node does not contain any visible text
	// [false] :the node contain any visible text
	// [Forbidden Change this function without Presentation Team agreement!!]
	isNodeTextEmpty: function(_Node)
	{
		function _isEmptyBr(br)
		{
			if (dojo.hasClass(br, "text_line-break"))
				return false;
			return true;
		}
		;

		function _isNotVisibleCharCode(charCode)
		{
			return (charCode === 8203 || charCode === 65279);
		}

		function _isEmptySpan(span, EUtil)
		{

			var copyspan = dojo.clone(span);
			var realyHtml = copyspan.outerHTML.replace(/<span[^>]+data-cke-bookmark[^<]*?<\/span>/ig, '');
			copyspan.innerHTML = realyHtml;
			var txt = EUtil.getText(copyspan);
			dojo.destroy(copyspan);
			if (!txt)
				return true;
			var isEmpty = true;
			for ( var i = 0; i < txt.length && isEmpty; i++)
			{
				var subStr = txt.substring(i, i + 1);
				if (subStr != '' && !_isNotVisibleCharCode(txt.charCodeAt(i)))
				{
					isEmpty = false;
				}
			}

			return isEmpty;
		}
		;

		function _isEmptyLineItem(lineItemNode, EUtil)
		{
			var result = false;
			// get p or li
			var node = EUtil.is(lineItemNode, 'ol', 'ul') ? lineItemNode.firstChild : lineItemNode;
			if (EUtil.is(node, 'p', 'li'))
			{
				var len = 0;
				var first = node.firstChild;
				while (first)
				{
					var text = EUtil.getText(first);
					// ignore 8203 length
					if (!(text.length == 1 && (text.charCodeAt(0) == 8203 || text.charCodeAt(0) == 65279)))
						len += text.length;
					if (EUtil.is(first, 'br') && dojo.hasClass(first, 'text_line-break'))
						len += 1;
					if (len > 0)
						break;
					first = first.nextSibling;
				}
				result = (len == 0);
			}
			return result;
		}
		;

		var node = _Node;
		if (!node)
			return true;
		if (!this.is(node, 'span', 'br', 'p', 'ol', 'ul', 'li', 'div'))
		{
			// debugger;
			return null;
		}

		if (this.is(node, 'br'))
			return _isEmptyBr(node);

		if (this.is(node, 'span'))
			return _isEmptySpan(node, this);

		if (this.is(node, 'a', 'p', 'ol', 'ul', 'li'))
			return _isEmptyLineItem(node, this);

		if (this.is(node, 'div'))
		{
			var lineElems = dojo.query("ol,ul,p", node);
			if (!lineElems.length)
				return true;
			for ( var i = 0; i < lineElems.length; i++)
			{
				var _ckElement = lineElems[i];
				if (!_isEmptyLineItem(_ckElement, this))
					return false;
			}

			return true;
		}
		return true;
	},

	convertFontsizeToPT: function(fontSize)
	{
		if (!fontSize)
		{
			return;
		}
		if (fontSize.toLowerCase().indexOf('px') != -1)
		{
			var fontSizeInPx = fontSize.toLowerCase().replace('px', '');
			// fontSize = PresFontUtil.getCalcPtFromPx(fontSizeInPx);
		}
		else if (fontSize.toLowerCase().indexOf('pt') != -1)
		{
			fontSize = fontSize.toLowerCase().replace('pt', '');
		}
		else if (fontSize.toLowerCase().indexOf('em') != -1)
		{
			fontSize = fontSize.toLowerCase().replace('em', '');
			fontSize = parseFloat(fontSize) * 18.0;
		}
		return fontSize;
	},

	convertFontsizeToEM: function(fontSize)
	{
		if (!fontSize)
		{
			return;
		}
		if (fontSize.toLowerCase().indexOf('em') != -1)
		{
			return fontSize;
		}
		return this.convertFontsizeToPT(fontSize) / 18.0 + "em";
	},
	
	//shape imported with gradient fill or pic fill should check its fill pattern 
	//example : e.svg.fill:(url(#pattern_id))) 
	// paratemer: e.svg.fill
	checkShapeUrlFillOpacity : function(fill)
	{
		var svgFill = fill.attrs.fill;
		var fillInside = dojo.query(svgFill.replace('url(','').replace(')',''))[0].attributes;							
		var tempObj;
		var tempOpValue;
		if (fillInside&&fillInside.imgtarget)
		{
			//ie has fillInside.imgtarget.ownerElement don't have children[0]
			tempObj = fillInside.imgtarget.ownerElement.children[0];
			tempOpValue = parseFloat(tempObj.style.opacity);
		}
		else if (fillInside && fillInside.gradtarget)
		{
			tempObj = fillInside.gradtarget.ownerElement.children[0];
			tempOpValue = parseFloat(tempObj.attributes['stop-opacity'].value);
		}
		if ( isNaN(tempOpValue))
			tempOpValue = 1;
		return tempOpValue;
	},
	
	getRGBFromRGBA : function(color)
	{
		if (!color)
			return null;
		if (/^(rgba|RGBA)/.test(color))
			return color.replace(/^(rgba|RGBA)/,'rgb').replace(/,(\s*)(1|0.[0-9]*)(\s*)\)$/,')');
		else 
			return color;
	},
	
	//textbox with no fill or gradient fill read from style 
	//gradient fill's backgroundImage: 
	//-webkit-radial-gradient(50% 50%, circle, rgba(64,139,206,0.46) 0%, #408bce 23%, #2e75b6 69%, #2b6da9 97%);
	getTransparencyOfTextBox : function(node)
	{
		var backgroundImageStyle = dojo.getComputedStyle(node).backgroundImage ;
		var tempOpValue ;
		if (backgroundImageStyle && backgroundImageStyle != 'none')
		{
			//bgImg exits  parse from backgroundImageStyle
			tempOpValue = backgroundImageStyle.match(/rgba\(\s*[0-9]*\s*,\s*[0-9]*\s*,\s*[0-9]*\s*,\s*(1|0.[0-9]*)\s*\)/);
			if (tempOpValue)
			{
				if (isNaN(parseFloat(tempOpValue[1])))
					tempOpValue = pres.constants.DEFAULT_OPACITY;
				else
					tempOpValue = 100 * tempOpValue[1];
				canBeAdjusted = false;
			}
			else
			{
				//rgb in backgroundImageStyle   set to default value 100%
				canBeAdjusted = false;
				tempOpValue = pres.constants.DEFAULT_OPACITY;
			}
		}
		else
		{
			//To IE no backgroundImage but has stopOpacity means gradient fill
			//To Chrome and firefox , no backgroundImageStyle means no fill 
			if(!isNaN(parseFloat(dojo.getComputedStyle(node).stopOpacity)))
				canBeAdjusted = false;
			else 
				canBeAdjusted = true;
			tempOpValue = pres.constants.DEFAULT_OPACITY;
		}	
		return [tempOpValue,canBeAdjusted];
	},
	
	//Rgba color :(XXX,XXX,XXX,opacity)
	testIfHazOp : function(color)
	{
		if (!color)
			return null;
		if(/^(rgba|RGBA)/.test(color))
			return true;
		else 
			return false;
	},
	
	//When set background colorB ,get opacityA from original color A, combine colorB and opacityA
	getRGBAFromNewColor : function(newColor,originalColor)
	{
		if (!newColor||!originalColor)
			return null;		
		var rgbColor = this.convertColorHexToRGB(newColor);
		if (!rgbColor)
			return null;
		var opacity = this.getOpacityFromColor(originalColor);
		return "rgba("+rgbColor.r+","+rgbColor.g+","+rgbColor.b+","+opacity+")";
	},
	
	getOpacityFromColor : function(color)
	{
		if (!color)
			return null;
		var transparency ;
		if (/^(rgb|RGB)/.test(color))
		{
			var aColor = color.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
			if (aColor.length == 4)
			{
				transparency = parseFloat(aColor[3]);
			}
		}
		if (isNaN(transparency))
			transparency = 1;
		return transparency;
	},
	
	//get RgbaColor with color(rgba or rgb ) and opacity.
	getRGBAColorWithOpacity : function(color,opacityValueStr)
	{
		if (!color)
			return null;
		if (isNaN(parseFloat(opacityValueStr)))
			opacityValueStr = 1;
		var rgbaColorStr = color;
		if (/^(rgba|RGBA)/.test(color))
		{
			//rgba(XX1,XX2,XX3,XX4)  opacity=YY1 return rbga(XX1,XX2,XX3,YY1)
			rgbaColorStr = color.replace(/\s/ig,"").replace(/\,(0[.][0-9]{1,}|1|0)\)/,","+opacityValueStr+")");

		}else if (/^(rgb|RGB)/.test(color))
		{
			//rgb(XX1,XX2,XX3)  opacity=YY1 return rbga(XX1,XX2,XX3,YY1)
			rgbaColorStr = color.replace(/\s/ig,"").replace(/^(rgb|RGB)/,"rgba").replace(")",","+opacityValueStr+")");
		}
		return rgbaColorStr;
	},
	
	convertToHexColor: function(color)
	{
		if (!color)
			return null;
		var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
		if (/^(rgb|RGB)/.test(color))
		{
			var aColor = color.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
			aColor[0] = aColor[0].replace(/(?:\(|\)|a|A)*/g, "");
			var strHex = "#";
			
			if(aColor.length == 4)
			{
				//RGBA mode
				aColor[0] = Math.round( (aColor[0]*aColor[3] + 255*(255 - aColor[3]))/255.0 );
				aColor[1] = Math.round( (aColor[1]*aColor[3] + 255*(255 - aColor[3]))/255.0 );
				aColor[2] = Math.round( (aColor[2]*aColor[3] + 255*(255 - aColor[3]))/255.0 );
			}
			if(aColor.length == 3 || aColor.length == 4)
				for ( var i = 0; i < 3; i++)
				{
					var hex = Number(aColor[i]).toString(16);
					if(hex.length ==1)
						hex = "0" + hex;
					strHex += hex;
				}
			else
				strHex = color;
			return strHex;
		}
		else if (reg.test(color))
		{
			var aNum = color.replace(/#/, "").split("");
			if (aNum.length === 6)
			{
				return color;
			}
			else if (aNum.length === 3)
			{
				var numHex = "#";
				for ( var i = 0; i < aNum.length; i += 1)
				{
					numHex += (aNum[i] + aNum[i]);
				}
				return numHex;
			}
		}
		else
		{
			return color;
		}
	},
	
	convertColorHexToRGB : function(hexColorStr)
	{
		var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
		var sColor = hexColorStr;
	    if(sColor && reg.test(sColor)){
	        if(sColor.length === 4){
	            var sColorNew = "#";
	                for(var i=1; i<4; i+=1){
	                    sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));        
	                }
	                sColor = sColorNew;
	        }
	        var sColorChange = [];
	        for(var i=1; i<7; i+=2){
	            sColorChange.push(parseInt("0x"+sColor.slice(i,i+2)));        
	        }
	        return {r:sColorChange[0],g:sColorChange[1], b:sColorChange[2]};
	    }else{
	        return {r:0,g:0, b:0};        
	    }
	},
	//HSL [0~240],RGB [0~255]
	convertColorHSLToRGB : function(color)
	{
		var h = color.h/240.0;
		var s = color.s/240.0;
		var l = color.l/240.0;
		var r, g, b;

	    if(s == 0){
	        r = g = b = l; // achromatic
	    }else{
	        function hue2rgb(p, q, t){
	            if(t < 0) t += 1;
	            if(t > 1) t -= 1;
	            if(t < 1/6) return p + (q - p) * 6 * t;
	            if(t < 1/2) return q;
	            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
	            return p;
	        }

	        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	        var p = 2 * l - q;
	        r = hue2rgb(p, q, h + 1/3);
	        g = hue2rgb(p, q, h);
	        b = hue2rgb(p, q, h - 1/3);
	    }
	    r = Math.round(r * 255)%256;
	    g = Math.round(g * 255)%256;
	    b = Math.round(b * 255)%256;

	    return {r: r,g: g, b:b};
	},
	
	//	H: Hue        0~240
	//	S：Saturation 0~240
	//	L: Lightness  0~240
	convertColorRGBToHSL : function(color)
	{
		var r = color.r;
		var g = color.g;
		var b = color.b;
	    r /= 255, g /= 255, b /= 255;
	    var max = Math.max(r, g, b), min = Math.min(r, g, b);
	    var h, s, l = (max + min) / 2;

	    if(max == min){
	        h = s = 0; // achromatic
	    }else{
	        var d = max - min;
	        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	        switch(max){
	            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
	            case g: h = (b - r) / d + 2; break;
	            case b: h = (r - g) / d + 4; break;
	        }
	        h /= 6;
	    }

	    return {h:Math.round(h*240), s:Math.round(s*240), l:Math.round(l*240)};
	},
	
	removeTabelCellSelectionClass : function(rootDom)
	{
		if (!rootDom)
			return;
		var _cells = [];
		var tagName = rootDom.tagName.toLowerCase();
		if (tagName == "td" || tagName == "th")
			_cells.push(rootDom);
		else
			_cells = dojo.query('td,th',rootDom);
		var removedClasses = [];
		dojo.forEach(_cells,function(cellDom){
			if (cellDom)
			{
				if (dojo.hasClass(cellDom, 'cellselected'))
				{	
					dojo.removeClass(cellDom, 'cellselected');
					removedClasses.push('cellselected');
				}
				var classStr = dojo.attr(cellDom, 'class');
				var clsList = classStr.split(' ');
				for ( var j = 0 ; j < clsList.length; j++)
				{	
					if ( clsList[j].match(/^selcover_/))
					{
						removedClasses.push(clsList[j]);
						dojo.removeClass(cellDom, clsList[j]);
					}
				}
			}
		});
		return removedClasses;
	},

	addTabelCellSelectionClass : function(cellDom)
	{
		var computedStyle = dojo.getComputedStyle(cellDom);
		var bgColor = computedStyle.backgroundColor;
		
		var rgbColor = dojo.colorFromString(bgColor);
		
		if (!rgbColor || rgbColor.a == 0)
		{
			//Very empty color
			dojo.addClass(cellDom, 'cellselected');		
			dojo.addClass(cellDom, 'selcover_empty');	
			return;
		}
		
		//Ok try to find a color which is very closed to the color
		var map = this.backgroudColorCssMap;
		var minDis = 300*300*3;
		var iSelected = -1;//Selected index in color map
		
		for(var i=0;i<map.length;i++)
		{
			var item = map[i];
			var dis = (item.r - rgbColor.r)*(item.r - rgbColor.r)
			+ (item.g - rgbColor.g)*(item.g - rgbColor.g)
			+ (item.b - rgbColor.b)*(item.b - rgbColor.b);
			
			if(dis < minDis || iSelected == -1)
			{
				minDis = dis;
				iSelected = i;
			}
		}
		
		var mapItem = map[iSelected];
		
		dojo.addClass(cellDom, 'cellselected');		
		dojo.addClass(cellDom, mapItem.css);		
	},
	
	// in some case, the bookmark node will be inserted into the line HTML structure
	// return <li><p> or null, input <ol><ul><p>
	getLineItem: function(_line)
	{
		var line = _line;
		if (!line || !this.is(line, 'ol', 'ul', 'p', 'li'))
			return null;

		if (this.is(line, 'p', 'li'))
			return line;

		// in some case, the bookmark node will be inserted into the line HTML structure
		var tliItem = dojo.query('li', line);
		tliItem = tliItem[0];

		return tliItem;
	},

	// line is il,ou,ul,p
	// If the line is an empty line ,return its first span
	getFirstVisibleSpanFromLine: function(line, bFromEnd)
	{
		if (!line || !this.is(line, 'a', 'p', 'ol', 'ul', 'li'))
		{
			return null;
		}
		var bEmptyLine = this.isNodeTextEmpty(line);
		var lineItem = null;
		if (this.is(line, 'a'))
			lineItem = line;
		else
			lineItem = this.getLineItem(line);
		if (!lineItem)
			return null;
		var bEndWithBR = true;

		if (!this.is(lineItem.lastChild, 'br') && (!this.is(line, 'a')))
		{
			bEndWithBR = false;
			console.warn('getFirstVisibleSpanFromLine detect no <br> end error, the line strucure is : [' + line.outerHTML + ']');
		}
		// Last node of line must be <br>
		var children = lineItem.childNodes;
		var count = children.length;

		for ( var i = bFromEnd ? (bEndWithBR ? (count - 2) : (count - 1)) : 0; bFromEnd ? (i >= 0) : (i < count - 1); bFromEnd ? (i--) : (i++))
		{
			var span = children[i];
			if (this.is(span, 'br'))
				break;
			span = span.nodeType == EditorUtil.NODE_TEXT ? span.parentNode : span;

			// <li/p><a><span>xxxx</span></a></li>
			// <p/li><span><a><span>xxxx</span></a></span></li>
			var isa = span.firstChild;
			if (isa && isa.nodeType != EditorUtil.NODE_TEXT && this.is(isa, 'a'))
			{
				span = isa;
			}

			if (this.is(span, 'a') && !this.isNodeTextEmpty(span))
			{
				return this.getFirstVisibleSpanFromLine(span);
			}

			if (this.is(span, 'span') && (bEmptyLine || !this.isNodeTextEmpty(span)) && !this.hasAttribute(span, 'data-cke-bookmark'))
				return span;
		}

		// not found, and want to return null
		// last try
		// if it is not an empty line,
		// and could not find the span at above logic,
		// it might be one line contian white space
		// we try to found the first span
		if (!bEmptyLine)
		{
			var firstSpan = null;
			for ( var i = 0; i < count; i++)
			{
				var child = lineItem.childNodes[i];
				if (this.is(child, 'br'))
					break;
				if (this.is(child, 'span'))
				{
					if (bFromEnd && child)
						firstSpan = child;

					if (!bFromEnd && !firstSpan)
						firstSpan = child;

					if (!this.isNodeTextEmpty(child))
						return child;
				}
			}
			if (firstSpan)
				return firstSpan;
		}
		console.error('getFirstVisibleSpanFromLine fail, the line strucure must error : [' + line.outerHTML + ']');
		return null;
	},

	//
	// returns draw_frame_classes for non tables
	// and returns tbody for tables
	// returns null for anything else
	//
	getDFCNode: function()
	{
		var curBox = pe.scene.editor.getEditingBox();
		if (!curBox)
			return null;

		var dfc = curBox.domNode;

		if (dfc == null)
		{
			return dfc;
		}

		if (curBox.editor.isTable == false)
		{
			while (dfc && dfc.nodeName.toLowerCase() != 'div')
			{
				dfc = dfc.nextSibling;
			}
			if (dfc == null)
			{
				return dfc;
			}
		}

		dfc = (dfc.firstChild) ? dfc.firstChild : null;

		if (dfc != null && curBox.editor.isTable == false && dfc.nodeName.toLowerCase() != "div")
		{
			dfc = null;
		}

		if (dfc != null && curBox.editor.isTable == true && dfc.nodeName.toLowerCase() != "tbody")
		{
			while (dfc && dfc.nodeName.toLowerCase() != 'tbody')
			{
				dfc = dfc.nextSibling;
			}
		}
		return dfc;
	},

	getCustomStyle: function(_node, _styleName)
	{
		var styleProp = this._getCustomStyleList(_node);
		if (styleProp)
			return styleProp[_styleName];
		return null;
	},

	// SetCustomStyle
	setCustomStyle: function(node, _styleName, _styleValue)
	{
		var styleProp = this._getCustomStyleList(node);
		if (!styleProp)
		{
			styleProp = [];
		}
		styleProp[_styleName] = _styleValue;
		var stylesText = this._arrayToStyleString(styleProp);
		EditorUtil.setAttribute(node, "customstyle", stylesText);
	},

	// RemoveCustomStyle
	removeCustomStyle: function(node, _styleName)
	{
		var styleProp = this._getCustomStyleList(node);
		if (!styleProp)
		{
			styleProp = [];
		}
		var newStyleProp = [];
		for ( var style in styleProp)
			if (style != _styleName)
				newStyleProp[style] = styleProp[style];

		var stylesText = this._arrayToStyleString(newStyleProp);
		EditorUtil.setAttribute(node, "customstyle", stylesText);
	},

	_getCustomStyleList: function(node)
	{
		if (node)
		{
			var styleInfoForNode = EditorUtil.getAttribute(node, "customstyle");
			return this.turnStyleStringToArray(styleInfoForNode);
		}
	},

	// change a string to style array
	// string format : abc:XXX;efg:YYY;oopo:ZZZ;....
	// Array format : Array[styleName] = value
	turnStyleStringToArray: function(styleString)
	{
		var styleArray = [];
		if (styleString)
		{
			if (!dojo.isIE)
			{
				if (styleString && styleString.charAt(styleString.length - 1) == ';')
					styleString = styleString.substring(0, styleString.length - 1);
			}
			styleArray = styleString.split(';');
		}
		else
			return null;
		var styleProp = [];
		for ( var i = 0; i < styleArray.length; i++)
		{
			var entry = styleArray[i];
			var styleName = '';
			var styleValue = '';
			var semiIndex = entry.indexOf(':');
			if (semiIndex >= 0)
			{
				styleName = dojo.trim(entry.substring(0, semiIndex));
				styleValue = dojo.trim(entry.substring(semiIndex + 1));
				styleProp[styleName] = styleValue;
			}
		}

		return styleProp;
	},

	// array to stryle string
	// Array format : Array[styleName] = value
	// string format : abc:XXX;efg:YYY;oopo:ZZZ;....
	_arrayToStyleString: function(styleProp)
	{
		var stylesText = '';
		for ( var style in styleProp)
		{
			var styleVal = styleProp[style] + '';
			styleVal = dojo.trim(styleVal);
			if (styleVal && styleVal.length > 0)
			{
				var text = style + ':' + styleVal + ';';
				stylesText += text;
			}
		}
		return stylesText;
	},

	// if the style not exist, it will return null, otherwise return the value
	// className : css rule name, such as "lst-c"
	// styleName : the name of style, such as "fontsize"
	// [Return] the value of style, such as "1em"
	getAbsModuleValue: function(className, styleName)
	{
		var classDiv = this._getModelValueDiv(className);
		if (!classDiv)
			return null;
		var value = EditorUtil.getAttribute(classDiv, styleName);
		return value;
	},

	_getModelValueDiv: function(className)
	{
		var classDiv = document.getElementById(className);
		if (!classDiv)
		{
			classDiv = document.getElementById(".concord ." + className);
		}
		return classDiv;
	},

	MasterClassMap: [],// to store master class css name, for searching performance enhancement

	hasMasterClass: function(className)
	{
		var re = this.MasterClassMap[className];
		if (re == true || re == false)
			return re;

		if (this._getModelValueDiv(className))
		{
			this.MasterClassMap[className] = true;
			return true;
		}

		var doc = window.document;
		if (doc)
		{
			var rules = this.getCSSRules([className], doc);
			if (rules.length)
			{
				this.MasterClassMap[className] = true;
				return true;
			}
			else
			{
				this.MasterClassMap[className] = false;
			}
		}

		return false;
	},

	// node must be <span / li /p>
	getAbsoluteValue: function(node, _styleName)
	{
		if (!this.is(node, 'li', 'span', 'p', 'div'))
			return null;
		// Check its own custom style
		var vCustomValue = this.getAttribute(node, _styleName);
		if (vCustomValue)
		{// if has,return it
			return vCustomValue;
		}
		vCustomValue = this.getCustomStyle(node, _styleName);
		if (vCustomValue)
		{// if has,return it
			return vCustomValue;
		}
		// in case of <span><A><span>
		var aLinkTest = node.parentNode;
		if (EditorUtil.is(aLinkTest, 'a'))
		{
			var linkSpan = aLinkTest.parentNode;
			if (EditorUtil.is(linkSpan, 'span'))
			{
				// Check its own custom style
				vCustomValue = EditorUtil.getAttribute(linkSpan, _styleName);
				if (vCustomValue)
				{// if has,return it
					return vCustomValue;
				}
				vCustomValue = this.getCustomStyle(linkSpan, _styleName);
				if (vCustomValue)
				{// if has,return it
					return vCustomValue;
				}
			}
		}

		if (!EditorUtil.is(node, 'div'))
		{ // find the value from its parent
			// try to find the custom style in list
			var lineItem = node;
			// if it is a <span>
			if (EditorUtil.is(lineItem, 'span'))
			{
				// Search span class
				var cls = EditorUtil.getAttribute(lineItem, 'class');
				if (cls == undefined || cls == null)
				{
					cls = " ";
				}
				var listClasses = cls.split(' ');
				for ( var j = 0; j < listClasses.length; j++)
				{
					vCustomValue = this.getAbsModuleValue(listClasses[j], _styleName);
					if (vCustomValue)
					{// if has,return it
						return vCustomValue;
					}
				}

				// get the parent li/p
				lineItem = EditorUtil.getAscendant(node, 'li') || EditorUtil.getAscendant(node, 'p');
				if (lineItem)
				{
					vCustomValue = this.getCustomStyle(lineItem, _styleName);
					if (vCustomValue)
					{// if has,return it
						return vCustomValue;
					}
				}
			}
			// Then get the list style
			// find list own "lst-/IL" class
			var lc = EditorUtil.getListClass(lineItem);
			if (lc)
			{
				// The order in lc is very import
				// it could ensure we first seach lst, then master
				// the order reference function EditorUtil.getListClass in pres/ListUtil.js
				for ( var p in lc)
				{
					if (lc[p])
					{
						for ( var k = 0; k < lc[p].length; k++)
						{
							var className = lc[p][k];
							vCustomValue = this.getAbsModuleValue(className, _styleName);
							if (vCustomValue)
							{// if has,return it
								return vCustomValue;
							}
							// if not found, we try find "xxx:before"
							className = className + PresConstants.LIST_BEFORE;
							vCustomValue = this.getAbsModuleValue(className, _styleName);
							if (vCustomValue)
							{// if has,return it
								return vCustomValue;
							}
						}
					}
				}
			}
		}
		// At last we could not find anything, then we should default value
		switch (_styleName)
		{
			case EditorUtil.ABS_STYLES.FONTSIZE:
			{
				if(window.pe)
				{
					var cBox = pe.scene.slideEditor.getEditingBox();
					if(cBox)
					{
						if(cBox.element.table)
							return 18;
					}
					return pe.scene.doc.fontSize || 18;
				}
				else
					return 18;

			}
		}
		return null;
	},

	resetListBeforeStyleByFirstSpan: function(root)
	{
		function _refreshStylesforListBefore(liNode)
		{
			var firstSpan = EditorUtil.getFirstVisibleSpanFromLine(liNode);
			// var computedStyle = dojo.getComputedStyle(firstSpan);

			// var hexColor = this.convertToHexColor(computedStyle.color);
			var fontSize = EditorUtil.getAbsoluteValue(firstSpan, EditorUtil.ABS_STYLES.FONTSIZE);

			var listClassesString = dojo.attr(liNode, 'class');
			if (listClassesString == undefined || listClassesString == null)
			{
				listClassesString = " ";
			}
			var listClasses = listClassesString.split(' ');
			for ( var j = 0; j < listClasses.length; j++)
				if (listClasses[j].match(/^LS_/))
				{
					dojo.removeClass(liNode, listClasses[j]);
				}

			var cls = 'LS_' + fontSize;
			dojo.addClass(liNode, cls);

		}

		if (root.nodeName.toLowerCase() == 'li')
		{
			_refreshStylesforListBefore(root);
		}
		else
			dojo.forEach(dojo.query('li', root), function(listItem)
			{
				_refreshStylesforListBefore(listItem);
			});
	},
	
	openURLLink : function(url)
	{
		var index = url.indexOf("://");
		var win = null;
		if(index>0)
			win = window.open(url,"_new", "alwaysRaised=yes,z-look=yes");
		else
		{
			index = url.indexOf("mailto:");
			if(index==0)
				win = window.open(url);
			else
				win = window.open("http://"+url,"_new", "alwaysRaised=yes,z-look=yes");
		}
		if(win)
			win.focus();
		else {
			this.errorUrlCleanTimer && clearTimeout(this.errorUrlCleanTimer);
			!this.presStrs && (this.presStrs = dojo.i18n.getLocalization("pres", "pres"));
			window.pe.scene.showWarningMessage(this.presStrs.invalid_url);
			this.errorUrl = setTimeout(dojo.hitch(this, function()
			{
				window.pe.scene.hideErrorMessage();
				this.errorUrlCleanTimer = null;
			}), 2000);
		}
	},

	getStrHashCode : function(str)
	{
		if( str == null || str.value == "")
			return 0;
		var hash = 0; 
		function toHex(num)  
	    {  
	        if(num < -0x80000000 || num > 0x7fffffff)  
	            return num &= 0xFFFFFFFF;  
	        return num;  
	    } 
		for (var i = 0; i < str.length; i++)
		{
			hash = hash * 31 + str.charCodeAt(i);
			hash = toHex(hash);
		}
		
		return hash;
	},
	
	//229(charCode from IME) condition is in FocusManager now
	//textinput/IME related function:
	//onKeyPress，onInput，onTextInput，onCompositionStart，onCompositionEnd，onCompositionUpdate
	keyCodeEventToVisibleChar: function(keyCodeEvent)
	{
		if (keyCodeEvent.charCode > 0 && (keyCodeEvent.charCode > 127 || 
				!(keyCodeEvent.ctrlKey|| keyCodeEvent.metaKey || keyCodeEvent.altKey))) {
			var text = String.fromCharCode(keyCodeEvent.charCode);
			return text;
		}
		return null;
	},
	
	hasBackgroundFill: function(textNode)
	{
		var bg = dojo.style(textNode, "backgroundImage");
		var bgColor = textNode.style.backgroundColor;
		var bgColorComputed = dojo.style(textNode, "backgroundColor");
		var color = dojo.colorFromString(bgColorComputed);
		var doesTxtboxHaveBackgroundColor = bgColor || (bgColorComputed && color && (color.a || color.g || color.b));
		var doesTxtboxHaveBackgroundImage = bg && bg != "none";
		if (!doesTxtboxHaveBackgroundColor && !doesTxtboxHaveBackgroundImage)
		{
			return false;
		}
		return true;
	},
	
	getTextSizeInPx : function(textString,fontSize,fontFamily,fontStyle)
	{
	    var span = document.createElement("span");
	    var result = {};
	    result.width = span.offsetWidth;
	    result.height = span.offsetHeight; 
	    span.style.visibility = "hidden";
	    if(fontSize)
	    	span.style.fontSize=fontSize;
	    if(fontFamily)
	    	span.style.fontFamily=fontFamily;
	    if(fontStyle)
	    	span.style.fontStyle=fontStyle;

	    document.body.appendChild(span);
	    if (typeof span.textContent != "undefined")
	        span.textContent = textString;
	    else span.innerText = textString;
	    result.width = span.offsetWidth - result.width;
	    result.height = span.offsetHeight - result.height;
	    span.parentNode.removeChild(span);
	    return result;
	}
});

(function()
{
	if (typeof EditorUtil == "undefined")
		EditorUtil = new pres.editor.EditorUtil();
})();

EditorUtil.NODE_ELEMENT = 1;
EditorUtil.NODE_DOCUMENT = 9;
EditorUtil.NODE_TEXT = 3;