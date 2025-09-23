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

dojo.provide("concord.chart.i18n.Number");

dojo.require("concord.chart.i18n.locale");
dojo.require("concord.chart.i18n._number");
dojo.require("concord.chart.i18n._currency");
dojo["require"]("dojo.i18n");
dojo.require("dojox.date.buddhist.Date");
dojo.require("concord.chart.i18n.Math");
dojo.require("concord.chart.i18n.Helper");

concord.chart.i18n.Number = {

	FormatType: {
		"STRING"	: 0,	/// for string
		"NUMBER"	: 1,	/// Any "normal" number format, number format 1~40
		"PERCENT"	: 2,	/// Number as percent, number format 41~50
		"CURRENCY"	: 3,	/// Number as date, number format 51~90
		"DATE"		: 4,	/// Number as date, number format 91~130
		"TIME"		: 5,	/// Number as time, number format 131~170
		"SCIENTIFIC": 6,	/// Number as scientific, number format 171~175
		"FRACTION"	: 7,	  /// Number as scientific, number format 176~180
		"BOOLEAN"	: 8,	/// Number as boolean, number format 181~185
		"TEXT"		: 9,	/// Text Format, number format 186~190
		"DATETIME"	: 10,
		"USERDEFINED": 11,	/// Format defined by user
		"GENERAL"	: 16  /// auto parse the string 
	},
	MAX_DIGIT_NUM: 10,
	
	LocaleDateSeperatorMap: {
		"de" :	".",
		"de-de" :	".",
		"en" :	"/", 
		"en-gb" :	"/", 
		"en-us" :	"/",
		"en-za" :	"/",
		"es" :	"/", 
		"es-es" :	"/",
		"fi" :	".", 
		"fi-fi" :	".", 
		"fr" :	"/", 
		"fr-ch": ".",
		"fr-fr" :	"/", 
		"he" :	".",
		"he-il" :	".", 
		"hu" :	".",
		"it" :	"/", 
		"it-it" :	"/", 
		"ja" :	"/", 
		"ja-jp" :	"/", 
		"ko" :	"-",
		"ko-kr" :	"-",
		"nb" : ".",
		"nl" :	"-",
		"nl-be": "/", 
		"nl-nl" :	"-", 
		"pl" :	".",
		"pl-pl" :	".",
		"pt" :	"-",
		"pt-br" :	"/", 
		"pt-pt" :	"-", 
		"ru" :	".",
		"sk" :	".", 
		"sl" :	".", 
		"sv" :	"-", 
		"sv-se" : "-",
		"th" :	"/", 
		"th-th" :	"/", 
		"tr" :	".", 
		"tr-tr" :	".", 
		"zh" :	"/", 
		"zh-cn" :	"/", 
		"zh-tw" :	"/", 
		"zh-hk" :	"/"
	},
	
	CurrencyLocaleMap: {
		"DEM" : "de-de",
		"DKK" : "da", 
		"ESP" : "es",
		"ITL" : "it",
		"EUR" : "de-de", // default EUR currency format is follow Germany pattern(if current locale is ja-JP).
		"FIM" : "fi",
		"FRF" : "fr-fr",
		"GBP" : "en-gb", 
		"NLG" : "nl-nl",
		"USD" : "en-us", 
		"JPY" : "ja", 
		"KRW" : "ko",
		"BRL" : "pt-br", 
		"PLN" : "pl",
		"PTE" : "pt",
		"RUB" : "ru",
		"SEK" : "sv",
		"THB" : "th", 
		"TRY" : "tr", 
		"CNY" : "zh-cn", 
		"TWD" : "zh-tw", 
		"HKD" : "zh-hk",
		"ZAR" : "en-za",
		"NIS" : "he",
		"NOK" : "nb"
	},
	
	CurrencySymbolMap : {
		/*United Arab Emirates (Dirham) 								 */  AED: { symbol: "د.إ.‏" },
		/*Argentina (Pesos)                                              */  ARS: { symbol: "$" },
		/*Australia (Dollars)                                            */  AUD: { symbol: "$" },
		/*Bolivia (Bolivianos)                                           */  BOB: { symbol: "$b" },
		/*Brazil (Reais)                                                 */  BRL: { symbol: "R$" },
		/*Canada (Dollars)                                               */  CAD: { symbol: "CA$" },
		/*Switzerland (Francs)                                           */  CHF: { symbol: "sFr." }, //keep the same with xls & sym
		/*Chile (Pesos)                                                  */  CLP: { symbol: "$" },
		/*China (Yuan Renminbi)                                          */  CNY: { symbol: "￥"}, //"¥" },
		/*Colombia (Pesos)                                               */  COP: { symbol: "$" },
		/*Costa Rica (Colón)                                             */  CRC: { symbol: "₡" },
		/*Czech Republic (Koruny)                                        */  CZK: { symbol: "Kč" },
		/*Denmark (Kroner)                                               */  DKK: { symbol: "kr" },
		/*Dominican Republic (Pesos)                                     */  DOP: { symbol: "RD$" },
		/*Egypt (Pounds)                                                 */  EGP: { symbol: "ج.م.‏"},//"£" },
		/*(Euro)                                                         */  EUR: { symbol: "€" },
		/*England, United Kingdom (Pounds)                               */  GBP: { symbol: "£" },
		/*Finland (Markka)                                       		 */  FIM: { symbol: "€" },
		/*France (Franc)                                       			 */  FRF: { symbol: "€" },
		/*Germany (Deutsche Mark)                                        */  DEM: { symbol: "€" },
		/*Hong Kong (Dollars)                                            */  HKD: { symbol: "HK$" },
		/*Croatia (Kuna)                                                 */  HRK: { symbol: "kn" },
		/*HuUngary (Forint)                                              */  HUF: { symbol: "Ft" },
		/*Indonesia (Rupiahs)                                            */  IDR: { symbol: "Rp" },
		/*Israel (New Shekels)                                           */  ILS: { symbol: "₪" },
		/*India (Rupees)                                                 */  INR: { symbol: "₨" },
		/*Italy (Lira)                                                   */  ITL: { symbol: "€"},
		/*Japan (Yen)                                                    */  JPY: { symbol: "¥" },
		/*Korea, South (Won)                                             */  KRW: { symbol: "₩" },
		/*Morocco (dirham)                                               */  MAD: { symbol: "د.م. " },
		/*Mexico (Pesos)                                                 */  MXN: { symbol: "$" },
		/*Malaysia (Ringgits)                                            */  MYR: { symbol: "RM" },
		/*Netherlands (Guilder)                                          */  NLG: { symbol: "€" },
		/*Norway (Krone)                                                 */  NOK: { symbol: "kr" },
		/*New Zealand (Dollars)                                          */  NZD: { symbol: "$" },
		/*Panama (Balboa)                                                */  PAB: { symbol: "B/." },
		/*Peru (Nuevos Soles)                                            */  PEN: { symbol: "S/." },
		/*Philippines (Pesos)                                            */  PHP: { symbol: "Php" },
		/*Pakistan (Rupees)                                              */  PKR: { symbol: "₨" },
		/*Poland (Zlotych)                                               */  PLN: { symbol: "zł" },
		/*Portugal (Escudo)                                              */  PTE: { symbol: "€" },
		/*Paraguay (Guarani)                                             */  PYG: { symbol: "Gs" },
		/*Romania (New Lei)                                              */  RON: { symbol: "lei" },
		/*Russia (Rubles)                                                */  RUB: { symbol: "руб" },
		/*Serbian (Cyrillic),  Serbian (Latin)							 */  RSD: { symbol: "дин."},
		/*Saudi Arabia (Riyals)                                          */  SAR: { symbol: "\uFDFC" },
		/*Spain (Peseta)                                         		 */  ESP: { symbol: "€" },
		/*Sweden (Kronor)                                                */  SEK: { symbol: "kr" },
		/*Singapore (Dollars)                                            */  SGD: { symbol: "$" },
		/*El Salvador (Colones)                                          */  SVC: { symbol: "$" },
		/*Thailand (Baht)                                                */  THB: { symbol: "฿" },
		/*Turkey (Lira)                                                  */  TRY: { symbol: "TL" },
		/*Taiwan (New Dollars)                                           */  TWD: { symbol: "NT$" },
		/*Ecuador, Puerto Rico,  United States of America (U.S. Dollars) */  USD: { symbol: "$" },
		/*Uruguay (Pesos)                                                */  UYU: { symbol: "$U" },
		/*Venezuela (Bolivares Fuertes)                                  */  VEF: { symbol: "Bs" },
		/*Vietnam (Dong)                                                 */  VND: { symbol: "₫" },
		/*South Africa (Rand)                                            */  ZAR: { symbol: "R" },
		/*Israel (NewIsraeliSheckel)                                     */  NIS: { symbol: "₪" }
	},
	
	/*
	 * Given one currency get its currency symbol
	 */
	/*string*/getCurrencySymbol: function(/*string*/currency) {
		if (!currency) return null;
		var item = this.CurrencySymbolMap[currency];
		return item ? item.symbol : null;
	},
	
	/*string*/getLocaleByCurrency: function(currency) {
		return this.CurrencyLocaleMap[currency] ||"en-us";
	},

	DateFormat: {
		"short":{
			formatName:"short",
			formatLength: "short"
		},
		"medium":{
			formatName:"medium",
			formatLength: "medium"
		},
		"long":{
			formatName:"long",
			formatLength: "long"
		},
		"full":{
			formatName:"full",
			formatLength: "full"
		},
		"yM":{
			dateCategory:"dateFormatItem-yM"
		},
		"yQ":{
			dateCategory:"dateFormatItem-yQ"
		},
		"yyQ":{
			dateCategory:"dateFormatItem-yyQ"
		},
		"MMMEd":{
			dateCategory:"dateFormatItem-MMMEd"
		},
		"yQQQ":{
			dateCategory:"dateFormatItem-yQQQ"
		},
		"MMM":{
			dateCategory:"dateFormatItem-MMM"
		},
		"y":{
			dateCategory:"dateFormatItem-y"
		},
		"yMMM":{
			dateCategory:"dateFormatItem-yMMM"
		},
		"EEEd":{
			dateCategory:"dateFormatItem-EEEd"
		},
		"yMMMM":{
			dateCategory:"dateFormatItem-yMMMM"
		},
		"MMMMEd":{
			dateCategory:"dateFormatItem-MMMMEd"
		},
		"MMMd":{
			dateCategory:"dateFormatItem-MMMd"
		},
		"MMMMd":{
			dateCategory:"dateFormatItem-MMMMd"
		},
		"M":{
			dateCategory:"dateFormatItem-M"
		},
		"MEd":{
			dateCategory:"dateFormatItem-MEd"
		},
		"yMMMEd":{
			dateCategory:"dateFormatItem-yMMMEd"
		},
		"Md":{
			dateCategory:"dateFormatItem-Md"
		},
		"yMEd":{
			dateCategory:"dateFormatItem-yMEd"
		},
		"d":{
			dateCategory:"dateFormatItem-d"
		},
		"dateTimeShort":{
			dateCategory:"dateFormat-short",
			timeCategory:"timeFormat-short",
			formatLength: "short"
		},
		"dateTimeMedium":{
			dateCategory:"dateFormat-medium",
			timeCategory:"timeFormat-medium",
			formatLength: "medium"
		}
	},
	
	TimeFormat: {
		"short":{
			formatName:"short",
			formatLength: "short"
		},
		"medium":{
			formatName:"medium",
			formatLength: "medium"
		},
		"long":{
			formatName:"long",
			formatLength: "long"
		},
		"full":{
			formatName:"full",
			formatLength: "full"
		},
		"Hm":{
			timeCategory:"dateFormatItem-Hm"
		},
		"Hms":{
			timeCategory:"dateFormatItem-Hms"
		},
		"ms":{
			timeCategory:"dateFormatItem-ms"
		},
		"hm":{
			timeCategory:"dateFormatItem-hm"
		},
		"HHmmss":{
			timeCategory:"dateFormatItem-HHmmss"
		},
		"hms":{
			timeCategory:"dateFormatItem-hms"
		},
		"HHmm":{
			timeCategory:"dateFormatItem-HHmm"
		}
	}, 
	
	decimalFormat: 
	{
		"#,##0": 	{type: "decimal", places: 0}, 
		"#,##0.00": {type: "decimal", places: 2},	 	
		"#,##0.###": {type: "decimal", pattern: "###0.###"},
		"###0.###############": {type: "decimal", pattern: "###0.###############"}
	},
	
	percentFormat:
	{
		"0%":		{type: "percent", pattern: "#0%"}, 
		"0.00%":		{type: "percent", pattern: "#0.00%"}, 
		"#,##0%": 	{type: "percent", pattern: "#,##0%"},
		"###0.###############": {type: "percent", pattern: "###0.###############%"}
	},
		
	/*formatType*/getFormatType: function(/*string*/category)
	{
		if (!category) return null; // default cell style 
		
		category = category.toUpperCase();
		return this.FormatType[category];
	},
	
	/*
	 * Round the 'float' with at maximum 10 digits following the decimal separator,
	 * format the rounded float into one string with locale sensitive decimal separator
     * If value is a scientific number, such as 1.9999999999e22, round the decimal part with at maximum 10 digits,
     * format the exponent with minimux 2 digits.
	 * @return 	one formatted string  
	 */
	/*string*/roundFloat: function(/*float*/value) {
		var bNegative = value < 0 ? true : false;
		var str = value + "";
		str = str.toLocaleUpperCase();
		
	    var eIdx = str.indexOf("E");
		if(eIdx != -1){
			var eSub = str.substring(eIdx + 1);
			str = str.substring(0,eIdx);
			var eDel = 0;
		}
		
		var idx = str.indexOf(".");
		if (idx != -1) {
			var v = Math.abs(parseInt(str.substring(0, idx)));
			var decimalStr = str.substring(idx+1);
			var decimalInt = parseInt(decimalStr, 10);
			var bRounded;
			var maxdigitnum = this.MAX_DIGIT_NUM - idx;
			if (maxdigitnum < 0) maxdigitnum = 0;
			if (decimalStr.length > maxdigitnum) {
				var d = parseInt(decimalStr.substring(maxdigitnum, maxdigitnum + 1));
				decimalStr = decimalStr.substring(0, maxdigitnum);
				var decimalInt = parseInt(decimalStr, 10);
				if (d >= 5) ++decimalInt;
				for (var i = 0; i < maxdigitnum; ++i) {
					if (decimalInt % 10 != 0) break;
					decimalInt = decimalInt / 10;
				}
				if (i == maxdigitnum) {
					if (decimalInt != 0)
						v++;
					decimalStr = undefined;
				} else {
					var temp = decimalInt + "";
					var len = maxdigitnum - i - temp.length;
					var leadingZeros = '';
					for (var j = 0; j < len; ++j) leadingZeros += '0';
						decimalStr = leadingZeros + temp;
					}
				
				bRounded = true;
			}
		
			var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", this.getLocale());
			var decimalSep = bundle["decimal"];
			if (decimalSep != "." || bRounded) {
				if(eIdx != -1 && v >= 10){
					while( v >= 10 ){
						v = v / 10
						eDel ++;
					}
				}
				if (bNegative) v = '-' + v;
				if (decimalStr) 
					str = v + decimalSep + decimalStr;
				else
					str = v;
			}
		}
		if(eIdx != -1){
			var exp = parseFloat(eSub) + eDel;
			var decLen = decimalStr ? decimalStr.length : 0;
			str = str + (exp > 0 ? "E+" : "E") + exp;
			if ((exp >= 0 && exp < this.MAX_DIGIT_NUM) || (exp < 0 && (decLen - exp) < this.MAX_DIGIT_NUM)) {
				return concord.chart.i18n.Helper.convertSciNum2General(str);
			}
		}
		return str;
	},
	
	/*string*/formatNumber: function(showString, /*format*/format){
		if(!this._isNumberFormat(format.code))
			return format.code;
			
		var locale = this.getLocale();
		// dojo build tools (i18nUtils.js) will remove all occurrences of dojo.requireLocalization, 
		// use dojo["requireLocalization"] instead, then it can't be removed because this syntax
		// is not recognized by the build system.
//		dojo["requireLocalization"]("dojo.cldr",'number', locale);
  		
  		var code = format.code;
  		if(code && (code == "%")) //format code in ods is "General%" will be converted to "%", so need to add the number part
			code = "0%";
		try{
			showString = this.roundFloat(showString);
			var options = dojo.clone(this.decimalFormat[code]);
			if(options == null)
			{
				options = {};
				options.type = "decimal";
				options.pattern = code;
			}
			options.locale = locale;
			if(!concord.chart.i18n.Helper.isSciNum(showString) && options.places != null || options.round != null || websheet == undefined)
				showString = dojo.number.format( showString, options );
			else{
				var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
				options.group = bundle.group;
				options.decimal = bundle.decimal;
				//leverage the format function from text formula, while it does not support options.places and round
				showString = websheet.functions._textHelper._applyPattern(showString, code, options);
			}
		}
		catch(e){
			console.log(e);
		}
		return showString;
	},
	
	/*boolean*/_isNumberFormat: function(formatCode){
		if(formatCode == null || formatCode == undefined)
			return false;
		var replaced = formatCode.replace(/([\\\\].|(".*"))/ig,"");
		return replaced.match(/[#0?%]/) != null ? true : false;
	},
	
	//only support simple fraction format, ?/?, ??/??, ???/???
	/*string*/formatFraction: function(showString, /*format*/format){
		var str = showString + "";
		
		var code = format.code;
		
		var result = this._preFractionFormat(code);
		
		if(!result.isFraction || result.len >3) //return if result.len >3
			return this.roundFloat(showString);
		
		var space = " ";
		
		var fractionSep = "/";  //local different?	   
		
		if (concord.chart.i18n.Helper.isInt(showString)){
			 for(var j = 0; j< result.len*2 + 2; j ++)
			 	str += space;
			 
			 return str;
		}
		
		if (concord.chart.i18n.Helper.isSciNum(showString)) {
			showString = concord.chart.i18n.Helper.convertSciNum2General(showString);
		}
		
		var sStr, sFrac, sDiv;
		var nFrac, nDiv;
		
		var bNegative = showString < 0 ? true : false;
		if(bNegative)
			showString = 0 - showString;		
		
		var fNum = parseInt(showString); 
		
		var fNumber = concord.chart.i18n.Math.sub(showString, fNum);
		
		var nBasis = Math.pow(10, result.len) - 1;
		
		if (fNumber < websheet.Math.div(1, nBasis + 1)) {
			var temp = "";
			for (var i = 0; i < result.len * 2 + 2; i++) temp = temp.concat(" ");
			return fNum + temp;
		}
		
		var x0,y0,x1,y1;
		
		var bUpperHalf;
		if(fNumber > 0.5){
			bUpperHalf = true;
			fNumber -= (fNumber - 0.5)*2.0;			
		}else
			bUpperHalf = false;
	    
	    x0 = parseInt(fNumber * nBasis);
	    if(x0 == 0){
	    	y0 = 1;
	    	x1 = 1;
            y1 = nBasis;
	    } else if (x0 == (nBasis-1)/2){                              
            y0 = nBasis;
            x1 = 1;
            y1 = 2;
        }else if (x0 == 1){
            y0 = nBasis;                
            x1 = 1;
            y1 = nBasis - 1;
        } else {
	        y0 = nBasis;                    
	        x1 = x0;
	        y1 = nBasis - 1;
	        var fUg = x0 / y0;
	        var fOg = x1 / y1;
	        var nGgt = this._impGGT(y0, x0);       
	        x0 /= nGgt;
	        y0 /= nGgt;                     
	        var x2 = 0;
	        var y2 = 0;
	        var bStop = false;
	        while (!bStop)
	        {
	        	var fTest = x1/y1;
                while (!bStop)
                {
                    while (fTest > fOg)
                    {
                        x1--;
                        fTest = x1/y1;
                    }
                    while (fTest < fUg && y1 > 1)
                    {
                        y1--;
                        fTest = x1/y1;
                    }
                    if (fTest <= fOg)
                    {
                        fOg = fTest;
                        bStop = true;
                    }
                    else if (y1 == 1)
                        bStop = true;
                }
                nGgt = this._impGGT(y1, x1);            
                x2 = x1 / nGgt;
                y2 = y1 / nGgt;
                if (x2*y0 - x0*y2 == 1 || y1 <= 1)  
                    bStop = true;               
                else
                {
                    y1--;
                    bStop = false;
                }
            }//while                                   
            x1 = x2;
            y1 = y2;            	        
        }//else
        var fup, flow;
        flow = x0/y0;
        fup  = x1/y1;
        while (fNumber > fup)
        {
            var x2 = (parseInt((y0+nBasis)/y1))*x1 - x0; 
            var y2 = (parseInt((y0+nBasis)/y1))*y1 - y0;
            x0 = x1;
            y0 = y1;
            x1 = x2;
            y1 = y2;
            flow = fup;
            fup  = x1/y1;
        }  
        if (fNumber - flow < fup - fNumber)
        {
            nFrac = x0;
            nDiv  = y0;
        }
        else
        {
            nFrac = x1;
            nDiv  = y1;
        }                     
         if (bUpperHalf)
        {
            if (nFrac == 0 && nDiv == 1)    
                fNum += 1;
            else
                nFrac = nDiv - nFrac;
        }
        
       sStr = "";
       if(bNegative)
        	sStr += "-";
       if(fNum != 0 || (fNum == 0 && nFrac == 0))
       		sStr += fNum;
       sFrac = nFrac + "";
       sDiv = nDiv + "";
       if(nFrac == 0){
    	    sFrac = space;
      		sDiv = space;
       }
       while(sFrac.length < result.len)
       		sFrac = space + sFrac;       
       while(sDiv.length < result.len)
       		sDiv += space;
       sStr += space;
       sStr += sFrac;
       sStr += nFrac > 0 ? fractionSep : space;
       sStr += sDiv;
	   return sStr;
	},
	
	_preFractionFormat: function(formatCode){
		var result = {};
		result.isFraction = false;		
		var fractionFormat =  new RegExp("^(# )\\?+/\\?+$");
		if(fractionFormat.test(formatCode)){
			var fra = formatCode.substring(2);
			var fras = fra.split("/");
			if(fras.length != 2)
				return result;
			if(fras[0].length != fras[1].length)
				return result;
				
			result.len = fras[1].length;
			result.isFraction = true;			
			return result;
		}
		
		return result;
	},
	
	_impGGT: function(x,y){
		if (y == 0)
        	return x;
	    else
	    {
	        var z = x%y;
	        while (z)
	        {
	            x = y;
	            y = z;
	            z = x%y;
	        }
	        return y;
	    }
	},
	
	_hasSymbol: function(/*string*/code) {
		for (var i = 0; i < code.length; ++i) {
			var ch = code.charAt(i);
			if (ch != "#" && ch != "0" && ch != "," && ch != ".")
				return true;
		}
		return false;
	},
	
	/**
	 * currency format: from menu bar, spreadsheet locale settings, imported cell level format code.
	 * group/decimal sign: apply group/decimal property from spreadsheet document locale.
	 * pattern: apply cell level format code/menu bar defined format code.
	 * 
	 * @param ignoreNormalize : true ==> apply pattern per locale, called from menubar
	 */
	/*string*/formatCurrency: function(showString, /*format*/format, /*boolean*/ignoreNormalize){
		if(typeof(showString) == "number" && (isNaN(showString) || !isFinite(showString)))
			return showString;
		var locale = this.getLocale();
		var code = format.code;
		var options = dojo.clone(this.decimalFormat[code]);
		var symbol = this.getCurrencySymbol(format.cur);
		if(options == null)
		{
			options = {};
			if (!this._hasSymbol(code)) { // only for currency code that is specified by IBM Docs UI
				options.places = 0;
				var n = code.indexOf(".");
				if (n != -1) 
					options.places = code.length - 1 - n;
				options.places = options.places < this.MAX_DIGIT_NUM ? options.places : this.MAX_DIGIT_NUM;
			} else {
				options.pattern = code;
				if(format.cur.toUpperCase() == "EUR")
					options.pattern = code.replace(/\[\u0024\u20ac(-(1|2))?\]/ig, symbol); //"[$€-2]" ==> "€"				
			}
		}else
			delete options.type;
		options.currency = format.cur;
		options.symbol = symbol;
		options.locale = locale;
		if(options.pattern && options.pattern.indexOf("_") >= 0) //not support place holder yet, so remove it
			options.pattern = options.pattern.replace(/_./, ""); // "#,##0.00_- â‚¬" ==> "#,##0.00 â‚¬"
		if(!ignoreNormalize)
			this._normalizeFormatPattern(options);
					
		if(concord.chart.i18n.Helper.isSciNum(showString)){
			var tmpNum = concord.chart.i18n.Helper.parseSciNum(showString);
			var exp = tmpNum.exp;
			
			if(exp > 0)//|showString| > 1
			{
				showString = tmpNum.base;
				var nums = (showString + "").split(".");
				var decLen = 0;
				if(nums.length == 2)
					decLen = nums[1].length;
				
				var intPlace = exp - decLen;
				decLen += intPlace % 3;
				intPlace = exp - decLen;					
				
				showString = concord.chart.i18n.Math.mul(showString ,(Math.pow(10,decLen))); // showString is a int value
				
				// To keep decimalGroup if it is specified in format code.
				if(Math.abs(showString) < 1000)
			    {
			    	intPlace -= 3;
			    	showString = showString * 1000;
			    }
			}
			else//|showString| < 1e-6, dojo only keep two decimal places for currency, so change it to 0.
			{
				if(showString < 0) 
					showString = -0.000001;
				else
					showString = 0.000001;
			}
		}
		try{			
			showString = concord.chart.i18n._currency.format(showString, options);//dojo.currency.format(showString, options);			
		}
		catch(e){
			console.log(e);
		}
		if(intPlace != undefined && intPlace){
			var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
			var decimalSep = bundle["decimal"];
			var group = bundle["group"]; 
			
			var intPlaceStr = "";
			if(showString.indexOf(group)== -1)// format code doesn't contains group
				group = "";
			for(var i = 0; i< intPlace/3; i++){
			    	intPlaceStr += group + "000";
			    }
			
			var tmpStrs = showString.split(decimalSep);
			
			//negative brackets or currency is in the end, for example "-1â‚¬"
			var l = tmpStrs[0].length - 1;
			while(tmpStrs[0].charAt(l) < "0" || tmpStrs[0].charAt(l) > "9")
				l -- ;
			l ++;
			showString = tmpStrs[0].substring(0,l) + intPlaceStr + tmpStrs[0].substring(l);
			
			if(tmpStrs[1] != undefined)
				showString += decimalSep + tmpStrs[1];
			
		}
		
		return showString;
	},

	// set format patten if locale changed.
	/*string*/_normalizeFormatPattern: function(options){
		var locale = this.getLocale().split("-")[0]; //spreadsheet document locale
		var symbolLocale = this.getLocaleByCurrency(options.currency).split("-")[0];  //cell level locale
		if(locale == symbolLocale) return;
		
		dojo["requireLocalization"]("dojo.cldr",'number', symbolLocale);
		var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", symbolLocale);
		var pattern = bundle["currencyFormat"]; 
		
		if(!options.pattern)
			options.pattern = pattern;
	},
	
	/*string*/formatDate: function(showString, /*format*/format){
		if (!concord.chart.i18n.Helper.checkDateValidSpan(showString)) {
			showString = 0;
		}

		var rawDate = showString;
		var locale = this.getLocale();
		var MsinDay = 86400000;
//		dojo["requireLocalization"]('dojo.cldr','gregorian', locale);
		try{
			var baseDateStr = (websheet && websheet.baseDateStr) ?  websheet.baseDateStr : "12/30/1899";
			var dtTmp = new Date(baseDateStr);
			var ms = Math.round(dtTmp.getTime() + (MsinDay * showString));
			rawDate = new Date(ms);
			var dif = concord.chart.i18n.Helper.getMSDifByTimezoneOffset(concord.chart.i18n.Helper.getTimezoneOffset(rawDate),concord.chart.i18n.Helper.getTimezoneOffset(dtTmp));
			if(dif!=0){
				rawDate.setMilliseconds(rawDate.getMilliseconds()+dif);
			}
			if(concord.util.date.isBuddistLocale()){
				rawDate = new dojox.date.buddhist.Date(rawDate);
			}
			try{
				var options = {};
				var code = this._normalizeByLocale(format.code);
				var pattern = this.DateFormat[code];
				if(pattern){
					dojo.mixin(options, pattern);
					if(format.code.indexOf("dateTime") == -1)//for dateTime, the selector should be null
						options.selector = "date";
				}else{
					options.datePattern = code;
					options.selector = "date";
				}
				options.locale = locale;
				showString = concord.chart.i18n.locale.format(rawDate, options);
			}
			catch(e){
				showString = dojo.date.locale.format(rawDate,{
					selector: "date"
				});
				console.log(e);
			}
		}
		catch(e){
			return showString;
		}
		
		return showString;
	},
	
	/*string*/formatTime: function(showString, /*format*/format) {
		if (!concord.chart.i18n.Helper.checkDateValidSpan(showString)) {
			showString = 0;
		}
	    	
		var rawDate = showString;
		var locale = this.getLocale();
		var MsinDay = 86400000;
//		dojo["requireLocalization"]('dojo.cldr','gregorian', locale);
		try{
			var baseDateStr = (websheet && websheet.baseDateStr) ?  websheet.baseDateStr : "12/30/1899";
			var dtTmp = new Date(baseDateStr);
			var ms = Math.round(Date.parse(dtTmp) + (MsinDay * showString));
			rawDate = new Date(ms);
			var dif = concord.chart.i18n.Helper.getMSDifByTimezoneOffset(concord.chart.i18n.Helper.getTimezoneOffset(rawDate),concord.chart.i18n.Helper.getTimezoneOffset(dtTmp));
			if(dif!=0){
				rawDate.setMilliseconds(rawDate.getMilliseconds()+dif);
			}
			if(concord.util.date.isBuddistLocale()){
				rawDate = new dojox.date.buddhist.Date(rawDate);
			}
			try{
				var options = {};
				var code = this._normalizeByLocale(format.code);
				var pattern = this.TimeFormat[code];
				if(pattern){
					dojo.mixin(options, pattern);
					if(code && code.indexOf("dateTime") == -1)//for dateTime, the selector should be null
						options.selector = "time";
				}else{
					options.timePattern = code;
					options.selector = "time";
				}
				options.locale = locale;
				
				if(code && (code.indexOf("dateTimeShort") === 0 || code.indexOf("dateTimeLong") === 0))
        			options.selector = "dateTime";
				showString = concord.chart.i18n.locale.format(rawDate, options);
			}
			catch(e){
				showString = dojo.date.locale.format(rawDate,{
					selector: "time"
				});
				console.log(e);
			}
		}
		catch(e){
			return showString;
		}
		
		return showString;
	},
	
	// replace the seperator per locale
	/*string*/_normalizeByLocale: function(code){
		var locale = pe.scene.getLocale();
		var sep = this.LocaleDateSeperatorMap[locale] || "/";
		code = code.replace(/(\/)/ig, sep);
		return code;
	},
	
	/*string*/formatPercent: function(showString, format){
		showString = this.roundFloat(showString);
		var locale = this.getLocale();
//		dojo["requireLocalization"]("dojo.cldr",'number', locale);
  		
		try{
			var options = dojo.clone(this.percentFormat[format.code]);
			//does not have that predefined format
			if(!options)
			{
				options = {};
				options.type = "percent";
				options.pattern = format.code;
			}
			options.locale = locale;
			showString = concord.chart.i18n._number.format(showString, options );
		}
		catch(e){
			showString = dojo.number.format(showString);
			console.log(e);
		}
		return showString;
	},	

	/*string*/formatBoolean: function(showString) {
		return showString;
	},

	/*string*/formatText:function(showString, format){
		return showString;
	},
	
	//dojo doesn't support scientific format code
	//calculate, then format the decimal part using dojo number format.
	/*string*/formatScientific:function(showString, format){
		if(typeof(showString) == "number" && (isNaN(showString) || !isFinite(showString)))
			return showString;
		var locale = this.getLocale();
		var code = format.code;
		var bNegative = showString < 0 ? true : false;
	    if(bNegative)
			showString = 0 - showString;
		var formatResult = this._preScientificFormat(code);
		
		var topV = Math.pow(10, formatResult.minInt);
		var bottomV = Math.pow(10, formatResult.minInt-1);
		
		var exp = 0;
		if(concord.chart.i18n.Helper.isSciNum(showString)){			
			var tmpNum = concord.chart.i18n.Helper.parseSciNum(showString);
			exp = tmpNum.exp;
			showString = tmpNum.base;
		}
		if(showString != 0){
			while(showString >= topV){
				showString = showString/10;
				exp ++;
			}		
			
			while(showString < bottomV){
				showString = showString * 10;
				exp --;
			}			
		}
		try{
			var options = {};
			options.type = "decimal";
			options.pattern = formatResult.numCode;
			
			options.locale = locale;
			showString = dojo.number.format( showString, options );
		}
		catch(e){
			console.log(e);
		}
		
		//refine showString	
		try{
			var fValue = dojo.number.parse(showString, {type:"decimal", locale: locale});
			if(fValue >= topV){
				showString = fValue/10;
				exp ++;
				showString = dojo.number.format( showString, options );
			}
		}
		catch(e){
			
		}
		
		var result = "";
		if(bNegative)
			result += "-";
		result += showString;
		if(formatResult.maxD === 0){
			if(formatResult.numCode[(formatResult.numCode).length - 1] == "."){
				var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
				var decimalSep = bundle["decimal"];
				result += decimalSep;
			}
		}
		result += "E";
		
		var eNegative = exp < 0 ? true : false;
		if(eNegative)
			exp = 0 - exp;
		exp = exp + "";
		while(exp.length < formatResult.minE)	
			exp = "0" + exp;
			
		if(eNegative)
			result += "-";
		else
			result += "+";
		result += exp;		
		
		return result;
	},
	
	_preScientificFormat:function(formatCode){
		var result = {};
		result.minInt = 1; //min-integer-digits
		result.minE  = 2;   //min-exponent-digits
		result.maxD = 0;
				
		var codes = formatCode.split("E+");
		
		if(codes.length == 2)
			result.minE = this._getPlaces(codes[1]);
		
		var numCodes = codes[0].split(".");
		result.minInt = this._getPlaces(numCodes[0]);
		if(numCodes.length == 2)
			result.maxD = this._getPlaces(numCodes[1]);
				
		result.numCode = codes[0];
		
		return result;
	},
	
	//return number of 0 in a formatcode part, for example ##0 returns 1.
	_getPlaces:function(code){
		var s = code.indexOf("0");
		if(s == -1)
			return 0;
		var e = code.lastIndexOf("0");
		
		return e - s + 1;
	},
	
	/*string*/format: function(showString, /*format*/format) {
		if(typeof(showString) != "number" && !concord.chart.i18n.Helper.isNumeric(showString))
			return showString;
		if(!format.code || format.code == "")
			return showString;
		
		if ((showString != null) && (showString != undefined) && format) 
		{
			var categoryArray = format.cat ? format.cat.split(";", 4) : [""];
			var currencyArray = format.cur ? format.cur.split(";", 4) : [""];
			var category = categoryArray[0]; 
			var currency = currencyArray[0];
			var code = format.code;
			if(code)
			{
				var patternList = code.split(';');
				var patLen = patternList.length;
				code = patternList[0];
				if(showString < 0 && patternList[1])
				{
					if(!this.isTextFormat(patternList[1])){
						   showString = Math.abs(showString);
						   code = patternList[1];
							if(categoryArray[1])
								category = categoryArray[1];
							if(currencyArray[1])
								currency = currencyArray[1];
						}// else still use the first format
							
				}else if(showString == 0 && patternList[2])
				{
					if(!this.isTextFormat(patternList[2])) {
						code = patternList[2];
						if(categoryArray[2])
							category = categoryArray[2];
						if(currencyArray[2])
							currency = currencyArray[2];
					}
				}
			}
			
			var formatType = this.getFormatType(category);
			code = this._removeUnsupportedChar(code, formatType);
			var newFormat = dojo.clone(format);
			newFormat.cat = category;
			newFormat.code = code;
			newFormat.cur = currency;
			switch (formatType)
			{
			case this.FormatType["NUMBER"]:
				showString = this.formatNumber(showString, newFormat);
				break;
			case this.FormatType["CURRENCY"]:
				showString = this.formatCurrency(showString, newFormat);
				break;
			case this.FormatType["PERCENT"]:
				showString = this.formatPercent(showString, newFormat);
				break;
			case this.FormatType["DATE"]:
				showString = this.formatDate(showString, newFormat);
				break;
			case this.FormatType["TIME"]:
				showString = this.formatTime(showString, newFormat);
				break;
			case this.FormatType["BOOLEAN"]:
				showString = this.formatBoolean(showString);
				break;
			case this.FormatType["TEXT"]:
				showString = this.formatText(showString, newFormat);
				break;
			case this.FormatType["FRACTION"]:
				showString = this.formatFraction(showString, newFormat);
				break;			
			case this.FormatType["SCIENTIFIC"]:
				showString = this.formatScientific(showString, newFormat);
				break;	
			default:
				break;
			}
		}

		return showString;
	},
	
	/**
	 * Some reserved chars are not supported yet, so just remove them.
	 * 		"*": padding
	 * 		"_": placeholder
	 * 		"\": escape character
	 * e.g. "_(*#\,##0_)" ==> ",##0_)"
	 */
	_removeUnsupportedChar: function(code, formatType){
		if(!code)
			return code;
		
		if(code.indexOf("\\") >= 0)
			code = code.replace(/\\/ig, ""); 
		
		if(code.indexOf("*") >= 0)
			code = code.replace(/\*./ig, ""); 
		
		if(code.indexOf("_") >= 0)
			code = code.replace(/_./ig, "");
		
		if(code.indexOf('"') >= 0)
			code = code.replace(/"/ig, "");
		
		if (formatType != websheet.Constant.FormatType["FRACTION"] && code.indexOf("?") >= 0)
			code = code.replace(/\?/ig, " ");
		
		return code;
	},
	
	getLocale: function () {
		return pe.scene.getLocale();
	},
	
	/**
	 * check if the defaultcellformat user set from menu bar
	 * @param format
	 * @returns {Boolean}
	 */
	isDefaultFormat: function(format)
	{
		if(!format)
			return false;
		
		var noCode = false;
		var noColor = false;
		var noCat = false;
		var noCur = false;
		
		if(!format.code || format.code == "")
			noCode = true;
		if(!format.cat || format.cat == "")
			noCat = true;
		if(!format.clr || format.clr == "")
			noColor = true;
		if(!format.cur || format.cur == "")
			noCur = true;
		return noCode && noCat && noColor && noCur;
	},
	
	/*boolean*/isTextFormat: function(formatCode){
		var replaced = formatCode.replace(/([\\\\].)/ig,"");
		return replaced.match(/@/) != null ? true : false;
	}
};
