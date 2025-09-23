dojo.provide("writer.model.Theme");

dojo.declare("writer.model.Theme", [], {
	_fontScheme: null,
	_colorScheme: null,
	_fmtScheme : null,
	_cacheFont : {},
//	_languageMap: [{"en-US":"latin"}],
	
	constructor: function(jsonData) {
		var themeElements = jsonData["themeElements"];
		if( themeElements != undefined)
		{
			this._fontScheme	= themeElements["fontScheme"];
			this._colorScheme	= themeElements["clrScheme"];
		}	
	},
	
	_getFont: function(lang, fonts)
	{
		if(!fonts || !fonts.length)
			return null;
		
		var font = this._cacheFont[lang];
		if(font)
			return font;
		
		for(var i = 0; i < fonts.length; i++)
		{
			if(lang == fonts[i]["script"])
			{
				font = fonts[i]["typeface"];
				this._cacheFont[lang] = font;
				return font;
			}
		}	
		
		return null;
	},
	
	// Defect 42619
	getThemeFontByHint: function(theme, hint)
	{
		if(this._fontScheme == null || !theme)
			return null;
		
		var fontType = null;
		if(theme.indexOf("major") == 0)
			fontType = this._fontScheme["majorFont"];
		else if(theme.indexOf("minor") == 0)
			fontType = this._fontScheme["minorFont"];
		else
			return this.getThemeFont(theme);
		
		var lang = "latin";
		if(hint == "eastAsia")
			lang = "ea";
		else if(hint == "cs")
			lang = "cs";
		
		var fontVal = fontType[lang];
		if(fontVal != undefined)
		{
			var font = fontVal["typeface"];
			if(font && font != "")
				return font;
			
			fontVal = fontType["latin"];	// Fall back
			font = fontVal["typeface"];
			if(font && font != "")
				return font;
		}
		
		return this.getThemeFont(theme);
	},
	
	/**
	 * Return the document default theme.
	 * @param fontType Font type is minorHAnsi or majorHAnsi
	 * @param language Language type is en-US, zh-CN
	 */
	getThemeFont : function(themeFont, language)
	{
		if(this._fontScheme != null && themeFont)
		{	
			var fontType = null;
			if(themeFont == 'majorHAnsi' || themeFont == "majorAscii")
				fontType = this._fontScheme["majorFont"];
			else if(themeFont == 'minorHAnsi' || themeFont == "minorAscii")
				fontType = this._fontScheme["minorFont"];

			if(fontType != null)
			{
				//language = language || "latin";
				language = "latin";
				var fontVal = fontType[language];
				if(fontVal != undefined)
					return fontVal["typeface"];
			}
			else{
				// Fall back font from theme
				switch(themeFont)
				{
				case "majorBidi":
					fontType = this._fontScheme["majorFont"];
					if(dojo.locale.indexOf("he" == 0))
						language = language || "Hebr";
					else
						language = language || "Arab";
					break;
				case "minorBidi":
					fontType = this._fontScheme["minorFont"];
					if(dojo.locale.indexOf("he" == 0))
						language = language || "Hebr";
					else
						language = language || "Arab";
					break;
				case "majorEastAsia":
					fontType = this._fontScheme["majorFont"];
					if(dojo.locale == "zh-cn")
						language = language || "Hans";
					else if(dojo.locale.indexOf("zh") == 0)
						language = language || "Hant";
					else if(dojo.locale.indexOf("ja") == 0)
						language = language || "Jpan";
					else if(dojo.locale.indexOf("ko") == 0)	
						language = language || "Hang";
					else
						language = language || "Hans"; 
					break;
				case "minorEastAsia":
					fontType = this._fontScheme["minorFont"];
					if(dojo.locale == "zh-cn")
						language = language || "Hans";
					else if(dojo.locale.indexOf("zh") == 0)
						language = language || "Hant";
					else if(dojo.locale.indexOf("ja") == 0)
						language = language || "Jpan";
					else if(dojo.locale.indexOf("ko") == 0)	
						language = language || "Hang";
					else
						language = language || "Hans"; 
					break;
				};
				
				var fonts = fontType && fontType["fonts"];
				
				return this._getFont(language, fonts); 
			}
				
		}
		return null;
	},
	
	/**
	 * Return the document color scheme
	 * @param schemeClr scheme key of color
	 */
	getSchemeColor: function(schemeClr)
	{
		if (!this._colorScheme)
			return null;
			
		var scheme = this._colorScheme[schemeClr];
		if (!scheme)
			return null;
			
		if (scheme.srgbClr)
			return scheme.srgbClr;
		else if (scheme.sysClr && scheme.sysClr.lastClr)
			return scheme.sysClr.lastClr;
		else
			return null;
	}
});