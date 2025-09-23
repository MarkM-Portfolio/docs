dojo.provide("websheet.i18n.numberRecognizer");

dojo.require('dojo.number');
dojo.require('dojo.currency');
dojo.require('dojo.date.locale');
dojo.require('dojo.i18n');
dojo.require("websheet.Helper");

websheet.i18n.numberRecognizer = {
	//parse the raw value
	//recognize the value type and float value if it is a number,
	//if bOnlyParseNum == true, then only recognize it as Number/percentage/Boolean type
	//if it is neither a number/percentage type, then isNumber = false
	//because the parameter in formula only support number/percentage recognition
	//if bParseBool = true, then also recognize the String "true"/"false" as boolean
	//it is used by user input the cell value, and should not set it to false when implement formula
	/*fullWidthNum : {
		"ï¼„1ï¿½7ï¿½1ï¿½7:"0","ï¼„1ï¿½7ï¿½1ï¿½7:"1","ï¼„1ï¿½7ï¿½1ï¿½7:"2","ï¼„1ï¿½7ï¿½1ï¿½7:"3","ï¼„1ï¿½7ï¿½1ï¿½7:"4","ï¼„1ï¿½7ï¿½1ï¿½7:"5",
		"ï¼„1ï¿½7ï¿½1ï¿½7:"6","ï¼„1ï¿½7ï¿½1ï¿½7:"7","ï¼„1ï¿½7ï¿½1ï¿½7:"8","ï¼„1ï¿½7ï¿½1ï¿½7:"9"
	},*/
	
	_cacheCount: 0,
	_maxCacheCount: 50000,
	
	_getCacheName: function(bOnlyParseNum, bParseBool, locale)
	{
		return "_cache_" + locale + "_" + !!bOnlyParseNum + "_" + !!bParseBool;
	},
	
	_checkCache: function(rawValue, bOnlyParseNum, bParseBool, locale)
	{
		if(rawValue === null || rawValue === undefined || rawValue.length > 100)
			return null;
		var cacheName = this._getCacheName(bOnlyParseNum, bParseBool, locale);
		if(!this[cacheName])
			return null;
		else
			return this[cacheName][rawValue];
	},
	
	_putInCache: function(rawValue, bOnlyParseNum, bParseBool, locale, result)
	{
		if(rawValue === null || rawValue === undefined || rawValue.length > 100)
			return;
		var cacheName = this._getCacheName(bOnlyParseNum, bParseBool, locale);
		if(!this[cacheName])
		{
			this[cacheName] = {};
			if(!this._caches)
				this._caches = [];
			this._caches.push(cacheName);
		}
		if(!this[cacheName][rawValue])
		{
			this[cacheName][rawValue] = result;
			this._cacheCount ++;
			if(this._cacheCount >= this._maxCacheCount)
			{
				if(this._caches)
				{
					// flush cache.
					dojo.forEach(this._caches, dojo.hitch(this, function(c)
					{
						this[c] = {};
					}));
					this._cacheCount = 0;
				}
			}
		}
	},

	/**
	 * Number, boolean, date/time/datetime, percent, currency format supported by this function.
	 * 
	 * 
	 * Supported date/time/datetime format:
	 * de-de: 
	 *		"dd/MM/yyyy", "dd/MMM/yyyy"
	 *		"yyyy-MM-dd", "yyyy-MMM-dd"
	 *		"dd.MM.yyyy", "dd.MMM.yyyy"
	 *		"MMM d, yyyy", "MMMM d, yyyy"
	 *      "dd/MM/yyyy 2:00 AM", "dd/MMM/yyyy 2:00 PM",
	 *		"yyyy-MM-dd 2:00 AM", "yyyy-MMM-dd 2:00 PM"
	 *		"dd.MM.yyyy 2:00 AM", "dd.MMM.yyyy 2:00 PM"
	 *		"MMM d, yyyy 2:00 AM", "MMMM d, yyyy 2:00 PM"
	 *		"22:00", "2:20:30 AM", "2:00 PM"
	 * fr-fr:	
	 *		"MM/dd/yyyy"
	 *		"yyyy-MM-dd"
	 *		"d MMM y"
	 * 		"MMM d, yyyy", "MMMM d, yyyy"
	 *		"MM/dd/yyyy 2:00 AM"
	 *		"yyyy-MM-dd 2:00 PM"
	 *		"d MMM y 2:00 AM"
	 * 		"MMM d, yyyy 2:00 AM", "MMMM d, yyyy 2:00 PM"
	 *		"22:00", "2:20:30 AM", "2:00 PM"
	 * es-es:
	 *		"dd/MM/yyyy"
	 *      "dd/MM/yy"
	 *		"dd/MM/yyyy HH:mm:ss", "dd/MM/yy HH:mm:ss"
	 *		"dd/MM/yyyy HH:mm", "dd/MM/yy HH:mm"
	 * en-us:	
	 *		"MM/dd/yyyy"
	 *		"yyyy-MM-dd"
	 * 		"MMM d, yyyy", "MMMM d, yyyy"
	 *		"MM/dd/yyyy 2:00 AM"
	 *		"yyyy-MM-dd 2:00 PM"
	 * 		"MMM d, yyyy 2:00 AM", "MMMM d, yyyy 2:00 PM"
	 *		"22:00", "2:20:30 AM", "2:00 PM"
	 * ja-jp:	
	 *		"yyyy/MM/dd"
	 *		"yyyy-MM-dd"
	 *		"MM/dd/yyyy å�ˆå‰� 3:00"
	 *		"yyyy-MM-dd å�ˆå¾Œ 4:04"
	 *		"22:00", "å�ˆå‰� 3:30:40", "å�ˆå¾Œ 4:04"
	 *
	 *Support Germany locale boolean value user enter.
	 *		"WAHR"("TRUE" in English), "FALSCH"("FALSE" in English).
	 */
	parse: function(rawValue, bOnlyParseNum, bParseBool){
		var _rawValue = rawValue;
		var locale = websheet.Helper.getLocale();
		var result = this._checkCache(rawValue, bOnlyParseNum, bParseBool, locale);
		if(result)
			return result;
		
		var factor = 1;
		var parseResult = {};
		parseResult.isNumber = false;
		parseResult.fValue = 0;
		parseResult.percentageNum=0;
		parseResult.formatType = websheet.Constant.FormatType["STRING"];
//		rawValue = this._normalizeChar(rawValue);
		if(rawValue != null){
			switch (typeof rawValue)
			{
				case "number":
					parseResult.fValue = rawValue;
					parseResult.isNumber = true;
					parseResult.formatType = websheet.Constant.FormatType["NUMBER"];
					this._putInCache(_rawValue, bOnlyParseNum, bParseBool, locale, parseResult);
					return parseResult;
				case "boolean":
					var fValue = 0;
					if(rawValue)
						fValue = 1;
					parseResult.fValue = fValue;
					parseResult.isNumber = true;
					parseResult.formatType = websheet.Constant.FormatType["BOOLEAN"];
					this._putInCache(_rawValue, bOnlyParseNum, bParseBool, locale, parseResult);
					return parseResult;
			}
			
			
			// remove white spaces but not line break; #23379
			rawValue = rawValue.replace(/^ +| +$/gm, "");
			//rawValue = dojo.trim(rawValue);
			
			//boolean
			if(bParseBool){
				parseResult = this.autoParseAsBoolean(rawValue.toUpperCase());
				if(parseResult)
				{
					this._putInCache(_rawValue, bOnlyParseNum, bParseBool, locale, parseResult);
					return parseResult;
				}
				//set initial value
				parseResult = {};
				parseResult.isNumber = false;
				parseResult.fValue = 0;
				parseResult.percentageNum=0;
				parseResult.formatType = websheet.Constant.FormatType["STRING"];
			}
			
			//number & currency
			//should not use websheet.Helper.isNumeric(rawValue)
			//because in German locale, "." is not the decimal operator
			//dojo.number can not recognize scientific [e|E], we should parse it by ourself if needed
			var bNumber = false;
			var bNegative = false;
			if(!bOnlyParseNum){
				//currency
				//1. currency is in the head, for example "-$-1"
				//u00a5 is half-width, and uFFE5 is full-width yen/yuan symbol
				var currencypreexp = /^([+|\-]?( )*[$|\u20ac|\u00a5|\uFFE5]( )*[+|\-]?( )*[0-9|,|.]+)$/;
				var matcher = rawValue.match(currencypreexp);
				if(( matcher != null) && (matcher[0].length == rawValue.length)){
					var index1 = rawValue.indexOf("-");
					var index2 = rawValue.lastIndexOf("-");
					if( index1 > -1){
						if(index1 != index2){
							bNegative = false;
						}else
							bNegative = true;
					}else
						bNegative = false;
				
					var defaultYenCurrency = "JPY";
					if(locale && locale.toLowerCase().indexOf("zh") == 0)
						defaultYenCurrency = "CNY";
					
					var currencyIndex = rawValue.indexOf("$");
					if(currencyIndex > -1){
						formatCurrency = "USD";
					}else{
						currencyIndex = rawValue.indexOf("\u00a5");
						if(currencyIndex > -1){
							formatCurrency = defaultYenCurrency;
						}
						else
						{
							currencyIndex = rawValue.indexOf("\uFFE5");
							if(currencyIndex > -1){
								formatCurrency = defaultYenCurrency;
							}
							else{
								currencyIndex = rawValue.indexOf("\u20ac");
								if(currencyIndex > -1){
									formatCurrency = "EUR";
								}
							}
						}
					}
					var digitStartIndex = (index2 > currencyIndex)?index2:currencyIndex;
					//"+" is not accepted in dojo.number.parse
					index2 = rawValue.lastIndexOf("+");
					digitStartIndex = (index2 > digitStartIndex)?index2:digitStartIndex;
					rawValue = dojo.trim(rawValue.substring(digitStartIndex + 1));
		   	 		format = websheet.Constant.FormatType["CURRENCY"];
		   	 		bNumber = true;
				}else{
					//2. currency is in the end, for example "-1$"
					var currencypostexp = /^([+|\-]?( )*([0-9|,|.| ]+)( )*[\u20ac])$/;
					var matcher = rawValue.match(currencypostexp);
					if(( matcher != null) && (matcher[0].length == rawValue.length)){
						var index1 = rawValue.indexOf("-");
						if(index1 > -1)
							bNegative = true;
						else
							index1 = rawValue.indexOf("+");
						var currencyIndex = rawValue.indexOf("$");
						if(currencyIndex > -1){
							formatCurrency = "USD";
						}else{
							currencyIndex = rawValue.indexOf("\u20ac");
							if(currencyIndex > -1){
								formatCurrency = "EUR";
							}
						}
						rawValue = dojo.trim(rawValue.substring(index1 + 1, currencyIndex));
			   	 		format = websheet.Constant.FormatType["CURRENCY"];
			   	 		bNumber = true;
					}
				}
		   	}
		   	
			//for number, might start with several + and =
			var percentageNum=0;
			if(!bNumber){
				for(var i = 0; i < rawValue.length; i++){
					var ch = rawValue.charAt(i);
					if( (ch == "+") || (ch == "-")){
						if(ch == "-")
							bNegative = !bNegative;
					}else{
						rawValue = rawValue.substring(i);
						break;
					}
				}
			   	var matcher = rawValue.match(websheet.Helper.localeRegexpNum);
			   	var format = websheet.Constant.FormatType["STRING"];
			   	if((matcher != null) && (matcher[0].length == rawValue.length)){
			   		var percentIndex = 0;
			   		if((percentIndex = rawValue.indexOf('%')) > -1){
			   		//% must be at start or the end of the rawValue, otherwise should not be percent
		   			var percentLastIndex = rawValue.lastIndexOf('%');
		   			if(percentIndex == 0 || percentLastIndex == (rawValue.length - 1)){
			   			var matcherPercentage=rawValue.match(websheet.Helper.localeRegexpPercentage);
			   			var percentageNum=matcherPercentage[0].replace(/\s/g, '').length;
			   			if(percentIndex != 0)
			   				rawValue = dojo.trim(rawValue.substring(0, percentIndex));
			   			else
			   				rawValue = dojo.trim(rawValue.substring(percentLastIndex + 1, rawValue.length));
			   	 		format = websheet.Constant.FormatType["PERCENT"];
			   	 		factor = websheet.Math.pow(1/100,percentageNum);
			   	 		bNumber = true;
		   			}
			   	 	}else{
			   	 		format = websheet.Constant.FormatType["NUMBER"];
			   	 		bNumber = true;
			   	 	}
			   	}
			}
			if(!bNumber){				
				if(websheet.Helper.localeNumeric.test(rawValue)){
					rawValue = rawValue.toLocaleUpperCase();
					var eIdx = rawValue.indexOf("E");
					var eSub = rawValue.substring(eIdx+1);
					factor = parseFloat("1e"+eSub); //factor = Math.pow(10,parseFloat(eSub));
					bNumber = true;
					rawValue = rawValue.substring(0,eIdx);
					format = websheet.Constant.FormatType["SCIENTIFIC"];				
				}
			}
			if(bNumber){
		   		 try{
			   	 	options = {type:"decimal", locale: locale};
			   		var fValue = dojo.number.parse( rawValue, options);
			   		if(isNaN(fValue)){
			   			var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
			   	 		var decimalSep = bundle["decimal"];
			   	 		var raws = rawValue.split(decimalSep);
			   	 		if(raws.length == 2 && raws[1] === ""){
			   	 			rawValue = raws[0];
			   	 			fValue = dojo.number.parse( rawValue, options);
			   	 		}
			   		}
			   		if(!isNaN(fValue)){
			   			if(bNegative){
			   				parseResult.fValue = 0 - websheet.Math.mul(fValue, factor);
			   				parseResult.percentageNum=percentageNum;
			   			}	
			   			else{
			   				parseResult.fValue = websheet.Math.mul(fValue, factor);
			   				parseResult.percentageNum=percentageNum;
			   			}
			   			parseResult.formatType = format;
			   			if(format == websheet.Constant.FormatType["CURRENCY"])
			   				parseResult.currencySymbol = formatCurrency;
			   			parseResult.isNumber = true;
			   			this._putInCache(_rawValue, bOnlyParseNum, bParseBool, locale, parseResult);
			   			return parseResult;
			   		}
			   	}
			   	catch(e){
			   			//is not a number/currency/scientific
			   	}
			}

			//date, time, datetime
			if(!bOnlyParseNum){
    			parseResult = this._autoPaseAsDateTime(rawValue);
    			this._putInCache(_rawValue, bOnlyParseNum, bParseBool, locale, parseResult);
    			return parseResult;
			}

		}
		this._putInCache(_rawValue, bOnlyParseNum, bParseBool, locale, parseResult);
		return parseResult;
	},
	
	_autoPaseAsDateTime: function(rawValue){
		var parseResult = {};
		parseResult.isNumber = false;
		parseResult.fValue = 0;
		parseResult.percentageNum=0;
		parseResult.formatType = websheet.Constant.FormatType["STRING"];
		var locale = websheet.Helper.getLocale();
	 	try{
	   		var options = {};
   		    var formatPattern = "";
   		    var extend1 = false;
   		    rawValue = rawValue.replace(/( )+/ig, " ");
	   		//if(rawValue.match(websheet.Helper.datetimePattern)){
	   		    var timePart = rawValue.match(websheet.Helper.timePatternFull) || [""];
	   		    var datePart = rawValue.replace(timePart, "");
	   		    datePart = (datePart != null) ? dojo.trim(datePart.replace(/\\s+/ig, " ")): null;
	   		    timePart = (timePart != null) ? dojo.trim(timePart[0]) : null;
	   		    
   		     	//check date
   		     	if(datePart){
				    if((datePart.indexOf(" ") != -1) && (datePart.indexOf(",") != -1)){	//contains " " and ","
				    	formatPattern = "MMM d, yyyy"; 
				    	extend1 = true;
				    }
				    else if(datePart.indexOf("-") != datePart.lastIndexOf("-")) {			//contain two "-"
				   		formatPattern = "yyyy-MM-dd";
				   		if(locale.indexOf("nl") >= 0){
						    formatPattern =  "dd-MM-yyyy";
				   		}
				    }
		   			else
		   				formatPattern = this._getFormatPatternByLocale(datePart);
				    if (/,$/.test(datePart))
				    	formatPattern += ",";
		   		}
		   		
		   		//check time
		   		if(timePart){
	   				timePart = this._normalizeTimePart(datePart, timePart);
		   			if(typeof(timePart) == "string"){
						if(!datePart) 	// "22:00" ==> "10:00 PM"
							rawValue = timePart;
						else			// "2/12/2011 22:00"  ==> "2/12/2011 10:00 PM" 
							rawValue = datePart + " " + timePart;
					} 
		   			else				// "444:00" ==> "18.01.1900  12:00:00"
		   				return this._getParsedResult(timePart, false, true);
		   			
		   			formatPattern = this._addTimePattern(timePart, formatPattern);	
			    }
	   		//}
	   		
	   		//calcuate
		    if(datePart || timePart){
		    	options = {
					datePattern: dojo.trim(formatPattern),
		            selector: "date",
		            locale: locale
		   		};	   		
		   		
		   		if(!datePart && timePart){
		   			rawValue = websheet.baseDateStr + " " + rawValue; //workaroud to avoid dojo set 1970/1/1 as the base date
		   			options.timePattern = "MM/dd/yyyy" + " " + dojo.trim(formatPattern);
		   			options.selector = "time";
		   		}
			    
			    var date = dojo.date.locale.parse(rawValue,options);
			    
			    if(!date){
				    if(extend1)
				    	formatPattern = formatPattern.replace("MMM", "MMMM"); 
				    else if(locale.indexOf("de") >= 0 || locale.indexOf("fr") >= 0)
				    	formatPattern = formatPattern.replace("MM", "MMM");
				    else
				    	return parseResult;	
			    	options.datePattern = formatPattern;
			        date = dojo.date.locale.parse(rawValue,options);
			    }
			    
			    if(date)
			    	return this._getParsedResult(date, datePart, timePart); 
		    }
	   	}catch(e){
	   	}
	   return parseResult;
	},
	
	//get date/time/datetime format pattern by locale
	_getFormatPatternByLocale: function(datePart){
		var locale = websheet.Helper.getLocale().toLowerCase();
		var formatPattern = "";
		
		if(locale.indexOf("de") >= 0){
	   		if(datePart.indexOf("/") != datePart.lastIndexOf("/"))		//contain two "/"
		    	formatPattern = "dd/MM/yyyy";
   			else if(datePart.indexOf(".") != datePart.lastIndexOf("."))	//contain two "."
   				formatPattern = "dd.MM.yyyy";
   		}else if(locale.indexOf("ja") >= 0){
   			if(datePart.indexOf("/") != datePart.lastIndexOf("/"))		//contain two "/"
		    	formatPattern = "yyyy/MM/dd";
   		}else if(locale.indexOf("fr") >= 0){
   			if(datePart.indexOf(" ") != datePart.lastIndexOf("."))		//contain two "/"
		    	formatPattern = "d MMM y";
		    else if(datePart.indexOf("/") != datePart.lastIndexOf("/"))		//contain two "/"
		    	formatPattern = "dd/MM/yy";
   		}else if(locale.indexOf("es") >= 0){
   			if(datePart.indexOf("/") != datePart.lastIndexOf("/"))		//contain two "/"
		    	formatPattern = "dd/MM/yyyy";
   		}else if(locale.indexOf("zh") >= 0){
   			if(datePart.indexOf("/") != datePart.lastIndexOf("/"))		//contain two "/"
		    	formatPattern = "yyyy/MM/dd";
   		}else if(locale.indexOf("pt") >= 0){
   			if(datePart.indexOf("/") != datePart.lastIndexOf("/"))		//contain two "/"
		    	formatPattern =  "dd/MM/yyyy";
   		}else if(locale.indexOf("en-gb") >= 0){
   			if(datePart.indexOf("/") != datePart.lastIndexOf("/"))		//contain two "/"
		    	formatPattern =  "dd/MM/yyyy";		    	
   		}else if(locale.indexOf("en-au") >= 0){
   			if(datePart.indexOf("/") != datePart.lastIndexOf("/"))		//contain two "/"
		    	formatPattern =  "dd/MM/yyyy";
   		}else if(locale.indexOf("it") >= 0){
   			if(datePart.indexOf("/") != datePart.lastIndexOf("/"))		//contain two "/"
		    	formatPattern =  "dd/MM/yyyy";
   		}else if(locale.indexOf("el") >= 0){
   			if(datePart.indexOf("/") != datePart.lastIndexOf("/"))		//contain two "/"
		    	formatPattern =  "dd/MM/yyyy";
   		}else if(locale.indexOf("th") >= 0){
   			if(datePart.indexOf("/") != datePart.lastIndexOf("/"))		//contain two "/"
		    	formatPattern =  "dd/MM/yyyy";
   		}else{
	   		if(datePart.indexOf("/") != datePart.lastIndexOf("/"))		//contain two "/"
		    	formatPattern = "MM/dd/yyyy";
   		}
		return formatPattern;
	},
	
	//follow XLS rule that max time supported is "9999:59:59"
	_normalizeTimePart: function(datePart, timePart){
		var parts = timePart.split(":");
		var lenP = parts.length;
		
		var hour = parseFloat(parts[0]);
		var min = 0;
		var sec = 0;
		var sign = "";
		
		if(isNaN(hour)){
			var tmp = dojo.trim(parts[0]).split(" ");
			sign = tmp[0];
			hour = parseFloat(tmp[1]);
		}
		
		if(lenP == 2){
			var tmp = dojo.trim(parts[1].replace(/\\s+/ig, " ")).split(" ");
			min = parseFloat(tmp[0]);
			sign = sign || tmp[1];
		}
		else if(lenP == 3){
			min = parseFloat(parts[1]);
			var tmp = dojo.trim(parts[2].replace(/\\s+/ig, " ")).split(" ");
			sec = parseFloat(tmp[0]);
			sign = sign || tmp[1];
		}
		
		var locale = websheet.Helper.getLocale();
		var bundle = dojo.date.locale._getGregorianBundle(locale);
		
		if(hour < 24){	// "22:00" ==> "10:00 PM"; "2:3:4 AM" ==> "2:03:04 AM"; "2:3:4" ==> "2:03:04 AM"
			var timePeriod = sign || bundle['dayPeriods-format-wide-am'] || bundle['am']; //fit dojo cldr 172 lib
			if(hour >= 12 && hour < 24){
				if(sign) // "22:00 PM"
					return timePart;
				hour = hour - 12;
				timePeriod = bundle['dayPeriods-format-wide-pm'] || bundle['pm']; //fit dojo cldr 172 lib
			}
			hour = (hour == 0) ? "12" : hour; // "00:30:40" or "00:30:40 AM" ==> "12:30:40 AM" ; "00:30:40 PM" ==> "12:30:40 PM"
			min = (min <= 9) ? "0" + min : min;
			sec = (sec <= 9) ? "0" + sec : sec;
			if(locale.indexOf("ja") >= 0 || locale.indexOf("zh") >= 0 )
				return timePeriod + " " + hour + ":" + min + ":" + sec;
			return hour + ":" + min + ":" + sec + " " + timePeriod;
		}else if(hour >= 24 && hour <= websheet.Constant.maxHour && min <= 59 && sec <= 59){	//"444:00" ==> "18.01.1900  12:00:00"
			if(datePart)
				return timePart;
			var dtTmp = new Date(websheet.baseDateStr);
			var newDate = dojo.date.add(dtTmp, "hour", hour);
			newDate = dojo.date.add(newDate, "minute", min);
			newDate = dojo.date.add(newDate, "second", sec);
			return newDate;
		}
		return timePart;
	},
	
	_addTimePattern: function(timePart, formatPattern){
		var timePartLen = timePart ? timePart.split(":").length : 0;
		var flg = timePart.match(websheet.Helper.timePattern);
		var flgDB = timePart.match(websheet.Helper.timePatternDoubleByte);
    	
    	if(timePartLen == 3){
    		if(flg)
    			formatPattern += " hh:mm:ss a";
    		else if(flgDB)
    			formatPattern += " a hh:mm:ss";
    		else
    		 	formatPattern += " hh:mm:ss";
    	}
    	else{
    		if(flg)
    			formatPattern += " hh:mm a";
    		else if(flgDB)
    			formatPattern += " a hh:mm";
    		else
    		 	formatPattern += " hh:mm";
    	}
    	
    	return formatPattern;
	},
	
	_getParsedResult: function(date, datePart, timePart){
		var parseResult = {};
		parseResult.isNumber = false;
		parseResult.fValue = 0;
		parseResult.formatType = websheet.Constant.FormatType["STRING"];
		var dtTmp = new Date(websheet.baseDateStr);	
		parseResult.fValue = websheet.Helper.getSerialNumberWithDate(date);
    	if(!datePart && timePart)
    		parseResult.formatType = websheet.Constant.FormatType["TIME"];
    	else if(datePart && timePart)
    		parseResult.formatType = websheet.Constant.FormatType["DATETIME"];
    	else
    		parseResult.formatType = websheet.Constant.FormatType["DATE"];
    	parseResult.isNumber = true;
    	return parseResult;
	},
	/**
	 * transfor bool to locale
	 * @param value , can be boolean,string
	 * @returns
	 */
	transBoolEn2Locale: function(value){
		var nls = websheet.i18n.Number.getNLS();
		var v = (value+"").toUpperCase();
		if("TRUE" == v)
			return nls.TRUE;
		else if("FALSE" == v)
			return nls.FALSE;
		return value;
	},
	/**
	 * transfor bool to En
	 * @param value
	 * @returns
	 */
	transBoolLocale2En: function(value){
		var nls = websheet.i18n.Number.getNLS();
		var v = (value+"").toUpperCase();
		if(nls.TRUE == v)
			return "TRUE";
		else if(nls.FALSE == v)
			return "FALSE";
		return value;
	},
	
	/**
	 * transfer 1/0 to locale boolean
	 * @param value
	 */
	transBoolNum2Locale:function(value){
		if(1 == value){
			return this.transBoolEn2Locale("true"); 
		}else if( 0 == value){
			return this.transBoolEn2Locale("false");
		}else
			return value;
	},
	isBoolValue:function(value,onlyEn){
		if(onlyEn)
			return value == "TRUE" || value == "FALSE";
		var nls = websheet.i18n.Number.getNLS();
		return value == nls.TRUE || value == nls.FALSE || value == "TRUE" || value == "FALSE";
	},
	
	//parse user input as boolean value per locale
	//locales supported: en-us, de-DE
	autoParseAsBoolean: function(rawValue){
		var parseResult = {};
		parseResult.isNumber = false;
		parseResult.fValue = 0;
		parseResult.formatType = websheet.Constant.FormatType["STRING"];
		
		var nls = websheet.i18n.Number.getNLS();
		var boolT = nls.TRUE;
		var boolF = nls.FALSE;

		if((rawValue == boolT) || (rawValue == boolF)){
			if(rawValue == boolT)
				parseResult.fValue = 1;
			else
				parseResult.fValue = 0;
			parseResult.formatType = websheet.Constant.FormatType["BOOLEAN"];
			parseResult.isNumber = true;
			return parseResult;
		}
		
		return null;
	}/*,
	
	_normalizeChar: function(value){
		if(value && dojo.isString(value)){
			var parseValue = [];
			var index = 0;
			var length = value.length;
			while(index < length){
				var c = value.charAt(index);
				//parse full-width number to half-width number
				c = this.fullWidthNum[c]||c;
				
				parseValue.push(c);
				index++;
			}
			return parseValue.join("");
		}
		return value;
	}*/
};