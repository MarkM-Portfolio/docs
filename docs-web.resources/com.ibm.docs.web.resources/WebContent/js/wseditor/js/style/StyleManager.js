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
/* created by xie jinjing                           */
/*                                                  */
/* to store styles of a spreadsheet document	    */
/****************************************************/
dojo.provide("websheet.style.StyleManager");
dojo.require("websheet.style.StyleCode");
dojo.require("websheet.style.CFStyleManager");
 
dojo.declare("websheet.style.StyleManager",null,{
	
	styleMap: {},
	defaultStyleMap: {},
	_hashCodeIdMap: null, // the key is the hashcode of styleCode, value is the styleId of this styleCode
	maxCount: 0,
	_idMapping:null,	//used for partial loading to map the style id between server and client
	_cfStyleManager:null,
	
	constructor:function(args)
	{
		dojo.mixin(this, args);
		var doc = websheet.model.ModelHelper.getDocumentObj();
		if (doc.partialLevel != websheet.Constant.PartialLevel.ALL) {
			this._idMapping = {};
		}
		this._cfStyleManager = new websheet.style.CFStyleManager(this);
	},
	
	_init: function(JSONstyleMap, bJoin)
	{
		if ( JSONstyleMap == undefined || JSONstyleMap == null ){return null;}
		
		var bMapping = false;
		if(this._idMapping && !bJoin)
		{
			bMapping = true;
			this._idMapping = {};//reset id mapping
		}
		for (var styleId in JSONstyleMap)
		{
			var styleCode = new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.JSON,JSONstyleMap[styleId]);
			var bAdd = true;
			if(styleId.search(/default/i) == -1)
			{
				var strCount = styleId.substring(2,styleId.length);
				var count = parseInt(strCount);
				if(count > this.maxCount)
				{
					this.maxCount = count;
				}
				if(bMapping)
				{
					//if already exist in style map, then check if they are equal,
					//if not, then rename the style id and put them to style partial loading map
					var oriStyleCode = this.styleMap[styleId];
					if(oriStyleCode)
					{
						if (oriStyleCode.equals(styleCode)) {
							// styleMap already has the same style, don't add it again 
							// otherwise the refcount of the style would be incorrect
							bAdd = false;
						} else {
							var styleHashCode = styleCode.hashCode();
							
							// delay the initialization of hashCodeIdMap till there has any style change by UI
							// in order to improve performance
							var hashCodeIdMap = this._getHashCodeMap();
		
							var cId = hashCodeIdMap[styleHashCode];//client style id
							if(!cId)
							{
								cId = this._generateStyleId();
								this.styleMap[cId] = styleCode;
								this._hashCodeIdMap[styleHashCode] = cId;
							}
							this._idMapping[styleId] = cId;
							bAdd = false;
						}
					}
				}
			}else if(styleId == websheet.Constant.Style.DEFAULT_COLUMN_STYLE){
				var width = styleCode.getAttr(websheet.Constant.Style.WIDTH);
				if(width)
					websheet.Constant.DEFAULT_COLUMN_WIDTH = width;
			}else if(styleId == websheet.Constant.Style.DEFAULT_ROW_STYLE){
				var h = styleCode.getAttr(websheet.Constant.Style.HEIGHT);
				websheet.Constant.defaultRowHeight = h;
			}
			if(bAdd)
				this.styleMap[styleId] = styleCode;
			
//			if(styleId.search(websheet.Constant.Style.DEFAULT) != -1)
//			{
//				this.defaultStyleMap[styleId] = styleCode;
//			}else
//			{
//				this.styleMap[styleId] = styleCode;
//
//				var strCount = styleId.substring(2,styleId.length);
//				var count = parseInt(strCount);
//				if(count > this.maxCount)
//				{
//					this.maxCount = count;
//				}
//			}
		}

		if (!websheet.style.DefaultStyleCode) {
			if (this.styleMap[websheet.Constant.Style.DEFAULT_CELL_STYLE]) {
				this._dcs = websheet.style.DefaultStyleCode = this.styleMap[websheet.Constant.Style.DEFAULT_CELL_STYLE];
			}
		}
	},
	
	getMapping:function(id)
	{
		var cId = id;
		if(this._idMapping)
		{
			cId = this._idMapping[id];
			if(!cId)
				cId = id;
		}
		return cId;
	},
	
	_generateStyleId: function()
	{
		this.maxCount++;
		var styleId = websheet.Constant.IDPrefix.STYLE +this.maxCount;
		return styleId;
	},
	
	getStyleById: function(styleId)
	{
		return this.styleMap[styleId];
	},
	
	isBorderStyle: function(styleId)
	{
		var style = this.styleMap[styleId];
		if(style) return style.isBorderStyle();
		return false;
	},
	
	/*
	 * get Hashcode map or initilize it if it isn't constructed yet
	 */
	_getHashCodeMap: function () 
	{
		if(null != this._hashCodeIdMap) return this._hashCodeIdMap;
		
		this._hashCodeIdMap = {};
		for(var styleId in this.styleMap)
		{
			var styleCode = this.styleMap[styleId];
			var styleHashCode = styleCode.hashCode();
			this._hashCodeIdMap[styleHashCode] = styleId;
		}
		return this._hashCodeIdMap;
	},
	
	/*
	 * return the style id of the styleJson
	 * if the styleJson has the corresponding style id ,return id
	 * or , genreate a styleid for it, and add it to the map
	 * param style:  json or StyleCode
	 * param isObject: true means the param style is stylecode, false means it a json object
	 */
	addStyle: function(style, isObject)
	{
		var styleCode = style;

		if (styleCode == null) return styleCode;
		
		if(!isObject)
		{
			styleCode = new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.JSON,style);
		}
		
		var styleHashCode = styleCode.hashCode();
		
		// delay the initialization of hashCodeIdMap till there has any style change by UI
		// in order to improve performance
		var hashCodeIdMap = this._getHashCodeMap();

		var styleId = hashCodeIdMap[styleHashCode];
		if(!styleId)
		{
			styleId = this._generateStyleId();
			this.styleMap[styleId] = styleCode;
			hashCodeIdMap[styleHashCode] = styleId;
		}

		this.addRefCount(styleId);

		return styleId;
	},
	
	bStyleChgCacheOpened: false,
	
	/*
	 * start caching for changeStyle(), it will cache source styleId, delta style json and the result style id,
	 * suitable for long operations for merging style. must call closeChangeStyleCache after the operation is done.
	 * cache structure:
	 * { <styleId>: { <styleJsonHash> : [resultStyleId] } }  
	 */
	enableStyleChgCache: function()
	{
		if (this.bStyleChgCacheOpened) {
			console.error("style change cache already opened. forget to close previous cache? do nothing");
		} else {
			this.styleChgCache = {};
			this.bStyleChgCacheOpened = true;
		}
	},
	
	disableStyleChgCache: function()
	{
		if (this.bStyleChgCacheOpened) {
			this.bStyleChgCacheOpened = false;
			// clear cache
			for (var i in this.styleChgCache) {
				var o = this.styleChgCache[i];
				for (var j in o) {
					delete o[j];
				}
				delete this.styleChgCache[i];
			}
			delete this.styleChgCache;
		} else {
			console.error("style change cache not opened. do nothing");
		}
	},
	
	/*
	 * change the styleCode of "styleId" by the given style
	 * param styleId: string
	 * param style: json object
	 * output, the styleId for the new styleCode
	 */
	changeStyle: function(styleId, style)
	{
		var h = 0;
		var wsConst = websheet.Constant;
		if (this.bStyleChgCacheOpened) {
			h = style[wsConst.Style.HASH_CODE];
			if (!h) {
				h = style[wsConst.Style.HASH_CODE] = this._styleJsonHashCode(style, /* is style json */ true);
			}
			// cache in use, try hit cache
			var s = this.styleChgCache[styleId];
			if (s) {
				s = s[h];
				if (s) {
					// cache hit
					// add refCount of this styleCode, for it is being used
					var sc = this.styleMap[s];
					if (sc) {
						sc.refCount++;
						return s;
					}
				}
			}
		}
		
		var newStyleId;
		var oriStyleCode = this.styleMap[styleId];
		if(!oriStyleCode) {
			newStyleId = this.addStyle(style);
		} else {
			this.deleteStyle(styleId);
			var newStyleCode = new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.OBJECT,oriStyleCode);
			var changeCode = new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.JSON,style);
			newStyleCode.changeStyle(changeCode);
			newStyleCode.removeDefaultAttr();
			if(newStyleCode.isDefault()) return null;
			newStyleId = this.addStyle(newStyleCode,true);		
		}
		
		if (this.bStyleChgCacheOpened) {
			// update cache
			var s = this.styleChgCache[styleId];
			if (s == undefined) {
				s = this.styleChgCache[styleId] = {};
			}
			s[h] = newStyleId;
		}
		return newStyleId;
	},
	
	/*
	 * merge style1 and style2
	 * param style1: json object
	 * param style2: json object
	 * output, the merged style
	 */
	mixStyleJson: function(/*Object*/ style1, /*Object*/ style2)
	{
		if(!style1) style1 = {};
		if(!style2) return style1;
		//var tobj = {};
		for(var x in style2){
			if(dojo.isObject(style1[x]) && dojo.isObject(style2[x])){
				this.mixStyleJson(style1[x], style2[x]);
			}
			if(style1[x] === undefined){
				style1[x] = style2[x];
			}
		}
		return style1; // Object
	},
	
	/*
	 * for every attribute in style2, get the corresponding attribute in style1,
	 * if style2 is default style, return style1 json
	 * style1: style json, if null, constrcut one
	 * style2: style json, if contain id, it must be default style id
	 * output: style json  or null, if null means style1 is null and style2 is default style
	 */
	getDelta: function(style1,style2)
	{
		// if the style2 json contain style id, it must be default style id
		if(style2 && style2.id)
		{
			if(style1) 
				return  dojo.clone(style1);
			return null;
		}
		var delta = {};
		if(!style2)
			return delta;
		if(!style1)
			style1 = {};
		for( var attr in style2)
		{
			var subStyle2 = style2[attr];
			var subStyle1 = style1[attr];
			if(subStyle1 != undefined)
			{
				var subDelta = {};
				var bHasSub = false;
				if(typeof subStyle2 == "object")
				{
					for(var subAttr in subStyle2)
					{
						bHasSub = true;
						var subValue = subStyle1[subAttr];
						this._setStyle(subDelta, subAttr, subValue);
					}
				}
				if(bHasSub)
					delta[attr] = subDelta;
				else
					delta[attr] = subStyle1;
			}else
			{
				//style1 does not contains attr style
				var subDelta = {};
				var bHasSub = false;
				var isObj = false;
				if(typeof subStyle2 == "object")
				{
					isObj = true;
					for(var subAttr in subStyle2)
					{
						bHasSub = true;
						this._setStyle(subDelta, subAttr, null);
					}
				}
				if(bHasSub)
					delta[attr] = subDelta;
				else if(!isObj)
				    this._setStyle(delta, attr, null);
                
			}
		}
		return delta;
//		var styleCode1 = new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.JSON,style1);
//		var delta =  new websheet.style.StyleCode();
//		var styleCode2 = new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.JSON,style2);
//
//		var attrs2 = styleCode2._attributes;
//		for(var attr in attrs2)
//		{
//			var value = styleCode1._attributes[attr];
//			if(undefined == value)
//			{
//				if(delta.isBooleanAttr(attr))
//				{
//					delta.setAttr(attr,false);
//				}else{
//					delta.setAttr(attr,"");
//				}
//			}else{
//				delta.setAttr(attr,value);
//			}
//		}
//		return delta.toJSON();
	},
	
	_setStyle:function(delta, attr, value)
	{
		// summary: put { attr: value } to delta object, called from getDelta()
		if (value == null) {
			// if value is null, need to set attr to default value, read from default cell style
			delta[attr] = this._dcs._attributes[attr];
		} else {
			delta[attr] = value;
		}
	},
	
	/*
	 * get the intersection in two styles
	 * @param style1	 styleCode
	 * @param style2	 styleCode 
	 * return StyleCode
	 */
	/*StyleCode*/getInterSect: function(style1,style2)
	{
		var attrs1 = style1._attributes;
		var interSect =  new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.JSON,null);
		var hasInterSect = false;
		for(var attr in attrs1)
		{
			var value = style2._attributes[attr];
			if(undefined != value)
			{
				interSect.setAttr(attr,value);
				hasInterSect = true;
			}
		}
		if(hasInterSect){
			return interSect;
		}
		return null;
	},
	
	addRefCount: function(styleId)
	{
		var styleCode = this.styleMap[styleId];
		if(!styleCode){return;}
		styleCode.refCount++;
	},

	/*
	 * delete the style
	 * keep its styleCode object until its refCount is 0
	 */	
	deleteStyle: function(styleId)
	{
		//for default style, keep it forever
		if(styleId.indexOf(websheet.Constant.Style.DEFAULT)!= -1) return;

		var styleCode = this.styleMap[styleId];
		if(!styleCode){return;}
		styleCode.refCount--;
		if(styleCode.refCount <= 0)
		{
			this.styleMap[styleId] = undefined;
			delete this.styleMap[styleId];
			var styleHashCode = styleCode.hashCode();
			if(this._hashCodeIdMap)
			{
				this._hashCodeIdMap[styleHashCode] = undefined;
				delete this._hashCodeIdMap[styleHashCode];
			}	
		}
	},
	
	// calculate hashCode for a StyleCode object or style json (by set bJson = true)
	_styleJsonHashCode: function(/* style json */ style)
	{
		if (style.hashCode) {
			return style.hashCode;
		}
		
		var h;
		// style set
		var wcs = websheet.Constant.Style;
		var helper = websheet.Helper;
		h = helper.hashCode(style[wcs.TEXT_ALIGN]);
		h = helper.hashCode(style[wcs.VERTICAL_ALIGN], h);
		h = helper.hashCode(style[wcs.BACKGROUND_COLOR], h);
		h = helper.hashCode(style[wcs.INDENT], h);
		h = helper.hashCode(style[wcs.WRAPTEXT], h);
		h = helper.hashCode(style[wcs.PROTECTION_UNLOCKED], h);
		h = helper.hashCode(style[wcs.PROTECTION_HIDDEN], h);
		h = helper.hashCode(style[wcs.DIRECTION], h);
		// font set
		var o = style[wcs.FONT] || {};
		h = helper.hashCode(o[wcs.FONTNAME], h);				
		h = helper.hashCode(o[wcs.SIZE], h);				
		h = helper.hashCode(o[wcs.COLOR], h);				
		h = helper.hashCode(o[wcs.ITALIC], h);				
		h = helper.hashCode(o[wcs.UNDERLINE], h);				
		h = helper.hashCode(o[wcs.STRIKETHROUGH], h);
		h = helper.hashCode(o[wcs.BOLD], h);				
		// format set
		o = style[wcs.FORMAT] || {};
		h = helper.hashCode(o[wcs.FORMATTYPE], h);				
		h = helper.hashCode(o[wcs.FORMATCODE], h);				
		h = helper.hashCode(o[wcs.FORMATCURRENCY], h);	
		h = helper.hashCode(o[wcs.FORMAT_FONTCOLOR], h);
		
		// border set
		o = style[wcs.BORDER] || {};
		h = helper.hashCode(o[wcs.BORDER_LEFT], h);				
		h = helper.hashCode(o[wcs.BORDER_RIGHT], h);				
		h = helper.hashCode(o[wcs.BORDER_BOTTOM], h);				
		h = helper.hashCode(o[wcs.BORDER_TOP], h);				
		// border color set
		o = style[wcs.BORDERCOLOR] || {};
		h = helper.hashCode(o[wcs.BORDER_LEFT_COLOR], h);				
		h = helper.hashCode(o[wcs.BORDER_RIGHT_COLOR], h);				
		h = helper.hashCode(o[wcs.BORDER_BOTTOM_COLOR], h);				
		h = helper.hashCode(o[wcs.BORDER_TOP_COLOR], h);	
		// border style set
		o = style[wcs.BORDERSTYLE] || {};
		h = helper.hashCode(o[wcs.BORDER_LEFT_STYLE], h);				
		h = helper.hashCode(o[wcs.BORDER_RIGHT_STYLE], h);				
		h = helper.hashCode(o[wcs.BORDER_BOTTOM_STYLE], h);				
		h = helper.hashCode(o[wcs.BORDER_TOP_STYLE], h);	
		return h;
	},
	
	/*
	 * get the style delta change info if this style shoud be set to default
	 */	
	getChange4Default: function(styleCode)
	{
		var changeStyle = new websheet.style.StyleCode(websheet.Constant.PARAM_TYPE.OBJECTTYPE,null);
		var attrs = styleCode._attributes;
		for(var attr in attrs)
		{
			if(changeStyle.isBooleanAttr(attr))
			{
				changeStyle.setAttr(attr,false);
			}
			else
			{
				changeStyle.setAttr(attr,"");
			}
		}
		return changeStyle.toJSON();
	},

	newUUID:function (){
		var uuid = "";
		for (var i = 1; i <= 32; i++)
		{
			var n = Math.floor(Math.random()*16.0).toString(16);
			uuid += n;
			if((i==8)||(i==12)||(i==16)||(i==20))
					uuid += "_";
		}
		return uuid;
	},
	
	getAttr: function(styleCode, attr) {
		// summary: get style attribute from provided styleCode, with fallback to default cell style
		// 	this function is null safe. if styleCode is null, fall back to default cell style
		if (styleCode == null) {
			return this._dcs._attributes[attr];
		} else {
			var v = styleCode._attributes[attr];
			if (v == null || v.length == 0) {
				v = this._dcs._attributes[attr];
			}
			return v;
		}
	},
	
	// get attributes to be rendered on controls like toolbar
	/*json*/getUIAttrs: function(styleCode) {
		var Style = websheet.Constant.Style;
		var bold = this.getAttr(styleCode, Style.BOLD);
		var italic = this.getAttr(styleCode, Style.ITALIC);
		var underline = this.getAttr(styleCode, Style.UNDERLINE);
		var strikethrough = this.getAttr(styleCode, Style.STRIKETHROUGH);		
		var wrapText = this.getAttr(styleCode, Style.WRAPTEXT);
		var category = this.getAttr(styleCode, Style.FORMATTYPE);
		var code = this.getAttr(styleCode, Style.FORMATCODE);
		var currency = this.getAttr(styleCode, Style.FORMATCURRENCY);
		var textAlign = this.getAttr(styleCode, Style.TEXT_ALIGN);
		var verticalTextAlign = this.getAttr(styleCode, Style.VERTICAL_ALIGN);
		var fontSize = this.getAttr(styleCode, Style.SIZE);
		var fontName = this.getAttr(styleCode, Style.FONTNAME);
		var dir = this.getAttr(styleCode, Style.DIRECTION);
		var color = this.getAttr(styleCode, Style.COLOR);
		var bgColor = this.getAttr(styleCode, Style.BACKGROUND_COLOR);
		
		var attrs = {};
		attrs[Style.BOLD] = bold;
		attrs[Style.ITALIC] = italic;
		attrs[Style.UNDERLINE] = underline;
		attrs[Style.STRIKETHROUGH] = strikethrough;
		attrs[Style.WRAPTEXT] = wrapText;
		attrs[Style.TEXT_ALIGN] = textAlign;
		attrs[Style.VERTICAL_ALIGN] = verticalTextAlign;
		attrs[Style.SIZE] = fontSize;
		attrs[Style.FONTNAME] = fontName;
		attrs[Style.FORMATTYPE] = category;
		attrs[Style.FORMATCODE] = code;
		attrs[Style.FORMATCURRENCY] = currency;
		attrs[Style.DIRECTION] = dir;
		attrs[Style.COLOR] = color;
		attrs[Style.BACKGROUND_COLOR] = bgColor;
		/*
		attrs[Style.BORDER_LEFT] = this.getAttr(styleCode, Style.BORDER_LEFT);
		attrs[Style.BORDER_LEFT_STYLE] = this.getAttr(styleCode, Style.BORDER_LEFT_STYLE);
		attrs[Style.BORDER_LEFT_COLOR] = this.getAttr(styleCode, Style.BORDER_LEFT_COLOR);
		attrs[Style.BORDER_RIGHT] = this.getAttr(styleCode, Style.BORDER_RIGHT);
		attrs[Style.BORDER_RIGHT_STYLE] = this.getAttr(styleCode, Style.BORDER_RIGHT_STYLE);
		attrs[Style.BORDER_RIGHT_COLOR] = this.getAttr(styleCode, Style.BORDER_RIGHT_COLOR);
		attrs[Style.BORDER_TOP] = this.getAttr(styleCode, Style.BORDER_TOP);
		attrs[Style.BORDER_TOP_STYLE] = this.getAttr(styleCode, Style.BORDER_TOP_STYLE);
		attrs[Style.BORDER_TOP_COLOR] = this.getAttr(styleCode, Style.BORDER_TOP_COLOR);
		attrs[Style.BORDER_BOTTOM] = this.getAttr(styleCode, Style.BORDER_BOTTOM);
		attrs[Style.BORDER_BOTTOM_STYLE] = this.getAttr(styleCode, Style.BORDER_BOTTOM_STYLE);
		attrs[Style.BORDER_BOTTOM_COLOR] = this.getAttr(styleCode, Style.BORDER_BOTTOM_COLOR);
		*/
		return attrs;
	},
	
	/**
	 * Conditional Format styleManager, it's runtime cache for calculated StyleCode
	 */
	/**/getCFStyleMgr:function() {
		return this._cfStyleManager;
	}
});