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
dojo.provide("concord.util.presTools");

dojo.declare("concord.util.presTools", null, {

	constructor: function() {
		//Adding presentation specific messages to PresTools       
	},

	/**
	 * Sort a custom array
	 * @param pasteArray
	 * @returns {Array}
	 */
	sortZIndexArray: function(pasteArray){
		var zArray = [];
		if(pasteArray && pasteArray.constructor===Array)
		{
	        for (var i=0; i<pasteArray.length; i++){
	        	var mainNode = CKEDITOR.dom.element.createFromHtml(pasteArray[i].contentBoxOpts.mainNode).$;
	        	var zIndex = mainNode.style.zIndex;
	        	var zOrder = zIndex?zIndex:0;
	        	zArray.push({'index':i,'zIndex':zOrder});
	        	dojo.destroy(mainNode);
	        }
	        zArray.sort(function(a,b){
	        	if(a.zIndex == b.zIndex)
	        		return 0;
	        	else if(a.zIndex < b.zIndex)
	        		return -1;
	        	else
	        		return 1;
	        });
		}	
        return zArray;
	},
	/**
	 * Remove spaces from the start and the end of a string. The following
	 * characters are removed: space, tab, line break, line feed.
	 * @function
	 * @param {String} str The text from which remove the spaces.
	 * @returns {String} The modified string without the boundary spaces.
	 * @example
	 * alert( concord.util.presTools.trim( '  example ' );
	 */
	trim : (function()
			{
		// We are not using \s because we don't want "non-breaking spaces" to be caught.
		var trimRegex = /(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g;
		return function( str )
		{
			return str.replace( trimRegex, '' ) ;
		};
			})(),

		/**
		 * Parses the value from a string.  
		 * @param string
		 * @param allowedUnit
		 * @param isLocalized
		 * @returns
		 */
		parseValue : function( string, allowedUnit, isLocalized)
		{
			var unitIndex = string.length+1;
			var unit = this.isMetricUnit() ? 'cm' : 'in';
			//string = this.trim(websheet.i18n.numberRecognizer._normalizeChar(string));
			for(var i in allowedUnit)
			{
				var regExp = eval("/"+allowedUnit[i]+"$/i");
				var result = regExp.exec(string);			
				if(result)
				{
					unitIndex = result.index;
					unit = i;
					break;
				}
			}

			string = this.trim(string.substring(0,unitIndex));
			var numberLocale = this.parseNumber(string);
			if(!isNaN(numberLocale))
				return isLocalized?this.CmToPx(this.toCmValue(numberLocale+unit)):numberLocale;
				else
					return NaN;
		},
		
		/**
		 * Convert px to cm under 96dpi
		 * @param px
		 * @return cm
		 */
		PxToCm:   function (px){
			var pt = px*0.75;
			var inch = pt/72;
			var cm = inch*2.54;
			return cm;
		},
		/**
		 * Convert cm to px under 96dpi
		 * @param cm
		 * @return px
		 */
		CmToPx:  function (cm){
			var inch = cm/2.54;
			var pt = inch*72;
			var px = pt/0.75;
			return px;
		},
		/**
		 * Convert em to cm
		 * @param em
		 * @return cm
		 */
		EmToCm: function ( em ){
			return em*2.54/6;
		},
		/**
		 * Convert pt to cm
		 * @param pt
		 * @return cm
		 */
		PtToCm: function( pt ){
			return pt*2.54/72;
		},
		/**
		 * Convert pc to cm
		 * @param pc
		 * @return cm
		 */
		PcToCm: function( pc ){
			return pc*2.54/6;
		},
		/** Converts a string to cm unit number
		 *  For example: toCmValue('1.4cm' ) , result is 1.4
		 *  
		 *  @param string
		 *  @return float
		 */
		toCmValue: function( string ){
			var r = string.toLowerCase().match(/^(-?[\d|\.|\e+]*)(pc|px|pt|em|cm|in|mm)$/i);
			if( r && r.length == 3 )
			{
				switch(r[2])
				{
				case 'px':
					return this.PxToCm(parseFloat(r[1]));
					break;
				case 'em':
					return this.EmToCm(parseFloat(r[1]));
					break;
				case 'pt':
					return this.PtToCm(parseFloat(r[1]));
					break;
				case 'pc':
					return this.PcToCm(parseFloat(r[1]));
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
		},

		/** Converts a string to pt unit number
		 *  For example: toPtValue('1.4pt' ) , result is 1.4
		 *  
		 *  @param string
		 *  @return float
		 */
		toPtValue: function( string ){
			var cm = this.toCmValue( string );
			return isNaN(cm) ? NaN : cm*72/2.54;
		},

		/**
		 * List of locales which do not use Metric Unit. 
		 * Only three country: United States, Liberia and Myanmar.
		 */
		metricLocale: {'us':1, 'lr':1, 'mm':1},

		/**
		 * Return localized value according to locale.
		 * Return inch value if locale is in metricLocale, otherwise return cm value.
		 */
		toLocalizedValue: function( string ){
			var value = this.toCmValue( string );
			if ( !isNaN(value) && !this.isMetricUnit() )
				value = value/2.54;
			return value;
		},

		/**
		 * Return true if Metric unit is used in this locale, else return false.
		 */
		isMetricUnit: function(){
			var locale = "";
			var index = g_locale.indexOf('-');
			if( index > 0 )
				locale = g_locale.substring(index+1).toLowerCase();
			return !(locale in this.metricLocale);
		},

		/**
		 * Change the number format by locale
		 */
		formatNumber: function(showString){
			if(showString == null)
				return NaN;
			dojo["requireLocalization"]("dojo.cldr",'number', g_locale);
			var options = {};
			options.type = "decimal";
			options.locale = g_locale;
			showString = dojo.number.format( showString, options );
			return showString;
		},
		
		/**
		 * Parses the locale number string to number by locale
		 */
		parseNumber: function(showString){
			if(showString == null)
				return NaN;
			dojo["requireLocalization"]("dojo.cldr",'number', g_locale);
			var options = {};
			options.type = "decimal";
			options.locale = g_locale;
			showString = dojo.number.parse( showString, options );
			return showString;
		},
		
		/**
		 * Parses the locale number string to number by locale
		 */
		parsePercentNumber: function(showString){
			if(showString == null)
				return NaN;
			dojo["requireLocalization"]("dojo.cldr",'number', g_locale);
			var options = {};
			options.type = "percent";
			options.locale = g_locale;
			showString = dojo.number.parse( showString, options );
			return showString;
		}
});

(function(){
	PresTools = new concord.util.presTools();   
})();

