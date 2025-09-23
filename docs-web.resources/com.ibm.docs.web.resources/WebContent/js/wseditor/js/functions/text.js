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

dojo.provide("websheet.functions.text");
dojo.require("websheet.functions.FormulaBase");
dojo.require("websheet.functions._textHelper");
/**
 * @argument: TEXT(value, format_code)
 * value:Required. A numeric value, a formula that evaluates to a numeric value, or a reference to a cell containing a numeric value.
 * format_code: Required. A numeric format as a text string enclosed in quotation marks, for example "m/d/yyyy" or "#,##0.00". See the following sections for specific formatting guidelines.
 * 
 * Limitations: support below format_code categories: number,date,time,percent,boolean,text.
 * 
 * Return value rules:
 * 1. value = number, formatcode = number/percent/date/time/boolean, return calculated value;
 * 2. value = number, formatcode = text(@), return value;
 * 3. value = string, formatcode = text(@), return calculated value;
 * 4. value = string, formatcode = number/percent/date/time/boolean, return value;
 * 
 * 
 * Portable Contraints: The result of this function may change across locales. If separators such as decimal or group separator are involved, 
 * conversion may give unexpected results if the separators don't match that of the current locale. Across applications the result may change 
 * to the extend to which number format codes and their subtleties are supported. Portable documents should not use this function.
 */
