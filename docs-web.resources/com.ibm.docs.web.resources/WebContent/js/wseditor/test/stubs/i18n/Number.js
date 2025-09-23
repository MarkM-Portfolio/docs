
dojo.provide("websheet.test.stubs.i18n.Number");
dojo.provide("websheet.i18n.Number");

dojo.require("websheet.Constant");
dojo.require("websheet.i18n.locale");
dojo.require("websheet.i18n._number");
dojo.require("websheet.i18n._currency");
dojo.require("dojo.i18n");
dojo.require("dojox.date.buddhist.Date");
dojo.require("websheet.Math");
dojo.requireLocalization("websheet.i18n","Number");
//dojo.requireLocalization("websheet.i18n","CustomDateFormats");

websheet.i18n.Number = {
	nls: null,
	FormatType: websheet.Constant.FormatType,
	MAX_DIGIT_NUM: 10,
	MAX_LENGTH_GF: 11, // max string length for general number format;
	// {
	//   "format": {
	//	    "category": ["percent"|"number"|"currency"|"date"|"time"|"boolean"]
	//      "code": format code
	//      "currency": USD, EUR // option for the CURRENCY category
	// }
	// 
	
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
	//EUROs: Austria(de-at), Belgium(nl-be), Finland(fi), France(fr), Greece(el,el-gr),Ireland(ga-ie), Italy(it), Germany(de)
	//       Luxembourg(de-lu), Netherlands(nl-nl), Portugal(pt-pt), Slovakia(sk), Slovenia(sl-si), Spain(es)
	EUROCountry: {
		"de-at" : "ATS", 
		"nl-be" : "BEL",
		"fr-be" : "BEL",
		"fi" : "FIM",
		"fr" : "FRF", 
		"el" : "GRD",
		"el-gr" : "GRD",
		"ga" : "IEP",
		"ga-ie" : "IEP",
		"en-ie" : "IEP",
		"it" : "ITL",
		"de" : "DEM", 
		"de-lu" : "LUF",
		"fr-lu" : "LUF",
		"nl" : "NLG", 
		"nl-nl" : "NLG", 
//		"pl" :	"PLN",
//		"pl-pl" :	"PLN",
		"pt" : "PTE",
		"pt-pt" : "PTE", 
		"sk" : "SKK", 
		"sl-si" : "SIT", 
		"es" : "ESP"
	},
	
	LocaleCurrencyMap: {
		"ar" :  "EGP",
		"bg" :  "BGN",
		"ca" :	"EUR",
		"cs" :	"CZK",
		"da" :	"DKK", 
		"de" :	"DEM",
		"de-de" :	"DEM",
		"el" :	"EUR", 
		"en" :	"EUR", 
		"en-gb" :	"GBP", 
		"en-us" :	"USD",
		"en-za" :	"ZAR",
		"es" :	"ESP", 
		"es-es" :	"ESP",
		"fi" :	"FIM", 
		"fi-fi" :	"FIM", 
		"fr" :	"FRF", 
		"fr-ch": "CHF",
		"fr-fr" :	"FRF", 
		"he" :	"NIS",
		"he-il" :	"NIS", 
		"hr" :  "HRK",
		"hu" :	"HUF",
		"in" :  "IDR",
		"it" :	"ITL", 
		"it-it" :	"ITL", 
		"iw" :  "ILS",
		"ja" :	"JPY", 
		"ja-jp" :	"JPY",
		"kk" :  "KZT",
		"ko" :	"KRW",
		"ko-kr" :	"KRW", 
		"nb" :	"EUR",
		"nl" :	"NLG",
		"nl-be": "EUR", 
		"nl-nl" :	"NLG", 
		"pl" :	"PLN",
		"pl-pl" :	"PLN", //for IE
		"pt" :	"PTE",
		"pt-br" :	"BRL", 
		"pt-pt" :	"PTE", 
		"ro" :  "RON",
		"ru" :	"RUB",
		"sk" :	"EUR", 
		"sl" :	"EUR", 
		"sv" :	"EUR", 
		"sv-se" : "SEK",
		"th" :	"THB", 
		"th-th" :	"THB", 
		"tr" :	"TRY", 
		"tr-tr" :	"TRY", 
		"zh" :	"CNY", 
		"zh-cn" :	"CNY", 
		"zh-tw" :	"TWD", 
		"zh-hk" :	"HKD"
	},
	
	CurrencyLocaleMap: {
		"BGN" : "bg",
		"CZK" : "cs",
		"DEM" : "de-de",
		"DKK" : "da",
		"EGP" : "ar",
		"ESP" : "es",
		"IDR" : "in",
		"ITL" : "it",
		"EUR" : "de-de", // default EUR currency format is follow Germany pattern(if current locale is ja-JP).
		"FIM" : "fi",
		"FRF" : "fr-fr",
		"GBP" : "en-gb",
		"HRK" : "hr",
		"HUF" : "hu",
		"NLG" : "nl-nl",
		"USD" : "en-us", 
		"JPY" : "ja", 
		"KRW" : "ko",
		"KZT" : "kk",
		"BRL" : "pt-br", 
		"PLN" : "pl",
		"PTE" : "pt",
		"RON" : "ro",
		"RUB" : "ru",
		"SEK" : "sv",
		"SIT" : "sl",
		"SKK" : "sk",
		"THB" : "th", 
		"TRY" : "tr", 
		"CNY" : "zh-cn", 
		"TWD" : "zh-tw", 
		"HKD" : "zh-hk",
		"ZAR" : "en-za",
		"NIS" : "he"
	},
	
	// for spell check language fallback.
	Lang2Locale : { 
			'ca' : 'ca-CT',
			'cs' : 'cs-CZ',
			'da' : 'da-DK',
			'nl' : 'nl-NL',
			'en' : 'en-US',						
			'es' : 'es-ES',
			'fi' : 'fi-FI',
			'fr' : 'fr-FR',
			'de' : 'de-DE',
			'el' : 'el-GR',		
			'it' : 'it-IT',			
			'pl' : 'pl-PL',
			'pt' : 'pt-BR',
			'ru' : 'ru-RU',
			'sv' : 'sv-SE',
			'nb' : 'nb-NO',
			'nn' : 'nn-NO',
			'no' : 'nb-NO'
	},
	
	/*
	 * Copied from the original source, but change this map to prevent JS-COVER instrument exception;
	 * */
	CurrencySymbolMap : {
		/*Argentina (Pesos)                                              */  ARS: { symbol: "$" },
		/*Australia (Dollars)                                            */  AUD: { symbol: "$" },
		/*Bulgaria (Leva)                                                */  BGN: { symbol: "$" },
		/*Bolivia (Bolivianos)                                           */  BOB: { symbol: "$" },
		/*Brazil (Reais)                                                 */  BRL: { symbol: "$" },
		/*Canada (Dollars)                                               */  CAD: { symbol: "$" },
		/*Switzerland (Francs)                                           */  CHF: { symbol: "$" }, //keep the same with xls & sym
		/*Chile (Pesos)                                                  */  CLP: { symbol: "$" },
		/*China (Yuan Renminbi)                                          */  CNY: { symbol: "$"}, 
		/*Colombia (Pesos)                                               */  COP: { symbol: "$" },
		/*Costa Rica (Colón)                                             */ CRC: { symbol: "$" },
		/*Czech Republic (Koruny)                                        */  CZK: { symbol: "$" },
		/*Denmark (Kroner)                                               */  DKK: { symbol: "$" },
		/*Dominican Republic (Pesos)                                     */  DOP: { symbol: "$" },
		/*Egypt (Pounds)                                                 */  EGP: { symbol: "$"},
		/*(Euro)                                                         */  EUR: { symbol: "$" },
		/*England, United Kingdom (Pounds)                               */  GBP: { symbol: "$" },
		/*Finland (Markka)                                       		 */  FIM: { symbol: "$" },
		/*France (Franc)                                       			 */  FRF: { symbol: "$" },
		/*Germany (Deutsche Mark)                                        */  DEM: { symbol: "$" },
		/*Hong Kong (Dollars)                                            */  HKD: { symbol: "$" },
		/*Croatia (Kuna)                                                 */  HRK: { symbol: "$" },
		/*HuUngary (Forint)                                              */  HUF: { symbol: "$" },
		/*Indonesia (Rupiahs)                                            */  IDR: { symbol: "$" },
		/*Israel (New Shekels)                                           */  ILS: { symbol: "$" },
		/*India (Rupees)                                                 */  INR: { symbol: "$" },
		/*Italy (Lira)                                                   */  ITL: { symbol: "$"},
		/*Japan (Yen)                                                    */  JPY: { symbol: "$" },
		/*Korea, South (Won)                                             */  KRW: { symbol: "$" },
		/*Kazakhstan (Tenges)                                            */  KZT: { symbol: "$" },
		/*Morocco (dirham)                                               */  MAD: { symbol: "$" },
		/*Mexico (Pesos)                                                 */  MXN: { symbol: "$" },
		/*Malaysia (Ringgits)                                            */  MYR: { symbol: "$" },
		/*Netherlands (Guilder)                                          */  NLG: { symbol: "$" },
		/*Norway (Krone)                                                 */  NOK: { symbol: "$" },
		/*New Zealand (Dollars)                                          */  NZD: { symbol: "$" },
		/*Panama (Balboa)                                                */  PAB: { symbol: "$" },
		/*Peru (Nuevos Soles)                                            */  PEN: { symbol: "$" },
		/*Philippines (Pesos)                                            */  PHP: { symbol: "$" },
		/*Pakistan (Rupees)                                              */  PKR: { symbol: "$" },
		/*Poland (Zlotych)                                               */  PLN: { symbol: "$" },
		/*Portugal (Escudo)                                              */  PTE: { symbol: "$" },
		/*Paraguay (Guarani)                                             */  PYG: { symbol: "$" },
		/*Romania (New Lei)                                              */  RON: { symbol: "$" },
		/*Russia (Rubles)                                                */  RUB: { symbol: "$" },
		/*Saudi Arabia (Riyals)                                          */  SAR: { symbol: "$" },
		/*Spain (Peseta)                                         		 */  ESP: { symbol: "$" },
		/*Sweden (Kronor)                                                */  SEK: { symbol: "$" },
		/*Singapore (Dollars)                                            */  SGD: { symbol: "$" },
		/*Slovenia (Tolars)                                              */  SIT: { symbol: "$" },
		/*Slovak Republic (Korunas)                                      */  SKK: { symbol: "$" },
		/*El Salvador (Colones)                                          */  SVC: { symbol: "$" },
		/*Thailand (Baht)                                                */  THB: { symbol: "$" },
		/*Turkey (Lira)                                                  */  TRY: { symbol: "$" },
		/*Taiwan (New Dollars)                                           */  TWD: { symbol: "$" },
		/*Ecuador, Puerto Rico,  United States of America (U.S. Dollars) */  USD: { symbol: "$" },
		/*Uruguay (Pesos)                                                */  UYU: { symbol: "$" },
		/*Venezuela (Bolivares Fuertes)                                  */  VEF: { symbol: "$" },
		/*Vietnam (Dong)                                                 */  VND: { symbol: "$" },
		/*South Africa (Rand)                                            */  ZAR: { symbol: "$" },
		/*Israel (NewIsraeliSheckel)                                     */  NIS: { symbol: "$" }
	},
	
	/*
	 * Given one currency get its currency symbol
	 */
	/*string*/getCurrencySymbol: function(/*string*/currency) {
		if (!currency) return null;
		var item = this.CurrencySymbolMap[currency];
		return item ? item.symbol : null;
	},
	
	/*string*/getLocaleIso: function() {
		var locale = this.getLocale();
		return this.LocaleCurrencyMap[locale] ||"USD";
	},
	
	/*string*/getLocaleByCurrency: function(currency) {
		return this.CurrencyLocaleMap[currency] ||"en-us";
	},

	/*
	 * Get corresponding currency symbol for current locale setting
	 */
	/*string*/getCurrencySymbolPerLocale: function() {
		var currency = this.getLocaleIso();
		return this.getCurrencySymbol(currency);
	},
	
	/* the store is used by spreadsheet setting */
	/* json store */getLocaleStore: function() {
		websheet.i18n.Number.getNLS();
		var store = {
				identifier:"id",
				label:"name",
				items: [
				        {name: this.nls.Spain_Catalan, id: "ca"}, // "Spain (Catalan)"
				        {name: this.nls.Denmark, id: "da"}, // Denmark
				        {name: this.nls.Germany, id: "de-de"}, // Germany
				        {name: this.nls.Greek, id: "el"}, // Greek
				        {name: this.nls.United_States, id: "en-us"}, // United States
				        {name: this.nls.Spain, id: "es-es"}, // Spain
				        {name: this.nls.Finland, id: "fi"}, // Finland
				        {name: this.nls.France, id: "fr-fr"}, // France
				        {name: this.nls.Italy, id: "it"}, // Italy
				        {name: this.nls.Japan, id: "ja"}, // Japan
				        {name: this.nls.Korean, id: "ko-kr"}, // Korean
				        {name: this.nls.Norway, id: "no"}, // Norway
				        {name: this.nls.Netherlands, id: "nl"}, // Netherlands
				        {name: this.nls.Poland, id: "pl"}, // Poland
				        {name: this.nls.Brazil, id: "pt-br"}, // Brazil
				        {name: this.nls.Portugal, id: "pt"}, // Portugal
				        {name: this.nls.Russia, id: "ru"}, // Russia
				        {name: this.nls.Sweden, id: "sv-se"}, // Sweden
				        {name: this.nls.Thailand, id: "th"}, // Thailand
				        {name: this.nls.Turkey, id: "tr"}, // Turkey
				        {name: this.nls.China, id: "zh-cn"}, // China
				        {name: this.nls.Taiwan_China, id: "zh-tw"}, // Taiwan (China)
				        {name: this.nls.Israel, id: "he"} // Israel
				        ]
			};
		
		return store;
	},
	
	DateFormat: {
		"short":{
			formatName:"short",
			formatLength: "short"
		},
//		"short2": {
//			formatName: "short2",
//			formatLength: "short2"
//		},
		"medium":{
			formatName:"medium",
			formatLength: "medium"
		},
//		"medium2":{
//			formatName:"medium2",
//			formatLength: "medium2"
//		},
		"long":{
			formatName:"long",
			formatLength: "long"
		},
		"full":{
			formatName:"full",
			formatLength: "full"
		},
//		"full2":{
//			formatName:"full2",
//			formatLength: "full2"
//		},
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
//		"dMMM" : {
//			dateCategory:"dateFormatItem-dMMM"
//		},
		//date-time format
		"dateTimeShort":{
			dateCategory:"dateFormat-short",
			timeCategory:"timeFormat-short",
			formatLength: "short"
		},
//		"dateTimeShort2":{
//			dateCategory:"dateFormat-short2",
//			timeCategory:"timeFormat-short",
//			formatLength: "short"
//		},
		"dateTimeMedium":{
			dateCategory:"dateFormat-medium",
			timeCategory:"timeFormat-medium",
			formatLength: "medium"
		}
//		"dateTimeLong":{
//			dateCategory:"dateFormat-long",
//			timeCategory:"timeFormat-long",
//			formatLength: "long"
//		}
//		"dateTimeLong2":{
//			dateCategory:"dateFormat-long2",
//			timeCategory:"timeFormat-long",
//			formatLength: "long"
//		}
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
//		"long2":{
//			formatName:"long2",
//			formatLength: "long2"
//		},		
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
//		"H":{
//			timeCategory:"dateFormatItem-H"
//		},
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
		return websheet.Constant.FormatType[category];
	},
	
	//the format might contains: category,code,currency,ncategory,ncurrency
	/*formatType*/getFormatTypeByValue: function(value, /*format*/format)
	{
		var c = format[websheet.Constant.Style.FORMATTYPE];
		var categoryArray = c ? c.split(";", 4) : [""];
		var category = categoryArray[0];
		if(value < 0 && categoryArray[1])
			category = categoryArray[1];
		else if(value == 0 && categoryArray[2])
			category = categoryArray[2];
		else if(!websheet.Helper.isNumeric(value) && categoryArray[3])
			category = categoryArray[3];
		
		var formatType = this.getFormatType(category);
		return formatType;
	},
	
	/*Category*/getCategory: function(/*FormatType*/formatType)
	{
		var category;
		switch (formatType)
		{
		case this.FormatType["NUMBER"]:
			category = "number";
			break;
		case this.FormatType["SCIENTIFIC"]:
			category = "scientific";
			break;
		case this.FormatType["FRACTION"]:
			category = "fraction";
			break;
		case this.FormatType["CURRENCY"]:
			category = "currency";
			break;
		case this.FormatType["DATETIME"]:
		case this.FormatType["DATE"]:
			category = "date";
			break;
		case this.FormatType["TIME"]:
			category = "time";
			break;
		case this.FormatType["PERCENT"]:
			category = "percent";
			break;
		case this.FormatType["BOOLEAN"]:
			category = "boolean";
			break;
		case this.FormatType["TEXT"]:
			category = "text";
			break;
		default:
			break;
		}

		return category;
	},
	
	/*
	 * 
	 */
	/*format*/getDefaultFormatForShowValue: function (/*formatType*/formatType, /*string*/currency)
	{		
		var format = {};
		var wcs = websheet.Constant.Style;
		switch (formatType)
		{
		case this.FormatType["NUMBER"]:
			format[wcs.FORMATCODE] = "###0.########";
			break;
		case this.FormatType["SCIENTIFIC"]:
			format[wcs.FORMATCODE] = "#0.00E+00";
			break;
		case this.FormatType["FRACTION"]:
			format[wcs.FORMATCODE] = "# ?/?";
			break;
		case this.FormatType["CURRENCY"]:
			format[wcs.FORMATCODE] = "#,##0.00";
			format[wcs.FORMATCURRENCY] = currency;
			break;
		case this.FormatType["DATE"]:
			format[wcs.FORMATCODE] = "short";
			break;
		case this.FormatType["DATETIME"]:
		    format[wcs.FORMATCODE] = "dateTimeShort";
			break;  
		case this.FormatType["TIME"]:
			format[wcs.FORMATCODE] = "short";
			break;
		case this.FormatType["PERCENT"]:
			format[wcs.FORMATCODE] = "0.00%";
			break;
		case this.FormatType["BOOLEAN"]:
			format[wcs.FORMATCODE] = "BOOLEAN";
			break;
		case this.FormatType["TEXT"]:
			format[wcs.FORMATCODE] = "@";
			break;
		default:
			break;
		}

		if (format[wcs.FORMATCODE]) format[wcs.FORMATTYPE] = this.getCategory(formatType);
		
		return format;
	},
	
	/*format*/getDefaultFormatForEditValue: function (/*formatType*/formatType, value)
	{
		var format = {};
		var wcs = websheet.Constant.Style;
		switch (formatType)
		{
		case this.FormatType["NUMBER"]:
		case this.FormatType["CURRENCY"]:
		case this.FormatType["FRACTION"]:
			format[wcs.FORMATCODE] = "###0.###############"; // custom pattern
			format[wcs.FORMATTYPE] = "number";
			break;
		case this.FormatType["SCIENTIFIC"]:
			format[wcs.FORMATCODE] = "###0.###############E+#";
			format[wcs.FORMATTYPE] = "scientific";
			break;
		case this.FormatType["DATETIME"]:
		case this.FormatType["DATE"]:
			if(value && (parseInt(value) != value))//the value is float
			{
				format[wcs.FORMATCODE] = "dateTimeMedium";
				format[wcs.FORMATTYPE] = "date";
			}else{
				format[wcs.FORMATCODE] = "short";
				format[wcs.FORMATTYPE] = "date";
			}
			break;
		case this.FormatType["TIME"]:
			format[wcs.FORMATCODE] = "medium";
			format[wcs.FORMATTYPE] = "time";
			break;
		case this.FormatType["PERCENT"]:
			format[wcs.FORMATCODE] = "###0.###############"; // custom pattern
			format[wcs.FORMATTYPE] = "percent";
			break;
		case this.FormatType["BOOLEAN"]:
			format[wcs.FORMATCODE] = "BOOLEAN";
			format[wcs.FORMATTYPE] = "boolean";
			break;
		case this.FormatType["TEXT"]:
			format[wcs.FORMATCODE] = "@";
			format[wcs.FORMATTYPE] = "text";
			break;
		default:
			break;
		}
		
		return format;
	},
	
	/*string*/generalFormatNumber: function (/*number*/ number) {
		//	Summary:
		//		The default number format that Excel applies when you type a number. 
		//		For the most part, numbers that are formatted with the General format are displayed just the way you type them. 
		//		However, if the cell is not wide enough to show the entire number, the General format rounds the numbers with decimals. 
		//		The General number format also uses scientific (exponential) notation for large numbers (12 or more digits).
		// returns;
		//		The FULLY DISPLAYED 'show value' of a number without any format (General Format);
		// Notice:
		//		Here we will not rounded the number to the cell width, we just calculate the 'full show value' of this number and recorded this as the cell 'showValue';
		//		Later when we render, we shall round the 'full show value' to a 'rounded show value' with 'roundNumber' of LayoutEngine;
		//		When double click on column borders, this 'full show value' will be taken to be measured to extend the column width;
		// Several detailed rules for the Full-show-value:
		//			1. "11 length rule" : The total length of the value should be no more then 11 (this.MAX_LENGTH_GF);
		//		If "11 length rule" is not meet for the number,
		//			2. Number less then 0.0001 will be converted to exponential notation, otherwise it will be rounded to meet the '11 length rule';
		//			3. There're at most '11 numbers' in the integral part of a number, number will be converted to exponential notation if we can not round the number
		//				to meet the '11 length rule';
		var negative = number < 0;
		// convert negative number to positive;
		if (negative) {
			number = number * -1;
		}
		var result = numberstr = number.toString().toUpperCase();
		if (numberstr.substr(0, 6) == '0.0000') {
			numberstr = number.toExponential().toString().toUpperCase();
		}
		var maxlength = this.MAX_LENGTH_GF;
		if (numberstr.length > maxlength) {
			var e = numberstr.indexOf('E');
			if (e > -1) {
				// exponential notation, reduce the numbers to
				var exponent = numberstr.substring(e);
				var elen = exponent.length;
				if (elen == 3) {
					elen += 1; //'E+01' at least 4;
				}
				var maxdigits = maxlength - elen - 2/*integral + decimal point*/;
				var signums = (numberstr.substring(0, e) - 0).toFixed(maxdigits) + '';
				result = signums + exponent;
			} else {
				// gonna check if we need to convert it to exponential notation;
				var dp = numberstr.indexOf('.');
				var integral, fraction;
				if (dp > -1) {
					integral = numberstr.substring(0, dp);
					fraction = numberstr.substring(dp + 1);
				} else {
					integral = numberstr;
					fraction = ''; 
				}
				if (integral.length > maxlength) {
					// need to convert to exponential notation;
					result = numberstr = number.toExponential().toString().toUpperCase();
					if (result.length > maxlength) {
						var e = numberstr.indexOf('E');
						var exponent = numberstr.substring(e);
						var elen = exponent.length;
						if (elen == 3) {
							elen += 1; //'E+01' at least 4;
						}
						var maxdigits = maxlength - elen - 2/*integral + decimal point*/;
						var signums = (numberstr.substring(0, e) - 0).toFixed(maxdigits) + '';
						result = signums + exponent;
					}
				} else {
					// can just round the number;
					var maxdigits = maxlength - integral.length - 1 /*decimal point*/;
					if (maxdigits < 0) {
						// incase the integral.length == maxlength, we need to discard the fraction component with a fixed convertion of 0;
						maxdigits = 0;
					}
					result = number.toFixed(maxdigits).replace(/\.0+$/, '');
					result = result.replace(/0+$/, '');
				}
			}
		}
		var parts = result.split(/E[+-]/);
		if (parts[1] && parts[1].length == 1) {
			// convert E+8 to E+08
			parts[1] = '0' + parts[1];
			result = parts.join(result.substr(-3, 2));
		}
		// replace decimal point;
		var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", this.getLocale());
		var decimal = bundle["decimal"];
		if (decimal != '.') {
			result = result.replace('.', decimal);
		}
		if (negative) {
			result = '-' + result;
		}
		return result;
	},
	

	/*
	 * Round the 'float' with at maximum 10 digits
	 * format the rounded float into one string with locale sensitive decimal separator
     * If value is a scientific number, such as 1.9999999999e22, round with at maximum 10 digits,
     * format the exponent with minimux 2 digits.
	 * @return 	one formatted string  
	 */
	/*string*/roundFloat: function(/*float*/value) {
		var bNegative = value < 0 ? true : false;
		var str = value + "";
		str = str.toLocaleUpperCase();
		var idx = str.indexOf(".");
		if (idx == -1) return str;
		
	    var eIdx = str.indexOf("E");
		if(eIdx != -1){
			var eSub = str.substring(eIdx + 1);
			str = str.substring(0,eIdx);
			var eDel = 0;
		}
		
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
		if(eIdx != -1){			
			var exp = parseFloat(eSub) + eDel;
			if(exp >= 0){
				if(exp < 10)//padding to make sure minimum exp digits is 2;
					exp = "0" + exp;
				eSub = "E+" + exp;
			}
			else{ 
				if(exp > -10)//padding to make sure minimum exp digits is 2;
					exp = "-0" + (0 - exp);
				eSub = "E" + exp;
			}				
			str = str + eSub;
		}
		return str;
	},
	
	
	//Format scientific number to number, date, time, fraction and percent category are not supported, 
	//just roundFloat the scientific number
	_preFormatSci: function(showString){	
		if(websheet.Helper.isSciNum(showString)){
			return this.roundFloat(showString);
		}
		return null;
	},
	
	/*string*/formatNumber: function(showString, /*format*/format, oldFormat){
		var sci = this._preFormatSci(showString); 
	    if(sci != null)
	    	return sci;
	    	
	    var wcs = websheet.Constant.Style;
	    if(format[wcs.FORMATCODE] === "" && oldFormat && format[wcs.FORMATCODE] !== oldFormat[wcs.FORMATCODE])
	    	return this.roundFloat(showString);

  		var code = format[wcs.FORMATCODE];	    
		if(!this._isNumberFormat(code))
			return code;
			
		var locale = this.getLocale();
		
		// dojo build tools (i18nUtils.js) will remove all occurrences of dojo.requireLocalization, 
		// use dojo["requireLocalization"] instead, then it can't be removed because this syntax
		// is not recognized by the build system.
//		dojo["requireLocalization"]("dojo.cldr",'number', locale);
  		if(code && (code == "%")) //format code in ods is "General%" will be converted to "%", so need to add the number part
			code = "0%";
		try{
			var options = dojo.clone(this.decimalFormat[code]);
			if(options == null)
			{
				options = {};
				options.type = "decimal";
				options.pattern = code;
			}
			options.locale = locale;
			if(options.places != null || options.round != null)
				showString = dojo.number.format( showString, options );
			else{
				var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
				options.group = bundle.group;
				options.decimal = bundle.decimal;
//				options.enPattern = true;//the code is en_us pattern, but should use bundle.group and decimal for result
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
		var sci = this._preFormatSci(showString); 
	    if(sci != null)
	    	return sci;
	    	
		var str = showString + "";
		
		var code = format[websheet.Constant.Style.FORMATCODE];
		var result = this._preFractionFormat(code);
		
		if(!result.isFraction || result.len >3) //return if result.len >3
			return this.roundFloat(showString);
		
		var space = " ";
		
		var fractionSep = "/";  //local different?	   
		
		if (websheet.Helper.isInt(showString)){
			 for(var j = 0; j< result.len*2 + 1; j ++)
			 	str += space;
			 
			 return str;
		}
		
		var sStr, sFrac, sDiv;
		var nFrac, nDiv;
		var bNegative = showString < 0 ? true : false;
		if(bNegative)
			showString = 0 - showString;		
		
		var fNum = parseInt(showString); 
		
		if (isNaN(fNum) || !isFinite(fNum)) {
			// not a valid number, return as-is
			return showString;
		}
		
		var fNumber = websheet.Math.sub(showString, fNum);
		
		var nBasis = Math.pow(10, result.len) - 1;
		
		var x0,y0,x1,y1;
		
		var bUpperHalf;
		if(fNumber > 0.5){
			bUpperHalf = true;
			fNumber -= (fNumber - 0.5)*2.0;			
		}else
			bUpperHalf = false;
	    
	    x0 = parseInt(fNumber * nBasis);
	    if(x0 == 0){
	    	x0 = 1;
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
       if(fNum != 0)
       		sStr += fNum;
       sFrac = nFrac + "";
       sDiv = nDiv + "";
       if(nFrac == 0){
       		sFrac = "";
       		sDiv = "";
       }
       while(sFrac.length < result.len)
       		sFrac = space + sFrac;       
       while(sDiv.length < result.len)
       		sDiv += space;
       sStr += space;
       sStr += sFrac;
       sStr += fractionSep;
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
				
			result.len = fras[0].length;
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
		var wcs = websheet.Constant.Style;
		var code = format[wcs.FORMATCODE];
		var options = dojo.clone(this.decimalFormat[code]);
		var symbol = this.getCurrencySymbol(format[wcs.FORMATCURRENCY]);
		if(options == null)
		{
			options = {};
			if (!this._hasSymbol(code)) { // only for currency code that is specified by IBM Docs UI
				options.places = 0;
				var n = code.indexOf(".");
				if (n != -1) 
					options.places = code.length - 1 - n;
			} else {
				options.pattern = code;
				if(format[wcs.FORMATCURRENCY].toUpperCase() == "EUR")
					options.pattern = code.replace(/\[\u0024\u20ac(-(1|2))?\]/ig, symbol); //"[$₄1�7-2]" ==> "₄1�7"				
			}
		}else
			delete options.type;
		
		options.currency = format[wcs.FORMATCURRENCY];
		options.symbol = symbol;
		options.locale = locale;
		if(options.pattern && options.pattern.indexOf("_") >= 0) //not support place holder yet, so remove it
			options.pattern = options.pattern.replace(/_./, ""); // "#,##0.00_- ₄1�7" ==> "#,##0.00 ₄1�7"
		if(!ignoreNormalize)
			this._normalizeFormatPattern(options);
					
		if(websheet.Helper.isSciNum(showString)){
			var tmpNum = websheet.Helper.parseSciNum(showString);
			var exp = tmpNum.exp;
			showString = tmpNum.base;
			
			if(exp > 0)//|showString| > 1
			{
				var nums = (showString + "").split(".");
				var decLen = 0;
				if(nums.length == 2)
					decLen = nums[1].length;
				
				var intPlace = exp - decLen;
				decLen += intPlace % 3;
				intPlace = exp - decLen;					
				
				showString = websheet.Math.mul(showString ,(Math.pow(10,decLen))); // showString is a int value
				
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
			showString = websheet.i18n._currency.format(showString, options);//dojo.currency.format(showString, options);			
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
			//negative brackets or currency is in the end, for example "-1₄1�7"
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
		var sci = this._preFormatSci(showString); 
	    if(sci != null)
	    	return sci;
	    	
		var rawDate = showString;
		var locale = this.getLocale();
		try{
			var dtTmp = new Date("12/30/1899");
			var ms = Math.round(Date.parse(dtTmp) + (86400000 * showString));
			rawDate = new Date(ms);
			var dif=websheet.i18n.numberRecognizer.getMSDifByTimezoneOffset(rawDate.getTimezoneOffset(),dtTmp.getTimezoneOffset());
			if(dif!=0){
				rawDate.setMilliseconds(rawDate.getMilliseconds()+dif);
			}
			if(websheet.functions.Object.JS && concord.util.date.isBuddistLocale()){
				rawDate = new dojox.date.buddhist.Date(rawDate);
			}
			try{
				var options = {};
				var code = this._normalizeByLocale(format[websheet.Constant.Style.FORMATCODE]);
				var pattern = this.DateFormat[code];
				if(pattern){
					dojo.mixin(options, pattern);
					if(format[websheet.Constant.Style.FORMATCODE].indexOf("dateTime") == -1)//for dateTime, the selector should be null
						options.selector = "date";
				}else{
					options.datePattern = code;
					options.selector = "date";
				}
				options.locale = locale;
				showString = websheet.i18n.locale.format(rawDate, options);
			}
			catch(e){
				showString = dojo.date.locale.format(rawDate,{selector: "date"});
				console.log(e);
			}
		}
		catch(e){
			return showString;
		}
		
		return showString;
	},
	
	/*string*/formatTime: function(showString, /*format*/format) {
		var sci = this._preFormatSci(showString); 
	    if(sci != null)
	    	return sci;
	    	
		var rawDate = showString;
		var locale = this.getLocale();
		try{
			var dtTmp = new Date("12/30/1899");
			var ms = Math.round(Date.parse(dtTmp) + (86400000 * showString));
			rawDate = new Date(ms);
			if(websheet.functions.Object.JS && concord.util.date.isBuddistLocale()){
				rawDate = new dojox.date.buddhist.Date(rawDate);
			}
			try{
				var options = {};
				var code = this._normalizeByLocale(format[websheet.Constant.Style.FORMATCODE]);
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
				showString = websheet.i18n.locale.format(rawDate, options);
			}
			catch(e){
				showString = dojo.date.locale.format(rawDate,{selector: "time"});
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
		var locale = this.getLocale();
		var sep = this.LocaleDateSeperatorMap[locale] || "/";
		code = code.replace(/(\/)/ig, sep);
		return code;
	},
	
	/*string*/formatPercent: function(showString, format){
		var sci = this._preFormatSci(showString); 
	    if(sci != null)
	    	return sci;
	    	
	    var bNegative = showString < 0 ? true : false;
	    if(showString >= websheet.Constant.JsSnMinValue/100 || bNegative && showString <= websheet.Constant.JsSnMaxValue_n/100)
	    	return this.roundFloat(showString);
	    
		var locale = this.getLocale();
		var code = format[websheet.Constant.Style.FORMATCODE];
		try{
			var options = dojo.clone(this.percentFormat[code]);
			//does not have that predefined format
			if(!options)
			{
				options = {};
				options.type = "percent";
				options.pattern = code;
			}
			options.locale = locale;
			showString = websheet.i18n._number.format(showString, options );
		}
		catch(e){
			showString = dojo.number.format(showString);
			console.log(e);
		}
		return showString;
	},	

	/*string*/formatBoolean: function(showString) {
		websheet.i18n.Number.getNLS();
		if(showString != 0)
			return this.nls.TRUE;
		else
			return this.nls.FALSE;
	},

	/*string*/formatText:function(showString, format){
		if (!format[websheet.Constant.Style.FORMATCODE]) return showString;
		
		if (typeof showString == "number")
			showString = this.roundFloat(showString);
		if (typeof showString == "boolean")
			showString = showString.toString().toUpperCase();
		
		// customized text formats: "A", "A@B", "@@","\@ab@@c!@" etc
		var code = dojo.clone(format[websheet.Constant.Style.FORMATCODE]);
		var ret = "";
		for(var i = 0; i <= code.length - 1; i++){
			var ch = code.charAt(i);
			if(ch == "\u005C") {
				ret = ret + code.charAt(i+1);
				i++;
			}
			else if(ch == "@")
				ret = ret + showString;
			else
				ret = ret + ch;
		}
		
		return ret;
	},
	
	//dojo doesn't support scientific format code
	//calculate, then format the decimal part using dojo number format.
	/*string*/formatScientific:function(showString, format){
		if(typeof(showString) == "number" && (isNaN(showString) || !isFinite(showString)))
			return showString;
		var locale = this.getLocale();
		var code = format[websheet.Constant.Style.FORMATCODE];
		var bNegative = showString < 0;
	    if(bNegative)
			showString = 0 - showString;
		var formatResult = this._preScientificFormat(code);
		var topV = Math.pow(10, formatResult.minInt);
		var bottomV = Math.pow(10, formatResult.minInt-1);
		
		var exp = 0;
		if(websheet.Helper.isSciNum(showString)){
			var tmpNum = websheet.Helper.parseSciNum(showString);
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
		} catch(e) {}
		
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
		
		var eNegative = exp < 0;
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
	
	/**
	 * @param type, undefined to take showString type into consideration
	 */
	/*string*/format: function(showString, /*format*/ format, type) {
		if ((showString != null) && (showString != undefined) && (format || type != null)) 
		{
			var wcs = websheet.Constant.Style;
			var categoryArray = (format && format[wcs.FORMATTYPE]) ? format[wcs.FORMATTYPE].split(";", 4) : [""];
			var currencyArray = (format && format[wcs.FORMATCURRENCY]) ? format[wcs.FORMATCURRENCY].split(";", 4) : [""];
			var category = categoryArray[0]; 
			var currency = currencyArray[0];
			var code = format ? format[wcs.FORMATCODE] : null;
			var constct = websheet.Constant.ValueCellType;
			if (type == constct.BOOLEAN) {
				// turn showString as boolean text first, then do others..
				showString = this.formatBoolean(showString);
			}
			if(code){
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
						
				}else if(typeof(showString) == "number" && showString == 0 && patternList[2])
				{
					if(!this.isTextFormat(patternList[2]))
						code = patternList[2];
					if(categoryArray[2])
						category = categoryArray[2];
					if(currencyArray[2])
						currency = currencyArray[2];
				}else if(typeof(showString) == "string" && (
					(type == undefined && !websheet.Helper.isNumeric(showString)) || // no value type provided, showString can't format as number, or
					(type == constct.STRING || type == constct.BOOLEAN)))	// value type provided to be string or boolean, for boolean type, it should be formatted as "TRUE" or "FALSE" earlier
				{
					//Text Format is not always have "@".
//					if(!this.isTextFormat(patternList[patLen - 1]))
//						return showString;
					code =  patternList[patLen - 1];
					if(categoryArray[patLen - 1])
						category = categoryArray[patLen - 1];
					if(currencyArray[patLen - 1])
						currency = currencyArray[patLen - 1];
				} 
			}
			code = this._removeUnsupportedChar(code);
			var formatType = this.getFormatType(category);
			var newFormat = null;
			if (format != null) {
				var newFormat = dojo.clone(format);
				newFormat[wcs.FORMATTYPE] = category;
				newFormat[wcs.FORMATCODE] = code;
				newFormat[wcs.FORMATCURRENCY] = currency;
			}
			if(formatType == this.FormatType["BOOLEAN"] && type != constct.BOOLEAN){
				// format boolean if not done earlier
				showString = this.formatBoolean(showString);
			}else if(code && newFormat){//if code is null or empty string, do nothing
				switch (formatType)
				{
				case this.FormatType["NUMBER"]:
					showString = this.formatNumber(showString, newFormat, format);
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
			} else if (type == constct.NUMBER) {
				// no valid code or format precent, but the cell is a number, format number as default
				showString = this.roundFloat(showString);
			}
		}

		return showString;
	},
	
	/**
	 * Some reserved chars are not supported yet, so just remove them.
	 * 		"*": padding
	 * 		"\": escape character
	 * e.g. "_(*#\,##0_)" ==> ",##0_)"
	 */
	_removeUnsupportedChar: function(code){
		if(!code)
			return code;
		
//		if(code.indexOf("\\") >= 0)
//			code = code.replace(/\\/ig, ""); 
		
		if(code.indexOf("*") >= 0)
			code = code.replace(/\*./ig, ""); 
		
		if(code.indexOf("_") >= 0)
			code = code.replace(/_./ig, "");
		
		return code;
	},
	
	//For TEXT formula with Date/Time format code.
	replaceKeys: function(formatCode){
		return formatCode.replace(/[\\\\].|([a-zA-Z])\1*/g, function(match){
			var s, 
				c = match.charAt(0),
				l = match.length;
				
			switch(c){
				case "\\":
					s = match;
					break;
				case 'A':
				case 'a':
				case 'N':
				case 'n':
					if((l > 2) && (l < 5)){ 
						s = match.replace(/\w/ig,"E");
					}
					else if(l <= 2)
						s = match;
					else
						s = "EEEE";
					break;
				case 'E':
					s = match;
					if(l == 2)
						s = "E";
					else if(l > 4)
						s = "EEEE";
					break;
				case 'D':
				case 'd':
					s = match.toLowerCase();
					if(l == 3)
						s = "EEE";
					else if( l > 3)
						s = "EEEE";
					break;
				case 'H':
					s = match;
					if( l > 2)
						s = "HH";
					break;
				case 'h':
					s = match;
					if( l > 2)
						s = "hh";
					break;
				case 'S':
				case 's':
					s = match.toLowerCase();
					if(l > 2)
						s = "ss";
					break;
				case 'e':
					s = "yyyy";
					break;
				case 'Y':
				case 'y':
					s = match.toLowerCase();
					if(l == 1)
						s = "yy";
					else if(l > 4)
						s = "yyyy";
					break;
				default:
					s = match;
				}
			return s;
		});
	},
	
	getNLS:function()
	{
		if(!this.nls)
			this.nls = dojo.i18n.getLocalization("websheet.i18n","Number", this.getLocale());
		return this.nls;
	},
	
	setNLS: function(newNLS){
		this.nls = newNLS;
	},
	
	// FIXME how to get it in view mode?
	getLocale: function () {
		// it would happen prior to constructing editor object, have to access with global variable here
		return window["pe"].scene.getLocale();
	},
	/*boolean*/isTextFormat: function(formatCode){
		var replaced = formatCode.replace(/([\\\\].)/ig,"");
		return replaced.match(/@/) != null ? true : false;
	},
	/*boolean*/isBooleamFormat: function(formatCode){
		if(dojo.trim(formatCode.toUpperCase()).indexOf("BOOLEAN") >= 0 )
			return true;
		
		return false;
	}
};