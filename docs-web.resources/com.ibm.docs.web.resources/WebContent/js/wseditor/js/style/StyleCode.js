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

/****************************************************/
/* created by Xiejinjing                            */
/*   1/24/2011                                      */
/* to store style of a spreadsheet document	   		 */
/****************************************************/
dojo.provide("websheet.style.StyleCode");
dojo.require("websheet.Constant");
dojo.require("websheet.config.config");
dojo.declare("websheet.style.StyleCode",null,{
   
	_attributes : null,         // all the style attributes
	_attrCount: 0,      // the number of attributes
	refCount: 0,       // the number of object(cell,column) refer to this styleCode
	_cssString: undefined,
	_bIsIe: dojo.isIE,
	
	_fontStyle: null,	//object,
	_hasBorder: false,
	//fontStyle {
	//		fontString:	"italic bold 17px Arial", or something like this, it can be directly used as a valid CSS(or canvas context) fontString.
	//		indent:	5,	px unit. 
	//		align:	"left", or "right" "center"...........
	//		....
	//	}
	
	_IE_FONT_STOPLIST:websheet.config.config.IE_FONT_STOPLIST,
	_ATTRS: [
		websheet.Constant.Style.FORMATTYPE,
		websheet.Constant.Style.FORMATCODE,
		websheet.Constant.Style.FORMATCURRENCY,
		websheet.Constant.Style.FORMAT_FONTCOLOR,
		websheet.Constant.Style.TEXT_ALIGN,
		websheet.Constant.Style.VERTICAL_ALIGN,
		websheet.Constant.Style.INDENT,
		websheet.Constant.Style.BACKGROUND_COLOR,
		websheet.Constant.Style.WRAPTEXT,
		websheet.Constant.Style.DIRECTION,
		websheet.Constant.Style.FONTNAME,
		websheet.Constant.Style.SIZE,
		websheet.Constant.Style.COLOR,
		websheet.Constant.Style.ITALIC,
		websheet.Constant.Style.UNDERLINE,
		websheet.Constant.Style.STRIKETHROUGH,
		websheet.Constant.Style.BOLD,
		websheet.Constant.Style.BORDER_LEFT,
		websheet.Constant.Style.BORDER_RIGHT,
		websheet.Constant.Style.BORDER_BOTTOM,
		websheet.Constant.Style.BORDER_TOP,
		websheet.Constant.Style.BORDER_LEFT_COLOR,
		websheet.Constant.Style.BORDER_RIGHT_COLOR,
		websheet.Constant.Style.BORDER_BOTTOM_COLOR,
		websheet.Constant.Style.BORDER_TOP_COLOR,
		websheet.Constant.Style.BORDER_LEFT_STYLE,
		websheet.Constant.Style.BORDER_RIGHT_STYLE,
		websheet.Constant.Style.BORDER_BOTTOM_STYLE,
		websheet.Constant.Style.BORDER_TOP_STYLE,
		websheet.Constant.Style.PROTECTION_UNLOCKED,
		websheet.Constant.Style.PROTECTION_HIDDEN,
		websheet.Constant.Style.HEIGHT,
		websheet.Constant.Style.WIDTH,
		websheet.Constant.Style.PRESERVE
	],	
	
	_BORDERATTRS: [
		websheet.Constant.Style.BORDER_LEFT,
		websheet.Constant.Style.BORDER_RIGHT,
		websheet.Constant.Style.BORDER_BOTTOM,
		websheet.Constant.Style.BORDER_TOP,
		websheet.Constant.Style.BORDER_LEFT_COLOR,
		websheet.Constant.Style.BORDER_RIGHT_COLOR,
		websheet.Constant.Style.BORDER_BOTTOM_COLOR,
		websheet.Constant.Style.BORDER_TOP_COLOR,
		websheet.Constant.Style.BORDER_LEFT_STYLE,
		websheet.Constant.Style.BORDER_RIGHT_STYLE,
		websheet.Constant.Style.BORDER_BOTTOM_STYLE,
		websheet.Constant.Style.BORDER_TOP_STYLE
	],
	/*
	 * if the type is websheet.Constant.PARAM_TYPE.JSON, then the SourceStyleCode is a json object
	 * else if the type is websheet.Constant.PARAM_TYPE.OBJECT, then is a StyleCode object
	 */
	constructor:function(type, SourceStyleCode)
	{
		this._attributes = {};
		this._attrCount = 0;
		this.refCount = 0;
		this._cssString = undefined;
		this._cssStringNoBorder = undefined;
		
		if ( SourceStyleCode == undefined || SourceStyleCode == null ) return null;
				
		if (type == websheet.Constant.PARAM_TYPE.JSON)
		{
			for(var attr in SourceStyleCode)
			{	
				if (attr == websheet.Constant.Style.HASH_CODE) {
					// exclude cached hash
					continue;
				}
				var style = SourceStyleCode[attr];
				if(style != undefined)
				{
					var bHasSub = false;
					if(typeof style == "object")
					{
						for(var subAttr in style)
						{
							bHasSub = true;
							this._attributes[subAttr] = style[subAttr];
							this._attrCount++;
						}
					}
					if(!bHasSub)
					{
						this._attributes[attr] = SourceStyleCode[attr];
						this._attrCount++;
					}
				}
			}
		}
		else if (type == websheet.Constant.PARAM_TYPE.OBJECT)
		{
			var srcAttributes = SourceStyleCode._attributes;
			for(var attr in srcAttributes)
			{ 
				this._attributes[attr] = srcAttributes[attr];
				this._attrCount++;
			}
		}
	},	
	
	getAttributes: function()
	{
		return this._attributes;
	},
	
	toJSON: function(bIncludeHashCode)
	{
		var bEmpty = true;
		var style = {};
		var font = {};
		var bFont = false;
		var format = {};
		var bFormat = false;
		var border = {};
		var bBorder = false;
		var borderColor = {};
		var bBColor = false;
		var borderStyle = {};
		var bBStyle = false;
		for(var attr in this._attributes)
		{
			if( attr == websheet.Constant.Style.DIRECTION ||
				attr == websheet.Constant.Style.TEXT_ALIGN ||
				attr == websheet.Constant.Style.VERTICAL_ALIGN ||
				attr == websheet.Constant.Style.BACKGROUND_COLOR ||
				attr == websheet.Constant.Style.INDENT ||
				attr == websheet.Constant.Style.WRAPTEXT ||
				attr == websheet.Constant.Style.PROTECTION_HIDDEN ||
				attr == websheet.Constant.Style.PROTECTION_UNLOCKED ||
				attr == websheet.Constant.Style.PRESERVE ||
				attr == websheet.Constant.Style.DXFID) // this.isInStyleSet(attr)
			{
				style[attr] = this._attributes[attr];
				bEmpty = false;
			}
			else if( attr == websheet.Constant.Style.FONTNAME ||
					 attr == websheet.Constant.Style.SIZE ||
					 attr == websheet.Constant.Style.COLOR ||
					 attr == websheet.Constant.Style.ITALIC ||
					 attr == websheet.Constant.Style.UNDERLINE || 
					 attr == websheet.Constant.Style.STRIKETHROUGH ||
					 attr == websheet.Constant.Style.BOLD ) // this.isInFontSet(attr)
			{
				font[attr] = this._attributes[attr];
				bFont = true;
			}
			else if( attr == websheet.Constant.Style.FORMATTYPE ||
					 attr == websheet.Constant.Style.FORMATCODE||
					 attr == websheet.Constant.Style.FORMATCURRENCY||
					 attr == websheet.Constant.Style.FORMAT_FONTCOLOR
					 ) // this.isInFormatSet(attr)
			{
				format[attr] = this._attributes[attr];
				bFormat = true;
			}
			else if( attr == websheet.Constant.Style.BORDER_LEFT ||
					 attr == websheet.Constant.Style.BORDER_RIGHT||
					 attr == websheet.Constant.Style.BORDER_BOTTOM||
					 attr == websheet.Constant.Style.BORDER_TOP ) // this.isInBorderSet(attr)
			{
				border[attr] = this._attributes[attr];
				bBorder = true;
			}
			else if( attr == websheet.Constant.Style.BORDER_LEFT_COLOR ||
					 attr == websheet.Constant.Style.BORDER_RIGHT_COLOR||
					 attr == websheet.Constant.Style.BORDER_BOTTOM_COLOR||
					 attr == websheet.Constant.Style.BORDER_TOP_COLOR ) // this.isInBorderColorSet(attr)
			{
				borderColor[attr] = this._attributes[attr];
				bBColor = true;
			}
			else if( attr == websheet.Constant.Style.BORDER_LEFT_STYLE ||
					 attr == websheet.Constant.Style.BORDER_RIGHT_STYLE||
					 attr == websheet.Constant.Style.BORDER_BOTTOM_STYLE||
					 attr == websheet.Constant.Style.BORDER_TOP_STYLE )
			{
				borderStyle[attr] = this._attributes[attr];
				bBStyle = true;
			}
		}
		if(bFont)
		{
			style[websheet.Constant.Style.FONT] = font;
			bEmpty = false;
		}
		if(bFormat)
		{
			style[websheet.Constant.Style.FORMAT] = format;
			bEmpty = false;
		}
		if(bBorder)
		{
			style[websheet.Constant.Style.BORDER] = border;
			bEmpty = false;
		}
		if(bBColor)
		{
			style[websheet.Constant.Style.BORDERCOLOR] = borderColor;
			bEmpty = false;
		}
		if(bBStyle)
		{
			style[websheet.Constant.Style.BORDERSTYLE] = borderStyle;
			bEmpty = false;
		}
		if (bIncludeHashCode) {
			style[websheet.Constant.Style.HASH_CODE] = this.hashCode();
			bEmpty = false;
		}
		
		if (bEmpty) {
			return null;
		} else {
			return style;
		}
	},
/*	
	_isEmptyFormat: function(format){
		var code = format.code;
		var cate = format.category;
		var cur = format.currency;
		var color = format.fmcolor;
		
		if(code || cate || cur || color)
			if(code != "" || cate != "" || cur != "" || color != "")
				return false;
			else
				return true;
				
		return true;
	},
*/	
	/*
	 * if the attribute of attr in the font set, return true else return false
	 * param attr: string
	 */
	isInFontSet: function(attr)
	{
		if(attr == websheet.Constant.Style.FONTNAME ||
		 attr == websheet.Constant.Style.SIZE||
		 attr == websheet.Constant.Style.COLOR||
		 attr == websheet.Constant.Style.ITALIC||
		 attr == websheet.Constant.Style.UNDERLINE|| 
		 attr == websheet.Constant.Style.STRIKETHROUGH||
		 attr == websheet.Constant.Style.BOLD)
		 {
		 	return true;
		 }
		
	 	return false;
	},

	/*
	 * if the attribute of attr in the font set, return true else return false
	 * param attr: string
	 */
	isInFormatSet: function(attr)
	{
		if(attr == websheet.Constant.Style.FORMATTYPE ||
		 attr == websheet.Constant.Style.FORMATCODE||
		 attr == websheet.Constant.Style.FORMATCURRENCY||
		 attr == websheet.Constant.Style.FORMAT_FONTCOLOR
		 )
		 {
		 	return true;
		 }
		
		 return false;
	},

	isBorderStyle: function()
	{
		for(var attr in this._attributes)
		{
			if(attr.indexOf("border") >= 0)
			{
				return true;
			}	
		}	
		return false;
	},
	isInBorderSet: function(attr)
	{
		if(attr == websheet.Constant.Style.BORDER_LEFT ||
		 attr == websheet.Constant.Style.BORDER_RIGHT||
		 attr == websheet.Constant.Style.BORDER_BOTTOM||
		 attr == websheet.Constant.Style.BORDER_TOP)
		 {
		 	return true;
		 }
		
		return false;
	},
	
	isInBorderColorSet: function(attr)
	{
		if(attr == websheet.Constant.Style.BORDER_LEFT_COLOR ||
		 attr == websheet.Constant.Style.BORDER_RIGHT_COLOR||
		 attr == websheet.Constant.Style.BORDER_BOTTOM_COLOR||
		 attr == websheet.Constant.Style.BORDER_TOP_COLOR)
		 {
		 	return true;
		 }

		return false;
	},
	
	isInStyleSet: function(attr)
	{
		if(attr == websheet.Constant.Style.DIRECTION||
		 attr == websheet.Constant.Style.TEXT_ALIGN||
		 attr == websheet.Constant.Style.VERTICAL_ALIGN||
		 attr == websheet.Constant.Style.BACKGROUND_COLOR||
		 attr == websheet.Constant.Style.INDENT||
		 attr == websheet.Constant.Style.WRAPTEXT||
		 attr == websheet.Constant.Style.PROTECTION_HIDDEN ||
		 attr == websheet.Constant.Style.PROTECTION_UNLOCKED)
		 {
		 	return true;
		 }
		
		return false;
	},
	
	isBooleanAttr: function(attr)
	{
		if(attr == websheet.Constant.Style.WRAPTEXT ||
		   attr == websheet.Constant.Style.ITALIC ||
		   attr == websheet.Constant.Style.UNDERLINE ||
		   attr == websheet.Constant.Style.STRIKETHROUGH ||
		   attr == websheet.Constant.Style.BOLD ||
		   attr == websheet.Constant.Style.PROTECTION_HIDDEN ||
		   attr == websheet.Constant.Style.PROTECTION_UNLOCKED)
		{
		   	return true;
		}

		return false;
	},
	
	getAttr: function(attr)
	{
		return this._attributes[attr];
	},
	
	setAttr: function(attr, value)
	{
		//do something with attrCount
		this._attributes[attr] = value;
	},
	
	getAttrCount: function()
	{
		return this._attrCount;
	},
	
	/*
	 * check if this styleCode is empty
	 */
	isDefault: function()
	{
		var defaultStyleCode = websheet.style.DefaultStyleCode;
		var defaultAttrs = defaultStyleCode._attributes;
		var attrs = this._attributes;

		for(var attr in attrs)
		{
			if(attrs[attr] != defaultAttrs[attr])
			{
				return false;
			}
		}
		
		return true;
	},
	
	equals: function(otherStyle)
	{
		var otherAttrCount = otherStyle._attrCount;
		if(this._attrCount != otherAttrCount) 
			return false;
		for(var attr in this._attributes)
		{
			if(this._attributes[attr] != otherStyle._attributes[attr])
			{
				return false;
			}
		}
		return true;
	},
	
	/****************************************************************/
	/* when the two style has some items conflict					*/
	/* itself will overlap the styleCode2, it means only the attrs  */
	/* not in itself ,but contain in the styleCode2, will merge to it*/
	/****************************************************************/
	mergeStyle: function(styleCode2)
	{
		var styleAttrs2 = styleCode2._attributes;
		for(var attr in styleAttrs2)
		{
			if(!(attr in this._attributes))
			{
				this._attributes[attr] = styleAttrs2[attr];
				this._attrCount++;
			}
		}
		this._cssString = this.toCssString();
		delete this._hashCode;
	},
	
	/*
	 * apply the attrs in deltaStyleCode 
	 */
	changeStyle: function(deltaStyleCode)
	{
		var deltaAttrs = deltaStyleCode._attributes;
		for(var attr in deltaAttrs)
		{
			if(!(attr in this._attributes))
			{
				this._attrCount++;
			}
			this._attributes[attr] = deltaAttrs[attr];
		}		
		
		this._cssString = this.toCssString();
		delete this._hashCode;
	},
	
	/*
	 * remove the attributes which value is empty, or false
	 */
	removeDefaultAttr: function()
	{
		var newAttrs = {};
		var cnt = 0;
		var defaultStyleCode = websheet.style.DefaultStyleCode;
		var defaultAttrs = defaultStyleCode._attributes;
		
		for(var attr in this._attributes)
		{
			if(this._attributes[attr] !== defaultAttrs[attr])
			{
				newAttrs[attr] = this._attributes[attr];
				cnt++;
			}
		}
		this._attributes = newAttrs;
		this._attrCount = cnt;
		this.toCssString();
		delete this._hashCode;
	},
	
	_getAttrValue: function(attr) {
		var v = this._attributes[attr];
		if(null != v && undefined != v) {
			return v;
		} else {
			return "null";
		}
	},
	
	toString: function()
	{
		// push all attrs together
		var wcs = websheet.Constant.Style;
		var str = "?"; // special character to specify undefined style attributes
		var string = [
		    (this._attributes[wcs.FORMATTYPE] !== undefined ?  this._attributes[wcs.FORMATTYPE] : str),
		    (this._attributes[wcs.FORMATCODE] !== undefined ?  this._attributes[wcs.FORMATCODE] : str),
		    (this._attributes[wcs.FORMATCURRENCY] !== undefined ?  this._attributes[wcs.FORMATCURRENCY] : str),		    
		    (this._attributes[wcs.FORMAT_FONTCOLOR] !== undefined ?  this._attributes[wcs.FORMAT_FONTCOLOR] : str),
		    (this._attributes[wcs.TEXT_ALIGN] !== undefined ?  this._attributes[wcs.TEXT_ALIGN] : str),
		    (this._attributes[wcs.VERTICAL_ALIGN] !== undefined ?  this._attributes[wcs.VERTICAL_ALIGN] : str),
		    (this._attributes[wcs.DIRECTION] !== undefined ?  this._attributes[wcs.DIRECTION] : str),
		    (this._attributes[wcs.BACKGROUND_COLOR] !== undefined ?  this._attributes[wcs.BACKGROUND_COLOR] : str),
		    (this._attributes[wcs.INDENT] !== undefined ?  this._attributes[wcs.INDENT] : str),
		    (this._attributes[wcs.WRAPTEXT] !== undefined ?  this._attributes[wcs.WRAPTEXT] : str),
		    (this._attributes[wcs.PROTECTION_HIDDEN] !== undefined ?  this._attributes[wcs.PROTECTION_HIDDEN] : str),
		    (this._attributes[wcs.PROTECTION_UNLOCKED] !== undefined ?  this._attributes[wcs.PROTECTION_UNLOCKED] : str),
		    (this._attributes[wcs.FONTNAME] !== undefined ?  this._attributes[wcs.FONTNAME] : str),
		    (this._attributes[wcs.SIZE] !== undefined ?  this._attributes[wcs.SIZE] : str),
		    (this._attributes[wcs.COLOR] !== undefined ?  this._attributes[wcs.COLOR] : str),
		    (this._attributes[wcs.ITALIC] !== undefined ?  this._attributes[wcs.ITALIC] : str),
		    (this._attributes[wcs.UNDERLINE] !== undefined ?  this._attributes[wcs.UNDERLINE] : str),
		    (this._attributes[wcs.STRIKETHROUGH] !== undefined ?  this._attributes[wcs.STRIKETHROUGH] : str),
		    (this._attributes[wcs.BOLD] !== undefined ?  this._attributes[wcs.BOLD] : str),
		    (this._attributes[wcs.BORDER_LEFT] !== undefined ?  this._attributes[wcs.BORDER_LEFT] : str),
		    (this._attributes[wcs.BORDER_RIGHT] !== undefined ?  this._attributes[wcs.BORDER_RIGHT] : str),
		    (this._attributes[wcs.BORDER_BOTTOM] !== undefined ?  this._attributes[wcs.BORDER_BOTTOM] : str),
		    (this._attributes[wcs.BORDER_TOP] !== undefined ?  this._attributes[wcs.BORDER_TOP] : str),
		    (this._attributes[wcs.BORDER_LEFT_COLOR] !== undefined ?  this._attributes[wcs.BORDER_LEFT_COLOR] : str),
		    (this._attributes[wcs.BORDER_RIGHT_COLOR] !== undefined ?  this._attributes[wcs.BORDER_RIGHT_COLOR] : str),
		    (this._attributes[wcs.BORDER_BOTTOM_COLOR] !== undefined ?  this._attributes[wcs.BORDER_BOTTOM_COLOR] : str),
		    (this._attributes[wcs.BORDER_TOP_COLOR] !== undefined ?  this._attributes[wcs.BORDER_TOP_COLOR] : str),
		    (this._attributes[wcs.BORDER_LEFT_STYLE] !== undefined ?  this._attributes[wcs.BORDER_LEFT_STYLE] : str),
		    (this._attributes[wcs.BORDER_RIGHT_STYLE] !== undefined ?  this._attributes[wcs.BORDER_RIGHT_STYLE] : str),
		    (this._attributes[wcs.BORDER_BOTTOM_STYLE] !== undefined ?  this._attributes[wcs.BORDER_BOTTOM_STYLE] : str),
		    (this._attributes[wcs.BORDER_TOP_STYLE] !== undefined ?  this._attributes[wcs.BORDER_TOP_STYLE] : str),
		    (this._attributes[wcs.HEIGHT] !== undefined ?  this._attributes[wcs.HEIGHT] : str),
		    (this._attributes[wcs.WIDTH] !== undefined ?  this._attributes[wcs.WIDTH] : str)
			];

        return string.join(";");
	},
	
	toCssString: function()
	{
		var arrCss = [];
		var wcs = websheet.Constant.Style;
		var attrs = this._attributes;
		var dcs = websheet.style.DefaultStyleCode;
		var dcsAttrs = dcs._attributes;
		(!this._fontStyle) && (this._fontStyle = {});
		var font = [], ftInfo = this._fontStyle;
		var fontSize;
		//fill in default
		font[0] = dcsAttrs[wcs.ITALIC] ? 'italic' : '';//italic ?
		font[1] = dcsAttrs[wcs.BOLD] ? 'bold' : '';
		font[2] = (fontSize = Math.round((dcsAttrs[wcs.SIZE] || 10) * websheet.Utils.getPtPxRatio())) + 'px';
		font[3] = websheet.Utils.fontFallback(dcsAttrs[wcs.FONTNAME]);
		
		var indent = dcsAttrs[wcs.INDENT] || 0;
		var align = dcsAttrs[wcs.TEXT_ALIGN] || 'left';
		var wrap = dcsAttrs[wcs.WRAPTEXT] || false;
		
		if (this == dcs) {
			// compare default style with default css
			
			attr = this.getAttr(wcs.WRAPTEXT);

			attr = attrs[wcs.DIRECTION];
			if (attr != null && attr.length > 0) {
				arrCss.push("direction:", attr, ";");
			}

			attr = attrs[wcs.TEXT_ALIGN];
			if (attr != null && attr.length > 0) {
				arrCss.push("text-align:", attr, ";");
			}
			attr = attrs[wcs.VERTICAL_ALIGN];
			if (attr != null && attr.length > 0) {
				arrCss.push("vertical-align:", attr, ";");
			}
			attr = attrs[wcs.INDENT];
			if (attr != null && attr != 0) {
				if(attrs[wcs.TEXT_ALIGN] == "left") {
					if(attr >= 0) {
						arrCss.push("padding-left:", attr, "px;");
					}
					else {
						// this is a workaround about ods import, the max indent is a negative value.
						arrCss.push("padding-left:", 2250, "px;");
					}
				}
				else if(attrs[wcs.TEXT_ALIGN] == "right") {
					arrCss.push("padding-right:", attr, "px;");
				}
			}
			attr = attrs[wcs.BACKGROUND_COLOR];
			if (attr != null && attr.length > 0 && attr != "#ffffff") {
				arrCss.push("background-color:", attr, ";");
			}
			
			attr = attrs[wcs.FONTNAME];
			if (attr != null && attr.length > 0) {
				if (!this._bIsIe || !this._IE_FONT_STOPLIST.test(attr)) {
					arrCss.push("font-family:", attr, ";");
				}
			}
			
			attr = attrs[wcs.SIZE];
			if (attr != null && attr != 10) {
				var px = Math.round(attr * websheet.Utils.getPtPxRatio());
				arrCss.push("font-size:", px, "px;");
			}
			
			attr = attrs[wcs.COLOR];
			if (attr != null && attr.length > 0 && attr != "#000000") {
				arrCss.push("color:", attr, ";");
			}
			
			attr = attrs[wcs.ITALIC];
			if (attr != null && attr == true) {
				arrCss.push("font-style:italic;");
			}
			
			var bU, bST;
			bU = !!attrs[wcs.UNDERLINE];
			bST = !!attrs[wcs.STRIKETHROUGH];
			if (bU || bST) {
				arrCss.push("text-decoration:");
				if (bU) {
					arrCss.push("underline");
				}
				// else don't mark unerline
				if (bST) {
					arrCss.push(" line-through");
				}
				// else don't mark strikethrough
				arrCss.push(";");
			}
			// else no need for css text-decoration
			
			attr = attrs[wcs.BOLD];
			if (attr != null && attr == true) {
				arrCss.push("font-weight:bold;");
			}
			
			// filter "<", ">", "\"", "\'" to address XSS issue
	        // modify the css string
	        this._cssString = arrCss.join("").replace(/[<>'"]/g, "");;			
	        //construct font info
	        ftInfo.fontString = font.join(' ').trim();
	        ftInfo.align = align;
	        ftInfo.indent = indent;
	        ftInfo.wrap = wrap;
	        ftInfo.size = fontSize;
	        //
	        return this._cssString;
		}
		// else continue for normal styleCode css string

		attr = attrs[wcs.DIRECTION];
		if(attr != null && attr != dcsAttrs[wcs.DIRECTION]) {
			arrCss.push("direction:", attr, ";");
		}
		
		attr = attrs[wcs.TEXT_ALIGN];
		if (attr != null && attr != dcsAttrs[wcs.TEXT_ALIGN]) {
			arrCss.push("text-align:", attr, ";");
			align = attr;
		}
		
		attr = attrs[wcs.VERTICAL_ALIGN];
		if (attr != null && attr != dcsAttrs[wcs.VERTICAL_ALIGN]) {
			arrCss.push("vertical-align:", attr, ";");
		}
		attr = attrs[wcs.INDENT];
		// indent's value also need to match with text align
		var ta_attr = attrs[wcs.TEXT_ALIGN];
		if (attr != null && (attr.length > 0 || typeof(attr) == "number") 
				&& (attr != dcsAttrs[wcs.INDENT] || (attr == dcsAttrs[wcs.INDENT] && ta_attr != dcsAttrs[wcs.TEXT_ALIGN]))) {
			indent = attr;
			if(ta_attr == "left") {
				if(attr >= 0) {
					arrCss.push("padding-left:", attr, "px;");
				}
				else {
					// this is a workaround about ods import, the max indent is a negative value.
					// 2250 is a biggest value in OOXML import, so also use this number to treat the ods import.
					arrCss.push("padding-left:", 2250, "px;");
				}
			}
			// no need to do the judge as padding-left, because just OOXML import has padding-right and can get
			// the right value from OOXML.
			else if(ta_attr == "right") {
				arrCss.push("padding-right:", attr, "px;");
			}
			else if(ta_attr == "center" && ta_attr != dcsAttrs[wcs.TEXT_ALIGN] && dcsAttrs[wcs.INDENT]){
				arrCss.push("padding:0 3px 1px 3px;");
			}
		}
		
		attr = attrs[wcs.BACKGROUND_COLOR];
		if (attr != null && attr != dcsAttrs[wcs.BACKGROUND_COLOR]) {
			arrCss.push("background-color:", attr, ";");
		}

//		attr = this.getAttr(wcs.WRAPTEXT);
//		if(null != attr && undefined != attr && attr== false)
//		{
//			strCss += "white-space:pre;" + attr + ";";
//		}
		attr = this.getAttr(wcs.WRAPTEXT);
		(attr != null) && (wrap = attr);
		
		attr = attrs[wcs.FONTNAME];
		if (attr != null && attr != dcsAttrs[wcs.FONTNAME]) {
			if (!this._bIsIe || !this._IE_FONT_STOPLIST.test(attr)) {
				arrCss.push("font-family:", attr, ";");
				font[3] = websheet.Utils.fontFallback(attr);
			}
		}
		
		attr = attrs[wcs.SIZE];
		if (attr != null && (attr.length > 0 || typeof(attr) == "number") && attr != dcsAttrs[wcs.SIZE]) {
			var px = Math.round(attr * websheet.Utils.getPtPxRatio());
			arrCss.push("font-size:", px, "px;");
			font[2] = (fontSize = px) + 'px';
		}
		
		attr = attrs[wcs.COLOR];
		if (attr != null && attr != dcsAttrs[wcs.COLOR]) {
			arrCss.push("color:", attr, ";");
		}
		
		attr = attrs[wcs.ITALIC];
		if (attr != null && attr != dcsAttrs[wcs.ITALIC]) {
			if (attr) {
				arrCss.push("font-style:italic;");
				font[0] = 'italic';
			} else {
				arrCss.push("font-style:normal;");
				font[0] = '';
			}
		}
		
		var bU, bST;
		attr = attrs[wcs.UNDERLINE];
		bU = (attr != null && attr != dcsAttrs[wcs.UNDERLINE]);
		attr = attrs[wcs.STRIKETHROUGH];
		bST = (attr != null && attr != dcsAttrs[wcs.STRIKETHROUGH]);
		if (bU || bST) {
			// underline or strikethrough is different from default
			arrCss.push("text-decoration:");
			// bU and bST to record current style underline and strikethrough attr mix with default
			if (attrs[wcs.UNDERLINE] == null) {
				bU = dcsAttrs[wcs.UNDERLINE];
			} else {
				bU = attrs[wcs.UNDERLINE];
			}
			
			if (attrs[wcs.STRIKETHROUGH] == null) {
				bST = dcsAttrs[wcs.STRIKETHROUGH];
			} else {
				bST = attrs[wcs.STRIKETHROUGH];
			}
			
			if (bU || bST) {
				if (bU) {
					arrCss.push("underline");
				}
				// else don't mark unerline
				if (bST) {
					arrCss.push(" line-through");
				}
				// else don't mark strikethrough
				arrCss.push(";");
			} else {
				// no underline or strikethrough, but since we are here, we are different from default,
				// set to none text-decoration
				arrCss.push("none;");
			}
		}
		// else no need for css text-decoration
		
		attr = attrs[wcs.BOLD];
		if (attr != null && attr != dcsAttrs[wcs.BOLD]) {
			if (attr) {
				arrCss.push("font-weight:bold;");
				font[1] = 'bold';
			} else {
				arrCss.push("font-weight:normal;");
			}
		}
		
		this._hasBorder = !this._isDefaultBorder();
		// filter "<", ">", "\"", "\'" to address XSS issue
        // modify the css string
        this._cssString = arrCss.join("").replace(/[<>'"]/g, "");;
        ftInfo.fontString = font.join(' ');
        ftInfo.align = align;
        ftInfo.indent = indent;
        ftInfo.wrap = wrap;
        ftInfo.size = fontSize;
		return this._cssString;
	},
	
	// attr is one of the border attribute
	_isDefaultBorder: function(attr) {
		// summary: get attr from style, if not exist or is null, fall back to same attr in dcs,
		var v, bDf = true;
		var attrs = this._attributes;
		var dcs = websheet.style.DefaultStyleCode;
		var dcsAttrs = dcs._attributes;
		if (attrs) {
			var wsConsts = websheet.Constant.Style;
			for(var i = 0; i < this._BORDERATTRS.length; i++){
				var a = this._BORDERATTRS[i];
				v = attrs[a];
				if (v != null && v != dcsAttrs[a]) {
					if(attr === wsConsts.BORDER_TOP || attr === wsConsts.BORDER_LEFT || 
							attr === wsConsts.BORDER_RIGHT || attr === wsConsts.BORDER_BOTTOM){
						return false;
					}
					if(v.length > 0)
						return false;
				}
			}
		}
		
		return true;
	},
	
	hasBorderStyle: function() {
		return this._hasBorder;
	},
	
	getCssString: function()
	{
		if (this._cssString == null)
		{
			// just constructed,
			this.toCssString();
		}
		
		return this._cssString;
	},
	
	getFontStyle: function()
	{
		if(!this._fontStyle)
		{
			this.toCssString();
		}
		return this._fontStyle;
	},
	
	hashCode: function() {
		if (this._hashCode) {
			return this._hashCode;
		} else {
			var attrs = this._ATTRS;
			var l = attrs.length;
			var h = undefined;
			var helper = websheet.Helper;
			for (var i = 0; i < l; i++)
			{
				var v = this._attributes[attrs[i]];
				h = helper.hashCode(v, h);
			}
			this._hashCode = h;
			return h;
		}
	}
});
