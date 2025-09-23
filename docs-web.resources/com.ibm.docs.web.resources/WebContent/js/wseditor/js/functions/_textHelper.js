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

dojo.provide("websheet.functions._textHelper");

dojo.require("dojo.i18n");
dojo.requireLocalization("dojo.cldr", "number");
dojo.require("dojo.string");
dojo.require("dojo.regexp");

websheet.functions._textHelper ={
	
	numberPatternRE: /[#0,]+(?:\.0*#*)?/,

//	_numberFormatCodeParse : function (code) {
//		// reference:
//		//		https://support.office.com/en-nz/article/Create-a-custom-number-format-78f2a361-936b-4c03-8772-09fab54be7f4
//		if (code) {
//			var 
//				start = 0,
//				end = code.length,
//				offset = 0,
//				current_char = '';
//			var eof = function () {
//				return (offset >= end);
//			};
//			var current = function () {
//				return code.charAt(offset);
//			};
//			var next = function () {
//				return code.charAt(offset + 1);
//			};
//			var isDigitPlaceholders = function (code) {
//				return (code == "0" || code == "#" || code == "?" || code == "." || code == "," || code == "/");
//			};
//			var exponential = function (code) {
//				return (code == "E" || code == "e");
//			};
//			/*state*/
//			var 
//				STRING = 0,
//				DEFAULT = 1,
//				FORMATCODE = 2;
//			var state = DEFAULT;
//			/*storage*/
//			var leading = '', pattern = '', tail = '', token = '';
//			while (!eof()) {
//				current_char = current();
//				switch (state) {
//				case STRING:
//					if (current_char == '"') {
//						state = DEFAULT;
//						
//					} else {
//						token += current_char;
//					}
//					offset++;
//					continue;
//				case STRING:
//					
//				}
//			};
//			return {
//				pattern : pattern,
//				join : function (formatedValue) {
//					return leading + formatedValue + tail;
//				}
//			};
//		} else {
//			return code;
//		}
//	},
	
	/**
	 * value: always positive number
	 */
	_applyPattern: function(/*Number*/value, /*String*/pattern, /*dojo.number.__FormatOptions?*/options){
		if(isNaN(value) || Math.abs(value) == Infinity){ return null; } // null

		options = options || {};
		var group = options.group;
		var decimal = options.decimal;
	
		var patternList = pattern.split(';');
		var pattern = patternList[0];
		pattern = patternList[(value < 0) ? 1 : 0] || ("-" + pattern); 
		value = Math.abs(value);
		pattern = pattern.trim();
		var quotes, quotesEnd, leading = "", tail = "";
		if ((quotes = pattern.indexOf("\"", 0)) > -1) {
			var _pattern = pattern.match(this.numberPatternRE);
			if (_pattern && _pattern.length > 0) {
				var start = pattern.indexOf(_pattern[0]);
				if (start == 0) {
					tail = pattern.substring(quotes + 1);
					pattern = pattern.substring(0, quotes);
				} else {
					leading = pattern.substring(0, start);
					tail = pattern.substring(start + _pattern[0].length);
					pattern = _pattern[0];
				}
				leading = leading.replace(/"/ig, "");
				tail = tail.replace(/"/ig, "");
			}
		}
		// for example, "#0.00"% Profit""
		if(pattern.indexOf('%') != -1){
			var countP = 0;
			for(var i = 0; i <= pattern.length - 1; i++){
				if(pattern.charAt(i) == "\u005C")
					i++;
				else if(pattern.charAt(i) == "%"){
					countP++;
					break;
				}
			}	
			if(countP > 0){
				if(websheet.Helper.isInt(value))
					value *= 100;
			 	else value = websheet.Math.mul(value, 100, true);
			}
		}else if(pattern.indexOf('\u2030') != -1){
			value *= 1000; // per mille
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
		//decimal and group define the result use which decimal and group characters
		//if localePattern == false means that the given pattern conform with en_us locale, rather than comform with options.locale, which is often used by Number.formatNumber
		//if localePattern == true means that the given pattern use the same group,decimal pattern as the parameter, which is often used "by" text function
		var result = this._formatAbsolute(value, pattern, {decimal: decimal, group: group, locale: options.locale, localePattern: options.localePattern, formula: options.formula}); 
		return leading + result + tail;
	},
	
	/*Array*/_splitPattern: function(/*String*/pattern, options){
		var decChar = options.decimal;
		if(!options.localePattern)
			decChar = ".";
		var rPattern = pattern.replace(/([\\\\].)/ig,"##");
		var decIndex = rPattern.indexOf(decChar);
		var patternParts = new Array();
		if(decIndex != -1){
			patternParts[0] = pattern.substring(0, decIndex) || "";
			var ldecIndex = rPattern.lastIndexOf(decChar); //"#..00"
			var nextIndex = decIndex + 1;
			var bCont = true;
			if(ldecIndex > decIndex){
				//if decimals are continuous,
				for(var i=decIndex+1; i < ldecIndex; i++){
					if(rPattern.charAt(i) != decChar){
						bCont = false;
						break;
					}
				}
			}
			if(bCont){
				nextIndex = ldecIndex + 1;
//				patternParts[2] = ldecIndex - decIndex + 1;//cotinuous decimal char number
			}
			patternParts[1] = pattern.substring(nextIndex) || "";
		}
		else{
			patternParts[0] = pattern;
			patternParts[1] = "";
		}
		return patternParts;
	},
	
	_formatAbsolute: function(/*Number*/value, /*String*/pattern, /*dojo.number.__FormatAbsoluteOptions?*/options){
		options = options || {};
		
		var groupChar = options.group;
		if(!options.localePattern)
			groupChar = ",";
		if(BidiUtils.isTextRtl(pattern)){
			// the pattern contains RTL characters, then extract the number part to do format
			// but it can not deal with escape char ('\') now
			var numberPattern = pattern.match(this.numberPatternRE);
			if(!numberPattern){
				throw new Error("unable to find a number expression in pattern: "+pattern);
			}
			var newOptions = dojo.clone(options);
			return pattern.replace(this.numberPatternRE,
				this._formatAbsolute(value, numberPattern[0], newOptions ));
		}
		var regE = new RegExp("([#0]+)(\\" + groupChar + "+)([^#0]*$)");// /([#0]+)(,+)([^#0]*$)/  /([#0]+)(\.+)([^#0]*$)/
		///([^\\])(,+)([^#0]*$)/
//		var regE = new RegExp("([^\\\\])([\\.]+)([^#0]*$)");//return atom groups, for example #,,K->["#..K", "#", "..", "K"], #\\,,K->["..K", ".", ".", "K"]
		var m0 =pattern.match(regE);
		if(m0){
			m0 = m0[2];//get the continuous ','
			//the previous char of ',', it must be '#' or '0',  
			// should check it is escaped with '\', if yes, do not consider ',' as group seperator
			if(m0.index > 0){
				if(pattern.charAt(m0.index - 1) == "\\")
					m0 = null;
			}
		}
		var endCommas = (m0 != null)?m0:"";///[,]+/);
		var comLength = endCommas.length;
		if(comLength > 0){
			value = websheet.Math.div(value, websheet.Math.pow(1000, comLength));
//			var repfunc = function(match, p1, p2, p3){return [p1,p3].join("")};//remove match[2]
			pattern = pattern.replace(regE,"$1$3");//remove [,]+, #,,K->#K
		}
		var patternParts = this._splitPattern(pattern, options);
		
		if (websheet.Helper.isSciNum(value))
			value = websheet.Helper.convertSciNum2General(value);
		//Round or adding the trailing zero to value according to the places of the decimal part.
		var valueParts = String(value).split("\."); 
		valueParts[1] = valueParts[1] || "";
		var validPatternParts1 = patternParts[1].replace(/([\\\\].)|[^#0?]/ig,"");
		var maxPlaces = (validPatternParts1 && validPatternParts1.length) || 0;
		if(maxPlaces > 127 && options.localePattern)// avoid a loop; pick 127 as the limit follow xls.
			throw websheet.Constant.ERRORCODE["519"];
			
		if(valueParts[1].length > maxPlaces){ // To round
//			value = dojo.number.round(value, maxPlaces, options.round); 
			if(maxPlaces == 0){
				if(value < 0)
					value = -(Math.round(-value));
				else
					value = Math.round(value);
			}else{
				var pow = websheet.Math.pow(10,maxPlaces);
				var mul = websheet.Math.mul(value, pow);
//				if(value < 0)
//					value = websheet.Math.div(Math.round(Math.abs(mul)), pow) * -1;
//				else
					value = websheet.Math.div(Math.round(mul), pow);
			}
			valueParts = String(value).split("\."); 
			valueParts[1] = valueParts[1] || "";
		}
		if(valueParts[1].length < maxPlaces){ //Padding with trailing zero
			var pad = valueParts[1].length + validPatternParts1.substring(valueParts[1].length).replace(/#/ig, "").length;
			valueParts[1] = dojo.string.pad(valueParts[1], pad, '0', true);
		}
		
		//1. Fraction part
		valueParts[1] = this._handleFractionPart(valueParts[1], patternParts[1], options);
		if(!valueParts[1]){ valueParts.pop(); }
		
		//2. Integer part. 
		valueParts[0] = this._handleIntegerPart(valueParts[0], patternParts[0], options);
			
		//3. Join 
		if(valueParts.length == 2){
			var decChar = options.decimal || ".";
			if(!options.formula && valueParts[1] == "%")
				decChar = '';
			return valueParts.join(decChar);
		}
		/*//join with how many decimals
		if(valueParts.length == 2 || patternParts[2]){
			var decChar = options.decimal || ".";
			var decimalStr = "";
			var size =  patternParts[2];
			if(size > 0){
				for(var i=0; i<size; i++){
					decimalStr += decChar;
				}
			}else
				decimalStr = decChar;
			if(valueParts.length == 1 && size > 1)
				return valueParts[0] + decimalStr;
			return valueParts.join(decimalStr);
		}
		*/
		return valueParts.join("");
	},
	
	/*string*/_handleFractionPart: function(valueParts1, patternParts1, options){
		if(patternParts1){
			var groupChar = options.group;
			if(!options.localePattern)
				groupChar = ",";
			var resultValue1 = new Array();
			var lenP = patternParts1.length;
			for(var i = 0, j = 0, k = 0; j < lenP; ){
				var charV = "";
				if( i < valueParts1.length)
					charV = valueParts1.charAt(i);
				var charP = patternParts1.charAt(j);
				if(charP == "\u005C"){
					resultValue1[k] = patternParts1.charAt(j+1);
					j++;					
				}
				else if(charP.match(/[#0?]/ig)){
					resultValue1[k] = charV;
					i++;
				}
				else if(charP != groupChar)
					resultValue1[k] = charP;
				j++;
				k++;
			}
			
			valueParts1 = resultValue1.join("");
		}
		
		return valueParts1;
	},
	
	/*string*/_handleIntegerPart: function(valueParts0, patternParts0, options){
		var groupChar = options.group;
		if(!options.localePattern)
			groupChar = ",";
		patternParts0 = patternParts0.replace(new RegExp("\\" + groupChar + "+", "g"), groupChar);//replace ,{1,n} ==> ,     (/([\\\\].)|[^#0?,]/ig,"");
		var groupF = patternParts0.match(new RegExp("[#0?]" + "\\" + groupChar + "[#0?]", "ig")) != null ? true : false;
//		var regg = new RegExp("(?!\\\\)"+ options.group + "{2,}/ig");
//		valueParts0 = valueParts0.replace(regg, function(ma){ //     /(?!\\\\|!),{2,}/ig
//			return ma.substring(0,2);
//		});
		if(valueParts0.indexOf("e") != -1)
			return "0";
		var firstNumIndex = this._firstIndexOfKeyLetter(patternParts0);
		if(firstNumIndex == -1){
			patternParts0 = patternParts0 + "#";
			firstNumIndex = this._firstIndexOfKeyLetter(patternParts0);;
		}
		var resultValue0 = new Array();
		var i = valueParts0.length - 1, k = 0; 
		var j = patternParts0.length - 1;
		var commaC = 0;
		while(i >= 0 && j >= 0){
			var charV = valueParts0.charAt(i);
			var charP = patternParts0.charAt(j);
			if(patternParts0.charAt(j-1) == "\u005C"){
				resultValue0[k] = charP;
				j--;
				k++;
			}
			else if(charP.match(/[#0?]/ig)){
				if(i >= 0){
					resultValue0[k] = charV;			
					k++;
					commaC++;
					i--;
					if(groupF && (i >= 0) && (commaC % 3 == 0)){ // || j != firstNumIndex
						resultValue0[k] = options.group;
						k++;
					}
				}
				else{ 
					if(charP == "0")
						resultValue0[k] = "0";
					else if(charP == "?")
						resultValue0[k] = " ";
					else
						continue;			
					k++;
					commaC++;
					if(groupF && (i >= 0) && (commaC % 3 == 0)){ // || j != firstNumIndex
						resultValue0[k] = options.group;
						k++;
					}
				}
			}
			else if(charP != groupChar){  //skip ","
				resultValue0[k] = charP;
				k++;
			}
			if(j == firstNumIndex){
				j--;				
				break;
			}
			j--;
			if(i < 0) break;
		}
			
		//Padding with redundant values
		while(i >= 0){
			resultValue0[k] = valueParts0.charAt(i);
			k++;
			commaC++;
			if(groupF && (i > 0) && (commaC % 3 == 0)){
				resultValue0[k] = options.group;
				k++;
			}
			i--;
		}
		
		//Padding leading zeros and constants
		while(j >= 0){
			var charP = patternParts0.charAt(j);
			if(patternParts0.charAt(j-1) == "\u005C"){
				resultValue0[k] = charP;
				j--;
				k++;
			}
			else if(charP == "0"){
				if(groupF && (commaC % 3 == 0)){
					resultValue0[k] = options.group;
					k++;
				}
				resultValue0[k] = charP;			
				k++;
				commaC++;
			}
			else if(charP == "?"){
				if(groupF && (commaC % 3 == 0)){
					resultValue0[k] = options.group;
					k++;
				}
				resultValue0[k] = " ";			
				k++;
				commaC++;
			}
			else if((charP != groupChar) && (charP != "#")){  //skip ","
				resultValue0[k] = charP;
				k++;
			}
			
			j--;
		}
		
		valueParts0 = resultValue0.reverse().join("");
		
		return valueParts0;
	},

	/*number*/_firstIndexOfKeyLetter: function(patternPart0){
		var replaced = patternPart0.replace(/[#0?]/g,"0");
		var i = 1;
		var lenp = replaced.length;
		var ch = "";
		
		if(replaced.charAt(0) == "0") return 0;
		
		while(i < lenp){
			if(replaced.charAt(i) == "0" && replaced.charAt(i - 1) != "\u005C")
				return i;
			i++;
		}
		return -1;
	}
}; 


