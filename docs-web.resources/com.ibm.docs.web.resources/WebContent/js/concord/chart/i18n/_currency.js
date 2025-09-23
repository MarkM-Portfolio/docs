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

dojo.provide("concord.chart.i18n._currency");

//customize dojo.currency.format to correct currency fomrat pattern
//For zh, en-za :  the negative currency format pattern should be "￥ -#,#00.00"

dojo["require"]("dojo.number");
dojo["require"]("dojo.i18n");
dojo["require"]("dojo.string");
dojo["require"]("dojo.regexp");
dojo.require("concord.chart.i18n._number");

concord.chart.i18n._currency.format = function(/*Number*/value, /*dojo.currency.__FormatOptions?*/options){
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

	//the dojo.currency.__FormatOptions does not have patterns except Docs
	if(options && options.pattern)
		return concord.chart.i18n._number.format(value, options);
	else
		return concord.chart.i18n._number.format(value, dojo.currency._mixInDefaults(options));
};