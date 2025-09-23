/* ***************************************************************** */
/*                                                                   */
/* IBM Confidential                                                  */
/*                                                                   */
/* IBM Docs Source Materials                                         */
/*                                                                   */
/* (c) Copyright IBM Corporation 2013. All Rights Reserved.          */
/*                                                                   */
/* U.S. Government Users Restricted Rights: Use, duplication or      */
/* disclosure restricted by GSA ADP Schedule Contract with IBM Corp. */
/*                                                                   */
/* ***************************************************************** */

dojo.provide("concord.util.unit");

/**
 * Below funtion is to convert px to cm under 96dpi
 * @param px
 * @return cm
 */
concord.util.unit.PxToCm = function (px){
	var pt = px*0.75;
	var inch = pt/72;
	var cm = inch*2.54;
	return cm;
};
/**
 * Below funtion is to convert cm to px under 96dpi
 * @param cm
 * @return px
 */
concord.util.unit.CmToPx = function (cm){
	var inch = cm/2.54;
	var pt = inch*72;
	var px = pt/0.75;
	return px;
};
/**
 * Below funtion is to convert cm to in
 * @param cm
 * @return in
 */
concord.util.unit.CmToIn = function (cm){
	return cm/2.54;
};

/**
 * Below funtion is to convert in to cm
 * @param cm
 * @return in
 */
concord.util.unit.InToCm = function (inch){
	return inch*2.54;
};
/**
 * Convert em to cm
 * @param em
 * @return cm
 */
concord.util.unit.EmToCm = function ( em ){
	return em*2.54/6;
};
/**
 * Convert pt to cm
 * @param pt
 * @return cm
 */
concord.util.unit.PtToCm = function( pt ){
	return pt*2.54/72;
};
/**
 * Convert pc to cm
 * @param pc
 * @return cm
 */
concord.util.unit.PcToCm = function( pc ){
			return pc*2.54/6;
};
/** convert a string to cm unit number
 *  for example: toCmValue('1.4cm' ) , result is 1.4
 *   toCmValue( '10px' ) 
 *  @param string
 *  @return float
 */
concord.util.unit.toCmValue = function( string ){
	var r = string.toLowerCase().match(/^(-?[\d|\.]*)(pc|px|pt|em|cm|in|mm)$/i);
	if( r && r.length == 3 )
	{
		switch(r[2])
		{
			case 'px':
				return concord.util.unit.PxToCm(parseFloat(r[1]));
				break;
			case 'em':
				return concord.util.unit.EmToCm(parseFloat(r[1]));
				break;
			case 'pt':
				return concord.util.unit.PtToCm(parseFloat(r[1]));
				break;
			case 'pc':
				return concord.util.unit.PcToCm(parseFloat(r[1]));
				break;
			case 'in':
				return parseFloat(r[1])*2.54;
				break;
			case 'mm':
				return parseFloat(r[1])/10;
				break;
			case 'cm':
				return parseFloat(r[1]);
		} 
	}
	return NaN;
};
		
/** convert a string to pt unit number
 *  for example: toPtValue('1.4pt' ) , result is 1.4
 *   toPtValue( '10px' ) 
 *  @param string
 *  @return float
 */
concord.util.unit.toPtValue = function( string ){
	var cm = concord.util.unit.toCmValue( string );
	return isNaN(cm) ? NaN : cm*72/2.54;
};
				
/**
 * Return localized value according to locale.
 * Return inch value if locale is in metricLocale, otherwise return cm value.
 */
concord.util.unit.toLocalizedValue = function( string ){
	var value = concord.util.unit.toCmValue( string );
	if ( !isNaN(value) && !concord.util.unit.isMeticUnit() )
		value = value/2.54;
	return value;
};
/**
 * change number format by locale
 */
concord.util.unit.formatNumber = function(showString){
	if(showString == null)
		return NaN;
	var locale = g_locale == "no" ? "nb" : g_locale; 
	dojo["requireLocalization"]("dojo.cldr",'number', locale);
	var options = {};
	options.type = "decimal";
	options.locale = locale;
	showString = dojo.number.format( showString, options );
	return showString;
};
/**
 * parse locale number string to number by locale
 */
concord.util.unit.parseNumber = function(showString){
	if(showString == null)
		return NaN;
	var locale = g_locale == "no" ? "nb" : g_locale; 
	dojo["requireLocalization"]("dojo.cldr",'number', locale);
	var options = {};
	options.type = "decimal";
	options.locale = locale;
	showString = dojo.number.parse( showString, options );
	return showString;
};

// method from websheet.i18n.numberRecognizer

concord.util.unit.fullWidthNum = {
	"０":"0","１":"1","２":"2","３":"3","４":"4","５":"5",
	"６":"6","７":"7","８":"8","９":"9"
},
	
concord.util.unit._normalizeChar = function(value){
	if(value && dojo.isString(value)){
		var parseValue = [];
		var index = 0;
		var length = value.length;
		while(index < length){
			var c = value.charAt(index);
			//parse full-width number to half-width number
			c = concord.util.unit.fullWidthNum[c]||c;
				
			parseValue.push(c);
			index++;
		}
		return parseValue.join("");
	}
	return value;
};		
/**
 * Return true if Metic unit is used in this locale, else return false.
 */
concord.util.unit.isMeticUnit = function(){

	//List of locale where do not use Metric Unit. Only three country: United States, Liberia and Myanmar.
	var metricLocale = {'us':1, 'lr':1, 'mm':1};			
	var locale = "";
	var index = g_locale.indexOf('-');
	if( index > 0 )
		locale = g_locale.substring(index+1).toLowerCase();
	return !(locale in metricLocale);
};	
/**
 * Remove spaces from the start and the end of a string. The following
 * characters are removed: space, tab, line break, line feed.
 * @function
 * @param {String} str The text from which remove the spaces.
 * @returns {String} The modified string without the boundary spaces.
 * @example
 * alert( CKEDITOR.tools.trim( '  example ' );  // "example"
 */
concord.util.unit.trim = (function()
{
	// We are not using \s because we don't want "non-breaking spaces" to be caught.
	var trimRegex = /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g;
	return function( str )
	{
		return str.replace( trimRegex, '' ) ;
	};
})();	
	
	
concord.util.unit.parseValue = function( string, allowedUnit, isLocalied)
{
	var unitIndex = string.length+1;
	var unit = concord.util.unit.isMeticUnit() ? 'cm' : 'in';
	string = concord.util.unit.trim(concord.util.unit._normalizeChar(string));
	for(var i in allowedUnit)
	{
		var pos = string.indexOf(allowedUnit[i]);
		if(pos > -1){
			unitIndex = pos;
			unit = i;
			break;
		}
	}
	string = concord.util.unit.trim(string.substring(0,unitIndex));
		
	var numberLocale = concord.util.unit.parseNumber(string);
	if(!isNaN(numberLocale))
		return isLocalied ? concord.util.unit.CmToPx(concord.util.unit.toCmValue(numberLocale + unit)) : numberLocale;
	else
		return NaN;
};