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

dojo.provide("websheet.functions.Util");
websheet.functions.Util = {
	//if the referenced range/cell has error, 
	//the function should set IGNORE_ERR property if they want ignore it
	//if the formula referenced cell/range have the circulative reference
	//and the function should set IGNORE_RECURSIVE property if they want ignore it
	Name :
	{
		"isnumber": websheet.Constant.CellErrProp.IGNORE_ERR | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"sumproduct": websheet.Constant.CellErrProp.GET_ARRAY | websheet.Constant.CellErrProp.NOTIFY_ALWAYS,
		"rand": websheet.Constant.CellErrProp.CALC_ALWAYS,
		"randbetween": websheet.Constant.CellErrProp.CALC_ALWAYS,
		"isblank": websheet.Constant.CellErrProp.IGNORE_ERR | websheet.Constant.CellErrProp.IGNORE_RECURSIVE  | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"countBlank": websheet.Constant.CellErrProp.IGNORE_ERR | websheet.Constant.CellErrProp.NOTIFY_ALWAYS,
		"vlookup": websheet.Constant.CellErrProp.IGNORE_ERR | websheet.Constant.CellErrProp.NOTIFY_ALWAYS,
		"hlookup": websheet.Constant.CellErrProp.IGNORE_ERR | websheet.Constant.CellErrProp.NOTIFY_ALWAYS,
		"lookup": websheet.Constant.CellErrProp.IGNORE_ERR | websheet.Constant.CellErrProp.NOTIFY_ALWAYS,
		"sumif": websheet.Constant.CellErrProp.IGNORE_ERR | websheet.Constant.CellErrProp.IGNORE_RECURSIVE,
		"sumifs": websheet.Constant.CellErrProp.IGNORE_ERR | websheet.Constant.CellErrProp.IGNORE_RECURSIVE,
		"counta" : websheet.Constant.CellErrProp.IGNORE_ERR | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"countif": websheet.Constant.CellErrProp.IGNORE_ERR,
		"countifs": websheet.Constant.CellErrProp.IGNORE_ERR,
		"averageif": websheet.Constant.CellErrProp.IGNORE_ERR | websheet.Constant.CellErrProp.IGNORE_RECURSIVE,
		"averageifs": websheet.Constant.CellErrProp.IGNORE_ERR | websheet.Constant.CellErrProp.IGNORE_RECURSIVE,
		"iserror": websheet.Constant.CellErrProp.IGNORE_ERR  | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"type": websheet.Constant.CellErrProp.IGNORE_ERR  | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"istext": websheet.Constant.CellErrProp.IGNORE_ERR  | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"isnontext": websheet.Constant.CellErrProp.IGNORE_ERR  | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"islogical": websheet.Constant.CellErrProp.IGNORE_ERR  | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"iserr": websheet.Constant.CellErrProp.IGNORE_ERR  | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"isna": websheet.Constant.CellErrProp.IGNORE_ERR  | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"frequency": websheet.Constant.CellErrProp.IGNORE_ERR,
		"errortype": websheet.Constant.CellErrProp.IGNORE_ERR  | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"error.type": websheet.Constant.CellErrProp.IGNORE_ERR  | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"row": websheet.Constant.CellErrProp.IGNORE_RECURSIVE | websheet.Constant.CellErrProp.NOTIFY_ALWAYS,
		"column": websheet.Constant.CellErrProp.IGNORE_RECURSIVE | websheet.Constant.CellErrProp.NOTIFY_ALWAYS,
		"formula": websheet.Constant.CellErrProp.IGNORE_RECURSIVE | websheet.Constant.CellErrProp.UPDATE_ALWAYS | websheet.Constant.CellErrProp.CHANGE_PER_LOCALE,
		"isformula": websheet.Constant.CellErrProp.IGNORE_RECURSIVE,
		"if": websheet.Constant.CellErrProp.IGNORE_ERR | websheet.Constant.CellErrProp.RETURN_REF | websheet.Constant.CellErrProp.IGNORE_RECURSIVE | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"count": websheet.Constant.CellErrProp.IGNORE_ERR  | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"columns" : websheet.Constant.CellErrProp.IGNORE_RECURSIVE | websheet.Constant.CellErrProp.NOTIFY_ALWAYS,
		"rows" : websheet.Constant.CellErrProp.IGNORE_RECURSIVE |websheet.Constant.CellErrProp.NOTIFY_ALWAYS,
		"isref" : websheet.Constant.CellErrProp.IGNORE_RECURSIVE | websheet.Constant.CellErrProp.IGNORE_ERR  | websheet.Constant.CellErrProp.IGNORE_ERR_REF,
		"offset": websheet.Constant.CellErrProp.IGNORE_RECURSIVE | websheet.Constant.CellErrProp.RETURN_REF | websheet.Constant.CellErrProp.UPDATE_ALWAYS | websheet.Constant.CellErrProp.NOTIFY_ALWAYS,
		"indirect": websheet.Constant.CellErrProp.RETURN_REF | websheet.Constant.CellErrProp.UPDATE_ALWAYS | websheet.Constant.CellErrProp.NOTIFY_ALWAYS,
		"now": websheet.Constant.CellErrProp.CALC_ALWAYS | websheet.Constant.CellErrProp.UPDATE_ALWAYS | websheet.Constant.CellErrProp.CHANGE_PER_LOCALE,
		"today": websheet.Constant.CellErrProp.CALC_ALWAYS | websheet.Constant.CellErrProp.UPDATE_ALWAYS | websheet.Constant.CellErrProp.CHANGE_PER_LOCALE,
		"choose": websheet.Constant.CellErrProp.IGNORE_ERR | websheet.Constant.CellErrProp.RETURN_REF,
		"index": websheet.Constant.CellErrProp.RETURN_REF,
//		"len": websheet.Constant.CellErrProp.CHANGE_PER_LOCALE,
		"rightb": websheet.Constant.CellErrProp.UPDATE_ALWAYS | websheet.Constant.CellErrProp.CHANGE_PER_LOCALE,
		"lenb": websheet.Constant.CellErrProp.UPDATE_ALWAYS | websheet.Constant.CellErrProp.CHANGE_PER_LOCALE,
		'iferror': websheet.Constant.CellErrProp.IGNORE_ERR,
		'ifna': websheet.Constant.CellErrProp.IGNORE_ERR
//		"pi": websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"true": websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"false": websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"sheet": websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"sum": websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"averagea":websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"and":websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"or":websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"max":websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"min":websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"replace":websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"power":websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"trunc":websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"concatenate":websheet.Constant.CellErrProp.IGNORE_NONEPARAM,
//		"average":websheet.Constant.CellErrProp.IGNORE_NONEPARAM
	},
	
	getErrPropByName:function(functName)
	{
		functName = functName.toLowerCase();
		var prop = websheet.functions.Util.Name[functName];
		if(!prop)
			prop = websheet.Constant.CellErrProp.DEFAULT;
		return prop;
	},
	
	/*
	 * The format type is used to format the result (number) of the given function in formula
	 * if the format type is "GENERAL", the result will be formated with the format type of the
	 * first parameter in formula string
	 */
	FormatTypeProp :
	{
		"sum": websheet.Constant.FormatType["GENERAL"],
		"sumif": websheet.Constant.FormatType["GENERAL"],
		"average": websheet.Constant.FormatType["GENERAL"],
		"max": websheet.Constant.FormatType["GENERAL"],
		"min": websheet.Constant.FormatType["GENERAL"],
		"now": websheet.Constant.FormatType["DATETIME"],
		"date": websheet.Constant.FormatType["DATE"],		
		"iserror": websheet.Constant.FormatType["BOOLEAN"],
		"isblank": websheet.Constant.FormatType["BOOLEAN"],
		"isnumber": websheet.Constant.FormatType["BOOLEAN"],
		"iserr": websheet.Constant.FormatType["BOOLEAN"],
		"iseven": websheet.Constant.FormatType["BOOLEAN"],
		"isformula": websheet.Constant.FormatType["BOOLEAN"],
		"islogical": websheet.Constant.FormatType["BOOLEAN"],
		"isna": websheet.Constant.FormatType["BOOLEAN"],
		"isnontext": websheet.Constant.FormatType["BOOLEAN"],
		"isodd": websheet.Constant.FormatType["BOOLEAN"],
		"isref": websheet.Constant.FormatType["BOOLEAN"],
		"istext": websheet.Constant.FormatType["BOOLEAN"],
		"time": websheet.Constant.FormatType["TIME"],
		"today": websheet.Constant.FormatType["DATE"],
		"pmt": websheet.Constant.FormatType["CURRENCY"],
		"ipmt": websheet.Constant.FormatType["CURRENCY"],
		"ppmt": websheet.Constant.FormatType["CURRENCY"],
		"pv": websheet.Constant.FormatType["CURRENCY"],
		"fv": websheet.Constant.FormatType["CURRENCY"],
		"fvschedule": websheet.Constant.FormatType["CURRENCY"],
		"npv": websheet.Constant.FormatType["CURRENCY"],
		"xnpv": websheet.Constant.FormatType["CURRENCY"]
	},
	
	support3DRefList : {
		"SUM" : 1, 
		"AVERAGE" : 1, 
		"AVERAGEA" : 1, 
		"COUNT" : 1,
		"COUNTA" : 1, 
		"MAX" : 1,
		"MIN" : 1,
		"AND" : 1,
		"OR" : 1, 
		"MEDIAN" : 1,
		"SMALL" : 1, 
		"LARGE" : 1, 
		"RANK" : 1,
		"PRODUCT" :1,
		"STDEV" : 1,
		"STDEVP" : 1,
		"VAR" : 1, 
		"VARA" : 1, 
		"VARP" : 1,
		"VARPA" : 1
	},
	
	ArrayValueFormulas:
	{
		//-1 means all arguments get array value
		"columns":[-1],
		"frequency":[-1],
		"mmult":[-1],
		"mode":[-1],
		"rows":[-1],
		"sumproduct":[-1],
	    // 0 means no arguments get array value
		"choose":[0],
		"if":[0],
		"vlookup":[0],
		"hlookup":[0],
		//>0 means the argument in this position get array value(1 base)
		"index":[1],
		"lookup":[2,3]
	},
	
	/**
	 * For formulas with prefix, when save or export to ods, the prefix need to be added to the cell raw value.
	 */
	FormulaPrefixS2LMap: 
	{
		"NORMSDIST":"LEGACY.NORMSDIST",
		"ERRORTYPE":"ORG.OPENOFFICE.ERRORTYPE"
	},
	
	/**
	 * For formulas with prefix, when import from ods, the prefix need to be removed from caculate value.
	 */
	FormulaPrefixL2SMap: 
	{
		"LEGACY.NORMSDIST":"NORMSDIST",
		"ORG.OPENOFFICE.ERRORTYPE":"ERRORTYPE"
	},
	
	getFormulaL2S: function(longFuncName)
	{
		var shortFuncName = websheet.functions.Util.FormulaPrefixL2SMap[longFuncName];
		if(!shortFuncName){
			if(longFuncName && longFuncName.toLowerCase().indexOf("_xlfn.") == 0)
				shortFuncName = longFuncName.substring(6);
		}
		if(!shortFuncName)
			shortFuncName = longFuncName;
		return shortFuncName;
	},
	
	/*
	 * Get corresponding format type for given function name
	 * @param funcName		websheet.Constant.FormatType[""] or
	 * 						null if the given function isn't found 
	 */
	getFormatTypeByName : function(funcName)
	{
		funcName = funcName.toLowerCase();
		return websheet.functions.Util.FormatTypeProp[funcName];
	},
	
	// ARRAY_VALUE means always need array value
	// SCALA_VALUE means always need scala value
	// UNCERTAINTY_VALUE means current function need scala value, but need check its parent
	isArrayValueFormulas: function(funcName, argIndex)
	{
		if(funcName){
			funcName = funcName.toLowerCase();
			var result = websheet.functions.Util.ArrayValueFormulas[funcName];
			if (dojo.isArray(result)) {
				if (result[0] == -1)
					return websheet.Constant.FunctionValueType.ARRAY_VALUE;
				else if (result[0] == 0)
					return websheet.Constant.FunctionValueType.SCALA_VALUE;
				else if (argIndex >=0) {
					for (var i = 0; i < result.length; i++) {
						if (argIndex + 1 == result[i])
							return websheet.Constant.FunctionValueType.ARRAY_VALUE;
						else if(argIndex + 1 < result[i])
							return websheet.Constant.FunctionValueType.SCALA_VALUE;
					}
				}
			}
		}
		return websheet.Constant.FunctionValueType.UNCERTAINTY_VALUE;
	}
};