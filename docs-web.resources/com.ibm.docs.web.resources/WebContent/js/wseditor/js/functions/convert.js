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

dojo.provide("websheet.functions.convert");

dojo.declare("websheet.functions.convert", websheet.functions.FormulaBase, {

	constructor: function(){
		this.minNumOfArgs = 3;
		this.maxNumOfArgs = 3;
		this.inherited(arguments);
	},
	
	/*number*/calc: function(){
		var values = this.args;
		var number = this._calcArgument(values[0], true);
		var from_unit = this._calcArgument(values[1]);
		var to_unit = this._calcArgument(values[2]);
		
		var uc = this.getUnitConverter();
		var f_uInfo = this._calcUnitInfo(uc, from_unit);
		var t_uInfo = this._calcUnitInfo(uc, to_unit);
		this._checkConvertUnits(f_uInfo, t_uInfo);
		
		return uc.convert(number, f_uInfo, t_uInfo);
	},
	
	_calcArgument: function(arg, bNumber){
		if(!arg)
			throw this.Constant.ERRORCODE["1002"];
		var cValue = this.fetchScalaResult(arg,true);
		var type = arg.getType();
		if(type == this.tokenType.NAME && arg.getError() || type == this.tokenType.SINGLEQUOT_STRING)
			throw this.Constant.ERRORCODE["525"];
		else if(type == this.tokenType.NONE_TOKEN)
			throw this.Constant.ERRORCODE["7"];
		
		if(bNumber){
			if(type == this.tokenType.DOUBLEQUOT_STRING){
				var parseResult = this.NumberRecognizer.parse(cValue);
				if(parseResult.isNumber){
					cValue = parseResult.fValue;
				}else if(!dojo.trim(cValue)){
					throw this.Constant.ERRORCODE["519"];
				}
			}else if(type == this.tokenType.BOOLEAN_TOKEN)
				throw this.Constant.ERRORCODE["519"];
			else
				cValue = this.getValue(cValue, type, this.LOCALE_NUM);
			cValue = parseFloat(cValue);
			if(isNaN(cValue))
				throw this.Constant.ERRORCODE["519"];
		}
		
		return cValue;
	},
	
	getUnitConverter: function(){
		if(!this.unitConverter){
			this.unitConverter = new websheet.UnitConverter();
		}
		return this.unitConverter;
	},
	
	_calcUnitInfo: function(uConverter, unit){
		// argument check
		if (typeof unit == "boolean")
			throw this.Constant.ERRORCODE["519"];
		else if (typeof unit == "number")
			throw this.Constant.ERRORCODE["7"];
		var unitInfo = uConverter.getUnitInfo(unit);
		if(!unitInfo || !dojo.isArray(unitInfo) || unitInfo.length < 1)
			throw this.Constant.ERRORCODE["7"];
		return unitInfo;
	},
	
	_checkConvertUnits: function(f_uInfo, t_uInfo){
		if(!f_uInfo[1] || f_uInfo[1] != t_uInfo[1])
			throw this.Constant.ERRORCODE["7"];
	}
});

