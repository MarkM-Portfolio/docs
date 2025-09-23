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
define([
    "dojo/_base/array",
    "dojo/_base/declare",
    "dojo/_base/kernel"
], function(array, declare, kernel) {

    var Theme = declare("writer.model.Theme", [], {
        _fontScheme: null,
        _colorScheme: null,
        _fmtScheme: null,
        _cacheFont: {},
        //	_languageMap: [{"en-US":"latin"}],

        constructor: function(jsonData) {
            var themeElements = jsonData["themeElements"];
            if (themeElements != undefined) {
                this._fontScheme = themeElements["fontScheme"];
                this._colorScheme = themeElements["clrScheme"];
            }
        },

        _getFont: function(fs, fonts) {
            if (!fonts || !fonts.length)
                return null;

            var font = this._cacheFont[fs];
            if (font)
                return font;

            for (var i = 0; i < fonts.length; i++) {
                if (fs == fonts[i]["script"]) {
                    font = fonts[i]["typeface"];
                    this._cacheFont[fs] = font;
                    return font;
                }
            }

            return null;
        },

        // Defect 42619
        getThemeFontByHint: function(theme, hint) {
            if (this._fontScheme == null || !theme)
                return null;

            var fontType = null;
            if (theme.indexOf("major") == 0)
                fontType = this._fontScheme["majorFont"];
            else if (theme.indexOf("minor") == 0)
                fontType = this._fontScheme["minorFont"];
            else
                return this.getThemeFont(theme);

            var lang = "latin";
            if (hint == "eastAsia")
                lang = "ea";
            else if (hint == "cs")
                lang = "cs";

            var fontVal = fontType[lang];
            if (fontVal != undefined) {
                var font = fontVal["typeface"];
                if (font && font != "")
                    return font;

                if(lang == "ea") {
                    var docLang = pe.lotusEditor.styles.getDocDefaultLang();
                    var fs = this.getEAFontScript((docLang && docLang[hint]));
                    var fonts = fontType && fontType["fonts"];
                    font = this._getFont(fs, fonts);
                    if(font && font != "")
                    	return font;
                }

                fontVal = fontType["latin"]; // Fall back
                font = fontVal["typeface"];
                if (font && font != "")
                    return font;
            }

            return this.getThemeFont(theme);
        },

        /**
         * Return the document default theme.
         * @param fontType Font type is minorHAnsi or majorHAnsi
         * @param language Language type is en-US, zh-CN
         */
        getThemeFont: function(themeFont, language) {
            if (this._fontScheme != null && themeFont) {
                var fontType = null;
                if (themeFont == 'majorHAnsi' || themeFont == "majorAscii")
                    fontType = this._fontScheme["majorFont"];
                else if (themeFont == 'minorHAnsi' || themeFont == "minorAscii")
                    fontType = this._fontScheme["minorFont"];

                if (fontType != null) {
                    //language = language || "latin";
                    language = "latin";
                    var fontVal = fontType[language];
                    if (fontVal != undefined)
                        return fontVal["typeface"];
                } else {
                    // Fall back font from theme
                    switch (themeFont) {
                        case "majorBidi":
                            fontType = this._fontScheme["majorFont"];
                            if (array.indexOf("he") == 0)
                                language = language || "Hebr";
                            else
                                language = language || "Arab";
                            break;
                        case "minorBidi":
                            fontType = this._fontScheme["minorFont"];
                            if (array.indexOf("he")== 0)
                                language = language || "Hebr";
                            else
                                language = language || "Arab";
                            break;
                        case "majorEastAsia":
                            fontType = this._fontScheme["majorFont"];
                            if(!language) {
                                if (kernel.locale == "zh-cn")
                                	language = "Hans";
                                else
                                	language = this.getEAFontScript(array);
                            }
                            break;
                        case "minorEastAsia":
                            fontType = this._fontScheme["minorFont"];
                            if(!language) {
                                if (kernel.locale == "zh-cn")
                                	language = "Hans";
                                else
                                	language = this.getEAFontScript(array);
                            }
                            break;
                    };

                    var fonts = fontType && fontType["fonts"];

                    return this._getFont(language, fonts);
                }
            }
            return null;
        },

        getEAFontScript: function(langCode) {
        	var fs = "Hans", lc = langCode;
        	if(!lc) return fs;

        	if(typeof lc=="string")
        		lc = lc.toLowerCase();
            if (lc == "zh-cn")
            	fs = "Hans";
            else if (lc.indexOf("zh") == 0)
            	fs = "Hant";
            else if (lc.indexOf("ja") == 0)
            	fs = "Jpan";
            else if (lc.indexOf("ko") == 0)
            	fs = "Hang";
            return fs;    	
        },

        /**
         * Return the document color scheme
         * @param schemeClr scheme key of color
         */
        getSchemeColor: function(schemeClr) {
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
    return Theme;
});
