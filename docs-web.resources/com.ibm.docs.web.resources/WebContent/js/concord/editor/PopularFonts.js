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

dojo.require("dojo.i18n");
dojo.provide("concord.editor.PopularFonts");
dojo.requireLocalization("concord.editor","PopularFonts");
dojo.declare("concord.editor.PopularFonts", null, {

});

concord.editor.PopularFonts.getLangSpecFont = function() {
	var nls = dojo.i18n.getLocalization("concord.editor","PopularFonts");

	var fonts = nls.fonts;
	try {
		if(g_customizedFonts && g_customizedFonts.enabled != 'false') {
			var generalCustomFonts = g_customizedFonts['general'];
			if(generalCustomFonts) {
				for(var i=0; i<generalCustomFonts.length; i++) {
					var font = generalCustomFonts[i];
					if(!concord.editor.PopularFonts._existing(fonts, font))
						fonts += ";" + font;
				}			
			}
			var globalizedArray = g_customizedFonts['globalized'];
			var globalizedCustomFonts = null;
			if(globalizedArray) {
				var elements = g_locale.split('-');
				var globalizedCustomFonts = globalizedArray[g_locale];
				if(!globalizedCustomFonts || globalizedCustomFonts.length == 0) {
					var fallbackLocale = elements[0];
					globalizedCustomFonts = globalizedArray[fallbackLocale];
				}				
			}
			if(globalizedCustomFonts) {
				for(var i=0; i<globalizedCustomFonts.length; i++) {
					var font = globalizedCustomFonts[i];
					if(!concord.editor.PopularFonts._existing(fonts, font))
						fonts += ";" + font;					
				}					
			}
		}
		//GateKeeper custom fonts
		var features = pe.authenticatedUser && pe.authenticatedUser.getGatekeeperFeatures();
		if(features){
			var cFonts = features.CustomizedFonts;
			if(cFonts){
				var status = cFonts.enabled;
				if(status == undefined || status)
				{					
					var featureDetail = cFonts.featureDetail;
					if(featureDetail){						
						var fontDetail = featureDetail.split(";");
						if(fontDetail){							
							for(var i=0; i< fontDetail.length; i++) {
								var font = dojo.trim(fontDetail[i]);
								if(!concord.editor.PopularFonts._existing(fonts, font))
									fonts += ";" + font;
							}
						}
					}						
				}
			}
		}
		
	} catch(e) {
		console.warn("Error to get customized fonts: " + e);
	}
	
	return fonts; 
};

concord.editor.PopularFonts.getDefaultFont = function(locale) {
	var nls = dojo.i18n.getLocalization("concord.editor","PopularFonts", locale);
	return nls.defaultfont;
};

concord.editor.PopularFonts.getLangSpecFontArray = function() {
	var availableFonts = concord.editor.PopularFonts.getLangSpecFont();
	var list = availableFonts.split(";");
	var fonts = [];
	for (var i = 0; i < list.length; ++i) {
	    var f = dojo.trim(list[i].split('/')[0]);
	    fonts.push((f));
	}
	return fonts;
};

/**
 * check if font existing in fonts
 * @param fonts
 * @param font
 * @returns
 */
concord.editor.PopularFonts._existing = function(fonts, font) {
	var addElements = font.split(',');
	var trueAddFontName = dojo.trim(addElements[0].split('/')[0]).toLowerCase();
	
	var fontsArray = fonts.split(';');
	for(var i=0; i<fontsArray.length; i++) {
		var elements = fontsArray[i].split(',');
		var trueFontName = dojo.trim(elements[0].split('/')[0]).toLowerCase();
		if(trueAddFontName == trueFontName)
			return true;
		 
	}
	return false;
};