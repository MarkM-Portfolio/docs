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

dojo.provide("concord.chart.i18n._number");
//customize dojo.number.format to correct percentage fomrat, for example 0.28 should be 28%, but not 28.000000000000004%
dojo["require"]("dojo.number");
dojo["require"]("dojo.i18n");
dojo["require"]("dojo.string");
dojo["require"]("dojo.regexp");
dojo.require("concord.chart.i18n.Math");
dojo.require("concord.chart.i18n.Helper");
dojo.require("concord.chart.i18n.Number");


concord.chart.i18n._number.format = function(/*Number*/value, /*dojo.number.__FormatOptions?*/options){
	// summary:
	//		Format a Number as a String, using locale-specific settings
	// description:
	//		Create a string from a Number using a known localized pattern.
	//		Formatting patterns appropriate to the locale are chosen from the
	//		[CLDR](http://unicode.org/cldr) as well as the appropriate symbols and
	//		delimiters.  See <http://www.unicode.org/reports/tr35/#Number_Elements>
	//		If value is Infinity, -Infinity, or is not a valid JavaScript number, return null.
	// value:
	//		the number to be formatted
   dojo["requireLocalization"]("dojo.cldr",'number', locale);
	options = dojo.mixin({}, options || {});
	var locale = dojo.i18n.normalizeLocale(options.locale);
	var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
	options.customs = bundle;
	var pattern = options.pattern || bundle[(options.type || "decimal") + "Format"];
	if(isNaN(value) || Math.abs(value) == Infinity){ return null; } // null
	return concord.chart.i18n._number._applyPattern(value, pattern, options); // String
};
concord.chart.i18n._number._applyPattern = function(/*Number*/value, /*String*/pattern, /*dojo.number.__FormatOptions?*/options){
	// summary:
	//		Apply pattern to format value as a string using options. Gives no
	//		consideration to local customs.
	// value:
	//		the number to be formatted.
	// pattern:
	//		a pattern string as described by
	//		[unicode.org TR35](http://www.unicode.org/reports/tr35/#Number_Format_Patterns)
	// options: dojo.number.__FormatOptions?
	//		_applyPattern is usually called via `dojo.number.format()` which
	//		populates an extra property in the options parameter, "customs".
	//		The customs object specifies group and decimal parameters if set.

	//TODO: support escapes
	options = options || {};
	var group = options.customs.group;
	var decimal = options.customs.decimal;

	var patternList = pattern.split(';');
	var positivePattern = patternList[0];
	pattern = patternList[(value < 0) ? 1 : 0];
	
	//For zh-cn, en-za :  the negative currency format pattern should be "ï¿¥ -#,#00.00"
	if(!pattern){
		var cellLocale = concord.chart.i18n.Number.getLocaleByCurrency(options.currency); //cell level locale
		if(concord.chart.i18n._number._inNormalizeList(cellLocale)){
	 		pattern = positivePattern.replace(/\u00a4/, function(match){
	 			return match + "-";
	 		});
	 	}else
	 		pattern = "-" + positivePattern;
	}
	if (pattern) {
		pattern = pattern.replace(/"/ig, "");
	}
	//TODO: only test against unescaped
	if(pattern.indexOf('%') != -1){
		 if(concord.chart.i18n.Helper.isInt(value))
			 value *= 100;
		 else value = concord.chart.i18n.Math.mul(value, 100, true);
		
	}else if(pattern.indexOf('\u2030') != -1){
		 if(concord.chart.i18n.Helper.isInt(value))
			 value *= 1000; // per mille
		 else value = concord.chart.i18n.Math.mul(value, 1000, true);
		
	}else if(pattern.indexOf('\u00a4') != -1){
		group = options.customs.currencyGroup || group;//mixins instead?
		decimal = options.customs.currencyDecimal || decimal;// Should these be mixins instead?
		pattern = pattern.replace(/\u00a4{1,3}/, function(match){
			var prop = ["symbol", "currency", "displayName"][match.length-1];
			return options[prop] || options.currency || "";
		});
	}else if(pattern.indexOf('E') != -1){
		throw new Error("exponential notation not supported");
	}
	//TODO: support @ sig figs?
	if(options.fractional === false){ options.places = 0; }
	if(options.places != null || options.round != null){
		var numberPatternRE = dojo.number._numberPatternRE;
		var numberPattern = positivePattern.match(numberPatternRE);
		if(!numberPattern){
			throw new Error("unable to find a number expression in pattern: "+pattern);
		}
		return pattern.replace(numberPatternRE,
			dojo.number._formatAbsolute(value, numberPattern[0], {decimal: decimal, group: group, places: options.places, round: options.round}));
	}else{
		//use the pattern to format
		return websheet.functions._textHelper._formatAbsolute(Math.abs(value), pattern, {decimal: decimal, group: group, locale: options.locale});
	}
};

concord.chart.i18n._number._inNormalizeList = function(locale){
	var normalizeList = ["zh-cn", "en-za"]; //TODO to be completed
	locale = locale.toLowerCase();
	
	for(var i = 0; i < normalizeList.length; i++){
		if(locale.indexOf(normalizeList[i]) >= 0)
			return true;
	}
	return false;
};