dojo.declare("websheet.functions.text", websheet.functions.FormulaBase, {
	
	constructor: function(){
		this.minNumOfArgs = 2;
		this.maxNumOfArgs = 2;
		this.inherited(arguments);
	},
	
	/*string*/calc: function(){
		var values = this.args;
		var valueType = values[0].getType();
		var formatCodeType = values[1].getType();
		var value;
		var formatCode;
		var wcs = websheet.Constant.Style;
		
		try{
			value = this.getValue(this.fetchScalaResult(values[0],true), valueType, this.LOCALE_NUM); 
		}catch(e){
			value = this.getValue(this.fetchScalaResult(values[0],true,true), valueType); 
		}

		if(valueType == this.tokenType.RANGEREF_TOKEN || valueType == this.tokenType.NAME) {
			value = this.fetchScalaResult(values[0]);
			if(this.isNum(value)){
				if(this.fetchScalaBoolean(values[0]))
					value = value ? true : false;
			}
			else if(value === "") {
				// (false == "" = true), use "===" to keep value "false"
				value = 0;
			}
		}
			
		if(formatCodeType == this.tokenType.NONE_TOKEN){
			if(this.isNum(value)) return "";
			return value + "";
		}
		
		var formatCodeTmp = this.fetchScalaResult(values[1],false,true);
		formatCode = this.getValue(formatCodeTmp, formatCodeType);
		if(formatCodeType == this.tokenType.RANGEREF_TOKEN || formatCodeType == this.tokenType.NAME) {
			if(this.isNum(formatCode)){
				if(this.fetchScalaBoolean(values[1]))
					formatCode = formatCode ? true : false;
			}
		}

		var patternList;
		if(formatCode != null){
			if(typeof(formatCode) == "string")
				patternList = formatCode.split(';');
			else if(typeof(formatCode) == "number")
				return formatCode + ""; // if format code is constant, just turn it to string and return the format code directly.
			else
				throw websheet.Constant.ERRORCODE["519"];
		}
		var options = this._getLocaleSigns(formatCode);
		
		//1. Pre check the format codes, any invalid cross over will throw #VALUE directly
		if(!this._preCheckFCs(patternList, options.decimal)) 
			throw websheet.Constant.ERRORCODE["519"];
		
		//2. If value is postive number or string then using the first format code. Else if value is nagative then using the second format code.
		var valFC = this._pickOneFormatCode(value, patternList);
		value = valFC.value;
		formatCode = valFC.formatCode;
		
		//3. Check the category of the format code and get the value formated
		var percentF = this.isPercFormat(formatCode);
		var numF = this.isNumberFormat(formatCode, options.decimal);
		var boolF = this.isBooleamFormat(formatCode);
		var dateF = this.isDateOrTimeFormat(formatCode); 
		var textF = this.isTextFormat(formatCode);
		
		var ret = value;
		
		var format = {};
		format[wcs.FORMATTYPE] = "", format[wcs.FORMATCODE] = formatCode;
		if(this.isNum(value)){
			ret = value;
			if(numF || percentF){
				format[wcs.FORMATTYPE] = "number";
				ret = websheet.functions._textHelper._applyPattern(ret, format[wcs.FORMATCODE], options);
			}
			else if(dateF){
				format[wcs.FORMATCODE] = this.fromMS2Concord(formatCode);
				format[wcs.FORMATTYPE] = "time";
				ret = websheet.i18n.Number.format(ret, format);
			}
			else if(boolF){
				format[wcs.FORMATTYPE] = "boolean";
				ret = websheet.i18n.Number.format(ret, format);
			}
			else if(textF)
				return this.parseString(value);
			else
				return formatCode.replace(/([\\\\])/ig,"");			
		}
		else{
			if(textF){ 
				format[wcs.FORMATTYPE] = "text";
				ret = websheet.i18n.Number.format(ret, format);
			}
			else
				return value;
		}
		
		return ret;
	},
	
	/**
	 * options:[group,decimal,locale]
	 */
	/*object*/_getLocaleSigns: function(formatCode){
		var locale = this.getLocale();
		// dojo build tools (i18nUtils.js) will remove all occurrences of dojo.requireLocalization, 
		// use dojo["requireLocalization"] instead, then it can't be removed because this syntax
		// is not recognized by the build system.
		dojo["requireLocalization"]("dojo.cldr",'number', locale);
  		
		try{
			var options = {};
			var bundle = dojo.i18n.getLocalization("dojo.cldr", "number", locale);
			options.group = bundle.group;
			options.decimal = bundle.decimal;
			options.locale = locale;
			options.localePattern = true;//format code is conform with the locale pattern
			//this 'formula' tag tells the format method do not trim the tail decimal when format numbers with fraction parts.
			//12 with ###0.######% => 12.%
			//if not given, 12 with ##0.#####% will be format to 12%
			options.formula = true;
		}
		catch(e){
			console.log(e);
		}
		return options;
	},
	
	/**
	 * Rules: for each m-string
	 * 1. if exist h/s before or s directly after m-string, then m-string taken as minutes.
	 * 2. other situation taken m-string as Month.
	 */
	/*string*/fromMS2Concord: function(formatCode){
		formatCode = websheet.i18n.Number.replaceKeys(formatCode);
		
		// support "AM/PM" and "A/P" in XLS by replace it with "a"
		formatCode = formatCode.replace(/.?(am\/pm)|.?(a\/p)/ig, function(mt){
			var firstC = mt.charAt(0);
			if(firstC == "\u005C")
				return mt;
			else if(mt.match(/(am\/pm)|(a\/p)/ig))
				return "a";
			else
				return firstC + "a";
		});
		
		var rep = formatCode.replace(/([\\\\].)/ig,"");
		if(rep.toLowerCase().match(/a/g)){
			formatCode = formatCode.replace(/.?H+/g, function(match){
				var firstC = match.charAt(0);
				var s;
				switch(firstC){
					case "\\":
						s = match;
						break;
					case "H":
						s = match.toLowerCase();
						break;
					default:
						s = firstC + match.substring(1).toLowerCase();
				}
				return s;
			});
		}
		else{
			formatCode = formatCode.replace(/.?h+/g, function(match){
				var firstC = match.charAt(0);
				var s;
				switch(firstC){
					case "\\":
						s = match;
						break;
					case "h":
						s = match.toUpperCase();
						break;
					default:
						s = firstC + match.substring(1).toUpperCase();
				}
				return s;
			});
		}	
		
		//1. Upper case all the m
		formatCode = formatCode.replace(/.?m+/g, function(match){
			var firstC = match.charAt(0);
			var s;
			switch(firstC){
				case "M":
				case "m":
					s = match.toUpperCase();
					break;
				default:
					s = firstC + match.substring(1).toUpperCase();;
			}
			return s;
		});
			
		//2. Lower case Ms which should be taken as Minutes: H in front OR S follows OR count(m)<3
		var mIndex = formatCode.indexOf("M", 0);
		if(mIndex == -1) return formatCode;
		var nIndex = 0;
		while(mIndex != -1){
			if(formatCode.charAt(mIndex - 1) == "\u005C"){
				mIndex = formatCode.indexOf("M", mIndex + 1);
				continue;
			}
			
			var mStr = formatCode.substring(mIndex).match(/M+/);
			var len = mStr ? mStr[0].length : 0;
			if(len <= 2 && len > 0){
				var hFlg = this._findPreChar(formatCode, mIndex - 1, nIndex);
				var sFlg = this._findPostChar(formatCode, mIndex + len);
				if(hFlg || sFlg)
					formatCode = formatCode.substring(0, mIndex) + mStr[0].toLowerCase() + formatCode.substring(mIndex + len);
				nIndex = mIndex + len;
			}
			
			mIndex = formatCode.indexOf("M", mIndex + len);
		}
		
		return formatCode;
	},
	
	/*boolean*/_findPreChar: function(fc, si, ni){ //look forward to find the firt "H"
		if(si < 0) return false; // no pre char.
		
		while(ni <= si){
			if(fc[si-1] == "\u005C")
				si = si - 2;
			else if(fc[si].toUpperCase() == "H")
				return true;
			else if(fc[si].toUpperCase() == "M"){
				var tmp = this._countM(fc, si);
				if((si - tmp) > 2)
					si = tmp;
				else 
					return false;
			}
			else
				si--;
		}
		
		return false;
	},
	/*number*/_countM: function(fc, si){
		while(si >= 0 && fc[si] == "M"){
			si --;
		}
		return si;
	},
	
	/*boolean*/_findPostChar: function(fc, ni){ //look forward to find the firt valid charactor
		var temp = ni;
		while(ni < fc.length){
			if(fc[ni] == "\u005C") ni = ni + 2;
			else if(fc[ni].toUpperCase() == "S")
				break; 
			else if(fc[ni].toUpperCase() == "M"){
				var tmp = fc.match(/M+/);
				var len = tmp ? tmp[0].length : 0;
				if(tmp > 2) 
					ni = ni + tmp;
				else 
					return false;
			}
			else 
				ni++;
		}
		
		if(ni < fc.length){
			var tmp = fc.substring(temp, ni).match(/[ydmh]/ig);
			if(tmp == null)
			 	return true;
		}
		
		return false;
	},
	
	/*value, formatCode*/_pickOneFormatCode: function(value, patternList){
		var len = patternList.length;
		var formatCode = patternList[0]; 
		var pack = { value: value, formatCode: formatCode };
		if(typeof(value) == "number"){
			if(value < 0){
				pack.value = Math.abs(value);
				if(len >= 2){
					pack.formatCode = patternList[1];
					if(this.isTextFormat(pack.formatCode))
						pack.formatCode = "-" + patternList[0];
				}
				else{
					if(this.isTextFormat(patternList[0])){
						pack.value = value;
						pack.formatCode = patternList[0];
					}else
						pack.formatCode = "-" + patternList[0];
				}
				if(this.isDateOrTimeFormat(pack.formatCode) || this.isBooleamFormat(pack.formatCode))
					throw websheet.Constant.ERRORCODE["519"];
			}
			else if(value == 0 && len >= 3)
				pack.formatCode = patternList[2];
		}
		else if(typeof(value) == "string" || typeof(value) == "boolean"){
			pack.formatCode = patternList[len - 1];
		}
		
		// Take out "*" and the next char follow it.
		pack.formatCode = pack.formatCode.replace(/(\*)./ig,"");
		return pack;
	},
	
	/*boolean*/_preCheckFCs: function(patternList, decimalSign){
		var lenP = patternList.length;
		if(lenP > 4)
			throw websheet.Constant.ERRORCODE["519"];
			
		for(var i = 0; i < lenP; i++){
			var cur = patternList[i];
			if(cur == "")
				continue;
			if(cur.lastIndexOf("*") == (cur.length - 1)) //The format code can not end with an asterisk (*). 
				return false;
			if(cur.lastIndexOf("\u005C") == (cur.length - 1)) //The format code can not end with "\". 
				return false;

			var numPercF = this.isNumberFormat(cur, decimalSign) || this.isPercFormat(cur); 
			var boolF = this.isBooleamFormat(cur);
			var dateTimeF = this.isDateOrTimeFormat(cur);
			var textF = this.isTextFormat(cur);
			if(i == 0 && lenP >= 2 && textF)
				return false;
			if(i == 1 && lenP >= 3 && textF)
				return false;
			if(i == 2 && lenP == 4 && textF)
				return false;
			if(i == 3 && !textF)
				return false;
			
			if((numPercF ||dateTimeF || boolF) && textF)
				return false;
			
			if((numPercF ||dateTimeF || textF) && boolF)
				return false;
			
			if((dateTimeF || boolF || textF) && numPercF)
				return false;
		}
		
		return true;
	},
	
	/*boolean*/isNumberFormat: function(formatCode, decimalSign){
		var replaced = formatCode.replace(/([\\\\].)/ig,"");
		return replaced.replace(decimalSign,"#").match(/[#0?]/) != null ? true : false;
	},
	
	/*boolean*/isDateOrTimeFormat: function(formatCode){
		if(dojo.trim(formatCode.toUpperCase()).indexOf("BOOLEAN") >= 0)
			return false;
		
		var replaced = formatCode.replace(/([\\\\].)/ig,"");
		var flg = replaced.toUpperCase().match(/[YMDHSE]|[AN]{3,4}/) != null ? true : false;
		if(!flg) {
			var tmp = replaced.match(/.?(am\/pm)|.?(a\/p)/ig);
			if(!tmp) return false;
			var i = 0;
			var len = tmp.length;
			while(i < len){
				var firstC = tmp[i].charAt(0);
				if(firstC == "\u005C")
					continue;
				else
					return true;
			}
			return false;
		}
		
		return true;
	},
	
	/*number*/isPercFormat: function(formatCode){
		var countP = 0;
		for(var i = 0; i <= formatCode.length - 1; i++){
			if(formatCode.charAt(i) == "\u005C")
				i++;
			else if(formatCode.charAt(i) == "%")
				countP++;
			if(countP == 2)
				break;
		}	
		
		return countP == 1;
	},
	
	/*boolean*/isBooleamFormat: function(formatCode){
		if(dojo.trim(formatCode.toUpperCase()).indexOf("BOOLEAN") >= 0 )
			return true;
		
		return false;
	},
	
	/*boolean*/isTextFormat: function(formatCode){
		var replaced = formatCode.replace(/([\\\\].)/ig,"");
		return replaced.match(/@/) != null ? true : false;
	}
});