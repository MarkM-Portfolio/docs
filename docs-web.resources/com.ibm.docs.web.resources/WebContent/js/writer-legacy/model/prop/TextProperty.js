dojo.provide("writer.model.prop.TextProperty");

var preserveObj = "preserve";

writer.model.prop.TextProperty = function(json){
	// Use this attribute to record back up attribute before normalize. So that it's easy to return it from this attribute.
	// Also use to do merge.
	if(json)
	{
		if(json[preserveObj])
		{
			this.preserve = json[preserveObj];
			delete json[preserveObj];
		}
		this.fromJson(json);
	}
	else
	{
		this._decoration = {};
		this.style = {};
	}
};

writer.model.prop.TextProperty.prototype = {
	type: writer.model.prop.Property.TEXT_PROPERTY,
	
	/**
	 * Compare the font priority which defined in rFonts
	 * Font priority is ascii > HAnsi > eastAsia > cs
	 */
	_fontPriority: {"ascii":0, "HAnsi":1, "eastAsia":2, "cs":3},
	_textDeco : "text-decoration",
	
	fromJson: function(json)
	{
		this.style = json;
		
		//add style Id 
		this.styleId = json.styleId;
		this._decoration = {};
		delete json.styleId;
		this._normalize();
	},

	// a font name maybe an array "Simsun,宋体", now we only get the first.
	_getFirstFontname: function(fontName)
	{
		if (!fontName)
			return fontName;

		if ((typeof fontName) == "string")
			return fontName.split(',')[0];
		else
			return fontName;
	},
	
	_updateFont: function(rFonts)
	{
		var hint = rFonts.hint || "ascii";
		var font = this._getFirstFontname(rFonts[hint]);
		if(!font)
		{
			var themeFont = null;
			var keySeq = null;
			for(var f in rFonts)
			{
				if(f != "hint" && f.indexOf("heme") == -1)	// Not theme/Theme font
				{
					if(keySeq == null || this._fontPriority[keySeq] > this._fontPriority[f])
					{
						font = this._getFirstFontname(rFonts[f]);
						keySeq = f;
					}
				}
				else if(f == "asciiTheme")
					themeFont = this._getFirstFontname(rFonts[f]);
			}
			if(!font && rFonts.hint)
			{
				themeFont = this._getFirstFontname(rFonts[rFonts.hint + "Theme"]);
			}
			if(!font && themeFont != null)
			{
				var rel = pe.lotusEditor.relations;
				var theme = rel&&rel.getTheme();
				if(theme)
				{
					font = rFonts.hint ? theme.getThemeFontByHint(themeFont, rFonts.hint) : theme.getThemeFont(themeFont);
				}	
			}
		}	
		 if(font)
			 this.style["font-family"] = font;
		 else
			 delete this.style["font-family"];
	},
	
	_normalize:function(){
		var s = this.style;
		// Underline
		if(s.u)
		{
			if(s.u.val != "none")
				s[this._textDeco] = "underline";
			this._decoration.u = s.u;
			delete s.u;
		}	
		
		// Line through
		var bStrike = false;
		if(s.strike)
		{
			if(s.strike != "-1"){
				bStrike = true;
				if(s[this._textDeco])
					s[this._textDeco] += " line-through";
				else
					s[this._textDeco] = "line-through";
			}
			this._decoration.strike = s.strike;
			delete s.strike;
		}
		if(s.dstrike && !bStrike)
		{
			// Treat the dstrike as strike
			if(s.dstrike != "-1"){
				if(s[this._textDeco])
					s[this._textDeco] += " line-through";
				else
					s[this._textDeco] = "line-through";
			}
			this._decoration.strike = s.dstrike;
			delete s.dstrike;
		}
		
		// Font family
		if(s.rFonts)
		{
			this._updateFont(s.rFonts);
			delete s.rFonts;
		}

		// Spell check and Grammar language
		if(s.lang)
			delete s.lang;
		
		// Text shading
		if(s.shd)
		{
			if(!s["background-color"])                       //highlight : background-color
			{
				if(s.shd.fill=="FFFFFF" && s.shd.val=="pct15") //character shading, only have one style,to color:D9D9D9
					this.style["background-color"] = "#D9D9D9";
				else                                                //shading
					this.style["background-color"] = "#"+s.shd.fill;
			}
			delete s.shd;
		}		
		
		// Text border
		if(s.bdr)
		{
			this.border = s.bdr;
			delete s.bdr;
		}
	},

	/**
	 * Only clone the real HTML style
	 */
	_cloneStyle:function()
	{
		var jsonData = {};
		var s = this.style;
		for(var name in s)
			jsonData[name] = s[name];
		
		if(this.styleId)
			jsonData.styleId = this.styleId;
		
		if(this.border)
			jsonData.bdr = dojo.clone(this.border);
		return jsonData;
	},
	
	/**
	 * Return the original JSON data.
	 * @returns {___jsonData0}
	 */
	toJson: function()
	{
		var jsonData = this._cloneStyle();
		
		for(var k in this._decoration)
			jsonData[k] = this._decoration[k];
		
		var kf="font-family";
		if(jsonData[kf]){
			jsonData.rFonts = {"ascii":jsonData[kf]};
			delete jsonData[kf];
		}
		
		delete jsonData[this._textDeco];
		if(common.tools.isEmpty(jsonData)){
			return undefined;
		}
		return jsonData;
	},
	
	clone : function()
	{
		//return dojo.clone(this);
		//var j = dojo.clone(this.style);	// Replace dojo.clone for Performance reason
		return new writer.model.prop.TextProperty(this.toJson());
	},
	
	getStyleId: function()
	{
		return this.styleId;
	},
	getBorder: function()
	{
		return this.border;
	},
	
	equalStyle: function(destProp)
	{
		if(!destProp || this.type != destProp.type)
			return false;
		
		var srcStyle = this.style, destStyle = destProp.style;
		for(var item in srcStyle)
		{
			if(item != preserveObj && srcStyle[item] != destStyle[item])
				return false;
		}
		for(var item in destStyle)
		{
			if(item != preserveObj && srcStyle[item] != destStyle[item])
				return false;
		}
		
		if( this.styleId != destProp.styleId )
			return false;
		
		return true;
	},
	_updateDecoration:function()
	{
		var s = this.style;
		delete s[this._textDeco];
		
		var dec = this._decoration;
		if(dec.u)
		{
			if(dec.u.val != "none")
				s[this._textDeco] = "underline";
		}	
		
		if(dec.strike)
		{
			if(dec.strike != "-1"){
				if(s[this._textDeco])
					s[this._textDeco] += " line-through";
				else
					s[this._textDeco] = "line-through";
			}
		}	
	},
	
	setStyle: function(styleDef,bRemove){
		for (var key in styleDef){
			if (bRemove){
				if(key === "strike")
				{
					this._decoration.strike = styleDef["strike"];
					this._updateDecoration();
				}
				else if(key === "u")
				{
					this._decoration.u = styleDef["u"];
					this._updateDecoration();
				}
				else if(key==="font-weight")
					this.style[key] = "normal";
				else if(key==="font-style")
					this.style[key] = "normal";
				else if(key == "rFonts")
					delete this.style["font-family"];
				else
					delete this.style[key];
			}else{
				if(key === "bdr")
				{
					if(this.border)
						this.border = null;
					else
					{
						this.border = styleDef[key];
						this.style['bdr'] = styleDef[key];
					}
				}
				else if(key === "u")
				{
					this._decoration.u = styleDef["u"];
					this._updateDecoration();
				}
				else if(key === "strike")
				{
					this._decoration.strike = styleDef["strike"];
					this._updateDecoration();
				}
				else if(key == "rFonts")
				{
					this._updateFont(styleDef[key]);
				}	
				else
					this.style[key] = styleDef[key];					
			}
		}
		//this.style[styleName] = value;
	},
	/**
	 * background color
	 * @returns
	 */
	getBackgroundColor:function(){
		return this.style["background-color"];
	},
	getStyle: function()
	{
		var retStyle = this._cloneStyle();
		if( this.styleId )
		{
			var refStyle = pe.lotusEditor.getRefStyle(this.styleId);
			if( refStyle )
			{
				refStyle.addReferer(this);
				var des = refStyle.getMergedTextProperty();
				if( des && des != "empty"){
					if(!this._decoration.strike && des._decoration.strike)
						this._decoration.strike = des._decoration.strike;
					this._mergeStyle(des.getStyle(), retStyle, this);
				}
			}
		}
		
		return retStyle;
	},
	
	/**
	 * Only use it to create message
	 */
	getUnderline: function()
	{
		var underline = {};
		underline["u"] = this._decoration.u || "";
		return underline;
	},
	
	/**
	 * Only use it to create message
	 */
	getStrike: function()
	{
		var strike = {};
		strike["strike"] =  this._decoration.strike || "";
		return strike;
	},
	
	/**
	 * Only use it to create message
	 */
	getFontFamily: function()
	{
		var font = {};
		font.rFonts = {"ascii":this.style["font-family"]};
			
		return font;
	},
	
	getComputedStyle : function(parentTextProp)
	{
		var retStyle = this.getStyle();
		if(parentTextProp && parentTextProp != "empty")
			this._mergeStyle(parentTextProp.getStyle(), retStyle, this);
		
		return retStyle;
	},
	
	/**
	 * Merge srcStyle style into destStyle
	 * @param srcStyle Source style
	 * @param destStyle Destination style
	 * @param destTextProperty The destination text property object. Use it merge underline and line-through attribute
	 * @return destStyle
	 */
	_mergeStyle : function(srcStyle, destStyle, destTextProperty)
	{
		var destVal;
		for(var item in srcStyle)
		{
			destVal = destStyle[item] || "";
			if(item == "text-decoration")
			{
				var srcVal = srcStyle[item];
				if(destVal != srcVal)
				{	
					// Destination include source.
					if(destVal.indexOf(srcVal) != -1)
						continue;
					
					if(srcVal.indexOf(destVal) != -1)
						destVal = srcVal;
					else
						destVal += (destVal.length > 0 ? " " : "") + srcVal;
					
					var cleaned = false;
					if(destTextProperty && destTextProperty._decoration.u && destTextProperty._decoration.u.val == "none")
					{
						destVal = destVal.replace(/underline/g, "");
						cleaned = true;
					}
					
					if(destTextProperty && destTextProperty._decoration.strike == "-1")
					{
						destVal = destVal.replace(/line-through/g, "");
						cleaned = true;
					}
					
					cleaned && (destVal = destVal.replace(/ /g, ""));
					destStyle[item] = destVal;
				}
			}
			else if(destVal == undefined || destVal == "")
					destStyle[item] = srcStyle[item];
		}	
		
		return destStyle;
	},
	
	/**
	 * Merge current object to the destination text property object.
	 * @param destProp
	 * @param needClone
	 * @returns
	 */
	merge: function(destProp, needClone)
	{
		destProp = needClone ? destProp.clone() : (destProp || this.clone());
		var srcStyle = this.styleId ? this.getStyle() : this.style;
		this._mergeStyle(srcStyle, destProp.style, destProp);
		
		return destProp;
	},
	clearInlineStyle: function()
	{
		this.style = {};		
	},
	clear: function()
	{
		this.style = {};
		this.styleId = null;
	}
};
common.tools.extend(writer.model.prop.TextProperty.prototype,new writer.model.Model());
