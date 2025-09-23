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
define([], function() {

    var FontTools = {

        _cache: {},
        
        normalizeFontName: function(ff)
        {
            if (!ff)
                return ff;
            ff = ff.trim();
            if (ff.indexOf(" ") > 0 && ff.indexOf("'") < 0 && ff.indexOf("\"") < 0)
                return "'" + ff + "'";
            return ff;     
        },

        fallbackFontsInCss: function(css) {

            if (!css)
                return css;

            var index = css.toLowerCase().indexOf("font-family");
            if (index < 0)
                return css;

            css = css.replace(/\'?Helvetica Neue Light\'?/gi,
                "'Helvetica Neue Light',HelveticaNeueLight,HelveticaNeue-Light,'HelveticaKKKNeue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");

            css = css.replace(/\'?Helvetica Neue Black Condensed\'?/gi,
                "'Helvetica NeueKKKBlack Condensed',HelveticaNeueBlackCondensed,HelveticaNeue-Black-Condensed,HelveticaNeueBlack,HelveticaNeue-Black,'Helvetica NeueKKKBlack','HelveticaKKKNeue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");

            css = css.replace(/\'?Helvetica Neue Black\'?/gi,
                "'Helvetica Neue Black',HelveticaNeueBlack,HelveticaNeue-Black,'HelveticaKKKNeue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");

            css = css.replace(/\'?Helvetica Neue Heavy\'?/gi,
                "'Helvetica Neue Heavy',HelveticaNeueHeavy,HelveticaNeue-Heavy,'HelveticaKKKNeue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");

            css = css.replace(/\'?Helvetica Neue Bold Condensed\'?/gi,
                "'Helvetica NeueKKKBold Condensed',HelveticaNeueBoldCondensed,HelveticaNeue-Bold-Condensed,HelveticaNeueBold,HelveticaNeue-Bold,'Helvetica NeueKKKBold','HelveticaKKKNeue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");

            css = css.replace(/\'?Helvetica Neue Bold\'?/gi,
                "'Helvetica Neue Bold',HelveticaNeueBold,HelveticaNeue-Bold,'HelveticaKKKNeue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");

            css = css.replace(/\'?Helvetica Neue Medium\'?/gi,
                "'Helvetica Neue Medium',HelveticaNeueMedium,HelveticaNeue-Medium,'HelveticaKKKNeue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");

            css = css.replace(/\'?Helvetica Neue Thin\'?/gi,
                "'Helvetica Neue Thin',HelveticaNeueThin,HelveticaNeue-Thin,'HelveticaKKKNeue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");

            css = css.replace(/\'?Helvetica Neue UltraLight\'?/gi,
                "'Helvetica Neue UltraLight',HelveticaNeueUltraLight,HelveticaNeue-UltraLight,'HelveticaKKKNeue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");

            var mts = css.match(/\'Helvetica Neue[^};,]*/gi);
            mts && mts.forEach(function(mt){
            	var m1 = mt.match(/(KKK| Light| Black| Heavy| Bold| Medium| Thin| UltraLight)\'$/gi); 
            	if(!m1 || (m1.length==0)){
            		var regx = new RegExp(mt,"gim");
            		css = css.replace(regx,"'HelveticaKKKNeue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
            	}
            });

            css = css.replace(/\'?Helvetica Neue(?!KKK| Light| Black| Heavy| Bold| Medium| Thin| UltraLight)\'?/gi, "'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");

            css = css.replace(/\'HelveticaKKKNeue\'/g, "'Helvetica Neue'");

            css = css.replace(/NeueKKKBlack/g, "Neue Black");

            css = css.replace(/NeueKKKBold/g, "Neue Bold");

            css = css.replace(/\'?Calibri Light\'?/gi, "'CKKKalibriKKKLight'");

            css = css.replace(/\'?Calibri\'?/gi, "Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");

            css = css.replace(/\'CKKKalibriKKKLight\'/g, "'Calibri Light',Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");

            return css;
        },

        fallbackFonts: function(font) {
            if (!font)
                return font;

            if (this._cache && this._cache[font])
                return this._cache[font];

            var ff = this._fallbackFonts(font);
            this._cache[font] = ff;

            return ff;
        },

        _fallbackFonts: function(font) {

            if (!font)
                return font;

            var lowerCaseFont = font.toLowerCase();

            var index = lowerCaseFont.indexOf("helvetica neue");
            var index2 = lowerCaseFont.indexOf("calibri");
            if (index < 0 && index2 < 0)
                return font;

            if (lowerCaseFont == "helvetica")
                return font;

            var commonFonts = ["Arial", "Tahoma", "Roboto", "sans-serif"];

            for (var i = 0; i < commonFonts.length; i++) {
                var regexp = new RegExp(commonFonts[i], "i");
                if (font.match(regexp))
                    return font;
            }

            var index2 = lowerCaseFont.indexOf("calibri light");
            if (index2 >= 0) {
                return font
                    .replace(
                        /\'?Calibri Light\'?/i,
                        "'Calibri Light',Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
            }

            var index2 = lowerCaseFont.indexOf("calibri");
            if (index2 >= 0) {
                return font
                    .replace(
                        /\'?Calibri\'?/i,
                        "Calibri,Carlito,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
            }

            var index2 = lowerCaseFont.indexOf("helvetica neue light");
            if (index2 >= 0) {
                return font
                    .replace(
                        /\'?Helvetica Neue Light\'?/i,
                        "'Helvetica Neue Light',HelveticaNeueLight,HelveticaNeue-Light,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
            }

            var index2 = lowerCaseFont.indexOf("helvetica neue black condensed");
            if (index2 >= 0) {
                return font
                    .replace(
                        /\'?Helvetica Neue Black Condensed\'?/i,
                        "'Helvetica Neue Black Condensed',HelveticaNeueBlackCondensed,HelveticaNeue-Black-Condensed,HelveticaNeueBlack,HelveticaNeue-Black,'Helvetica Neue Black','Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
            }

            var index2 = lowerCaseFont.indexOf("helvetica neue black");
            if (index2 >= 0) {
                return font
                    .replace(
                        /\'?Helvetica Neue Black\'?/i,
                        "'Helvetica Neue Black',HelveticaNeueBlack,HelveticaNeue-Black,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
            }

            var index2 = lowerCaseFont.indexOf("helvetica neue heavy");
            if (index2 >= 0) {
                return font
                    .replace(
                        /\'?Helvetica Neue Heavy\'?/i,
                        "'Helvetica Neue Heavy',HelveticaNeueHeavy,HelveticaNeue-Heavy,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
            }

            var index2 = lowerCaseFont.indexOf("helvetica neue bold condensed");
            if (index2 >= 0) {
                return font
                    .replace(
                        /\'?Helvetica Neue Bold Condensed\'?/i,
                        "'Helvetica Neue Bold Condensed',HelveticaNeueBoldCondensed,HelveticaNeue-Bold-Condensed,HelveticaNeueBold,HelveticaNeue-Bold,'Helvetica Neue Bold','Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
            }

            var index2 = lowerCaseFont.indexOf("helvetica neue bold");
            if (index2 >= 0) {
                return font
                    .replace(
                        /\'?Helvetica Neue Bold\'?/i,
                        "'Helvetica Neue Bold',HelveticaNeueBold,HelveticaNeue-Bold,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
            }

            var index2 = lowerCaseFont.indexOf("helvetica neue medium");
            if (index2 >= 0) {
                return font
                    .replace(
                        /\'?Helvetica Neue Medium\'?/i,
                        "'Helvetica Neue Medium',HelveticaNeueMedium,HelveticaNeue-Medium,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
            }

            var index2 = lowerCaseFont.indexOf("helvetica neue thin");
            if (index2 >= 0) {
                return font
                    .replace(
                        /\'?Helvetica Neue Thin\'?/i,
                        "'Helvetica Neue Thin',HelveticaNeueThin,HelveticaNeue-Thin,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
            }

            var index2 = lowerCaseFont.indexOf("helvetica neue ultralight");
            if (index2 >= 0) {
                return font
                    .replace(
                        /\'?Helvetica Neue UltraLight\'?/i,
                        "'Helvetica Neue UltraLight',HelveticaNeueUltraLight,HelveticaNeue-UltraLight,'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");
            }

            return font
                .replace(
                    /\'?Helvetica Neue(?! Light| Black| Heavy| Bold| Medium| Thin| UltraLight)\'?/i,
                    "'Helvetica Neue',HelveticaNeue,Helvetica,Roboto,Arial,sans-serif");

            return font;
        },

        getFontTypeByCode: function(str) {
        	var fontType = "ascii"; //0:ascii 1:eastAsia 2:hAnsi
        	if(str && str.length > 0){
        		if(!this.isASC(str)) {
        			if(this.isEastAsia(str))
            			fontType = "eastAsia";
            		else
            			fontType = "hAnsi";
        		}
        	}
        	return fontType;
        },

        isASC: function(str) {
        	if(!this.nAscRegEx)
        		this.nAscRegEx = new RegExp(/[^\u0000-\u007F]/);

        	return (!this.nAscRegEx.test(str));
        },

        isEastAsia: function(str) {
        	if(!this.eastRegEx)
        		this.eastRegEx = new RegExp(/[\uAC00-\uD7FE\u3000-\u33FF\u4E00-\u9FFF\uF900-\uFAFF\uFE30-\uFF4F]/);

        	return this.eastRegEx.test(str);
        }
    };
    return FontTools;
});
