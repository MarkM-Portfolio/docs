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

dojo.provide("websheet.parse.token");
dojo.require("websheet.parse.tokenBase");
dojo.declare("websheet.parse.token", websheet.parse.tokenBase, {
	
	
	_serializeConstArray: function(bLocaleSensitive){
		var sep = ",";
		if(bLocaleSensitive)
			sep = websheet.parse.FormulaParseHelper.getArraySepByLocale();
		var value = this._calculateValue;
		//2D
		var str = "{";
		if (dojo.isArray(value[0])){
			var len = value.length;
			for (var index = 0; index < len; index++) {
				str += this._serializeConstRow(value[index], sep, bLocaleSensitive);
				// the last token shouldn't add separator
				if (index != len - 1){
					str += ";";
				}
			}
		} else {
			str += this._serializeConstRow(value, sep, bLocaleSensitive);
		}
		str += "}";
		return str;
	},
	
	// serialize one row of const array, the sep may be "."/","
	_serializeConstRow: function(row, sep, bLocaleSensitive) {
		var result = "";
		var len = row.length;
		
		for (var i = 0; i < len; i++) {
			var token = row[i];
			if (token.errorCode) {
				// error object, just need its message
				result += websheet.model.ModelHelper.getErrorMessage(token.errorCode, bLocaleSensitive);
			} else if (typeof token == "boolean") {
				if(bLocaleSensitive)
					result += websheet.i18n.numberRecognizer.transBoolEn2Locale(token);
				else {
					result += token ? "TRUE" : "FALSE";
				}
			} else if (typeof token == "string") {
				var str = token.replace(/\"/g,"\"\"");	// change "" if the string contains "
				str = ["\"", str, "\""].join(""); 
				result += str;
			} else if (sep == ".") {
				// German local
				if (typeof token == "number" && bLocaleSensitive) {
				// the number 1.2 should be converted to 1,2
					var formatType = websheet.Constant.FormatType["NUMBER"];
					var format = websheet.i18n.Number.getDefaultFormatForEditValue(formatType);
					result += websheet.i18n.Number.format(token, format);
				} else {
					result += token;
				}
			} else {
				// non-German local, number/boolean/name
				result += token;
			}
			if (i != len - 1)
				result += sep;
		}
		return result;
	},
	
	serialize:function(cell, bLocaleSensitive)
	{
		var isError = false;
		var type = this.getTokenType();
		var name = this.getName();
		var sz = name.length;
		switch(type)
		{
		case this.tokenType.NUMBER_TOKEN:
			if(bLocaleSensitive)
			{
				var isSci = websheet.Helper.isSciNum4EditValue(this._calculateValue);
				var formatType = isSci ?  websheet.Constant.FormatType["SCIENTIFIC"] : websheet.Constant.FormatType["NUMBER"];
				var fValue = this._calculateValue;
				var format = websheet.i18n.Number.getDefaultFormatForEditValue(formatType);
				name = websheet.i18n.Number.format(fValue, format);
			}else
			{
				name = this._calculateValue;
				this.setName(name);
			}
			break;
		case this.tokenType.PERCENT_TOKEN:
			if(bLocaleSensitive)
			{
				var formatType = websheet.Constant.FormatType["PERCENT"];
				var fValue = this._calculateValue;
				var format = websheet.i18n.Number.getDefaultFormatForEditValue(formatType);
				name = websheet.i18n.Number.format(fValue, format);
			}else
			{
				name = this._calculateValue;
				this.setName(name);
			}
			break;
//		case this.tokenType.DOUBLEQUOT_STRING:
//			name = "\"" + name + "\"";
//			break;
//		case this.tokenType.SINGLEQUOT_STRING:
//			name = "\'" + name + "\'";
//			break;
		case this.tokenType.BOOLEAN_TOKEN:
			if(bLocaleSensitive)
				name = websheet.i18n.numberRecognizer.transBoolEn2Locale(name);		
			else{
				var value = this.getValue();
				if(value)
					name = "TRUE";
				else
					name = "FALSE";
				this.setName(name);
			}
			break;
		case this.tokenType.ARRAYFORMULA_TOKEN:
			if (bLocaleSensitive && name.length > 3 && name[0] == "{") {
				// {1,2;3,4} or {1.2;3.4}
				name = this._serializeConstArray(bLocaleSensitive);
			}
//			else if(bMSFormat){
//				if(!this.msName)
//					this.msName = this._serializeConstArray(bLocaleSensitive);
//				name = this.msName;
//			} else{
//				if(!this.odsName)
//					this.odsName = this._serializeConstArray(bLocaleSensitive);
//				name = this.odsName;
//			}
			break;
		case this.tokenType.ERROR_TOKEN:
			name = websheet.model.ModelHelper.getErrorMessage(this._calculateValue.errorCode, bLocaleSensitive);
			break;
		}
		
		
		return {"rawValue" : name , "isError":isError};
	}
	
});