dojo.declare("websheet.UnitConverter", null, {
	Weight:{
		"g": 		1,
		"sg":		14593.84242,
		"lbm":		453.5923097,
		"u":		1.66053E-24,
		"ozm":		28.34951521
	},
	
	Distance:{
		"m":		1,
		"mi":		1609.344,
		"Nmi":		1852,
		"in":		0.0254,
		"ft":		0.3048,
		"yd":		0.9144,
		"ang":		1E-10,
		"Pica":		0.000352778
	},
	
	Time: {
		"sec":		1,
		"mn":		60,
		"hr":		3600,
		"day":		86400,
		"yr":		31557600
	},
	
	Pressure: {
		"p":		1,
		"Pa":		1,
		"atm":		101324.9966,
		"at":		101324.9966,
		"mmHg":		133.3223639
	},
	
	Force: {
		"N":		1,
		"dyn":		0.00001,
		"dy":		0.00001,
		"lbf":		4.448222
	},
	
	Energy: {
		"J":		1,
		"e":		1E-07,
		"c":		4.183991014,
		"cal":		4.186794846,
		"eV":		1.60219E-19,
		"ev":		1.60219E-19,
		"HPh":		2684517.413,
		"hh":		2684517.413,
		"Wh":		3599.998206,
		"wh":		3599.998206,
		"flb":		0.04214,
		"BTU":		1055.058138,
		"btu":		1055.058138
	},
	
	Power: {
		"HP":		1,
		"h":		1,
		"W":		0.00134102,
		"w":		0.00134102
	},
	
	Magnetism: {
		"T":		1,
		"ga":		0.0001
	},
	
	Temperature: {
		"C":		"C",
		"cel":		"C",
		"F":		"F",
		"fah":		"F",
		"K":		"K",
		"kel":		"K"
	},
	
	LiquidMeasure: {
		"tsp":		1,
		"tbs":		3,
		"oz":		6,
		"cup":		48,
		"pt":		96,
		"us_pt":	96,
		"uk_pt":	115.266,
		"qt":		192,
		"gal":		768,
		"l":		202.84,
		"lt":		202.84
	},
	
	MetricMap: {
		"E":	1.00E+18,
		"P":	1.00E+15,
		"T":	1.00E+12,
		"G":	1.00E+09,
		"M":	1.00E+06,
		"k":	1.00E+03,
		"h":	1.00E+02,
		"e":	1.00E+01,
		"d":	1.00E-01,
		"c":	1.00E-02,
		"m":	1.00E-03,
		"u":	1.00E-06,
		"n":	1.00E-09,
		"p":	1.00E-12,
		"f":	1.00E-15,
		"a":	1.00E-18
	},
	
	UnitMap: {
		/*
		 * Key: unit, Value: [type, isMetric]
		 */
		"g": 		["Weight"		,		true],
		"sg":		["Weight"		,		false],
		"lbm":		["Weight"		,		false],
		"u":		["Weight"		,		true],
		"ozm":		["Weight"		,		false],
		"m": 		["Distance"		,		true],
		"mi": 		["Distance"		,		false],
		"Nmi": 		["Distance"		,		false],
		"in": 		["Distance"		,		false],
		"ft": 		["Distance"		,		false],
		"yd": 		["Distance"		,		false],
		"ang": 		["Distance"		,		true],
		"Pica": 	["Distance"		,		false],
		"yr": 		["Time"			,		false],
		"day": 		["Time"			,		false],
		"hr": 		["Time"			,		false],
		"mn": 		["Time"			,		false],
		"sec": 		["Time"			,		true],
		"Pa": 		["Pressure"		,		true],
		"p": 		["Pressure"		,		true],
		"atm": 		["Pressure"		,		true],
		"at": 		["Pressure"		,		true],
		"mmHg": 	["Pressure"		,		true],
		"N": 		["Force"		,		true],
		"dyn": 		["Force"		,		true],
		"dy": 		["Force"		,		true],
		"lbf": 		["Force"		,		false],
		"J": 		["Energy"		,		true],
		"e": 		["Energy"		,		true],
		"c": 		["Energy"		,		true],
		"cal": 		["Energy"		,		true],
		"eV": 		["Energy"		,		true],
		"ev": 		["Energy"		,		true],
		"HPh": 		["Energy"		,		false],
		"hh": 		["Energy"		,		false],
		"Wh": 		["Energy"		,		true],
		"wh": 		["Energy"		,		true],
		"flb": 		["Energy"		,		false],
		"BTU": 		["Energy"		,		false],
		"btu": 		["Energy"		,		false],
		"HP": 		["Power"		,		false],
		"h": 		["Power"		,		false],
		"W": 		["Power"		,		true],
		"w": 		["Power"		,		true],
		"T": 		["Magnetism"	,		true],
		"ga": 		["Magnetism"	,		true],
		"C": 		["Temperature"	,		false],
		"cel": 		["Temperature"	,		false],
		"F": 		["Temperature"	,		false],
		"fah": 		["Temperature"	,		false],
		"K": 		["Temperature"	,		true],
		"kel": 		["Temperature"	,		true],
		"tsp": 		["LiquidMeasure",		false],
		"tbs": 		["LiquidMeasure",		false],
		"oz": 		["LiquidMeasure",		false],
		"cup": 		["LiquidMeasure",		false],
		"pt": 		["LiquidMeasure",		false],
		"us_pt": 	["LiquidMeasure",		false],
		"uk_pt": 	["LiquidMeasure",		false],
		"qt": 		["LiquidMeasure",		false],
		"gal": 		["LiquidMeasure",		false],
		"l": 		["LiquidMeasure",		true],
		"lt": 		["LiquidMeasure",		true]
	},
	
	constructor: function(){
	},
	
	/*
	 * Return Info: [unit, baseType, metricType]
	 */
	getUnitInfo: function(unit){
		var type = [];
		if(unit){
			if(this.UnitMap[unit]){
				type.push(unit);
				type.push(this.UnitMap[unit][0]);
			}
			else{
				var hMetric = unit.charAt(0);
				if(this.MetricMap[hMetric]){
					var sUnit = unit.slice(1, unit.length);
					if(this.UnitMap[sUnit] && this.UnitMap[sUnit][1]){
						type.push(sUnit);
						type.push(this.UnitMap[sUnit][0]);
						type.push(hMetric);
					}
				}
			}
		}
		return type;
	},
	
	/*
	 * from_unitInfo & to_unitInfo: Array, the return value of getUnitInfo
	 */
	convert: function(number, from_unitInfo, to_unitInfo){
		var cValue;
		if(number == null || !dojo.isArray(from_unitInfo) || !dojo.isArray(to_unitInfo))
			return cValue;
		var type = from_unitInfo[1];
		if(type && type == to_unitInfo[1]){
			if(type == "Temperature")
				cValue = this._temperatureConvert(number, from_unitInfo, to_unitInfo);
			else
				cValue = this._normalConvert(number, from_unitInfo, to_unitInfo);
			//else other
		}
		return cValue;
	},
	
	_normalConvert: function(number, from_unitInfo, to_unitInfo){
		var cValue;
		var f_unit = from_unitInfo[0];
		var t_unit = to_unitInfo[0];
		var type = from_unitInfo[1];
		var localMath = websheet.Math;
		
		//cValue = number * this[type][f_unit] / this[type][t_unit];
		cValue = localMath.div(localMath.mul(number, this[type][f_unit]), this[type][t_unit]);
		
		var metric = from_unitInfo[2];
		if(metric && this.MetricMap[metric] && this.UnitMap[f_unit]){
			//cValue = cValue * this.MetricMap[metric];
			cValue = localMath.mul(cValue, this.MetricMap[metric]);
		}
		
		metric = to_unitInfo[2];
		if(metric && this.MetricMap[metric] && this.UnitMap[t_unit]){
			//cValue = cValue / this.MetricMap[metric];
			cValue = localMath.div(cValue, this.MetricMap[metric]);
		}
		
		return cValue;
	},
	
	_temperatureConvert: function(number, from_unitInfo, to_unitInfo){
		var cValue = number;
		var f_unit = from_unitInfo[0];
		var t_unit = to_unitInfo[0];
		var type = "Temperature";
		var localMath = websheet.Math;
		
		var metric = from_unitInfo[2];
		if(metric && this.MetricMap[metric] && this.UnitMap[f_unit]){
			//cValue = cValue * this.MetricMap[metric];
			cValue = localMath.mul(cValue, this.MetricMap[metric]);
		}
		
		switch(f_unit){
			case "F":
			case "fah":{
				//cValue = (cValue - 32) * 5 / 9;
				cValue = localMath.div(localMath.mul(localMath.sub(cValue, 32), 5), 9);
			}
			break;
			case "K":
			case "kel":{
				//cValue = cValue - 273.15;
				cValue = localMath.sub(cValue, 273.15);
			}
			break;
		}
		
		switch(t_unit){
			case "F":
			case "fah":{
				//cValue = cValue * 9 / 5 + 32;
				cValue = localMath.add(localMath.div(localMath.mul(cValue, 9), 5), 32);
			}
			break;
			case "K":
			case "kel":{
				//cValue = cValue + 273.15;
				cValue = localMath.add(cValue, 273.15);
			}
			break;
		}
		
		metric = to_unitInfo[2];
		if(metric && this.MetricMap[metric] && this.UnitMap[t_unit]){
			//cValue = cValue / this.MetricMap[metric];
			cValue = localMath.div(cValue, this.MetricMap[metric]);
		}
		
		return cValue;
	}
});