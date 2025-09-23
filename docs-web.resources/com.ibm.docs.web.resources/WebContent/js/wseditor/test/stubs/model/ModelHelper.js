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

dojo.provide("websheet.test.stubs.model.ModelHelper");
dojo.provide("websheet.model.ModelHelper");
dojo.requireLocalization("websheet","Constant");

websheet.model.ModelHelper = {

	getPartialCalcManager : function() {
		return this._pcm;
	},
	
	getDocumentObj: function(){
		return this.editor.getDocumentObj();
	},
	
	getEditor: function () {
		return this.editor;
	},
	
	getCalcManager: function () {
		return new websheet.CalcManager();
	},
	
	/**
	 * utilize binary search method to find object fit equal condition in array
	 * @param <Array>array			searched object
	 * @param key					compare object
	 * @param equalCondition		equal condition,it is a method address
	 * @param fetchMethodById		fetch object by Id
	 * @param follow				
	 * @param sheetId				sheet Id
	 * return position which fit to equal condition in array 
	 */
	/*integer*/binarySearch:function(array,key,equalCondition,fetchMethodById,followStyle,sheetId, methodType){
		var low = 0;
		var high = array.length - 1;
		if (this.idManager == undefined) {
			var docObj = this.getDocumentObj();
			this.idManager = docObj._getIDManager();
		}
		if(high > key){high = key;}
		while(low <= high){
			var mid = (low + high) >> 1;
			var cmp = equalCondition(array[mid],key,fetchMethodById,followStyle,sheetId, methodType, this.idManager);
			if (cmp < 0)
				low = mid + 1;
		    else if (cmp > 0)
		    	high = mid - 1;
		    else
		    	return mid; // key found
		}
		return -(low + 1);//key not found
	},
	/**
	 * equal condition for binary search
	 * @param model					compare object
	 * @param index					it is a position for search
	 * @param fetchMethodById		how to fetch a object by id
	 * @param followStyle			if it is true,search a object whose style current position(parameter index) followed]
	 * 								otherwise only search a object in current position
	 * @param sheetId				sheet id
	 */
	/*integer*/equalCondition:function(model,index,fetchMethodById,followStyle,sheetId, methodType, idManager){
		var id = 0;
		var repeatednum;
		if(model["getId"]){
			id = model.getId();
			repeatednum = model.getRepeatedNum();
		}else{ // cell model
			id = model._id; //getColumnId
			repeatednum = model._repeatednum;
		}
		if(repeatednum == undefined){repeatednum = 0;}
		
		var pos;
		if(methodType == websheet.Constant.Row){
		    pos = idManager.getRowIndexById(sheetId,id);
		}else if (methodType == websheet.Constant.Column){
		    pos = idManager.getColIndexById(sheetId,id);
		}else{
		    pos = fetchMethodById(sheetId,id); //very slowly because eval
		}
		
		if(pos != -1){pos += 1;}
		if(followStyle){
			if(pos	<= index && index <= pos + repeatednum){
				return 0;
			}else if(pos > index){
				return 1;
			}else{
				return -1;
			}
		}else{
			if(pos > index){
				return 1;
			}else if(pos == index){
				return 0;
			}else{
				return -1;
			}
		}
	},
	
	getCellType: function(raw, calc, bNoParse) {
		// summary: get cell type according to cell raw value and calculated value,
		// 	Cell type is an integer number, lower 3 bits is formula type, left bits are value types.
		// 	if raw is a formula string (begins with '='), then formula type is set to 1 (normal formula)
		// 	if calc is null when raw is formula, value type is set to UNKNOWN
		//	others refer to spreadsheet wiki,
		//	this function only check if it is formula by raw[0] == '='. can pass a '=' when cell is formula and
		// 	need to refresh type by calculated value
		//	param bNoNumberParse, if set to true, will not parse numeric/boolean string to number/boolean, but only returns string in
		//	such cases
		var res = 0;
		if (raw == null) {
			return res;
		} else {
			var v = raw;
			var ws = websheet;
			var constct = ws.Constant.ValueCellType;
			
			if (raw.charAt && raw.charAt(0) == '=' && raw.length > 1) {
				// is formula
				res = 1;
				if (calc == null) {
					// formula without calculated value, set as UNKNOWN
					res |= (constct.UNKNOWN << 3);
					return res;
				} else {
					v = calc;
				}
			}
			
			if (ws.Helper.isValidNumeric(v)) {
				// numeric string,
				if (bNoParse && typeof(v) == "string") {
					// don't parse it, return as string
					res |= (constct.STRING << 3);
				} else {
					res |= (constct.NUMBER << 3);
				}
			} else if (typeof(v) == "boolean") {
				// boolean type
				res |= (constct.BOOLEAN << 3);
			} else {
				// error string, boolean string, plain string or whatever
				// cast v to string
				v = v + "";
				var upV = v.toUpperCase();
				if (!bNoParse && (upV == "TRUE" || upV == "FALSE")) {
					// boolean type, only parse to boolean when bNoParse is not set
					res |= (constct.BOOLEAN << 3);
				} else {
					if (this._errTypes == null) {
						// initialize error type object
						this._initErrTypes();
					}
					switch (upV) {
					case this._enErrTypes["7"]:
					case this._enErrTypes["501"]:
					case this._enErrTypes["502"]:
					case this._enErrTypes["503"]:
					case this._enErrTypes["504"]:
					case this._enErrTypes["508"]:
					case this._enErrTypes["509"]:
					case this._enErrTypes["510"]:
					case this._enErrTypes["511"]:
					case this._enErrTypes["512"]:
					case this._enErrTypes["513"]:
					case this._enErrTypes["514"]:
					case this._enErrTypes["516"]:
					case this._enErrTypes["517"]:
					case this._enErrTypes["518"]:
					case this._enErrTypes["519"]:
					case this._enErrTypes["520"]:
					case this._enErrTypes["521"]:
					case this._enErrTypes["522"]:
					case this._enErrTypes["523"]:
					case this._enErrTypes["524"]:
					case this._enErrTypes["525"]:
					case this._enErrTypes["526"]:
					case this._enErrTypes["527"]:
					case this._enErrTypes["532"]:
					case this._enErrTypes["533"]:
					case this._enErrTypes["1002"]:
						// error types
						res |= (constct.ERROR << 3);
						break;
					default:
						// regular string
						res |= (constct.STRING << 3);
					}
				}
			}
		
			return res;
		}
	},
	
	fixValueByType: function(v, type) {
		var constct = websheet.Constant.ValueCellType;
		switch (type >> 3) {
		case constct.NUMBER:
			if (typeof(v) == "string") {
				return parseFloat(v);
			} else {
				// number or whatever ...
				return v; 
			}
		case constct.STRING:
			return v + "";
		case constct.ERROR:
			return this.toErrCode(v).message;
		case constct.BOOLEAN:
			if (typeof(v) == "string") {
				return v.toUpperCase() == "TRUE" ? 1 : 0;
			} else if (typeof(v) == "boolean") {
				return v == true ? 1 : 0;
			} else if (typeof(v) == "number") {
				return v != 0 ? 1 : 0;
			} else {
				// whatever it is...
				return 0;
			}
		case constct.UNKNOWN:
			return null;
		}
	},
	
	getErrorMessage:function(errorCode, bLocaleSensitive){
		if (this._errTypes == null) {
			this._initErrTypes();
		}
		if(bLocaleSensitive)
			return this._errTypes["" + errorCode];
		else
			return this._enErrTypes["" + errorCode];
	},
	
	_initErrTypes: function() {
		var nls = dojo.i18n.getLocalization("websheet","Constant");
		var consterr = websheet.Constant.ERRORCODE;
		this._errTypes = {
		  "7": nls[consterr["7"].key], //
		  "501": nls[consterr["501"].key], //
		  "502": nls[consterr["502"].key], //
		  "503": nls[consterr["503"].key], //
		  "504": nls[consterr["504"].key], //
		  "508": nls[consterr["508"].key], //
		  "509": nls[consterr["509"].key], //
		  "510": nls[consterr["510"].key], //
		  "511": nls[consterr["511"].key], //
		  "512": nls[consterr["512"].key], //
		  "513": nls[consterr["513"].key], //
		  "514": nls[consterr["514"].key], //
		  "516": nls[consterr["516"].key], //
		  "517": nls[consterr["517"].key], //
		  "518": nls[consterr["518"].key], //
		  "519": nls[consterr["519"].key], //
		  "520": nls[consterr["520"].key], //
		  "521": nls[consterr["521"].key], //
		  "522": nls[consterr["522"].key], //
		  "523": nls[consterr["523"].key], //
		  "524": nls[consterr["524"].key], //
		  "525": nls[consterr["525"].key], //
		  "526": nls[consterr["526"].key], //
		  "527": nls[consterr["527"].key], //
		  "532": nls[consterr["532"].key], //
		  "533": nls[consterr["533"].key], //
		  "1002": nls[consterr["1002"].key] 
		};		
		if(this._enErrTypes == null){
			this._enErrTypes = {
			  "7": consterr["7"].message, //
			  "501": consterr["501"].message, //
			  "502": consterr["502"].message, //
			  "503": consterr["503"].message, //
			  "504": consterr["504"].message, //
			  "508": consterr["508"].message, //
			  "509": consterr["509"].message, //
			  "510": consterr["510"].message, //
			  "511": consterr["511"].message, //
			  "512": consterr["512"].message, //
			  "513": consterr["513"].message, //
			  "514": consterr["514"].message, //
			  "516": consterr["516"].message, //
			  "517": consterr["517"].message, //
			  "518": consterr["518"].message, //
			  "519": consterr["519"].message, //
			  "520": consterr["520"].message, //
			  "521": consterr["521"].message, //
			  "522": consterr["522"].message, //
			  "523": consterr["523"].message, //
			  "524": consterr["524"].message, //
			  "525": consterr["525"].message, //
			  "526": consterr["526"].message, //
			  "527": consterr["527"].message, //
			  "532": consterr["532"].message, //
			  "533": consterr["533"].message, //
			  "1002": consterr["1002"].message 
			}
		}
	},
	
	toErrCode: function(msg, bLocaleSensitive) {
		// summary: turn error message to error code object
		if (this._errTypes == null) {
			this._initErrTypes();
		}
		var consterr = websheet.Constant.ERRORCODE;
		var errTypes = bLocaleSensitive ? this._errTypes: this._enErrTypes;
		switch (msg.toUpperCase()) {
		case errTypes["7"].toUpperCase():
			return consterr["7"];
		case errTypes["501"].toUpperCase():
			return consterr["501"];
		case errTypes["502"].toUpperCase():
			return consterr["502"];
		case errTypes["503"].toUpperCase():
			return consterr["503"];
		case errTypes["504"].toUpperCase():
			return consterr["504"];
		case errTypes["508"].toUpperCase():
			return consterr["508"];
		case errTypes["509"].toUpperCase():
			return consterr["509"];
		case errTypes["510"].toUpperCase():
			return consterr["510"];
		case errTypes["511"].toUpperCase():
			return consterr["511"];
		case errTypes["512"].toUpperCase():
			return consterr["512"];
		case errTypes["513"].toUpperCase():
			return consterr["513"];
		case errTypes["514"].toUpperCase():
			return consterr["514"];
		case errTypes["516"].toUpperCase():
			return consterr["516"];
		case errTypes["517"].toUpperCase():
			return consterr["517"];
		case errTypes["518"].toUpperCase():
			return consterr["518"];
		case errTypes["519"].toUpperCase():
			return consterr["519"];
		case errTypes["520"].toUpperCase():
			return consterr["520"];
		case errTypes["521"].toUpperCase():
			return consterr["521"];
		case errTypes["522"].toUpperCase():
			return consterr["522"];
		case errTypes["523"].toUpperCase():
			return consterr["523"];
		case errTypes["524"].toUpperCase():
			return consterr["524"];
		case errTypes["525"].toUpperCase():
			return consterr["525"];
		case errTypes["526"].toUpperCase():
			return consterr["526"];
		case errTypes["527"].toUpperCase():
			return consterr["527"];
		case errTypes["532"].toUpperCase():
			return consterr["532"];
		case errTypes["533"].toUpperCase():
			return consterr["533"];
		case errTypes["1002"].toUpperCase():
			return consterr["1002"];
		default:
			return null;
		}
	},
	/*void*/splitRow:function(sheet, rowIndex,position){},
	
	/*void*/mergeRow:function(sheet, rowIndex, position, bArrayIndex){}
	
};
