dojo.provide("websheet.i18n._currency");

//customize dojo.currency.format to correct currency fomrat pattern
//For zh, en-za :  the negative currency format pattern should be "￥ -#,#00.00"

dojo.require("dojo.number");
dojo.require("dojo.i18n");
dojo.require("dojo.string");
dojo.require("dojo.regexp");
dojo.require("websheet.Math");
dojo.require("websheet.Helper");
dojo.require("websheet.i18n._number");

websheet.i18n._currency.format = function(/*Number*/value, /*dojo.currency.__FormatOptions?*/options){
// summary:
//		Format a Number as a currency, using locale-specific settings
//
// description:
//		Create a string from a Number using a known, localized pattern.
//		[Formatting patterns](http://www.unicode.org/reports/tr35/#Number_Elements)
//		appropriate to the locale are chosen from the [CLDR](http://unicode.org/cldr)
//		as well as the appropriate symbols and delimiters and number of decimal places.
//
// value:
//		the number to be formatted.

	if(options && options.pattern)
		return websheet.i18n._number.format(value, options);
	else
		return websheet.i18n._number.format(value, dojo.currency._mixInDefaults(options));
};